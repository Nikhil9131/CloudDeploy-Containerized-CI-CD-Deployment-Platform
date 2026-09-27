const { z } = require('zod');
const deploymentService = require('../services/deploymentService');

const triggerDeploymentSchema = z.object({
  applicationId: z.string().min(1, 'Application ID is required'),
  customVersion: z.string().optional(),
  branch: z.string().optional(),
  simulateFailure: z.boolean().optional(),
  failAtStage: z.number().int().min(1).max(11).optional()
});

async function getAll(req, res, next) {
  try {
    const deployments = await deploymentService.getDeployments(req.query);
    res.status(200).json({
      success: true,
      data: deployments
    });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const deployment = await deploymentService.getDeploymentById(req.params.id);
    res.status(200).json({
      success: true,
      data: deployment
    });
  } catch (err) {
    next(err);
  }
}

async function trigger(req, res, next) {
  try {
    const validated = triggerDeploymentSchema.parse(req.body);
    const deployment = await deploymentService.triggerDeployment(
      validated.applicationId,
      req.user,
      validated
    );
    res.status(201).json({
      success: true,
      message: 'Deployment pipeline initiated successfully',
      data: deployment
    });
  } catch (err) {
    next(err);
  }
}

async function cancel(req, res, next) {
  try {
    const cancelled = await deploymentService.cancelDeployment(req.params.id, req.user);
    res.status(200).json({
      success: true,
      message: 'Deployment cancelled successfully',
      data: cancelled
    });
  } catch (err) {
    next(err);
  }
}

async function rollback(req, res, next) {
  try {
    const rollbackDep = await deploymentService.rollbackDeployment(req.params.id, req.user);
    res.status(201).json({
      success: true,
      message: 'Rollback pipeline initiated successfully',
      data: rollbackDep
    });
  } catch (err) {
    next(err);
  }
}

async function getLogs(req, res, next) {
  try {
    const logs = await deploymentService.getDeploymentLogs(req.params.id, req.query.level);
    res.status(200).json({
      success: true,
      data: logs
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAll,
  getById,
  trigger,
  cancel,
  rollback,
  getLogs,
  triggerDeploymentSchema
};
