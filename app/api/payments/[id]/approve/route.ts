import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Payment from '@/models/Payment';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Notification from '@/models/Notification';
import User from '@/models/User';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || (session as any).user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const decision = body.decision === 'decline' ? 'declined' : 'approved';
  const note = String(body.note || '').trim();

  await dbConnect();
  const payment = await Payment.findById(id);
  if (!payment) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  payment.adminApproval = { by: (session as any).user.id, decision, note, at: new Date() };
  payment.status = decision === 'approved' ? 'success' : 'failed';
  await payment.save();

  // notify user (if user or guest email) about final decision
  try {
    if (payment.user) {
      await Notification.create({ user: payment.user, title: `Payment ${decision}`, body: `Your payment ${payment.title} was ${decision}. ${note || ''}`, read: false });
    } else if (payment.guestEmail) {
      // optional: create an email job to send to guestEmail (not implemented)
      // Or create a Notification entity for a later linkable guest account record (skip)
    }
  } catch (e) { }

  return NextResponse.json({ ok: true, payment });
}
