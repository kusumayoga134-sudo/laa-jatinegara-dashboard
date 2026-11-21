import zipfile
import xml.etree.ElementTree as ET
import re

xlsx_path = r'C:\Users\YOGA\.gemini\antigravity\brain\9cab1655-30f7-48f5-9398-0e382a3629b1\.user_uploaded\media_1795265850544_ca0dc38d.xlsx'

with zipfile.ZipFile(xlsx_path, 'r') as z:
    # 1. Read shared strings
    shared_strings = []
    if 'xl/sharedStrings.xml' in z.namelist():
        ss_xml = z.read('xl/sharedStrings.xml')
        ss_root = ET.fromstring(ss_xml)
        for si in ss_root.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}si'):
            # Text might be in multiple <t> elements inside <r>
            texts = [t.text or '' for t in si.iter('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t')]
            shared_strings.append(''.join(texts))

    print(f"Loaded {len(shared_strings)} shared strings.")

    # 2. Read sheet1.xml (ALL_TRACK_LINES (261))
    s1_xml = z.read('xl/worksheets/sheet1.xml')
    s1_root = ET.fromstring(s1_xml)
    
    rows = []
    ns = '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}'
    
    def col_str_to_idx(col_str):
        idx = 0
        for char in col_str:
            idx = idx * 26 + (ord(char.upper()) - ord('A') + 1)
        return idx - 1

    for row_el in s1_root.iter(f'{ns}row'):
        row_num = int(row_el.attrib['r'])
        row_data = {}
        for c in row_el.iter(f'{ns}c'):
            r_attr = c.attrib['r'] # e.g. "B2"
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
        
        # Convert row_data dict to list based on max col
        max_col = max(row_data.keys()) if row_data else -1
        row_list = [row_data.get(i, '') for i in range(max_col + 1)]
        rows.append((row_num, row_list))

print(f"Total rows parsed from Sheet 1: {len(rows)}")
header = rows[0][1]
print("Header columns:")
for idx, col in enumerate(header):
    print(f"  Col {idx}: {repr(col)}")

print("\nSample Row 2 (Data row 1):")
for idx, (col_name, val) in enumerate(zip(header, rows[1][1])):
    print(f"  {idx} - {col_name}: {repr(val)}")
