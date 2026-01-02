'use client';
import { useSearchParams } from 'next/navigation';

export default function AuthError() {
    const params = useSearchParams();
    const error = params.get('error') || 'Unknown';

    let message = 'An error occurred';
    if (error === 'use-credentials') message = 'Account exists with email/password. Sign in with your password.';
    if (error === 'OAuthAccountNotLinked') message = 'This email is linked with a different sign-in method.';
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="p-6 bg-white rounded shadow">
                <h1 className="text-xl mb-2">Sign-in error</h1>
                <p>{message}</p>
                <a href="/auth/signin" className="text-indigo-600 mt-3 block">Back to sign in</a>
            </div>
        </div>
    );
}
