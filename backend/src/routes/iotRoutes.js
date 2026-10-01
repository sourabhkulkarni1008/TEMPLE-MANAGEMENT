import express from 'express';
import { ingestIotCrowd } from '../controllers/iotController.js';

const router = express.Router();

// Public IoT Ingestion endpoint (or protected via api key in production)
router.post('/crowd', ingestIotCrowd);

export default router;
