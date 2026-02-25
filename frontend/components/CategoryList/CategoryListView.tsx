
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
          className={`group flex items-center gap-6 p-6 transition-all cursor-pointer relative ${isActive ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/50'}`}
          style={{ paddingLeft: `${depth * 2 + 1.5}rem` }}
        >
          {/* Ranking Color Strip */}
          <div
            className={`absolute left-0 top-0 bottom-0 w-1 transition-all ${isActive ? 'opacity-100 scale-y-100' : 'opacity-60 scale-y-75 group-hover:scale-y-100 group-hover:opacity-100'}`}
            style={{ backgroundColor: cat.color || '#4f46e5' }}
          />

          {/* Hierarchy Indicator for subcategories */}
          {isSub && (
            <div className="absolute left-6 text-slate-300 dark:text-slate-700">
              <CornerDownRight size={14} />
            </div>
          )}

          {/* Thumbnail/Icon */}
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all overflow-hidden border shrink-0 ${isActive ? 'bg-white dark:bg-slate-800 shadow-md border-indigo-100 dark:border-indigo-900/50' : 'bg-slate-100 dark:bg-slate-800 border-slate-100 dark:border-slate-800 group-hover:bg-white dark:group-hover:bg-slate-700 group-hover:shadow-sm'}`}>
            {cat.thumbnail ? (
              <img src={cat.thumbnail} alt={cat.name} className="w-full h-full object-cover" />
            ) : (
              <FolderOpen size={20} className={isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-600 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'} />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`text-base font-black transition-colors truncate ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400'}`}>
                {cat.name}
              </h3>
              {cat.parent && (
                <span className="text-[8px] font-black bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 px-1.5 py-0.5 rounded-full uppercase tracking-tighter">Sub</span>
              )}
            </div>
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 truncate max-w-md">
              {cat.description || "Classification for company inventory assets."}
            </p>
          </div>

          {/* Stats & Navigation */}
          <div className="flex items-center gap-6 shrink-0">
            <div className="text-right">
              <div className="text-base font-black text-slate-800 dark:text-white leading-none">
                {products.filter(p => String(p.categoryId) === String(cat.id)).length}
              </div>
              <div className="text-[8px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mt-1">Product</div>
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => handleEditCategory(e, cat.id)}
                className="p-2 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-800 rounded-2xl transition-all shadow-sm border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
                title="Edit Category"
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={(e) => handleDeleteCategory(e, cat.id)}
                className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-500 hover:bg-white dark:hover:bg-slate-800 rounded-2xl transition-all shadow-sm border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
                title="Delete Category"
              >
                <Trash2 size={14} />
              </button>
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isActive ? 'bg-indigo-600 text-white translate-x-1' : 'bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-700 group-hover:bg-indigo-600 dark:group-hover:bg-indigo-500 group-hover:text-white'}`}>
              <ChevronRight size={16} />
            </div>
          </div>
        </div>
        {subcats.map(sub => renderCategoryItem(sub, depth + 1))}
      </React.Fragment>
    );
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-[#f7f8f9] dark:bg-slate-950 animate-in slide-in-from-bottom-4 duration-500 transition-colors duration-300">
      {/* Left Column: Categories */}
      <div className="flex-1 overflow-y-auto p-8 border-r border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10 flex items-center justify-between">
            <div>
              <button
                onClick={() => setView('dashboard')}
                className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest hover:text-slate-600 dark:hover:text-slate-400 transition-colors mb-4"
              >
                <ArrowLeft size={14} /> Back to Dashboard
              </button>
              <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Product Categories</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Classify your items to keep your catalogs organized.</p>
            </div>
            <div className="flex items-center gap-3">
              {activeCategory && !activeCategory.parent && (
                <button
                  onClick={() => { setCreatingSubcategoryParentId(activeCategoryId); setView('create-category'); }}
                  className="px-6 py-3 bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 transition-all active:scale-95"
                >
                  <CornerDownRight size={16} /> Create Subcategory
                </button>
              )}
              <button
                onClick={() => { setCreatingSubcategoryParentId(null); setView('create-category'); }}
                className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 flex items-center gap-2 transition-all active:scale-95"
              >
                <Plus size={16} /> Create Category
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-5 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                <LayoutList size={14} /> {categories.length} Global Categories
              </div>
              <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500">Hierarchy View</div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {topLevelCategories.map(cat => renderCategoryItem(cat))}
            </div>

            {categories.length === 0 && (
              <div className="py-24 text-center">
                <FolderOpen size={48} className="mx-auto text-slate-200 dark:text-slate-800 mb-4" />
                <p className="text-lg font-black text-slate-400 dark:text-slate-600">No categories found.</p>
                <button
                  onClick={() => setView('create-category')}
                  className="mt-4 text-indigo-600 dark:text-indigo-400 font-black hover:underline text-sm uppercase tracking-widest"
                >
                  Initialize first category
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Products in Active Category */}
      <div className="w-[420px] bg-white dark:bg-slate-900 flex flex-col shadow-2xl z-10 border-l dark:border-slate-800">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Package size={14} className="text-indigo-600 dark:text-indigo-400" />
              Category Product
            </h3>
            <button
              onClick={() => setView('products-list')}
              className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all"
            >
              Full Library <ExternalLink size={10} />
            </button>
          </div>

          {activeCategory ? (
            <div className="mb-6 animate-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-xs shadow-lg" style={{ backgroundColor: activeCategory.color }}>
                  {activeCategory.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-800 dark:text-white leading-none">{activeCategory.name}</h4>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1.5">
                    {products.filter(p => String(p.categoryId) === String(activeCategory.id)).length} Linked Products
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-10 mb-6 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
          )}

          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" size={16} />
            <input
              type="text"
              placeholder="Search category items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-11 pr-4 py-3 text-xs font-bold text-slate-800 dark:text-white focus:ring-4 focus:ring-indigo-600/5 dark:focus:ring-indigo-500/10 focus:border-indigo-600 dark:focus:border-indigo-400 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700 shadow-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center px-8">
              <Package size={40} className="text-slate-100 dark:text-slate-800 mb-6" />
              <h5 className="text-sm font-black text-slate-800 dark:text-white">No products detected</h5>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-2 leading-relaxed">This category selection has no matching products in the inventory pool.</p>
              <button
                onClick={() => setView('create-product')}
                className="mt-6 px-6 py-2.5 bg-slate-900 dark:bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black dark:hover:bg-indigo-700 transition-all"
              >
                Add Product
              </button>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => handleEditProduct(product.id)}
                className="group p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-600/5 rounded-2xl transition-all cursor-pointer flex items-center gap-4"
              >
                <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 border border-slate-50 dark:border-slate-700 group-hover:scale-105 transition-transform duration-500">
                  <img src={product.image} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-black text-slate-800 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{product.name}</p>
                    <span className="text-[11px] font-black text-indigo-600 dark:text-indigo-400">{product.currency}{product.price}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-700 uppercase">{product.sku}</p>
                    <ChevronRight size={14} className="text-slate-200 dark:text-slate-700 group-hover:text-indigo-400 dark:group-hover:text-indigo-300 transform group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-start gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <Info size={16} className="text-indigo-400 dark:text-indigo-500 shrink-0 mt-0.5" />
            <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 leading-relaxed uppercase tracking-tighter">
              <b>Category Sync:</b> Products shown here are filtered by active category assignment. Click to modify individual asset metadata.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryListView;
