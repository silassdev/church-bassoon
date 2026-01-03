'use client';
import { useEffect, useState } from 'react';

export default function PaymentsFragment() {
  const [payments, setPayments] = useState<any[]>([]);

  async function load() {
    const res = await fetch('/api/payments?role=coordinator'); // implement filter server-side
    if (res.ok) setPayments(await res.json());
  }
  useEffect(()=>{ load(); }, []);

  async function markPaid(id: string) {
    const note = prompt('Enter note (cash received details)') || '';
    const res = await fetch(`/api/payments/${id}/mark-paid`, { method: 'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ note }) });
    if (res.ok) load();
    else alert('Action failed');
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Payments (Coordinator)</h2>
      <div className="bg-white rounded shadow">
        {payments.map(p => (
          <div key={p._id} className="p-3 border-b flex justify-between">
            <div>
              <div className="font-medium">{p.title} • ₦{p.amount}</div>
              <div className="text-xs text-slate-500">{p.guestEmail || p.guestName || 'guest'} • {new Date(p.createdAt).toLocaleString()}</div>
              <div className="text-xs">{p.status}</div>
            </div>
            <div>
              {p.status === 'initiated' && <button onClick={()=>markPaid(p._id)} className="px-3 py-1 bg-amber-500 text-white rounded">Mark Paid</button>}
              {p.status === 'coordinator_marked_paid' && <div className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm">Marked — Pending Admin</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
