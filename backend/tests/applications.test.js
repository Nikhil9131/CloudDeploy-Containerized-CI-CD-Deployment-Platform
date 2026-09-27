const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../src/app');

let authToken = '';

test.before(async () => {
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'admin@clouddeploy.io',
      password: 'Password123!'
    });
  authToken = loginRes.body.data.token;
});

test('GET /api/applications returns list of apps for authenticated user', async () => {
  const res = await request(app)
    .get('/api/applications')
    .set('Authorization', `Bearer ${authToken}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(Array.isArray(res.body.data));
  assert.ok(res.body.data.length >= 1);
});

test('GET /api/applications fails with 401 when no token is provided', async () => {
  const res = await request(app).get('/api/applications');
  assert.strictEqual(res.status, 401);
});

test('POST /api/applications creates new microservice application', async () => {
  const newApp = {
    name: `telemetry-service-${Date.now().toString(36)}`,
    description: 'Prometheus metrics exporter microservice',
    gitRepo: 'https://github.com/clouddeploy-platform/telemetry-service',
    branch: 'main',
    dockerfilePath: './Dockerfile',
    dockerImage: 'clouddeploy/telemetry-service:v1.0.0',
    environment: 'production',
    namespace: 'monitoring',
    replicas: 2,
    port: 9090
  };

  const res = await request(app)
    .post('/api/applications')
    .set('Authorization', `Bearer ${authToken}`)
    .send(newApp);

  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.data.replicas, 2);
  assert.strictEqual(res.body.data.port, 9090);
});

test('PATCH /api/applications/:id/scale modifies replica count', async () => {
  const res = await request(app)
    .patch('/api/applications/app-payment-gateway/scale')
    .set('Authorization', `Bearer ${authToken}`)
    .send({ replicas: 5 });

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.data.replicas, 5);
});
