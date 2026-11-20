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
  renderUltraHdCanvas,
  downloadMapPdf,
  downloadMapPng,
  printMapWindow,
  formatLogTimestamp,
  computeCalloutLayout,
  getElbowSvgPath,
} from '../utils/pdfExportEngine';

export default function PdfExportModal({
  isOpen,
  onClose,
  linesWithLogs = [],
}) {
  const [paperSize, setPaperSize] = useState('NATIVE'); // 'NATIVE' (Default Rekomendasi CAD) | 'A3' | 'A4'
  const [showCallouts, setShowCallouts] = useState(true);
  const [showRadar, setShowRadar] = useState(true);
  const showOfficialHeader = false;

  const [baseMapDataUrl, setBaseMapDataUrl] = useState(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccessMsg, setExportSuccessMsg] = useState(null);

  // Manual Drag-and-Drop Positions: { [lineId]: { x, y } }
  const [customPositions, setCustomPositions] = useState({});
  const [draggingCardId, setDraggingCardId] = useState(null);
  const dragStartRef = useRef({ clientX: 0, clientY: 0, cardX: 0, cardY: 0 });

  // Preview Stage Zoom & Pan
  const [previewZoom, setPreviewZoom] = useState(1);
  const [previewPos, setPreviewPos] = useState({ x: 0, y: 0 });
  const [isDraggingStage, setIsDraggingStage] = useState(false);
  const stageDragStartRef = useRef({ x: 0, y: 0 });

  const previewContainerRef = useRef(null);
  const stageRef = useRef(null);
  const [containerDim, setContainerDim] = useState({ width: 1200, height: 600 });

  const autoExpand = linesWithLogs.length > 10;
  const baseWidth = 3275;
  const baseHeight = autoExpand ? 1699 : 1419;
  const mapYOffset = autoExpand ? 140 : 0;

  // Track parent container resize to calculate fitScale
  useEffect(() => {
    if (!previewContainerRef.current) return;
    const updateDim = () => {
      if (previewContainerRef.current) {
        const { clientWidth, clientHeight } = previewContainerRef.current;
        setContainerDim({ width: clientWidth, height: clientHeight });
      }
    };
    updateDim();
    window.addEventListener('resize', updateDim);
    return () => window.removeEventListener('resize', updateDim);
  }, [isOpen]);

  const fitScale = useMemo(() => {
    const padX = 40;
    const padY = 40;
    const availW = Math.max(300, containerDim.width - padX);
    const availH = Math.max(200, containerDim.height - padY);
    return Math.min(availW / baseWidth, availH / baseHeight);
  }, [containerDim, baseWidth, baseHeight]);

  // Compute Active Callout Cards and Orthogonal Elbow Layout
  const activeCards = useMemo(() => {
    if (!showCallouts || linesWithLogs.length === 0) return [];
    return computeCalloutLayout({
      linesWithLogs,
      customPositions,
      baseWidth: 3275,
      baseHeight: 1419,
      mapYOffset,
      scale: 1.0,
      expandCanvasForManyLogs: autoExpand,
    });
  }, [linesWithLogs, customPositions, showCallouts, autoExpand, mapYOffset]);

  // Generate Base Map (CAD Blueprint + Glows + Radar Beacons)
  useEffect(() => {
    if (!isOpen) return;
    let isCancelled = false;
    setIsGeneratingPreview(true);

    const generate = async () => {
      try {
        const canvas = await renderUltraHdCanvas({
          linesWithLogs,
          showCallouts: false, // Callout cards rendered interactively on top!
          showRadar,
          showOfficialHeader,
          scale: 1.2, // Lightweight, super crisp 1.2x scale for instant preview
          expandCanvasForManyLogs: autoExpand,
        });

        if (!isCancelled) {
          setBaseMapDataUrl(canvas.toDataURL('image/jpeg', 0.88));
          setIsGeneratingPreview(false);
        }
      } catch (err) {
        console.error('Failed to generate base preview canvas:', err);
        if (!isCancelled) setIsGeneratingPreview(false);
      }
    };

    generate();
    return () => {
      isCancelled = true;
    };
  }, [isOpen, linesWithLogs, showRadar, showOfficialHeader, autoExpand]);

  // Mouse Wheel Zoom for preview stage
  useEffect(() => {
    const container = previewContainerRef.current;
    if (!container || !isOpen) return;

    const handleWheel = (e) => {
      e.preventDefault();
      e.stopPropagation();

      const zoomDelta = e.deltaY < 0 ? 0.2 : -0.2;

      setPreviewZoom((prevZoom) => {
        const nextZoom = Math.min(Math.max(prevZoom + zoomDelta, 0.5), 5.0);
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
  }, [isOpen]);

  // Zoom button handlers
  const handleZoomIn = () => setPreviewZoom((z) => Math.min(z + 0.25, 4));
  const handleZoomOut = () => setPreviewZoom((z) => Math.max(z - 0.25, 0.5));
  const handleResetZoom = () => {
    setPreviewZoom(1);
    setPreviewPos({ x: 0, y: 0 });
  };

  // Reset custom callout positions to default auto-layout safe corridors
  const handleResetCallouts = () => {
    setCustomPositions({});
  };

  // Card Mouse Down (Initiate Drag-and-Drop)
  const handleCardMouseDown = (e, card) => {
    e.preventDefault();
    e.stopPropagation(); // Never trigger stage panning!
    setDraggingCardId(card.id);
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      cardX: card.x,
      cardY: card.y,
    };
  };

  // Stage Mouse Down (Initiate Pan when zoomed)
  const handleStageMouseDown = (e) => {
    if (previewZoom <= 1) return;
    setIsDraggingStage(true);
    stageDragStartRef.current = {
      x: e.clientX - previewPos.x,
      y: e.clientY - previewPos.y,
    };
  };

  // Container Mouse Move (Dispatches to either card dragging or stage panning)
  const handleContainerMouseMove = (e) => {
    if (draggingCardId) {
      const currentScale = fitScale * previewZoom;
      const dx = (e.clientX - dragStartRef.current.clientX) / currentScale;
      const dy = (e.clientY - dragStartRef.current.clientY) / currentScale;

      setCustomPositions((prev) => ({
        ...prev,
        [draggingCardId]: {
          x: Math.round(dragStartRef.current.cardX + dx),
          y: Math.round(dragStartRef.current.cardY + dy),
        },
      }));
      return;
    }

    if (isDraggingStage) {
      setPreviewPos({
        x: e.clientX - stageDragStartRef.current.x,
        y: e.clientY - stageDragStartRef.current.y,
      });
    }
  };

  // Container Mouse Up
  const handleContainerMouseUp = () => {
    if (draggingCardId) {
      setDraggingCardId(null);
    }
    if (isDraggingStage) {
      setIsDraggingStage(false);
    }
  };

  // Window-level mouseup fallback
  useEffect(() => {
    const handleWinMouseUp = () => {
      setDraggingCardId(null);
      setIsDraggingStage(false);
    };
    window.addEventListener('mouseup', handleWinMouseUp);
    return () => window.removeEventListener('mouseup', handleWinMouseUp);
  }, []);

  // Export handlers
  const handleDownloadPdf = async () => {
    setIsExporting(true);
    try {
      const filename = await downloadMapPdf({
        linesWithLogs,
        showCallouts,
        showRadar,
        showOfficialHeader,
        paperSize,
        quality: 0.96,
        customCardPositions: customPositions,
        expandCanvasForManyLogs: autoExpand,
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
        showOfficialHeader,
        customCardPositions: customPositions,
        expandCanvasForManyLogs: autoExpand,
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
        showOfficialHeader,
        customCardPositions: customPositions,
        expandCanvasForManyLogs: autoExpand,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col w-full max-w-[1550px] h-[94vh] max-h-[960px] overflow-hidden text-slate-100">

        {/* ========================================================
            MODAL HEADER BAR
            ======================================================== */}
        <div className="px-4 sm:px-6 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0 gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl shadow-xs">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-white tracking-tight">
                  Preview & Export PDF Peta Monitoring Wilayah LAA
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <Sparkles className="w-2.5 h-2.5" /> Ultra HD 600 DPI
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Format Cetak Resmi Standar Blueprint CAD • Lengkap dengan Titik Radar & Callout Riwayat Pekerjaan
              </p>
            </div>
          </div>

          {/* Action Buttons in Header */}
          <div className="flex items-center gap-2">
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
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-md shadow-red-900/30 transition cursor-pointer active:scale-95"
              title="Download Dokumen PDF Standar CAD Ultra HD"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Memproses PDF...</span>
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
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer ml-1"
              title="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success Alert Banner if exported */}
        {exportSuccessMsg && (
          <div className="bg-emerald-950/80 border-b border-emerald-800/80 px-4 py-2 text-xs text-emerald-300 font-bold flex items-center justify-between animate-in slide-in-from-top-2">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {exportSuccessMsg}
            </span>
            <button onClick={() => setExportSuccessMsg(null)} className="text-emerald-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ========================================================
            SETTINGS & TOOLBAR STRIP
            ======================================================== */}
        <div className="px-4 sm:px-6 py-2 bg-slate-950/70 border-b border-slate-800/80 flex items-center justify-between flex-wrap gap-2.5 text-xs shrink-0">

          {/* Options Toggles */}
          <div className="flex items-center gap-4 flex-wrap">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showCallouts}
                onChange={(e) => setShowCallouts(e.target.checked)}
                className="w-4 h-4 rounded text-red-600 focus:ring-red-500 bg-slate-800 border-slate-700 cursor-pointer"
              />
              <span className="font-semibold text-slate-300">
                Kotak Callout Riwayat + Panah
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showRadar}
                onChange={(e) => setShowRadar(e.target.checked)}
                className="w-4 h-4 rounded text-red-600 focus:ring-red-500 bg-slate-800 border-slate-700 cursor-pointer"
              />
              <span className="font-semibold text-slate-300">
                Titik Radar Glow Kedip
              </span>
            </label>

            {/* Reset Callout Position Button */}
            {showCallouts && activeCards.length > 0 && (
              <button
                onClick={handleResetCallouts}
                disabled={Object.keys(customPositions).length === 0}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-bold transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ml-1"
                title="Kembalikan posisi kotak callout ke tata letak aman otomatis (Auto-Layout)"
              >
                <RotateCcw className="w-3 h-3 text-amber-400" />
                <span>Reset Posisi Callout</span>
                {Object.keys(customPositions).length > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                )}
              </button>
            )}
          </div>

          {/* Right Tools: Paper Format Selector & Preview Zoom */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-semibold text-[11px]">Format Kertas:</span>
              <select
                value={paperSize}
                onChange={(e) => setPaperSize(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-lg px-2.5 py-1 focus:ring-1 focus:ring-red-500 outline-none cursor-pointer"
              >
                <option value="NATIVE">Format Asli CAD - Ultra HD 600 DPI (9.825 x 4.257 px) (Rekomendasi)</option>
                <option value="A3">A3 Landscape (Standard Gambar Teknik)</option>
                <option value="A4">A4 Landscape</option>
              </select>
            </div>

            {/* Preview Zoom Controls */}
            <div className="flex items-center space-x-1 bg-slate-800/80 rounded-xl p-1 border border-slate-700/80">
              <button
                onClick={handleZoomOut}
                disabled={previewZoom <= 0.5}
                className="p-1 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition disabled:opacity-40 cursor-pointer"
                title="Perkecil Preview"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono font-bold px-1.5 text-slate-300 min-w-10 text-center">
                {Math.round(previewZoom * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                disabled={previewZoom >= 4}
                className="p-1 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition disabled:opacity-40 cursor-pointer"
                title="Perbesar Preview"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleResetZoom}
                className="p-1 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================
            MAIN LIVE PREVIEW STAGE (DRAGGABLE & ORTHOGONAL CONNECTORS)
            ======================================================== */}
        <div
          ref={previewContainerRef}
          onMouseDown={handleStageMouseDown}
          onMouseMove={handleContainerMouseMove}
          onMouseUp={handleContainerMouseUp}
          onMouseLeave={handleContainerMouseUp}
          className="flex-1 bg-slate-950 p-3 sm:p-6 overflow-hidden relative flex items-center justify-center select-none"
          style={{
            cursor: draggingCardId
              ? 'grabbing'
              : previewZoom > 1
              ? isDraggingStage
                ? 'grabbing'
                : 'grab'
              : 'default',
          }}
        >
          {isGeneratingPreview ? (
            <div className="flex flex-col items-center justify-center space-y-3 text-slate-400">
              <Loader2 className="w-10 h-10 animate-spin text-red-500" />
              <p className="font-bold text-xs">Menyiapkan Preview Dokumen Ultra HD 600 DPI (9.825 × 4.257 px)...</p>
            </div>
          ) : baseMapDataUrl ? (
            <div
              ref={stageRef}
              className="relative shadow-2xl rounded-none border border-slate-700 bg-white"
              style={{
                width: `${baseWidth}px`,
                height: `${baseHeight}px`,
                transform: `translate(${previewPos.x}px, ${previewPos.y}px) scale(${fitScale * previewZoom})`,
                transformOrigin: 'center center',
              }}
            >
              {/* 1. Base CAD Map with Glows & Radar Beacons */}
              <img
                src={baseMapDataUrl}
                alt="Preview Dokumen Peta Monitoring LAA"
                className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
                draggable={false}
              />

              {/* 2. SVG Layer: Orthogonal (Elbow) Leader Lines & Arrowheads */}
              {showCallouts && activeCards.length > 0 && (
                <svg
                  viewBox={`0 0 ${baseWidth} ${baseHeight}`}
                  className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
                >
                  {activeCards.map((card) => {
                    const svgPath = getElbowSvgPath(card, 1.0);
                    const beaconRadius = 11;
                    const arrowEndY = card.isUpper ? card.targetY - beaconRadius : card.targetY + beaconRadius;
                    const headLen = 8;
                    const headW = 5;

                    return (
                      <g key={`arrow-${card.id}`}>
                        {/* Outer White Halo */}
                        <path
                          d={svgPath}
                          fill="none"
                          stroke="#ffffff"
                          strokeWidth="4.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        {/* Soft Slate Shadow */}
                        <path
                          d={svgPath}
                          fill="none"
                          stroke="rgba(15, 23, 42, 0.20)"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        {/* Sharp Core Leader Line */}
                        <path
                          d={svgPath}
                          fill="none"
                          stroke="#0f172a"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                        {/* Architectural Arrowhead pointing at radar target */}
                        <polygon
                          points={
                            card.isUpper
                              ? `${card.targetX},${arrowEndY} ${card.targetX - headW},${arrowEndY - headLen} ${card.targetX},${arrowEndY - headLen * 0.7} ${card.targetX + headW},${arrowEndY - headLen}`
                              : `${card.targetX},${arrowEndY} ${card.targetX - headW},${arrowEndY + headLen} ${card.targetX},${arrowEndY + headLen * 0.7} ${card.targetX + headW},${arrowEndY + headLen}`
                          }
                          fill="#0f172a"
                        />

                        {/* Base Anchor Pin */}
                        <circle cx={card.startX} cy={card.startY} r="3" fill="#0f172a" />
                        <circle cx={card.startX} cy={card.startY} r="1.3" fill="#ffffff" />
                      </g>
                    );
                  })}
                </svg>
              )}

              {/* 3. Interactive Draggable Callout Cards */}
              {showCallouts &&
                activeCards.map((card) => {
                  const isDraggingThis = draggingCardId === card.id;
                  const trackColor = card.line.color || '#334155';

                  return (
                    <div
                      key={card.id}
                      onMouseDown={(e) => handleCardMouseDown(e, card)}
                      style={{
                        position: 'absolute',
                        left: `${card.x}px`,
                        top: `${card.y}px`,
                        width: `${card.cardW}px`,
                        height: `${card.cardH}px`,
                        cursor: isDraggingThis ? 'grabbing' : 'grab',
                        zIndex: isDraggingThis ? 60 : 30,
                      }}
                      className={`rounded-lg bg-white border ${
                        isDraggingThis
                          ? 'ring-2 ring-blue-500 shadow-2xl scale-[1.02] border-blue-500'
                          : 'border-slate-300 shadow-lg hover:shadow-xl hover:border-slate-400'
                      } transition-shadow select-none overflow-hidden flex flex-col`}
                    >
                      {/* Left Accent Bar */}
                      <div
                        className="absolute left-0 top-0 bottom-0 w-[3.5px]"
                        style={{ backgroundColor: trackColor }}
                      />

                      {/* Header */}
                      <div className="h-[22px] bg-slate-50 border-b border-slate-200/80 flex items-center justify-between px-2 pl-3 shrink-0">
                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                          <span
                            className="w-2 h-2 rounded-full shrink-0 border border-white"
                            style={{ backgroundColor: trackColor }}
                          />
                          <span className="font-bold text-[8.5px] text-slate-900 truncate leading-none">
                            {card.line.title || card.line.code}
                          </span>
                          <span className="font-mono text-[6.5px] text-slate-500 shrink-0">
                            {card.line.km || ''}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 ml-1">
                          <span className="px-1.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[6.5px] font-bold text-slate-700 flex items-center gap-0.5">
                            <span className="w-1 h-1 rounded-full bg-blue-500" />
                            {card.logs.length}
                          </span>
                          <GripVertical className="w-2.5 h-2.5 text-slate-400" />
                        </div>
                      </div>

                      {/* Work log items */}
                      <div className="p-1.5 pl-3 flex-1 flex flex-col justify-center space-y-1">
                        {card.displayLogs.map((log, idx) => {
                          const { dateStr, timeStr } = formatLogTimestamp(log.createdAt || log.timestamp);
                          const status = (log.status || 'DONE').toUpperCase();
                          const isCompleted = status === 'DONE' || status === 'COMPLETED';
                          const isInProgress = status === 'IN_PROGRESS' || status === 'PROGRESS';

                          return (
                            <div key={idx} className="leading-tight">
                              <div className="flex items-center justify-between text-[6px] font-mono text-slate-500">
                                <span>
                                  {dateStr} • {timeStr}
                                </span>
                                <span
                                  className={`px-1 py-0.2 rounded font-bold ${
                                    isCompleted
                                      ? 'bg-emerald-50 text-emerald-700'
                                      : isInProgress
                                      ? 'bg-amber-50 text-amber-700'
                                      : 'bg-slate-100 text-slate-700'
                                  }`}
                                >
                                  {isCompleted ? 'SELESAI' : isInProgress ? 'PROSES' : status}
                                </span>
                              </div>
                              <div className="font-bold text-[7px] text-slate-900 truncate">
                                {log.actionType || 'Pemeliharaan LAA'}
                              </div>
                              <div className="text-[5.8px] text-slate-600 truncate flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-slate-400" />
                                <span>
                                  {log.technician || 'UPT Resor 1.9'}
                                  {log.description ? ` • ${log.description}` : ''}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="text-slate-400 text-xs">Gagal memuat preview peta</div>
          )}

          {/* Quick Helper Pill at Bottom */}
          <div className="absolute bottom-4 left-6 bg-slate-900/90 backdrop-blur-md border border-slate-800 text-[11px] text-slate-400 px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2 pointer-events-none">
            <Info className="w-3.5 h-3.5 text-blue-400" />
            <span>
              {linesWithLogs.length} lokasi berpenanda • Geser (drag) kotak callout bebas di layar preview • Panah siku otomatis mengikuti.
            </span>
          </div>
        </div>

        {/* ========================================================
            MODAL FOOTER SUMMARY BAR
            ======================================================== */}
        <div className="px-4 sm:px-6 py-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0 flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-slate-300 font-bold">Dimensi:</span>
            <span>
              {baseWidth * 3} × {baseHeight * 3} px (Native AutoCAD 600 DPI)
            </span>
            <span>•</span>
            <span className="text-emerald-400 font-bold">Kualitas Cetak: 600 DPI Ultra HD</span>
            {Object.keys(customPositions).length > 0 && (
              <>
                <span>•</span>
                <span className="text-amber-400 font-bold">
                  {Object.keys(customPositions).length} posisi callout telah disesuaikan manual
                </span>
              </>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold transition cursor-pointer"
            >
              Tutup
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="px-5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-red-900/30"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Dokumen PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
