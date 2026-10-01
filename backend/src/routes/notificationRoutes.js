import express from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  broadcastNotification
} from '../controllers/notificationController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';

const router = express.Router();

router.get('/', (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return requireAuth(req, res, next);
  }
  next();
}, getNotifications);

router.put('/:id/read', markAsRead);
router.post('/read-all', requireAuth, markAllAsRead);
router.post('/broadcast', requireAuth, requireRole('ADMIN'), broadcastNotification);

export default router;
