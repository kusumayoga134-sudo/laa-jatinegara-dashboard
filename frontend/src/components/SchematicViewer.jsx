import React, { useState, useRef, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Crosshair,
  Wrench,
  Clock,
  HardHat,
  ChevronRight,
  Sparkles,
  PlusCircle,
  Layers,
  GitCommit,
  X,
  ClipboardList,
  FileText,
  FileSpreadsheet,
  Sliders,
  Copy,
  Check,
} from 'lucide-react';

// =========================================================================
// ALL_TRACK_LINES: MASTER DATA SEMUA JALUR, NASPAN, WESEL, DS, FRP, AS/AJ
// Single source of truth untuk seluruh aplikasi (Peta & Riwayat Pekerjaan).
// File allMapLocations.js otomatis membaca dan tersinkron dari sini secara real-time.
// =========================================================================
export const ALL_TRACK_LINES = [
  {
    "id": "kpb_jng_hi_aj",
    "code": "NASPAN 9 KPB-JNG HI (AJ)",
    "title": "NASPAN 9 KPB-JNG HI (Jalur Hilir Arah Kramat)",
    "km": "KM 9+800 - KM 10+000",
    "category": "PERCABANGAN KRAMAT",
    "d": "M 171.9 527.4 L 207 527.4",
    "color": "#ff7fdf",
    "xStart": 171.9,
    "xEnd": 207,
    "y": 527.4,
    "startDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ KM 10+000)",
      "km": "KM 10+000"
    },
    "endDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ KM 10+000)",
      "km": "KM 10+000"
    }
  },
  {
    "id": "kpb_jng_hi_naspan9",
    "code": "NASPAN 9 KPB-JNG HI (JNG)",
    "title": "NASPAN 9 KPB-JNG HI (JNG-POK Jalur Hilir)",
    "km": "KM 9+890 - KM 11+227",
    "category": "PERCABANGAN KRAMAT",
    "d": "M 218.7 527.6 L 587.7 527.6",
    "color": "#ff7fdf",
    "xStart": 218.7,
    "xEnd": 587.7,
    "y": 527.6,
    "startDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ KM 10+000)",
      "km": "KM 10+000"
    },
    "endDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS KM 11+200)",
      "km": "KM 11+200"
    }
  },
  {
    "id": "kpb_jng_hu_aj",
    "code": "NASPAN 9 JNG-KPB HU (AJ)",
    "title": "NASPAN 9 JNG-KPB HU (Jalur Hulu Arah Kramat)",
    "km": "KM 9+800 - KM 10+000",
    "category": "NASPAN 9 JNG-KPB",
    "d": "M 171.9 575.4 L 206.8 575.4",
    "color": "#ff0000",
    "xStart": 171.9,
    "xEnd": 206.8,
    "y": 575.4,
    "startDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ KM 10+000)",
      "km": "KM 10+000"
    },
    "endDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ KM 10+000)",
      "km": "KM 10+000"
    }
  },
  {
    "id": "kpb_jng_hu_naspan",
    "code": "NASPAN 9 JNG-KPB HU (POK)",
    "title": "NASPAN 9 JNG-KPB HU (POK-JNG Jalur Hulu)",
    "km": "KM 9+890 - KM 11+227",
    "category": "NASPAN 9 JNG-KPB",
    "d": "M 218.7 575.4 L 587.7 575.4",
    "color": "#ff0000",
    "xStart": 218.7,
    "xEnd": 587.7,
    "y": 575.4,
    "startDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ KM 10+000)",
      "km": "KM 10+000"
    },
    "endDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS KM 11+200)",
      "km": "KM 11+200"
    }
  },
  {
    "id": "jng_mri_hi_western",
    "code": "JNG-MRI HI",
    "title": "JNG-MRI HI (Jalur Hilir)",
    "km": "KM 1+599 - KM 1+880",
    "category": "JNG-MRI",
    "d": "M 310.2 813.4 L 474.5 813.4",
    "color": "#8a6ddd",
    "startDivider": {
      "type": "KM",
      "label": "KM 1+599",
      "km": "KM 1+599"
    },
    "endDivider": {
      "type": "AS",
      "label": "Air Section (AS KM 1+880)",
      "km": "KM 1+880"
    }
  },
  {
    "id": "jng_mri_hi_naspan1",
    "code": "JNG-MRI NASPAN 1 HI",
    "title": "NASPAN 1 (JNG-MRI Jalur Hilir)",
    "km": "KM 1+823 - KM 2+221",
    "category": "ST. JATINEGARA",
    "d": "M 486.4 813.4 L 728.7 813.4",
    "color": "#f8d731",
    "startDivider": {
      "type": "AS",
      "label": "Air Section (AS KM 1+880)",
      "km": "KM 1+880"
    },
    "endDivider": {
      "type": "AS",
      "label": "Air Section (AS KM 2+000)",
      "km": "KM 2+000"
    }
  },
  {
    "id": "mri_jng_hu_western",
    "code": "MRI-JNG HU",
    "title": "MRI-JNG HU (Jalur Hulu)",
    "km": "KM 1+599 - KM 1+854",
    "category": "MRI-JNG",
    "d": "M 310.2 860.7 L 474.5 860.7",
    "color": "#00ffff",
    "startDivider": {
      "type": "KM",
      "label": "KM 1+599",
      "km": "KM 1+599"
    },
    "endDivider": {
      "type": "AS",
      "label": "Air Section (AS KM 1+854)",
      "km": "KM 1+854"
    }
  },
  {
    "id": "mri_jng_hu_naspan1",
    "code": "MRI-JNG NASPAN 1 HU",
    "title": "NASPAN 1 (MRI-JNG Jalur Hulu)",
    "km": "KM 1+823 - KM 2+220",
    "category": "ST. JATINEGARA",
    "d": "M 486.4 860.7 L 728.9 860.7",
    "color": "#ff00ff",
    "startDivider": {
      "type": "AS",
      "label": "Air Section (AS KM 1+854)",
      "km": "KM 1+854"
    },
    "endDivider": {
      "type": "DS",
      "label": "DS 2 (NO) JNG-MRI (HU)",
      "km": "KM 2+123"
    }
  },
  {
    "id": "jng_jalur_8",
    "code": "JALUR 8 JNG",
    "title": "ST. JATINEGARA (Jalur 8)",
    "km": "KM 11+470 - KM 12+089",
    "category": "ST. JATINEGARA",
    "d": "M 959.8 527.5 L 991.5 479.6 L 1421.8 479.6 L 1452.8 527.2",
    "color": "#139a47",
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W81C (Percabangan Jalur 7)",
      "km": "KM 11+700"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "Wesel W83A1 (Jalur 7)",
      "km": "KM 11+800"
    }
  },
  {
    "id": "jng_jalur_7",
    "code": "JALUR 7 JNG",
    "title": "ST. JATINEGARA (Jalur 7)",
    "km": "KM 11+082 - KM 12+089",
    "category": "ST. JATINEGARA",
    "d": "M 601.1 527.7 L 1477.3 527.7 L 1568 669.9 L 1718.7 669.9",
    "color": "#139a47",
    "startDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS KM 11+200)",
      "km": "KM 11+200"
    },
    "endDivider": {
      "type": "FRP",
      "label": "FRP-JNG-10-JALUR 4 (Ujung KM 12+089)",
      "km": "KM 12+089"
    }
  },
  {
    "id": "jng_jalur_6",
    "code": "JALUR 6 JNG",
    "title": "ST. JATINEGARA (Jalur 6)",
    "km": "KM 11+082 - KM 12+199",
    "category": "ST. JATINEGARA",
    "d": "M 599.5 575.2 L 1452.8 575.2 L 1546 717.7",
    "color": "#cc6827",
    "isCrossing": true,
    "startDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS KM 11+200)",
      "km": "KM 11+200"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "Wesel W23B1 (KM 12+086)",
      "km": "KM 12+086"
    }
  },
  {
    "id": "jng_jalur_5",
    "code": "JALUR 5 JNG",
    "title": "ST. JATINEGARA (Jalur 5)",
    "km": "KM 11+500 - KM 12+058",
    "category": "ST. JATINEGARA",
    "d": "M 961.2 575 L 991.5 622.8 L 1483.8 622.8",
    "color": "#cc6827",
    "isCrossing": true,
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W61C (KM 11+542)",
      "km": "KM 11+542"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "Wesel W63A (KM 12+012)",
      "km": "KM 12+012"
    }
  },
  {
    "id": "jng_jalur_4",
    "code": "JALUR 4 JNG",
    "title": "ST. JATINEGARA (Jalur 4)",
    "km": "KM 1+049 - KM 12+000",
    "category": "ST. JATINEGARA",
    "d": "M 611.9 717.2 L 796.2 717.2 L 828.5 669.9 L 1461.9 669.9 L 1489.8 717.7 L 1628.4 717.7",
    "color": "#cc6827",
    "startDivider": {
      "type": "DEAD_END",
      "label": "Ujung Barat Jalur 4 (KM 1+049)",
      "km": "KM 1+049"
    },
    "endDivider": {
      "type": "FRP",
      "label": "FRP-JNG-11-23B2 / Wesel W23B2",
      "km": "KM 12+000"
    }
  },
  {
    "id": "jng_jalur_mid_green",
    "code": "JALUR W23C",
    "title": "Jalur Wesel 23C JNG Emplasemen Timur",
    "km": "KM 12+000 - KM 12+100",
    "category": "ST. JATINEGARA",
    "d": "M 1634 717.7 L 1768.5 717.7",
    "color": "#139a47",
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W23C1",
      "km": "KM 12+000"
    },
    "endDivider": {
      "type": "KM",
      "label": "KM 12+235",
      "km": "KM 12+235"
    }
  },
  {
    "id": "jng_jalur_mid_rust",
    "code": "JALUR BARAT JNG",
    "title": "Jalur Antara Barat JNG (KM 11+600)",
    "km": "KM 11+600",
    "category": "ST. JATINEGARA (EMPLASEMEN BARAT)",
    "d": "M 611.7 762.8 L 790.6 762.8",
    "color": "#cc6827",
    "startDivider": {
      "type": "KM",
      "label": "KM 1+049",
      "km": "KM 1+049"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "Wesel W11B1",
      "km": "KM 11+600"
    }
  },
  {
    "id": "jng_jalur_3",
    "code": "JALUR 3 JNG",
    "title": "ST. JATINEGARA (Jalur 3)",
    "km": "KM 11+600 - KM 11+900",
    "category": "ST. JATINEGARA",
    "d": "M 796.4 763.2 L 1475.4 763.2",
    "color": "#f8d731",
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W11B1",
      "km": "KM 11+600"
    },
    "endDivider": {
      "type": "DS",
      "label": "DS 5 (NC) JALUR 2,3",
      "km": "KM 11+900"
    }
  },
  {
    "id": "jng_jalur_3_ext",
    "code": "JALUR 3 JNG EXT",
    "title": "Jalur 3 Lanjutan Emplasemen Timur JNG / Wesel 13",
    "km": "KM 11+900 - KM 12+384",
    "category": "ST. JATINEGARA",
    "d": "M 1487.4 764.8 L 1822.6 764.8",
    "color": "#f8d731",
    "startDivider": {
      "type": "DS",
      "label": "DS 5 (NC) JALUR 2,3",
      "km": "KM 11+900"
    },
    "endDivider": {
      "type": "KM",
      "label": "KM 12+384",
      "km": "KM 12+384"
    }
  },
  {
    "id": "jng_jalur_2",
    "code": "JALUR 2 JNG",
    "title": "ST. JATINEGARA (Jalur 2)",
    "km": "KM 11+500 - KM 11+900",
    "category": "ST. JATINEGARA",
    "d": "M 740.6 813.3 L 1475.1 813.3",
    "color": "#f8d731",
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W11A",
      "km": "KM 11+500"
    },
    "endDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS KM 11+900)",
      "km": "KM 11+900"
    }
  },
  {
    "id": "jng_jalur_1",
    "code": "JALUR 1 JNG",
    "title": "ST. JATINEGARA (Jalur 1)",
    "km": "KM 11+500 - KM 11+900",
    "category": "ST. JATINEGARA",
    "d": "M 740.4 860.7 L 1475.3 860.7",
    "color": "#ff00ff",
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W51A",
      "km": "KM 11+500"
    },
    "endDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS KM 11+900)",
      "km": "KM 11+900"
    }
  },
  {
    "id": "naspan_1_arah_kld_hi",
    "code": "NASPAN 1 ARAH KLD HI",
    "title": "NASPAN 1 ARAH KLD HI (AS KM 11+900 s/d DS 7 KM 12+500)",
    "km": "KM 11+900 - KM 12+500",
    "category": "PETAK JNG-KLD",
    "d": "M 1487 813.2 L 1931.3 813.2",
    "color": "#f8d731",
    "startDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS KM 11+900)",
      "km": "KM 11+900"
    },
    "endDivider": {
      "type": "DS",
      "label": "DS 7 (NO) KLD-JNG HI",
      "km": "KM 12+500"
    }
  },
  {
    "id": "naspan_2_jng_kld_hi",
    "code": "NASPAN 2 JNG-KLD HI",
    "title": "NASPAN 2 JNG-KLD HI (DS 7 s/d AJ KM 13+300)",
    "km": "KM 12+500 - KM 13+300",
    "category": "PETAK JNG-KLD",
    "d": "M 1967.2 813 L 2086.4 813",
    "color": "#0000ff",
    "startDivider": {
      "type": "DS",
      "label": "DS 7 (NO) KLD-JNG HI",
      "km": "KM 12+500"
    },
    "endDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ KM 13+300)",
      "km": "KM 13+300"
    }
  },
  {
    "id": "naspan_3_jng_kld_hi",
    "code": "NASPAN 3 JNG-KLD HI",
    "title": "NASPAN 3 JNG-KLD HI (AJ KM 13+300 s/d AJ KM 14+100)",
    "km": "KM 13+300 - KM 14+100",
    "category": "PETAK JNG-KLD",
    "d": "M 2086.4 813 L 2161.3 813",
    "color": "#0000ff",
    "startDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ KM 13+300)",
      "km": "KM 13+300"
    },
    "endDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ KM 14+100)",
      "km": "KM 14+100"
    }
  },
  {
    "id": "naspan_4_jng_kld_hi",
    "code": "NASPAN 4 JNG-KLD HI",
    "title": "NASPAN 4 JNG-KLD HI (AJ KM 14+100 s/d AJ KM 14+700)",
    "km": "KM 14+100 - KM 14+700",
    "category": "PETAK JNG-KLD",
    "d": "M 2161.3 812.5 L 2249.6 812.5",
    "color": "#0000ff",
    "startDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ KM 14+100)",
      "km": "KM 14+100"
    },
    "endDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ KM 14+700)",
      "km": "KM 14+700"
    }
  },
  {
    "id": "naspan_4b_kld_bua_hi",
    "code": "NASPAN 4B KLD-BUA HI",
    "title": "NASPAN 4B KLD-BUA HI (AJ KM 14+700 s/d AS KM 15+450)",
    "km": "KM 14+700 - KM 15+450",
    "category": "PETAK KLD-BUA",
    "d": "M 2249.6 812.5 L 2518.8 812.5",
    "color": "#0000ff",
    "startDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ KM 14+700)",
      "km": "KM 14+700"
    },
    "endDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS KM 15+450)",
      "km": "KM 15+450"
    }
  },
  {
    "id": "naspan_5_kld_bua_hi",
    "code": "NASPAN 5 KLD-BUA HI",
    "title": "NASPAN 5 KLD-BUA HI (AS KM 15+450 s/d AJ KM 16+500)",
    "km": "KM 15+450 - KM 16+500",
    "category": "PETAK KLD-BUA",
    "d": "M 2518.8 813.3 L 2635 813.3",
    "color": "#ff00ff",
    "startDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS KM 15+450)",
      "km": "KM 15+450"
    },
    "endDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ KM 16+500)",
      "km": "KM 16+500"
    }
  },
  {
    "id": "naspan_6_kld_bua_hi",
    "code": "NASPAN 6 KLD-BUA HI",
    "title": "NASPAN 6 KLD-BUA HI (AJ KM 16+500 s/d AS KM 17+239)",
    "km": "KM 16+500 - KM 17+239",
    "category": "PETAK KLD-BUA",
    "d": "M 2635 812.7 L 2740 812.7",
    "color": "#ff00ff",
    "startDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ KM 16+500)",
      "km": "KM 16+500"
    },
    "endDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS KM 17+239)",
      "km": "KM 17+239"
    }
  },
  {
    "id": "naspan_7_bua_kldb_hi",
    "code": "NASPAN 7 BUA-KLDB HI",
    "title": "NASPAN 7 BUA-KLDB HI (AS KM 17+239 s/d DS 9 KM 17+900)",
    "km": "KM 17+239 - KM 17+900",
    "category": "PETAK BUA-KLDB",
    "d": "M 2740 812.7 L 2985.7 812.7",
    "color": "#f8d731",
    "startDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS KM 17+239)",
      "km": "KM 17+239"
    },
    "endDivider": {
      "type": "DS",
      "label": "DS 9 (NC) KLDB-BUA HI",
      "km": "KM 17+900"
    }
  },
  {
    "id": "naspan_7b_bua_kldb_hi",
    "code": "NASPAN 7B BUA-KLDB HI",
    "title": "NASPAN 7B BUA-KLDB HI (DS 9 s/d AJ KM 18+800)",
    "km": "KM 17+900 - KM 18+800",
    "category": "PETAK BUA-KLDB",
    "d": "M 2985.7 812.5 L 3098.5 812.5",
    "color": "#f8d731",
    "startDivider": {
      "type": "DS",
      "label": "DS 9 (NC) KLDB-BUA HI",
      "km": "KM 17+900"
    },
    "endDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ KM 18+800)",
      "km": "KM 18+800"
    }
  },
  {
    "id": "naspan_8b_bua_kldb_hi",
    "code": "NASPAN 8B BUA-KLDB",
    "title": "NASPAN 8B BUA-KLDB (Jalur Hilir, AJ KM 18+800 s/d AJ KM 19+300)",
    "km": "KM 18+800 - KM 19+300",
    "category": "TIKUNGAN LOOP BUA-KLDB",
    "d": "M 3098.5 812.5 L 3122.4 812.6 L 3180.7 873.1 L 3180.6 1278.8 L 3122.2 1343.4 L 3046.3 1343.4",
    "color": "#f8d731",
    "startDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ KM 18+800)",
      "km": "KM 18+800"
    },
    "endDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ KM 19+300)",
      "km": "KM 19+300"
    }
  },
  {
    "id": "naspan_1_arah_kld_hu",
    "code": "NASPAN 1 ARAH KLD HU",
    "title": "NASPAN 1 ARAH KLD HU (DS 6 s/d DS 8 KM 12+500)",
    "km": "KM 11+900 - KM 12+500",
    "category": "PETAK JNG-KLD",
    "d": "M 1487.2 860.7 L 1932.2 860.7",
    "color": "#ff00ff",
    "startDivider": {
      "type": "DS",
      "label": "DS 6 (NC) JALUR 1",
      "km": "KM 11+900"
    },
    "endDivider": {
      "type": "DS",
      "label": "DS 8 (NO) JNG-KLD HU",
      "km": "KM 12+500"
    }
  },
  {
    "id": "naspan_2_jng_kld_hu",
    "code": "NASPAN 2 JNG-KLD HU",
    "title": "NASPAN 2 JNG-KLD HU (DS 8 s/d AJ KM 13+300)",
    "km": "KM 12+500 - KM 13+300",
    "category": "PETAK JNG-KLD",
    "d": "M 1967.9 860.7 L 2086.4 860.7",
    "color": "#ff9f7f",
    "startDivider": {
      "type": "DS",
      "label": "DS 8 (NO) JNG-KLD HU",
      "km": "KM 12+500"
    },
    "endDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ KM 13+300)",
      "km": "KM 13+300"
    }
  },
  {
    "id": "naspan_3_jng_kld_hu",
    "code": "NASPAN 3 JNG-KLD HU",
    "title": "NASPAN 3 JNG-KLD HU (AJ KM 13+300 s/d AJ KM 14+100)",
    "km": "KM 13+300 - KM 14+100",
    "category": "PETAK JNG-KLD",
    "d": "M 2086.4 860.7 L 2161.3 860.7",
    "color": "#ff9f7f",
    "startDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ KM 13+300)",
      "km": "KM 13+300"
    },
    "endDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ KM 14+100)",
      "km": "KM 14+100"
    }
  },
  {
    "id": "naspan_4_jng_kld_hu",
    "code": "NASPAN 4 JNG-KLD HU",
    "title": "NASPAN 4 JNG-KLD HU (AJ KM 14+100 s/d AJ KM 14+700)",
    "km": "KM 14+100 - KM 14+700",
    "category": "PETAK JNG-KLD",
    "d": "M 2161.3 860.2 L 2249.6 860.2",
    "color": "#ff9f7f",
    "startDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ KM 14+100)",
      "km": "KM 14+100"
    },
    "endDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ KM 14+700)",
      "km": "KM 14+700"
    }
  },
  {
    "id": "naspan_4b_kld_bua_hu",
    "code": "NASPAN 4B KLD-BUA HU",
    "title": "NASPAN 4B KLD-BUA HU (AJ KM 14+700 s/d AS KM 15+450)",
    "km": "KM 14+700 - KM 15+450",
    "category": "PETAK KLD-BUA",
    "d": "M 2249.6 860.2 L 2518.8 860.2",
    "color": "#ff9f7f",
    "startDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ KM 14+700)",
      "km": "KM 14+700"
    },
    "endDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS KM 15+450)",
      "km": "KM 15+450"
    }
  },
  {
    "id": "naspan_5_kld_bua_hu",
    "code": "NASPAN 5 KLD-BUA HU",
    "title": "NASPAN 5 KLD-BUA HU (AS KM 15+450 s/d AJ KM 16+500)",
    "km": "KM 15+450 - KM 16+500",
    "category": "PETAK KLD-BUA",
    "d": "M 2518.8 861.1 L 2635 861.1",
    "color": "#00ff00",
    "startDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS KM 15+450)",
      "km": "KM 15+450"
    },
    "endDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ KM 16+500)",
      "km": "KM 16+500"
    }
  },
  {
    "id": "naspan_6_kld_bua_hu",
    "code": "NASPAN 6 KLD-BUA HU",
    "title": "NASPAN 6 KLD-BUA HU (AJ KM 16+500 s/d AS KM 17+239)",
    "km": "KM 16+500 - KM 17+239",
    "category": "PETAK KLD-BUA",
    "d": "M 2635 860.6 L 2740 860.6",
    "color": "#00ff00",
    "startDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ KM 16+500)",
      "km": "KM 16+500"
    },
    "endDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS KM 17+239)",
      "km": "KM 17+239"
    }
  },
  {
    "id": "naspan_7_bua_kldb_hu",
    "code": "NASPAN 7 BUA-KLDB HU",
    "title": "NASPAN 7 BUA-KLDB HU (AS KM 17+239 s/d DS 10 KM 17+900)",
    "km": "KM 17+239 - KM 17+900",
    "category": "PETAK BUA-KLDB",
    "d": "M 2740 860.5 L 2985.7 860.5",
    "color": "#ff0000",
    "startDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS KM 17+239)",
      "km": "KM 17+239"
    },
    "endDivider": {
      "type": "DS",
      "label": "DS 10 (NC) BUA-KLDB HU",
      "km": "KM 17+900"
    }
  },
  {
    "id": "naspan_7b_bua_kldb_hu",
    "code": "NASPAN 7B BUA-KLDB HU",
    "title": "NASPAN 7B BUA-KLDB HU (DS 10 s/d AJ KM 18+800)",
    "km": "KM 17+900 - KM 18+800",
    "category": "PETAK BUA-KLDB",
    "d": "M 2985.7 860.2 L 3098.5 860.2",
    "color": "#ff0000",
    "startDivider": {
      "type": "DS",
      "label": "DS 10 (NC) BUA-KLDB HU",
      "km": "KM 17+900"
    },
    "endDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ KM 18+800)",
      "km": "KM 18+800"
    }
  },
  {
    "id": "naspan_8b_bua_kldb_hu",
    "code": "NASPAN 8B BUA-KLDB HU",
    "title": "NASPAN 8B BUA-KLDB HU (Jalur Hulu, AJ KM 18+800 s/d AJ KM 19+300)",
    "km": "KM 18+800 - KM 19+300",
    "category": "TIKUNGAN LOOP BUA-KLDB",
    "d": "M 3098.5 860.2 L 3112.1 860.5 L 3143.5 893.0 L 3143.4 1252.0 L 3101.6 1295.6 L 3046.3 1295.6",
    "color": "#ff0000",
    "startDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ KM 18+800)",
      "km": "KM 18+800"
    },
    "endDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ KM 19+300)",
      "km": "KM 19+300"
    }
  },
  {
    "id": "naspan_8b_kldb_cuk_hi",
    "code": "NASPAN 8B KLDB-CUK HI",
    "title": "NASPAN 8B KLDB-CUK HI (AJ KM 19+300 s/d DS 11 KM 20+150)",
    "km": "KM 19+300 - KM 20+150",
    "category": "PETAK KLDB-CUK",
    "d": "M 3046.7 1343.2 L 2824.4 1343",
    "color": "#f8d731",
    "startDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ KM 19+300)",
      "km": "KM 19+300"
    },
    "endDivider": {
      "type": "DS",
      "label": "DS 11 (NO) CUK-KLDB HI",
      "km": "KM 20+150"
    }
  },
  {
    "id": "naspan_8b_kldb_cuk_hu",
    "code": "NASPAN 8B KLDB-CUK HU",
    "title": "NASPAN 8B KLDB-CUK HU (AJ KM 19+300 s/d DS 12 KM 20+150)",
    "km": "KM 19+300 - KM 20+150",
    "category": "PETAK KLDB-CUK",
    "d": "M 3046.7 1295.3 L 2818.6 1295.3",
    "color": "#ff0000",
    "startDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ KM 19+300)",
      "km": "KM 19+300"
    },
    "endDivider": {
      "type": "DS",
      "label": "DS 12 (NO) KLDB-CUK HU",
      "km": "KM 20+150"
    }
  },
  {
    "id": "cuk_jalur_1_empl",
    "code": "NASPAN 9 CUK JL 1 HU",
    "title": "ST. CAKUNG (Emplasemen Jalur 1 Hulu)",
    "km": "KM 20+150 - KM 21+400",
    "category": "ST. CAKUNG",
    "d": "M 2342 1293 L 2806.7 1293",
    "color": "#8a6ddd",
    "startDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS KM 20+150)",
      "km": "KM 20+150"
    },
    "endDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS KM 21+400)",
      "km": "KM 21+400"
    }
  },
  {
    "id": "cuk_jalur_1_peron",
    "code": "NASPAN 9 CUK JL 1 PERON",
    "title": "ST. CAKUNG (Jalur 1)",
    "km": "KM 20+900 - KM 21+000",
    "category": "ST. CAKUNG",
    "d": "M 2414.9 1294.6 L 2453.3 1252.9 L 2583 1252.9 L 2616.9 1295",
    "color": "#8a6ddd",
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W13A (Jalur 2 Cakung)",
      "km": "KM 21+360"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "Wesel W11B (Jalur 2 Cakung)",
      "km": "KM 20+762"
    }
  },
  {
    "id": "cuk_jalur_4_empl",
    "code": "NASPAN 9 CUK JL 4 HI",
    "title": "ST. CAKUNG (Emplasemen Jalur 4 Hilir)",
    "km": "KM 20+150 - KM 21+400",
    "category": "ST. CAKUNG",
    "d": "M 2343.3 1342.8 L 2811.4 1342.8",
    "color": "#cc6827",
    "startDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS KM 20+150)",
      "km": "KM 20+150"
    },
    "endDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS KM 21+400)",
      "km": "KM 21+400"
    }
  },
  {
    "id": "cuk_jalur_4_peron",
    "code": "NASPAN 9 CUK JL 4 PERON",
    "title": "ST. CAKUNG (Jalur 4)",
    "km": "KM 20+900 - KM 21+000",
    "category": "ST. CAKUNG",
    "d": "M 2414.9 1342.8 L 2452.2 1384.7 L 2583 1384.7 L 2616.9 1342.9",
    "color": "#cc6827",
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W23A (Jalur 3 Cakung)",
      "km": "KM 21+360"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "Wesel W21B (Jalur 3 Cakung)",
      "km": "KM 20+762"
    }
  },
  {
    "id": "naspan_10_cuk_kri_hu",
    "code": "NASPAN 10 CUK-KRI HU",
    "title": "NASPAN 10 CUK-KRI HU (DS 14 s/d AJ KM 22+700)",
    "km": "KM 21+400 - KM 22+700",
    "category": "PETAK CUK-KRI",
    "d": "M 2217.3 1293 L 2330.6 1293",
    "color": "#8a6ddd",
    "startDivider": {
      "type": "DS",
      "label": "DS 14 (NC) CUK-KRI HU",
      "km": "KM 21+400"
    },
    "endDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ KM 22+700)",
      "km": "KM 22+700"
    }
  },
  {
    "id": "naspan_11_cuk_kri_hu",
    "code": "NASPAN 11 CUK-KRI HU",
    "title": "NASPAN 11 CUK-KRI HU (AJ KM 22+700 s/d DS 16 KM 23+600)",
    "km": "KM 22+700 - KM 23+600",
    "category": "PETAK CUK-KRI",
    "d": "M 2071.8 1292.8 L 2205.4 1292.8",
    "color": "#8a6ddd",
    "startDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ KM 22+700)",
      "km": "KM 22+700"
    },
    "endDivider": {
      "type": "DS",
      "label": "DS 16 (NC) KM 23+600",
      "km": "KM 23+600"
    }
  },
  {
    "id": "naspan_12_kri_bks_hu",
    "code": "NASPAN 12 KRI-BKS HU",
    "title": "NASPAN 12 KRI-BKS HU (DS 16 s/d AJ KM 24+500)",
    "km": "KM 23+600 - KM 24+500",
    "category": "PETAK KRI-BKS",
    "d": "M 1824.3 1294 L 2060.8 1294",
    "color": "#ff00ff",
    "startDivider": {
      "type": "DS",
      "label": "DS 16 KM 23+600",
      "km": "KM 23+600"
    },
    "endDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ KM 24+500)",
      "km": "KM 24+500"
    }
  },
  {
    "id": "naspan_13_kri_bks_hu",
    "code": "NASPAN 13 KRI-BKS HU",
    "title": "NASPAN 13 KRI-BKS HU (AJ KM 24+500 s/d AJ KM 25+000)",
    "km": "KM 24+500 - KM 25+000",
    "category": "PETAK KRI-BKS",
    "d": "M 1754 1293.8 L 1809.6 1293.8",
    "color": "#ff00ff",
    "startDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ KM 24+500)",
      "km": "KM 24+500"
    },
    "endDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ KM 25+000)",
      "km": "KM 25+000"
    }
  },
  {
    "id": "naspan_13b_kri_bks_hu",
    "code": "NASPAN 13B KRI-BKS HU",
    "title": "NASPAN 13B KRI-BKS HU (AJ KM 25+000 s/d AS KM 25+750)",
    "km": "KM 25+000 - KM 25+750",
    "category": "PETAK KRI-BKS",
    "d": "M 1641.5 1293.8 L 1740.5 1293.8",
    "color": "#ff00ff",
    "startDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ KM 25+000)",
      "km": "KM 25+000"
    },
    "endDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS KM 25+750)",
      "km": "KM 25+750"
    }
  },
  {
    "id": "naspan_10_cuk_kri_hi",
    "code": "NASPAN 10 CUK-KRI HI",
    "title": "NASPAN 10 CUK-KRI HI (DS 13 s/d AJ KM 22+700)",
    "km": "KM 21+400 - KM 22+700",
    "category": "PETAK CUK-KRI",
    "d": "M 2221 1342.8 L 2331.4 1342.8",
    "color": "#cc6827",
    "startDivider": {
      "type": "DS",
      "label": "DS 13 (NC) KRI-CUK HI",
      "km": "KM 21+400"
    },
    "endDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ KM 22+700)",
      "km": "KM 22+700"
    }
  },
  {
    "id": "naspan_11_cuk_kri_hi",
    "code": "NASPAN 11 CUK-KRI HI",
    "title": "NASPAN 11 CUK-KRI HI (AJ KM 22+700 s/d DS 15 KM 23+600)",
    "km": "KM 22+700 - KM 23+600",
    "category": "PETAK CUK-KRI",
    "d": "M 2065.5 1342.8 L 2207 1342.8",
    "color": "#cc6827",
    "startDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ KM 22+700)",
      "km": "KM 22+700"
    },
    "endDivider": {
      "type": "DS",
      "label": "DS 15 (NC) KM 23+600",
      "km": "KM 23+600"
    }
  },
  {
    "id": "naspan_12_kri_bks_hi",
    "code": "NASPAN 12 KRI-BKS HI",
    "title": "NASPAN 12 KRI-BKS HI (DS 15 s/d AJ KM 24+500)",
    "km": "KM 23+600 - KM 24+500",
    "category": "PETAK KRI-BKS",
    "d": "M 1751.6 1342.4 L 2050.8 1342.4",
    "color": "#00bfff",
    "startDivider": {
      "type": "DS",
      "label": "DS 15 KM 23+600",
      "km": "KM 23+600"
    },
    "endDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ KM 24+500)",
      "km": "KM 24+500"
    }
  },
  {
    "id": "naspan_13_kri_bks_hi",
    "code": "NASPAN 13 KRI-BKS HI",
    "title": "NASPAN 13 KRI-BKS HI (AJ KM 24+500 s/d AS KM 25+750)",
    "km": "KM 24+500 - KM 25+750",
    "category": "PETAK KRI-BKS",
    "d": "M 1638.8 1343.6 L 1739.6 1343.6",
    "color": "#00bfff",
    "startDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ KM 25+300)",
      "km": "KM 25+300"
    },
    "endDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS KM 25+750)",
      "km": "KM 25+750"
    }
  },
  {
    "id": "bks_jalur_simpan_960",
    "code": "ST. BEKASI JL 8",
    "title": "ST. BEKASI (Jalur 8)",
    "km": "KM 26+200 - KM 26+500",
    "category": "ST. BEKASI (STABLING)",
    "d": "M 934 1190.9 L 1256.6 1190.9 L 1319.3 1266.7",
    "color": "#139a47",
    "startDivider": {
      "type": "DEAD_END",
      "label": "Ujung Jalur 8 (Barat)",
      "km": "KM 26+500"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "Wesel W71C (Percabangan Jalur 7/6)",
      "km": "KM 26+200"
    }
  },
  {
    "id": "bks_jalur_simpan_1012",
    "code": "ST. BEKASI JL 4 LANGSIR",
    "title": "ST. BEKASI (Jalur 4 Langsir & Stabling)",
    "km": "KM 26+150 - KM 26+500",
    "category": "ST. BEKASI (STABLING)",
    "d": "M 838.4 1242.4 L 1299.2 1242.4",
    "color": "#139a47",
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W71C1",
      "km": "KM 26+150"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "FRP-JNG-26-73",
      "km": "KM 26+500"
    }
  },
  {
    "id": "bks_jalur_1_end",
    "code": "PETAK BKS-BKT",
    "title": "BKS-BKT (Jalur Hulu)",
    "km": "KM 26+800 - KM 27+200",
    "category": "PETAK BKS-BKT",
    "d": "M 370.4 1458.6 L 460.4 1294.6 L 592.6 1294.6",
    "color": "#139a47",
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W73 / W13C (KM 26+800)",
      "km": "KM 26+800"
    },
    "endDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS KM 26+900)",
      "km": "KM 26+900"
    }
  },
  {
    "id": "bks_jalur_1_platform",
    "code": "ST. BEKASI JL 1 HU",
    "title": "ST. BEKASI (Jalur 1 Peron Utama Hulu)",
    "km": "KM 25+750 - KM 26+900",
    "category": "ST. BEKASI",
    "d": "M 605.9 1294.6 L 1626.3 1294.6",
    "color": "#139a47",
    "startDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS KM 26+900)",
      "km": "KM 26+900"
    },
    "endDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS KM 25+750)",
      "km": "KM 25+750"
    }
  },
  {
    "id": "bks_jalur_2_west",
    "code": "PETAK BKT-BKS",
    "title": "BKT-BKS (Jalur Hilir)",
    "km": "KM 26+800 - KM 27+200",
    "category": "PETAK BKT-BKS",
    "d": "M 442.6 1458.4 L 505 1343.4 L 592.1 1343.4",
    "color": "#ec1f24",
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W53 / W13B1 (KM 26+800)",
      "km": "KM 26+800"
    },
    "endDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS KM 26+900)",
      "km": "KM 26+900"
    }
  },
  {
    "id": "bks_jalur_2_platform",
    "code": "ST. BEKASI JL 2 HI",
    "title": "ST. BEKASI (Jalur 2 Peron Utama Hilir)",
    "km": "KM 25+750 - KM 26+900",
    "category": "ST. BEKASI",
    "d": "M 603.8 1343.4 L 1625.3 1343.4",
    "color": "#ff0000",
    "startDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS KM 26+900)",
      "km": "KM 26+900"
    },
    "endDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS KM 25+750)",
      "km": "KM 25+750"
    }
  },
  {
    "id": "bks_jalur_3_platform",
    "code": "ST. BEKASI JL 3",
    "title": "ST. BEKASI (Jalur 3 Peron)",
    "km": "KM 26+150 - KM 26+600",
    "category": "ST. BEKASI",
    "d": "M 737.6 1404.8 L 1372 1404.8",
    "color": "#ec1f24",
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W31B",
      "km": "KM 26+150"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "Wesel W33A",
      "km": "KM 26+600"
    }
  },
  {
    "id": "bks_timur_1228_grn",
    "code": "BEKASI TIMUR 1",
    "title": "Emplasemen Percabangan Bekasi Timur 1",
    "km": "KM 27+000 - KM 27+300",
    "category": "BEKASI TIMUR",
    "d": "M 260.3 1458.6 L 399.2 1458.6",
    "color": "#139a47",
    "startDivider": {
      "type": "KM",
      "label": "KM 27+300",
      "km": "KM 27+300"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "Wesel W13C",
      "km": "KM 27+000"
    }
  },
  {
    "id": "bks_timur_1228_red",
    "code": "BEKASI TIMUR 2",
    "title": "Emplasemen Percabangan Bekasi Timur 2",
    "km": "KM 26+900 - KM 27+000",
    "category": "BEKASI TIMUR",
    "d": "M 404.9 1458.6 L 485.6 1458.6",
    "color": "#ec1f24",
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W13C",
      "km": "KM 27+000"
    },
    "endDivider": {
      "type": "KM",
      "label": "KM 26+900",
      "km": "KM 26+900"
    }
  },
  {
    "id": "bks_timur_1277_red",
    "code": "BEKASI TIMUR 3 (HI)",
    "title": "Emplasemen Percabangan Bekasi Timur 3 (Hilir)",
    "km": "KM 26+900 - KM 27+300",
    "category": "BEKASI TIMUR",
    "d": "M 260.3 1508.3 L 485.6 1508.3",
    "color": "#ec1f24",
    "startDivider": {
      "type": "KM",
      "label": "KM 27+300",
      "km": "KM 27+300"
    },
    "endDivider": {
      "type": "KM",
      "label": "KM 26+900",
      "km": "KM 26+900"
    }
  },
  {
    "id": "wesel_w81a1_654",
    "code": "WESEL W81A1",
    "title": "Wesel W81A1 (KM 11+292)",
    "km": "KM 11+292",
    "category": "ST. JATINEGARA (EMPLASEMEN BARAT)",
    "d": "M 654.3 527.6 L 668.2 538.8",
    "color": "#139a47",
    "isCrossing": true,
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W81A1",
      "km": "KM 11+292"
    },
    "endDivider": {
      "type": "FRP",
      "label": "( Section Insulator (FRP-JNG-08-81A1) )",
      "km": "KM 11+350"
    }
  },
  {
    "id": "wesel_w81a2_713",
    "code": "WESEL W81A2",
    "title": "Wesel W81A2 (KM 11+448)",
    "km": "KM 11+448",
    "category": "ST. JATINEGARA (EMPLASEMEN BARAT)",
    "d": "M 713.7 527.6 L 699.5 538.9",
    "color": "#139a47",
    "isCrossing": true,
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W81A2",
      "km": "KM 11+448"
    },
    "endDivider": {
      "type": "FRP",
      "label": "( Section Insulator (FRP-JNG-09-81A2) )",
      "km": "KM 11+350"
    }
  },
  {
    "id": "wesel_w61a2_672",
    "code": "WESEL W61A2",
    "title": "Wesel Crossover W61A2 / W81A (KM 11+350)",
    "km": "KM 11+350",
    "category": "ST. JATINEGARA (EMPLASEMEN BARAT)",
    "d": "M 672.4 542.1 L 713.7 575",
    "color": "#cc6827",
    "isCrossing": true,
    "startDivider": {
      "type": "FRP",
      "label": "( Section Insulator (FRP-JNG-08-81A1) )",
      "km": "KM 11+350"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "Wesel W61A2",
      "km": "KM 11+448"
    }
  },
  {
    "id": "wesel_w61a1_695",
    "code": "WESEL W61A1",
    "title": "Wesel Crossover W61A1 / W81A (KM 11+350)",
    "km": "KM 11+350",
    "category": "ST. JATINEGARA (EMPLASEMEN BARAT)",
    "d": "M 695.3 542.2 L 654.3 575",
    "color": "#cc6827",
    "isCrossing": true,
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W61A1",
      "km": "KM 11+292"
    },
    "endDivider": {
      "type": "FRP",
      "label": "( Section Insulator (FRP-JNG-09-81A2) )",
      "km": "KM 11+350"
    }
  },
  {
    "id": "wesel_w61b_772",
    "code": "WESEL W61B",
    "title": "Wesel W61B ke FRP-JNG-07-21C1 (KM 11+448)",
    "km": "KM 11+448",
    "category": "ST. JATINEGARA (EMPLASEMEN BARAT)",
    "d": "M 772 575 L 818.2 622.5",
    "color": "#cc6827",
    "isCrossing": true
  },
  {
    "id": "wesel_w61c_1038",
    "code": "WESEL W61C",
    "title": "Wesel W61C ke FRP-JNG-06-41B (KM 11+500)",
    "km": "KM 11+500",
    "category": "ST. JATINEGARA (EMPLASEMEN BARAT)",
    "d": "M 1038.3 622.6 L 1020.8 643",
    "color": "#cc6827",
    "isCrossing": true
  },
  {
    "id": "wesel_w41b_1017",
    "code": "WESEL W41B",
    "title": "Wesel W41B ke Jalur 4 (KM 11+520)",
    "km": "KM 11+520",
    "category": "ST. JATINEGARA (EMPLASEMEN BARAT)",
    "d": "M 1017 647.4 L 997.6 670.2",
    "color": "#cc6827",
    "isCrossing": true
  },
  {
    "id": "wesel_w21c1_821",
    "code": "WESEL W21C1",
    "title": "Wesel FRP-JNG-07-21C1 ke W21C1 (KM 11+500)",
    "km": "KM 11+500",
    "category": "ST. JATINEGARA (EMPLASEMEN BARAT)",
    "d": "M 821.9 626.4 L 864.3 669.9",
    "color": "#cc6827",
    "isCrossing": true
  },
  {
    "id": "wesel_w21a2_752",
    "code": "WESEL W21A2",
    "title": "Wesel W21A2 ke Jalur 3 W11B1 (KM 11+600)",
    "km": "KM 11+600",
    "category": "ST. JATINEGARA (EMPLASEMEN BARAT)",
    "d": "M 752.3 716.8 L 720.4 762.8",
    "color": "#cc6827",
    "isCrossing": true
  },
  {
    "id": "wesel_w11a_677",
    "code": "WESEL W11A (JNG)",
    "title": "Wesel Crossover W11A ke FRP-JNG-02-11A (KM 11+500)",
    "km": "KM 11+500",
    "category": "ST. JATINEGARA (EMPLASEMEN BARAT)",
    "d": "M 677.4 762.8 L 659.4 783.7",
    "color": "#cc6827",
    "isCrossing": true
  },
  {
    "id": "wesel_w11a_655",
    "code": "WESEL W11A/W31A2 (JNG)",
    "title": "Wesel Crossover W11A / W31A2 ke Jalur 2 Barat (KM 11+500)",
    "km": "KM 11+500",
    "category": "ST. JATINEGARA (EMPLASEMEN BARAT)",
    "d": "M 655.5 787.9 L 634.4 813.3",
    "color": "#f8d731",
    "isCrossing": true
  },
  {
    "id": "wesel_w31a1_593",
    "code": "WESEL W31A1",
    "title": "Wesel Crossover W31A1 ke FRP-JNG-01-31A1 (KM 11+350)",
    "km": "KM 11+350",
    "category": "ST. JATINEGARA (EMPLASEMEN BARAT)",
    "d": "M 593.4 813.3 L 575.9 833.6",
    "color": "#f8d731",
    "isCrossing": true
  },
  {
    "id": "wesel_w51a_571",
    "code": "WESEL W51A (JNG)",
    "title": "Wesel Crossover W51A ke Jalur 1 Barat (KM 11+300)",
    "km": "KM 11+300",
    "category": "ST. JATINEGARA (EMPLASEMEN BARAT)",
    "d": "M 571.2 838.8 L 552.8 860.7",
    "color": "#ff00ff",
    "isCrossing": true
  },
  {
    "id": "titik_wesel_w51a",
    "code": "Wesel W51A (JNG)",
    "title": "Wesel W51A (Jatinegara)",
    "km": "KM 1+935",
    "category": "TITIK WESEL",
    "cx": 552.8,
    "cy": 703.5,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 547.3 860.7 A 5.5 5.5 0 1 0 558.3 860.7 A 5.5 5.5 0 1 0 547.3 860.7",
    "hitD": "M 532.8 860.7 A 20 20 0 1 0 572.8 860.7 A 20 20 0 1 0 532.8 860.7",
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W51A",
      "km": "KM 1+935"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "Jalur 1 Track LAA",
      "km": "KM 1+935"
    }
  },
  {
    "id": "titik_wesel_w31a1",
    "code": "Wesel W31A1",
    "title": "Wesel W31A1",
    "km": "KM 1+995",
    "category": "TITIK WESEL",
    "cx": 593.4,
    "cy": 656.1,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 587.9 813.3 A 5.5 5.5 0 1 0 598.9 813.3 A 5.5 5.5 0 1 0 587.9 813.3",
    "hitD": "M 573.4 813.3 A 20 20 0 1 0 613.4 813.3 A 20 20 0 1 0 573.4 813.3",
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W31A1",
      "km": "KM 1+995"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "Jalur 2 Track LAA",
      "km": "KM 1+995"
    }
  },
  {
    "id": "titik_wesel_w31a2",
    "code": "Wesel W31A2",
    "title": "Wesel W31A2",
    "km": "KM 2+015",
    "category": "TITIK WESEL",
    "cx": 634.4,
    "cy": 656.1,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 628.9 813.3 A 5.5 5.5 0 1 0 639.9 813.3 A 5.5 5.5 0 1 0 628.9 813.3",
    "hitD": "M 614.4 813.3 A 20 20 0 1 0 654.4 813.3 A 20 20 0 1 0 614.4 813.3",
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W31A2",
      "km": "KM 2+015"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "Jalur 2 Track LAA",
      "km": "KM 2+015"
    }
  },
  {
    "id": "titik_wesel_w11a_mri",
    "code": "Wesel W11A (MRI)",
    "title": "Wesel W11A (Manggarai / Jatinegara)",
    "km": "KM 2+095",
    "category": "TITIK WESEL",
    "cx": 677.4,
    "cy": 605.6,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 671.9 762.8 A 5.5 5.5 0 1 0 682.9 762.8 A 5.5 5.5 0 1 0 671.9 762.8",
    "hitD": "M 657.4 762.8 A 20 20 0 1 0 697.4 762.8 A 20 20 0 1 0 657.4 762.8",
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W11A",
      "km": "KM 2+095"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "Jalur 3 Track LAA",
      "km": "KM 2+095"
    }
  },
  {
    "id": "titik_wesel_w11b1",
    "code": "Wesel W11B1",
    "title": "Wesel W11B1",
    "km": "KM 2+100",
    "category": "TITIK WESEL",
    "cx": 720.4,
    "cy": 605.6,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 714.9 762.8 A 5.5 5.5 0 1 0 725.9 762.8 A 5.5 5.5 0 1 0 714.9 762.8",
    "hitD": "M 700.4 762.8 A 20 20 0 1 0 740.4 762.8 A 20 20 0 1 0 700.4 762.8",
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W11B1",
      "km": "KM 2+100"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "Jalur 3 Track LAA",
      "km": "KM 2+100"
    }
  },
  {
    "id": "titik_wesel_w21a2",
    "code": "Wesel W21A2",
    "title": "Wesel W21A2",
    "km": "KM 2+157",
    "category": "TITIK WESEL",
    "cx": 752.3,
    "cy": 559.6,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 746.8 716.8 A 5.5 5.5 0 1 0 757.8 716.8 A 5.5 5.5 0 1 0 746.8 716.8",
    "hitD": "M 732.3 716.8 A 20 20 0 1 0 772.3 716.8 A 20 20 0 1 0 732.3 716.8",
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W21A2",
      "km": "KM 2+157"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "Jalur 4 Track LAA",
      "km": "KM 2+157"
    }
  },
  {
    "id": "titik_wesel_w31c1",
    "code": "Wesel W31C1",
    "title": "Wesel W31C1",
    "km": "KM 2+435",
    "category": "TITIK WESEL",
    "cx": 932.6,
    "cy": 656.1,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 927.1 813.3 A 5.5 5.5 0 1 0 938.1 813.3 A 5.5 5.5 0 1 0 927.1 813.3",
    "hitD": "M 912.6 813.3 A 20 20 0 1 0 952.6 813.3 A 20 20 0 1 0 912.6 813.3",
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W31C1",
      "km": "KM 2+435"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "Jalur 2 Track LAA",
      "km": "KM 2+435"
    }
  },
  {
    "id": "titik_wesel_w51d1",
    "code": "Wesel W51D1",
    "title": "Wesel W51D1",
    "km": "KM 2+435",
    "category": "TITIK WESEL",
    "cx": 932.6,
    "cy": 703.5,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 927.1 860.7 A 5.5 5.5 0 1 0 938.1 860.7 A 5.5 5.5 0 1 0 927.1 860.7",
    "hitD": "M 912.6 860.7 A 20 20 0 1 0 952.6 860.7 A 20 20 0 1 0 912.6 860.7",
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W51D1",
      "km": "KM 2+435"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "Jalur 1 Track LAA",
      "km": "KM 2+435"
    }
  },
  {
    "id": "titik_wesel_w31c2",
    "code": "Wesel W31C2",
    "title": "Wesel W31C2",
    "km": "KM 2+498",
    "category": "TITIK WESEL",
    "cx": 992,
    "cy": 656.1,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 986.5 813.3 A 5.5 5.5 0 1 0 997.5 813.3 A 5.5 5.5 0 1 0 986.5 813.3",
    "hitD": "M 972 813.3 A 20 20 0 1 0 1012 813.3 A 20 20 0 1 0 972 813.3",
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W31C2",
      "km": "KM 2+498"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "Jalur 2 Track LAA",
      "km": "KM 2+498"
    }
  },
  {
    "id": "titik_wesel_w51d2",
    "code": "Wesel W51D2",
    "title": "Wesel W51D2",
    "km": "KM 2+498",
    "category": "TITIK WESEL",
    "cx": 992,
    "cy": 703.5,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 986.5 860.7 A 5.5 5.5 0 1 0 997.5 860.7 A 5.5 5.5 0 1 0 986.5 860.7",
    "hitD": "M 972 860.7 A 20 20 0 1 0 1012 860.7 A 20 20 0 1 0 972 860.7",
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W51D2",
      "km": "KM 2+498"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "Jalur 1 Track LAA",
      "km": "KM 2+498"
    }
  },
  {
    "id": "titik_wesel_w81a1",
    "code": "Wesel W81A1",
    "title": "Wesel W81A1",
    "km": "KM 11+202",
    "category": "TITIK WESEL",
    "cx": 654.3,
    "cy": 370.4,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 648.8 527.6 A 5.5 5.5 0 1 0 659.8 527.6 A 5.5 5.5 0 1 0 648.8 527.6",
    "hitD": "M 634.3 527.6 A 20 20 0 1 0 674.3 527.6 A 20 20 0 1 0 634.3 527.6",
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W81A1",
      "km": "KM 11+202"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "Jalur 7 Track LAA",
      "km": "KM 11+202"
    }
  },
  {
    "id": "titik_wesel_w61a1",
    "code": "Wesel W61A1",
    "title": "Wesel W61A1",
    "km": "KM 11+202",
    "category": "TITIK WESEL",
    "cx": 654.3,
    "cy": 417.8,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 648.8 575 A 5.5 5.5 0 1 0 659.8 575 A 5.5 5.5 0 1 0 648.8 575",
    "hitD": "M 634.3 575 A 20 20 0 1 0 674.3 575 A 20 20 0 1 0 634.3 575",
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W61A1",
      "km": "KM 11+202"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "Jalur 6 Track LAA",
      "km": "KM 11+202"
    }
  },
  {
    "id": "titik_wesel_w81a2",
    "code": "Wesel W81A2",
    "title": "Wesel W81A2",
    "km": "KM 11+259",
    "category": "TITIK WESEL",
    "cx": 713.7,
    "cy": 370.4,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 708.2 527.6 A 5.5 5.5 0 1 0 719.2 527.6 A 5.5 5.5 0 1 0 708.2 527.6",
    "hitD": "M 693.7 527.6 A 20 20 0 1 0 733.7 527.6 A 20 20 0 1 0 693.7 527.6",
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W81A2",
      "km": "KM 11+259"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "Jalur 7 Track LAA",
      "km": "KM 11+259"
    }
  },
  {
    "id": "titik_wesel_w61a2",
    "code": "Wesel W61A2",
    "title": "Wesel W61A2",
    "km": "KM 11+259",
    "category": "TITIK WESEL",
    "cx": 713.7,
    "cy": 417.8,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 708.2 575 A 5.5 5.5 0 1 0 719.2 575 A 5.5 5.5 0 1 0 708.2 575",
    "hitD": "M 693.7 575 A 20 20 0 1 0 733.7 575 A 20 20 0 1 0 693.7 575",
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W61A2",
      "km": "KM 11+259"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "Jalur 6 Track LAA",
      "km": "KM 11+259"
    }
  },
  {
    "id": "titik_wesel_w61b",
    "code": "Wesel W61B",
    "title": "Wesel W61B",
    "km": "KM 11+264",
    "category": "TITIK WESEL",
    "cx": 772,
    "cy": 417.8,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 766.5 575 A 5.5 5.5 0 1 0 777.5 575 A 5.5 5.5 0 1 0 766.5 575",
    "hitD": "M 752 575 A 20 20 0 1 0 792 575 A 20 20 0 1 0 752 575",
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W61B",
      "km": "KM 11+264"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "Jalur 6 Track LAA",
      "km": "KM 11+264"
    }
  },
  {
    "id": "titik_wesel_w21c1",
    "code": "Wesel W21C1",
    "title": "Wesel W21C1",
    "km": "KM 11+521",
    "category": "TITIK WESEL",
    "cx": 864.3,
    "cy": 512.7,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 858.8 669.9 A 5.5 5.5 0 1 0 869.8 669.9 A 5.5 5.5 0 1 0 858.8 669.9",
    "hitD": "M 844.3 669.9 A 20 20 0 1 0 884.3 669.9 A 20 20 0 1 0 844.3 669.9",
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W21C1",
      "km": "KM 11+521"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "Jalur 4 Track LAA",
      "km": "KM 11+521"
    }
  },
  {
    "id": "titik_wesel_w21c2",
    "code": "Wesel W21C2",
    "title": "Wesel W21C2",
    "km": "KM 11+526",
    "category": "TITIK WESEL",
    "cx": 997.6,
    "cy": 513,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 992.1 670.2 A 5.5 5.5 0 1 0 1003.1 670.2 A 5.5 5.5 0 1 0 992.1 670.2",
    "hitD": "M 977.6 670.2 A 20 20 0 1 0 1017.6 670.2 A 20 20 0 1 0 977.6 670.2",
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W21C2",
      "km": "KM 11+526"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "Jalur 4 Track LAA",
      "km": "KM 11+526"
    }
  },
  {
    "id": "titik_wesel_w61c",
    "code": "Wesel W61C",
    "title": "Wesel W61C",
    "km": "KM 11+542",
    "category": "TITIK WESEL",
    "cx": 961.2,
    "cy": 417.8,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 955.7 575 A 5.5 5.5 0 1 0 966.7 575 A 5.5 5.5 0 1 0 955.7 575",
    "hitD": "M 941.2 575 A 20 20 0 1 0 981.2 575 A 20 20 0 1 0 941.2 575",
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W61C",
      "km": "KM 11+542"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "Jalur 6 Track LAA",
      "km": "KM 11+542"
    }
  },
  {
    "id": "titik_wesel_w81c",
    "code": "Wesel W81C",
    "title": "Wesel W81C",
    "km": "KM 11+542",
    "category": "TITIK WESEL",
    "cx": 959.8,
    "cy": 370.3,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 954.3 527.5 A 5.5 5.5 0 1 0 965.3 527.5 A 5.5 5.5 0 1 0 954.3 527.5",
    "hitD": "M 939.8 527.5 A 20 20 0 1 0 979.8 527.5 A 20 20 0 1 0 939.8 527.5",
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W81C",
      "km": "KM 11+542"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "Jalur 7 Track LAA",
      "km": "KM 11+542"
    }
  },
  {
    "id": "titik_wesel_w41b",
    "code": "Wesel W41B",
    "title": "Wesel W41B",
    "km": "KM 11+630",
    "category": "TITIK WESEL",
    "cx": 1038.3,
    "cy": 465.4,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 1032.8 622.6 A 5.5 5.5 0 1 0 1043.8 622.6 A 5.5 5.5 0 1 0 1032.8 622.6",
    "hitD": "M 1018.3 622.6 A 20 20 0 1 0 1058.3 622.6 A 20 20 0 1 0 1018.3 622.6",
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W41B",
      "km": "KM 11+630"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "Jalur 5 Track LAA",
      "km": "KM 11+630"
    }
  },
  {
    "id": "titik_wesel_w63a",
    "code": "Wesel W63A",
    "title": "Wesel W63A",
    "km": "KM 12+012",
    "category": "TITIK WESEL",
    "cx": 1483.8,
    "cy": 465.6,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 1478.3 622.8 A 5.5 5.5 0 1 0 1489.3 622.8 A 5.5 5.5 0 1 0 1478.3 622.8",
    "hitD": "M 1463.8 622.8 A 20 20 0 1 0 1503.8 622.8 A 20 20 0 1 0 1463.8 622.8",
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W63A",
      "km": "KM 12+012"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "Jalur 5 Track LAA",
      "km": "KM 12+012"
    }
  },
  {
    "id": "titik_wesel_w83a1",
    "code": "Wesel W83A1",
    "title": "Wesel W83A1",
    "km": "KM 12+057",
    "category": "TITIK WESEL",
    "cx": 1452.8,
    "cy": 370.5,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 1447.3 527.7 A 5.5 5.5 0 1 0 1458.3 527.7 A 5.5 5.5 0 1 0 1447.3 527.7",
    "hitD": "M 1432.8 527.7 A 20 20 0 1 0 1472.8 527.7 A 20 20 0 1 0 1432.8 527.7",
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W83A1",
      "km": "KM 12+057"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "Jalur 7 Track LAA",
      "km": "KM 12+057"
    }
  },
  {
    "id": "titik_wesel_w23b1",
    "code": "Wesel W23B1",
    "title": "Wesel W23B1",
    "km": "KM 12+086",
    "category": "TITIK WESEL",
    "cx": 1546,
    "cy": 560.5,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 1540.5 717.7 A 5.5 5.5 0 1 0 1551.5 717.7 A 5.5 5.5 0 1 0 1540.5 717.7",
    "hitD": "M 1526 717.7 A 20 20 0 1 0 1566 717.7 A 20 20 0 1 0 1526 717.7",
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W23B1",
      "km": "KM 12+086"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "Jalur 4 Track LAA",
      "km": "KM 12+086"
    }
  },
  {
    "id": "titik_wesel_w83a2",
    "code": "Wesel W83A2",
    "title": "Wesel W83A2",
    "km": "KM 12+057",
    "category": "TITIK WESEL",
    "cx": 1628.1,
    "cy": 512.7,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 1622.6 669.9 A 5.5 5.5 0 1 0 1633.6 669.9 A 5.5 5.5 0 1 0 1622.6 669.9",
    "hitD": "M 1608.1 669.9 A 20 20 0 1 0 1648.1 669.9 A 20 20 0 1 0 1608.1 669.9",
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W83A2",
      "km": "KM 12+057"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "Jalur 7 Track LAA",
      "km": "KM 12+057"
    }
  },
  {
    "id": "titik_wesel_w23b2",
    "code": "Wesel W23B2",
    "title": "Wesel W23B2",
    "km": "KM 12+102",
    "category": "TITIK WESEL",
    "cx": 1597.2,
    "cy": 560.9,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 1591.7 718.1 A 5.5 5.5 0 1 0 1602.7 718.1 A 5.5 5.5 0 1 0 1591.7 718.1",
    "hitD": "M 1577.2 718.1 A 20 20 0 1 0 1617.2 718.1 A 20 20 0 1 0 1577.2 718.1",
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W23B2",
      "km": "KM 12+102"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "Jalur 4 Track LAA",
      "km": "KM 12+102"
    }
  },
  {
    "id": "titik_wesel_w23c1",
    "code": "Wesel W23C1",
    "title": "Wesel W23C1",
    "km": "KM 12+156",
    "category": "TITIK WESEL",
    "cx": 1667.3,
    "cy": 560.5,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 1661.8 717.7 A 5.5 5.5 0 1 0 1672.8 717.7 A 5.5 5.5 0 1 0 1661.8 717.7",
    "hitD": "M 1647.3 717.7 A 20 20 0 1 0 1687.3 717.7 A 20 20 0 1 0 1647.3 717.7",
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W23C1",
      "km": "KM 12+156"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "Jalur W23C Track LAA",
      "km": "KM 12+156"
    }
  },
  {
    "id": "titik_wesel_w23c2",
    "code": "Wesel W23C2",
    "title": "Wesel W23C2",
    "km": "KM 12+181",
    "category": "TITIK WESEL",
    "cx": 1693.4,
    "cy": 560.9,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 1687.9 718.1 A 5.5 5.5 0 1 0 1698.9 718.1 A 5.5 5.5 0 1 0 1687.9 718.1",
    "hitD": "M 1673.4 718.1 A 20 20 0 1 0 1713.4 718.1 A 20 20 0 1 0 1673.4 718.1",
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W23C2",
      "km": "KM 12+181"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "Jalur W23C Track LAA",
      "km": "KM 12+181"
    }
  },
  {
    "id": "titik_wesel_w33a",
    "code": "Wesel W33A (JNG)",
    "title": "Wesel W33A (Jatinegara)",
    "km": "KM 12+045",
    "category": "TITIK WESEL",
    "cx": 1560.5,
    "cy": 655.9,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 1555 813.1 A 5.5 5.5 0 1 0 1566 813.1 A 5.5 5.5 0 1 0 1555 813.1",
    "hitD": "M 1540.5 813.1 A 20 20 0 1 0 1580.5 813.1 A 20 20 0 1 0 1540.5 813.1",
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W33A",
      "km": "KM 12+045"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "NASPAN 1 ARAH KLD HI",
      "km": "KM 12+045"
    }
  },
  {
    "id": "titik_wesel_w13b_jng",
    "code": "Wesel W13B",
    "title": "Wesel W13B",
    "km": "KM 12+110",
    "category": "TITIK WESEL",
    "cx": 1600.7,
    "cy": 607.9,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 1595.2 765.1 A 5.5 5.5 0 1 0 1606.2 765.1 A 5.5 5.5 0 1 0 1595.2 765.1",
    "hitD": "M 1580.7 765.1 A 20 20 0 1 0 1620.7 765.1 A 20 20 0 1 0 1580.7 765.1",
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W13B",
      "km": "KM 12+110"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "Jalur 3 Track LAA",
      "km": "KM 12+110"
    }
  },
  {
    "id": "titik_wesel_w13c1",
    "code": "Wesel W13C1",
    "title": "Wesel W13C1",
    "km": "KM 12+159",
    "category": "TITIK WESEL",
    "cx": 1638.4,
    "cy": 608,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 1632.9 765.2 A 5.5 5.5 0 1 0 1643.9 765.2 A 5.5 5.5 0 1 0 1632.9 765.2",
    "hitD": "M 1618.4 765.2 A 20 20 0 1 0 1658.4 765.2 A 20 20 0 1 0 1618.4 765.2",
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W13C1",
      "km": "KM 12+159"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "Jalur 3 Track LAA",
      "km": "KM 12+159"
    }
  },
  {
    "id": "titik_wesel_w33b1",
    "code": "Wesel W33B1",
    "title": "Wesel W33B1",
    "km": "KM 12+245",
    "category": "TITIK WESEL",
    "cx": 1708.7,
    "cy": 655.8,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 1703.2 813 A 5.5 5.5 0 1 0 1714.2 813 A 5.5 5.5 0 1 0 1703.2 813",
    "hitD": "M 1688.7 813 A 20 20 0 1 0 1728.7 813 A 20 20 0 1 0 1688.7 813",
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W33B1",
      "km": "KM 12+245"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "NASPAN 1 ARAH KLD HI",
      "km": "KM 12+245"
    }
  },
  {
    "id": "titik_wesel_w13c2",
    "code": "Wesel W13C2",
    "title": "Wesel W13C2",
    "km": "KM 12+170",
    "category": "TITIK WESEL",
    "cx": 1667,
    "cy": 608,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 1661.5 765.2 A 5.5 5.5 0 1 0 1672.5 765.2 A 5.5 5.5 0 1 0 1661.5 765.2",
    "hitD": "M 1647 765.2 A 20 20 0 1 0 1687 765.2 A 20 20 0 1 0 1647 765.2",
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W13C2",
      "km": "KM 12+170"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "Jalur 3 Track LAA",
      "km": "KM 12+170"
    }
  },
  {
    "id": "titik_wesel_w13d1",
    "code": "Wesel W13D1",
    "title": "Wesel W13D1",
    "km": "KM 12+250",
    "category": "TITIK WESEL",
    "cx": 1734.8,
    "cy": 608.1,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 1729.3 765.3 A 5.5 5.5 0 1 0 1740.3 765.3 A 5.5 5.5 0 1 0 1729.3 765.3",
    "hitD": "M 1714.8 765.3 A 20 20 0 1 0 1754.8 765.3 A 20 20 0 1 0 1714.8 765.3",
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W13D1",
      "km": "KM 12+250"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "Jalur 3 Track LAA",
      "km": "KM 12+250"
    }
  },
  {
    "id": "titik_wesel_w13d2",
    "code": "Wesel W13D2",
    "title": "Wesel W13D2",
    "km": "KM 12+278",
    "category": "TITIK WESEL",
    "cx": 1750.1,
    "cy": 608.1,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 1744.6 765.3 A 5.5 5.5 0 1 0 1755.6 765.3 A 5.5 5.5 0 1 0 1744.6 765.3",
    "hitD": "M 1730.1 765.3 A 20 20 0 1 0 1770.1 765.3 A 20 20 0 1 0 1730.1 765.3",
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W13D2",
      "km": "KM 12+278"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "Jalur 3 Track LAA",
      "km": "KM 12+278"
    }
  },
  {
    "id": "titik_wesel_w33b2",
    "code": "Wesel W33B2",
    "title": "Wesel W33B2",
    "km": "KM 12+250",
    "category": "TITIK WESEL",
    "cx": 1750.7,
    "cy": 655.8,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 1745.2 813 A 5.5 5.5 0 1 0 1756.2 813 A 5.5 5.5 0 1 0 1745.2 813",
    "hitD": "M 1730.7 813 A 20 20 0 1 0 1770.7 813 A 20 20 0 1 0 1730.7 813",
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W33B2",
      "km": "KM 12+250"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "NASPAN 1 ARAH KLD HI",
      "km": "KM 12+250"
    }
  },
  {
    "id": "titik_wesel_w33c1",
    "code": "Wesel W33C1",
    "title": "Wesel W33C1",
    "km": "KM 12+346",
    "category": "TITIK WESEL",
    "cx": 1791.9,
    "cy": 655.8,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 1786.4 813 A 5.5 5.5 0 1 0 1797.4 813 A 5.5 5.5 0 1 0 1786.4 813",
    "hitD": "M 1771.9 813 A 20 20 0 1 0 1811.9 813 A 20 20 0 1 0 1771.9 813",
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W33C1",
      "km": "KM 12+346"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "NASPAN 1 ARAH KLD HI",
      "km": "KM 12+346"
    }
  },
  {
    "id": "titik_wesel_w53b",
    "code": "Wesel W53B",
    "title": "Wesel W53B",
    "km": "KM 12+335",
    "category": "TITIK WESEL",
    "cx": 1791.9,
    "cy": 703.9,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 1786.4 861.1 A 5.5 5.5 0 1 0 1797.4 861.1 A 5.5 5.5 0 1 0 1786.4 861.1",
    "hitD": "M 1771.9 861.1 A 20 20 0 1 0 1811.9 861.1 A 20 20 0 1 0 1771.9 861.1",
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W53B",
      "km": "KM 12+335"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "NASPAN 1 ARAH KLD HU",
      "km": "KM 12+335"
    }
  },
  {
    "id": "titik_wesel_w33c2",
    "code": "Wesel W33C2",
    "title": "Wesel W33C2",
    "km": "KM 12+415",
    "category": "TITIK WESEL",
    "cx": 1834.7,
    "cy": 655.8,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 1829.2 813 A 5.5 5.5 0 1 0 1840.2 813 A 5.5 5.5 0 1 0 1829.2 813",
    "hitD": "M 1814.7 813 A 20 20 0 1 0 1854.7 813 A 20 20 0 1 0 1814.7 813",
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W33C2",
      "km": "KM 12+415"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "NASPAN 1 ARAH KLD HI",
      "km": "KM 12+415"
    }
  },
  {
    "id": "titik_wesel_w53c",
    "code": "Wesel W53C",
    "title": "Wesel W53C",
    "km": "KM 12+473",
    "category": "TITIK WESEL",
    "cx": 1876.4,
    "cy": 703.9,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 1870.9 861.1 A 5.5 5.5 0 1 0 1881.9 861.1 A 5.5 5.5 0 1 0 1870.9 861.1",
    "hitD": "M 1856.4 861.1 A 20 20 0 1 0 1896.4 861.1 A 20 20 0 1 0 1856.4 861.1",
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W53C",
      "km": "KM 12+473"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "NASPAN 1 ARAH KLD HU",
      "km": "KM 12+473"
    }
  },
  {
    "id": "titik_wesel_w21a_cuk",
    "code": "Wesel W21A",
    "title": "Wesel W21A",
    "km": "KM 20+687",
    "category": "TITIK WESEL",
    "cx": 2667.5,
    "cy": 1112.9,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 2662 1270.1 A 5.5 5.5 0 1 0 2673 1270.1 A 5.5 5.5 0 1 0 2662 1270.1",
    "hitD": "M 2647.5 1270.1 A 20 20 0 1 0 2687.5 1270.1 A 20 20 0 1 0 2647.5 1270.1",
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W21A",
      "km": "KM 20+687"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "Jalur 3 Track LAA",
      "km": "KM 20+687"
    }
  },
  {
    "id": "titik_wesel_w11a_cuk",
    "code": "Wesel W11A (CUK)",
    "title": "Wesel W11A (Cakung)",
    "km": "KM 20+740",
    "category": "TITIK WESEL",
    "cx": 2628.6,
    "cy": 1065,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 2623.1 1222.2 A 5.5 5.5 0 1 0 2634.1 1222.2 A 5.5 5.5 0 1 0 2623.1 1222.2",
    "hitD": "M 2608.6 1222.2 A 20 20 0 1 0 2648.6 1222.2 A 20 20 0 1 0 2608.6 1222.2",
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W11A",
      "km": "KM 20+740"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "Jalur 2 Track LAA",
      "km": "KM 20+740"
    }
  },
  {
    "id": "titik_wesel_w21b_cuk",
    "code": "Wesel W21B",
    "title": "Wesel W21B",
    "km": "KM 20+762",
    "category": "TITIK WESEL",
    "cx": 2617.7,
    "cy": 1112.9,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 2612.2 1270.1 A 5.5 5.5 0 1 0 2623.2 1270.1 A 5.5 5.5 0 1 0 2612.2 1270.1",
    "hitD": "M 2597.7 1270.1 A 20 20 0 1 0 2637.7 1270.1 A 20 20 0 1 0 2597.7 1270.1",
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W21B",
      "km": "KM 20+762"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "Jalur 3 Track LAA",
      "km": "KM 20+762"
    }
  },
  {
    "id": "titik_wesel_w11b_cuk",
    "code": "Wesel W11B",
    "title": "Wesel W11B",
    "km": "KM 20+762",
    "category": "TITIK WESEL",
    "cx": 2617.7,
    "cy": 1065,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 2612.2 1222.2 A 5.5 5.5 0 1 0 2623.2 1222.2 A 5.5 5.5 0 1 0 2612.2 1222.2",
    "hitD": "M 2597.7 1222.2 A 20 20 0 1 0 2637.7 1222.2 A 20 20 0 1 0 2597.7 1222.2",
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W11B",
      "km": "KM 20+762"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "Jalur 2 Track LAA",
      "km": "KM 20+762"
    }
  },
  {
    "id": "titik_wesel_w23a_cuk",
    "code": "Wesel W23A",
    "title": "Wesel W23A",
    "km": "KM 21+360",
    "category": "TITIK WESEL",
    "cx": 2415.7,
    "cy": 1112.8,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 2410.2 1270 A 5.5 5.5 0 1 0 2421.2 1270 A 5.5 5.5 0 1 0 2410.2 1270",
    "hitD": "M 2395.7 1270 A 20 20 0 1 0 2435.7 1270 A 20 20 0 1 0 2395.7 1270",
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W23A",
      "km": "KM 21+360"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "Jalur 3 Track LAA",
      "km": "KM 21+360"
    }
  },
  {
    "id": "titik_wesel_w13a_cuk",
    "code": "Wesel W13A",
    "title": "Wesel W13A",
    "km": "KM 21+360",
    "category": "TITIK WESEL",
    "cx": 2415.7,
    "cy": 1064.5,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 2410.2 1221.7 A 5.5 5.5 0 1 0 2421.2 1221.7 A 5.5 5.5 0 1 0 2410.2 1221.7",
    "hitD": "M 2395.7 1221.7 A 20 20 0 1 0 2435.7 1221.7 A 20 20 0 1 0 2395.7 1221.7",
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W13A",
      "km": "KM 21+360"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "Jalur 2 Track LAA",
      "km": "KM 21+360"
    }
  },
  {
    "id": "titik_wesel_w13b_cuk",
    "code": "Wesel W13B (CUK)",
    "title": "Wesel W13B (Cakung)",
    "km": "KM 21+387",
    "category": "TITIK WESEL",
    "cx": 2407.1,
    "cy": 1064.6,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 2401.6 1221.8 A 5.5 5.5 0 1 0 2412.6 1221.8 A 5.5 5.5 0 1 0 2401.6 1221.8",
    "hitD": "M 2387.1 1221.8 A 20 20 0 1 0 2427.1 1221.8 A 20 20 0 1 0 2387.1 1221.8",
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W13B",
      "km": "KM 21+387"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "Jalur 2 Track LAA",
      "km": "KM 21+387"
    }
  },
  {
    "id": "titik_wesel_w23b_cuk",
    "code": "Wesel W23B",
    "title": "Wesel W23B",
    "km": "KM 21+445",
    "category": "TITIK WESEL",
    "cx": 2366.8,
    "cy": 1112.8,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 2361.3 1270 A 5.5 5.5 0 1 0 2372.3 1270 A 5.5 5.5 0 1 0 2361.3 1270",
    "hitD": "M 2346.8 1270 A 20 20 0 1 0 2386.8 1270 A 20 20 0 1 0 2346.8 1270",
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W23B",
      "km": "KM 21+445"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "Jalur 3 Track LAA",
      "km": "KM 21+445"
    }
  },
  {
    "id": "titik_wesel_w51a_bks",
    "code": "Wesel W51A (BKS)",
    "title": "Wesel W51A (Bekasi)",
    "km": "KM 25+946",
    "category": "TITIK WESEL",
    "cx": 1547.1,
    "cy": 1112.8,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 1541.6 1270 A 5.5 5.5 0 1 0 1552.6 1270 A 5.5 5.5 0 1 0 1541.6 1270",
    "hitD": "M 1527.1 1270 A 20 20 0 1 0 1567.1 1270 A 20 20 0 1 0 1527.1 1270",
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W51A",
      "km": "KM 25+946"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "Jalur 5 Track LAA",
      "km": "KM 25+946"
    }
  },
  {
    "id": "titik_wesel_w71a_bks",
    "code": "Wesel W71A",
    "title": "Wesel W71A",
    "km": "KM 26+007",
    "category": "TITIK WESEL",
    "cx": 1505.1,
    "cy": 1063,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 1499.6 1220.2 A 5.5 5.5 0 1 0 1510.6 1220.2 A 5.5 5.5 0 1 0 1499.6 1220.2",
    "hitD": "M 1485.1 1220.2 A 20 20 0 1 0 1525.1 1220.2 A 20 20 0 1 0 1485.1 1220.2",
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W71A",
      "km": "KM 26+007"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "Jalur 6 Track LAA",
      "km": "KM 26+007"
    }
  },
  {
    "id": "titik_wesel_w71b_bks",
    "code": "Wesel W71B",
    "title": "Wesel W71B",
    "km": "KM 26+101",
    "category": "TITIK WESEL",
    "cx": 1474.7,
    "cy": 1063.3,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 1469.2 1220.5 A 5.5 5.5 0 1 0 1480.2 1220.5 A 5.5 5.5 0 1 0 1469.2 1220.5",
    "hitD": "M 1454.7 1220.5 A 20 20 0 1 0 1494.7 1220.5 A 20 20 0 1 0 1454.7 1220.5",
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W71B",
      "km": "KM 26+101"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "Jalur 6 Track LAA",
      "km": "KM 26+101"
    }
  },
  {
    "id": "titik_wesel_w51b_bks",
    "code": "Wesel W51B",
    "title": "Wesel W51B",
    "km": "KM 26+165",
    "category": "TITIK WESEL",
    "cx": 1431.2,
    "cy": 1113,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 1425.7 1270.2 A 5.5 5.5 0 1 0 1436.7 1270.2 A 5.5 5.5 0 1 0 1425.7 1270.2",
    "hitD": "M 1411.2 1270.2 A 20 20 0 1 0 1451.2 1270.2 A 20 20 0 1 0 1411.2 1270.2",
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W51B",
      "km": "KM 26+165"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "Jalur 5 Track LAA",
      "km": "KM 26+165"
    }
  },
  {
    "id": "titik_wesel_w51c_bks",
    "code": "Wesel W51C",
    "title": "Wesel W51C",
    "km": "KM 26+182",
    "category": "TITIK WESEL",
    "cx": 1341.8,
    "cy": 1112.6,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 1336.3 1269.8 A 5.5 5.5 0 1 0 1347.3 1269.8 A 5.5 5.5 0 1 0 1336.3 1269.8",
    "hitD": "M 1321.8 1269.8 A 20 20 0 1 0 1361.8 1269.8 A 20 20 0 1 0 1321.8 1269.8",
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W51C",
      "km": "KM 26+182"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "Jalur 5 Track LAA",
      "km": "KM 26+182"
    }
  },
  {
    "id": "titik_wesel_w71c1_bks",
    "code": "Wesel W71C1",
    "title": "Wesel W71C1",
    "km": "KM 26+189",
    "category": "TITIK WESEL",
    "cx": 1341.8,
    "cy": 1063,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 1336.3 1220.2 A 5.5 5.5 0 1 0 1347.3 1220.2 A 5.5 5.5 0 1 0 1336.3 1220.2",
    "hitD": "M 1321.8 1220.2 A 20 20 0 1 0 1361.8 1220.2 A 20 20 0 1 0 1321.8 1220.2",
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W71C1",
      "km": "KM 26+189"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "Jalur 6 Track LAA",
      "km": "KM 26+189"
    }
  },
  {
    "id": "titik_wesel_w31b_bks",
    "code": "Wesel W31B",
    "title": "Wesel W31B",
    "km": "KM 26+253",
    "category": "TITIK WESEL",
    "cx": 1296.8,
    "cy": 1174,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 1291.3 1331.2 A 5.5 5.5 0 1 0 1302.3 1331.2 A 5.5 5.5 0 1 0 1291.3 1331.2",
    "hitD": "M 1276.8 1331.2 A 20 20 0 1 0 1316.8 1331.2 A 20 20 0 1 0 1276.8 1331.2",
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W31B",
      "km": "KM 26+253"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "Jalur 4 Track LAA",
      "km": "KM 26+253"
    }
  },
  {
    "id": "titik_wesel_w71c_bks",
    "code": "Wesel W71C",
    "title": "Wesel W71C",
    "km": "KM 26+270",
    "category": "TITIK WESEL",
    "cx": 1299.6,
    "cy": 1012.3,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 1294.1 1169.5 A 5.5 5.5 0 1 0 1305.1 1169.5 A 5.5 5.5 0 1 0 1294.1 1169.5",
    "hitD": "M 1279.6 1169.5 A 20 20 0 1 0 1319.6 1169.5 A 20 20 0 1 0 1279.6 1169.5",
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W71C",
      "km": "KM 26+270"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "Jalur 7 Track LAA",
      "km": "KM 26+270"
    }
  },
  {
    "id": "titik_wesel_w73_bks",
    "code": "Wesel W73",
    "title": "Wesel W73",
    "km": "KM 26+723",
    "category": "TITIK WESEL",
    "cx": 776.9,
    "cy": 1063.8,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 771.4 1221 A 5.5 5.5 0 1 0 782.4 1221 A 5.5 5.5 0 1 0 771.4 1221",
    "hitD": "M 756.9 1221 A 20 20 0 1 0 796.9 1221 A 20 20 0 1 0 756.9 1221",
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W73",
      "km": "KM 26+723"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "Jalur 6 Track LAA",
      "km": "KM 26+723"
    }
  },
  {
    "id": "titik_wesel_w53_bks",
    "code": "Wesel W53",
    "title": "Wesel W53",
    "km": "KM 26+723",
    "category": "TITIK WESEL",
    "cx": 775.8,
    "cy": 1113.4,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 770.3 1270.6 A 5.5 5.5 0 1 0 781.3 1270.6 A 5.5 5.5 0 1 0 770.3 1270.6",
    "hitD": "M 755.8 1270.6 A 20 20 0 1 0 795.8 1270.6 A 20 20 0 1 0 755.8 1270.6",
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W53",
      "km": "KM 26+723"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "Jalur 5 Track LAA",
      "km": "KM 26+723"
    }
  },
  {
    "id": "titik_wesel_w33a_bks",
    "code": "Wesel W33A (BKS)",
    "title": "Wesel W33A (Bekasi)",
    "km": "KM 26+658",
    "category": "TITIK WESEL",
    "cx": 826.9,
    "cy": 1174.9,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 821.4 1332.1 A 5.5 5.5 0 1 0 832.4 1332.1 A 5.5 5.5 0 1 0 821.4 1332.1",
    "hitD": "M 806.9 1332.1 A 20 20 0 1 0 846.9 1332.1 A 20 20 0 1 0 806.9 1332.1",
    "startDivider": {
      "type": "WESEL",
      "label": "Wesel W33A",
      "km": "KM 26+658"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "Jalur 4 Track LAA",
      "km": "KM 26+658"
    }
  },
  {
    "id": "wesel_w31c1_932",
    "code": "WESEL W31C1",
    "title": "Wesel W31C1 / W51D1 (Jalur 2 ke Jalur 1, KM 11+650)",
    "km": "KM 11+650",
    "category": "ST. JATINEGARA (EMPLASEMEN BARAT)",
    "d": "M 932.6 813.3 L 974.3 846.6",
    "color": "#f8d731",
    "isCrossing": true
  },
  {
    "id": "wesel_w31c2_992",
    "code": "WESEL W31C2",
    "title": "Wesel W31C2 / W51D2 (Jalur 2 ke Jalur 1, KM 11+700)",
    "km": "KM 11+700",
    "category": "ST. JATINEGARA (EMPLASEMEN BARAT)",
    "d": "M 992 813.3 L 950.2 846.6",
    "color": "#f8d731",
    "isCrossing": true
  },
  {
    "id": "wesel_w51d1_946",
    "code": "WESEL W51D1",
    "title": "Wesel W51D1 ke Jalur 1 Hulu (KM 11+650)",
    "km": "KM 11+650",
    "category": "ST. JATINEGARA (EMPLASEMEN BARAT)",
    "d": "M 946 849.9 L 932.6 860.7",
    "color": "#ff00ff",
    "isCrossing": true
  },
  {
    "id": "wesel_w51d2_978",
    "code": "WESEL W51D2",
    "title": "Wesel W51D2 ke Jalur 1 Hulu (KM 11+700)",
    "km": "KM 11+700",
    "category": "ST. JATINEGARA (EMPLASEMEN BARAT)",
    "d": "M 978.8 850.2 L 992 860.7",
    "color": "#ff00ff",
    "isCrossing": true
  },
  {
    "id": "wesel_w83a2_1628",
    "code": "WESEL W83A2",
    "title": "Wesel W83A2 (Crossover Jalur 4 Timur, KM 11+900)",
    "km": "KM 11+900",
    "category": "ST. JATINEGARA (EMPLASEMEN TIMUR)",
    "d": "M 1628.1 669.9 L 1667.3 717.7",
    "color": "#139a47",
    "isCrossing": true
  },
  {
    "id": "wesel_w23b1_1596",
    "code": "WESEL W23B1",
    "title": "Wesel W23B1 (Crossover Jalur 4 ke Jalur 3 Barat, KM 11+920)",
    "km": "KM 11+920",
    "category": "ST. JATINEGARA (EMPLASEMEN TIMUR)",
    "d": "M 1596.8 717.7 L 1613.8 737.2",
    "color": "#cc6827",
    "isCrossing": true
  },
  {
    "id": "wesel_w23b2_1617",
    "code": "WESEL W23B2",
    "title": "Wesel W23B2 (Lanjutan Crossover Jalur 4 ke Jalur 3, KM 11+950)",
    "km": "KM 11+950",
    "category": "ST. JATINEGARA (EMPLASEMEN TIMUR)",
    "d": "M 1617.5 741.2 L 1638.4 765.2",
    "color": "#f8d731",
    "isCrossing": true
  },
  {
    "id": "wesel_w23c1_1692",
    "code": "WESEL W23C1",
    "title": "Wesel W23C1 (Crossover Jalur 4 ke Jalur 3 Timur, KM 12+000)",
    "km": "KM 12+000",
    "category": "ST. JATINEGARA (EMPLASEMEN TIMUR)",
    "d": "M 1692.9 717.7 L 1710 737.4",
    "color": "#139a47",
    "isCrossing": true
  },
  {
    "id": "wesel_w23c2_1713",
    "code": "WESEL W23C2",
    "title": "Wesel W23C2 (Lanjutan Crossover Jalur 4 ke Jalur 3, KM 12+050)",
    "km": "KM 12+050",
    "category": "ST. JATINEGARA (EMPLASEMEN TIMUR)",
    "d": "M 1713.8 741.3 L 1734.8 765.3",
    "color": "#f8d731",
    "isCrossing": true
  },
  {
    "id": "wesel_w13b_1600",
    "code": "WESEL W13B (JNG)",
    "title": "Wesel W13B (Crossover Jalur 3 ke Jalur 2 Barat, KM 11+900)",
    "km": "KM 11+900",
    "category": "ST. JATINEGARA (EMPLASEMEN TIMUR)",
    "d": "M 1600.7 765.1 L 1560.5 813.1",
    "color": "#f8d731",
    "isCrossing": true
  },
  {
    "id": "wesel_w13c_1667",
    "code": "WESEL W13C (JNG)",
    "title": "Wesel W13C1 / W13C2 (Crossover Jalur 3 ke Jalur 2, KM 12+000)",
    "km": "KM 12+000",
    "category": "ST. JATINEGARA (EMPLASEMEN TIMUR)",
    "d": "M 1667 765.2 L 1708.7 813",
    "color": "#f8d731",
    "isCrossing": true
  },
  {
    "id": "wesel_w13d1_1750",
    "code": "WESEL W13D1",
    "title": "Wesel W13D1 (Crossover Jalur 3 ke Jalur 2 Timur, KM 12+100)",
    "km": "KM 12+100",
    "category": "ST. JATINEGARA (EMPLASEMEN TIMUR)",
    "d": "M 1750.1 765.3 L 1767.3 785",
    "color": "#f8d731",
    "isCrossing": true
  },
  {
    "id": "wesel_w13d2_1771",
    "code": "WESEL W13D2",
    "title": "Wesel W13D2 (Lanjutan Crossover Jalur 2 Timur, KM 12+150)",
    "km": "KM 12+150",
    "category": "ST. JATINEGARA (EMPLASEMEN TIMUR)",
    "d": "M 1771.6 789.7 L 1791.9 813",
    "color": "#f8d731",
    "isCrossing": true
  },
  {
    "id": "wesel_w33b_1750",
    "code": "WESEL W33B",
    "title": "Wesel W33B2 (Crossover Jalur 2 ke Jalur 1 Barat, KM 12+250)",
    "km": "KM 12+250",
    "category": "ST. JATINEGARA (EMPLASEMEN TIMUR)",
    "d": "M 1750.7 813 L 1767.8 833.6",
    "color": "#f8d731",
    "isCrossing": true
  },
  {
    "id": "wesel_w53b_1771",
    "code": "WESEL W53B",
    "title": "Wesel W53B (Percabangan Jalur 1 Hulu ke FRP-JNG-14-33B2, KM 12+180)",
    "km": "KM 12+180",
    "category": "ST. JATINEGARA (EMPLASEMEN TIMUR)",
    "d": "M 1771.6 837.8 L 1791.9 861.1",
    "color": "#ff00ff",
    "isCrossing": true
  },
  {
    "id": "wesel_w33c_1834",
    "code": "WESEL W33C",
    "title": "Wesel W33C1 / W33C2 (Crossover Jalur 2 ke Jalur 1 Timur, KM 12+320)",
    "km": "KM 12+320",
    "category": "ST. JATINEGARA (EMPLASEMEN TIMUR)",
    "d": "M 1834.1 813 L 1851.6 833.1",
    "color": "#f8d731",
    "isCrossing": true
  },
  {
    "id": "wesel_w53c_1856",
    "code": "WESEL W53C",
    "title": "Wesel W53C (Percabangan Jalur 1 Hulu ke FRP-JNG-16-33C2, KM 12+350)",
    "km": "KM 12+350",
    "category": "ST. JATINEGARA (EMPLASEMEN TIMUR)",
    "d": "M 1856.1 837.8 L 1876.4 861.1",
    "color": "#ff00ff",
    "isCrossing": true
  },
  {
    "id": "wesel_w23b_cuk",
    "code": "WESEL W23B",
    "title": "Wesel W23B St. Cakung (KM 21+445)",
    "km": "KM 21+445",
    "category": "ST. CAKUNG",
    "d": "M 2366.8 1343.6 L 2386.1 1320.8",
    "color": "#cc6827",
    "isCrossing": true
  },
  {
    "id": "wesel_w13b_cuk",
    "code": "WESEL W13B (CUK)",
    "title": "Wesel W13B St. Cakung (KM 21+387)",
    "km": "KM 21+387",
    "category": "ST. CAKUNG",
    "d": "M 2390 1315.7 L 2407.1 1295.4",
    "color": "#8a6ddd",
    "isCrossing": true
  },
  {
    "id": "wesel_w11a_cuk",
    "code": "WESEL W11A (CUK)",
    "title": "Wesel W11A Timur Cakung (KM 20+740)",
    "km": "KM 20+740",
    "category": "ST. CAKUNG",
    "d": "M 2645 1316.2 L 2628.6 1295.8",
    "color": "#8a6ddd",
    "isCrossing": true
  },
  {
    "id": "wesel_w21a_cuk",
    "code": "WESEL W21A",
    "title": "Wesel W21A Timur Cakung (KM 20+687)",
    "km": "KM 20+687",
    "category": "ST. CAKUNG",
    "d": "M 2667.5 1343.7 L 2649.2 1320.9",
    "color": "#cc6827",
    "isCrossing": true
  },
  {
    "id": "wesel_w73_bks_807",
    "code": "WESEL W73",
    "title": "Wesel W73 Masuk Jalur 1 Barat Bekasi (KM 26+500)",
    "km": "KM 26+500",
    "category": "ST. BEKASI (EMPLASEMEN BARAT)",
    "d": "M 807.6 1267.9 L 776.9 1293.5",
    "color": "#139a47",
    "isCrossing": true
  },
  {
    "id": "wesel_frp_73_bks",
    "code": "WESEL FRP-JNG-26-73",
    "title": "Wesel FRP-JNG-26-73 Langsir Stabling Bekasi (KM 26+500)",
    "km": "KM 26+500",
    "category": "ST. BEKASI (STABLING)",
    "d": "M 838.4 1242.4 L 812.1 1264.2",
    "color": "#139a47",
    "isCrossing": true
  },
  {
    "id": "wesel_w33a_bks_797",
    "code": "WESEL W33A (BKS 1)",
    "title": "Wesel W33A ke Jalur 2 Barat Bekasi (KM 26+600)",
    "km": "KM 26+600",
    "category": "ST. BEKASI (EMPLASEMEN BARAT)",
    "d": "M 797.7 1369.9 L 775.6 1343.4",
    "color": "#ec1f24",
    "isCrossing": true
  },
  {
    "id": "wesel_w33a_bks_826",
    "code": "WESEL W33A (BKS 2)",
    "title": "Wesel W33A ke Jalur 3 Barat Bekasi (KM 26+580)",
    "km": "KM 26+580",
    "category": "ST. BEKASI (EMPLASEMEN BARAT)",
    "d": "M 826.6 1404.8 L 801.2 1374.1",
    "color": "#ec1f24",
    "isCrossing": true
  },
  {
    "id": "wesel_w71c1_1341",
    "code": "WESEL W71C1",
    "title": "Wesel W71C1 Stabling Bekasi (KM 26+180)",
    "km": "KM 26+180",
    "category": "ST. BEKASI (STABLING)",
    "d": "M 1341.8 1293.8 L 1322.7 1270.8",
    "color": "#139a47",
    "isCrossing": true
  },
  {
    "id": "wesel_w71b_1454",
    "code": "WESEL W71B",
    "title": "Wesel W71B Emplasemen Timur Bekasi (KM 26+050)",
    "km": "KM 26+050",
    "category": "ST. BEKASI (EMPLASEMEN TIMUR)",
    "d": "M 1454.3 1318.2 L 1474.7 1294.1",
    "color": "#139a47",
    "isCrossing": true
  },
  {
    "id": "wesel_w71a_1524",
    "code": "WESEL W71A",
    "title": "Wesel W71A Masuk Jalur 1 Bekasi (KM 25+950)",
    "km": "KM 25+950",
    "category": "ST. BEKASI (EMPLASEMEN TIMUR)",
    "d": "M 1524.3 1317 L 1505.1 1293.8",
    "color": "#139a47",
    "isCrossing": true
  },
  {
    "id": "wesel_w51a_1547",
    "code": "WESEL W51A (BKS)",
    "title": "Wesel W51A Masuk Jalur 2 Bekasi (KM 25+950)",
    "km": "KM 25+950",
    "category": "ST. BEKASI (EMPLASEMEN TIMUR)",
    "d": "M 1547.1 1343.6 L 1528.7 1321.7",
    "color": "#ff0000",
    "isCrossing": true
  },
  {
    "id": "wesel_w51b_1431",
    "code": "WESEL W51B",
    "title": "Wesel W51B Emplasemen Timur Bekasi (KM 26+050)",
    "km": "KM 26+050",
    "category": "ST. BEKASI (EMPLASEMEN TIMUR)",
    "d": "M 1431.2 1343.8 L 1449.6 1322.3",
    "color": "#ff0000",
    "isCrossing": true
  },
  {
    "id": "wesel_w51c_1322",
    "code": "WESEL W51C",
    "title": "Wesel W51C ke Jalur 2 Timur Bekasi (KM 26+180)",
    "km": "KM 26+180",
    "category": "ST. BEKASI (EMPLASEMEN TIMUR)",
    "d": "M 1322.7 1369.4 L 1341.8 1343.4",
    "color": "#ec1f24",
    "isCrossing": true
  },
  {
    "id": "wesel_w31b_1296",
    "code": "WESEL W31B",
    "title": "Wesel W31B Jalur 3 Timur Bekasi (KM 26+150)",
    "km": "KM 26+150",
    "category": "ST. BEKASI (EMPLASEMEN TIMUR)",
    "d": "M 1296.8 1404.8 L 1319.3 1374.1",
    "color": "#ec1f24",
    "isCrossing": true
  },
  {
    "id": "wesel_w13d_bkt_307",
    "code": "WESEL W13D",
    "title": "Wesel W13D Percabangan Bekasi Timur (KM 27+050)",
    "km": "KM 27+050",
    "category": "BEKASI TIMUR",
    "d": "M 307 1480.7 L 288.8 1458.6",
    "color": "#139a47",
    "isCrossing": true
  },
  {
    "id": "wesel_w23c_bkt_329",
    "code": "WESEL W23C",
    "title": "Wesel W23C Percabangan Bekasi Timur (KM 27+100)",
    "km": "KM 27+100",
    "category": "BEKASI TIMUR",
    "d": "M 329.7 1508.3 L 310.5 1484.8",
    "color": "#ec1f24",
    "isCrossing": true
  },
  {
    "id": "wesel_w13c_bkt_432",
    "code": "WESEL W13C (BKT)",
    "title": "Wesel W13C / W23B Bekasi Timur (KM 26+950)",
    "km": "KM 26+950",
    "category": "BEKASI TIMUR",
    "d": "M 432.4 1458.6 L 391.7 1508.3",
    "color": "#ec1f24",
    "isCrossing": true
  },
  {
    "id": "overlap_aj_10000_hi",
    "code": "AJ KM 10+000 HI",
    "title": "Overlap Air Joint (AJ) KM 10+000 (Hilir)",
    "km": "KM 10+000",
    "category": "PEMISAH SEKSI (AS/AJ)",
    "d": "M 206.1 518.1 L 218.7 537.9 M 218.7 518.1 L 206.1 537.9",
    "hitD": "M 206.1 518.1 L 218.7 537.9 M 218.7 518.1 L 206.1 537.9",
    "color": "#ff7fdf",
    "isCrossing": true,
    "startDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ) KM 10+000",
      "km": "KM 10+000"
    },
    "endDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ) KM 10+000",
      "km": "KM 10+000"
    }
  },
  {
    "id": "overlap_aj_10000_hu",
    "code": "AJ KM 10+000 HU",
    "title": "Overlap Air Joint (AJ) KM 10+000 (Hulu)",
    "km": "KM 10+000",
    "category": "PEMISAH SEKSI (AS/AJ)",
    "d": "M 206.1 565.9 L 218.7 585.7 M 218.7 565.9 L 206.1 585.7",
    "hitD": "M 206.1 565.9 L 218.7 585.7 M 218.7 565.9 L 206.1 585.7",
    "color": "#ff0000",
    "isCrossing": true,
    "startDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ) KM 10+000",
      "km": "KM 10+000"
    },
    "endDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ) KM 10+000",
      "km": "KM 10+000"
    }
  },
  {
    "id": "overlap_as_11200_j7",
    "code": "AS KM 11+200 J7",
    "title": "Overlap Air Section (AS) KM 11+200 (Jalur 7)",
    "km": "KM 11+200",
    "category": "PEMISAH SEKSI (AS/AJ)",
    "d": "M 589.5 526.8 L 596.5 537.8 M 596.5 518.2 L 603.5 529.2",
    "hitD": "M 589.5 526.8 L 596.5 537.8 M 596.5 518.2 L 603.5 529.2",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS) KM 11+200",
      "km": "KM 11+200"
    },
    "endDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS) KM 11+200",
      "km": "KM 11+200"
    }
  },
  {
    "id": "overlap_as_11200_j6",
    "code": "AS KM 11+200 J6",
    "title": "Overlap Air Section (AS) KM 11+200 (Jalur 6)",
    "km": "KM 11+200",
    "category": "PEMISAH SEKSI (AS/AJ)",
    "d": "M 584.5 574.6 L 591.5 585.6 M 591.5 566 L 598.5 577",
    "hitD": "M 584.5 574.6 L 591.5 585.6 M 591.5 566 L 598.5 577",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS) KM 11+200",
      "km": "KM 11+200"
    },
    "endDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS) KM 11+200",
      "km": "KM 11+200"
    }
  },
  {
    "id": "overlap_as_1880_hi",
    "code": "AS KM 1+880 HI",
    "title": "Overlap Air Section (AS) KM 1+880 (Hilir)",
    "km": "KM 1+880",
    "category": "PEMISAH SEKSI (AS/AJ)",
    "d": "M 473.6 812.5 L 480.6 823.5 M 480.6 803.9 L 487.6 814.9",
    "hitD": "M 473.6 812.5 L 480.6 823.5 M 480.6 803.9 L 487.6 814.9",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS) KM 1+880",
      "km": "KM 1+880"
    },
    "endDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS) KM 1+880",
      "km": "KM 1+880"
    }
  },
  {
    "id": "overlap_as_1880_hu",
    "code": "AS KM 1+880 HU",
    "title": "Overlap Air Section (AS) KM 1+880 (Hulu)",
    "km": "KM 1+880",
    "category": "PEMISAH SEKSI (AS/AJ)",
    "d": "M 473.6 860.4 L 480.6 871.4 M 480.6 851.8 L 487.6 862.8",
    "hitD": "M 473.6 860.4 L 480.6 871.4 M 480.6 851.8 L 487.6 862.8",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS) KM 1+880",
      "km": "KM 1+880"
    },
    "endDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS) KM 1+880",
      "km": "KM 1+880"
    }
  },
  {
    "id": "overlap_as_2000_hi",
    "code": "AS KM 2+000 HI",
    "title": "Overlap Air Section (AS) KM 2+000 (Hilir)",
    "km": "KM 2+000",
    "category": "PEMISAH SEKSI (AS/AJ)",
    "d": "M 727.8 812.5 L 734.8 823.5 M 734.8 803.9 L 741.8 814.9",
    "hitD": "M 727.8 812.5 L 734.8 823.5 M 734.8 803.9 L 741.8 814.9",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS) KM 2+000",
      "km": "KM 2+000"
    },
    "endDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS) KM 2+000",
      "km": "KM 2+000"
    }
  },
  {
    "id": "overlap_as_2000_hu",
    "code": "AS KM 2+000 HU",
    "title": "Overlap Air Section (AS) KM 2+000 (Hulu)",
    "km": "KM 2+000",
    "category": "PEMISAH SEKSI (AS/AJ)",
    "d": "M 727.8 860.1 L 734.8 871.1 M 734.8 851.5 L 741.8 862.5",
    "hitD": "M 727.8 860.1 L 734.8 871.1 M 734.8 851.5 L 741.8 862.5",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS) KM 2+000",
      "km": "KM 2+000"
    },
    "endDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS) KM 2+000",
      "km": "KM 2+000"
    }
  },
  {
    "id": "overlap_as_11900_hi",
    "code": "AS KM 11+900 HI",
    "title": "Overlap Air Section (AS) KM 11+900 (Hilir)",
    "km": "KM 11+900",
    "category": "PEMISAH SEKSI (AS/AJ)",
    "d": "M 1474.7 812.5 L 1481.7 823.5 M 1481.7 803.9 L 1488.7 814.9",
    "hitD": "M 1474.7 812.5 L 1481.7 823.5 M 1481.7 803.9 L 1488.7 814.9",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS) KM 11+900",
      "km": "KM 11+900"
    },
    "endDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS) KM 11+900",
      "km": "KM 11+900"
    }
  },
  {
    "id": "overlap_as_11900_hu",
    "code": "AS KM 11+900 HU",
    "title": "Overlap Air Section (AS) KM 11+900 (Hulu)",
    "km": "KM 11+900",
    "category": "PEMISAH SEKSI (AS/AJ)",
    "d": "M 1474.8 860 L 1481.8 871 M 1481.8 851.4 L 1488.8 862.4",
    "hitD": "M 1474.8 860 L 1481.8 871 M 1481.8 851.4 L 1488.8 862.4",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS) KM 11+900",
      "km": "KM 11+900"
    },
    "endDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS) KM 11+900",
      "km": "KM 11+900"
    }
  },
  {
    "id": "overlap_as_11900_j3",
    "code": "AS KM 11+900 J3",
    "title": "Overlap Air Section (AS) KM 11+900 (Jalur 3)",
    "km": "KM 11+900",
    "category": "PEMISAH SEKSI (AS/AJ)",
    "d": "M 1474.7 762.8 L 1481.7 773.8 M 1481.7 754.2 L 1488.7 765.2",
    "hitD": "M 1474.7 762.8 L 1481.7 773.8 M 1481.7 754.2 L 1488.7 765.2",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS) KM 11+900 (Jalur 3)",
      "km": "KM 11+900"
    },
    "endDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS) KM 11+900 (Jalur 3)",
      "km": "KM 11+900"
    }
  },
  {
    "id": "overlap_as_12500_hi",
    "code": "AS KM 12+500 HI",
    "title": "Overlap Air Section (AS) KM 12+500 (Hilir)",
    "km": "KM 12+500",
    "category": "PEMISAH SEKSI (AS/AJ)",
    "d": "M 1941.6 812.4 L 1948.6 823.4 M 1948.6 803.8 L 1955.6 814.8",
    "hitD": "M 1941.6 812.4 L 1948.6 823.4 M 1948.6 803.8 L 1955.6 814.8",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS) KM 12+500",
      "km": "KM 12+500"
    },
    "endDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS) KM 12+500",
      "km": "KM 12+500"
    }
  },
  {
    "id": "overlap_as_12500_hu",
    "code": "AS KM 12+500 HU",
    "title": "Overlap Air Section (AS) KM 12+500 (Hulu)",
    "km": "KM 12+500",
    "category": "PEMISAH SEKSI (AS/AJ)",
    "d": "M 1941.6 860.7 L 1948.6 871.7 M 1948.6 852.1 L 1955.6 863.1",
    "hitD": "M 1941.6 860.7 L 1948.6 871.7 M 1948.6 852.1 L 1955.6 863.1",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS) KM 12+500",
      "km": "KM 12+500"
    },
    "endDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS) KM 12+500",
      "km": "KM 12+500"
    }
  },
  {
    "id": "overlap_aj_13300_hi",
    "code": "AJ KM 13+300 HI",
    "title": "Overlap Air Joint (AJ) KM 13+300 (Hilir)",
    "km": "KM 13+300",
    "category": "PEMISAH SEKSI (AS/AJ)",
    "d": "M 2078.8 803.8 L 2091.4 823.6 M 2091.4 803.8 L 2078.8 823.6",
    "hitD": "M 2078.8 803.8 L 2091.4 823.6 M 2091.4 803.8 L 2078.8 823.6",
    "color": "#0000ff",
    "isCrossing": true,
    "startDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ) KM 13+300",
      "km": "KM 13+300"
    },
    "endDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ) KM 13+300",
      "km": "KM 13+300"
    }
  },
  {
    "id": "overlap_aj_13300_hu",
    "code": "AJ KM 13+300 HU",
    "title": "Overlap Air Joint (AJ) KM 13+300 (Hulu)",
    "km": "KM 13+300",
    "category": "PEMISAH SEKSI (AS/AJ)",
    "d": "M 2077.2 851.7 L 2089.8 871.5 M 2089.8 851.7 L 2077.2 871.5",
    "hitD": "M 2077.2 851.7 L 2089.8 871.5 M 2089.8 851.7 L 2077.2 871.5",
    "color": "#ff9f7f",
    "isCrossing": true,
    "startDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ) KM 13+300",
      "km": "KM 13+300"
    },
    "endDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ) KM 13+300",
      "km": "KM 13+300"
    }
  },
  {
    "id": "overlap_aj_14100_hi",
    "code": "AJ KM 14+100 HI",
    "title": "Overlap Air Joint (AJ) KM 14+100 (Hilir)",
    "km": "KM 14+100",
    "category": "PEMISAH SEKSI (AS/AJ)",
    "d": "M 2159.1 803.4 L 2171.7 823.2 M 2171.7 803.4 L 2159.1 823.2",
    "hitD": "M 2159.1 803.4 L 2171.7 823.2 M 2171.7 803.4 L 2159.1 823.2",
    "color": "#0000ff",
    "isCrossing": true,
    "startDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ) KM 14+100",
      "km": "KM 14+100"
    },
    "endDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ) KM 14+100",
      "km": "KM 14+100"
    }
  },
  {
    "id": "overlap_aj_14100_hu",
    "code": "AJ KM 14+100 HU",
    "title": "Overlap Air Joint (AJ) KM 14+100 (Hulu)",
    "km": "KM 14+100",
    "category": "PEMISAH SEKSI (AS/AJ)",
    "d": "M 2157.1 850.4 L 2169.7 870.2 M 2169.7 850.4 L 2157.1 870.2",
    "hitD": "M 2157.1 850.4 L 2169.7 870.2 M 2169.7 850.4 L 2157.1 870.2",
    "color": "#ff9f7f",
    "isCrossing": true,
    "startDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ) KM 14+100",
      "km": "KM 14+100"
    },
    "endDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ) KM 14+100",
      "km": "KM 14+100"
    }
  },
  {
    "id": "overlap_aj_14700_hi",
    "code": "AJ KM 14+700 HI",
    "title": "Overlap Air Joint (AJ) KM 14+700 (Hilir)",
    "km": "KM 14+700",
    "category": "PEMISAH SEKSI (AS/AJ)",
    "d": "M 2245.5 803.3 L 2258.1 823.1 M 2258.1 803.3 L 2245.5 823.1",
    "hitD": "M 2245.5 803.3 L 2258.1 823.1 M 2258.1 803.3 L 2245.5 823.1",
    "color": "#0000ff",
    "isCrossing": true,
    "startDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ) KM 14+700",
      "km": "KM 14+700"
    },
    "endDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ) KM 14+700",
      "km": "KM 14+700"
    }
  },
  {
    "id": "overlap_aj_14700_hu",
    "code": "AJ KM 14+700 HU",
    "title": "Overlap Air Joint (AJ) KM 14+700 (Hulu)",
    "km": "KM 14+700",
    "category": "PEMISAH SEKSI (AS/AJ)",
    "d": "M 2243.9 851 L 2256.5 870.8 M 2256.5 851 L 2243.9 870.8",
    "hitD": "M 2243.9 851 L 2256.5 870.8 M 2256.5 851 L 2243.9 870.8",
    "color": "#ff9f7f",
    "isCrossing": true,
    "startDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ) KM 14+700",
      "km": "KM 14+700"
    },
    "endDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ) KM 14+700",
      "km": "KM 14+700"
    }
  },
  {
    "id": "overlap_as_15450_hi",
    "code": "AS KM 15+450 HI",
    "title": "Overlap Air Section (AS) KM 15+450 (Hilir)",
    "km": "KM 15+450",
    "category": "PEMISAH SEKSI (AS/AJ)",
    "d": "M 2511.5 812.5 L 2518.5 823.5 M 2518.5 803.9 L 2525.5 814.9",
    "hitD": "M 2511.5 812.5 L 2518.5 823.5 M 2518.5 803.9 L 2525.5 814.9",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS) KM 15+450",
      "km": "KM 15+450"
    },
    "endDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS) KM 15+450",
      "km": "KM 15+450"
    }
  },
  {
    "id": "overlap_as_15450_hu",
    "code": "AS KM 15+450 HU",
    "title": "Overlap Air Section (AS) KM 15+450 (Hulu)",
    "km": "KM 15+450",
    "category": "PEMISAH SEKSI (AS/AJ)",
    "d": "M 2510.7 860.5 L 2517.7 871.5 M 2517.7 851.9 L 2524.7 862.9",
    "hitD": "M 2510.7 860.5 L 2517.7 871.5 M 2517.7 851.9 L 2524.7 862.9",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS) KM 15+450",
      "km": "KM 15+450"
    },
    "endDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS) KM 15+450",
      "km": "KM 15+450"
    }
  },
  {
    "id": "overlap_aj_16500_hi",
    "code": "AJ KM 16+500 HI",
    "title": "Overlap Air Joint (AJ) KM 16+500 (Hilir)",
    "km": "KM 16+500",
    "category": "PEMISAH SEKSI (AS/AJ)",
    "d": "M 2631 804.2 L 2643.6 824 M 2643.6 804.2 L 2631 824",
    "hitD": "M 2631 804.2 L 2643.6 824 M 2643.6 804.2 L 2631 824",
    "color": "#ff00ff",
    "isCrossing": true,
    "startDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ) KM 16+500",
      "km": "KM 16+500"
    },
    "endDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ) KM 16+500",
      "km": "KM 16+500"
    }
  },
  {
    "id": "overlap_aj_16500_hu",
    "code": "AJ KM 16+500 HU",
    "title": "Overlap Air Joint (AJ) KM 16+500 (Hulu)",
    "km": "KM 16+500",
    "category": "PEMISAH SEKSI (AS/AJ)",
    "d": "M 2629.5 851.9 L 2642.1 871.7 M 2642.1 851.9 L 2629.5 871.7",
    "hitD": "M 2629.5 851.9 L 2642.1 871.7 M 2642.1 851.9 L 2629.5 871.7",
    "color": "#00ff00",
    "isCrossing": true,
    "startDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ) KM 16+500",
      "km": "KM 16+500"
    },
    "endDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ) KM 16+500",
      "km": "KM 16+500"
    }
  },
  {
    "id": "overlap_as_17239_hi",
    "code": "AS KM 17+239 HI",
    "title": "Overlap Air Section (AS) KM 17+239 (Hilir)",
    "km": "KM 17+239",
    "category": "PEMISAH SEKSI (AS/AJ)",
    "d": "M 2736.3 812.3 L 2743.3 823.3 M 2743.3 803.7 L 2750.3 814.7",
    "hitD": "M 2736.3 812.3 L 2743.3 823.3 M 2743.3 803.7 L 2750.3 814.7",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS) KM 17+239",
      "km": "KM 17+239"
    },
    "endDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS) KM 17+239",
      "km": "KM 17+239"
    }
  },
  {
    "id": "overlap_as_17239_hu",
    "code": "AS KM 17+239 HU",
    "title": "Overlap Air Section (AS) KM 17+239 (Hulu)",
    "km": "KM 17+239",
    "category": "PEMISAH SEKSI (AS/AJ)",
    "d": "M 2736.3 860 L 2743.3 871 M 2743.3 851.4 L 2750.3 862.4",
    "hitD": "M 2736.3 860 L 2743.3 871 M 2743.3 851.4 L 2750.3 862.4",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS) KM 17+239",
      "km": "KM 17+239"
    },
    "endDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS) KM 17+239",
      "km": "KM 17+239"
    }
  },
  {
    "id": "overlap_as_17900_hi",
    "code": "AS KM 17+900 HI",
    "title": "Overlap Air Section (AS) KM 17+900 (Hilir)",
    "km": "KM 17+900",
    "category": "PEMISAH SEKSI (AS/AJ)",
    "d": "M 2980.3 812.4 L 2987.3 823.4 M 2987.3 803.8 L 2994.3 814.8",
    "hitD": "M 2980.3 812.4 L 2987.3 823.4 M 2987.3 803.8 L 2994.3 814.8",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS) KM 17+900",
      "km": "KM 17+900"
    },
    "endDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS) KM 17+900",
      "km": "KM 17+900"
    }
  },
  {
    "id": "overlap_as_17900_hu",
    "code": "AS KM 17+900 HU",
    "title": "Overlap Air Section (AS) KM 17+900 (Hulu)",
    "km": "KM 17+900",
    "category": "PEMISAH SEKSI (AS/AJ)",
    "d": "M 2979.4 860.1 L 2986.4 871.1 M 2986.4 851.5 L 2993.4 862.5",
    "hitD": "M 2979.4 860.1 L 2986.4 871.1 M 2986.4 851.5 L 2993.4 862.5",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS) KM 17+900",
      "km": "KM 17+900"
    },
    "endDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS) KM 17+900",
      "km": "KM 17+900"
    }
  },
  {
    "id": "overlap_aj_18800_hi",
    "code": "AJ KM 18+800 HI",
    "title": "Overlap Air Joint (AJ) KM 18+800 (Hilir)",
    "km": "KM 18+800",
    "category": "PEMISAH SEKSI (AS/AJ)",
    "d": "M 3090.5 803.3 L 3103.1 823.1 M 3103.1 803.3 L 3090.5 823.1",
    "hitD": "M 3090.5 803.3 L 3103.1 823.1 M 3103.1 803.3 L 3090.5 823.1",
    "color": "#f8d731",
    "isCrossing": true,
    "startDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ) KM 18+800",
      "km": "KM 18+800"
    },
    "endDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ) KM 18+800",
      "km": "KM 18+800"
    }
  },
  {
    "id": "overlap_aj_18800_hu",
    "code": "AJ KM 18+800 HU",
    "title": "Overlap Air Joint (AJ) KM 18+800 (Hulu)",
    "km": "KM 18+800",
    "category": "PEMISAH SEKSI (AS/AJ)",
    "d": "M 3090.5 851.1 L 3103.1 870.9 M 3103.1 851.1 L 3090.5 870.9",
    "hitD": "M 3090.5 851.1 L 3103.1 870.9 M 3103.1 851.1 L 3090.5 870.9",
    "color": "#ff0000",
    "isCrossing": true,
    "startDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ) KM 18+800",
      "km": "KM 18+800"
    },
    "endDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ) KM 18+800",
      "km": "KM 18+800"
    }
  },
  {
    "id": "overlap_aj_19300_hi",
    "code": "AJ KM 19+300 HI",
    "title": "Overlap Air Joint (AJ) KM 19+300 (Hilir)",
    "km": "KM 19+300",
    "category": "PEMISAH SEKSI (AS/AJ)",
    "d": "M 3035.6 1334.2 L 3048.2 1354 M 3048.2 1334.2 L 3035.6 1354",
    "hitD": "M 3035.6 1334.2 L 3048.2 1354 M 3048.2 1334.2 L 3035.6 1354",
    "color": "#f8d731",
    "isCrossing": true,
    "startDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ) KM 19+300",
      "km": "KM 19+300"
    },
    "endDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ) KM 19+300",
      "km": "KM 19+300"
    }
  },
  {
    "id": "overlap_aj_19300_hu",
    "code": "AJ KM 19+300 HU",
    "title": "Overlap Air Joint (AJ) KM 19+300 (Hulu)",
    "km": "KM 19+300",
    "category": "PEMISAH SEKSI (AS/AJ)",
    "d": "M 3035.6 1286.5 L 3048.2 1306.3 M 3048.2 1286.5 L 3035.6 1306.3",
    "hitD": "M 3035.6 1286.5 L 3048.2 1306.3 M 3048.2 1286.5 L 3035.6 1306.3",
    "color": "#ff0000",
    "isCrossing": true,
    "startDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ) KM 19+300",
      "km": "KM 19+300"
    },
    "endDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ) KM 19+300",
      "km": "KM 19+300"
    }
  },
  {
    "id": "overlap_as_20150_hi",
    "code": "AS KM 20+150 HI",
    "title": "Overlap Air Section (AS) KM 20+150 (Hilir)",
    "km": "KM 20+150",
    "category": "PEMISAH SEKSI (AS/AJ)",
    "d": "M 2807 1343.4 L 2814 1354.4 M 2814 1334.8 L 2821 1345.8",
    "hitD": "M 2807 1343.4 L 2814 1354.4 M 2814 1334.8 L 2821 1345.8",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS) KM 20+150",
      "km": "KM 20+150"
    },
    "endDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS) KM 20+150",
      "km": "KM 20+150"
    }
  },
  {
    "id": "overlap_as_20150_hu",
    "code": "AS KM 20+150 HU",
    "title": "Overlap Air Section (AS) KM 20+150 (Hulu)",
    "km": "KM 20+150",
    "category": "PEMISAH SEKSI (AS/AJ)",
    "d": "M 2807 1293.4 L 2814 1304.4 M 2814 1284.8 L 2821 1295.8",
    "hitD": "M 2807 1293.4 L 2814 1304.4 M 2814 1284.8 L 2821 1295.8",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS) KM 20+150",
      "km": "KM 20+150"
    },
    "endDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS) KM 20+150",
      "km": "KM 20+150"
    }
  },
  {
    "id": "overlap_as_21400_hi",
    "code": "AS KM 21+400 HI",
    "title": "Overlap Air Section (AS) KM 21+400 (Hilir)",
    "km": "KM 21+400",
    "category": "PEMISAH SEKSI (AS/AJ)",
    "d": "M 2330 1343.4 L 2337 1354.4 M 2337 1334.8 L 2344 1345.8",
    "hitD": "M 2330 1343.4 L 2337 1354.4 M 2337 1334.8 L 2344 1345.8",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS) KM 21+400",
      "km": "KM 21+400"
    },
    "endDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS) KM 21+400",
      "km": "KM 21+400"
    }
  },
  {
    "id": "overlap_as_21400_hu",
    "code": "AS KM 21+400 HU",
    "title": "Overlap Air Section (AS) KM 21+400 (Hulu)",
    "km": "KM 21+400",
    "category": "PEMISAH SEKSI (AS/AJ)",
    "d": "M 2330 1293.4 L 2337 1304.4 M 2337 1284.8 L 2344 1295.8",
    "hitD": "M 2330 1293.4 L 2337 1304.4 M 2337 1284.8 L 2344 1295.8",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS) KM 21+400",
      "km": "KM 21+400"
    },
    "endDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS) KM 21+400",
      "km": "KM 21+400"
    }
  },
  {
    "id": "overlap_aj_22700_hi",
    "code": "AJ KM 22+700 HI",
    "title": "Overlap Air Joint (AJ) KM 22+700 (Hilir)",
    "km": "KM 22+700",
    "category": "PEMISAH SEKSI (AS/AJ)",
    "d": "M 2208.2 1334.1 L 2220.8 1353.9 M 2220.8 1334.1 L 2208.2 1353.9",
    "hitD": "M 2208.2 1334.1 L 2220.8 1353.9 M 2220.8 1334.1 L 2208.2 1353.9",
    "color": "#cc6827",
    "isCrossing": true,
    "startDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ) KM 22+700",
      "km": "KM 22+700"
    },
    "endDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ) KM 22+700",
      "km": "KM 22+700"
    }
  },
  {
    "id": "overlap_aj_22700_hu",
    "code": "AJ KM 22+700 HU",
    "title": "Overlap Air Joint (AJ) KM 22+700 (Hulu)",
    "km": "KM 22+700",
    "category": "PEMISAH SEKSI (AS/AJ)",
    "d": "M 2205.9 1284.1 L 2218.5 1303.9 M 2218.5 1284.1 L 2205.9 1303.9",
    "hitD": "M 2205.9 1284.1 L 2218.5 1303.9 M 2218.5 1284.1 L 2205.9 1303.9",
    "color": "#8a6ddd",
    "isCrossing": true,
    "startDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ) KM 22+700",
      "km": "KM 22+700"
    },
    "endDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ) KM 22+700",
      "km": "KM 22+700"
    }
  },
  {
    "id": "overlap_as_23750_hi",
    "code": "AS KM 23+750 HI",
    "title": "Overlap Air Section (AS) KM 23+750 (Hilir)",
    "km": "KM 23+750",
    "category": "PEMISAH SEKSI (AS/AJ)",
    "d": "M 2052.1 1342.5 L 2059.1 1353.5 M 2059.1 1333.9 L 2066.1 1344.9",
    "hitD": "M 2052.1 1342.5 L 2059.1 1353.5 M 2059.1 1333.9 L 2066.1 1344.9",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS) KM 23+750",
      "km": "KM 23+750"
    },
    "endDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS) KM 23+750",
      "km": "KM 23+750"
    }
  },
  {
    "id": "overlap_as_23750_hu",
    "code": "AS KM 23+750 HU",
    "title": "Overlap Air Section (AS) KM 23+750 (Hulu)",
    "km": "KM 23+750",
    "category": "PEMISAH SEKSI (AS/AJ)",
    "d": "M 2060 1293.1 L 2067 1304.1 M 2067 1284.5 L 2074 1295.5",
    "hitD": "M 2060 1293.1 L 2067 1304.1 M 2067 1284.5 L 2074 1295.5",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS) KM 23+750",
      "km": "KM 23+750"
    },
    "endDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS) KM 23+750",
      "km": "KM 23+750"
    }
  },
  {
    "id": "overlap_aj_24400_hu",
    "code": "AJ KM 24+400 HU",
    "title": "Overlap Air Joint (AJ) KM 24+400 (Hulu)",
    "km": "KM 24+400",
    "category": "PEMISAH SEKSI (AS/AJ)",
    "d": "M 1810.3 1285.1 L 1822.9 1304.9 M 1822.9 1285.1 L 1810.3 1304.9",
    "hitD": "M 1810.3 1285.1 L 1822.9 1304.9 M 1822.9 1285.1 L 1810.3 1304.9",
    "color": "#ff00ff",
    "isCrossing": true,
    "startDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ) KM 24+400",
      "km": "KM 24+400"
    },
    "endDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ) KM 24+400",
      "km": "KM 24+400"
    }
  },
  {
    "id": "overlap_aj_25000_hu",
    "code": "AJ KM 25+000 HU",
    "title": "Overlap Air Joint (AJ) KM 25+000 (Hulu)",
    "km": "KM 25+000",
    "category": "PEMISAH SEKSI (AS/AJ)",
    "d": "M 1739.7 1284.6 L 1752.3 1304.4 M 1752.3 1284.6 L 1739.7 1304.4",
    "hitD": "M 1739.7 1284.6 L 1752.3 1304.4 M 1752.3 1284.6 L 1739.7 1304.4",
    "color": "#ff00ff",
    "isCrossing": true,
    "startDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ) KM 25+000",
      "km": "KM 25+000"
    },
    "endDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ) KM 25+000",
      "km": "KM 25+000"
    }
  },
  {
    "id": "overlap_aj_25000_hi",
    "code": "AJ KM 25+000 HI",
    "title": "Overlap Air Joint (AJ) KM 25+000 (Hilir)",
    "km": "KM 25+000",
    "category": "PEMISAH SEKSI (AS/AJ)",
    "d": "M 1739.7 1334.5 L 1752.3 1354.3 M 1752.3 1334.5 L 1739.7 1354.3",
    "hitD": "M 1739.7 1334.5 L 1752.3 1354.3 M 1752.3 1334.5 L 1739.7 1354.3",
    "color": "#00bfff",
    "isCrossing": true,
    "startDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ) KM 25+000",
      "km": "KM 25+000"
    },
    "endDivider": {
      "type": "AJ",
      "label": "Overlap Air Joint (AJ) KM 25+000",
      "km": "KM 25+000"
    }
  },
  {
    "id": "overlap_as_25750_hi",
    "code": "AS KM 25+750 HI",
    "title": "Overlap Air Section (AS) KM 25+750 (Hilir)",
    "km": "KM 25+750",
    "category": "PEMISAH SEKSI (AS/AJ)",
    "d": "M 1625.7 1343.4 L 1632.7 1354.4 M 1632.7 1334.8 L 1639.7 1345.8",
    "hitD": "M 1625.7 1343.4 L 1632.7 1354.4 M 1632.7 1334.8 L 1639.7 1345.8",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS) KM 25+750",
      "km": "KM 25+750"
    },
    "endDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS) KM 25+750",
      "km": "KM 25+750"
    }
  },
  {
    "id": "overlap_as_25750_hu",
    "code": "AS KM 25+750 HU",
    "title": "Overlap Air Section (AS) KM 25+750 (Hulu)",
    "km": "KM 25+750",
    "category": "PEMISAH SEKSI (AS/AJ)",
    "d": "M 1627.2 1293.3 L 1634.2 1304.3 M 1634.2 1284.7 L 1641.2 1295.7",
    "hitD": "M 1627.2 1293.3 L 1634.2 1304.3 M 1634.2 1284.7 L 1641.2 1295.7",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS) KM 25+750",
      "km": "KM 25+750"
    },
    "endDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS) KM 25+750",
      "km": "KM 25+750"
    }
  },
  {
    "id": "overlap_as_26900_hi",
    "code": "AS KM 26+900 HI",
    "title": "Overlap Air Section (AS) KM 26+900 (Hilir)",
    "km": "KM 26+900",
    "category": "PEMISAH SEKSI (AS/AJ)",
    "d": "M 589.3 1343 L 596.3 1354 M 596.3 1334.4 L 603.3 1345.4",
    "hitD": "M 589.3 1343 L 596.3 1354 M 596.3 1334.4 L 603.3 1345.4",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS) KM 26+900",
      "km": "KM 26+900"
    },
    "endDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS) KM 26+900",
      "km": "KM 26+900"
    }
  },
  {
    "id": "overlap_as_26900_hu",
    "code": "AS KM 26+900 HU",
    "title": "Overlap Air Section (AS) KM 26+900 (Hulu)",
    "km": "KM 26+900",
    "category": "PEMISAH SEKSI (AS/AJ)",
    "d": "M 589.3 1293 L 596.3 1304 M 596.3 1284.4 L 603.3 1295.4",
    "hitD": "M 589.3 1293 L 596.3 1304 M 596.3 1284.4 L 603.3 1295.4",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS) KM 26+900",
      "km": "KM 26+900"
    },
    "endDivider": {
      "type": "AS",
      "label": "Overlap Air Section (AS) KM 26+900",
      "km": "KM 26+900"
    }
  },
  {
    "id": "ds_01",
    "code": "DS 1",
    "title": "( Disconnecting Switch 1 (NO) MRI-JNG (HI) )",
    "km": "KM 1+903",
    "category": "DISCONNECTING SWITCH (DS)",
    "d": "M 470.9 784.6 A 3 3 0 1 0 476.9 784.6 A 3 3 0 1 0 470.9 784.6 M 476.3 784.6 L 490.1 776.4 M 487 784.6 A 3 3 0 1 0 493 784.6 A 3 3 0 1 0 487 784.6",
    "hitD": "M 473.9 784.6 L 490 784.6",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "DS",
      "label": "DS 1 (NO)",
      "km": "KM 1+903"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "MRI-JNG (HI)",
      "km": "KM 1+903"
    }
  },
  {
    "id": "ds_02",
    "code": "DS 2",
    "title": "( Disconnecting Switch 2 (NO) JNG-MRI (HU) )",
    "km": "KM 1+854",
    "category": "DISCONNECTING SWITCH (DS)",
    "d": "M 471.4 890.6 A 3 3 0 1 0 477.4 890.6 A 3 3 0 1 0 471.4 890.6 M 488.2 890.6 L 474.7 899 M 487.5 890.6 A 3 3 0 1 0 493.5 890.6 A 3 3 0 1 0 487.5 890.6",
    "hitD": "M 474.4 890.6 L 490.5 890.6",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "DS",
      "label": "DS 2 (NO)",
      "km": "KM 1+854"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "JNG-MRI (HU)",
      "km": "KM 1+854"
    }
  },
  {
    "id": "ds_03",
    "code": "DS 3",
    "title": "( Disconnecting Switch 3 (NC) JALUR 2 )",
    "km": "KM 2+000",
    "category": "DISCONNECTING SWITCH (DS)",
    "d": "M 724.9 795.6 A 3 3 0 1 0 730.9 795.6 A 3 3 0 1 0 724.9 795.6 M 730.3 795.6 L 744.3 787.4 M 741.2 795.6 A 3 3 0 1 0 747.2 795.6 A 3 3 0 1 0 741.2 795.6",
    "hitD": "M 727.9 795.6 L 744.2 795.6",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "DS",
      "label": "DS 3 (NC)",
      "km": "KM 2+000"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "JALUR 2",
      "km": "KM 2+000"
    }
  },
  {
    "id": "ds_04",
    "code": "DS 4",
    "title": "( Disconnecting Switch 4 (NC) JALUR 1 )",
    "km": "KM 2+000",
    "category": "DISCONNECTING SWITCH (DS)",
    "d": "M 725.4 890.6 A 3 3 0 1 0 731.4 890.6 A 3 3 0 1 0 725.4 890.6 M 742.3 890.6 L 728.4 898 M 741.6 890.6 A 3 3 0 1 0 747.6 890.6 A 3 3 0 1 0 741.6 890.6",
    "hitD": "M 728.4 890.6 L 744.6 890.6",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "DS",
      "label": "DS 4 (NC)",
      "km": "KM 2+000"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "JALUR 1",
      "km": "KM 2+000"
    }
  },
  {
    "id": "ds_05",
    "code": "DS 5",
    "title": "( Disconnecting Switch 5 (NC) JALUR 2,3 )",
    "km": "KM 11+900",
    "category": "DISCONNECTING SWITCH (DS)",
    "d": "M 1472.8 750.1 A 3 3 0 1 0 1478.8 750.1 A 3 3 0 1 0 1472.8 750.1 M 1478.3 750.1 L 1492.1 741.7 M 1489.1 750.1 A 3 3 0 1 0 1495.1 750.1 A 3 3 0 1 0 1489.1 750.1",
    "hitD": "M 1475.8 750.1 L 1492.1 750.1",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "DS",
      "label": "DS 5 (NC)",
      "km": "KM 11+900"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "JALUR 2,3",
      "km": "KM 11+900"
    }
  },
  {
    "id": "ds_06",
    "code": "DS 6",
    "title": "( Disconnecting Switch 6 (NC) JALUR 1 )",
    "km": "KM 11+900",
    "category": "DISCONNECTING SWITCH (DS)",
    "d": "M 1472.6 889.8 A 3 3 0 1 0 1478.6 889.8 A 3 3 0 1 0 1472.6 889.8 M 1489.5 889.9 L 1475.7 898.6 M 1488.8 889.8 A 3 3 0 1 0 1494.8 889.8 A 3 3 0 1 0 1488.8 889.8",
    "hitD": "M 1475.6 889.8 L 1491.8 889.8",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "DS",
      "label": "DS 6 (NC)",
      "km": "KM 11+900"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "JALUR 1",
      "km": "KM 11+900"
    }
  },
  {
    "id": "ds_07",
    "code": "DS 7",
    "title": "( Disconnecting Switch 7 (NO) KLD-JNG HI )",
    "km": "KM 12+535",
    "category": "DISCONNECTING SWITCH (DS)",
    "d": "M 1938.2 784.6 A 3 3 0 1 0 1944.2 784.6 A 3 3 0 1 0 1938.2 784.6 M 1943.6 784.6 L 1957.5 776.4 M 1954.4 784.6 A 3 3 0 1 0 1960.4 784.6 A 3 3 0 1 0 1954.4 784.6",
    "hitD": "M 1941.2 784.6 L 1957.4 784.6",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "DS",
      "label": "DS 7 (NO)",
      "km": "KM 12+535"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "KLD-JNG HI",
      "km": "KM 12+535"
    }
  },
  {
    "id": "ds_08",
    "code": "DS 8",
    "title": "( Disconnecting Switch 8 (NO) JNG-KLD HU )",
    "km": "KM 12+483",
    "category": "DISCONNECTING SWITCH (DS)",
    "d": "M 1938.7 891 A 3 3 0 1 0 1944.7 891 A 3 3 0 1 0 1938.7 891 M 1955.7 891 L 1941.8 899.6 M 1955.1 891 A 3 3 0 1 0 1961.1 891 A 3 3 0 1 0 1955.1 891",
    "hitD": "M 1941.7 891 L 1958.1 891",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "DS",
      "label": "DS 8 (NO)",
      "km": "KM 12+483"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "JNG-KLD HU",
      "km": "KM 12+483"
    }
  },
  {
    "id": "ds_09",
    "code": "DS 9",
    "title": "( Disconnecting Switch 9 (NC) KLDB-BUA HI )",
    "km": "KM 17+900",
    "category": "DISCONNECTING SWITCH (DS)",
    "d": "M 2977.2 783 A 3 3 0 1 0 2983.2 783 A 3 3 0 1 0 2977.2 783 M 2982.6 783 L 2996.5 776.3 M 2993.4 783 A 3 3 0 1 0 2999.4 783 A 3 3 0 1 0 2993.4 783",
    "hitD": "M 2980.2 783 L 2996.4 783",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "DS",
      "label": "DS 9 (NC)",
      "km": "KM 17+900"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "KLDB-BUA HI",
      "km": "KM 17+900"
    }
  },
  {
    "id": "ds_10",
    "code": "DS 10",
    "title": "( Disconnecting Switch 10 (NC) BUA-KLDB HU )",
    "km": "KM 17+900",
    "category": "DISCONNECTING SWITCH (DS)",
    "d": "M 2977.7 889.1 A 3 3 0 1 0 2983.7 889.1 A 3 3 0 1 0 2977.7 889.1 M 2994.6 889.1 L 2980.7 895.9 M 2993.9 889.1 A 3 3 0 1 0 2999.9 889.1 A 3 3 0 1 0 2993.9 889.1",
    "hitD": "M 2980.7 889.1 L 2996.9 889.1",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "DS",
      "label": "DS 10 (NC)",
      "km": "KM 17+900"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "BUA-KLDB HU",
      "km": "KM 17+900"
    }
  },
  {
    "id": "ds_11",
    "code": "DS 11",
    "title": "( Disconnecting Switch 11 (NO) CUK-KLDB HI )",
    "km": "KM 20+196",
    "category": "DISCONNECTING SWITCH (DS)",
    "d": "M 2807.2 1299.1 A 3 3 0 1 0 2813.2 1299.1 A 3 3 0 1 0 2807.2 1299.1 M 2812.7 1299.2 L 2826.3 1307.6 M 2823.6 1299.1 A 3 3 0 1 0 2829.6 1299.1 A 3 3 0 1 0 2823.6 1299.1",
    "hitD": "M 2810.2 1299.1 L 2826.6 1299.1",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "DS",
      "label": "DS 11 (NO)",
      "km": "KM 20+196"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "CUK-KLDB HI",
      "km": "KM 20+196"
    }
  },
  {
    "id": "ds_12",
    "code": "DS 12",
    "title": "( Disconnecting Switch 12 (NO) KLDB-CUK HU )",
    "km": "KM 20+137",
    "category": "DISCONNECTING SWITCH (DS)",
    "d": "M 2802.2 1194.4 A 3 3 0 1 0 2808.2 1194.4 A 3 3 0 1 0 2802.2 1194.4 M 2819.2 1194.5 L 2805.3 1186.4 M 2818.4 1194.4 A 3 3 0 1 0 2824.4 1194.4 A 3 3 0 1 0 2818.4 1194.4",
    "hitD": "M 2805.2 1194.4 L 2821.4 1194.4",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "DS",
      "label": "DS 12 (NO)",
      "km": "KM 20+137"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "KLDB-CUK HU",
      "km": "KM 20+137"
    }
  },
  {
    "id": "ds_13",
    "code": "DS 13",
    "title": "( Disconnecting Switch 13 (NC) KRI-CUK HI )",
    "km": "KM 21+400",
    "category": "DISCONNECTING SWITCH (DS)",
    "d": "M 2324.2 1298 A 3 3 0 1 0 2330.2 1298 A 3 3 0 1 0 2324.2 1298 M 2329.6 1298.1 L 2343.5 1304.8 M 2340.4 1298 A 3 3 0 1 0 2346.4 1298 A 3 3 0 1 0 2340.4 1298",
    "hitD": "M 2327.2 1298 L 2343.4 1298",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "DS",
      "label": "DS 13 (NC)",
      "km": "KM 21+400"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "KRI-CUK HI",
      "km": "KM 21+400"
    }
  },
  {
    "id": "ds_14",
    "code": "DS 14",
    "title": "( Disconnecting Switch 14 (NC) CUK-KRI HU )",
    "km": "KM 21+400",
    "category": "DISCONNECTING SWITCH (DS)",
    "d": "M 2324.8 1192 A 3 3 0 1 0 2330.8 1192 A 3 3 0 1 0 2324.8 1192 M 2341.6 1192 L 2327.8 1185.3 M 2340.9 1192 A 3 3 0 1 0 2346.9 1192 A 3 3 0 1 0 2340.9 1192",
    "hitD": "M 2327.8 1192 L 2343.9 1192",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "DS",
      "label": "DS 14 (NC)",
      "km": "KM 21+400"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "CUK-KRI HU",
      "km": "KM 21+400"
    }
  },
  {
    "id": "ds_15",
    "code": "DS 15",
    "title": "( Disconnecting Switch 15 (NC) EMP BKS (HI) )",
    "km": "KM 26+226",
    "category": "DISCONNECTING SWITCH (DS)",
    "d": "M 1379.3 1294.5 A 3 3 0 1 0 1385.3 1294.5 A 3 3 0 1 0 1379.3 1294.5 M 1391.9 1296.2 L 1381.5 1302 M 1390.8 1294.9 A 3 3 0 1 0 1396.8 1294.9 A 3 3 0 1 0 1390.8 1294.9",
    "hitD": "M 1382.3 1294.5 L 1393.8 1294.9",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "DS",
      "label": "DS 15 (NC)",
      "km": "KM 26+226"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "EMP BKS (HI)",
      "km": "KM 26+226"
    }
  },
  {
    "id": "ds_16",
    "code": "DS 16",
    "title": "( Disconnecting Switch 16 (NC) EMP BKS (HU) )",
    "km": "KM 26+200",
    "category": "DISCONNECTING SWITCH (DS)",
    "d": "M 1379.4 1199 A 3 3 0 1 0 1385.4 1199 A 3 3 0 1 0 1379.4 1199 M 1396.1 1199.1 L 1383.3 1192 M 1395.2 1199 A 3 3 0 1 0 1401.2 1199 A 3 3 0 1 0 1395.2 1199",
    "hitD": "M 1382.4 1199 L 1398.2 1199",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "DS",
      "label": "DS 16 (NC)",
      "km": "KM 26+200"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "EMP BKS (HU)",
      "km": "KM 26+200"
    }
  },
  {
    "id": "ds_17",
    "code": "DS 17",
    "title": "( Disconnecting Switch 17 (NC) EMP BKS (4-5) )",
    "km": "KM 26+300",
    "category": "DISCONNECTING SWITCH (DS)",
    "d": "M 1250.2 1414 A 3 3 0 1 0 1256.2 1414 A 3 3 0 1 0 1250.2 1414 M 1253.3 1411.7 L 1244.9 1397.9 M 1250.2 1397.9 A 3 3 0 1 0 1256.2 1397.9 A 3 3 0 1 0 1250.2 1397.9",
    "hitD": "M 1253.2 1414 L 1253.2 1397.9",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "DS",
      "label": "DS 17 (NC)",
      "km": "KM 26+300"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "EMP BKS (4-5)",
      "km": "KM 26+300"
    }
  },
  {
    "id": "ds_18",
    "code": "DS 18",
    "title": "( Disconnecting Switch 18 (NC) EMP BKS (6-7,8) )",
    "km": "KM 26+300",
    "category": "DISCONNECTING SWITCH (DS)",
    "d": "M 1196.1 1414.1 A 3 3 0 1 0 1202.1 1414.1 A 3 3 0 1 0 1196.1 1414.1 M 1199.1 1411.8 L 1190.9 1398 M 1196.1 1398 A 3 3 0 1 0 1202.1 1398 A 3 3 0 1 0 1196.1 1398",
    "hitD": "M 1199.1 1414.1 L 1199.1 1398",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "DS",
      "label": "DS 18 (NC)",
      "km": "KM 26+300"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "EMP BKS (6-7,8)",
      "km": "KM 26+300"
    }
  },
  {
    "id": "ds_19",
    "code": "DS 19",
    "title": "( Disconnecting Switch 19 (NC) BKT-BKS (HI) )",
    "km": "KM 26+800",
    "category": "DISCONNECTING SWITCH (DS)",
    "d": "M 635.7 1295.4 A 3 3 0 1 0 641.7 1295.4 A 3 3 0 1 0 635.7 1295.4 M 641.2 1295.4 L 653.9 1302.5 M 651.5 1295.4 A 3 3 0 1 0 657.5 1295.4 A 3 3 0 1 0 651.5 1295.4",
    "hitD": "M 638.7 1295.4 L 654.5 1295.4",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "DS",
      "label": "DS 19 (NC)",
      "km": "KM 26+800"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "BKT-BKS (HI)",
      "km": "KM 26+800"
    }
  },
  {
    "id": "ds_20",
    "code": "DS 20",
    "title": "( Disconnecting Switch 20 (NC) BKS-BKT (HU) )",
    "km": "KM 26+800",
    "category": "DISCONNECTING SWITCH (DS)",
    "d": "M 634.8 1199.6 A 3 3 0 1 0 640.8 1199.6 A 3 3 0 1 0 634.8 1199.6 M 651.4 1199.7 L 638.6 1192.5 M 650.7 1199.6 A 3 3 0 1 0 656.7 1199.6 A 3 3 0 1 0 650.7 1199.6",
    "hitD": "M 637.8 1199.6 L 653.7 1199.6",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "DS",
      "label": "DS 20 (NC)",
      "km": "KM 26+800"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "BKS-BKT (HU)",
      "km": "KM 26+800"
    }
  },
  {
    "id": "frp_jng_01_31a1",
    "code": "FRP-JNG-01-31A1",
    "title": "( Section Insulator (FRP-JNG-01-31A1) )",
    "km": "KM 11+350",
    "category": "SECTION INSULATOR (FRP)",
    "d": "M 568.84 835.76 L 574 840.68 M 573.04 831.8 L 578.2 836.72",
    "hitD": "M 568.84 835.76 L 574 840.68 M 573.04 831.8 L 578.2 836.72 M 571.42 838.22 L 575.62 834.26",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "FRP",
      "label": "( Section Insulator (FRP-JNG-01-31A1) )",
      "km": "KM 11+350"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "Wesel W31A1 Jatinegara",
      "km": "KM 11+350"
    }
  },
  {
    "id": "frp_jng_02_11a",
    "code": "FRP-JNG-02-11A",
    "title": "( Section Insulator (FRP-JNG-02-11A) )",
    "km": "KM 11+500",
    "category": "SECTION INSULATOR (FRP)",
    "d": "M 652.84 785.24 L 658 790.28 M 657.04 781.28 L 662.2 786.32",
    "hitD": "M 652.84 785.24 L 658 790.28 M 657.04 781.28 L 662.2 786.32 M 655.42 787.76 L 659.62 783.8",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "FRP",
      "label": "( Section Insulator (FRP-JNG-02-11A) )",
      "km": "KM 11+500"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "Wesel W11A Jatinegara",
      "km": "KM 11+500"
    }
  },
  {
    "id": "frp_jng_03_21a2",
    "code": "FRP-JNG-03-21A2",
    "title": "( Section Insulator (FRP-JNG-03-21A2) )",
    "km": "KM 11+600",
    "category": "SECTION INSULATOR (FRP)",
    "d": "M 790.48 759.44 L 790.6 766.64 M 796.24 759.56 L 796.36 766.64",
    "hitD": "M 790.48 759.44 L 790.6 766.64 M 796.24 759.56 L 796.36 766.64 M 790.54 763.04 L 796.3 763.1",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "FRP",
      "label": "( Section Insulator (FRP-JNG-03-21A2) )",
      "km": "KM 11+600"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "Wesel W21A2 Jatinegara",
      "km": "KM 11+600"
    }
  },
  {
    "id": "frp_jng_04_31c1",
    "code": "FRP-JNG-04-31C1",
    "title": "( Section Insulator (FRP-JNG-04-31C1) )",
    "km": "KM 11+800",
    "category": "SECTION INSULATOR (FRP)",
    "d": "M 976.96 843.92 L 972.28 849.44 M 980.92 847.52 L 976.24 852.92",
    "hitD": "M 976.96 843.92 L 972.28 849.44 M 980.92 847.52 L 976.24 852.92 M 974.62 846.68 L 978.58 850.22",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "FRP",
      "label": "( Section Insulator (FRP-JNG-04-31C1) )",
      "km": "KM 11+800"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "Wesel W31C1 Jatinegara",
      "km": "KM 11+800"
    }
  },
  {
    "id": "frp_jng_05_31c2",
    "code": "FRP-JNG-05-31C2",
    "title": "( Section Insulator (FRP-JNG-05-31C2) )",
    "km": "KM 11+800",
    "category": "SECTION INSULATOR (FRP)",
    "d": "M 952.48 849.32 L 947.8 843.92 M 948.4 852.8 L 943.72 847.4",
    "hitD": "M 952.48 849.32 L 947.8 843.92 M 948.4 852.8 L 943.72 847.4 M 950.14 846.62 L 946.06 850.1",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "FRP",
      "label": "( Section Insulator (FRP-JNG-05-31C2) )",
      "km": "KM 11+800"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "Wesel W31C2 Jatinegara",
      "km": "KM 11+800"
    }
  },
  {
    "id": "frp_jng_06_41b",
    "code": "FRP-JNG-06-41B",
    "title": "( Section Insulator (FRP-JNG-06-41B) )",
    "km": "KM 11+500",
    "category": "SECTION INSULATOR (FRP)",
    "d": "M 1014.04 644.48 L 1019.2 649.52 M 1018.24 640.52 L 1023.4 645.56",
    "hitD": "M 1014.04 644.48 L 1019.2 649.52 M 1018.24 640.52 L 1023.4 645.56 M 1016.62 647 L 1020.82 643.04",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "FRP",
      "label": "( Section Insulator (FRP-JNG-06-41B) )",
      "km": "KM 11+500"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "Wesel W41B Jatinegara",
      "km": "KM 11+500"
    }
  },
  {
    "id": "frp_jng_07_21c1",
    "code": "FRP-JNG-07-21C1",
    "title": "( Section Insulator (FRP-JNG-07-21C1) )",
    "km": "KM 11+448",
    "category": "SECTION INSULATOR (FRP)",
    "d": "M 820.84 620.12 L 815.44 624.92 M 824.32 624.32 L 818.92 629",
    "hitD": "M 820.84 620.12 L 815.44 624.92 M 824.32 624.32 L 818.92 629 M 818.14 622.52 L 821.62 626.66",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "FRP",
      "label": "( Section Insulator (FRP-JNG-07-21C1) )",
      "km": "KM 11+448"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "Wesel W21C1 Jatinegara",
      "km": "KM 11+448"
    }
  },
  {
    "id": "frp_jng_08_81a1",
    "code": "FRP-JNG-08-81A1",
    "title": "( Section Insulator (FRP-JNG-08-81A1) )",
    "km": "KM 11+350",
    "category": "SECTION INSULATOR (FRP)",
    "d": "M 670.6 536 L 665.8 541.4 M 674.56 539.6 L 669.88 545",
    "hitD": "M 670.6 536 L 665.8 541.4 M 674.56 539.6 L 669.88 545 M 668.2 538.7 L 672.22 542.3",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "FRP",
      "label": "( Section Insulator (FRP-JNG-08-81A1) )",
      "km": "KM 11+350"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "Wesel W81A1 Jatinegara",
      "km": "KM 11+350"
    }
  },
  {
    "id": "frp_jng_09_81a2",
    "code": "FRP-JNG-09-81A2",
    "title": "( Section Insulator (FRP-JNG-09-81A2) )",
    "km": "KM 11+350",
    "category": "SECTION INSULATOR (FRP)",
    "d": "M 692.92 539.36 L 697.48 544.88 M 697.12 535.88 L 701.68 541.52",
    "hitD": "M 692.92 539.36 L 697.48 544.88 M 697.12 535.88 L 701.68 541.52 M 695.2 542.12 L 699.4 538.7",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "FRP",
      "label": "( Section Insulator (FRP-JNG-09-81A2) )",
      "km": "KM 11+350"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "Wesel W81A2 Jatinegara",
      "km": "KM 11+350"
    }
  },
  {
    "id": "frp_jng_10_jalur_4",
    "code": "FRP-JNG-10-JALUR 4",
    "title": "( Section Insulator (FRP-JNG-10-JALUR 4) )",
    "km": "KM 12+089",
    "category": "SECTION INSULATOR (FRP)",
    "d": "M 1628.32 714.08 L 1628.44 721.16 M 1633.84 714.08 L 1634.08 721.16",
    "hitD": "M 1628.32 714.08 L 1628.44 721.16 M 1633.84 714.08 L 1634.08 721.16 M 1628.38 717.62 L 1633.96 717.62",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "FRP",
      "label": "( Section Insulator (FRP-JNG-10-JALUR 4) )",
      "km": "KM 12+089"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "Jalur 4 Jatinegara",
      "km": "KM 12+089"
    }
  },
  {
    "id": "frp_jng_11_23b2",
    "code": "FRP-JNG-11-23B2",
    "title": "( Section Insulator (FRP-JNG-11-23B2) )",
    "km": "KM 12+000",
    "category": "SECTION INSULATOR (FRP)",
    "d": "M 1616.56 734.84 L 1611.16 739.64 M 1620.04 739.04 L 1614.64 743.72",
    "hitD": "M 1616.56 734.84 L 1611.16 739.64 M 1620.04 739.04 L 1614.64 743.72 M 1613.86 737.24 L 1617.34 741.38",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "FRP",
      "label": "( Section Insulator (FRP-JNG-11-23B2) )",
      "km": "KM 12+000"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "Wesel W23B2 Jatinegara",
      "km": "KM 12+000"
    }
  },
  {
    "id": "frp_jng_13_13d1",
    "code": "FRP-JNG-13-13D1",
    "title": "( Section Insulator (FRP-JNG-13-13D1) )",
    "km": "KM 12+384",
    "category": "SECTION INSULATOR (FRP)",
    "d": "M 1712.68 735.08 L 1707.28 739.76 M 1716.16 739.16 L 1710.64 743.96",
    "hitD": "M 1712.68 735.08 L 1707.28 739.76 M 1716.16 739.16 L 1710.64 743.96 M 1709.98 737.42 L 1713.4 741.56",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "FRP",
      "label": "( Section Insulator (FRP-JNG-13-13D1) )",
      "km": "KM 12+384"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "Wesel W13D1 Jatinegara",
      "km": "KM 12+384"
    }
  },
  {
    "id": "frp_jng_14_33b2",
    "code": "FRP-JNG-14-33B2",
    "title": "( Section Insulator (FRP-JNG-14-33B2) )",
    "km": "KM 12+250",
    "category": "SECTION INSULATOR (FRP)",
    "d": "M 1769.68 830.6 L 1764.16 835.28 M 1773.16 834.68 L 1767.64 839.36",
    "hitD": "M 1769.68 830.6 L 1764.16 835.28 M 1773.16 834.68 L 1767.64 839.36 M 1766.92 832.94 L 1770.4 837.02",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "FRP",
      "label": "( Section Insulator (FRP-JNG-14-33B2) )",
      "km": "KM 12+250"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "Wesel W33B2 Jatinegara",
      "km": "KM 12+250"
    }
  },
  {
    "id": "frp_jng_15_33c1",
    "code": "FRP-JNG-15-33C1",
    "title": "( Section Insulator (FRP-JNG-15-33C1) )",
    "km": "KM 12+283",
    "category": "SECTION INSULATOR (FRP)",
    "d": "M 1769.68 782.48 L 1764.16 787.16 M 1773.16 786.56 L 1767.64 791.24",
    "hitD": "M 1769.68 782.48 L 1764.16 787.16 M 1773.16 786.56 L 1767.64 791.24 M 1766.92 784.82 L 1770.4 788.9",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "FRP",
      "label": "( Section Insulator (FRP-JNG-15-33C1) )",
      "km": "KM 12+283"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "Wesel W33C1 Jatinegara",
      "km": "KM 12+283"
    }
  },
  {
    "id": "frp_jng_16_33c2",
    "code": "FRP-JNG-16-33C2",
    "title": "( Section Insulator (FRP-JNG-16-33C2) )",
    "km": "KM 12+350",
    "category": "SECTION INSULATOR (FRP)",
    "d": "M 1854.04 830.6 L 1848.64 835.28 M 1857.52 834.68 L 1852 839.36",
    "hitD": "M 1854.04 830.6 L 1848.64 835.28 M 1857.52 834.68 L 1852 839.36 M 1851.34 832.94 L 1854.76 837.02",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "FRP",
      "label": "( Section Insulator (FRP-JNG-16-33C2) )",
      "km": "KM 12+350"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "Wesel W33C2 Jatinegara",
      "km": "KM 12+350"
    }
  },
  {
    "id": "frp_jng_17_11a",
    "code": "FRP-JNG-17-11A",
    "title": "( Section Insulator (FRP-JNG-17-11A) )",
    "km": "KM 20+800",
    "category": "SECTION INSULATOR (FRP)",
    "d": "M 2645.8 1322.88 L 2650.84 1317.72 M 2641.72 1318.08 L 2646.76 1312.92",
    "hitD": "M 2645.8 1322.88 L 2650.84 1317.72 M 2641.72 1318.08 L 2646.76 1312.92 M 2648.32 1320.3 L 2644.24 1315.5",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "FRP",
      "label": "( Section Insulator (FRP-JNG-17-11A) )",
      "km": "KM 20+740"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "Wesel W11A Cakung",
      "km": "KM 20+740"
    }
  },
  {
    "id": "frp_jng_18_23b",
    "code": "FRP-JNG-18-23B",
    "title": "( Section Insulator (FRP-JNG-18-23B) )",
    "km": "KM 21+445",
    "category": "SECTION INSULATOR (FRP)",
    "d": "M 2382.28 1317.96 L 2388.28 1321.92 M 2386.12 1313.04 L 2392.12 1317",
    "hitD": "M 2382.28 1317.96 L 2388.28 1321.92 M 2386.12 1313.04 L 2392.12 1317 M 2385.28 1319.94 L 2389.12 1315.02",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "FRP",
      "label": "( Section Insulator (FRP-JNG-18-23B) )",
      "km": "KM 21+445"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "Wesel W23B Cakung",
      "km": "KM 21+445"
    }
  },
  {
    "id": "frp_jng_19_51a",
    "code": "FRP-JNG-19-51A",
    "title": "( Section Insulator (FRP-JNG-19-51A) )",
    "km": "KM 25+950",
    "category": "SECTION INSULATOR (FRP)",
    "d": "M 1524.76 1323.72 L 1530.28 1319.04 M 1521.28 1319.64 L 1526.8 1314.96",
    "hitD": "M 1524.76 1323.72 L 1530.28 1319.04 M 1521.28 1319.64 L 1526.8 1314.96 M 1527.52 1321.38 L 1524.04 1317.3",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "FRP",
      "label": "( Section Insulator (FRP-JNG-19-51A) )",
      "km": "KM 25+950"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "Wesel W51A Bekasi",
      "km": "KM 25+950"
    }
  },
  {
    "id": "frp_jng_20_51b",
    "code": "FRP-JNG-20-51B",
    "title": "( Section Insulator (FRP-JNG-20-51B) )",
    "km": "KM 26+050",
    "category": "SECTION INSULATOR (FRP)",
    "d": "M 1456.72 1321.2 L 1451.56 1316.16 M 1452.52 1325.16 L 1447.36 1320.12",
    "hitD": "M 1456.72 1321.2 L 1451.56 1316.16 M 1452.52 1325.16 L 1447.36 1320.12 M 1454.14 1318.68 L 1449.94 1322.64",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "FRP",
      "label": "( Section Insulator (FRP-JNG-20-51B) )",
      "km": "KM 26+050"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "Wesel W51B Bekasi",
      "km": "KM 26+050"
    }
  },
  {
    "id": "frp_jng_21_jalur_5",
    "code": "FRP-JNG-21-JALUR 5",
    "title": "( Section Insulator (FRP-JNG-21-JALUR 5) )",
    "km": "KM 26+100",
    "category": "SECTION INSULATOR (FRP)",
    "d": "M 1389.64 1339.8 L 1389.4 1347 M 1383.88 1339.92 L 1383.64 1347",
    "hitD": "M 1389.64 1339.8 L 1389.4 1347 M 1383.88 1339.92 L 1383.64 1347 M 1389.52 1343.4 L 1383.76 1343.46",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "FRP",
      "label": "( Section Insulator (FRP-JNG-21-JALUR 5) )",
      "km": "KM 26+100"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "Jalur 5 Bekasi",
      "km": "KM 26+100"
    }
  },
  {
    "id": "frp_jng_22_jalur_6",
    "code": "FRP-JNG-22-JALUR 6",
    "title": "( Section Insulator (FRP-JNG-22-JALUR 6) )",
    "km": "KM 26+150",
    "category": "SECTION INSULATOR (FRP)",
    "d": "M 1393 1290.24 L 1392.88 1297.44 M 1387.24 1290.24 L 1387.12 1297.44",
    "hitD": "M 1393 1290.24 L 1392.88 1297.44 M 1387.24 1290.24 L 1387.12 1297.44 M 1392.94 1293.84 L 1387.18 1293.84",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "FRP",
      "label": "( Section Insulator (FRP-JNG-22-JALUR 6) )",
      "km": "KM 26+150"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "Jalur 6 Bekasi",
      "km": "KM 26+150"
    }
  },
  {
    "id": "frp_jng_23_71c1",
    "code": "FRP-JNG-23-71C1",
    "title": "( Section Insulator (FRP-JNG-23-71C1) )",
    "km": "KM 26+300",
    "category": "SECTION INSULATOR (FRP)",
    "d": "M 1319.8 1273.44 L 1325.2 1268.76 M 1316.32 1269.24 L 1321.72 1264.56",
    "hitD": "M 1319.8 1273.44 L 1325.2 1268.76 M 1316.32 1269.24 L 1321.72 1264.56 M 1322.5 1271.1 L 1319.02 1266.9",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "FRP",
      "label": "( Section Insulator (FRP-JNG-23-71C1) )",
      "km": "KM 26+300"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "Wesel W71C1 Bekasi",
      "km": "KM 26+300"
    }
  },
  {
    "id": "frp_jng_24_51c",
    "code": "FRP-JNG-24-51C",
    "title": "( Section Insulator (FRP-JNG-24-51C) )",
    "km": "KM 26+350",
    "category": "SECTION INSULATOR (FRP)",
    "d": "M 1326.04 1372.56 L 1320.88 1367.64 M 1321.84 1376.52 L 1316.68 1371.6",
    "hitD": "M 1326.04 1372.56 L 1320.88 1367.64 M 1321.84 1376.52 L 1316.68 1371.6 M 1323.46 1370.1 L 1319.26 1374.06",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "FRP",
      "label": "( Section Insulator (FRP-JNG-24-51C) )",
      "km": "KM 26+350"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "Wesel W51C Bekasi",
      "km": "KM 26+350"
    }
  },
  {
    "id": "frp_jng_25_33a",
    "code": "FRP-JNG-25-33A",
    "title": "( Section Insulator (FRP-JNG-25-33A) )",
    "km": "KM 26+600",
    "category": "SECTION INSULATOR (FRP)",
    "d": "M 798.4 1376.4 L 803.8 1371.72 M 794.92 1372.32 L 800.32 1367.64",
    "hitD": "M 798.4 1376.4 L 803.8 1371.72 M 794.92 1372.32 L 800.32 1367.64 M 801.1 1374.06 L 797.62 1369.98",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "FRP",
      "label": "( Section Insulator (FRP-JNG-25-33A) )",
      "km": "KM 26+600"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "Wesel W33A Bekasi",
      "km": "KM 26+600"
    }
  },
  {
    "id": "frp_jng_26_73",
    "code": "FRP-JNG-26-73",
    "title": "( Section Insulator (FRP-JNG-26-73) )",
    "km": "KM 26+500",
    "category": "SECTION INSULATOR (FRP)",
    "d": "M 805.36 1265.64 L 810.52 1270.68 M 809.56 1261.68 L 814.72 1266.72",
    "hitD": "M 805.36 1265.64 L 810.52 1270.68 M 809.56 1261.68 L 814.72 1266.72 M 807.94 1268.16 L 812.14 1264.2",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "FRP",
      "label": "( Section Insulator (FRP-JNG-26-73) )",
      "km": "KM 26+500"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "Wesel W73 Bekasi",
      "km": "KM 26+500"
    }
  }
];

export const allTrackLines = ALL_TRACK_LINES;

// Smart line-to-log matching function (Strict 1-to-1 Isolation, Direction Guard, Track Number Guard & Device Isolation)
export const matchLineLogs = (lineOrCode, logs = []) => {
  if (!lineOrCode || !logs || !Array.isArray(logs) || logs.length === 0) return [];
  const lineObj = typeof lineOrCode === 'object' ? lineOrCode : null;
  const lineCode = (typeof lineOrCode === 'string' ? lineOrCode : (lineObj?.code || '')).trim();
  const lineTitle = (lineObj?.title || '').trim();
  const lineId = (lineObj?.id || '').trim();
  const lineCat = (lineObj?.category || '').toUpperCase();
  const combinedLine = `${lineTitle} ${lineCode} ${lineId}`.toLowerCase();

  const isSwitchLine = lineCat.includes('DISCONNECTING SWITCH') || lineCat.includes('(DS)') || lineId.startsWith('ds_');
  const isInsulatorLine = lineCat.includes('SECTION INSULATOR') || lineCat.includes('(FRP)') || lineId.startsWith('frp_');
  const isAirJointLine = lineCat.includes('AIR JOINT') || lineCat.includes('(AJ)') || lineId.startsWith('aj_') || lineId.startsWith('overlap_aj_');
  const isAirSectionLine = lineCat.includes('AIR SECTION') || lineCat.includes('(AS)') || lineId.startsWith('as_') || lineId.startsWith('overlap_as_');
  const isTurnoutLine = lineCat.includes('WESEL') || lineId.startsWith('wesel_') || lineId.startsWith('titik_wesel_');
  const isAuxiliaryDevice = isSwitchLine || isInsulatorLine || isAirJointLine || isAirSectionLine || isTurnoutLine;

  return logs.filter((log) => {
    if (!log) return false;
    const tc = (log.targetCode || '').trim();
    if (!tc) return false;

    // 1. Direct ID match (highest priority)
    if (log.targetId && lineId && log.targetId.toLowerCase() === lineId.toLowerCase()) {
      return true;
    }

    const normTc = tc.toLowerCase();
    const normLineCode = lineCode.toLowerCase();
    const normLineTitle = lineTitle.toLowerCase();
    const normLineId = lineId.toLowerCase();

    const cleanTc = normTc.replace(/\s+/g, ' ');
    const cleanLineCode = normLineCode.replace(/\s+/g, ' ');
    const cleanLineTitle = normLineTitle.replace(/\s+/g, ' ');
    const cleanLineId = normLineId.replace(/\s+/g, ' ');

    // 2. Direct exact string match (case-insensitive & space-normalized)
    if (
      (cleanLineCode && cleanTc === cleanLineCode) ||
      (cleanLineTitle && cleanTc === cleanLineTitle) ||
      (cleanLineId && cleanTc === cleanLineId)
    ) {
      return true;
    }

    // 2b. Exact Alphanumeric Match (immune to punctuation/bracket differences)
    const alphaTc = normTc.replace(/[^a-z0-9]/g, '');
    const alphaLineTitle = normLineTitle.replace(/[^a-z0-9]/g, '');
    const alphaLineCode = normLineCode.replace(/[^a-z0-9]/g, '');
    const alphaLineId = normLineId.replace(/[^a-z0-9]/g, '');

    if (alphaTc && (alphaTc === alphaLineTitle || alphaTc === alphaLineCode || alphaTc === alphaLineId)) {
      return true;
    }

    // 3. Legacy compatibility mappings (prevent multi-track flare-up from historical generic logs)
    if (normTc === 'naspan 9 empl cuk') {
      return lineId === 'cuk_jalur_1_empl';
    }
    if (normTc === 'st. bekasi') {
      return lineId === 'bks_jalur_1_platform';
    }

    // 4. Auxiliary Device Guard (DS, FRP, AJ, AS, Wesel)
    const logIsTrack = /^(naspan|jalur|petak|st\.|stasiun)/i.test(tc);
    if (logIsTrack && isAuxiliaryDevice) {
      return false;
    }

    if (isSwitchLine) {
      const dsMatch = lineCode.match(/DS\s*(\d+[A-Z]?)/i) || lineId.match(/ds_?(\d+[A-Z]?)/i);
      if (dsMatch) {
        const num = dsMatch[1];
        const regex = new RegExp(`(^|\\b)DS\\s*-?\\s*${num}\\b`, 'i');
        return regex.test(tc);
      }
      return false;
    }

    if (isInsulatorLine) {
      const frpMatch = lineCode.match(/FRP[^\s)]*/i) || lineId.match(/frp[^\s)]*/i);
      if (frpMatch) {
        return normTc.includes(frpMatch[0].toLowerCase());
      }
      return false;
    }

    if (isTurnoutLine) {
      const wMatch = lineCode.match(/W\d{2}[A-Z0-9]*/i) || lineId.match(/w\d{2}[a-z0-9]*/i);
      if (wMatch) {
        const wCode = wMatch[0].toLowerCase();
        const regex = new RegExp(`(^|\\b|wesel\\s*)${wCode}\\b`, 'i');
        if (regex.test(normTc)) {
          if (normTc.includes('cakung') && !combinedLine.includes('cakung') && !lineId.includes('cuk')) return false;
          if (normTc.includes('bekasi') && !combinedLine.includes('bekasi') && !lineId.includes('bks') && !lineId.includes('bkt')) return false;
          if (normTc.includes('jatinegara') && !combinedLine.includes('jatinegara') && !lineId.includes('jng')) return false;
          return true;
        }
      }
      return false;
    }

    if (isAirJointLine || isAirSectionLine) {
      const logKmMatch = tc.match(/KM\s*(\d+\+?\d*)/i);
      const lineKmMatch = (lineObj?.km || lineTitle).match(/KM\s*(\d+\+?\d*)/i);
      if (logKmMatch && lineKmMatch && logKmMatch[1] !== lineKmMatch[1]) {
        return false;
      }
    }

    // 5. Strict Track Number Guard (Jalur 1 vs Jalur 2 vs Jalur 3 vs Jalur 4 vs Jalur 8 etc.)
    const logJalurMatch = tc.match(/\b(?:jalur|jl\.?)\s*(\d+)\b/i);
    const lineJalurMatch = `${lineTitle} ${lineCode}`.match(/\b(?:jalur|jl\.?)\s*(\d+)\b/i);
    if (logJalurMatch && lineJalurMatch && logJalurMatch[1] !== lineJalurMatch[1]) {
      return false;
    }

    // 6. Strict Direction Guard (HI/Hilir vs HU/Hulu)
    const logIsHi = /\b(hi|hilir)\b/i.test(tc);
    const logIsHu = /\b(hu|hulu)\b/i.test(tc);
    const lineIsHi = /\b(hi|hilir)\b/i.test(`${lineTitle} ${lineCode}`) || lineId.endsWith('_hi');
    const lineIsHu = /\b(hu|hulu)\b/i.test(`${lineTitle} ${lineCode}`) || lineId.endsWith('_hu');
    if (logIsHi && lineIsHu && !lineIsHi) return false;
    if (logIsHu && lineIsHi && !lineIsHu) return false;

    // 7. Strict Station Guard (Cakung, Bekasi, Jatinegara, etc.)
    const stations = ['cakung', 'bekasi', 'jatinegara', 'kranji', 'klender baru', 'buaran', 'pondok jati', 'klender'];
    for (const st of stations) {
      if (normTc.includes(st) && !combinedLine.includes(st)) {
        return false;
      }
    }

    // 8. Specific Peron vs Emplasemen / Stabling Guard
    if (normTc.includes('peron') && combinedLine.includes('emplasemen') && !combinedLine.includes('peron')) {
      return false;
    }
    if (normTc.includes('emplasemen') && combinedLine.includes('peron') && !combinedLine.includes('emplasemen')) {
      return false;
    }
    if (normTc.includes('stabling') && !combinedLine.includes('stabling') && !combinedLine.includes('langsir')) {
      return false;
    }

    // 10. Intelligent Station + Jalur Matching for natural user inputs
    // e.g. "ST. BEKASI (Jalur 1)" or "Jalur 1 St. Bekasi" matching "ST. BEKASI (Jalur 1 Peron Utama Hulu)"
    if (logJalurMatch && lineJalurMatch && logJalurMatch[1] === lineJalurMatch[1]) {
      for (const st of stations) {
        if (normTc.includes(st) && combinedLine.includes(st)) {
          return true;
        }
      }
    }

    return false;
  });
};

// Calculate center coordinate (X, Y) accurately lying directly on the track line (50% distance along SVG path)
export const getLineCenter = (line) => {
  if (!line) return null;
  if (line.center) return line.center;
  if (line.cx !== undefined && line.cy !== undefined) {
    return { x: line.cx, y: line.cy };
  }
  if (line.xStart !== undefined && line.xEnd !== undefined && line.y !== undefined) {
    return { x: (line.xStart + line.xEnd) / 2, y: line.y };
  }
  const d = line.d || '';
  if (!d) return null;

  const commandRegex = /([a-df-z])([^a-df-z]*)/gi;
  let match;
  const points = [];
  let currX = 0, currY = 0;

  while ((match = commandRegex.exec(d)) !== null) {
    const cmd = match[1];
    const rawNums = match[2].trim().match(/[-+]?[0-9]*\.?[0-9]+/g);
    const nums = rawNums ? rawNums.map(Number) : [];

    if (cmd === 'M' || cmd === 'L') {
      for (let i = 0; i < nums.length - 1; i += 2) {
        currX = nums[i];
        currY = nums[i + 1];
        points.push({ x: currX, y: currY });
      }
    } else if (cmd === 'm' || cmd === 'l') {
      for (let i = 0; i < nums.length - 1; i += 2) {
        currX += nums[i];
        currY += nums[i + 1];
        points.push({ x: currX, y: currY });
      }
    } else if (cmd === 'H') {
      for (const x of nums) {
        currX = x;
        points.push({ x: currX, y: currY });
      }
    } else if (cmd === 'h') {
      for (const dx of nums) {
        currX += dx;
        points.push({ x: currX, y: currY });
      }
    } else if (cmd === 'V') {
      for (const y of nums) {
        currY = y;
        points.push({ x: currX, y: currY });
      }
    } else if (cmd === 'v') {
      for (const dy of nums) {
        currY += dy;
        points.push({ x: currX, y: currY });
      }
    } else if (cmd === 'A') {
      for (let i = 0; i < nums.length - 6; i += 7) {
        currX = nums[i + 5];
        currY = nums[i + 6];
        points.push({ x: currX, y: currY });
      }
    } else if (cmd === 'a') {
      for (let i = 0; i < nums.length - 6; i += 7) {
        currX += nums[i + 5];
        currY += nums[i + 6];
        points.push({ x: currX, y: currY });
      }
    }
  }

  if (points.length === 0) {
    const rawNums = d.match(/[-+]?[0-9]*\.?[0-9]+/g);
    if (!rawNums || rawNums.length < 2) return null;
    return { x: parseFloat(rawNums[0]), y: parseFloat(rawNums[1]) };
  }
  if (points.length === 1) {
    return points[0];
  }

  // Calculate cumulative distance along path
  let totalLength = 0;
  const segLengths = [];
  for (let i = 0; i < points.length - 1; i++) {
    const dx = points[i + 1].x - points[i].x;
    const dy = points[i + 1].y - points[i].y;
    const dist = Math.hypot(dx, dy);
    segLengths.push(dist);
    totalLength += dist;
  }

  if (totalLength === 0) return points[0];

  const halfLength = totalLength / 2;
  let accumulated = 0;
  for (let i = 0; i < segLengths.length; i++) {
    const dist = segLengths[i];
    if (accumulated + dist >= halfLength) {
      const remaining = halfLength - accumulated;
      const ratio = dist > 0 ? remaining / dist : 0;
      const x = points[i].x + (points[i + 1].x - points[i].x) * ratio;
      const y = points[i].y + (points[i + 1].y - points[i].y) * ratio;
      return { x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) };
    }
    accumulated += dist;
  }

  return points[points.length - 1];
};

// Pre-calculate all lines that have active maintenance work logs
export const computeLinesWithLogs = (logs = []) => {
  const list = [];
  ALL_TRACK_LINES.forEach((line) => {
    const lineLogs = matchLineLogs(line, logs);
    if (lineLogs.length > 0) {
      const center = getLineCenter(line);
      if (center) {
        list.push({
          line,
          logs: lineLogs,
          center,
        });
      }
    }
  });
  return list;
};

export default function SchematicViewer({
  logs = [],
  selectedLocation,
  onSelectLocation,
  isAdmin = false,
  onOpenAddLog,
  totalLogsCount = 0,
  onOpenAllLogs,
  onOpenExportPdf,
}) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  
  const [hoveredLine, setHoveredLine] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCalibrator, setShowCalibrator] = useState(false);
  const [calib, setCalib] = useState({
    offsetX: 0,
    scaleX: 1.0,
    offsetYAtas: 0,
    offsetYBawah: 0,
  });
  const [copiedCalib, setCopiedCalib] = useState(false);

  const containerRef = useRef(null);
  const viewerWrapperRef = useRef(null);
  const pinchRef = useRef({ distance: 0, initialZoom: 1 });
  const touchStartPos = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);

  const [viewportBase, setViewportBase] = useState({ width: 1420, height: 796 });

  // Responsive Fit Calculation: Guarantees that at Zoom 100%, the entire map fits perfectly centered without ANY side cut off!
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const calculateFit = () => {
      const cw = el.clientWidth;
      const ch = el.clientHeight;
      if (!cw || !ch) return;

      const pad = window.innerWidth < 640 ? 8 : 20;
      const maxW = Math.max(cw - pad * 2, 280);
      const maxH = Math.max(ch - pad * 2, 160);
      const mapRatio = 3275 / 1835; // ~1.78474 (Native AutoCAD Model 2)

      let w, h;
      if (maxW / maxH > mapRatio) {
        h = maxH;
        w = maxH * mapRatio;
      } else {
        w = maxW;
        h = maxW / mapRatio;
      }
      setViewportBase({ width: Math.round(w), height: Math.round(h) });
    };

    calculateFit();
    const ro = new ResizeObserver(calculateFit);
    ro.observe(el);
    window.addEventListener('resize', calculateFit);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', calculateFit);
    };
  }, []);

  // Zoom handlers (Min 100% - Max 1000%)
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 10.0));
  const handleZoomOut = () =>
    setZoom((prev) => {
      const next = Math.max(prev - 0.25, 1.0);
      if (next === 1.0) setPosition({ x: 0, y: 0 });
      return next;
    });
  const handleResetZoom = () => {
    setZoom(1.0);
    setPosition({ x: 0, y: 0 });
  };

  // Drag handlers
  const handleMouseDown = (e) => {
    if (e.target.closest('button')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }

    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Mobile Touch Gestures (Single finger Pan & 2-finger Pinch Zoom)
  const handleTouchStart = (e) => {
    if (e.target.closest('button')) return;

    if (e.touches.length === 1) {
      setIsDragging(true);
      hasMovedRef.current = false;
      touchStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    } else if (e.touches.length === 2) {
      setIsDragging(false);
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      pinchRef.current = {
        distance: dist,
        initialZoom: zoom,
      };
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 1 && isDragging) {
      const deltaX = Math.abs(e.touches[0].clientX - touchStartPos.current.x);
      const deltaY = Math.abs(e.touches[0].clientY - touchStartPos.current.y);
      if (deltaX > 6 || deltaY > 6) {
        hasMovedRef.current = true;
      }
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    } else if (e.touches.length === 2 && pinchRef.current.distance > 0) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = dist / pinchRef.current.distance;
      const nextZoom = Math.min(Math.max(pinchRef.current.initialZoom * factor, 1.0), 10.0);
      setZoom(nextZoom);
      if (nextZoom <= 1.0) {
        setPosition({ x: 0, y: 0 });
      }
    }
  };

  const handleTouchEnd = (e) => {
    if (e.touches.length === 0) {
      setIsDragging(false);
      pinchRef.current = { distance: 0, initialZoom: 1 };
    } else if (e.touches.length === 1) {
      setIsDragging(true);
      touchStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    }
  };

  // Wheel zoom (Min 100% - Max 1000%)
  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 0.2 : -0.2;
    setZoom((prev) => {
      const next = Math.min(Math.max(prev + zoomFactor, 1.0), 10.0);
      if (next === 1.0) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  const toggleFullscreen = () => {
    if (!viewerWrapperRef.current) return;
    if (!document.fullscreenElement) {
      viewerWrapperRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const imageSrc = '/peta-laa-cropped-hd.png?v=model2';

  // Complete List of Catenary Lines:
  // - Horizontal Naspan Tracks (46 Segments)
  // - Diagonal / Sloping Crossing Turnouts (17 Segments)
  // Every single segment has a strictly unique ID so only 1 line glows when clicked!
  // Reference to master track lines (auto-synchronized)
  const allTrackLines = ALL_TRACK_LINES;


  // Line-to-log matching using shared helper
  const getLineLogs = (lineOrCode) => matchLineLogs(lineOrCode, logs);

  // Pre-calculate lines that have active maintenance work logs
  const linesWithLogs = React.useMemo(() => computeLinesWithLogs(logs), [logs]);

  const hoveredLogs = hoveredLine ? getLineLogs(hoveredLine) : [];

  const formatAction = (str) => {
    if (!str) return 'Pekerjaan Pemeliharaan';
    return str.replace(/_/g, ' ');
  };

  const getDividerBadge = (type) => {
    switch (type) {
      case 'AJ':
        return { label: 'Air Joint (AJ)', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'AS':
        return { label: 'Air Section (AS)', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'FRP':
        return { label: 'Section Insulator (FRP)', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'DS':
        return { label: 'Disconnecting Switch (DS)', bg: 'bg-orange-50 text-orange-700 border-orange-200' };
      case 'WESEL':
        return { label: 'Wesel Turnout', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'JALUR':
        return { label: 'Jalur Track LAA', bg: 'bg-sky-50 text-sky-700 border-sky-200' };
      default:
        return { label: type, bg: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div
      ref={viewerWrapperRef}
      className={`bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-lg relative flex flex-col transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'w-full'
      }`}
    >
      {/* Top Toolbar White Mode */}
      <div className="bg-white/95 border-b border-slate-200 px-3 sm:px-5 py-2 sm:py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 z-20 backdrop-blur-md">
        
        {/* Left Instruction & Active Work Status */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0 flex-wrap gap-y-1">
          <div className="flex items-center space-x-1.5 shrink-0">
            <div className="p-1 sm:p-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 shrink-0">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <p className="text-[11px] sm:text-sm text-slate-700 font-medium leading-tight">
              <span>
                Setiap line / garis terpisah oleh <strong className="text-blue-700 font-bold">AJ</strong>, <strong className="text-emerald-700 font-bold">AS</strong>, <strong className="text-purple-700 font-bold">FRP</strong>, dan <strong className="text-orange-700 font-bold">DS</strong>
              </span>
            </p>
          </div>

          {linesWithLogs.length > 0 && (
            <div
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] sm:text-xs font-bold shadow-2xs animate-in fade-in"
              title="Garis lintasan dengan tanda merah kedip menandakan ada riwayat pekerjaan yang tercatat"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
              </span>
              <span>{linesWithLogs.length} Lokasi Berpenanda Pekerjaan</span>
            </div>
          )}
        </div>

        {/* Right Tools: Total Work, Export PDF & Zoom Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-1.5 sm:gap-2 shrink-0 w-full sm:w-auto flex-wrap sm:flex-nowrap">
          
          {/* Total Work Clickable Badge */}
          {onOpenAllLogs && (
            <button
              onClick={onOpenAllLogs}
              className="h-9 sm:h-10 bg-slate-50/90 hover:bg-orange-50/60 border border-slate-200/90 hover:border-orange-300 rounded-xl px-2.5 sm:px-3 flex items-center space-x-2 shadow-2xs hover:shadow-xs transition-all cursor-pointer group active:scale-98 shrink-0 text-left"
              title="Klik untuk membuka Rekapitulasi & Daftar Lengkap Seluruh Pekerjaan"
            >
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-orange-100/90 text-orange-600 group-hover:bg-orange-500 group-hover:text-white transition-all flex items-center justify-center shrink-0 shadow-2xs">
                <ClipboardList className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>

              <div>
                <div className="text-[9px] text-slate-500 group-hover:text-orange-700 font-extrabold uppercase tracking-wider flex items-center gap-0.5 leading-none">
                  <span>TOTAL PEKERJAAN</span>
                  <ChevronRight className="w-2.5 h-2.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="font-mono font-black text-slate-900 text-[11px] sm:text-xs flex items-center gap-1 mt-0.5 leading-none">
                  <span className="text-orange-600">{totalLogsCount}</span>
                  <span className="font-semibold text-slate-700 font-sans">Dicatat</span>
                </div>
              </div>
            </button>
          )}

          {/* Tombol Toggle Kalibrasi Peta Model 2 */}
          <button
            onClick={() => setShowCalibrator(!showCalibrator)}
            className={`h-9 sm:h-10 border rounded-xl px-2.5 sm:px-3 flex items-center space-x-1.5 transition-all text-xs font-bold cursor-pointer shrink-0 shadow-2xs ${
              showCalibrator
                ? 'bg-indigo-600 text-white border-indigo-700 shadow-md'
                : 'bg-slate-50/90 hover:bg-indigo-50/60 text-slate-700 border-slate-200/90 hover:border-indigo-300'
            }`}
            title="Buka Panel Kalibrasi Halus Sumbu X/Y untuk Peta Model 2"
          >
            <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center shrink-0 shadow-2xs transition-all ${
              showCalibrator ? 'bg-indigo-700 text-white' : 'bg-indigo-100/90 text-indigo-600'
            }`}>
              <Sliders className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div>
              <div className="text-[9px] text-slate-500 uppercase tracking-wider leading-none">
                KALIBRASI
              </div>
              <div className="font-black text-slate-900 text-[11px] sm:text-xs leading-none mt-0.5">
                <span className="text-indigo-600">Peta</span>
              </div>
            </div>
          </button>

          {/* Export PDF Button */}
          {onOpenExportPdf && (
            <button
              onClick={onOpenExportPdf}
              className="h-9 sm:h-10 bg-slate-50/90 hover:bg-rose-50/60 border border-slate-200/90 hover:border-rose-300 rounded-xl px-2.5 sm:px-3 flex items-center space-x-2 shadow-2xs hover:shadow-xs transition-all cursor-pointer group active:scale-98 shrink-0 text-left"
              title="Buka Menu Export PDF & Cetak Peta Ultra HD"
            >
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-rose-100/90 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-all flex items-center justify-center shrink-0 shadow-2xs">
                <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div>
                <div className="text-[9px] text-slate-500 group-hover:text-rose-700 font-extrabold uppercase tracking-wider flex items-center gap-0.5 leading-none">
                  <span>CETAK PETA</span>
                </div>
                <div className="font-black text-slate-900 text-[11px] sm:text-xs flex items-center gap-1 mt-0.5 leading-none">
                  <span className="text-rose-600">Export</span>
                  <span className="font-semibold text-slate-700 font-sans">PDF</span>
                </div>
              </div>
            </button>
          )}

          {/* Unduh Master Data Excel Button */}
          <a
            href="/MASTER_DATA_ALL_TRACK_LINES_UPT_1.9.xlsx"
            download="MASTER_DATA_ALL_TRACK_LINES_UPT_1.9.xlsx"
            className="h-9 sm:h-10 bg-slate-50/90 hover:bg-emerald-50/60 border border-slate-200/90 hover:border-emerald-300 rounded-xl px-2.5 sm:px-3 flex items-center space-x-2 shadow-2xs hover:shadow-xs transition-all cursor-pointer group active:scale-98 shrink-0 text-left no-underline"
            title="Unduh Master Data Seluruh Jalur & Peralatan dalam format Excel (.xlsx)"
          >
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-emerald-100/90 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all flex items-center justify-center shrink-0 shadow-2xs">
              <FileSpreadsheet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div>
              <div className="text-[9px] text-slate-500 group-hover:text-emerald-700 font-extrabold uppercase tracking-wider flex items-center gap-0.5 leading-none">
                <span>MASTER DATA</span>
              </div>
              <div className="font-black text-slate-900 text-[11px] sm:text-xs flex items-center gap-1 mt-0.5 leading-none">
                <span className="text-emerald-600">Unduh</span>
                <span className="font-semibold text-slate-700 font-sans">Excel</span>
              </div>
            </div>
          </a>

          {/* Zoom Controls */}
          <div className="h-9 sm:h-10 flex items-center space-x-0.5 sm:space-x-1 bg-slate-100 rounded-xl px-1 sm:px-1.5 border border-slate-200 shadow-2xs shrink-0">
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 1.0}
              className={`p-1 sm:p-1.5 rounded-lg transition ${
                zoom <= 1.0
                  ? 'text-slate-300 cursor-not-allowed'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200 cursor-pointer'
              }`}
              title="Perkecil (-) [Min 100%]"
            >
              <ZoomOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            <span className="text-[11px] sm:text-xs font-mono font-bold px-1 sm:px-2 text-slate-800 min-w-12 sm:min-w-14 text-center">
              {Math.round(zoom * 100)}%
            </span>

            <button
              onClick={handleZoomIn}
              disabled={zoom >= 10.0}
              className={`p-1 sm:p-1.5 rounded-lg transition ${
                zoom >= 10.0
                  ? 'text-slate-300 cursor-not-allowed'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200 cursor-pointer'
              }`}
              title="Perbesar (+) [Maks 1000%]"
            >
              <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            <button
              onClick={handleResetZoom}
              className="p-1 sm:p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition cursor-pointer"
              title="Reset Zoom (100%)"
            >
              <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-1 sm:p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition cursor-pointer"
              title="Layar Penuh"
            >
              <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* Main Canvas Viewport (White Mode) - Centered with Mobile Touch Support */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          handleMouseUp();
          setHoveredLine(null);
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className={`w-full overflow-hidden bg-slate-100/70 cursor-grab active:cursor-grabbing relative select-none flex items-center justify-center touch-none ${
          isFullscreen ? 'h-[calc(100vh-55px)]' : 'h-[calc(100vh-215px)] min-h-[480px] max-h-[820px]'
        }`}
      >
        {/* Floating Quick Hint */}
        <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 z-20 pointer-events-none bg-white/95 border border-slate-200 px-2.5 py-1 sm:px-3.5 sm:py-2 rounded-xl text-[10px] sm:text-xs text-slate-600 backdrop-blur-md flex items-center space-x-1.5 shadow-sm">
          <Crosshair className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600 shrink-0" />
          <span className="hidden sm:inline">Scroll mouse untuk Zoom • Tahan klik kiri untuk geser peta</span>
          <span className="sm:hidden">Geser 1 jari untuk navigasi • Cubit 2 jari untuk zoom</span>
        </div>

        {/* ========================================================
            FLOATING POPUP CARD: INFORMASI SEKSI & PEKERJAAN
            ======================================================== */}
        {hoveredLine && (
          <div
            style={{
              left: typeof window !== 'undefined' && window.innerWidth >= 640
                ? `${Math.min(Math.max(mousePos.x + 15, 20), (containerRef.current?.clientWidth || 1000) - 360)}px`
                : undefined,
              top: typeof window !== 'undefined' && window.innerWidth >= 640
                ? `${Math.min(Math.max(mousePos.y - 40, 20), (containerRef.current?.clientHeight || 600) - 340)}px`
                : undefined,
            }}
            className="absolute z-50 pointer-events-auto bg-white/98 border border-slate-200 rounded-2xl p-3.5 sm:p-4 shadow-2xl backdrop-blur-xl w-auto sm:w-88 max-w-sm left-3 right-3 sm:left-auto sm:right-auto bottom-3 sm:bottom-auto max-h-[75vh] overflow-y-auto animate-in zoom-in-95 duration-150 text-slate-800"
          >
            {/* Header: Naspan info & color dot */}
            <div className="flex items-start justify-between pb-2.5 border-b border-slate-100">
              <div className="flex items-start space-x-2">
                <span
                  className="w-3.5 h-3.5 rounded-full mt-0.5 shrink-0 shadow-sm"
                  style={{
                    backgroundColor: hoveredLine.color,
                    border: hoveredLine.color === '#000000' ? '1.5px solid #475569' : undefined,
                  }}
                />
                <div>
                  <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm leading-tight">
                    {hoveredLine.title}
                  </h4>
                  <span className="text-[11px] sm:text-xs text-blue-600 font-mono font-bold mt-0.5 block">
                    {hoveredLine.km}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-1.5 shrink-0">
                <span className="text-[10px] sm:text-[11px] font-black px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {hoveredLogs.length} Pekerjaan
                </span>
                <button
                  onClick={() => setHoveredLine(null)}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                  title="Tutup Info"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* BATAS-BATAS PEMISAH TEKNIS (AJ / AS / FRP / DS) */}
            {hoveredLine.startDivider && hoveredLine.endDivider && (
              <div className="mt-2.5 bg-slate-50 border border-slate-200/90 rounded-xl p-2.5 text-xs space-y-1.5">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Layers className="w-3 h-3 text-blue-600" />
                  <span>Batas Pemisahan Seksi LAA:</span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium">Batas Awal:</span>
                  <span className={`px-2 py-0.5 rounded-md font-bold text-[10.5px] border ${getDividerBadge(hoveredLine.startDivider.type).bg}`}>
                    {hoveredLine.startDivider.label}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium">Batas Akhir:</span>
                  <span className={`px-2 py-0.5 rounded-md font-bold text-[10.5px] border ${getDividerBadge(hoveredLine.endDivider.type).bg}`}>
                    {hoveredLine.endDivider.label}
                  </span>
                </div>
              </div>
            )}

            {/* Content: Daftar Singkat Pekerjaan */}
            <div className="mt-2.5 space-y-2">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-blue-600" />
                <span>Daftar Singkat Pekerjaan:</span>
              </div>

              {hoveredLogs.length === 0 ? (
                <div className="text-xs text-slate-500 italic py-2 bg-slate-50 rounded-xl px-3 border border-slate-200 text-center">
                  Belum ada catatan pekerjaan pada seksi ini.
                </div>
              ) : (
                hoveredLogs.slice(0, 2).map((log, idx) => {
                  const dateStr = new Date(log.timestamp).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });
                  const timeStr = new Date(log.timestamp).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={idx}
                      className="bg-slate-50/90 border border-slate-200 rounded-xl p-2.5 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="flex items-center text-blue-700 font-mono font-bold">
                          <Clock className="w-3 h-3 mr-1 text-orange-500" />
                          {dateStr} • {timeStr} WIB
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                          {log.status || 'SELESAI'}
                        </span>
                      </div>

                      <div className="font-bold text-slate-900 text-xs">
                        {formatAction(log.actionType)}
                      </div>

                      <div className="text-slate-600 text-xs leading-snug line-clamp-2">
                        {log.description}
                      </div>

                      <div className="flex items-center text-xs text-slate-500 pt-0.5">
                        <HardHat className="w-3 h-3 mr-1 text-amber-500" />
                        <span>Pelaksana: <strong className="text-slate-800">{log.technician}</strong></span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

                        {/* Direct Action Button to View Work History */}
            <div className="flex items-center space-x-2 mt-3">
              <button
                onClick={() => onSelectLocation && onSelectLocation(hoveredLine)}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-between shadow-sm cursor-pointer transition-all active:scale-98"
              >
                <span className="flex items-center space-x-1.5">
                  <ClipboardList className="w-3.5 h-3.5" />
                  <span>Lihat Riwayat Pekerjaan</span>
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>

              {isAdmin && onOpenAddLog && (
                <button
                  onClick={() => onOpenAddLog(hoveredLine)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-3 rounded-xl flex items-center space-x-1 shadow-sm cursor-pointer transition-all active:scale-98 shrink-0"
                  title="Catat Pekerjaan Baru pada Seksi Ini"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Catat</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Viewport Content (Centered) */}
        <div
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          }}
          className="relative flex items-center justify-center shrink-0 p-1 sm:p-4"
        >
          {/* Container tightly wrapping cropped schematic (Centered) */}
          <div
            style={{
              width: `${viewportBase.width}px`,
              height: `${viewportBase.height}px`,
            }}
            className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-lg sm:shadow-xl border-2 border-slate-300/90 bg-white shrink-0"
          >
            
            {/* Cropped AutoCAD Master Image */}
            <img
              src={imageSrc}
              alt="Peta Wilayah UPT Resor LAA 1.9 Jatinegara - Potongan Garis Tepi Terluar"
              className="w-full h-full object-contain block select-none pointer-events-none"
              draggable={false}
            />

            {/* ========================================================
                AUTHENTIC SVG TRACK LINES (HORIZONTAL & DIAGONAL CROSSINGS)
                - Only 1 line glows when clicked (matched by line.id)
                - In default state: TRANSPARENT so original colors are 100% preserved
                - On hover/active: GLOWS WITH EXACT AUTOCAD COLOR & 3D EMBOSSED EFFECT
                ======================================================== */}
            <svg
              viewBox="0 0 3275 1835"
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{
                width: '100%',
                height: '100%',
                transform: showCalibrator && (calib.offsetX !== 0 || calib.scaleX !== 1.0)
                  ? `translate(${calib.offsetX}px, 0) scale(${calib.scaleX}, 1)`
                  : undefined,
                transformOrigin: 'left center',
              }}
            >
              {/* ========================================================
                  LAYER 1: REGULAR TRACK & AUXILIARY LINES
                  - All lines (tracks, wesels, FRP, DS, AS, AJ)
                  - Rendered first so dots always sit on top
                  ======================================================== */}
              {allTrackLines
                .filter((line) => !line.isDot)
                .map((line) => {
                  const isHovered = hoveredLine?.id === line.id;
                  const isActive = selectedLocation?.id === line.id;
                  const lineYVal = line.y !== undefined ? line.y : (getLineCenter(line)?.y || 0);
                  const isUpperBlock = lineYVal <= 1000;
                  const yShift = showCalibrator ? (isUpperBlock ? calib.offsetYAtas : calib.offsetYBawah) : 0;

                  return (
                    <g
                      key={line.id}
                      className="pointer-events-auto cursor-pointer"
                      transform={yShift ? `translate(0, ${yShift})` : undefined}
                      onMouseEnter={() => setHoveredLine(line)}
                      onMouseLeave={() => setHoveredLine(null)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setHoveredLine(line);
                        if (onSelectLocation) onSelectLocation(line);
                      }}
                    >
                      {/* Generous hit-area for effortless cursor detection */}
                      <path
                        d={line.hitD || line.d}
                        stroke="transparent"
                        strokeWidth={line.isCrossing ? 42 : 34}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                      />

                      {/* On Hover or Active (1 line only): Glowing Line in authentic color */}
                      {(isHovered || isActive) && (() => {
                        const isAirSection = line.code === 'AIR SECTION (AS)' || line.id.startsWith('overlap_as_');
                        const isMechanicalApparatus = line.category === 'DISCONNECTING SWITCH (DS)' ||
                                                      line.category === 'SECTION INSULATOR (FRP)' ||
                                                      line.id.startsWith('ds_') ||
                                                      line.id.startsWith('frp_');
                        const isBlackApparatusOrDivider = isMechanicalApparatus || isAirSection || line.color === '#000000';
                        
                        const strokeCol = isBlackApparatusOrDivider ? '#000000' : line.color;
                        const outerStrokeCol = isBlackApparatusOrDivider ? '#ffffff' : line.color;
                        const outerWidth = isAirSection ? '8' : (line.id.startsWith('ds_') ? '8' : '10');
                        const coreWidth = isAirSection ? '3.5' : (line.id.startsWith('ds_') ? '4' : '6');
                        const glowFilter = isBlackApparatusOrDivider
                          ? 'drop-shadow(0 0 6px rgba(255,255,255,0.98)) drop-shadow(0 0 12px rgba(56,189,248,0.95)) drop-shadow(0 0 20px rgba(56,189,248,0.7))'
                          : `drop-shadow(0 0 10px ${line.color}) drop-shadow(0 0 20px ${line.color})`;

                        return (
                          <>
                            {/* Outer Glow / Halo */}
                            <path
                              d={line.d}
                              stroke={outerStrokeCol}
                              strokeWidth={outerWidth}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              fill="none"
                              style={{
                                opacity: isBlackApparatusOrDivider ? 0.95 : 0.85,
                                filter: isBlackApparatusOrDivider ? undefined : glowFilter,
                              }}
                            />

                            {/* Core Solid Line */}
                            <path
                              d={line.d}
                              stroke={strokeCol}
                              strokeWidth={coreWidth}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              fill="none"
                              style={{
                                filter: isBlackApparatusOrDivider ? glowFilter : 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
                              }}
                            />

                            {/* 3D Embossed White Laser Centerline */}
                            {!isBlackApparatusOrDivider && (
                              <path
                                d={line.d}
                                stroke="#ffffff"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                fill="none"
                                style={{
                                  opacity: 0.95,
                                  filter: 'drop-shadow(0 0 2px #ffffff)',
                                }}
                              />
                            )}
                          </>
                        );
                      })()}
                    </g>
                  );
                })}

              {/* ========================================================
                  LAYER 2: INTERACTIVE WESEL JUNCTION DOTS (ALWAYS ON TOP)
                  - Rendered on top of all lines so no lines can steal hover
                  - Generous 40px transparent hit-area circle for effortless cursor detection
                  ======================================================== */}
              {allTrackLines
                .filter((line) => line.isDot)
                .map((line) => {
                  const isHovered = hoveredLine?.id === line.id;
                  const isActive = selectedLocation?.id === line.id;
                  const isUpperBlock = line.cy <= 1000;
                  const yShift = showCalibrator ? (isUpperBlock ? calib.offsetYAtas : calib.offsetYBawah) : 0;

                  return (
                    <g
                      key={line.id}
                      className="pointer-events-auto cursor-pointer"
                      transform={yShift ? `translate(0, ${yShift})` : undefined}
                      onMouseEnter={() => setHoveredLine(line)}
                      onMouseLeave={() => setHoveredLine(null)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setHoveredLine(line);
                        if (onSelectLocation) onSelectLocation(line);
                      }}
                    >
                      {/* 1. Generous 40px hit-area circle for effortless cursor detection */}
                      <circle
                        cx={line.cx}
                        cy={line.cy}
                        r="20"
                        fill="transparent"
                        stroke="transparent"
                      />

                      {/* 2. Default visible black junction circle */}
                      <circle
                        cx={line.cx}
                        cy={line.cy}
                        r={line.r || 5.5}
                        fill="#000000"
                        stroke="#ffffff"
                        strokeWidth="1.0"
                        style={{
                          pointerEvents: 'none',
                          filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.6))',
                        }}
                      />

                      {/* 3. On Hover or Active: Cyan Aura / Glowing Halo */}
                      {(isHovered || isActive) && (
                        <g style={{ pointerEvents: 'none' }}>
                          <circle
                            cx={line.cx}
                            cy={line.cy}
                            r="15"
                            fill="none"
                            stroke="#38bdf8"
                            strokeWidth="3.5"
                            style={{
                              filter: 'drop-shadow(0 0 8px rgba(56, 189, 248, 0.95)) drop-shadow(0 0 16px rgba(56, 189, 248, 0.8))',
                            }}
                          />
                          <circle
                            cx={line.cx}
                            cy={line.cy}
                            r="8"
                            fill="#000000"
                            stroke="#ffffff"
                            strokeWidth="1.5"
                          />
                          <circle
                            cx={line.cx}
                            cy={line.cy}
                            r="2.8"
                            fill="#ffffff"
                          />
                        </g>
                      )}
                    </g>
                  );
                })}

              {/* ========================================================
                  ACTIVE WORK BEACONS (TITIK MERAH GLOW KEDIP-KEDIP OTOMATIS)
                  - Glow HANYA pada titik saja (tidak menimpa line).
                  - Jika ada > 1 pekerjaan, jumlah titik ditambahkan sesuai jumlahnya.
                  - Hovering triggers detailed popup card, clicking opens drawer.
                  ======================================================== */}
              {linesWithLogs.map(({ line, logs: lineLogs, center }) => {
                const count = lineLogs.length;
                const displayCount = Math.min(count, 5);
                const dotSpacing = 22;
                const startX = center.x - ((displayCount - 1) * dotSpacing) / 2;

                const isUpperBlock = center.y <= 1000;
                const yShift = showCalibrator ? (isUpperBlock ? calib.offsetYAtas : calib.offsetYBawah) : 0;

                return (
                  <g
                    key={`work-beacon-group-${line.id}`}
                    className="pointer-events-auto cursor-pointer"
                    transform={yShift ? `translate(0, ${yShift})` : undefined}
                    onMouseEnter={() => setHoveredLine(line)}
                    onMouseLeave={() => setHoveredLine(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setHoveredLine(line);
                      if (onSelectLocation) onSelectLocation(line);
                    }}
                  >
                    {/* Render each individual glowing beacon dot matching exact work count */}
                    {Array.from({ length: displayCount }).map((_, idx) => {
                      const dotX = startX + idx * dotSpacing;
                      const dotY = center.y;
                      const phaseDelay = (idx * 0.35).toFixed(2);

                      return (
                        <g key={`dot-${line.id}-${idx}`}>
                          {/* 1. Radar Ping Ring (Pulse Kedip Cepat) */}
                          <circle
                            cx={dotX}
                            cy={dotY}
                            r="8"
                            fill="none"
                            stroke="#ef4444"
                            strokeWidth="3"
                            opacity="0.9"
                          >
                            <animate
                              attributeName="r"
                              values="8;24;36"
                              dur="2s"
                              begin={`${phaseDelay}s`}
                              repeatCount="indefinite"
                            />
                            <animate
                              attributeName="opacity"
                              values="0.9;0.35;0"
                              dur="2s"
                              begin={`${phaseDelay}s`}
                              repeatCount="indefinite"
                            />
                            <animate
                              attributeName="stroke-width"
                              values="3;1.6;0.3"
                              dur="2s"
                              begin={`${phaseDelay}s`}
                              repeatCount="indefinite"
                            />
                          </circle>

                          {/* 2. Soft Glowing Red Halo Aura (Strictly around dot only) */}
                          <circle
                            cx={dotX}
                            cy={dotY}
                            r="13"
                            fill="#ef4444"
                            opacity="0.3"
                          >
                            <animate
                              attributeName="opacity"
                              values="0.2;0.55;0.2"
                              dur="1.6s"
                              begin={`${phaseDelay}s`}
                              repeatCount="indefinite"
                            />
                            <animate
                              attributeName="r"
                              values="12;14.5;12"
                              dur="1.6s"
                              begin={`${phaseDelay}s`}
                              repeatCount="indefinite"
                            />
                          </circle>

                          {/* 3. Core Solid Red Beacon Dot with Crisp White Border */}
                          <circle
                            cx={dotX}
                            cy={dotY}
                            r="8"
                            fill="#dc2626"
                            stroke="#ffffff"
                            strokeWidth="2.4"
                            style={{
                              filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.5)) drop-shadow(0 0 8px #ef4444)',
                            }}
                          >
                            <animate
                              attributeName="r"
                              values="7.5;8.6;7.5"
                              dur="1.6s"
                              begin={`${phaseDelay}s`}
                              repeatCount="indefinite"
                            />
                          </circle>

                          {/* 4. Center White Light Spark */}
                          <circle
                            cx={dotX - 2}
                            cy={dotY - 2}
                            r="2.4"
                            fill="#ffffff"
                            opacity="0.95"
                          />
                        </g>
                      );
                    })}

                    {/* If more than 5 jobs, show small +N tag */}
                    {count > 5 && (
                      <g transform={`translate(${startX + (displayCount - 1) * dotSpacing + 12}, ${center.y - 10})`}>
                        <rect
                          x="0"
                          y="0"
                          width="24"
                          height="14"
                          rx="7"
                          fill="#991b1b"
                          stroke="#ffffff"
                          strokeWidth="1.2"
                          style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}
                        />
                        <text
                          x="12"
                          y="10.5"
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="9"
                          fontWeight="900"
                          fontFamily="monospace, system-ui, sans-serif"
                        >
                          +{count - 5}
                        </text>
                      </g>
                    )}

                    {/* Combined Generous Hit-Area for effortless cursor hovering & clicking */}
                    <rect
                      x={startX - 18}
                      y={center.y - 18}
                      width={(displayCount - 1) * dotSpacing + 36 + (count > 5 ? 28 : 0)}
                      height="36"
                      rx="18"
                      fill="transparent"
                    />
                  </g>
                );
              })}
            </svg>

          </div>
        </div>

      
      {/* ========================================================
          FLOATING FINE-TUNE CALIBRATION PANEL (MODEL 2)
          ======================================================== */}
      {showCalibrator && (
        <div className="absolute bottom-4 right-4 z-40 bg-slate-900/95 backdrop-blur-md border border-slate-700 text-slate-100 rounded-2xl shadow-2xl p-4 w-80 text-xs animate-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
            <div className="flex items-center gap-1.5 font-bold text-slate-200">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>Kalibrasi Presisi Peta Model 2</span>
            </div>
            <button
              onClick={() => setShowCalibrator(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-[11px] font-semibold text-slate-300 mb-1">
                <span>Offset X (Horizontal)</span>
                <span className="font-mono text-indigo-400">{calib.offsetX} px</span>
              </div>
              <input
                type="range"
                min="-30"
                max="30"
                step="0.5"
                value={calib.offsetX}
                onChange={(e) => setCalib({ ...calib, offsetX: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-semibold text-slate-300 mb-1">
                <span>Skala X (Lebar Rel)</span>
                <span className="font-mono text-indigo-400">{calib.scaleX.toFixed(3)}x</span>
              </div>
              <input
                type="range"
                min="0.95"
                max="1.05"
                step="0.001"
                value={calib.scaleX}
                onChange={(e) => setCalib({ ...calib, scaleX: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-semibold text-slate-300 mb-1">
                <span>Offset Y Blok Atas</span>
                <span className="font-mono text-indigo-400">{calib.offsetYAtas} px</span>
              </div>
              <input
                type="range"
                min="-30"
                max="30"
                step="0.5"
                value={calib.offsetYAtas}
                onChange={(e) => setCalib({ ...calib, offsetYAtas: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-semibold text-slate-300 mb-1">
                <span>Offset Y Blok Bawah</span>
                <span className="font-mono text-indigo-400">{calib.offsetYBawah} px</span>
              </div>
              <input
                type="range"
                min="-30"
                max="30"
                step="0.5"
                value={calib.offsetYBawah}
                onChange={(e) => setCalib({ ...calib, offsetYBawah: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(calib, null, 2));
                  setCopiedCalib(true);
                  setTimeout(() => setCopiedCalib(false), 2500);
                }}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-1.5 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                {copiedCalib ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Nilai Kalibrasi</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setCalib({ offsetX: 0, scaleX: 1.0, offsetYAtas: 0, offsetYBawah: 0 })}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-3 py-1.5 rounded-xl transition cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
  );
}
