const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/db');

describe('Maintenance Logs & SCADA Alerts API', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('GET /api/logs should return maintenance history', async () => {
    const res = await request(app).get('/api/logs');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('POST /api/logs should create new maintenance ticket', async () => {
    const newLogData = {
      targetType: 'SWITCH',
      targetCode: 'DS 7',
      actionType: 'CALIBRATION',
      technician: 'Budi Santoso (UPT 1.9)',
      description: 'Pengukuran tegangan tembus isolator DS 7 Klender',
      status: 'COMPLETED',
    };

    const res = await request(app).post('/api/logs').send(newLogData);
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.targetCode).toBe('DS 7');
  });

  test('GET /api/alerts and PATCH /api/alerts/:id/ack', async () => {
    const alertsRes = await request(app).get('/api/alerts');
    expect(alertsRes.statusCode).toBe(200);
    expect(alertsRes.body.success).toBe(true);

    if (alertsRes.body.data.length > 0) {
      const firstAlert = alertsRes.body.data[0];
      const ackRes = await request(app).patch(`/api/alerts/${firstAlert.id}/ack`);
      expect(ackRes.statusCode).toBe(200);
      expect(ackRes.body.data.isAcknowledged).toBe(true);
    }
  });
});
