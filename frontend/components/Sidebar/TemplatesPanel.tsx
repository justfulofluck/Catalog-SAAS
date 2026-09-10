
import React, { useState } from 'react';
import { 
  LayoutTemplate, Check, Info, BookOpen, 
  List, Flag, X, ArrowUpToLine, ArrowDownToLine, Grid3X3,
  Plus, Sparkles, Edit3, Trash2
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { 
  COVER_TEMPLATES, GRID_TEMPLATES, 
  INDEX_TEMPLATES, CLOSING_TEMPLATES, HEADER_TEMPLATES, FOOTER_TEMPLATES 
} from '../../constants';

type TemplateCategory = 'headers' | 'grids' | 'footers' | 'covers' | 'toc_outro';

interface TemplatesPanelProps {
  hideHeader?: boolean;
}

const TemplatesPanel: React.FC<TemplatesPanelProps> = ({ hideHeader = false }) => {
  const { 
    catalog, currentPageIndex, 
    applyCoverTemplate, applyIndexTemplate, applyClosingTemplate, 
    applyInventoryLayout, applyHeaderTemplate, applyFooterTemplate, 
    systemTemplates,
    setIsHeaderDesignerOpen,
    setIsFooterDesignerOpen,
    deleteSystemTemplate,
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
    <div className={`flex flex-col h-full w-full shrink-0 relative font-sans transition-colors ${
      isDark ? 'bg-[#161616] text-white' : 'bg-white text-slate-800'
    }`}>
      
      {/* Top Header - hidden when embedded in PagesPanel tabs */}
      {!hideHeader && (
        <div className={`h-14 px-3 py-2 border-b shrink-0 flex items-center justify-between transition-colors ${
          isDark ? 'bg-[#161616] border-[#262626]' : 'bg-white border-slate-100'
        }`}>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-[4px] bg-[#0F3D3E] flex items-center justify-center text-white shadow-sm">
              <LayoutTemplate size={13} />
            </div>
            <div>
              <h3 className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Template Studio
              </h3>
              <p className={`text-[8px] font-medium ${isDark ? 'text-[#888]' : 'text-slate-500'}`}>Modular Page Outfits</p>
            </div>
          </div>
          <button
            onClick={() => setEditorTab(null)}
            className={`p-1 rounded-[4px] transition-colors ${
              isDark ? 'hover:bg-[#262626] text-[#888] hover:text-white' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-800'
            }`}
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Category Pill Navigation */}
      <div className={`p-2 border-b shrink-0 transition-colors ${
        isDark ? 'bg-[#141414] border-[#262626]' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className={`grid grid-cols-5 gap-1 p-0.5 rounded-[4px] border ${
          isDark ? 'bg-[#101010] border-[#262626]' : 'bg-slate-200/60 border-slate-200'
        }`}>
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as TemplateCategory)}
                className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-[3px] text-[9px] font-bold transition-all ${
                  isActive
                    ? 'bg-[#0F3D3E] text-white shadow-sm'
                    : (isDark ? 'text-[#888] hover:text-white' : 'text-slate-600 hover:text-slate-900')
                }`}
                title={cat.desc}
              >
                <Icon size={12} className="mb-0.5" />
                <span className="truncate max-w-full tracking-tight">{cat.label}</span>
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

            {/* Custom Header Studio Button */}
            <button
              onClick={() => setIsHeaderDesignerOpen(true)}
              className="w-full flex items-center justify-center gap-2 p-2.5 bg-gradient-to-r from-[#0F3D3E] to-[#144f51] hover:from-[#134d4f] hover:to-[#175b5d] text-[#E2DCC8] border border-[#E2DCC8]/30 rounded-[4px] text-xs font-bold shadow-sm transition-all"
            >
              <Plus size={14} />
              <span>Design Custom Header</span>
            </button>

            {/* Dynamic Custom Headers from Admin / User */}
            {systemTemplates.filter(st => st.is_active && st.type === 'header').map((tmpl) => {
              const headerElements = tmpl.pages_data?.[0]?.elements || [];
              const headerHeight = tmpl.pages_data?.[0]?.height || 113.4;
              const headerObj = {
                id: `sys-hdr-${tmpl.id}`,
                name: tmpl.name,
                description: tmpl.description || tmpl.category,
                type: 'header' as const,
                height: headerHeight,
                previewText: tmpl.name,
                elements: headerElements
              };

              return (
                <div
                  key={`sys-hdr-${tmpl.id}`}
                  onClick={() => {
                    applyHeaderTemplate(headerObj);
                    triggerFeedback(`sys-hdr-${tmpl.id}`);
                  }}
                  className={`group cursor-pointer rounded-[4px] border-2 border-indigo-500/50 transition-all p-3 shadow-sm hover:shadow-md relative overflow-hidden ${
                    isDark ? 'bg-slate-900 hover:border-indigo-400' : 'bg-indigo-50/20 hover:border-indigo-600'
                  }`}
                >
                  <div className="p-2 rounded-[4px] bg-indigo-50/60 dark:bg-slate-950 border border-indigo-200/50 dark:border-slate-800 mb-2 flex items-center justify-between">
                    <span className="font-mono text-[9px] text-slate-700 dark:text-slate-300 truncate font-semibold">
                      {tmpl.name}
                    </span>
                    <span className="text-[9px] text-[#888] font-mono">
                      {Math.round(headerHeight / 3.78)}mm
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                        <h4 className={`text-xs font-black ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{tmpl.name}</h4>
                      </div>
                      <p className="text-[9px] text-slate-400 mt-0.5 leading-tight">{tmpl.description || tmpl.category}</p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Edit in Studio */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsHeaderDesignerOpen(true, tmpl);
                        }}
                        className="p-1 rounded bg-[#1c1c1f] hover:bg-[#28282c] border border-[#333] text-slate-300 hover:text-white transition-colors"
                        title="Edit in Header Designer"
                      >
                        <Edit3 size={12} />
                      </button>

                      {/* Delete Custom Header */}
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (window.confirm(`Delete "${tmpl.name}" header template?`)) {
                            await deleteSystemTemplate(tmpl.id);
                          }
                        }}
                        className="p-1 rounded bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-400 hover:text-rose-300 transition-colors"
                        title="Delete Template"
                      >
                        <Trash2 size={12} />
                      </button>

                      {appliedId === `sys-hdr-${tmpl.id}` ? (
                        <span className="flex items-center gap-1 text-[9px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-1 rounded-full animate-in zoom-in-50">
                          <Check size={11} /> Applied
                        </span>
                      ) : (
                        <span className="text-[8px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">Custom</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Built-in Constants Headers */}
            {HEADER_TEMPLATES.map((tmpl) => (
              <div
                key={tmpl.id}
                onClick={() => {
                  applyHeaderTemplate(tmpl);
                  triggerFeedback(tmpl.id);
                }}
                className={`group cursor-pointer rounded-[4px] border transition-all p-2.5 relative overflow-hidden ${
                  isDark ? 'bg-[#141414] border-[#262626] hover:border-[#0F3D3E] hover:bg-[#1a1a1a]' : 'bg-white border-slate-200 hover:border-[#0F3D3E]'
                }`}
              >
                {/* Visual Header Mockup */}
                <div className={`p-2 rounded-[3px] border mb-2 font-mono text-[9px] truncate ${isDark ? 'bg-[#101010] border-[#262626] text-[#aaa]' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                  {tmpl.previewText}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className={`text-[11px] font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{tmpl.name}</h4>
                    <p className="text-[8px] text-[#888] mt-0.5 leading-tight">{tmpl.description}</p>
                  </div>
                  {appliedId === tmpl.id ? (
                    <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-[3px]">
                      <Check size={11} /> Applied
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#E2DCC8] opacity-0 group-hover:opacity-100 transition-opacity">Apply</span>
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
              <div className="p-4 rounded-[4px] bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-center space-y-2 my-2">
                <Info size={20} className="text-amber-600 mx-auto" />
                <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                  Body Grids cannot be applied to a <strong>{currentPage.type.toUpperCase()}</strong> page.
                </p>
                <p className="text-[10px] text-amber-700 dark:text-amber-300">
                  Please select a <strong>Product Page</strong> from the Pages panel to change its grid layout.
                </p>
              </div>
            ) : (
              <>
                {/* Dynamic Admin Custom Grids */}
                {systemTemplates.filter(st => st.is_active && st.type === 'product_grid' && st.grid_data).map((tmpl) => {
                  const g = tmpl.grid_data || {};
                  const gridObj = {
                    id: `sys-grid-${tmpl.id}`,
                    name: tmpl.name,
                    cols: g.cols || 2,
                    rows: g.rows || 2,
                    padding: g.padding || 40,
                    spacing: g.spacing || 20,
                    arrangement: g.arrangement || 'stacked',
                    group: tmpl.category || 'Custom',
                    cardTheme: g.cardTheme || 'classic-stack',
                    backgroundColor: g.backgroundColor || '#ffffff'
                  };

                  return (
                    <div
                      key={`sys-grid-${tmpl.id}`}
                      onClick={() => {
                        applyInventoryLayout(currentPageIndex, gridObj as any);
                        triggerFeedback(`sys-grid-${tmpl.id}`);
                      }}
                      className={`group cursor-pointer rounded-[4px] border-2 border-indigo-500/50 transition-all p-3 shadow-sm hover:shadow-md relative overflow-hidden ${
                        isDark ? 'bg-slate-900 hover:border-indigo-400' : 'bg-indigo-50/20 hover:border-indigo-600'
                      }`}
                    >
                      {/* Mini Visual Grid Box */}
                      <div className="aspect-[16/7] rounded-[4px] bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 mb-2 p-2 flex items-center justify-center">
                        <div className="grid gap-1 w-full h-full" style={{ gridTemplateColumns: `repeat(${gridObj.cols}, minmax(0, 1fr))` }}>
                          {Array.from({ length: Math.min(gridObj.cols * gridObj.rows, 6) }).map((_, i) => (
                            <div key={i} className="bg-indigo-200 dark:bg-indigo-800/60 border border-indigo-300 dark:border-indigo-700 rounded-sm flex items-center justify-center">
                              <span className="text-[7px] text-indigo-800 dark:text-indigo-200 font-bold">Item {i+1}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                            <h4 className={`text-xs font-black ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{tmpl.name}</h4>
                          </div>
                          <span className="text-[9px] font-bold text-slate-400">{gridObj.cols} Cols × {gridObj.rows} Rows</span>
                        </div>
                        {appliedId === `sys-grid-${tmpl.id}` ? (
                          <span className="flex items-center gap-1 text-[9px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-1 rounded-full">
                            <Check size={11} /> Applied
                          </span>
                        ) : (
                          <span className="text-[8px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">Custom</span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Built-in Constants Grids */}
                {GRID_TEMPLATES.map((tmpl) => (
                  <div
                    key={tmpl.id}
                    onClick={() => {
                      applyInventoryLayout(currentPageIndex, tmpl);
                      triggerFeedback(tmpl.id);
                    }}
                    className={`group cursor-pointer rounded-[4px] border transition-all p-3 shadow-sm hover:shadow-md ${
                      isDark ? 'bg-slate-900 border-slate-800 hover:border-indigo-500' : 'bg-white border-slate-200 hover:border-indigo-600'
                    }`}
                  >
                    {/* Mini Visual Grid Box */}
                    <div className="aspect-[16/7] rounded-[4px] bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 mb-2 p-2 flex items-center justify-center">
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
                ))}
              </>
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

            {/* Custom Footer Studio Button */}
            <button
              onClick={() => setIsFooterDesignerOpen(true)}
              className="w-full flex items-center justify-center gap-2 p-2.5 bg-gradient-to-r from-[#0F3D3E] to-[#144f51] hover:from-[#134d4f] hover:to-[#175b5d] text-[#E2DCC8] border border-[#E2DCC8]/30 rounded-[4px] text-xs font-bold shadow-sm transition-all"
            >
              <Plus size={14} />
              <span>Design Custom Footer</span>
            </button>

            {/* Dynamic Custom Footers from Admin */}
            {systemTemplates.filter(st => st.is_active && st.type === 'footer').map((tmpl) => {
              const footerElements = tmpl.pages_data?.[0]?.elements || [];
              const footerHeight = tmpl.pages_data?.[0]?.height || 75.6;
              const footerObj = {
                id: `sys-ftr-${tmpl.id}`,
                name: tmpl.name,
                description: tmpl.description || tmpl.category,
                type: 'footer' as const,
                height: footerHeight,
                previewText: tmpl.name,
                elements: footerElements
              };

              return (
                <div
                  key={`sys-ftr-${tmpl.id}`}
                  onClick={() => {
                    applyFooterTemplate(footerObj);
                    triggerFeedback(`sys-ftr-${tmpl.id}`);
                  }}
                  className={`group cursor-pointer rounded-[4px] border-2 border-indigo-500/50 transition-all p-3 shadow-sm hover:shadow-md relative overflow-hidden ${
                    isDark ? 'bg-slate-900 hover:border-indigo-400' : 'bg-indigo-50/20 hover:border-indigo-600'
                  }`}
                >
                  <div className="p-2.5 rounded-[4px] bg-indigo-50/60 dark:bg-slate-950 border border-indigo-200/50 dark:border-slate-800 mb-2 font-mono text-[9px] text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span className="truncate font-semibold">{tmpl.name} (Custom Footer)</span>
                    <span className="text-[9px] text-[#888] font-mono shrink-0 ml-2">
                      {Math.round(footerHeight / 3.78)}mm
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                        <h4 className={`text-xs font-black ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{tmpl.name}</h4>
                      </div>
                      <p className="text-[9px] text-slate-400 mt-0.5 leading-tight">{tmpl.description || tmpl.category}</p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Edit in Studio */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsFooterDesignerOpen(true, tmpl);
                        }}
                        className="p-1 rounded bg-[#1c1c1f] hover:bg-[#28282c] border border-[#333] text-slate-300 hover:text-white transition-colors"
                        title="Edit in Footer Designer"
                      >
                        <Edit3 size={12} />
                      </button>

                      {/* Delete Custom Footer */}
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (window.confirm(`Delete custom footer "${tmpl.name}"?`)) {
                            await deleteSystemTemplate(tmpl.id);
                          }
                        }}
                        className="p-1 rounded bg-[#1c1c1f] hover:bg-rose-950/60 border border-[#333] text-slate-400 hover:text-rose-400 transition-colors"
                        title="Delete Footer"
                      >
                        <Trash2 size={12} />
                      </button>

                      {appliedId === `sys-ftr-${tmpl.id}` ? (
                        <span className="flex items-center gap-1 text-[9px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-1 rounded-full animate-in zoom-in-50">
                          <Check size={11} /> Applied
                        </span>
                      ) : (
                        <span className="text-[8px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">Custom</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Built-in Constants Footers */}
            {FOOTER_TEMPLATES.map((tmpl) => (
              <div
                key={tmpl.id}
                onClick={() => {
                  applyFooterTemplate(tmpl);
                  triggerFeedback(tmpl.id);
                }}
                className={`group cursor-pointer rounded-[4px] border transition-all p-3 shadow-sm hover:shadow-md relative overflow-hidden ${
                  isDark ? 'bg-slate-900 border-slate-800 hover:border-indigo-500' : 'bg-white border-slate-200 hover:border-indigo-600'
                }`}
              >
                {/* Visual Footer Mockup */}
                <div className="p-2.5 rounded-[4px] bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 mb-2 font-mono text-[9px] text-slate-700 dark:text-slate-300 truncate">
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
              <div className="p-4 rounded-[4px] bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-center space-y-2 my-2">
                <Info size={20} className="text-amber-600 mx-auto" />
                <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                  Cover Templates cannot be applied to a <strong>{currentPage.type.toUpperCase()}</strong> page.
                </p>
                <p className="text-[10px] text-amber-700 dark:text-amber-300">
                  Please select a <strong>Cover Page</strong> (Page 1) or a Blank Page.
                </p>
              </div>
            ) : (
              <>
                {/* Dynamic Admin Templates */}
                {systemTemplates.filter(st => st.is_active && (st.type === 'cover' || st.type === 'full_catalog')).map((tmpl) => (
                  <div
                    key={`sys-${tmpl.id}`}
                    onClick={() => {
                      const pageElements = tmpl.pages_data?.[0]?.elements || [];
                      applyCoverTemplate(currentPageIndex, {
                        id: `sys-${tmpl.id}`,
                        name: tmpl.name,
                        description: tmpl.description || tmpl.category,
                        elements: pageElements
                      });
                      triggerFeedback(`sys-${tmpl.id}`);
                    }}
                    className={`group cursor-pointer rounded-[4px] border-2 border-indigo-500/50 transition-all p-3 shadow-sm hover:shadow-md relative overflow-hidden ${
                      isDark ? 'bg-slate-900 hover:border-indigo-400' : 'bg-indigo-50/20 hover:border-indigo-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                        <h4 className={`text-xs font-black ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{tmpl.name}</h4>
                      </div>
                      {appliedId === `sys-${tmpl.id}` ? (
                        <span className="flex items-center gap-1 text-[9px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                          <Check size={10} /> Applied
                        </span>
                      ) : (
                        <span className="text-[8px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">Custom</span>
                      )}
                    </div>
                    <p className="text-[9px] text-slate-400 leading-normal">{tmpl.description || tmpl.category}</p>
                  </div>
                ))}

                {/* Built-in Constants Templates */}
                {COVER_TEMPLATES.map((tmpl) => (
                  <div
                    key={tmpl.id}
                    onClick={() => {
                      applyCoverTemplate(currentPageIndex, tmpl);
                      triggerFeedback(tmpl.id);
                    }}
                    className={`group cursor-pointer rounded-[4px] border transition-all p-3 shadow-sm hover:shadow-md ${
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
                ))}
              </>
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
              <div className="p-4 rounded-[4px] bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-center space-y-2 my-2">
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
                    className={`group cursor-pointer rounded-[4px] border transition-all p-3 shadow-sm hover:shadow-md ${
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
                    className={`group cursor-pointer rounded-[4px] border transition-all p-3 shadow-sm hover:shadow-md ${
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

