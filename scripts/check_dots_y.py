import json

with open('scripts/all_track_lines.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

diffs = set()
for item in data:
    if item.get('isDot'):
        parts = item['d'].split()
        d_y = float(parts[2])
        cy = float(item['cy'])
        diff = round(d_y - cy, 2)
        diffs.add(diff)
        print(f"{item['id']} ({item['code']}): cy={cy}, d_y={d_y}, diff={diff}")

print(f"All diff values: {diffs}")
