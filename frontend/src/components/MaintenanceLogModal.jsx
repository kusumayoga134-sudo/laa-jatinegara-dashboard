import React, { useState } from 'react';
import { Wrench, Plus, CheckCircle, Clock, User, FileText, Send } from 'lucide-react';

export default function MaintenanceLogModal({ logs = [], onAddLog, isLoading }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    targetType: 'SWITCH',
    targetCode: 'DS 4',
    actionType: 'ROUTINE_INSPECTION',
    technician: '',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.technician || !formData.description) return;

    setIsSubmitting(true);
    try {
      await onAddLog(formData);
      setFormData({
        targetType: 'SWITCH',
        targetCode: 'DS 4',
        actionType: 'ROUTINE_INSPECTION',
        technician: '',
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
            Log Perawatan & Pengoperasian SCADA LAA
          </h2>
          <p className="text-xs text-slate-400">
            Catatan histori pengoperasian sakelar pemutus beban dan pemeliharaan prasarana kelistrikan
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-md shadow-orange-600/30"
        >
          <Plus className="w-4 h-4" />
          <span>{showForm ? 'Tutup Formulir' : 'Catat Tiket Perawatan'}</span>
        </button>
      </div>

      {/* Add Log Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl space-y-3 animate-in fade-in duration-200"
        >
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider pb-2 border-b border-slate-800">
            Formulir Catatan Pemeliharaan Baru
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Target Komponen</label>
              <select
                value={formData.targetType}
                onChange={(e) => setFormData({ ...formData, targetType: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="SWITCH">Sakelar Pemutus (DS)</option>
                <option value="STATION">Stasiun</option>
                <option value="ASSET">Aset (AJ / AS / FRP)</option>
                <option value="SECTION">Seksi Catenary</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Kode Target (mis. DS 4)</label>
              <input
                type="text"
                required
                value={formData.targetCode}
                onChange={(e) => setFormData({ ...formData, targetCode: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Jenis Tindakan</label>
              <select
                value={formData.actionType}
                onChange={(e) => setFormData({ ...formData, actionType: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="ROUTINE_INSPECTION">Inspeksi Rutin</option>
                <option value="MANUAL_TOGGLE">Pengoperasian Sakelar</option>
                <option value="THERMOVISION">Thermovision Panas</option>
                <option value="CALIBRATION">Kalibrasi Penegang</option>
                <option value="REPAIR">Perbaikan / Penggantian</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="sm:col-span-1">
              <label className="block text-slate-400 mb-1">Nama Petugas / Teknisi</label>
              <input
                type="text"
                required
                placeholder="mis. Ahmad Subarkah (LAA 1.9)"
                value={formData.technician}
                onChange={(e) => setFormData({ ...formData, technician: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-400 mb-1">Deskripsi Hasil Pekerjaan</label>
              <input
                type="text"
                required
                placeholder="Rincian hasil inspeksi, nilai resistansi, atau status operasional..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-md shadow-emerald-600/30"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Catatan'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Waktu</th>
                <th className="py-3 px-4">Komponen</th>
                <th className="py-3 px-4">Tindakan</th>
                <th className="py-3 px-4">Petugas / Pelaksana</th>
                <th className="py-3 px-4">Deskripsi</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/50">
                  <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString('id-ID', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="py-3 px-4 font-bold font-mono text-cyan-300 whitespace-nowrap">
                    {log.targetCode}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold">
                      {log.actionType}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300 font-medium whitespace-nowrap">
                    {log.technician}
                  </td>
                  <td className="py-3 px-4 text-slate-300 max-w-md">{log.description}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/60 flex items-center w-max">
                      <CheckCircle className="w-3 h-3 mr-1 text-emerald-400" />
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
