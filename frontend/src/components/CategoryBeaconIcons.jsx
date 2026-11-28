import React from 'react';
import { BEACON_CATEGORIES, detectLogCategories } from '../utils/workLogHelpers';

export { BEACON_CATEGORIES, detectLogCategories };

/**
 * Deteksi unik kategori pekerjaan untuk 1 segmen (tanpa duplikasi ikon)
 */
export function detectBeaconCategories(logs = []) {
  if (!Array.isArray(logs) || logs.length === 0) return [];

  const matched = new Set();
  logs.forEach((log) => {
    detectLogCategories(log).forEach((cat) => matched.add(cat.key));
  });

  return BEACON_CATEGORIES.filter((cat) => matched.has(cat.key));
}

/**
 * Tata letak ikon kategori anti-tabrakan dengan multi-row upward stacking otomatis.
 * Mendukung hingga 9 ikon sekaligus per segmen dan menjaga jarak aman terhadap radar tetangga.
 */
export function computeBeaconIconLayout(linesWithLogs = []) {
  const layoutMap = new Map();
  if (!Array.isArray(linesWithLogs) || linesWithLogs.length === 0) return layoutMap;

  const ICON_R = 9.5;
  const STEP_X = 21.5;
  const STEP_Y = 21.5;
  const FIRST_ROW_OFFSET = 22;

  const allRadars = linesWithLogs.map(({ line, center }) => ({
    id: line.id,
    x: center.x,
    y: center.y,
  }));

  const placedIconCenters = [];

  // Process top-to-bottom so upper beacons claim clean space and lower ones can dodge if needed
  const ordered = [...linesWithLogs].sort((a, b) => a.center.y - b.center.y || a.center.x - b.center.x);

  ordered.forEach(({ line, logs: lineLogs, center }) => {
    const categories = detectBeaconCategories(lineLogs);
    if (categories.length === 0) {
      layoutMap.set(line.id, { categories: [], placements: [], minX: center.x, maxX: center.x, minY: center.y });
      return;
    }

    const dotX = center.x;
    const dotY = center.y;

    // 1. Check horizontal corridor neighbors (same horizontal track height band <= 26px)
    let leftNeighborX = -Infinity;
    let rightNeighborX = Infinity;
    for (const r of allRadars) {
      if (r.id === line.id) continue;
      if (Math.abs(r.y - dotY) <= 26) {
        if (r.x < dotX && r.x > leftNeighborX) leftNeighborX = r.x;
        if (r.x > dotX && r.x < rightNeighborX) rightNeighborX = r.x;
      }
    }

    const leftClear = Number.isFinite(leftNeighborX) ? (dotX - leftNeighborX) / 2 - 2 : Infinity;
    const rightClear = Number.isFinite(rightNeighborX) ? (rightNeighborX - dotX) / 2 - 2 : Infinity;
    const edgeClear = Math.min(dotX - 18, 3275 - 18 - dotX);
    const maxHalfSpan = Math.max(ICON_R, Math.min(leftClear, rightClear, edgeClear));

    // Maximum icons fitting horizontally centered around dotX without crossing neighbor midpoint
    const maxColsBySpace = Math.max(
      1,
      Math.min(9, Math.floor((Math.max(ICON_R * 2, maxHalfSpan * 2) - ICON_R * 2) / STEP_X) + 1)
    );

    const n = categories.length;
    let rows = [];
    if (n <= maxColsBySpace) {
      rows = [categories];
    } else {
      const rowCount = Math.ceil(n / maxColsBySpace);
      const base = Math.floor(n / rowCount);
      const rem = n % rowCount;
      let cursor = 0;
      for (let r = 0; r < rowCount; r++) {
        const countInRow = base + (r < rem ? 1 : 0);
        rows.push(categories.slice(cursor, cursor + countInRow));
        cursor += countInRow;
      }
    }

    const placements = [];
    let currentY = dotY - FIRST_ROW_OFFSET;

    rows.forEach((rowCats) => {
      const rowStartX = dotX - ((rowCats.length - 1) * STEP_X) / 2;

      // Ensure this row does not collide vertically with another radar dot or previously placed icon
      for (let guard = 0; guard < 12; guard++) {
        let hasCollision = false;
        for (let cIdx = 0; cIdx < rowCats.length; cIdx++) {
          const cx = rowStartX + cIdx * STEP_X;
          for (const r of allRadars) {
            if (r.id === line.id) continue;
            if (Math.hypot(cx - r.x, currentY - r.y) < ICON_R + 10.5) {
              hasCollision = true;
              break;
            }
          }
          if (hasCollision) break;
          for (const prev of placedIconCenters) {
            if (Math.abs(cx - prev.x) < ICON_R * 2 + 1 && Math.abs(currentY - prev.y) < ICON_R * 2 + 1) {
              hasCollision = true;
              break;
            }
          }
          if (hasCollision) break;
        }
        if (!hasCollision) break;
        currentY -= STEP_Y;
      }

      rowCats.forEach((cat, cIdx) => {
        const cx = rowStartX + cIdx * STEP_X;
        const cy = currentY;
        placements.push({ category: cat, cx, cy });
        placedIconCenters.push({ x: cx, y: cy });
      });

      currentY -= STEP_Y;
    });

    const minX = Math.min(...placements.map((p) => p.cx - ICON_R - 2));
    const maxX = Math.max(...placements.map((p) => p.cx + ICON_R + 2));
    const minY = Math.min(...placements.map((p) => p.cy - ICON_R - 2));

    layoutMap.set(line.id, { categories, placements, minX, maxX, minY });
  });

  return layoutMap;
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
      // Serasi dengan Model 4: batang vertikal ungu solid dengan 2 titik bulat di garis atas solid & bawah putus-putus
      return (
        <g strokeLinecap="round">
          <line x1="-7.8" y1="-4.2" x2="7.8" y2="-4.2" stroke="#0f172a" strokeWidth="1.2" />
          <line
            x1="-7.8"
            y1="4.2"
            x2="7.8"
            y2="4.2"
            stroke="#0f172a"
            strokeWidth="1.2"
            strokeDasharray="2.5 1.8"
          />
          <line x1="0" y1="-4.2" x2="0" y2="4.2" stroke="#C026D3" strokeWidth="1.4" />
          <circle cx="0" cy="-4.2" r="1.6" fill="#C026D3" />
          <circle cx="0" cy="4.2" r="1.6" fill="#C026D3" />
        </g>
      );

    case 'ISOLATOR':
      return (
        <g strokeLinecap="round" strokeLinejoin="round">
          <line x1="-8" y1="0" x2="8" y2="0" stroke="#0f172a" strokeWidth="1.15" />
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
        <g stroke="#06D6E8" strokeWidth="1.35" strokeLinecap="round">
          <line x1="-8" y1="0" x2="8" y2="0" />
          <circle cx="-5.6" cy="0" r="1.35" fill="#ffffff" strokeWidth="1.05" />
          <circle cx="-1.9" cy="0" r="1.35" fill="#ffffff" strokeWidth="1.05" />
          <circle cx="1.9" cy="0" r="1.35" fill="#ffffff" strokeWidth="1.05" />
          <circle cx="5.6" cy="0" r="1.35" fill="#ffffff" strokeWidth="1.05" />
        </g>
      );

    default:
      return null;
  }
}

/**
 * Komponen ikon vektor SVG crisp di dalam lingkaran putih berborder abu-abu tipis (untuk SVG peta)
 */
export function CategoryBeaconIcon({ category, cx = 0, cy = 0 }) {
  if (!category) return null;

  return (
    <g
      transform={`translate(${cx}, ${cy})`}
      style={{ filter: 'drop-shadow(0 1.5px 2.5px rgba(15, 23, 42, 0.28))' }}
    >
      <title>{category.label}</title>
      <circle cx="0" cy="0" r="9.5" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.15" />
      {renderCategorySymbol(category.key)}
    </g>
  );
}

/**
 * Komponen badge ikon SVG inline proporsional (untuk kartu DAFTAR SINGKAT PEKERJAAN & Callout Preview PDF)
 */
export function CategoryBadgeIcon({ category, size = 21, className = '' }) {
  if (!category) return null;

  return (
    <svg
      viewBox="-11 -11 22 22"
      width={size}
      height={size}
      className={`shrink-0 block ${className}`}
      role="img"
      aria-label={category.label}
    >
      <title>{category.label}</title>
      <circle cx="0" cy="0" r="9.8" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.25" />
      {renderCategorySymbol(category.key)}
    </svg>
  );
}
