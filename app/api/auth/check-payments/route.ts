import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Payment from '@/models/Payment';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) return NextResponse.json({ found: false }, { status: 400 });

    await dbConnect();
    const payment = await Payment.findOne({
        guestEmail: email.toLowerCase(),
        user: null // only find orphaned payments
    }).lean();

    return NextResponse.json({ found: !!payment });
}
