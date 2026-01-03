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
  History,
  Shield,
  Loader2,
  Info
} from 'lucide-react';

type Ann = {
  _id: string;
  text: string;
  addedByName?: string;
  addedByRole?: string;
  active?: boolean;
  createdAt?: string;
  addedBy?: string;
};

export default function NoticeFragment() {
  const [items, setItems] = useState<Ann[]>([]);
  const [text, setText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    try {
      // Coordinators use the same management endpoint but might have restricted access on DELETE/PUT
      const res = await fetch('/api/announcements/preview');
      if (res.ok) {
        setItems(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
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
      es.onerror = () => es?.close();
    } catch { }
    return () => es?.close();
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
      } else {
        setText('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this announcement?')) return;
    try {
      const res = await fetch(`/api/admin/announcements/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const j = await res.json();
        alert(j?.error || 'Only admins or the creator can delete announcements.');
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Megaphone className="text-indigo-500" size={28} />
            Community Notices
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Create and view announcements for all church members.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Composition Form */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">New Notice</h3>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              rows={4}
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-slate-800 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 transition-all outline-none resize-none text-sm mb-4"
              placeholder="Enter announcement text..."
            />
            <button
              disabled={isSubmitting || !text.trim()}
              onClick={createAnnouncement}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <><Plus size={18} /> Broadcast</>}
            </button>
            <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-900/30 flex gap-3">
              <Info size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-amber-700 dark:text-amber-400 leading-relaxed">
                Notice: Announcements are public. Ensure information is accurate before broadcasting.
              </p>
            </div>
          </div>
        </div>

        {/* History List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Notice History</h3>
            <span className="text-[10px] font-bold text-slate-400">{items.length} records</span>
          </div>

          {loading && items.length === 0 ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800 rounded-2xl" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {items.map(a => (
                <div key={a._id} className="bg-white dark:bg-slate-900 border border-slate-50 dark:border-slate-800 rounded-3xl p-5 hover:border-indigo-100 dark:hover:border-indigo-900/50 transition-all shadow-sm group">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${a.addedByRole === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                          {a.addedByRole}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">
                          {a.addedByName} • {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : 'Just now'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                        {a.text}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => remove(a._id)}
                        className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  {!a.active && (
                    <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-slate-400 italic">
                      <XCircle size={10} /> Disabled by Admin
                    </div>
                  )}
                </div>
              ))}

              {items.length === 0 && (
                <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/20 rounded-[2.5rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
                  <Megaphone className="mx-auto text-slate-200 mb-4" size={48} />
                  <h4 className="font-bold text-slate-400">No active notices</h4>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
