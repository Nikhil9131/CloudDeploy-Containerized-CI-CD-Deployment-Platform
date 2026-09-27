/**
 * CloudDeploy Database Seeder
 * Populates PostgreSQL with initial admin/developer credentials,
 * demo applications, historical deployments, stages, and metrics.
 */

const { PrismaClient } = require('@prisma/client');
const seedData = require('../src/utils/seedData');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding CloudDeploy PostgreSQL database...');

  // 1. Seed Users
  for (const user of seedData.INITIAL_USERS) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        id: user.id,
        email: user.email,
        password: user.password,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
    console.log(`- Seeded user: ${user.email} (${user.role})`);
  }

  // 2. Seed Applications
  for (const app of seedData.INITIAL_APPLICATIONS) {
    await prisma.application.upsert({
      where: { id: app.id },
      update: {},
      create: {
        id: app.id,
        name: app.name,
        description: app.description,
        gitRepo: app.gitRepo,
        branch: app.branch,
        dockerfilePath: app.dockerfilePath,
        dockerImage: app.dockerImage,
        environment: app.environment,
        namespace: app.namespace,
        replicas: app.replicas,
        port: app.port,
        status: app.status,
        currentCommit: app.currentCommit,
        currentVersion: app.currentVersion,
        userId: app.userId,
        createdAt: app.createdAt,
        updatedAt: app.updatedAt
      }
    });
    console.log(`- Seeded application: ${app.name}`);
  }

  // 3. Seed Deployments
  for (const dep of seedData.INITIAL_DEPLOYMENTS) {
    await prisma.deployment.upsert({
      where: { id: dep.id },
      update: {},
      create: {
        id: dep.id,
        applicationId: dep.applicationId,
        version: dep.version,
        commitSha: dep.commitSha,
        branch: dep.branch,
        dockerImage: dep.dockerImage,
        status: dep.status,
        triggerType: dep.triggerType,
        buildDuration: dep.buildDuration,
        deploymentDuration: dep.deploymentDuration,
        startedAt: dep.startedAt,
        completedAt: dep.completedAt,
        rolledBackFrom: dep.rolledBackFrom,
        createdAt: dep.createdAt,
        updatedAt: dep.updatedAt
      }
    });
  }

  // 4. Seed Stages
  for (const stg of seedData.INITIAL_STAGES) {
    await prisma.deploymentStage.upsert({
      where: { id: stg.id },
      update: {},
      create: {
        id: stg.id,
        deploymentId: stg.deploymentId,
        stageName: stg.stageName,
        stageOrder: stg.stageOrder,
        status: stg.status,
        startedAt: stg.startedAt,
        completedAt: stg.completedAt,
        duration: stg.duration,
        logs: stg.logs,
        createdAt: stg.createdAt
      }
    });
  }

  // 5. Seed Logs
  for (const log of seedData.INITIAL_LOGS) {
    await prisma.deploymentLog.upsert({
      where: { id: log.id },
      update: {},
      create: {
        id: log.id,
        deploymentId: log.deploymentId,
        stage: log.stage,
        level: log.level,
        message: log.message,
        timestamp: log.timestamp
      }
    });
  }

  console.log('Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
