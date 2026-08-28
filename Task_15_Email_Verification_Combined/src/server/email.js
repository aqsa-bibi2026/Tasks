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

export async function sendVerificationEmail({ to, name, code }) {
  if (env.emailMode === 'console') {
    console.log('');
    console.log('==============================================');
    console.log('TASK 15 — EMAIL VERIFICATION');
    console.log(`TO: ${to}`);
    console.log(`EMAIL VERIFICATION CODE: ${code}`);
    console.log(`EXPIRES IN: ${env.verificationMinutes} minutes`);
    console.log('==============================================');
    console.log('');

    return {
      mode: 'console',
      accepted: [to]
    };
  }

  const info = await transporter.sendMail({
    from: env.emailFrom,
    to,
    subject: `${code} is your VerifyFlow verification code`,
    text:
      `Hello ${name},\n\n` +
      `Your VerifyFlow verification code is ${code}.\n` +
      `It expires in ${env.verificationMinutes} minutes.\n\n` +
      `If you did not request this, you can ignore this email.`,
    html: `
      <div style="font-family:Arial,sans-serif;background:#f5f7fb;padding:32px">
        <div style="max-width:560px;margin:auto;background:#ffffff;border-radius:18px;padding:34px;border:1px solid #e7eaf0">
          <div style="font-size:13px;font-weight:700;color:#6d5dfc;letter-spacing:.12em">
            VERIFYFLOW SECURITY
          </div>
          <h1 style="font-size:28px;color:#141827;margin:18px 0 10px">
            Verify your email
          </h1>
          <p style="color:#667085;line-height:1.7">
            Hello ${name}, use this 6-digit code to verify your account.
          </p>
          <div style="font-size:36px;letter-spacing:10px;font-weight:800;color:#141827;background:#f5f3ff;border:1px solid #e4defe;border-radius:14px;padding:18px;text-align:center;margin:26px 0">
            ${code}
          </div>
          <p style="color:#667085">
            This code expires in ${env.verificationMinutes} minutes.
          </p>
          <p style="font-size:12px;color:#98a2b3;margin-top:28px">
            If you did not create this account, you can ignore this email.
          </p>
        </div>
      </div>
    `
  });

  return {
    mode: 'smtp',
    messageId: info.messageId,
    accepted: info.accepted
  };
}
