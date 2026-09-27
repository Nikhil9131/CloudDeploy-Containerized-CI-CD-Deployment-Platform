const express = require('express');
const router = express.Router();
const monitoringController = require('../controllers/monitoringController');
const { authenticate } = require('../middleware/authMiddleware');

router.get('/health', monitoringController.getHealth);
router.get('/dashboard', authenticate, monitoringController.getDashboard);
router.get('/metrics', authenticate, monitoringController.getMetrics);

module.exports = router;
