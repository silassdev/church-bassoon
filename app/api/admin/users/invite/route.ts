import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { randomBytes } from 'crypto';
import sendInviteEmail from '@/lib/email/sendVerificationEmail';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session as any).user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { email, role = 'admin' } = await req.json();
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

  await dbConnect();
  const existing = await User.findOne({ email: String(email).toLowerCase() });
  if (existing) return NextResponse.json({ error: 'Email already registered' }, { status: 409 });

  const inviteToken = randomBytes(32).toString('hex');

  const user = await User.create({
    email: String(email).toLowerCase(),
    role,
    status: 'active',
    provider: 'credentials',
    verificationToken: inviteToken,
  });

  await sendInviteEmail({ to: email, token: inviteToken });
  return NextResponse.json({ ok: true });
}
