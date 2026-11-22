const app = require('./app');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

// Auto-seed function jika database baru / kosong di cloud
async function checkAndAutoSeed() {
  try {
    const stationCount = await prisma.station.count();
    if (stationCount === 0) {
      console.log('🌱 Database kosong terdeteksi. Memulai auto-seed data master UPT Resor LAA 1.9...');
      const { seedDatabase } = require('../prisma/seed');
      if (typeof seedDatabase === 'function') {
        await seedDatabase();
        console.log('✅ Auto-seed data master selesai dengan sukses!');
      }
    } else {
      console.log(`📦 Database siap: ${stationCount} stasiun terdata.`);
    }
  } catch (err) {
    console.warn('⚠️ Pemeriksaan auto-seed dilewati / database belum siap:', err.message);
  }
}

app.listen(PORT, HOST, async () => {
  console.log(`====================================================`);
  console.log(`🚀 UPT RESOR LAA 1.9 JATINEGARA - BACKEND SERVER`);
  console.log(`📡 Berjalan pada: http://${HOST}:${PORT}`);
  console.log(`⚡ API Endpoint: http://${HOST}:${PORT}/api`);
  console.log(`🩺 Health Check: http://${HOST}:${PORT}/api/health`);
  console.log(`====================================================`);

  await checkAndAutoSeed();
});
