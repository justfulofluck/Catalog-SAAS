import React from 'react';
import { X, FolderPlus, Search, CheckCircle2, Layers, Plus } from 'lucide-react';
import { Category, Product } from '../../../types';
import { normalizeImageUrl, resolveProductImage } from '../../../utils/imageUtils';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetPageIdx: number | null;
  search: string;
  onSearchChange: (val: string) => void;
  unincludedCategories: Category[];
  products: Product[];
  onAddCategory: (cat: Category, targetPageIdx: number | null) => void;
  isDark: boolean;
}

export const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  isOpen,
  onClose,
  targetPageIdx,
  search,
  onSearchChange,
  unincludedCategories,
  products,
  onAddCategory,
  isDark
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1250] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-lg border rounded-xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
          isDark ? 'bg-[#141414] border-[#262626] text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className={`px-4 py-3.5 border-b flex items-center justify-between ${
          isDark ? 'border-[#242424] bg-[#181818]' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#00a651] text-black flex items-center justify-center shadow-md shadow-[#00a651]/20 font-bold">
              <FolderPlus size={18} className="stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className={`text-xs font-black uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Add Category to Catalog
                </h4>
                {targetPageIdx !== null ? (
                  <span className="px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold bg-[#0F3D3E] text-[#E2DCC8]">
                    Target: Page {targetPageIdx + 1}
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold bg-[#0F3D3E] text-[#E2DCC8]">
                    Auto-Place
                  </span>
                )}
              </div>
              <p className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Showing only categories not currently included in this catalog
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
            <X size={16} />
          </button>
        </div>

        {/* Search filter */}
        {unincludedCategories.length > 0 && (
          <div className={`p-3 border-b ${
            isDark ? 'border-[#242424] bg-[#161616]' : 'border-slate-200 bg-white'
          }`}>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search available categories..."
                className={`w-full pl-9 pr-3 py-1.5 border rounded-lg text-xs placeholder-slate-400 outline-none focus:border-[#00a651] ${
                  isDark ? 'bg-[#0f0f0f] border-[#333] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
                autoFocus
              />
            </div>
          </div>
        )}

        {/* Categories List */}
        <div className={`flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar ${
          isDark ? 'bg-[#111111]' : 'bg-slate-50/50'
        }`}>
          {(() => {
            if (unincludedCategories.length === 0) {
              return (
                <div className="py-12 px-4 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-[#00a651] flex items-center justify-center mx-auto border border-emerald-500/20">
                    <CheckCircle2 size={24} />
                  </div>
                  <div className="space-y-1">
                    <h5 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      All Categories Included!
                    </h5>
                    <p className={`text-[10.5px] max-w-xs mx-auto leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Every category from your inventory is already displayed in this catalog.
                    </p>
                  </div>
                </div>
              );
            }

            const filtered = unincludedCategories.filter(cat => {
              const q = search.toLowerCase().trim();
              return !q || cat.name.toLowerCase().includes(q);
            });

            if (filtered.length === 0) {
              return (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No categories match "{search}".
                </div>
              );
            }

            return filtered.map(cat => {
              const catProds = products.filter(p => String(p.categoryId) === String(cat.id));
              const catImg = resolveProductImage(catProds[0], cat as any, catProds);

              return (
                <div
                  key={cat.id}
                  onClick={() => onAddCategory(cat, targetPageIdx)}
                  className={`p-3 border rounded-xl transition-all flex items-center justify-between gap-3 cursor-pointer group ${
                    isDark
                      ? 'bg-[#181818] hover:bg-[#202020] border-[#2a2a2a] hover:border-[#00a651]'
                      : 'bg-white hover:bg-emerald-50/40 border-slate-200 hover:border-[#00a651] shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {catImg ? (
                      <img
                        src={normalizeImageUrl(catImg)}
                        alt={cat.name}
                        className={`w-11 h-11 object-contain rounded-lg p-0.5 border shrink-0 ${
                          isDark ? 'bg-[#0d0d0d] border-[#333]' : 'bg-slate-50 border-slate-200'
                        }`}
                      />
                    ) : (
                      <div className={`w-11 h-11 rounded-lg border flex items-center justify-center shrink-0 ${
                        isDark ? 'bg-[#0d0d0d] border-[#333] text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}>
                        <Layers size={18} />
                      </div>
                    )}

                    <div className="min-w-0">
                      <h5 className={`text-xs font-bold truncate transition-colors ${
                        isDark ? 'text-white group-hover:text-[#00a651]' : 'text-slate-900 group-hover:text-[#00a651]'
                      }`}>
                        {cat.name}
                      </h5>
                      <div className={`flex items-center gap-2 text-[10px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        <span className="font-semibold text-[#00a651] font-mono">{catProds.length} Products</span>
                        {catProds.length > 0 && (
                          <span>• {catProds.reduce((acc, p) => acc + (p.variants?.length || 1), 0)} model rows</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="px-3 py-1.5 bg-[#00a651] hover:bg-[#009247] text-black font-black uppercase text-[10px] rounded-lg tracking-wider transition-all shrink-0 shadow-sm flex items-center gap-1"
                  >
                    <Plus size={12} className="stroke-[3]" /> Add
                  </button>
                </div>
              );
            });
          })()}
        </div>
      </div>
    </div>
  );
};
