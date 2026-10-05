import { useEffect, useRef, MutableRefObject } from 'react';
import { Canvas, ActiveSelection, Circle, util, Point } from 'fabric';
import { useStore } from '../../../store/useStore';
import { PAGE_WIDTH, PAGE_HEIGHT } from '../../../constants';
import { CatalogPage, CanvasElement } from '../../../types';
import { SpatialIndex, DistanceBadge } from '../../../utils/spatialIndex';
import { applyCanvaSelectionStyle, renderCanvaHoverOutline } from '../../../utils/canvaControls';
import { applyTextEffectsToFabricObject } from '../fabricRenderer';

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

interface UseFabricEventsProps {
  canvas: Canvas | null;
  canvasRef: MutableRefObject<HTMLCanvasElement | null>;
  pageRef: MutableRefObject<CatalogPage>;
  pageIdxRef: MutableRefObject<number>;
  isActiveRef: MutableRefObject<boolean>;
  spatialIndexRef: MutableRefObject<SpatialIndex>;
  suppressSelectionClearedRef: MutableRefObject<boolean>;
  zoom: number;
  headerElements: CanvasElement[];
  footerElements: CanvasElement[];
  setActiveGuides: (guides: { type: 'horizontal' | 'vertical'; pos: number }[]) => void;
  setActiveDistanceBadges: (badges: DistanceBadge[]) => void;
  setActiveDimensions: (dim: { x: number; y: number; w: number; h: number } | null) => void;
}

export const useFabricEvents = ({
  canvas,
  canvasRef,
  pageRef,
  pageIdxRef,
  isActiveRef,
  spatialIndexRef,
  suppressSelectionClearedRef,
  zoom,
  headerElements,
  footerElements,
  setActiveGuides,
  setActiveDistanceBadges,
  setActiveDimensions,
}: UseFabricEventsProps) => {
  const {
    setSelectedElementIds,
    setIsPropertyPanelOpen,
    updateElement,
    updateElements,
    moveElementsBetweenPages,
    nudgeElement,
    pushHistory,
    catalog,
  } = useStore();

  const curW = PAGE_WIDTH;
  const curH = PAGE_HEIGHT;

  useEffect(() => {
    if (!canvas) return;

    // Helper: expand selection to include all elements sharing the same groupId
    const expandGroupSelection = (selectedIds: string[]) => {
      const currentPage = pageRef.current;
      if (!currentPage?.elements) return selectedIds;
      const groupIds = new Set<string>();
      selectedIds.forEach((id) => {
        const el = currentPage.elements.find((e) => e.id === id);
        if (el?.groupId) groupIds.add(el.groupId);
      });
      if (groupIds.size === 0) return selectedIds;
      const expandedIds = new Set(selectedIds);
      currentPage.elements.forEach((el) => {
        if (el.groupId && groupIds.has(el.groupId)) {
          expandedIds.add(el.id);
        }
      });
      return Array.from(expandedIds);
    };

    let _isExpandingGroup = false;

    canvas.on('selection:created', (e: any) => {
      if (_isExpandingGroup) return;
      const active = canvas.getActiveObject();
      if (active) {
        applyCanvaSelectionStyle(active);
        active.setCoords();
      }
      canvas.requestRenderAll();
      let ids = ((e.selected || []).map((o: any) => o.id).filter(Boolean) as string[]) || [];
      ids = expandGroupSelection(ids);
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
      if (ids.length > 0) {
        setIsPropertyPanelOpen(true);
      }
    });

    canvas.on('selection:updated', (e: any) => {
      if (_isExpandingGroup) return;
      const active = canvas.getActiveObject();
      if (active) {
        applyCanvaSelectionStyle(active);
        active.setCoords();
      }
      canvas.requestRenderAll();
      let ids = ((e.selected || []).map((o: any) => o.id).filter(Boolean) as string[]) || [];
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
      if (expandedIds.length > 0) {
        setIsPropertyPanelOpen(true);
      }
    });

    canvas.on('selection:cleared', () => {
      if (_isExpandingGroup) return;
      if (suppressSelectionClearedRef.current) return;
      setSelectedElementIds([]);
    });

    // Canva-style auto hover outline for unselected components
    let hoveredObject: any = null;

    canvas.on('mouse:move', (e: any) => {
      if (
        (canvas as any)._currentTransform ||
        (canvas as any).isDrawingMode ||
        (canvas as any)._isCurrentlyDrawingSelection
      ) {
        if (hoveredObject) {
          hoveredObject = null;
          canvas.requestRenderAll();
        }
        return;
      }

      let target = e.subTargets && e.subTargets.length > 0 ? e.subTargets[0] : e.target;
      if (target && target.group) {
        target = target.group;
      }

      const activeObj = canvas.getActiveObject();
      const activeObjs = canvas.getActiveObjects();
      const isAlreadyActive =
        target &&
        (target === activeObj ||
          activeObjs.includes(target) ||
          (target.group && (target.group === activeObj || activeObjs.includes(target.group))));

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

      if (!target) {
        canvas.discardActiveObject();
        canvas.requestRenderAll();
        setSelectedElementIds([]);
        return;
      }

      const actualTarget = target.group || target;
      if (actualTarget && actualTarget.id) {
        const currentSelected = useStore.getState().selectedElementIds || [];
        if (!currentSelected.includes(actualTarget.id)) {
          setSelectedElementIds([actualTarget.id]);
        }
      }
    });

    canvas.on('mouse:dblclick', (e: any) => {
      let obj = e.target;
      if (!obj && e.subTargets && e.subTargets.length > 0) {
        obj = e.subTargets[0];
      }
      const actualId = obj?.id || obj?.group?.id;
      if (actualId) {
        if (
          headerElements?.some((item) => item.id === actualId) ||
          footerElements?.some((item) => item.id === actualId)
        ) {
          return;
        }
        const el = pageRef.current.elements.find((item) => item.id === actualId);
        if (!el) return;

        if (el.sectionTag || el.id.startsWith('grid-sec-')) {
          const store = useStore.getState();
          store.setEditorTab('grid-studio');
          store.setSidebarExpanded(true);
          return;
        }

        if (el.type === 'image') {
          useStore.getState().startCropMode(el.id);
        } else if (el.type === 'video') {
          window.dispatchEvent(
            new CustomEvent('catalog:playVideo', {
              detail: { id: el.id, pageIndex: pageIdxRef.current },
            })
          );
        } else if (el.type === 'table') {
          window.dispatchEvent(
            new CustomEvent('catalog:editTable', {
              detail: { id: el.id, pageIndex: pageIdxRef.current },
            })
          );
        } else if (
          el.type === 'text' ||
          obj?.type === 'textbox' ||
          obj?.type === 'text' ||
          obj?.type === 'i-text' ||
          (el as any).shapeType === 'text'
        ) {
          window.dispatchEvent(
            new CustomEvent('catalog:editText', {
              detail: { id: el.id, pageIndex: pageIdxRef.current },
            })
          );
        } else if (el.type === 'product-block') {
          window.dispatchEvent(
            new CustomEvent('catalog:editProductCard', {
              detail: { id: el.id, pageIndex: pageIdxRef.current },
            })
          );
        }
      }
    });

    // Right-Click Context Menu Trigger
    let lastContextMenuTime = 0;
    const triggerContextMenu = (
      eventOrOpt: any,
      targetFromFabric?: any,
      subTargetsFromFabric?: any[]
    ) => {
      const now = Date.now();
      if (now - lastContextMenuTime < 150) return;
      lastContextMenuTime = now;

      const e =
        eventOrOpt && typeof eventOrOpt.clientX === 'number'
          ? eventOrOpt
          : eventOrOpt && eventOrOpt.e && typeof eventOrOpt.e.clientX === 'number'
          ? eventOrOpt.e
          : null;

      if (e) {
        e.preventDefault?.();
        e.stopPropagation?.();
        e.stopImmediatePropagation?.();
      }

      const clientX =
        e && typeof e.clientX === 'number' && e.clientX > 0
          ? e.clientX
          : lastRightClickPos.x || window.innerWidth / 2;
      const clientY =
        e && typeof e.clientY === 'number' && e.clientY > 0
          ? e.clientY
          : lastRightClickPos.y || window.innerHeight / 2;

      canvas.calcOffset();

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

      if (!target && e) {
        const targetInfo = canvas.findTarget(e) as any;
        if (targetInfo) {
          if (isValidFabricObj(targetInfo.target)) {
            target = targetInfo.target;
          } else if (isValidFabricObj(targetInfo)) {
            target = targetInfo;
          } else if (
            targetInfo.subTargets &&
            targetInfo.subTargets.length > 0 &&
            isValidFabricObj(targetInfo.subTargets[0])
          ) {
            target = targetInfo.subTargets[0];
          }
        }
      }

      const currentActive = canvas.getActiveObject();
      const currentActiveObjects = canvas.getActiveObjects();
      const isTargetInMultiSelection = target && currentActiveObjects.includes(target);
      const isMultiActive =
        currentActive instanceof ActiveSelection || currentActiveObjects.length > 1;

      if (!target && isMultiActive && isValidFabricObj(currentActive)) {
        target = currentActive;
      }

      if (
        target &&
        target.group &&
        !(target.group instanceof ActiveSelection) &&
        (target.group as any).id
      ) {
        target = target.group;
      }

      const isMultiSelectionTarget =
        target instanceof ActiveSelection || (isMultiActive && isTargetInMultiSelection);
      const isFabricElement =
        (target && isValidFabricObj(target) && target.id) || isMultiSelectionTarget;

      if (
        isFabricElement &&
        target.visible !== false &&
        target.selectable !== false &&
        target !== canvas.backgroundImage
      ) {
        if (isMultiSelectionTarget) {
          const activeIds = currentActiveObjects.map((o: any) => o.id).filter(Boolean);
          if (activeIds.length > 0) {
            setSelectedElementIds(activeIds);
          }
        } else {
          const isAlreadyActive =
            target === currentActive || currentActiveObjects.includes(target);
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

        window.dispatchEvent(
          new CustomEvent('catalog:openContextMenu', {
            detail: {
              x: clientX,
              y: clientY,
              type: 'element',
              pageIndex: pageIdxRef.current,
              targetId: target.id || (currentActiveObjects[0] as any)?.id,
            },
          })
        );
      } else {
        canvas.discardActiveObject();
        canvas.requestRenderAll();
        setSelectedElementIds([]);

        if (useStore.getState().currentPageIndex !== pageIdxRef.current) {
          useStore.getState().setCurrentPageIndex(pageIdxRef.current);
        }

        window.dispatchEvent(
          new CustomEvent('catalog:openContextMenu', {
            detail: {
              x: clientX,
              y: clientY,
              type: 'page',
              pageIndex: pageIdxRef.current,
            },
          })
        );
      }
    };

    canvas.on('contextmenu', (opt: any) => {
      triggerContextMenu(opt, opt?.target, opt?.subTargets);
    });

    const upperEl = canvas.upperCanvasEl;
    const handleNativeContextMenu = (e: MouseEvent) => {
      triggerContextMenu(e);
    };
    if (upperEl) {
      upperEl.addEventListener('contextmenu', handleNativeContextMenu);
    }

    let lastMovingPointer = { clientX: 0, clientY: 0 };
    canvas.on('object:moving', (e: any) => {
      if (e.e && (e.e.clientX || e.e.clientY)) {
        lastMovingPointer = { clientX: e.e.clientX, clientY: e.e.clientY };
      }
      const obj = e.target as any;
      const isMulti =
        obj &&
        (obj instanceof ActiveSelection ||
          obj.type === 'ActiveSelection' ||
          obj.type === 'activeSelection' ||
          'multiSelectionStacking' in obj);

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

        const activeMargins =
          catalog.showMargins !== false
            ? {
                top: catalog.marginTop || 0,
                bottom: curH - (catalog.marginBottom || 0),
                left: catalog.marginLeft || 0,
                right: curW - (catalog.marginRight || 0),
              }
            : undefined;

        const { snapX, snapY, guideLines, distanceBadges } =
          spatialIndexRef.current.findSnapTargets(currentBox, 6, activeMargins);
        if (snapX !== null) obj.set('left', snapX);
        if (snapY !== null) obj.set('top', snapY);
        setActiveGuides(guideLines);
        setActiveDistanceBadges(distanceBadges);
        setActiveDimensions({
          x: obj.left || 0,
          y: obj.top || 0,
          w: Math.round(objW),
          h: Math.round(objH),
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

        const activeMargins =
          catalog.showMargins !== false
            ? {
                top: catalog.marginTop || 0,
                bottom: curH - (catalog.marginBottom || 0),
                left: catalog.marginLeft || 0,
                right: curW - (catalog.marginRight || 0),
              }
            : undefined;

        const { snapX, snapY, guideLines, distanceBadges } =
          spatialIndexRef.current.findSnapTargets(currentBox, 6, activeMargins);
        if (snapX !== null) obj.set('left', snapX + objW / 2);
        if (snapY !== null) obj.set('top', snapY + objH / 2);
        setActiveGuides(guideLines);
        setActiveDistanceBadges(distanceBadges);
        setActiveDimensions({
          x: Math.round((obj.left || 0) - objW / 2),
          y: Math.round((obj.top || 0) - objH / 2),
          w: Math.round(objW),
          h: Math.round(objH),
        });
      }
    });

    const updateDimensionsTooltip = (obj: any) => {
      if (!obj) return;
      const isMulti =
        obj instanceof ActiveSelection ||
        obj.type === 'ActiveSelection' ||
        obj.type === 'activeSelection' ||
        'multiSelectionStacking' in obj;
      const sx = Math.abs(obj.scaleX || 1);
      const sy = Math.abs(obj.scaleY || 1);
      const objW = (obj.width || 0) * sx;
      const objH = (obj.height || 0) * sy;

      let left = obj.left || 0;
      let top = obj.top || 0;
      if (isMulti || obj.originX === 'center') left = left - objW / 2;
      if (isMulti || obj.originY === 'center') top = top - objH / 2;
      setActiveDimensions({
        x: Math.round(left),
        y: Math.round(top),
        w: Math.round(objW),
        h: Math.round(objH),
      });
    };

    canvas.on('object:scaling', (e: any) => updateDimensionsTooltip(e.target));
    canvas.on('object:resizing', (e: any) => updateDimensionsTooltip(e.target));

    canvas.on('object:modified', (e: any) => {
      const obj = e.target as any;
      const isMulti =
        obj instanceof ActiveSelection ||
        obj.type === 'ActiveSelection' ||
        obj.type === 'activeSelection' ||
        'multiSelectionStacking' in obj;

      const clientX =
        e.e && typeof e.e.clientX === 'number' && e.e.clientX > 0
          ? e.e.clientX
          : lastMovingPointer.clientX;
      const clientY =
        e.e && typeof e.e.clientY === 'number' && e.e.clientY > 0
          ? e.e.clientY
          : lastMovingPointer.clientY;

      const getTargetPageFromPointer = (cx: number, cy: number) => {
        if (!cx || !cy) return null;
        const allWrappers = Array.from(
          document.querySelectorAll('[data-page-index]')
        ) as HTMLElement[];
        for (const wrapper of allWrappers) {
          const pIdxAttr = wrapper.getAttribute('data-page-index');
          const pageIdxNum = pIdxAttr !== null ? parseInt(pIdxAttr, 10) : -1;
          if (pageIdxNum < 0) continue;

          const sheetEl = (wrapper.querySelector('.bg-white') as HTMLElement | null) || wrapper;
          const rect = sheetEl.getBoundingClientRect();
          if (
            cx >= rect.left &&
            cx <= rect.right &&
            cy >= rect.top &&
            cy <= rect.bottom
          ) {
            return {
              targetPageIndex: pageIdxNum,
              sheetRect: rect,
            };
          }
        }
        return null;
      };

      const crossPageTarget = getTargetPageFromPointer(clientX, clientY);
      if (crossPageTarget && crossPageTarget.targetPageIndex !== pageIdxRef.current) {
        const targetIdx = crossPageTarget.targetPageIndex;
        const targetRect = crossPageTarget.sheetRect;

        if (isMulti) {
          const objects = obj.getObjects();
          const items: { id: string; x: number; y: number; updates?: any }[] = [];

          objects.forEach((child: any) => {
            if (!child.id) return;
            const isHeader = headerElements?.some((el) => el.id === child.id);
            const isFooter = footerElements?.some((el) => el.id === child.id);
            if (isHeader || isFooter) return;

            const matrix = child.calcTransformMatrix();
            const decomposed = util.qrDecompose(matrix);
            const normAngle = Math.round(((decomposed.angle % 360) + 360) % 360);
            const topLeft = util.transformPoint(
              new Point(-child.width / 2, -child.height / 2),
              matrix
            );

            const canvasRect = canvasRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
            const childScreenX = topLeft.x * zoom + canvasRect.left;
            const childScreenY = topLeft.y * zoom + canvasRect.top;
            const targetX = Math.round(
              Math.max(0, Math.min(curW - 20, (childScreenX - targetRect.left) / zoom))
            );
            const targetY = Math.round(
              Math.max(0, Math.min(curH - 20, (childScreenY - targetRect.top) / zoom))
            );

            items.push({
              id: child.id,
              x: targetX,
              y: targetY,
              updates: { rotation: normAngle },
            });
          });

          setActiveGuides([]);
          setActiveDistanceBadges([]);
          setActiveDimensions(null);

          if (items.length > 0) {
            const fromIdx = pageIdxRef.current;
            setTimeout(() => {
              try {
                canvas.discardActiveObject();
                canvas.requestRenderAll();
              } catch (e) {}
              moveElementsBetweenPages(fromIdx, targetIdx, items);
            }, 0);
          }
          return;
        } else if (obj && obj.id) {
          const isHeader = headerElements?.some((el) => el.id === obj.id);
          const isFooter = footerElements?.some((el) => el.id === obj.id);
          if (isHeader || isFooter) return;

          const el = pageRef.current.elements.find((e: CanvasElement) => e.id === obj.id);
          if (!el) return;

          const sx = Math.abs(obj.scaleX || 1);
          const sy = Math.abs(obj.scaleY || 1);
          const objW = (obj.width || el.width || 100) * sx;
          const objH = (obj.height || el.height || 100) * sy;
          const targetX = Math.round(
            Math.max(0, Math.min(curW - 20, (clientX - targetRect.left) / zoom - objW / 2))
          );
          const targetY = Math.round(
            Math.max(0, Math.min(curH - 20, (clientY - targetRect.top) / zoom - objH / 2))
          );

          const updates: any = {
            rotation: Math.round(obj.angle || 0),
            width: Math.round(objW),
            height: Math.round(objH),
          };

          const singleItem = [
            {
              id: obj.id,
              x: targetX,
              y: targetY,
              updates,
            },
          ];

          setActiveGuides([]);
          setActiveDistanceBadges([]);
          setActiveDimensions(null);

          const fromIdx = pageIdxRef.current;
          setTimeout(() => {
            try {
              canvas.discardActiveObject();
              canvas.remove(obj);
              canvas.requestRenderAll();
            } catch (e) {}
            moveElementsBetweenPages(fromIdx, targetIdx, singleItem);
          }, 0);
          return;
        }
      }

      if (isMulti) {
        pushHistory();
        const objects = obj.getObjects();
        const isScaled =
          Math.abs((obj.scaleX || 1) - 1) > 0.001 || Math.abs((obj.scaleY || 1) - 1) > 0.001;
        const pageUpdates: { id: string; updates: any }[] = [];

        objects.forEach((child: any) => {
          if (!child.id) return;
          const isHeader = headerElements?.some((el) => el.id === child.id);
          const isFooter = footerElements?.some((el) => el.id === child.id);
          if (isHeader || isFooter) return;

          const el = pageRef.current.elements.find((e: CanvasElement) => e.id === child.id);
          const matrix = child.calcTransformMatrix();
          const decomposed = util.qrDecompose(matrix);
          const normAngle = Math.round(((decomposed.angle % 360) + 360) % 360);
          const topLeft = util.transformPoint(
            new Point(-child.width / 2, -child.height / 2),
            matrix
          );

          const updates: any = {
            x: Math.round(topLeft.x),
            y: Math.round(topLeft.y),
            rotation: normAngle,
          };

          if (isScaled) {
            const childSx = Math.abs(child.scaleX || 1);
            const childSy = Math.abs(child.scaleY || 1);

            if (
              child.type === 'i-text' ||
              child.type === 'text' ||
              child.type === 'FabricText' ||
              child.type === 'textbox'
            ) {
              const newFontSize = Math.max(
                6,
                Math.round((child.fontSize || el?.fontSize || 16) * childSx)
              );
              const newWidth = Math.max(
                20,
                Math.round((child.width || el?.width || 100) * childSx)
              );
              updates.fontSize = newFontSize;
              updates.width = newWidth;
              child.set({ fontSize: newFontSize, width: newWidth, scaleX: 1, scaleY: 1 });
              if (typeof child.initDimensions === 'function') child.initDimensions();
              child.setCoords();
            } else if (child instanceof Circle) {
              const newRadius = (child.radius || (el?.width ? el.width / 2 : 0)) * childSx;
              updates.width = Math.round(newRadius * 2);
              updates.height = Math.round(newRadius * 2);
            } else {
              updates.width = Math.round((child.width || el?.width || 0) * childSx);
              updates.height = Math.round((child.height || el?.height || 0) * childSy);
            }
          }

          pageUpdates.push({ id: child.id, updates });
        });

        if (pageUpdates.length > 0) {
          updateElements(pageIdxRef.current, pageUpdates);
        }
      } else if (obj && obj.id) {
        const isHeader = headerElements?.some((el) => el.id === obj.id);
        const isFooter = footerElements?.some((el) => el.id === obj.id);
        if (isHeader || isFooter) return;
        const el = pageRef.current.elements.find((e: CanvasElement) => e.id === obj.id);

        const isDivider =
          (typeof obj.id === 'string' &&
            (obj.id.includes('line') || obj.id.includes('div'))) ||
          el?.shapeType === 'line';
        let posX = obj.left || 0;
        let posY = obj.top || 0;
        if (obj.originX === 'center' || obj.originY === 'center' || isDivider) {
          if (typeof obj.calcTransformMatrix === 'function') {
            const matrix = obj.calcTransformMatrix();
            const topLeft = util.transformPoint(
              new Point(-obj.width / 2, -obj.height / 2),
              matrix
            );
            posX = topLeft.x;
            posY = topLeft.y;
          } else {
            const objW = (obj.width || 0) * Math.abs(obj.scaleX || 1);
            const objH = (obj.height || 0) * Math.abs(obj.scaleY || 1);
            posX = (obj.left || 0) - objW / 2;
            posY = (obj.top || 0) - objH / 2;
          }
        }

        const updates: any = {
          x: Math.round(posX),
          y: Math.round(posY),
          rotation: Math.round(obj.angle || 0),
        };
        const sx = Math.abs(obj.scaleX || 1);
        const sy = Math.abs(obj.scaleY || 1);

        if (el && el.type === 'text') {
          if (sx !== 1 || sy !== 1) {
            const newFontSize = Math.max(6, Math.round((obj.fontSize || el.fontSize || 16) * sx));
            const newWidth = Math.max(20, Math.round((obj.width || el.width || 100) * sx));
            updates.fontSize = newFontSize;
            updates.width = newWidth;
            obj.set({
              fontSize: newFontSize,
              width: newWidth,
              scaleX: 1,
              scaleY: 1,
            });
            if (typeof obj.initDimensions === 'function') obj.initDimensions();
            obj.setCoords();
          } else {
            updates.width = obj.width || el.width;
            if (obj.fontSize !== undefined) {
              updates.fontSize = obj.fontSize;
            }
          }
          updates.height = obj.height || el.height;
        } else if (obj instanceof Circle) {
          const newRadius = (obj.radius || (el?.width ? el.width / 2 : 0)) * sx;
          updates.width = newRadius * 2;
          updates.height = newRadius * 2;
          obj.set({
            radius: newRadius,
            scaleX: 1,
            scaleY: 1,
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
            scaleY: 1,
          });
          obj.setCoords();
        } else if (el && (el.type === 'image' || el.type === 'video')) {
          const newW = Math.round((obj.width || el.width || 0) * sx);
          const newH = Math.round((obj.height || el.height || 0) * sy);
          updates.width = newW;
          updates.height = newH;
          if (obj.cropX !== undefined) updates.cropX = Math.round(obj.cropX);
          if (obj.cropY !== undefined) updates.cropY = Math.round(obj.cropY);
          if (obj.cropWidth !== undefined) updates.cropWidth = Math.round(obj.cropWidth);
          if (obj.cropHeight !== undefined) updates.cropHeight = Math.round(obj.cropHeight);
          if (obj.naturalWidth !== undefined) updates.naturalWidth = obj.naturalWidth;
          if (obj.naturalHeight !== undefined) updates.naturalHeight = obj.naturalHeight;
          delete obj._cropTransformStart;
          obj.set({
            width: newW,
            height: newH,
            scaleX: 1,
            scaleY: 1,
          });
          obj.setCoords();
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
      if (upperEl) {
        upperEl.removeEventListener('contextmenu', handleNativeContextMenu);
      }
    };
  }, [canvas, zoom, curW, curH]);

  // Keyboard arrow keys nudge handler
  useEffect(() => {
    if (!isActiveRef.current) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement as HTMLElement;
      const isInput =
        activeEl?.tagName === 'INPUT' ||
        activeEl?.tagName === 'TEXTAREA' ||
        activeEl?.isContentEditable;
      if (isInput) return;

      if (!canvas) return;

      const activeObj = canvas.getActiveObject() as any;
      if (!activeObj) return;
      if (activeObj.isEditing) return;

      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;

      e.preventDefault();

      const nudge = e.shiftKey ? 10 : 1;
      let dx = 0;
      let dy = 0;

      if (e.key === 'ArrowUp') dy = -nudge;
      else if (e.key === 'ArrowDown') dy = nudge;
      else if (e.key === 'ArrowLeft') dx = -nudge;
      else if (e.key === 'ArrowRight') dx = nudge;

      const isMulti =
        activeObj instanceof ActiveSelection ||
        activeObj.type === 'ActiveSelection' ||
        activeObj.type === 'activeSelection';

      if (isMulti) {
        activeObj.set({
          left: (activeObj.left || 0) + dx,
          top: (activeObj.top || 0) + dy,
        });
        activeObj.setCoords();

        const objects = (
          typeof activeObj.getObjects === 'function' ? activeObj.getObjects() : []
        ) as any[];
        const updates: { id: string; updates: any }[] = [];
        objects.forEach((child: any) => {
          if (!child.id) return;
          const el = pageRef.current.elements.find((item: CanvasElement) => item.id === child.id);
          if (el && !el.locked) {
            updates.push({
              id: child.id,
              updates: { x: el.x + dx, y: el.y + dy },
            });
          }
        });
        if (updates.length > 0) {
          if (!e.repeat) pushHistory();
          updateElements(pageIdxRef.current, updates);
        }
      } else if (activeObj && activeObj.id) {
        const isHeader = headerElements?.some((el) => el.id === activeObj.id);
        const isFooter = footerElements?.some((el) => el.id === activeObj.id);
        if (isHeader || isFooter) return;

        const el = pageRef.current.elements.find((item: CanvasElement) => item.id === activeObj.id);
        if (el && !el.locked) {
          activeObj.set({
            left: (activeObj.left || 0) + dx,
            top: (activeObj.top || 0) + dy,
          });
          activeObj.setCoords();

          if (!e.repeat) pushHistory();
          nudgeElement(pageIdxRef.current, activeObj.id, dx, dy);
        }
      }

      canvas.requestRenderAll();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [canvas, updateElements, nudgeElement, pushHistory, headerElements, footerElements]);

  // Synchronous, zero-latency real-time preview listener for typography, sliders, and color controls
  useEffect(() => {
    const handleLiveUpdate = (e: Event) => {
      const { id, updates } = (e as CustomEvent).detail || {};
      if (!id || !updates || !isActiveRef.current || !canvas) return;

      let obj = canvas.getObjects().find((o: any) => o.id === id);
      if (!obj) {
        const activeObj = canvas.getActiveObject() as any;
        if (activeObj?.id === id) {
          obj = activeObj;
        } else if (typeof activeObj?.getObjects === 'function') {
          obj = activeObj.getObjects().find((o: any) => o.id === id);
        }
      }
      if (!obj) return;

      const isTextType =
        obj.type === 'textbox' ||
        obj.type === 'text' ||
        obj.type === 'i-text' ||
        obj.type === 'FabricText' ||
        obj.type?.toLowerCase().includes('text') ||
        typeof (obj as any)._renderText === 'function';

      if (isTextType) {
        if (updates.letterSpacing !== undefined) {
          const fontSize = updates.fontSize || obj.fontSize || 16;
          obj.set('charSpacing', Math.round((updates.letterSpacing / fontSize) * 1000));
        }
        if (updates.lineHeight !== undefined) {
          obj.set('lineHeight', updates.lineHeight);
        }
        if (updates.fontSize !== undefined) {
          obj.set('fontSize', updates.fontSize);
          if (updates.width !== undefined) {
            obj.set('width', updates.width);
          }
        }
        if (updates.fontFamily !== undefined) {
          obj.set('fontFamily', updates.fontFamily);
        }
        if (updates.fontWeight !== undefined) {
          obj.set('fontWeight', updates.fontWeight);
        }
        if (updates.fontStyle !== undefined) {
          obj.set('fontStyle', updates.fontStyle);
        }
        if (updates.textAlign !== undefined) {
          obj.set('textAlign', updates.textAlign);
        }
        if (updates.text !== undefined) {
          obj.set('text', updates.text);
        }
        if (updates.textDecoration !== undefined) {
          obj.set('underline', updates.textDecoration.includes('underline'));
          obj.set('linethrough', updates.textDecoration.includes('line-through'));
        }

        applyTextEffectsToFabricObject(obj, { ...obj, ...updates } as any);

        if (typeof (obj as any)._clearCache === 'function') {
          (obj as any)._clearCache();
        }
        if (typeof (obj as any).initDimensions === 'function') {
          (obj as any).initDimensions();
        }
      }

      if (updates.fill !== undefined) {
        obj.set('fill', updates.fill);
      }
      if (updates.opacity !== undefined) {
        obj.set('opacity', updates.opacity);
      }

      obj.dirty = true;
      obj.setCoords();
      canvas.requestRenderAll();
    };

    window.addEventListener('catalog:liveUpdateElement', handleLiveUpdate);
    return () => window.removeEventListener('catalog:liveUpdateElement', handleLiveUpdate);
  }, [canvas]);
};
