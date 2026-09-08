
import React, { useState, useEffect } from 'react';
import { Plus, ChevronRight, FolderOpen, ArrowLeft, Trash2, Edit2, LayoutList, Package, Search, ExternalLink, Info, CornerDownRight } from 'lucide-react';
import { useStore } from '../../store/useStore';

const CategoryListView: React.FC = () => {
  const {
    categories, products, setView, activeCategoryId, setActiveCategoryId,
    setEditingCategoryId, removeCategory, setEditingProductId, setCreatingSubcategoryParentId
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');

  // Set first category as active if none is selected
  useEffect(() => {
    if (!activeCategoryId && categories.length > 0) {
      setActiveCategoryId(categories[0].id);
    }
  }, [categories, activeCategoryId, setActiveCategoryId]);

  const handleCategoryClick = (catId: string) => {
    setActiveCategoryId(catId);
  };

  const handleEditCategory = (e: React.MouseEvent, catId: string) => {
    e.stopPropagation();
    setEditingCategoryId(catId);
    setView('edit-category');
  };

  const handleDeleteCategory = (e: React.MouseEvent, catId: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this category? Products in this category will become uncategorized.')) {
      removeCategory(catId);
    }
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

  // Organizing categories into hierarchy
  const topLevelCategories = categories.filter(cat => !cat.parent);
  const getSubcategories = (parentId: string) => categories.filter(cat => cat.parent?.toString() === parentId);

  const renderCategoryItem = (cat: any, depth = 0) => {
    const isActive = activeCategoryId === cat.id;
    const isSub = depth > 0;
    const subcats = getSubcategories(cat.id);

    return (
      <React.Fragment key={cat.id}>
        <div
          onClick={() => handleCategoryClick(cat.id)}
          className={`group flex items-center gap-6 p-5 transition-all cursor-pointer relative ${isActive ? 'bg-[#0F3D3E]/30' : 'hover:bg-[#171616]'}`}
          style={{ paddingLeft: `${depth * 2 + 1.5}rem` }}
        >
          {/* Ranking Color Strip */}
          <div
            className={`absolute left-0 top-0 bottom-0 w-1 transition-all ${isActive ? 'opacity-100 scale-y-100' : 'opacity-60 scale-y-75 group-hover:scale-y-100 group-hover:opacity-100'}`}
            style={{ backgroundColor: cat.color || '#0F3D3E' }}
          />

          {/* Hierarchy Indicator for subcategories */}
          {isSub && (
            <div className="absolute left-6 text-[#E2DCC8]/50">
              <CornerDownRight size={14} />
            </div>
          )}

          {/* Thumbnail/Icon */}
          <div
            style={{ borderRadius: '4px' }}
            className={`w-12 h-12 flex items-center justify-center transition-all overflow-hidden border shrink-0 ${isActive ? 'bg-[#141414] border-[#E2DCC8]/40 shadow-md' : 'bg-[#141414] border-[#E2DCC8]/15 group-hover:border-[#E2DCC8]/30'}`}
          >
            {cat.thumbnail ? (
              <img src={cat.thumbnail} alt={cat.name} className="w-full h-full object-cover" />
            ) : (
              <FolderOpen size={18} className={isActive ? 'text-[#E2DCC8]' : 'text-[#888888] group-hover:text-[#E2DCC8]'} />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`font-space text-base font-bold transition-colors truncate ${isActive ? 'text-[#E2DCC8]' : 'text-[#F1F1F1] group-hover:text-[#E2DCC8]'}`}>
                {cat.name}
              </h3>
              {cat.parent && (
                <span className="text-[8px] font-bold bg-[#141414] text-[#E2DCC8]/70 border border-[#E2DCC8]/20 px-1.5 py-0.5 rounded-[2px] uppercase tracking-tighter">Sub</span>
              )}
            </div>
            <p className="text-xs font-medium text-[#E2DCC8]/60 truncate max-w-md">
              {cat.description || "Classification for company inventory products."}
            </p>
          </div>

          {/* Stats & Navigation */}
          <div className="flex items-center gap-6 shrink-0">
            <div className="text-right">
              <div className="font-space text-base font-bold text-[#F1F1F1] leading-none">
                {products.filter(p => String(p.categoryId) === String(cat.id)).length}
              </div>
              <div className="text-[8px] font-bold text-[#E2DCC8]/60 uppercase tracking-widest mt-1">Product</div>
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => handleEditCategory(e, cat.id)}
                className="p-2 text-[#E2DCC8]/70 hover:text-[#F1F1F1] hover:bg-[#0F3D3E]/30 rounded-[4px] transition-all border border-transparent"
                title="Edit Category"
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={(e) => handleDeleteCategory(e, cat.id)}
                className="p-2 text-[#E2DCC8]/70 hover:text-red-400 hover:bg-[#100F0F] rounded-[4px] transition-all border border-transparent"
                title="Delete Category"
              >
                <Trash2 size={14} />
              </button>
            </div>
            <div
              style={{ borderRadius: '4px' }}
              className={`w-8 h-8 flex items-center justify-center transition-all ${isActive ? 'bg-[#0F3D3E] text-[#F1F1F1] border border-[#E2DCC8]/30 translate-x-1' : 'bg-[#141414] text-[#888888] group-hover:bg-[#0F3D3E] group-hover:text-[#F1F1F1]'}`}
            >
              <ChevronRight size={16} />
            </div>
          </div>
        </div>
        {subcats.map(sub => renderCategoryItem(sub, depth + 1))}
      </React.Fragment>
    );
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#100F0F] text-[#F1F1F1] animate-in fade-in duration-500">
      {/* Single Line Header & Toolbar */}
      <div className="px-6 py-4 bg-[#141414] border-b border-[#E2DCC8]/15 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex flex-col min-w-[200px]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setView('dashboard')}
              className="text-[#E2DCC8]/70 hover:text-[#F1F1F1] transition-colors p-1 -ml-1 rounded-[4px] hover:bg-[#0F3D3E]/30"
              title="Back to Dashboard"
            >
              <ArrowLeft size={16} />
            </button>
            <h1 className="text-xl font-semibold text-[#F1F1F1] tracking-tight leading-none font-heading">Product Categories</h1>
          </div>
          <p className="text-xs text-[#E2DCC8]/60 font-normal mt-1 ml-7">Classify your items to keep your catalogs organized.</p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 ml-auto">
          {activeCategory && !activeCategory.parent && (
            <button
              onClick={() => { setCreatingSubcategoryParentId(activeCategoryId); setView('create-category'); }}
              className="px-3.5 py-2 bg-[#171616] text-[#E2DCC8] border border-[#E2DCC8]/25 rounded-[4px] font-bold text-xs uppercase tracking-wider shadow-sm hover:bg-[#0F3D3E]/20 flex items-center gap-1.5 transition-all active:scale-95 whitespace-nowrap"
            >
              <CornerDownRight size={14} /> Create Subcategory
            </button>
          )}
          <button
            onClick={() => { setCreatingSubcategoryParentId(null); setView('create-category'); }}
            className="px-4 py-2 bg-[#0F3D3E] hover:bg-[#155455] text-[#F1F1F1] border border-[#E2DCC8]/30 rounded-[4px] font-bold text-xs uppercase tracking-wider shadow-md flex items-center gap-1.5 transition-all active:scale-95 whitespace-nowrap"
          >
            <Plus size={14} className="text-[#E2DCC8]" /> Create Category
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Categories */}
        <div className="flex-1 overflow-y-auto p-6 border-r border-[#E2DCC8]/15">
          <div className="max-w-4xl mx-auto">
            <div className="bg-[#141414] rounded-[4px] border border-[#E2DCC8]/15 overflow-hidden">
            <div className="p-4 bg-[#171616] border-b border-[#E2DCC8]/15 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] font-bold text-[#E2DCC8]/70 uppercase tracking-widest">
                <LayoutList size={14} /> {categories.length} Global Categories
              </div>
              <div className="text-[10px] font-bold text-[#E2DCC8]/60">Hierarchy View</div>
            </div>

            <div className="divide-y divide-[#E2DCC8]/10">
              {topLevelCategories.map(cat => renderCategoryItem(cat))}
            </div>

            {categories.length === 0 && (
              <div className="py-24 text-center">
                <FolderOpen size={48} className="mx-auto text-[#E2DCC8]/30 mb-4" />
                <p className="font-space text-lg font-bold text-[#E2DCC8]/70">No categories found.</p>
                <button
                  onClick={() => setView('create-category')}
                  className="mt-4 text-[#E2DCC8] font-bold hover:underline text-xs uppercase tracking-widest"
                >
                  Initialize first category
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Products in Active Category */}
      <div className="w-[420px] bg-[#141414] flex flex-col z-10 border-l border-[#E2DCC8]/15">
        <div className="p-6 border-b border-[#E2DCC8]/15 bg-[#171616]">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-space text-[10px] font-bold text-[#E2DCC8]/70 uppercase tracking-widest flex items-center gap-2">
              <Package size={14} className="text-[#E2DCC8]" />
              Category Product
            </h3>
            <button
              onClick={() => setView('products-list')}
              className="text-[9px] font-bold text-[#E2DCC8] uppercase tracking-widest flex items-center gap-1 hover:gap-1.5 transition-all"
            >
              Full Library <ExternalLink size={10} />
            </button>
          </div>

          {activeCategory ? (
            <div className="mb-5 animate-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-[4px] flex items-center justify-center text-[#F1F1F1] font-bold text-xs border border-[#E2DCC8]/30 shadow-lg" style={{ backgroundColor: activeCategory.color || '#0F3D3E' }}>
                  {activeCategory.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-space text-base font-bold text-[#F1F1F1] leading-none">{activeCategory.name}</h4>
                  <p className="text-[10px] font-medium text-[#E2DCC8]/60 uppercase tracking-widest mt-1.5">
                    {products.filter(p => String(p.categoryId) === String(activeCategory.id)).length} Linked Products
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-10 mb-5 bg-[#171616] rounded-[4px] animate-pulse" />
          )}

          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#E2DCC8]/50" size={16} />
            <input
              type="text"
              placeholder="Search category items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#100F0F] border border-[#E2DCC8]/20 rounded-[4px] pl-11 pr-4 py-2.5 text-xs font-semibold text-[#F1F1F1] placeholder-[#E2DCC8]/40 focus:border-[#0F3D3E] focus:ring-1 focus:ring-[#0F3D3E] outline-none transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-2.5 custom-scrollbar">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
              <Package size={36} className="text-[#E2DCC8]/30 mb-4" />
              <h5 className="font-space text-sm font-bold text-[#F1F1F1]">No products detected</h5>
              <p className="text-xs text-[#E2DCC8]/60 font-medium mt-1.5 leading-relaxed">This category selection has no matching products in the inventory pool.</p>
              <button
                onClick={() => setView('create-product')}
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
                className="group p-3.5 bg-[#171616] border border-[#E2DCC8]/15 hover:border-[#E2DCC8]/40 rounded-[4px] transition-all cursor-pointer flex items-center gap-3.5"
              >
                <div
                  className="w-12 h-12 overflow-hidden shrink-0 border border-[#E2DCC8]/15 bg-[#100F0F] rounded-[2px]"
                >
                  <img src={product.image} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-bold text-[#F1F1F1] truncate group-hover:text-[#E2DCC8] transition-colors">{product.name}</p>
                    <span className="font-space text-xs font-bold text-[#E2DCC8]">{product.currency}{product.price}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] font-mono font-medium text-[#E2DCC8]/60 uppercase">{product.sku}</p>
                    <ChevronRight size={14} className="text-[#555555] group-hover:text-[#E2DCC8] transform group-hover:translate-x-1 transition-all" />
                  </div>
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

export default CategoryListView;
