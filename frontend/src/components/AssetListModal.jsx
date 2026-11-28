import React, { useState } from 'react';
import { Layers, Search, Filter, ShieldCheck, AlertTriangle, CheckCircle } from 'lucide-react';

export default function AssetListModal({ assets = [], sections = [] }) {
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL', 'AIR_JOINT', 'AIR_SECTION', 'FRP', 'SECTIONS'
  const [searchTerm, setSearchTerm] = useState('');
  const [conditionFilter, setConditionFilter] = useState('ALL');

  const filteredAssets = assets.filter((asset) => {
    const matchType = activeTab === 'ALL' || asset.type === activeTab;
    const matchSearch =
      asset.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.locationKm.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCondition =
      conditionFilter === 'ALL' || asset.condition === conditionFilter;

    return matchType && matchSearch && matchCondition;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-400" />
            Inventaris Aset & Komponen Catenary LAA 1.9
          </h2>
          <p className="text-xs text-slate-400">
            Daftar Air Joint (AJ), Air Section (AS), Isolator FRP, dan Rentangan (NASPAN)
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex overflow-x-auto whitespace-nowrap scrollbar-none gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 max-w-full">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'ALL'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Semua Aset ({assets.length})
          </button>
          <button
            onClick={() => setActiveTab('AIR_JOINT')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'AIR_JOINT'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Air Joint (AJ)
          </button>
          <button
            onClick={() => setActiveTab('AIR_SECTION')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'AIR_SECTION'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Air Section (AS)
          </button>
          <button
            onClick={() => setActiveTab('FRP')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'FRP'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            FRP Isolator
          </button>
          <button
            onClick={() => setActiveTab('SECTIONS')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'SECTIONS'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Rentangan (NASPAN) ({sections.length})
          </button>
        </div>
      </div>

      {activeTab === 'SECTIONS' ? (
        /* Track Sections Table */
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Nama Rentangan</th>
                  <th className="py-3 px-4">Tipe Lintasan</th>
                  <th className="py-3 px-4">Rentang KM</th>
                  <th className="py-3 px-4">Gardu Penyuplai</th>
                  <th className="py-3 px-4">Tegangan</th>
                  <th className="py-3 px-4">Status Elektrifikasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {sections.map((sec) => (
                  <tr key={sec.id} className="hover:bg-slate-800/50">
                    <td className="py-3 px-4 font-bold font-mono text-white">{sec.name}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold">
                        {sec.trackType}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-cyan-300">{sec.startKm} — {sec.endKm}</td>
                    <td className="py-3 px-4 text-slate-400">{sec.substation || 'GTR-JNG'}</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400">{sec.voltage} V</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/60 flex items-center w-max">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5" />
                        {sec.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Assets Table */
        <div className="space-y-3">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari kode atau KM (mis. AJ KM 14+100)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-base sm:text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={conditionFilter}
              onChange={(e) => setConditionFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg text-base sm:text-xs text-slate-300 px-3 py-1.5 focus:outline-none w-full sm:w-auto"
            >
              <option value="ALL">Semua Kondisi</option>
              <option value="BAIK">Kondisi Baik</option>
              <option value="PERHATIAN">Perhatian Perawatan</option>
            </select>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Tipe</th>
                    <th className="py-3 px-4">Kode Aset</th>
                    <th className="py-3 px-4">Lokasi KM</th>
                    <th className="py-3 px-4">Stasiun Terdekat</th>
                    <th className="py-3 px-4">Kondisi</th>
                    <th className="py-3 px-4">Catatan Teknis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredAssets.map((asset) => (
                    <tr key={asset.id} className="hover:bg-slate-800/50">
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            asset.type === 'AIR_JOINT'
                              ? 'bg-sky-950 text-sky-300 border border-sky-700/60'
                              : asset.type === 'AIR_SECTION'
                              ? 'bg-amber-950 text-amber-300 border border-amber-700/60'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                          }`}
                        >
                          {asset.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold font-mono text-white">{asset.code}</td>
                      <td className="py-3 px-4 font-mono text-cyan-300">{asset.locationKm}</td>
                      <td className="py-3 px-4 text-slate-300">{asset.station?.name || '-'}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            asset.condition === 'BAIK'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                              : 'bg-amber-950 text-amber-300 border border-amber-700/60'
                          }`}
                        >
                          {asset.condition}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 max-w-xs truncate" title={asset.notes}>
                        {asset.notes || 'Normal'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
