'use client';
import { useEffect, useState } from 'react';
import {
  Megaphone,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  CheckCircle2,
  XCircle,
  Clock,
  MoreVertical,
  Activity,
  History,
  User,
  Shield,
  Loader2
} from 'lucide-react';

type Ann = {
  _id: string;
  text: string;
  addedByName?: string;
  addedByRole?: string;
  active?: boolean;
  createdAt?: string
};

export default function AnnouncementFragment() {
  const [items, setItems] = useState<Ann[]>([]);
  const [text, setText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/announcements/preview');
      if (res.ok) {
        const arr = await res.json();
        setItems(arr);
      }
    } catch (err) {
      console.error('Failed to load announcements', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // subscribe SSE
    let es: EventSource | null = null;
    try {
      es = new EventSource('/api/announcements/stream');
      es.onmessage = ev => {
        try {
          const payload = JSON.parse(ev.data);
          if (payload && (payload.action === 'init' || payload.action === 'update')) {
            setItems(payload.announcements || []);
          }
        } catch { }
      };
      es.onerror = () => { es?.close(); };
    } catch { }
    return () => { es?.close(); };
  }, []);

  async function createAnnouncement() {
    if (!text.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text })
      });
      if (!res.ok) {
        const j = await res.json();
        alert(j?.error || 'Failed');
        return;
      }
      setText('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  function startEdit(a: Ann) {
    setEditingId(a._id);
    setEditText(a.text);
  }

  async function saveEdit() {
    if (!editingId) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/announcements/${editingId}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text: editText })
      });
      if (!res.ok) {
        const j = await res.json();
        alert(j?.error || 'Failed');
        return;
      }
      setEditingId(null);
      setEditText('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function toggleActive(a: Ann) {
    try {
      const res = await fetch(`/api/admin/announcements/${a._id}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ active: !a.active })
      });
      if (!res.ok) throw new Error('Failed to toggle status');
    } catch (err) {
      alert('Failed to update status');
    }
  }

  async function remove(id: string) {
    if (!confirm('Are you sure you want to delete this announcement? This action cannot be undone.')) return;
    try {
      const res = await fetch(`/api/admin/announcements/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const j = await res.json();
        alert(j?.error || 'Failed');
        return;
      }
    } catch (err) {
      console.error(err);
    }
  }

  const activeCount = items.filter(i => i.active).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <Megaphone className="text-indigo-600 animate-bounce-slow" size={32} />
            Public Announcements
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Broadcast critical info to all members in real-time.</p>
        </div>

        <div className="flex gap-3">
          <div className="px-5 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
              <Activity size={20} />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Stream</div>
              <div className="text-xl font-bold dark:text-white">{activeCount}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Composer Section */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm sticky top-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
              <Plus className="text-indigo-600" size={20} />
              Compose Message
            </h3>

            <div className="space-y-4">
              <div className="group relative">
                <textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  rows={5}
                  className="w-full p-5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-3xl text-slate-800 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 transition-all outline-none resize-none text-sm leading-relaxed"
                  placeholder="What would you like to broadcast? Keep it concise for the banner..."
                />
                <div className="absolute bottom-4 right-4 text-[10px] font-bold text-slate-400 bg-white dark:bg-slate-900 px-2 py-1 rounded-full border border-slate-100 dark:border-slate-800">
                  {text.length} chars
                </div>
              </div>

              <button
                disabled={isSubmitting || !text.trim()}
                onClick={createAnnouncement}
                className="w-full py-4 bg-slate-900 dark:bg-indigo-600 hover:bg-black dark:hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/10 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <><Megaphone size={18} /> Broadcast Now</>}
              </button>
            </div>

            <div className="mt-8 p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/20 flex gap-3">
              <History size={16} className="text-indigo-400 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed italic">
                Broadcasts appear instantly on the main dashboard for all active members.
              </p>
            </div>
          </div>
        </div>

        {/* List Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <History className="text-indigo-600" size={20} />
              Recent Broadasts
            </h3>
            <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{items.length} Total</span>
          </div>

          {loading && items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 border-4 border-indigo-100 dark:border-slate-800 border-t-indigo-500 rounded-full animate-spin"></div>
              <p className="text-slate-500 text-sm font-medium">Fetching broadcast history...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(a => (
                <div
                  key={a._id}
                  className={`bg-white dark:bg-slate-900 border rounded-3xl p-6 transition-all group relative overflow-hidden ${editingId === a._id
                      ? 'border-indigo-500 ring-4 ring-indigo-500/5'
                      : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
                    }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold uppercase ${a.addedByRole === 'admin' ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400' : 'bg-slate-50 dark:bg-slate-800 text-slate-500'
                          }`}>
                          {a.addedByRole === 'admin' ? <Shield size={14} /> : <User size={14} />}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-200 leading-none mb-1">{a.addedByName}</span>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold">{a.addedByRole} • {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : 'Just now'}</span>
                        </div>
                      </div>

                      {editingId === a._id ? (
                        <div className="mt-3 space-y-3">
                          <textarea
                            value={editText}
                            onChange={e => setEditText(e.target.value)}
                            className="w-full p-4 bg-slate-50 dark:bg-slate-800 border rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm leading-relaxed"
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <button onClick={saveEdit} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all active:scale-95">
                              <Save size={14} /> Update
                            </button>
                            <button onClick={() => setEditingId(null)} className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95">
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed pr-8 line-clamp-3 group-hover:line-clamp-none transition-all">
                          {a.text}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      {editingId !== a._id && (
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => toggleActive(a)}
                            className={`p-2 rounded-xl transition-all border ${a.active
                                ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border-emerald-100 dark:border-emerald-900/30'
                                : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-800'
                              }`}
                            title={a.active ? 'Active - Click to disable' : 'Disabled - Click to enable'}
                          >
                            {a.active ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                          </button>

                          <div className="w-px h-4 bg-slate-100 dark:bg-slate-800 self-center" />

                          <button
                            onClick={() => startEdit(a)}
                            className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-400 hover:text-indigo-600 rounded-xl transition-all"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>

                          <button
                            onClick={() => remove(a._id)}
                            className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-900/30 text-slate-400 hover:text-rose-600 rounded-xl transition-all"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Visual indication of status at the bottom */}
                  <div className={`h-1.5 w-full absolute bottom-0 left-0 transition-all duration-500 ${a.active ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-slate-200 dark:bg-slate-800'}`} />
                </div>
              ))}

              {items.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
                  <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center text-slate-200 mb-4">
                    <Clock size={40} />
                  </div>
                  <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200">Silence is golden</h4>
                  <p className="text-slate-400 max-w-xs text-sm">No announcements have been made yet. Use the composer to start broadcasting.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
