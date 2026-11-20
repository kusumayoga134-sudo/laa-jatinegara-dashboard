/**
 * PDF & High-Resolution Export Engine for Peta Wilayah LAA UPT Resor 1.9 Jatinegara
 * Pure Client-Side, Ultra HD (300 DPI / 4K), Zero External Dependencies.
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
  const timeStr = d.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  }) + ' WIB';
  
  return { dateStr, timeStr };
}

/**
 * Generate Ultra HD Canvas from CAD base map + track glows + radar dots + callout cards
 */
export async function renderUltraHdCanvas({
  linesWithLogs = [],
  showCallouts = true,
  showRadar = true,
  showOfficialHeader = false,
  scale = 2.0, // 2.0 scale gives 6550 x 2838 px (True 300 DPI Ultra HD)
}) {
  const baseWidth = 3275;
  const baseHeight = 1419;

  // Additional header/footer margin if official header enabled
  const topMargin = showOfficialHeader ? 140 : 0;
  const bottomMargin = showOfficialHeader ? 70 : 0;

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
    img.onerror = (e) => reject(new Error('Failed to load base CAD map image'));
    img.src = '/peta-laa-cropped-hd.png';
  });

  const mapYOffset = topMargin * scale;
  const mapW = baseWidth * scale;
  const mapH = baseHeight * scale;

  // Draw CAD map
  ctx.drawImage(img, 0, mapYOffset, mapW, mapH);

  // 2. Draw Header Banner if enabled
  if (showOfficialHeader) {
    // Outer border frame
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3 * scale;
    ctx.strokeRect(10 * scale, 10 * scale, totalWidth - 20 * scale, totalHeight - 20 * scale);

    // Inner subtle border
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1 * scale;
    ctx.strokeRect(14 * scale, 14 * scale, totalWidth - 28 * scale, totalHeight - 28 * scale);

    // Header divider line
    ctx.beginPath();
    ctx.moveTo(14 * scale, mapYOffset);
    ctx.lineTo(totalWidth - 14 * scale, mapYOffset);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5 * scale;
    ctx.stroke();

    // Footer divider line
    const footerY = mapYOffset + mapH;
    ctx.beginPath();
    ctx.moveTo(14 * scale, footerY);
    ctx.lineTo(totalWidth - 14 * scale, footerY);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5 * scale;
    ctx.stroke();

    // Document Header Text (Center)
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

    // Left info badge: Total lokasi berpenanda
    ctx.textAlign = 'left';
    ctx.fillStyle = '#dc2626';
    ctx.font = `bold ${12 * scale}px sans-serif`;
    ctx.fillText(`● STATUS PEKERJAAN AKTIF: ${linesWithLogs.length} Lokasi Berpenanda`, 35 * scale, 120 * scale);

    // Right info: Klasifikasi dokumen
    ctx.textAlign = 'right';
    ctx.fillStyle = '#475569';
    ctx.font = `bold ${11 * scale}px sans-serif`;
    ctx.fillText('DOKUMEN RESMI TEKNIK LAA — FORMAT ULTRA HD (600 DPI)', totalWidth - 35 * scale, 120 * scale);
    ctx.restore();

    // Footer Text
    ctx.save();
    ctx.fillStyle = '#64748b';
    ctx.font = `500 ${10.5 * scale}px sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText('PT KERETA API INDONESIA (PERSERO) — DAOP 1 JAKARTA  |  DANANTARA INDONESIA SOVEREIGN FUND', 30 * scale, footerY + 38 * scale);

    ctx.textAlign = 'right';
    ctx.fillText('UPT RESOR LAA 1.9 JATINEGARA  •  KANTOR RESOR STASIUN JATINEGARA © ' + now.getFullYear(), totalWidth - 30 * scale, footerY + 38 * scale);
    ctx.restore();
  }

  // Helper coordinate mapper
  const toCanvasX = (svgX) => svgX * scale;
  const toCanvasY = (svgY) => mapYOffset + svgY * scale;

  // 3. Draw Radar Glow Beacons
  if (showRadar) {
    linesWithLogs.forEach(({ line, logs, center }) => {
      const cx = toCanvasX(center.x);
      const cy = toCanvasY(center.y);
      const count = logs.length;
      const displayCount = Math.min(count, 5);
      const dotSpacing = 22 * scale;
      const startX = cx - ((displayCount - 1) * dotSpacing) / 2;

      for (let idx = 0; idx < displayCount; idx++) {
        const dotX = startX + idx * dotSpacing;
        const dotY = cy;

        // Outer Glow Aura
        ctx.save();
        const grad = ctx.createRadialGradient(dotX, dotY, 4 * scale, dotX, dotY, 26 * scale);
        grad.addColorStop(0, 'rgba(239, 68, 68, 0.95)');
        grad.addColorStop(0.4, 'rgba(239, 68, 68, 0.45)');
        grad.addColorStop(1, 'rgba(239, 68, 68, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(dotX, dotY, 26 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Outer Ring
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2 * scale;
        ctx.beginPath();
        ctx.arc(dotX, dotY, 14 * scale, 0, Math.PI * 2);
        ctx.stroke();

        // Inner Solid Red Dot
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(dotX, dotY, 7 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Center White Core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(dotX, dotY, 2.5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // If multiple jobs, draw small counter badge on last dot
      if (count > 1) {
        ctx.save();
        const badgeX = startX + (displayCount - 1) * dotSpacing + 8 * scale;
        const badgeY = cy - 8 * scale;
        ctx.fillStyle = '#991b1b';
        ctx.beginPath();
        ctx.arc(badgeX, badgeY, 6.5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1 * scale;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${8 * scale}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(count), badgeX, badgeY);
        ctx.restore();
      }
    });
  }

  // 4. Draw Callout Boxes with Arrows pointing directly to radar beacons (Collision-Free Layout)
  if (showCallouts && linesWithLogs.length > 0) {
    const cardW = 205 * scale;
    const headerHeight = 26 * scale;
    const logItemHeight = 30 * scale;
    const gapX = 14 * scale;
    const gapY = 10 * scale;
    const minX = 25 * scale;
    const maxX = totalWidth - cardW - 25 * scale;

    // Absolute safety boundary: NO card can EVER enter the official header banner or footer banner!
    const absoluteMinY = mapYOffset + 14 * scale;
    const absoluteMaxY = (mapYOffset + mapH) - (headerHeight + logItemHeight + 6 * scale) - 14 * scale;

    // Step 1: Pre-calculate card properties with natural proximity to target beacons
    const preparedCards = linesWithLogs.map(({ line, logs, center }) => {
      const targetX = toCanvasX(center.x);
      const targetY = toCanvasY(center.y);
      const displayLogs = logs.slice(0, 2);
      const footerExtra = logs.length > 2 ? 14 * scale : 0;
      const cardH = headerHeight + displayLogs.length * logItemHeight + 6 * scale + footerExtra;

      const cadY = center.y;
      const code = (line.code || '').toLowerCase();
      const title = (line.title || '').toLowerCase();

      // Proximity side selection: Hilir/upper tracks go above, Hulu/lower tracks go below
      let side;
      if (cadY < 850) {
        const isHi = /\b(hi|hilir)\b/i.test(code) || /\b(hi|hilir)\b/i.test(title) || cadY <= 675;
        side = isHi ? 'above' : 'below';
      } else {
        const isHu = /\b(hu|hulu)\b/i.test(code) || /\b(hu|hulu)\b/i.test(title) || cadY <= 1085;
        side = isHu ? 'above' : 'below';
      }

      // Natural, elegant offset: ~48px from the track beacon (NOT hundreds of pixels away!)
      const naturalOffset = 48 * scale;
      let baseY;
      if (side === 'above') {
        baseY = targetY - cardH - naturalOffset;
      } else {
        baseY = targetY + naturalOffset;
      }

      // Hard clamp within map boundaries so cards NEVER touch or cover the top header banner
      const initialY = Math.max(absoluteMinY, Math.min(absoluteMaxY, baseY));
      const initialX = Math.max(minX, Math.min(maxX, targetX - cardW / 2));

      return {
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
        side,
        baseY,
        x: initialX,
        y: initialY,
      };
    });

    // Helper: 2D Bounding Box Overlap Checker with safety gap
    const checkOverlap = (a, b) => {
      return (
        a.x < b.x + b.cardW + gapX &&
        a.x + a.cardW + gapX > b.x &&
        a.y < b.y + b.cardH + gapY &&
        a.y + a.cardH + gapY > b.y
      );
    };

    // Step 2: Sort cards by horizontal position (targetX) and resolve collisions
    preparedCards.sort((a, b) => a.targetX - b.targetX);

    for (let i = 0; i < preparedCards.length; i++) {
      const curr = preparedCards[i];
      for (let j = 0; j < i; j++) {
        const prev = preparedCards[j];
        if (checkOverlap(curr, prev)) {
          // Option A: Horizontal shift (staggering) if shift is modest
          const shiftX = (prev.x + prev.cardW + gapX) - curr.x;
          const targetCenter = curr.targetX - cardW / 2;
          const distFromTarget = Math.abs((curr.x + shiftX) - targetCenter);

          if (curr.x + shiftX + curr.cardW <= maxX && distFromTarget <= 110 * scale) {
            curr.x += shiftX;
          } else {
            // Option B: Vertical tiering (close, compact tiering!)
            if (curr.side === 'above') {
              const newY = prev.y - curr.cardH - gapY;
              // Strict check: NEVER allow newY to go above absoluteMinY (top banner)
              if (newY >= absoluteMinY) {
                curr.y = newY;
              } else {
                curr.x = Math.min(maxX, prev.x + prev.cardW + gapX);
              }
            } else {
              const newY = prev.y + prev.cardH + gapY;
              if (newY <= absoluteMaxY) {
                curr.y = newY;
              } else {
                curr.x = Math.min(maxX, prev.x + prev.cardW + gapX);
              }
            }
          }
        }
      }
    }

    // Step 3: Global relaxation pass across ALL cards to guarantee 100% zero overlap
    for (let pass = 0; pass < 4; pass++) {
      let hasOverlap = false;
      for (let i = 0; i < preparedCards.length; i++) {
        for (let j = i + 1; j < preparedCards.length; j++) {
          const a = preparedCards[i];
          const b = preparedCards[j];
          if (checkOverlap(a, b)) {
            hasOverlap = true;
            const overlapX = Math.min(
              a.x + a.cardW + gapX - b.x,
              b.x + b.cardW + gapX - a.x
            );
            if (a.x <= b.x) {
              if (b.x + overlapX + b.cardW <= maxX) {
                b.x += overlapX;
              } else if (a.x - overlapX >= minX) {
                a.x -= overlapX;
              }
            } else {
              if (a.x + overlapX + a.cardW <= maxX) {
                a.x += overlapX;
              } else if (b.x - overlapX >= minX) {
                b.x -= overlapX;
              }
            }
          }
        }
      }
      if (!hasOverlap) break;
    }

    // Step 4: Final boundary clamping (strict guarantee: NEVER touches the banner)
    preparedCards.forEach((c) => {
      c.x = Math.max(minX, Math.min(maxX, c.x));
      c.y = Math.max(absoluteMinY, Math.min(absoluteMaxY, c.y));
    });

    // Step 5: Render Callout Cards and Leader Arrows (Unified, Elegant CAD Styling)
    preparedCards.forEach((card) => {
      const { line, logs, displayLogs, cardW, cardH, x: cardX, y: cardY, targetX, targetY, side } = card;

      ctx.save();

      // ==========================================
      // A. Draw Pointer Arrow / Leader Line
      // ==========================================
      const arrowStartX = Math.max(cardX + 20 * scale, Math.min(cardX + cardW - 20 * scale, targetX));
      let arrowStartY;
      if (cardY + cardH < targetY) {
        arrowStartY = cardY + cardH;
      } else if (cardY > targetY) {
        arrowStartY = cardY;
      } else {
        arrowStartY = cardY + cardH / 2;
      }

      // Calculate direction from card anchor to radar target beacon
      const angle = Math.atan2(targetY - arrowStartY, targetX - arrowStartX);
      const distToTarget = Math.hypot(targetX - arrowStartX, targetY - arrowStartY);

      // Stop arrowhead at the outer perimeter of the radar beacon so the beacon stays 100% visible
      const beaconStopRadius = Math.min(13 * scale, Math.max(0, distToTarget - 14 * scale));
      const arrowEndX = targetX - beaconStopRadius * Math.cos(angle);
      const arrowEndY = targetY - beaconStopRadius * Math.sin(angle);

      // Outer White Halo outline (ensures leader line stands out cleanly over tracks and background)
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4.2 * scale;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(arrowStartX, arrowStartY);
      ctx.lineTo(arrowEndX, arrowEndY);
      ctx.stroke();

      // Soft Shadow outline
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.20)';
      ctx.lineWidth = 2.5 * scale;
      ctx.beginPath();
      ctx.moveTo(arrowStartX, arrowStartY);
      ctx.lineTo(arrowEndX, arrowEndY);
      ctx.stroke();

      // Sharp Core Leader Line in Unified Dark Slate (#0f172a, Senada & Professional!)
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5 * scale;
      ctx.beginPath();
      ctx.moveTo(arrowStartX, arrowStartY);
      ctx.lineTo(arrowEndX, arrowEndY);
      ctx.stroke();

      // Sleek Architectural Arrowhead pointing at radar target
      const headLen = 8.5 * scale;
      const headAngle = Math.PI / 7.5;
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(arrowEndX, arrowEndY);
      ctx.lineTo(
        arrowEndX - headLen * Math.cos(angle - headAngle),
        arrowEndY - headLen * Math.sin(angle - headAngle)
      );
      ctx.lineTo(
        arrowEndX - headLen * 0.7 * Math.cos(angle),
        arrowEndY - headLen * 0.7 * Math.sin(angle)
      );
      ctx.lineTo(
        arrowEndX - headLen * Math.cos(angle + headAngle),
        arrowEndY - headLen * Math.sin(angle + headAngle)
      );
      ctx.closePath();
      ctx.fill();

      // Card Base Anchor Pin (Tactile anchor on card border)
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(arrowStartX, arrowStartY, 3 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(arrowStartX, arrowStartY, 1.3 * scale, 0, Math.PI * 2);
      ctx.fill();

      // ==========================================
      // B. Draw Callout Box Container
      // ==========================================
      const cardRadius = 6 * scale;
      const trackColor = line.color || '#334155';

      // 1. Drop Shadow (Soft, ambient modern shadow)
      ctx.save();
      ctx.shadowColor = 'rgba(15, 23, 42, 0.12)';
      ctx.shadowBlur = 12 * scale;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 4 * scale;
      ctx.fillStyle = '#ffffff';
      roundRect(ctx, cardX, cardY, cardW, cardH, cardRadius);
      ctx.fill();
      ctx.restore();

      // 2. Inner Layer clipped to card bounds (Guarantees perfect rounded corners!)
      ctx.save();
      roundRect(ctx, cardX, cardY, cardW, cardH, cardRadius);
      ctx.clip();

      // Card Base Background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cardX, cardY, cardW, cardH);

      // Left Accent Strip in Track's authentic color (Provides clear identity without gaudy borders!)
      ctx.fillStyle = trackColor;
      ctx.fillRect(cardX, cardY, 3.5 * scale, cardH);

      // Header Background Banner (Subtle cool slate-50)
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

      // 3. Unified Sleek Outer Border Frame (Slate-300 hairline, senada across all cards!)
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1 * scale;
      roundRect(ctx, cardX, cardY, cardW, cardH, cardRadius);
      ctx.stroke();

      // ==========================================
      // C. Header Information & Badges
      // ==========================================
      // Header: Jewel Track Indicator Dot
      const headerDotX = cardX + 13 * scale;
      const headerDotY = cardY + headerHeight / 2;

      // Outer track color circle
      ctx.fillStyle = trackColor;
      ctx.beginPath();
      ctx.arc(headerDotX, headerDotY, 4 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Inner white center pip (gives it an optical lens / jewel look)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(headerDotX, headerDotY, 1.5 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Header: Track Title
      ctx.fillStyle = '#0f172a';
      ctx.font = `bold ${8.5 * scale}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      const maxTitleW = cardW - 88 * scale;
      const titleText = truncateText(ctx, line.title || line.code, maxTitleW);
      ctx.fillText(titleText, cardX + 22 * scale, headerDotY - 4 * scale);

      // Header: KM Subtitle
      ctx.fillStyle = '#64748b';
      ctx.font = `600 ${6.5 * scale}px "SF Mono", Menlo, Consolas, monospace`;
      ctx.fillText(line.km || '', cardX + 22 * scale, headerDotY + 5.5 * scale);

      // Header: Job Count Badge (Elegant Pill Badge)
      const badgeW = 60 * scale;
      const badgeH = 15 * scale;
      const badgeX = cardX + cardW - badgeW - 7 * scale;
      const badgeY = cardY + (headerHeight - badgeH) / 2;

      // Badge pill background (Sophisticated slate/indigo)
      ctx.fillStyle = '#f1f5f9';
      roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 7.5 * scale);
      ctx.fill();
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 0.8 * scale;
      roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 7.5 * scale);
      ctx.stroke();

      // Badge indicator dot
      ctx.fillStyle = '#2563eb';
      ctx.beginPath();
      ctx.arc(badgeX + 7.5 * scale, badgeY + badgeH / 2, 2 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Badge text
      ctx.fillStyle = '#1e293b';
      ctx.font = `bold ${6.8 * scale}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${logs.length} Pekerjaan`, badgeX + (badgeW + 6 * scale) / 2, badgeY + badgeH / 2);

      // ==========================================
      // D. Draw Work Log Items Inside Callout
      // ==========================================
      let currentLogY = cardY + headerHeight + 4 * scale;

      displayLogs.forEach((log, logIdx) => {
        const { dateStr, timeStr } = formatLogTimestamp(log.timestamp);

        // Subtle divider between multiple log items
        if (logIdx > 0) {
          ctx.strokeStyle = '#f1f5f9';
          ctx.lineWidth = 0.8 * scale;
          ctx.beginPath();
          ctx.moveTo(cardX + 10 * scale, currentLogY - 2 * scale);
          ctx.lineTo(cardX + cardW - 10 * scale, currentLogY - 2 * scale);
          ctx.stroke();
        }

        const itemContentX = cardX + 12 * scale;
        const itemContentW = cardW - 24 * scale;
        const row1Y = currentLogY + 5 * scale;

        // Vector Clock Icon (Razor-sharp at any DPI, zero emoji rendering bugs)
        const clockX = itemContentX + 3 * scale;
        const clockY = row1Y;
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 0.8 * scale;
        ctx.beginPath();
        ctx.arc(clockX, clockY, 2.8 * scale, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(clockX, clockY);
        ctx.lineTo(clockX, clockY - 1.5 * scale);
        ctx.moveTo(clockX, clockY);
        ctx.lineTo(clockX + 1.2 * scale, clockY);
        ctx.stroke();

        // Timestamp Text
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#64748b';
        ctx.font = `600 ${6.5 * scale}px "SF Mono", Menlo, Consolas, monospace`;
        ctx.fillText(`${dateStr} ${timeStr}`, itemContentX + 8 * scale, row1Y);

        // Status Pill (Right Aligned)
        const rawStatus = (log.status || 'SELESAI').toUpperCase();
        const isProgress = rawStatus === 'PROGRESS';
        const pillW = 48 * scale;
        const pillH = 12 * scale;
        const pillX = cardX + cardW - 8 * scale - pillW;
        const pillY = row1Y - pillH / 2;

        ctx.fillStyle = isProgress ? '#fffbeb' : '#ecfdf5';
        roundRect(ctx, pillX, pillY, pillW, pillH, 3.5 * scale);
        ctx.fill();
        ctx.strokeStyle = isProgress ? '#fde68a' : '#a7f3d0';
        ctx.lineWidth = 0.7 * scale;
        roundRect(ctx, pillX, pillY, pillW, pillH, 3.5 * scale);
        ctx.stroke();

        // Status Pill Text
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = isProgress ? '#b45309' : '#047857';
        ctx.font = `bold ${6.2 * scale}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        ctx.fillText(isProgress ? '● PROGRES' : '✓ SELESAI', pillX + pillW / 2, row1Y);

        // Row 2: Action Name / Job Title
        const row2Y = currentLogY + 14 * scale;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#0f172a';
        ctx.font = `bold ${7.8 * scale}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        const actionTitle = truncateText(ctx, log.actionType || 'Pemeliharaan LAA', itemContentW);
        ctx.fillText(actionTitle, itemContentX, row2Y);

        // Row 3: Executor / Technician & Brief Note
        const row3Y = currentLogY + 22.5 * scale;
        const techStr = log.technician ? log.technician : 'UPT Resor 1.9';
        const descStr = log.description ? ` • ${log.description}` : '';
        const infoFull = truncateText(ctx, `${techStr}${descStr}`, itemContentW - 8 * scale);

        // Tiny team bullet
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.arc(itemContentX + 2 * scale, row3Y, 1.6 * scale, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#475569';
        ctx.font = `500 ${6.5 * scale}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        ctx.fillText(infoFull, itemContentX + 6 * scale, row3Y);

        currentLogY += logItemHeight;
      });

      // Extra note if more than 2 logs
      if (logs.length > 2) {
        ctx.fillStyle = '#64748b';
        ctx.font = `italic 600 ${6.5 * scale}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`+ ${logs.length - 2} pekerjaan lainnya pada seksi ini`, cardX + cardW / 2, currentLogY + 4 * scale);
      }

      ctx.restore();
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
  const imgTotalLen = imgHeader.length + jpegBuffer.length + imgFooter.length;
  currentOffset += imgTotalLen;
  
  offsets.push(currentOffset);
  currentOffset += obj5.length;
  
  const startXref = currentOffset;
  let xref = `xref\n0 6\n0000000000 65535 f \n`;
  for (const off of offsets) {
    xref += String(off).padStart(10, '0') + ' 00000 n \n';
  }
  const trailer = `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`;
  
  const totalLength = currentOffset + xref.length + trailer.length;
  const uint8 = new Uint8Array(totalLength);
  
  const enc = new TextEncoder();
  let pos = 0;
  
  const writeStr = (str) => {
    const bytes = enc.encode(str);
    uint8.set(bytes, pos);
    pos += bytes.length;
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
}) {
  const canvas = await renderUltraHdCanvas({
    linesWithLogs,
    showCallouts,
    showRadar,
    showOfficialHeader,
    scale: 3.0, // 600 DPI Ultra HD Precision
  });

  // Convert canvas to JPEG blob
  const jpegBlob = await new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/jpeg', quality);
  });
  if (!jpegBlob) throw new Error('Failed to generate JPEG blob from canvas');

  const arrayBuffer = await jpegBlob.arrayBuffer();
  const jpegBuffer = new Uint8Array(arrayBuffer);

  // Determine Paper Dimensions in PDF Points (72 pt/inch)
  // Native CAD Aspect Ratio is DEFAULT
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

  // Filename with timestamp
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
  showOfficialHeader = true,
}) {
  const canvas = await renderUltraHdCanvas({
    linesWithLogs,
    showCallouts,
    showRadar,
    showOfficialHeader,
    scale: 3.0, // 600 DPI Ultra HD
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
  showOfficialHeader = true,
}) {
  const canvas = await renderUltraHdCanvas({
    linesWithLogs,
    showCallouts,
    showRadar,
    showOfficialHeader,
    scale: 3.0, // 600 DPI Ultra HD
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
        <title>PETA WILAYAH UPT RESOR LAA 1.9 JATINEGARA - CETAK PDF (600 DPI)</title>
        <style>
          @page {
            size: landscape;
            margin: 0;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          html, body {
            background-color: #ffffff;
            width: 100vw;
            height: 100vh;
            margin: 0;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          }
          img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
            display: block;
          }
        </style>
      </head>
      <body>
        <img src="${dataUrl}" onload="window.print(); window.close();" />
      </body>
    </html>
  `);
  printWindow.document.close();
}

// -------------------------------------------------------------
// Canvas Utility Helpers
// -------------------------------------------------------------
function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function truncateText(ctx, text, maxWidth) {
  if (!text) return '';
  if (ctx.measureText(text).width <= maxWidth) return text;
  let truncated = text;
  while (truncated.length > 3 && ctx.measureText(truncated + '…').width > maxWidth) {
    truncated = truncated.slice(0, -1);
  }
  return truncated + '…';
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(x, y, width, height, radius) : ctx.rect(x, y, width, height);
  ctx.closePath();
}

function roundRectCustom(ctx, x, y, width, height, tl, tr, br, bl) {
  ctx.beginPath();
  ctx.moveTo(x + tl, y);
  ctx.lineTo(x + width - tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + tr);
  ctx.lineTo(x + width, y + height - br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - br, y + height);
  ctx.lineTo(x + bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - bl);
  ctx.lineTo(x, y + tl);
  ctx.quadraticCurveTo(x, y, x + tl, y);
  ctx.closePath();
}
