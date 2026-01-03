import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import EmailTemplateOverride from '@/models/EmailTemplateOverride';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session as any).user.role !== 'admin') return NextResponse.json({ error:'Unauthorized' }, { status:401 });
  await dbConnect();
  const items = await EmailTemplateOverride.find().lean();
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session as any).user.role !== 'admin') return NextResponse.json({ error:'Unauthorized' }, { status:401 });

  const body = await req.json().catch(()=>({}));
  const { templateName, locale='en', subject='', html='', text='' } = body;
  if (!templateName) return NextResponse.json({ error:'templateName required' }, { status:400 });

  await dbConnect();
  const up = await EmailTemplateOverride.findOneAndUpdate(
    { templateName, locale },
    { $set: { subject, html, text, updatedAt: new Date() } },
    { upsert:true, new:true }
  );
  return NextResponse.json(up);
}