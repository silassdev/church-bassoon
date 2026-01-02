import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session || (session as any).user?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        console.log('[PATCH] User ID:', id);
        const body = await req.json();
        const { status } = body;
        console.log('[PATCH] New Status:', status);

        const user = await User.findById(id);
        if (!user) {
            console.log('[PATCH] User not found in DB');
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        user.status = status;
        await user.save();
        console.log('[PATCH] Update successful');

        return NextResponse.json({ success: true, user });
    } catch (err: any) {
        console.error('[PATCH] Error:', err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session || (session as any).user?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
