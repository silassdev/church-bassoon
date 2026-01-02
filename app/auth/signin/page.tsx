'use client';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import { FiMail, FiLock, FiArrowRight, FiAlertCircle } from 'react-icons/fi';
import Link from 'next/link';

export default function SignInPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [err, setErr] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleCredentials(e: React.FormEvent) {
        e.preventDefault();
        setErr('');
        setLoading(true);
        const res = await signIn('credentials', { redirect: false, email, password });
        if (res?.error) {
            setErr(res.error);
            setLoading(false);
        }
        if (res?.ok) router.push('/dashboard');
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -z-10" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] -z-10" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full"
            >
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 mb-6 font-black text-2xl">
                        C
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Welcome Back</h1>
                    <p className="text-slate-500 dark:text-slate-400">Continue your ministry management journey</p>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2rem] shadow-2xl relative">
                    {/* Google Sign In */}
                    <button
                        onClick={() => signIn('google')}
                        className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all font-bold text-slate-700 dark:text-slate-200"
                    >
                        <FcGoogle size={24} />
                        Continue with Google
                    </button>

                    <div className="relative my-8 text-center">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                        </div>
                        <span className="relative bg-white dark:bg-slate-900 px-4 text-xs font-bold uppercase tracking-widest text-slate-400">Or use email</span>
                    </div>

                    <form onSubmit={handleCredentials} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Email Address</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                    <FiMail />
                                </div>
                                <input
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Password</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                    <FiLock />
                                </div>
                                <input
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    type="password"
                                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all outline-none"
                                />
                            </div>
                        </div>

                        {err && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-2 p-4 rounded-xl bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-sm border border-red-100 dark:border-red-900/20"
                            >
                                <FiAlertCircle className="flex-shrink-0" />
                                {err}
                            </motion.div>
                        )}

                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50"
                        >
                            {loading ? 'Signing in...' : 'Sign in to Platform'}
                            {!loading && <FiArrowRight />}
                        </button>
                    </form>
                </div>

                <p className="mt-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                    New to ChurchDev? <Link href="/auth/register" className="text-indigo-600 font-bold hover:underline">Create an account</Link>
                </p>
            </motion.div>
        </div>
    );
}
