import React from 'react';
import { X, Package, Search } from 'lucide-react';
import { Product, ProductVariant, Category } from '../../../types';
import { normalizeImageUrl, resolveProductImage } from '../../../utils/imageUtils';

interface LinkRowModalProps {
  modalState: { secIdx: number; rIdx: number } | null;
  onClose: () => void;
  search: string;
  onSearchChange: (val: string) => void;
  selectedCategory: string;
  onCategoryChange: (val: string) => void;
  products: Product[];
  categories: Category[];
  onLinkProduct: (secIdx: number, rIdx: number, prod: Product, variant?: ProductVariant) => void;
  isDark: boolean;
}

export const LinkRowModal: React.FC<LinkRowModalProps> = ({
  modalState,
  onClose,
  search,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  products,
  categories,
  onLinkProduct,
  isDark
}) => {
  if (!modalState) return null;

  const filtered = products.filter(p => {
    const matchCat = selectedCategory === 'all' || String(p.categoryId) === String(selectedCategory);
    const q = search.toLowerCase().trim();
    const matchQuery = !q || (p.name && p.name.toLowerCase().includes(q)) || (p.sku && p.sku.toLowerCase().includes(q));
    return matchCat && matchQuery;
  });

  return (
    <div
      className="fixed inset-0 z-[1200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-xl border rounded-xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
          isDark ? 'bg-[#141414] border-[#2a2a2a] text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className={`px-4 py-3.5 border-b flex items-center justify-between ${
          isDark ? 'border-[#242424] bg-[#181818]' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#0F3D3E] text-[#E2DCC8] flex items-center justify-center shadow-sm">
              <Package size={15} />
            </div>
            <div>
              <h4 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Fill Row #{modalState.rIdx + 1} with Product
              </h4>
              <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Section #{modalState.secIdx + 1} Specs Table
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <X size={15} />
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className={`p-3 border-b flex items-center gap-2 ${
          isDark ? 'border-[#242424] bg-[#161616]' : 'border-slate-200 bg-white'
        }`}>
          <div className="relative flex-1">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search products by title or model no / SKU..."
              className={`w-full pl-8 pr-3 py-1.5 border rounded-lg text-xs placeholder-slate-400 outline-none focus:border-[#0F3D3E] ${
                isDark ? 'bg-[#0f0f0f] border-[#333] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
              autoFocus
            />
          </div>
          {categories.length > 0 && (
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className={`px-2.5 py-1.5 border rounded-lg text-xs outline-none cursor-pointer ${
                isDark ? 'bg-[#0f0f0f] border-[#333] text-slate-300' : 'bg-white border-slate-300 text-slate-700'
              }`}
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={String(c.id)}>{c.name}</option>
              ))}
            </select>
          )}
        </div>

        {/* Products List */}
        <div className={`flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar ${
          isDark ? 'bg-[#111111]' : 'bg-slate-50/50'
        }`}>
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No matching products found.
            </div>
          ) : (
            filtered.map((p) => {
              const targetCat = categories.find(c => String(c.id) === String(p.categoryId));
              const pImg = resolveProductImage(p, targetCat, products);

              return (
                <div
                  key={p.id}
                  className={`p-2.5 border rounded-lg transition-all flex items-center justify-between gap-3 group ${
                    isDark
                      ? 'bg-[#181818] hover:bg-[#202020] border-[#2a2a2a]'
                      : 'bg-white hover:bg-teal-50/40 border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {pImg ? (
                      <img
                        src={normalizeImageUrl(pImg)}
                        alt={p.name}
                        className={`w-10 h-10 object-contain rounded p-0.5 border shrink-0 ${
                          isDark ? 'bg-[#0d0d0d] border-[#333]' : 'bg-slate-50 border-slate-200'
                        }`}
                      />
                    ) : (
                      <div className={`w-10 h-10 rounded border flex items-center justify-center shrink-0 ${
                        isDark ? 'bg-[#0d0d0d] border-[#333] text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}>
                        <Package size={16} />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className={`text-xs font-bold truncate ${
                        isDark ? 'text-white group-hover:text-[#E2DCC8]' : 'text-slate-800 group-hover:text-[#0F3D3E]'
                      }`}>
                        {p.name}
                      </p>
                      <div className={`flex items-center gap-2 text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {p.sku && <span className="font-mono">{p.sku}</span>}
                        {p.price !== undefined && <span className={`font-bold ${isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'}`}>• ₹{p.price}</span>}
                        {p.variants && p.variants.length > 0 && (
                          <span className="text-amber-500 font-mono text-[9px]">[{p.variants.length} vars]</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {p.variants && p.variants.length > 0 ? (
                      <div className="flex flex-col gap-1 items-end">
                        <button
                          type="button"
                          onClick={() => onLinkProduct(modalState.secIdx, modalState.rIdx, p)}
                          className="px-2.5 py-1 bg-[#0F3D3E] hover:bg-[#145354] text-[#E2DCC8] rounded text-[10px] font-bold transition-all shadow-sm"
                        >
                          Use Base ({p.sku || 'Main'})
                        </button>
                        <div className="flex flex-wrap gap-1 justify-end max-w-xs">
                          {p.variants.map((v, vIdx) => (
                            <button
                              key={v.id || vIdx}
                              type="button"
                              onClick={() => onLinkProduct(modalState.secIdx, modalState.rIdx, p, v)}
                              className={`px-2 py-0.5 rounded text-[9px] font-mono transition-all border ${
                                isDark
                                  ? 'bg-[#262626] hover:bg-[#333] text-slate-300 hover:text-white border-[#3a3a3a]'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-200'
                              }`}
                              title={`Use variant: ${v.sku} - ${v.name}`}
                            >
                              {v.sku || v.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onLinkProduct(modalState.secIdx, modalState.rIdx, p)}
                        className="px-3 py-1 bg-[#0F3D3E] hover:bg-[#145354] text-[#E2DCC8] rounded text-xs font-bold transition-all shadow-sm"
                      >
                        Select Product
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
