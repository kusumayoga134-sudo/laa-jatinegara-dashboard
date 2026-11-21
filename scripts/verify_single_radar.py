import json
import re

with open('scripts/all_track_lines.json', 'r', encoding='utf-8') as f:
    ALL_TRACK_LINES = json.load(f)

def find_best_line_for_log(log, all_lines):
    if not log:
        return None
    tc = (log.get('targetCode') or '').strip()
    tid = (log.get('targetId') or '').strip()
    if not tc and not tid:
        return None

    clean_tc = ' '.join(tc.lower().split())
    alpha_tc = re.sub(r'[^a-z0-9]', '', clean_tc)

    # 1. Tier 1: Target ID exact match
    if tid:
        for line in all_lines:
            if line.get('id', '').lower() == tid.lower():
                return line

    # 2. Tier 2: Exact Title Match (Highest Priority)
    for line in all_lines:
        lt = ' '.join((line.get('title') or '').lower().split())
        if lt and clean_tc == lt:
            return line

    # Tier 2b: Exact Code Match
    for line in all_lines:
        lc = ' '.join((line.get('code') or '').lower().split())
        if lc and clean_tc == lc:
            return line

    # Tier 2c: Exact ID Match
    for line in all_lines:
        lid = (line.get('id') or '').lower()
        if lid and clean_tc == lid:
            return line

    # 3. Tier 3: Exact Alphanumeric Match
    if alpha_tc:
        for line in all_lines:
            alt = re.sub(r'[^a-z0-9]', '', (line.get('title') or '').lower())
            alc = re.sub(r'[^a-z0-9]', '', (line.get('code') or '').lower())
            alid = re.sub(r'[^a-z0-9]', '', (line.get('id') or '').lower())
            if alpha_tc == alt or alpha_tc == alc or alpha_tc == alid:
                return line

    # 4. Tier 4: Fuzzy / Regex Scoring with Strict Disqualification Guards
    best_line = None
    best_score = 0

    tc_is_hi = bool(re.search(r'\b(hi|hilir)\b', clean_tc))
    tc_is_hu = bool(re.search(r'\b(hu|hulu)\b', clean_tc))
    tc_jalur = re.search(r'\b(?:jalur|jl\.?)\s*(\d+)\b', clean_tc)
    tc_km = re.search(r'KM\s*(\d+\+?\d*)', clean_tc, re.I)

    for line in all_lines:
        line_id = (line.get('id') or '').lower()
        line_code = (line.get('code') or '').lower()
        line_title = (line.get('title') or '').lower()
        line_cat = (line.get('category') or '').upper()
        line_km = (line.get('km') or '').lower()
        combined = f"{line_title} {line_code} {line_id} {line_cat} {line_km}".lower()

        # Station Guard
        if 'cakung' in clean_tc or 'cuk' in clean_tc:
            if 'cakung' not in combined and 'cuk' not in line_id:
                continue
        if 'bekasi' in clean_tc or 'bks' in clean_tc:
            if 'bekasi' not in combined and 'bks' not in line_id and 'bkt' not in line_id:
                continue
        if 'jatinegara' in clean_tc or 'jng' in clean_tc:
            if 'jatinegara' not in combined and 'jng' not in line_id:
                continue

        # Direction Guard
        line_is_hi = bool(re.search(r'\b(hi|hilir)\b', combined) or line_id.endswith('_hi'))
        line_is_hu = bool(re.search(r'\b(hu|hulu)\b', combined) or line_id.endswith('_hu'))
        if tc_is_hi and line_is_hu and not line_is_hi:
            continue
        if tc_is_hu and line_is_hi and not line_is_hu:
            continue

        # Track Number Guard
        line_jalur = re.search(r'\b(?:jalur|jl\.?)\s*(\d+)\b', combined)
        if tc_jalur and line_jalur and tc_jalur.group(1) != line_jalur.group(1):
            continue

        score = 0

        is_switch = 'DISCONNECTING SWITCH' in line_cat or '(DS)' in line_cat or line_id.startswith('ds_')
        is_insulator = 'SECTION INSULATOR' in line_cat or '(FRP)' in line_cat or line_id.startswith('frp_')
        is_turnout = 'WESEL' in line_cat or line_id.startswith('wesel_') or line_id.startswith('titik_wesel_')

        if is_switch:
            ds_m = re.search(r'DS\s*(\d+[A-Z]?)', line_code, re.I) or re.search(r'ds_?(\d+[A-Z]?)', line_id, re.I)
            if ds_m:
                num = ds_m.group(1).lower()
                if re.search(rf'(^|\b)ds\s*-?\s*{num}\b', clean_tc):
                    score = 350
                    if '(no)' in clean_tc and '(no)' in combined: score += 20
                    if '(nc)' in clean_tc and '(nc)' in combined: score += 20

        elif is_insulator:
            frp_m = re.search(r'FRP[^\s)]*', line_code, re.I) or re.search(r'frp[^\s)]*', line_id, re.I)
            if frp_m:
                frp_code = frp_m.group(0).lower()
                if frp_code in clean_tc:
                    score = 350

        elif is_turnout:
            if re.search(r'\b(wesel|w\d{2})\b', clean_tc):
                w_m = re.search(r'W\d{2}[A-Z0-9]*', line_code, re.I) or re.search(r'w\d{2}[a-z0-9]*', line_id, re.I)
                if w_m:
                    w_code = w_m.group(0).lower()
                    if re.search(rf'(^|\b|wesel\s*){w_code}\b', clean_tc):
                        # Crossover line vs point dot scoring
                        tc_is_crossover = 'crossover' in clean_tc or '/' in clean_tc
                        line_is_crossover = line.get('isCrossing') and not line.get('isDot')
                        if tc_is_crossover and line_is_crossover:
                            score = 380
                        elif not tc_is_crossover and line.get('isDot'):
                            score = 350
                        else:
                            score = 300
                        if tc_km and line_km and tc_km.group(1) in line_km:
                            score += 30

        else:
            # Regular track
            lt = ' '.join(line_title.split())
            lc = ' '.join(line_code.split())
            if lc and lc in clean_tc:
                score = 250
            elif lt and lt in clean_tc:
                score = 220

        if score > best_score:
            best_score = score
            best_line = line

    return best_line

def compute_lines_with_logs(logs, all_lines):
    line_logs_map = {}
    for log in logs:
        best = find_best_line_for_log(log, all_lines)
        if best:
            lid = best['id']
            if lid not in line_logs_map:
                line_logs_map[lid] = {'line': best, 'logs': []}
            line_logs_map[lid]['logs'].append(log)

    return list(line_logs_map.values())

# TEST 1: User's reported case
user_log = {
    'targetCode': 'Wesel W13C1 / W13C2 (Crossover Jalur 3 ke Jalur 2, KM 12+000)',
    'description': 'Pemeriksaan rutin'
}
res = compute_lines_with_logs([user_log], ALL_TRACK_LINES)
print(f"=== TEST 1: User Reported Case ===")
print(f"Total lines with radar: {len(res)}")
for r in res:
    print(f"  Radar Location: {r['line']['id']} ({r['line']['code']}) - {r['line']['title']}")
    print(f"  Logs count: {len(r['logs'])}")

# TEST 2: Every single line in ALL_TRACK_LINES tested with 1 input
print(f"\n=== TEST 2: Testing all 261 lines individually ===")
fail_count = 0
for idx, line in enumerate(ALL_TRACK_LINES):
    test_l = {'targetCode': line.get('title') or line.get('code')}
    res_l = compute_lines_with_logs([test_l], ALL_TRACK_LINES)
    if len(res_l) != 1:
        print(f"FAIL for line {line['id']}: produced {len(res_l)} radars!")
        fail_count += 1
    elif res_l[0]['line']['id'] != line['id']:
        print(f"MISMATCH for line {line['id']}: mapped to {res_l[0]['line']['id']}")
        fail_count += 1

if fail_count == 0:
    print("PERFECT! 261/261 lines produced EXACTLY 1 radar at their exact own location!")
else:
    print(f"Found {fail_count} failures.")
