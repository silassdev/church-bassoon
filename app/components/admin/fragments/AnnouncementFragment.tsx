'use client';
import { useEffect, useState } from 'react';

export default function AnnouncementFragment() {
  const [text, setText] = useState('');
  const [list, setList] = useState<any[]>([]);

  async function load() {
    const res = await fetch('/api/admin/announcements');
    setList(await res.json());
  }
  useEffect(()=>{ load(); }, []);

  async function add() {
    if (!text) return;
    await fetch('/api/admin/announcements', { method:'POST', headers: {'content-type':'application/json'}, body: JSON.stringify({ text })});
    setText(''); load();
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Announcements</h2>
      <div className="mb-4 p-4 bg-white rounded shadow">
        <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Short notice" className="w-full p-2 border rounded" />
        <div className="text-right mt-2"><button onClick={add} className="px-4 py-2 bg-indigo-600 text-white rounded">Post</button></div>
      </div>

      <div className="bg-white rounded shadow p-4">
        {list.length === 0 ? <p>No announcements yet</p> : list.map(a => (
          <div key={a._id} className="border-b py-2">
            <div className="text-sm text-slate-600">{new Date(a.createdAt).toLocaleString()} — by {a.addedByName || 'Admin'}</div>
            <div className="mt-1">{a.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
