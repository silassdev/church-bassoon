import { dbConnect } from '@/lib/db';
import Post from '@/models/Post';
import Link from 'next/link';
import { Calendar, User } from 'lucide-react';

export const metadata = {
    title: 'Blogs - Our Latest Stories',
    description: 'Read the latest updates, stories, and announcements.',
};

export default async function BlogsPage() {
    await dbConnect();
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const rawPosts = await Post.find({ status: 'published' })
        .sort({ publishedAt: -1 })
        .populate('createdBy', 'name')
        .lean();

    const posts = JSON.parse(JSON.stringify(rawPosts));

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Header */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-20">
                <div className="container mx-auto px-6 text-center">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
                        Our Latest Stories
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Insights, updates, and inspiration from our team.
                    </p>
                </div>
            </div>

            {/* Grid */}
            <div className="container mx-auto px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {posts.map((post: any) => (
                        <Link
                            href={`/posts/${post.slug}`}
                            key={post._id}
                            className="group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
                        >
                            {/* Image */}
                            <div className="h-56 overflow-hidden relative bg-slate-100 dark:bg-slate-800">
                                {post.featureImage ? (
                                    <img
                                        src={post.featureImage}
                                        alt={post.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                        <div className="text-center">
                                            <span className="text-4xl block mb-2">📝</span>
                                        </div>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>

                            {/* Content */}
                            <div className="p-8 flex flex-col flex-1">
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    {post.tags?.slice(0, 3).map((tag: string) => (
                                        <span key={tag} className="px-2 py-1 rounded-md bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                    {post.title}
                                </h2>

                                <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-3 mb-6 flex-1 opacity-80">
                                    {post.body?.replace(/[#*`]/g, '').substring(0, 120)}...
                                </p>

                                <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 font-medium">
                                    <div className="flex items-center gap-2">
                                        <User size={14} />
                                        {post.createdBy?.name || 'Author'}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} />
                                        {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {posts.length === 0 && (
                    <div className="text-center py-32 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 dashed">
                        <div className="text-6xl mb-4">📭</div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No stories yet</h3>
                        <p className="text-slate-500 dark:text-slate-400">Check back later for updates and announcements.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
