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
} from 'lucide-react';

export default function SchematicViewer({
  logs = [],
  selectedLocation,
  onSelectLocation,
}) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const [viewMode, setViewMode] = useState('web'); // 'web' or 'hd'
  const [hoveredLine, setHoveredLine] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef(null);
  const viewerWrapperRef = useRef(null);

  // Zoom handlers
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 4.0));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.6));
  const handleResetZoom = () => {
    setZoom(1);
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

  // Wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 0.15 : -0.15;
    setZoom((prev) => Math.min(Math.max(prev + zoomFactor, 0.6), 4.0));
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

  const imageSrc = viewMode === 'hd' ? '/peta-laa-cropped-hd.png' : '/peta-laa-cropped.png';

  // 46 Authentic Track Segments bounded strictly by Cross Marks (Tanda Garis Tersilang / AJ / AS)
  // Colors match 100% with original AutoCAD DWG vector drawing
  const allTrackLines = [
    // ----------------------------------------------------
    // 1. LINTAS PERCABANGAN KRAMAT & ST. PONDOK JATI
    // ----------------------------------------------------
    {
      id: 'naspan_9_kpb',
      code: 'NASPAN 9 KPB-JNG',
      title: 'NASPAN 9 KPB-JNG (Percabangan Kramat)',
      km: 'KM 10+000 - KM 10+400',
      category: 'PERCABANGAN KRAMAT',
      d: 'M 172 371 L 588 371',
      xStart: 172,
      xEnd: 588,
      y: 371,
      color: '#ff7fdf', // AutoCAD Pink
    },
    {
      id: 'pondok_jati_hilir',
      code: 'ST. PONDOK JATI',
      title: 'ST. PONDOK JATI (Jalur Hilir)',
      km: 'KM 10+400 - KM 10+857',
      category: 'STASIUN PONDOK JATI',
      d: 'M 172 418 L 588 418',
      xStart: 172,
      xEnd: 588,
      y: 418,
      color: '#ff0000', // AutoCAD Red
    },

    // ----------------------------------------------------
    // 2. LINTAS MANGGARAI - JATINEGARA
    // ----------------------------------------------------
    {
      id: 'mri_jng_hi',
      code: 'MRI-JNG NASPAN 1 HI',
      title: 'MRI-JNG NASPAN 1 HI (Inbound Manggarai)',
      km: 'KM 10+800 - KM 11+448',
      category: 'SEKSI LAA HULU (HI)',
      d: 'M 310 657 L 475 657',
      xStart: 310,
      xEnd: 475,
      y: 657,
      color: '#8a6ddd', // AutoCAD Lavender
    },
    {
      id: 'jng_mri_naspan_2_hi',
      code: 'MRI-JNG NASPAN 1 HI',
      title: 'JNG-MRI NASPAN 2 HI (Inbound Manggarai)',
      km: 'KM 11+448 - KM 11+750',
      category: 'SEKSI LAA HULU (HI)',
      d: 'M 487 657 L 729 657',
      xStart: 487,
      xEnd: 729,
      y: 657,
      color: '#f8d731', // AutoCAD Yellow
    },
    {
      id: 'jng_mri_hu',
      code: 'JNG-MRI NASPAN 1 HU',
      title: 'JNG-MRI NASPAN 1 HU (Outbound Manggarai)',
      km: 'KM 10+800 - KM 11+448',
      category: 'SEKSI LAA HILIR (HU)',
      d: 'M 310 704 L 475 704',
      xStart: 310,
      xEnd: 475,
      y: 704,
      color: '#00ffff', // AutoCAD Cyan
    },
    {
      id: 'jng_mri_hu_inbound',
      code: 'JNG-MRI NASPAN 1 HU',
      title: 'JNG-MRI NASPAN 1 HU (Jatinegara Barat)',
      km: 'KM 11+448 - KM 11+750',
      category: 'SEKSI LAA HILIR (HU)',
      d: 'M 487 704 L 729 704',
      xStart: 487,
      xEnd: 729,
      y: 704,
      color: '#ff00ff', // AutoCAD Magenta
    },

    // ----------------------------------------------------
    // 3. STASIUN JATINEGARA (JALUR 1 S/D 8 & WESEL)
    // ----------------------------------------------------
    {
      id: 'jng_jalur_1',
      code: 'ST. JATINEGARA (JALUR 1)',
      title: 'ST. JATINEGARA (Jalur 1 & Peron 1)',
      km: 'KM 11+750',
      category: 'EMPLASEMEN JATINEGARA',
      d: 'M 741 656 L 1476 656',
      xStart: 741,
      xEnd: 1476,
      y: 656,
      color: '#f8d731', // AutoCAD Yellow
    },
    {
      id: 'jng_jalur_2',
      code: 'ST. JATINEGARA (JALUR 2)',
      title: 'ST. JATINEGARA (Jalur 2 & Peron 2)',
      km: 'KM 11+750',
      category: 'EMPLASEMEN JATINEGARA',
      d: 'M 741 704 L 1476 704',
      xStart: 741,
      xEnd: 1476,
      y: 704,
      color: '#ff00ff', // AutoCAD Magenta
    },
    {
      id: 'jng_jalur_3',
      code: 'ST. JATINEGARA (JALUR 3 & 4)',
      title: 'ST. JATINEGARA (Jalur 3 & Peron 3)',
      km: 'KM 11+750',
      category: 'EMPLASEMEN JATINEGARA',
      d: 'M 797 606 L 1476 606',
      xStart: 797,
      xEnd: 1476,
      y: 606,
      color: '#f8d731', // AutoCAD Yellow
    },
    {
      id: 'jng_jalur_4',
      code: 'ST. JATINEGARA (JALUR 3 & 4)',
      title: 'ST. JATINEGARA (Jalur 4 & Peron 4)',
      km: 'KM 11+750',
      category: 'EMPLASEMEN JATINEGARA',
      d: 'M 829 513 L 1462 513',
      xStart: 829,
      xEnd: 1462,
      y: 513,
      color: '#cc6827', // AutoCAD Orange
    },
    {
      id: 'jng_jalur_5',
      code: 'ST. JATINEGARA (JALUR 5 s/d 8)',
      title: 'ST. JATINEGARA (Jalur 5 Stabling)',
      km: 'KM 11+750',
      category: 'STABLING JATINEGARA',
      d: 'M 992 465 L 1484 465',
      xStart: 992,
      xEnd: 1484,
      y: 465,
      color: '#cc6827', // AutoCAD Orange
    },
    {
      id: 'jng_jalur_6',
      code: 'ST. JATINEGARA (JALUR 5 s/d 8)',
      title: 'ST. JATINEGARA (Jalur 6 Stabling)',
      km: 'KM 11+750',
      category: 'STABLING JATINEGARA',
      d: 'M 600 418 L 1453 418',
      xStart: 600,
      xEnd: 1453,
      y: 418,
      color: '#cc6827', // AutoCAD Orange
    },
    {
      id: 'jng_jalur_7',
      code: 'ST. JATINEGARA (JALUR 5 s/d 8)',
      title: 'ST. JATINEGARA (Jalur 7 Stabling Utara)',
      km: 'KM 11+750',
      category: 'STABLING JATINEGARA',
      d: 'M 601 370 L 1477 370',
      xStart: 601,
      xEnd: 1477,
      y: 370,
      color: '#139a47', // AutoCAD Green
    },
    {
      id: 'jng_jalur_8',
      code: 'ST. JATINEGARA (JALUR 5 s/d 8)',
      title: 'ST. JATINEGARA (Jalur 8 Depo / Badug)',
      km: 'KM 11+750',
      category: 'DEPO JATINEGARA',
      d: 'M 992 323 L 1422 323',
      xStart: 992,
      xEnd: 1422,
      y: 323,
      color: '#139a47', // AutoCAD Green
    },
    {
      id: 'jng_wesel_barat',
      code: 'ST. JATINEGARA',
      title: 'ST. JATINEGARA (Wesel Barat W21A/B)',
      km: 'KM 11+500',
      category: 'KOMPLEKS WESEL',
      d: 'M 612 606 L 791 606',
      xStart: 612,
      xEnd: 791,
      y: 606,
      color: '#cc6827',
    },
    {
      id: 'jng_wesel_timur',
      code: 'ST. JATINEGARA',
      title: 'ST. JATINEGARA (Wesel Timur W31A/B)',
      km: 'KM 12+000',
      category: 'KOMPLEKS WESEL',
      d: 'M 1488 608 L 1823 608',
      xStart: 1488,
      xEnd: 1823,
      y: 608,
      color: '#f8d731',
    },

    // ----------------------------------------------------
    // 4. PETAK JATINEGARA - KLENDER (JNG-KLD)
    // ----------------------------------------------------
    {
      id: 'naspan_1_hi',
      code: 'NASPAN 1 JNG-KLD (HI)',
      title: 'NASPAN 1 JNG-KLD (HI)',
      km: 'KM 11+750 - KM 12+844',
      category: 'SEKSI LAA HULU (HI)',
      d: 'M 1487 656 L 1943 656',
      xStart: 1487,
      xEnd: 1943,
      y: 656,
      color: '#f8d731', // AutoCAD Yellow
    },
    {
      id: 'naspan_1_hu',
      code: 'NASPAN 1 JNG-KLD (HU)',
      title: 'NASPAN 1 JNG-KLD (HU)',
      km: 'KM 11+750 - KM 12+844',
      category: 'SEKSI LAA HILIR (HU)',
      d: 'M 1488 704 L 1943 704',
      xStart: 1488,
      xEnd: 1943,
      y: 704,
      color: '#ff00ff', // AutoCAD Magenta
    },
    {
      id: 'naspan_2',
      code: 'NASPAN 2 JNG-KLD',
      title: 'NASPAN 2 JNG-KLD',
      km: 'KM 12+844 - KM 13+800',
      category: 'SEKSI LAA PETAK KLENDER',
      d: 'M 1954 656 L 2079 656',
      xStart: 1954,
      xEnd: 2079,
      y: 656,
      color: '#0000ff', // AutoCAD Blue
    },
    {
      id: 'naspan_3',
      code: 'NASPAN 3 JNG-KLD',
      title: 'NASPAN 3 JNG-KLD',
      km: 'KM 13+800 - KM 14+800',
      category: 'SEKSI LAA PETAK KLENDER',
      d: 'M 2091 656 L 2245 656',
      xStart: 2091,
      xEnd: 2245,
      y: 656,
      color: '#0000ff', // AutoCAD Blue
    },
    {
      id: 'naspan_4',
      code: 'NASPAN 4 JNG-KLD',
      title: 'NASPAN 4 JNG-KLD',
      km: 'KM 12+844 - KM 15+760',
      category: 'SEKSI LAA PETAK KLENDER',
      d: 'M 1954 704 L 2244 704',
      xStart: 1954,
      xEnd: 2244,
      y: 704,
      color: '#ff9f7f', // AutoCAD Peach
    },

    // ----------------------------------------------------
    // 5. PETAK KLENDER - BUARAN (KLD-BUA)
    // ----------------------------------------------------
    {
      id: 'naspan_4b',
      code: 'NASPAN 4B KLD-BUA',
      title: 'NASPAN 4B KLD-BUA',
      km: 'KM 15+760 - KM 16+914',
      category: 'SEKSI LAA PETAK BUARAN',
      d: 'M 2258 656 L 2513 656',
      xStart: 2258,
      xEnd: 2513,
      y: 656,
      color: '#0000ff', // AutoCAD Blue
    },
    {
      id: 'naspan_5',
      code: 'NASPAN 5 KLD-BUA',
      title: 'NASPAN 5 KLD-BUA',
      km: 'KM 15+760 - KM 17+500',
      category: 'SEKSI LAA PETAK BUARAN',
      d: 'M 2256 704 L 2512 704',
      xStart: 2256,
      xEnd: 2512,
      y: 704,
      color: '#ff9f7f', // AutoCAD Peach
    },
    {
      id: 'naspan_6',
      code: 'NASPAN 6 KLD-BUA',
      title: 'NASPAN 6 KLD-BUA',
      km: 'KM 17+500 - KM 18+200',
      category: 'SEKSI LAA PETAK BUARAN',
      d: 'M 2524 656 L 2737 656',
      xStart: 2524,
      xEnd: 2737,
      y: 656,
      color: '#ff00ff', // AutoCAD Magenta
    },

    // ----------------------------------------------------
    // 6. PETAK BUARAN - KLENDER BARU (BUA-KLDB)
    // ----------------------------------------------------
    {
      id: 'naspan_7_buaran',
      code: 'NASPAN 7 BUA-KLDB',
      title: 'NASPAN 7 BUA-KLDB (Petak Buaran)',
      km: 'KM 18+200 - KM 19+546',
      category: 'SEKSI LAA PETAK KLENDER BARU',
      d: 'M 2523 704 L 2737 704',
      xStart: 2523,
      xEnd: 2737,
      y: 704,
      color: '#00ff00', // AutoCAD Green
    },
    {
      id: 'naspan_7b_hulu',
      code: 'NASPAN 7 BUA-KLDB',
      title: 'NASPAN 7B BUA-KLDB (Hulu)',
      km: 'KM 19+546 - KM 20+474',
      category: 'SEKSI LAA PETAK KLENDER BARU',
      d: 'M 2749 656 L 3091 656',
      xStart: 2749,
      xEnd: 3091,
      y: 656,
      color: '#f8d731', // AutoCAD Yellow
    },
    {
      id: 'naspan_7b_hilir',
      code: 'NASPAN 7 BUA-KLDB',
      title: 'NASPAN 7B BUA-KLDB (Hilir)',
      km: 'KM 19+546 - KM 20+474',
      category: 'SEKSI LAA PETAK KLENDER BARU',
      d: 'M 2749 704 L 3091 704',
      xStart: 2749,
      xEnd: 3091,
      y: 704,
      color: '#ff0000', // AutoCAD Red
    },

    // ----------------------------------------------------
    // 7. PETAK KLENDER BARU - CAKUNG & EMPLASEMEN CAKUNG
    // ----------------------------------------------------
    {
      id: 'naspan_8',
      code: 'NASPAN 8 BUA-KLDB',
      title: 'NASPAN 8 BUA-KLDB (Menuju Cakung)',
      km: 'KM 20+474 - KM 20+943',
      category: 'SEKSI LAA MENUJU CAKUNG',
      d: 'M 2819 1065 L 3103 1065',
      xStart: 2819,
      xEnd: 3103,
      y: 1065,
      color: '#ff0000', // AutoCAD Red
    },
    {
      id: 'naspan_8b',
      code: 'NASPAN 8 BUA-KLDB',
      title: 'NASPAN 8B KLDB-CUK (Menuju Cakung)',
      km: 'KM 20+943 - KM 21+400',
      category: 'SEKSI LAA MENUJU CAKUNG',
      d: 'M 2825 1113 L 3124 1113',
      xStart: 2825,
      xEnd: 3124,
      y: 1113,
      color: '#f8d731', // AutoCAD Yellow
    },
    {
      id: 'naspan_9_cuk_hulu',
      code: 'NASPAN 9 EMPL CUK',
      title: 'NASPAN 9 EMPL CUK (Emplasemen Cakung Hulu)',
      km: 'KM 21+400 - KM 22+500',
      category: 'EMPLASEMEN CAKUNG',
      d: 'M 2343 1065 L 2808 1065',
      xStart: 2343,
      xEnd: 2808,
      y: 1065,
      color: '#8a6ddd', // AutoCAD Lavender
    },
    {
      id: 'naspan_9_cuk_hilir',
      code: 'NASPAN 9 EMPL CUK',
      title: 'NASPAN 9 EMPL CUK (Emplasemen Cakung Hilir)',
      km: 'KM 21+400 - KM 22+500',
      category: 'EMPLASEMEN CAKUNG',
      d: 'M 2344 1113 L 2812 1113',
      xStart: 2344,
      xEnd: 2812,
      y: 1113,
      color: '#cc6827', // AutoCAD Orange
    },

    // ----------------------------------------------------
    // 8. PETAK CAKUNG - KRANJI
    // ----------------------------------------------------
    {
      id: 'naspan_10_hulu',
      code: 'NASPAN 10 CUK-KRI',
      title: 'NASPAN 10 CUK-KRI (Jalur Hulu)',
      km: 'KM 22+500 - KM 23+200',
      category: 'SEKSI LAA CAKUNG - KRANJI',
      d: 'M 2072 1063 L 2331 1063',
      xStart: 2072,
      xEnd: 2331,
      y: 1063,
      color: '#8a6ddd', // AutoCAD Lavender
    },
    {
      id: 'naspan_10_hilir',
      code: 'NASPAN 10 CUK-KRI',
      title: 'NASPAN 10 CUK-KRI (Jalur Hilir)',
      km: 'KM 22+500 - KM 23+200',
      category: 'SEKSI LAA CAKUNG - KRANJI',
      d: 'M 2066 1113 L 2332 1113',
      xStart: 2066,
      xEnd: 2332,
      y: 1113,
      color: '#cc6827', // AutoCAD Orange
    },
    {
      id: 'naspan_11_hulu',
      code: 'NASPAN 11 CUK-KRI',
      title: 'NASPAN 11 CUK-KRI (Jalur Hulu)',
      km: 'KM 23+200 - KM 23+987',
      category: 'SEKSI LAA CAKUNG - KRANJI',
      d: 'M 1825 1064 L 2061 1064',
      xStart: 1825,
      xEnd: 2061,
      y: 1064,
      color: '#ff00ff', // AutoCAD Magenta
    },
    {
      id: 'naspan_11_hilir',
      code: 'NASPAN 11 CUK-KRI',
      title: 'NASPAN 11 CUK-KRI (Jalur Hilir)',
      km: 'KM 23+200 - KM 23+987',
      category: 'SEKSI LAA CAKUNG - KRANJI',
      d: 'M 1639 1114 L 2051 1114',
      xStart: 1639,
      xEnd: 2051,
      y: 1114,
      color: '#00bfff', // AutoCAD Deep Sky Blue
    },

    // ----------------------------------------------------
    // 9. PETAK KRANJI - BEKASI
    // ----------------------------------------------------
    {
      id: 'naspan_12_hulu',
      code: 'NASPAN 12 BKS-KRI',
      title: 'NASPAN 12 BKS-KRI (Jalur Hulu Petak Kranji)',
      km: 'KM 23+987 - KM 25+000',
      category: 'SEKSI LAA KRANJI - BEKASI',
      d: 'M 1642 1064 L 1810 1064',
      xStart: 1642,
      xEnd: 1810,
      y: 1064,
      color: '#ff00ff', // AutoCAD Magenta
    },
    {
      id: 'naspan_12_hilir',
      code: 'NASPAN 12 BKS-KRI',
      title: 'NASPAN 12A/B KRI-BKS (Jalur Hilir)',
      km: 'KM 25+000 - KM 26+000',
      category: 'SEKSI LAA KRANJI - BEKASI',
      d: 'M 1390 1114 L 1626 1114',
      xStart: 1390,
      xEnd: 1626,
      y: 1114,
      color: '#ff0000', // AutoCAD Red
    },
    {
      id: 'naspan_12b_hulu',
      code: 'NASPAN 12 BKS-KRI',
      title: 'NASPAN 12B KRI-BKS (Jalur Hulu Petak Bekasi)',
      km: 'KM 25+000 - KM 26+000',
      category: 'SEKSI LAA KRANJI - BEKASI',
      d: 'M 1393 1064 L 1627 1064',
      xStart: 1393,
      xEnd: 1627,
      y: 1064,
      color: '#139a47', // AutoCAD Green
    },
    {
      id: 'naspan_13',
      code: 'NASPAN 13 BKS-KRI',
      title: 'NASPAN 13 BKS-KRI (Jalur 4 Bekasi)',
      km: 'KM 26+000 - KM 26+403',
      category: 'JALUR 4 BEKASI',
      d: 'M 776 1064 L 1388 1064',
      xStart: 776,
      xEnd: 1388,
      y: 1064,
      color: '#139a47', // AutoCAD Green
    },

    // ----------------------------------------------------
    // 10. STASIUN BEKASI & EMPLASEMEN
    // ----------------------------------------------------
    {
      id: 'bks_jalur_1_2',
      code: 'ST. BEKASI (JALUR 1 s/d 4)',
      title: 'ST. BEKASI (Jalur 1 & 2 Peron Utama)',
      km: 'KM 26+403',
      category: 'EMPLASEMEN BEKASI',
      d: 'M 604 1113 L 1384 1113',
      xStart: 604,
      xEnd: 1384,
      y: 1113,
      color: '#ff0000', // AutoCAD Red
    },
    {
      id: 'bks_stabling_utara',
      code: 'ST. BEKASI',
      title: 'ST. BEKASI (Jalur Stabling Utara)',
      km: 'KM 26+403',
      category: 'STABLING BEKASI',
      d: 'M 839 1012 L 1300 1012',
      xStart: 839,
      xEnd: 1300,
      y: 1012,
      color: '#139a47', // AutoCAD Green
    },
    {
      id: 'bks_stabling_5_8',
      code: 'ST. BEKASI (JALUR STABLING 5-8)',
      title: 'ST. BEKASI (Jalur Stabling 5-8)',
      km: 'KM 26+403',
      category: 'STABLING BEKASI',
      d: 'M 738 1175 L 1372 1175',
      xStart: 738,
      xEnd: 1372,
      y: 1175,
      color: '#ec1f24', // AutoCAD Red
    },
    {
      id: 'bks_langsir_barat',
      code: 'ST. BEKASI',
      title: 'ST. BEKASI (Jalur Langsir Barat)',
      km: 'KM 26+200',
      category: 'EMPLASEMEN BEKASI',
      d: 'M 461 1064 L 776 1064',
      xStart: 461,
      xEnd: 776,
      y: 1064,
      color: '#139a47', // AutoCAD Green
    },
    {
      id: 'bks_wesel_barat',
      code: 'ST. BEKASI',
      title: 'ST. BEKASI (Wesel Barat)',
      km: 'KM 26+300',
      category: 'WESEL BEKASI',
      d: 'M 505 1114 L 592 1114',
      xStart: 505,
      xEnd: 592,
      y: 1114,
      color: '#ec1f24', // AutoCAD Red
    },

    // ----------------------------------------------------
    // 11. PETAK LINTAS MENUJU BEKASI TIMUR
    // ----------------------------------------------------
    {
      id: 'bks_timur_hulu',
      code: 'PETAK BEKASI TIMUR',
      title: 'Lintas Menuju Bekasi Timur (Jalur Hulu)',
      km: 'KM 26+800',
      category: 'SEKSI KELUAR BEKASI TIMUR',
      d: 'M 260 1229 L 486 1229',
      xStart: 260,
      xEnd: 486,
      y: 1229,
      color: '#ec1f24', // AutoCAD Red
    },
    {
      id: 'bks_timur_hilir',
      code: 'PETAK BEKASI TIMUR',
      title: 'Lintas Menuju Bekasi Timur (Jalur Hilir)',
      km: 'KM 26+800',
      category: 'SEKSI KELUAR BEKASI TIMUR',
      d: 'M 260 1278 L 486 1278',
      xStart: 260,
      xEnd: 486,
      y: 1278,
      color: '#ec1f24', // AutoCAD Red
    },
  ];

  // Helper to get matching logs for a line
  const getLineLogs = (code) => {
    if (!code) return [];
    return logs.filter(
      (l) =>
        l.targetCode &&
        (l.targetCode.toLowerCase().includes(code.toLowerCase()) ||
          code.toLowerCase().includes(l.targetCode.toLowerCase()))
    );
  };

  const hoveredLogs = hoveredLine ? getLineLogs(hoveredLine.code) : [];

  const formatAction = (str) => {
    if (!str) return 'Pekerjaan Pemeliharaan';
    return str.replace(/_/g, ' ');
  };

  return (
    <div
      ref={viewerWrapperRef}
      className={`bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-lg relative flex flex-col transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'w-full'
      }`}
    >
      {/* Top Toolbar White Mode */}
      <div className="bg-white/95 border-b border-slate-200 px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 z-20 backdrop-blur-md">
        
        {/* Left Instruction */}
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-600">
            <Sparkles className="w-4 h-4" />
          </div>
          <p className="text-xs sm:text-sm text-slate-700 font-medium">
            Arahkan kursor ke garis jalur / naspan untuk <strong className="text-blue-600 font-bold">efek menyala & daftar riwayat pekerjaan</strong>
          </p>
        </div>

        {/* Right Tools: Resolution & Zoom */}
        <div className="flex items-center space-x-2">
          
          <div className="bg-slate-100 p-1 rounded-xl flex space-x-1 border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode('web')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                viewMode === 'web'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Standar
            </button>
            <button
              onClick={() => setViewMode('hd')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                viewMode === 'hd'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ultra HD
            </button>
          </div>

          <div className="flex items-center space-x-1 bg-slate-100 rounded-xl p-1 border border-slate-200">
            <button
              onClick={handleZoomOut}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition cursor-pointer"
              title="Perkecil (-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <span className="text-xs font-mono font-bold px-2 text-slate-800 min-w-14 text-center">
              {Math.round(zoom * 100)}%
            </span>

            <button
              onClick={handleZoomIn}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition cursor-pointer"
              title="Perbesar (+)"
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

      {/* Main Canvas Viewport (White Mode) */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          handleMouseUp();
          setHoveredLine(null);
        }}
        className={`w-full overflow-hidden bg-slate-100/70 cursor-grab active:cursor-grabbing relative select-none ${
          isFullscreen ? 'h-[calc(100vh-55px)]' : 'h-[720px]'
        }`}
      >
        {/* Floating Quick Hint */}
        <div className="absolute bottom-4 left-4 z-20 pointer-events-none bg-white/95 border border-slate-200 px-3.5 py-2 rounded-2xl text-xs text-slate-600 backdrop-blur-md flex items-center space-x-2 shadow-sm">
          <Crosshair className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>Scroll mouse untuk Zoom • Tahan klik kiri untuk geser peta</span>
        </div>

        {/* ========================================================
            FLOATING POPUP CARD: DAFTAR SINGKAT PEKERJAAN (WHITE MODE)
            ======================================================== */}
        {hoveredLine && (
          <div
            style={{
              left: `${Math.min(Math.max(mousePos.x + 15, 20), (containerRef.current?.clientWidth || 1000) - 340)}px`,
              top: `${Math.min(Math.max(mousePos.y - 40, 20), (containerRef.current?.clientHeight || 600) - 280)}px`,
            }}
            className="absolute z-50 pointer-events-auto bg-white/98 border border-slate-200 rounded-2xl p-4 shadow-2xl backdrop-blur-xl w-84 animate-in zoom-in-95 duration-150 text-slate-800"
          >
            {/* Header: Naspan info & color dot */}
            <div className="flex items-start justify-between pb-2.5 border-b border-slate-100">
              <div className="flex items-start space-x-2">
                <span
                  className="w-3.5 h-3.5 rounded-full mt-0.5 shrink-0 shadow-sm"
                  style={{ backgroundColor: hoveredLine.color }}
                />
                <div>
                  <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm leading-tight">
                    {hoveredLine.title}
                  </h4>
                  <span className="text-xs text-blue-600 font-mono font-bold mt-0.5 block">
                    {hoveredLine.km}
                  </span>
                </div>
              </div>

              <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 shrink-0 border border-blue-200">
                {hoveredLogs.length} Pekerjaan
              </span>
            </div>

            {/* Content: Daftar Singkat Pekerjaan */}
            <div className="mt-2.5 space-y-2">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-blue-600" />
                <span>Daftar Singkat Pekerjaan:</span>
              </div>

              {hoveredLogs.length === 0 ? (
                <div className="text-xs text-slate-500 italic py-2 bg-slate-50 rounded-xl px-3 border border-slate-200 text-center">
                  Belum ada catatan pekerjaan pada seksi naspan ini.
                </div>
              ) : (
                hoveredLogs.slice(0, 3).map((log, idx) => {
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

            {/* Direct Action Button to Input / View Work History */}
            <button
              onClick={() => onSelectLocation && onSelectLocation(hoveredLine)}
              className="w-full mt-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-between shadow-sm cursor-pointer transition-all active:scale-98"
            >
              <span className="flex items-center space-x-1.5">
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Input / Rincian Riwayat</span>
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Viewport Content */}
        <div
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          }}
          className="w-full h-full min-w-[1300px] min-h-[580px] relative p-2"
        >
          {/* Container tightly wrapping cropped schematic */}
          <div className="relative inline-block w-[1400px] rounded-2xl overflow-hidden shadow-md border-2 border-slate-300 bg-white">
            
            {/* Cropped AutoCAD Master Image */}
            <img
              src={imageSrc}
              alt="Peta Wilayah UPT Resor LAA 1.9 Jatinegara - Potongan Garis Tepi Terluar"
              className="w-full h-auto block select-none"
              draggable={false}
            />

            {/* ========================================================
                AUTHENTIC SVG TRACK LINES (STRICTLY HORIZONTAL, NO CURVES)
                - In default state: TRANSPARENT so original colors are 100% preserved
                - On hover: GLOWS WITH EXACT AUTOCAD COLOR & 3D EMBOSSED EFFECT
                - Cross marks (tanda garis tersilang) highlighted at ends of hovered naspan
                ======================================================== */}
            <svg
              viewBox="0 0 3275 1419"
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ width: '100%', height: '100%' }}
            >
              {allTrackLines.map((line) => {
                const isHovered = hoveredLine?.id === line.id;
                const isActive = selectedLocation?.code === line.code;

                return (
                  <g
                    key={line.id}
                    className="pointer-events-auto cursor-pointer"
                    onMouseEnter={() => setHoveredLine(line)}
                    onMouseLeave={() => setHoveredLine(null)}
                    onClick={() => onSelectLocation && onSelectLocation(line)}
                  >
                    {/* 1. Super generous 36px hit-area for effortless cursor detection */}
                    <path
                      d={line.d}
                      stroke="transparent"
                      strokeWidth="36"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />

                    {/* 2. On Hover/Active: Glowing Line in EXACT authentic AutoCAD color */}
                    {(isHovered || isActive) && (
                      <>
                        {/* Outer Glow Halo matching exact AutoCAD color */}
                        <path
                          d={line.d}
                          stroke={line.color}
                          strokeWidth="11"
                          strokeLinecap="square"
                          strokeLinejoin="miter"
                          fill="none"
                          style={{
                            opacity: 0.85,
                            filter: `drop-shadow(0 0 10px ${line.color}) drop-shadow(0 0 20px ${line.color})`,
                          }}
                        />

                        {/* Core Solid Line in exact AutoCAD color */}
                        <path
                          d={line.d}
                          stroke={line.color}
                          strokeWidth="6"
                          strokeLinecap="square"
                          strokeLinejoin="miter"
                          fill="none"
                          style={{
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
                          }}
                        />

                        {/* 3D Embossed White Laser Centerline */}
                        <path
                          d={line.d}
                          stroke="#ffffff"
                          strokeWidth="2.2"
                          strokeLinecap="square"
                          strokeLinejoin="miter"
                          fill="none"
                          style={{
                            opacity: 0.95,
                            filter: 'drop-shadow(0 0 2px #ffffff)',
                          }}
                        />

                        {/* Tanda Garis Tersilang (X) at both ends of this NASPAN */}
                        {line.xStart && line.y && (
                          <g stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round">
                            {/* Cross at start */}
                            <line
                              x1={line.xStart - 7}
                              y1={line.y - 7}
                              x2={line.xStart + 7}
                              y2={line.y + 7}
                              stroke={line.color}
                              strokeWidth="3.5"
                            />
                            <line
                              x1={line.xStart - 7}
                              y1={line.y + 7}
                              x2={line.xStart + 7}
                              y2={line.y - 7}
                              stroke={line.color}
                              strokeWidth="3.5"
                            />
                            {/* Cross at end */}
                            <line
                              x1={line.xEnd - 7}
                              y1={line.y - 7}
                              x2={line.xEnd + 7}
                              y2={line.y + 7}
                              stroke={line.color}
                              strokeWidth="3.5"
                            />
                            <line
                              x1={line.xEnd - 7}
                              y1={line.y + 7}
                              x2={line.xEnd + 7}
                              y2={line.y - 7}
                              stroke={line.color}
                              strokeWidth="3.5"
                            />
                          </g>
                        )}
                      </>
                    )}
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
