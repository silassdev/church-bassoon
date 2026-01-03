'use client';
import { useEffect, useRef, useState } from 'react';

type EventItem = {
  _id: string;
  title: string;
  description?: string;
  startAt: string;
  endAt: string;
  location?: string;
  url?: string;
  bannerUrl?: string;
  isPast?: boolean;
};

export default function EventBanner({ intervalMs = 7000 }: { intervalMs?: number }) {
  const [items, setItems] = useState<EventItem[]>([]);
  const [index, setIndex] = useState(0);
  const timerRef = useRef<number | null>(null);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/events?limit=50');
        if (res.ok) {
          const list = await res.json();
          setItems(list);
          setIndex(0);
        }
      } catch {}
    })();

    try {
      const es = new EventSource('/api/events/stream');
      es.onmessage = (ev) => {
        try {
          const payload = JSON.parse(ev.data);
          if (payload && (payload.action === 'init' || payload.action === 'update')) {
            setItems(payload.events || []);
            setIndex(0);
          }
        } catch {}
      };
      es.onerror = () => { es.close(); };
      esRef.current = es;
    } catch {}
    return () => {
      if (esRef.current) esRef.current.close();
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!items || items.length === 0) return;
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setIndex(i => (items.length ? (i + 1) % items.length : 0));
    }, intervalMs);
    return () => { if (timerRef.current) window.clearInterval(timerRef.current); };
  }, [items, intervalMs]);

  if (!items || items.length === 0) return null;
  const current = items[index];

  return (
    <div className="w-full bg-slate-50 border-t border-b">
      <div className="max-w-screen-xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center gap-4">
        <div className="w-full md:w-1/3 h-40 md:h-28 rounded overflow-hidden bg-slate-100 flex items-center justify-center">
          {current.bannerUrl ? <img src={current.bannerUrl} alt={current.title} className="w-full h-full object-cover" /> : <div className="text-sm text-slate-500">No banner</div>}
        </div>

        <div className="flex-1">
          <div className={`text-lg font-semibold ${current.isPast ? 'line-through text-slate-400' : ''}`}>{current.title}</div>
          <div className="text-sm text-slate-600 mt-1">{current.description}</div>
          <div className="text-sm text-slate-500 mt-2">
            <span>{new Date(current.startAt).toLocaleString()} — {new Date(current.endAt).toLocaleString()}</span>
            {current.location && <span className="ml-4">Location: {current.location}</span>}
          </div>
          <div className="mt-3">
            {current.url && <a href={current.url} target="_blank" rel="noreferrer" className="text-indigo-600 text-sm">Join / Details</a>}
          </div>
        </div>
      </div>
    </div>
  );
}
