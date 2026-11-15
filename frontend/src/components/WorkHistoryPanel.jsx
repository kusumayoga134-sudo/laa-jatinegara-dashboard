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
  AlertCircle,
  Train,
  Zap,
  Send,
  Layers,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Check,
  CalendarDays,
  HardHat,
} from 'lucide-react';

export default function WorkHistoryPanel({
  locationData,
  logs = [],
  onClose,
  onAddLog,
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState('ALL'); // 'ALL', '7D', '30D'
  
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
      log.targetCode &&
      (log.targetCode.toLowerCase().includes(locationCode.toLowerCase()) ||
        locationCode.toLowerCase().includes(log.targetCode.toLowerCase()));

    if (filterPeriod === 'ALL') return codeMatch;
    const logDate = new Date(log.timestamp);
    const now = new Date();
    const daysDiff = (now - logDate) / (1000 * 60 * 60 * 24);
    if (filterPeriod === '7D') return codeMatch && daysDiff <= 7;
    if (filterPeriod === '30D') return codeMatch && daysDiff <= 30;
    return codeMatch;
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
    'Regu Jatinegara (Ahmad & Tim)',
    'Tim Thermovision & Proteksi (Indra)',
    'Regu Pemeliharaan Jalur Timur (KAI)',
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
        targetCode: locationCode,
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
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[520px] bg-slate-900/98 backdrop-blur-2xl border-l border-slate-700 shadow-2xl flex flex-col animate-in slide-in-from-right duration-250 select-none">
      
      {/* Drawer Header */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-5 border-b border-slate-800 flex items-start justify-between relative overflow-hidden">
        {/* Glow orb */}
        <div className="absolute top-0 right-10 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start space-x-3.5 relative z-10">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/20 mt-0.5">
            <Train className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700/60 uppercase">
                {locationData.category || 'JALUR / LOKASI LAA'}
              </span>
              <span className="text-xs font-mono text-emerald-400 font-bold flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-1" />
                {locationData.km || '1500 V DC'}
              </span>
            </div>
            <h2 className="text-lg font-black text-white mt-1 leading-snug">
              {locationData.title || locationData.name || locationCode}
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Riwayat inspeksi, pemeliharaan, dan pencatatan pekerjaan teknis
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition cursor-pointer relative z-10"
          title="Tutup Panel (Esc)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Filter and Add Action Strip */}
      <div className="bg-slate-950/70 px-5 py-3 border-b border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-1.5">
          <span className="text-slate-400 font-semibold text-[11px]">Waktu:</span>
          {['ALL', '30D', '7D'].map((period) => (
            <button
              key={period}
              onClick={() => setFilterPeriod(period)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                filterPeriod === period
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {period === 'ALL' ? 'Semua' : period === '30D' ? '30 Hari' : '7 Hari'}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-lg cursor-pointer ${
            showAddForm
              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-orange-500/30'
          }`}
        >
          {showAddForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          <span>{showAddForm ? 'Tutup Form' : '+ Catat Pekerjaan'}</span>
        </button>
      </div>

      {/* Drawer Scroll Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        
        {/* ========================================================
            OVERHAULED BEAUTIFUL WORK INPUT MENU
            ======================================================== */}
        {showAddForm && (
          <form
            onSubmit={handleFormSubmit}
            className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-2 border-orange-500/60 rounded-3xl p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden"
          >
            {/* Ambient accent top bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-amber-400 to-cyan-400" />

            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-orange-400" />
                <span className="text-xs font-black text-white uppercase tracking-wider">
                  Formulir Catatan Pekerjaan Baru
                </span>
              </div>
              <span className="text-[10px] text-orange-300 font-mono font-bold bg-orange-950/80 px-2 py-0.5 rounded-full border border-orange-700/60">
                {locationCode}
              </span>
            </div>

            {/* 1. Item Pekerjaan Selection (Visual Pills) */}
            <div>
              <label className="block text-slate-300 text-[11px] font-bold mb-1.5 uppercase tracking-wider">
                1. Pilih Item / Jenis Pekerjaan
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {categories.map((cat) => (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setItemPekerjaan(cat.id)}
                    className={`p-2 rounded-xl text-left text-[11px] font-bold transition flex items-center space-x-2 cursor-pointer border ${
                      itemPekerjaan === cat.id
                        ? 'bg-blue-600/30 border-blue-400 text-white shadow-md shadow-blue-500/20'
                        : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
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
                  className="w-full mt-2 bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                />
              )}
            </div>

            {/* 2. Waktu Pelaksanaan */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-slate-300 text-[11px] font-bold uppercase tracking-wider">
                  2. Waktu Pelaksanaan
                </label>
                <div className="flex space-x-1">
                  <button
                    type="button"
                    onClick={() => setPresetTime('night')}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 cursor-pointer"
                  >
                    🌙 Window Malam (02:00)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPresetTime('morning')}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 cursor-pointer"
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
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              />
            </div>

            {/* 3. Petugas Pelaksana */}
            <div>
              <label className="block text-slate-300 text-[11px] font-bold mb-1.5 uppercase tracking-wider">
                3. Petugas / Regu Pelaksana
              </label>
              <input
                type="text"
                required
                placeholder="mis. Tim Ukur Kawat LAA 1.9 (Ahmad & Joko)"
                value={technician}
                onChange={(e) => setTechnician(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              />
              {/* Quick team suggestions */}
              <div className="flex flex-wrap gap-1 mt-1.5">
                {quickTeams.map((team, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setTechnician(team)}
                    className="text-[9.5px] px-2 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 cursor-pointer transition"
                  >
                    + {team.split(' ')[0]} {team.split(' ')[1] || ''}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Deskripsi & Temuan Ukur */}
            <div>
              <label className="block text-slate-300 text-[11px] font-bold mb-1.5 uppercase tracking-wider">
                4. Deskripsi Hasil Pekerjaan & Nilai Ukur
              </label>
              <textarea
                required
                rows={3}
                placeholder="Rincian hasil pekerjaan, temuan visual, nilai ukur (sisa ketebalan Cu / suhu kontak / megger isolasi), dan kesimpulan..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 leading-relaxed"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-extrabold transition flex items-center space-x-2 cursor-pointer shadow-lg shadow-emerald-500/30 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Menyimpan ke DB...' : 'Simpan Pekerjaan'}</span>
              </button>
            </div>
          </form>
        )}

        {/* ========================================================
            TIMELINE LIST OF WORKS
            ======================================================== */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
            <span className="font-extrabold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5 text-cyan-400" />
              Riwayat Pekerjaan ({matchingLogs.length} Catatan)
            </span>
          </div>

          {matchingLogs.length === 0 ? (
            <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-8 text-center text-xs text-slate-400 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto opacity-75" />
              <p className="font-bold text-white text-sm">Belum ada riwayat pekerjaan tercatat di lokasi ini.</p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                Gunakan tombol <strong className="text-orange-400">+ Catat Pekerjaan</strong> di atas untuk memasukkan pekerjaan pertama.
              </p>
            </div>
          ) : (
            matchingLogs.map((log) => {
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
                  className="bg-slate-950/90 border border-slate-800/90 hover:border-slate-700 rounded-2xl p-4 shadow-xl transition-all duration-200 space-y-2.5 relative overflow-hidden group"
                >
                  {/* Left accent strip */}
                  <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-gradient-to-b from-cyan-400 via-blue-500 to-emerald-400 group-hover:w-2 transition-all" />

                  {/* Header: Waktu & Status */}
                  <div className="flex items-center justify-between text-xs pl-1.5">
                    <div className="flex items-center space-x-1.5 text-cyan-300 font-mono font-bold text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                      <span>{formattedDate}</span>
                      <span>•</span>
                      <span>{formattedTime} WIB</span>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-950 text-emerald-300 border border-emerald-700/60 flex items-center">
                      <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-400" />
                      {log.status || 'SELESAI'}
                    </span>
                  </div>

                  {/* Item Pekerjaan */}
                  <div className="pl-1.5">
                    <span className="text-[9.5px] uppercase font-bold text-slate-400 tracking-wider block">
                      ITEM PEKERJAAN:
                    </span>
                    <h4 className="text-xs font-black text-white mt-0.5 flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      {formatActionName(log.actionType)}
                    </h4>
                  </div>

                  {/* Deskripsi & Nilai Ukur */}
                  <div className="pl-1.5 bg-slate-900/90 p-3 rounded-xl border border-slate-800/80 text-xs text-slate-200 leading-relaxed font-normal">
                    {log.description}
                  </div>

                  {/* Pelaksana & Lokasi */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1.5 border-t border-slate-800/80 pl-1.5">
                    <span className="flex items-center space-x-1.5">
                      <HardHat className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                      <span>Pelaksana:</span>
                      <strong className="text-white font-semibold">{log.technician}</strong>
                    </span>

                    <span className="font-mono text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
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
      <div className="bg-slate-950 p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <span className="text-[11px] font-medium text-slate-400">
          UPT RESOR LAA 1.9 JATINEGARA
        </span>
        <button
          onClick={onClose}
          className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition cursor-pointer"
        >
          Tutup
        </button>
      </div>

    </div>
  );
}
