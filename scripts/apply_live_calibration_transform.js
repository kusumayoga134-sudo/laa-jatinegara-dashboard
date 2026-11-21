const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../frontend/src/components/SchematicViewer.jsx');
let code = fs.readFileSync(filePath, 'utf8');

// Replace CRLF temporarily for clean matching
const isCRLF = code.includes('\r\n');
code = code.replace(/\r\n/g, '\n');

// 1. Layer 1 transform
const l1Old = `                  const isHovered = hoveredLine?.id === line.id;
                  const isActive = selectedLocation?.id === line.id;

                  return (
                    <g
                      key={line.id}
                      className="pointer-events-auto cursor-pointer"`;

const l1New = `                  const isHovered = hoveredLine?.id === line.id;
                  const isActive = selectedLocation?.id === line.id;
                  const lineYVal = line.y !== undefined ? line.y : (getLineCenter(line)?.y || 0);
                  const isUpperBlock = lineYVal <= 1000;
                  const yShift = showCalibrator ? (isUpperBlock ? calib.offsetYAtas : calib.offsetYBawah) : 0;

                  return (
                    <g
                      key={line.id}
                      className="pointer-events-auto cursor-pointer"
                      transform={yShift ? \`translate(0, \${yShift})\` : undefined}`;

// 2. Layer 2 transform
const l2Old = `                  const isHovered = hoveredLine?.id === line.id;
                  const isActive = selectedLocation?.id === line.id;

                  return (
                    <g
                      key={line.id}
                      className="pointer-events-auto cursor-pointer"`;

const l2New = `                  const isHovered = hoveredLine?.id === line.id;
                  const isActive = selectedLocation?.id === line.id;
                  const isUpperBlock = line.cy <= 1000;
                  const yShift = showCalibrator ? (isUpperBlock ? calib.offsetYAtas : calib.offsetYBawah) : 0;

                  return (
                    <g
                      key={line.id}
                      className="pointer-events-auto cursor-pointer"
                      transform={yShift ? \`translate(0, \${yShift})\` : undefined}`;

// 3. Beacon transform
const bOld = `                return (
                  <g
                    key={\`work-beacon-group-\${line.id}\`}
                    className="pointer-events-auto cursor-pointer"`;

const bNew = `                const isUpperBlock = center.y <= 1000;
                const yShift = showCalibrator ? (isUpperBlock ? calib.offsetYAtas : calib.offsetYBawah) : 0;

                return (
                  <g
                    key={\`work-beacon-group-\${line.id}\`}
                    className="pointer-events-auto cursor-pointer"
                    transform={yShift ? \`translate(0, \${yShift})\` : undefined}`;

let c1 = 0, c2 = 0, c3 = 0;
if (code.includes(l1Old)) {
  code = code.replace(l1Old, l1New);
  c1++;
  // After l1 is replaced, l2Old will match the second occurrence!
  if (code.includes(l2Old)) {
    code = code.replace(l2Old, l2New);
    c2++;
  }
}

if (code.includes(bOld)) {
  code = code.replace(bOld, bNew);
  c3++;
}

if (isCRLF) {
  code = code.replace(/\n/g, '\r\n');
}

fs.writeFileSync(filePath, code, 'utf8');
console.log(`Replaced: L1=${c1}, L2=${c2}, Beacon=${c3}`);
