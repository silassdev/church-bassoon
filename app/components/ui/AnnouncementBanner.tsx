'use client';
import { useEffect, useRef, useState } from 'react';

type Announcement = { _id: string; text: string; addedByName?: string; createdAt?: string };

export default function AnnouncementBanner({ intervalMs = 5000 }: { intervalMs?: number }) {
  const [items, setItems] = useState<Announcement[]>([]);
  const idxRef = useRef(0);
  const [current, setCurrent] = useState<Announcement | null>(null);
  const timerRef = useRef<number | null>(null);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // initial fetch fallback
    (async () => {
      try {
        const res = await fetch('/api/announcements?limit=50');
        if (res.ok) {
          const list = await res.json();
          setItems(list);
          idxRef.current = 0;
          setCurrent(list[0] || null);
        }
      } catch {}
    })();

    // SSE subscribe
    try {
      const es = new EventSource('/api/announcements/stream');
      es.onmessage = (ev) => {
        try {
          const payload = JSON.parse(ev.data);
          if (payload && (payload.action === 'init' || payload.action === 'update')) {
            setItems(payload.announcements || []);
            idxRef.current = 0;
            setCurrent((payload.announcements && payload.announcements[0]) || null);
          }
        } catch { /* ignore parse errors */ }
      };
      es.onerror = () => {
        // close after error; will keep existing items and rely on polling fallback
        es.close();
      };
      esRef.current = es;
    } catch (e) {
      // EventSource may fail in some environments — ignore
    }

    return () => {
      if (esRef.current) {
        esRef.current.close();
      }
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!items || items.length === 0) {
      setCurrent(null);
      return;
    }
    // cycle through items
    setCurrent(items[idxRef.current] || null);
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      idxRef.current = (idxRef.current + 1) % items.length;
      setCurrent(items[idxRef.current]);
    }, intervalMs);
    return () => { if (timerRef.current) window.clearInterval(timerRef.current); };
  }, [items, intervalMs]);

  if (!current) return null;

  // render marquee-like continuous loop
  return (
    <div className="w-full bg-yellow-50 border-y border-yellow-200">
      <div className="max-w-screen-xl mx-auto px-4 py-2">
        <div className="overflow-hidden whitespace-nowrap">
          <div style={{ display: 'inline-block', paddingRight: 40, animation: 'marquee 18s linear infinite' }}>
            <span className="mr-4">{current.text}</span>
            <span className="text-slate-500">— By {current.addedByName || 'Staff'}</span>
            {/* Duplicate for continuous effect */}
            <span className="mx-6">{current.text}</span>
            <span className="text-slate-500">— By {current.addedByName || 'Staff'}</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
