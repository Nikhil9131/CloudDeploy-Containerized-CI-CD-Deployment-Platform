const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { authenticate } = require('../middleware/authMiddleware');
const { deploymentLimiter } = require('../middleware/rateLimitMiddleware');

// All application routes require authentication
router.use(authenticate);

router.get('/', applicationController.getAll);
router.post('/', applicationController.create);
router.get('/:id', applicationController.getById);
router.put('/:id', applicationController.update);
router.delete('/:id', applicationController.remove);

// Dynamic Operations: Scale Replicas & Trigger Failure Simulation
router.patch('/:id/scale', applicationController.scale);
router.post('/:id/simulate-failure', applicationController.simulateFailure);

// Nested deployment endpoints
router.get('/:id/deployments', applicationController.getApplicationDeployments);
router.post('/:id/deploy', deploymentLimiter, applicationController.deployApplication);

module.exports = router;
