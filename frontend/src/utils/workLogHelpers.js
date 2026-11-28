export const MONTH_NAMES_ID = [
  'JANUARI',
  'FEBRUARI',
  'MARET',
  'APRIL',
  'MEI',
  'JUNI',
  'JULI',
  'AGUSTUS',
  'SEPTEMBER',
  'OKTOBER',
  'NOVEMBER',
  'DESEMBER',
];

export const YEAR_OPTIONS = Array.from({ length: 13 }, (_, i) => 2018 + i); // 2018..2030

export function getDefaultYear() {
  return new Date().getFullYear();
}

export function getDefaultMonth() {
  return MONTH_NAMES_ID[new Date().getMonth()];
}

export function resolveLogTime(log) {
  const rawTahun = log?.tahun ?? log?.year;
  const rawBulan = log?.bulan ?? log?.month;

  let tahun = rawTahun !== undefined && rawTahun !== null && String(rawTahun).trim() !== ''
    ? String(rawTahun).trim()
    : '';
  let bulan = rawBulan ? String(rawBulan).trim().toUpperCase() : '';

  if ((!tahun || !bulan) && (log?.timestamp || log?.createdAt)) {
    const d = new Date(log.timestamp || log.createdAt);
    if (!isNaN(d.getTime())) {
      if (!tahun) tahun = String(d.getFullYear());
      if (!bulan) bulan = MONTH_NAMES_ID[d.getMonth()];
    }
  }

  if (!tahun) {
    const fallbackText = [log?.description, log?.actionType, log?.rkad].filter(Boolean).join(' ');
    const match = fallbackText.match(/\b(20\d{2})\b/);
    tahun = match ? match[1] : String(getDefaultYear());
  }

  const label = [bulan, tahun].filter(Boolean).join(' ').trim() || String(tahun);

  return {
    tahun,
    bulan,
    label,
  };
}

export function resolveLogKilometer(log, matchedLine = null) {
  const km = log?.kilometer;
  if (km !== undefined && km !== null) {
    const trimmed = String(km).trim();
    if (trimmed && trimmed !== '-') return trimmed;
  }
  if (matchedLine?.km) {
    return String(matchedLine.km).trim();
  }
  return '';
}

export function resolveLogDescription(log) {
  const raw = log?.description;
  if (raw === undefined || raw === null) return '-';
  const trimmed = String(raw).trim();
  return trimmed || '-';
}

export function hasRealDescription(log) {
  const desc = resolveLogDescription(log);
  return Boolean(desc && desc !== '-');
}

/**
 * 9 Kategori Ikon dari Kotak "KETERANGAN :" Model 4 (Single Source of Truth)
 */
export const BEACON_CATEGORIES = [
  {
    key: 'GROUNDING',
    label: 'GROUNDING',
    pattern: /grounding|pentanahan|arde/i,
  },
  {
    key: 'GUY',
    label: 'GUY',
    pattern: /\bguy\b|guy\s*wire|tali\s*guy/i,
  },
  {
    key: 'FEEDING_BRANCH',
    label: 'FEEDING BRANCH',
    pattern: /feeding\s*branch|feeding/i,
  },
  {
    key: 'ISOLATOR',
    label: 'ISOLATOR',
    pattern: /isolator|insulator/i,
  },
  {
    key: 'PULLOFF_STEADY',
    label: 'PULLOFF/STEADY BRACE',
    pattern: /pull[\s-]*off|steady\s*brace|\bsteady\b/i,
  },
  {
    key: 'TROLLEY_WIRE',
    label: 'TROLLEY WIRE',
    pattern: /trolley|troli|kawat\s*kontak|contact\s*wire/i,
  },
  {
    key: 'MESSENGER_WIRE',
    label: 'MESSENGER WIRE',
    pattern: /messenger/i,
  },
  {
    key: 'FEEDER_WIRE',
    label: 'FEEDER WIRE',
    pattern: /feeder/i,
  },
  {
    key: 'OHGW',
    label: 'OHGW',
    pattern: /ohgw|kawat\s*petir|ground\s*wire/i,
  },
];

/**
 * Deteksi unik kategori untuk 1 item pekerjaan (cek actionType & description)
 */
export function detectLogCategories(log) {
  if (!log) return [];
  const desc = log.description && String(log.description).trim() !== '-' ? log.description : '';
  const haystack = `${log.actionType || ''} ${log.title || ''} ${desc}`.trim();
  if (!haystack) return [];

  return BEACON_CATEGORIES.filter((cat) => cat.pattern.test(haystack));
}
