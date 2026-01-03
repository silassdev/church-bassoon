import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Payment from '@/models/Payment';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const userId = (session as any).user.id;
  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get('page') || 1));
  const limit = Math.min(100, Number(url.searchParams.get('limit') || 20));
  const status = (url.searchParams.get('status') || '').trim();

  const filter: any = { user: userId };
  if (status) filter.status = status;

  const skip = (page - 1) * limit;
  const [total, items] = await Promise.all([
    Payment.countDocuments(filter),
    Payment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean()
  ]);

  return NextResponse.json({
    items,
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit))
  });
}
