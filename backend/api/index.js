const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const app = require('../src/app');
const prisma = require('../src/db');

let seedPromise = null;

async function checkAndAutoSeed() {
  try {
    const stationCount = await prisma.station.count();
    if (stationCount === 0) {
      console.log('🌱 [Vercel Serverless] Database kosong terdeteksi. Memulai auto-seed data master UPT Resor LAA 1.9...');
      const { seedDatabase } = require('../prisma/seed');
      if (typeof seedDatabase === 'function') {
        await seedDatabase();
        console.log('✅ [Vercel Serverless] Auto-seed data master selesai dengan sukses!');
      }
    }
  } catch (err) {
    console.warn('⚠️ [Vercel Serverless] Pemeriksaan auto-seed dilewati / DB belum siap:', err.message);
  }
}

function ensureInitialized() {
  if (!seedPromise) {
    seedPromise = checkAndAutoSeed();
  }
  return seedPromise;
}

module.exports = async (req, res) => {
  await ensureInitialized();
  return app(req, res);
};
