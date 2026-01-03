import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import EmailLog from '@/models/EmailLog';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session as any).user.role !== 'admin') return NextResponse.json({ error:'Unauthorized' }, { status:401 });

  await dbConnect();
  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get('page')||1));
  const limit = Math.min(100, Number(url.searchParams.get('limit')||20));
  const skip = (page-1)*limit;

  const [total, items] = await Promise.all([
    EmailLog.countDocuments({}),
    EmailLog.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).lean()
  ]);
  return NextResponse.json({ total, page, limit, totalPages: Math.max(1, Math.ceil(total/limit)), items });
}
