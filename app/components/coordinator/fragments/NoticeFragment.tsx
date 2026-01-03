'use client';
import { useEffect, useState } from 'react';

export default function NoticeFragment() {
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [limit, setLimit] = useState(25);

  async function load() {
    const qs = new URLSearchParams({ limit: String(limit) });
    if (q) qs.set('q', q);
    if (status) qs.set('status', status);
    const r = await fetch(`/api/payments?${qs.toString()}`);
    setItems(await r.json());
  }

  useEffect(()=>{ load(); }, [q, status, limit]);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Payments (Coordinator)</h2>
      <div className="mb-4 flex gap-2">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search by user email or reference" className="p-2 border rounded flex-1" />
        <select value={status} onChange={e=>setStatus(e.target.value)} className="p-2 border rounded">
          <option value="">All</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
          <option value="completed">Completed</option>
        </select>
        <select value={limit} onChange={e=>setLimit(Number(e.target.value))} className="p-2 border rounded">
          {[10,25,50,100].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>

      <div className="bg-white rounded shadow">
        {items.map(p => (
          <div key={p._id} className="p-3 border-b">
            <div className="text-sm text-slate-600">{new Date(p.createdAt).toLocaleString()}</div>
            <div>Amount: ₦{p.amount} • Status: {p.status} • User: {p.userEmail || '-'}</div>
            <div className="text-xs text-slate-500">Ref: {p.providerReference || '-'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
