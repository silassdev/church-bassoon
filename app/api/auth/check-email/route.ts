import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import User from '@/models/User';
import Payment from '@/models/Payment';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        await dbConnect();
        const session = await getServerSession(authOptions);
        const currentUserEmail = session ? (session as any).user.email : null;

        // Check if email exists in User collection
        const existingUser = await User.findOne({ email: email.toLowerCase() });

        // If user exists and it's not the current logged-in user
        if (existingUser && currentUserEmail !== email.toLowerCase()) {
            return NextResponse.json({
                available: false,
                reason: 'account_exists',
                message: 'Looks like you already have an account. Login and visit this page to sync your payment or use a different email.'
            }, { status: 200 });
        }

        // If email exists as the current user OR doesn't exist at all, allow
        // (guest payments are fine, registered users can make payments)
        return NextResponse.json({
            available: true,
            isCurrentUser: currentUserEmail === email.toLowerCase()
        }, { status: 200 });

    } catch (error) {
        console.error('Email check error:', error);
        return NextResponse.json({ error: 'Failed to validate email' }, { status: 500 });
    }
}
