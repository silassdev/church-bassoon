import React from 'react';
import { dbConnect } from '@/lib/db';
import Post from '@/models/Post';
import jwt from 'jsonwebtoken';
import { notFound } from 'next/navigation';
import PostView from '@/app/components/posts/PostView';

interface Props { params: { token: string } }

const PREVIEW_SECRET = process.env.PREVIEW_TOKEN_SECRET || process.env.NEXTAUTH_SECRET;

export default async function PreviewPage({ params }: Props) {
  const token = params.token;
  if (!token) return notFound();

  let payload: any = null;
  try {
    payload = jwt.verify(token, PREVIEW_SECRET as string) as any;
  } catch (err) {
    return notFound();
  }

  if (!payload?.postId) return notFound();

  await dbConnect();
  const post = await Post.findById(payload.postId).lean();
  if (!post) return notFound();

  // Allow preview of drafts and published posts
  // Render server-side to avoid leaking other drafts
  return (
    <main className="max-w-3xl mx-auto p-6">
      <article>
        <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
        {post.featureImage && <img src={post.featureImage} alt={post.title} className="w-full h-auto rounded mb-4" />}
        <div className="text-sm text-slate-500 mb-4">
          {post.status === 'published' ? `Published: ${post.publishedAt ? new Date(post.publishedAt).toLocaleString() : new Date(post.createdAt).toLocaleString()}` : 'Draft preview'}
        </div>
        <PostView body={post.body} />
      </article>
    </main>
  );
}
