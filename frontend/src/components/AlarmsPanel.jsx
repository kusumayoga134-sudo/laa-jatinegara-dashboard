import React from 'react';
import { AlertTriangle, CheckCircle2, ShieldAlert, BellRing } from 'lucide-react';

export default function AlarmsPanel({ alerts = [], onAcknowledgeAlert }) {
  const unacknowledged = alerts.filter((a) => !a.isAcknowledged);
  const acknowledged = alerts.filter((a) => a.isAcknowledged);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            Panel Alarm & Notifikasi SCADA LAA
          </h2>
          <p className="text-xs text-slate-400">
            Pusat pengawasan peringatan operasional, trip beban, dan anomali sistem kelistrikan
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <span className="px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-600/80 text-amber-300 font-bold font-mono">
            {unacknowledged.length} Alarm Belum Dikonfirmasi
          </span>
        </div>
      </div>

      {/* Unacknowledged Alerts Section */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
          ⚠️ Alarm Aktif Memerlukan Perhatian
        </h3>
        {unacknowledged.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-center text-xs text-slate-400">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            Tidak ada alarm aktif saat ini. Semua seksi LAA beroperasi normal.
          </div>
        ) : (
          unacknowledged.map((alt) => (
            <div
              key={alt.id}
              className="bg-amber-950/30 border border-amber-600/60 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg animate-pulse"
            >
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-xs text-white">{alt.code}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-900/70 text-amber-300 border border-amber-700/60 font-bold">
                      {alt.severity}
                    </span>
                    <span className="text-xs font-semibold text-cyan-300">{alt.location}</span>
                  </div>
                  <p className="text-xs text-slate-200 mt-1">{alt.message}</p>
                </div>
              </div>

              <button
                onClick={() => onAcknowledgeAlert(alt.id)}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition flex items-center justify-center space-x-1.5 shrink-0 cursor-pointer shadow"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Konfirmasi (Acknowledge)</span>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Acknowledged / Resolved History */}
      <div className="space-y-2.5 pt-4 border-t border-slate-800">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Riwayat Alarm Terkonfirmasi
        </h3>
        <div className="space-y-2">
          {acknowledged.map((alt) => (
            <div
              key={alt.id}
              className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs"
            >
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-slate-300">{alt.code}</span>
                    <span className="text-slate-400">• {alt.location}</span>
                  </div>
                  <div className="text-slate-400 text-[11px]">{alt.message}</div>
                </div>
              </div>

              <span className="text-[10px] text-slate-400 font-mono">
                {new Date(alt.timestamp).toLocaleTimeString('id-ID')}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
