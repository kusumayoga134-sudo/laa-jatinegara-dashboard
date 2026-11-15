import React, { useState, useRef, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Zap,
  Lock,
  Unlock,
  Maximize2,
  MapPin,
  Crosshair,
  Wrench,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function SchematicViewer({
  switches = [],
  stations = [],
  logs = [],
  onSelectLocation,
}) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const [viewMode, setViewMode] = useState('autocad_web'); // 'autocad_web' or 'autocad_hd'
  const [hoveredItem, setHoveredItem] = useState(null);
  const [selectedPin, setSelectedPin] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef(null);
  const viewerWrapperRef = useRef(null);

  // Zoom handlers
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 4.0));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  // Drag handlers
  const handleMouseDown = (e) => {
    if (e.target.closest('button') || e.target.closest('.interactive-pin') || e.target.closest('.interactive-line')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
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
    setZoom((prev) => Math.min(Math.max(prev + zoomFactor, 0.5), 4.0));
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  // Fullscreen toggle
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

  const autoCadSrc = viewMode === 'autocad_hd' ? '/autocad-peta-hd.png' : '/autocad-peta-web.png';

  // Interactive Line Segments positioned directly on the AutoCAD map
  const lineSegments = [
    {
      id: 'line_kramat',
      title: 'Lintas Percabangan Kramat',
      code: 'ST. PONDOK JATI',
      km: 'KM 10+000 - KM 10+857',
      category: 'JALUR PERCABANGAN',
      style: { left: '4%', top: '39%', width: '13%', height: '5%' },
    },
    {
      id: 'line_manggarai',
      title: 'Lintas Utama Manggarai - Jatinegara',
      code: 'ST. PONDOK JATI',
      km: 'KM 10+800 - KM 11+448',
      category: 'JALUR UTAMA (INBOUND)',
      style: { left: '4%', top: '49%', width: '13%', height: '5%' },
    },
    {
      id: 'line_jng_emplasemen',
      title: 'ST. JATINEGARA (Jalur 1 - 8 & Kompleks Wesel)',
      code: 'ST. JATINEGARA',
      km: 'KM 11+750',
      category: 'EMPLASEMEN & PERON',
      style: { left: '23%', top: '33%', width: '21%', height: '23%' },
    },
    {
      id: 'line_naspan_1_hu',
      title: 'NASPAN 1 JNG-KLD (HU)',
      code: 'NASPAN 1 JNG-KLD (HU)',
      km: 'KM 11+750 - KM 12+844',
      category: 'SEKSI LAA (JALUR HILIR)',
      style: { left: '44%', top: '49%', width: '12%', height: '5%' },
    },
    {
      id: 'line_naspan_1_hi',
      title: 'NASPAN 1 JNG-KLD (HI)',
      code: 'NASPAN 1 JNG-KLD (HI)',
      km: 'KM 11+750 - KM 12+844',
      category: 'SEKSI LAA (JALUR HULU)',
      style: { left: '44%', top: '43.5%', width: '12%', height: '5%' },
    },
    {
      id: 'line_naspan_2',
      title: 'NASPAN 2 JNG-KLD',
      code: 'NASPAN 2 JNG-KLD',
      km: 'KM 12+844 - KM 13+800',
      category: 'SEKSI LAA (PETAK JNG-KLD)',
      style: { left: '56%', top: '46%', width: '10%', height: '7%' },
    },
    {
      id: 'line_naspan_3_4',
      title: 'NASPAN 3 & 4 JNG-KLD (Petak St. Klender)',
      code: 'NASPAN 3 JNG-KLD',
      km: 'KM 13+800 - KM 15+760',
      category: 'SEKSI LAA (STASIUN KLENDER)',
      style: { left: '66%', top: '44%', width: '10%', height: '9%' },
    },
    {
      id: 'line_naspan_5_6',
      title: 'NASPAN 5 & 6 KLD-BUA (Petak St. Buaran)',
      code: 'NASPAN 5 KLD-BUA',
      km: 'KM 16+914 - KM 18+200',
      category: 'SEKSI LAA (STASIUN BUARAN)',
      style: { left: '76%', top: '44%', width: '10%', height: '9%' },
    },
    {
      id: 'line_naspan_7_8',
      title: 'NASPAN 7 & 8 BUA-KLDB (Petak Buaran - Klender Baru)',
      code: 'NASPAN 7 BUA-KLDB',
      km: 'KM 18+200 - KM 20+474',
      category: 'SEKSI LAA (LOOPING TIMUR)',
      style: { left: '86%', top: '44%', width: '7%', height: '19%' },
    },
    {
      id: 'line_naspan_9',
      title: 'NASPAN 9 EMPL CUK (Emplasemen St. Cakung)',
      code: 'NASPAN 9 EMPL CUK',
      km: 'KM 20+474 - KM 21+400',
      category: 'EMPLASEMEN CAKUNG',
      style: { left: '72%', top: '58%', width: '10%', height: '11%' },
    },
    {
      id: 'line_naspan_10_11',
      title: 'NASPAN 10 & 11 CUK-KRI (Petak Cakung - Kranji)',
      code: 'NASPAN 10 CUK-KRI',
      km: 'KM 21+400 - KM 23+987',
      category: 'SEKSI LAA (PERBATASAN DKI-JABAR)',
      style: { left: '54%', top: '58%', width: '18%', height: '11%' },
    },
    {
      id: 'line_naspan_12_13',
      title: 'NASPAN 12 & 13 BKS-KRI (Petak Kranji - Bekasi)',
      code: 'NASPAN 12 BKS-KRI',
      km: 'KM 23+987 - KM 26+403',
      category: 'SEKSI LAA (ARAH BEKASI)',
      style: { left: '34%', top: '58%', width: '20%', height: '11%' },
    },
    {
      id: 'line_bks_emplasemen',
      title: 'ST. BEKASI (Jalur 1 - 8 & Stabling Emplasemen)',
      code: 'ST. BEKASI',
      km: 'KM 26+403',
      category: 'EMPLASEMEN & STABLING',
      style: { left: '17%', top: '57%', width: '17%', height: '20%' },
    },
    {
      id: 'line_bks_timur',
      title: 'Lintas Menuju Bekasi Timur (DS 19 & 20)',
      code: 'DS 20',
      km: 'KM 26+800',
      category: 'JALUR KELUAR BEKASI TIMUR',
      style: { left: '4%', top: '60%', width: '13%', height: '10%' },
    },
  ];

  // Count works per location
  const getWorkCount = (code) => {
    return logs.filter((l) =>
      l.targetCode &&
      (l.targetCode.toLowerCase().includes(code.toLowerCase()) ||
        code.toLowerCase().includes(l.targetCode.toLowerCase()))
    ).length;
  };

  return (
    <div
      ref={viewerWrapperRef}
      className={`bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative flex flex-col transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'w-full'
      }`}
    >
      {/* Top Toolbar Minimalist */}
      <div className="bg-slate-950/95 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 z-20">
        
        {/* Info Instruction */}
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-orange-950/70 border border-orange-600/60 text-orange-400">
            <Wrench className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              Peta Skematik Interaktif AutoCAD LAA 1.9
            </span>
            <p className="text-[11px] text-slate-400">
              💡 <strong>Klik pada garis jalur, naspan, stasiun, atau sakelar</strong> untuk melihat rincian pekerjaan yang telah dilakukan.
            </p>
          </div>
        </div>

        {/* View Controls */}
        <div className="flex items-center space-x-2">
          {/* Zoom controls */}
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

      {/* Main Canvas Area */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`w-full overflow-hidden bg-slate-950 cursor-grab active:cursor-grabbing relative select-none ${
          isFullscreen ? 'h-[calc(100vh-60px)]' : 'h-[670px]'
        }`}
      >
        {/* Floating Quick Hint */}
        <div className="absolute bottom-3 left-3 z-20 pointer-events-none bg-slate-950/85 border border-slate-800 px-3 py-1.5 rounded-xl text-[10px] text-slate-400 backdrop-blur-sm flex items-center space-x-2 shadow-lg">
          <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
          <span>Scroll mouse untuk Zoom • Tahan klik kiri untuk geser peta • Klik garis/stasiun untuk riwayat pekerjaan</span>
        </div>

        {/* Hover Tooltip Floating Banner */}
        {hoveredItem && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none bg-slate-900/95 border border-blue-500/80 px-4 py-2 rounded-xl text-xs text-white shadow-2xl backdrop-blur-md animate-in fade-in duration-100 flex items-center space-x-2">
            <Wrench className="w-4 h-4 text-orange-400 shrink-0" />
            <div>
              <span className="font-extrabold text-cyan-300">{hoveredItem.title}</span>
              <span className="text-[11px] text-slate-300 ml-2">
                ({getWorkCount(hoveredItem.code)} Pekerjaan Dicatat) — <strong className="text-emerald-400">Klik untuk melihat detail</strong>
              </span>
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
          className="w-full h-full min-w-[1300px] min-h-[750px] relative"
        >
          <div className="relative inline-block w-[1400px] p-4">
            
            {/* AutoCAD Master Image */}
            <img
              src={autoCadSrc}
              alt="Peta Wilayah UPT Resor LAA 1.9 Jatinegara - AutoCAD DWG"
              className="w-full h-auto rounded-xl shadow-2xl border border-slate-700 bg-white"
              draggable={false}
            />

            {/* ========================================================
                CLICKABLE LINE & NASPAN HOTSPOTS OVER AUTOCAD TRACKS
                ======================================================== */}
            {lineSegments.map((seg) => {
              const workCount = getWorkCount(seg.code);
              const isHovered = hoveredItem?.id === seg.id;

              return (
                <div
                  key={seg.id}
                  style={seg.style}
                  onClick={() => onSelectLocation && onSelectLocation(seg)}
                  onMouseEnter={() => setHoveredItem(seg)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`interactive-line absolute rounded-xl transition-all cursor-pointer flex items-center justify-center group ${
                    isHovered
                      ? 'bg-blue-500/25 border-2 border-blue-400 shadow-xl shadow-blue-500/30'
                      : 'hover:bg-blue-500/15 border border-transparent hover:border-blue-400/50'
                  }`}
                  title={`${seg.title} - Klik untuk melihat pekerjaan`}
                >
                  {/* Subtle Work Count Pill on Hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/90 border border-slate-700 text-white px-2 py-0.5 rounded-full text-[9px] font-bold shadow-lg flex items-center space-x-1 backdrop-blur-sm pointer-events-none">
                    <Wrench className="w-2.5 h-2.5 text-orange-400" />
                    <span>{workCount} Pekerjaan</span>
                  </div>
                </div>
              );
            })}

            {/* ========================================================
                STATION CLICKABLE HOTSPOTS
                ======================================================== */}
            {stations.map((st) => {
              const workCount = getWorkCount(st.name);
              return (
                <button
                  key={st.id}
                  onClick={() =>
                    onSelectLocation &&
                    onSelectLocation({
                      code: st.name,
                      title: st.name,
                      name: st.name,
                      km: st.km,
                      category: 'STASIUN KERETA',
                      type: 'STATION',
                    })
                  }
                  title={`Klik untuk melihat riwayat pekerjaan di ${st.name} (${st.km})`}
                  style={{
                    left: `${st.xPos}%`,
                    top: `${st.yPos}%`,
                  }}
                  className="interactive-pin absolute -translate-x-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-blue-900/90 hover:bg-blue-600 text-white text-[9.5px] font-extrabold border border-blue-400/80 shadow-lg shadow-blue-950/70 transition cursor-pointer backdrop-blur-sm flex items-center space-x-1 hover:scale-110 group"
                >
                  <MapPin className="w-3 h-3 text-cyan-300" />
                  <span>{st.name}</span>
                  {workCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full bg-orange-500 text-slate-950 text-[8.5px] font-black">
                      {workCount}
                    </span>
                  )}
                </button>
              );
            })}

            {/* ========================================================
                DISCONNECTING SWITCHES (DS 1 - DS 20)
                ======================================================== */}
            {switches.map((sw) => {
              const isClosed = sw.currentState === 'NC';
              const workCount = getWorkCount(sw.code);

              return (
                <button
                  key={sw.id}
                  onClick={() =>
                    onSelectLocation &&
                    onSelectLocation({
                      code: sw.code,
                      title: `${sw.code} (${sw.feedSection})`,
                      name: sw.code,
                      km: sw.locationKm,
                      category: `SAKELAR PEMUTUS BEBAN (${sw.lineType})`,
                      type: 'SWITCH',
                    })
                  }
                  title={`${sw.code} [${sw.currentState}] - Klik untuk melihat pekerjaan`}
                  style={{
                    left: `${sw.mapCoordX}%`,
                    top: `${sw.mapCoordY}%`,
                  }}
                  className={`interactive-pin absolute -translate-x-1/2 -translate-y-1/2 p-1.5 rounded-full shadow-2xl transition-all cursor-pointer border-2 z-10 hover:scale-125 ${
                    isClosed
                      ? 'bg-emerald-500 border-white text-white shadow-emerald-500/80'
                      : 'bg-amber-500 border-slate-900 text-slate-950 shadow-amber-500/80'
                  }`}
                >
                  <div className="relative flex items-center justify-center">
                    {isClosed ? (
                      <Zap className="w-3.5 h-3.5 fill-current" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-current" />
                    )}
                  </div>

                  <span
                    className={`absolute -bottom-5 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded text-[9px] font-mono font-bold whitespace-nowrap shadow-md border ${
                      isClosed
                        ? 'bg-emerald-950 text-emerald-200 border-emerald-600'
                        : 'bg-amber-950 text-amber-200 border-amber-600'
                    }`}
                  >
                    {sw.code}
                  </span>
                </button>
              );
            })}

          </div>
        </div>

      </div>
    </div>
  );
}
