const { z } = require('zod');
const applicationService = require('../services/applicationService');
const deploymentService = require('../services/deploymentService');

const createApplicationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  gitRepo: z.string().url('GitHub repository must be a valid URL'),
  branch: z.string().default('main'),
  dockerfilePath: z.string().default('./Dockerfile'),
  dockerImage: z.string().min(2, 'Docker image name is required (e.g. org/app:tag)'),
  environment: z.string().default('production'),
  namespace: z.string().default('default'),
  replicas: z.number().int().min(1).max(20).default(2),
  port: z.number().int().min(1).max(65535).default(80)
});

const updateApplicationSchema = createApplicationSchema.partial();

const scaleSchema = z.object({
  replicas: z.number().int().min(1).max(20, 'Maximum replica limit is 20')
});

async function getAll(req, res, next) {
  try {
    const apps = await applicationService.getApplications(req.query, req.user);
    res.status(200).json({
      success: true,
      data: apps
    });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const app = await applicationService.getApplicationById(req.params.id);
    res.status(200).json({
      success: true,
      data: app
    });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const validated = createApplicationSchema.parse(req.body);
    const app = await applicationService.createApplication(validated, req.user.id);
    res.status(201).json({
      success: true,
      message: 'Application registered successfully',
      data: app
    });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const validated = updateApplicationSchema.parse(req.body);
    const updated = await applicationService.updateApplication(req.params.id, validated, req.user);
    res.status(200).json({
      success: true,
      message: 'Application updated successfully',
      data: updated
    });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const deleted = await applicationService.deleteApplication(req.params.id, req.user);
    res.status(200).json({
      success: true,
      message: 'Application deleted successfully',
      data: deleted
    });
  } catch (err) {
    next(err);
  }
}

async function scale(req, res, next) {
  try {
    const validated = scaleSchema.parse(req.body);
    const scaled = await applicationService.scaleApplication(req.params.id, validated.replicas, req.user);
    res.status(200).json({
      success: true,
      message: `Application scaled to ${validated.replicas} replicas`,
      data: scaled
    });
  } catch (err) {
    next(err);
  }
}

async function simulateFailure(req, res, next) {
  try {
    const app = await applicationService.simulateFailure(req.params.id, req.user);
    res.status(200).json({
      success: true,
      message: `Simulated failure triggered on application ${app.name}`,
      data: app
    });
  } catch (err) {
    next(err);
  }
}

async function getApplicationDeployments(req, res, next) {
  try {
    const deployments = await deploymentService.getDeployments({
      applicationId: req.params.id,
      ...req.query
    });
    res.status(200).json({
      success: true,
      data: deployments
    });
  } catch (err) {
    next(err);
  }
}

async function deployApplication(req, res, next) {
  try {
    const deployment = await deploymentService.triggerDeployment(req.params.id, req.user, req.body || {});
    res.status(201).json({
      success: true,
      message: 'Deployment pipeline initiated',
      data: deployment
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  scale,
  simulateFailure,
  getApplicationDeployments,
  deployApplication,
  createApplicationSchema,
  scaleSchema
};
