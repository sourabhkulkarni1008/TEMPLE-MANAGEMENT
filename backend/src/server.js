import app from './app.js';
import { ENV } from './config/env.js';

const PORT = ENV.PORT || 5000;
const USE_LOCAL_STORAGE = process.env.USE_LOCAL_STORAGE !== 'false';

const server = app.listen(PORT, async () => {
  console.log(`========================================================`);
  console.log(` SMART TEMPLE MANAGEMENT & PILGRIM FLOW SYSTEM - BACKEND `);
  console.log(`========================================================`);
  console.log(` [API SERVER] Running at: http://localhost:${PORT}`);
  console.log(` [HEALTH CHECK]: http://localhost:${PORT}/api/health`);
  console.log(` [ENVIRONMENT]: ${ENV.NODE_ENV}`);
  console.log(` [DATA STORE]: ${USE_LOCAL_STORAGE ? 'JSON File Store' : 'MySQL Database'}`);
  console.log(` [AI SERVICE TARGET]: ${ENV.AI_SERVICE_URL}`);
  console.log(` [EMAIL TRANSPORTER]: ${ENV.RESEND_API_KEY ? 'Resend API' : ENV.EMAIL_USER ? 'Configured SMTP' : 'Demo Console Logger'}`);
  console.log(`========================================================`);

  // Test MySQL connection on startup
  if (!USE_LOCAL_STORAGE) {
    try {
      const { testConnection } = await import('./config/database.js');
      await testConnection();
    } catch (err) {
      console.error('[SERVER] ⚠️  MySQL connection test failed:', err.message);
      console.error('[SERVER] The server will continue running but database queries will fail.');
    }
  }
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[SERVER] SIGTERM received. Shutting down gracefully.');
  if (!USE_LOCAL_STORAGE) {
    try {
      const { closePool } = await import('./config/database.js');
      await closePool();
    } catch (_) {}
  }
  server.close(() => {
    process.exit(0);
  });
});

