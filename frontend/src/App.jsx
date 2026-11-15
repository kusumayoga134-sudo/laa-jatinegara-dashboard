import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SchematicViewer from './components/SchematicViewer';
import WorkHistoryPanel from './components/WorkHistoryPanel';
import { api } from './services/api';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  const [stations, setStations] = useState([]);
  const [switches, setSwitches] = useState([]);
  const [logs, setLogs] = useState([]);
  
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

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

  const handleAddLog = async (logData) => {
    await api.createLog(logData);
    showToast('Catatan pekerjaan berhasil disimpan ke database', 'success');
    const logsRes = await api.getLogs(200);
    if (logsRes.data) setLogs(logsRes.data);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Toast Notification (White Mode) */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center space-x-2.5 text-xs sm:text-sm font-bold backdrop-blur-md animate-in slide-in-from-bottom duration-200 border ${
            toastMessage.type === 'error'
              ? 'bg-red-50 text-red-800 border-red-300'
              : 'bg-emerald-50 text-emerald-800 border-emerald-300'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage.message}</span>
        </div>
      )}

      {/* Minimalist White Header with Direct "+ Input Pekerjaan" Button */}
      <Header
        totalLogsCount={logs.length}
        onOpenAddWork={() =>
          setSelectedLocation({
            code: '',
            title: 'Catat Pekerjaan Baru',
            km: 'Seluruh Lintas LAA 1.9',
            category: 'INPUT PEKERJAAN',
          })
        }
        onOpenAllLogs={() =>
          setSelectedLocation({
            code: '',
            title: 'Rekapitulasi Seluruh Riwayat Pekerjaan LAA',
            km: 'Lintas Kramat / Manggarai — Jatinegara — Buaran — Cakung — Bekasi',
            category: 'REKAPITULASI TOTAL PEKERJAAN',
            isAllLogs: true,
          })
        }
      />

      {/* Main AutoCAD Map Workspace (White Mode) */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto px-4 sm:px-6 py-4">
        <SchematicViewer
          logs={logs}
          selectedLocation={selectedLocation}
          onSelectLocation={(loc) => setSelectedLocation(loc)}
        />
      </main>

      {/* Work History Drawer & Form */}
      {selectedLocation && (
        <WorkHistoryPanel
          locationData={selectedLocation}
          logs={logs}
          onClose={() => setSelectedLocation(null)}
          onAddLog={handleAddLog}
        />
      )}

      {/* Minimalist White Footer */}
      <footer className="bg-white border-t border-slate-200 py-3.5 px-6 text-xs text-slate-500 mt-auto">
        <div className="max-w-[1700px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong className="text-slate-700 font-bold">UPT RESOR LAA 1.9 JATINEGARA</strong> — Sistem Monitoring Pemeliharaan Kawat Kontak Catenary 1500 V DC
          </div>
          <div>
            PT Kereta Api Indonesia (Persero) & Danantara Indonesia Sovereign Fund © {new Date().getFullYear()}
          </div>
        </div>
      </footer>

    </div>
  );
}
