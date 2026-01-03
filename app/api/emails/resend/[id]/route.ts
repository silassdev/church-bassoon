import EmailLog from '@/models/EmailLog';
import { sendEmail } from '@/emails/mailer';

export async function POST(
  _: Request,
  { params }: { params: { id: string } }
) {
  const log = await EmailLog.findById(params.id);
  if (!log) return Response.json({ error: 'Not found' }, { status: 404 });

  await sendEmail(log.template, log.payload);

  return Response.json({ success: true });
}
