import React, { useState, useEffect } from 'react';
import {
  Clock,
  Wrench,
  Plus,
  Train,
  Sparkles,
  ClipboardList,
  ChevronRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export default function Header({
  totalLogsCount = 85,
  onOpenAddWork,
  onOpenAllLogs,
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
    <header className="bg-white/95 backdrop-blur-xl border-b border-slate-200/90 sticky top-0 z-40 shadow-xs select-none relative">
      {/* Top Accent Gradient Ribbon (KAI Navy to Danantara Teal to Railway Amber) */}
      <div className="h-1 w-full bg-gradient-to-r from-blue-700 via-indigo-600 via-teal-500 to-amber-500" />

      <div className="max-w-[1720px] mx-auto px-4 py-2.5 sm:px-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          
          {/* ========================================================
              LEFT: BRANDING & TITLE COVER SECTION
              ======================================================== */}
          <div className="flex items-center space-x-3.5">
            {/* Danantara Indonesia Sovereign Fund Logo Container */}
            <div className="bg-white rounded-2xl px-3 py-1.5 border border-slate-200/80 shadow-xs hover:shadow-sm transition-all flex items-center justify-center h-11 w-32 shrink-0 overflow-hidden">
              <img
                src="/danantara-logo.png"
                alt="Danantara Indonesia Sovereign Fund"
                className="max-h-7 max-w-full object-contain transition-transform hover:scale-105 duration-200"
                style={{ maxHeight: '28px', maxWidth: '110px' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>

            {/* Elegant Divider */}
            <div className="h-8 w-px bg-gradient-to-b from-transparent via-slate-300 to-transparent hidden sm:block shrink-0" />

            {/* Title & Metadata Badges */}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                <span className="px-2.5 py-0.5 text-[11px] font-extrabold uppercase bg-blue-50 text-blue-700 rounded-md border border-blue-200/80 shadow-2xs">
                  DAOP 1 JAKARTA
                </span>
                
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200/80 flex items-center shadow-2xs">
                  <span className="relative flex h-2 w-2 mr-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  LAA 1500 V DC
                </span>

                <span className="hidden xl:inline-flex items-center text-[10.5px] font-semibold text-slate-500 bg-slate-100/80 px-2 py-0.5 rounded-md border border-slate-200">
                  <ShieldCheck className="w-3 h-3 mr-1 text-blue-600" />
                  SCADA Online
                </span>
              </div>

              <h1 className="text-base sm:text-lg lg:text-xl font-black text-slate-900 tracking-tight leading-snug flex items-center gap-2">
                <span>PETA WILAYAH UPT RESOR LAA 1.9 JATINEGARA</span>
              </h1>
              
              <p className="text-[11.5px] sm:text-xs text-slate-500 truncate flex items-center gap-1.5">
                <span className="font-semibold text-slate-700">Lintas Catenary:</span>
                <span>Kramat / Manggarai — Jatinegara — Buaran — Cakung — Bekasi</span>
              </p>
            </div>
          </div>

          {/* ========================================================
              RIGHT: ACTION BUTTONS, TOTAL WORK BADGE & KAI LOGO
              ======================================================== */}
          <div className="flex items-center justify-between sm:justify-end gap-2.5 sm:gap-3 flex-wrap">
            
            {/* 1. Sleek "+ Input Pekerjaan" Action Button */}
            <button
              onClick={onOpenAddWork}
              className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-md hover:shadow-lg shadow-blue-500/25 active:scale-95 transition-all flex items-center space-x-2 cursor-pointer shrink-0 border border-blue-500/30 group"
              title="Input data pekerjaan / pemeliharaan teknis baru"
            >
              <div className="bg-white/20 p-1 rounded-lg group-hover:bg-white/30 transition">
                <Plus className="w-3.5 h-3.5" />
              </div>
              <span className="tracking-wide">Input Pekerjaan</span>
            </button>

            {/* 2. Interactive "TOTAL PEKERJAAN" Clickable Menu Badge */}
            <button
              onClick={onOpenAllLogs}
              className="bg-slate-50/90 hover:bg-orange-50/50 border border-slate-200/90 hover:border-orange-300 rounded-xl px-3.5 py-1.5 flex items-center space-x-2.5 shadow-xs hover:shadow-md transition-all cursor-pointer group active:scale-98 shrink-0 text-left"
              title="Klik untuk membuka Rekapitulasi & Daftar Lengkap Seluruh Pekerjaan"
            >
              <div className="p-1.5 rounded-lg bg-orange-100/80 text-orange-600 group-hover:bg-orange-500 group-hover:text-white transition-all shadow-2xs">
                <ClipboardList className="w-4 h-4" />
              </div>

              <div>
                <div className="text-[9.5px] text-slate-500 group-hover:text-orange-700 font-extrabold uppercase tracking-wider flex items-center gap-1">
                  <span>TOTAL PEKERJAAN</span>
                  <ChevronRight className="w-2.5 h-2.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="font-mono font-black text-slate-900 text-xs sm:text-sm flex items-center gap-1 mt-0.5">
                  <span className="text-orange-600">{totalLogsCount}</span>
                  <span className="font-semibold text-slate-700 text-xs">Dicatat</span>
                </div>
              </div>
            </button>

            {/* 3. Live Clock Widget */}
            <div className="hidden md:flex items-center space-x-2 bg-slate-50/90 border border-slate-200/90 rounded-xl px-3 py-1.5 shadow-2xs text-right">
              <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-mono font-extrabold text-slate-900 leading-none">
                  {formattedTime} <span className="text-[10px] text-blue-600 font-bold">WIB</span>
                </div>
                <div className="text-[10.5px] font-medium text-slate-500 mt-0.5">
                  {formattedDate}
                </div>
              </div>
            </div>

            {/* 4. KAI Corporate Logo Container */}
            <div className="bg-white rounded-2xl px-3 py-1.5 border border-slate-200/80 shadow-xs hover:shadow-sm transition-all flex items-center justify-center h-11 w-24 shrink-0 overflow-hidden">
              <img
                src="/kai-logo.png"
                alt="Kereta Api Indonesia (KAI)"
                className="max-h-7 max-w-full object-contain transition-transform hover:scale-105 duration-200"
                style={{ maxHeight: '28px', maxWidth: '85px' }}
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
