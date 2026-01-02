import { NextResponse } from 'next/server';
import  { dbConnect } from '@/lib/db';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const user = await User.findById((session as any).user.id);
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  user.profileNoticeDismissedAt = new Date();
  await user.save();

  return NextResponse.json({ ok: true });
}
