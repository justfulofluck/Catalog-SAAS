
import React from 'react';
import { LayoutTemplate, Check, Info, Sparkles, BookOpen, Lock, LayoutGrid, Layout, Layers, BookCheck, List, Flag, X } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { COVER_TEMPLATES, GRID_TEMPLATES, FULL_CATALOG_TEMPLATES, INDEX_TEMPLATES, CLOSING_TEMPLATES } from '../../constants';

const TemplatesPanel: React.FC = () => {
  const { catalog, selectedPageIndex, applyCoverTemplate, applyIndexTemplate, applyClosingTemplate, applyInventoryLayout, uiTheme, setEditorTab } = useStore();

  const isGlobalMode = selectedPageIndex === null;
  const currentPage = !isGlobalMode ? catalog.pages[selectedPageIndex as number] : null;

  const isCoverPage = isGlobalMode || currentPage?.type === 'cover';
  const isIndexPage = isGlobalMode || currentPage?.type === 'index';
  const isClosingPage = isGlobalMode || currentPage?.type === 'closing';
  const isInteriorPage = isGlobalMode || currentPage?.type === 'interior';

  const renderInventoryPreview = (tmpl: any) => {
    const isStacked = tmpl.arrangement === 'stacked';
    const isRow = tmpl.arrangement === 'row';
    const isRowReverse = tmpl.arrangement === 'row-reverse';

    return (
      <div className={`w-full h-full rounded-xl overflow-hidden transform group-hover:scale-105 transition-transform border-2 border-dashed flex flex-col items-center justify-center p-2 gap-2 ${uiTheme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className={`grid gap-2 w-full h-full p-1`} style={{ gridTemplateColumns: `repeat(${tmpl.cols}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${tmpl.rows}, minmax(0, 1fr))` }}>
          {Array.from({ length: tmpl.cols * tmpl.rows }).map((_, i) => (
            <div key={i} className={`flex gap-1 border rounded-sm ${isStacked ? 'flex-col' : 'flex-row'} ${isRowReverse ? 'flex-row-reverse' : ''} ${uiTheme === 'dark' ? 'border-slate-700' : 'border-slate-50'}`}>
              <div className={`${isStacked ? 'w-full h-3/5' : 'w-2/5 h-full'} rounded-sm shrink-0 ${uiTheme === 'dark' ? 'bg-indigo-500/30' : 'bg-indigo-100'}`} />
              <div className={`flex flex-col gap-0.5 justify-center ${isStacked ? 'p-0.5' : 'px-0.5'} overflow-hidden`}>
                <div className={`h-1 w-full rounded-full ${uiTheme === 'dark' ? 'bg-slate-700' : 'bg-slate-100'}`} />
                <div className={`h-1 w-2/3 rounded-full ${uiTheme === 'dark' ? 'bg-slate-700' : 'bg-slate-100'}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`flex flex-col h-full border-r w-[300px] shrink-0 z-10 shadow-sm animate-in slide-in-from-left-4 relative transition-colors ${uiTheme === 'dark' ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
      <div className={`p-6 border-b transition-colors ${uiTheme === 'dark' ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${uiTheme === 'dark' ? 'text-white' : 'text-slate-400'}`}>
            <LayoutTemplate size={14} className={uiTheme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'} />
            Template Studio
          </h3>
          <button
            onClick={() => setEditorTab(null)}
            className={`p-1.5 rounded-lg transition-colors ${uiTheme === 'dark' ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-400'}`}
          >
            <X size={14} />
          </button>
        </div>

        <div className={`flex items-center justify-center p-2 rounded-xl border border-dashed ${isGlobalMode ? (uiTheme === 'dark' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-100') : (uiTheme === 'dark' ? 'bg-indigo-500/5 border-indigo-500/30' : 'bg-indigo-50 border-indigo-100')}`}>
          <Layers size={14} className={isGlobalMode ? "text-emerald-500 mr-2" : "text-indigo-500 mr-2"} />
          <span className={`text-[10px] font-bold uppercase tracking-widest ${isGlobalMode ? 'text-emerald-600' : 'text-indigo-600'}`}>
            {isGlobalMode ? 'Global Catalog Mode' : 'Single Page Layout'}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar relative">
        <>
          <div className="px-2 mb-2 flex items-center justify-between">
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
              Available Designs
            </p>
            {!isGlobalMode && currentPage && (
              <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${uiTheme === 'dark' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-50 text-indigo-600'}`}>{currentPage.type}</span>
            )}
            {isGlobalMode && (
              <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${uiTheme === 'dark' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-50 text-emerald-600'}`}>Full Catalog</span>
            )}
          </div>

          {isCoverPage && (
            <div className="space-y-4">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-2">Cover Designs</p>
              {COVER_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => applyCoverTemplate(selectedPageIndex, tmpl)}
                  className={`w-full text-left rounded-2xl border transition-all group p-4 shadow-sm ${uiTheme === 'dark' ? 'bg-slate-900 border-slate-800 hover:border-indigo-500' : 'bg-white border-slate-100 hover:border-indigo-600'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`text-xs font-black ${uiTheme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{tmpl.name}</h4>
                    <BookOpen size={14} className={`group-hover:text-indigo-600 ${uiTheme === 'dark' ? 'text-slate-600' : 'text-slate-300'}`} />
                  </div>
                  <p className="text-[9px] font-medium text-slate-400 leading-tight">{tmpl.description}</p>
                </button>
              ))}
            </div>
          )}

          {isIndexPage && (
            <div className="space-y-4">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-2">Table of Contents</p>
              {INDEX_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => applyIndexTemplate(selectedPageIndex, tmpl)}
                  className={`w-full text-left rounded-2xl border transition-all group p-4 shadow-sm ${uiTheme === 'dark' ? 'bg-slate-900 border-slate-800 hover:border-indigo-500' : 'bg-white border-slate-100 hover:border-indigo-600'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`text-xs font-black ${uiTheme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{tmpl.name}</h4>
                    <List size={14} className={`group-hover:text-indigo-600 ${uiTheme === 'dark' ? 'text-slate-600' : 'text-slate-300'}`} />
                  </div>
                  <p className="text-[9px] font-medium text-slate-400 leading-tight">{tmpl.description}</p>
                </button>
              ))}
            </div>
          )}

          {isInteriorPage && (
            <div className="space-y-4">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-2">Product Grid Layouts</p>
              {GRID_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => applyInventoryLayout(selectedPageIndex, tmpl)}
                  className={`w-full text-left rounded-2xl border transition-all overflow-hidden group hover:shadow-xl ${uiTheme === 'dark' ? 'bg-slate-900 border-slate-800 hover:border-indigo-500' : 'bg-white border-slate-100 hover:border-indigo-600'}`}
                >
                  <div className={`aspect-[4/3] flex items-center justify-center p-4 ${uiTheme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'}`}>
                    {renderInventoryPreview(tmpl)}
                  </div>
                  <div className={`p-4 border-t ${uiTheme === 'dark' ? 'border-slate-800' : 'border-slate-50'}`}>
                    <h4 className={`text-xs font-black ${uiTheme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{tmpl.name}</h4>
                  </div>
                </button>
              ))}
            </div>
          )}

          {isClosingPage && (
            <div className="space-y-4">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-2">Closing Styles</p>
              {CLOSING_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => applyClosingTemplate(selectedPageIndex, tmpl)}
                  className={`w-full text-left rounded-2xl border transition-all group p-4 shadow-sm ${uiTheme === 'dark' ? 'bg-slate-900 border-slate-800 hover:border-indigo-500' : 'bg-white border-slate-100 hover:border-indigo-600'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`text-xs font-black ${uiTheme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{tmpl.name}</h4>
                    <Flag size={14} className={`group-hover:text-indigo-600 ${uiTheme === 'dark' ? 'text-slate-600' : 'text-slate-300'}`} />
                  </div>
                  <p className="text-[9px] font-medium text-slate-400 leading-tight">{tmpl.description}</p>
                </button>
              ))}
            </div>
          )}
        </>
      </div>

      <div className={`p-6 border-t ${uiTheme === 'dark' ? 'bg-[#0f172a] border-slate-800' : 'bg-slate-50/50 border-slate-200'}`}>
        <div className={`flex items-start gap-3 p-4 rounded-2xl border shadow-sm ${uiTheme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <Info size={16} className="text-indigo-600 shrink-0 mt-0.5" />
          <p className="text-[9px] font-bold text-slate-500 leading-relaxed uppercase tracking-tighter">
            {isGlobalMode ? 'Applying a template here will update every relevant page in the entire catalog.' : 'Templates reflow products automatically and preserve your catalog content.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TemplatesPanel;
