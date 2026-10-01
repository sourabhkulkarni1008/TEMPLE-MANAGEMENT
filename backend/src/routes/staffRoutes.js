import express from 'express';
import {
  getStaffList,
  createStaff,
  updateStaff,
  deleteStaff
} from '../controllers/staffController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';

const router = express.Router();

router.get('/', requireAuth, requireRole('ADMIN', 'STAFF'), getStaffList);
router.post('/', requireAuth, requireRole('ADMIN'), createStaff);
router.put('/:id', requireAuth, requireRole('ADMIN', 'STAFF'), updateStaff);
router.delete('/:id', requireAuth, requireRole('ADMIN'), deleteStaff);

export default router;
