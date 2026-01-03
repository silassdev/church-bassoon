import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import PaymentOption from '@/models/PaymentOption';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session || (session as any).user.role !== 'admin') return NextResponse.json({ error:'Unauthorized' }, { status: 401 });
  const opts = await PaymentOption.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json(opts);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session as any).user.role !== 'admin') return NextResponse.json({ error:'Unauthorized' }, { status: 401 });
  const body = await req.json();
  await dbConnect();
  const item = await PaymentOption.create({
    title: String(body.title || '').trim(),
    type: String(body.type || 'offerings'),
    amount: body.amount ? Number(body.amount) : null,
    description: String(body.description || ''),
    tags: Array.isArray(body.tags) ? body.tags : (String(body.tags||'').split(',').map((t:string)=>t.trim()).filter(Boolean)),
    active: body.active !== false
  });
  return NextResponse.json(item);
}
