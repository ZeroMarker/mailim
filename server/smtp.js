import nodemailer from 'nodemailer';

let transporter = null;
let currentUser = null;

export function initSmtp(email, password) {
  currentUser = email;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: { user: email, pass: password },
  });
}

export async function sendEmail(to, subject, text) {
  if (!transporter) throw new Error('SMTP not initialized');
  const info = await transporter.sendMail({
    from: currentUser,
    to,
    subject,
    text,
  });
  return info;
}
