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

  test('POST /api/logs should create new 5-item work log with exact targetId', async () => {
    const newLogData = {
      tahun: 2022,
      bulan: 'NOVEMBER',
      actionType: 'PENGGANTIAN KAWAT OHGW',
      targetType: 'LINE',
      targetCode: 'NASPAN 9 (EMPL CUK HU)',
      targetId: 'cuk_jalur_1_empl',
      kilometer: 'KM 20+0/1 s.d KM 20+9/0',
      description: '',
    };

    const res = await request(app).post('/api/logs').send(newLogData);
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.targetCode).toBe('NASPAN 9 (EMPL CUK HU)');
    expect(res.body.data.targetId).toBe('cuk_jalur_1_empl');
    expect(res.body.data.tahun).toBe(2022);
    expect(res.body.data.bulan).toBe('NOVEMBER');
    expect(res.body.data.kilometer).toBe('KM 20+0/1 s.d KM 20+9/0');
    expect(res.body.data.description).toBe('-');

    // Verify PUT update works with all 5 fields
    const logId = res.body.data.id;
    const putRes = await request(app).put(`/api/logs/${logId}`).send({
      tahun: 2023,
      bulan: 'JULI',
      actionType: 'PEMASANGAN GROUNDING',
      targetCode: 'NASPAN 2 (KLD-JNG JALUR HILIR)',
      targetId: 'naspan_2_arah_jng_hi',
      kilometer: 'KM 12+7/8 s.d KM 24+9/0',
      description: '4 TITIK',
    });
    expect(putRes.statusCode).toBe(200);
    expect(putRes.body.data.tahun).toBe(2023);
    expect(putRes.body.data.bulan).toBe('JULI');
    expect(putRes.body.data.kilometer).toBe('KM 12+7/8 s.d KM 24+9/0');
    expect(putRes.body.data.description).toBe('4 TITIK');

    // Clean up test log
    await request(app).delete(`/api/logs/${logId}`);
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
