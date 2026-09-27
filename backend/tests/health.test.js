const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../src/app');

test('GET /health returns 200 and healthy status', async () => {
  const res = await request(app).get('/health');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.status, 'healthy');
  assert.strictEqual(res.body.service, 'clouddeploy-backend');
});

test('GET /api/non-existent returns 404', async () => {
  const res = await request(app).get('/api/non-existent-route');
  assert.strictEqual(res.status, 404);
  assert.strictEqual(res.body.success, false);
});
