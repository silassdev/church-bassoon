import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Notification from '@/models/Notification';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await dbConnect();
  const limit = Math.min(100, Number(new URL(req.url).searchParams.get('limit') || 20));
  const list = await Notification.find({ user: (session as any).user.id }).sort({ createdAt: -1 }).limit(limit).lean();
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  // create notification: admin/coordinator may create notifications for users
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { userId, title, body, url } = await req.json();
  await dbConnect();
  if (!(session as any).user.role) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const n = await Notification.create({ user: userId, actor: (session as any).user.id, title, body, url, read: false });
  return NextResponse.json(n);
}
