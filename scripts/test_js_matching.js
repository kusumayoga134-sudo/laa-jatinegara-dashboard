const fs = require('fs');
const path = require('path');

const ALL_TRACK_LINES = require('./all_track_lines.json');

const findBestLineForLog = (log, allLines = ALL_TRACK_LINES) => {
  if (!log) return null;
  const tc = (log.targetCode || '').trim();
  const tid = (log.targetId || '').trim();
  if (!tc && !tid) return null;

  const cleanTc = tc.toLowerCase().replace(/\s+/g, ' ');
  const alphaTc = cleanTc.replace(/[^a-z0-9]/g, '');

  // 1. Tier 1: Target ID exact match (Highest Priority)
  if (tid) {
    const byId = allLines.find((l) => (l.id || '').toLowerCase() === tid.toLowerCase());
    if (byId) return byId;
  }

  // 2. Tier 2: Exact Title Match (Highest Priority among text matches)
  for (const line of allLines) {
    const lt = (line.title || '').toLowerCase().replace(/\s+/g, ' ');
    if (lt && cleanTc === lt) return line;
  }

  // Tier 2b: Exact Code Match
  for (const line of allLines) {
    const lc = (line.code || '').toLowerCase().replace(/\s+/g, ' ');
    if (lc && cleanTc === lc) return line;
  }

  // Tier 2c: Exact ID Match
  for (const line of allLines) {
    const lid = (line.id || '').toLowerCase();
    if (lid && cleanTc === lid) return line;
  }

  // 3. Tier 3: Exact Alphanumeric Match (immune to punctuation/bracket differences)
  if (alphaTc) {
    for (const line of allLines) {
      const alt = (line.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      if (alt && alphaTc === alt) return line;
    }
    for (const line of allLines) {
      const alc = (line.code || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      if (alc && alphaTc === alc) return line;
    }
    for (const line of allLines) {
      const alid = (line.id || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      if (alid && alphaTc === alid) return line;
    }
  }

  // 4. Tier 4: Fuzzy / Regex Scoring with Strict Disqualification Guards
  let bestLine = null;
  let bestScore = 0;

  const tcIsHi = /\b(hi|hilir)\b/i.test(cleanTc);
  const tcIsHu = /\b(hu|hulu)\b/i.test(cleanTc);
  const tcJalur = cleanTc.match(/\b(?:jalur|jl\.?)\s*(\d+)\b/i);
  const tcKm = cleanTc.match(/KM\s*(\d+\+?\d*)/i);

  for (const line of allLines) {
    const lineId = (line.id || '').toLowerCase();
    const lineCode = (line.code || '').toLowerCase();
    const lineTitle = (line.title || '').toLowerCase();
    const lineCat = (line.category || '').toUpperCase();
    const lineKm = (line.km || '').toLowerCase();
    const combined = `${lineTitle} ${lineCode} ${lineId} ${lineCat} ${lineKm}`.toLowerCase();

    // Station Guard
    if (cleanTc.includes('cakung') || cleanTc.includes('cuk')) {
      if (!combined.includes('cakung') && !lineId.includes('cuk')) continue;
    }
    if (cleanTc.includes('bekasi') || cleanTc.includes('bks')) {
      if (!combined.includes('bekasi') && !lineId.includes('bks') && !lineId.includes('bkt')) continue;
    }
    if (cleanTc.includes('jatinegara') || cleanTc.includes('jng')) {
      if (!combined.includes('jatinegara') && !lineId.includes('jng')) continue;
    }

    // Direction Guard
    const lineIsHi = /\b(hi|hilir)\b/i.test(combined) || lineId.endsWith('_hi');
    const lineIsHu = /\b(hu|hulu)\b/i.test(combined) || lineId.endsWith('_hu');
    if (tcIsHi && lineIsHu && !lineIsHi) continue;
    if (tcIsHu && lineIsHi && !lineIsHu) continue;

    // Track Number Guard
    const lineJalur = combined.match(/\b(?:jalur|jl\.?)\s*(\d+)\b/i);
    if (tcJalur && lineJalur && tcJalur[1] !== lineJalur[1]) continue;

    let score = 0;
    const isSwitch = lineCat.includes('DISCONNECTING SWITCH') || lineCat.includes('(DS)') || lineId.startsWith('ds_');
    const isInsulator = lineCat.includes('SECTION INSULATOR') || lineCat.includes('(FRP)') || lineId.startsWith('frp_');
    const isTurnout = lineCat.includes('WESEL') || lineId.startsWith('wesel_') || lineId.startsWith('titik_wesel_');

    if (isSwitch) {
      const dsM = lineCode.match(/DS\s*(\d+[A-Z]?)/i) || lineId.match(/ds_?(\d+[A-Z]?)/i);
      if (dsM) {
        const num = dsM[1].toLowerCase();
        if (new RegExp(`(^|\\b)ds\\s*-?\\s*${num}\\b`, 'i').test(cleanTc)) {
          score = 350;
          if (cleanTc.includes('(no)') && combined.includes('(no)')) score += 20;
          if (cleanTc.includes('(nc)') && combined.includes('(nc)')) score += 20;
        }
      }
    } else if (isInsulator) {
      const frpM = lineCode.match(/FRP[^\s)]*/i) || lineId.match(/frp[^\s)]*/i);
      if (frpM) {
        const frpCode = frpM[0].toLowerCase();
        if (cleanTc.includes(frpCode)) score = 350;
      }
    } else if (isTurnout) {
      if (/\b(wesel|w\d{2})\b/i.test(cleanTc)) {
        const wM = lineCode.match(/W\d{2}[A-Z0-9]*/i) || lineId.match(/w\d{2}[a-z0-9]*/i);
        if (wM) {
          const wCode = wM[0].toLowerCase();
          if (new RegExp(`(^|\\b|wesel\\s*)${wCode}\\b`, 'i').test(cleanTc)) {
            const tcIsCrossover = cleanTc.includes('crossover') || cleanTc.includes('/');
            const lineIsCrossover = line.isCrossing && !line.isDot;
            if (tcIsCrossover && lineIsCrossover) {
              score = 380;
            } else if (!tcIsCrossover && line.isDot) {
              score = 350;
            } else {
              score = 300;
            }
            if (tcKm && lineKm && lineKm.includes(tcKm[1].toLowerCase())) {
              score += 30;
            }
          }
        }
      }
    } else {
      const lt = lineTitle.replace(/\s+/g, ' ');
      const lc = lineCode.replace(/\s+/g, ' ');
      if (lc && cleanTc.includes(lc)) {
        score = 250;
      } else if (lt && cleanTc.includes(lt)) {
        score = 220;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestLine = line;
    }
  }

  return bestLine;
};

const computeLinesWithLogs = (logs = []) => {
  if (!logs || !Array.isArray(logs) || logs.length === 0) return [];
  const lineLogsMap = new Map();

  logs.forEach((log) => {
    if (!log) return;
    const bestLine = findBestLineForLog(log, ALL_TRACK_LINES);
    if (bestLine) {
      if (!lineLogsMap.has(bestLine.id)) {
        lineLogsMap.set(bestLine.id, { line: bestLine, logs: [] });
      }
      lineLogsMap.get(bestLine.id).logs.push(log);
    }
  });

  return Array.from(lineLogsMap.values());
};

const matchLineLogs = (lineOrCode, logs = []) => {
  if (!lineOrCode || !logs || !Array.isArray(logs) || logs.length === 0) return [];
  const lineObj = typeof lineOrCode === 'object'
    ? lineOrCode
    : ALL_TRACK_LINES.find((l) => l.code === lineOrCode || l.id === lineOrCode || l.title === lineOrCode);
  if (!lineObj) return [];

  return logs.filter((log) => {
    if (!log) return false;
    const best = findBestLineForLog(log, ALL_TRACK_LINES);
    return best && best.id === lineObj.id;
  });
};

// TEST User case:
const userLog = {
  id: 1,
  targetCode: 'Wesel W13C1 / W13C2 (Crossover Jalur 3 ke Jalur 2, KM 12+000)',
  actionType: 'COMPLETED',
  technician: 'F',
  description: 'F'
};

const result = computeLinesWithLogs([userLog]);
console.log('Result length for user log:', result.length);
result.forEach(r => {
  console.log('Line with radar:', r.line.id, ' | ', r.line.code, ' | ', r.line.title);
  console.log('Logs on this line:', r.logs.length);
});

// Check matchLineLogs for all 3 affected lines
const lineCrossover = ALL_TRACK_LINES.find(x => x.id === 'wesel_w13c_1667');
const lineDot1 = ALL_TRACK_LINES.find(x => x.id === 'titik_wesel_w13c1');
const lineDot2 = ALL_TRACK_LINES.find(x => x.id === 'titik_wesel_w13c2');

console.log('matchLineLogs for wesel_w13c_1667:', matchLineLogs(lineCrossover, [userLog]).length);
console.log('matchLineLogs for titik_wesel_w13c1:', matchLineLogs(lineDot1, [userLog]).length);
console.log('matchLineLogs for titik_wesel_w13c2:', matchLineLogs(lineDot2, [userLog]).length);

const dotLog = { id: 2, targetCode: 'Wesel W13C1' };
const resDot = computeLinesWithLogs([dotLog]);
console.log('Dot log result length:', resDot.length);
resDot.forEach(r => console.log('Line with radar:', r.line.id, r.line.code));
