import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Payment from '@/models/Payment';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Notification from '@/models/Notification';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const role = (session as any).user.role;
  if (role !== 'coordinator' && role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const noteBody = await req.json().catch(() => ({}));
  const note = String(noteBody.note || '').trim();

  await dbConnect();
  const payment = await Payment.findById(id);
  if (!payment) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // mark coordinator attempted paid
  payment.status = 'coordinator_marked_paid';
  payment.coordinatorApproval = { by: (session as any).user.id, note, at: new Date() };
  await payment.save();

  // notify admins for approval
  try {
    // create notifications for admins (simple: notify all admins)
    // You may optimize to notify specific admin users
    // Fetch admins list optional
    await Notification.create({ user: null, title: `Payment ${payment._id} marked as paid by coordinator`, body: `Amount: ${payment.amount}, note: ${note}`, read: false });
  } catch (e) { }

  return NextResponse.json({ ok: true, payment });
}
