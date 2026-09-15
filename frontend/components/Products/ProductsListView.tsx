import React, { useState, useRef, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Trash2,
  Filter,
  Edit2,
  FolderOpen,
  X,
  CheckCircle2,
  ArrowLeft,
  CheckSquare,
  Square,
  MinusSquare
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { getProductThumbnailUrl, normalizeImageUrl } from '../../utils/imageUtils';

const ProductThumbnail: React.FC<{ product?: any; src?: string; alt?: string; isDark?: boolean; className?: string }> = ({ product, src, alt, isDark = true, className = 'w-11 h-11' }) => {
  const [hasError, setHasError] = useState(false);
  const resolvedSrc = getProductThumbnailUrl(product) || normalizeImageUrl(src) || '';

  useEffect(() => {
    setHasError(false);
  }, [resolvedSrc]);

  return (
    <div className={`relative shrink-0 ${className} rounded-[2px] overflow-hidden border flex items-center justify-center ${
      isDark ? 'bg-[#100F0F] border-[#E2DCC8]/15' : 'bg-slate-100 border-slate-200'
    }`}>
      {resolvedSrc && !hasError ? (
        <img
          src={resolvedSrc}
          alt={alt || ''}
          onError={() => setHasError(true)}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <Package size={18} className={isDark ? 'text-[#E2DCC8]/60' : 'text-slate-400'} />
      )}
      <div className={`absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 border rounded-full ${
        isDark ? 'border-[#121212]' : 'border-white'
      }`}></div>
    </div>
  );
};

const ProductsListView: React.FC = () => {
  const { products, categories, setView, removeProduct, activeCategoryId, setActiveCategoryId, setEditingProductId, uiTheme, showConfirm, showToast } = useStore();
  const isDark = uiTheme === 'dark';
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Filter by category if one is selected, then by search term
  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategoryId ? p.categoryId === activeCategoryId : true;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const activeCategory = categories.find(c => c.id === activeCategoryId);

  // Reset pagination on filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeCategoryId, itemsPerPage]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredProducts.length);
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

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

  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllCurrentPage = () => {
    const currentPageIds = paginatedProducts.map(p => p.id);
    const allSelected = currentPageIds.every(id => selectedIds.includes(id));

    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !currentPageIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...currentPageIds])));
    }
  };

  const allCurrentPageSelected = paginatedProducts.length > 0 && paginatedProducts.every(p => selectedIds.includes(p.id));
  const someCurrentPageSelected = paginatedProducts.some(p => selectedIds.includes(p.id)) && !allCurrentPageSelected;

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    const count = selectedIds.length;
    showConfirm({
      title: 'Delete Selected Products',
      message: `Are you sure you want to permanently delete ${count} selected product${count > 1 ? 's' : ''}? This action cannot be undone.`,
      confirmText: `Delete ${count} Product${count > 1 ? 's' : ''}`,
      type: 'danger',
      onConfirm: async () => {
        setIsDeletingBulk(true);
        try {
          for (const id of selectedIds) {
            await removeProduct(id);
          }
          setSelectedIds([]);
          showToast(`Successfully deleted ${count} product${count > 1 ? 's' : ''}.`, 'success', 'Product Deleted', 5000);
        } catch (err) {
          showToast('Failed to delete selected products.', 'error', 'Error', 5000);
        } finally {
          setIsDeletingBulk(false);
        }
      }
    });
  };

  const handleDeleteSingle = (e: React.MouseEvent, productId: string, productName?: string) => {
    e.stopPropagation();
    const title = productName ? `"${productName}"` : 'this product';
    showConfirm({
      title: 'Delete Product',
      message: `Are you sure you want to permanently delete ${title}? This action cannot be undone.`,
      confirmText: 'Delete Product',
      type: 'danger',
      onConfirm: async () => {
        try {
          await removeProduct(productId);
          setSelectedIds(prev => prev.filter(id => id !== productId));
          showToast(`Product ${title} deleted successfully.`, 'success', 'Product Deleted', 5000);
        } catch (err) {
          showToast('Failed to delete product.', 'error', 'Error', 5000);
        }
      }
    });
  };

  const renderPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (validCurrentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (validCurrentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', validCurrentPage - 1, validCurrentPage, validCurrentPage + 1, '...', totalPages);
      }
    }

    return pages.map((page, index) => {
      if (page === '...') {
        return (
          <span key={`dots-${index}`} className={`px-2 py-1 text-xs font-mono select-none ${isDark ? 'text-[#666]' : 'text-slate-400'}`}>
            ...
          </span>
        );
      }

      const isCurrent = page === validCurrentPage;
      return (
        <button
          key={page}
          onClick={() => setCurrentPage(Number(page))}
          className={`min-w-[28px] h-7 px-2 flex items-center justify-center rounded-[3px] text-xs font-bold font-heading transition-all ${
            isCurrent
              ? 'bg-[#0F3D3E] text-[#F1F1F1] border border-[#E2DCC8]/40 shadow-sm'
              : (isDark
                  ? 'text-[#E2DCC8]/70 hover:text-white hover:bg-[#1a1a1a] border border-transparent'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent')
          }`}
        >
          {page}
        </button>
      );
    });
  };

  return (
    <div className={`flex-1 flex flex-col h-full w-full overflow-hidden animate-in fade-in duration-500 relative ${
      isDark ? 'bg-[#100F0F] text-[#F1F1F1]' : 'bg-slate-50 text-slate-800'
    }`}>
      {/* Header Toolbar */}
      <div className={`px-8 py-4 border-b flex flex-wrap items-center justify-between gap-4 shrink-0 ${
        isDark ? 'bg-[#141414] border-[#E2DCC8]/15' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        {/* Title & Active Category badge */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView('dashboard')}
            className={`transition-colors p-1.5 rounded-[4px] ${
              isDark ? 'text-[#E2DCC8]/70 hover:text-[#F1F1F1] hover:bg-[#0F3D3E]/30' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Back to Dashboard"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className={`text-xl font-semibold tracking-tight font-heading leading-none ${
                isDark ? 'text-[#F1F1F1]' : 'text-slate-900'
              }`}>Product Inventory</h1>
              {activeCategoryId && (
                <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-[3px] border animate-in zoom-in duration-150 ${
                  isDark ? 'bg-[#0F3D3E]/40 text-[#E2DCC8] border-[#E2DCC8]/30' : 'bg-teal-50 text-[#0F3D3E] border-teal-200'
                }`}>
                  <FolderOpen size={12} />
                  <span className="text-[10px] font-bold uppercase tracking-wider font-heading">{activeCategory?.name}</span>
                  <button
                    onClick={() => setActiveCategoryId(null)}
                    className="hover:text-red-400 transition-colors ml-0.5"
                    title="Clear category filter"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>
            <p className={`text-xs font-medium mt-1 ${isDark ? 'text-[#E2DCC8]/60' : 'text-slate-500'}`}>
              {activeCategoryId
                ? `Filtered by category "${activeCategory?.name}" • ${filteredProducts.length} items total`
                : `${products.length} total products in catalog master`}
            </p>
          </div>
        </div>

        {/* Right Controls: Search, Category Filter & Add Product */}
        <div className="flex items-center gap-3 shrink-0 ml-auto">
          <div className="relative w-64 md:w-80">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-[#E2DCC8]/50' : 'text-slate-400'}`} size={14} />
            <input
              type="text"
              placeholder="Search products by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full border rounded-[4px] pl-9 pr-8 py-2 text-xs outline-none transition-all ${
                isDark 
                  ? 'bg-[#100F0F] border-[#E2DCC8]/20 text-[#F1F1F1] focus:border-[#0F3D3E] focus:ring-1 focus:ring-[#0F3D3E] placeholder:text-[#E2DCC8]/40' 
                  : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#0F3D3E] focus:ring-1 focus:ring-[#0F3D3E]'
              }`}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className={`absolute right-2.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-[#E2DCC8]/60 hover:text-white' : 'text-slate-400 hover:text-slate-700'}`}
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
                  ? 'bg-[#0F3D3E] text-white border-[#E2DCC8]/30 shadow-sm' 
                  : (isDark ? 'text-[#E2DCC8]/70 hover:text-white bg-[#100F0F] border-[#E2DCC8]/20 hover:border-[#E2DCC8]/40' : 'text-slate-600 bg-white border-slate-200 hover:bg-slate-50')
              }`}
              title="Filter by Category"
            >
              <Filter size={15} />
              {activeCategoryId && (
                <span className="text-[10px] font-bold uppercase tracking-wider hidden md:inline font-heading">Filtered</span>
              )}
            </button>

            {isFilterOpen && (
              <div className={`absolute right-0 mt-2 w-64 border shadow-2xl rounded-[4px] z-50 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
                isDark ? 'bg-[#161616] border-[#E2DCC8]/20 text-white' : 'bg-white border-slate-200 text-slate-800'
              }`}>
                <div className={`px-3.5 pb-2 border-b mb-1 ${isDark ? 'border-[#262626]' : 'border-slate-100'}`}>
                  <p className={`text-[10px] font-bold uppercase tracking-wider font-heading ${isDark ? 'text-[#E2DCC8]/60' : 'text-slate-500'}`}>Filter by Category</p>
                </div>
                <button
                  onClick={() => { setActiveCategoryId(null); setIsFilterOpen(false); }}
                  className={`w-full px-3.5 py-2 text-left text-xs font-medium transition-colors flex items-center justify-between ${
                    !activeCategoryId 
                      ? (isDark ? 'text-[#E2DCC8] bg-[#0F3D3E]/30 font-bold' : 'text-[#0F3D3E] bg-teal-50 font-bold') 
                      : (isDark ? 'text-[#999999] hover:bg-[#0F3D3E]/20 hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900')
                  }`}
                >
                  All Categories
                  {!activeCategoryId && <CheckCircle2 size={14} className={isDark ? "text-[#E2DCC8]" : "text-[#0F3D3E]"} />}
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => { setActiveCategoryId(cat.id); setIsFilterOpen(false); }}
                    className={`w-full px-3.5 py-2 text-left text-xs font-medium transition-colors flex items-center justify-between ${
                      activeCategoryId === cat.id 
                        ? (isDark ? 'text-[#E2DCC8] bg-[#0F3D3E]/30 font-bold' : 'text-[#0F3D3E] bg-teal-50 font-bold') 
                        : (isDark ? 'text-[#999999] hover:bg-[#0F3D3E]/20 hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900')
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                      <span className="truncate">{cat.name}</span>
                    </div>
                    {activeCategoryId === cat.id && <CheckCircle2 size={14} className={isDark ? "text-[#E2DCC8]" : "text-[#0F3D3E]"} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setView('create-product')}
            className="px-5 py-2 bg-[#0F3D3E] hover:bg-[#155455] text-white border border-[#E2DCC8]/30 rounded-[4px] font-heading font-semibold text-xs uppercase tracking-wider shadow-md flex items-center gap-1.5 transition-all active:scale-95 whitespace-nowrap"
          >
            <Plus size={15} className="text-[#E2DCC8]" /> Add Product
          </button>
        </div>
      </div>

      {/* Main Full-Page Table (Edge-to-Edge, No Awkward Outer Spacing) */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0 w-full relative">
        <div className="flex-1 overflow-y-auto custom-scrollbar w-full">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className={`border-b ${isDark ? 'bg-[#171616] border-[#E2DCC8]/15' : 'bg-slate-100/90 border-slate-200'}`}>
                <th className="py-3.5 px-8 w-12 text-center">
                  <button
                    type="button"
                    onClick={handleSelectAllCurrentPage}
                    className={`transition-colors ${isDark ? 'text-[#E2DCC8]/70 hover:text-white' : 'text-slate-400 hover:text-slate-700'}`}
                    title={allCurrentPageSelected ? 'Deselect Page' : 'Select Page'}
                  >
                    {allCurrentPageSelected ? (
                      <CheckSquare size={16} className={isDark ? "text-[#E2DCC8]" : "text-[#0F3D3E]"} />
                    ) : someCurrentPageSelected ? (
                      <MinusSquare size={16} className={isDark ? "text-[#E2DCC8]" : "text-[#0F3D3E]"} />
                    ) : (
                      <Square size={16} />
                    )}
                  </button>
                </th>
                <th className={`px-8 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] font-heading ${isDark ? 'text-[#E2DCC8]/70' : 'text-slate-600'}`}>Product Details</th>
                <th className={`px-8 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] font-heading ${isDark ? 'text-[#E2DCC8]/70' : 'text-slate-600'}`}>Category</th>
                <th className={`px-8 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] font-heading ${isDark ? 'text-[#E2DCC8]/70' : 'text-slate-600'}`}>SKU</th>
                <th className={`px-8 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] font-heading ${isDark ? 'text-[#E2DCC8]/70' : 'text-slate-600'}`}>Pricing</th>
                <th className={`px-8 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] text-right font-heading ${isDark ? 'text-[#E2DCC8]/70' : 'text-slate-600'}`}>Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-[#E2DCC8]/10 bg-[#121212]' : 'divide-slate-200 bg-white'}`}>
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-24 text-center">
                    <div className={`w-16 h-16 border border-dashed rounded-[4px] flex items-center justify-center mx-auto mb-4 ${
                      isDark ? 'bg-[#171616] border-[#E2DCC8]/20 text-[#E2DCC8]/50' : 'bg-slate-50 border-slate-300 text-slate-400'
                    }`}>
                      <Package size={32} />
                    </div>
                    <h3 className={`text-base font-medium font-heading ${isDark ? 'text-[#F1F1F1]' : 'text-slate-800'}`}>No products found</h3>
                    <p className={`text-xs mt-1 ${isDark ? 'text-[#E2DCC8]/60' : 'text-slate-500'}`}>Try adjusting your search terms or clearing the category filter.</p>
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product) => {
                  const category = categories.find(c => c.id === product.categoryId);
                  const isSelected = selectedIds.includes(product.id);
                  return (
                    <tr 
                      key={product.id} 
                      onClick={() => handleEdit(product.id)}
                      className={`transition-colors group cursor-pointer ${
                        isSelected 
                          ? (isDark ? 'bg-[#0F3D3E]/20 hover:bg-[#0F3D3E]/25' : 'bg-teal-50 hover:bg-teal-100/60') 
                          : (isDark ? 'hover:bg-[#1a1919]' : 'hover:bg-slate-50')
                      }`}
                    >
                      {/* Select checkbox */}
                      <td className="py-3 px-8 text-center" onClick={(e) => handleToggleSelect(product.id, e)}>
                        <button type="button" className={`transition-colors ${isDark ? 'text-[#777777] group-hover:text-white' : 'text-slate-400 group-hover:text-slate-700'}`}>
                          {isSelected ? (
                            <CheckSquare size={16} className={isDark ? "text-[#E2DCC8]" : "text-[#0F3D3E]"} />
                          ) : (
                            <Square size={16} />
                          )}
                        </button>
                      </td>

                      <td className="px-8 py-3">
                        <div className="flex items-center gap-4">
                          <ProductThumbnail product={product} src={product.image} alt={product.name} isDark={isDark} />
                          <div className="flex flex-col min-w-0">
                            <span className={`text-xs font-semibold truncate font-heading transition-colors ${
                              isDark ? 'text-[#F1F1F1] group-hover:text-[#E2DCC8]' : 'text-slate-900 group-hover:text-[#0F3D3E]'
                            }`}>{product.name}</span>
                            <span className={`text-[11px] line-clamp-1 mt-0.5 ${
                              isDark ? 'text-[#E2DCC8]/60' : 'text-slate-500'
                            }`}>{product.description || 'No description provided'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: category?.color || '#555555' }}
                          />
                          <span className={`text-xs font-medium truncate max-w-[200px] ${isDark ? 'text-[#cccccc]' : 'text-slate-700'}`}>
                            {category?.name || 'Uncategorized'}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-3">
                        <span className={`px-2.5 py-1 rounded-[3px] text-[10px] font-mono uppercase border font-medium ${
                          isDark ? 'bg-[#100F0F] text-[#E2DCC8]/80 border-[#E2DCC8]/15' : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {product.sku}
                        </span>
                      </td>
                      <td className="px-8 py-3">
                        <div className="flex flex-col">
                          <span className={`text-xs font-bold font-heading ${isDark ? 'text-[#F1F1F1]' : 'text-slate-900'}`}>{product.currency || '₹'}{Number(product.price || 0).toFixed(2)}</span>
                          <span className={`text-[9px] font-bold uppercase tracking-widest font-heading ${isDark ? 'text-[#E2DCC8]/60' : 'text-slate-400'}`}>Retail Price</span>
                        </div>
                      </td>
                      <td className="px-8 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(product.id)}
                            className={`p-1.5 rounded-[4px] border border-transparent transition-all ${
                              isDark ? 'text-[#E2DCC8]/70 hover:text-[#F1F1F1] hover:bg-[#0F3D3E]/30 hover:border-[#E2DCC8]/20' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 hover:border-slate-200'
                            }`}
                            title="Edit Product"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={(e) => handleDeleteSingle(e, product.id, product.name)}
                            className={`p-1.5 rounded-[4px] border border-transparent transition-all ${
                              isDark ? 'text-[#E2DCC8]/70 hover:text-red-400 hover:bg-[#100F0F] hover:border-red-500/30' : 'text-slate-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200'
                            }`}
                            title="Delete Product"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className={`group-hover:hidden ${isDark ? 'text-[#444444]' : 'text-slate-300'}`}>
                          <ChevronRight size={16} />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Floating Bulk Action Bar */}
        {selectedIds.length > 0 && (
          <div className={`fixed bottom-16 left-1/2 -translate-x-1/2 px-6 py-3 rounded-[4px] shadow-[0_20px_50px_rgba(0,0,0,0.6)] z-[100] flex items-center gap-6 border animate-in slide-in-from-bottom-8 ${
            isDark ? 'bg-[#161616] text-white border-[#262626]' : 'bg-white text-slate-900 border-slate-200 shadow-2xl'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-[#0F3D3E] rounded-[3px] flex items-center justify-center font-bold text-xs text-white">
                {selectedIds.length}
              </div>
              <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-[#cccccc]' : 'text-slate-700'}`}>Products Selected</span>
            </div>
            <div className={`w-px h-5 ${isDark ? 'bg-[#262626]' : 'bg-slate-200'}`} />
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedIds([])}
                className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${
                  isDark ? 'text-[#888888] hover:text-white' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={isDeletingBulk}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-[3px] text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-1.5 shadow-lg shadow-red-600/20 disabled:opacity-50"
              >
                <Trash2 size={13} /> {isDeletingBulk ? 'Deleting...' : 'Delete Selected'}
              </button>
            </div>
          </div>
        )}

        {/* Pinned Bottom Pagination Footer Bar */}
        <div className={`px-8 py-3.5 border-t flex flex-wrap items-center justify-between gap-4 shrink-0 z-20 ${
          isDark ? 'bg-[#141414] border-[#E2DCC8]/15' : 'bg-white border-slate-200 shadow-inner'
        }`}>
          {/* Left: Range and Per-page select */}
          <div className="flex items-center gap-4">
            <p className={`text-xs font-medium ${isDark ? 'text-[#E2DCC8]/70' : 'text-slate-600'}`}>
              Showing <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{filteredProducts.length === 0 ? 0 : startIndex + 1}</span> to{' '}
              <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{endIndex}</span> of{' '}
              <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{filteredProducts.length}</span> items
            </p>

            <div className="flex items-center gap-1.5 text-xs">
              <span className={isDark ? 'text-[#888]' : 'text-slate-500'}>Per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className={`border rounded px-2 py-1 text-xs font-semibold outline-none transition-colors ${
                  isDark 
                    ? 'bg-[#1c1c1c] border-[#2a2a2a] text-white focus:border-[#0F3D3E]' 
                    : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-[#0F3D3E]'
                }`}
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          {/* Right: Navigation Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={validCurrentPage === 1}
              className={`p-1.5 rounded-[4px] border transition-all ${
                validCurrentPage === 1
                  ? 'opacity-30 cursor-not-allowed border-transparent'
                  : (isDark ? 'border-[#E2DCC8]/15 hover:bg-[#1e1e1e] text-[#E2DCC8]' : 'border-slate-200 hover:bg-slate-100 text-slate-700')
              }`}
              title="First Page"
            >
              <ChevronsLeft size={14} />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={validCurrentPage === 1}
              className={`flex items-center gap-1 px-3 py-1 rounded-[4px] border text-xs font-bold font-heading transition-all ${
                validCurrentPage === 1
                  ? 'opacity-30 cursor-not-allowed border-transparent'
                  : (isDark ? 'border-[#E2DCC8]/15 hover:bg-[#1e1e1e] text-[#E2DCC8]' : 'border-slate-200 hover:bg-slate-100 text-slate-700')
              }`}
            >
              <ChevronLeft size={13} /> Prev
            </button>

            <div className="flex items-center gap-1 mx-1.5">
              {renderPageNumbers()}
            </div>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={validCurrentPage >= totalPages}
              className={`flex items-center gap-1 px-3 py-1 rounded-[4px] border text-xs font-bold font-heading transition-all ${
                validCurrentPage >= totalPages
                  ? 'opacity-30 cursor-not-allowed border-transparent'
                  : (isDark ? 'border-[#E2DCC8]/15 hover:bg-[#1e1e1e] text-[#E2DCC8]' : 'border-slate-200 hover:bg-slate-100 text-slate-700')
              }`}
            >
              Next <ChevronRight size={13} />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={validCurrentPage >= totalPages}
              className={`p-1.5 rounded-[4px] border transition-all ${
                validCurrentPage >= totalPages
                  ? 'opacity-30 cursor-not-allowed border-transparent'
                  : (isDark ? 'border-[#E2DCC8]/15 hover:bg-[#1e1e1e] text-[#E2DCC8]' : 'border-slate-200 hover:bg-slate-100 text-slate-700')
              }`}
              title="Last Page"
            >
              <ChevronsRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsListView;
