'use client';
import { useEffect, useState } from 'react';

type Option = { _id: string; name: string; amount: number; active: boolean };

export default function FinanceFragment() {
  const [options, setOptions] = useState<Option[]>([]);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState<number | ''>('');

  async function load() {
    const res = await fetch('/api/admin/finance/options');
    setOptions(await res.json());
  }
  useEffect(()=>{ load(); }, []);

  async function add() {
    if (!name || !amount) return;
    await fetch('/api/admin/finance/options', {
      method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify({ name, amount: Number(amount) })
    });
    setName(''); setAmount('');
    load();
  }

  async function toggle(id: string) {
    await fetch(`/api/admin/finance/options/${id}/toggle`, { method: 'POST' });
    load();
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Finance — Donation options & Tithes</h2>

      <div className="mb-4 p-4 bg-white rounded shadow grid grid-cols-3 gap-3">
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Option name" className="p-2 border rounded col-span-2" />
        <input value={amount} onChange={e=>setAmount(Number(e.target.value)||'')} placeholder="Amount" className="p-2 border rounded" />
        <div className="col-span-3 text-right">
          <button onClick={add} className="px-4 py-2 bg-emerald-600 text-white rounded">Add Option</button>
        </div>
      </div>

      <div className="bg-white rounded shadow">
        <table className="w-full">
          <thead><tr><th className="p-3">Name</th><th>Amount</th><th>Active</th></tr></thead>
          <tbody>
            {options.map(o=> (
              <tr key={o._id} className="border-t">
                <td className="p-3">{o.name}</td>
                <td>₦{o.amount}</td>
                <td><button onClick={()=>toggle(o._id)} className="px-3 py-1 rounded border">{o.active ? 'Disable' : 'Enable'}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
