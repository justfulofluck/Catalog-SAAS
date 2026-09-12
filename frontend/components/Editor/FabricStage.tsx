import React, { useEffect, useRef, useState } from 'react';
import { Canvas, Circle, ActiveSelection, Rect, config, util, Point } from 'fabric';
import { useStore } from '../../store/useStore';
import { PAGE_WIDTH, PAGE_HEIGHT } from '../../constants';
import { CatalogPage, CanvasElement } from '../../types';
import { elementToFabricObject } from './fabricRenderer';
import { globalSpatialIndex, DistanceBadge } from '../../utils/spatialIndex';
import { initCanvaGlobals, applyCanvaSelectionStyle, renderCanvaHoverOutline, CANVA_THEME } from '../../utils/canvaControls';
import { resolveDynamicText, getPageCategoryName } from '../../utils/dynamicTags';

// Initialize Canva-style controls globally on Fabric prototypes
initCanvaGlobals();

interface Props {
  page: CatalogPage;
  pageIdx: number;
  isActive: boolean;
  zoom: number;
  canvasBg: string;
  headerElements?: CanvasElement[];
  footerElements?: CanvasElement[];
  footerHeight?: number;
  editingId?: string | null;
}

// Global capture listener ensuring we always know the exact mouse coordinates of any right-click
let lastRightClickPos = { x: 0, y: 0 };
if (typeof window !== 'undefined') {
  const recordRightClickPos = (e: MouseEvent | PointerEvent) => {
    if (e.clientX > 0 || e.clientY > 0) {
      lastRightClickPos = { x: e.clientX, y: e.clientY };
      (window as any).__lastContextMenuPos = { x: e.clientX, y: e.clientY };
    }
  };
  window.addEventListener('mousedown', recordRightClickPos, true);
  window.addEventListener('pointerdown', recordRightClickPos, true);
  window.addEventListener('contextmenu', recordRightClickPos, true);
}

const FabricStage: React.FC<Props> = ({ page, pageIdx, isActive, zoom, canvasBg, headerElements = [], footerElements = [], footerHeight = 38, editingId = null }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);
  const renderThrottleRef = useRef<number | null>(null);
  const [activeGuides, setActiveGuides] = useState<{ type: 'horizontal' | 'vertical'; pos: number }[]>([]);
  const [activeDistanceBadges, setActiveDistanceBadges] = useState<DistanceBadge[]>([]);
  const [activeDimensions, setActiveDimensions] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const { selectedElementIds, setSelectedElementIds, updateElement, updateElements, pushHistory, catalog } = useStore();
  const products = useStore((state) => state.products);
  const categories = useStore((state) => state.categories);
  const user = useStore((state) => state.user);

  // Keep latest page, pageIdx and isActive in refs so event listener closures never access stale props
  const pageRef = useRef(page);
  pageRef.current = page;
  const pageIdxRef = useRef(pageIdx);
  pageIdxRef.current = pageIdx;
  const isActiveRef = useRef(isActive);
  isActiveRef.current = isActive;
  // Shared flag: suppresses selection:cleared during render-cycle ActiveSelection discard
  const suppressSelectionClearedRef = useRef(false);

  const curW = PAGE_WIDTH;
  const curH = PAGE_HEIGHT;
  // Artboard bleed padding: allows selection outline, handles, and elements to extend freely outside the sheet into the workspace
  const CANVAS_PAD_X = 500;
  const CANVAS_PAD_Y = 80;

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new Canvas(canvasRef.current, {
      width: (curW + CANVAS_PAD_X * 2) * zoom,
      height: (curH + CANVAS_PAD_Y * 2) * zoom,
      backgroundColor: 'transparent',
      selection: true, // Enable click-and-drag area marquee multi-selection
      selectionColor: 'rgba(139, 61, 255, 0.12)', // Canva-style translucent purple
      selectionBorderColor: CANVA_THEME.borderColor, // Signature Canva purple border
      selectionLineWidth: 1.5,
      preserveObjectStacking: true,
      enableRetinaScaling: true,
      fireRightClick: true,
      stopContextMenu: true,
      controlsAboveOverlay: true,
    });
    canvas.controlsAboveOverlay = true;
    // Set viewport transform to offset world (0,0) by CANVAS_PAD_X and CANVAS_PAD_Y
    canvas.viewportTransform = [zoom, 0, 0, zoom, CANVAS_PAD_X * zoom, CANVAS_PAD_Y * zoom];

    // Visually clip all object artwork to the page sheet boundary [0, curW] x [0, curH],
    // while keeping selection bounding border, corner circles, and drag handles completely unclipped and clickable
    const origRenderObjects = (canvas as any)._renderObjects.bind(canvas);
    (canvas as any)._renderObjects = function (ctx: CanvasRenderingContext2D, objects: any[]) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, curW, curH);
      ctx.clip();
      origRenderObjects(ctx, objects);
      ctx.restore();
    };

    fabricCanvasRef.current = canvas;

    // Helper: expand selection to include all elements sharing the same groupId
    const expandGroupSelection = (selectedIds: string[]) => {
      const currentPage = pageRef.current;
      if (!currentPage?.elements) return selectedIds;
      const groupIds = new Set<string>();
      selectedIds.forEach(id => {
        const el = currentPage.elements.find(e => e.id === id);
        if (el?.groupId) groupIds.add(el.groupId);
      });
      if (groupIds.size === 0) return selectedIds;
      // Add all elements that share any of the group IDs
      const expandedIds = new Set(selectedIds);
      currentPage.elements.forEach(el => {
        if (el.groupId && groupIds.has(el.groupId)) {
          expandedIds.add(el.id);
        }
      });
      return Array.from(expandedIds);
    };

    // Guard flag: prevents recursive selection events and state corruption during group expansion.
    // When we call discardActiveObject() + setActiveObject() inside selection:created,
    // Fabric fires selection:cleared and then selection:created again synchronously.
    // Without this guard, the intermediate selection:cleared wipes selectedElementIds in the store,
    // and the subscribe block interferes with the canvas — ultimately causing the render effect
    // to not find existing objects and recreate them, losing the originals.
    let _isExpandingGroup = false;

    canvas.on('selection:created', (e: any) => {
      if (_isExpandingGroup) return; // Re-entry from setActiveObject inside expansion — skip
      const active = canvas.getActiveObject();
      if (active) {
        applyCanvaSelectionStyle(active);
        active.setCoords();
      }
      canvas.requestRenderAll();
      let ids = (e.selected || []).map((o: any) => o.id).filter(Boolean) as string[] || [];
      ids = expandGroupSelection(ids);
      // If the selection expanded due to groupId, create an ActiveSelection with all siblings
      const currentActiveIds = canvas.getActiveObjects().map((o: any) => o.id).filter(Boolean);
      if (ids.length > currentActiveIds.length) {
        _isExpandingGroup = true;
        try {
          canvas.discardActiveObject();
          const objsToSelect = canvas.getObjects().filter((o: any) => ids.includes(o.id));
          if (objsToSelect.length > 1) {
            const sel = new ActiveSelection(objsToSelect, { canvas });
            applyCanvaSelectionStyle(sel);
            canvas.setActiveObject(sel);
            canvas.requestRenderAll();
          } else if (objsToSelect.length === 1) {
            canvas.setActiveObject(objsToSelect[0]);
            canvas.requestRenderAll();
          }
        } finally {
          _isExpandingGroup = false;
        }
      }
      setSelectedElementIds(ids);
    });

    canvas.on('selection:updated', (e: any) => {
      if (_isExpandingGroup) return; // Re-entry guard
      const active = canvas.getActiveObject();
      if (active) {
        applyCanvaSelectionStyle(active);
        active.setCoords();
      }
      canvas.requestRenderAll();
      let ids = (e.selected || []).map((o: any) => o.id).filter(Boolean) as string[] || [];
      // Also include currently active objects that weren't deselected
      const allActiveIds = canvas.getActiveObjects().map((o: any) => o.id).filter(Boolean);
      const mergedIds = Array.from(new Set([...ids, ...allActiveIds]));
      const expandedIds = expandGroupSelection(mergedIds);
      if (expandedIds.length > allActiveIds.length) {
        _isExpandingGroup = true;
        try {
          canvas.discardActiveObject();
          const objsToSelect = canvas.getObjects().filter((o: any) => expandedIds.includes(o.id));
          if (objsToSelect.length > 1) {
            const sel = new ActiveSelection(objsToSelect, { canvas });
            applyCanvaSelectionStyle(sel);
            canvas.setActiveObject(sel);
            canvas.requestRenderAll();
          } else if (objsToSelect.length === 1) {
            canvas.setActiveObject(objsToSelect[0]);
            canvas.requestRenderAll();
          }
        } finally {
          _isExpandingGroup = false;
        }
      }
      setSelectedElementIds(expandedIds);
    });

    canvas.on('selection:cleared', () => {
      // Don't clear store selection during group expansion — the discardActiveObject()
      // is only temporary and will be immediately followed by a new setActiveObject()
      if (_isExpandingGroup) return;
      // Don't clear during render-cycle ActiveSelection discard
      if (suppressSelectionClearedRef.current) return;
      setSelectedElementIds([]);
    });

    // Canva-style auto hover outline for unselected components
    let hoveredObject: any = null;

    canvas.on('mouse:move', (e: any) => {
      // Don't show hover outline while dragging, scaling, rotating, or drawing marquee
      if ((canvas as any)._currentTransform || (canvas as any).isDrawingMode || (canvas as any)._isCurrentlyDrawingSelection) {
        if (hoveredObject) {
          hoveredObject = null;
          canvas.requestRenderAll();
        }
        return;
      }

      // Check subTargets first (e.g. image or color swatch inside card), otherwise top target
      let target = (e.subTargets && e.subTargets.length > 0) ? e.subTargets[0] : e.target;

      // If hovering over the base background rect of a card group, treat the card as target
      if (target && target.group && target === (target.group as any)._objects?.[0]) {
        target = target.group;
      }

      const activeObj = canvas.getActiveObject();
      const activeObjs = canvas.getActiveObjects();
      const isAlreadyActive = target && (
        target === activeObj ||
        activeObjs.includes(target) ||
        (target.group && (target.group === activeObj || activeObjs.includes(target.group)))
      );

      if (
        target &&
        !isAlreadyActive &&
        target.visible !== false &&
        target.selectable !== false &&
        target !== canvas.backgroundImage
      ) {
        if (hoveredObject !== target) {
          hoveredObject = target;
          canvas.requestRenderAll();
        }
      } else {
        if (hoveredObject) {
          hoveredObject = null;
          canvas.requestRenderAll();
        }
      }
    });

    canvas.on('mouse:out', () => {
      if (hoveredObject) {
        hoveredObject = null;
        canvas.requestRenderAll();
      }
    });

    // Override drawControls to render the purple hover outline
    const origDrawControls = canvas.drawControls.bind(canvas);
    canvas.drawControls = function (ctx: CanvasRenderingContext2D) {
      origDrawControls(ctx);

      if (
        hoveredObject &&
        hoveredObject.visible !== false &&
        !(canvas as any)._currentTransform &&
        !canvas.getActiveObjects().includes(hoveredObject) &&
        (!hoveredObject.group || !canvas.getActiveObjects().includes(hoveredObject.group))
      ) {
        renderCanvaHoverOutline(ctx, hoveredObject);
      }
    };

    canvas.on('mouse:down', (opt: any) => {
      canvas.calcOffset();
      if (useStore.getState().currentPageIndex !== pageIdxRef.current) {
        useStore.getState().setCurrentPageIndex(pageIdxRef.current);
      }

      const target = opt.target;
      const isTransform = !!(canvas as any)._currentTransform;
      if (isTransform) return;

      // 1. Clicked on empty canvas or padding outside any object
      if (!target) {
        canvas.discardActiveObject();
        canvas.requestRenderAll();
        setSelectedElementIds([]);
        return;
      }

      // 2. Clicked on ActiveSelection (multi-selection)
      if (target instanceof ActiveSelection || target.type === 'ActiveSelection' || target.type === 'activeSelection') {
        const subTargets = (opt.subTargets || []).filter((st: any) => st && st !== target && st.id);
        if (subTargets.length === 0) {
          // User clicked on empty space between objects in the selection -> Deselect
          canvas.discardActiveObject();
          canvas.requestRenderAll();
          setSelectedElementIds([]);
        } else if (subTargets.length === 1 && !opt.e?.shiftKey) {
          // User clicked directly on one child element inside the selection -> select that single element
          const singleObj = subTargets[0];
          if (singleObj && singleObj.id) {
            canvas.setActiveObject(singleObj);
            applyCanvaSelectionStyle(singleObj);
            singleObj.setCoords();
            canvas.requestRenderAll();
            setSelectedElementIds([singleObj.id]);
          }
        }
      }
    });

    canvas.on('mouse:dblclick', (e: any) => {
      const obj = e.target;
      if (obj && obj.id) {
        // Header & Footer elements cannot be edited on the main canvas (only in their respective Studio)
        if (headerElements?.some(item => item.id === obj.id) || footerElements?.some(item => item.id === obj.id)) {
          return;
        }
        const el = pageRef.current.elements.find(item => item.id === obj.id);
        if (el && el.type === 'text') {
          window.dispatchEvent(new CustomEvent('catalog:editText', { detail: { id: el.id, pageIndex: pageIdxRef.current } }));
        } else if (el && (el.type === 'table' || el.tableData)) {
          useStore.getState().setEditorTab('grid');
          window.dispatchEvent(new CustomEvent('catalog:editTable', { detail: { id: el.id, pageIndex: pageIdxRef.current } }));
        }
      }
    });

    // Handle Right-Click Context Menu for Page vs Components
    let lastContextMenuTime = 0;

    const triggerContextMenu = (eventOrOpt: any, targetFromFabric?: any, subTargetsFromFabric?: any[]) => {
      // Prevent duplicate events within 150ms
      const now = Date.now();
      if (now - lastContextMenuTime < 150) return;
      lastContextMenuTime = now;

      // Extract native MouseEvent
      const e = (eventOrOpt && typeof eventOrOpt.clientX === 'number')
        ? eventOrOpt
        : (eventOrOpt && eventOrOpt.e && typeof eventOrOpt.e.clientX === 'number')
          ? eventOrOpt.e
          : null;

      if (e) {
        e.preventDefault?.();
        e.stopPropagation?.();
        e.stopImmediatePropagation?.();
      }

      const clientX = (e && typeof e.clientX === 'number' && e.clientX > 0)
        ? e.clientX
        : (lastRightClickPos.x || window.innerWidth / 2);
      const clientY = (e && typeof e.clientY === 'number' && e.clientY > 0)
        ? e.clientY
        : (lastRightClickPos.y || window.innerHeight / 2);

      canvas.calcOffset();

      // Helper: Only true Fabric objects with setCoords method (NOT DOM HTMLCanvasElement)
      const isValidFabricObj = (obj: any) => obj && typeof obj.setCoords === 'function';

      let target: any = null;
      if (isValidFabricObj(targetFromFabric)) {
        target = targetFromFabric;
      } else if (isValidFabricObj(eventOrOpt?.target)) {
        target = eventOrOpt.target;
      }

      const subTargets = subTargetsFromFabric || (eventOrOpt && eventOrOpt.subTargets);
      if (!target && subTargets && subTargets.length > 0 && isValidFabricObj(subTargets[0])) {
        target = subTargets[0];
      }

      // If no target yet, query canvas for the object under mouse pointer
      if (!target && e) {
        const targetInfo = canvas.findTarget(e) as any;
        if (targetInfo) {
          if (isValidFabricObj(targetInfo.target)) {
            target = targetInfo.target;
          } else if (isValidFabricObj(targetInfo)) {
            target = targetInfo;
          } else if (targetInfo.subTargets && targetInfo.subTargets.length > 0 && isValidFabricObj(targetInfo.subTargets[0])) {
            target = targetInfo.subTargets[0];
          }
        }
      }

      // Fallback: If clicked while an object or multi-selection was already active on canvas
      const currentActive = canvas.getActiveObject();
      const currentActiveObjects = canvas.getActiveObjects();

      // Check if target is part of the current active multiple selection
      const isTargetInMultiSelection = target && currentActiveObjects.includes(target);
      const isMultiActive = currentActive instanceof ActiveSelection || currentActiveObjects.length > 1;

      if (!target && isMultiActive && isValidFabricObj(currentActive)) {
        target = currentActive;
      }

      // If clicked on child of a card/group or subTarget, resolve to top group or card that has an id
      if (target && target.group && !(target.group instanceof ActiveSelection) && (target.group as any).id) {
        target = target.group;
      }

      const isMultiSelectionTarget = target instanceof ActiveSelection || (isMultiActive && isTargetInMultiSelection);
      const isFabricElement = (target && isValidFabricObj(target) && target.id) || isMultiSelectionTarget;

      if (
        isFabricElement &&
        target.visible !== false &&
        target.selectable !== false &&
        target !== canvas.backgroundImage
      ) {
        // Component or Multi-selection right-clicked
        if (isMultiSelectionTarget) {
          // Keep existing multiple selected elements
          const activeIds = currentActiveObjects.map((o: any) => o.id).filter(Boolean);
          if (activeIds.length > 0) {
            setSelectedElementIds(activeIds);
          }
        } else {
          const isAlreadyActive = target === currentActive || currentActiveObjects.includes(target);

          if (!isAlreadyActive) {
            canvas.setActiveObject(target);
            applyCanvaSelectionStyle(target);
            target.setCoords();
            canvas.requestRenderAll();
            if (target.id) {
              setSelectedElementIds([target.id]);
            }
          }
        }

        if (useStore.getState().currentPageIndex !== pageIdxRef.current) {
          useStore.getState().setCurrentPageIndex(pageIdxRef.current);
        }

        window.dispatchEvent(new CustomEvent('catalog:openContextMenu', {
          detail: {
            x: clientX,
            y: clientY,
            type: 'element',
            pageIndex: pageIdxRef.current,
            targetId: target.id || (currentActiveObjects[0] as any)?.id
          }
        }));
      } else {
        // Empty page / background right-clicked (Screenshot 1: Page Menu)
        canvas.discardActiveObject();
        canvas.requestRenderAll();
        setSelectedElementIds([]);

        if (useStore.getState().currentPageIndex !== pageIdxRef.current) {
          useStore.getState().setCurrentPageIndex(pageIdxRef.current);
        }

        window.dispatchEvent(new CustomEvent('catalog:openContextMenu', {
          detail: {
            x: clientX,
            y: clientY,
            type: 'page',
            pageIndex: pageIdxRef.current
          }
        }));
      }
    };

    // Listen to Fabric's internal contextmenu event
    canvas.on('contextmenu', (opt: any) => {
      triggerContextMenu(opt, opt?.target, opt?.subTargets);
    });

    // Also attach to upperCanvasEl as backup
    const upperEl = canvas.upperCanvasEl;
    const handleNativeContextMenu = (e: MouseEvent) => {
      triggerContextMenu(e);
    };
    if (upperEl) {
      upperEl.addEventListener('contextmenu', handleNativeContextMenu);
    }

    let dragTimer: number | null = null;
    canvas.on('object:moving', (e: any) => {
      const obj = e.target as any;
      const isMulti = obj && (
        obj instanceof ActiveSelection ||
        obj.type === 'ActiveSelection' ||
        obj.type === 'activeSelection' ||
        'multiSelectionStacking' in obj
      );

      if (obj && obj.id) {
        const objW = (obj.width || 0) * (obj.scaleX || 1);
        const objH = (obj.height || 0) * (obj.scaleY || 1);
        const currentBox = {
          id: obj.id,
          minX: obj.left || 0,
          minY: obj.top || 0,
          maxX: (obj.left || 0) + objW,
          maxY: (obj.top || 0) + objH,
          zIndex: obj.zIndex || 0,
        };

        const activeMargins = catalog.showMargins !== false ? {
          top: catalog.marginTop || 0,
          bottom: curH - (catalog.marginBottom || 0),
          left: catalog.marginLeft || 0,
          right: curW - (catalog.marginRight || 0),
        } : undefined;

        const { snapX, snapY, guideLines, distanceBadges } = globalSpatialIndex.findSnapTargets(currentBox, 6, activeMargins);
        if (snapX !== null) {
          obj.set('left', snapX);
        }
        if (snapY !== null) {
          obj.set('top', snapY);
        }
        setActiveGuides(guideLines);
        setActiveDistanceBadges(distanceBadges);
        setActiveDimensions({
          x: obj.left || 0,
          y: obj.top || 0,
          w: Math.round(objW),
          h: Math.round(objH)
        });
      } else if (isMulti) {
        const objW = (obj.width || 0) * (obj.scaleX || 1);
        const objH = (obj.height || 0) * (obj.scaleY || 1);
        const currentBox = {
          id: 'activeSelection',
          minX: (obj.left || 0) - objW / 2,
          minY: (obj.top || 0) - objH / 2,
          maxX: (obj.left || 0) + objW / 2,
          maxY: (obj.top || 0) + objH / 2,
          zIndex: 9999,
        };

        const activeMargins = catalog.showMargins !== false ? {
          top: catalog.marginTop || 0,
          bottom: curH - (catalog.marginBottom || 0),
          left: catalog.marginLeft || 0,
          right: curW - (catalog.marginRight || 0),
        } : undefined;

        const { snapX, snapY, guideLines, distanceBadges } = globalSpatialIndex.findSnapTargets(currentBox, 6, activeMargins);
        if (snapX !== null) {
          obj.set('left', snapX + objW / 2);
        }
        if (snapY !== null) {
          obj.set('top', snapY + objH / 2);
        }
        setActiveGuides(guideLines);
        setActiveDistanceBadges(distanceBadges);
        setActiveDimensions({
          x: Math.round((obj.left || 0) - objW / 2),
          y: Math.round((obj.top || 0) - objH / 2),
          w: Math.round(objW),
          h: Math.round(objH)
        });
      }

      if (renderThrottleRef.current) clearTimeout(renderThrottleRef.current);
      if (!dragTimer) {
        pushHistory();
        dragTimer = window.setTimeout(() => { dragTimer = null; }, 300);
      }
      renderThrottleRef.current = window.setTimeout(() => {
        if (obj && obj.id) {
          const isHeader = headerElements?.some(el => el.id === obj.id);
          const isFooter = footerElements?.some(el => el.id === obj.id);
          if (isHeader || isFooter) return; // Header and Footer cannot be moved in the main editor
          const updates = { x: obj.left || 0, y: obj.top || 0 };
          updateElement(pageIdxRef.current, obj.id, updates);
        }
      }, 16);
    });

    canvas.on('object:scaling', (e: any) => {
      const obj = e.target as any;
      if (obj) {
        const objW = (obj.width || 0) * (obj.scaleX || 1);
        const objH = (obj.height || 0) * (obj.scaleY || 1);
        const isMulti = obj instanceof ActiveSelection || obj.type === 'ActiveSelection' || obj.type === 'activeSelection' || 'multiSelectionStacking' in obj;
        setActiveDimensions({
          x: Math.round(isMulti ? (obj.left || 0) - objW / 2 : (obj.left || 0)),
          y: Math.round(isMulti ? (obj.top || 0) - objH / 2 : (obj.top || 0)),
          w: Math.round(objW),
          h: Math.round(objH),
        });
      }
    });

    canvas.on('object:modified', (e: any) => {
      const obj = e.target as any;
      const isMulti = obj instanceof ActiveSelection || obj.type === 'ActiveSelection' || obj.type === 'activeSelection' || 'multiSelectionStacking' in obj;

      if (isMulti) {
        pushHistory();
        const objects = obj.getObjects();
        const isScaled = Math.abs((obj.scaleX || 1) - 1) > 0.001 || Math.abs((obj.scaleY || 1) - 1) > 0.001;
        const pageUpdates: { id: string; updates: any }[] = [];

        objects.forEach((child: any) => {
          if (!child.id) return;
          
          const isHeader = headerElements?.some(el => el.id === child.id);
          const isFooter = footerElements?.some(el => el.id === child.id);
          if (isHeader || isFooter) return; // Header and Footer cannot be modified in main editor
          const el = pageRef.current.elements.find((e: CanvasElement) => e.id === child.id);
          
          const matrix = child.calcTransformMatrix();
          const decomposed = util.qrDecompose(matrix);
          const normAngle = Math.round(((decomposed.angle % 360) + 360) % 360);

          // Absolute position from the full transform matrix.
          // matrix[4] and matrix[5] are the center coordinates in canvas space.
          // For originX:'left'/originY:'top', offset by half the scaled dimensions.
          const childW = (child.width || 0) * Math.abs(decomposed.scaleX || 1);
          const childH = (child.height || 0) * Math.abs(decomposed.scaleY || 1);

          const updates: any = {
            x: Math.round(matrix[4] - childW / 2),
            y: Math.round(matrix[5] - childH / 2),
            rotation: normAngle,
          };

          if (isScaled) {
            const childSx = Math.abs(child.scaleX || 1);
            const childSy = Math.abs(child.scaleY || 1);

            if (child instanceof IText || child.type === 'i-text' || child.type === 'text') {
              updates.width = Math.max(20, Math.round((child.width || (el?.width || 0)) * childSx));
            } else if (child instanceof Circle) {
              const newRadius = (child.radius || (el?.width ? el.width / 2 : 0)) * childSx;
              updates.width = Math.round(newRadius * 2);
              updates.height = Math.round(newRadius * 2);
            } else {
              updates.width = Math.round((child.width || (el?.width || 0)) * childSx);
              updates.height = Math.round((child.height || (el?.height || 0)) * childSy);
            }
          }
          
          pageUpdates.push({ id: child.id, updates });
        });

        if (pageUpdates.length > 0) {
          updateElements(pageIdxRef.current, pageUpdates);
        }
      } else if (obj && obj.id) {
        const isHeader = headerElements?.some(el => el.id === obj.id);
        const isFooter = footerElements?.some(el => el.id === obj.id);
        if (isHeader || isFooter) return; // Header and Footer cannot be modified in the main editor
        const el = pageRef.current.elements.find((e: CanvasElement) => e.id === obj.id);
        
        const isDivider = (typeof obj.id === 'string' && (obj.id.includes('line') || obj.id.includes('div'))) || el?.shapeType === 'line';
        let posX = obj.left || 0;
        let posY = obj.top || 0;
        if (isDivider || obj.originX === 'center') {
          const objW = (obj.width || 0) * (Math.abs(obj.scaleX || 1));
          const objH = (obj.height || 0) * (Math.abs(obj.scaleY || 1));
          posX = (obj.left || 0) - objW / 2;
          posY = (obj.top || 0) - objH / 2;
        }

        const updates: any = { x: Math.round(posX), y: Math.round(posY), rotation: Math.round(obj.angle || 0) };
        const sx = Math.abs(obj.scaleX || 1);
        const sy = Math.abs(obj.scaleY || 1);
        
        if (el && el.type === 'text') {
          if (sx !== 1 || sy !== 1) {
            const newWidth = Math.max(20, (obj.width || el.width) * sx);
            updates.width = newWidth;
            obj.set({
              width: newWidth,
              scaleX: 1,
              scaleY: 1
            });
            obj.setCoords();
          } else {
            updates.width = obj.width || el.width;
          }
          updates.height = obj.height || el.height;
        } else if (obj instanceof Circle) {
          const newRadius = (obj.radius || (el?.width ? el.width / 2 : 0)) * sx;
          updates.width = newRadius * 2;
          updates.height = newRadius * 2;
          obj.set({
            radius: newRadius,
            scaleX: 1,
            scaleY: 1
          });
          obj.setCoords();
        } else if (el && (el.type === 'shape' || el.type === 'comment')) {
          const newW = (obj.width || el.width || 0) * sx;
          const newH = (obj.height || el.height || 0) * sy;
          updates.width = newW;
          updates.height = newH;
          obj.set({
            width: newW,
            height: newH,
            scaleX: 1,
            scaleY: 1
          });
          obj.setCoords();
        } else if (el && el.type === 'image') {
          const newW = (obj.width || el.width || 0) * sx;
          const newH = (obj.height || el.height || 0) * sy;
          updates.width = newW;
          updates.height = newH;
        } else if (el && el.type === 'product-block') {
          const newW = (obj.width || el.width || 0) * sx;
          const newH = (obj.height || el.height || 0) * sy;
          updates.width = newW;
          updates.height = newH;
        } else if (el && el.type === 'table') {
          const newW = (obj.width || el.width || 0) * sx;
          const newH = (obj.height || el.height || 0) * sy;
          updates.width = newW;
          updates.height = newH;
        } else {
          updates.width = (obj.width || 0) * sx;
          updates.height = (obj.height || 0) * sy;
        }
        pushHistory();
        
        updateElement(pageIdxRef.current, obj.id, updates);
      }
      setActiveGuides([]);
      setActiveDistanceBadges([]);
      setActiveDimensions(null);
    });

    canvas.on('mouse:up', () => {
      setActiveGuides([]);
      setActiveDistanceBadges([]);
      setActiveDimensions(null);
    });

    return () => {
      if (renderThrottleRef.current) clearTimeout(renderThrottleRef.current);
      if (dragTimer) clearTimeout(dragTimer);
      if (upperEl) {
        upperEl.removeEventListener('contextmenu', handleNativeContextMenu);
      }
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
  }, [curW, curH]);

  useEffect(() => {
    if (!fabricCanvasRef.current) return;
    const canvas = fabricCanvasRef.current;
    canvas.controlsAboveOverlay = true;
    canvas.setDimensions({
      width: (curW + CANVAS_PAD_X * 2) * zoom,
      height: (curH + CANVAS_PAD_Y * 2) * zoom,
    });
    canvas.viewportTransform = [zoom, 0, 0, zoom, CANVAS_PAD_X * zoom, CANVAS_PAD_Y * zoom];
    canvas.calcOffset();
    canvas.requestRenderAll();
  }, [zoom, curW, curH]);

  useEffect(() => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    let isCurrent = true;

    const loadObjects = async () => {
      if ((canvas as any)._currentTransform) return;
      try {
        // CRITICAL: In Fabric.js, objects inside an ActiveSelection are temporarily
        // removed from canvas._objects. If we call canvas.getObjects() while an
        // ActiveSelection exists, those objects won't be found, leading to duplicate
        // creation and the originals being lost. Discard the selection first, then
        // restore it after rendering.
        let savedActiveIds: string[] = [];
        const activeObj = canvas.getActiveObject();
        if (activeObj && (activeObj instanceof ActiveSelection || (activeObj as any).type === 'activeSelection')) {
          savedActiveIds = canvas.getActiveObjects().map((o: any) => o.id).filter(Boolean);
          suppressSelectionClearedRef.current = true;
          canvas.discardActiveObject();
          suppressSelectionClearedRef.current = false;
        }

        const existingObjects = canvas.getObjects();
        const effectiveFooterHeight = catalog.footerHeight || footerHeight || 75.6;
        const footerBaseY = PAGE_HEIGHT - effectiveFooterHeight;

        const pageCategory = getPageCategoryName(page, categories, products, catalog);
        const dynamicContext = {
          pageNumber: page.pageNumber || pageIdx + 1,
          totalPages: catalog.pages?.length || 1,
          catalogName: catalog.name || 'Catalog',
          categoryName: pageCategory,
          companyName: (user as any)?.businessName || catalog.company || 'V-TAC',
          year: new Date().getFullYear()
        };

        const formattedFooterElements = (footerElements || []).map((el: any) => {
          const isFullBg = el.id?.startsWith('ftr-bg') || (el.type === 'shape' && (el.width || 0) >= 700 && (el.height || 0) >= (effectiveFooterHeight - 5));
          return {
            ...el,
            height: isFullBg ? effectiveFooterHeight : el.height,
            y: (el.y || 0) > 500 ? el.y : ((el.y || 0) + footerBaseY),
            text: el.type === 'text'
              ? resolveDynamicText(el.text, dynamicContext)
              : el.text
          };
        });

        const formattedHeaderElements = (headerElements || []).map((el: any) => ({
          ...el,
          text: el.type === 'text'
            ? resolveDynamicText(el.text, dynamicContext)
            : el.text
        }));

        const allElements = [
          ...page.elements,
          ...formattedHeaderElements,
          ...formattedFooterElements
        ];

        // Ensure all fonts used across elements are loaded in the browser
        if (typeof document !== 'undefined' && document.fonts) {
          const fontsToWait = new Set<string>();
          allElements.forEach((el: any) => {
            const f = el.fontFamily || (catalog as any)?.fontFamily;
            if (f) fontsToWait.add(f);
          });
          if (fontsToWait.size > 0) {
            try {
              await Promise.all(Array.from(fontsToWait).map(f => document.fonts.load(`16px "${f}"`)));
            } catch {}
          }
        }
        const elIds = new Set(allElements.map(e => e.id));

        existingObjects.forEach((obj: any) => {
          if (obj.id && !elIds.has(obj.id)) {
            canvas.remove(obj);
          }
        });

        const existingElMap = new Map<string, any>();
        existingObjects.forEach((o: any) => { if (o.id) existingElMap.set(o.id, o); });

        const needsRebuild = (el: CanvasElement, existingObj: any) => {
          if (el.type === 'text') {
            const oldFill = existingObj._lastFill || '';
            const newFill = el.fill || '';
            const oldIsGrad = oldFill.includes('gradient');
            const newIsGrad = newFill.includes('gradient');
            if (oldIsGrad !== newIsGrad || (newIsGrad && oldFill !== newFill)) {
              return true;
            }
            return false;
          }
          if (el.type === 'table') {
            const oldTableJSON = existingObj._tableDataJSON;
            const newTableJSON = JSON.stringify(el.tableData || {});
            const oldW = (existingObj.width || 1) * Math.abs(existingObj.scaleX || 1);
            return oldTableJSON !== newTableJSON || Math.abs(el.width - oldW) > 2 || Math.abs((existingObj.scaleX || 1) - 1) > 0.05;
          }
          if (el.type === 'shape' || el.type === 'comment') {
            const oldFill = existingObj._lastFill || existingObj.fill || '';
            const newFill = el.fill || '';
            const oldStroke = existingObj.stroke || '';
            const newStroke = el.stroke || '';
            const oldShapeType = existingObj._shapeType || '';
            const newShapeType = el.shapeType || '';
            const oldH = (existingObj.height || 0) * (existingObj.scaleY || 1);
            const oldW = (existingObj.width || 0) * (existingObj.scaleX || 1);
            if (oldShapeType !== newShapeType || oldFill !== newFill || oldStroke !== newStroke || Math.abs(el.height - oldH) > 1 || Math.abs(el.width - oldW) > 1) {
              return true;
            }
            return false;
          }
          if (el.type !== 'product-block') return false;
          const oldW = (existingObj.width || 1) * Math.abs(existingObj.scaleX || 1);
          const oldH = (existingObj.height || 1) * Math.abs(existingObj.scaleY || 1);
          
          const oldShowTitle = existingObj._showTitle ?? true;
          const oldShowPrice = existingObj._showPrice ?? true;
          const oldShowSKU = existingObj._showSKU ?? true;
          const oldVisibleParamsJSON = existingObj._visibleParamsJSON || '';
          const newShowTitle = catalog.showTitle !== false;
          const newShowPrice = catalog.showPrice !== false;
          const newShowSKU = catalog.showSKU !== false;
          const prodObj = products.find(p => p.id === el.productId);
          const catId = prodObj?.categoryId ? String(prodObj.categoryId) : '';
          const newVisibleParamsJSON = JSON.stringify(
            (catId && (
              catalog.categoryVisibleParams?.[catId] ||
              catalog.categoryVisibleParams?.[prodObj?.categoryId as string] ||
              Object.entries(catalog.categoryVisibleParams || {}).find(([k]) => String(k) === catId)?.[1]
            )) || []
          );

          const oldFontFamily = existingObj._fontFamily || '';
          const oldCardTheme = existingObj._cardTheme || '';
          const newFontFamily = (el as any).fontFamily || (catalog as any).fontFamily || '';
          const newCardTheme = (el as any).cardTheme || '';

          return el.productId !== existingObj._productId || el.src !== existingObj._src ||
            Math.abs(el.width - oldW) > 5 || Math.abs(el.height - oldH) > 5 ||
            oldShowTitle !== newShowTitle || oldShowPrice !== newShowPrice || oldShowSKU !== newShowSKU ||
            oldVisibleParamsJSON !== newVisibleParamsJSON ||
            oldFontFamily !== newFontFamily || oldCardTheme !== newCardTheme;
        };

        const getEffectiveZIndex = (el: CanvasElement, idx: number) => {
          const isHdr = headerElements?.some(h => h.id === el.id);
          if (isHdr) {
            return 1000 + (el.zIndex !== undefined ? el.zIndex : idx);
          }
          const isFtr = footerElements?.some(f => f.id === el.id);
          if (isFtr) {
            return 2000 + (el.zIndex !== undefined ? el.zIndex : idx);
          }
          return el.zIndex !== undefined ? el.zIndex : idx;
        };

        const objectPromises = allElements.map(async (el: CanvasElement, elIdx: number) => {
          const isHdr = headerElements?.some(h => h.id === el.id);
          const isFtr = footerElements?.some(f => f.id === el.id);
          const isLockedGlobal = isHdr || isFtr;
          const existingObj = existingElMap.get(el.id);

          if (existingObj) {
            const isActiveObj = canvas.getActiveObjects().includes(existingObj);
            const isTableRebuild = el.type === 'table' && needsRebuild(el, existingObj);
            const isProductRebuild = el.type === 'product-block' && needsRebuild(el, existingObj);
            const isShapeRebuild = (el.type === 'shape' || el.type === 'comment') && needsRebuild(el, existingObj);

            if (isTableRebuild || isProductRebuild || isShapeRebuild) {
              if (isActiveObj) {
                canvas.discardActiveObject();
              }
              canvas.remove(existingObj);
            } else {
              const isCurrentlyEditing = isActive && el.id === editingId;
              existingObj.set({
                opacity: isCurrentlyEditing ? 0 : (el.opacity ?? 1),
                visible: isCurrentlyEditing ? false : (el.visible !== false),
                selectable: !isLockedGlobal && isActive && !el.locked && !isCurrentlyEditing,
                evented: !isLockedGlobal && isActive && !el.locked && !isCurrentlyEditing,
              });

              if (isLockedGlobal) {
                existingObj.set({
                  hasControls: false,
                  hasBorders: false,
                  lockMovementX: true,
                  lockMovementY: true,
                  lockRotation: true,
                  lockScalingX: true,
                  lockScalingY: true,
                  hoverCursor: 'default'
                });
              } else {
                applyCanvaSelectionStyle(existingObj);
              }

              if (!isActiveObj) {
                existingObj.set({ left: el.x, top: el.y, angle: el.rotation || 0 });
              }

              if (el.type === 'text') {
                let parsedText = resolveDynamicText((el.text || '').replace(/<[^>]*>/g, ''), dynamicContext);
                existingObj.set({
                  text: parsedText,
                  fontSize: el.fontSize || 16,
                  fontFamily: el.fontFamily || catalog?.fontFamily || 'Inter',
                  fontWeight: el.fontWeight || 'normal',
                  fontStyle: el.fontStyle || 'normal',
                  fill: el.fill || '#000000',
                  textAlign: el.textAlign || 'left',
                  lineHeight: el.lineHeight || 1.2,
                  underline: el.textDecoration?.includes('underline') || false,
                  charSpacing: el.letterSpacing || 0,
                  objectCaching: false,
                });
                existingObj._lastFill = el.fill || '';
                if (!isActiveObj) {
                  let safeW = el.width || 100;
                  if (!el.width && !parsedText.includes('\n')) {
                    const naturalW = (existingObj as any).calcTextWidth ? (existingObj as any).calcTextWidth() : 0;
                    if (naturalW > 0) {
                      safeW = Math.ceil(naturalW + 10);
                    }
                  }
                  existingObj.set({
                    width: safeW,
                    scaleX: 1,
                    scaleY: 1,
                  });
                }
                if (existingObj.initDimensions) {
                  existingObj.initDimensions();
                }
                existingObj.dirty = true;
              } else if (el.type === 'shape' || el.type === 'comment') {
                existingObj.set({
                  fill: el.fill || '#ffffff', stroke: el.stroke || undefined,
                  strokeWidth: el.strokeWidth || 0,
                });
                if (!isActiveObj) {
                  existingObj.set({ width: el.width, height: el.height, scaleX: 1, scaleY: 1 });
                  if (el.shapeType === 'circle' && existingObj instanceof Circle) {
                    existingObj.set({ radius: Math.min(el.width, el.height) / 2 });
                  }
                }
              } else if (el.type === 'image') {
                if (!isActiveObj) {
                  const unscaledW = (existingObj as any).width || 1;
                  const unscaledH = (existingObj as any).height || 1;
                  existingObj.set({ scaleX: el.width / unscaledW, scaleY: el.height / unscaledH });
                }
              } else if (el.type === 'product-block') {
                existingObj._productId = el.productId;
                existingObj._src = el.src;
                if (!isActiveObj) {
                  const unscaledW = (existingObj as any).width || 1;
                  const unscaledH = (existingObj as any).height || 1;
                  existingObj.set({ scaleX: el.width / unscaledW, scaleY: el.height / unscaledH });
                }
                existingObj.set('zIndex', getEffectiveZIndex(el, elIdx));
                existingObj.setCoords();
                existingObj.dirty = true;
                return existingObj;
              }

              existingObj.set('zIndex', getEffectiveZIndex(el, elIdx));
              existingObj._groupId = el.groupId || undefined;
              existingObj.setCoords();
              existingObj.dirty = true;
              return existingObj;
            }
          }

          const tempEl = { ...el };
          if (tempEl.type === 'text' && tempEl.text) {
            tempEl.text = resolveDynamicText(tempEl.text, dynamicContext);
          }
          const obj = await elementToFabricObject(tempEl, products, catalog);
          if (obj) {
            const isCurrentlyEditing = isActive && el.id === editingId;
            obj.set('zIndex', getEffectiveZIndex(el, elIdx));
            obj.set({
              opacity: isCurrentlyEditing ? 0 : (el.opacity ?? 1),
              visible: isCurrentlyEditing ? false : (el.visible !== false),
              selectable: !isLockedGlobal && isActive && !el.locked && !isCurrentlyEditing,
              evented: !isLockedGlobal && isActive && !el.locked && !isCurrentlyEditing,
            });
            if (isLockedGlobal) {
              obj.set({
                hasControls: false,
                hasBorders: false,
                lockMovementX: true,
                lockMovementY: true,
                lockRotation: true,
                lockScalingX: true,
                lockScalingY: true,
                hoverCursor: 'default'
              });
            } else {
              applyCanvaSelectionStyle(obj);
            }
            if (el.type === 'product-block') {
              obj._productId = el.productId;
              obj._src = el.src;
              obj._showTitle = catalog.showTitle !== false;
              obj._showPrice = catalog.showPrice !== false;
              obj._showSKU = catalog.showSKU !== false;
              const prod = products.find(p => p.id === el.productId);
              const catId = prod?.categoryId ? String(prod.categoryId) : '';
              obj._visibleParamsJSON = JSON.stringify(
                (catId && (
                  Object.entries(catalog.categoryVisibleParams || {}).find(([k]) => String(k) === catId)?.[1]
                )) || []
              );
              obj._fontFamily = (el as any).fontFamily || (catalog as any).fontFamily || '';
              obj._cardTheme = (el as any).cardTheme || '';
            } else if (el.type === 'table') {
              obj._tableDataJSON = JSON.stringify(el.tableData || {});
            } else if (el.type === 'text') {
              obj._lastFill = el.fill || '';
            } else if (el.type === 'shape' || el.type === 'comment') {
              obj._shapeType = el.shapeType || '';
            }
            obj._groupId = el.groupId || undefined;
          }
          return obj;
        });

        const resolvedObjects = await Promise.all(objectPromises);
        if (!isCurrent) return;

        const validObjects = resolvedObjects.filter(Boolean);
        const currentCanvasObjects = canvas.getObjects();

        // Deduplication guard: async render cycles can race, causing two Fabric objects
        // for the same element ID. Build a set of IDs we're about to place, then remove
        // any stale duplicates already on the canvas before adding the fresh ones.
        const validIdSet = new Set<string>();
        validObjects.forEach((obj: any) => { if (obj.id) validIdSet.add(obj.id); });

        currentCanvasObjects.forEach((canvasObj: any) => {
          if (canvasObj.id && validIdSet.has(canvasObj.id) && !validObjects.includes(canvasObj)) {
            canvas.remove(canvasObj);
          }
        });

        validObjects.forEach((obj) => {
          applyCanvaSelectionStyle(obj);
          // Re-check after dedup removal
          if (!canvas.getObjects().includes(obj)) {
            canvas.add(obj);
          }
        });

        // Restore active selection if the active table/element was rebuilt, but never select the object currently being edited in HTML overlay
        // Read selectedElementIds fresh from the store to avoid stale closure issues during paste
        // Also merge savedActiveIds from the pre-render ActiveSelection discard
        const freshSelectedIds = useStore.getState().selectedElementIds || [];
        const mergedSelectedIds = savedActiveIds.length > 0
          ? Array.from(new Set([...freshSelectedIds, ...savedActiveIds]))
          : freshSelectedIds;
        if (isActive && mergedSelectedIds.length > 0) {
          const selectableIds = mergedSelectedIds.filter(id => id !== editingId);
          const selectedObjs = validObjects.filter((o: any) => o && o.id && selectableIds.includes(o.id));
          const currentActive = canvas.getActiveObjects();
          if (selectedObjs.length > 0 && (!currentActive.length || !selectedObjs.every(o => currentActive.includes(o)))) {
            if (selectedObjs.length === 1) {
              applyCanvaSelectionStyle(selectedObjs[0]);
              canvas.setActiveObject(selectedObjs[0]);
            } else if (selectedObjs.length > 1) {
              const sel = new ActiveSelection(selectedObjs, { canvas });
              applyCanvaSelectionStyle(sel);
              canvas.setActiveObject(sel);
            }
          }
        }

        // Update Spatial Index for high-performance snapping & culling
        globalSpatialIndex.clear();
        const boxes = validObjects.map((obj: any) => {
          const w = (obj.width || 0) * (obj.scaleX || 1);
          const h = (obj.height || 0) * (obj.scaleY || 1);
          return {
            id: obj.id || '',
            minX: obj.left || 0,
            minY: obj.top || 0,
            maxX: (obj.left || 0) + w,
            maxY: (obj.top || 0) + h,
            zIndex: obj.get?.('zIndex') || 0,
          };
        }).filter(b => !!b.id);
        globalSpatialIndex.insertMany(boxes);

        canvas._objects.sort((a: any, b: any) => (a.get('zIndex') || 0) - (b.get('zIndex') || 0));
        
        // Keep canvas background transparent so page sheet div provides the visual background,
        // and outer CANVAS_PAD padding stays transparent for bleed controls
        canvas.backgroundColor = 'transparent';
        canvas.renderAll();

        if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
          document.fonts.ready.then(() => {
            if (isCurrent && fabricCanvasRef.current) {
              fabricCanvasRef.current.requestRenderAll();
            }
          });
        }
      } catch (err) {
        console.error('FabricStage render error:', err);
      }
    };
    loadObjects();

    return () => {
      isCurrent = false;
    };
  }, [
    page.elements, page.type, page.backgroundColor, canvasBg, headerElements, footerElements,
    footerHeight, catalog?.footerHeight, catalog?.marginBottom,
    isActive, editingId, products, pageIdx, page.pageNumber, catalog?.showTitle, catalog?.showPrice, catalog?.showSKU,
    catalog?.fontFamily,
    JSON.stringify(catalog?.categoryVisibleParams)
  ]);

  useEffect(() => {
    const unsub = useStore.subscribe((newState, prevState) => {
      // Only the active page's FabricStage should react to selection changes.
      // Without this guard, every page's canvas fires discardActiveObject(),
      // wiping visually-rendered objects on inactive canvases during paste.
      if (!isActiveRef.current) return;

      const newIds = newState.selectedElementIds || [];
      const oldIds = prevState?.selectedElementIds || [];
      
      if (newIds !== oldIds) {
        if (fabricCanvasRef.current) {
          const canvas = fabricCanvasRef.current;
          const currentActiveIds = canvas.getActiveObjects().map((o: any) => o.id).filter(Boolean);
          if (newIds.length === 0) {
            canvas.discardActiveObject();
            canvas.requestRenderAll();
          } else if (JSON.stringify(currentActiveIds.sort()) !== JSON.stringify([...newIds].sort())) {
            if ((canvas as any)._currentTransform) return;
            canvas.discardActiveObject();
            const objsToSelect = canvas.getObjects().filter((o: any) => newIds.includes(o.id));
            if (objsToSelect.length === 1) {
              canvas.setActiveObject(objsToSelect[0]);
            } else if (objsToSelect.length > 1) {
              const sel = new ActiveSelection(objsToSelect, { canvas });
              canvas.setActiveObject(sel);
            }
            canvas.requestRenderAll();
          }
        }
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    const forceRender = () => {
      if (fabricCanvasRef.current) {
        const canvas = fabricCanvasRef.current;
        canvas.getObjects().forEach((obj: any) => {
          obj.dirty = true;
          if (obj.type === 'group') {
            obj._objects?.forEach((child: any) => { child.dirty = true; });
          }
        });
        canvas.renderAll();
      }
    };

    // Force re-render after fonts are loaded
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(forceRender);
    }

    // Fallback timeouts just in case
    const timer1 = setTimeout(forceRender, 200);
    const timer2 = setTimeout(forceRender, 1000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div style={{ width: curW * zoom, height: curH * zoom, position: 'relative' }}>
      <div
        style={{
          position: 'absolute',
          left: -CANVAS_PAD_X * zoom,
          top: -CANVAS_PAD_Y * zoom,
          width: (curW + CANVAS_PAD_X * 2) * zoom,
          height: (curH + CANVAS_PAD_Y * 2) * zoom,
          pointerEvents: isActive ? 'auto' : 'none',
        }}
      >
        <canvas ref={canvasRef} />
      </div>
      {/* Real-time spatial alignment guide overlays */}
      {activeGuides.map((guide, idx) => (
        <div
          key={`guide-${idx}`}
          style={{
            position: 'absolute',
            pointerEvents: 'none',
            zIndex: 9999,
            backgroundColor: '#d946ef', // Hot magenta guide line
            ...(guide.type === 'vertical'
              ? { left: `${guide.pos * zoom}px`, top: 0, width: '1px', height: '100%' }
              : { top: `${guide.pos * zoom}px`, left: 0, height: '1px', width: '100%' }),
          }}
        />
      ))}

      {/* Real-time Figma-style Equal Distance & Spacing Badges */}
      {activeDistanceBadges.map((badge, idx) => (
        <React.Fragment key={`badge-${idx}`}>
          {/* Dashed Connecting Line */}
          <div
            style={{
              position: 'absolute',
              pointerEvents: 'none',
              zIndex: 9999,
              borderStyle: 'dashed',
              borderColor: '#d946ef',
              ...(badge.type === 'vertical'
                ? {
                    left: `${badge.crossPos * zoom}px`,
                    top: `${badge.startPos * zoom}px`,
                    width: '0px',
                    height: `${(badge.endPos - badge.startPos) * zoom}px`,
                    borderLeftWidth: '1.5px',
                  }
                : {
                    top: `${badge.crossPos * zoom}px`,
                    left: `${badge.startPos * zoom}px`,
                    height: '0px',
                    width: `${(badge.endPos - badge.startPos) * zoom}px`,
                    borderTopWidth: '1.5px',
                  }),
            }}
          />

          {/* Magenta Gap / Padding Badge */}
          <div
            style={{
              position: 'absolute',
              pointerEvents: 'none',
              zIndex: 10000,
              backgroundColor: '#d946ef',
              color: '#ffffff',
              fontSize: '9px',
              fontWeight: 800,
              padding: '2px 5px',
              borderRadius: '9999px',
              transform: 'translate(-50%, -50%)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              letterSpacing: '0.02em',
              ...(badge.type === 'vertical'
                ? {
                    left: `${badge.crossPos * zoom}px`,
                    top: `${((badge.startPos + badge.endPos) / 2) * zoom}px`,
                  }
                : {
                    left: `${((badge.startPos + badge.endPos) / 2) * zoom}px`,
                    top: `${badge.crossPos * zoom}px`,
                  }),
            }}
          >
            {badge.displayValue}
          </div>
        </React.Fragment>
      ))}

      {/* Real-time Dimension Tooltip (w: ... h: ...) */}
      {activeDimensions && (
        <div
          style={{
            position: 'absolute',
            pointerEvents: 'none',
            zIndex: 10001,
            left: `${(activeDimensions.x + activeDimensions.w) * zoom + 12}px`,
            top: `${(activeDimensions.y + activeDimensions.h / 2) * zoom}px`,
            transform: 'translateY(-50%)',
            backgroundColor: '#1e293b',
            color: '#ffffff',
            fontSize: '10px',
            fontFamily: 'monospace',
            fontWeight: 700,
            padding: '3px 7px',
            borderRadius: '6px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.1)',
            whiteSpace: 'nowrap',
          }}
        >
          w: {activeDimensions.w} h: {activeDimensions.h}
        </div>
      )}
    </div>
  );
};

export default FabricStage;
