const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../frontend/src/components/SchematicViewer.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update imports
if (!content.includes('Sliders,')) {
  content = content.replace(
    'FileSpreadsheet,',
    'FileSpreadsheet,\r\n  Sliders,\r\n  Copy,\r\n  Check,'
  );
  if (!content.includes('Sliders,')) {
    content = content.replace(
      'FileSpreadsheet,',
      'FileSpreadsheet,\n  Sliders,\n  Copy,\n  Check,'
    );
  }
}

// 2. Update mapRatio and viewportBase
content = content.replace(
  /const \[viewportBase, setViewportBase\] = useState\(\{ width: 1420, height: \d+ \}\);/,
  'const [viewportBase, setViewportBase] = useState({ width: 1420, height: 796 });'
);
content = content.replace(
  /const mapRatio = 3275 \/ 1419;[^\n]*/,
  'const mapRatio = 3275 / 1835; // ~1.78474 (Native AutoCAD Model 2)'
);

// 3. Update imageSrc cache-buster
content = content.replace(
  /const imageSrc = '\/peta-laa-cropped-hd\.png';/,
  "const imageSrc = '/peta-laa-cropped-hd.png?v=model2';"
);

// 4. Update viewBox
content = content.replace(
  /viewBox="0 0 3275 1419"/,
  'viewBox="0 0 3275 1835"'
);

// 5. Add calibration state if not present
if (!content.includes('const [showCalibrator, setShowCalibrator]')) {
  const stateInsertAnchor = 'const [isFullscreen, setIsFullscreen] = useState(false);';
  const calibStateCode = `const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCalibrator, setShowCalibrator] = useState(false);
  const [calib, setCalib] = useState({
    offsetX: 0,
    scaleX: 1.0,
    offsetYAtas: 0,
    offsetYBawah: 0,
  });
  const [copiedCalib, setCopiedCalib] = useState(false);`;

  content = content.replace(stateInsertAnchor, calibStateCode);
}

// 6. Add calibration toolbar button next to Export PDF
if (!content.includes('Kalibrasi Peta')) {
  const exportPdfBtnAnchor = '{/* Export PDF Button */}';
  const calibBtnCode = `{/* Tombol Toggle Kalibrasi Peta Model 2 */}
          <button
            onClick={() => setShowCalibrator(!showCalibrator)}
            className={\`h-9 sm:h-10 border rounded-xl px-2.5 sm:px-3 flex items-center space-x-1.5 transition-all text-xs font-bold cursor-pointer shrink-0 shadow-2xs \${
              showCalibrator
                ? 'bg-indigo-600 text-white border-indigo-700 shadow-md'
                : 'bg-slate-50/90 hover:bg-indigo-50/60 text-slate-700 border-slate-200/90 hover:border-indigo-300'
            }\`}
            title="Buka Panel Kalibrasi Halus Sumbu X/Y untuk Peta Model 2"
          >
            <div className={\`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center shrink-0 shadow-2xs transition-all \${
              showCalibrator ? 'bg-indigo-700 text-white' : 'bg-indigo-100/90 text-indigo-600'
            }\`}>
              <Sliders className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div>
              <div className="text-[9px] text-slate-500 uppercase tracking-wider leading-none">
                KALIBRASI
              </div>
              <div className="font-black text-slate-900 text-[11px] sm:text-xs leading-none mt-0.5">
                <span className="text-indigo-600">Peta</span>
              </div>
            </div>
          </button>

          {/* Export PDF Button */}`;

  content = content.replace(exportPdfBtnAnchor, calibBtnCode);
}

// 7. Add floating calibration panel inside viewer wrapper
if (!content.includes('Panel Kalibrasi Presisi AutoCAD Model 2')) {
  const closeWrapperAnchor = '</div>\r\n    </div>\r\n  );\r\n}';
  const closeWrapperAnchorUnix = '</div>\n    </div>\n  );\n}';

  const calibPanelCode = `
      {/* ========================================================
          FLOATING FINE-TUNE CALIBRATION PANEL (MODEL 2)
          ======================================================== */}
      {showCalibrator && (
        <div className="absolute bottom-4 right-4 z-40 bg-slate-900/95 backdrop-blur-md border border-slate-700 text-slate-100 rounded-2xl shadow-2xl p-4 w-80 text-xs animate-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
            <div className="flex items-center gap-1.5 font-bold text-slate-200">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>Kalibrasi Presisi Peta Model 2</span>
            </div>
            <button
              onClick={() => setShowCalibrator(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-[11px] font-semibold text-slate-300 mb-1">
                <span>Offset X (Horizontal)</span>
                <span className="font-mono text-indigo-400">{calib.offsetX} px</span>
              </div>
              <input
                type="range"
                min="-30"
                max="30"
                step="0.5"
                value={calib.offsetX}
                onChange={(e) => setCalib({ ...calib, offsetX: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-semibold text-slate-300 mb-1">
                <span>Skala X (Lebar Rel)</span>
                <span className="font-mono text-indigo-400">{calib.scaleX.toFixed(3)}x</span>
              </div>
              <input
                type="range"
                min="0.95"
                max="1.05"
                step="0.001"
                value={calib.scaleX}
                onChange={(e) => setCalib({ ...calib, scaleX: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-semibold text-slate-300 mb-1">
                <span>Offset Y Blok Atas</span>
                <span className="font-mono text-indigo-400">{calib.offsetYAtas} px</span>
              </div>
              <input
                type="range"
                min="-30"
                max="30"
                step="0.5"
                value={calib.offsetYAtas}
                onChange={(e) => setCalib({ ...calib, offsetYAtas: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-semibold text-slate-300 mb-1">
                <span>Offset Y Blok Bawah</span>
                <span className="font-mono text-indigo-400">{calib.offsetYBawah} px</span>
              </div>
              <input
                type="range"
                min="-30"
                max="30"
                step="0.5"
                value={calib.offsetYBawah}
                onChange={(e) => setCalib({ ...calib, offsetYBawah: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(calib, null, 2));
                  setCopiedCalib(true);
                  setTimeout(() => setCopiedCalib(false), 2500);
                }}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-1.5 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                {copiedCalib ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Nilai Kalibrasi</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setCalib({ offsetX: 0, scaleX: 1.0, offsetYAtas: 0, offsetYBawah: 0 })}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-3 py-1.5 rounded-xl transition cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}`;

  if (content.includes(closeWrapperAnchor)) {
    content = content.replace(closeWrapperAnchor, calibPanelCode);
  } else if (content.includes(closeWrapperAnchorUnix)) {
    content = content.replace(closeWrapperAnchorUnix, calibPanelCode);
  }
}

// 8. Wrap SVG lines with dynamic calibration transform if non-zero
if (!content.includes('style={{ transform: calibTransform }}')) {
  content = content.replace(
    '<svg\r\n              viewBox="0 0 3275 1835"\r\n              className="absolute inset-0 w-full h-full pointer-events-none"\r\n              style={{ width: \'100%\', height: \'100%\' }}\r\n            >',
    `<svg
              viewBox="0 0 3275 1835"
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{
                width: '100%',
                height: '100%',
                transform: showCalibrator && (calib.offsetX !== 0 || calib.scaleX !== 1.0)
                  ? \`translate(\${calib.offsetX}px, 0) scale(\${calib.scaleX}, 1)\`
                  : undefined,
                transformOrigin: 'left center',
              }}
            >`
  );
  if (!content.includes('transformOrigin')) {
    content = content.replace(
      '<svg\n              viewBox="0 0 3275 1835"\n              className="absolute inset-0 w-full h-full pointer-events-none"\n              style={{ width: \'100%\', height: \'100%\' }}\n            >',
      `<svg
              viewBox="0 0 3275 1835"
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{
                width: '100%',
                height: '100%',
                transform: showCalibrator && (calib.offsetX !== 0 || calib.scaleX !== 1.0)
                  ? \`translate(\${calib.offsetX}px, 0) scale(\${calib.scaleX}, 1)\`
                  : undefined,
                transformOrigin: 'left center',
              }}
            >`
    );
  }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated SchematicViewer.jsx with calibration panel & Model 2 parameters!');
