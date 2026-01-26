import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import PaymentOption from '@/models/PaymentOption';

export async function GET() {
    await dbConnect();
    try {
        const opts = await PaymentOption.find({ active: true }).sort({ createdAt: -1 }).lean();
        return NextResponse.json(opts);
    } catch (err) {
        return NextResponse.json({ error: 'Failed to fetch options' }, { status: 500 });
    }
}
