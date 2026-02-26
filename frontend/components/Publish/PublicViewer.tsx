
import React, { useRef, useState } from 'react';
import { Download, Share2, ArrowLeft, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, FileDown, Image as ImageIcon, Loader2, X } from 'lucide-react';
import { Stage, Layer, Rect, Group, Line, Image as KonvaImage, Text } from 'react-konva';
import useImage from 'use-image';
import { useStore } from '../../store/useStore';
import { PAGE_WIDTH, PAGE_HEIGHT, THEMES, HEADER_FOOTER_HEIGHT } from '../../constants';
import CanvasElementComponent from '../Editor/CanvasElement';
import { jsPDF } from 'jspdf';

// Reusing CanvasHeader for consistent rendering
const CanvasHeader: React.FC<{ catalog: any; theme: any; pageIdx: number }> = ({ catalog, theme, pageIdx }) => {
  const height = catalog.headerHeight ?? HEADER_FOOTER_HEIGHT;

  return (
    <Group>
      {/* Background for Header Area */}
      <Rect width={PAGE_WIDTH} height={height} fill={catalog.backgroundColor || theme.backgroundColor} />
      <Line points={[40, height, PAGE_WIDTH - 40, height]} stroke="#f1f5f9" strokeWidth={1} />

      {/* Render Master Header Elements */}
      {catalog.headerElements?.map((el: any) => (
        <CanvasElementComponent
          key={`header-master-${el.id}`}
          element={el}
          isSelected={false}
          onSelect={() => { }}
          onChange={() => { }}
        />
      ))}
    </Group>
  );
};

const PublicViewer: React.FC = () => {
  const { savedCatalogs, viewingCatalogId, setView, activeThemeId, fetchPublicCatalog, isLoading, error, catalog: currentCatalog } = useStore();

  // First try to find it in savedCatalogs (if we are the owner)
  // If not found, it might be a public UUID from a shared link
  const catalog = savedCatalogs.find(c => c.id === viewingCatalogId || c.uuid === viewingCatalogId) || currentCatalog;

  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [zoom, setZoom] = useState(0.8);
  const [isDownloading, setIsDownloading] = useState(false);
  const stageRef = useRef<any>(null);

  React.useEffect(() => {
    // If we have an ID/UUID but no catalog data, fetch it
    if (viewingCatalogId && (!catalog || (catalog.id !== viewingCatalogId && catalog.uuid !== viewingCatalogId))) {
      fetchPublicCatalog(viewingCatalogId);
    }
  }, [viewingCatalogId, catalog, fetchPublicCatalog]);

  if (isLoading) return (
    <div className="h-screen w-screen bg-slate-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-white/60 font-black text-xs uppercase tracking-widest">Loading Catalog...</p>
      </div>
    </div>
  );

  if (error || !catalog) return (
    <div className="h-screen w-screen bg-slate-900 flex items-center justify-center p-10 text-center">
      <div className="max-w-md space-y-6">
        <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center mx-auto">
          <X size={40} />
        </div>
        <h1 className="text-2xl font-black text-white">Oops! Catalog Not Visible</h1>
        <p className="text-slate-400 font-medium">{error || "This catalog might be private or doesn't exist anymore."}</p>
        <button onClick={() => setView('dashboard')} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all">Back to Dashboard</button>
      </div>
    </div>
  );

  const theme = THEMES.find(t => t.id === activeThemeId) || THEMES[0];
  const currentPage = catalog.pages[currentPageIndex];

  const handleDownload = async (format: 'pdf' | 'png' | 'jpeg') => {
    setIsDownloading(true);
    const stage = stageRef.current;

    if (stage) {
      if (format === 'pdf') {
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: [PAGE_WIDTH, PAGE_HEIGHT] });
        // NOTE: In a real implementation, we would need to iterate through all pages and render them one by one.
        // Since we only display one page at a time here, this simple export only does the current page.
        // For a full multi-page export in a viewer, we'd need to programmatically render each page to a hidden canvas.
        // For this demo, we'll export the *current view* or simulate multi-page if possible. 
        // Given constraints, let's just export current page for visual proof or simulate full download.

        const dataUrl = stage.toDataURL({ pixelRatio: 2, mimeType: 'image/jpeg' });
        pdf.addImage(dataUrl, 'JPEG', 0, 0, PAGE_WIDTH, PAGE_HEIGHT);
        pdf.save(`${catalog.name}_Page_${currentPageIndex + 1}.pdf`);
      } else {
        const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
        const dataUrl = stage.toDataURL({ pixelRatio: 2, mimeType });
        const link = document.createElement('a');
        link.download = `${catalog.name}_Page_${currentPageIndex + 1}.${format}`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
    setTimeout(() => setIsDownloading(false), 500);
  };

  return (
    <div className="h-screen w-screen bg-slate-900 flex flex-col overflow-hidden">
      {/* Viewer Header */}
      <div className="h-16 bg-white/5 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => setView('publish')} className="text-white/60 hover:text-white transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
            <ArrowLeft size={16} /> Exit
          </button>
          <div className="h-6 w-px bg-white/10" />
          <h1 className="text-white font-black text-lg tracking-tight">{catalog.name}</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-black/40 rounded-lg p-1 border border-white/10">
            <button onClick={() => setZoom(Math.max(0.4, zoom - 0.1))} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-md transition-all"><ZoomOut size={16} /></button>
            <span className="w-12 text-center text-xs font-mono font-bold text-white">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(Math.min(2, zoom + 0.1))} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-md transition-all"><ZoomIn size={16} /></button>
          </div>

          <div className="group relative">
            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20">
              {isDownloading ? 'Saving...' : 'Download'} <ChevronLeft size={12} className="-rotate-90" />
            </button>
            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl overflow-hidden hidden group-hover:block animate-in fade-in zoom-in-95 duration-200 min-w-[160px]">
              <button onClick={() => handleDownload('pdf')} className="w-full text-left px-4 py-3 hover:bg-indigo-50 flex items-center gap-3 text-slate-700 hover:text-indigo-600 transition-colors">
                <FileDown size={16} /> <span className="text-xs font-bold">Export as PDF</span>
              </button>
              <button onClick={() => handleDownload('png')} className="w-full text-left px-4 py-3 hover:bg-indigo-50 flex items-center gap-3 text-slate-700 hover:text-indigo-600 transition-colors">
                <ImageIcon size={16} /> <span className="text-xs font-bold">Export as PNG</span>
              </button>
              <button onClick={() => handleDownload('jpeg')} className="w-full text-left px-4 py-3 hover:bg-indigo-50 flex items-center gap-3 text-slate-700 hover:text-indigo-600 transition-colors">
                <ImageIcon size={16} /> <span className="text-xs font-bold">Export as JPEG</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 overflow-auto flex justify-center p-8 relative bg-slate-900/50">
        <div className="relative shadow-2xl shadow-black/50 transition-transform duration-200 ease-out origin-top" style={{ width: PAGE_WIDTH * zoom, height: PAGE_HEIGHT * zoom }}>
          <Stage
            ref={stageRef}
            width={PAGE_WIDTH * zoom}
            height={PAGE_HEIGHT * zoom}
            scaleX={zoom}
            scaleY={zoom}
          >
            <Layer>
              <Rect width={PAGE_WIDTH} height={PAGE_HEIGHT} fill={catalog.backgroundColor || '#ffffff'} />
              {/* Header Render */}
              <CanvasHeader catalog={catalog} theme={theme} pageIdx={currentPageIndex} />
              <Group>
                {currentPage.elements.map((el) => (
                  <CanvasElementComponent
                    key={el.id}
                    element={el}
                    isSelected={false}
                    onSelect={() => { }}
                    onChange={() => { }}
                  />
                ))}
              </Group>

              {/* Footer Render */}
              <Group y={PAGE_HEIGHT - (catalog.footerHeight ?? 38)}>
                <Rect width={PAGE_WIDTH} height={catalog.footerHeight ?? 38} fill={catalog.backgroundColor || '#ffffff'} />
                <Line points={[40, 0, PAGE_WIDTH - 40, 0]} stroke="#f1f5f9" strokeWidth={1} />

                {catalog.footerElements?.map((el: any) => {
                  const elementWithPage = el.type === 'text' && el.text?.toLowerCase().includes('{{page}}')
                    ? { ...el, text: el.text.replace(/\{\{page\}\}/gi, String(currentPageIndex + 1)) }
                    : el;

                  return (
                    <CanvasElementComponent
                      key={`footer-master-${el.id}`}
                      element={elementWithPage}
                      isSelected={false}
                      onSelect={() => { }}
                      onChange={() => { }}
                    />
                  );
                })}
              </Group>
            </Layer>
          </Stage>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="h-16 bg-slate-900 border-t border-white/10 flex items-center justify-center gap-8 shrink-0 relative z-50">
        <button
          onClick={() => setCurrentPageIndex(Math.max(0, currentPageIndex - 1))}
          disabled={currentPageIndex === 0}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-white disabled:opacity-30 disabled:hover:bg-transparent transition-all"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="text-white/80 font-mono font-bold text-sm">
          Page {currentPageIndex + 1} <span className="text-white/30 mx-2">/</span> {catalog.pages.length}
        </span>
        <button
          onClick={() => setCurrentPageIndex(Math.min(catalog.pages.length - 1, currentPageIndex + 1))}
          disabled={currentPageIndex === catalog.pages.length - 1}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-white disabled:opacity-30 disabled:hover:bg-transparent transition-all"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default PublicViewer;
