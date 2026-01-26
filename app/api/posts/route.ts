import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Post from '@/models/Post';
import { requireStaff } from '@/lib/requireStaff';

export async function GET(req: Request) {
  await dbConnect();
  const url = new URL(req.url);
  const status = url.searchParams.get('status'); // draft | published | null
  const page = Math.max(1, Number(url.searchParams.get('page') || 1));
  const limit = Math.max(1, Math.min(100, Number(url.searchParams.get('limit') || 20)));
  const skip = (page - 1) * limit;

  const filter: any = {};
  if (status) filter.status = status;

  const total = await Post.countDocuments(filter);
  const posts = await Post.find(filter)
    .populate('createdBy', 'name')
    .populate('editedBy', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return NextResponse.json({
    posts,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  });
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