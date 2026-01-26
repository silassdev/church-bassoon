'use client';
import useNotifications from './useNotifications';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiCheckCircle, FiExternalLink, FiClock, FiTrash2, FiInbox } from 'react-icons/fi';
import Link from 'next/link';

export default function HeaderNotifications() {
  const { items, unreadCount, reload, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleMarkRead(id: string) {
    const res = await fetch('/api/notifications/mark-read', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id })
    });
    if (res.ok) reload();
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className={`relative p-2 rounded-xl transition-all ${open ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
      >
        <FiBell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-3 w-[22rem] sm:w-[26rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-2xl z-[100] overflow-hidden"
          >
            <div className="p-5 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Notifications</h3>
                <p className="text-[10px] text-slate-500 font-bold">{unreadCount} unread messages</p>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-500 transition-colors flex items-center gap-1"
                >
                  <FiCheckCircle /> Mark all read
                </button>
              )}
            </div>

            <div className="max-h-[28rem] overflow-y-auto custom-scrollbar">
              {items.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                    <FiInbox size={32} />
                  </div>
                  <p className="text-sm text-slate-500 font-medium">All caught up!</p>
                  <p className="text-xs text-slate-400 mt-1">No new notifications at this time.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50 dark:divide-slate-800">
                  {items.map(n => (
                    <div
                      key={n._id}
                      className={`p-5 transition-colors group relative ${n.read ? 'opacity-60 grayscale-[0.5]' : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/40'}`}
                    >
                      {!n.read && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-r-full" />
                      )}

                      <div className="flex gap-4">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${n.read ? 'bg-slate-100 text-slate-400' : 'bg-indigo-50 text-indigo-500 dark:bg-indigo-900/20'}`}>
                          <FiBell size={18} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className={`text-sm font-bold truncate ${n.read ? 'text-slate-600' : 'text-slate-900 dark:text-white'}`}>
                              {n.title}
                            </h4>
                            <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1 flex-shrink-0">
                              <FiClock size={10} /> {new Date(n.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          {n.body && (
                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
                              {n.body}
                            </p>
                          )}

                          <div className="flex items-center gap-3">
                            {!n.read && (
                              <button
                                onClick={() => handleMarkRead(n._id)}
                                className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 hover:underline"
                              >
                                Mark as read
                              </button>
                            )}
                            {n.url && (
                              <Link
                                href={n.url}
                                onClick={() => { setOpen(false); handleMarkRead(n._id); }}
                                className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-1"
                              >
                                <FiExternalLink size={12} /> Open Link
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
