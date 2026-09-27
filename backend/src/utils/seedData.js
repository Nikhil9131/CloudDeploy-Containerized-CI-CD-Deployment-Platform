const bcrypt = require('bcryptjs');

// Precomputed bcrypt hash for 'Password123!' with 10 salt rounds
const PASSWORD_HASH = bcrypt.hashSync('Password123!', 10);

const INITIAL_USERS = [
  {
    id: 'usr-admin-001',
    email: 'admin@clouddeploy.io',
    password: PASSWORD_HASH,
    name: 'DevOps Administrator',
    role: 'ADMIN',
    createdAt: new Date('2026-01-15T08:00:00Z'),
    updatedAt: new Date('2026-01-15T08:00:00Z')
  },
  {
    id: 'usr-dev-002',
    email: 'developer@clouddeploy.io',
    password: PASSWORD_HASH,
    name: 'Sarah Connor (Senior SRE)',
    role: 'DEVELOPER',
    createdAt: new Date('2026-01-16T09:30:00Z'),
    updatedAt: new Date('2026-01-16T09:30:00Z')
  }
];

const INITIAL_APPLICATIONS = [
  {
    id: 'app-payment-gateway',
    name: 'payment-gateway-service',
    description: 'High-throughput payment orchestration and PCI-DSS compliant settlement engine',
    gitRepo: 'https://github.com/clouddeploy-platform/payment-gateway-service',
    branch: 'main',
    dockerfilePath: './Dockerfile',
    dockerImage: 'clouddeploy/payment-gateway:v2.4.0',
    environment: 'production',
    namespace: 'payments-prod',
    replicas: 3,
    port: 8080,
    status: 'HEALTHY',
    currentCommit: '7f2d3a9b1c',
    currentVersion: 'v2.4.0',
    userId: 'usr-admin-001',
    createdAt: new Date('2026-02-01T10:00:00Z'),
    updatedAt: new Date('2026-03-20T14:32:00Z')
  },
  {
    id: 'app-auth-identity',
    name: 'auth-identity-service',
    description: 'Enterprise OAuth2.0 / OIDC Identity Provider with JWT session revocation',
    gitRepo: 'https://github.com/clouddeploy-platform/auth-identity-service',
    branch: 'main',
    dockerfilePath: './Dockerfile',
    dockerImage: 'clouddeploy/auth-identity:v1.8.2',
    environment: 'production',
    namespace: 'security-prod',
    replicas: 2,
    port: 4000,
    status: 'HEALTHY',
    currentCommit: '9b4e1c2d8f',
    currentVersion: 'v1.8.2',
    userId: 'usr-dev-002',
    createdAt: new Date('2026-02-10T11:15:00Z'),
    updatedAt: new Date('2026-03-22T09:12:00Z')
  },
  {
    id: 'app-notification-worker',
    name: 'notification-worker',
    description: 'Distributed event-driven notification, SMS, and webhook dispatching worker',
    gitRepo: 'https://github.com/clouddeploy-platform/notification-worker',
    branch: 'staging',
    dockerfilePath: './Dockerfile',
    dockerImage: 'clouddeploy/notification-worker:v1.1.5',
    environment: 'staging',
    namespace: 'messaging-staging',
    replicas: 2,
    port: 5005,
    status: 'HEALTHY',
    currentCommit: '4c8a9f0e21',
    currentVersion: 'v1.1.5',
    userId: 'usr-dev-002',
    createdAt: new Date('2026-02-25T14:40:00Z'),
    updatedAt: new Date('2026-03-25T16:20:00Z')
  }
];

const STAGE_NAMES = [
  'Checkout',
  'Install dependencies',
  'Lint',
  'Unit tests',
  'Build application',
  'Build Docker image',
  'Security scan',
  'Push Docker image',
  'Deploy to Kubernetes',
  'Health check',
  'Deployment completed'
];

function generateStagesForDeployment(deploymentId, status = 'SUCCESS', failStageOrder = null) {
  const baseTime = new Date('2026-03-25T16:00:00Z').getTime();
  let accumulatedSeconds = 0;

  return STAGE_NAMES.map((name, index) => {
    const stageOrder = index + 1;
    const stageDuration = Math.floor(Math.random() * 8) + 4; // 4-12s
    let stageStatus = 'SUCCESS';

    if (failStageOrder && stageOrder === failStageOrder) {
      stageStatus = 'FAILED';
    } else if (failStageOrder && stageOrder > failStageOrder) {
      stageStatus = 'CANCELLED';
    } else if (status === 'RUNNING' && stageOrder > 4) {
      stageStatus = stageOrder === 5 ? 'RUNNING' : 'PENDING';
    }

    const startedAt = new Date(baseTime + accumulatedSeconds * 1000);
    accumulatedSeconds += stageDuration;
    const completedAt = stageStatus === 'PENDING' || stageStatus === 'RUNNING' ? null : new Date(baseTime + accumulatedSeconds * 1000);

    return {
      id: `stg-${deploymentId}-${stageOrder}`,
      deploymentId,
      stageName: name,
      stageOrder,
      status: stageStatus,
      startedAt,
      completedAt,
      duration: stageStatus === 'PENDING' ? 0 : stageDuration,
      logs: `Stage [${name}] completed with exit code 0. Validation checks passed successfully.`,
      createdAt: startedAt
    };
  });
}

const INITIAL_DEPLOYMENTS = [
  {
    id: 'dep-payment-001',
    applicationId: 'app-payment-gateway',
    version: 'v2.4.0',
    commitSha: '7f2d3a9b1c',
    branch: 'main',
    dockerImage: 'clouddeploy/payment-gateway:v2.4.0',
    status: 'SUCCESS',
    triggerType: 'MANUAL',
    buildDuration: 42,
    deploymentDuration: 28,
    startedAt: new Date('2026-03-25T16:00:00Z'),
    completedAt: new Date('2026-03-25T16:01:10Z'),
    rolledBackFrom: null,
    createdAt: new Date('2026-03-25T16:00:00Z'),
    updatedAt: new Date('2026-03-25T16:01:10Z')
  },
  {
    id: 'dep-payment-000',
    applicationId: 'app-payment-gateway',
    version: 'v2.3.9',
    commitSha: '5b1e8d4a99',
    branch: 'main',
    dockerImage: 'clouddeploy/payment-gateway:v2.3.9',
    status: 'SUCCESS',
    triggerType: 'GITHUB_WEBHOOK',
    buildDuration: 39,
    deploymentDuration: 25,
    startedAt: new Date('2026-03-20T11:00:00Z'),
    completedAt: new Date('2026-03-20T11:01:04Z'),
    rolledBackFrom: null,
    createdAt: new Date('2026-03-20T11:00:00Z'),
    updatedAt: new Date('2026-03-20T11:01:04Z')
  },
  {
    id: 'dep-auth-001',
    applicationId: 'app-auth-identity',
    version: 'v1.8.2',
    commitSha: '9b4e1c2d8f',
    branch: 'main',
    dockerImage: 'clouddeploy/auth-identity:v1.8.2',
    status: 'SUCCESS',
    triggerType: 'MANUAL',
    buildDuration: 35,
    deploymentDuration: 22,
    startedAt: new Date('2026-03-22T09:10:00Z'),
    completedAt: new Date('2026-03-22T09:10:57Z'),
    rolledBackFrom: null,
    createdAt: new Date('2026-03-22T09:10:00Z'),
    updatedAt: new Date('2026-03-22T09:10:57Z')
  },
  {
    id: 'dep-notify-001',
    applicationId: 'app-notification-worker',
    version: 'v1.1.5',
    commitSha: '4c8a9f0e21',
    branch: 'staging',
    dockerImage: 'clouddeploy/notification-worker:v1.1.5',
    status: 'SUCCESS',
    triggerType: 'MANUAL',
    buildDuration: 31,
    deploymentDuration: 20,
    startedAt: new Date('2026-03-25T16:15:00Z'),
    completedAt: new Date('2026-03-25T16:15:51Z'),
    rolledBackFrom: null,
    createdAt: new Date('2026-03-25T16:15:00Z'),
    updatedAt: new Date('2026-03-25T16:15:51Z')
  }
];

const INITIAL_STAGES = [
  ...generateStagesForDeployment('dep-payment-001', 'SUCCESS'),
  ...generateStagesForDeployment('dep-payment-000', 'SUCCESS'),
  ...generateStagesForDeployment('dep-auth-001', 'SUCCESS'),
  ...generateStagesForDeployment('dep-notify-001', 'SUCCESS')
];

const INITIAL_LOGS = [
  {
    id: 'log-001',
    deploymentId: 'dep-payment-001',
    stage: 'Checkout',
    level: 'INFO',
    message: '[16:00:01] Git clone initialized from https://github.com/clouddeploy-platform/payment-gateway-service (branch: main)',
    timestamp: new Date('2026-03-25T16:00:01Z')
  },
  {
    id: 'log-002',
    deploymentId: 'dep-payment-001',
    stage: 'Checkout',
    level: 'INFO',
    message: '[16:00:04] Checked out commit 7f2d3a9b1c ("feat: enhance idempotency key validation for stripe payouts")',
    timestamp: new Date('2026-03-25T16:00:04Z')
  },
  {
    id: 'log-003',
    deploymentId: 'dep-payment-001',
    stage: 'Install dependencies',
    level: 'INFO',
    message: '[16:00:07] Installing dependencies with deterministic lockfile: go mod download completed [3.2s]',
    timestamp: new Date('2026-03-25T16:00:07Z')
  },
  {
    id: 'log-004',
    deploymentId: 'dep-payment-001',
    stage: 'Lint',
    level: 'INFO',
    message: '[16:00:12] Running golangci-lint v1.58.0: 0 errors, 0 warnings. Code style compliant.',
    timestamp: new Date('2026-03-25T16:00:12Z')
  },
  {
    id: 'log-005',
    deploymentId: 'dep-payment-001',
    stage: 'Unit tests',
    level: 'INFO',
    message: '[16:00:18] Running test suite: 42 test cases passed, 0 skipped, 0 failed. Coverage: 89.4%',
    timestamp: new Date('2026-03-25T16:00:18Z')
  },
  {
    id: 'log-006',
    deploymentId: 'dep-payment-001',
    stage: 'Build Docker image',
    level: 'INFO',
    message: '[16:00:26] Docker build: Layer cache hit 4/7. Built target image clouddeploy/payment-gateway:v2.4.0 (138MB)',
    timestamp: new Date('2026-03-25T16:00:26Z')
  },
  {
    id: 'log-007',
    deploymentId: 'dep-payment-001',
    stage: 'Security scan',
    level: 'INFO',
    message: '[16:00:32] Trivy container security scan: 0 CRITICAL, 0 HIGH, 2 LOW (tolerated). Vulnerability gate passed.',
    timestamp: new Date('2026-03-25T16:00:32Z')
  },
  {
    id: 'log-008',
    deploymentId: 'dep-payment-001',
    stage: 'Push Docker image',
    level: 'INFO',
    message: '[16:00:40] Authenticated to AWS ECR. Digest sha256:7f2d3a9b1c pushed successfully to registry.',
    timestamp: new Date('2026-03-25T16:00:40Z')
  },
  {
    id: 'log-009',
    deploymentId: 'dep-payment-001',
    stage: 'Deploy to Kubernetes',
    level: 'INFO',
    message: '[16:00:48] Applied Kubernetes deployment "payment-gateway-service" in namespace "payments-prod". Rolling update triggered.',
    timestamp: new Date('2026-03-25T16:00:48Z')
  },
  {
    id: 'log-010',
    deploymentId: 'dep-payment-001',
    stage: 'Deploy to Kubernetes',
    level: 'INFO',
    message: '[16:00:58] Rollout status: 3 of 3 updated replicas are available. Old replica pods terminated gracefully.',
    timestamp: new Date('2026-03-25T16:00:58Z')
  },
  {
    id: 'log-011',
    deploymentId: 'dep-payment-001',
    stage: 'Health check',
    level: 'INFO',
    message: '[16:01:05] HTTP GET /health on service clusterIP returned 200 OK. Liveness and readiness confirmed.',
    timestamp: new Date('2026-03-25T16:01:05Z')
  },
  {
    id: 'log-012',
    deploymentId: 'dep-payment-001',
    stage: 'Deployment completed',
    level: 'INFO',
    message: '[16:01:10] Deployment v2.4.0 successfully marked active in production. Traffic shifted 100%.',
    timestamp: new Date('2026-03-25T16:01:10Z')
  }
];

const INITIAL_K8S_DEPLOYMENTS = [
  {
    id: 'k8s-payment-01',
    applicationId: 'app-payment-gateway',
    namespace: 'payments-prod',
    deploymentName: 'payment-gateway-deployment',
    replicas: 3,
    availableReplicas: 3,
    readyReplicas: 3,
    cpuUsage: '45m',
    memoryUsage: '142Mi',
    lastRestart: new Date('2026-03-25T16:01:00Z'),
    createdAt: new Date('2026-02-01T10:00:00Z'),
    updatedAt: new Date('2026-03-25T16:01:10Z')
  },
  {
    id: 'k8s-auth-02',
    applicationId: 'app-auth-identity',
    namespace: 'security-prod',
    deploymentName: 'auth-identity-deployment',
    replicas: 2,
    availableReplicas: 2,
    readyReplicas: 2,
    cpuUsage: '28m',
    memoryUsage: '98Mi',
    lastRestart: new Date('2026-03-22T09:10:00Z'),
    createdAt: new Date('2026-02-10T11:15:00Z'),
    updatedAt: new Date('2026-03-22T09:10:57Z')
  },
  {
    id: 'k8s-notify-03',
    applicationId: 'app-notification-worker',
    namespace: 'messaging-staging',
    deploymentName: 'notification-worker-deployment',
    replicas: 2,
    availableReplicas: 2,
    readyReplicas: 2,
    cpuUsage: '18m',
    memoryUsage: '76Mi',
    lastRestart: new Date('2026-03-25T16:15:00Z'),
    createdAt: new Date('2026-02-25T14:40:00Z'),
    updatedAt: new Date('2026-03-25T16:15:51Z')
  }
];

const INITIAL_APP_HEALTH = [
  {
    id: 'hlth-01',
    applicationId: 'app-payment-gateway',
    status: 'HEALTHY',
    uptime: 99.99,
    responseTime: 38,
    errorRate: 0.005,
    lastCheckedAt: new Date()
  },
  {
    id: 'hlth-02',
    applicationId: 'app-auth-identity',
    status: 'HEALTHY',
    uptime: 99.98,
    responseTime: 29,
    errorRate: 0.001,
    lastCheckedAt: new Date()
  },
  {
    id: 'hlth-03',
    applicationId: 'app-notification-worker',
    status: 'HEALTHY',
    uptime: 99.95,
    responseTime: 45,
    errorRate: 0.02,
    lastCheckedAt: new Date()
  }
];

module.exports = {
  STAGE_NAMES,
  INITIAL_USERS,
  INITIAL_APPLICATIONS,
  INITIAL_DEPLOYMENTS,
  INITIAL_STAGES,
  INITIAL_LOGS,
  INITIAL_K8S_DEPLOYMENTS,
  INITIAL_APP_HEALTH,
  generateStagesForDeployment
};
