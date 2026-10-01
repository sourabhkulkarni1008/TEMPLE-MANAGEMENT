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

// REST API Route Mounts
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/darshan', darshanRoutes);
app.use('/api/crowd', crowdRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/festivals', festivalRoutes);
app.use('/api/lost-found', lostFoundRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/iot', iotRoutes);
app.use('/api/chatbot', chatbotRoutes);

// 404 Not Found Handler
app.use(notFoundHandler);

// Centralized Error Handler
app.use(errorHandler);

export default app;
