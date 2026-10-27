import { env } from '../config/env.js';

let transporterPromise;

async function getTransporter() {
  if (!env.SMTP_HOST) return null;
  if (!transporterPromise) {
    transporterPromise = import('nodemailer').then(({ default: nodemailer }) =>
      nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_SECURE,
        auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
      })
    );
  }
  return transporterPromise;
}

export function buildResetLink(rawToken) {
  return `${env.CLIENT_URLS[0]}/?reset_token=${rawToken}`;
}

export async function sendPasswordResetEmail({ to, name, rawToken }) {
  const link = buildResetLink(rawToken);
  const transporter = await getTransporter();

  if (!transporter) {
    // No SMTP configured. In development print the link so the flow can be tested;
    // never write reset links to production logs.
    if (!env.isProduction && !env.isTest) {
      console.log(`\n[dev] Password reset link for ${to}:\n${link}\n`);
    } else if (env.isProduction) {
      console.warn('SMTP is not configured: password reset email was NOT sent.');
    }
    return;
  }

  await transporter.sendMail({
    from: env.MAIL_FROM,
    to,
    subject: 'Reset your WMSU CareerLink password',
    text:
      `Hello ${name},\n\n` +
      `We received a request to reset your WMSU CareerLink password.\n` +
      `Use the link below within ${env.RESET_TOKEN_TTL_MINUTES} minutes:\n\n${link}\n\n` +
      `If you did not request this, you can ignore this email.`,
  });
}
