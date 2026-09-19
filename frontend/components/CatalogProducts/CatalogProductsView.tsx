import React, { useState } from 'react';
import { Package, Plus, Info, Search } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { ProductThumbnail } from '../Common/ProductThumbnail';

const CatalogProductsView: React.FC = () => {
  const { catalog, products, toggleCatalogProduct, setView, uiTheme } = useStore();
  const isDark = uiTheme === 'dark';
  
  const selectedProducts = products.filter(p => catalog.productIds?.includes(p.id));
  const availableProducts = products.filter(p => !catalog.productIds?.includes(p.id));

  return (
    <div className={`flex-1 overflow-hidden flex flex-col animate-in fade-in duration-500 transition-colors ${
      isDark ? 'bg-[#100F0F] text-white' : 'bg-slate-50 text-slate-900'
    }`}>
      <div className={`p-8 border-b flex items-center justify-between shrink-0 transition-colors ${
        isDark ? 'bg-[#161616] border-[#262626]' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div>
          <h1 className={`font-space text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Catalog Products</h1>
          <p className={`text-sm font-medium mt-0.5 ${isDark ? 'text-[#888888]' : 'text-slate-500'}`}>
            Manage items specifically assigned to <span className={`font-bold ${isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'}`}>{catalog.name}</span>
          </p>
        </div>
        <button 
          onClick={() => setView('category-list')}
          className="px-6 py-3 bg-[#0F3D3E] hover:bg-[#155455] border border-[#E2DCC8]/30 text-white rounded-[4px] font-bold text-xs uppercase tracking-widest shadow-lg shadow-[#0F3D3E]/20 flex items-center gap-2 transition-all"
        >
          <Plus size={16} /> Create Product Categories
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Catalog Selection */}
        <div className={`flex-1 overflow-y-auto p-8 border-r transition-colors ${
          isDark ? 'border-[#262626]' : 'border-slate-200'
        }`}>
          <h3 className={`font-space text-[10px] font-bold uppercase tracking-widest mb-6 ${
            isDark ? 'text-[#888888]' : 'text-slate-500'
          }`}>Selected for Catalog</h3>
          
          {selectedProducts.length === 0 ? (
            <div className={`flex flex-col items-center justify-center py-20 text-center rounded-[4px] border border-dashed shadow-sm transition-colors ${
              isDark ? 'bg-[#161616] border-[#262626]' : 'bg-white border-slate-200'
            }`}>
              <div className={`w-16 h-16 rounded-[4px] flex items-center justify-center mb-4 border ${
                isDark ? 'bg-[#1c1c1c] text-[#666666] border-[#262626]' : 'bg-slate-100 text-slate-400 border-slate-200'
              }`}>
                <Info size={32} />
              </div>
              <p className={`font-space text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>No products selected for the catalog!</p>
              <p className={`text-sm font-medium mt-1 ${isDark ? 'text-[#888888]' : 'text-slate-500'}`}>Add products to the catalog from the right My Products list &gt;&gt;</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {selectedProducts.map(product => (
                <div key={product.id} className={`p-4 rounded-[4px] border shadow-sm flex items-center gap-4 group transition-colors ${
                  isDark ? 'bg-[#161616] border-[#262626]' : 'bg-white border-slate-200'
                }`}>
                  <ProductThumbnail product={product} src={product.image} alt={product.name} isDark={isDark} className="w-16 h-16" iconSize={24} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold leading-tight truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{product.name}</p>
                    <p className={`text-xs font-medium mt-1 ${isDark ? 'text-[#888888]' : 'text-slate-500'}`}>{product.sku}</p>
                  </div>
                  <button 
                    onClick={() => toggleCatalogProduct(product.id)}
                    className={`p-2 transition-colors ${isDark ? 'text-[#666666] hover:text-red-400' : 'text-slate-400 hover:text-red-500'}`}
                    title="Remove from catalog"
                  >
                    <Plus size={20} className="rotate-45" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Global Library */}
        <div className={`w-96 border-l overflow-y-auto p-6 shrink-0 transition-colors ${
          isDark ? 'bg-[#161616] border-[#262626]' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`font-space text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${
              isDark ? 'text-[#888888]' : 'text-slate-500'
            }`}>
              <Package size={14} className={isDark ? "text-[#E2DCC8]" : "text-[#0F3D3E]"} />
              My Products
            </h3>
          </div>
          
          <div className="relative mb-6">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-[#666666]' : 'text-slate-400'}`} size={16} />
            <input 
              type="text" 
              placeholder="Filter products..." 
              className={`w-full border rounded-[4px] pl-10 pr-4 py-2.5 text-xs font-medium outline-none focus:border-[#0F3D3E] transition-all ${
                isDark 
                  ? 'bg-[#1c1c1c] border-[#262626] text-white placeholder-[#666666]' 
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white'
              }`}
            />
          </div>

          <div className="space-y-3">
            {availableProducts.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                 <p className={`text-xs font-bold ${isDark ? 'text-[#888888]' : 'text-slate-400'}`}>You have no products!</p>
               </div>
            ) : (
              availableProducts.map(product => (
                <div 
                  key={product.id}
                  onClick={() => toggleCatalogProduct(product.id)}
                  className={`group p-3 border rounded-[4px] transition-all cursor-pointer flex items-center gap-3 ${
                    isDark 
                      ? 'border-[#262626] bg-[#121212] hover:border-[#0F3D3E]/40' 
                      : 'border-slate-200 bg-slate-50/70 hover:border-[#0F3D3E]/40 hover:bg-slate-50'
                  }`}
                >
                  <ProductThumbnail product={product} src={product.image} alt={product.name} isDark={isDark} className="w-12 h-12" iconSize={18} />
                  <div className="flex-1 truncate">
                    <p className={`text-xs font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{product.name}</p>
                    <p className={`text-[10px] font-medium ${isDark ? 'text-[#888888]' : 'text-slate-500'}`}>{product.sku}</p>
                  </div>
                  <div className={`w-8 h-8 rounded-[4px] border flex items-center justify-center transition-all ${
                    isDark 
                      ? 'bg-[#1c1c1c] border-[#262626] text-[#888888] group-hover:bg-[#0F3D3E] group-hover:text-white group-hover:border-[#0F3D3E]' 
                      : 'bg-white border-slate-200 text-slate-500 group-hover:bg-[#0F3D3E] group-hover:text-white group-hover:border-[#0F3D3E]'
                  }`}>
                    <Plus size={16} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatalogProductsView;
