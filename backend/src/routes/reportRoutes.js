import express from 'express';
import {
  getDailyReport,
  getWeeklyReport,
  getMonthlyReport,
  exportCsvReport
} from '../controllers/reportController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';

const router = express.Router();

router.get('/daily', requireAuth, requireRole('ADMIN'), getDailyReport);
router.get('/weekly', requireAuth, requireRole('ADMIN'), getWeeklyReport);
router.get('/monthly', requireAuth, requireRole('ADMIN'), getMonthlyReport);
router.get('/export-csv', requireAuth, requireRole('ADMIN'), exportCsvReport);

export default router;
