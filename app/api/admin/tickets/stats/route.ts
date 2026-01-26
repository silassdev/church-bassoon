import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Ticket from '@/models/Ticket';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || !['coordinator', 'admin'].includes((session as any).user.role)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const total = await Ticket.countDocuments();
    const resolved = await Ticket.countDocuments({ status: 'resolved' });
    const closed = await Ticket.countDocuments({ status: 'closed' });
    const open = await Ticket.countDocuments({ status: 'open' });
    const pending = await Ticket.countDocuments({ status: 'pending' });

    return NextResponse.json({
        total,
        resolved,
        closed,
        open,
        pending
    });
}
