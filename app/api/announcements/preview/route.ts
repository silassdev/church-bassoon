import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Announcement from '@/models/Announcement';

export async function GET() {
    await dbConnect();

    // Fetch all announcements, sorted by most recent
    const items = await Announcement.find().sort({ createdAt: -1 }).limit(100).lean();

    // Return preview data with essential fields
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
