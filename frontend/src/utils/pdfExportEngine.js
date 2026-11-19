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
  showOfficialHeader = true,
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
    ctx.fillText('DOKUMEN RESMI TEKNIK LAA — FORMAT ULTRA HD (300 DPI)', totalWidth - 35 * scale, 120 * scale);
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

  // 4. Draw Callout Boxes with Arrows pointing directly to radar beacons
  if (showCallouts && linesWithLogs.length > 0) {
    linesWithLogs.forEach(({ line, logs, center }) => {
      const targetX = toCanvasX(center.x);
      const targetY = toCanvasY(center.y);

      // Card Dimensions in scale
      const cardW = 380 * scale;
      const displayLogs = logs.slice(0, 3); // Top 3 logs
      const logItemHeight = 44 * scale;
      const headerHeight = 42 * scale;
      const footerExtra = logs.length > 3 ? 20 * scale : 0;
      const cardH = headerHeight + displayLogs.length * logItemHeight + 14 * scale + footerExtra;

      // Smart positioning: If target is in lower half of map, put box ABOVE; else BELOW
      const isBottomHalf = center.y > 700;
      let cardY;
      let arrowStartY;

      if (isBottomHalf) {
        cardY = targetY - cardH - 45 * scale;
        arrowStartY = cardY + cardH;
      } else {
        cardY = targetY + 45 * scale;
        arrowStartY = cardY;
      }

      // Clamp X position so card doesn't overflow left or right map borders
      let cardX = targetX - cardW / 2;
      const minX = 25 * scale;
      const maxX = totalWidth - cardW - 25 * scale;
      cardX = Math.max(minX, Math.min(maxX, cardX));

      const arrowStartX = Math.max(cardX + 30 * scale, Math.min(cardX + cardW - 30 * scale, targetX));

      ctx.save();

      // ==========================================
      // A. Draw Pointer Arrow / Leader Line
      // ==========================================
      // Outer Glow shadow for arrow line
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.lineWidth = 4 * scale;
      ctx.beginPath();
      ctx.moveTo(arrowStartX, arrowStartY);
      ctx.lineTo(targetX, targetY);
      ctx.stroke();

      // Sharp Core Leader Line
      ctx.strokeStyle = line.color || '#0f172a';
      ctx.lineWidth = 2.5 * scale;
      ctx.beginPath();
      ctx.moveTo(arrowStartX, arrowStartY);
      ctx.lineTo(targetX, targetY);
      ctx.stroke();

      // Arrowhead Triangle at Target Point
      const angle = Math.atan2(targetY - arrowStartY, targetX - arrowStartX);
      const headLen = 14 * scale;
      ctx.fillStyle = line.color || '#0f172a';
      ctx.beginPath();
      ctx.moveTo(targetX, targetY);
      ctx.lineTo(
        targetX - headLen * Math.cos(angle - Math.PI / 7),
        targetY - headLen * Math.sin(angle - Math.PI / 7)
      );
      ctx.lineTo(
        targetX - headLen * Math.cos(angle + Math.PI / 7),
        targetY - headLen * Math.sin(angle + Math.PI / 7)
      );
      ctx.closePath();
      ctx.fill();

      // Target anchor dot
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(targetX, targetY, 4 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2 * scale;
      ctx.stroke();

      // ==========================================
      // B. Draw Callout Box Container
      // ==========================================
      // Drop Shadow
      ctx.shadowColor = 'rgba(15, 23, 42, 0.22)';
      ctx.shadowBlur = 14 * scale;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 6 * scale;

      // Card Background
      ctx.fillStyle = '#ffffff';
      roundRect(ctx, cardX, cardY, cardW, cardH, 10 * scale);
      ctx.fill();

      // Reset shadow for inner elements
      ctx.shadowColor = 'transparent';

      // Card Border with track line accent color
      ctx.strokeStyle = line.color || '#334155';
      ctx.lineWidth = 2.2 * scale;
      roundRect(ctx, cardX, cardY, cardW, cardH, 10 * scale);
      ctx.stroke();

      // Left Accent Strip
      ctx.fillStyle = line.color || '#139a47';
      roundRectCustom(ctx, cardX, cardY, 6 * scale, cardH, 10 * scale, 0, 0, 10 * scale);
      ctx.fill();

      // Card Header Background Banner
      ctx.fillStyle = '#f8fafc';
      roundRectCustom(ctx, cardX + 6 * scale, cardY, cardW - 6 * scale, headerHeight, 0, 10 * scale, 0, 0);
      ctx.fill();

      // Header Divider Line
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1 * scale;
      ctx.beginPath();
      ctx.moveTo(cardX + 6 * scale, cardY + headerHeight);
      ctx.lineTo(cardX + cardW, cardY + headerHeight);
      ctx.stroke();

      // Header: Colored Dot
      const headerDotX = cardX + 18 * scale;
      const headerDotY = cardY + 21 * scale;
      ctx.fillStyle = line.color || '#139a47';
      ctx.beginPath();
      ctx.arc(headerDotX, headerDotY, 5 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Header: Track Title
      ctx.fillStyle = '#0f172a';
      ctx.font = `bold ${12 * scale}px sans-serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      const maxTitleW = cardW - 140 * scale;
      const titleText = truncateText(ctx, line.title || line.code, maxTitleW);
      ctx.fillText(titleText, cardX + 28 * scale, headerDotY - 3 * scale);

      // Header: KM Subtitle
      ctx.fillStyle = '#64748b';
      ctx.font = `bold ${8.5 * scale}px monospace`;
      ctx.fillText(line.km || '', cardX + 28 * scale, headerDotY + 9 * scale);

      // Header: Job Count Badge (Pill)
      const badgeW = 75 * scale;
      const badgeH = 18 * scale;
      const badgeX = cardX + cardW - badgeW - 10 * scale;
      const badgeY = cardY + 12 * scale;

      ctx.fillStyle = '#fef2f2';
      roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 6 * scale);
      ctx.fill();
      ctx.strokeStyle = '#fca5a5';
      ctx.lineWidth = 1 * scale;
      roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 6 * scale);
      ctx.stroke();

      ctx.fillStyle = '#b91c1c';
      ctx.font = `bold ${8.5 * scale}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${logs.length} Pekerjaan`, badgeX + badgeW / 2, badgeY + badgeH / 2);

      // ==========================================
      // C. Draw Work Log Items Inside Callout
      // ==========================================
      let currentLogY = cardY + headerHeight + 8 * scale;

      displayLogs.forEach((log, logIdx) => {
        const { dateStr, timeStr } = formatLogTimestamp(log.timestamp);

        // Subtle divider between log items
        if (logIdx > 0) {
          ctx.strokeStyle = '#f1f5f9';
          ctx.lineWidth = 1 * scale;
          ctx.beginPath();
          ctx.moveTo(cardX + 16 * scale, currentLogY - 4 * scale);
          ctx.lineTo(cardX + cardW - 16 * scale, currentLogY - 4 * scale);
          ctx.stroke();
        }

        // Row 1: Timestamp & Status
        ctx.textAlign = 'left';
        ctx.fillStyle = '#2563eb';
        ctx.font = `bold ${8.5 * scale}px monospace`;
        ctx.fillText(`🕒 ${dateStr} ${timeStr}`, cardX + 16 * scale, currentLogY + 6 * scale);

        // Status Tag
        const statusText = (log.status || 'SELESAI').toUpperCase();
        ctx.textAlign = 'right';
        ctx.fillStyle = statusText === 'PROGRESS' ? '#d97706' : '#15803d';
        ctx.font = `bold ${8 * scale}px sans-serif`;
        ctx.fillText(`✓ ${statusText}`, cardX + cardW - 16 * scale, currentLogY + 6 * scale);

        // Row 2: Action Name / Job Title
        ctx.textAlign = 'left';
        ctx.fillStyle = '#0f172a';
        ctx.font = `bold ${10 * scale}px sans-serif`;
        const actionTitle = truncateText(ctx, log.actionType || 'Pemeliharaan LAA', cardW - 32 * scale);
        ctx.fillText(actionTitle, cardX + 16 * scale, currentLogY + 20 * scale);

        // Row 3: Executor / Technician & Brief Note
        ctx.fillStyle = '#475569';
        ctx.font = `500 ${8.5 * scale}px sans-serif`;
        const techStr = log.technician ? `👷 ${log.technician}` : 'UPT 1.9';
        const descStr = log.description ? ` • ${log.description}` : '';
        const infoFull = truncateText(ctx, `${techStr}${descStr}`, cardW - 32 * scale);
        ctx.fillText(infoFull, cardX + 16 * scale, currentLogY + 32 * scale);

        currentLogY += logItemHeight;
      });

      // Extra note if more than 3 logs
      if (logs.length > 3) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = `italic bold ${8 * scale}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(`+ ${logs.length - 3} pekerjaan lainnya tercatat pada seksi ini`, cardX + cardW / 2, currentLogY + 4 * scale);
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
  showOfficialHeader = true,
  paperSize = 'A3', // 'A3' | 'A4' | 'NATIVE'
  quality = 0.95,
}) {
  const canvas = await renderUltraHdCanvas({
    linesWithLogs,
    showCallouts,
    showRadar,
    showOfficialHeader,
    scale: 2.0, // 300 DPI Ultra HD
  });

  // Convert canvas to JPEG blob
  const jpegBlob = await new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/jpeg', quality);
  });
  if (!jpegBlob) throw new Error('Failed to generate JPEG blob from canvas');

  const arrayBuffer = await jpegBlob.arrayBuffer();
  const jpegBuffer = new Uint8Array(arrayBuffer);

  // Determine Paper Dimensions in PDF Points (72 pt/inch)
  // A3 Landscape: 1190.55 x 841.89 pt (420 x 297 mm)
  // A4 Landscape: 841.89 x 595.28 pt (297 x 210 mm)
  let pageWPt = 1190.55;
  let pageHPt = 841.89;

  if (paperSize === 'A4') {
    pageWPt = 841.89;
    pageHPt = 595.28;
  } else if (paperSize === 'NATIVE') {
    pageWPt = 1200;
    pageHPt = (1200 * canvas.height) / canvas.width;
  }

  const pdfBytes = buildPdfFromJpegBuffer(jpegBuffer, canvas.width, canvas.height, pageWPt, pageHPt);
  const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });

  // Filename with timestamp
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const filename = `PETA_LAA_UPT_1.9_JATINEGARA_MONITORING_${dateStr}.pdf`;

  triggerDownload(pdfBlob, filename);
  return filename;
}

/**
 * 1-Click Direct Download Ultra HD PNG
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
    scale: 2.0,
  });

  const pngBlob = await new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png');
  });
  if (!pngBlob) throw new Error('Failed to generate PNG blob');

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const filename = `PETA_LAA_UPT_1.9_JATINEGARA_ULTRA_HD_${dateStr}.png`;

  triggerDownload(pngBlob, filename);
  return filename;
}

/**
 * Native Browser Print to PDF (Opens print dialog with vector layout)
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
    scale: 2.0,
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
        <title>PETA WILAYAH UPT RESOR LAA 1.9 JATINEGARA - CETAK PDF</title>
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
          body {
            background-color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100vw;
            height: 100vh;
            overflow: hidden;
          }
          img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
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
