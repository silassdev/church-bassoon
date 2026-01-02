'use client';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiArrowRight } from 'react-icons/fi';
import Link from 'next/link';

export default function VerifySuccess() {
    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px] -z-10" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full text-center"
            >
                <div className="mb-8 flex justify-center">
                    <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <FiCheckCircle size={48} />
                    </div>
                </div>

                <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Email Verified!</h1>
                <p className="text-slate-600 dark:text-slate-400 mb-10 leading-relaxed italic">
                    "Your journey with ChurchDev has officially begun. We're excited to have you with us."
                </p>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-xl mb-10">
                    <p className="text-sm text-slate-500 dark:text-slate-300 leading-relaxed">
                        If you registered as a <span className="font-bold text-emerald-600">Coordinator</span>, your account is now pending admin approval.
                        Members can proceed to sign in immediately.
                    </p>
                </div>

                <Link
                    href="/auth/signin"
                    className="inline-flex items-center gap-2 px-10 py-5 rounded-2xl bg-indigo-600 text-white font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20"
                >
                    Proceed to Sign In
                    <FiArrowRight />
                </Link>
            </motion.div>
        </div>
    );
}