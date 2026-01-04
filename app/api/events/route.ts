import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Event from '@/models/Event';

export async function GET(req: Request) {
  await dbConnect();
  const url = new URL(req.url);
  const limit = Math.min(100, Number(url.searchParams.get('limit') || 50));

  // Fetch all active events (both past and future)
  const items = await Event.find({ active: true }).sort({ startAt: -1 }).limit(limit).lean();

  // Add computed isPast field for convenience
  const now = new Date();
  const mapped = items.map(i => ({
    ...i,
    isPast: new Date(i.endAt).getTime() <= now.getTime()
  }));

  return NextResponse.json(mapped);
}
