import app from './app.js';
import { ENV } from './config/env.js';

const PORT = ENV.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`========================================================`);
  console.log(` SMART TEMPLE MANAGEMENT & PILGRIM FLOW SYSTEM - BACKEND `);
  console.log(`========================================================`);
  console.log(` [API SERVER] Running at: http://localhost:${PORT}`);
  console.log(` [HEALTH CHECK]: http://localhost:${PORT}/api/health`);
  console.log(` [ENVIRONMENT]: ${ENV.NODE_ENV}`);
  console.log(` [AI SERVICE TARGET]: ${ENV.AI_SERVICE_URL}`);
  console.log(` [EMAIL TRANSPORTER]: ${ENV.EMAIL_USER ? 'Configured SMTP' : 'Demo Console Logger'}`);
  console.log(`========================================================`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('[SERVER] SIGTERM received. Shutting down gracefully.');
  server.close(() => {
    process.exit(0);
  });
});
