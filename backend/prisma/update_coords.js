const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Updating database with exact AutoCAD DWG coordinates...');

  // 1. Station Coordinates (AutoCAD exact)
  const stationCoords = {
    PND: { x: 10.2, y: 41.2 },
    JNG: { x: 37.1, y: 31.2 },
    KLD: { x: 70.9, y: 45.0 },
    BUA: { x: 86.9, y: 45.0 },
    KLDB: { x: 89.2, y: 62.1 },
    CUK: { x: 76.1, y: 59.8 },
    KRI: { x: 58.1, y: 60.1 },
    BKS: { x: 33.7, y: 58.2 },
  };

  for (const [code, pos] of Object.entries(stationCoords)) {
    await prisma.station.updateMany({
      where: { code },
      data: { xPos: pos.x, yPos: pos.y },
    });
  }

  // 2. Disconnecting Switches Coordinates (AutoCAD exact)
  const dsCoords = {
    'DS 1': { x: 15.4, y: 45.32 },
    'DS 2': { x: 15.35, y: 51.82 },
    'DS 3': { x: 22.43, y: 46.28 },
    'DS 4': { x: 22.94, y: 51.81 },
    'DS 5': { x: 44.34, y: 44.4 },
    'DS 6': { x: 45.07, y: 51.83 },
    'DS 7': { x: 58.85, y: 45.39 },
    'DS 8': { x: 58.89, y: 51.89 },
    'DS 9': { x: 89.74, y: 45.36 },
    'DS 10': { x: 89.7, y: 51.7 },
    'DS 11': { x: 84.04, y: 69.04 },
    'DS 12': { x: 83.92, y: 62.57 },
    'DS 13': { x: 70.38, y: 68.98 },
    'DS 14': { x: 70.39, y: 62.45 },
    'DS 15': { x: 42.96, y: 68.78 },
    'DS 16': { x: 42.36, y: 62.16 },
    'DS 17': { x: 38.77, y: 73.79 },
    'DS 18': { x: 36.45, y: 73.78 },
    'DS 19': { x: 20.27, y: 68.88 },
    'DS 20': { x: 20.28, y: 62.2 },
  };

  for (const [code, pos] of Object.entries(dsCoords)) {
    await prisma.switchDevice.updateMany({
      where: { code },
      data: { mapCoordX: pos.x, mapCoordY: pos.y },
    });
  }

  console.log('All 20 Switches & 8 Stations updated with AutoCAD DWG geometry!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
