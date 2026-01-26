import { NextResponse } from 'next/server';
import { loadTemplate } from '@/lib/templateLoader';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: Request, { params }: { params: Promise<{ templateName: string, locale: string }> }) {
  const { templateName, locale } = await params;
  const session = await getServerSession(authOptions);
  if (!session || (session as any).user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const tpl = await loadTemplate(templateName, locale || 'en');
  if (!tpl) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(tpl);
}
