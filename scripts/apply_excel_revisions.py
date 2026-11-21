import json
import os
import zipfile
import xml.etree.ElementTree as ET
import re

WORKSPACE_DIR = r"C:\Users\YOGA\.gemini\antigravity\scratch\laa-jatinegara-dashboard"
JSON_PATH = os.path.join(WORKSPACE_DIR, r"scripts\all_track_lines.json")
XLSX_PATH = r"C:\Users\YOGA\.gemini\antigravity\brain\9cab1655-30f7-48f5-9398-0e382a3629b1\.user_uploaded\media_1795265850544_ca0dc38d.xlsx"
SCHEMATIC_VIEWER_PATH = os.path.join(WORKSPACE_DIR, r"frontend\src\components\SchematicViewer.jsx")

def main():
    # 1. Load existing JSON with Model 2 calibrated coordinates
    with open(JSON_PATH, "r", encoding="utf-8") as f:
        existing_lines = json.load(f)
    print(f"Loaded {len(existing_lines)} existing Model 2 lines.")

    # Preserve geometry for every line
    geom_fields = ['d', 'hitD', 'cx', 'cy', 'r', 'isDot', 'isCrossing', 'xStart', 'xEnd', 'y', 'center']
    backup_geom = {}
    legacy_map = {} # old title / code -> id

    for item in existing_lines:
        line_id = item['id']
        backup_geom[line_id] = {k: item[k] for k in geom_fields if k in item}
        
        # Build legacy mappings for backward compatibility with older database logs
        old_title = (item.get('title') or '').strip().lower().replace('\r', '').replace('\n', '')
        old_code = (item.get('code') or '').strip().lower()
        if old_title:
            legacy_map[re.sub(r'\s+', ' ', old_title)] = line_id
            legacy_map[re.sub(r'[^a-z0-9]', '', old_title)] = line_id
        if old_code:
            legacy_map[re.sub(r'\s+', ' ', old_code)] = line_id
            legacy_map[re.sub(r'[^a-z0-9]', '', old_code)] = line_id

    # 2. Parse Sheet 1 of the Excel revision
    with zipfile.ZipFile(XLSX_PATH, 'r') as z:
        shared_strings = []
        if 'xl/sharedStrings.xml' in z.namelist():
            ss_root = ET.fromstring(z.read('xl/sharedStrings.xml'))
            for si in ss_root.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}si'):
                shared_strings.append(''.join([t.text or '' for t in si.iter('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t')]))

        s1_root = ET.fromstring(z.read('xl/worksheets/sheet1.xml'))
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
                continue # Skip header
            row_data = {}
            for c in row_el.iter(f'{ns}c'):
                col_letters = re.match(r'([A-Z]+)', c.attrib['r']).group(1)
                col_idx = col_str_to_idx(col_letters)
                v_el = c.find(f'{ns}v')
                val = ''
                if v_el is not None and v_el.text:
                    t_attr = c.attrib.get('t')
                    val = shared_strings[int(v_el.text)] if t_attr == 's' else v_el.text
                else:
                    is_t = c.find(f'.//{ns}t')
                    if is_t is not None and is_t.text:
                        val = is_t.text
                row_data[col_idx] = val
            
            max_col = max(row_data.keys()) if row_data else -1
            excel_rows.append([row_data.get(i, '') for i in range(max(max_col + 1, 18))])

    print(f"Parsed {len(excel_rows)} data rows from Excel.")
    assert len(excel_rows) == 261, f"Expected 261 rows, got {len(excel_rows)}"

    # 3. Apply updates matching by ID
    existing_dict = {item['id']: item for item in existing_lines}
    updated_count = 0
    categories_set = set()

    for row in excel_rows:
        line_id = (row[1] or '').strip()
        assert line_id in existing_dict, f"Line ID '{line_id}' not found in existing data!"
        item = existing_dict[line_id]

        new_cat = (row[2] or '').strip()
        new_code = (row[3] or '').strip()
        new_title = (row[4] or '').strip()
        new_km = (row[5] or '').strip()
        new_color = (row[6] or '').strip()

        categories_set.add(new_cat)

        item['category'] = new_cat
        item['code'] = new_code
        item['title'] = new_title
        item['km'] = new_km
        item['color'] = new_color

        # Dividers
        ba_tipe = (row[8] or '').strip()
        ba_label = (row[9] or '').strip()
        ba_km = (row[10] or '').strip()
        if ba_tipe or ba_label or ba_km:
            item['startDivider'] = {
                'type': ba_tipe,
                'label': ba_label,
                'km': ba_km
            }
        else:
            item['startDivider'] = None

        bk_tipe = (row[11] or '').strip()
        bk_label = (row[12] or '').strip()
        bk_km = (row[13] or '').strip()
        if bk_tipe or bk_label or bk_km:
            item['endDivider'] = {
                'type': bk_tipe,
                'label': bk_label,
                'km': bk_km
            }
        else:
            item['endDivider'] = None

        updated_count += 1

    print(f"Successfully updated metadata for {updated_count}/261 items.")
    print(f"Found {len(categories_set)} unique categories.")

    # 4. Strict Geometry Verification
    for item in existing_lines:
        line_id = item['id']
        expected_geom = backup_geom[line_id]
        for k, expected_v in expected_geom.items():
            actual_v = item.get(k)
            assert actual_v == expected_v, f"CRITICAL: Geometry mismatch for {line_id} field {k}! Expected {expected_v}, got {actual_v}"

    print("GEOMETRY VERIFICATION PASSED: 100% of Model 2 coordinates & paths are preserved with zero modification.")

    # 5. Write back to scripts/all_track_lines.json
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(existing_lines, f, indent=2, ensure_ascii=False)
    print(f"Saved updated JSON to {JSON_PATH}")

    # 6. Save legacy mappings file for reference / fallback
    legacy_map_path = os.path.join(WORKSPACE_DIR, r"scripts\legacy_target_map.json")
    with open(legacy_map_path, "w", encoding="utf-8") as f:
        json.dump(legacy_map, f, indent=2, ensure_ascii=False)
    print(f"Saved {len(legacy_map)} legacy title/code mappings to {legacy_map_path}")

    # 7. Update SchematicViewer.jsx ALL_TRACK_LINES array
    with open(SCHEMATIC_VIEWER_PATH, "r", encoding="utf-8") as f:
        sv_content = f.read()

    # Find the start and end of ALL_TRACK_LINES
    start_marker = "export const ALL_TRACK_LINES = ["
    end_marker = "];\n\nexport const allTrackLines = ALL_TRACK_LINES;"
    
    start_idx = sv_content.find(start_marker)
    end_idx = sv_content.find(end_marker)
    
    if start_idx == -1 or end_idx == -1:
        # Try matching with \r\n
        end_marker_crlf = "];\r\n\r\nexport const allTrackLines = ALL_TRACK_LINES;"
        end_idx = sv_content.find(end_marker_crlf)
        if end_idx != -1:
            end_marker = end_marker_crlf

    assert start_idx != -1 and end_idx != -1, f"Could not find ALL_TRACK_LINES boundaries in {SCHEMATIC_VIEWER_PATH}"

    # Serialize JSON with 2-space indentation
    formatted_json = json.dumps(existing_lines, indent=2, ensure_ascii=False)
    # The formatted_json starts with [ and ends with ]
    new_all_track_lines = f"export const ALL_TRACK_LINES = {formatted_json};\n\nexport const allTrackLines = ALL_TRACK_LINES;"

    updated_sv = sv_content[:start_idx] + new_all_track_lines + sv_content[end_idx + len(end_marker):]

    with open(SCHEMATIC_VIEWER_PATH, "w", encoding="utf-8") as f:
        f.write(updated_sv)

    print(f"Updated ALL_TRACK_LINES in {SCHEMATIC_VIEWER_PATH}")

if __name__ == "__main__":
    main()
