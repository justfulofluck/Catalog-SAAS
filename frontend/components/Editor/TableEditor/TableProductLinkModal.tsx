import React from 'react';
import { Package, Search, X } from 'lucide-react';
import { Product } from '../../../types';

interface TableProductLinkModalProps {
  isDark: boolean;
  rowToLinkIdx: number | null;
  productSearchQuery: string;
  setProductSearchQuery: (q: string) => void;
  filteredProducts: Product[];
  handleFillRowFromProduct: (rowIdx: number, prod: Product) => void;
  handleAddProductAsRow: (prod: Product) => void;
  onClose: () => void;
}

export const TableProductLinkModal: React.FC<TableProductLinkModalProps> = ({
  isDark,
  rowToLinkIdx,
  productSearchQuery,
  setProductSearchQuery,
  filteredProducts,
  handleFillRowFromProduct,
  handleAddProductAsRow,
  onClose,
}) => {
  return (
    <div
      className="fixed inset-0 z-[1100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-lg rounded-[4px] shadow-2xl border flex flex-col max-h-[80vh] overflow-hidden animate-in zoom-in-95 duration-150 ${
          isDark ? 'bg-[#161616] border-[#262626] text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isDark ? 'border-[#262626] bg-[#141414]' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[4px] bg-[#0F3D3E] text-white flex items-center justify-center shadow-md shadow-[#0F3D3E]/25">
              <Package size={18} />
            </div>
            <div>
              <h3 className={`text-sm font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {rowToLinkIdx !== null ? `Fill Row #${rowToLinkIdx + 1} with Product` : 'Add Product to Table'}
              </h3>
              <p className={`text-[10px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Select a product to automatically map its specs into table columns
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-[4px] transition-colors ${
              isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <X size={16} />
          </button>
        </div>

        {/* Search Input */}
        <div className={`p-4 border-b ${isDark ? 'border-[#262626] bg-[#141414]' : 'border-slate-200 bg-slate-50/50'}`}>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={productSearchQuery}
              onChange={(e) => setProductSearchQuery(e.target.value)}
              placeholder="Search products by title, SKU, or model..."
              className={`w-full pl-9 pr-4 py-2 rounded-[4px] text-xs font-medium outline-none border transition-all ${
                isDark
                  ? 'bg-[#1a1a1a] border-[#2e2e2e] focus:border-[#0F3D3E] text-white placeholder:text-[#666]'
                  : 'bg-white border-slate-300 focus:border-[#0F3D3E] text-slate-900 placeholder:text-slate-400 shadow-sm'
              }`}
              autoFocus
            />
          </div>
        </div>

        {/* Product List */}
        <div className={`flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2 ${
          isDark ? 'bg-[#161616]' : 'bg-slate-50/50'
        }`}>
          {filteredProducts.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs font-medium">
              No products found matching &quot;{productSearchQuery}&quot;
            </div>
          ) : (
            filteredProducts.map((prod) => (
              <div
                key={prod.id}
                className={`p-3 rounded-[4px] border transition-all flex items-center justify-between gap-3 group cursor-pointer ${
                  isDark
                    ? 'border-[#262626] bg-[#141414] hover:border-[#0F3D3E] hover:bg-[#1a1a1a]'
                    : 'border-slate-200 bg-white hover:border-[#0F3D3E] hover:bg-teal-50/40 shadow-sm'
                }`}
                onClick={() => {
                  if (rowToLinkIdx !== null) {
                    handleFillRowFromProduct(rowToLinkIdx, prod);
                  } else {
                    handleAddProductAsRow(prod);
                  }
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {prod.image ? (
                    <img src={prod.image} alt={prod.name} className={`w-10 h-10 rounded-[4px] object-contain p-1 border shrink-0 ${
                      isDark ? 'bg-[#101010] border-[#262626]' : 'bg-slate-50 border-slate-200'
                    }`} />
                  ) : (
                    <div className={`w-10 h-10 rounded-[4px] border flex items-center justify-center shrink-0 ${
                      isDark ? 'bg-[#101010] border-[#262626] text-[#666]' : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}>
                      <Package size={16} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className={`text-xs font-bold truncate transition-colors ${
                      isDark ? 'text-white group-hover:text-[#E2DCC8]' : 'text-slate-800 group-hover:text-[#0F3D3E]'
                    }`}>
                      {prod.name}
                    </p>
                    <div className={`flex items-center gap-2 mt-0.5 text-[10px] ${isDark ? 'text-[#888]' : 'text-slate-500'}`}>
                      {prod.sku && <span className="font-mono font-bold">{prod.sku}</span>}
                      {prod.price !== undefined && <span className={`font-bold ${isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'}`}>• {prod.currency || '₹'}{prod.price}</span>}
                      {prod.customFields?.cutOut && <span>• {prod.customFields.cutOut}</span>}
                      {prod.customFields?.color && <span>• {prod.customFields.color}</span>}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="px-3 py-1.5 bg-[#0F3D3E] hover:bg-[#155455] border border-[#E2DCC8]/30 text-white rounded-[4px] text-[10px] font-bold uppercase tracking-wider shrink-0 shadow-sm transition-all"
                >
                  {rowToLinkIdx !== null ? 'Fill Row' : 'Add Row'}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
