import VerifyEmail from './templates/auth/verify-email';
import GuestNudge from './templates/auth/guest-nudge';
import PaymentReceipt from './templates/payments/payment-receipt';

export const EmailTemplates = {
  verify_email: VerifyEmail,
  guest_payment_nudge: GuestNudge,
  payment_receipt: PaymentReceipt,
};