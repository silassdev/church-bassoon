import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import EmailLog from '@/models/EmailLog';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { sendTemplate } from '@/lib/transactionalMailer';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || (session as any).user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const log = await EmailLog.findById(id).lean() as any;
  if (!log) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // If we have templateName we re-render with stored vars+locale; otherwise fallback to resending saved html/text
  if (log.templateName) {
    const res = await sendTemplate({ templateName: log.templateName, to: log.to, vars: log.vars || {}, locale: log.locale || 'en' });
    return NextResponse.json(res);
  }

  // fallback: send raw saved content via low-level mailer
  // Use lib/mailer directly
  const { sendMail } = await import('@/lib/mailer');
  try {
    await sendMail({ to: log.to, subject: log.subject || '(no-subject)', html: log.html || undefined, text: log.text || undefined });
    // record a new EmailLog entry for the resend
    const newLog = await EmailLog.create({ ...log, status: 'sent', sentAt: new Date(), createdAt: new Date() });
    return NextResponse.json({ ok: true, logId: newLog._id });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || String(err) }, { status: 500 });
  }
}
