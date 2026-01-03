import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Post from '@/models/Post';
import slugify from '@/lib/slugify';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

async function requireStaffSession() {
  const session = await getServerSession(authOptions);
  if (!session) return null;
  const role = (session as any).user?.role;
  if (!['admin', 'coordinator'].includes(role)) return null;
  return session;
}

async function uniqueSlug(base: string) {
  let s = base;
  let i = 0;
  while (true) {
    const exists = await Post.findOne({ slug: s }).lean();
    if (!exists) return s;
    i += 1;
    s = `${base}-${i}`;
  }
}

export async function POST(req: Request) {
  const session = await requireStaffSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const id = body.id || null;
  const title = (body.title || '').trim();
  const content = body.body || '';
  const tags = Array.isArray(body.tags) ? body.tags : (String(body.tags || '').split(',').map((t: string) => t.trim()).filter(Boolean));
  const featureImage = body.featureImage || '';
  const status = body.status === 'published' ? 'published' : 'draft';

  if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 });

  await dbConnect();

  if (id) {
    // update existing
    const post = await Post.findById(id);
    if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // only allow staff - additional ownership restrictions not applied for staff
    post.title = title;
    post.body = content;
    post.tags = tags;
    post.featureImage = featureImage;
    post.status = status;
    post.editedBy = (session as any).user.id;
    if (status === 'published' && !post.publishedAt) post.publishedAt = new Date();
    await post.save();
    return NextResponse.json({ ok: true, post: { _id: post._id, slug: post.slug, status: post.status, updatedAt: post.updatedAt } });
  }

  // create new draft with unique slug
  let baseSlug = slugify(title) || `post-${Date.now()}`;
  baseSlug = await uniqueSlug(baseSlug);
  const newPost = await Post.create({
    title,
    slug: baseSlug,
    body: content,
    tags,
    featureImage,
    status,
    createdBy: (session as any).user.id,
    editedBy: (session as any).user.id,
    publishedAt: status === 'published' ? new Date() : undefined,
  });

  return NextResponse.json({ ok: true, post: { _id: newPost._id, slug: newPost.slug, status: newPost.status } });
}
