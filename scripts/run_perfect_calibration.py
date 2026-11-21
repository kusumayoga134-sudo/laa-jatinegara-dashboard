import json
import re

with open('scripts/original_track_lines.json', 'r', encoding='utf-8') as f:
    orig = json.load(f)

SPECIAL_PATHS = {
    'naspan_8b_bua_kldb_hu': 'M 3098.5 860.2 L 3112.1 860.5 L 3143.5 893.0 L 3143.4 1252.0 L 3101.6 1295.6 L 3046.3 1295.6',
    'naspan_8b_bua_kldb_hi': 'M 3098.5 812.5 L 3122.4 812.6 L 3180.7 873.1 L 3180.6 1278.8 L 3122.2 1343.4 L 3046.3 1343.4',
}

OFFSET_Y_UPPER = 157.2
OFFSET_Y_LOWER = 230.8

def get_true_avg_y(item):
    if item.get('cy') is not None:
        return item['cy']
    if item.get('y') is not None:
        return item['y']
    d_str = item.get('d', '')
    if not d_str:
        return 0
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
    return sum(ys) / len(ys) if ys else 0

def shift_svg_path(d_str, offset_y):
    if not d_str:
        return ''
    # Replace numbers in M, L, A commands
    def replace_cmd(m):
        cmd = m.group(1)
        args_str = m.group(2)
        raw_nums = re.findall(r'[-+]?[0-9]*\.?[0-9]+', args_str)
        if not raw_nums:
            return m.group(0)
        nums = [float(x) for x in raw_nums]
        if cmd.upper() in ['M', 'L']:
            res = []
            for i in range(0, len(nums), 2):
                x = nums[i]
                y = nums[i+1] + offset_y
                res.append(f"{x:g} {y:.1f}")
            return f"{cmd} {' '.join(res)} "
        elif cmd.upper() == 'A':
            res = []
            for i in range(0, len(nums), 7):
                rx = nums[i]
                ry = nums[i+1]
                x_rot = nums[i+2]
                laf = nums[i+3]
                sf = nums[i+4]
                x = nums[i+5]
                y = nums[i+6] + offset_y
                res.append(f"{rx:g} {ry:g} {x_rot:g} {int(laf)} {int(sf)} {x:g} {y:.1f}")
            return f"{cmd} {' '.join(res)} "
        elif cmd.upper() == 'V':
            res = [f"{y + offset_y:.1f}" for y in nums]
            return f"{cmd} {' '.join(res)} "
        return m.group(0)

    result = re.sub(r'([MLAmlaHhVv])([^MLAmlaHhVv]*)', replace_cmd, d_str)
    # clean up extra spaces
    return re.sub(r'\s+', ' ', result).strip()

calibrated = []
upper_count = 0
lower_count = 0
special_count = 0
dot_count = 0

for item in orig:
    new_item = dict(item)
    item_id = item['id']
    
    if item_id in SPECIAL_PATHS:
        new_item['d'] = SPECIAL_PATHS[item_id]
        if 'hitD' in new_item:
            new_item['hitD'] = SPECIAL_PATHS[item_id]
        special_count += 1
        calibrated.append(new_item)
        continue

    avg_y = get_true_avg_y(item)
    is_upper = avg_y < 850
    offset_y = OFFSET_Y_UPPER if is_upper else OFFSET_Y_LOWER

    if is_upper:
        upper_count += 1
    else:
        lower_count += 1

    if item.get('cy') is not None:
        new_item['cy'] = round(item['cy'] + offset_y, 1)

    if item.get('y') is not None:
        new_item['y'] = round(item['y'] + offset_y, 1)

    if item.get('isDot'):
        dot_count += 1
        cx = item['cx']
        cy = new_item['cy']
        r = item.get('r', 5.5)
        # Exactly format d and hitD to match circle
        new_item['d'] = f"M {cx - r:g} {cy:g} A {r:g} {r:g} 0 1 0 {cx + r:g} {cy:g} A {r:g} {r:g} 0 1 0 {cx - r:g} {cy:g}"
        new_item['hitD'] = f"M {cx - 20:g} {cy:g} A 20 20 0 1 0 {cx + 20:g} {cy:g} A 20 20 0 1 0 {cx - 20:g} {cy:g}"
    else:
        if 'd' in item:
            new_item['d'] = shift_svg_path(item['d'], offset_y)
        if 'hitD' in item:
            new_item['hitD'] = shift_svg_path(item['hitD'], offset_y)

    calibrated.append(new_item)

print(f"Calibration completed:")
print(f"  Upper lines: {upper_count}")
print(f"  Lower lines: {lower_count}")
print(f"  Special right bends: {special_count}")
print(f"  Wesel dots (isDot): {dot_count}")
print(f"  Total items: {len(calibrated)}")

with open('scripts/calibrated_track_lines_perfect.json', 'w', encoding='utf-8') as f:
    json.dump(calibrated, f, indent=2)

print("Saved to scripts/calibrated_track_lines_perfect.json")
