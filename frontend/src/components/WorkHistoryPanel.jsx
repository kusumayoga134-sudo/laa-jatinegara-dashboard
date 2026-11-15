import React, { useState } from 'react';
import {
  Clock,
  Wrench,
  CheckCircle2,
  X,
  Train,
  ClipboardList,
  HardHat,
  Search,
  Filter,
  CalendarDays,
} from 'lucide-react';

// ========================================================
// COLOR RESOLVER: Pemetaan Warna Asli Garis AutoCAD DWG
// Setiap catatan pekerjaan diberi warna yang sama persis
// dengan warna jalur / naspan / switch pada peta skematik
// ========================================================
export function getLineColorInfo(targetCode = '', description = '') {
  const code = (targetCode || '').toUpperCase().trim();
  const desc = (description || '').toUpperCase();

  // 1. ST. JATINEGARA - Jalur & Wesel
  if (code.includes('JALUR 7') || code.includes('JALUR 8') || code.includes('W83') || code.includes('W23C')) {
    return {
      color: '#139a47',
      label: 'Jalur 7-8 & Wesel JNG (Hijau)',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    };
  }
  if (code.includes('JALUR 4') || code.includes('JALUR 5') || code.includes('JALUR 6') || code.includes('W63') || code.includes('W41')) {
    return {
      color: '#cc6827',
      label: 'Jalur 4-6 JNG (Oranye Cokelat)',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-300',
    };
  }
  if (code.includes('JALUR 2') || code.includes('JALUR 3') || code.includes('NASPAN 1 ARAH KLD HI') || code.includes('W13') || code.includes('W33')) {
    return {
      color: '#f8d731',
      label: 'Jalur 2-3 JNG / Naspan 1 Hi (Kuning Emas)',
      badgeClass: 'bg-yellow-50 text-yellow-800 border-yellow-300',
    };
  }
  if (code.includes('JALUR 1') || code.includes('NASPAN 1 ARAH KLD HU') || code.includes('W53')) {
    return {
      color: '#ff00ff',
      label: 'Jalur 1 JNG / Naspan 1 Hu (Magenta)',
      badgeClass: 'bg-fuchsia-50 text-fuchsia-800 border-fuchsia-300',
    };
  }

  // 2. NASPAN JATINEGARA - KLENDER
  if (code.includes('NASPAN 1 JNG-KLD (HI)') || code.includes('NASPAN 1 JNG-KLD HI')) {
    return {
      color: '#f8d731',
      label: 'Naspan 1 JNG-KLD Hilir (Kuning Emas)',
      badgeClass: 'bg-yellow-50 text-yellow-800 border-yellow-300',
    };
  }
  if (code.includes('NASPAN 1 JNG-KLD (HU)') || code.includes('NASPAN 1 JNG-KLD HU')) {
    return {
      color: '#ff00ff',
      label: 'Naspan 1 JNG-KLD Hulu (Magenta)',
      badgeClass: 'bg-fuchsia-50 text-fuchsia-800 border-fuchsia-300',
    };
  }
  if (code.includes('NASPAN 2') || code.includes('NASPAN 3') || code.includes('NASPAN 4')) {
    if (code.includes('HI') || desc.includes('HILIR')) {
      return {
        color: '#0000ff',
        label: 'Naspan JNG-KLD Hilir (Biru)',
        badgeClass: 'bg-blue-50 text-blue-800 border-blue-300',
      };
    }
    return {
      color: '#ff9f7f',
      label: 'Naspan JNG-KLD Hulu (Salmon/Oranye)',
      badgeClass: 'bg-orange-50 text-orange-800 border-orange-300',
    };
  }

  // 3. NASPAN KLENDER - BUARAN
  if (code.includes('NASPAN 4B')) {
    if (code.includes('HI') || desc.includes('HILIR')) {
      return {
        color: '#0000ff',
        label: 'Naspan 4B KLD-BUA Hilir (Biru)',
        badgeClass: 'bg-blue-50 text-blue-800 border-blue-300',
      };
    }
    return {
      color: '#ff9f7f',
      label: 'Naspan 4B KLD-BUA Hulu (Salmon)',
      badgeClass: 'bg-orange-50 text-orange-800 border-orange-300',
    };
  }
  if (code.includes('NASPAN 5') || code.includes('NASPAN 6')) {
    if (code.includes('HI') || desc.includes('HILIR')) {
      return {
        color: '#ff00ff',
        label: 'Naspan KLD-BUA Hilir (Magenta)',
        badgeClass: 'bg-fuchsia-50 text-fuchsia-800 border-fuchsia-300',
      };
    }
    return {
      color: '#00ff00',
      label: 'Naspan KLD-BUA Hulu (Hijau Terang)',
      badgeClass: 'bg-lime-50 text-lime-800 border-lime-300',
    };
  }

  // 4. NASPAN BUARAN - KLENDER BARU
  if (code.includes('NASPAN 7') || code.includes('NASPAN 8')) {
    if (code.includes('HI') || desc.includes('HILIR') || code.includes('7B BUA-KLDB (HI)')) {
      return {
        color: '#f8d731',
        label: 'Naspan BUA-KLDB Hilir (Kuning)',
        badgeClass: 'bg-yellow-50 text-yellow-800 border-yellow-300',
      };
    }
    return {
      color: '#ff0000',
      label: 'Naspan BUA-KLDB Hulu (Merah)',
      badgeClass: 'bg-red-50 text-red-800 border-red-300',
    };
  }

  // 5. NASPAN KLENDER BARU - CAKUNG - KRANJI
  if (code.includes('NASPAN 8B')) {
    if (code.includes('HI') || desc.includes('HILIR')) {
      return {
        color: '#f8d731',
        label: 'Naspan 8B KLDB-CUK Hilir (Kuning)',
        badgeClass: 'bg-yellow-50 text-yellow-800 border-yellow-300',
      };
    }
    return {
      color: '#ff0000',
      label: 'Naspan 8B KLDB-CUK Hulu (Merah)',
      badgeClass: 'bg-red-50 text-red-800 border-red-300',
    };
  }
  if (code.includes('NASPAN 9') && (code.includes('CUK') || code.includes('EMPL'))) {
    return {
      color: '#139a47',
      label: 'Naspan 9 Emplasemen Cakung (Hijau)',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    };
  }
  if (code.includes('NASPAN 9') && code.includes('KPB')) {
    return {
      color: '#ff7fdf',
      label: 'Naspan 9 Kramat-JNG (Pink)',
      badgeClass: 'bg-pink-50 text-pink-800 border-pink-300',
    };
  }
  if (code.includes('NASPAN 10') || code.includes('NASPAN 11')) {
    if (code.includes('HI') || desc.includes('HILIR')) {
      return {
        color: '#cc6827',
        label: 'Naspan CUK-KRI Hilir (Oranye)',
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-300',
      };
    }
    return {
      color: '#8a6ddd',
      label: 'Naspan CUK-KRI Hulu (Ungu)',
      badgeClass: 'bg-purple-50 text-purple-800 border-purple-300',
    };
  }

  // 6. NASPAN KRANJI - BEKASI
  if (code.includes('NASPAN 12') || code.includes('NASPAN 13')) {
    if (code.includes('HI') || desc.includes('HILIR')) {
      return {
        color: '#00bfff',
        label: 'Naspan KRI-BKS Hilir (Biru Langit)',
        badgeClass: 'bg-cyan-50 text-cyan-800 border-cyan-300',
      };
    }
    return {
      color: '#ff00ff',
      label: 'Naspan KRI-BKS Hulu (Magenta)',
      badgeClass: 'bg-fuchsia-50 text-fuchsia-800 border-fuchsia-300',
    };
  }

  // 7. DISCONNECTING SWITCH (DS 1 s/d DS 20)
  if (code.startsWith('DS 1') && !code.startsWith('DS 10') && !code.startsWith('DS 11') && !code.startsWith('DS 12') && !code.startsWith('DS 13') && !code.startsWith('DS 14') && !code.startsWith('DS 15') && !code.startsWith('DS 16') && !code.startsWith('DS 17') && !code.startsWith('DS 18') && !code.startsWith('DS 19')) {
    return { color: '#00ffff', label: 'DS 1 MRI-JNG Hilir (Cyan)', badgeClass: 'bg-cyan-50 text-cyan-800 border-cyan-300' };
  }
  if (code.startsWith('DS 2') && !code.startsWith('DS 20')) {
    return { color: '#ff00ff', label: 'DS 2 MRI-JNG Hulu (Magenta)', badgeClass: 'bg-fuchsia-50 text-fuchsia-800 border-fuchsia-300' };
  }
  if (code.startsWith('DS 4')) {
    return { color: '#ff00ff', label: 'DS 4 Wesel JNG Barat (Magenta)', badgeClass: 'bg-fuchsia-50 text-fuchsia-800 border-fuchsia-300' };
  }
  if (code.startsWith('DS 5')) {
    return { color: '#f8d731', label: 'DS 5 Jalur 2,3 JNG (Kuning Emas)', badgeClass: 'bg-yellow-50 text-yellow-800 border-yellow-300' };
  }
  if (code.startsWith('DS 6')) {
    return { color: '#ff00ff', label: 'DS 6 Jalur 1 JNG (Magenta)', badgeClass: 'bg-fuchsia-50 text-fuchsia-800 border-fuchsia-300' };
  }
  if (code.startsWith('DS 7')) {
    return { color: '#0000ff', label: 'DS 7 KLD-JNG Hilir (Biru)', badgeClass: 'bg-blue-50 text-blue-800 border-blue-300' };
  }
  if (code.startsWith('DS 8')) {
    return { color: '#ff9f7f', label: 'DS 8 JNG-KLD Hulu (Salmon/Oranye)', badgeClass: 'bg-orange-50 text-orange-800 border-orange-300' };
  }
  if (code.startsWith('DS 9')) {
    return { color: '#f8d731', label: 'DS 9 KLDB-BUA Hilir (Kuning)', badgeClass: 'bg-yellow-50 text-yellow-800 border-yellow-300' };
  }
  if (code.startsWith('DS 10')) {
    return { color: '#ff0000', label: 'DS 10 BUA-KLDB Hulu (Merah)', badgeClass: 'bg-red-50 text-red-800 border-red-300' };
  }
  if (code.startsWith('DS 11')) {
    return { color: '#f8d731', label: 'DS 11 CUK-KLDB Hilir (Kuning)', badgeClass: 'bg-yellow-50 text-yellow-800 border-yellow-300' };
  }
  if (code.startsWith('DS 12')) {
    return { color: '#ff0000', label: 'DS 12 KLDB-CUK Hulu (Merah)', badgeClass: 'bg-red-50 text-red-800 border-red-300' };
  }
  if (code.startsWith('DS 13')) {
    return { color: '#cc6827', label: 'DS 13 KRI-CUK Hilir (Oranye)', badgeClass: 'bg-amber-50 text-amber-800 border-amber-300' };
  }
  if (code.startsWith('DS 14')) {
    return { color: '#8a6ddd', label: 'DS 14 CUK-KRI Hulu (Ungu)', badgeClass: 'bg-purple-50 text-purple-800 border-purple-300' };
  }
  if (code.startsWith('DS 15') || code.startsWith('DS 17') || code.startsWith('DS 18') || code.startsWith('DS 19')) {
    return { color: '#00bfff', label: 'DS Emplasemen Bekasi Hilir (Biru Langit)', badgeClass: 'bg-cyan-50 text-cyan-800 border-cyan-300' };
  }
  if (code.startsWith('DS 16') || code.startsWith('DS 20')) {
    return { color: '#ff00ff', label: 'DS Emplasemen Bekasi Hulu (Magenta)', badgeClass: 'bg-fuchsia-50 text-fuchsia-800 border-fuchsia-300' };
  }

  // 8. STASIUN UTAMA
  if (code.includes('PONDOK JATI') || desc.includes('PONDOK JATI')) {
    return { color: '#ff0000', label: 'St. Pondok Jati (Merah)', badgeClass: 'bg-red-50 text-red-800 border-red-300' };
  }
  if (code.includes('JATINEGARA') || desc.includes('JATINEGARA')) {
    return { color: '#139a47', label: 'St. Jatinegara (Hijau)', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300' };
  }
  if (code.includes('KLENDER BARU') || desc.includes('KLENDER BARU')) {
    return { color: '#ff0000', label: 'St. Klender Baru (Merah)', badgeClass: 'bg-red-50 text-red-800 border-red-300' };
  }
  if (code.includes('KLENDER') || desc.includes('KLENDER')) {
    return { color: '#0000ff', label: 'St. Klender (Biru)', badgeClass: 'bg-blue-50 text-blue-800 border-blue-300' };
  }
  if (code.includes('BUARAN') || desc.includes('BUARAN')) {
    return { color: '#00ff00', label: 'St. Buaran (Hijau)', badgeClass: 'bg-lime-50 text-lime-800 border-lime-300' };
  }
  if (code.includes('CAKUNG') || desc.includes('CAKUNG')) {
    return { color: '#8a6ddd', label: 'St. Cakung (Ungu)', badgeClass: 'bg-purple-50 text-purple-800 border-purple-300' };
  }
  if (code.includes('KRANJI') || desc.includes('KRANJI')) {
    return { color: '#00bfff', label: 'St. Kranji (Biru Langit)', badgeClass: 'bg-cyan-50 text-cyan-800 border-cyan-300' };
  }
  if (code.includes('BEKASI') || desc.includes('BEKASI')) {
    return { color: '#00bfff', label: 'St. Bekasi (Biru Langit)', badgeClass: 'bg-cyan-50 text-cyan-800 border-cyan-300' };
  }

  // 9. DEFAULT FALLBACK
  return {
    color: '#2563eb',
    label: 'Lintas LAA 1.9',
    badgeClass: 'bg-blue-50 text-blue-800 border-blue-300',
  };
}

export default function WorkHistoryPanel({
  locationData,
  logs = [],
  onClose,
}) {
  const isAllLogsMode = Boolean(locationData?.isAllLogs);

  // Station Filter (Hanya Nama Stasiun Keseluruhan)
  const [stationFilter, setStationFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  if (!locationData) return null;

  // Filter logs relevant to location or station
  const locationCode = locationData.code || locationData.name || '';
  const matchingLogs = logs.filter((log) => {
    // If opened from a specific track line on the map
    if (!isAllLogsMode && locationCode) {
      return (
        log.targetCode &&
        (log.targetCode.toLowerCase().includes(locationCode.toLowerCase()) ||
          locationCode.toLowerCase().includes(log.targetCode.toLowerCase()))
      );
    }

    // Filter Nama Stasiun Keseluruhan (Hanya Stasiun Saja)
    if (isAllLogsMode && stationFilter !== 'ALL') {
      const tc = (log.targetCode || '').toUpperCase();
      const desc = (log.description || '').toUpperCase();
      const combined = `${tc} ${desc}`;

      if (stationFilter === 'PND') {
        if (!combined.includes('PONDOK JATI') && !combined.includes('PND') && !combined.includes('KRAMAT')) return false;
      } else if (stationFilter === 'JNG') {
        if (!combined.includes('JATINEGARA') && !combined.includes('JNG') && !combined.includes('MRI') && !combined.includes('MANGGARAI') && !tc.startsWith('DS 1') && !tc.startsWith('DS 2') && !tc.startsWith('DS 4') && !tc.startsWith('DS 5') && !tc.startsWith('DS 6') && !tc.startsWith('DS 7') && !tc.startsWith('DS 8')) return false;
      } else if (stationFilter === 'KLD') {
        if ((combined.includes('KLENDER BARU') || combined.includes('KLDB')) && !combined.includes('JNG-KLD') && !combined.includes('KLD-BUA')) return false;
        if (!combined.includes('KLENDER') && !combined.includes('KLD')) return false;
      } else if (stationFilter === 'BUA') {
        if (!combined.includes('BUARAN') && !combined.includes('BUA') && !tc.startsWith('DS 9') && !tc.startsWith('DS 10')) return false;
      } else if (stationFilter === 'KLDB') {
        if (!combined.includes('KLENDER BARU') && !combined.includes('KLDB') && !tc.startsWith('DS 9') && !tc.startsWith('DS 10') && !tc.startsWith('DS 11') && !tc.startsWith('DS 12')) return false;
      } else if (stationFilter === 'CUK') {
        if (!combined.includes('CAKUNG') && !combined.includes('CUK') && !tc.startsWith('DS 11') && !tc.startsWith('DS 12') && !tc.startsWith('DS 13') && !tc.startsWith('DS 14')) return false;
      } else if (stationFilter === 'KRI') {
        if (!combined.includes('KRANJI') && !combined.includes('KRI') && !tc.startsWith('DS 13') && !tc.startsWith('DS 14') && !tc.startsWith('DS 16')) return false;
      } else if (stationFilter === 'BKS') {
        if (!combined.includes('BEKASI') && !combined.includes('BKS') && !tc.startsWith('DS 15') && !tc.startsWith('DS 16') && !tc.startsWith('DS 17') && !tc.startsWith('DS 18') && !tc.startsWith('DS 19') && !tc.startsWith('DS 20')) return false;
      }
    }

    return true;
  });

  const filteredLogs = matchingLogs.filter((log) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (log.targetCode && log.targetCode.toLowerCase().includes(q)) ||
      (log.actionType && log.actionType.toLowerCase().includes(q)) ||
      (log.technician && log.technician.toLowerCase().includes(q)) ||
      (log.description && log.description.toLowerCase().includes(q))
    );
  });

  const formatActionName = (action) => {
    if (!action) return 'Pekerjaan Pemeliharaan';
    return action.replace(/_/g, ' ');
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Main Drawer Panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[580px] bg-white border-l border-slate-200 shadow-2xl flex flex-col animate-in slide-in-from-right duration-250 select-none text-slate-800">
        
        {/* ========================================================
            DRAWER HEADER
            ======================================================== */}
        <div className="bg-gradient-to-r from-slate-50 via-white to-slate-50 p-4 sm:p-5 border-b border-slate-200 flex items-start justify-between relative">
          <div className="flex items-start space-x-3.5 relative z-10">
            
            {/* Header Icon */}
            <div className={`p-3 rounded-2xl text-white shadow-md mt-0.5 shrink-0 ${
              isAllLogsMode
                ? 'bg-gradient-to-br from-amber-500 to-orange-600'
                : 'bg-gradient-to-br from-blue-600 to-cyan-600'
            }`}>
              {isAllLogsMode ? (
                <ClipboardList className="w-5 h-5" />
              ) : (
                <Train className="w-5 h-5" />
              )}
            </div>

            <div>
              {/* Badges: ONLY displayed in single line mode (deleted from total pekerjaan) */}
              {!isAllLogsMode && (
                <div className="flex items-center space-x-2 flex-wrap gap-y-1 mb-1">
                  <span className="px-2.5 py-0.5 text-xs font-black rounded-full border uppercase bg-blue-50 text-blue-800 border-blue-200">
                    {locationData.category || 'SEKSI NASPAN LAA'}
                  </span>
                  {locationData.km && (
                    <span className="text-xs font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {locationData.km}
                    </span>
                  )}
                </div>
              )}

              <h2 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                {isAllLogsMode
                  ? 'Daftar Riwayat Pekerjaan LAA'
                  : locationData.title || locationData.name || locationCode}
              </h2>

              <p className="text-xs text-slate-500 mt-0.5">
                {isAllLogsMode
                  ? `Total ${logs.length} catatan pekerjaan pemeliharaan pada lintas Resor LAA 1.9 Jatinegara`
                  : 'Riwayat inspeksi, pemeliharaan teknis, dan pencatatan pekerjaan seksi'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-800 p-2 rounded-xl hover:bg-slate-100 transition cursor-pointer relative z-10 shrink-0"
            title="Tutup Panel (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ========================================================
            FILTER NAMA STASIUN KESELURUHAN (HANYA STASIUN SAJA)
            ======================================================== */}
        {isAllLogsMode && (
          <div className="px-4 sm:px-5 py-2.5 bg-white border-b border-slate-200 overflow-x-auto flex items-center space-x-1.5 scrollbar-none">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-blue-600" />
              Stasiun:
            </span>
            {[
              { id: 'ALL', label: 'Semua Stasiun' },
              { id: 'PND', label: 'St. Pondok Jati' },
              { id: 'JNG', label: 'St. Jatinegara' },
              { id: 'KLD', label: 'St. Klender' },
              { id: 'BUA', label: 'St. Buaran' },
              { id: 'KLDB', label: 'St. Klender Baru' },
              { id: 'CUK', label: 'St. Cakung' },
              { id: 'KRI', label: 'St. Kranji' },
              { id: 'BKS', label: 'St. Bekasi' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStationFilter(st.id)}
                className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 transition cursor-pointer border ${
                  stationFilter === st.id
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        )}

        {/* Quick Search Bar */}
        <div className="px-4 sm:px-5 py-2.5 bg-slate-50 border-b border-slate-200">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari lokasi/naspan, teknisi, jenis pekerjaan..."
              className="w-full bg-white hover:bg-slate-100/70 focus:bg-white text-xs pl-10 pr-8 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none transition-all placeholder:text-slate-400 font-medium text-slate-800 shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {searchQuery && (
            <div className="text-[10.5px] text-slate-500 mt-1 px-1 flex items-center justify-between">
              <span>Ditemukan <strong>{filteredLogs.length}</strong> catatan cocok</span>
              <button onClick={() => setSearchQuery('')} className="text-blue-600 font-bold hover:underline">
                Reset
              </button>
            </div>
          )}
        </div>

        {/* ========================================================
            DRAWER SCROLL BODY: DAFTAR RIWAYAT PEKERJAAN
            ======================================================== */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-slate-50/50">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
            <span className="font-extrabold text-slate-800 uppercase tracking-wider text-xs flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5 text-blue-600" />
              {isAllLogsMode
                ? `Daftar Riwayat Pekerjaan Seluruh Lintas (${filteredLogs.length} Catatan)`
                : `Riwayat Pekerjaan Seksi (${filteredLogs.length} Catatan)`}
            </span>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center text-xs text-slate-500 space-y-2 shadow-xs">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <p className="font-bold text-slate-800 text-sm">Tidak ada catatan pekerjaan yang cocok.</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Silakan pilih stasiun lain atau reset kata kunci pencarian.
              </p>
            </div>
          ) : (
            filteredLogs.map((log) => {
              const dateObj = new Date(log.timestamp);
              const formattedDate = dateObj.toLocaleDateString('id-ID', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });
              const formattedTime = dateObj.toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
              });

              // Resolve authentic AutoCAD map color
              const lineInfo = getLineColorInfo(log.targetCode, log.description);

              return (
                <div
                  key={log.id}
                  className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all duration-200 space-y-2.5 relative overflow-hidden group"
                >
                  {/* 1. Glowing Left Accent Strip matching exact AutoCAD line color on map */}
                  <div
                    className="absolute top-0 bottom-0 left-0 w-2 group-hover:w-2.5 transition-all"
                    style={{
                      backgroundColor: lineInfo.color,
                      boxShadow: `0 0 10px ${lineInfo.color}80`,
                    }}
                  />

                  {/* 2. Header Bar: Waktu & Lokasi dengan Warna Garis Asli */}
                  <div className="flex items-center justify-between text-xs pl-2 flex-wrap gap-1.5">
                    <div className="flex items-center space-x-1.5 text-blue-700 font-mono font-bold text-xs">
                      <Clock className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                      <span>{formattedDate}</span>
                      <span>•</span>
                      <span>{formattedTime} WIB</span>
                    </div>

                    {/* Lokasi / Line Badge dengan Warna Garis Peta */}
                    <div className="flex items-center space-x-1.5">
                      <span
                        className="px-2.5 py-0.5 rounded-lg text-[11px] font-mono font-extrabold flex items-center space-x-1.5 shadow-2xs"
                        style={{
                          backgroundColor: `${lineInfo.color}15`,
                          color: '#0f172a',
                          border: `1.5px solid ${lineInfo.color}60`,
                        }}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                          style={{
                            backgroundColor: lineInfo.color,
                            boxShadow: `0 0 5px ${lineInfo.color}`,
                          }}
                        />
                        <span>{log.targetCode || 'LAA 1.9'}</span>
                      </span>

                      <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center">
                        <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                        {log.status || 'SELESAI'}
                      </span>
                    </div>
                  </div>

                  {/* 3. Identifikasi Nama Garis / Warna Seksi Pada Peta */}
                  <div className="pl-2">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        SEKSI PETA:
                      </span>
                      <span
                        className="text-[11px] font-bold px-2 py-0.2 rounded-md"
                        style={{
                          backgroundColor: `${lineInfo.color}12`,
                          color: lineInfo.color === '#f8d731' ? '#854d0e' : lineInfo.color,
                        }}
                      >
                        {lineInfo.label}
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 mt-1 flex items-center gap-1.5">
                      <Wrench
                        className="w-3.5 h-3.5 shrink-0"
                        style={{ color: lineInfo.color === '#f8d731' ? '#ca8a04' : lineInfo.color }}
                      />
                      <span>{formatActionName(log.actionType)}</span>
                    </h4>
                  </div>

                  {/* 4. Deskripsi Hasil Pekerjaan & Nilai Ukur */}
                  <div className="pl-2">
                    <div className="bg-slate-50/90 p-3 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed font-normal">
                      {log.description}
                    </div>
                  </div>

                  {/* 5. Pelaksana & Tag Target */}
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100 pl-2 flex-wrap gap-1">
                    <span className="flex items-center space-x-1.5">
                      <HardHat className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>Pelaksana:</span>
                      <strong className="text-slate-800 font-semibold">{log.technician}</strong>
                    </span>

                    <span
                      className="font-mono text-[10.5px] font-bold px-2 py-0.5 rounded-md"
                      style={{
                        backgroundColor: `${lineInfo.color}10`,
                        color: '#334155',
                        border: `1px solid ${lineInfo.color}30`,
                      }}
                    >
                      {log.targetCode}
                    </span>
                  </div>

                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="text-xs font-semibold text-slate-600">
            UPT RESOR LAA 1.9 JATINEGARA
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </>
  );
}
