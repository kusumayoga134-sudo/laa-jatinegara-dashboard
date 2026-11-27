import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  FileText,
  Printer,
  Download,
  Image as ImageIcon,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Info,
  Loader2,
  GripVertical,
} from 'lucide-react';
import {
  VIRTUAL_CANVAS,
  computeCalloutLayout,
  getElbowSvgPath,
  formatLogTimestamp,
  getCleanLogDetails,
  downloadMapPdf,
  downloadMapPng,
  printMapWindow,
} from '../utils/pdfExportEngine';

export default function PdfExportModal({
  isOpen,
  onClose,
  linesWithLogs = [],
}) {
  const { CANVAS_W, CANVAS_H, MAP_W, MAP_H, LANE_TOP_H, CAD_BASE_W, CAD_BASE_H } = VIRTUAL_CANVAS;

  const [paperSize, setPaperSize] = useState('NATIVE'); // 'NATIVE' (Default Rekomendasi CAD) | 'A3' | 'A4'
  const [showCallouts, setShowCallouts] = useState(true);
  const [showRadar, setShowRadar] = useState(true);

  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccessMsg, setExportSuccessMsg] = useState(null);

  // Manual Drag-and-Drop Positions: { [lineId]: { x, y } }
  const [customPositions, setCustomPositions] = useState({});
  const [draggingCardId, setDraggingCardId] = useState(null);
  const cardDragRef = useRef(null);
  const canvasPaperRef = useRef(null);

  // Preview Stage Zoom & Pan
  const [previewZoom, setPreviewZoom] = useState(1);
  const [previewPos, setPreviewPos] = useState({ x: 0, y: 0 });
  const [isDraggingStage, setIsDraggingStage] = useState(false);
  const stageDragStartRef = useRef({ x: 0, y: 0 });

  const previewContainerRef = useRef(null);
  const [containerDim, setContainerDim] = useState({ width: 1400, height: 700 });

  // Measure container dimensions for responsive fit-to-width
  useEffect(() => {
    if (!isOpen) return;
    const updateDim = () => {
      if (previewContainerRef.current) {
        const { clientWidth, clientHeight } = previewContainerRef.current;
        if (clientWidth > 100 && clientHeight > 100) {
          setContainerDim({ width: clientWidth, height: clientHeight });
        }
      }
    };
    updateDim();
    const timer = setTimeout(updateDim, 50);
    window.addEventListener('resize', updateDim);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateDim);
    };
  }, [isOpen]);

  // Fit scale: Fit native canvas (3275 x 1835) comfortably to ~94% width & height of the modal
  const fitScale = useMemo(() => {
    const padW = containerDim.width * 0.94;
    const padH = containerDim.height * 0.94;
    return Math.min(padW / CANVAS_W, padH / CANVAS_H);
  }, [containerDim, CANVAS_W, CANVAS_H]);

  const currentScale = fitScale * previewZoom;

  // Compute Active Callout Cards and Orthogonal Elbow Layout on the 3275 x 1835 Native AutoCAD Canvas
  const activeCards = useMemo(() => {
    if (!showCallouts || linesWithLogs.length === 0) return [];
    return computeCalloutLayout({
      linesWithLogs,
      customPositions,
    });
  }, [linesWithLogs, customPositions, showCallouts]);

  // Minimum & Maximum Preview Zoom (Strictly clamped between 100% and 1500%)
  const MIN_PREVIEW_ZOOM = 1.0;
  const MAX_PREVIEW_ZOOM = 15.0;

  const pinchRef = useRef({ distance: 0, initialZoom: 1 });

  // Mouse Wheel Zoom for preview stage
  useEffect(() => {
    const container = previewContainerRef.current;
    if (!container || !isOpen) return;

    const handleWheel = (e) => {
      e.preventDefault();
      e.stopPropagation();

      const zoomDelta = e.deltaY < 0 ? (previewZoom >= 3.0 ? 0.5 : 0.2) : (previewZoom > 3.0 ? -0.5 : -0.2);

      setPreviewZoom((prevZoom) => {
        const nextZoom = Math.min(Math.max(prevZoom + zoomDelta, MIN_PREVIEW_ZOOM), MAX_PREVIEW_ZOOM);
        const roundedZoom = parseFloat(nextZoom.toFixed(2));

        if (roundedZoom <= 1.0) {
          setPreviewPos({ x: 0, y: 0 });
        } else if (roundedZoom !== prevZoom) {
          const rect = container.getBoundingClientRect();
          const mouseX = e.clientX - rect.left - rect.width / 2;
          const mouseY = e.clientY - rect.top - rect.height / 2;
          const scaleRatio = roundedZoom / prevZoom;

          setPreviewPos((prevPos) => ({
            x: mouseX - (mouseX - prevPos.x) * scaleRatio,
            y: mouseY - (mouseY - prevPos.y) * scaleRatio,
          }));
        }

        return roundedZoom;
      });
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [isOpen, previewZoom]);

  // Zoom button handlers with smooth adaptive stepping
  const handleZoomIn = () =>
    setPreviewZoom((z) => {
      const step = z >= 4.0 ? 1.0 : (z >= 2.0 ? 0.5 : 0.25);
      return Math.min(parseFloat((z + step).toFixed(2)), MAX_PREVIEW_ZOOM);
    });

  const handleZoomOut = () =>
    setPreviewZoom((z) => {
      const step = z > 4.0 ? 1.0 : (z > 2.0 ? 0.5 : 0.25);
      const next = Math.max(parseFloat((z - step).toFixed(2)), MIN_PREVIEW_ZOOM);
      if (next <= 1.0) setPreviewPos({ x: 0, y: 0 });
      return next;
    });

  const handleResetZoom = () => {
    setPreviewZoom(1);
    setPreviewPos({ x: 0, y: 0 });
  };

  // Reset custom callout positions to default auto-layout safe corridors
  const handleResetCallouts = () => {
    setCustomPositions({});
  };

  // ========================================================
  // UNIFIED POINTER EVENTS CALLOUT DRAG-AND-DROP SYSTEM
  // ========================================================
  const handleCardPointerDown = (e, card) => {
    // 1. Only left click for mouse (or any touch/pen pointer)
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    // 2. Prevent stage panning & default browser drag/select
    e.preventDefault();
    e.stopPropagation();

    // 3. Compute ACTUAL rendered scale directly from the DOM canvas container
    const rect = canvasPaperRef.current?.getBoundingClientRect();
    const actualScale = rect && rect.width > 0 ? rect.width / CANVAS_W : currentScale;

    // 4. Capture pointer on target element
    const target = e.currentTarget;
    try {
      target.setPointerCapture(e.pointerId);
    } catch {}

    // 5. Store snapshot of drag start
    cardDragRef.current = {
      cardId: card.id,
      pointerId: e.pointerId,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startCardX: card.x,
      startCardY: card.y,
      cardW: card.w || VIRTUAL_CANVAS.CARD_W,
      cardH: card.h || VIRTUAL_CANVAS.CARD_H,
      actualScale: actualScale > 0 ? actualScale : 1,
      targetElement: target,
    };

    setDraggingCardId(card.id);
  };

  // Global Pointer Event Listeners for Callout Card Dragging (Deterministic 1:1 Tracking & Anti-Sticky Drag)
  useEffect(() => {
    if (!draggingCardId) return;

    const stopDragging = () => {
      const drag = cardDragRef.current;
      if (drag?.targetElement && drag.pointerId !== undefined) {
        try {
          drag.targetElement.releasePointerCapture(drag.pointerId);
        } catch {}
      }
      cardDragRef.current = null;
      setDraggingCardId(null);
    };

    const handlePointerMove = (e) => {
      // Obligatory Guard: If left mouse button was released anywhere, immediately stop dragging
      if (e.pointerType === 'mouse' && e.buttons === 0) {
        stopDragging();
        return;
      }

      const drag = cardDragRef.current;
      if (!drag) return;

      e.preventDefault();

      // Deterministic non-cumulative 1:1 calculation from snapshot
      const deltaX = (e.clientX - drag.startClientX) / drag.actualScale;
      const deltaY = (e.clientY - drag.startClientY) / drag.actualScale;

      const nextX = Math.max(0, Math.min(CANVAS_W - drag.cardW, Math.round(drag.startCardX + deltaX)));
      const nextY = Math.max(0, Math.min(CANVAS_H - drag.cardH, Math.round(drag.startCardY + deltaY)));

      setCustomPositions((prev) => ({
        ...prev,
        [drag.cardId]: { x: nextX, y: nextY },
      }));
    };

    const handlePointerUp = () => {
      stopDragging();
    };

    const handlePointerCancel = () => {
      stopDragging();
    };

    const handleWindowBlur = () => {
      stopDragging();
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: false });
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerCancel);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerCancel);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [draggingCardId]);

  // ========================================================
  // STAGE PANNING & PINCH-TO-ZOOM HANDLERS
  // ========================================================

  // Stage Mouse Down (Initiate Pan when zoomed on desktop)
  const handleStageMouseDown = (e) => {
    if (e.button !== 0) return;
    if (e.target.closest('[data-callout-card]')) return;
    setIsDraggingStage(true);
    stageDragStartRef.current = {
      x: e.clientX - previewPos.x,
      y: e.clientY - previewPos.y,
    };
  };

  const handleStageMouseMove = (e) => {
    if (!isDraggingStage) return;
    setPreviewPos({
      x: e.clientX - stageDragStartRef.current.x,
      y: e.clientY - stageDragStartRef.current.y,
    });
  };

  const handleStageMouseUp = () => {
    if (isDraggingStage) {
      setIsDraggingStage(false);
    }
  };

  // Mobile Touch Gestures on Preview Stage (Single-finger Pan & Two-finger Pinch Zoom)
  const handleTouchStart = (e) => {
    if (e.target.closest('[data-callout-card]') || e.target.closest('button') || e.target.closest('select')) {
      return;
    }

    if (e.touches.length === 1) {
      setIsDraggingStage(true);
      stageDragStartRef.current = {
        x: e.touches[0].clientX - previewPos.x,
        y: e.touches[0].clientY - previewPos.y,
      };
    } else if (e.touches.length === 2) {
      setIsDraggingStage(false);
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      pinchRef.current = {
        distance: dist,
        initialZoom: previewZoom,
        midX: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        midY: (e.touches[0].clientY + e.touches[1].clientY) / 2,
        initialPos: { ...previewPos },
      };
    }
  };

  const handleTouchMove = (e) => {
    if (draggingCardId) return;

    // Single finger: Pan stage
    if (e.touches.length === 1 && isDraggingStage) {
      setPreviewPos({
        x: e.touches[0].clientX - stageDragStartRef.current.x,
        y: e.touches[0].clientY - stageDragStartRef.current.y,
      });
    } else if (e.touches.length === 2 && pinchRef.current.distance > 0) {
      // Two fingers: Pinch-to-zoom (smooth zoom clamped between MIN_PREVIEW_ZOOM and MAX_PREVIEW_ZOOM)
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = dist / pinchRef.current.distance;
      const nextZoom = Math.min(Math.max(pinchRef.current.initialZoom * factor, MIN_PREVIEW_ZOOM), MAX_PREVIEW_ZOOM);
      const roundedZoom = parseFloat(nextZoom.toFixed(2));
      setPreviewZoom(roundedZoom);

      if (roundedZoom <= 1.0) {
        setPreviewPos({ x: 0, y: 0 });
      } else if (previewContainerRef.current) {
        const rect = previewContainerRef.current.getBoundingClientRect();
        const curMidX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const curMidY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        const focalX = curMidX - rect.left - rect.width / 2;
        const focalY = curMidY - rect.top - rect.height / 2;
        const scaleRatio = roundedZoom / pinchRef.current.initialZoom;

        const origFocalX = pinchRef.current.midX - rect.left - rect.width / 2;
        const origFocalY = pinchRef.current.midY - rect.top - rect.height / 2;

        setPreviewPos({
          x: focalX - (origFocalX - pinchRef.current.initialPos.x) * scaleRatio,
          y: focalY - (origFocalY - pinchRef.current.initialPos.y) * scaleRatio,
        });
      }
    }
  };

  const handleTouchEnd = (e) => {
    if (e.touches.length === 0) {
      setIsDraggingStage(false);
      pinchRef.current = { distance: 0, initialZoom: 1 };
    } else if (e.touches.length === 1 && !draggingCardId) {
      setIsDraggingStage(true);
      stageDragStartRef.current = {
        x: e.touches[0].clientX - previewPos.x,
        y: e.touches[0].clientY - previewPos.y,
      };
    }
  };

  // Prevent mobile browser page pulling while interacting with preview stage
  useEffect(() => {
    const el = previewContainerRef.current;
    if (!el) return;
    const preventTouchScroll = (e) => {
      if (e.touches.length > 0) {
        e.preventDefault();
      }
    };
    el.addEventListener('touchmove', preventTouchScroll, { passive: false });
    return () => el.removeEventListener('touchmove', preventTouchScroll);
  }, []);

  // Stage Mouse Up window fallback
  useEffect(() => {
    const handleWinMouseUp = () => {
      if (isDraggingStage) setIsDraggingStage(false);
    };
    window.addEventListener('mouseup', handleWinMouseUp);
    return () => window.removeEventListener('mouseup', handleWinMouseUp);
  }, [isDraggingStage]);

  // Export handlers
  const handleDownloadPdf = async () => {
    setIsExporting(true);
    try {
      const filename = await downloadMapPdf({
        linesWithLogs,
        showCallouts,
        showRadar,
        paperSize,
        quality: 0.96,
        customCardPositions: customPositions,
      });
      setExportSuccessMsg(`PDF berhasil diunduh: ${filename}`);
      setTimeout(() => setExportSuccessMsg(null), 4000);
    } catch (err) {
      alert('Gagal mengekspor PDF: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrintPdf = async () => {
    setIsExporting(true);
    try {
      await printMapWindow({
        linesWithLogs,
        showCallouts,
        showRadar,
        customCardPositions: customPositions,
      });
    } catch (err) {
      alert('Gagal mencetak dokumen: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadPng = async () => {
    setIsExporting(true);
    try {
      const filename = await downloadMapPng({
        linesWithLogs,
        showCallouts,
        showRadar,
        customCardPositions: customPositions,
      });
      setExportSuccessMsg(`Gambar Ultra HD berhasil diunduh: ${filename}`);
      setTimeout(() => setExportSuccessMsg(null), 4000);
    } catch (err) {
      alert('Gagal mengekspor PNG: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col w-full max-w-[1600px] h-[95vh] max-h-[980px] overflow-hidden text-slate-100">

        {/* ========================================================
            MODAL HEADER BAR
            ======================================================== */}
        <div className="px-3 sm:px-6 py-2.5 sm:py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0 gap-2">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            <div className="p-1.5 sm:p-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg sm:rounded-xl shrink-0 shadow-xs">
              <FileText className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h2 className="text-xs sm:text-base font-black text-white tracking-tight truncate">
                  Preview & Export PDF Peta LAA
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shrink-0">
                  <Sparkles className="w-2.5 h-2.5" /> Ultra HD 600 DPI
                </span>
              </div>
              <p className="hidden sm:block text-xs text-slate-400 mt-0.5 truncate">
                Format Cetak Blueprint Standar CAD • Lengkap dengan Titik Radar & Callout Riwayat Pekerjaan
              </p>
            </div>
          </div>

          {/* Action Buttons in Header */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={handlePrintPdf}
              disabled={isExporting}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition cursor-pointer active:scale-95 shadow-xs"
              title="Cetak Langsung atau Simpan sebagai PDF via Browser Print"
            >
              <Printer className="w-3.5 h-3.5 text-blue-400" />
              <span>Cetak / Print</span>
            </button>

            <button
              onClick={handleDownloadPng}
              disabled={isExporting}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition cursor-pointer active:scale-95 shadow-xs"
              title="Download Gambar Ultra HD Resolusi Penuh (PNG 600 DPI)"
            >
              <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
              <span>Gambar HD (PNG)</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="hidden sm:flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-md shadow-red-900/30 transition cursor-pointer active:scale-95 shrink-0"
              title="Download Dokumen PDF Standar CAD Ultra HD"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1 sm:p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg sm:rounded-xl transition cursor-pointer ml-0.5 sm:ml-1"
              title="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success Alert Banner if exported */}
        {exportSuccessMsg && (
          <div className="bg-emerald-950/80 border-b border-emerald-800/80 px-3 sm:px-4 py-1.5 text-[11px] sm:text-xs text-emerald-300 font-bold flex items-center justify-between animate-in slide-in-from-top-2">
            <span className="flex items-center gap-2 truncate">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">{exportSuccessMsg}</span>
            </span>
            <button onClick={() => setExportSuccessMsg(null)} className="text-emerald-400 hover:text-white shrink-0 ml-2">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ========================================================
            SETTINGS & TOOLBAR STRIP
            ======================================================== */}
        <div className="px-3 sm:px-6 py-2 bg-slate-950/70 border-b border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs shrink-0">

          {/* Options Toggles */}
          <div className="flex items-center gap-2.5 sm:gap-4 flex-wrap text-[11px] sm:text-xs">
            <label className="flex items-center gap-1.5 sm:gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showCallouts}
                onChange={(e) => setShowCallouts(e.target.checked)}
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded text-red-600 focus:ring-red-500 bg-slate-800 border-slate-700 cursor-pointer"
              />
              <span className="font-semibold text-slate-300 whitespace-nowrap">
                Callout Riwayat
              </span>
            </label>

            <label className="flex items-center gap-1.5 sm:gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showRadar}
                onChange={(e) => setShowRadar(e.target.checked)}
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded text-red-600 focus:ring-red-500 bg-slate-800 border-slate-700 cursor-pointer"
              />
              <span className="font-semibold text-slate-300 whitespace-nowrap">
                Titik Radar
              </span>
            </label>

            {/* Reset Callout Position Button */}
            {showCallouts && activeCards.length > 0 && (
              <button
                onClick={handleResetCallouts}
                disabled={Object.keys(customPositions).length === 0}
                className="flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[10px] sm:text-[11px] font-bold transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                title="Kembalikan posisi kotak callout ke tata letak aman otomatis (Auto-Layout)"
              >
                <RotateCcw className="w-3 h-3 text-amber-400" />
                <span>Reset Posisi</span>
                {Object.keys(customPositions).length > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                )}
              </button>
            )}
          </div>

          {/* Right Tools: Paper Format Selector & Preview Zoom */}
          <div className="flex items-center justify-between md:justify-end gap-2 w-full md:w-auto">
            <div className="flex items-center gap-1.5 min-w-0 max-w-[62%] sm:max-w-none">
              <span className="text-slate-400 font-semibold text-[10.5px] sm:text-[11px] shrink-0">Kertas:</span>
              <select
                value={paperSize}
                onChange={(e) => setPaperSize(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-200 text-[10.5px] sm:text-xs font-bold rounded-lg px-2 py-1 focus:ring-1 focus:ring-red-500 outline-none cursor-pointer truncate max-w-full"
              >
                <option value="NATIVE">Format Asli CAD Model 2 (3.275 × 1.835 px)</option>
                <option value="A3">A3 Landscape (Standar Gambar Teknik)</option>
                <option value="A4">A4 Landscape</option>
              </select>
            </div>

            {/* Preview Zoom Controls */}
            <div className="flex items-center space-x-0.5 sm:space-x-1 bg-slate-800/80 rounded-xl p-0.5 sm:p-1 border border-slate-700/80 shrink-0">
              <button
                onClick={handleZoomOut}
                disabled={previewZoom <= MIN_PREVIEW_ZOOM}
                className="p-1 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition disabled:opacity-40 cursor-pointer"
                title="Perkecil Preview"
              >
                <ZoomOut className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold px-1 text-slate-300 min-w-8 text-center">
                {Math.round(previewZoom * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                disabled={previewZoom >= MAX_PREVIEW_ZOOM}
                className="p-1 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition disabled:opacity-40 cursor-pointer"
                title="Perbesar Preview"
              >
                <ZoomIn className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
              <button
                onClick={handleResetZoom}
                className="p-1 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================
            MAIN LIVE PREVIEW STAGE (3275 x 1835 NATIVE AUTOCAD CANVAS)
            ======================================================== */}
        <div
          ref={previewContainerRef}
          onMouseDown={handleStageMouseDown}
          onMouseMove={handleStageMouseMove}
          onMouseUp={handleStageMouseUp}
          onMouseLeave={handleStageMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          className="flex-1 bg-slate-950 p-2 sm:p-4 overflow-hidden relative flex items-center justify-center select-none"
          style={{
            touchAction: 'none',
            cursor: draggingCardId
              ? 'grabbing'
              : previewZoom > 1
              ? isDraggingStage
                ? 'grabbing'
                : 'grab'
              : 'default',
          }}
        >
          {/* Unified Stage Wrapper with Single-Pass Transform (Preserves full HD crispness & 15x zoom clarity) */}
          <div
            style={{
              transform: `translate(${previewPos.x}px, ${previewPos.y}px) scale(${currentScale})`,
              transformOrigin: 'center center',
              transition: (isDraggingStage || draggingCardId || pinchRef.current.distance > 0) ? 'none' : 'transform 0.12s ease-out',
            }}
            className="relative flex items-center justify-center shrink-0"
          >
            {/* 3275 x 1835 Native AutoCAD Model 2 Canvas Paper Container */}
            <div
              ref={canvasPaperRef}
              style={{
                width: `${CANVAS_W}px`,
                height: `${CANVAS_H}px`,
              }}
              className="bg-white border-2 border-slate-700 relative overflow-hidden shadow-2xl shrink-0"
            >
              {/* 1. CAD Blueprint Map Image Native AutoCAD Model 2 */}
              <img
                src="/peta-laa-cropped-hd.png?v=model2"
                alt="Peta Wilayah LAA UPT Resor 1.9 Jatinegara"
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width: `${CANVAS_W}px`,
                  height: `${CANVAS_H}px`,
                  objectFit: 'contain',
                  pointerEvents: 'none',
                  userSelect: 'none',
                  imageRendering: 'high-quality',
                }}
                draggable={false}
              />

              {/* 2. Radar Glow Beacons (clean point beacons, without covering CAD track lines) */}
              {showRadar &&
                activeCards.map((card) => {
                  const cx = card.radarX;
                  const cy = card.radarY;
                  const count = card.logs.length;
                  return (
                    <div
                      key={`radar-${card.id}`}
                      style={{
                        position: 'absolute',
                        left: `${cx}px`,
                        top: `${cy}px`,
                        transform: 'translate(-50%, -50%)',
                        pointerEvents: 'none',
                        zIndex: 15,
                      }}
                      className="flex items-center justify-center"
                    >
                      {/* Outer Pulsing Halo */}
                      <span className="absolute w-10 h-10 rounded-full bg-red-500/25 animate-ping opacity-75" />
                      <span className="absolute w-7 h-7 rounded-full border-2 border-red-500/80" />
                      {/* Center Pip */}
                      <span className="w-3.5 h-3.5 rounded-full bg-red-600 border-2 border-white shadow-md" />
                      {/* Count Badge */}
                      {count > 1 && (
                        <span className="absolute -top-3 -right-3 px-1.5 py-0.5 rounded-full bg-red-700 text-white font-extrabold text-[9px] shadow-sm leading-none border border-white">
                          {count}
                        </span>
                      )}
                    </div>
                  );
                })}

              {/* 3. SVG Layer: Slim Orthogonal (Elbow) Leader Lines & Arrowheads (viewBox 0 0 3275 1835) */}
              {showCallouts && activeCards.length > 0 && (
                <svg
                  viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  style={{ zIndex: 20 }}
                >
                  {activeCards.map((card) => {
                    const svgPath = getElbowSvgPath(card);
                    const beaconRadius = 8;
                    const arrowEndY = card.isUpper ? card.radarY - beaconRadius : card.radarY + beaconRadius;
                    const headLen = 5.5;
                    const headW = 3.3;

                    return (
                      <g key={`arrow-${card.id}`}>
                        {/* Outer White Halo (protective outline) */}
                        <path
                          d={svgPath}
                          fill="none"
                          stroke="#ffffff"
                          strokeWidth="2.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        {/* Slim Red Leader Line (technical CAD leader line) */}
                        <path
                          d={svgPath}
                          fill="none"
                          stroke="#dc2626"
                          strokeWidth="1.35"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                        {/* Architectural Arrowhead */}
                        <polygon
                          points={
                            card.isUpper
                              ? `${card.radarX},${arrowEndY} ${card.radarX - headW},${arrowEndY - headLen} ${card.radarX},${arrowEndY - headLen * 0.75} ${card.radarX + headW},${arrowEndY - headLen}`
                              : `${card.radarX},${arrowEndY} ${card.radarX - headW},${arrowEndY + headLen} ${card.radarX},${arrowEndY + headLen * 0.75} ${card.radarX + headW},${arrowEndY + headLen}`
                          }
                          fill="#dc2626"
                        />

                        {/* Base Anchor Dot */}
                        <circle cx={card.startX} cy={card.startY} r="2.2" fill="#dc2626" />
                        <circle cx={card.startX} cy={card.startY} r="1.0" fill="#ffffff" />
                      </g>
                    );
                  })}
                </svg>
              )}

              {/* 5. Interactive Draggable Callout Cards */}
              {showCallouts &&
                activeCards.map((card) => {
                  const isDraggingThis = draggingCardId === card.id;
                  const trackColor = card.line.color || '#334155';

                  return (
                    <div
                      key={card.id}
                      data-callout-card="true"
                      onPointerDown={(e) => handleCardPointerDown(e, card)}
                      draggable={false}
                      style={{
                        position: 'absolute',
                        left: `${card.x}px`,
                        top: `${card.y}px`,
                        width: `${card.w}px`,
                        height: `${card.h}px`,
                        cursor: isDraggingThis ? 'grabbing' : 'grab',
                        zIndex: isDraggingThis ? 50 : 30,
                        touchAction: 'none',
                        userSelect: 'none',
                      }}
                      className={`rounded-[4px] bg-white border ${
                        isDraggingThis
                          ? 'ring-2 ring-blue-500 shadow-lg scale-[1.02] border-blue-500'
                          : 'border-slate-300 shadow-md hover:shadow-lg hover:border-slate-400'
                      } select-none overflow-hidden flex flex-col transition-shadow`}
                    >
                      {/* Left Accent Bar (Compact CAD 2.5px) */}
                      <div
                        className="absolute left-0 top-0 bottom-0 w-[2.5px]"
                        style={{ backgroundColor: trackColor }}
                      />

                      {/* Header Compact CAD (Tanpa badge Pkj; padding 2.5px vertikal, 5-7px horizontal) */}
                      <div
                        className="bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-1 pl-[7px] pr-[5px] py-[2.5px] shrink-0"
                        style={{ minHeight: `${card.headerH || 14}px` }}
                      >
                        <div className="flex items-center gap-1 min-w-0 flex-1">
                          <span
                            className="w-[5px] h-[5px] rounded-full shrink-0 border border-white shadow-2xs"
                            style={{ backgroundColor: trackColor }}
                          />
                          <span
                            className="font-bold text-[6.8px] leading-[8.2px] text-slate-900 whitespace-normal break-words"
                            title={card.line.title || card.line.code}
                          >
                            {card.line.title || card.line.code}
                          </span>
                        </div>

                        <GripVertical className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                      </div>

                      {/* Body Work Log Items (Compact CAD tight vertical packing, 0 ellipsis) */}
                      <div className="pl-[7px] pr-[5px] py-[3px] flex-1 flex flex-col justify-start bg-white overflow-hidden">
                        {card.displayLogs.map((log, idx) => {
                          const { actionName, timeLabel, kilometer, description, hasDescription } = getCleanLogDetails(log, card.line);
                          const subLine = [timeLabel, kilometer].filter(Boolean).join(' • ');

                          return (
                            <div
                              key={idx}
                              className={idx > 0 ? 'border-t border-slate-200/80 mt-[2px] pt-[2px]' : ''}
                            >
                              {/* Baris 1: Jenis Pekerjaan */}
                              <div
                                className="font-bold text-[6.4px] leading-[7.6px] text-slate-900 whitespace-normal break-words"
                                title={actionName}
                              >
                                {actionName}
                              </div>
                              {/* Baris 2: BULAN TAHUN • KILOMETER */}
                              {subLine && (
                                <div
                                  className="text-[5.8px] leading-[7px] font-medium text-slate-600 whitespace-normal break-words mt-[1px]"
                                  title={subLine}
                                >
                                  {subLine}
                                </div>
                              )}
                              {/* Baris 3: Uraian (Hanya tampil jika bukan '-') */}
                              {hasDescription && (
                                <div
                                  className="text-[5.6px] leading-[6.8px] font-semibold text-blue-700 whitespace-normal break-words mt-[1px]"
                                  title={description}
                                >
                                  {description}
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {/* Footer: +N pekerjaan lainnya (jika logs > 3) */}
                        {card.logs.length > 3 && (
                          <div className="text-center text-[5.5px] leading-[7px] font-semibold italic text-slate-400 border-t border-slate-200/80 mt-[2px] pt-[1px]">
                            + {card.logs.length - 3} pekerjaan lainnya
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Quick Helper Pill at Bottom */}
          <div className="absolute bottom-4 left-6 bg-slate-900/90 backdrop-blur-md border border-slate-800 text-[11px] text-slate-400 px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2 pointer-events-none">
            <Info className="w-3.5 h-3.5 text-blue-400" />
            <span>
              {linesWithLogs.length} lokasi berpenanda • Geser (drag) kotak callout bebas di layar preview • Panah siku merah otomatis mengikuti.
            </span>
          </div>
        </div>

        {/* ========================================================
            MODAL FOOTER SUMMARY & ACTION BAR
            ======================================================== */}
        <div className="px-3 sm:px-6 py-2.5 sm:py-3 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 shrink-0 gap-2">
          {/* Dimension Info Summary (Compact on mobile) */}
          <div className="flex items-center space-x-1.5 text-[10px] sm:text-xs text-slate-400 w-full sm:w-auto justify-center sm:justify-start overflow-hidden truncate">
            <span className="font-mono text-slate-300 font-bold shrink-0">Model 2:</span>
            <span className="truncate">3.275 × 1.835 px</span>
            <span>•</span>
            <span className="text-emerald-400 font-bold shrink-0">600 DPI Ultra HD</span>
            {Object.keys(customPositions).length > 0 && (
              <>
                <span>•</span>
                <span className="text-amber-400 font-bold shrink-0">
                  {Object.keys(customPositions).length} disesuaikan
                </span>
              </>
            )}
          </div>

          {/* Action Buttons: 3 Kotak Berukuran Sama (Cetak, PNG HD, Download PDF) */}
          <div className="grid grid-cols-3 gap-2 w-full sm:w-auto sm:flex sm:items-center sm:gap-2.5">
            <button
              onClick={handlePrintPdf}
              disabled={isExporting}
              className="h-9 w-full sm:w-34 flex items-center justify-center gap-1.5 px-2 sm:px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] sm:text-xs font-bold transition cursor-pointer active:scale-95 shadow-xs"
              title="Cetak Langsung atau Simpan sebagai PDF via Browser Print"
            >
              <Printer className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="truncate">Cetak</span>
            </button>

            <button
              onClick={handleDownloadPng}
              disabled={isExporting}
              className="h-9 w-full sm:w-34 flex items-center justify-center gap-1.5 px-2 sm:px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] sm:text-xs font-bold transition cursor-pointer active:scale-95 shadow-xs"
              title="Download Gambar Ultra HD Resolusi Penuh (PNG 600 DPI)"
            >
              <ImageIcon className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="truncate">PNG HD</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="h-9 w-full sm:w-34 flex items-center justify-center gap-1.5 px-2 sm:px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white border border-red-500 font-extrabold text-[11px] sm:text-xs transition cursor-pointer shadow-md shadow-red-900/30 active:scale-95"
              title="Download Dokumen PDF Standar CAD Ultra HD 600 DPI"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                  <span className="truncate">Proses...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Download PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
