
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import {
  Link as LinkIcon,
  MessageSquare,
  Lock,
  Unlock,
  MoreHorizontal,
  Trash2,
  Copy,
  ArrowUpToLine,
  ArrowDownToLine,
  EyeOff,
  Eye,
  Pipette,
  Palette,
  Table as TableIcon,
  Sliders,
  Edit3,
  Type,
  RotateCcw,
  X
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { PAGE_WIDTH } from '../../constants';
import { isDarkColor } from '../Editor/fabricRenderer';

interface Props {
  onOpenMenu: (x: number, y: number) => void;
  currentFill?: string;
  currentStroke?: string;
  currentOpacity?: number;
  onFillChange?: (color: string) => void;
  onStrokeChange?: (color: string) => void;
  onLayerChange?: (action: 'front' | 'back' | 'forward' | 'backward') => void;
}

const FloatingToolbar: React.FC<Props> = ({
  onOpenMenu,
  currentFill = '#cbd5e1',
  currentStroke = 'transparent',
  currentOpacity = 1,
  onFillChange,
  onStrokeChange,
  onLayerChange
}) => {
  const {
    catalog, currentPageIndex, selectedElementIds, setSelectedElementIds, zoom,
    toggleLock, removeElement, duplicateElement, updateElement,
    removeProductFromPage, pushHistory, updateHeaderElement, updateFooterElement,
    removeHeaderElement, removeFooterElement, duplicateHeaderElement, duplicateFooterElement,
    setIsTableEditorOpen, products
  } = useStore(useShallow(state => ({
    catalog: state.catalog,
    currentPageIndex: state.currentPageIndex,
    selectedElementIds: state.selectedElementIds || [],
    setSelectedElementIds: state.setSelectedElementIds,
    zoom: state.zoom,
    toggleLock: state.toggleLock,
    removeElement: state.removeElement,
    duplicateElement: state.duplicateElement,
    updateElement: state.updateElement,
    removeProductFromPage: state.removeProductFromPage,
    pushHistory: state.pushHistory,
    updateHeaderElement: state.updateHeaderElement,
    updateFooterElement: state.updateFooterElement,
    removeHeaderElement: state.removeHeaderElement,
    removeFooterElement: state.removeFooterElement,
    duplicateHeaderElement: state.duplicateHeaderElement,
    duplicateFooterElement: state.duplicateFooterElement,
    setIsPropertyPanelOpen: state.setIsPropertyPanelOpen,
    setIsTableEditorOpen: state.setIsTableEditorOpen,
    products: state.products || [],
  })));

  const currentPage = catalog.pages?.[currentPageIndex];

  // Find selected elements across page, header, and footer
  const selectedElements = useMemo(() => {
    if (!selectedElementIds || selectedElementIds.length === 0) return [];
    const pageElems = currentPage?.elements?.filter(el => el && selectedElementIds.includes(el.id)) || [];
    const headerElems = catalog.headerElements?.filter(el => el && selectedElementIds.includes(el.id)) || [];
    const footerElems = catalog.footerElements?.filter(el => el && selectedElementIds.includes(el.id)) || [];
    return [...pageElems, ...headerElems, ...footerElems];
  }, [currentPage?.elements, catalog.headerElements, catalog.footerElements, selectedElementIds]);

  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showLinkPopover, setShowLinkPopover] = useState(false);
  const [showProductPopover, setShowProductPopover] = useState(false);
  const [tempLink, setTempLink] = useState('');
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const linkPopoverRef = useRef<HTMLDivElement>(null);
  const productPopoverRef = useRef<HTMLDivElement>(null);
  const fillInputRef = useRef<HTMLInputElement>(null);
  const strokeInputRef = useRef<HTMLInputElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleEditProductCard = (e: any) => {
      if (e.detail?.id) {
        setSelectedElementIds([e.detail.id]);
        setShowProductPopover(true);
      }
    };
    window.addEventListener('catalog:editProductCard', handleEditProductCard);
    return () => window.removeEventListener('catalog:editProductCard', handleEditProductCard);
  }, [setSelectedElementIds]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) setShowMoreMenu(false);
      if (linkPopoverRef.current && !linkPopoverRef.current.contains(e.target as Node)) setShowLinkPopover(false);
      if (productPopoverRef.current && !productPopoverRef.current.contains(e.target as Node)) setShowProductPopover(false);
    };
    if (showMoreMenu || showLinkPopover || showProductPopover) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMoreMenu, showLinkPopover, showProductPopover]);

  if (selectedElements.length === 0) return null;

  const element = selectedElements[0];
  const isAnyLocked = selectedElements.some(el => el.locked);
  const isAnyHidden = selectedElements.some(el => el.visible === false);
  const productElements = selectedElements.filter(el => el.productId);
  const productIds: string[] = Array.from(new Set(productElements.map(el => el.productId!)));

  // Compute the actual visual bounding box after rotation
  // Konva rotates around the element's (x, y) top-left corner
  const rad = ((element.rotation || 0) * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const ox = element.x; // rotation origin
  const oy = element.y;
  const w = element.width;
  const h = element.height;

  // Rotate 4 corners around origin (ox, oy)
  const corners = [
    { x: ox, y: oy },                           // top-left
    { x: ox + w * cos, y: oy + w * sin },        // top-right
    { x: ox + w * cos - h * sin, y: oy + w * sin + h * cos }, // bottom-right
    { x: ox - h * sin, y: oy + h * cos },        // bottom-left
  ];

  const minX = Math.min(...corners.map(c => c.x));
  const maxX = Math.max(...corners.map(c => c.x));
  const minY = Math.min(...corners.map(c => c.y));
  const maxY = Math.max(...corners.map(c => c.y));

  const centerX = (minX + maxX) / 2;

  // Position toolbar centered above selection, flip to bottom if no space
  const toolbarHeight = 44; // Approx height of horizontal bar
  let toolbarTop = minY * zoom - toolbarHeight - 45; // Increased offset to clear rotate handle
  const isOffTop = toolbarTop < 10;

  if (isOffTop) {
    toolbarTop = maxY * zoom + 12;
  }

  const toolbarStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${centerX * zoom}px`,
    top: `${toolbarTop}px`,
    transform: 'translateX(-50%)',
    zIndex: 900,
    pointerEvents: 'auto',
  };

  const handleLockClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectedElementIds.forEach(id => toggleLock(currentPageIndex, id));
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    pushHistory();
    selectedElementIds.forEach(id => internalRemove(id));
    setSelectedElementIds([]);
    setShowMoreMenu(false);
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    pushHistory();
    selectedElementIds.forEach(id => {
      if (catalog.headerElements?.some(h => h.id === id)) duplicateHeaderElement(id);
      else if (catalog.footerElements?.some(f => f.id === id)) duplicateFooterElement(id);
      else duplicateElement(currentPageIndex, id);
    });
    setShowMoreMenu(false);
  };

  const handleVisibility = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newVisible = isAnyHidden;
    selectedElementIds.forEach(id => {
      if (catalog.headerElements?.some(h => h.id === id)) updateHeaderElement(id, { visible: newVisible });
      else if (catalog.footerElements?.some(f => f.id === id)) updateFooterElement(id, { visible: newVisible });
      else updateElement(currentPageIndex, id, { visible: newVisible });
    });
    setShowMoreMenu(false);
  };

  const internalUpdate = (id: string, updates: any) => {
    if (catalog.headerElements?.some(h => h.id === id)) updateHeaderElement(id, updates);
    else if (catalog.footerElements?.some(f => f.id === id)) updateFooterElement(id, updates);
    else updateElement(currentPageIndex, id, updates);
  };

  const internalRemove = (id: string) => {
    if (catalog.headerElements?.some(h => h.id === id)) removeHeaderElement(id);
    else if (catalog.footerElements?.some(f => f.id === id)) removeFooterElement(id);
    else removeElement(currentPageIndex, id);
  };

  const handleBringToFront = (e: React.MouseEvent) => {
    e.stopPropagation();
    pushHistory();
    const allElements = [...(currentPage?.elements || []), ...(catalog.headerElements || []), ...(catalog.footerElements || [])];
    const maxZ = Math.max(...allElements.map(el => el.zIndex || 0));
    selectedElementIds.forEach((id, i) => internalUpdate(id, { zIndex: maxZ + 1 + i }));
  };

  const handleSendToBack = (e: React.MouseEvent) => {
    e.stopPropagation();
    pushHistory();
    const allElements = [...(currentPage?.elements || []), ...(catalog.headerElements || []), ...(catalog.footerElements || [])];
    const minZ = Math.min(...allElements.map(el => el.zIndex || 0));
    selectedElementIds.forEach((id, i) => internalUpdate(id, { zIndex: minZ - 1 - i }));
  };



  const activeFill = element?.fill || currentFill;
  const activeStroke = element?.stroke || currentStroke;

  const btnClass = 'p-1.5 rounded-[4px] text-[#E2DCC8]/80 hover:text-white hover:bg-[#0F3D3E]/40 transition-all active:scale-95';

  const isTableElement = element.type === 'table' || !!element.tableData;

  return (
    <div
      className="flex flex-row items-center gap-0.5 bg-[#141416] text-[#EDEDED] shadow-[0_12px_40px_rgba(0,0,0,0.6)] border border-[#E2DCC8]/20 rounded-[4px] p-1 animate-in zoom-in-95 duration-200 backdrop-blur-md"
      style={toolbarStyle as React.CSSProperties}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >

      {/* Fill color */}
      <button
        className={btnClass}
        title="Fill Color"
        onClick={() => {
          useStore.getState().openColorPicker({
            type: 'fill',
            color: activeFill,
            title: 'Fill Color',
            onChange: (color) => {
              onFillChange?.(color);
              selectedElementIds.forEach(id => {
                const el = selectedElements.find(item => item.id === id);
                const isLine = el?.shapeType === 'line' || el?.shapeType === 'curved-line' || el?.shapeType === 'elbow-line';
                internalUpdate(id, isLine ? { fill: color, stroke: color } : { fill: color });
              });
            }
          });
        }}
      >
        <div className="w-5 h-5 rounded-[2px] border border-white/20 shadow-sm" style={{ backgroundColor: activeFill }} />
      </button>

      {/* Stroke color */}
      <button
        className={btnClass}
        title="Stroke / Border Color"
        onClick={() => {
          useStore.getState().openColorPicker({
            type: 'stroke',
            color: activeStroke === 'transparent' ? '#000000' : activeStroke,
            title: 'Border / Stroke Color',
            onChange: (color) => {
              onStrokeChange?.(color);
              selectedElementIds.forEach(id => {
                const el = selectedElements.find(item => item.id === id);
                const isLine = el?.shapeType === 'line' || el?.shapeType === 'curved-line' || el?.shapeType === 'elbow-line';
                internalUpdate(id, isLine 
                  ? { stroke: color, fill: color, strokeWidth: Math.max(element.strokeWidth || 0, 2) } 
                  : { stroke: color, strokeWidth: Math.max(element.strokeWidth || 0, 2) }
                );
              });
            }
          });
        }}
      >
        <div className="w-5 h-5 rounded-[2px] border-2" style={{ borderColor: activeStroke === 'transparent' ? '#666' : activeStroke, backgroundColor: 'transparent' }}>
          {activeStroke === 'transparent' && <div className="w-full h-full flex items-center justify-center text-red-400 text-[10px] font-bold leading-none">\</div>}
        </div>
      </button>

      {/* Product Block specific: Text Color, Quick Font Size Stepper, and Edit Content Button */}
      {element.type === 'product-block' && (
        <>
          {/* Card Text Color */}
          <button
            className={btnClass}
            title="Card Text & Title Color"
            onClick={() => {
              const defaultColor = isDarkColor(element.fill) ? '#ffffff' : '#0f172a';
              useStore.getState().openColorPicker({
                type: 'text',
                color: element.titleColor || defaultColor,
                title: 'Card Text Color',
                onChange: (color) => {
                  internalUpdate(element.id, {
                    titleColor: color,
                    textColor: color
                  });
                }
              });
            }}
          >
            <div className="w-5 h-5 rounded-[2px] border border-white/20 shadow-sm flex items-center justify-center bg-[#18181b]">
              <Type size={13} className="text-white" />
            </div>
          </button>

          {/* Edit Card Content Popover Button */}
          <div className="relative">
            <button
              className={`p-1.5 rounded-[4px] flex items-center gap-1.5 text-xs font-bold transition-all ${showProductPopover ? 'bg-[#0F3D3E] text-white border border-[#E2DCC8]/40 shadow-sm' : btnClass}`}
              title="Edit Card Content, Specs & Font Sizes"
              onClick={() => setShowProductPopover(!showProductPopover)}
            >
              <Edit3 size={15} strokeWidth={2} />
              <span className="text-[10px] font-bold uppercase tracking-wider whitespace-nowrap hidden sm:inline">Edit</span>
            </button>

            {/* Edit Card Popover */}
            {showProductPopover && (
              <div
                ref={productPopoverRef}
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 p-4 bg-[#18181b] border border-[#27272a] rounded-[10px] shadow-[0_20px_50px_rgba(0,0,0,0.85)] w-[360px] max-h-[480px] overflow-y-auto custom-scrollbar z-[999] flex flex-col gap-3 text-left animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#27272a]">
                  <div className="flex items-center gap-2">
                    <Edit3 size={15} className="text-indigo-400" />
                    <span className="text-xs font-bold text-white tracking-wide">Edit Product Card</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {(element.customTitle !== undefined || element.customPrice !== undefined || element.customSku !== undefined || element.customDesc !== undefined || element.titleFontSize || element.priceFontSize || element.fontSize || element.titleColor || element.priceColor || element.textColor || element.borderRadius !== undefined) && (
                      <button
                        onClick={() => {
                          internalUpdate(element.id, {
                            customTitle: undefined,
                            customPrice: undefined,
                            customSku: undefined,
                            customDesc: undefined,
                            titleFontSize: undefined,
                            priceFontSize: undefined,
                            fontSize: undefined,
                            titleColor: undefined,
                            priceColor: undefined,
                            textColor: undefined,
                            borderRadius: undefined,
                          });
                        }}
                        className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium hover:underline"
                        title="Reset all edits to product database defaults"
                      >
                        <RotateCcw size={11} /> Reset
                      </button>
                    )}
                    <button
                      onClick={() => setShowProductPopover(false)}
                      className="p-1 text-slate-400 hover:text-white rounded hover:bg-white/10"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>

                {/* Title / Name */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Product Name / Title</label>
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] text-slate-500 mr-0.5">Size:</span>
                      <button
                        onClick={() => {
                          const currentSize = element.titleFontSize || Math.max(11, Math.min(16, Math.round(element.width * 0.065)));
                          internalUpdate(element.id, { titleFontSize: Math.max(8, currentSize - 1) });
                        }}
                        className="w-5 h-5 flex items-center justify-center bg-[#27272a] hover:bg-[#3f3f46] text-white rounded text-xs"
                      >-</button>
                      <span className="text-[10px] font-mono font-bold w-6 text-center text-indigo-400">
                        {element.titleFontSize || Math.max(11, Math.min(16, Math.round(element.width * 0.065)))}
                      </span>
                      <button
                        onClick={() => {
                          const currentSize = element.titleFontSize || Math.max(11, Math.min(16, Math.round(element.width * 0.065)));
                          internalUpdate(element.id, { titleFontSize: currentSize + 1 });
                        }}
                        className="w-5 h-5 flex items-center justify-center bg-[#27272a] hover:bg-[#3f3f46] text-white rounded text-xs"
                      >+</button>
                      
                      {/* Title Color Button */}
                      <button
                        onClick={() => {
                          useStore.getState().openColorPicker({
                            type: 'text',
                            color: element.titleColor || (isDarkColor(element.fill) ? '#ffffff' : '#0f172a'),
                            title: 'Title Color',
                            onChange: (color) => internalUpdate(element.id, { titleColor: color })
                          });
                        }}
                        className="w-5 h-5 rounded ml-1 border border-white/20 shadow-sm flex items-center justify-center"
                        style={{ backgroundColor: element.titleColor || (isDarkColor(element.fill) ? '#ffffff' : '#0f172a') }}
                        title="Title Color"
                      />
                    </div>
                  </div>
                  <input
                    type="text"
                    value={element.customTitle !== undefined ? element.customTitle : (products.find(p => p.id === element.productId)?.name || '')}
                    placeholder="Product Title..."
                    onChange={(e) => internalUpdate(element.id, { customTitle: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#121214] border border-[#2e2e32] rounded-[6px] text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Price */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Price</label>
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] text-slate-500 mr-0.5">Size:</span>
                      <button
                        onClick={() => {
                          const currentSize = element.priceFontSize || Math.max(11, Math.min(15, Math.round(element.width * 0.058)));
                          internalUpdate(element.id, { priceFontSize: Math.max(8, currentSize - 1) });
                        }}
                        className="w-5 h-5 flex items-center justify-center bg-[#27272a] hover:bg-[#3f3f46] text-white rounded text-xs"
                      >-</button>
                      <span className="text-[10px] font-mono font-bold w-6 text-center text-indigo-400">
                        {element.priceFontSize || Math.max(11, Math.min(15, Math.round(element.width * 0.058)))}
                      </span>
                      <button
                        onClick={() => {
                          const currentSize = element.priceFontSize || Math.max(11, Math.min(15, Math.round(element.width * 0.058)));
                          internalUpdate(element.id, { priceFontSize: currentSize + 1 });
                        }}
                        className="w-5 h-5 flex items-center justify-center bg-[#27272a] hover:bg-[#3f3f46] text-white rounded text-xs"
                      >+</button>

                      {/* Price Color Button */}
                      <button
                        onClick={() => {
                          useStore.getState().openColorPicker({
                            type: 'text',
                            color: element.priceColor || (isDarkColor(element.fill) ? '#38bdf8' : '#4f46e5'),
                            title: 'Price Color',
                            onChange: (color) => internalUpdate(element.id, { priceColor: color })
                          });
                        }}
                        className="w-5 h-5 rounded ml-1 border border-white/20 shadow-sm flex items-center justify-center"
                        style={{ backgroundColor: element.priceColor || (isDarkColor(element.fill) ? '#38bdf8' : '#4f46e5') }}
                        title="Price Color"
                      />
                    </div>
                  </div>
                  <input
                    type="text"
                    value={element.customPrice !== undefined ? element.customPrice : (() => {
                      const prod = products.find(p => p.id === element.productId);
                      return prod ? `${prod.currency || '₹'}${prod.price || ''}` : '';
                    })()}
                    placeholder="e.g. ₹1300"
                    onChange={(e) => internalUpdate(element.id, { customPrice: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#121214] border border-[#2e2e32] rounded-[6px] text-white focus:outline-none focus:border-indigo-500 font-bold"
                  />
                </div>

                {/* SKU */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SKU / Model Number</label>
                  <input
                    type="text"
                    value={element.customSku !== undefined ? element.customSku : (products.find(p => p.id === element.productId)?.sku || '')}
                    placeholder="SKU Code..."
                    onChange={(e) => internalUpdate(element.id, { customSku: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#121214] border border-[#2e2e32] rounded-[6px] text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                {/* Specifications / Details Description */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Specs & Details (Lines)</label>
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] text-slate-500 mr-0.5">Size:</span>
                      <button
                        onClick={() => {
                          const currentSize = element.fontSize || 9;
                          internalUpdate(element.id, { fontSize: Math.max(6, currentSize - 1) });
                        }}
                        className="w-5 h-5 flex items-center justify-center bg-[#27272a] hover:bg-[#3f3f46] text-white rounded text-xs"
                      >-</button>
                      <span className="text-[10px] font-mono font-bold w-6 text-center text-indigo-400">
                        {element.fontSize || 9}
                      </span>
                      <button
                        onClick={() => {
                          const currentSize = element.fontSize || 9;
                          internalUpdate(element.id, { fontSize: currentSize + 1 });
                        }}
                        className="w-5 h-5 flex items-center justify-center bg-[#27272a] hover:bg-[#3f3f46] text-white rounded text-xs"
                      >+</button>

                      {/* Specs Text Color Button */}
                      <button
                        onClick={() => {
                          useStore.getState().openColorPicker({
                            type: 'text',
                            color: element.textColor || (isDarkColor(element.fill) ? '#cbd5e1' : '#475569'),
                            title: 'Specs Text Color',
                            onChange: (color) => internalUpdate(element.id, { textColor: color })
                          });
                        }}
                        className="w-5 h-5 rounded ml-1 border border-white/20 shadow-sm flex items-center justify-center"
                        style={{ backgroundColor: element.textColor || (isDarkColor(element.fill) ? '#cbd5e1' : '#475569') }}
                        title="Specs Text Color"
                      />
                    </div>
                  </div>
                  <textarea
                    rows={4}
                    value={element.customDesc !== undefined ? element.customDesc : (() => {
                      const prod = products.find(p => p.id === element.productId);
                      if (!prod) return '';
                      const lines: string[] = [];
                      if (catalog?.showSKU !== false && prod.sku) lines.push(`SKU: ${prod.sku}`);
                      if (prod.description) lines.push(prod.description);
                      if (prod.customFields) {
                        Object.entries(prod.customFields).forEach(([k, v]) => {
                          if (v !== undefined && v !== null && v !== '' && typeof v !== 'object') lines.push(`• ${k}: ${v}`);
                        });
                      }
                      return lines.join('\n');
                    })()}
                    placeholder="Enter specs line by line..."
                    onChange={(e) => internalUpdate(element.id, { customDesc: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#121214] border border-[#2e2e32] rounded-[6px] text-white focus:outline-none focus:border-indigo-500 font-mono resize-y leading-relaxed"
                  />
                </div>

                {/* Border Radius */}
                <div className="space-y-1 pt-1 border-t border-[#27272a]">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                    <span>Corner Roundness</span>
                    <span className="text-white font-mono">{element.borderRadius !== undefined ? element.borderRadius : 4}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    step="1"
                    value={element.borderRadius !== undefined ? element.borderRadius : 4}
                    onChange={(e) => internalUpdate(element.id, { borderRadius: parseInt(e.target.value, 10) })}
                    className="w-full h-1 bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Icon color (if element has icons) */}
      {element.iconConfig && (
        <button
          className={btnClass}
          title="Icon Color"
          onClick={() => {
            useStore.getState().openColorPicker({
              type: 'fill',
              elementId: element.id,
              color: element.iconConfig?.color || '#ffffff',
              title: 'Icon Color',
              onChange: (color) => {
                updateElement(currentPageIndex, element.id, {
                  iconConfig: { ...element.iconConfig!, color }
                });
              }
            });
          }}
        >
          <div className="w-5 h-5 rounded-[2px] border border-white/20 shadow-sm flex items-center justify-center bg-[#18181b] relative">
            <Palette size={12} className="text-gray-400 absolute inset-0 m-auto" />
            <div className="w-4 h-4 rounded-[2px] border border-white/10" style={{ backgroundColor: element.iconConfig.color || '#ffffff' }} />
          </div>
        </button>
      )}

      <div className="w-[1px] h-5 bg-[#E2DCC8]/20 mx-0.5" />

      {/* Bring to front */}
      <button className={btnClass} title="Bring to Front" onClick={handleBringToFront}>
        <ArrowUpToLine size={16} strokeWidth={2} />
      </button>

      {/* Send to back */}
      <button className={btnClass} title="Send to Back" onClick={handleSendToBack}>
        <ArrowDownToLine size={16} strokeWidth={2} />
      </button>

      {/* Interactive Link Button */}
      <div className="relative">
        <button
          className={`${btnClass} ${element.linkUrl || element.iconConfig?.linkUrl ? 'text-[#25D366] bg-[#25D366]/15' : ''}`}
          title={element.linkUrl || element.iconConfig?.linkUrl ? `Active Link: ${element.linkUrl || element.iconConfig?.linkUrl}` : "Attach Link / Action"}
          onClick={() => {
            setTempLink(element.linkUrl || element.iconConfig?.linkUrl || '');
            setShowLinkPopover(!showLinkPopover);
          }}
        >
          <LinkIcon size={16} strokeWidth={2} />
        </button>

        {showLinkPopover && (
          <div
            ref={linkPopoverRef}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 bg-[#18181b] border border-[#262626] rounded-[4px] shadow-2xl w-64 z-[999] flex flex-col gap-2"
          >
            <div className="flex items-center justify-between text-[11px] font-bold text-white">
              <span>Interactive Link / Action</span>
              {(element.linkUrl || element.iconConfig?.linkUrl) && (
                <button
                  onClick={() => {
                    updateElement(currentPageIndex, element.id, {
                      linkUrl: undefined,
                      linkType: undefined,
                      iconConfig: element.iconConfig ? { ...element.iconConfig, linkUrl: undefined, linkType: undefined } : undefined
                    });
                    setTempLink('');
                    setShowLinkPopover(false);
                  }}
                  className="text-[9px] text-red-400 hover:underline"
                >
                  Remove
                </button>
              )}
            </div>
            <input
              type="text"
              placeholder="https://wa.me/..., tel:..., URL"
              value={tempLink}
              onChange={(e) => setTempLink(e.target.value)}
              className="w-full px-2 py-1 text-xs bg-[#121212] border border-[#333] rounded-[3px] text-white focus:outline-none focus:border-[#0F3D3E]"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  updateElement(currentPageIndex, element.id, {
                    linkUrl: tempLink.trim() || undefined,
                    iconConfig: element.iconConfig ? { ...element.iconConfig, linkUrl: tempLink.trim() || undefined } : undefined
                  });
                  setShowLinkPopover(false);
                }
              }}
            />
            <div className="flex justify-end gap-1.5">
              <button
                onClick={() => setShowLinkPopover(false)}
                className="px-2 py-0.5 text-[10px] text-slate-400 hover:text-white rounded-[2px]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateElement(currentPageIndex, element.id, {
                    linkUrl: tempLink.trim() || undefined,
                    iconConfig: element.iconConfig ? { ...element.iconConfig, linkUrl: tempLink.trim() || undefined } : undefined
                  });
                  setShowLinkPopover(false);
                }}
                className="px-2.5 py-0.5 text-[10px] font-semibold bg-[#0F3D3E] text-white rounded-[2px] hover:bg-[#155455]"
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="w-[1px] h-5 bg-[#E2DCC8]/20 mx-0.5" />

      {/* Lock */}
      <button
        onClick={handleLockClick}
        className={`p-1.5 rounded-[4px] transition-all ${isAnyLocked ? 'text-white bg-[#0F3D3E] border border-[#E2DCC8]/30 shadow-sm' : btnClass}`}
        title={isAnyLocked ? "Unlock" : "Lock"}
      >
        {isAnyLocked ? <Lock size={16} strokeWidth={2} /> : <Unlock size={16} strokeWidth={2} />}
      </button>

      {/* Duplicate */}
      <button className={btnClass} title="Duplicate" onClick={handleDuplicate}>
        <Copy size={16} strokeWidth={2} />
      </button>

      {/* Delete */}
      <button
        className="p-1.5 rounded-[4px] text-[#E2DCC8]/70 hover:text-red-400 hover:bg-red-500/20 transition-all active:scale-95"
        title="Delete"
        onClick={handleDelete}
      >
        <Trash2 size={16} strokeWidth={2} />
      </button>

    </div>
  );
};

export default FloatingToolbar;
