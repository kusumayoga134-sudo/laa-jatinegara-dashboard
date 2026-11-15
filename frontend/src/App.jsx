import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import LegendGuide from './components/LegendGuide';
import SchematicViewer from './components/SchematicViewer';
import SwitchControlPanel from './components/SwitchControlPanel';
import TelemetryDashboard from './components/TelemetryDashboard';
import AssetListModal from './components/AssetListModal';
import MaintenanceLogModal from './components/MaintenanceLogModal';
import AlarmsPanel from './components/AlarmsPanel';
import StationDetailModal from './components/StationDetailModal';
import { api } from './services/api';
import {
  Map,
  Zap,
  Activity,
  Layers,
  Wrench,
  ShieldAlert,
  HelpCircle,
  RefreshCw,
  Train,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('map'); // 'map', 'switches', 'telemetry', 'assets', 'logs', 'alerts', 'legend'
  
  // Data states
  const [stats, setStats] = useState(null);
  const [stations, setStations] = useState([]);
  const [switches, setSwitches] = useState([]);
  const [assets, setAssets] = useState([]);
  const [sections, setSections] = useState([]);
  const [telemetry, setTelemetry] = useState([]);
  const [logs, setLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);

  // UI state
  const [selectedStation, setSelectedStation] = useState(null);
  const [selectedStationModal, setSelectedStationModal] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Initial load
  const loadInitialData = async () => {
    try {
      const [
        statsRes,
        stationsRes,
        switchesRes,
        assetsRes,
        sectionsRes,
        telemetryRes,
        logsRes,
        alertsRes,
      ] = await Promise.all([
        api.getStats().catch(() => ({ data: null })),
        api.getStations().catch(() => ({ data: [] })),
        api.getSwitches().catch(() => ({ data: [] })),
        api.getAssets().catch(() => ({ data: [] })),
        api.getSections().catch(() => ({ data: [] })),
        api.getTelemetry().catch(() => ({ data: [] })),
        api.getLogs().catch(() => ({ data: [] })),
        api.getAlerts().catch(() => ({ data: [] })),
      ]);

      if (statsRes.data) setStats(statsRes.data);
      if (stationsRes.data) setStations(stationsRes.data);
      if (switchesRes.data) setSwitches(switchesRes.data);
      if (assetsRes.data) setAssets(assetsRes.data);
      if (sectionsRes.data) setSections(sectionsRes.data);
      if (telemetryRes.data) setTelemetry(telemetryRes.data);
      if (logsRes.data) setLogs(logsRes.data);
      if (alertsRes.data) setAlerts(alertsRes.data);
    } catch (err) {
      console.error('Error loading initial data:', err);
    }
  };

  // Background polling every 5 seconds for live telemetry
  useEffect(() => {
    loadInitialData();

    const interval = setInterval(async () => {
      try {
        const [telRes, statsRes, switchesRes] = await Promise.all([
          api.getTelemetry().catch(() => null),
          api.getStats().catch(() => null),
          api.getSwitches().catch(() => null),
        ]);

        if (telRes?.data) setTelemetry(telRes.data);
        if (statsRes?.data) setStats(statsRes.data);
        if (switchesRes?.data) setSwitches(switchesRes.data);
      } catch (err) {
        // silent polling error
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Switch Toggle Handler
  const handleToggleSwitch = async (code) => {
    setIsLoading(true);
    try {
      const res = await api.toggleSwitch(code, 'Dispatcher Pusdalopka LAA');
      showToast(res.message || `Sakelar ${code} berhasil diubah`, 'success');
      
      // Update local state
      setSwitches((prev) =>
        prev.map((sw) => (sw.code === code ? res.data : sw))
      );

      // Refresh stats & logs
      const [newStats, newLogs] = await Promise.all([
        api.getStats(),
        api.getLogs(),
      ]);
      if (newStats.data) setStats(newStats.data);
      if (newLogs.data) setLogs(newLogs.data);
    } catch (err) {
      showToast(err.message || 'Gagal mengubah sakelar', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Interlock Toggle Handler
  const handleToggleInterlock = async (code) => {
    try {
      const res = await api.toggleInterlock(code, 'Safety Officer LAA');
      showToast(res.message || `Interlock ${code} berhasil diubah`, 'info');
      setSwitches((prev) =>
        prev.map((sw) => (sw.code === code ? res.data : sw))
      );
    } catch (err) {
      showToast(err.message || 'Gagal mengubah status interlock', 'error');
    }
  };

  // Add Log Handler
  const handleAddLog = async (logData) => {
    const res = await api.createLog(logData);
    showToast('Catatan pemeliharaan berhasil disimpan', 'success');
    const logsRes = await api.getLogs();
    if (logsRes.data) setLogs(logsRes.data);
  };

  // Acknowledge Alert Handler
  const handleAcknowledgeAlert = async (id) => {
    const res = await api.acknowledgeAlert(id);
    showToast('Alarm telah dikonfirmasi', 'info');
    const alertsRes = await api.getAlerts();
    if (alertsRes.data) setAlerts(alertsRes.data);
    const statsRes = await api.getStats();
    if (statsRes.data) setStats(statsRes.data);
  };

  // Station Click on map
  const handleSelectStation = (stationCode) => {
    const found = stations.find((s) => s.code === stationCode);
    if (found) {
      setSelectedStationModal(found);
    }
  };

  const activeAlertsCount = alerts.filter((a) => !a.isAcknowledged).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2 text-xs font-semibold backdrop-blur-md animate-in slide-in-from-bottom duration-200 border ${
            toastMessage.type === 'error'
              ? 'bg-red-950/90 text-red-200 border-red-700'
              : toastMessage.type === 'info'
              ? 'bg-blue-950/90 text-blue-200 border-blue-700'
              : 'bg-emerald-950/90 text-emerald-200 border-emerald-700'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-red-400" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          )}
          <span>{toastMessage.message}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        stats={stats}
        activeAlertsCount={activeAlertsCount}
        onOpenAlerts={() => setActiveTab('alerts')}
      />

      {/* Station Quick Navigation Strip */}
      <div className="bg-slate-900/50 border-b border-slate-800/80 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center space-x-2 overflow-x-auto text-xs py-1">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] shrink-0 flex items-center mr-1">
            <Train className="w-3.5 h-3.5 mr-1 text-blue-400" /> Lintasan Stasiun:
          </span>
          {stations.map((st) => (
            <button
              key={st.id}
              onClick={() => setSelectedStationModal(st)}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 whitespace-nowrap transition cursor-pointer flex items-center space-x-1.5"
            >
              <span className="font-bold">{st.name}</span>
              <span className="text-[10px] font-mono text-cyan-400">({st.km})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="bg-slate-900 border-b border-slate-800 sticky top-[73px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto py-2">
            
            <button
              onClick={() => setActiveTab('map')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-2 shrink-0 cursor-pointer ${
                activeTab === 'map'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Map className="w-4 h-4" />
              <span>Peta Skematik LAA</span>
            </button>

            <button
              onClick={() => setActiveTab('switches')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-2 shrink-0 cursor-pointer ${
                activeTab === 'switches'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>Matriks Sakelar (DS 1 - 20)</span>
              <span className="px-1.5 py-0.2 rounded bg-slate-950/80 text-[10px] text-cyan-300">
                {switches.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('telemetry')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-2 shrink-0 cursor-pointer ${
                activeTab === 'telemetry'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Gardu Traksi</span>
            </button>

            <button
              onClick={() => setActiveTab('assets')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-2 shrink-0 cursor-pointer ${
                activeTab === 'assets'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Aset (AJ/AS/FRP)</span>
              <span className="px-1.5 py-0.2 rounded bg-slate-950/80 text-[10px] text-slate-300">
                {assets.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-2 shrink-0 cursor-pointer ${
                activeTab === 'logs'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>Log Perawatan</span>
            </button>

            <button
              onClick={() => setActiveTab('alerts')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-2 shrink-0 cursor-pointer ${
                activeTab === 'alerts'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Alarm SCADA</span>
              {activeAlertsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 font-black text-[10px] animate-pulse">
                  {activeAlertsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('legend')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-2 shrink-0 cursor-pointer ${
                activeTab === 'legend'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Keterangan & Simbol</span>
            </button>

          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {activeTab === 'map' && (
          <div className="space-y-6">
            <SchematicViewer
              switches={switches}
              stations={stations}
              assets={assets}
              onToggleSwitch={handleToggleSwitch}
              onSelectStation={handleSelectStation}
            />
            <LegendGuide />
          </div>
        )}

        {activeTab === 'switches' && (
          <SwitchControlPanel
            switches={switches}
            onToggleSwitch={handleToggleSwitch}
            onToggleInterlock={handleToggleInterlock}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'telemetry' && (
          <TelemetryDashboard telemetryData={telemetry} />
        )}

        {activeTab === 'assets' && (
          <AssetListModal assets={assets} sections={sections} />
        )}

        {activeTab === 'logs' && (
          <MaintenanceLogModal
            logs={logs}
            onAddLog={handleAddLog}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'alerts' && (
          <AlarmsPanel
            alerts={alerts}
            onAcknowledgeAlert={handleAcknowledgeAlert}
          />
        )}

        {activeTab === 'legend' && (
          <LegendGuide />
        )}

      </main>

      {/* Station Modal */}
      {selectedStationModal && (
        <StationDetailModal
          station={selectedStationModal}
          onClose={() => setSelectedStationModal(null)}
          onSelectSwitch={(sw) => {
            setActiveTab('switches');
          }}
        />
      )}

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-4 px-6 text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-400">UPT RESOR LAA 1.9 JATINEGARA</span>
            <span>•</span>
            <span>Sistem Monitoring Listrik Aliran Atas 1500 V DC</span>
          </div>
          <div className="text-[11px] text-slate-500">
            KAI (Kereta Api Indonesia) & Danantara Indonesia Sovereign Fund © {new Date().getFullYear()}
          </div>
        </div>
      </footer>

    </div>
  );
}
