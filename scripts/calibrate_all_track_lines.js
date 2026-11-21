const fs = require('fs');
const path = require('path');

const schematicPath = path.resolve(__dirname, '../frontend/src/components/SchematicViewer.jsx');
let content = fs.readFileSync(schematicPath, 'utf8');

// Match ALL_TRACK_LINES array
const match = content.match(/export const ALL_TRACK_LINES = (\[[\s\S]*?\n\];)/);
if (!match) {
  console.error('Could not find ALL_TRACK_LINES in SchematicViewer.jsx');
  process.exit(1);
}

const lines = eval(match[1]);
console.log(`Calibrating ${lines.length} track lines for AutoCAD Model 2...`);

function shiftSvgPathY(d, offsetY) {
  return d.replace(/([MLA])\s*([^MLA]+)/g, (match, cmd, argsStr) => {
    const nums = argsStr.trim().split(/[\s,]+/).map(Number);
    if (cmd === 'M' || cmd === 'L') {
      const res = [];
      for (let i = 0; i < nums.length; i += 2) {
        const x = nums[i];
        const y = nums[i + 1] + offsetY;
        res.push(`${Number(x.toFixed(2))} ${Number(y.toFixed(2))}`);
      }
      return `${cmd} ${res.join(' ')} `;
    } else if (cmd === 'A') {
      const res = [];
      for (let i = 0; i < nums.length; i += 7) {
        const rx = nums[i];
        const ry = nums[i + 1];
        const rot = nums[i + 2];
        const laf = nums[i + 3];
        const sf = nums[i + 4];
        const x = nums[i + 5];
        const y = nums[i + 6] + offsetY;
        res.push(`${rx} ${ry} ${rot} ${laf} ${sf} ${Number(x.toFixed(2))} ${Number(y.toFixed(2))}`);
      }
      return `${cmd} ${res.join(' ')} `;
    }
    return match;
  }).trim().replace(/\s+/g, ' ');
}

// Right bend special cases (connecting Upper Block to Lower Block on right side)
const SPECIAL_PATHS = {
  naspan_8b_bua_kldb_hu: 'M 3098.5 860.2 L 3112.1 860.5 L 3143.5 893.0 L 3143.4 1252.0 L 3101.6 1295.6 L 3046.3 1295.6',
  naspan_8b_bua_kldb_hi: 'M 3098.5 812.5 L 3122.4 812.6 L 3180.7 873.1 L 3180.6 1278.8 L 3122.2 1343.4 L 3046.3 1343.4',
};

const OFFSET_Y_UPPER = 157.2;
const OFFSET_Y_LOWER = 230.8;

let upperCount = 0;
let lowerCount = 0;
let specialCount = 0;

const calibratedLines = lines.map((line) => {
  const newLine = { ...line };

  if (SPECIAL_PATHS[line.id]) {
    newLine.d = SPECIAL_PATHS[line.id];
    if (newLine.hitD) {
      newLine.hitD = SPECIAL_PATHS[line.id];
    }
    specialCount++;
    return newLine;
  }

  // Determine if Upper or Lower using original Y
  // We can calculate avg Y of all numbers in d
  const nums = [];
  const parts = line.d.replace(/[A-Za-z]/g, ' ').trim().split(/\s+/).map(Number);
  for (let i = 1; i < parts.length; i += 2) {
    if (!isNaN(parts[i])) nums.push(parts[i]);
  }
  const avgY = nums.length ? (nums.reduce((a, b) => a + b, 0) / nums.length) : (line.y || 0);

  const isUpper = avgY < 750;
  const offsetY = isUpper ? OFFSET_Y_UPPER : OFFSET_Y_LOWER;

  if (isUpper) upperCount++;
  else lowerCount++;

  newLine.d = shiftSvgPathY(line.d, offsetY);

  if (newLine.hitD) {
    newLine.hitD = shiftSvgPathY(newLine.hitD, offsetY);
  }

  if (typeof newLine.y === 'number') {
    newLine.y = Number((newLine.y + offsetY).toFixed(2));
  }

  return newLine;
});

console.log(`Calibration stats: Upper=${upperCount}, Lower=${lowerCount}, SpecialRightBends=${specialCount}`);

// Serialize calibrated lines back to JavaScript code format
const newArrayJs = JSON.stringify(calibratedLines, null, 2);
const updatedCode = content.replace(
  /export const ALL_TRACK_LINES = \[[\s\S]*?\n\];/,
  `export const ALL_TRACK_LINES = ${newArrayJs};`
);

fs.writeFileSync(schematicPath, updatedCode, 'utf8');
console.log(`Successfully updated ${schematicPath}`);

// Also update scripts/all_track_lines.json
const jsonPath = path.resolve(__dirname, 'all_track_lines.json');
fs.writeFileSync(jsonPath, JSON.stringify(calibratedLines, null, 2), 'utf8');
console.log(`Successfully updated ${jsonPath}`);
