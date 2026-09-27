const awsInfrastructureService = require('../services/awsInfrastructureService');
const kubernetesService = require('../services/kubernetesService');

async function getDetails(req, res, next) {
  try {
    const aws = await awsInfrastructureService.getInfrastructureDetails();
    const k8s = await kubernetesService.getClusterStatus();

    res.status(200).json({
      success: true,
      data: {
        aws,
        kubernetes: k8s
      }
    });
  } catch (err) {
    next(err);
  }
}

async function getCluster(req, res, next) {
  try {
    const k8s = await kubernetesService.getClusterStatus();
    res.status(200).json({
      success: true,
      data: k8s
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDetails,
  getCluster
};
