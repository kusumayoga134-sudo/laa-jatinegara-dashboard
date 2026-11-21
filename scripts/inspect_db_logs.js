const path = require('path');
const { PrismaClient } = require(path.resolve(__dirname, '../backend/node_modules/@prisma/client'));
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${path.resolve(__dirname, '../backend/prisma/dev.db')}`
    }
  }
});

async function main() {
  const logs = await prisma.maintenanceLog.findMany({ orderBy: { id: 'asc' } });
  console.log(`Total logs in dev.db: ${logs.length}`);
  logs.forEach(l => {
    console.log(`ID ${l.id} | targetCode: "${l.targetCode}" | action: ${l.actionType} | status: ${l.status}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
