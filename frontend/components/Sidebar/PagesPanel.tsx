import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Copy, BookOpen, FileText, List, Sparkles } from 'lucide-react';
import { Canvas, Textbox } from 'fabric';
import { useStore } from '../../store/useStore';
import { PageType, CatalogPage, CanvasElement } from '../../types';
import { THEMES, PAGE_WIDTH, PAGE_HEIGHT } from '../../constants';
import { elementToFabricObject } from '../Editor/fabricRenderer';

const THUMB_BASE = 140;

const FabricThumb: React.FC<{ page: CatalogPage; canvasBg: string; catalog: any; products: any[]; pageNum: number }> = ({ page, canvasBg, catalog, products, pageNum }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const isLandscape = page.orientation === 'landscape';
    const curW = isLandscape ? PAGE_HEIGHT : PAGE_WIDTH;
    const curH = isLandscape ? PAGE_WIDTH : PAGE_HEIGHT;
    const thumbW = THUMB_BASE;
    const thumbH = Math.round(thumbW * (curH / curW));

    const canvas = new Canvas(canvasRef.current, {
      width: thumbW,
      height: thumbH,
      selection: false,
      interactive: false,
    });

    const render = async () => {
      canvas.clear();
      canvas.backgroundColor = canvasBg;
      const scale = thumbW / curW;

      const allElements = [
        ...(catalog.headerElements || []),
        ...page.elements,
        ...(catalog.footerElements || []).map((el: any) => ({
          ...el,
          y: (el.y || 0) + curH - (catalog.footerHeight || 38),
          text: el.type === 'text' && el.text?.includes('{{page}}')
            ? el.text.replace('{{page}}', String(pageNum + 1))
            : el.text,
        })),
      ];

      const objects = await Promise.all(
        allElements
          .filter((el: any) => el.visible !== false)
          .map((el: any) => elementToFabricObject(el, products)),
      );

      objects.filter(Boolean).forEach((obj: any) => {
        obj.set({
          selectable: false,
          evented: false,
          scaleX: (obj.scaleX || 1) * scale,
          scaleY: (obj.scaleY || 1) * scale,
          left: (obj.left || 0) * scale,
          top: (obj.top || 0) * scale,
        });
        if (obj instanceof Textbox) {
          obj.set({ fontSize: (obj.fontSize || 14) * scale });
        }
        canvas.add(obj);
      });

      canvas.renderAll();
    };

    render();
    return () => { canvas.dispose(); };
  }, [page, canvasBg, catalog]);

  return (
    <canvas
      ref={canvasRef}
      width={THUMB_BASE}
      height={Math.round(THUMB_BASE * ((page.orientation === 'landscape' ? PAGE_WIDTH : PAGE_HEIGHT) / (page.orientation === 'landscape' ? PAGE_HEIGHT : PAGE_WIDTH)))}
      style={{ width: '100%', height: 'auto' }}
    />
  );
};

const PagesPanel: React.FC = () => {
  const {
    catalog, activeThemeId, currentPageIndex, setCurrentPageIndex,
    addPage, removePage, duplicatePage, reorderPages, uiTheme, products,
  } = useStore();

  const theme = THEMES.find(t => t.id === activeThemeId) || THEMES[0];
  const canvasBg = catalog.backgroundColor || theme.backgroundColor;

  const [isAddMenuOpen, setAddMenuOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [dragPageIndex, setDragPageIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
  const addMenuRef = useRef<HTMLDivElement>(null);
  const isDark = uiTheme === 'dark';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) setAddMenuOpen(false);
    };
    if (isAddMenuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isAddMenuOpen]);

  const handleAddPage = (type: PageType) => { addPage(type); setAddMenuOpen(false); };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDragPageIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    if (e.currentTarget instanceof HTMLElement) e.currentTarget.style.opacity = '0.4';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) e.currentTarget.style.opacity = '1';
    if (dragPageIndex !== null && dropTargetIndex !== null && dragPageIndex !== dropTargetIndex) {
      const newOrder = [...catalog.pages.map(p => p.id)];
      const [movedId] = newOrder.splice(dragPageIndex, 1);
      newOrder.splice(dropTargetIndex, 0, movedId);
      reorderPages(newOrder);
      setCurrentPageIndex(dropTargetIndex);
    }
    setDragPageIndex(null);
    setDropTargetIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTargetIndex(index);
  };

  return (
    <div className={`flex flex-col h-full w-full border-r overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-3 py-3 border-b shrink-0 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
        <span className={`text-[11px] font-black uppercase tracking-widest ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Pages</span>
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>{catalog.pages.length}</span>
      </div>

      {/* Pages List — Drag & Drop */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
        {catalog.pages.map((page, index) => {
          const isActive = currentPageIndex === index;
          const isDropTarget = dropTargetIndex === index && dragPageIndex !== null && dragPageIndex !== index;
          return (
            <div
              key={page.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, index)}
              className={`group relative rounded-lg cursor-grab active:cursor-grabbing transition-all p-1.5
                ${isDropTarget ? 'border-t-2 border-indigo-500' : 'border-t-2 border-transparent'}
                ${isActive ? (isDark ? 'bg-indigo-600/20' : 'bg-indigo-50') : (isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-50')}
                ${dragPageIndex === index ? 'opacity-40' : ''}`}
              onClick={() => {
                setCurrentPageIndex(index);
                window.dispatchEvent(new CustomEvent('catalog:scrollToPage', { detail: { pageIndex: index } }));
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="overflow-hidden rounded-sm border border-slate-200" style={{ width: '100%' }}>
                <FabricThumb page={page} canvasBg={canvasBg} catalog={catalog} products={products} pageNum={index} />
              </div>

              <div className="flex items-center justify-between mt-1.5 px-0.5">
                <span className={`text-[10px] font-bold uppercase tracking-wide ${isActive ? 'text-indigo-600' : (isDark ? 'text-slate-400' : 'text-slate-500')}`}>Page {index + 1}</span>
                <span className={`text-[9px] capitalize ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>{page.type}</span>
              </div>

              {hoveredIndex === index && (
                <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
                  <button
                    onClick={(e) => { e.stopPropagation(); duplicatePage(index); }}
                    className="p-1.5 bg-white text-slate-600 rounded-lg shadow-md hover:bg-slate-50 border border-slate-200"
                    title="Duplicate page"
                  >
                    <Copy size={12} />
                  </button>
                  {catalog.pages.length > 1 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); removePage(index); }}
                      className="p-1.5 bg-white text-red-500 rounded-lg shadow-md hover:bg-red-50 border border-slate-200"
                      title="Delete page"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Page Button */}
      <div className={`shrink-0 p-2 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`} ref={addMenuRef}>
        <div className="relative">
          <button
            onClick={() => setAddMenuOpen(!isAddMenuOpen)}
            className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg border-2 border-dashed text-[11px] font-bold uppercase tracking-wide transition-all ${isDark ? 'border-slate-700 text-slate-500 hover:border-indigo-500 hover:text-indigo-400 hover:bg-indigo-500/10' : 'border-slate-200 text-slate-400 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50'}`}
          >
            <Plus size={13} /> Add Page
          </button>

          {isAddMenuOpen && (
            <div className={`absolute bottom-full mb-2 left-0 right-0 border shadow-2xl rounded-xl overflow-hidden z-50 py-1 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
              <p className={`px-3 py-2 text-[9px] font-black uppercase tracking-widest border-b ${isDark ? 'text-slate-500 border-slate-700' : 'text-slate-400 border-slate-100'}`}>Select Page Type</p>
              <div className="p-1 space-y-0.5">
                {[
                  { icon: BookOpen, label: 'Hero Cover', type: 'cover' as PageType },
                  { icon: List, label: 'Index Page', type: 'index' as PageType },
                  { icon: FileText, label: 'Blank Interior', type: 'interior' as PageType },
                  { icon: FileText, label: 'Closing Page', type: 'closing' as PageType },
                ].map(({ icon: Icon, label, type }) => (
                  <button
                    key={type}
                    onClick={() => handleAddPage(type)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors ${isDark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-indigo-50 text-slate-700'}`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                      <Icon size={13} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold leading-none mb-0.5">{label}</p>
                      <p className={`text-[9px] uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{type}</p>
                    </div>
                  </button>
                ))}
                <div className={`h-px mx-2 my-1 ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`} />
                <button
                  onClick={() => { addPage('interior'); setAddMenuOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors ${isDark ? 'hover:bg-indigo-600/20 text-slate-300' : 'hover:bg-indigo-50 text-slate-700'}`}
                >
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                    <Sparkles size={13} className="text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold leading-none mb-0.5">Inherit Layout</p>
                    <p className={`text-[9px] uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Clone current</p>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PagesPanel;
