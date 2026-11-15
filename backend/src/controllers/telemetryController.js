const prisma = require('../db');

exports.getTelemetry = async (req, res) => {
  try {
    const telemetry = await prisma.telemetryRecord.findMany({
      orderBy: { id: 'desc' },
      take: 10,
    });

    // Provide dynamic simulated metrics with realistic jitter
    const liveSubstations = [
      {
        substation: 'Gardu Traksi Jatinegara (GTR-JNG)',
        km: 'KM 11+750',
        voltageDc: Number((1512 + (Math.random() * 6 - 3)).toFixed(1)),
        currentAmps: Number((1280 + (Math.random() * 80 - 40)).toFixed(1)),
        powerKw: Number((1920 + (Math.random() * 100 - 50)).toFixed(1)),
        frequencyHz: Number((50 + (Math.random() * 0.04 - 0.02)).toFixed(2)),
        tempSubstation: Number((28.5 + (Math.random() * 0.6 - 0.3)).toFixed(1)),
        feederStatus: 'NORMAL',
        feeders: [
          { name: 'Feeder F1 Manggarai', status: 'ON', current: 620 },
          { name: 'Feeder F2 Klender', status: 'ON', current: 660 },
        ],
      },
      {
        substation: 'Gardu Traksi Buaran (GTR-BUA)',
        km: 'KM 17+500',
        voltageDc: Number((1510 + (Math.random() * 6 - 3)).toFixed(1)),
        currentAmps: Number((950 + (Math.random() * 60 - 30)).toFixed(1)),
        powerKw: Number((1430 + (Math.random() * 80 - 40)).toFixed(1)),
        frequencyHz: Number((50 + (Math.random() * 0.04 - 0.02)).toFixed(2)),
        tempSubstation: Number((29.0 + (Math.random() * 0.6 - 0.3)).toFixed(1)),
        feederStatus: 'NORMAL',
        feeders: [
          { name: 'Feeder F1 Klender', status: 'ON', current: 470 },
          { name: 'Feeder F2 Klender Baru', status: 'ON', current: 480 },
        ],
      },
      {
        substation: 'Gardu Traksi Cakung (GTR-CUK)',
        km: 'KM 20+943',
        voltageDc: Number((1516 + (Math.random() * 6 - 3)).toFixed(1)),
        currentAmps: Number((1120 + (Math.random() * 70 - 35)).toFixed(1)),
        powerKw: Number((1695 + (Math.random() * 90 - 45)).toFixed(1)),
        frequencyHz: Number((50 + (Math.random() * 0.04 - 0.02)).toFixed(2)),
        tempSubstation: Number((28.0 + (Math.random() * 0.6 - 0.3)).toFixed(1)),
        feederStatus: 'NORMAL',
        feeders: [
          { name: 'Feeder F1 Klender Baru', status: 'ON', current: 550 },
          { name: 'Feeder F2 Kranji', status: 'ON', current: 570 },
        ],
      },
      {
        substation: 'Gardu Traksi Bekasi (GTR-BKS)',
        km: 'KM 26+403',
        voltageDc: Number((1514 + (Math.random() * 6 - 3)).toFixed(1)),
        currentAmps: Number((1340 + (Math.random() * 90 - 45)).toFixed(1)),
        powerKw: Number((2025 + (Math.random() * 120 - 60)).toFixed(1)),
        frequencyHz: Number((50 + (Math.random() * 0.04 - 0.02)).toFixed(2)),
        tempSubstation: Number((30.2 + (Math.random() * 0.6 - 0.3)).toFixed(1)),
        feederStatus: 'NORMAL',
        feeders: [
          { name: 'Feeder F1 Kranji', status: 'ON', current: 640 },
          { name: 'Feeder F2 Emplasemen BKS', status: 'ON', current: 700 },
        ],
      },
    ];

    res.json({
      success: true,
      data: liveSubstations,
      recentRecords: telemetry,
    });
  } catch (error) {
    console.error('Error fetching telemetry:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data telemetri daya' });
  }
};
