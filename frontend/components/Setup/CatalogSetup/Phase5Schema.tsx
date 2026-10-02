import React from 'react';
import {
  Table,
  LayoutGrid,
  Sliders,
  RotateCcw,
  Check,
  MoveLeft,
  MoveRight,
  Trash2,
  ChevronRight,
  Eye,
  Settings2,
  Package
} from 'lucide-react';
import { resolveProductImage } from '../../../utils/imageUtils';
import { resolveFieldLabel } from '../../../utils/fieldUtils';
import { CatalogSetupState } from './useCatalogSetup';

export const Phase5Schema: React.FC<CatalogSetupState> = ({
  activeSchemaTab,
  setActiveSchemaTab,
  hasTableCategories,
  hasCardCategories,
  selectedCategoryIds,
  getLayoutForCategory,
  candidateFields,
  selectedHeaders,
  resetHeadersToDefault,
  toggleHeader,
  moveHeader,
  removeHeader,
  tableCategory,
  tableProducts,
  categories,
  cardFields,
  setCardFields,
  cardCategory,
  cardSampleProduct,
  products,
  isDark
}) => {
  return (
    <div className="p-8 w-full space-y-6 flex-1 max-w-none">
      {/* If user has mixed layouts, show Tab Switcher */}
      {hasTableCategories && hasCardCategories && (
        <div className="flex items-center gap-3 border-b pb-3" style={{ borderColor: isDark ? 'rgba(226, 220, 200, 0.15)' : '#e2e8f0' }}>
          <button
            type="button"
            onClick={() => setActiveSchemaTab('table')}
            className={`px-4 py-2 rounded-[4px] font-heading text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all border ${
              activeSchemaTab === 'table'
                ? 'bg-[#0F3D3E] text-white border-[#E2DCC8]/40 shadow-sm'
                : (isDark ? 'bg-[#141414] text-[#888] border-[#222] hover:text-white' : 'bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-900')
            }`}
          >
            <Table size={14} />
            <span>Specification Table Columns</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${activeSchemaTab === 'table' ? 'bg-white/20 text-white' : 'bg-black/20 text-slate-400'}`}>
              {selectedCategoryIds.filter(cid => getLayoutForCategory(cid) === 'table-3grid').length} categories
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSchemaTab('cards')}
            className={`px-4 py-2 rounded-[4px] font-heading text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all border ${
              activeSchemaTab === 'cards'
                ? 'bg-[#0F3D3E] text-white border-[#E2DCC8]/40 shadow-sm'
                : (isDark ? 'bg-[#141414] text-[#888] border-[#222] hover:text-white' : 'bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-900')
            }`}
          >
            <LayoutGrid size={14} />
            <span>Product Card Settings</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${activeSchemaTab === 'cards' ? 'bg-white/20 text-white' : 'bg-black/20 text-slate-400'}`}>
              {selectedCategoryIds.filter(cid => getLayoutForCategory(cid).startsWith('cards-')).length} categories
            </span>
          </button>
        </div>
      )}

      {/* TAB 1: Specification Table Columns Setup */}
      {activeSchemaTab === 'table' && hasTableCategories && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Box 1: Available Product Fields */}
          <div className={`rounded-[4px] border p-6 space-y-4 ${
            isDark ? 'bg-[#141414] border-[#E2DCC8]/15' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`font-space text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
                isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'
              }`}>
                <Sliders size={13} /> Available Product Fields ({candidateFields.length})
              </span>
              
              <div className="flex items-center gap-3">
                <span className={`text-[11px] font-medium font-mono ${isDark ? 'text-[#E2DCC8]/70' : 'text-slate-500'}`}>
                  <strong className={isDark ? 'text-white' : 'text-slate-900'}>{selectedHeaders.length}</strong> columns active
                </span>
                <button
                  type="button"
                  onClick={resetHeadersToDefault}
                  className={`px-3 py-1 border rounded-[4px] text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 ${
                    isDark ? 'bg-[#1a1a1a] hover:bg-[#222] border-[#E2DCC8]/20 text-[#E2DCC8] hover:text-white' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                  }`}
                >
                  <RotateCcw size={11} />
                  <span>Reset Defaults</span>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              {candidateFields.map((field) => {
                const isChecked = selectedHeaders.includes(field);
                return (
                  <button
                    key={field}
                    type="button"
                    onClick={() => toggleHeader(field)}
                    className={`px-4 py-2 rounded-[4px] text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 border ${
                      isChecked
                        ? 'bg-[#0F3D3E] border-[#E2DCC8]/40 text-white shadow-sm'
                        : (isDark 
                            ? 'bg-[#100F0F] border-[#E2DCC8]/15 text-[#E2DCC8]/60 hover:text-white hover:border-[#E2DCC8]/30' 
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900')
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-[3px] flex items-center justify-center text-[10px] ${
                      isChecked 
                        ? 'bg-white text-[#0F3D3E] font-black' 
                        : (isDark ? 'border border-[#444]' : 'border border-slate-300')
                    }`}>
                      {isChecked ? <Check size={11} strokeWidth={3} /> : null}
                    </div>
                    <span>{field}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Box 2: Active Column Sequence (Middle Horizontal Pipeline) */}
          <div className={`rounded-[4px] border p-5 space-y-3.5 ${
            isDark ? 'bg-[#141414] border-[#E2DCC8]/15' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`font-space text-xs font-bold uppercase tracking-wider ${isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'}`}>
                  Active Column Sequence ({selectedHeaders.length})
                </span>
                <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded ${isDark ? 'bg-white/5 text-[#E2DCC8]/60' : 'bg-slate-100 text-slate-500'}`}>
                  Left to Right
                </span>
              </div>
              <span className={`text-[11px] font-mono ${isDark ? 'text-[#E2DCC8]/50' : 'text-slate-400'}`}>
                Use ← → arrows to re-order
              </span>
            </div>

            {/* Horizontal Sequence Flow */}
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              {selectedHeaders.map((hdr, idx) => (
                <React.Fragment key={hdr}>
                  <div
                    className={`px-3 py-1.5 border rounded-[4px] flex items-center gap-2.5 shadow-sm transition-all ${
                      isDark ? 'bg-[#100F0F] border-[#E2DCC8]/20 text-white hover:border-[#E2DCC8]/40' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-[#0F3D3E] text-white text-[9px] font-mono font-bold flex items-center justify-center shrink-0 border border-[#E2DCC8]/30">
                      {idx + 1}
                    </span>
                    <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-[#E2DCC8]' : 'text-slate-800'}`}>
                      {hdr}
                    </span>

                    <div className="flex items-center gap-0.5 pl-1.5 border-l border-white/10">
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={() => moveHeader(idx, 'left')}
                          className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                          title="Move Left"
                        >
                          <MoveLeft size={12} />
                        </button>
                      )}
                      {idx < selectedHeaders.length - 1 && (
                        <button
                          type="button"
                          onClick={() => moveHeader(idx, 'right')}
                          className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                          title="Move Right"
                        >
                          <MoveRight size={12} />
                        </button>
                      )}
                      {selectedHeaders.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeHeader(idx)}
                          className="p-1 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors ml-0.5"
                          title="Remove Column"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Arrow connector between items */}
                  {idx < selectedHeaders.length - 1 && (
                    <ChevronRight size={14} className={isDark ? "text-[#E2DCC8]/30 shrink-0" : "text-slate-300 shrink-0"} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Box 3: Live Table Preview */}
          <div className={`rounded-[4px] border overflow-hidden ${
            isDark ? 'bg-[#141414] border-[#E2DCC8]/15' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className={`px-6 py-3.5 border-b flex items-center justify-between ${
              isDark ? 'bg-[#171616] border-[#E2DCC8]/15' : 'bg-slate-100/90 border-slate-200'
            }`}>
              <span className={`text-xs font-bold uppercase tracking-wider font-heading flex items-center gap-2 ${
                isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'
              }`}>
                <Eye size={14} /> Live Table Preview ({tableCategory?.name || 'Specification Table'})
              </span>
              <span className={`text-[10px] font-mono ${isDark ? 'text-[#E2DCC8]/50' : 'text-slate-500'}`}>
                Preview generated using real category schema
              </span>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className={`border-b ${isDark ? 'bg-[#100F0F] border-[#E2DCC8]/15 text-[#E2DCC8]' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
                    <th className="p-3.5 w-12 text-center font-bold text-[10px]">#</th>
                    {selectedHeaders.map((hdr) => (
                      <th key={hdr} className="p-3.5 font-bold uppercase tracking-wider text-[10px]">
                        {hdr}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-[#E2DCC8]/10' : 'divide-slate-200'}`}>
                  {tableProducts.length > 0 ? (
                    tableProducts.map((p, rIdx) => {
                      const rowCells = selectedHeaders.map(hdr => {
                        const h = hdr.toLowerCase().replace(/[^a-z0-9]/g, '');
                        if (h.includes('model')) {
                          return p.customFields?.model || p.customFields?.model_no || (p as any).modelNo || '-';
                        }
                        if (h.includes('product') || h.includes('name')) {
                          return p.name || '-';
                        }
                        if (h.includes('dealer') && h.includes('price')) {
                          return (p as any).dealerPrice || p.customFields?.dealer_price || p.customFields?.dealerPrice || '-';
                        }
                        if (h.includes('price')) {
                          return p.price ? `${p.currency || '₹'}${p.price}` : '-';
                        }
                        if (h.includes('cut')) {
                          return (p as any).cutOut || p.customFields?.cutOut || p.customFields?.cut_out || '-';
                        }
                        if (h.includes('color') || h.includes('cct')) {
                          return (p as any).color || p.customFields?.color || p.customFields?.cct || '-';
                        }
                        if (h.includes('box')) {
                          return (p as any).packingPerBox || p.customFields?.packing_per_box || '-';
                        }
                        if (h.includes('pack')) {
                          return (p as any).packing || p.customFields?.packing || '-';
                        }
                        if (p.customFields) {
                          for (const [k, v] of Object.entries(p.customFields)) {
                            const label = resolveFieldLabel(k, categories as any, p);
                            if (label && label.toLowerCase().replace(/[^a-z0-9]/g, '') === h) {
                              return String(v);
                            }
                          }
                        }
                        return '-';
                      });

                      return (
                        <tr key={p.id || rIdx} className={isDark ? 'bg-[#100F0F] hover:bg-[#161616]' : 'bg-white hover:bg-slate-50'}>
                          <td className="p-3.5 text-center text-slate-400 font-mono text-[10px]">{rIdx + 1}</td>
                          {rowCells.map((cell, cIdx) => (
                            <td key={cIdx} className="p-3.5 font-medium truncate max-w-[200px]">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      );
                    })
                  ) : (
                    <>
                      <tr className={isDark ? 'bg-[#100F0F]' : 'bg-white'}>
                        <td className="p-3.5 text-center text-slate-400 font-mono text-[10px]">1</td>
                        {selectedHeaders.map((hdr, cIdx) => (
                          <td key={cIdx} className="p-3.5 font-medium text-slate-300">
                            {hdr.includes('MODEL') ? 'VT-101' : (hdr.includes('PRODUCT') ? 'Sample Item' : (hdr.includes('PRICE') ? '₹1200' : '-'))}
                          </td>
                        ))}
                      </tr>
                      <tr className={isDark ? 'bg-[#100F0F]' : 'bg-white'}>
                        <td className="p-3.5 text-center text-slate-400 font-mono text-[10px]">2</td>
                        {selectedHeaders.map((hdr, cIdx) => (
                          <td key={cIdx} className="p-3.5 font-medium text-slate-300">
                            {hdr.includes('MODEL') ? 'VT-102' : (hdr.includes('PRODUCT') ? 'Sample Item' : (hdr.includes('PRICE') ? '₹1450' : '-'))}
                          </td>
                        ))}
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Product Card Settings */}
      {activeSchemaTab === 'cards' && hasCardCategories && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card Display Controls */}
            <div className={`rounded-[4px] border p-6 space-y-5 ${
              isDark ? 'bg-[#141414] border-[#E2DCC8]/15' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="space-y-1">
                <span className={`font-space text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
                  isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'
                }`}>
                  <Settings2 size={13} /> Product Card Field Toggles
                </span>
                <p className={`text-xs ${isDark ? 'text-[#E2DCC8]/60' : 'text-slate-500'}`}>
                  Configure which elements appear on cards in card-grid pages.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {/* Show Title */}
                <div className={`flex items-center justify-between p-3.5 rounded-[4px] border transition-colors ${
                  isDark ? 'bg-[#100F0F] border-[#E2DCC8]/15' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div>
                    <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Display Product Name</h4>
                    <p className={`text-[11px] ${isDark ? 'text-[#E2DCC8]/50' : 'text-slate-500'}`}>Show primary product title on the card</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCardFields(prev => ({ ...prev, showTitle: !prev.showTitle }))}
                    className={`w-10 h-5 rounded-full transition-colors relative ${
                      cardFields.showTitle ? 'bg-[#0F3D3E]' : (isDark ? 'bg-[#333]' : 'bg-slate-300')
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                      cardFields.showTitle ? 'right-1' : 'left-1'
                    }`} />
                  </button>
                </div>

                {/* Show Price */}
                <div className={`flex items-center justify-between p-3.5 rounded-[4px] border transition-colors ${
                  isDark ? 'bg-[#100F0F] border-[#E2DCC8]/15' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div>
                    <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Display Price Tag</h4>
                    <p className={`text-[11px] ${isDark ? 'text-[#E2DCC8]/50' : 'text-slate-500'}`}>Show currency and price badge on card</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCardFields(prev => ({ ...prev, showPrice: !prev.showPrice }))}
                    className={`w-10 h-5 rounded-full transition-colors relative ${
                      cardFields.showPrice ? 'bg-[#0F3D3E]' : (isDark ? 'bg-[#333]' : 'bg-slate-300')
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                      cardFields.showPrice ? 'right-1' : 'left-1'
                    }`} />
                  </button>
                </div>

                {/* Show SKU */}
                <div className={`flex items-center justify-between p-3.5 rounded-[4px] border transition-colors ${
                  isDark ? 'bg-[#100F0F] border-[#E2DCC8]/15' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div>
                    <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Display Model / SKU Code</h4>
                    <p className={`text-[11px] ${isDark ? 'text-[#E2DCC8]/50' : 'text-slate-500'}`}>Show unique item identifier code</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCardFields(prev => ({ ...prev, showSku: !prev.showSku }))}
                    className={`w-10 h-5 rounded-full transition-colors relative ${
                      cardFields.showSku ? 'bg-[#0F3D3E]' : (isDark ? 'bg-[#333]' : 'bg-slate-300')
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                      cardFields.showSku ? 'right-1' : 'left-1'
                    }`} />
                  </button>
                </div>

                {/* Card Theme */}
                <div className={`p-3.5 rounded-[4px] border space-y-2.5 ${
                  isDark ? 'bg-[#100F0F] border-[#E2DCC8]/15' : 'bg-slate-50 border-slate-200'
                }`}>
                  <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Card Visual Style</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCardFields(prev => ({ ...prev, cardTheme: 'classic-stack' }))}
                      className={`py-2 px-3 rounded-[4px] text-xs font-bold uppercase tracking-wider border transition-all ${
                        cardFields.cardTheme === 'classic-stack'
                          ? 'bg-[#0F3D3E] text-white border-[#E2DCC8]/40 shadow-sm'
                          : (isDark ? 'bg-[#181818] border-[#333] text-[#888]' : 'bg-white border-slate-200 text-slate-600')
                      }`}
                    >
                      Classic Clean
                    </button>
                    <button
                      type="button"
                      onClick={() => setCardFields(prev => ({ ...prev, cardTheme: 'editorial-overlay' }))}
                      className={`py-2 px-3 rounded-[4px] text-xs font-bold uppercase tracking-wider border transition-all ${
                        cardFields.cardTheme === 'editorial-overlay'
                          ? 'bg-[#0F3D3E] text-white border-[#E2DCC8]/40 shadow-sm'
                          : (isDark ? 'bg-[#181818] border-[#333] text-[#888]' : 'bg-white border-slate-200 text-slate-600')
                      }`}
                    >
                      Dark Luxe
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Card Preview */}
            <div className={`rounded-[4px] border p-6 flex flex-col justify-between ${
              isDark ? 'bg-[#141414] border-[#E2DCC8]/15' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`font-space text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                    isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'
                  }`}>
                    <Eye size={13} /> Live Product Card Preview
                  </span>
                  <span className={`text-[10px] font-mono ${isDark ? 'text-[#E2DCC8]/50' : 'text-slate-500'}`}>
                    {cardCategory?.name || 'Card Layout Category'}
                  </span>
                </div>

                {/* Mockup Card Box */}
                <div className="flex justify-center p-6 bg-slate-900/50 rounded-[4px] border border-white/5">
                  <div className={`w-64 rounded-[6px] border p-4 shadow-xl space-y-3 transition-all ${
                    cardFields.cardTheme === 'editorial-overlay' 
                      ? 'bg-[#0f172a] text-white border-slate-700' 
                      : 'bg-white text-slate-900 border-slate-200'
                  }`}>
                    {/* Image */}
                    <div className="aspect-[4/3] w-full rounded-[4px] overflow-hidden bg-slate-100 flex items-center justify-center p-2">
                      {cardSampleProduct ? (
                        <img
                          src={resolveProductImage(cardSampleProduct, cardCategory, products)}
                          alt={cardSampleProduct.name || 'Sample'}
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <Package size={32} className="text-slate-400" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="space-y-1.5">
                      {cardFields.showSku && (
                        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block">
                          {cardSampleProduct?.sku || (cardSampleProduct?.customFields as any)?.model_no || 'VT-2026-X'}
                        </span>
                      )}
                      {cardFields.showTitle && (
                        <h5 className="font-heading text-sm font-bold truncate">
                          {cardSampleProduct?.name || 'Architectural Spotlight'}
                        </h5>
                      )}
                      {cardFields.showPrice && (
                        <div className="pt-1 flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-emerald-500">
                            {cardSampleProduct?.price ? `${cardSampleProduct.currency || '₹'}${cardSampleProduct.price}` : '₹1,450.00'}
                          </span>
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                            In Stock
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <p className={`text-[11px] text-center mt-4 font-mono ${isDark ? 'text-[#E2DCC8]/40' : 'text-slate-400'}`}>
                Card styling dynamically applied to all {selectedCategoryIds.filter(cid => getLayoutForCategory(cid).startsWith('cards-')).length} card-layout categories
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
