/**
 * CloudDeploy CI/CD Pipeline Orchestrator
 * Manages the realistic execution of the 11-stage delivery workflow:
 * 1. Checkout
 * 2. Install dependencies
 * 3. Lint
 * 4. Unit tests
 * 5. Build application
 * 6. Build Docker image
 * 7. Security scan
 * 8. Push Docker image
 * 9. Deploy to Kubernetes
 * 10. Health check
 * 11. Deployment completed
 */

const { db } = require('../config/database');
const logger = require('../utils/logger');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const STAGES = [
  { order: 1, name: 'Checkout' },
  { order: 2, name: 'Install dependencies' },
  { order: 3, name: 'Lint' },
  { order: 4, name: 'Unit tests' },
  { order: 5, name: 'Build application' },
  { order: 6, name: 'Build Docker image' },
  { order: 7, name: 'Security scan' },
  { order: 8, name: 'Push Docker image' },
  { order: 9, name: 'Deploy to Kubernetes' },
  { order: 10, name: 'Health check' },
  { order: 11, name: 'Deployment completed' }
];

// Active pipeline cancellations tracker
const activePipelines = new Map();

/**
 * Initializes the 11 stages in DB for a deployment
 */
async function initializeStages(deploymentId) {
  const createdStages = [];
  for (const stg of STAGES) {
    const stage = await db.deploymentStage.create({
      data: {
        deploymentId,
        stageName: stg.name,
        stageOrder: stg.order,
        status: 'PENDING',
        startedAt: null,
        completedAt: null,
        duration: 0,
        logs: ''
      }
    });
    createdStages.push(stage);
  }
  return createdStages;
}

/**
 * Add structured log to deployment
 */
async function appendLog(deploymentId, stage, message, level = 'INFO') {
  logger.pipeline(deploymentId, stage, message, level);
  return db.deploymentLog.create({
    data: {
      deploymentId,
      stage,
      level,
      message,
      timestamp: new Date()
    }
  });
}

/**
 * Executes a simulated realistic stage with step-by-step logs
 */
async function executeStage(deployment, stageRecord, shouldFail = false) {
  const stageName = stageRecord.stageName;
  const deploymentId = deployment.id;
  const startTime = Date.now();

  await db.deploymentStage.update({
    where: { id: stageRecord.id },
    data: {
      status: 'RUNNING',
      startedAt: new Date()
    }
  });

  await appendLog(deploymentId, stageName, `[>] Starting stage: ${stageName}`);

  // Stage-specific realistic execution logs
  switch (stageName) {
    case 'Checkout':
      await sleep(400);
      await appendLog(deploymentId, stageName, `Connecting to repository: ${deployment.application?.gitRepo || 'git://clouddeploy'}`);
      await sleep(350);
      await appendLog(deploymentId, stageName, `Fetching branch '${deployment.branch}' with commit SHA ${deployment.commitSha}`);
      await appendLog(deploymentId, stageName, `Repository workspace checked out cleanly.`);
      break;

    case 'Install dependencies':
      await sleep(500);
      await appendLog(deploymentId, stageName, `Resolving package dependency tree and deterministic lockfile...`);
      await sleep(450);
      await appendLog(deploymentId, stageName, `Fetched cached tarballs. Packages verified with sha512 integrity checks.`);
      await appendLog(deploymentId, stageName, `All dependencies installed in 1.2s.`);
      break;

    case 'Lint':
      await sleep(400);
      await appendLog(deploymentId, stageName, `Running static analysis and code linters (ESLint, GoLinter, Prettier)...`);
      if (shouldFail) {
        await sleep(300);
        await appendLog(deploymentId, stageName, `ERROR: Syntax/style error found in src/index.ts: Line 44 - Unused variable 'unusedToken'`, 'ERROR');
        throw new Error('Lint check failed with 1 error');
      }
      await appendLog(deploymentId, stageName, `Static analysis passed: 0 syntax issues, 0 warnings.`);
      break;

    case 'Unit tests':
      await sleep(500);
      await appendLog(deploymentId, stageName, `Executing test runner (Jest / Go Test / PyTest)...`);
      await sleep(400);
      if (shouldFail) {
        await appendLog(deploymentId, stageName, `FAIL: test/payments.test.js > should handle idempotency collision`, 'ERROR');
        await appendLog(deploymentId, stageName, `Expected: 409 Conflict, Received: 500 Internal Server Error`, 'ERROR');
        throw new Error('Unit tests failed: 1 of 42 assertions failed');
      }
      await appendLog(deploymentId, stageName, `Test Suites: 8 passed, 8 total. Tests: 42 passed, 42 total. Coverage: 91.2%.`);
      break;

    case 'Build application':
      await sleep(550);
      await appendLog(deploymentId, stageName, `Compiling source code and bundling optimized binary artifacts...`);
      await sleep(400);
      await appendLog(deploymentId, stageName, `Application build succeeded. Output artifact: dist/app.bundle.js`);
      break;

    case 'Build Docker image':
      await sleep(650);
      await appendLog(deploymentId, stageName, `Building Docker container image: ${deployment.dockerImage}`);
      await appendLog(deploymentId, stageName, `[1/6] FROM alpine:3.20 as base`);
      await sleep(300);
      await appendLog(deploymentId, stageName, `[2/6] COPY ./dist /app`);
      await appendLog(deploymentId, stageName, `[3/6] USER nonroot:nonroot`);
      await appendLog(deploymentId, stageName, `[4/6] EXPOSE ${deployment.application?.port || 80}`);
      await sleep(350);
      await appendLog(deploymentId, stageName, `Successfully tagged ${deployment.dockerImage}`);
      break;

    case 'Security scan':
      await sleep(500);
      await appendLog(deploymentId, stageName, `Running Trivy / Clair vulnerability scanner on container layers...`);
      if (shouldFail) {
        await sleep(300);
        await appendLog(deploymentId, stageName, `SECURITY ALERT: CVE-2026-4419 detected (CRITICAL) in base image layer!`, 'ERROR');
        throw new Error('Security vulnerability scan threshold exceeded: 1 CRITICAL CVE detected');
      }
      await appendLog(deploymentId, stageName, `Scan summary: 0 CRITICAL, 0 HIGH vulnerabilities found. Security gate passed.`);
      break;

    case 'Push Docker image':
      await sleep(550);
      await appendLog(deploymentId, stageName, `Authenticating to container registry (AWS ECR / Docker Hub)...`);
      await sleep(400);
      await appendLog(deploymentId, stageName, `Pushed layer sha256:7f2d3a9b1c -> AWS ECR [us-east-1]`);
      await appendLog(deploymentId, stageName, `Image digest: sha256:8892ca09bf pushed successfully.`);
      break;

    case 'Deploy to Kubernetes':
      await sleep(600);
      await appendLog(deploymentId, stageName, `Applying Kubernetes manifests to namespace: ${deployment.application?.namespace || 'default'}`);
      await appendLog(deploymentId, stageName, `kubectl set image deployment/${deployment.application?.name}-deployment *=` + deployment.dockerImage);
      await sleep(500);
      await appendLog(deploymentId, stageName, `Rolling update in progress: Creating pod replica 1/2... Ready.`);
      await appendLog(deploymentId, stageName, `Rolling update in progress: Creating pod replica 2/2... Ready.`);
      await appendLog(deploymentId, stageName, `Deployment rollout completed successfully.`);
      break;

    case 'Health check':
      await sleep(500);
      await appendLog(deploymentId, stageName, `Probing pod liveness and readiness endpoints (/health)...`);
      await sleep(400);
      await appendLog(deploymentId, stageName, `Health check 200 OK received from all active pods (latency: 18ms).`);
      break;

    case 'Deployment completed':
      await sleep(400);
      await appendLog(deploymentId, stageName, `[SUCCESS] Deployment ${deployment.version} is now LIVE in environment '${deployment.application?.environment || 'production'}'!`);
      break;

    default:
      await sleep(300);
  }

  const duration = Math.max(1, Math.round((Date.now() - startTime) / 1000));

  await db.deploymentStage.update({
    where: { id: stageRecord.id },
    data: {
      status: 'SUCCESS',
      completedAt: new Date(),
      duration,
      logs: `Stage [${stageName}] finished with status SUCCESS in ${duration}s.`
    }
  });

  return duration;
}

/**
 * Run the entire 11-stage pipeline asynchronously
 */
async function runPipeline(deploymentId, options = {}) {
  const { simulateFailure = false, failAtStage = 4 } = options;

  activePipelines.set(deploymentId, { cancelled: false });

  try {
    const deployment = await db.deployment.findUnique({
      where: { id: deploymentId },
      include: { application: true, stages: true }
    });

    if (!deployment) {
      logger.error(`Deployment ${deploymentId} not found in orchestrator`);
      return;
    }

    await db.deployment.update({
      where: { id: deploymentId },
      data: { status: 'RUNNING', startedAt: new Date() }
    });

    await appendLog(deploymentId, 'Checkout', `Pipeline triggered (${deployment.triggerType}). Starting execution of 11 pipeline stages...`);

    let totalBuildDuration = 0;
    let totalDeployDuration = 0;
    const stages = await db.deploymentStage.findMany({
      where: { deploymentId }
    });

    for (const stage of stages) {
      // Check for cancellation
      const pipelineStatus = activePipelines.get(deploymentId);
      if (pipelineStatus?.cancelled) {
        await appendLog(deploymentId, stage.stageName, `Pipeline was cancelled by user. Halting stage.`, 'WARN');
        await db.deploymentStage.update({
          where: { id: stage.id },
          data: { status: 'CANCELLED', completedAt: new Date() }
        });
        await markRemainingStagesCancelled(deploymentId, stage.stageOrder);
        await db.deployment.update({
          where: { id: deploymentId },
          data: { status: 'CANCELLED', completedAt: new Date() }
        });
        return;
      }

      const shouldFailThisStage = simulateFailure && stage.stageOrder === failAtStage;

      try {
        const stageDuration = await executeStage(deployment, stage, shouldFailThisStage);

        if (stage.stageOrder <= 6) {
          totalBuildDuration += stageDuration;
        } else {
          totalDeployDuration += stageDuration;
        }
      } catch (stageErr) {
        // Stage failed
        await db.deploymentStage.update({
          where: { id: stage.id },
          data: {
            status: 'FAILED',
            completedAt: new Date(),
            logs: `Stage failed: ${stageErr.message}`
          }
        });

        await appendLog(deploymentId, stage.stageName, `[FATAL] Stage execution failed: ${stageErr.message}`, 'ERROR');
        await markRemainingStagesCancelled(deploymentId, stage.stageOrder);

        await db.deployment.update({
          where: { id: deploymentId },
          data: {
            status: 'FAILED',
            completedAt: new Date(),
            buildDuration: totalBuildDuration,
            deploymentDuration: totalDeployDuration
          }
        });

        // Update application health if deployment failed
        if (deployment.applicationId) {
          await db.application.update({
            where: { id: deployment.applicationId },
            data: { status: 'DEGRADED' }
          });
        }
        return;
      }
    }

    // All stages succeeded!
    await db.deployment.update({
      where: { id: deploymentId },
      data: {
        status: 'SUCCESS',
        completedAt: new Date(),
        buildDuration: totalBuildDuration,
        deploymentDuration: totalDeployDuration
      }
    });

    // Update application current version, commit, and health
    if (deployment.applicationId) {
      await db.application.update({
        where: { id: deployment.applicationId },
        data: {
          currentVersion: deployment.version,
          currentCommit: deployment.commitSha,
          dockerImage: deployment.dockerImage,
          status: 'HEALTHY'
        }
      });

      // Update K8s deployment record
      await db.kubernetesDeployment.update({
        where: { applicationId: deployment.applicationId },
        data: {
          lastRestart: new Date(),
          readyReplicas: deployment.application?.replicas || 2
        }
      });
    }

  } catch (error) {
    logger.error(`Critical error during pipeline execution for ${deploymentId}: ${error.message}`, error);
    await db.deployment.update({
      where: { id: deploymentId },
      data: { status: 'FAILED', completedAt: new Date() }
    });
  } finally {
    activePipelines.delete(deploymentId);
  }
}

async function markRemainingStagesCancelled(deploymentId, currentStageOrder) {
  const stages = await db.deploymentStage.findMany({
    where: { deploymentId }
  });

  for (const stg of stages) {
    if (stg.stageOrder > currentStageOrder && stg.status === 'PENDING') {
      await db.deploymentStage.update({
        where: { id: stg.id },
        data: { status: 'CANCELLED' }
      });
    }
  }
}

function cancelPipeline(deploymentId) {
  if (activePipelines.has(deploymentId)) {
    activePipelines.get(deploymentId).cancelled = true;
    return true;
  }
  return false;
}

module.exports = {
  initializeStages,
  runPipeline,
  cancelPipeline,
  appendLog,
  STAGES
};
