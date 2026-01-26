import nodemailer from 'nodemailer';

type SendResetArgs = {
    to: string;
    token: string;
};

function buildResetUrl(token: string) {
    const base = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
    return `${base.replace(/\/$/, '')}/auth/reset-password?t=${token}`;
}

export default async function sendForgotPasswordEmail({ to, token }: SendResetArgs) {
    const resetUrl = buildResetUrl(token);

    const port = Number(process.env.SMTP_PORT || 587);
    const secure = port === 465;

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure,
        auth: process.env.SMTP_USER && process.env.SMTP_PASS ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    });

    const brandName = process.env.EMAIL_BRAND_NAME || 'ChurchDev';
    const fromAddress = process.env.EMAIL_FROM || `no-reply@${(process.env.EMAIL_DOMAIN || 'churchdev.com')}`;
    const logoUrl = process.env.NEXT_PUBLIC_LOGO_URL || process.env.EMAIL_LOGO_URL || '';

    const preheader = `You requested a password reset for your ${brandName} account.`;

    const html = `
  <!doctype html>
  <html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <style>
      body { margin:0; padding:0; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
      table { border-collapse:collapse; }
      img { border:0; height:auto; line-height:100%; outline:none; text-decoration:none; }
      a { color:inherit; text-decoration:none; }
      .button { display:inline-block; padding:14px 22px; border-radius:6px; text-decoration:none; font-weight:600; }
      @media only screen and (max-width:600px) {
        .container { width:100% !important; }
        .stack { display:block !important; width:100% !important; }
      }
    </style>
  </head>
  <body style="background-color:#f5f7fb; font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;">
    <span style="display:none; max-height:0; max-width:0; opacity:0; overflow:hidden;">${preheader}</span>

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center" style="padding:24px 16px;">
          <table class="container" width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 6px 18px rgba(32,33,36,0.08);">

            <tr>
              <td style="padding:22px 24px; text-align:left;">
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td style="vertical-align:middle;">
                      ${logoUrl ? `<img src="${logoUrl}" alt="${brandName} logo" width="42" style="display:block; border-radius:6px;" />` : `<div style="width:42px; height:42px; background:#111827; border-radius:6px; display:inline-block;"></div>`}
                    </td>
                    <td style="text-align:right; vertical-align:middle; font-size:14px; color:#6b7280;">
                      ${brandName}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:24px;">
                <h1 style="margin:0 0 8px 0; font-size:20px; line-height:1.25; color:#0f172a;">Reset your password</h1>
                <p style="margin:0 0 18px 0; color:#475569; font-size:15px; line-height:1.5;">We received a request to reset the password for your ${brandName} account. Click the button below to proceed. This link will expire in 1 hour.</p>

                <div style="text-align:left; margin:18px 0;">
                  <a class="button" href="${resetUrl}" style="background:#4f46e5; color:#ffffff; display:inline-block; border-radius:8px; padding:12px 20px;">Reset Password</a>
                </div>

                <p style="margin:12px 0 0 0; color:#6b7280; font-size:13px;">If the button doesn't work, copy and paste this link into your browser:</p>
                <p style="word-break:break-all; font-size:13px; color:#4f46e5;">${resetUrl}</p>

                <hr style="border:none; border-top:1px solid #eef2ff; margin:20px 0;" />

                <p style="font-size:13px; color:#9ca3af; margin:0">If you didn't request a password reset, you can safely ignore this email.</p>
              </td>
            </tr>

            <tr>
              <td style="background:#f8fafc; padding:16px 24px; font-size:13px; color:#9ca3af;">
                <div style="display:flex; justify-content:space-between; align-items:center; gap:12px;">
                  <div>© ${new Date().getFullYear()} ${brandName}. All rights reserved.</div>
                  <div style="text-align:right;">Need help? <a href="mailto:${process.env.SUPPORT_EMAIL || 'support@churchdev.com'}" style="color:#4f46e5; text-decoration:underline;">Contact support</a></div>
                </div>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

    const text = `Reset your password at ${brandName}\n\nClick the link below to reset your password:\n${resetUrl}\n\nIf you didn't request this, you can safely ignore it.`;

    try {
        await transporter.sendMail({
            from: `${brandName} <${fromAddress}>`,
            to,
            subject: `Reset your ${brandName} password`,
            text,
            html,
        });
    } catch (err) {
        console.error('sendForgotPasswordEmail error:', err);
        throw err;
    }
}
