import React from 'react';
import { HelpCircle, CheckCircle2, AlertCircle, Zap, Shield, Split } from 'lucide-react';

export default function LegendGuide() {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
        <div className="flex items-center space-x-2">
          <HelpCircle className="w-5 h-5 text-orange-400" />
          <h2 className="text-base font-bold text-white uppercase tracking-wider">
            Keterangan & Simbol LAA (UPT Resor LAA 1.9 Jatinegara)
          </h2>
        </div>
        <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700">
          Standar Teknis LAA 1500 V DC KAI
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Air Joint */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-3 hover:border-slate-600 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-sky-300">Air Joint (AJ)</span>
            <div className="h-6 w-12 flex items-center justify-center bg-slate-900 rounded border border-slate-700 px-1">
              <svg viewBox="0 0 40 16" className="w-full h-full text-sky-400 stroke-current stroke-2">
                <line x1="2" y1="5" x2="26" y2="5" />
                <line x1="14" y1="11" x2="38" y2="11" />
              </svg>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Peralihan kawat kontak overlap mekanik tanpa pemisahan elektrik. Pantograf meluncur mulus antar dua kawat tarikan.
          </p>
        </div>

        {/* Air Section */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-3 hover:border-slate-600 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-300">Air Section (AS)</span>
            <div className="h-6 w-12 flex items-center justify-center bg-slate-900 rounded border border-slate-700 px-1">
              <svg viewBox="0 0 40 16" className="w-full h-full text-amber-400 stroke-current stroke-2">
                <line x1="12" y1="3" x2="28" y2="13" />
                <line x1="28" y1="3" x2="12" y2="13" />
              </svg>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Pemisah elektrik melalui celah udara antar seksi suplai gardu traksi untuk mencegah hubung singkat dua sumber daya berbeda.
          </p>
        </div>

        {/* FRP */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-3 hover:border-slate-600 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-300">FRP (Section Insulator)</span>
            <div className="h-6 w-12 flex items-center justify-center bg-slate-900 rounded border border-slate-700 px-1">
              <svg viewBox="0 0 40 16" className="w-full h-full text-emerald-400 stroke-current stroke-2">
                <line x1="4" y1="8" x2="16" y2="8" />
                <line x1="24" y1="8" x2="36" y2="8" />
                <rect x="16" y="3" width="8" height="10" rx="1" fill="#10b981" />
              </svg>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Isolator batang Fiber Reinforced Plastic pada kawat kontak di wesel/percabangan jalur untuk membatasi pemadaman arus lokal.
          </p>
        </div>

        {/* Disconnecting Switch */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-3 hover:border-slate-600 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-purple-300">DS (Disconnecting Switch)</span>
            <div className="h-6 w-14 flex items-center justify-around bg-slate-900 rounded border border-slate-700 px-1">
              {/* NO */}
              <div className="flex flex-col items-center">
                <span className="text-[8px] text-slate-400 font-mono">NO</span>
                <span className="w-2 h-2 rounded-full border border-slate-400"></span>
              </div>
              {/* NC */}
              <div className="flex flex-col items-center">
                <span className="text-[8px] text-emerald-400 font-mono">NC</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Sakelar pemutus beban manual/motorized 1500V DC. <strong className="text-emerald-400">NC (Tertutup/Teraliri)</strong> & <strong className="text-amber-400">NO (Terbuka/Isolasi)</strong>.
          </p>
        </div>

        {/* Wesel & Joint */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-3 hover:border-slate-600 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-orange-300">Joint & Wesel (W)</span>
            <div className="h-6 w-12 flex items-center justify-center bg-slate-900 rounded border border-slate-700 px-1">
              <svg viewBox="0 0 40 16" className="w-full h-full text-orange-400 stroke-current stroke-2">
                <circle cx="20" cy="8" r="3" fill="#f97316" />
                <line x1="4" y1="8" x2="36" y2="8" />
              </svg>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Sambungan kawat pembawa dan percabangan wesel (mis. W11A, W21B, W31A). <strong>HU</strong>: Jalur Hilir, <strong>HI</strong>: Jalur Hulu.
          </p>
        </div>

      </div>
    </div>
  );
}
