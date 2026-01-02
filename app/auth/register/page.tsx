'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
        setEmailConfirm(email); // keep mirror in sync
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
            // honeypot fields:
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
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-slate-800 shadow p-6 rounded">
                <h1 className="text-xl mb-4">Register</h1>

                <form onSubmit={handleSubmit} className="space-y-3" autoComplete="off">
                    <input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Full name"
                        className="w-full p-2 border rounded"
                        autoComplete="name"
                    />

                    <input
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="Email"
                        className="w-full p-2 border rounded"
                        autoComplete="email"
                        required
                    />

                    <input
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Password"
                        type="password"
                        className="w-full p-2 border rounded"
                        autoComplete="new-password"
                    />

                    <div>
                        <label className="mr-2">
                            <input type="radio" checked={role === 'member'} onChange={() => setRole('member')} /> Member
                        </label>
                        <label className="ml-4">
                            <input type="radio" checked={role === 'coordinator'} onChange={() => setRole('coordinator')} /> Coordinator
                        </label>
                    </div>

                    {/* HONEYPOT / hidden fields */}
                    <div aria-hidden className="sr-only" style={{ position: 'absolute', left: '-10000px', top: 'auto' }}>
                        {/* Bots often fill inputs named like email/website/etc. Keep this non-obvious name. */}
                        <label>Do not fill: <input id="hp_field" name="hp_field" type="text" autoComplete="off" /></label>
                        {/* Hidden mirror that should match visible email */}
                        <input id="email_confirm" name="email_confirm" type="hidden" value={emailConfirm} readOnly />
                        {/* form load timestamp */}
                        <input id="form_load_ts" name="form_load_ts" type="hidden" value={formLoadTs ?? ''} readOnly />
                    </div>

                    <button disabled={loading} type="submit" className="w-full py-2 bg-emerald-600 text-white rounded">
                        {loading ? 'Submitting...' : 'Register'}
                    </button>
                </form>

                {msg && <p className="mt-3">{msg}</p>}
                <p className="mt-4 text-sm">
                    Or sign in <a href="/auth/signin" className="text-indigo-600">here</a>.
                </p>
            </div>
        </div>
    );
}
