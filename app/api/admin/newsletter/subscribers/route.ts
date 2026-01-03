import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Subscriber from '@/models/Subscriber';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || (session as any).user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    try {
        const subs = await Subscriber.find().sort({ createdAt: -1 }).lean();
        return NextResponse.json(subs);
    } catch (err) {
        return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 });
    }
}
