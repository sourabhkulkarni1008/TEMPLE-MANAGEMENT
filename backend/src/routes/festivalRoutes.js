import express from 'express';
import {
  getFestivals,
  createFestival,
  updateFestival,
  deleteFestival
} from '../controllers/festivalController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';

const router = express.Router();

router.get('/', getFestivals);
router.post('/', requireAuth, requireRole('ADMIN'), createFestival);
router.put('/:id', requireAuth, requireRole('ADMIN'), updateFestival);
router.delete('/:id', requireAuth, requireRole('ADMIN'), deleteFestival);

export default router;
