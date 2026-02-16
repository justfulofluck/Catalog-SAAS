
import React, { useState, useEffect, useRef } from 'react';
import { Package, Search, X, Layers, GripVertical, Trash2, Folder } from 'lucide-react';
import Sortable from 'sortablejs';
import { useStore } from '../../store/useStore';
import { Product, CanvasElement } from '../../types';

const ProductLibrary: React.FC = () => {
  const { products, categories, addElement, currentPageIndex, catalog, reorderProducts, removeProductFromCanvas, setDraggingItem } = useStore();
  const [search, setSearch] = useState('');
  const sortableRef = useRef<HTMLDivElement>(null);

  // Filter to show all products available in the publication's selected categories
  // If catalog.selectedCategoryIds is empty (legacy), fall back to selectedCategoryId if it exists, or show nothing specific.
  const activeCategoryIds = catalog.selectedCategoryIds || (catalog.selectedCategoryId ? [catalog.selectedCategoryId] : []);
  
  const availableCategoryAssets = products.filter(p => 
    (activeCategoryIds.length === 0 || (p.categoryId && activeCategoryIds.includes(p.categoryId))) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()))
  );

  useEffect(() => {
    if (sortableRef.current && availableCategoryAssets.length > 0) {
      const sortable = Sortable.create(sortableRef.current, {
        animation: 150,
        handle: '.drag-handle',
        ghostClass: 'sortable-ghost',
        dragClass: 'sortable-drag',
        onEnd: (evt) => {
          // Reordering in this view might be tricky with multiple categories mixed, 
          // usually reorder applies to the global list or the specific category view.
          // For now, we update the global order based on the drag result relative to the displayed items.
          const newOrder = Array.from(sortableRef.current!.children).map(
            (el) => (el as HTMLElement).dataset.id!
          );
          reorderProducts(newOrder);
        },
      });
      return () => sortable.destroy();
    }
  }, [availableCategoryAssets.length, activeCategoryIds]);

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
      slotTag = sIdx !== -1 ? `slot-${sParts[sIdx+1]}` : `slot-${timestamp}`;
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
    const dragData = {
      type: 'product',
      url: product.image,
      name: product.name,
      productId: product.id
    };
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = 'copy';
    setDraggingItem(dragData);
  };

  const handleDragEnd = () => {
    setDraggingItem(null);
  };

  const handleClearFromCanvas = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeProductFromCanvas(productId);
  };

  return (
    <div className="flex flex-col h-full bg-white border-r w-[320px] shrink-0 z-10 shadow-[20px_0_60px_rgba(0,0,0,0.05)] animate-in slide-in-from-left-4 duration-500 font-sans">
      <div className="p-6 border-b bg-white">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-1">
          <Layers size={14} className="text-indigo-600" />
          Publication Assets
        </h3>
      </div>

      <div className="p-4 border-b bg-slate-50/50">
        <div className="relative group">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Assets..."
            className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-xs font-bold text-slate-800 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-300"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      <div 
        ref={sortableRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar"
      >
        {availableCategoryAssets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-[24px] flex items-center justify-center text-slate-200 mb-6 border border-slate-100 shadow-inner">
              <Package size={32} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
              No matching assets <br /> found in selected categories
            </p>
          </div>
        ) : (
          availableCategoryAssets.map((product, idx) => {
            const category = categories.find(c => c.id === product.categoryId);
            return (
              <div 
                key={product.id}
                data-id={product.id}
                draggable="true"
                onDragStart={(e) => handleDragStart(e, product)}
                onDragEnd={handleDragEnd}
                className="group flex items-center gap-3 p-3 rounded-[24px] bg-white hover:bg-slate-50 cursor-pointer transition-all border border-slate-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-slate-200/40 relative"
                onClick={() => handleAddProduct(product)}
              >
                <div className="drag-handle p-1 -ml-1 text-slate-200 hover:text-slate-400 cursor-grab active:cursor-grabbing shrink-0 transition-colors">
                  <GripVertical size={16} />
                </div>

                <div className="w-14 h-14 rounded-2xl bg-white overflow-hidden shrink-0 border border-slate-100 shadow-sm group-hover:scale-105 transition-transform duration-500">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-black text-slate-800 truncate mb-1 group-hover:text-indigo-600 transition-colors">
                    {product.name}
                  </div>
                  <div className="flex items-center justify-between mb-1">
                     <div className="flex items-center gap-1.5 px-1.5 py-0.5 bg-slate-50 rounded-md border border-slate-100">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: category?.color || '#cbd5e1' }} />
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter max-w-[80px] truncate">
                           {category?.name || 'General'}
                        </span>
                     </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-indigo-600">{product.currency}{product.price}</span>
                    <button 
                      onClick={(e) => handleClearFromCanvas(product.id, e)}
                      className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-200 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                      title="Clear from All Pages"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ProductLibrary;
