import React, { useState, useRef, useEffect } from 'react';
import { Plus, BookOpen, List, FileText, Sparkles, LayoutGrid, Layers, LogOut } from 'lucide-react';
import { Catalog, PageType } from '../../../types';
import { PAGE_WIDTH, PAGE_HEIGHT } from '../../../constants';

interface AddNewPageFooterProps {
  catalog: Catalog;
  zoom: number;
  uiTheme: 'light' | 'dark';
  editingSystemTemplate: any;
  addPage: (type?: PageType, insertAfterIndex?: number) => void;
  addInteriorPageWithInheritedLayout: (insertAfterIndex?: number) => void;
  scrollToPageIndex: (pageIndex: number) => void;
}

export const AddNewPageFooter: React.FC<AddNewPageFooterProps> = ({
  catalog,
  zoom,
  uiTheme,
  editingSystemTemplate,
  addPage,
  addInteriorPageWithInheritedLayout,
  scrollToPageIndex,
}) => {
  const [showAddPageMenu, setShowAddPageMenu] = useState(false);
  const addPageMenuRef = useRef<HTMLDivElement>(null);
  const isDark = uiTheme === 'dark';

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (addPageMenuRef.current && !addPageMenuRef.current.contains(e.target as Node)) {
        setShowAddPageMenu(false);
      }
    };
    if (showAddPageMenu) document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [showAddPageMenu]);

  if (editingSystemTemplate) return null;

  const lastPage = catalog.pages[catalog.pages.length - 1];
  const footerWidth = (lastPage?.orientation === 'landscape' ? PAGE_HEIGHT : PAGE_WIDTH) * zoom;

  const pageTypes: Array<{
    icon: React.ElementType;
    label: string;
    sub: string;
    type: PageType;
  }> = [
    { icon: BookOpen, label: 'Hero Cover', sub: 'Title & brand introduction', type: 'cover' },
    { icon: LayoutGrid, label: 'Product Grid', sub: 'Multi-item showcase layout', type: 'product' },
    { icon: List, label: 'Index Page', sub: 'TOC & section navigation', type: 'index' },
    { icon: Layers, label: 'Section Intro', sub: 'Category & chapter breaker', type: 'intro' },
    { icon: FileText, label: 'Blank Canvas', sub: 'Freeform interior layout', type: 'interior' },
    { icon: LogOut, label: 'Closing Page', sub: 'Back cover & contact info', type: 'closing' },
  ];

  return (
    <div className="relative z-[500] shrink-0 flex flex-col items-center mb-16" ref={addPageMenuRef}>
      <div className="relative" style={{ width: footerWidth }}>
        <button
          onClick={() => setShowAddPageMenu((prev) => !prev)}
          className={`w-full border-2 border-dashed rounded-[6px] flex items-center justify-center gap-3 py-3.5 transition-all duration-200 cursor-pointer group shadow-sm ${
            isDark
              ? 'bg-[#141416]/70 hover:bg-[#18181c] border-[#27272a] hover:border-[#8B3DFF] text-zinc-400 hover:text-white backdrop-blur-sm'
              : 'bg-white hover:bg-slate-50 border-slate-300 hover:border-indigo-500 text-slate-600 hover:text-indigo-600 shadow-sm'
          }`}
        >
          <div
            className={`w-7 h-7 rounded-[4px] flex items-center justify-center transition-all duration-200 ${
              isDark
                ? 'bg-[#1e1e23] border border-white/5 text-zinc-300 group-hover:bg-[#8B3DFF] group-hover:text-white group-hover:border-[#8B3DFF]'
                : 'bg-slate-100 border border-slate-200 text-slate-600 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600'
            }`}
          >
            <Plus size={15} />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-[0.16em]">Add a New Page</span>
        </button>

        {showAddPageMenu && (
          <div
            className={`absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-72 border shadow-[0_20px_50px_rgba(0,0,0,0.85)] rounded-[8px] overflow-hidden z-[600] py-1.5 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 ${
              isDark
                ? 'bg-[#141416] border-[#27272a] text-[#f4f4f5]'
                : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <div
              className={`px-3.5 py-2 text-[9px] font-black uppercase tracking-[0.18em] border-b flex items-center justify-between ${
                isDark ? 'text-zinc-400 border-[#27272a] bg-[#101012]' : 'text-slate-500 border-slate-100 bg-slate-50/50'
              }`}
            >
              <span>Select Page Type</span>
              <span className="text-[8px] font-normal opacity-50">Choose template</span>
            </div>

            <div className="p-1.5 space-y-1">
              {pageTypes.map(({ icon: Icon, label, sub, type }) => (
                <button
                  key={type}
                  onClick={() => {
                    const newIdx = catalog.pages.length;
                    addPage(type);
                    setShowAddPageMenu(false);
                    setTimeout(() => {
                      scrollToPageIndex(newIdx);
                    }, 60);
                  }}
                  className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-[5px] text-left transition-all duration-150 cursor-pointer group ${
                    isDark
                      ? 'hover:bg-white/5 text-zinc-200 hover:text-white'
                      : 'hover:bg-indigo-50/70 text-slate-700 hover:text-indigo-900'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-[4px] flex items-center justify-center shrink-0 transition-colors ${
                      isDark
                        ? 'bg-[#1a1a1e] border border-white/10 text-zinc-400 group-hover:text-white group-hover:border-white/20'
                        : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                    }`}
                  >
                    <Icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold leading-tight mb-0.5">{label}</p>
                    <p
                      className={`text-[9px] truncate ${
                        isDark ? 'text-zinc-500' : 'text-slate-400'
                      }`}
                    >
                      {sub}
                    </p>
                  </div>
                </button>
              ))}

              <div
                className={`h-px mx-2 my-1.5 ${isDark ? 'bg-[#27272a]' : 'bg-slate-100'}`}
              />

              <button
                onClick={() => {
                  const newIdx = catalog.pages.length;
                  addInteriorPageWithInheritedLayout();
                  setShowAddPageMenu(false);
                  setTimeout(() => {
                    scrollToPageIndex(newIdx);
                  }, 60);
                }}
                className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-[5px] text-left transition-all duration-150 cursor-pointer group border ${
                  isDark
                    ? 'bg-gradient-to-r from-[#8B3DFF]/15 to-[#8B3DFF]/5 hover:from-[#8B3DFF]/25 hover:to-[#8B3DFF]/10 border-[#8B3DFF]/30 hover:border-[#8B3DFF]/60 text-white'
                    : 'bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 border-indigo-200 text-slate-800'
                }`}
              >
                <div className="w-7 h-7 rounded-[4px] bg-[#8B3DFF] flex items-center justify-center shrink-0 shadow-sm shadow-[#8B3DFF]/40">
                  <Sparkles size={14} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold leading-tight mb-0.5">Inherit Structure</p>
                  <p
                    className={`text-[9px] truncate ${
                      isDark ? 'text-purple-300' : 'text-indigo-600'
                    }`}
                  >
                    Clone layout from current page
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

