import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { dbConnect } from '@/lib/db';
import Payment from '@/models/Payment';
import { sendPaymentStatusEmail } from '@/lib/mailer';
import User from '@/models/User';

const SECRET = process.env.PAYMENT_PROVIDER_WEBHOOK_SECRET || '';

export async function POST(req: Request) {
  const raw = await req.text().catch(() => null);
  const signature = (req.headers.get('x-provider-signature') || '').toString();

  if (!SECRET) {
    console.warn('[webhook] no PAYMENT_PROVIDER_WEBHOOK_SECRET configured — rejecting');
    return NextResponse.json({ error: 'No webhook secret configured' }, { status: 500 });
  }

  if (!raw) return NextResponse.json({ error: 'Empty body' }, { status: 400 });

  // verify HMAC SHA256
  const computed = crypto.createHmac('sha256', SECRET).update(raw).digest('hex');
  if (!signature || computed !== signature) {
    console.warn('[webhook] signature mismatch', signature, computed);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload: any;
  try { payload = JSON.parse(raw); } catch (e) { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  // Expected payload: { paymentId, event: 'charge.success'|'charge.failed', providerRef, metadata?: {} }
  const { paymentId, event, providerRef } = payload;
  if (!paymentId || !event) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  await dbConnect();
  const payment = await Payment.findById(paymentId) as any;
  if (!payment) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (event === 'charge.success') {
    payment.status = 'success';
    payment.providerReference = providerRef || payment.providerReference || payload?.reference;
    if (!payment.adminApproval) payment.adminApproval = { by: null, decision: 'approved', note: 'Auto-approved by provider webhook', at: new Date() };
    await payment.save();

    // notify user or guest via email
    try {
      if (payment.user) {
        const u = await User.findById(payment.user).lean() as any;
        if (u?.email) await sendPaymentStatusEmail(u.email, { _id: payment._id.toString(), title: payment.title, amount: payment.amount, status: payment.status }, 'Payment received via provider.');
      } else if (payment.guestEmail) {
        await sendPaymentStatusEmail(payment.guestEmail, { _id: payment._id.toString(), title: payment.title, amount: payment.amount, status: payment.status }, 'Payment received via provider.');
      }
    } catch (e) { console.warn('failed to send status email after webhook', e); }
  } else if (event === 'charge.failed') {
    payment.status = 'failed';
    payment.providerReference = providerRef || payment.providerReference || payload?.reference;
    await payment.save();
    try {
      if (payment.user) {
        const u = await User.findById(payment.user).lean() as any;
        if (u?.email) await sendPaymentStatusEmail(u.email, { _id: payment._id.toString(), title: payment.title, amount: payment.amount, status: payment.status }, 'Your payment failed.');
      } else if (payment.guestEmail) {
        await sendPaymentStatusEmail(payment.guestEmail, { _id: payment._id.toString(), title: payment.title, amount: payment.amount, status: payment.status }, 'Your payment failed.');
      }
    } catch (e) { console.warn('failed to send failed-email', e); }
  } else {
    // other events: ignore for now
  }

  return NextResponse.json({ ok: true });
}
