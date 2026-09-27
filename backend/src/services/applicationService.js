const { db } = require('../config/database');

async function createApplication(data, userId) {
  const commit = Math.random().toString(16).substring(2, 9);
  return db.application.create({
    data: {
      name: data.name.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-'),
      description: data.description || '',
      gitRepo: data.gitRepo,
      branch: data.branch || 'main',
      dockerfilePath: data.dockerfilePath || './Dockerfile',
      dockerImage: data.dockerImage,
      environment: data.environment || 'production',
      namespace: data.namespace || 'default',
      replicas: data.replicas || 2,
      port: data.port || 80,
      status: 'HEALTHY',
      currentCommit: commit,
      currentVersion: 'v1.0.0',
      userId
    }
  });
}

async function getApplications(filters = {}, user) {
  const where = {};
  if (user && user.role !== 'ADMIN' && filters.onlyMine) {
    where.userId = user.id;
  }
  if (filters.environment) {
    where.environment = filters.environment;
  }

  return db.application.findMany({
    where,
    include: {
      deployments: true,
      k8sDeployments: true,
      healthChecks: true
    }
  });
}

async function getApplicationById(id) {
  const app = await db.application.findUnique({
    where: { id },
    include: {
      deployments: true,
      k8sDeployments: true,
      healthChecks: true
    }
  });

  if (!app) {
    const error = new Error(`Application with ID ${id} not found.`);
    error.statusCode = 404;
    throw error;
  }

  return app;
}

async function updateApplication(id, data, user) {
  const app = await db.application.findUnique({ where: { id } });
  if (!app) {
    const error = new Error(`Application with ID ${id} not found.`);
    error.statusCode = 404;
    throw error;
  }

  // Developer can only update own apps
  if (user && user.role !== 'ADMIN' && app.userId !== user.id) {
    const error = new Error('Forbidden: You can only edit your own applications.');
    error.statusCode = 403;
    throw error;
  }

  return db.application.update({
    where: { id },
    data
  });
}

async function deleteApplication(id, user) {
  const app = await db.application.findUnique({ where: { id } });
  if (!app) {
    const error = new Error(`Application with ID ${id} not found.`);
    error.statusCode = 404;
    throw error;
  }

  if (user && user.role !== 'ADMIN' && app.userId !== user.id) {
    const error = new Error('Forbidden: You can only delete your own applications.');
    error.statusCode = 403;
    throw error;
  }

  return db.application.delete({ where: { id } });
}

async function scaleApplication(id, replicas, user) {
  const app = await getApplicationById(id);

  const updatedApp = await db.application.update({
    where: { id },
    data: { replicas }
  });

  return updatedApp;
}

async function simulateFailure(id, user) {
  const app = await getApplicationById(id);

  // Set health status to DEGRADED and error rate to high
  await db.application.update({
    where: { id },
    data: { status: 'DEGRADED' }
  });

  await db.applicationHealth.update({
    where: { applicationId: id },
    data: {
      status: 'DEGRADED',
      errorRate: 14.8,
      responseTime: 480
    }
  });

  return getApplicationById(id);
}

module.exports = {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
  scaleApplication,
  simulateFailure
};
