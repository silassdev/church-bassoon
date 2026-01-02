import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: Request) {
    const { coordinatorId } = await req.json();
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const u = await User.findById(coordinatorId);
    if (!u || u.role !== 'coordinator') return NextResponse.json({ error: 'Not found' }, { status: 404 });

    u.status = 'active';
    u.approvedBy = (session.user as any).id;
    await u.save();

    return NextResponse.json({ ok: true });
}
