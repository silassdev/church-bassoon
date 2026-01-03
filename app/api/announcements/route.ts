import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Announcement from '@/models/Announcement';

export async function GET(req: Request) {
  await dbConnect();
  const url = new URL(req.url);
  const limit = Math.min(50, Number(url.searchParams.get('limit') || 10));
  const items = await Announcement.find({ active: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  return NextResponse.json(items);
}
