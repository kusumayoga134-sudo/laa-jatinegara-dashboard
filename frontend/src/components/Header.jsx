import React, { useState, useEffect } from 'react';
import { Clock, Wrench, Plus, Train } from 'lucide-react';

export default function Header({ totalLogsCount = 28, onOpenAddWork }) {
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
    <header className="bg-white border-b border-slate-200 text-slate-800 sticky top-0 z-40 shadow-sm select-none">
      <div className="max-w-[1700px] mx-auto px-4 py-2.5 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          
          {/* Left: Logos & Title */}
          <div className="flex items-center space-x-3.5">
            {/* Danantara Logo */}
            <div className="bg-white rounded-xl px-2.5 py-1 border border-slate-200 shadow-xs flex items-center justify-center h-10 w-28 shrink-0 overflow-hidden">
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

            <div className="h-6 w-px bg-slate-200 hidden sm:block shrink-0" />

            {/* Title */}
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 text-xs font-bold uppercase bg-blue-50 text-blue-700 rounded-md border border-blue-200">
                  DAOP 1 JAKARTA
                </span>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping mr-1.5"></span>
                  LAA 1500 V DC
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight truncate mt-0.5">
                PETA WILAYAH UPT RESOR LAA 1.9 JATINEGARA
              </h1>
              <p className="text-xs text-slate-500 truncate">
                Monitoring Pemeliharaan & Pekerjaan Jalur Catenary (Kramat / Manggarai — Jatinegara — Bekasi)
              </p>
            </div>
          </div>

          {/* Right: Input Pekerjaan Button, Metrics & KAI Logo */}
          <div className="flex items-center justify-between sm:justify-end space-x-3">
            
            {/* NEW: Prominent "+ Input Pekerjaan" Button */}
            <button
              onClick={onOpenAddWork}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center space-x-2 cursor-pointer active:scale-95 shrink-0"
              title="Input data pekerjaan / pemeliharaan teknis baru"
            >
              <Plus className="w-4 h-4" />
              <span>+ Input Pekerjaan</span>
            </button>

            {/* Total Work Count Badge */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 flex items-center space-x-2">
              <Wrench className="w-4 h-4 text-orange-500 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-500 font-semibold uppercase leading-none">
                  TOTAL PEKERJAAN
                </div>
                <div className="font-mono font-bold text-slate-800 text-xs sm:text-sm mt-0.5">
                  {totalLogsCount} Dicatat
                </div>
              </div>
            </div>

            {/* Live Clock */}
            <div className="text-right hidden sm:block bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
              <div className="flex items-center justify-end text-xs sm:text-sm text-slate-800 space-x-1 font-mono font-bold">
                <Clock className="w-3.5 h-3.5 mr-0.5 text-blue-600" />
                <span>{formattedTime} WIB</span>
              </div>
              <div className="text-[11px] text-slate-500">{formattedDate}</div>
            </div>

            {/* KAI Logo */}
            <div className="bg-white rounded-xl px-2.5 py-1 border border-slate-200 shadow-xs flex items-center justify-center h-10 w-20 shrink-0 overflow-hidden">
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
