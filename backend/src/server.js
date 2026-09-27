const app = require('./app');
const env = require('./config/env');
const { initDatabase } = require('./config/database');
const logger = require('./utils/logger');

let server = null;

async function startServer() {
  try {
    logger.info('Initializing CloudDeploy Backend Services...');
    
    // Connect to database
    await initDatabase();

    const PORT = env.PORT;
    server = app.listen(PORT, () => {
      logger.info(`========================================================`);
      logger.info(` CloudDeploy Backend API running on port : ${PORT}`);
      logger.info(` Environment                            : ${env.NODE_ENV}`);
      logger.info(` Health Probe Endpoint                  : http://localhost:${PORT}/health`);
      logger.info(` API Root Endpoint                      : http://localhost:${PORT}/api`);
      logger.info(` Infrastructure Provider Mode           : ${env.INFRASTRUCTURE_MODE}`);
      logger.info(` Kubernetes Orchestration Mode          : ${env.KUBERNETES_MODE}`);
      logger.info(`========================================================`);
    });

  } catch (error) {
    logger.error('Failed to start CloudDeploy server:', error);
    process.exit(1);
  }
}

// Graceful termination handling
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received. Gracefully closing HTTP server...');
  if (server) {
    server.close(() => {
      logger.info('HTTP server closed successfully.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received. Terminating process...');
  if (server) {
    server.close(() => {
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

startServer();

module.exports = server;
