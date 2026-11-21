import json
import re

with open('scripts/all_track_lines.json', 'r', encoding='utf-8') as f:
    lines = json.load(f)

def score_match(line, log):
    if not line or not log:
        return 0
    tc = (log.get('targetCode') or '').strip()
    tid = (log.get('targetId') or '').strip()
    if not tc and not tid:
        return 0

    line_id = (line.get('id') or '').strip().lower()
    line_code = (line.get('code') or '').strip().lower()
    line_title = (line.get('title') or '').strip().lower()
    line_cat = (line.get('category') or '').upper()
    line_km = (line.get('km') or '').lower()
    combined_line = f"{line_title} {line_code} {line_id} {line_km}".lower()

    norm_tc = tc.lower()
    clean_tc = ' '.join(norm_tc.split())
    clean_line_title = ' '.join(line_title.split())
    clean_line_code = ' '.join(line_code.split())
    clean_line_id = ' '.join(line_id.split())

    # 1. Target ID exact match (Highest Priority)
    if tid and tid.lower() == line_id:
        return 1000

    # Station Guard: Disqualify cross-station mismatches
    if 'cakung' in clean_tc or 'cuk' in clean_tc:
        if 'cakung' not in combined_line and 'cuk' not in line_id:
            return 0
    if 'bekasi' in clean_tc or 'bks' in clean_tc:
        if 'bekasi' not in combined_line and 'bks' not in line_id and 'bkt' not in line_id:
            return 0
    if 'jatinegara' in clean_tc or 'jng' in clean_tc:
        if 'jatinegara' not in combined_line and 'jng' not in line_id:
            return 0

    # 2. Exact Title / Code / ID Match
    if clean_line_title and clean_tc == clean_line_title:
        return 500
    if clean_line_code and clean_tc == clean_line_code:
        return 500
    if clean_line_id and clean_tc == clean_line_id:
        return 500

    # 2b. Exact Alphanumeric Match
    alpha_tc = re.sub(r'[^a-z0-9]', '', clean_tc)
    alpha_line_title = re.sub(r'[^a-z0-9]', '', clean_line_title)
    alpha_line_code = re.sub(r'[^a-z0-9]', '', clean_line_code)
    alpha_line_id = re.sub(r'[^a-z0-9]', '', clean_line_id)

    if alpha_tc:
        if alpha_tc == alpha_line_title:
            return 490
        if alpha_tc == alpha_line_code:
            return 485
        if alpha_tc == alpha_line_id:
            return 480

    # Direction Guard: HI vs HU
    tc_is_hi = bool(re.search(r'\b(hi|hilir)\b', clean_tc))
    tc_is_hu = bool(re.search(r'\b(hu|hulu)\b', clean_tc))
    line_is_hi = bool(re.search(r'\b(hi|hilir)\b', combined_line) or line_id.endswith('_hi'))
    line_is_hu = bool(re.search(r'\b(hu|hulu)\b', combined_line) or line_id.endswith('_hu'))
    if tc_is_hi and line_is_hu and not line_is_hi:
        return 0
    if tc_is_hu and line_is_hi and not line_is_hu:
        return 0

    # Track Number Guard
    tc_jalur = re.search(r'\b(?:jalur|jl\.?)\s*(\d+)\b', clean_tc)
    line_jalur = re.search(r'\b(?:jalur|jl\.?)\s*(\d+)\b', combined_line)
    if tc_jalur and line_jalur and tc_jalur.group(1) != line_jalur.group(1):
        return 0

    # Category Specific Matching
    is_switch = 'DISCONNECTING SWITCH' in line_cat or '(DS)' in line_cat or line_id.startswith('ds_')
    is_insulator = 'SECTION INSULATOR' in line_cat or '(FRP)' in line_cat or line_id.startswith('frp_')
    is_turnout = 'WESEL' in line_cat or line_id.startswith('wesel_') or line_id.startswith('titik_wesel_')

    # DS Matching
    if is_switch:
        ds_m = re.search(r'DS\s*(\d+[A-Z]?)', line_code, re.I) or re.search(r'ds_?(\d+[A-Z]?)', line_id, re.I)
        if ds_m:
            num = ds_m.group(1).lower()
            if re.search(rf'(^|\b)ds\s*-?\s*{num}\b', clean_tc):
                # Check for state match (NO vs NC) if present
                score = 350
                if '(no)' in clean_tc and '(no)' in combined_line: score += 20
                if '(nc)' in clean_tc and '(nc)' in combined_line: score += 20
                return score
        return 0

    # FRP Matching
    if is_insulator:
        frp_m = re.search(r'FRP[^\s)]*', line_code, re.I) or re.search(r'frp[^\s)]*', line_id, re.I)
        if frp_m:
            frp_code = frp_m.group(0).lower()
            if frp_code in clean_tc:
                return 350
        return 0

    # Turnout (Wesel) Matching
    if is_turnout:
        # Avoid non-wesel log matching wesel
        if not re.search(r'\b(wesel|w\d{2})\b', clean_tc):
            return 0
        w_m = re.search(r'W\d{2}[A-Z0-9]*', line_code, re.I) or re.search(r'w\d{2}[a-z0-9]*', line_id, re.I)
        if w_m:
            w_code = w_m.group(0).lower()
            if re.search(rf'(^|\b|wesel\s*){w_code}\b', clean_tc):
                # Give higher score if line is crossover line vs single dot
                score = 300
                if line.get('isDot'):
                    score = 280
                else:
                    score = 320
                # Extra points if KM matches
                tc_km = re.search(r'KM\s*(\d+\+?\d*)', clean_tc, re.I)
                if tc_km and line_km and tc_km.group(1) in line_km:
                    score += 30
                return score
        return 0

    # Regular Track / Naspan Matching
    if clean_line_code and clean_line_code in clean_tc:
        return 200
    if clean_line_title and clean_line_title in clean_tc:
        return 250

    return 0

def find_best_line_for_log(log, all_lines):
    best_line = None
    best_score = 0
    for line in all_lines:
        s = score_match(line, log)
        if s > best_score:
            best_score = s
            best_line = line
    return best_line if best_score > 0 else None

# Test user case: Wesel W13C1 / W13C2
test_log = {'targetCode': 'Wesel W13C1 / W13C2 (Crossover Jalur 3 ke Jalur 2, KM 12+000)'}
best = find_best_line_for_log(test_log, lines)
print(f"User Case: '{test_log['targetCode']}'")
print(f"  Best Line: {best['id']} ({best['code']}) - {best['title']}")

# Test all 261 lines to see if any line gets assigned to more than 1 when using find_best_line_for_log
print("\nTesting all 261 lines...")
assigned_counts = {}
for l in lines:
    log = {'targetCode': l.get('title') or l.get('code')}
    matched = find_best_line_for_log(log, lines)
    if matched:
        # Check if matched line is itself
        is_self = matched['id'] == l['id']
        if not is_self:
            print(f"  Warning: '{l['id']}' resolved to '{matched['id']}' ({matched['code']})")
    else:
        print(f"  UNMATCHED: {l['id']}")

print("Test complete.")
