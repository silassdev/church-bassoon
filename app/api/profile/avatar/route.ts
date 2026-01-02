import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { dbConnect } from '@/lib/db';
import User from '@/models/User';
import fs from 'fs/promises';
import path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';

const MAX_BYTES = Number(process.env.MAX_AVATAR_BYTES || 2_097_152);
const FULL_SIZE = 512; // px
const THUMB_SIZE = 128; // px

function parseDataUrl(dataUrl: string) {
  const m = dataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
  if (!m) return null;
  const mime = m[1];
  const b64 = m[2];
  return { mime, b64 };
}

async function uploadToS3(buffer: Buffer, key: string, contentType: string) {
  const bucket = process.env.S3_BUCKET!;
  const client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
  await client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ACL: 'public-read',
  }));
  return `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${encodeURIComponent(key)}`;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { filename, data } = body || {};
  if (!data || typeof data !== 'string') return NextResponse.json({ error: 'Missing data' }, { status: 400 });

  const parsed = parseDataUrl(data);
  if (!parsed) return NextResponse.json({ error: 'Invalid image data' }, { status: 400 });

  const rawBuffer = Buffer.from(parsed.b64, 'base64');
  if (rawBuffer.length > MAX_BYTES) return NextResponse.json({ error: 'File too large' }, { status: 413 });

  await dbConnect();

  const userId = (session as any).user.id;
  const timestamp = Date.now();
  const baseName = `${userId}_${timestamp}`;
  const fullKey = `avatars/${baseName}.jpg`;
  const thumbKey = `avatars/${baseName}_thumb.jpg`;

  try {
    // Use sharp to normalize and resize. Convert to JPEG to standardize.
    const fullBuffer = await sharp(rawBuffer)
      .rotate() // use EXIF orientation
      .resize(FULL_SIZE, FULL_SIZE, { fit: 'cover', position: 'centre' })
      .jpeg({ quality: 82 })
      .toBuffer();

    const thumbBuffer = await sharp(rawBuffer)
      .rotate()
      .resize(THUMB_SIZE, THUMB_SIZE, { fit: 'cover', position: 'centre' })
      .jpeg({ quality: 80 })
      .toBuffer();

    let fullUrl: string | null = null;
    let thumbUrl: string | null = null;

    if (process.env.S3_BUCKET && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_REGION) {
      // upload both
      fullUrl = await uploadToS3(fullBuffer, fullKey, 'image/jpeg');
      thumbUrl = await uploadToS3(thumbBuffer, thumbKey, 'image/jpeg');
    } else if (process.env.LOCAL_AVATAR_UPLOAD === 'true') {
      const publicDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
      await fs.mkdir(publicDir, { recursive: true });
      const fullPath = path.join(publicDir, `${baseName}.jpg`);
      const thumbPath = path.join(publicDir, `${baseName}_thumb.jpg`);
      await fs.writeFile(fullPath, fullBuffer);
      await fs.writeFile(thumbPath, thumbBuffer);
      fullUrl = `/uploads/avatars/${baseName}.jpg`;
      thumbUrl = `/uploads/avatars/${baseName}_thumb.jpg`;
    } else {
      return NextResponse.json({ error: 'No upload storage configured (set S3_BUCKET or LOCAL_AVATAR_UPLOAD=true)' }, { status: 500 });
    }

    // update user avatarUrl and avatarThumbUrl and recompute profile completeness
    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    user.avatarUrl = fullUrl;
    user.avatarThumbUrl = thumbUrl;

    const required = [user.name, user.houseAddress, user.dob, user.state, user.city, user.avatarUrl];
    user.profileComplete = required.every(v => v !== undefined && v !== null && String(v).trim() !== '');

    await user.save();

    return NextResponse.json({ ok: true, url: fullUrl, thumbnailUrl: thumbUrl, profileComplete: user.profileComplete });
  } catch (err) {
    console.error('avatar upload error', err);
    return NextResponse.json({ error: 'Upload error' }, { status: 500 });
  }
}
