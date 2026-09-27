const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET || 'clouddeploy_default_secret_key_change_in_production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  CORS_ORIGIN: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:5173', 'http://localhost:3000'],
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '1000', 10),
  AWS_REGION: process.env.AWS_REGION || 'us-east-1',
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET || 'clouddeploy-artifacts-prod',
  AWS_ECR_REGISTRY: process.env.AWS_ECR_REGISTRY || '123456789012.dkr.ecr.us-east-1.amazonaws.com',
  INFRASTRUCTURE_MODE: process.env.INFRASTRUCTURE_MODE || 'simulated',
  KUBERNETES_MODE: process.env.KUBERNETES_MODE || 'simulated'
};
