import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Event from '@/models/Event';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { EventBroadcaster } from '@/lib/sse';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = params.id;
  const body = await req.json().catch(() => ({}));
  await dbConnect();
  const e = await Event.findById(id);
  if (!e) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // allow admin or creator to edit
  const userId = (session as any).user.id;
  const role = (session as any).user.role;
  if (role !== 'admin' && String(e.createdBy) !== String(userId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (body.title !== undefined) e.title = String(body.title);
  if (body.description !== undefined) e.description = String(body.description);
  if (body.startAt !== undefined) e.startAt = new Date(body.startAt);
  if (body.endAt !== undefined) e.endAt = new Date(body.endAt);
  if (body.location !== undefined) e.location = String(body.location);
  if (body.url !== undefined) e.url = String(body.url);
  if (body.bannerUrl !== undefined) e.bannerUrl = String(body.bannerUrl);
  if (body.active !== undefined) e.active = Boolean(body.active);

  await e.save();

  const now = new Date();
  const upcoming = await Event.find({ active: true, endAt: { $gt: now } }).sort({ startAt: 1 }).limit(50).lean();
  try { EventBroadcaster.broadcast(JSON.stringify({ action: 'update', events: upcoming })); } catch (err) {}

  return NextResponse.json(e);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = params.id;
  await dbConnect();
  const e = await Event.findById(id);
  if (!e) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const userId = (session as any).user.id;
  const role = (session as any).user.role;
  if (role !== 'admin' && String(e.createdBy) !== String(userId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await Event.deleteOne({ _id: id });

  const now = new Date();
  const upcoming = await Event.find({ active: true, endAt: { $gt: now } }).sort({ startAt: 1 }).limit(50).lean();
  try { EventBroadcaster.broadcast(JSON.stringify({ action: 'update', events: upcoming })); } catch (err) {}

  return NextResponse.json({ ok: true });
}
