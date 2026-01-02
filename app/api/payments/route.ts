import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Payment from '@/models/Payment';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if ((session as any).user.role !== 'coordinator') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await dbConnect();
  const url = new URL(req.url);
  const q = url.searchParams.get('q') || '';
  const status = url.searchParams.get('status') || '';
  const limit = Math.min(200, Number(url.searchParams.get('limit') || 50));

  const filter: any = {};
  if (status) filter.status = status;
  if (q) {
    const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    // search providerReference or user email via aggregation
    const users = await User.find({ $or: [{ email: re }, { name: re }] }, '_id email').lean();
    const userIds = users.map(u => u._id);
    filter.$or = [{ providerReference: re }, { user: { $in: userIds } }];
  }

  const payments = await Payment.find(filter).sort({ createdAt: -1 }).limit(limit).lean();

  // attach user email for display
  const userIds = Array.from(new Set(payments.map(p => String(p.user))));
  const users = await User.find({ _id: { $in: userIds } }, 'email').lean();
  const userMap = new Map(users.map(u => [String(u._id), u.email]));
  const enriched = payments.map(p => ({ ...p, userEmail: userMap.get(String(p.user)) || '' }));

  return NextResponse.json(enriched);
}
