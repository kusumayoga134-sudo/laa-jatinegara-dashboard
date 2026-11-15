const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/db');

describe('Stations API Endpoints', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('GET /api/stations should return 8 stations', async () => {
    const res = await request(app).get('/api/stations');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(8);

    const stationCodes = res.body.data.map((s) => s.code);
    expect(stationCodes).toContain('JNG');
    expect(stationCodes).toContain('BKS');
    expect(stationCodes).toContain('CUK');
  });

  test('GET /api/stations/:id should return single station detail by code', async () => {
    const res = await request(app).get('/api/stations/JNG');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('ST. JATINEGARA');
    expect(res.body.data.km).toBe('KM 11+750');
    expect(Array.isArray(res.body.data.switches)).toBe(true);
  });

  test('GET /api/stations/INVALID should return 404', async () => {
    const res = await request(app).get('/api/stations/UNKNOWN_CODE');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
