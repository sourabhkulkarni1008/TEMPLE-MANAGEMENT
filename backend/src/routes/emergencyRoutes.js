import express from 'express';
import {
  reportEmergency,
  getEmergencies,
  updateEmergencyStatus
} from '../controllers/emergencyController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';

const router = express.Router();

// Anyone can report emergency (optional auth attaches user id)
router.post('/', (req, res, next) => {
  // If token provided, decode user, else proceed as anonymous
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return requireAuth(req, res, next);
  }
  next();
}, reportEmergency);

router.get('/', requireAuth, getEmergencies);
router.put('/:id', requireAuth, requireRole('STAFF', 'ADMIN'), updateEmergencyStatus);

export default router;
