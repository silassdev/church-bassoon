import EmailLog from '@/models/EmailLog';
import { sendEmail } from '@/emails/mailer';

export async function POST(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const log = await EmailLog.findById(id) as any;
  if (!log) return Response.json({ error: 'Not found' }, { status: 404 });

  await sendEmail(log.templateName || log.template, log.payload || log.vars);

  return Response.json({ success: true });
}
