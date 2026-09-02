import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Copy, BookOpen, FileText, List, Sparkles, LayoutGrid, Layers, LogOut, LayoutTemplate, SlidersHorizontal, Palette, X } from 'lucide-react';
import { Canvas, Textbox } from 'fabric';
import { useStore } from '../../store/useStore';
import { PageType, CatalogPage, CanvasElement } from '../../types';
import { THEMES, PAGE_WIDTH, PAGE_HEIGHT } from '../../constants';
import { elementToFabricObject } from '../Editor/fabricRenderer';
import TemplatesPanel from './TemplatesPanel';

const THUMB_BASE = 140;

const FabricThumb: React.FC<{ page: CatalogPage; canvasBg: string; catalog: any; products: any[]; pageNum: number }> = ({ page, canvasBg, catalog, products, pageNum }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const thumbW = THUMB_BASE;
  const thumbH = Math.round(thumbW * (PAGE_HEIGHT / PAGE_WIDTH));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isMounted = true;
    const scale = thumbW / PAGE_WIDTH;

    // Reset transform & clear
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, thumbW, thumbH);

    // Background fill
    ctx.fillStyle = page.backgroundColor || canvasBg || '#ffffff';
    ctx.fillRect(0, 0, thumbW, thumbH);

    // Scale to thumbnail coordinates
    ctx.scale(scale, scale);

    const showHeaderFooter = page.type === 'product' || page.type === 'interior' || page.type === 'index';
    const allElements = [
      ...(catalog.hasHeader && showHeaderFooter ? catalog.headerElements || [] : []),
      ...page.elements,
      ...(catalog.hasFooter && showHeaderFooter ? (catalog.footerElements || []).map((el: any) => ({
        ...el,
        y: (el.y || 0) + PAGE_HEIGHT - (catalog.footerHeight || 38),
        text: el.type === 'text' && el.text?.includes('{{page}}')
          ? el.text.replace(/\{\{page\}\}/gi, String(pageNum + 1))
          : el.text,
      })) : []),
    ];

    // Sort elements by zIndex
    const sortedElements = [...allElements].filter(el => el.visible !== false).sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

    sortedElements.forEach((el) => {
      ctx.save();
      ctx.globalAlpha = el.opacity ?? 1;

      // Translate to element position
      ctx.translate(el.x, el.y);
      if (el.rotation) {
        ctx.rotate((el.rotation * Math.PI) / 180);
      }

      if (el.type === 'shape') {
        ctx.fillStyle = el.fill || '#cbd5e1';
        if (el.shapeType === 'circle') {
          const r = Math.min(el.width, el.height) / 2;
          ctx.beginPath();
          ctx.arc(r, r, r, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(0, 0, el.width, el.height);
        }
      } else if (el.type === 'text') {
        let textContent = (el.text || '').replace(/<[^>]*>/g, '');
        if (textContent.includes('{{page}}')) {
          textContent = textContent.replace(/\{\{page\}\}/gi, String(page.pageNumber || pageNum + 1));
        }
        ctx.fillStyle = el.fill || '#000000';
        ctx.font = `${el.fontWeight || 'normal'} ${el.fontSize || 16}px ${el.fontFamily || 'Inter, sans-serif'}`;
        ctx.textBaseline = 'top';
        ctx.fillText(textContent, 0, 0, el.width);
      } else if (el.type === 'image' && el.src) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = el.src;
        if (img.complete && img.naturalWidth > 0) {
          ctx.drawImage(img, 0, 0, el.width, el.height);
        } else {
          img.onload = () => {
            if (!isMounted) return;
            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.scale(scale, scale);
            ctx.translate(el.x, el.y);
            if (el.rotation) ctx.rotate((el.rotation * Math.PI) / 180);
            ctx.globalAlpha = el.opacity ?? 1;
            ctx.drawImage(img, 0, 0, el.width, el.height);
            ctx.restore();
          };
        }
      } else if (el.type === 'product-block') {
        const prod = products.find(p => p.id === el.productId);
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, el.width, el.height);
        ctx.strokeStyle = '#e2e8f0';
        ctx.strokeRect(0, 0, el.width, el.height);

        const imgSrc = el.src || prod?.image;
        if (imgSrc) {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = imgSrc;
          const imgH = el.height * 0.65;
          if (img.complete && img.naturalWidth > 0) {
            ctx.drawImage(img, 10, 10, el.width - 20, imgH - 10);
          } else {
            img.onload = () => {
              if (!isMounted) return;
              ctx.save();
              ctx.setTransform(1, 0, 0, 1, 0, 0);
              ctx.scale(scale, scale);
              ctx.translate(el.x, el.y);
              ctx.drawImage(img, 10, 10, el.width - 20, imgH - 10);
              ctx.restore();
            };
          }
        }

        if (prod?.name) {
          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 14px Inter, sans-serif';
          ctx.textBaseline = 'top';
          ctx.fillText(prod.name, 10, el.height * 0.7, el.width - 20);
        }
      }

      ctx.restore();
    });

    return () => {
      isMounted = false;
    };
  }, [page, canvasBg, catalog, products, pageNum, thumbW, thumbH]);

  return (
    <div className="flex justify-center items-center py-1 w-full bg-slate-50/50 rounded overflow-hidden">
      <canvas
        ref={canvasRef}
        width={thumbW}
        height={thumbH}
        className="rounded shadow-sm border border-slate-200 bg-white"
        style={{ width: `${thumbW}px`, height: `${thumbH}px` }}
      />
    </div>
  );
};

const PagesPanel: React.FC = () => {
  const {
    catalog, activeThemeId, currentPageIndex, setCurrentPageIndex,
    addPage, removePage, duplicatePage, reorderPages, setPageBackground, uiTheme, products,
  } = useStore();

  const theme = THEMES.find(t => t.id === activeThemeId) || THEMES[0];
  const canvasBg = catalog.backgroundColor || theme.backgroundColor;

  const [isAddMenuOpen, setAddMenuOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [configPageIndex, setConfigPageIndex] = useState<number | null>(null);
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

  const [activeTab, setActiveTab] = useState<'pages' | 'templates'>('pages');

  return (
    <div className={`flex flex-col h-full w-full border-r overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
      {/* Header with Segmented Tabs for Pages & Templates */}
      <div className={`p-2.5 border-b shrink-0 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
        <div className={`flex rounded-xl p-1 ${isDark ? 'bg-slate-800/80' : 'bg-slate-100'}`}>
          <button
            onClick={() => setActiveTab('pages')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-black transition-all ${
              activeTab === 'pages'
                ? 'bg-indigo-600 text-white shadow-md'
                : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText size={13} />
            <span>Pages ({catalog.pages.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-black transition-all ${
              activeTab === 'templates'
                ? 'bg-indigo-600 text-white shadow-md'
                : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutTemplate size={13} />
            <span>Templates</span>
          </button>
        </div>
      </div>

      {activeTab === 'templates' ? (
        <div className="flex-1 overflow-hidden">
          <TemplatesPanel />
        </div>
      ) : (
        <>
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
                  <FabricThumb page={page} canvasBg={canvasBg} catalog={catalog} products={products} pageNum={index} />

                  <div className="flex items-center justify-between mt-1.5 px-0.5">
                    <span className={`text-[10px] font-bold uppercase tracking-wide ${isActive ? 'text-indigo-600' : (isDark ? 'text-slate-400' : 'text-slate-500')}`}>Page {index + 1}</span>
                    <span className={`text-[9px] capitalize ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>{page.type}</span>
                  </div>

                  {/* Action Icons on Thumbnail Hover */}
                  {hoveredIndex === index && (
                    <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfigPageIndex(configPageIndex === index ? null : index);
                        }}
                        className={`p-1.5 rounded-lg shadow-md border transition-all ${
                          configPageIndex === index
                            ? 'bg-indigo-600 text-white border-indigo-700'
                            : isDark ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700' : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
                        }`}
                        title="Page Settings (Background Color & Role)"
                      >
                        <SlidersHorizontal size={12} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); duplicatePage(index); }}
                        className={`p-1.5 rounded-lg shadow-md border transition-all ${isDark ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700' : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'}`}
                        title="Duplicate page"
                      >
                        <Copy size={12} />
                      </button>
                      {catalog.pages.length > 1 && (
                        <button
                          onClick={(e) => { e.stopPropagation(); removePage(index); }}
                          className={`p-1.5 rounded-lg shadow-md border transition-all ${isDark ? 'bg-slate-800 text-red-400 border-slate-700 hover:bg-red-500/20' : 'bg-white text-red-500 hover:bg-red-50 border-slate-200'}`}
                          title="Delete page"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Page Configuration Popover */}
                  {configPageIndex === index && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className={`mt-2 p-3 rounded-xl border shadow-xl animate-in fade-in zoom-in-95 duration-150 z-20 ${
                        isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-indigo-100 text-slate-800 shadow-indigo-500/10'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-200/50 dark:border-slate-700/50">
                        <div className="flex items-center gap-1.5">
                          <Palette size={13} className="text-indigo-600 dark:text-indigo-400" />
                          <span className="text-[11px] font-black uppercase tracking-wider">Page {index + 1} Settings</span>
                        </div>
                        <button
                          onClick={() => setConfigPageIndex(null)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          <X size={12} />
                        </button>
                      </div>

                      {/* 1. Background Color */}
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">
                          Background Color
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={page.backgroundColor || canvasBg}
                            onChange={(e) => setPageBackground(index, e.target.value)}
                            className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 dark:border-slate-700 p-0.5 bg-transparent"
                          />
                          <input
                            type="text"
                            value={page.backgroundColor || canvasBg}
                            onChange={(e) => setPageBackground(index, e.target.value)}
                            className={`flex-1 px-2 py-1 rounded-lg text-xs font-mono font-bold border uppercase ${
                              isDark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                            }`}
                            placeholder="#ffffff"
                          />
                        </div>

                        {/* Color Presets */}
                        <div className="flex items-center gap-1.5 pt-1">
                          {[
                            { color: '#ffffff', label: 'White' },
                            { color: '#f8fafc', label: 'Off-White' },
                            { color: '#0f172a', label: 'Dark Navy' },
                            { color: '#18181b', label: 'Zinc Dark' },
                            { color: '#fef2f2', label: 'Warm Red' },
                            { color: '#eff6ff', label: 'Soft Blue' },
                            { color: '#f0fdf4', label: 'Mint Green' },
                          ].map((preset) => (
                            <button
                              key={preset.color}
                              onClick={() => setPageBackground(index, preset.color)}
                              className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-600 transition-transform hover:scale-110 shadow-sm"
                              style={{ backgroundColor: preset.color }}
                              title={preset.label}
                            />
                          ))}
                        </div>
                      </div>

                      {/* 2. Page Type Selection */}
                      <div className="space-y-1.5 pt-3 mt-3 border-t border-slate-200/50 dark:border-slate-700/50">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">
                          Page Role / Type
                        </label>
                        <div className="grid grid-cols-2 gap-1">
                          {(['cover', 'product', 'intro', 'index', 'closing', 'blank'] as PageType[]).map((type) => (
                            <button
                              key={type}
                              onClick={() => {
                                const newPages = [...catalog.pages];
                                newPages[index] = { ...newPages[index], type };
                                useStore.setState({ catalog: { ...catalog, pages: newPages } });
                              }}
                              className={`py-1 px-2 rounded-lg text-[10px] font-bold capitalize transition-all border text-left ${
                                page.type === type
                                  ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                                  : isDark ? 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>
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
                      { icon: BookOpen, label: '1. Cover Page', type: 'cover' as PageType },
                      { icon: LayoutGrid, label: '2. Product Page', type: 'product' as PageType },
                      { icon: List, label: '3. Index Page', type: 'index' as PageType },
                      { icon: Layers, label: '4. Intro / Section', type: 'intro' as PageType },
                      { icon: LogOut, label: '5. Outro / Closing', type: 'closing' as PageType },
                      { icon: FileText, label: '6. Blank Page', type: 'blank' as PageType },
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
                      onClick={() => { addPage('product'); setAddMenuOpen(false); }}
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
        </>
      )}
    </div>
  );
};

export default PagesPanel;
