'use client';
import {
  Users,
  CircleDollarSign,
  Megaphone,
  LayoutDashboard,
  ArrowUpRight,
  ShieldCheck,
  TrendingUp,
  Activity
} from 'lucide-react';

export default function OverviewFragment() {
  const stats = [
    { label: 'Total Users', value: '...', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Monthly Finance', value: '...', icon: CircleDollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Announcements', value: '...', icon: Megaphone, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <LayoutDashboard className="text-indigo-600" size={32} />
            Command Center
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Global oversight and real-time ministry metrics.</p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-full border border-emerald-100 dark:border-emerald-800/50 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck size={14} /> System Secure
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group">
            <div className="flex justify-between items-start mb-6">
              <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color} group-hover:rotate-12 transition-transform`}>
                <stat.icon size={28} />
              </div>
              <button className="text-slate-300 hover:text-slate-600 dark:hover:text-slate-200 transition">
                <ArrowUpRight size={20} />
              </button>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{stat.label}</div>
              <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{stat.value}</div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-emerald-500">
              <Activity size={12} /> Live Sync Active
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-10 rounded-[3rem] bg-indigo-600 text-white relative overflow-hidden shadow-2xl shadow-indigo-500/20">
          <div className="absolute top-0 right-0 p-12 opacity-10">
            <TrendingUp size={160} />
          </div>
          <div className="relative z-10">
            <h3 className="text-2xl font-black mb-4">Financial Growth</h3>
            <p className="text-indigo-100 leading-relaxed mb-8 max-w-sm">
              Your ministry is growing. Track every contribution with precision and transparency using our automated finance tools.
            </p>
            <div className="h-24 bg-white/10 rounded-2xl border border-white/20 flex items-center justify-center italic text-indigo-200 text-sm">
              Chart visualization coming soon...
            </div>
          </div>
        </div>

        <div className="p-10 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
          <h3 className="text-2xl font-black mb-6 text-slate-800 dark:text-white flex items-center gap-3">
            <Megaphone className="text-amber-500" /> Recent Activity
          </h3>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition">
                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                <div className="flex-1 h-4 bg-slate-200 dark:bg-slate-700 rounded-full w-3/4 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
