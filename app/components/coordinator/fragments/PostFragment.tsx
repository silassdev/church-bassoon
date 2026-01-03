'use client';
import { useEffect, useState } from 'react';
import PostEditor from '@/app/components/posts/PostEditor'

export default function PostFragment() {
  const [posts, setPosts] = useState<any[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  async function load() {
    const r = await fetch('/api/posts');
    setPosts(await r.json());
  }

  useEffect(() => { load(); }, []);

  return (
    <div>
      <div className="flex justify-between mb-3">
        <h2 className="text-xl font-semibold">Posts</h2>
        <button onClick={() => setShowEditor(true)} className="border px-3 py-1 rounded">
          New Post
        </button>
      </div>

      {showEditor && <PostEditor onSaved={() => { setShowEditor(false); load(); }} />}

      <div className="space-y-3 mt-4">
        {posts.map(p => (
          <div key={p._id} className="border p-3 rounded">
            <div className="flex justify-between">
              <h3 className="font-medium">{p.title}</h3>
              <span className="text-sm">{p.status}</span>
            </div>
            <div className="text-xs text-slate-500">
              by {p.createdBy?.name} · {new Date(p.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
