import React, { useEffect, useCallback, useState, useRef, useMemo } from 'react';
import { Plus, Sparkles, BookOpen, List, FileText, Settings, ChevronUp, ChevronDown, Copy, Trash2 } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { PAGE_WIDTH, PAGE_HEIGHT, THEMES } from '../../constants';
import FabricStage from './FabricStage';
import { FloatingTextToolbar } from '../Toolbar/FloatingTextToolbar';
import FloatingToolbar from '../Toolbar/FloatingToolbar';
import { saveSelection, restoreSelection } from '../../utils/textStyleSelection';
import { CatalogPage, PageType } from '../../types';

const Divider = () => <div className="w-[1px] h-4 bg-slate-200 mx-1" />;

const EditorCanvas: React.FC = () => {
  const {
    catalog, activeThemeId, currentPageIndex, zoom, setZoom,
    selectedElementIds, setSelectedElementIds, setSelectedElements,
    updateElement, removeElement, duplicateElement, nudgeElement,
    undo, redo, groupSelected, ungroupSelected, toggleLock,
    addElement, addMedia, draggingItem, setDraggingItem,
    pushHistory, uiTheme, activeTool, setIsPropertyPanelOpen,
    addPage, setCurrentPageIndex, guides, activeDragPosition,
    isProjectSettingsOpen, setIsProjectSettingsOpen, updateProjectSettings,
    setSelectedPageIndex, setSelectedCategoryId,
    addHeaderElement, addFooterElement,
    updateHeaderElement, updateFooterElement,
    removeHeaderElement, removeFooterElement,
    copySelectedElements, pasteElements
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

  const saveContent = useCallback((shouldClose = false) => {
    if (editConfig?.id && textInputRef.current) {
      // Use innerText and regex to strip any remaining HTML tags
      let content = textInputRef.current.innerText.replace(/<[^>]*>/g, '');
      // If content is empty/newlines only, make it empty string
      if (!content.trim()) content = "";

      if (content !== editConfig.text) {
        const html = textInputRef.current?.innerHTML || '';
        if (editConfig.id === 'header') updateProjectSettings({ headerText: html });
        else if (editConfig.id === 'footer') updateProjectSettings({ footerText: html });
        else updateElement(currentPageIndex, editConfig.id, { text: html });
      }

      if (shouldClose) {
        setEditingId(null);
        setEditConfig(null);
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

  // Auto-migrate legacy header/footer text to elements once and cleanup pages
  useEffect(() => {
    const headerNeeded = catalog.hasHeader && catalog.headerText && catalog.headerElements.length === 0 && !catalog.headerMigrated;
    const footerNeeded = catalog.hasFooter && catalog.footerText && catalog.footerElements.length === 0 && !catalog.footerMigrated;

    if (headerNeeded || footerNeeded) {
      if (headerNeeded) {
        addHeaderElement({
          id: `header-txt-migrated-${Date.now()}`,
          type: 'text',
          text: '',
          x: (catalog.marginLeft || 0) + 10,
          y: (catalog.marginTop || 0),
          width: PAGE_WIDTH - (catalog.marginLeft || 0) - (catalog.marginRight || 0) - 20,
          height: (catalog.headerHeight || 0),
          fontSize: catalog.headerFontSize || 12,
          fontFamily: catalog.headerFontFamily || 'Inter',
          fontWeight: catalog.headerFontWeight || 'bold',
          fontStyle: 'normal' as any,
          textAlign: 'center',
          fill: catalog.headerColor || '#475569',
          zIndex: 10,
          rotation: 0,
          opacity: 1,
          verticalAlign: 'middle',
          locked: false // Allow header to be edited
        });
        updateProjectSettings({ headerMigrated: true });
      }
      if (footerNeeded) {
        addFooterElement({
          id: `footer-txt-migrated-${Date.now()}`,
          type: 'text',
          text: '',
          x: (catalog.marginLeft || 0) + 10,
          y: PAGE_HEIGHT - (catalog.marginBottom || 0) - (catalog.footerHeight || 0),
          width: PAGE_WIDTH - (catalog.marginLeft || 0) - (catalog.marginRight || 0) - 20,
          height: (catalog.footerHeight || 0),
          fontSize: catalog.footerFontSize || 10,
          fontFamily: catalog.footerFontFamily || 'Inter',
          fontWeight: catalog.footerFontWeight || 'normal',
          fontStyle: 'normal' as any,
          textAlign: 'center',
          fill: catalog.footerColor || '#64748b',
          zIndex: 10,
          rotation: 0,
          opacity: 1,
          verticalAlign: 'middle',
          locked: false // Allow footer to be edited
        });
        updateProjectSettings({ footerMigrated: true });
      }
    }

    // Trigger cleanup of redundant elements on all pages (run even if already migrated, to fix previous missed cleanups)
    if (!catalog.legacyCleanedUp) {
      const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
      const hText = stripHtml(catalog.headerText || '');
      const fText = stripHtml((catalog.footerText || '').replace(/\{\{page\}\}/gi, ''));

      if (hText || fText) {
        catalog.pages.forEach((page, pageIdx) => {
          const redundantIds = page.elements
            .filter(el => el.type === 'text')
            .filter(el => {
              const elTextStripped = stripHtml(el.text || '').replace(/\{\{page\}\}/gi, '');
              const matchesHeader = hText && elTextStripped === hText;
              const matchesFooter = fText && elTextStripped === fText;
              return matchesHeader || matchesFooter;
            })
            .map(el => el.id);

          redundantIds.forEach(id => removeElement(pageIdx, id));
        });
      }

      updateProjectSettings({ legacyCleanedUp: true });
    }
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
  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const activeEl = document.activeElement as HTMLElement;
    const isEditingText = activeEl?.tagName === 'INPUT' || activeEl?.tagName === 'TEXTAREA' || activeEl?.isContentEditable;

    const isMod = e.metaKey || e.ctrlKey;

    // Undo / Redo - Global
    if (isMod && (e.key === 'z' || e.key === 'Z')) {
      e.preventDefault();
      e.shiftKey ? redo() : undo();
      return;
    }
    if (isMod && (e.key === 'y' || e.key === 'Y')) {
      e.preventDefault();
      redo();
      return;
    }

    // Grouping / Ungrouping
    if (isMod && (e.key === 'g' || e.key === 'G')) {
      e.preventDefault();
      if (e.shiftKey) {
        ungroupSelected(currentPageIndex);
      } else {
        groupSelected(currentPageIndex);
      }
      return;
    }

    // Numpad Enter to deselect (Global)
    if (e.code === 'NumpadEnter') {
      e.preventDefault();
      setSelectedElementIds([]);
      setEditingId(null);
      setEditConfig(null);
      activeEl?.blur();
      return;
    }

    // While editing text, only allow formatting shortcuts
    if (isEditingText) {
      if (isMod) {
        if (['b', 'B'].includes(e.key)) { e.preventDefault(); document.execCommand('bold'); return; }
        if (['i', 'I'].includes(e.key)) { e.preventDefault(); document.execCommand('italic'); return; }
        if (['u', 'U'].includes(e.key)) { e.preventDefault(); document.execCommand('underline'); return; }
      }
      return;
    }

    const nudge = e.shiftKey ? 10 : 1;
    switch (e.key) {
      case 'ArrowUp':
        if (selectedElementIds.length) {
          e.preventDefault();
          if (!e.repeat) pushHistory();
          selectedElementIds.forEach(id => nudgeElement(currentPageIndex, id, 0, -nudge));
        }
        break;
      case 'ArrowDown':
        if (selectedElementIds.length) {
          e.preventDefault();
          if (!e.repeat) pushHistory();
          selectedElementIds.forEach(id => nudgeElement(currentPageIndex, id, 0, nudge));
        }
        break;
      case 'ArrowLeft':
        if (selectedElementIds.length) {
          e.preventDefault();
          if (!e.repeat) pushHistory();
          selectedElementIds.forEach(id => nudgeElement(currentPageIndex, id, -nudge, 0));
        }
        break;
      case 'ArrowRight':
        if (selectedElementIds.length) {
          e.preventDefault();
          if (!e.repeat) pushHistory();
          selectedElementIds.forEach(id => nudgeElement(currentPageIndex, id, nudge, 0));
        }
        break;
      case 'Backspace':
      case 'Delete':
        if (selectedElementIds.length) {
          e.preventDefault();
          selectedElementIds.forEach(id => {
            if (catalog.headerElements?.some(h => h.id === id)) {
              removeHeaderElement(id);
            } else if (catalog.footerElements?.some(f => f.id === id)) {
              removeFooterElement(id);
            } else {
              const el = currentPage.elements.find(e => e.id === id);
              if (el && !el.locked) removeElement(currentPageIndex, id);
            }
          });
          setSelectedElementIds([]);
        }
        break;
      case 'l':
      case 'L':
        if (isMod && e.shiftKey) {
          e.preventDefault();
          selectedElementIds.forEach(id => toggleLock(currentPageIndex, id));
        }
        break;
      case 'd':
      case 'D':
        if (isMod) {
          e.preventDefault();
          selectedElementIds.forEach(id => duplicateElement(currentPageIndex, id));
        }
        break;
      case 'g':
      case 'G':
        if (isMod) {
          e.preventDefault();
          e.shiftKey ? ungroupSelected(currentPageIndex) : groupSelected(currentPageIndex);
        }
        break;
      case '=':
      case '+':
        if (isMod) {
          e.preventDefault();
          setZoom(Math.min(3, zoom + 0.1));
        }
        break;
      case '-':
        if (isMod) {
          e.preventDefault();
          setZoom(Math.max(0.1, zoom - 0.1));
        }
        break;
      case 'b':
      case 'B':
        if (isMod && selectedElementIds.length) {
          e.preventDefault();
          selectedElementIds.forEach(id => {
            const el = currentPage.elements.find(e => e.id === id);
            if (el?.type === 'text') {
              const isBold = el.fontWeight === 'bold' || el.fontWeight === '700' || el.fontWeight === '800';
              updateElement(currentPageIndex, id, { fontWeight: isBold ? '400' : '700' });
            }
          });
        }
        break;
      case 'i':
      case 'I':
        if (isMod && selectedElementIds.length) {
          e.preventDefault();
          selectedElementIds.forEach(id => {
            const el = currentPage.elements.find(e => e.id === id);
            if (el?.type === 'text') {
              updateElement(currentPageIndex, id, { fontStyle: el.fontStyle === 'italic' ? 'normal' : 'italic' });
            }
          });
        }
        break;
      case 'u':
      case 'U':
        if (isMod && selectedElementIds.length) {
          e.preventDefault();
          selectedElementIds.forEach(id => {
            const el = currentPage.elements.find(e => e.id === id);
            if (el?.type === 'text') {
              updateElement(currentPageIndex, id, { textDecoration: el.textDecoration === 'underline' ? 'none' : 'underline' });
            }
          });
        }
        break;
      case 'Escape':
        setSelectedElementIds([]);
        setEditingId(null);
        setEditConfig(null);
        break;
      case 'c':
      case 'C':
        if (isMod) {
          e.preventDefault();
          copySelectedElements();
        }
        break;
      case 'v':
      case 'V':
        if (isMod) {
          e.preventDefault();
          pasteElements();
        }
        break;
    }
  }, [selectedElementIds, currentPageIndex, nudgeElement, removeElement, duplicateElement, undo, redo, zoom, setZoom, setSelectedElementIds, groupSelected, ungroupSelected, toggleLock, currentPage?.elements, updateElement, pushHistory, catalog, removeHeaderElement, removeFooterElement, copySelectedElements, pasteElements]);

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
    if (e.target === e.target.getStage() || e.target.name() === 'grid-background' || e.target.name() === 'margin-bg' || e.target.name() === 'header-bg' || e.target.name() === 'footer-bg' || e.target.name() === 'margin-rect') {
      const stage = e.target.getStage();
      if (!stage) return;
      const pos = stage.getPointerPosition();
      if (!pos) return;

      // Coordinates within the stage are already relative to its top-left.
      // We only need to account for zoom.
      const x = pos.x / zoom;
      const y = pos.y / zoom;

      setSelectionBox({ x1: x, y1: y, x2: x, y2: y, visible: true });
      isSelecting.current = true;
      if (!e.evt.shiftKey) {
        setSelectedElements([]);
        setIsPropertyPanelOpen(false);
        setEditingId(null);
        setEditConfig(null);
      }
    }
  }, [activeTool, zoom, setSelectedElements, setIsPropertyPanelOpen]);

  const handleStageMouseMove = useCallback((e: any) => {
    if (!isSelecting.current) return;
    const stage = e.target.getStage();
    if (!stage) return;
    const pos = stage.getPointerPosition();
    if (!pos) return;
    const x = pos.x / zoom;
    const y = pos.y / zoom;
    setSelectionBox(prev => ({ ...prev, x2: x, y2: y }));
  }, [zoom]);

  const handleStageMouseUp = useCallback((e: any) => {
    if (!isSelecting.current) return;
    isSelecting.current = false;
    const x = Math.min(selectionBox.x1, selectionBox.x2);
    const y = Math.min(selectionBox.y1, selectionBox.y2);
    const w = Math.abs(selectionBox.x2 - selectionBox.x1);
    const h = Math.abs(selectionBox.y2 - selectionBox.y1);

    if (w < 2 && h < 2) {
      setSelectionBox(prev => ({ ...prev, visible: false }));
      return;
    }

    // AABB intersection check across all layers
    const allEls = [
      ...(currentPage?.elements || []),
      ...(catalog.headerElements || []),
      ...(catalog.footerElements || [])
    ];

    const newlySelectedIds = allEls
      .filter(el => {
        const elX = el.x;
        const elY = el.y;
        const elW = el.width;
        const elH = el.height;
        return elX < x + w && elX + elW > x && elY < y + h && elY + elH > y;
      })
      .map(el => el.id);

    if (e.evt.shiftKey) {
      setSelectedElements([...new Set([...selectedElementIds, ...newlySelectedIds])]);
    } else {
      setSelectedElements(newlySelectedIds);
    }

    setSelectionBox(prev => ({ ...prev, visible: false }));
  }, [currentPage?.elements, selectionBox, setSelectedElements, selectedElementIds]);

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
    // Find where this element belongs
    const page = catalog.pages[currentPageIndex];
    const headerEls = catalog.headerElements || [];
    const footerEls = catalog.footerElements || [];

    let el = page?.elements.find(e => e.id === id);
    let container = page?.elements;

    if (!el) {
      el = headerEls.find(e => e.id === id);
      container = headerEls;
    }
    if (!el) {
      el = footerEls.find(e => e.id === id);
      container = footerEls;
    }

    if (!el) return;

    // Use setSelectedElements (group-aware version from store)
    if (isMulti) {
      const isAltSel = selectedElementIds.includes(id);
      if (isAltSel) {
        setSelectedElements(selectedElementIds.filter(sid => sid !== id));
      } else {
        setSelectedElements([...selectedElementIds, id]);
      }
    } else {
      setSelectedElements([id]);
      setIsPropertyPanelOpen(true);
    }
    setEditingId(null);
    setEditConfig(null);
  }, [catalog.pages, currentPageIndex, catalog.headerElements, catalog.footerElements, setSelectedElements, selectedElementIds, setIsPropertyPanelOpen]);

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
      const files = Array.from<File>(e.dataTransfer.files);
      files.filter(f => f.type.startsWith('image/')).forEach((file, i) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const url = ev.target?.result as string;
          if (targetId && i === 0 && currentPage.type === 'interior') { updateElement(currentPageIndex, targetId, { type: 'image', src: url, opacity: 1 }); }
else { addElement(currentPageIndex, { id: `drop-file-${Date.now()}-${i}`, type: 'image', x: dropX - 100 + i * 20, y: dropY - 100 + i * 20, width: 250, height: 250, rotation: 0, opacity: 1, src: url, zIndex: 60 }); }
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
    const inHeaderZone = catalog.hasHeader && y >= (catalog.marginTop || 0) && y <= (catalog.marginTop || 0) + (catalog.headerHeight || 0);

    if (isHeaderArea || inHeaderZone) {
      if (catalog.hasHeader) {
        // Double-click on header background with NO text node -> Create one or Open Media Library
        if (targetName === 'header-bg' || targetName === 'header-group' || targetName === 'margin-bg' || targetName === 'margin-rect') {
          // If already has elements, maybe just ignore or open media
          if (catalog.headerElements.length > 0) {
            useStore.getState().setEditorTab('media');
            return;
          }
        }

        // Try to find an existing text element in the header
        let textEl = catalog.headerElements.find(el => el.type === 'text');

        if (!textEl) {
          // Migration: Create first text element from legacy headerText
          const newId = `header-txt-${Date.now()}`;
          const newEl: any = {
            id: newId,
            type: 'text',
            text: catalog.headerText || 'Header Text',
            x: (catalog.marginLeft || 0) + 10,
            y: (catalog.marginTop || 0),
            width: curW - (catalog.marginLeft || 0) - (catalog.marginRight || 0) - 20,
            height: (catalog.headerHeight || 0),
            fontSize: catalog.headerFontSize || 12,
            fontFamily: catalog.headerFontFamily || 'Inter',
            fontWeight: catalog.headerFontWeight || 'bold',
            fontStyle: catalog.headerFontStyle || 'normal',
            textAlign: catalog.headerTextAlignment || 'left',
            fill: catalog.headerColor || '#475569',
            lineHeight: catalog.headerLineHeight || 1.2,
            letterSpacing: catalog.headerLetterSpacing || 0,
            opacity: catalog.headerOpacity ?? 1,
            zIndex: 10,
            rotation: 0,
            verticalAlign: 'middle'
          };
          addHeaderElement(newEl);
          updateProjectSettings({ headerMigrated: true });
          textEl = newEl;
        }

        setEditingId(textEl.id);
        setEditConfig({
          ...textEl,
          color: textEl.fill || '#000000',
          align: textEl.textAlign || 'left',
          verticalAlign: textEl.verticalAlign || 'middle'
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
          if (catalog.footerElements.length > 0) {
            useStore.getState().setEditorTab('media');
            return;
          }
        }

        // Try to find an existing text element in the footer
        let textEl = catalog.footerElements.find(el => el.type === 'text');

        if (!textEl) {
          // Migration: Create first text element from legacy footerText
          const newId = `footer-txt-${Date.now()}`;
          const newEl: any = {
            id: newId,
            type: 'text',
            text: catalog.footerText || 'Footer Text',
            x: (catalog.marginLeft || 0) + 10,
            y: footerTopY,
            width: curW - (catalog.marginLeft || 0) - (catalog.marginRight || 0) - 20,
            height: (catalog.footerHeight || 0),
            fontSize: catalog.footerFontSize || 10,
            fontFamily: catalog.footerFontFamily || 'Inter',
            fontWeight: catalog.footerFontWeight || 'normal',
            fontStyle: catalog.footerFontStyle || 'normal',
            textAlign: catalog.footerTextAlignment || 'left',
            fill: catalog.footerColor || '#64748b',
            lineHeight: catalog.footerLineHeight || 1.2,
            letterSpacing: catalog.footerLetterSpacing || 0,
            opacity: catalog.footerOpacity ?? 1,
            zIndex: 10,
            rotation: 0,
            verticalAlign: 'middle'
          };
          addFooterElement(newEl);
          updateProjectSettings({ footerMigrated: true });
          textEl = newEl;
        }

        setEditingId(textEl.id);
        setEditConfig({
          ...textEl,
          color: textEl.fill || '#000000',
          align: textEl.textAlign || 'left',
          verticalAlign: textEl.verticalAlign || 'middle'
        });
        return;
      }
    }

    if (e.target === e.target.getStage()) { setEditingId(null); setEditConfig(null); return; }
    const node = e.target;
    // Standard elements
    const element = currentPage.elements.find(el => el.id === node.id() || el.id === node.name() || el.id === node.getParent()?.id() || el.id === node.getParent()?.name()) ||
      catalog.headerElements?.find(el => el.id === node.id() || el.id === node.name() || el.id === node.getParent()?.id() || el.id === node.getParent()?.name()) ||
      catalog.footerElements?.find(el => el.id === node.id() || el.id === node.name() || el.id === node.getParent()?.id() || el.id === node.getParent()?.name());
    if (element && element.type === 'text' && !element.locked) {
      pushHistory();
      setEditingId(element.id);
      setEditConfig({
        id: element.id,
        text: element.text || '',
        x: element.x,
        y: element.y,
        width: element.width,
        height: element.height,
        rotation: element.rotation || 0,
        fontSize: element.fontSize,
        fontFamily: element.fontFamily,
        fontWeight: element.fontWeight,
        fontStyle: element.fontStyle,
        align: element.textAlign || 'left',
        color: element.fill || '#000000',
        lineHeight: element.lineHeight || 1.2,
        letterSpacing: element.letterSpacing || 0,
        opacity: element.opacity ?? 1,
        effectStyle: element.effectStyle,
        effectColor: element.effectColor,
        effectColor2: element.effectColor2,
        shadowBlur: element.shadowBlur,
        shadowOpacity: element.shadowOpacity,
        shadowOffsetX: element.shadowOffsetX,
        shadowOffsetY: element.shadowOffsetY,
        textStrokeWidth: element.textStrokeWidth,
        effectSpread: element.effectSpread,
        effectRoundness: element.effectRoundness,
        verticalAlign: element.verticalAlign || 'top'
      });
    } else { setEditingId(null); setEditConfig(null); }
  }, [activeTool, currentPage?.elements, pushHistory, catalog, zoom]);

  useEffect(() => {
    if (editingId && currentPage) {
      const el = currentPage.elements.find(e => e.id === editingId) ||
        catalog.headerElements?.find(e => e.id === editingId) ||
        catalog.footerElements?.find(e => e.id === editingId);
      if (el) setEditConfig((prev: any) => prev ? {
        ...prev,
        color: el.fill || '#000000',
        fontSize: el.fontSize,
        fontWeight: el.fontWeight || 'normal',
        fontStyle: el.fontStyle || 'normal',
        fontFamily: el.fontFamily,
        align: el.textAlign || 'left',
        text: el.text || '',
        textDecoration: el.textDecoration || 'none',
        lineHeight: el.lineHeight || 1.2,
        letterSpacing: el.letterSpacing || 0,
        opacity: el.opacity ?? 1,
        effectStyle: el.effectStyle,
        effectColor: el.effectColor,
        effectColor2: el.effectColor2,
        shadowBlur: el.shadowBlur,
        shadowOpacity: el.shadowOpacity,
        shadowOffsetX: el.shadowOffsetX,
        shadowOffsetY: el.shadowOffsetY,
        textStrokeWidth: el.textStrokeWidth,
        effectSpread: el.effectSpread,
        effectRoundness: el.effectRoundness
      } : null);
    }
  }, [
    currentPageIndex, editingId, currentPage?.elements,
    catalog.headerElements, catalog.footerElements
  ]);

  const selectedElement = useMemo(() => {
    if (selectedElementIds.length !== 1) return null;
    const id = selectedElementIds[0];
    return currentPage?.elements.find(e => e.id === id) ||
      catalog.headerElements?.find(e => e.id === id) ||
      catalog.footerElements?.find(e => e.id === id);
  }, [selectedElementIds, currentPage?.elements, catalog.headerElements, catalog.footerElements]);

  const selectedTextElement = useMemo(() => {
    return selectedElement?.type === 'text' ? selectedElement : null;
  }, [selectedElement]);

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

                {/* Page wrapper */}
                <div
                  className={`shadow-[0_20px_60px_rgba(0,0,0,0.12)] bg-white border shrink-0 relative transition-all ${isActive
                    ? (isDragOver ? 'border-indigo-400 ring-8 ring-indigo-600/5' : 'border-slate-300')
                    : (uiTheme === 'dark' ? 'border-slate-700 opacity-80 hover:opacity-100 cursor-pointer' : 'border-slate-200 opacity-80 hover:opacity-100 cursor-pointer')
                    }`}
                  style={{ width: curW * zoom, height: curH * zoom }}
                >
                  {/* Floating Labels (Outside Stage) */}
                  {page.type === 'interior' && (
                    <div className="absolute inset-0 pointer-events-none z-[50]">
                      {catalog.hasHeader && (
                        <div
                          className="absolute bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded shadow-lg transition-all"
                          style={{
                            left: -5 * zoom,
                            top: (catalog.marginTop || 0) * zoom + (catalog.headerHeight || 40) * zoom / 2,
                            transform: 'translate(-100%, -50%)',
                            opacity: isActive ? 1 : 0.4
                          }}
                        >
                          Header
                        </div>
                      )}
                      {catalog.hasFooter && (
                        <div
                          className="absolute bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded shadow-lg transition-all"
                          style={{
                            left: -5 * zoom,
                            top: (curH - (catalog.marginBottom || 0) - (catalog.footerHeight || 40) / 2) * zoom,
                            transform: 'translate(-100%, -50%)',
                            opacity: isActive ? 1 : 0.4
                          }}
                        >
                          Footer
                        </div>
                      )}
                    </div>
                  )}
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

                  <FabricStage
                    page={page}
                    pageIdx={pageIdx}
                    isActive={isActive}
                    zoom={zoom}
                    canvasBg={canvasBg}
                  />

                  {/* Text editing overlay (active page only) */}
                  {isActive && editConfig && (
                    <div
                      className="absolute z-[3000]"
                      style={{
                        left: editConfig.x * zoom,
                        top: editConfig.y * zoom,
                        width: editConfig.width * zoom,
                        height: editConfig.height * zoom,
                        transform: `rotate(${editConfig.rotation || 0}deg)`,
                        transformOrigin: 'top left',
                        pointerEvents: 'auto',
                      }}
                    >
                      <div
                        contentEditable suppressContentEditableWarning
                        className="w-full h-full p-0 outline-none overflow-visible selection:bg-indigo-200/50"
                        style={{
                          fontSize: editConfig.fontSize * zoom,
                          fontFamily: editConfig.fontFamily || 'Inter',
                          fontWeight: editConfig.fontWeight,
                          fontStyle: editConfig.fontStyle,
                          textAlign: editConfig.align,
                          lineHeight: editConfig.lineHeight || 1.2,
                          letterSpacing: (editConfig.letterSpacing || 0) * zoom,
                          opacity: editConfig.opacity ?? 1,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: editConfig.verticalAlign === 'middle' ? 'center' : (editConfig.verticalAlign === 'bottom' ? 'flex-end' : 'flex-start'),
                          ...(editConfig.color?.includes('gradient') ? {
                            background: editConfig.color,
                            WebkitBackgroundClip: 'text',
                            backgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            color: 'transparent',
                          } : {
                            color: editConfig.color
                          }),
                          ...(() => {
                            if (!editConfig.effectStyle || editConfig.effectStyle === 'none') return {};
                            const color = editConfig.effectColor || '#000000';
                            const color2 = editConfig.effectColor2 || '#00fff9';
                            const offX = (editConfig.shadowOffsetX || 0) * zoom;
                            const offY = (editConfig.shadowOffsetY || 0) * zoom;
                            const blur = (editConfig.shadowBlur || 0) * zoom;
                            const opacity = (editConfig.shadowOpacity !== undefined && editConfig.shadowOpacity !== null) ? editConfig.shadowOpacity : 0.5;
                            const thickness = (editConfig.textStrokeWidth || 1) * zoom;

                            switch (editConfig.effectStyle) {
                              case 'hollow': return { WebkitTextStroke: `${thickness}px ${color}`, color: 'transparent', WebkitTextFillColor: 'transparent' };
                              case 'outline': return { WebkitTextStroke: `${thickness}px ${color}` };
                              case 'shadow': return { textShadow: `${offX}px ${offY}px ${blur}px ${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}` };
                              case 'lift': return { textShadow: `0px ${4 * zoom}px ${blur}px rgba(0,0,0,${opacity})` };
                              case 'neon': return { color: color, textShadow: opacity > 0 ? `0 0 ${5 * zoom * opacity}px ${color}, 0 0 ${10 * zoom * opacity}px ${color}, 0 0 ${20 * zoom * opacity}px ${color}` : 'none' };
                              case 'glitch': return { textShadow: `${offX}px ${offY}px 0 ${color}, ${-offX}px ${-offY}px 0 ${color2}` };
                              case 'echo': return { textShadow: `${offX}px ${offY}px 0px ${color}aa, ${offX * 2}px ${offY * 2}px 0px ${color}66, ${offX * 3}px ${offY * 3}px 0px ${color}33` };
                              case 'splice': return { WebkitTextStroke: `${thickness}px ${color}`, textShadow: `${offX}px ${offY}px 0px ${color}88` };
                              case 'background': return { backgroundColor: `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`, display: 'inline-block' };
                              default: return {};
                            }
                          })(),
                          caretColor: '#8b3dff',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          padding: `${5 * zoom}px`, // Match Konva Text padding
                          minWidth: 20 * zoom,
                          minHeight: 20 * zoom,
                          boxSizing: 'border-box',
                        }}
                        onBlur={() => {
                          const html = textInputRef.current?.innerHTML || '';
                          if (catalog.headerElements.some(el => el.id === editConfig.id)) {
                            updateHeaderElement(editConfig.id, { text: html });
                          } else if (catalog.footerElements.some(el => el.id === editConfig.id)) {
                            updateFooterElement(editConfig.id, { text: html });
                          } else {
                            updateElement(currentPageIndex, editConfig.id, { text: html });
                          }
                          saveContent(true);
                        }}
                        onInput={(e) => {
                          const target = e.currentTarget as HTMLElement;
                          const html = target.innerHTML;

                          const isHeader = catalog.headerElements.some(el => el.id === editConfig.id);
                          const isFooter = catalog.footerElements.some(el => el.id === editConfig.id);

                          if (editConfig.id) {
                            const updates: any = { text: html };

                            // Only auto-resize height for standard page elements
                            if (!isHeader && !isFooter) {
                              const newHeight = Math.max(20, target.scrollHeight / zoom);
                              if (Math.abs(newHeight - editConfig.height) > 1) {
                                updates.height = newHeight;
                              }
                            }

                            setEditConfig(prev => prev ? ({ ...prev, ...updates }) : null);

                            if (isHeader) {
                              updateHeaderElement(editConfig.id, updates);
                            } else if (isFooter) {
                              updateFooterElement(editConfig.id, updates);
                            } else {
                              updateElement(currentPageIndex, editConfig.id, updates);
                            }
                          }
                        }}
                        ref={(el) => {
                          textInputRef.current = el;
                          if (el && editConfig) {
                            if (document.activeElement !== el) {
                              el.innerHTML = editConfig.text;
                              el.focus();
                              // Move cursor to end
                              const range = document.createRange();
                              const sel = window.getSelection();
                              range.selectNodeContents(el);
                              range.collapse(false);
                              if (sel) {
                                sel.removeAllRanges();
                                sel.addRange(range);
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  )}

                  {/* Floating text toolbar */}
                  {isActive && (editingId || selectedTextElement) && (
                    <FloatingTextToolbar
                      element={(editingId && editConfig ? {
                        ...editConfig,
                        type: 'text',
                        fill: editConfig.color,
                        textAlign: editConfig.align,
                      } : selectedTextElement) as any}
                      onUpdate={(updates) => {
                        if (editingId) {
                          // 1. Update local editing state immediately for instant feedback
                          const mappedForEdit: any = { ...updates };
                          if (updates.fill !== undefined) mappedForEdit.color = updates.fill;
                          if (updates.textAlign !== undefined) mappedForEdit.align = updates.textAlign;
                          setEditConfig(prev => prev ? { ...prev, ...mappedForEdit } : null);

                          if (updates.text !== undefined && textInputRef.current) {
                            textInputRef.current.innerHTML = updates.text;
                          }

                          // 2. Update store
                          if (catalog.headerElements?.some(el => el.id === editingId)) {
                            updateHeaderElement(editingId, updates);
                          } else if (catalog.footerElements?.some(el => el.id === editingId)) {
                            updateFooterElement(editingId, updates);
                          } else {
                            updateElement(currentPageIndex, editingId, updates);
                          }
                        } else if (selectedTextElement) {
                          if (catalog.headerElements?.some(el => el.id === selectedTextElement.id)) {
                            updateHeaderElement(selectedTextElement.id, updates);
                          } else if (catalog.footerElements?.some(el => el.id === selectedTextElement.id)) {
                            updateFooterElement(selectedTextElement.id, updates);
                          } else {
                            updateElement(currentPageIndex, selectedTextElement.id, updates);
                          }
                        }
                      }}
                      zoom={zoom}
                    />
                  )}

                  {/* Floating element toolbar */}
                  {isActive && !editConfig && selectedElement && selectedElement.type !== 'text' && (
                    <FloatingToolbar
                      onOpenMenu={() => { }}
                      currentFill={selectedElement.fill || '#cbd5e1'}
                      currentStroke={selectedElement.stroke || 'transparent'}
                      currentOpacity={selectedElement.opacity}
                      onFillChange={(color) => {
                        if (catalog.headerElements.some(el => el.id === selectedElement.id)) updateHeaderElement(selectedElement.id, { fill: color });
                        else if (catalog.footerElements.some(el => el.id === selectedElement.id)) updateFooterElement(selectedElement.id, { fill: color });
                        else updateElement(currentPageIndex, selectedElement.id, { fill: color });
                      }}
                      onStrokeChange={(color) => {
                        const updates = { stroke: color, strokeWidth: Math.max(selectedElement.strokeWidth || 0, 2) };
                        if (catalog.headerElements.some(el => el.id === selectedElement.id)) updateHeaderElement(selectedElement.id, updates);
                        else if (catalog.footerElements.some(el => el.id === selectedElement.id)) updateFooterElement(selectedElement.id, updates);
                        else updateElement(currentPageIndex, selectedElement.id, updates);
                      }}
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
