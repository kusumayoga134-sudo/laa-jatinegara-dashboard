import React, { useState, useRef } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Eye, Layers, Zap, Info, ShieldCheck, Lock, Unlock } from 'lucide-react';

export default function SchematicViewer({
  switches = [],
  stations = [],
  assets = [],
  onSelectSwitch,
  onToggleSwitch,
  onSelectStation,
}) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [viewMode, setViewMode] = useState('svg'); // 'svg' (vector dynamic) or 'original' (high-res official print)
  
  // Visibility filters
  const [showSwitches, setShowSwitches] = useState(true);
  const [showStations, setShowStations] = useState(true);
  const [showAssets, setShowAssets] = useState(true);
  const [selectedPin, setSelectedPin] = useState(null);

  const containerRef = useRef(null);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.6));
  const handleResetZoom = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    setSelectedPin(null);
  };

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

  // Positions mapped onto the 1200x650 SVG canvas
  const stationCoords = {
    PND: { x: 120, y: 180, name: 'ST. PONDOK JATI', km: 'KM 10+400' },
    JNG: { x: 340, y: 150, name: 'ST. JATINEGARA', km: 'KM 11+750' },
    KLD: { x: 670, y: 220, name: 'ST. KLENDER', km: 'KM 15+027' },
    BUA: { x: 880, y: 220, name: 'ST. BUARAN', km: 'KM 17+500' },
    KLDB: { x: 920, y: 460, name: 'ST. KLENDER BARU', km: 'KM 19+546' },
    CUK: { x: 740, y: 460, name: 'ST. CAKUNG', km: 'KM 20+943' },
    KRI: { x: 530, y: 460, name: 'ST. KRANJI', km: 'KM 23+987' },
    BKS: { x: 260, y: 460, name: 'ST. BEKASI', km: 'KM 26+403' },
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl relative flex flex-col">
      
      {/* Control Bar */}
      <div className="bg-slate-950/90 border-b border-slate-800 p-3 flex flex-wrap items-center justify-between gap-3 z-10">
        
        {/* View Mode Toggle */}
        <div className="flex items-center space-x-2">
          <div className="bg-slate-800 p-1 rounded-lg flex space-x-1 border border-slate-700">
            <button
              onClick={() => setViewMode('svg')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                viewMode === 'svg'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ⚡ Skematik Vektor Dinamis
            </button>
            <button
              onClick={() => setViewMode('original')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                viewMode === 'original'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              📄 Dokumen Cetak Asli (High-Res)
            </button>
          </div>

          <span className="text-xs text-slate-400 hidden sm:inline">
            | Geser & Zoom untuk melihat rincian jalur LAA
          </span>
        </div>

        {/* Layer Toggles & Zoom Controls */}
        <div className="flex items-center space-x-2">
          {viewMode === 'svg' && (
            <div className="hidden md:flex items-center space-x-2 mr-2">
              <label className="flex items-center space-x-1.5 text-xs text-slate-300 cursor-pointer bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700">
                <input
                  type="checkbox"
                  checked={showSwitches}
                  onChange={(e) => setShowSwitches(e.target.checked)}
                  className="rounded text-blue-500 focus:ring-0"
                />
                <span>Sakelar (DS)</span>
              </label>

              <label className="flex items-center space-x-1.5 text-xs text-slate-300 cursor-pointer bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700">
                <input
                  type="checkbox"
                  checked={showStations}
                  onChange={(e) => setShowStations(e.target.checked)}
                  className="rounded text-blue-500 focus:ring-0"
                />
                <span>Stasiun</span>
              </label>

              <label className="flex items-center space-x-1.5 text-xs text-slate-300 cursor-pointer bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700">
                <input
                  type="checkbox"
                  checked={showAssets}
                  onChange={(e) => setShowAssets(e.target.checked)}
                  className="rounded text-blue-500 focus:ring-0"
                />
                <span>AJ / AS / FRP</span>
              </label>
            </div>
          )}

          {/* Zoom Buttons */}
          <div className="flex items-center space-x-1 bg-slate-800 rounded-lg p-1 border border-slate-700">
            <button
              onClick={handleZoomOut}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition"
              title="Perkecil (-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-semibold px-2 text-slate-300">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition"
              title="Perbesar (+)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition"
              title="Reset Tampilan"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Canvas Viewport */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="w-full h-[580px] overflow-hidden bg-slate-950 cursor-grab active:cursor-grabbing relative select-none"
      >
        <div
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
            transformOrigin: 'top left',
            transition: isDragging ? 'none' : 'transform 0.15s ease-out',
          }}
          className="w-full h-full min-w-[1200px] min-h-[650px] relative"
        >
          {viewMode === 'original' ? (
            /* High-Res Original Document with live overlay pins */
            <div className="relative w-[1300px] h-auto p-4">
              <img
                src="/schematic-map-web.png"
                alt="Peta Wilayah UPT Resor LAA 1.9 Jatinegara Asli"
                className="w-full h-auto rounded border border-slate-700 shadow-2xl"
              />
              
              {/* Overlay Interactive Switch Hotspots on Original PDF */}
              <div className="absolute inset-0 pointer-events-auto">
                {switches.map((sw) => {
                  const isClosed = sw.currentState === 'NC';
                  return (
                    <button
                      key={sw.id}
                      onClick={() => setSelectedPin(sw)}
                      title={`${sw.code} - ${sw.feedSection} [${sw.currentState}]`}
                      style={{
                        left: `${(sw.mapCoordX / 1150) * 100}%`,
                        top: `${(sw.mapCoordY / 850) * 100}%`,
                      }}
                      className={`interactive-pin absolute -translate-x-1/2 -translate-y-1/2 p-1 rounded-full shadow-lg border-2 transition-all cursor-pointer ${
                        isClosed
                          ? 'bg-emerald-500 border-white text-white shadow-emerald-500/50 animate-pulse'
                          : 'bg-amber-500 border-slate-900 text-slate-950 shadow-amber-500/40'
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5" />
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Interactive Vector Dynamic SCADA SVG */
            <svg
              viewBox="0 0 1200 650"
              className="w-full h-full"
              style={{ backgroundColor: '#090d16' }}
            >
              <defs>
                {/* Grid Pattern */}
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" strokeOpacity="0.4" />
                </pattern>

                {/* Glow Filter for Energized Tracks */}
                <filter id="energizedGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Background Grid */}
              <rect width="1200" height="650" fill="url(#grid)" />

              {/* Corridor Direction Arrows */}
              <g fill="#64748b" fontSize="11" fontFamily="sans-serif" fontWeight="bold">
                <text x="30" y="165">◀ DARI KRAMAT</text>
                <text x="30" y="245">◀ DARI MANGGARAI</text>
                <text x="30" y="560">◀ MENUJU BEKASI TIMUR</text>
                <text x="1100" y="340">KE BEKASI ▶</text>
              </g>

              {/* Corridor Background Tracks & Catenary Wire Lines */}
              {/* TOP CORRIDOR: Kramat / Manggarai -> Jatinegara -> Klender -> Buaran */}
              
              {/* Kramat Branch line */}
              <path d="M 60 160 L 220 160 L 300 170" fill="none" stroke="#334155" strokeWidth="4" />
              <path d="M 60 160 L 220 160 L 300 170" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="6,2" />

              {/* Manggarai Inbound Tracks */}
              <path d="M 60 240 L 220 240 L 320 230" fill="none" stroke="#334155" strokeWidth="4" />
              <path d="M 60 240 L 220 240 L 320 230" fill="none" stroke="#06b6d4" strokeWidth="2" />

              {/* Stasiun Jatinegara Multi-Track Complex (Jalur 1 - 8) */}
              <g stroke="#334155" strokeWidth="3" fill="none">
                <path d="M 280 170 L 480 170" /> {/* Jalur 8 */}
                <path d="M 280 190 L 480 190" /> {/* Jalur 7 */}
                <path d="M 280 210 L 480 210" /> {/* Jalur 6 */}
                <path d="M 280 230 L 480 230" /> {/* Jalur 5 */}
                <path d="M 280 250 L 480 250" /> {/* Jalur 4 */}
                <path d="M 280 270 L 480 270" /> {/* Jalur 3 */}
                <path d="M 280 290 L 480 290" /> {/* Jalur 2 */}
                <path d="M 280 310 L 480 310" /> {/* Jalur 1 */}
              </g>

              {/* Jatinegara Platform Indicator Bars */}
              <rect x="330" y="175" width="100" height="8" rx="2" fill="#475569" opacity="0.8" />
              <text x="380" y="182" fill="#f8fafc" fontSize="7" textAnchor="middle" fontWeight="bold">PERON 4</text>

              <rect x="330" y="215" width="100" height="8" rx="2" fill="#475569" opacity="0.8" />
              <text x="380" y="222" fill="#f8fafc" fontSize="7" textAnchor="middle" fontWeight="bold">PERON 3</text>

              <rect x="330" y="255" width="100" height="8" rx="2" fill="#475569" opacity="0.8" />
              <text x="380" y="262" fill="#f8fafc" fontSize="7" textAnchor="middle" fontWeight="bold">PERON 2</text>

              <rect x="330" y="295" width="100" height="8" rx="2" fill="#475569" opacity="0.8" />
              <text x="380" y="302" fill="#f8fafc" fontSize="7" textAnchor="middle" fontWeight="bold">PERON 1</text>

              {/* Main Line: Jatinegara to Klender & Buaran */}
              {/* Hilir (HU) Line */}
              <path
                d="M 480 290 L 620 270 L 1050 270"
                fill="none"
                stroke="#10b981"
                strokeWidth="3.5"
                filter="url(#energizedGlow)"
              />
              <text x="780" y="262" fill="#34d399" fontSize="9" fontWeight="bold">JALUR HILIR (HU) — 1500V DC</text>

              {/* Hulu (HI) Line */}
              <path
                d="M 480 270 L 620 250 L 1050 250"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="3.5"
                filter="url(#energizedGlow)"
              />
              <text x="780" y="244" fill="#67e8f9" fontSize="9" fontWeight="bold">JALUR HULU (HI) — 1500V DC</text>

              {/* Loop track around Klender Baru to Cakung (Looping Downwards) */}
              <path
                d="M 1050 250 C 1120 250, 1120 330, 1050 350 L 1000 380 L 1050 490"
                fill="none"
                stroke="#334155"
                strokeWidth="3"
              />
              <path
                d="M 1050 270 C 1140 270, 1140 330, 1080 370 L 1020 410 L 1050 510"
                fill="none"
                stroke="#334155"
                strokeWidth="3"
              />

              {/* BOTTOM CORRIDOR: Klender Baru -> Cakung -> Kranji -> Bekasi */}
              {/* Hilir Line Bottom */}
              <path
                d="M 1050 490 L 150 490"
                fill="none"
                stroke="#10b981"
                strokeWidth="3.5"
                filter="url(#energizedGlow)"
              />
              <text x="560" y="482" fill="#34d399" fontSize="9" fontWeight="bold">JALUR HILIR (HU) ARAH BEKASI</text>

              {/* Hulu Line Bottom */}
              <path
                d="M 1050 510 L 150 510"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="3.5"
                filter="url(#energizedGlow)"
              />
              <text x="560" y="528" fill="#67e8f9" fontSize="9" fontWeight="bold">JALUR HULU (HI) ARAH BEKASI</text>

              {/* Stasiun Bekasi Multi-Track Complex (Jalur 1 - 8) */}
              <g stroke="#334155" strokeWidth="2.5" fill="none">
                <path d="M 360 440 L 180 440" /> {/* Jalur 8 */}
                <path d="M 360 460 L 180 460" /> {/* Jalur 7 */}
                <path d="M 360 530 L 180 530" /> {/* Emplasemen 4-5 */}
                <path d="M 360 550 L 180 550" /> {/* Emplasemen 6-7,8 */}
              </g>

              {/* Bekasi Platforms */}
              <rect x="220" y="445" width="80" height="7" rx="2" fill="#475569" opacity="0.8" />
              <rect x="220" y="495" width="80" height="7" rx="2" fill="#475569" opacity="0.8" />

              {/* Wesel Points (Switches W) */}
              <g fill="#f97316" stroke="#f97316">
                <circle cx="270" cy="270" r="3" />
                <text x="270" y="263" fontSize="8" fill="#fdba74" textAnchor="middle">W11A</text>

                <circle cx="295" cy="250" r="3" />
                <text x="295" y="243" fontSize="8" fill="#fdba74" textAnchor="middle">W21B</text>

                <circle cx="490" cy="270" r="3" />
                <text x="490" y="263" fontSize="8" fill="#fdba74" textAnchor="middle">W31A</text>

                <circle cx="510" cy="290" r="3" />
                <text x="510" y="283" fontSize="8" fill="#fdba74" textAnchor="middle">W51B</text>
              </g>

              {/* STATIONS MARKERS */}
              {showStations && Object.entries(stationCoords).map(([code, st]) => {
                const isSelected = selectedPin?.stationId === st.id || selectedPin?.code === code;
                return (
                  <g
                    key={code}
                    className="interactive-pin cursor-pointer group"
                    onClick={() => onSelectStation && onSelectStation(code)}
                  >
                    {/* Station Box */}
                    <rect
                      x={st.x - 65}
                      y={st.y - 32}
                      width="130"
                      height="26"
                      rx="4"
                      fill="#0f172a"
                      stroke={isSelected ? '#f97316' : '#3b82f6'}
                      strokeWidth="1.5"
                      className="group-hover:stroke-orange-400 transition-colors"
                    />
                    <text
                      x={st.x}
                      y={st.y - 20}
                      fill="#ffffff"
                      fontSize="9.5"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {st.name}
                    </text>
                    <text
                      x={st.x}
                      y={st.y - 10}
                      fill="#94a3b8"
                      fontSize="7.5"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {st.km}
                    </text>
                    {/* Anchor line to track */}
                    <line
                      x1={st.x}
                      y1={st.y - 6}
                      x2={st.x}
                      y2={st.y + 12}
                      stroke="#3b82f6"
                      strokeWidth="1"
                      strokeDasharray="2,2"
                    />
                  </g>
                );
              })}

              {/* ASSETS: Air Joints (AJ) & Air Sections (AS) */}
              {showAssets && assets.map((asset) => {
                const isAirJoint = asset.type === 'AIR_JOINT';
                const isAirSection = asset.type === 'AIR_SECTION';
                const isFRP = asset.type === 'FRP';

                // Approximation of KM to X position on top or bottom corridor
                let posX = 400;
                let posY = 260;
                const kmNum = parseFloat(asset.locationKm?.replace('KM ', '').replace('+', '.')) || 15;

                if (kmNum < 18.5) {
                  posX = 150 + ((kmNum - 10) / 8.5) * 850;
                  posY = isAirJoint ? 235 : 285;
                } else {
                  posX = 1000 - ((kmNum - 18.5) / 8.5) * 850;
                  posY = isAirJoint ? 475 : 525;
                }

                return (
                  <g key={asset.id} className="cursor-pointer group">
                    {isAirJoint && (
                      <g transform={`translate(${posX - 10}, ${posY - 6})`}>
                        <title>{`${asset.code} (${asset.name})`}</title>
                        <rect x="0" y="0" width="20" height="12" rx="2" fill="#0284c7" fillOpacity="0.3" stroke="#38bdf8" strokeWidth="0.8" />
                        <text x="10" y="9" fontSize="6.5" fill="#bae6fd" textAnchor="middle" fontWeight="bold">AJ</text>
                      </g>
                    )}

                    {isAirSection && (
                      <g transform={`translate(${posX - 10}, ${posY - 6})`}>
                        <title>{`${asset.code} (${asset.name})`}</title>
                        <rect x="0" y="0" width="20" height="12" rx="2" fill="#d97706" fillOpacity="0.3" stroke="#fbbf24" strokeWidth="0.8" />
                        <text x="10" y="9" fontSize="6.5" fill="#fef3c7" textAnchor="middle" fontWeight="bold">AS</text>
                      </g>
                    )}

                    {isFRP && (
                      <g transform={`translate(${posX - 12}, ${posY - 6})`}>
                        <title>{`${asset.code} (${asset.name})`}</title>
                        <rect x="0" y="0" width="24" height="12" rx="2" fill="#059669" fillOpacity="0.3" stroke="#34d399" strokeWidth="0.8" />
                        <text x="12" y="9" fontSize="6" fill="#a7f3d0" textAnchor="middle" fontWeight="bold">FRP</text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* DISCONNECTING SWITCHES (DS 1 - DS 20) */}
              {showSwitches && switches.map((sw) => {
                const isClosed = sw.currentState === 'NC';
                const isLocked = sw.isInterlocked;
                const isSelected = selectedPin?.id === sw.id;

                // Adjust mapCoordX & Y to fit 1200x650
                const px = (sw.mapCoordX / 1000) * 1100 + 40;
                const py = (sw.mapCoordY / 850) * 560 + 50;

                return (
                  <g
                    key={sw.id}
                    className="interactive-pin cursor-pointer group"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPin(sw);
                      onSelectSwitch && onSelectSwitch(sw);
                    }}
                  >
                    {/* Outer Glow when closed */}
                    {isClosed && (
                      <circle
                        cx={px}
                        cy={py}
                        r="14"
                        fill="#10b981"
                        fillOpacity="0.25"
                        className="animate-ping"
                      />
                    )}

                    {/* Switch Node Circle */}
                    <circle
                      cx={px}
                      cy={py}
                      r="10"
                      fill={isClosed ? '#10b981' : '#475569'}
                      stroke={isSelected ? '#f97316' : '#ffffff'}
                      strokeWidth={isSelected ? '2.5' : '1.5'}
                      className="group-hover:scale-125 transition-transform origin-center"
                    />

                    {/* Inner Icon: Zap or Lock */}
                    {isLocked ? (
                      <circle cx={px} cy={py} r="3" fill="#f59e0b" />
                    ) : (
                      <circle cx={px} cy={py} r="3" fill="#ffffff" />
                    )}

                    {/* Switch Label Badge */}
                    <rect
                      x={px - 26}
                      y={py + 13}
                      width="52"
                      height="16"
                      rx="3"
                      fill="#0f172a"
                      stroke={isClosed ? '#10b981' : '#64748b'}
                      strokeWidth="1"
                    />
                    <text
                      x={px}
                      y={py + 24}
                      fill={isClosed ? '#a7f3d0' : '#cbd5e1'}
                      fontSize="8"
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

        {/* Selected Switch Popup Dialog Overlay inside the Map */}
        {selectedPin && (
          <div className="absolute top-4 right-4 z-30 w-80 bg-slate-900/95 border border-slate-700/80 rounded-xl shadow-2xl backdrop-blur-md p-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    selectedPin.currentState === 'NC' ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                />
                <h3 className="font-bold text-white text-base font-mono">{selectedPin.code}</h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {selectedPin.lineType}
                </span>
              </div>
              <button
                onClick={() => setSelectedPin(null)}
                className="text-slate-400 hover:text-white text-sm p-1 rounded hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="py-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Nama Seksi:</span>
                <span className="font-semibold text-slate-200 text-right">{selectedPin.feedSection}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Lokasi:</span>
                <span className="font-mono text-cyan-300">{selectedPin.locationKm}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tegangan Terukur:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {selectedPin.voltageValue} V DC
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Arus Beban:</span>
                <span className="font-mono font-bold text-yellow-400">
                  {selectedPin.currentLoad} Ampere
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Suhu Kontak Pisau:</span>
                <span className="font-mono text-slate-300">{selectedPin.temperature} °C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Safety Interlock:</span>
                <span className="font-semibold">
                  {selectedPin.isInterlocked ? (
                    <span className="text-amber-400 flex items-center">
                      <Lock className="w-3 h-3 mr-1" /> TERKUNCI
                    </span>
                  ) : (
                    <span className="text-emerald-400 flex items-center">
                      <Unlock className="w-3 h-3 mr-1" /> AKTIF SIAGA
                    </span>
                  )}
                </span>
              </div>
            </div>

            {/* Actions: Toggle Switch & Lock */}
            <div className="pt-2 border-t border-slate-800 flex items-center space-x-2">
              <button
                disabled={selectedPin.isInterlocked}
                onClick={async () => {
                  if (onToggleSwitch) {
                    await onToggleSwitch(selectedPin.code);
                    setSelectedPin((prev) => ({
                      ...prev,
                      currentState: prev.currentState === 'NC' ? 'NO' : 'NC',
                      voltageValue: prev.currentState === 'NC' ? 0.0 : 1515.0,
                    }));
                  }
                }}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                  selectedPin.isInterlocked
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : selectedPin.currentState === 'NC'
                    ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/30'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>
                  {selectedPin.currentState === 'NC' ? 'PUTUS BEBAN (BUKA NO)' : 'ALIRKAN LISTRIK (TUTUP NC)'}
                </span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
