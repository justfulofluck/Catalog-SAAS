import React from 'react';
import { Box, FolderOpen, Package, Check } from 'lucide-react';
import { resolveProductImage } from '../../../utils/imageUtils';
import { CatalogSetupState } from './useCatalogSetup';

export const Phase2Categories: React.FC<CatalogSetupState> = ({
  filteredCategories,
  selectedCategoryIds,
  products,
  toggleCategory,
  isDark
}) => {
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
        <div className="py-24 text-center">
          <Box size={40} className={`mx-auto mb-3 ${isDark ? 'text-[#E2DCC8]/30' : 'text-slate-300'}`} />
          <h3 className={`font-space text-base font-bold ${isDark ? 'text-[#F1F1F1]' : 'text-slate-800'}`}>No matching categories</h3>
          <p className={`text-xs mt-1 ${isDark ? 'text-[#E2DCC8]/60' : 'text-slate-500'}`}>Try another keyword or clear search.</p>
        </div>
      )}
    </div>
  );
};
