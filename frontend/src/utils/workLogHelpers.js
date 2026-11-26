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
