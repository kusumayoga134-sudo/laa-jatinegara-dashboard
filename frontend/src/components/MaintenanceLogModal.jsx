import React, { useState, useMemo } from 'react';
import { Wrench, Plus, Clock, Send, Train, MapPin } from 'lucide-react';
import { ALL_MAP_LOCATIONS } from '../data/allMapLocations';
import { CategoryBadgeIcon, detectLogCategories } from './CategoryBeaconIcons';
import {
  MONTH_NAMES_ID,
  YEAR_OPTIONS,
  getDefaultYear,
  getDefaultMonth,
  resolveLogTime,
  resolveLogKilometer,
  resolveLogDescription,
  hasRealDescription,
} from '../utils/workLogHelpers';

export default function MaintenanceLogModal({ logs = [], onAddLog, isLoading }) {
  const [showForm, setShowForm] = useState(false);
  const defaultLoc = ALL_MAP_LOCATIONS[0] || { id: 'jng_jalur_1', title: 'ST. JATINEGARA (Jalur 1)', km: '' };

  const [formData, setFormData] = useState({
    tahun: getDefaultYear(),
    bulan: getDefaultMonth(),
    actionType: '',
    targetCode: defaultLoc.title,
    targetId: defaultLoc.id,
    kilometer: defaultLoc.km || '',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const locationOptions = useMemo(() => ALL_MAP_LOCATIONS, []);
  const previewCategories = useMemo(
    () =>
      detectLogCategories({
        actionType: formData.actionType,
        description: formData.description,
      }),
    [formData.actionType, formData.description]
  );

  const handleLocationChange = (selectedId) => {
    const found = locationOptions.find((loc) => loc.id === selectedId);
    if (found) {
      setFormData((prev) => ({
        ...prev,
        targetId: found.id,
        targetCode: found.title,
        kilometer: found.km || prev.kilometer || '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.tahun || !formData.bulan || !formData.actionType.trim() || !formData.targetCode.trim() || !formData.kilometer.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const monthIdx = MONTH_NAMES_ID.indexOf(String(formData.bulan).toUpperCase());
      const yearNum = parseInt(formData.tahun, 10) || getDefaultYear();
      const computedTs = new Date(Date.UTC(yearNum, monthIdx >= 0 ? monthIdx : 0, 15, 5, 0, 0)).toISOString();

      await onAddLog({
        tahun: yearNum,
        bulan: String(formData.bulan).toUpperCase(),
        actionType: formData.actionType.trim(),
        targetType: 'LINE',
        targetCode: formData.targetCode.trim(),
        targetId: formData.targetId || null,
        kilometer: formData.kilometer.trim(),
        description: formData.description.trim() || '-',
        timestamp: computedTs,
      });

      setFormData({
        tahun: getDefaultYear(),
        bulan: getDefaultMonth(),
        actionType: '',
        targetCode: defaultLoc.title,
        targetId: defaultLoc.id,
        kilometer: defaultLoc.km || '',
        description: '',
      });
      setShowForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Wrench className="w-5 h-5 text-orange-400" />
            Riwayat Pekerjaan Jaringan Wilayah UPT LAA 1.9 JNG
          </h2>
          <p className="text-xs text-slate-400">
            Catatan pemeliharaan jaringan listrik aliran atas (5 Kolom Standar Excel)
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-md shadow-orange-600/30"
        >
          <Plus className="w-4 h-4" />
          <span>{showForm ? 'Tutup Formulir' : 'Catat Pekerjaan Baru'}</span>
        </button>
      </div>

      {/* Add Log Form (Tepat 5 Item) */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl space-y-3 animate-in fade-in duration-200"
        >
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider pb-2 border-b border-slate-800">
            Formulir Catatan Pekerjaan (5 Item)
          </div>

          {/* 1. WAKTU (Tahun + Bulan sejajar) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 text-xs font-semibold mb-1">1. Tahun *</label>
              <select
                required
                value={formData.tahun}
                onChange={(e) => setFormData({ ...formData, tahun: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-base sm:text-xs text-white focus:outline-none focus:border-blue-500"
              >
                {YEAR_OPTIONS.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 text-xs font-semibold mb-1">Bulan *</label>
              <select
                required
                value={formData.bulan}
                onChange={(e) => setFormData({ ...formData, bulan: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-base sm:text-xs text-white focus:outline-none focus:border-blue-500"
              >
                {MONTH_NAMES_ID.map((bln) => (
                  <option key={bln} value={bln}>
                    {bln}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 2. JENIS PEKERJAAN */}
          <div>
            <label className="block text-slate-400 text-xs font-semibold mb-1">2. Jenis Pekerjaan *</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Contoh: PENGGANTIAN KAWAT OHGW, PEMASANGAN GROUNDING..."
                value={formData.actionType}
                onChange={(e) => setFormData({ ...formData, actionType: e.target.value })}
                style={
                  previewCategories.length > 0
                    ? { paddingRight: `${previewCategories.length * 25 + 14}px` }
                    : undefined
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-base sm:text-xs text-white focus:outline-none focus:border-blue-500"
              />
              {previewCategories.length > 0 && (
                <div
                  data-form-category-preview="true"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1"
                >
                  {previewCategories.map((cat) => (
                    <span key={cat.key} title={cat.label} className="inline-flex shrink-0">
                      <CategoryBadgeIcon category={cat} size={21} />
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 3. LOKASI & 4. KILOMETER */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 text-xs font-semibold mb-1">
                <Train className="w-3.5 h-3.5 inline mr-1 text-blue-400" />
                3. Lokasi *
              </label>
              <select
                required
                value={formData.targetId}
                onChange={(e) => handleLocationChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-base sm:text-xs text-white focus:outline-none focus:border-blue-500"
              >
                {locationOptions.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.title} {loc.km ? `(${loc.km})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 text-xs font-semibold mb-1">
                <MapPin className="w-3.5 h-3.5 inline mr-1 text-emerald-400" />
                4. Kilometer *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: KM 20+0/1 s.d KM 20+9/0"
                value={formData.kilometer}
                onChange={(e) => setFormData({ ...formData, kilometer: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-base sm:text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          {/* 5. URAIAN (Opsional) */}
          <div>
            <label className="block text-slate-400 text-xs font-semibold mb-1">5. Uraian (Opsional)</label>
            <textarea
              rows={2}
              placeholder="Contoh: 4 TITIK, 2 TITIK, atau kosongkan (-)..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-base sm:text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-md shadow-emerald-600/30 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Catatan'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Logs Table (5 Kolom Excel) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Waktu</th>
                <th className="py-3 px-4">Jenis Pekerjaan</th>
                <th className="py-3 px-4">Lokasi</th>
                <th className="py-3 px-4">Kilometer</th>
                <th className="py-3 px-4">Uraian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {logs.map((log) => {
                const { label: timeLabel } = resolveLogTime(log);
                const kmLabel = resolveLogKilometer(log);
                const descLabel = resolveLogDescription(log);
                return (
                  <tr key={log.id} className="hover:bg-slate-800/50">
                    <td className="py-3 px-4 font-mono text-slate-300 whitespace-nowrap font-bold">
                      <Clock className="w-3 h-3 inline mr-1.5 text-orange-400" />
                      {timeLabel}
                    </td>
                    <td className="py-3 px-4 font-bold text-white">
                      <div className="flex items-start justify-between gap-2">
                        <span className="min-w-0">{log.actionType}</span>
                        {(() => {
                          const itemCats = detectLogCategories(log);
                          return itemCats.length > 0 ? (
                            <div className="flex items-center gap-1 shrink-0">
                              {itemCats.map((cat) => (
                                <span key={cat.key} title={cat.label} className="inline-flex shrink-0">
                                  <CategoryBadgeIcon category={cat} size={20} />
                                </span>
                              ))}
                            </div>
                          ) : null;
                        })()}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-cyan-300 whitespace-nowrap">
                      {log.targetCode}
                    </td>
                    <td className="py-3 px-4 font-mono text-emerald-300 whitespace-nowrap">
                      {kmLabel || '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-md">
                      {hasRealDescription(log) ? descLabel : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
