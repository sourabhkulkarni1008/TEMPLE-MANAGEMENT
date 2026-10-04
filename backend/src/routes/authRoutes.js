import express from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
  sendOtp,
  verifyOtp
} from '../controllers/authController.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { validateRegistration, validateLogin } from '../middleware/validate.js';

const router = express.Router();

router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);
router.post('/send-otp', optionalAuth, sendOtp);
router.post('/verify-otp', optionalAuth, verifyOtp);
router.get('/me', requireAuth, getMe);
router.put('/profile', requireAuth, updateProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
