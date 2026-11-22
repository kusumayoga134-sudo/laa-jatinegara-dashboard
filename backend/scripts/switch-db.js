const fs = require('fs');
const path = require('path');

const target = (process.argv[2] || 'sqlite').toLowerCase();
const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

if (target === 'postgresql' || target === 'postgres' || target === 'neon') {
  console.log('🔄 Beralih ke skema PostgreSQL (Neon)...');
  schema = schema.replace(/provider\s*=\s*"sqlite"/g, 'provider = "postgresql"');
  schema = schema.replace(/url\s*=\s*"file:[^"]*"/g, 'url      = env("DATABASE_URL")');
  if (!schema.includes('rhel-openssl-3.0.x')) {
    schema = schema.replace(
      /generator\s+client\s+\{[\s\S]*?\}/,
      `generator client {\n  provider      = "prisma-client-js"\n  binaryTargets = ["native", "rhel-openssl-3.0.x"]\n}`
    );
  }
} else {
  console.log('🔄 Beralih ke skema SQLite (Lokal dev.db)...');
  schema = schema.replace(/provider\s*=\s*"postgresql"/g, 'provider = "sqlite"');
  schema = schema.replace(/url\s*=\s*env\("DATABASE_URL"\)/g, 'url      = "file:./dev.db"');
}

fs.writeFileSync(schemaPath, schema, 'utf8');
console.log(`✅ Schema aktif sekarang: ${target.toUpperCase()}`);
