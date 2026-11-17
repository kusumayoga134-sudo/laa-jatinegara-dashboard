import React, { useState } from 'react';
import {
  PlusCircle,
  Edit3,
  Trash2,
  Save,
  AlertTriangle,
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
  isAdmin = false,
  onAddLog,
  onUpdateLog,
  onDeleteLog,
  onOpenLogin,
}) {
  const isAllLogsMode = Boolean(locationData?.isAllLogs);

  // Station Filter (Hanya Nama Stasiun Keseluruhan)
  const [stationFilter, setStationFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Admin Form State (Add / Edit)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLogId, setEditingLogId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    targetCode: '',
    actionType: 'PENGUKURAN_KETEBALAN_KAWAT',
    technician: '',
    description: '',
    status: 'COMPLETED',
    timestamp: new Date().toISOString().slice(0, 16),
  });

  if (!locationData) return null;

  const locationCode = locationData.code || locationData.name || '';
  const locationTitle = locationData.title || locationData.name || locationCode;

  // Filter logs relevant to location or station
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

  // Open Form to Add New Work Log
  const handleOpenAdd = () => {
    setEditingLogId(null);
    setFormData({
      targetCode: locationCode || 'NASPAN 1 JNG-KLD (HU)',
      actionType: 'PENGUKURAN_KETEBALAN_KAWAT',
      technician: 'Tim UPT Resor LAA 1.9',
      description: '',
      status: 'COMPLETED',
      timestamp: new Date().toISOString().slice(0, 16),
    });
    setIsFormOpen(true);
  };

  // Open Form to Edit Existing Work Log
  const handleOpenEdit = (log) => {
    setEditingLogId(log.id);
    const dateStr = log.timestamp ? new Date(log.timestamp).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16);
    setFormData({
      targetCode: log.targetCode || '',
      actionType: log.actionType || 'INSPEKSI',
      technician: log.technician || '',
      description: log.description || '',
      status: log.status || 'COMPLETED',
      timestamp: dateStr,
    });
    setIsFormOpen(true);
  };

  // Handle Save
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.targetCode || !formData.technician || !formData.description) return;

    setSubmitting(true);
    try {
      if (editingLogId) {
        if (onUpdateLog) await onUpdateLog(editingLogId, formData);
      } else {
        if (onAddLog) await onAddLog(formData);
      }
      setIsFormOpen(false);
      setEditingLogId(null);
    } catch (err) {
      console.error('Error saving log:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete
  const handleConfirmDelete = async (id) => {
    try {
      if (onDeleteLog) await onDeleteLog(id);
      setDeleteConfirmId(null);
    } catch (err) {
      console.error('Error deleting log:', err);
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Main Drawer Panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[600px] bg-white border-l border-slate-200 shadow-2xl flex flex-col animate-in slide-in-from-right duration-250 select-none text-slate-800">
        
        {/* ========================================================
            DRAWER HEADER
            ======================================================== */}
        <div className="bg-gradient-to-r from-slate-50 via-white to-slate-50 p-4 sm:p-5 border-b border-slate-200 flex items-start justify-between relative">
          <div className="flex items-start space-x-3.5 relative z-10 min-w-0 pr-2">
            
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

            <div className="min-w-0">
              {/* Badges: ONLY displayed in single line mode */}
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

              <h2 className="text-base sm:text-lg font-black text-slate-900 leading-snug truncate">
                {isAllLogsMode
                  ? 'Daftar Riwayat Pekerjaan LAA'
                  : locationTitle}
              </h2>

              <p className="text-xs text-slate-500 mt-0.5 truncate">
                {isAllLogsMode
                  ? `Total ${logs.length} catatan pekerjaan pemeliharaan pada lintas Resor LAA 1.9 Jatinegara`
                  : 'Riwayat inspeksi, pemeliharaan teknis, dan pencatatan pekerjaan seksi'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 shrink-0 relative z-10">
            {isAdmin && (
              <button
                onClick={handleOpenAdd}
                className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs py-2 px-3 rounded-xl flex items-center space-x-1 shadow-sm transition cursor-pointer"
                title="Catat Pekerjaan Baru"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Catat Pekerjaan</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-800 p-2 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              title="Tutup Panel (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
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
                  {/* Glowing Left Accent Strip matching exact AutoCAD line color on map */}
                  <div
                    className="absolute top-0 bottom-0 left-0 w-2 group-hover:w-2.5 transition-all"
                    style={{
                      backgroundColor: lineInfo.color,
                      boxShadow: `0 0 10px ${lineInfo.color}80`,
                    }}
                  />

                  {/* Header Bar: Waktu & Lokasi dengan Warna Garis Asli */}
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

                  {/* Identifikasi Nama Garis / Warna Seksi Pada Peta */}
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

                  {/* Deskripsi Hasil Pekerjaan & Nilai Ukur */}
                  <div className="pl-2">
                    <div className="bg-slate-50/90 p-3 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed font-normal">
                      {log.description}
                    </div>
                  </div>

                  {/* Pelaksana & Tag Target */}
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

                  {/* Admin Action Buttons (Edit & Delete) */}
                  {isAdmin && (
                    <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100 pl-2">
                      <button
                        onClick={() => handleOpenEdit(log)}
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 py-1 px-2.5 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                        title="Edit Catatan Pekerjaan"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(log.id)}
                        className="text-rose-600 hover:text-rose-800 hover:bg-rose-50 py-1 px-2.5 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                        title="Hapus Catatan Pekerjaan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  )}

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

      {/* ========================================================
          ADMIN MODAL FORM: INPUT / EDIT RIWAYAT PEKERJAAN
          ======================================================== */}
      {isFormOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 select-none">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            {/* Form Top Ribbon */}
            <div className="h-1.5 w-full bg-gradient-to-r from-blue-700 via-indigo-600 via-amber-500 to-emerald-500" />

            {/* Form Header */}
            <div className="p-4 sm:p-5 flex items-start justify-between border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center space-x-3">
                <div className={`p-2.5 rounded-xl text-white shadow-sm ${editingLogId ? 'bg-blue-600' : 'bg-emerald-600'}`}>
                  {editingLogId ? <Edit3 className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {editingLogId ? 'Edit Catatan Pekerjaan LAA' : 'Input Catatan Pekerjaan Baru'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    UPT Resor LAA 1.9 Jatinegara • Mode Administrator
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleFormSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
              
              {/* Target Seksi / Line */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Target Line / Seksi / Naspan / Wesel:</span>
                  <span className="text-[10px] text-blue-600 font-mono">Wajib</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.targetCode}
                  onChange={(e) => setFormData({ ...formData, targetCode: e.target.value })}
                  placeholder="Contoh: NASPAN 1 JNG-KLD (HU), WESEL W83A1, DS 5"
                  className="w-full bg-slate-50 hover:bg-white focus:bg-white text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:outline-none transition shadow-2xs text-slate-900"
                />
              </div>

              {/* Jenis Pekerjaan */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Jenis Tindakan / Pekerjaan:
                </label>
                <select
                  value={formData.actionType}
                  onChange={(e) => setFormData({ ...formData, actionType: e.target.value })}
                  className="w-full bg-slate-50 hover:bg-white focus:bg-white text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:outline-none transition shadow-2xs text-slate-800"
                >
                  <option value="PENGUKURAN_KETEBALAN_KAWAT">PENGUKURAN KETEBALAN KAWAT KONTAK</option>
                  <option value="PENYETELAN_DROPPER">PENYETELAN DROPPER & KETINGGIAN (STAGGER)</option>
                  <option value="THERMOVISION_HOTSPOT">THERMOVISION SCANNING / PEMERIKSAAN SUHU</option>
                  <option value="PEMBERSIHAN_ISOLATOR">PEMBERSIHAN ISOLATOR KERAMIK & FRP</option>
                  <option value="PEMERIKSAAN_STEADY_ARM">PEMERIKSAAN STEADY ARM & PIPA KLEM</option>
                  <option value="UJI_ISOLASI_AIR_SECTION">UJI TAHANAN ISOLASI AIR SECTION / AIR JOINT</option>
                  <option value="PERBAIKAN_JUMPER_WIRE">PERBAIKAN / PENGGANTIAN JUMPER WIRE</option>
                  <option value="INSPEKSI_ZIG_ZAG_WIRE">INSPEKSI ZIG-ZAG KAWAT KONTAK</option>
                  <option value="PENGGANTIAN_DROPPER_PUTUS">PENGGANTIAN DROPPER PUTUS / KENDOR</option>
                  <option value="INSPEKSI_WESEL">INSPEKSI MEKANIKAL WESEL & SEPUR SIMPAN</option>
                  <option value="PERAWATAN_PISAU_DS">PERAWATAN PISAU KONTAK DISCONNECTING SWITCH</option>
                  <option value="KALIBRASI_PENENGANG_BEBAN">KALIBRASI PULLEY / BANDUL PENENGANG BEBAN</option>
                  <option value="PEMELIHARAAN_RUTIN">PEMELIHARAAN RUTIN PREVENTIF</option>
                </select>
              </div>

              {/* Pelaksana / Teknisi */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Pelaksana / Teknisi Bertugas:
                </label>
                <input
                  type="text"
                  required
                  value={formData.technician}
                  onChange={(e) => setFormData({ ...formData, technician: e.target.value })}
                  placeholder="Contoh: Regu Pemeliharaan LAA (Ahmad Subarkah)"
                  className="w-full bg-slate-50 hover:bg-white focus:bg-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:outline-none transition shadow-2xs text-slate-900"
                />
              </div>

              {/* Tanggal & Waktu WIB */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Waktu Pelaksanaan Pekerjaan (WIB):
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.timestamp}
                  onChange={(e) => setFormData({ ...formData, timestamp: e.target.value })}
                  className="w-full bg-slate-50 hover:bg-white focus:bg-white text-xs px-3.5 py-2 rounded-xl border border-slate-300 focus:border-blue-600 focus:outline-none transition shadow-2xs text-slate-800"
                />
              </div>

              {/* Uraian Pekerjaan (Description) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Uraian Hasil Pekerjaan & Nilai Pengukuran:
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Jelaskan detail tindakan teknis, nilai ukur (mm/volt/ohm), kondisi komponen, serta window kerja malam..."
                  className="w-full bg-slate-50 hover:bg-white focus:bg-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:outline-none transition shadow-2xs text-slate-900 leading-relaxed"
                />
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Status Pekerjaan:
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-slate-50 hover:bg-white focus:bg-white text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:outline-none transition shadow-2xs text-slate-800"
                >
                  <option value="COMPLETED">SELESAI (COMPLETED)</option>
                  <option value="IN_PROGRESS">SEDANG PROSES (IN PROGRESS)</option>
                  <option value="SCHEDULED">TERJADWAL (SCHEDULED)</option>
                </select>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="w-1/3 py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer text-center"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-2/3 py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md active:scale-98 transition cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingLogId ? 'Simpan Perubahan' : 'Catat Pekerjaan Baru'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ========================================================
          DELETE CONFIRMATION DIALOG
          ======================================================== */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-5 shadow-2xl border border-slate-200 max-w-sm w-full space-y-3.5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-2 text-rose-600">
              <div className="p-2 rounded-xl bg-rose-50 border border-rose-200">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <h4 className="font-extrabold text-slate-900 text-sm">Hapus Catatan Pekerjaan?</h4>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed">
              Catatan riwayat pekerjaan pemeliharaan ini akan dihapus secara permanen dari basis data UPT Resor LAA 1.9.
            </p>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => handleConfirmDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold shadow-sm transition cursor-pointer"
              >
                Ya, Hapus Catatan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
