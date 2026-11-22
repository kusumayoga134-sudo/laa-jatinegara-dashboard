const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

console.log('🔧 [Vercel Build] Menyiapkan Prisma schema untuk PostgreSQL Neon di Linux Vercel...');

// Ubah provider dari sqlite menjadi postgresql
schema = schema.replace(/provider\s*=\s*"sqlite"/g, 'provider = "postgresql"');

// Ubah url dari file:./dev.db menjadi env("DATABASE_URL")
schema = schema.replace(/url\s*=\s*"file:[^"]*"/g, 'url      = env("DATABASE_URL")');

// Pastikan binaryTargets mencakup rhel-openssl-3.0.x untuk serverless Vercel
if (!schema.includes('rhel-openssl-3.0.x')) {
  schema = schema.replace(
    /generator\s+client\s+\{[\s\S]*?\}/,
    `generator client {\n  provider      = "prisma-client-js"\n  binaryTargets = ["native", "rhel-openssl-3.0.x"]\n}`
  );
}

fs.writeFileSync(schemaPath, schema, 'utf8');
console.log('✅ [Vercel Build] Prisma schema berhasil dikonfigurasi untuk PostgreSQL Neon!');
