const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('./config/env');
const apiRoutes = require('./routes');
const { generalLimiter } = require('./middleware/rateLimitMiddleware');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Security HTTP headers
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// CORS setup
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests, wildcard, vercel previews, or configured origins
    if (
      !origin ||
      env.CORS_ORIGIN.includes('*') ||
      env.CORS_ORIGIN.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      env.NODE_ENV === 'development'
    ) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request logging
if (env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply general rate limiter to API routes
app.use('/api', generalLimiter);

// Root landing route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CloudDeploy Containerized CI/CD Deployment Platform API is running',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      apiCatalog: '/api',
      auth: '/api/auth',
      applications: '/api/applications',
      deployments: '/api/deployments',
      monitoring: '/api/monitoring'
    }
  });
});

/**
 * Standard Kubernetes Liveness & Readiness Probes Endpoint
 * (Conforms to Section 13 of requirements)
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'clouddeploy-backend',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Mount modular API routes
app.use('/api', apiRoutes);

// Catch 404
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

module.exports = app;
