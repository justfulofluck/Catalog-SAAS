import React from 'react';
import { Search, Sparkles, Check, SlidersHorizontal } from 'lucide-react';
import { CatalogSetupState } from './useCatalogSetup';
import { LAYOUT_OPTIONS } from './constants';

export const Phase3Layouts: React.FC<CatalogSetupState> = ({
  defaultLayoutId,
  setDefaultLayoutId,
  selectedCategoryIds,
  categoryLayoutOverrides,
  layoutCategoryFilter,
  setLayoutCategoryFilter,
  selectedCategoriesList,
  products,
  getLayoutForCategory,
  setCategoryOverride,
  isDark
}) => {
  return (
    <div className="p-8 w-full space-y-8 flex-1 max-w-7xl mx-auto">
      {/* Part A: Master Default Catalog Layout */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className={`px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded-full border inline-block mb-1.5 ${
              isDark ? 'bg-[#0F3D3E]/20 text-[#E2DCC8] border-[#0F3D3E]/40' : 'bg-[#0F3D3E]/10 text-[#0F3D3E] border-[#0F3D3E]/30'
            }`}>
              Global Master Theme
            </span>
            <h2 className={`font-space text-xl sm:text-2xl font-bold tracking-tight ${isDark ? 'text-[#F1F1F1]' : 'text-slate-900'}`}>
              Choose Default Publication Layout
            </h2>
            <p className={`text-xs ${isDark ? 'text-[#E2DCC8]/60' : 'text-slate-500'}`}>
              This layout will automatically apply across all categories, unless customized below.
            </p>
          </div>
        </div>

        {/* Layout Option Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {LAYOUT_OPTIONS.map((layout) => {
            const Icon = layout.icon;
            const isSelected = defaultLayoutId === layout.id;

            return (
              <div
                key={layout.id}
                onClick={() => setDefaultLayoutId(layout.id)}
                className={`rounded-[6px] border p-5 cursor-pointer transition-all flex flex-col justify-between relative group ${
                  isSelected
                    ? 'bg-[#0F3D3E]/20 border-[#0F3D3E] ring-2 ring-[#0F3D3E]/50 shadow-lg'
                    : (isDark 
                        ? 'bg-[#141414] border-[#E2DCC8]/15 hover:border-[#E2DCC8]/30 hover:bg-[#181818]' 
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm')
                }`}
              >
                {/* Check badge */}
                <div className="absolute top-4 right-4">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                    isSelected 
                      ? 'bg-[#0F3D3E] text-white shadow-sm border border-[#E2DCC8]/40' 
                      : (isDark ? 'border border-[#333] text-transparent' : 'border border-slate-200 text-transparent')
                  }`}>
                    <Check size={11} strokeWidth={3} />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-[5px] flex items-center justify-center ${
                      isSelected 
                        ? 'bg-[#0F3D3E] text-[#E2DCC8]' 
                        : (isDark ? 'bg-[#1c1c1c] text-slate-400 group-hover:text-white' : 'bg-slate-100 text-slate-700')
                    }`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider block font-mono ${
                        isSelected ? 'text-[#E2DCC8]' : (isDark ? 'text-[#E2DCC8]/60' : 'text-slate-500')
                      }`}>
                        {layout.badge}
                      </span>
                      <h3 className={`font-space text-sm font-bold ${
                        isSelected ? (isDark ? 'text-white' : 'text-[#0F3D3E]') : (isDark ? 'text-[#F1F1F1]' : 'text-slate-900')
                      }`}>
                        {layout.name}
                      </h3>
                    </div>
                  </div>

                  <p className={`text-xs leading-relaxed ${isDark ? 'text-[#E2DCC8]/70' : 'text-slate-600'}`}>
                    {layout.description}
                  </p>
                </div>

                <div className={`mt-4 pt-3 border-t text-[11px] font-medium flex items-center gap-1.5 ${
                  isDark ? 'border-[#E2DCC8]/10 text-[#E2DCC8]/50' : 'border-slate-100 text-slate-500'
                }`}>
                  <Sparkles size={12} className={isSelected ? 'text-[#E2DCC8]' : 'text-slate-400'} />
                  <span className="truncate">Best for: {layout.recommendedFor}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Part B: Category-Level Layout Overrides (Option B) */}
      <div className={`rounded-[6px] border p-6 space-y-5 ${
        isDark ? 'bg-[#141414] border-[#E2DCC8]/15' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className={`font-space text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'
              }`}>
                <SlidersHorizontal size={13} /> Category Layout Assignments ({selectedCategoryIds.length})
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                Object.keys(categoryLayoutOverrides).length > 0 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                  : (isDark ? 'bg-white/5 text-[#E2DCC8]/60' : 'bg-slate-100 text-slate-500')
              }`}>
                {Object.keys(categoryLayoutOverrides).length} Overridden
              </span>
            </div>
            <p className={`text-xs ${isDark ? 'text-[#E2DCC8]/60' : 'text-slate-500'}`}>
              Optionally override the layout for specific categories that need a different visual style.
            </p>
          </div>

          {/* Filter categories */}
          <div className="relative w-56">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-[#E2DCC8]/50' : 'text-slate-400'}`} size={12} />
            <input
              type="text"
              placeholder="Filter selected categories..."
              value={layoutCategoryFilter}
              onChange={(e) => setLayoutCategoryFilter(e.target.value)}
              className={`w-full border rounded-[4px] pl-8 pr-3 py-1.5 text-xs outline-none ${
                isDark ? 'bg-[#100F0F] border-[#E2DCC8]/20 text-white placeholder-[#E2DCC8]/40' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            />
          </div>
        </div>

        {/* Table / List of Selected Categories */}
        <div className="divide-y max-h-[360px] overflow-y-auto custom-scrollbar border rounded-[4px] overflow-hidden"
          style={{ borderColor: isDark ? 'rgba(226, 220, 200, 0.1)' : '#e2e8f0' }}
        >
          {selectedCategoriesList.map((cat) => {
            const isOverridden = Boolean(categoryLayoutOverrides[cat.id]);
            const catProducts = products.filter(p => String(p.categoryId) === String(cat.id));

            return (
              <div
                key={cat.id}
                className={`p-3.5 flex flex-wrap items-center justify-between gap-3 transition-colors ${
                  isDark ? 'bg-[#100F0F] hover:bg-[#161616]' : 'bg-white hover:bg-slate-50'
                }`}
              >
                {/* Left: Category info */}
                <div className="flex items-center gap-3 min-w-[200px]">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color || '#0F3D3E' }} />
                  <div>
                    <h4 className={`text-xs font-bold font-heading ${isDark ? 'text-[#F1F1F1]' : 'text-slate-800'}`}>
                      {cat.name}
                    </h4>
                    <span className={`text-[10px] font-mono ${isDark ? 'text-[#E2DCC8]/50' : 'text-slate-400'}`}>
                      {catProducts.length} {catProducts.length === 1 ? 'Product' : 'Products'}
                    </span>
                  </div>
                </div>

                {/* Right: Layout Pill Selector */}
                <div className="flex items-center gap-2">
                  {/* Inherit Default Master button */}
                  <button
                    type="button"
                    onClick={() => setCategoryOverride(cat.id, 'inherit')}
                    className={`px-2.5 py-1 rounded-[4px] text-[10px] font-bold uppercase tracking-wider border transition-all ${
                      !isOverridden
                        ? 'bg-[#0F3D3E] text-white border-[#E2DCC8]/40 shadow-sm'
                        : (isDark ? 'bg-[#181818] border-[#333] text-[#888] hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-900')
                    }`}
                    title={`Inherit Master Layout (${LAYOUT_OPTIONS.find(l => l.id === defaultLayoutId)?.name})`}
                  >
                    Default ({LAYOUT_OPTIONS.find(l => l.id === defaultLayoutId)?.name.split(' ')[0]})
                  </button>

                  {/* Direct layout options */}
                  {LAYOUT_OPTIONS.map((lo) => {
                    const isLoActive = isOverridden && categoryLayoutOverrides[cat.id] === lo.id;
                    return (
                      <button
                        key={lo.id}
                        type="button"
                        onClick={() => setCategoryOverride(cat.id, lo.id)}
                        className={`px-2.5 py-1 rounded-[4px] text-[10px] font-bold uppercase tracking-wider border transition-all flex items-center gap-1 ${
                          isLoActive
                            ? 'bg-[#0F3D3E] text-[#E2DCC8] border-[#E2DCC8]/40 shadow-sm'
                            : (isDark ? 'bg-[#181818] border-[#333] text-[#888] hover:text-[#E2DCC8]' : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-900')
                        }`}
                      >
                        <span>{lo.name.replace('Modern ', '').replace('Compact ', '')}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
