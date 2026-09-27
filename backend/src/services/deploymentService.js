const { db } = require('../config/database');
const pipelineOrchestrator = require('./pipelineOrchestrator');
const logger = require('../utils/logger');

function incrementSemver(versionStr) {
  if (!versionStr || !versionStr.startsWith('v')) return 'v1.0.1';
  const clean = versionStr.replace('v', '');
  const parts = clean.split('.').map(p => parseInt(p, 10));
  if (parts.length === 3 && !isNaN(parts[2])) {
    return `v${parts[0]}.${parts[1]}.${parts[2] + 1}`;
  }
  return `${versionStr}.1`;
}

function generateCommitSha() {
  return Math.random().toString(16).substring(2, 10);
}

async function triggerDeployment(applicationId, user, options = {}) {
  const application = await db.application.findUnique({
    where: { id: applicationId }
  });

  if (!application) {
    const error = new Error(`Application with ID ${applicationId} not found.`);
    error.statusCode = 404;
    throw error;
  }

  const nextVersion = options.customVersion || incrementSemver(application.currentVersion);
  const commitSha = options.customCommit || generateCommitSha();
  const branch = options.branch || application.branch;
  const dockerImage = `${application.dockerImage.split(':')[0]}:${nextVersion}`;

  const deployment = await db.deployment.create({
    data: {
      applicationId: application.id,
      version: nextVersion,
      commitSha,
      branch,
      dockerImage,
      status: 'PENDING',
      triggerType: options.triggerType || 'MANUAL',
      buildDuration: 0,
      deploymentDuration: 0,
      startedAt: new Date()
    },
    include: {
      application: true
    }
  });

  // Initialize the 11 CI/CD stages
  await pipelineOrchestrator.initializeStages(deployment.id);

  // Mark application status as DEPLOYING
  await db.application.update({
    where: { id: application.id },
    data: { status: 'DEPLOYING' }
  });

  // Launch pipeline execution asynchronously
  setImmediate(() => {
    pipelineOrchestrator.runPipeline(deployment.id, {
      simulateFailure: Boolean(options.simulateFailure),
      failAtStage: options.failAtStage || 4
    }).catch(err => {
      logger.error(`Pipeline failure for deployment ${deployment.id}:`, err);
    });
  });

  return getDeploymentById(deployment.id);
}

async function getDeployments(filters = {}) {
  const { applicationId, status, take = 50 } = filters;
  const where = {};
  if (applicationId) where.applicationId = applicationId;
  if (status) where.status = status;

  return db.deployment.findMany({
    where,
    include: {
      application: true,
      stages: true
    },
    take: parseInt(take, 10)
  });
}

async function getDeploymentById(id) {
  const deployment = await db.deployment.findUnique({
    where: { id },
    include: {
      application: true,
      stages: true,
      logs: true
    }
  });

  if (!deployment) {
    const error = new Error(`Deployment with ID ${id} not found.`);
    error.statusCode = 404;
    throw error;
  }

  return deployment;
}

async function cancelDeployment(id, user) {
  const deployment = await db.deployment.findUnique({ where: { id } });
  if (!deployment) {
    const error = new Error(`Deployment with ID ${id} not found.`);
    error.statusCode = 404;
    throw error;
  }

  if (deployment.status !== 'RUNNING' && deployment.status !== 'PENDING') {
    const error = new Error(`Cannot cancel deployment in status ${deployment.status}. Only RUNNING or PENDING deployments can be cancelled.`);
    error.statusCode = 400;
    throw error;
  }

  pipelineOrchestrator.cancelPipeline(id);

  return db.deployment.update({
    where: { id },
    data: {
      status: 'CANCELLED',
      completedAt: new Date()
    },
    include: {
      stages: true,
      logs: true
    }
  });
}

async function rollbackDeployment(id, user) {
  const targetDeployment = await db.deployment.findUnique({
    where: { id },
    include: { application: true }
  });

  if (!targetDeployment) {
    const error = new Error(`Deployment with ID ${id} not found.`);
    error.statusCode = 404;
    throw error;
  }

  // Find previous successful deployment for this application
  const appDeployments = await db.deployment.findMany({
    where: {
      applicationId: targetDeployment.applicationId,
      status: 'SUCCESS'
    }
  });

  // Filter out target deployment if it was successful, or pick the most recent successful one before target
  const candidates = appDeployments
    .filter(d => d.id !== targetDeployment.id && new Date(d.createdAt) < new Date(targetDeployment.createdAt))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const previousSuccessful = candidates.length > 0 ? candidates[0] : (appDeployments.find(d => d.id !== targetDeployment.id) || null);

  if (!previousSuccessful) {
    const error = new Error(`No previous stable deployment found to roll back to for application ${targetDeployment.application.name}.`);
    error.statusCode = 400;
    throw error;
  }

  const rollbackVersion = `${previousSuccessful.version}-rollback`;

  // Create rollback deployment
  const rollbackDep = await db.deployment.create({
    data: {
      applicationId: targetDeployment.applicationId,
      version: rollbackVersion,
      commitSha: previousSuccessful.commitSha,
      branch: previousSuccessful.branch,
      dockerImage: previousSuccessful.dockerImage,
      status: 'PENDING',
      triggerType: 'ROLLBACK',
      rolledBackFrom: targetDeployment.id,
      startedAt: new Date()
    },
    include: {
      application: true
    }
  });

  await pipelineOrchestrator.initializeStages(rollbackDep.id);

  // Asynchronously execute rollback deployment pipeline
  setImmediate(() => {
    pipelineOrchestrator.runPipeline(rollbackDep.id, {
      simulateFailure: false
    }).catch(err => {
      logger.error(`Rollback pipeline error for ${rollbackDep.id}:`, err);
    });
  });

  return getDeploymentById(rollbackDep.id);
}

async function getDeploymentLogs(id, level = null) {
  const where = { deploymentId: id };
  if (level) where.level = level;

  return db.deploymentLog.findMany({
    where
  });
}

module.exports = {
  triggerDeployment,
  getDeployments,
  getDeploymentById,
  cancelDeployment,
  rollbackDeployment,
  getDeploymentLogs
};
