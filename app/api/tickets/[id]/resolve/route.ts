import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Ticket from '@/models/Ticket';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const role = (session as any).user.role;
    if (!['coordinator', 'admin'].includes(role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const { id } = await params;
    const t = await Ticket.findById(id);
    if (!t) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    t.status = 'resolved';
    t.resolvedAt = new Date();
    await t.save();

    return NextResponse.json({ ok: true });
}
