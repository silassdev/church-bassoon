import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Announcement from '@/models/Announcement';

export async function GET(req: Request) {
  await dbConnect();
  const items = await Announcement.find().sort({ createdAt: -1 }).limit(50).lean();
  // map to preview
  const preview = items.map(i => ({
    _id: i._id,
    text: i.text,
    addedByName: i.addedByName,
    addedByRole: i.addedByRole,
    active: i.active,
    createdAt: i.createdAt,
    updatedAt: i.updatedAt,
  }));
  return NextResponse.json(preview);
}
