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
  const [workDate, setWorkDate] = useState(new Date().toISOString().slice(0, 16));
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!locationData) return null;

  // Filter logs relevant to this location
  const locationCode = locationData.code || locationData.name || '';
  const matchingLogs = logs.filter((log) => {
    const codeMatch =
      log.targetCode &&
      (log.targetCode.toLowerCase().includes(locationCode.toLowerCase()) ||
        locationCode.toLowerCase().includes(log.targetCode.toLowerCase()));

    // Date filter
    if (filterPeriod === 'ALL') return codeMatch;
    const logDate = new Date(log.timestamp);
    const now = new Date();
    const daysDiff = (now - logDate) / (1000 * 60 * 60 * 24);
    if (filterPeriod === '7D') return codeMatch && daysDiff <= 7;
    if (filterPeriod === '30D') return codeMatch && daysDiff <= 30;
    return codeMatch;
  });

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

      // Reset form
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
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-slate-900 border-l border-slate-700 shadow-2xl flex flex-col animate-in slide-in-from-right duration-250 select-none">
      
      {/* Drawer Header */}
      <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="p-2.5 rounded-xl bg-blue-900/40 border border-blue-700/60 text-blue-400 mt-0.5">
            <Train className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-950 text-blue-300 border border-blue-800 uppercase">
                {locationData.category || 'JALUR / LOKASI LAA'}
              </span>
              <span className="text-[11px] font-mono text-cyan-300 font-bold">
                {locationData.km || '1500 V DC'}
              </span>
            </div>
            <h2 className="text-base font-extrabold text-white mt-1 leading-snug">
              {locationData.title || locationData.name || locationCode}
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Riwayat pemeliharaan, inspeksi, dan perbaikan kawat kontak
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          title="Tutup Panel (Esc)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Action Strip: Add Button & Filter */}
      <div className="bg-slate-950/60 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-1.5">
          <span className="text-slate-400 font-semibold text-[11px]">Filter:</span>
          <button
            onClick={() => setFilterPeriod('ALL')}
            className={`px-2 py-1 rounded text-[11px] font-bold transition ${
              filterPeriod === 'ALL'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setFilterPeriod('30D')}
            className={`px-2 py-1 rounded text-[11px] font-bold transition ${
              filterPeriod === '30D'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            30 Hari
          </button>
          <button
            onClick={() => setFilterPeriod('7D')}
            className={`px-2 py-1 rounded text-[11px] font-bold transition ${
              filterPeriod === '7D'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            7 Hari
          </button>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition flex items-center space-x-1 shadow-md shadow-orange-600/30 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{showAddForm ? 'Batal' : '+ Tambah Pekerjaan'}</span>
        </button>
      </div>

      {/* Main Drawer Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* Add Work Form */}
        {showAddForm && (
          <form
            onSubmit={handleFormSubmit}
            className="bg-slate-950 border border-orange-500/50 rounded-2xl p-4 space-y-3 shadow-xl animate-in fade-in duration-150"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-extrabold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                <Wrench className="w-4 h-4" /> Catat Pekerjaan Baru di Lokasi Ini
              </span>
            </div>

            {/* Waktu Pelaksanaan */}
            <div>
              <label className="block text-slate-300 text-[11px] font-semibold mb-1">
                Waktu Pelaksanaan Pekerjaan
              </label>
              <input
                type="datetime-local"
                required
                value={workDate}
                onChange={(e) => setWorkDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            {/* Item Pekerjaan */}
            <div>
              <label className="block text-slate-300 text-[11px] font-semibold mb-1">
                Item / Jenis Pekerjaan
              </label>
              <select
                value={itemPekerjaan}
                onChange={(e) => setItemPekerjaan(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="PENGUKURAN_KETEBALAN_KAWAT">Pengukuran Ketebalan Kawat Kontak</option>
                <option value="PENYETELAN_DROPPER">Penyetelan Dropper & Ketinggian Kawat</option>
                <option value="THERMOVISION_HOTSPOT">Thermovision Scanning Suhu Sambungan</option>
                <option value="PEMBERSIHAN_ISOLATOR">Pembersihan Isolator FRP & Keramik</option>
                <option value="PEMERIKSAAN_STEADY_ARM">Pemeriksaan Steady Arm & Cantilever</option>
                <option value="KALIBRASI_PENENGANG_BEBAN">Pemeriksaan Kompensator Penegang (Pulley)</option>
                <option value="PERAWATAN_WESEL_LAA">Penyesuaian Persilangan Kawat Wesel</option>
                <option value="PENGGANTIAN_KAWAT_KONTAK">Penggantian Kawat Kontak / Jumper</option>
                <option value="INSPEKSI_RUTIN">Inspeksi Rutin Kondisi Fisik Jalur</option>
                <option value="LAINNYA">Lainnya (Ketik Manual)...</option>
              </select>

              {itemPekerjaan === 'LAINNYA' && (
                <input
                  type="text"
                  required
                  placeholder="Ketikkan jenis pekerjaan..."
                  value={customItem}
                  onChange={(e) => setCustomItem(e.target.value)}
                  className="w-full mt-2 bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              )}
            </div>

            {/* Petugas / Teknisi */}
            <div>
              <label className="block text-slate-300 text-[11px] font-semibold mb-1">
                Petugas / Regu Pelaksana
              </label>
              <input
                type="text"
                required
                placeholder="mis. Regu LAA 1.9 Jatinegara (Ahmad & Tim)"
                value={technician}
                onChange={(e) => setTechnician(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Deskripsi Pekerjaan */}
            <div>
              <label className="block text-slate-300 text-[11px] font-semibold mb-1">
                Deskripsi Hasil Pekerjaan & Temuan Ukur
              </label>
              <textarea
                required
                rows={2}
                placeholder="Rincian hasil pengetesan, nilai ukur (sisa mm / suhu / megger), dan catatan..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-md shadow-emerald-600/30"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Pekerjaan'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Work Timeline Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
            <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
              Daftar Pekerjaan ({matchingLogs.length} Catatan)
            </span>
          </div>

          {matchingLogs.length === 0 ? (
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-6 text-center text-xs text-slate-400">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
              <p className="font-semibold text-slate-300">Belum ada riwayat pekerjaan pada periode ini.</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Klik tombol <strong className="text-orange-400">+ Tambah Pekerjaan</strong> di atas untuk mencatat pekerjaan baru pada lokasi ini.
              </p>
            </div>
          ) : (
            matchingLogs.map((log) => {
              const dateObj = new Date(log.timestamp);
              const formattedDate = dateObj.toLocaleDateString('id-ID', {
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
                  className="bg-slate-950/90 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 shadow-lg transition space-y-2 relative overflow-hidden"
                >
                  {/* Left accent color strip */}
                  <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-blue-500 to-emerald-500" />

                  {/* Top: Waktu & Status */}
                  <div className="flex items-center justify-between text-xs pl-1">
                    <div className="flex items-center space-x-1.5 text-cyan-300 font-mono font-bold text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                      <span>{formattedDate}</span>
                      <span>•</span>
                      <span>{formattedTime} WIB</span>
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/60 flex items-center">
                      <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-400" />
                      {log.status || 'SELESAI'}
                    </span>
                  </div>

                  {/* Item Pekerjaan */}
                  <div className="pl-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-0.5">
                      ITEM PEKERJAAN:
                    </span>
                    <h4 className="text-xs font-extrabold text-white">
                      {formatActionName(log.actionType)}
                    </h4>
                  </div>

                  {/* Deskripsi & Hasil */}
                  <div className="pl-1 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80 text-[11px] text-slate-300 leading-relaxed">
                    {log.description}
                  </div>

                  {/* Petugas / Pelaksana */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80 pl-1">
                    <span className="flex items-center space-x-1 text-slate-400">
                      <User className="w-3 h-3 text-slate-500" />
                      <span>Pelaksana:</span>
                      <strong className="text-slate-300 ml-1">{log.technician}</strong>
                    </span>

                    <span className="font-mono text-[10px] text-slate-500">
                      {log.targetCode}
                    </span>
                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>

      {/* Footer */}
      <div className="bg-slate-950 p-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <span className="text-[11px]">
          UPT RESOR LAA 1.9 JATINEGARA
        </span>
        <button
          onClick={onClose}
          className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer"
        >
          Tutup
        </button>
      </div>

    </div>
  );
}
