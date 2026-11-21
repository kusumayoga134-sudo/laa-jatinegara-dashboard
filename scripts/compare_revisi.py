import zipfile
import xml.etree.ElementTree as ET
import re
import json

xlsx_path = r'C:\Users\YOGA\.gemini\antigravity\brain\9cab1655-30f7-48f5-9398-0e382a3629b1\.user_uploaded\media_1795265850544_ca0dc38d.xlsx'

# Load all_track_lines.json (Model 2 calibrated)
with open('scripts/all_track_lines.json', 'r', encoding='utf-8') as f:
    existing_lines = json.load(f)

existing_dict = {item['id']: item for item in existing_lines}
print(f"Loaded {len(existing_lines)} existing Model 2 track lines.")

# Parse Sheet 1 from xlsx
with zipfile.ZipFile(xlsx_path, 'r') as z:
    shared_strings = []
    if 'xl/sharedStrings.xml' in z.namelist():
        ss_xml = z.read('xl/sharedStrings.xml')
        ss_root = ET.fromstring(ss_xml)
        for si in ss_root.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}si'):
            texts = [t.text or '' for t in si.iter('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t')]
            shared_strings.append(''.join(texts))

    s1_xml = z.read('xl/worksheets/sheet1.xml')
    s1_root = ET.fromstring(s1_xml)
    ns = '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}'

    def col_str_to_idx(col_str):
        idx = 0
        for char in col_str:
            idx = idx * 26 + (ord(char.upper()) - ord('A') + 1)
        return idx - 1

    excel_rows = []
    for row_el in s1_root.iter(f'{ns}row'):
        row_num = int(row_el.attrib['r'])
        if row_num == 1:
            continue # Header
        row_data = {}
        for c in row_el.iter(f'{ns}c'):
            r_attr = c.attrib['r']
            col_letters = re.match(r'([A-Z]+)', r_attr).group(1)
            col_idx = col_str_to_idx(col_letters)
            t_attr = c.attrib.get('t')
            v_el = c.find(f'{ns}v')
            val = ''
            if v_el is not None and v_el.text:
                if t_attr == 's':
                    val = shared_strings[int(v_el.text)]
                else:
                    val = v_el.text
            else:
                is_t = c.find(f'.//{ns}t')
                if is_t is not None and is_t.text:
                    val = is_t.text
            row_data[col_idx] = val
        
        max_col = max(row_data.keys()) if row_data else -1
        row_list = [row_data.get(i, '') for i in range(max(max_col + 1, 18))]
        excel_rows.append(row_list)

print(f"Parsed {len(excel_rows)} data rows from Excel.")

matched_ids = []
unmatched_ids = []
diff_summary = {
    'category': 0,
    'code': 0,
    'title': 0,
    'km': 0,
    'color': 0,
    'startDivider': 0,
    'endDivider': 0,
}

for row in excel_rows:
    row_id = (row[1] or '').strip()
    if row_id in existing_dict:
        matched_ids.append(row_id)
        existing = existing_dict[row_id]
        
        new_cat = (row[2] or '').strip()
        new_code = (row[3] or '').strip()
        new_title = (row[4] or '').strip()
        new_km = (row[5] or '').strip()
        new_color = (row[6] or '').strip()
        
        # Check diffs
        if new_cat and new_cat != existing.get('category'):
            diff_summary['category'] += 1
        if new_code and new_code != existing.get('code'):
            diff_summary['code'] += 1
        if new_title and new_title != existing.get('title'):
            diff_summary['title'] += 1
        if new_km and new_km != existing.get('km'):
            diff_summary['km'] += 1
        if new_color and new_color != existing.get('color'):
            diff_summary['color'] += 1

        # Dividers
        ba_tipe = (row[8] or '').strip()
        ba_label = (row[9] or '').strip()
        ba_km = (row[10] or '').strip()
        if ba_tipe or ba_label or ba_km:
            new_start = {'type': ba_tipe, 'label': ba_label, 'km': ba_km}
            if new_start != existing.get('startDivider'):
                diff_summary['startDivider'] += 1
        else:
            if existing.get('startDivider') is not None:
                diff_summary['startDivider'] += 1

        bk_tipe = (row[11] or '').strip()
        bk_label = (row[12] or '').strip()
        bk_km = (row[13] or '').strip()
        if bk_tipe or bk_label or bk_km:
            new_end = {'type': bk_tipe, 'label': bk_label, 'km': bk_km}
            if new_end != existing.get('endDivider'):
                diff_summary['endDivider'] += 1
        else:
            if existing.get('endDivider') is not None:
                diff_summary['endDivider'] += 1
    else:
        unmatched_ids.append(row_id)

print(f"\nMatching Results:")
print(f"  Matched: {len(matched_ids)} / {len(existing_lines)}")
print(f"  Unmatched: {len(unmatched_ids)}")
if unmatched_ids:
    print(f"  Unmatched IDs: {unmatched_ids}")

print(f"\nDifferences detected:")
for k, v in diff_summary.items():
    print(f"  {k}: {v} rows changed")
