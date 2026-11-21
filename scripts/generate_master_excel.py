import json
import os
import zipfile
import csv
from xml.sax.saxutils import escape

WORKSPACE_DIR = r"C:\Users\YOGA\.gemini\antigravity\scratch\laa-jatinegara-dashboard"
JSON_PATH = os.path.join(WORKSPACE_DIR, r"scripts\all_track_lines.json")
OUTPUT_XLSX = os.path.join(WORKSPACE_DIR, "MASTER_DATA_ALL_TRACK_LINES_UPT_1.9.xlsx")
OUTPUT_CSV = os.path.join(WORKSPACE_DIR, "MASTER_DATA_ALL_TRACK_LINES_UPT_1.9.csv")
PUBLIC_XLSX = os.path.join(WORKSPACE_DIR, r"frontend\public\MASTER_DATA_ALL_TRACK_LINES_UPT_1.9.xlsx")
PUBLIC_CSV = os.path.join(WORKSPACE_DIR, r"frontend\public\MASTER_DATA_ALL_TRACK_LINES_UPT_1.9.csv")
ARTIFACT_DIR = r"C:\Users\YOGA\.gemini\antigravity\brain\9cab1655-30f7-48f5-9398-0e382a3629b1"
ARTIFACT_XLSX = os.path.join(ARTIFACT_DIR, "MASTER_DATA_ALL_TRACK_LINES_UPT_1.9.xlsx")
ARTIFACT_CSV = os.path.join(ARTIFACT_DIR, "MASTER_DATA_ALL_TRACK_LINES_UPT_1.9.csv")

COLOR_NAMES = {
    '#ff7fdf': 'Pink Muda (Naspan 9 HI)',
    '#ff0000': 'Merah (Jalur Hilir / Wesel)',
    '#ec1f24': 'Merah KAI (Jalur Hilir Bek)',
    '#8a6ddd': 'Ungu (Jalur St. Jatinegara)',
    '#f8d731': 'Kuning (Jalur Emplasemen / Wesel)',
    '#00ffff': 'Cyan (Jalur MRI-JNG)',
    '#ff00ff': 'Magenta (Naspan 1 / Jalur Hulu)',
    '#139a47': 'Hijau Tua (Jalur Arah JNG / Emplasemen)',
    '#cc6827': 'Oranye Coklat (Jalur Utama / Naspan)',
    '#0000ff': 'Biru Tua (Jalur 1 / Percabangan)',
    '#ff9f7f': 'Oranye Muda (Jalur 4 / Tikungan)',
    '#00ff00': 'Hijau Terang (Jalur Emplasemen BKS)',
    '#00bfff': 'Biru Langit (Jalur 8 JNG)',
    '#000000': 'Hitam (Peralatan Simbol: Wesel, DS, FRP, AS/AJ)'
}

def col_letter(col_idx):
    """Convert 1-based col index to Excel column letters (1->A, 28->AB)."""
    result = ""
    while col_idx > 0:
        col_idx, remainder = divmod(col_idx - 1, 26)
        result = chr(65 + remainder) + result
    return result

def clean_xml_str(val):
    if val is None:
        return ""
    s = str(val)
    # Remove control characters invalid in XML
    s = "".join(c for c in s if c >= " " or c in "\t\n\r")
    return escape(s)

def build_cell(r, c_idx, val, style_idx=0, is_num=False):
    c_ref = f"{col_letter(c_idx)}{r}"
    if val is None or val == "":
        return f'<c r="{c_ref}" s="{style_idx}"/>'
    if is_num:
        try:
            num_val = int(val) if float(val).is_integer() else float(val)
            return f'<c r="{c_ref}" s="{style_idx}"><v>{num_val}</v></c>'
        except (ValueError, TypeError):
            pass
    escaped = clean_xml_str(val)
    return f'<c r="{c_ref}" s="{style_idx}" t="inlineStr"><is><t xml:space="preserve">{escaped}</t></is></c>'

def generate_csv(records, filepath):
    headers = [
        "NO",
        "ID_SISTEM (JANGAN DIUBAH)",
        "KATEGORI (BISA DIREVISI)",
        "KODE_SINGKAT (BISA DIREVISI)",
        "NAMA_LENGKAP_JUDUL (BISA DIREVISI)",
        "RENTANG_KM (BISA DIREVISI)",
        "KODE_WARNA_HEX (BISA DIREVISI)",
        "NAMA_WARNA",
        "BATAS_AWAL_TIPE (BISA DIREVISI)",
        "BATAS_AWAL_LABEL (BISA DIREVISI)",
        "BATAS_AWAL_KM (BISA DIREVISI)",
        "BATAS_AKHIR_TIPE (BISA DIREVISI)",
        "BATAS_AKHIR_LABEL (BISA DIREVISI)",
        "BATAS_AKHIR_KM (BISA DIREVISI)",
        "JALUR_SILANG",
        "KOORDINAT_PATH_D",
        "HIT_PATH_D",
        "CATATAN_REVISI_USER"
    ]
    
    with open(filepath, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        for idx, rec in enumerate(records, 1):
            color = rec.get("color", "")
            color_desc = COLOR_NAMES.get(color.lower(), color)
            start_div = rec.get("startDivider") or {}
            end_div = rec.get("endDivider") or {}
            
            row = [
                idx,
                rec.get("id", ""),
                rec.get("category", ""),
                rec.get("code", ""),
                rec.get("title", ""),
                rec.get("km", ""),
                color,
                color_desc,
                start_div.get("type", ""),
                start_div.get("label", ""),
                start_div.get("km", ""),
                end_div.get("type", ""),
                end_div.get("label", ""),
                end_div.get("km", ""),
                "YA" if rec.get("isCrossing") else "TIDAK",
                rec.get("d", ""),
                rec.get("hitD", ""),
                ""
            ]
            writer.writerow(row)
    print(f"CSV generated: {filepath}")

def generate_xlsx(records, output_path):
    # XML Components for OpenXML
    content_types = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/worksheets/sheet3.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>"""

    root_rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>"""

    wb_rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet3.xml"/>
  <Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>"""

    workbook_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="ALL_TRACK_LINES (261)" sheetId="1" r:id="rId1"/>
    <sheet name="RINGKASAN_KATEGORI" sheetId="2" r:id="rId2"/>
    <sheet name="PANDUAN_REVISI" sheetId="3" r:id="rId3"/>
  </sheets>
</workbook>"""

    # Styles definition
    # Fonts:
    # 0: Calibri 10 (normal)
    # 1: Calibri 10 Bold White (header dark)
    # 2: Calibri 10 Bold Black (header edit)
    # 3: Calibri 12 Bold White (sheet title banner)
    # 4: Calibri 11 Bold Navy
    # Fills:
    # 0: none
    # 1: gray125
    # 2: Navy Dark Blue (001E3A8A)
    # 3: Amber Gold (00D97706)
    # 4: Light Blue Zebra (00F1F5F9)
    # 5: Soft Green (00DCFCE7)
    # 6: Soft Yellow (00FEF3C7)
    # Borders:
    # 0: none
    # 1: thin grey border
    # CellXfs:
    # 0: normal
    # 1: Header Dark Blue (font 1, fill 2, border 1, center)
    # 2: Header Editable Gold (font 1, fill 3, border 1, center)
    # 3: Header System Lock (font 1, fill 2, border 1, center)
    # 4: Data normal (font 0, fill 0, border 1, left)
    # 5: Data zebra (font 0, fill 4, border 1, left)
    # 6: Data center (font 0, fill 0, border 1, center)
    # 7: Data zebra center (font 0, fill 4, border 1, center)
    # 8: Editable cell highlight (font 0, fill 6, border 1, left)
    # 9: Title banner (font 3, fill 2, border 1, center)
    styles_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="5">
    <font><name val="Calibri"/><sz val="10"/></font>
    <font><b/><color rgb="FFFFFFFF"/><name val="Calibri"/><sz val="10"/></font>
    <font><b/><color rgb="FF000000"/><name val="Calibri"/><sz val="10"/></font>
    <font><b/><color rgb="FFFFFFFF"/><name val="Calibri"/><sz val="13"/></font>
    <font><b/><color rgb="FF1E3A8A"/><name val="Calibri"/><sz val="11"/></font>
  </fonts>
  <fills count="7">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF1E3A8A"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF0284C7"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFF8FAFC"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFDCFCE7"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFFEF3C7"/></patternFill></fill>
  </fills>
  <borders count="2">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border>
      <left style="thin"><color rgb="FFCBD5E1"/></left>
      <right style="thin"><color rgb="FFCBD5E1"/></right>
      <top style="thin"><color rgb="FFCBD5E1"/></top>
      <bottom style="thin"><color rgb="FFCBD5E1"/></bottom>
    </border>
  </borders>
  <cellXfs count="10">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
    <xf numFmtId="0" fontId="1" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="1" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="1" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" applyBorder="1" applyAlignment="1"><alignment vertical="center"/></xf>
    <xf numFmtId="0" fontId="0" fillId="4" borderId="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center"/></xf>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="0" fontId="0" fillId="4" borderId="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="0" fontId="0" fillId="6" borderId="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center"/></xf>
    <xf numFmtId="0" fontId="3" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
  </cellXfs>
</styleSheet>"""

    # Build Sheet 1: Master Track Lines
    # Columns definition (width)
    cols_widths = [
        (1, 6),    # NO
        (2, 22),   # ID_SISTEM
        (3, 26),   # KATEGORI
        (4, 25),   # KODE_SINGKAT
        (5, 42),   # NAMA_LENGKAP_JUDUL
        (6, 22),   # RENTANG_KM
        (7, 16),   # KODE_WARNA_HEX
        (8, 26),   # NAMA_WARNA
        (9, 16),   # BATAS_AWAL_TIPE
        (10, 32),  # BATAS_AWAL_LABEL
        (11, 16),  # BATAS_AWAL_KM
        (12, 16),  # BATAS_AKHIR_TIPE
        (13, 32),  # BATAS_AKHIR_LABEL
        (14, 16),  # BATAS_AKHIR_KM
        (15, 14),  # JALUR_SILANG
        (16, 35),  # KOORDINAT_PATH_D
        (17, 30),  # HIT_PATH_D
        (18, 40),  # CATATAN_REVISI_USER
    ]
    
    cols_xml = "<cols>\n"
    for c_num, width in cols_widths:
        cols_xml += f'  <col min="{c_num}" max="{c_num}" width="{width}" customWidth="1"/>\n'
    cols_xml += "</cols>"

    headers = [
        ("NO", 1),
        ("ID_SISTEM\n(KUNCI SISTEM)", 1),
        ("KATEGORI\n[BISA DIREVISI]", 2),
        ("KODE_SINGKAT\n[BISA DIREVISI]", 2),
        ("NAMA_LENGKAP_JUDUL\n[BISA DIREVISI]", 2),
        ("RENTANG_KM\n[BISA DIREVISI]", 2),
        ("KODE_WARNA_HEX\n[BISA DIREVISI]", 2),
        ("KETERANGAN_WARNA", 1),
        ("BATAS_AWAL_TIPE\n[BISA DIREVISI]", 2),
        ("BATAS_AWAL_LABEL\n[BISA DIREVISI]", 2),
        ("BATAS_AWAL_KM\n[BISA DIREVISI]", 2),
        ("BATAS_AKHIR_TIPE\n[BISA DIREVISI]", 2),
        ("BATAS_AKHIR_LABEL\n[BISA DIREVISI]", 2),
        ("BATAS_AKHIR_KM\n[BISA DIREVISI]", 2),
        ("JALUR_SILANG", 1),
        ("KOORDINAT_PATH_D\n(CAD PATH)", 1),
        ("HIT_PATH_D\n(HITBOX)", 1),
        ("CATATAN_REVISI_USER\n(KOLOM CATATAN ANDA)", 2)
    ]

    sheet1_rows = []
    # Header row at r=1
    header_cells = []
    for c_idx, (h_title, s_idx) in enumerate(headers, 1):
        header_cells.append(build_cell(1, c_idx, h_title, s_idx))
    sheet1_rows.append(f'<row r="1" ht="36" customHeight="1">{"".join(header_cells)}</row>')

    for idx, rec in enumerate(records, 1):
        r = idx + 1
        is_zebra = (idx % 2 == 0)
        s_text = 5 if is_zebra else 4
        s_center = 7 if is_zebra else 6
        
        color = rec.get("color", "")
        color_desc = COLOR_NAMES.get(color.lower(), color)
        start_div = rec.get("startDivider") or {}
        end_div = rec.get("endDivider") or {}
        
        row_cells = [
            build_cell(r, 1, idx, s_center, is_num=True),
            build_cell(r, 2, rec.get("id", ""), s_text),
            build_cell(r, 3, rec.get("category", ""), s_text),
            build_cell(r, 4, rec.get("code", ""), s_text),
            build_cell(r, 5, rec.get("title", ""), s_text),
            build_cell(r, 6, rec.get("km", ""), s_center),
            build_cell(r, 7, color, s_center),
            build_cell(r, 8, color_desc, s_text),
            build_cell(r, 9, start_div.get("type", ""), s_center),
            build_cell(r, 10, start_div.get("label", ""), s_text),
            build_cell(r, 11, start_div.get("km", ""), s_center),
            build_cell(r, 12, end_div.get("type", ""), s_center),
            build_cell(r, 13, end_div.get("label", ""), s_text),
            build_cell(r, 14, end_div.get("km", ""), s_center),
            build_cell(r, 15, "YA" if rec.get("isCrossing") else "TIDAK", s_center),
            build_cell(r, 16, rec.get("d", ""), s_text),
            build_cell(r, 17, rec.get("hitD", ""), s_text),
            build_cell(r, 18, "", s_text),  # Catatan user
        ]
        sheet1_rows.append(f'<row r="{r}" ht="20" customHeight="1">{"".join(row_cells)}</row>')

    total_rows = len(records) + 1
    sheet1_xml = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetViews>
    <sheetView tabSelected="1" workbookViewId="0">
      <pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/>
    </sheetView>
  </sheetViews>
  <sheetFormatPr defaultRowHeight="18"/>
  {cols_xml}
  <sheetData>
    {"".join(sheet1_rows)}
  </sheetData>
  <autoFilter ref="A1:R{total_rows}"/>
</worksheet>"""

    # Build Sheet 2: Category Summary
    cat_counts = {}
    for r in records:
        cat = r.get("category", "Lainnya")
        cat_counts[cat] = cat_counts.get(cat, 0) + 1
    
    sheet2_cols = """<cols>
  <col min="1" max="1" width="6" customWidth="1"/>
  <col min="2" max="2" width="40" customWidth="1"/>
  <col min="3" max="3" width="16" customWidth="1"/>
  <col min="4" max="4" width="45" customWidth="1"/>
</cols>"""
    
    sheet2_headers = [
        build_cell(1, 1, "NO", 1),
        build_cell(1, 2, "KATEGORI SEKSI / PERALATAN", 1),
        build_cell(1, 3, "JUMLAH ELEMEN", 1),
        build_cell(1, 4, "JENIS / CAKUPAN", 1)
    ]
    sheet2_rows = [f'<row r="1" ht="30" customHeight="1">{"".join(sheet2_headers)}</row>']
    
    category_descriptions = {
        'TITIK WESEL': 'Titik Pindah Jalur (Wesel W..)',
        'OVERLAP (AS/AJ)': 'Overlap Air Section (AS) & Air Joint (AJ)',
        'TITIK CROSSING': 'Jalur Crossover / Percabangan Rel',
        'SECTION INSULATOR (FRP)': 'Isolator Seksi Fiber Reinforced Plastic (FRP)',
        'DISCONNECTING SWITCH (DS)': 'Saklar Pemisah Listrik Aliran Atas (DS 01 s/d DS 20)',
        'ST. JATINEGARA': 'Emplasemen & Jalur Stasiun Jatinegara',
        'ST. BEKASI': 'Emplasemen & Jalur Stasiun Bekasi (Jalur 1 s/d 8)',
        'BKS-BKT': 'Petak Jalan Bekasi - Bekasi Timur (Hulu)',
        'KLD-JNG': 'Petak Jalan Klender - Jatinegara (Hilir)',
        'JNG-KLD': 'Petak Jalan Jatinegara - Klender (Hulu)',
        'ST. CAKUNG': 'Emplasemen Stasiun Cakung (Jalur 1 s/d 4)',
        'BUA-KLD': 'Petak Jalan Buaran - Klender (Hilir)',
        'KLDB-BUA': 'Petak Jalan Klender Baru - Buaran (Hilir)',
        'KLD-BUA': 'Petak Jalan Klender - Buaran (Hulu)',
        'BUA-KLDB': 'Petak Jalan Buaran - Klender Baru (Hulu)',
        'KRI-BKS': 'Petak Jalan Kranji - Bekasi (Hulu)',
        'NASPAN 9 KPB-JNG': 'Seksi Pasokan LAA Kampung Bandan - Jatinegara (Hilir)',
        'NASPAN 9 JNG-KPB': 'Seksi Pasokan LAA Jatinegara - Kampung Bandan (Hulu)',
        'KLDB-CUK': 'Petak Jalan Klender Baru - Cakung',
        'CUK-KRI': 'Petak Jalan Cakung - Kranji (Hulu)',
        'KRI-CUK': 'Petak Jalan Kranji - Cakung (Hilir)',
        'BKS-KRI': 'Petak Jalan Bekasi - Kranji (Hilir)',
        'BKT-BKS': 'Petak Jalan Bekasi Timur - Bekasi (Hilir)',
        'JNG-MRI': 'Petak Jalan Jatinegara - Manggarai (Hilir)',
        'MRI-JNG': 'Petak Jalan Manggarai - Jatinegara (Hulu)'
    }
    
    total_elements = sum(cat_counts.values())
    for idx, (cat, count) in enumerate(sorted(cat_counts.items(), key=lambda x: -x[1]), 1):
        r = idx + 1
        is_zebra = (idx % 2 == 0)
        s_text = 5 if is_zebra else 4
        s_center = 7 if is_zebra else 6
        desc = category_descriptions.get(cat, "Elemen Jalur / Peralatan LAA")
        cells = [
            build_cell(r, 1, idx, s_center, is_num=True),
            build_cell(r, 2, cat, s_text),
            build_cell(r, 3, count, s_center, is_num=True),
            build_cell(r, 4, desc, s_text)
        ]
        sheet2_rows.append(f'<row r="{r}" ht="20" customHeight="1">{"".join(cells)}</row>')
    
    # Total row
    r_tot = len(cat_counts) + 2
    tot_cells = [
        build_cell(r_tot, 1, "", 2),
        build_cell(r_tot, 2, "TOTAL KESELURUHAN MASTER DATA", 2),
        build_cell(r_tot, 3, total_elements, 2, is_num=True),
        build_cell(r_tot, 4, "Semua Jalur, Wesel, DS, FRP, dan AS/AJ Terdata Lengkap", 2)
    ]
    sheet2_rows.append(f'<row r="{r_tot}" ht="24" customHeight="1">{"".join(tot_cells)}</row>')

    sheet2_xml = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetViews>
    <sheetView tabSelected="0" workbookViewId="0">
      <pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/>
    </sheetView>
  </sheetViews>
  <sheetFormatPr defaultRowHeight="18"/>
  {sheet2_cols}
  <sheetData>
    {"".join(sheet2_rows)}
  </sheetData>
  <autoFilter ref="A1:D{r_tot-1}"/>
</worksheet>"""

    # Build Sheet 3: Guide / Panduan
    sheet3_cols = """<cols>
  <col min="1" max="1" width="6" customWidth="1"/>
  <col min="2" max="2" width="30" customWidth="1"/>
  <col min="3" max="3" width="70" customWidth="1"/>
</cols>"""
    
    guide_items = [
        ("TUJUAN", "Master Data ini digunakan sebagai Single Source of Truth untuk seluruh Peta Skematik LAA UPT Resor 1.9 Jatinegara dan Sistem Pencatatan Riwayat Pekerjaan."),
        ("KOLOM BISA DIREVISI", "Kolom bertanda [BISA DIREVISI] (Kategori, Kode Singkat, Nama Lengkap, Rentang KM, Warna Hex, dan Batas Pemisah Awal/Akhir) dapat Anda ubah sesuai standar penamaan resmi UPT 1.9 Jatinegara."),
        ("KOLOM JANGAN DIUBAH", "Kolom ID_SISTEM dan KOORDINAT_PATH_D mohon tidak dihapus/diubah strukturnya, karena ID tersebut menjadi jangkar sinkronisasi sistem dan koordinat menentukan posisi garis di atas gambar CAD AutoCAD."),
        ("PENAMBAHAN CATATAN", "Gunakan kolom CATATAN_REVISI_USER di ujung kanan jika Anda ingin memberikan instruksi khusus atau catatan tambahan untuk AI."),
        ("CARA MENGIRIM KEMBALI", "Setelah Anda selesai mengedit di Excel, simpan file ini (.xlsx atau .csv) lalu unggah / kirimkan kembali ke chat AI. AI akan langsung membaca dan menyinkronkan seluruh perubahan ke aplikasi secara otomatis."),
        ("DAFTAR WARNA RESMI", "Warna yang umum digunakan: Merah (#ec1f24 / #ff0000), Kuning (#f8d731), Hijau (#139a47), Ungu (#8a6ddd), Biru (#0000ff / #00bfff), Oranye (#cc6827 / #ff9f7f), Magenta (#ff00ff), Hitam (#000000 untuk simbol peralatan)."),
        ("HUBUNGAN DENGAN RIWAYAT", "Setiap riwayat pekerjaan yang dicatat pada form input otomatis membaca nama dan batas dari master data ini.")
    ]
    
    sheet3_headers = [
        build_cell(1, 1, "NO", 1),
        build_cell(1, 2, "TOPIK PANDUAN", 1),
        build_cell(1, 3, "PENJELASAN & INSTRUKSI REVISI", 1)
    ]
    sheet3_rows = [f'<row r="1" ht="30" customHeight="1">{"".join(sheet3_headers)}</row>']
    for idx, (topik, desc) in enumerate(guide_items, 1):
        r = idx + 1
        cells = [
            build_cell(r, 1, idx, 6, is_num=True),
            build_cell(r, 2, topik, 2),
            build_cell(r, 3, desc, 4)
        ]
        sheet3_rows.append(f'<row r="{r}" ht="32" customHeight="1">{"".join(cells)}</row>')
        
    sheet3_xml = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetViews>
    <sheetView tabSelected="0" workbookViewId="0">
      <pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/>
    </sheetView>
  </sheetViews>
  <sheetFormatPr defaultRowHeight="18"/>
  {sheet3_cols}
  <sheetData>
    {"".join(sheet3_rows)}
  </sheetData>
</worksheet>"""

    # Create ZIP
    with zipfile.ZipFile(output_path, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("[Content_Types].xml", content_types)
        z.writestr("_rels/.rels", root_rels)
        z.writestr("xl/_rels/workbook.xml.rels", wb_rels)
        z.writestr("xl/workbook.xml", workbook_xml)
        z.writestr("xl/styles.xml", styles_xml)
        z.writestr("xl/worksheets/sheet1.xml", sheet1_xml)
        z.writestr("xl/worksheets/sheet2.xml", sheet2_xml)
        z.writestr("xl/worksheets/sheet3.xml", sheet3_xml)
        
    print(f"XLSX successfully created: {output_path}")

def main():
    with open(JSON_PATH, "r", encoding="utf-8") as f:
        records = json.load(f)
    print(f"Loaded {len(records)} records from JSON.")
    
    # 1. Generate primary workspace XLSX and CSV
    generate_xlsx(records, OUTPUT_XLSX)
    generate_csv(records, OUTPUT_CSV)
    
    # 2. Copy to public directory for direct web download
    import shutil
    shutil.copy2(OUTPUT_XLSX, PUBLIC_XLSX)
    shutil.copy2(OUTPUT_CSV, PUBLIC_CSV)
    print(f"Copied to public folder: {PUBLIC_XLSX}")
    
    # 3. Copy to Artifact directory
    shutil.copy2(OUTPUT_XLSX, ARTIFACT_XLSX)
    shutil.copy2(OUTPUT_CSV, ARTIFACT_CSV)
    print(f"Copied to artifact directory: {ARTIFACT_XLSX}")
    
    # Also copy to user's Downloads folder if accessible
    user_downloads = os.path.join(os.path.expanduser("~"), "Downloads")
    if os.path.exists(user_downloads):
        dl_xlsx = os.path.join(user_downloads, "MASTER_DATA_ALL_TRACK_LINES_UPT_1.9.xlsx")
        dl_csv = os.path.join(user_downloads, "MASTER_DATA_ALL_TRACK_LINES_UPT_1.9.csv")
        try:
            shutil.copy2(OUTPUT_XLSX, dl_xlsx)
            shutil.copy2(OUTPUT_CSV, dl_csv)
            print(f"Copied to User Downloads: {dl_xlsx}")
        except Exception as e:
            print(f"Could not copy to Downloads: {e}")

if __name__ == "__main__":
    main()
