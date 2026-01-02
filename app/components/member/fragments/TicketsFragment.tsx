'use client';
import { useEffect, useState } from 'react';

type Ticket = { _id: string; subject: string; message: string; status: string; replies: any[]; createdAt: string; };

export default function TicketsFragment() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  async function load() {
    setLoading(true);
    const res = await fetch('/api/tickets/mine');
    setTickets(await res.json());
    setLoading(false);
  }
  useEffect(()=>{ load(); }, []);

  async function createTicket(e: React.FormEvent) {
    e.preventDefault();
    if (!subject || !message) return;
    await fetch('/api/tickets', { method: 'POST', headers: {'content-type':'application/json'}, body: JSON.stringify({ subject, message })});
    setSubject(''); setMessage('');
    load();
  }

  async function reply(ticketId: string) {
    if (!replyText) return;
    await fetch(`/api/tickets/${ticketId}/reply`, { method: 'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ message: replyText })});
    setReplyText('');
    load();
  }

  async function closeTicket(ticketId: string) {
    if (!confirm('Close ticket?')) return;
    await fetch(`/api/tickets/${ticketId}/close`, { method: 'POST' });
    load();
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Tickets</h2>

      <form onSubmit={createTicket} className="mb-4 p-4 bg-white rounded shadow">
        <input value={subject} onChange={e=>setSubject(e.target.value)} placeholder="Subject" className="w-full p-2 border rounded mb-2" />
        <textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder="Message" className="w-full p-2 border rounded mb-2" />
        <div className="text-right"><button className="px-4 py-2 bg-emerald-600 text-white rounded">Create Ticket</button></div>
      </form>

      <div className="bg-white rounded shadow">
        {loading ? <div className="p-4">Loading...</div> : tickets.map(t => (
          <div key={t._id} className="p-4 border-b">
            <div className="flex justify-between">
              <div><strong>{t.subject}</strong> <span className="text-sm text-slate-500">• {t.status}</span></div>
              <div className="text-sm text-slate-500">{new Date(t.createdAt).toLocaleString()}</div>
            </div>
            <div className="mt-2">{t.message}</div>
            <div className="mt-2 space-y-2">
              {t.replies?.map((r:any, idx:number) => (
                <div key={idx} className="p-2 bg-slate-50 rounded">
                  <div className="text-sm text-slate-600">{r.authorName || 'Support'} • {new Date(r.createdAt).toLocaleString()}</div>
                  <div>{r.message}</div>
                </div>
              ))}

              <div className="flex gap-2 mt-2">
                <input value={replyText} onChange={e=>setReplyText(e.target.value)} placeholder="Reply..." className="flex-1 p-2 border rounded" />
                <button onClick={()=>reply(t._id)} className="px-3 py-1 bg-indigo-600 text-white rounded">Reply</button>
                <button onClick={()=>closeTicket(t._id)} className="px-3 py-1 border rounded">Close</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
