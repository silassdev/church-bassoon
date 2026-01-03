import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Announcement from '@/models/Announcement';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { AnnounceBroadcaster } from '@/lib/sse';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = params;
  const { text, active } = await req.json();
  await dbConnect();
  const a = await Announcement.findById(id);
  if (!a) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // allow admin or creator
  const userId = (session as any).user.id;
  const role = (session as any).user.role;
  if (role !== 'admin' && String(a.addedBy) !== String(userId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (text !== undefined) a.text = String(text).trim();
  if (active !== undefined) a.active = Boolean(active);

  await a.save();

  const latest = await Announcement.find({ active: true }).sort({ createdAt: -1 }).limit(50).lean();
  try { AnnounceBroadcaster.broadcast(JSON.stringify({ action: 'update', announcements: latest })); } catch (e) {}

  return NextResponse.json(a);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = params;
  await dbConnect();
  const a = await Announcement.findById(id);
  if (!a) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const userId = (session as any).user.id;
  const role = (session as any).user.role;
  // allow admin to delete any; allow creator to delete own
  if (role !== 'admin' && String(a.addedBy) !== String(userId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await Announcement.deleteOne({ _id: id });

  const latest = await Announcement.find({ active: true }).sort({ createdAt: -1 }).limit(50).lean();
  try { AnnounceBroadcaster.broadcast(JSON.stringify({ action: 'update', announcements: latest })); } catch (e) {}

  return NextResponse.json({ ok: true });
}
