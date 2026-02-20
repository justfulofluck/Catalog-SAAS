import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Layout, Copy, BookOpen, List, FileText, Sparkles, GripHorizontal } from 'lucide-react';
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
        handle: '.page-preview', // Drag via the preview itself
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
    <div className={`absolute bottom-0 left-0 w-full z-40 border-t backdrop-blur-md transition-all duration-300 flex flex-col ${isDark
      ? 'bg-[#0f172a]/95 border-slate-800'
      : 'bg-white/95 border-slate-200'
      }`}>

      {/* Pages Container */}
      <div
        ref={sortableRef}
        className="flex-1 flex items-center gap-4 overflow-x-auto p-4 custom-scrollbar"
        style={{ height: '160px' }}
      >
        {catalog.pages.map((page, index) => {
          const isActive = currentPageIndex === index;

          return (
            <div
              key={page.id}
              data-id={page.id}
              className={`relative group shrink-0 flex flex-col items-center gap-2 cursor-pointer transition-all ${isActive ? 'scale-105' : 'hover:scale-105'}`}
              onClick={() => setCurrentPageIndex(index)}
            >
              {/* Thumbnail / Preview */}
              <div
                className={`page-preview w-[80px] h-[106px] relative bg-white border shadow-sm overflow-hidden rounded-[2px] transition-all
                  ${isActive
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-lg'
                    : (isDark ? 'border-slate-700 hover:border-slate-500' : 'border-slate-200 hover:border-slate-300')}
                `}
              >
                {page.elements.length === 0 ? (
                  <div className="w-full h-full flex items-center justify-center opacity-5 bg-slate-50">
                    <Layout size={16} className="text-slate-400" />
                  </div>
                ) : (
                  <div className="w-full h-full relative" style={{ backgroundColor: page.backgroundColor || '#ffffff' }}>
                    {page.elements.slice(0, 15).map((el) => (
                      <div
                        key={el.id}
                        className="absolute opacity-30"
                        style={{
                          top: `${(el.y / 1123) * 100}%`,
                          left: `${(el.x / 794) * 100}%`,
                          width: `${(el.width / 794) * 100}%`,
                          height: `${(el.height / 1123) * 100}%`,
                          backgroundColor: el.fill || (el.type === 'image' ? '#4f46e5' : '#94a3b8'),
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Price Tag Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[7px] text-center py-0.5 font-mono">
                  ${getPagePriceTotal(page).toLocaleString()}
                </div>

                {/* Hover Overlay Actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); duplicatePage(index); }}
                    className="p-1.5 bg-white text-slate-700 rounded-full hover:bg-indigo-50 hover:text-indigo-600 shadow-lg"
                    title="Duplicate"
                  >
                    <Copy size={10} />
                  </button>
                  {catalog.pages.length > 1 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); removePage(index); }}
                      className="p-1.5 bg-white text-red-500 rounded-full hover:bg-red-50 shadow-lg"
                      title="Delete"
                    >
                      <Trash2 size={10} />
                    </button>
                  )}
                </div>
              </div>

              {/* Page Label */}
              <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${isActive ? 'bg-indigo-100 text-indigo-700' : (isDark ? 'text-slate-500' : 'text-slate-400')}`}>
                Page {index + 1}
              </span>
            </div>
          );
        })}

        {/* Add Page Button */}
        <div className="shrink-0 h-[106px] flex items-center justify-center relative" ref={popoverRef}>
          <button
            onClick={() => setPopoverOpen(!isPopoverOpen)}
            className={`w-[80px] h-[106px] border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 transition-all group
               ${isDark
                ? 'border-slate-800 hover:border-indigo-500/50 bg-slate-900/50 hover:bg-slate-800'
                : 'border-slate-200 hover:border-indigo-300 bg-slate-50 hover:bg-indigo-50/30'}
             `}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isDark ? 'bg-slate-800 group-hover:bg-indigo-500 group-hover:text-white' : 'bg-white group-hover:bg-indigo-600 group-hover:text-white shadow-sm'}`}>
              <Plus size={16} className={isDark ? 'text-slate-500 group-hover:text-white' : 'text-slate-400 group-hover:text-white'} />
            </div>
            <span className={`text-[9px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-500 group-hover:text-indigo-400' : 'text-slate-400 group-hover:text-indigo-600'}`}>Add Page</span>
          </button>

          {/* Add Page Popover */}
          {isPopoverOpen && (
            <div className={`absolute bottom-full mb-4 left-0 w-64 border shadow-2xl rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200 py-1 z-50 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
              <p className={`px-3 py-2 text-[9px] font-black uppercase tracking-widest border-b ${isDark ? 'text-slate-500 border-slate-700' : 'text-slate-400 border-slate-100'}`}>Select Page Type</p>
              <div className="p-1 space-y-0.5">
                <PageTypeButton icon={BookOpen} label="Hero Cover" type="cover" onClick={() => handleAddTypedPage('cover')} />
                <PageTypeButton icon={List} label="Inventory Index" type="index" onClick={() => handleAddTypedPage('index')} />
                <div className={`h-px mx-2 my-1 ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`} />
                <PageTypeButton icon={FileText} label="Blank Interior" type="interior" onClick={() => handleAddTypedPage('interior')} />
                <button
                  onClick={handleInheritLayout}
                  className={`w-full flex items-center gap-3 p-3 transition-colors group text-left rounded-lg ${isDark ? 'hover:bg-indigo-600 hover:text-white bg-slate-900/50' : 'hover:bg-indigo-600 hover:text-white bg-indigo-50/50'}`}
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-md"><Sparkles size={12} /></div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-tighter leading-none mb-0.5">Inherit Structure</p>
                    <p className="text-[8px] font-bold opacity-60 uppercase tracking-widest">Clone Layout</p>
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

export default PageNavigator;
