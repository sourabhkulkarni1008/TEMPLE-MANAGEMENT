import express from 'express';
import {
  getCrowdStatus,
  getAreaCrowd,
  updateCrowd,
  simulateCrowdTick
} from '../controllers/crowdController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';

const router = express.Router();

// Public / Authenticated read access
router.get('/', getCrowdStatus);
router.get('/:area', getAreaCrowd);

// AI service, Sensor, or Admin update
router.post('/update', updateCrowd);

// Demo simulation tick (for project review / demo)
router.post('/demo-tick', simulateCrowdTick);

export default router;
