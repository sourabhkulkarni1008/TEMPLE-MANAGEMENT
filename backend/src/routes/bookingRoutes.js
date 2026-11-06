import express from 'express';
import {
  createBooking,
  getBookings,
  getBookingById,
  cancelBooking,
  rescheduleBooking,
  verifyQr
} from '../controllers/bookingController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import { validateBooking } from '../middleware/validate.js';

const router = express.Router();

router.post('/', requireAuth, validateBooking, createBooking);
router.get('/', requireAuth, getBookings);
router.get('/:id', requireAuth, getBookingById);
router.put('/:id/reschedule', requireAuth, rescheduleBooking);
router.delete('/:id', requireAuth, cancelBooking);

// QR verification by Staff / Admin
router.post('/verify-qr', requireAuth, requireRole('STAFF', 'ADMIN'), verifyQr);

export default router;
