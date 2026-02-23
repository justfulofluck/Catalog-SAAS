import React, { useEffect, useCallback, useState, useRef, useMemo } from 'react';
import { Stage as KonvaStage, Layer as KonvaLayer, Rect as KonvaRect, Group as KonvaGroup, Image as KonvaImage, Text as KonvaText } from 'react-konva';
import useImage from 'use-image';
import { Plus, Sparkles, BookOpen, List, FileText, Settings } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { PAGE_WIDTH, PAGE_HEIGHT, THEMES } from '../../constants';
import CanvasElementComponent from './CanvasElement';
import { FloatingTextToolbar } from '../Toolbar/FloatingTextToolbar';
import FloatingToolbar from '../Toolbar/FloatingToolbar';
import { saveSelection, restoreSelection } from '../../utils/textStyleSelection';
import SmartGuides from './SmartGuides';
import { CatalogPage, PageType } from '../../types';

// Holographic drop preview
const SnapPreview: React.FC<{ target: any; imageUrl: string; zoom: number }> = ({ target, imageUrl, zoom }) => {
  const [image] = useImage(imageUrl, 'anonymous');
  const crop = useMemo(() => {
    if (!image || !target.width || !target.height) return undefined;
    const containerRatio = target.width / target.height;
    const imageRatio = image.width / image.height;
    let cropWidth = image.width, cropHeight = image.height, cropX = 0, cropY = 0;
    if (containerRatio > imageRatio) { cropHeight = image.width / containerRatio; cropY = (image.height - cropHeight) / 2; }
    else { cropWidth = image.height * containerRatio; cropX = (image.width - cropWidth) / 2; }
    return { x: cropX, y: cropY, width: cropWidth, height: cropHeight };
  }, [image, target.width, target.height]);
  if (!image) return null;
  return (
    <KonvaGroup x={target.x} y={target.y} rotation={target.rotation} listening={false}>
      <KonvaImage width={target.width} height={target.height} image={image} crop={crop} opacity={0.4} stroke="#4f46e5" strokeWidth={4 / zoom} />
      <KonvaRect width={target.width} height={target.height} fill="rgba(79,70,229,0.15)" stroke="#4f46e5" strokeWidth={2 / zoom} dash={[8, 4]} />
    </KonvaGroup>
  );
};

// A single page rendered as a Konva Stage — used for both active and inactive pages
const PageStage: React.FC<{
  page: CatalogPage;
  pageIdx: number;
  isActive: boolean;
  zoom: number;
  canvasBg: string;
  selectedElementIds: string[];
  editingId: string | null;
  selectionBox: { x1: number; y1: number; x2: number; y2: number; visible: boolean };
  snapTarget: any;
  draggingItem: any;
  isDragOver: boolean;
  stageRef: React.MutableRefObject<any>;
  onMouseDown: (e: any) => void;
  onMouseMove: (e: any) => void;
  onMouseUp: (e: any) => void;
  onWheel: (e: any) => void;
  onDblClick: (e: any) => void;
  onSelect: (id: string, multi: boolean) => void;
  onElementChange: (id: string, updates: any) => void;
  guides: any[];
  dragPosition: any | null;
  catalog: any;
}> = ({
  page, pageIdx, isActive, zoom, canvasBg, selectedElementIds, editingId,
  selectionBox, snapTarget, draggingItem, isDragOver,
  stageRef, onMouseDown, onMouseMove, onMouseUp, onWheel, onDblClick,
  onSelect, onElementChange, guides, dragPosition, catalog
}) => {
    const marginTop = catalog.marginTop || 0;
    const marginBottom = catalog.marginBottom || 0;
    const marginLeft = catalog.marginLeft || 0;
    const marginRight = catalog.marginRight || 0;
    const headerHeight = catalog.headerHeight || 40;
    const footerHeight = catalog.footerHeight || 40;

    const hasHeader = catalog.hasHeader;
    const hasFooter = catalog.hasFooter;

    const marginColor = catalog.marginColor || '#6366f1';

    const isLandscape = page.orientation === 'landscape';
    const currentWidth = isLandscape ? PAGE_HEIGHT : PAGE_WIDTH;
    const currentHeight = isLandscape ? PAGE_WIDTH : PAGE_HEIGHT;

    const shouldShowHeader = hasHeader && (page.type === 'interior');
    const shouldShowFooter = hasFooter && (page.type === 'interior');

    const effContentTop = marginTop + (shouldShowHeader ? headerHeight : 0);
    const effContentBottom = currentHeight - marginBottom - (shouldShowFooter ? footerHeight : 0);

    return (
      <KonvaStage
        ref={isActive ? stageRef : undefined}
        width={currentWidth * zoom}
        height={currentHeight * zoom}
        scaleX={zoom}
        scaleY={zoom}
        onMouseDown={isActive ? onMouseDown : undefined}
        onMouseMove={isActive ? onMouseMove : undefined}
        onMouseUp={isActive ? onMouseUp : undefined}
        onWheel={isActive ? onWheel : undefined}
        onDblClick={isActive ? onDblClick : undefined}
        listening={isActive}
      >
        <KonvaLayer>
          {/* Page background */}
          <KonvaRect name="grid-background" width={currentWidth} height={currentHeight} fill={canvasBg} />


          {/* Margins & Areas Visualization (Rendered ON TOP for visibility) */}
          <KonvaGroup>
            {/* Main Margin Box (Outer Boundary) - Only on interior pages */}
            {page.type === 'interior' && (
              <KonvaRect
                name="margin-bg"
                listening={false}
                x={marginLeft}
                y={marginTop}
                width={currentWidth - marginLeft - marginRight}
                height={currentHeight - marginTop - marginBottom}
                stroke={marginColor}
                strokeWidth={Math.max(1, 2 / zoom)}
                dash={[6, 3]}
                opacity={0.8}
              />
            )}

            {/* Header Area (Inside Margins) */}
            {shouldShowHeader && (
              <KonvaGroup name="header-group">
                <KonvaRect
                  name="header-bg"
                  x={marginLeft}
                  y={marginTop}
                  width={currentWidth - marginLeft - marginRight}
                  height={headerHeight}
                  fill={`${marginColor}22`}
                />
                <KonvaRect
                  x={marginLeft}
                  y={marginTop + headerHeight}
                  width={currentWidth - marginLeft - marginRight}
                  height={Math.max(1, 2 / zoom)}
                  fill={marginColor}
                  opacity={0.6}
                />

                {/* Header Text (Editable Reference) */}
                <KonvaText
                  key={`header-${catalog.headerFontFamily}-${catalog.headerFontSize}-${catalog.headerFontWeight}-${catalog.headerFontStyle}`}
                  name="header-text"
                  x={marginLeft + 10}
                  y={marginTop}
                  width={currentWidth - marginLeft - marginRight - 20}
                  height={headerHeight}
                  text={catalog.headerText || ""}
                  fontSize={catalog.headerFontSize || Math.min(12, headerHeight / 2)}
                  fontFamily={catalog.headerFontFamily || 'Inter'}
                  fill={catalog.headerColor || '#475569'}
                  fontStyle={`${catalog.headerFontStyle || ''} ${catalog.headerFontWeight || 'bold'}`.trim()}
                  textDecoration={catalog.headerTextDecoration || 'none'}
                  verticalAlign="middle"
                  align={catalog.headerTextAlignment || 'left'}
                  visible={editingId !== 'header'}
                />

                {/* Header Label Pill - Adjusted x to avoid overlap and clipping */}
                <KonvaGroup x={Math.max(marginLeft - 80, 5)} y={marginTop + (headerHeight / 2) - 12}>
                  <KonvaRect width={45} height={24} fill="#475569" cornerRadius={6} opacity={0.9} />
                  <KonvaText text="Header" fill="#ffffff" fontSize={9} fontStyle="bold" width={45} height={24} align="center" verticalAlign="middle" />
                </KonvaGroup>
              </KonvaGroup>
            )}

            {/* Page Number (Only if footer is disabled, otherwise it renders inside footer-group) */}
            {!shouldShowFooter && catalog.footerText?.includes('{{page}}') && (
              <KonvaText
                key={`page-num-no-footer-${catalog.pageNumberAlignment}`}
                name="page-number-no-footer"
                x={catalog.pageNumberAlignment === 'right' ? currentWidth - marginRight - 30 : marginLeft + 10}
                y={currentHeight - marginBottom - 25}
                width={40}
                height={20}
                text={String(pageIdx + 1)}
                fontSize={catalog.footerFontSize || 10}
                fontFamily={catalog.footerFontFamily || 'Inter'}
                fill={catalog.footerColor || '#64748b'}
                verticalAlign="middle"
                align={catalog.pageNumberAlignment || 'right'}
              />
            )}

            {/* Footer Area (Inside Margins) */}
            {shouldShowFooter && (
              <KonvaGroup name="footer-group">
                <KonvaRect
                  name="footer-bg"
                  x={marginLeft}
                  y={currentHeight - marginBottom - footerHeight}
                  width={currentWidth - marginLeft - marginRight}
                  height={footerHeight}
                  fill={`${marginColor}22`}
                />
                <KonvaRect
                  x={marginLeft}
                  y={currentHeight - marginBottom - footerHeight}
                  width={currentWidth - marginLeft - marginRight}
                  height={Math.max(1, 2 / zoom)}
                  fill={marginColor}
                  opacity={0.6}
                />

                {/* Footer Text (Editable Reference) */}
                <KonvaText
                  key={`footer-${catalog.footerFontFamily}-${catalog.footerFontSize}-${catalog.footerFontWeight}-${catalog.footerFontStyle}`}
                  name="footer-text"
                  x={marginLeft + 10}
                  y={currentHeight - marginBottom - footerHeight}
                  width={currentWidth - marginLeft - marginRight - 20}
                  height={footerHeight}
                  text={catalog.footerText ? catalog.footerText.replace(/\{\{page\}\}/gi, '') : ""}
                  fontSize={catalog.footerFontSize || Math.min(10, footerHeight / 2)}
                  fontFamily={catalog.footerFontFamily || 'Inter'}
                  fill={catalog.footerColor || '#64748b'}
                  fontStyle={`${catalog.footerFontStyle || ''} ${catalog.footerFontWeight || 'normal'}`.trim()}
                  textDecoration={catalog.footerTextDecoration || 'none'}
                  verticalAlign="middle"
                  align={catalog.footerTextAlignment || 'left'}
                  visible={editingId !== 'footer'}
                />

                {/* Page Number (Separate from Footer Text) */}
                {catalog.footerText?.toLowerCase().includes('{{page}}') && (
                  <KonvaText
                    key={`page-num-footer-${catalog.pageNumberAlignment}`}
                    name="page-number"
                    x={catalog.pageNumberAlignment === 'right' ? currentWidth - marginRight - 50 : marginLeft + 10}
                    y={currentHeight - marginBottom - footerHeight}
                    width={40}
                    height={footerHeight}
                    text={String(pageIdx + 1)}
                    fontSize={catalog.footerFontSize || Math.min(10, footerHeight / 2)}
                    fontFamily={catalog.footerFontFamily || 'Inter'}
                    fill={catalog.footerColor || '#64748b'}
                    verticalAlign="middle"
                    align={catalog.pageNumberAlignment || 'right'}
                    visible={editingId !== 'footer'}
                  />
                )}

                {/* Footer Label Pill - Adjusted x to avoid overlap and clipping */}
                <KonvaGroup x={Math.max(marginLeft - 80, 5)} y={currentHeight - marginBottom - (footerHeight / 2) - 12}>
                  <KonvaRect width={45} height={24} fill="#475569" cornerRadius={6} opacity={0.9} />
                  <KonvaText text="Footer" fill="#ffffff" fontSize={9} fontStyle="bold" width={45} height={24} align="center" verticalAlign="middle" />
                </KonvaGroup>
              </KonvaGroup>
            )}
          </KonvaGroup>



          {/* All elements - CLIP to margins for interior, cover, and index pages */}
          {page.type === 'interior' || page.type === 'cover' || page.type === 'index' ? (
            <KonvaGroup
              clipX={marginLeft}
              clipY={effContentTop}
              clipWidth={Math.max(0, currentWidth - marginLeft - marginRight)}
              clipHeight={Math.max(0, effContentBottom - effContentTop)}
            >
              {page.elements.map((el) => (
                <CanvasElementComponent
                  key={el.id}
                  element={el}
                  isSelected={isActive && selectedElementIds.includes(el.id)}
                  onSelect={(multi) => isActive && onSelect(el.id, multi)}
                  onChange={(updates) => isActive && onElementChange(el.id, updates)}
                  isEditing={isActive && editingId === el.id}
                />
              ))}
            </KonvaGroup>
          ) : (
            page.elements.map((el) => (
              <CanvasElementComponent
                key={el.id}
                element={el}
                isSelected={isActive && selectedElementIds.includes(el.id)}
                onSelect={(multi) => isActive && onSelect(el.id, multi)}
                onChange={(updates) => isActive && onElementChange(el.id, updates)}
                isEditing={isActive && editingId === el.id}
              />
            ))
          )}


          {/* Snap preview (active page only) */}
          {isActive && snapTarget && draggingItem && page.type === 'interior' && (
            <SnapPreview target={snapTarget} imageUrl={draggingItem.url} zoom={zoom} />
          )}

          {/* Selection box (active page only) */}
          {isActive && selectionBox.visible && (
            <KonvaRect
              x={Math.min(selectionBox.x1, selectionBox.x2)}
              y={Math.min(selectionBox.y1, selectionBox.y2)}
              width={Math.abs(selectionBox.x2 - selectionBox.x1)}
              height={Math.abs(selectionBox.y2 - selectionBox.y1)}
              fill="rgba(79,70,229,0.1)"
              stroke="#4f46e5"
              strokeWidth={1 / zoom}
              dash={[4, 4]}
            />
          )}
          {/* Master Header Elements - Rendered LAST to be on top */}
          {shouldShowHeader && catalog.headerElements.map((el: any) => (
            <CanvasElementComponent
              key={`header-master-${el.id}`}
              element={el}
              isSelected={isActive && selectedElementIds.includes(el.id)}
              onSelect={(multi) => isActive && onSelect(el.id, multi)}
              onChange={(updates) => isActive && useStore.getState().updateHeaderElement(el.id, updates)}
              isEditing={isActive && editingId === el.id}
            />
          ))}

          {/* Master Footer Elements - Rendered LAST to be on top */}
          {shouldShowFooter && catalog.footerElements.map((el: any) => {
            const footerShift = currentHeight - PAGE_HEIGHT;
            const shiftedEl = { ...el, y: el.y + footerShift };
            const elementWithPage = shiftedEl.type === 'text' && shiftedEl.text?.toLowerCase().includes('{{page}}')
              ? { ...shiftedEl, text: shiftedEl.text.replace(/\{\{page\}\}/gi, String(pageIdx + 1)) }
              : shiftedEl;

            return (
              <CanvasElementComponent
                key={`footer-master-${el.id}`}
                element={elementWithPage}
                isSelected={isActive && selectedElementIds.includes(el.id)}
                onSelect={(multi) => isActive && onSelect(el.id, multi)}
                onChange={(updates: any) => {
                  if (!isActive) return;
                  // If Y is updated, we must un-shift it before saving back to master
                  const savedUpdates = { ...updates };
                  if (updates.y !== undefined) {
                    savedUpdates.y = updates.y - footerShift;
                  }
                  useStore.getState().updateFooterElement(el.id, savedUpdates);
                }}
                isEditing={isActive && editingId === el.id}
              />
            );
          })}
        </KonvaLayer>
        {
          isActive && (
            <SmartGuides guides={guides} dragPosition={dragPosition} />
          )
        }
      </KonvaStage >
    );
  };

const EditorCanvas: React.FC = () => {
  const {
    catalog, activeThemeId, currentPageIndex, zoom, setZoom,
    selectedElementIds, setSelectedElementIds,
    updateElement, removeElement, duplicateElement, nudgeElement,
    undo, redo, groupSelected, ungroupSelected, toggleLock,
    addElement, addMedia, draggingItem, setDraggingItem,
    pushHistory, uiTheme, activeTool, setIsPropertyPanelOpen,
    addPage, setCurrentPageIndex, guides, activeDragPosition,
    isProjectSettingsOpen, setIsProjectSettingsOpen, updateProjectSettings,
    setSelectedPageIndex, setSelectedCategoryId,
    removeHeaderElement, removeFooterElement
  } = useStore();

  const currentPage = catalog.pages[currentPageIndex];
  const isLandscape = currentPage?.orientation === 'landscape';
  const curW = isLandscape ? PAGE_HEIGHT : PAGE_WIDTH;
  const curH = isLandscape ? PAGE_WIDTH : PAGE_HEIGHT;

  const theme = THEMES.find(t => t.id === activeThemeId) || THEMES[0];
  const canvasBg = catalog.backgroundColor || theme.backgroundColor;

  const marginTop = catalog.marginTop || 0;
  const marginBottom = catalog.marginBottom || 0;
  const marginLeft = catalog.marginLeft || 0;
  const marginRight = catalog.marginRight || 0;
  const headerHeight = catalog.headerHeight || 40;
  const footerHeight = catalog.footerHeight || 40;

  const [selectionBox, setSelectionBox] = useState({ x1: 0, y1: 0, x2: 0, y2: 0, visible: false });
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragOverTargetId, setDragOverTargetId] = useState<string | null>(null);
  const [showTextToolbar, setShowTextToolbar] = useState(false);
  const [showAddPageMenu, setShowAddPageMenu] = useState(false);
  const addPageMenuRef = useRef<HTMLDivElement>(null);

  // Close add-page menu on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (addPageMenuRef.current && !addPageMenuRef.current.contains(e.target as Node)) setShowAddPageMenu(false);
    };
    if (showAddPageMenu) document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [showAddPageMenu]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editConfig, setEditConfig] = useState<any | null>(null);

  const isSelecting = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);
  const textInputRef = useRef<HTMLDivElement>(null);
  const panRef = useRef({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const lastPointerPosition = useRef({ x: 0, y: 0 });
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const panContentRef = useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Listen for panel page click → scroll canvas to that page
  useEffect(() => {
    const handler = (e: Event) => {
      const { pageIndex } = (e as CustomEvent).detail;
      if (!scrollContainerRef.current) return;
      const target = scrollContainerRef.current.querySelector(`[data-page-index="${pageIndex}"]`) as HTMLElement;
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };
    window.addEventListener('catalog:scrollToPage', handler);
    return () => window.removeEventListener('catalog:scrollToPage', handler);
  }, []);

  const handleBatchUpdate = (updates: Partial<any>) => {
    if (editConfig?.id) {
      if (editConfig.id === 'header') updateProjectSettings({ headerText: updates.text });
      else if (editConfig.id === 'footer') updateProjectSettings({ footerText: updates.text });
      else {
        setEditConfig((prev: any) => prev ? ({ ...prev, ...updates }) : null);
        updateElement(currentPageIndex, editConfig.id, updates);
      }
    }
  };

  const saveContent = useCallback(() => {
    if (editConfig?.id && textInputRef.current) {
      // Use innerText and regex to strip any remaining HTML tags
      let content = textInputRef.current.innerText.replace(/<[^>]*>/g, '');
      // If content is empty/newlines only, make it empty string
      if (!content.trim()) content = "";

      if (content !== editConfig.text) {
        if (editConfig.id === 'header') updateProjectSettings({ headerText: content });
        else if (editConfig.id === 'footer') updateProjectSettings({ footerText: content });
        else updateElement(currentPageIndex, editConfig.id, { text: content });
      }
    }
  }, [editConfig, currentPageIndex, updateElement, updateProjectSettings]);

  useEffect(() => { setShowTextToolbar(false); }, [editConfig?.id]);

  // Zoom-to-fit on mount
  useEffect(() => {
    const fit = () => {
      if (containerRef.current && containerRef.current.clientWidth > 0) {
        const padding = 80;
        const scaleX = (containerRef.current.clientWidth - padding) / PAGE_WIDTH;
        const scaleY = (containerRef.current.clientHeight - padding) / PAGE_HEIGHT;
        const newZoom = Math.min(Math.min(scaleX, scaleY), 1);
        setZoom(Math.max(newZoom, 0.2));
        setPan({ x: 0, y: 0 }); panRef.current = { x: 0, y: 0 };
      } else { setTimeout(fit, 100); }
    };
    const t = setTimeout(fit, 50);
    return () => clearTimeout(t);
  }, []);

  // Block native zoom
  useEffect(() => {
    const h = (e: WheelEvent) => { if (e.ctrlKey || e.metaKey) e.preventDefault(); };
    window.addEventListener('wheel', h, { passive: false });
    return () => window.removeEventListener('wheel', h);
  }, []);

  // Canvas-wide scroll (pan) and Ctrl+scroll (zoom)
  const zoomRef = useRef(zoom);
  useEffect(() => { zoomRef.current = zoom; }, [zoom]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleContainerWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        // Zoom
        const delta = e.deltaY > 0 ? -0.05 : 0.05;
        const newZoom = Math.min(3, Math.max(0.1, zoomRef.current + delta));
        setZoom(newZoom);
      } else {
        // Pan
        const next = getClampedPan(panRef.current.x - e.deltaX, panRef.current.y - e.deltaY);
        panRef.current = next;
        setPan(next);
      }
    };
    container.addEventListener('wheel', handleContainerWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleContainerWheel);
  }, [setZoom]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const activeEl = document.activeElement as HTMLElement;
    if (activeEl?.tagName === 'INPUT' || activeEl?.tagName === 'TEXTAREA' || activeEl?.isContentEditable) {
      // Allow Enter key to insert newline without default behavior if necessary,
      // but let's let default behavior happen and clean it up on save.
      if (e.key === 'Backspace' || e.key === 'Delete') return;
      if (e.key.startsWith('Arrow')) return;
    }
    const isMod = e.metaKey || e.ctrlKey;
    const nudge = e.shiftKey ? 10 : 1;
    switch (e.key) {
      case 'ArrowUp': if (selectedElementIds.length) { e.preventDefault(); if (!e.repeat) pushHistory(); selectedElementIds.forEach(id => nudgeElement(currentPageIndex, id, 0, -nudge)); } break;
      case 'ArrowDown': if (selectedElementIds.length) { e.preventDefault(); if (!e.repeat) pushHistory(); selectedElementIds.forEach(id => nudgeElement(currentPageIndex, id, 0, nudge)); } break;
      case 'ArrowLeft': if (selectedElementIds.length) { e.preventDefault(); if (!e.repeat) pushHistory(); selectedElementIds.forEach(id => nudgeElement(currentPageIndex, id, -nudge, 0)); } break;
      case 'ArrowRight': if (selectedElementIds.length) { e.preventDefault(); if (!e.repeat) pushHistory(); selectedElementIds.forEach(id => nudgeElement(currentPageIndex, id, nudge, 0)); } break;
      case 'Backspace': case 'Delete':
        if (selectedElementIds.length) {
          e.preventDefault();
          selectedElementIds.forEach(id => {
            if (catalog.headerElements.some(h => h.id === id)) {
              removeHeaderElement(id);
            } else if (catalog.footerElements.some(f => f.id === id)) {
              removeFooterElement(id);
            } else {
              const el = currentPage.elements.find(e => e.id === id);
              if (el && !el.locked) removeElement(currentPageIndex, id);
            }
          });
          setSelectedElementIds([]);
        } break;
      case 'l': case 'L': if (isMod && e.shiftKey) { e.preventDefault(); selectedElementIds.forEach(id => toggleLock(currentPageIndex, id)); } break;
      case 'd': if (isMod) { e.preventDefault(); selectedElementIds.forEach(id => duplicateElement(currentPageIndex, id)); } break;
      case 'g': case 'G': if (isMod) { e.preventDefault(); e.shiftKey ? ungroupSelected(currentPageIndex) : groupSelected(currentPageIndex); } break;
      case 'z': case 'Z': if (isMod) { e.preventDefault(); e.shiftKey ? redo() : undo(); } break;
      case 'y': case 'Y': if (isMod) { e.preventDefault(); redo(); } break;
      case '=': case '+': if (isMod) { e.preventDefault(); setZoom(Math.min(3, zoom + 0.1)); } break;
      case '-': if (isMod) { e.preventDefault(); setZoom(Math.max(0.1, zoom - 0.1)); } break;
      case 'b': case 'B':
        if (isMod) { e.preventDefault(); const a = document.activeElement as HTMLElement; if (a?.isContentEditable) { document.execCommand('bold'); } else { selectedElementIds.forEach(id => { const el = currentPage.elements.find(e => e.id === id); if (el?.type === 'text') { const bold = el.fontWeight === 'bold' || el.fontWeight === '700' || el.fontWeight === '800'; updateElement(currentPageIndex, id, { fontWeight: bold ? '400' : '700' }); } }); } } break;
      case 'i': case 'I':
        if (isMod) { e.preventDefault(); const a = document.activeElement as HTMLElement; if (a?.isContentEditable) { document.execCommand('italic'); } else { selectedElementIds.forEach(id => { const el = currentPage.elements.find(e => e.id === id); if (el?.type === 'text') updateElement(currentPageIndex, id, { fontStyle: el.fontStyle === 'italic' ? 'normal' : 'italic' }); }); } } break;
      case 'u': case 'U':
        if (isMod) { e.preventDefault(); const a = document.activeElement as HTMLElement; if (a?.isContentEditable) { document.execCommand('underline'); } else { selectedElementIds.forEach(id => { const el = currentPage.elements.find(e => e.id === id); if (el?.type === 'text') updateElement(currentPageIndex, id, { textDecoration: el.textDecoration === 'underline' ? 'none' : 'underline' }); }); } } break;
      case 'Escape': setSelectedElementIds([]); setEditingId(null); setEditConfig(null); break;
    }
  }, [selectedElementIds, currentPageIndex, nudgeElement, removeElement, duplicateElement, undo, redo, zoom, setZoom, setSelectedElementIds, groupSelected, ungroupSelected, toggleLock, currentPage?.elements, updateElement, pushHistory]);

  useEffect(() => { window.addEventListener('keydown', handleKeyDown); return () => window.removeEventListener('keydown', handleKeyDown); }, [handleKeyDown]);

  // Constraint helper
  const getClampedPan = useCallback((nextX: number, nextY: number) => {
    if (!containerRef.current || !panContentRef.current) return { x: nextX, y: nextY };

    const vW = containerRef.current.clientWidth;
    const vH = containerRef.current.clientHeight;
    // We add a little extra room for the "Add Page" menu and top padding
    const cW = panContentRef.current.scrollWidth;
    const cH = panContentRef.current.scrollHeight;

    let clampedX = nextX;
    let clampedY = nextY;

    if (cW <= vW) {
      clampedX = (vW - cW) / 2;
    } else {
      // Allow panning horizontally between [viewport - content, 0]
      clampedX = Math.min(0, Math.max(vW - cW, nextX));
    }

    if (cH <= vH) {
      clampedY = (vH - cH) / 2;
    } else {
      // Constrain vertical pan between [viewport - content, 0]
      // This stops scrolling at the top items and bottom items
      clampedY = Math.min(0, Math.max(vH - cH, nextY));
    }

    return { x: clampedX, y: clampedY };
  }, []);

  // Sync pan constraints when zoom or pages change
  useEffect(() => {
    setPan(prev => {
      const clamped = getClampedPan(prev.x, prev.y);
      panRef.current = clamped;
      return clamped;
    });
  }, [zoom, catalog.pages.length, getClampedPan]);

  // Panning
  const [isPanActive, setIsPanActive] = useState(false);
  const handlePanMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && activeTool === 'hand') {
      e.preventDefault();
      e.stopPropagation();
      isPanning.current = true;
      setIsPanActive(true);
      lastPointerPosition.current = { x: e.clientX, y: e.clientY };
    }
  };
  const handlePanMouseMove = (e: React.MouseEvent) => {
    if (!isPanning.current) return;
    e.preventDefault();
    const dx = e.clientX - lastPointerPosition.current.x;
    const dy = e.clientY - lastPointerPosition.current.y;
    lastPointerPosition.current = { x: e.clientX, y: e.clientY };
    setPan(prev => {
      const next = getClampedPan(prev.x + dx, prev.y + dy);
      panRef.current = next;
      return next;
    });
  };
  const handlePanMouseUp = () => {
    isPanning.current = false;
    setIsPanActive(false);
  };

  // Keyboard shortcuts

  // Stage events (active page only)
  const handleStageMouseDown = useCallback((e: any) => {
    if (activeTool === 'hand') {
      // Start panning on stage click
      e.evt.preventDefault();
      isPanning.current = true;
      setIsPanActive(true);
      lastPointerPosition.current = { x: e.evt.clientX, y: e.evt.clientY };
      return;
    }
    if (e.target === e.target.getStage() || e.target.name() === 'grid-background' || e.target.name() === 'margin-bg' || e.target.name() === 'header-bg' || e.target.name() === 'footer-bg') {
      const pos = e.target.getStage()?.getPointerPosition();
      if (!pos) return;
      const x = (pos.x - panRef.current.x) / zoom;
      const y = (pos.y - panRef.current.y) / zoom;
      setSelectionBox({ x1: x, y1: y, x2: x, y2: y, visible: true });
      isSelecting.current = true;
      if (!e.evt.shiftKey) setSelectedElementIds([]);
    }
  }, [activeTool, zoom, setSelectedElementIds]);

  const handleStageMouseMove = useCallback((e: any) => {
    if (!isSelecting.current) return;
    const pos = e.target.getStage().getPointerPosition();
    const x = (pos.x - panRef.current.x) / zoom;
    const y = (pos.y - panRef.current.y) / zoom;
    setSelectionBox(prev => ({ ...prev, x2: x, y2: y }));
  }, [zoom]);

  const handleStageMouseUp = useCallback((e: any) => {
    if (!isSelecting.current) return;
    isSelecting.current = false;
    const x = Math.min(selectionBox.x1, selectionBox.x2);
    const y = Math.min(selectionBox.y1, selectionBox.y2);
    const w = Math.abs(selectionBox.x2 - selectionBox.x1);
    const h = Math.abs(selectionBox.y2 - selectionBox.y1);
    if (w < 2 && h < 2) { setSelectionBox(prev => ({ ...prev, visible: false })); return; }
    const ids = currentPage.elements.filter(el => el.x < x + w && el.x + el.width > x && el.y < y + h && el.y + el.height > y).map(el => el.id);
    if (e.evt.shiftKey) setSelectedElementIds([...new Set([...selectedElementIds, ...ids])]);
    else setSelectedElementIds(ids);
    setSelectionBox(prev => ({ ...prev, visible: false }));
  }, [currentPage?.elements, selectionBox, setSelectedElementIds, selectedElementIds]);

  const handleWheel = useCallback((e: any) => {
    if (e.evt.ctrlKey || e.evt.metaKey) {
      e.evt.preventDefault();
      setZoom(Math.min(3, Math.max(0.1, zoom + (e.evt.deltaY > 0 ? -1 : 1) * 0.05)));
    } else {
      e.evt.preventDefault();
      const newPan = { x: panRef.current.x - e.evt.deltaX, y: panRef.current.y - e.evt.deltaY };
      panRef.current = newPan; setPan(newPan);
    }
  }, [zoom, setZoom]);

  const handleSelectElement = useCallback((id: string, isMulti: boolean) => {
    const el = currentPage.elements.find(e => e.id === id);
    let ids = el?.groupId ? currentPage.elements.filter(e => e.groupId === el.groupId).map(e => e.id) : [id];
    if (isMulti) {
      const allSel = ids.every(i => selectedElementIds.includes(i));
      setSelectedElementIds(allSel ? selectedElementIds.filter(s => !ids.includes(s)) : [...new Set([...selectedElementIds, ...ids])]);
    } else { setSelectedElementIds(ids); }
  }, [currentPage?.elements, setSelectedElementIds, selectedElementIds]);

  // Drag & drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(true);
    if (!currentPage || currentPage.type !== 'interior') return;
    const stage = stageRef.current; if (!stage) return;
    const rect = stage.container().getBoundingClientRect();
    const node = stage.getIntersection({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    if (node) { const el = currentPage.elements.find(e => e.id === node.id()); if (el && (el.type === 'shape' || el.type === 'image')) { setDragOverTargetId(node.id()); return; } }
    setDragOverTargetId(null);
  };
  const handleDragLeave = () => { setIsDragOver(false); setDragOverTargetId(null); };
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(false);
    const targetId = dragOverTargetId; setDragOverTargetId(null);
    const stage = stageRef.current; if (!stage) return;
    const rect = stage.container().getBoundingClientRect();
    const pos = stage.getPointerPosition();
    const dropX = pos ? (pos.x - panRef.current.x) / zoom : (e.clientX - rect.left - panRef.current.x) / zoom;
    const dropY = pos ? (pos.y - panRef.current.y) / zoom : (e.clientY - rect.top - panRef.current.y) / zoom;
    const json = e.dataTransfer.getData('application/json');
    if (json) {
      try {
        const data = JSON.parse(json);
        if (data.type === 'image' || data.type === 'product') {
          const isHeaderDrop = dropY < (marginTop + headerHeight);
          const isFooterDrop = dropY > (curH - marginBottom - footerHeight);

          if (targetId && currentPage.type === 'interior') {
            const tEl = currentPage.elements.find(el => el.id === targetId);
            updateElement(currentPageIndex, targetId, { type: tEl?.type === 'product-block' ? 'product-block' : 'image', src: data.url, productId: data.productId, cardTheme: tEl?.cardTheme, opacity: 1 });
          } else if (isHeaderDrop) {
            const headerY = marginTop + 10;
            useStore.getState().addHeaderElement({ id: `header-el-${Date.now()}`, type: 'image', x: Math.max(marginLeft + 10, dropX - 100), y: headerY, width: 200, height: headerHeight - 20, rotation: 0, opacity: 1, src: data.url, productId: data.productId, zIndex: 50 });
          } else if (isFooterDrop) {
            const footerY = curH - marginBottom - footerHeight + 10;
            useStore.getState().addFooterElement({ id: `footer-el-${Date.now()}`, type: 'image', x: Math.max(marginLeft + 10, dropX - 100), y: footerY, width: 200, height: footerHeight - 20, rotation: 0, opacity: 1, src: data.url, productId: data.productId, zIndex: 50 });
          } else {
            addElement(currentPageIndex, { id: `drop-${Date.now()}`, type: 'image', x: dropX - 150, y: dropY - 150, width: 300, height: 300, rotation: 0, opacity: 1, src: data.url, productId: data.productId, zIndex: 50 });
          }
          return;
        }
      } catch { }
    }
    if (e.dataTransfer.files?.length) {
      Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/')).forEach((file, i) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const url = ev.target?.result as string;
          if (targetId && i === 0 && currentPage.type === 'interior') { updateElement(currentPageIndex, targetId, { type: 'image', src: url, opacity: 1 }); }
          else { addElement(currentPageIndex, { id: `drop-file-${Date.now()}-${i}`, type: 'image', x: dropX - 100 + i * 20, y: dropY - 100 + i * 20, width: 250, height: 250, rotation: 0, opacity: 1, src: url, zIndex: 60 }); }
          addMedia({ id: `upload-${Date.now()}-${i}`, name: file.name, type: 'image', url, thumbnailUrl: url, createdAt: new Date().toISOString(), size: `${(file.size / 1024).toFixed(1)} KB` });
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleStageDblClick = useCallback((e: any) => {
    if (activeTool === 'hand') return;

    // Check for Header/Footer areas first (by name or by position)
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    if (!pos) return;

    const x = (pos.x - panRef.current.x) / zoom;
    const y = (pos.y - panRef.current.y) / zoom;
    const targetName = e.target.name();
    const parentName = e.target.getParent()?.name();

    // 1. Header Area Check
    const isHeaderArea = targetName === 'header-bg' || targetName === 'header-text' || parentName === 'header-group';
    // Fallback: Check coordinates if target name isn't caught
    const inHeaderZone = catalog.hasHeader && y >= (catalog.marginTop || 0) && y <= (catalog.marginTop || 0) + (catalog.headerHeight || 0);

    if (isHeaderArea || inHeaderZone) {
      if (catalog.hasHeader) {
        // Double-click on header background -> Open Media Library
        if (targetName === 'header-bg' || targetName === 'header-group' || targetName === 'margin-bg') {
          useStore.getState().setEditorTab('media');
          return;
        }

        setEditingId('header');
        setEditConfig({
          id: 'header',
          text: catalog.headerText || 'Header Text',
          x: (catalog.marginLeft || 0) + 10,
          y: (catalog.marginTop || 0),
          width: curW - (catalog.marginLeft || 0) - (catalog.marginRight || 0) - 20,
          height: (catalog.headerHeight || 0),
          fontSize: catalog.headerFontSize || 12,
          fontFamily: catalog.headerFontFamily || 'Inter',
          fontWeight: 'normal',
          fontStyle: 'normal',
          align: catalog.headerTextAlignment || 'left',
          color: catalog.headerColor || '#475569',
          lineHeight: 1.2,
          verticalAlign: 'middle'
        });
        return;
      }
    }

    // 2. Footer Area Check
    const isFooterArea = targetName === 'footer-bg' || targetName === 'footer-text' || parentName === 'footer-group';
    const footerTopY = curH - (catalog.marginBottom || 0) - (catalog.footerHeight || 0);
    const inFooterZone = catalog.hasFooter && y >= footerTopY && y <= footerTopY + (catalog.footerHeight || 0);

    if (isFooterArea || inFooterZone) {
      if (catalog.hasFooter) {
        // Double-click on footer background -> Open Media Library
        if (targetName === 'footer-bg' || targetName === 'footer-group') {
          useStore.getState().setEditorTab('media');
          return;
        }

        setEditingId('footer');
        setEditConfig({
          id: 'footer',
          text: catalog.footerText || 'Footer Text',
          x: (catalog.marginLeft || 0) + 10,
          y: footerTopY,
          width: curW - (catalog.marginLeft || 0) - (catalog.marginRight || 0) - 20,
          height: (catalog.footerHeight || 0),
          fontSize: catalog.footerFontSize || 10,
          fontFamily: catalog.footerFontFamily || 'Inter',
          fontWeight: 'normal',
          fontStyle: 'normal',
          align: catalog.footerTextAlignment || 'left',
          color: catalog.footerColor || '#64748b',
          lineHeight: 1.2,
          verticalAlign: 'middle'
        });
        return;
      }
    }

    if (e.target === e.target.getStage()) { setEditingId(null); setEditConfig(null); return; }
    const node = e.target;
    // Standard elements
    const element = currentPage.elements.find(el => el.id === node.id() || el.id === node.name() || el.id === node.getParent()?.id() || el.id === node.getParent()?.name());
    if (element && element.type === 'text' && !element.locked) {
      pushHistory();
      setEditingId(element.id);
      setEditConfig({ id: element.id, text: element.text || '', x: element.x, y: element.y, width: element.width, height: element.height, rotation: element.rotation || 0, fontSize: element.fontSize, fontFamily: element.fontFamily, fontWeight: element.fontWeight, fontStyle: element.fontStyle, align: element.textAlign || 'left', color: element.fill || '#000000' });
    } else { setEditingId(null); setEditConfig(null); }
  }, [activeTool, currentPage?.elements, pushHistory, catalog, zoom]);

  useEffect(() => {
    if (editingId && currentPage) {
      // Handle special IDs first
      if (editingId === 'header') {
        setEditConfig((prev: any) => prev ? ({
          ...prev,
          text: catalog.headerText || '',
          fontSize: catalog.headerFontSize || 12,
          fontFamily: catalog.headerFontFamily || 'Inter',
          fontWeight: catalog.headerFontWeight || 'bold',
          fontStyle: catalog.headerFontStyle || 'normal',
          textDecoration: catalog.headerTextDecoration || 'none',
          align: catalog.headerTextAlignment || 'left',
          color: catalog.headerColor || '#475569'
        }) : null);
        return;
      }
      if (editingId === 'footer') {
        setEditConfig((prev: any) => prev ? ({
          ...prev,
          text: catalog.footerText || '',
          fontSize: catalog.footerFontSize || 10,
          fontFamily: catalog.footerFontFamily || 'Inter',
          fontWeight: catalog.footerFontWeight || 'normal',
          fontStyle: catalog.footerFontStyle || 'normal',
          textDecoration: catalog.footerTextDecoration || 'none',
          align: catalog.footerTextAlignment || 'left',
          color: catalog.footerColor || '#64748b'
        }) : null);
        return;
      }

      const el = currentPage.elements.find(e => e.id === editingId);
      if (el) setEditConfig((prev: any) => prev ? { ...prev, color: el.fill || '#000000', fontSize: el.fontSize, fontWeight: el.fontWeight || 'normal', fontStyle: el.fontStyle || 'normal', fontFamily: el.fontFamily, align: el.textAlign || 'left', text: el.text || '', textDecoration: el.textDecoration || 'none' } : null);
    }
  }, [
    currentPageIndex, editingId, currentPage?.elements,
    catalog.headerText, catalog.headerFontSize, catalog.headerFontFamily, catalog.headerFontWeight, catalog.headerFontStyle, catalog.headerTextDecoration, catalog.headerTextAlignment, catalog.headerColor,
    catalog.footerText, catalog.footerFontSize, catalog.footerFontFamily, catalog.footerFontWeight, catalog.footerFontStyle, catalog.footerTextDecoration, catalog.footerTextAlignment, catalog.footerColor
  ]);

  const selectedTextElement = useMemo(() => {
    if (selectedElementIds.length !== 1) return null;
    const el = currentPage?.elements.find(e => e.id === selectedElementIds[0]);
    return el?.type === 'text' ? el : null;
  }, [selectedElementIds, currentPage?.elements]);

  if (!currentPage) return null;
  const snapTarget = dragOverTargetId ? currentPage.elements.find(el => el.id === dragOverTargetId) : null;

  return (
    <div
      className={`flex-1 flex flex-col overflow-hidden relative transition-colors duration-500 ${uiTheme === 'dark' ? 'bg-slate-950' : 'bg-slate-100'}`}
      ref={containerRef}
      onMouseDown={handlePanMouseDown}
      onMouseMove={handlePanMouseMove}
      onMouseUp={handlePanMouseUp}
      onMouseLeave={handlePanMouseUp}
      style={{ cursor: activeTool === 'hand' ? (isPanActive ? 'grabbing' : 'grab') : 'default' }}
    >
      {/* Pannable canvas area */}
      <div
        ref={scrollContainerRef}
        className={`flex-1 overflow-hidden transition-colors duration-500 ${isDragOver ? (uiTheme === 'dark' ? 'bg-indigo-950/20' : 'bg-indigo-50/50') : (uiTheme === 'dark' ? 'bg-slate-900' : 'bg-[#e2e8f0]')
          }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={(e) => {
          const clickedPage = (e.target as HTMLElement).closest('[data-page-index]');
          if (!clickedPage && !isPanning.current) {
            setSelectedElementIds([]);
            setEditingId(null);
            setEditConfig(null);
            setSelectedPageIndex(null);
            setSelectedCategoryId(null);
          }
        }}
      >
        <div
          ref={panContentRef}
          className="flex flex-col items-center py-10 gap-8"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px)`,
            width: 'fit-content',
            minWidth: '100%',
            minHeight: '100%',
          }}
          onClick={(e) => {
            const clickedPage = (e.target as HTMLElement).closest('[data-page-index]');
            if (!clickedPage && !isPanning.current) {
              setSelectedElementIds([]);
              setEditingId(null);
              setEditConfig(null);
              setSelectedPageIndex(null);
              setSelectedCategoryId(null);
              // Removed setCurrentPageIndex(-1) to prevent blank canvas
            }
          }}
        >
          {catalog.pages.map((page, pageIdx) => {
            const isActive = pageIdx === currentPageIndex;
            const isLandscape = page.orientation === 'landscape';
            const curW = isLandscape ? PAGE_HEIGHT : PAGE_WIDTH;
            const curH = isLandscape ? PAGE_WIDTH : PAGE_HEIGHT;

            return (
              <div
                key={page.id}
                data-page-index={pageIdx}
                className="flex flex-col items-center gap-2 shrink-0"
                onClick={() => {
                  if (!isActive) { setCurrentPageIndex(pageIdx); setSelectedElementIds([]); setEditingId(null); setEditConfig(null); }
                }}
              >
                {/* Page label */}
                <span className={`text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${isActive ? 'bg-indigo-600 text-white' : (uiTheme === 'dark' ? 'text-slate-500' : 'text-slate-400')
                  }`}>
                  Page {pageIdx + 1}
                </span>

                {/* Page wrapper */}
                <div
                  className={`shadow-[0_20px_60px_rgba(0,0,0,0.12)] bg-white border shrink-0 relative transition-all ${isActive
                    ? (isDragOver ? 'border-indigo-400 ring-8 ring-indigo-600/5' : 'border-slate-300')
                    : (uiTheme === 'dark' ? 'border-slate-700 opacity-80 hover:opacity-100 cursor-pointer' : 'border-slate-200 opacity-80 hover:opacity-100 cursor-pointer')
                    }`}
                  style={{ width: curW * zoom, height: curH * zoom }}
                >
                  {/* Drop indicator (active page only) */}
                  {isActive && isDragOver && (
                    <div className="absolute inset-0 z-[100] border-4 border-dashed border-indigo-500/30 pointer-events-none flex items-center justify-center bg-indigo-600/5 backdrop-blur-[1px]">
                      {!snapTarget && (
                        <div className="px-8 py-4 bg-white/90 backdrop-blur-md rounded-full shadow-2xl flex items-center gap-3 border border-indigo-100">
                          <div className="w-8 h-8 bg-indigo-600 rounded-[10px] flex items-center justify-center text-white shadow-lg"><Plus size={20} /></div>
                          <span className="text-sm font-black text-indigo-900 uppercase tracking-widest">Drop to Place</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Snap HUD */}
                  {isActive && snapTarget && (
                    <div className="absolute z-[110] px-4 py-2 bg-indigo-600 text-white rounded-[10px] text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-2xl" style={{ left: snapTarget.x * zoom, top: (snapTarget.y * zoom) - 45 }}>
                      <Sparkles size={14} className="animate-pulse" /> Auto-Fitting Asset
                    </div>
                  )}

                  {/* Konva Stage — every page renders its content */}
                  <PageStage
                    page={page}
                    pageIdx={pageIdx}
                    isActive={isActive}
                    zoom={zoom}
                    canvasBg={canvasBg}
                    selectedElementIds={selectedElementIds}
                    editingId={editingId}
                    selectionBox={selectionBox}
                    snapTarget={snapTarget}
                    draggingItem={draggingItem}
                    isDragOver={isDragOver}
                    stageRef={stageRef}
                    onMouseDown={handleStageMouseDown}
                    onMouseMove={handleStageMouseMove}
                    onMouseUp={handleStageMouseUp}
                    onWheel={handleWheel}
                    onDblClick={handleStageDblClick}
                    onSelect={handleSelectElement}
                    onElementChange={(id, updates) => updateElement(currentPageIndex, id, updates)}
                    guides={guides}
                    dragPosition={activeDragPosition}
                    catalog={catalog}
                  />

                  {/* Text editing overlay (active page only) */}
                  {isActive && editConfig && (
                    <div
                      className="absolute z-[1000] bg-transparent outline-none"
                      style={{
                        left: editConfig.x * zoom,
                        top: editConfig.y * zoom,
                        width: editConfig.width * zoom,
                        height: editConfig.height * zoom,
                        transform: `rotate(${editConfig.rotation || 0}deg)`,
                      }}
                    >
                      {/* Header/Footer Label Badge */}
                      {(editConfig.id === 'header' || editConfig.id === 'footer') && (
                        <div className="absolute -top-6 left-0 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-t-md shadow-sm pointer-events-none select-none">
                          {editConfig.id === 'header' ? 'Header' : 'Footer'}
                        </div>
                      )}

                      <div
                        contentEditable suppressContentEditableWarning
                        className={`w-full h-full p-0 outline-none overflow-hidden [&_span]:bg-transparent [&_span]:text-inherit [&_span]:[-webkit-text-fill-color:inherit] ${editConfig.verticalAlign === 'middle' ? 'flex flex-col justify-center' : ''}`}
                        style={{ fontSize: editConfig.fontSize * zoom, fontFamily: editConfig.fontFamily || 'Inter', fontWeight: editConfig.fontWeight, fontStyle: editConfig.fontStyle, textAlign: editConfig.align, lineHeight: editConfig.lineHeight || 1.2, color: editConfig.color?.includes('gradient') ? '#475569' : editConfig.color, caretColor: '#4f46e5', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                        onKeyDown={(e) => e.stopPropagation()}
                        onBlur={saveContent}
                        onMouseUp={saveContent}
                        onInput={(e) => {
                          const text = (e.currentTarget as HTMLElement).innerText.replace(/<[^>]*>/g, '');
                          if (editConfig.id && text !== editConfig.text) {
                            if (editConfig.id === 'header') updateProjectSettings({ headerText: text });
                            else if (editConfig.id === 'footer') updateProjectSettings({ footerText: text });
                            else updateElement(currentPageIndex, editConfig.id, { text: text });
                          }
                        }}
                        ref={(el) => {
                          textInputRef.current = el;
                          if (el && editConfig) {
                            const isFocused = document.activeElement === el;
                            // Only sync text when NOT focused (prevents cursor jumping while typing)
                            if (!isFocused && el.innerText !== editConfig.text) {
                              el.innerText = editConfig.text;
                            }
                            // Auto-focus when clicking on text element
                            if (!isFocused && editConfig.id) {
                              el.focus();
                            }
                          }
                        }}
                      />
                    </div>
                  )}

                  {/* Floating text toolbar */}
                  {isActive && (editingId === 'header' || editingId === 'footer' || selectedTextElement) && (
                    <FloatingTextToolbar
                      element={selectedTextElement || (editingId === 'header' ? {
                        id: 'header',
                        type: 'text',
                        text: catalog.headerText || '',
                        x: editConfig?.x || 0,
                        y: editConfig?.y || 0,
                        width: editConfig?.width || 100,
                        height: editConfig?.height || 20,
                        fontSize: catalog.headerFontSize,
                        fontFamily: catalog.headerFontFamily,
                        fontWeight: catalog.headerFontWeight,
                        fontStyle: catalog.headerFontStyle,
                        textDecoration: catalog.headerTextDecoration,
                        textAlign: catalog.headerTextAlignment,
                        fill: catalog.headerColor
                      } : {
                        id: 'footer',
                        type: 'text',
                        text: catalog.footerText || '',
                        x: editConfig?.x || 0,
                        y: editConfig?.y || 0,
                        width: editConfig?.width || 100,
                        height: editConfig?.height || 20,
                        fontSize: catalog.footerFontSize,
                        fontFamily: catalog.footerFontFamily,
                        fontWeight: catalog.footerFontWeight,
                        fontStyle: catalog.footerFontStyle,
                        textDecoration: catalog.footerTextDecoration,
                        textAlign: catalog.footerTextAlignment,
                        fill: catalog.footerColor
                      }) as any}
                      onUpdate={(updates) => {
                        if (editingId === 'header') {
                          const mappedUpdates: any = {};
                          if (updates.text !== undefined) mappedUpdates.headerText = updates.text;
                          if (updates.fontSize !== undefined) mappedUpdates.headerFontSize = updates.fontSize;
                          if (updates.fontFamily !== undefined) mappedUpdates.headerFontFamily = updates.fontFamily;
                          if (updates.fontWeight !== undefined) mappedUpdates.headerFontWeight = updates.fontWeight;
                          if (updates.fontStyle !== undefined) mappedUpdates.headerFontStyle = updates.fontStyle;
                          if (updates.textDecoration !== undefined) mappedUpdates.headerTextDecoration = updates.textDecoration;
                          if (updates.textAlign !== undefined) mappedUpdates.headerTextAlignment = updates.textAlign;
                          if (updates.fill !== undefined) mappedUpdates.headerColor = updates.fill;
                          updateProjectSettings(mappedUpdates);
                        } else if (editingId === 'footer') {
                          const mappedUpdates: any = {};
                          if (updates.text !== undefined) mappedUpdates.footerText = updates.text;
                          if (updates.fontSize !== undefined) mappedUpdates.footerFontSize = updates.fontSize;
                          if (updates.fontFamily !== undefined) mappedUpdates.footerFontFamily = updates.fontFamily;
                          if (updates.fontWeight !== undefined) mappedUpdates.footerFontWeight = updates.fontWeight;
                          if (updates.fontStyle !== undefined) mappedUpdates.footerFontStyle = updates.fontStyle;
                          if (updates.textDecoration !== undefined) mappedUpdates.footerTextDecoration = updates.textDecoration;
                          if (updates.textAlign !== undefined) mappedUpdates.footerTextAlignment = updates.textAlign;
                          if (updates.fill !== undefined) mappedUpdates.footerColor = updates.fill;
                          updateProjectSettings(mappedUpdates);
                        } else if (selectedTextElement) {
                          updateElement(currentPageIndex, selectedTextElement.id, updates);
                        }
                      }}
                      zoom={zoom}
                    />
                  )}

                  {/* Floating element toolbar */}
                  {isActive && !editConfig && selectedElementIds.length > 0 &&
                    currentPage.elements.find(el => el.id === selectedElementIds[0])?.type !== 'text' && (
                      <FloatingToolbar
                        onOpenMenu={() => { }}
                        currentFill={currentPage.elements.find(el => el.id === selectedElementIds[0])?.fill || '#cbd5e1'}
                        currentStroke={currentPage.elements.find(el => el.id === selectedElementIds[0])?.stroke || 'transparent'}
                        currentOpacity={currentPage.elements.find(el => el.id === selectedElementIds[0])?.opacity}
                        onFillChange={(color) => selectedElementIds.forEach(id => updateElement(currentPageIndex, id, { fill: color }))}
                        onStrokeChange={(color) => selectedElementIds.forEach(id => updateElement(currentPageIndex, id, { stroke: color, strokeWidth: Math.max(currentPage.elements.find(el => el.id === selectedElementIds[0])?.strokeWidth || 0, 2) }))}
                      />
                    )
                  }
                </div>
              </div>
            );
          })}

          {/* Add New Page */}
          <div className="shrink-0 flex flex-col items-center mb-10" ref={addPageMenuRef}>
            <div className="relative" style={{ width: (catalog.pages[catalog.pages.length - 1]?.orientation === 'landscape' ? PAGE_HEIGHT : PAGE_WIDTH) * zoom }}>
              <button
                onClick={() => setShowAddPageMenu(prev => !prev)}
                className={`w-full border-2 border-dashed rounded-lg flex items-center justify-center gap-3 py-4 transition-all ${uiTheme === 'dark'
                  ? 'border-slate-700 hover:border-indigo-500 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10'
                  : 'border-slate-300 hover:border-indigo-400 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50/50'
                  }`}
              >
                <Plus size={16} />
                <span className="text-[12px] font-bold uppercase tracking-widest">Add a New Page</span>
              </button>

              {/* Page type popover */}
              {showAddPageMenu && (
                <div className={`absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-64 border shadow-2xl rounded-2xl overflow-hidden z-50 py-1 ${uiTheme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                  }`}>
                  <p className={`px-4 py-2.5 text-[9px] font-black uppercase tracking-widest border-b ${uiTheme === 'dark' ? 'text-slate-500 border-slate-700' : 'text-slate-400 border-slate-100'
                    }`}>
                    Select Page Type
                  </p>
                  <div className="p-1.5 space-y-0.5">
                    {([
                      { icon: BookOpen, label: 'Hero Cover', sub: 'cover', type: 'cover' as PageType },
                      { icon: List, label: 'Index Page', sub: 'index', type: 'index' as PageType },
                      { icon: FileText, label: 'Blank Interior', sub: 'interior', type: 'interior' as PageType },
                      { icon: FileText, label: 'Closing Page', sub: 'closing', type: 'closing' as PageType },
                    ]).map(({ icon: Icon, label, sub, type }) => (
                      <button
                        key={type}
                        onClick={() => { addPage(type); setShowAddPageMenu(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${uiTheme === 'dark' ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-indigo-50 text-slate-700'
                          }`}
                      >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${uiTheme === 'dark' ? 'bg-slate-700' : 'bg-slate-100'
                          }`}>
                          <Icon size={15} className={uiTheme === 'dark' ? 'text-slate-400' : 'text-slate-500'} />
                        </div>
                        <div>
                          <p className="text-[11px] font-bold leading-none mb-0.5">{label}</p>
                          <p className={`text-[9px] uppercase tracking-wider ${uiTheme === 'dark' ? 'text-slate-500' : 'text-slate-400'
                            }`}>{sub}</p>
                        </div>
                      </button>
                    ))}
                    <div className={`h-px mx-2 my-1 ${uiTheme === 'dark' ? 'bg-slate-700' : 'bg-slate-100'}`} />
                    <button
                      onClick={() => { addPage('interior'); setShowAddPageMenu(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${uiTheme === 'dark' ? 'hover:bg-indigo-600/20 text-slate-300' : 'hover:bg-indigo-50 text-slate-700'
                        }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
                        <Sparkles size={15} className="text-white" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold leading-none mb-0.5">Inherit Layout</p>
                        <p className={`text-[9px] uppercase tracking-wider ${uiTheme === 'dark' ? 'text-slate-500' : 'text-slate-400'
                          }`}>Clone current page</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Editor Footer Bar */}
      <div className={`h-12 border-t flex items-center justify-between px-6 shrink-0 z-40 ${uiTheme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center gap-6">
          <button
            onClick={() => setIsProjectSettingsOpen(!isProjectSettingsOpen)}
            className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors ${isProjectSettingsOpen ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <div className={`w-6 h-6 rounded-md flex items-center justify-center ${isProjectSettingsOpen ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
              <Settings size={12} />
            </div>
            Page Settings
          </button>
          <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600">
            <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center">
              <Plus size={12} />
            </div>
            Comments
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-slate-100 rounded-lg px-2 py-1 gap-3">
            <button onClick={() => setZoom(Math.max(0.1, zoom - 0.1))} className="text-slate-400 hover:text-slate-600"><Plus size={14} className="rotate-45" /></button>
            <span className="text-[10px] font-black text-slate-600 w-8 text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(Math.min(3, zoom + 0.1))} className="text-slate-400 hover:text-slate-600"><Plus size={14} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorCanvas;
