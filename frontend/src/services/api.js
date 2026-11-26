const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const BASE_URL = `${API_BASE}/api`;

// Initial Active Seed Data for Standalone / Vercel Cloud Deployment
const INITIAL_LOGS = [
  {
    id: 277,
    timestamp: '2026-11-15T05:00:00.000Z',
    tahun: 2026,
    bulan: 'NOVEMBER',
    kilometer: 'KM 12+000',
    targetType: 'LINE',
    targetCode: 'Wesel W13C1 / W13C2 (Crossover Jalur 3 ke Jalur 2, KM 12+000)',
    targetId: 'wesel_w13c_1667',
    actionType: 'PEMERIKSAAN WESEL & KAWAT KONTAK',
    description: '-',
    createdAt: '2026-11-21T02:51:59.292Z',
  },
  {
    id: 278,
    timestamp: '2026-11-15T05:00:00.000Z',
    tahun: 2026,
    bulan: 'NOVEMBER',
    kilometer: 'KM 11+600',
    targetType: 'LINE',
    targetCode: 'Wesel W21A2 ke Jalur 3 W11B1 (KM 11+600)',
    targetId: 'wesel_w21a2_752',
    actionType: 'PENYETELAN CROSSTREK WESEL',
    description: '-',
    createdAt: '2026-11-21T02:52:07.363Z',
  },
  {
    id: 279,
    timestamp: '2026-11-15T05:00:00.000Z',
    tahun: 2026,
    bulan: 'NOVEMBER',
    kilometer: 'KM 11+700',
    targetType: 'LINE',
    targetCode: 'Wesel W31C2 / W51D2 (Jalur 2 ke Jalur 1, KM 11+700)',
    targetId: 'wesel_w31c2_992',
    actionType: 'PEMERIKSAAN ISOLATOR WESEL',
    description: '-',
    createdAt: '2026-11-21T02:52:30.320Z',
  },
];

const getLocalLogs = () => {
  try {
    const saved = localStorage.getItem('laa_cloud_logs');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return INITIAL_LOGS;
};

const saveLocalLogs = (logs) => {
  try {
    localStorage.setItem('laa_cloud_logs', JSON.stringify(logs));
  } catch {}
};

export const api = {
  // Auth Login (Security: User 1.9, Password 191)
  async login(username, password) {
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Backend not reachable - fallback to client-side verification
    }

    if (String(username).trim() === '1.9' && String(password).trim() === '191') {
      const adminData = {
        success: true,
        token: 'laa-token-' + Date.now(),
        user: { role: 'ADMIN', name: 'Admin UPT 1.9' },
      };
      try {
        localStorage.setItem('laa_admin_auth', JSON.stringify(adminData.user));
      } catch {}
      return adminData;
    }
    throw new Error('Username atau password salah');
  },

  // Stats
  async getStats() {
    try {
      const res = await fetch(`${BASE_URL}/stats`);
      if (res.ok) return await res.json();
    } catch {}
    const local = getLocalLogs();
    return {
      success: true,
      data: {
        totalStations: 8,
        totalSwitches: 20,
        totalSections: 15,
        totalLogs: local.length,
      },
    };
  },

  // Stations
  async getStations() {
    try {
      const res = await fetch(`${BASE_URL}/stations`);
      if (res.ok) return await res.json();
    } catch {}
    return {
      success: true,
      data: [
        { id: 1, code: 'PND', name: 'ST. PONDOK JATI', km: 'KM 10+400', status: 'NORMAL' },
        { id: 2, code: 'JNG', name: 'ST. JATINEGARA', km: 'KM 11+750', status: 'NORMAL' },
        { id: 3, code: 'KLD', name: 'ST. KLENDER', km: 'KM 15+027', status: 'NORMAL' },
        { id: 4, code: 'BUA', name: 'ST. BUARAN', km: 'KM 17+209', status: 'NORMAL' },
        { id: 5, code: 'KLDB', name: 'ST. KLENDER BARU', km: 'KM 19+546', status: 'NORMAL' },
        { id: 6, code: 'CUK', name: 'ST. CAKUNG', km: 'KM 20+943', status: 'NORMAL' },
        { id: 7, code: 'KRI', name: 'ST. KRANJI', km: 'KM 23+987', status: 'NORMAL' },
        { id: 8, code: 'BKS', name: 'ST. BEKASI', km: 'KM 26+403', status: 'NORMAL' },
      ],
    };
  },

  async getStationDetail(idOrCode) {
    try {
      const res = await fetch(`${BASE_URL}/stations/${idOrCode}`);
      if (res.ok) return await res.json();
    } catch {}
    return {
      success: true,
      data: {
        code: idOrCode,
        name: `STASIUN ${idOrCode}`,
        status: 'NORMAL',
      },
    };
  },

  // Switches
  async getSwitches(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${BASE_URL}/switches${query ? `?${query}` : ''}`);
      if (res.ok) return await res.json();
    } catch {}
    return { success: true, data: [] };
  },

  async toggleSwitch(idOrCode, operator = 'Dispatcher Pusdalopka LAA') {
    try {
      const res = await fetch(`${BASE_URL}/switches/${idOrCode}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operator }),
      });
      if (res.ok) return await res.json();
    } catch {}
    return { success: true, data: { code: idOrCode, operator } };
  },

  async toggleInterlock(idOrCode, operator = 'Safety Officer LAA') {
    try {
      const res = await fetch(`${BASE_URL}/switches/${idOrCode}/interlock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operator }),
      });
      if (res.ok) return await res.json();
    } catch {}
    return { success: true, data: { code: idOrCode, operator } };
  },

  // Assets & Sections
  async getAssets(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${BASE_URL}/assets${query ? `?${query}` : ''}`);
      if (res.ok) return await res.json();
    } catch {}
    return { success: true, data: [] };
  },

  async getSections() {
    try {
      const res = await fetch(`${BASE_URL}/sections`);
      if (res.ok) return await res.json();
    } catch {}
    return { success: true, data: [] };
  },

  // Telemetry
  async getTelemetry() {
    try {
      const res = await fetch(`${BASE_URL}/telemetry`);
      if (res.ok) return await res.json();
    } catch {}
    return {
      success: true,
      data: [
        { substation: 'Gardu Traksi Jatinegara (GTR-JNG)', voltageDc: 1515.6, currentAmps: 1280.4, status: 'NORMAL' },
        { substation: 'Gardu Traksi Buaran (GTR-BUA)', voltageDc: 1510.2, currentAmps: 940.8, status: 'NORMAL' },
        { substation: 'Gardu Traksi Cakung (GTR-CUK)', voltageDc: 1514.5, currentAmps: 1120.3, status: 'NORMAL' },
        { substation: 'Gardu Traksi Bekasi (GTR-BKS)', voltageDc: 1512.8, currentAmps: 1350.6, status: 'NORMAL' },
      ],
    };
  },

  // Logs (CRUD)
  async getLogs(limit = 500) {
    try {
      const res = await fetch(`${BASE_URL}/logs?limit=${limit}`, {
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const json = await res.json();
        if (Array.isArray(json?.data)) {
          saveLocalLogs(json.data);
          return json;
        }
      }
    } catch {}
    const local = getLocalLogs();
    return { success: true, count: local.length, data: local };
  },

  async createLog(payload) {
    try {
      const res = await fetch(`${BASE_URL}/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        return await res.json();
      }
    } catch {}
    // Client-side local storage persistence
    const local = getLocalLogs();
    const newEntry = {
      id: Date.now(),
      timestamp: payload.timestamp || new Date().toISOString(),
      tahun: payload.tahun ? parseInt(payload.tahun, 10) : new Date().getFullYear(),
      bulan: payload.bulan ? String(payload.bulan).toUpperCase() : '',
      kilometer: payload.kilometer || '',
      targetType: payload.targetType || 'LINE',
      targetCode: payload.targetCode,
      targetId: payload.targetId || payload.lineId || null,
      actionType: payload.actionType,
      description: payload.description && String(payload.description).trim() ? String(payload.description).trim() : '-',
      createdAt: new Date().toISOString(),
    };
    const updated = [newEntry, ...local];
    saveLocalLogs(updated);
    return { success: true, data: newEntry };
  },

  async updateLog(id, payload) {
    try {
      const res = await fetch(`${BASE_URL}/logs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        return await res.json();
      }
    } catch {}
    const local = getLocalLogs().map((item) =>
      String(item.id) === String(id) ? { ...item, ...payload } : item
    );
    saveLocalLogs(local);
    return { success: true };
  },

  async deleteLog(id) {
    try {
      let res = await fetch(`${BASE_URL}/logs/${id}`, {
        method: 'DELETE',
        headers: { Accept: 'application/json' },
      });
      if (!res.ok && (res.status === 404 || res.status === 405)) {
        res = await fetch(`${BASE_URL}/logs/${id}/delete`, {
          method: 'POST',
          headers: { Accept: 'application/json' },
        });
      }
      if (res.ok) {
        const data = await res.json().catch(() => null);
        return data || { success: true };
      }
    } catch {}
    const local = getLocalLogs().filter((item) => String(item.id) !== String(id));
    saveLocalLogs(local);
    return { success: true };
  },

  // Alerts
  async getAlerts() {
    try {
      const res = await fetch(`${BASE_URL}/alerts`);
      if (res.ok) return await res.json();
    } catch {}
    return {
      success: true,
      data: [
        { id: 1, severity: 'INFO', code: 'ALT-101', message: 'Sistem SCADA UPT Resor LAA 1.9 beroperasi normal.' },
      ],
    };
  },

  async acknowledgeAlert(id) {
    try {
      const res = await fetch(`${BASE_URL}/alerts/${id}/ack`, {
        method: 'PATCH',
      });
      if (res.ok) return await res.json();
    } catch {}
    return { success: true, data: { id, isAcknowledged: true } };
  },
};
