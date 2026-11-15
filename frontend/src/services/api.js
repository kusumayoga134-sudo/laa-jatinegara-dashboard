const BASE_URL = '/api';

export const api = {
  // Stats
  async getStats() {
    const res = await fetch(`${BASE_URL}/stats`);
    if (!res.ok) throw new Error('Gagal mengambil statistik');
    return res.json();
  },

  // Stations
  async getStations() {
    const res = await fetch(`${BASE_URL}/stations`);
    if (!res.ok) throw new Error('Gagal mengambil data stasiun');
    return res.json();
  },

  async getStationDetail(idOrCode) {
    const res = await fetch(`${BASE_URL}/stations/${idOrCode}`);
    if (!res.ok) throw new Error('Gagal mengambil detail stasiun');
    return res.json();
  },

  // Switches
  async getSwitches(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/switches${query ? `?${query}` : ''}`);
    if (!res.ok) throw new Error('Gagal mengambil data switch');
    return res.json();
  },

  async toggleSwitch(idOrCode, operator = 'Dispatcher Pusdalopka LAA') {
    const res = await fetch(`${BASE_URL}/switches/${idOrCode}/toggle`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operator }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Gagal mengubah switch');
    return data;
  },

  async toggleInterlock(idOrCode, operator = 'Safety Officer LAA') {
    const res = await fetch(`${BASE_URL}/switches/${idOrCode}/interlock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operator }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Gagal mengubah interlock');
    return data;
  },

  // Assets & Sections
  async getAssets(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/assets${query ? `?${query}` : ''}`);
    if (!res.ok) throw new Error('Gagal mengambil data aset');
    return res.json();
  },

  async getSections() {
    const res = await fetch(`${BASE_URL}/sections`);
    if (!res.ok) throw new Error('Gagal mengambil data seksi');
    return res.json();
  },

  // Telemetry
  async getTelemetry() {
    const res = await fetch(`${BASE_URL}/telemetry`);
    if (!res.ok) throw new Error('Gagal mengambil telemetri');
    return res.json();
  },

  // Logs
  async getLogs(limit = 50) {
    const res = await fetch(`${BASE_URL}/logs?limit=${limit}`);
    if (!res.ok) throw new Error('Gagal mengambil log');
    return res.json();
  },

  async createLog(payload) {
    const res = await fetch(`${BASE_URL}/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Gagal membuat log');
    return data;
  },

  // Alerts
  async getAlerts() {
    const res = await fetch(`${BASE_URL}/alerts`);
    if (!res.ok) throw new Error('Gagal mengambil alarm');
    return res.json();
  },

  async acknowledgeAlert(id) {
    const res = await fetch(`${BASE_URL}/alerts/${id}/ack`, {
      method: 'PATCH',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Gagal konfirmasi alarm');
    return data;
  },
};
