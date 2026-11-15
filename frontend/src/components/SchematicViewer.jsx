import React, { useState, useRef, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Crosshair,
  Wrench,
  Clock,
  HardHat,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export default function SchematicViewer({
  logs = [],
  selectedLocation,
  onSelectLocation,
}) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const [viewMode, setViewMode] = useState('web'); // 'web' or 'hd'
  const [hoveredLine, setHoveredLine] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef(null);
  const viewerWrapperRef = useRef(null);

  // Zoom handlers
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 4.0));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.6));
  const handleResetZoom = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  // Drag handlers
  const handleMouseDown = (e) => {
    if (e.target.closest('button')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    // Record mouse position inside viewer for tooltip positioning
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }

    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 0.15 : -0.15;
    setZoom((prev) => Math.min(Math.max(prev + zoomFactor, 0.6), 4.0));
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  const toggleFullscreen = () => {
    if (!viewerWrapperRef.current) return;
    if (!document.fullscreenElement) {
      viewerWrapperRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const imageSrc = viewMode === 'hd' ? '/peta-laa-cropped-hd.png' : '/peta-laa-cropped.png';

  // 28 Naspan Lines & Track Segments mapped exactly along the AutoCAD DWG schematic paths (3275 x 1419)
  const naspanLines = [
    // 1. Percabangan Kramat
    {
      id: 'naspan_9_kpb',
      code: 'NASPAN 9 KPB-JNG',
      title: 'NASPAN 9 KPB-JNG (Percabangan Kramat)',
      km: 'KM 10+000 - KM 10+857',
      category: 'PERCABANGAN KRAMAT',
      d: 'M 218 370 L 588 370',
      color: '#ec4899', // Pink
    },

    // 2. Manggarai Inbound HI & HU
    {
      id: 'naspan_1_mri_hi',
      code: 'MRI-JNG NASPAN 1 HI',
      title: 'MRI-JNG NASPAN 1 HI (Inbound Manggarai)',
      km: 'KM 10+800 - KM 11+448',
      category: 'SEKSI LAA HULU',
      d: 'M 310 656 L 728 656',
      color: '#06b6d4', // Cyan
    },
    {
      id: 'naspan_1_jng_hu',
      code: 'JNG-MRI NASPAN 1 HU',
      title: 'JNG-MRI NASPAN 1 HU (Outbound Manggarai)',
      km: 'KM 10+800 - KM 11+448',
      category: 'SEKSI LAA HILIR',
      d: 'M 310 704 L 728 704',
      color: '#3b82f6', // Blue
    },

    // 3. Emplasemen St. Jatinegara
    {
      id: 'jng_jalur_1_2',
      code: 'ST. JATINEGARA (JALUR 1)',
      title: 'ST. JATINEGARA (Jalur 1 & 2 Peron)',
      km: 'KM 11+750',
      category: 'EMPLASEMEN JATINEGARA',
      d: 'M 740 656 L 1475 656',
      color: '#10b981', // Emerald
    },
    {
      id: 'jng_jalur_3_4',
      code: 'ST. JATINEGARA (JALUR 3 & 4)',
      title: 'ST. JATINEGARA (Jalur 3 & 4 Peron)',
      km: 'KM 11+750',
      category: 'EMPLASEMEN JATINEGARA',
      d: 'M 740 704 L 1475 704',
      color: '#14b8a6', // Teal
    },
    {
      id: 'jng_jalur_5_8',
      code: 'ST. JATINEGARA (JALUR 5 s/d 8)',
      title: 'ST. JATINEGARA (Jalur 5 s/d 8 Stabling)',
      km: 'KM 11+750',
      category: 'STABLING & WESEL JATINEGARA',
      d: 'M 600 418 L 1450 418',
      color: '#f59e0b', // Amber
    },

    // 4. East of Jatinegara towards Klender
    {
      id: 'naspan_1_hi',
      code: 'NASPAN 1 JNG-KLD (HI)',
      title: 'NASPAN 1 JNG-KLD (HI)',
      km: 'KM 11+750 - KM 12+844',
      category: 'SEKSI LAA HULU (HI)',
      d: 'M 1487 656 L 1942 656',
      color: '#eab308', // Gold / Yellow
    },
    {
      id: 'naspan_1_hu',
      code: 'NASPAN 1 JNG-KLD (HU)',
      title: 'NASPAN 1 JNG-KLD (HU)',
      km: 'KM 11+750 - KM 12+844',
      category: 'SEKSI LAA HILIR (HU)',
      d: 'M 1487 704 L 1942 704',
      color: '#d946ef', // Magenta
    },

    // 5. Petak Klender
    {
      id: 'naspan_2',
      code: 'NASPAN 2 JNG-KLD',
      title: 'NASPAN 2 JNG-KLD',
      km: 'KM 12+844 - KM 13+800',
      category: 'SEKSI LAA PETAK KLENDER',
      d: 'M 1942 656 L 2100 656',
      color: '#f97316', // Orange
    },
    {
      id: 'naspan_3',
      code: 'NASPAN 3 JNG-KLD',
      title: 'NASPAN 3 JNG-KLD',
      km: 'KM 13+800 - KM 14+800',
      category: 'SEKSI LAA PETAK KLENDER',
      d: 'M 2100 656 L 2257 656',
      color: '#84cc16', // Lime
    },
    {
      id: 'naspan_4',
      code: 'NASPAN 4 JNG-KLD',
      title: 'NASPAN 4 JNG-KLD',
      km: 'KM 14+800 - KM 15+760',
      category: 'SEKSI LAA PETAK KLENDER',
      d: 'M 1942 704 L 2255 704',
      color: '#22c55e', // Green
    },

    // 6. Petak Buaran
    {
      id: 'naspan_4b',
      code: 'NASPAN 4B KLD-BUA',
      title: 'NASPAN 4B KLD-BUA',
      km: 'KM 15+760 - KM 16+914',
      category: 'SEKSI LAA PETAK BUARAN',
      d: 'M 2257 656 L 2512 656',
      color: '#0284c7', // Sky Blue
    },
    {
      id: 'naspan_5',
      code: 'NASPAN 5 KLD-BUA',
      title: 'NASPAN 5 KLD-BUA',
      km: 'KM 16+914 - KM 17+500',
      category: 'SEKSI LAA PETAK BUARAN',
      d: 'M 2255 704 L 2512 704',
      color: '#fb923c', // Coral
    },
    {
      id: 'naspan_6',
      code: 'NASPAN 6 KLD-BUA',
      title: 'NASPAN 6 KLD-BUA',
      km: 'KM 17+500 - KM 18+200',
      category: 'SEKSI LAA PETAK BUARAN',
      d: 'M 2512 656 L 2749 656',
      color: '#06b6d4', // Cyan
    },

    // 7. Petak Klender Baru
    {
      id: 'naspan_7',
      code: 'NASPAN 7 BUA-KLDB',
      title: 'NASPAN 7 BUA-KLDB',
      km: 'KM 18+200 - KM 19+546',
      category: 'SEKSI LAA PETAK KLENDER BARU',
      d: 'M 2512 704 L 2749 704',
      color: '#a855f7', // Purple
    },
    {
      id: 'naspan_7b',
      code: 'NASPAN 7B BUA-KLDB',
      title: 'NASPAN 7B BUA-KLDB',
      km: 'KM 19+546 - KM 20+474',
      category: 'SEKSI LAA PETAK KLENDER BARU',
      d: 'M 2749 656 L 2981 656',
      color: '#eab308', // Gold
    },

    // 8. Tikungan Loop Klender Baru - Cakung
    {
      id: 'naspan_loop_curve',
      code: 'NASPAN 7 BUA-KLDB',
      title: 'TIKUNGAN LOOP KLENDER BARU - CAKUNG',
      km: 'KM 20+474',
      category: 'LOOPING TIKUNGAN TIMUR',
      d: 'M 2981 656 C 3060 656, 3060 1065, 2981 1065',
      color: '#6366f1', // Indigo
    },

    // 9. Lower Track: Cakung - Kranji
    {
      id: 'naspan_8',
      code: 'NASPAN 8 BUA-KLDB',
      title: 'NASPAN 8 BUA-KLDB',
      km: 'KM 20+474 - KM 20+943',
      category: 'SEKSI LAA MENUJU CAKUNG',
      d: 'M 2819 1065 L 3035 1065',
      color: '#ef4444', // Red
    },
    {
      id: 'naspan_8b',
      code: 'NASPAN 8B KLDB-CUK',
      title: 'NASPAN 8B KLDB-CUK',
      km: 'KM 20+943 - KM 21+400',
      category: 'SEKSI LAA MENUJU CAKUNG',
      d: 'M 2825 1113 L 3035 1113',
      color: '#facc15', // Yellow
    },
    {
      id: 'naspan_9_cuk',
      code: 'NASPAN 9 EMPL CUK',
      title: 'NASPAN 9 EMPL CUK (Emplasemen Cakung)',
      km: 'KM 21+400 - KM 22+500',
      category: 'EMPLASEMEN CAKUNG',
      d: 'M 2342 1065 L 2807 1065',
      color: '#8b5cf6', // Violet
    },
    {
      id: 'naspan_10',
      code: 'NASPAN 10 CUK-KRI',
      title: 'NASPAN 10 CUK-KRI',
      km: 'KM 22+500 - KM 23+200',
      category: 'SEKSI LAA CAKUNG - KRANJI',
      d: 'M 2344 1113 L 2812 1113',
      color: '#f97316', // Orange
    },
    {
      id: 'naspan_11',
      code: 'NASPAN 11 CUK-KRI',
      title: 'NASPAN 11 CUK-KRI',
      km: 'KM 23+200 - KM 23+987',
      category: 'SEKSI LAA CAKUNG - KRANJI',
      d: 'M 1752 1113 L 2344 1113',
      color: '#06b6d4', // Cyan
    },

    // 10. Kranji - Bekasi
    {
      id: 'naspan_12',
      code: 'NASPAN 12 BKS-KRI',
      title: 'NASPAN 12 BKS-KRI',
      km: 'KM 23+987 - KM 25+000',
      category: 'SEKSI LAA KRANJI - BEKASI',
      d: 'M 1824 1064 L 2342 1064',
      color: '#ec4899', // Pink
    },
    {
      id: 'naspan_12b',
      code: 'NASPAN 12 BKS-KRI',
      title: 'NASPAN 12B KRI-BKS',
      km: 'KM 25+000 - KM 26+000',
      category: 'SEKSI LAA KRANJI - BEKASI',
      d: 'M 1393 1064 L 1824 1064',
      color: '#10b981', // Emerald
    },
    {
      id: 'naspan_13',
      code: 'NASPAN 13 BKS-KRI',
      title: 'NASPAN 13 BKS-KRI (Jalur 4 Bekasi)',
      km: 'KM 26+000 - KM 26+403',
      category: 'JALUR 4 BEKASI',
      d: 'M 775 1064 L 1393 1064',
      color: '#14b8a6', // Teal
    },

    // 11. St. Bekasi Emplasemen & Stabling
    {
      id: 'bks_jalur_1_4',
      code: 'ST. BEKASI (JALUR 1 s/d 4)',
      title: 'ST. BEKASI (Jalur 1 s/d 4)',
      km: 'KM 26+403',
      category: 'EMPLASEMEN BEKASI',
      d: 'M 603 1113 L 1625 1113',
      color: '#ef4444', // Red
    },
    {
      id: 'bks_stabling',
      code: 'ST. BEKASI (JALUR STABLING 5-8)',
      title: 'ST. BEKASI (Jalur Stabling 5-8)',
      km: 'KM 26+403',
      category: 'STABLING BEKASI',
      d: 'M 737 1175 L 1372 1175',
      color: '#f59e0b', // Amber
    },

    // 12. Menuju Bekasi Timur
    {
      id: 'lintas_bks_timur',
      code: 'PETAK BEKASI TIMUR',
      title: 'Lintas Menuju Bekasi Timur',
      km: 'KM 26+800',
      category: 'SEKSI KELUAR BEKASI TIMUR',
      d: 'M 260 1278 L 485 1278',
      color: '#e11d48', // Rose
    },
  ];

  // Helper to get matching logs for a line
  const getLineLogs = (code) => {
    if (!code) return [];
    return logs.filter(
      (l) =>
        l.targetCode &&
        (l.targetCode.toLowerCase().includes(code.toLowerCase()) ||
          code.toLowerCase().includes(l.targetCode.toLowerCase()))
    );
  };

  const hoveredLogs = hoveredLine ? getLineLogs(hoveredLine.code) : [];

  // Format action text cleanly
  const formatAction = (str) => {
    if (!str) return 'Pekerjaan Pemeliharaan';
    return str.replace(/_/g, ' ');
  };

  return (
    <div
      ref={viewerWrapperRef}
      className={`bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative flex flex-col transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'w-full'
      }`}
    >
      {/* Top Toolbar Minimalist */}
      <div className="bg-slate-950/95 border-b border-slate-800/90 px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 z-20 backdrop-blur-md">
        
        {/* Left Instruction */}
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/60 text-cyan-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <p className="text-xs text-slate-300">
            Arahkan kursor ke garis jalur / naspan untuk <strong className="text-cyan-300">efek menyala & daftar riwayat pekerjaan</strong>
          </p>
        </div>

        {/* Right Tools: Resolution & Zoom */}
        <div className="flex items-center space-x-2">
          
          <div className="bg-slate-900 p-1 rounded-xl flex space-x-1 border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('web')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                viewMode === 'web'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Standar
            </button>
            <button
              onClick={() => setViewMode('hd')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                viewMode === 'hd'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Ultra HD
            </button>
          </div>

          <div className="flex items-center space-x-1 bg-slate-900 rounded-xl p-1 border border-slate-800">
            <button
              onClick={handleZoomOut}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
              title="Perkecil (-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <span className="text-xs font-mono font-bold px-2 text-cyan-300 min-w-14 text-center">
              {Math.round(zoom * 100)}%
            </span>

            <button
              onClick={handleZoomIn}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
              title="Perbesar (+)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <button
              onClick={handleResetZoom}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
              title="Reset Zoom (100%)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
              title="Layar Penuh"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* Main Canvas Viewport */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          handleMouseUp();
          setHoveredLine(null);
        }}
        className={`w-full overflow-hidden bg-slate-950 cursor-grab active:cursor-grabbing relative select-none ${
          isFullscreen ? 'h-[calc(100vh-55px)]' : 'h-[720px]'
        }`}
      >
        {/* Floating Quick Hint */}
        <div className="absolute bottom-4 left-4 z-20 pointer-events-none bg-slate-950/90 border border-slate-800 px-3.5 py-2 rounded-2xl text-[11px] text-slate-400 backdrop-blur-md flex items-center space-x-2 shadow-2xl">
          <Crosshair className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>Scroll mouse untuk Zoom • Tahan klik kiri untuk geser peta</span>
        </div>

        {/* ========================================================
            FLOATING POPUP CARD: DAFTAR SINGKAT PEKERJAAN
            Muncul dinamis saat kursor mengarah ke garis
            ======================================================== */}
        {hoveredLine && (
          <div
            style={{
              left: `${Math.min(Math.max(mousePos.x + 15, 20), (containerRef.current?.clientWidth || 1000) - 340)}px`,
              top: `${Math.min(Math.max(mousePos.y - 40, 20), (containerRef.current?.clientHeight || 600) - 260)}px`,
            }}
            className="absolute z-50 pointer-events-none bg-slate-950/95 border border-slate-700/90 rounded-2xl p-4 shadow-2xl backdrop-blur-xl w-84 animate-in zoom-in-95 duration-150 text-slate-100"
          >
            {/* Header: Naspan info & color dot */}
            <div className="flex items-start justify-between pb-2 border-b border-slate-800">
              <div className="flex items-start space-x-2">
                <span
                  className="w-3 h-3 rounded-full mt-1 shrink-0 animate-ping"
                  style={{ backgroundColor: hoveredLine.color }}
                />
                <div>
                  <h4 className="font-extrabold text-white text-xs leading-tight">
                    {hoveredLine.title}
                  </h4>
                  <span className="text-[10px] text-cyan-400 font-mono font-bold mt-0.5 block">
                    {hoveredLine.km}
                  </span>
                </div>
              </div>

              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-800 text-orange-400 shrink-0 border border-slate-700">
                {hoveredLogs.length} Pekerjaan
              </span>
            </div>

            {/* Content: Daftar Singkat Pekerjaan */}
            <div className="mt-2.5 space-y-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Wrench className="w-3 h-3 text-cyan-400" />
                <span>Daftar Singkat Pekerjaan:</span>
              </div>

              {hoveredLogs.length === 0 ? (
                <div className="text-[11px] text-slate-400 italic py-1 bg-slate-900/60 rounded-lg px-2 border border-slate-800">
                  Belum ada catatan pekerjaan pada seksi naspan ini.
                </div>
              ) : (
                hoveredLogs.slice(0, 3).map((log, idx) => {
                  const dateStr = new Date(log.timestamp).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });
                  const timeStr = new Date(log.timestamp).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={idx}
                      className="bg-slate-900/80 border border-slate-800 rounded-xl p-2 text-[11px] space-y-1"
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="flex items-center text-cyan-300 font-mono font-semibold">
                          <Clock className="w-2.5 h-2.5 mr-1 text-orange-400" />
                          {dateStr} • {timeStr} WIB
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                          {log.status || 'SELESAI'}
                        </span>
                      </div>

                      <div className="font-bold text-white text-xs">
                        {formatAction(log.actionType)}
                      </div>

                      <div className="text-slate-300 text-[10.5px] leading-snug line-clamp-2">
                        {log.description}
                      </div>

                      <div className="flex items-center text-[9.5px] text-slate-400 pt-0.5">
                        <HardHat className="w-2.5 h-2.5 mr-1 text-amber-400" />
                        <span>Pelaksana: <strong className="text-slate-200">{log.technician}</strong></span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Prompt to open detail */}
            <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[10px] text-cyan-400 flex items-center justify-between font-semibold">
              <span>Klik garis untuk membuka menu lengkap</span>
              <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
            </div>
          </div>
        )}

        {/* Viewport Content */}
        <div
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          }}
          className="w-full h-full min-w-[1300px] min-h-[580px] relative p-2"
        >
          {/* Container tightly wrapping cropped schematic */}
          <div className="relative inline-block w-[1400px] rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-700 bg-white">
            
            {/* Cropped AutoCAD Master Image */}
            <img
              src={imageSrc}
              alt="Peta Wilayah UPT Resor LAA 1.9 Jatinegara - Potongan Garis Tepi Terluar"
              className="w-full h-auto block select-none"
              draggable={false}
            />

            {/* ========================================================
                CLEAN SVG GLOWING TRACK LINES ONLY
                Hanya sekedar garis yang menunjukkan setiap naspan dengan
                warna berbeda, menyala dan timbul ketika kursor diarahkan
                ======================================================== */}
            <svg
              viewBox="0 0 3275 1419"
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ width: '100%', height: '100%' }}
            >
              <defs>
                {/* 3D Embossed Glow Filter */}
                <filter id="track-neon-glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="5" result="glow" />
                  <feMerge>
                    <feMergeNode in="glow" />
                    <feMergeNode in="glow" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {naspanLines.map((line) => {
                const isHovered = hoveredLine?.id === line.id;
                const isActive = selectedLocation?.code === line.code;

                return (
                  <g
                    key={line.id}
                    className="pointer-events-auto cursor-pointer"
                    onMouseEnter={() => setHoveredLine(line)}
                    onMouseLeave={() => setHoveredLine(null)}
                    onClick={() => onSelectLocation && onSelectLocation(line)}
                  >
                    {/* 1. Generous hit-area for effortless hovering */}
                    <path
                      d={line.d}
                      stroke="transparent"
                      strokeWidth="28"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />

                    {/* 2. Ambient subtle base line showing track segment color */}
                    <path
                      d={line.d}
                      stroke={line.color}
                      strokeWidth={isHovered || isActive ? 8 : 4.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                      style={{
                        opacity: isHovered || isActive ? 1 : 0.75,
                        filter:
                          isHovered || isActive
                            ? `drop-shadow(0 0 10px ${line.color}) drop-shadow(0 0 20px ${line.color}) drop-shadow(0 3px 5px rgba(0,0,0,0.85))`
                            : 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))',
                        transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    />

                    {/* 3. Center white hot laser core on hover/active (efek timbul menyala) */}
                    {(isHovered || isActive) && (
                      <path
                        d={line.d}
                        stroke="#ffffff"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                        style={{
                          opacity: 0.95,
                          filter: 'drop-shadow(0 0 3px #ffffff)',
                        }}
                      />
                    )}
                  </g>
                );
              })}
            </svg>

          </div>
        </div>

      </div>
    </div>
  );
}
