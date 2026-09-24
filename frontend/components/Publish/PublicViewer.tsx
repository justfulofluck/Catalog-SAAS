import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  FileDown,
  Image as ImageIcon,
  Globe,
  Loader2,
  BookOpen,
  Layers,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Maximize2,
  Minimize2,
  RotateCcw,
  Sparkles,
  Share2,
  Copy,
  Check
} from 'lucide-react';
import { Canvas } from 'fabric';
import { useStore } from '../../store/useStore';
import { PAGE_WIDTH, PAGE_HEIGHT, THEMES, CatalogPage } from '../../constants';
import { elementToFabricObject } from '../Editor/fabricRenderer';
import { exportCatalogToPDF } from '../Editor/pdfExporter';
import { resolveDynamicText, getPageCategoryName } from '../../utils/dynamicTags';

// Web Audio API realistic paper flip sound synthesizer
const playFlipSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();
    const bufferSize = Math.floor(audioCtx.sampleRate * 0.09);
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
    }

    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, audioCtx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.09);

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.09);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    noise.start();
  } catch {}
};

export const PublicViewer: React.FC = () => {
  const {
    savedCatalogs,
    viewingCatalogId,
    publicCatalog,
    setView,
    activeThemeId,
    fetchPublicCatalog,
    isLoading,
    isAuthenticated,
    products,
    showToast
  } = useStore();

  const catalog =
    publicCatalog ||
    savedCatalogs.find(
      (c) =>
        String(c.id) === String(viewingCatalogId) ||
        (c.uuid && String(c.uuid) === String(viewingCatalogId))
    );

  const pages = catalog?.pages || [];
  const totalPages = pages.length;

  // View & Interactive States
  const [viewMode, setViewMode] = useState<'3d' | 'single'>('3d');
  const [currentSpread, setCurrentSpread] = useState(0); // 0 = Cover; 1 = Pages 2-3; 2 = Pages 4-5...
  const [singlePageIndex, setSinglePageIndex] = useState(0);
  const [zoom, setZoom] = useState(1.0);
  const [flipState, setFlipState] = useState<{
    isFlipping: boolean;
    direction: 'next' | 'prev';
    fromSpread: number;
    toSpread: number;
  } | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showThumbDrawer, setShowThumbDrawer] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [pageImages, setPageImages] = useState<Record<number, string>>({});
  const [renderedCount, setRenderedCount] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  // Responsive Viewport Dimensions
  const [windowDimensions, setWindowDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1440,
    height: typeof window !== 'undefined' ? window.innerHeight : 900
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const containerRef = useRef<HTMLDivElement>(null);
  const theme = THEMES.find((t) => t.id === activeThemeId) || THEMES[0];

  // Auto-fetch if catalog ID passed but not loaded yet
  useEffect(() => {
    if (
      viewingCatalogId &&
      (!catalog ||
        (String(catalog.id) !== String(viewingCatalogId) &&
          catalog.uuid !== viewingCatalogId))
    ) {
      fetchPublicCatalog(viewingCatalogId);
    }
  }, [viewingCatalogId]);

  // Pre-render all pages asynchronously to high-DPI images for seamless 60fps 3D flipping
  useEffect(() => {
    if (!catalog || pages.length === 0) return;

    let isMounted = true;

    const renderAllPages = async () => {
      if (document.fonts) {
        try {
          await document.fonts.ready;
        } catch {}
      }

      for (let i = 0; i < pages.length; i++) {
        if (!isMounted) break;
        const page = pages[i];

        const hiddenEl = document.createElement('canvas');
        hiddenEl.width = PAGE_WIDTH;
        hiddenEl.height = PAGE_HEIGHT;
        const offCanvas = new Canvas(hiddenEl, {
          width: PAGE_WIDTH,
          height: PAGE_HEIGHT,
          selection: false,
          renderOnAddRemove: true,
          enableRetinaScaling: false
        });

        try {
          offCanvas.backgroundColor =
            page.backgroundColor ||
            (catalog as any)?.backgroundColor ||
            theme?.backgroundColor ||
            '#ffffff';

          const pageHasHeader =
            page.hasHeader !== undefined
              ? page.hasHeader
              : (catalog.hasHeader !== false && (catalog.headerElements?.length || 0) > 0 && page.type !== 'cover');
          const pageHasFooter =
            page.hasFooter !== undefined
              ? page.hasFooter
              : (catalog.hasFooter !== false && (catalog.footerElements?.length || 0) > 0 && page.type !== 'cover');
          const footerYOffset =
            PAGE_HEIGHT - (catalog.footerHeight ?? 38) - (catalog.marginBottom || 0);

          const dynamicContext = {
            pageNumber: i + 1,
            totalPages: pages.length,
            catalogName: catalog.name || 'Catalog',
            categoryName: getPageCategoryName(page, [], products, catalog),
            companyName: (catalog as any).company || 'V-TAC',
            year: new Date().getFullYear()
          };

          const allElements = [
            ...(page.elements || []).map((el) => ({
              ...el,
              zIndex: el.zIndex !== undefined ? el.zIndex : 0,
              text: el.type === 'text' ? resolveDynamicText(el.text, dynamicContext) : el.text
            })),
            ...(pageHasHeader
              ? (catalog.headerElements || []).map((el: any, idx: number) => ({
                  ...el,
                  zIndex: 1000 + (el.zIndex !== undefined ? el.zIndex : idx),
                  text: el.type === 'text' ? resolveDynamicText(el.text, dynamicContext) : el.text
                }))
              : []),
            ...(pageHasFooter
              ? (catalog.footerElements || []).map((el: any, idx: number) => ({
                  ...el,
                  zIndex: 2000 + (el.zIndex !== undefined ? el.zIndex : idx),
                  y: (el.y || 0) > 500 ? el.y : (el.y || 0) + footerYOffset,
                  text: el.type === 'text' ? resolveDynamicText(el.text, dynamicContext) : el.text
                }))
              : [])
          ];

          for (const el of allElements) {
            if (el.visible === false) continue;
            const obj = await elementToFabricObject(el, products, catalog);
            if (obj) {
              obj.selectable = false;
              obj.evented = false;
              (obj as any).zIndex = el.zIndex;
              offCanvas.add(obj);
            }
          }

          offCanvas._objects.sort(
            (a: any, b: any) => (a.get('zIndex') || 0) - (b.get('zIndex') || 0)
          );
          offCanvas.renderAll();
          await new Promise((r) => setTimeout(r, 60));
          offCanvas.renderAll();

          const dataUrl = offCanvas.toDataURL({
            multiplier: 2,
            format: 'jpeg',
            quality: 0.95
          });
          if (isMounted) {
            setPageImages((prev) => ({ ...prev, [i]: dataUrl }));
            setRenderedCount((prev) => prev + 1);
          }
        } catch (err) {
          console.warn(`Failed to render preview of Page ${i + 1}:`, err);
        } finally {
          offCanvas.dispose();
        }
      }
    };

    renderAllPages();

    return () => {
      isMounted = false;
    };
  }, [catalog?.id, pages.length]);

  // Total Spreads calculation:
  // Spread 0 = Cover (Page 1)
  // Spread 1 = Page 2 & 3, Spread 2 = Page 4 & 5 ...
  const totalSpreads = 1 + Math.ceil(Math.max(0, totalPages - 1) / 2);

  // Navigation handlers
  const flipNext = useCallback(() => {
    if (flipState?.isFlipping) return;

    if (viewMode === '3d') {
      if (currentSpread >= totalSpreads - 1) {
        setIsPlaying(false);
        return;
      }
      if (soundEnabled) playFlipSound();
      const targetSpread = currentSpread + 1;
      setFlipState({
        isFlipping: true,
        direction: 'next',
        fromSpread: currentSpread,
        toSpread: targetSpread
      });

      setTimeout(() => {
        setCurrentSpread(targetSpread);
        setFlipState(null);
      }, 700);
    } else {
      if (singlePageIndex >= totalPages - 1) {
        setIsPlaying(false);
        return;
      }
      if (soundEnabled) playFlipSound();
      setSinglePageIndex((prev) => Math.min(totalPages - 1, prev + 1));
    }
  }, [flipState, viewMode, currentSpread, totalSpreads, singlePageIndex, totalPages, soundEnabled]);

  const flipPrev = useCallback(() => {
    if (flipState?.isFlipping) return;

    if (viewMode === '3d') {
      if (currentSpread <= 0) return;
      if (soundEnabled) playFlipSound();
      const targetSpread = currentSpread - 1;
      setFlipState({
        isFlipping: true,
        direction: 'prev',
        fromSpread: currentSpread,
        toSpread: targetSpread
      });

      setTimeout(() => {
        setCurrentSpread(targetSpread);
        setFlipState(null);
      }, 700);
    } else {
      if (singlePageIndex <= 0) return;
      if (soundEnabled) playFlipSound();
      setSinglePageIndex((prev) => Math.max(0, prev - 1));
    }
  }, [flipState, viewMode, currentSpread, singlePageIndex, soundEnabled]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        flipNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        flipPrev();
      } else if (e.key === 'Escape') {
        setShowThumbDrawer(false);
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [flipNext, flipPrev]);

  // Auto-play interval
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      flipNext();
    }, 3800);
    return () => clearInterval(timer);
  }, [isPlaying, flipNext]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    showToast('Public flipbook link copied to clipboard!', 'success', 'Link Copied');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleDownloadPDF = async () => {
    if (!catalog) return;
    setIsDownloading(true);
    try {
      await exportCatalogToPDF(catalog, products);
      showToast('Catalog PDF exported successfully!', 'success', 'Export Complete');
    } catch (err: any) {
      console.error('PDF export failed:', err);
      showToast(err?.message || 'Failed to download PDF', 'error', 'Export Failed');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadImage = (format: 'png' | 'jpeg') => {
    const activeIdx =
      viewMode === '3d'
        ? currentSpread === 0
          ? 0
          : (currentSpread - 1) * 2 + 1
        : singlePageIndex;
    const dataUrl = pageImages[activeIdx];
    if (!dataUrl) return;

    const link = document.createElement('a');
    link.download = `${catalog?.name || 'Catalog'}_Page_${activeIdx + 1}.${format}`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const jumpToPage = (pageIdx: number) => {
    if (viewMode === '3d') {
      if (pageIdx === 0) {
        setCurrentSpread(0);
      } else {
        const targetSpread = 1 + Math.floor((pageIdx - 1) / 2);
        setCurrentSpread(Math.min(totalSpreads - 1, targetSpread));
      }
    } else {
      setSinglePageIndex(pageIdx);
    }
    setShowThumbDrawer(false);
    if (soundEnabled) playFlipSound();
  };

  const handleExit = () => {
    if (isAuthenticated) {
      setView('publish');
    } else {
      window.location.href = '/';
    }
  };

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || e.changedTouches.length === 0) return;
    const startX = touchStartRef.current.x;
    const startY = touchStartRef.current.y;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    touchStartRef.current = null;

    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.4) {
      if (deltaX < 0) {
        flipNext();
      } else {
        flipPrev();
      }
    }
  };

  // Dimensions & Dynamic Viewport Sizing (Responsive across all screen sizes)
  const isMobile = windowDimensions.width < 768;
  const headerH = isMobile ? 48 : 56;
  const dockH = isMobile ? 52 : 64;
  const marginH = isMobile ? 16 : 32;
  const marginW = isMobile ? 16 : 96;

  const pageAspect = PAGE_WIDTH / PAGE_HEIGHT; // ~0.707
  const availH = Math.max(240, windowDimensions.height - headerH - dockH - marginH);
  const availW = Math.max(280, windowDimensions.width - marginW);

  // Book takes up available vertical stage by default
  const maxBookH = isMobile ? Math.min(availH * 0.95, 600) : Math.min(availH * 0.88, 880);
  let baseH = Math.round(maxBookH);
  let baseW = Math.round(baseH * pageAspect);

  if (viewMode === '3d') {
    if (baseW * 2 > availW) {
      baseW = Math.floor(availW / 2);
      baseH = Math.round(baseW / pageAspect);
    }
    if (baseH > availH) {
      baseH = Math.floor(availH);
      baseW = Math.round(baseH * pageAspect);
    }
  } else if (viewMode === 'single') {
    if (baseW > availW) {
      baseW = Math.floor(availW);
      baseH = Math.round(baseW / pageAspect);
    }
    if (baseH > availH) {
      baseH = Math.floor(availH);
      baseW = Math.round(baseH * pageAspect);
    }
  }

  // Active spread page indices
  const leftPageIdx = currentSpread === 0 ? -1 : (currentSpread - 1) * 2 + 1;
  const rightPageIdx = currentSpread === 0 ? 0 : (currentSpread - 1) * 2 + 2;

  // Active spread label
  const spreadLabel =
    currentSpread === 0
      ? `Cover (Page 1 of ${totalPages})`
      : rightPageIdx < totalPages
      ? `Pages ${leftPageIdx + 1} - ${rightPageIdx + 1} of ${totalPages}`
      : `Page ${leftPageIdx + 1} of ${totalPages}`;

  // Precompute pages to display during flipping animation
  let underLeftPageIdx = leftPageIdx;
  let underRightPageIdx = rightPageIdx;
  let leafFrontPageIdx = -1;
  let leafBackPageIdx = -1;

  if (flipState?.isFlipping) {
    if (flipState.direction === 'next') {
      // Outgoing right page flips left
      const fromS = flipState.fromSpread;
      const toS = flipState.toSpread;
      underLeftPageIdx = fromS === 0 ? -1 : (fromS - 1) * 2 + 1;
      underRightPageIdx = toS === 0 ? 0 : (toS - 1) * 2 + 2;
      leafFrontPageIdx = fromS === 0 ? 0 : (fromS - 1) * 2 + 2;
      leafBackPageIdx = (toS - 1) * 2 + 1;
    } else {
      // Outgoing left page flips right
      const fromS = flipState.fromSpread;
      const toS = flipState.toSpread;
      underRightPageIdx = fromS === 0 ? 0 : (fromS - 1) * 2 + 2;
      underLeftPageIdx = toS === 0 ? -1 : (toS - 1) * 2 + 1;
      leafFrontPageIdx = (fromS - 1) * 2 + 1;
      leafBackPageIdx = toS === 0 ? 0 : (toS - 1) * 2 + 2;
    }
  }

  if (isLoading && !catalog) {
    return (
      <div className="h-screen w-screen bg-[#0d0d0d] text-white flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-10 h-10 text-[#0F3D3E] animate-spin mb-4" />
        <h2 className="text-lg font-bold font-space">Loading 3D Digital Flipbook...</h2>
        <p className="text-xs text-slate-400 mt-1">Preparing high-definition pages</p>
      </div>
    );
  }

  if (!catalog) {
    return (
      <div className="h-screen w-screen bg-[#0d0d0d] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-red-950/40 text-red-400 border border-red-800/40 rounded-full flex items-center justify-center mb-4">
          <Globe size={28} />
        </div>
        <h2 className="text-xl font-bold font-space text-white mb-2">Catalog not found</h2>
        <p className="text-sm text-[#888888] max-w-md mb-6">This publication link may be invalid or expired.</p>
        <button
          onClick={handleExit}
          className="px-5 py-2.5 bg-[#0F3D3E] hover:bg-[#155455] text-white rounded text-xs font-bold uppercase tracking-wider"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  // Render helper for single page canvas / image
  const renderPageContent = (idx: number, isCover = false, placeholderTitle = '') => {
    if (idx < 0) {
      // Inside front cover / hardcover binder
      return (
        <div className="w-full h-full bg-gradient-to-br from-[#12151b] via-[#1a1f29] to-[#0f1218] flex flex-col items-center justify-center text-center p-8 select-none border-r border-[#262d3a] relative overflow-hidden">
          {/* Subtle textured grid lines */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
          <div className="w-16 h-16 rounded-full border border-amber-500/30 bg-amber-950/20 flex items-center justify-center mb-4 text-amber-400/80 shadow-inner">
            <Sparkles size={24} />
          </div>
          <span className="text-[11px] font-mono tracking-widest text-amber-400/70 uppercase mb-1">
            Digital Publication
          </span>
          <h3 className="text-lg font-bold font-space text-white/90 max-w-[260px] truncate">
            {catalog.name}
          </h3>
          <p className="text-xs text-slate-400 mt-2 font-mono">
            {totalPages} Pages • {catalog.company || 'V-TAC'}
          </p>
          <div className="mt-6 flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 border border-white/10 text-[11px] text-slate-300">
            <span>Click Cover or ➔ to Begin</span>
          </div>
        </div>
      );
    }

    if (idx >= totalPages) {
      // End of publication back cover
      return (
        <div className="w-full h-full bg-gradient-to-br from-[#12151b] via-[#1a1f29] to-[#0f1218] flex flex-col items-center justify-center text-center p-8 select-none border-l border-[#262d3a] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
          <div className="w-16 h-16 rounded-full border border-slate-700 bg-slate-900/50 flex items-center justify-center mb-4 text-slate-400">
            <BookOpen size={24} />
          </div>
          <span className="text-[11px] font-mono tracking-widest text-slate-400 uppercase mb-1">
            End of Publication
          </span>
          <h3 className="text-base font-bold font-space text-white/90">
            {catalog.name}
          </h3>
          <p className="text-xs text-slate-500 mt-1">Thank you for viewing</p>
        </div>
      );
    }

    if (pageImages[idx]) {
      return (
        <img
          src={pageImages[idx]}
          alt={`Page ${idx + 1}`}
          className="w-full h-full object-cover select-none pointer-events-none"
        />
      );
    }

    return (
      <div className="w-full h-full bg-white flex flex-col items-center justify-center text-slate-500 p-6 text-center">
        <Loader2 className="animate-spin text-[#0F3D3E] mb-2" size={24} />
        <span className="text-xs font-bold font-mono">
          {placeholderTitle || `Loading Page ${idx + 1}...`}
        </span>
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className="h-screen w-screen bg-[#07080a] text-white flex flex-col overflow-hidden select-none font-sans"
    >
      {/* ── CSS Animations for Realistic 3D Flipping ─────────────────── */}
      <style>{`
        .leaf-turn-next {
          animation: animLeafTurnNext 700ms cubic-bezier(0.25, 1, 0.5, 1) forwards;
          transform-style: preserve-3d;
          will-change: transform, box-shadow;
        }
        @keyframes animLeafTurnNext {
          0% {
            transform: rotateY(0deg);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          }
          40% {
            box-shadow: -30px 35px 80px rgba(0,0,0,0.7);
          }
          50% {
            transform: rotateY(-90deg) scale(1.025);
            box-shadow: 0 45px 100px rgba(0,0,0,0.85);
          }
          60% {
            box-shadow: 30px 35px 80px rgba(0,0,0,0.7);
          }
          100% {
            transform: rotateY(-180deg);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          }
        }

        .leaf-turn-prev {
          animation: animLeafTurnPrev 700ms cubic-bezier(0.25, 1, 0.5, 1) forwards;
          transform-style: preserve-3d;
          will-change: transform, box-shadow;
        }
        @keyframes animLeafTurnPrev {
          0% {
            transform: rotateY(0deg);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          }
          40% {
            box-shadow: 30px 35px 80px rgba(0,0,0,0.7);
          }
          50% {
            transform: rotateY(90deg) scale(1.025);
            box-shadow: 0 45px 100px rgba(0,0,0,0.85);
          }
          60% {
            box-shadow: -30px 35px 80px rgba(0,0,0,0.7);
          }
          100% {
            transform: rotateY(180deg);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          }
        }

        .dynamic-shadow-next {
          animation: animShadowNext 700ms cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
        @keyframes animShadowNext {
          0% { opacity: 0; }
          50% { opacity: 0.65; }
          100% { opacity: 0; }
        }

        .dynamic-shadow-prev {
          animation: animShadowPrev 700ms cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
        @keyframes animShadowPrev {
          0% { opacity: 0; }
          50% { opacity: 0.65; }
          100% { opacity: 0; }
        }
      `}</style>

      {/* ── Top Bar ──────────────────────────────────────────────────────── */}
      <div className="h-12 sm:h-14 bg-[#111317] border-b border-[#1f242d] flex items-center justify-between px-2.5 sm:px-5 shrink-0 z-50">
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
          <button
            onClick={handleExit}
            className="px-2 sm:px-3 py-1 sm:py-1.5 bg-[#181c23] hover:bg-[#222731] border border-[#262c38] text-slate-300 hover:text-white rounded-[4px] text-[11px] sm:text-xs font-bold uppercase tracking-widest flex items-center gap-1 transition-all shrink-0"
          >
            <ArrowLeft size={13} /> <span className="hidden xs:inline">Exit</span>
          </button>
          <div className="h-4 sm:h-5 w-px bg-[#262c36] shrink-0" />
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <BookOpen size={15} className="text-[#3b82f6] shrink-0" />
            <h1 className="font-space font-bold text-xs sm:text-sm text-white truncate max-w-[80px] xs:max-w-[130px] sm:max-w-xs md:max-w-md">
              {catalog.name}
            </h1>
            <span className="hidden md:inline-block text-[9px] sm:text-[10px] font-bold uppercase tracking-widest px-1.5 sm:px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/50 shrink-0">
              3D Live
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Mode Switcher */}
          <div className="flex items-center bg-[#181c23] rounded-[4px] p-0.5 border border-[#262c38]">
            <button
              onClick={() => setViewMode('3d')}
              className={`px-1.5 sm:px-2.5 py-1 text-[11px] sm:text-xs font-bold rounded-[3px] transition-all flex items-center gap-1 ${
                viewMode === '3d' ? 'bg-[#0F3D3E] text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
              title="3D Flipbook Magazine View"
            >
              <BookOpen size={12} /> <span className="hidden xs:inline">3D Flip</span>
            </button>
            <button
              onClick={() => setViewMode('single')}
              className={`px-1.5 sm:px-2.5 py-1 text-[11px] sm:text-xs font-bold rounded-[3px] transition-all flex items-center gap-1 ${
                viewMode === 'single' ? 'bg-[#0F3D3E] text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
              title="Single Page Slide View"
            >
              <Layers size={12} /> <span className="hidden xs:inline">Single</span>
            </button>
          </div>

          {/* Sound FX Toggle */}
          <button
            onClick={() => setSoundEnabled(prev => !prev)}
            className={`p-1.5 sm:p-2 rounded-[4px] border transition-all ${
              soundEnabled ? 'bg-[#181c23] border-[#262c38] text-slate-300 hover:text-white' : 'bg-[#181c23] border-[#262c38] text-slate-500'
            }`}
            title={soundEnabled ? 'Mute page-flip sound' : 'Enable page-flip sound'}
          >
            {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>

          {/* Zoom Controls (Desktop Only) */}
          <div className="hidden md:flex items-center bg-[#181c23] rounded-[4px] p-0.5 border border-[#262c38]">
            <button
              onClick={() => setZoom(prev => Math.max(0.5, Math.round((prev - 0.1) * 10) / 10))}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-[#222731] rounded"
              title="Zoom Out"
            >
              <ZoomOut size={14} />
            </button>
            <span className="w-10 text-center text-xs font-mono font-bold text-slate-300">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(prev => Math.min(1.5, Math.round((prev + 0.1) * 10) / 10))}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-[#222731] rounded"
              title="Zoom In"
            >
              <ZoomIn size={14} />
            </button>
          </div>

          {/* Share Link */}
          <button
            onClick={handleCopyLink}
            className="p-1.5 sm:p-2 bg-[#181c23] hover:bg-[#222731] border border-[#262c38] text-slate-300 hover:text-white rounded-[4px] transition-all"
            title="Share Public Link"
          >
            {copiedLink ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
          </button>

          {/* Download Dropdown */}
          <div className="relative group">
            <button
              disabled={isDownloading}
              className="px-2 sm:px-3 py-1 sm:py-1.5 bg-[#0F3D3E] hover:bg-[#155455] border border-[#E2DCC8]/30 text-white rounded-[4px] text-[11px] sm:text-xs font-bold uppercase tracking-widest flex items-center gap-1 sm:gap-1.5 transition-all shadow-md"
            >
              {isDownloading ? <Loader2 size={12} className="animate-spin" /> : <FileDown size={13} />}
              <span>{isDownloading ? 'Saving...' : 'PDF'}</span>
            </button>
            <div className="absolute right-0 top-full mt-1.5 w-44 bg-[#14161a] border border-[#2b313b] rounded-[4px] shadow-2xl overflow-hidden hidden group-hover:block z-50">
              <button
                onClick={handleDownloadPDF}
                className="w-full text-left px-3.5 py-2.5 hover:bg-[#1c2026] flex items-center gap-2.5 text-xs font-semibold text-slate-200 hover:text-white"
              >
                <FileDown size={14} className="text-[#3b82f6]" /> Download PDF
              </button>
              <button
                onClick={() => handleDownloadImage('png')}
                className="w-full text-left px-3.5 py-2.5 hover:bg-[#1c2026] flex items-center gap-2.5 text-xs font-semibold text-slate-200 hover:text-white border-t border-[#22262e]"
              >
                <ImageIcon size={14} className="text-emerald-400" /> Page as PNG
              </button>
              <button
                onClick={() => handleDownloadImage('jpeg')}
                className="w-full text-left px-3.5 py-2.5 hover:bg-[#1c2026] flex items-center gap-2.5 text-xs font-semibold text-slate-200 hover:text-white"
              >
                <ImageIcon size={14} className="text-amber-400" /> Page as JPEG
              </button>
            </div>
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 sm:p-2 bg-[#181c23] hover:bg-[#222731] border border-[#262c38] text-slate-300 hover:text-white rounded-[4px] transition-all"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* ── Main Stage Area (3D Flipbook / Single Canvas with Touch Gestures) ── */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="flex-1 overflow-hidden relative flex items-center justify-center p-1.5 sm:p-6 bg-[#07080a] touch-pan-y"
      >
        {/* Soft Ambient Studio Lighting & Shadow */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(28,34,44,0.45)_0%,rgba(7,8,10,0.98)_75%)]" />

        {/* ── 3D FLIPBOOK MAGAZINE VIEW ───────────────────────────────── */}
        {viewMode === '3d' && (
          <div
            className="relative flex items-center justify-center transition-all duration-300"
            style={{
              perspective: '3500px',
              transform: `scale(${zoom})`,
              transformOrigin: 'center center'
            }}
          >
            {/* BOOK CASE / SPREAD CONTAINER */}
            <div
              className="relative flex items-center"
              style={{
                width: `${baseW * 2}px`,
                height: `${baseH}px`,
                transformStyle: 'preserve-3d',
                boxShadow:
                  '0 35px 80px -15px rgba(0,0,0,0.95), 0 15px 35px rgba(0,0,0,0.7), inset 0 0 1px 1px rgba(255,255,255,0.08)'
              }}
            >
              {/* ── UNDERLYING LEFT PAGE ─────────────────────────────── */}
              <div
                onClick={!flipState?.isFlipping && currentSpread > 0 ? flipPrev : undefined}
                className={`w-1/2 h-full relative overflow-hidden bg-white rounded-l-[4px] ${
                  currentSpread > 0 ? 'cursor-pointer group' : ''
                }`}
                style={{
                  boxShadow: 'inset -25px 0 35px -10px rgba(0,0,0,0.3)'
                }}
              >
                {renderPageContent(underLeftPageIdx)}

                {/* Spine Depth Inner Shadow (Right Edge of Left Page) */}
                <div className="absolute top-0 bottom-0 right-0 w-12 bg-gradient-to-l from-black/45 via-black/15 to-transparent pointer-events-none" />

                {/* Flip Prev Indicator on Hover */}
                {!flipState?.isFlipping && currentSpread > 0 && (
                  <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-start pl-4 pointer-events-none">
                    <div className="p-2.5 rounded-full bg-black/70 text-white backdrop-blur-md shadow-lg">
                      <ChevronLeft size={22} />
                    </div>
                  </div>
                )}
              </div>

              {/* ── 3D CENTER BOOK SPINE ─────────────────────────────── */}
              <div
                className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-4 z-20 pointer-events-none bg-gradient-to-r from-black/50 via-black/80 to-black/50"
                style={{
                  boxShadow: '0 0 12px rgba(0,0,0,0.9)'
                }}
              />

              {/* ── UNDERLYING RIGHT PAGE ────────────────────────────── */}
              <div
                onClick={
                  !flipState?.isFlipping && underRightPageIdx < totalPages
                    ? flipNext
                    : undefined
                }
                className={`w-1/2 h-full relative overflow-hidden bg-white rounded-r-[4px] ${
                  underRightPageIdx < totalPages ? 'cursor-pointer group' : ''
                }`}
                style={{
                  boxShadow: 'inset 25px 0 35px -10px rgba(0,0,0,0.3)'
                }}
              >
                {renderPageContent(underRightPageIdx, currentSpread === 0)}

                {/* Spine Depth Inner Shadow (Left Edge of Right Page) */}
                <div className="absolute top-0 bottom-0 left-0 w-12 bg-gradient-to-r from-black/45 via-black/15 to-transparent pointer-events-none" />

                {/* Flip Next Indicator on Hover */}
                {!flipState?.isFlipping && underRightPageIdx < totalPages && (
                  <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end pr-4 pointer-events-none">
                    <div className="p-2.5 rounded-full bg-black/70 text-white backdrop-blur-md shadow-lg">
                      <ChevronRight size={22} />
                    </div>
                  </div>
                )}
              </div>

              {/* ── DYNAMIC 3D FLIPPING LEAF (Realistic Dual-Face) ──── */}
              {flipState?.isFlipping && flipState.direction === 'next' && (
                <div
                  className="absolute top-0 right-0 w-1/2 h-full z-30 pointer-events-none leaf-turn-next"
                  style={{
                    transformOrigin: '0% 50%'
                  }}
                >
                  {/* FRONT FACE (Outgoing Right Page) */}
                  <div
                    className="absolute inset-0 w-full h-full overflow-hidden bg-white rounded-r-[4px]"
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'rotateY(0deg)'
                    }}
                  >
                    {renderPageContent(leafFrontPageIdx)}
                    {/* Realistic Page Curvature & Spine Lighting */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-white/10 to-black/20 pointer-events-none" />
                  </div>

                  {/* BACK FACE (Incoming Left Page) */}
                  <div
                    className="absolute inset-0 w-full h-full overflow-hidden bg-white rounded-l-[4px]"
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)'
                    }}
                  >
                    {renderPageContent(leafBackPageIdx)}
                    {/* Realistic Page Curvature & Spine Lighting */}
                    <div className="absolute inset-0 bg-gradient-to-l from-black/35 via-white/10 to-black/20 pointer-events-none" />
                  </div>
                </div>
              )}

              {flipState?.isFlipping && flipState.direction === 'prev' && (
                <div
                  className="absolute top-0 left-0 w-1/2 h-full z-30 pointer-events-none leaf-turn-prev"
                  style={{
                    transformOrigin: '100% 50%'
                  }}
                >
                  {/* FRONT FACE (Outgoing Left Page) */}
                  <div
                    className="absolute inset-0 w-full h-full overflow-hidden bg-white rounded-l-[4px]"
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'rotateY(0deg)'
                    }}
                  >
                    {renderPageContent(leafFrontPageIdx)}
                    <div className="absolute inset-0 bg-gradient-to-l from-black/35 via-white/10 to-black/20 pointer-events-none" />
                  </div>

                  {/* BACK FACE (Incoming Right Page) */}
                  <div
                    className="absolute inset-0 w-full h-full overflow-hidden bg-white rounded-r-[4px]"
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)'
                    }}
                  >
                    {renderPageContent(leafBackPageIdx)}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-white/10 to-black/20 pointer-events-none" />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── SINGLE PAGE SLIDE VIEW ──────────────────────────────────── */}
        {viewMode === 'single' && (
          <div
            className="relative shadow-2xl shadow-black/90 rounded-[4px] overflow-hidden bg-white transition-all duration-300 border border-[#22262e]"
            style={{
              width: `${baseW}px`,
              height: `${baseH}px`,
              transform: `scale(${zoom})`,
              transformOrigin: 'center center'
            }}
          >
            {renderPageContent(singlePageIndex)}
          </div>
        )}

        {/* Side Click Navigation Buttons on Stage */}
        <button
          onClick={flipPrev}
          disabled={viewMode === '3d' ? currentSpread === 0 : singlePageIndex === 0}
          className="absolute left-1.5 sm:left-6 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center bg-[#14161a]/85 hover:bg-[#1f242d] text-white rounded-full border border-[#2b313b] shadow-2xl backdrop-blur-md disabled:opacity-0 disabled:pointer-events-none transition-all hover:scale-110 active:scale-95 z-30"
          title="Previous Page (Left Arrow)"
        >
          <ChevronLeft size={isMobile ? 18 : 22} />
        </button>

        <button
          onClick={flipNext}
          disabled={
            viewMode === '3d'
              ? currentSpread >= totalSpreads - 1
              : singlePageIndex >= totalPages - 1
          }
          className="absolute right-1.5 sm:right-6 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center bg-[#14161a]/85 hover:bg-[#1f242d] text-white rounded-full border border-[#2b313b] shadow-2xl backdrop-blur-md disabled:opacity-0 disabled:pointer-events-none transition-all hover:scale-110 active:scale-95 z-30"
          title="Next Page (Right Arrow)"
        >
          <ChevronRight size={isMobile ? 18 : 22} />
        </button>
      </div>

      {/* ── THUMBNAILS FILMSTRIP DRAWER (Toggleable) ──────────────────── */}
      {showThumbDrawer && (
        <div className="h-32 sm:h-44 bg-[#14161a] border-t border-[#22262e] p-2.5 sm:p-4 shrink-0 overflow-x-auto flex items-center gap-2.5 sm:gap-4 z-40 animate-in slide-in-from-bottom duration-200">
          {pages.map((p, idx) => {
            const isSelected = viewMode === '3d'
              ? (currentSpread === 0 ? idx === 0 : (idx === leftPageIdx || idx === rightPageIdx))
              : idx === singlePageIndex;

            return (
              <div
                key={p.id || idx}
                onClick={() => jumpToPage(idx)}
                className={`relative shrink-0 flex flex-col items-center gap-1 sm:gap-1.5 cursor-pointer group transition-all ${
                  isSelected ? 'scale-105' : 'opacity-70 hover:opacity-100'
                }`}
              >
                <div
                  className={`w-14 h-20 sm:w-20 sm:h-28 rounded-[3px] overflow-hidden border transition-all shadow-md ${
                    isSelected ? 'ring-2 ring-[#0F3D3E] border-[#E2DCC8]' : 'border-[#2b313b] group-hover:border-slate-400'
                  }`}
                >
                  {pageImages[idx] ? (
                    <img src={pageImages[idx]} alt={`Page ${idx + 1}`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#1c2026] flex items-center justify-center text-[10px] text-slate-500 font-mono">
                      #{idx + 1}
                    </div>
                  )}
                </div>
                <span className={`text-[9px] sm:text-[10px] font-mono font-bold ${isSelected ? 'text-[#E2DCC8]' : 'text-slate-400'}`}>
                  {idx === 0 ? 'Cover' : `Page ${idx + 1}`}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Bottom Floating Dock Toolbar ─────────────────────────────── */}
      <div className="h-13 sm:h-16 bg-[#14161a] border-t border-[#22262e] flex items-center justify-between px-2.5 sm:px-6 shrink-0 z-40">
        {/* Left: Thumbnail Grid Drawer Trigger */}
        <button
          onClick={() => setShowThumbDrawer(prev => !prev)}
          className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-[4px] border text-[11px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1 sm:gap-1.5 transition-all ${
            showThumbDrawer
              ? 'bg-[#0F3D3E] text-white border-[#E2DCC8]/30 shadow-md'
              : 'bg-[#1c2026] text-slate-300 hover:text-white border-[#2b313b] hover:bg-[#282e37]'
          }`}
        >
          <Layers size={13} />
          <span className="hidden xs:inline">Pages</span>
          <span>({totalPages})</span>
        </button>

        {/* Center: Flip Controls & Current Spread Indicator */}
        <div className="flex items-center gap-1.5 sm:gap-4">
          <button
            onClick={flipPrev}
            disabled={viewMode === '3d' ? currentSpread === 0 : singlePageIndex === 0}
            className="p-1.5 sm:p-2 bg-[#1c2026] hover:bg-[#282e37] border border-[#2b313b] rounded-full text-white disabled:opacity-20 disabled:hover:bg-[#1c2026] transition-all"
            title="Previous"
          >
            <ChevronLeft size={14} className="sm:w-4 sm:h-4" />
          </button>

          <div className="text-center min-w-[95px] sm:min-w-[170px]">
            <span className="text-white font-mono font-bold text-[10px] sm:text-xs">
              {spreadLabel}
            </span>
          </div>

          <button
            onClick={flipNext}
            disabled={viewMode === '3d' ? currentSpread >= totalSpreads - 1 : singlePageIndex >= totalPages - 1}
            className="p-1.5 sm:p-2 bg-[#1c2026] hover:bg-[#282e37] border border-[#2b313b] rounded-full text-white disabled:opacity-20 disabled:hover:bg-[#1c2026] transition-all"
            title="Next"
          >
            <ChevronRight size={14} className="sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Right: Auto-Play Slideshow & Reset */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setIsPlaying(prev => !prev)}
            className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-[4px] border text-[11px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1 sm:gap-1.5 transition-all ${
              isPlaying
                ? 'bg-amber-600/90 text-white border-amber-500 shadow-md animate-pulse'
                : 'bg-[#1c2026] text-slate-300 hover:text-white border-[#2b313b] hover:bg-[#282e37]'
            }`}
            title={isPlaying ? 'Pause Auto-Play' : 'Start Auto-Flip Slideshow'}
          >
            {isPlaying ? <Pause size={12} /> : <Play size={12} />}
            <span className="hidden sm:inline">{isPlaying ? 'Pause' : 'Auto Play'}</span>
          </button>

          <button
            onClick={() => {
              setCurrentSpread(0);
              setSinglePageIndex(0);
              if (soundEnabled) playFlipSound();
            }}
            className="p-1.5 sm:p-2 bg-[#1c2026] hover:bg-[#282e37] border border-[#2b313b] text-slate-300 hover:text-white rounded-[4px] transition-all"
            title="Restart from Cover"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PublicViewer;
