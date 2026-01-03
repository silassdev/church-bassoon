'use client';
import { useEffect, useState } from 'react';
import PostEditor from '@/app/components/posts/PostEditor'
import { Plus, Search, Filter, MoreHorizontal, Edit3, Eye, Calendar, User } from 'lucide-react';

export default function PostFragment() {
  const [posts, setPosts] = useState<any[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);

  async function load() {
    const r = await fetch('/api/posts');
    setPosts(await r.json());
  }

  useEffect(() => { load(); }, []);

  const handleEdit = (p: any) => {
    setEditingPost(p);
    setShowEditor(true);
  };

  const handleNew = () => {
    setEditingPost(undefined);
    setShowEditor(true);
  };

  if (showEditor) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => { setShowEditor(false); load(); }}
          className="text-sm text-slate-500 hover:text-indigo-600 flex items-center gap-1"
        >
          ← Back to Posts
        </button>
        <PostEditor
          initialPost={editingPost}
          onSaved={() => { load(); }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Posts</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Manage your blog posts and announcements.</p>
        </div>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition"
        >
          <Plus size={18} /> New Post
        </button>
      </div>

      {/* Filters (Visual only for now) */}
      <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
        <Search size={18} className="text-slate-400 ml-2" />
        <input
          placeholder="Search posts..."
          className="flex-1 bg-transparent outline-none text-sm text-slate-700 dark:text-slate-200"
        />
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
        <button className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-1.5 rounded-md transition">
          <Filter size={16} /> Filter
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map(p => (
          <div key={p._id} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col">
            {/* Card Image */}
            <div className="h-40 bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
              {p.featureImage ? (
                <img src={p.featureImage} alt={p.title} className="w-full h-full object-cover transition duration-700 group-hover:scale-105" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600">
                  <ImageIcon size={32} />
                </div>
              )}
              <div className="absolute top-3 right-3">
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${p.status === 'published' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}>
                  {p.status}
                </span>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-2 line-clamp-2 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                {p.title || 'Untitled Post'}
              </h3>

              <div className="mt-auto pt-4 flex flex-col gap-2 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <User size={14} /> {p.createdBy?.name || 'Unknown'}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={14} /> {new Date(p.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Card Footer Actions */}
            <div className="px-5 py-3 border-t border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition duration-200">
              <button
                onClick={() => handleEdit(p)}
                className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-700 rounded-md shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-600 transition"
                title="Edit"
              >
                <Edit3 size={16} />
              </button>
              {p.status === 'published' && (
                <a
                  href={`/posts/${p.slug}`} // Assuming public route
                  target="_blank"
                  className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-white dark:hover:bg-slate-700 rounded-md shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-600 transition"
                  title="View Live"
                >
                  <Eye size={16} />
                </a>
              )}
            </div>
          </div>
        ))}

        {posts.length === 0 && (
          <div className="col-span-full py-20 text-center text-slate-400 dark:text-slate-600">
            <div className="mx-auto w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4">
              <Edit3 size={24} className="opacity-50" />
            </div>
            <p>No posts found. Start writing something new!</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ImageIcon({ size, className }: { size?: number, className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  )
}
