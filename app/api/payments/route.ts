import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Payment from '@/models/Payment';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Notification from '@/models/Notification';

export async function POST(req: Request) {
  const body = await req.json().catch(()=>({}));
  await dbConnect();

  // If user logged in, attach
  const session = await getServerSession(authOptions);
  const userId = session ? (session as any).user.id : null;

  const title = String(body.title || body.optionTitle || 'Payment').trim();
  const amount = Number(body.amount || 0);
  if (!amount || amount <= 0) return NextResponse.json({ error:'Invalid amount' }, { status: 400 });

  const p = await Payment.create({
    user: userId,
    guestName: body.guestName ? String(body.guestName).trim() : (session ? (session as any).user.name : null),
    guestEmail: body.guestEmail ? String(body.guestEmail).trim() : (session ? (session as any).user.email : null),
    optionId: body.optionId || null,
    title,
    amount,
    currency: body.currency || 'NGN',
    method: body.method || 'online',
    status: 'initiated',
    metadata: body.metadata || {},
  });

  // notify admins/coordinators that a new payment initiated (optional)
  try {
    await Notification.create({ user: null, title: `New payment: ${title}`, body: `Amount: ${amount}, by ${p.guestEmail || p.guestName || 'guest'}`, read: false });
  } catch(e) {}

  return NextResponse.json({ ok:true, paymentId: p._id });
}
