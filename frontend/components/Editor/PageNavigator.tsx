
import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Layout, Copy, BookOpen, List, FileText, Flag, Sparkles, ChevronDown, GripVertical } from 'lucide-react';
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
    reorderPages
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

  // Handle Drag and Drop for Pages
  useEffect(() => {
    if (sortableRef.current && catalog.pages.length > 0) {
      const sortable = Sortable.create(sortableRef.current, {
        animation: 150,
        handle: '.page-drag-handle',
        ghostClass: 'sortable-ghost',
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

  const PageTypeButton = ({ type, label, icon: Icon, onClick }: any) => (
    <button 
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 hover:bg-indigo-50 transition-colors group text-left"
    >
      <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 group-hover:bg-white group-hover:text-indigo-600 flex items-center justify-center transition-colors shadow-sm">
        <Icon size={14} />
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-800 uppercase tracking-tighter leading-none mb-0.5">{label}</p>
        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{type}</p>
      </div>
    </button>
  );

  return (
    <div className="absolute right-6 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-4 p-4 bg-white/95 backdrop-blur-3xl border border-white shadow-[0_40px_80px_rgba(0,0,0,0.15)] rounded-[20px] max-h-[85vh] animate-in slide-in-from-right-4 duration-500 ring-1 ring-black/5">
      <div className="flex flex-col items-center mb-1">
        <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">Stack</span>
        <span className="text-[11px] font-black text-slate-900 uppercase tracking-tighter leading-none">
          {catalog.pages.length} Pages
        </span>
      </div>

      <div className="w-10 h-[1px] bg-slate-100" />

      <div 
        ref={sortableRef}
        className="flex flex-col items-center gap-4 overflow-y-auto no-scrollbar py-2 px-1"
      >
        {catalog.pages.map((page, index) => {
          const isActive = currentPageIndex === index;
          const pageTotal = getPagePriceTotal(page);
          
          return (
            <div key={page.id} data-id={page.id} className="relative group shrink-0">
              <div 
                className={`
                  relative w-24 h-32 rounded-[12px] border-2 transition-all flex flex-row overflow-hidden bg-white
                  ${isActive ? 'border-indigo-600 shadow-2xl shadow-indigo-600/30 scale-105 z-10' : 'border-slate-100 hover:border-indigo-200 hover:shadow-lg'}
                `}
              >
                {/* 1. Dedicated Vertical Drag Handle */}
                <div 
                  className={`page-drag-handle w-6 flex items-center justify-center cursor-grab active:cursor-grabbing transition-colors ${isActive ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-300 group-hover:text-slate-500 group-hover:bg-slate-100'}`}
                >
                  <GripVertical size={14} strokeWidth={3} />
                </div>

                {/* 2. Page Content View */}
                <div 
                  className="flex-1 flex flex-col cursor-pointer"
                  onClick={() => setCurrentPageIndex(index)}
                >
                  <div className={`w-full py-1 text-center border-b ${isActive ? 'bg-indigo-600/10 text-indigo-600' : 'bg-slate-50/50 text-slate-400'}`}>
                    <span className="text-[8px] font-black uppercase tracking-widest">P.{index + 1}</span>
                  </div>

                  <div className="flex-1 relative bg-white p-1.5 overflow-hidden">
                    {page.elements.length === 0 ? (
                      <div className="w-full h-full flex items-center justify-center opacity-5">
                          <Layout size={14} />
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
                                minWidth: '4px',
                                minHeight: '2px'
                              }} 
                            />
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Pricing Footer */}
                  <div className={`w-full py-1.5 px-1 text-center border-t flex flex-col items-center justify-center ${isActive ? 'bg-indigo-50/40 border-indigo-50' : 'bg-slate-50/30'}`}>
                    <span className={`text-[9px] font-black truncate max-w-full leading-none ${pageTotal > 0 ? 'text-emerald-600' : 'text-slate-300'}`}>
                      ${pageTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Floating Action Menu */}
              <div className="absolute -top-1 -right-3 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all z-20">
                <button 
                  onClick={(e) => { e.stopPropagation(); duplicatePage(index); }}
                  className="w-7 h-7 bg-white shadow-xl border border-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all hover:scale-110 active:scale-90"
                  title="Duplicate Page"
                >
                  <Copy size={12} />
                </button>
                {catalog.pages.length > 1 && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); removePage(index); }}
                    className="w-7 h-7 bg-white shadow-xl border border-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 transition-all hover:scale-110 active:scale-90"
                    title="Remove Page"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="w-10 h-[1px] bg-slate-100 mt-2" />

      {/* Append Trigger */}
      <div className="relative mt-2" ref={popoverRef}>
        <button 
          onClick={() => setPopoverOpen(!isPopoverOpen)}
          className={`w-24 h-14 shrink-0 flex flex-col items-center justify-center border-2 transition-all group ${isPopoverOpen ? 'bg-indigo-600 border-indigo-600 text-white rounded-[12px]' : 'border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 text-slate-300 hover:text-indigo-600 rounded-[12px]'}`}
        >
          <Plus size={20} className={`${isPopoverOpen ? 'rotate-45' : 'group-hover:scale-125'} transition-all mb-1`} />
          <span className="text-[7px] font-black uppercase tracking-[0.2em]">{isPopoverOpen ? 'Cancel' : 'Append'}</span>
        </button>

        {isPopoverOpen && (
          <div className="absolute right-full mr-4 bottom-0 w-60 bg-white border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-[20px] overflow-hidden animate-in fade-in slide-in-from-right-4 duration-200 py-1 z-50">
             <div className="px-4 py-3 border-b border-slate-50 mb-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Select Section Template</p>
             </div>
             
             <PageTypeButton icon={BookOpen} label="Hero Cover" type="cover" onClick={() => handleAddTypedPage('cover')} />
             <PageTypeButton icon={List} label="Inventory Index" type="index" onClick={() => handleAddTypedPage('index')} />
             
             <div className="h-px bg-slate-100 mx-3 my-1" />
             
             <PageTypeButton icon={FileText} label="Blank Interior" type="interior" onClick={() => handleAddTypedPage('interior')} />
             <button 
                onClick={handleInheritLayout}
                className="w-full flex items-center gap-3 p-3 hover:bg-indigo-600 hover:text-white transition-colors group text-left bg-indigo-50/50"
             >
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-md">
                   <Sparkles size={14} />
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase tracking-tighter leading-none mb-0.5">Inherit Structure</p>
                   <p className="text-[8px] font-bold opacity-60 uppercase tracking-widest">Clone Layout</p>
                </div>
             </button>

             <div className="h-px bg-slate-100 mx-3 my-1" />
             
             <PageTypeButton icon={Flag} label="Closing Section" type="closing" onClick={() => handleAddTypedPage('closing')} />
          </div>
        )}
      </div>
    </div>
  );
};

export default PageNavigator;
