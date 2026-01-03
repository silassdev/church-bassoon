'use client';
import { useEffect, useState } from 'react';

export default function FinanceFragment() {
  const [options, setOptions] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('tithes');
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');

  async function load() {
    const [oRes, pRes] = await Promise.all([fetch('/api/payment-options'), fetch('/api/admin/payments')]);
    if (oRes.ok) setOptions(await oRes.json());
    if (pRes.ok) setPayments(await pRes.json());
  }

  useEffect(()=>{ load(); }, []);

  async function createOption() {
    const res = await fetch('/api/admin/payment-options', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ title, type, amount: amount?Number(amount):null, description: desc }) });
    if (res.ok) { setTitle(''); setAmount(''); setDesc(''); load(); }
  }

  async function approve(paymentId: string, decision: 'approved'|'decline') {
    const note = prompt('Note (optional)') || '';
    const res = await fetch(`/api/admin/payments/${paymentId}/approve`, { method: 'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ decision: decision === 'approved' ? 'approve' : 'decline', note }) });
    if (res.ok) load();
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Finance — Admin</h2>

      <div className="mb-4 bg-white p-4 rounded shadow">
        <h3 className="font-medium mb-2">Create Payment Option</h3>
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" className="p-2 border rounded w-full mb-2" />
        <select value={type} onChange={e=>setType(e.target.value)} className="p-2 border rounded mb-2">
          <option value="tithes">Tithes</option>
          <option value="offerings">Offerings</option>
          <option value="budget">Budget</option>
          <option value="one_tenth">One tenth</option>
        </select>
        <input value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Amount (optional)" className="p-2 border rounded w-full mb-2" />
        <textarea value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Description" className="p-2 border rounded w-full" />
        <div className="text-right mt-2"><button onClick={createOption} className="px-4 py-2 bg-indigo-600 text-white rounded">Create</button></div>
      </div>

      <div className="bg-white rounded shadow">
        <div className="p-3 border-b font-medium">Recent Payments (Admin view)</div>
        {(payments || []).map((p:any) => (
          <div key={p._id} className="p-3 border-b flex justify-between items-start">
            <div>
              <div className="font-medium">{p.title} • ₦{p.amount} • {p.status}</div>
              <div className="text-xs text-slate-500">By: {p.userEmail || p.guestEmail || p.guestName || 'guest'} • {new Date(p.createdAt).toLocaleString()}</div>
            </div>
            <div className="flex flex-col gap-2">
              {p.status === 'coordinator_marked_paid' && (
                <>
                  <button onClick={()=>approve(p._id,'approved')} className="px-3 py-1 bg-emerald-600 text-white rounded text-sm">Approve</button>
                  <button onClick={()=>approve(p._id,'decline')} className="px-3 py-1 border rounded text-sm">Decline</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
