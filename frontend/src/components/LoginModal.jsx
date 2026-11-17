import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  User,
  X,
  AlertCircle,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const u = username.trim();
    const p = password.trim();

    if (!u || !p) {
      setError('Harap masukkan User ID dan Password.');
      return;
    }

    setLoading(true);

    // Verifikasi Pengaman Resmi
    if (u === '1.9' && p === '191') {
      setTimeout(() => {
        setLoading(false);
        const adminData = {
          username: '1.9',
          role: 'ADMIN',
          name: 'Administrator UPT Resor LAA 1.9 Jatinegara',
          token: 'laa-admin-' + Date.now(),
        };
        localStorage.setItem('laa_admin_auth', JSON.stringify(adminData));
        onLoginSuccess(adminData);
        onClose();
      }, 300);
    } else {
      setTimeout(() => {
        setLoading(false);
        setError('Kredensial tidak valid. Periksa kembali User ID dan Password Anda.');
      }, 300);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden relative animate-in zoom-in-95 duration-200">
        
        {/* Top Accent Ribbon */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-700 via-indigo-600 via-amber-500 to-emerald-500" />

        {/* Header */}
        <div className="p-5 pb-4 flex items-start justify-between border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Login Administrator LAA 1.9
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Sistem Pengaman Pengelolaan Riwayat Pekerjaan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* User Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>User ID:</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan User ID"
                autoFocus
                className="w-full bg-slate-50 hover:bg-white focus:bg-white text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:outline-none transition shadow-2xs text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-blue-600" />
              <span>Password:</span>
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan Password"
                className="w-full bg-slate-50 hover:bg-white focus:bg-white text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:outline-none transition shadow-2xs text-slate-900 placeholder:text-slate-400 placeholder:font-normal"
              />
            </div>
          </div>

          {/* Information box */}
          <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3 text-[11px] text-blue-800 space-y-1">
            <div className="font-bold flex items-center gap-1">
              <KeyRound className="w-3.5 h-3.5 text-blue-600" />
              <span>Akses Khusus Administrator:</span>
            </div>
            <p className="text-slate-600 text-[10.5px] leading-relaxed">
              Masuk menggunakan kredensial resmi untuk mengelola pencatatan, pengeditan, dan penghapusan data riwayat pekerjaan.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer text-center"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-2/3 py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md active:scale-98 transition cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Memverifikasi...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Masuk Mode Admin</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
