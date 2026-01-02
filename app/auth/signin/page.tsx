'use client';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [err, setErr] = useState('');

    async function handleCredentials(e: React.FormEvent) {
        e.preventDefault();
        setErr('');
        const res = await signIn('credentials', { redirect: false, email, password });
        if (res?.error) setErr(res.error);
        if (res?.ok) router.push('/dashboard');
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-slate-800 shadow p-6 rounded">
                <h1 className="text-xl mb-4">Sign in</h1>

                <button
                    onClick={() => signIn('google')}
                    className="w-full py-2 mb-4 border rounded"
                >
                    Continue with Google
                </button>

                <form onSubmit={handleCredentials} className="space-y-3">
                    <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full p-2 border rounded" />
                    <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password" className="w-full p-2 border rounded" />
                    <button type="submit" className="w-full py-2 bg-indigo-600 text-white rounded">Sign in with email</button>
                </form>

                {err && <p className="mt-3 text-red-600">{err}</p>}
                <p className="mt-4 text-sm">
                    No account? <a href="/auth/register" className="text-indigo-600">Register</a>
                </p>
            </div>
        </div>
    );
}
