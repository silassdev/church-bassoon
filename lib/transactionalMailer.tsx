import { loadTemplate, renderTemplates } from '@/lib/templateLoader';
import { sendMail } from '@/lib/mailer';
import EmailLog from '@/models/EmailLog';
import { dbConnect } from '@/lib/db';

type SendOpts = {
  templateName: string;
  to: string;
  vars?: Record<string, any>;
  locale?: string;
  forceTextOnly?: boolean;
};

export async function sendTemplate(opts: SendOpts) {
  const { templateName, to, vars = {}, locale = 'en', forceTextOnly = false } = opts;
  await dbConnect();

  const tpl = await loadTemplate(templateName, locale);
  if (!tpl) throw new Error(`Template not found: ${templateName} (${locale})`);

  const rendered = renderTemplates(tpl, vars);

  // create log entry (queued)
  const log = await EmailLog.create({
    templateName,
    to,
    subject: rendered.subject || '',
    html: rendered.html || '',
    text: rendered.text || '',
    vars,
    locale,
    status: 'queued'
  });

  try {
    // call global mailer
    await sendMail({
      to,
      subject: rendered.subject || '(no subject)',
      html: forceTextOnly ? undefined : rendered.html,
      text: rendered.text
    });
    log.status = 'sent';
    log.sentAt = new Date();
    await log.save();
    return { ok: true, logId: log._id };
  } catch (err) {
    log.status = 'failed';
    log.error = { message: err.message || String(err), stack: err.stack };
    await log.save();
    return { ok: false, error: err, logId: log._id };
  }
}
