import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Payment from '@/models/Payment';
import crypto from 'crypto';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const hash = crypto
            .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY || '')
            .update(JSON.stringify(body))
            .digest('hex');

        const signature = req.headers.get('x-paystack-signature');

        // Verify webhook signature
        if (hash !== signature) {
            console.error('Invalid Paystack webhook signature');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        const event = body.event;
        const data = body.data;

        await dbConnect();

        // Handle different webhook events
        switch (event) {
            case 'charge.success':
                // Payment successful
                const payment = await Payment.findOne({
                    providerReference: data.reference
                });

                if (payment) {
                    payment.status = 'success';
                    payment.metadata = {
                        ...payment.metadata,
                        webhookData: data,
                        webhookReceivedAt: new Date(),
                    };
                    await payment.save();
                    console.log(`Payment ${data.reference} marked as success via webhook`);
                }
                break;

            case 'charge.failed':
                // Payment failed
                const failedPayment = await Payment.findOne({
                    providerReference: data.reference
                });

                if (failedPayment) {
                    failedPayment.status = 'failed';
                    failedPayment.metadata = {
                        ...failedPayment.metadata,
                        webhookData: data,
                        webhookReceivedAt: new Date(),
                    };
                    await failedPayment.save();
                    console.log(`Payment ${data.reference} marked as failed via webhook`);
                }
                break;

            default:
                console.log(`Unhandled webhook event: ${event}`);
        }

        return NextResponse.json({ received: true }, { status: 200 });
    } catch (error) {
        console.error('Webhook processing error:', error);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}
