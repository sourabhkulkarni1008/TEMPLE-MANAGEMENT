import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/authRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import darshanRoutes from './routes/darshanRoutes.js';
import crowdRoutes from './routes/crowdRoutes.js';
import queueRoutes from './routes/queueRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
import emergencyRoutes from './routes/emergencyRoutes.js';
import festivalRoutes from './routes/festivalRoutes.js';
import lostFoundRoutes from './routes/lostFoundRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import iotRoutes from './routes/iotRoutes.js';
import chatbotRoutes from './routes/chatbotRoutes.js';

import { sendEmail } from './config/email.js';
import { emailTemplates } from './utils/emailTemplates.js';
import { db } from './data/store.js';
import { generateQrBuffer } from './utils/qrGenerator.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();

// Security Headers
app.use(helmet({
  crossOriginResourcePolicy: false
}));

// CORS Configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging
app.use(morgan('dev'));

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Auth Rate Limiting (Protects against brute force while remaining friendly for testing)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.'
  }
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Root Endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Smart Temple Management API Backend is active',
    documentation: '/api/health',
    version: '1.0.0'
  });
});

app.get('/favicon.ico', (req, res) => res.status(204).end());

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'Smart Temple Management API Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// REST API Route Mounts (Supports both /api/* and /* for maximum client compatibility)
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/bookings', bookingRoutes);
app.use('/api/darshan', darshanRoutes);
app.use('/darshan', darshanRoutes);
app.use('/api/crowd', crowdRoutes);
app.use('/crowd', crowdRoutes);
app.use('/api/queue', queueRoutes);
app.use('/queue', queueRoutes);
app.use('/api/staff', staffRoutes);
app.use('/staff', staffRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/emergency', emergencyRoutes);
app.use('/api/festivals', festivalRoutes);
app.use('/festivals', festivalRoutes);
app.use('/api/lost-found', lostFoundRoutes);
app.use('/lost-found', lostFoundRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/reports', reportRoutes);
app.use('/api/iot', iotRoutes);
app.use('/iot', iotRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/chatbot', chatbotRoutes);

// Direct Real-Time Email Endpoints (Resend API)
app.post('/api/email/send-pass', async (req, res) => {
  try {
    const { to, pilgrimName, bookingId, bookingDate, slotTime, darshanType, numberOfPeople, qrToken, idProof } = req.body;
    if (!to) {
      return res.status(400).json({ success: false, message: 'Recipient email is required.' });
    }

    // Lookup real registered booking from database to guarantee 100% QR token synchronization
    let dbBooking = null;
    if (bookingId) {
      dbBooking = db.findById('bookings', bookingId) || db.findOne('bookings', b => b.id === bookingId || b.id.toUpperCase() === bookingId.toUpperCase());
    }

    const bId = dbBooking?.id || bookingId || `DAR-${Date.now().toString().slice(-6)}`;
    const passQrToken = dbBooking?.qrToken || qrToken || `QR-${bId}-PASS`;
    const finalPilgrimName = dbBooking?.primaryPilgrimName || pilgrimName || 'Devotee';
    const finalBookingDate = dbBooking?.bookingDate || bookingDate || new Date().toISOString().split('T')[0];
    const finalSlotTime = dbBooking?.slotTime || slotTime || '08:00 AM - 10:00 AM';
    const finalDarshanType = dbBooking?.darshanType || darshanType || 'General Darshan';
    const finalNumberOfPeople = dbBooking?.numberOfPeople || numberOfPeople || 1;
    const finalIdProof = dbBooking?.primaryPilgrimIdProof || idProof || 'AADHAAR (Verified)';

    // Attach real high-res PNG file of the exact gate QR pass
    const qrBuffer = await generateQrBuffer(passQrToken);
    const attachments = [];
    if (qrBuffer) {
      attachments.push({
        filename: `${bId}-Gate-Pass-QR.png`,
        content: qrBuffer,
        contentType: 'image/png'
      });
    }

    const result = await sendEmail({
      to,
      subject: `🪔 Digital Darshan Pass & Gate QR Code (${bId}) - Shree Siddhivinayak Temple`,
      html: emailTemplates.bookingConfirmation({
        id: bId,
        primaryPilgrimName: finalPilgrimName,
        bookingDate: finalBookingDate,
        slotTime: finalSlotTime,
        darshanType: finalDarshanType,
        numberOfPeople: finalNumberOfPeople,
        qrToken: passQrToken,
        primaryPilgrimIdProof: finalIdProof
      }),
      attachments
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/email/send-otp', async (req, res) => {
  try {
    const { to, otp } = req.body;
    if (!to) {
      return res.status(400).json({ success: false, message: 'Recipient email is required.' });
    }
    const code = otp || String(Math.floor(100000 + Math.random() * 900000));
    const result = await sendEmail({
      to,
      subject: `🔐 Your Shree Siddhivinayak Temple Verification Code: ${code}`,
      html: emailTemplates.otpVerification(code, to)
    });
    res.json({ ...result, otp: code });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/email/test', async (req, res) => {
  try {
    const { to } = req.body;
    const result = await sendEmail({
      to: to || 'devotee@example.com',
      subject: '🙏 Test Dispatch from Shree Siddhivinayak Temple Seva Portal',
      html: emailTemplates.welcome('Devotee')
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 404 Not Found Handler
app.use(notFoundHandler);

// Centralized Error Handler
app.use(errorHandler);

export default app;
