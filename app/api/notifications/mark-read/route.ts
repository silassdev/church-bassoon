import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Notification from '@/models/Notification';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await req.json();
  await dbConnect();
  const n = await Notification.findById(id);
  if (!n || String(n.user) !== (session as any).user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  n.read = true; await n.save();
  return NextResponse.json({ ok: true });
}
