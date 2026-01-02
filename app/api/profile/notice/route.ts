import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const NOTICE = process.env.PROFILE_UPDATE_NOTICE || 'Please update your profile';
const INTERVAL_DAYS = Number(process.env.PROFILE_UPDATE_NOTICE_INTERVAL_DAYS || 30);

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ show: false });

  await dbConnect();
  const user = await User.findById((session as any).user.id).lean();
  if (!user) return NextResponse.json({ show: false });

  const dismissedAt = user.profileNoticeDismissedAt ? new Date(user.profileNoticeDismissedAt) : null;
  const threshold = dismissedAt ? (Date.now() - (INTERVAL_DAYS * 24 * 60 * 60 * 1000)) : 0;
  const show = !dismissedAt || dismissedAt.getTime() < threshold;

  // identify missing required fields
  const missing: string[] = [];
  if (!user.name) missing.push('name');
  if (!user.houseAddress) missing.push('houseAddress');
  if (!user.dob) missing.push('dob');
  if (!user.state) missing.push('state');
  if (!user.city) missing.push('city');
  if (!user.avatarUrl) missing.push('avatar');

  return NextResponse.json({ show: show && missing.length > 0, message: NOTICE, missing });
}
