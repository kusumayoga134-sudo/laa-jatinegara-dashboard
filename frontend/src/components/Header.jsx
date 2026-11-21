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
  FileText,
} from 'lucide-react';

export default function Header({
  totalLogsCount = 85,
  onOpenAllLogs,
  isAdmin = false,
  onOpenLogin,
  onLogout,
  onOpenAddLog,
  onOpenExportPdf,
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

      <div className="max-w-[1720px] mx-auto px-3 sm:px-6 py-1.5 sm:py-2.5">
        
        {/* ========================================================
            1. MOBILE VIEW (< md) - CLEAN 2-ROW COMPACT HEADER
            ======================================================== */}
        <div className="md:hidden flex flex-col space-y-1.5">
          {/* Baris 1: Branding Logo Danantara (Kiri) & KAI (Kanan) - Bersih Tanpa Box/Shadow */}
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            {/* Danantara Logo */}
            <div className="flex items-center justify-start h-6 shrink-0">
              <img
                src="/danantara-logo.png"
                alt="Danantara Indonesia"
                className="h-5 sm:h-5.5 w-auto max-w-[125px] object-contain"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>

            {/* KAI Logo */}
            <div className="flex items-center justify-end h-6 shrink-0">
              <img
                src="/kai-logo.png"
                alt="KAI"
                className="h-5 sm:h-5.5 w-auto max-w-[65px] object-contain"
                onError={(e) => { e.target.src = '/kai-logo.webp'; }}
              />
            </div>
          </div>

          {/* Baris 2: Judul Lengkap (Kiri) & Tombol Aksi (Kanan) */}
          <div className="flex items-center justify-between gap-2 pt-0.5">
            {/* Judul & Subjudul Rata Kiri */}
            <div className="flex flex-col min-w-0 pr-1 text-left">
              <h1 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight leading-tight truncate">
                UPT RESOR LAA 1.9 JNG
              </h1>
              <p className="text-[10px] text-slate-500 font-bold leading-tight truncate mt-0.5">
                Jatinegara — Bekasi
              </p>
            </div>

            {/* Tombol Aksi Kanan (Login / Admin Actions) */}
            <div className="flex items-center space-x-1.5 shrink-0">
              {isAdmin ? (
                <div className="flex items-center space-x-1.5">
                  <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 font-extrabold text-[10px] flex items-center gap-1 shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Admin
                  </span>
                  {onOpenAddLog && (
                    <button
                      onClick={() => onOpenAddLog(null)}
                      className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-extrabold text-[10.5px] py-1 px-2.5 rounded-lg flex items-center gap-1 shadow-2xs cursor-pointer shrink-0"
                      title="Input Pekerjaan Baru"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>+ Input</span>
                    </button>
                  )}
                  <button
                    onClick={onLogout}
                    className="p-1 rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition cursor-pointer shrink-0"
                    title="Keluar Admin"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onOpenLogin}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs shrink-0"
                  title="Login Keamanan Admin"
                >
                  <Lock className="w-3 h-3 text-slate-500" />
                  <span>Login</span>
                </button>
              )}
            </div>
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
              <div className="h-11 flex items-center space-x-2 bg-emerald-50 border border-emerald-200 rounded-xl px-2.5 shadow-2xs">
                <span className="px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-2xs">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin UPT 1.9</span>
                </span>
                
                {onOpenAddLog && (
                  <button
                    onClick={() => onOpenAddLog(null)}
                    className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs py-1.5 px-2.5 rounded-lg flex items-center space-x-1 shadow-2xs transition cursor-pointer"
                    title="Input Pekerjaan Baru"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>+ Input Pekerjaan</span>
                  </button>
                )}

                <button
                  onClick={onLogout}
                  className="text-rose-600 hover:text-rose-800 hover:bg-rose-100 p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                  title="Logout Mode Admin"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Keluar</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="h-11 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 rounded-xl px-3.5 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs active:scale-95"
                title="Login sebagai Admin UPT 1.9 untuk Mengelola Data Pekerjaan"
              >
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>Login Admin</span>
              </button>
            )}

            {/* Live Clock Widget */}
            <div className="h-11 bg-slate-50/90 border border-slate-200/90 rounded-xl px-3.5 flex items-center space-x-2.5 shadow-2xs shrink-0 text-left">
              <div className="w-8 h-8 rounded-lg bg-blue-100/90 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[9.5px] text-slate-500 font-extrabold uppercase tracking-wider flex items-center gap-1 leading-none">
                  <span>WAKTU LAA</span>
                  <span className="text-[9px] font-semibold text-slate-400 capitalize">• {formattedDate}</span>
                </div>
                <div className="font-mono font-black text-slate-900 text-xs sm:text-sm flex items-center gap-1 mt-1 leading-none">
                  <span className="text-blue-600">{formattedTime}</span>
                  <span className="font-semibold text-slate-700 text-xs font-sans">WIB</span>
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
