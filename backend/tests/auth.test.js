const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../src/app');

test('POST /api/auth/login with valid admin credentials returns token and user info', async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'admin@clouddeploy.io',
      password: 'Password123!'
    });

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(res.body.data.token);
  assert.strictEqual(res.body.data.user.email, 'admin@clouddeploy.io');
  assert.strictEqual(res.body.data.user.role, 'ADMIN');
});

test('POST /api/auth/login with invalid password returns 401', async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'admin@clouddeploy.io',
      password: 'WrongPassword'
    });

  assert.strictEqual(res.status, 401);
  assert.strictEqual(res.body.success, false);
});

test('POST /api/auth/register with valid input creates user', async () => {
  const uniqueEmail = `test-${Date.now()}@clouddeploy.io`;
  const res = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Test SRE',
      email: uniqueEmail,
      password: 'StrongPassword123!',
      role: 'DEVELOPER'
    });

  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.data.user.email, uniqueEmail);
  assert.ok(res.body.data.token);
});

test('POST /api/auth/register with invalid email triggers validation error 400', async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Test SRE',
      email: 'not-an-email',
      password: '123'
    });

  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.body.success, false);
  assert.ok(Array.isArray(res.body.errors));
});
