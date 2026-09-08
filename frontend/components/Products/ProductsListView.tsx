
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
    <div className="flex-1 flex flex-col overflow-hidden bg-[#100F0F] text-[#F1F1F1] animate-in fade-in duration-500">
      {/* Single Line Header & Toolbar */}
      <div className="px-6 py-4 bg-[#141414] border-b border-[#E2DCC8]/15 flex flex-wrap items-center justify-between gap-4 shrink-0">
        {/* Title & Active Category badge */}
        <div className="flex flex-col min-w-[180px]">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-semibold text-[#F1F1F1] tracking-tight font-heading leading-none">Product List</h1>
            {activeCategoryId && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#0F3D3E]/40 text-[#E2DCC8] rounded-[3px] border border-[#E2DCC8]/30 animate-in zoom-in duration-150">
                <FolderOpen size={12} />
                <span className="text-[9px] font-bold uppercase tracking-wider font-heading">{activeCategory?.name}</span>
                <button
                  onClick={() => setActiveCategoryId(null)}
                  className="hover:text-red-400 transition-colors"
                  title="Clear category filter"
                >
                  <X size={12} />
                </button>
              </div>
            )}
          </div>
          <p className="text-xs text-[#E2DCC8]/60 font-normal mt-1">
            {activeCategoryId
              ? `Showing in ${activeCategory?.name}`
              : `${products.length} items total`}
          </p>
        </div>

        {/* Right Controls: Search, Category Filter, Export & Add Product */}
        <div className="flex items-center gap-2.5 shrink-0 ml-auto">
          <div className="relative w-64 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#E2DCC8]/50" size={15} />
            <input
              type="text"
              placeholder="Search products by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#100F0F] border border-[#E2DCC8]/20 rounded-[4px] pl-9 pr-8 py-1.5 text-xs text-[#F1F1F1] focus:border-[#0F3D3E] focus:ring-1 focus:ring-[#0F3D3E] outline-none transition-all placeholder:text-[#E2DCC8]/40"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#E2DCC8]/60 hover:text-white"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Category Filter Dropdown */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`p-2 rounded-[4px] transition-all border flex items-center gap-1.5 ${
                isFilterOpen || activeCategoryId 
                  ? 'bg-[#0F3D3E] text-[#F1F1F1] border-[#E2DCC8]/30 shadow-sm' 
                  : 'text-[#E2DCC8]/70 hover:text-white bg-[#100F0F] border-[#E2DCC8]/20 hover:border-[#E2DCC8]/40'
              }`}
              title="Filter by Category"
            >
              <Filter size={15} />
              {activeCategoryId && (
                <span className="text-[9px] font-bold uppercase tracking-wider hidden md:inline font-heading">Filtered</span>
              )}
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-[#161616] border border-[#E2DCC8]/20 shadow-2xl rounded-[4px] z-50 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 pb-1.5 border-b border-[#262626] mb-1">
                  <p className="text-[9px] font-bold text-[#E2DCC8]/60 uppercase tracking-wider font-heading">Filter by Category</p>
                </div>
                <button
                  onClick={() => { setActiveCategoryId(null); setIsFilterOpen(false); }}
                  className={`w-full px-3 py-1.5 text-left text-xs font-medium transition-colors flex items-center justify-between ${!activeCategoryId ? 'text-[#E2DCC8] bg-[#0F3D3E]/30' : 'text-[#999999] hover:bg-[#0F3D3E]/20 hover:text-white'}`}
                >
                  All Categories
                  {!activeCategoryId && <CheckCircle2 size={13} className="text-[#E2DCC8]" />}
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => { setActiveCategoryId(cat.id); setIsFilterOpen(false); }}
                    className={`w-full px-3 py-1.5 text-left text-xs font-medium transition-colors flex items-center justify-between ${activeCategoryId === cat.id ? 'text-[#E2DCC8] bg-[#0F3D3E]/30' : 'text-[#999999] hover:bg-[#0F3D3E]/20 hover:text-white'}`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="truncate">{cat.name}</span>
                    </div>
                    {activeCategoryId === cat.id && <CheckCircle2 size={13} className="text-[#E2DCC8]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button className="flex items-center gap-1.5 px-3 py-1.5 text-[#E2DCC8]/70 hover:text-white font-heading font-medium text-xs uppercase tracking-wider hover:bg-[#0F3D3E]/20 rounded-[4px] border border-[#E2DCC8]/20 transition-all">
            <Download size={13} /> Export
          </button>
          <button
            onClick={() => setView('create-product')}
            className="px-4 py-2 bg-[#0F3D3E] hover:bg-[#155455] text-[#F1F1F1] border border-[#E2DCC8]/30 rounded-[4px] font-heading font-semibold text-xs uppercase tracking-wider shadow-md flex items-center gap-1.5 transition-all active:scale-95 whitespace-nowrap"
          >
            <Plus size={15} className="text-[#E2DCC8]" /> Add Product
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="bg-[#141414] rounded-[4px] border border-[#E2DCC8]/15 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#171616] border-b border-[#E2DCC8]/15">
                <th className="px-6 py-4 text-[10px] font-bold text-[#E2DCC8]/70 uppercase tracking-[0.2em] font-heading">Product Details</th>
                <th className="px-6 py-4 text-[10px] font-bold text-[#E2DCC8]/70 uppercase tracking-[0.2em] font-heading">Category</th>
                <th className="px-6 py-4 text-[10px] font-bold text-[#E2DCC8]/70 uppercase tracking-[0.2em] font-heading">SKU</th>
                <th className="px-6 py-4 text-[10px] font-bold text-[#E2DCC8]/70 uppercase tracking-[0.2em] font-heading">Pricing</th>
                <th className="px-6 py-4 text-[10px] font-bold text-[#E2DCC8]/70 uppercase tracking-[0.2em] text-right font-heading">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2DCC8]/10">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-24 text-center">
                    <div className="w-16 h-16 bg-[#171616] border border-dashed border-[#E2DCC8]/20 rounded-[4px] flex items-center justify-center mx-auto mb-4 text-[#E2DCC8]/50">
                      <Package size={32} />
                    </div>
                    <h3 className="text-base font-medium text-[#F1F1F1] font-heading">No results found</h3>
                    <p className="text-xs text-[#E2DCC8]/60 mt-1">Try adjusting your search terms or clearing filters.</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const category = categories.find(c => c.id === product.categoryId);
                  return (
                    <tr key={product.id} className="hover:bg-[#1a1919] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="relative shrink-0">
                            <img src={product.image} className="w-12 h-12 rounded-none object-cover bg-[#100F0F] border border-[#E2DCC8]/15" alt={product.name} />
                            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 border border-[#141414] rounded-full"></div>
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium text-[#F1F1F1] truncate font-heading group-hover:text-[#E2DCC8] transition-colors">{product.name}</span>
                            <span className="text-[11px] text-[#E2DCC8]/60 line-clamp-1 mt-0.5">{product.description || 'No description provided'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: category?.color || '#555555' }}
                          />
                          <span className="text-xs font-medium text-[#cccccc]">
                            {category?.name || 'Uncategorized'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-[#100F0F] rounded-[4px] text-[10px] font-mono text-[#E2DCC8]/70 uppercase border border-[#E2DCC8]/15">
                          {product.sku}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-[#F1F1F1] font-heading">{product.currency}{product.price.toFixed(2)}</span>
                          <span className="text-[9px] font-bold text-[#E2DCC8]/60 uppercase tracking-widest font-heading">Retail Price</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(product.id)}
                            className="p-2 text-[#E2DCC8]/70 hover:text-[#F1F1F1] hover:bg-[#0F3D3E]/30 rounded-[4px] border border-transparent hover:border-[#E2DCC8]/20 transition-all"
                            title="Edit"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => removeProduct(product.id)}
                            className="p-2 text-[#E2DCC8]/70 hover:text-red-400 hover:bg-[#100F0F] rounded-[4px] border border-transparent hover:border-red-500/30 transition-all"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                        <div className="group-hover:hidden text-[#444444]">
                          <ChevronRight size={17} />
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
          <p className="text-[11px] font-bold text-[#E2DCC8]/60 uppercase tracking-widest font-heading">
            Showing {filteredProducts.length} of {products.length} Products
          </p>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1 text-[11px] font-bold text-[#E2DCC8]/60 uppercase hover:text-white disabled:opacity-30 transition-colors font-heading">Previous</button>
            <div className="flex items-center gap-1 mx-2">
              <span className="w-6 h-6 flex items-center justify-center rounded-[4px] bg-[#0F3D3E] text-[#F1F1F1] border border-[#E2DCC8]/30 text-[11px] font-bold font-heading">1</span>
            </div>
            <button className="px-3 py-1 text-[11px] font-bold text-[#E2DCC8]/60 uppercase hover:text-white disabled:opacity-30 transition-colors font-heading" disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsListView;
