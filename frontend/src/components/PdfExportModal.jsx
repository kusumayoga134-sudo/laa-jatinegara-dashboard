import React, { useState, useEffect, useRef } from 'react';
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
  Layers,
  Eye,
  Info,
  Loader2,
  Maximize2,
} from 'lucide-react';
import {
  renderUltraHdCanvas,
  downloadMapPdf,
  downloadMapPng,
  printMapWindow,
  formatLogTimestamp,
} from '../utils/pdfExportEngine';

export default function PdfExportModal({
  isOpen,
  onClose,
  linesWithLogs = [],
}) {
  const [paperSize, setPaperSize] = useState('NATIVE'); // 'NATIVE' (Default Rekomendasi CAD) | 'A3' | 'A4'
  const [showCallouts, setShowCallouts] = useState(true);
  const [showRadar, setShowRadar] = useState(true);
  const [showOfficialHeader, setShowOfficialHeader] = useState(true);
  
  const [previewDataUrl, setPreviewDataUrl] = useState(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccessMsg, setExportSuccessMsg] = useState(null);

  const [previewZoom, setPreviewZoom] = useState(1);
  const [previewPos, setPreviewPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const previewContainerRef = useRef(null);

  // Generate preview when settings change
  useEffect(() => {
    if (!isOpen) return;
    let isCancelled = false;
    setIsGeneratingPreview(true);

    const generate = async () => {
      try {
        // Use 1.2x scale for fast, crisp preview in modal
        const canvas = await renderUltraHdCanvas({
          linesWithLogs,
          showCallouts,
          showRadar,
          showOfficialHeader,
          scale: 1.25,
        });

        if (!isCancelled) {
          setPreviewDataUrl(canvas.toDataURL('image/jpeg', 0.88));
          setIsGeneratingPreview(false);
        }
      } catch (err) {
        console.error('Failed to generate preview canvas:', err);
        if (!isCancelled) setIsGeneratingPreview(false);
      }
    };

    generate();
    return () => {
      isCancelled = true;
    };
  }, [isOpen, linesWithLogs, showCallouts, showRadar, showOfficialHeader, paperSize]);

  if (!isOpen) return null;

  // Zoom handlers for preview
  const handleZoomIn = () => setPreviewZoom((z) => Math.min(z + 0.25, 4));
  const handleZoomOut = () => setPreviewZoom((z) => Math.max(z - 0.25, 0.5));
  const handleResetZoom = () => {
    setPreviewZoom(1);
    setPreviewPos({ x: 0, y: 0 });
  };

  // Drag pan handlers
  const handleMouseDown = (e) => {
    if (previewZoom <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - previewPos.x, y: e.clientY - previewPos.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPreviewPos({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

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
      });
      setExportSuccessMsg(`Gambar Ultra HD berhasil diunduh: ${filename}`);
      setTimeout(() => setExportSuccessMsg(null), 4000);
    } catch (err) {
      alert('Gagal mengekspor PNG: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col w-full max-w-[1550px] h-[94vh] max-h-[960px] overflow-hidden text-slate-100">
        
        {/* ========================================================
            MODAL HEADER BAR
            ======================================================== */}
        <div className="px-4 sm:px-6 py-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0 gap-3">
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
              title="Download Gambar Ultra HD Resolusi Penuh (PNG 4K)"
            >
              <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
              <span>Gambar HD (PNG)</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-md shadow-red-900/30 transition cursor-pointer active:scale-95"
              title="Download Dokumen PDF Standar A3/A4 Ultra HD"
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
        <div className="px-4 sm:px-6 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between flex-wrap gap-3 text-xs shrink-0">
          
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

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showOfficialHeader}
                onChange={(e) => setShowOfficialHeader(e.target.checked)}
                className="w-4 h-4 rounded text-red-600 focus:ring-red-500 bg-slate-800 border-slate-700 cursor-pointer"
              />
              <span className="font-semibold text-slate-300">
                Bingkai & Kop Surat Resmi (Danantara & KAI)
              </span>
            </label>
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
                <option value="NATIVE">Format Asli CAD (3275 x 1419) (Rekomendasi)</option>
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
            MAIN LIVE PREVIEW STAGE
            ======================================================== */}
        <div
          ref={previewContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="flex-1 bg-slate-950 p-3 sm:p-6 overflow-hidden relative flex items-center justify-center select-none"
          style={{ cursor: previewZoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
        >
          {isGeneratingPreview ? (
            <div className="flex flex-col items-center justify-center space-y-3 text-slate-400">
              <Loader2 className="w-10 h-10 animate-spin text-red-500" />
              <p className="font-bold text-xs">Menyiapkan Preview Dokumen Ultra HD...</p>
            </div>
          ) : previewDataUrl ? (
            <div
              className="transition-transform duration-75 ease-out shadow-2xl rounded-xl overflow-hidden border border-slate-700/60 bg-white"
              style={{
                transform: `translate(${previewPos.x}px, ${previewPos.y}px) scale(${previewZoom})`,
                transformOrigin: 'center center',
                maxHeight: '100%',
                maxWidth: '100%',
              }}
            >
              <img
                src={previewDataUrl}
                alt="Preview Dokumen PDF Peta Monitoring LAA"
                className="block max-h-[75vh] w-auto object-contain select-none pointer-events-none"
                draggable={false}
              />
            </div>
          ) : (
            <div className="text-slate-400 text-xs">Gagal memuat preview peta</div>
          )}

          {/* Quick Helper Pill at Bottom */}
          <div className="absolute bottom-4 left-6 bg-slate-900/90 backdrop-blur-md border border-slate-800 text-[11px] text-slate-400 px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2 pointer-events-none">
            <Info className="w-3.5 h-3.5 text-blue-400" />
            <span>
              {linesWithLogs.length} lokasi berpenanda pekerjaan aktif terdeteksi dengan kotak callout panah.
            </span>
          </div>
        </div>

        {/* ========================================================
            MODAL FOOTER SUMMARY BAR
            ======================================================== */}
        <div className="px-4 sm:px-6 py-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0 flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-slate-300 font-bold">Dimensi:</span>
            <span>3275 × 1419 px (Native AutoCAD)</span>
            <span>•</span>
            <span className="text-emerald-400 font-bold">Kualitas Cetak: 300 DPI Ultra HD</span>
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
