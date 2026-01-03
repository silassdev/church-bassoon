'use client';
import { useEffect, useRef, useState } from 'react';
import { Megaphone, X, ChevronRight, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Announcement = { _id: string; text: string; addedByName?: string; createdAt?: string };

export default function AnnouncementBanner({ intervalMs = 8000 }: { intervalMs?: number }) {
  const [items, setItems] = useState<Announcement[]>([]);
  const idxRef = useRef(0);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // initial fetch
    (async () => {
      try {
        const res = await fetch('/api/announcements?limit=10');
        if (res.ok) {
          const list = await res.json();
          setItems(Array.isArray(list) ? list : []);
        }
      } catch { }
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
            setCurrentIdx(0);
          }
        } catch { /* ignore */ }
      };
      es.onerror = () => { es.close(); };
      esRef.current = es;
    } catch (e) { }

    return () => {
      if (esRef.current) esRef.current.close();
    };
  }, []);

  useEffect(() => {
    if (items.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % items.length);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [items, intervalMs]);

  if (!items.length || !isVisible) return null;

  const current = items[currentIdx];

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 px-4 pointer-events-none">
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="max-w-3xl mx-auto pointer-events-auto"
      >
        <div className="relative overflow-hidden bg-slate-900/90 dark:bg-indigo-950/90 backdrop-blur-xl border border-white/10 shadow-2xl rounded-[2rem] p-1 shadow-indigo-500/10">
          <div className="flex items-center gap-4 px-5 py-3">
            <div className="flex-shrink-0 w-10 h-10 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
              <Megaphone size={20} className="animate-pulse" />
            </div>

            <div className="flex-1 relative h-6 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIdx}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.5, ease: "circOut" }}
                  className="flex items-center gap-3 whitespace-nowrap overflow-hidden text-ellipsis"
                >
                  <span className="text-white font-bold text-sm tracking-tight truncate">
                    {current.text}
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <Bell size={10} /> Latest
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-2 pl-4 border-l border-white/10">
              {items.length > 1 && (
                <div className="hidden sm:flex items-center gap-1 px-2">
                  {items.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 rounded-full transition-all duration-500 ${i === currentIdx ? 'w-4 bg-indigo-500' : 'w-1 bg-white/20'}`}
                    />
                  ))}
                </div>
              )}
              <button
                onClick={() => setIsVisible(false)}
                className="p-1.5 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Animated Progress Bar for Timer */}
          {items.length > 1 && (
            <motion.div
              key={`bar-${currentIdx}`}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: intervalMs / 1000, ease: "linear" }}
              className="h-0.5 w-full bg-indigo-500 origin-left absolute bottom-0 left-0 opacity-50"
            />
          )}
        </div>
      </motion.div>
    </div>
  );
}
