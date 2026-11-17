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
} from 'lucide-react';

export default function SchematicViewer({
  logs = [],
  selectedLocation,
  onSelectLocation,
  isAdmin = false,
  onOpenAddLog,
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

  const [viewportBase, setViewportBase] = useState({ width: 1420, height: 615 });

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
      const mapRatio = 3275 / 1419; // ~2.30796

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

  const imageSrc = '/peta-laa-cropped-hd.png';

  // Complete List of Catenary Lines:
  // - Horizontal Naspan Tracks (46 Segments)
  // - Diagonal / Sloping Crossing Turnouts (17 Segments)
  // Every single segment has a strictly unique ID so only 1 line glows when clicked!
  const allTrackLines = [
    {
      id: 'kpb_jng_hi_aj',
      code: 'NASPAN 9 KPB-JNG',
      title: 'NASPAN 9 KPB-JNG (Jalur Hilir Arah Kramat)',
      km: 'KM 9+800 - KM 10+000',
      category: 'PERCABANGAN KRAMAT',
      d: 'M 171.9 370.2 L 207.0 370.2',
      color: '#ff7fdf',
      xStart: 171.9,
      xEnd: 207.0,
      y: 370.2,
      startDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ KM 10+000)', km: 'KM 10+000' },
      endDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ KM 10+000)', km: 'KM 10+000' },
    },
    {
      id: 'kpb_jng_hi_naspan9',
      code: 'NASPAN 9 KPB-JNG',
      title: 'NASPAN 9 KPB-JNG (Jalur Hilir Pondok Jati - Jatinegara)',
      km: 'KM 10+000 - KM 11+200',
      category: 'PERCABANGAN KRAMAT',
      d: 'M 218.7 370.4 L 587.7 370.4',
      color: '#ff7fdf',
      xStart: 218.7,
      xEnd: 587.7,
      y: 370.4,
      startDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ KM 10+000)', km: 'KM 10+000' },
      endDivider: { type: 'AS', label: 'Overlap Air Section (AS KM 11+200)', km: 'KM 11+200' },
    },
    {
      id: 'kpb_jng_hu_aj',
      code: 'NASPAN 9 JNG-KPB',
      title: 'NASPAN 9 JNG-KPB (Jalur Hulu Arah Kramat)',
      km: 'KM 9+800 - KM 10+000',
      category: 'NASPAN 9 JNG-KPB',
      d: 'M 171.9 418.2 L 206.8 418.2',
      color: '#ff0000',
      xStart: 171.9,
      xEnd: 206.8,
      y: 418.2,
      startDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ KM 10+000)', km: 'KM 10+000' },
      endDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ KM 10+000)', km: 'KM 10+000' },
    },
    {
      id: 'kpb_jng_hu_naspan',
      code: 'NASPAN 9 JNG-KPB',
      title: 'NASPAN 9 JNG-KPB (Jalur Hulu Pondok Jati - Jatinegara)',
      km: 'KM 10+000 - KM 11+200',
      category: 'NASPAN 9 JNG-KPB',
      d: 'M 218.7 418.2 L 587.7 418.2',
      color: '#ff0000',
      xStart: 218.7,
      xEnd: 587.7,
      y: 418.2,
      startDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ KM 10+000)', km: 'KM 10+000' },
      endDivider: { type: 'AS', label: 'Overlap Air Section (AS KM 11+200)', km: 'KM 11+200' },
    },
    {
      id: 'mri_jng_hi_western',
      code: 'PETAK MRI-JNG',
      title: 'Petak Manggarai - Jatinegara (Jalur Hilir Barat)',
      km: 'KM 1+599 - KM 1+880',
      category: 'PETAK MRI-JNG',
      d: 'M 310.2 656.2 L 474.5 656.2',
      color: '#8a6ddd',
      startDivider: { type: 'KM', label: 'KM 1+599', km: 'KM 1+599' },
      endDivider: { type: 'AS', label: 'Air Section (AS KM 1+880)', km: 'KM 1+880' },
    },
    {
      id: 'mri_jng_hi_naspan1',
      code: 'MRI-JNG NASPAN 1 HI',
      title: 'NASPAN 1 MRI-JNG HI (KM 11+400 - KM 11+880)',
      km: 'KM 1+880 - KM 2+000',
      category: 'ST. JATINEGARA (BARAT)',
      d: 'M 486.4 656.2 L 728.7 656.2',
      color: '#f8d731',
      startDivider: { type: 'AS', label: 'Air Section (AS KM 1+880)', km: 'KM 1+880' },
      endDivider: { type: 'AS', label: 'Air Section (AS KM 2+000)', km: 'KM 2+000' },
    },
    {
      id: 'mri_jng_hu_western',
      code: 'PETAK MRI-JNG',
      title: 'Petak Manggarai - Jatinegara (Jalur Hulu Barat)',
      km: 'KM 1+599 - KM 1+854',
      category: 'PETAK MRI-JNG',
      d: 'M 310.2 703.5 L 474.5 703.5',
      color: '#00ffff',
      startDivider: { type: 'KM', label: 'KM 1+599', km: 'KM 1+599' },
      endDivider: { type: 'AS', label: 'Air Section (AS KM 1+854)', km: 'KM 1+854' },
    },
    {
      id: 'mri_jng_hu_naspan1',
      code: 'JNG-MRI NASPAN 1 HU',
      title: 'JNG-MRI NASPAN 1 HU (KM 11+400 - KM 11+880)',
      km: 'KM 1+854 - KM 2+123',
      category: 'ST. JATINEGARA (BARAT)',
      d: 'M 486.4 703.5 L 728.9 703.5',
      color: '#ff00ff',
      startDivider: { type: 'AS', label: 'Air Section (AS KM 1+854)', km: 'KM 1+854' },
      endDivider: { type: 'DS', label: 'DS 2 (NO) JNG-MRI (HU)', km: 'KM 2+123' },
    },
    {
      id: 'jng_jalur_8',
      code: 'JALUR 8 JNG',
      title: 'ST. JATINEGARA (Jalur 8 Peron Utama)',
      km: 'KM 11+700 - KM 11+800',
      category: 'ST. JATINEGARA',
      d: 'M 991.5 322.4 L 1421.8 322.4',
      color: '#139a47',
      startDivider: { type: 'WESEL', label: 'Wesel W81C (KM 11+700)', km: 'KM 11+700' },
      endDivider: { type: 'WESEL', label: 'Wesel W83A1 (KM 11+800)', km: 'KM 11+800' },
    },
    {
      id: 'jng_jalur_7',
      code: 'JALUR 7 JNG',
      title: 'ST. JATINEGARA (Jalur 7)',
      km: 'KM 11+200 - KM 11+800',
      category: 'ST. JATINEGARA',
      d: 'M 601.1 370.5 L 1477.3 370.5',
      color: '#139a47',
      startDivider: { type: 'AS', label: 'Overlap Air Section (AS KM 11+200)', km: 'KM 11+200' },
      endDivider: { type: 'WESEL', label: 'Wesel W83A1 / FRP-JNG-10', km: 'KM 11+800' },
    },
    {
      id: 'jng_jalur_6',
      code: 'JALUR 6 JNG',
      title: 'ST. JATINEGARA (Jalur 6)',
      km: 'KM 11+200 - KM 11+800',
      category: 'ST. JATINEGARA',
      d: 'M 599.5 418.0 L 1452.8 418.0',
      color: '#cc6827',
      startDivider: { type: 'AS', label: 'Overlap Air Section (AS KM 11+200)', km: 'KM 11+200' },
      endDivider: { type: 'WESEL', label: 'Wesel W63A', km: 'KM 11+800' },
    },
    {
      id: 'jng_jalur_5',
      code: 'JALUR 5 JNG',
      title: 'ST. JATINEGARA (Jalur 5)',
      km: 'KM 11+500 - KM 11+800',
      category: 'ST. JATINEGARA',
      d: 'M 991.5 465.6 L 1483.8 465.6',
      color: '#cc6827',
      startDivider: { type: 'WESEL', label: 'Wesel W41B / FRP-JNG-06-41B', km: 'KM 11+500' },
      endDivider: { type: 'WESEL', label: 'Wesel W63A', km: 'KM 11+800' },
    },
    {
      id: 'jng_jalur_4',
      code: 'JALUR 4 JNG',
      title: 'ST. JATINEGARA (Jalur 4)',
      km: 'KM 11+500 - KM 11+800',
      category: 'ST. JATINEGARA',
      d: 'M 828.5 512.7 L 1461.9 512.7',
      color: '#cc6827',
      startDivider: { type: 'WESEL', label: 'Wesel W21C2', km: 'KM 11+500' },
      endDivider: { type: 'WESEL', label: 'Wesel W83A2', km: 'KM 11+800' },
    },
    {
      id: 'jng_jalur_4_ext',
      code: 'JALUR 4 JNG',
      title: 'Jalur 4 Lanjutan Emplasemen Timur JNG',
      km: 'KM 11+850 - KM 12+100',
      category: 'ST. JATINEGARA',
      d: 'M 1568.0 512.7 L 1718.7 512.7',
      color: '#139a47',
      startDivider: { type: 'WESEL', label: 'Wesel W83A1', km: 'KM 11+850' },
      endDivider: { type: 'FRP', label: 'FRP-JNG-10-JALUR 4', km: 'KM 12+089' },
    },
    {
      id: 'jng_jalur_w21a2_mid',
      code: 'JALUR W21A2',
      title: 'Jalur Antara Wesel W21A2 Emplasemen Barat JNG',
      km: 'KM 11+500 - KM 11+600',
      category: 'ST. JATINEGARA (EMPLASEMEN BARAT)',
      d: 'M 611.9 560.0 L 796.5 560.0',
      color: '#cc6827',
      startDivider: { type: 'WESEL', label: 'Wesel W21A2 Barat', km: 'KM 11+500' },
      endDivider: { type: 'FRP', label: 'FRP-JNG-03-21A2', km: 'KM 11+600' },
    },
    {
      id: 'jng_jalur_mid_timur',
      code: 'JALUR W23B',
      title: 'Jalur Wesel 23B JNG Emplasemen Timur',
      km: 'KM 11+880 - KM 12+000',
      category: 'ST. JATINEGARA',
      d: 'M 1489.8 560.5 L 1628.4 560.5',
      color: '#cc6827',
      startDivider: { type: 'WESEL', label: 'Wesel W83A2 / W23B1', km: 'KM 11+880' },
      endDivider: { type: 'FRP', label: 'FRP-JNG-11-23B2', km: 'KM 12+000' },
    },
    {
      id: 'jng_jalur_mid_green',
      code: 'JALUR W23C',
      title: 'Jalur Wesel 23C JNG Emplasemen Timur',
      km: 'KM 12+000 - KM 12+100',
      category: 'ST. JATINEGARA',
      d: 'M 1634.0 560.5 L 1768.5 560.5',
      color: '#139a47',
      startDivider: { type: 'WESEL', label: 'Wesel W23C1', km: 'KM 12+000' },
      endDivider: { type: 'KM', label: 'KM 12+235', km: 'KM 12+235' },
    },
    {
      id: 'jng_jalur_mid_rust',
      code: 'JALUR BARAT JNG',
      title: 'Jalur Antara Barat JNG (KM 11+600)',
      km: 'KM 11+600',
      category: 'ST. JATINEGARA (EMPLASEMEN BARAT)',
      d: 'M 611.7 605.6 L 790.6 605.6',
      color: '#cc6827',
      startDivider: { type: 'KM', label: 'KM 1+049', km: 'KM 1+049' },
      endDivider: { type: 'WESEL', label: 'Wesel W11B1', km: 'KM 11+600' },
    },
    {
      id: 'jng_jalur_3',
      code: 'JALUR 3 JNG',
      title: 'ST. JATINEGARA (Jalur 3)',
      km: 'KM 11+600 - KM 11+900',
      category: 'ST. JATINEGARA',
      d: 'M 796.4 606.0 L 1475.4 606.0',
      color: '#f8d731',
      startDivider: { type: 'WESEL', label: 'Wesel W11B1', km: 'KM 11+600' },
      endDivider: { type: 'DS', label: 'DS 5 (NC) JALUR 2,3', km: 'KM 11+900' },
    },
    {
      id: 'jng_jalur_3_ext',
      code: 'JALUR 3 JNG',
      title: 'Jalur 3 Lanjutan Emplasemen Timur JNG / Wesel 13',
      km: 'KM 11+900 - KM 12+384',
      category: 'ST. JATINEGARA',
      d: 'M 1487.4 607.6 L 1822.6 607.6',
      color: '#f8d731',
      startDivider: { type: 'DS', label: 'DS 5 (NC) JALUR 2,3', km: 'KM 11+900' },
      endDivider: { type: 'KM', label: 'KM 12+384', km: 'KM 12+384' },
    },
    {
      id: 'jng_jalur_2',
      code: 'JALUR 2 JNG',
      title: 'ST. JATINEGARA (Jalur 2)',
      km: 'KM 11+500 - KM 11+900',
      category: 'ST. JATINEGARA',
      d: 'M 740.6 656.1 L 1475.1 656.1',
      color: '#f8d731',
      startDivider: { type: 'WESEL', label: 'Wesel W11A', km: 'KM 11+500' },
      endDivider: { type: 'AS', label: 'Overlap Air Section (AS KM 11+900)', km: 'KM 11+900' },
    },
    {
      id: 'jng_jalur_1',
      code: 'JALUR 1 JNG',
      title: 'ST. JATINEGARA (Jalur 1)',
      km: 'KM 11+500 - KM 11+900',
      category: 'ST. JATINEGARA',
      d: 'M 740.4 703.5 L 1475.3 703.5',
      color: '#ff00ff',
      startDivider: { type: 'WESEL', label: 'Wesel W51A', km: 'KM 11+500' },
      endDivider: { type: 'AS', label: 'Overlap Air Section (AS KM 11+900)', km: 'KM 11+900' },
    },
    {
      id: 'naspan_1_arah_kld_hi',
      code: 'NASPAN 1 ARAH KLD HI',
      title: 'NASPAN 1 ARAH KLD HI (AS KM 11+900 s/d DS 7 KM 12+500)',
      km: 'KM 11+900 - KM 12+500',
      category: 'PETAK JNG-KLD',
      d: 'M 1487.0 656.0 L 1931.3 656.0',
      color: '#f8d731',
      startDivider: { type: 'AS', label: 'Overlap Air Section (AS KM 11+900)', km: 'KM 11+900' },
      endDivider: { type: 'DS', label: 'DS 7 (NO) KLD-JNG HI', km: 'KM 12+500' },
    },
    {
      id: 'naspan_2_jng_kld_hi',
      code: 'NASPAN 2 JNG-KLD HI',
      title: 'NASPAN 2 JNG-KLD HI (DS 7 s/d AJ KM 13+300)',
      km: 'KM 12+500 - KM 13+300',
      category: 'PETAK JNG-KLD',
      d: 'M 1967.2 655.8 L 2086.4 655.8',
      color: '#0000ff',
      startDivider: { type: 'DS', label: 'DS 7 (NO) KLD-JNG HI', km: 'KM 12+500' },
      endDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ KM 13+300)', km: 'KM 13+300' },
    },
    {
      id: 'naspan_3_jng_kld_hi',
      code: 'NASPAN 3 JNG-KLD HI',
      title: 'NASPAN 3 JNG-KLD HI (AJ KM 13+300 s/d AJ KM 14+100)',
      km: 'KM 13+300 - KM 14+100',
      category: 'PETAK JNG-KLD',
      d: 'M 2086.4 655.8 L 2161.3 655.8',
      color: '#0000ff',
      startDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ KM 13+300)', km: 'KM 13+300' },
      endDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ KM 14+100)', km: 'KM 14+100' },
    },
    {
      id: 'naspan_4_jng_kld_hi',
      code: 'NASPAN 4 JNG-KLD HI',
      title: 'NASPAN 4 JNG-KLD HI (AJ KM 14+100 s/d AJ KM 14+700)',
      km: 'KM 14+100 - KM 14+700',
      category: 'PETAK JNG-KLD',
      d: 'M 2161.3 655.3 L 2249.6 655.3',
      color: '#0000ff',
      startDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ KM 14+100)', km: 'KM 14+100' },
      endDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ KM 14+700)', km: 'KM 14+700' },
    },
    {
      id: 'naspan_4b_kld_bua_hi',
      code: 'NASPAN 4B KLD-BUA HI',
      title: 'NASPAN 4B KLD-BUA HI (AJ KM 14+700 s/d AS KM 15+450)',
      km: 'KM 14+700 - KM 15+450',
      category: 'PETAK KLD-BUA',
      d: 'M 2249.6 655.3 L 2518.8 655.3',
      color: '#0000ff',
      startDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ KM 14+700)', km: 'KM 14+700' },
      endDivider: { type: 'AS', label: 'Overlap Air Section (AS KM 15+450)', km: 'KM 15+450' },
    },
    {
      id: 'naspan_5_kld_bua_hi',
      code: 'NASPAN 5 KLD-BUA HI',
      title: 'NASPAN 5 KLD-BUA HI (AS KM 15+450 s/d AJ KM 16+500)',
      km: 'KM 15+450 - KM 16+500',
      category: 'PETAK KLD-BUA',
      d: 'M 2518.8 656.1 L 2635.0 656.1',
      color: '#ff00ff',
      startDivider: { type: 'AS', label: 'Overlap Air Section (AS KM 15+450)', km: 'KM 15+450' },
      endDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ KM 16+500)', km: 'KM 16+500' },
    },
    {
      id: 'naspan_6_kld_bua_hi',
      code: 'NASPAN 6 KLD-BUA HI',
      title: 'NASPAN 6 KLD-BUA HI (AJ KM 16+500 s/d AS KM 17+239)',
      km: 'KM 16+500 - KM 17+239',
      category: 'PETAK KLD-BUA',
      d: 'M 2635.0 655.5 L 2740.0 655.5',
      color: '#ff00ff',
      startDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ KM 16+500)', km: 'KM 16+500' },
      endDivider: { type: 'AS', label: 'Overlap Air Section (AS KM 17+239)', km: 'KM 17+239' },
    },
    {
      id: 'naspan_7_bua_kldb_hi',
      code: 'NASPAN 7 BUA-KLDB HI',
      title: 'NASPAN 7 BUA-KLDB HI (AS KM 17+239 s/d DS 9 KM 17+900)',
      km: 'KM 17+239 - KM 17+900',
      category: 'PETAK BUA-KLDB',
      d: 'M 2740.0 655.5 L 2985.7 655.5',
      color: '#f8d731',
      startDivider: { type: 'AS', label: 'Overlap Air Section (AS KM 17+239)', km: 'KM 17+239' },
      endDivider: { type: 'DS', label: 'DS 9 (NC) KLDB-BUA HI', km: 'KM 17+900' },
    },
    {
      id: 'naspan_7b_bua_kldb_hi',
      code: 'NASPAN 7B BUA-KLDB HI',
      title: 'NASPAN 7B BUA-KLDB HI (DS 9 s/d AJ KM 18+800)',
      km: 'KM 17+900 - KM 18+800',
      category: 'PETAK BUA-KLDB',
      d: 'M 2985.7 655.3 L 3098.5 655.3',
      color: '#f8d731',
      startDivider: { type: 'DS', label: 'DS 9 (NC) KLDB-BUA HI', km: 'KM 17+900' },
      endDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ KM 18+800)', km: 'KM 18+800' },
    },
    {
      id: 'loop_menurun_bua_kldb_hilir',
      code: 'LOOP BUA-KLDB HI',
      title: 'Jalur Menurun Loop Buaran - Klender Baru (Hilir / Luar)',
      km: 'KM 18+800 - KM 19+300',
      category: 'TIKUNGAN LOOP BUA-KLDB',
      d: 'M 3098.5 655.3 L 3122.8 655.3',
      color: '#f8d731',
      startDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ KM 18+800)', km: 'KM 18+800' },
      endDivider: { type: 'TIKUNGAN', label: 'Tikungan Menurun Hilir', km: 'KM 19+000' },
    },
    {
      id: 'naspan_1_arah_kld_hu',
      code: 'NASPAN 1 ARAH KLD HU',
      title: 'NASPAN 1 ARAH KLD HU (DS 6 s/d DS 8 KM 12+500)',
      km: 'KM 11+900 - KM 12+500',
      category: 'PETAK JNG-KLD',
      d: 'M 1487.2 703.5 L 1932.2 703.5',
      color: '#ff00ff',
      startDivider: { type: 'DS', label: 'DS 6 (NC) JALUR 1', km: 'KM 11+900' },
      endDivider: { type: 'DS', label: 'DS 8 (NO) JNG-KLD HU', km: 'KM 12+500' },
    },
    {
      id: 'naspan_2_jng_kld_hu',
      code: 'NASPAN 2 JNG-KLD',
      title: 'NASPAN 2 JNG-KLD (DS 8 s/d AJ KM 13+300)',
      km: 'KM 12+500 - KM 13+300',
      category: 'PETAK JNG-KLD',
      d: 'M 1967.9 703.5 L 2086.4 703.5',
      color: '#ff9f7f',
      startDivider: { type: 'DS', label: 'DS 8 (NO) JNG-KLD HU', km: 'KM 12+500' },
      endDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ KM 13+300)', km: 'KM 13+300' },
    },
    {
      id: 'naspan_3_jng_kld_hu',
      code: 'NASPAN 3 JNG-KLD',
      title: 'NASPAN 3 JNG-KLD (AJ KM 13+300 s/d AJ KM 14+100)',
      km: 'KM 13+300 - KM 14+100',
      category: 'PETAK JNG-KLD',
      d: 'M 2086.4 703.5 L 2161.3 703.5',
      color: '#ff9f7f',
      startDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ KM 13+300)', km: 'KM 13+300' },
      endDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ KM 14+100)', km: 'KM 14+100' },
    },
    {
      id: 'naspan_4_jng_kld_hu',
      code: 'NASPAN 4 JNG-KLD',
      title: 'NASPAN 4 JNG-KLD (AJ KM 14+100 s/d AJ KM 14+700)',
      km: 'KM 14+100 - KM 14+700',
      category: 'PETAK JNG-KLD',
      d: 'M 2161.3 703.0 L 2249.6 703.0',
      color: '#ff9f7f',
      startDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ KM 14+100)', km: 'KM 14+100' },
      endDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ KM 14+700)', km: 'KM 14+700' },
    },
    {
      id: 'naspan_4b_kld_bua_hu',
      code: 'NASPAN 4B KLD-BUA',
      title: 'NASPAN 4B KLD-BUA (AJ KM 14+700 s/d AS KM 15+450)',
      km: 'KM 14+700 - KM 15+450',
      category: 'PETAK KLD-BUA',
      d: 'M 2249.6 703.0 L 2518.8 703.0',
      color: '#ff9f7f',
      startDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ KM 14+700)', km: 'KM 14+700' },
      endDivider: { type: 'AS', label: 'Overlap Air Section (AS KM 15+450)', km: 'KM 15+450' },
    },
    {
      id: 'naspan_5_kld_bua_hu',
      code: 'NASPAN 5 KLD-BUA',
      title: 'NASPAN 5 KLD-BUA (AS KM 15+450 s/d AJ KM 16+500)',
      km: 'KM 15+450 - KM 16+500',
      category: 'PETAK KLD-BUA',
      d: 'M 2518.8 703.9 L 2635.0 703.9',
      color: '#00ff00',
      startDivider: { type: 'AS', label: 'Overlap Air Section (AS KM 15+450)', km: 'KM 15+450' },
      endDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ KM 16+500)', km: 'KM 16+500' },
    },
    {
      id: 'naspan_6_kld_bua_hu',
      code: 'NASPAN 6 KLD-BUA',
      title: 'NASPAN 6 KLD-BUA (AJ KM 16+500 s/d AS KM 17+239)',
      km: 'KM 16+500 - KM 17+239',
      category: 'PETAK KLD-BUA',
      d: 'M 2635.0 703.4 L 2740.0 703.4',
      color: '#00ff00',
      startDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ KM 16+500)', km: 'KM 16+500' },
      endDivider: { type: 'AS', label: 'Overlap Air Section (AS KM 17+239)', km: 'KM 17+239' },
    },
    {
      id: 'naspan_7_bua_kldb_hu',
      code: 'NASPAN 7 BUA-KLDB',
      title: 'NASPAN 7 BUA-KLDB (AS KM 17+239 s/d DS 10 KM 17+900)',
      km: 'KM 17+239 - KM 17+900',
      category: 'PETAK BUA-KLDB',
      d: 'M 2740.0 703.3 L 2985.7 703.3',
      color: '#ff0000',
      startDivider: { type: 'AS', label: 'Overlap Air Section (AS KM 17+239)', km: 'KM 17+239' },
      endDivider: { type: 'DS', label: 'DS 10 (NC) BUA-KLDB HU', km: 'KM 17+900' },
    },
    {
      id: 'naspan_7b_bua_kldb_hu',
      code: 'NASPAN 7B BUA-KLDB',
      title: 'NASPAN 7B BUA-KLDB (DS 10 s/d AJ KM 18+800)',
      km: 'KM 17+900 - KM 18+800',
      category: 'PETAK BUA-KLDB',
      d: 'M 2985.7 703.0 L 3098.5 703.0',
      color: '#ff0000',
      startDivider: { type: 'DS', label: 'DS 10 (NC) BUA-KLDB HU', km: 'KM 17+900' },
      endDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ KM 18+800)', km: 'KM 18+800' },
    },
    {
      id: 'loop_menurun_bua_kldb_hulu',
      code: 'LOOP BUA-KLDB HU',
      title: 'Jalur Menurun Loop Buaran - Klender Baru (Hulu / Dalam)',
      km: 'KM 18+800 - KM 19+300',
      category: 'TIKUNGAN LOOP BUA-KLDB',
      d: 'M 3098.5 703.0 L 3112.5 703.0',
      color: '#ff0000',
      startDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ KM 18+800)', km: 'KM 18+800' },
      endDivider: { type: 'TIKUNGAN', label: 'Tikungan Menurun Hulu', km: 'KM 19+000' },
    },
    {
      id: 'naspan_8b_kldb_cuk_hi',
      code: 'NASPAN 8B KLDB-CUK HI',
      title: 'NASPAN 8B KLDB-CUK HI (AJ KM 19+300 s/d DS 11 KM 20+150)',
      km: 'KM 19+300 - KM 20+150',
      category: 'PETAK KLDB-CUK',
      d: 'M 3046.7 1112.4 L 2824.4 1112.2',
      color: '#f8d731',
      startDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ KM 19+300)', km: 'KM 19+300' },
      endDivider: { type: 'DS', label: 'DS 11 (NO) CUK-KLDB HI', km: 'KM 20+150' },
    },
    {
      id: 'naspan_8b_kldb_cuk_hu',
      code: 'NASPAN 8B KLDB-CUK',
      title: 'NASPAN 8B KLDB-CUK (AJ KM 19+300 s/d DS 12 KM 20+150)',
      km: 'KM 19+300 - KM 20+150',
      category: 'PETAK KLDB-CUK',
      d: 'M 3046.7 1064.5 L 2818.6 1064.5',
      color: '#ff0000',
      startDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ KM 19+300)', km: 'KM 19+300' },
      endDivider: { type: 'DS', label: 'DS 12 (NO) KLDB-CUK HU', km: 'KM 20+150' },
    },
    {
      id: 'cuk_jalur_1_empl',
      code: 'NASPAN 9 EMPL CUK',
      title: 'ST. CAKUNG (Emplasemen Jalur 1 Hulu)',
      km: 'KM 20+150 - KM 21+400',
      category: 'ST. CAKUNG',
      d: 'M 2342.0 1062.2 L 2806.7 1062.2',
      color: '#8a6ddd',
      startDivider: { type: 'AS', label: 'Overlap Air Section (AS KM 20+150)', km: 'KM 20+150' },
      endDivider: { type: 'AS', label: 'Overlap Air Section (AS KM 21+400)', km: 'KM 21+400' },
    },
    {
      id: 'cuk_jalur_1_peron',
      code: 'NASPAN 9 EMPL CUK',
      title: 'ST. CAKUNG (Jalur 1 Atas Peron)',
      km: 'KM 20+900 - KM 21+000',
      category: 'ST. CAKUNG',
      d: 'M 2453.3 1022.1 L 2583.0 1022.1',
      color: '#8a6ddd',
      startDivider: { type: 'WESEL', label: 'Wesel W13A', km: 'KM 20+900' },
      endDivider: { type: 'WESEL', label: 'Wesel W11B', km: 'KM 21+000' },
    },
    {
      id: 'cuk_jalur_4_empl',
      code: 'NASPAN 9 EMPL CUK',
      title: 'ST. CAKUNG (Emplasemen Jalur 4 Hilir)',
      km: 'KM 20+150 - KM 21+400',
      category: 'ST. CAKUNG',
      d: 'M 2343.3 1112.0 L 2811.4 1112.0',
      color: '#cc6827',
      startDivider: { type: 'AS', label: 'Overlap Air Section (AS KM 20+150)', km: 'KM 20+150' },
      endDivider: { type: 'AS', label: 'Overlap Air Section (AS KM 21+400)', km: 'KM 21+400' },
    },
    {
      id: 'cuk_jalur_4_peron',
      code: 'NASPAN 9 EMPL CUK',
      title: 'ST. CAKUNG (Jalur 4 Bawah Peron)',
      km: 'KM 20+900 - KM 21+000',
      category: 'ST. CAKUNG',
      d: 'M 2452.2 1153.9 L 2583.0 1153.9',
      color: '#cc6827',
      startDivider: { type: 'WESEL', label: 'Wesel W23A', km: 'KM 20+900' },
      endDivider: { type: 'WESEL', label: 'Wesel W21B', km: 'KM 21+000' },
    },
    {
      id: 'naspan_10_cuk_kri_hu',
      code: 'NASPAN 10 CUK-KRI',
      title: 'NASPAN 10 CUK-KRI (DS 14 s/d AJ KM 22+700)',
      km: 'KM 21+400 - KM 22+700',
      category: 'PETAK CUK-KRI',
      d: 'M 2217.3 1062.2 L 2330.6 1062.2',
      color: '#8a6ddd',
      startDivider: { type: 'DS', label: 'DS 14 (NC) CUK-KRI HU', km: 'KM 21+400' },
      endDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ KM 22+700)', km: 'KM 22+700' },
    },
    {
      id: 'naspan_11_cuk_kri_hu',
      code: 'NASPAN 11 CUK-KRI',
      title: 'NASPAN 11 CUK-KRI (AJ KM 22+700 s/d DS 16 KM 23+600)',
      km: 'KM 22+700 - KM 23+600',
      category: 'PETAK CUK-KRI',
      d: 'M 2071.8 1062.0 L 2205.4 1062.0',
      color: '#8a6ddd',
      startDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ KM 22+700)', km: 'KM 22+700' },
      endDivider: { type: 'DS', label: 'DS 16 (NC) KM 23+600', km: 'KM 23+600' },
    },
    {
      id: 'naspan_12_kri_bks_hu',
      code: 'NASPAN 12 KRI-BKS',
      title: 'NASPAN 12 KRI-BKS (DS 16 s/d AJ KM 24+500)',
      km: 'KM 23+600 - KM 24+500',
      category: 'PETAK KRI-BKS',
      d: 'M 1824.3 1063.2 L 2060.8 1063.2',
      color: '#ff00ff',
      startDivider: { type: 'DS', label: 'DS 16 KM 23+600', km: 'KM 23+600' },
      endDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ KM 24+500)', km: 'KM 24+500' },
    },
    {
      id: 'naspan_13_kri_bks_hu',
      code: 'NASPAN 13 KRI-BKS',
      title: 'NASPAN 13 KRI-BKS (AJ KM 24+500 s/d AJ KM 25+300)',
      km: 'KM 24+500 - KM 25+300',
      category: 'PETAK KRI-BKS',
      d: 'M 1754.0 1063.0 L 1809.6 1063.0',
      color: '#ff00ff',
      startDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ KM 24+500)', km: 'KM 24+500' },
      endDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ KM 25+300)', km: 'KM 25+300' },
    },
    {
      id: 'naspan_13b_kri_bks_hu',
      code: 'NASPAN 13B KRI-BKS',
      title: 'NASPAN 13B KRI-BKS (AJ KM 25+300 s/d AS KM 25+750)',
      km: 'KM 25+300 - KM 25+750',
      category: 'PETAK KRI-BKS',
      d: 'M 1641.5 1063.0 L 1740.5 1063.0',
      color: '#ff00ff',
      startDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ KM 25+300)', km: 'KM 25+300' },
      endDivider: { type: 'AS', label: 'Overlap Air Section (AS KM 25+750)', km: 'KM 25+750' },
    },
    {
      id: 'naspan_10_cuk_kri_hi',
      code: 'NASPAN 10 CUK-KRI HI',
      title: 'NASPAN 10 CUK-KRI HI (DS 13 s/d AJ KM 22+700)',
      km: 'KM 21+400 - KM 22+700',
      category: 'PETAK CUK-KRI',
      d: 'M 2221.0 1112.0 L 2331.4 1112.0',
      color: '#cc6827',
      startDivider: { type: 'DS', label: 'DS 13 (NC) KRI-CUK HI', km: 'KM 21+400' },
      endDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ KM 22+700)', km: 'KM 22+700' },
    },
    {
      id: 'naspan_11_cuk_kri_hi',
      code: 'NASPAN 11 CUK-KRI HI',
      title: 'NASPAN 11 CUK-KRI HI (AJ KM 22+700 s/d DS 15 KM 23+600)',
      km: 'KM 22+700 - KM 23+600',
      category: 'PETAK CUK-KRI',
      d: 'M 2065.5 1112.0 L 2207.0 1112.0',
      color: '#cc6827',
      startDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ KM 22+700)', km: 'KM 22+700' },
      endDivider: { type: 'DS', label: 'DS 15 (NC) KM 23+600', km: 'KM 23+600' },
    },
    {
      id: 'naspan_12_kri_bks_hi',
      code: 'NASPAN 12 KRI-BKS HI',
      title: 'NASPAN 12 KRI-BKS HI (DS 15 s/d AJ KM 24+500)',
      km: 'KM 23+600 - KM 24+500',
      category: 'PETAK KRI-BKS',
      d: 'M 1751.6 1111.6 L 2050.8 1111.6',
      color: '#00bfff',
      startDivider: { type: 'DS', label: 'DS 15 KM 23+600', km: 'KM 23+600' },
      endDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ KM 24+500)', km: 'KM 24+500' },
    },
    {
      id: 'naspan_13_kri_bks_hi',
      code: 'NASPAN 13 KRI-BKS HI',
      title: 'NASPAN 13 KRI-BKS HI (AJ KM 24+500 s/d AS KM 25+750)',
      km: 'KM 24+500 - KM 25+750',
      category: 'PETAK KRI-BKS',
      d: 'M 1638.8 1112.8 L 1739.6 1112.8',
      color: '#00bfff',
      startDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ KM 25+300)', km: 'KM 25+300' },
      endDivider: { type: 'AS', label: 'Overlap Air Section (AS KM 25+750)', km: 'KM 25+750' },
    },
    {
      id: 'bks_jalur_simpan_960',
      code: 'ST. BEKASI',
      title: 'Jalur Stabling / Simpan Atas St. Bekasi',
      km: 'KM 26+200 - KM 26+500',
      category: 'ST. BEKASI (STABLING)',
      d: 'M 934.0 960.1 L 1256.6 960.1',
      color: '#139a47',
      startDivider: { type: 'WESEL', label: 'Wesel W71C', km: 'KM 26+200' },
      endDivider: { type: 'END', label: 'Ujung Jalur Simpan', km: 'KM 26+500' },
    },
    {
      id: 'bks_jalur_simpan_1012',
      code: 'ST. BEKASI',
      title: 'ST. BEKASI (Jalur 4 Langsir & Stabling)',
      km: 'KM 26+150 - KM 26+500',
      category: 'ST. BEKASI (STABLING)',
      d: 'M 838.4 1011.6 L 1299.2 1011.6',
      color: '#139a47',
      startDivider: { type: 'WESEL', label: 'Wesel W71C1', km: 'KM 26+150' },
      endDivider: { type: 'WESEL', label: 'FRP-JNG-26-73', km: 'KM 26+500' },
    },
    {
      id: 'bks_jalur_1_end',
      code: 'ST. BEKASI',
      title: 'Jalur 1 Ujung Barat Bekasi (Arah Bekasi Timur)',
      km: 'KM 26+900 - KM 27+200',
      category: 'ST. BEKASI',
      d: 'M 460.4 1063.8 L 592.6 1063.8',
      color: '#139a47',
      startDivider: { type: 'AS', label: 'Overlap Air Section (AS KM 26+900)', km: 'KM 26+900' },
      endDivider: { type: 'WESEL', label: 'Wesel Masuk Bekasi Timur', km: 'KM 27+200' },
    },
    {
      id: 'bks_jalur_1_platform',
      code: 'ST. BEKASI',
      title: 'ST. BEKASI (Jalur 1 Peron Utama Hulu)',
      km: 'KM 25+750 - KM 26+900',
      category: 'ST. BEKASI',
      d: 'M 605.9 1063.8 L 1626.3 1063.8',
      color: '#139a47',
      startDivider: { type: 'AS', label: 'Overlap Air Section (AS KM 26+900)', km: 'KM 26+900' },
      endDivider: { type: 'AS', label: 'Overlap Air Section (AS KM 25+750)', km: 'KM 25+750' },
    },
    {
      id: 'bks_jalur_2_west',
      code: 'ST. BEKASI',
      title: 'Jalur 2 Ujung Barat Bekasi (Arah Bekasi Timur)',
      km: 'KM 26+900 - KM 27+200',
      category: 'ST. BEKASI',
      d: 'M 505.0 1112.6 L 592.1 1112.6',
      color: '#ec1f24',
      startDivider: { type: 'AS', label: 'Overlap Air Section (AS KM 26+900)', km: 'KM 26+900' },
      endDivider: { type: 'WESEL', label: 'Wesel Masuk Bekasi Timur', km: 'KM 27+200' },
    },
    {
      id: 'bks_jalur_2_platform',
      code: 'ST. BEKASI',
      title: 'ST. BEKASI (Jalur 2 Peron Utama Hilir)',
      km: 'KM 25+750 - KM 26+900',
      category: 'ST. BEKASI',
      d: 'M 603.8 1112.6 L 1625.3 1112.6',
      color: '#ff0000',
      startDivider: { type: 'AS', label: 'Overlap Air Section (AS KM 26+900)', km: 'KM 26+900' },
      endDivider: { type: 'AS', label: 'Overlap Air Section (AS KM 25+750)', km: 'KM 25+750' },
    },
    {
      id: 'bks_jalur_3_platform',
      code: 'ST. BEKASI',
      title: 'ST. BEKASI (Jalur 3 Peron)',
      km: 'KM 26+150 - KM 26+600',
      category: 'ST. BEKASI',
      d: 'M 737.6 1174.0 L 1372.0 1174.0',
      color: '#ec1f24',
      startDivider: { type: 'WESEL', label: 'Wesel W31B', km: 'KM 26+150' },
      endDivider: { type: 'WESEL', label: 'Wesel W33A', km: 'KM 26+600' },
    },
    {
      id: 'bks_timur_1228_grn',
      code: 'BEKASI TIMUR',
      title: 'Emplasemen Percabangan Bekasi Timur 1',
      km: 'KM 27+000 - KM 27+300',
      category: 'BEKASI TIMUR',
      d: 'M 260.3 1227.8 L 399.2 1227.8',
      color: '#139a47',
      startDivider: { type: 'KM', label: 'KM 27+300', km: 'KM 27+300' },
      endDivider: { type: 'WESEL', label: 'Wesel W13C', km: 'KM 27+000' },
    },
    {
      id: 'bks_timur_1228_red',
      code: 'BEKASI TIMUR',
      title: 'Emplasemen Percabangan Bekasi Timur 2',
      km: 'KM 26+900 - KM 27+000',
      category: 'BEKASI TIMUR',
      d: 'M 404.9 1227.8 L 485.6 1227.8',
      color: '#ec1f24',
      startDivider: { type: 'WESEL', label: 'Wesel W13C', km: 'KM 27+000' },
      endDivider: { type: 'KM', label: 'KM 26+900', km: 'KM 26+900' },
    },
    {
      id: 'bks_timur_1277_red',
      code: 'BEKASI TIMUR',
      title: 'Emplasemen Percabangan Bekasi Timur 3 (Hilir)',
      km: 'KM 26+900 - KM 27+300',
      category: 'BEKASI TIMUR',
      d: 'M 260.3 1277.5 L 485.6 1277.5',
      color: '#ec1f24',
      startDivider: { type: 'KM', label: 'KM 27+300', km: 'KM 27+300' },
      endDivider: { type: 'KM', label: 'KM 26+900', km: 'KM 26+900' },
    },
    {
      id: 'gt_bks_feeder_2',
      code: 'GARDU TRAKSI BEKASI',
      title: 'Feeder Vertikal GT Bekasi 2 (Jalur 2)',
      km: 'KM 26+270',
      category: 'GARDU TRAKSI BEKASI',
      d: 'M 1261.6 1255.8 L 1261.6 1112.6',
      color: '#ff0000',
      isCrossing: true,
      startDivider: { type: 'DS', label: 'DS 18 GT BKS', km: 'KM 26+270' },
      endDivider: { type: 'JALUR', label: 'Jalur 2 Peron BKS', km: 'KM 26+270' },
    },
    {
      id: 'gt_bks_feeder_3',
      code: 'GARDU TRAKSI BEKASI',
      title: 'Feeder Vertikal GT Bekasi 4 (Jalur 3)',
      km: 'KM 26+270',
      category: 'GARDU TRAKSI BEKASI',
      d: 'M 1265.3 1255.8 L 1265.3 1174.0',
      color: '#ec1f24',
      isCrossing: true,
      startDivider: { type: 'DS', label: 'DS 20 GT BKS', km: 'KM 26+270' },
      endDivider: { type: 'JALUR', label: 'Jalur 3 Peron BKS', km: 'KM 26+270' },
    },
    {
      id: 'wesel_w81a1_654',
      code: 'WESEL W81A1',
      title: 'Wesel W81A1 (KM 11+292)',
      km: 'KM 11+292',
      category: 'ST. JATINEGARA (EMPLASEMEN BARAT)',
      d: 'M 654.3 370.4 L 668.2 381.6',
      color: '#139a47',
      isCrossing: true,
      startDivider: { type: 'WESEL', label: 'Wesel W81A1', km: 'KM 11+292' },
      endDivider: { type: 'FRP', label: '( Section Insulator (FRP-JNG-08-81A1) )', km: 'KM 11+350' },
    },
    {
      id: 'wesel_w81a2_713',
      code: 'WESEL W81A2',
      title: 'Wesel W81A2 (KM 11+448)',
      km: 'KM 11+448',
      category: 'ST. JATINEGARA (EMPLASEMEN BARAT)',
      d: 'M 713.7 370.4 L 699.5 381.7',
      color: '#139a47',
      isCrossing: true,
      startDivider: { type: 'WESEL', label: 'Wesel W81A2', km: 'KM 11+448' },
      endDivider: { type: 'FRP', label: '( Section Insulator (FRP-JNG-09-81A2) )', km: 'KM 11+350' },
    },
    {
      id: 'wesel_w61a2_672',
      code: 'WESEL W61A2',
      title: 'Wesel Crossover W61A2 / W81A (KM 11+350)',
      km: 'KM 11+350',
      category: 'ST. JATINEGARA (EMPLASEMEN BARAT)',
      d: 'M 672.4 384.9 L 713.7 417.8',
      color: '#cc6827',
      isCrossing: true,
      startDivider: { type: 'FRP', label: '( Section Insulator (FRP-JNG-08-81A1) )', km: 'KM 11+350' },
      endDivider: { type: 'WESEL', label: 'Wesel W61A2', km: 'KM 11+448' },
    },
    {
      id: 'wesel_w61a1_695',
      code: 'WESEL W61A1',
      title: 'Wesel Crossover W61A1 / W81A (KM 11+350)',
      km: 'KM 11+350',
      category: 'ST. JATINEGARA (EMPLASEMEN BARAT)',
      d: 'M 695.3 385.0 L 654.3 417.8',
      color: '#cc6827',
      isCrossing: true,
      startDivider: { type: 'WESEL', label: 'Wesel W61A1', km: 'KM 11+292' },
      endDivider: { type: 'FRP', label: '( Section Insulator (FRP-JNG-09-81A2) )', km: 'KM 11+350' },
    },
    {
      id: 'wesel_w81c_991',
      code: 'WESEL W81C',
      title: 'Wesel W81C (Percabangan Jalur 7 ke Jalur 8)',
      km: 'KM 11+700',
      category: 'ST. JATINEGARA (EMPLASEMEN BARAT)',
      d: 'M 991.5 322.4 L 959.8 370.3',
      color: '#139a47',
      isCrossing: true,
    },
    {
      id: 'wesel_w83a1_1421',
      code: 'WESEL W83A1',
      title: 'Wesel W83A1 (Jalur 8 ke Jalur 7)',
      km: 'KM 11+800',
      category: 'ST. JATINEGARA (EMPLASEMEN TIMUR)',
      d: 'M 1421.8 322.4 L 1452.8 370.0',
      color: '#139a47',
      isCrossing: true,
    },
    {
      id: 'wesel_w83a1_1476',
      code: 'WESEL W83A1',
      title: 'Wesel W83A1 (Crossover Jalur 7 ke Jalur 4/3)',
      km: 'KM 11+800 - KM 12+000',
      category: 'ST. JATINEGARA (EMPLASEMEN TIMUR)',
      d: 'M 1476.9 370.0 L 1568.0 512.7',
      color: '#cc6827',
      isCrossing: true,
    },
    {
      id: 'wesel_w63a_1452',
      code: 'WESEL W63A',
      title: 'Wesel W63A (Crossover Jalur 6 ke Jalur 4/3)',
      km: 'KM 11+800 - KM 12+000',
      category: 'ST. JATINEGARA (EMPLASEMEN TIMUR)',
      d: 'M 1452.8 417.4 L 1546.0 560.5',
      color: '#cc6827',
      isCrossing: true,
    },
    {
      id: 'wesel_w61b_772',
      code: 'WESEL W61B',
      title: 'Wesel W61B ke FRP-JNG-07-21C1 (KM 11+448)',
      km: 'KM 11+448',
      category: 'ST. JATINEGARA (EMPLASEMEN BARAT)',
      d: 'M 772.0 417.8 L 818.2 465.3',
      color: '#cc6827',
      isCrossing: true,
    },
    {
      id: 'wesel_w61c_991',
      code: 'WESEL W61C',
      title: 'Wesel W61C ke Jalur 5 (KM 11+500)',
      km: 'KM 11+500',
      category: 'ST. JATINEGARA (EMPLASEMEN BARAT)',
      d: 'M 991.5 465.6 L 961.2 417.8',
      color: '#cc6827',
      isCrossing: true,
    },
    {
      id: 'wesel_w61c_1038',
      code: 'WESEL W61C',
      title: 'Wesel W61C ke FRP-JNG-06-41B (KM 11+500)',
      km: 'KM 11+500',
      category: 'ST. JATINEGARA (EMPLASEMEN BARAT)',
      d: 'M 1038.3 465.4 L 1020.8 485.8',
      color: '#cc6827',
      isCrossing: true,
    },
    {
      id: 'wesel_w41b_1017',
      code: 'WESEL W41B',
      title: 'Wesel W41B ke Jalur 4 (KM 11+520)',
      km: 'KM 11+520',
      category: 'ST. JATINEGARA (EMPLASEMEN BARAT)',
      d: 'M 1017.0 490.2 L 997.6 513.0',
      color: '#cc6827',
      isCrossing: true,
    },
    {
      id: 'wesel_w21c1_821',
      code: 'WESEL W21C1',
      title: 'Wesel FRP-JNG-07-21C1 ke W21C1 (KM 11+500)',
      km: 'KM 11+500',
      category: 'ST. JATINEGARA (EMPLASEMEN BARAT)',
      d: 'M 821.9 469.2 L 864.3 512.7',
      color: '#cc6827',
      isCrossing: true,
    },
    {
      id: 'wesel_w21c2_828',
      code: 'WESEL W21C2',
      title: 'Wesel W21C2 ke Jalur Antara W21A2 (KM 11+550)',
      km: 'KM 11+550',
      category: 'ST. JATINEGARA (EMPLASEMEN BARAT)',
      d: 'M 828.3 512.7 L 796.2 559.6',
      color: '#cc6827',
      isCrossing: true,
    },
    {
      id: 'wesel_w21a2_752',
      code: 'WESEL W21A2',
      title: 'Wesel W21A2 ke Jalur 3 W11B1 (KM 11+600)',
      km: 'KM 11+600',
      category: 'ST. JATINEGARA (EMPLASEMEN BARAT)',
      d: 'M 752.3 559.6 L 720.4 605.6',
      color: '#cc6827',
      isCrossing: true,
    },
    {
      id: 'wesel_w11a_677',
      code: 'WESEL W11A',
      title: 'Wesel Crossover W11A ke FRP-JNG-02-11A (KM 11+500)',
      km: 'KM 11+500',
      category: 'ST. JATINEGARA (EMPLASEMEN BARAT)',
      d: 'M 677.4 605.6 L 659.4 626.5',
      color: '#cc6827',
      isCrossing: true,
    },
    {
      id: 'wesel_w11a_655',
      code: 'WESEL W11A',
      title: 'Wesel Crossover W11A / W31A2 ke Jalur 2 Barat (KM 11+500)',
      km: 'KM 11+500',
      category: 'ST. JATINEGARA (EMPLASEMEN BARAT)',
      d: 'M 655.5 630.7 L 634.4 656.1',
      color: '#f8d731',
      isCrossing: true,
    },
    {
      id: 'wesel_w31a1_593',
      code: 'WESEL W31A1',
      title: 'Wesel Crossover W31A1 ke FRP-JNG-01-31A1 (KM 11+350)',
      km: 'KM 11+350',
      category: 'ST. JATINEGARA (EMPLASEMEN BARAT)',
      d: 'M 593.4 656.1 L 575.9 676.4',
      color: '#f8d731',
      isCrossing: true,
    },
    {
      id: 'wesel_w51a_571',
      code: 'WESEL W51A',
      title: 'Wesel Crossover W51A ke Jalur 1 Barat (KM 11+300)',
      km: 'KM 11+300',
      category: 'ST. JATINEGARA (EMPLASEMEN BARAT)',
      d: 'M 571.2 681.6 L 552.8 703.5',
      color: '#ff00ff',
      isCrossing: true,
    },
    {
      id: 'wesel_w31c1_932',
      code: 'WESEL W31C1',
      title: 'Wesel W31C1 / W51D1 (Jalur 2 ke Jalur 1, KM 11+650)',
      km: 'KM 11+650',
      category: 'ST. JATINEGARA (EMPLASEMEN BARAT)',
      d: 'M 932.6 656.1 L 974.3 689.4',
      color: '#f8d731',
      isCrossing: true,
    },
    {
      id: 'wesel_w31c2_992',
      code: 'WESEL W31C2',
      title: 'Wesel W31C2 / W51D2 (Jalur 2 ke Jalur 1, KM 11+700)',
      km: 'KM 11+700',
      category: 'ST. JATINEGARA (EMPLASEMEN BARAT)',
      d: 'M 992.0 656.1 L 950.2 689.4',
      color: '#f8d731',
      isCrossing: true,
    },
    {
      id: 'wesel_w51d1_946',
      code: 'WESEL W51D1',
      title: 'Wesel W51D1 ke Jalur 1 Hulu (KM 11+650)',
      km: 'KM 11+650',
      category: 'ST. JATINEGARA (EMPLASEMEN BARAT)',
      d: 'M 946.0 692.7 L 932.6 703.5',
      color: '#ff00ff',
      isCrossing: true,
    },
    {
      id: 'wesel_w51d2_978',
      code: 'WESEL W51D2',
      title: 'Wesel W51D2 ke Jalur 1 Hulu (KM 11+700)',
      km: 'KM 11+700',
      category: 'ST. JATINEGARA (EMPLASEMEN BARAT)',
      d: 'M 978.8 693.0 L 992.0 703.5',
      color: '#ff00ff',
      isCrossing: true,
    },
    {
      id: 'wesel_w83a2_1461',
      code: 'WESEL W83A2',
      title: 'Wesel Jalur 4 ke Jalur 3 Timur (KM 11+800)',
      km: 'KM 11+800',
      category: 'ST. JATINEGARA (EMPLASEMEN TIMUR)',
      d: 'M 1461.9 512.7 L 1489.8 560.5',
      color: '#cc6827',
      isCrossing: true,
    },
    {
      id: 'wesel_w83a2_1628',
      code: 'WESEL W83A2',
      title: 'Wesel W83A2 (Crossover Jalur 4 Timur, KM 11+900)',
      km: 'KM 11+900',
      category: 'ST. JATINEGARA (EMPLASEMEN TIMUR)',
      d: 'M 1628.1 512.7 L 1667.3 560.5',
      color: '#139a47',
      isCrossing: true,
    },
    {
      id: 'wesel_w23b1_1596',
      code: 'WESEL W23B1',
      title: 'Wesel W23B1 (Crossover Jalur 4 ke Jalur 3 Barat, KM 11+920)',
      km: 'KM 11+920',
      category: 'ST. JATINEGARA (EMPLASEMEN TIMUR)',
      d: 'M 1596.8 560.5 L 1613.8 580.0',
      color: '#cc6827',
      isCrossing: true,
    },
    {
      id: 'wesel_w23b2_1617',
      code: 'WESEL W23B2',
      title: 'Wesel W23B2 (Lanjutan Crossover Jalur 4 ke Jalur 3, KM 11+950)',
      km: 'KM 11+950',
      category: 'ST. JATINEGARA (EMPLASEMEN TIMUR)',
      d: 'M 1617.5 584.0 L 1638.4 608.0',
      color: '#f8d731',
      isCrossing: true,
    },
    {
      id: 'wesel_w23c1_1692',
      code: 'WESEL W23C1',
      title: 'Wesel W23C1 (Crossover Jalur 4 ke Jalur 3 Timur, KM 12+000)',
      km: 'KM 12+000',
      category: 'ST. JATINEGARA (EMPLASEMEN TIMUR)',
      d: 'M 1692.9 560.5 L 1710.0 580.2',
      color: '#139a47',
      isCrossing: true,
    },
    {
      id: 'wesel_w23c2_1713',
      code: 'WESEL W23C2',
      title: 'Wesel W23C2 (Lanjutan Crossover Jalur 4 ke Jalur 3, KM 12+050)',
      km: 'KM 12+050',
      category: 'ST. JATINEGARA (EMPLASEMEN TIMUR)',
      d: 'M 1713.8 584.1 L 1734.8 608.1',
      color: '#f8d731',
      isCrossing: true,
    },
    {
      id: 'wesel_w13b_1600',
      code: 'WESEL W13B',
      title: 'Wesel W13B (Crossover Jalur 3 ke Jalur 2 Barat, KM 11+900)',
      km: 'KM 11+900',
      category: 'ST. JATINEGARA (EMPLASEMEN TIMUR)',
      d: 'M 1600.7 607.9 L 1560.5 655.9',
      color: '#f8d731',
      isCrossing: true,
    },
    {
      id: 'wesel_w13c_1667',
      code: 'WESEL W13C',
      title: 'Wesel W13C1 / W13C2 (Crossover Jalur 3 ke Jalur 2, KM 12+000)',
      km: 'KM 12+000',
      category: 'ST. JATINEGARA (EMPLASEMEN TIMUR)',
      d: 'M 1667.0 608.0 L 1708.7 655.8',
      color: '#f8d731',
      isCrossing: true,
    },
    {
      id: 'wesel_w13d1_1750',
      code: 'WESEL W13D1',
      title: 'Wesel W13D1 (Crossover Jalur 3 ke Jalur 2 Timur, KM 12+100)',
      km: 'KM 12+100',
      category: 'ST. JATINEGARA (EMPLASEMEN TIMUR)',
      d: 'M 1750.1 608.1 L 1767.3 627.8',
      color: '#f8d731',
      isCrossing: true,
    },
    {
      id: 'wesel_w13d2_1771',
      code: 'WESEL W13D2',
      title: 'Wesel W13D2 (Lanjutan Crossover Jalur 2 Timur, KM 12+150)',
      km: 'KM 12+150',
      category: 'ST. JATINEGARA (EMPLASEMEN TIMUR)',
      d: 'M 1771.6 632.5 L 1791.9 655.8',
      color: '#f8d731',
      isCrossing: true,
    },
    {
      id: 'wesel_w33b_1750',
      code: 'WESEL W33B',
      title: 'Wesel W33B1 / W33B2 (Crossover Jalur 2 ke Jalur 1 Barat, KM 12+150)',
      km: 'KM 12+150',
      category: 'ST. JATINEGARA (EMPLASEMEN TIMUR)',
      d: 'M 1750.1 656.2 L 1767.3 675.9',
      color: '#f8d731',
      isCrossing: true,
    },
    {
      id: 'wesel_w53b_1771',
      code: 'WESEL W53B',
      title: 'Wesel W53B (Percabangan Jalur 1 Hulu ke FRP-JNG-14-33B2, KM 12+180)',
      km: 'KM 12+180',
      category: 'ST. JATINEGARA (EMPLASEMEN TIMUR)',
      d: 'M 1771.6 680.6 L 1791.9 703.9',
      color: '#ff00ff',
      isCrossing: true,
    },
    {
      id: 'wesel_w33c_1834',
      code: 'WESEL W33C',
      title: 'Wesel W33C1 / W33C2 (Crossover Jalur 2 ke Jalur 1 Timur, KM 12+320)',
      km: 'KM 12+320',
      category: 'ST. JATINEGARA (EMPLASEMEN TIMUR)',
      d: 'M 1834.1 655.8 L 1851.6 675.9',
      color: '#f8d731',
      isCrossing: true,
    },
    {
      id: 'wesel_w53c_1856',
      code: 'WESEL W53C',
      title: 'Wesel W53C (Percabangan Jalur 1 Hulu ke FRP-JNG-16-33C2, KM 12+350)',
      km: 'KM 12+350',
      category: 'ST. JATINEGARA (EMPLASEMEN TIMUR)',
      d: 'M 1856.1 680.6 L 1876.4 703.9',
      color: '#ff00ff',
      isCrossing: true,
    },
    {
      id: 'loop_slope_3112_702',
      code: 'LOOP BUA-KLDB',
      title: 'Tikungan Loop Menurun Buaran - Klender Baru (Hulu Atas)',
      km: 'KM 18+800 - KM 19+300',
      category: 'TIKUNGAN LOOP BUA-KLDB',
      d: 'M 3112.5 702.9 L 3143.9 735.4',
      color: '#ff0000',
      isCrossing: true,
    },
    {
      id: 'loop_slope_3122_655',
      code: 'LOOP BUA-KLDB',
      title: 'Tikungan Loop Menurun Buaran - Klender Baru (Hilir Atas)',
      km: 'KM 18+800 - KM 19+300',
      category: 'TIKUNGAN LOOP BUA-KLDB',
      d: 'M 3122.8 655.2 L 3181.1 715.5',
      color: '#ff0000',
      isCrossing: true,
    },
    {
      id: 'loop_vert_hi',
      code: 'LOOP BUA-KLDB',
      title: 'Kabel Loop Vertikal Hilir Menurun Buaran - Klender Baru',
      km: 'KM 19+000',
      category: 'TIKUNGAN LOOP BUA-KLDB',
      d: 'M 3181.1 715.5 L 3181.0 1047.9',
      color: '#f8d731',
      isCrossing: true,
    },
    {
      id: 'loop_vert_hu',
      code: 'LOOP BUA-KLDB',
      title: 'Kabel Loop Vertikal Hulu Menurun Buaran - Klender Baru',
      km: 'KM 19+000',
      category: 'TIKUNGAN LOOP BUA-KLDB',
      d: 'M 3143.9 735.4 L 3143.8 1021.0',
      color: '#ff0000',
      isCrossing: true,
    },
    {
      id: 'loop_slope_3143_1021',
      code: 'LOOP BUA-KLDB',
      title: 'Tikungan Loop Menurun Buaran - Klender Baru (Hulu Bawah)',
      km: 'KM 19+000 - KM 19+300',
      category: 'TIKUNGAN LOOP BUA-KLDB',
      d: 'M 3143.8 1021.0 L 3102.0 1064.7',
      color: '#ff0000',
      isCrossing: true,
    },
    {
      id: 'loop_slope_3122_1112',
      code: 'LOOP BUA-KLDB',
      title: 'Tikungan Loop Menurun Buaran - Klender Baru (Hilir Bawah)',
      km: 'KM 19+000 - KM 19+300',
      category: 'TIKUNGAN LOOP BUA-KLDB',
      d: 'M 3122.6 1112.4 L 3181.0 1047.9',
      color: '#ff0000',
      isCrossing: true,
    },
    {
      id: 'naspan_8_bua_kldb_hi',
      code: 'NASPAN 8 BUA-KLDB',
      title: 'NASPAN 8 BUA-KLDB (Jalur Masuk Klender Baru Hilir)',
      km: 'KM 19+000 - KM 19+300',
      category: 'TIKUNGAN LOOP BUA-KLDB',
      d: 'M 3046.7 1112.4 L 3122.6 1112.4',
      color: '#f8d731',
    },
    {
      id: 'naspan_8_bua_kldb_hu',
      code: 'NASPAN 8 BUA-KLDB',
      title: 'NASPAN 8 BUA-KLDB (Jalur Masuk Klender Baru Hulu)',
      km: 'KM 19+000 - KM 19+300',
      category: 'TIKUNGAN LOOP BUA-KLDB',
      d: 'M 3046.7 1064.5 L 3102.0 1064.7',
      color: '#ff0000',
    },
    {
      id: 'wesel_w23b_cuk',
      code: 'WESEL W23B',
      title: 'Wesel W23B St. Cakung (KM 20+800)',
      km: 'KM 20+800',
      category: 'ST. CAKUNG',
      d: 'M 2366.1 1112.0 L 2385.4 1089.2',
      color: '#cc6827',
      isCrossing: true,
    },
    {
      id: 'wesel_w13b_cuk',
      code: 'WESEL W13B',
      title: 'Wesel W13B St. Cakung (KM 20+820)',
      km: 'KM 20+820',
      category: 'ST. CAKUNG',
      d: 'M 2389.2 1084.2 L 2406.4 1063.9',
      color: '#8a6ddd',
      isCrossing: true,
    },
    {
      id: 'wesel_w13a_cuk',
      code: 'WESEL W13A',
      title: 'Wesel W13A ke Jalur 1 Peron Cakung (KM 20+900)',
      km: 'KM 20+900',
      category: 'ST. CAKUNG',
      d: 'M 2414.9 1063.8 L 2453.3 1022.1',
      color: '#8a6ddd',
      isCrossing: true,
    },
    {
      id: 'wesel_w23a_cuk',
      code: 'WESEL W23A',
      title: 'Wesel W23A ke Jalur 4 Peron Cakung (KM 20+900)',
      km: 'KM 20+900',
      category: 'ST. CAKUNG',
      d: 'M 2452.2 1153.9 L 2414.9 1112.0',
      color: '#cc6827',
      isCrossing: true,
    },
    {
      id: 'wesel_w11b_cuk',
      code: 'WESEL W11B',
      title: 'Wesel W11B dari Jalur 1 Peron Cakung (KM 21+000)',
      km: 'KM 21+000',
      category: 'ST. CAKUNG',
      d: 'M 2583.0 1022.1 L 2616.9 1064.2',
      color: '#8a6ddd',
      isCrossing: true,
    },
    {
      id: 'wesel_w21b_cuk',
      code: 'WESEL W21B',
      title: 'Wesel W21B dari Jalur 4 Peron Cakung (KM 21+000)',
      km: 'KM 21+000',
      category: 'ST. CAKUNG',
      d: 'M 2616.9 1112.1 L 2583.0 1153.9',
      color: '#cc6827',
      isCrossing: true,
    },
    {
      id: 'wesel_w11a_cuk',
      code: 'WESEL W11A',
      title: 'Wesel W11A Timur Cakung (KM 21+100)',
      km: 'KM 21+100',
      category: 'ST. CAKUNG',
      d: 'M 2644.2 1084.6 L 2627.8 1064.2',
      color: '#8a6ddd',
      isCrossing: true,
    },
    {
      id: 'wesel_w21a_cuk',
      code: 'WESEL W21A',
      title: 'Wesel W21A Timur Cakung (KM 21+100)',
      km: 'KM 21+100',
      category: 'ST. CAKUNG',
      d: 'M 2666.7 1112.1 L 2648.4 1089.3',
      color: '#cc6827',
      isCrossing: true,
    },
    {
      id: 'wesel_w73_bks_460',
      code: 'WESEL W73',
      title: 'Wesel W73 Barat Bekasi (KM 26+800)',
      km: 'KM 26+800',
      category: 'ST. BEKASI (EMPLASEMEN BARAT)',
      d: 'M 460.4 1063.4 L 370.4 1227.8',
      color: '#ec1f24',
      isCrossing: true,
    },
    {
      id: 'wesel_w53_bks_505',
      code: 'WESEL W53',
      title: 'Wesel W53 Barat Bekasi (KM 26+800)',
      km: 'KM 26+800',
      category: 'ST. BEKASI (EMPLASEMEN BARAT)',
      d: 'M 505.0 1113.0 L 442.6 1227.6',
      color: '#ec1f24',
      isCrossing: true,
    },
    {
      id: 'wesel_w73_bks_807',
      code: 'WESEL W73',
      title: 'Wesel W73 Masuk Jalur 1 Barat Bekasi (KM 26+500)',
      km: 'KM 26+500',
      category: 'ST. BEKASI (EMPLASEMEN BARAT)',
      d: 'M 807.6 1037.1 L 776.9 1062.7',
      color: '#139a47',
      isCrossing: true,
    },
    {
      id: 'wesel_frp_73_bks',
      code: 'WESEL FRP-JNG-26-73',
      title: 'Wesel FRP-JNG-26-73 Langsir Stabling Bekasi (KM 26+500)',
      km: 'KM 26+500',
      category: 'ST. BEKASI (STABLING)',
      d: 'M 838.4 1011.6 L 812.1 1033.4',
      color: '#139a47',
      isCrossing: true,
    },
    {
      id: 'wesel_w33a_bks_797',
      code: 'WESEL W33A',
      title: 'Wesel W33A ke Jalur 2 Barat Bekasi (KM 26+600)',
      km: 'KM 26+600',
      category: 'ST. BEKASI (EMPLASEMEN BARAT)',
      d: 'M 797.7 1139.1 L 775.6 1112.6',
      color: '#ec1f24',
      isCrossing: true,
    },
    {
      id: 'wesel_w33a_bks_826',
      code: 'WESEL W33A',
      title: 'Wesel W33A ke Jalur 3 Barat Bekasi (KM 26+580)',
      km: 'KM 26+580',
      category: 'ST. BEKASI (EMPLASEMEN BARAT)',
      d: 'M 826.6 1174.0 L 801.2 1143.3',
      color: '#ec1f24',
      isCrossing: true,
    },
    {
      id: 'wesel_w71c_1319',
      code: 'WESEL W71C',
      title: 'Wesel W71C Stabling Atas Bekasi (KM 26+200)',
      km: 'KM 26+200',
      category: 'ST. BEKASI (STABLING)',
      d: 'M 1319.3 1035.9 L 1256.6 960.1',
      color: '#139a47',
      isCrossing: true,
    },
    {
      id: 'wesel_w71c1_1341',
      code: 'WESEL W71C1',
      title: 'Wesel W71C1 Stabling Bekasi (KM 26+180)',
      km: 'KM 26+180',
      category: 'ST. BEKASI (STABLING)',
      d: 'M 1341.8 1063.0 L 1322.7 1040.0',
      color: '#139a47',
      isCrossing: true,
    },
    {
      id: 'wesel_w71b_1454',
      code: 'WESEL W71B',
      title: 'Wesel W71B Emplasemen Timur Bekasi (KM 26+050)',
      km: 'KM 26+050',
      category: 'ST. BEKASI (EMPLASEMEN TIMUR)',
      d: 'M 1454.3 1087.4 L 1474.7 1063.3',
      color: '#139a47',
      isCrossing: true,
    },
    {
      id: 'wesel_w71a_1524',
      code: 'WESEL W71A',
      title: 'Wesel W71A Masuk Jalur 1 Bekasi (KM 25+950)',
      km: 'KM 25+950',
      category: 'ST. BEKASI (EMPLASEMEN TIMUR)',
      d: 'M 1524.3 1086.2 L 1505.1 1063.0',
      color: '#139a47',
      isCrossing: true,
    },
    {
      id: 'wesel_w51a_1547',
      code: 'WESEL W51A',
      title: 'Wesel W51A Masuk Jalur 2 Bekasi (KM 25+950)',
      km: 'KM 25+950',
      category: 'ST. BEKASI (EMPLASEMEN TIMUR)',
      d: 'M 1547.1 1112.8 L 1528.7 1090.9',
      color: '#ff0000',
      isCrossing: true,
    },
    {
      id: 'wesel_w51b_1431',
      code: 'WESEL W51B',
      title: 'Wesel W51B Emplasemen Timur Bekasi (KM 26+050)',
      km: 'KM 26+050',
      category: 'ST. BEKASI (EMPLASEMEN TIMUR)',
      d: 'M 1431.2 1113.0 L 1449.6 1091.5',
      color: '#ff0000',
      isCrossing: true,
    },
    {
      id: 'wesel_w51c_1322',
      code: 'WESEL W51C',
      title: 'Wesel W51C ke Jalur 2 Timur Bekasi (KM 26+180)',
      km: 'KM 26+180',
      category: 'ST. BEKASI (EMPLASEMEN TIMUR)',
      d: 'M 1322.7 1138.6 L 1341.8 1112.6',
      color: '#ec1f24',
      isCrossing: true,
    },
    {
      id: 'wesel_w31b_1296',
      code: 'WESEL W31B',
      title: 'Wesel W31B Jalur 3 Timur Bekasi (KM 26+150)',
      km: 'KM 26+150',
      category: 'ST. BEKASI (EMPLASEMEN TIMUR)',
      d: 'M 1296.8 1174.0 L 1319.3 1143.3',
      color: '#ec1f24',
      isCrossing: true,
    },
    {
      id: 'wesel_w13d_bkt_307',
      code: 'WESEL W13D',
      title: 'Wesel W13D Percabangan Bekasi Timur (KM 27+050)',
      km: 'KM 27+050',
      category: 'BEKASI TIMUR',
      d: 'M 307.0 1249.9 L 288.8 1227.8',
      color: '#139a47',
      isCrossing: true,
    },
    {
      id: 'wesel_w23c_bkt_329',
      code: 'WESEL W23C',
      title: 'Wesel W23C Percabangan Bekasi Timur (KM 27+100)',
      km: 'KM 27+100',
      category: 'BEKASI TIMUR',
      d: 'M 329.7 1277.5 L 310.5 1254.0',
      color: '#ec1f24',
      isCrossing: true,
    },
    {
      id: 'wesel_w13c_bkt_432',
      code: 'WESEL W13C',
      title: 'Wesel W13C / W23B Bekasi Timur (KM 26+950)',
      km: 'KM 26+950',
      category: 'BEKASI TIMUR',
      d: 'M 432.4 1227.8 L 391.7 1277.5',
      color: '#ec1f24',
      isCrossing: true,
    },
        // ========================================================
    // PEMISAH SEKSI (AS/AJ) - 44 SIMBOL LENGKAP AUTENTIK CAD
    // ========================================================
    {
      id: 'overlap_aj_10000_hi',
      code: 'AIR JOINT (AJ)',
      title: 'Overlap Air Joint (AJ) KM 10+000',
      km: 'KM 10+000',
      category: 'PEMISAH SEKSI (AS/AJ)',
      d: 'M 206.1 360.9 L 218.7 380.7',
      hitD: 'M 206.1 360.9 L 218.7 380.7',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ) KM 10+000', km: 'KM 10+000' },
      endDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ) KM 10+000', km: 'KM 10+000' },
    },
    {
      id: 'overlap_aj_10000_hu',
      code: 'AIR JOINT (AJ)',
      title: 'Overlap Air Joint (AJ) KM 10+000',
      km: 'KM 10+000',
      category: 'PEMISAH SEKSI (AS/AJ)',
      d: 'M 206.1 408.7 L 218.7 428.5',
      hitD: 'M 206.1 408.7 L 218.7 428.5',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ) KM 10+000', km: 'KM 10+000' },
      endDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ) KM 10+000', km: 'KM 10+000' },
    },
    {
      id: 'overlap_as_11200_j7',
      code: 'AIR SECTION (AS)',
      title: 'Overlap Air Section (AS) KM 11+200',
      km: 'KM 11+200',
      category: 'PEMISAH SEKSI (AS/AJ)',
      d: 'M 590.2 360.9 L 602.8 380.7',
      hitD: 'M 590.2 360.9 L 602.8 380.7',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'AS', label: 'Overlap Air Section (AS) KM 11+200', km: 'KM 11+200' },
      endDivider: { type: 'AS', label: 'Overlap Air Section (AS) KM 11+200', km: 'KM 11+200' },
    },
    {
      id: 'overlap_as_11200_j6',
      code: 'AIR SECTION (AS)',
      title: 'Overlap Air Section (AS) KM 11+200',
      km: 'KM 11+200',
      category: 'PEMISAH SEKSI (AS/AJ)',
      d: 'M 585.2 408.7 L 597.8 428.5',
      hitD: 'M 585.2 408.7 L 597.8 428.5',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'AS', label: 'Overlap Air Section (AS) KM 11+200', km: 'KM 11+200' },
      endDivider: { type: 'AS', label: 'Overlap Air Section (AS) KM 11+200', km: 'KM 11+200' },
    },
    {
      id: 'overlap_as_1880_hi',
      code: 'AIR SECTION (AS)',
      title: 'Overlap Air Section (AS) KM 1+880',
      km: 'KM 1+880',
      category: 'PEMISAH SEKSI (AS/AJ)',
      d: 'M 474.7 646.6 L 486.5 666.4',
      hitD: 'M 474.7 646.6 L 486.5 666.4',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'AS', label: 'Overlap Air Section (AS) KM 1+880', km: 'KM 1+880' },
      endDivider: { type: 'AS', label: 'Overlap Air Section (AS) KM 1+880', km: 'KM 1+880' },
    },
    {
      id: 'overlap_as_1880_hu',
      code: 'AIR SECTION (AS)',
      title: 'Overlap Air Section (AS) KM 1+880',
      km: 'KM 1+880',
      category: 'PEMISAH SEKSI (AS/AJ)',
      d: 'M 474.7 694.5 L 486.5 714.2',
      hitD: 'M 474.7 694.5 L 486.5 714.2',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'AS', label: 'Overlap Air Section (AS) KM 1+880', km: 'KM 1+880' },
      endDivider: { type: 'AS', label: 'Overlap Air Section (AS) KM 1+880', km: 'KM 1+880' },
    },
    {
      id: 'overlap_as_2000_hi',
      code: 'AIR SECTION (AS)',
      title: 'Overlap Air Section (AS) KM 2+000',
      km: 'KM 2+000',
      category: 'PEMISAH SEKSI (AS/AJ)',
      d: 'M 728.8 646.6 L 740.8 666.4',
      hitD: 'M 728.8 646.6 L 740.8 666.4',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'AS', label: 'Overlap Air Section (AS) KM 2+000', km: 'KM 2+000' },
      endDivider: { type: 'AS', label: 'Overlap Air Section (AS) KM 2+000', km: 'KM 2+000' },
    },
    {
      id: 'overlap_as_2000_hu',
      code: 'AIR SECTION (AS)',
      title: 'Overlap Air Section (AS) KM 2+000',
      km: 'KM 2+000',
      category: 'PEMISAH SEKSI (AS/AJ)',
      d: 'M 728.8 694.5 L 740.7 713.7',
      hitD: 'M 728.8 694.5 L 740.7 713.7',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'AS', label: 'Overlap Air Section (AS) KM 2+000', km: 'KM 2+000' },
      endDivider: { type: 'AS', label: 'Overlap Air Section (AS) KM 2+000', km: 'KM 2+000' },
    },
    {
      id: 'overlap_as_11900_hi',
      code: 'AIR SECTION (AS)',
      title: 'Overlap Air Section (AS) KM 11+900',
      km: 'KM 11+900',
      category: 'PEMISAH SEKSI (AS/AJ)',
      d: 'M 1475.5 646.6 L 1487.9 666.4',
      hitD: 'M 1475.5 646.6 L 1487.9 666.4',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'AS', label: 'Overlap Air Section (AS) KM 11+900', km: 'KM 11+900' },
      endDivider: { type: 'AS', label: 'Overlap Air Section (AS) KM 11+900', km: 'KM 11+900' },
    },
    {
      id: 'overlap_as_11900_hu',
      code: 'AIR SECTION (AS)',
      title: 'Overlap Air Section (AS) KM 11+900',
      km: 'KM 11+900',
      category: 'PEMISAH SEKSI (AS/AJ)',
      d: 'M 1475.8 694.5 L 1487.7 713.5',
      hitD: 'M 1475.8 694.5 L 1487.7 713.5',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'AS', label: 'Overlap Air Section (AS) KM 11+900', km: 'KM 11+900' },
      endDivider: { type: 'AS', label: 'Overlap Air Section (AS) KM 11+900', km: 'KM 11+900' },
    },
    {
      id: 'overlap_as_12500_hi',
      code: 'AIR SECTION (AS)',
      title: 'Overlap Air Section (AS) KM 12+500',
      km: 'KM 12+500',
      category: 'PEMISAH SEKSI (AS/AJ)',
      d: 'M 1942.6 646.3 L 1954.5 666.4',
      hitD: 'M 1942.6 646.3 L 1954.5 666.4',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'AS', label: 'Overlap Air Section (AS) KM 12+500', km: 'KM 12+500' },
      endDivider: { type: 'AS', label: 'Overlap Air Section (AS) KM 12+500', km: 'KM 12+500' },
    },
    {
      id: 'overlap_as_12500_hu',
      code: 'AIR SECTION (AS)',
      title: 'Overlap Air Section (AS) KM 12+500',
      km: 'KM 12+500',
      category: 'PEMISAH SEKSI (AS/AJ)',
      d: 'M 1942.6 695.1 L 1954.5 714.2',
      hitD: 'M 1942.6 695.1 L 1954.5 714.2',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'AS', label: 'Overlap Air Section (AS) KM 12+500', km: 'KM 12+500' },
      endDivider: { type: 'AS', label: 'Overlap Air Section (AS) KM 12+500', km: 'KM 12+500' },
    },
    {
      id: 'overlap_aj_13300_hi',
      code: 'AIR JOINT (AJ)',
      title: 'Overlap Air Joint (AJ) KM 13+300',
      km: 'KM 13+300',
      category: 'PEMISAH SEKSI (AS/AJ)',
      d: 'M 2078.8 646.6 L 2091.4 666.4',
      hitD: 'M 2078.8 646.6 L 2091.4 666.4',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ) KM 13+300', km: 'KM 13+300' },
      endDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ) KM 13+300', km: 'KM 13+300' },
    },
    {
      id: 'overlap_aj_13300_hu',
      code: 'AIR JOINT (AJ)',
      title: 'Overlap Air Joint (AJ) KM 13+300',
      km: 'KM 13+300',
      category: 'PEMISAH SEKSI (AS/AJ)',
      d: 'M 2077.2 694.5 L 2089.8 714.2',
      hitD: 'M 2077.2 694.5 L 2089.8 714.2',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ) KM 13+300', km: 'KM 13+300' },
      endDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ) KM 13+300', km: 'KM 13+300' },
    },
    {
      id: 'overlap_aj_14100_hi',
      code: 'AIR JOINT (AJ)',
      title: 'Overlap Air Joint (AJ) KM 14+100',
      km: 'KM 14+100',
      category: 'PEMISAH SEKSI (AS/AJ)',
      d: 'M 2159.0 646.1 L 2171.7 666.1',
      hitD: 'M 2159.0 646.1 L 2171.7 666.1',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ) KM 14+100', km: 'KM 14+100' },
      endDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ) KM 14+100', km: 'KM 14+100' },
    },
    {
      id: 'overlap_aj_14100_hu',
      code: 'AIR JOINT (AJ)',
      title: 'Overlap Air Joint (AJ) KM 14+100',
      km: 'KM 14+100',
      category: 'PEMISAH SEKSI (AS/AJ)',
      d: 'M 2157.0 693.2 L 2169.7 713.0',
      hitD: 'M 2157.0 693.2 L 2169.7 713.0',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ) KM 14+100', km: 'KM 14+100' },
      endDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ) KM 14+100', km: 'KM 14+100' },
    },
    {
      id: 'overlap_aj_14700_hi',
      code: 'AIR JOINT (AJ)',
      title: 'Overlap Air Joint (AJ) KM 14+700',
      km: 'KM 14+700',
      category: 'PEMISAH SEKSI (AS/AJ)',
      d: 'M 2245.5 646.1 L 2258.1 665.9',
      hitD: 'M 2245.5 646.1 L 2258.1 665.9',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ) KM 14+700', km: 'KM 14+700' },
      endDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ) KM 14+700', km: 'KM 14+700' },
    },
    {
      id: 'overlap_aj_14700_hu',
      code: 'AIR JOINT (AJ)',
      title: 'Overlap Air Joint (AJ) KM 14+700',
      km: 'KM 14+700',
      category: 'PEMISAH SEKSI (AS/AJ)',
      d: 'M 2243.9 693.8 L 2256.5 713.5',
      hitD: 'M 2243.9 693.8 L 2256.5 713.5',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ) KM 14+700', km: 'KM 14+700' },
      endDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ) KM 14+700', km: 'KM 14+700' },
    },
    {
      id: 'overlap_as_15450_hi',
      code: 'AIR SECTION (AS)',
      title: 'Overlap Air Section (AS) KM 15+450',
      km: 'KM 15+450',
      category: 'PEMISAH SEKSI (AS/AJ)',
      d: 'M 2512.6 646.7 L 2524.4 666.3',
      hitD: 'M 2512.6 646.7 L 2524.4 666.3',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'AS', label: 'Overlap Air Section (AS) KM 15+450', km: 'KM 15+450' },
      endDivider: { type: 'AS', label: 'Overlap Air Section (AS) KM 15+450', km: 'KM 15+450' },
    },
    {
      id: 'overlap_as_15450_hu',
      code: 'AIR SECTION (AS)',
      title: 'Overlap Air Section (AS) KM 15+450',
      km: 'KM 15+450',
      category: 'PEMISAH SEKSI (AS/AJ)',
      d: 'M 2512.0 694.9 L 2523.3 714.1',
      hitD: 'M 2512.0 694.9 L 2523.3 714.1',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'AS', label: 'Overlap Air Section (AS) KM 15+450', km: 'KM 15+450' },
      endDivider: { type: 'AS', label: 'Overlap Air Section (AS) KM 15+450', km: 'KM 15+450' },
    },
    {
      id: 'overlap_aj_16500_hi',
      code: 'AIR JOINT (AJ)',
      title: 'Overlap Air Joint (AJ) KM 16+500',
      km: 'KM 16+500',
      category: 'PEMISAH SEKSI (AS/AJ)',
      d: 'M 2630.9 647.0 L 2643.6 666.8',
      hitD: 'M 2630.9 647.0 L 2643.6 666.8',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ) KM 16+500', km: 'KM 16+500' },
      endDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ) KM 16+500', km: 'KM 16+500' },
    },
    {
      id: 'overlap_aj_16500_hu',
      code: 'AIR JOINT (AJ)',
      title: 'Overlap Air Joint (AJ) KM 16+500',
      km: 'KM 16+500',
      category: 'PEMISAH SEKSI (AS/AJ)',
      d: 'M 2629.4 694.6 L 2642.2 714.6',
      hitD: 'M 2629.4 694.6 L 2642.2 714.6',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ) KM 16+500', km: 'KM 16+500' },
      endDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ) KM 16+500', km: 'KM 16+500' },
    },
    {
      id: 'overlap_as_17239_hi',
      code: 'AIR SECTION (AS)',
      title: 'Overlap Air Section (AS) KM 17+239',
      km: 'KM 17+239',
      category: 'PEMISAH SEKSI (AS/AJ)',
      d: 'M 2737.4 646.7 L 2749.2 665.8',
      hitD: 'M 2737.4 646.7 L 2749.2 665.8',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'AS', label: 'Overlap Air Section (AS) KM 17+239', km: 'KM 17+239' },
      endDivider: { type: 'AS', label: 'Overlap Air Section (AS) KM 17+239', km: 'KM 17+239' },
    },
    {
      id: 'overlap_as_17239_hu',
      code: 'AIR SECTION (AS)',
      title: 'Overlap Air Section (AS) KM 17+239',
      km: 'KM 17+239',
      category: 'PEMISAH SEKSI (AS/AJ)',
      d: 'M 2737.4 694.5 L 2749.2 713.5',
      hitD: 'M 2737.4 694.5 L 2749.2 713.5',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'AS', label: 'Overlap Air Section (AS) KM 17+239', km: 'KM 17+239' },
      endDivider: { type: 'AS', label: 'Overlap Air Section (AS) KM 17+239', km: 'KM 17+239' },
    },
    {
      id: 'overlap_as_17900_hi',
      code: 'AIR SECTION (AS)',
      title: 'Overlap Air Section (AS) KM 17+900',
      km: 'KM 17+900',
      category: 'PEMISAH SEKSI (AS/AJ)',
      d: 'M 2981.4 646.9 L 2993.2 665.8',
      hitD: 'M 2981.4 646.9 L 2993.2 665.8',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'AS', label: 'Overlap Air Section (AS) KM 17+900', km: 'KM 17+900' },
      endDivider: { type: 'AS', label: 'Overlap Air Section (AS) KM 17+900', km: 'KM 17+900' },
    },
    {
      id: 'overlap_as_17900_hu',
      code: 'AIR SECTION (AS)',
      title: 'Overlap Air Section (AS) KM 17+900',
      km: 'KM 17+900',
      category: 'PEMISAH SEKSI (AS/AJ)',
      d: 'M 2980.4 694.5 L 2992.4 713.6',
      hitD: 'M 2980.4 694.5 L 2992.4 713.6',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'AS', label: 'Overlap Air Section (AS) KM 17+900', km: 'KM 17+900' },
      endDivider: { type: 'AS', label: 'Overlap Air Section (AS) KM 17+900', km: 'KM 17+900' },
    },
    {
      id: 'overlap_aj_18800_hi',
      code: 'AIR JOINT (AJ)',
      title: 'Overlap Air Joint (AJ) KM 18+800',
      km: 'KM 18+800',
      category: 'PEMISAH SEKSI (AS/AJ)',
      d: 'M 3090.4 646.1 L 3103.1 665.9',
      hitD: 'M 3090.4 646.1 L 3103.1 665.9',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ) KM 18+800', km: 'KM 18+800' },
      endDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ) KM 18+800', km: 'KM 18+800' },
    },
    {
      id: 'overlap_aj_18800_hu',
      code: 'AIR JOINT (AJ)',
      title: 'Overlap Air Joint (AJ) KM 18+800',
      km: 'KM 18+800',
      category: 'PEMISAH SEKSI (AS/AJ)',
      d: 'M 3090.4 693.9 L 3103.1 713.7',
      hitD: 'M 3090.4 693.9 L 3103.1 713.7',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ) KM 18+800', km: 'KM 18+800' },
      endDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ) KM 18+800', km: 'KM 18+800' },
    },
    {
      id: 'overlap_aj_19300_hi',
      code: 'AIR JOINT (AJ)',
      title: 'Overlap Air Joint (AJ) KM 19+300',
      km: 'KM 19+300',
      category: 'PEMISAH SEKSI (AS/AJ)',
      d: 'M 3035.6 1103.4 L 3048.2 1123.2',
      hitD: 'M 3035.6 1103.4 L 3048.2 1123.2',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ) KM 19+300', km: 'KM 19+300' },
      endDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ) KM 19+300', km: 'KM 19+300' },
    },
    {
      id: 'overlap_aj_19300_hu',
      code: 'AIR JOINT (AJ)',
      title: 'Overlap Air Joint (AJ) KM 19+300',
      km: 'KM 19+300',
      category: 'PEMISAH SEKSI (AS/AJ)',
      d: 'M 3035.6 1055.7 L 3048.2 1075.5',
      hitD: 'M 3035.6 1055.7 L 3048.2 1075.5',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ) KM 19+300', km: 'KM 19+300' },
      endDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ) KM 19+300', km: 'KM 19+300' },
    },
    {
      id: 'overlap_as_20150_hi',
      code: 'AIR SECTION (AS)',
      title: 'Overlap Air Section (AS) KM 20+150',
      km: 'KM 20+150',
      category: 'PEMISAH SEKSI (AS/AJ)',
      d: 'M 2812.3 1112.9 L 2825.2 1112.9',
      hitD: 'M 2812.3 1112.9 L 2825.2 1112.9',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'AS', label: 'Overlap Air Section (AS) KM 20+150', km: 'KM 20+150' },
      endDivider: { type: 'AS', label: 'Overlap Air Section (AS) KM 20+150', km: 'KM 20+150' },
    },
    {
      id: 'overlap_as_20150_hu',
      code: 'AIR SECTION (AS)',
      title: 'Overlap Air Section (AS) KM 20+150',
      km: 'KM 20+150',
      category: 'PEMISAH SEKSI (AS/AJ)',
      d: 'M 2807.6 1065.2 L 2819.5 1065.1',
      hitD: 'M 2807.6 1065.2 L 2819.5 1065.1',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'AS', label: 'Overlap Air Section (AS) KM 20+150', km: 'KM 20+150' },
      endDivider: { type: 'AS', label: 'Overlap Air Section (AS) KM 20+150', km: 'KM 20+150' },
    },
    {
      id: 'overlap_as_21400_hi',
      code: 'AIR SECTION (AS)',
      title: 'Overlap Air Section (AS) KM 21+400',
      km: 'KM 21+400',
      category: 'PEMISAH SEKSI (AS/AJ)',
      d: 'M 2332.1 1112.8 L 2344.0 1112.8',
      hitD: 'M 2332.1 1112.8 L 2344.0 1112.8',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'AS', label: 'Overlap Air Section (AS) KM 21+400', km: 'KM 21+400' },
      endDivider: { type: 'AS', label: 'Overlap Air Section (AS) KM 21+400', km: 'KM 21+400' },
    },
    {
      id: 'overlap_as_21400_hu',
      code: 'AIR SECTION (AS)',
      title: 'Overlap Air Section (AS) KM 21+400',
      km: 'KM 21+400',
      category: 'PEMISAH SEKSI (AS/AJ)',
      d: 'M 2331.3 1062.9 L 2342.7 1064.5',
      hitD: 'M 2331.3 1062.9 L 2342.7 1064.5',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'AS', label: 'Overlap Air Section (AS) KM 21+400', km: 'KM 21+400' },
      endDivider: { type: 'AS', label: 'Overlap Air Section (AS) KM 21+400', km: 'KM 21+400' },
    },
    {
      id: 'overlap_aj_22700_hi',
      code: 'AIR JOINT (AJ)',
      title: 'Overlap Air Joint (AJ) KM 22+700',
      km: 'KM 22+700',
      category: 'PEMISAH SEKSI (AS/AJ)',
      d: 'M 2208.1 1103.3 L 2220.8 1123.1',
      hitD: 'M 2208.1 1103.3 L 2220.8 1123.1',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ) KM 22+700', km: 'KM 22+700' },
      endDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ) KM 22+700', km: 'KM 22+700' },
    },
    {
      id: 'overlap_aj_22700_hu',
      code: 'AIR JOINT (AJ)',
      title: 'Overlap Air Joint (AJ) KM 22+700',
      km: 'KM 22+700',
      category: 'PEMISAH SEKSI (AS/AJ)',
      d: 'M 2206.8 1054.7 L 2217.6 1071.6',
      hitD: 'M 2206.8 1054.7 L 2217.6 1071.6',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ) KM 22+700', km: 'KM 22+700' },
      endDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ) KM 22+700', km: 'KM 22+700' },
    },
    {
      id: 'overlap_as_23750_hi',
      code: 'AIR SECTION (AS)',
      title: 'Overlap Air Section (AS) KM 23+750',
      km: 'KM 23+750',
      category: 'PEMISAH SEKSI (AS/AJ)',
      d: 'M 2052.8 1103.0 L 2065.4 1122.8',
      hitD: 'M 2052.8 1103.0 L 2065.4 1122.8',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'AS', label: 'Overlap Air Section (AS) KM 23+750', km: 'KM 23+750' },
      endDivider: { type: 'AS', label: 'Overlap Air Section (AS) KM 23+750', km: 'KM 23+750' },
    },
    {
      id: 'overlap_as_23750_hu',
      code: 'AIR SECTION (AS)',
      title: 'Overlap Air Section (AS) KM 23+750',
      km: 'KM 23+750',
      category: 'PEMISAH SEKSI (AS/AJ)',
      d: 'M 2060.7 1053.6 L 2073.3 1073.4',
      hitD: 'M 2060.7 1053.6 L 2073.3 1073.4',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'AS', label: 'Overlap Air Section (AS) KM 23+750', km: 'KM 23+750' },
      endDivider: { type: 'AS', label: 'Overlap Air Section (AS) KM 23+750', km: 'KM 23+750' },
    },
    {
      id: 'overlap_aj_24400_hu',
      code: 'AIR JOINT (AJ)',
      title: 'Overlap Air Joint (AJ) KM 24+400',
      km: 'KM 24+400',
      category: 'PEMISAH SEKSI (AS/AJ)',
      d: 'M 1810.2 1054.2 L 1822.9 1074.1',
      hitD: 'M 1810.2 1054.2 L 1822.9 1074.1',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ) KM 24+400', km: 'KM 24+400' },
      endDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ) KM 24+400', km: 'KM 24+400' },
    },
    {
      id: 'overlap_aj_25000_hi',
      code: 'AIR JOINT (AJ)',
      title: 'Overlap Air Joint (AJ) KM 25+000',
      km: 'KM 25+000',
      category: 'PEMISAH SEKSI (AS/AJ)',
      d: 'M 1739.6 1103.7 L 1752.3 1123.5',
      hitD: 'M 1739.6 1103.7 L 1752.3 1123.5',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ) KM 25+000', km: 'KM 25+000' },
      endDivider: { type: 'AJ', label: 'Overlap Air Joint (AJ) KM 25+000', km: 'KM 25+000' },
    },
    {
      id: 'overlap_as_25750_hi',
      code: 'AIR SECTION (AS)',
      title: 'Overlap Air Section (AS) KM 25+750',
      km: 'KM 25+750',
      category: 'PEMISAH SEKSI (AS/AJ)',
      d: 'M 1626.3 1103.9 L 1639.0 1123.7',
      hitD: 'M 1626.3 1103.9 L 1639.0 1123.7',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'AS', label: 'Overlap Air Section (AS) KM 25+750', km: 'KM 25+750' },
      endDivider: { type: 'AS', label: 'Overlap Air Section (AS) KM 25+750', km: 'KM 25+750' },
    },
    {
      id: 'overlap_as_25750_hu',
      code: 'AIR SECTION (AS)',
      title: 'Overlap Air Section (AS) KM 25+750',
      km: 'KM 25+750',
      category: 'PEMISAH SEKSI (AS/AJ)',
      d: 'M 1627.9 1053.8 L 1640.5 1073.6',
      hitD: 'M 1627.9 1053.8 L 1640.5 1073.6',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'AS', label: 'Overlap Air Section (AS) KM 25+750', km: 'KM 25+750' },
      endDivider: { type: 'AS', label: 'Overlap Air Section (AS) KM 25+750', km: 'KM 25+750' },
    },
    {
      id: 'overlap_as_26900_hi',
      code: 'AIR SECTION (AS)',
      title: 'Overlap Air Section (AS) KM 26+900',
      km: 'KM 26+900',
      category: 'PEMISAH SEKSI (AS/AJ)',
      d: 'M 592.3 1103.7 L 600.2 1123.0',
      hitD: 'M 592.3 1103.7 L 600.2 1123.0',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'AS', label: 'Overlap Air Section (AS) KM 26+900', km: 'KM 26+900' },
      endDivider: { type: 'AS', label: 'Overlap Air Section (AS) KM 26+900', km: 'KM 26+900' },
    },
    {
      id: 'overlap_as_26900_hu',
      code: 'AIR SECTION (AS)',
      title: 'Overlap Air Section (AS) KM 26+900',
      km: 'KM 26+900',
      category: 'PEMISAH SEKSI (AS/AJ)',
      d: 'M 592.3 1053.7 L 600.2 1073.0',
      hitD: 'M 592.3 1053.7 L 600.2 1073.0',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'AS', label: 'Overlap Air Section (AS) KM 26+900', km: 'KM 26+900' },
      endDivider: { type: 'AS', label: 'Overlap Air Section (AS) KM 26+900', km: 'KM 26+900' },
    },

    // ========================================================
    // DISCONNECTING SWITCH (DS 1 - DS 20) - 20 SIMBOL AUTENTIK CAD
    // ========================================================
    {
      id: 'ds_01',
      code: 'DS 1',
      title: '( Disconnecting Switch 1 (NO) MRI-JNG (HI) )',
      km: 'KM 1+903',
      category: 'DISCONNECTING SWITCH (DS)',
      d: 'M 470.9 627.4 A 3 3 0 1 0 476.9 627.4 A 3 3 0 1 0 470.9 627.4 M 476.3 627.4 L 490.1 619.2 M 487.0 627.4 A 3 3 0 1 0 493.0 627.4 A 3 3 0 1 0 487.0 627.4',
      hitD: 'M 473.9 627.4 L 490.0 627.4',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'DS', label: 'DS 1 (NO)', km: 'KM 1+903' },
      endDivider: { type: 'JALUR', label: 'MRI-JNG (HI)', km: 'KM 1+903' },
    },
    {
      id: 'ds_02',
      code: 'DS 2',
      title: '( Disconnecting Switch 2 (NO) JNG-MRI (HU) )',
      km: 'KM 1+854',
      category: 'DISCONNECTING SWITCH (DS)',
      d: 'M 471.4 733.4 A 3 3 0 1 0 477.4 733.4 A 3 3 0 1 0 471.4 733.4 M 488.2 733.4 L 474.7 741.8 M 487.5 733.4 A 3 3 0 1 0 493.5 733.4 A 3 3 0 1 0 487.5 733.4',
      hitD: 'M 474.4 733.4 L 490.5 733.4',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'DS', label: 'DS 2 (NO)', km: 'KM 1+854' },
      endDivider: { type: 'JALUR', label: 'JNG-MRI (HU)', km: 'KM 1+854' },
    },
    {
      id: 'ds_03',
      code: 'DS 3',
      title: '( Disconnecting Switch 3 (NC) JALUR 2 )',
      km: 'KM 2+000',
      category: 'DISCONNECTING SWITCH (DS)',
      d: 'M 724.9 638.4 A 3 3 0 1 0 730.9 638.4 A 3 3 0 1 0 724.9 638.4 M 730.3 638.4 L 744.3 630.2 M 741.2 638.4 A 3 3 0 1 0 747.2 638.4 A 3 3 0 1 0 741.2 638.4',
      hitD: 'M 727.9 638.4 L 744.2 638.4',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'DS', label: 'DS 3 (NC)', km: 'KM 2+000' },
      endDivider: { type: 'JALUR', label: 'JALUR 2', km: 'KM 2+000' },
    },
    {
      id: 'ds_04',
      code: 'DS 4',
      title: '( Disconnecting Switch 4 (NC) JALUR 1 )',
      km: 'KM 2+000',
      category: 'DISCONNECTING SWITCH (DS)',
      d: 'M 725.4 733.4 A 3 3 0 1 0 731.4 733.4 A 3 3 0 1 0 725.4 733.4 M 742.3 733.4 L 728.4 740.8 M 741.6 733.4 A 3 3 0 1 0 747.6 733.4 A 3 3 0 1 0 741.6 733.4',
      hitD: 'M 728.4 733.4 L 744.6 733.4',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'DS', label: 'DS 4 (NC)', km: 'KM 2+000' },
      endDivider: { type: 'JALUR', label: 'JALUR 1', km: 'KM 2+000' },
    },
    {
      id: 'ds_05',
      code: 'DS 5',
      title: '( Disconnecting Switch 5 (NC) JALUR 2,3 )',
      km: 'KM 11+900',
      category: 'DISCONNECTING SWITCH (DS)',
      d: 'M 1472.8 592.9 A 3 3 0 1 0 1478.8 592.9 A 3 3 0 1 0 1472.8 592.9 M 1478.3 592.9 L 1492.1 584.5 M 1489.1 592.9 A 3 3 0 1 0 1495.1 592.9 A 3 3 0 1 0 1489.1 592.9',
      hitD: 'M 1475.8 592.9 L 1492.1 592.9',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'DS', label: 'DS 5 (NC)', km: 'KM 11+900' },
      endDivider: { type: 'JALUR', label: 'JALUR 2,3', km: 'KM 11+900' },
    },
    {
      id: 'ds_06',
      code: 'DS 6',
      title: '( Disconnecting Switch 6 (NC) JALUR 1 )',
      km: 'KM 11+900',
      category: 'DISCONNECTING SWITCH (DS)',
      d: 'M 1472.6 732.6 A 3 3 0 1 0 1478.6 732.6 A 3 3 0 1 0 1472.6 732.6 M 1489.5 732.7 L 1475.7 741.4 M 1488.8 732.6 A 3 3 0 1 0 1494.8 732.6 A 3 3 0 1 0 1488.8 732.6',
      hitD: 'M 1475.6 732.6 L 1491.8 732.6',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'DS', label: 'DS 6 (NC)', km: 'KM 11+900' },
      endDivider: { type: 'JALUR', label: 'JALUR 1', km: 'KM 11+900' },
    },
    {
      id: 'ds_07',
      code: 'DS 7',
      title: '( Disconnecting Switch 7 (NO) KLD-JNG HI )',
      km: 'KM 12+535',
      category: 'DISCONNECTING SWITCH (DS)',
      d: 'M 1938.2 627.4 A 3 3 0 1 0 1944.2 627.4 A 3 3 0 1 0 1938.2 627.4 M 1943.6 627.4 L 1957.5 619.2 M 1954.4 627.4 A 3 3 0 1 0 1960.4 627.4 A 3 3 0 1 0 1954.4 627.4',
      hitD: 'M 1941.2 627.4 L 1957.4 627.4',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'DS', label: 'DS 7 (NO)', km: 'KM 12+535' },
      endDivider: { type: 'JALUR', label: 'KLD-JNG HI', km: 'KM 12+535' },
    },
    {
      id: 'ds_08',
      code: 'DS 8',
      title: '( Disconnecting Switch 8 (NO) JNG-KLD HU )',
      km: 'KM 12+483',
      category: 'DISCONNECTING SWITCH (DS)',
      d: 'M 1938.7 733.8 A 3 3 0 1 0 1944.7 733.8 A 3 3 0 1 0 1938.7 733.8 M 1955.7 733.8 L 1941.8 742.4 M 1955.1 733.8 A 3 3 0 1 0 1961.1 733.8 A 3 3 0 1 0 1955.1 733.8',
      hitD: 'M 1941.7 733.8 L 1958.1 733.8',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'DS', label: 'DS 8 (NO)', km: 'KM 12+483' },
      endDivider: { type: 'JALUR', label: 'JNG-KLD HU', km: 'KM 12+483' },
    },
    {
      id: 'ds_09',
      code: 'DS 9',
      title: '( Disconnecting Switch 9 (NC) KLDB-BUA HI )',
      km: 'KM 17+900',
      category: 'DISCONNECTING SWITCH (DS)',
      d: 'M 2977.2 625.8 A 3 3 0 1 0 2983.2 625.8 A 3 3 0 1 0 2977.2 625.8 M 2982.6 625.8 L 2996.5 619.1 M 2993.4 625.8 A 3 3 0 1 0 2999.4 625.8 A 3 3 0 1 0 2993.4 625.8',
      hitD: 'M 2980.2 625.8 L 2996.4 625.8',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'DS', label: 'DS 9 (NC)', km: 'KM 17+900' },
      endDivider: { type: 'JALUR', label: 'KLDB-BUA HI', km: 'KM 17+900' },
    },
    {
      id: 'ds_10',
      code: 'DS 10',
      title: '( Disconnecting Switch 10 (NC) BUA-KLDB HU )',
      km: 'KM 17+900',
      category: 'DISCONNECTING SWITCH (DS)',
      d: 'M 2977.7 731.9 A 3 3 0 1 0 2983.7 731.9 A 3 3 0 1 0 2977.7 731.9 M 2994.6 731.9 L 2980.7 738.7 M 2993.9 731.9 A 3 3 0 1 0 2999.9 731.9 A 3 3 0 1 0 2993.9 731.9',
      hitD: 'M 2980.7 731.9 L 2996.9 731.9',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'DS', label: 'DS 10 (NC)', km: 'KM 17+900' },
      endDivider: { type: 'JALUR', label: 'BUA-KLDB HU', km: 'KM 17+900' },
    },
    {
      id: 'ds_11',
      code: 'DS 11',
      title: '( Disconnecting Switch 11 (NO) CUK-KLDB HI )',
      km: 'KM 20+196',
      category: 'DISCONNECTING SWITCH (DS)',
      d: 'M 2807.2 1141.9 A 3 3 0 1 0 2813.2 1141.9 A 3 3 0 1 0 2807.2 1141.9 M 2812.7 1142.0 L 2826.3 1150.4 M 2823.6 1141.9 A 3 3 0 1 0 2829.6 1141.9 A 3 3 0 1 0 2823.6 1141.9',
      hitD: 'M 2810.2 1141.9 L 2826.6 1141.9',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'DS', label: 'DS 11 (NO)', km: 'KM 20+196' },
      endDivider: { type: 'JALUR', label: 'CUK-KLDB HI', km: 'KM 20+196' },
    },
    {
      id: 'ds_12',
      code: 'DS 12',
      title: '( Disconnecting Switch 12 (NO) KLDB-CUK HU )',
      km: 'KM 20+137',
      category: 'DISCONNECTING SWITCH (DS)',
      d: 'M 2802.2 1037.2 A 3 3 0 1 0 2808.2 1037.2 A 3 3 0 1 0 2802.2 1037.2 M 2819.2 1037.3 L 2805.3 1029.2 M 2818.4 1037.2 A 3 3 0 1 0 2824.4 1037.2 A 3 3 0 1 0 2818.4 1037.2',
      hitD: 'M 2805.2 1037.2 L 2821.4 1037.2',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'DS', label: 'DS 12 (NO)', km: 'KM 20+137' },
      endDivider: { type: 'JALUR', label: 'KLDB-CUK HU', km: 'KM 20+137' },
    },
    {
      id: 'ds_13',
      code: 'DS 13',
      title: '( Disconnecting Switch 13 (NC) KRI-CUK HI )',
      km: 'KM 21+400',
      category: 'DISCONNECTING SWITCH (DS)',
      d: 'M 2324.2 1140.8 A 3 3 0 1 0 2330.2 1140.8 A 3 3 0 1 0 2324.2 1140.8 M 2329.6 1140.9 L 2343.5 1147.6 M 2340.4 1140.8 A 3 3 0 1 0 2346.4 1140.8 A 3 3 0 1 0 2340.4 1140.8',
      hitD: 'M 2327.2 1140.8 L 2343.4 1140.8',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'DS', label: 'DS 13 (NC)', km: 'KM 21+400' },
      endDivider: { type: 'JALUR', label: 'KRI-CUK HI', km: 'KM 21+400' },
    },
    {
      id: 'ds_14',
      code: 'DS 14',
      title: '( Disconnecting Switch 14 (NC) CUK-KRI HU )',
      km: 'KM 21+400',
      category: 'DISCONNECTING SWITCH (DS)',
      d: 'M 2324.8 1034.8 A 3 3 0 1 0 2330.8 1034.8 A 3 3 0 1 0 2324.8 1034.8 M 2341.6 1034.8 L 2327.8 1028.1 M 2340.9 1034.8 A 3 3 0 1 0 2346.9 1034.8 A 3 3 0 1 0 2340.9 1034.8',
      hitD: 'M 2327.8 1034.8 L 2343.9 1034.8',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'DS', label: 'DS 14 (NC)', km: 'KM 21+400' },
      endDivider: { type: 'JALUR', label: 'CUK-KRI HU', km: 'KM 21+400' },
    },
    {
      id: 'ds_15',
      code: 'DS 15',
      title: '( Disconnecting Switch 15 (NC) EMP BKS (HI) )',
      km: 'KM 26+226',
      category: 'DISCONNECTING SWITCH (DS)',
      d: 'M 1379.3 1137.3 A 3 3 0 1 0 1385.3 1137.3 A 3 3 0 1 0 1379.3 1137.3 M 1391.9 1139.0 L 1381.5 1144.8 M 1390.8 1137.7 A 3 3 0 1 0 1396.8 1137.7 A 3 3 0 1 0 1390.8 1137.7',
      hitD: 'M 1382.3 1137.3 L 1393.8 1137.7',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'DS', label: 'DS 15 (NC)', km: 'KM 26+226' },
      endDivider: { type: 'JALUR', label: 'EMP BKS (HI)', km: 'KM 26+226' },
    },
    {
      id: 'ds_16',
      code: 'DS 16',
      title: '( Disconnecting Switch 16 (NC) EMP BKS (HU) )',
      km: 'KM 26+200',
      category: 'DISCONNECTING SWITCH (DS)',
      d: 'M 1379.4 1041.8 A 3 3 0 1 0 1385.4 1041.8 A 3 3 0 1 0 1379.4 1041.8 M 1396.1 1041.9 L 1383.3 1034.8 M 1395.2 1041.8 A 3 3 0 1 0 1401.2 1041.8 A 3 3 0 1 0 1395.2 1041.8',
      hitD: 'M 1382.4 1041.8 L 1398.2 1041.8',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'DS', label: 'DS 16 (NC)', km: 'KM 26+200' },
      endDivider: { type: 'JALUR', label: 'EMP BKS (HU)', km: 'KM 26+200' },
    },
    {
      id: 'ds_17',
      code: 'DS 17',
      title: '( Disconnecting Switch 17 (NC) EMP BKS (4-5) )',
      km: 'KM 26+300',
      category: 'DISCONNECTING SWITCH (DS)',
      d: 'M 1250.2 1256.8 A 3 3 0 1 0 1256.2 1256.8 A 3 3 0 1 0 1250.2 1256.8 M 1253.3 1254.5 L 1244.9 1240.7 M 1250.2 1240.7 A 3 3 0 1 0 1256.2 1240.7 A 3 3 0 1 0 1250.2 1240.7',
      hitD: 'M 1253.2 1256.8 L 1253.2 1240.7',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'DS', label: 'DS 17 (NC)', km: 'KM 26+300' },
      endDivider: { type: 'JALUR', label: 'EMP BKS (4-5)', km: 'KM 26+300' },
    },
    {
      id: 'ds_18',
      code: 'DS 18',
      title: '( Disconnecting Switch 18 (NC) EMP BKS (6-7,8) )',
      km: 'KM 26+300',
      category: 'DISCONNECTING SWITCH (DS)',
      d: 'M 1196.1 1256.9 A 3 3 0 1 0 1202.1 1256.9 A 3 3 0 1 0 1196.1 1256.9 M 1199.1 1254.6 L 1190.9 1240.8 M 1196.1 1240.8 A 3 3 0 1 0 1202.1 1240.8 A 3 3 0 1 0 1196.1 1240.8',
      hitD: 'M 1199.1 1256.9 L 1199.1 1240.8',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'DS', label: 'DS 18 (NC)', km: 'KM 26+300' },
      endDivider: { type: 'JALUR', label: 'EMP BKS (6-7,8)', km: 'KM 26+300' },
    },
    {
      id: 'ds_19',
      code: 'DS 19',
      title: '( Disconnecting Switch 19 (NC) BKT-BKS (HI) )',
      km: 'KM 26+800',
      category: 'DISCONNECTING SWITCH (DS)',
      d: 'M 635.7 1138.2 A 3 3 0 1 0 641.7 1138.2 A 3 3 0 1 0 635.7 1138.2 M 641.2 1138.2 L 653.9 1145.3 M 651.5 1138.2 A 3 3 0 1 0 657.5 1138.2 A 3 3 0 1 0 651.5 1138.2',
      hitD: 'M 638.7 1138.2 L 654.5 1138.2',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'DS', label: 'DS 19 (NC)', km: 'KM 26+800' },
      endDivider: { type: 'JALUR', label: 'BKT-BKS (HI)', km: 'KM 26+800' },
    },
    {
      id: 'ds_20',
      code: 'DS 20',
      title: '( Disconnecting Switch 20 (NC) BKS-BKT (HU) )',
      km: 'KM 26+800',
      category: 'DISCONNECTING SWITCH (DS)',
      d: 'M 634.8 1042.4 A 3 3 0 1 0 640.8 1042.4 A 3 3 0 1 0 634.8 1042.4 M 651.4 1042.5 L 638.6 1035.3 M 650.7 1042.4 A 3 3 0 1 0 656.7 1042.4 A 3 3 0 1 0 650.7 1042.4',
      hitD: 'M 637.8 1042.4 L 653.7 1042.4',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'DS', label: 'DS 20 (NC)', km: 'KM 26+800' },
      endDivider: { type: 'JALUR', label: 'BKS-BKT (HU)', km: 'KM 26+800' },
    },

// ========================================================
    // SECTION INSULATOR (FRP) - JATINEGARA S/D BEKASI (23 TITIK)
    // ========================================================
    {
      id: 'frp_jng_01_31a1',
      code: 'FRP-JNG-01-31A1',
      title: '( Section Insulator (FRP-JNG-01-31A1) )',
      km: 'KM 11+350',
      category: 'SECTION INSULATOR (FRP)',
      d: 'M 568.84 678.56 L 574.0 683.48 M 573.04 674.6 L 578.2 679.52',
      hitD: 'M 568.84 678.56 L 574.0 683.48 M 573.04 674.6 L 578.2 679.52 M 571.42 681.02 L 575.62 677.06',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'FRP', label: '( Section Insulator (FRP-JNG-01-31A1) )', km: 'KM 11+350' },
      endDivider: { type: 'WESEL', label: 'Wesel W31A1 Jatinegara', km: 'KM 11+350' },
    },
    {
      id: 'frp_jng_02_11a',
      code: 'FRP-JNG-02-11A',
      title: '( Section Insulator (FRP-JNG-02-11A) )',
      km: 'KM 11+500',
      category: 'SECTION INSULATOR (FRP)',
      d: 'M 652.84 628.04 L 658.0 633.08 M 657.04 624.08 L 662.2 629.12',
      hitD: 'M 652.84 628.04 L 658.0 633.08 M 657.04 624.08 L 662.2 629.12 M 655.42 630.56 L 659.62 626.60',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'FRP', label: '( Section Insulator (FRP-JNG-02-11A) )', km: 'KM 11+500' },
      endDivider: { type: 'WESEL', label: 'Wesel W11A Jatinegara', km: 'KM 11+500' },
    },
    {
      id: 'frp_jng_03_21a2',
      code: 'FRP-JNG-03-21A2',
      title: '( Section Insulator (FRP-JNG-03-21A2) )',
      km: 'KM 11+600',
      category: 'SECTION INSULATOR (FRP)',
      d: 'M 790.48 602.24 L 790.6 609.44 M 796.24 602.36 L 796.36 609.44',
      hitD: 'M 790.48 602.24 L 790.6 609.44 M 796.24 602.36 L 796.36 609.44 M 790.54 605.84 L 796.30 605.90',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'FRP', label: '( Section Insulator (FRP-JNG-03-21A2) )', km: 'KM 11+600' },
      endDivider: { type: 'WESEL', label: 'Wesel W21A2 Jatinegara', km: 'KM 11+600' },
    },
    {
      id: 'frp_jng_04_31c1',
      code: 'FRP-JNG-04-31C1',
      title: '( Section Insulator (FRP-JNG-04-31C1) )',
      km: 'KM 11+800',
      category: 'SECTION INSULATOR (FRP)',
      d: 'M 976.96 686.72 L 972.28 692.24 M 980.92 690.32 L 976.24 695.72',
      hitD: 'M 976.96 686.72 L 972.28 692.24 M 980.92 690.32 L 976.24 695.72 M 974.62 689.48 L 978.58 693.02',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'FRP', label: '( Section Insulator (FRP-JNG-04-31C1) )', km: 'KM 11+800' },
      endDivider: { type: 'WESEL', label: 'Wesel W31C1 Jatinegara', km: 'KM 11+800' },
    },
    {
      id: 'frp_jng_05_31c2',
      code: 'FRP-JNG-05-31C2',
      title: '( Section Insulator (FRP-JNG-05-31C2) )',
      km: 'KM 11+800',
      category: 'SECTION INSULATOR (FRP)',
      d: 'M 952.48 692.12 L 947.8 686.72 M 948.4 695.6 L 943.72 690.2',
      hitD: 'M 952.48 692.12 L 947.8 686.72 M 948.4 695.6 L 943.72 690.2 M 950.14 689.42 L 946.06 692.90',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'FRP', label: '( Section Insulator (FRP-JNG-05-31C2) )', km: 'KM 11+800' },
      endDivider: { type: 'WESEL', label: 'Wesel W31C2 Jatinegara', km: 'KM 11+800' },
    },
    {
      id: 'frp_jng_06_41b',
      code: 'FRP-JNG-06-41B',
      title: '( Section Insulator (FRP-JNG-06-41B) )',
      km: 'KM 11+500',
      category: 'SECTION INSULATOR (FRP)',
      d: 'M 1014.04 487.28 L 1019.2 492.32 M 1018.24 483.32 L 1023.4 488.36',
      hitD: 'M 1014.04 487.28 L 1019.2 492.32 M 1018.24 483.32 L 1023.4 488.36 M 1016.62 489.80 L 1020.82 485.84',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'FRP', label: '( Section Insulator (FRP-JNG-06-41B) )', km: 'KM 11+500' },
      endDivider: { type: 'WESEL', label: 'Wesel W41B Jatinegara', km: 'KM 11+500' },
    },
    {
      id: 'frp_jng_07_21c1',
      code: 'FRP-JNG-07-21C1',
      title: '( Section Insulator (FRP-JNG-07-21C1) )',
      km: 'KM 11+448',
      category: 'SECTION INSULATOR (FRP)',
      d: 'M 820.84 462.92 L 815.44 467.72 M 824.32 467.12 L 818.92 471.8',
      hitD: 'M 820.84 462.92 L 815.44 467.72 M 824.32 467.12 L 818.92 471.8 M 818.14 465.32 L 821.62 469.46',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'FRP', label: '( Section Insulator (FRP-JNG-07-21C1) )', km: 'KM 11+448' },
      endDivider: { type: 'WESEL', label: 'Wesel W21C1 Jatinegara', km: 'KM 11+448' },
    },
    {
      id: 'frp_jng_08_81a1',
      code: 'FRP-JNG-08-81A1',
      title: '( Section Insulator (FRP-JNG-08-81A1) )',
      km: 'KM 11+350',
      category: 'SECTION INSULATOR (FRP)',
      d: 'M 670.6 378.8 L 665.8 384.2 M 674.56 382.4 L 669.88 387.8',
      hitD: 'M 670.6 378.8 L 665.8 384.2 M 674.56 382.4 L 669.88 387.8 M 668.20 381.50 L 672.22 385.10',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'FRP', label: '( Section Insulator (FRP-JNG-08-81A1) )', km: 'KM 11+350' },
      endDivider: { type: 'WESEL', label: 'Wesel W81A1 Jatinegara', km: 'KM 11+350' },
    },
    {
      id: 'frp_jng_09_81a2',
      code: 'FRP-JNG-09-81A2',
      title: '( Section Insulator (FRP-JNG-09-81A2) )',
      km: 'KM 11+350',
      category: 'SECTION INSULATOR (FRP)',
      d: 'M 692.92 382.16 L 697.48 387.68 M 697.12 378.68 L 701.68 384.32',
      hitD: 'M 692.92 382.16 L 697.48 387.68 M 697.12 378.68 L 701.68 384.32 M 695.20 384.92 L 699.40 381.50',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'FRP', label: '( Section Insulator (FRP-JNG-09-81A2) )', km: 'KM 11+350' },
      endDivider: { type: 'WESEL', label: 'Wesel W81A2 Jatinegara', km: 'KM 11+350' },
    },
    {
      id: 'frp_jng_10_jalur_4',
      code: 'FRP-JNG-10-JALUR 4',
      title: '( Section Insulator (FRP-JNG-10-JALUR 4) )',
      km: 'KM 12+089',
      category: 'SECTION INSULATOR (FRP)',
      d: 'M 1628.32 556.88 L 1628.44 563.96 M 1633.84 556.88 L 1634.08 563.96',
      hitD: 'M 1628.32 556.88 L 1628.44 563.96 M 1633.84 556.88 L 1634.08 563.96 M 1628.38 560.42 L 1633.96 560.42',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'FRP', label: '( Section Insulator (FRP-JNG-10-JALUR 4) )', km: 'KM 12+089' },
      endDivider: { type: 'WESEL', label: 'Jalur 4 Jatinegara', km: 'KM 12+089' },
    },
    {
      id: 'frp_jng_11_23b2',
      code: 'FRP-JNG-11-23B2',
      title: '( Section Insulator (FRP-JNG-11-23B2) )',
      km: 'KM 12+000',
      category: 'SECTION INSULATOR (FRP)',
      d: 'M 1616.56 577.64 L 1611.16 582.44 M 1620.04 581.84 L 1614.64 586.52',
      hitD: 'M 1616.56 577.64 L 1611.16 582.44 M 1620.04 581.84 L 1614.64 586.52 M 1613.86 580.04 L 1617.34 584.18',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'FRP', label: '( Section Insulator (FRP-JNG-11-23B2) )', km: 'KM 12+000' },
      endDivider: { type: 'WESEL', label: 'Wesel W23B2 Jatinegara', km: 'KM 12+000' },
    },
    {
      id: 'frp_jng_13_13d1',
      code: 'FRP-JNG-13-13D1',
      title: '( Section Insulator (FRP-JNG-13-13D1) )',
      km: 'KM 12+384',
      category: 'SECTION INSULATOR (FRP)',
      d: 'M 1712.68 577.88 L 1707.28 582.56 M 1716.16 581.96 L 1710.64 586.76',
      hitD: 'M 1712.68 577.88 L 1707.28 582.56 M 1716.16 581.96 L 1710.64 586.76 M 1709.98 580.22 L 1713.40 584.36',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'FRP', label: '( Section Insulator (FRP-JNG-13-13D1) )', km: 'KM 12+384' },
      endDivider: { type: 'WESEL', label: 'Wesel W13D1 Jatinegara', km: 'KM 12+384' },
    },
    {
      id: 'frp_jng_14_33b2',
      code: 'FRP-JNG-14-33B2',
      title: '( Section Insulator (FRP-JNG-14-33B2) )',
      km: 'KM 12+180',
      category: 'SECTION INSULATOR (FRP)',
      d: 'M 1769.68 673.4 L 1764.16 678.08 M 1773.16 677.48 L 1767.64 682.16',
      hitD: 'M 1769.68 673.4 L 1764.16 678.08 M 1773.16 677.48 L 1767.64 682.16 M 1766.92 675.74 L 1770.40 679.82',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'FRP', label: '( Section Insulator (FRP-JNG-14-33B2) )', km: 'KM 12+180' },
      endDivider: { type: 'WESEL', label: 'Wesel W33B2 Jatinegara', km: 'KM 12+180' },
    },
    {
      id: 'frp_jng_15_33c1',
      code: 'FRP-JNG-15-33C1',
      title: '( Section Insulator (FRP-JNG-15-33C1) )',
      km: 'KM 12+283',
      category: 'SECTION INSULATOR (FRP)',
      d: 'M 1769.68 625.28 L 1764.16 629.96 M 1773.16 629.36 L 1767.64 634.04',
      hitD: 'M 1769.68 625.28 L 1764.16 629.96 M 1773.16 629.36 L 1767.64 634.04 M 1766.92 627.62 L 1770.40 631.70',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'FRP', label: '( Section Insulator (FRP-JNG-15-33C1) )', km: 'KM 12+283' },
      endDivider: { type: 'WESEL', label: 'Wesel W33C1 Jatinegara', km: 'KM 12+283' },
    },
    {
      id: 'frp_jng_16_33c2',
      code: 'FRP-JNG-16-33C2',
      title: '( Section Insulator (FRP-JNG-16-33C2) )',
      km: 'KM 12+350',
      category: 'SECTION INSULATOR (FRP)',
      d: 'M 1854.04 673.4 L 1848.64 678.08 M 1857.52 677.48 L 1852.0 682.16',
      hitD: 'M 1854.04 673.4 L 1848.64 678.08 M 1857.52 677.48 L 1852.0 682.16 M 1851.34 675.74 L 1854.76 679.82',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'FRP', label: '( Section Insulator (FRP-JNG-16-33C2) )', km: 'KM 12+350' },
      endDivider: { type: 'WESEL', label: 'Wesel W33C2 Jatinegara', km: 'KM 12+350' },
    },
    {
      id: 'frp_jng_17_11a',
      code: 'FRP-JNG-17-11A',
      title: '( Section Insulator (FRP-JNG-17-11A) )',
      km: 'KM 20+800',
      category: 'SECTION INSULATOR (FRP)',
      d: 'M 2645.8 1092.08 L 2650.84 1086.92 M 2641.72 1087.28 L 2646.76 1082.12',
      hitD: 'M 2645.8 1092.08 L 2650.84 1086.92 M 2641.72 1087.28 L 2646.76 1082.12 M 2648.32 1089.50 L 2644.24 1084.70',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'FRP', label: '( Section Insulator (FRP-JNG-17-11A) )', km: 'KM 20+800' },
      endDivider: { type: 'WESEL', label: 'Wesel W11A Cakung', km: 'KM 20+800' },
    },
    {
      id: 'frp_jng_18_23b',
      code: 'FRP-JNG-18-23B',
      title: '( Section Insulator (FRP-JNG-18-23B) )',
      km: 'KM 20+500',
      category: 'SECTION INSULATOR (FRP)',
      d: 'M 2382.28 1087.16 L 2388.28 1091.12 M 2386.12 1082.24 L 2392.12 1086.2',
      hitD: 'M 2382.28 1087.16 L 2388.28 1091.12 M 2386.12 1082.24 L 2392.12 1086.2 M 2385.28 1089.14 L 2389.12 1084.22',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'FRP', label: '( Section Insulator (FRP-JNG-18-23B) )', km: 'KM 20+500' },
      endDivider: { type: 'WESEL', label: 'Wesel W23B Cakung', km: 'KM 20+500' },
    },
    {
      id: 'frp_jng_19_51a',
      code: 'FRP-JNG-19-51A',
      title: '( Section Insulator (FRP-JNG-19-51A) )',
      km: 'KM 25+950',
      category: 'SECTION INSULATOR (FRP)',
      d: 'M 1524.76 1092.92 L 1530.28 1088.24 M 1521.28 1088.84 L 1526.8 1084.16',
      hitD: 'M 1524.76 1092.92 L 1530.28 1088.24 M 1521.28 1088.84 L 1526.8 1084.16 M 1527.52 1090.58 L 1524.04 1086.50',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'FRP', label: '( Section Insulator (FRP-JNG-19-51A) )', km: 'KM 25+950' },
      endDivider: { type: 'WESEL', label: 'Wesel W51A Bekasi', km: 'KM 25+950' },
    },
    {
      id: 'frp_jng_20_51b',
      code: 'FRP-JNG-20-51B',
      title: '( Section Insulator (FRP-JNG-20-51B) )',
      km: 'KM 26+050',
      category: 'SECTION INSULATOR (FRP)',
      d: 'M 1456.72 1090.4 L 1451.56 1085.36 M 1452.52 1094.36 L 1447.36 1089.32',
      hitD: 'M 1456.72 1090.4 L 1451.56 1085.36 M 1452.52 1094.36 L 1447.36 1089.32 M 1454.14 1087.88 L 1449.94 1091.84',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'FRP', label: '( Section Insulator (FRP-JNG-20-51B) )', km: 'KM 26+050' },
      endDivider: { type: 'WESEL', label: 'Wesel W51B Bekasi', km: 'KM 26+050' },
    },
    {
      id: 'frp_jng_21_jalur_5',
      code: 'FRP-JNG-21-JALUR 5',
      title: '( Section Insulator (FRP-JNG-21-JALUR 5) )',
      km: 'KM 26+100',
      category: 'SECTION INSULATOR (FRP)',
      d: 'M 1389.64 1109.0 L 1389.4 1116.2 M 1383.88 1109.12 L 1383.64 1116.2',
      hitD: 'M 1389.64 1109.0 L 1389.4 1116.2 M 1383.88 1109.12 L 1383.64 1116.2 M 1389.52 1112.60 L 1383.76 1112.66',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'FRP', label: '( Section Insulator (FRP-JNG-21-JALUR 5) )', km: 'KM 26+100' },
      endDivider: { type: 'WESEL', label: 'Jalur 5 Bekasi', km: 'KM 26+100' },
    },
    {
      id: 'frp_jng_22_jalur_6',
      code: 'FRP-JNG-22-JALUR 6',
      title: '( Section Insulator (FRP-JNG-22-JALUR 6) )',
      km: 'KM 26+150',
      category: 'SECTION INSULATOR (FRP)',
      d: 'M 1393.0 1059.44 L 1392.88 1066.64 M 1387.24 1059.44 L 1387.12 1066.64',
      hitD: 'M 1393.0 1059.44 L 1392.88 1066.64 M 1387.24 1059.44 L 1387.12 1066.64 M 1392.94 1063.04 L 1387.18 1063.04',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'FRP', label: '( Section Insulator (FRP-JNG-22-JALUR 6) )', km: 'KM 26+150' },
      endDivider: { type: 'WESEL', label: 'Jalur 6 Bekasi', km: 'KM 26+150' },
    },
    {
      id: 'frp_jng_23_71c1',
      code: 'FRP-JNG-23-71C1',
      title: '( Section Insulator (FRP-JNG-23-71C1) )',
      km: 'KM 26+300',
      category: 'SECTION INSULATOR (FRP)',
      d: 'M 1319.8 1042.64 L 1325.2 1037.96 M 1316.32 1038.44 L 1321.72 1033.76',
      hitD: 'M 1319.8 1042.64 L 1325.2 1037.96 M 1316.32 1038.44 L 1321.72 1033.76 M 1322.50 1040.30 L 1319.02 1036.10',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'FRP', label: '( Section Insulator (FRP-JNG-23-71C1) )', km: 'KM 26+300' },
      endDivider: { type: 'WESEL', label: 'Wesel W71C1 Bekasi', km: 'KM 26+300' },
    },
    {
      id: 'frp_jng_24_51c',
      code: 'FRP-JNG-24-51C',
      title: '( Section Insulator (FRP-JNG-24-51C) )',
      km: 'KM 26+350',
      category: 'SECTION INSULATOR (FRP)',
      d: 'M 1326.04 1141.76 L 1320.88 1136.84 M 1321.84 1145.72 L 1316.68 1140.8',
      hitD: 'M 1326.04 1141.76 L 1320.88 1136.84 M 1321.84 1145.72 L 1316.68 1140.8 M 1323.46 1139.30 L 1319.26 1143.26',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'FRP', label: '( Section Insulator (FRP-JNG-24-51C) )', km: 'KM 26+350' },
      endDivider: { type: 'WESEL', label: 'Wesel W51C Bekasi', km: 'KM 26+350' },
    },
    {
      id: 'frp_jng_25_33a',
      code: 'FRP-JNG-25-33A',
      title: '( Section Insulator (FRP-JNG-25-33A) )',
      km: 'KM 26+600',
      category: 'SECTION INSULATOR (FRP)',
      d: 'M 798.4 1145.6 L 803.8 1140.92 M 794.92 1141.52 L 800.32 1136.84',
      hitD: 'M 798.4 1145.6 L 803.8 1140.92 M 794.92 1141.52 L 800.32 1136.84 M 801.10 1143.26 L 797.62 1139.18',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'FRP', label: '( Section Insulator (FRP-JNG-25-33A) )', km: 'KM 26+600' },
      endDivider: { type: 'WESEL', label: 'Wesel W33A Bekasi', km: 'KM 26+600' },
    },
    {
      id: 'frp_jng_26_73',
      code: 'FRP-JNG-26-73',
      title: '( Section Insulator (FRP-JNG-26-73) )',
      km: 'KM 26+500',
      category: 'SECTION INSULATOR (FRP)',
      d: 'M 805.36 1034.84 L 810.52 1039.88 M 809.56 1030.88 L 814.72 1035.92',
      hitD: 'M 805.36 1034.84 L 810.52 1039.88 M 809.56 1030.88 L 814.72 1035.92 M 807.94 1037.36 L 812.14 1033.40',
      color: '#000000',
      isCrossing: true,
      startDivider: { type: 'FRP', label: '( Section Insulator (FRP-JNG-26-73) )', km: 'KM 26+500' },
      endDivider: { type: 'WESEL', label: 'Wesel W73 Bekasi', km: 'KM 26+500' },
    },
  ];

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
        
        {/* Left Instruction */}
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

        {/* Right Tools: Resolution & Zoom */}
        <div className="flex items-center justify-between sm:justify-end gap-1.5 sm:gap-2 shrink-0 w-full sm:w-auto">
          
          

          <div className="flex items-center space-x-0.5 sm:space-x-1 bg-slate-100 rounded-xl p-0.5 sm:p-1 border border-slate-200">
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

            <span className="text-[11px] sm:text-xs font-mono font-bold px-1 sm:px-2 text-slate-800 min-w-12 sm:min-w-16 text-center">
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
                  style={{ backgroundColor: hoveredLine.color }}
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
              viewBox="0 0 3275 1419"
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ width: '100%', height: '100%' }}
            >
              {allTrackLines.map((line) => {
                const isHovered = hoveredLine?.id === line.id;
                // CRITICAL FIX: Only match strictly by unique line.id so clicking 1 line NEVER highlights 3 lines!
                const isActive = selectedLocation?.id === line.id;

                return (
                  <g
                    key={line.id}
                    className="pointer-events-auto cursor-pointer"
                    onMouseEnter={() => setHoveredLine(line)}
                    onMouseLeave={() => setHoveredLine(null)}
                    onClick={() => {
                      setHoveredLine(line);
                      if (onSelectLocation) onSelectLocation(line);
                    }}
                  >
                    {/* 1. Generous 34px hit-area for effortless cursor detection */}
                    <path
                      d={line.hitD || line.d}
                      stroke="transparent"
                      strokeWidth={line.isCrossing ? 42 : 34}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />

                    {/* 2. On Hover or Active (1 line only): Glowing Line in authentic color (BLACK for DS, FRP, AS/AJ) */}
                    {(isHovered || isActive) && (() => {
                      const isSymbol = line.category === 'DISCONNECTING SWITCH (DS)' ||
                                       line.category === 'SECTION INSULATOR (FRP)' ||
                                       line.category === 'PEMISAH SEKSI (AS/AJ)' ||
                                       line.id.startsWith('ds_') ||
                                       line.id.startsWith('frp_') ||
                                       line.id.startsWith('overlap_');
                      
                      const strokeCol = isSymbol ? '#000000' : line.color;
                      const outerStrokeCol = isSymbol ? '#ffffff' : line.color;
                      const outerWidth = isSymbol ? (line.id.startsWith('ds_') ? '8' : '10') : '11';
                      const coreWidth = isSymbol ? (line.id.startsWith('ds_') ? '4' : '6') : '6';
                      const glowFilter = isSymbol
                        ? 'drop-shadow(0 0 6px rgba(0,0,0,0.9)) drop-shadow(0 0 12px rgba(0,0,0,0.6))'
                        : `drop-shadow(0 0 10px ${line.color}) drop-shadow(0 0 20px ${line.color})`;

                      return (
                        <>
                          {/* Outer Glow / Halo (White for black symbols for crisp high contrast) */}
                          <path
                            d={line.d}
                            stroke={outerStrokeCol}
                            strokeWidth={outerWidth}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                            style={{
                              opacity: isSymbol ? 0.95 : 0.85,
                              filter: isSymbol ? undefined : glowFilter,
                            }}
                          />

                          {/* Core Solid Line (BLACK for DS, FRP, AS/AJ) */}
                          <path
                            d={line.d}
                            stroke={strokeCol}
                            strokeWidth={coreWidth}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                            style={{
                              filter: isSymbol ? glowFilter : 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
                            }}
                          />

                          {/* 3D Embossed White Laser Centerline for regular track lines */}
                          {!isSymbol && (
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
            </svg>

          </div>
        </div>

      </div>
    </div>
  );
}
