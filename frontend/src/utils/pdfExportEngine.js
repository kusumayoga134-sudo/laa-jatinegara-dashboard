/**
 * PDF & High-Resolution Export Engine for Peta Wilayah LAA UPT Resor 1.9 Jatinegara
 * Native AutoCAD Model 2 Architecture: 3275 x 1835 px
 * (Direct 1:1 CAD Base Coordinates with 3 Internal Whitespace Zones: Top, Mid, Bottom)
 * Ultra HD (600 DPI CAD Precision), Zero External Dependencies.
 */

import {
  resolveLogTime,
  resolveLogKilometer,
  resolveLogDescription,
  hasRealDescription,
} from './workLogHelpers';

export const VIRTUAL_CANVAS = {
  CANVAS_W: 3275,
  CANVAS_H: 1835,
  MAP_W: 3275,
  MAP_H: 1835,
  LANE_TOP_H: 0,
  LANE_BOTTOM_H: 0,
  CAD_BASE_W: 3275,
  CAD_BASE_H: 1835,
  CARD_W: 136, // Compact CAD proportional width (128-142px)
  MIN_CARD_W: 128,
  CARD_H: 52, // Default fallback card height
  GAP: 8,
  MARGIN_X: 32,
};

// Helper to format timestamps in Indonesian
export function formatLogTimestamp(timestamp) {
  if (!timestamp) return { dateStr: '-', timeStr: '-' };
  const d = new Date(timestamp);
  if (isNaN(d.getTime())) return { dateStr: String(timestamp), timeStr: '' };

  const dateStr = d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const timeStr =
    d.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    }) + ' WIB';

  return { dateStr, timeStr };
}

/**
 * Extract structured 5-item work log details for callouts & PDF export:
 * 1) Waktu (BULAN TAHUN)
 * 2) Jenis Pekerjaan
 * 3) Lokasi
 * 4) Kilometer
 * 5) Uraian (hidden when "-")
 */
export function getCleanLogDetails(log, line = null) {
  const actionName = (log?.actionType || log?.title || 'Pemeliharaan LAA')
    .replace(/_/g, ' ')
    .trim();

  const { tahun, bulan, label: timeLabel } = resolveLogTime(log);
  const kilometer = resolveLogKilometer(log, line);
  const description = resolveLogDescription(log);
  const hasDescription = hasRealDescription(log);
  const lokasi = (log?.targetCode || line?.title || line?.code || 'Lintas LAA 1.9').trim();

  return {
    actionName,
    tahun,
    bulan,
    timeLabel,
    lokasi,
    kilometer,
    description,
    hasDescription,
  };
}

/**
 * Estimate wrapped line count for deterministic tight card height calculation
 * Synchronized 1:1 with Canvas word-wrapping and Preview CSS `whitespace-normal break-words` (no ellipsis)
 */
export function estimateWrappedLineCount(text, maxCharsPerLine = 28, maxLines = 4) {
  const clean = String(text || '').trim();
  if (!clean) return 0;

  const words = clean.split(/\s+/);
  let lines = 1;
  let curLen = 0;

  for (const word of words) {
    if (word.length > maxCharsPerLine) {
      if (curLen > 0) {
        lines += 1;
        curLen = 0;
      }
      const extraLines = Math.ceil(word.length / maxCharsPerLine) - 1;
      lines += extraLines;
      curLen = word.length % maxCharsPerLine || maxCharsPerLine;
    } else if (curLen === 0) {
      curLen = word.length;
    } else if (curLen + 1 + word.length <= maxCharsPerLine) {
      curLen += 1 + word.length;
    } else {
      lines += 1;
      curLen = word.length;
    }
  }

  return Math.min(maxLines, Math.max(1, lines));
}

/**
 * Compute per-log wrapped line counts & tight Compact CAD card height
 * Urutan 4 baris: Nama Pekerjaan -> Kilometer (biru) -> Uraian (opsional, bold gelap) -> Waktu (bold gelap)
 */
function computeCardMetrics(line, displayLogs, totalLogs) {
  const titleText = String(line?.title || line?.code || '').trim();
  const titleLines = estimateWrappedLineCount(titleText, 24, 4);
  const headerH = Math.ceil(5 + titleLines * 8.2);

  const PADDING_TOP = 3;
  const PADDING_BOT = 3.5;
  const ITEM_GAP = 4.5;
  const FOOTER_H = totalLogs > 3 ? 10 : 0;

  let bodyH = 0;
  const logLayouts = displayLogs.map((log, idx) => {
    const details = getCleanLogDetails(log, line);

    const lines1 = estimateWrappedLineCount(details.actionName, 28, 4);
    const linesKm = details.kilometer ? estimateWrappedLineCount(details.kilometer, 31, 4) : 0;
    const linesDesc = details.hasDescription ? estimateWrappedLineCount(details.description, 28, 4) : 0;
    const linesTime = details.timeLabel ? estimateWrappedLineCount(details.timeLabel, 28, 4) : 0;

    const h1 = lines1 * 7.6;
    const hKm = linesKm > 0 ? 1 + linesKm * 7.2 : 0;
    const hDesc = linesDesc > 0 ? 1 + linesDesc * 7.6 : 0;
    const hTime = linesTime > 0 ? 1 + linesTime * 7.6 : 0;
    const itemH = h1 + hKm + hDesc + hTime;

    bodyH += itemH + (idx > 0 ? ITEM_GAP : 0);

    return {
      ...details,
      lines1,
      linesKm,
      linesDesc,
      linesTime,
      itemH,
    };
  });

  const totalH = Math.ceil(headerH + PADDING_TOP + bodyH + FOOTER_H + PADDING_BOT);
  return { headerH, cardH: totalH, logLayouts };
}

/**
 * Multi-Row Staggered Shelves Collision-Resolution & Corridor Placement Engine for Callout Cards
 * Uses 3 Internal Whitespace Zones on the 3275 x 1835 Native AutoCAD Model 2 Canvas:
 * - Zona Atas (multi-row staggered above upper tracks, avoiding Legend & station labels)
 * - Zona Tengah (2–3 staggered tiers in Y = 922..1158 corridor between upper & lower tracks)
 * - Zona Bawah (multi-row staggered below lower tracks, Y >= 1536)
 */
export function computeCalloutLayout({
  linesWithLogs = [],
  customPositions = {},
}) {
  const {
    CANVAS_W,
    CANVAS_H,
    CARD_W,
    MIN_CARD_W,
    GAP,
    MARGIN_X,
  } = VIRTUAL_CANVAS;

  if (!linesWithLogs || linesWithLogs.length === 0) return [];

  const safeCardW = Math.max(MIN_CARD_W || 152, CARD_W || 162);

  // Directly map CAD base coords (3275 x 1835) 1:1
  const items = linesWithLogs.map(({ line, logs, center }) => {
    const rawX = center && center.x != null ? center.x : 1600;
    const rawY = center && center.y != null ? center.y : 900;

    const radarX = Math.round(rawX);
    const radarY = Math.round(rawY);

    const displayLogs = logs.slice(0, 3);
    const { headerH, cardH, logLayouts } = computeCardMetrics(line, displayLogs, logs.length);

    return {
      id: line.id,
      line,
      logs,
      displayLogs,
      logLayouts,
      radarX,
      radarY,
      rawX,
      rawY,
      w: safeCardW,
      h: cardH,
      headerH,
      x: 0,
      y: 0,
      isUpper: true,
      startX: 0,
      startY: 0,
      elbowY: 0,
    };
  });

  // Sort items by radarX ascending
  items.sort((a, b) => a.radarX - b.radarX);

  // CAD Static Obstacle Regions (Legend Model 4, Banner, Station Titles, Track Bands)
  const CAD_OBSTACLES = [
    // Model 4 Legend Top-Right Box (X=2990..3191, Y=215..415 with protective clearance)
    { x: 2945, y: 175, w: 325, h: 265 },
    // ST. JATINEGARA Station Header
    { x: 900, y: 382, w: 410, h: 86 },
    // Jatinegara Tracks Left/Center Band
    { x: 0, y: 468, w: 1645, h: 452 },
    // Klender & Buaran Titles + Upper Track Band
    { x: 1645, y: 715, w: 1630, h: 205 },
    // Lower Tracks + Station Titles (ST. BEKASI, ST. KRANJI, ST. CAKUNG, ST. KLENDER BARU)
    { x: 0, y: 1162, w: 3275, h: 368 },
  ];

  const overlapsRect = (ax, ay, aw, ah, b, padX = GAP, padY = 8) => (
    ax < b.x + b.w + padX &&
    ax + aw + padX > b.x &&
    ay < b.y + b.h + padY &&
    ay + ah + padY > b.y
  );

  // Collect all valid non-overlapping X intervals for a card at fixed `y`
  const findValidXAtY = (card, y, placedCards, obstacles) => {
    const minValidX = MARGIN_X;
    const maxValidX = CANVAS_W - MARGIN_X - card.w;
    if (maxValidX < minValidX) return MARGIN_X;

    const idealX = Math.max(minValidX, Math.min(maxValidX, Math.round(card.radarX - card.w / 2)));

    // Build forbidden X intervals [blockStart, blockEnd]
    const blocked = [];
    for (const obs of obstacles) {
      if (y < obs.y + obs.h + 6 && y + card.h + 6 > obs.y) {
        blocked.push([obs.x - card.w - 8, obs.x + obs.w + 8]);
      }
    }
    for (const other of placedCards) {
      if (y < other.y + other.h + 8 && y + card.h + 8 > other.y) {
        blocked.push([other.x - card.w - GAP, other.x + other.w + GAP]);
      }
    }

    blocked.sort((a, b) => a[0] - b[0]);

    // Subtract blocked intervals from [minValidX, maxValidX]
    let freeIntervals = [[minValidX, maxValidX]];
    for (const [bStart, bEnd] of blocked) {
      const next = [];
      for (const [fStart, fEnd] of freeIntervals) {
        if (bEnd <= fStart || bStart >= fEnd) {
          next.push([fStart, fEnd]);
        } else {
          if (bStart > fStart) next.push([fStart, bStart]);
          if (bEnd < fEnd) next.push([bEnd, fEnd]);
        }
      }
      freeIntervals = next;
    }

    if (freeIntervals.length === 0) return null;

    let bestX = null;
    let bestDist = Infinity;
    for (const [start, end] of freeIntervals) {
      if (start > end) continue;
      const cand = Math.max(start, Math.min(end, idealX));
      const dist = Math.abs(cand - idealX);
      if (dist < bestDist) {
        bestDist = dist;
        bestX = Math.round(cand);
      }
    }
    return bestX;
  };

  /**
   * Place a group of cards across preferred Y shelves with minimum horizontal displacement
   */
  const placeOnStaggeredShelves = (cards, getCandidateYs, placedCards, maxPreferredShift = 130) => {
    cards.forEach((card) => {
      const candidateYs = getCandidateYs(card);
      let chosen = null;

      // Pass 1: Pick the first candidate shelf that keeps horizontal shift small
      for (const y of candidateYs) {
        const clampedY = Math.max(180, Math.min(CANVAS_H - card.h - 20, Math.round(y)));
        const validX = findValidXAtY(card, clampedY, placedCards, CAD_OBSTACLES);
        if (validX !== null) {
          const idealX = Math.max(MARGIN_X, Math.min(CANVAS_W - MARGIN_X - card.w, Math.round(card.radarX - card.w / 2)));
          const shift = Math.abs(validX - idealX);
          if (!chosen || shift < chosen.shift) {
            chosen = { x: validX, y: clampedY, shift };
          }
          if (shift <= maxPreferredShift) {
            break;
          }
        }
      }

      // Fallback (should rarely happen): scan Zona Y range without obstacle crash
      if (!chosen) {
        for (let scanY = 185; scanY <= CANVAS_H - card.h - 25; scanY += 20) {
          const validX = findValidXAtY(card, scanY, placedCards, CAD_OBSTACLES);
          if (validX !== null) {
            chosen = { x: validX, y: scanY, shift: 0 };
            break;
          }
        }
      }

      if (chosen) {
        card.x = chosen.x;
        card.y = chosen.y;
      } else {
        card.x = Math.max(MARGIN_X, Math.min(CANVAS_W - MARGIN_X - card.w, Math.round(card.radarX - card.w / 2)));
        card.y = Math.max(185, Math.min(CANVAS_H - card.h - 25, Math.round(candidateYs[0] || 200)));
      }

      placedCards.push(card);
    });
  };

  // Partition into Zones matching CAD geometry
  const topLeftCards = [];
  const topRightCards = [];
  const midUpperCards = [];
  const midLowerCards = [];
  const bottomCards = [];

  items.forEach((item) => {
    if (item.radarY <= 835) {
      // Zona Atas: St. Jatinegara & Klender/Buaran HILIR (arrows point DOWN)
      item.isUpper = true;
      if (item.radarX < 1645) {
        topLeftCards.push(item);
      } else {
        topRightCards.push(item);
      }
    } else if (item.radarY > 1320) {
      // Zona Bawah: Bekasi/Kranji/Cakung Southern Tracks (arrows point UP)
      item.isUpper = false;
      bottomCards.push(item);
    } else if (item.radarY <= 1050) {
      // Zona Tengah (Baris Atas): Klender/Buaran HULU & Emplasemen Selatan (arrows point UP)
      item.isUpper = false;
      midUpperCards.push(item);
    } else {
      // Zona Tengah (Baris Bawah): St. Bekasi/Kranji/Cakung Northern Tracks (arrows point DOWN)
      item.isUpper = true;
      midLowerCards.push(item);
    }
  });

  const placedCards = [];

  // 1. Zona Atas Left (St. Jatinegara): shelves above Y=382 (184, 248, 310)
  placeOnStaggeredShelves(
    topLeftCards,
    (card) => [315 - Math.min(20, Math.max(0, card.h - 48)), 250, 186],
    placedCards,
    95
  );

  // 2. Zona Atas Right (Klender/Buaran HILIR): large blank space Y=185..705 -> staggered bottom-up from track label
  placeOnStaggeredShelves(
    topRightCards,
    (card) => [
      705 - card.h, // Closest clean tier above ST. KLENDER / ST. BUARAN (Y ~ 715)
      635 - Math.round(card.h * 0.5),
      560,
      485,
      410,
      335,
      260,
      186,
    ],
    placedCards,
    95
  );

  // 3. Zona Tengah Upper (points at Y ~ 850..900 -> arrows point UP): staggered shelves from Y=924 downwards
  placeOnStaggeredShelves(
    midUpperCards,
    (card) => [924, 996, 1068, 958, 1030],
    placedCards,
    105
  );

  // 4. Zona Tengah Lower (points at Y ~ 1190..1310 -> arrows point DOWN): staggered shelves from bottom Y=1158 upwards
  placeOnStaggeredShelves(
    midLowerCards,
    (card) => [1156 - card.h, 1084 - Math.round(card.h * 0.4), 1014, 944, 924],
    placedCards,
    105
  );

  // 5. Zona Bawah (points at Y > 1320 -> arrows point UP): compact staggered shelves starting at Y = 1536
  placeOnStaggeredShelves(
    bottomCards,
    (card) => [1536, 1614, 1692, 1770],
    placedCards,
    105
  );

  const allCards = placedCards;

  // Apply User Manual Drag-and-Drop Overrides (if any)
  allCards.forEach((card) => {
    const custom = customPositions[card.id];
    if (custom && typeof custom.x === 'number' && typeof custom.y === 'number') {
      card.x = Math.max(0, Math.min(CANVAS_W - card.w, Math.round(custom.x)));
      card.y = Math.max(0, Math.min(CANVAS_H - card.h, Math.round(custom.y)));
      card.isManual = true;
      card.isUpper = card.y + card.h / 2 <= card.radarY;
    }
  });

  // Sort cleanly by radarX again for deterministic elbow staggering
  allCards.sort((a, b) => a.radarX - b.radarX);

  // Calculate Orthogonal Elbow Anchor Points and Staggered Belokan
  allCards.forEach((card, idx) => {
    card.startX = Math.round(card.x + card.w / 2);
    const stagger = ((idx % 3) - 1) * 10;

    if (card.isUpper) {
      card.startY = card.y + card.h;
      const midY = card.startY + (card.radarY - card.startY) * 0.45 + stagger;
      card.elbowY = Math.round(Math.max(card.startY + 6, Math.min(card.radarY - 12, midY)));
    } else {
      card.startY = card.y;
      const midY = card.startY - (card.startY - card.radarY) * 0.45 + stagger;
      card.elbowY = Math.round(Math.min(card.startY - 6, Math.max(card.radarY + 12, midY)));
    }
  });

  return allCards;
}

/**
 * Generate smooth SVG path string for orthogonal (elbow) leader line
 * on the 2400 x 1480 Virtual Canvas
 */
export function getElbowSvgPath(card) {
  const { startX, startY, elbowY, radarX, radarY, isUpper } = card;
  const beaconRadius = 8;
  const arrowEndY = isUpper ? radarY - beaconRadius : radarY + beaconRadius;
  const r = Math.min(6, Math.abs(radarX - startX) / 2);

  const dirX = radarX >= startX ? 1 : -1;
  const dirY1 = elbowY >= startY ? 1 : -1;
  const dirY2 = arrowEndY >= elbowY ? 1 : -1;

  if (Math.abs(radarX - startX) <= 4) {
    return `M ${startX} ${startY} L ${radarX} ${arrowEndY}`;
  }

  return [
    `M ${startX} ${startY}`,
    `L ${startX} ${elbowY - dirY1 * r}`,
    `Q ${startX} ${elbowY} ${startX + dirX * r} ${elbowY}`,
    `L ${radarX - dirX * r} ${elbowY}`,
    `Q ${radarX} ${elbowY} ${radarX} ${elbowY + dirY2 * r}`,
    `L ${radarX} ${arrowEndY}`,
  ].join(' ');
}

/**
 * Helper to draw rounded rectangle on HTML Canvas
 */
function roundRect(ctx, x, y, w, h, r) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * Truncate text cleanly with ellipsis if exceeding max width
 */
function truncateText(ctx, text, maxWidth) {
  if (!text) return '';
  if (ctx.measureText(text).width <= maxWidth) return text;
  let str = text;
  while (str.length > 0 && ctx.measureText(str + '...').width > maxWidth) {
    str = str.slice(0, -1);
  }
  return str + '...';
}

/**
 * Wrap text into at most `maxLines` lines matching Preview word-wrap & line-clamp-2
 */
function wrapCanvasText(ctx, text, maxWidth, maxLines = 2) {
  const clean = String(text || '').trim();
  if (!clean) return [];

  const words = clean.split(/\s+/);
  const lines = [];
  let currentLine = '';

  const pushWrappedWord = (word) => {
    let remaining = word;
    while (remaining.length > 0 && lines.length < maxLines) {
      let fit = remaining;
      while (fit.length > 1 && ctx.measureText(fit).width > maxWidth) {
        fit = fit.slice(0, -1);
      }
      if (fit.length === remaining.length) {
        currentLine = fit;
        remaining = '';
      } else {
        lines.push(fit);
        remaining = remaining.slice(fit.length);
      }
    }
  };

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine ? `${currentLine} ${word}` : word;

    if (ctx.measureText(testLine).width <= maxWidth) {
      currentLine = testLine;
    } else if (!currentLine) {
      pushWrappedWord(word);
    } else {
      lines.push(currentLine);
      currentLine = '';
      if (lines.length >= maxLines) {
        break;
      }
      if (ctx.measureText(word).width <= maxWidth) {
        currentLine = word;
      } else {
        pushWrappedWord(word);
      }
    }

    if (lines.length >= maxLines) {
      break;
    }
  }

  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine);
  }

  return lines.slice(0, maxLines);
}

/**
 * Render Orthogonal Elbow Leader Line on Canvas (at given scale)
 */
function drawOrthogonalElbow(ctx, card, scale) {
  const startX = card.startX * scale;
  const startY = card.startY * scale;
  const elbowY = card.elbowY * scale;
  const targetX = card.radarX * scale;
  const targetY = card.radarY * scale;
  const isUpper = card.isUpper;

  const beaconRadius = 8 * scale;
  const arrowEndY = isUpper ? targetY - beaconRadius : targetY + beaconRadius;
  const r = Math.min(6 * scale, Math.abs(targetX - startX) / 2);

  const dirX = targetX >= startX ? 1 : -1;
  const dirY1 = elbowY >= startY ? 1 : -1;
  const dirY2 = arrowEndY >= elbowY ? 1 : -1;

  const constructPath = (context) => {
    context.beginPath();
    context.moveTo(startX, startY);

    if (Math.abs(targetX - startX) > 4 * scale) {
      context.lineTo(startX, elbowY - dirY1 * r);
      context.quadraticCurveTo(startX, elbowY, startX + dirX * r, elbowY);

      context.lineTo(targetX - dirX * r, elbowY);
      context.quadraticCurveTo(targetX, elbowY, targetX, elbowY + dirY2 * r);
    }

    context.lineTo(targetX, arrowEndY);
  };

  ctx.save();

  // Pass 1: Thin Outer White Halo outline (protective contour)
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2.8 * scale;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  constructPath(ctx);
  ctx.stroke();

  // Pass 2: Slim Red Leader Line (CAD technical leader line: ~46% thinner)
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 1.35 * scale;
  constructPath(ctx);
  ctx.stroke();

  // Architectural Arrowhead (~40% smaller and proportional)
  const headLen = 5.5 * scale;
  const headW = 3.3 * scale;
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  if (isUpper) {
    ctx.moveTo(targetX, arrowEndY);
    ctx.lineTo(targetX - headW, arrowEndY - headLen);
    ctx.lineTo(targetX, arrowEndY - headLen * 0.75);
    ctx.lineTo(targetX + headW, arrowEndY - headLen);
  } else {
    ctx.moveTo(targetX, arrowEndY);
    ctx.lineTo(targetX - headW, arrowEndY + headLen);
    ctx.lineTo(targetX, arrowEndY + headLen * 0.75);
    ctx.lineTo(targetX + headW, arrowEndY + headLen);
  }
  ctx.closePath();
  ctx.fill();

  // Card Base Anchor Pin
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.arc(startX, startY, 2.2 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(startX, startY, 1.0 * scale, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Render Callout Box on Canvas (at given scale)
 * Structured Format: Jenis Pekerjaan, BULAN TAHUN • KILOMETER, Uraian (jika != "-")
 */
function drawCalloutBox(ctx, card, scale) {
  const cardX = card.x * scale;
  const cardY = card.y * scale;
  const cardW = card.w * scale;
  const cardH = card.h * scale;
  const { line, logs, displayLogs } = card;

  ctx.save();

  const cardRadius = 4 * scale;
  const trackColor = line.color || '#334155';
  const headerHeight = (card.headerH || 14) * scale;

  // 1. Drop Shadow
  ctx.save();
  ctx.shadowColor = 'rgba(15, 23, 42, 0.12)';
  ctx.shadowBlur = 5 * scale;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 2 * scale;
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, cardX, cardY, cardW, cardH, cardRadius);
  ctx.fill();
  ctx.restore();

  // 2. Inner Layer clipped to card bounds
  ctx.save();
  roundRect(ctx, cardX, cardY, cardW, cardH, cardRadius);
  ctx.clip();

  // Card Base Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(cardX, cardY, cardW, cardH);

  // Left Accent Strip in Track color (Compact CAD 2.5px)
  ctx.fillStyle = trackColor;
  ctx.fillRect(cardX, cardY, 2.5 * scale, cardH);

  // Header Background Banner
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(cardX + 2.5 * scale, cardY, cardW - 2.5 * scale, headerHeight);

  // Header Divider Line
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 0.8 * scale;
  ctx.beginPath();
  ctx.moveTo(cardX + 2.5 * scale, cardY + headerHeight);
  ctx.lineTo(cardX + cardW, cardY + headerHeight);
  ctx.stroke();

  ctx.restore();

  // 3. Outer Border Frame
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 0.8 * scale;
  roundRect(ctx, cardX, cardY, cardW, cardH, cardRadius);
  ctx.stroke();

  // ==========================================
  // Header Information Compact CAD (Dot + Nama Lokasi utuh tanpa elipsis, tanpa badge Pkj)
  // ==========================================
  const headerDotX = cardX + 9.5 * scale;
  const headerDotY = cardY + headerHeight / 2;

  // Track color circle (5px diameter)
  ctx.fillStyle = trackColor;
  ctx.beginPath();
  ctx.arc(headerDotX, headerDotY, 2.5 * scale, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(headerDotX, headerDotY, 0.9 * scale, 0, Math.PI * 2);
  ctx.fill();

  // Track Title (Compact CAD 6.8px bold, wrapped cleanly without ellipsis)
  ctx.fillStyle = '#0f172a';
  ctx.font = `bold ${6.8 * scale}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const maxTitleW = cardW - 21 * scale;
  const wrappedTitle = wrapCanvasText(ctx, line.title || line.code, maxTitleW, 4);
  const titleLineH = 8.2 * scale;
  const totalTitleH = wrappedTitle.length * titleLineH;
  const firstTitleY = cardY + (headerHeight - totalTitleH) / 2 + titleLineH / 2;
  wrappedTitle.forEach((txtLine, idx) => {
    ctx.fillText(txtLine, cardX + 15.5 * scale, firstTitleY + idx * titleLineH);
  });

  // ==========================================
  // Work Log Items (Compact CAD tight packing, zero ellipsis)
  // ==========================================
  let currentLogY = cardY + headerHeight + 3 * scale;
  const itemContentX = cardX + 7 * scale;
  const itemContentW = cardW - 12 * scale;

  displayLogs.forEach((log, logIdx) => {
    if (logIdx > 0) {
      currentLogY += 2 * scale;
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 0.7 * scale;
      ctx.beginPath();
      ctx.moveTo(cardX + 7 * scale, currentLogY);
      ctx.lineTo(cardX + cardW - 5 * scale, currentLogY);
      ctx.stroke();
      currentLogY += 2.5 * scale;
    }

    const { actionName, timeLabel, kilometer, description, hasDescription } = getCleanLogDetails(log, line);

    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    // Baris 1: Nama Pekerjaan (Acuan utama: 6.4px bold, Slate-900, lineHeight 7.6px)
    ctx.fillStyle = '#0f172a';
    ctx.font = `bold ${6.4 * scale}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    const wrappedAction = wrapCanvasText(ctx, actionName, itemContentW, 4);
    wrappedAction.forEach((txtLine) => {
      ctx.fillText(txtLine, itemContentX, currentLogY + 3.8 * scale);
      currentLogY += 7.6 * scale;
    });

    // Baris 2: Lokasi Pekerjaan / Kilometer (Warna biru #2563eb, tanpa bullet, 6.0px bold, lineHeight 7.2px)
    if (kilometer) {
      currentLogY += 1 * scale;
      ctx.fillStyle = '#2563eb';
      ctx.font = `bold ${6.0 * scale}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      const wrappedKm = wrapCanvasText(ctx, kilometer, itemContentW, 4);
      wrappedKm.forEach((txtLine) => {
        ctx.fillText(txtLine, itemContentX, currentLogY + 3.6 * scale);
        currentLogY += 7.2 * scale;
      });
    }

    // Baris 3 (jika Uraian != '-'): Uraian (Merah cerah #dc2626, font/ukuran/bold sama dengan Nama Pekerjaan)
    if (hasDescription) {
      currentLogY += 1 * scale;
      ctx.fillStyle = '#dc2626';
      ctx.font = `bold ${6.4 * scale}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      const wrappedDesc = wrapCanvasText(ctx, description, itemContentW, 4);
      wrappedDesc.forEach((txtLine) => {
        ctx.fillText(txtLine, itemContentX, currentLogY + 3.8 * scale);
        currentLogY += 7.6 * scale;
      });
    }

    // Baris 4: Waktu Pekerjaan (100% sama dengan Nama Pekerjaan: 6.4px bold, Slate-900)
    if (timeLabel) {
      currentLogY += 1 * scale;
      ctx.fillStyle = '#0f172a';
      ctx.font = `bold ${6.4 * scale}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      const wrappedTime = wrapCanvasText(ctx, timeLabel, itemContentW, 4);
      wrappedTime.forEach((txtLine) => {
        ctx.fillText(txtLine, itemContentX, currentLogY + 3.8 * scale);
        currentLogY += 7.6 * scale;
      });
    }
  });

  // Footer: +N pekerjaan lainnya (if logs > 3)
  if (logs.length > 3) {
    currentLogY += 2 * scale;
    const footerY = currentLogY + 3.5 * scale;
    ctx.fillStyle = '#94a3b8';
    ctx.font = `italic 600 ${5.5 * scale}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`+ ${logs.length - 3} pekerjaan lainnya`, cardX + cardW / 2, footerY);
  }

  ctx.restore();
}

/**
 * Smart canvas scale guard for iOS Safari / iPadOS (max ~4096px / 16.7M px canvas memory limit)
 */
export function resolveSafeExportScale(requestedScale = 3.0) {
  if (typeof navigator === 'undefined') return requestedScale;
  const ua = navigator.userAgent || '';
  const isIOS = /iP(ad|hone|od)/i.test(ua) || (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1);
  if (!isIOS) return requestedScale;
  // 3275 * 1.25 = 4093 px, 1835 * 1.25 = 2293 px (~9.38M px < 16.7M iOS Safari limit)
  return Math.min(requestedScale, 1.25);
}

/**
 * Generate Ultra HD Canvas from CAD base map + radar dots + callout cards
 * Uses Native AutoCAD Model 4 Canvas (3275 x 1835 px) scaled by `scale` (e.g. 3.0 = 9825 x 5505 px)
 */
export async function renderUltraHdCanvas({
  linesWithLogs = [],
  showCallouts = true,
  showRadar = true,
  scale = 3.0, // 3.0 scale gives 9825 x 5505 px (True Ultra HD 600 DPI)
  customCardPositions = {},
}) {
  const { CANVAS_W, CANVAS_H } = VIRTUAL_CANVAS;
  const safeScale = resolveSafeExportScale(scale);

  const totalWidth = Math.round(CANVAS_W * safeScale);
  const totalHeight = Math.round(CANVAS_H * safeScale);

  const canvas = document.createElement('canvas');
  canvas.width = totalWidth;
  canvas.height = totalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get 2D canvas context');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // 1. White paper background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, totalWidth, totalHeight);

  // Load Model 4 Ultra-HD Lossless CAD Background image (9825 x 5505 px, cache-buster ?v=model4)
  const img = new Image();
  img.crossOrigin = 'anonymous';
  await new Promise((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Failed to load base CAD map image'));
    img.src = '/peta-laa-model4-hd.png?v=model4';
  });

  // Draw CAD map precisely in full canvas
  ctx.drawImage(img, 0, 0, totalWidth, totalHeight);

  // Outer blueprint border
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2 * safeScale;
  ctx.strokeRect(0, 0, totalWidth, totalHeight);

  // Calculate layout of callout cards
  const preparedCards = computeCalloutLayout({
    linesWithLogs,
    customPositions: customCardPositions,
  });

  // 2. Draw Radar Glow Beacons (clean point beacons, without covering CAD track lines)
  if (showRadar) {
    preparedCards.forEach((card) => {
      const cx = card.radarX * safeScale;
      const cy = card.radarY * safeScale;
      const count = card.logs.length;

      ctx.save();
      const grad = ctx.createRadialGradient(cx, cy, 2 * safeScale, cx, cy, 22 * safeScale);
      grad.addColorStop(0, 'rgba(239, 68, 68, 0.95)');
      grad.addColorStop(0.4, 'rgba(239, 68, 68, 0.45)');
      grad.addColorStop(0.8, 'rgba(239, 68, 68, 0.15)');
      grad.addColorStop(1, 'rgba(239, 68, 68, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, 22 * safeScale, 0, Math.PI * 2);
      ctx.fill();

      // Ripple Rings
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
      ctx.lineWidth = 1.6 * safeScale;
      ctx.beginPath();
      ctx.arc(cx, cy, 11 * safeScale, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(239, 68, 68, 0.55)';
      ctx.lineWidth = 1.2 * safeScale;
      ctx.beginPath();
      ctx.arc(cx, cy, 16 * safeScale, 0, Math.PI * 2);
      ctx.stroke();

      // Center Core
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(cx, cy, 5.5 * safeScale, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx, cy, 2.2 * safeScale, 0, Math.PI * 2);
      ctx.fill();

      // Number of Jobs Badge
      if (count > 1) {
        const badgeX = cx + 9 * safeScale;
        const badgeY = cy - 9 * safeScale;
        const badgeR = 6 * safeScale;

        ctx.fillStyle = '#b91c1c';
        ctx.beginPath();
        ctx.arc(badgeX, badgeY, badgeR, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1 * safeScale;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${7 * safeScale}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(count), badgeX, badgeY);
      }
      ctx.restore();
    });
  }

  // 4. Draw Orthogonal Elbow Leader Lines and Callout Boxes
  if (showCallouts && preparedCards.length > 0) {
    // Step 4A: Render ALL Leader Lines FIRST
    preparedCards.forEach((card) => {
      drawOrthogonalElbow(ctx, card, safeScale);
    });

    // Step 4B: Render ALL Callout Boxes ON TOP
    preparedCards.forEach((card) => {
      drawCalloutBox(ctx, card, safeScale);
    });
  }

  return canvas;
}

/**
 * Assemble a valid PDF 1.4 binary document wrapping an image XObject buffer
 */
function assembleSingleImagePdf(imageDictHeader, streamBuffer, pageWidthPt, pageHeightPt) {
  const obj1 = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';
  const obj2 = '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n';
  const obj3 = `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidthPt.toFixed(2)} ${pageHeightPt.toFixed(2)}] /Resources << /XObject << /Im1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`;

  const imgHeader = `4 0 obj\n${imageDictHeader}\nstream\n`;
  const imgFooter = '\nendstream\nendobj\n';

  const contentStream = `q\n${pageWidthPt.toFixed(2)} 0 0 ${pageHeightPt.toFixed(2)} 0 0 cm\n/Im1 Do\nQ\n`;
  const obj5 = `5 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}endstream\nendobj\n`;

  const header = '%PDF-1.4\n';

  const offsets = [];
  let currentOffset = header.length;

  offsets.push(currentOffset);
  currentOffset += obj1.length;

  offsets.push(currentOffset);
  currentOffset += obj2.length;

  offsets.push(currentOffset);
  currentOffset += obj3.length;

  offsets.push(currentOffset);
  currentOffset += imgHeader.length + streamBuffer.length + imgFooter.length;

  offsets.push(currentOffset);
  currentOffset += obj5.length;

  const xrefOffset = currentOffset;
  let xref = `xref\n0 6\n0000000000 65535 f \n`;
  for (let i = 0; i < offsets.length; i++) {
    xref += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
  }

  const trailer = `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  const totalLength =
    header.length +
    obj1.length +
    obj2.length +
    obj3.length +
    imgHeader.length +
    streamBuffer.length +
    imgFooter.length +
    obj5.length +
    xref.length +
    trailer.length;

  const uint8 = new Uint8Array(totalLength);
  let pos = 0;

  const writeStr = (str) => {
    for (let i = 0; i < str.length; i++) {
      uint8[pos++] = str.charCodeAt(i) & 0xff;
    }
  };

  writeStr(header);
  writeStr(obj1);
  writeStr(obj2);
  writeStr(obj3);
  writeStr(imgHeader);
  uint8.set(streamBuffer, pos);
  pos += streamBuffer.length;
  writeStr(imgFooter);
  writeStr(obj5);
  writeStr(xref);
  writeStr(trailer);

  return uint8;
}

/**
 * Pure JavaScript Lossless PDF 1.4 Binary Generator (FlateDecode + PNG Sub Predictor /Predictor 11)
 * Keeps crisp 1px CAD lines & tiny callout text 100% lossless (NO JPEG artifacts) with streaming low-RAM memory usage.
 */
export async function buildPdfFromLosslessCanvas(canvas, pageWidthPt, pageHeightPt) {
  const widthPx = canvas.width;
  const heightPx = canvas.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  const cs = new CompressionStream('deflate');
  const writer = cs.writable.getWriter();
  const compressedPromise = new Response(cs.readable).arrayBuffer();

  const BAND_ROWS = 128;
  const rowRgbBytes = widthPx * 3;
  const rowStride = rowRgbBytes + 1;

  for (let startY = 0; startY < heightPx; startY += BAND_ROWS) {
    const bandH = Math.min(BAND_ROWS, heightPx - startY);
    const imgData = ctx.getImageData(0, startY, widthPx, bandH).data;
    const outBand = new Uint8Array(rowStride * bandH);

    for (let y = 0; y < bandH; y++) {
      const srcRowStart = y * widthPx * 4;
      const dstRowStart = y * rowStride;
      outBand[dstRowStart] = 1; // PNG Sub filter (type 1)

      // Pixel 0 (no left neighbor)
      outBand[dstRowStart + 1] = imgData[srcRowStart];
      outBand[dstRowStart + 2] = imgData[srcRowStart + 1];
      outBand[dstRowStart + 3] = imgData[srcRowStart + 2];

      for (let x = 1; x < widthPx; x++) {
        const s = srcRowStart + x * 4;
        const d = dstRowStart + 1 + x * 3;
        outBand[d] = (imgData[s] - imgData[s - 4]) & 0xff;
        outBand[d + 1] = (imgData[s + 1] - imgData[s - 3]) & 0xff;
        outBand[d + 2] = (imgData[s + 2] - imgData[s - 2]) & 0xff;
      }
    }

    await writer.write(outBand);
  }

  await writer.close();
  const compressedBuffer = new Uint8Array(await compressedPromise);

  const imgDict = `<< /Type /XObject /Subtype /Image /Width ${widthPx} /Height ${heightPx} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode /DecodeParms << /Predictor 11 /Colors 3 /BitsPerComponent 8 /Columns ${widthPx} >> /Length ${compressedBuffer.length} >>`;
  return assembleSingleImagePdf(imgDict, compressedBuffer, pageWidthPt, pageHeightPt);
}

/**
 * Fallback JPEG PDF 1.4 Binary Generator (used only if CompressionStream is unavailable)
 */
export function buildPdfFromJpegBuffer(jpegBuffer, widthPx, heightPx, pageWidthPt, pageHeightPt) {
  const imgDict = `<< /Type /XObject /Subtype /Image /Width ${widthPx} /Height ${heightPx} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBuffer.length} >>`;
  return assembleSingleImagePdf(imgDict, jpegBuffer, pageWidthPt, pageHeightPt);
}

/**
 * 1-Click Direct Download PDF File (Lossless FlateDecode 600 DPI)
 */
export async function downloadMapPdf({
  linesWithLogs = [],
  showCallouts = true,
  showRadar = true,
  paperSize = 'NATIVE', // 'NATIVE' (Default CAD 3275:1835) | 'A3' | 'A4'
  quality = 0.98,
  customCardPositions = {},
}) {
  const canvas = await renderUltraHdCanvas({
    linesWithLogs,
    showCallouts,
    showRadar,
    scale: 3.0, // 3.0 gives 9825 x 5505 px on Desktop (auto-clamped safely on iOS)
    customCardPositions,
  });

  let pageWPt = 1200;
  let pageHPt = (1200 * canvas.height) / canvas.width;

  if (paperSize === 'A4') {
    pageWPt = 841.89;
    pageHPt = 595.28;
  } else if (paperSize === 'A3') {
    pageWPt = 1190.55;
    pageHPt = 841.89;
  }

  let pdfBytes;
  if (typeof CompressionStream !== 'undefined') {
    pdfBytes = await buildPdfFromLosslessCanvas(canvas, pageWPt, pageHPt);
  } else {
    const jpegBlob = await new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', quality);
    });
    if (!jpegBlob) throw new Error('Failed to generate JPEG blob from canvas');
    const jpegBuffer = new Uint8Array(await jpegBlob.arrayBuffer());
    pdfBytes = buildPdfFromJpegBuffer(jpegBuffer, canvas.width, canvas.height, pageWPt, pageHPt);
  }

  const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const filename = `PETA_LAA_UPT_1.9_JATINEGARA_600DPI_${dateStr}.pdf`;

  triggerDownload(pdfBlob, filename);
  return filename;
}

/**
 * 1-Click Direct Download Ultra HD PNG (600 DPI Lossless PNG)
 */
export async function downloadMapPng({
  linesWithLogs = [],
  showCallouts = true,
  showRadar = true,
  customCardPositions = {},
}) {
  const canvas = await renderUltraHdCanvas({
    linesWithLogs,
    showCallouts,
    showRadar,
    scale: 3.0, // 9825 x 5505 px Ultra HD on Desktop (auto-clamped safely on iOS)
    customCardPositions,
  });

  const pngBlob = await new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png');
  });
  if (!pngBlob) throw new Error('Failed to generate PNG blob');

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const filename = `PETA_LAA_UPT_1.9_JATINEGARA_600DPI_${dateStr}.png`;

  triggerDownload(pngBlob, filename);
  return filename;
}

/**
 * Native Browser Print to PDF (Opens print dialog with Lossless PNG Ultra HD resolution)
 */
export async function printMapWindow({
  linesWithLogs = [],
  showCallouts = true,
  showRadar = true,
  customCardPositions = {},
}) {
  const canvas = await renderUltraHdCanvas({
    linesWithLogs,
    showCallouts,
    showRadar,
    scale: 3.0,
    customCardPositions,
  });

  const pngBlob = await new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png');
  });
  if (!pngBlob) throw new Error('Failed to generate lossless PNG for printing');
  const blobUrl = URL.createObjectURL(pngBlob);

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    URL.revokeObjectURL(blobUrl);
    alert('Popup diblokir oleh browser. Harap izinkan popup untuk mencetak PDF.');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Cetak Peta Wilayah UPT Resor LAA 1.9 Jatinegara (600 DPI)</title>
        <style>
          @page {
            size: landscape;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #ffffff;
          }
          img {
            width: 100vw;
            height: auto;
            max-height: 100vh;
            object-fit: contain;
            display: block;
          }
        </style>
      </head>
      <body>
        <img src="${blobUrl}" onload="window.print();setTimeout(()=>{window.close();},500);" />
      </body>
    </html>
  `);
  printWindow.document.close();
}

/**
 * Helper to trigger file download via browser <a> element
 */
function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 300);
}
