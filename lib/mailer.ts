// lib/mailer.ts
import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FROM = process.env.REPORT_EMAIL_FROM || `no-reply@${process.env.PUBLIC_URL?.replace(/^https?:\/\//,'') || 'localhost'}`;

if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
  console.warn('[mailer] SMTP not fully configured. Emails will fail until env vars are set.');
}

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

/** sendMail helper */
export async function sendMail(opts: { to: string; subject: string; text?: string; html?: string }) {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn('[mailer] skipping sendMail (SMTP not configured).', opts.to, opts.subject);
    return;
  }
  await transporter.sendMail({
    from: FROM,
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
  });
}

/** Guest payment initiated - receipt + nudge to register */
export async function sendGuestPaymentInitiatedEmail(to: string, payment: { _id: string; title: string; amount: number; currency?: string }, extra?: { publicUrl?: string }) {
  const root = extra?.publicUrl || process.env.PUBLIC_URL || '';
  const registerLink = `${root}/auth/signup`;
  const html = `
    <p>Thank you. We received your payment record:</p>
    <ul>
      <li><strong>${payment.title}</strong></li>
      <li>Amount: ${payment.currency || 'NGN'} ${payment.amount}</li>
      <li>Reference: ${payment._id}</li>
    </ul>
    <p>If you want to track this payment and see receipts in your account, please register with the same email used for payment.</p>
    <p><a href="${registerLink}">Create an account</a></p>
    <p>If you already have an account, sign in with the same email to see this payment in "My Payments".</p>
  `;
  await sendMail({ to, subject: `Payment recorded — ${payment.title}`, html, text: `Payment recorded: ${payment.title} — ${payment.currency||'NGN'} ${payment.amount}. Visit ${root}` });
}

/** Payment final status email (approved/declined/success/failed) */
export async function sendPaymentStatusEmail(to: string, payment: { _id: string; title: string; amount: number; status: string }, note?: string) {
  const html = `
    <p>Update on your payment</p>
    <ul>
      <li><strong>${payment.title}</strong></li>
      <li>Amount: ${payment.amount}</li>
      <li>Status: <strong>${payment.status}</strong></li>
      <li>Reference: ${payment._id}</li>
    </ul>
    <p>${note || ''}</p>
  `;
  await sendMail({ to, subject: `Payment ${payment.status}: ${payment.title}`, html, text: `Payment ${payment.status}: ${payment.title} ${payment._id}` });
}

/** Registration nudge when payments linked to an email after signup */
export async function sendRegistrationNudgeEmail(to: string, linkedCount: number) {
  const root = process.env.PUBLIC_URL || '';
  const html = `
    <p>Welcome — we found ${linkedCount} payment(s) made with this email.</p>
    <p>These payments are now linked to your account. You can visit <a href="${root}/dashboard/payments">My Payments</a> to view them.</p>
  `;
  await sendMail({ to, subject: `Payments linked to your account`, html, text: `We linked ${linkedCount} payment(s) to your account. Visit ${root}/dashboard/payments.` });
}
