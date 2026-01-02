import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import sendVerificationEmail from '@/lib/email/sendVerificationEmail';
import { isLimited } from '@/lib/rateLimit';
import { UserRole, AuthProvider } from '@/lib/constants';


function getIpFromReq(req: Request) {
    const xff = req.headers.get('x-forward-for');
    if (xff) return xff.split(',')[0].trim();
    const cf = req.headers.get('cf-connecting-ip');
    if (cf) return cf;
    return req.headers.get('x-real-ip') || 'unknown';
}

function isBotUserAgent(ua?: string | null) {
    if (!ua) return false;
    const botSignatures = ['curl', 'bot', 'spider', 'crawler', 'python-requests', 'wget', 'headless']; // extend as needed
    const lower = ua.toLowerCase();
    return botSignatures.some(sig => lower.includes(sig));
}

const MIN_FORM_FILL_SECONDS = Number(process.env.MIN_FORM_FILL_SECONDS || 2); // minimum human fill time

export async function POST(req: Request) {
    const raw = await req.json().catch(() => ({}));
    const {
        email,
        password,
        name,
        role,
        hp_field,
        email_confirm,
        form_load_ts,
    } = raw || {};

    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

    const ip = getIpFromReq(req);
    const limiterKey = `register:${ip}`;

    // Rate limit: using in-memory isLimited
    const resLimit = isLimited(limiterKey);
    if (resLimit.limited) {
        return NextResponse.json({ error: 'Too many requests', retryAfter: resLimit.resetSeconds }, { status: 429 });
    }

    // --- HONEYPOT / HEURISTICS CHECKS ---
    const ua = req.headers.get('user-agent') || '';
    const nowMs = Date.now();

    // 1) obvious user-agent bots
    if (isBotUserAgent(ua)) {
        // increment separate counter for bot attempts
        isLimited(`hp:${ip}`);
        console.warn('Honeypot blocked by UA', { ip, ua, email });
        return NextResponse.json({ error: 'Invalid submission' }, { status: 400 });
    }

    // 2) hp_field must be empty
    if (hp_field && (String(hp_field).trim().length > 0)) {
        isLimited(`hp:${ip}`);
        console.warn('Honeypot triggered (hp_field filled)', { ip, email });
        return NextResponse.json({ error: 'Invalid submission' }, { status: 400 });
    }

    // 3) email_confirm must match visible email (simple anti-bot check)
    if (String((email_confirm || '')).toLowerCase() !== String((email || '')).toLowerCase()) {
        isLimited(`hp:${ip}`);
        console.warn('Honeypot triggered (email_confirm mismatch)', { ip, email, email_confirm });
        return NextResponse.json({ error: 'Invalid submission' }, { status: 400 });
    }

    // 4) speed check: require at least MIN_FORM_FILL_SECONDS between form load and submit
    const tsNum = Number(form_load_ts || 0);
    if (!isNaN(tsNum) && tsNum > 0) {
        const deltaSec = (nowMs - tsNum) / 1000;
        if (deltaSec < MIN_FORM_FILL_SECONDS) {
            isLimited(`hp:${ip}`);
            console.warn('Honeypot triggered (too fast)', { ip, email, deltaSec });
            return NextResponse.json({ error: 'Invalid submission' }, { status: 400 });
        }
    } else {
        // suspicious if no timestamp provided
        isLimited(`hp:${ip}`);
        console.warn('Honeypot triggered (no form_load_ts)', { ip, email });
        return NextResponse.json({ error: 'Invalid submission' }, { status: 400 });
    }

    // --- reCAPTCHA verification removed ---

    // --- proceed with normal registration ---
    await dbConnect();

    const existing = await User.findOne({ email: String(email).toLowerCase() });
    if (existing) return NextResponse.json({ error: 'Email already registered' }, { status: 409 });

    const passwordHash = password ? await bcrypt.hash(password, 12) : null;
    const token = randomBytes(32).toString('hex');

    const user = await User.create({
        email: String(email).toLowerCase(),
        name,
        passwordHash,
        role: role === UserRole.COORDINATOR ? UserRole.COORDINATOR : UserRole.MEMBER,
        status: 'unverified',
        verificationToken: token,
        provider: AuthProvider.CREDENTIALS,
    });

    try {
        await sendVerificationEmail({ to: email, token, userId: user._id.toString() });
    } catch (e) {
        await User.deleteOne({ _id: user._id }).catch(() => { });
        return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
}
