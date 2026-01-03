'use client';
import { useEffect, useState } from 'react';
import {
  CreditCard,
  User,
  Mail,
  Banknote,
  ShieldCheck,
  AlertCircle,
  Loader2,
  CheckCircle2
} from 'lucide-react';

export default function PublicPaymentForm({ option }: { option?: any }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState(option?.amount || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return alert('Please enter a valid amount');

    setLoading(true);
    try {
      const body = {
        title: option?.title || 'General Contribution',
        amount: Number(amount),
        guestName: name,
        guestEmail: email,
        optionId: option?._id || null
      };
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body)
      });
      const j = await res.json();

      if (!res.ok) throw new Error(j?.error || 'Payment failed to initiate');

      setSuccess(true);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-emerald-100 dark:border-emerald-900/30 text-center space-y-4 animate-in zoom-in duration-300 shadow-xl shadow-emerald-500/5">
        <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto">
          <CheckCircle2 size={40} />
        </div>
        <h3 className="text-2xl font-black text-slate-900 dark:text-white">Request Received!</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mx-auto">
          Your payment has been initiated. If you're paying as a guest, use the same email when you register to track your history.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="px-6 py-2 bg-slate-900 dark:bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-black transition-colors"
        >
          Make another payment
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-indigo-500/5 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
        <CreditCard size={120} />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Banknote size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">Secure Giving</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Supporting the ministry's mission.</p>
          </div>
        </div>

        <form onSubmit={pay} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1 tracking-widest">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-transparent focus:border-indigo-500 dark:focus:border-indigo-600 rounded-2xl outline-none transition-all text-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1 tracking-widest">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                required
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-transparent focus:border-indigo-500 dark:focus:border-indigo-600 rounded-2xl outline-none transition-all text-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1 tracking-widest">Amount (₦)</label>
            <div className="relative">
              <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                required
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-transparent focus:border-indigo-500 dark:focus:border-indigo-600 rounded-2xl font-black text-xl outline-none transition-all text-indigo-600 dark:text-indigo-400"
              />
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800 flex gap-3">
            <Info size={16} className="text-slate-400 flex-shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Registering later with this same email will automatically link this contribution to your account heritage.
            </p>
          </div>

          <button
            disabled={loading}
            className="w-full py-4 bg-slate-900 dark:bg-indigo-600 hover:bg-black dark:hover:bg-indigo-700 disabled:bg-slate-400 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-xl shadow-indigo-500/10"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <ShieldCheck size={20} />
                Securely Initiate Payment
              </>
            )}
          </button>
      </div>
    </div>
    </div >
  );
}

// Fixed missing Info import
import { Info } from 'lucide-react';
