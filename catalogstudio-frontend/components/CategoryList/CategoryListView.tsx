import React, { useState, useEffect, useRef } from 'react';
import { Plus, ChevronRight, FolderOpen, ArrowLeft, Trash2, Edit2, LayoutList, Package, Search, ExternalLink, Info, ArrowUp, ArrowDown, ChevronDown, GripVertical, Image as ImageIcon, DollarSign } from 'lucide-react';
import { useStore } from '../../store/useStore';
import Sortable from 'sortablejs';

import { CATEGORY_THUMBNAILS } from '../../constants';
import { Product, Category } from '../../types';

import ConfirmationModal from '../../components/Shared/ConfirmationModal';

interface CategoryItemProps {
  category: Category;
  isActive: boolean;
  onClick: (id: string) => void;
  onEdit: (e: React.MouseEvent, id: string) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
  products: Product[];
  reorderProducts: (ids: string[]) => void;
  onEditProduct: (id: string) => void;
  uiTheme: 'light' | 'dark';
}

const CategoryItem: React.FC<CategoryItemProps> = ({
  category, isActive, onClick, onEdit, onDelete, products, reorderProducts, onEditProduct, uiTheme
}) => {
  const listRef = useRef<HTMLDivElement>(null);
  const sortableInstance = useRef<Sortable | null>(null);

  useEffect(() => {
    if (isActive && listRef.current) {
      sortableInstance.current = Sortable.create(listRef.current, {
        animation: 150,
        handle: '.product-drag-handle',
        ghostClass: 'sortable-ghost',
        dragClass: 'sortable-drag',
        onEnd: () => {
          if (listRef.current) {
            const newOrder = Array.from(listRef.current.children).map(
              (el) => (el as HTMLElement).dataset.id!
            );
            // This reorders ONLY the visible products in this category
            // We need to pass valid IDs to the store
            if (newOrder.length > 0) {
              reorderProducts(newOrder);
            }
          }
        }
      });
    }

    return () => {
      if (sortableInstance.current) {
        sortableInstance.current.destroy();
        sortableInstance.current = null;
      }
    };
  }, [isActive, reorderProducts]);

  return (
    <div
      onClick={() => onClick(category.id)}
      className={`group flex flex-col transition-all cursor-pointer relative rounded-2xl border overflow-hidden ${isActive
        ? 'bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-900 shadow-xl shadow-indigo-100 dark:shadow-none'
        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-none'
        }`}
    >
      {/* Main Card Content */}
      <div className="flex items-center gap-6 p-6 relative z-10">
        {/* Ranking Color Strip */}
        <div
          className={`absolute left-0 top-6 bottom-6 w-1 rounded-r-lg transition-all ${isActive ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'}`}
          style={{ backgroundColor: category.color || '#4f46e5' }}
        />

        {/* Thumbnail/Icon */}
        <div className={`w-16 h-16 ml-3 rounded-2xl flex items-center justify-center transition-all overflow-hidden border shrink-0 ${isActive ? 'bg-slate-50 dark:bg-slate-800 shadow-inner' : 'bg-slate-50 dark:bg-slate-800 group-hover:bg-slate-100 dark:group-hover:bg-slate-700'}`}>
          {category.thumbnail || CATEGORY_THUMBNAILS[category.name] ? (
            <img src={category.thumbnail || CATEGORY_THUMBNAILS[category.name]} alt={category.name} className="w-full h-full object-cover" />
          ) : (
            <FolderOpen size={24} className={isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-600 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'} />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h3 className={`text-lg font-black transition-colors truncate ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400'}`}>
              {category.name}
            </h3>
            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Rank #{category.rank}
            </span>
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate max-w-xl">
            {category.description || "Classification for company inventory assets."}
          </p>
        </div>

        {/* Stats & Navigation */}
        <div className="flex items-center gap-8 shrink-0 mr-4">
          <div className={`transition-transform duration-300 ${isActive ? 'rotate-180' : ''} text-slate-400`}>
            <ChevronDown size={20} />
          </div>

          <div className="text-right w-16">
            <div className="text-xl font-black text-slate-800 dark:text-white leading-none">
              {products.length}
            </div>
            <div className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mt-1">Assets</div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => onEdit(e, category.id)}
              className="p-3 text-slate-400 hover:text-[#337ab7] dark:hover:text-indigo-400 hover:bg-blue-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all shadow-sm border border-transparent hover:border-blue-100 dark:hover:border-indigo-800 hover:scale-110 active:scale-95 z-20"
              title="Edit Category"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={(e) => onDelete(e, category.id)}
              className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all shadow-sm border border-transparent hover:border-red-100 dark:hover:border-red-900/30 hover:scale-110 active:scale-95 z-20"
              title="Delete Category"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Product List */}
      {isActive && (
        <div className="bg-slate-50/50 dark:bg-black/20 border-t border-slate-100 dark:border-slate-800 animate-expand origin-top">
          <div ref={listRef} className="p-4 pl-24 pr-8 space-y-2">
            {products.length === 0 ? (
              <div className="py-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <Package size={24} className="mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No products in this category</p>
              </div>
            ) : (
              products.map((product) => (
                <div
                  key={product.id}
                  data-id={product.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl flex items-center gap-4 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors group/product shadow-sm relative"
                >
                  <div className="product-drag-handle p-2 text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing">
                    <GripVertical size={16} />
                  </div>

                  <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-100 dark:border-slate-700 shrink-0">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon size={14} className="text-slate-300" />
                      </div>
                    )}
                  </div>

                  <div className="w-1/3 min-w-0">
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{product.name}</h4>
                  </div>

                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">{product.sku}</p>
                  </div>

                  <div className="flex-1"></div>

                  <div className="flex items-center gap-6 mr-4">
                    <div className="text-right">
                      <span className="text-xs font-black text-slate-600 dark:text-slate-400">{product.currency}{product.price}</span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); onEditProduct(product.id); }}
                      className="p-2 opacity-0 group-hover/product:opacity-100 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 rounded-lg transition-all"
                    >
                      <Edit2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const CategoryListView: React.FC = () => {

  const {
    categories, products, setView, activeCategoryId, setActiveCategoryId,
    setEditingCategoryId, removeCategory, setEditingProductId, reorderProducts, uiTheme
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'rank' | 'name'>('rank');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Auto-select effect removed to allow fully collapsed state

  const handleCategoryClick = (catId: string) => {
    if (activeCategoryId === catId) {
      setActiveCategoryId(null);
    } else {
      setActiveCategoryId(catId);
    }
  };

  const handleEditCategory = (e: React.MouseEvent, catId: string) => {
    e.stopPropagation();
    setEditingCategoryId(catId);
    setView('edit-category');
  };

  const handleDeleteCategory = (e: React.MouseEvent, catId: string) => {
    e.stopPropagation();
    setDeleteId(catId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (deleteId) {
      removeCategory(deleteId);
      setDeleteId(null);
      setIsDeleteModalOpen(false);
    }
  };

  const handleEditProduct = (productId: string) => {
    setEditingProductId(productId);
    setView('edit-product');
  };

  const sortedCategories = [...categories].sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else {
      comparison = (a.rank || 0) - (b.rank || 0);
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const toggleSortDirection = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`flex-1 flex flex-col overflow-hidden bg-[#f7f8f9] dark:bg-slate-950 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <style>{`
        @keyframes expand-in {
          0% {
            max-height: 0;
            opacity: 0;
            padding-top: 0;
            padding-bottom: 0;
            margin-bottom: 0;
            transform: scaleY(0.9);
          }
          100% {
            max-height: 500px; /* Increased max-height for list */
            opacity: 1;
            padding-top: 0; /* Handled by inner padding */
            padding-bottom: 0;
            transform: scaleY(1);
          }
        }
        .animate-expand {
          animation: expand-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Navbar-like Header */}
      <div className="px-8 py-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between z-20 relative">
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setView('dashboard')}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors w-fit group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest">Dashboard</span>
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight text-left">Product Categories</h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-[#337ab7]/10 dark:bg-indigo-400/10 text-[#337ab7] dark:text-indigo-400 rounded-full border border-[#337ab7]/20 dark:border-indigo-400/20">
              <LayoutList size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">{categories.length} Categories</span>
            </div>
          </div>
          <p className="text-sm text-slate-400 dark:text-slate-500 font-medium mt-1">
            Classify your items to keep your catalogs organized.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Sorting Controls */}
          <div className="flex items-center gap-2 mr-4 bg-slate-50 dark:bg-slate-800 p-1 rounded-xl border border-slate-100 dark:border-slate-700">
            <div className="relative">
              <button
                onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
                className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-all"
              >
                <span className="text-slate-400 dark:text-slate-500 font-bold mr-1">Sort:</span>
                {sortBy === 'rank' ? 'Rank' : 'Name'} <ChevronDown size={12} />
              </button>

              {isSortMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden z-50">
                  <button
                    onClick={() => { setSortBy('rank'); setIsSortMenuOpen(false); }}
                    className={`w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${sortBy === 'rank' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}
                  >
                    Rank
                  </button>
                  <button
                    onClick={() => { setSortBy('name'); setIsSortMenuOpen(false); }}
                    className={`w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${sortBy === 'name' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}
                  >
                    Name
                  </button>
                </div>
              )}
            </div>
            <div className="w-px h-4 bg-slate-200 dark:bg-slate-700"></div>
            <button
              onClick={toggleSortDirection}
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
              title={sortOrder === 'asc' ? "Ascending" : "Descending"}
            >
              {sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
            </button>
          </div>

          <button
            onClick={() => setView('create-category')}
            className="px-6 py-2.5 bg-[#337ab7] dark:bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-[#337ab7]/20 dark:shadow-indigo-600/20 hover:bg-[#286090] dark:hover:bg-indigo-700 flex items-center gap-2 transition-all active:scale-95"
          >
            <Plus size={16} /> Create Category
          </button>
        </div>
      </div>

      {/* Main Content - Full Width List */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative z-0">
        <div className="flex flex-col gap-4">
          {categories.length === 0 ? (
            <div className="py-24 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 border-dashed">
              <FolderOpen size={48} className="mx-auto text-slate-200 dark:text-slate-800 mb-4" />
              <p className="text-lg font-black text-slate-400 dark:text-slate-600">No categories found.</p>
              <button
                onClick={() => setView('create-category')}
                className="mt-4 text-[#337ab7] dark:text-indigo-400 font-black hover:underline text-sm uppercase tracking-widest"
              >
                Initialize first taxonomy
              </button>
            </div>
          ) : (
            sortedCategories.map((cat, idx) => (
              <CategoryItem
                key={cat.id}
                category={cat}
                isActive={activeCategoryId === cat.id}
                onClick={handleCategoryClick}
                onEdit={handleEditCategory}
                onDelete={handleDeleteCategory}
                products={products.filter(p => p.categoryId === cat.id)}
                reorderProducts={reorderProducts}
                onEditProduct={handleEditProduct}
                uiTheme={uiTheme}
              />
            ))
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Delete Category"
        message="Are you sure you want to delete this category? Products in this category will become uncategorized."
        confirmLabel="Delete Category"
        isDestructive
        onConfirm={confirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
};


export default CategoryListView;
