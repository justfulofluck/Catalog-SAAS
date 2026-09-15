import React, { useRef, useState, useEffect } from 'react';
import { ArrowLeft, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, FileDown, Image as ImageIcon, Globe, Loader2 } from 'lucide-react';
import { Canvas } from 'fabric';
import { useStore } from '../../store/useStore';
import { PAGE_WIDTH, PAGE_HEIGHT, THEMES } from '../../constants';
import { elementToFabricObject } from '../Editor/fabricRenderer';
import { jsPDF } from 'jspdf';
import 'svg2pdf.js';
import { resolveDynamicText, getPageCategoryName } from '../../utils/dynamicTags';

const PublicViewer: React.FC = () => {
  const {
    savedCatalogs,
    viewingCatalogId,
    publicCatalog,
    setView,
    activeThemeId,
    fetchPublicCatalog,
    isLoading,
    isAuthenticated,
  } = useStore();

  const catalog =
    publicCatalog ||
    savedCatalogs.find(
      (c) =>
        String(c.id) === String(viewingCatalogId) ||
        (c.uuid && String(c.uuid) === String(viewingCatalogId))
    );

  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [zoom, setZoom] = useState(0.8);
  const [isDownloading, setIsDownloading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);

  const pages = catalog?.pages || [];
  const safePageIndex = Math.min(Math.max(0, currentPageIndex), Math.max(0, pages.length - 1));
  const currentPage = pages[safePageIndex];
  const { products } = useStore.getState();
  const theme = THEMES.find((t) => t.id === activeThemeId) || THEMES[0];
  const isLandscape = currentPage?.orientation === 'landscape';
  const effectiveWidth = isLandscape ? PAGE_HEIGHT : PAGE_WIDTH;
  const effectiveHeight = isLandscape ? PAGE_WIDTH : PAGE_HEIGHT;

  // 1. Auto-fetch hook (always runs at top)
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

  // 2. Fabric canvas render hook (always runs at top)
  useEffect(() => {
    if (!canvasRef.current || !catalog || !currentPage) return;
    const canvas = new Canvas(canvasRef.current, {
      width: effectiveWidth,
      height: effectiveHeight,
      selection: false,
      renderOnAddRemove: true,
    });
    fabricRef.current = canvas;

    const render = async () => {
      canvas.clear();
      canvas.backgroundColor = currentPage?.backgroundColor || (catalog as any)?.backgroundColor || theme?.backgroundColor || '#ffffff';

      const pageHasHeader =
        currentPage.hasHeader !== undefined
          ? currentPage.hasHeader
          : catalog.hasHeader && currentPage.type !== 'cover';
      const pageHasFooter =
        currentPage.hasFooter !== undefined
          ? currentPage.hasFooter
          : catalog.hasFooter && currentPage.type !== 'cover';
      const footerYOffset =
        effectiveHeight - (catalog.footerHeight ?? 38) - (catalog.marginBottom || 0);

      const dynamicContext = {
        pageNumber: safePageIndex + 1,
        totalPages: pages.length,
        catalogName: catalog.name || 'Catalog',
        categoryName: getPageCategoryName(currentPage, [], products, catalog),
        companyName: (catalog as any).company || 'V-TAC',
        year: new Date().getFullYear(),
      };

      const allElements = [
        ...(currentPage.elements || []).map((el) => ({
          ...el,
          zIndex: el.zIndex !== undefined ? el.zIndex : 0,
          text: el.type === 'text' ? resolveDynamicText(el.text, dynamicContext) : el.text,
        })),
        ...(pageHasHeader
          ? (catalog.headerElements || []).map((el: any, idx: number) => ({
              ...el,
              zIndex: 1000 + (el.zIndex !== undefined ? el.zIndex : idx),
              text: el.type === 'text' ? resolveDynamicText(el.text, dynamicContext) : el.text,
            }))
          : []),
        ...(pageHasFooter
          ? (catalog.footerElements || []).map((el: any, idx: number) => ({
              ...el,
              zIndex: 2000 + (el.zIndex !== undefined ? el.zIndex : idx),
              y: (el.y || 0) > 500 ? el.y : (el.y || 0) + footerYOffset,
              text: el.type === 'text' ? resolveDynamicText(el.text, dynamicContext) : el.text,
            }))
          : []),
      ];

      for (const el of allElements) {
        if (el.visible === false) continue;
        const obj = await elementToFabricObject(el, products, catalog);
        if (obj) {
          obj.selectable = false;
          obj.evented = false;
          (obj as any).zIndex = el.zIndex;
          canvas.add(obj);
        }
      }

      canvas._objects.sort(
        (a: any, b: any) => (a.get('zIndex') || 0) - (b.get('zIndex') || 0)
      );
      canvas.renderAll();
    };

    render();

    return () => {
      canvas.dispose();
      fabricRef.current = null;
    };
  }, [safePageIndex, catalog, currentPage, effectiveWidth, effectiveHeight]);

  const handleDownload = async (format: 'pdf' | 'png' | 'jpeg') => {
    if (!catalog) return;
    setIsDownloading(true);
    const canvas = fabricRef.current;
    if (!canvas) {
      setIsDownloading(false);
      return;
    }

    if (format === 'pdf') {
      const pdf = new jsPDF({
        orientation: isLandscape ? 'landscape' : 'portrait',
        unit: 'pt',
        format: [effectiveWidth, effectiveHeight],
      });

      let renderedVector = false;
      let tempContainer: HTMLDivElement | null = null;
      try {
        const svgString = canvas.toSVG({
          width: `${effectiveWidth}pt`,
          height: `${effectiveHeight}pt`,
          viewBox: { x: 0, y: 0, width: effectiveWidth, height: effectiveHeight },
        });

        if (svgString && svgString.includes('<svg')) {
          tempContainer = document.createElement('div');
          tempContainer.style.position = 'fixed';
          tempContainer.style.left = '-99999px';
          tempContainer.style.top = '-99999px';
          tempContainer.style.opacity = '0';
          tempContainer.style.pointerEvents = 'none';
          tempContainer.innerHTML = svgString;
          document.body.appendChild(tempContainer);

          const svgEl = tempContainer.querySelector('svg');
          if (svgEl) {
            await pdf.svg(svgEl, { x: 0, y: 0, width: effectiveWidth, height: effectiveHeight });
            renderedVector = true;
          }
        }
      } catch (vectorErr) {
        console.warn('Vector PDF export failed, falling back to raster:', vectorErr);
      } finally {
        if (tempContainer && document.body.contains(tempContainer)) {
          document.body.removeChild(tempContainer);
        }
      }

      if (!renderedVector) {
        const dataUrl = canvas.toDataURL({ multiplier: 2, format: 'jpeg' });
        pdf.addImage(dataUrl, 'JPEG', 0, 0, effectiveWidth, effectiveHeight);
      }

      pdf.save(`${catalog.name}_Page_${safePageIndex + 1}.pdf`);
    } else {
      const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
      const dataUrl = canvas.toDataURL({ multiplier: 2, format });
      const link = document.createElement('a');
      link.download = `${catalog.name}_Page_${safePageIndex + 1}.${format}`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    setTimeout(() => setIsDownloading(false), 500);
  };

  const handleExit = () => {
    if (isAuthenticated) {
      setView('publish');
    } else {
      window.location.href = '/';
    }
  };

  // --- Conditional UI Renderings (AFTER all hooks) ---

  if (isLoading && !catalog) {
    return (
      <div className="h-screen w-screen bg-[#100F0F] text-white flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-10 h-10 text-[#E2DCC8] animate-spin mb-4" />
        <h2 className="text-base font-semibold text-white tracking-wide font-space">Loading Catalog...</h2>
        <p className="text-xs text-[#888888] mt-1">Please wait while the pages are being fetched.</p>
      </div>
    );
  }

  if (!catalog) {
    return (
      <div className="h-screen w-screen bg-[#100F0F] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-red-950/40 text-red-400 border border-red-800/40 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-red-950/20">
          <Globe size={28} />
        </div>
        <h2 className="text-xl font-bold font-space text-white mb-2">Catalog not found</h2>
        <p className="text-sm text-[#888888] max-w-md mb-6">
          This catalog may not be published yet or the link is invalid.
        </p>
        {isAuthenticated ? (
          <button
            onClick={() => setView('publish')}
            className="px-5 py-2.5 bg-[#0F3D3E] hover:bg-[#155455] border border-[#E2DCC8]/30 text-white rounded text-xs font-bold uppercase tracking-wider transition-all"
          >
            Back to Dashboard
          </button>
        ) : (
          <a
            href="/"
            className="px-5 py-2.5 bg-[#1c1c1c] hover:bg-[#262626] border border-[#262626] text-white rounded text-xs font-bold uppercase tracking-wider transition-all"
          >
            Go to Home
          </a>
        )}
      </div>
    );
  }

  if (pages.length === 0) {
    return (
      <div className="h-screen w-screen bg-[#100F0F] text-white flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-lg font-bold text-white mb-2">This catalog has no pages.</h2>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#100F0F] text-white flex flex-col overflow-hidden">
      {/* Viewer Header */}
      <div className="h-16 bg-[#161616] border-b border-[#262626] flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={handleExit}
            className="text-[#888888] hover:text-[#E2DCC8] transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
          >
            <ArrowLeft size={16} /> Exit
          </button>
          <div className="h-6 w-px bg-[#262626]" />
          <h1 className="font-space text-white font-bold text-lg tracking-tight">
            {catalog.name}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-[#1c1c1c] rounded-[4px] p-1 border border-[#262626]">
            <button
              onClick={() => setZoom(Math.max(0.4, zoom - 0.1))}
              className="p-2 text-[#888888] hover:text-white hover:bg-[#262626] rounded-[4px] transition-all"
              title="Zoom out"
            >
              <ZoomOut size={16} />
            </button>
            <span className="w-12 text-center text-xs font-mono font-bold text-white">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(Math.min(2, zoom + 0.1))}
              className="p-2 text-[#888888] hover:text-white hover:bg-[#262626] rounded-[4px] transition-all"
              title="Zoom in"
            >
              <ZoomIn size={16} />
            </button>
          </div>

          <div className="group relative">
            <button className="px-4 py-2 bg-[#0F3D3E] hover:bg-[#155455] border border-[#E2DCC8]/30 text-white rounded-[4px] text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-[#0F3D3E]/20">
              {isDownloading ? 'Saving...' : 'Download'}{' '}
              <ChevronLeft size={12} className="-rotate-90" />
            </button>
            <div className="absolute top-full right-0 mt-2 w-48 bg-[#161616] border border-[#262626] rounded-[4px] shadow-2xl overflow-hidden hidden group-hover:block animate-in fade-in zoom-in-95 duration-200 min-w-[160px]">
              <button
                onClick={() => handleDownload('pdf')}
                className="w-full text-left px-4 py-3 hover:bg-[#1c1c1c] flex items-center gap-3 text-white hover:text-[#E2DCC8] transition-colors"
              >
                <FileDown size={16} /> <span className="text-xs font-bold">Export as PDF</span>
              </button>
              <button
                onClick={() => handleDownload('png')}
                className="w-full text-left px-4 py-3 hover:bg-[#1c1c1c] flex items-center gap-3 text-white hover:text-[#E2DCC8] transition-colors"
              >
                <ImageIcon size={16} /> <span className="text-xs font-bold">Export as PNG</span>
              </button>
              <button
                onClick={() => handleDownload('jpeg')}
                className="w-full text-left px-4 py-3 hover:bg-[#1c1c1c] flex items-center gap-3 text-white hover:text-[#E2DCC8] transition-colors"
              >
                <ImageIcon size={16} /> <span className="text-xs font-bold">Export as JPEG</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 overflow-auto flex justify-center p-8 relative bg-[#100F0F]">
        <div
          key={safePageIndex}
          className="relative shadow-2xl shadow-black/80 transition-all duration-300 ease-out origin-center border border-[#262626] animate-in fade-in zoom-in-[0.98]"
          style={{ width: effectiveWidth * zoom, height: effectiveHeight * zoom }}
        >
          <canvas
            ref={canvasRef}
            width={effectiveWidth}
            height={effectiveHeight}
            style={{
              width: effectiveWidth * zoom,
              height: effectiveHeight * zoom,
              transform: `scale(${zoom})`,
              transformOrigin: 'top left',
            }}
          />
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="h-16 bg-[#161616] border-t border-[#262626] flex items-center justify-center gap-8 shrink-0 relative z-50">
        <button
          onClick={() => setCurrentPageIndex(Math.max(0, safePageIndex - 1))}
          disabled={safePageIndex === 0}
          className="p-3 bg-[#1c1c1c] hover:bg-[#262626] border border-[#262626] rounded-full text-white disabled:opacity-30 disabled:hover:bg-[#1c1c1c] transition-all"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="text-white font-mono font-bold text-sm">
          Page {safePageIndex + 1} <span className="text-[#666666] mx-2">/</span>{' '}
          {pages.length}
        </span>
        <button
          onClick={() => setCurrentPageIndex(Math.min(pages.length - 1, safePageIndex + 1))}
          disabled={safePageIndex === pages.length - 1}
          className="p-3 bg-[#1c1c1c] hover:bg-[#262626] border border-[#262626] rounded-full text-white disabled:opacity-30 disabled:hover:bg-[#1c1c1c] transition-all"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default PublicViewer;
