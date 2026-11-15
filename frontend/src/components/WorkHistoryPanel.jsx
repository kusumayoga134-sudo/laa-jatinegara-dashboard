import React, { useState, useEffect } from 'react';
import {
  Clock,
  Wrench,
  User,
  CheckCircle2,
  Calendar,
  Plus,
  X,
  FileText,
  Train,
  Send,
  Sparkles,
  ChevronRight,
  CalendarDays,
  HardHat,
  Search,
  ClipboardList,
  Filter,
  Layers,
  MapPin,
  Check,
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

// Master list pilihan jalur untuk Form Input Pekerjaan
const trackOptions = [
  { code: 'NASPAN 1 JNG-KLD (HI)', label: 'NASPAN 1 JNG-KLD (Hilir) • KM 11+900 s/d 12+500', color: '#f8d731' },
  { code: 'NASPAN 1 JNG-KLD (HU)', label: 'NASPAN 1 JNG-KLD (Hulu) • KM 11+900 s/d 12+500', color: '#ff00ff' },
  { code: 'NASPAN 2 JNG-KLD', label: 'NASPAN 2 JNG-KLD • KM 12+500 s/d 13+300', color: '#0000ff' },
  { code: 'NASPAN 3 JNG-KLD', label: 'NASPAN 3 JNG-KLD • KM 13+300 s/d 14+100', color: '#0000ff' },
  { code: 'NASPAN 4 JNG-KLD', label: 'NASPAN 4 JNG-KLD • KM 14+100 s/d 14+700', color: '#0000ff' },
  { code: 'NASPAN 4B KLD-BUA', label: 'NASPAN 4B KLD-BUA • KM 14+700 s/d 15+450', color: '#0000ff' },
  { code: 'NASPAN 5 KLD-BUA', label: 'NASPAN 5 KLD-BUA • KM 15+450 s/d 16+500', color: '#00ff00' },
  { code: 'NASPAN 6 KLD-BUA', label: 'NASPAN 6 KLD-BUA • KM 16+500 s/d 17+239', color: '#00ff00' },
  { code: 'NASPAN 7 BUA-KLDB', label: 'NASPAN 7 BUA-KLDB • KM 17+239 s/d 17+900', color: '#ff0000' },
  { code: 'NASPAN 7B BUA-KLDB', label: 'NASPAN 7B BUA-KLDB • KM 17+900 s/d 18+800', color: '#ff0000' },
  { code: 'NASPAN 8 BUA-KLDB', label: 'NASPAN 8 BUA-KLDB • KM 18+800 s/d 19+546', color: '#ff0000' },
  { code: 'NASPAN 9 EMPL CUK', label: 'NASPAN 9 EMPL CUK • KM 20+474 s/d 21+400', color: '#139a47' },
  { code: 'NASPAN 10 CUK-KRI', label: 'NASPAN 10 CUK-KRI • KM 21+400 s/d 22+700', color: '#8a6ddd' },
  { code: 'NASPAN 11 CUK-KRI', label: 'NASPAN 11 CUK-KRI • KM 22+700 s/d 23+987', color: '#8a6ddd' },
  { code: 'NASPAN 12 BKS-KRI', label: 'NASPAN 12 BKS-KRI • KM 23+987 s/d 25+540', color: '#ff00ff' },
  { code: 'NASPAN 13 BKS-KRI', label: 'NASPAN 13 BKS-KRI • KM 25+540 s/d 26+403', color: '#00bfff' },
  { code: 'ST. JATINEGARA (JALUR 1)', label: 'ST. JATINEGARA • Jalur 1 Peron Hulu', color: '#ff00ff' },
  { code: 'ST. JATINEGARA (JALUR 2)', label: 'ST. JATINEGARA • Jalur 2 Peron Hilir', color: '#f8d731' },
  { code: 'ST. JATINEGARA (JALUR 3 & 4)', label: 'ST. JATINEGARA • Jalur 3 & 4 Tengah', color: '#cc6827' },
  { code: 'ST. JATINEGARA (JALUR 5 s/d 8)', label: 'ST. JATINEGARA • Jalur 5 s/d 8 Utama', color: '#139a47' },
  { code: 'ST. BEKASI (JALUR 1 s/d 4)', label: 'ST. BEKASI • Jalur 1 s/d 4 Utama', color: '#00bfff' },
  { code: 'ST. BEKASI (JALUR STABLING 5-8)', label: 'ST. BEKASI • Emplasemen Stabling 5-8', color: '#00bfff' },
  { code: 'DS 1', label: 'DS 1 (NC) MRI-JNG Hilir • KM 11+100', color: '#00ffff' },
  { code: 'DS 2', label: 'DS 2 (NC) MRI-JNG Hulu • KM 11+100', color: '#ff00ff' },
  { code: 'DS 4', label: 'DS 4 (NC) Wesel Masuk JNG Barat', color: '#ff00ff' },
  { code: 'DS 5', label: 'DS 5 (NC) Jalur 2,3 JNG • KM 11+900', color: '#f8d731' },
  { code: 'DS 6', label: 'DS 6 (NC) Jalur 1 JNG • KM 11+900', color: '#ff00ff' },
  { code: 'DS 7', label: 'DS 7 (NO) KLD-JNG Hilir • KM 12+500', color: '#0000ff' },
  { code: 'DS 8', label: 'DS 8 (NO) JNG-KLD Hulu • KM 12+500', color: '#ff9f7f' },
  { code: 'DS 9', label: 'DS 9 (NC) KLDB-BUA Hilir • KM 17+900', color: '#f8d731' },
  { code: 'DS 10', label: 'DS 10 (NC) BUA-KLDB Hulu • KM 17+900', color: '#ff0000' },
  { code: 'DS 11', label: 'DS 11 (NO) CUK-KLDB Hilir • KM 20+150', color: '#f8d731' },
  { code: 'DS 12', label: 'DS 12 (NO) KLDB-CUK Hulu • KM 20+150', color: '#ff0000' },
  { code: 'DS 13', label: 'DS 13 (NC) KRI-CUK Hilir • KM 21+400', color: '#cc6827' },
  { code: 'DS 14', label: 'DS 14 (NC) CUK-KRI Hulu • KM 21+400', color: '#8a6ddd' },
  { code: 'DS 15', label: 'DS 15 (NC) EMP BKS Hilir • KM 26+200', color: '#00bfff' },
  { code: 'DS 16', label: 'DS 16 (NC) EMP BKS Hulu • KM 26+200', color: '#ff00ff' },
  { code: 'DS 17', label: 'DS 17 (NC) EMP BKS (4-5) • KM 26+300', color: '#00bfff' },
  { code: 'DS 18', label: 'DS 18 (NC) EMP BKS (6-7,8) • KM 26+300', color: '#00bfff' },
  { code: 'DS 19', label: 'DS 19 (NC) BKT-BKS Hilir • KM 26+800', color: '#00bfff' },
  { code: 'DS 20', label: 'DS 20 (NC) BKS-BKT Hulu • KM 26+800', color: '#ff00ff' },
  { code: 'AJ KM 18+800', label: 'Air Joint Overlap KM 18+800', color: '#f8d731' },
  { code: 'WESEL JATINEGARA', label: 'Kompleks Wesel W13, W23, W33, W53 JNG', color: '#139a47' },
];

export default function WorkHistoryPanel({
  locationData,
  logs = [],
  onClose,
  onAddLog,
}) {
  const isAddWorkMode = Boolean(locationData?.isAddWork || locationData?.category === 'INPUT PEKERJAAN');
  const isAllLogsMode = Boolean(locationData?.isAllLogs);

  // Form toggling
  const [showAddForm, setShowAddForm] = useState(isAddWorkMode);
  const [filterPeriod, setFilterPeriod] = useState('ALL'); // 'ALL', '7D', '30D'
  const [stationFilter, setStationFilter] = useState('ALL'); // 'ALL', 'JNG', 'KLD', 'BUA', 'CUK', 'BKS', 'DS'
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const initialTargetCode = locationData?.code || locationData?.title || 'NASPAN 1 JNG-KLD (HI)';
  const [selectedTarget, setSelectedTarget] = useState(initialTargetCode);
  const [customTarget, setCustomTarget] = useState('');
  const [isCustomTarget, setIsCustomTarget] = useState(false);
  const [itemPekerjaan, setItemPekerjaan] = useState('PENGUKURAN_KETEBALAN_KAWAT');
  const [customItem, setCustomItem] = useState('');
  const [technician, setTechnician] = useState('');
  const [description, setDescription] = useState('');
  const [workDate, setWorkDate] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state if locationData changes
  useEffect(() => {
    if (isAddWorkMode) {
      setShowAddForm(true);
    } else {
      setShowAddForm(false);
    }
    if (locationData?.code) {
      setSelectedTarget(locationData.code);
      setIsCustomTarget(false);
    }
  }, [locationData, isAddWorkMode]);

  if (!locationData) return null;

  // Filter logs relevant to this location / station
  const locationCode = locationData.code || locationData.name || '';
  const matchingLogs = logs.filter((log) => {
    // If opened from a specific track line on the map
    if (!isAllLogsMode && !isAddWorkMode && locationCode) {
      return (
        log.targetCode &&
        (log.targetCode.toLowerCase().includes(locationCode.toLowerCase()) ||
          locationCode.toLowerCase().includes(log.targetCode.toLowerCase()))
      );
    }

    // Station filter on All Logs mode
    if (isAllLogsMode && stationFilter !== 'ALL') {
      const tc = (log.targetCode || '').toUpperCase();
      if (stationFilter === 'DS' && !tc.startsWith('DS')) return false;
      if (stationFilter === 'JNG' && !tc.includes('JNG') && !tc.includes('JATINEGARA')) return false;
      if (stationFilter === 'KLD' && !tc.includes('KLD') && !tc.includes('KLENDER')) return false;
      if (stationFilter === 'BUA' && !tc.includes('BUA') && !tc.includes('BUARAN')) return false;
      if (stationFilter === 'CUK' && !tc.includes('CUK') && !tc.includes('CAKUNG')) return false;
      if (stationFilter === 'BKS' && !tc.includes('BKS') && !tc.includes('BEKASI')) return false;
    }

    // Time filter
    if (filterPeriod === 'ALL') return true;
    const logDate = new Date(log.timestamp);
    const now = new Date();
    const daysDiff = (now - logDate) / (1000 * 60 * 60 * 24);
    if (filterPeriod === '7D') return daysDiff <= 7;
    if (filterPeriod === '30D') return daysDiff <= 30;
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

  const categories = [
    { id: 'PENGUKURAN_KETEBALAN_KAWAT', label: 'Ukur Ketebalan Kawat Cu', icon: '📏' },
    { id: 'PENYETELAN_DROPPER', label: 'Penyetelan Dropper & Stagger', icon: '🔧' },
    { id: 'THERMOVISION_HOTSPOT', label: 'Thermovision Suhu Titik Panas', icon: '🌡️' },
    { id: 'PEMBERSIHAN_ISOLATOR', label: 'Pembersihan Isolator & FRP', icon: '🧼' },
    { id: 'PERAWATAN_WESEL_LAA', label: 'Perawatan Wesel & Crossing', icon: '⚙️' },
    { id: 'KALIBRASI_PENENGANG_BEBAN', label: 'Kompensator Penegang Beban', icon: '🪝' },
    { id: 'PENGGANTIAN_KAWAT_KONTAK', label: 'Ganti Kawat Kontak / Jumper', icon: '⚡' },
    { id: 'INSPEKSI_RUTIN', label: 'Inspeksi Visual Rutin Seksi', icon: '📋' },
    { id: 'LAINNYA', label: 'Pekerjaan Teknis Lainnya', icon: '✍️' },
  ];

  const quickTeams = [
    'Tim Ukur Kawat LAA 1.9',
    'Regu Jatinegara (Ahmad Subarkah)',
    'Tim Thermovision & Proteksi (Indra)',
    'Regu Pemeliharaan LAA (Bambang)',
    'Tim Siaga Gangguan LAA (Surya)',
  ];

  const setPresetTime = (type) => {
    const d = new Date();
    if (type === 'night') {
      d.setHours(2, 0, 0, 0); // Window malam 02:00
    } else if (type === 'morning') {
      d.setHours(9, 30, 0, 0);
    }
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    setWorkDate(d.toISOString().slice(0, 16));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const finalTarget = isCustomTarget ? customTarget : selectedTarget;
    if (!finalTarget || !technician || !description) return;

    setIsSubmitting(true);
    try {
      const finalAction =
        itemPekerjaan === 'LAINNYA' && customItem ? customItem : itemPekerjaan;

      await onAddLog({
        targetType: locationData.type || 'LINE',
        targetCode: finalTarget,
        actionType: finalAction,
        technician,
        description,
        timestamp: new Date(workDate),
        status: 'COMPLETED',
      });

      setDescription('');
      setTechnician('');
      setCustomItem('');
      if (!isAddWorkMode) {
        setShowAddForm(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatActionName = (action) => {
    if (!action) return 'Pekerjaan Pemeliharaan';
    return action.replace(/_/g, ' ');
  };

  // Resolve current active target color for form banner
  const activeFormTargetColor = getLineColorInfo(isCustomTarget ? customTarget : selectedTarget).color;

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
                : isAddWorkMode
                ? 'bg-gradient-to-br from-blue-600 to-indigo-600'
                : 'bg-gradient-to-br from-blue-600 to-cyan-600'
            }`}>
              {isAllLogsMode ? (
                <ClipboardList className="w-5 h-5" />
              ) : isAddWorkMode ? (
                <Plus className="w-5 h-5" />
              ) : (
                <Train className="w-5 h-5" />
              )}
            </div>

            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <span className={`px-2.5 py-0.5 text-xs font-black rounded-full border uppercase ${
                  isAllLogsMode
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : isAddWorkMode
                    ? 'bg-blue-50 text-blue-800 border-blue-300'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                }`}>
                  {isAllLogsMode
                    ? 'REKAPITULASI TOTAL PEKERJAAN'
                    : isAddWorkMode
                    ? 'FORMULIR INPUT PEKERJAAN'
                    : locationData.category || 'SEKSI NASPAN LAA'}
                </span>

                <span className="text-xs font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping mr-1" />
                  {locationData.km || '1500 V DC'}
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-black text-slate-900 mt-1 leading-snug">
                {isAllLogsMode
                  ? 'Rekapitulasi Seluruh Riwayat Pekerjaan LAA'
                  : isAddWorkMode
                  ? 'Formulir Catat Pekerjaan Baru'
                  : locationData.title || locationData.name || locationCode}
              </h2>

              <p className="text-xs text-slate-500 mt-0.5">
                {isAllLogsMode
                  ? 'Total 85 catatan pekerjaan pada seluruh lintasan kawat catenary UPT Resor LAA 1.9'
                  : isAddWorkMode
                  ? 'Pencatatan riwayat pemeliharaan, pengukuran ketebalan kawat & inspeksi teknis'
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
            TOOLBAR: FILTER WAKTU & TOMBOL FORM INPUT
            ======================================================== */}
        <div className="bg-slate-50 px-4 sm:px-5 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Filter Periode Waktu */}
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500 font-bold text-xs">Periode:</span>
            {['ALL', '30D', '7D'].map((period) => (
              <button
                key={period}
                onClick={() => setFilterPeriod(period)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  filterPeriod === period
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                {period === 'ALL' ? 'Semua' : period === '30D' ? '30 Hari' : '7 Hari'}
              </button>
            ))}
          </div>

          {/* Tombol Toggle Form (untuk mode selain form input utama) */}
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm cursor-pointer ${
              showAddForm
                ? 'bg-slate-200 text-slate-700 hover:bg-slate-300 border border-slate-300'
                : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-orange-500/20'
            }`}
          >
            {showAddForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            <span>{showAddForm ? 'Tutup Formulir' : '+ Catat Pekerjaan'}</span>
          </button>
        </div>

        {/* Filter Stasiun Khusus Mode Rekapitulasi Total Pekerjaan */}
        {isAllLogsMode && (
          <div className="px-4 sm:px-5 py-2 bg-white border-b border-slate-200 overflow-x-auto flex items-center space-x-1.5 scrollbar-none">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-blue-600" />
              Seksi:
            </span>
            {[
              { id: 'ALL', label: 'Semua Jalur' },
              { id: 'JNG', label: 'Jatinegara' },
              { id: 'KLD', label: 'Klender' },
              { id: 'BUA', label: 'Buaran' },
              { id: 'CUK', label: 'Cakung' },
              { id: 'BKS', label: 'Bekasi' },
              { id: 'DS', label: 'Sakelar DS' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStationFilter(st.id)}
                className={`px-2.5 py-1 rounded-full text-xs font-bold shrink-0 transition cursor-pointer border ${
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
        <div className="px-4 sm:px-5 py-2 bg-white border-b border-slate-200">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari lokasi/naspan, teknisi, jenis pekerjaan..."
              className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs pl-10 pr-8 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none transition-all placeholder:text-slate-400 font-medium text-slate-800 shadow-2xs"
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
            DRAWER SCROLL BODY
            ======================================================== */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/50">
          
          {/* ========================================================
              FORM INPUT PEKERJAAN (RESPONSIF, LENGKAP & ELEGAN)
              ======================================================== */}
          {showAddForm && (
            <form
              onSubmit={handleFormSubmit}
              className="bg-white border-2 border-blue-500/70 rounded-3xl p-4 sm:p-5 space-y-4 shadow-xl animate-in zoom-in-95 duration-200 relative overflow-hidden"
            >
              {/* Top Accent Strip menyesuaikan warna jalur aktif */}
              <div
                className="absolute top-0 left-0 right-0 h-1.5 transition-colors duration-300"
                style={{ backgroundColor: activeFormTargetColor }}
              />

              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Input Catatan Pekerjaan Pemeliharaan
                  </span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full shadow-xs"
                    style={{ backgroundColor: activeFormTargetColor }}
                  />
                  <span className="text-[11px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                    {isCustomTarget ? customTarget || 'Kustom' : selectedTarget}
                  </span>
                </div>
              </div>

              {/* 1. Pilih Lokasi / Seksi LAA */}
              <div>
                <label className="block text-slate-700 text-xs font-extrabold mb-1.5 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    1. Pilih Jalur / Seksi LAA
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsCustomTarget(!isCustomTarget)}
                    className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer lowercase"
                  >
                    {isCustomTarget ? '← pilih dari daftar' : '+ ketik manual'}
                  </button>
                </label>

                {!isCustomTarget ? (
                  <div className="relative">
                    <select
                      value={selectedTarget}
                      onChange={(e) => setSelectedTarget(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-2xs"
                    >
                      {trackOptions.map((opt) => (
                        <option key={opt.code} value={opt.code}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <input
                    type="text"
                    required
                    placeholder="Contoh: NASPAN 7B BUA-KLDB, DS 10, atau Wesel W23"
                    value={customTarget}
                    onChange={(e) => setCustomTarget(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                )}
              </div>

              {/* 2. Jenis / Item Pekerjaan */}
              <div>
                <label className="block text-slate-700 text-xs font-extrabold mb-1.5 uppercase tracking-wider flex items-center gap-1">
                  <Wrench className="w-3.5 h-3.5 text-blue-600" />
                  2. Pilih Jenis / Item Pekerjaan
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {categories.map((cat) => (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setItemPekerjaan(cat.id)}
                      className={`p-2 rounded-xl text-left text-xs font-bold transition flex items-center space-x-2 cursor-pointer border ${
                        itemPekerjaan === cat.id
                          ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-xs ring-1 ring-blue-500'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-sm shrink-0">{cat.icon}</span>
                      <span className="truncate">{cat.label}</span>
                    </button>
                  ))}
                </div>

                {itemPekerjaan === 'LAINNYA' && (
                  <input
                    type="text"
                    required
                    placeholder="Ketikkan jenis pekerjaan teknis secara spesifik..."
                    value={customItem}
                    onChange={(e) => setCustomItem(e.target.value)}
                    className="w-full mt-2 bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                )}
              </div>

              {/* 3. Waktu Pelaksanaan */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-slate-700 text-xs font-extrabold uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    3. Waktu Pelaksanaan
                  </label>
                  <div className="flex space-x-1">
                    <button
                      type="button"
                      onClick={() => setPresetTime('night')}
                      className="px-2 py-0.5 rounded-lg text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 cursor-pointer"
                    >
                      🌙 Window Malam (02:00)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPresetTime('morning')}
                      className="px-2 py-0.5 rounded-lg text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 cursor-pointer"
                    >
                      ☀️ Siang (09:30)
                    </button>
                  </div>
                </div>
                <input
                  type="datetime-local"
                  required
                  value={workDate}
                  onChange={(e) => setWorkDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* 4. Petugas / Regu Pelaksana */}
              <div>
                <label className="block text-slate-700 text-xs font-extrabold mb-1.5 uppercase tracking-wider flex items-center gap-1">
                  <HardHat className="w-3.5 h-3.5 text-amber-500" />
                  4. Petugas / Regu Pelaksana
                </label>
                <input
                  type="text"
                  required
                  placeholder="mis. Tim Ukur Kawat LAA 1.9 (Ahmad Subarkah & Joko)"
                  value={technician}
                  onChange={(e) => setTechnician(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
                {/* Quick team suggestions */}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {quickTeams.map((team, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setTechnician(team)}
                      className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer transition font-medium"
                    >
                      + {team.split(' ')[0]} {team.split(' ')[1] || ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Deskripsi & Temuan Ukur */}
              <div>
                <label className="block text-slate-700 text-xs font-extrabold mb-1.5 uppercase tracking-wider flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  5. Deskripsi Hasil Pekerjaan & Nilai Ukur
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Rincian hasil pekerjaan, temuan visual, nilai ukur (sisa ketebalan Cu / suhu kontak / megger isolasi), dan kesimpulan teknis..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 leading-relaxed"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex items-center justify-end space-x-2">
                {!isAddWorkMode && (
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                  >
                    Batal
                  </button>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white text-xs font-black transition flex items-center space-x-2 cursor-pointer shadow-md disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Menyimpan Catatan...' : 'Simpan & Publikasikan Pekerjaan'}</span>
                </button>
              </div>
            </form>
          )}

          {/* ========================================================
              DAFTAR RIWAYAT PEKERJAAN (DENGAN WARNA SESUAI PETA)
              ======================================================== */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
              <span className="font-extrabold text-slate-800 uppercase tracking-wider text-xs flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-blue-600" />
                {isAllLogsMode
                  ? `Daftar Riwayat Pekerjaan Seluruh Lintas (${filteredLogs.length} Catatan)`
                  : isAddWorkMode
                  ? `Catatan Pekerjaan Terakhir (${filteredLogs.length} Dicatat)`
                  : `Riwayat Pekerjaan Seksi (${filteredLogs.length} Catatan)`}
              </span>
            </div>

            {filteredLogs.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center text-xs text-slate-500 space-y-2 shadow-xs">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <p className="font-bold text-slate-800 text-sm">Tidak ada catatan pekerjaan yang cocok.</p>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Gunakan tombol <strong className="text-orange-600 font-bold">+ Catat Pekerjaan</strong> untuk memasukkan data pemeliharaan baru.
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
