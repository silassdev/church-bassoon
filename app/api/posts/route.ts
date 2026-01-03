import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Post from '@/models/Post';
import { requireStaff } from '@/lib/requireStaff';

export async function GET(req: Request) {
  await dbConnect();
  const url = new URL(req.url);
  const status = url.searchParams.get('status'); // draft | published | null

  const filter: any = {};
  if (status) filter.status = status;

  const posts = await Post.find(filter)
    .populate('createdBy', 'name')
    .populate('editedBy', 'name')
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  return NextResponse.json(posts);
}

export async function POST(req: Request) {
  const session = await requireStaff();
  await dbConnect();

  const body = await req.json();
  const post = await Post.create({
    ...body,
    createdBy: (session as any).user.id,
  });

  return NextResponse.json(post);
}