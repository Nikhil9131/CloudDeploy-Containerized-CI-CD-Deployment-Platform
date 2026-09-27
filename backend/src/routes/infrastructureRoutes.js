const express = require('express');
const router = express.Router();
const infrastructureController = require('../controllers/infrastructureController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/', infrastructureController.getDetails);
router.get('/cluster', infrastructureController.getCluster);

module.exports = router;
