const fs = require('fs');
const path = require('path');

const calibrated = require('./calibrated_track_lines_perfect.json');

// 1. Update scripts/all_track_lines.json
fs.writeFileSync(
  path.resolve(__dirname, 'all_track_lines.json'),
  JSON.stringify(calibrated, null, 2),
  'utf8'
);
console.log('Updated scripts/all_track_lines.json');

// 2. Update SchematicViewer.jsx
const viewerPath = path.resolve(__dirname, '../frontend/src/components/SchematicViewer.jsx');
let content = fs.readFileSync(viewerPath, 'utf8');

const newArrayJs = JSON.stringify(calibrated, null, 2);

content = content.replace(
  /export const ALL_TRACK_LINES = \[[\s\S]*?\n\];/,
  `export const ALL_TRACK_LINES = ${newArrayJs};`
);

fs.writeFileSync(viewerPath, content, 'utf8');
console.log('Updated frontend/src/components/SchematicViewer.jsx with calibrated ALL_TRACK_LINES!');
