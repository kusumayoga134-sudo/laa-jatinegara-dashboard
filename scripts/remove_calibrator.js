const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../frontend/src/components/SchematicViewer.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const isCRLF = content.includes('\r\n');
content = content.replace(/\r\n/g, '\n');

// 1. Remove unused imports
content = content.replace(
  /FileSpreadsheet,\n  Sliders,\n  Copy,\n  Check,/,
  'FileSpreadsheet,'
);

// 2. Remove state
content = content.replace(
  /const \[isFullscreen, setIsFullscreen\] = useState\(false\);\n  const \[showCalibrator, setShowCalibrator\] = useState\(false\);\n  const \[calib, setCalib\] = useState\(\{[\s\S]*?\}\);\n  const \[copiedCalib, setCopiedCalib\] = useState\(false\);/,
  'const [isFullscreen, setIsFullscreen] = useState(false);'
);

// 3. Remove toolbar button
content = content.replace(
  /\n\s*{\/\* Tombol Toggle Kalibrasi Peta Model 2 \*\/}[\s\S]*?<\/button>\n/,
  '\n'
);

// 4. Clean SVG style
content = content.replace(
  /<svg\n\s*viewBox="0 0 3275 1835"\n\s*className="absolute inset-0 w-full h-full pointer-events-none"\n\s*style=\{\{[\s\S]*?\}\}\n\s*>/,
  `<svg
              viewBox="0 0 3275 1835"
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ width: '100%', height: '100%' }}
            >`
);

// 5. Clean Layer 1 yShift & transform
content = content.replace(
  /const lineYVal = line\.y !== undefined \? line\.y : \(getLineCenter\(line\)\?\.y \|\| 0\);\n\s*const isUpperBlock = lineYVal <= 1000;\n\s*const yShift = showCalibrator \? \(isUpperBlock \? calib\.offsetYAtas : calib\.offsetYBawah\) : 0;\n\n\s*return \(\n\s*<g\n\s*key=\{line\.id\}\n\s*className="pointer-events-auto cursor-pointer"\n\s*transform=\{yShift \? `translate\(0, \$\{yShift\}\)` : undefined\}/,
  `return (
                    <g
                      key={line.id}
                      className="pointer-events-auto cursor-pointer"`
);

// 6. Clean Layer 2 yShift & transform
content = content.replace(
  /const isUpperBlock = line\.cy <= 1000;\n\s*const yShift = showCalibrator \? \(isUpperBlock \? calib\.offsetYAtas : calib\.offsetYBawah\) : 0;\n\n\s*return \(\n\s*<g\n\s*key=\{line\.id\}\n\s*className="pointer-events-auto cursor-pointer"\n\s*transform=\{yShift \? `translate\(0, \$\{yShift\}\)` : undefined\}/,
  `return (
                    <g
                      key={line.id}
                      className="pointer-events-auto cursor-pointer"`
);

// 7. Clean Beacon yShift & transform
content = content.replace(
  /const isUpperBlock = center\.y <= 1000;\n\s*const yShift = showCalibrator \? \(isUpperBlock \? calib\.offsetYAtas : calib\.offsetYBawah\) : 0;\n\n\s*return \(\n\s*<g\n\s*key=\{`work-beacon-group-\$\{line\.id\}`\}\n\s*className="pointer-events-auto cursor-pointer"\n\s*transform=\{yShift \? `translate\(0, \$\{yShift\}\)` : undefined\}/,
  `return (
                  <g
                    key={\`work-beacon-group-\${line.id}\`}
                    className="pointer-events-auto cursor-pointer"`
);

// 8. Remove floating panel
content = content.replace(
  /\n\s*{\/\* ========================================================\n\s*FLOATING FINE-TUNE CALIBRATION PANEL \(MODEL 2\)[\s\S]*?{\/\* Close panel \*\/|\n\s*{\/\* ========================================================\n\s*FLOATING FINE-TUNE CALIBRATION PANEL \(MODEL 2\)[\s\S]*?}\n\s*<\/div>\n\s*<\/div>\n\s*\);\n}/,
  `
    </div>
  </div>
  );
}`
);

if (isCRLF) {
  content = content.replace(/\n/g, '\r\n');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully removed Kalibrasi Peta menu and calibration panel!');
