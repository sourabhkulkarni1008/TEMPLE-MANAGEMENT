import express from 'express';
import {
  getLostFoundItems,
  reportLostFoundItem,
  updateLostFoundStatus
} from '../controllers/lostFoundController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';

const router = express.Router();

router.get('/', getLostFoundItems);
router.post('/', (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return requireAuth(req, res, next);
  }
  next();
}, reportLostFoundItem);
router.put('/:id', requireAuth, requireRole('STAFF', 'ADMIN'), updateLostFoundStatus);

export default router;
