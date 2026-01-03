import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Log from '@/models/Log';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session as any).user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get('page') || 1));
  const limit = Math.min(100, Number(url.searchParams.get('limit') || 20));
  const q = (url.searchParams.get('q') || '').trim();
  const type = (url.searchParams.get('type') || '').trim();

  const filter: any = {};
  if (q) {
    const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ message: re }, { 'meta.userEmail': re }, { ip: re }];
  }
  if (type) filter.type = type;

  const skip = (page - 1) * limit;
  const [total, items] = await Promise.all([
    Log.countDocuments(filter),
    Log.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean()
  ]);

  return NextResponse.json({ items, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) });
}
