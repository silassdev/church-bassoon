import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Payment from '@/models/Payment';

export async function POST(req: Request) {
  const body = await req.json().catch(()=>({}));
  const paymentId = body.paymentId || body.id;
  if (!paymentId) return NextResponse.json({ error: 'paymentId required' }, { status: 400 });

  await dbConnect();
  const payment = await Payment.findById(paymentId);
  if (!payment) return NextResponse.json({ error: 'Payment not found' }, { status: 404 });

  // In real provider: create a checkout session and return the redirect url
  // For stub: return a "mock provider" URL that simulates payment and triggers webhook
  const providerUrl = `${process.env.PUBLIC_URL || ''}/mock-pay?paymentId=${payment._id}`;
  return NextResponse.json({ ok: true, providerUrl, paymentId: payment._id });
}
