import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import User from '@/models/User';

export async function GET(req: Request) {
    const url = new URL(req.url);
    const token = url.searchParams.get('t');
    if (!token) return NextResponse.json({ error: 'Invalid token' }, { status: 400 });

    await dbConnect();
    const user = await User.findOne({ verificationToken: token });
    if (!user) return NextResponse.json({ error: 'Token not found' }, { status: 404 });

    user.verificationToken = undefined;
    if (user.role === 'member') {
        user.status = 'active'; // auto-activate members after email verify
    } else if (user.role === 'coordinator') {
        user.status = 'pending'; // coordinators wait for Admin approval
    }
    await user.save();

    // Return a simple page or redirect to a front-end page
    return NextResponse.redirect(new URL('/verify-success', req.url));
}
