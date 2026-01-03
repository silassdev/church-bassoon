'use client';
import { useEffect, useState } from 'react';

export default function PublicPaymentForm({ option }: { option?: any }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState(option?.amount || '');
  const [loading, setLoading] = useState(false);

  useEffect(()=> {
  }, []);

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const body = { title: option?.title || 'Payment', amount: Number(amount), guestName: name, guestEmail: email, optionId: option?._id || null };
    const res = await fetch('/api/payments', { method: 'POST', headers: {'content-type':'application/json'}, body: JSON.stringify(body) });
    const j = await res.json();
    setLoading(false);
    if (!res.ok) return alert(j?.error || 'Payment failed to initiate');
    // show UI message
    alert('Payment initiated. If you did this as guest, you can register with same email later to track it.');
    // Ideally redirect to payment provider checkout with j.paymentId
  }

  return (
    <form onSubmit={pay} className="bg-white p-4 rounded shadow space-y-2">
      <input value={name} onChange={e=>setName(e.target.value)} placeholder="Full name" className="w-full p-2 border rounded" />
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full p-2 border rounded" />
      <input value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Amount" className="w-full p-2 border rounded" />
      <div className="text-sm text-slate-500">Note: if you are not logged in we will record your email. Registering later with the same email will associate payments with your account.</div>
      <div className="text-right"><button disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded">{loading ? 'Processing…' : 'Pay'}</button></div>
    </form>
  );
}
