'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiMessageSquare, FiSend, FiXCircle, FiClock, FiCheckCircle, FiActivity, FiUser, FiBarChart2 } from 'react-icons/fi';
import PromptModal from '@/app/components/ui/PromptModal';

type Reply = {
  authorId?: string | null;
  authorName?: string;
  message: string;
  createdAt: string;
};

type Ticket = {
  _id: string;
  subject: string;
  message: string;
  status: 'open' | 'pending' | 'resolved' | 'closed';
  replies: Reply[];
  user: { _id: string; name?: string; email?: string } | string;
  createdAt: string;
};

type TicketStats = {
  total: number;
  open: number;
  pending: number;
  resolved: number;
  closed: number;
};

export default function TicketsFragment() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [modal, setModal] = useState({ isOpen: false, ticketId: '', action: 'resolve' as 'resolve' | 'close' });

  async function loadStats() {
    const res = await fetch('/api/admin/tickets/stats');
    if (res.ok) setStats(await res.json());
  }

  async function loadTickets() {
    setLoading(true);
    const qs = new URLSearchParams();
    if (q) qs.set('q', q);
    const res = await fetch(`/api/tickets?${qs.toString()}`);
    if (res.ok) setTickets(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    loadStats();
    loadTickets();
  }, [q]);

  async function handleReply(ticketId: string) {
    const text = replyText[ticketId];
    if (!text?.trim()) return;
    setReplyingId(ticketId);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/reply`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      if (res.ok) {
        setReplyText(prev => ({ ...prev, [ticketId]: '' }));
        loadTickets();
        loadStats();
      }
    } finally {
      setReplyingId(null);
    }
  }

  async function handleStatus(ticketId: string, action: 'resolve' | 'close') {
    const res = await fetch(`/api/tickets/${ticketId}/${action}`, { method: 'POST' });
    if (res.ok) {
      loadTickets();
      loadStats();
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400';
      case 'pending': return 'bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400';
      case 'resolved': return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400';
      case 'closed': return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="space-y-8">
      {/* Insights Section */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total', value: stats?.total, icon: FiActivity, color: 'text-indigo-600' },
          { label: 'Open', value: stats?.open, icon: FiActivity, color: 'text-blue-600' },
          { label: 'Pending', value: stats?.pending, icon: FiClock, color: 'text-amber-600' },
          { label: 'Resolved', value: stats?.resolved, icon: FiCheckCircle, color: 'text-emerald-600' },
          { label: 'Closed', value: stats?.closed, icon: FiXCircle, color: 'text-slate-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className={`p-2 rounded-lg bg-white dark:bg-slate-900 w-fit mb-3 shadow-sm ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{stat.value ?? '...'}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FiMessageSquare className="text-indigo-600" />
          Active Discussions
        </h2>
        <div className="relative w-full md:w-96 group">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search by subject or content..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="space-y-4">
        {loading && !tickets.length ? (
          <div className="text-center py-12 text-slate-500">Searching tickets...</div>
        ) : !tickets.length ? (
          <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
            <FiMessageSquare className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p className="text-slate-500">No matching tickets found.</p>
          </div>
        ) : tickets.map(t => (
          <div key={t._id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">{t.subject}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${getStatusColor(t.status)}`}>
                      {t.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-2">
                    <FiUser className="text-indigo-500" /> Member: {typeof t.user === 'object' ? (t.user.name || t.user.email) : t.user} • {new Date(t.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  {t.status !== 'resolved' && t.status !== 'closed' && (
                    <button
                      onClick={() => setModal({ isOpen: true, ticketId: t._id, action: 'resolve' })}
                      className="px-3 py-1.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors"
                    >
                      Resolve
                    </button>
                  )}
                  {t.status !== 'closed' && (
                    <button
                      onClick={() => setModal({ isOpen: true, ticketId: t._id, action: 'close' })}
                      className="px-3 py-1.5 bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400 rounded-lg text-xs font-bold hover:bg-slate-100 transition-colors"
                    >
                      Close
                    </button>
                  )}
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-slate-700 dark:text-slate-300 text-sm mb-6 border-l-4 border-indigo-500">
                {t.message}
              </div>

              {/* Replies Thread */}
              <div className="space-y-4">
                {t.replies?.map((r, idx) => {
                  const isOwner = String(r.authorId) === String(typeof t.user === 'object' ? t.user?._id : t.user);
                  return (
                    <div key={idx} className={`p-4 rounded-2xl text-sm ${isOwner
                      ? 'bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800'
                      : 'bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/20'
                      }`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                          {r.authorName || 'User'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(r.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300">{r.message}</p>
                    </div>
                  );
                })}

                {/* Reply Input */}
                {t.status !== 'closed' && (
                  <div className="flex gap-2 mt-6">
                    <input
                      value={replyText[t._id] || ''}
                      onChange={e => setReplyText(prev => ({ ...prev, [t._id]: e.target.value }))}
                      placeholder="Type your response..."
                      className="flex-1 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                    <button
                      disabled={replyingId === t._id || !replyText[t._id]?.trim()}
                      onClick={() => handleReply(t._id)}
                      className="px-6 py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-600/20"
                    >
                      {replyingId === t._id ? <FiActivity className="animate-spin" /> : <FiSend />}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <PromptModal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        onConfirm={() => handleStatus(modal.ticketId, modal.action)}
        title={modal.action === 'resolve' ? 'Resolve Ticket?' : 'Close Ticket?'}
        message={
          modal.action === 'resolve'
            ? 'Are you sure you want to mark this ticket as resolved? This indicates the issue has been handled.'
            : 'Are you sure you want to close this ticket? This action will prevent further replies.'
        }
        confirmText={modal.action === 'resolve' ? 'Yes, Resolve' : 'Yes, Close Ticket'}
        type={modal.action === 'resolve' ? 'success' : 'danger'}
      />
    </div>
  );
}
