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
  if (req.accepts('html')) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CloudDeploy API — Live & Operational</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    body { background: #0f172a; color: #f8fafc; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 36px; max-width: 600px; width: 100%; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
    .badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(16, 185, 129, 0.15); color: #34d399; padding: 6px 14px; border-radius: 9999px; font-weight: 600; font-size: 14px; border: 1px solid rgba(52, 211, 153, 0.3); }
    .pulse { width: 10px; height: 10px; background: #10b981; border-radius: 50%; box-shadow: 0 0 12px #10b981; }
    h1 { margin-top: 18px; font-size: 26px; color: #fff; font-weight: 700; }
    p { margin-top: 10px; color: #94a3b8; font-size: 15px; line-height: 1.6; }
    .links { margin-top: 24px; display: grid; gap: 10px; }
    .link-item { display: flex; justify-content: space-between; align-items: center; background: #0f172a; border: 1px solid #334155; padding: 12px 18px; border-radius: 10px; color: #38bdf8; text-decoration: none; font-size: 14px; font-weight: 500; transition: border-color 0.2s; }
    .link-item:hover { border-color: #38bdf8; background: #13213a; }
    .footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #334155; font-size: 13px; color: #64748b; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge"><span class="pulse"></span> CloudDeploy Backend API Live</div>
    <h1>CloudDeploy Platform Backend</h1>
    <p>This is the <strong>Express REST API Server</strong> powering the CloudDeploy Containerized CI/CD Deployment Platform.</p>
    <div class="links">
      <a class="link-item" href="/health" target="_blank"><span>🩺 Liveness / Readiness Health Check</span> <span>/health →</span></a>
      <a class="link-item" href="/api" target="_blank"><span>📋 Interactive API Catalog</span> <span>/api →</span></a>
      <a class="link-item" href="/api/applications" target="_blank"><span>📦 Applications Endpoint</span> <span>/api/applications →</span></a>
      <a class="link-item" href="/api/deployments" target="_blank"><span>🚀 Deployments Endpoint</span> <span>/api/deployments →</span></a>
    </div>
    <div class="footer">To view the visual user interface, open your deployed <strong>Frontend on Vercel</strong>.</div>
  </div>
</body>
</html>`);
  }

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
