import nodemailer from 'nodemailer';
import { ENV } from './env.js';

let transporter = null;

// Initialize Transporter
if (ENV.EMAIL_USER && ENV.EMAIL_PASSWORD) {
  transporter = nodemailer.createTransport({
    host: ENV.EMAIL_HOST,
    port: ENV.EMAIL_PORT,
    secure: ENV.EMAIL_PORT === 465,
    auth: {
      user: ENV.EMAIL_USER,
      pass: ENV.EMAIL_PASSWORD
    }
  });
}

/**
 * Send an email notification
 * @param {Object} options - { to, subject, html, text }
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    if (!transporter) {
      console.log(`[EMAIL SYSTEM (DEMO MODE)]:`);
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Timestamp: ${new Date().toISOString()}`);
      console.log(`----------------------------------------`);
      return { success: true, simulated: true, messageId: `demo-${Date.now()}` };
    }

    const info = await transporter.sendMail({
      from: ENV.EMAIL_FROM,
      to,
      subject,
      text: text || '',
      html
    });

    console.log(`[EMAIL DISPATCHED] ID: ${info.messageId} to ${to}`);
    return { success: true, simulated: false, messageId: info.messageId };
  } catch (error) {
    console.warn(`[EMAIL WARNING] Failed to deliver email to ${to}:`, error.message);
    // In demo / college testing, we don't crash business logic if email fails
    return { success: false, error: error.message };
  }
};
