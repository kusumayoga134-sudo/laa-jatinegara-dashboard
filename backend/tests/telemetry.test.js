const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/db');

describe('SCADA Telemetry & Dashboard Stats API', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('GET /api/stats should return comprehensive aggregate statistics', async () => {
    const res = await request(app).get('/api/stats');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalStations).toBe(8);
    expect(res.body.data.totalSwitches).toBe(20);
    expect(res.body.data.catenaryNominalVoltage).toBe('1500 V DC');
    expect(res.body.data.resorInfo.uptName).toBe('UPT RESOR LAA 1.9 JATINEGARA');
  });

  test('GET /api/telemetry should return 4 traction substations telemetry', async () => {
    const res = await request(app).get('/api/telemetry');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(4);

    const substationNames = res.body.data.map((s) => s.substation);
    expect(substationNames.some((name) => name.includes('Jatinegara'))).toBe(true);
    expect(substationNames.some((name) => name.includes('Bekasi'))).toBe(true);
  });
});
