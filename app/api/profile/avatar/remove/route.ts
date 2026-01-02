// app/api/profile/avatar/remove/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import path from 'path';
import fs from 'fs/promises';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { randomDefault, thumbFor } from '@/lib/avatarDefaults';

function isS3Url(url: string) {
  if (!url) return false;
  const bucket = process.env.S3_BUCKET;
  if (!bucket) return false;
  // simple check: url contains `${bucket}.s3`
  return url.includes(`${bucket}.s3`);
}

function s3KeyFromUrl(url: string) {
  try {
    const u = new URL(url);
    // pathname begins with '/', key should not include leading slash
    return u.pathname.startsWith('/') ? u.pathname.slice(1) : u.pathname;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const userId = (session as any).user.id;
  const user = await User.findById(userId);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const prevFull = user.avatarUrl;
  const prevThumb = (user as any).avatarThumbUrl || null;

  // Attempt to delete previous custom avatars
  try {
    // If prevFull is an S3 URL and bucket set -> delete both keys
    if (prevFull && isS3Url(prevFull) && process.env.S3_BUCKET && process.env.AWS_REGION && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      const client = new S3Client({
        region: process.env.AWS_REGION,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        },
      });
      const keysToDelete: string[] = [];
      const k1 = s3KeyFromUrl(prevFull);
      if (k1) keysToDelete.push(k1);
      if (prevThumb) {
        const k2 = s3KeyFromUrl(prevThumb);
        if (k2) keysToDelete.push(k2);
      }
      for (const key of keysToDelete) {
        try {
          await client.send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key }));
        } catch (e) {
          // non-fatal; log and continue
          console.warn('Failed to delete S3 key', key, e);
        }
      }
    } else if (prevFull && prevFull.startsWith('/')) {
      // Local file under public. Map URL to filesystem and unlink both full and thumb if exist and not a default
      const publicPath = path.join(process.cwd(), 'public');
      const tryPaths = [prevFull];
      if (prevThumb) tryPaths.push(prevThumb);
      for (const p of tryPaths) {
        // only delete if path is inside /uploads/avatars (avoid deleting default images)
        if (p.startsWith('/uploads/avatars/')) {
          const fp = path.join(publicPath, p.replace(/^\//, ''));
          try {
            await fs.unlink(fp).catch(() => null);
          } catch (e) {
            console.warn('Failed to unlink local avatar', fp, e);
          }
        }
      }
    }
  } catch (e) {
    console.error('Error deleting previous avatars', e);
    // continue even if deletion fails
  }

  // pick a random default avatar and apply
  const def = randomDefault();

  user.avatarUrl = def.full;
  (user as any).avatarThumbUrl = def.thumb;

  // recompute profile completeness: keep same rule (avatar presence counts)
  const required = [user.name, user.houseAddress, user.dob, user.state, user.city, user.avatarUrl];
  user.profileComplete = required.every(v => v !== undefined && v !== null && String(v).trim() !== '');

  // Clear any stored previous uploaded avatar file references? We already replaced fields.
  await user.save();

  return NextResponse.json({
    ok: true,
    avatarUrl: user.avatarUrl,
    avatarThumbUrl: (user as any).avatarThumbUrl,
    profileComplete: user.profileComplete,
  });
}
