
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
  X,
  Layers,
  Image as ImageIcon
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
  const [showOverlayPopover, setShowOverlayPopover] = useState(false);
  const [tempLink, setTempLink] = useState('');
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const linkPopoverRef = useRef<HTMLDivElement>(null);
  const overlayPopoverRef = useRef<HTMLDivElement>(null);
  const fillInputRef = useRef<HTMLInputElement>(null);
  const strokeInputRef = useRef<HTMLInputElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleEditProductCard = (e: any) => {
      if (e.detail?.id) {
        setSelectedElementIds([e.detail.id]);
        useStore.getState().setEditorTab('single-items');
        useStore.getState().setSidebarExpanded(true);
      }
    };
    window.addEventListener('catalog:editProductCard', handleEditProductCard);
    return () => window.removeEventListener('catalog:editProductCard', handleEditProductCard);
  }, [setSelectedElementIds]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) setShowMoreMenu(false);
      if (linkPopoverRef.current && !linkPopoverRef.current.contains(e.target as Node)) setShowLinkPopover(false);
      if (overlayPopoverRef.current && !overlayPopoverRef.current.contains(e.target as Node)) setShowOverlayPopover(false);
    };
    if (showMoreMenu || showLinkPopover || showOverlayPopover) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMoreMenu, showLinkPopover, showOverlayPopover]);

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
  const isPopoverOffTop = toolbarTop < 240;

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

      {/* Fill color (for shapes/non-image elements) */}
      {element.type !== 'image' && (
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
      )}

      {/* Image Overlay Controls */}
      {element.type === 'image' && (
        <div className="relative" ref={overlayPopoverRef}>
          <button
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] text-[11px] font-bold tracking-tight transition-all active:scale-95 ${
              element.overlayEnabled
                ? 'bg-blue-600 text-white shadow-sm ring-1 ring-white/20'
                : 'text-[#E2DCC8]/90 hover:text-white bg-[#0F3D3E]/40 hover:bg-[#0F3D3E]/60 border border-[#E2DCC8]/20'
            }`}
            title="Image Overlay Settings"
            onClick={(e) => {
              e.stopPropagation();
              setShowOverlayPopover(!showOverlayPopover);
            }}
          >
            <Layers size={14} strokeWidth={2.2} />
            <span>Overlay</span>
            {element.overlayEnabled && (
              <div
                className="w-2.5 h-2.5 rounded-full border border-white/40 shadow-sm ml-0.5"
                style={{ backgroundColor: element.overlayColor || '#ea580c' }}
              />
            )}
          </button>

          {/* Floating Toolbar Overlay Popover */}
          {showOverlayPopover && (
            <div
              className={`absolute left-1/2 -translate-x-1/2 w-64 p-4 rounded-[12px] bg-[#18181b] border border-white/10 text-white shadow-[0_20px_60px_rgba(0,0,0,0.85)] z-[2000] animate-in zoom-in-95 duration-150 backdrop-blur-xl ${
                isPopoverOffTop ? 'top-full mt-2' : 'bottom-full mb-2'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with Switch */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-1.5">
                  <Layers size={14} className="text-blue-400" />
                  <span className="text-xs font-bold tracking-tight text-white">Image Overlay</span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={element.overlayEnabled ?? false}
                  onClick={() => {
                    const newEnabled = !element.overlayEnabled;
                    updateElement(currentPageIndex, element.id, {
                      overlayEnabled: newEnabled,
                      overlayColor: element.overlayColor || '#ea580c',
                      overlayOpacity: element.overlayOpacity !== undefined ? element.overlayOpacity : 22
                    });
                  }}
                  className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    element.overlayEnabled ? 'bg-blue-600' : 'bg-zinc-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      element.overlayEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Controls */}
              <div className={`pt-3 space-y-3 ${element.overlayEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                {/* Color Row */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-300">Color</span>
                  <label
                    className="w-7 h-7 rounded-[4px] border border-white/20 shadow-sm cursor-pointer block relative transition-transform hover:scale-105"
                    style={{ backgroundColor: element.overlayColor || '#ea580c' }}
                  >
                    <input
                      type="color"
                      value={element.overlayColor || '#ea580c'}
                      onChange={(e) => updateElement(currentPageIndex, element.id, { overlayColor: e.target.value })}
                      className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                    />
                  </label>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {['#ea580c', '#3b82f6', '#10b981', '#6366f1', '#ec4899', '#f59e0b', '#000000', '#ffffff'].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => updateElement(currentPageIndex, element.id, { overlayColor: c })}
                      className={`w-3.5 h-3.5 rounded-full border transition-transform hover:scale-110 ${
                        (element.overlayColor || '#ea580c').toLowerCase() === c.toLowerCase() ? 'ring-2 ring-blue-500 ring-offset-1 border-white' : 'border-white/10'
                      }`}
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>

                {/* Opacity Row */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-zinc-300 w-12 shrink-0">Opacity</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={element.overlayOpacity !== undefined ? element.overlayOpacity : 22}
                    onChange={(e) => updateElement(currentPageIndex, element.id, { overlayOpacity: Number(e.target.value) })}
                    className="flex-1 h-1.5 rounded-lg appearance-none cursor-pointer accent-blue-600 bg-zinc-700"
                  />
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={element.overlayOpacity !== undefined ? element.overlayOpacity : 22}
                    onChange={(e) => {
                      const val = Math.min(100, Math.max(0, Number(e.target.value) || 0));
                      updateElement(currentPageIndex, element.id, { overlayOpacity: val });
                    }}
                    className="w-12 px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded-[4px] text-center text-xs font-semibold text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
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
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 bg-[#18181b]/95 backdrop-blur-xl border border-[#2c2c30] rounded-[6px] shadow-2xl w-64 z-[999] flex flex-col gap-2 animate-popover-center"
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
