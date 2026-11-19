import { ALL_TRACK_LINES } from '../components/SchematicViewer';

/**
 * ALL_MAP_LOCATIONS
 * ==============================================================================
 * Master Data Lokasi Peta & Lintas Jaringan LAA UPT Resor 1.9 Jatinegara
 * 
 * SINKRONISASI OTOMATIS (SINGLE SOURCE OF TRUTH):
 * Data di bawah ini secara otomatis diturunkan dan disinkronkan langsung dari
 * ALL_TRACK_LINES pada `frontend/src/components/SchematicViewer.jsx`.
 * 
 * Anda TIDAK PERLU lagi mengubah file ini secara manual!
 * Setiap kali ada perubahan nama jalur, seksi, KM, warna, penambahan atau
 * penggabungan wesel / DS / FRP / AS / AJ di `SchematicViewer.jsx`, maka
 * ALL_MAP_LOCATIONS di sini akan otomatis mengikuti secara instan (real-time).
 * ==============================================================================
 */
export const ALL_MAP_LOCATIONS = ALL_TRACK_LINES.map((track) => ({
  id: track.id,
  code: track.code || track.id,
  title: track.title || track.code || track.id,
  km: track.km || '',
  category: track.category || 'JALUR',
  color: track.color || '#139a47',
  startDivider: track.startDivider || null,
  endDivider: track.endDivider || null,
}));

/**
 * Helper Utilities untuk pencarian & filtering lokasi cepat
 */
export const getLocationById = (id) =>
  ALL_MAP_LOCATIONS.find((loc) => loc.id === id);

export const getLocationsByCategory = (category) =>
  ALL_MAP_LOCATIONS.filter((loc) => loc.category === category);

export default ALL_MAP_LOCATIONS;
