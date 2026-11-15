import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, Zap, Clock, Radio, AlertTriangle } from 'lucide-react';

export default function Header({ stats, activeAlertsCount, onOpenAlerts }) {
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
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="bg-slate-900/90 border-b border-slate-800 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Left: Logos & Title */}
          <div className="flex items-center space-x-4">
            <div className="bg-white/95 rounded-lg px-2.5 py-1.5 shadow-sm border border-slate-700 flex items-center justify-center h-12">
              <img
                src="/danantara-logo.png"
                alt="Danantara Indonesia Sovereign Fund"
                className="h-7 w-auto object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <span className="text-xs font-bold text-slate-800 ml-1">Danantara</span>
            </div>

            <div className="h-8 w-px bg-slate-700 hidden sm:block" />

            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-blue-900/60 text-blue-300 rounded border border-blue-700/60">
                  DAOP 1 JAKARTA
                </span>
                <span className="flex items-center text-[11px] text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-1.5"></span>
                  SCADA ONLINE
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                PETA WILAYAH UPT RESOR LAA 1.9 JATINEGARA
              </h1>
              <p className="text-xs text-slate-400">
                Lintas: Manggarai / Kramat — Jatinegara — Bekasi • Catenary 1500 V DC
              </p>
            </div>
          </div>

          {/* Right: KAI Logo & Realtime Status Gauges */}
          <div className="flex items-center justify-between md:justify-end space-x-4">
            
            {/* Live Metrics Chips */}
            <div className="hidden lg:flex items-center space-x-2 text-xs">
              <div className="bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-1.5 flex items-center space-x-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="text-[10px] text-slate-400 font-medium">TEGANGAN SISTEM</div>
                  <div className="font-mono font-bold text-emerald-300">
                    {stats?.avgVoltage ? `${stats.avgVoltage} V DC` : '1500.0 V DC'}
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-1.5 flex items-center space-x-2">
                <Radio className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="text-[10px] text-slate-400 font-medium">SAKELAR (DS)</div>
                  <div className="font-mono font-bold text-cyan-300">
                    {stats?.closedSwitches ?? 14} NC / {stats?.openSwitches ?? 6} NO
                  </div>
                </div>
              </div>

              {activeAlertsCount > 0 && (
                <button
                  onClick={onOpenAlerts}
                  className="bg-amber-950/70 border border-amber-600/70 hover:bg-amber-900/80 transition-colors rounded-lg px-3 py-1.5 flex items-center space-x-2 cursor-pointer"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-400 animate-bounce" />
                  <div className="text-left">
                    <div className="text-[10px] text-amber-300 font-medium">ALARM AKTIF</div>
                    <div className="font-mono font-bold text-amber-200">{activeAlertsCount} Notifikasi</div>
                  </div>
                </button>
              )}
            </div>

            {/* Real-time Clock */}
            <div className="text-right">
              <div className="flex items-center justify-end text-xs text-slate-400 space-x-1">
                <Clock className="w-3.5 h-3.5 text-orange-400" />
                <span className="font-mono font-bold text-white text-sm">{formattedTime} WIB</span>
              </div>
              <div className="text-[11px] text-slate-400 hidden sm:block">{formattedDate}</div>
            </div>

            {/* KAI Logo */}
            <div className="bg-white/95 rounded-lg px-2.5 py-1.5 shadow-sm border border-slate-700 flex items-center justify-center h-12">
              <img
                src="/kai-logo.webp"
                alt="Kereta Api Indonesia (KAI)"
                className="h-7 w-auto object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <span className="text-xs font-black text-blue-900 tracking-wider ml-1">KAI</span>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
