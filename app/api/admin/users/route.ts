import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

type QParams = { page?: string; limit?: string; q?: string };

export async function GET(req: Request) {
  await dbConnect();

  // server-side auth guard
  const session = await getServerSession(authOptions);
  if (!session || (session as any).user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const params = Object.fromEntries(url.searchParams.entries()) as unknown as QParams;

  const page = Math.max(1, Number(params.page || 1));
  const limit = Math.min(100, Math.max(1, Number(params.limit || 10)));
  const q = (params.q || '').trim();

  const filter: any = {};
  if (q) {
    const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'); // escape query
    filter.$or = [{ email: re }, { name: re }, { role: re }];
  }

  const skip = (page - 1) * limit;
  const [total, users] = await Promise.all([
    User.countDocuments(filter),
    User.find(filter, '-passwordHash -verificationToken').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return NextResponse.json({ users, total, page, limit, totalPages });
}
