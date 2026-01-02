'use client';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiAlertTriangle, FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';
import { Suspense } from 'react';

function ErrorContent() {
    const params = useSearchParams();
    const error = params.get('error') || 'Unknown';

    let message = 'An unexpected authentication error occurred.';
    if (error === 'use-credentials') message = 'This email is already registered with a password. Please sign in with your credentials.';
    if (error === 'OAuthAccountNotLinked') message = 'This email is linked with a different provider. Use your original sign-in method.';
    if (error === 'Configuration') message = 'There is a server configuration issue. Please contact support.';
    if (error === 'AccessDenied') message = 'Access was denied. You may not have permission to access this resource.';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full text-center"
        >
            <div className="mb-8 flex justify-center">
                <div className="w-20 h-20 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                    <FiAlertTriangle size={40} />
                </div>
            </div>

            <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Authentication Error</h1>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-xl mb-10">
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {message}
                </p>
                <div className="mt-4 text-xs font-mono text-slate-400 uppercase tracking-widest">
                    Code: {error}
                </div>
            </div>

            <Link
                href="/auth/signin"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold hover:scale-105 transition-all shadow-lg"
            >
                <FiArrowLeft />
                Back to Sign In
            </Link>
        </motion.div>
    );
}

export default function AuthError() {
    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/5 rounded-full blur-[100px] -z-10" />
            <Suspense fallback={<div>Loading...</div>}>
                <ErrorContent />
            </Suspense>
        </div>
    );
}
