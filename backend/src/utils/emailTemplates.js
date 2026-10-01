import { ENV } from '../config/env.js';

export const emailTemplates = {
  welcome: (userName) => `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
      .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden; }
      .header { background: #b45309; color: #ffffff; padding: 24px; text-align: center; }
      .content { padding: 24px; line-height: 1.6; }
      .footer { background: #f1f5f9; padding: 16px; text-align: center; font-size: 13px; color: #64748b; }
    </style></head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin:0;">${ENV.TEMPLE_NAME}</h2>
          <p style="margin:4px 0 0 0; font-size:14px; opacity:0.9;">Smart Pilgrim Portal</p>
        </div>
        <div class="content">
          <h3>Welcome, ${userName}!</h3>
          <p>Your account has been successfully created in the Temple Management & Pilgrim Flow System.</p>
          <p>You can now:</p>
          <ul>
            <li>Book Darshan time slots in advance</li>
            <li>Check live temple crowd density before your visit</li>
            <li>Access your digital QR entry pass anytime</li>
            <li>Request emergency assistance while on temple grounds</li>
          </ul>
          <p>We wish you a peaceful and auspicious visit.</p>
        </div>
        <div class="footer">
          ${ENV.TEMPLE_NAME} &bull; ${ENV.TEMPLE_LOCATION} &bull; Helpline: ${ENV.TEMPLE_CONTACT_PHONE}
        </div>
      </div>
    </body>
    </html>
  `,

  bookingConfirmation: (booking) => `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
      .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden; }
      .header { background: #b45309; color: #ffffff; padding: 24px; text-align: center; }
      .content { padding: 24px; line-height: 1.6; }
      .badge { display: inline-block; background: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 9999px; font-weight: 600; font-size: 13px; margin-bottom: 16px; }
      .booking-box { background: #fdf6ec; border: 1px solid #fde68a; border-radius: 6px; padding: 18px; margin: 16px 0; }
      .row { display: flex; justify-content: space-between; margin-bottom: 8px; border-bottom: 1px dashed #e2e8f0; padding-bottom: 4px; }
      .label { font-weight: 600; color: #475569; }
      .val { color: #0f172a; font-weight: 500; }
      .footer { background: #f1f5f9; padding: 16px; text-align: center; font-size: 13px; color: #64748b; }
    </style></head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin:0;">${ENV.TEMPLE_NAME}</h2>
          <p style="margin:4px 0 0 0; font-size:14px;">Darshan Booking Confirmation</p>
        </div>
        <div class="content">
          <span class="badge">&check; Booking Confirmed</span>
          <p>Dear <strong>${booking.primaryPilgrimName}</strong>,</p>
          <p>Your darshan booking has been successfully confirmed. Below are your visit details:</p>
          
          <div class="booking-box">
            <div class="row"><span class="label">Booking ID:</span><span class="val">${booking.id}</span></div>
            <div class="row"><span class="label">Darshan Type:</span><span class="val">${booking.darshanType}</span></div>
            <div class="row"><span class="label">Date:</span><span class="val">${booking.bookingDate}</span></div>
            <div class="row"><span class="label">Time Slot:</span><span class="val">${booking.slotTime}</span></div>
            <div class="row"><span class="label">Pilgrims:</span><span class="val">${booking.numberOfPeople} Person(s)</span></div>
            <div class="row"><span class="label">Token / QR ID:</span><span class="val">${booking.qrToken}</span></div>
          </div>

          <p><strong>Instructions for your visit:</strong></p>
          <ul>
            <li>Please arrive at the Entry Gate 15 minutes prior to your time slot.</li>
            <li>Have your digital QR code ready on your mobile screen or bring a printed copy.</li>
            <li>Follow the traditional dress code guidelines specified on the temple portal.</li>
          </ul>
        </div>
        <div class="footer">
          ${ENV.TEMPLE_NAME} &bull; ${ENV.TEMPLE_LOCATION}
        </div>
      </div>
    </body>
    </html>
  `,

  bookingCancellation: (booking) => `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
      .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden; }
      .header { background: #991b1b; color: #ffffff; padding: 24px; text-align: center; }
      .content { padding: 24px; line-height: 1.6; }
      .footer { background: #f1f5f9; padding: 16px; text-align: center; font-size: 13px; color: #64748b; }
    </style></head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin:0;">${ENV.TEMPLE_NAME}</h2>
          <p style="margin:4px 0 0 0; font-size:14px;">Darshan Booking Cancellation</p>
        </div>
        <div class="content">
          <p>Dear <strong>${booking.primaryPilgrimName}</strong>,</p>
          <p>Your darshan booking <strong>${booking.id}</strong> scheduled for <strong>${booking.bookingDate} (${booking.slotTime})</strong> has been cancelled.</p>
          <p>If you did not request this cancellation, please contact the temple administration desk immediately.</p>
        </div>
        <div class="footer">
          ${ENV.TEMPLE_NAME} &bull; ${ENV.TEMPLE_LOCATION} &bull; Helpline: ${ENV.TEMPLE_CONTACT_PHONE}
        </div>
      </div>
    </body>
    </html>
  `,

  passwordReset: (resetUrl) => `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
      .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden; }
      .header { background: #b45309; color: #ffffff; padding: 24px; text-align: center; }
      .content { padding: 24px; line-height: 1.6; }
      .btn { display: inline-block; background: #b45309; color: #ffffff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 600; margin: 16px 0; }
      .footer { background: #f1f5f9; padding: 16px; text-align: center; font-size: 13px; color: #64748b; }
    </style></head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin:0;">${ENV.TEMPLE_NAME}</h2>
          <p style="margin:4px 0 0 0; font-size:14px;">Password Reset Request</p>
        </div>
        <div class="content">
          <p>You requested to reset your password. Click the link below to set a new password:</p>
          <p><a class="btn" href="${resetUrl}" target="_blank">Reset My Password</a></p>
          <p>If you did not make this request, you can safely ignore this email.</p>
        </div>
        <div class="footer">
          ${ENV.TEMPLE_NAME} &bull; Security & Administration
        </div>
      </div>
    </body>
    </html>
  `
};
