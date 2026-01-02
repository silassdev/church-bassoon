import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Ticket from '@/models/Ticket';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { subject, message } = await req.json();
  await dbConnect();
  const t = await Ticket.create({ user: (session as any).user.id, subject, message });
  return NextResponse.json(t);
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await dbConnect();
  const url = new URL(req.url);
  const q = url.searchParams.get('q') || '';

  // coordinator view: list all, optionally search by subject or user email
  if ((session as any).user.role === 'coordinator') {
    const filter: any = {};
    if (q) {
      const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ subject: re }, { message: re }];
    }
    const list = await Ticket.find(filter).sort({ createdAt: -1 }).limit(200).lean();
    return NextResponse.json(list);
  }

  // other roles not allowed here
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
