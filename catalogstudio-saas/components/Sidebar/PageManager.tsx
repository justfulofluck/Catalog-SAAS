
import React, { useState, useRef, useEffect } from 'react';
import { Files, Plus, Trash2, Layout, MoreVertical, BookOpen, FileText, List, Flag, ChevronDown, Copy } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { PageType } from '../../types';

const PageManager: React.FC = () => {
  const { catalog, currentPageIndex, setCurrentPageIndex, addPage, removePage, duplicatePage } = useStore();
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuIndex(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddPage = (type: PageType) => {
    addPage(type);
    setDropdownOpen(false);
  };

  const handleDuplicate = (index: number) => {
    duplicatePage(index);
    setOpenMenuIndex(null);
  };

  const pageTypes: { type: PageType; label: string; icon: React.ReactNode; desc: string }[] = [
    { type: 'cover', label: 'Cover Page', icon: <BookOpen size={16} />, desc: 'Marketing hero section' },
    { type: 'index', label: 'Index Page', icon: <List size={16} />, desc: 'Table of contents' },
    { type: 'interior', label: 'Interior Page', icon: <FileText size={16} />, desc: 'Product grid canvas' },
    { type: 'closing', label: 'Closing Page', icon: <Flag size={16} />, desc: 'Contact & call to action' }
  ];

  return (
    <div className="flex flex-col h-full bg-white border-l w-60 shrink-0 shadow-sm animate-in slide-in-from-right-4 duration-500">
      <div className="p-4 border-b flex items-center justify-between bg-white relative">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Layout size={14} className="text-indigo-600" />
          Blueprint Stack
        </h3>
        
        <div ref={dropdownRef} className="relative">
          <button 
            onClick={() => setDropdownOpen(!isDropdownOpen)}
            className="w-8 h-8 flex items-center justify-center bg-indigo-600 rounded-xl hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
          >
            <Plus size={16} className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-45' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-2xl z-[100] py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
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
      
      <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-slate-50/30 custom-scrollbar">
        {catalog.pages.map((page, index) => (
          <div key={page.id} className="relative group/item">
            <div 
              className={`
                aspect-[1/1.41] bg-white rounded-2xl border-2 transition-all cursor-pointer group relative shadow-sm overflow-hidden
                ${currentPageIndex === index ? 'border-indigo-600 ring-4 ring-indigo-600/5' : 'border-slate-200 hover:border-indigo-200'}
              `}
              onClick={() => setCurrentPageIndex(index)}
            >
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <span className={`text-[10px] font-black uppercase tracking-[0.3em] transition-opacity duration-300 ${currentPageIndex === index ? 'text-indigo-600/10' : 'text-slate-100'}`}>
                   P.{index + 1}
                 </span>
              </div>
              
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 group-hover/item:opacity-100 transition-opacity z-10">
                <button 
                  onClick={(e) => { e.stopPropagation(); removePage(index); }}
                  className="p-2 bg-white/90 backdrop-blur-md shadow-xl rounded-xl hover:text-red-600 text-slate-400 transition-all active:scale-90"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between px-2">
              <div className="flex flex-col">
                <span className={`text-[9px] font-black uppercase tracking-widest ${currentPageIndex === index ? 'text-indigo-600' : 'text-slate-400'}`}>
                  {index === 0 ? 'COVER' : `SECTION ${index}`}
                </span>
                <span className="text-[8px] font-bold text-slate-300 uppercase mt-0.5">Asset Map v3.1</span>
              </div>
              <div className="relative">
                <button 
                  onClick={(e) => { e.stopPropagation(); setOpenMenuIndex(openMenuIndex === index ? null : index); }}
                  className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors cursor-pointer text-slate-300 active:text-indigo-600"
                >
                  <MoreVertical size={12} />
                </button>
                
                {openMenuIndex === index && (
                  <div 
                    ref={menuRef}
                    className="absolute right-0 bottom-full mb-2 w-40 bg-white/90 backdrop-blur-xl border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.1)] rounded-xl z-[110] py-1 animate-in fade-in slide-in-from-bottom-2 duration-200"
                  >
                    <button 
                      onClick={() => handleDuplicate(index)}
                      className="w-full px-3 py-2 flex items-center gap-2 hover:bg-indigo-50 transition-colors text-left group"
                    >
                      <Copy size={12} className="text-slate-400 group-hover:text-indigo-600" />
                      <span className="text-[10px] font-black text-slate-600 group-hover:text-indigo-900 uppercase">Duplicate Page</span>
                    </button>
                    <button 
                      onClick={() => { removePage(index); setOpenMenuIndex(null); }}
                      className="w-full px-3 py-2 flex items-center gap-2 hover:bg-red-50 transition-colors text-left group"
                    >
                      <Trash2 size={12} className="text-slate-400 group-hover:text-red-600" />
                      <span className="text-[10px] font-black text-slate-600 group-hover:text-red-900 uppercase">Delete Page</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t bg-white">
         <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-indigo-600 shrink-0">
               <Files size={14} />
            </div>
            <div className="min-w-0">
               <p className="text-[9px] font-black text-indigo-900 uppercase">Architecture</p>
               <p className="text-[8px] text-indigo-600 font-bold truncate">Total pages: {catalog.pages.length}</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default PageManager;
