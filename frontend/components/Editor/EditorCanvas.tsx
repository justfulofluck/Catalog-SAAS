import React, { useEffect, useCallback, useState, useRef, useMemo } from 'react';
import { Plus, Sparkles, Zap, BookOpen, List, FileText, Settings, ChevronUp, ChevronDown, Copy, Trash2, ChevronsUp, ChevronsDown, Navigation } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { PAGE_WIDTH, PAGE_HEIGHT, THEMES } from '../../constants';
import FabricStage from './FabricStage';
import ContextMenu from './ContextMenu';
import { FloatingTextToolbar } from '../Toolbar/FloatingTextToolbar';
import FloatingToolbar from '../Toolbar/FloatingToolbar';
import ProductGridStudioModal from './ProductGridStudioModal';
import { saveSelection, restoreSelection } from '../../utils/textStyleSelection';
import { CatalogPage, PageType } from '../../types';
import { normalizeImageUrl } from '../../utils/imageUtils';

const Divider = () => <div className="w-[1px] h-4 bg-slate-200 mx-1" />;

interface PageSectionSummary {
  index: number;
  y: number;
  height: number;
  title: string;
}

const getPageSectionsSummary = (page: CatalogPage | undefined): PageSectionSummary[] => {
  if (!page || !page.elements || page.elements.length === 0) return [];
  if (page.type === 'cover' || page.type === 'index' || page.type === 'closing') return [];

  const titles = page.elements.filter(el => el.type === 'text' && (el.fontSize || 0) >= 16);
  const tables = page.elements.filter(el => el.type === 'table' && el.tableData);
  const shapes = page.elements.filter(el => el.type === 'shape' && (el.width || 0) >= 500);

  if (titles.length < 1 && tables.length < 1) return [];

  if (titles.length > 0) {
    const sortedTitles = [...titles].sort((a, b) => a.y - b.y);
    return sortedTitles.map((t, idx) => {
      const nearestTable = tables.find(tbl => Math.abs(tbl.y - t.y) < 180);
      const nearestShape = shapes.find(s => Math.abs(s.y - t.y) < 180);
      const minY = Math.min(t.y, nearestShape ? nearestShape.y : t.y);
      const maxY = Math.max(
        t.y + (t.height || 30),
        nearestTable ? nearestTable.y + (nearestTable.height || 60) : t.y + 100,
        nearestShape ? nearestShape.y + (nearestShape.height || 120) : t.y + 100
      );

      return {
        index: idx,
        y: minY,
        height: Math.max(80, maxY - minY),
        title: t.text?.replace(/<[^>]*>/g, '') || `Section ${idx + 1}`
      };
    });
  }

  const sortedTables = [...tables].sort((a, b) => a.y - b.y);
  return sortedTables.map((tbl, idx) => ({
    index: idx,
    y: Math.max(0, tbl.y - 30),
    height: Math.max(80, (tbl.height || 80) + 40),
    title: `Section ${idx + 1}`
  }));
};

const EditorCanvas: React.FC = () => {
  const {
    catalog, activeThemeId, currentPageIndex, zoom, setZoom,
    selectedElementIds, setSelectedElementIds, setSelectedElements,
    updateElement, removeElement, duplicateElement, nudgeElement,
    undo, redo, groupSelected, ungroupSelected, toggleLock,
    addElement, addMedia, draggingItem, setDraggingItem,
    pushHistory, uiTheme, activeTool, setIsPropertyPanelOpen,
    isTableEditorOpen, editingTableElementId, setIsTableEditorOpen,
    isGridStudioOpen, gridStudioPageIndex, setIsGridStudioOpen,
    applyProductGridToPage, reflowCatalogPages,
    swapPageSections, deletePageSection,
    setEditorTab, setSidebarExpanded,
    addPage, setCurrentPageIndex, guides, activeDragPosition,
    isProjectSettingsOpen, setIsProjectSettingsOpen, updateProjectSettings,
    setSelectedPageIndex, setSelectedCategoryId,
    addHeaderElement, addFooterElement,
    updateHeaderElement, updateFooterElement,
    removeHeaderElement, removeFooterElement,
    copySelectedElements, pasteElements, addInteriorPageWithInheritedLayout,
    duplicatePage, removePage, openColorPicker
  } = useStore();

  const currentPage = catalog.pages[currentPageIndex];
  const curW = PAGE_WIDTH;
  const curH = PAGE_HEIGHT;

  const theme = THEMES.find(t => t.id === activeThemeId) || THEMES[0];
  const canvasBg = currentPage?.backgroundColor || catalog.backgroundColor || theme?.backgroundColor || '#ffffff';

  const marginTop = catalog.marginTop || 0;
  const marginBottom = catalog.marginBottom || 0;
  const marginLeft = catalog.marginLeft || 0;
  const marginRight = catalog.marginRight || 0;
  const headerHeight = catalog.headerHeight || 40;
  const footerHeight = catalog.footerHeight || 40;

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
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    type: 'page' | 'element';
    pageIndex: number;
    targetId?: string;
  } | null>(null);

  // Listen for context menu requests from FabricStage or Page wrappers
  useEffect(() => {
    const handleOpenContextMenu = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setContextMenu(detail);
    };
    window.addEventListener('catalog:openContextMenu', handleOpenContextMenu);
    return () => window.removeEventListener('catalog:openContextMenu', handleOpenContextMenu);
  }, []);

  const containerRef = useRef<HTMLDivElement>(null);
  const textInputRef = useRef<HTMLDivElement>(null);
  const activeEditingTextRef = useRef<string | null>(null);
  const textDebounceTimerRef = useRef<number | null>(null);
  const editConfigRef = useRef<any | null>(null);
  const isSavingRef = useRef<boolean>(false);
  const idCounterRef = useRef(0);
  const panRef = useRef({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const lastPointerPosition = useRef({ x: 0, y: 0 });
  const lastMousePosRef = useRef<{ clientX: number; clientY: number } | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const panContentRef = useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Track pointer location globally to paste at mouse position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      lastMousePosRef.current = { clientX: e.clientX, clientY: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Constraint helper (Defined early so all hooks can access it)
  const getClampedPan = useCallback((nextX: number, nextY: number) => {
    if (!containerRef.current || !panContentRef.current) return { x: nextX, y: nextY };

    const vW = containerRef.current.clientWidth;
    const vH = containerRef.current.clientHeight;
    const cW = panContentRef.current.scrollWidth;
    const cH = panContentRef.current.scrollHeight;

    let clampedX = nextX;
    let clampedY = nextY;

    if (cW <= vW) {
      clampedX = (vW - cW) / 2;
    } else {
      clampedX = Math.min(0, Math.max(vW - cW, nextX));
    }

    if (cH <= vH) {
      clampedY = (vH - cH) / 2;
    } else {
      clampedY = Math.min(0, Math.max(vH - cH, nextY));
    }

    return { x: clampedX, y: clampedY };
  }, []);

  // Smoothly pan canvas to center a specific page
  const scrollToPageIndex = useCallback((pageIndex: number) => {
    if (!containerRef.current || !catalog.pages[pageIndex]) return;
    const vH = containerRef.current.clientHeight;
    const curPageH = PAGE_HEIGHT * zoom;
    const gap = 32; // gap-8 = 2rem = 32px
    const topPadding = 40; // py-10 = 2.5rem = 40px

    // Calculate Y offset of this specific page in content
    const pageTopInContent = topPadding + pageIndex * (curPageH + gap);
    const targetPanY = (vH / 2) - (pageTopInContent + curPageH / 2);

    const next = getClampedPan(panRef.current.x, targetPanY);
    panRef.current = next;
    setPan(next);
  }, [catalog.pages, zoom, getClampedPan]);

  // Listen for panel page click → smoothly pan canvas to that page
  useEffect(() => {
    const handler = (e: Event) => {
      const { pageIndex } = (e as CustomEvent).detail;
      scrollToPageIndex(pageIndex);
    };
    window.addEventListener('catalog:scrollToPage', handler);
    return () => window.removeEventListener('catalog:scrollToPage', handler);
  }, [scrollToPageIndex]);

  const saveContent = useCallback((shouldClose = false) => {
    if (textDebounceTimerRef.current) {
      clearTimeout(textDebounceTimerRef.current);
      textDebounceTimerRef.current = null;
    }

    const currentConfig = editConfigRef.current;
    if (currentConfig?.id) {
      let content = activeEditingTextRef.current;
      if (textInputRef.current) {
        const domText = (textInputRef.current.innerText || textInputRef.current.textContent || '').replace(/<[^>]*>/g, '');
        // Only override if domText has meaningful content or activeEditingTextRef was empty
        if (domText.trim().length > 0 || !content) {
          content = domText;
        }
      }

      // If user completely cleared the text or whitespace, restore existing text to prevent accidental deletion
      if (!content || !content.trim()) {
        content = currentConfig.text || activeEditingTextRef.current || '';
      }

      const isHeader = catalog.headerElements?.some(el => el.id === currentConfig.id);
      const isFooter = catalog.footerElements?.some(el => el.id === currentConfig.id);

      const updates: any = { text: content };
      if (!isHeader && !isFooter && textInputRef.current) {
        const newHeight = Math.max(20, textInputRef.current.scrollHeight / zoom);
        if (Math.abs(newHeight - currentConfig.height) > 1) {
          updates.height = newHeight;
        }
      }

      if (isHeader) {
        updateHeaderElement(currentConfig.id, updates);
      } else if (isFooter) {
        updateFooterElement(currentConfig.id, updates);
      } else if (currentConfig.id === 'header') {
        updateProjectSettings({ headerText: content });
      } else if (currentConfig.id === 'footer') {
        updateProjectSettings({ footerText: content });
      } else {
        const targetPageIndex = currentConfig.pageIndex !== undefined ? currentConfig.pageIndex : currentPageIndex;
        updateElement(targetPageIndex, currentConfig.id, updates);
      }

      if (shouldClose) {
        activeEditingTextRef.current = null;
        editConfigRef.current = null;
        setEditingId(null);
        setEditConfig(null);
      }
    } else if (shouldClose) {
      activeEditingTextRef.current = null;
      editConfigRef.current = null;
      setEditingId(null);
      setEditConfig(null);
    }
  }, [currentPageIndex, zoom, catalog.headerElements, catalog.footerElements, updateElement, updateHeaderElement, updateFooterElement, updateProjectSettings]);

  // Listen for double-click text editing
  useEffect(() => {
    const handler = (e: Event) => {
      const { id, pageIndex } = (e as CustomEvent).detail;
      // Header elements cannot be edited in the main editor canvas
      if (catalog.headerElements?.some(item => item.id === id)) {
        return;
      }

      // If already editing another element, flush its contents first before opening the new one
      if (editConfigRef.current && editConfigRef.current.id !== id) {
        saveContent(true);
      }

      if (pageIndex !== undefined) setCurrentPageIndex(pageIndex);
      const page = catalog.pages[pageIndex ?? currentPageIndex];
      const el = page?.elements.find(item => item.id === id) ||
        catalog.footerElements?.find(item => item.id === id);
      if (el) {
        activeEditingTextRef.current = el.text || '';
        const resolvedPageIndex = pageIndex !== undefined ? pageIndex : currentPageIndex;
        const newConfig = {
          id: el.id,
          pageIndex: resolvedPageIndex,
          x: el.x,
          y: el.y,
          width: el.width,
          height: el.height,
          rotation: el.rotation || 0,
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
        };
        editConfigRef.current = newConfig;
        setEditingId(id);
        setEditConfig(newConfig);
      }
    };
    window.addEventListener('catalog:editText', handler);
    return () => window.removeEventListener('catalog:editText', handler);
  }, [catalog.pages, catalog.headerElements, catalog.footerElements, currentPageIndex, setCurrentPageIndex, saveContent]);

  // Listen for catalog:editTable event to switch to Grid Studio in sidebar
  useEffect(() => {
    const handleEditTable = (e: any) => {
      const { pageIndex } = e.detail || {};
      if (pageIndex !== undefined && pageIndex !== currentPageIndex) {
        setCurrentPageIndex(pageIndex);
      }
      setEditorTab('grid');
    };
    window.addEventListener('catalog:editTable', handleEditTable);
    return () => window.removeEventListener('catalog:editTable', handleEditTable);
  }, [currentPageIndex, setCurrentPageIndex, setEditorTab]);

  const handleBatchUpdate = (updates: Partial<any>) => {
    const cur = editConfigRef.current;
    if (cur?.id) {
      if (cur.id === 'header') updateProjectSettings({ headerText: updates.text });
      else if (cur.id === 'footer') updateProjectSettings({ footerText: updates.text });
      else {
        editConfigRef.current = { ...cur, ...updates };
        setEditConfig((prev: any) => prev ? ({ ...prev, ...updates }) : null);
        const targetPageIndex = cur.pageIndex !== undefined ? cur.pageIndex : currentPageIndex;
        updateElement(targetPageIndex, cur.id, updates);
      }
    }
  };

  useEffect(() => { setShowTextToolbar(false); }, [editConfig?.id]);

  // Zoom-to-fit on mount
  useEffect(() => {
    const timerRef = { current: 0 as unknown as ReturnType<typeof setTimeout> };
    const fit = () => {
      if (containerRef.current && containerRef.current.clientWidth > 0) {
        const padding = 80;
        const scaleX = (containerRef.current.clientWidth - padding) / PAGE_WIDTH;
        const scaleY = (containerRef.current.clientHeight - padding) / PAGE_HEIGHT;
        const newZoom = Math.min(Math.min(scaleX, scaleY), 1);
        setZoom(Math.max(newZoom, 0.2));
        setPan({ x: 0, y: 0 }); panRef.current = { x: 0, y: 0 };
      } else { timerRef.current = setTimeout(fit, 100); }
    };
    timerRef.current = setTimeout(fit, 50);
    return () => clearTimeout(timerRef.current);
  }, []);

  // Auto-migrate legacy header/footer text only if explicitly requested by tenant catalogs (not in Template Studio)
  useEffect(() => {
    const { editingSystemTemplate } = useStore.getState();
    if (editingSystemTemplate) return; // Never auto-inject default header/footer in Template Studio

    const headerElements = catalog.headerElements || [];
    const footerElements = catalog.footerElements || [];
    const headerNeeded = catalog.hasHeader && catalog.headerText && headerElements.length === 0 && !catalog.headerMigrated;
    const footerNeeded = catalog.hasFooter && catalog.footerText && footerElements.length === 0 && !catalog.footerMigrated;

    if (headerNeeded || footerNeeded) {
      if (headerNeeded) {
        addHeaderElement({
          id: `header-txt-migrated-${Date.now()}`,
          type: 'text',
          text: catalog.headerText || 'Company Catalog 2026',
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
          locked: false
        });
        updateProjectSettings({ headerMigrated: true });
      }
      if (footerNeeded) {
        addFooterElement({
          id: `footer-txt-migrated-${Date.now()}`,
          type: 'text',
          text: catalog.footerText || 'Proprietary & Confidential',
          x: (catalog.marginLeft || 0) + 10,
          y: PAGE_HEIGHT - (catalog.marginBottom || 0) - (catalog.footerHeight || 0),
          width: PAGE_WIDTH - (catalog.marginLeft || 0) - (catalog.marginRight || 0) - 20,
          height: (catalog.footerHeight || 0),
          fontSize: catalog.footerFontSize || 10,
          fontFamily: catalog.footerFontFamily || 'Inter',
          fontWeight: 'normal',
          fontStyle: 'normal' as any,
          textAlign: 'center',
          fill: catalog.footerColor || '#64748b',
          zIndex: 10,
          rotation: 0,
          opacity: 1,
          verticalAlign: 'middle',
          locked: false
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

  // Natural Smooth Web-style scrolling (pan) and Ctrl+scroll (zoom)
  const zoomRef = useRef(zoom);
  useEffect(() => { zoomRef.current = zoom; }, [zoom]);

  // Inertial smooth scroll animation state
  const velocityRef = useRef({ x: 0, y: 0 });
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const stopInertia = () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      velocityRef.current = { x: 0, y: 0 };
    };

    const updateInertia = () => {
      const friction = 0.82; // Natural web scrolling deceleration
      velocityRef.current.x *= friction;
      velocityRef.current.y *= friction;

      if (Math.abs(velocityRef.current.x) > 0.2 || Math.abs(velocityRef.current.y) > 0.2) {
        const next = getClampedPan(
          panRef.current.x + velocityRef.current.x,
          panRef.current.y + velocityRef.current.y
        );
        panRef.current = next;
        setPan(next);
        animFrameRef.current = requestAnimationFrame(updateInertia);
      } else {
        stopInertia();
      }
    };

    const handleContainerWheel = (e: WheelEvent) => {
      // If user is scrolling inside an open modal, popup, or overlay (e.g. TableEditorModal, menus), do NOT scroll the background canvas!
      const target = e.target as HTMLElement | null;
      if (target && (target.closest('.fixed') || target.closest('[role="dialog"]') || target.closest('.modal-content') || target.closest('[data-modal]'))) {
        return;
      }

      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        stopInertia();
        // Zoom
        const delta = e.deltaY > 0 ? -0.05 : 0.05;
        const newZoom = Math.min(3, Math.max(0.1, zoomRef.current + delta));
        setZoom(newZoom);
      } else {
        // Natural calibrated scroll speed (like regular web pages)
        const speedScale = 0.45;
        const deltaX = -e.deltaX * speedScale;
        const deltaY = -e.deltaY * speedScale;

        // Add soft momentum
        velocityRef.current.x += deltaX * 0.25;
        velocityRef.current.y += deltaY * 0.25;

        // Apply immediate smooth translation
        const next = getClampedPan(panRef.current.x + deltaX, panRef.current.y + deltaY);
        panRef.current = next;
        setPan(next);

        if (!animFrameRef.current) {
          animFrameRef.current = requestAnimationFrame(updateInertia);
        }
      }
    };

    container.addEventListener('wheel', handleContainerWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleContainerWheel);
      stopInertia();
    };
  }, [setZoom, getClampedPan]);

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
      case 'a':
      case 'A':
        if (isMod && currentPage?.elements) {
          e.preventDefault();
          const allUnlockedIds = currentPage.elements
            .filter(el => !el.locked && el.visible !== false)
            .map(el => el.id);
          setSelectedElementIds(allUnlockedIds);
        }
        break;
      case 'Escape':
        if (contextMenu) setContextMenu(null);
        saveContent(true);
        setSelectedElementIds([]);
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
          let targetPos: { x: number; y: number } | undefined = undefined;
          let targetPageIdx: number = currentPageIndex;

          if (lastMousePosRef.current) {
            const { clientX, clientY } = lastMousePosRef.current;
            const curZoom = zoom || 1;

            // First check if the pointer is directly inside/over any page sheet
            const allPageContainers = Array.from(document.querySelectorAll('[data-page-index]')) as HTMLElement[];
            for (const container of allPageContainers) {
              const pIdxAttr = container.getAttribute('data-page-index');
              const pageIdxNum = pIdxAttr ? parseInt(pIdxAttr, 10) : -1;
              const sheetEl = container.querySelector('.bg-white') as HTMLElement | null;
              if (sheetEl && pageIdxNum >= 0) {
                const rect = sheetEl.getBoundingClientRect();
                if (
                  clientX >= rect.left - 40 &&
                  clientX <= rect.right + 40 &&
                  clientY >= rect.top - 40 &&
                  clientY <= rect.bottom + 40
                ) {
                  targetPageIdx = pageIdxNum;
                  targetPos = {
                    x: Math.max(0, Math.min(PAGE_WIDTH, (clientX - rect.left) / curZoom)),
                    y: Math.max(0, Math.min(PAGE_HEIGHT, (clientY - rect.top) / curZoom))
                  };
                  break;
                }
              }
            }

            // Fallback to active page if not hovering directly over any page
            if (!targetPos) {
              const pageEl = document.querySelector(`[data-page-index="${currentPageIndex}"] .bg-white`) as HTMLElement | null;
              if (pageEl) {
                const rect = pageEl.getBoundingClientRect();
                const pageX = (clientX - rect.left) / curZoom;
                const pageY = (clientY - rect.top) / curZoom;
                if (
                  pageX >= -100 &&
                  pageX <= PAGE_WIDTH + 100 &&
                  pageY >= -100 &&
                  pageY <= PAGE_HEIGHT + 100
                ) {
                  targetPos = {
                    x: Math.max(0, Math.min(PAGE_WIDTH, pageX)),
                    y: Math.max(0, Math.min(PAGE_HEIGHT, pageY))
                  };
                }
              }
            }
          }

          pasteElements(targetPos, targetPageIdx);
        }
        break;
      case ']':
        if (isMod && selectedElementIds.length && currentPage?.elements) {
          e.preventDefault();
          pushHistory();
          const action = e.altKey ? 'bringToFront' : 'bringForward';
          const currentIds = currentPage.elements.map(el => el.id);
          let newOrder = [...currentIds];
          if (action === 'bringToFront') {
            const unselected = currentIds.filter(id => !selectedElementIds.includes(id));
            const selected = currentIds.filter(id => selectedElementIds.includes(id));
            newOrder = [...unselected, ...selected];
          } else {
            for (let i = newOrder.length - 2; i >= 0; i--) {
              if (selectedElementIds.includes(newOrder[i]) && !selectedElementIds.includes(newOrder[i + 1])) {
                const temp = newOrder[i];
                newOrder[i] = newOrder[i + 1];
                newOrder[i + 1] = temp;
              }
            }
          }
          useStore.getState().reorderElements(currentPageIndex, newOrder);
        }
        break;
      case '[':
        if (isMod && selectedElementIds.length && currentPage?.elements) {
          e.preventDefault();
          pushHistory();
          const action = e.altKey ? 'sendToBack' : 'sendBackward';
          const currentIds = currentPage.elements.map(el => el.id);
          let newOrder = [...currentIds];
          if (action === 'sendToBack') {
            const unselected = currentIds.filter(id => !selectedElementIds.includes(id));
            const selected = currentIds.filter(id => selectedElementIds.includes(id));
            newOrder = [...selected, ...unselected];
          } else {
            for (let i = 1; i < newOrder.length; i++) {
              if (selectedElementIds.includes(newOrder[i]) && !selectedElementIds.includes(newOrder[i - 1])) {
                const temp = newOrder[i];
                newOrder[i] = newOrder[i - 1];
                newOrder[i - 1] = temp;
              }
            }
          }
          useStore.getState().reorderElements(currentPageIndex, newOrder);
        }
        break;
    }
  }, [selectedElementIds, currentPageIndex, nudgeElement, removeElement, duplicateElement, undo, redo, zoom, setZoom, setSelectedElementIds, groupSelected, ungroupSelected, toggleLock, currentPage?.elements, updateElement, pushHistory, catalog, removeHeaderElement, removeFooterElement, copySelectedElements, pasteElements, saveContent]);

  useEffect(() => { window.addEventListener('keydown', handleKeyDown); return () => window.removeEventListener('keydown', handleKeyDown); }, [handleKeyDown]);

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
  const getDragCoords = (e: React.DragEvent) => {
    if (!scrollContainerRef.current) return null;
    const rect = scrollContainerRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - panRef.current.x) / zoom,
      y: (e.clientY - rect.top - panRef.current.y) / zoom,
    };
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(true);
    if (!currentPage || currentPage.type !== 'interior') return;
    const coords = getDragCoords(e);
    if (!coords) return;
    const overEl = currentPage.elements.find(el =>
      el.visible !== false && !el.locked && coords.x >= el.x && coords.x <= el.x + el.width && coords.y >= el.y && coords.y <= el.y + el.height
    );
    setDragOverTargetId(overEl?.id || null);
  };
  const handleDragLeave = () => { setIsDragOver(false); setDragOverTargetId(null); };
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(false);
    const targetId = dragOverTargetId; setDragOverTargetId(null);
    const coords = getDragCoords(e);
    if (!coords) return;
    const { x: dropX, y: dropY } = coords;
    const json = e.dataTransfer.getData('application/json');
    if (json) {
      try {
        const data = JSON.parse(json);
        if (data.type === 'image' || data.type === 'product') {
          const effectiveHeaderH = catalog.headerHeight || 113.4;
          const isHeaderDrop = dropY < effectiveHeaderH;
          const isFooterDrop = dropY > (curH - marginBottom - footerHeight);

          if (targetId && currentPage.type === 'interior') {
            const tEl = currentPage.elements.find(el => el.id === targetId);
            updateElement(currentPageIndex, targetId, { type: tEl?.type === 'product-block' ? 'product-block' : 'image', src: normalizeImageUrl(data.url), productId: data.productId, cardTheme: tEl?.cardTheme, opacity: 1 });
          } else if (isHeaderDrop) {
            const headerY = 10;
            useStore.getState().addHeaderElement({ id: `header-el-${Date.now()}-${++idCounterRef.current}`, type: 'image', x: Math.max(marginLeft + 10, dropX - 100), y: headerY, width: 200, height: effectiveHeaderH - 20, rotation: 0, opacity: 1, src: normalizeImageUrl(data.url), productId: data.productId, zIndex: 50 });
          } else if (isFooterDrop) {
            const footerY = curH - marginBottom - footerHeight + 10;
            useStore.getState().addFooterElement({ id: `footer-el-${Date.now()}-${++idCounterRef.current}`, type: 'image', x: Math.max(marginLeft + 10, dropX - 100), y: footerY, width: 200, height: footerHeight - 20, rotation: 0, opacity: 1, src: normalizeImageUrl(data.url), productId: data.productId, zIndex: 50 });
          } else {
            addElement(currentPageIndex, { id: `drop-${Date.now()}-${++idCounterRef.current}`, type: 'image', x: dropX - 150, y: dropY - 150, width: 300, height: 300, rotation: 0, opacity: 1, src: normalizeImageUrl(data.url), productId: data.productId, zIndex: 50 });
          }
          return;
        }
      } catch { }
    }
    if (e.dataTransfer.files?.length) {
      const files = Array.from<File>(e.dataTransfer.files);
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;
        try {
          const { addMedia } = useStore.getState();
          const mediaItem = await addMedia(file);
          if (targetId && i === 0 && currentPage.type === 'interior') {
            updateElement(currentPageIndex, targetId, { type: 'image', src: normalizeImageUrl(mediaItem.url), opacity: 1 });
          } else {
            addElement(currentPageIndex, { id: `drop-file-${Date.now()}-${++idCounterRef.current}`, type: 'image', x: dropX - 100 + i * 20, y: dropY - 100 + i * 20, width: 250, height: 250, rotation: 0, opacity: 1, src: normalizeImageUrl(mediaItem.url), zIndex: 60 });
          }
        } catch (err) {
          console.error("Failed to upload dropped file:", err);
        }
      }
    }
  };



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
        // If the user is actively typing, don't overwrite their text with the stale/in-flight store value
        text: activeEditingTextRef.current !== null ? activeEditingTextRef.current : (el.text || ''),
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

  const isDark = uiTheme === 'dark';

  return (
    <div
      className={`flex-1 flex flex-col overflow-hidden relative transition-colors duration-200 ${isDark ? 'bg-[#0e0e0e]' : 'bg-[#cbd5e1]'}`}
      ref={containerRef}
      onMouseDown={handlePanMouseDown}
      onMouseMove={handlePanMouseMove}
      onMouseUp={handlePanMouseUp}
      onMouseLeave={handlePanMouseUp}
      style={{ cursor: activeTool === 'hand' ? (isPanActive ? 'grabbing' : 'grab') : 'default' }}
    >
      {/* Pannable canvas area with subtle designer dot-grid */}
      <div
        ref={scrollContainerRef}
        className={`flex-1 overflow-hidden transition-colors duration-300 ${
          isDragOver 
            ? (isDark ? 'bg-[#0F3D3E]/10' : 'bg-emerald-500/10') 
            : (isDark ? 'bg-[#121212]' : 'bg-[#e2e8f0]')
        }`}
        style={{
          backgroundImage: isDark 
            ? 'radial-gradient(#252525 1px, transparent 1px)' 
            : 'radial-gradient(#94a3b8 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
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
          className="flex flex-col items-center py-12 pl-12 pr-6 gap-10"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px)`,
            width: 'fit-content',
            minWidth: '100%',
            minHeight: '100%',
          }}
          onClick={(e) => {
            if (contextMenu) setContextMenu(null);
            const clickedPage = (e.target as HTMLElement).closest('[data-page-index]');
            if (!clickedPage && !isPanning.current) {
              setSelectedElementIds([]);
              setEditingId(null);
              setEditConfig(null);
              setSelectedPageIndex(null);
              setSelectedCategoryId(null);
            }
          }}
          onContextMenu={(e) => {
            // Prevent native browser menu on canvas background
            e.preventDefault();
          }}
        >
          {catalog.pages.map((page, pageIdx) => {
            const isActive = pageIdx === currentPageIndex;
            const curW = PAGE_WIDTH;
            const curH = PAGE_HEIGHT;

            return (
              <div
                key={page.id}
                data-page-index={pageIdx}
                className="flex flex-col items-center gap-2 shrink-0"
                onClick={() => {
                  if (contextMenu) setContextMenu(null);
                  if (!isActive) { setCurrentPageIndex(pageIdx); setSelectedElementIds([]); setEditingId(null); setEditConfig(null); }
                }}
                onContextMenu={(e) => {
                  // If right-click was on the canvas, let FabricStage handle element vs page hit testing
                  const targetEl = e.target as HTMLElement;
                  if (targetEl.tagName === 'CANVAS' || targetEl.closest('.canvas-container')) {
                    return;
                  }
                  e.preventDefault();
                  e.stopPropagation();
                  if (!isActive) {
                    setCurrentPageIndex(pageIdx);
                  }
                  setContextMenu({
                    x: e.clientX,
                    y: e.clientY,
                    type: 'page',
                    pageIndex: pageIdx
                  });
                }}
              >
                {/* Canva-style Contextual Top Bar for Page */}
                <div
                  className="relative z-[70] flex items-center justify-between px-1 mb-1.5 transition-all select-none"
                  style={{ width: curW * zoom }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold tracking-tight text-white/80">
                      Page {pageIdx + 1}
                    </span>
                    {page.type && (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#0F3D3E] text-[#E2DCC8] border border-[#E2DCC8]/20">
                        {page.type}
                      </span>
                    )}
                  </div>

                  {/* Contextual Action Pills */}
                  <div className="flex items-center gap-1.5 bg-[#141416]/95 border border-[#E2DCC8]/20 backdrop-blur-md rounded-full px-2.5 py-1 shadow-lg">
                    {/* Page Background Color Swatch Button (Canva-style) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openColorPicker({
                          type: 'background',
                          color: page.backgroundColor || '#ffffff',
                          title: `Page ${pageIdx + 1} Background`
                        });
                      }}
                      className="flex items-center gap-1.5 hover:opacity-85 transition-all group"
                      title="Change page background color"
                    >
                      <div
                        className="w-5 h-5 rounded-full border border-white/40 shadow-sm group-hover:scale-110 transition-transform"
                        style={{ background: page.backgroundColor || '#ffffff' }}
                      />
                      <span className="text-[10px] font-mono font-bold text-[#E2DCC8] uppercase">
                        {page.backgroundColor || '#ffffff'}
                      </span>
                    </button>

                    {/* 3-Product Grid Studio & Reflow Buttons (Interior/Product Pages Only) */}
                    {(page.type === 'interior' || (page.type !== 'cover' && page.type !== 'index' && page.type !== 'closing')) && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentPageIndex(pageIdx);
                            setEditorTab('grid-studio');
                            setSidebarExpanded(true);
                          }}
                          className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-[#0F3D3E] to-[#144f51] hover:from-[#134d4f] hover:to-[#175b5d] text-[#E2DCC8] border border-[#E2DCC8]/30 rounded-[4px] text-[10px] font-bold shadow-md shadow-[#0F3D3E]/20 transition-all hover:scale-105 active:scale-95"
                          title="Design and auto-align 3-Product Grid on this page"
                        >
                          <Sparkles size={11} className="text-[#E2DCC8]" />
                          <span>3-Product Grid</span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            reflowCatalogPages();
                          }}
                          className="flex items-center gap-1.5 px-2.5 py-1 bg-[#1e293b] hover:bg-[#334155] text-sky-300 border border-sky-500/30 rounded-[4px] text-[10px] font-bold shadow-sm transition-all hover:scale-105 active:scale-95"
                          title="Auto-reflow and pack product grids across all pages (underflow/overflow)"
                        >
                          <Zap size={11} className="text-sky-400" />
                          <span>Reflow Pages</span>
                        </button>
                      </>
                    )}

                    <div className="w-px h-3.5 bg-white/15 mx-0.5" />

                    {/* Quick duplicate */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicatePage(pageIdx);
                      }}
                      className="p-1 text-white/70 hover:text-white transition-colors"
                      title="Duplicate Page"
                    >
                      <Copy size={13} />
                    </button>

                    {/* Quick Add page */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addPage('interior');
                      }}
                      className="p-1 text-white/70 hover:text-white transition-colors"
                      title="Add Page"
                    >
                      <Plus size={13} />
                    </button>

                    {/* Quick delete page if > 1 page */}
                    {catalog.pages.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removePage(pageIdx);
                        }}
                        className="p-1 text-white/70 hover:text-red-400 transition-colors"
                        title="Delete Page"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Page wrapper - White catalog sheet stands out prominently like Figma/Canva */}
                <div
                  className={`bg-white shrink-0 relative transition-all rounded-[2px] ${
                    isActive
                      ? (isDragOver ? 'ring-4 ring-[#0F3D3E] shadow-[0_25px_70px_rgba(0,0,0,0.6)]' : 'ring-2 ring-[#0F3D3E] shadow-[0_25px_60px_rgba(0,0,0,0.55)]')
                      : 'opacity-90 hover:opacity-100 cursor-pointer shadow-[0_15px_40px_rgba(0,0,0,0.4)] border border-[#2a2a2a]'
                  }`}
                  style={{ width: curW * zoom, height: curH * zoom, backgroundColor: page.backgroundColor || '#ffffff', zIndex: isActive ? 20 : 1 }}
                >
                  {/* Floating Labels and Boundaries */}
                  {(() => {
                    const pageHasHeader = page.hasHeader !== undefined ? page.hasHeader : (catalog.hasHeader && page.type !== 'cover');
                    const pageHasFooter = page.hasFooter !== undefined ? page.hasFooter : (catalog.hasFooter && page.type !== 'cover');

                    return (
                      <>
                        {(pageHasHeader || pageHasFooter) && (
                          <div className="absolute inset-0 pointer-events-none z-[50]">
                            {pageHasHeader && (
                              <>
                                <div
                                  className="absolute bg-[#1e1e1e] text-[#aaa] border border-[#333] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-l-md shadow-sm transition-all"
                                  style={{
                                    left: 0,
                                    top: ((catalog.headerHeight || 113.4) * zoom) / 2,
                                    transform: 'translate(-100%, -50%)',
                                    opacity: isActive ? 1 : 0.4
                                  }}
                                >
                                  Header
                                </div>
                                {isActive && (
                                  <div
                                    className="absolute left-0 right-0 border-b border-dashed border-[#0F3D3E]/40 pointer-events-none"
                                    style={{ top: (catalog.headerHeight || 113.4) * zoom }}
                                  />
                                )}
                              </>
                            )}
                            {pageHasFooter && (
                              <>
                                <div
                                  className="absolute bg-[#1e1e1e] text-[#aaa] border border-[#333] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-l-md shadow-sm transition-all"
                                  style={{
                                    left: 0,
                                    top: (curH - (catalog.footerHeight || 75.6) / 2) * zoom,
                                    transform: 'translate(-100%, -50%)',
                                    opacity: isActive ? 1 : 0.4
                                  }}
                                >
                                  Footer
                                </div>
                                {isActive && (
                                  <div
                                    className="absolute left-0 right-0 border-t border-dashed border-[#0F3D3E]/40 pointer-events-none"
                                    style={{ top: (curH - (catalog.footerHeight || 75.6)) * zoom }}
                                  />
                                )}
                              </>
                            )}
                          </div>
                        )}

                        {/* Canva-style Visual Dotted / Dashed Page Margin Safety Box */}
                        {isActive && catalog.showMargins !== false && (
                          <div
                            className="absolute pointer-events-none z-[45] border border-dashed transition-all duration-150"
                            style={{
                              left: `${(catalog.marginLeft || 0) * zoom}px`,
                              top: `${(catalog.marginTop || 0) * zoom}px`,
                              width: `${Math.max(0, curW - (catalog.marginLeft || 0) - (catalog.marginRight || 0)) * zoom}px`,
                              height: `${Math.max(0, curH - (catalog.marginTop || 0) - (catalog.marginBottom || 0)) * zoom}px`,
                              borderColor: 'rgba(15, 61, 62, 0.45)', // Elegant Canva teal/cyan dashed guide
                              borderWidth: '1px',
                            }}
                          >
                            {/* Subtle safety margin badge in top-left corner */}
                            <span
                              className="absolute left-1 top-1 text-[8px] font-mono font-bold uppercase tracking-wider text-[#0F3D3E]/50 select-none"
                            >
                              Safety Margin
                            </span>
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
                          editingId={isActive ? editingId : null}
                          canvasBg={page.backgroundColor || catalog.backgroundColor || theme?.backgroundColor || '#ffffff'}
                          headerElements={pageHasHeader ? catalog.headerElements : []}
                          footerElements={pageHasFooter ? (catalog.footerElements || []) : []}
                          footerHeight={catalog.footerHeight || 38}
                        />
                      </>
                    );
                  })()}

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
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      onPointerDown={(e) => e.stopPropagation()}
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
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') {
                            e.preventDefault();
                            saveContent(true);
                          }
                        }}
                        onBlur={(e) => {
                          // Only save if focus left the editing container completely (e.g. not clicking the toolbar or inside the element)
                          const related = e.relatedTarget as HTMLElement | null;
                          if (related && (e.currentTarget.contains(related) || related.closest('.text-toolbar') || related.closest('[data-text-toolbar]'))) {
                            return;
                          }
                          saveContent(true);
                        }}
                        onInput={(e) => {
                          const target = e.currentTarget as HTMLElement;
                          let content = target.innerText || target.textContent || '';
                          content = content.replace(/<[^>]*>/g, '');

                          const cur = editConfigRef.current;
                          if (cur?.id) {
                            activeEditingTextRef.current = content;
                            const isHeader = catalog.headerElements?.some(el => el.id === cur.id);
                            const isFooter = catalog.footerElements?.some(el => el.id === cur.id);
                            const updates: any = { text: content };

                            // Auto-resize height for standard page elements
                            if (!isHeader && !isFooter) {
                              const newHeight = Math.max(20, target.scrollHeight / zoom);
                              if (Math.abs(newHeight - cur.height) > 1) {
                                updates.height = newHeight;
                              }
                            }

                            // Keep local edit config in sync immediately without touching canvas
                            editConfigRef.current = { ...cur, ...updates };
                            setEditConfig(prev => prev ? ({ ...prev, ...updates }) : null);

                            // Debounce the background store update so typing stays 100% smooth without canvas flicker
                            if (textDebounceTimerRef.current) clearTimeout(textDebounceTimerRef.current);
                            textDebounceTimerRef.current = window.setTimeout(() => {
                              if (isHeader) {
                                updateHeaderElement(cur.id, updates);
                              } else if (isFooter) {
                                updateFooterElement(cur.id, updates);
                              } else {
                                const targetPageIndex = cur.pageIndex !== undefined ? cur.pageIndex : currentPageIndex;
                                updateElement(targetPageIndex, cur.id, updates);
                              }
                            }, 300);
                          }
                        }}
                        ref={(el) => {
                          textInputRef.current = el;
                          if (el && editConfig && (el as any)._initializedForId !== editConfig.id) {
                            (el as any)._initializedForId = editConfig.id;
                            el.innerText = (editConfig.text || '').replace(/<[^>]*>/g, '');
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
                          if (updates.text !== undefined) activeEditingTextRef.current = updates.text;
                          
                          if (editConfigRef.current) {
                            editConfigRef.current = { ...editConfigRef.current, ...mappedForEdit };
                          }
                          setEditConfig(prev => prev ? { ...prev, ...mappedForEdit } : null);

                          if (updates.text !== undefined && textInputRef.current) {
                            textInputRef.current.innerText = (updates.text || '').replace(/<[^>]*>/g, '');
                          }

                          // 2. Update store
                          if (catalog.headerElements?.some(el => el.id === editingId)) {
                            updateHeaderElement(editingId, updates);
                          } else if (catalog.footerElements?.some(el => el.id === editingId)) {
                            updateFooterElement(editingId, updates);
                          } else {
                            const targetPageIndex = editConfigRef.current?.pageIndex !== undefined ? editConfigRef.current.pageIndex : currentPageIndex;
                            updateElement(targetPageIndex, editingId, updates);
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

                  {/* Right-Side Floating Section Quick-Action Docks (for interior/product pages) */}
                  {isActive && (page.type === 'interior' || (page.type !== 'cover' && page.type !== 'index' && page.type !== 'closing')) && (() => {
                    const sectionsSummary = getPageSectionsSummary(page);
                    if (sectionsSummary.length < 1) return null;

                    return sectionsSummary.map((secSummary, sIdx) => {
                      const isFirst = sIdx === 0;
                      const isLast = sIdx === sectionsSummary.length - 1;
                      const centerY = (secSummary.y + (secSummary.height / 2)) * zoom;

                      return (
                        <div
                          key={`sec-dock-${sIdx}`}
                          className="absolute z-[60] flex flex-col items-center bg-[#141416]/95 border border-[#E2DCC8]/30 backdrop-blur-md rounded-full py-1.5 px-1 shadow-2xl transition-all hover:scale-105 hover:border-[#0F3D3E]"
                          style={{
                            left: (curW * zoom) + 12,
                            top: Math.max(10, centerY - 55),
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Section number indicator badge */}
                          <span className="w-5 h-5 rounded-full bg-[#0F3D3E] text-[#E2DCC8] flex items-center justify-center text-[9px] font-black mb-1 shadow-sm">
                            #{sIdx + 1}
                          </span>

                          {/* ↑ Move Up */}
                          <button
                            type="button"
                            disabled={isFirst}
                            onClick={(e) => {
                              e.stopPropagation();
                              swapPageSections(pageIdx, sIdx, sIdx - 1);
                            }}
                            className="p-1 rounded-full text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-transparent transition-all"
                            title={`Move Section #${sIdx + 1} Up`}
                          >
                            <ChevronUp size={14} />
                          </button>

                          {/* ↓ Move Down */}
                          <button
                            type="button"
                            disabled={isLast}
                            onClick={(e) => {
                              e.stopPropagation();
                              swapPageSections(pageIdx, sIdx, sIdx + 1);
                            }}
                            className="p-1 rounded-full text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-transparent transition-all"
                            title={`Move Section #${sIdx + 1} Down`}
                          >
                            <ChevronDown size={14} />
                          </button>

                          {/* ⚙️ Open in Left Sidebar Studio */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentPageIndex(pageIdx);
                              setEditorTab('grid-studio');
                              setSidebarExpanded(true);
                            }}
                            className="p-1 rounded-full text-[#E2DCC8] hover:text-white hover:bg-[#0F3D3E] transition-all my-0.5"
                            title={`Configure Section #${sIdx + 1} in Left Sidebar Studio`}
                          >
                            <Settings size={13} />
                          </button>

                          {/* 🗑️ Delete Section */}
                          {sectionsSummary.length > 1 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                deletePageSection(pageIdx, sIdx);
                              }}
                              className="p-1 rounded-full text-slate-400 hover:text-red-400 hover:bg-red-500/20 transition-all"
                              title={`Delete Section #${sIdx + 1}`}
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            );
          })}

          {/* Add New Page */}
          <div className="relative z-[70] shrink-0 flex flex-col items-center mb-10" ref={addPageMenuRef}>
            <div className="relative" style={{ width: (catalog.pages[catalog.pages.length - 1]?.orientation === 'landscape' ? PAGE_HEIGHT : PAGE_WIDTH) * zoom }}>
              <button
                onClick={() => setShowAddPageMenu(prev => !prev)}
                className={`w-full border-2 border-dashed rounded-[4px] flex items-center justify-center gap-3 py-4 transition-all ${uiTheme === 'dark'
                  ? 'border-slate-700 hover:border-indigo-500 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10'
                  : 'border-slate-300 hover:border-indigo-400 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50/50'
                  }`}
              >
                <Plus size={16} />
                <span className="text-[12px] font-bold uppercase tracking-widest">Add a New Page</span>
              </button>

              {/* Page type popover */}
              {showAddPageMenu && (
                <div className={`absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-64 border shadow-2xl rounded-[4px] overflow-hidden z-50 py-1 ${uiTheme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
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
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[4px] text-left transition-colors ${uiTheme === 'dark' ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-indigo-50 text-slate-700'
                          }`}
                      >
                        <div className={`w-8 h-8 rounded-[4px] flex items-center justify-center shrink-0 ${uiTheme === 'dark' ? 'bg-slate-700' : 'bg-slate-100'
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
                      onClick={() => { addInteriorPageWithInheritedLayout(); setShowAddPageMenu(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[4px] text-left transition-colors ${uiTheme === 'dark' ? 'hover:bg-indigo-600/20 text-slate-300' : 'hover:bg-indigo-50 text-slate-700'
                        }`}
                    >
                      <div className="w-8 h-8 rounded-[4px] bg-indigo-600 flex items-center justify-center shrink-0">
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
      <div className="h-11 border-t flex items-center justify-between px-5 shrink-0 z-40 bg-[#141414] border-[#262626]">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setIsProjectSettingsOpen(!isProjectSettingsOpen)}
            className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${isProjectSettingsOpen ? 'text-[#E2DCC8]' : 'text-[#888888] hover:text-white'}`}
          >
            <div className={`w-5 h-5 rounded-[4px] flex items-center justify-center ${isProjectSettingsOpen ? 'bg-[#0F3D3E] text-white' : 'bg-[#222] text-[#888]'}`}>
              <Settings size={12} />
            </div>
            Page Settings
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-[#1a1a1a] border border-[#2a2a2a] rounded-[4px] px-2 py-0.5 gap-2.5">
            <button onClick={() => setZoom(Math.max(0.1, zoom - 0.1))} className="text-[#888] hover:text-white transition-colors" title="Zoom Out"><Plus size={13} className="rotate-45" /></button>
            <span className="text-[10px] font-bold text-white w-9 text-center select-none">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(Math.min(3, zoom + 0.1))} className="text-[#888] hover:text-white transition-colors" title="Zoom In"><Plus size={13} /></button>
          </div>
        </div>
      </div>



      {/* 3-Product Grid Studio Modal */}
      {isGridStudioOpen && (
        <ProductGridStudioModal
          pageIndex={gridStudioPageIndex}
          onClose={() => setIsGridStudioOpen(false, null)}
        />
      )}

      {/* Canva-Style Right-Click Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          type={contextMenu.type}
          pageIndex={contextMenu.pageIndex}
          targetId={contextMenu.targetId}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
};

export default EditorCanvas;
