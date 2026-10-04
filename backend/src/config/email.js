import nodemailer from 'nodemailer';
import { ENV } from './env.js';

let transporter = null;

// Initialize Gmail SMTP Transporter if credentials are provided
if (ENV.EMAIL_USER && ENV.EMAIL_PASSWORD && !ENV.EMAIL_USER.includes('your_email')) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: ENV.EMAIL_USER,
      pass: ENV.EMAIL_PASSWORD.replace(/\s+/g, '')
    }
  });
  console.log(`[EMAIL SYSTEM] Initialized Gmail SMTP for: ${ENV.EMAIL_USER}`);
}

/**
 * Send an email notification via Gmail SMTP or Resend Cloud API
 * @param {Object} options - { to, subject, html, text, attachments }
 */
export const sendEmail = async ({ to, subject, html, text, attachments = [] }) => {
  try {
    const fromAddress = ENV.EMAIL_USER 
      ? `"${ENV.TEMPLE_NAME}" <${ENV.EMAIL_USER}>` 
      : (ENV.EMAIL_FROM || 'Shree Siddhivinayak Temple <onboarding@resend.dev>');

    // 1. Prioritize Gmail SMTP if configured (100% unrestricted live delivery to ANY email)
    if (transporter) {
      const mailOptions = {
        from: fromAddress,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        text: text || '',
        html
      };
      if (attachments && attachments.length > 0) {
        mailOptions.attachments = attachments;
      }
      const info = await transporter.sendMail(mailOptions);
      console.log(`[GMAIL SMTP DISPATCHED] ID: ${info.messageId} to ${to}`);
      return { success: true, service: 'gmail', messageId: info.messageId, to };
    }

    // 2. Resend Cloud API Fallback
    if (ENV.RESEND_API_KEY) {
      const resendPayload = {
        from: ENV.EMAIL_FROM || 'Shree Siddhivinayak Temple <onboarding@resend.dev>',
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        text: text || ''
      };
      if (attachments && attachments.length > 0) {
        resendPayload.attachments = attachments.map(att => ({
          filename: att.filename || 'attachment.png',
          content: att.content ? (Buffer.isBuffer(att.content) ? att.content.toString('base64') : att.content) : undefined
        }));
      }

      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ENV.RESEND_API_KEY}`
        },
        body: JSON.stringify(resendPayload)
      });

      const resData = await resendRes.json();
      if (resendRes.ok && resData.id) {
        console.log(`[RESEND REAL EMAIL DISPATCHED] ID: ${resData.id} to ${to}`);
        return { success: true, service: 'resend', messageId: resData.id, to };
      } else {
        console.warn(`[RESEND API NOTICE]:`, resData);
        // If Resend test key is restricted to owner email, forward to kulkarnisourabh807@gmail.com
        if (resData.message && resData.message.includes('kulkarnisourabh807@gmail.com') && to !== 'kulkarnisourabh807@gmail.com') {
          console.log(`[RESEND TEST MODE] Forwarding email intended for ${to} to verified owner kulkarnisourabh807@gmail.com...`);
          const fallbackRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${ENV.RESEND_API_KEY}`
            },
            body: JSON.stringify({
              from: ENV.EMAIL_FROM || 'Shree Siddhivinayak Temple <onboarding@resend.dev>',
              to: ['kulkarnisourabh807@gmail.com'],
              subject: `[Devotee: ${to}] ${subject}`,
              html: `<div style="background:#fffbeb;border:1px solid #fde68a;padding:8px 12px;margin-bottom:12px;border-radius:6px;font-size:12px;color:#78350f;"><strong>[Dev Test Forwarding]</strong> This message was requested for: <code>${to}</code></div>` + html,
              text: text || ''
            })
          });
          const fbData = await fallbackRes.json();
          if (fallbackRes.ok && fbData.id) {
            console.log(`[RESEND REAL EMAIL DISPATCHED TO OWNER] ID: ${fbData.id} for devotee ${to}`);
            return { success: true, service: 'resend', messageId: fbData.id, forwardedTo: 'kulkarnisourabh807@gmail.com', originalTo: to };
          }
        }
        return { 
          success: false, 
          service: 'resend', 
          error: resData.message || 'Resend API rejected dispatch',
          details: resData,
          to
        };
      }
    }

    // 3. Simulated Demo Fallback
    console.log(`[EMAIL SYSTEM (DEMO MODE)]:`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log(`----------------------------------------`);
    return { success: true, simulated: true, messageId: `demo-${Date.now()}` };
  } catch (error) {
    console.warn(`[EMAIL WARNING] Failed to deliver email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};
