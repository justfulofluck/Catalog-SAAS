import React from 'react';
import { Package, X } from 'lucide-react';
import { Product, Category } from '../../../types';

interface GridProductPickerModalProps {
  productPickerSectionIdx: number;
  pickerSearch: string;
  setPickerSearch: (q: string) => void;
  pickerCategoryFilter: string | null;
  setPickerCategoryFilter: (catId: string | null) => void;
  categories: Category[];
  products: Product[];
  handleSelectProductForSection: (secIdx: number, p: Product) => void;
  onClose: () => void;
}

export const GridProductPickerModal: React.FC<GridProductPickerModalProps> = ({
  productPickerSectionIdx,
  pickerSearch,
  setPickerSearch,
  pickerCategoryFilter,
  setPickerCategoryFilter,
  categories,
  products,
  handleSelectProductForSection,
  onClose,
}) => {
  const filtered = products.filter(p => {
    const matchCat = pickerCategoryFilter ? p.categoryId === pickerCategoryFilter : true;
    const matchQuery = pickerSearch
      ? (p.name.toLowerCase().includes(pickerSearch.toLowerCase()) || p.sku.toLowerCase().includes(pickerSearch.toLowerCase()))
      : true;
    return matchCat && matchQuery;
  });

  return (
    <div
      className="fixed inset-0 z-[1100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#161616] border border-[#262626] rounded-[6px] shadow-2xl flex flex-col max-h-[80vh] overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-3.5 border-b border-[#262626] flex items-center justify-between bg-[#141414]">
          <div className="flex items-center gap-2.5">
            <Package size={16} className="text-[#E2DCC8]" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Select Product for Section #{productPickerSectionIdx + 1}
            </h4>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Category Filter & Search */}
        <div className="p-3 border-b border-[#262626] bg-[#141414] space-y-2">
          <input
            type="text"
            value={pickerSearch}
            onChange={(e) => setPickerSearch(e.target.value)}
            placeholder="Search products by name or SKU..."
            className="w-full px-3 py-1.5 bg-[#1a1a1a] border border-[#333] rounded-[4px] text-xs text-white placeholder-[#666] outline-none focus:border-[#0F3D3E]"
          />

          {categories.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
              <button
                type="button"
                onClick={() => setPickerCategoryFilter(null)}
                className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase tracking-wider shrink-0 transition-all ${
                  pickerCategoryFilter === null
                    ? 'bg-[#0F3D3E] text-white'
                    : 'bg-[#202020] text-slate-400 hover:text-white'
                }`}
              >
                All ({products.length})
              </button>
              {categories.map(cat => {
                const count = products.filter(p => p.categoryId === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setPickerCategoryFilter(cat.id)}
                    className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase tracking-wider shrink-0 transition-all ${
                      pickerCategoryFilter === cat.id
                        ? 'bg-[#0F3D3E] text-white'
                        : 'bg-[#202020] text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat.name} ({count})
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar bg-[#121212]">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-[#777] text-xs">
              No products found matching criteria.
            </div>
          ) : (
            filtered.map((p) => (
              <div
                key={p.id}
                onClick={() => handleSelectProductForSection(productPickerSectionIdx, p)}
                className="p-3 rounded-[4px] border border-[#262626] bg-[#161616] hover:border-[#0F3D3E] hover:bg-[#1a1a1a] flex items-center justify-between gap-3 cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-10 h-10 rounded-[4px] object-contain bg-[#101010] border border-[#262626] p-1 shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-[4px] bg-[#101010] border border-[#262626] flex items-center justify-center text-[#666] shrink-0">
                      <Package size={16} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate group-hover:text-[#E2DCC8] transition-colors">
                      {p.name}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-[#888]">
                      {p.sku && <span className="font-mono font-bold">{p.sku}</span>}
                      {p.price !== undefined && <span className="text-[#E2DCC8] font-bold">• ₹{p.price}</span>}
                      {p.variants && <span>• {p.variants.length} Variants</span>}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="px-3 py-1 bg-[#0F3D3E] hover:bg-[#155455] text-white rounded-[4px] text-[10px] font-bold uppercase tracking-wider shrink-0"
                >
                  Fill Section
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
