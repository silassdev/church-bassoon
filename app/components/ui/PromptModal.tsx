'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertCircle, FiX } from 'react-icons/fi';
import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'info' | 'success' | 'warning';
};

export default function PromptModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'info'
}: Props) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const typeConfig = {
        danger: {
            btn: 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20',
            icon: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600',
        },
        info: {
            btn: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20',
            icon: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600',
        },
        success: {
            btn: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20',
            icon: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600',
        },
        warning: {
            btn: 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20',
            icon: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600',
        },
    };

    const config = typeConfig[type];

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800"
                    >
                        <div className="p-8">
                            <div className="flex items-start justify-between mb-6">
                                <div className={`p-3 rounded-2xl ${config.icon}`}>
                                    <FiAlertCircle size={24} />
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                >
                                    <FiX size={20} />
                                </button>
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                {title}
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                                {message}
                            </p>

                            <div className="mt-8 flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-6 py-3 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-colors"
                                >
                                    {cancelText}
                                </button>
                                <button
                                    onClick={() => {
                                        onConfirm();
                                        onClose();
                                    }}
                                    className={`flex-1 px-6 py-3 text-white font-bold rounded-2xl shadow-lg transition-all active:scale-95 ${config.btn}`}
                                >
                                    {confirmText}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}
