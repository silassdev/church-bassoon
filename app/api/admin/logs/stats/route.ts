import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Log from '@/models/Log';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import mongoose from 'mongoose';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session as any).user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const url = new URL(req.url);
  const period = (url.searchParams.get('period') || 'day'); // day|week|year
  const now = new Date();

  let groupId: any;
  let projectLabel: any;

  if (period === 'day') {
    // last 30 days grouped by YYYY-MM-DD
    groupId = {
      $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
    };
    projectLabel = '$_id';
  } else if (period === 'week') {
    // last 12 weeks grouped by ISO week + year
    groupId = {
      $dateToString: { format: '%Y-%V', date: '$createdAt' } // %V iso-week
    };
    projectLabel = '$_id';
  } else { // year
    groupId = {
      $dateToString: { format: '%Y', date: '$createdAt' }
    };
    projectLabel = '$_id';
  }

  const match: any = { type: 'view' };

  // limit timeframe for reasonable performance
  if (period === 'day') {
    const from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    match.createdAt = { $gte: from };
  } else if (period === 'week') {
    const from = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    match.createdAt = { $gte: from };
  } else {
    const from = new Date(now.getTime() - 5 * 365 * 24 * 60 * 60 * 1000);
    match.createdAt = { $gte: from };
  }

  const pipeline = [
    { $match: match },
    { $group: { _id: groupId, count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ];

  const results = await Log.aggregate(pipeline).allowDiskUse(true);
  // normalize into array of { label, count }
  const data = results.map((r: any) => ({ label: r._id, count: r.count }));

  return NextResponse.json({ period, data });
}
