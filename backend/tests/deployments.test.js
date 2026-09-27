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

test('GET /api/deployments returns all historical deployments', async () => {
  const res = await request(app)
    .get('/api/deployments')
    .set('Authorization', `Bearer ${authToken}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(Array.isArray(res.body.data));
  assert.ok(res.body.data.length >= 1);
});

test('GET /api/deployments/:id returns full deployment details with stages and logs', async () => {
  const res = await request(app)
    .get('/api/deployments/dep-payment-001')
    .set('Authorization', `Bearer ${authToken}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.data.id, 'dep-payment-001');
  assert.ok(Array.isArray(res.body.data.stages));
  assert.ok(res.body.data.stages.length >= 11);
});

test('POST /api/deployments initiates an 11-stage delivery pipeline', async () => {
  const res = await request(app)
    .post('/api/deployments')
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      applicationId: 'app-payment-gateway',
      branch: 'main'
    });

  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.success, true);
  assert.ok(res.body.data.id);
  assert.strictEqual(res.body.data.applicationId, 'app-payment-gateway');
  assert.ok(Array.isArray(res.body.data.stages));
});

test('POST /api/deployments/:id/rollback initiates a rollback deployment to previous version', async () => {
  const res = await request(app)
    .post('/api/deployments/dep-payment-001/rollback')
    .set('Authorization', `Bearer ${authToken}`);

  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.data.triggerType, 'ROLLBACK');
  assert.strictEqual(res.body.data.rolledBackFrom, 'dep-payment-001');
});
