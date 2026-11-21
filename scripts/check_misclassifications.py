import json

with open('scripts/all_track_lines.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Categories that are definitively Upper Block:
# Kramat, JNG-MRI, MRI-JNG, ST. JATINEGARA, PETAK JNG-KLD, PETAK KLD-BUA, PETAK BUA-KLDB, TIKUNGAN LOOP BUA-KLDB
# Categories that are definitively Lower Block:
# PETAK KLDB-CUK, ST. CAKUNG, PETAK CUK-KRI, PETAK KRI-BKS, ST. BEKASI, PETAK BKS-BKT, PETAK BKT-BKS, BEKASI TIMUR

print(f"Total items: {len(data)}")

suspicious = []
for item in data:
    cat = item.get('category', '')
    title = item.get('title', '')
    code = item.get('code', '')
    km = item.get('km', '')

    # Try to extract all Y coordinates from d
    d = item.get('d', '')
    # Check if this item is Cakung, Kranji, Bekasi
    is_known_lower = any(k in (cat + title + code).upper() for k in ['CUK', 'CAKUNG', 'KRI', 'KRANJI', 'BKS', 'BEKASI', 'BKT'])
    is_known_upper = any(k in (cat + title + code).upper() for k in ['KPB', 'KRAMAT', 'POK', 'PONDOK JATI', 'JNG', 'JATINEGARA', 'KLD', 'KLENDER', 'BUA', 'BUARAN'])

    # Let's see what the Y coordinates are in d
    parts = d.replace(/[A-Za-z]/g, ' ').strip().split() if d else []
    # If it's a known lower block, what is its Y?
    # In Model 2: Upper Block Y is ~400-900. Lower Block Y is ~1100-1600.
    
print("Checking items...")
