'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, ExternalLink, ArrowLeft, User, Shield } from 'lucide-react';

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
};

export default function EventDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadEvent() {
            try {
                const res = await fetch(`/api/events/route`);
                if (res.ok) {
                    const events = await res.json();
                    const foundEvent = events.find((e: Event) => e._id === params?.id);
                    setEvent(foundEvent || null);
                }
            } catch (err) {
                console.error('Failed to load event:', err);
            } finally {
                setLoading(false);
            }
        }
        if (params?.id) loadEvent();
    }, [params?.id]);

    if (loading) {
        return (
            <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse mb-8" />
                        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse mb-4 w-2/3" />
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse w-1/2" />
                    </div>
                </div>
            </main>
        );
    }

    if (!event) {
        return (
            <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-20">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl font-black mb-4">Event Not Found</h1>
                    <button
                        onClick={() => router.push('/events')}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all"
                    >
                        Back to Events
                    </button>
                </div>
            </main>
        );
    }

    const startDate = new Date(event.startAt);
    const endDate = new Date(event.endAt);
    const isPast = endDate.getTime() < Date.now();

    return (
        <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-20">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Back Button */}
                    <button
                        onClick={() => router.push('/events')}
                        className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-8 font-medium"
                    >
                        <ArrowLeft size={20} />
                        Back to Events
                    </button>

                    {/* Banner */}
                    {event.bannerUrl && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative h-96 w-full rounded-3xl overflow-hidden mb-8"
                        >
                            <img
                                src={event.bannerUrl}
                                alt={event.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        </motion.div>
                    )}

                    {/* Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl"
                    >
                        <div className="flex items-start justify-between gap-4 mb-6">
                            <h1 className="text-4xl font-black text-slate-900 dark:text-white">
                                {event.title}
                            </h1>
                            {isPast && (
                                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase rounded-full">
                                    Past Event
                                </span>
                            )}
                        </div>

                        {/* Date & Time */}
                        <div className="grid md:grid-cols-2 gap-4 mb-6">
                            <div className="flex items-start gap-3 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl">
                                <Calendar className="text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" size={20} />
                                <div>
                                    <div className="text-xs font-bold uppercase text-slate-400 mb-1">Start</div>
                                    <div className="font-bold text-slate-900 dark:text-white">
                                        {startDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </div>
                                    <div className="text-sm text-slate-500 dark:text-slate-400">
                                        {startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
                                <Clock className="text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" size={20} />
                                <div>
                                    <div className="text-xs font-bold uppercase text-slate-400 mb-1">End</div>
                                    <div className="font-bold text-slate-900 dark:text-white">
                                        {endDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </div>
                                    <div className="text-sm text-slate-500 dark:text-slate-400">
                                        {endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Location */}
                        {event.location && (
                            <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl mb-6">
                                <MapPin className="text-slate-400 flex-shrink-0" size={20} />
                                <div>
                                    <div className="text-xs font-bold uppercase text-slate-400 mb-1">Location</div>
                                    <div className="font-medium text-slate-900 dark:text-white">{event.location}</div>
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        {event.description && (
                            <div className="mb-6">
                                <h3 className="text-sm font-bold uppercase text-slate-400 mb-3">About This Event</h3>
                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                                    {event.description}
                                </p>
                            </div>
                        )}

                        {/* URL */}
                        {event.url && (
                            <a
                                href={event.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all mb-6"
                            >
                                <ExternalLink size={18} />
                                Join Event / More Info
                            </a>
                        )}

                        {/* Creator Info */}
                        {event.createdByName && (
                            <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center text-white">
                                        {event.createdByRole === 'admin' ? <Shield size={20} /> : <User size={20} />}
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold uppercase text-slate-400">Created By</div>
                                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            {event.createdByName}
                                            {event.createdByRole && (
                                                <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase rounded-full">
                                                    {event.createdByRole}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </main>
    );
}
