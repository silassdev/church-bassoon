'use client';
import { useEffect, useState } from 'react';
import {
  Banknote,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  User,
  Calendar,
  CreditCard,
  History,
  Check
} from 'lucide-react';

export default function PaymentsFragment() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/payments?role=coordinator');
      if (res.ok) {
        const data = await res.json();
        setPayments(data);
      }
    } catch (error) {
      console.error('Failed to load coordinator payments:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function markPaid(id: string) {
    const note = prompt('Enter note (cash received details, e.g. "Received by John at the office")') || '';
    if (note === null) return; // cancelled

    const res = await fetch(`/api/payments/${id}/mark-paid`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ note })
    });

    if (res.ok) {
      load();
    } else {
      alert('Action failed');
    }
  }

  const filteredPayments = payments.filter(p =>
    (p.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.guestName || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.guestEmail || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Banknote className="text-amber-500" size={28} />
            Payment Collection
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Verify and mark cash payments for processing.</p>
        </div>

        <div className="relative group max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search payments..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-10 h-10 border-4 border-amber-100 dark:border-slate-800 border-t-amber-500 rounded-full animate-spin"></div>
          <p className="text-slate-500 text-sm font-medium">Synchronizing payment records...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredPayments.map(p => (
            <div
              key={p._id}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-amber-200 dark:hover:border-amber-900/50 transition duration-300 flex flex-col group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600">
                  <CreditCard size={24} />
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-slate-900 dark:text-white">₦{p.amount?.toLocaleString()}</div>
                  <div className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mt-1 ${p.status === 'initiated'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                    }`}>
                    {p.status?.replace(/_/g, ' ')}
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-3">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 leading-snug">
                  {p.title}
                </h3>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <User size={14} className="text-slate-400" />
                    <span className="truncate">{p.guestEmail || p.guestName || 'Internal Member'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <Calendar size={14} className="text-slate-400" />
                    <span>{new Date(p.createdAt).toLocaleDateString()} at {new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-50 dark:border-slate-800">
                {p.status === 'initiated' ? (
                  <button
                    onClick={() => markPaid(p._id)}
                    className="w-full py-3 bg-slate-900 dark:bg-amber-600 hover:bg-black dark:hover:bg-amber-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  >
                    <Check size={18} /> Mark as Paid
                  </button>
                ) : (
                  <div className="w-full py-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl font-bold flex items-center justify-center gap-2 border border-emerald-100 dark:border-emerald-900/30">
                    <CheckCircle2 size={18} /> Pending Admin
                  </div>
                )}
              </div>
            </div>
          ))}

          {filteredPayments.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                <History size={40} />
              </div>
              <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200">No matching records</h4>
              <p className="text-slate-400 max-w-xs text-sm">We couldn't find any payment records. Try changing your search query or check back later.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
