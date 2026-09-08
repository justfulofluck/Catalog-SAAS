import React from 'react';
import { Package, Plus, Info, Search } from 'lucide-react';
import { useStore } from '../../store/useStore';

const CatalogProductsView: React.FC = () => {
  const { catalog, products, toggleCatalogProduct, setView } = useStore();
  
  const selectedProducts = products.filter(p => catalog.productIds?.includes(p.id));
  const availableProducts = products.filter(p => !catalog.productIds?.includes(p.id));

  return (
    <div className="flex-1 overflow-hidden bg-[#100F0F] text-white flex flex-col animate-in fade-in duration-500">
      <div className="p-8 border-b border-[#262626] bg-[#161616] flex items-center justify-between shrink-0">
        <div>
          <h1 className="font-space text-2xl font-bold text-white tracking-tight">Catalog Products</h1>
          <p className="text-sm text-[#888888] font-medium mt-0.5">Manage items specifically assigned to <span className="text-[#E2DCC8] font-bold">{catalog.name}</span></p>
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
        <div className="flex-1 overflow-y-auto p-8 border-r border-[#262626]">
          <h3 className="font-space text-[10px] font-bold text-[#888888] uppercase tracking-widest mb-6">Selected for Catalog</h3>
          
          {selectedProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-[#161616] rounded-[4px] border border-dashed border-[#262626] shadow-sm">
              <div className="w-16 h-16 bg-[#1c1c1c] rounded-[4px] flex items-center justify-center mb-4 text-[#666666] border border-[#262626]">
                <Info size={32} />
              </div>
              <p className="font-space text-lg font-bold text-white">No products selected for the catalog!</p>
              <p className="text-sm text-[#888888] font-medium mt-1">Add products to the catalog from the right My Products list &gt;&gt;</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {selectedProducts.map(product => (
                <div key={product.id} className="bg-[#161616] p-4 rounded-[4px] border border-[#262626] shadow-sm flex items-center gap-4 group">
                  <img src={product.image} className="w-16 h-16 rounded-[4px] object-cover bg-[#121212] border border-[#262626]" alt="" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white leading-tight truncate">{product.name}</p>
                    <p className="text-xs font-medium text-[#888888] mt-1">{product.sku}</p>
                  </div>
                  <button 
                    onClick={() => toggleCatalogProduct(product.id)}
                    className="p-2 text-[#666666] hover:text-red-400 transition-colors"
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
        <div className="w-96 bg-[#161616] border-l border-[#262626] overflow-y-auto p-6 shrink-0">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-space text-[10px] font-bold text-[#888888] uppercase tracking-widest flex items-center gap-2">
              <Package size={14} className="text-[#E2DCC8]" />
              My Products
            </h3>
          </div>
          
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666666]" size={16} />
            <input 
              type="text" 
              placeholder="Filter products..." 
              className="w-full bg-[#1c1c1c] border border-[#262626] rounded-[4px] pl-10 pr-4 py-2.5 text-xs font-medium text-white placeholder-[#666666] outline-none focus:border-[#0F3D3E] transition-all"
            />
          </div>

          <div className="space-y-3">
            {availableProducts.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                 <p className="text-xs font-bold text-[#888888]">You have no products!</p>
               </div>
            ) : (
              availableProducts.map(product => (
                <div 
                  key={product.id}
                  onClick={() => toggleCatalogProduct(product.id)}
                  className="group p-3 border border-[#262626] bg-[#121212] hover:border-[#0F3D3E]/40 rounded-[4px] transition-all cursor-pointer flex items-center gap-3"
                >
                  <img src={product.image} className="w-12 h-12 rounded-[4px] object-cover bg-[#1c1c1c]" alt="" />
                  <div className="flex-1 truncate">
                    <p className="text-xs font-bold text-white truncate">{product.name}</p>
                    <p className="text-[10px] font-medium text-[#888888]">{product.sku}</p>
                  </div>
                  <div className="w-8 h-8 rounded-[4px] bg-[#1c1c1c] border border-[#262626] flex items-center justify-center text-[#888888] group-hover:bg-[#0F3D3E] group-hover:text-white group-hover:border-[#0F3D3E] transition-all">
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
