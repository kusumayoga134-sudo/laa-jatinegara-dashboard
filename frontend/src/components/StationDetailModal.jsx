import React from 'react';
import { MapPin, Zap, Layers, X, Train, ShieldCheck } from 'lucide-react';

export default function StationDetailModal({ station, onClose, onSelectSwitch }) {
  if (!station) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-slate-950 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
            <div className="p-2 rounded-xl bg-blue-900/40 border border-blue-700/60 text-blue-400 shrink-0">
              <Train className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 shrink-0">
                  {station.code}
                </span>
                <span className="text-xs font-mono text-cyan-300 font-bold truncate">{station.km}</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mt-0.5 truncate">{station.name}</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 text-xs text-slate-300 max-h-[75vh] overflow-y-auto">
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
            <div className="bg-slate-950 p-2.5 sm:p-3 rounded-xl border border-slate-800 flex items-center justify-between sm:block">
              <span className="text-slate-400 text-[10px] block">Jumlah Jalur:</span>
              <span className="font-mono font-bold text-white text-sm sm:text-base">
                {station.tracksCount} Jalur Kereta
              </span>
            </div>
            <div className="bg-slate-950 p-2.5 sm:p-3 rounded-xl border border-slate-800 flex items-center justify-between sm:block">
              <span className="text-slate-400 text-[10px] block">Jumlah Peron:</span>
              <span className="font-mono font-bold text-white text-sm sm:text-base">
                {station.platforms} Peron Penumpang
              </span>
            </div>
            <div className="bg-slate-950 p-2.5 sm:p-3 rounded-xl border border-slate-800 flex items-center justify-between sm:block">
              <span className="text-slate-400 text-[10px] block">Status Operasi:</span>
              <span className="font-mono font-bold text-emerald-400 text-sm sm:text-base">
                {station.status}
              </span>
            </div>
          </div>

          {/* Description */}
          {station.description && (
            <div className="bg-slate-950/60 p-3 sm:p-3.5 rounded-xl border border-slate-800/80">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Keterangan Stasiun
              </span>
              <p className="text-slate-300 leading-relaxed text-[11px] sm:text-xs">{station.description}</p>
            </div>
          )}

          {/* Associated Disconnecting Switches */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              Pemutus Beban (DS) Terpasang di {station.name}
            </h4>
            {station.switches && station.switches.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {station.switches.map((sw) => (
                  <div
                    key={sw.id}
                    onClick={() => {
                      onClose();
                      onSelectSwitch && onSelectSwitch(sw);
                    }}
                    className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 transition cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono font-bold text-white">{sw.code}</span>
                        <span className="text-[9px] px-1 bg-slate-800 text-slate-300 rounded">
                          {sw.lineType}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[180px]">
                        {sw.feedSection}
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        sw.currentState === 'NC'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                          : 'bg-amber-950 text-amber-300 border border-amber-700/60'
                      }`}
                    >
                      {sw.currentState}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-slate-500 italic">Tidak ada sakelar DS utama di stasiun ini.</div>
            )}
          </div>

          {/* Associated Assets (AJ / AS / FRP) */}
          {station.assets && station.assets.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                Komponen LAA di Area Stasiun
              </h4>
              <div className="space-y-1.5">
                {station.assets.map((asset) => (
                  <div
                    key={asset.id}
                    className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-cyan-300">{asset.code}</span>
                      <span className="text-slate-400">• {asset.locationKm}</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-semibold">
                      {asset.condition}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
}
