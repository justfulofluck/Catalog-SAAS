
import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Layout, Copy, BookOpen, List, FileText, Flag, Sparkles, GripHorizontal } from 'lucide-react';
import Sortable from 'sortablejs';
import { useStore } from '../../store/useStore';
import { CatalogPage, PageType } from '../../types';

const PageNavigator: React.FC = () => {
  const {
    catalog,
    products,
    currentPageIndex,
    setCurrentPageIndex,
    addPage,
    removePage,
    duplicatePage,
    addInteriorPageWithInheritedLayout,
    reorderPages,
    uiTheme
  } = useStore();

  const [isPopoverOpen, setPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const sortableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setPopoverOpen(false);
      }
    };
    if (isPopoverOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isPopoverOpen]);

  // Handle Horizontal Scroll with Mouse Wheel
  useEffect(() => {
    const el = sortableRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  // Handle Drag and Drop for Pages
  useEffect(() => {
    if (sortableRef.current && catalog.pages.length > 0) {
      const sortable = Sortable.create(sortableRef.current, {
        animation: 150,
        handle: '.page-drag-handle',
        ghostClass: 'sortable-ghost',
        direction: 'horizontal',
        onEnd: (evt) => {
          const newOrder = Array.from(sortableRef.current!.children)
            .filter(el => (el as HTMLElement).dataset.id)
            .map(el => (el as HTMLElement).dataset.id!);
          reorderPages(newOrder);
        },
      });
      return () => sortable.destroy();
    }
  }, [catalog.pages.length, reorderPages]);

  const getPagePriceTotal = (page: CatalogPage) => {
    const productIdsOnPage = Array.from(new Set(
      page.elements
        .filter(el => el.productId)
        .map(el => el.productId!)
    ));

    const total = productIdsOnPage.reduce((sum, id) => {
      const product = products.find(p => p.id === id);
      return sum + (product?.price || 0);
    }, 0);

    return total;
  };

  const handleAddTypedPage = (type: PageType) => {
    addPage(type);
    setPopoverOpen(false);
  };

  const handleInheritLayout = () => {
    addInteriorPageWithInheritedLayout();
    setPopoverOpen(false);
  };

  const isDark = uiTheme === 'dark';

  const PageTypeButton = ({ type, label, icon: Icon, onClick }: any) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 transition-colors group text-left ${isDark ? 'hover:bg-slate-700' : 'hover:bg-indigo-50'
        }`}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors shadow-sm ${isDark
        ? 'bg-slate-700 text-slate-400 group-hover:bg-slate-600 group-hover:text-indigo-400'
        : 'bg-slate-50 text-slate-400 group-hover:bg-white group-hover:text-indigo-600'
        }`}>
        <Icon size={14} />
      </div>
      <div>
        <p className={`text-[10px] font-black uppercase tracking-tighter leading-none mb-0.5 ${isDark ? 'text-white' : 'text-slate-800'}`}>{label}</p>
        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{type}</p>
      </div>
    </button>
  );

  return (
    <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-40 h-[100px] max-w-full flex items-center gap-4 px-6 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] border rounded-[24px] transition-all duration-500 ${isDark
      ? 'bg-[#0f172a]/90 border-slate-700 ring-1 ring-white/10'
      : 'bg-white/90 border-slate-200 ring-1 ring-black/5'
      }`}>

      {/* Label and Count */}
      <div className="flex flex-col items-center gap-1 shrink-0 border-r pr-8 h-1/2 justify-center border-slate-700/30">
        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] leading-none mb-0.5">Stack</span>
        <span className={`text-[18px] font-black uppercase tracking-tighter leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {catalog.pages.length}
        </span>
      </div>

      <div
        ref={sortableRef}
        className="flex w-[272px] shrink-0 items-center gap-8 overflow-x-auto no-scrollbar scroll-smooth h-full py-4 px-8 min-w-0"
      >
        {catalog.pages.map((page, index) => {
          const isActive = currentPageIndex === index;
          const pageTotal = getPagePriceTotal(page);

          return (
            <div key={page.id} data-id={page.id} className="relative group shrink-0">
              <div
                className={`
                  relative w-[48px] h-[64px] rounded-[4px] border-2 transition-all flex flex-col overflow-hidden
                  ${isDark ? 'bg-slate-800' : 'bg-white'}
                  ${isActive ? 'border-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.3)] z-10 scale-105' : (isDark ? 'border-slate-700/50 hover:border-indigo-500' : 'border-slate-200 hover:border-indigo-300')}
                `}
              >
                {/* 1. Dedicated Horizontal Drag Handle */}
                <div
                  className={`page-drag-handle h-3.5 flex items-center justify-center cursor-grab active:cursor-grabbing transition-colors shrink-0 ${isActive
                    ? 'bg-indigo-600 text-white'
                    : (isDark ? 'bg-slate-700/80 text-slate-500 group-hover:text-slate-300 group-hover:bg-slate-600' : 'bg-slate-100 text-slate-400 group-hover:text-slate-500 group-hover:bg-slate-200')
                    }`}
                >
                  <GripHorizontal size={10} strokeWidth={3} />
                </div>

                {/* 2. Page Content View */}
                <div
                  className="flex-1 flex flex-col cursor-pointer bg-inherit"
                  onClick={() => setCurrentPageIndex(index)}
                >
                  <div className={`w-full py-0.5 text-center border-b ${isActive
                    ? 'bg-indigo-600/10 text-indigo-600'
                    : (isDark ? 'bg-slate-700/50 text-slate-400' : 'bg-slate-50/50 text-slate-400')
                    }`}>
                    <span className="text-[6px] font-black uppercase tracking-widest">P.{index + 1}</span>
                  </div>

                  <div className={`flex-1 relative p-1 overflow-hidden bg-inherit`}>
                    {page.elements.length === 0 ? (
                      <div className="w-full h-full flex items-center justify-center opacity-5">
                        <Layout size={8} />
                      </div>
                    ) : (
                      <div className="w-full h-full relative">
                        {page.elements.slice(0, 10).map((el, i) => (
                          <div
                            key={el.id}
                            className="rounded-[1px] opacity-20 absolute"
                            style={{
                              top: `${(el.y / 1123) * 100}%`,
                              left: `${(el.x / 794) * 100}%`,
                              width: `${(el.width / 794) * 100}%`,
                              height: `${(el.height / 1123) * 100}%`,
                              backgroundColor: el.fill || (el.type === 'image' ? '#4f46e5' : '#94a3b8'),
                              minWidth: '2px',
                              minHeight: '1.5px'
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Pricing Footer */}
                  <div className={`w-full py-0.5 px-0.5 text-center border-t flex flex-col items-center justify-center ${isActive
                    ? 'bg-indigo-50/40 border-indigo-100'
                    : (isDark ? 'bg-slate-700/30 border-slate-700' : 'bg-slate-50/30 border-slate-100')
                    }`}>
                    <span className={`text-[7px] font-black truncate max-w-full leading-none ${pageTotal > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                      ${pageTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Floating Action Menu */}
              <div className="absolute -top-3 -right-3 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all z-30">
                <button
                  onClick={(e) => { e.stopPropagation(); duplicatePage(index); }}
                  className={`w-6 h-6 shadow-2xl rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-90 border backdrop-blur-md ${isDark
                    ? 'bg-slate-800/80 border-slate-600 text-slate-400 hover:text-indigo-400'
                    : 'bg-white/80 border-slate-200 text-slate-400 hover:text-indigo-600'
                    }`}
                >
                  <Copy size={10} />
                </button>
                {catalog.pages.length > 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); removePage(index); }}
                    className={`w-6 h-6 shadow-2xl rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-90 border backdrop-blur-md ${isDark
                      ? 'bg-slate-800/80 border-slate-600 text-slate-400 hover:text-red-400'
                      : 'bg-white/80 border-slate-200 text-slate-400 hover:text-red-500'
                      }`}
                  >
                    <Trash2 size={10} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className={`h-8 w-[1px] ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />

      {/* Append Trigger */}
      <div className="relative shrink-0" ref={popoverRef}>
        <button
          onClick={() => setPopoverOpen(!isPopoverOpen)}
          className={`w-[60px] h-[60px] flex flex-col items-center justify-center border-2 transition-all group ${isPopoverOpen
            ? 'bg-indigo-600 border-indigo-600 text-white rounded-[4px]'
            : (isDark ? 'border-dashed border-slate-700 hover:border-indigo-500 hover:bg-slate-800 text-slate-500 hover:text-indigo-400 rounded-[4px]' : 'border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-[4px]')
            }`}
        >
          <div className="w-7 h-7 rounded-xl flex items-center justify-center bg-indigo-500/10 mb-1 group-hover:scale-110 transition-transform">
            <Plus size={16} className={`${isPopoverOpen ? 'rotate-45' : ''} transition-all text-indigo-600`} />
          </div>
          <span className="text-[6px] font-black uppercase tracking-[0.2em] text-center leading-tight">{isPopoverOpen ? 'Cancel' : 'Append Section'}</span>
        </button>

        {isPopoverOpen && (
          <div className={`absolute bottom-full mb-4 right-0 w-56 border shadow-[0_-10px_30px_rgba(0,0,0,0.2)] rounded-[20px] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200 py-1 z-50 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
            }`}>
            <PageTypeButton icon={BookOpen} label="Hero Cover" type="cover" onClick={() => handleAddTypedPage('cover')} />
            <PageTypeButton icon={List} label="Inventory Index" type="index" onClick={() => handleAddTypedPage('index')} />
            <div className={`h-px mx-3 my-1 ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`} />
            <PageTypeButton icon={FileText} label="Blank Interior" type="interior" onClick={() => handleAddTypedPage('interior')} />
            <button
              onClick={handleInheritLayout}
              className={`w-full flex items-center gap-3 p-3 transition-colors group text-left ${isDark ? 'hover:bg-indigo-600 hover:text-white bg-slate-900/50' : 'hover:bg-indigo-600 hover:text-white bg-indigo-50/50'}`}
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-md"><Sparkles size={12} /></div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-tighter leading-none mb-0.5">Inherit Structure</p>
                <p className="text-[8px] font-bold opacity-60 uppercase tracking-widest">Clone Layout</p>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PageNavigator;
