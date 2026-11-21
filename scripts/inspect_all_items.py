import json
import re

with open('scripts/all_track_lines.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f"Total items in ALL_TRACK_LINES: {len(data)}")

categories = {}
for item in data:
    cat = item.get('category', 'UNKNOWN')
    categories[cat] = categories.get(cat, 0) + 1

for cat, count in categories.items():
    print(f"  {cat}: {count}")

# Check properties
for idx, item in enumerate(data):
    # Check if cy is present
    if 'cy' in item:
        pass
    # Check if y is present
    if 'y' in item:
        pass
    # Check if d is present
    if 'd' not in item:
        print(f"Item {item['id']} has NO 'd'!")

print("All items checked.")
