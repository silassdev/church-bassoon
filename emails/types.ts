export type EmailLocale = 'en' | 'fr';

export type EmailTemplateKey =
  | 'verify_email'
  | 'guest_payment_nudge'
  | 'payment_receipt';

export interface BaseEmailPayload {
  to: string;
  locale?: EmailLocale;
}
