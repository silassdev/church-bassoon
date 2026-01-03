import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Event from '@/models/Event';

export async function GET() {
  await dbConnect();
  const items = await Event.find().sort({ startAt: -1 }).limit(100).lean();
  return NextResponse.json(items.map(i => ({
    _id: i._id,
    title: i.title,
    startAt: i.startAt,
    endAt: i.endAt,
    location: i.location,
    url: i.url,
    bannerUrl: i.bannerUrl,
    active: i.active,
    createdByName: i.createdByName,
    createdByRole: i.createdByRole,
    createdAt: i.createdAt,
    updatedAt: i.updatedAt,
    isPast: new Date(i.endAt).getTime() <= Date.now()
  })));
}
