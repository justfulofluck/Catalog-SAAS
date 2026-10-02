import React, { useEffect, useCallback, useState, useRef, useMemo } from 'react';
import { X } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { PAGE_WIDTH, PAGE_HEIGHT, THEMES } from '../../constants';
import FabricStage from './FabricStage';
import ImageCropOverlay from './ImageCropOverlay';
import ContextMenu from './ContextMenu';
import { FloatingTextToolbar } from '../Toolbar/FloatingTextToolbar';
import FloatingToolbar from '../Toolbar/FloatingToolbar';
import ProductGridStudioModal from './ProductGridStudioModal';
import { TableOverlay } from './TableOverlay';
import { normalizeImageUrl } from '../../utils/imageUtils';
import { parseVideoUrl } from '../../utils/videoUtils';

// Extracted Subcomponents
import { PageHeaderBar } from './Canvas/PageHeaderBar';
import { CanvasHeaderFooterGuides } from './Canvas/CanvasHeaderFooterGuides';
import { CanvasPageDropOverlay } from './Canvas/CanvasPageDropOverlay';
import { InlineTextEditorOverlay } from './Canvas/InlineTextEditorOverlay';
import { SectionQuickActionsDock } from './Canvas/SectionQuickActionsDock';
import { AddNewPageFooter } from './Canvas/AddNewPageFooter';

// Extracted Custom Hooks
import { useAutoSaver } from './hooks/useAutoSaver';
import { useCanvasPanZoom } from './hooks/useCanvasPanZoom';
import { useCanvasShortcuts } from './hooks/useCanvasShortcuts';

const EMPTY_ARRAY: any[] = [];

const EditorCanvas: React.FC = () => {
  const {
    catalog,
    activeThemeId,
    currentPageIndex,
    zoom,
    setZoom,
    selectedElementIds,
    setSelectedElementIds,
    setSelectedElements,
    updateElement,
    removeElement,
    addElement,
    uiTheme,
    activeTool,
    isGridStudioOpen,
    gridStudioPageIndex,
    setIsGridStudioOpen,
    swapPageSections,
    deletePageSection,
    editorTab,
    setEditorTab,
    setSidebarExpanded,
    addPage,
    setCurrentPageIndex,
    updateProjectSettings,
    setSelectedPageIndex,
    setSelectedCategoryId,
    addHeaderElement,
    addFooterElement,
    updateHeaderElement,
    updateFooterElement,
    addInteriorPageWithInheritedLayout,
    duplicatePage,
    removePage,
    activeCropElementId,
    editingSystemTemplate,
    movePage,
  } = useStore();

  const currentPage = catalog.pages[currentPageIndex];
  const curW = PAGE_WIDTH;
  const curH = PAGE_HEIGHT;
  const theme = THEMES.find((t) => t.id === activeThemeId) || THEMES[0];

  // Drag & drop state
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragOverPageIndex, setDragOverPageIndex] = useState<number | null>(null);
  const [dragOverTargetId, setDragOverTargetId] = useState<string | null>(null);

  // Inline text editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editConfig, setEditConfig] = useState<any | null>(null);
  const textInputRef = useRef<HTMLDivElement | null>(null);
  const activeEditingTextRef = useRef<string | null>(null);
  const textDebounceTimerRef = useRef<number | null>(null);
  const editConfigRef = useRef<any | null>(null);

  // Interactive overlays
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [editingTableId, setEditingTableId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    type: 'page' | 'element';
    pageIndex: number;
    targetId?: string;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const panContentRef = useRef<HTMLDivElement>(null);
  const lastMousePosRef = useRef<{ clientX: number; clientY: number } | null>(null);
  const idCounterRef = useRef(0);

  // Track pointer location globally to paste at mouse position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      lastMousePosRef.current = { clientX: e.clientX, clientY: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // 1. Debounced real-time auto-saver
  useAutoSaver(catalog);

  // 2. Natural smooth canvas pan & zoom hook
  const {
    pan,
    isPanActive,
    isPanning,
    scrollToPageIndex,
    handlePanMouseDown,
    handlePanMouseMove,
    handlePanMouseUp,
  } = useCanvasPanZoom({
    containerRef,
    panContentRef,
    zoom,
    setZoom,
    activeTool,
  });

  // Save inline text editing content
  const saveContent = useCallback(
    (shouldClose = false) => {
      if (textDebounceTimerRef.current) {
        clearTimeout(textDebounceTimerRef.current);
        textDebounceTimerRef.current = null;
      }

      const currentConfig = editConfigRef.current;
      if (currentConfig?.id) {
        let content = activeEditingTextRef.current;
        if (textInputRef.current) {
          const domText = (
            textInputRef.current.innerText ||
            textInputRef.current.textContent ||
            ''
          ).replace(/<[^>]*>/g, '');
          if (domText.trim().length > 0 || !content) {
            content = domText;
          }
        }

        if (!content || !content.trim()) {
          content = currentConfig.text || activeEditingTextRef.current || '';
        }

        const isHeader = catalog.headerElements?.some((el) => el.id === currentConfig.id);
        const isFooter = catalog.footerElements?.some((el) => el.id === currentConfig.id);

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
          const targetPageIndex =
            currentConfig.pageIndex !== undefined ? currentConfig.pageIndex : currentPageIndex;
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
    },
    [
      currentPageIndex,
      zoom,
      catalog.headerElements,
      catalog.footerElements,
      updateElement,
      updateHeaderElement,
      updateFooterElement,
      updateProjectSettings,
    ]
  );

  // Listen for context menu requests from FabricStage or Page wrappers
  useEffect(() => {
    const handleOpenContextMenu = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setContextMenu(detail);
    };
    window.addEventListener('catalog:openContextMenu', handleOpenContextMenu);
    return () => window.removeEventListener('catalog:openContextMenu', handleOpenContextMenu);
  }, []);

  // Listen for live video playback trigger
  useEffect(() => {
    const handlePlayVideo = (e: any) => {
      if (e.detail?.id) {
        setPlayingVideoId(e.detail.id);
      }
    };
    window.addEventListener('catalog:playVideo', handlePlayVideo);
    return () => window.removeEventListener('catalog:playVideo', handlePlayVideo);
  }, []);

  // Listen for interactive table edit trigger
  useEffect(() => {
    const handleEditTable = (e: any) => {
      if (e.detail?.id) {
        setEditingTableId(e.detail.id);
      }
    };
    window.addEventListener('catalog:editTable', handleEditTable);
    return () => window.removeEventListener('catalog:editTable', handleEditTable);
  }, []);

  // Listen for catalog:editText trigger
  useEffect(() => {
    const handler = (e: Event) => {
      const { id, pageIndex } = (e as CustomEvent).detail;
      if (catalog.headerElements?.some((item) => item.id === id)) {
        return;
      }

      if (editConfigRef.current && editConfigRef.current.id !== id) {
        saveContent(true);
      }

      if (pageIndex !== undefined) setCurrentPageIndex(pageIndex);
      const page = catalog.pages[pageIndex ?? currentPageIndex];
      const el =
        page?.elements.find((item) => item.id === id) ||
        catalog.footerElements?.find((item) => item.id === id);

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
          effectRoundness: el.effectRoundness,
        };
        editConfigRef.current = newConfig;
        setEditingId(id);
        setEditConfig(newConfig);
      }
    };
    window.addEventListener('catalog:editText', handler);
    return () => window.removeEventListener('catalog:editText', handler);
  }, [
    catalog.pages,
    catalog.headerElements,
    catalog.footerElements,
    currentPageIndex,
    setCurrentPageIndex,
    saveContent,
  ]);

  // Listen for table edit in sidebar
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

  // Auto-migrate legacy header/footer text
  useEffect(() => {
    const { editingSystemTemplate } = useStore.getState();
    if (editingSystemTemplate) return;

    const headerElements = catalog.headerElements || [];
    const footerElements = catalog.footerElements || [];
    const headerNeeded =
      catalog.hasHeader &&
      catalog.headerText &&
      headerElements.length === 0 &&
      !catalog.headerMigrated;
    const footerNeeded =
      catalog.hasFooter &&
      catalog.footerText &&
      footerElements.length === 0 &&
      !catalog.footerMigrated;

    if (headerNeeded || footerNeeded) {
      if (headerNeeded) {
        addHeaderElement({
          id: `header-txt-migrated-${Date.now()}`,
          type: 'text',
          text: catalog.headerText || 'Company Catalog 2026',
          x: (catalog.marginLeft || 0) + 10,
          y: catalog.marginTop || 0,
          width: PAGE_WIDTH - (catalog.marginLeft || 0) - (catalog.marginRight || 0) - 20,
          height: catalog.headerHeight || 0,
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
          locked: false,
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
          height: catalog.footerHeight || 0,
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
          locked: false,
        });
        updateProjectSettings({ footerMigrated: true });
      }
    }

    if (!catalog.legacyCleanedUp) {
      const stripHtml = (html: string) =>
        html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
      const hText = stripHtml(catalog.headerText || '');
      const fText = stripHtml((catalog.footerText || '').replace(/\{\{page\}\}/gi, ''));

      if (hText || fText) {
        catalog.pages.forEach((page, pageIdx) => {
          const redundantIds = page.elements
            .filter((el) => el.type === 'text')
            .filter((el) => {
              const elTextStripped = stripHtml(el.text || '').replace(/\{\{page\}\}/gi, '');
              const matchesHeader = hText && elTextStripped === hText;
              const matchesFooter = fText && elTextStripped === fText;
              return matchesHeader || matchesFooter;
            })
            .map((el) => el.id);

          redundantIds.forEach((id) => removeElement(pageIdx, id));
        });
      }

      updateProjectSettings({ legacyCleanedUp: true });
    }
  }, []);

  // 3. Global Canvas Shortcuts Hook
  useCanvasShortcuts({
    selectedElementIds,
    currentPageIndex,
    zoom,
    setZoom,
    setSelectedElementIds,
    setEditingId,
    setEditConfig,
    contextMenu,
    setContextMenu,
    saveContent,
    lastMousePosRef,
  });

  // Drag & drop multi-page detection and accurate coordinates
  const getDropTargetPageAndCoords = (clientX: number, clientY: number) => {
    const curZoom = zoom || 1;
    const allPageWrappers = Array.from(
      document.querySelectorAll('[data-page-index]')
    ) as HTMLElement[];

    for (const wrapper of allPageWrappers) {
      const pIdxAttr = wrapper.getAttribute('data-page-index');
      const pageIdxNum = pIdxAttr !== null ? parseInt(pIdxAttr, 10) : -1;
      if (pageIdxNum < 0 || pageIdxNum >= catalog.pages.length) continue;

      const sheetEl = (wrapper.querySelector('.bg-white') as HTMLElement | null) || wrapper;
      const rect = sheetEl.getBoundingClientRect();

      if (
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom
      ) {
        const dropX = (clientX - rect.left) / curZoom;
        const dropY = (clientY - rect.top) / curZoom;
        return {
          targetPageIndex: pageIdxNum,
          dropX: Math.max(0, Math.min(PAGE_WIDTH, dropX)),
          dropY: Math.max(0, Math.min(PAGE_HEIGHT, dropY)),
        };
      }
    }

    for (const wrapper of allPageWrappers) {
      const pIdxAttr = wrapper.getAttribute('data-page-index');
      const pageIdxNum = pIdxAttr !== null ? parseInt(pIdxAttr, 10) : -1;
      if (pageIdxNum < 0 || pageIdxNum >= catalog.pages.length) continue;

      const sheetEl = (wrapper.querySelector('.bg-white') as HTMLElement | null) || wrapper;
      const rect = sheetEl.getBoundingClientRect();

      if (
        clientX >= rect.left - 40 &&
        clientX <= rect.right + 40 &&
        clientY >= rect.top - 40 &&
        clientY <= rect.bottom + 40
      ) {
        const dropX = (clientX - rect.left) / curZoom;
        const dropY = (clientY - rect.top) / curZoom;
        return {
          targetPageIndex: pageIdxNum,
          dropX: Math.max(0, Math.min(PAGE_WIDTH, dropX)),
          dropY: Math.max(0, Math.min(PAGE_HEIGHT, dropY)),
        };
      }
    }

    const activeIdx = Math.max(0, Math.min(catalog.pages.length - 1, currentPageIndex));
    const activeWrapper = document.querySelector(
      `[data-page-index="${activeIdx}"]`
    ) as HTMLElement | null;
    if (activeWrapper) {
      const sheetEl = (activeWrapper.querySelector('.bg-white') as HTMLElement | null) || activeWrapper;
      const rect = sheetEl.getBoundingClientRect();
      const dropX = (clientX - rect.left) / curZoom;
      const dropY = (clientY - rect.top) / curZoom;
      return {
        targetPageIndex: activeIdx,
        dropX: Math.max(0, Math.min(PAGE_WIDTH, dropX)),
        dropY: Math.max(0, Math.min(PAGE_HEIGHT, dropY)),
      };
    }

    return {
      targetPageIndex: activeIdx,
      dropX: PAGE_WIDTH / 2,
      dropY: PAGE_HEIGHT / 2,
    };
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
    const dropTarget = getDropTargetPageAndCoords(e.clientX, e.clientY);
    if (!dropTarget) return;

    const { targetPageIndex, dropX, dropY } = dropTarget;
    setDragOverPageIndex(targetPageIndex);

    const targetPage = catalog.pages[targetPageIndex];
    if (!targetPage) return;

    const overEl = targetPage.elements?.find(
      (el) =>
        el.visible !== false &&
        !el.locked &&
        dropX >= el.x &&
        dropX <= el.x + el.width &&
        dropY >= el.y &&
        dropY <= el.y + el.height
    );
    setDragOverTargetId(overEl?.id || null);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
    setDragOverPageIndex(null);
    setDragOverTargetId(null);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    setDragOverPageIndex(null);
    const targetId = dragOverTargetId;
    setDragOverTargetId(null);

    const dropTarget = getDropTargetPageAndCoords(e.clientX, e.clientY);
    if (!dropTarget) return;

    const { targetPageIndex, dropX, dropY } = dropTarget;
    const targetPage = catalog.pages[targetPageIndex];
    if (!targetPage) return;

    if (currentPageIndex !== targetPageIndex) {
      setCurrentPageIndex(targetPageIndex);
    }

    const curW = targetPage.width || PAGE_WIDTH;
    const curH = targetPage.height || PAGE_HEIGHT;
    const marginLeft = targetPage.margins?.left ?? 0;
    const marginBottom = targetPage.margins?.bottom ?? 0;
    const footerHeight = catalog.footerHeight || 38;

    const json = e.dataTransfer.getData('application/json');
    if (json) {
      try {
        const data = JSON.parse(json);
        if (data.type === 'product') {
          const productObj =
            data.product ||
            catalog.products?.find((p) => p.id === data.productId) ||
            (useStore.getState() as any).products?.find((p: any) => p.id === data.productId);

          if (targetId) {
            const tEl = targetPage.elements?.find((el) => el.id === targetId);
            if (tEl) {
              updateElement(targetPageIndex, targetId, {
                type: tEl.type === 'product-block' ? 'product-block' : 'image',
                src: normalizeImageUrl(data.url || productObj?.image),
                productId: data.productId,
                productData: productObj || tEl.productData,
                cardTheme: tEl.cardTheme,
                opacity: 1,
              });
              return;
            }
          }

          const cardW = 260;
          const cardH = 320;
          addElement(targetPageIndex, {
            id: `product-block-${data.productId || Date.now()}-${++idCounterRef.current}`,
            type: 'product-block',
            x: Math.max(0, Math.min(curW - cardW, dropX - cardW / 2)),
            y: Math.max(0, Math.min(curH - cardH, dropY - cardH / 2)),
            width: cardW,
            height: cardH,
            rotation: 0,
            opacity: 1,
            productId: data.productId,
            src: normalizeImageUrl(data.url || productObj?.image || (productObj as any)?.src),
            productData: productObj || {
              id: data.productId,
              name: data.name || 'Product',
              price: data.price || 0,
              image: data.url,
            },
            showPrice: true,
            showSku: true,
            showName: true,
            zIndex: 25,
          });
          return;
        } else if (data.type === 'image') {
          const effectiveHeaderH = catalog.headerHeight || 113.4;
          const isHeaderDrop = dropY < effectiveHeaderH;
          const isFooterDrop = dropY > curH - marginBottom - footerHeight;

          if (targetId) {
            const tEl = targetPage.elements?.find((el) => el.id === targetId);
            updateElement(targetPageIndex, targetId, {
              type: tEl?.type === 'product-block' ? 'product-block' : 'image',
              src: normalizeImageUrl(data.url),
              productId: data.productId,
              cardTheme: tEl?.cardTheme,
              opacity: 1,
            });
          } else if (isHeaderDrop && targetPage.type !== 'cover') {
            const headerY = 10;
            useStore.getState().addHeaderElement({
              id: `header-el-${Date.now()}-${++idCounterRef.current}`,
              type: 'image',
              x: Math.max(marginLeft + 10, dropX - 100),
              y: headerY,
              width: 200,
              height: effectiveHeaderH - 20,
              rotation: 0,
              opacity: 1,
              src: normalizeImageUrl(data.url),
              productId: data.productId,
              zIndex: 50,
            });
          } else if (isFooterDrop && targetPage.type !== 'cover') {
            const footerY = curH - marginBottom - footerHeight + 10;
            useStore.getState().addFooterElement({
              id: `footer-el-${Date.now()}-${++idCounterRef.current}`,
              type: 'image',
              x: Math.max(marginLeft + 10, dropX - 100),
              y: footerY,
              width: 200,
              height: footerHeight - 20,
              rotation: 0,
              opacity: 1,
              src: normalizeImageUrl(data.url),
              productId: data.productId,
              zIndex: 50,
            });
          } else {
            const imgW = data.width || 300;
            const imgH = data.height || 300;
            addElement(targetPageIndex, {
              id: `drop-${Date.now()}-${++idCounterRef.current}`,
              type: 'image',
              x: Math.max(0, Math.min(curW - imgW, dropX - imgW / 2)),
              y: Math.max(0, Math.min(curH - imgH, dropY - imgH / 2)),
              width: imgW,
              height: imgH,
              rotation: 0,
              opacity: 1,
              src: normalizeImageUrl(data.url),
              productId: data.productId,
              zIndex: 50,
            });
          }
          return;
        } else if (data.type === 'text') {
          const w = data.width || 320;
          const h = data.height || 45;
          addElement(targetPageIndex, {
            id: `text-drop-${Date.now()}-${++idCounterRef.current}`,
            type: 'text',
            x: Math.max(0, Math.min(curW - w, dropX - w / 2)),
            y: Math.max(0, Math.min(curH - h, dropY - h / 2)),
            width: w,
            height: h,
            rotation: data.rotation || 0,
            opacity: data.opacity ?? 1,
            text: data.text || 'Add text',
            fontSize: data.fontSize || 24,
            fontFamily: data.fontFamily || catalog.fontFamily || 'Inter',
            fontWeight: data.fontWeight || '700',
            fontStyle: data.fontStyle || 'normal',
            fill: data.fill || '#1e293b',
            textAlign: data.textAlign || 'left',
            lineHeight: data.lineHeight || 1.2,
            letterSpacing: data.letterSpacing || 0,
            effectStyle: data.effectStyle,
            effectColor: data.effectColor,
            effectColor2: data.effectColor2,
            shadowOffsetX: data.shadowOffsetX,
            shadowOffsetY: data.shadowOffsetY,
            shadowBlur: data.shadowBlur,
            textStrokeWidth: data.textStrokeWidth,
            zIndex: 60,
          });
          return;
        } else if (data.type === 'interactive-button' || data.type === 'button') {
          const w = data.width || 180;
          const h = data.height || 40;
          addElement(targetPageIndex, {
            id: `btn-drop-${Date.now()}-${++idCounterRef.current}`,
            type: 'interactive-button',
            x: Math.max(0, Math.min(curW - w, dropX - w / 2)),
            y: Math.max(0, Math.min(curH - h, dropY - h / 2)),
            width: w,
            height: h,
            rotation: 0,
            opacity: 1,
            fill: data.fill || '#0F3D3E',
            stroke: data.stroke,
            strokeWidth: data.strokeWidth || 0,
            buttonShape: data.buttonShape || 'pill',
            buttonLabel: data.buttonLabel || data.text || 'Contact Us',
            buttonIconUnicode: data.buttonIconUnicode || '\uf095',
            buttonIconLibrary: data.buttonIconLibrary || 'solid',
            buttonIconPlacement: data.buttonIconPlacement || 'left',
            buttonFontFamily: data.buttonFontFamily || 'Inter',
            buttonFontSize: data.buttonFontSize || 14,
            buttonTextColor: data.buttonTextColor || '#ffffff',
            buttonIconColor: data.buttonIconColor || '#ffffff',
            buttonLink: data.buttonLink || '',
            buttonLinkType: data.buttonLinkType || 'url',
            zIndex: 60,
          });
          return;
        } else if (data.type === 'shape') {
          const w = data.width || 100;
          const h = data.height || 100;
          addElement(targetPageIndex, {
            id: `shape-drop-${Date.now()}-${++idCounterRef.current}`,
            type: 'shape',
            shapeType: data.shapeType || 'rect',
            x: Math.max(0, Math.min(curW - w, dropX - w / 2)),
            y: Math.max(0, Math.min(curH - h, dropY - h / 2)),
            width: w,
            height: h,
            rotation: 0,
            opacity: data.opacity ?? 1,
            fill: data.fill || '#cbd5e1',
            stroke: data.stroke,
            strokeWidth: data.strokeWidth || 0,
            linkUrl: data.linkUrl,
            linkType: data.linkType,
            iconConfig: data.iconConfig,
            zIndex: 60,
          });
          return;
        }
      } catch (err) {
        console.error('Drop json parse error:', err);
      }
    }

    if (e.dataTransfer.files?.length) {
      const files = Array.from<File>(e.dataTransfer.files);
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;
        try {
          const { addMedia } = useStore.getState();
          const mediaItem = await addMedia(file);
          if (targetId && i === 0) {
            updateElement(targetPageIndex, targetId, {
              type: 'image',
              src: normalizeImageUrl(mediaItem.url),
              opacity: 1,
            });
          } else {
            addElement(targetPageIndex, {
              id: `drop-file-${Date.now()}-${++idCounterRef.current}`,
              type: 'image',
              x: Math.max(0, Math.min(curW - 250, dropX - 125 + i * 20)),
              y: Math.max(0, Math.min(curH - 250, dropY - 125 + i * 20)),
              width: 250,
              height: 250,
              rotation: 0,
              opacity: 1,
              src: normalizeImageUrl(mediaItem.url),
              zIndex: 60,
            });
          }
        } catch (err) {
          console.error('Failed to upload dropped file:', err);
        }
      }
    }
  };

  // Sync editConfig with element changes in store
  useEffect(() => {
    if (editingId && currentPage) {
      const el =
        currentPage.elements.find((e) => e.id === editingId) ||
        catalog.headerElements?.find((e) => e.id === editingId) ||
        catalog.footerElements?.find((e) => e.id === editingId);
      if (el)
        setEditConfig((prev: any) =>
          prev
            ? {
                ...prev,
                color: el.fill || '#000000',
                fontSize: el.fontSize,
                fontWeight: el.fontWeight || 'normal',
                fontStyle: el.fontStyle || 'normal',
                fontFamily: el.fontFamily,
                align: el.textAlign || 'left',
                text:
                  activeEditingTextRef.current !== null
                    ? activeEditingTextRef.current
                    : el.text || '',
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
                effectRoundness: el.effectRoundness,
              }
            : null
        );
    }
  }, [
    currentPageIndex,
    editingId,
    currentPage?.elements,
    catalog.headerElements,
    catalog.footerElements,
  ]);

  const selectedElement = useMemo(() => {
    if (selectedElementIds.length !== 1) return null;
    const id = selectedElementIds[0];
    return (
      currentPage?.elements.find((e) => e.id === id) ||
      catalog.headerElements?.find((e) => e.id === id) ||
      catalog.footerElements?.find((e) => e.id === id)
    );
  }, [selectedElementIds, currentPage?.elements, catalog.headerElements, catalog.footerElements]);

  const selectedTextElement = useMemo(() => {
    return selectedElement?.type === 'text' ? selectedElement : null;
  }, [selectedElement]);

  if (!currentPage) return null;
  const snapTarget = dragOverTargetId
    ? currentPage.elements.find((el) => el.id === dragOverTargetId)
    : null;

  const isDark = uiTheme === 'dark';

  return (
    <div
      className={`flex-1 flex flex-col overflow-hidden relative transition-colors duration-200 ${
        isDark ? 'bg-[#0e0e0e]' : 'bg-[#cbd5e1]'
      }`}
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
            ? isDark
              ? 'bg-[#0F3D3E]/10'
              : 'bg-emerald-500/10'
            : isDark
            ? 'bg-[#121212]'
            : 'bg-[#e2e8f0]'
        }`}
        style={{
          backgroundImage: isDark
            ? 'radial-gradient(#252525 1px, transparent 1px)'
            : 'radial-gradient(#94a3b8 1px, transparent 1px)',
          backgroundSize: '24px 24px',
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
          className={`flex flex-col items-center py-12 pl-12 pr-6 gap-10 ${
            isPanActive ? '' : 'transition-transform duration-300 ease-out'
          }`}
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
            e.preventDefault();
          }}
        >
          {catalog.pages.map((page, pageIdx) => {
            const isActive = pageIdx === currentPageIndex;

            return (
              <div
                key={page.id}
                data-page-index={pageIdx}
                className="flex flex-col items-center gap-2 shrink-0"
                onClick={() => {
                  if (contextMenu) setContextMenu(null);
                  if (!isActive) {
                    setCurrentPageIndex(pageIdx);
                    setSelectedElementIds([]);
                    setEditingId(null);
                    setEditConfig(null);
                  }
                }}
                onContextMenu={(e) => {
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
                    pageIndex: pageIdx,
                  });
                }}
              >
                {/* 1. Page Header Bar */}
                <PageHeaderBar
                  page={page}
                  pageIdx={pageIdx}
                  totalPages={catalog.pages.length}
                  zoom={zoom}
                  pageWidth={curW}
                  editingSystemTemplate={editingSystemTemplate}
                  onMovePage={(from, to) => {
                    movePage(from, to);
                    setCurrentPageIndex(to);
                    setTimeout(() => scrollToPageIndex(to), 50);
                  }}
                  onDuplicatePage={(idx) => {
                    duplicatePage(idx);
                    setCurrentPageIndex(idx + 1);
                    setTimeout(() => scrollToPageIndex(idx + 1), 50);
                  }}
                  onRemovePage={(idx) => removePage(idx)}
                  onAddPage={(type, idx) => {
                    addPage(type, idx);
                    setCurrentPageIndex(idx + 1);
                    setTimeout(() => scrollToPageIndex(idx + 1), 50);
                  }}
                />

                {/* 2. White Catalog Sheet */}
                <div
                  className={`bg-white shrink-0 relative transition-all rounded-[2px] ${
                    isActive
                      ? isDragOver && (dragOverPageIndex === pageIdx || dragOverPageIndex === null)
                        ? 'ring-4 ring-[#00a651] shadow-[0_25px_70px_rgba(0,0,0,0.6)]'
                        : 'ring-2 ring-[#0F3D3E] shadow-[0_25px_60px_rgba(0,0,0,0.55)]'
                      : isDragOver && dragOverPageIndex === pageIdx
                      ? 'ring-4 ring-[#00a651] shadow-[0_25px_70px_rgba(0,0,0,0.6)] opacity-100'
                      : 'opacity-90 hover:opacity-100 cursor-pointer shadow-[0_15px_40px_rgba(0,0,0,0.4)] border border-[#2a2a2a]'
                  }`}
                  style={{
                    width: curW * zoom,
                    height: curH * zoom,
                    backgroundColor: page.backgroundColor || '#ffffff',
                    zIndex: isActive || dragOverPageIndex === pageIdx ? 200 : 1,
                  }}
                >
                  {/* Header / Footer guidelines & Safety margin box */}
                  <CanvasHeaderFooterGuides
                    catalog={catalog}
                    page={page}
                    isActive={isActive}
                    zoom={zoom}
                    curW={curW}
                    curH={curH}
                  />

                  {/* Asset drop indicator & snap HUD */}
                  <CanvasPageDropOverlay
                    isDragOver={isDragOver}
                    dragOverPageIndex={dragOverPageIndex}
                    pageIdx={pageIdx}
                    isActive={isActive}
                    snapTarget={snapTarget}
                    zoom={zoom}
                  />

                  {/* Fabric Rendering Canvas Stage */}
                  {(() => {
                    const pageHasHeader = Boolean(
                      catalog.hasHeader !== false &&
                      page.hasHeader !== false &&
                      (catalog.headerElements?.length || 0) > 0 &&
                      page.type !== 'cover' &&
                      page.type !== 'closing'
                    );
                    const pageHasFooter = Boolean(
                      catalog.hasFooter !== false &&
                      page.hasFooter !== false &&
                      (catalog.footerElements?.length || 0) > 0 &&
                      page.type !== 'cover' &&
                      page.type !== 'closing'
                    );
                    return (
                      <FabricStage
                        page={page}
                        pageIdx={pageIdx}
                        isActive={isActive}
                        zoom={zoom}
                        editingId={isActive ? editingId : null}
                        canvasBg={
                          page.backgroundColor ||
                          catalog.backgroundColor ||
                          theme?.backgroundColor ||
                          '#ffffff'
                        }
                        headerElements={pageHasHeader ? (catalog.headerElements || EMPTY_ARRAY) : EMPTY_ARRAY}
                        footerElements={pageHasFooter ? (catalog.footerElements || EMPTY_ARRAY) : EMPTY_ARRAY}
                        footerHeight={catalog.footerHeight || 38}
                      />
                    );
                  })()}

                  {/* Image crop overlay */}
                  {isActive && activeCropElementId && <ImageCropOverlay zoom={zoom} />}

                  {/* Double-click text editor overlay */}
                  {isActive && (
                    <InlineTextEditorOverlay
                      editConfig={editConfig}
                      zoom={zoom}
                      saveContent={saveContent}
                      textInputRef={textInputRef}
                      editConfigRef={editConfigRef}
                      activeEditingTextRef={activeEditingTextRef}
                      textDebounceTimerRef={textDebounceTimerRef}
                      setEditConfig={setEditConfig}
                      catalog={catalog}
                      currentPageIndex={currentPageIndex}
                      updateHeaderElement={updateHeaderElement}
                      updateFooterElement={updateFooterElement}
                      updateElement={updateElement}
                    />
                  )}

                  {/* In-place live video player overlay */}
                  {page.elements
                    ?.filter((el) => el.type === 'video' && el.id === playingVideoId)
                    .map((vidEl) => {
                      const parsed = parseVideoUrl(vidEl.videoUrl || '');
                      return (
                        <div
                          key={`live-player-${vidEl.id}`}
                          className="absolute z-[100] rounded-lg overflow-hidden shadow-2xl bg-black border-2 border-[#0084ff] animate-fadeIn"
                          style={{
                            left: vidEl.x * zoom,
                            top: vidEl.y * zoom,
                            width: vidEl.width * zoom,
                            height: vidEl.height * zoom,
                            transform: `rotate(${vidEl.rotation || 0}deg)`,
                            transformOrigin: 'top left',
                          }}
                          onClick={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPlayingVideoId(null);
                            }}
                            className="absolute top-2 right-2 z-[110] p-1.5 rounded-full bg-black/80 hover:bg-black text-white hover:scale-110 transition-transform shadow-lg border border-white/20"
                            title="Close Video Player"
                          >
                            <X size={14} />
                          </button>

                          {parsed.type === 'youtube' ||
                          parsed.type === 'vimeo' ||
                          parsed.type === 'loom' ? (
                            <iframe
                              src={parsed.embedUrl}
                              className="w-full h-full border-0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              allowFullScreen
                            />
                          ) : (
                            <video
                              src={vidEl.videoUrl}
                              poster={vidEl.videoPoster}
                              controls
                              autoPlay
                              playsInline
                              className="w-full h-full object-contain bg-black"
                            />
                          )}
                        </div>
                      );
                    })}

                  {/* Interactive Table Overlay */}
                  {page.elements
                    ?.filter(
                      (el) =>
                        el.type === 'table' &&
                        !el.sectionTag &&
                        !el.id.startsWith('grid-sec-') &&
                        (el.id === editingTableId ||
                          (selectedElementIds.includes(el.id) && selectedElementIds.length === 1))
                    )
                    .map((tblEl) => (
                      <TableOverlay
                        key={`tbl-overlay-${tblEl.id}`}
                        element={tblEl}
                        pageIndex={pageIdx}
                        zoom={zoom}
                        onClose={() => setEditingTableId(null)}
                      />
                    ))}

                  {/* Floating Text Toolbar */}
                  {isActive && (editingId || selectedTextElement) && (
                    <FloatingTextToolbar
                      element={
                        (editingId && editConfig
                          ? {
                              ...editConfig,
                              type: 'text',
                              fill: editConfig.color,
                              textAlign: editConfig.align,
                            }
                          : selectedTextElement) as any
                      }
                      onUpdate={(updates) => {
                        if (editingId) {
                          const mappedForEdit: any = { ...updates };
                          if (updates.fill !== undefined) mappedForEdit.color = updates.fill;
                          if (updates.textAlign !== undefined) mappedForEdit.align = updates.textAlign;
                          if (updates.text !== undefined)
                            activeEditingTextRef.current = updates.text;

                          if (editConfigRef.current) {
                            editConfigRef.current = {
                              ...editConfigRef.current,
                              ...mappedForEdit,
                            };
                          }
                          setEditConfig((prev) => (prev ? { ...prev, ...mappedForEdit } : null));

                          if (updates.text !== undefined && textInputRef.current) {
                            textInputRef.current.innerText = (updates.text || '').replace(
                              /<[^>]*>/g,
                              ''
                            );
                          }

                          if (catalog.headerElements?.some((el) => el.id === editingId)) {
                            updateHeaderElement(editingId, updates);
                          } else if (catalog.footerElements?.some((el) => el.id === editingId)) {
                            updateFooterElement(editingId, updates);
                          } else {
                            const targetPageIndex =
                              editConfigRef.current?.pageIndex !== undefined
                                ? editConfigRef.current.pageIndex
                                : currentPageIndex;
                            updateElement(targetPageIndex, editingId, updates);
                          }
                        } else if (selectedTextElement) {
                          if (catalog.headerElements?.some((el) => el.id === selectedTextElement.id)) {
                            updateHeaderElement(selectedTextElement.id, updates);
                          } else if (
                            catalog.footerElements?.some((el) => el.id === selectedTextElement.id)
                          ) {
                            updateFooterElement(selectedTextElement.id, updates);
                          } else {
                            updateElement(currentPageIndex, selectedTextElement.id, updates);
                          }
                        }
                      }}
                      zoom={zoom}
                    />
                  )}

                  {/* Floating Element Toolbar */}
                  {isActive && !editConfig && selectedElement && selectedElement.type !== 'text' && (
                    <FloatingToolbar
                      onOpenMenu={() => {}}
                      currentFill={selectedElement.fill || '#cbd5e1'}
                      currentStroke={selectedElement.stroke || 'transparent'}
                      currentOpacity={selectedElement.opacity}
                      onFillChange={(color) => {
                        if (catalog.headerElements.some((el) => el.id === selectedElement.id))
                          updateHeaderElement(selectedElement.id, { fill: color });
                        else if (catalog.footerElements.some((el) => el.id === selectedElement.id))
                          updateFooterElement(selectedElement.id, { fill: color });
                        else updateElement(currentPageIndex, selectedElement.id, { fill: color });
                      }}
                      onStrokeChange={(color) => {
                        const updates = {
                          stroke: color,
                          strokeWidth: Math.max(selectedElement.strokeWidth || 0, 2),
                        };
                        if (catalog.headerElements.some((el) => el.id === selectedElement.id))
                          updateHeaderElement(selectedElement.id, updates);
                        else if (catalog.footerElements.some((el) => el.id === selectedElement.id))
                          updateFooterElement(selectedElement.id, updates);
                        else updateElement(currentPageIndex, selectedElement.id, updates);
                      }}
                    />
                  )}

                  {/* Right-Side Section Quick Action Docks */}
                  {isActive &&
                    editorTab === 'grid-studio' &&
                    (page.type === 'interior' ||
                      (page.type !== 'cover' &&
                        page.type !== 'index' &&
                        page.type !== 'closing')) && (
                      <SectionQuickActionsDock
                        page={page}
                        pageIdx={pageIdx}
                        zoom={zoom}
                        curW={curW}
                        swapPageSections={swapPageSections}
                        deletePageSection={deletePageSection}
                        setCurrentPageIndex={setCurrentPageIndex}
                        setEditorTab={setEditorTab}
                        setSidebarExpanded={setSidebarExpanded}
                      />
                    )}
                </div>
              </div>
            );
          })}

          {/* Add New Page Footer */}
          <AddNewPageFooter
            catalog={catalog}
            zoom={zoom}
            uiTheme={uiTheme}
            editingSystemTemplate={editingSystemTemplate}
            addPage={addPage}
            addInteriorPageWithInheritedLayout={addInteriorPageWithInheritedLayout}
            scrollToPageIndex={scrollToPageIndex}
          />
        </div>
      </div>

      {/* Product Grid Studio Modal */}
      {isGridStudioOpen && (
        <ProductGridStudioModal
          pageIndex={gridStudioPageIndex}
          onClose={() => setIsGridStudioOpen(false, null)}
        />
      )}

      {/* Right-Click Context Menu */}
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
