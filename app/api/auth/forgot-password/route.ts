import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import User from '@/models/User';
import crypto from 'crypto';
import sendForgotPasswordEmail from '@/lib/email/sendForgotPasswordEmail';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        await dbConnect();
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            // Return success even if user not found to prevent email enumeration
            return NextResponse.json({ ok: true, message: 'If an account exists with that email, a reset link has been sent.' });
        }

        // Generate token
        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 3600000); // 1 hour from now

        user.resetPasswordToken = token;
        user.resetPasswordExpires = expires;
        await user.save();

        await sendForgotPasswordEmail({ to: user.email, token });

        return NextResponse.json({ ok: true, message: 'If an account exists with that email, a reset link has been sent.' });
    } catch (error: any) {
        console.error('forgot-password error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
