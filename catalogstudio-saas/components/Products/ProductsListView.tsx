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
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import ConfirmationModal from '../../components/Shared/ConfirmationModal';

const ProductsListView: React.FC = () => {
  const { products, categories, setView, removeProduct, activeCategoryId, setActiveCategoryId, setEditingProductId, setViewingProductId } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [isVisible, setIsVisible] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const confirmDelete = () => {
    if (deleteId) {
      removeProduct(deleteId);
      setDeleteId(null);
      setIsDeleteModalOpen(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const handleNavigate = (view: 'create-product') => {
    setIsNavigating(true);
    setTimeout(() => {
      setView(view);
    }, 700);
  };

  // Filter by category if one is selected, then by search term
  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategoryId ? p.categoryId === activeCategoryId : true;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeCategoryId]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const activeCategory = categories.find(c => c.id === activeCategoryId);

  useEffect(() => {
    // Trigger fade-in on mount
    const timer = setTimeout(() => setIsVisible(true), 50);

    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      clearTimeout(timer);
    };
  }, []);

  const handleEdit = (productId: string) => {
    setIsNavigating(true);
    setTimeout(() => {
      setEditingProductId(productId);
      setView('edit-product');
    }, 700);
  };

  return (
    <div className={`flex-1 flex flex-col overflow-hidden bg-[#f7f8f9] dark:bg-slate-950 transition-all duration-700 ease-out ${isVisible && !isNavigating ? 'opacity-100 translate-y-0 scale-100 blur-0' : 'opacity-0 translate-y-4 scale-95 blur-sm'}`}>
      <style>{`
        @keyframes expand-in-row {
          0% {
            opacity: 0;
            transform: scale(0.98) translateY(10px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-expand-row {
          animation: expand-in-row 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
      {/* ... keeping header and filter bar ... */}
      <div className="px-8 py-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <button
            onClick={() => {
              setIsNavigating(true);
              setTimeout(() => setView('dashboard'), 600);
            }}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors w-fit group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest">Dashboard</span>
          </button>
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
            onClick={() => handleNavigate('create-product')}
            className="px-6 py-2.5 bg-[#337ab7] dark:bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-[#337ab7]/20 dark:shadow-indigo-600/20 hover:bg-[#286090] dark:hover:bg-indigo-700 flex items-center gap-2 transition-all active:scale-95"
          >
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      <div className="px-8 py-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 flex items-center gap-4 relative z-40">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" size={18} />
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-10 pr-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-100 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 dark:focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm hover:border-slate-300 dark:hover:border-slate-600"
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

        <div className="relative" ref={filterRef}>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`p-3 rounded-2xl transition-all border flex items-center gap-2 font-bold text-xs uppercase tracking-wide ${isFilterOpen || activeCategoryId ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-600/20' : 'text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-400'}`}
          >
            <Filter size={20} />
            {activeCategoryId && <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">Filtered</span>}
          </button>

          {isFilterOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-[0_10px_40px_-5px_rgba(0,0,0,0.1)] rounded-2xl z-50 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 ease-out origin-top-right">
              <div className="px-4 pb-2 border-b border-slate-50 dark:border-slate-800 mb-2">
                <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Filter by Taxonomy</p>
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

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Product Details</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Category</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">SKU</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Pricing</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800" key={`${currentPage}-${activeCategoryId}-${searchTerm}`}>
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
                paginatedProducts.map((product, index) => {
                  const category = categories.find(c => c.id === product.categoryId);
                  return (
                    <tr
                      key={product.id}
                      style={{ animationDelay: `${index * 100}ms`, opacity: 0 }}
                      onClick={() => {
                        setViewingProductId(product.id);
                        setView('product-detail');
                      }}
                      className="hover:bg-white dark:hover:bg-slate-800/80 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg relative z-0 hover:z-10 group rounded-2xl animate-expand-row cursor-pointer"
                    >
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
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(product.id);
                            }}
                            className="p-2 text-slate-400 hover:text-[#337ab7] dark:hover:text-indigo-400 hover:bg-blue-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all shadow-sm border border-transparent hover:border-blue-100 dark:hover:border-indigo-800 hover:scale-110 active:scale-95"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(product.id);
                            }}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all shadow-sm border border-transparent hover:border-red-100 dark:hover:border-red-900/30 hover:scale-110 active:scale-95"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                          <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-1 text-center shrink-0"></div>
                          <button className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all hover:scale-110 active:scale-95">
                            <MoreVertical size={16} />
                          </button>
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
            Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredProducts.length)}-{Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} Products
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase hover:text-slate-600 dark:hover:text-slate-400 disabled:opacity-30 transition-colors"
            >
              Previous
            </button>
            <div className="flex items-center gap-1 mx-2">
              <span className="w-6 h-6 flex items-center justify-center rounded bg-[#337ab7] dark:bg-indigo-600 text-white text-[10px] font-black">{currentPage}</span>
              <span className="text-[10px] text-slate-400">/</span>
              <span className="text-[10px] text-slate-400">{totalPages || 1}</span>
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase hover:text-slate-600 dark:hover:text-slate-400 disabled:opacity-30 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Delete Product"
        message="Are you sure you want to remove this product from the master catalog? This action cannot be undone."
        confirmLabel="Delete Asset"
        isDestructive
        onConfirm={confirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </div >
  );
};

export default ProductsListView;
