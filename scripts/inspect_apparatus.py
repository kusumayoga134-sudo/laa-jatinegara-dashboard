import json

with open('scripts/all_track_lines.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for cat in ['PEMISAH SEKSI (AS/AJ)', 'DISCONNECTING SWITCH (DS)', 'SECTION INSULATOR (FRP)']:
    items = [x for x in data if x.get('category') == cat]
    print(f"=== {cat} (count: {len(items)}) ===")
    for item in items[:3]:
        keys = list(item.keys())
        print(f"  ID: {item['id']}, Code: {item.get('code')}")
        print(f"  Keys: {keys}")
        print(f"  d: {item.get('d')[:50] if item.get('d') else None}")
        print(f"  cx: {item.get('cx')}, cy: {item.get('cy')}, y: {item.get('y')}")
