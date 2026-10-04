import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';

/**
 * Generate signed JWT token
 * @param {Object} payload - { id, email, role, name }
 * @returns {string}
 */
export const generateToken = (payload) => {
  return jwt.sign(payload, ENV.JWT_SECRET, {
    expiresIn: ENV.JWT_EXPIRES_IN
  });
};

/**
 * Verify JWT token
 * @param {string} token
 * @returns {Object} decoded payload
 */
export const verifyToken = (token) => {
  return jwt.verify(token, ENV.JWT_SECRET);
};

/**
 * Generate unique human-readable Booking ID
 * Format: DAR-2026-000125
 */
export const generateBookingId = (counter = Math.floor(1000 + Math.random() * 9000)) => {
  const year = new Date().getFullYear();
  const numStr = String(counter).padStart(6, '0');
  return `DAR-${year}-${numStr}`;
};

/**
 * Generate Secure QR Token (clean, high-contrast, human-readable)
 * Format: QR-DAR-2026-000130-A8F2
 */
export const generateQrSecureToken = (bookingId, userId = '') => {
  const randomSalt = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `QR-${bookingId}-${randomSalt}`;
};
