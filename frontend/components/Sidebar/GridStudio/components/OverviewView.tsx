import React from 'react';
import { Plus, SlidersHorizontal, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
import { Catalog, ProductGridSection } from '../../../../types';
import { extractSectionsFromPage } from '../utils/gridDataGenerators';

interface OverviewViewProps {
  catalog: Catalog;
  currentPageIndex: number;
  sections: ProductGridSection[];
  isDark: boolean;
  navigateToPage: (idx: number) => void;
  setViewMode: (mode: 'editor' | 'overview' | 'single-items') => void;
  addInteriorPageWithInheritedLayout: () => void;
  handleMoveSectionToPage: (fromPageIdx: number, toPageIdx: number, secIdx: number) => void;
  handleMoveSection: (secIdx: number, direction: 'up' | 'down') => void;
  swapPageSections: (pageIdx: number, secIdx1: number, secIdx2: number) => void;
  handleDeleteSection: (secIdx: number) => void;
  deletePageSection: (pageIdx: number, secIdx: number) => void;
  setAddCategoryTargetPageIdx: (idx: number | null) => void;
  setShowAddCategoryModal: (show: boolean) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  catalog,
  currentPageIndex,
  sections,
  isDark,
  navigateToPage,
  setViewMode,
  addInteriorPageWithInheritedLayout,
  handleMoveSectionToPage,
  handleMoveSection,
  swapPageSections,
  handleDeleteSection,
  deletePageSection,
  setAddCategoryTargetPageIdx,
  setShowAddCategoryModal
}) => {
  return (
    <div className={`flex-1 overflow-y-auto p-3 space-y-3.5 custom-scrollbar transition-colors ${
      isDark ? 'bg-[#121212]' : 'bg-slate-50'
    }`}>
      <div className={`flex items-center justify-between pb-1 border-b ${
        isDark ? 'border-[#222]' : 'border-slate-200'
      }`}>
        <div>
          <h3 className={`text-[11px] font-black uppercase tracking-wider ${
            isDark ? 'text-[#E2DCC8]' : 'text-slate-900'
          }`}>
            Multi-Page Grid Organizer
          </h3>
          <p className={`text-[8px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            View & arrange grid sections across all catalog pages
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              addInteriorPageWithInheritedLayout();
              navigateToPage(catalog.pages.length);
            }}
            className={`px-2.5 py-1 border rounded text-[9px] font-bold uppercase flex items-center gap-1 transition-all ${
              isDark ? 'bg-[#202020] hover:bg-[#282828] border-[#333] text-[#E2DCC8]' : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 shadow-sm'
            }`}
          >
            <Plus size={11} /> New Page
          </button>
        </div>
      </div>

      {catalog.pages.map((p, pIdx) => {
        const isCurrent = pIdx === currentPageIndex;
        const pSections = pIdx === currentPageIndex ? sections : extractSectionsFromPage(p);
        const isCover = p.type === 'cover' || p.type === 'index' || p.type === 'closing';

        return (
          <div
            key={p.id || pIdx}
            className={`rounded-[6px] border transition-all ${
              isCurrent
                ? (isDark ? 'border-[#0F3D3E] bg-[#161c1d] shadow-lg shadow-[#0F3D3E]/10' : 'border-[#0F3D3E] bg-teal-50/50 shadow-md ring-1 ring-[#0F3D3E]')
                : (isDark ? 'border-[#262626] bg-[#161616] hover:border-[#333]' : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm')
            }`}
          >
            {/* Page Card Header */}
            <div className={`px-3 py-2 border-b flex items-center justify-between ${
              isDark ? 'border-[#222] bg-[#141414]' : 'border-slate-100 bg-slate-50'
            }`}>
              <div className="flex items-center gap-2">
                <span className={`w-5 h-5 rounded-[3px] flex items-center justify-center text-[9px] font-black ${
                  isCurrent 
                    ? (isDark ? 'bg-[#0F3D3E] text-[#E2DCC8]' : 'bg-[#0F3D3E] text-white') 
                    : (isDark ? 'bg-[#252525] text-slate-300' : 'bg-slate-200 text-slate-700')
                }`}>
                  #{pIdx + 1}
                </span>
                <div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider block leading-tight ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    {isCover ? `${p.type.toUpperCase()} PAGE` : `Page ${pIdx + 1}`}
                  </span>
                  <span className={`text-[8px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {isCover ? 'No product grid' : `${pSections.length} / 3 Sections (${pSections.length >= 3 ? 'Full' : `${3 - pSections.length} slots free`})`}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    navigateToPage(pIdx);
                    setViewMode('editor');
                  }}
                  className={`px-2 py-0.5 border rounded text-[8px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all ${
                    isDark ? 'bg-[#0F3D3E]/40 hover:bg-[#0F3D3E] border-[#0F3D3E] text-[#E2DCC8]' : 'bg-teal-50 hover:bg-[#0F3D3E] border-teal-200 text-[#0F3D3E] hover:text-white shadow-xs'
                  }`}
                  title="Edit this page in Grid Studio"
                >
                  <SlidersHorizontal size={9} /> Edit Page
                </button>
              </div>
            </div>

            {/* Page Card Body: Sections List */}
            <div className="p-2.5 space-y-1.5">
              {isCover ? (
                <div className={`py-3 px-2 text-center text-[9px] rounded border ${
                  isDark ? 'text-slate-500 bg-[#111] border-[#222]' : 'text-slate-500 bg-slate-100/50 border-slate-200'
                }`}>
                  Cover & closing pages do not contain standard product grids.
                </div>
              ) : pSections.length === 0 ? (
                <div className={`py-4 px-2 text-center text-[9px] rounded border space-y-1.5 ${
                  isDark ? 'text-slate-500 bg-[#111] border-[#222]' : 'text-slate-500 bg-slate-100/50 border-slate-200'
                }`}>
                  <p>No grid sections on this page.</p>
                  <button
                    type="button"
                    onClick={() => {
                      navigateToPage(pIdx);
                      setViewMode('editor');
                    }}
                    className="px-2.5 py-1 bg-[#0F3D3E] hover:bg-[#155455] text-white rounded text-[8px] font-bold uppercase transition-all"
                  >
                    Edit Page
                  </button>
                </div>
              ) : (
                <>
                  {pSections.map((sec, secIdx) => {
                    return (
                      <div
                        key={sec.id || secIdx}
                        className={`px-2.5 py-1.5 rounded flex items-center justify-between gap-2 border transition-all ${
                          isDark ? 'bg-[#1a1a1a] border-[#2a2a2a] hover:border-[#3a3a3a]' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`w-4 h-4 rounded-[2px] border flex items-center justify-center text-[8px] font-bold shrink-0 ${
                            isDark ? 'bg-[#222] border-[#333] text-[#E2DCC8]' : 'bg-white border-slate-300 text-slate-700 shadow-xs'
                          }`}>
                            {secIdx + 1}
                          </span>
                          {sec.imageSrc ? (
                            <img src={sec.imageSrc} alt="" className={`w-6 h-6 rounded object-contain border p-0.5 shrink-0 ${
                              isDark ? 'bg-[#111] border-[#333]' : 'bg-white border-slate-200'
                            }`} />
                          ) : (
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: sec.titleColor || '#00a651' }} />
                          )}
                          <div className="min-w-0">
                            <p className={`text-[9px] font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`} style={{ color: sec.titleColor || '#00a651' }}>
                              {sec.title || `Section #${secIdx + 1}`}
                            </p>
                            <p className={`text-[7.5px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                              {sec.tableData?.rows?.length || 0} product rows {sec.hasBackground ? '• Stripe' : ''}
                            </p>
                          </div>
                        </div>

                        {/* Quick Section Transfer & Reorder Controls */}
                        <div className="flex items-center gap-1 shrink-0">
                          {/* Move to another page dropdown */}
                          {catalog.pages.length > 1 && (
                            <select
                              value=""
                              onChange={(e) => {
                                const targetP = parseInt(e.target.value, 10);
                                if (!isNaN(targetP)) {
                                  handleMoveSectionToPage(pIdx, targetP, secIdx);
                                }
                              }}
                              className={`px-1.5 py-0.5 border text-[8px] font-bold rounded outline-none cursor-pointer ${
                                isDark ? 'bg-[#242424] border-[#383838] text-[#E2DCC8] hover:border-[#0F3D3E]' : 'bg-white border-slate-200 text-slate-700 hover:border-[#0F3D3E]'
                              }`}
                              title="Move this section to another page"
                            >
                              <option value="" disabled>➔ Move to...</option>
                              {catalog.pages.map((_, optIdx) => {
                                if (optIdx === 0 || optIdx === pIdx) return null; // Skip cover page & current page
                                return (
                                  <option key={optIdx} value={optIdx}>
                                    Page {optIdx + 1}
                                  </option>
                                );
                              })}
                            </select>
                          )}

                          {/* Move Up */}
                          <button
                            type="button"
                            disabled={secIdx === 0}
                            onClick={() => {
                              if (pIdx === currentPageIndex) {
                                handleMoveSection(secIdx, 'up');
                              } else {
                                swapPageSections(pIdx, secIdx, secIdx - 1);
                              }
                            }}
                            className={`p-1 disabled:opacity-20 transition-colors ${
                              isDark ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-800'
                            }`}
                            title="Move Section Up"
                          >
                            <ArrowUp size={11} />
                          </button>

                          {/* Move Down */}
                          <button
                            type="button"
                            disabled={secIdx === pSections.length - 1}
                            onClick={() => {
                              if (pIdx === currentPageIndex) {
                                handleMoveSection(secIdx, 'down');
                              } else {
                                swapPageSections(pIdx, secIdx, secIdx + 1);
                              }
                            }}
                            className={`p-1 disabled:opacity-20 transition-colors ${
                              isDark ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-800'
                            }`}
                            title="Move Section Down"
                          >
                            <ArrowDown size={11} />
                          </button>

                          {/* Delete */}
                          {pSections.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                if (pIdx === currentPageIndex) {
                                  handleDeleteSection(secIdx);
                                } else {
                                  deletePageSection(pIdx, secIdx);
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                              title="Delete Section"
                            >
                              <Trash2 size={11} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Inline Add Category Section button if page has slots free */}
                  {pSections.length < 3 && (
                    <button
                      type="button"
                      onClick={() => {
                        setAddCategoryTargetPageIdx(pIdx);
                        setShowAddCategoryModal(true);
                      }}
                      className={`w-full py-1.5 px-2 rounded border border-dashed text-[8.5px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                        isDark
                          ? 'border-[#2d2d2d] hover:border-[#00a651] bg-[#141414] hover:bg-[#00a651]/10 text-slate-400 hover:text-[#00a651]'
                          : 'border-slate-300 hover:border-[#00a651] bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-[#00a651]'
                      }`}
                    >
                      <Plus size={11} className="text-[#00a651]" /> Add Category to Page {pIdx + 1} ({3 - pSections.length} slots free)
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
