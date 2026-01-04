'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, MapPin, ExternalLink, Clock, User, Shield } from 'lucide-react';

type EventData = {
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

type EventModalProps = {
    event: EventData | null;
    onClose: () => void;
};

export default function EventModal({ event, onClose }: EventModalProps) {
    if (!event) return null;

    const startDate = new Date(event.startAt);
    const endDate = new Date(event.endAt);
    const isPast = endDate.getTime() < Date.now();

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
                >
                    {/* Banner */}
                    {event.bannerUrl && (
                        <div className="relative h-48 w-full overflow-hidden">
                            <img
                                src={event.bannerUrl}
                                alt={event.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        </div>
                    )}

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-all shadow-lg z-10"
                    >
                        <X size={20} />
                    </button>

                    {/* Content */}
                    <div className="p-8">
                        <div className="flex items-start justify-between gap-4 mb-6">
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white">
                                {event.title}
                            </h2>
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
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
