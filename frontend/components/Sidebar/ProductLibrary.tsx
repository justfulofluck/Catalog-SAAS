import React, { useState, useEffect, useRef } from 'react';
import { Package, Search, X, Layers, GripVertical, Trash2, Folder } from 'lucide-react';
import Sortable from 'sortablejs';
import { useStore } from '../../store/useStore';
import { Product, CanvasElement } from '../../types';

const ProductLibrary: React.FC = () => {
  const { products, categories, addElement, currentPageIndex, catalog, reorderProducts, removeProductFromCanvas, setDraggingItem, uiTheme, setEditorTab, selectedCategoryId, setSelectedCategoryId } = useStore();
  const [search, setSearch] = useState('');
  const sortableRef = useRef<HTMLDivElement>(null);
  const dragOccurred = useRef(false);

  // Filter products based on selected category (if any) AND search
  const filteredProducts = products.filter(p =>
    (selectedCategoryId ? p.categoryId === selectedCategoryId : true) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()))
  );

  const activeCategory = categories.find(c => c.id === selectedCategoryId);

  useEffect(() => {
    if (sortableRef.current && filteredProducts.length > 0) {
      const sortable = Sortable.create(sortableRef.current, {
        animation: 150,
        handle: '.drag-handle',
        ghostClass: 'sortable-ghost',
        dragClass: 'sortable-drag',
        onEnd: (evt) => {
          const newOrder = Array.from(sortableRef.current!.children).map(
            (el) => (el as HTMLElement).dataset.id!
          );
          reorderProducts(newOrder);
        },
      });
      return () => sortable.destroy();
    }
  }, [filteredProducts.length, selectedCategoryId]);

  const handleAddProduct = (product: Product) => {
    const timestamp = Date.now();
    const currentPage = catalog.pages[currentPageIndex];

    // Improved slot detection
    const slots = currentPage.elements.filter(el => el.id.includes('slot'));
    const occupiedSlotIdentifiers = new Set(
      currentPage.elements
        .filter(el => el.productId)
        .map(el => {
          const parts = el.id.split('-');
          const slotPartIndex = parts.findIndex(p => p === 'slot');
          if (slotPartIndex !== -1 && slotPartIndex + 1 < parts.length) {
            return `slot-${parts[slotPartIndex + 1]}`;
          }
          return null;
        })
        .filter(Boolean)
    );

    const targetSlot = slots.find(s => {
      const sParts = s.id.split('-');
      const slotPartIndex = sParts.findIndex(p => p === 'slot');
      if (slotPartIndex !== -1 && slotPartIndex + 1 < sParts.length) {
        const id = `slot-${sParts[slotPartIndex + 1]}`;
        return !occupiedSlotIdentifiers.has(id);
      }
      return true;
    });

    let x = 100, y = 100, width = 250, height = 320;
    let slotTag = '';

    if (targetSlot) {
      x = targetSlot.x;
      y = targetSlot.y;
      width = targetSlot.width;
      height = targetSlot.height;
      const sParts = targetSlot.id.split('-');
      const sIdx = sParts.findIndex(p => p === 'slot');
      slotTag = sIdx !== -1 ? `slot-${sParts[sIdx + 1]}` : `slot-${timestamp}`;
    } else {
      slotTag = `slot-${timestamp}`;
    }

    addElement(currentPageIndex, {
      id: `product-block-${slotTag}-${timestamp}`,
      type: 'product-block',
      x, y, width, height,
      rotation: 0, opacity: 1,
      productId: product.id,
      zIndex: 20
    });
  };

  const handleDragStart = (e: React.DragEvent, product: Product) => {
    dragOccurred.current = true;
    const getProductImage = (p: Product) => {
      if (p.image) return p.image;
      if (p.customFields) {
        const firstImg = Object.values(p.customFields).find(
          val => typeof val === 'string' && (val.startsWith('/media') || val.startsWith('http'))
        );
        if (firstImg) return firstImg as string;
      }
      return '';
    };

    const dragData = {
      type: 'product',
      url: getProductImage(product),
      name: product.name,
      productId: product.id
    };
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = 'copy';
    setDraggingItem(dragData);
  };

  const handleDragEnd = () => {
    setDraggingItem(null);
    setTimeout(() => {
      dragOccurred.current = false;
    }, 50);
  };

  const handleClearFromCanvas = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeProductFromCanvas(productId);
  };

  return (
    <div className={`flex h-full border-r w-[380px] shrink-0 z-10 shadow-[20px_0_60px_rgba(0,0,0,0.05)] animate-in slide-in-from-left-4 duration-500 font-sans transition-colors ${uiTheme === 'dark' ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>

      {/* Left Column: Categories */}
      <div className={`w-[150px] flex flex-col border-r ${uiTheme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`}>
        <div className={`p-3 border-b transition-colors ${uiTheme === 'dark' ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
          <h2 className={`text-[10px] font-black uppercase tracking-widest mb-0.5 ${uiTheme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Categories</h2>
          <p className="text-[8px] font-semibold text-slate-400">{categories.length} total</p>
        </div>
        <div
          className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar cursor-default"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedCategoryId(null);
            }
          }}
        >
          {/* 'All' category removed as per user request */}
          {categories.map((category, idx) => (
            <button
              key={category.id}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedCategoryId(category.id);
              }}
              className={`w-full flex items-center gap-2 p-2 rounded-lg transition-all relative group ${selectedCategoryId === category.id ? (uiTheme === 'dark' ? 'bg-slate-800 text-white shadow-sm' : 'bg-white border border-slate-100 shadow-sm text-indigo-600') : (uiTheme === 'dark' ? 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700')}`}
            >
              <span className={`absolute left-0.5 top-0.5 text-[7px] font-black ${selectedCategoryId === category.id ? 'text-indigo-500' : 'text-slate-400'}`}>
                {String(idx + 1).padStart(2, '0')}
              </span>
              <div className={`w-6 h-6 rounded-md flex items-center justify-center overflow-hidden ml-1 ${selectedCategoryId === category.id ? 'ring-2 ring-indigo-600 ring-offset-1' : ''}`}>
                {category.thumbnail ? (
                  <img src={category.thumbnail} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center ${uiTheme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`}>
                    <Package size={10} />
                  </div>
                )}
              </div>
              <div className="text-left">
                <span className="block text-[10px] font-bold truncate max-w-[70px]">{category.name}</span>
                <span className="block text-[8px] opacity-60 font-medium uppercase tracking-wider">{products.filter(p => p.categoryId === category.id).length}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Column: Products */}
      <div className="flex-1 flex flex-col w-[230px]">
        <div className={`p-3 border-b transition-colors ${uiTheme === 'dark' ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between mb-1.5">
            <h2 className={`text-[10px] font-black uppercase tracking-widest ${uiTheme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Products</h2>
            <button
              onClick={() => setEditorTab(null)}
              className={`p-1 rounded-lg transition-colors ${uiTheme === 'dark' ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-400'}`}
            >
              <X size={12} />
            </button>
          </div>
          <h3 className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-1.5">
            <Package size={10} />
            {filteredProducts.length} total
          </h3>
        </div>

        <div className={`p-2.5 border-b transition-colors ${uiTheme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50/50 border-slate-100'}`}>
          <div className="relative group">
            <Search size={12} className={`absolute left-2.5 top-1/2 -translate-y-1/2 transition-colors ${uiTheme === 'dark' ? 'text-slate-500 group-focus-within:text-indigo-400' : 'text-slate-300 group-focus-within:text-indigo-600'}`} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className={`w-full border rounded-lg pl-8 pr-3 py-1.5 text-[11px] font-bold outline-none transition-all focus:ring-2 ${uiTheme === 'dark' ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:ring-indigo-500/20 focus:border-indigo-500' : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-300 focus:ring-indigo-600/5 focus:border-indigo-600'}`}
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
                <X size={10} />
              </button>
            )}
          </div>
        </div>

        <div
          ref={sortableRef}
          className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar"
        >
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 border shadow-inner transition-colors ${uiTheme === 'dark' ? 'bg-slate-800/50 border-slate-700 text-slate-600' : 'bg-slate-50 border-slate-100 text-slate-200'}`}>
                <Package size={20} />
              </div>
              <p className={`text-[9px] font-black uppercase tracking-widest leading-relaxed ${uiTheme === 'dark' ? 'text-slate-600' : 'text-slate-400'}`}>
                No products found
              </p>
            </div>
          ) : (
            filteredProducts.map((product, idx) => {
              const category = categories.find(c => c.id === product.categoryId);
              return (
                <div
                  key={product.id}
                  data-id={product.id}
                  draggable="true"
                  onDragStart={(e) => handleDragStart(e, product)}
                  onDragEnd={handleDragEnd}
                  className={`group flex items-center gap-2 p-2 rounded-xl cursor-pointer transition-all border relative hover:shadow-md ${uiTheme === 'dark' ? 'bg-slate-800/40 border-slate-800 hover:bg-slate-800 hover:border-indigo-500/30 hover:shadow-black/20' : 'bg-white border-slate-100 hover:bg-slate-50 hover:border-indigo-100 hover:shadow-slate-200/40'}`}
                  onClick={() => {
                    if (dragOccurred.current) return;
                    handleAddProduct(product);
                  }}
                >
                  <span className={`absolute left-1.5 top-1.5 text-[8px] font-black ${uiTheme === 'dark' ? 'text-slate-400' : 'text-slate-400'}`}>
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <div className={`drag-handle p-0.5 -ml-0.5 cursor-grab active:cursor-grabbing shrink-0 transition-colors ${uiTheme === 'dark' ? 'text-slate-600 hover:text-slate-400' : 'text-slate-200 hover:text-slate-400'}`}>
                    <GripVertical size={12} />
                  </div>

                  <div className={`w-10 h-10 rounded-xl overflow-hidden shrink-0 border shadow-sm group-hover:scale-105 transition-transform duration-500 ${uiTheme === 'dark' ? 'bg-slate-700 border-slate-700' : 'bg-white border-slate-100'}`}>
                    {(() => {
                      const imgSrc = product.image || (product.customFields && Object.values(product.customFields).find(
                        val => typeof val === 'string' && (val.startsWith('/media') || val.startsWith('http'))
                      )) || null;
                      return imgSrc ? <img src={imgSrc as string} alt={product.name} className="w-full h-full object-cover" /> : null;
                    })()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className={`text-[10px] font-black truncate mb-0.5 transition-colors ${uiTheme === 'dark' ? 'text-slate-200 group-hover:text-indigo-400' : 'text-slate-800 group-hover:text-indigo-600'}`}>
                      {product.name}
                    </div>
                    <div className="flex items-center gap-1 mb-0.5">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: category?.color || '#cbd5e1' }} />
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter truncate">
                        {category?.name || 'General'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-1">
                      <span className={`text-[9px] font-black ${uiTheme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`}>{product.currency}{product.price}</span>
                      <button
                        onClick={(e) => handleClearFromCanvas(product.id, e)}
                        className={`w-5 h-5 flex items-center justify-center rounded-md transition-all opacity-0 group-hover:opacity-100 ${uiTheme === 'dark' ? 'hover:bg-red-500/20 text-slate-600 hover:text-red-400' : 'hover:bg-red-50 text-slate-200 hover:text-red-500'}`}
                        title="Clear from All Pages"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductLibrary;