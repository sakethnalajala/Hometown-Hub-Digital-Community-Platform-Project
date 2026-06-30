import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<void> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    // Development mode - log to console
    console.log('\n📧 EMAIL (development mode)');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Content:', html.replace(/<[^>]*>/g, ''));
    console.log('---\n');
    return;
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'Hometown Hub <noreply@hometownhub.app>',
    to,
    subject,
    html,
  });
}

export function getPasswordResetEmail(name: string, resetUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
      <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #6366F1; font-size: 28px; margin: 0;">🏘️ Hometown Hub</h1>
        </div>
        <h2 style="color: #1a1a2e; font-size: 22px;">Reset Your Password</h2>
        <p style="color: #666; font-size: 16px; line-height: 1.6;">Hi ${name},</p>
        <p style="color: #666; font-size: 16px; line-height: 1.6;">
          You requested to reset your password. Click the button below to set a new password. 
          This link will expire in <strong>1 hour</strong>.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}" style="background: linear-gradient(135deg, #6366F1, #8B5CF6); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: bold;">
            Reset Password
          </a>
        </div>
        <p style="color: #999; font-size: 14px;">
          If you didn't request this, please ignore this email. Your password will remain unchanged.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">
        <p style="color: #bbb; font-size: 12px; text-align: center;">
          © 2024 Hometown Hub. Connecting communities everywhere.
        </p>
      </div>
    </body>
    </html>
  `;
}
