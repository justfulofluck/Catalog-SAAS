
import React, { useState } from 'react';
import { LayoutTemplate, Check, Info, Sparkles, BookOpen, Lock, LayoutGrid, Layout, Layers, BookCheck, List, Flag } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { COVER_TEMPLATES, GRID_TEMPLATES, FULL_CATALOG_TEMPLATES, INDEX_TEMPLATES, CLOSING_TEMPLATES } from '../../constants';

const TemplatesPanel: React.FC = () => {
  const { catalog, currentPageIndex, applyCoverTemplate, applyIndexTemplate, applyClosingTemplate, applyInventoryLayout, applyFullCatalogTemplate } = useStore();
  const [activeTab, setActiveTab] = useState<'global' | 'local'>('global');

  const currentPage = catalog.pages[currentPageIndex];
  const isCoverPage = currentPage?.type === 'cover';
  const isIndexPage = currentPage?.type === 'index';
  const isClosingPage = currentPage?.type === 'closing';
  const isInteriorPage = currentPage?.type === 'interior';

  const renderInventoryPreview = (tmpl: any) => {
    const isStacked = tmpl.arrangement === 'stacked';
    const isRow = tmpl.arrangement === 'row';
    const isRowReverse = tmpl.arrangement === 'row-reverse';

    return (
      <div className="w-full h-full rounded-xl overflow-hidden transform group-hover:scale-105 transition-transform bg-white border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-2 gap-2">
        <div className={`grid gap-2 w-full h-full p-1`} style={{ gridTemplateColumns: `repeat(${tmpl.cols}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${tmpl.rows}, minmax(0, 1fr))` }}>
          {Array.from({ length: tmpl.cols * tmpl.rows }).map((_, i) => (
            <div key={i} className={`flex gap-1 border border-slate-50 rounded-sm ${isStacked ? 'flex-col' : 'flex-row'} ${isRowReverse ? 'flex-row-reverse' : ''}`}>
               <div className={`${isStacked ? 'w-full h-3/5' : 'w-2/5 h-full'} bg-indigo-100 rounded-sm shrink-0`} />
               <div className={`flex flex-col gap-0.5 justify-center ${isStacked ? 'p-0.5' : 'px-0.5'} overflow-hidden`}>
                  <div className="h-1 w-full bg-slate-100 rounded-full" />
                  <div className="h-1 w-2/3 bg-slate-100 rounded-full" />
               </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white border-r w-[300px] shrink-0 z-10 shadow-sm animate-in slide-in-from-left-4 relative">
      <div className="p-6 border-b bg-white">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
          <LayoutTemplate size={14} className="text-indigo-600" />
          Template Studio
        </h3>
        
        <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100">
           <button 
            onClick={() => setActiveTab('global')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'global' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
           >
             <BookCheck size={14} /> Full Designs
           </button>
           <button 
            onClick={() => setActiveTab('local')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'local' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
           >
             <Layers size={14} /> Layouts
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar relative">
        {activeTab === 'global' ? (
          FULL_CATALOG_TEMPLATES.map((tmpl) => (
            <button 
              key={tmpl.id}
              onClick={() => applyFullCatalogTemplate(tmpl.id)}
              className="w-full text-left rounded-3xl border border-slate-100 transition-all overflow-hidden group bg-white hover:border-indigo-600 hover:shadow-2xl hover:shadow-slate-200/50"
            >
              <div className="aspect-video bg-slate-50 relative overflow-hidden">
                <img src={tmpl.thumbnail} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" alt={tmpl.name} />
                <div className="absolute inset-0 bg-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              <div className="p-4 border-t border-slate-50">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-xs font-black text-slate-800">{tmpl.name}</h4>
                  <Sparkles size={12} className="text-indigo-400" />
                </div>
                <p className="text-[9px] font-medium text-slate-400 leading-tight">
                  {tmpl.description}
                </p>
                <div className="flex gap-1 mt-3">
                   {Array.from({ length: tmpl.pages.length }).map((_, i) => (
                     <div key={i} className="w-1 h-1 rounded-full bg-slate-200" />
                   ))}
                   <span className="text-[7px] font-black text-slate-300 uppercase ml-1">{tmpl.pages.length} PAGES</span>
                </div>
              </div>
            </button>
          ))
        ) : (
          <>
            <div className="px-2 mb-2 flex items-center justify-between">
               <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                 {isCoverPage && 'Cover Blueprints'}
                 {isIndexPage && 'Index Themes'}
                 {isClosingPage && 'Closing Themes'}
                 {isInteriorPage && 'Grid Arrangements'}
               </p>
               {currentPage && (
                 <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-[8px] font-black uppercase tracking-widest">{currentPage.type}</span>
               )}
            </div>

            {isCoverPage && COVER_TEMPLATES.map((tmpl) => (
                <button 
                  key={tmpl.id}
                  onClick={() => applyCoverTemplate(currentPageIndex, tmpl)}
                  className="w-full text-left rounded-2xl border border-slate-100 transition-all group bg-white hover:border-indigo-600 p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-black text-slate-800">{tmpl.name}</h4>
                    <BookOpen size={14} className="text-slate-300 group-hover:text-indigo-600" />
                  </div>
                  <p className="text-[9px] font-medium text-slate-400 leading-tight">{tmpl.description}</p>
                </button>
            ))}

            {isIndexPage && INDEX_TEMPLATES.map((tmpl) => (
                <button 
                  key={tmpl.id}
                  onClick={() => applyIndexTemplate(currentPageIndex, tmpl)}
                  className="w-full text-left rounded-2xl border border-slate-100 transition-all group bg-white hover:border-indigo-600 p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-black text-slate-800">{tmpl.name}</h4>
                    <List size={14} className="text-slate-300 group-hover:text-indigo-600" />
                  </div>
                  <p className="text-[9px] font-medium text-slate-400 leading-tight">{tmpl.description}</p>
                </button>
            ))}

            {isClosingPage && CLOSING_TEMPLATES.map((tmpl) => (
                <button 
                  key={tmpl.id}
                  onClick={() => applyClosingTemplate(currentPageIndex, tmpl)}
                  className="w-full text-left rounded-2xl border border-slate-100 transition-all group bg-white hover:border-indigo-600 p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-black text-slate-800">{tmpl.name}</h4>
                    <Flag size={14} className="text-slate-300 group-hover:text-indigo-600" />
                  </div>
                  <p className="text-[9px] font-medium text-slate-400 leading-tight">{tmpl.description}</p>
                </button>
            ))}

            {isInteriorPage && GRID_TEMPLATES.map((tmpl) => (
                <button 
                  key={tmpl.id}
                  onClick={() => applyInventoryLayout(currentPageIndex, tmpl)}
                  className="w-full text-left rounded-2xl border border-slate-100 transition-all overflow-hidden group bg-white hover:border-indigo-600 hover:shadow-xl"
                >
                  <div className="aspect-[4/3] bg-slate-50 flex items-center justify-center p-4">
                    {renderInventoryPreview(tmpl)}
                  </div>
                  <div className="p-4 border-t border-slate-50">
                    <h4 className="text-xs font-black text-slate-800">{tmpl.name}</h4>
                  </div>
                </button>
            ))}
          </>
        )}
      </div>

      <div className="p-6 border-t bg-slate-50/50">
        <div className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <Info size={16} className="text-indigo-600 shrink-0 mt-0.5" />
          <p className="text-[9px] font-bold text-slate-500 leading-relaxed uppercase tracking-tighter">
            {activeTab === 'global' 
              ? "Applying a Full Design replaces your entire document structure."
              : "Layouts only affect the geometry of elements on the current page type."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TemplatesPanel;
