import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SchematicViewer from './components/SchematicViewer';
import WorkHistoryPanel from './components/WorkHistoryPanel';
import { api } from './services/api';
import {
  Train,
  Wrench,
  Search,
  Layers,
  MapPin,
  Clock,
  ListFilter,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function App() {
  // Data states
  const [stations, setStations] = useState([]);
  const [switches, setSwitches] = useState([]);
  const [logs, setLogs] = useState([]);
  
  // Interactive selection state
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Initial load
  const loadInitialData = async () => {
    try {
      const [stationsRes, switchesRes, logsRes] = await Promise.all([
        api.getStations().catch(() => ({ data: [] })),
        api.getSwitches().catch(() => ({ data: [] })),
        api.getLogs(200).catch(() => ({ data: [] })),
      ]);

      if (stationsRes.data) setStations(stationsRes.data);
      if (switchesRes.data) setSwitches(switchesRes.data);
      if (logsRes.data) setLogs(logsRes.data);
    } catch (err) {
      console.error('Error loading initial data:', err);
    }
  };

  useEffect(() => {
    loadInitialData();
    const interval = setInterval(async () => {
      try {
        const logsRes = await api.getLogs(200);
        if (logsRes?.data) setLogs(logsRes.data);
      } catch (err) {}
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Add work log handler
  const handleAddLog = async (logData) => {
    await api.createLog(logData);
    showToast('Catatan pekerjaan berhasil disimpan ke database', 'success');
    const logsRes = await api.getLogs(200);
    if (logsRes.data) setLogs(logsRes.data);
  };

  // Switch Toggle from popover
  const handleToggleSwitch = async (code) => {
    try {
      const res = await api.toggleSwitch(code, 'Dispatcher Pusdalopka LAA');
      showToast(res.message || `Sakelar ${code} berhasil diubah`, 'success');
      setSwitches((prev) =>
        prev.map((sw) => (sw.code === code ? res.data : sw))
      );
      const logsRes = await api.getLogs(200);
      if (logsRes.data) setLogs(logsRes.data);
    } catch (err) {
      showToast(err.message || 'Gagal mengubah sakelar', 'error');
    }
  };

  // Interlock Toggle
  const handleToggleInterlock = async (code) => {
    try {
      const res = await api.toggleInterlock(code, 'Safety Officer LAA');
      showToast(res.message || `Interlock ${code} diubah`, 'info');
      setSwitches((prev) =>
        prev.map((sw) => (sw.code === code ? res.data : sw))
      );
    } catch (err) {
      showToast(err.message || 'Gagal mengubah status interlock', 'error');
    }
  };

  // Quick select location list
  const quickLocations = [
    { code: 'NASPAN 1 JNG-KLD (HU)', title: 'NASPAN 1 JNG-KLD (HU) (KM 11+750 - KM 12+844)', km: 'KM 11+750', category: 'SEKSI LAA HILIR' },
    { code: 'NASPAN 1 JNG-KLD (HI)', title: 'NASPAN 1 JNG-KLD (HI) (KM 11+750 - KM 12+844)', km: 'KM 11+750', category: 'SEKSI LAA HULU' },
    { code: 'NASPAN 2 JNG-KLD', title: 'NASPAN 2 JNG-KLD (KM 12+844 - KM 13+800)', km: 'KM 12+844', category: 'SEKSI LAA' },
    { code: 'NASPAN 3 JNG-KLD', title: 'NASPAN 3 & 4 JNG-KLD (Petak Klender)', km: 'KM 15+027', category: 'SEKSI LAA' },
    { code: 'NASPAN 5 KLD-BUA', title: 'NASPAN 5 & 6 KLD-BUA (Petak Buaran)', km: 'KM 17+500', category: 'SEKSI LAA' },
    { code: 'NASPAN 7 BUA-KLDB', title: 'NASPAN 7 & 8 BUA-KLDB (Petak Klender Baru)', km: 'KM 19+546', category: 'SEKSI LAA' },
    { code: 'NASPAN 9 EMPL CUK', title: 'NASPAN 9 EMPL CUK (Emplasemen Cakung)', km: 'KM 20+943', category: 'EMPLASEMEN' },
    { code: 'NASPAN 10 CUK-KRI', title: 'NASPAN 10 & 11 CUK-KRI (Cakung - Kranji)', km: 'KM 22+500', category: 'SEKSI LAA' },
    { code: 'NASPAN 12 BKS-KRI', title: 'NASPAN 12 & 13 BKS-KRI (Kranji - Bekasi)', km: 'KM 25+000', category: 'SEKSI LAA' },
    { code: 'ST. JATINEGARA', title: 'ST. JATINEGARA (Jalur 1 - 8 & Peron)', km: 'KM 11+750', category: 'STASIUN SENTRAL' },
    { code: 'ST. BEKASI', title: 'ST. BEKASI (Jalur 1 - 8 & Stabling)', km: 'KM 26+403', category: 'STASIUN TERMINUS' },
    { code: 'ST. PONDOK JATI', title: 'ST. PONDOK JATI & Percabangan Kramat', km: 'KM 10+400', category: 'STASIUN' },
    { code: 'ST. KLENDER', title: 'ST. KLENDER', km: 'KM 15+027', category: 'STASIUN' },
    { code: 'ST. BUARAN', title: 'ST. BUARAN', km: 'KM 17+500', category: 'STASIUN' },
    { code: 'ST. KLENDER BARU', title: 'ST. KLENDER BARU', km: 'KM 19+546', category: 'STASIUN' },
    { code: 'ST. CAKUNG', title: 'ST. CAKUNG', km: 'KM 20+943', category: 'STASIUN' },
    { code: 'ST. KRANJI', title: 'ST. KRANJI', km: 'KM 23+987', category: 'STASIUN' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 text-xs font-bold backdrop-blur-md animate-in slide-in-from-bottom duration-200 border ${
            toastMessage.type === 'error'
              ? 'bg-red-950/90 text-red-200 border-red-700 shadow-red-950/50'
              : 'bg-emerald-950/90 text-emerald-200 border-emerald-700 shadow-emerald-950/50'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage.message}</span>
        </div>
      )}

      {/* Minimalist Clean Header */}
      <Header totalLogsCount={logs.length} />

      {/* Minimalist Bar: Quick Location Selector & Instructions */}
      <section className="bg-slate-900/70 border-b border-slate-800 px-4 py-2.5">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          
          {/* Quick Select Dropdown */}
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center">
              <Train className="w-3.5 h-3.5 mr-1 text-blue-400" /> Pilih Jalur / Lokasi:
            </span>
            <select
              onChange={(e) => {
                const found = quickLocations.find((l) => l.code === e.target.value);
                if (found) setSelectedLocation(found);
              }}
              value={selectedLocation ? selectedLocation.code : ''}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-cyan-300 font-semibold focus:outline-none focus:border-blue-500 w-full sm:w-80 cursor-pointer"
            >
              <option value="">-- Pilih dari Daftar / Klik Pada Peta --</option>
              {quickLocations.map((loc) => (
                <option key={loc.code} value={loc.code}>
                  {loc.title} ({loc.km})
                </option>
              ))}
            </select>
          </div>

          {/* All Works Quick Button */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() =>
                setSelectedLocation({
                  code: '',
                  title: 'Semua Lintas UPT Resor LAA 1.9',
                  km: 'KM 10+000 - KM 26+800',
                  category: 'SELURUH PETAK JALUR LAA',
                })
              }
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700/80 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-sm"
            >
              <Wrench className="w-3.5 h-3.5 text-orange-400" />
              <span>Lihat Semua Pekerjaan ({logs.length})</span>
            </button>
          </div>

        </div>
      </section>

      {/* Main AutoCAD Map Workspace */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-4">
        <SchematicViewer
          switches={switches}
          stations={stations}
          logs={logs}
          onSelectLocation={(loc) => setSelectedLocation(loc)}
          onToggleSwitch={handleToggleSwitch}
          onToggleInterlock={handleToggleInterlock}
        />
      </main>

      {/* Work History Drawer (Opens when line/station/switch is clicked) */}
      {selectedLocation && (
        <WorkHistoryPanel
          locationData={selectedLocation}
          logs={logs}
          onClose={() => setSelectedLocation(null)}
          onAddLog={handleAddLog}
        />
      )}

      {/* Minimalist Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-3 px-6 text-[11px] text-slate-500 mt-auto">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong className="text-slate-400">UPT RESOR LAA 1.9 JATINEGARA</strong> — Sistem Monitoring Pemeliharaan Kawat Kontak & Sakelar LAA 1500 V DC
          </div>
          <div>
            PT Kereta Api Indonesia (Persero) & Danantara Indonesia Sovereign Fund © {new Date().getFullYear()}
          </div>
        </div>
      </footer>

    </div>
  );
}
