import { dbConnect } from '@/lib/db';
import Post from '@/models/Post';
import { notFound } from 'next/navigation';
import PublicPostLayout from '@/app/components/posts/PublicPostLayout';

interface Props { params: { slug: string } }

export default async function PostPage({ params }: Props) {
  await dbConnect();
  const slug = params.slug;
  const rawPost = await Post.findOne({ slug, status: 'published' })
    .populate('createdBy', 'name')
    .lean();

  if (!rawPost) return notFound();

  // Serialize for Client Component
  const post = JSON.parse(JSON.stringify(rawPost));

  return <PublicPostLayout post={post} />;
}
