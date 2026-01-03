'use client';
import { useEffect, useState } from 'react';
import {
  Receipt,
  Wallet,
  CheckCircle2,
  Clock,
  ChevronRight,
  TrendingUp,
  CreditCard,
  History,
  Info
} from 'lucide-react';

export default function PaymentsFragment() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const r = await fetch('/api/payments/mine');
        if (r.ok) {
          setItems(await r.json());
        }
      } catch (error) {
        console.error('Failed to fetch my payments:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400';
      case 'initiated': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400';
      case 'coordinator_marked_paid': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Completed';
      case 'initiated': return 'Pending';
      case 'coordinator_marked_paid': return 'Processing';
      default: return status;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Wallet className="text-indigo-600" size={28} />
            My Payments
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Review your contribution history and status.</p>
        </div>

        <div className="hidden sm:flex items-center gap-3 bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-2xl border border-indigo-100 dark:border-indigo-800">
          <TrendingUp className="text-indigo-600" size={20} />
          <div>
            <div className="text-[10px] uppercase font-black text-slate-400 leading-none">Total Records</div>
            <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{items.length}</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-slate-50 dark:bg-slate-800/50 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(p => (
            <div
              key={p._id}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 hover:border-indigo-200 dark:hover:border-indigo-900 transition flex items-center group shadow-sm"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-600 transition">
                <Receipt size={24} />
              </div>

              <div className="ml-5 flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <div className="md:col-span-1">
                  <div className="text-xs font-black text-slate-400 uppercase tracking-tighter mb-0.5">Title / Option</div>
                  <div className="font-bold text-slate-800 dark:text-slate-100 truncate">{p.title || 'Church Contribution'}</div>
                </div>

                <div className="md:col-span-1">
                  <div className="text-xs font-black text-slate-400 uppercase tracking-tighter mb-0.5">Amount</div>
                  <div className="font-black text-indigo-600 dark:text-indigo-400">₦{p.amount?.toLocaleString()}</div>
                </div>

                <div className="md:col-span-1">
                  <div className="text-xs font-black text-slate-400 uppercase tracking-tighter mb-0.5">Date & Method</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 flex flex-col">
                    <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                      <CreditCard size={10} /> {p.method || 'Cash/Manual'}
                    </span>
                  </div>
                </div>

                <div className="md:col-span-1 flex justify-end">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${getStatusStyle(p.status)}`}>
                    {p.status === 'approved' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                    {getStatusText(p.status)}
                  </span>
                </div>
              </div>

              <div className="ml-4 md:ml-8 opacity-0 group-hover:opacity-100 transition translate-x-1 group-hover:translate-x-0">
                <ChevronRight className="text-slate-300" size={20} />
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-50 dark:bg-slate-900/50 rounded-[40px] border-2 border-dashed border-slate-200 dark:border-slate-800">
              <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-full shadow-sm flex items-center justify-center text-slate-200 mb-4">
                <Info size={40} />
              </div>
              <h4 className="text-xl font-bold text-slate-800 dark:text-slate-200">No history yet</h4>
              <p className="text-slate-400 max-w-xs text-sm mt-2">When you make payments or contributions, they will appear here as part of your digital record.</p>
            </div>
          )}
        </div>
      )}

      <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 flex items-start gap-4">
        <div className="mt-1 flex-shrink-0">
          <Info className="text-indigo-500" size={18} />
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <strong>Note:</strong> Card payments are automatically verified. Cash payments must be reported to a coordinator and approved by the admin.
          The verification process may take 1-2 business days.
        </p>
      </div>
    </div>
  );
}