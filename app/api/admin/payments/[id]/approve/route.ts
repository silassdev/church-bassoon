import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Payment from '@/models/Payment';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { sendPaymentStatusEmail } from '@/lib/mailer';
import User from '@/models/User';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session as any).user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(()=>({}));
  const decision = body.decision === 'decline' ? 'declined' : 'approved';
  const note = String(body.note || '').trim();

  await dbConnect();
  const payment = await Payment.findById(params.id);
  if (!payment) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  payment.adminApproval = { by: (session as any).user.id, decision, note, at: new Date() };
  payment.status = decision === 'approved' ? 'success' : 'failed';
  await payment.save();

  // send email to user or guest
  try {
    if (payment.user) {
      const u = await User.findById(payment.user).lean();
      if (u?.email) await sendPaymentStatusEmail(u.email, { _id: payment._id.toString(), title: payment.title, amount: payment.amount, status: payment.status }, note);
    } else if (payment.guestEmail) {
      await sendPaymentStatusEmail(payment.guestEmail, { _id: payment._id.toString(), title: payment.title, amount: payment.amount, status: payment.status }, note);
    }
  } catch (e) {
    console.warn('Failed to send payment status email', e);
  }

  return NextResponse.json({ ok: true, payment });
}
