import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Payment from '@/models/Payment';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Notification from '@/models/Notification';
import { initializePaystackTransaction, generatePaymentReference } from '@/lib/paystack';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  await dbConnect();

  // If user logged in, attach
  const session = await getServerSession(authOptions);
  const userId = session ? (session as any).user.id : null;

  const title = String(body.title || body.optionTitle || 'Payment').trim();
  const amount = Number(body.amount || 0);
  if (!amount || amount <= 0) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });

  const guestEmail = body.guestEmail ? String(body.guestEmail).trim() : (session ? (session as any).user.email : null);
  const guestName = body.guestName ? String(body.guestName).trim() : (session ? (session as any).user.name : null);

  if (!guestEmail) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  // Generate unique reference
  const reference = generatePaymentReference();

  const p = await Payment.create({
    user: userId,
    guestName,
    guestEmail,
    optionId: body.optionId || null,
    title,
    amount,
    currency: body.currency || 'NGN',
    method: 'paystack',
    status: 'initiated',
    providerReference: reference,
    metadata: body.metadata || {},
  });

  // Initialize Paystack transaction
  try {
    const paystackResponse = await initializePaystackTransaction({
      email: guestEmail,
      amount: amount * 100, // Convert to kobo
      reference,
      metadata: {
        paymentId: p._id.toString(),
        title,
        guestName,
      },
      callback_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/payment/callback`,
    });

    // Notify admins/coordinators
    try {
      await Notification.create({
        user: null,
        title: `New payment: ${title}`,
        body: `Amount: ₦${amount.toLocaleString()}, by ${guestEmail || guestName || 'guest'}`,
        read: false
      });
    } catch (e) { }

    return NextResponse.json({
      ok: true,
      paymentId: p._id,
      reference,
      authorization_url: paystackResponse.data.authorization_url
    });
  } catch (error: any) {
    console.error('Paystack initialization error:', error);
    // Delete the payment record if Paystack fails
    await Payment.findByIdAndDelete(p._id);
    return NextResponse.json({
      error: 'Failed to initialize payment',
      details: error.message
    }, { status: 500 });
  }
}
