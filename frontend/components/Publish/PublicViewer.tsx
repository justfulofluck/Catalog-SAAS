import React, { useRef, useState, useEffect } from 'react';
import { ArrowLeft, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, FileDown, Image as ImageIcon } from 'lucide-react';
import { Canvas } from 'fabric';
import { useStore } from '../../store/useStore';
import { PAGE_WIDTH, PAGE_HEIGHT, THEMES } from '../../constants';
import { elementToFabricObject } from '../Editor/fabricRenderer';
import { jsPDF } from 'jspdf';

const PublicViewer: React.FC = () => {
  const { savedCatalogs, viewingCatalogId, setView, activeThemeId } = useStore();
  const catalog = savedCatalogs.find(c => c.id === viewingCatalogId);

  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [zoom, setZoom] = useState(0.8);
  const [isDownloading, setIsDownloading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);

  if (!catalog) return <div className="p-10 text-center text-white bg-[#100F0F] min-h-screen">Catalog not found.</div>;

  const theme = THEMES.find(t => t.id === activeThemeId) || THEMES[0];
  const currentPage = catalog.pages[currentPageIndex];
  const { products } = useStore.getState();
  const isLandscape = currentPage?.orientation === 'landscape';
  const pageW = isLandscape ? PAGE_HEIGHT : PAGE_WIDTH;
  const pageH = isLandscape ? PAGE_WIDTH : PAGE_HEIGHT;

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = new Canvas(canvasRef.current, {
      width: pageW,
      height: pageH,
      selection: false,
      interactive: false,
    });
    fabricRef.current = canvas;

    const render = async () => {
      canvas.clear();
      canvas.backgroundColor = catalog.backgroundColor || '#ffffff';

      const footerYOffset = pageH - (catalog.footerHeight ?? 38) - (catalog.marginBottom || 0);
      const allElements = [
        ...(catalog.headerElements || []),
        ...currentPage.elements,
        ...(catalog.footerElements || []).map(el => ({
          ...el,
          y: (el.y || 0) + footerYOffset,
          text: el.type === 'text' && el.text?.includes('{{page}}')
            ? el.text.replace(/\{\{page\}\}/gi, String(currentPageIndex + 1))
            : el.text,
        })),
      ];

      const objects = await Promise.all(
        allElements
          .filter(el => el.visible !== false)
          .map(el => elementToFabricObject(el, products)),
      );

      objects.filter(Boolean).forEach((obj: any, i: number) => {
        obj.set('zIndex', allElements[i]?.zIndex || 0);
        obj.set({ selectable: false, evented: false });
        canvas.add(obj);
      });

      canvas._objects.sort((a: any, b: any) => (a.get('zIndex') || 0) - (b.get('zIndex') || 0));
      canvas.renderAll();
    };

    render();

    return () => { canvas.dispose(); fabricRef.current = null; };
  }, [currentPageIndex, catalog]);

  const handleDownload = async (format: 'pdf' | 'png' | 'jpeg') => {
    setIsDownloading(true);
    const canvas = fabricRef.current;
    if (!canvas) { setIsDownloading(false); return; }

    if (format === 'pdf') {
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: [PAGE_WIDTH, PAGE_HEIGHT] });
      const dataUrl = canvas.toDataURL({ multiplier: 2, format: 'jpeg' });
      pdf.addImage(dataUrl, 'JPEG', 0, 0, PAGE_WIDTH, PAGE_HEIGHT);
      pdf.save(`${catalog!.name}_Page_${currentPageIndex + 1}.pdf`);
    } else {
      const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
      const dataUrl = canvas.toDataURL({ multiplier: 2, format });
      const link = document.createElement('a');
      link.download = `${catalog!.name}_Page_${currentPageIndex + 1}.${format}`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    setTimeout(() => setIsDownloading(false), 500);
  };

  return (
    <div className="h-screen w-screen bg-[#100F0F] text-white flex flex-col overflow-hidden">
      {/* Viewer Header */}
      <div className="h-16 bg-[#161616] border-b border-[#262626] flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => setView('publish')} className="text-[#888888] hover:text-[#E2DCC8] transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
            <ArrowLeft size={16} /> Exit
          </button>
          <div className="h-6 w-px bg-[#262626]" />
          <h1 className="font-space text-white font-bold text-lg tracking-tight">{catalog!.name}</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-[#1c1c1c] rounded-[4px] p-1 border border-[#262626]">
            <button onClick={() => setZoom(Math.max(0.4, zoom - 0.1))} className="p-2 text-[#888888] hover:text-white hover:bg-[#262626] rounded-[4px] transition-all"><ZoomOut size={16} /></button>
            <span className="w-12 text-center text-xs font-mono font-bold text-white">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(Math.min(2, zoom + 0.1))} className="p-2 text-[#888888] hover:text-white hover:bg-[#262626] rounded-[4px] transition-all"><ZoomIn size={16} /></button>
          </div>

          <div className="group relative">
            <button className="px-4 py-2 bg-[#0F3D3E] hover:bg-[#155455] border border-[#E2DCC8]/30 text-white rounded-[4px] text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-[#0F3D3E]/20">
              {isDownloading ? 'Saving...' : 'Download'} <ChevronLeft size={12} className="-rotate-90" />
            </button>
            <div className="absolute top-full right-0 mt-2 w-48 bg-[#161616] border border-[#262626] rounded-[4px] shadow-2xl overflow-hidden hidden group-hover:block animate-in fade-in zoom-in-95 duration-200 min-w-[160px]">
              <button onClick={() => handleDownload('pdf')} className="w-full text-left px-4 py-3 hover:bg-[#1c1c1c] flex items-center gap-3 text-white hover:text-[#E2DCC8] transition-colors">
                <FileDown size={16} /> <span className="text-xs font-bold">Export as PDF</span>
              </button>
              <button onClick={() => handleDownload('png')} className="w-full text-left px-4 py-3 hover:bg-[#1c1c1c] flex items-center gap-3 text-white hover:text-[#E2DCC8] transition-colors">
                <ImageIcon size={16} /> <span className="text-xs font-bold">Export as PNG</span>
              </button>
              <button onClick={() => handleDownload('jpeg')} className="w-full text-left px-4 py-3 hover:bg-[#1c1c1c] flex items-center gap-3 text-white hover:text-[#E2DCC8] transition-colors">
                <ImageIcon size={16} /> <span className="text-xs font-bold">Export as JPEG</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 overflow-auto flex justify-center p-8 relative bg-[#100F0F]">
        <div className="relative shadow-2xl shadow-black/80 transition-transform duration-200 ease-out origin-top border border-[#262626]" style={{ width: pageW * zoom, height: pageH * zoom }}>
          <canvas ref={canvasRef} width={pageW} height={pageH} style={{ width: pageW * zoom, height: pageH * zoom, transform: `scale(${zoom})`, transformOrigin: 'top left' }} />
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="h-16 bg-[#161616] border-t border-[#262626] flex items-center justify-center gap-8 shrink-0 relative z-50">
        <button
          onClick={() => setCurrentPageIndex(Math.max(0, currentPageIndex - 1))}
          disabled={currentPageIndex === 0}
          className="p-3 bg-[#1c1c1c] hover:bg-[#262626] border border-[#262626] rounded-full text-white disabled:opacity-30 disabled:hover:bg-[#1c1c1c] transition-all"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="text-white font-mono font-bold text-sm">
          Page {currentPageIndex + 1} <span className="text-[#666666] mx-2">/</span> {catalog!.pages.length}
        </span>
        <button
          onClick={() => setCurrentPageIndex(Math.min(catalog!.pages.length - 1, currentPageIndex + 1))}
          disabled={currentPageIndex === catalog!.pages.length - 1}
          className="p-3 bg-[#1c1c1c] hover:bg-[#262626] border border-[#262626] rounded-full text-white disabled:opacity-30 disabled:hover:bg-[#1c1c1c] transition-all"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default PublicViewer;
