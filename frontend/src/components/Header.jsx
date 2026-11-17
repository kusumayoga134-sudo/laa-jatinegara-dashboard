import React, { useState, useEffect } from 'react';
import {
  Clock,
  Wrench,
  Train,
  Sparkles,
  ClipboardList,
  ChevronRight,
  Shield,
  ShieldCheck,
  Lock,
  LogOut,
  PlusCircle,
} from 'lucide-react';

export default function Header({
  totalLogsCount = 85,
  onOpenAllLogs,
  isAdmin = false,
  onOpenLogin,
  onLogout,
  onOpenAddLog,
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
    <header className="bg-white/95 backdrop-blur-xl border-b border-slate-200/90 sticky top-0 z-40 shadow-xs select-none">
      {/* Top Accent Gradient Ribbon */}
      <div className="h-1 w-full bg-gradient-to-r from-blue-700 via-indigo-600 via-teal-500 to-amber-500" />

      <div className="max-w-[1720px] mx-auto px-3 sm:px-6 py-2.5">
        
        {/* ========================================================
            1. MOBILE VIEW (< md)
            ======================================================== */}
        <div className="md:hidden flex flex-col space-y-2">
          {/* Top Bar: Danantara Logo, Admin status, KAI Logo */}
          <div className="flex items-center justify-between gap-2">
            {/* Danantara Logo */}
            <div className="bg-white rounded-xl px-2 py-1 border border-slate-200/90 shadow-2xs flex items-center justify-center h-8 w-24 shrink-0 overflow-hidden">
              <img
                src="/danantara-logo.png"
                alt="Danantara Indonesia"
                className="max-h-5 max-w-full object-contain"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>

            {/* Admin Switch / Status Mobile */}
            <div className="flex items-center space-x-1.5">
              {isAdmin ? (
                <div className="flex items-center space-x-1">
                  <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 font-extrabold text-[10px] flex items-center gap-1 shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Admin 1.9
                  </span>
                  <button
                    onClick={onLogout}
                    className="p-1 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 transition cursor-pointer"
                    title="Logout Admin"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onOpenLogin}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 text-[10.5px] font-bold flex items-center gap-1 transition cursor-pointer shadow-2xs"
                  title="Login Keamanan Admin"
                >
                  <Lock className="w-3 h-3 text-slate-500" />
                  <span>Login Admin</span>
                </button>
              )}
            </div>

            {/* KAI Logo */}
            <div className="bg-white rounded-xl px-2 py-1 border border-slate-200/90 shadow-2xs flex items-center justify-center h-8 w-20 shrink-0 overflow-hidden">
              <img
                src="/kai-logo.png"
                alt="KAI"
                className="max-h-5 max-w-full object-contain"
                onError={(e) => { e.target.src = '/kai-logo.webp'; }}
              />
            </div>
          </div>

          {/* Title on Mobile */}
          <div className="text-center px-1">
            <h1 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight leading-tight">
              PETA WILAYAH UPT RESOR LAA 1.9 JATINEGARA
            </h1>
            <p className="text-[10px] sm:text-[10.5px] text-slate-600 truncate mt-0.5 font-semibold">
              Lintas Jaringan LAA : Jatinegara - Bekasi
            </p>
          </div>

          {/* Quick Buttons Mobile */}
          <div className="flex items-center space-x-1.5 pt-0.5">
            <button
              onClick={onOpenAllLogs}
              className="flex-1 bg-slate-50 active:scale-95 border border-slate-200 hover:border-orange-300 rounded-xl py-1.5 px-3 flex items-center justify-center space-x-2 shadow-xs cursor-pointer text-left"
              title="Buka rekapitulasi pekerjaan"
            >
              <div className="p-1 rounded-lg bg-orange-100 text-orange-600 shrink-0">
                <ClipboardList className="w-3.5 h-3.5" />
              </div>
              <div className="leading-tight flex items-center space-x-1.5">
                <span className="text-[10px] text-slate-500 font-bold uppercase">
                  TOTAL PEKERJAAN:
                </span>
                <span className="font-mono font-black text-slate-900 text-xs sm:text-sm">
                  <span className="text-orange-600">{totalLogsCount}</span> Dicatat
                </span>
              </div>
            </button>

            {isAdmin && onOpenAddLog && (
              <button
                onClick={() => onOpenAddLog(null)}
                className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs py-1.5 px-3 rounded-xl flex items-center space-x-1 shadow-xs cursor-pointer shrink-0"
                title="Input Pekerjaan Baru"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Catat</span>
              </button>
            )}
          </div>
        </div>

        {/* ========================================================
            2. DESKTOP VIEW (>= md) - FULL HORIZONTAL EXECUTIVE BAR
            ======================================================== */}
        <div className="hidden md:flex md:items-center md:justify-between gap-3">
          
          {/* Left: Branding & Title */}
          <div className="flex items-center space-x-3.5">
            {/* Danantara Logo */}
            <div className="bg-white rounded-2xl px-3 py-1.5 border border-slate-200/80 shadow-xs hover:shadow-sm transition-all flex items-center justify-center h-11 w-32 shrink-0 overflow-hidden">
              <img
                src="/danantara-logo.png"
                alt="Danantara Indonesia Sovereign Fund"
                className="max-h-7 max-w-full object-contain transition-transform hover:scale-105 duration-200"
                style={{ maxHeight: '28px', maxWidth: '110px' }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>

            <div className="h-8 w-px bg-gradient-to-b from-transparent via-slate-300 to-transparent shrink-0" />

            {/* Title & Subtitle */}
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg lg:text-xl font-black text-slate-900 tracking-tight leading-snug">
                PETA WILAYAH UPT RESOR LAA 1.9 JATINEGARA
              </h1>
              
              <p className="text-xs text-slate-500 truncate flex items-center gap-1.5 mt-0.5">
                <span className="font-bold text-slate-700">Lintas Jaringan LAA :</span>
                <span>Jatinegara - Bekasi</span>
              </p>
            </div>
          </div>

          {/* Right: Admin Tools, Total Work Badge, Clock, KAI Logo */}
          <div className="flex items-center justify-end gap-2.5 flex-wrap shrink-0">
            
            {/* Admin State Controls */}
            {isAdmin ? (
              <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200 rounded-xl p-1 pr-2 shadow-xs">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-2xs">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin UPT 1.9</span>
                </span>
                
                {onOpenAddLog && (
                  <button
                    onClick={() => onOpenAddLog(null)}
                    className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs py-1 px-2.5 rounded-lg flex items-center space-x-1 shadow-2xs transition cursor-pointer"
                    title="Input Pekerjaan Baru"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>+ Input Pekerjaan</span>
                  </button>
                )}

                <button
                  onClick={onLogout}
                  className="text-rose-600 hover:text-rose-800 hover:bg-rose-100 p-1 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                  title="Logout Mode Admin"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Keluar</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 rounded-xl px-3 py-2 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs active:scale-95"
                title="Login sebagai Admin UPT 1.9 untuk Mengelola Data Pekerjaan"
              >
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>Login Admin</span>
              </button>
            )}

            {/* Total Work Clickable Badge */}
            <button
              onClick={onOpenAllLogs}
              className="bg-slate-50/90 hover:bg-orange-50/50 border border-slate-200/90 hover:border-orange-300 rounded-xl px-3.5 py-1.5 flex items-center space-x-2.5 shadow-xs hover:shadow-md transition-all cursor-pointer group active:scale-98 shrink-0 text-left"
              title="Klik untuk membuka Rekapitulasi & Daftar Lengkap Seluruh Pekerjaan"
            >
              <div className="p-1.5 rounded-lg bg-orange-100/80 text-orange-600 group-hover:bg-orange-500 group-hover:text-white transition-all shadow-2xs">
                <ClipboardList className="w-4 h-4" />
              </div>

              <div>
                <div className="text-[9px] text-slate-500 group-hover:text-orange-700 font-extrabold uppercase tracking-wider flex items-center gap-0.5">
                  <span>TOTAL PEKERJAAN</span>
                  <ChevronRight className="w-2.5 h-2.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="font-mono font-black text-slate-900 text-xs sm:text-sm flex items-center gap-1 mt-0.5">
                  <span className="text-orange-600">{totalLogsCount}</span>
                  <span className="font-semibold text-slate-700 text-xs">Dicatat</span>
                </div>
              </div>
            </button>

            {/* Live Clock Widget */}
            <div className="flex items-center space-x-2 bg-slate-50/90 border border-slate-200/90 rounded-xl px-3 py-1.5 shadow-2xs text-right">
              <div className="p-1 rounded-lg bg-blue-50 text-blue-600">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-mono font-extrabold text-slate-900 leading-none">
                  {formattedTime} <span className="text-[10px] text-blue-600 font-bold">WIB</span>
                </div>
                <div className="text-[10px] font-medium text-slate-500 mt-0.5">
                  {formattedDate}
                </div>
              </div>
            </div>

            {/* KAI Logo */}
            <div className="bg-white rounded-2xl px-3 py-1.5 border border-slate-200/80 shadow-xs hover:shadow-sm transition-all flex items-center justify-center h-11 w-24 shrink-0 overflow-hidden">
              <img
                src="/kai-logo.png"
                alt="Kereta Api Indonesia (KAI)"
                className="max-h-7 max-w-full object-contain transition-transform hover:scale-105 duration-200"
                style={{ maxHeight: '28px', maxWidth: '85px' }}
                onError={(e) => { e.target.src = '/kai-logo.webp'; }}
              />
            </div>

          </div>

        </div>

      </div>
    </header>
  );
}
