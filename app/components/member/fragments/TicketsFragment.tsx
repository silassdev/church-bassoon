'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiMessageSquare, FiSend, FiXCircle, FiClock, FiCheckCircle, FiActivity, FiUser } from 'react-icons/fi';
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
  user: string;
  createdAt: string;
};

export default function TicketsFragment() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [closeModal, setCloseModal] = useState({ isOpen: false, ticketId: '' });

  // Add search params
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const linkedId = searchParams?.get('id');

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/tickets/mine');
      if (res.ok) {
        const data = await res.json() as Ticket[];

        // If we have a linked ID, put it at the top
        if (linkedId) {
          const sorted = [...data].sort((a, b) => (a._id === linkedId ? -1 : b._id === linkedId ? 1 : 0));
          setTickets(sorted);
        } else {
          setTickets(data);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [linkedId]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ subject, message })
      });
      if (res.ok) {
        setSubject('');
        setMessage('');
        setShowCreate(false);
        load();
      }
    } finally {
      setCreating(false);
    }
  }

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
        load();
      }
    } finally {
      setReplyingId(null);
    }
  }

  async function handleClose(ticketId: string) {
    const res = await fetch(`/api/tickets/${ticketId}/close`, { method: 'POST' });
    if (res.ok) load();
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <FiActivity className="w-4 h-4" />;
      case 'pending': return <FiClock className="w-4 h-4" />;
      case 'resolved': return <FiCheckCircle className="w-4 h-4" />;
      case 'closed': return <FiXCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Support Tickets</h2>
          <p className="text-slate-500 text-sm">Need help? Create a ticket and we'll get back to you.</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
        >
          {showCreate ? <FiXCircle /> : <FiPlus />}
          {showCreate ? 'Cancel' : 'New Ticket'}
        </button>
      </div>

      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleCreate} className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Subject</label>
                <input
                  required
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="What is this regarding?"
                  className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Message</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Describe your issue in detail..."
                  className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none resize-none"
                />
              </div>
              <div className="flex justify-end">
                <button
                  disabled={creating}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all"
                >
                  {creating ? 'Creating...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {loading && !tickets.length ? (
          <div className="text-center py-12 text-slate-500">Loading tickets...</div>
        ) : !tickets.length ? (
          <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
            <FiMessageSquare className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p className="text-slate-500">You haven't created any tickets yet.</p>
          </div>
        ) : tickets.map(t => (
          <div key={t._id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">{t.subject}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 ${getStatusColor(t.status)}`}>
                      {getStatusIcon(t.status)}
                      {t.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">Ref: {t._id} • {new Date(t.createdAt).toLocaleDateString()}</p>
                </div>
                {t.status !== 'closed' && (
                  <button
                    onClick={() => setCloseModal({ isOpen: true, ticketId: t._id })}
                    className="text-xs font-bold text-red-500 hover:text-red-600 hover:underline"
                  >
                    Close Ticket
                  </button>
                )}
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-slate-700 dark:text-slate-300 text-sm mb-6">
                {t.message}
              </div>

              {/* Replies Thread */}
              <div className="space-y-4 border-t border-slate-50 dark:border-slate-800 pt-6">
                {t.replies?.map((r, idx) => (
                  <div key={idx} className={`flex gap-3 ${r.authorId === t.user ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${r.authorId === t.user
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-tl-none'
                      }`}>
                      <div className={`flex items-center gap-2 mb-1 text-[10px] font-bold uppercase tracking-widest ${r.authorId === t.user ? 'text-indigo-100' : 'text-slate-500'
                        }`}>
                        <FiUser /> {r.authorName || 'Support'}
                      </div>
                      <p>{r.message}</p>
                      <p className={`text-[10px] mt-2 ${r.authorId === t.user ? 'text-indigo-200' : 'text-slate-500'
                        }`}>
                        {new Date(r.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Reply Input */}
                {t.status !== 'closed' && (
                  <div className="flex gap-2 mt-4">
                    <input
                      value={replyText[t._id] || ''}
                      onChange={e => setReplyText(prev => ({ ...prev, [t._id]: e.target.value }))}
                      placeholder="Type your reply..."
                      className="flex-1 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                    <button
                      disabled={replyingId === t._id || !replyText[t._id]?.trim()}
                      onClick={() => handleReply(t._id)}
                      className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-600/20"
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
        isOpen={closeModal.isOpen}
        onClose={() => setCloseModal({ isOpen: false, ticketId: '' })}
        onConfirm={() => handleClose(closeModal.ticketId)}
        title="Close Ticket?"
        message="Are you sure you want to close this support ticket? This action cannot be undone."
        confirmText="Yes, Close Ticket"
        type="danger"
      />
    </div>
  );
}
