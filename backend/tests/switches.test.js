const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/db');

describe('Disconnecting Switches (DS 1 - DS 20) API Endpoints', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('GET /api/switches should return all 20 Disconnecting Switches', async () => {
    const res = await request(app).get('/api/switches');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(20);

    const codes = res.body.data.map((s) => s.code);
    expect(codes).toContain('DS 1');
    expect(codes).toContain('DS 10');
    expect(codes).toContain('DS 20');
  });

  test('GET /api/switches/DS 1 should return DS 1 detail', async () => {
    const res = await request(app).get('/api/switches/DS 1');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.code).toBe('DS 1');
    expect(res.body.data.feedSection).toContain('MRI-JNG');
  });

  test('PATCH /api/switches/:id/toggle should toggle switch state and record log', async () => {
    // Get initial state of DS 4
    const getRes = await request(app).get('/api/switches/DS 4');
    const initialState = getRes.body.data.currentState;

    // Toggle switch
    const toggleRes = await request(app)
      .patch('/api/switches/DS 4/toggle')
      .send({ operator: 'Jest Unit Test Suite' });

    expect(toggleRes.statusCode).toBe(200);
    expect(toggleRes.body.success).toBe(true);
    expect(toggleRes.body.data.currentState).not.toBe(initialState);

    // Toggle back to keep database consistent
    const resetRes = await request(app)
      .patch('/api/switches/DS 4/toggle')
      .send({ operator: 'Jest Reset' });

    expect(resetRes.statusCode).toBe(200);
    expect(resetRes.body.data.currentState).toBe(initialState);
  });

  test('Safety Interlock test: Interlocked switch cannot be toggled', async () => {
    // First lock DS 2
    await request(app)
      .patch('/api/switches/DS 2/interlock')
      .send({ operator: 'Safety Officer' });

    // Try to toggle while locked -> should fail with 400
    const failRes = await request(app)
      .patch('/api/switches/DS 2/toggle')
      .send({ operator: 'Dispatcher' });

    expect(failRes.statusCode).toBe(400);
    expect(failRes.body.success).toBe(false);
    expect(failRes.body.message).toContain('TERKUNCI');

    // Unlock DS 2 again
    const unlockRes = await request(app)
      .patch('/api/switches/DS 2/interlock')
      .send({ operator: 'Safety Officer' });

    expect(unlockRes.statusCode).toBe(200);
    expect(unlockRes.body.data.isInterlocked).toBe(false);
  });
});
