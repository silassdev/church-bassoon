'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Megaphone, User } from 'lucide-react';

type Notice = {
    _id: string;
    text: string;
    addedByName?: string;
    createdAt: string;
    active: boolean;
};

export default function NoticeBanner() {
    const [notice, setNotice] = useState<Notice | null>(null);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (notice && isVisible) {
            const timer = setTimeout(() => setIsVisible(false), 10000);
            return () => clearTimeout(timer);
        }
    }, [notice, isVisible]);

    useEffect(() => {
        // Load the most recent active announcement
        async function loadNotice() {
            try {
                const res = await fetch('/api/announcements/preview');
                if (res.ok) {
                    const data = await res.json();
                    const activeNotices = data.filter((n: Notice) => n.active);
                    if (activeNotices.length > 0) {
                        setNotice(activeNotices[0]); // Get most recent
                    }
                }
            } catch (err) {
                console.error('Failed to load notice:', err);
            }
        }

        loadNotice();

        // Subscribe to real-time updates
        let es: EventSource | null = null;
        try {
            es = new EventSource('/api/announcements/stream');
            es.onmessage = (ev) => {
                try {
                    const payload = JSON.parse(ev.data);
                    if (payload && (payload.action === 'init' || payload.action === 'update')) {
                        const announcements = payload.announcements || [];
                        if (announcements.length > 0) {
                            setNotice(announcements[0]); // Most recent active
                            setIsVisible(true); // Show banner again when new notice arrives
                        } else {
                            setNotice(null);
                        }
                    }
                } catch { }
            };
            es.onerror = () => es?.close();
        } catch { }

        return () => es?.close();
    }, []);

    if (!notice || !isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -100, opacity: 0 }}
                className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-indigo-600 to-emerald-600 text-white shadow-lg"
            >
                <div className="relative overflow-hidden">
                    <div className="container mx-auto px-4 py-3">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <Megaphone size={20} className="flex-shrink-0" />

                                {/* Marquee container */}
                                <div className="flex-1 overflow-hidden">
                                    <motion.div
                                        className="whitespace-nowrap"
                                        animate={{ x: ['0%', '-50%'] }}
                                        transition={{
                                            duration: 20,
                                            repeat: Infinity,
                                            ease: 'linear'
                                        }}
                                    >
                                        <span className="inline-block pr-20">
                                            <span className="font-bold">{notice.text}</span>
                                            {' '}•{' '}
                                            <span className="text-white/80 text-sm">
                                                Posted by {notice.addedByName || 'System'} • {new Date(notice.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {new Date(notice.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </span>
                                        {/* Duplicate for seamless loop */}
                                        <span className="inline-block pr-20">
                                            <span className="font-bold">{notice.text}</span>
                                            {' '}•{' '}
                                            <span className="text-white/80 text-sm">
                                                Posted by {notice.addedByName || 'System'} • {new Date(notice.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {new Date(notice.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </span>
                                    </motion.div>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsVisible(false)}
                                className="flex-shrink-0 p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                                aria-label="Close notice"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
