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

  bookingConfirmation: (booking) => {
    const bId = booking.id || 'DAR-PASS';
    const qrData = booking.qrToken || bId;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(qrData)}&color=0f172a&bgcolor=ffffff&margin=2&ecc=M`;

    return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 15px; }
      .container { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1.5px solid #d97706; overflow: hidden; box-shadow: 0 8px 30px rgba(0,0,0,0.08); }
      .header { background: linear-gradient(135deg, #0f172a 0%, #311302 50%, #b45309 100%); color: #ffffff; padding: 26px 20px; text-align: center; border-bottom: 3px solid #f59e0b; }
      .content { padding: 26px 22px; line-height: 1.6; }
      .badge-confirmed { display: inline-block; background: #dcfce7; color: #166534; padding: 5px 14px; border-radius: 9999px; font-weight: 700; font-size: 13px; border: 1px solid #86efac; margin-bottom: 14px; }
      .qr-card { background: #fffbeb; border: 2px solid #b45309; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0; box-shadow: 0 4px 14px rgba(217,119,6,0.12); }
      .qr-img { width: 220px; height: 220px; display: block; margin: 0 auto 12px auto; background: #ffffff; padding: 10px; border-radius: 8px; border: 1.5px solid #d97706; }
      .booking-box { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 18px 0; }
      .row { display: flex; justify-content: space-between; margin-bottom: 8px; border-bottom: 1px dashed #f1f5f9; padding-bottom: 6px; font-size: 14px; }
      .label { font-weight: 600; color: #64748b; }
      .val { color: #0f172a; font-weight: 700; }
      .guidelines { background: #f8fafc; border-left: 4px solid #b45309; padding: 12px 16px; font-size: 13px; color: #475569; margin: 18px 0; border-radius: 0 8px 8px 0; }
      .footer { background: #0f172a; color: #94a3b8; padding: 20px; text-align: center; font-size: 12px; line-height: 1.5; }
    </style></head>
    <body>
      <div class="container">
        <div class="header">
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #fde047; font-weight: 700; margin-bottom: 4px;">
            Official Digital Darshan E-Ticket
          </div>
          <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">${ENV.TEMPLE_NAME}</h1>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #fef08a;">Prabhadevi, Mumbai &bull; Smart Pilgrim Management</p>
        </div>

        <div class="content">
          <div style="text-align: center;">
            <span class="badge-confirmed">&#10003; DARSHAN ENTRY PASS CONFIRMED</span>
          </div>

          <p style="font-size: 15px; margin-top: 6px;">🙏 <strong>Namaste ${booking.primaryPilgrimName || 'Devotee'}</strong>,</p>
          <p style="font-size: 14px; color: #334155; margin-top: -4px;">
            Your Darshan registration has been recorded with the temple administration. Please present the official QR pass below at <strong>Gate 1 or Gate 2 Turnstile Scanner</strong> for verified entry.
          </p>

          <!-- OFFICIAL SCANNABLE QR CODE CARD -->
          <div class="qr-card">
            <div style="font-size: 11px; text-transform: uppercase; color: #b45309; font-weight: 800; letter-spacing: 1.5px; margin-bottom: 10px;">
              &#9733; Official Gate Entry QR Code &#9733;
            </div>
            
            <img class="qr-img" src="${qrUrl}" alt="Devotee Darshan Entry QR Pass" width="220" height="220" />
            
            <div style="font-family: monospace; font-size: 18px; font-weight: 800; color: #b45309; letter-spacing: 1px;">
              ${bId}
            </div>
            <div style="font-family: monospace; font-size: 12px; color: #0f172a; font-weight: 700; margin-top: 6px; padding: 4px 12px; background: #fef3c7; border: 1px dashed #d97706; border-radius: 6px; display: inline-block; word-break: break-all;">
              Gate Verification Key: ${qrData}
            </div>
            <div style="font-size: 12px; color: #166534; font-weight: 600; margin-top: 10px; background: #dcfce7; display: block; padding: 6px 12px; border-radius: 8px;">
              &#10003; 100% Synchronized with Web Pass &bull; Optical Gate Scanner & Manual Entry Ready
            </div>
          </div>

          <!-- BOOKING DETAILS -->
          <div class="booking-box">
            <div class="row">
              <span class="label">Primary Devotee:</span>
              <span class="val">${booking.primaryPilgrimName || 'Devotee'}</span>
            </div>
            <div class="row">
              <span class="label">Visit Date:</span>
              <span class="val" style="color:#b45309;">${booking.bookingDate || 'Scheduled Date'}</span>
            </div>
            <div class="row">
              <span class="label">Allotted Time Slot:</span>
              <span class="val" style="color:#15803d; background:#dcfce7; padding:1px 6px; border-radius:4px;">${booking.slotTime || 'Allotted Slot'}</span>
            </div>
            <div class="row">
              <span class="label">Darshan Category:</span>
              <span class="val">${booking.darshanType || 'General Darshan'}</span>
            </div>
            <div class="row">
              <span class="label">Devotee Party Size:</span>
              <span class="val">${booking.numberOfPeople || 1} Person(s)</span>
            </div>
            ${booking.primaryPilgrimIdProof ? `
            <div class="row" style="border-bottom:none;">
              <span class="label">Registered Govt ID:</span>
              <span class="val">${booking.primaryPilgrimIdProof}</span>
            </div>
            ` : ''}
          </div>

          <!-- GUIDELINES -->
          <div class="guidelines">
            <strong style="color: #0f172a; display: block; margin-bottom: 4px;">Important Pilgrim Guidelines:</strong>
            <ul style="margin: 0; padding-left: 18px; line-height: 1.6;">
              <li>Please arrive 15 minutes before your booked time slot.</li>
              <li>Display this email with the QR code on your mobile phone screen or carry a printed copy.</li>
              <li>Please follow the traditional attire guidelines inside the sanctum.</li>
              <li>Free footwear deposit counters are available at Gate 1 and Gate 2.</li>
            </ul>
          </div>
        </div>

        <div class="footer">
          <strong style="color: #f1f5f9;">${ENV.TEMPLE_NAME}</strong><br>
          ${ENV.TEMPLE_LOCATION} &bull; Helpline: ${ENV.TEMPLE_CONTACT_PHONE}<br>
          <span style="opacity: 0.7; font-size: 11px;">May Lord Ganesha bestow peace, prosperity, and wisdom upon you and your family.</span>
        </div>
      </div>
    </body>
    </html>
    `;
  },

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
  `,

  otpVerification: (otpCode, email) => `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
      .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #fde68a; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.06); }
      .header { background: linear-gradient(135deg, #b45309, #d97706); color: #ffffff; padding: 28px 24px; text-align: center; }
      .content { padding: 28px 24px; line-height: 1.6; text-align: center; }
      .otp-box { background: #fffbeb; border: 2px dashed #b45309; border-radius: 10px; padding: 16px; margin: 20px auto; max-width: 260px; font-family: monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #b45309; }
      .footer { background: #f1f5f9; padding: 16px; text-align: center; font-size: 13px; color: #64748b; }
    </style></head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin:0; font-size:22px;">${ENV.TEMPLE_NAME}</h2>
          <p style="margin:6px 0 0 0; font-size:14px; opacity:0.95;">Devotee Identity Verification</p>
        </div>
        <div class="content">
          <p style="font-size:16px; margin-top:0;">🙏 <strong>Namaste Devotee</strong>,</p>
          <p>Please enter the one-time verification code below to verify your email (<strong>${email}</strong>) and unlock online Darshan booking:</p>
          
          <div class="otp-box">${otpCode}</div>
          
          <p style="font-size:13px; color:#64748b;">This code is valid for 5 minutes. For your security, never share this code with anyone.</p>
        </div>
        <div class="footer">
          ${ENV.TEMPLE_NAME} &bull; ${ENV.TEMPLE_LOCATION} &bull; Helpline: ${ENV.TEMPLE_CONTACT_PHONE}
        </div>
      </div>
    </body>
    </html>
  `
};
