import { EmailTemplates } from './index';
import { EmailTemplateKey } from './types';
import EmailLog from '@/models/EmailLog';

export async function sendEmail(
  key: EmailTemplateKey,
  payload: any
) {
  const Template = EmailTemplates[key];

  if (!Template) throw new Error('Invalid email template');

  // TODO: replace with Resend / SMTP / SES
  console.log('Sending email:', key, payload.to);

  await EmailLog.create({
    to: payload.to,
    template: key,
    payload,
    status: 'sent',
  });
}