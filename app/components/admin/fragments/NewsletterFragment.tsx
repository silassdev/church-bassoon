'use client';
import { useEffect, useState } from 'react';
import {
  Send,
  Users,
  Mail,
  Search,
  History,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Megaphone,
  LayoutGrid,
  ChevronRight,
  TrendingUp,
  Inbox
} from 'lucide-react';
import MarkdownEditor from '@/app/components/posts/MarkdownEditor';

export default function NewsletterFragment() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');

  async function loadSubs() {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/newsletter/subscribers');
      if (r.ok) {
        setSubs(await r.json());
      }
    } catch (err) {
      console.error('Failed to load subscribers:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSubs();
  }, []);

  async function send() {
    if (!title || !content) return;
    setSending(true);
    try {
      const res = await fetch('/api/admin/newsletter/send', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ title, content })
      });
      if (res.ok) {
        alert('Newsletter queued/sent successfully!');
        setTitle('');
        setContent('');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to send newsletter');
      }
    } catch (err) {
      console.error('Send error:', err);
      alert('An unexpected error occurred.');
    } finally {
      setSending(false);
    }
  }

  const filteredSubs = subs.filter(s => s.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <Inbox className="text-indigo-600" size={32} />
            Newsletter Hub
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Compose and broadcast email updates to your congregation.</p>
        </div>

        <div className="flex gap-3">
          <div className="px-5 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
              <Users size={20} />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Subscribers</div>
              <div className="text-xl font-bold dark:text-white">{subs.length}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Composer Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
              <Megaphone className="text-indigo-600" size={20} />
              Compose Newsletter
            </h3>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Subject Line</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                  <input
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl text-slate-800 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Weekly Blessings & Announcements"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Message Body (Supports Markdown)</label>
                <MarkdownEditor value={content} onChange={setContent} />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
                <p className="text-xs text-slate-400 italic">
                  Tip: Use markdown to format headers, lists, and links for a better reading experience.
                </p>
                <button
                  disabled={sending || !title || !content}
                  onClick={send}
                  className="px-8 py-4 bg-slate-900 dark:bg-indigo-600 hover:bg-black dark:hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/10 transition-all active:scale-[0.98] flex items-center gap-2 disabled:opacity-50"
                >
                  {sending ? <Loader2 className="animate-spin" size={20} /> : <><Send size={18} /> Broadcast Newsletter</>}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Subscribers Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm flex flex-col h-[700px]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Users className="text-indigo-600" size={20} />
                Audience
              </h3>
              <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-400 uppercase">{subs.length}</span>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search emails..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {loading && subs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 opacity-50">
                  <Loader2 className="animate-spin" size={24} />
                  <span className="text-xs font-medium">Syncing database...</span>
                </div>
              ) : (
                filteredSubs.slice(0, 100).map(s => (
                  <div key={s._id} className="p-3 border border-slate-50 dark:border-slate-800 hover:border-indigo-100 dark:hover:border-indigo-900/40 rounded-xl transition group flex items-center justify-between">
                    <div className="flex items-center gap-3 truncate">
                      <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-600 transition">
                        <User size={14} />
                      </div>
                      <span className="text-xs text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition truncate">{s.email}</span>
                    </div>
                    <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-indigo-400 transition" />
                  </div>
                ))
              )}

              {!loading && filteredSubs.length === 0 && (
                <div className="text-center py-12">
                  <History className="mx-auto text-slate-200 mb-2" size={32} />
                  <p className="text-xs text-slate-400">No subscribers found.</p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-50 dark:border-slate-800">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/20 flex gap-3">
                <TrendingUp size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 mb-0.5">Growth Tracking</div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                    Subscribers are automatically added when members register or opt-in via the homepage.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Fixed missing User import
import { User } from 'lucide-react';
