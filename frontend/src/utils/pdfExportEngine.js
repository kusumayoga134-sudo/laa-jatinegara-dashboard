/**
 * PDF & High-Resolution Export Engine for Peta Wilayah LAA UPT Resor 1.9 Jatinegara
 * Single Fixed Virtual Canvas Architecture: 2400 x 1480 px
 * (MAP: 2400 x 1040, TOP LANE: 220, BOTTOM LANE: 220)
 * Ultra HD (600 DPI CAD Precision), Zero External Dependencies.
 */

export const VIRTUAL_CANVAS = {
  CANVAS_W: 2400,
  CANVAS_H: 1480,
  MAP_W: 2400,
  MAP_H: 1040,
  LANE_TOP_H: 220,
  LANE_BOTTOM_H: 220,
  CAD_BASE_W: 3275,
  CAD_BASE_H: 1419,
  CARD_W: 220, // 20-25% more compact (down from 280)
  CARD_H: 108, // Default fallback card height
  GAP: 18,
  MARGIN_X: 40,
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
 * Filter and extract ONLY the 3 essential fields:
 * 1) Nama Pekerjaan
 * 2) Pelaksana Pekerjaan (Clean PT/team only)
 * 3) Tahun Pekerjaan (4-digit string)
 */
export function getCleanLogDetails(log) {
  // 1. Nama Pekerjaan
  const actionName = (log.actionType || log.title || 'Pemeliharaan LAA')
    .replace(/_/g, ' ')
    .trim();

  // 2. Tahun (4 digit)
  let year = '';
  if (log.year || log.tahun) {
    year = String(log.year || log.tahun).trim();
  }
  const combinedText = [log.technician, log.description, log.rkad].filter(Boolean).join(' ');
  const yearMatch = combinedText.match(/\b(20\d{2})\b/);
  if (yearMatch) {
    year = yearMatch[1];
  } else if (log.createdAt || log.timestamp) {
    const d = new Date(log.createdAt || log.timestamp);
    if (!isNaN(d.getTime())) {
      year = String(d.getFullYear());
    }
  }
  if (!year) year = String(new Date().getFullYear());

  // 3. Pelaksana (hanya nama PT / organisasi)
  let contractor = (log.technician || log.contractor || log.pelaksana || 'UPT 1.9').trim();
  contractor = contractor.split('•')[0].split(' - ')[0].trim();
  contractor = contractor.replace(/\b(RKAD|TAHUN|THN).*/i, '').trim();
  if (!contractor) contractor = 'UPT 1.9';

  return { actionName, contractor, year };
}

/**
 * 1D Deterministic Collision-Resolution & Corridor Placement Engine for Callout Cards
 * Computes compact dynamic-height card positions on the 2400 x 1480 Virtual Canvas.
 */
export function computeCalloutLayout({
  linesWithLogs = [],
  customPositions = {},
}) {
  const {
    CANVAS_W,
    CANVAS_H,
    MAP_W,
    MAP_H,
    LANE_TOP_H,
    LANE_BOTTOM_H,
    CAD_BASE_W,
    CAD_BASE_H,
    CARD_W,
    GAP,
    MARGIN_X,
  } = VIRTUAL_CANVAS;

  if (!linesWithLogs || linesWithLogs.length === 0) return [];

  // Convert radar centers from CAD base coords (3275x1419) to Virtual Canvas coords (2400x1480)
  const items = linesWithLogs.map(({ line, logs, center }) => {
    const rawX = center && center.x != null ? center.x : 1600;
    const rawY = center && center.y != null ? center.y : 700;

    const radarX = Math.round((rawX / CAD_BASE_W) * MAP_W);
    const radarY = Math.round(LANE_TOP_H + (rawY / CAD_BASE_H) * MAP_H);

    // Dynamic height based on number of items (max 3 items shown)
    const displayLogs = logs.slice(0, 3);
    const hasExtra = logs.length > 3;
    const HEADER_H = 24;
    const ITEM_H = 26;
    const PADDING_V = 6;
    const FOOTER_H = 14;
    const cardH = HEADER_H + displayLogs.length * ITEM_H + PADDING_V + (hasExtra ? FOOTER_H : 0);

    return {
      id: line.id,
      line,
      logs,
      displayLogs,
      radarX,
      radarY,
      rawX,
      rawY,
      w: CARD_W,
      h: cardH,
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

  // Partition into Upper Lane and Lower Lane
  const upperCards = [];
  const lowerCards = [];

  items.forEach((item) => {
    if (item.rawY >= 850) {
      item.isUpper = false;
      lowerCards.push(item);
    } else {
      item.isUpper = true;
      upperCards.push(item);
    }
  });

  // Rebalance if one lane has more than 6 cards to maintain ample breathing room
  while (upperCards.length > 6) {
    const moved = upperCards.pop();
    moved.isUpper = false;
    lowerCards.push(moved);
  }
  while (lowerCards.length > 6) {
    const moved = lowerCards.pop();
    moved.isUpper = true;
    upperCards.push(moved);
  }

  // 1D Horizontal Layout Function for a Single Lane
  const layoutLane = (cards, isUpper) => {
    if (cards.length === 0) return;

    cards.sort((a, b) => a.radarX - b.radarX);

    // Compute proportional card width if crowded
    let curCardW = CARD_W;
    const maxAvailableW = CANVAS_W - 2 * MARGIN_X;
    const neededW = cards.length * curCardW + (cards.length - 1) * GAP;
    if (neededW > maxAvailableW) {
      curCardW = Math.floor((maxAvailableW - (cards.length - 1) * GAP) / cards.length);
    }

    // Set initial position centered on radarX with dynamic lane Y
    cards.forEach((card) => {
      card.w = curCardW;
      card.isUpper = isUpper;
      if (isUpper) {
        card.y = Math.round((LANE_TOP_H - card.h) / 2);
      } else {
        card.y = Math.round(LANE_TOP_H + MAP_H + (LANE_BOTTOM_H - card.h) / 2);
      }
      card.x = Math.round(card.radarX - curCardW / 2);
    });

    // Pass 1: Left-to-Right push
    if (cards[0].x < MARGIN_X) cards[0].x = MARGIN_X;
    for (let i = 1; i < cards.length; i++) {
      const minX = cards[i - 1].x + cards[i - 1].w + GAP;
      if (cards[i].x < minX) {
        cards[i].x = minX;
      }
    }

    // Pass 2: Right-to-Left push if last card exceeds right margin
    const lastCard = cards[cards.length - 1];
    if (lastCard.x + lastCard.w > CANVAS_W - MARGIN_X) {
      lastCard.x = CANVAS_W - MARGIN_X - lastCard.w;
      for (let i = cards.length - 2; i >= 0; i--) {
        const maxX = cards[i + 1].x - GAP - cards[i].w;
        if (cards[i].x > maxX) {
          cards[i].x = maxX;
        }
      }
    }

    // Pass 3: Hard boundary clamp [MARGIN_X .. CANVAS_W - MARGIN_X - card.w]
    for (let i = 0; i < cards.length; i++) {
      cards[i].x = Math.max(MARGIN_X, Math.min(CANVAS_W - MARGIN_X - cards[i].w, cards[i].x));
    }
  };

  layoutLane(upperCards, true);
  layoutLane(lowerCards, false);

  const allCards = [...upperCards, ...lowerCards];

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

  // Calculate Orthogonal Elbow Anchor Points and Staggered Belokan
  allCards.forEach((card, idx) => {
    card.startX = Math.round(card.x + card.w / 2);
    const stagger = (idx % 3) * 8;

    if (card.isUpper) {
      card.startY = card.y + card.h;
      card.elbowY = Math.min(card.radarY - 14, 195 + stagger);
      if (card.elbowY <= card.startY) {
        card.elbowY = card.startY + (card.radarY - card.startY) * 0.35;
      }
    } else {
      card.startY = card.y;
      card.elbowY = Math.max(card.radarY + 14, 1285 - stagger);
      if (card.elbowY >= card.startY) {
        card.elbowY = card.startY - (card.startY - card.radarY) * 0.35;
      }
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
 * Compact 2-Line Format (Nama Pekerjaan & Pelaksana • Tahun)
 */
function drawCalloutBox(ctx, card, scale) {
  const cardX = card.x * scale;
  const cardY = card.y * scale;
  const cardW = card.w * scale;
  const cardH = card.h * scale;
  const { line, logs, displayLogs } = card;

  ctx.save();

  const cardRadius = 6 * scale;
  const trackColor = line.color || '#334155';
  const headerHeight = 24 * scale;

  // 1. Drop Shadow
  ctx.save();
  ctx.shadowColor = 'rgba(15, 23, 42, 0.14)';
  ctx.shadowBlur = 8 * scale;
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

  // Left Accent Strip in Track color
  ctx.fillStyle = trackColor;
  ctx.fillRect(cardX, cardY, 3.5 * scale, cardH);

  // Header Background Banner
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(cardX + 3.5 * scale, cardY, cardW - 3.5 * scale, headerHeight);

  // Header Divider Line
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
  const headerDotX = cardX + 11 * scale;
  const headerDotY = cardY + headerHeight / 2;

  // Track color circle
  ctx.fillStyle = trackColor;
  ctx.beginPath();
  ctx.arc(headerDotX, headerDotY, 3.5 * scale, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(headerDotX, headerDotY, 1.2 * scale, 0, Math.PI * 2);
  ctx.fill();

  // Track Title & KM (Single row)
  ctx.fillStyle = '#0f172a';
  ctx.font = `bold ${8.5 * scale}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const badgeW = 42 * scale;
  const maxTitleW = cardW - badgeW - 28 * scale;
  const titleText = truncateText(ctx, line.title || line.code, maxTitleW);
  ctx.fillText(titleText, cardX + 18 * scale, headerDotY);

  // Job Count Badge Pill
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
  ctx.arc(badgeX + 5 * scale, badgeY + badgeH / 2, 1.8 * scale, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#1e293b';
  ctx.font = `bold ${7 * scale}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${logs.length} Pkj`, badgeX + (badgeW + 4 * scale) / 2, badgeY + badgeH / 2);

  // ==========================================
  // Work Log Items (2 Tight Lines per Item)
  // ==========================================
  let currentLogY = cardY + headerHeight + 2 * scale;
  const itemContentX = cardX + 11 * scale;
  const itemContentW = cardW - 18 * scale;
  const itemHeight = 26 * scale;

  displayLogs.forEach((log, logIdx) => {
    if (logIdx > 0) {
      ctx.strokeStyle = '#f1f5f9';
      ctx.lineWidth = 0.8 * scale;
      ctx.beginPath();
      ctx.moveTo(cardX + 8 * scale, currentLogY);
      ctx.lineTo(cardX + cardW - 8 * scale, currentLogY);
      ctx.stroke();
      currentLogY += 1 * scale;
    }

    const { actionName, contractor, year } = getCleanLogDetails(log);

    // Baris 1: Nama Pekerjaan (Font Bold, Slate-900)
    const line1Y = currentLogY + 7.5 * scale;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#0f172a';
    ctx.font = `bold ${8.2 * scale}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillText(truncateText(ctx, actionName, itemContentW), itemContentX, line1Y);

    // Baris 2: Pelaksana • Tahun (Font Tipis, Slate-500)
    const line2Y = currentLogY + 18.5 * scale;
    ctx.fillStyle = '#64748b';
    ctx.font = `500 ${7.2 * scale}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillText(truncateText(ctx, `${contractor} • ${year}`, itemContentW), itemContentX, line2Y);

    currentLogY += itemHeight;
  });

  // Footer: +N pekerjaan lainnya (if logs > 3)
  if (logs.length > 3) {
    const footerY = currentLogY + 6 * scale;
    ctx.fillStyle = '#94a3b8';
    ctx.font = `italic 600 ${6.8 * scale}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`+ ${logs.length - 3} pekerjaan lainnya`, cardX + cardW / 2, footerY);
  }

  ctx.restore();
}

/**
 * Generate Ultra HD Canvas from CAD base map + track glows + radar dots + callout cards
 * Uses the Single Fixed Virtual Canvas (2400 x 1480 px) scaled by `scale` (e.g. 4.0 = 9600 x 5920 px)
 */
export async function renderUltraHdCanvas({
  linesWithLogs = [],
  showCallouts = true,
  showRadar = true,
  scale = 4.0, // 4.0 scale gives 9600 x 5920 px (Ultra HD 600 DPI)
  customCardPositions = {},
}) {
  const { CANVAS_W, CANVAS_H, MAP_W, MAP_H, LANE_TOP_H, CAD_BASE_W, CAD_BASE_H } = VIRTUAL_CANVAS;

  const totalWidth = Math.round(CANVAS_W * scale);
  const totalHeight = Math.round(CANVAS_H * scale);

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

  const mapX = 0;
  const mapY = LANE_TOP_H * scale;
  const mapW = MAP_W * scale;
  const mapH = MAP_H * scale;

  // Draw CAD map precisely in its designated area [0, LANE_TOP_H, MAP_W, MAP_H]
  ctx.drawImage(img, mapX, mapY, mapW, mapH);

  // Outer blueprint border
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2 * scale;
  ctx.strokeRect(0, 0, totalWidth, totalHeight);

  // Calculate layout of callout cards
  const preparedCards = computeCalloutLayout({
    linesWithLogs,
    customPositions: customCardPositions,
  });

  // 2. Draw Radar Glow Beacons (clean point beacons, without covering CAD track lines)
  if (showRadar) {
    preparedCards.forEach((card) => {
      const cx = card.radarX * scale;
      const cy = card.radarY * scale;
      const count = card.logs.length;

      ctx.save();
      const grad = ctx.createRadialGradient(cx, cy, 2 * scale, cx, cy, 22 * scale);
      grad.addColorStop(0, 'rgba(239, 68, 68, 0.95)');
      grad.addColorStop(0.4, 'rgba(239, 68, 68, 0.45)');
      grad.addColorStop(0.8, 'rgba(239, 68, 68, 0.15)');
      grad.addColorStop(1, 'rgba(239, 68, 68, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, 22 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Ripple Rings
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
      ctx.lineWidth = 1.6 * scale;
      ctx.beginPath();
      ctx.arc(cx, cy, 11 * scale, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(239, 68, 68, 0.55)';
      ctx.lineWidth = 1.2 * scale;
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
      ctx.arc(cx, cy, 2.2 * scale, 0, Math.PI * 2);
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

  // 4. Draw Orthogonal Elbow Leader Lines and Callout Boxes
  if (showCallouts && preparedCards.length > 0) {
    // Step 4A: Render ALL Leader Lines FIRST
    preparedCards.forEach((card) => {
      drawOrthogonalElbow(ctx, card, scale);
    });

    // Step 4B: Render ALL Callout Boxes ON TOP
    preparedCards.forEach((card) => {
      drawCalloutBox(ctx, card, scale);
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
  paperSize = 'NATIVE', // 'NATIVE' (Default CAD 600 DPI) | 'A3' | 'A4'
  quality = 0.96,
  customCardPositions = {},
}) {
  const canvas = await renderUltraHdCanvas({
    linesWithLogs,
    showCallouts,
    showRadar,
    scale: 4.0, // 4.0 gives 9600 x 5920 px (True 600 DPI Ultra HD)
    customCardPositions,
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
  customCardPositions = {},
}) {
  const canvas = await renderUltraHdCanvas({
    linesWithLogs,
    showCallouts,
    showRadar,
    scale: 4.0, // 9600 x 5920 px Ultra HD
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
 * Native Browser Print to PDF (Opens print dialog with 600 DPI resolution)
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
    scale: 3.5,
    customCardPositions,
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
