import React from 'react';
import { Package, CheckCircle2, Search, X, Sliders } from 'lucide-react';
import { Product, Category } from '../../../../types';
import { normalizeImageUrl } from '../../../../utils/imageUtils';

interface SingleItemsViewProps {
  isDark: boolean;
  currentPageIndex: number;
  filteredSingleProducts: Product[];
  singleItemFeedback: string | null;
  singleSearch: string;
  setSingleSearch: (val: string) => void;
  singleCategoryFilter: string;
  setSingleCategoryFilter: (val: string) => void;
  products: Product[];
  categories: Category[];
  handleAddSingleCard: (product: Product) => void;
  openProductPropertiesCustomizer: (product: Product) => void;
}

export const SingleItemsView: React.FC<SingleItemsViewProps> = ({
  isDark,
  currentPageIndex,
  filteredSingleProducts,
  singleItemFeedback,
  singleSearch,
  setSingleSearch,
  singleCategoryFilter,
  setSingleCategoryFilter,
  products,
  categories,
  handleAddSingleCard,
  openProductPropertiesCustomizer
}) => {
  return (
    <div className={`flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar transition-colors ${
      isDark ? 'bg-[#121212]' : 'bg-slate-50'
    }`}>
      {/* Header banner */}
      <div className={`flex items-center justify-between pb-3 border-b ${
        isDark ? 'border-[#222]' : 'border-slate-200'
      }`}>
        <div>
          <div className="flex items-center gap-2">
            <h3 className={`text-[12px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
              isDark ? 'text-[#E2DCC8]' : 'text-slate-900'
            }`}>
              <Package size={14} className="text-[#00a651]" /> Single Product Placement
            </h3>
            <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border ${
              isDark ? 'bg-[#0F3D3E] text-[#E2DCC8] border-[#E2DCC8]/20' : 'bg-teal-50 text-[#0F3D3E] border-teal-200'
            }`}>
              Target: Page {currentPageIndex + 1}
            </span>
          </div>
          <p className={`text-[9px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Drop individual cards, images, or spec tables onto Page {currentPageIndex + 1} without altering existing page layout.
          </p>
        </div>

        {/* Quick count badge */}
        <div className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded border ${
          isDark ? 'text-[#E2DCC8]/80 bg-[#181818] border-[#2a2a2a]' : 'text-slate-700 bg-white border-slate-200 shadow-xs'
        }`}>
          {filteredSingleProducts.length} items
        </div>
      </div>

      {/* Feedback Toast */}
      {singleItemFeedback && (
        <div className="p-2.5 rounded bg-[#0F3D3E] border border-[#00a651]/50 text-[#F1F1F1] text-xs font-semibold flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-[#00a651] shrink-0" />
            <span>{singleItemFeedback}</span>
          </div>
          <span className="text-[9px] text-[#E2DCC8] uppercase tracking-wider font-mono bg-black/30 px-2 py-0.5 rounded">Added</span>
        </div>
      )}

      {/* Search Bar & Category Chips */}
      <div className="space-y-2.5">
        {/* Search Input */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={singleSearch}
            onChange={(e) => setSingleSearch(e.target.value)}
            placeholder="Search products by title, SKU, description..."
            className={`w-full border rounded-[4px] pl-9 pr-8 py-2 text-xs outline-none transition-colors ${
              isDark 
                ? 'bg-[#181818] border-[#333] focus:border-[#0F3D3E] text-[#F1F1F1] placeholder:text-slate-500' 
                : 'bg-white border-slate-200 focus:border-[#0F3D3E] text-slate-900 placeholder:text-slate-400 shadow-xs'
            }`}
          />
          {singleSearch && (
            <button
              type="button"
              onClick={() => setSingleSearch('')}
              className={`absolute right-2.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-700'}`}
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
          <button
            type="button"
            onClick={() => setSingleCategoryFilter('all')}
            className={`px-2.5 py-1 rounded-[3px] text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
              singleCategoryFilter === 'all'
                ? 'bg-[#0F3D3E] text-[#E2DCC8] border border-[#E2DCC8]/40 shadow-sm'
                : (isDark ? 'bg-[#181818] text-slate-400 border border-[#2a2a2a] hover:text-white hover:bg-[#202020]' : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900 hover:bg-slate-100 shadow-xs')
            }`}
          >
            All Categories ({products.length})
          </button>

          {categories.map((cat) => {
            const catCount = products.filter(p => String(p.categoryId) === String(cat.id)).length;
            const isSelected = singleCategoryFilter === String(cat.id);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSingleCategoryFilter(String(cat.id))}
                className={`px-2.5 py-1 rounded-[3px] text-[10px] font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#0F3D3E] text-[#E2DCC8] border border-[#E2DCC8]/40 shadow-sm'
                    : (isDark ? 'bg-[#181818] text-slate-400 border border-[#2a2a2a] hover:text-white hover:bg-[#202020]' : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900 hover:bg-slate-100 shadow-xs')
                }`}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color || '#00a651' }}
                />
                <span>{cat.name}</span>
                <span className="text-[9px] opacity-60 font-mono">({catCount})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Grid of Single Items */}
      {filteredSingleProducts.length === 0 ? (
        <div className={`py-12 text-center border border-dashed rounded-[6px] ${
          isDark ? 'border-[#262626] bg-[#161616]/40' : 'border-slate-200 bg-white/60'
        }`}>
          <Package size={28} className={`mx-auto mb-2 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
          <p className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>No products match your search</p>
          <p className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Try searching with a different keyword or selecting 'All Categories'.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filteredSingleProducts.map((product) => {
            const cat = categories.find(c => String(c.id) === String(product.categoryId));
            const imgUrl = normalizeImageUrl(
              product.image ||
              (product.customFields && Object.values(product.customFields).find(v => typeof v === 'string' && (v.startsWith('/media') || v.startsWith('http')))) as string ||
              ''
            );
            const hasVariants = product.variants && product.variants.length > 0;

            return (
              <div
                key={product.id}
                draggable
                onDragStart={(e) => {
                  const dragData = {
                    type: 'product',
                    url: imgUrl,
                    name: product.name,
                    price: product.price,
                    productId: product.id,
                    product: product
                  };
                  e.dataTransfer.setData('application/json', JSON.stringify(dragData));
                  e.dataTransfer.setData('text/plain', product.name);
                  e.dataTransfer.effectAllowed = 'copy';
                }}
                className={`group relative rounded-[4px] p-3 transition-all flex flex-col justify-between cursor-grab active:cursor-grabbing border ${
                  isDark 
                    ? 'bg-[#181818] hover:bg-[#1c1c1c] border-[#282828] hover:border-[#0F3D3E] hover:shadow-lg' 
                    : 'bg-white hover:bg-slate-50/80 border-slate-200 hover:border-[#0F3D3E] shadow-sm hover:shadow-md'
                }`}
              >
                <div>
                  {/* Card Header: Category & Price */}
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className={`text-[9px] font-bold truncate px-1.5 py-0.5 rounded border ${
                      isDark ? 'text-[#E2DCC8]/80 bg-[#222] border-[#333]' : 'text-slate-600 bg-slate-100 border-slate-200'
                    }`}>
                      {cat?.name || 'General'}
                    </span>
                    <span className="text-[10px] font-bold text-[#00a651] font-mono shrink-0">
                      {product.currency || '$'}{product.price}
                    </span>
                  </div>

                  {/* Product Thumbnail Preview */}
                  <div className={`w-full h-28 rounded-[3px] border mb-2.5 overflow-hidden flex items-center justify-center relative ${
                    isDark ? 'bg-[#121212] border-[#222]' : 'bg-slate-50 border-slate-200'
                  }`}>
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={product.name}
                        className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform duration-200"
                        loading="lazy"
                      />
                    ) : (
                      <div className={`flex flex-col items-center gap-1 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                        <Package size={24} />
                        <span className="text-[8px] uppercase tracking-wider">No Image</span>
                      </div>
                    )}
                    {hasVariants && (
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-[#0F3D3E]/90 border border-[#E2DCC8]/30 text-[#E2DCC8] text-[8px] font-mono font-bold shadow">
                        {product.variants!.length} Variants
                      </span>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="space-y-0.5 mb-3">
                    <h4 className={`text-xs font-bold line-clamp-2 leading-snug transition-colors ${
                      isDark ? 'text-[#F1F1F1] group-hover:text-[#E2DCC8]' : 'text-slate-900 group-hover:text-[#0F3D3E]'
                    }`} title={product.name}>
                      {product.name}
                    </h4>
                    {product.sku && (
                      <p className={`text-[9px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        SKU: <span className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{product.sku}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className={`flex items-center gap-1.5 pt-2 border-t ${isDark ? 'border-[#252525]' : 'border-slate-100'}`}>
                  {/* Primary: Add Card Block */}
                  <button
                    type="button"
                    onClick={() => handleAddSingleCard(product)}
                    className="flex-1 py-1.5 px-2 bg-[#0F3D3E] hover:bg-[#155455] text-white rounded-[3px] text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm border border-[#E2DCC8]/25 cursor-pointer"
                    title={`Add full product card to Page ${currentPageIndex + 1}`}
                  >
                    <Package size={11} /> + Add Card Block
                  </button>

                  {/* Customize Properties Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openProductPropertiesCustomizer(product);
                    }}
                    className={`p-1.5 rounded-[3px] border transition-all flex items-center justify-center shrink-0 cursor-pointer ${
                      isDark
                        ? 'bg-[#1e1e1e] hover:bg-[#282828] text-[#E2DCC8] border-[#333] hover:border-[#0F3D3E] hover:text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300 hover:border-[#0F3D3E]'
                    }`}
                    title="Tune Card Properties & Variables (Theme, Fields, Colors, Sizes)"
                  >
                    <Sliders size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
