import json
import re

with open('scripts/original_track_lines.json', 'r', encoding='utf-8') as f:
    orig = json.load(f)

with open('scripts/all_track_lines.json', 'r', encoding='utf-8') as f:
    calib = json.load(f)

def get_y_coords(d_str):
    if not d_str:
        return []
    # find all numbers in M, L, A commands
    tokens = re.findall(r'([A-Za-z])|([-+]?[0-9]*\.?[0-9]+)', d_str)
    # let's parse commands
    commands = re.findall(r'([MLAmlaHhVv])([^MLAmlaHhVv]*)', d_str)
    ys = []
    for cmd, args in commands:
        nums = [float(x) for x in re.findall(r'[-+]?[0-9]*\.?[0-9]+', args)]
        if cmd.upper() in ['M', 'L']:
            for i in range(1, len(nums), 2):
                ys.append(nums[i])
        elif cmd.upper() == 'A':
            for i in range(6, len(nums), 7):
                ys.append(nums[i])
        elif cmd.upper() == 'V':
            for y in nums:
                ys.append(y)
    return ys

print(f"Comparing {len(orig)} items...")

shifts = {}

for o, c in zip(orig, calib):
    item_id = o['id']
    o_ys = get_y_coords(o.get('d', ''))
    c_ys = get_y_coords(c.get('d', ''))
    
    # Also check cy
    o_cy = o.get('cy')
    c_cy = c.get('cy')
    
    # Also check y
    o_y = o.get('y')
    c_y = c.get('y')
    
    avg_o_y = (sum(o_ys) / len(o_ys)) if o_ys else (o_cy or o_y or 0)
    avg_c_y = (sum(c_ys) / len(c_ys)) if c_ys else (c_cy or c_y or 0)
    
    diff = round(avg_c_y - avg_o_y, 2)
    
    # Classify whether this item belongs to Upper or Lower based on original coordinates:
    # In original AutoCAD:
    # Upper Block (Pondok Jati - Buaran): Y is roughly 250 - 750
    # Lower Block (Bekasi - Klender Baru): Y is roughly 950 - 1400
    is_upper_expected = avg_o_y < 850
    expected_shift = 157.2 if is_upper_expected else 230.8
    
    is_special = 'loop' in item_id or 'bua_kldb' in item_id
    
    if not is_special and abs(diff - expected_shift) > 0.1:
        print(f"MISMATCH for {item_id} ({o.get('code')}):")
        print(f"  avg_o_y = {avg_o_y:.1f}, expected {'UPPER (157.2)' if is_upper_expected else 'LOWER (230.8)'}")
        print(f"  actual diff in d = {diff}")
        print(f"  orig cy = {o_cy}, calib cy = {c_cy}")

print("Comparison finished.")
