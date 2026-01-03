import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Event from '@/models/Event';

export async function GET(req: Request) {
  await dbConnect();
  const url = new URL(req.url);
  const limit = Math.min(50, Number(url.searchParams.get('limit') || 10));
  const now = new Date();
  // active and not past
  const items = await Event.find({ active: true, endAt: { $gt: now } }).sort({ startAt: 1 }).limit(limit).lean();
  // add computed isPast field for convenience
  const mapped = items.map(i => ({ ...i, isPast: new Date(i.endAt).getTime() <= now.getTime() }));
  return NextResponse.json(mapped);
}
