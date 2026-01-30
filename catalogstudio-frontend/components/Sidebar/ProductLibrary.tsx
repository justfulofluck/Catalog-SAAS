import React, { useState, useEffect, useRef } from 'react';
import { Package, Search, X, Layers, GripVertical, Trash2 } from 'lucide-react';
import Sortable from 'sortablejs';
import { useStore } from '../../store/useStore';
import { Product, CanvasElement } from '../../types';

const ProductLibrary: React.FC = () => {
  const { products, addElement, currentPageIndex, catalog, reorderProducts, removeProductFromCanvas, setDraggingItem, uiTheme } = useStore();
  const [search, setSearch] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const sortableRef = useRef<HTMLDivElement>(null);

  // Filter to show all products available in the publication's category, satisfying the 'stay in list' requirement
  const availableCategoryAssets = products.filter(p =>
    p.categoryId === catalog.selectedCategoryId &&
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
          const newOrder = Array.from(sortableRef.current!.children).map(
            (el) => (el as HTMLElement).dataset.id!
          );
          reorderProducts(newOrder);
        },
      });
      return () => sortable.destroy();
    }
  }, [availableCategoryAssets.length, catalog.selectedCategoryId]);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleAddProduct = (product: Product) => {
    const timestamp = Date.now();
    const currentPage = catalog.pages[currentPageIndex];

    // Improved slot detection: find anything with 'slot' in its ID
    const slots = currentPage.elements.filter(el => el.id.includes('slot'));

    // Find slot IDs that are already "occupied" by a product
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

    // Filter slots to find the first one not already used
    const targetSlot = slots.find(s => {
      const sParts = s.id.split('-');
      const slotPartIndex = sParts.findIndex(p => p === 'slot');
      if (slotPartIndex !== -1 && slotPartIndex + 1 < sParts.length) {
        const id = `slot-${sParts[slotPartIndex + 1]}`;
        return !occupiedSlotIdentifiers.has(id);
      }
      return true; // if we can't determine, assume available
    });

    let x = 100, y = 100, width = 250, height = 320; // Increased height for the unified card
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

    // Add as a single unified Product Block
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
    <div className={`flex flex-col h-full border-r w-[320px] shrink-0 z-10 shadow-[20px_0_60px_rgba(0,0,0,0.05)] transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] font-sans ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'} ${uiTheme === 'dark' ? 'bg-[#0f172a] border-[#0f172a]' : 'bg-white border-slate-200'}`}>
      <div className={`p-6 border-b ${uiTheme === 'dark' ? 'bg-[#0f172a] border-[#1e293b]' : 'bg-white border-slate-200'}`}>
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-1">
          <Layers size={14} className="text-indigo-600" />
          Publication Assets
        </h3>
        <p className={`text-[10px] font-bold uppercase tracking-tight ${uiTheme === 'dark' ? 'text-slate-400' : 'text-slate-300'}`}>Enterprise Repository v3.1</p>
      </div>

      <div className={`p-4 border-b ${uiTheme === 'dark' ? 'bg-[#0f172a] border-[#1e293b]' : 'bg-slate-50/50'}`}>
        <div className="relative group">
          <Search size={14} className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${uiTheme === 'dark' ? 'text-slate-400 group-focus-within:text-indigo-400' : 'text-slate-300 group-focus-within:text-indigo-600'}`} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Category Assets..."
            className={`w-full rounded-2xl pl-10 pr-4 py-3 text-xs font-bold focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 outline-none transition-all border ${uiTheme === 'dark' ? 'bg-[#1e293b] border-[#1e293b] text-slate-200 placeholder-slate-400' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-300'}`}
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
              No category assets <br /> found in this view
            </p>
          </div>
        ) : (
          availableCategoryAssets.map((product, idx) => (
            <div
              key={product.id}
              data-id={product.id}
              draggable="true"
              onDragStart={(e) => handleDragStart(e, product)}
              onDragEnd={handleDragEnd}
              className={`group flex items-center gap-3 p-3 rounded-[24px] cursor-pointer transition-all border hover:shadow-xl relative ${uiTheme === 'dark' ? 'bg-[#1e293b] border-[#1e293b] hover:border-indigo-500/50' : 'bg-white hover:bg-slate-50 border-slate-100 hover:border-indigo-100'}`}
              onClick={() => handleAddProduct(product)}
            >
              <div className="drag-handle p-1 -ml-1 text-slate-200 hover:text-slate-400 cursor-grab active:cursor-grabbing shrink-0 transition-colors">
                <GripVertical size={16} />
              </div>

              <div className="w-14 h-14 rounded-2xl bg-white overflow-hidden shrink-0 border border-slate-100 shadow-sm group-hover:scale-105 transition-transform duration-500">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 min-w-0">
                <div className={`text-[11px] font-black truncate mb-1 group-hover:text-indigo-600 transition-colors ${uiTheme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>
                  <span className="text-indigo-600 mr-1 opacity-70">{idx + 1}.</span> {product.name}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-mono font-black text-slate-500 uppercase tracking-tighter bg-slate-50 px-1 py-0.5 rounded">Asset #{idx + 1}</span>
                  <div className="flex items-center gap-2">
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
            </div>
          ))
        )}
      </div>

      <div className={`p-6 border-t ${uiTheme === 'dark' ? 'bg-[#0f172a] border-t border-[#1e293b]' : 'bg-slate-50/50 border-t'}`}>
        <div className={`flex items-center gap-3 p-4 rounded-2xl border shadow-sm ${uiTheme === 'dark' ? 'bg-[#1e293b] border-[#1e293b]' : 'bg-white border-slate-200'}`}>
          <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center shrink-0">
            <Package size={14} />
          </div>
          <p className={`text-[9px] font-bold leading-relaxed ${uiTheme === 'dark' ? 'text-slate-300' : 'text-slate-500'}`}>
            <b>Product Cards:</b> Click an asset to place a unified product card into the nearest available blueprint slot.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductLibrary;
