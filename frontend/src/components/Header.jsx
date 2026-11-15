import React, { useState, useEffect } from 'react';
import { Clock, Wrench, ShieldCheck, Activity } from 'lucide-react';

export default function Header({ totalLogsCount = 28 }) {
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          
          {/* Left: Logos & Title */}
          <div className="flex items-center space-x-3.5">
            {/* Danantara Logo */}
            <div className="bg-white rounded-lg px-2.5 py-1 shadow-sm border border-slate-700 flex items-center justify-center h-10 w-28 shrink-0 overflow-hidden">
              <img
                src="/danantara-logo.png"
                alt="Danantara Indonesia Sovereign Fund"
                className="max-h-6 max-w-full object-contain"
                style={{ maxHeight: '24px', maxWidth: '100px' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>

            <div className="h-6 w-px bg-slate-700 hidden sm:block shrink-0" />

            {/* Title */}
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 text-[10px] font-extrabold tracking-wider uppercase bg-blue-900/80 text-blue-300 rounded border border-blue-700/60">
                  DAOP 1 JAKARTA
                </span>
                <span className="text-[11px] font-bold text-emerald-400 flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-1"></span>
                  LAA 1500 V DC
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-black text-white tracking-tight truncate mt-0.5">
                PETA WILAYAH UPT RESOR LAA 1.9 JATINEGARA
              </h1>
              <p className="text-[11px] text-slate-400 truncate">
                Monitoring Pemeliharaan & Pekerjaan Jalur Catenary (Kramat / Manggarai — Jatinegara — Bekasi)
              </p>
            </div>
          </div>

          {/* Right: Metrics & KAI Logo */}
          <div className="flex items-center justify-between sm:justify-end space-x-3">
            
            {/* Total Work Count Badge */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-1.5 flex items-center space-x-2">
              <Wrench className="w-4 h-4 text-orange-400 shrink-0" />
              <div>
                <div className="text-[9px] text-slate-400 font-semibold uppercase leading-none">
                  TOTAL PEKERJAAN
                </div>
                <div className="font-mono font-bold text-orange-300 text-xs mt-0.5">
                  {totalLogsCount} Pekerjaan
                </div>
              </div>
            </div>

            {/* Live Clock */}
            <div className="text-right hidden sm:block bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-1.5">
              <div className="flex items-center justify-end text-xs text-white space-x-1 font-mono font-bold">
                <Clock className="w-3.5 h-3.5 mr-0.5 text-cyan-400" />
                <span>{formattedTime} WIB</span>
              </div>
              <div className="text-[10px] text-slate-400">{formattedDate}</div>
            </div>

            {/* KAI Logo */}
            <div className="bg-white rounded-lg px-2.5 py-1 shadow-sm border border-slate-700 flex items-center justify-center h-10 w-20 shrink-0 overflow-hidden">
              <img
                src="/kai-logo.png"
                alt="Kereta Api Indonesia (KAI)"
                className="max-h-6 max-w-full object-contain"
                style={{ maxHeight: '24px', maxWidth: '75px' }}
                onError={(e) => {
                  e.target.src = '/kai-logo.webp';
                }}
              />
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
