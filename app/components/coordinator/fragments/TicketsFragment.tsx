'use client';
import { useEffect, useState } from 'react';

export default function TicketsFragment() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [q, setQ] = useState('');

  async function load() {
    const qs = new URLSearchParams();
    if (q) qs.set('q', q);
    const res = await fetch(`/api/tickets?${qs.toString()}`);
    setTickets(await res.json());
  }

  useEffect(()=>{ load(); }, [q]);

  async function reply(id:string, text:string) {
    if (!text) return;
    await fetch(`/api/tickets/${id}/reply`, { method: 'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ message: text })});
    load();
  }

  async function assignAndClose(id:string) {
    if (!confirm('Close ticket?')) return;
    await fetch(`/api/tickets/${id}/close`, { method: 'POST' });
    load();
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Tickets (Coordinator)</h2>
      <div className="mb-4">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search tickets by subject or user" className="p-2 border rounded w-full" />
      </div>

      <div className="bg-white rounded shadow">
        {tickets.map(t => (
          <div key={t._id} className="p-4 border-b">
            <div className="flex justify-between">
              <div><strong>{t.subject}</strong> <span className="text-sm text-slate-500">• {t.status}</span></div>
              <div className="text-sm text-slate-500">{new Date(t.createdAt).toLocaleString()}</div>
            </div>
            <div className="mt-2">{t.message}</div>
            <div className="mt-2 space-y-2">
              {t.replies?.map((r:any, idx:number) => <div key={idx} className="p-2 bg-slate-50 rounded">{r.authorName} • {new Date(r.createdAt).toLocaleString()}<div>{r.message}</div></div>)}
              <CoordinatorReplyBox ticketId={t._id} onReply={(txt)=>reply(t._id, txt)} onClose={()=>assignAndClose(t._id)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CoordinatorReplyBox({ ticketId, onReply, onClose }: { ticketId: string; onReply: (s:string)=>void; onClose: ()=>void }) {
  const [txt, setTxt] = useState('');
  return (
    <div className="flex gap-2">
      <input value={txt} onChange={e=>setTxt(e.target.value)} placeholder="Reply..." className="flex-1 p-2 border rounded" />
      <button onClick={()=>{ onReply(txt); setTxt(''); }} className="px-3 py-1 bg-indigo-600 text-white rounded">Reply</button>
      <button onClick={onClose} className="px-3 py-1 border rounded">Close</button>
    </div>
  );
}
