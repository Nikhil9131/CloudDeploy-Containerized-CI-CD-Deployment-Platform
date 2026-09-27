const express = require('express');
const router = express.Router();
const deploymentController = require('../controllers/deploymentController');
const { authenticate } = require('../middleware/authMiddleware');
const { deploymentLimiter } = require('../middleware/rateLimitMiddleware');

// All deployment routes require authentication
router.use(authenticate);

router.get('/', deploymentController.getAll);
router.post('/', deploymentLimiter, deploymentController.trigger);
router.get('/:id', deploymentController.getById);
router.post('/:id/cancel', deploymentController.cancel);
router.post('/:id/rollback', deploymentLimiter, deploymentController.rollback);
router.get('/:id/logs', deploymentController.getLogs);

module.exports = router;
