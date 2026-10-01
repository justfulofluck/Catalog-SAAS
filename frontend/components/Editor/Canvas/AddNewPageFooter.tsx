import React, { useState, useRef, useEffect } from 'react';
import { Plus, BookOpen, List, FileText, Sparkles } from 'lucide-react';
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

  return (
    <div className="relative z-[500] shrink-0 flex flex-col items-center mb-16" ref={addPageMenuRef}>
      <div className="relative" style={{ width: footerWidth }}>
        <button
          onClick={() => setShowAddPageMenu((prev) => !prev)}
          className={`w-full border-2 border-dashed rounded-[6px] flex items-center justify-center gap-3 py-4 transition-all shadow-sm cursor-pointer ${
            uiTheme === 'dark'
              ? 'border-white/20 hover:border-[#8B3DFF] text-zinc-400 hover:text-white hover:bg-white/5'
              : 'border-slate-300 hover:border-indigo-400 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50'
          }`}
        >
          <Plus size={16} />
          <span className="text-[12px] font-bold uppercase tracking-widest">Add a New Page</span>
        </button>

        {showAddPageMenu && (
          <div
            className={`absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-64 border shadow-[0_20px_50px_rgba(0,0,0,0.8)] rounded-[8px] overflow-hidden z-[600] py-1 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 ${
              uiTheme === 'dark'
                ? 'bg-[#18181b] border-white/20 text-[#f4f4f5]'
                : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <p
              className={`px-4 py-2.5 text-[9px] font-black uppercase tracking-widest border-b ${
                uiTheme === 'dark' ? 'text-zinc-400 border-white/10' : 'text-slate-400 border-slate-100'
              }`}
            >
              Select Page Type
            </p>
            <div className="p-1.5 space-y-0.5">
              {[
                { icon: BookOpen, label: 'Hero Cover', sub: 'cover', type: 'cover' as PageType },
                { icon: List, label: 'Index Page', sub: 'index', type: 'index' as PageType },
                { icon: FileText, label: 'Blank Interior', sub: 'interior', type: 'interior' as PageType },
                { icon: FileText, label: 'Closing Page', sub: 'closing', type: 'closing' as PageType },
              ].map(({ icon: Icon, label, sub, type }) => (
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
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[4px] text-left transition-colors cursor-pointer ${
                    uiTheme === 'dark'
                      ? 'hover:bg-white/10 text-zinc-200 hover:text-white'
                      : 'hover:bg-indigo-50 text-slate-700'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-[4px] flex items-center justify-center shrink-0 ${
                      uiTheme === 'dark' ? 'bg-black/40 border border-white/10' : 'bg-slate-100'
                    }`}
                  >
                    <Icon
                      size={15}
                      className={uiTheme === 'dark' ? 'text-zinc-300' : 'text-slate-500'}
                    />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold leading-none mb-0.5">{label}</p>
                    <p
                      className={`text-[9px] uppercase tracking-wider ${
                        uiTheme === 'dark' ? 'text-zinc-500' : 'text-slate-400'
                      }`}
                    >
                      {sub}
                    </p>
                  </div>
                </button>
              ))}
              <div
                className={`h-px mx-2 my-1 ${uiTheme === 'dark' ? 'bg-white/10' : 'bg-slate-100'}`}
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
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[4px] text-left transition-colors cursor-pointer ${
                  uiTheme === 'dark'
                    ? 'hover:bg-[#8B3DFF]/20 text-zinc-200 hover:text-white'
                    : 'hover:bg-indigo-50 text-slate-700'
                }`}
              >
                <div className="w-8 h-8 rounded-[4px] bg-[#8B3DFF] flex items-center justify-center shrink-0">
                  <Sparkles size={15} className="text-white" />
                </div>
                <div>
                  <p className="text-[11px] font-bold leading-none mb-0.5">Inherit Layout</p>
                  <p
                    className={`text-[9px] uppercase tracking-wider ${
                      uiTheme === 'dark' ? 'text-zinc-400' : 'text-slate-400'
                    }`}
                  >
                    Clone current page
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
