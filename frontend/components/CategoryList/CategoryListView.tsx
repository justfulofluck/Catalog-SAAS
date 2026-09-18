import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  ChevronRight, 
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  FolderOpen, 
  ArrowLeft, 
  Trash2, 
  Edit2, 
  LayoutList, 
  Package, 
  Search, 
  ExternalLink, 
  CornerDownRight,
  X,
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
        <Package size={17} className={isDark ? 'text-[#E2DCC8]/60' : 'text-slate-400'} />
      )}
    </div>
  );
};

const CategoryListView: React.FC = () => {
  const {
    categories, products, setView, activeCategoryId, setActiveCategoryId,
    setEditingCategoryId, removeCategory, setEditingProductId, setCreatingSubcategoryParentId,
    uiTheme, showConfirm, showToast, openCreateProductModal
  } = useStore();

  const isDark = uiTheme === 'dark';
  const [searchTerm, setSearchTerm] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);

  // Set first category as active if none is selected
  useEffect(() => {
    if (!activeCategoryId && categories.length > 0) {
      setActiveCategoryId(categories[0].id);
    }
  }, [categories, activeCategoryId, setActiveCategoryId]);

  const handleCategoryClick = (catId: string) => {
    setActiveCategoryId(catId);
  };

  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleEditCategory = (e: React.MouseEvent, catId: string) => {
    e.stopPropagation();
    setEditingCategoryId(catId);
    setView('edit-category');
  };

  const handleDeleteCategory = (e: React.MouseEvent, catId: string, catName?: string) => {
    e.stopPropagation();
    const name = catName ? `"${catName}"` : 'this category';
    showConfirm({
      title: 'Delete Category',
      message: `Are you sure you want to delete ${name}? Products in this category will become uncategorized.`,
      confirmText: 'Delete Category',
      type: 'danger',
      onConfirm: async () => {
        try {
          await removeCategory(catId);
          setSelectedIds(prev => prev.filter(item => item !== catId));
          showToast(`Category ${name} deleted successfully.`, 'success', 'Category Deleted', 5000);
        } catch (err) {
          showToast('Failed to delete category.', 'error', 'Error', 5000);
        }
      }
    });
  };

  const handleEditProduct = (productId: string) => {
    setEditingProductId(productId);
    setView('edit-product');
  };

  const activeCategory = categories.find(c => c.id === activeCategoryId);
  const filteredProducts = products.filter(p => {
    const matchesCategory = p.categoryId === activeCategoryId;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Organizing categories into hierarchy & search
  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(categorySearch.toLowerCase()))
  );

  const topLevelCategories = filteredCategories.filter(cat => !cat.parent);
  const getSubcategories = (parentId: string) => filteredCategories.filter(cat => cat.parent?.toString() === parentId);

  // Reset page when category search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [categorySearch, itemsPerPage]);

  const totalPages = Math.max(1, Math.ceil(topLevelCategories.length / itemsPerPage));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, topLevelCategories.length);
  const paginatedTopCategories = topLevelCategories.slice(startIndex, endIndex);

  // Current page visible category IDs (including their subcategories)
  const allCurrentPageIds = paginatedTopCategories.flatMap(c => [c.id, ...getSubcategories(c.id).map(s => s.id)]);
  const allCurrentPageSelected = allCurrentPageIds.length > 0 && allCurrentPageIds.every(id => selectedIds.includes(id));
  const someCurrentPageSelected = allCurrentPageIds.some(id => selectedIds.includes(id)) && !allCurrentPageSelected;

  const handleSelectAllCurrentPage = () => {
    if (allCurrentPageSelected) {
      setSelectedIds(prev => prev.filter(id => !allCurrentPageIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...allCurrentPageIds])));
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    const count = selectedIds.length;
    showConfirm({
      title: 'Delete Selected Categories',
      message: `Are you sure you want to permanently delete ${count} selected categor${count > 1 ? 'ies' : 'y'}? Products in these categories will become uncategorized.`,
      confirmText: `Delete ${count} Categor${count > 1 ? 'ies' : 'y'}`,
      type: 'danger',
      onConfirm: async () => {
        setIsDeletingBulk(true);
        try {
          for (const id of selectedIds) {
            await removeCategory(id);
          }
          setSelectedIds([]);
          showToast(`Successfully deleted ${count} categor${count > 1 ? 'ies' : 'y'}.`, 'success', 'Categories Deleted', 5000);
        } catch (err) {
          showToast('Failed to delete selected categories.', 'error', 'Error', 5000);
        } finally {
          setIsDeletingBulk(false);
        }
      }
    });
  };

  const renderCategoryItem = (cat: any, depth = 0) => {
    const isActive = activeCategoryId === cat.id;
    const isSelected = selectedIds.includes(cat.id);
    const isSub = depth > 0;
    const subcats = getSubcategories(cat.id);

    return (
      <React.Fragment key={cat.id}>
        <div
          onClick={() => handleCategoryClick(cat.id)}
          className={`group flex items-center gap-4 px-8 py-4 transition-all cursor-pointer relative ${
            isSelected
              ? (isDark ? 'bg-[#0F3D3E]/20 hover:bg-[#0F3D3E]/25' : 'bg-teal-50 hover:bg-teal-100/60')
              : isActive 
                ? (isDark ? 'bg-[#0F3D3E]/30' : 'bg-teal-50') 
                : (isDark ? 'hover:bg-[#171616]' : 'hover:bg-slate-50')
          }`}
          style={{ paddingLeft: `${depth * 2 + 2}rem` }}
        >
          {/* Ranking Color Strip */}
          <div
            className={`absolute left-0 top-0 bottom-0 w-1 transition-all ${isActive || isSelected ? 'opacity-100 scale-y-100' : 'opacity-60 scale-y-75 group-hover:scale-y-100 group-hover:opacity-100'}`}
            style={{ backgroundColor: cat.color || '#0F3D3E' }}
          />

          {/* Hierarchy Indicator for subcategories */}
          {isSub && (
            <div className={`absolute left-8 ${isDark ? 'text-[#E2DCC8]/50' : 'text-slate-400'}`}>
              <CornerDownRight size={14} />
            </div>
          )}

          {/* Row Checkbox */}
          <div onClick={(e) => handleToggleSelect(cat.id, e)} className="shrink-0">
            <button
              type="button"
              className={`p-1 transition-colors ${isDark ? 'text-[#777777] group-hover:text-white' : 'text-slate-400 group-hover:text-slate-700'}`}
            >
              {isSelected ? (
                <CheckSquare size={16} className={isDark ? "text-[#E2DCC8]" : "text-[#0F3D3E]"} />
              ) : (
                <Square size={16} />
              )}
            </button>
          </div>

          {/* Thumbnail/Icon */}
          <div
            style={{ borderRadius: '4px' }}
            className={`w-11 h-11 flex items-center justify-center transition-all overflow-hidden border shrink-0 ${
              isActive 
                ? (isDark ? 'bg-[#141414] border-[#E2DCC8]/40 shadow-md' : 'bg-white border-[#0F3D3E] shadow-md') 
                : (isDark ? 'bg-[#141414] border-[#E2DCC8]/15 group-hover:border-[#E2DCC8]/30' : 'bg-slate-50 border-slate-200 group-hover:border-slate-300')
            }`}
          >
            {cat.thumbnail ? (
              <img src={cat.thumbnail} alt={cat.name} className="w-full h-full object-cover" />
            ) : (
              <FolderOpen size={18} className={isActive ? (isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]') : (isDark ? 'text-[#888888] group-hover:text-[#E2DCC8]' : 'text-slate-400 group-hover:text-[#0F3D3E]')} />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className={`font-space text-sm font-bold transition-colors truncate ${
                isActive 
                  ? (isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]') 
                  : (isDark ? 'text-[#F1F1F1] group-hover:text-[#E2DCC8]' : 'text-slate-800 group-hover:text-[#0F3D3E]')
              }`}>
                {cat.name}
              </h3>
              {cat.parent && (
                <span className={`text-[8px] font-bold border px-1.5 py-0.5 rounded-[2px] uppercase tracking-tighter ${
                  isDark ? 'bg-[#141414] text-[#E2DCC8]/70 border-[#E2DCC8]/20' : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>Sub</span>
              )}
            </div>
            <p className={`text-[11px] font-medium truncate max-w-xl ${isDark ? 'text-[#E2DCC8]/60' : 'text-slate-500'}`}>
              {cat.description || "Classification for company inventory products."}
            </p>
          </div>

          {/* Stats & Navigation */}
          <div className="flex items-center gap-6 shrink-0">
            <div className="text-right">
              <div className={`font-space text-sm font-bold leading-none ${isDark ? 'text-[#F1F1F1]' : 'text-slate-900'}`}>
                {products.filter(p => String(p.categoryId) === String(cat.id)).length}
              </div>
              <div className={`text-[8px] font-bold uppercase tracking-widest mt-1 ${isDark ? 'text-[#E2DCC8]/60' : 'text-slate-400'}`}>Products</div>
            </div>
            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => handleEditCategory(e, cat.id)}
                className={`p-1.5 rounded-[4px] transition-all border border-transparent ${
                  isDark ? 'text-[#E2DCC8]/70 hover:text-[#F1F1F1] hover:bg-[#0F3D3E]/30' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title="Edit Category"
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={(e) => handleDeleteCategory(e, cat.id, cat.name)}
                className={`p-1.5 rounded-[4px] transition-all border border-transparent ${
                  isDark ? 'text-[#E2DCC8]/70 hover:text-red-400 hover:bg-[#100F0F]' : 'text-slate-500 hover:text-red-600 hover:bg-red-50'
                }`}
                title="Delete Category"
              >
                <Trash2 size={14} />
              </button>
            </div>
            <div
              style={{ borderRadius: '4px' }}
              className={`w-7 h-7 flex items-center justify-center transition-all ${
                isActive 
                  ? 'bg-[#0F3D3E] text-[#F1F1F1] border border-[#E2DCC8]/30 translate-x-1' 
                  : (isDark ? 'bg-[#141414] text-[#888888] group-hover:bg-[#0F3D3E] group-hover:text-[#F1F1F1]' : 'bg-slate-100 text-slate-400 group-hover:bg-[#0F3D3E] group-hover:text-white')
              }`}
            >
              <ChevronRight size={14} />
            </div>
          </div>
        </div>
        {subcats.map(sub => renderCategoryItem(sub, depth + 1))}
      </React.Fragment>
    );
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
          <span key={`cat-dots-${index}`} className={`px-2 py-1 text-xs font-mono select-none ${isDark ? 'text-[#666]' : 'text-slate-400'}`}>
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
      {/* Top Header & Toolbar */}
      <div className={`px-8 py-4 border-b flex flex-wrap items-center justify-between gap-4 shrink-0 ${
        isDark ? 'bg-[#141414] border-[#E2DCC8]/15' : 'bg-white border-slate-200 shadow-sm'
      }`}>
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
            <h1 className={`text-xl font-semibold tracking-tight leading-none font-heading ${
              isDark ? 'text-[#F1F1F1]' : 'text-slate-900'
            }`}>Product Categories</h1>
            <p className={`text-xs font-medium mt-1 ${isDark ? 'text-[#E2DCC8]/60' : 'text-slate-500'}`}>Classify your items to keep your catalogs organized.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 ml-auto">
          {activeCategory && !activeCategory.parent && (
            <button
              onClick={() => { setCreatingSubcategoryParentId(activeCategoryId); setView('create-category'); }}
              className={`px-3.5 py-2 border rounded-[4px] font-bold text-xs uppercase tracking-wider shadow-sm flex items-center gap-1.5 transition-all active:scale-95 whitespace-nowrap ${
                isDark 
                  ? 'bg-[#171616] text-[#E2DCC8] border-[#E2DCC8]/25 hover:bg-[#0F3D3E]/20' 
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <CornerDownRight size={14} /> Create Subcategory
            </button>
          )}
          <button
            onClick={() => { setCreatingSubcategoryParentId(null); setView('create-category'); }}
            className="px-5 py-2 bg-[#0F3D3E] hover:bg-[#155455] text-white border border-[#E2DCC8]/30 rounded-[4px] font-bold text-xs uppercase tracking-wider shadow-md flex items-center gap-1.5 transition-all active:scale-95 whitespace-nowrap"
          >
            <Plus size={15} className="text-[#E2DCC8]" /> Create Category
          </button>
        </div>
      </div>

      {/* Main Full-Width Body */}
      <div className="flex-1 flex overflow-hidden w-full min-h-0 relative">
        {/* Left Column: Categories List (Edge-to-Edge with Pagination) */}
        <div className={`flex-1 flex flex-col overflow-hidden border-r ${isDark ? 'border-[#E2DCC8]/15 bg-[#121212]' : 'border-slate-200 bg-white'}`}>
          {/* Category Top Action & Search Bar */}
          <div className={`px-8 py-3.5 border-b flex items-center justify-between gap-4 shrink-0 ${
            isDark ? 'bg-[#171616] border-[#E2DCC8]/15' : 'bg-slate-100/90 border-slate-200'
          }`}>
            <div className="flex items-center gap-3">
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
              <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${
                isDark ? 'text-[#E2DCC8]/70' : 'text-slate-700'
              }`}>
                <LayoutList size={15} /> {categories.length} Global Categories
              </div>
            </div>

            <div className="relative w-56 md:w-72">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-[#E2DCC8]/50' : 'text-slate-400'}`} size={13} />
              <input
                type="text"
                placeholder="Search categories..."
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                className={`w-full border rounded-[4px] pl-8 pr-7 py-1 text-xs outline-none transition-all ${
                  isDark 
                    ? 'bg-[#100F0F] border-[#E2DCC8]/20 text-[#F1F1F1] placeholder-[#E2DCC8]/40 focus:border-[#0F3D3E]' 
                    : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-[#0F3D3E]'
                }`}
              />
              {categorySearch && (
                <button
                  onClick={() => setCategorySearch('')}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 ${isDark ? 'text-[#E2DCC8]/60 hover:text-white' : 'text-slate-400 hover:text-slate-700'}`}
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* List Items */}
          <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-inherit">
            {paginatedTopCategories.length === 0 ? (
              <div className="py-24 text-center">
                <FolderOpen size={48} className={`mx-auto mb-4 ${isDark ? 'text-[#E2DCC8]/30' : 'text-slate-300'}`} />
                <p className={`font-space text-lg font-bold ${isDark ? 'text-[#E2DCC8]/70' : 'text-slate-600'}`}>No categories found.</p>
                <button
                  onClick={() => setView('create-category')}
                  className={`mt-4 font-bold hover:underline text-xs uppercase tracking-widest ${
                    isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'
                  }`}
                >
                  Initialize first category
                </button>
              </div>
            ) : (
              <div className={`divide-y ${isDark ? 'divide-[#E2DCC8]/10' : 'divide-slate-200'}`}>
                {paginatedTopCategories.map(cat => renderCategoryItem(cat))}
              </div>
            )}
          </div>

          {/* Pinned Bottom Category Pagination Bar */}
          <div className={`px-8 py-3.5 border-t flex flex-wrap items-center justify-between gap-4 shrink-0 ${
            isDark ? 'bg-[#141414] border-[#E2DCC8]/15' : 'bg-white border-slate-200 shadow-inner'
          }`}>
            <div className="flex items-center gap-4">
              <p className={`text-xs font-medium ${isDark ? 'text-[#E2DCC8]/70' : 'text-slate-600'}`}>
                Showing <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{topLevelCategories.length === 0 ? 0 : startIndex + 1}</span> to{' '}
                <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{endIndex}</span> of{' '}
                <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{topLevelCategories.length}</span> categories
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
                  <option value={8}>8</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={20}>20</option>
                </select>
              </div>
            </div>

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

        {/* Right Column: Category Products */}
        <div className={`w-[440px] flex flex-col z-10 shrink-0 ${
          isDark ? 'bg-[#141414]' : 'bg-slate-50/50'
        }`}>
          <div className={`p-6 border-b ${
            isDark ? 'bg-[#171616] border-[#E2DCC8]/15' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-space text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${
                isDark ? 'text-[#E2DCC8]/70' : 'text-slate-600'
              }`}>
                <Package size={14} className={isDark ? "text-[#E2DCC8]" : "text-[#0F3D3E]"} />
                Category Products
              </h3>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => {
                    if (activeCategory) {
                      setActiveCategoryId(String(activeCategory.id));
                      setView('create-product');
                    } else {
                      openCreateProductModal();
                    }
                  }}
                  className={`text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 px-2.5 py-1 rounded-[3px] border transition-all ${
                    isDark 
                      ? 'bg-[#0F3D3E]/30 text-[#E2DCC8] border-[#0F3D3E] hover:bg-[#0F3D3E]' 
                      : 'bg-[#0F3D3E]/10 text-[#0F3D3E] border-[#0F3D3E]/30 hover:bg-[#0F3D3E] hover:text-white'
                  }`}
                  title="Add product to this category"
                >
                  <Plus size={11} /> Add Product
                </button>
                <button
                  onClick={() => setView('products-list')}
                  className={`text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 hover:gap-1.5 transition-all ${
                    isDark ? 'text-[#E2DCC8]/70 hover:text-white' : 'text-slate-600 hover:text-[#0F3D3E]'
                  }`}
                >
                  Full Library <ExternalLink size={10} />
                </button>
              </div>
            </div>

            {activeCategory ? (
              <div className="mb-4 animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-[4px] flex items-center justify-center text-[#F1F1F1] font-bold text-xs border border-[#E2DCC8]/30 shadow-lg shrink-0" style={{ backgroundColor: activeCategory.color || '#0F3D3E' }}>
                    {activeCategory.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h4 className={`font-space text-sm font-bold leading-tight truncate ${
                      isDark ? 'text-[#F1F1F1]' : 'text-slate-900'
                    }`}>{activeCategory.name}</h4>
                    <p className={`text-[10px] font-medium uppercase tracking-widest mt-1 ${
                      isDark ? 'text-[#E2DCC8]/60' : 'text-slate-500'
                    }`}>
                      {products.filter(p => String(p.categoryId) === String(activeCategory.id)).length} Linked Products
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`h-10 mb-4 rounded-[4px] animate-pulse ${isDark ? 'bg-[#171616]' : 'bg-slate-100'}`} />
            )}

            <div className="relative">
              <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-[#E2DCC8]/50' : 'text-slate-400'}`} size={14} />
              <input
                type="text"
                placeholder="Search category items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full border rounded-[4px] pl-9 pr-4 py-2 text-xs font-semibold outline-none transition-all ${
                  isDark 
                    ? 'bg-[#100F0F] border-[#E2DCC8]/20 text-[#F1F1F1] placeholder-[#E2DCC8]/40 focus:border-[#0F3D3E] focus:ring-1 focus:ring-[#0F3D3E]' 
                    : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-[#0F3D3E] focus:ring-1 focus:ring-[#0F3D3E]'
                }`}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scrollbar">
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                <Package size={36} className={`mb-4 ${isDark ? 'text-[#E2DCC8]/30' : 'text-slate-300'}`} />
                <h5 className={`font-space text-sm font-bold ${isDark ? 'text-[#F1F1F1]' : 'text-slate-800'}`}>No products in category</h5>
                <p className={`text-xs font-medium mt-1.5 leading-relaxed ${isDark ? 'text-[#E2DCC8]/60' : 'text-slate-500'}`}>Add products to assign them to this category.</p>
                <button
                  onClick={() => {
                    if (activeCategory) {
                      setActiveCategoryId(String(activeCategory.id));
                      setView('create-product');
                    } else {
                      openCreateProductModal();
                    }
                  }}
                  className="mt-5 px-5 py-2.5 bg-[#0F3D3E] hover:bg-[#155455] text-[#F1F1F1] border border-[#E2DCC8]/30 rounded-[4px] text-[10px] font-bold uppercase tracking-widest transition-all"
                >
                  Add Product
                </button>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleEditProduct(product.id)}
                  className={`group p-3 border rounded-[4px] transition-all cursor-pointer flex items-center gap-3.5 ${
                    isDark 
                      ? 'bg-[#171616] border-[#E2DCC8]/15 hover:border-[#E2DCC8]/40' 
                      : 'bg-white border-slate-200 hover:border-[#0F3D3E]/40 hover:shadow-sm'
                  }`}
                >
                  <ProductThumbnail product={product} src={product.image} alt={product.name} isDark={isDark} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className={`text-xs font-bold truncate transition-colors ${
                        isDark ? 'text-[#F1F1F1] group-hover:text-[#E2DCC8]' : 'text-slate-800 group-hover:text-[#0F3D3E]'
                      }`}>{product.name}</p>
                      <span className={`font-space text-xs font-bold ${isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'}`}>{product.currency || '₹'}{product.price}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className={`text-[9px] font-mono font-medium uppercase ${isDark ? 'text-[#E2DCC8]/60' : 'text-slate-400'}`}>{product.sku}</p>
                      <ChevronRight size={14} className={`transform group-hover:translate-x-1 transition-all ${isDark ? 'text-[#555555] group-hover:text-[#E2DCC8]' : 'text-slate-400 group-hover:text-[#0F3D3E]'}`} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
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
              <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-[#cccccc]' : 'text-slate-700'}`}>Categories Selected</span>
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
      </div>
    </div>
  );
};

export default CategoryListView;
