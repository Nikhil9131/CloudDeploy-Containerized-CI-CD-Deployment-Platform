const monitoringService = require('../services/monitoringService');

async function getDashboard(req, res, next) {
  try {
    const data = await monitoringService.getDashboardMetrics();
    res.status(200).json({
      success: true,
      data
    });
  } catch (err) {
    next(err);
  }
}

async function getMetrics(req, res, next) {
  try {
    const data = await monitoringService.getDetailedMetrics();
    res.status(200).json({
      success: true,
      data
    });
  } catch (err) {
    next(err);
  }
}

function getHealth(req, res) {
  const health = monitoringService.getSystemHealth();
  res.status(200).json(health);
}

module.exports = {
  getDashboard,
  getMetrics,
  getHealth
};
