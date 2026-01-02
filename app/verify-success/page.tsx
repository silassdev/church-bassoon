export default function VerifySuccess() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="p-6 bg-white rounded shadow">
                <h1 className="text-xl mb-2">Email verified</h1>
                <p className="mb-4">If you registered as a coordinator, your account is pending admin approval. Members can now sign in.</p>
                <a href="/auth/signin" className="text-indigo-600">Proceed to sign in</a>
            </div>
        </div>
    );
}