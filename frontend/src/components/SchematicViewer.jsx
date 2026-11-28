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
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Layers,
  GitCommit,
  X,
  ClipboardList,
  FileText,
  FileSpreadsheet,
  Train,
} from 'lucide-react';
import { LEGACY_TARGET_MAP } from '../data/legacyTargetMap';
import {
  resolveLogTime,
  resolveLogKilometer,
  resolveLogDescription,
  hasRealDescription,
} from '../utils/workLogHelpers';
import {
  CategoryBeaconIcon,
  computeBeaconIconLayout,
} from './CategoryBeaconIcons';

// =========================================================================
// ALL_TRACK_LINES: MASTER DATA SEMUA JALUR, NASPAN, WESEL, DS, FRP, AS/AJ
// Single source of truth untuk seluruh aplikasi (Peta & Riwayat Pekerjaan).
// File allMapLocations.js otomatis membaca dan tersinkron dari sini secara real-time.
// =========================================================================
export const ALL_TRACK_LINES = [
  {
    "id": "kpb_jng_hi_aj",
    "code": "NASPAN 9 KPB-JNG HI (AJ)",
    "title": "NASPAN 9 KPB-JNG (JALUR HILIR ARAH KRAMAT)",
    "km": "KM 9+800 - KM 10+000",
    "category": "NASPAN 9 KPB-JNG",
    "d": "M 171.9 527.4 L 207 527.4",
    "color": "#ff7fdf",
    "xStart": 171.9,
    "xEnd": 207,
    "y": 527.4,
    "startDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ KM 9+800)",
      "km": "KM 9+800"
    },
    "endDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ KM 10+000)",
      "km": "KM 10+000"
    }
  },
  {
    "id": "kpb_jng_hi_naspan9",
    "code": "NASPAN 9 KPB-JNG HI (JNG)",
    "title": "NASPAN 9 KPB-JNG (JNG-POK JALUR HILIR)",
    "km": "KM 9+890 - KM 11+227",
    "category": "NASPAN 9 KPB-JNG",
    "d": "M 218.7 527.6 L 587.7 527.6",
    "color": "#ff7fdf",
    "xStart": 218.7,
    "xEnd": 587.7,
    "y": 527.6,
    "startDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ KM 9+890)",
      "km": "KM 9+890"
    },
    "endDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS KM 11+227)",
      "km": "KM 11+227"
    }
  },
  {
    "id": "kpb_jng_hu_aj",
    "code": "NASPAN 9 JNG-KPB HU (AJ)",
    "title": "NASPAN 9 JNG-KPB (JALUR HULU ARAH KRAMAT)",
    "km": "KM 9+800 - KM 10+000",
    "category": "NASPAN 9 JNG-KPB",
    "d": "M 171.9 575.4 L 206.8 575.4",
    "color": "#ff0000",
    "xStart": 171.9,
    "xEnd": 206.8,
    "y": 575.4,
    "startDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ KM 9+800)",
      "km": "KM 9+800"
    },
    "endDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ KM 10+000)",
      "km": "KM 10+000"
    }
  },
  {
    "id": "kpb_jng_hu_naspan",
    "code": "NASPAN 9 JNG-KPB HU (POK)",
    "title": "NASPAN 9 JNG-KPB (POK-JNG JALUR HULU)",
    "km": "KM 9+890 - KM 11+227",
    "category": "NASPAN 9 JNG-KPB",
    "d": "M 218.7 575.4 L 587.7 575.4",
    "color": "#ff0000",
    "xStart": 218.7,
    "xEnd": 587.7,
    "y": 575.4,
    "startDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ KM 9+890)",
      "km": "KM 9+890"
    },
    "endDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS KM 11+227)",
      "km": "KM 11+227"
    }
  },
  {
    "id": "jng_mri_hi_western",
    "code": "JNG-MRI HI",
    "title": "JNG-MRI (JALUR HILIR)",
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
      "label": "OVERLAP AIR SECTION (AS KM 1+880)",
      "km": "KM 1+880"
    }
  },
  {
    "id": "jng_mri_hi_naspan1",
    "code": "NASPAN 1 (JNG-MRI HI)",
    "title": "NASPAN 1 (JNG-MRI JALUR HILIR)",
    "km": "KM 1+823 - KM 2+221",
    "category": "ST. JATINEGARA",
    "d": "M 486.4 813.4 L 728.7 813.4",
    "color": "#f8d731",
    "startDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS KM 1+823)",
      "km": "KM 1+823"
    },
    "endDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS KM 2+221)",
      "km": "KM 2+221"
    }
  },
  {
    "id": "mri_jng_hu_western",
    "code": "MRI-JNG HU",
    "title": "MRI-JNG (JALUR HULU)",
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
      "label": "OVERLAP AIR SECTION (AS KM 1+854)",
      "km": "KM 1+854"
    }
  },
  {
    "id": "mri_jng_hu_naspan1",
    "code": "NASPAN 1 (MRI-JNG HU)",
    "title": "NASPAN 1 (MRI-JNG JALUR HULU)",
    "km": "KM 1+823 - KM 2+220",
    "category": "ST. JATINEGARA",
    "d": "M 486.4 860.7 L 728.9 860.7",
    "color": "#ff00ff",
    "startDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS KM 1+823)",
      "km": "KM 1+823"
    },
    "endDivider": {
      "type": "DS",
      "label": "DS 2 (NO) JNG-MRI (HU)",
      "km": "KM 2+220"
    }
  },
  {
    "id": "jng_jalur_8",
    "code": "ST. JNG (JL 8)",
    "title": "ST. JATINEGARA (JALUR 8)",
    "km": "KM 11+470 - KM 12+089",
    "category": "ST. JATINEGARA",
    "d": "M 959.8 527.5 L 991.5 479.6 L 1421.8 479.6 L 1452.8 527.2",
    "color": "#139a47",
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 81C",
      "km": "KM 11+470"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "WESEL 83A1",
      "km": "KM 12+089"
    }
  },
  {
    "id": "jng_jalur_7",
    "code": "ST. JNG (JL 7)",
    "title": "ST. JATINEGARA (JALUR 7)",
    "km": "KM 11+082 - KM 12+089",
    "category": "ST. JATINEGARA",
    "d": "M 601.1 527.7 L 1477.3 527.7 L 1568 669.9 L 1718.7 669.9",
    "color": "#139a47",
    "startDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS KM 11+200)",
      "km": "KM 11+082"
    },
    "endDivider": {
      "type": "FRP",
      "label": "FRP-JNG-10-JALUR 4 (UJUNG KM 12+089)",
      "km": "KM 12+089"
    }
  },
  {
    "id": "jng_jalur_6",
    "code": "ST. JNG (JL 6)",
    "title": "ST. JATINEGARA (JALUR 6)",
    "km": "KM 11+082 - KM 12+199",
    "category": "ST. JATINEGARA",
    "d": "M 599.5 575.2 L 1452.8 575.2 L 1546 717.7",
    "color": "#cc6827",
    "isCrossing": true,
    "startDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS KM 11+200)",
      "km": "KM 11+082"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "WESEL 23B1 (KM 12+086)",
      "km": "KM 12+199"
    }
  },
  {
    "id": "jng_jalur_5",
    "code": "ST. JNG (JL 5)",
    "title": "ST. JATINEGARA (JALUR 5)",
    "km": "KM 11+500 - KM 12+058",
    "category": "ST. JATINEGARA",
    "d": "M 961.2 575.0 L 991.5 622.8 L 1483.8 622.8",
    "color": "#cc6827",
    "isCrossing": true,
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 61C (KM 11+542)",
      "km": "KM 11+500"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "WESEL 63A (KM 12+012)",
      "km": "KM 12+058"
    }
  },
  {
    "id": "jng_jalur_4",
    "code": "ST. JNG (JL 4)",
    "title": "ST. JATINEGARA (JALUR 4)",
    "km": "KM 1+049 - KM 12+089",
    "category": "ST. JATINEGARA",
    "d": "M 611.9 717.2 L 796.2 717.2 L 828.5 669.9 L 1461.9 669.9 L 1489.8 717.7 L 1628.4 717.7",
    "color": "#cc6827",
    "startDivider": {
      "type": "DEAD_END",
      "label": "UJUNG BARAT JALUR 4",
      "km": "KM 1+049"
    },
    "endDivider": {
      "type": "FRP",
      "label": "FRP-JNG-11-23B2 / WESEL 23B2",
      "km": "KM 12+089"
    }
  },
  {
    "id": "jng_jalur_mid_green",
    "code": "ST. JNG (JL 4)",
    "title": "ST. JATINEGARA (JALUR 4)",
    "km": "KM 12+089 - KM 12+235",
    "category": "ST. JATINEGARA",
    "d": "M 1634 717.7 L 1768.5 717.7",
    "color": "#139a47",
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 23C1",
      "km": "KM 12+089"
    },
    "endDivider": {
      "type": "KM",
      "label": "KM 12+235",
      "km": "KM 12+235"
    }
  },
  {
    "id": "jng_jalur_mid_rust",
    "code": "ST. JNG (JL 3)",
    "title": "ST. JATINEGARA (JALUR 3)",
    "km": "KM 1+049 - KM 11+600",
    "category": "ST. JATINEGARA",
    "d": "M 611.7 762.8 L 790.6 762.8",
    "color": "#cc6827",
    "startDivider": {
      "type": "DEAD_END",
      "label": "UJUNG BARAT JALUR 3",
      "km": "KM 1+049"
    },
    "endDivider": {
      "type": "FRP",
      "label": "FRP-JNG-03-21A2",
      "km": "KM 11+600"
    }
  },
  {
    "id": "jng_jalur_3",
    "code": "ST. JNG (JL 3)",
    "title": "ST. JATINEGARA (JALUR 3)",
    "km": "KM 11+600 - KM 11+900",
    "category": "ST. JATINEGARA",
    "d": "M 796.4 763.2 L 1475.4 763.2",
    "color": "#f8d731",
    "startDivider": {
      "type": "FRP",
      "label": "FRP-JNG-03-21A2",
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
    "code": "ST. JNG (JL 3)",
    "title": "ST. JATINEGARA (JALUR 3)",
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
    "code": "ST. JNG (JL 2)",
    "title": "ST. JATINEGARA (JALUR 2)",
    "km": "KM 2+000 - KM 11+900",
    "category": "ST. JATINEGARA",
    "d": "M 740.6 813.3 L 1475.1 813.3",
    "color": "#f8d731",
    "startDivider": {
      "type": "DS",
      "label": "DS 3 (NC) JALUR 2",
      "km": "KM 2+000"
    },
    "endDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS KM 11+900)",
      "km": "KM 11+900"
    }
  },
  {
    "id": "jng_jalur_1",
    "code": "ST. JNG (JL 1)",
    "title": "ST. JATINEGARA (JALUR 1)",
    "km": "KM 2+000 - KM 11+900",
    "category": "ST. JATINEGARA",
    "d": "M 740.4 860.7 L 1475.3 860.7",
    "color": "#ff00ff",
    "startDivider": {
      "type": "DS",
      "label": "DS 4 (NC) JALUR 1",
      "km": "KM 2+000"
    },
    "endDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS KM 11+900)",
      "km": "KM 11+900"
    }
  },
  {
    "id": "naspan_1_arah_kld_hi",
    "code": "NASPAN 1 (ARAH KLD HI)",
    "title": "NASPAN 1 (ARAH KLD JALUR HILIR)",
    "km": "KM 11+898 - KM 12+579",
    "category": "KLD-JNG",
    "d": "M 1487 813.2 L 1931.3 813.2",
    "color": "#f8d731",
    "startDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS KM 11+900)",
      "km": "KM 11+898"
    },
    "endDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS KM 12+500)",
      "km": "KM 12+579"
    }
  },
  {
    "id": "naspan_2_jng_kld_hi",
    "code": "NASPAN 2 (KLD-JNG HI)",
    "title": "NASPAN 2 (KLD-JNG JALUR HILIR)",
    "km": "KM 12+394 - KM 13+435",
    "category": "KLD-JNG",
    "d": "M 1967.2 813.0 L 2086.4 813.0",
    "color": "#0000ff",
    "startDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS KM 12+500)",
      "km": "KM 12+394"
    },
    "endDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ KM 13+300)",
      "km": "KM 13+435"
    }
  },
  {
    "id": "naspan_3_jng_kld_hi",
    "code": "NASPAN 3 (KLD-JNG HI)",
    "title": "NASPAN 3 (KLD-JNG JALUR HILIR)",
    "km": "KM 13+225 - KM 14+187",
    "category": "KLD-JNG",
    "d": "M 2086.4 813.0 L 2161.3 813.0",
    "color": "#0000ff",
    "startDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ KM 13+300)",
      "km": "KM 13+225"
    },
    "endDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ KM 14+100)",
      "km": "KM 14+187"
    }
  },
  {
    "id": "naspan_4_jng_kld_hi",
    "code": "NASPAN 4 (KLD-JNG HI)",
    "title": "NASPAN 4 (KLD-JNG JALUR HILIR)",
    "km": "KM 14+032 - KM 14+827",
    "category": "KLD-JNG",
    "d": "M 2161.3 812.5 L 2249.6 812.5",
    "color": "#0000ff",
    "startDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ KM 14+100)",
      "km": "KM 14+032"
    },
    "endDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ KM 14+700)",
      "km": "KM 14+827"
    }
  },
  {
    "id": "naspan_4b_kld_bua_hi",
    "code": "NASPAN 4B (BUA-KLD HI)",
    "title": "NASPAN 4B (BUA-KLD JALUR HILIR)",
    "km": "KM 14+660 - KM 15+531",
    "category": "BUA-KLD",
    "d": "M 2249.6 812.5 L 2518.8 812.5",
    "color": "#0000ff",
    "startDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ KM 14+700)",
      "km": "KM 14+660"
    },
    "endDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS KM 15+450)",
      "km": "KM 15+531"
    }
  },
  {
    "id": "naspan_5_kld_bua_hi",
    "code": "NASPAN 5 (BUA-KLD HI)",
    "title": "NASPAN 5 (BUA-KLD JALUR HILIR)",
    "km": "KM 15+363 - KM 16+552",
    "category": "BUA-KLD",
    "d": "M 2518.8 813.3 L 2635 813.3",
    "color": "#ff00ff",
    "startDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS KM 15+450)",
      "km": "KM 15+363"
    },
    "endDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ KM 16+500)",
      "km": "KM 16+552"
    }
  },
  {
    "id": "naspan_6_kld_bua_hi",
    "code": "NASPAN 6 (BUA-KLD HI)",
    "title": "NASPAN 6 (BUA-KLD JALUR HILIR)",
    "km": "KM 16+388 - KM 17+323",
    "category": "BUA-KLD",
    "d": "M 2635 812.7 L 2740 812.7",
    "color": "#ff00ff",
    "startDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ KM 16+500)",
      "km": "KM 16+388"
    },
    "endDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS KM 17+239)",
      "km": "KM 17+323"
    }
  },
  {
    "id": "naspan_7_bua_kldb_hi",
    "code": "NASPAN 7 (KLDB-BUA HI)",
    "title": "NASPAN 7 (KLDB-BUA JALUR HILIR)",
    "km": "KM 17+152 - KM 17+989",
    "category": "KLDB-BUA",
    "d": "M 2740 812.7 L 2985.7 812.7",
    "color": "#f8d731",
    "startDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS KM 17+239)",
      "km": "KM 17+152"
    },
    "endDivider": {
      "type": "DS",
      "label": "DS 9 (NC) KLDB-BUA HI",
      "km": "KM 17+989"
    }
  },
  {
    "id": "naspan_7b_bua_kldb_hi",
    "code": "NASPAN 7B (KLDB-BUA HI)",
    "title": "NASPAN 7B (KLDB-BUA JALUR HILIR)",
    "km": "KM 17+824 - KM 18+939",
    "category": "KLDB-BUA",
    "d": "M 2985.7 812.5 L 3098.5 812.5",
    "color": "#f8d731",
    "startDivider": {
      "type": "DS",
      "label": "DS 9 (NC) KLDB-BUA HI",
      "km": "KM 17+824"
    },
    "endDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ KM 18+800)",
      "km": "KM 18+939"
    }
  },
  {
    "id": "naspan_8b_bua_kldb_hi",
    "code": "NASPAN 8 (KLDB-BUA HI)",
    "title": "NASPAN 8 (KLDB-BUA JALUR HILIR)",
    "km": "KM 18+758 - KM 19+327",
    "category": "KLDB-BUA",
    "d": "M 3098.5 812.5 L 3122.4 812.6 L 3180.7 873.1 L 3180.6 1278.8 L 3122.2 1343.4 L 3046.3 1343.4",
    "color": "#f8d731",
    "startDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ KM 18+800)",
      "km": "KM 18+758"
    },
    "endDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ KM 19+300)",
      "km": "KM 19+327"
    }
  },
  {
    "id": "naspan_1_arah_kld_hu",
    "code": "NASPAN 1 (ARAH KLD HU)",
    "title": "NASPAN 1 (ARAH KLD JALUR HULU)",
    "km": "KM 11+898 - KM 12+579",
    "category": "JNG-KLD",
    "d": "M 1487.2 860.7 L 1932.2 860.7",
    "color": "#ff00ff",
    "startDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS KM 11+900)",
      "km": "KM 11+898"
    },
    "endDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS KM 12+500)",
      "km": "KM 12+579"
    }
  },
  {
    "id": "naspan_2_jng_kld_hu",
    "code": "NASPAN 2 (JNG-KLD HU)",
    "title": "NASPAN 2 (JNG-KLD JALUR HULU)",
    "km": "KM 12+438 - KM 13+435",
    "category": "JNG-KLD",
    "d": "M 1967.9 860.7 L 2086.4 860.7",
    "color": "#ff9f7f",
    "startDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS KM 12+500)",
      "km": "KM 12+438"
    },
    "endDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ KM 13+300)",
      "km": "KM 13+435"
    }
  },
  {
    "id": "naspan_3_jng_kld_hu",
    "code": "NASPAN 3 (JNG-KLD HU)",
    "title": "NASPAN 3 (JNG-KLD JALUR HULU)",
    "km": "KM 13+255 - KM 14+187",
    "category": "JNG-KLD",
    "d": "M 2086.4 860.7 L 2161.3 860.7",
    "color": "#ff9f7f",
    "startDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ KM 13+300)",
      "km": "KM 13+255"
    },
    "endDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ KM 14+100)",
      "km": "KM 14+187"
    }
  },
  {
    "id": "naspan_4_jng_kld_hu",
    "code": "NASPAN 4 (JNG-KLD HU)",
    "title": "NASPAN 4 (JNG-KLD JALUR HULU)",
    "km": "KM 14+032 - KM 14+827",
    "category": "JNG-KLD",
    "d": "M 2161.3 860.2 L 2249.6 860.2",
    "color": "#ff9f7f",
    "startDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ KM 14+100)",
      "km": "KM 14+032"
    },
    "endDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ KM 14+700)",
      "km": "KM 14+827"
    }
  },
  {
    "id": "naspan_4b_kld_bua_hu",
    "code": "NASPAN 4B (KLD-BUA HU)",
    "title": "NASPAN 4B (KLD-BUA JALUR HULU)",
    "km": "KM 14+660 - KM 15+531",
    "category": "KLD-BUA",
    "d": "M 2249.6 860.2 L 2518.8 860.2",
    "color": "#ff9f7f",
    "startDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ KM 14+700)",
      "km": "KM 14+660"
    },
    "endDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS KM 15+450)",
      "km": "KM 15+531"
    }
  },
  {
    "id": "naspan_5_kld_bua_hu",
    "code": "NASPAN 5 (KLD-BUA HU)",
    "title": "NASPAN 5 (KLD-BUA JALUR HULU)",
    "km": "KM 15+363 - KM 16+552",
    "category": "KLD-BUA",
    "d": "M 2518.8 861.1 L 2635 861.1",
    "color": "#00ff00",
    "startDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS KM 15+450)",
      "km": "KM 15+363"
    },
    "endDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ KM 16+500)",
      "km": "KM 16+552"
    }
  },
  {
    "id": "naspan_6_kld_bua_hu",
    "code": "NASPAN 6 (KLD-BUA HU)",
    "title": "NASPAN 6 (KLD-BUA JALUR HULU)",
    "km": "KM 16+388 - KM 17+323",
    "category": "KLD-BUA",
    "d": "M 2635 860.6 L 2740 860.6",
    "color": "#00ff00",
    "startDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ KM 16+500)",
      "km": "KM 16+388"
    },
    "endDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS KM 17+239)",
      "km": "KM 17+323"
    }
  },
  {
    "id": "naspan_7_bua_kldb_hu",
    "code": "NASPAN 7 (BUA-KLDB HU)",
    "title": "NASPAN 7 (BUA-KLDB JALUR HULU)",
    "km": "KM 17+152 - KM 17+989",
    "category": "BUA-KLDB",
    "d": "M 2740 860.5 L 2985.7 860.5",
    "color": "#ff0000",
    "startDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS KM 17+239)",
      "km": "KM 17+152"
    },
    "endDivider": {
      "type": "DS",
      "label": "DS 10 (NC) BUA-KLDB HU",
      "km": "KM 17+989"
    }
  },
  {
    "id": "naspan_7b_bua_kldb_hu",
    "code": "NASPAN 7B (BUA-KLDB HU)",
    "title": "NASPAN 7B (BUA-KLDB JALUR HULU)",
    "km": "KM 17+824 - KM 18+939",
    "category": "BUA-KLDB",
    "d": "M 2985.7 860.2 L 3098.5 860.2",
    "color": "#ff0000",
    "startDivider": {
      "type": "DS",
      "label": "DS 10 (NC) BUA-KLDB HU",
      "km": "KM 17+824"
    },
    "endDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ KM 18+800)",
      "km": "KM 18+939"
    }
  },
  {
    "id": "naspan_8b_bua_kldb_hu",
    "code": "NASPAN 8 (BUA-KLDB HU)",
    "title": "NASPAN 8 (BUA-KLDB JALUR HULU)",
    "km": "KM 18+758 - KM 19+327",
    "category": "BUA-KLDB",
    "d": "M 3098.5 860.2 L 3112.1 860.5 L 3143.5 893.0 L 3143.4 1252.0 L 3101.6 1295.6 L 3046.3 1295.6",
    "color": "#ff0000",
    "startDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ KM 18+800)",
      "km": "KM 18+758"
    },
    "endDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ KM 19+300)",
      "km": "KM 19+327"
    }
  },
  {
    "id": "naspan_8b_kldb_cuk_hi",
    "code": "NASPAN 8B (CUK-KLDB HI)",
    "title": "NASPAN 8B (CUK-KLDB JALUR HILIR)",
    "km": "KM 19+258 - KM 20+265",
    "category": "KLDB-CUK",
    "d": "M 3046.7 1343.2 L 2824.4 1343.0",
    "color": "#f8d731",
    "startDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ KM 19+300)",
      "km": "KM 19+258"
    },
    "endDivider": {
      "type": "DS",
      "label": "DS 11 (NO) CUK-KLDB HI",
      "km": "KM 20+265"
    }
  },
  {
    "id": "naspan_8b_kldb_cuk_hu",
    "code": "NASPAN 8B (KLDB-CUK HU)",
    "title": "NASPAN 8B (KLDB-CUK JALUR HULU)",
    "km": "KM 19+258 - KM 20+265",
    "category": "KLDB-CUK",
    "d": "M 3046.7 1295.3 L 2818.6 1295.3",
    "color": "#ff0000",
    "startDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ KM 19+300)",
      "km": "KM 19+258"
    },
    "endDivider": {
      "type": "DS",
      "label": "DS 12 (NO) KLDB-CUK HU",
      "km": "KM 20+265"
    }
  },
  {
    "id": "cuk_jalur_1_empl",
    "code": "NASPAN 9 (EMPL CUK HU)",
    "title": "ST. CAKUNG (JALUR 2)",
    "km": "KM 20+079 - KM 21+550",
    "category": "ST. CAKUNG",
    "d": "M 2342 1293.0 L 2806.7 1293.0",
    "color": "#8a6ddd",
    "startDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS KM 20+150)",
      "km": "KM 20+079"
    },
    "endDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS KM 21+400)",
      "km": "KM 21+550"
    }
  },
  {
    "id": "cuk_jalur_1_peron",
    "code": "ST. CUK (JL 1)",
    "title": "ST. CAKUNG (JALUR 1)",
    "km": "KM 20+669 - KM 21+450",
    "category": "ST. CAKUNG",
    "d": "M 2414.9 1294.6 L 2453.3 1252.9 L 2583 1252.9 L 2616.9 1295.0",
    "color": "#8a6ddd",
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 11B",
      "km": "KM 20+669"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "WESEL 13A",
      "km": "KM 21+450"
    }
  },
  {
    "id": "cuk_jalur_4_empl",
    "code": "NASPAN 9 (EMPL CUK HI)",
    "title": "ST. CAKUNG (JALUR 3)",
    "km": "KM 20+079 - KM 21+550",
    "category": "ST. CAKUNG",
    "d": "M 2343.3 1342.8 L 2811.4 1342.8",
    "color": "#cc6827",
    "startDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS KM 20+150)",
      "km": "KM 20+079"
    },
    "endDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS KM 21+400)",
      "km": "KM 21+550"
    }
  },
  {
    "id": "cuk_jalur_4_peron",
    "code": "ST. CUK (JL 4)",
    "title": "ST. CAKUNG (JALUR 4)",
    "km": "KM 20+721 - KM 21+450",
    "category": "ST. CAKUNG",
    "d": "M 2414.9 1342.8 L 2452.2 1384.7 L 2583 1384.7 L 2616.9 1342.9",
    "color": "#cc6827",
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 23A",
      "km": "KM 20+721"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "WESEL 21B",
      "km": "KM 21+450"
    }
  },
  {
    "id": "naspan_10_cuk_kri_hu",
    "code": "NASPAN 10 (CUK-KRI HU)",
    "title": "NASPAN 10 (CUK-KRI JALUR HULU)",
    "km": "KM 21+424 - KM 22+800",
    "category": "CUK-KRI",
    "d": "M 2217.3 1293.0 L 2330.6 1293.0",
    "color": "#8a6ddd",
    "startDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS KM 21+400)",
      "km": "KM 21+424"
    },
    "endDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ KM 22+700)",
      "km": "KM 22+800"
    }
  },
  {
    "id": "naspan_11_cuk_kri_hu",
    "code": "NASPAN 11 (CUK-KRI HU)",
    "title": "NASPAN 11 (CUK-KRI JALUR HULU)",
    "km": "KM 22+622 - KM 23+870",
    "category": "CUK-KRI",
    "d": "M 2071.8 1292.8 L 2205.4 1292.8",
    "color": "#8a6ddd",
    "startDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ KM 22+700)",
      "km": "KM 22+622"
    },
    "endDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS KM 23+750)",
      "km": "KM 23+870"
    }
  },
  {
    "id": "naspan_12_kri_bks_hu",
    "code": "NASPAN 12 (KRI-BKS HU)",
    "title": "NASPAN 12 (KRI-BKS JALUR HULU)",
    "km": "KM 23+692 - KM 24+510",
    "category": "KRI-BKS",
    "d": "M 1824.3 1294.0 L 2060.8 1294.0",
    "color": "#ff00ff",
    "startDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS KM 23+750)",
      "km": "KM 23+692"
    },
    "endDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ KM 24+400)",
      "km": "KM 24+510"
    }
  },
  {
    "id": "naspan_13_kri_bks_hu",
    "code": "NASPAN 12B (KRI-BKS HU)",
    "title": "NASPAN 12B (KRI-BKS JALUR HULU)",
    "km": "KM 24+350 - KM 25+001",
    "category": "KRI-BKS",
    "d": "M 1754 1293.8 L 1809.6 1293.8",
    "color": "#ff00ff",
    "startDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ KM 24+400)",
      "km": "KM 24+350"
    },
    "endDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ KM 25+000)",
      "km": "KM 25+001"
    }
  },
  {
    "id": "naspan_13b_kri_bks_hu",
    "code": "NASPAN 13 (KRI-BKS HU)",
    "title": "NASPAN 13 (KRI-BKS JALUR HULU)",
    "km": "KM 24+987 - KM 25+832",
    "category": "KRI-BKS",
    "d": "M 1641.5 1293.8 L 1740.5 1293.8",
    "color": "#ff00ff",
    "startDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ KM 25+000)",
      "km": "KM 24+987"
    },
    "endDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS KM 25+750)",
      "km": "KM 25+832"
    }
  },
  {
    "id": "naspan_10_cuk_kri_hi",
    "code": "NASPAN 10 (KRI-CUK HI)",
    "title": "NASPAN 10 (KRI-CUK JALUR HILIR)",
    "km": "KM 21+424 - KM 22+800",
    "category": "KRI-CUK",
    "d": "M 2221 1342.8 L 2331.4 1342.8",
    "color": "#cc6827",
    "startDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS KM 21+400)",
      "km": "KM 21+424"
    },
    "endDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ KM 22+700)",
      "km": "KM 22+800"
    }
  },
  {
    "id": "naspan_11_cuk_kri_hi",
    "code": "NASPAN 11 (KRI-CUK HI)",
    "title": "NASPAN 11 (KRI-CUK JALUR HILIR)",
    "km": "KM 22+622 - KM 23+870",
    "category": "KRI-CUK",
    "d": "M 2065.5 1342.8 L 2207 1342.8",
    "color": "#cc6827",
    "startDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ KM 22+700)",
      "km": "KM 22+622"
    },
    "endDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS KM 23+750)",
      "km": "KM 23+870"
    }
  },
  {
    "id": "naspan_12_kri_bks_hi",
    "code": "NASPAN 12 (BKS-KRI HI)",
    "title": "NASPAN 12 (KRI-BKS JALUR HILIR)",
    "km": "KM 23+692 - KM 25+001",
    "category": "BKS-KRI",
    "d": "M 1751.6 1342.4 L 2050.8 1342.4",
    "color": "#00bfff",
    "startDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS KM 23+750)",
      "km": "KM 23+692"
    },
    "endDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ KM 25+000)",
      "km": "KM 25+001"
    }
  },
  {
    "id": "naspan_13_kri_bks_hi",
    "code": "NASPAN 13 (BKS-KRI HI)",
    "title": "NASPAN 13 (KRI-BKS JALUR HILIR)",
    "km": "KM 24+987 - KM 25+832",
    "category": "BKS-KRI",
    "d": "M 1638.8 1343.6 L 1739.6 1343.6",
    "color": "#00bfff",
    "startDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ KM 25+000)",
      "km": "KM 24+987"
    },
    "endDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS KM 25+750)",
      "km": "KM 25+832"
    }
  },
  {
    "id": "bks_jalur_simpan_960",
    "code": "ST. BKS (JL 8)",
    "title": "ST. BEKASI (JALUR 8)",
    "km": "KM 26+145 - KM 26+580",
    "category": "ST. BEKASI",
    "d": "M 934 1190.9 L 1256.6 1190.9 L 1319.3 1266.7",
    "color": "#139a47",
    "startDivider": {
      "type": "DEAD_END",
      "label": "UJUNG JALUR 8 (BARAT)",
      "km": "KM 26+145"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "WESEL 71C",
      "km": "KM 26+580"
    }
  },
  {
    "id": "bks_jalur_simpan_1012",
    "code": "ST. BKS (JL 7)",
    "title": "ST. BEKASI (JALUR 7)",
    "km": "KM 26+214 - KM 26+760",
    "category": "ST. BEKASI",
    "d": "M 838.4 1242.4 L 1299.2 1242.4",
    "color": "#139a47",
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 71C1",
      "km": "KM 26+214"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "WESEL 73",
      "km": "KM 26+760"
    }
  },
  {
    "id": "bks_jalur_1_end",
    "code": "BKS-BKT",
    "title": "BKS-BKT (JALUR HULU)",
    "km": "KM 26+800 - KM 27+200",
    "category": "BKS-BKT",
    "d": "M 370.4 1458.6 L 460.4 1294.6 L 592.6 1294.6",
    "color": "#139a47",
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 73 / W13C (KM 26+800)",
      "km": "KM 26+800"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "WESEL 13C",
      "km": "KM 26+900"
    }
  },
  {
    "id": "bks_jalur_1_platform",
    "code": "ST. BKS (JL 6)",
    "title": "ST. BEKASI (JALUR 6)",
    "km": "KM 25+692 - KM 27+047",
    "category": "ST. BEKASI",
    "d": "M 605.9 1294.6 L 1626.3 1294.6",
    "color": "#139a47",
    "startDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS KM 25+750)",
      "km": "KM 25+692"
    },
    "endDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS KM 26+900)",
      "km": "KM 27+047"
    }
  },
  {
    "id": "bks_jalur_2_west",
    "code": "BKT-BKS",
    "title": "BKT-BKS (JALUR HILIR)",
    "km": "KM 26+800 - KM 27+200",
    "category": "BKT-BKS",
    "d": "M 442.6 1458.4 L 505 1343.4 L 592.1 1343.4",
    "color": "#ec1f24",
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 53 / W13B1 (KM 26+800)",
      "km": "KM 26+800"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "WESEL 13B1",
      "km": "KM 26+900"
    }
  },
  {
    "id": "bks_jalur_2_platform",
    "code": "ST. BKS (JL 5)",
    "title": "ST. BEKASI (JALUR 5)",
    "km": "KM 25+692 - KM 27+047",
    "category": "ST. BEKASI",
    "d": "M 603.8 1343.4 L 1625.3 1343.4",
    "color": "#ff0000",
    "startDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS KM 25+750)",
      "km": "KM 25+692"
    },
    "endDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS KM 26+900)",
      "km": "KM 27+047"
    }
  },
  {
    "id": "bks_jalur_3_platform",
    "code": "ST. BKS (JL 4)",
    "title": "ST. BEKASI (JALUR 4)",
    "km": "KM 26+158 - KM 26+810",
    "category": "ST. BEKASI",
    "d": "M 737.6 1404.8 L 1372 1404.8",
    "color": "#ec1f24",
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 51C",
      "km": "KM 26+158"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "WESEL 53",
      "km": "KM 26+810"
    }
  },
  {
    "id": "bks_timur_1228_grn",
    "code": "BKS-BKT",
    "title": "BKS-BKT (JALUR HULU)",
    "km": "KM 27+000 - KM 27+300",
    "category": "BKS-BKT",
    "d": "M 260.3 1458.6 L 399.2 1458.6",
    "color": "#139a47",
    "startDivider": {
      "type": "KM",
      "label": "KM 27+300",
      "km": "KM 27+300"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "WESEL 13C",
      "km": "KM 27+000"
    }
  },
  {
    "id": "bks_timur_1228_red",
    "code": "BKS-BKT",
    "title": "BKS-BKT (JALUR HULU)",
    "km": "KM 26+900 - KM 27+000",
    "category": "BKS-BKT",
    "d": "M 404.9 1458.6 L 485.6 1458.6",
    "color": "#ec1f24",
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 13C",
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
    "code": "BKT-BKS",
    "title": "BKT-BKS (JALUR HILIR)",
    "km": "KM 26+900 - KM 27+300",
    "category": "BKT-BKS",
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
    "code": "WESEL 81A1 (JNG BRT)",
    "title": "CROSSTREK WESEL 81A1 - WESEL 61A2",
    "km": "KM 11+202",
    "category": "TITIK CROSSING",
    "d": "M 654.3 527.6 L 668.2 538.8",
    "color": "#139a47",
    "isCrossing": true,
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 81A1",
      "km": "KM 11+202"
    },
    "endDivider": {
      "type": "FRP",
      "label": "FRP-JNG-08-81A1",
      "km": "KM 11+350"
    }
  },
  {
    "id": "wesel_w81a2_713",
    "code": "WESEL 81A2 (JNG BRT)",
    "title": "CROSSTREK WESEL 81A2 - WESEL 61A1",
    "km": "KM 11+448",
    "category": "TITIK CROSSING",
    "d": "M 713.7 527.6 L 699.5 538.9",
    "color": "#139a47",
    "isCrossing": true,
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 81A2",
      "km": "KM 11+259"
    },
    "endDivider": {
      "type": "FRP",
      "label": "FRP-JNG-09-81A2",
      "km": "KM 11+350"
    }
  },
  {
    "id": "wesel_w61a2_672",
    "code": "WESEL 61A2 (JNG BRT)",
    "title": "CROSSTREK WESEL 61A2 - WESEL 81A1",
    "km": "KM 11+350",
    "category": "TITIK CROSSING",
    "d": "M 672.4 542.1 L 713.7 575.0",
    "color": "#cc6827",
    "isCrossing": true,
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 61A2",
      "km": "KM 11+259"
    },
    "endDivider": {
      "type": "FRP",
      "label": "FRP-JNG-08-81A1",
      "km": "KM 11+350"
    }
  },
  {
    "id": "wesel_w61a1_695",
    "code": "WESEL 61A1 (JNG BRT)",
    "title": "CROSSTREK WESEL 61A1 - WESEL 81A2",
    "km": "KM 11+350",
    "category": "TITIK CROSSING",
    "d": "M 695.3 542.2 L 654.3 575.0",
    "color": "#cc6827",
    "isCrossing": true,
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 61A1",
      "km": "KM 11+202"
    },
    "endDivider": {
      "type": "FRP",
      "label": "FRP-JNG-09-81A2",
      "km": "KM 11+350"
    }
  },
  {
    "id": "wesel_w61b_772",
    "code": "WESEL 61B (JNG BRT)",
    "title": "CROSSING WESEL 61B - WESEL 21C1",
    "km": "KM 11+264",
    "category": "TITIK CROSSING",
    "d": "M 772 575.0 L 818.2 622.5",
    "color": "#cc6827",
    "isCrossing": true,
    "startDivider": null,
    "endDivider": null
  },
  {
    "id": "wesel_w61c_1038",
    "code": "WESEL 61C (JNG BRT)",
    "title": "CROSSING WESEL 61C - JALUR 5 (EMPL JATINEGARA)",
    "km": "KM 11+542",
    "category": "TITIK CROSSING",
    "d": "M 1038.3 622.6 L 1020.8 643.0",
    "color": "#cc6827",
    "isCrossing": true,
    "startDivider": null,
    "endDivider": null
  },
  {
    "id": "wesel_w41b_1017",
    "code": "WESEL 41B (JNG BRT)",
    "title": "CROSSING WESEL 41B - WESEL 21C2",
    "km": "KM 11+630",
    "category": "TITIK CROSSING",
    "d": "M 1017 647.4 L 997.6 670.2",
    "color": "#cc6827",
    "isCrossing": true,
    "startDivider": null,
    "endDivider": null
  },
  {
    "id": "wesel_w21c1_821",
    "code": "WESEL 21C1 (JNG BRT)",
    "title": "CROSSING WESEL 21C1 - WESEL 61B",
    "km": "KM 11+521",
    "category": "TITIK CROSSING",
    "d": "M 821.9 626.4 L 864.3 669.9",
    "color": "#cc6827",
    "isCrossing": true,
    "startDivider": null,
    "endDivider": null
  },
  {
    "id": "wesel_w21a2_752",
    "code": "WESEL 21A2 (JNG BRT)",
    "title": "CROSSING WESEL 21A2 - WESEL 11B1",
    "km": "KM 2+157",
    "category": "TITIK CROSSING",
    "d": "M 752.3 716.8 L 720.4 762.8",
    "color": "#cc6827",
    "isCrossing": true,
    "startDivider": null,
    "endDivider": null
  },
  {
    "id": "wesel_w11a_677",
    "code": "WESEL 11A (JNG BRT)",
    "title": "CROSSING WESEL 11A - WESEL 31A2",
    "km": "KM 2+095",
    "category": "TITIK CROSSING",
    "d": "M 677.4 762.8 L 659.4 783.7",
    "color": "#cc6827",
    "isCrossing": true,
    "startDivider": null,
    "endDivider": null
  },
  {
    "id": "wesel_w11a_655",
    "code": "WESEL W31A2 (JNG BRT)",
    "title": "CROSSING WESEL 31A2 - WESEL 11A",
    "km": "KM 2+015",
    "category": "TITIK CROSSING",
    "d": "M 655.5 787.9 L 634.4 813.3",
    "color": "#f8d731",
    "isCrossing": true,
    "startDivider": null,
    "endDivider": null
  },
  {
    "id": "wesel_w31a1_593",
    "code": "WESEL 31A1 (JNG BRT)",
    "title": "CROSSING WESEL 31A1 - WESEL 51A",
    "km": "KM 1+995",
    "category": "TITIK CROSSING",
    "d": "M 593.4 813.3 L 575.9 833.6",
    "color": "#f8d731",
    "isCrossing": true,
    "startDivider": null,
    "endDivider": null
  },
  {
    "id": "wesel_w51a_571",
    "code": "WESEL 51A (JNG BRT)",
    "title": "CROSSING WESEL 51A - WESEL 31A1",
    "km": "KM 1+935",
    "category": "TITIK CROSSING",
    "d": "M 571.2 838.8 L 552.8 860.7",
    "color": "#ff00ff",
    "isCrossing": true,
    "startDivider": null,
    "endDivider": null
  },
  {
    "id": "titik_wesel_w51a",
    "code": "WESEL 51A (JNG BRT)",
    "title": "WESEL 51A (EMPL JATINEGARA BARAT)",
    "km": "KM 1+935",
    "category": "TITIK WESEL",
    "cx": 552.8,
    "cy": 860.7,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 547.3 860.7 A 5.5 5.5 0 1 0 558.3 860.7 A 5.5 5.5 0 1 0 547.3 860.7",
    "hitD": "M 532.8 860.7 A 20 20 0 1 0 572.8 860.7 A 20 20 0 1 0 532.8 860.7",
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 51A",
      "km": "KM 1+935"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "JALUR 1 TRACK LAA",
      "km": "KM 1+935"
    }
  },
  {
    "id": "titik_wesel_w31a1",
    "code": "WESEL 31A1 (JNG BRT)",
    "title": "WESEL 31A1 (EMPL JATINEGARA BARAT)",
    "km": "KM 1+995",
    "category": "TITIK WESEL",
    "cx": 593.4,
    "cy": 813.3,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 587.9 813.3 A 5.5 5.5 0 1 0 598.9 813.3 A 5.5 5.5 0 1 0 587.9 813.3",
    "hitD": "M 573.4 813.3 A 20 20 0 1 0 613.4 813.3 A 20 20 0 1 0 573.4 813.3",
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 31A1",
      "km": "KM 1+995"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "JALUR 2 TRACK LAA",
      "km": "KM 1+995"
    }
  },
  {
    "id": "titik_wesel_w31a2",
    "code": "WESEL 31A2 (JNG BRT)",
    "title": "WESEL 31A2 (EMPL JATINEGARA BARAT)",
    "km": "KM 2+015",
    "category": "TITIK WESEL",
    "cx": 634.4,
    "cy": 813.3,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 628.9 813.3 A 5.5 5.5 0 1 0 639.9 813.3 A 5.5 5.5 0 1 0 628.9 813.3",
    "hitD": "M 614.4 813.3 A 20 20 0 1 0 654.4 813.3 A 20 20 0 1 0 614.4 813.3",
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 31A2",
      "km": "KM 2+015"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "JALUR 2 TRACK LAA",
      "km": "KM 2+015"
    }
  },
  {
    "id": "titik_wesel_w11a_mri",
    "code": "WESEL 11A (JNG BRT)",
    "title": "WESEL 11A (EMPL JATINEGARA BARAT)",
    "km": "KM 2+095",
    "category": "TITIK WESEL",
    "cx": 677.4,
    "cy": 762.8,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 671.9 762.8 A 5.5 5.5 0 1 0 682.9 762.8 A 5.5 5.5 0 1 0 671.9 762.8",
    "hitD": "M 657.4 762.8 A 20 20 0 1 0 697.4 762.8 A 20 20 0 1 0 657.4 762.8",
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 11A",
      "km": "KM 2+095"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "JALUR 3 TRACK LAA",
      "km": "KM 2+095"
    }
  },
  {
    "id": "titik_wesel_w11b1",
    "code": "WESEL 11B1 (JNG BRT)",
    "title": "WESEL 11B1 (EMPL JATINEGARA BARAT)",
    "km": "KM 2+100",
    "category": "TITIK WESEL",
    "cx": 720.4,
    "cy": 762.8,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 714.9 762.8 A 5.5 5.5 0 1 0 725.9 762.8 A 5.5 5.5 0 1 0 714.9 762.8",
    "hitD": "M 700.4 762.8 A 20 20 0 1 0 740.4 762.8 A 20 20 0 1 0 700.4 762.8",
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 11B1",
      "km": "KM 2+100"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "JALUR 3 TRACK LAA",
      "km": "KM 2+100"
    }
  },
  {
    "id": "titik_wesel_w21a2",
    "code": "WESEL 21A2 (JNG BRT)",
    "title": "WESEL 21A2 (EMPL JATINEGARA BARAT)",
    "km": "KM 2+157",
    "category": "TITIK WESEL",
    "cx": 752.3,
    "cy": 716.8,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 746.8 716.8 A 5.5 5.5 0 1 0 757.8 716.8 A 5.5 5.5 0 1 0 746.8 716.8",
    "hitD": "M 732.3 716.8 A 20 20 0 1 0 772.3 716.8 A 20 20 0 1 0 732.3 716.8",
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 21A2",
      "km": "KM 2+157"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "JALUR 4 TRACK LAA",
      "km": "KM 2+157"
    }
  },
  {
    "id": "titik_wesel_w31c1",
    "code": "WESEL 31C1 (JNG BRT)",
    "title": "WESEL 31C1 (EMPL JATINEGARA BARAT)",
    "km": "KM 2+435",
    "category": "TITIK WESEL",
    "cx": 932.6,
    "cy": 813.3,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 927.1 813.3 A 5.5 5.5 0 1 0 938.1 813.3 A 5.5 5.5 0 1 0 927.1 813.3",
    "hitD": "M 912.6 813.3 A 20 20 0 1 0 952.6 813.3 A 20 20 0 1 0 912.6 813.3",
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 31C1",
      "km": "KM 2+435"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "JALUR 2 TRACK LAA",
      "km": "KM 2+435"
    }
  },
  {
    "id": "titik_wesel_w51d1",
    "code": "WESEL 51D1 (JNG BRT)",
    "title": "WESEL 51D1 (EMPL JATINEGARA BARAT)",
    "km": "KM 2+435",
    "category": "TITIK WESEL",
    "cx": 932.6,
    "cy": 860.7,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 927.1 860.7 A 5.5 5.5 0 1 0 938.1 860.7 A 5.5 5.5 0 1 0 927.1 860.7",
    "hitD": "M 912.6 860.7 A 20 20 0 1 0 952.6 860.7 A 20 20 0 1 0 912.6 860.7",
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 51D1",
      "km": "KM 2+435"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "JALUR 1 TRACK LAA",
      "km": "KM 2+435"
    }
  },
  {
    "id": "titik_wesel_w31c2",
    "code": "WESEL 31C2 (JNG BRT)",
    "title": "WESEL 31C2 (EMPL JATINEGARA BARAT)",
    "km": "KM 2+498",
    "category": "TITIK WESEL",
    "cx": 992,
    "cy": 813.3,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 986.5 813.3 A 5.5 5.5 0 1 0 997.5 813.3 A 5.5 5.5 0 1 0 986.5 813.3",
    "hitD": "M 972 813.3 A 20 20 0 1 0 1012 813.3 A 20 20 0 1 0 972 813.3",
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 31C2",
      "km": "KM 2+498"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "JALUR 2 TRACK LAA",
      "km": "KM 2+498"
    }
  },
  {
    "id": "titik_wesel_w51d2",
    "code": "WESEL 51D2 (JNG BRT)",
    "title": "WESEL 51D2 (EMPL JATINEGARA BARAT)",
    "km": "KM 2+498",
    "category": "TITIK WESEL",
    "cx": 992,
    "cy": 860.7,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 986.5 860.7 A 5.5 5.5 0 1 0 997.5 860.7 A 5.5 5.5 0 1 0 986.5 860.7",
    "hitD": "M 972 860.7 A 20 20 0 1 0 1012 860.7 A 20 20 0 1 0 972 860.7",
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 51D2",
      "km": "KM 2+498"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "JALUR 1 TRACK LAA",
      "km": "KM 2+498"
    }
  },
  {
    "id": "titik_wesel_w81a1",
    "code": "WESEL 81A1 (JNG BRT)",
    "title": "WESEL 81A1 (EMPL JATINEGARA BARAT)",
    "km": "KM 11+202",
    "category": "TITIK WESEL",
    "cx": 654.3,
    "cy": 527.6,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 648.8 527.6 A 5.5 5.5 0 1 0 659.8 527.6 A 5.5 5.5 0 1 0 648.8 527.6",
    "hitD": "M 634.3 527.6 A 20 20 0 1 0 674.3 527.6 A 20 20 0 1 0 634.3 527.6",
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 81A1",
      "km": "KM 11+202"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "JALUR 7 TRACK LAA",
      "km": "KM 11+202"
    }
  },
  {
    "id": "titik_wesel_w61a1",
    "code": "WESEL 61A1 (JNG BRT)",
    "title": "WESEL 61A1 (EMPL JATINEGARA BARAT)",
    "km": "KM 11+202",
    "category": "TITIK WESEL",
    "cx": 654.3,
    "cy": 575,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 648.8 575 A 5.5 5.5 0 1 0 659.8 575 A 5.5 5.5 0 1 0 648.8 575",
    "hitD": "M 634.3 575 A 20 20 0 1 0 674.3 575 A 20 20 0 1 0 634.3 575",
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 61A1",
      "km": "KM 11+202"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "JALUR 6 TRACK LAA",
      "km": "KM 11+202"
    }
  },
  {
    "id": "titik_wesel_w81a2",
    "code": "WESEL 81A2 (JNG BRT)",
    "title": "WESEL 81A2 (EMPL JATINEGARA BARAT)",
    "km": "KM 11+259",
    "category": "TITIK WESEL",
    "cx": 713.7,
    "cy": 527.6,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 708.2 527.6 A 5.5 5.5 0 1 0 719.2 527.6 A 5.5 5.5 0 1 0 708.2 527.6",
    "hitD": "M 693.7 527.6 A 20 20 0 1 0 733.7 527.6 A 20 20 0 1 0 693.7 527.6",
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 81A2",
      "km": "KM 11+259"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "JALUR 7 TRACK LAA",
      "km": "KM 11+259"
    }
  },
  {
    "id": "titik_wesel_w61a2",
    "code": "WESEL 61A2 (JNG BRT)",
    "title": "WESEL 61A2 (EMPL JATINEGARA BARAT)",
    "km": "KM 11+259",
    "category": "TITIK WESEL",
    "cx": 713.7,
    "cy": 575,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 708.2 575 A 5.5 5.5 0 1 0 719.2 575 A 5.5 5.5 0 1 0 708.2 575",
    "hitD": "M 693.7 575 A 20 20 0 1 0 733.7 575 A 20 20 0 1 0 693.7 575",
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 61A2",
      "km": "KM 11+259"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "JALUR 6 TRACK LAA",
      "km": "KM 11+259"
    }
  },
  {
    "id": "titik_wesel_w61b",
    "code": "WESEL 61B (JNG BRT)",
    "title": "WESEL 61B (EMPL JATINEGARA BARAT)",
    "km": "KM 11+264",
    "category": "TITIK WESEL",
    "cx": 772,
    "cy": 575,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 766.5 575 A 5.5 5.5 0 1 0 777.5 575 A 5.5 5.5 0 1 0 766.5 575",
    "hitD": "M 752 575 A 20 20 0 1 0 792 575 A 20 20 0 1 0 752 575",
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 61B",
      "km": "KM 11+264"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "JALUR 6 TRACK LAA",
      "km": "KM 11+264"
    }
  },
  {
    "id": "titik_wesel_w21c1",
    "code": "WESEL 21C1 (JNG BRT)",
    "title": "WESEL 21C1 (EMPL JATINEGARA BARAT)",
    "km": "KM 11+521",
    "category": "TITIK WESEL",
    "cx": 864.3,
    "cy": 669.9,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 858.8 669.9 A 5.5 5.5 0 1 0 869.8 669.9 A 5.5 5.5 0 1 0 858.8 669.9",
    "hitD": "M 844.3 669.9 A 20 20 0 1 0 884.3 669.9 A 20 20 0 1 0 844.3 669.9",
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 21C1",
      "km": "KM 11+521"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "JALUR 4 TRACK LAA",
      "km": "KM 11+521"
    }
  },
  {
    "id": "titik_wesel_w21c2",
    "code": "WESEL 21C2 (JNG BRT)",
    "title": "WESEL 21C2 (EMPL JATINEGARA BARAT)",
    "km": "KM 11+526",
    "category": "TITIK WESEL",
    "cx": 997.6,
    "cy": 670.2,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 992.1 670.2 A 5.5 5.5 0 1 0 1003.1 670.2 A 5.5 5.5 0 1 0 992.1 670.2",
    "hitD": "M 977.6 670.2 A 20 20 0 1 0 1017.6 670.2 A 20 20 0 1 0 977.6 670.2",
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 21C2",
      "km": "KM 11+526"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "JALUR 4 TRACK LAA",
      "km": "KM 11+526"
    }
  },
  {
    "id": "titik_wesel_w61c",
    "code": "WESEL 61C (JNG BRT)",
    "title": "WESEL 61C (EMPL JATINEGARA BARAT)",
    "km": "KM 11+542",
    "category": "TITIK WESEL",
    "cx": 961.2,
    "cy": 575,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 955.7 575 A 5.5 5.5 0 1 0 966.7 575 A 5.5 5.5 0 1 0 955.7 575",
    "hitD": "M 941.2 575 A 20 20 0 1 0 981.2 575 A 20 20 0 1 0 941.2 575",
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 61C",
      "km": "KM 11+542"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "JALUR 6 TRACK LAA",
      "km": "KM 11+542"
    }
  },
  {
    "id": "titik_wesel_w81c",
    "code": "WESEL 81C (JNG BRT)",
    "title": "WESEL 81C (EMPL JATINEGARA BARAT)",
    "km": "KM 11+542",
    "category": "TITIK WESEL",
    "cx": 959.8,
    "cy": 527.5,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 954.3 527.5 A 5.5 5.5 0 1 0 965.3 527.5 A 5.5 5.5 0 1 0 954.3 527.5",
    "hitD": "M 939.8 527.5 A 20 20 0 1 0 979.8 527.5 A 20 20 0 1 0 939.8 527.5",
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 81C",
      "km": "KM 11+542"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "JALUR 7 TRACK LAA",
      "km": "KM 11+542"
    }
  },
  {
    "id": "titik_wesel_w41b",
    "code": "WESEL 41B (JNG BRT)",
    "title": "WESEL 41B (EMPL JATINEGARA BARAT)",
    "km": "KM 11+630",
    "category": "TITIK WESEL",
    "cx": 1038.3,
    "cy": 622.6,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 1032.8 622.6 A 5.5 5.5 0 1 0 1043.8 622.6 A 5.5 5.5 0 1 0 1032.8 622.6",
    "hitD": "M 1018.3 622.6 A 20 20 0 1 0 1058.3 622.6 A 20 20 0 1 0 1018.3 622.6",
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 41B",
      "km": "KM 11+630"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "JALUR 5 TRACK LAA",
      "km": "KM 11+630"
    }
  },
  {
    "id": "titik_wesel_w63a",
    "code": "WESEL 63A (JNG TMR)",
    "title": "WESEL 63A (EMPL JATINEGARA TIMUR)",
    "km": "KM 12+012",
    "category": "TITIK WESEL",
    "cx": 1483.8,
    "cy": 622.8,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 1478.3 622.8 A 5.5 5.5 0 1 0 1489.3 622.8 A 5.5 5.5 0 1 0 1478.3 622.8",
    "hitD": "M 1463.8 622.8 A 20 20 0 1 0 1503.8 622.8 A 20 20 0 1 0 1463.8 622.8",
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 63A",
      "km": "KM 12+012"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "JALUR 5 TRACK LAA",
      "km": "KM 12+012"
    }
  },
  {
    "id": "titik_wesel_w83a1",
    "code": "WESEL 83A1 (JNG TMR)",
    "title": "WESEL 83A1 (EMPL JATINEGARA TIMUR)",
    "km": "KM 12+057",
    "category": "TITIK WESEL",
    "cx": 1452.8,
    "cy": 527.7,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 1447.3 527.7 A 5.5 5.5 0 1 0 1458.3 527.7 A 5.5 5.5 0 1 0 1447.3 527.7",
    "hitD": "M 1432.8 527.7 A 20 20 0 1 0 1472.8 527.7 A 20 20 0 1 0 1432.8 527.7",
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 83A1",
      "km": "KM 12+057"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "JALUR 7 TRACK LAA",
      "km": "KM 12+057"
    }
  },
  {
    "id": "titik_wesel_w23b1",
    "code": "WESEL 23B1 (JNG TMR)",
    "title": "WESEL 23B1 (EMPL JATINEGARA TIMUR)",
    "km": "KM 12+086",
    "category": "TITIK WESEL",
    "cx": 1546,
    "cy": 717.7,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 1540.5 717.7 A 5.5 5.5 0 1 0 1551.5 717.7 A 5.5 5.5 0 1 0 1540.5 717.7",
    "hitD": "M 1526 717.7 A 20 20 0 1 0 1566 717.7 A 20 20 0 1 0 1526 717.7",
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 23B1",
      "km": "KM 12+086"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "JALUR 4 TRACK LAA",
      "km": "KM 12+086"
    }
  },
  {
    "id": "titik_wesel_w83a2",
    "code": "WESEL 83A2 (JNG TMR)",
    "title": "WESEL 83A2 (EMPL JATINEGARA TIMUR)",
    "km": "KM 12+057",
    "category": "TITIK WESEL",
    "cx": 1628.1,
    "cy": 669.9,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 1622.6 669.9 A 5.5 5.5 0 1 0 1633.6 669.9 A 5.5 5.5 0 1 0 1622.6 669.9",
    "hitD": "M 1608.1 669.9 A 20 20 0 1 0 1648.1 669.9 A 20 20 0 1 0 1608.1 669.9",
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 83A2",
      "km": "KM 12+057"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "JALUR 7 TRACK LAA",
      "km": "KM 12+057"
    }
  },
  {
    "id": "titik_wesel_w23b2",
    "code": "WESEL 23B2 (JNG TMR)",
    "title": "WESEL 23B2 (EMPL JATINEGARA TIMUR)",
    "km": "KM 12+102",
    "category": "TITIK WESEL",
    "cx": 1597.2,
    "cy": 718.1,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 1591.7 718.1 A 5.5 5.5 0 1 0 1602.7 718.1 A 5.5 5.5 0 1 0 1591.7 718.1",
    "hitD": "M 1577.2 718.1 A 20 20 0 1 0 1617.2 718.1 A 20 20 0 1 0 1577.2 718.1",
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 23B2",
      "km": "KM 12+102"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "JALUR 4 TRACK LAA",
      "km": "KM 12+102"
    }
  },
  {
    "id": "titik_wesel_w23c1",
    "code": "WESEL 23C1 (JNG TMR)",
    "title": "WESEL 23C1 (EMPL JATINEGARA TIMUR)",
    "km": "KM 12+156",
    "category": "TITIK WESEL",
    "cx": 1667.3,
    "cy": 717.7,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 1661.8 717.7 A 5.5 5.5 0 1 0 1672.8 717.7 A 5.5 5.5 0 1 0 1661.8 717.7",
    "hitD": "M 1647.3 717.7 A 20 20 0 1 0 1687.3 717.7 A 20 20 0 1 0 1647.3 717.7",
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 23C1",
      "km": "KM 12+156"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "JALUR W23C TRACK LAA",
      "km": "KM 12+156"
    }
  },
  {
    "id": "titik_wesel_w23c2",
    "code": "WESEL 23C2 (JNG TMR)",
    "title": "WESEL 23C2 (EMPL JATINEGARA TIMUR)",
    "km": "KM 12+181",
    "category": "TITIK WESEL",
    "cx": 1693.4,
    "cy": 718.1,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 1687.9 718.1 A 5.5 5.5 0 1 0 1698.9 718.1 A 5.5 5.5 0 1 0 1687.9 718.1",
    "hitD": "M 1673.4 718.1 A 20 20 0 1 0 1713.4 718.1 A 20 20 0 1 0 1673.4 718.1",
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 23C2",
      "km": "KM 12+181"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "JALUR W23C TRACK LAA",
      "km": "KM 12+181"
    }
  },
  {
    "id": "titik_wesel_w33a",
    "code": "WESEL 33A (JNG TMR)",
    "title": "WESEL 33A (EMPL JATINEGARA TIMUR)",
    "km": "KM 12+045",
    "category": "TITIK WESEL",
    "cx": 1560.5,
    "cy": 813.1,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 1555 813.1 A 5.5 5.5 0 1 0 1566 813.1 A 5.5 5.5 0 1 0 1555 813.1",
    "hitD": "M 1540.5 813.1 A 20 20 0 1 0 1580.5 813.1 A 20 20 0 1 0 1540.5 813.1",
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 33A",
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
    "code": "WESEL 13B (JNG TMR)",
    "title": "WESEL 13B (EMPL JATINEGARA TIMUR)",
    "km": "KM 12+110",
    "category": "TITIK WESEL",
    "cx": 1600.7,
    "cy": 765.1,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 1595.2 765.1 A 5.5 5.5 0 1 0 1606.2 765.1 A 5.5 5.5 0 1 0 1595.2 765.1",
    "hitD": "M 1580.7 765.1 A 20 20 0 1 0 1620.7 765.1 A 20 20 0 1 0 1580.7 765.1",
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 13B",
      "km": "KM 12+110"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "JALUR 3 TRACK LAA",
      "km": "KM 12+110"
    }
  },
  {
    "id": "titik_wesel_w13c1",
    "code": "WESEL 13C1 (JNG TMR)",
    "title": "WESEL 13C1 (EMPL JATINEGARA TIMUR)",
    "km": "KM 12+159",
    "category": "TITIK WESEL",
    "cx": 1638.4,
    "cy": 765.2,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 1632.9 765.2 A 5.5 5.5 0 1 0 1643.9 765.2 A 5.5 5.5 0 1 0 1632.9 765.2",
    "hitD": "M 1618.4 765.2 A 20 20 0 1 0 1658.4 765.2 A 20 20 0 1 0 1618.4 765.2",
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 13C1",
      "km": "KM 12+159"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "JALUR 3 TRACK LAA",
      "km": "KM 12+159"
    }
  },
  {
    "id": "titik_wesel_w33b1",
    "code": "WESEL 33B1 (JNG TMR)",
    "title": "WESEL 33B1 (EMPL JATINEGARA TIMUR)",
    "km": "KM 12+245",
    "category": "TITIK WESEL",
    "cx": 1708.7,
    "cy": 813,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 1703.2 813 A 5.5 5.5 0 1 0 1714.2 813 A 5.5 5.5 0 1 0 1703.2 813",
    "hitD": "M 1688.7 813 A 20 20 0 1 0 1728.7 813 A 20 20 0 1 0 1688.7 813",
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 33B1",
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
    "code": "WESEL 13C2 (JNG TMR)",
    "title": "WESEL 13C2 (EMPL JATINEGARA TIMUR)",
    "km": "KM 12+170",
    "category": "TITIK WESEL",
    "cx": 1667,
    "cy": 765.2,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 1661.5 765.2 A 5.5 5.5 0 1 0 1672.5 765.2 A 5.5 5.5 0 1 0 1661.5 765.2",
    "hitD": "M 1647 765.2 A 20 20 0 1 0 1687 765.2 A 20 20 0 1 0 1647 765.2",
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 13C2",
      "km": "KM 12+170"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "JALUR 3 TRACK LAA",
      "km": "KM 12+170"
    }
  },
  {
    "id": "titik_wesel_w13d1",
    "code": "WESEL 13D1 (JNG TMR)",
    "title": "WESEL 13D1 (EMPL JATINEGARA TIMUR)",
    "km": "KM 12+250",
    "category": "TITIK WESEL",
    "cx": 1734.8,
    "cy": 765.3,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 1729.3 765.3 A 5.5 5.5 0 1 0 1740.3 765.3 A 5.5 5.5 0 1 0 1729.3 765.3",
    "hitD": "M 1714.8 765.3 A 20 20 0 1 0 1754.8 765.3 A 20 20 0 1 0 1714.8 765.3",
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 13D1",
      "km": "KM 12+250"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "JALUR 3 TRACK LAA",
      "km": "KM 12+250"
    }
  },
  {
    "id": "titik_wesel_w13d2",
    "code": "WESEL 13D2 (JNG TMR)",
    "title": "WESEL 13D2 (EMPL JATINEGARA TIMUR)",
    "km": "KM 12+278",
    "category": "TITIK WESEL",
    "cx": 1750.1,
    "cy": 765.3,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 1744.6 765.3 A 5.5 5.5 0 1 0 1755.6 765.3 A 5.5 5.5 0 1 0 1744.6 765.3",
    "hitD": "M 1730.1 765.3 A 20 20 0 1 0 1770.1 765.3 A 20 20 0 1 0 1730.1 765.3",
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 13D2",
      "km": "KM 12+278"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "JALUR 3 TRACK LAA",
      "km": "KM 12+278"
    }
  },
  {
    "id": "titik_wesel_w33b2",
    "code": "WESEL 33B2 (JNG TMR)",
    "title": "WESEL 33B2 (EMPL JATINEGARA TIMUR)",
    "km": "KM 12+250",
    "category": "TITIK WESEL",
    "cx": 1750.7,
    "cy": 813,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 1745.2 813 A 5.5 5.5 0 1 0 1756.2 813 A 5.5 5.5 0 1 0 1745.2 813",
    "hitD": "M 1730.7 813 A 20 20 0 1 0 1770.7 813 A 20 20 0 1 0 1730.7 813",
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 33B2",
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
    "code": "WESEL 33C1 (JNG TMR)",
    "title": "WESEL 33C1 (EMPL JATINEGARA TIMUR)",
    "km": "KM 12+346",
    "category": "TITIK WESEL",
    "cx": 1791.9,
    "cy": 813,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 1786.4 813 A 5.5 5.5 0 1 0 1797.4 813 A 5.5 5.5 0 1 0 1786.4 813",
    "hitD": "M 1771.9 813 A 20 20 0 1 0 1811.9 813 A 20 20 0 1 0 1771.9 813",
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 33C1",
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
    "code": "WESEL 53B (JNG TMR)",
    "title": "WESEL 53B (EMPL JATINEGARA TIMUR)",
    "km": "KM 12+335",
    "category": "TITIK WESEL",
    "cx": 1791.9,
    "cy": 861.1,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 1786.4 861.1 A 5.5 5.5 0 1 0 1797.4 861.1 A 5.5 5.5 0 1 0 1786.4 861.1",
    "hitD": "M 1771.9 861.1 A 20 20 0 1 0 1811.9 861.1 A 20 20 0 1 0 1771.9 861.1",
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 53B",
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
    "code": "WESEL 33C2 (JNG TMR)",
    "title": "WESEL 33C2 (EMPL JATINEGARA TIMUR)",
    "km": "KM 12+415",
    "category": "TITIK WESEL",
    "cx": 1834.7,
    "cy": 813,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 1829.2 813 A 5.5 5.5 0 1 0 1840.2 813 A 5.5 5.5 0 1 0 1829.2 813",
    "hitD": "M 1814.7 813 A 20 20 0 1 0 1854.7 813 A 20 20 0 1 0 1814.7 813",
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 33C2",
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
    "code": "WESEL 53C (JNG TMR)",
    "title": "WESEL 53C (EMPL JATINEGARA TIMUR)",
    "km": "KM 12+473",
    "category": "TITIK WESEL",
    "cx": 1876.4,
    "cy": 861.1,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 1870.9 861.1 A 5.5 5.5 0 1 0 1881.9 861.1 A 5.5 5.5 0 1 0 1870.9 861.1",
    "hitD": "M 1856.4 861.1 A 20 20 0 1 0 1896.4 861.1 A 20 20 0 1 0 1856.4 861.1",
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 53C",
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
    "code": "WESEL 21A (CUK)",
    "title": "WESEL 21A (EMPL CAKUNG)",
    "km": "KM 20+687",
    "category": "TITIK WESEL",
    "cx": 2667.5,
    "cy": 1343.7,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 2662 1343.7 A 5.5 5.5 0 1 0 2673 1343.7 A 5.5 5.5 0 1 0 2662 1343.7",
    "hitD": "M 2647.5 1343.7 A 20 20 0 1 0 2687.5 1343.7 A 20 20 0 1 0 2647.5 1343.7",
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 21A",
      "km": "KM 20+687"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "JALUR 3 TRACK LAA",
      "km": "KM 20+687"
    }
  },
  {
    "id": "titik_wesel_w11a_cuk",
    "code": "WESEL 11A (CUK)",
    "title": "WESEL 11A (EMPL CAKUNG)",
    "km": "KM 20+740",
    "category": "TITIK WESEL",
    "cx": 2628.6,
    "cy": 1295.8,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 2623.1 1295.8 A 5.5 5.5 0 1 0 2634.1 1295.8 A 5.5 5.5 0 1 0 2623.1 1295.8",
    "hitD": "M 2608.6 1295.8 A 20 20 0 1 0 2648.6 1295.8 A 20 20 0 1 0 2608.6 1295.8",
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 11A",
      "km": "KM 20+740"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "JALUR 2 TRACK LAA",
      "km": "KM 20+740"
    }
  },
  {
    "id": "titik_wesel_w21b_cuk",
    "code": "WESEL 21B (CUK)",
    "title": "WESEL 21B (EMPL CAKUNG)",
    "km": "KM 20+762",
    "category": "TITIK WESEL",
    "cx": 2617.7,
    "cy": 1343.7,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 2612.2 1343.7 A 5.5 5.5 0 1 0 2623.2 1343.7 A 5.5 5.5 0 1 0 2612.2 1343.7",
    "hitD": "M 2597.7 1343.7 A 20 20 0 1 0 2637.7 1343.7 A 20 20 0 1 0 2597.7 1343.7",
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 21B",
      "km": "KM 20+762"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "JALUR 3 TRACK LAA",
      "km": "KM 20+762"
    }
  },
  {
    "id": "titik_wesel_w11b_cuk",
    "code": "WESEL 11B (CUK)",
    "title": "WESEL 11B (EMPL CAKUNG)",
    "km": "KM 20+762",
    "category": "TITIK WESEL",
    "cx": 2617.7,
    "cy": 1295.8,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 2612.2 1295.8 A 5.5 5.5 0 1 0 2623.2 1295.8 A 5.5 5.5 0 1 0 2612.2 1295.8",
    "hitD": "M 2597.7 1295.8 A 20 20 0 1 0 2637.7 1295.8 A 20 20 0 1 0 2597.7 1295.8",
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 11B",
      "km": "KM 20+762"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "JALUR 2 TRACK LAA",
      "km": "KM 20+762"
    }
  },
  {
    "id": "titik_wesel_w23a_cuk",
    "code": "WESEL 23A (CUK)",
    "title": "WESEL 23A (EMPL CAKUNG)",
    "km": "KM 21+360",
    "category": "TITIK WESEL",
    "cx": 2415.7,
    "cy": 1343.6,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 2410.2 1343.6 A 5.5 5.5 0 1 0 2421.2 1343.6 A 5.5 5.5 0 1 0 2410.2 1343.6",
    "hitD": "M 2395.7 1343.6 A 20 20 0 1 0 2435.7 1343.6 A 20 20 0 1 0 2395.7 1343.6",
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 23A",
      "km": "KM 21+360"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "JALUR 3 TRACK LAA",
      "km": "KM 21+360"
    }
  },
  {
    "id": "titik_wesel_w13a_cuk",
    "code": "WESEL 13A (CUK)",
    "title": "WESEL 13A (EMPL CAKUNG)",
    "km": "KM 21+360",
    "category": "TITIK WESEL",
    "cx": 2415.7,
    "cy": 1295.3,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 2410.2 1295.3 A 5.5 5.5 0 1 0 2421.2 1295.3 A 5.5 5.5 0 1 0 2410.2 1295.3",
    "hitD": "M 2395.7 1295.3 A 20 20 0 1 0 2435.7 1295.3 A 20 20 0 1 0 2395.7 1295.3",
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 13A",
      "km": "KM 21+360"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "JALUR 2 TRACK LAA",
      "km": "KM 21+360"
    }
  },
  {
    "id": "titik_wesel_w13b_cuk",
    "code": "WESEL 13B (CUK)",
    "title": "WESEL 13B (EMPL CAKUNG)",
    "km": "KM 21+387",
    "category": "TITIK WESEL",
    "cx": 2407.1,
    "cy": 1295.4,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 2401.6 1295.4 A 5.5 5.5 0 1 0 2412.6 1295.4 A 5.5 5.5 0 1 0 2401.6 1295.4",
    "hitD": "M 2387.1 1295.4 A 20 20 0 1 0 2427.1 1295.4 A 20 20 0 1 0 2387.1 1295.4",
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 13B",
      "km": "KM 21+387"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "JALUR 2 TRACK LAA",
      "km": "KM 21+387"
    }
  },
  {
    "id": "titik_wesel_w23b_cuk",
    "code": "WESEL 23B (CUK)",
    "title": "WESEL 23B (EMPL CAKUNG)",
    "km": "KM 21+445",
    "category": "TITIK WESEL",
    "cx": 2366.8,
    "cy": 1343.6,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 2361.3 1343.6 A 5.5 5.5 0 1 0 2372.3 1343.6 A 5.5 5.5 0 1 0 2361.3 1343.6",
    "hitD": "M 2346.8 1343.6 A 20 20 0 1 0 2386.8 1343.6 A 20 20 0 1 0 2346.8 1343.6",
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 23B",
      "km": "KM 21+445"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "JALUR 3 TRACK LAA",
      "km": "KM 21+445"
    }
  },
  {
    "id": "titik_wesel_w51a_bks",
    "code": "WESEL 51A (BKS)",
    "title": "WESEL 51A (EMPL BEKASI)",
    "km": "KM 25+946",
    "category": "TITIK WESEL",
    "cx": 1547.1,
    "cy": 1343.6,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 1541.6 1343.6 A 5.5 5.5 0 1 0 1552.6 1343.6 A 5.5 5.5 0 1 0 1541.6 1343.6",
    "hitD": "M 1527.1 1343.6 A 20 20 0 1 0 1567.1 1343.6 A 20 20 0 1 0 1527.1 1343.6",
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 51A",
      "km": "KM 25+946"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "JALUR 5 TRACK LAA",
      "km": "KM 25+946"
    }
  },
  {
    "id": "titik_wesel_w71a_bks",
    "code": "WESEL 71A (BKS)",
    "title": "WESEL 71A (EMPL BEKASI)",
    "km": "KM 26+007",
    "category": "TITIK WESEL",
    "cx": 1505.1,
    "cy": 1293.8,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 1499.6 1293.8 A 5.5 5.5 0 1 0 1510.6 1293.8 A 5.5 5.5 0 1 0 1499.6 1293.8",
    "hitD": "M 1485.1 1293.8 A 20 20 0 1 0 1525.1 1293.8 A 20 20 0 1 0 1485.1 1293.8",
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 71A",
      "km": "KM 26+007"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "JALUR 6 TRACK LAA",
      "km": "KM 26+007"
    }
  },
  {
    "id": "titik_wesel_w71b_bks",
    "code": "WESEL 71B (BKS)",
    "title": "WESEL 71B (EMPL BEKASI)",
    "km": "KM 26+101",
    "category": "TITIK WESEL",
    "cx": 1474.7,
    "cy": 1294.1,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 1469.2 1294.1 A 5.5 5.5 0 1 0 1480.2 1294.1 A 5.5 5.5 0 1 0 1469.2 1294.1",
    "hitD": "M 1454.7 1294.1 A 20 20 0 1 0 1494.7 1294.1 A 20 20 0 1 0 1454.7 1294.1",
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 71B",
      "km": "KM 26+101"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "JALUR 6 TRACK LAA",
      "km": "KM 26+101"
    }
  },
  {
    "id": "titik_wesel_w51b_bks",
    "code": "WESEL 51B (BKS)",
    "title": "WESEL 51B (EMPL BEKASI)",
    "km": "KM 26+165",
    "category": "TITIK WESEL",
    "cx": 1431.2,
    "cy": 1343.8,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 1425.7 1343.8 A 5.5 5.5 0 1 0 1436.7 1343.8 A 5.5 5.5 0 1 0 1425.7 1343.8",
    "hitD": "M 1411.2 1343.8 A 20 20 0 1 0 1451.2 1343.8 A 20 20 0 1 0 1411.2 1343.8",
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 51B",
      "km": "KM 26+165"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "JALUR 5 TRACK LAA",
      "km": "KM 26+165"
    }
  },
  {
    "id": "titik_wesel_w51c_bks",
    "code": "WESEL 51C (BKS)",
    "title": "WESEL 51C (EMPL BEKASI)",
    "km": "KM 26+182",
    "category": "TITIK WESEL",
    "cx": 1341.8,
    "cy": 1343.4,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 1336.3 1343.4 A 5.5 5.5 0 1 0 1347.3 1343.4 A 5.5 5.5 0 1 0 1336.3 1343.4",
    "hitD": "M 1321.8 1343.4 A 20 20 0 1 0 1361.8 1343.4 A 20 20 0 1 0 1321.8 1343.4",
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 51C",
      "km": "KM 26+182"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "JALUR 5 TRACK LAA",
      "km": "KM 26+182"
    }
  },
  {
    "id": "titik_wesel_w71c1_bks",
    "code": "WESEL 71C1 (BKS)",
    "title": "WESEL 71C1 (EMPL BEKASI)",
    "km": "KM 26+189",
    "category": "TITIK WESEL",
    "cx": 1341.8,
    "cy": 1293.8,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 1336.3 1293.8 A 5.5 5.5 0 1 0 1347.3 1293.8 A 5.5 5.5 0 1 0 1336.3 1293.8",
    "hitD": "M 1321.8 1293.8 A 20 20 0 1 0 1361.8 1293.8 A 20 20 0 1 0 1321.8 1293.8",
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 71C1",
      "km": "KM 26+189"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "JALUR 6 TRACK LAA",
      "km": "KM 26+189"
    }
  },
  {
    "id": "titik_wesel_w31b_bks",
    "code": "WESEL 31B (BKS)",
    "title": "WESEL 31B (EMPL BEKASI)",
    "km": "KM 26+253",
    "category": "TITIK WESEL",
    "cx": 1296.8,
    "cy": 1404.8,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 1291.3 1404.8 A 5.5 5.5 0 1 0 1302.3 1404.8 A 5.5 5.5 0 1 0 1291.3 1404.8",
    "hitD": "M 1276.8 1404.8 A 20 20 0 1 0 1316.8 1404.8 A 20 20 0 1 0 1276.8 1404.8",
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 31B",
      "km": "KM 26+253"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "JALUR 4 TRACK LAA",
      "km": "KM 26+253"
    }
  },
  {
    "id": "titik_wesel_w71c_bks",
    "code": "WESEL 71C (BKS)",
    "title": "WESEL 71C (EMPL BEKASI)",
    "km": "KM 26+270",
    "category": "TITIK WESEL",
    "cx": 1299.6,
    "cy": 1243.1,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 1294.1 1243.1 A 5.5 5.5 0 1 0 1305.1 1243.1 A 5.5 5.5 0 1 0 1294.1 1243.1",
    "hitD": "M 1279.6 1243.1 A 20 20 0 1 0 1319.6 1243.1 A 20 20 0 1 0 1279.6 1243.1",
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 71C",
      "km": "KM 26+270"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "JALUR 7 TRACK LAA",
      "km": "KM 26+270"
    }
  },
  {
    "id": "titik_wesel_w73_bks",
    "code": "WESEL 73 (BKS)",
    "title": "WESEL 73 (EMPL BEKASI)",
    "km": "KM 26+723",
    "category": "TITIK WESEL",
    "cx": 776.9,
    "cy": 1294.6,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 771.4 1294.6 A 5.5 5.5 0 1 0 782.4 1294.6 A 5.5 5.5 0 1 0 771.4 1294.6",
    "hitD": "M 756.9 1294.6 A 20 20 0 1 0 796.9 1294.6 A 20 20 0 1 0 756.9 1294.6",
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 73",
      "km": "KM 26+723"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "JALUR 6 TRACK LAA",
      "km": "KM 26+723"
    }
  },
  {
    "id": "titik_wesel_w53_bks",
    "code": "WESEL 53 (BKS)",
    "title": "WESEL 53 (EMPL BEKASI)",
    "km": "KM 26+723",
    "category": "TITIK WESEL",
    "cx": 775.8,
    "cy": 1344.2,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 770.3 1344.2 A 5.5 5.5 0 1 0 781.3 1344.2 A 5.5 5.5 0 1 0 770.3 1344.2",
    "hitD": "M 755.8 1344.2 A 20 20 0 1 0 795.8 1344.2 A 20 20 0 1 0 755.8 1344.2",
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 53",
      "km": "KM 26+723"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "JALUR 5 TRACK LAA",
      "km": "KM 26+723"
    }
  },
  {
    "id": "titik_wesel_w33a_bks",
    "code": "WESEL 33A (BKS)",
    "title": "WESEL 33A (EMPL BEKASI)",
    "km": "KM 26+658",
    "category": "TITIK WESEL",
    "cx": 826.9,
    "cy": 1405.7,
    "r": 5.5,
    "isDot": true,
    "isCrossing": true,
    "color": "#000000",
    "d": "M 821.4 1405.7 A 5.5 5.5 0 1 0 832.4 1405.7 A 5.5 5.5 0 1 0 821.4 1405.7",
    "hitD": "M 806.9 1405.7 A 20 20 0 1 0 846.9 1405.7 A 20 20 0 1 0 806.9 1405.7",
    "startDivider": {
      "type": "WESEL",
      "label": "WESEL 33A",
      "km": "KM 26+658"
    },
    "endDivider": {
      "type": "JALUR",
      "label": "JALUR 4 TRACK LAA",
      "km": "KM 26+658"
    }
  },
  {
    "id": "wesel_w31c1_932",
    "code": "WESEL 31C1 (JNG BRT)",
    "title": "CROSSTREK WESEL 31C1 - WESEL 51D2",
    "km": "KM 11+650",
    "category": "TITIK CROSSING",
    "d": "M 932.6 813.3 L 974.3 846.6",
    "color": "#f8d731",
    "isCrossing": true,
    "startDivider": null,
    "endDivider": null
  },
  {
    "id": "wesel_w31c2_992",
    "code": "WESEL 31C2 (JNG BRT)",
    "title": "CROSSTREK WESEL 31C2 - WESEL 51D1",
    "km": "KM 11+700",
    "category": "TITIK CROSSING",
    "d": "M 992 813.3 L 950.2 846.6",
    "color": "#f8d731",
    "isCrossing": true,
    "startDivider": null,
    "endDivider": null
  },
  {
    "id": "wesel_w51d1_946",
    "code": "WESEL 51D1 (JNG BRT)",
    "title": "CROSSTREK WESEL 51D1 - WESEL 31C2",
    "km": "KM 11+650",
    "category": "TITIK CROSSING",
    "d": "M 946 849.9 L 932.6 860.7",
    "color": "#ff00ff",
    "isCrossing": true,
    "startDivider": null,
    "endDivider": null
  },
  {
    "id": "wesel_w51d2_978",
    "code": "WESEL 51D2 (JNG BRT)",
    "title": "CROSSTREK WESEL 51D2 - WESEL 31C1",
    "km": "KM 11+700",
    "category": "TITIK CROSSING",
    "d": "M 978.8 850.2 L 992 860.7",
    "color": "#ff00ff",
    "isCrossing": true,
    "startDivider": null,
    "endDivider": null
  },
  {
    "id": "wesel_w83a2_1628",
    "code": "WESEL 83A2 (JNG TMR)",
    "title": "CROSSING WESEL 83A2 - WESEL 23C1",
    "km": "KM 11+900",
    "category": "TITIK CROSSING",
    "d": "M 1628.1 669.9 L 1667.3 717.7",
    "color": "#139a47",
    "isCrossing": true,
    "startDivider": null,
    "endDivider": null
  },
  {
    "id": "wesel_w23b1_1596",
    "code": "WESEL 23B2 (JNG TMR)",
    "title": "CROSSING WESEL 23B2 - WESEL 13C1",
    "km": "KM 11+920",
    "category": "TITIK CROSSING",
    "d": "M 1596.8 717.7 L 1613.8 737.2",
    "color": "#cc6827",
    "isCrossing": true,
    "startDivider": null,
    "endDivider": null
  },
  {
    "id": "wesel_w23b2_1617",
    "code": "WESEL 13C1 (JNG TMR)",
    "title": "CROSSING WESEL 13C1 - WESEL 23B2",
    "km": "KM 11+950",
    "category": "TITIK CROSSING",
    "d": "M 1617.5 741.2 L 1638.4 765.2",
    "color": "#f8d731",
    "isCrossing": true,
    "startDivider": null,
    "endDivider": null
  },
  {
    "id": "wesel_w23c1_1692",
    "code": "WESEL 23C2 (JNG TMR)",
    "title": "CROSSING WESEL 23C2 - WESEL 13D1",
    "km": "KM 12+000",
    "category": "TITIK CROSSING",
    "d": "M 1692.9 717.7 L 1710 737.4",
    "color": "#139a47",
    "isCrossing": true,
    "startDivider": null,
    "endDivider": null
  },
  {
    "id": "wesel_w23c2_1713",
    "code": "WESEL 13D1 (JNG TMR)",
    "title": "CROSSING WESEL 13D1 - WESEL 23C2",
    "km": "KM 12+050",
    "category": "TITIK CROSSING",
    "d": "M 1713.8 741.3 L 1734.8 765.3",
    "color": "#f8d731",
    "isCrossing": true,
    "startDivider": null,
    "endDivider": null
  },
  {
    "id": "wesel_w13b_1600",
    "code": "WESEL 33A (JNG TMR)",
    "title": "CROSSING WESEL 33A - WESEL 13B",
    "km": "KM 11+900",
    "category": "TITIK CROSSING",
    "d": "M 1600.7 765.1 L 1560.5 813.1",
    "color": "#f8d731",
    "isCrossing": true,
    "startDivider": null,
    "endDivider": null
  },
  {
    "id": "wesel_w13c_1667",
    "code": "WESEL 13C2 (JNG TMR)",
    "title": "CROSSING WESEL 13C2 - WESEL 33B1",
    "km": "KM 12+000",
    "category": "TITIK CROSSING",
    "d": "M 1667 765.2 L 1708.7 813.0",
    "color": "#f8d731",
    "isCrossing": true,
    "startDivider": null,
    "endDivider": null
  },
  {
    "id": "wesel_w13d1_1750",
    "code": "WESEL 13D2 (JNG TMR)",
    "title": "CROSSING WESEL 13D2 - WESEL 33C1",
    "km": "KM 12+100",
    "category": "TITIK CROSSING",
    "d": "M 1750.1 765.3 L 1767.3 785.0",
    "color": "#f8d731",
    "isCrossing": true,
    "startDivider": null,
    "endDivider": null
  },
  {
    "id": "wesel_w13d2_1771",
    "code": "WESEL 33C1 (JNG TMR)",
    "title": "CROSSING WESEL 33C1 - WESEL 13D2",
    "km": "KM 12+150",
    "category": "TITIK CROSSING",
    "d": "M 1771.6 789.7 L 1791.9 813.0",
    "color": "#f8d731",
    "isCrossing": true,
    "startDivider": null,
    "endDivider": null
  },
  {
    "id": "wesel_w33b_1750",
    "code": "WESEL 33B2 (JNG TMR)",
    "title": "CROSSING WESEL 33B2 - WESEL 53B",
    "km": "KM 12+250",
    "category": "TITIK CROSSING",
    "d": "M 1750.7 813.0 L 1767.8 833.6",
    "color": "#f8d731",
    "isCrossing": true,
    "startDivider": null,
    "endDivider": null
  },
  {
    "id": "wesel_w53b_1771",
    "code": "WESEL 53B (JNG TMR)",
    "title": "CROSSING WESEL 53B - WESEL 33B2",
    "km": "KM 12+180",
    "category": "TITIK CROSSING",
    "d": "M 1771.6 837.8 L 1791.9 861.1",
    "color": "#ff00ff",
    "isCrossing": true,
    "startDivider": null,
    "endDivider": null
  },
  {
    "id": "wesel_w33c_1834",
    "code": "WESEL 33C2 (JNG TMR)",
    "title": "CROSSING WESEL 33C2 - WESEL 53C",
    "km": "KM 12+320",
    "category": "TITIK CROSSING",
    "d": "M 1834.1 813.0 L 1851.6 833.1",
    "color": "#f8d731",
    "isCrossing": true,
    "startDivider": null,
    "endDivider": null
  },
  {
    "id": "wesel_w53c_1856",
    "code": "WESEL 53C (JNG TMR)",
    "title": "CROSSING WESEL 53C - WESEL 33C2",
    "km": "KM 12+350",
    "category": "TITIK CROSSING",
    "d": "M 1856.1 837.8 L 1876.4 861.1",
    "color": "#ff00ff",
    "isCrossing": true,
    "startDivider": null,
    "endDivider": null
  },
  {
    "id": "wesel_w23b_cuk",
    "code": "WESEL 23B (CUK)",
    "title": "CROSSING WESEL 23B - WESEL 13B",
    "km": "KM 21+445",
    "category": "TITIK CROSSING",
    "d": "M 2366.8 1343.6 L 2386.1 1320.8",
    "color": "#cc6827",
    "isCrossing": true,
    "startDivider": null,
    "endDivider": null
  },
  {
    "id": "wesel_w13b_cuk",
    "code": "WESEL 13B (CUK)",
    "title": "CROSSING WESEL 13B - WESEL 23B",
    "km": "KM 21+387",
    "category": "TITIK CROSSING",
    "d": "M 2390 1315.7 L 2407.1 1295.4",
    "color": "#8a6ddd",
    "isCrossing": true,
    "startDivider": null,
    "endDivider": null
  },
  {
    "id": "wesel_w11a_cuk",
    "code": "WESEL 11A (CUK)",
    "title": "CROSSING WESEL 11A - WESEL 21A",
    "km": "KM 20+740",
    "category": "TITIK CROSSING",
    "d": "M 2645 1316.2 L 2628.6 1295.8",
    "color": "#8a6ddd",
    "isCrossing": true,
    "startDivider": null,
    "endDivider": null
  },
  {
    "id": "wesel_w21a_cuk",
    "code": "WESEL 21A (CUK)",
    "title": "CROSSING WESEL 21A - WESEL 11A",
    "km": "KM 20+687",
    "category": "TITIK CROSSING",
    "d": "M 2667.5 1343.7 L 2649.2 1320.9",
    "color": "#cc6827",
    "isCrossing": true,
    "startDivider": null,
    "endDivider": null
  },
  {
    "id": "wesel_w73_bks_807",
    "code": "WESEL 73 (BKS)",
    "title": "CROSSING WESEL 73 - JALUR 7 (EMPL BEKASI)",
    "km": "KM 26+500",
    "category": "TITIK CROSSING",
    "d": "M 807.6 1267.9 L 776.9 1293.5",
    "color": "#139a47",
    "isCrossing": true,
    "startDivider": null,
    "endDivider": null
  },
  {
    "id": "wesel_frp_73_bks",
    "code": "ST. BKS (JL 7)",
    "title": "ST. BEKASI (JALUR 7)",
    "km": "KM 26+500",
    "category": "ST. BEKASI",
    "d": "M 838.4 1242.4 L 812.1 1264.2",
    "color": "#139a47",
    "isCrossing": true,
    "startDivider": null,
    "endDivider": null
  },
  {
    "id": "wesel_w33a_bks_797",
    "code": "WESEL 53 (BKS)",
    "title": "CROSSING WESEL 53 - WESEL 33A",
    "km": "KM 26+600",
    "category": "TITIK CROSSING",
    "d": "M 797.7 1369.9 L 775.6 1343.4",
    "color": "#ec1f24",
    "isCrossing": true,
    "startDivider": null,
    "endDivider": null
  },
  {
    "id": "wesel_w33a_bks_826",
    "code": "WESEL 33A (BKS)",
    "title": "CROSSING WESEL 33A - WESEL 53",
    "km": "KM 26+580",
    "category": "TITIK CROSSING",
    "d": "M 826.6 1404.8 L 801.2 1374.1",
    "color": "#ec1f24",
    "isCrossing": true,
    "startDivider": null,
    "endDivider": null
  },
  {
    "id": "wesel_w71c1_1341",
    "code": "WESEL 71C1 (BKS)",
    "title": "CROSSING WESEL 71C1 - JALUR 7 (EMPL BEKASI)",
    "km": "KM 26+180",
    "category": "TITIK CROSSING",
    "d": "M 1341.8 1293.8 L 1322.7 1270.8",
    "color": "#139a47",
    "isCrossing": true,
    "startDivider": null,
    "endDivider": null
  },
  {
    "id": "wesel_w71b_1454",
    "code": "WESEL 71B (BKS)",
    "title": "CROSSING WESEL 71B - WESEL 51B",
    "km": "KM 26+050",
    "category": "ST. BEKASI",
    "d": "M 1454.3 1318.2 L 1474.7 1294.1",
    "color": "#139a47",
    "isCrossing": true,
    "startDivider": null,
    "endDivider": null
  },
  {
    "id": "wesel_w71a_1524",
    "code": "WESEL 71A (BKS)",
    "title": "CROSSING WESEL 71A - WESEL 51A",
    "km": "KM 25+950",
    "category": "ST. BEKASI",
    "d": "M 1524.3 1317.0 L 1505.1 1293.8",
    "color": "#139a47",
    "isCrossing": true,
    "startDivider": null,
    "endDivider": null
  },
  {
    "id": "wesel_w51a_1547",
    "code": "WESEL 51A (BKS)",
    "title": "CROSSING WESEL 51A - WESEL 71A",
    "km": "KM 25+950",
    "category": "ST. BEKASI",
    "d": "M 1547.1 1343.6 L 1528.7 1321.7",
    "color": "#ff0000",
    "isCrossing": true,
    "startDivider": null,
    "endDivider": null
  },
  {
    "id": "wesel_w51b_1431",
    "code": "WESEL 51B (BKS)",
    "title": "CROSSING WESEL 51B - WESEL 71B",
    "km": "KM 26+050",
    "category": "ST. BEKASI",
    "d": "M 1431.2 1343.8 L 1449.6 1322.3",
    "color": "#ff0000",
    "isCrossing": true,
    "startDivider": null,
    "endDivider": null
  },
  {
    "id": "wesel_w51c_1322",
    "code": "WESEL 51C (BKS)",
    "title": "CROSSING WESEL 51C - WESEL 31B",
    "km": "KM 26+180",
    "category": "ST. BEKASI",
    "d": "M 1322.7 1369.4 L 1341.8 1343.4",
    "color": "#ec1f24",
    "isCrossing": true,
    "startDivider": null,
    "endDivider": null
  },
  {
    "id": "wesel_w31b_1296",
    "code": "WESEL 31B (BKS)",
    "title": "CROSSING WESEL 31B - WESEL 51C",
    "km": "KM 26+150",
    "category": "ST. BEKASI",
    "d": "M 1296.8 1404.8 L 1319.3 1374.1",
    "color": "#ec1f24",
    "isCrossing": true,
    "startDivider": null,
    "endDivider": null
  },
  {
    "id": "wesel_w13d_bkt_307",
    "code": "WESEL 13D",
    "title": "CROSSING WESEL 13D - WESEL 23C",
    "km": "KM 27+050",
    "category": "BKS-BKT",
    "d": "M 307 1480.7 L 288.8 1458.6",
    "color": "#139a47",
    "isCrossing": true,
    "startDivider": null,
    "endDivider": null
  },
  {
    "id": "wesel_w23c_bkt_329",
    "code": "WESEL 23C",
    "title": "CROSSING WESEL 23C - WESEL 13D",
    "km": "KM 27+100",
    "category": "BKS-BKT",
    "d": "M 329.7 1508.3 L 310.5 1484.8",
    "color": "#ec1f24",
    "isCrossing": true,
    "startDivider": null,
    "endDivider": null
  },
  {
    "id": "wesel_w13c_bkt_432",
    "code": "WESEL 13B2 - WESEL 23B",
    "title": "CROSSING WESEL 13B2 - WESEL 23B",
    "km": "KM 26+950",
    "category": "BKS-BKT",
    "d": "M 432.4 1458.6 L 391.7 1508.3",
    "color": "#ec1f24",
    "isCrossing": true,
    "startDivider": null,
    "endDivider": null
  },
  {
    "id": "overlap_aj_10000_hi",
    "code": "AJ KM 10+000 HI",
    "title": "OVERLAP AIR JOINT (AJ) KM 10+000 (HILIR)",
    "km": "KM 10+000",
    "category": "OVERLAP (AS/AJ)",
    "d": "M 206.1 518.1 L 218.7 537.9 M 218.7 518.1 L 206.1 537.9",
    "hitD": "M 206.1 518.1 L 218.7 537.9 M 218.7 518.1 L 206.1 537.9",
    "color": "#ff7fdf",
    "isCrossing": true,
    "startDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ) KM 10+000",
      "km": "KM 10+000"
    },
    "endDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ) KM 10+000",
      "km": "KM 10+000"
    }
  },
  {
    "id": "overlap_aj_10000_hu",
    "code": "AJ KM 10+000 HU",
    "title": "OVERLAP AIR JOINT (AJ) KM 10+000 (HULU)",
    "km": "KM 10+000",
    "category": "OVERLAP (AS/AJ)",
    "d": "M 206.1 565.9 L 218.7 585.7 M 218.7 565.9 L 206.1 585.7",
    "hitD": "M 206.1 565.9 L 218.7 585.7 M 218.7 565.9 L 206.1 585.7",
    "color": "#ff0000",
    "isCrossing": true,
    "startDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ) KM 10+000",
      "km": "KM 10+000"
    },
    "endDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ) KM 10+000",
      "km": "KM 10+000"
    }
  },
  {
    "id": "overlap_as_11200_j7",
    "code": "AS KM 11+200 J7",
    "title": "OVERLAP AIR SECTION (AS) KM 11+200 (JALUR 7)",
    "km": "KM 11+200",
    "category": "OVERLAP (AS/AJ)",
    "d": "M 589.5 526.8 L 596.5 537.8 M 596.5 518.2 L 603.5 529.2",
    "hitD": "M 589.5 526.8 L 596.5 537.8 M 596.5 518.2 L 603.5 529.2",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS) KM 11+200",
      "km": "KM 11+200"
    },
    "endDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS) KM 11+200",
      "km": "KM 11+200"
    }
  },
  {
    "id": "overlap_as_11200_j6",
    "code": "AS KM 11+200 J6",
    "title": "OVERLAP AIR SECTION (AS) KM 11+200 (JALUR 6)",
    "km": "KM 11+200",
    "category": "OVERLAP (AS/AJ)",
    "d": "M 584.5 574.6 L 591.5 585.6 M 591.5 566.0 L 598.5 577.0",
    "hitD": "M 584.5 574.6 L 591.5 585.6 M 591.5 566.0 L 598.5 577.0",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS) KM 11+200",
      "km": "KM 11+200"
    },
    "endDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS) KM 11+200",
      "km": "KM 11+200"
    }
  },
  {
    "id": "overlap_as_1880_hi",
    "code": "AS KM 1+880 HI",
    "title": "OVERLAP AIR SECTION (AS) KM 1+880 (HILIR)",
    "km": "KM 1+880",
    "category": "OVERLAP (AS/AJ)",
    "d": "M 473.6 812.5 L 480.6 823.5 M 480.6 803.9 L 487.6 814.9",
    "hitD": "M 473.6 812.5 L 480.6 823.5 M 480.6 803.9 L 487.6 814.9",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS) KM 1+880",
      "km": "KM 1+880"
    },
    "endDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS) KM 1+880",
      "km": "KM 1+880"
    }
  },
  {
    "id": "overlap_as_1880_hu",
    "code": "AS KM 1+880 HU",
    "title": "OVERLAP AIR SECTION (AS) KM 1+880 (HULU)",
    "km": "KM 1+880",
    "category": "OVERLAP (AS/AJ)",
    "d": "M 473.6 860.4 L 480.6 871.4 M 480.6 851.8 L 487.6 862.8",
    "hitD": "M 473.6 860.4 L 480.6 871.4 M 480.6 851.8 L 487.6 862.8",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS) KM 1+880",
      "km": "KM 1+880"
    },
    "endDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS) KM 1+880",
      "km": "KM 1+880"
    }
  },
  {
    "id": "overlap_as_2000_hi",
    "code": "AS KM 2+000 HI",
    "title": "OVERLAP AIR SECTION (AS) KM 2+000 (HILIR)",
    "km": "KM 2+000",
    "category": "OVERLAP (AS/AJ)",
    "d": "M 727.8 812.5 L 734.8 823.5 M 734.8 803.9 L 741.8 814.9",
    "hitD": "M 727.8 812.5 L 734.8 823.5 M 734.8 803.9 L 741.8 814.9",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS) KM 2+000",
      "km": "KM 2+000"
    },
    "endDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS) KM 2+000",
      "km": "KM 2+000"
    }
  },
  {
    "id": "overlap_as_2000_hu",
    "code": "AS KM 2+000 HU",
    "title": "OVERLAP AIR SECTION (AS) KM 2+000 (HULU)",
    "km": "KM 2+000",
    "category": "OVERLAP (AS/AJ)",
    "d": "M 727.8 860.1 L 734.8 871.1 M 734.8 851.5 L 741.8 862.5",
    "hitD": "M 727.8 860.1 L 734.8 871.1 M 734.8 851.5 L 741.8 862.5",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS) KM 2+000",
      "km": "KM 2+000"
    },
    "endDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS) KM 2+000",
      "km": "KM 2+000"
    }
  },
  {
    "id": "overlap_as_11900_hi",
    "code": "AS KM 11+900 HI",
    "title": "OVERLAP AIR SECTION (AS) KM 11+900 (HILIR)",
    "km": "KM 11+900",
    "category": "OVERLAP (AS/AJ)",
    "d": "M 1474.7 812.5 L 1481.7 823.5 M 1481.7 803.9 L 1488.7 814.9",
    "hitD": "M 1474.7 812.5 L 1481.7 823.5 M 1481.7 803.9 L 1488.7 814.9",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS) KM 11+900",
      "km": "KM 11+900"
    },
    "endDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS) KM 11+900",
      "km": "KM 11+900"
    }
  },
  {
    "id": "overlap_as_11900_hu",
    "code": "AS KM 11+900 HU",
    "title": "OVERLAP AIR SECTION (AS) KM 11+900 (HULU)",
    "km": "KM 11+900",
    "category": "OVERLAP (AS/AJ)",
    "d": "M 1474.8 860.0 L 1481.8 871.0 M 1481.8 851.4 L 1488.8 862.4",
    "hitD": "M 1474.8 860.0 L 1481.8 871.0 M 1481.8 851.4 L 1488.8 862.4",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS) KM 11+900",
      "km": "KM 11+900"
    },
    "endDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS) KM 11+900",
      "km": "KM 11+900"
    }
  },
  {
    "id": "overlap_as_11900_j3",
    "code": "AS KM 11+900 J3",
    "title": "OVERLAP AIR SECTION (AS) KM 11+900 (JALUR 3)",
    "km": "KM 11+900",
    "category": "OVERLAP (AS/AJ)",
    "d": "M 1474.7 762.8 L 1481.7 773.8 M 1481.7 754.2 L 1488.7 765.2",
    "hitD": "M 1474.7 762.8 L 1481.7 773.8 M 1481.7 754.2 L 1488.7 765.2",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS) KM 11+900 (JALUR 3)",
      "km": "KM 11+900"
    },
    "endDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS) KM 11+900 (JALUR 3)",
      "km": "KM 11+900"
    }
  },
  {
    "id": "overlap_as_12500_hi",
    "code": "AS KM 12+500 HI",
    "title": "OVERLAP AIR SECTION (AS) KM 12+500 (HILIR)",
    "km": "KM 12+500",
    "category": "OVERLAP (AS/AJ)",
    "d": "M 1941.6 812.4 L 1948.6 823.4 M 1948.6 803.8 L 1955.6 814.8",
    "hitD": "M 1941.6 812.4 L 1948.6 823.4 M 1948.6 803.8 L 1955.6 814.8",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS) KM 12+500",
      "km": "KM 12+500"
    },
    "endDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS) KM 12+500",
      "km": "KM 12+500"
    }
  },
  {
    "id": "overlap_as_12500_hu",
    "code": "AS KM 12+500 HU",
    "title": "OVERLAP AIR SECTION (AS) KM 12+500 (HULU)",
    "km": "KM 12+500",
    "category": "OVERLAP (AS/AJ)",
    "d": "M 1941.6 860.7 L 1948.6 871.7 M 1948.6 852.1 L 1955.6 863.1",
    "hitD": "M 1941.6 860.7 L 1948.6 871.7 M 1948.6 852.1 L 1955.6 863.1",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS) KM 12+500",
      "km": "KM 12+500"
    },
    "endDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS) KM 12+500",
      "km": "KM 12+500"
    }
  },
  {
    "id": "overlap_aj_13300_hi",
    "code": "AJ KM 13+300 HI",
    "title": "OVERLAP AIR JOINT (AJ) KM 13+300 (HILIR)",
    "km": "KM 13+300",
    "category": "OVERLAP (AS/AJ)",
    "d": "M 2078.8 803.8 L 2091.4 823.6 M 2091.4 803.8 L 2078.8 823.6",
    "hitD": "M 2078.8 803.8 L 2091.4 823.6 M 2091.4 803.8 L 2078.8 823.6",
    "color": "#0000ff",
    "isCrossing": true,
    "startDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ) KM 13+300",
      "km": "KM 13+300"
    },
    "endDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ) KM 13+300",
      "km": "KM 13+300"
    }
  },
  {
    "id": "overlap_aj_13300_hu",
    "code": "AJ KM 13+300 HU",
    "title": "OVERLAP AIR JOINT (AJ) KM 13+300 (HULU)",
    "km": "KM 13+300",
    "category": "OVERLAP (AS/AJ)",
    "d": "M 2077.2 851.7 L 2089.8 871.5 M 2089.8 851.7 L 2077.2 871.5",
    "hitD": "M 2077.2 851.7 L 2089.8 871.5 M 2089.8 851.7 L 2077.2 871.5",
    "color": "#ff9f7f",
    "isCrossing": true,
    "startDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ) KM 13+300",
      "km": "KM 13+300"
    },
    "endDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ) KM 13+300",
      "km": "KM 13+300"
    }
  },
  {
    "id": "overlap_aj_14100_hi",
    "code": "AJ KM 14+100 HI",
    "title": "OVERLAP AIR JOINT (AJ) KM 14+100 (HILIR)",
    "km": "KM 14+100",
    "category": "OVERLAP (AS/AJ)",
    "d": "M 2159.1 803.4 L 2171.7 823.2 M 2171.7 803.4 L 2159.1 823.2",
    "hitD": "M 2159.1 803.4 L 2171.7 823.2 M 2171.7 803.4 L 2159.1 823.2",
    "color": "#0000ff",
    "isCrossing": true,
    "startDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ) KM 14+100",
      "km": "KM 14+100"
    },
    "endDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ) KM 14+100",
      "km": "KM 14+100"
    }
  },
  {
    "id": "overlap_aj_14100_hu",
    "code": "AJ KM 14+100 HU",
    "title": "OVERLAP AIR JOINT (AJ) KM 14+100 (HULU)",
    "km": "KM 14+100",
    "category": "OVERLAP (AS/AJ)",
    "d": "M 2157.1 850.4 L 2169.7 870.2 M 2169.7 850.4 L 2157.1 870.2",
    "hitD": "M 2157.1 850.4 L 2169.7 870.2 M 2169.7 850.4 L 2157.1 870.2",
    "color": "#ff9f7f",
    "isCrossing": true,
    "startDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ) KM 14+100",
      "km": "KM 14+100"
    },
    "endDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ) KM 14+100",
      "km": "KM 14+100"
    }
  },
  {
    "id": "overlap_aj_14700_hi",
    "code": "AJ KM 14+700 HI",
    "title": "OVERLAP AIR JOINT (AJ) KM 14+700 (HILIR)",
    "km": "KM 14+700",
    "category": "OVERLAP (AS/AJ)",
    "d": "M 2245.5 803.3 L 2258.1 823.1 M 2258.1 803.3 L 2245.5 823.1",
    "hitD": "M 2245.5 803.3 L 2258.1 823.1 M 2258.1 803.3 L 2245.5 823.1",
    "color": "#0000ff",
    "isCrossing": true,
    "startDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ) KM 14+700",
      "km": "KM 14+700"
    },
    "endDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ) KM 14+700",
      "km": "KM 14+700"
    }
  },
  {
    "id": "overlap_aj_14700_hu",
    "code": "AJ KM 14+700 HU",
    "title": "OVERLAP AIR JOINT (AJ) KM 14+700 (HULU)",
    "km": "KM 14+700",
    "category": "OVERLAP (AS/AJ)",
    "d": "M 2243.9 851.0 L 2256.5 870.8 M 2256.5 851.0 L 2243.9 870.8",
    "hitD": "M 2243.9 851.0 L 2256.5 870.8 M 2256.5 851.0 L 2243.9 870.8",
    "color": "#ff9f7f",
    "isCrossing": true,
    "startDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ) KM 14+700",
      "km": "KM 14+700"
    },
    "endDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ) KM 14+700",
      "km": "KM 14+700"
    }
  },
  {
    "id": "overlap_as_15450_hi",
    "code": "AS KM 15+450 HI",
    "title": "OVERLAP AIR SECTION (AS) KM 15+450 (HILIR)",
    "km": "KM 15+450",
    "category": "OVERLAP (AS/AJ)",
    "d": "M 2511.5 812.5 L 2518.5 823.5 M 2518.5 803.9 L 2525.5 814.9",
    "hitD": "M 2511.5 812.5 L 2518.5 823.5 M 2518.5 803.9 L 2525.5 814.9",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS) KM 15+450",
      "km": "KM 15+450"
    },
    "endDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS) KM 15+450",
      "km": "KM 15+450"
    }
  },
  {
    "id": "overlap_as_15450_hu",
    "code": "AS KM 15+450 HU",
    "title": "OVERLAP AIR SECTION (AS) KM 15+450 (HULU)",
    "km": "KM 15+450",
    "category": "OVERLAP (AS/AJ)",
    "d": "M 2510.7 860.5 L 2517.7 871.5 M 2517.7 851.9 L 2524.7 862.9",
    "hitD": "M 2510.7 860.5 L 2517.7 871.5 M 2517.7 851.9 L 2524.7 862.9",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS) KM 15+450",
      "km": "KM 15+450"
    },
    "endDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS) KM 15+450",
      "km": "KM 15+450"
    }
  },
  {
    "id": "overlap_aj_16500_hi",
    "code": "AJ KM 16+500 HI",
    "title": "OVERLAP AIR JOINT (AJ) KM 16+500 (HILIR)",
    "km": "KM 16+500",
    "category": "OVERLAP (AS/AJ)",
    "d": "M 2631 804.2 L 2643.6 824.0 M 2643.6 804.2 L 2631 824.0",
    "hitD": "M 2631 804.2 L 2643.6 824.0 M 2643.6 804.2 L 2631 824.0",
    "color": "#ff00ff",
    "isCrossing": true,
    "startDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ) KM 16+500",
      "km": "KM 16+500"
    },
    "endDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ) KM 16+500",
      "km": "KM 16+500"
    }
  },
  {
    "id": "overlap_aj_16500_hu",
    "code": "AJ KM 16+500 HU",
    "title": "OVERLAP AIR JOINT (AJ) KM 16+500 (HULU)",
    "km": "KM 16+500",
    "category": "OVERLAP (AS/AJ)",
    "d": "M 2629.5 851.9 L 2642.1 871.7 M 2642.1 851.9 L 2629.5 871.7",
    "hitD": "M 2629.5 851.9 L 2642.1 871.7 M 2642.1 851.9 L 2629.5 871.7",
    "color": "#00ff00",
    "isCrossing": true,
    "startDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ) KM 16+500",
      "km": "KM 16+500"
    },
    "endDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ) KM 16+500",
      "km": "KM 16+500"
    }
  },
  {
    "id": "overlap_as_17239_hi",
    "code": "AS KM 17+239 HI",
    "title": "OVERLAP AIR SECTION (AS) KM 17+239 (HILIR)",
    "km": "KM 17+239",
    "category": "OVERLAP (AS/AJ)",
    "d": "M 2736.3 812.3 L 2743.3 823.3 M 2743.3 803.7 L 2750.3 814.7",
    "hitD": "M 2736.3 812.3 L 2743.3 823.3 M 2743.3 803.7 L 2750.3 814.7",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS) KM 17+239",
      "km": "KM 17+239"
    },
    "endDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS) KM 17+239",
      "km": "KM 17+239"
    }
  },
  {
    "id": "overlap_as_17239_hu",
    "code": "AS KM 17+239 HU",
    "title": "OVERLAP AIR SECTION (AS) KM 17+239 (HULU)",
    "km": "KM 17+239",
    "category": "OVERLAP (AS/AJ)",
    "d": "M 2736.3 860.0 L 2743.3 871.0 M 2743.3 851.4 L 2750.3 862.4",
    "hitD": "M 2736.3 860.0 L 2743.3 871.0 M 2743.3 851.4 L 2750.3 862.4",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS) KM 17+239",
      "km": "KM 17+239"
    },
    "endDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS) KM 17+239",
      "km": "KM 17+239"
    }
  },
  {
    "id": "overlap_as_17900_hi",
    "code": "AS KM 17+900 HI",
    "title": "OVERLAP AIR SECTION (AS) KM 17+900 (HILIR)",
    "km": "KM 17+900",
    "category": "OVERLAP (AS/AJ)",
    "d": "M 2980.3 812.4 L 2987.3 823.4 M 2987.3 803.8 L 2994.3 814.8",
    "hitD": "M 2980.3 812.4 L 2987.3 823.4 M 2987.3 803.8 L 2994.3 814.8",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS) KM 17+900",
      "km": "KM 17+900"
    },
    "endDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS) KM 17+900",
      "km": "KM 17+900"
    }
  },
  {
    "id": "overlap_as_17900_hu",
    "code": "AS KM 17+900 HU",
    "title": "OVERLAP AIR SECTION (AS) KM 17+900 (HULU)",
    "km": "KM 17+900",
    "category": "OVERLAP (AS/AJ)",
    "d": "M 2979.4 860.1 L 2986.4 871.1 M 2986.4 851.5 L 2993.4 862.5",
    "hitD": "M 2979.4 860.1 L 2986.4 871.1 M 2986.4 851.5 L 2993.4 862.5",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS) KM 17+900",
      "km": "KM 17+900"
    },
    "endDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS) KM 17+900",
      "km": "KM 17+900"
    }
  },
  {
    "id": "overlap_aj_18800_hi",
    "code": "AJ KM 18+800 HI",
    "title": "OVERLAP AIR JOINT (AJ) KM 18+800 (HILIR)",
    "km": "KM 18+800",
    "category": "OVERLAP (AS/AJ)",
    "d": "M 3090.5 803.3 L 3103.1 823.1 M 3103.1 803.3 L 3090.5 823.1",
    "hitD": "M 3090.5 803.3 L 3103.1 823.1 M 3103.1 803.3 L 3090.5 823.1",
    "color": "#f8d731",
    "isCrossing": true,
    "startDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ) KM 18+800",
      "km": "KM 18+800"
    },
    "endDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ) KM 18+800",
      "km": "KM 18+800"
    }
  },
  {
    "id": "overlap_aj_18800_hu",
    "code": "AJ KM 18+800 HU",
    "title": "OVERLAP AIR JOINT (AJ) KM 18+800 (HULU)",
    "km": "KM 18+800",
    "category": "OVERLAP (AS/AJ)",
    "d": "M 3090.5 851.1 L 3103.1 870.9 M 3103.1 851.1 L 3090.5 870.9",
    "hitD": "M 3090.5 851.1 L 3103.1 870.9 M 3103.1 851.1 L 3090.5 870.9",
    "color": "#ff0000",
    "isCrossing": true,
    "startDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ) KM 18+800",
      "km": "KM 18+800"
    },
    "endDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ) KM 18+800",
      "km": "KM 18+800"
    }
  },
  {
    "id": "overlap_aj_19300_hi",
    "code": "AJ KM 19+300 HI",
    "title": "OVERLAP AIR JOINT (AJ) KM 19+300 (HILIR)",
    "km": "KM 19+300",
    "category": "OVERLAP (AS/AJ)",
    "d": "M 3035.6 1334.2 L 3048.2 1354.0 M 3048.2 1334.2 L 3035.6 1354.0",
    "hitD": "M 3035.6 1334.2 L 3048.2 1354.0 M 3048.2 1334.2 L 3035.6 1354.0",
    "color": "#f8d731",
    "isCrossing": true,
    "startDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ) KM 19+300",
      "km": "KM 19+300"
    },
    "endDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ) KM 19+300",
      "km": "KM 19+300"
    }
  },
  {
    "id": "overlap_aj_19300_hu",
    "code": "AJ KM 19+300 HU",
    "title": "OVERLAP AIR JOINT (AJ) KM 19+300 (HULU)",
    "km": "KM 19+300",
    "category": "OVERLAP (AS/AJ)",
    "d": "M 3035.6 1286.5 L 3048.2 1306.3 M 3048.2 1286.5 L 3035.6 1306.3",
    "hitD": "M 3035.6 1286.5 L 3048.2 1306.3 M 3048.2 1286.5 L 3035.6 1306.3",
    "color": "#ff0000",
    "isCrossing": true,
    "startDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ) KM 19+300",
      "km": "KM 19+300"
    },
    "endDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ) KM 19+300",
      "km": "KM 19+300"
    }
  },
  {
    "id": "overlap_as_20150_hi",
    "code": "AS KM 20+150 HI",
    "title": "OVERLAP AIR SECTION (AS) KM 20+150 (HILIR)",
    "km": "KM 20+150",
    "category": "OVERLAP (AS/AJ)",
    "d": "M 2807 1343.4 L 2814 1354.4 M 2814 1334.8 L 2821 1345.8",
    "hitD": "M 2807 1343.4 L 2814 1354.4 M 2814 1334.8 L 2821 1345.8",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS) KM 20+150",
      "km": "KM 20+150"
    },
    "endDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS) KM 20+150",
      "km": "KM 20+150"
    }
  },
  {
    "id": "overlap_as_20150_hu",
    "code": "AS KM 20+150 HU",
    "title": "OVERLAP AIR SECTION (AS) KM 20+150 (HULU)",
    "km": "KM 20+150",
    "category": "OVERLAP (AS/AJ)",
    "d": "M 2807 1293.4 L 2814 1304.4 M 2814 1284.8 L 2821 1295.8",
    "hitD": "M 2807 1293.4 L 2814 1304.4 M 2814 1284.8 L 2821 1295.8",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS) KM 20+150",
      "km": "KM 20+150"
    },
    "endDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS) KM 20+150",
      "km": "KM 20+150"
    }
  },
  {
    "id": "overlap_as_21400_hi",
    "code": "AS KM 21+400 HI",
    "title": "OVERLAP AIR SECTION (AS) KM 21+400 (HILIR)",
    "km": "KM 21+400",
    "category": "OVERLAP (AS/AJ)",
    "d": "M 2330 1343.4 L 2337 1354.4 M 2337 1334.8 L 2344 1345.8",
    "hitD": "M 2330 1343.4 L 2337 1354.4 M 2337 1334.8 L 2344 1345.8",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS) KM 21+400",
      "km": "KM 21+400"
    },
    "endDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS) KM 21+400",
      "km": "KM 21+400"
    }
  },
  {
    "id": "overlap_as_21400_hu",
    "code": "AS KM 21+400 HU",
    "title": "OVERLAP AIR SECTION (AS) KM 21+400 (HULU)",
    "km": "KM 21+400",
    "category": "OVERLAP (AS/AJ)",
    "d": "M 2330 1293.4 L 2337 1304.4 M 2337 1284.8 L 2344 1295.8",
    "hitD": "M 2330 1293.4 L 2337 1304.4 M 2337 1284.8 L 2344 1295.8",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS) KM 21+400",
      "km": "KM 21+400"
    },
    "endDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS) KM 21+400",
      "km": "KM 21+400"
    }
  },
  {
    "id": "overlap_aj_22700_hi",
    "code": "AJ KM 22+700 HI",
    "title": "OVERLAP AIR JOINT (AJ) KM 22+700 (HILIR)",
    "km": "KM 22+700",
    "category": "OVERLAP (AS/AJ)",
    "d": "M 2208.2 1334.1 L 2220.8 1353.9 M 2220.8 1334.1 L 2208.2 1353.9",
    "hitD": "M 2208.2 1334.1 L 2220.8 1353.9 M 2220.8 1334.1 L 2208.2 1353.9",
    "color": "#cc6827",
    "isCrossing": true,
    "startDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ) KM 22+700",
      "km": "KM 22+700"
    },
    "endDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ) KM 22+700",
      "km": "KM 22+700"
    }
  },
  {
    "id": "overlap_aj_22700_hu",
    "code": "AJ KM 22+700 HU",
    "title": "OVERLAP AIR JOINT (AJ) KM 22+700 (HULU)",
    "km": "KM 22+700",
    "category": "OVERLAP (AS/AJ)",
    "d": "M 2205.9 1284.1 L 2218.5 1303.9 M 2218.5 1284.1 L 2205.9 1303.9",
    "hitD": "M 2205.9 1284.1 L 2218.5 1303.9 M 2218.5 1284.1 L 2205.9 1303.9",
    "color": "#8a6ddd",
    "isCrossing": true,
    "startDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ) KM 22+700",
      "km": "KM 22+700"
    },
    "endDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ) KM 22+700",
      "km": "KM 22+700"
    }
  },
  {
    "id": "overlap_as_23750_hi",
    "code": "AS KM 23+750 HI",
    "title": "OVERLAP AIR SECTION (AS) KM 23+750 (HILIR)",
    "km": "KM 23+750",
    "category": "OVERLAP (AS/AJ)",
    "d": "M 2052.1 1342.5 L 2059.1 1353.5 M 2059.1 1333.9 L 2066.1 1344.9",
    "hitD": "M 2052.1 1342.5 L 2059.1 1353.5 M 2059.1 1333.9 L 2066.1 1344.9",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS) KM 23+750",
      "km": "KM 23+750"
    },
    "endDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS) KM 23+750",
      "km": "KM 23+750"
    }
  },
  {
    "id": "overlap_as_23750_hu",
    "code": "AS KM 23+750 HU",
    "title": "OVERLAP AIR SECTION (AS) KM 23+750 (HULU)",
    "km": "KM 23+750",
    "category": "OVERLAP (AS/AJ)",
    "d": "M 2060 1293.1 L 2067 1304.1 M 2067 1284.5 L 2074 1295.5",
    "hitD": "M 2060 1293.1 L 2067 1304.1 M 2067 1284.5 L 2074 1295.5",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS) KM 23+750",
      "km": "KM 23+750"
    },
    "endDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS) KM 23+750",
      "km": "KM 23+750"
    }
  },
  {
    "id": "overlap_aj_24400_hu",
    "code": "AJ KM 24+400 HU",
    "title": "OVERLAP AIR JOINT (AJ) KM 24+400 (HULU)",
    "km": "KM 24+400",
    "category": "OVERLAP (AS/AJ)",
    "d": "M 1810.3 1285.1 L 1822.9 1304.9 M 1822.9 1285.1 L 1810.3 1304.9",
    "hitD": "M 1810.3 1285.1 L 1822.9 1304.9 M 1822.9 1285.1 L 1810.3 1304.9",
    "color": "#ff00ff",
    "isCrossing": true,
    "startDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ) KM 24+400",
      "km": "KM 24+400"
    },
    "endDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ) KM 24+400",
      "km": "KM 24+400"
    }
  },
  {
    "id": "overlap_aj_25000_hu",
    "code": "AJ KM 25+000 HU",
    "title": "OVERLAP AIR JOINT (AJ) KM 25+000 (HULU)",
    "km": "KM 25+000",
    "category": "OVERLAP (AS/AJ)",
    "d": "M 1739.7 1284.6 L 1752.3 1304.4 M 1752.3 1284.6 L 1739.7 1304.4",
    "hitD": "M 1739.7 1284.6 L 1752.3 1304.4 M 1752.3 1284.6 L 1739.7 1304.4",
    "color": "#ff00ff",
    "isCrossing": true,
    "startDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ) KM 25+000",
      "km": "KM 25+000"
    },
    "endDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ) KM 25+000",
      "km": "KM 25+000"
    }
  },
  {
    "id": "overlap_aj_25000_hi",
    "code": "AJ KM 25+000 HI",
    "title": "OVERLAP AIR JOINT (AJ) KM 25+000 (HILIR)",
    "km": "KM 25+000",
    "category": "OVERLAP (AS/AJ)",
    "d": "M 1739.7 1334.5 L 1752.3 1354.3 M 1752.3 1334.5 L 1739.7 1354.3",
    "hitD": "M 1739.7 1334.5 L 1752.3 1354.3 M 1752.3 1334.5 L 1739.7 1354.3",
    "color": "#00bfff",
    "isCrossing": true,
    "startDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ) KM 25+000",
      "km": "KM 25+000"
    },
    "endDivider": {
      "type": "AJ",
      "label": "OVERLAP AIR JOINT (AJ) KM 25+000",
      "km": "KM 25+000"
    }
  },
  {
    "id": "overlap_as_25750_hi",
    "code": "AS KM 25+750 HI",
    "title": "OVERLAP AIR SECTION (AS) KM 25+750 (HILIR)",
    "km": "KM 25+750",
    "category": "OVERLAP (AS/AJ)",
    "d": "M 1625.7 1343.4 L 1632.7 1354.4 M 1632.7 1334.8 L 1639.7 1345.8",
    "hitD": "M 1625.7 1343.4 L 1632.7 1354.4 M 1632.7 1334.8 L 1639.7 1345.8",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS) KM 25+750",
      "km": "KM 25+750"
    },
    "endDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS) KM 25+750",
      "km": "KM 25+750"
    }
  },
  {
    "id": "overlap_as_25750_hu",
    "code": "AS KM 25+750 HU",
    "title": "OVERLAP AIR SECTION (AS) KM 25+750 (HULU)",
    "km": "KM 25+750",
    "category": "OVERLAP (AS/AJ)",
    "d": "M 1627.2 1293.3 L 1634.2 1304.3 M 1634.2 1284.7 L 1641.2 1295.7",
    "hitD": "M 1627.2 1293.3 L 1634.2 1304.3 M 1634.2 1284.7 L 1641.2 1295.7",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS) KM 25+750",
      "km": "KM 25+750"
    },
    "endDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS) KM 25+750",
      "km": "KM 25+750"
    }
  },
  {
    "id": "overlap_as_26900_hi",
    "code": "AS KM 26+900 HI",
    "title": "OVERLAP AIR SECTION (AS) KM 26+900 (HILIR)",
    "km": "KM 26+900",
    "category": "OVERLAP (AS/AJ)",
    "d": "M 589.3 1343.0 L 596.3 1354.0 M 596.3 1334.4 L 603.3 1345.4",
    "hitD": "M 589.3 1343.0 L 596.3 1354.0 M 596.3 1334.4 L 603.3 1345.4",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS) KM 26+900",
      "km": "KM 26+900"
    },
    "endDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS) KM 26+900",
      "km": "KM 26+900"
    }
  },
  {
    "id": "overlap_as_26900_hu",
    "code": "AS KM 26+900 HU",
    "title": "OVERLAP AIR SECTION (AS) KM 26+900 (HULU)",
    "km": "KM 26+900",
    "category": "OVERLAP (AS/AJ)",
    "d": "M 589.3 1293.0 L 596.3 1304.0 M 596.3 1284.4 L 603.3 1295.4",
    "hitD": "M 589.3 1293.0 L 596.3 1304.0 M 596.3 1284.4 L 603.3 1295.4",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS) KM 26+900",
      "km": "KM 26+900"
    },
    "endDivider": {
      "type": "AS",
      "label": "OVERLAP AIR SECTION (AS) KM 26+900",
      "km": "KM 26+900"
    }
  },
  {
    "id": "ds_01",
    "code": "DS 1",
    "title": "DISCONNECTING SWITCH 1 (NO) MRI-JNG (HILIR)",
    "km": "KM 1+903",
    "category": "DISCONNECTING SWITCH (DS)",
    "d": "M 470.9 784.6 A 3 3 0 1 0 476.9 784.6 A 3 3 0 1 0 470.9 784.6 M 476.3 784.6 L 490.1 776.4 M 487 784.6 A 3 3 0 1 0 493 784.6 A 3 3 0 1 0 487 784.6",
    "hitD": "M 473.9 784.6 L 490 784.6",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "DS",
      "label": "DISCONNECTING SWITCH 1 (NO) MRI-JNG (HILIR)",
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
    "title": "DISCONNECTING SWITCH 2 (NO) JNG-MRI (HULU)",
    "km": "KM 1+854",
    "category": "DISCONNECTING SWITCH (DS)",
    "d": "M 471.4 890.6 A 3 3 0 1 0 477.4 890.6 A 3 3 0 1 0 471.4 890.6 M 488.2 890.6 L 474.7 899.0 M 487.5 890.6 A 3 3 0 1 0 493.5 890.6 A 3 3 0 1 0 487.5 890.6",
    "hitD": "M 474.4 890.6 L 490.5 890.6",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "DS",
      "label": "DISCONNECTING SWITCH 2 (NO) JNG-MRI (HULU)",
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
    "title": "DISCONNECTING SWITCH 3 (NC) JALUR 2",
    "km": "KM 2+000",
    "category": "DISCONNECTING SWITCH (DS)",
    "d": "M 724.9 795.6 A 3 3 0 1 0 730.9 795.6 A 3 3 0 1 0 724.9 795.6 M 730.3 795.6 L 744.3 787.4 M 741.2 795.6 A 3 3 0 1 0 747.2 795.6 A 3 3 0 1 0 741.2 795.6",
    "hitD": "M 727.9 795.6 L 744.2 795.6",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "DS",
      "label": "DISCONNECTING SWITCH 3 (NC) JALUR 2",
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
    "title": "DISCONNECTING SWITCH 4 (NC) JALUR 1",
    "km": "KM 2+000",
    "category": "DISCONNECTING SWITCH (DS)",
    "d": "M 725.4 890.6 A 3 3 0 1 0 731.4 890.6 A 3 3 0 1 0 725.4 890.6 M 742.3 890.6 L 728.4 898.0 M 741.6 890.6 A 3 3 0 1 0 747.6 890.6 A 3 3 0 1 0 741.6 890.6",
    "hitD": "M 728.4 890.6 L 744.6 890.6",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "DS",
      "label": "DISCONNECTING SWITCH 4 (NC) JALUR 1",
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
    "title": "DISCONNECTING SWITCH 5 (NC) JALUR 2,3",
    "km": "KM 11+900",
    "category": "DISCONNECTING SWITCH (DS)",
    "d": "M 1472.8 750.1 A 3 3 0 1 0 1478.8 750.1 A 3 3 0 1 0 1472.8 750.1 M 1478.3 750.1 L 1492.1 741.7 M 1489.1 750.1 A 3 3 0 1 0 1495.1 750.1 A 3 3 0 1 0 1489.1 750.1",
    "hitD": "M 1475.8 750.1 L 1492.1 750.1",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "DS",
      "label": "DISCONNECTING SWITCH 5 (NC) JALUR 2,3",
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
    "title": "DISCONNECTING SWITCH 6 (NC) JALUR 1",
    "km": "KM 11+900",
    "category": "DISCONNECTING SWITCH (DS)",
    "d": "M 1472.6 889.8 A 3 3 0 1 0 1478.6 889.8 A 3 3 0 1 0 1472.6 889.8 M 1489.5 889.9 L 1475.7 898.6 M 1488.8 889.8 A 3 3 0 1 0 1494.8 889.8 A 3 3 0 1 0 1488.8 889.8",
    "hitD": "M 1475.6 889.8 L 1491.8 889.8",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "DS",
      "label": "DISCONNECTING SWITCH 6 (NC) JALUR 1",
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
    "title": "DISCONNECTING SWITCH 7 (NO) KLD-JNG (HILIR)",
    "km": "KM 12+535",
    "category": "DISCONNECTING SWITCH (DS)",
    "d": "M 1938.2 784.6 A 3 3 0 1 0 1944.2 784.6 A 3 3 0 1 0 1938.2 784.6 M 1943.6 784.6 L 1957.5 776.4 M 1954.4 784.6 A 3 3 0 1 0 1960.4 784.6 A 3 3 0 1 0 1954.4 784.6",
    "hitD": "M 1941.2 784.6 L 1957.4 784.6",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "DS",
      "label": "DISCONNECTING SWITCH 7 (NO) KLD-JNG (HILIR)",
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
    "title": "DISCONNECTING SWITCH 8 (NO) JNG-KLD (HULU)",
    "km": "KM 12+483",
    "category": "DISCONNECTING SWITCH (DS)",
    "d": "M 1938.7 891.0 A 3 3 0 1 0 1944.7 891.0 A 3 3 0 1 0 1938.7 891.0 M 1955.7 891.0 L 1941.8 899.6 M 1955.1 891.0 A 3 3 0 1 0 1961.1 891.0 A 3 3 0 1 0 1955.1 891.0",
    "hitD": "M 1941.7 891.0 L 1958.1 891.0",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "DS",
      "label": "DISCONNECTING SWITCH 8 (NO) JNG-KLD (HULU)",
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
    "title": "DISCONNECTING SWITCH 9 (NC) KLDB-BUA (HILIR)",
    "km": "KM 17+900",
    "category": "DISCONNECTING SWITCH (DS)",
    "d": "M 2977.2 783.0 A 3 3 0 1 0 2983.2 783.0 A 3 3 0 1 0 2977.2 783.0 M 2982.6 783.0 L 2996.5 776.3 M 2993.4 783.0 A 3 3 0 1 0 2999.4 783.0 A 3 3 0 1 0 2993.4 783.0",
    "hitD": "M 2980.2 783.0 L 2996.4 783.0",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "DS",
      "label": "DISCONNECTING SWITCH 9 (NC) KLDB-BUA (HILIR)",
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
    "title": "DISCONNECTING SWITCH 10 (NC) BUA-KLDB (HULU)",
    "km": "KM 17+900",
    "category": "DISCONNECTING SWITCH (DS)",
    "d": "M 2977.7 889.1 A 3 3 0 1 0 2983.7 889.1 A 3 3 0 1 0 2977.7 889.1 M 2994.6 889.1 L 2980.7 895.9 M 2993.9 889.1 A 3 3 0 1 0 2999.9 889.1 A 3 3 0 1 0 2993.9 889.1",
    "hitD": "M 2980.7 889.1 L 2996.9 889.1",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "DS",
      "label": "DISCONNECTING SWITCH 10 (NC) BUA-KLDB (HULU)",
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
    "title": "DISCONNECTING SWITCH 11 (NO) CUK-KLDB (HILIR)",
    "km": "KM 20+196",
    "category": "DISCONNECTING SWITCH (DS)",
    "d": "M 2807.2 1372.7 A 3 3 0 1 0 2813.2 1372.7 A 3 3 0 1 0 2807.2 1372.7 M 2812.7 1372.8 L 2826.3 1381.2 M 2823.6 1372.7 A 3 3 0 1 0 2829.6 1372.7 A 3 3 0 1 0 2823.6 1372.7",
    "hitD": "M 2810.2 1372.7 L 2826.6 1372.7",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "DS",
      "label": "DISCONNECTING SWITCH 11 (NO) CUK-KLDB (HILIR)",
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
    "title": "DISCONNECTING SWITCH 12 (NO) KLDB-CUK (HULU)",
    "km": "KM 20+137",
    "category": "DISCONNECTING SWITCH (DS)",
    "d": "M 2802.2 1268.0 A 3 3 0 1 0 2808.2 1268.0 A 3 3 0 1 0 2802.2 1268.0 M 2819.2 1268.1 L 2805.3 1260.0 M 2818.4 1268.0 A 3 3 0 1 0 2824.4 1268.0 A 3 3 0 1 0 2818.4 1268.0",
    "hitD": "M 2805.2 1268.0 L 2821.4 1268.0",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "DS",
      "label": "DISCONNECTING SWITCH 12 (NO) KLDB-CUK (HULU)",
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
    "title": "DISCONNECTING SWITCH 13 (NC) KRI-CUK (HILIR)",
    "km": "KM 21+400",
    "category": "DISCONNECTING SWITCH (DS)",
    "d": "M 2324.2 1371.6 A 3 3 0 1 0 2330.2 1371.6 A 3 3 0 1 0 2324.2 1371.6 M 2329.6 1371.7 L 2343.5 1378.4 M 2340.4 1371.6 A 3 3 0 1 0 2346.4 1371.6 A 3 3 0 1 0 2340.4 1371.6",
    "hitD": "M 2327.2 1371.6 L 2343.4 1371.6",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "DS",
      "label": "DISCONNECTING SWITCH 13 (NC) KRI-CUK (HILIR)",
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
    "title": "DISCONNECTING SWITCH 14 (NC) CUK-KRI (HULU)",
    "km": "KM 21+400",
    "category": "DISCONNECTING SWITCH (DS)",
    "d": "M 2324.8 1265.6 A 3 3 0 1 0 2330.8 1265.6 A 3 3 0 1 0 2324.8 1265.6 M 2341.6 1265.6 L 2327.8 1258.9 M 2340.9 1265.6 A 3 3 0 1 0 2346.9 1265.6 A 3 3 0 1 0 2340.9 1265.6",
    "hitD": "M 2327.8 1265.6 L 2343.9 1265.6",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "DS",
      "label": "DISCONNECTING SWITCH 14 (NC) CUK-KRI (HULU)",
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
    "title": "DISCONNECTING SWITCH 15 (NC) EMP BKS (HILIR)",
    "km": "KM 26+226",
    "category": "DISCONNECTING SWITCH (DS)",
    "d": "M 1379.3 1368.1 A 3 3 0 1 0 1385.3 1368.1 A 3 3 0 1 0 1379.3 1368.1 M 1391.9 1369.8 L 1381.5 1375.6 M 1390.8 1368.5 A 3 3 0 1 0 1396.8 1368.5 A 3 3 0 1 0 1390.8 1368.5",
    "hitD": "M 1382.3 1368.1 L 1393.8 1368.5",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "DS",
      "label": "DISCONNECTING SWITCH 15 (NC) EMP BKS (HILIR)",
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
    "title": "DISCONNECTING SWITCH 16 (NC) EMP BKS (HULU)",
    "km": "KM 26+200",
    "category": "DISCONNECTING SWITCH (DS)",
    "d": "M 1379.4 1272.6 A 3 3 0 1 0 1385.4 1272.6 A 3 3 0 1 0 1379.4 1272.6 M 1396.1 1272.7 L 1383.3 1265.6 M 1395.2 1272.6 A 3 3 0 1 0 1401.2 1272.6 A 3 3 0 1 0 1395.2 1272.6",
    "hitD": "M 1382.4 1272.6 L 1398.2 1272.6",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "DS",
      "label": "DISCONNECTING SWITCH 16 (NC) EMP BKS (HULU)",
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
    "title": "DISCONNECTING SWITCH 17 (NC) EMP BKS (4-5)",
    "km": "KM 26+300",
    "category": "DISCONNECTING SWITCH (DS)",
    "d": "M 1250.2 1487.6 A 3 3 0 1 0 1256.2 1487.6 A 3 3 0 1 0 1250.2 1487.6 M 1253.3 1485.3 L 1244.9 1471.5 M 1250.2 1471.5 A 3 3 0 1 0 1256.2 1471.5 A 3 3 0 1 0 1250.2 1471.5",
    "hitD": "M 1253.2 1487.6 L 1253.2 1471.5",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "DS",
      "label": "DISCONNECTING SWITCH 17 (NC) EMP BKS (4-5)",
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
    "title": "DISCONNECTING SWITCH 18 (NC) EMP BKS (6-7-8)",
    "km": "KM 26+300",
    "category": "DISCONNECTING SWITCH (DS)",
    "d": "M 1196.1 1487.7 A 3 3 0 1 0 1202.1 1487.7 A 3 3 0 1 0 1196.1 1487.7 M 1199.1 1485.4 L 1190.9 1471.6 M 1196.1 1471.6 A 3 3 0 1 0 1202.1 1471.6 A 3 3 0 1 0 1196.1 1471.6",
    "hitD": "M 1199.1 1487.7 L 1199.1 1471.6",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "DS",
      "label": "DISCONNECTING SWITCH 18 (NC) EMP BKS (6-7-8)",
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
    "title": "DISCONNECTING SWITCH 19 (NC) BKT-BKS (HILIR)",
    "km": "KM 26+800",
    "category": "DISCONNECTING SWITCH (DS)",
    "d": "M 635.7 1369.0 A 3 3 0 1 0 641.7 1369.0 A 3 3 0 1 0 635.7 1369.0 M 641.2 1369.0 L 653.9 1376.1 M 651.5 1369.0 A 3 3 0 1 0 657.5 1369.0 A 3 3 0 1 0 651.5 1369.0",
    "hitD": "M 638.7 1369.0 L 654.5 1369.0",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "DS",
      "label": "DISCONNECTING SWITCH 19 (NC) BKT-BKS (HILIR)",
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
    "title": "DISCONNECTING SWITCH 20 (NC) BKS-BKT (HULU)",
    "km": "KM 26+800",
    "category": "DISCONNECTING SWITCH (DS)",
    "d": "M 634.8 1273.2 A 3 3 0 1 0 640.8 1273.2 A 3 3 0 1 0 634.8 1273.2 M 651.4 1273.3 L 638.6 1266.1 M 650.7 1273.2 A 3 3 0 1 0 656.7 1273.2 A 3 3 0 1 0 650.7 1273.2",
    "hitD": "M 637.8 1273.2 L 653.7 1273.2",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "DS",
      "label": "DISCONNECTING SWITCH 20 (NC) BKS-BKT (HULU)",
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
    "title": "SECTION INSULATOR (FRP-JNG-01-31A1)",
    "km": "KM 11+350",
    "category": "SECTION INSULATOR (FRP)",
    "d": "M 568.84 835.8 L 574 840.7 M 573.04 831.8 L 578.2 836.7",
    "hitD": "M 568.84 835.8 L 574 840.7 M 573.04 831.8 L 578.2 836.7 M 571.42 838.2 L 575.62 834.3",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "FRP",
      "label": "SECTION INSULATOR (FRP-JNG-01-31A1)",
      "km": "KM 11+350"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "WESEL 31A1 JATINEGARA",
      "km": "KM 11+350"
    }
  },
  {
    "id": "frp_jng_02_11a",
    "code": "FRP-JNG-02-11A",
    "title": "SECTION INSULATOR (FRP-JNG-02-11A)",
    "km": "KM 11+500",
    "category": "SECTION INSULATOR (FRP)",
    "d": "M 652.84 785.2 L 658 790.3 M 657.04 781.3 L 662.2 786.3",
    "hitD": "M 652.84 785.2 L 658 790.3 M 657.04 781.3 L 662.2 786.3 M 655.42 787.8 L 659.62 783.8",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "FRP",
      "label": "SECTION INSULATOR (FRP-JNG-02-11A)",
      "km": "KM 11+500"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "WESEL 11A JATINEGARA",
      "km": "KM 11+500"
    }
  },
  {
    "id": "frp_jng_03_21a2",
    "code": "FRP-JNG-03-21A2",
    "title": "SECTION INSULATOR (FRP-JNG-03-21A2)",
    "km": "KM 11+600",
    "category": "SECTION INSULATOR (FRP)",
    "d": "M 790.48 759.4 L 790.6 766.6 M 796.24 759.6 L 796.36 766.6",
    "hitD": "M 790.48 759.4 L 790.6 766.6 M 796.24 759.6 L 796.36 766.6 M 790.54 763.0 L 796.3 763.1",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "FRP",
      "label": "SECTION INSULATOR (FRP-JNG-03-21A2)",
      "km": "KM 11+600"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "WESEL 21A2 JATINEGARA",
      "km": "KM 11+600"
    }
  },
  {
    "id": "frp_jng_04_31c1",
    "code": "FRP-JNG-04-31C1",
    "title": "SECTION INSULATOR (FRP-JNG-04-31C1)",
    "km": "KM 11+800",
    "category": "SECTION INSULATOR (FRP)",
    "d": "M 976.96 843.9 L 972.28 849.4 M 980.92 847.5 L 976.24 852.9",
    "hitD": "M 976.96 843.9 L 972.28 849.4 M 980.92 847.5 L 976.24 852.9 M 974.62 846.7 L 978.58 850.2",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "FRP",
      "label": "SECTION INSULATOR (FRP-JNG-04-31C1)",
      "km": "KM 11+800"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "WESEL 31C1 JATINEGARA",
      "km": "KM 11+800"
    }
  },
  {
    "id": "frp_jng_05_31c2",
    "code": "FRP-JNG-05-31C2",
    "title": "SECTION INSULATOR (FRP-JNG-05-31C2)",
    "km": "KM 11+800",
    "category": "SECTION INSULATOR (FRP)",
    "d": "M 952.48 849.3 L 947.8 843.9 M 948.4 852.8 L 943.72 847.4",
    "hitD": "M 952.48 849.3 L 947.8 843.9 M 948.4 852.8 L 943.72 847.4 M 950.14 846.6 L 946.06 850.1",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "FRP",
      "label": "SECTION INSULATOR (FRP-JNG-05-31C2)",
      "km": "KM 11+800"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "WESEL 31C2 JATINEGARA",
      "km": "KM 11+800"
    }
  },
  {
    "id": "frp_jng_06_41b",
    "code": "FRP-JNG-06-41B",
    "title": "SECTION INSULATOR (FRP-JNG-06-41B)",
    "km": "KM 11+500",
    "category": "SECTION INSULATOR (FRP)",
    "d": "M 1014.04 644.5 L 1019.2 649.5 M 1018.24 640.5 L 1023.4 645.6",
    "hitD": "M 1014.04 644.5 L 1019.2 649.5 M 1018.24 640.5 L 1023.4 645.6 M 1016.62 647.0 L 1020.82 643.0",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "FRP",
      "label": "SECTION INSULATOR (FRP-JNG-06-41B)",
      "km": "KM 11+500"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "WESEL 41B JATINEGARA",
      "km": "KM 11+500"
    }
  },
  {
    "id": "frp_jng_07_21c1",
    "code": "FRP-JNG-07-21C1",
    "title": "SECTION INSULATOR (FRP-JNG-07-21C1)",
    "km": "KM 11+448",
    "category": "SECTION INSULATOR (FRP)",
    "d": "M 820.84 620.1 L 815.44 624.9 M 824.32 624.3 L 818.92 629.0",
    "hitD": "M 820.84 620.1 L 815.44 624.9 M 824.32 624.3 L 818.92 629.0 M 818.14 622.5 L 821.62 626.7",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "FRP",
      "label": "SECTION INSULATOR (FRP-JNG-07-21C1)",
      "km": "KM 11+448"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "WESEL 21C1 JATINEGARA",
      "km": "KM 11+448"
    }
  },
  {
    "id": "frp_jng_08_81a1",
    "code": "FRP-JNG-08-81A1",
    "title": "SECTION INSULATOR (FRP-JNG-08-81A1)",
    "km": "KM 11+350",
    "category": "SECTION INSULATOR (FRP)",
    "d": "M 670.6 536.0 L 665.8 541.4 M 674.56 539.6 L 669.88 545.0",
    "hitD": "M 670.6 536.0 L 665.8 541.4 M 674.56 539.6 L 669.88 545.0 M 668.2 538.7 L 672.22 542.3",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "FRP",
      "label": "SECTION INSULATOR (FRP-JNG-08-81A1)",
      "km": "KM 11+350"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "WESEL 81A1 JATINEGARA",
      "km": "KM 11+350"
    }
  },
  {
    "id": "frp_jng_09_81a2",
    "code": "FRP-JNG-09-81A2",
    "title": "SECTION INSULATOR (FRP-JNG-09-81A2)",
    "km": "KM 11+350",
    "category": "SECTION INSULATOR (FRP)",
    "d": "M 692.92 539.4 L 697.48 544.9 M 697.12 535.9 L 701.68 541.5",
    "hitD": "M 692.92 539.4 L 697.48 544.9 M 697.12 535.9 L 701.68 541.5 M 695.2 542.1 L 699.4 538.7",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "FRP",
      "label": "SECTION INSULATOR (FRP-JNG-09-81A2)",
      "km": "KM 11+350"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "WESEL 81A2 JATINEGARA",
      "km": "KM 11+350"
    }
  },
  {
    "id": "frp_jng_10_jalur_4",
    "code": "FRP-JNG-10-JALUR 4",
    "title": "SECTION INSULATOR (FRP-JNG-10-JALUR 4)",
    "km": "KM 12+089",
    "category": "SECTION INSULATOR (FRP)",
    "d": "M 1628.32 714.1 L 1628.44 721.2 M 1633.84 714.1 L 1634.08 721.2",
    "hitD": "M 1628.32 714.1 L 1628.44 721.2 M 1633.84 714.1 L 1634.08 721.2 M 1628.38 717.6 L 1633.96 717.6",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "FRP",
      "label": "SECTION INSULATOR (FRP-JNG-10-JALUR 4)",
      "km": "KM 12+089"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "JALUR 4 JATINEGARA",
      "km": "KM 12+089"
    }
  },
  {
    "id": "frp_jng_11_23b2",
    "code": "FRP-JNG-11-23B2",
    "title": "SECTION INSULATOR (FRP-JNG-11-23B2)",
    "km": "KM 12+000",
    "category": "SECTION INSULATOR (FRP)",
    "d": "M 1616.56 734.8 L 1611.16 739.6 M 1620.04 739.0 L 1614.64 743.7",
    "hitD": "M 1616.56 734.8 L 1611.16 739.6 M 1620.04 739.0 L 1614.64 743.7 M 1613.86 737.2 L 1617.34 741.4",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "FRP",
      "label": "SECTION INSULATOR (FRP-JNG-11-23B2)",
      "km": "KM 12+000"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "WESEL 23B2 JATINEGARA",
      "km": "KM 12+000"
    }
  },
  {
    "id": "frp_jng_13_13d1",
    "code": "FRP-JNG-13-13D1",
    "title": "SECTION INSULATOR (FRP-JNG-13-13D1)",
    "km": "KM 12+384",
    "category": "SECTION INSULATOR (FRP)",
    "d": "M 1712.68 735.1 L 1707.28 739.8 M 1716.16 739.2 L 1710.64 744.0",
    "hitD": "M 1712.68 735.1 L 1707.28 739.8 M 1716.16 739.2 L 1710.64 744.0 M 1709.98 737.4 L 1713.4 741.6",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "FRP",
      "label": "SECTION INSULATOR (FRP-JNG-13-13D1)",
      "km": "KM 12+384"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "WESEL 13D1 JATINEGARA",
      "km": "KM 12+384"
    }
  },
  {
    "id": "frp_jng_14_33b2",
    "code": "FRP-JNG-14-33B2",
    "title": "SECTION INSULATOR (FRP-JNG-14-33B2)",
    "km": "KM 12+250",
    "category": "SECTION INSULATOR (FRP)",
    "d": "M 1769.68 830.6 L 1764.16 835.3 M 1773.16 834.7 L 1767.64 839.4",
    "hitD": "M 1769.68 830.6 L 1764.16 835.3 M 1773.16 834.7 L 1767.64 839.4 M 1766.92 832.9 L 1770.4 837.0",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "FRP",
      "label": "SECTION INSULATOR (FRP-JNG-14-33B2)",
      "km": "KM 12+250"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "WESEL 33B2 JATINEGARA",
      "km": "KM 12+250"
    }
  },
  {
    "id": "frp_jng_15_33c1",
    "code": "FRP-JNG-15-33C1",
    "title": "SECTION INSULATOR (FRP-JNG-15-33C1)",
    "km": "KM 12+283",
    "category": "SECTION INSULATOR (FRP)",
    "d": "M 1769.68 782.5 L 1764.16 787.2 M 1773.16 786.6 L 1767.64 791.2",
    "hitD": "M 1769.68 782.5 L 1764.16 787.2 M 1773.16 786.6 L 1767.64 791.2 M 1766.92 784.8 L 1770.4 788.9",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "FRP",
      "label": "SECTION INSULATOR (FRP-JNG-15-33C1)",
      "km": "KM 12+283"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "WESEL 33C1 JATINEGARA",
      "km": "KM 12+283"
    }
  },
  {
    "id": "frp_jng_16_33c2",
    "code": "FRP-JNG-16-33C2",
    "title": "SECTION INSULATOR (FRP-JNG-16-33C2)",
    "km": "KM 12+350",
    "category": "SECTION INSULATOR (FRP)",
    "d": "M 1854.04 830.6 L 1848.64 835.3 M 1857.52 834.7 L 1852 839.4",
    "hitD": "M 1854.04 830.6 L 1848.64 835.3 M 1857.52 834.7 L 1852 839.4 M 1851.34 832.9 L 1854.76 837.0",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "FRP",
      "label": "SECTION INSULATOR (FRP-JNG-16-33C2)",
      "km": "KM 12+350"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "WESEL 33C2 JATINEGARA",
      "km": "KM 12+350"
    }
  },
  {
    "id": "frp_jng_17_11a",
    "code": "FRP-JNG-17-11A",
    "title": "SECTION INSULATOR (FRP-JNG-17-11A)",
    "km": "KM 20+800",
    "category": "SECTION INSULATOR (FRP)",
    "d": "M 2645.8 1322.9 L 2650.84 1317.7 M 2641.72 1318.1 L 2646.76 1312.9",
    "hitD": "M 2645.8 1322.9 L 2650.84 1317.7 M 2641.72 1318.1 L 2646.76 1312.9 M 2648.32 1320.3 L 2644.24 1315.5",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "FRP",
      "label": "SECTION INSULATOR (FRP-JNG-17-11A)",
      "km": "KM 20+740"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "WESEL 11A CAKUNG",
      "km": "KM 20+740"
    }
  },
  {
    "id": "frp_jng_18_23b",
    "code": "FRP-JNG-18-23B",
    "title": "SECTION INSULATOR (FRP-JNG-18-23B)",
    "km": "KM 21+445",
    "category": "SECTION INSULATOR (FRP)",
    "d": "M 2382.28 1318.0 L 2388.28 1321.9 M 2386.12 1313.0 L 2392.12 1317.0",
    "hitD": "M 2382.28 1318.0 L 2388.28 1321.9 M 2386.12 1313.0 L 2392.12 1317.0 M 2385.28 1319.9 L 2389.12 1315.0",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "FRP",
      "label": "SECTION INSULATOR (FRP-JNG-18-23B)",
      "km": "KM 21+445"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "WESEL 23B CAKUNG",
      "km": "KM 21+445"
    }
  },
  {
    "id": "frp_jng_19_51a",
    "code": "FRP-JNG-19-51A",
    "title": "SECTION INSULATOR (FRP-JNG-19-51A)",
    "km": "KM 25+950",
    "category": "SECTION INSULATOR (FRP)",
    "d": "M 1524.76 1323.7 L 1530.28 1319.0 M 1521.28 1319.6 L 1526.8 1315.0",
    "hitD": "M 1524.76 1323.7 L 1530.28 1319.0 M 1521.28 1319.6 L 1526.8 1315.0 M 1527.52 1321.4 L 1524.04 1317.3",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "FRP",
      "label": "SECTION INSULATOR (FRP-JNG-19-51A)",
      "km": "KM 25+950"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "WESEL 51A BEKASI",
      "km": "KM 25+950"
    }
  },
  {
    "id": "frp_jng_20_51b",
    "code": "FRP-JNG-20-51B",
    "title": "SECTION INSULATOR (FRP-JNG-20-51B)",
    "km": "KM 26+050",
    "category": "SECTION INSULATOR (FRP)",
    "d": "M 1456.72 1321.2 L 1451.56 1316.2 M 1452.52 1325.2 L 1447.36 1320.1",
    "hitD": "M 1456.72 1321.2 L 1451.56 1316.2 M 1452.52 1325.2 L 1447.36 1320.1 M 1454.14 1318.7 L 1449.94 1322.6",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "FRP",
      "label": "SECTION INSULATOR (FRP-JNG-20-51B)",
      "km": "KM 26+050"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "WESEL 51B BEKASI",
      "km": "KM 26+050"
    }
  },
  {
    "id": "frp_jng_21_jalur_5",
    "code": "FRP-JNG-21-JALUR 5",
    "title": "SECTION INSULATOR (FRP-JNG-21-JALUR 5)",
    "km": "KM 26+100",
    "category": "SECTION INSULATOR (FRP)",
    "d": "M 1389.64 1339.8 L 1389.4 1347.0 M 1383.88 1339.9 L 1383.64 1347.0",
    "hitD": "M 1389.64 1339.8 L 1389.4 1347.0 M 1383.88 1339.9 L 1383.64 1347.0 M 1389.52 1343.4 L 1383.76 1343.5",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "FRP",
      "label": "SECTION INSULATOR (FRP-JNG-21-JALUR 5)",
      "km": "KM 26+100"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "JALUR 5 BEKASI",
      "km": "KM 26+100"
    }
  },
  {
    "id": "frp_jng_22_jalur_6",
    "code": "FRP-JNG-22-JALUR 6",
    "title": "SECTION INSULATOR (FRP-JNG-22-JALUR 6)",
    "km": "KM 26+150",
    "category": "SECTION INSULATOR (FRP)",
    "d": "M 1393 1290.2 L 1392.88 1297.4 M 1387.24 1290.2 L 1387.12 1297.4",
    "hitD": "M 1393 1290.2 L 1392.88 1297.4 M 1387.24 1290.2 L 1387.12 1297.4 M 1392.94 1293.8 L 1387.18 1293.8",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "FRP",
      "label": "SECTION INSULATOR (FRP-JNG-22-JALUR 6)",
      "km": "KM 26+150"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "JALUR 6 BEKASI",
      "km": "KM 26+150"
    }
  },
  {
    "id": "frp_jng_23_71c1",
    "code": "FRP-JNG-23-71C1",
    "title": "SECTION INSULATOR (FRP-JNG-23-71C1)",
    "km": "KM 26+300",
    "category": "SECTION INSULATOR (FRP)",
    "d": "M 1319.8 1273.4 L 1325.2 1268.8 M 1316.32 1269.2 L 1321.72 1264.6",
    "hitD": "M 1319.8 1273.4 L 1325.2 1268.8 M 1316.32 1269.2 L 1321.72 1264.6 M 1322.5 1271.1 L 1319.02 1266.9",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "FRP",
      "label": "SECTION INSULATOR (FRP-JNG-23-71C1)",
      "km": "KM 26+300"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "WESEL 71C1 BEKASI",
      "km": "KM 26+300"
    }
  },
  {
    "id": "frp_jng_24_51c",
    "code": "FRP-JNG-24-51C",
    "title": "SECTION INSULATOR (FRP-JNG-24-51C)",
    "km": "KM 26+350",
    "category": "SECTION INSULATOR (FRP)",
    "d": "M 1326.04 1372.6 L 1320.88 1367.6 M 1321.84 1376.5 L 1316.68 1371.6",
    "hitD": "M 1326.04 1372.6 L 1320.88 1367.6 M 1321.84 1376.5 L 1316.68 1371.6 M 1323.46 1370.1 L 1319.26 1374.1",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "FRP",
      "label": "SECTION INSULATOR (FRP-JNG-24-51C)",
      "km": "KM 26+350"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "WESEL 51C BEKASI",
      "km": "KM 26+350"
    }
  },
  {
    "id": "frp_jng_25_33a",
    "code": "FRP-JNG-25-33A",
    "title": "SECTION INSULATOR (FRP-JNG-25-33A)",
    "km": "KM 26+600",
    "category": "SECTION INSULATOR (FRP)",
    "d": "M 798.4 1376.4 L 803.8 1371.7 M 794.92 1372.3 L 800.32 1367.6",
    "hitD": "M 798.4 1376.4 L 803.8 1371.7 M 794.92 1372.3 L 800.32 1367.6 M 801.1 1374.1 L 797.62 1370.0",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "FRP",
      "label": "SECTION INSULATOR (FRP-JNG-25-33A)",
      "km": "KM 26+600"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "WESEL 33A BEKASI",
      "km": "KM 26+600"
    }
  },
  {
    "id": "frp_jng_26_73",
    "code": "FRP-JNG-26-73",
    "title": "SECTION INSULATOR (FRP-JNG-26-73)",
    "km": "KM 26+500",
    "category": "SECTION INSULATOR (FRP)",
    "d": "M 805.36 1265.6 L 810.52 1270.7 M 809.56 1261.7 L 814.72 1266.7",
    "hitD": "M 805.36 1265.6 L 810.52 1270.7 M 809.56 1261.7 L 814.72 1266.7 M 807.94 1268.2 L 812.14 1264.2",
    "color": "#000000",
    "isCrossing": true,
    "startDivider": {
      "type": "FRP",
      "label": "SECTION INSULATOR (FRP-JNG-26-73)",
      "km": "KM 26+500"
    },
    "endDivider": {
      "type": "WESEL",
      "label": "WESEL 73 BEKASI",
      "km": "KM 26+500"
    }
  }
];

export const allTrackLines = ALL_TRACK_LINES;

// Smart line-to-log matching function (Strict 1-to-1 Isolation, Direction Guard, Track Number Guard & Device Isolation)
// =========================================================================
// SINGLE SOURCE OF TRUTH: DETERMINISTIC 1-TO-1 LOG TO TRACK MATCHER
// Guarantees that 1 work order maps strictly to 1 physical line/asset on the map.
// Completely eliminates duplicate / multi-radar beacon flare-ups across the system.
// =========================================================================
export const findBestLineForLog = (log, allLines = ALL_TRACK_LINES) => {
  if (!log) return null;
  const tc = (log.targetCode || '').trim();
  const tid = (log.targetId || '').trim();
  if (!tc && !tid) return null;

  const cleanTc = tc.toLowerCase().replace(/\s+/g, ' ');
  const alphaTc = cleanTc.replace(/[^a-z0-9]/g, '');

  // 1. Tier 1: Target ID exact match (Highest Priority)
  // STRICT 1-TO-1 EXACT BINDING:
  // If targetId is provided, match ONLY with the line that has this exact ID.
  // DO NOT fall back to title if targetId is specified (prevents leaking across same-title segments).
  if (tid) {
    const byId = allLines.find((l) => (l.id || '').toLowerCase() === tid.toLowerCase());
    return byId || null;
  }

  // 1b. Disambiguation for segments with duplicate titles when targetId is not specified (Legacy Data)
  const desc = (log.description || '').toLowerCase();
  const combText = `${cleanTc} ${desc}`;

  // Kasus 1: ST. JATINEGARA (JALUR 3)
  if (cleanTc === 'st. jatinegara (jalur 3)' || cleanTc === 'jalur 3 jng' || alphaTc === 'stjatinegarajalur3') {
    if (combText.includes('1+049') || combText.includes('barat') || combText.includes('oranye') || combText.includes('cokelat') || combText.includes('rust')) {
      const line = allLines.find((l) => l.id === 'jng_jalur_mid_rust');
      if (line) return line;
    }
    if (combText.includes('12+384') || combText.includes('timur') || combText.includes('ext')) {
      const line = allLines.find((l) => l.id === 'jng_jalur_3_ext');
      if (line) return line;
    }
    // Default utama stasiun: Jalur 3 Kuning (Peron Stasiun Jatinegara KM 11+600 - KM 11+900)
    const line = allLines.find((l) => l.id === 'jng_jalur_3');
    if (line) return line;
  }

  // Kasus 2: ST. JATINEGARA (JALUR 4)
  if (cleanTc === 'st. jatinegara (jalur 4)' || cleanTc === 'jalur 4 jng' || alphaTc === 'stjatinegarajalur4') {
    if (combText.includes('12+089') || combText.includes('12+235') || combText.includes('w23c') || combText.includes('hijau') || combText.includes('green')) {
      const line = allLines.find((l) => l.id === 'jng_jalur_mid_green');
      if (line) return line;
    }
    // Default utama: Jalur 4 Oranye (KM 1+049 - KM 12+089)
    const line = allLines.find((l) => l.id === 'jng_jalur_4');
    if (line) return line;
  }

  // Kasus 3: ST. BEKASI (JALUR 7)
  if (cleanTc === 'st. bekasi (jalur 7)' || cleanTc === 'jalur 7 bks' || alphaTc === 'stbekasijalur7') {
    if (combText.includes('frp') || combText.includes('73')) {
      const line = allLines.find((l) => l.id === 'wesel_frp_73_bks');
      if (line) return line;
    }
    const line = allLines.find((l) => l.id === 'bks_jalur_simpan_1012');
    if (line) return line;
  }

  // Kasus 4: BKS-BKT (JALUR HULU)
  if (cleanTc === 'bks-bkt (jalur hulu)' || cleanTc === 'bks-bkt hu' || alphaTc === 'bksbktjalurhulu') {
    if (combText.includes('merah') || combText.includes('red')) {
      const line = allLines.find((l) => l.id === 'bks_timur_1228_red');
      if (line) return line;
    }
    if (combText.includes('27+000') || combText.includes('timur')) {
      const line = allLines.find((l) => l.id === 'bks_timur_1228_grn');
      if (line) return line;
    }
    const line = allLines.find((l) => l.id === 'bks_jalur_1_end');
    if (line) return line;
  }

  // Kasus 5: BKT-BKS (JALUR HILIR)
  if (cleanTc === 'bkt-bks (jalur hilir)' || cleanTc === 'bkt-bks hi' || alphaTc === 'bktbksjalurhilir') {
    if (combText.includes('east') || combText.includes('1277')) {
      const line = allLines.find((l) => l.id === 'bks_timur_1277_red');
      if (line) return line;
    }
    const line = allLines.find((l) => l.id === 'bks_jalur_2_west');
    if (line) return line;
  }

  // 2. Tier 2: Exact Title Match (Highest Priority among text matches)
  for (const line of allLines) {
    const lt = (line.title || '').toLowerCase().replace(/\s+/g, ' ');
    if (lt && cleanTc === lt) return line;
  }

  // Tier 2b: Exact Code Match
  for (const line of allLines) {
    const lc = (line.code || '').toLowerCase().replace(/\s+/g, ' ');
    if (lc && cleanTc === lc) return line;
  }

  // Tier 2c: Exact ID Match
  for (const line of allLines) {
    const lid = (line.id || '').toLowerCase();
    if (lid && cleanTc === lid) return line;
  }

  // 3. Tier 3: Exact Alphanumeric Match (immune to punctuation/bracket differences)
  if (alphaTc) {
    for (const line of allLines) {
      const alt = (line.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      if (alt && alphaTc === alt) return line;
    }
    for (const line of allLines) {
      const alc = (line.code || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      if (alc && alphaTc === alc) return line;
    }
    for (const line of allLines) {
      const alid = (line.id || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      if (alid && alphaTc === alid) return line;
    }
  }

  // 3b. Tier 3b: Legacy Title / Code Match (Guarantees backward compatibility for historical work logs)
  if (LEGACY_TARGET_MAP) {
    const legacyId = LEGACY_TARGET_MAP[cleanTc] || (alphaTc ? LEGACY_TARGET_MAP[alphaTc] : null);
    if (legacyId) {
      const byLegacy = allLines.find((l) => l.id === legacyId);
      if (byLegacy) return byLegacy;
    }
  }

  // 4. Tier 4: Fuzzy / Regex Scoring with Strict Disqualification Guards
  let bestLine = null;
  let bestScore = 0;

  const tcIsHi = /\b(hi|hilir)\b/i.test(cleanTc);
  const tcIsHu = /\b(hu|hulu)\b/i.test(cleanTc);
  const tcJalur = cleanTc.match(/\b(?:jalur|jl\.?)\s*(\d+)\b/i);
  const tcKm = cleanTc.match(/KM\s*(\d+\+?\d*)/i);

  for (const line of allLines) {
    const lineId = (line.id || '').toLowerCase();
    const lineCode = (line.code || '').toLowerCase();
    const lineTitle = (line.title || '').toLowerCase();
    const lineCat = (line.category || '').toUpperCase();
    const lineKm = (line.km || '').toLowerCase();
    const combined = `${lineTitle} ${lineCode} ${lineId} ${lineCat} ${lineKm}`.toLowerCase();

    // Station Guard: Cakung, Bekasi, Jatinegara cannot cross-match
    if (cleanTc.includes('cakung') || cleanTc.includes('cuk')) {
      if (!combined.includes('cakung') && !lineId.includes('cuk')) continue;
    }
    if (cleanTc.includes('bekasi') || cleanTc.includes('bks')) {
      if (!combined.includes('bekasi') && !lineId.includes('bks') && !lineId.includes('bkt')) continue;
    }
    if (cleanTc.includes('jatinegara') || cleanTc.includes('jng')) {
      if (!combined.includes('jatinegara') && !lineId.includes('jng')) continue;
    }

    // Direction Guard: HI vs HU
    const lineIsHi = /\b(hi|hilir)\b/i.test(combined) || lineId.endsWith('_hi');
    const lineIsHu = /\b(hu|hulu)\b/i.test(combined) || lineId.endsWith('_hu');
    if (tcIsHi && lineIsHu && !lineIsHi) continue;
    if (tcIsHu && lineIsHi && !lineIsHu) continue;

    // Track Number Guard (Jalur 1 vs Jalur 2 etc.)
    const lineJalur = combined.match(/\b(?:jalur|jl\.?)\s*(\d+)\b/i);
    if (tcJalur && lineJalur && tcJalur[1] !== lineJalur[1]) continue;

    let score = 0;
    const isSwitch = lineCat.includes('DISCONNECTING SWITCH') || lineCat.includes('(DS)') || lineId.startsWith('ds_');
    const isInsulator = lineCat.includes('SECTION INSULATOR') || lineCat.includes('(FRP)') || lineId.startsWith('frp_');
    const isTurnout = lineCat.includes('WESEL') || lineId.startsWith('wesel_') || lineId.startsWith('titik_wesel_');

    if (isSwitch) {
      const dsM = lineCode.match(/DS\s*(\d+[A-Z]?)/i) || lineId.match(/ds_?(\d+[A-Z]?)/i);
      if (dsM) {
        const num = dsM[1].toLowerCase();
        if (new RegExp(`(^|\\b)ds\\s*-?\\s*${num}\\b`, 'i').test(cleanTc)) {
          score = 350;
          if (cleanTc.includes('(no)') && combined.includes('(no)')) score += 20;
          if (cleanTc.includes('(nc)') && combined.includes('(nc)')) score += 20;
        }
      }
    } else if (isInsulator) {
      const frpM = lineCode.match(/FRP[^\s)]*/i) || lineId.match(/frp[^\s)]*/i);
      if (frpM) {
        const frpCode = frpM[0].toLowerCase();
        if (cleanTc.includes(frpCode)) score = 350;
      }
    } else if (isTurnout) {
      if (/\b(wesel|w\d{2})\b/i.test(cleanTc)) {
        const wM = lineCode.match(/W\d{2}[A-Z0-9]*/i) || lineId.match(/w\d{2}[a-z0-9]*/i);
        if (wM) {
          const wCode = wM[0].toLowerCase();
          if (new RegExp(`(^|\\b|wesel\\s*)${wCode}\\b`, 'i').test(cleanTc)) {
            const tcIsCrossover = cleanTc.includes('crossover') || cleanTc.includes('/');
            const lineIsCrossover = line.isCrossing && !line.isDot;
            if (tcIsCrossover && lineIsCrossover) {
              score = 380;
            } else if (!tcIsCrossover && line.isDot) {
              score = 350;
            } else {
              score = 300;
            }
            if (tcKm && lineKm && lineKm.includes(tcKm[1].toLowerCase())) {
              score += 30;
            }
          }
        }
      }
    } else {
      const lt = lineTitle.replace(/\s+/g, ' ');
      const lc = lineCode.replace(/\s+/g, ' ');
      if (lc && cleanTc.includes(lc)) {
        score = 250;
      } else if (lt && cleanTc.includes(lt)) {
        score = 220;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestLine = line;
    }
  }

  return bestLine;
};

export const matchLineLogs = (lineOrCode, logs = []) => {
  if (!lineOrCode || !logs || !Array.isArray(logs) || logs.length === 0) return [];
  const lineObj = typeof lineOrCode === 'object'
    ? lineOrCode
    : ALL_TRACK_LINES.find((l) => l.code === lineOrCode || l.id === lineOrCode || l.title === lineOrCode);
  if (!lineObj) return [];

  const lineId = (lineObj.id || '').toLowerCase();

  // A log matches this line IF AND ONLY IF this line is the designated owner for that log
  return logs.filter((log) => {
    if (!log) return false;
    const tid = (log.targetId || '').trim().toLowerCase();
    if (tid) {
      return tid === lineId;
    }
    const best = findBestLineForLog(log, ALL_TRACK_LINES);
    return best && (best.id || '').toLowerCase() === lineId;
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
  if (!logs || !Array.isArray(logs) || logs.length === 0) return [];

  // Group each log strictly to its SINGLE BEST matching line (Prevents any multi-radar duplicates)
  const lineLogsMap = new Map();

  logs.forEach((log) => {
    if (!log) return;
    const bestLine = findBestLineForLog(log, ALL_TRACK_LINES);
    if (bestLine) {
      if (!lineLogsMap.has(bestLine.id)) {
        lineLogsMap.set(bestLine.id, { line: bestLine, logs: [] });
      }
      lineLogsMap.get(bestLine.id).logs.push(log);
    }
  });

  const list = [];
  lineLogsMap.forEach(({ line, logs: lineLogs }) => {
    const center = getLineCenter(line);
    if (center) {
      list.push({
        line,
        logs: lineLogs,
        center,
      });
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

  const containerRef = useRef(null);
  const viewerWrapperRef = useRef(null);
  const pinchRef = useRef({ distance: 0, initialZoom: 1 });
  const touchStartPos = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);

  const [viewportBase, setViewportBase] = useState({ width: 1420, height: 796 });
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  const [mobileFitScale, setMobileFitScale] = useState(0.1096);

  // Responsive Fit Calculation: Guarantees that at Zoom 100%, the entire map fits perfectly centered without ANY side cut off!
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const calculateFit = () => {
      const cw = el.clientWidth;
      const ch = el.clientHeight;
      if (!cw || !ch) return;

      const mobileMode = window.innerWidth < 768;
      setIsMobile(mobileMode);

      // Mobile fit scale: fits native 3275 x 1835 into mobile screen without blur/raster stretching
      const padM = 8;
      const fitW = (cw - padM * 2) / 3275;
      const fitH = (ch - padM * 2) / 1835;
      const fitScale = Math.min(fitW, fitH);
      setMobileFitScale(fitScale);

      // Desktop fit calculation (strictly unchanged for Desktop >= 768px / >= 1024px)
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

  // Zoom range constants (Min 100% - Max 1500% across Desktop & Mobile)
  const MIN_ZOOM = 1.0;
  const MAX_ZOOM = 15.0;

  // Zoom handlers (100% - 1500% with adaptive proportional stepping)
  const handleZoomIn = () =>
    setZoom((prev) => {
      const step = prev >= 4.0 ? 1.0 : (prev >= 2.0 ? 0.5 : 0.25);
      return Math.min(parseFloat((prev + step).toFixed(2)), MAX_ZOOM);
    });

  const handleZoomOut = () =>
    setZoom((prev) => {
      const step = prev > 4.0 ? 1.0 : (prev > 2.0 ? 0.5 : 0.25);
      const next = Math.max(parseFloat((prev - step).toFixed(2)), MIN_ZOOM);
      if (next <= 1.0) {
        setPosition({ x: 0, y: 0 });
      }
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

  // Mobile Touch Gestures (Single finger Pan & 2-finger Pinch Zoom up to 1500%)
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
        initialPos: { ...position },
        midX: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        midY: (e.touches[0].clientY + e.touches[1].clientY) / 2,
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
      const nextZoom = Math.min(Math.max(pinchRef.current.initialZoom * factor, MIN_ZOOM), MAX_ZOOM);
      const roundedZoom = parseFloat(nextZoom.toFixed(2));
      setZoom(roundedZoom);

      if (roundedZoom <= 1.0) {
        setPosition({ x: 0, y: 0 });
      } else if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const curMidX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const curMidY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        const focalX = curMidX - rect.left - rect.width / 2;
        const focalY = curMidY - rect.top - rect.height / 2;
        const scaleRatio = roundedZoom / pinchRef.current.initialZoom;

        const origFocalX = pinchRef.current.midX - rect.left - rect.width / 2;
        const origFocalY = pinchRef.current.midY - rect.top - rect.height / 2;

        setPosition({
          x: Math.round(focalX - (origFocalX - pinchRef.current.initialPos.x) * scaleRatio),
          y: Math.round(focalY - (origFocalY - pinchRef.current.initialPos.y) * scaleRatio),
        });
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

  // Wheel zoom (Min 100% - Max 1500%) with smooth proportional 1.15x scaling and cursor focal tracking
  const handleWheel = (e) => {
    e.preventDefault();
    const el = containerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const cursorX = e.clientX - rect.left - rect.width / 2;
    const cursorY = e.clientY - rect.top - rect.height / 2;

    setZoom((prevZoom) => {
      const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
      const nextZoom = Math.min(Math.max(parseFloat((prevZoom * factor).toFixed(2)), MIN_ZOOM), MAX_ZOOM);

      if (nextZoom <= 1.0) {
        setPosition({ x: 0, y: 0 });
      } else if (nextZoom !== prevZoom) {
        const scaleRatio = nextZoom / prevZoom;
        setPosition((prevPos) => ({
          x: Math.round(cursorX - (cursorX - prevPos.x) * scaleRatio),
          y: Math.round(cursorY - (cursorY - prevPos.y) * scaleRatio),
        }));
      }

      return nextZoom;
    });
  };

  const handleWheelRef = useRef(handleWheel);
  handleWheelRef.current = handleWheel;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e) => handleWheelRef.current(e);
    el.addEventListener('wheel', onWheel, { passive: false });

    // Prevent mobile pull-to-refresh / unwanted outer page scrolling when panning the map
    const handleNativeTouchMove = (e) => {
      if (e.touches.length > 0) {
        e.preventDefault();
      }
    };
    el.addEventListener('touchmove', handleNativeTouchMove, { passive: false });

    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('touchmove', handleNativeTouchMove);
    };
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

  const imageSrc = '/peta-laa-model4-hd.png?v=model4';

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

  // Pre-calculate collision-free icon placements above each active radar dot
  const beaconIconLayoutMap = React.useMemo(
    () => computeBeaconIconLayout(linesWithLogs),
    [linesWithLogs]
  );

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
      className={`bg-white border-0 sm:border border-slate-200 rounded-none sm:rounded-3xl overflow-hidden shadow-none sm:shadow-lg relative flex flex-col flex-1 min-h-0 w-full transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'w-full'
      }`}
    >
      {/* ========================================================
          1. MOBILE TOOLBAR (< md) - COMPACT 2-COLUMN FULL-WIDTH GRID
          ======================================================== */}
      <div className="md:hidden bg-white/95 border-b border-slate-200 px-2 py-1.5 flex flex-col gap-1.5 z-20 backdrop-blur-md shrink-0">
        {/* Row 1: Badge Lokasi Berpenanda Rata Kiri */}
        {linesWithLogs.length > 0 && (
          <div className="flex items-center justify-start w-full">
            <div
              className="flex items-center space-x-1 px-2 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-[9.5px] font-bold shadow-2xs shrink-0"
              title="Garis lintasan dengan tanda merah kedip menandakan ada riwayat pekerjaan"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-600"></span>
              </span>
              <span>{linesWithLogs.length} Lokasi Berpenanda</span>
            </div>
          </div>
        )}

        {/* Row 2: Grid 2 Kolom Penuh Seimbang (Total Kerja & Export PDF) */}
        <div className="grid grid-cols-2 gap-2 w-full">
          {/* Kolom 1: Total Pekerjaan */}
          {onOpenAllLogs && (
            <button
              onClick={onOpenAllLogs}
              className="bg-slate-50/90 hover:bg-orange-50/80 active:bg-orange-100 border border-slate-200/90 hover:border-orange-300 rounded-xl px-2.5 py-1.5 flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer group active:scale-95 text-left"
              title="Klik untuk membuka Rekapitulasi & Daftar Lengkap Seluruh Pekerjaan"
            >
              <div className="w-6.5 h-6.5 rounded-lg bg-orange-100/90 text-orange-600 flex items-center justify-center shrink-0 shadow-2xs">
                <ClipboardList className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-[8px] font-extrabold text-slate-400 uppercase tracking-tight leading-none truncate">
                  TOTAL
                </div>
                <div className="font-mono font-black text-slate-900 text-[11px] flex items-center gap-1 mt-0.5 leading-none truncate">
                  <span className="text-orange-600">{totalLogsCount}</span>
                  <span className="font-sans font-semibold text-[9px] text-slate-600">Pekerjaan</span>
                </div>
              </div>
            </button>
          )}

          {/* Kolom 2: Export PDF */}
          {onOpenExportPdf && (
            <button
              onClick={onOpenExportPdf}
              className="bg-slate-50/90 hover:bg-rose-50/80 active:bg-rose-100 border border-slate-200/90 hover:border-rose-300 rounded-xl px-2.5 py-1.5 flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer group active:scale-95 text-left"
              title="Buka Menu Export PDF & Cetak Peta Ultra HD"
            >
              <div className="w-6.5 h-6.5 rounded-lg bg-rose-100/90 text-rose-600 flex items-center justify-center shrink-0 shadow-2xs">
                <FileText className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-[8px] font-extrabold text-slate-400 uppercase tracking-tight leading-none truncate">
                  CETAK
                </div>
                <div className="font-black text-slate-900 text-[11px] flex items-center gap-1 mt-0.5 leading-none truncate">
                  <span className="text-rose-600">Export</span>
                  <span className="font-sans font-semibold text-[9px] text-slate-600">PDF</span>
                </div>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================
          2. DESKTOP TOOLBAR (>= md) - 100% UNCHANGED ORIGINAL LAYOUT
          ======================================================== */}
      <div className="hidden md:flex md:items-center md:justify-between bg-white/95 border-b border-slate-200 px-5 py-2.5 z-20 backdrop-blur-md">
        
        {/* Left Active Work Status (Rata Kiri bersih: hanya badge Lokasi Berpenanda) */}
        <div className="flex items-center shrink-0">
          {linesWithLogs.length > 0 && (
            <div
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold shadow-2xs animate-in fade-in"
              title="Garis lintasan dengan tanda merah kedip menandakan ada riwayat pekerjaan yang tercatat"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
              </span>
              <span>{linesWithLogs.length} Lokasi Berpenanda</span>
            </div>
          )}
        </div>

        {/* Right Tools: Total Work, Export PDF & Zoom Controls */}
        <div className="flex items-center space-x-2 shrink-0">
          
          {/* Total Work Clickable Badge */}
          {onOpenAllLogs && (
            <button
              onClick={onOpenAllLogs}
              className="h-10 bg-slate-50/90 hover:bg-orange-50/60 border border-slate-200/90 hover:border-orange-300 rounded-xl px-3 flex items-center space-x-2 shadow-2xs hover:shadow-xs transition-all cursor-pointer group active:scale-98 shrink-0 text-left"
              title="Klik untuk membuka Rekapitulasi & Daftar Lengkap Seluruh Pekerjaan"
            >
              <div className="w-7 h-7 rounded-lg bg-orange-100/90 text-orange-600 group-hover:bg-orange-500 group-hover:text-white transition-all flex items-center justify-center shrink-0 shadow-2xs">
                <ClipboardList className="w-4 h-4" />
              </div>

              <div>
                <div className="text-[9px] text-slate-500 group-hover:text-orange-700 font-extrabold uppercase tracking-wider flex items-center gap-0.5 leading-none">
                  <span>TOTAL PEKERJAAN</span>
                  <ChevronRight className="w-2.5 h-2.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="font-mono font-black text-slate-900 text-xs flex items-center gap-1 mt-0.5 leading-none">
                  <span className="text-orange-600">{totalLogsCount}</span>
                  <span className="font-semibold text-slate-700 font-sans">Dicatat</span>
                </div>
              </div>
            </button>
          )}

          {/* Export PDF Button */}
          {onOpenExportPdf && (
            <button
              onClick={onOpenExportPdf}
              className="h-10 bg-slate-50/90 hover:bg-rose-50/60 border border-slate-200/90 hover:border-rose-300 rounded-xl px-3 flex items-center space-x-2 shadow-2xs hover:shadow-xs transition-all cursor-pointer group active:scale-98 shrink-0 text-left"
              title="Buka Menu Export PDF & Cetak Peta Ultra HD"
            >
              <div className="w-7 h-7 rounded-lg bg-rose-100/90 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-all flex items-center justify-center shrink-0 shadow-2xs">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[9px] text-slate-500 group-hover:text-rose-700 font-extrabold uppercase tracking-wider flex items-center gap-0.5 leading-none">
                  <span>CETAK PETA</span>
                </div>
                <div className="font-black text-slate-900 text-xs flex items-center gap-1 mt-0.5 leading-none">
                  <span className="text-rose-600">Export</span>
                  <span className="font-semibold text-slate-700 font-sans">PDF</span>
                </div>
              </div>
            </button>
          )}

          {/* Unduh Master Data Excel Button (Desktop Only) */}
          <a
            href="/MASTER_DATA_ALL_TRACK_LINES_UPT_1.9.xlsx"
            download="MASTER_DATA_ALL_TRACK_LINES_UPT_1.9.xlsx"
            className="h-10 bg-slate-50/90 hover:bg-emerald-50/60 border border-slate-200/90 hover:border-emerald-300 rounded-xl px-3 flex items-center space-x-2 shadow-2xs hover:shadow-xs transition-all cursor-pointer group active:scale-98 shrink-0 text-left no-underline"
            title="Unduh Master Data Seluruh Jalur & Peralatan dalam format Excel (.xlsx)"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-100/90 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all flex items-center justify-center shrink-0 shadow-2xs">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[9px] text-slate-500 group-hover:text-emerald-700 font-extrabold uppercase tracking-wider flex items-center gap-0.5 leading-none">
                <span>MASTER DATA</span>
              </div>
              <div className="font-black text-slate-900 text-xs flex items-center gap-1 mt-0.5 leading-none">
                <span className="text-emerald-600">Unduh</span>
                <span className="font-semibold text-slate-700 font-sans">Excel</span>
              </div>
            </div>
          </a>

          {/* Zoom Controls */}
          <div className="h-10 flex items-center space-x-1 bg-slate-100 rounded-xl px-1.5 border border-slate-200 shadow-2xs shrink-0">
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 1.0}
              className={`p-1.5 rounded-lg transition ${
                zoom <= 1.0
                  ? 'text-slate-300 cursor-not-allowed'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200 cursor-pointer'
              }`}
              title="Perkecil (-) [Min 100%]"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <span className="text-xs font-mono font-bold px-2 text-slate-800 min-w-14 text-center">
              {Math.round(zoom * 100)}%
            </span>

            <button
              onClick={handleZoomIn}
              disabled={zoom >= MAX_ZOOM}
              className={`p-1.5 rounded-lg transition ${
                zoom >= MAX_ZOOM
                  ? 'text-slate-300 cursor-not-allowed'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200 cursor-pointer'
              }`}
              title="Perbesar (+) [Maks 1500%]"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <button
              onClick={handleResetZoom}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition cursor-pointer"
              title="Reset Zoom (100%)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition cursor-pointer"
              title="Layar Penuh"
            >
              <Maximize2 className="w-4 h-4" />
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
        className={`w-full flex-1 min-h-0 overflow-hidden bg-slate-100/70 mobile-cad-canvas cursor-grab active:cursor-grabbing relative select-none flex items-center justify-center touch-none ${
          isFullscreen ? 'h-[calc(100vh-55px)]' : 'flex-1 min-h-0 sm:min-h-[480px] sm:h-[calc(100vh-215px)] sm:max-h-[860px]'
        }`}
      >
        {/* Floating Quick Hint (Desktop vs. Mobile) */}
        <div className="hidden sm:flex absolute bottom-4 left-4 z-20 pointer-events-none bg-white/95 border border-slate-200 px-3.5 py-2 rounded-xl text-xs text-slate-600 backdrop-blur-md items-center space-x-1.5 shadow-sm">
          <Crosshair className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>Scroll mouse untuk Zoom • Tahan klik kiri untuk geser peta</span>
        </div>

        <div className="sm:hidden absolute bottom-3.5 left-3 z-20 pointer-events-none bg-slate-900/75 text-white px-2.5 py-1 rounded-full text-[9.5px] font-medium backdrop-blur-xs flex items-center gap-1.5 shadow-sm">
          <Crosshair className="w-3 h-3 text-blue-300 shrink-0" />
          <span>Geser 1 jari • Cubit zoom</span>
        </div>

        {/* Mobile Floating Zoom Controls (Google Maps / Figma Mobile Capsule) */}
        <div className="md:hidden absolute right-3 bottom-3.5 z-30 flex flex-col bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-xl p-0.5 gap-0.5">
          <button
            onClick={handleZoomIn}
            disabled={zoom >= MAX_ZOOM}
            className={`w-8.5 h-8.5 flex items-center justify-center rounded-xl transition ${
              zoom >= MAX_ZOOM
                ? 'text-slate-300 cursor-not-allowed'
                : 'text-slate-700 hover:text-blue-700 hover:bg-blue-50 active:scale-90 cursor-pointer'
            }`}
            title="Perbesar (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetZoom}
            className="w-8.5 h-9 flex flex-col items-center justify-center rounded-xl text-slate-700 hover:text-blue-700 hover:bg-blue-50 active:scale-90 transition cursor-pointer"
            title="Reset Fit Peta (100%)"
          >
            <span className="text-[8.5px] font-mono font-black leading-none text-slate-800">
              {Math.round(zoom * 100)}%
            </span>
            <RotateCcw className="w-2.5 h-2.5 mt-0.5 text-slate-400" />
          </button>
          <button
            onClick={handleZoomOut}
            disabled={zoom <= 1.0}
            className={`w-8.5 h-8.5 flex items-center justify-center rounded-xl transition ${
              zoom <= 1.0
                ? 'text-slate-300 cursor-not-allowed'
                : 'text-slate-700 hover:text-blue-700 hover:bg-blue-50 active:scale-90 cursor-pointer'
            }`}
            title="Perkecil (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>

        {/* ========================================================
            POPUP / BOTTOM SHEET: INFORMASI SEKSI & PEKERJAAN
            Desktop: Floating Card following cursor
            Mobile: Elegant Slide-up Bottom Sheet pinned to bottom
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
            className="fixed inset-x-0 bottom-0 sm:absolute sm:inset-x-auto sm:bottom-auto z-50 pointer-events-auto bg-white/98 border-t sm:border border-slate-200 sm:rounded-2xl rounded-t-3xl rounded-b-none p-3.5 sm:p-4 shadow-2xl backdrop-blur-xl w-full sm:w-88 sm:max-w-sm max-h-[72dvh] sm:max-h-[75vh] overflow-y-auto animate-in slide-in-from-bottom sm:zoom-in-95 duration-150 text-slate-800"
          >
            {/* Mobile Drag Indicator Bar */}
            <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-2.5 sm:hidden shrink-0" />
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
                  <span>Batas Pemisahan LAA:</span>
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
                  Belum ada catatan pekerjaan pada lokasi ini.
                </div>
              ) : (
                hoveredLogs.slice(0, 2).map((log, idx) => {
                  const { label: timeLabel } = resolveLogTime(log);
                  const kmLabel = resolveLogKilometer(log, hoveredLine);
                  const descText = resolveLogDescription(log);
                  const showDesc = hasRealDescription(log);

                  return (
                    <div
                      key={idx}
                      className="bg-slate-50/90 border border-slate-200 rounded-xl p-2.5 sm:p-3 text-xs space-y-1"
                    >
                      {/* Baris 1: Nama Pekerjaan (Acuan Utama) */}
                      <div className="font-bold text-slate-900 text-xs leading-snug">
                        {formatAction(log.actionType)}
                      </div>

                      {/* Baris 2: Lokasi Pekerjaan / Kilometer (100% sama dengan teks KM header popup) */}
                      {kmLabel && (
                        <span className="text-[11px] sm:text-xs text-blue-600 font-mono font-bold block leading-snug">
                          {kmLabel}
                        </span>
                      )}

                      {/* Baris 3: Uraian (Merah cerah #DC2626, gaya sama dengan Nama Pekerjaan, sembunyikan bila kosong/'-') */}
                      {showDesc && (
                        <div className="font-bold text-[#DC2626] text-xs leading-snug line-clamp-2">
                          {descText}
                        </div>
                      )}

                      {/* Baris 4: Waktu Pekerjaan (Sama gaya dengan Nama Pekerjaan, tanpa ikon jam/monospace) */}
                      <div className="font-bold text-slate-900 text-xs leading-snug">
                        {timeLabel}
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
                  title="Catat Pekerjaan Baru pada Lokasi Ini"
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
            transform: `translate(${position.x}px, ${position.y}px) scale(${
              isMobile ? (mobileFitScale * zoom) : zoom
            })`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
          }}
          className="relative flex items-center justify-center shrink-0 p-1 sm:p-4"
        >
          {/* Container tightly wrapping cropped schematic (Centered) */}
          <div
            style={{
              width: isMobile ? '3275px' : `${viewportBase.width}px`,
              height: isMobile ? '1835px' : `${viewportBase.height}px`,
            }}
            className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-lg sm:shadow-xl border-2 border-slate-300/90 bg-white shrink-0"
          >
            
            {/* Cropped AutoCAD Master Image (Ultra HD 9098x5097) */}
            <img
              src={imageSrc}
              alt="Peta Wilayah UPT Resor LAA 1.9 Jatinegara - Potongan Garis Tepi Terluar"
              className="w-full h-full object-contain block select-none pointer-events-none"
              style={{ imageRendering: 'auto' }}
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
              style={{ width: '100%', height: '100%' }}
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
                  return (
                    <g
                      key={line.id}
                      className="pointer-events-auto cursor-pointer"
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
                  return (
                    <g
                      key={line.id}
                      className="pointer-events-auto cursor-pointer"
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
                  ACTIVE WORK BEACONS (TEPAT 1 TITIK RADAR + IKON KATEGORI DI ATASNYA)
                  - Tepat 1 titik radar merah per garis/simbol berdasarkan pengelompokan 1-to-1 targetId.
                  - Menampilkan ikon kategori unik (tanpa duplikasi) berjejer rapi tepat di atas titik radar.
                  - Hovering triggers detailed popup card, clicking opens drawer.
                  ======================================================== */}
              {linesWithLogs.map(({ line, center }) => {
                const dotX = center.x;
                const dotY = center.y;
                const iconLayout = beaconIconLayoutMap.get(line.id) || {
                  placements: [],
                  minX: dotX,
                  maxX: dotX,
                  minY: dotY,
                };
                const { placements } = iconLayout;
                const hitLeft = Math.min(dotX - 18, placements.length > 0 ? iconLayout.minX : dotX - 18);
                const hitRight = Math.max(dotX + 18, placements.length > 0 ? iconLayout.maxX : dotX + 18);
                const hitTop = Math.min(dotY - 18, placements.length > 0 ? iconLayout.minY : dotY - 18);
                const hitBottom = dotY + 18;

                return (
                  <g
                    key={`work-beacon-group-${line.id}`}
                    className="pointer-events-auto cursor-pointer"
                    onMouseEnter={() => setHoveredLine(line)}
                    onMouseLeave={() => setHoveredLine(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setHoveredLine(line);
                      if (onSelectLocation) onSelectLocation(line);
                    }}
                  >
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
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.9;0.35;0"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="stroke-width"
                        values="3;1.6;0.3"
                        dur="2s"
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
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="r"
                        values="12;14.5;12"
                        dur="1.6s"
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

                    {/* 5. Ikon Kategori KETERANGAN (multi-row upward stacking anti-tabrakan) */}
                    {placements.length > 0 && (
                      <g data-beacon-icons={line.id}>
                        {placements.map(({ category, cx, cy }) => (
                          <CategoryBeaconIcon
                            key={`${line.id}-cat-${category.key}`}
                            category={category}
                            cx={cx}
                            cy={cy}
                          />
                        ))}
                      </g>
                    )}

                    {/* Combined Generous Hit-Area for effortless cursor hovering & clicking */}
                    <rect
                      x={hitLeft}
                      y={hitTop}
                      width={hitRight - hitLeft}
                      height={hitBottom - hitTop}
                      rx="14"
                      fill="transparent"
                    />
                  </g>
                );
              })}
            </svg>

          </div>
        </div>
    </div>
  </div>
  );
}
