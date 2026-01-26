import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Payment from '@/models/Payment';
import { verifyPaystackTransaction } from '@/lib/paystack';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get('reference');

    if (!reference) {
        return NextResponse.redirect(new URL('/give?error=no_reference', req.url));
    }

    try {
        await dbConnect();

        // Verify transaction with Paystack
        const verification = await verifyPaystackTransaction(reference);

        if (!verification.status || verification.data.status !== 'success') {
            return NextResponse.redirect(new URL(`/give?error=payment_failed&ref=${reference}`, req.url));
        }

        // Update payment status in database
        const payment = await Payment.findOne({ providerReference: reference });

        if (payment) {
            payment.status = 'success';
            payment.metadata = {
                ...payment.metadata,
                paystackData: verification.data,
                verifiedAt: new Date(),
            };
            await payment.save();

            // Redirect to success page
            return NextResponse.redirect(
                new URL(`/give?success=true&amount=${payment.amount}&ref=${reference}`, req.url)
            );
        } else {
            return NextResponse.redirect(new URL('/give?error=payment_not_found', req.url));
        }
    } catch (error) {
        console.error('Payment callback error:', error);
        return NextResponse.redirect(new URL('/give?error=verification_failed', req.url));
    }
}
