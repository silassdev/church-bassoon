'use client';
import { useEffect, useState } from 'react';

export default function NewsletterFragment() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [subs, setSubs] = useState<any[]>([]);

  useEffect(() => { (async ()=> { const r = await fetch('/api/admin/newsletter/subscribers'); setSubs(await r.json()); })(); }, []);

  async function send() {
    if (!title || !content) return;
    const res = await fetch('/api/admin/newsletter/send', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ title, content })});
    if (res.ok) alert('Newsletter queued/sent');
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Email / Newsletter</h2>

      <div className="bg-white p-4 rounded shadow mb-4">
        <input className="w-full p-2 border rounded mb-2" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Subject" />
        <textarea className="w-full p-2 border rounded mb-2" value={content} onChange={e=>setContent(e.target.value)} placeholder="Message body" />
        <div className="text-right"><button onClick={send} className="px-4 py-2 bg-indigo-600 text-white rounded">Send</button></div>
      </div>

      <div className="bg-white rounded shadow p-4">
        <div className="text-sm text-slate-600 mb-2">Subscribers ({subs.length})</div>
        {subs.slice(0, 50).map(s => <div key={s._id} className="py-1 border-b">{s.email}</div>)}
      </div>
    </div>
  );
}
