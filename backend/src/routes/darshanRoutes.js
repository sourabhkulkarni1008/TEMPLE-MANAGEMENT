import express from 'express';
import {
  getDarshanTypes,
  getDarshanSlots,
  createDarshanSlot
} from '../controllers/darshanController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';

const router = express.Router();

router.get('/types', getDarshanTypes);
router.get('/slots', getDarshanSlots);
router.post('/slots', requireAuth, requireRole('ADMIN'), createDarshanSlot);

export default router;
