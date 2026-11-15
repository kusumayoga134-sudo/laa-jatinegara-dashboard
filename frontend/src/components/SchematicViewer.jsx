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
  const pinchRef = useRef({ distance: 0, initialZoom: 1 });
  const touchStartPos = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);

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

  const imageSrc = viewMode === 'hd' ? '/peta-laa-cropped-hd.png' : '/peta-laa-cropped.png';

  // Complete List of Catenary Lines:
  // - Horizontal Naspan Tracks (46 Segments)
  // - Diagonal / Sloping Crossing Turnouts (17 Segments)
  // Every single segment has a strictly unique ID so only 1 line glows when clicked!
  const allTrackLines = [
  {
    id: 'kpb_jng_hi_aj',
    code: 'NASPAN 9 KPB-JNG',
    title: 'AJ KM 10+000 (Percabangan Kramat Hilir)',
    km: 'KM 10+000',
    category: 'PERCABANGAN KRAMAT',
    d: 'M 171.9 370.2 L 207.0 370.2',
    color: '#ff7fdf',
    xStart: 171.9,
    xEnd: 207.0,
    y: 370.2,
    startDivider: { type: 'AJ', label: 'Air Joint (AJ KM 10+000)', km: 'KM 10+000' },
    endDivider: { type: 'WESEL', label: 'Wesel Masuk Kramat', km: 'KM 10+050' },
  },
  {
    id: 'kpb_jng_hi_naspan9',
    code: 'NASPAN 9 KPB-JNG',
    title: 'NASPAN 9 KPB-JNG (Percabangan Kramat Hilir)',
    km: 'KM 10+000 - KM 10+400',
    category: 'PERCABANGAN KRAMAT',
    d: 'M 218.7 370.4 L 587.7 370.4',
    color: '#ff7fdf',
    xStart: 218.7,
    xEnd: 587.7,
    y: 370.4,
    startDivider: { type: 'AJ', label: 'Air Joint (AJ KM 10+000)', km: 'KM 10+000' },
    endDivider: { type: 'AS', label: 'Air Section (AS KM 10+400)', km: 'KM 10+400' },
  },
  {
    id: 'kpb_jng_hi_approach',
    code: 'ST. JATINEGARA',
    title: 'Jalur Pendekat Hilir Masuk Jatinegara dari Kramat',
    km: 'KM 10+400 - KM 11+000',
    category: 'PERCABANGAN KRAMAT',
    d: 'M 600.9 370.3 L 713.7 370.4',
    color: '#139a47',
    xStart: 600.9,
    xEnd: 713.7,
    y: 370.3,
    startDivider: { type: 'AS', label: 'Air Section (AS KM 10+400)', km: 'KM 10+400' },
    endDivider: { type: 'WESEL', label: 'Kompleks Wesel Kramat-JNG', km: 'KM 11+000' },
  },
  {
    id: 'kpb_jng_hu_aj',
    code: 'ST. PONDOK JATI',
    title: 'AJ KM 10+000 (Percabangan Kramat Hulu)',
    km: 'KM 10+000',
    category: 'ST. PONDOK JATI',
    d: 'M 171.9 418.2 L 206.8 418.2',
    color: '#ff0000',
    xStart: 171.9,
    xEnd: 206.8,
    y: 418.2,
    startDivider: { type: 'AJ', label: 'Air Joint (AJ KM 10+000)', km: 'KM 10+000' },
    endDivider: { type: 'WESEL', label: 'Wesel Kramat Hulu', km: 'KM 10+050' },
  },
  {
    id: 'kpb_jng_hu_naspan',
    code: 'ST. PONDOK JATI',
    title: 'ST. PONDOK JATI (Jalur Hulu)',
    km: 'KM 10+000 - KM 10+400',
    category: 'ST. PONDOK JATI',
    d: 'M 218.7 418.2 L 587.7 418.2',
    color: '#ff0000',
    xStart: 218.7,
    xEnd: 587.7,
    y: 418.2,
    startDivider: { type: 'AJ', label: 'Air Joint (AJ KM 10+000)', km: 'KM 10+000' },
    endDivider: { type: 'AS', label: 'Air Section (AS KM 10+400)', km: 'KM 10+400' },
  },
  {
    id: 'kpb_jng_hu_approach',
    code: 'ST. JATINEGARA',
    title: 'Jalur Pendekat Hulu Masuk Jatinegara dari Pondok Jati',
    km: 'KM 10+400 - KM 11+000',
    category: 'PERCABANGAN KRAMAT',
    d: 'M 599.3 417.8 L 713.7 417.8',
    color: '#cc6827',
    xStart: 599.3,
    xEnd: 713.7,
    y: 417.8,
    startDivider: { type: 'AS', label: 'Air Section (AS KM 10+400)', km: 'KM 10+400' },
    endDivider: { type: 'WESEL', label: 'Kompleks Wesel Barat JNG', km: 'KM 11+000' },
  },
  {
    id: 'mri_jng_hi_western',
    code: 'PETAK MRI-JNG',
    title: 'Petak Manggarai - Jatinegara (Jalur Hilir Barat)',
    km: 'KM 11+000 - KM 11+400',
    category: 'PETAK MANGGARAI - JATINEGARA',
    d: 'M 310.2 656.1 L 474.5 656.1',
    color: '#8a6ddd',
    xStart: 310.2,
    xEnd: 474.5,
    y: 656.1,
    startDivider: { type: 'BATAS', label: 'Batas Manggarai', km: 'KM 11+000' },
    endDivider: { type: 'DS', label: 'DS 1 (NO) MRI-JNG HI', km: 'KM 11+400' },
  },
  {
    id: 'mri_jng_hi_naspan1',
    code: 'NASPAN 1 MRI-JNG (HI)',
    title: 'NASPAN 1 MRI-JNG HI (KM 11+400 - KM 11+880)',
    km: 'KM 11+400 - KM 11+880',
    category: 'PETAK MANGGARAI - JATINEGARA',
    d: 'M 486.4 656.2 L 728.7 656.2',
    color: '#f8d731',
    xStart: 486.4,
    xEnd: 728.7,
    y: 656.2,
    startDivider: { type: 'DS', label: 'DS 1 (NO) MRI-JNG HI', km: 'KM 11+400' },
    endDivider: { type: 'AS', label: 'Air Section (AS KM 11+880)', km: 'KM 11+880' },
  },
  {
    id: 'mri_jng_hi_emplasemen',
    code: 'ST. JATINEGARA',
    title: 'Emplasemen Masuk Jalur 2 JNG Barat',
    km: 'KM 11+880 - KM 12+100',
    category: 'ST. JATINEGARA (EMPLASEMEN BARAT)',
    d: 'M 740.6 656.1 L 945.0 656.1',
    color: '#f8d731',
    xStart: 740.6,
    xEnd: 945.0,
    y: 656.1,
    startDivider: { type: 'AS', label: 'Air Section (AS KM 11+880)', km: 'KM 11+880' },
    endDivider: { type: 'FRP', label: 'FRP-JNG-04-31C1', km: 'KM 12+100' },
  },
  {
    id: 'mri_jng_hi_jalur2_in',
    code: 'ST. JATINEGARA',
    title: 'Jalur Masuk Peron Jalur 2 St. Jatinegara',
    km: 'KM 12+100 - KM 12+300',
    category: 'ST. JATINEGARA',
    d: 'M 945.0 656.1 L 1475.1 656.1',
    color: '#f8d731',
    xStart: 945.0,
    xEnd: 1475.1,
    y: 656.1,
    startDivider: { type: 'FRP', label: 'FRP-JNG-04-31C1', km: 'KM 12+100' },
    endDivider: { type: 'DS', label: 'DS 5 (NC) JALUR 2,3', km: 'KM 11+900' },
  },
  {
    id: 'mri_jng_hu_western',
    code: 'PETAK MRI-JNG',
    title: 'Petak Manggarai - Jatinegara (Jalur Hulu Barat)',
    km: 'KM 11+000 - KM 11+400',
    category: 'PETAK MANGGARAI - JATINEGARA',
    d: 'M 310.2 703.9 L 474.5 703.9',
    color: '#00ffff',
    xStart: 310.2,
    xEnd: 474.5,
    y: 703.9,
    startDivider: { type: 'BATAS', label: 'Batas Manggarai', km: 'KM 11+000' },
    endDivider: { type: 'DS', label: 'DS 2 (NO) JNG-MRI HU', km: 'KM 11+400' },
  },
  {
    id: 'mri_jng_hu_naspan1',
    code: 'JNG-MRI NASPAN 1 HU',
    title: 'JNG-MRI NASPAN 1 HU (KM 11+400 - KM 11+880)',
    km: 'KM 11+400 - KM 11+880',
    category: 'PETAK MANGGARAI - JATINEGARA',
    d: 'M 486.4 703.5 L 728.9 703.5',
    color: '#ff00ff',
    xStart: 486.4,
    xEnd: 728.9,
    y: 703.5,
    startDivider: { type: 'DS', label: 'DS 2 (NO) JNG-MRI HU', km: 'KM 11+400' },
    endDivider: { type: 'AS', label: 'Air Section (AS KM 11+880)', km: 'KM 11+880' },
  },
  {
    id: 'mri_jng_hu_emplasemen',
    code: 'ST. JATINEGARA',
    title: 'Emplasemen Masuk Jalur 1 JNG Barat',
    km: 'KM 11+880 - KM 12+100',
    category: 'ST. JATINEGARA (EMPLASEMEN BARAT)',
    d: 'M 740.4 703.5 L 975.0 703.5',
    color: '#ff00ff',
    xStart: 740.4,
    xEnd: 975.0,
    y: 703.5,
    startDivider: { type: 'AS', label: 'Air Section (AS KM 11+880)', km: 'KM 11+880' },
    endDivider: { type: 'FRP', label: 'FRP-JNG-05-31C2', km: 'KM 12+100' },
  },
  {
    id: 'mri_jng_hu_jalur1_in',
    code: 'ST. JATINEGARA',
    title: 'Jalur Masuk Peron Jalur 1 St. Jatinegara',
    km: 'KM 12+100 - KM 12+300',
    category: 'ST. JATINEGARA',
    d: 'M 975.0 703.5 L 1475.3 703.5',
    color: '#ff00ff',
    xStart: 975.0,
    xEnd: 1475.3,
    y: 703.5,
    startDivider: { type: 'FRP', label: 'FRP-JNG-05-31C2', km: 'KM 12+100' },
    endDivider: { type: 'DS', label: 'DS 6 (NC) JALUR 1', km: 'KM 11+900' },
  },
  {
    id: 'jng_jalur_8',
    code: 'ST. JATINEGARA',
    title: 'ST. JATINEGARA (Jalur 8 Peron Utama)',
    km: 'KM 11+750',
    category: 'ST. JATINEGARA (JALUR 1 - 8)',
    d: 'M 991.5 322.4 L 1421.8 322.4',
    color: '#139a47',
    xStart: 991.5,
    xEnd: 1421.8,
    y: 322.4,
    startDivider: { type: 'WESEL', label: 'Wesel Barat Jalur 8', km: 'KM 11+500' },
    endDivider: { type: 'WESEL', label: 'Wesel W83A1', km: 'KM 11+800' },
  },
  {
    id: 'jng_jalur_7',
    code: 'ST. JATINEGARA',
    title: 'ST. JATINEGARA (Jalur 7 Peron)',
    km: 'KM 11+750',
    category: 'ST. JATINEGARA (JALUR 1 - 8)',
    d: 'M 1012.5 370.0 L 1433.4 370.0',
    color: '#139a47',
    xStart: 1012.5,
    xEnd: 1433.4,
    y: 370.0,
    startDivider: { type: 'WESEL', label: 'Wesel Barat Jalur 7', km: 'KM 11+500' },
    endDivider: { type: 'WESEL', label: 'Wesel Jalur 7 Timur', km: 'KM 11+800' },
  },
  {
    id: 'jng_jalur_6',
    code: 'ST. JATINEGARA',
    title: 'ST. JATINEGARA (Jalur 6 Peron)',
    km: 'KM 11+750',
    category: 'ST. JATINEGARA (JALUR 1 - 8)',
    d: 'M 972.4 417.8 L 1452.8 417.8',
    color: '#cc6827',
    xStart: 972.4,
    xEnd: 1452.8,
    y: 417.8,
    startDivider: { type: 'WESEL', label: 'Wesel Barat Jalur 6', km: 'KM 11+500' },
    endDivider: { type: 'WESEL', label: 'Wesel W63A', km: 'KM 11+800' },
  },
  {
    id: 'jng_jalur_5',
    code: 'ST. JATINEGARA',
    title: 'ST. JATINEGARA (Jalur 5 Peron)',
    km: 'KM 11+750',
    category: 'ST. JATINEGARA (JALUR 1 - 8)',
    d: 'M 991.5 465.6 L 1483.8 465.6',
    color: '#cc6827',
    xStart: 991.5,
    xEnd: 1483.8,
    y: 465.6,
    startDivider: { type: 'WESEL', label: 'Wesel Barat Jalur 5', km: 'KM 11+500' },
    endDivider: { type: 'WESEL', label: 'Wesel Timur Jalur 5', km: 'KM 11+800' },
  },
  {
    id: 'jng_jalur_4',
    code: 'ST. JATINEGARA',
    title: 'ST. JATINEGARA (Jalur 4 Peron)',
    km: 'KM 11+750',
    category: 'ST. JATINEGARA (JALUR 1 - 8)',
    d: 'M 945.0 512.7 L 1461.9 512.7',
    color: '#cc6827',
    xStart: 945.0,
    xEnd: 1461.9,
    y: 512.7,
    startDivider: { type: 'WESEL', label: 'Wesel Barat Jalur 4', km: 'KM 11+500' },
    endDivider: { type: 'WESEL', label: 'Wesel Timur Jalur 4', km: 'KM 11+800' },
  },
  {
    id: 'jng_jalur_4_ext',
    code: 'ST. JATINEGARA',
    title: 'Jalur 4 Lanjutan Emplasemen Timur JNG',
    km: 'KM 11+850',
    category: 'ST. JATINEGARA (EMPLASEMEN TIMUR)',
    d: 'M 1568.0 512.7 L 1718.7 512.7',
    color: '#139a47',
    xStart: 1568.0,
    xEnd: 1718.7,
    y: 512.7,
    startDivider: { type: 'FRP', label: 'FRP-JNG-10-JALUR 4', km: 'KM 11+850' },
    endDivider: { type: 'WESEL', label: 'Wesel W83A2', km: 'KM 11+900' },
  },
  {
    id: 'jng_jalur_3',
    code: 'ST. JATINEGARA',
    title: 'ST. JATINEGARA (Jalur 3 Peron)',
    km: 'KM 11+750',
    category: 'ST. JATINEGARA (JALUR 1 - 8)',
    d: 'M 796.4 606.0 L 1475.4 606.0',
    color: '#f8d731',
    xStart: 796.4,
    xEnd: 1475.4,
    y: 606.0,
    startDivider: { type: 'WESEL', label: 'Wesel Barat Jalur 3', km: 'KM 11+500' },
    endDivider: { type: 'DS', label: 'DS 5 (NC) JALUR 2,3', km: 'KM 11+900' },
  },
  {
    id: 'jng_jalur_3_ext',
    code: 'ST. JATINEGARA',
    title: 'Jalur 3 Lanjutan Emplasemen Timur JNG / Wesel 13',
    km: 'KM 11+900 - KM 12+200',
    category: 'ST. JATINEGARA (EMPLASEMEN TIMUR)',
    d: 'M 1487.4 607.6 L 1822.6 607.6',
    color: '#f8d731',
    xStart: 1487.4,
    xEnd: 1822.6,
    y: 607.6,
    startDivider: { type: 'DS', label: 'DS 5 (NC) JALUR 2,3', km: 'KM 11+900' },
    endDivider: { type: 'FRP', label: 'FRP-JNG-13-13D1', km: 'KM 12+200' },
  },
  {
    id: 'jng_jalur_2',
    code: 'ST. JATINEGARA',
    title: 'ST. JATINEGARA (Jalur 2 Peron Hilir)',
    km: 'KM 11+750',
    category: 'ST. JATINEGARA (JALUR 1 - 8)',
    d: 'M 740.6 656.1 L 1475.1 656.1',
    color: '#f8d731',
    xStart: 740.6,
    xEnd: 1475.1,
    y: 656.1,
    startDivider: { type: 'AS', label: 'Air Section (AS KM 11+880)', km: 'KM 11+880' },
    endDivider: { type: 'DS', label: 'DS 5 (NC) JALUR 2,3', km: 'KM 11+900' },
  },
  {
    id: 'jng_jalur_1',
    code: 'ST. JATINEGARA',
    title: 'ST. JATINEGARA (Jalur 1 Peron Hulu)',
    km: 'KM 11+750',
    category: 'ST. JATINEGARA (JALUR 1 - 8)',
    d: 'M 740.4 703.5 L 1475.3 703.5',
    color: '#ff00ff',
    xStart: 740.4,
    xEnd: 1475.3,
    y: 703.5,
    startDivider: { type: 'AS', label: 'Air Section (AS KM 11+880)', km: 'KM 11+880' },
    endDivider: { type: 'DS', label: 'DS 6 (NC) JALUR 1', km: 'KM 11+900' },
  },
  {
    id: 'jng_jalur_mid_rust',
    code: 'ST. JATINEGARA',
    title: 'Jalur Antara Barat JNG (KM 11+600)',
    km: 'KM 11+600',
    category: 'ST. JATINEGARA (EMPLASEMEN BARAT)',
    d: 'M 611.7 605.6 L 790.6 605.6',
    color: '#cc6827',
    xStart: 611.7,
    xEnd: 790.6,
    y: 605.6,
    startDivider: { type: 'WESEL', label: 'Wesel Barat', km: 'KM 11+500' },
    endDivider: { type: 'WESEL', label: 'Wesel Emplasemen', km: 'KM 11+700' },
  },
  {
    id: 'jng_jalur_mid_timur',
    code: 'ST. JATINEGARA',
    title: 'Jalur Wesel 23B JNG Emplasemen Timur',
    km: 'KM 11+880',
    category: 'ST. JATINEGARA (EMPLASEMEN TIMUR)',
    d: 'M 1489.8 560.5 L 1628.4 560.5',
    color: '#cc6827',
    xStart: 1489.8,
    xEnd: 1628.4,
    y: 560.5,
    startDivider: { type: 'FRP', label: 'FRP-JNG-11-23B2', km: 'KM 11+880' },
    endDivider: { type: 'WESEL', label: 'Wesel W23B2', km: 'KM 11+920' },
  },
  {
    id: 'jng_jalur_mid_green',
    code: 'ST. JATINEGARA',
    title: 'Jalur Wesel 23C JNG Emplasemen Timur',
    km: 'KM 11+950',
    category: 'ST. JATINEGARA (EMPLASEMEN TIMUR)',
    d: 'M 1634.0 560.5 L 1768.5 560.5',
    color: '#139a47',
    xStart: 1634.0,
    xEnd: 1768.5,
    y: 560.5,
    startDivider: { type: 'WESEL', label: 'Wesel W23C1', km: 'KM 11+950' },
    endDivider: { type: 'WESEL', label: 'Wesel W23C2', km: 'KM 12+000' },
  },
  {
    id: 'naspan_1_arah_kld_hu',
    code: 'NASPAN 1 ARAH KLD HU',
    title: 'NASPAN 1 ARAH KLD HU (DS 6 s/d DS 8)',
    km: 'KM 11+900 - KM 12+844',
    category: 'PETAK JATINEGARA - KLENDER',
    d: 'M 1487.2 703.5 L 1942.0 703.5',
    color: '#ff00ff',
    xStart: 1487.2,
    xEnd: 1942.0,
    y: 703.5,
    startDivider: { type: 'DS', label: 'DS 6 (NC) JALUR 1', km: 'KM 11+900' },
    endDivider: { type: 'DS', label: 'DS 8 (NO) JNG-KLD HU', km: 'KM 12+844' },
  },
  {
    id: 'naspan_2_jng_kld_hu',
    code: 'NASPAN 2 JNG-KLD',
    title: 'NASPAN 2 JNG-KLD (DS 8 s/d AJ KM 13+300)',
    km: 'KM 12+844 - KM 13+300',
    category: 'PETAK JATINEGARA - KLENDER',
    d: 'M 1942.0 703.5 L 2086.4 703.5',
    color: '#ff9f7f',
    xStart: 1942.0,
    xEnd: 2086.4,
    y: 703.5,
    startDivider: { type: 'DS', label: 'DS 8 (NO) JNG-KLD HU', km: 'KM 12+844' },
    endDivider: { type: 'AJ', label: 'Air Joint (AJ KM 13+300)', km: 'KM 13+300' },
  },
  {
    id: 'naspan_3_jng_kld_hu',
    code: 'NASPAN 3 JNG-KLD',
    title: 'NASPAN 3 JNG-KLD (AJ KM 13+300 s/d AJ KM 14+100)',
    km: 'KM 13+300 - KM 14+100',
    category: 'PETAK JATINEGARA - KLENDER',
    d: 'M 2086.4 703.5 L 2161.3 703.5',
    color: '#ff9f7f',
    xStart: 2086.4,
    xEnd: 2161.3,
    y: 703.5,
    startDivider: { type: 'AJ', label: 'Air Joint (AJ KM 13+300)', km: 'KM 13+300' },
    endDivider: { type: 'AJ', label: 'Air Joint (AJ KM 14+100)', km: 'KM 14+100' },
  },
  {
    id: 'naspan_4_jng_kld_hu',
    code: 'NASPAN 4 JNG-KLD',
    title: 'NASPAN 4 JNG-KLD (AJ KM 14+100 s/d AJ KM 14+700)',
    km: 'KM 14+100 - KM 14+700',
    category: 'PETAK JATINEGARA - KLENDER',
    d: 'M 2161.3 703.0 L 2249.6 703.0',
    color: '#ff9f7f',
    xStart: 2161.3,
    xEnd: 2249.6,
    y: 703.0,
    startDivider: { type: 'AJ', label: 'Air Joint (AJ KM 14+100)', km: 'KM 14+100' },
    endDivider: { type: 'AJ', label: 'Air Joint (AJ KM 14+700)', km: 'KM 14+700' },
  },
  {
    id: 'naspan_4b_kld_bua_hu',
    code: 'NASPAN 4B KLD-BUA',
    title: 'NASPAN 4B KLD-BUA (AJ KM 14+700 s/d AS KM 15+450)',
    km: 'KM 14+700 - KM 15+450',
    category: 'PETAK KLENDER - BUARAN',
    d: 'M 2249.6 703.0 L 2518.8 703.0',
    color: '#ff9f7f',
    xStart: 2249.6,
    xEnd: 2518.8,
    y: 703.0,
    startDivider: { type: 'AJ', label: 'Air Joint (AJ KM 14+700)', km: 'KM 14+700' },
    endDivider: { type: 'AS', label: 'Air Section (AS KM 15+450)', km: 'KM 15+450' },
  },
  {
    id: 'naspan_5_kld_bua_hu',
    code: 'NASPAN 5 KLD-BUA',
    title: 'NASPAN 5 KLD-BUA (AS KM 15+450 s/d AJ KM 16+500)',
    km: 'KM 15+450 - KM 16+500',
    category: 'PETAK KLENDER - BUARAN',
    d: 'M 2518.8 703.9 L 2635.0 703.9',
    color: '#00ff00',
    xStart: 2518.8,
    xEnd: 2635.0,
    y: 703.9,
    startDivider: { type: 'AS', label: 'Air Section (AS KM 15+450)', km: 'KM 15+450' },
    endDivider: { type: 'AJ', label: 'Air Joint (AJ KM 16+500)', km: 'KM 16+500' },
  },
  {
    id: 'naspan_6_kld_bua_hu',
    code: 'NASPAN 6 KLD-BUA',
    title: 'NASPAN 6 KLD-BUA (AJ KM 16+500 s/d AS KM 17+239)',
    km: 'KM 16+500 - KM 17+239',
    category: 'PETAK KLENDER - BUARAN',
    d: 'M 2635.0 703.4 L 2740.0 703.4',
    color: '#00ff00',
    xStart: 2635.0,
    xEnd: 2740.0,
    y: 703.4,
    startDivider: { type: 'AJ', label: 'Air Joint (AJ KM 16+500)', km: 'KM 16+500' },
    endDivider: { type: 'AS', label: 'Air Section (AS KM 17+239)', km: 'KM 17+239' },
  },
  {
    id: 'naspan_7_bua_kldb_hu',
    code: 'NASPAN 7 BUA-KLDB',
    title: 'NASPAN 7 BUA-KLDB (AS KM 17+239 s/d DS 10 KM 17+900)',
    km: 'KM 17+239 - KM 17+900',
    category: 'PETAK BUARAN - KLENDER BARU',
    d: 'M 2740.0 703.3 L 2985.7 703.3',
    color: '#ff0000',
    xStart: 2740.0,
    xEnd: 2985.7,
    y: 703.3,
    startDivider: { type: 'AS', label: 'Air Section (AS KM 17+239)', km: 'KM 17+239' },
    endDivider: { type: 'DS', label: 'DS 10 (NC) BUA-KLDB HU', km: 'KM 17+900' },
  },
  {
    id: 'naspan_7b_bua_kldb_hu',
    code: 'NASPAN 7B BUA-KLDB',
    title: 'NASPAN 7B BUA-KLDB (DS 10 s/d AJ KM 18+800)',
    km: 'KM 17+900 - KM 18+800',
    category: 'PETAK BUARAN - KLENDER BARU',
    d: 'M 2985.7 703.0 L 3098.5 703.0',
    color: '#ff0000',
    xStart: 2985.7,
    xEnd: 3098.5,
    y: 703.0,
    startDivider: { type: 'DS', label: 'DS 10 (NC) BUA-KLDB HU', km: 'KM 17+900' },
    endDivider: { type: 'AJ', label: 'Air Joint (AJ KM 18+800)', km: 'KM 18+800' },
  },
  {
    id: 'naspan_1_arah_kld_hi',
    code: 'NASPAN 1 ARAH KLD HI',
    title: 'NASPAN 1 ARAH KLD HI (AS KM 11+900 s/d DS 7)',
    km: 'KM 11+900 - KM 12+500',
    category: 'PETAK JATINEGARA - KLENDER',
    d: 'M 1487.0 656.0 L 1942.0 656.0',
    color: '#f8d731',
    xStart: 1487.0,
    xEnd: 1942.0,
    y: 656.0,
    startDivider: { type: 'AS', label: 'Air Section (AS KM 11+900)', km: 'KM 11+900' },
    endDivider: { type: 'DS', label: 'DS 7 (NO) KLD-JNG HI / AS KM 12+500', km: 'KM 12+500' },
  },
  {
    id: 'naspan_2_jng_kld_hi',
    code: 'NASPAN 2 JNG-KLD (HI)',
    title: 'NASPAN 2 JNG-KLD HI (DS 7 s/d AJ KM 13+300)',
    km: 'KM 12+500 - KM 13+300',
    category: 'PETAK JATINEGARA - KLENDER',
    d: 'M 1942.0 655.8 L 2086.4 655.8',
    color: '#0000ff',
    xStart: 1942.0,
    xEnd: 2086.4,
    y: 655.8,
    startDivider: { type: 'DS', label: 'DS 7 (NO) / AS KM 12+500', km: 'KM 12+500' },
    endDivider: { type: 'AJ', label: 'Air Joint (AJ KM 13+300)', km: 'KM 13+300' },
  },
  {
    id: 'naspan_3_jng_kld_hi',
    code: 'NASPAN 3 JNG-KLD (HI)',
    title: 'NASPAN 3 JNG-KLD HI (AJ KM 13+300 s/d AJ KM 14+100)',
    km: 'KM 13+300 - KM 14+100',
    category: 'PETAK JATINEGARA - KLENDER',
    d: 'M 2086.4 655.8 L 2161.3 655.8',
    color: '#0000ff',
    xStart: 2086.4,
    xEnd: 2161.3,
    y: 655.8,
    startDivider: { type: 'AJ', label: 'Air Joint (AJ KM 13+300)', km: 'KM 13+300' },
    endDivider: { type: 'AJ', label: 'Air Joint (AJ KM 14+100)', km: 'KM 14+100' },
  },
  {
    id: 'naspan_4_jng_kld_hi',
    code: 'NASPAN 4 JNG-KLD (HI)',
    title: 'NASPAN 4 JNG-KLD HI (AJ KM 14+100 s/d AJ KM 14+700)',
    km: 'KM 14+100 - KM 14+700',
    category: 'PETAK JATINEGARA - KLENDER',
    d: 'M 2161.3 655.3 L 2249.6 655.3',
    color: '#0000ff',
    xStart: 2161.3,
    xEnd: 2249.6,
    y: 655.3,
    startDivider: { type: 'AJ', label: 'Air Joint (AJ KM 14+100)', km: 'KM 14+100' },
    endDivider: { type: 'AJ', label: 'Air Joint (AJ KM 14+700)', km: 'KM 14+700' },
  },
  {
    id: 'naspan_4b_kld_bua_hi',
    code: 'NASPAN 4B KLD-BUA (HI)',
    title: 'NASPAN 4B KLD-BUA HI (AJ KM 14+700 s/d AS KM 15+450)',
    km: 'KM 14+700 - KM 15+450',
    category: 'PETAK KLENDER - BUARAN',
    d: 'M 2249.6 655.3 L 2518.8 655.3',
    color: '#0000ff',
    xStart: 2249.6,
    xEnd: 2518.8,
    y: 655.3,
    startDivider: { type: 'AJ', label: 'Air Joint (AJ KM 14+700)', km: 'KM 14+700' },
    endDivider: { type: 'AS', label: 'Air Section (AS KM 15+450)', km: 'KM 15+450' },
  },
  {
    id: 'naspan_5_kld_bua_hi',
    code: 'NASPAN 5 KLD-BUA (HI)',
    title: 'NASPAN 5 KLD-BUA HI (AS KM 15+450 s/d AJ KM 16+500)',
    km: 'KM 15+450 - KM 16+500',
    category: 'PETAK KLENDER - BUARAN',
    d: 'M 2518.8 656.1 L 2635.0 656.1',
    color: '#ff00ff',
    xStart: 2518.8,
    xEnd: 2635.0,
    y: 656.1,
    startDivider: { type: 'AS', label: 'Air Section (AS KM 15+450)', km: 'KM 15+450' },
    endDivider: { type: 'AJ', label: 'Air Joint (AJ KM 16+500)', km: 'KM 16+500' },
  },
  {
    id: 'naspan_6_kld_bua_hi',
    code: 'NASPAN 6 KLD-BUA (HI)',
    title: 'NASPAN 6 KLD-BUA HI (AJ KM 16+500 s/d AS KM 17+239)',
    km: 'KM 16+500 - KM 17+239',
    category: 'PETAK KLENDER - BUARAN',
    d: 'M 2635.0 655.5 L 2740.0 655.5',
    color: '#ff00ff',
    xStart: 2635.0,
    xEnd: 2740.0,
    y: 655.5,
    startDivider: { type: 'AJ', label: 'Air Joint (AJ KM 16+500)', km: 'KM 16+500' },
    endDivider: { type: 'AS', label: 'Air Section (AS KM 17+239)', km: 'KM 17+239' },
  },
  {
    id: 'naspan_7_bua_kldb_hi',
    code: 'NASPAN 7 BUA-KLDB (HI)',
    title: 'NASPAN 7 BUA-KLDB HI (AS KM 17+239 s/d DS 9 KM 17+900)',
    km: 'KM 17+239 - KM 17+900',
    category: 'PETAK BUARAN - KLENDER BARU',
    d: 'M 2740.0 655.5 L 2985.7 655.5',
    color: '#f8d731',
    xStart: 2740.0,
    xEnd: 2985.7,
    y: 655.5,
    startDivider: { type: 'AS', label: 'Air Section (AS KM 17+239)', km: 'KM 17+239' },
    endDivider: { type: 'DS', label: 'DS 9 (NC) KLDB-BUA HI', km: 'KM 17+900' },
  },
  {
    id: 'naspan_7b_bua_kldb_hi',
    code: 'NASPAN 7B BUA-KLDB (HI)',
    title: 'NASPAN 7B BUA-KLDB HI (DS 9 s/d AJ KM 18+800)',
    km: 'KM 17+900 - KM 18+800',
    category: 'PETAK BUARAN - KLENDER BARU',
    d: 'M 2985.7 655.3 L 3098.5 655.3',
    color: '#f8d731',
    xStart: 2985.7,
    xEnd: 3098.5,
    y: 655.3,
    startDivider: { type: 'DS', label: 'DS 9 (NC) KLDB-BUA HI', km: 'KM 17+900' },
    endDivider: { type: 'AJ', label: 'Air Joint (AJ KM 18+800)', km: 'KM 18+800' },
  },
  {
    id: 'loop_menurun_bua_kldb_hulu',
    code: 'NASPAN 8 BUA-KLDB',
    title: 'Jalur Menurun Loop Buaran - Klender Baru (Hulu / Dalam)',
    km: 'KM 18+800 - KM 19+300',
    category: 'PETAK BUARAN - KLENDER BARU (MENURUN)',
    d: 'M 3098.5 703.0 L 3112.5 702.9 L 3143.9 735.4 L 3143.8 1021.0 L 3102.0 1064.7 L 3046.7 1064.7',
    color: '#ff0000',
    startDivider: { type: 'AJ', label: 'Air Joint (AJ KM 18+800)', km: 'KM 18+800' },
    endDivider: { type: 'AJ', label: 'Air Joint (AJ KM 19+300)', km: 'KM 19+300' },
  },
  {
    id: 'loop_menurun_bua_kldb_hilir',
    code: 'NASPAN 8 BUA-KLDB',
    title: 'Jalur Menurun Loop Buaran - Klender Baru (Hilir / Luar)',
    km: 'KM 18+800 - KM 19+300',
    category: 'PETAK BUARAN - KLENDER BARU (MENURUN)',
    d: 'M 3098.5 655.3 L 3122.8 655.2 L 3181.1 715.5 L 3181.0 1047.9 L 3122.6 1112.4 L 3046.7 1112.4',
    color: '#f8d731',
    startDivider: { type: 'AJ', label: 'Air Joint (AJ KM 18+800)', km: 'KM 18+800' },
    endDivider: { type: 'AJ', label: 'Air Joint (AJ KM 19+300)', km: 'KM 19+300' },
  },
  {
    id: 'vert_line_menurun_hulu',
    code: 'NASPAN 8 BUA-KLDB',
    title: 'Line Vertikal Menurun Petak Ujung Timur ke Cakung (Hulu)',
    km: 'KM 18+900 - KM 19+200',
    category: 'PETAK BUARAN - KLENDER BARU (MENURUN)',
    d: 'M 3143.9 735.4 L 3143.8 1021.0',
    color: '#ff0000',
    startDivider: { type: 'TIKUNGAN', label: 'Tikungan Atas Buaran', km: 'KM 18+900' },
    endDivider: { type: 'TIKUNGAN', label: 'Tikungan Bawah Masuk Klender Baru', km: 'KM 19+200' },
  },
  {
    id: 'vert_line_menurun_hilir',
    code: 'NASPAN 8 BUA-KLDB',
    title: 'Line Vertikal Menurun Petak Ujung Timur ke Cakung (Hilir)',
    km: 'KM 18+900 - KM 19+200',
    category: 'PETAK BUARAN - KLENDER BARU (MENURUN)',
    d: 'M 3181.1 715.5 L 3181.0 1047.9',
    color: '#f8d731',
    startDivider: { type: 'TIKUNGAN', label: 'Tikungan Atas Buaran', km: 'KM 18+900' },
    endDivider: { type: 'TIKUNGAN', label: 'Tikungan Bawah Masuk Klender Baru', km: 'KM 19+200' },
  },
  {
    id: 'naspan_8b_kldb_cuk_hu',
    code: 'NASPAN 8B KLDB-CUK',
    title: 'NASPAN 8B KLDB-CUK (AJ KM 19+300 s/d DS 12 KM 20+150)',
    km: 'KM 19+300 - KM 20+150',
    category: 'PETAK KLENDER BARU - CAKUNG',
    d: 'M 3046.7 1064.5 L 2818.6 1064.5',
    color: '#ff0000',
    xStart: 3046.7,
    xEnd: 2818.6,
    y: 1064.5,
    startDivider: { type: 'AJ', label: 'Air Joint (AJ KM 19+300)', km: 'KM 19+300' },
    endDivider: { type: 'DS', label: 'DS 12 (NO) KLDB-CUK HU / AS KM 20+150', km: 'KM 20+150' },
  },
  {
    id: 'cuk_jalur_1_empl',
    code: 'ST. CAKUNG',
    title: 'ST. CAKUNG (Emplasemen Jalur 1 Hulu)',
    km: 'KM 20+150 - KM 21+400',
    category: 'ST. CAKUNG (EMPLASEMEN)',
    d: 'M 2806.7 1064.5 L 2342.0 1064.5',
    color: '#8a6ddd',
    xStart: 2806.7,
    xEnd: 2342.0,
    y: 1064.5,
    startDivider: { type: 'DS', label: 'DS 12 (NO) / AS KM 20+150', km: 'KM 20+150' },
    endDivider: { type: 'DS', label: 'DS 14 (NC) CUK-KRI HU / AS KM 21+400', km: 'KM 21+400' },
  },
  {
    id: 'cuk_jalur_1_peron',
    code: 'ST. CAKUNG',
    title: 'ST. CAKUNG (Jalur 1 Atas Peron)',
    km: 'KM 20+943',
    category: 'ST. CAKUNG (EMPLASEMEN)',
    d: 'M 2453.3 1022.1 L 2583.0 1022.1',
    color: '#8a6ddd',
    xStart: 2453.3,
    xEnd: 2583.0,
    y: 1022.1,
    startDivider: { type: 'WESEL', label: 'Wesel W11B', km: 'KM 20+850' },
    endDivider: { type: 'WESEL', label: 'Wesel W11A', km: 'KM 21+050' },
  },
  {
    id: 'naspan_10_cuk_kri_hu',
    code: 'NASPAN 10 CUK-KRI',
    title: 'NASPAN 10 CUK-KRI (DS 14 s/d AJ KM 22+700)',
    km: 'KM 21+400 - KM 22+700',
    category: 'PETAK CAKUNG - KRANJI',
    d: 'M 2330.6 1062.2 L 2217.3 1062.2',
    color: '#8a6ddd',
    xStart: 2330.6,
    xEnd: 2217.3,
    y: 1062.2,
    startDivider: { type: 'DS', label: 'DS 14 (NC) / AS KM 21+400', km: 'KM 21+400' },
    endDivider: { type: 'AJ', label: 'Air Joint (AJ KM 22+700)', km: 'KM 22+700' },
  },
  {
    id: 'naspan_11_cuk_kri_hu',
    code: 'NASPAN 11 CUK-KRI',
    title: 'NASPAN 11 CUK-KRI (AJ KM 22+700 s/d DS 16 KM 23+600)',
    km: 'KM 22+700 - KM 23+600',
    category: 'PETAK CAKUNG - KRANJI',
    d: 'M 2205.4 1062.0 L 2071.8 1062.0',
    color: '#8a6ddd',
    xStart: 2205.4,
    xEnd: 2071.8,
    y: 1062.0,
    startDivider: { type: 'AJ', label: 'Air Joint (AJ KM 22+700)', km: 'KM 22+700' },
    endDivider: { type: 'DS', label: 'DS 16 (NC) / AS KM 23+600', km: 'KM 23+600' },
  },
  {
    id: 'naspan_12_kri_bks_hu',
    code: 'NASPAN 12 KRI-BKS',
    title: 'NASPAN 12 KRI-BKS (DS 16 s/d AJ KM 24+500)',
    km: 'KM 23+600 - KM 24+500',
    category: 'PETAK KRANJI - BEKASI',
    d: 'M 2060.8 1063.2 L 1824.3 1063.2',
    color: '#ff00ff',
    xStart: 2060.8,
    xEnd: 1824.3,
    y: 1063.2,
    startDivider: { type: 'DS', label: 'DS 16 (NC) / AS KM 23+600', km: 'KM 23+600' },
    endDivider: { type: 'AJ', label: 'Air Joint (AJ KM 24+500)', km: 'KM 24+500' },
  },
  {
    id: 'naspan_13_kri_bks_hu',
    code: 'NASPAN 13 KRI-BKS',
    title: 'NASPAN 13 KRI-BKS (AJ KM 24+500 s/d AJ KM 25+300)',
    km: 'KM 24+500 - KM 25+300',
    category: 'PETAK KRANJI - BEKASI',
    d: 'M 1809.6 1063.0 L 1754.0 1063.0',
    color: '#ff00ff',
    xStart: 1809.6,
    xEnd: 1754.0,
    y: 1063.0,
    startDivider: { type: 'AJ', label: 'Air Joint (AJ KM 24+500)', km: 'KM 24+500' },
    endDivider: { type: 'AJ', label: 'Air Joint (AJ KM 25+300)', km: 'KM 25+300' },
  },
  {
    id: 'naspan_13b_kri_bks_hu',
    code: 'NASPAN 13B KRI-BKS',
    title: 'NASPAN 13B KRI-BKS (AJ KM 25+300 s/d AS KM 25+700)',
    km: 'KM 25+300 - KM 25+700',
    category: 'PETAK KRANJI - BEKASI',
    d: 'M 1740.5 1063.0 L 1641.5 1063.0',
    color: '#ff00ff',
    xStart: 1740.5,
    xEnd: 1641.5,
    y: 1063.0,
    startDivider: { type: 'AJ', label: 'Air Joint (AJ KM 25+300)', km: 'KM 25+300' },
    endDivider: { type: 'AS', label: 'Air Section (AS KM 25+700)', km: 'KM 25+700' },
  },
  {
    id: 'naspan_8b_kldb_cuk_hi',
    code: 'NASPAN 8B KLDB-CUK (HI)',
    title: 'NASPAN 8B KLDB-CUK HI (AJ KM 19+300 s/d DS 11 KM 20+150)',
    km: 'KM 19+300 - KM 20+150',
    category: 'PETAK KLENDER BARU - CAKUNG',
    d: 'M 3046.7 1112.4 L 2824.4 1112.2',
    color: '#f8d731',
    xStart: 3046.7,
    xEnd: 2824.4,
    y: 1112.2,
    startDivider: { type: 'AJ', label: 'Air Joint (AJ KM 19+300)', km: 'KM 19+300' },
    endDivider: { type: 'DS', label: 'DS 11 (NO) CUK-KLDB HI / AS KM 20+150', km: 'KM 20+150' },
  },
  {
    id: 'cuk_jalur_4_empl',
    code: 'ST. CAKUNG',
    title: 'ST. CAKUNG (Emplasemen Jalur 4 Hilir)',
    km: 'KM 20+150 - KM 21+400',
    category: 'ST. CAKUNG (EMPLASEMEN)',
    d: 'M 2811.4 1112.1 L 2343.3 1112.1',
    color: '#cc6827',
    xStart: 2811.4,
    xEnd: 2343.3,
    y: 1112.1,
    startDivider: { type: 'DS', label: 'DS 11 (NO) / AS KM 20+150', km: 'KM 20+150' },
    endDivider: { type: 'DS', label: 'DS 13 (NC) KRI-CUK HI / AS KM 21+400', km: 'KM 21+400' },
  },
  {
    id: 'cuk_jalur_4_peron',
    code: 'ST. CAKUNG',
    title: 'ST. CAKUNG (Jalur 4 Bawah Peron)',
    km: 'KM 20+943',
    category: 'ST. CAKUNG (EMPLASEMEN)',
    d: 'M 2452.2 1153.9 L 2583.0 1153.9',
    color: '#cc6827',
    xStart: 2452.2,
    xEnd: 2583.0,
    y: 1153.9,
    startDivider: { type: 'WESEL', label: 'Wesel W21B', km: 'KM 20+850' },
    endDivider: { type: 'WESEL', label: 'Wesel W21A', km: 'KM 21+050' },
  },
  {
    id: 'naspan_10_cuk_kri_hi',
    code: 'NASPAN 10 CUK-KRI (HI)',
    title: 'NASPAN 10 CUK-KRI HI (DS 13 s/d AJ KM 22+700)',
    km: 'KM 21+400 - KM 22+700',
    category: 'PETAK CAKUNG - KRANJI',
    d: 'M 2331.4 1112.0 L 2221.0 1112.0',
    color: '#cc6827',
    xStart: 2331.4,
    xEnd: 2221.0,
    y: 1112.0,
    startDivider: { type: 'DS', label: 'DS 13 (NC) / AS KM 21+400', km: 'KM 21+400' },
    endDivider: { type: 'AJ', label: 'Air Joint (AJ KM 22+700)', km: 'KM 22+700' },
  },
  {
    id: 'naspan_11_cuk_kri_hi',
    code: 'NASPAN 11 CUK-KRI (HI)',
    title: 'NASPAN 11 CUK-KRI HI (AJ KM 22+700 s/d DS 15 KM 23+600)',
    km: 'KM 22+700 - KM 23+600',
    category: 'PETAK CAKUNG - KRANJI',
    d: 'M 2207.0 1112.0 L 2065.5 1112.0',
    color: '#cc6827',
    xStart: 2207.0,
    xEnd: 2065.5,
    y: 1112.0,
    startDivider: { type: 'AJ', label: 'Air Joint (AJ KM 22+700)', km: 'KM 22+700' },
    endDivider: { type: 'DS', label: 'DS 15 (NC) / AS KM 23+600', km: 'KM 23+600' },
  },
  {
    id: 'naspan_12_kri_bks_hi',
    code: 'NASPAN 12 KRI-BKS (HI)',
    title: 'NASPAN 12 KRI-BKS HI (DS 15 s/d AJ KM 24+500)',
    km: 'KM 23+600 - KM 24+500',
    category: 'PETAK KRANJI - BEKASI',
    d: 'M 2050.8 1111.6 L 1751.6 1111.6',
    color: '#00bfff',
    xStart: 2050.8,
    xEnd: 1751.6,
    y: 1111.6,
    startDivider: { type: 'DS', label: 'DS 15 (NC) / AS KM 23+600', km: 'KM 23+600' },
    endDivider: { type: 'AJ', label: 'Air Joint (AJ KM 24+500)', km: 'KM 24+500' },
  },
  {
    id: 'naspan_13_kri_bks_hi',
    code: 'NASPAN 13 KRI-BKS (HI)',
    title: 'NASPAN 13 KRI-BKS HI (AJ KM 24+500 s/d AS KM 25+700)',
    km: 'KM 24+500 - KM 25+700',
    category: 'PETAK KRANJI - BEKASI',
    d: 'M 1739.6 1112.8 L 1638.8 1112.8',
    color: '#00bfff',
    xStart: 1739.6,
    xEnd: 1638.8,
    y: 1112.8,
    startDivider: { type: 'AJ', label: 'Air Joint (AJ KM 24+500)', km: 'KM 24+500' },
    endDivider: { type: 'AS', label: 'Air Section (AS KM 25+700)', km: 'KM 25+700' },
  },
  {
    id: 'bks_jalur_1_in',
    code: 'ST. BEKASI',
    title: 'Jalur Masuk Peron Jalur 1 Bekasi',
    km: 'KM 25+700 - KM 26+000',
    category: 'ST. BEKASI (EMPLASEMEN)',
    d: 'M 1626.3 1063.0 L 1392.9 1063.0',
    color: '#139a47',
    xStart: 1626.3,
    xEnd: 1392.9,
    y: 1063.0,
    startDivider: { type: 'AS', label: 'Air Section (AS KM 25+700)', km: 'KM 25+700' },
    endDivider: { type: 'DS', label: 'DS 18 (NC) BKS HU', km: 'KM 26+000' },
  },
  {
    id: 'bks_jalur_1_platform',
    code: 'ST. BEKASI',
    title: 'ST. BEKASI (Jalur 1 Peron Utama Hulu)',
    km: 'KM 26+000 - KM 26+500',
    category: 'ST. BEKASI',
    d: 'M 1387.1 1063.0 L 775.6 1063.0',
    color: '#139a47',
    xStart: 1387.1,
    xEnd: 775.6,
    y: 1063.0,
    startDivider: { type: 'DS', label: 'DS 18 (NC) BKS HU', km: 'KM 26+000' },
    endDivider: { type: 'WESEL', label: 'Wesel W73 Barat BKS', km: 'KM 26+500' },
  },
  {
    id: 'bks_jalur_1_west',
    code: 'ST. BEKASI',
    title: 'Jalur 1 Barat Bekasi (W73 s/d W53)',
    km: 'KM 26+500 - KM 26+700',
    category: 'ST. BEKASI (EMPLASEMEN BARAT)',
    d: 'M 775.6 1063.0 L 605.9 1063.0',
    color: '#139a47',
    xStart: 775.6,
    xEnd: 605.9,
    y: 1063.0,
    startDivider: { type: 'WESEL', label: 'Wesel W73', km: 'KM 26+500' },
    endDivider: { type: 'WESEL', label: 'Wesel W53', km: 'KM 26+700' },
  },
  {
    id: 'bks_jalur_1_end',
    code: 'ST. BEKASI',
    title: 'Jalur 1 Ujung Barat Bekasi',
    km: 'KM 26+700 - KM 26+900',
    category: 'ST. BEKASI (EMPLASEMEN BARAT)',
    d: 'M 592.6 1063.0 L 460.4 1063.0',
    color: '#139a47',
    xStart: 592.6,
    xEnd: 460.4,
    y: 1063.0,
    startDivider: { type: 'WESEL', label: 'Wesel Percabangan Barat', km: 'KM 26+700' },
    endDivider: { type: 'BATAS', label: 'Batas Emplasemen Barat', km: 'KM 26+900' },
  },
  {
    id: 'bks_jalur_2_in',
    code: 'ST. BEKASI',
    title: 'Jalur Masuk Peron Jalur 2 Bekasi',
    km: 'KM 25+700 - KM 26+000',
    category: 'ST. BEKASI (EMPLASEMEN)',
    d: 'M 1625.3 1113.2 L 1389.5 1113.2',
    color: '#ff0000',
    xStart: 1625.3,
    xEnd: 1389.5,
    y: 1113.2,
    startDivider: { type: 'AS', label: 'Air Section (AS KM 25+700)', km: 'KM 25+700' },
    endDivider: { type: 'DS', label: 'DS 19 (NC) BKS HI', km: 'KM 26+000' },
  },
  {
    id: 'bks_jalur_2_platform',
    code: 'ST. BEKASI',
    title: 'ST. BEKASI (Jalur 2 Peron Utama Hilir)',
    km: 'KM 26+000 - KM 26+600',
    category: 'ST. BEKASI',
    d: 'M 1383.8 1112.6 L 603.8 1112.6',
    color: '#ff0000',
    xStart: 1383.8,
    xEnd: 603.8,
    y: 1112.6,
    startDivider: { type: 'DS', label: 'DS 19 (NC) BKS HI', km: 'KM 26+000' },
    endDivider: { type: 'DS', label: 'DS 20 (NC) BKS-BKT', km: 'KM 26+600' },
  },
  {
    id: 'bks_jalur_2_west',
    code: 'ST. BEKASI',
    title: 'Jalur 2 Ujung Barat Bekasi',
    km: 'KM 26+600 - KM 26+800',
    category: 'ST. BEKASI (EMPLASEMEN BARAT)',
    d: 'M 592.1 1113.0 L 505.0 1113.0',
    color: '#ec1f24',
    xStart: 592.1,
    xEnd: 505.0,
    y: 1113.0,
    startDivider: { type: 'DS', label: 'DS 20 (NC)', km: 'KM 26+600' },
    endDivider: { type: 'BATAS', label: 'Batas Ujung Barat', km: 'KM 26+800' },
  },
  {
    id: 'bks_jalur_3_platform',
    code: 'ST. BEKASI',
    title: 'ST. BEKASI (Jalur 3 Peron)',
    km: 'KM 26+100 - KM 26+550',
    category: 'ST. BEKASI',
    d: 'M 1372.0 1174.0 L 737.6 1174.0',
    color: '#ec1f24',
    xStart: 1372.0,
    xEnd: 737.6,
    y: 1174.0,
    startDivider: { type: 'DS', label: 'DS Jalur 3 Timur', km: 'KM 26+100' },
    endDivider: { type: 'WESEL', label: 'Wesel Jalur 3 Barat', km: 'KM 26+550' },
  },
  {
    id: 'bks_jalur_simpan_960',
    code: 'ST. BEKASI',
    title: 'Jalur Stabling / Simpan Atas St. Bekasi',
    km: 'KM 26+200 - KM 26+450',
    category: 'ST. BEKASI (STABLING)',
    d: 'M 1256.6 960.1 L 934.0 960.1',
    color: '#139a47',
    xStart: 1256.6,
    xEnd: 934.0,
    y: 960.1,
    startDivider: { type: 'WESEL', label: 'Wesel W71C', km: 'KM 26+200' },
    endDivider: { type: 'BATAS', label: 'Ujung Sepur Badug Simpan', km: 'KM 26+450' },
  },
  {
    id: 'bks_jalur_simpan_1012',
    code: 'ST. BEKASI',
    title: 'ST. BEKASI (Jalur 4 Langsir & Stabling)',
    km: 'KM 26+150 - KM 26+500',
    category: 'ST. BEKASI (STABLING)',
    d: 'M 1299.2 1011.6 L 838.4 1011.6',
    color: '#139a47',
    xStart: 1299.2,
    xEnd: 838.4,
    y: 1011.6,
    startDivider: { type: 'FRP', label: 'FRP-JNG-23-71C1', km: 'KM 26+150' },
    endDivider: { type: 'FRP', label: 'FRP-JNG-26-73', km: 'KM 26+500' },
  },
  {
    id: 'bks_timur_1228_grn',
    code: 'BEKASI TIMUR',
    title: 'Emplasemen Percabangan Bekasi Timur 1',
    km: 'KM 27+000 - KM 27+200',
    category: 'BEKASI TIMUR',
    d: 'M 399.2 1227.8 L 260.3 1227.8',
    color: '#139a47',
    xStart: 399.2,
    xEnd: 260.3,
    y: 1227.8,
    startDivider: { type: 'WESEL', label: 'Wesel W13B1', km: 'KM 27+000' },
    endDivider: { type: 'BATAS', label: 'Arah Cikarang / Bekasi Timur', km: 'KM 27+200' },
  },
  {
    id: 'bks_timur_1228_red',
    code: 'BEKASI TIMUR',
    title: 'Emplasemen Percabangan Bekasi Timur 2',
    km: 'KM 26+900 - KM 27+100',
    category: 'BEKASI TIMUR',
    d: 'M 485.6 1227.8 L 404.9 1227.8',
    color: '#ec1f24',
    xStart: 485.6,
    xEnd: 404.9,
    y: 1227.8,
    startDivider: { type: 'WESEL', label: 'Wesel W13C', km: 'KM 26+900' },
    endDivider: { type: 'WESEL', label: 'Wesel W13B2', km: 'KM 27+100' },
  },
  {
    id: 'bks_timur_1277_red',
    code: 'BEKASI TIMUR',
    title: 'Emplasemen Percabangan Bekasi Timur 3 (Hilir)',
    km: 'KM 26+900 - KM 27+200',
    category: 'BEKASI TIMUR',
    d: 'M 485.6 1277.5 L 260.3 1277.5',
    color: '#ec1f24',
    xStart: 485.6,
    xEnd: 260.3,
    y: 1277.5,
    startDivider: { type: 'WESEL', label: 'Wesel W23B', km: 'KM 26+900' },
    endDivider: { type: 'BATAS', label: 'Arah Cikarang / Bekasi Timur', km: 'KM 27+200' },
  },
  {
    id: 'bks_vert_feeder_1',
    code: 'GARDU TRAKSI BEKASI',
    title: 'Feeder Vertikal GT Bekasi 1 (Stabling Track)',
    km: 'KM 26+200',
    category: 'GARDU TRAKSI BEKASI',
    d: 'M 1198.6 1237.5 L 1198.5 961.4',
    color: '#139a47',
    startDivider: { type: 'DS', label: 'DS 17 GT BKS', km: 'KM 26+200' },
    endDivider: { type: 'JALUR', label: 'Jalur Stabling 960', km: 'KM 26+200' },
  },
  {
    id: 'bks_vert_feeder_2',
    code: 'GARDU TRAKSI BEKASI',
    title: 'Feeder Vertikal GT Bekasi 2 (Jalur 1 Hulu)',
    km: 'KM 26+220',
    category: 'GARDU TRAKSI BEKASI',
    d: 'M 1211.0 1256.0 L 1211.0 1063.0',
    color: '#139a47',
    startDivider: { type: 'DS', label: 'DS 18 GT BKS', km: 'KM 26+220' },
    endDivider: { type: 'JALUR', label: 'Jalur 1 Peron BKS', km: 'KM 26+220' },
  },
  {
    id: 'bks_vert_feeder_3',
    code: 'GARDU TRAKSI BEKASI',
    title: 'Feeder Vertikal GT Bekasi 3 (Jalur 2 Hilir)',
    km: 'KM 26+250',
    category: 'GARDU TRAKSI BEKASI',
    d: 'M 1253.0 1237.4 L 1252.8 1112.6',
    color: '#ec1f24',
    startDivider: { type: 'DS', label: 'DS 19 GT BKS', km: 'KM 26+250' },
    endDivider: { type: 'JALUR', label: 'Jalur 2 Peron BKS', km: 'KM 26+250' },
  },
  {
    id: 'bks_vert_feeder_4',
    code: 'GARDU TRAKSI BEKASI',
    title: 'Feeder Vertikal GT Bekasi 4 (Jalur 3)',
    km: 'KM 26+270',
    category: 'GARDU TRAKSI BEKASI',
    d: 'M 1265.3 1255.8 L 1265.3 1174.0',
    color: '#ec1f24',
    startDivider: { type: 'DS', label: 'DS 20 GT BKS', km: 'KM 26+270' },
    endDivider: { type: 'JALUR', label: 'Jalur 3 Peron BKS', km: 'KM 26+270' },
  },
  {
    id: 'slope_1_206_360',
    code: 'WESEL KRAMAT',
    title: 'Wesel Crossing Kramat #1',
    km: 'KM 10+000 - KM 10+400',
    category: 'PERCABANGAN KRAMAT & PONDOK JATI',
    d: 'M 206.1 360.9 L 218.7 380.7',
    color: '#ff7fdf',
    isCrossing: true,
  },
  {
    id: 'slope_2_206_408',
    code: 'WESEL KRAMAT',
    title: 'Wesel Crossing Kramat #2',
    km: 'KM 10+000 - KM 10+400',
    category: 'PERCABANGAN KRAMAT & PONDOK JATI',
    d: 'M 206.1 408.7 L 218.7 428.5',
    color: '#ff0000',
    isCrossing: true,
  },
  {
    id: 'slope_3_307_1249',
    code: 'WESEL BEKASI',
    title: 'Wesel Crossing Emplasemen Bekasi #3',
    km: 'KM 25+000 - KM 26+800',
    category: 'ST. BEKASI & EMPLASEMEN',
    d: 'M 307.0 1249.9 L 288.8 1227.8',
    color: '#139a47',
    isCrossing: true,
  },
  {
    id: 'slope_4_329_1277',
    code: 'WESEL BEKASI',
    title: 'Wesel Crossing Emplasemen Bekasi #4',
    km: 'KM 25+000 - KM 26+800',
    category: 'ST. BEKASI & EMPLASEMEN',
    d: 'M 329.7 1277.5 L 310.5 1254.0',
    color: '#ec1f24',
    isCrossing: true,
  },
  {
    id: 'slope_5_432_1227',
    code: 'WESEL BEKASI',
    title: 'Wesel Crossing Emplasemen Bekasi #5',
    km: 'KM 25+000 - KM 26+800',
    category: 'ST. BEKASI & EMPLASEMEN',
    d: 'M 432.4 1227.8 L 391.7 1277.5',
    color: '#ec1f24',
    isCrossing: true,
  },
  {
    id: 'slope_6_460_1063',
    code: 'WESEL BEKASI',
    title: 'Wesel Crossing Emplasemen Bekasi #6',
    km: 'KM 25+000 - KM 26+800',
    category: 'ST. BEKASI & EMPLASEMEN',
    d: 'M 460.4 1063.4 L 370.4 1227.8',
    color: '#139a47',
    isCrossing: true,
  },
  {
    id: 'slope_7_505_1113',
    code: 'WESEL BEKASI',
    title: 'Wesel Crossing Emplasemen Bekasi #7',
    km: 'KM 25+000 - KM 26+800',
    category: 'ST. BEKASI & EMPLASEMEN',
    d: 'M 505.0 1113.0 L 442.6 1227.6',
    color: '#ec1f24',
    isCrossing: true,
  },
  {
    id: 'slope_8_571_681',
    code: 'WESEL MRI-JNG',
    title: 'Wesel Crossing Manggarai - JNG #8',
    km: 'KM 11+000 - KM 11+800',
    category: 'PETAK MANGGARAI - JATINEGARA',
    d: 'M 571.2 681.6 L 552.8 703.5',
    color: '#ff00ff',
    isCrossing: true,
  },
  {
    id: 'slope_9_593_656',
    code: 'WESEL MRI-JNG',
    title: 'Wesel Crossing Manggarai - JNG #9',
    km: 'KM 11+000 - KM 11+800',
    category: 'PETAK MANGGARAI - JATINEGARA',
    d: 'M 593.4 656.1 L 575.9 676.4',
    color: '#f8d731',
    isCrossing: true,
  },
  {
    id: 'slope_10_654_370',
    code: 'ST. JATINEGARA',
    title: 'Wesel Langsir Barat JNG #10',
    km: 'KM 11+400 - KM 11+750',
    category: 'ST. JATINEGARA (EMPLASEMEN BARAT)',
    d: 'M 654.3 370.4 L 668.2 381.6',
    color: '#139a47',
    isCrossing: true,
  },
  {
    id: 'slope_11_655_630',
    code: 'WESEL MRI-JNG',
    title: 'Wesel Crossing Manggarai - JNG #11',
    km: 'KM 11+000 - KM 11+800',
    category: 'PETAK MANGGARAI - JATINEGARA',
    d: 'M 655.5 630.7 L 634.4 656.1',
    color: '#f8d731',
    isCrossing: true,
  },
  {
    id: 'slope_12_672_384',
    code: 'ST. JATINEGARA',
    title: 'Wesel Langsir Barat JNG #12',
    km: 'KM 11+400 - KM 11+750',
    category: 'ST. JATINEGARA (EMPLASEMEN BARAT)',
    d: 'M 672.4 384.9 L 713.7 417.8',
    color: '#cc6827',
    isCrossing: true,
  },
  {
    id: 'slope_13_677_605',
    code: 'WESEL MRI-JNG',
    title: 'Wesel Crossing Manggarai - JNG #13',
    km: 'KM 11+000 - KM 11+800',
    category: 'PETAK MANGGARAI - JATINEGARA',
    d: 'M 677.4 605.6 L 659.4 626.5',
    color: '#cc6827',
    isCrossing: true,
  },
  {
    id: 'slope_14_695_385',
    code: 'ST. JATINEGARA',
    title: 'Wesel Langsir Barat JNG #14',
    km: 'KM 11+400 - KM 11+750',
    category: 'ST. JATINEGARA (EMPLASEMEN BARAT)',
    d: 'M 695.3 385.0 L 654.3 417.8',
    color: '#cc6827',
    isCrossing: true,
  },
  {
    id: 'slope_15_713_370',
    code: 'ST. JATINEGARA',
    title: 'Wesel Langsir Barat JNG #15',
    km: 'KM 11+400 - KM 11+750',
    category: 'ST. JATINEGARA (EMPLASEMEN BARAT)',
    d: 'M 713.7 370.4 L 699.5 381.7',
    color: '#139a47',
    isCrossing: true,
  },
  {
    id: 'slope_16_752_559',
    code: 'WESEL MRI-JNG',
    title: 'Wesel Crossing Manggarai - JNG #16',
    km: 'KM 11+000 - KM 11+800',
    category: 'PETAK MANGGARAI - JATINEGARA',
    d: 'M 752.3 559.6 L 720.4 605.6',
    color: '#cc6827',
    isCrossing: true,
  },
  {
    id: 'slope_17_772_417',
    code: 'ST. JATINEGARA',
    title: 'Wesel Langsir Barat JNG #17',
    km: 'KM 11+400 - KM 11+750',
    category: 'ST. JATINEGARA (EMPLASEMEN BARAT)',
    d: 'M 772.0 417.8 L 818.2 465.3',
    color: '#cc6827',
    isCrossing: true,
  },
  {
    id: 'slope_18_797_1139',
    code: 'WESEL BEKASI',
    title: 'Wesel Crossing Emplasemen Bekasi #18',
    km: 'KM 25+000 - KM 26+800',
    category: 'ST. BEKASI & EMPLASEMEN',
    d: 'M 797.7 1139.1 L 775.6 1112.6',
    color: '#ec1f24',
    isCrossing: true,
  },
  {
    id: 'slope_19_807_1037',
    code: 'WESEL BEKASI',
    title: 'Wesel Crossing Emplasemen Bekasi #19',
    km: 'KM 25+000 - KM 26+800',
    category: 'ST. BEKASI & EMPLASEMEN',
    d: 'M 807.6 1037.1 L 776.9 1062.7',
    color: '#139a47',
    isCrossing: true,
  },
  {
    id: 'slope_20_821_469',
    code: 'ST. JATINEGARA',
    title: 'Wesel Langsir Barat JNG #20',
    km: 'KM 11+400 - KM 11+750',
    category: 'ST. JATINEGARA (EMPLASEMEN BARAT)',
    d: 'M 821.9 469.2 L 864.3 512.7',
    color: '#cc6827',
    isCrossing: true,
  },
  {
    id: 'slope_21_826_1174',
    code: 'WESEL BEKASI',
    title: 'Wesel Crossing Emplasemen Bekasi #21',
    km: 'KM 25+000 - KM 26+800',
    category: 'ST. BEKASI & EMPLASEMEN',
    d: 'M 826.6 1174.0 L 801.2 1143.3',
    color: '#ec1f24',
    isCrossing: true,
  },
  {
    id: 'slope_22_828_512',
    code: 'ST. JATINEGARA',
    title: 'Wesel Langsir Barat JNG #22',
    km: 'KM 11+400 - KM 11+750',
    category: 'ST. JATINEGARA (EMPLASEMEN BARAT)',
    d: 'M 828.3 512.7 L 796.2 559.6',
    color: '#cc6827',
    isCrossing: true,
  },
  {
    id: 'slope_23_838_1011',
    code: 'WESEL BEKASI',
    title: 'Wesel Crossing Emplasemen Bekasi #23',
    km: 'KM 25+000 - KM 26+800',
    category: 'ST. BEKASI & EMPLASEMEN',
    d: 'M 838.4 1011.6 L 812.1 1033.4',
    color: '#139a47',
    isCrossing: true,
  },
  {
    id: 'slope_24_932_656',
    code: 'WESEL MRI-JNG',
    title: 'Wesel Crossing Manggarai - JNG #24',
    km: 'KM 11+000 - KM 11+800',
    category: 'PETAK MANGGARAI - JATINEGARA',
    d: 'M 932.6 656.1 L 974.3 689.4',
    color: '#f8d731',
    isCrossing: true,
  },
  {
    id: 'slope_25_946_692',
    code: 'WESEL MRI-JNG',
    title: 'Wesel Crossing Manggarai - JNG #25',
    km: 'KM 11+000 - KM 11+800',
    category: 'PETAK MANGGARAI - JATINEGARA',
    d: 'M 946.0 692.7 L 932.6 703.5',
    color: '#ff00ff',
    isCrossing: true,
  },
  {
    id: 'slope_26_978_693',
    code: 'WESEL MRI-JNG',
    title: 'Wesel Crossing Manggarai - JNG #26',
    km: 'KM 11+000 - KM 11+800',
    category: 'PETAK MANGGARAI - JATINEGARA',
    d: 'M 978.8 693.0 L 992.0 703.5',
    color: '#ff00ff',
    isCrossing: true,
  },
  {
    id: 'slope_27_991_322',
    code: 'ST. JATINEGARA',
    title: 'Wesel Langsir Barat JNG #27',
    km: 'KM 11+400 - KM 11+750',
    category: 'ST. JATINEGARA (EMPLASEMEN BARAT)',
    d: 'M 991.5 322.4 L 959.8 370.3',
    color: '#139a47',
    isCrossing: true,
  },
  {
    id: 'slope_28_991_465',
    code: 'ST. JATINEGARA',
    title: 'Wesel Langsir Barat JNG #28',
    km: 'KM 11+400 - KM 11+750',
    category: 'ST. JATINEGARA (EMPLASEMEN BARAT)',
    d: 'M 991.5 465.6 L 961.2 417.8',
    color: '#cc6827',
    isCrossing: true,
  },
  {
    id: 'slope_29_992_656',
    code: 'WESEL MRI-JNG',
    title: 'Wesel Crossing Manggarai - JNG #29',
    km: 'KM 11+000 - KM 11+800',
    category: 'PETAK MANGGARAI - JATINEGARA',
    d: 'M 992.0 656.1 L 950.2 689.4',
    color: '#f8d731',
    isCrossing: true,
  },
  {
    id: 'slope_30_1017_490',
    code: 'WESEL BEKASI',
    title: 'Wesel Crossing Emplasemen Bekasi #30',
    km: 'KM 25+000 - KM 26+800',
    category: 'ST. BEKASI & EMPLASEMEN',
    d: 'M 1017.0 490.2 L 997.6 513.0',
    color: '#cc6827',
    isCrossing: true,
  },
  {
    id: 'slope_31_1038_465',
    code: 'WESEL BEKASI',
    title: 'Wesel Crossing Emplasemen Bekasi #31',
    km: 'KM 25+000 - KM 26+800',
    category: 'ST. BEKASI & EMPLASEMEN',
    d: 'M 1038.3 465.4 L 1020.8 485.8',
    color: '#cc6827',
    isCrossing: true,
  },
  {
    id: 'slope_32_1296_1174',
    code: 'WESEL BEKASI',
    title: 'Wesel Crossing Emplasemen Bekasi #32',
    km: 'KM 25+000 - KM 26+800',
    category: 'ST. BEKASI & EMPLASEMEN',
    d: 'M 1296.8 1174.0 L 1319.3 1143.3',
    color: '#ec1f24',
    isCrossing: true,
  },
  {
    id: 'slope_33_1319_1035',
    code: 'WESEL BEKASI',
    title: 'Wesel Crossing Emplasemen Bekasi #33',
    km: 'KM 25+000 - KM 26+800',
    category: 'ST. BEKASI & EMPLASEMEN',
    d: 'M 1319.3 1035.9 L 1256.6 960.1',
    color: '#139a47',
    isCrossing: true,
  },
  {
    id: 'slope_34_1322_1138',
    code: 'WESEL BEKASI',
    title: 'Wesel Crossing Emplasemen Bekasi #34',
    km: 'KM 25+000 - KM 26+800',
    category: 'ST. BEKASI & EMPLASEMEN',
    d: 'M 1322.7 1138.6 L 1341.8 1112.6',
    color: '#ec1f24',
    isCrossing: true,
  },
  {
    id: 'slope_35_1341_1063',
    code: 'WESEL BEKASI',
    title: 'Wesel Crossing Emplasemen Bekasi #35',
    km: 'KM 25+000 - KM 26+800',
    category: 'ST. BEKASI & EMPLASEMEN',
    d: 'M 1341.8 1063.0 L 1322.7 1040.0',
    color: '#139a47',
    isCrossing: true,
  },
  {
    id: 'slope_36_1421_322',
    code: 'WESEL W83A1',
    title: 'Wesel W83A1 (Jalur 8 ke Jalur 7)',
    km: 'KM 11+800 - KM 12+500',
    category: 'ST. JATINEGARA (EMPLASEMEN TIMUR)',
    d: 'M 1421.8 322.4 L 1452.8 370.0',
    color: '#139a47',
    isCrossing: true,
  },
  {
    id: 'slope_37_1431_1113',
    code: 'WESEL BEKASI',
    title: 'Wesel Crossing Emplasemen Bekasi #37',
    km: 'KM 25+000 - KM 26+800',
    category: 'ST. BEKASI & EMPLASEMEN',
    d: 'M 1431.2 1113.0 L 1449.6 1091.5',
    color: '#ff0000',
    isCrossing: true,
  },
  {
    id: 'slope_38_1452_417',
    code: 'WESEL W63A',
    title: 'Wesel W63A (Jalur 6 ke Jalur 4/3)',
    km: 'KM 11+800 - KM 12+500',
    category: 'ST. JATINEGARA (EMPLASEMEN TIMUR)',
    d: 'M 1452.8 417.4 L 1546.0 560.5',
    color: '#cc6827',
    isCrossing: true,
  },
  {
    id: 'slope_39_1454_1087',
    code: 'WESEL BEKASI',
    title: 'Wesel Crossing Emplasemen Bekasi #39',
    km: 'KM 25+000 - KM 26+800',
    category: 'ST. BEKASI & EMPLASEMEN',
    d: 'M 1454.3 1087.4 L 1474.7 1063.3',
    color: '#139a47',
    isCrossing: true,
  },
  {
    id: 'slope_40_1461_512',
    code: 'WESEL JNG',
    title: 'Wesel Jalur 4 ke Jalur 3 (JNG)',
    km: 'KM 11+800 - KM 12+500',
    category: 'ST. JATINEGARA (EMPLASEMEN TIMUR)',
    d: 'M 1461.9 512.7 L 1489.8 560.5',
    color: '#cc6827',
    isCrossing: true,
  },
  {
    id: 'slope_41_1476_370',
    code: 'WESEL W83A1',
    title: 'Wesel W83A1 (Jalur 8 ke Jalur 7)',
    km: 'KM 11+800 - KM 12+500',
    category: 'ST. JATINEGARA (EMPLASEMEN TIMUR)',
    d: 'M 1476.9 370.0 L 1568.0 512.7',
    color: '#139a47',
    isCrossing: true,
  },
  {
    id: 'slope_42_1524_1086',
    code: 'WESEL BEKASI',
    title: 'Wesel Crossing Emplasemen Bekasi #42',
    km: 'KM 25+000 - KM 26+800',
    category: 'ST. BEKASI & EMPLASEMEN',
    d: 'M 1524.3 1086.2 L 1505.1 1063.0',
    color: '#139a47',
    isCrossing: true,
  },
  {
    id: 'slope_43_1547_1112',
    code: 'WESEL BEKASI',
    title: 'Wesel Crossing Emplasemen Bekasi #43',
    km: 'KM 25+000 - KM 26+800',
    category: 'ST. BEKASI & EMPLASEMEN',
    d: 'M 1547.1 1112.8 L 1528.7 1090.9',
    color: '#ff0000',
    isCrossing: true,
  },
  {
    id: 'slope_44_1596_560',
    code: 'WESEL W23B',
    title: 'Wesel W23B1 / W23B2',
    km: 'KM 11+800 - KM 12+500',
    category: 'ST. JATINEGARA (EMPLASEMEN TIMUR)',
    d: 'M 1596.8 560.5 L 1613.8 580.0',
    color: '#cc6827',
    isCrossing: true,
  },
  {
    id: 'slope_45_1600_607',
    code: 'WESEL W13B',
    title: 'Wesel W13B (Crossover Jalur 3 ke 2)',
    km: 'KM 11+800 - KM 12+500',
    category: 'ST. JATINEGARA (EMPLASEMEN TIMUR)',
    d: 'M 1600.7 607.9 L 1560.5 655.9',
    color: '#f8d731',
    isCrossing: true,
  },
  {
    id: 'slope_46_1617_584',
    code: 'WESEL W23B',
    title: 'Wesel W23B1 / W23B2',
    km: 'KM 11+800 - KM 12+500',
    category: 'ST. JATINEGARA (EMPLASEMEN TIMUR)',
    d: 'M 1617.5 584.0 L 1638.4 608.0',
    color: '#f8d731',
    isCrossing: true,
  },
  {
    id: 'slope_47_1628_512',
    code: 'WESEL W83A2',
    title: 'Wesel W83A2 (Crossover Jalur 4)',
    km: 'KM 11+800 - KM 12+500',
    category: 'ST. JATINEGARA (EMPLASEMEN TIMUR)',
    d: 'M 1628.1 512.7 L 1667.3 560.5',
    color: '#139a47',
    isCrossing: true,
  },
  {
    id: 'slope_48_1667_608',
    code: 'WESEL W13C',
    title: 'Wesel W13C1 / W13C2',
    km: 'KM 11+800 - KM 12+500',
    category: 'ST. JATINEGARA (EMPLASEMEN TIMUR)',
    d: 'M 1667.0 608.0 L 1708.7 655.8',
    color: '#f8d731',
    isCrossing: true,
  },
  {
    id: 'slope_49_1692_560',
    code: 'WESEL W23C',
    title: 'Wesel W23C1 / W23C2',
    km: 'KM 11+800 - KM 12+500',
    category: 'ST. JATINEGARA (EMPLASEMEN TIMUR)',
    d: 'M 1692.9 560.5 L 1710.0 580.2',
    color: '#139a47',
    isCrossing: true,
  },
  {
    id: 'slope_50_1713_584',
    code: 'WESEL W23C',
    title: 'Wesel W23C1 / W23C2',
    km: 'KM 11+800 - KM 12+500',
    category: 'ST. JATINEGARA (EMPLASEMEN TIMUR)',
    d: 'M 1713.8 584.1 L 1734.8 608.1',
    color: '#f8d731',
    isCrossing: true,
  },
  {
    id: 'slope_51_1750_608',
    code: 'WESEL W13D',
    title: 'Wesel W13D1 / W13D2',
    km: 'KM 11+800 - KM 12+500',
    category: 'ST. JATINEGARA (EMPLASEMEN TIMUR)',
    d: 'M 1750.1 608.1 L 1767.3 627.8',
    color: '#f8d731',
    isCrossing: true,
  },
  {
    id: 'slope_52_1750_656',
    code: 'WESEL W33B',
    title: 'Wesel W33B1 / W33B2',
    km: 'KM 11+800 - KM 12+500',
    category: 'ST. JATINEGARA (EMPLASEMEN TIMUR)',
    d: 'M 1750.1 656.2 L 1767.3 675.9',
    color: '#f8d731',
    isCrossing: true,
  },
  {
    id: 'slope_53_1751_1102',
    code: 'WESEL BEKASI',
    title: 'Wesel Crossing Emplasemen Bekasi #53',
    km: 'KM 25+000 - KM 26+800',
    category: 'ST. BEKASI & EMPLASEMEN',
    d: 'M 1751.8 1102.9 L 1739.1 1122.7',
    color: '#00bfff',
    isCrossing: true,
  },
  {
    id: 'slope_54_1753_1053',
    code: 'WESEL BEKASI',
    title: 'Wesel Crossing Emplasemen Bekasi #54',
    km: 'KM 25+000 - KM 26+800',
    category: 'ST. BEKASI & EMPLASEMEN',
    d: 'M 1753.2 1053.4 L 1740.5 1073.2',
    color: '#ff00ff',
    isCrossing: true,
  },
  {
    id: 'slope_55_1771_632',
    code: 'WESEL W13D',
    title: 'Wesel W13D1 / W13D2',
    km: 'KM 11+800 - KM 12+500',
    category: 'ST. JATINEGARA (EMPLASEMEN TIMUR)',
    d: 'M 1771.6 632.5 L 1791.9 655.8',
    color: '#f8d731',
    isCrossing: true,
  },
  {
    id: 'slope_56_1771_680',
    code: 'WESEL W53',
    title: 'Wesel W53B / W53C',
    km: 'KM 11+800 - KM 12+500',
    category: 'ST. JATINEGARA (EMPLASEMEN TIMUR)',
    d: 'M 1771.6 680.6 L 1791.9 703.9',
    color: '#ff00ff',
    isCrossing: true,
  },
  {
    id: 'slope_57_1813_1053',
    code: 'WESEL BEKASI',
    title: 'Wesel Crossing Emplasemen Bekasi #57',
    km: 'KM 25+000 - KM 26+800',
    category: 'ST. BEKASI & EMPLASEMEN',
    d: 'M 1813.6 1053.7 L 1824.3 1064.2',
    color: '#ff00ff',
    isCrossing: true,
  },
  {
    id: 'slope_58_1822_1053',
    code: 'WESEL BEKASI',
    title: 'Wesel Crossing Emplasemen Bekasi #58',
    km: 'KM 25+000 - KM 26+800',
    category: 'ST. BEKASI & EMPLASEMEN',
    d: 'M 1822.4 1053.4 L 1809.6 1073.4',
    color: '#ff00ff',
    isCrossing: true,
  },
  {
    id: 'slope_59_1834_655',
    code: 'WESEL W33C',
    title: 'Wesel W33C1 / W33C2',
    km: 'KM 11+800 - KM 12+500',
    category: 'ST. JATINEGARA (EMPLASEMEN TIMUR)',
    d: 'M 1834.1 655.8 L 1851.6 675.9',
    color: '#f8d731',
    isCrossing: true,
  },
  {
    id: 'slope_60_1856_680',
    code: 'WESEL W53',
    title: 'Wesel W53B / W53C',
    km: 'KM 11+800 - KM 12+500',
    category: 'ST. JATINEGARA (EMPLASEMEN TIMUR)',
    d: 'M 1856.1 680.6 L 1876.4 703.9',
    color: '#ff00ff',
    isCrossing: true,
  },
  {
    id: 'slope_61_2076_693',
    code: 'AJ KM 13+300',
    title: 'Air Joint Overlap KM 13+300',
    km: 'KM 13+300',
    category: 'PETAK JATINEGARA - KLENDER - BUARAN',
    d: 'M 2076.2 693.1 L 2088.8 712.9',
    color: '#ff9f7f',
    isCrossing: true,
  },
  {
    id: 'slope_62_2078_646',
    code: 'AJ KM 13+300',
    title: 'Air Joint Overlap KM 13+300',
    km: 'KM 13+300',
    category: 'PETAK JATINEGARA - KLENDER - BUARAN',
    d: 'M 2078.2 646.2 L 2090.8 666.0',
    color: '#0000ff',
    isCrossing: true,
  },
  {
    id: 'slope_63_2156_692',
    code: 'AJ KM 14+100',
    title: 'Air Joint Overlap KM 14+100',
    km: 'KM 14+100',
    category: 'PETAK JATINEGARA - KLENDER - BUARAN',
    d: 'M 2156.3 692.7 L 2169.0 712.5',
    color: '#ff9f7f',
    isCrossing: true,
  },
  {
    id: 'slope_64_2158_645',
    code: 'AJ KM 14+100',
    title: 'Air Joint Overlap KM 14+100',
    km: 'KM 14+100',
    category: 'PETAK JATINEGARA - KLENDER - BUARAN',
    d: 'M 2158.4 645.7 L 2171.1 665.6',
    color: '#0000ff',
    isCrossing: true,
  },
  {
    id: 'slope_65_2216_1053',
    code: 'AJ KM 22+700',
    title: 'Air Joint Overlap KM 22+700',
    km: 'KM 22+700',
    category: 'ST. CAKUNG - KRANJI',
    d: 'M 2216.9 1053.9 L 2206.1 1070.8',
    color: '#8a6ddd',
    isCrossing: true,
  },
  {
    id: 'slope_66_2220_1102',
    code: 'AJ KM 22+700',
    title: 'Air Joint Overlap KM 22+700',
    km: 'KM 22+700',
    category: 'ST. CAKUNG - KRANJI',
    d: 'M 2220.2 1102.5 L 2207.4 1122.3',
    color: '#cc6827',
    isCrossing: true,
  },
  {
    id: 'slope_67_2242_692',
    code: 'AJ KM 14+700',
    title: 'Air Joint Overlap KM 14+700',
    km: 'KM 14+700',
    category: 'PETAK JATINEGARA - KLENDER - BUARAN',
    d: 'M 2242.7 692.5 L 2255.4 712.3',
    color: '#ff9f7f',
    isCrossing: true,
  },
  {
    id: 'slope_68_2244_645',
    code: 'AJ KM 14+700',
    title: 'Air Joint Overlap KM 14+700',
    km: 'KM 14+700',
    category: 'PETAK JATINEGARA - KLENDER - BUARAN',
    d: 'M 2244.8 645.6 L 2257.5 665.4',
    color: '#0000ff',
    isCrossing: true,
  },
  {
    id: 'slope_69_2366_1112',
    code: 'WESEL CAKUNG',
    title: 'Wesel W13B / W23B St. Cakung',
    km: 'KM 20+800',
    category: 'ST. CAKUNG - KRANJI',
    d: 'M 2366.1 1112.0 L 2385.4 1089.2',
    color: '#cc6827',
    isCrossing: true,
  },
  {
    id: 'slope_70_2389_1084',
    code: 'WESEL CAKUNG',
    title: 'Wesel W13B / W23B St. Cakung',
    km: 'KM 20+800',
    category: 'ST. CAKUNG - KRANJI',
    d: 'M 2389.2 1084.2 L 2406.4 1063.9',
    color: '#8a6ddd',
    isCrossing: true,
  },
  {
    id: 'slope_71_2414_1063',
    code: 'WESEL CAKUNG',
    title: 'Wesel W13A / W23A St. Cakung',
    km: 'KM 20+900',
    category: 'ST. CAKUNG - KRANJI',
    d: 'M 2414.9 1063.8 L 2453.3 1022.1',
    color: '#8a6ddd',
    isCrossing: true,
  },
  {
    id: 'slope_72_2452_1153',
    code: 'WESEL CAKUNG',
    title: 'Wesel W13A / W23A St. Cakung',
    km: 'KM 20+900',
    category: 'ST. CAKUNG - KRANJI',
    d: 'M 2452.2 1153.9 L 2414.9 1112.0',
    color: '#cc6827',
    isCrossing: true,
  },
  {
    id: 'slope_73_2583_1022',
    code: 'WESEL CAKUNG',
    title: 'Wesel W11B / W21B St. Cakung',
    km: 'KM 21+000',
    category: 'ST. CAKUNG - KRANJI',
    d: 'M 2583.0 1022.1 L 2616.9 1064.2',
    color: '#8a6ddd',
    isCrossing: true,
  },
  {
    id: 'slope_74_2616_1112',
    code: 'WESEL CAKUNG',
    title: 'Wesel W11B / W21B St. Cakung',
    km: 'KM 21+000',
    category: 'ST. CAKUNG - KRANJI',
    d: 'M 2616.9 1112.1 L 2583.0 1153.9',
    color: '#cc6827',
    isCrossing: true,
  },
  {
    id: 'slope_75_2628_694',
    code: 'AJ KM 16+500',
    title: 'Air Joint Overlap KM 16+500',
    km: 'KM 16+500',
    category: 'PETAK JATINEGARA - KLENDER - BUARAN',
    d: 'M 2628.6 694.2 L 2641.4 714.1',
    color: '#00ff00',
    isCrossing: true,
  },
  {
    id: 'slope_76_2630_646',
    code: 'AJ KM 16+500',
    title: 'Air Joint Overlap KM 16+500',
    km: 'KM 16+500',
    category: 'PETAK JATINEGARA - KLENDER - BUARAN',
    d: 'M 2630.1 646.5 L 2642.8 666.3',
    color: '#ff00ff',
    isCrossing: true,
  },
  {
    id: 'slope_77_2644_1084',
    code: 'WESEL CAKUNG',
    title: 'Wesel W11A / W21A St. Cakung',
    km: 'KM 21+100',
    category: 'ST. CAKUNG - KRANJI',
    d: 'M 2644.2 1084.6 L 2627.8 1064.2',
    color: '#8a6ddd',
    isCrossing: true,
  },
  {
    id: 'slope_78_2666_1112',
    code: 'WESEL CAKUNG',
    title: 'Wesel W11A / W21A St. Cakung',
    km: 'KM 21+100',
    category: 'ST. CAKUNG - KRANJI',
    d: 'M 2666.7 1112.1 L 2648.4 1089.3',
    color: '#cc6827',
    isCrossing: true,
  },
  {
    id: 'slope_79_3047_1055',
    code: 'LOOP BUA-KLDB',
    title: 'Tikungan Loop Menurun Buaran - Klender Baru #79',
    km: 'KM 18+800 - KM 19+300',
    category: 'PETAK BUARAN - KLENDER BARU (MENURUN)',
    d: 'M 3047.8 1055.4 L 3035.1 1075.2',
    color: '#ff0000',
    isCrossing: true,
  },
  {
    id: 'slope_80_3047_1103',
    code: 'LOOP BUA-KLDB',
    title: 'Tikungan Loop Menurun Buaran - Klender Baru #80',
    km: 'KM 18+800 - KM 19+300',
    category: 'PETAK BUARAN - KLENDER BARU (MENURUN)',
    d: 'M 3047.8 1103.1 L 3035.1 1122.9',
    color: '#f8d731',
    isCrossing: true,
  },
  {
    id: 'slope_81_3089_645',
    code: 'AJ KM 18+800',
    title: 'Air Joint Overlap KM 18+800 (Buaran Timur)',
    km: 'KM 18+800',
    category: 'PETAK JATINEGARA - KLENDER - BUARAN',
    d: 'M 3089.4 645.7 L 3102.2 665.5',
    color: '#f8d731',
    isCrossing: true,
  },
  {
    id: 'slope_82_3089_693',
    code: 'AJ KM 18+800',
    title: 'Air Joint Overlap KM 18+800 (Buaran Timur)',
    km: 'KM 18+800',
    category: 'PETAK JATINEGARA - KLENDER - BUARAN',
    d: 'M 3089.4 693.4 L 3102.2 713.2',
    color: '#ff0000',
    isCrossing: true,
  },
  {
    id: 'slope_83_3112_702',
    code: 'LOOP BUA-KLDB',
    title: 'Tikungan Loop Menurun Buaran - Klender Baru #83',
    km: 'KM 18+800 - KM 19+300',
    category: 'PETAK BUARAN - KLENDER BARU (MENURUN)',
    d: 'M 3112.5 702.9 L 3143.9 735.4',
    color: '#ff0000',
    isCrossing: true,
  },
  {
    id: 'slope_84_3122_1112',
    code: 'LOOP BUA-KLDB',
    title: 'Tikungan Loop Menurun Buaran - Klender Baru #84',
    km: 'KM 18+800 - KM 19+300',
    category: 'PETAK BUARAN - KLENDER BARU (MENURUN)',
    d: 'M 3122.6 1112.4 L 3181.0 1047.9',
    color: '#f8d731',
    isCrossing: true,
  },
  {
    id: 'slope_85_3122_655',
    code: 'LOOP BUA-KLDB',
    title: 'Tikungan Loop Menurun Buaran - Klender Baru #85',
    km: 'KM 18+800 - KM 19+300',
    category: 'PETAK BUARAN - KLENDER BARU (MENURUN)',
    d: 'M 3122.8 655.2 L 3181.1 715.5',
    color: '#f8d731',
    isCrossing: true,
  },
  {
    id: 'slope_86_3143_1021',
    code: 'LOOP BUA-KLDB',
    title: 'Tikungan Loop Menurun Buaran - Klender Baru #86',
    km: 'KM 18+800 - KM 19+300',
    category: 'PETAK BUARAN - KLENDER BARU (MENURUN)',
    d: 'M 3143.8 1021.0 L 3102.0 1064.7',
    color: '#ff0000',
    isCrossing: true,
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
      <div className="bg-white/95 border-b border-slate-200 px-3 sm:px-5 py-2 sm:py-2.5 flex flex-wrap items-center justify-between gap-2 sm:gap-3 z-20 backdrop-blur-md">
        
        {/* Left Instruction */}
        <div className="flex items-center space-x-2">
          <div className="p-1 sm:p-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 shrink-0">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <p className="text-xs sm:text-sm text-slate-700 font-medium leading-tight">
            <span className="hidden sm:inline">
              Setiap seksi terpisah oleh <strong className="text-blue-700 font-bold">AJ</strong>, <strong className="text-emerald-700 font-bold">AS</strong>, <strong className="text-purple-700 font-bold">FRP</strong>, dan <strong className="text-orange-700 font-bold">DS</strong> • Termasuk wesel & crossing miring
            </span>
            <span className="sm:hidden text-xs">
              Peta LAA 1500V • <span className="text-blue-700 font-bold">Sentuh garis</span> untuk riwayat seksi
            </span>
          </p>
        </div>

        {/* Right Tools: Resolution & Zoom */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          
          <div className="bg-slate-100 p-0.5 sm:p-1 rounded-xl flex space-x-0.5 sm:space-x-1 border border-slate-200 text-[11px] sm:text-xs">
            <button
              onClick={() => setViewMode('web')}
              className={`px-2 sm:px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                viewMode === 'web'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Standar
            </button>
            <button
              onClick={() => setViewMode('hd')}
              className={`px-2 sm:px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                viewMode === 'hd'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ultra HD
            </button>
          </div>

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
          isFullscreen ? 'h-[calc(100vh-55px)]' : 'h-[440px] sm:h-[580px] lg:h-[720px]'
        }`}
      >
        {/* Floating Quick Hint */}
        <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-20 pointer-events-none bg-white/95 border border-slate-200 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl text-[11px] sm:text-xs text-slate-600 backdrop-blur-md flex items-center space-x-1.5 sm:space-x-2 shadow-sm">
          <Crosshair className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="hidden sm:inline">Scroll mouse untuk Zoom • Tahan klik kiri untuk geser peta</span>
          <span className="sm:hidden">Cubit 2 jari untuk zoom • Geser untuk navigasi</span>
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
            className="absolute z-50 pointer-events-auto bg-white/98 border border-slate-200 rounded-2xl p-3.5 sm:p-4 shadow-2xl backdrop-blur-xl w-auto sm:w-88 max-w-sm left-3 right-3 sm:left-auto sm:right-auto bottom-3 sm:bottom-auto animate-in zoom-in-95 duration-150 text-slate-800"
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

            {/* Direct Action Button to Input / View Work History */}
            <button
              onClick={() => onSelectLocation && onSelectLocation(hoveredLine)}
              className="w-full mt-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-between shadow-sm cursor-pointer transition-all active:scale-98"
            >
              <span className="flex items-center space-x-1.5">
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Input / Rincian Riwayat Seksi</span>
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Viewport Content (Centered) */}
        <div
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          }}
          className="relative flex items-center justify-center shrink-0 p-2 sm:p-4"
        >
          {/* Container tightly wrapping cropped schematic (Centered) */}
          <div className="relative w-[min(calc(100vw-24px),1420px)] rounded-xl sm:rounded-2xl overflow-hidden shadow-lg sm:shadow-xl border-2 border-slate-300/90 bg-white shrink-0">
            
            {/* Cropped AutoCAD Master Image */}
            <img
              src={imageSrc}
              alt="Peta Wilayah UPT Resor LAA 1.9 Jatinegara - Potongan Garis Tepi Terluar"
              className="w-full h-auto block select-none"
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
                      d={line.d}
                      stroke="transparent"
                      strokeWidth="34"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />

                    {/* 2. On Hover or Active (1 line only): Glowing Line in EXACT authentic AutoCAD color */}
                    {(isHovered || isActive) && (
                      <>
                        {/* Outer Glow Halo matching exact AutoCAD color */}
                        <path
                          d={line.d}
                          stroke={line.color}
                          strokeWidth="11"
                          strokeLinecap="round"
                          strokeLinejoin="round"
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
                          strokeLinecap="round"
                          strokeLinejoin="round"
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
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                          style={{
                            opacity: 0.95,
                            filter: 'drop-shadow(0 0 2px #ffffff)',
                          }}
                        />

                        {/* Tanda Pemisah Awal (Start Divider: AJ / AS / FRP / DS) */}
                        {line.xStart && line.y && line.startDivider && (
                          <g>
                            <line
                              x1={line.xStart - 8}
                              y1={line.y - 8}
                              x2={line.xStart + 8}
                              y2={line.y + 8}
                              stroke="#000000"
                              strokeWidth="4"
                            />
                            <line
                              x1={line.xStart - 8}
                              y1={line.y + 8}
                              x2={line.xStart + 8}
                              y2={line.y - 8}
                              stroke="#000000"
                              strokeWidth="4"
                            />
                            <line
                              x1={line.xStart - 8}
                              y1={line.y - 8}
                              x2={line.xStart + 8}
                              y2={line.y + 8}
                              stroke={line.color}
                              strokeWidth="2.5"
                            />
                            <line
                              x1={line.xStart - 8}
                              y1={line.y + 8}
                              x2={line.xStart + 8}
                              y2={line.y - 8}
                              stroke={line.color}
                              strokeWidth="2.5"
                            />
                          </g>
                        )}

                        {/* Tanda Pemisah Akhir (End Divider: AJ / AS / FRP / DS) */}
                        {line.xEnd && line.y && line.endDivider && (
                          <g>
                            <line
                              x1={line.xEnd - 8}
                              y1={line.y - 8}
                              x2={line.xEnd + 8}
                              y2={line.y + 8}
                              stroke="#000000"
                              strokeWidth="4"
                            />
                            <line
                              x1={line.xEnd - 8}
                              y1={line.y + 8}
                              x2={line.xEnd + 8}
                              y2={line.y - 8}
                              stroke="#000000"
                              strokeWidth="4"
                            />
                            <line
                              x1={line.xEnd - 8}
                              y1={line.y - 8}
                              x2={line.xEnd + 8}
                              y2={line.y + 8}
                              stroke={line.color}
                              strokeWidth="2.5"
                            />
                            <line
                              x1={line.xEnd - 8}
                              y1={line.y + 8}
                              x2={line.xEnd + 8}
                              y2={line.y - 8}
                              stroke={line.color}
                              strokeWidth="2.5"
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
