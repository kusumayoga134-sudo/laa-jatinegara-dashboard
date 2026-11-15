import React, { useState, useEffect } from 'react';
import {
  Activity,
  ShieldCheck,
  Zap,
  Clock,
  Radio,
  AlertTriangle,
  Sun,
  Moon,
  Maximize2,
  RefreshCw,
} from 'lucide-react';

export default function Header({
  stats,
  activeAlertsCount,
  onOpenAlerts,
  isBlueprintMode,
  setIsBlueprintMode,
  onRefresh,
}) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const formattedDate = time.toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40 shadow-xl select-none">
      <div className="max-w-[1600px] mx-auto px-4 py-2.5 sm:px-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          
          {/* Left: Logos & Title */}
          <div className="flex items-center space-x-3.5">
            {/* Danantara Logo */}
            <div className="bg-white rounded-lg px-2.5 py-1.5 shadow-sm border border-slate-700 flex items-center justify-center h-11 w-32 shrink-0 overflow-hidden">
              <img
                src="/danantara-logo.png"
                alt="Danantara Indonesia Sovereign Fund"
                className="max-h-7 max-w-full object-contain"
                style={{ maxHeight: '28px', maxWidth: '110px' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>

            <div className="h-7 w-px bg-slate-700 hidden sm:block shrink-0" />

            {/* Title & Organization Info */}
            <div className="min-w-0">
              <div className="flex items-center space-x-2 flex-wrap">
                <span className="px-2 py-0.5 text-[10px] font-extrabold tracking-wider uppercase bg-blue-900/80 text-blue-300 rounded border border-blue-700/60">
                  DAOP 1 JAKARTA
                </span>
                <span className="px-2 py-0.5 text-[10px] font-extrabold tracking-wider uppercase bg-emerald-950 text-emerald-300 rounded border border-emerald-700/60 flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-1"></span>
                  SCADA LAA ONLINE
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-black text-white tracking-tight truncate mt-0.5">
                PETA WILAYAH UPT RESOR LAA 1.9 JATINEGARA
              </h1>
              <p className="text-[11px] text-slate-400 truncate">
                Lintas: Kramat / Manggarai — Jatinegara — Bekasi • Catenary 1500 V DC
              </p>
            </div>
          </div>

          {/* Right: Metrics & Actions */}
          <div className="flex items-center justify-between lg:justify-end space-x-3 flex-wrap">
            
            {/* System Status Chips */}
            <div className="flex items-center space-x-2 text-xs">
              {/* Voltage Metric */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1.5 flex items-center space-x-2">
                <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-[9px] text-slate-400 font-semibold leading-none uppercase">
                    TEGANGAN SISTEM
                  </div>
                  <div className="font-mono font-bold text-emerald-300 text-xs mt-0.5">
                    {stats?.avgVoltage ? `${stats.avgVoltage} V DC` : '1512.4 V DC'}
                  </div>
                </div>
              </div>

              {/* Switches summary */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1.5 flex items-center space-x-2">
                <Radio className="w-4 h-4 text-cyan-400 shrink-0" />
                <div>
                  <div className="text-[9px] text-slate-400 font-semibold leading-none uppercase">
                    STATUS SAKELAR
                  </div>
                  <div className="font-mono font-bold text-cyan-300 text-xs mt-0.5">
                    <span className="text-emerald-400">{stats?.closedSwitches ?? 14} NC</span> /{' '}
                    <span className="text-amber-400">{stats?.openSwitches ?? 6} NO</span>
                  </div>
                </div>
              </div>

              {/* Active Alarms Button */}
              {activeAlertsCount > 0 ? (
                <button
                  onClick={onOpenAlerts}
                  className="bg-amber-950/80 border border-amber-600/80 hover:bg-amber-900 transition rounded-lg px-2.5 py-1.5 flex items-center space-x-2 cursor-pointer shadow-lg shadow-amber-950/50"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-400 animate-bounce shrink-0" />
                  <div className="text-left">
                    <div className="text-[9px] text-amber-300 font-bold uppercase leading-none">
                      ALARM
                    </div>
                    <div className="font-mono font-bold text-amber-200 text-xs mt-0.5">
                      {activeAlertsCount} Aktif
                    </div>
                  </div>
                </button>
              ) : (
                <div className="bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1.5 flex items-center space-x-1.5 text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="text-[10px] font-bold text-slate-300">SISTEM SIAGA</div>
                </div>
              )}
            </div>

            {/* Live Clock */}
            <div className="text-right hidden sm:block bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1.5">
              <div className="flex items-center justify-end text-xs text-orange-400 space-x-1 font-mono font-bold">
                <Clock className="w-3.5 h-3.5 mr-0.5" />
                <span className="text-white text-xs">{formattedTime} WIB</span>
              </div>
              <div className="text-[10px] text-slate-400">{formattedDate}</div>
            </div>

            {/* KAI Logo */}
            <div className="bg-white rounded-lg px-2.5 py-1.5 shadow-sm border border-slate-700 flex items-center justify-center h-11 w-24 shrink-0 overflow-hidden">
              <img
                src="/kai-logo.webp"
                alt="Kereta Api Indonesia (KAI)"
                className="max-h-7 max-w-full object-contain"
                style={{ maxHeight: '28px', maxWidth: '85px' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
