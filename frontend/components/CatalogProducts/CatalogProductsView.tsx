
import React from 'react';
import { Package, Plus, ChevronRight, Info, Search } from 'lucide-react';
import { useStore } from '../../store/useStore';

const CatalogProductsView: React.FC = () => {
  const { catalog, products, toggleCatalogProduct, setView } = useStore();
  
  const selectedProducts = products.filter(p => catalog.productIds?.includes(p.id));
  const availableProducts = products.filter(p => !catalog.productIds?.includes(p.id));

  return (
    <div className="flex-1 overflow-hidden bg-[#f7f8f9] flex flex-col animate-in fade-in duration-500">
      <div className="p-8 border-b bg-white flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Catalog Products</h1>
          <p className="text-sm text-slate-500 font-medium">Manage items specifically assigned to <span className="text-[#337ab7] font-bold">{catalog.name}</span></p>
        </div>
        <button 
          onClick={() => setView('category-list')}
          className="px-6 py-3 bg-[#337ab7] text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-[#337ab7]/20 hover:bg-[#286090] flex items-center gap-2 transition-all"
        >
          <Plus size={16} /> Create Product Categories
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Catalog Selection */}
        <div className="flex-1 overflow-y-auto p-8 border-r">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Selected for Catalog</h3>
          
          {selectedProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                <Info size={32} className="text-slate-300" />
              </div>
              <p className="text-lg font-black text-slate-800">No products selected for the catalog!</p>
              <p className="text-sm text-slate-400 font-medium mt-1">Add products to the catalog from the right My Products list &gt;&gt;</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {selectedProducts.map(product => (
                <div key={product.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 group">
                  <img src={product.image} className="w-16 h-16 rounded-xl object-cover bg-slate-50" />
                  <div className="flex-1">
                    <p className="text-sm font-black text-slate-800 leading-tight">{product.name}</p>
                    <p className="text-xs font-bold text-slate-400 mt-1">{product.sku}</p>
                  </div>
                  <button 
                    onClick={() => toggleCatalogProduct(product.id)}
                    className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Plus size={20} className="rotate-45" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Global Library */}
        <div className="w-96 bg-white border-l overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Package size={14} className="text-[#337ab7]" />
              My Products
            </h3>
          </div>
          
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
            <input 
              type="text" 
              placeholder="Filter products..." 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs font-bold focus:ring-4 focus:ring-[#337ab7]/10 outline-none transition-all"
            />
          </div>

          <div className="space-y-3">
            {availableProducts.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                 <p className="text-xs font-black text-slate-800">You have no products!</p>
               </div>
            ) : (
              availableProducts.map(product => (
                <div 
                  key={product.id}
                  onClick={() => toggleCatalogProduct(product.id)}
                  className="group p-3 border border-slate-50 hover:border-[#337ab7]/30 hover:bg-[#337ab7]/5 rounded-xl transition-all cursor-pointer flex items-center gap-3"
                >
                  <img src={product.image} className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1 truncate">
                    <p className="text-xs font-black text-slate-700 truncate">{product.name}</p>
                    <p className="text-[10px] font-bold text-slate-400">{product.sku}</p>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-[#337ab7] group-hover:text-white transition-all">
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
