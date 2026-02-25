
import React, { useState, useRef, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  ChevronRight,
  Trash2,
  Filter,
  Download,
  MoreVertical,
  ArrowUpRight,
  Edit2,
  FolderOpen,
  X,
  CheckCircle2
} from 'lucide-react';
import { useStore } from '../../store/useStore';

const ProductsListView: React.FC = () => {
  const { products, categories, setView, removeProduct, activeCategoryId, setActiveCategoryId, setEditingProductId } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Filter by category if one is selected, then by search term
  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategoryId ? p.categoryId === activeCategoryId : true;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const activeCategory = categories.find(c => c.id === activeCategoryId);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEdit = (productId: string) => {
    setEditingProductId(productId);
    setView('edit-product');
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#f7f8f9] dark:bg-slate-950 animate-in fade-in duration-500 transition-colors duration-300">
      {/* View Header */}
      <div className="px-8 py-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight text-center shrink-0">Product List</h1>
            {activeCategoryId && (
              <div className="flex items-center gap-2 px-3 py-1 bg-[#337ab7]/10 dark:bg-indigo-400/10 text-[#337ab7] dark:text-indigo-400 rounded-full border border-[#337ab7]/20 dark:border-indigo-400/20 animate-in zoom-in duration-200">
                <FolderOpen size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">{activeCategory?.name}</span>
                <button
                  onClick={() => setActiveCategoryId(null)}
                  className="hover:text-red-500 transition-colors"
                  title="Clear category filter"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
          <p className="text-sm text-slate-400 dark:text-slate-500 font-medium mt-1">
            {activeCategoryId
              ? `Showing products in ${activeCategory?.name}`
              : `Manage your complete catalog of ${products.length} items`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 text-slate-600 dark:text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all">
            <Download size={16} /> Export
          </button>
          <button
            onClick={() => setView('create-product')}
            className="px-6 py-2.5 bg-[#337ab7] dark:bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-[#337ab7]/20 dark:shadow-indigo-600/20 hover:bg-[#286090] dark:hover:bg-indigo-700 flex items-center gap-2 transition-all active:scale-95"
          >
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="px-8 py-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border-b border-slate-100 dark:border-slate-800 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" size={18} />
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-10 pr-10 py-2 text-sm text-slate-900 dark:text-white focus:ring-4 focus:ring-[#337ab7]/10 dark:focus:ring-indigo-600/10 focus:border-[#337ab7] dark:focus:border-indigo-600 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700 shadow-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Workable Category Filter Dropdown */}
        <div className="relative" ref={filterRef}>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`p-2.5 rounded-2xl transition-all border flex items-center gap-2 ${isFilterOpen || activeCategoryId ? 'bg-[#337ab7] text-white border-[#337ab7] shadow-lg' : 'text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400 bg-white dark:bg-slate-800 border-transparent hover:border-slate-200 dark:hover:border-slate-700'}`}
          >
            <Filter size={20} />
            {activeCategoryId && <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">Filtered</span>}
          </button>

          {isFilterOpen && (
            <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-2xl z-50 py-3 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 pb-2 border-b border-slate-50 dark:border-slate-800 mb-2">
                <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Filter by Category</p>
              </div>
              <button
                onClick={() => { setActiveCategoryId(null); setIsFilterOpen(false); }}
                className={`w-full px-4 py-2 text-left text-xs font-bold transition-colors flex items-center justify-between ${!activeCategoryId ? 'text-[#337ab7] bg-blue-50 dark:bg-blue-900/20' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              >
                All Categories
                {!activeCategoryId && <CheckCircle2 size={14} />}
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setActiveCategoryId(cat.id); setIsFilterOpen(false); }}
                  className={`w-full px-4 py-2 text-left text-xs font-bold transition-colors flex items-center justify-between ${activeCategoryId === cat.id ? 'text-[#337ab7] bg-blue-50 dark:bg-blue-900/20' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                    {cat.name}
                  </div>
                  {activeCategoryId === cat.id && <CheckCircle2 size={14} />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Product Details</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Category</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">SKU</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Pricing</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-24 text-center">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-200 dark:text-slate-700 border-2 border-dashed border-slate-100 dark:border-slate-700">
                      <Package size={40} />
                    </div>
                    <h3 className="text-lg font-black text-slate-800 dark:text-white">No results found</h3>
                    <p className="text-sm text-slate-400 dark:text-slate-500 font-medium mt-1">Try adjusting your search terms or clearing filters.</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const category = categories.find(c => c.id === product.categoryId);
                  return (
                    <tr key={product.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-all group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="relative shrink-0">
                            <img src={product.image} className="w-12 h-12 rounded-2xl object-cover bg-slate-100 dark:bg-slate-800 border border-slate-100 dark:border-slate-800" />
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-bold text-slate-800 dark:text-white truncate leading-tight group-hover:text-[#337ab7] dark:group-hover:text-indigo-400 transition-colors">{product.name}</span>
                            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-1 line-clamp-1">{product.description || 'No description provided'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: category?.color || '#cbd5e1' }}
                          />
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                            {category?.name || 'Uncategorized'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-2xl text-[10px] font-mono font-black text-slate-500 dark:text-slate-400 uppercase tracking-tight border border-slate-200 dark:border-slate-700">
                          {product.sku}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-800 dark:text-white">{product.currency}{product.price.toFixed(2)}</span>
                          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Retail Price</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(product.id)}
                            className="p-2 text-slate-400 hover:text-[#337ab7] dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-800 rounded-2xl transition-all shadow-sm border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => removeProduct(product.id)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-white dark:hover:bg-slate-800 rounded-2xl transition-all shadow-sm border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                          <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-1 text-center shrink-0"></div>
                          <button className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 rounded-2xl transition-all">
                            <MoreVertical size={16} />
                          </button>
                        </div>
                        <div className="group-hover:hidden text-slate-300 dark:text-slate-700">
                          <ChevronRight size={18} />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex items-center justify-between px-2">
          <p className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest">
            Showing {filteredProducts.length} of {products.length} Products
          </p>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase hover:text-slate-600 dark:hover:text-slate-400 disabled:opacity-30 transition-colors">Previous</button>
            <div className="flex items-center gap-1 mx-2">
              <span className="w-6 h-6 flex items-center justify-center rounded bg-[#337ab7] dark:bg-indigo-600 text-white text-[10px] font-black">1</span>
            </div>
            <button className="px-3 py-1 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase hover:text-slate-600 dark:hover:text-slate-400 disabled:opacity-30 transition-colors" disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsListView;
