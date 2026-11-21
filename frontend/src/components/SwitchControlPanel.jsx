import React, { useState } from 'react';
import { Zap, Lock, Unlock, Search, Filter, ShieldCheck, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function SwitchControlPanel({
  switches = [],
  onToggleSwitch,
  onToggleInterlock,
  isLoading,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStation, setSelectedStation] = useState('ALL');
  const [selectedLine, setSelectedLine] = useState('ALL');
  const [selectedState, setSelectedState] = useState('ALL');

  // Filter switches
  const filteredSwitches = switches.filter((sw) => {
    const matchSearch =
      sw.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sw.feedSection.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sw.locationKm.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStation =
      selectedStation === 'ALL' || sw.station?.code === selectedStation;

    const matchLine =
      selectedLine === 'ALL' || sw.lineType === selectedLine;

    const matchState =
      selectedState === 'ALL' || sw.currentState === selectedState;

    return matchSearch && matchStation && matchLine && matchState;
  });

  const ncCount = switches.filter((s) => s.currentState === 'NC').length;
  const noCount = switches.filter((s) => s.currentState === 'NO').length;
  const lockedCount = switches.filter((s) => s.isInterlocked).length;

  return (
    <div className="space-y-4">
      
      {/* Top Overview KPI Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Total Sakelar (DS)</div>
            <div className="text-2xl font-bold font-mono text-white mt-1">{switches.length} Unit</div>
          </div>
          <div className="p-2.5 rounded-lg bg-blue-900/40 border border-blue-700/50 text-blue-400">
            <Zap className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-emerald-400 uppercase tracking-wider">NC (Tertutup / Aliran)</div>
            <div className="text-2xl font-bold font-mono text-emerald-300 mt-1">{ncCount} Unit</div>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-900/40 border border-emerald-700/50 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-amber-400 uppercase tracking-wider">NO (Terbuka / Isolasi)</div>
            <div className="text-2xl font-bold font-mono text-amber-300 mt-1">{noCount} Unit</div>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-900/40 border border-amber-700/50 text-amber-400">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-purple-400 uppercase tracking-wider">Interlock Locked</div>
            <div className="text-2xl font-bold font-mono text-purple-300 mt-1">{lockedCount} Unit</div>
          </div>
          <div className="p-2.5 rounded-lg bg-purple-900/40 border border-purple-700/50 text-purple-400">
            <Lock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-lg">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari DS (mis. DS 4, JALUR 1)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-base sm:text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Station filter */}
          <select
            value={selectedStation}
            onChange={(e) => setSelectedStation(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg text-base sm:text-xs text-slate-300 px-3 py-1.5 focus:outline-none focus:border-blue-500 flex-1 sm:flex-none"
          >
            <option value="ALL">Semua Stasiun</option>
            <option value="JNG">St. Jatinegara</option>
            <option value="KLD">St. Klender</option>
            <option value="BUA">St. Buaran</option>
            <option value="KLDB">St. Klender Baru</option>
            <option value="CUK">St. Cakung</option>
            <option value="KRI">St. Kranji</option>
            <option value="BKS">St. Bekasi</option>
          </select>

          {/* Line Type */}
          <select
            value={selectedLine}
            onChange={(e) => setSelectedLine(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg text-base sm:text-xs text-slate-300 px-3 py-1.5 focus:outline-none focus:border-blue-500 flex-1 sm:flex-none"
          >
            <option value="ALL">Semua Lintasan</option>
            <option value="HI">Jalur Hulu (HI)</option>
            <option value="HU">Jalur Hilir (HU)</option>
            <option value="EMPL">Emplasemen (EMPL)</option>
          </select>

          {/* State */}
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg text-base sm:text-xs text-slate-300 px-3 py-1.5 focus:outline-none focus:border-blue-500 flex-1 sm:flex-none"
          >
            <option value="ALL">Semua Posisi</option>
            <option value="NC">Tertutup (NC)</option>
            <option value="NO">Terbuka (NO)</option>
          </select>
        </div>
      </div>

      {/* Switch Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredSwitches.map((sw) => {
          const isClosed = sw.currentState === 'NC';
          const isLocked = sw.isInterlocked;

          return (
            <div
              key={sw.id}
              className={`border rounded-xl p-4 transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
                isClosed
                  ? 'bg-slate-900/90 border-slate-700/80 shadow-md hover:border-emerald-500/60'
                  : 'bg-slate-950/80 border-slate-800 shadow-sm hover:border-amber-500/60'
              }`}
            >
              {/* Top Accent Strip */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 ${
                  isClosed ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />

              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-base font-extrabold text-white">{sw.code}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {sw.lineType}
                    </span>
                  </div>

                  {/* State badge */}
                  <div className="flex items-center space-x-1.5">
                    <span
                      className={`text-xs font-bold font-mono px-2 py-0.5 rounded-full flex items-center space-x-1 ${
                        isClosed
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/70'
                          : 'bg-amber-950 text-amber-300 border border-amber-600/70'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full mr-1 ${
                          isClosed ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
                        }`}
                      />
                      {sw.currentState} ({isClosed ? 'TERTUTUP' : 'TERBUKA'})
                    </span>
                  </div>
                </div>

                {/* Section Title */}
                <div className="text-xs font-semibold text-slate-200 truncate" title={sw.feedSection}>
                  {sw.feedSection}
                </div>
                <div className="text-[11px] text-cyan-400 font-mono mt-0.5">
                  {sw.station?.name || 'LAA'} • {sw.locationKm}
                </div>

                {/* Electrical Telemetry Metrics */}
                <div className="grid grid-cols-2 gap-2 my-3 p-2 bg-slate-950/90 rounded-lg border border-slate-800/80 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Tegangan:</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {sw.voltageValue} V DC
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Arus Beban:</span>
                    <span className="font-mono font-bold text-yellow-400">
                      {sw.currentLoad} A
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Suhu Kontak:</span>
                    <span className="font-mono text-slate-300">
                      {sw.temperature} °C
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Status Default:</span>
                    <span className="font-mono text-slate-400">
                      {sw.defaultState}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Toggle Switch & Interlock */}
              <div className="pt-2 border-t border-slate-800 flex items-center space-x-2">
                {/* Interlock button */}
                <button
                  onClick={() => onToggleInterlock && onToggleInterlock(sw.code)}
                  title={isLocked ? 'Buka Kunci Keselamatan' : 'Kunci Sakelar (Interlock Active)'}
                  className={`p-2 rounded-lg text-xs border transition cursor-pointer ${
                    isLocked
                      ? 'bg-purple-950/60 border-purple-600 text-purple-300 hover:bg-purple-900/80'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                </button>

                {/* Switch Toggle Button */}
                <button
                  disabled={isLocked || isLoading}
                  onClick={() => onToggleSwitch && onToggleSwitch(sw.code)}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                    isLocked
                      ? 'bg-slate-800/80 text-slate-500 cursor-not-allowed border border-slate-700'
                      : isClosed
                      ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/20'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>{isClosed ? 'BUKA SAKELAR (NO)' : 'TUTUP SAKELAR (NC)'}</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
