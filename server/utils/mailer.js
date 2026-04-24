const nodemailer = require('nodemailer');

function isConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER);
}

function transporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

async function sendMail({ to, subject, text }) {
  if (!isConfigured()) return;
  await transporter().sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text
  });
}

module.exports = { sendMail };
