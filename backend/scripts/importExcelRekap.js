/**
 * Script Import Data Rekap Pekerjaan Excel -> PostgreSQL Neon (Prisma)
 * Sumber: ../../RIWAYAT PEKERJAAN JLAA WILAYAH UPT RESOR LAA 1.9 JNG.xlsx
 * Fitur:
 *  - Pure Node.js XLSX parser (tanpa dependensi eksternal tambahan)
 *  - Strict 1-to-1 Exact ID Binding ke 261 elemen ALL_TRACK_LINES (SchematicViewer.jsx)
 *  - Proteksi anti-duplikat penuh (idempotent jika dijalankan berulang kali)
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

require('dotenv').config({ path: path.join(__dirname, '../.env') });
const prisma = require('../src/db');

const MONTH_NAMES_ID = [
  'JANUARI',
  'FEBRUARI',
  'MARET',
  'APRIL',
  'MEI',
  'JUNI',
  'JULI',
  'AGUSTUS',
  'SEPTEMBER',
  'OKTOBER',
  'NOVEMBER',
  'DESEMBER',
];

/**
 * Minimal pure-Node ZIP reader for .xlsx files
 */
function readZipEntries(buffer) {
  const entries = new Map();
  // Locate End of Central Directory (EOCD) signature 0x06054b50
  let eocdOffset = -1;
  for (let i = buffer.length - 22; i >= Math.max(0, buffer.length - 65557); i--) {
    if (buffer.readUInt32LE(i) === 0x06054b50) {
      eocdOffset = i;
      break;
    }
  }
  if (eocdOffset === -1) {
    throw new Error('File XLSX tidak valid (EOCD ZIP tidak ditemukan)');
  }

  const cdOffset = buffer.readUInt32LE(eocdOffset + 16);
  const totalEntries = buffer.readUInt16LE(eocdOffset + 10);

  let ptr = cdOffset;
  for (let idx = 0; idx < totalEntries; idx++) {
    if (buffer.readUInt32LE(ptr) !== 0x02014b50) break;
    const compressionMethod = buffer.readUInt16LE(ptr + 10);
    const compressedSize = buffer.readUInt32LE(ptr + 20);
    const fileNameLen = buffer.readUInt16LE(ptr + 28);
    const extraLen = buffer.readUInt16LE(ptr + 30);
    const commentLen = buffer.readUInt16LE(ptr + 32);
    const localHeaderOffset = buffer.readUInt32LE(ptr + 42);

    const fileName = buffer.toString('utf8', ptr + 46, ptr + 46 + fileNameLen);
    ptr += 46 + fileNameLen + extraLen + commentLen;

    // Read from local file header
    if (buffer.readUInt32LE(localHeaderOffset) !== 0x04034b50) continue;
    const localNameLen = buffer.readUInt16LE(localHeaderOffset + 26);
    const localExtraLen = buffer.readUInt16LE(localHeaderOffset + 28);
    const dataStart = localHeaderOffset + 30 + localNameLen + localExtraLen;
    const compressedSlice = buffer.subarray(dataStart, dataStart + compressedSize);

    let dataBuf;
    if (compressionMethod === 0) {
      dataBuf = compressedSlice;
    } else if (compressionMethod === 8) {
      dataBuf = zlib.inflateRawSync(compressedSlice);
    } else {
      throw new Error(`Unsupported ZIP compression method ${compressionMethod} for ${fileName}`);
    }
    entries.set(fileName, dataBuf);
  }
  return entries;
}

function decodeXmlEntities(str) {
  return String(str || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function colRefToIndex(ref) {
  const m = String(ref || '').match(/^([A-Za-z]+)/);
  if (!m) return -1;
  let idx = 0;
  for (const ch of m[1].toUpperCase()) {
    idx = idx * 26 + (ch.charCodeAt(0) - 64);
  }
  return idx - 1;
}

function parseSharedStrings(xmlText) {
  const list = [];
  if (!xmlText) return list;
  const siMatches = xmlText.match(/<si\b[^>]*>[\s\S]*?<\/si>/g) || [];
  for (const si of siMatches) {
    const tMatches = si.match(/<t\b[^>]*>([\s\S]*?)<\/t>/g) || [];
    const combined = tMatches
      .map((tTag) => decodeXmlEntities(tTag.replace(/^<t\b[^>]*>/, '').replace(/<\/t>$/, '')))
      .join('');
    list.push(combined);
  }
  return list;
}

function parseSheetRows(xmlText, sharedStrings) {
  const rows = [];
  const rowMatches = xmlText.match(/<row\b[^>]*>[\s\S]*?<\/row>/g) || [];
  for (const rowXml of rowMatches) {
    const rowNumMatch = rowXml.match(/\br="(\d+)"/);
    const rowNum = rowNumMatch ? parseInt(rowNumMatch[1], 10) : 0;

    const cells = [];
    let maxCol = -1;
    const cellMatches = rowXml.match(/<c\b[^>]*?(?:\/>|>[\s\S]*?<\/c>)/g) || [];
    for (const cXml of cellMatches) {
      const refMatch = cXml.match(/\br="([^"]+)"/);
      const typeMatch = cXml.match(/\bt="([^"]+)"/);
      const colIdx = refMatch ? colRefToIndex(refMatch[1]) : maxCol + 1;
      if (colIdx > maxCol) maxCol = colIdx;

      const cellType = typeMatch ? typeMatch[1] : '';
      let value = '';
      if (cellType === 'inlineStr') {
        const tMatches = cXml.match(/<t\b[^>]*>([\s\S]*?)<\/t>/g) || [];
        value = tMatches
          .map((tTag) => decodeXmlEntities(tTag.replace(/^<t\b[^>]*>/, '').replace(/<\/t>$/, '')))
          .join('');
      } else {
        const vMatch = cXml.match(/<v\b[^>]*>([\s\S]*?)<\/v>/);
        if (vMatch) {
          const rawVal = decodeXmlEntities(vMatch[1]);
          if (cellType === 's') {
            value = sharedStrings[parseInt(rawVal, 10)] ?? '';
          } else {
            value = rawVal;
          }
        }
      }
      cells[colIdx] = String(value).trim();
    }

    if (maxCol >= 0) {
      const normalized = Array.from({ length: maxCol + 1 }, (_, i) => (cells[i] !== undefined ? cells[i] : ''));
      if (normalized.some((v) => v !== '')) {
        rows.push({ rowNum, cells: normalized });
      }
    }
  }
  return rows;
}

function loadTrackLines() {
  const viewerPath = path.join(__dirname, '../../frontend/src/components/SchematicViewer.jsx');
  const src = fs.readFileSync(viewerPath, 'utf8');
  const match = src.match(/export const ALL_TRACK_LINES = (\[[\s\S]*?\n\]);/);
  if (!match) {
    throw new Error('Tidak dapat membaca ALL_TRACK_LINES dari SchematicViewer.jsx');
  }
  // Safe static array evaluation
  const fn = new Function(`return ${match[1]}`);
  return fn();
}

function findExactTrackLine(lokasiText, trackLines) {
  const norm = String(lokasiText || '').trim().toLowerCase().replace(/\s+/g, ' ');
  if (!norm) return null;

  // 1. Exact title match
  let found = trackLines.find((l) => (l.title || '').trim().toLowerCase().replace(/\s+/g, ' ') === norm);
  if (found) return found;

  // 2. Exact code match (e.g., "NASPAN 9 (EMPL CUK HU)" -> cuk_jalur_1_empl)
  found = trackLines.find((l) => (l.code || '').trim().toLowerCase().replace(/\s+/g, ' ') === norm);
  if (found) return found;

  // 3. Exact id match
  found = trackLines.find((l) => (l.id || '').trim().toLowerCase() === norm);
  if (found) return found;

  // 4. Normalized alphanumeric exact match
  const alpha = norm.replace(/[^a-z0-9]/g, '');
  if (alpha) {
    found = trackLines.find((l) => {
      const at = (l.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const ac = (l.code || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      return (at && at === alpha) || (ac && ac === alpha);
    });
    if (found) return found;
  }

  return null;
}

function makeDedupSignature(item) {
  return [
    String(item.tahun || ''),
    String(item.bulan || '').trim().toUpperCase(),
    String(item.actionType || '').trim().toUpperCase(),
    String(item.targetId || '').trim().toLowerCase(),
    String(item.kilometer || '').trim().toUpperCase(),
    String(item.description || '-').trim().toUpperCase(),
  ].join('||');
}

async function main() {
  console.log('==================================================================');
  console.log('📥 IMPORT DATA REKAP EXCEL -> POSTGRESQL NEON (UPT LAA 1.9 JNG)');
  console.log('==================================================================');

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL tidak ditemukan di backend/.env! Import ke Neon dibatalkan.');
  }

  const xlsxPath = path.join(__dirname, '../../RIWAYAT PEKERJAAN JLAA WILAYAH UPT RESOR LAA 1.9 JNG.xlsx');
  if (!fs.existsSync(xlsxPath)) {
    throw new Error(`File Excel tidak ditemukan di: ${xlsxPath}`);
  }

  const zipBuf = fs.readFileSync(xlsxPath);
  const entries = readZipEntries(zipBuf);
  const sharedStrings = parseSharedStrings(entries.get('xl/sharedStrings.xml')?.toString('utf8') || '');
  const sheetXml = entries.get('xl/worksheets/sheet1.xml')?.toString('utf8');
  if (!sheetXml) {
    throw new Error('sheet1.xml tidak ditemukan di dalam file Excel');
  }

  const rawRows = parseSheetRows(sheetXml, sharedStrings);
  const trackLines = loadTrackLines();
  console.log(`🗺️  Master ALL_TRACK_LINES dimuat: ${trackLines.length} elemen.`);

  // Locate header row (contains WAKTU & JENIS PEKERJAAN & LOKASI)
  const headerIdx = rawRows.findIndex(
    (r) =>
      r.cells.some((c) => c.toUpperCase() === 'JENIS PEKERJAAN') &&
      r.cells.some((c) => c.toUpperCase() === 'LOKASI')
  );
  if (headerIdx === -1) {
    throw new Error('Baris header tabel (JENIS PEKERJAAN / LOKASI) tidak ditemukan di Excel.');
  }

  const dataRows = rawRows.slice(headerIdx + 1);
  const preparedRecords = [];
  const unmatchedRows = [];

  for (const row of dataRows) {
    const [tahunRaw, bulanRaw, jenisRaw, lokasiRaw, kmRaw, uraianRaw] = row.cells;
    const tahunNum = parseInt(String(tahunRaw || '').trim(), 10);
    const bulan = String(bulanRaw || '').trim().toUpperCase();
    const actionType = String(jenisRaw || '').trim();
    const lokasi = String(lokasiRaw || '').trim();
    const kilometer = String(kmRaw || '').trim();
    const description = String(uraianRaw || '').trim() || '-';

    // Ignore trailing stray/empty rows (e.g., row 47 containing only "U")
    if (!tahunRaw && !actionType && !lokasi) {
      continue;
    }
    if (isNaN(tahunNum) || !bulan || !actionType || !lokasi) {
      console.warn(`⚠️  Baris Excel #${row.rowNum} dilewati (data tidak lengkap):`, row.cells);
      continue;
    }

    const matchedLine = findExactTrackLine(lokasi, trackLines);
    if (!matchedLine) {
      unmatchedRows.push({ rowNum: row.rowNum, lokasi, actionType });
      continue;
    }

    const monthIdx = MONTH_NAMES_ID.indexOf(bulan);
    const timestamp = new Date(Date.UTC(tahunNum, monthIdx >= 0 ? monthIdx : 0, 15, 5, 0, 0));

    preparedRecords.push({
      excelRow: row.rowNum,
      tahun: tahunNum,
      bulan,
      actionType,
      targetType: 'LINE',
      targetCode: lokasi,
      targetId: matchedLine.id,
      matchedTitle: matchedLine.title,
      kilometer: kilometer || matchedLine.km || '-',
      description,
      timestamp,
      status: 'COMPLETED',
    });
  }

  if (unmatchedRows.length > 0) {
    console.error('❌ Ditemukan baris yang tidak cocok ke ALL_TRACK_LINES:', unmatchedRows);
    throw new Error('Import dibatalkan karena ada lokasi yang tidak cocok 1-to-1.');
  }

  console.log(`✅ Terbaca ${preparedRecords.length} baris valid dari Excel (100% Exact Target ID Match).`);

  // Fetch existing logs from Neon DB for anti-duplicate protection
  const existingLogs = await prisma.maintenanceLog.findMany({
    select: {
      id: true,
      tahun: true,
      bulan: true,
      actionType: true,
      targetId: true,
      kilometer: true,
      description: true,
    },
  });

  const existingSignatures = new Set(existingLogs.map(makeDedupSignature));
  console.log(`📦 Data existing di Neon DB sebelum import: ${existingLogs.length} baris.`);

  let insertedCount = 0;
  let skippedCount = 0;

  for (const rec of preparedRecords) {
    const sig = makeDedupSignature(rec);
    if (existingSignatures.has(sig)) {
      skippedCount++;
      console.log(`⏭️  [SKIP DUPLIKAT] Baris #${rec.excelRow}: ${rec.bulan} ${rec.tahun} | ${rec.actionType} | ${rec.targetId}`);
      continue;
    }

    await prisma.maintenanceLog.create({
      data: {
        timestamp: rec.timestamp,
        tahun: rec.tahun,
        bulan: rec.bulan,
        kilometer: rec.kilometer,
        targetType: rec.targetType,
        targetCode: rec.targetCode,
        targetId: rec.targetId,
        actionType: rec.actionType,
        technician: null,
        description: rec.description,
        status: rec.status,
      },
    });
    existingSignatures.add(sig);
    insertedCount++;
    console.log(`✅ [INSERT #${insertedCount}] ${rec.bulan} ${rec.tahun} | ${rec.actionType} -> ${rec.targetId} (${rec.kilometer})`);
  }

  const finalTotal = await prisma.maintenanceLog.count();
  console.log('==================================================================');
  console.log(`📊 RINGKASAN IMPORT EXCEL KE NEON DB:`);
  console.log(`   • Total baris valid di Excel : ${preparedRecords.length}`);
  console.log(`   • Berhasil masuk (Baru)      : ${insertedCount}`);
  console.log(`   • Dilewati (Anti-duplikat)   : ${skippedCount}`);
  console.log(`   • Total data aktif di Neon   : ${finalTotal}`);
  console.log('==================================================================');
}

main()
  .catch((err) => {
    console.error('❌ Import gagal:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
