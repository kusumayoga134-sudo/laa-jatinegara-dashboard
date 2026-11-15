import React, { useState } from 'react';
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
} from 'lucide-react';

export default function WorkHistoryPanel({
  locationData,
  logs = [],
  onClose,
  onAddLog,
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState('ALL'); // 'ALL', '7D', '30D'
  const [searchQuery, setSearchQuery] = useState('');
  
  // New Log Form State
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

  if (!locationData) return null;

  // Filter logs relevant to this location
  const locationCode = locationData.code || locationData.name || '';
  const matchingLogs = logs.filter((log) => {
    const codeMatch =
      !locationCode ||
      (log.targetCode &&
        (log.targetCode.toLowerCase().includes(locationCode.toLowerCase()) ||
          locationCode.toLowerCase().includes(log.targetCode.toLowerCase())));

    if (filterPeriod === 'ALL') return codeMatch;
    const logDate = new Date(log.timestamp);
    const now = new Date();
    const daysDiff = (now - logDate) / (1000 * 60 * 60 * 24);
    if (filterPeriod === '7D') return codeMatch && daysDiff <= 7;
    if (filterPeriod === '30D') return codeMatch && daysDiff <= 30;
    return codeMatch;
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
    { id: 'PENGUKURAN_KETEBALAN_KAWAT', label: 'Ukur Ketebalan Kawat', icon: '📏' },
    { id: 'PENYETELAN_DROPPER', label: 'Penyetelan Dropper', icon: '🔧' },
    { id: 'THERMOVISION_HOTSPOT', label: 'Thermovision Panas', icon: '🌡️' },
    { id: 'PEMBERSIHAN_ISOLATOR', label: 'Pembersihan Isolator', icon: '🧼' },
    { id: 'PERAWATAN_WESEL_LAA', label: 'Perawatan Wesel LAA', icon: '⚙️' },
    { id: 'KALIBRASI_PENENGANG_BEBAN', label: 'Kompensator Penegang', icon: '🪝' },
    { id: 'PENGGANTIAN_KAWAT_KONTAK', label: 'Ganti Kawat / Jumper', icon: '⚡' },
    { id: 'INSPEKSI_RUTIN', label: 'Inspeksi Rutin Fisik', icon: '📋' },
    { id: 'LAINNYA', label: 'Pekerjaan Lainnya', icon: '✍️' },
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
    if (!technician || !description) return;

    setIsSubmitting(true);
    try {
      const finalAction =
        itemPekerjaan === 'LAINNYA' && customItem ? customItem : itemPekerjaan;

      await onAddLog({
        targetType: locationData.type || 'LINE',
        targetCode: locationCode || 'UMUM LAA 1.9',
        actionType: finalAction,
        technician,
        description,
        timestamp: new Date(workDate),
        status: 'COMPLETED',
      });

      setDescription('');
      setTechnician('');
      setShowAddForm(false);
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

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[540px] bg-white border-l border-slate-200 shadow-2xl flex flex-col animate-in slide-in-from-right duration-250 select-none text-slate-800">
      
      {/* Drawer Header (White Mode) */}
      <div className="bg-gradient-to-r from-slate-50 to-white p-5 border-b border-slate-200 flex items-start justify-between relative">
        <div className="flex items-start space-x-3.5 relative z-10">
          <div className={`p-3 rounded-2xl text-white shadow-md mt-0.5 ${
            locationData.isAllLogs
              ? 'bg-gradient-to-br from-orange-500 to-amber-600'
              : 'bg-blue-600'
          }`}>
            {locationData.isAllLogs ? (
              <ClipboardList className="w-5 h-5" />
            ) : (
              <Train className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                {locationData.category || 'SEKSI NASPAN LAA'}
              </span>
              <span className="text-xs font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping mr-1" />
                {locationData.km || '1500 V DC'}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 mt-1 leading-snug">
              {locationData.title || locationData.name || locationCode || 'Input Pekerjaan Baru'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Riwayat inspeksi, pemeliharaan teknis, dan pencatatan pekerjaan
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-800 p-2 rounded-xl hover:bg-slate-100 transition cursor-pointer relative z-10"
          title="Tutup Panel (Esc)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Filter and Add Action Strip */}
      <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-1.5">
          <span className="text-slate-500 font-semibold text-xs">Waktu:</span>
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

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm cursor-pointer ${
            showAddForm
              ? 'bg-slate-200 text-slate-700 hover:bg-slate-300 border border-slate-300'
              : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-orange-500/20'
          }`}
        >
          {showAddForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          <span>{showAddForm ? 'Tutup Form' : '+ Catat Pekerjaan'}</span>
        </button>
      </div>

      {/* Quick Search Bar */}
      <div className="px-5 py-2.5 bg-white border-b border-slate-200">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari lokasi/naspan, teknisi, atau uraian pekerjaan..."
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
          <div className="text-[10.5px] text-slate-500 mt-1.5 px-1 flex items-center justify-between">
            <span>Ditemukan <strong>{filteredLogs.length}</strong> catatan cocok</span>
            <button onClick={() => setSearchQuery('')} className="text-blue-600 font-bold hover:underline">
              Reset Pencarian
            </button>
          </div>
        )}
      </div>

      {/* Drawer Scroll Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
        
        {/* ========================================================
            WORK INPUT MENU (WHITE MODE)
            ======================================================== */}
        {showAddForm && (
          <form
            onSubmit={handleFormSubmit}
            className="bg-white border-2 border-orange-400 rounded-3xl p-5 space-y-4 shadow-lg animate-in zoom-in-95 duration-200 relative overflow-hidden"
          >
            {/* Top color bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-amber-400 to-blue-500" />

            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Formulir Catatan Pekerjaan Baru
                </span>
              </div>
              <span className="text-xs text-orange-700 font-mono font-bold bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
                {locationCode || 'Lintas LAA 1.9'}
              </span>
            </div>

            {/* 1. Item Pekerjaan Selection */}
            <div>
              <label className="block text-slate-700 text-xs font-bold mb-1.5 uppercase tracking-wider">
                1. Pilih Item / Jenis Pekerjaan
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
                  placeholder="Ketikkan jenis pekerjaan secara spesifik..."
                  value={customItem}
                  onChange={(e) => setCustomItem(e.target.value)}
                  className="w-full mt-2 bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              )}
            </div>

            {/* 2. Waktu Pelaksanaan */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-slate-700 text-xs font-bold uppercase tracking-wider">
                  2. Waktu Pelaksanaan
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

            {/* 3. Petugas Pelaksana */}
            <div>
              <label className="block text-slate-700 text-xs font-bold mb-1.5 uppercase tracking-wider">
                3. Petugas / Regu Pelaksana
              </label>
              <input
                type="text"
                required
                placeholder="mis. Tim Ukur Kawat LAA 1.9 (Ahmad & Joko)"
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
                    className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer transition"
                  >
                    + {team.split(' ')[0]} {team.split(' ')[1] || ''}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Deskripsi & Temuan Ukur */}
            <div>
              <label className="block text-slate-700 text-xs font-bold mb-1.5 uppercase tracking-wider">
                4. Deskripsi Hasil Pekerjaan & Nilai Ukur
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
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-extrabold transition flex items-center space-x-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Pekerjaan'}</span>
              </button>
            </div>
          </form>
        )}

        {/* ========================================================
            TIMELINE LIST OF WORKS (WHITE MODE)
            ======================================================== */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
            <span className="font-extrabold text-slate-700 uppercase tracking-wider text-xs flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5 text-blue-600" />
              Riwayat Pekerjaan ({matchingLogs.length} Catatan)
            </span>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center text-xs text-slate-500 space-y-2 shadow-xs">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <p className="font-bold text-slate-800 text-sm">Belum ada riwayat pekerjaan tercatat di lokasi ini.</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Gunakan tombol <strong className="text-orange-600 font-bold">+ Catat Pekerjaan</strong> di atas untuk memasukkan pekerjaan pertama.
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

              return (
                <div
                  key={log.id}
                  className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200 space-y-2 relative overflow-hidden group"
                >
                  {/* Left accent strip */}
                  <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-gradient-to-b from-blue-500 to-emerald-500 group-hover:w-2 transition-all" />

                  {/* Header: Lokasi, Waktu & Status */}
                  <div className="flex items-center justify-between text-xs pl-1.5 flex-wrap gap-1">
                    <div className="flex items-center space-x-1.5 text-blue-700 font-mono font-bold text-xs">
                      <Clock className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                      <span>{formattedDate}</span>
                      <span>•</span>
                      <span>{formattedTime} WIB</span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      {log.targetCode && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs">
                          {log.targetCode}
                        </span>
                      )}
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center">
                        <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                        {log.status || 'SELESAI'}
                      </span>
                    </div>
                  </div>

                  {/* Item Pekerjaan */}
                  <div className="pl-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      ITEM PEKERJAAN:
                    </span>
                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 mt-0.5 flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      {formatActionName(log.actionType)}
                    </h4>
                  </div>

                  {/* Deskripsi & Nilai Ukur */}
                  <div className="pl-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
                    {log.description}
                  </div>

                  {/* Pelaksana & Lokasi */}
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100 pl-1.5">
                    <span className="flex items-center space-x-1.5">
                      <HardHat className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                      <span>Pelaksana:</span>
                      <strong className="text-slate-800 font-semibold">{log.technician}</strong>
                    </span>

                    <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
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
  );
}
