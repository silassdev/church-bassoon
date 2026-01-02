export default async function verifyReCaptcha(token: string, remoteIp?: string) {
    const secret = process.env.RECAPTCHA_SECRET;
    if (!secret) throw new Error('RECAPTCHA_SECRET not set');

    const form = new URLSearchParams();
    form.append('secret', secret);
    form.append('response', token);
    if (remoteIp) form.append('remoteip', remoteIp);

    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        body: form,
    });

    if (!res.ok) {
        return { ok: false, error: 'recaptcha-unreachable' };
    }

    const data = await res.json();
    // data has { success, score, action, ... } for v3 or { success } for v2
    if (!data.success) return { ok: false, error: 'recaptcha-failed', raw: data };

    // If it's v3, optionally check score threshold
    if (typeof data.score === 'number') {
        const minScore = Number(process.env.RECAPTCHA_MIN_SCORE || 0.5);
        if (data.score < minScore) return { ok: false, error: 'recaptcha-low-score', score: data.score, raw: data };
    }

    return { ok: true, raw: data };
}
