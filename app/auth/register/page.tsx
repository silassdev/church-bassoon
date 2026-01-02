'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import { FiUser, FiMail, FiLock, FiShield, FiArrowRight, FiAlertCircle, FiCheck } from 'react-icons/fi';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

declare global {
    interface Window { grecaptcha: any; }
}

export default function RegisterPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'member' | 'coordinator'>('member');
    const [msg, setMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [formLoadTs, setFormLoadTs] = useState<number | null>(null);
    const [emailConfirm, setEmailConfirm] = useState(''); // hidden mirror

    useEffect(() => {
        setFormLoadTs(Date.now());
        setEmailConfirm(email);
        const key = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
        if (!key) return;
        if (document.querySelector(`#recaptcha-script`)) return;
        const s = document.createElement('script');
        s.id = 'recaptcha-script';
        s.src = `https://www.google.com/recaptcha/api.js?render=${key}`;
        s.async = true;
        document.head.appendChild(s);
    }, []);

    useEffect(() => {
        setEmailConfirm(email);
    }, [email]);

    async function getReCaptchaToken() {
        const key = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
        if (!key) return null;
        if (!window.grecaptcha) {
            await new Promise(res => setTimeout(res, 500));
            if (!window.grecaptcha) return null;
        }
        try {
            const token = await window.grecaptcha.execute(key, { action: 'register' });
            return token;
        } catch {
            return null;
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setMsg('');
        setLoading(true);

        const token = await getReCaptchaToken();
        if (!token) {
            setMsg('reCAPTCHA failed to load. Try again.');
            setLoading(false);
            return;
        }

        const payload = {
            email,
            password,
            name,
            role,
            recaptchaToken: token,
            hp_field: (document.getElementById('hp_field') as HTMLInputElement)?.value || '',
            email_confirm: emailConfirm,
            form_load_ts: formLoadTs,
        };

        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) {
            setMsg(data?.error || 'Error');
        } else {
            setMsg('Registration successful. Check your email for verification.');
        }
        setLoading(false);
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] -z-10" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] -z-10" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-xl w-full"
            >
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Create Account</h1>
                    <p className="text-slate-500 dark:text-slate-400">Join our community and start your journey</p>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-2xl">

                    {/* Role Selection */}
                    <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-8">
                        <button
                            type="button"
                            onClick={() => setRole('member')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${role === 'member' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            <FiUser />
                            Member
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole('coordinator')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${role === 'coordinator' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            <FiShield />
                            Coordinator
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Full Name</label>
                                <div className="relative group">
                                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                    <input
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        placeholder="John Doe"
                                        className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 transition-all outline-none"
                                        autoComplete="name"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Email</label>
                                <div className="relative group">
                                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                    <input
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="john@example.com"
                                        className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 transition-all outline-none"
                                        autoComplete="email"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Password</label>
                            <div className="relative group">
                                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                <input
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    type="password"
                                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 transition-all outline-none"
                                    autoComplete="new-password"
                                />
                            </div>
                        </div>

                        {/* HONEYPOT / hidden fields */}
                        <div aria-hidden className="sr-only" style={{ position: 'absolute', left: '-10000px', top: 'auto' }}>
                            <label>Do not fill: <input id="hp_field" name="hp_field" type="text" autoComplete="off" /></label>
                            <input id="email_confirm" name="email_confirm" type="hidden" value={emailConfirm} readOnly />
                            <input id="form_load_ts" name="form_load_ts" type="hidden" value={formLoadTs ?? ''} readOnly />
                        </div>

                        {msg && (
                            <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`p-4 rounded-xl flex items-center gap-3 text-sm border ${msg.includes('successful')
                                    ? 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/20'
                                    : 'bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/20'}`}
                            >
                                {msg.includes('successful') ? <FiCheck className="flex-shrink-0" /> : <FiAlertCircle className="flex-shrink-0" />}
                                {msg}
                            </motion.div>
                        )}

                        <button
                            disabled={loading}
                            type="submit"
                            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl disabled:opacity-50 text-white ${role === 'member' ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'}`}
                        >
                            {loading ? 'Processing...' : `Register as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
                            {!loading && <FiArrowRight />}
                        </button>
                    </form>

                    <div className="relative my-10 text-center">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                        </div>
                        <span className="relative bg-white dark:bg-slate-900 px-4 text-xs font-bold uppercase tracking-widest text-slate-400">Or use social</span>
                    </div>

                    <button
                        onClick={() => signIn('google')}
                        className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all font-bold text-slate-700 dark:text-slate-200"
                    >
                        <FcGoogle size={24} />
                        Sign up with Google
                    </button>
                </div>

                <p className="mt-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                    Already have an account? <Link href="/auth/signin" className="text-indigo-600 font-bold hover:underline">Sign in here</Link>
                </p>
            </motion.div>
        </div>
    );
}
