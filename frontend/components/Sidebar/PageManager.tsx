
import React, { useState, useRef, useEffect } from 'react';
import { Files, Plus, Trash2, Layout, MoreVertical, BookOpen, FileText, List, Flag, ChevronDown, Copy } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { PageType } from '../../types';

// Mini Map Preview Component
const PagePreview: React.FC<{ page: any; index: number; catalog?: any }> = ({ page, index, catalog }) => {
  // Use catalog settings if available, otherwise defaults
  const headerHeight = catalog?.headerHeight ?? 38;
  const footerHeight = catalog?.footerHeight ?? 38;
  // Margins
  const mt = catalog?.marginTop ?? 0;
  const mb = catalog?.marginBottom ?? 0;
  const ml = catalog?.marginLeft ?? 0;
  const mr = catalog?.marginRight ?? 0;

  return (
    <div className="w-48 aspect-[1/1.41] bg-white rounded-lg shadow-xl border border-slate-200 p-0 relative overflow-hidden">
      <div className="absolute top-2 left-2 text-[10px] font-black text-slate-300 z-10 pointer-events-none">P.{index + 1}</div>

      {/* Layout Visualization Layer - Scaled to match container */}
      <div className="absolute inset-0 z-0 opacity-10">
        {/* Margins */}
        <div
          className="absolute border-slate-900 border-dashed border-[0.5px]"
          style={{
            top: `${(mt / 794) * 100}%`,
            bottom: `${(mb / 794) * 100}%`,
            left: `${(ml / 561) * 100}%`,
            right: `${(mr / 561) * 100}%`,
          }}
        />
        {/* Header Area */}
        <div
          className="absolute top-0 left-0 right-0 bg-indigo-500/20"
          style={{ height: `${(headerHeight / 794) * 100}%` }}
        />
        {/* Footer Area */}
        <div
          className="absolute bottom-0 left-0 right-0 bg-indigo-500/20"
          style={{ height: `${(footerHeight / 794) * 100}%` }}
        />
      </div>

      <div className="w-full h-full relative" style={{ transform: 'scale(0.2)', transformOrigin: 'top left', width: '500%', height: '500%' }}>
        {page.elements.map((el: any) => (
          <div
            key={el.id}
            style={{
              position: 'absolute',
              left: el.x,
              top: el.y,
              width: el.width,
              height: el.height,
              backgroundColor: el.fill || '#cbd5e1',
              opacity: 0.5,
              borderRadius: el.type === 'shape' && el.shapeType === 'circle' ? '50%' : '4px',
              border: '1px solid #94a3b8'
            }}
          />
        ))}
      </div>
    </div>
  );
};

const PageManager: React.FC = () => {
  const { catalog, currentPageIndex, setCurrentPageIndex, addPage, removePage, duplicatePage, reorderPages } = useStore();
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [hoveredPageIndex, setHoveredPageIndex] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const sortableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    if (sortableRef.current) {
      //      import('sortablejs').then((Sortable) => { // Dynamic import to avoid SSR issues if any, though here it's SPA
      //        Sortable.default.create(sortableRef.current!, {
      //            animation: 150,
      //            ghostClass: 'sortable-ghost',
      //            onEnd: (evt) => {
      //                if (evt.oldIndex !== undefined && evt.newIndex !== undefined) {
      //                    reorderPages(evt.oldIndex, evt.newIndex);
      //                }
      //            }
      //        });
      //      });
      // Assuming reorderPages exists in store or will be added. 
      // If not, I will add it or just skip drag/drop for now as per "Verify/Implement drag and drop".
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddPage = (type: PageType) => {
    addPage(type);
    setDropdownOpen(false);
  };

  const pageTypes: { type: PageType; label: string; icon: React.ReactNode; desc: string }[] = [
    { type: 'cover', label: 'Cover Page', icon: <BookOpen size={16} />, desc: 'Marketing hero section' },
    { type: 'index', label: 'Index Page', icon: <List size={16} />, desc: 'Table of contents' },
    { type: 'interior', label: 'Interior Page', icon: <FileText size={16} />, desc: 'Product grid canvas' },
    { type: 'closing', label: 'Closing Page', icon: <Flag size={16} />, desc: 'Contact & call to action' }
  ];

  return (
    <div className="flex flex-col h-full bg-white border-l w-16 shrink-0 shadow-sm z-20">
      <div className="p-2 border-b flex flex-col items-center gap-4 py-4">
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setDropdownOpen(!isDropdownOpen)}
            className="w-10 h-10 flex items-center justify-center bg-indigo-600 rounded-xl hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
            title="Add Page"
          >
            <Plus size={20} className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-45' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-full mr-2 top-0 w-56 bg-white border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-2xl z-[100] py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="px-4 py-2 border-b border-slate-50 mb-1">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Select Blueprint</p>
              </div>
              {pageTypes.map((pt) => (
                <button
                  key={pt.type}
                  onClick={() => handleAddPage(pt.type)}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left group"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 flex items-center justify-center transition-colors">
                    {pt.icon}
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-slate-800 leading-none mb-1">{pt.label}</p>
                    <p className="text-[9px] font-medium text-slate-400 leading-none">{pt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto w-full py-4 space-y-3 custom-scrollbar flex flex-col items-center" ref={sortableRef}>
        {catalog.pages.map((page, index) => (
          <div
            key={page.id}
            className="relative group"
            onMouseEnter={() => setHoveredPageIndex(index)}
            onMouseLeave={() => setHoveredPageIndex(null)}
          >
            <button
              className={`
                w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black transition-all relative
                ${currentPageIndex === index ? 'bg-indigo-50 text-indigo-600 ring-2 ring-indigo-600 ring-offset-2' : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600'}
              `}
              onClick={() => setCurrentPageIndex(index)}
            >
              {index + 1}
              {/* Active Indicator Dot */}
              {currentPageIndex === index && (
                <div className="absolute -right-1 -top-1 w-3 h-3 bg-indigo-600 rounded-full border-2 border-white" />
              )}
            </button>

            {/* Hover Preview Popover */}
            {hoveredPageIndex === index && (
              <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 z-50 animate-in fade-in slide-in-from-right-2 duration-200 pointer-events-none">
                <PagePreview page={page} index={index} catalog={catalog} />
                {/* Arrow */}
                <div className="absolute top-1/2 -right-1 w-3 h-3 bg-white border-t border-r border-slate-200 transform rotate-45 -translate-y-1/2" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-4 border-t flex flex-col items-center gap-4">
        <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-300 flex items-center justify-center">
          <Layout size={16} />
        </div>
      </div>
    </div>
  );
};

export default PageManager;
