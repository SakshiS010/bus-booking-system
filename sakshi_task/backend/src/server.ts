import { app } from './app.js';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';
import { processExpiredBookings } from './services/booking.service.js';
import { pool } from './config/database.js';

const PORT = config.port;

// Start server
const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${config.nodeEnv}`);
  logger.info(`Health check: http://localhost:${PORT}/health`);
});

// Start booking expiry background job (runs every minute)
const EXPIRY_CHECK_INTERVAL = 60000; // 1 minute

setInterval(async () => {
  logger.debug('Running booking expiry check');
  await processExpiredBookings();
}, EXPIRY_CHECK_INTERVAL);

logger.info('Booking expiry job started (runs every 60 seconds)');

// Graceful shutdown
const gracefulShutdown = async () => {
  logger.info('Received shutdown signal, closing server gracefully...');
  
  server.close(async () => {
    logger.info('HTTP server closed');
    
    try {
      await pool.end();
      logger.info('Database connections closed');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown', { error });
      process.exit(1);
    }
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
