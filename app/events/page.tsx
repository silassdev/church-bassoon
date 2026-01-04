'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, ExternalLink, Filter } from 'lucide-react';
import EventModal from '@/app/components/ui/EventModal';
import Link from 'next/link';

type Event = {
    _id: string;
    title: string;
    description?: string;
    startAt: string;
    endAt: string;
    location?: string;
    url?: string;
    bannerUrl?: string;
    createdByName?: string;
    createdByRole?: string;
    active: boolean;
};

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');

    useEffect(() => {
        async function loadEvents() {
            try {
                const res = await fetch('/api/events');
                if (res.ok) {
                    setEvents(await res.json());
                }
            } catch (err) {
                console.error('Failed to load events:', err);
            } finally {
                setLoading(false);
            }
        }
        loadEvents();
    }, []);

    const now = Date.now();
    const filteredEvents = events.filter(e => {
        const endTime = new Date(e.endAt).getTime();
        if (filter === 'upcoming') return endTime > now;
        if (filter === 'past') return endTime <= now;
        return true;
    });

    return (
        <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-20">
            <div className="container mx-auto px-4">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-5xl font-black mb-4 text-slate-900 dark:text-white">
                        Church Events
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">
                        Join us for worship, fellowship, and community activities throughout the year.
                    </p>
                </motion.div>

                {/* Filter */}
                <div className="flex justify-center gap-2 mb-12">
                    {(['all', 'upcoming', 'past'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${filter === f
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Events Grid */}
                {loading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-80 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
                        ))}
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div className="text-center py-20">
                        <Calendar className="mx-auto text-slate-300 mb-4" size={64} />
                        <h3 className="text-xl font-bold text-slate-400 mb-2">No {filter} events</h3>
                        <p className="text-slate-500">Check back later for upcoming activities!</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredEvents.map((event, index) => {
                            const isPast = new Date(event.endAt).getTime() <= now;
                            return (
                                <motion.div
                                    key={event._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    onClick={() => setSelectedEvent(event)}
                                    className="group relative h-80 rounded-3xl overflow-hidden cursor-pointer"
                                >
                                    {event.bannerUrl ? (
                                        <img
                                            src={event.bannerUrl}
                                            alt={event.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-emerald-500" />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                                        {isPast && (
                                            <span className="inline-block px-2 py-1 bg-white/20 rounded-full text-xs font-bold uppercase mb-2">
                                                Past Event
                                            </span>
                                        )}
                                        <h3 className="text-2xl font-bold mb-2">{event.title}</h3>
                                        <div className="flex items-center gap-4 text-sm text-slate-200">
                                            <span className="flex items-center gap-1.5">
                                                <Calendar size={14} />
                                                {new Date(event.startAt).toLocaleDateString()}
                                            </span>
                                            {event.location && (
                                                <span className="flex items-center gap-1.5">
                                                    <MapPin size={14} />
                                                    {event.location}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal */}
            {selectedEvent && (
                <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
            )}
        </main>
    );
}
