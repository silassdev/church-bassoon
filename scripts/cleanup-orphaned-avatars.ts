// scripts/cleanup-orphaned-avatars.ts
import dbConnect from '../lib/db';
import User from '../models/User';
import path from 'path';
import fs from 'fs/promises';
import fg from 'fast-glob';
import { S3Client, ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import nodemailer from 'nodemailer';

const DRY_RUN = String(process.env.DRY_RUN || 'false') === 'true';
const DAYS = Number(process.env.ORPHANED_AVATAR_OLDER_THAN_DAYS || 30);
const THRESHOLD_MS = DAYS * 24 * 60 * 60 * 1000;

function isS3Configured() {
  return !!(process.env.S3_BUCKET && process.env.AWS_REGION && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
}

function s3KeyFromUrl(url: string | undefined | null) {
  if (!url) return null;
  try {
    const u = new URL(url);
    return u.pathname.startsWith('/') ? u.pathname.slice(1) : u.pathname;
  } catch {
    return null;
  }
}

async function listS3AvatarObjects(): Promise<{ Key: string; LastModified?: Date }[]> {
  const client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
  const bucket = process.env.S3_BUCKET!;
  const out: { Key: string; LastModified?: Date }[] = [];
  let ContinuationToken: string | undefined;

  do {
    const cmd = new ListObjectsV2Command({ Bucket: bucket, Prefix: 'avatars/', ContinuationToken });
    const res = await client.send(cmd);
    if (res.Contents) {
      for (const o of res.Contents) {
        if (o.Key) out.push({ Key: o.Key, LastModified: o.LastModified });
      }
    }
    ContinuationToken = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (ContinuationToken);

  return out;
}

// delete keys in batches and return actually deleted keys
async function deleteS3Keys(keys: string[]): Promise<string[]> {
  if (keys.length === 0) return [];
  const client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  const deleted: string[] = [];
  for (let i = 0; i < keys.length; i += 1000) {
    const batch = keys.slice(i, i + 1000);
    const cmd = new DeleteObjectsCommand({
      Bucket: process.env.S3_BUCKET!,
      Delete: { Objects: batch.map(k => ({ Key: k })) },
    });
    try {
      const res = await client.send(cmd);
      if (res.Deleted) {
        for (const d of res.Deleted) {
          if (d.Key) deleted.push(d.Key);
        }
      }
    } catch (e) {
      console.error('S3 delete batch failed', e);
      // continue; individual keys may remain
    }
  }
  return deleted;
}

async function listLocalAvatarFiles(): Promise<{ file: string; mtime: number }[]> {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
  const pattern = path.join(uploadsDir, '**/*.*').replace(/\\/g, '/');
  const entries = await fg(pattern, { dot: false, onlyFiles: true });
  const out: { file: string; mtime: number }[] = [];
  for (const f of entries) {
    try {
      const st = await fs.stat(f);
      out.push({ file: f, mtime: st.mtimeMs });
    } catch {
      // skip unreadable files
    }
  }
  return out;
}

async function sendReportEmail(subject: string, htmlBody: string, textBody: string) {
  const to = String(process.env.REPORT_EMAIL_TO || '').split(',').map(s => s.trim()).filter(Boolean);
  const from = process.env.REPORT_EMAIL_FROM || `noreply@${process.env.NEXTAUTH_URL?.replace(/^https?:\/\//, '') || 'localhost'}`;
  if (!to.length) {
    console.warn('[cleanup] REPORT_EMAIL_TO not set; skipping email report.');
    return;
  }
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from,
    to,
    subject,
    text: textBody,
    html: htmlBody,
  });
}

function formatListAsHtml(title: string, items: string[]) {
  if (items.length === 0) return `<p><strong>${title}:</strong> none</p>`;
  return `<p><strong>${title} (${items.length}):</strong></p><ul>${items.map(i => `<li style="font-family:monospace">${i}</li>`).join('')}</ul>`;
}

async function main() {
  const start = Date.now();
  const now = Date.now();
  console.log(`[cleanup] starting orphaned-avatar cleanup (${DAYS}d). DRY_RUN=${DRY_RUN}`);

  await dbConnect();
  const users = await User.find({}, 'avatarUrl avatarThumbUrl').lean();

  const referencedS3Keys = new Set<string>();
  const referencedLocalPaths = new Set<string>();

  for (const u of users) {
    if (u.avatarUrl && typeof u.avatarUrl === 'string') {
      if (isS3Configured() && u.avatarUrl.includes(process.env.S3_BUCKET!)) {
        const k = s3KeyFromUrl(u.avatarUrl);
        if (k) referencedS3Keys.add(k);
      } else if (u.avatarUrl.startsWith('/uploads/avatars/')) {
        referencedLocalPaths.add(path.join(process.cwd(), 'public', u.avatarUrl.replace(/^\//, '')));
      }
    }
    if ((u as any).avatarThumbUrl && typeof (u as any).avatarThumbUrl === 'string') {
      const t = (u as any).avatarThumbUrl;
      if (isS3Configured() && t.includes(process.env.S3_BUCKET!)) {
        const k = s3KeyFromUrl(t);
        if (k) referencedS3Keys.add(k);
      } else if (t.startsWith('/uploads/avatars/')) {
        referencedLocalPaths.add(path.join(process.cwd(), 'public', t.replace(/^\//, '')));
      }
    }
  }

  const deletedS3: string[] = [];
  const deletedLocal: string[] = [];
  const wouldDeleteS3: string[] = [];
  const wouldDeleteLocal: string[] = [];

  if (isS3Configured()) {
    console.log('[cleanup] listing S3 objects under avatars/ ...');
    const objs = await listS3AvatarObjects();
    const staleS3: string[] = [];
    for (const o of objs) {
      const key = o.Key;
      if (!referencedS3Keys.has(key)) {
        const last = o.LastModified ? o.LastModified.getTime() : 0;
        if (now - last > THRESHOLD_MS) staleS3.push(key);
      }
    }
    console.log(`[cleanup] S3 objects total: ${objs.length}, orphan candidates older than ${DAYS} days: ${staleS3.length}`);

    if (staleS3.length > 0) {
      if (DRY_RUN) {
        wouldDeleteS3.push(...staleS3);
      } else {
        const actuallyDeleted = await deleteS3Keys(staleS3);
        deletedS3.push(...actuallyDeleted);
      }
    }
  }

  // local files
  try {
    const localFiles = await listLocalAvatarFiles();
    const staleLocal: string[] = [];
    for (const f of localFiles) {
      if (!referencedLocalPaths.has(f.file)) {
        if (now - f.mtime > THRESHOLD_MS) staleLocal.push(f.file);
      }
    }
    console.log(`[cleanup] local files total: ${localFiles.length}, orphan candidates older than ${DAYS} days: ${staleLocal.length}`);

    if (staleLocal.length > 0) {
      if (DRY_RUN) {
        wouldDeleteLocal.push(...staleLocal);
      } else {
        for (const f of staleLocal) {
          try {
            await fs.unlink(f);
            deletedLocal.push(f);
          } catch (e) {
            console.warn('Failed to unlink', f, e);
          }
        }
      }
    }
  } catch (e) {
    console.warn('[cleanup] local uploads folder missing or inaccessible, skipping local cleanup.', e);
  }

  const elapsed = Date.now() - start;
  // Build report
  const subject = DRY_RUN
    ? `[CLEANUP-DRYRUN] Avatar orphan cleanup report (${new Date().toISOString().split('T')[0]})`
    : `[CLEANUP] Avatar orphan cleanup report (${new Date().toISOString().split('T')[0]})`;

  let html = `<h2>Avatar Orphan Cleanup Report</h2>`;
  html += `<p>Started: ${new Date(start).toISOString()}</p>`;
  html += `<p>Elapsed: ${Math.round(elapsed/1000)}s</p>`;
  html += formatListAsHtml('Deleted S3 keys', deletedS3);
  html += formatListAsHtml('Deleted local files', deletedLocal);
  if (DRY_RUN) {
    html += formatListAsHtml('Would delete S3 keys (DRY_RUN)', wouldDeleteS3);
    html += formatListAsHtml('Would delete local files (DRY_RUN)', wouldDeleteLocal);
  }

  // simple plaintext fallback
  const textLines: string[] = [];
  textLines.push('Avatar Orphan Cleanup Report');
  textLines.push(`Started: ${new Date(start).toISOString()}`);
  textLines.push(`Elapsed: ${Math.round(elapsed/1000)}s`);
  textLines.push('');
  textLines.push(`Deleted S3 keys (${deletedS3.length}):`);
  for (const k of deletedS3) textLines.push(` - ${k}`);
  textLines.push('');
  textLines.push(`Deleted local files (${deletedLocal.length}):`);
  for (const f of deletedLocal) textLines.push(` - ${f}`);
  if (DRY_RUN) {
    textLines.push('');
    textLines.push(`DRY_RUN would delete S3 keys (${wouldDeleteS3.length}):`);
    for (const k of wouldDeleteS3) textLines.push(` - ${k}`);
    textLines.push('');
    textLines.push(`DRY_RUN would delete local files (${wouldDeleteLocal.length}):`);
    for (const f of wouldDeleteLocal) textLines.push(` - ${f}`);
  }

  try {
    await sendReportEmail(subject, html, textLines.join('\n'));
    console.log('[cleanup] report email sent');
  } catch (e) {
    console.error('[cleanup] failed to send report email', e);
  }

  console.log('[cleanup] finished.');
  process.exit(0);
}

main().catch(err => {
  console.error('[cleanup] error', err);
  process.exit(2);
});
