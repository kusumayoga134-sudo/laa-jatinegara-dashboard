import React, { useState, useRef, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  MapPin,
  Crosshair,
  Wrench,
  Sparkles,
  Layers,
  Flame,
} from 'lucide-react';

export default function SchematicViewer({
  stations = [],
  logs = [],
  selectedLocation,
  onSelectLocation,
}) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const [viewMode, setViewMode] = useState('web'); // 'web' (fast) or 'hd' (ultra sharp)
  const [hoveredItem, setHoveredItem] = useState(null);
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
    if (e.target.closest('button') || e.target.closest('.interactive-station') || e.target.closest('.glowing-track-line')) return;
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
    setZoom((prev) => Math.min(Math.max(prev + zoomFactor, 0.6), 4.0));
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

  const imageSrc = viewMode === 'hd' ? '/peta-laa-cropped-hd.png' : '/peta-laa-cropped.png';

  // Interactive Line Segments positioned precisely on the tightly-cropped AutoCAD map
  const lineSegments = [
    {
      id: 'line_kramat',
      title: 'Lintas Percabangan Kramat',
      code: 'ST. PONDOK JATI',
      km: 'KM 10+000 - KM 10+857',
      category: 'JALUR PERCABANGAN KRAMAT',
      style: { left: '2.5%', top: '32%', width: '13%', height: '7%' },
    },
    {
      id: 'line_manggarai',
      title: 'Lintas Utama Manggarai - Jatinegara',
      code: 'ST. PONDOK JATI',
      km: 'KM 10+800 - KM 11+448',
      category: 'JALUR UTAMA INBOUND',
      style: { left: '2.5%', top: '48%', width: '13%', height: '7%' },
    },
    {
      id: 'line_jng_emplasemen',
      title: 'ST. JATINEGARA (Jalur 1 - 8 & Kompleks Wesel)',
      code: 'ST. JATINEGARA',
      km: 'KM 11+750',
      category: 'EMPLASEMEN & PERON',
      style: { left: '22%', top: '22%', width: '22%', height: '37%' },
    },
    {
      id: 'line_naspan_1_hi',
      title: 'NASPAN 1 JNG-KLD (HI)',
      code: 'NASPAN 1 JNG-KLD (HI)',
      km: 'KM 11+750 - KM 12+844',
      category: 'SEKSI LAA HULU (HI)',
      style: { left: '44%', top: '38%', width: '12%', height: '7%' },
    },
    {
      id: 'line_naspan_1_hu',
      title: 'NASPAN 1 JNG-KLD (HU)',
      code: 'NASPAN 1 JNG-KLD (HU)',
      km: 'KM 11+750 - KM 12+844',
      category: 'SEKSI LAA HILIR (HU)',
      style: { left: '44%', top: '46.5%', width: '12%', height: '7%' },
    },
    {
      id: 'line_naspan_2',
      title: 'NASPAN 2 JNG-KLD',
      code: 'NASPAN 2 JNG-KLD',
      km: 'KM 12+844 - KM 13+800',
      category: 'SEKSI LAA JALUR UTAMA',
      style: { left: '56%', top: '42%', width: '11%', height: '11%' },
    },
    {
      id: 'line_naspan_3_4',
      title: 'NASPAN 3 & 4 JNG-KLD (Petak St. Klender)',
      code: 'NASPAN 3 JNG-KLD',
      km: 'KM 13+800 - KM 15+760',
      category: 'SEKSI LAA PETAK KLENDER',
      style: { left: '67%', top: '39%', width: '10%', height: '14%' },
    },
    {
      id: 'line_naspan_5_6',
      title: 'NASPAN 5 & 6 KLD-BUA (Petak St. Buaran)',
      code: 'NASPAN 5 KLD-BUA',
      km: 'KM 16+914 - KM 18+200',
      category: 'SEKSI LAA PETAK BUARAN',
      style: { left: '77%', top: '39%', width: '10%', height: '14%' },
    },
    {
      id: 'line_naspan_7_8',
      title: 'NASPAN 7 & 8 BUA-KLDB (Petak Buaran - Klender Baru)',
      code: 'NASPAN 7 BUA-KLDB',
      km: 'KM 18+200 - KM 20+474',
      category: 'SEKSI LAA LOOPING TIMUR',
      style: { left: '87%', top: '41%', width: '9%', height: '32%' },
    },
    {
      id: 'line_naspan_9',
      title: 'NASPAN 9 EMPL CUK (Emplasemen St. Cakung)',
      code: 'NASPAN 9 EMPL CUK',
      km: 'KM 20+474 - KM 21+400',
      category: 'EMPLASEMEN CAKUNG',
      style: { left: '72%', top: '62%', width: '11%', height: '16%' },
    },
    {
      id: 'line_naspan_10_11',
      title: 'NASPAN 10 & 11 CUK-KRI (Petak Cakung - Kranji)',
      code: 'NASPAN 10 CUK-KRI',
      km: 'KM 21+400 - KM 23+987',
      category: 'SEKSI LAA PERBATASAN',
      style: { left: '54%', top: '62%', width: '18%', height: '16%' },
    },
    {
      id: 'line_naspan_12_13',
      title: 'NASPAN 12 & 13 BKS-KRI (Petak Kranji - Bekasi)',
      code: 'NASPAN 12 BKS-KRI',
      km: 'KM 23+987 - KM 26+403',
      category: 'SEKSI LAA ARAH BEKASI',
      style: { left: '34%', top: '62%', width: '20%', height: '16%' },
    },
    {
      id: 'line_bks_emplasemen',
      title: 'ST. BEKASI (Jalur 1 - 8 & Stabling Emplasemen)',
      code: 'ST. BEKASI',
      km: 'KM 26+403',
      category: 'EMPLASEMEN & STABLING',
      style: { left: '16%', top: '60%', width: '18%', height: '26%' },
    },
    {
      id: 'line_bks_timur',
      title: 'Lintas Menuju Bekasi Timur',
      code: 'PETAK BEKASI TIMUR',
      km: 'KM 26+800',
      category: 'JALUR KELUAR BEKASI TIMUR',
      style: { left: '2.5%', top: '64%', width: '13.5%', height: '14%' },
    },
  ];

  // Station positions on cropped map
  const croppedStations = [
    { name: 'ST. PONDOK JATI', km: 'KM 10+400', x: 9.03, y: 35.13 },
    { name: 'ST. JATINEGARA', km: 'KM 11+750', x: 36.72, y: 18.32 },
    { name: 'ST. KLENDER', km: 'KM 15+027', x: 71.51, y: 41.52 },
    { name: 'ST. BUARAN', km: 'KM 17+500', x: 87.98, y: 41.52 },
    { name: 'ST. KLENDER BARU', km: 'KM 19+546', x: 90.35, y: 70.27 },
    { name: 'ST. CAKUNG', km: 'KM 20+943', x: 76.87, y: 66.41 },
    { name: 'ST. KRANJI', km: 'KM 23+987', x: 58.34, y: 66.91 },
    { name: 'ST. BEKASI', km: 'KM 26+403', x: 33.22, y: 63.72 },
  ];

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
      className={`bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative flex flex-col transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'w-full'
      }`}
    >
      {/* Top Toolbar Minimalist */}
      <div className="bg-slate-950/95 border-b border-slate-800/90 px-5 py-3 flex flex-wrap items-center justify-between gap-3 z-20 backdrop-blur-md">
        
        {/* Left Instruction */}
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/60 text-cyan-400 shadow-sm shadow-cyan-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-black text-white flex items-center gap-2">
              <span>Peta Wilayah LAA 1.9 Jatinegara</span>
              <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-700/60 font-mono">
                AutoCAD DWG Master
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Arahkan kursor ke garis jalur untuk efek visual menyala, lalu <strong className="text-cyan-300">klik untuk membuka riwayat pekerjaan</strong>
            </p>
          </div>
        </div>

        {/* Right Tools */}
        <div className="flex items-center space-x-2">
          
          {/* Resolution Toggle */}
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

          {/* Zoom Buttons */}
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
        onMouseLeave={handleMouseUp}
        className={`w-full overflow-hidden bg-slate-950 cursor-grab active:cursor-grabbing relative select-none ${
          isFullscreen ? 'h-[calc(100vh-65px)]' : 'h-[680px]'
        }`}
      >
        {/* Floating Quick Hint */}
        <div className="absolute bottom-4 left-4 z-20 pointer-events-none bg-slate-950/90 border border-slate-800 px-3.5 py-2 rounded-2xl text-[11px] text-slate-300 backdrop-blur-md flex items-center space-x-2.5 shadow-2xl">
          <Crosshair className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>Gunakan scroll mouse untuk Zoom • Tahan klik kiri untuk geser • Klik garis/stasiun untuk riwayat pekerjaan</span>
        </div>

        {/* Floating Hover Indicator Banner */}
        {hoveredItem && (
          <div className="absolute top-5 left-1/2 -translate-x-1/2 z-30 pointer-events-none bg-slate-900/95 border-2 border-cyan-400 px-5 py-2.5 rounded-2xl text-xs text-white shadow-2xl backdrop-blur-md animate-in zoom-in-95 duration-100 flex items-center space-x-3">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <div>
              <span className="font-extrabold text-cyan-300 text-sm tracking-tight">{hoveredItem.title}</span>
              <span className="text-slate-300 ml-2 font-medium">
                • {getWorkCount(hoveredItem.code)} Pekerjaan Dicatat • <strong className="text-orange-400 font-bold underline">Klik untuk membuka detail</strong>
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
          className="w-full h-full min-w-[1300px] min-h-[580px] relative p-2"
        >
          {/* Container exactly wrapping cropped schematic */}
          <div className="relative inline-block w-[1400px] rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-700 bg-white">
            
            {/* Cropped AutoCAD Master Image */}
            <img
              src={imageSrc}
              alt="Peta Wilayah UPT Resor LAA 1.9 Jatinegara - Potongan Garis Tepi Terluar"
              className="w-full h-auto block select-none"
              draggable={false}
            />

            {/* ========================================================
                GLOWING & EMBOSSED INTERACTIVE TRACK LINES
                ======================================================== */}
            {lineSegments.map((seg) => {
              const workCount = getWorkCount(seg.code);
              const isActive = selectedLocation?.code === seg.code;
              const isHovered = hoveredItem?.id === seg.id;

              return (
                <div
                  key={seg.id}
                  style={seg.style}
                  onClick={() => onSelectLocation && onSelectLocation(seg)}
                  onMouseEnter={() => setHoveredItem(seg)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`glowing-track-line ${isActive ? 'active' : ''}`}
                  title={`${seg.title} • Klik untuk melihat riwayat pekerjaan`}
                >
                  {/* Internal animated laser shimmer line */}
                  <div
                    className={`absolute inset-x-2 top-1/2 -translate-y-1/2 h-1 rounded-full transition-all duration-300 ${
                      isHovered || isActive
                        ? 'bg-gradient-to-r from-cyan-400 via-sky-300 to-emerald-400 shadow-lg shadow-cyan-400/80 scale-y-125'
                        : 'bg-transparent'
                    }`}
                  />

                  {/* 3D Embossed Badge on hover */}
                  <div
                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-200 pointer-events-none ${
                      isHovered || isActive ? 'opacity-100 scale-105' : 'opacity-0 scale-90'
                    }`}
                  >
                    <div className="bg-slate-950/95 border border-cyan-400/80 text-white px-3 py-1 rounded-xl text-[10px] font-bold shadow-2xl flex items-center space-x-1.5 backdrop-blur-md">
                      <Wrench className="w-3 h-3 text-orange-400" />
                      <span className="font-extrabold text-cyan-200">{seg.title}</span>
                      <span className="px-1.5 py-0.2 rounded-full bg-orange-500 text-slate-950 text-[9px] font-black">
                        {workCount}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* ========================================================
                STATION HOTSPOTS (NO DS MENUS)
                ======================================================== */}
            {croppedStations.map((st, i) => {
              const workCount = getWorkCount(st.name);
              const isActive = selectedLocation?.code === st.name;

              return (
                <button
                  key={i}
                  onClick={() =>
                    onSelectLocation &&
                    onSelectLocation({
                      code: st.name,
                      title: st.name,
                      name: st.name,
                      km: st.km,
                      category: 'STASIUN KERETA API',
                      type: 'STATION',
                    })
                  }
                  title={`Klik untuk melihat riwayat pekerjaan di ${st.name} (${st.km})`}
                  style={{
                    left: `${st.x}%`,
                    top: `${st.y}%`,
                  }}
                  className={`interactive-station absolute -translate-x-1/2 -translate-y-1/2 px-3 py-1 rounded-xl text-[10px] font-black border transition-all cursor-pointer shadow-xl backdrop-blur-md flex items-center space-x-1.5 hover:scale-115 ${
                    isActive
                      ? 'bg-blue-600 text-white border-white ring-4 ring-cyan-400/50 scale-110 z-30'
                      : 'bg-slate-900/90 hover:bg-blue-600 text-white border-blue-400/80 z-20'
                  }`}
                >
                  <MapPin className="w-3 h-3 text-cyan-300" />
                  <span>{st.name}</span>
                  {workCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full bg-orange-500 text-slate-950 text-[9px] font-black">
                      {workCount}
                    </span>
                  )}
                </button>
              );
            })}

          </div>
        </div>

      </div>
    </div>
  );
}
