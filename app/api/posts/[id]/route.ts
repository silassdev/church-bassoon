import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Post from '@/models/Post';
import { requireStaff } from '@/lib/requireStaff';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireStaff();
  await dbConnect();

  const body = await req.json();
  const update: any = {
    ...body,
    editedBy: (session as any).user.id,
  };

  if (body.status === 'published') {
    update.publishedAt = new Date();
  }

  const post = await Post.findByIdAndUpdate(id, update, { new: true });
  return NextResponse.json(post);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireStaff();
  await dbConnect();

  await Post.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
