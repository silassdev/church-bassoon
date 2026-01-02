import nodemailer from 'nodemailer';

export default async function sendVerificationEmail({ to, token, userId }: { to: string; token: string; userId: string }) {
    const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify?t=${token}`;

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    await transporter.sendMail({
        from: 'no-reply@yourchurch.org',
        to,
        subject: 'Verify your email',
        html: `Click <a href="${verificationUrl}">here</a> to verify your account.`,
    });
}
