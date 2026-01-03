import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Event from '@/models/Event';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { EventBroadcaster } from '@/lib/sse';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session as any).user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const items = await Event.find().sort({ startAt: -1 }).lean();
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { title, description, startAt, endAt, location, url, bannerUrl, active = true } = body;
  if (!title || !startAt || !endAt) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });

  await dbConnect();
  const e = await Event.create({
    title: String(title).trim(),
    description: String(description || '').trim(),
    startAt: new Date(startAt),
    endAt: new Date(endAt),
    location: String(location || '').trim(),
    url: String(url || '').trim(),
    bannerUrl: String(bannerUrl || '').trim(),
    active: Boolean(active),
    createdBy: (session as any).user.id,
    createdByName: (session as any).user.name || (session as any).user.email,
    createdByRole: (session as any).user.role,
  });


  const now = new Date();
  const upcoming = await Event.find({ active: true, endAt: { $gt: now } }).sort({ startAt: 1 }).limit(50).lean();
  try { EventBroadcaster.broadcast(JSON.stringify({ action: 'update', events: upcoming })); } catch (e) {}

  return NextResponse.json(e);
}
