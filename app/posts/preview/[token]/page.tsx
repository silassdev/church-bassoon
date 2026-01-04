import React from 'react';
import { dbConnect } from '@/lib/db';
import Post, { IPost } from '@/models/Post';
import jwt from 'jsonwebtoken';
import { notFound } from 'next/navigation';
import PublicPostLayout from '@/app/components/posts/PublicPostLayout';

interface Props { params: Promise<{ token: string }> }

const PREVIEW_SECRET = process.env.PREVIEW_TOKEN_SECRET || process.env.NEXTAUTH_SECRET;

export default async function PreviewPage({ params }: Props) {
    const { token } = await params;
    if (!token) return notFound();

    let payload: any = null;
    try {
        payload = jwt.verify(token, PREVIEW_SECRET as string) as any;
    } catch (err) {
        return notFound();
    }

    if (!payload?.postId) return notFound();

    await dbConnect();
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const rawPost = (await Post.findById(payload.postId).populate('createdBy', 'name').lean()) as unknown as IPost | null;
    if (!rawPost) return notFound();

    // Serialize for Client Component
    const post = JSON.parse(JSON.stringify(rawPost));

    // Allow preview of drafts and published posts
    // Render server-side to avoid leaking other drafts
    return <PublicPostLayout post={post} previewMode={true} />;
}
