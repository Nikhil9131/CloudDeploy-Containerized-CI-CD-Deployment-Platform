/**
 * AWS Infrastructure Service Adapter
 * Realistically represents provisioned AWS resources (EC2, S3, IAM, VPC, Security Groups).
 * Clearly denotes the active provider mode (SIMULATED / AWS SDK).
 */

const env = require('../config/env');

const INFRASTRUCTURE_CONFIG = {
  provider: 'Amazon Web Services (AWS)',
  mode: env.INFRASTRUCTURE_MODE,
  region: env.AWS_REGION,
  accountId: '123456789012',
  vpc: {
    id: 'vpc-07a9b1c2d3e4f506a',
    name: 'clouddeploy-production-vpc',
    cidrBlock: '10.0.0.0/16',
    state: 'available',
    subnets: [
      { id: 'subnet-0a1b2c3d4e-pub1', name: 'clouddeploy-public-1a', cidr: '10.0.1.0/24', az: 'us-east-1a', public: true },
      { id: 'subnet-0b2c3d4e5f-pub2', name: 'clouddeploy-public-1b', cidr: '10.0.2.0/24', az: 'us-east-1b', public: true },
      { id: 'subnet-0c3d4e5f6a-prv1', name: 'clouddeploy-private-1a', cidr: '10.0.10.0/24', az: 'us-east-1a', public: false },
      { id: 'subnet-0d4e5f6a7b-prv2', name: 'clouddeploy-private-1b', cidr: '10.0.20.0/24', az: 'us-east-1b', public: false }
    ],
    internetGateway: 'igw-089c74b123d4e5f6a',
    natGateways: ['nat-0987654321fedcba0']
  },
  ec2Instances: [
    {
      instanceId: 'i-07f9c2d1b8e40001a',
      name: 'clouddeploy-k8s-control-plane-01',
      instanceType: 't3.xlarge',
      vCpu: 4,
      ramGb: 16,
      availabilityZone: 'us-east-1a',
      state: 'running',
      privateIp: '10.0.1.42',
      publicIp: '54.210.14.88',
      iamRole: 'CloudDeploy-EKS-EC2-Worker-Role',
      launchTime: '2026-01-10T08:00:00Z',
      securityGroup: 'sg-clouddeploy-k8s-nodes'
    },
    {
      instanceId: 'i-07f9c2d1b8e40002b',
      name: 'clouddeploy-k8s-worker-node-01',
      instanceType: 'm6i.2xlarge',
      vCpu: 8,
      ramGb: 32,
      availabilityZone: 'us-east-1a',
      state: 'running',
      privateIp: '10.0.2.108',
      publicIp: '54.210.19.122',
      iamRole: 'CloudDeploy-EKS-EC2-Worker-Role',
      launchTime: '2026-01-10T08:15:00Z',
      securityGroup: 'sg-clouddeploy-k8s-nodes'
    },
    {
      instanceId: 'i-07f9c2d1b8e40003c',
      name: 'clouddeploy-k8s-worker-node-02',
      instanceType: 'm6i.2xlarge',
      vCpu: 8,
      ramGb: 32,
      availabilityZone: 'us-east-1b',
      state: 'running',
      privateIp: '10.0.3.219',
      publicIp: '54.210.22.47',
      iamRole: 'CloudDeploy-EKS-EC2-Worker-Role',
      launchTime: '2026-01-10T08:15:00Z',
      securityGroup: 'sg-clouddeploy-k8s-nodes'
    }
  ],
  s3Buckets: [
    {
      name: env.AWS_S3_BUCKET,
      purpose: 'CI/CD Build Artifacts, Compressed Logs, & Pipeline Caches',
      region: env.AWS_REGION,
      creationDate: '2026-01-05T12:00:00Z',
      versioning: 'Enabled',
      encryption: 'AES256 (SSE-S3)',
      objectsCount: 184,
      totalSizeMb: 1420.5
    },
    {
      name: 'clouddeploy-terraform-state-backend',
      purpose: 'Remote Terraform State Storage with DynamoDB State Locking',
      region: env.AWS_REGION,
      creationDate: '2026-01-02T10:00:00Z',
      versioning: 'Enabled',
      encryption: 'aws:kms',
      objectsCount: 42,
      totalSizeMb: 18.2
    }
  ],
  iamRoles: [
    {
      roleName: 'CloudDeploy-EKS-EC2-Worker-Role',
      arn: 'arn:aws:iam::123456789012:role/CloudDeploy-EKS-EC2-Worker-Role',
      attachedPolicies: [
        'AmazonEKSWorkerNodePolicy',
        'AmazonEC2ContainerRegistryReadOnly',
        'AmazonEKS_CNI_Policy',
        'CloudDeploy-S3-ArtifactsAccess-Policy'
      ],
      assumeRolePrincipal: 'ec2.amazonaws.com'
    },
    {
      roleName: 'CloudDeploy-GithubActions-OIDC-Role',
      arn: 'arn:aws:iam::123456789012:role/CloudDeploy-GithubActions-OIDC-Role',
      attachedPolicies: [
        'CloudDeploy-ECR-Push-Policy',
        'CloudDeploy-EKS-Deploy-Policy'
      ],
      assumeRolePrincipal: 'token.actions.githubusercontent.com'
    }
  ],
  securityGroups: [
    {
      groupId: 'sg-01a2b3c4d5e6f7a01',
      name: 'clouddeploy-alb-sg',
      description: 'Public Application Load Balancer HTTP/HTTPS ingress',
      ingressRules: [
        { protocol: 'TCP', port: 80, source: '0.0.0.0/0', desc: 'HTTP Public' },
        { protocol: 'TCP', port: 443, source: '0.0.0.0/0', desc: 'HTTPS Public' }
      ]
    },
    {
      groupId: 'sg-02b3c4d5e6f7a8b02',
      name: 'clouddeploy-k8s-nodes-sg',
      description: 'Kubernetes nodes internal communication and ALB traffic',
      ingressRules: [
        { protocol: 'TCP', port: '30000-32767', source: 'sg-01a2b3c4d5e6f7a01', desc: 'NodePort from ALB' },
        { protocol: 'ALL', port: 'ALL', source: '10.0.0.0/16', desc: 'VPC Pod-to-Pod Overlay' }
      ]
    },
    {
      groupId: 'sg-03c4d5e6f7a8b9c03',
      name: 'clouddeploy-rds-postgres-sg',
      description: 'PostgreSQL database access restricted strictly to K8s worker nodes',
      ingressRules: [
        { protocol: 'TCP', port: 5432, source: 'sg-02b3c4d5e6f7a8b02', desc: 'PostgreSQL from K8s worker nodes' }
      ]
    }
  ]
};

async function getInfrastructureDetails() {
  return INFRASTRUCTURE_CONFIG;
}

module.exports = {
  getInfrastructureDetails,
  INFRASTRUCTURE_CONFIG
};
