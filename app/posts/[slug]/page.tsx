import { dbConnect } from '@/lib/db';
import Post from '@/models/Post';
import { notFound } from 'next/navigation';
import PostView from '@/app/components/posts/PostView';

interface Props { params: { slug: string } }

export default async function PostPage({ params }: Props) {
  await dbConnect();
  const slug = params.slug;
  const post = await Post.findOne({ slug, status: 'published' }).lean();
  if (!post) return notFound();

  // pass post data to client renderer
  return (
    <main className="max-w-3xl mx-auto p-6">
      <article>
        <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
        {post.featureImage && <img src={post.featureImage} alt={post.title} className="w-full h-auto rounded mb-4" />}
        <div className="text-sm text-slate-500 mb-4">Published: {post.publishedAt ? new Date(post.publishedAt).toLocaleString() : new Date(post.createdAt).toLocaleString()}</div>

        {/* client renders markdown safely */}
        <PostView body={post.body} />
      </article>
    </main>
  );
}
