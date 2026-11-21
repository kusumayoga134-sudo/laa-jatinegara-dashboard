import { computeCalloutLayout, VIRTUAL_CANVAS, getElbowSvgPath } from '../frontend/src/utils/pdfExportEngine.js';
import fs from 'fs';

const rawTracks = JSON.parse(fs.readFileSync(new URL('./all_track_lines.json', import.meta.url), 'utf8'));

// 9 actual track lines from the user's screenshot
const sampleIndices = [0, 1, 9, 70, 75, 80, 100, 150, 200];
const linesWithLogs = sampleIndices.map((idx, i) => {
  const line = rawTracks[idx] || rawTracks[i];
  return {
    line,
    logs: [
      {
        id: `log-${i}`,
        actionType: i % 2 === 0 ? 'PENGGANTIAN ISOLATOR' : 'PERBAIKAN KAWAT TROLLEY',
        status: i % 3 === 0 ? 'COMPLETED' : 'IN_PROGRESS',
        technician: 'PT. KAPM',
        createdAt: new Date().toISOString(),
      },
    ],
    center: {
      x: line.xStart != null && line.xEnd != null ? (line.xStart + line.xEnd) / 2 : 150 + i * 320,
      y: line.y != null ? line.y : 400 + (i % 2) * 600,
    },
  };
});

console.log(`Processing ${linesWithLogs.length} lines with logs...`);
const cards = computeCalloutLayout({ linesWithLogs, customPositions: {} });

let allValid = true;
cards.forEach((c, idx) => {
  const left = c.x;
  const right = c.x + c.w;
  const top = c.y;
  const bottom = c.y + c.h;
  const isValid = left >= 40 && right <= 3235 && top >= 0 && bottom <= 1835;
  if (!isValid) allValid = false;

  console.log(`Card ${idx + 1} [${c.line.code}]:`);
  console.log(`  Lane: ${c.isUpper ? 'ATAS' : 'BAWAH'}`);
  console.log(`  Box X: [${left} .. ${right}] (w=${c.w}), Y: [${top} .. ${bottom}] (h=${c.h})`);
  console.log(`  Radar Target: (${c.radarX}, ${c.radarY})`);
  console.log(`  SVG Path: ${getElbowSvgPath(c)}`);
  console.log(`  Validation [40 <= x <= 3235]: ${isValid ? 'PASSED ✅' : 'FAILED ❌'}\n`);
});

console.log('=============================================');
console.log(`MATHEMATICAL VERIFICATION: ${allValid ? 'ALL 9 CARDS 100% IN BOUNDS [40..3235] ✅' : 'FAILED ❌'}`);
console.log('=============================================');
