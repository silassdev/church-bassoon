import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { dbConnect } from '@/lib/db';
import Post from '@/models/Post';
import jwt from 'jsonwebtoken';

const PREVIEW_SECRET = process.env.PREVIEW_TOKEN_SECRET || process.env.NEXTAUTH_SECRET;
const TTL = Number(process.env.PREVIEW_TOKEN_TTL_SECONDS || 900); // seconds

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const role = (session as any).user.role;
  if (!['admin', 'coordinator'].includes(role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const postId = params.id;
  await dbConnect();
  const post = await Post.findById(postId).lean();
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Issue token with postId and minimal info
  const payload = { postId, issuedBy: (session as any).user.id };
  const token = jwt.sign(payload, PREVIEW_SECRET as string, { expiresIn: TTL });

  // provide the preview path in response
  const previewPath = `/posts/preview/${encodeURIComponent(token)}`;
  return NextResponse.json({ ok: true, token, previewPath, expiresIn: TTL });
}
