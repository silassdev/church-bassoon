import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcrypt';

export async function POST(req: Request) {
    try {
        const { token, password } = await req.json();

        if (!token || !password) {
            return NextResponse.json({ error: 'Token and new password are required' }, { status: 400 });
        }

        if (password.length < 8) {
            return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
        }

        await dbConnect();
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return NextResponse.json({ error: 'Password reset token is invalid or has expired' }, { status: 400 });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(12);
        user.passwordHash = await bcrypt.hash(password, salt);

        // Clear reset token fields
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;

        await user.save();

        return NextResponse.json({ ok: true, message: 'Password has been reset successfully.' });
    } catch (error: any) {
        console.error('reset-password error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
