'use client';
import { useEffect, useState } from 'react';

export default function MyPaymentFragment() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(()=>{ (async ()=> { const r = await fetch('/api/payments/mine'); setItems(await r.json()); })(); }, []);
  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">My Payment</h2>
      <div className="bg-white rounded shadow">
        {items.map(p => (
          <div key={p._id} className="p-3 border-b">
            <div className="text-sm text-slate-600">{new Date(p.createdAt).toLocaleString()}</div>
            <div>Amount: ₦{p.amount} • Status: {p.status}</div>
            <div className="text-xs text-slate-500">Method: {p.method || '-'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}