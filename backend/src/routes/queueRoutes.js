import express from 'express';
import {
  getQueueStatus,
  advanceNextToken,
  pauseQueue,
  resumeQueue,
  updateQueueManual
} from '../controllers/queueController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';

const router = express.Router();

// Public & Authenticated live view
router.get('/', getQueueStatus);

// Staff & Admin queue controls
router.post('/next', requireAuth, requireRole('STAFF', 'ADMIN'), advanceNextToken);
router.post('/pause', requireAuth, requireRole('STAFF', 'ADMIN'), pauseQueue);
router.post('/resume', requireAuth, requireRole('STAFF', 'ADMIN'), resumeQueue);
router.put('/:id', requireAuth, requireRole('STAFF', 'ADMIN'), updateQueueManual);

export default router;
