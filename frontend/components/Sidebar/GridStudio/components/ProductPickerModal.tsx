import React from 'react';
import { X, Package } from 'lucide-react';
import { Product, Category } from '../../../types';

interface ProductPickerModalProps {
  sectionIdx: number | null;
  onClose: () => void;
  search: string;
  onSearchChange: (val: string) => void;
  categoryFilter: string | null;
  onCategoryFilterChange: (val: string | null) => void;
  products: Product[];
  categories: Category[];
  onSelectProduct: (secIdx: number, product: Product) => void;
  isDark: boolean;
}

export const ProductPickerModal: React.FC<ProductPickerModalProps> = ({
  sectionIdx,
  onClose,
  search,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  products,
  categories,
  onSelectProduct,
  isDark
}) => {
  if (sectionIdx === null) return null;

  const filtered = products.filter(p => {
    const matchCat = categoryFilter ? String(p.categoryId) === String(categoryFilter) : true;
    const matchQuery = search
      ? (p.name.toLowerCase().includes(search.toLowerCase()) || (p.sku && p.sku.toLowerCase().includes(search.toLowerCase())))
      : true;
    return matchCat && matchQuery;
  });

  return (
    <div
      className="fixed inset-0 z-[1100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-md border rounded-[6px] shadow-2xl flex flex-col max-h-[75vh] overflow-hidden ${
          isDark ? 'bg-[#161616] border-[#262626] text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`px-4 py-3 border-b flex items-center justify-between ${
          isDark ? 'border-[#262626] bg-[#141414]' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center gap-2">
            <Package size={14} className={isDark ? "text-[#E2DCC8]" : "text-[#0F3D3E]"} />
            <h4 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Fill Section #{sectionIdx + 1}
            </h4>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-1 rounded transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
          >
            <X size={14} />
          </button>
        </div>

        <div className={`p-2.5 border-b space-y-1.5 ${
          isDark ? 'border-[#262626] bg-[#141414]' : 'border-slate-200 bg-slate-50/50'
        }`}>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search products by name or SKU..."
            className={`w-full px-2.5 py-1 border rounded text-xs outline-none focus:border-[#0F3D3E] ${
              isDark ? 'bg-[#1a1a1a] border-[#333] text-white placeholder-[#666]' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
            }`}
          />

          {categories.length > 0 && (
            <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar pb-0.5">
              <button
                type="button"
                onClick={() => onCategoryFilterChange(null)}
                className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider shrink-0 transition-all ${
                  categoryFilter === null
                    ? 'bg-[#0F3D3E] text-white'
                    : isDark ? 'bg-[#202020] text-slate-400 hover:text-white' : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                All ({products.length})
              </button>
              {categories.map(cat => {
                const count = products.filter(p => String(p.categoryId) === String(cat.id)).length;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => onCategoryFilterChange(String(cat.id))}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider shrink-0 transition-all ${
                      categoryFilter === String(cat.id)
                        ? 'bg-[#0F3D3E] text-white'
                        : isDark ? 'bg-[#202020] text-slate-400 hover:text-white' : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                    }`}
                  >
                    {cat.name} ({count})
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className={`flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar ${
          isDark ? 'bg-[#121212]' : 'bg-white'
        }`}>
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No products found.
            </div>
          ) : (
            filtered.map((p) => (
              <div
                key={p.id}
                onClick={() => onSelectProduct(sectionIdx, p)}
                className={`p-2.5 rounded border flex items-center justify-between gap-2.5 cursor-pointer transition-all group ${
                  isDark
                    ? 'border-[#262626] bg-[#161616] hover:border-[#0F3D3E] hover:bg-[#1a1a1a]'
                    : 'border-slate-200 bg-slate-50 hover:border-[#0F3D3E] hover:bg-teal-50/40 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.name}
                      className={`w-8 h-8 rounded object-contain border p-0.5 shrink-0 ${
                        isDark ? 'bg-[#101010] border-[#262626]' : 'bg-white border-slate-200'
                      }`}
                    />
                  ) : (
                    <div className={`w-8 h-8 rounded border flex items-center justify-center shrink-0 ${
                      isDark ? 'bg-[#101010] border-[#262626] text-[#666]' : 'bg-white border-slate-200 text-slate-400'
                    }`}>
                      <Package size={14} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className={`text-[11px] font-bold truncate ${
                      isDark ? 'text-white group-hover:text-[#E2DCC8]' : 'text-slate-800 group-hover:text-[#0F3D3E]'
                    }`}>
                      {p.name}
                    </p>
                    <div className={`flex items-center gap-1.5 text-[9px] ${isDark ? 'text-[#888]' : 'text-slate-500'}`}>
                      {p.sku && <span className="font-mono">{p.sku}</span>}
                      {p.price !== undefined && <span className={isDark ? "text-[#E2DCC8]" : "text-[#0F3D3E] font-bold"}>• ₹{p.price}</span>}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="px-2 py-0.5 bg-[#0F3D3E] hover:bg-[#155455] text-white rounded text-[9px] font-bold uppercase shrink-0"
                >
                  Select
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
