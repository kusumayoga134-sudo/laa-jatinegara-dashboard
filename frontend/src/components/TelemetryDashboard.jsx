import React, { useState, useEffect } from 'react';
import { Zap, Activity, Thermometer, Gauge, ShieldAlert, Cpu, ArrowUpRight } from 'lucide-react';

export default function TelemetryDashboard({ telemetryData = [] }) {
  const [liveData, setLiveData] = useState(telemetryData);

  useEffect(() => {
    setLiveData(telemetryData);
  }, [telemetryData]);

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-800 gap-2">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            Telemetri Gardu Traksi LAA (Traction Substations 1500 V DC)
          </h2>
          <p className="text-xs text-slate-400">
            Pemantauan langsung 4 gardu penyuplai daya Listrik Aliran Atas UPT Resor LAA 1.9 Jatinegara
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <span className="flex items-center text-emerald-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-1.5" />
            FREKUENSI 50.0 Hz NOMINAL
          </span>
        </div>
      </div>

      {/* 4 Substations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {liveData.map((sub, index) => {
          const voltPercent = Math.min(Math.max(((sub.voltageDc - 1450) / 100) * 100, 10), 100);
          const currentPercent = Math.min((sub.currentAmps / 2000) * 100, 100);

          return (
            <div
              key={index}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl hover:border-slate-700 transition relative overflow-hidden"
            >
              {/* Top Accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400" />

              {/* Substation Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400 bg-blue-950/70 border border-blue-700/60 px-2 py-0.5 rounded">
                    {sub.km || 'GARDU TRAKSI'}
                  </span>
                  <h3 className="text-base font-bold text-white mt-1.5">{sub.substation}</h3>
                </div>

                <div className="px-2.5 py-1 rounded-full bg-emerald-950/70 border border-emerald-600/70 text-emerald-300 text-xs font-mono font-bold flex items-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5" />
                  {sub.feederStatus || 'NORMAL'}
                </div>
              </div>

              {/* Primary Gauges: Voltage & Current */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                
                {/* Voltage Box */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span className="flex items-center">
                      <Zap className="w-3.5 h-3.5 text-emerald-400 mr-1" /> Tegangan DC
                    </span>
                    <span className="text-[10px] text-emerald-400">1500 V Nom</span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-emerald-300">
                    {sub.voltageDc} <span className="text-sm font-sans text-slate-400">V</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${voltPercent}%` }}
                    />
                  </div>
                </div>

                {/* Current Load Box */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span className="flex items-center">
                      <Gauge className="w-3.5 h-3.5 text-yellow-400 mr-1" /> Arus Beban
                    </span>
                    <span className="text-[10px] text-yellow-400">2000 A Max</span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-yellow-300">
                    {sub.currentAmps} <span className="text-sm font-sans text-slate-400">A</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-yellow-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${currentPercent}%` }}
                    />
                  </div>
                </div>

              </div>

              {/* Sub Metrics: Power, Temp, Frequency */}
              <div className="grid grid-cols-3 gap-2 py-3 border-t border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block">Daya Aktif:</span>
                  <span className="font-mono font-bold text-cyan-300">{sub.powerKw} kW</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Suhu Ruang Trafo:</span>
                  <span className="font-mono font-bold text-slate-200 flex items-center">
                    <Thermometer className="w-3 h-3 text-red-400 mr-0.5" />
                    {sub.tempSubstation} °C
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Frekuensi Input:</span>
                  <span className="font-mono font-bold text-emerald-400">{sub.frequencyHz} Hz</span>
                </div>
              </div>

              {/* Feeder Breakdown */}
              {sub.feeders && sub.feeders.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-800">
                  <div className="text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wider">
                    Jalur Feeder Keluar
                  </div>
                  <div className="space-y-1.5">
                    {sub.feeders.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-xs bg-slate-950/60 px-3 py-1.5 rounded border border-slate-800"
                      >
                        <span className="text-slate-300 font-medium">{f.name}</span>
                        <div className="flex items-center space-x-3">
                          <span className="font-mono text-slate-400">{f.current} A</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/60">
                            {f.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
}
