import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Payment from '@/models/Payment';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { sendGuestPaymentInitiatedEmail } from '@/lib/mailer';

export async function associateGuestPaymentsToUser(email: string, userId: string) {
  if (!email) return 0;
  await dbConnect();
  const res = await Payment.updateMany({ guestEmail: String(email).trim(), user: null }, { $set: { user: userId } });
  return res.modifiedCount || (res as any).nModified || 0;

  const session = await getServerSession(authOptions);
  const userId = session ? (session as any).user.id : null;

  const title = String(body.title || body.optionTitle || 'Payment').trim();
  const amount = Number(body.amount || 0);
  if (!amount || amount <= 0) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });

  const guestEmail = body.guestEmail ? String(body.guestEmail).trim() : (session ? (session as any).user.email : null);
  const guestName = body.guestName ? String(body.guestName).trim() : (session ? (session as any).user.name : null);

  const p = await Payment.create({
    user: userId,
    guestName,
    guestEmail,
    optionId: body.optionId || null,
    title,
    amount,
    currency: body.currency || 'NGN',
    method: body.method || 'online',
    status: 'initiated',
    metadata: body.metadata || {},
  });

  // send guest receipt + nudge (best-effort)
  if (guestEmail) {
    try {
      await sendGuestPaymentInitiatedEmail(guestEmail, { _id: p._id.toString(), title: p.title, amount: p.amount, currency: p.currency }, { publicUrl: process.env.PUBLIC_URL });
    } catch (e) {
      console.warn('Failed to send guest email', e);
    }
  }

  // return payment id for client checkout step
  return NextResponse.json({ ok: true, paymentId: p._id });
}