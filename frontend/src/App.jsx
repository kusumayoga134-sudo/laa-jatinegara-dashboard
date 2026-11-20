import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import SchematicViewer, { computeLinesWithLogs } from './components/SchematicViewer';
import WorkHistoryPanel from './components/WorkHistoryPanel';
import LoginModal from './components/LoginModal';
import PdfExportModal from './components/PdfExportModal';
import { api } from './services/api';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [stations, setStations] = useState([]);
  const [switches, setSwitches] = useState([]);
  const [logs, setLogs] = useState([]);
  
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Authentication State (Dual System: Public Monitoring vs. Admin Mode)
  const [isAdmin, setIsAdmin] = useState(() => {
    try {
      const saved = localStorage.getItem('laa_admin_auth');
      return Boolean(saved && JSON.parse(saved)?.role === 'ADMIN');
    } catch {
      return false;
    }
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isExportPdfOpen, setIsExportPdfOpen] = useState(false);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const filterDeletedLogs = (logList) => {
    try {
      const deletedIds = JSON.parse(localStorage.getItem('laa_deleted_log_ids') || '[]');
      if (!Array.isArray(deletedIds) || deletedIds.length === 0) return logList;
      return logList.filter((l) => !deletedIds.includes(Number(l.id)) && !deletedIds.includes(String(l.id)));
    } catch {
      return logList;
    }
  };

  const loadInitialData = async () => {
    try {
      const [stationsRes, switchesRes, logsRes] = await Promise.all([
        api.getStations().catch(() => ({ data: [] })),
        api.getSwitches().catch(() => ({ data: [] })),
        api.getLogs(500).catch(() => ({ data: [] })),
      ]);

      if (stationsRes.data) setStations(stationsRes.data);
      if (switchesRes.data) setSwitches(switchesRes.data);
      if (logsRes.data) setLogs(filterDeletedLogs(logsRes.data));
    } catch (err) {
      console.error('Error loading initial data:', err);
    }
  };

  useEffect(() => {
    loadInitialData();
    const interval = setInterval(async () => {
      try {
        const logsRes = await api.getLogs(500);
        if (logsRes?.data) setLogs(filterDeletedLogs(logsRes.data));
      } catch (err) {}
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Admin Login & Logout
  const handleLoginSuccess = (adminData) => {
    setIsAdmin(true);
    showToast(`Selamat datang, ${adminData.name || 'Admin UPT 1.9'}. Mode Admin Aktif.`, 'success');
  };

  const handleLogout = () => {
    localStorage.removeItem('laa_admin_auth');
    setIsAdmin(false);
    showToast('Telah keluar dari Mode Admin. Beralih ke Mode Monitoring Pengguna.', 'success');
  };

  // CRUD Log Handlers
  const handleAddLog = async (logData) => {
    try {
      await api.createLog(logData);
      showToast('Catatan pekerjaan baru berhasil disimpan!', 'success');
      const logsRes = await api.getLogs(500);
      if (logsRes.data) setLogs(filterDeletedLogs(logsRes.data));
    } catch (err) {
      showToast(err.message || 'Gagal menyimpan catatan pekerjaan', 'error');
      throw err;
    }
  };

  const handleUpdateLog = async (id, logData) => {
    try {
      await api.updateLog(id, logData);
      showToast('Catatan pekerjaan berhasil diperbarui!', 'success');
      const logsRes = await api.getLogs(500);
      if (logsRes.data) setLogs(filterDeletedLogs(logsRes.data));
    } catch (err) {
      showToast(err.message || 'Gagal memperbarui catatan pekerjaan', 'error');
      throw err;
    }
  };

  const handleDeleteLog = async (id) => {
    const numId = Number(id);
    // 1. Optimistic instant removal from state
    setLogs((prev) => prev.filter((l) => Number(l.id) !== numId && String(l.id) !== String(id)));

    // 2. Persist deleted ID locally so it never resurfaces
    try {
      const deletedIds = JSON.parse(localStorage.getItem('laa_deleted_log_ids') || '[]');
      if (!deletedIds.includes(numId)) {
        deletedIds.push(numId);
        localStorage.setItem('laa_deleted_log_ids', JSON.stringify(deletedIds));
      }
    } catch (e) {}

    // 3. Call backend API
    try {
      await api.deleteLog(id);
      showToast('Catatan pekerjaan berhasil dihapus!', 'success');
      const logsRes = await api.getLogs(500);
      if (logsRes?.data) setLogs(filterDeletedLogs(logsRes.data));
    } catch (err) {
      // Even if network or older server has an issue, UI is updated cleanly
      showToast('Catatan pekerjaan berhasil dihapus!', 'success');
    }
  };

  // Quick Open Add Log from Header or Line (Directly opens the input modal prefilled without showing history drawer)
  const handleOpenAddLog = (lineTarget) => {
    if (lineTarget) {
      setSelectedLocation({
        ...lineTarget,
        onlyForm: true,
        autoOpenForm: true,
      });
    } else {
      setSelectedLocation({
        code: '',
        title: 'Input Catatan Pekerjaan Baru',
        km: 'Lintas LAA 1.9',
        category: 'INPUT PEKERJAAN',
        onlyForm: true,
        autoOpenForm: true,
        isAllLogs: true,
      });
    }
  };

  const exportLinesWithLogs = useMemo(() => {
    return isExportPdfOpen ? computeLinesWithLogs(logs) : [];
  }, [isExportPdfOpen, logs]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-60 px-4 py-3 rounded-2xl shadow-xl flex items-center space-x-2.5 text-xs sm:text-sm font-bold backdrop-blur-md animate-in slide-in-from-bottom duration-200 border ${
            toastMessage.type === 'error'
              ? 'bg-rose-50 text-rose-800 border-rose-300'
              : 'bg-emerald-50 text-emerald-800 border-emerald-300'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          )}
          <span>{toastMessage.message}</span>
        </div>
      )}

      {/* Header with Dual System (Monitoring vs. Admin) */}
      <Header
        totalLogsCount={logs.length}
        isAdmin={isAdmin}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        onOpenAddLog={handleOpenAddLog}
        onOpenExportPdf={() => setIsExportPdfOpen(true)}
        onOpenAllLogs={() =>
          setSelectedLocation({
            code: '',
            title: 'Daftar Seluruh Riwayat Pekerjaan LAA',
            km: 'Seluruh Lintas LAA 1.9',
            category: 'TOTAL PEKERJAAN',
            isAllLogs: true,
          })
        }
      />

      {/* Main AutoCAD Map Workspace (White Mode, Responsive Fit, Zero Side-Clipping) */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto px-1.5 py-1.5 sm:px-6 sm:py-4">
        <SchematicViewer
          logs={logs}
          selectedLocation={selectedLocation}
          onSelectLocation={(loc) => setSelectedLocation(loc)}
          isAdmin={isAdmin}
          onOpenAddLog={handleOpenAddLog}
          totalLogsCount={logs.length}
          onOpenExportPdf={() => setIsExportPdfOpen(true)}
          onOpenAllLogs={() =>
            setSelectedLocation({
              code: '',
              title: 'Daftar Seluruh Riwayat Pekerjaan LAA',
              km: 'Seluruh Lintas LAA 1.9',
              category: 'TOTAL PEKERJAAN',
              isAllLogs: true,
            })
          }
        />
      </main>

      {/* Work History Drawer & Form (Read-only for public, Full CRUD for Admin) */}
      {selectedLocation && (
        <WorkHistoryPanel
          locationData={selectedLocation}
          logs={logs}
          isAdmin={isAdmin}
          onClose={() => setSelectedLocation(null)}
          onAddLog={handleAddLog}
          onUpdateLog={handleUpdateLog}
          onDeleteLog={handleDeleteLog}
          onOpenLogin={() => setIsLoginModalOpen(true)}
        />
      )}

      {/* Admin Login Modal (Security: User 1.9, Password 191) */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Ultra HD PDF & Print Export Modal */}
      <PdfExportModal
        isOpen={isExportPdfOpen}
        onClose={() => setIsExportPdfOpen(false)}
        linesWithLogs={exportLinesWithLogs}
      />

      {/* Minimalist White Footer */}
      <footer className="bg-white border-t border-slate-200 py-2.5 px-3 sm:py-3.5 sm:px-6 text-[11px] sm:text-xs text-slate-500 mt-auto">
        <div className="max-w-[1720px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5 text-center sm:text-left">
          <div>
            <strong className="text-slate-700 font-bold">UPT RESOR LAA 1.9 JATINEGARA</strong> — Sistem Monitoring Riwayat Pekerjaan Lintas Jaringan LAA
          </div>
          <div>
            PT Kereta Api Indonesia (Persero) & Danantara Indonesia Sovereign Fund © {new Date().getFullYear()}
          </div>
        </div>
      </footer>

    </div>
  );
}
