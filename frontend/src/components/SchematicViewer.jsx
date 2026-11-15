import React, { useState, useRef, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Zap,
  Lock,
  Unlock,
  Layers,
  Info,
  Maximize2,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Crosshair,
} from 'lucide-react';

export default function SchematicViewer({
  switches = [],
  stations = [],
  assets = [],
  onToggleSwitch,
  onToggleInterlock,
  onSelectStation,
}) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [viewMode, setViewMode] = useState('blueprint'); // 'blueprint' (official PDF map) or 'vector' (cyber SCADA vector)
  
  // Layer Filters
  const [showSwitches, setShowSwitches] = useState(true);
  const [showStations, setShowStations] = useState(true);
  const [showAssets, setShowAssets] = useState(true);
  
  // Selected switch popover
  const [selectedPin, setSelectedPin] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef(null);
  const viewerWrapperRef = useRef(null);

  // Zoom handlers
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  // Drag handlers
  const handleMouseDown = (e) => {
    if (e.target.closest('button') || e.target.closest('.interactive-pin')) return;
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
    setZoom((prev) => Math.min(Math.max(prev + zoomFactor, 0.5), 3.5));
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

  return (
    <div
      ref={viewerWrapperRef}
      className={`bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative flex flex-col transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'w-full'
      }`}
    >
      {/* Top Toolbar */}
      <div className="bg-slate-950/95 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 z-20">
        
        {/* Mode Selector */}
        <div className="flex items-center space-x-2">
          <div className="bg-slate-900 p-1 rounded-xl flex space-x-1 border border-slate-800">
            <button
              onClick={() => setViewMode('blueprint')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
                viewMode === 'blueprint'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Peta Cetak Resmi (Resolusi Tinggi)</span>
            </button>

            <button
              onClick={() => setViewMode('vector')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
                viewMode === 'vector'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>SCADA Vektor Interaktif</span>
            </button>
          </div>

          <span className="text-[11px] text-slate-400 hidden xl:inline">
            • Klik sakelar pada peta untuk membuka/menutup beban listrik
          </span>
        </div>

        {/* View Controls & Filters */}
        <div className="flex items-center space-x-2">
          
          {/* Layer toggles */}
          <div className="hidden md:flex items-center space-x-1.5 mr-2">
            <button
              onClick={() => setShowSwitches(!showSwitches)}
              className={`px-2.5 py-1 text-xs rounded-lg border transition flex items-center space-x-1 cursor-pointer ${
                showSwitches
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60 font-semibold'
                  : 'bg-slate-900 text-slate-500 border-slate-800'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${showSwitches ? 'bg-emerald-400' : 'bg-slate-600'}`} />
              <span>Pin DS ({switches.length})</span>
            </button>

            <button
              onClick={() => setShowStations(!showStations)}
              className={`px-2.5 py-1 text-xs rounded-lg border transition flex items-center space-x-1 cursor-pointer ${
                showStations
                  ? 'bg-blue-950/80 text-blue-300 border-blue-700/60 font-semibold'
                  : 'bg-slate-900 text-slate-500 border-slate-800'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${showStations ? 'bg-blue-400' : 'bg-slate-600'}`} />
              <span>Stasiun ({stations.length})</span>
            </button>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center space-x-1 bg-slate-900 rounded-xl p-1 border border-slate-800">
            <button
              onClick={handleZoomOut}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="Perkecil (-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <span className="text-xs font-mono font-bold px-2 text-cyan-300 min-w-14 text-center">
              {Math.round(zoom * 100)}%
            </span>

            <button
              onClick={handleZoomIn}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="Perbesar (+)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <button
              onClick={handleResetZoom}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="Reset Zoom (100%)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
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
          isFullscreen ? 'h-[calc(100vh-60px)]' : 'h-[640px]'
        }`}
      >
        {/* Help Overlay Hint */}
        <div className="absolute bottom-3 left-3 z-20 pointer-events-none bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-lg text-[10px] text-slate-400 backdrop-blur-sm flex items-center space-x-2">
          <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
          <span>Tahan & Geser mouse untuk menggeser peta • Scroll roda mouse untuk Zoom</span>
        </div>

        {/* Legend Box Preview on Bottom Right */}
        <div className="absolute bottom-3 right-3 z-20 bg-slate-950/90 border border-slate-800 p-2.5 rounded-xl text-[10px] text-slate-300 backdrop-blur-md hidden sm:flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500 animate-pulse" />
            <span className="font-semibold text-emerald-300">NC (Tertutup / Alir)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500" />
            <span className="font-semibold text-amber-300">NO (Terbuka / Putus)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Lock className="w-3 h-3 text-purple-400" />
            <span className="text-purple-300 font-semibold">Locked</span>
          </div>
        </div>

        {/* Viewport Content */}
        <div
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          }}
          className="w-full h-full min-w-[1300px] min-h-[750px] relative"
        >
          {viewMode === 'blueprint' ? (
            /* ========================================================
               MODE 1: OFFICIAL HIGH-RES BLUEPRINT WITH INTERACTIVE PINS
               ======================================================== */
            <div className="relative inline-block w-[1400px] p-4">
              <img
                src="/schematic-map-web.png"
                alt="Peta Wilayah UPT Resor LAA 1.9 Jatinegara"
                className="w-full h-auto rounded-xl shadow-2xl border border-slate-700 bg-white"
                draggable={false}
              />

              {/* Station Clickable Hotspots */}
              {showStations && stations.map((st) => (
                <button
                  key={st.id}
                  onClick={() => onSelectStation && onSelectStation(st.code)}
                  title={`Klik untuk melihat detail ${st.name} (${st.km})`}
                  style={{
                    left: `${st.xPos}%`,
                    top: `${st.yPos}%`,
                  }}
                  className="interactive-pin absolute -translate-x-1/2 -translate-y-1/2 px-2.5 py-1 rounded-md bg-blue-900/90 hover:bg-blue-700 text-white text-[10px] font-bold border border-blue-400/80 shadow-lg shadow-blue-950/60 transition cursor-pointer backdrop-blur-sm"
                >
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-cyan-300" />
                    <span>{st.name}</span>
                  </div>
                </button>
              ))}

              {/* Disconnecting Switch Pins (DS 1 - DS 20) */}
              {showSwitches && switches.map((sw) => {
                const isClosed = sw.currentState === 'NC';
                const isLocked = sw.isInterlocked;
                const isSelected = selectedPin?.code === sw.code;

                return (
                  <button
                    key={sw.id}
                    onClick={() => setSelectedPin(sw)}
                    title={`${sw.code} [${sw.currentState}] - ${sw.feedSection}`}
                    style={{
                      left: `${sw.mapCoordX}%`,
                      top: `${sw.mapCoordY}%`,
                    }}
                    className={`interactive-pin absolute -translate-x-1/2 -translate-y-1/2 p-1.5 rounded-full shadow-2xl transition-all cursor-pointer border-2 z-10 ${
                      isSelected
                        ? 'ring-4 ring-cyan-400 scale-125'
                        : 'hover:scale-115'
                    } ${
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
                      {isLocked && (
                        <div className="absolute -top-2 -right-2 bg-purple-600 rounded-full p-0.5 border border-white">
                          <Lock className="w-2 h-2 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Code Tag badge */}
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
          ) : (
            /* ========================================================
               MODE 2: SCADA MODERN VECTOR SVG
               ======================================================== */
            <svg
              viewBox="0 0 1400 750"
              className="w-full h-full"
              style={{ backgroundColor: '#060911' }}
            >
              <defs>
                <pattern id="scadaGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" strokeOpacity="0.5" />
                </pattern>
                <filter id="neonGreen" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="neonCyan" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <rect width="1400" height="750" fill="url(#scadaGrid)" />

              {/* Title Header Banner inside Vector */}
              <g transform="translate(40, 30)">
                <rect width="1320" height="65" rx="8" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                <text x="30" y="32" fill="#f8fafc" fontSize="16" fontWeight="bold" fontFamily="sans-serif">
                  PETA WILAYAH UPT RESOR LAA 1.9 JATINEGARA
                </text>
                <text x="30" y="50" fill="#94a3b8" fontSize="11" fontFamily="sans-serif">
                  Sistem Listrik Aliran Atas (Catenary 1500 V DC) • DAOP 1 JAKARTA
                </text>
                <text x="1290" y="40" fill="#38bdf8" fontSize="12" fontWeight="bold" textAnchor="end">
                  PT KERETA API INDONESIA & DANANTARA
                </text>
              </g>

              {/* Corridor Guide Arrows */}
              <g fill="#64748b" fontSize="11" fontFamily="sans-serif" fontWeight="bold">
                <text x="50" y="195">◀ MENUJU KRAMAT</text>
                <text x="50" y="275">◀ MENUJU MANGGARAI</text>
                <text x="50" y="660">◀ MENUJU BEKASI TIMUR</text>
                <text x="1300" y="380" textAnchor="end">MENUJU BEKASI ▶</text>
              </g>

              {/* TOP TRACKS: Kramat/Manggarai -> Jatinegara -> Klender -> Buaran */}
              {/* Kramat Branch line */}
              <path d="M 80 190 L 260 190 L 340 200" fill="none" stroke="#334155" strokeWidth="4" />
              <path d="M 80 190 L 260 190 L 340 200" fill="none" stroke="#10b981" strokeWidth="2.5" strokeDasharray="6,3" />

              {/* Manggarai Inbound Tracks */}
              <path d="M 80 270 L 260 270 L 360 250" fill="none" stroke="#334155" strokeWidth="4" />
              <path d="M 80 270 L 260 270 L 360 250" fill="none" stroke="#06b6d4" strokeWidth="2.5" />

              {/* Jatinegara Emplasemen Tracks (Jalur 1 - 8) */}
              <g stroke="#334155" strokeWidth="3" fill="none">
                <path d="M 320 180 L 580 180" />
                <path d="M 320 200 L 580 200" />
                <path d="M 320 220 L 580 220" />
                <path d="M 320 240 L 580 240" />
                <path d="M 320 260 L 580 260" />
                <path d="M 320 280 L 580 280" />
                <path d="M 320 300 L 580 300" />
                <path d="M 320 320 L 580 320" />
              </g>

              {/* Jatinegara Platforms */}
              <rect x="380" y="185" width="130" height="9" rx="2" fill="#475569" opacity="0.9" />
              <text x="445" y="192" fill="#f8fafc" fontSize="7" textAnchor="middle" fontWeight="bold">PERON 4</text>

              <rect x="380" y="225" width="130" height="9" rx="2" fill="#475569" opacity="0.9" />
              <text x="445" y="232" fill="#f8fafc" fontSize="7" textAnchor="middle" fontWeight="bold">PERON 3</text>

              <rect x="380" y="265" width="130" height="9" rx="2" fill="#475569" opacity="0.9" />
              <text x="445" y="272" fill="#f8fafc" fontSize="7" textAnchor="middle" fontWeight="bold">PERON 2</text>

              <rect x="380" y="305" width="130" height="9" rx="2" fill="#475569" opacity="0.9" />
              <text x="445" y="312" fill="#f8fafc" fontSize="7" textAnchor="middle" fontWeight="bold">PERON 1</text>

              {/* Top Main Catenary Lines: Hulu & Hilir */}
              {/* Hulu (HI) Line */}
              <path
                d="M 580 280 L 720 260 L 1220 260"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="4"
                filter="url(#neonCyan)"
              />
              <text x="890" y="252" fill="#67e8f9" fontSize="9" fontWeight="bold">JALUR HULU (HI) — 1500 V DC</text>

              {/* Hilir (HU) Line */}
              <path
                d="M 580 300 L 720 280 L 1220 280"
                fill="none"
                stroke="#10b981"
                strokeWidth="4"
                filter="url(#neonGreen)"
              />
              <text x="890" y="296" fill="#34d399" fontSize="9" fontWeight="bold">JALUR HILIR (HU) — 1500 V DC</text>

              {/* Curve connecting upper corridor to lower corridor */}
              <path
                d="M 1220 260 C 1300 260, 1300 360, 1220 400 L 1150 440 L 1220 540"
                fill="none"
                stroke="#334155"
                strokeWidth="4"
              />
              <path
                d="M 1220 280 C 1320 280, 1320 360, 1240 420 L 1170 460 L 1220 560"
                fill="none"
                stroke="#334155"
                strokeWidth="4"
              />

              {/* BOTTOM TRACKS: Klender Baru -> Cakung -> Kranji -> Bekasi */}
              {/* Hilir Line Bottom */}
              <path
                d="M 1220 540 L 150 540"
                fill="none"
                stroke="#10b981"
                strokeWidth="4"
                filter="url(#neonGreen)"
              />
              <text x="680" y="532" fill="#34d399" fontSize="9" fontWeight="bold">JALUR HILIR (HU) ARAH BEKASI</text>

              {/* Hulu Line Bottom */}
              <path
                d="M 1220 560 L 150 560"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="4"
                filter="url(#neonCyan)"
              />
              <text x="680" y="578" fill="#67e8f9" fontSize="9" fontWeight="bold">JALUR HULU (HI) ARAH BEKASI</text>

              {/* Stasiun Bekasi Tracks & Emplasemen */}
              <g stroke="#334155" strokeWidth="3" fill="none">
                <path d="M 450 490 L 220 490" />
                <path d="M 450 510 L 220 510" />
                <path d="M 450 590 L 220 590" />
                <path d="M 450 610 L 220 610" />
              </g>

              {/* Stations Vector Labels */}
              {showStations && stations.map((st) => {
                const px = (st.xPos / 100) * 1400;
                const py = (st.yPos / 100) * 750;

                return (
                  <g
                    key={st.id}
                    className="interactive-pin cursor-pointer group"
                    onClick={() => onSelectStation && onSelectStation(st.code)}
                  >
                    <rect
                      x={px - 65}
                      y={py - 16}
                      width="130"
                      height="30"
                      rx="6"
                      fill="#0f172a"
                      stroke="#3b82f6"
                      strokeWidth="1.5"
                      className="group-hover:stroke-orange-400 group-hover:fill-slate-800 transition-colors shadow-lg"
                    />
                    <text
                      x={px}
                      y={py - 2}
                      fill="#ffffff"
                      fontSize="9.5"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {st.name}
                    </text>
                    <text
                      x={px}
                      y={py + 10}
                      fill="#38bdf8"
                      fontSize="7.5"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {st.km}
                    </text>
                  </g>
                );
              })}

              {/* Disconnecting Switches on Vector */}
              {showSwitches && switches.map((sw) => {
                const px = (sw.mapCoordX / 100) * 1400;
                const py = (sw.mapCoordY / 100) * 750;
                const isClosed = sw.currentState === 'NC';
                const isLocked = sw.isInterlocked;

                return (
                  <g
                    key={sw.id}
                    className="interactive-pin cursor-pointer group"
                    onClick={() => setSelectedPin(sw)}
                  >
                    {isClosed && (
                      <circle
                        cx={px}
                        cy={py}
                        r="16"
                        fill="#10b981"
                        fillOpacity="0.25"
                        className="animate-ping"
                      />
                    )}
                    <circle
                      cx={px}
                      cy={py}
                      r="12"
                      fill={isClosed ? '#10b981' : '#f59e0b'}
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                    <text
                      x={px}
                      y={py + 26}
                      fill={isClosed ? '#a7f3d0' : '#fde68a'}
                      fontSize="8.5"
                      fontWeight="bold"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {sw.code} [{sw.currentState}]
                    </text>
                  </g>
                );
              })}

            </svg>
          )}
        </div>

        {/* Selected Switch Control Popover */}
        {selectedPin && (
          <div className="absolute top-4 right-4 z-40 w-84 bg-slate-900/95 border border-slate-700 rounded-2xl shadow-2xl backdrop-blur-md p-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-3.5 h-3.5 rounded-full ${
                    selectedPin.currentState === 'NC' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  }`}
                />
                <h3 className="font-extrabold text-white text-base font-mono">{selectedPin.code}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                  {selectedPin.lineType}
                </span>
              </div>
              <button
                onClick={() => setSelectedPin(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="py-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Seksi Suplai:</span>
                <span className="font-bold text-white text-right truncate max-w-[170px]" title={selectedPin.feedSection}>
                  {selectedPin.feedSection}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Lokasi KM:</span>
                <span className="font-mono font-bold text-cyan-300">{selectedPin.locationKm}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tegangan Terukur:</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  {selectedPin.voltageValue} V DC
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Arus Beban:</span>
                <span className="font-mono font-bold text-yellow-400 text-sm">
                  {selectedPin.currentLoad} A
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Suhu Kontak:</span>
                <span className="font-mono text-slate-300">{selectedPin.temperature} °C</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Proteksi Interlock:</span>
                <span className="font-semibold">
                  {selectedPin.isInterlocked ? (
                    <span className="text-amber-400 flex items-center text-[11px]">
                      <Lock className="w-3 h-3 mr-1" /> TERKUNCI (LOCKED)
                    </span>
                  ) : (
                    <span className="text-emerald-400 flex items-center text-[11px]">
                      <Unlock className="w-3 h-3 mr-1" /> SIAGA OPERASI
                    </span>
                  )}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-3 border-t border-slate-800 flex items-center space-x-2">
              <button
                onClick={async () => {
                  if (onToggleInterlock) {
                    await onToggleInterlock(selectedPin.code);
                    setSelectedPin((prev) => ({
                      ...prev,
                      isInterlocked: !prev.isInterlocked,
                    }));
                  }
                }}
                className={`p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                  selectedPin.isInterlocked
                    ? 'bg-purple-950/80 border-purple-600 text-purple-300 hover:bg-purple-900'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
                title={selectedPin.isInterlocked ? 'Buka Interlock' : 'Kunci Sakelar (Safety Lock)'}
              >
                {selectedPin.isInterlocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              </button>

              <button
                disabled={selectedPin.isInterlocked}
                onClick={async () => {
                  if (onToggleSwitch) {
                    await onToggleSwitch(selectedPin.code);
                    const nextState = selectedPin.currentState === 'NC' ? 'NO' : 'NC';
                    setSelectedPin((prev) => ({
                      ...prev,
                      currentState: nextState,
                      voltageValue: nextState === 'NC' ? 1514.2 : 0.0,
                      currentLoad: nextState === 'NC' ? 480.0 : 0.0,
                    }));
                  }
                }}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer shadow-lg ${
                  selectedPin.isInterlocked
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : selectedPin.currentState === 'NC'
                    ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>
                  {selectedPin.currentState === 'NC'
                    ? 'BUKA BEBAN (NO / ISOLASI)'
                    : 'TUTUP SAKELAR (NC / ALIRAN)'}
                </span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
