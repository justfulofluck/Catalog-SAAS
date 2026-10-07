import React from 'react';
import { Box, FolderOpen, Package, Check, Plus, FolderPlus } from 'lucide-react';
import { resolveProductImage } from '../../../utils/imageUtils';
import { CatalogSetupState } from './useCatalogSetup';

export const Phase2Categories: React.FC<CatalogSetupState> = ({
  filteredCategories,
  selectedCategoryIds,
  products,
  toggleCategory,
  isDark,
  categories,
  setView,
  categorySearch,
  setCategorySearch
}) => {
  const hasNoCategoriesAtAll = !categories || categories.length === 0;

  return (
    <div className="p-8 w-full flex-1">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {filteredCategories.map((cat) => {
          const isSelected = selectedCategoryIds.includes(cat.id);
          const catProducts = products.filter(p => String(p.categoryId) === String(cat.id));
          const catProductCount = catProducts.length;
          const catImg = resolveProductImage(catProducts[0], cat, catProducts);

          return (
            <div
              key={cat.id}
              onClick={() => toggleCategory(cat.id)}
              className={`group rounded-[4px] border transition-all cursor-pointer overflow-hidden flex flex-col relative select-none ${
                isSelected
                  ? 'border-[#0F3D3E] bg-[#0F3D3E]/15 ring-2 ring-[#0F3D3E]/40 shadow-md'
                  : (isDark 
                      ? 'bg-[#141414] border-[#E2DCC8]/15 hover:border-[#E2DCC8]/30 hover:bg-[#171616]' 
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm')
              }`}
            >
              {/* Checkbox at Top Right */}
              <div className="absolute top-2.5 right-2.5 z-10">
                <div className={`w-5 h-5 rounded-[3px] flex items-center justify-center transition-all ${
                  isSelected 
                    ? 'bg-[#0F3D3E] text-white shadow-sm' 
                    : 'bg-black/40 text-transparent border border-white/20 group-hover:bg-[#1c1c1c] group-hover:text-[#E2DCC8]'
                }`}>
                  <Check size={12} strokeWidth={3} />
                </div>
              </div>

              {/* Image Area */}
              <div className={`aspect-[4/3] w-full relative overflow-hidden flex items-center justify-center p-3 border-b ${
                isDark ? 'bg-[#100F0F] border-[#E2DCC8]/10' : 'bg-slate-50 border-slate-100'
              }`}>
                {catImg ? (
                  <img
                    src={catImg}
                    alt={cat.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <FolderOpen size={28} className={isDark ? "text-[#E2DCC8]/30" : "text-slate-300"} />
                )}
              </div>

              {/* Info Area */}
              <div className="p-3 flex flex-col flex-1 justify-between">
                <h3 className={`font-heading text-xs font-semibold truncate transition-colors mb-1.5 ${
                  isDark ? (isSelected ? 'text-[#E2DCC8]' : 'text-[#F1F1F1] group-hover:text-[#E2DCC8]') : (isSelected ? 'text-[#0F3D3E]' : 'text-slate-900 group-hover:text-[#0F3D3E]')
                }`}>
                  {cat.name}
                </h3>

                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono font-medium flex items-center gap-1 ${
                    isDark ? 'text-[#E2DCC8]/60' : 'text-slate-500'
                  }`}>
                    <Package size={11} className={isSelected ? 'text-[#E2DCC8]' : ''} />
                    {catProductCount} {catProductCount === 1 ? 'Product' : 'Products'}
                  </span>

                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color || '#0F3D3E' }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCategories.length === 0 && (
        <div className="py-24 text-center max-w-md mx-auto">
          {hasNoCategoriesAtAll ? (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className={`w-16 h-16 rounded-[6px] border flex items-center justify-center mx-auto ${
                isDark ? 'bg-[#161616] border-[#262626] text-[#E2DCC8]/40' : 'bg-slate-100 border-slate-200 text-slate-400'
              }`}>
                <FolderPlus size={32} />
              </div>
              <div>
                <h3 className={`font-space text-lg font-bold ${isDark ? 'text-[#F1F1F1]' : 'text-slate-900'}`}>
                  No categories found
                </h3>
                <p className={`text-xs mt-1.5 leading-relaxed ${isDark ? 'text-[#E2DCC8]/60' : 'text-slate-500'}`}>
                  You haven't added any product categories to your catalog yet. Create your first category to start organizing your products.
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setView('create-category')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0F3D3E] hover:bg-[#155455] text-white border border-[#E2DCC8]/30 rounded-[4px] font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#0F3D3E]/20 transition-all hover:scale-[1.02] active:scale-95"
                >
                  <Plus size={15} />
                  <span>Create Category</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <Box size={40} className={`mx-auto ${isDark ? 'text-[#E2DCC8]/30' : 'text-slate-300'}`} />
              <h3 className={`font-space text-base font-bold ${isDark ? 'text-[#F1F1F1]' : 'text-slate-800'}`}>
                No matching categories
              </h3>
              <p className={`text-xs ${isDark ? 'text-[#E2DCC8]/60' : 'text-slate-500'}`}>
                No category matches "{categorySearch}". Try another keyword or clear search.
              </p>
              {categorySearch && (
                <button
                  type="button"
                  onClick={() => setCategorySearch('')}
                  className="mt-2 text-xs font-semibold text-[#00E5BF] hover:underline"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
