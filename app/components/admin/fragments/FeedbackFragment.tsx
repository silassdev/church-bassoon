'use client';
import { useEffect, useState } from 'react';
export default function FeedbackFragment() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(()=> { (async ()=> { const res = await fetch('/api/admin/feedback'); setItems(await res.json()); })(); }, []);
  async function respond(id: string) {
    const msg = prompt('Reply message');
    if (!msg) return;
    await fetch(`/api/admin/feedback/${id}/respond`, { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ response: msg })});
    setItems(items.map(i=> i._id === id ? { ...i, response: msg, status: 'responded' } : i));
  }
  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Feedback</h2>
      <div className="bg-white rounded shadow">
        {items.map(f => (
          <div key={f._id} className="p-3 border-b">
            <div className="text-sm text-slate-600">{f.email} • {new Date(f.createdAt).toLocaleString()}</div>
            <div className="mt-1">{f.message}</div>
            <div className="mt-2">
              <button className="mr-2 px-3 py-1 rounded border" onClick={()=>respond(f._id)}>Respond</button>
              <span className="text-sm text-slate-500">{f.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}