'use client';
import { useEffect, useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Link as LinkIcon,
  Image as ImageIcon,
  Plus,
  Trash2,
  ExternalLink,
  Loader2,
  MoreVertical,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  CalendarDays,
  Activity,
  History as HistoryIcon
} from 'lucide-react';

type Ev = {
  _id: string;
  title: string;
  description?: string;
  startAt: string;
  endAt: string;
  location?: string;
  url?: string;
  bannerUrl?: string;
  active: boolean;
  createdByName?: string;
};

export default function EventsFragment() {
  const [items, setItems] = useState<Ev[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // create form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [location, setLocation] = useState('');
  const [url, setUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');

  useEffect(() => {
    load();
    let es: EventSource | null = null;
    try {
      es = new EventSource('/api/events/stream');
      es.onmessage = ev => {
        try {
          const p = JSON.parse(ev.data);
          if (p && (p.action === 'init' || p.action === 'update')) setItems(p.events || []);
        } catch { }
      };
      es.onerror = () => { es?.close(); };
    } catch { }
    return () => es?.close();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/events/preview');
      if (res.ok) setItems(await res.json());
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  }

  async function createEvent() {
    if (!title || !startAt || !endAt) return alert('Title, start and end required');
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ title, description, startAt, endAt, location, url, bannerUrl })
      });
      if (!res.ok) {
        const j = await res.json();
        alert(j.error || 'Failed');
      } else {
        setTitle(''); setDescription(''); setStartAt(''); setEndAt(''); setLocation(''); setUrl(''); setBannerUrl('');
      }
    } catch (error) {
      console.error('Failed to create event:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function remove(id: string) {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      const res = await fetch(`/api/admin/events/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const j = await res.json();
        alert(j.error || 'Delete failed');
      }
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  }

  const upcomingCount = items.filter(e => new Date(e.endAt).getTime() > Date.now()).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <CalendarDays className="text-indigo-600" size={32} />
            Events Management
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Schedule and manage upcoming ministry activities.</p>
        </div>

        <div className="flex gap-3">
          <div className="px-5 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
              <Calendar size={20} />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Upcoming</div>
              <div className="text-xl font-bold dark:text-white">{upcomingCount}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Creation Form */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm sticky top-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
              <Plus className="text-indigo-600" size={20} />
              Create Event
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Event Title</label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Sunday Miracle Service"
                  className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Join us for a powerful time..."
                  rows={3}
                  className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none dark:text-white resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Start Date</label>
                  <input
                    type="datetime-local"
                    value={startAt}
                    onChange={e => setStartAt(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl text-xs focus:ring-2 focus:ring-indigo-500 transition-all outline-none dark:text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">End Date</label>
                  <input
                    type="datetime-local"
                    value={endAt}
                    onChange={e => setEndAt(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl text-xs focus:ring-2 focus:ring-indigo-500 transition-all outline-none dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="Main Sanctuary / Online"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none dark:text-white"
                  />
                </div>
              </div>

              <button
                disabled={isSubmitting || !title || !startAt || !endAt}
                onClick={createEvent}
                className="w-full py-4 bg-slate-900 dark:bg-indigo-600 hover:bg-black dark:hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/10 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <><Plus size={18} /> Schedule Event</>}
              </button>
            </div>
          </div>
        </div>

        {/* Event List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <HistoryIcon className="text-indigo-600" size={20} />
              Event History
            </h3>
            <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">{items.length} Total</span>
          </div>

          {loading && items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
              <Loader2 className="animate-spin text-indigo-500" size={40} />
              <p className="text-slate-500 text-sm font-medium">Loading ministry calendar...</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {items.map((e: any) => {
                const isPast = new Date(e.endAt).getTime() <= Date.now();
                return (
                  <div
                    key={e._id}
                    className={`bg-white dark:bg-slate-900 border rounded-3xl p-6 transition-all group relative overflow-hidden ${isPast ? 'border-slate-100 dark:border-slate-800 opacity-75' : 'border-indigo-100 dark:border-indigo-900/40 hover:border-indigo-300 dark:hover:border-indigo-700 shadow-sm'
                      }`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isPast ? 'bg-slate-100 text-slate-400' : 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600'}`}>
                            <Calendar size={20} />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              {e.title}
                              {isPast && <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Past</span>}
                            </h4>
                            <div className="flex items-center gap-4 text-xs text-slate-400 font-medium mt-0.5">
                              <span className="flex items-center gap-1.5"><Clock size={12} /> {new Date(e.startAt).toLocaleDateString()}</span>
                              <span className="flex items-center gap-1.5"><MapPin size={12} /> {e.location || 'No location'}</span>
                            </div>
                          </div>
                        </div>

                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {e.description || 'No description provided.'}
                        </p>

                        {e.url && (
                          <a href={e.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:underline">
                            <ExternalLink size={14} /> View Details / Join
                          </a>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => remove(e._id)}
                          className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"
                          title="Delete Event"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    <div className={`h-1.5 w-full absolute bottom-0 left-0 transition-all duration-500 ${isPast ? 'bg-slate-200 dark:bg-slate-800' : 'bg-gradient-to-r from-indigo-500 to-indigo-600'}`} />
                  </div>
                );
              })}

              {items.length === 0 && (
                <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/20 rounded-[2.5rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
                  <CalendarDays className="mx-auto text-slate-200 mb-4" size={48} />
                  <h4 className="font-bold text-slate-400">No events found</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">Start scheduling activities using the creation form on the left.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
