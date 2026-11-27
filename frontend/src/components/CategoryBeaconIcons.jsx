import React from 'react';

/**
 * 9 Kategori Ikon dari Kotak "KETERANGAN :" Model 3
 * Digunakan KHUSUS pada tampilan Monitoring Utama (SchematicViewer.jsx)
 */
export const BEACON_CATEGORIES = [
  {
    key: 'GROUNDING',
    label: 'GROUNDING',
    pattern: /grounding|pentanahan|arde/i,
  },
  {
    key: 'GUY',
    label: 'GUY',
    pattern: /\bguy\b|guy\s*wire|tali\s*guy/i,
  },
  {
    key: 'FEEDING_BRANCH',
    label: 'FEEDING BRANCH',
    pattern: /feeding\s*branch|feeding/i,
  },
  {
    key: 'ISOLATOR',
    label: 'ISOLATOR',
    pattern: /isolator|insulator/i,
  },
  {
    key: 'PULLOFF_STEADY',
    label: 'PULLOFF/STEADY BRACE',
    pattern: /pull[\s-]*off|steady\s*brace|\bsteady\b/i,
  },
  {
    key: 'TROLLEY_WIRE',
    label: 'TROLLEY WIRE',
    pattern: /trolley|troli|kawat\s*kontak|contact\s*wire/i,
  },
  {
    key: 'MESSENGER_WIRE',
    label: 'MESSENGER WIRE',
    pattern: /messenger/i,
  },
  {
    key: 'FEEDER_WIRE',
    label: 'FEEDER WIRE',
    pattern: /feeder/i,
  },
  {
    key: 'OHGW',
    label: 'OHGW',
    pattern: /ohgw|kawat\s*petir|ground\s*wire/i,
  },
];

/**
 * Deteksi unik kategori pekerjaan untuk 1 segmen (tanpa duplikasi ikon)
 */
export function detectBeaconCategories(logs = []) {
  if (!Array.isArray(logs) || logs.length === 0) return [];

  const matched = new Set();
  logs.forEach((log) => {
    if (!log) return;
    const desc = log.description && String(log.description).trim() !== '-' ? log.description : '';
    const haystack = `${log.actionType || ''} ${log.title || ''} ${desc}`.trim();
    if (!haystack) return;

    BEACON_CATEGORIES.forEach((cat) => {
      if (cat.pattern.test(haystack)) {
        matched.add(cat.key);
      }
    });
  });

  return BEACON_CATEGORIES.filter((cat) => matched.has(cat.key));
}

function renderCategorySymbol(key) {
  switch (key) {
    case 'GROUNDING':
      return (
        <g stroke="#A8B018" strokeWidth="1.35" strokeLinecap="round" fill="none">
          <line x1="0" y1="-6.5" x2="0" y2="2.5" />
          <line x1="-5.5" y1="2.5" x2="5.5" y2="2.5" />
          <line x1="-3.7" y1="4.8" x2="3.7" y2="4.8" />
          <line x1="-1.9" y1="7.0" x2="1.9" y2="7.0" />
        </g>
      );

    case 'GUY':
      return (
        <g stroke="#39A82C" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <circle cx="-5.2" cy="0" r="2.4" fill="#39A82C" fillOpacity="0.18" />
          <line x1="-6.7" y1="-0.8" x2="-3.7" y2="-0.8" strokeWidth="0.8" />
          <line x1="-6.7" y1="0.8" x2="-3.7" y2="0.8" strokeWidth="0.8" />
          <line x1="-5.2" y1="-2.4" x2="7.2" y2="0" />
          <line x1="-5.2" y1="2.4" x2="7.2" y2="0" />
          <polyline points="3.5,-3 7.2,0 3.5,3" />
        </g>
      );

    case 'FEEDING_BRANCH':
      return (
        <g strokeLinecap="round">
          <line x1="-7.8" y1="-4.2" x2="7.8" y2="-4.2" stroke="#0f172a" strokeWidth="1.15" />
          <line
            x1="-7.8"
            y1="4.2"
            x2="7.8"
            y2="4.2"
            stroke="#0f172a"
            strokeWidth="1.15"
            strokeDasharray="2.5 1.8"
          />
          <line
            x1="0"
            y1="-4.2"
            x2="0"
            y2="4.2"
            stroke="#C026D3"
            strokeWidth="1.3"
            strokeDasharray="1.8 1.4"
          />
          <circle cx="0" cy="-4.2" r="1.6" fill="#C026D3" />
          <circle cx="0" cy="4.2" r="1.6" fill="#C026D3" />
        </g>
      );

    case 'ISOLATOR':
      return (
        <g strokeLinecap="round" strokeLinejoin="round">
          <line x1="-8" y1="0" x2="8" y2="0" stroke="#0f172a" strokeWidth="1.1" />
          <polygon points="-4.2,0 0,-3.2 0,3.2" fill="#ffffff" stroke="#1D6FE2" strokeWidth="1.2" />
          <polygon points="0,0 4.2,-3.2 4.2,3.2" fill="#ffffff" stroke="#1D6FE2" strokeWidth="1.2" />
        </g>
      );

    case 'PULLOFF_STEADY':
      return (
        <g strokeLinecap="round" strokeLinejoin="round" fill="none">
          <line x1="-7.5" y1="4.8" x2="7.5" y2="4.8" stroke="#0f172a" strokeWidth="1.25" />
          <line x1="0" y1="4.6" x2="0" y2="-5.8" stroke="#F59E0B" strokeWidth="1.4" />
          <polyline points="-3.2,-2.4 0,-5.8 3.2,-2.4" stroke="#F59E0B" strokeWidth="1.4" />
        </g>
      );

    case 'TROLLEY_WIRE':
      return (
        <line
          x1="-7.5"
          y1="0"
          x2="7.5"
          y2="0"
          stroke="#DC2626"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      );

    case 'MESSENGER_WIRE':
      return (
        <g stroke="#F43F5E" strokeWidth="1.2" strokeLinecap="round">
          <line x1="-7.5" y1="-2.1" x2="7.5" y2="-2.1" />
          <line x1="-7.5" y1="2.1" x2="7.5" y2="2.1" />
        </g>
      );

    case 'FEEDER_WIRE':
      return (
        <g stroke="#86B886" strokeWidth="1.25" strokeLinecap="round">
          <line x1="-7.8" y1="0" x2="7.8" y2="0" />
          <line x1="-3.3" y1="4.6" x2="0.4" y2="-4.6" />
          <line x1="-0.2" y1="4.6" x2="3.5" y2="-4.6" />
        </g>
      );

    case 'OHGW':
      return (
        <g stroke="#06D6E8" strokeWidth="1.3" strokeLinecap="round">
          <line x1="-8" y1="0" x2="8" y2="0" />
          <circle cx="-5.6" cy="0" r="1.35" fill="#ffffff" strokeWidth="1.0" />
          <circle cx="-1.9" cy="0" r="1.35" fill="#ffffff" strokeWidth="1.0" />
          <circle cx="1.9" cy="0" r="1.35" fill="#ffffff" strokeWidth="1.0" />
          <circle cx="5.6" cy="0" r="1.35" fill="#ffffff" strokeWidth="1.0" />
        </g>
      );

    default:
      return null;
  }
}

/**
 * Komponen ikon vektor SVG crisp di dalam lingkaran putih berborder abu-abu tipis
 */
export function CategoryBeaconIcon({ category, cx = 0, cy = 0 }) {
  if (!category) return null;

  return (
    <g
      transform={`translate(${cx}, ${cy})`}
      style={{ filter: 'drop-shadow(0 1.5px 2.5px rgba(15, 23, 42, 0.28))' }}
    >
      <title>{category.label}</title>
      <circle cx="0" cy="0" r="10.2" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.2" />
      {renderCategorySymbol(category.key)}
    </g>
  );
}
