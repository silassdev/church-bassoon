import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Log from '@/models/Log';
import ArchivedLog from '@/models/ArchivedLog';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session as any).user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const olderThanDays = Number(body.olderThanDays || process.env.LOG_ARCHIVE_OLDER_THAN_DAYS || 30);

  await dbConnect();
  const cutoff = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
  // find docs to archive
  const docs = await Log.find({ createdAt: { $lt: cutoff } }).lean().limit(10000);
  if (!docs || docs.length === 0) return NextResponse.json({ ok: true, moved: 0 });

  const toInsert = docs.map(d => ({
    originalId: d._id,
    type: d.type,
    message: d.message,
    ip: d.ip,
    meta: d.meta,
    createdAt: d.createdAt,
    archivedAt: new Date()
  }));

  await ArchivedLog.insertMany(toInsert);
  const ids = docs.map(d => d._id);
  await Log.deleteMany({ _id: { $in: ids } });

  return NextResponse.json({ ok: true, moved: ids.length });
}
