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
  Crop as CropIcon,
  Image as ImageIcon,
  ArrowRight,
  ArrowLeft,
  ArrowDown,
  ArrowUp,
  Play,
  Bold,
  Italic,
  Underline,
  Minus,
  Plus,
  Square,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ChevronDown,
  Search
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { PAGE_WIDTH, CATEGORIZED_FONTS } from '../../constants';
import { isDarkColor } from '../Editor/fabricRenderer';
import { colorToRgba } from '../../utils/imageUtils';

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
  const [showOpacityPopover, setShowOpacityPopover] = useState(false);
  const [isFontMenuOpen, setIsFontMenuOpen] = useState(false);
  const [fontSearch, setFontSearch] = useState('');
  const [showTableColorsPopover, setShowTableColorsPopover] = useState(false);
  const [showShapeBorderPopover, setShowShapeBorderPopover] = useState(false);
  const [showShapeFillPopover, setShowShapeFillPopover] = useState(false);
  const [tempLink, setTempLink] = useState('');
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const linkPopoverRef = useRef<HTMLDivElement>(null);
  const overlayPopoverRef = useRef<HTMLDivElement>(null);
  const opacityPopoverRef = useRef<HTMLDivElement>(null);
  const fontMenuRef = useRef<HTMLDivElement>(null);
  const tableColorsRef = useRef<HTMLDivElement>(null);
  const shapeBorderRef = useRef<HTMLDivElement>(null);
  const shapeFillRef = useRef<HTMLDivElement>(null);
  const fontScrollRef = useRef<HTMLDivElement>(null);
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
      if (opacityPopoverRef.current && !opacityPopoverRef.current.contains(e.target as Node)) setShowOpacityPopover(false);
      if (fontMenuRef.current && !fontMenuRef.current.contains(e.target as Node)) setIsFontMenuOpen(false);
      if (tableColorsRef.current && !tableColorsRef.current.contains(e.target as Node)) setShowTableColorsPopover(false);
      if (shapeBorderRef.current && !shapeBorderRef.current.contains(e.target as Node)) setShowShapeBorderPopover(false);
      if (shapeFillRef.current && !shapeFillRef.current.contains(e.target as Node)) setShowShapeFillPopover(false);
    };
    if (showMoreMenu || showLinkPopover || showOverlayPopover || showOpacityPopover || isFontMenuOpen || showTableColorsPopover || showShapeBorderPopover || showShapeFillPopover) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMoreMenu, showLinkPopover, showOverlayPopover, showOpacityPopover, isFontMenuOpen, showTableColorsPopover, showShapeBorderPopover, showShapeFillPopover]);

  useEffect(() => {
    const stopProp = (e: WheelEvent) => e.stopPropagation();
    const fontEl = fontScrollRef.current;
    if (isFontMenuOpen && fontEl) fontEl.addEventListener('wheel', stopProp, { passive: false });
    return () => {
      if (fontEl) fontEl.removeEventListener('wheel', stopProp);
    };
  }, [isFontMenuOpen]);

  const filteredFonts = useMemo(() => {
    return CATEGORIZED_FONTS.map(group => ({
      ...group,
      fonts: group.fonts.filter(f => f.toLowerCase().includes(fontSearch.toLowerCase()))
    })).filter(group => group.fonts.length > 0);
  }, [fontSearch]);

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

  // Position toolbar centered above selection, flip to bottom only if pushed extremely off-canvas
  const toolbarHeight = 44; // Approx height of horizontal bar
  let toolbarTop = minY * zoom - toolbarHeight - 16;
  const isOffTop = toolbarTop < -80;
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
  const td = element.tableData || {
    headers: ['', '', ''],
    rows: [['', '', ''], ['', '', ''], ['', '', ''], ['', '', '']],
  };
  const tableFont = td.fontFamily || 'Inter';
  const tableFontSize = Math.round(td.fontSize || 10);
  const tableTextColor = td.textColor || '#0F172A';
  const tableHeaderBg = td.headerBg || element.fill || '#cbd5e1';
  const tableRowBg = td.rowBg || '#ffffff';
  const tableBorderColor = td.borderColor || '#cbd5e1';
  const isTableBold = td.fontWeight === 'bold' || td.fontWeight === '700' || td.fontWeight === '900';
  const isTableItalic = td.fontStyle === 'italic';
  const isTableUnderline = !!(td.textDecoration?.includes('underline'));
  const tableAlign = td.textAlign || 'center';

  const isShapeElement = (element.type === 'shape' || !!element.shapeType || element.type === 'comment') && !isTableElement;
  const shapeFillColor = element.fill !== undefined ? element.fill : '#cbd5e1';
  const isShapeFillTransparent = !element.fill || element.fill === 'transparent' || element.fill === 'none';
  const shapeStrokeColor = element.stroke && element.stroke !== 'transparent' && element.stroke !== 'none' ? element.stroke : '#000000';
  const shapeStrokeWidth = (element.stroke && element.stroke !== 'transparent' && element.stroke !== 'none')
    ? (element.strokeWidth !== undefined ? element.strokeWidth : 2)
    : (element.strokeWidth || 0);
  const hasShapeBorder = shapeStrokeWidth > 0 && element.stroke !== 'transparent' && element.stroke !== 'none';
  const shapeStrokeDash = element.strokeDashArray || [];
  const shapeBorderStyle = (!hasShapeBorder || shapeStrokeDash.length === 0)
    ? (hasShapeBorder ? 'solid' : 'none')
    : (shapeStrokeDash[0] <= 3 ? 'dotted' : 'dashed');
  const shapeCornerRadius = element.rx !== undefined ? element.rx : (element.cornerRadius || 0);
  const supportsCornerRadius = element.shapeType === 'rect' || element.shapeType === 'roundedRect' || !element.shapeType || element.shapeType === 'square';

  return (
    <div
      className="flex flex-row items-center gap-0.5 bg-[#141416] text-[#EDEDED] shadow-[0_12px_40px_rgba(0,0,0,0.6)] border border-[#E2DCC8]/20 rounded-[4px] p-1 animate-in zoom-in-95 duration-200 backdrop-blur-md"
      style={toolbarStyle as React.CSSProperties}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >

      {/* TABLE TEXT CONTROLS */}
      {isTableElement && (
        <>
          {/* 1. Font Family Dropdown */}
          <div className="relative" ref={fontMenuRef}>
            <button
              type="button"
              onClick={() => setIsFontMenuOpen(v => !v)}
              onMouseDown={(e) => e.preventDefault()}
              className={`flex items-center gap-1 px-2 py-1 rounded-[4px] text-[12px] font-bold tracking-tight transition-all active:scale-95 ${
                isFontMenuOpen ? 'bg-[#0F3D3E] text-white border border-[#E2DCC8]/30' : 'text-[#F1F1F1] hover:bg-[#0F3D3E]/40 border border-transparent'
              }`}
              style={{ fontFamily: tableFont }}
              title="Table Font Family"
            >
              <span className="max-w-[75px] truncate">{tableFont}</span>
              <ChevronDown size={12} className="text-[#E2DCC8]/50 shrink-0" />
            </button>
            {isFontMenuOpen && (
              <div
                className={`absolute ${
                  isPopoverOffTop ? 'top-full mt-2 animate-dropdown' : 'bottom-full mb-2 animate-popover'
                } left-0 w-64 bg-[#18181b]/95 backdrop-blur-xl border border-[#E2DCC8]/20 rounded-[6px] shadow-2xl overflow-hidden z-[2100] flex flex-col text-[#EDEDED]`}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Search Bar */}
                <div className="p-2 border-b border-[#E2DCC8]/15 bg-[#121214] flex items-center gap-2 sticky top-0 z-10">
                  <Search size={14} className="text-gray-400" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search fonts..."
                    value={fontSearch}
                    onChange={e => setFontSearch(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-[12px] font-bold text-[#F1F1F1] placeholder:text-gray-500"
                  />
                </div>
                {/* Font List */}
                <div
                  ref={fontScrollRef}
                  className="max-h-[190px] overflow-y-auto custom-scrollbar p-1 flex flex-col gap-0.5 scroll-smooth overscroll-contain"
                >
                  {filteredFonts.map(group => (
                    <div key={group.label} className="flex flex-col p-0.5 mb-1 last:mb-0">
                      <div className="px-2 py-1 text-[8px] font-black text-[#E2DCC8]/50 uppercase tracking-widest bg-white/5 rounded-[4px] mb-0.5">
                        {group.label}
                      </div>
                      <div className="flex flex-col">
                        {group.fonts.map(f => (
                          <button
                            key={f}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              updateElement(currentPageIndex, element.id, {
                                tableData: { ...td, fontFamily: f }
                              });
                              setIsFontMenuOpen(false);
                            }}
                            className={`block w-full text-left px-2.5 py-1.5 text-[12px] rounded-[4px] transition-all ${
                              f === tableFont ? 'bg-[#0F3D3E] text-white font-bold border border-[#E2DCC8]/30' : 'text-gray-300 hover:bg-[#0F3D3E]/30 hover:text-white'
                            }`}
                            style={{ fontFamily: f }}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  {filteredFonts.length === 0 && (
                    <div className="py-8 text-center text-gray-500 text-[11px] font-bold uppercase tracking-widest">
                      No fonts found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="w-[1px] h-4 bg-[#E2DCC8]/20 mx-0.5" />

          {/* 2. Font Size Controls */}
          <div className="flex items-center gap-0.5 px-0.5">
            <button
              type="button"
              onClick={() => {
                const newSize = Math.max(6, tableFontSize - 1);
                const diff = newSize - tableFontSize;
                updateElement(currentPageIndex, element.id, {
                  tableData: {
                    ...td,
                    fontSize: newSize,
                    headerFontSize: Math.max(7, (td.headerFontSize || 11) + diff)
                  }
                });
              }}
              onMouseDown={(e) => e.preventDefault()}
              className="p-1 hover:bg-[#0F3D3E]/40 rounded-[4px] text-[#E2DCC8]/70 hover:text-white transition-all active:scale-90"
              title="Decrease font size"
            >
              <Minus size={13} />
            </button>
            <input
              type="number"
              value={tableFontSize}
              onChange={e => {
                const newSize = Math.max(1, Number(e.target.value));
                const diff = newSize - tableFontSize;
                updateElement(currentPageIndex, element.id, {
                  tableData: {
                    ...td,
                    fontSize: newSize,
                    headerFontSize: Math.max(1, (td.headerFontSize || 11) + diff)
                  }
                });
              }}
              onWheel={e => {
                e.preventDefault();
                const delta = e.deltaY < 0 ? 1 : -1;
                const newSize = Math.max(6, tableFontSize + delta);
                const diff = newSize - tableFontSize;
                updateElement(currentPageIndex, element.id, {
                  tableData: {
                    ...td,
                    fontSize: newSize,
                    headerFontSize: Math.max(7, (td.headerFontSize || 11) + diff)
                  }
                });
              }}
              className="w-8 text-center text-[12px] font-black text-[#F1F1F1] bg-[#100F0F] border border-[#E2DCC8]/20 rounded-[4px] py-0.5 outline-none focus:border-[#0F3D3E] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              type="button"
              onClick={() => {
                const newSize = tableFontSize + 1;
                const diff = newSize - tableFontSize;
                updateElement(currentPageIndex, element.id, {
                  tableData: {
                    ...td,
                    fontSize: newSize,
                    headerFontSize: (td.headerFontSize || 11) + diff
                  }
                });
              }}
              onMouseDown={(e) => e.preventDefault()}
              className="p-1 hover:bg-[#0F3D3E]/40 rounded-[4px] text-[#E2DCC8]/70 hover:text-white transition-all active:scale-90"
              title="Increase font size"
            >
              <Plus size={13} />
            </button>
          </div>

          <div className="w-[1px] h-4 bg-[#E2DCC8]/20 mx-0.5" />

          {/* 3. Text Color & Formatting */}
          <div className="flex items-center gap-0.5 px-0.5">
            {/* Text Color Picker */}
            <button
              type="button"
              onClick={() => {
                useStore.getState().openColorPicker({
                  type: 'text',
                  elementId: element.id,
                  color: tableTextColor,
                  title: 'Table Text Color',
                  onChange: (newColor) => {
                    updateElement(currentPageIndex, element.id, {
                      tableData: {
                        ...td,
                        textColor: newColor,
                        headerTextColor: newColor
                      }
                    });
                  }
                });
              }}
              onMouseDown={(e) => e.preventDefault()}
              className="p-1 rounded-[4px] transition-all active:scale-95 hover:bg-[#0F3D3E]/40 text-[#F1F1F1]"
              title="Text Color"
            >
              <div className="flex flex-col items-center">
                <span className="font-serif font-black text-[13px] leading-tight" style={{ color: tableTextColor }}>A</span>
                <div className="w-3.5 h-[2.5px] rounded-[1px]" style={{ backgroundColor: tableTextColor }} />
              </div>
            </button>

            {/* Bold */}
            <button
              type="button"
              onClick={() => {
                updateElement(currentPageIndex, element.id, {
                  tableData: {
                    ...td,
                    fontWeight: isTableBold ? 'normal' : 'bold',
                    headerFontWeight: isTableBold ? 'normal' : '900'
                  }
                });
              }}
              onMouseDown={(e) => e.preventDefault()}
              className={`p-1.5 rounded-[4px] transition-all active:scale-95 ${
                isTableBold ? 'bg-[#0F3D3E] text-white border border-[#E2DCC8]/30 shadow-sm' : 'hover:bg-[#0F3D3E]/40 text-[#E2DCC8]/80 hover:text-white'
              }`}
              title="Bold"
            >
              <Bold size={14} strokeWidth={isTableBold ? 3 : 2} />
            </button>

            {/* Italic */}
            <button
              type="button"
              onClick={() => {
                updateElement(currentPageIndex, element.id, {
                  tableData: {
                    ...td,
                    fontStyle: isTableItalic ? 'normal' : 'italic'
                  }
                });
              }}
              onMouseDown={(e) => e.preventDefault()}
              className={`p-1.5 rounded-[4px] transition-all active:scale-95 ${
                isTableItalic ? 'bg-[#0F3D3E] text-white border border-[#E2DCC8]/30 shadow-sm' : 'hover:bg-[#0F3D3E]/40 text-[#E2DCC8]/80 hover:text-white'
              }`}
              title="Italic"
            >
              <Italic size={14} strokeWidth={isTableItalic ? 3 : 2} />
            </button>

            {/* Underline */}
            <button
              type="button"
              onClick={() => {
                updateElement(currentPageIndex, element.id, {
                  tableData: {
                    ...td,
                    textDecoration: isTableUnderline ? 'none' : 'underline'
                  }
                });
              }}
              onMouseDown={(e) => e.preventDefault()}
              className={`p-1.5 rounded-[4px] transition-all active:scale-95 ${
                isTableUnderline ? 'bg-[#0F3D3E] text-white border border-[#E2DCC8]/30 shadow-sm' : 'hover:bg-[#0F3D3E]/40 text-[#E2DCC8]/80 hover:text-white'
              }`}
              title="Underline"
            >
              <Underline size={14} strokeWidth={isTableUnderline ? 3 : 2} />
            </button>

            {/* Alignment */}
            <button
              type="button"
              onClick={() => {
                const nextAlign = tableAlign === 'center' ? 'left' : tableAlign === 'left' ? 'right' : 'center';
                updateElement(currentPageIndex, element.id, {
                  tableData: {
                    ...td,
                    textAlign: nextAlign
                  }
                });
              }}
              onMouseDown={(e) => e.preventDefault()}
              className="p-1.5 rounded-[4px] hover:bg-[#0F3D3E]/40 text-[#E2DCC8]/80 hover:text-white transition-all active:scale-95"
              title={`Alignment: ${tableAlign}`}
            >
              {tableAlign === 'left' && <AlignLeft size={14} />}
              {tableAlign === 'center' && <AlignCenter size={14} />}
              {tableAlign === 'right' && <AlignRight size={14} />}
            </button>
          </div>

          <div className="w-[1px] h-4 bg-[#E2DCC8]/20 mx-0.5" />

          {/* 4. Table Colors Popover */}
          <div className="relative" ref={tableColorsRef}>
            <button
              type="button"
              className={`flex items-center gap-1.5 px-2 py-1 rounded-[4px] text-[11px] font-bold tracking-tight text-[#E2DCC8]/90 hover:text-white bg-[#0F3D3E]/40 hover:bg-[#0F3D3E]/60 border border-[#E2DCC8]/20 transition-all active:scale-95 ${
                showTableColorsPopover ? 'bg-[#0F3D3E] text-white' : ''
              }`}
              title="Table Colors (Header, Rows, Border)"
              onClick={(e) => {
                e.stopPropagation();
                setShowTableColorsPopover(!showTableColorsPopover);
              }}
            >
              <div className="w-3.5 h-3.5 rounded-[2px] border border-white/20 shadow-sm" style={{ backgroundColor: tableHeaderBg }} />
              <span>Colors</span>
            </button>

            {showTableColorsPopover && (
              <div
                className={`absolute left-1/2 -translate-x-1/2 w-60 p-3 rounded-[8px] bg-[#18181b] border border-white/10 text-white shadow-[0_20px_60px_rgba(0,0,0,0.85)] z-[2100] animate-in zoom-in-95 duration-150 backdrop-blur-xl ${
                  isPopoverOffTop ? 'top-full mt-2' : 'bottom-full mb-2'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-xs font-bold text-white pb-2 mb-2 border-b border-white/10 flex items-center gap-1.5">
                  <Palette size={13} className="text-[#8B5CF6]" />
                  <span>Table Colors</span>
                </div>
                
                <div className="space-y-2.5">
                  {/* Header Background */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-300">Header Background</span>
                    <button
                      type="button"
                      onClick={() => {
                        useStore.getState().openColorPicker({
                          type: 'fill',
                          color: tableHeaderBg,
                          title: 'Header Background Color',
                          onChange: (color) => {
                            updateElement(currentPageIndex, element.id, {
                              fill: color,
                              tableData: { ...td, headerBg: color }
                            });
                          }
                        });
                      }}
                      className="w-6 h-6 rounded-[3px] border border-white/20 shadow-sm transition-transform hover:scale-110 cursor-pointer"
                      style={{ backgroundColor: tableHeaderBg }}
                      title="Change Header Background Color"
                    />
                  </div>

                  {/* Row / Cell Background */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-300">Row Background</span>
                    <button
                      type="button"
                      onClick={() => {
                        useStore.getState().openColorPicker({
                          type: 'fill',
                          color: tableRowBg,
                          title: 'Row Background Color',
                          onChange: (color) => {
                            updateElement(currentPageIndex, element.id, {
                              tableData: { ...td, rowBg: color }
                            });
                          }
                        });
                      }}
                      className="w-6 h-6 rounded-[3px] border border-white/20 shadow-sm transition-transform hover:scale-110 cursor-pointer"
                      style={{ backgroundColor: tableRowBg }}
                      title="Change Row Background Color"
                    />
                  </div>

                  {/* Border Color */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-300">Border Color</span>
                    <button
                      type="button"
                      onClick={() => {
                        useStore.getState().openColorPicker({
                          type: 'stroke',
                          color: tableBorderColor,
                          title: 'Border Color',
                          onChange: (color) => {
                            updateElement(currentPageIndex, element.id, {
                              stroke: color,
                              tableData: { ...td, borderColor: color }
                            });
                          }
                        });
                      }}
                      className="w-6 h-6 rounded-[3px] border border-white/20 shadow-sm transition-transform hover:scale-110 cursor-pointer"
                      style={{ backgroundColor: tableBorderColor }}
                      title="Change Border Color"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* SHAPE CONTROLS (Fill, Border Style/Weight, Border Color) */}
      {isShapeElement && (
        <>
          {/* 1. Shape Fill Color */}
          <div className="relative" ref={shapeFillRef}>
            <button
              className={`${btnClass} ${showShapeFillPopover ? 'bg-[#0F3D3E] text-white border border-[#E2DCC8]/30' : ''}`}
              title={isShapeFillTransparent ? "Fill Color (Transparent / No Fill)" : "Fill Color"}
              onClick={(e) => {
                e.stopPropagation();
                setShowShapeFillPopover(!showShapeFillPopover);
              }}
            >
              <div
                className="w-5 h-5 rounded-[2px] border border-white/20 shadow-sm relative overflow-hidden flex items-center justify-center"
                style={{ background: isShapeFillTransparent ? '#ffffff' : shapeFillColor }}
              >
                {isShapeFillTransparent && (
                  <div className="w-full h-[1.5px] bg-red-500 -rotate-45" />
                )}
              </div>
            </button>

            {showShapeFillPopover && (
              <div
                className={`absolute left-0 w-60 p-3 rounded-[8px] bg-[#18181b]/95 backdrop-blur-xl border border-[#E2DCC8]/20 text-white shadow-[0_20px_60px_rgba(0,0,0,0.85)] z-[2100] animate-in zoom-in-95 duration-150 ${
                  isPopoverOffTop ? 'top-full mt-2' : 'bottom-full mb-2'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-[11px] font-black uppercase tracking-wider text-[#E2DCC8]/80 pb-2 mb-2.5 border-b border-[#E2DCC8]/15 flex items-center justify-between">
                  <span>Shape Fill Color</span>
                </div>

                {/* 1-Click No Fill / Outline Only Button */}
                <button
                  type="button"
                  onClick={() => {
                    selectedElementIds.forEach(id => {
                      const width = shapeStrokeWidth > 0 ? shapeStrokeWidth : 2;
                      const strokeC = shapeStrokeColor || '#000000';
                      internalUpdate(id, {
                        fill: 'transparent',
                        stroke: strokeC,
                        strokeWidth: width
                      });
                    });
                    setShowShapeFillPopover(false);
                  }}
                  className={`w-full py-2 px-3 rounded-[6px] border flex items-center gap-2.5 text-xs font-bold transition-all mb-3 ${
                    isShapeFillTransparent
                      ? 'bg-[#0F3D3E] border-[#E2DCC8]/50 text-white shadow-md'
                      : 'bg-white/5 border-white/10 text-gray-200 hover:bg-white/10 hover:border-white/30'
                  }`}
                >
                  <div className="w-5 h-5 rounded-[3px] bg-white border border-gray-300 relative flex items-center justify-center shrink-0">
                    <div className="w-full h-[2px] bg-red-500 -rotate-45" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span>No Color (Transparent)</span>
                    <span className="text-[9px] font-normal text-gray-400">Outline / Border only</span>
                  </div>
                </button>

                {/* Quick Color Palette */}
                <div className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 px-0.5">
                  Solid Colors
                </div>
                <div className="grid grid-cols-6 gap-1.5 mb-3">
                  {[
                    '#000000', '#334155', '#64748B', '#94A3B8', '#CBD5E1', '#FFFFFF',
                    '#EF4444', '#F97316', '#F59E0B', '#10B981', '#06B6D4', '#3B82F6',
                    '#6366F1', '#8B5CF6', '#D946EF', '#F43F5E', '#0F3D3E', '#14B8A6'
                  ].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        selectedElementIds.forEach(id => {
                          internalUpdate(id, { fill: c });
                        });
                        setShowShapeFillPopover(false);
                      }}
                      className={`w-7 h-7 rounded-[4px] border shadow-sm transition-transform hover:scale-110 flex items-center justify-center ${
                        !isShapeFillTransparent && shapeFillColor.toLowerCase() === c.toLowerCase()
                          ? 'ring-2 ring-[#0F3D3E] ring-offset-1 ring-offset-[#18181b] border-white'
                          : 'border-white/15 hover:border-white'
                      }`}
                      style={{ background: c }}
                      title={c}
                    />
                  ))}
                </div>

                {/* Open Full Color Studio Button */}
                <button
                  type="button"
                  onClick={() => {
                    setShowShapeFillPopover(false);
                    useStore.getState().openColorPicker({
                      type: 'fill',
                      color: isShapeFillTransparent ? '#cbd5e1' : shapeFillColor,
                      title: 'Shape Fill Color',
                      onChange: (color) => {
                        onFillChange?.(color);
                        selectedElementIds.forEach(id => {
                          internalUpdate(id, { fill: color });
                        });
                      }
                    });
                  }}
                  className="w-full py-1.5 px-3 rounded-[4px] bg-[#0F3D3E]/50 hover:bg-[#0F3D3E] text-white text-[11px] font-bold border border-[#E2DCC8]/20 flex items-center justify-center gap-1.5 transition-all"
                >
                  <Palette size={13} />
                  <span>Open Color Studio...</span>
                </button>
              </div>
            )}
          </div>

          {/* 2. Shape Border Style & Weight & Corner Rounding Popover */}
          <div className="relative" ref={shapeBorderRef}>
            <button
              type="button"
              className={`flex items-center justify-center p-1.5 rounded-[4px] transition-all active:scale-95 ${
                showShapeBorderPopover || hasShapeBorder
                  ? 'bg-[#0F3D3E] text-white border border-[#E2DCC8]/30'
                  : 'text-[#E2DCC8]/80 hover:text-white hover:bg-[#0F3D3E]/40 border border-transparent'
              }`}
              title="Border Style & Corner Rounding"
              onClick={(e) => {
                e.stopPropagation();
                setShowShapeBorderPopover(!showShapeBorderPopover);
              }}
            >
              {/* Border lines icon */}
              <div className="w-5 h-5 flex flex-col justify-center gap-[3px] items-center">
                <div
                  className="w-4 rounded-full"
                  style={{
                    height: Math.max(1, Math.min(3, Math.round(shapeStrokeWidth / 2) || 1.5)),
                    backgroundColor: hasShapeBorder ? 'currentColor' : '#94a3b8',
                    borderStyle: shapeBorderStyle === 'dashed' ? 'dashed' : (shapeBorderStyle === 'dotted' ? 'dotted' : 'solid'),
                    borderWidth: shapeBorderStyle !== 'solid' && shapeBorderStyle !== 'none' ? '1px 0 0 0' : 0,
                  }}
                />
                <div
                  className="w-4 rounded-full"
                  style={{
                    height: Math.max(1, Math.min(3, Math.round(shapeStrokeWidth / 2) || 1.5)),
                    backgroundColor: hasShapeBorder ? 'currentColor' : '#94a3b8',
                    borderStyle: shapeBorderStyle === 'dashed' ? 'dashed' : (shapeBorderStyle === 'dotted' ? 'dotted' : 'solid'),
                    borderWidth: shapeBorderStyle !== 'solid' && shapeBorderStyle !== 'none' ? '1px 0 0 0' : 0,
                  }}
                />
              </div>
            </button>

            {showShapeBorderPopover && (
              <div
                className={`absolute left-1/2 -translate-x-1/2 w-64 p-3.5 rounded-[8px] bg-[#18181b]/95 backdrop-blur-xl border border-[#E2DCC8]/20 text-white shadow-[0_20px_60px_rgba(0,0,0,0.85)] z-[2100] animate-in zoom-in-95 duration-150 ${
                  isPopoverOffTop ? 'top-full mt-2' : 'bottom-full mb-2'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-[11px] font-black uppercase tracking-wider text-[#E2DCC8]/80 pb-2 mb-2.5 border-b border-[#E2DCC8]/15 flex items-center justify-between">
                  <span>Border style</span>
                </div>

                {/* 4 Border Style Options: None, Solid, Dashed, Dotted */}
                <div className="grid grid-cols-4 gap-1.5 mb-3.5">
                  {/* None */}
                  <button
                    type="button"
                    onClick={() => {
                      selectedElementIds.forEach(id => {
                        internalUpdate(id, { stroke: 'transparent', strokeWidth: 0, strokeDashArray: [] });
                      });
                    }}
                    className={`h-8 rounded-[4px] border flex items-center justify-center transition-all ${
                      !hasShapeBorder ? 'bg-[#0F3D3E] border-[#E2DCC8]/50 text-white shadow-sm' : 'border-white/10 hover:border-white/30 text-gray-400 hover:text-white bg-white/5'
                    }`}
                    title="No Border"
                  >
                    <div className="w-4 h-4 rounded-[2px] border border-gray-400 relative flex items-center justify-center">
                      <div className="w-full h-[1.5px] bg-red-400 -rotate-45" />
                    </div>
                  </button>

                  {/* Solid */}
                  <button
                    type="button"
                    onClick={() => {
                      selectedElementIds.forEach(id => {
                        internalUpdate(id, {
                          stroke: element.stroke && element.stroke !== 'transparent' ? element.stroke : '#000000',
                          strokeWidth: shapeStrokeWidth > 0 ? shapeStrokeWidth : 2,
                          strokeDashArray: []
                        });
                      });
                    }}
                    className={`h-8 rounded-[4px] border flex items-center justify-center transition-all ${
                      hasShapeBorder && shapeBorderStyle === 'solid' ? 'bg-[#0F3D3E] border-[#E2DCC8]/50 text-white shadow-sm' : 'border-white/10 hover:border-white/30 text-gray-400 hover:text-white bg-white/5'
                    }`}
                    title="Solid Border"
                  >
                    <div className="w-5 h-[2px] bg-current rounded-full" />
                  </button>

                  {/* Dashed */}
                  <button
                    type="button"
                    onClick={() => {
                      selectedElementIds.forEach(id => {
                        internalUpdate(id, {
                          stroke: element.stroke && element.stroke !== 'transparent' ? element.stroke : '#000000',
                          strokeWidth: shapeStrokeWidth > 0 ? shapeStrokeWidth : 2,
                          strokeDashArray: [6, 6]
                        });
                      });
                    }}
                    className={`h-8 rounded-[4px] border flex items-center justify-center transition-all ${
                      hasShapeBorder && shapeBorderStyle === 'dashed' ? 'bg-[#0F3D3E] border-[#E2DCC8]/50 text-white shadow-sm' : 'border-white/10 hover:border-white/30 text-gray-400 hover:text-white bg-white/5'
                    }`}
                    title="Dashed Border"
                  >
                    <div className="w-5 h-[2px] border-b-2 border-dashed border-current" />
                  </button>

                  {/* Dotted */}
                  <button
                    type="button"
                    onClick={() => {
                      selectedElementIds.forEach(id => {
                        internalUpdate(id, {
                          stroke: element.stroke && element.stroke !== 'transparent' ? element.stroke : '#000000',
                          strokeWidth: shapeStrokeWidth > 0 ? shapeStrokeWidth : 2,
                          strokeDashArray: [2, 4]
                        });
                      });
                    }}
                    className={`h-8 rounded-[4px] border flex items-center justify-center transition-all ${
                      hasShapeBorder && shapeBorderStyle === 'dotted' ? 'bg-[#0F3D3E] border-[#E2DCC8]/50 text-white shadow-sm' : 'border-white/10 hover:border-white/30 text-gray-400 hover:text-white bg-white/5'
                    }`}
                    title="Dotted Border"
                  >
                    <div className="w-5 h-[2px] border-b-2 border-dotted border-current" />
                  </button>
                </div>

                {/* Border Weight Slider */}
                <div className="space-y-1.5 mb-3.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-300 font-medium">Border weight</span>
                    <span className="text-zinc-400 font-mono text-[10px] bg-white/5 px-1.5 py-0.5 rounded-[3px] border border-white/10">{shapeStrokeWidth}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={40}
                    value={shapeStrokeWidth}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      selectedElementIds.forEach(id => {
                        internalUpdate(id, {
                          strokeWidth: val,
                          stroke: val > 0 ? (element.stroke && element.stroke !== 'transparent' ? element.stroke : '#000000') : 'transparent'
                        });
                      });
                    }}
                    className="w-full accent-[#0F3D3E] bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Corner Rounding Slider (for rectangles / squares) */}
                {supportsCornerRadius && (
                  <div className="space-y-1.5 pt-2 border-t border-white/10">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-300 font-medium">Corner rounding</span>
                      <span className="text-zinc-400 font-mono text-[10px] bg-white/5 px-1.5 py-0.5 rounded-[3px] border border-white/10">{Math.round(shapeCornerRadius)}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={shapeCornerRadius}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        selectedElementIds.forEach(id => {
                          internalUpdate(id, { rx: val, ry: val, cornerRadius: val });
                        });
                      }}
                      className="w-full accent-[#0F3D3E] bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. Shape Border Color */}
          <button
            className={btnClass}
            title={hasShapeBorder ? `Border Color (${shapeStrokeColor})` : "Border Color (No Border)"}
            onClick={() => {
              useStore.getState().openColorPicker({
                type: 'stroke',
                color: hasShapeBorder ? shapeStrokeColor : '#000000',
                title: 'Shape Border Color',
                onChange: (color) => {
                  onStrokeChange?.(color);
                  selectedElementIds.forEach(id => {
                    const width = shapeStrokeWidth > 0 ? shapeStrokeWidth : 2;
                    internalUpdate(id, { stroke: color, strokeWidth: width });
                  });
                }
              });
            }}
          >
            <div
              className="w-5 h-5 rounded-[2px] border border-white/20 shadow-sm relative overflow-hidden flex items-center justify-center"
              style={{ background: hasShapeBorder ? shapeStrokeColor : '#ffffff' }}
            >
              {!hasShapeBorder && (
                <div className="w-full h-[1.5px] bg-red-500 -rotate-45" />
              )}
            </div>
          </button>

          <div className="w-[1px] h-4 bg-[#E2DCC8]/20 mx-0.5" />
        </>
      )}

      {/* Fill color (for other generic elements) */}
      {!isShapeElement && element.type !== 'image' && element.type !== 'video' && !isTableElement && (
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
                  internalUpdate(id, { fill: color });
                });
              }
            });
          }}
        >
          <div className="w-5 h-5 rounded-[2px] border border-white/20 shadow-sm" style={{ backgroundColor: activeFill }} />
        </button>
      )}

      {/* Image Crop Button */}
      {element.type === 'image' && (
        <button
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] text-[11px] font-bold tracking-tight text-[#E2DCC8]/90 hover:text-white bg-[#0F3D3E]/40 hover:bg-[#0F3D3E]/60 border border-[#E2DCC8]/20 transition-all active:scale-95"
          title="Crop Image (Double click on image or click here)"
          onClick={(e) => {
            e.stopPropagation();
            useStore.getState().startCropMode(element.id);
          }}
        >
          <CropIcon size={14} strokeWidth={2.2} />
          <span>Crop</span>
        </button>
      )}

      {/* Video Play Button */}
      {element.type === 'video' && (
        <button
          className="flex items-center gap-1 px-2 py-1 rounded-[4px] text-[11px] font-bold tracking-tight text-white bg-[#0084ff] hover:bg-[#0070d8] shadow-sm transition-all active:scale-95"
          title="Play (or double-click on video)"
          onClick={(e) => {
            e.stopPropagation();
            window.dispatchEvent(new CustomEvent('catalog:playVideo', { detail: { id: element.id, pageIndex: currentPageIndex } }));
          }}
        >
          <Play size={12} className="fill-current" />
          <span>Play</span>
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
                style={{
                  background: element.overlayType === 'gradient'
                    ? `linear-gradient(to right, ${element.overlayGradientStartColor || element.overlayColor || '#000000'}, ${element.overlayGradientEndColor || element.overlayColor || '#000000'})`
                    : (element.overlayColor || '#ea580c')
                }}
              />
            )}
          </button>

          {/* Floating Toolbar Overlay Popover */}
          {showOverlayPopover && (
            <div
              className={`absolute left-1/2 -translate-x-1/2 w-72 p-3.5 rounded-[12px] bg-[#18181b] border border-white/10 text-white shadow-[0_20px_60px_rgba(0,0,0,0.85)] z-[2000] animate-in zoom-in-95 duration-150 backdrop-blur-xl ${
                isPopoverOffTop ? 'top-full mt-2' : 'bottom-full mb-2'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with Switch */}
              <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
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
                      overlayType: element.overlayType || 'solid',
                      overlayColor: element.overlayColor || '#ea580c',
                      overlayOpacity: element.overlayOpacity !== undefined ? element.overlayOpacity : 22,
                      overlayGradientDirection: element.overlayGradientDirection || 'to-right',
                      overlayGradientStartColor: element.overlayGradientStartColor || element.overlayColor || '#000000',
                      overlayGradientEndColor: element.overlayGradientEndColor || element.overlayColor || '#000000',
                      overlayGradientStartOpacity: element.overlayGradientStartOpacity !== undefined ? element.overlayGradientStartOpacity : 80,
                      overlayGradientEndOpacity: element.overlayGradientEndOpacity !== undefined ? element.overlayGradientEndOpacity : 0
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
              <div className={`pt-2.5 space-y-3 ${element.overlayEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                {/* Mode Segmented Control: Solid | Gradient */}
                <div className="flex items-center p-0.5 bg-zinc-850 bg-zinc-900 rounded-[6px] border border-white/10">
                  <button
                    type="button"
                    onClick={() => updateElement(currentPageIndex, element.id, { overlayType: 'solid' })}
                    className={`flex-1 py-1 text-[11px] font-semibold rounded-[4px] transition-all ${
                      element.overlayType !== 'gradient'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Solid
                  </button>
                  <button
                    type="button"
                    onClick={() => updateElement(currentPageIndex, element.id, {
                      overlayType: 'gradient',
                      overlayGradientDirection: element.overlayGradientDirection || 'to-right',
                      overlayGradientStartColor: element.overlayGradientStartColor || element.overlayColor || '#000000',
                      overlayGradientEndColor: element.overlayGradientEndColor || element.overlayColor || '#000000',
                      overlayGradientStartOpacity: element.overlayGradientStartOpacity !== undefined ? element.overlayGradientStartOpacity : 80,
                      overlayGradientEndOpacity: element.overlayGradientEndOpacity !== undefined ? element.overlayGradientEndOpacity : 0
                    })}
                    className={`flex-1 py-1 text-[11px] font-semibold rounded-[4px] transition-all ${
                      element.overlayType === 'gradient'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Gradient
                  </button>
                </div>

                {/* SOLID CONTROLS */}
                {element.overlayType !== 'gradient' ? (
                  <>
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
                  </>
                ) : (
                  /* GRADIENT CONTROLS */
                  <>
                    {/* Direction Buttons */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-medium text-zinc-400">Direction</span>
                      <div className="grid grid-cols-4 gap-1">
                        {[
                          { id: 'to-right', label: 'Left → Right', icon: <ArrowRight size={13} /> },
                          { id: 'to-left', label: 'Right → Left', icon: <ArrowLeft size={13} /> },
                          { id: 'to-bottom', label: 'Top → Bottom', icon: <ArrowDown size={13} /> },
                          { id: 'to-top', label: 'Bottom → Top', icon: <ArrowUp size={13} /> }
                        ].map(dir => (
                          <button
                            key={dir.id}
                            type="button"
                            title={dir.label}
                            onClick={() => updateElement(currentPageIndex, element.id, { overlayGradientDirection: dir.id as any })}
                            className={`flex items-center justify-center gap-1 py-1 rounded-[4px] border text-xs font-medium transition-all ${
                              (element.overlayGradientDirection || 'to-right') === dir.id
                                ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                                : 'bg-zinc-800/80 border-white/10 text-zinc-400 hover:text-white hover:bg-zinc-700'
                            }`}
                          >
                            {dir.icon}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Gradient Colors */}
                    <div className="grid grid-cols-2 gap-2">
                      {/* Start Color */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-medium text-zinc-400">Start Color</span>
                        <div className="flex items-center gap-1.5">
                          <label
                            className="w-6 h-6 rounded-[4px] border border-white/20 shadow-sm cursor-pointer block relative transition-transform hover:scale-105 shrink-0"
                            style={{ backgroundColor: element.overlayGradientStartColor || element.overlayColor || '#000000' }}
                          >
                            <input
                              type="color"
                              value={element.overlayGradientStartColor || element.overlayColor || '#000000'}
                              onChange={(e) => updateElement(currentPageIndex, element.id, { overlayGradientStartColor: e.target.value })}
                              className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                            />
                          </label>
                          <span className="text-[10px] text-zinc-300 font-mono truncate">
                            {element.overlayGradientStartColor || element.overlayColor || '#000000'}
                          </span>
                        </div>
                      </div>

                      {/* End Color */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-medium text-zinc-400">End Color</span>
                        <div className="flex items-center gap-1.5">
                          <label
                            className="w-6 h-6 rounded-[4px] border border-white/20 shadow-sm cursor-pointer block relative transition-transform hover:scale-105 shrink-0"
                            style={{ backgroundColor: element.overlayGradientEndColor || element.overlayColor || '#000000' }}
                          >
                            <input
                              type="color"
                              value={element.overlayGradientEndColor || element.overlayColor || '#000000'}
                              onChange={(e) => updateElement(currentPageIndex, element.id, { overlayGradientEndColor: e.target.value })}
                              className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                            />
                          </label>
                          <span className="text-[10px] text-zinc-300 font-mono truncate">
                            {element.overlayGradientEndColor || element.overlayColor || '#000000'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Gradient Presets */}
                    <div className="flex items-center gap-1 flex-wrap">
                      {[
                        { name: 'Dark', start: '#000000', end: '#000000', sOp: 85, eOp: 0 },
                        { name: 'White', start: '#ffffff', end: '#ffffff', sOp: 85, eOp: 0 },
                        { name: 'Sunset', start: '#ea580c', end: '#f59e0b', sOp: 75, eOp: 15 },
                        { name: 'Blue', start: '#1e3a8a', end: '#3b82f6', sOp: 80, eOp: 10 },
                        { name: 'Neon', start: '#581c87', end: '#ec4899', sOp: 75, eOp: 20 },
                      ].map(preset => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => updateElement(currentPageIndex, element.id, {
                            overlayGradientStartColor: preset.start,
                            overlayGradientEndColor: preset.end,
                            overlayGradientStartOpacity: preset.sOp,
                            overlayGradientEndOpacity: preset.eOp
                          })}
                          className="h-4.5 px-1.5 py-0.5 rounded-[3px] border border-white/10 text-[9px] font-medium text-zinc-300 hover:text-white transition-transform hover:scale-105"
                          style={{
                            background: `linear-gradient(to right, ${preset.start}, ${preset.end})`
                          }}
                          title={preset.name}
                        >
                          <span className="drop-shadow-sm">{preset.name}</span>
                        </button>
                      ))}
                    </div>

                    {/* Start Opacity Slider */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-zinc-300">Start Opacity (Side 1)</span>
                        <span className="text-zinc-400 font-mono text-[10px]">
                          {element.overlayGradientStartOpacity !== undefined ? element.overlayGradientStartOpacity : (element.overlayOpacity !== undefined ? element.overlayOpacity : 80)}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={element.overlayGradientStartOpacity !== undefined ? element.overlayGradientStartOpacity : (element.overlayOpacity !== undefined ? element.overlayOpacity : 80)}
                          onChange={(e) => updateElement(currentPageIndex, element.id, { overlayGradientStartOpacity: Number(e.target.value) })}
                          className="flex-1 h-1.5 rounded-lg appearance-none cursor-pointer accent-blue-600 bg-zinc-700"
                        />
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={element.overlayGradientStartOpacity !== undefined ? element.overlayGradientStartOpacity : (element.overlayOpacity !== undefined ? element.overlayOpacity : 80)}
                          onChange={(e) => {
                            const val = Math.min(100, Math.max(0, Number(e.target.value) || 0));
                            updateElement(currentPageIndex, element.id, { overlayGradientStartOpacity: val });
                          }}
                          className="w-12 px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded-[4px] text-center text-xs font-semibold text-white outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* End Opacity Slider */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-zinc-300">End Opacity (Side 2)</span>
                        <span className="text-zinc-400 font-mono text-[10px]">
                          {element.overlayGradientEndOpacity !== undefined ? element.overlayGradientEndOpacity : 0}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={element.overlayGradientEndOpacity !== undefined ? element.overlayGradientEndOpacity : 0}
                          onChange={(e) => updateElement(currentPageIndex, element.id, { overlayGradientEndOpacity: Number(e.target.value) })}
                          className="flex-1 h-1.5 rounded-lg appearance-none cursor-pointer accent-blue-600 bg-zinc-700"
                        />
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={element.overlayGradientEndOpacity !== undefined ? element.overlayGradientEndOpacity : 0}
                          onChange={(e) => {
                            const val = Math.min(100, Math.max(0, Number(e.target.value) || 0));
                            updateElement(currentPageIndex, element.id, { overlayGradientEndOpacity: val });
                          }}
                          className="w-12 px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded-[4px] text-center text-xs font-semibold text-white outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Live Preview Bar */}
                    <div className="pt-0.5">
                      <div
                        className="w-full h-3 rounded-[3px] border border-white/15 shadow-inner"
                        style={{
                          background: `linear-gradient(${
                            element.overlayGradientDirection === 'to-left' ? 'to left' :
                            element.overlayGradientDirection === 'to-bottom' ? 'to bottom' :
                            element.overlayGradientDirection === 'to-top' ? 'to top' : 'to right'
                          }, ${colorToRgba(element.overlayGradientStartColor || element.overlayColor || '#000000', element.overlayGradientStartOpacity !== undefined ? element.overlayGradientStartOpacity : 80)}, ${colorToRgba(element.overlayGradientEndColor || element.overlayColor || '#000000', element.overlayGradientEndOpacity !== undefined ? element.overlayGradientEndOpacity : 0)})`
                        }}
                      />
                    </div>
                  </>
                )}
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
            className={`absolute left-1/2 -translate-x-1/2 p-3 bg-[#18181b]/95 backdrop-blur-xl border border-[#2c2c30] rounded-[6px] shadow-2xl w-64 z-[999] flex flex-col gap-2 animate-popover-center ${
              isPopoverOffTop ? 'top-full mt-2' : 'bottom-full mb-2'
            }`}
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

      {/* Opacity / Transparency Popover */}
      <div className="relative" ref={opacityPopoverRef}>
        <button
          className={`${btnClass} ${(element.opacity !== undefined && element.opacity < 1) ? 'text-[#0F3D3E] bg-[#E2DCC8] shadow-sm' : ''}`}
          title={`Transparency: ${Math.round((element.opacity ?? 1) * 100)}%`}
          onClick={() => setShowOpacityPopover(!showOpacityPopover)}
        >
          <Sliders size={16} strokeWidth={2} />
        </button>

        {showOpacityPopover && (
          <div
            className={`absolute left-1/2 -translate-x-1/2 p-3 bg-[#18181b]/95 backdrop-blur-xl border border-[#2c2c30] rounded-[6px] shadow-2xl w-52 z-[999] flex flex-col gap-2 animate-popover-center ${
              isPopoverOffTop ? 'top-full mt-2' : 'bottom-full mb-2'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-bold text-white">
              <span>Transparency</span>
              <span className="font-mono text-slate-400">{Math.round((element.opacity ?? 1) * 100)}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              step={5}
              value={Math.round((element.opacity ?? 1) * 100)}
              onChange={(e) => {
                const val = Number(e.target.value) / 100;
                selectedElementIds.forEach(id => {
                  updateElement(currentPageIndex, id, { opacity: val });
                });
              }}
              className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-[#0F3D3E] bg-zinc-700"
            />
          </div>
        )}
      </div>

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
