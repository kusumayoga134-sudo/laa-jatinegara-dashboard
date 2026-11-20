import json
import re
import os
import sys
import csv
import zipfile
import xml.etree.ElementTree as ET

WORKSPACE_DIR = r"C:\Users\YOGA\.gemini\antigravity\scratch\laa-jatinegara-dashboard"
SCHEMATIC_PATH = os.path.join(WORKSPACE_DIR, r"frontend\src\components\SchematicViewer.jsx")

def parse_xlsx_rows(xlsx_path):
    """Parse rows from sheet1.xml inside xlsx without external libraries."""
    rows = []
    with zipfile.ZipFile(xlsx_path, "r") as z:
        sheet_data = z.read("xl/worksheets/sheet1.xml")
        root = ET.fromstring(sheet_data)
        
        # Namespace
        ns = {"main": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
        
        for row_el in root.findall(".//main:row", ns):
            row_dict = {}
            for c_el in row_el.findall("main:c", ns):
                r_ref = c_el.get("r", "")
                # Extract col letters
                col_letters = "".join(filter(str.isalpha, r_ref))
                
                # Extract text
                text = ""
                t_attr = c_el.get("t", "")
                if t_attr == "inlineStr":
                    t_el = c_el.find(".//main:t", ns)
                    if t_el is not None and t_el.text:
                        text = t_el.text
                else:
                    v_el = c_el.find("main:v", ns)
                    if v_el is not None and v_el.text:
                        text = v_el.text
                row_dict[col_letters] = text
            if row_dict:
                rows.append(row_dict)
    return rows

def sync_from_csv(csv_path):
    updated_records = {}
    with open(csv_path, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            id_val = row.get("ID_SISTEM (JANGAN DIUBAH)") or row.get("ID") or row.get("id")
            if not id_val:
                continue
            updated_records[id_val.strip()] = row
    return updated_records

def sync_from_xlsx(xlsx_path):
    rows = parse_xlsx_rows(xlsx_path)
    if not rows:
        return {}
    header_row = rows[0]
    # In generate_master_excel:
    # A=NO, B=ID_SISTEM, C=KATEGORI, D=KODE_SINGKAT, E=NAMA_LENGKAP_JUDUL, F=RENTANG_KM,
    # G=KODE_WARNA_HEX, H=KETERANGAN_WARNA, I=BATAS_AWAL_TIPE, J=BATAS_AWAL_LABEL,
    # K=BATAS_AWAL_KM, L=BATAS_AKHIR_TIPE, M=BATAS_AKHIR_LABEL, N=BATAS_AKHIR_KM,
    # O=JALUR_SILANG, P=KOORDINAT_PATH_D, Q=HIT_PATH_D, R=CATATAN_REVISI_USER
    updated_records = {}
    for r in rows[1:]:
        id_val = r.get("B", "").strip()
        if not id_val:
            continue
        updated_records[id_val] = {
            "category": r.get("C", "").strip(),
            "code": r.get("D", "").strip(),
            "title": r.get("E", "").strip(),
            "km": r.get("F", "").strip(),
            "color": r.get("G", "").strip(),
            "start_type": r.get("I", "").strip(),
            "start_label": r.get("J", "").strip(),
            "start_km": r.get("K", "").strip(),
            "end_type": r.get("L", "").strip(),
            "end_label": r.get("M", "").strip(),
            "end_km": r.get("N", "").strip(),
            "user_notes": r.get("R", "").strip()
        }
    return updated_records

def main():
    print("Sync script ready to read revised Excel / CSV when uploaded by user.")

if __name__ == "__main__":
    main()
