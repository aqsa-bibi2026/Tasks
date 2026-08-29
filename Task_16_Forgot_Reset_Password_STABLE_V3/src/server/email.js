import nodemailer from 'nodemailer';
import { env } from './config.js';

let transporter = null;

if (env.emailMode === 'smtp') {
  transporter = nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpSecure,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass
    }
  });
}

export async function sendPasswordResetEmail({ to, name, code }) {
  if (env.emailMode === 'console') {
    console.log('');
    console.log('================================================');
    console.log('TASK 16 — PASSWORD RESET');
    console.log(`TO: ${to}`);
    console.log(`PASSWORD RESET CODE: ${code}`);
    console.log(`EXPIRES IN: ${env.resetCodeMinutes} minutes`);
    console.log('================================================');
    console.log('');

    return { mode: 'console' };
  }

  const info = await transporter.sendMail({
    from: env.emailFrom,
    to,
    subject: `${code} is your ResetFlow password reset code`,
    text:
      `Hello ${name},\n\n` +
      `Your password reset code is ${code}.\n` +
      `It expires in ${env.resetCodeMinutes} minutes.\n\n` +
      `If you did not request this change, ignore this email.`,
    html: `
      <div style="font-family:Arial,sans-serif;background:#f6f7fb;padding:32px">
        <div style="max-width:560px;margin:auto;background:#fff;border-radius:18px;padding:34px;border:1px solid #e8e9ef">
          <div style="font-size:12px;font-weight:800;letter-spacing:.12em;color:#2667ff">RESETFLOW SECURITY</div>
          <h1 style="color:#101828;font-size:28px;margin:18px 0 10px">Reset your password</h1>
          <p style="color:#667085;line-height:1.7">Hello ${name}, use this one-time code to continue your password reset.</p>
          <div style="font-size:36px;font-weight:800;letter-spacing:10px;text-align:center;padding:18px;margin:26px 0;border-radius:14px;background:#f1f5ff;border:1px solid #dce6ff;color:#101828">${code}</div>
          <p style="color:#667085">This code expires in ${env.resetCodeMinutes} minutes.</p>
          <p style="font-size:12px;color:#98a2b3;margin-top:28px">If you did not request this reset, your current password remains unchanged.</p>
        </div>
      </div>
    `
  });

  return {
    mode: 'smtp',
    messageId: info.messageId
  };
}
