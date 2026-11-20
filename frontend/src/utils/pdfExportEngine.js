/**
 * PDF & High-Resolution Export Engine for Peta Wilayah LAA UPT Resor 1.9 Jatinegara
 * Pure Client-Side, Ultra HD (600 DPI / CAD Precision), Zero External Dependencies.
 */

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
 * Geometric helper: Detect intersection between two 2D line segments
 */
function lineIntersectsLine(x1, y1, x2, y2, x3, y3, x4, y4) {
  const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
  if (denom === 0) return false;
  const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
  const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;
  return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
}

/**
 * Protected CAD Drawing Zones
 * Callout boxes MUST NEVER cover these areas:
 * - Native CAD Header Banner (Danantara & KAI logos, Document title)
 * - Native CAD Legend Table (Top Right)
 * - Station Titles (Exact CAD text positions: Jatinegara, Klender, Buaran, Cakung, Kranji, Bekasi, etc.)
 * - Track Corridors & Printed Naspan Rows
 * - Bottom Border Frame
 */
export const PROTECTED_CAD_ZONES = [
  // 1. Native CAD Header Banner (Danantara & KAI logos, Document title)
  { name: 'CAD Header Banner', x1: 0, y1: 0, x2: 3275, y2: 165 },
  // 2. Native CAD Legend Table (Top Right)
  { name: 'CAD Legend Table', x1: 2870, y1: 160, x2: 3255, y2: 475 },
  // 3. Station Titles (Exact CAD text positions)
  { name: 'ST. JATINEGARA', x1: 980, y1: 160, x2: 1520, y2: 340 },
  { name: 'ST. PONDOK JATI', x1: 150, y1: 450, x2: 420, y2: 540 },
  { name: 'ST. KLENDER', x1: 1980, y1: 450, x2: 2360, y2: 530 },
  { name: 'ST. BUARAN', x1: 2520, y1: 450, x2: 2870, y2: 530 },
  { name: 'ST. CAKUNG', x1: 2380, y1: 670, x2: 2750, y2: 760 },
  { name: 'ST. KRANJI', x1: 1780, y1: 670, x2: 2150, y2: 760 },
  { name: 'ST. BEKASI', x1: 1100, y1: 670, x2: 1480, y2: 760 },
  { name: 'ST. KLENDER BARU', x1: 2700, y1: 1160, x2: 3020, y2: 1245 },
  // 4. Track Corridors & Printed Naspan Rows
  { name: 'Upper Tracks & Naspans', x1: 1350, y1: 635, x2: 3180, y2: 835 },
  { name: 'Cakung Emplasemen & DS', x1: 2280, y1: 1045, x2: 2950, y2: 1250 },
  { name: 'Lower Tracks & Naspans', x1: 1580, y1: 1045, x2: 2280, y2: 1245 },
  { name: 'Bekasi Emplasemen', x1: 980, y1: 960, x2: 1560, y2: 1230 },
  // 5. Bottom CAD Border Frame & Bekasi Timur corner
  { name: 'BEKASI_TIMUR', x1: 200, y1: 1220, x2: 520, y2: 1310 },
  { name: 'Bottom Border Frame', x1: 0, y1: 1385, x2: 3275, y2: 1419 },
];

/**
 * 1D Deterministic Collision-Resolution & Corridor Placement Engine for Callout Cards
 * Guarantees ZERO overlap on tracks, ZERO overlap on station names (e.g. ST. JATINEGARA),
 * and generates smooth orthogonal (elbow) leader lines with staggered Y-offsets.
 */
export function computeCalloutLayout({
  linesWithLogs = [],
  customPositions = {},
  baseWidth = 3275,
  baseHeight = 1419,
  mapYOffset = 0,
  scale = 1.0,
  expandCanvasForManyLogs = false,
}) {
  const cardW = 180 * scale;
  const headerHeight = 22 * scale;
  const logItemHeight = 24 * scale;
  const gapX = 18 * scale;
  const minX = 35 * scale;
  const maxX = baseWidth * scale - cardW - 35 * scale;

  // Forbidden zones for Upper Lane inside CAD coordinates (multiplied by scale)
  // ST. JATINEGARA Zone: X = 980 to 1520 (Text at 180..240, tracks up to 320)
  const forbiddenZonesUpper = [
    { minX: 980 * scale, maxX: 1520 * scale, name: 'ST. JATINEGARA' },
    { minX: 2880 * scale, maxX: (baseWidth - 20) * scale, name: 'KETERANGAN_BOX' },
  ];

  // Forbidden zones for Lower Lane inside CAD coordinates
  // BEKASI TIMUR Zone: X = 200 to 520 (tracks up to Y = 1277)
  const forbiddenZonesLower = [
    { minX: 200 * scale, maxX: 520 * scale, name: 'BEKASI_TIMUR' },
  ];

  // Dedicated Safe Lane Y Coordinates
  // Upper Lane: Y = 175 in CAD space (under header line Y=160, above Kramat Y=370, Klender Y=480)
  // If canvas was expanded for >10 logs, park in the pristine top margin!
  const upperLaneY = expandCanvasForManyLogs
    ? 25 * scale
    : mapYOffset + 175 * scale;

  // Lower Lane: Y = 1272 in CAD space (below Cakung tracks Y=1140 & label Y=1250, above bottom border Y=1395)
  // If canvas was expanded for >10 logs, park in the pristine bottom margin!
  const lowerLaneY = expandCanvasForManyLogs
    ? (mapYOffset + baseHeight * scale + 20 * scale)
    : mapYOffset + 1272 * scale;

  // Partition cards into Upper and Lower corridors
  const sortedItems = [...linesWithLogs].sort((a, b) => a.center.x - b.center.x);
  const upperCards = [];
  const lowerCards = [];

  sortedItems.forEach(({ line, logs, center }) => {
    const targetX = center.x * scale;
    const targetY = mapYOffset + center.y * scale;
    const displayLogs = logs.slice(0, 2);
    const footerExtra = logs.length > 2 ? 12 * scale : 0;
    const cardH = headerHeight + displayLogs.length * logItemHeight + 6 * scale + footerExtra;

    const card = {
      id: line.id,
      line,
      logs,
      displayLogs,
      center,
      targetX,
      targetY,
      cardW,
      cardH,
      headerHeight,
      logItemHeight,
      footerExtra,
      x: 0,
      y: 0,
      isUpper: true,
      elbowY: 0,
    };

    // Corridor assignment:
    // If center.y >= 850 (Cakung, Kranji, Bekasi, Bekasi Timur) -> Lower Lane
    // If center.y < 850:
    // If target is inside Jatinegara (X: 980..1520) and upper lane already has cards,
    // route to Lower Lane where there is plenty of whitespace!
    if (center.y >= 850) {
      card.isUpper = false;
      lowerCards.push(card);
    } else {
      if (center.x >= 980 && center.x <= 1520 && upperCards.length >= 2) {
        card.isUpper = false;
        lowerCards.push(card);
      } else {
        card.isUpper = true;
        upperCards.push(card);
      }
    }
  });

  // Helper: 1D Horizontal Collision Resolution with Forbidden Zone Evasion
  const resolveCorridor = (cards, laneY, forbiddenZones, isUpper) => {
    if (cards.length === 0) return;

    // 1. Initial ideal X centered on target
    cards.forEach((card) => {
      card.y = laneY;
      card.isUpper = isUpper;
      card.x = Math.max(minX, Math.min(maxX, card.targetX - card.cardW / 2));
    });

    // 2. Erode from Forbidden Zones
    cards.forEach((card) => {
      for (const zone of forbiddenZones) {
        if (card.x + card.cardW > zone.minX && card.x < zone.maxX) {
          const distToLeft = Math.abs(card.x + card.cardW - zone.minX);
          const distToRight = Math.abs(card.x - zone.maxX);
          if (distToLeft < distToRight && zone.minX - card.cardW >= minX) {
            card.x = zone.minX - card.cardW - gapX;
          } else {
            card.x = zone.maxX + gapX;
          }
        }
      }
    });

    // 3. Pass 1: Left-to-Right collision resolution
    for (let i = 1; i < cards.length; i++) {
      const prev = cards[i - 1];
      const curr = cards[i];
      const minAllowed = prev.x + prev.cardW + gapX;
      if (curr.x < minAllowed) {
        curr.x = minAllowed;
      }
      // Check forbidden zones
      for (const zone of forbiddenZones) {
        if (curr.x + curr.cardW > zone.minX && curr.x < zone.maxX) {
          curr.x = zone.maxX + gapX;
        }
      }
    }

    // 4. Pass 2: Right-to-Left pushback if overflowing maxX
    const lastCard = cards[cards.length - 1];
    if (lastCard && lastCard.x > maxX) {
      lastCard.x = maxX;
      for (let i = cards.length - 2; i >= 0; i--) {
        const next = cards[i + 1];
        const curr = cards[i];
        const maxAllowed = next.x - gapX - curr.cardW;
        if (curr.x > maxAllowed) {
          curr.x = maxAllowed;
        }
        for (const zone of forbiddenZones) {
          if (curr.x + curr.cardW > zone.minX && curr.x < zone.maxX) {
            curr.x = zone.minX - curr.cardW - gapX;
          }
        }
      }
    }

    // 5. Final safety clamp
    cards.forEach((card) => {
      card.x = Math.max(minX, Math.min(maxX, card.x));
    });
  };

  resolveCorridor(upperCards, upperLaneY, forbiddenZonesUpper, true);
  resolveCorridor(lowerCards, lowerLaneY, forbiddenZonesLower, false);

  const allCards = [...upperCards, ...lowerCards];

  // Apply User Drag Custom Positions (if any)
  allCards.forEach((card) => {
    const custom = customPositions[card.line.id];
    if (custom && typeof custom.x === 'number' && typeof custom.y === 'number') {
      card.x = custom.x * scale;
      card.y = custom.y * scale;
      card.isManual = true;
      card.isUpper = card.y + card.cardH / 2 <= card.targetY;
    }
  });

  // Calculate Staggered Orthogonal Elbow Coordinates
  allCards.forEach((card, idx) => {
    const startX = card.x + card.cardW / 2;
    let startY = 0;
    let elbowY = 0;
    const staggerY = (idx % 3) * 9 * scale;

    if (card.isUpper) {
      startY = card.y + card.cardH;
      const baseElbow = card.y + card.cardH + 16 * scale;
      elbowY = Math.min(card.targetY - 14 * scale, baseElbow + staggerY);
      if (elbowY <= startY) {
        elbowY = startY + (card.targetY - startY) * 0.4;
      }
    } else {
      startY = card.y;
      const baseElbow = card.y - 16 * scale;
      elbowY = Math.max(card.targetY + 14 * scale, baseElbow - staggerY);
      if (elbowY >= startY) {
        elbowY = startY - (startY - card.targetY) * 0.4;
      }
    }

    card.startX = startX;
    card.startY = startY;
    card.elbowY = elbowY;
  });

  return allCards;
}

/**
 * Generate smooth SVG path string for orthogonal (elbow) leader line
 */
export function getElbowSvgPath(card, scale = 1.0) {
  const { startX, startY, elbowY, targetX, targetY, isUpper } = card;
  const beaconRadius = 11 * scale;
  const arrowEndY = isUpper ? targetY - beaconRadius : targetY + beaconRadius;
  const r = Math.min(6 * scale, Math.abs(targetX - startX) / 2);

  const dirX = targetX >= startX ? 1 : -1;
  const dirY1 = elbowY >= startY ? 1 : -1;
  const dirY2 = arrowEndY >= elbowY ? 1 : -1;

  if (Math.abs(targetX - startX) <= 2) {
    return `M ${startX} ${startY} L ${targetX} ${arrowEndY}`;
  }

  return [
    `M ${startX} ${startY}`,
    `L ${startX} ${elbowY - dirY1 * r}`,
    `Q ${startX} ${elbowY} ${startX + dirX * r} ${elbowY}`,
    `L ${targetX - dirX * r} ${elbowY}`,
    `Q ${targetX} ${elbowY} ${targetX} ${elbowY + dirY2 * r}`,
    `L ${targetX} ${arrowEndY}`,
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
 * Render Orthogonal Elbow Leader Line on Canvas
 */
function drawOrthogonalElbow(ctx, card, scale) {
  const { startX, startY, elbowY, targetX, targetY, isUpper } = card;
  const beaconRadius = 11 * scale;
  const arrowEndY = isUpper ? targetY - beaconRadius : targetY + beaconRadius;
  const r = Math.min(6 * scale, Math.abs(targetX - startX) / 2);

  const dirX = targetX >= startX ? 1 : -1;
  const dirY1 = elbowY >= startY ? 1 : -1;
  const dirY2 = arrowEndY >= elbowY ? 1 : -1;

  const constructPath = (context) => {
    context.beginPath();
    context.moveTo(startX, startY);

    if (Math.abs(targetX - startX) > 2) {
      context.lineTo(startX, elbowY - dirY1 * r);
      context.quadraticCurveTo(startX, elbowY, startX + dirX * r, elbowY);

      context.lineTo(targetX - dirX * r, elbowY);
      context.quadraticCurveTo(targetX, elbowY, targetX, elbowY + dirY2 * r);
    }

    context.lineTo(targetX, arrowEndY);
  };

  ctx.save();

  // Pass 1: Outer White Halo outline
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4.2 * scale;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  constructPath(ctx);
  ctx.stroke();

  // Pass 2: Soft Slate Shadow outline
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.18)';
  ctx.lineWidth = 2.4 * scale;
  constructPath(ctx);
  ctx.stroke();

  // Pass 3: Core Leader Line (#0f172a)
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1.4 * scale;
  constructPath(ctx);
  ctx.stroke();

  // Arrowhead pointing vertically into radar beacon
  const headLen = 8 * scale;
  const headW = 5 * scale;
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  if (isUpper) {
    ctx.moveTo(targetX, arrowEndY);
    ctx.lineTo(targetX - headW, arrowEndY - headLen);
    ctx.lineTo(targetX, arrowEndY - headLen * 0.7);
    ctx.lineTo(targetX + headW, arrowEndY - headLen);
  } else {
    ctx.moveTo(targetX, arrowEndY);
    ctx.lineTo(targetX - headW, arrowEndY + headLen);
    ctx.lineTo(targetX, arrowEndY + headLen * 0.7);
    ctx.lineTo(targetX + headW, arrowEndY + headLen);
  }
  ctx.closePath();
  ctx.fill();

  // Card Base Anchor Pin
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(startX, startY, 2.8 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(startX, startY, 1.2 * scale, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Render Compact Callout Box on Canvas
 */
function drawCompactCalloutBox(ctx, card, scale) {
  const { line, logs, displayLogs, cardW, cardH, x: cardX, y: cardY, headerHeight, logItemHeight } = card;

  ctx.save();

  const cardRadius = 6 * scale;
  const trackColor = line.color || '#334155';

  // 1. Drop Shadow
  ctx.save();
  ctx.shadowColor = 'rgba(15, 23, 42, 0.12)';
  ctx.shadowBlur = 10 * scale;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 3 * scale;
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

  // Left Accent Strip in Track's authentic color
  ctx.fillStyle = trackColor;
  ctx.fillRect(cardX, cardY, 3.5 * scale, cardH);

  // Header Background Banner (Subtle slate-50)
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(cardX + 3.5 * scale, cardY, cardW - 3.5 * scale, headerHeight);

  // Hairline Header Bottom Divider
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1 * scale;
  ctx.beginPath();
  ctx.moveTo(cardX + 3.5 * scale, cardY + headerHeight);
  ctx.lineTo(cardX + cardW, cardY + headerHeight);
  ctx.stroke();

  ctx.restore();

  // 3. Outer Border Frame
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1 * scale;
  roundRect(ctx, cardX, cardY, cardW, cardH, cardRadius);
  ctx.stroke();

  // ==========================================
  // Header Information & Badges
  // ==========================================
  const headerDotX = cardX + 12 * scale;
  const headerDotY = cardY + headerHeight / 2;

  // Track color circle
  ctx.fillStyle = trackColor;
  ctx.beginPath();
  ctx.arc(headerDotX, headerDotY, 3.8 * scale, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(headerDotX, headerDotY, 1.4 * scale, 0, Math.PI * 2);
  ctx.fill();

  // Track Title
  ctx.fillStyle = '#0f172a';
  ctx.font = `bold ${8 * scale}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const maxTitleW = cardW - 82 * scale;
  const titleText = truncateText(ctx, line.title || line.code, maxTitleW);
  ctx.fillText(titleText, cardX + 20 * scale, headerDotY - 3.5 * scale);

  // KM Subtitle
  ctx.fillStyle = '#64748b';
  ctx.font = `600 ${6 * scale}px "SF Mono", Menlo, Consolas, monospace`;
  ctx.fillText(line.km || '', cardX + 20 * scale, headerDotY + 5 * scale);

  // Job Count Badge Pill
  const badgeW = 54 * scale;
  const badgeH = 14 * scale;
  const badgeX = cardX + cardW - badgeW - 6 * scale;
  const badgeY = cardY + (headerHeight - badgeH) / 2;

  ctx.fillStyle = '#f1f5f9';
  roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 7 * scale);
  ctx.fill();
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 0.8 * scale;
  roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 7 * scale);
  ctx.stroke();

  ctx.fillStyle = '#2563eb';
  ctx.beginPath();
  ctx.arc(badgeX + 6.5 * scale, badgeY + badgeH / 2, 1.8 * scale, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#1e293b';
  ctx.font = `bold ${6.2 * scale}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${logs.length} Pekerjaan`, badgeX + (badgeW + 5 * scale) / 2, badgeY + badgeH / 2);

  // ==========================================
  // Work Log Items Inside Callout
  // ==========================================
  let currentLogY = cardY + headerHeight + 3 * scale;
  const itemContentX = cardX + 11 * scale;
  const itemContentW = cardW - 18 * scale;

  displayLogs.forEach((log, logIdx) => {
    if (logIdx > 0) {
      ctx.strokeStyle = '#f1f5f9';
      ctx.lineWidth = 0.8 * scale;
      ctx.beginPath();
      ctx.moveTo(cardX + 8 * scale, currentLogY);
      ctx.lineTo(cardX + cardW - 8 * scale, currentLogY);
      ctx.stroke();
      currentLogY += 2 * scale;
    }

    const { dateStr, timeStr } = formatLogTimestamp(log.createdAt || log.timestamp);
    const row1Y = currentLogY + 5 * scale;

    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#64748b';
    ctx.font = `600 ${5.8 * scale}px "SF Mono", Menlo, Consolas, monospace`;
    ctx.fillText(`${dateStr} • ${timeStr}`, itemContentX, row1Y);

    // Status Badge
    const status = (log.status || 'DONE').toUpperCase();
    const isCompleted = status === 'DONE' || status === 'COMPLETED';
    const isInProgress = status === 'IN_PROGRESS' || status === 'PROGRESS';

    const statusText = isCompleted ? 'SELESAI' : isInProgress ? 'PROSES' : status;
    const statusBg = isCompleted ? '#dcfce7' : isInProgress ? '#fef3c7' : '#f1f5f9';
    const statusColor = isCompleted ? '#166534' : isInProgress ? '#92400e' : '#475569';

    ctx.font = `bold ${5.5 * scale}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    const sTextW = ctx.measureText(statusText).width;
    const sPillW = sTextW + 8 * scale;
    const sPillH = 10 * scale;
    const sPillX = cardX + cardW - sPillW - 8 * scale;
    const sPillY = row1Y - sPillH / 2;

    ctx.fillStyle = statusBg;
    roundRect(ctx, sPillX, sPillY, sPillW, sPillH, 3 * scale);
    ctx.fill();

    ctx.fillStyle = statusColor;
    ctx.textAlign = 'center';
    ctx.fillText(statusText, sPillX + sPillW / 2, row1Y);

    // Row 2: Action / Job Type
    const row2Y = currentLogY + 13 * scale;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#0f172a';
    ctx.font = `bold ${7 * scale}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    const actionTitle = truncateText(ctx, log.actionType || 'Pemeliharaan LAA', itemContentW);
    ctx.fillText(actionTitle, itemContentX, row2Y);

    // Row 3: Executor / Technician
    const row3Y = currentLogY + 19.5 * scale;
    const techStr = log.technician ? log.technician : 'UPT Resor 1.9';
    const descStr = log.description ? ` • ${log.description}` : '';
    const infoFull = truncateText(ctx, `${techStr}${descStr}`, itemContentW - 8 * scale);

    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.arc(itemContentX + 1.5 * scale, row3Y, 1.4 * scale, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#475569';
    ctx.font = `500 ${5.8 * scale}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillText(infoFull, itemContentX + 5 * scale, row3Y);

    currentLogY += logItemHeight;
  });

  // Extra note if more than 2 logs
  if (logs.length > 2) {
    ctx.fillStyle = '#64748b';
    ctx.font = `italic 600 ${5.8 * scale}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`+ ${logs.length - 2} pekerjaan lainnya`, cardX + cardW / 2, currentLogY + 3.5 * scale);
  }

  ctx.restore();
}

/**
 * Generate Ultra HD Canvas from CAD base map + track glows + radar dots + callout cards
 */
export async function renderUltraHdCanvas({
  linesWithLogs = [],
  showCallouts = true,
  showRadar = true,
  showOfficialHeader = false,
  scale = 3.0, // 3.0 scale gives 9825 x 4257 px (True 600 DPI Ultra HD)
  customCardPositions = {},
  expandCanvasForManyLogs = false,
}) {
  const baseWidth = 3275;
  const baseHeight = 1419;

  // Dedicated Callout White Margin expansion when > 10 locations
  const autoExpand = expandCanvasForManyLogs || (showCallouts && linesWithLogs.length > 10);
  const calloutExtraTop = autoExpand ? 140 : 0;
  const calloutExtraBottom = autoExpand ? 140 : 0;

  // Additional header/footer margin if official header enabled
  const topMargin = (showOfficialHeader ? 140 : 0) + calloutExtraTop;
  const bottomMargin = (showOfficialHeader ? 70 : 0) + calloutExtraBottom;

  const totalWidth = Math.round(baseWidth * scale);
  const totalHeight = Math.round((baseHeight + topMargin + bottomMargin) * scale);

  const canvas = document.createElement('canvas');
  canvas.width = totalWidth;
  canvas.height = totalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get 2D canvas context');

  // 1. White paper background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, totalWidth, totalHeight);

  // Load CAD Background image
  const img = new Image();
  img.crossOrigin = 'anonymous';
  await new Promise((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Failed to load base CAD map image'));
    img.src = '/peta-laa-cropped-hd.png';
  });

  const mapYOffset = topMargin * scale;
  const mapW = baseWidth * scale;
  const mapH = baseHeight * scale;

  // Draw CAD map
  ctx.drawImage(img, 0, mapYOffset, mapW, mapH);

  // 2. Draw Header Banner if enabled
  if (showOfficialHeader) {
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3 * scale;
    ctx.strokeRect(10 * scale, 10 * scale, totalWidth - 20 * scale, totalHeight - 20 * scale);

    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1 * scale;
    ctx.strokeRect(14 * scale, 14 * scale, totalWidth - 28 * scale, totalHeight - 28 * scale);

    ctx.beginPath();
    ctx.moveTo(14 * scale, mapYOffset);
    ctx.lineTo(totalWidth - 14 * scale, mapYOffset);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5 * scale;
    ctx.stroke();

    const footerY = mapYOffset + mapH;
    ctx.beginPath();
    ctx.moveTo(14 * scale, footerY);
    ctx.lineTo(totalWidth - 14 * scale, footerY);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5 * scale;
    ctx.stroke();

    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#0f172a';
    ctx.font = `bold ${24 * scale}px sans-serif`;
    ctx.fillText('PETA WILAYAH UPT RESOR LAA 1.9 JATINEGARA', totalWidth / 2, 45 * scale);

    ctx.fillStyle = '#334155';
    ctx.font = `600 ${14 * scale}px sans-serif`;
    ctx.fillText('SISTEM MONITORING RIWAYAT PEKERJAAN & PEMELIHARAAN LINTAS JARINGAN LAA', totalWidth / 2, 75 * scale);

    ctx.fillStyle = '#64748b';
    ctx.font = `500 ${11 * scale}px sans-serif`;
    const now = new Date();
    const dateFormatted = now.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const timeFormatted = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
    ctx.fillText(`Lintas: Jatinegara — Bekasi  •  Tanggal Export: ${dateFormatted} pukul ${timeFormatted}`, totalWidth / 2, 102 * scale);

    ctx.restore();
  }

  const toCanvasX = (cadX) => cadX * scale;
  const toCanvasY = (cadY) => mapYOffset + cadY * scale;

  // 3. Draw Track Glows for active work lines
  linesWithLogs.forEach(({ line }) => {
    if (!line.d) return;
    const color = line.color || '#ef4444';

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 9 * scale;
    ctx.globalAlpha = 0.45;
    ctx.shadowColor = color;
    ctx.shadowBlur = 10 * scale;

    ctx.translate(0, mapYOffset);
    ctx.scale(scale, scale);
    const p = new Path2D(line.d);
    ctx.stroke(p);
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3 * scale;
    ctx.globalAlpha = 0.95;
    ctx.translate(0, mapYOffset);
    ctx.scale(scale, scale);
    ctx.stroke(p);
    ctx.restore();

    ctx.restore();
  });

  // 4. Draw Radar Glow Beacons
  if (showRadar) {
    linesWithLogs.forEach(({ center, logs }) => {
      if (!center || center.x == null || center.y == null) return;
      const cx = toCanvasX(center.x);
      const cy = toCanvasY(center.y);
      const count = logs.length;

      // Outer Red Glow Halo
      ctx.save();
      const grad = ctx.createRadialGradient(cx, cy, 2 * scale, cx, cy, 22 * scale);
      grad.addColorStop(0, 'rgba(239, 68, 68, 0.9)');
      grad.addColorStop(0.4, 'rgba(239, 68, 68, 0.45)');
      grad.addColorStop(0.8, 'rgba(239, 68, 68, 0.15)');
      grad.addColorStop(1, 'rgba(239, 68, 68, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, 22 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Ripple Rings
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
      ctx.lineWidth = 1.4 * scale;
      ctx.beginPath();
      ctx.arc(cx, cy, 11 * scale, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(239, 68, 68, 0.55)';
      ctx.lineWidth = 1 * scale;
      ctx.beginPath();
      ctx.arc(cx, cy, 16 * scale, 0, Math.PI * 2);
      ctx.stroke();

      // Center Core
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(cx, cy, 5.5 * scale, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx, cy, 2 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Number of Jobs Badge
      if (count > 1) {
        const badgeX = cx + 9 * scale;
        const badgeY = cy - 9 * scale;
        const badgeR = 6 * scale;

        ctx.fillStyle = '#b91c1c';
        ctx.beginPath();
        ctx.arc(badgeX, badgeY, badgeR, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1 * scale;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${7 * scale}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(count), badgeX, badgeY);
      }
      ctx.restore();
    });
  }

  // 5. Draw Callout Boxes with Orthogonal (Elbow) Connectors
  if (showCallouts && linesWithLogs.length > 0) {
    const preparedCards = computeCalloutLayout({
      linesWithLogs,
      customPositions: customCardPositions,
      baseWidth,
      baseHeight,
      mapYOffset,
      scale,
      expandCanvasForManyLogs: autoExpand,
    });

    // Step 5A: Render ALL Orthogonal Leader Lines FIRST
    // Guarantees NO arrow can EVER be drawn on top of ANY callout card box!
    preparedCards.forEach((card) => {
      drawOrthogonalElbow(ctx, card, scale);
    });

    // Step 5B: Render ALL Callout Card Boxes ON TOP
    preparedCards.forEach((card) => {
      drawCompactCalloutBox(ctx, card, scale);
    });
  }

  return canvas;
}

/**
 * Pure JavaScript PDF 1.4 Binary Generator
 * Wraps JPEG data stream into an authentic, standalone PDF document.
 */
export function buildPdfFromJpegBuffer(jpegBuffer, widthPx, heightPx, pageWidthPt, pageHeightPt) {
  const obj1 = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';
  const obj2 = '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n';
  const obj3 = `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidthPt.toFixed(2)} ${pageHeightPt.toFixed(2)}] /Resources << /XObject << /Im1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`;

  const imgHeader = `4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${widthPx} /Height ${heightPx} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBuffer.length} >>\nstream\n`;
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
  currentOffset += imgHeader.length + jpegBuffer.length + imgFooter.length;

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
    jpegBuffer.length +
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
  uint8.set(jpegBuffer, pos);
  pos += jpegBuffer.length;
  writeStr(imgFooter);
  writeStr(obj5);
  writeStr(xref);
  writeStr(trailer);

  return uint8;
}

/**
 * 1-Click Direct Download PDF File
 */
export async function downloadMapPdf({
  linesWithLogs = [],
  showCallouts = true,
  showRadar = true,
  showOfficialHeader = false,
  paperSize = 'NATIVE', // 'NATIVE' (Default CAD 600 DPI) | 'A3' | 'A4'
  quality = 0.95,
  customCardPositions = {},
  expandCanvasForManyLogs = false,
}) {
  const canvas = await renderUltraHdCanvas({
    linesWithLogs,
    showCallouts,
    showRadar,
    showOfficialHeader,
    scale: 3.0, // 600 DPI Ultra HD Precision
    customCardPositions,
    expandCanvasForManyLogs,
  });

  const jpegBlob = await new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/jpeg', quality);
  });
  if (!jpegBlob) throw new Error('Failed to generate JPEG blob from canvas');

  const arrayBuffer = await jpegBlob.arrayBuffer();
  const jpegBuffer = new Uint8Array(arrayBuffer);

  let pageWPt = 1200;
  let pageHPt = (1200 * canvas.height) / canvas.width;

  if (paperSize === 'A4') {
    pageWPt = 841.89;
    pageHPt = 595.28;
  } else if (paperSize === 'A3') {
    pageWPt = 1190.55;
    pageHPt = 841.89;
  }

  const pdfBytes = buildPdfFromJpegBuffer(jpegBuffer, canvas.width, canvas.height, pageWPt, pageHPt);
  const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const filename = `PETA_LAA_UPT_1.9_JATINEGARA_600DPI_${dateStr}.pdf`;

  triggerDownload(pdfBlob, filename);
  return filename;
}

/**
 * 1-Click Direct Download Ultra HD PNG (600 DPI)
 */
export async function downloadMapPng({
  linesWithLogs = [],
  showCallouts = true,
  showRadar = true,
  showOfficialHeader = false,
  customCardPositions = {},
  expandCanvasForManyLogs = false,
}) {
  const canvas = await renderUltraHdCanvas({
    linesWithLogs,
    showCallouts,
    showRadar,
    showOfficialHeader,
    scale: 3.0, // 600 DPI Ultra HD
    customCardPositions,
    expandCanvasForManyLogs,
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
 * Native Browser Print to PDF (Opens print dialog with 600 DPI resolution)
 */
export async function printMapWindow({
  linesWithLogs = [],
  showCallouts = true,
  showRadar = true,
  showOfficialHeader = false,
  customCardPositions = {},
  expandCanvasForManyLogs = false,
}) {
  const canvas = await renderUltraHdCanvas({
    linesWithLogs,
    showCallouts,
    showRadar,
    showOfficialHeader,
    scale: 3.0, // 600 DPI Ultra HD
    customCardPositions,
    expandCanvasForManyLogs,
  });

  const dataUrl = canvas.toDataURL('image/jpeg', 0.96);

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
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
        <img src="${dataUrl}" onload="window.print();window.close();" />
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
