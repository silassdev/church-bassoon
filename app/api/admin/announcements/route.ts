import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Announcement from '@/models/Announcement';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { AnnounceBroadcaster } from '@/lib/sse';

export async function GET() {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session || (session as any).user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const items = await Announcement.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  // create announcement: coordinators and admins allowed
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { text, active = true } = await req.json();
  if (!text || typeof text !== 'string') return NextResponse.json({ error: 'Text required' }, { status: 400 });

  await dbConnect();
  const a = await Announcement.create({
    text: text.trim(),
    addedBy: (session as any).user.id,
    addedByName: (session as any).user.name || (session as any).user.email,
    addedByRole: (session as any).user.role,
    active: Boolean(active),
  });

  // broadcast a change event (send latest active list)
  const latest = await Announcement.find({ active: true }).sort({ createdAt: -1 }).limit(50).lean();
  try { AnnounceBroadcaster.broadcast(JSON.stringify({ action: 'update', announcements: latest })); } catch (e) { /* ignore */ }

  return NextResponse.json(a);
}
