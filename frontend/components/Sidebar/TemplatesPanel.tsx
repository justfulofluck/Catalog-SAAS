
import React, { useState } from 'react';
import { 
  LayoutTemplate, Check, Info, BookOpen, 
  List, Flag, X, ArrowUpToLine, ArrowDownToLine, Grid3X3
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { 
  COVER_TEMPLATES, GRID_TEMPLATES, 
  INDEX_TEMPLATES, CLOSING_TEMPLATES, HEADER_TEMPLATES, FOOTER_TEMPLATES 
} from '../../constants';

type TemplateCategory = 'headers' | 'grids' | 'footers' | 'covers' | 'toc_outro';

const TemplatesPanel: React.FC = () => {
  const { 
    catalog, currentPageIndex, 
    applyCoverTemplate, applyIndexTemplate, applyClosingTemplate, 
    applyInventoryLayout, applyHeaderTemplate, applyFooterTemplate, 
    uiTheme, setEditorTab 
  } = useStore();

  const [activeCategory, setActiveCategory] = useState<TemplateCategory>('headers');
  const [appliedId, setAppliedId] = useState<string | null>(null);

  const isDark = uiTheme === 'dark';
  const currentPage = catalog.pages[currentPageIndex] || null;

  const triggerFeedback = (id: string) => {
    setAppliedId(id);
    setTimeout(() => setAppliedId(null), 1600);
  };

  const categories = [
    { id: 'headers', label: 'Header', icon: ArrowUpToLine, desc: 'Top banners & branding' },
    { id: 'grids', label: 'Body Grids', icon: Grid3X3, desc: 'Product table & cards' },
    { id: 'footers', label: 'Footer', icon: ArrowDownToLine, desc: 'Bottom specs & page num' },
    { id: 'covers', label: 'Covers', icon: BookOpen, desc: 'Front hero showcases' },
    { id: 'toc_outro', label: 'TOC / Outro', icon: List, desc: 'Index & closing page' },
  ];

  return (
    <div className={`flex flex-col h-full w-full shrink-0 relative transition-colors ${isDark ? 'bg-[#0f172a]' : 'bg-white'}`}>
      
      {/* Top Header */}
      <div className={`p-4 border-b shrink-0 ${isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-100'}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md">
              <LayoutTemplate size={13} />
            </div>
            <div>
              <h3 className={`text-xs font-black uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Template Studio
              </h3>
              <p className="text-[9px] text-slate-400 font-medium">Modular Page Outfits</p>
            </div>
          </div>
          <button
            onClick={() => setEditorTab(null)}
            className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-400'}`}
          >
            <X size={14} />
          </button>
        </div>

        {/* Category Pill Navigation */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-800">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as TemplateCategory)}
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-lg text-[10px] font-black transition-all ${
                  isActive
                    ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
                title={cat.desc}
              >
                <Icon size={13} className="mb-0.5" />
                <span className="truncate max-w-full text-[9px] tracking-tight">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Templates Content Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3 custom-scrollbar">

        {/* 1. HEADERS SECTION */}
        {activeCategory === 'headers' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Master Headers</span>
              <span className="text-[9px] bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 font-bold px-1.5 py-0.5 rounded">All Interior Pages</span>
            </div>

            {HEADER_TEMPLATES.map((tmpl) => (
              <div
                key={tmpl.id}
                onClick={() => {
                  applyHeaderTemplate(tmpl);
                  triggerFeedback(tmpl.id);
                }}
                className={`group cursor-pointer rounded-xl border transition-all p-3 shadow-sm hover:shadow-md relative overflow-hidden ${
                  isDark ? 'bg-slate-900 border-slate-800 hover:border-indigo-500' : 'bg-white border-slate-200 hover:border-indigo-600'
                }`}
              >
                {/* Visual Header Mockup */}
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 mb-2 font-mono text-[9px] text-slate-700 dark:text-slate-300 truncate">
                  {tmpl.previewText}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className={`text-xs font-black ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{tmpl.name}</h4>
                    <p className="text-[9px] text-slate-400 mt-0.5 leading-tight">{tmpl.description}</p>
                  </div>
                  {appliedId === tmpl.id ? (
                    <span className="flex items-center gap-1 text-[9px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-1 rounded-full animate-in zoom-in-50">
                      <Check size={11} /> Applied
                    </span>
                  ) : (
                    <span className="text-[9px] font-black uppercase tracking-wider text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">Apply</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 2. BODY GRIDS SECTION */}
        {activeCategory === 'grids' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Product Grid Outfits</span>
              <span className="text-[9px] bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 font-bold px-1.5 py-0.5 rounded">Product Pages Only</span>
            </div>

            {currentPage && (currentPage.type === 'cover' || currentPage.type === 'intro' || currentPage.type === 'index' || currentPage.type === 'closing') ? (
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-center space-y-2 my-2">
                <Info size={20} className="text-amber-600 mx-auto" />
                <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                  Body Grids cannot be applied to a <strong>{currentPage.type.toUpperCase()}</strong> page.
                </p>
                <p className="text-[10px] text-amber-700 dark:text-amber-300">
                  Please select a <strong>Product Page</strong> from the Pages panel to change its grid layout.
                </p>
              </div>
            ) : (
              GRID_TEMPLATES.map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => {
                    applyInventoryLayout(currentPageIndex, tmpl);
                    triggerFeedback(tmpl.id);
                  }}
                  className={`group cursor-pointer rounded-xl border transition-all p-3 shadow-sm hover:shadow-md ${
                    isDark ? 'bg-slate-900 border-slate-800 hover:border-indigo-500' : 'bg-white border-slate-200 hover:border-indigo-600'
                  }`}
                >
                  {/* Mini Visual Grid Box */}
                  <div className="aspect-[16/7] rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 mb-2 p-2 flex items-center justify-center">
                    <div className="grid gap-1 w-full h-full" style={{ gridTemplateColumns: `repeat(${tmpl.cols}, minmax(0, 1fr))` }}>
                      {Array.from({ length: Math.min(tmpl.cols * tmpl.rows, 6) }).map((_, i) => (
                        <div key={i} className="bg-indigo-100 dark:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800 rounded-sm flex items-center justify-center">
                          <span className="text-[7px] text-indigo-700 dark:text-indigo-300 font-bold">Item {i+1}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className={`text-xs font-black ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{tmpl.name}</h4>
                      <span className="text-[9px] font-bold text-slate-400">{tmpl.cols} Columns × {tmpl.rows} Rows</span>
                    </div>
                    {appliedId === tmpl.id ? (
                      <span className="flex items-center gap-1 text-[9px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-1 rounded-full">
                        <Check size={11} /> Applied
                      </span>
                    ) : (
                      <span className="text-[9px] font-black uppercase tracking-wider text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">Apply</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 3. FOOTERS SECTION */}
        {activeCategory === 'footers' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Master Footers</span>
              <span className="text-[9px] bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 font-bold px-1.5 py-0.5 rounded">All Interior Pages</span>
            </div>

            {FOOTER_TEMPLATES.map((tmpl) => (
              <div
                key={tmpl.id}
                onClick={() => {
                  applyFooterTemplate(tmpl);
                  triggerFeedback(tmpl.id);
                }}
                className={`group cursor-pointer rounded-xl border transition-all p-3 shadow-sm hover:shadow-md relative overflow-hidden ${
                  isDark ? 'bg-slate-900 border-slate-800 hover:border-indigo-500' : 'bg-white border-slate-200 hover:border-indigo-600'
                }`}
              >
                {/* Visual Footer Mockup */}
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 mb-2 font-mono text-[9px] text-slate-700 dark:text-slate-300 truncate">
                  {tmpl.previewText}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className={`text-xs font-black ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{tmpl.name}</h4>
                    <p className="text-[9px] text-slate-400 mt-0.5 leading-tight">{tmpl.description}</p>
                  </div>
                  {appliedId === tmpl.id ? (
                    <span className="flex items-center gap-1 text-[9px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-1 rounded-full">
                      <Check size={11} /> Applied
                    </span>
                  ) : (
                    <span className="text-[9px] font-black uppercase tracking-wider text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">Apply</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 4. COVERS SECTION */}
        {activeCategory === 'covers' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Front Cover Showcase</span>
              <span className="text-[9px] bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 font-bold px-1.5 py-0.5 rounded">Cover Pages Only</span>
            </div>

            {currentPage && currentPage.type !== 'cover' && currentPage.type !== 'blank' ? (
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-center space-y-2 my-2">
                <Info size={20} className="text-amber-600 mx-auto" />
                <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                  Cover Templates cannot be applied to a <strong>{currentPage.type.toUpperCase()}</strong> page.
                </p>
                <p className="text-[10px] text-amber-700 dark:text-amber-300">
                  Please select a <strong>Cover Page</strong> (Page 1) or a Blank Page.
                </p>
              </div>
            ) : (
              COVER_TEMPLATES.map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => {
                    applyCoverTemplate(currentPageIndex, tmpl);
                    triggerFeedback(tmpl.id);
                  }}
                  className={`group cursor-pointer rounded-xl border transition-all p-3 shadow-sm hover:shadow-md ${
                    isDark ? 'bg-slate-900 border-slate-800 hover:border-indigo-500' : 'bg-white border-slate-200 hover:border-indigo-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className={`text-xs font-black ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{tmpl.name}</h4>
                    {appliedId === tmpl.id ? (
                      <span className="flex items-center gap-1 text-[9px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                        <Check size={10} /> Applied
                      </span>
                    ) : (
                      <BookOpen size={13} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                    )}
                  </div>
                  <p className="text-[9px] text-slate-400 leading-normal">{tmpl.description}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* 5. TOC & OUTRO SECTION */}
        {activeCategory === 'toc_outro' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">TOC & Closing Templates</span>
              <span className="text-[9px] bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 font-bold px-1.5 py-0.5 rounded">Index / Closing Pages</span>
            </div>

            {currentPage && currentPage.type !== 'index' && currentPage.type !== 'closing' && currentPage.type !== 'blank' ? (
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-center space-y-2 my-2">
                <Info size={20} className="text-amber-600 mx-auto" />
                <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                  Index & Outro templates cannot be applied to a <strong>{currentPage.type.toUpperCase()}</strong> page.
                </p>
                <p className="text-[10px] text-amber-700 dark:text-amber-300">
                  Please select an <strong>Index Page</strong> or <strong>Closing Page</strong> from the Pages panel.
                </p>
              </div>
            ) : (
              <>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-1">Table of Contents</span>
                {INDEX_TEMPLATES.map((tmpl) => (
                  <div
                    key={tmpl.id}
                    onClick={() => {
                      applyIndexTemplate(currentPageIndex, tmpl);
                      triggerFeedback(tmpl.id);
                    }}
                    className={`group cursor-pointer rounded-xl border transition-all p-3 shadow-sm hover:shadow-md ${
                      isDark ? 'bg-slate-900 border-slate-800 hover:border-indigo-500' : 'bg-white border-slate-200 hover:border-indigo-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={`text-xs font-black ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{tmpl.name}</h4>
                      <List size={13} className="text-slate-400 group-hover:text-indigo-600" />
                    </div>
                    <p className="text-[9px] text-slate-400 leading-tight">{tmpl.description}</p>
                  </div>
                ))}

                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-1 block pt-2">Closing & Contact Page</span>
                {CLOSING_TEMPLATES.map((tmpl) => (
                  <div
                    key={tmpl.id}
                    onClick={() => {
                      applyClosingTemplate(currentPageIndex, tmpl);
                      triggerFeedback(tmpl.id);
                    }}
                    className={`group cursor-pointer rounded-xl border transition-all p-3 shadow-sm hover:shadow-md ${
                      isDark ? 'bg-slate-900 border-slate-800 hover:border-indigo-500' : 'bg-white border-slate-200 hover:border-indigo-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={`text-xs font-black ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{tmpl.name}</h4>
                      <Flag size={13} className="text-slate-400 group-hover:text-indigo-600" />
                    </div>
                    <p className="text-[9px] text-slate-400 leading-tight">{tmpl.description}</p>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

      </div>

      {/* Footer Info / Tip */}
      <div className={`p-3 border-t shrink-0 ${isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
        <div className="flex items-center gap-2">
          <Info size={13} className="text-indigo-600 shrink-0" />
          <p className="text-[8.5px] font-semibold text-slate-500 dark:text-slate-400 leading-tight">
            Click any modular piece to update Header, Body or Footer across your catalog.
          </p>
        </div>
      </div>

    </div>
  );
};

export default TemplatesPanel;

