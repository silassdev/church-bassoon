import nodemailer from 'nodemailer';

type SendInviteArgs = {
  to: string;
  token: string;
  userId?: string;
  inviterName?: string;
  role?: string; // e.g. 'admin'
};

function buildInviteUrl(token: string, userId?: string) {
  const base = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
  const params = new URLSearchParams({ t: token });
  if (userId) params.set('id', userId);
  return `${base.replace(/\/$/, '')}/api/auth/verify?${params.toString()}`;
}

function buildPlainText({ inviterName, role, inviteUrl }: { inviterName?: string; role?: string; inviteUrl: string }) {
  return [`${inviterName ? `${inviterName} invited you to join` : 'You were invited to join'}`,
  ``,
  `Role: ${role || 'Member'}`,
  `Accept invitation: ${inviteUrl}`,
  ``,
  `If you did not expect this email, you can safely ignore it.`].join('\n');
}

export default async function sendInviteEmail({ to, token, userId, inviterName, role }: SendInviteArgs) {
  const inviteUrl = buildInviteUrl(token, userId);

  // Set up transporter options - support secure flag for port 465
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = port === 465;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: process.env.SMTP_USER && process.env.SMTP_PASS ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });

  // brand values from env (optional)
  const brandName = process.env.EMAIL_BRAND_NAME || 'YourChurch';
  const fromAddress = process.env.EMAIL_FROM || `no-reply@${(process.env.EMAIL_DOMAIN || 'yourchurch.org')}`;
  const logoUrl = process.env.NEXT_PUBLIC_LOGO_URL || process.env.EMAIL_LOGO_URL || '';

  // Accessible preheader text (shown in inbox preview)
  const preheader = `${inviterName ? inviterName + ' ' : ''}sent you an invite to join ${brandName}. Accept the invite to get started.`;

  // Responsive, email-client friendly HTML (table-layout)
  const html = `
  <!doctype html>
  <html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <style>
      /* Basic responsive styles - keep inline-friendly */
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
    <!-- Preview text: -->
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
                <h1 style="margin:0 0 8px 0; font-size:20px; line-height:1.25; color:#0f172a;">${inviterName ? `${inviterName} invited you to join ${brandName}` : `You're invited to join ${brandName}`}</h1>
                <p style="margin:0 0 18px 0; color:#475569; font-size:15px; line-height:1.5;">Create your account and get access to ${role ? `${role} features` : 'the platform'}. This link will let you accept the invitation and set a password.</p>

                <div style="text-align:left; margin:18px 0;">
                  <a class="button" href="${inviteUrl}" style="background:#2563eb; color:#ffffff; display:inline-block; border-radius:8px; padding:12px 20px;">Accept invitation</a>
                </div>

                <p style="margin:12px 0 0 0; color:#6b7280; font-size:13px;">If the button doesn't work, copy and paste this link into your browser:</p>
                <p style="word-break:break-all; font-size:13px; color:#2563eb;">${inviteUrl}</p>

                <hr style="border:none; border-top:1px solid #eef2ff; margin:20px 0;" />

                <p style="font-size:13px; color:#9ca3af; margin:0">If you didn't expect this invite, you can ignore this email — no action is required.</p>
              </td>
            </tr>

            <tr>
              <td style="background:#f8fafc; padding:16px 24px; font-size:13px; color:#9ca3af;">
                <div style="display:flex; justify-content:space-between; align-items:center; gap:12px;">
                  <div>© ${new Date().getFullYear()} ${brandName}. All rights reserved.</div>
                  <div style="text-align:right;">Need help? <a href="mailto:${process.env.SUPPORT_EMAIL || 'support@yourchurch.org'}" style="color:#2563eb; text-decoration:underline;">Contact support</a></div>
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

  const text = buildPlainText({ inviterName, role, inviteUrl });

  try {
    await transporter.sendMail({
      from: `${brandName} <${fromAddress}>`,
      to,
      subject: `${inviterName ? inviterName + ' invited you to join' : 'You have been invited to join'} ${brandName}`,
      text,
      html,
    });
  } catch (err) {
    console.error('sendInviteEmail error:', err);
    throw err;
  }
}
