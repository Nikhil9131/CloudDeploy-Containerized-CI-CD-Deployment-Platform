const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const applicationRoutes = require('./applicationRoutes');
const deploymentRoutes = require('./deploymentRoutes');
const monitoringRoutes = require('./monitoringRoutes');
const infrastructureRoutes = require('./infrastructureRoutes');

// API Index Route - Information & Available Endpoints
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'CloudDeploy Containerized CI/CD Deployment Platform API',
    version: '1.0.0',
    status: 'online',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/me'
      },
      applications: {
        list: 'GET /api/applications',
        create: 'POST /api/applications',
        get: 'GET /api/applications/:id',
        update: 'PUT /api/applications/:id',
        delete: 'DELETE /api/applications/:id',
        scale: 'PATCH /api/applications/:id/scale',
        simulateFailure: 'POST /api/applications/:id/simulate-failure',
        deploy: 'POST /api/applications/:id/deploy',
        deployments: 'GET /api/applications/:id/deployments'
      },
      deployments: {
        list: 'GET /api/deployments',
        get: 'GET /api/deployments/:id',
        trigger: 'POST /api/deployments',
        cancel: 'POST /api/deployments/:id/cancel',
        rollback: 'POST /api/deployments/:id/rollback',
        logs: 'GET /api/deployments/:id/logs'
      },
      monitoring: {
        dashboard: 'GET /api/monitoring/dashboard',
        metrics: 'GET /api/monitoring/metrics',
        health: 'GET /api/monitoring/health'
      },
      infrastructure: {
        details: 'GET /api/infrastructure',
        cluster: 'GET /api/infrastructure/cluster'
      }
    }
  });
});

router.use('/auth', authRoutes);
router.use('/applications', applicationRoutes);
router.use('/deployments', deploymentRoutes);
router.use('/monitoring', monitoringRoutes);
router.use('/infrastructure', infrastructureRoutes);

module.exports = router;
