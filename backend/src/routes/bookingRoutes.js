import express from 'express';
import {
  createBooking,
  getBookings,
  getBookingById,
  cancelBooking,
  verifyQr
} from '../controllers/bookingController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import { validateBooking } from '../middleware/validate.js';

const router = express.Router();

router.post('/', requireAuth, validateBooking, createBooking);
router.get('/', requireAuth, getBookings);
router.get('/:id', requireAuth, getBookingById);
router.delete('/:id', requireAuth, cancelBooking);

// QR verification by Staff / Admin
router.post('/verify-qr', requireAuth, requireRole('STAFF', 'ADMIN'), verifyQr);

export default router;
