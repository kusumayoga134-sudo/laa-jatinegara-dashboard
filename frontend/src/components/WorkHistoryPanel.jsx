import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  ChevronDown,
} from 'lucide-react';
import { ALL_MAP_LOCATIONS } from '../data/allMapLocations';
import { matchLineLogs, findBestLineForLog, ALL_TRACK_LINES } from './SchematicViewer';

// ========================================================
// COLOR RESOLVER: Pemetaan Warna Asli Garis AutoCAD DWG
// Sinkronisasi Dinamis & Otomatis (Single Source of Truth)
// Setiap catatan pekerjaan diberi warna dan nama seksi yang
// persis sama 100% dengan garis / simbol pada peta skematik.
// ========================================================
export function getColorName(hex) {
  if (!hex) return '';
  const c = hex.toLowerCase();
  if (c === '#ec1f24' || c === '#ff0000') return 'Merah';
  if (c === '#139a47' || c === '#00ff00') return 'Hijau';
  if (c === '#f8d731' || c === '#eab308' || c === '#facc15') return 'Kuning';
  if (c === '#cc6827' || c === '#ea580c' || c === '#f97316') return 'Oranye Cokelat';
  if (c === '#8a6ddd' || c === '#a855f7' || c === '#8b5cf6') return 'Ungu';
  if (c === '#ff00ff' || c === '#d946ef') return 'Magenta';
  if (c === '#00bfff' || c === '#00ffff' || c === '#06b6d4' || c === '#0ea5e9') return 'Biru Langit';
  if (c === '#0000ff' || c === '#2563eb' || c === '#1d4ed8') return 'Biru';
  if (c === '#ff7fdf') return 'Merah Muda';
  if (c === '#ff9f7f') return 'Oranye Muda';
  if (c === '#000000') return 'Hitam';
  return '';
}

export function getColorBadgeClass(hex) {
  if (!hex) return 'bg-slate-50 text-slate-800 border-slate-300';
  const c = hex.toLowerCase();
  if (c === '#ec1f24' || c === '#ff0000') return 'bg-red-50 text-red-800 border-red-300';
  if (c === '#139a47' || c === '#00ff00') return 'bg-emerald-50 text-emerald-800 border-emerald-300';
  if (c === '#f8d731' || c === '#eab308' || c === '#facc15') return 'bg-yellow-50 text-yellow-800 border-yellow-300';
  if (c === '#cc6827' || c === '#ea580c' || c === '#f97316') return 'bg-amber-50 text-amber-800 border-amber-300';
  if (c === '#8a6ddd' || c === '#a855f7' || c === '#8b5cf6') return 'bg-purple-50 text-purple-800 border-purple-300';
  if (c === '#ff00ff' || c === '#d946ef') return 'bg-fuchsia-50 text-fuchsia-800 border-fuchsia-300';
  if (c === '#00bfff' || c === '#00ffff' || c === '#06b6d4' || c === '#0ea5e9') return 'bg-cyan-50 text-cyan-800 border-cyan-300';
  if (c === '#0000ff' || c === '#2563eb' || c === '#1d4ed8') return 'bg-blue-50 text-blue-800 border-blue-300';
  return 'bg-slate-50 text-slate-800 border-slate-300';
}

export function getLineColorInfo(targetCode = '', description = '', targetId = '') {
  const rawCode = (targetCode || '').trim();
  const rawDesc = (description || '').trim();
  const rawId = (targetId || '').trim();

  if (!rawCode && !rawDesc && !rawId) {
    return {
      color: '#2563eb',
      label: 'Lintas LAA 1.9',
      badgeClass: 'bg-blue-50 text-blue-800 border-blue-300',
    };
  }

  // 0. Strict Target ID Match in Master ALL_MAP_LOCATIONS (Highest Priority)
  if (rawId) {
    const byId = ALL_MAP_LOCATIONS.find((loc) => loc && (loc.id || '').toLowerCase() === rawId.toLowerCase());
    if (byId && byId.color) {
      const colorName = getColorName(byId.color);
      const displayTitle = byId.title || byId.code || rawCode;
      const label = colorName ? `${displayTitle} (${colorName})` : displayTitle;
      return {
        color: byId.color,
        label,
        badgeClass: getColorBadgeClass(byId.color),
      };
    }
  }

  const normTc = rawCode.toLowerCase();
  const cleanTc = normTc.replace(/\s+/g, ' ');
  const alphaTc = normTc.replace(/[^a-z0-9]/g, '');

  // 1. Direct Exact Match in Master ALL_MAP_LOCATIONS (id, code, title)
  let matched = ALL_MAP_LOCATIONS.find((loc) => {
    if (!loc) return false;
    const lId = (loc.id || '').toLowerCase();
    const lCode = (loc.code || '').toLowerCase();
    const lTitle = (loc.title || '').toLowerCase();
    return (
      (lId && (lId === normTc || lId.replace(/\s+/g, ' ') === cleanTc)) ||
      (lCode && (lCode === normTc || lCode.replace(/\s+/g, ' ') === cleanTc)) ||
      (lTitle && (lTitle === normTc || lTitle.replace(/\s+/g, ' ') === cleanTc))
    );
  });

  // 2. Direct Alphanumeric Exact Match (immune to punctuation, hyphens, brackets)
  if (!matched && alphaTc) {
    matched = ALL_MAP_LOCATIONS.find((loc) => {
      if (!loc) return false;
      const aId = (loc.id || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const aCode = (loc.code || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const aTitle = (loc.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      return (aId && aId === alphaTc) || (aCode && aCode === alphaTc) || (aTitle && aTitle === alphaTc);
    });
  }

  // 3. Match via Smart SchematicViewer findBestLineForLog / matchLineLogs (single source of truth with map radar beacons)
  if (!matched && typeof findBestLineForLog === 'function') {
    const dummyLog = { targetCode: rawCode, description: rawDesc, targetId: rawId };
    matched = findBestLineForLog(dummyLog, ALL_TRACK_LINES);
  } else if (!matched && typeof matchLineLogs === 'function') {
    const dummyLog = { targetCode: rawCode, description: rawDesc, targetId: rawId };
    matched = ALL_MAP_LOCATIONS.find((loc) => {
      try {
        const matches = matchLineLogs(loc, [dummyLog]);
        return Array.isArray(matches) && matches.length > 0;
      } catch {
        return false;
      }
    });
  }

  // 4. Special Handlers for Common Naspan & Turnout Variations
  if (!matched) {
    // 4a. Naspan 9 Cakung
    if (normTc.includes('naspan 9') && normTc.includes('cuk')) {
      matched = ALL_MAP_LOCATIONS.find((loc) => loc.id === 'cuk_jalur_1_empl');
    }
    // 4b. Naspan 1 Hulu / Hilir
    else if (normTc.includes('naspan 1')) {
      if (normTc.includes('hu') || normTc.includes('hulu')) {
        matched = ALL_MAP_LOCATIONS.find((loc) => loc.id === 'naspan_1_arah_kld_hu');
      } else if (normTc.includes('hi') || normTc.includes('hilir')) {
        matched = ALL_MAP_LOCATIONS.find((loc) => loc.id === 'naspan_1_arah_kld_hi');
      }
    }
    // 4c. Partial Station + Jalur Match (e.g. "ST. BEKASI (Jalur 3)" or "Jalur 1 Bekasi")
    if (!matched) {
      const jalurM = normTc.match(/\b(?:jalur|jl\.?)\s*(\d+)\b/i);
      if (jalurM) {
        const jNum = jalurM[1];
        for (const st of ['bekasi', 'cakung', 'kranji', 'jatinegara', 'klender baru', 'buaran', 'pondok jati', 'klender']) {
          if (normTc.includes(st)) {
            matched = ALL_MAP_LOCATIONS.find((loc) => {
              const comb = `${loc.title} ${loc.code} ${loc.id}`.toLowerCase();
              return comb.includes(st) && comb.includes(`jalur ${jNum}`);
            });
            if (matched) break;
          }
        }
      }
    }
    // 4d. Device Regex Match (DS, FRP, AS, AJ, Wesel)
    if (!matched) {
      const dsM = rawCode.match(/\bDS\s*(\d+[A-Z]?)\b/i);
      if (dsM) {
        const dsNum = dsM[1];
        matched = ALL_MAP_LOCATIONS.find((loc) => {
          return new RegExp(`\\bDS\\s*-?\\s*${dsNum}\\b`, 'i').test(loc.code || '') || (loc.id || '').toLowerCase().includes(`ds_${dsNum.toLowerCase()}`);
        });
      }
      const frpM = rawCode.match(/FRP[^\s)]*/i);
      if (!matched && frpM) {
        matched = ALL_MAP_LOCATIONS.find((loc) => (loc.code || '').toLowerCase().includes(frpM[0].toLowerCase()) || (loc.id || '').toLowerCase().includes(frpM[0].toLowerCase()));
      }
      const wM = rawCode.match(/W\d{2}[A-Z0-9]*/i);
      if (!matched && wM) {
        matched = ALL_MAP_LOCATIONS.find((loc) => (loc.code || '').toLowerCase().includes(wM[0].toLowerCase()) || (loc.id || '').toLowerCase().includes(wM[0].toLowerCase()));
      }
    }
  }

  // 5. If Matched in Master ALL_MAP_LOCATIONS, return authentic CAD DWG color & label
  if (matched && matched.color) {
    const colorName = getColorName(matched.color);
    const displayTitle = matched.title || matched.code || rawCode;
    const label = colorName ? `${displayTitle} (${colorName})` : displayTitle;
    return {
      color: matched.color,
      label,
      badgeClass: getColorBadgeClass(matched.color),
    };
  }

  // 6. Station-Level Safe Fallback (only for generic non-specific station names)
  const descUpper = rawDesc.toUpperCase();
  const codeUpper = rawCode.toUpperCase();
  const combinedUpper = `${codeUpper} ${descUpper}`;

  if (combinedUpper.includes('BEKASI TIMUR') || combinedUpper.includes('BKT')) {
    return { color: '#ec1f24', label: 'Percabangan Bekasi Timur (Merah)', badgeClass: 'bg-red-50 text-red-800 border-red-300' };
  }
  if (combinedUpper.includes('BEKASI') || combinedUpper.includes('BKS')) {
    return { color: '#ec1f24', label: 'St. Bekasi (Merah)', badgeClass: 'bg-red-50 text-red-800 border-red-300' };
  }
  if (combinedUpper.includes('KRANJI') || combinedUpper.includes('KRI')) {
    return { color: '#00bfff', label: 'St. Kranji (Biru Langit)', badgeClass: 'bg-cyan-50 text-cyan-800 border-cyan-300' };
  }
  if (combinedUpper.includes('CAKUNG') || combinedUpper.includes('CUK')) {
    return { color: '#8a6ddd', label: 'St. Cakung (Ungu)', badgeClass: 'bg-purple-50 text-purple-800 border-purple-300' };
  }
  if (combinedUpper.includes('KLENDER BARU') || combinedUpper.includes('KLDB')) {
    return { color: '#ff0000', label: 'St. Klender Baru (Merah)', badgeClass: 'bg-red-50 text-red-800 border-red-300' };
  }
  if (combinedUpper.includes('BUARAN') || combinedUpper.includes('BUA')) {
    return { color: '#00ff00', label: 'St. Buaran (Hijau)', badgeClass: 'bg-lime-50 text-lime-800 border-lime-300' };
  }
  if (combinedUpper.includes('KLENDER') || combinedUpper.includes('KLD')) {
    return { color: '#0000ff', label: 'St. Klender (Biru)', badgeClass: 'bg-blue-50 text-blue-800 border-blue-300' };
  }
  if (combinedUpper.includes('PONDOK JATI') || combinedUpper.includes('POK')) {
    return { color: '#ff00ff', label: 'St. Pondok Jati (Magenta)', badgeClass: 'bg-fuchsia-50 text-fuchsia-800 border-fuchsia-300' };
  }
  if (combinedUpper.includes('KRAMAT') || combinedUpper.includes('KPB')) {
    return { color: '#ff0000', label: 'Percabangan Kramat (Merah)', badgeClass: 'bg-red-50 text-red-800 border-red-300' };
  }
  if (combinedUpper.includes('JATINEGARA') || combinedUpper.includes('JNG')) {
    return { color: '#139a47', label: 'St. Jatinegara (Hijau)', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300' };
  }

  // 7. General Default Fallback
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
  const isAllLogsMode = Boolean(locationData?.isAllLogs) || !locationData?.code;
  const isOnlyForm = Boolean(locationData?.onlyForm);

  // Station Filter (Hanya Nama Stasiun Keseluruhan)
  const [stationFilter, setStationFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Admin Form State (Add / Edit) - Directly open if autoOpenForm or onlyForm
  const [isFormOpen, setIsFormOpen] = useState(Boolean(locationData?.autoOpenForm || locationData?.onlyForm));
  const [editingLogId, setEditingLogId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    targetCode: '',
    targetId: '',
    actionType: '',
    technician: '',
    description: '',
    status: 'COMPLETED',
    timestamp: new Date().toISOString().slice(0, 16),
  });

  // Custom Elegant Auto-Suggest States for all map locations
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);
  const [suggestCategory, setSuggestCategory] = useState('ALL');
  const [suggestSearchQuery, setSuggestSearchQuery] = useState('');
  const suggestWrapperRef = useRef(null);

  // Close auto-suggest when clicked outside (safe check against detached DOM nodes)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!suggestWrapperRef.current) return;
      const path = e.composedPath ? e.composedPath() : [];
      if (path.includes(suggestWrapperRef.current) || suggestWrapperRef.current.contains(e.target)) {
        return;
      }
      setIsSuggestOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-open Add Form when triggered with autoOpenForm or onlyForm flag
  useEffect(() => {
    if ((locationData?.autoOpenForm || locationData?.onlyForm) && isAdmin) {
      handleOpenAdd();
    }
  }, [locationData, isAdmin]);

  // Filtered suggestion list based on category & input search
  const filteredSuggestions = useMemo(() => {
    const q = (suggestSearchQuery || '').trim().toLowerCase();
    return ALL_MAP_LOCATIONS.filter((item) => {
      // Category tab filter
      if (suggestCategory === 'JALUR' && !item.title.includes('Jalur') && !item.title.includes('ST.')) return false;
      if (suggestCategory === 'NASPAN' && !item.title.includes('NASPAN') && !item.code.includes('NASPAN')) return false;
      if (suggestCategory === 'WESEL' && !item.title.toUpperCase().includes('WESEL') && !item.title.toUpperCase().includes('CROSSING') && !item.title.toUpperCase().includes('CROSSTREK') && item.category !== 'TITIK WESEL' && item.category !== 'TITIK CROSSING') return false;
      if (suggestCategory === 'DS' && item.category !== 'DISCONNECTING SWITCH (DS)') return false;
      if (suggestCategory === 'FRP' && item.category !== 'SECTION INSULATOR (FRP)') return false;
      if (suggestCategory === 'AS_AJ' && item.category !== 'OVERLAP (AS/AJ)' && item.category !== 'PEMISAH SEKSI (AS/AJ)') return false;

      // Search query filter
      if (!q) return true;
      const t = (item.title || '').toLowerCase();
      const c = (item.code || '').toLowerCase();
      const km = (item.km || '').toLowerCase();
      const cat = (item.category || '').toLowerCase();
      return t.includes(q) || c.includes(q) || km.includes(q) || cat.includes(q);
    });
  }, [suggestSearchQuery, suggestCategory]);

  if (!locationData) return null;

  const locationCode = locationData.code || locationData.name || '';
  const locationTitle = locationData.title || locationData.name || locationCode;

  // Filter logs relevant to location or station (100% synchronized with map radar dots & hover cards)
  const matchingLogs = useMemo(() => {
    // 1. All Logs Mode (Seluruh Lintas / Filter per Stasiun)
    if (isAllLogsMode) {
      if (stationFilter === 'ALL') return logs;
      return logs.filter((log) => {
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
        return true;
      });
    }

    // 2. Specific Location Mode: Synchronized 1-to-1 with map radar dots & popup card
    if (locationData) {
      const lId = (locationData.id || '').trim().toLowerCase();
      const lCode = (locationData.code || '').trim().toLowerCase();

      return logs.filter((log) => {
        if (!log || (!log.targetCode && !log.targetId)) return false;
        const tid = (log.targetId || '').trim().toLowerCase();

        // 1. Strict 1-to-1 Exact ID Binding (Highest Priority):
        // If the log has targetId, it MUST match this element's ID exactly!
        if (tid) {
          return lId && tid === lId;
        }

        // 2. For legacy logs without targetId:
        // Use findBestLineForLog to find the exact intended segment
        const best = findBestLineForLog(log, ALL_TRACK_LINES);
        if (best && lId) {
          return (best.id || '').toLowerCase() === lId;
        }

        // 3. Exact code or id match only (NO fuzzy title includes!)
        const tc = (log.targetCode || '').trim().toLowerCase();
        if (lId && tc === lId) return true;
        if (lCode && tc === lCode) return true;

        return false;
      });
    }

    return [];
  }, [logs, locationData, isAllLogsMode, stationFilter]);

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

  // Close Form and clean up
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingLogId(null);
    if (isOnlyForm && onClose) {
      onClose();
    }
  };

  // Open Form to Add New Work Log (Prefilled with exact unique track/apparatus name)
  const handleOpenAdd = () => {
    setEditingLogId(null);
    const initialTarget = isOnlyForm && isAllLogsMode
      ? 'ST. JATINEGARA (Jalur 1)'
      : (locationTitle || locationCode || 'ST. JATINEGARA (Jalur 1)');
    setFormData({
      targetCode: initialTarget,
      targetId: locationData?.id || '',
      actionType: '',
      technician: '',
      description: '',
      status: 'COMPLETED',
      timestamp: new Date().toISOString().slice(0, 16),
    });
    setSuggestSearchQuery('');
    setIsFormOpen(true);
  };

  // Open Form to Edit Existing Work Log
  const handleOpenEdit = (log) => {
    setEditingLogId(log.id);
    const dateStr = log.timestamp ? new Date(log.timestamp).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16);
    let resolvedTargetId = log.targetId || '';
    if (!resolvedTargetId) {
      const best = findBestLineForLog(log, ALL_TRACK_LINES);
      if (best && best.id) resolvedTargetId = best.id;
    }
    setFormData({
      targetCode: log.targetCode || '',
      targetId: resolvedTargetId,
      actionType: log.actionType || '',
      technician: log.technician || '',
      description: log.description || '',
      status: log.status || 'COMPLETED',
      timestamp: dateStr,
    });
    setSuggestSearchQuery('');
    setIsFormOpen(true);
  };

  // Handle Save
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.targetCode?.trim() || !formData.actionType?.trim() || !formData.technician?.trim() || !formData.description?.trim()) return;

    let finalTargetId = formData.targetId;
    if (!finalTargetId) {
      const best = findBestLineForLog({ targetCode: formData.targetCode, description: formData.description }, ALL_TRACK_LINES);
      if (best && best.id) finalTargetId = best.id;
    }

    const payload = {
      ...formData,
      targetId: finalTargetId || null,
    };

    setSubmitting(true);
    try {
      if (editingLogId) {
        if (onUpdateLog) await onUpdateLog(editingLogId, payload);
      } else {
        if (onAddLog) await onAddLog(payload);
      }
      setIsFormOpen(false);
      setEditingLogId(null);
      if (isOnlyForm && onClose) {
        onClose();
      }
    } catch (err) {
      console.error('Error saving log:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete (Fail-safe with loading state)
  const handleConfirmDelete = async (id) => {
    if (!id) return;
    setIsDeleting(true);
    try {
      if (onDeleteLog) await onDeleteLog(id);
    } catch (err) {
      console.error('Error deleting log:', err);
    } finally {
      setIsDeleting(false);
      setDeleteConfirmId(null);
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay - Hanya ditampilkan jika BUKAN mode input-only */}
      {!isOnlyForm && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Main Drawer Panel: DAFTAR RIWAYAT PEKERJAAN - Hanya ditampilkan jika BUKAN mode input-only */}
      {!isOnlyForm && (
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
              className="w-full bg-white hover:bg-slate-100/70 focus:bg-white text-base sm:text-xs pl-10 pr-8 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none transition-all placeholder:text-slate-400 font-medium text-slate-800 shadow-2xs"
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
              const lineInfo = getLineColorInfo(log.targetCode, log.description, log.targetId);

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
      )}

      {/* ========================================================
          ADMIN MODAL FORM: INPUT / EDIT RIWAYAT PEKERJAAN (ELEGAN & MODERN)
          ======================================================== */}
      {isFormOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-md animate-in fade-in duration-200 select-none">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
            
            {/* Top Color Accent Ribbon */}
            <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-600 via-emerald-500 to-amber-500" />

            {/* Form Header */}
            <div className="p-4 sm:p-5 flex items-start justify-between border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white">
              <div className="flex items-center space-x-3.5">
                <div className={`p-2.5 rounded-2xl text-white shadow-md ${
                  editingLogId 
                    ? 'bg-gradient-to-br from-blue-600 to-indigo-700' 
                    : 'bg-gradient-to-br from-emerald-600 to-teal-700'
                }`}>
                  {editingLogId ? <Edit3 className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                      UPT RESOR LAA 1.9
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      • MODE ADMIN
                    </span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 mt-0.5">
                    {editingLogId ? 'Edit Catatan Riwayat Pekerjaan' : 'Catat Riwayat Pekerjaan Baru'}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseForm}
                className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition cursor-pointer"
                title="Tutup (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleFormSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
              
              {/* Target Seksi / Line */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Train className="w-3.5 h-3.5 text-blue-600" />
                    Target Line / Seksi / Naspan / Wesel / DS / FRP:
                  </span>
                  <span className="text-[10px] text-rose-500 font-extrabold uppercase tracking-wider">Wajib Diisi</span>
                </label>
                <div ref={suggestWrapperRef} className="relative">
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={formData.targetCode}
                      onFocus={() => setIsSuggestOpen(true)}
                      onChange={(e) => {
                        setFormData({ ...formData, targetCode: e.target.value, targetId: '' });
                        setSuggestSearchQuery(e.target.value);
                        setIsSuggestOpen(true);
                      }}
                      placeholder="Ketik atau pilih line, naspan, wesel, DS, FRP..."
                      className="w-full bg-slate-50 hover:bg-white focus:bg-white text-base sm:text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 focus:outline-none transition shadow-2xs text-slate-900 placeholder:text-slate-400 placeholder:font-normal pr-16"
                    />

                    {/* Right Action Icons: Live Color Dot & Toggle Chevron */}
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center space-x-1.5">
                      {formData.targetCode && (
                        <span
                          className="w-3.5 h-3.5 rounded-full shadow-xs border border-white shrink-0"
                          style={{ backgroundColor: getLineColorInfo(formData.targetCode, formData.description, formData.targetId).color }}
                          title={getLineColorInfo(formData.targetCode, formData.description, formData.targetId).label}
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setSuggestSearchQuery('');
                          setIsSuggestOpen((prev) => !prev);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition cursor-pointer"
                        title="Buka / Tutup Daftar Saran Lokasi"
                      >
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isSuggestOpen ? 'rotate-180 text-blue-600' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* CUSTOM ELEGANT AUTO-SUGGEST DROPDOWN */}
                  {isSuggestOpen && (
                    <div
                      data-suggest-dropdown="true"
                      className="absolute left-0 right-0 top-full mt-1.5 z-70 bg-white/98 border border-slate-200 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
                    >
                      {/* Category Filter Tabs */}
                      <div className="bg-slate-50/90 border-b border-slate-200/90 p-1.5 flex items-center space-x-1 overflow-x-auto text-[10.5px] font-bold scrollbar-none">
                        {[
                          { id: 'ALL', label: `Semua (${ALL_MAP_LOCATIONS.length})` },
                          { id: 'JALUR', label: 'Jalur / Stasiun' },
                          { id: 'NASPAN', label: 'Naspan' },
                          { id: 'WESEL', label: 'Wesel' },
                          { id: 'DS', label: 'DS (20)' },
                          { id: 'FRP', label: 'FRP (25)' },
                          { id: 'AS_AJ', label: 'AS / AJ (46)' },
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSuggestCategory(tab.id);
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSuggestCategory(tab.id);
                            }}
                            className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap cursor-pointer ${
                              suggestCategory === tab.id
                                ? 'bg-blue-600 text-white shadow-2xs font-extrabold'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>

                      {/* Search Filter Header */}
                      <div className="px-3 py-1.5 bg-slate-100/70 border-b border-slate-200/60 flex items-center justify-between text-[11px]">
                        <div className="flex items-center space-x-1.5 text-slate-500 font-semibold flex-1">
                          <Search className="w-3 h-3 text-slate-400 shrink-0" />
                          <input
                            type="text"
                            value={suggestSearchQuery}
                            onChange={(e) => setSuggestSearchQuery(e.target.value)}
                            placeholder="Cari jalur, stasiun, seksi, wesel..."
                            className="w-full bg-transparent text-slate-800 text-base sm:text-[11px] font-semibold focus:outline-none placeholder:text-slate-400 placeholder:font-normal"
                          />
                        </div>
                        {suggestSearchQuery && (
                          <button
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSuggestSearchQuery('');
                            }}
                            className="text-[10px] text-slate-400 hover:text-slate-700 px-1 py-0.5 rounded bg-slate-200/80 font-bold ml-2 shrink-0 cursor-pointer"
                          >
                            Reset
                          </button>
                        )}
                      </div>

                      {/* Suggestion Items List */}
                      <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 p-1">
                        {filteredSuggestions.length === 0 ? (
                          <div className="p-4 text-center text-xs text-slate-400 italic">
                            Tidak ada lokasi terdaftar yang cocok dengan pencarian. Anda dapat tetap mengetik lokasi custom.
                          </div>
                        ) : (
                          filteredSuggestions.map((item) => (
                            <button
                              key={`${item.id}-${item.title}`}
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setFormData((prev) => ({
                                  ...prev,
                                  targetCode: item.title,
                                  targetId: item.id,
                                }));
                                setIsSuggestOpen(false);
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setFormData((prev) => ({
                                  ...prev,
                                  targetCode: item.title,
                                  targetId: item.id,
                                }));
                                setIsSuggestOpen(false);
                              }}
                              className="w-full text-left px-3 py-2 rounded-xl hover:bg-blue-50/80 transition flex items-center justify-between gap-2.5 group cursor-pointer"
                            >
                              <div className="flex items-center space-x-2.5 min-w-0">
                                <span
                                  className="w-3 h-3 rounded-full shrink-0 border border-slate-300 shadow-2xs group-hover:scale-110 transition-transform"
                                  style={{ backgroundColor: item.color }}
                                />
                                <div className="min-w-0">
                                  <div className="text-xs font-bold text-slate-800 group-hover:text-blue-700 truncate leading-snug">
                                    {item.title}
                                  </div>
                                  <div className="text-[10.5px] font-mono text-slate-400 group-hover:text-slate-600 truncate">
                                    {item.km}
                                  </div>
                                </div>
                              </div>

                              <span className="text-[9.5px] font-black px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/80 uppercase tracking-wider shrink-0">
                                {item.category.replace(/ST\. JATINEGARA.*|PETAK /g, '').slice(0, 16)}
                              </span>
                            </button>
                          ))
                        )}
                      </div>

                      {/* Footer Info */}
                      <div className="bg-slate-50 px-3 py-1.5 border-t border-slate-200/80 flex items-center justify-between text-[10.5px] text-slate-400 font-medium">
                        <span>{filteredSuggestions.length} lokasi terdeteksi</span>
                        <span className="italic">Klik untuk memilih langsung</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Jenis Pekerjaan (Custom Text Input - Wajib Diisi) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-indigo-600" />
                    Jenis Tindakan / Pekerjaan:
                  </span>
                  <span className="text-[10px] text-rose-500 font-extrabold uppercase tracking-wider">Wajib Diisi</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.actionType}
                  onChange={(e) => setFormData({ ...formData, actionType: e.target.value })}
                  placeholder="Ketik jenis tindakan / pekerjaan (contoh: PENGUKURAN KAWAT KONTAK)..."
                  className="w-full bg-slate-50 hover:bg-white focus:bg-white text-base sm:text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 focus:outline-none transition shadow-2xs text-slate-900 placeholder:text-slate-400 placeholder:font-normal"
                />
              </div>

              {/* Pelaksana / Teknisi (Custom Text Input - Wajib Diisi) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <HardHat className="w-3.5 h-3.5 text-amber-500" />
                    Pelaksana / Teknisi Bertugas:
                  </span>
                  <span className="text-[10px] text-rose-500 font-extrabold uppercase tracking-wider">Wajib Diisi</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.technician}
                  onChange={(e) => setFormData({ ...formData, technician: e.target.value })}
                  placeholder="Ketik nama pelaksana / teknisi regu..."
                  className="w-full bg-slate-50 hover:bg-white focus:bg-white text-base sm:text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 focus:outline-none transition shadow-2xs text-slate-900 placeholder:text-slate-400 placeholder:font-normal"
                />
              </div>

              {/* Tanggal & Waktu Pelaksanaan */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  Waktu Pelaksanaan Pekerjaan (WIB):
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.timestamp}
                  onChange={(e) => setFormData({ ...formData, timestamp: e.target.value })}
                  className="w-full bg-slate-50 hover:bg-white focus:bg-white text-base sm:text-xs font-medium px-4 py-2 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 focus:outline-none transition shadow-2xs text-slate-800"
                />
              </div>

              {/* Uraian Pekerjaan & Nilai Pengukuran */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ClipboardList className="w-3.5 h-3.5 text-emerald-600" />
                    Uraian Hasil Pekerjaan & Nilai Pengukuran:
                  </span>
                  <span className="text-[10px] text-rose-500 font-extrabold uppercase tracking-wider">Wajib Diisi</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Jelaskan detail tindakan teknis, nilai ukur (mm/volt/ohm), kondisi komponen, serta window kerja malam..."
                  className="w-full bg-slate-50 hover:bg-white focus:bg-white text-base sm:text-xs px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 focus:outline-none transition shadow-2xs text-slate-900 leading-relaxed placeholder:text-slate-400"
                />
              </div>

              {/* Status Pekerjaan (Modern Elegant Pills) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Status Pekerjaan:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'COMPLETED', label: 'SELESAI', color: 'border-emerald-500 text-emerald-800 bg-emerald-50' },
                    { id: 'IN_PROGRESS', label: 'PROSES', color: 'border-amber-500 text-amber-800 bg-amber-50' },
                    { id: 'SCHEDULED', label: 'TERJADWAL', color: 'border-blue-500 text-blue-800 bg-blue-50' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, status: st.id })}
                      className={`py-2 px-2 text-center rounded-xl text-xs font-black transition cursor-pointer border ${
                        formData.status === st.id
                          ? `${st.color} shadow-xs ring-2 ring-slate-400/20`
                          : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center space-x-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="w-1/3 py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer text-center"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-2/3 py-2.5 px-3 rounded-xl text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md active:scale-98 transition cursor-pointer disabled:opacity-50 ${
                    editingLogId
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700'
                  }`}
                >
                  {submitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{editingLogId ? 'Simpan Perubahan' : 'Catat Pekerjaan Baru'}</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ========================================================
          DELETE CONFIRMATION DIALOG (FAIL-SAFE DENGAN LOADING STATE)
          ======================================================== */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 max-w-sm w-full space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="p-2.5 rounded-2xl bg-rose-50 border border-rose-200">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">Hapus Catatan Pekerjaan?</h4>
                <p className="text-[11px] text-slate-400">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
              Catatan riwayat pekerjaan pemeliharaan ini akan dihapus secara permanen dari basis data sistem UPT Resor LAA 1.9.
            </p>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => handleConfirmDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold shadow-md transition cursor-pointer flex items-center space-x-1.5 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <span>Ya, Hapus Catatan</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
