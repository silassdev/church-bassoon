import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Ticket from '@/models/Ticket';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await dbConnect();
  const list = await Ticket.find({ user: (session as any).user.id }).sort({ createdAt: -1 }).lean();
  return NextResponse.json(list);
}