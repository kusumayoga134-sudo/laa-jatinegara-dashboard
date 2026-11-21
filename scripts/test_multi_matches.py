import json
import re

with open('scripts/all_track_lines.json', 'r', encoding='utf-8') as f:
    lines = json.load(f)

# Implement the exact JS matchLineLogs in Python
def match_line_logs(line, log_tc):
    if not line or not log_tc:
        return False
    line_code = (line.get('code') or '').strip()
    line_title = (line.get('title') or '').strip()
    line_id = (line.get('id') or '').strip()
    line_cat = (line.get('category') or '').upper()
    combined_line = f"{line_title} {line_code} {line_id}".lower()

    is_switch = 'DISCONNECTING SWITCH' in line_cat or '(DS)' in line_cat or line_id.startswith('ds_')
    is_insulator = 'SECTION INSULATOR' in line_cat or '(FRP)' in line_cat or line_id.startswith('frp_')
    is_aj = 'AIR JOINT' in line_cat or '(AJ)' in line_cat or line_id.startswith('aj_') or line_id.startswith('overlap_aj_')
    is_as = 'AIR SECTION' in line_cat or '(AS)' in line_cat or line_id.startswith('as_') or line_id.startswith('overlap_as_')
    is_turnout = 'WESEL' in line_cat or line_id.startswith('wesel_') or line_id.startswith('titik_wesel_')
    is_aux = is_switch or is_insulator or is_aj or is_as or is_turnout

    norm_tc = log_tc.strip().lower()
    norm_line_code = line_code.lower()
    norm_line_title = line_title.lower()
    norm_line_id = line_id.lower()

    clean_tc = ' '.join(norm_tc.split())
    clean_line_code = ' '.join(norm_line_code.split())
    clean_line_title = ' '.join(norm_line_title.split())
    clean_line_id = ' '.join(norm_line_id.split())

    # 2. Direct exact string match
    if (clean_line_code and clean_tc == clean_line_code) or \
       (clean_line_title and clean_tc == clean_line_title) or \
       (clean_line_id and clean_tc == clean_line_id):
        return True

    # 2b. Exact Alphanumeric Match
    alpha_tc = re.sub(r'[^a-z0-9]', '', norm_tc)
    alpha_line_title = re.sub(r'[^a-z0-9]', '', norm_line_title)
    alpha_line_code = re.sub(r'[^a-z0-9]', '', norm_line_code)
    alpha_line_id = re.sub(r'[^a-z0-9]', '', norm_line_id)

    if alpha_tc and (alpha_tc == alpha_line_title or alpha_tc == alpha_line_code or alpha_tc == alpha_line_id):
        return True

    # 4. Aux guard
    log_is_track = bool(re.match(r'^(naspan|jalur|petak|st\.|stasiun)', log_tc, re.I))
    if log_is_track and is_aux:
        return False

    if is_switch:
        m = re.search(r'DS\s*(\d+[A-Z]?)', line_code, re.I) or re.search(r'ds_?(\d+[A-Z]?)', line_id, re.I)
        if m:
            num = m.group(1)
            return bool(re.search(rf'(^|\b)DS\s*-?\s*{num}\b', log_tc, re.I))
        return False

    if is_insulator:
        m = re.search(r'FRP[^\s)]*', line_code, re.I) or re.search(r'frp[^\s)]*', line_id, re.I)
        if m:
            return m.group(0).lower() in norm_tc
        return False

    if is_turnout:
        m = re.search(r'W\d{2}[A-Z0-9]*', line_code, re.I) or re.search(r'w\d{2}[a-z0-9]*', line_id, re.I)
        if m:
            w_code = m.group(0).lower()
            if re.search(rf'(^|\b|wesel\s*){w_code}\b', norm_tc, re.I):
                if 'cakung' in norm_tc and 'cakung' not in combined_line and 'cuk' not in line_id:
                    return False
                if 'bekasi' in norm_tc and 'bekasi' not in combined_line and 'bks' not in line_id and 'bkt' not in line_id:
                    return False
                if 'jatinegara' in norm_tc and 'jatinegara' not in combined_line and 'jng' not in line_id:
                    return False
                return True
        return False

    return False

# Test each line as a targetCode
multi_matches = []
for line in lines:
    tc = line.get('title') or line.get('code')
    matches = [l for l in lines if match_line_logs(l, tc)]
    if len(matches) > 1:
        multi_matches.append((line['id'], tc, [m['id'] for m in matches]))

print(f"Total lines tested: {len(lines)}")
print(f"Lines causing multi-matches: {len(multi_matches)}")
for lid, tc, m_ids in multi_matches:
    print(f"\nTarget: {lid} -> '{tc}'")
    print(f"  Matched {len(m_ids)} lines: {m_ids}")
