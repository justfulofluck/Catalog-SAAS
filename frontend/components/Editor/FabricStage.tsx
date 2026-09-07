import React, { useEffect, useRef, useState } from 'react';
import { Canvas, Circle, ActiveSelection, config, util, Point } from 'fabric';
import { useStore } from '../../store/useStore';
import { PAGE_WIDTH, PAGE_HEIGHT } from '../../constants';
import { CatalogPage, CanvasElement } from '../../types';
import { elementToFabricObject } from './fabricRenderer';
import { globalSpatialIndex, DistanceBadge } from '../../utils/spatialIndex';

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

const FabricStage: React.FC<Props> = ({ page, pageIdx, isActive, zoom, canvasBg, headerElements = [], footerElements = [], footerHeight = 38, editingId = null }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);
  const renderThrottleRef = useRef<number | null>(null);
  const [activeGuides, setActiveGuides] = useState<{ type: 'horizontal' | 'vertical'; pos: number }[]>([]);
  const [activeDistanceBadges, setActiveDistanceBadges] = useState<DistanceBadge[]>([]);
  const [activeDimensions, setActiveDimensions] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const { setSelectedElementIds, updateElement, updateElements, pushHistory, catalog } = useStore();
  const products = useStore((state) => state.products);

  const curW = PAGE_WIDTH;
  const curH = PAGE_HEIGHT;

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new Canvas(canvasRef.current, {
      width: curW * zoom,
      height: curH * zoom,
      backgroundColor: page.backgroundColor || canvasBg,
      selection: true, // Enable click-and-drag area marquee multi-selection
      selectionColor: 'rgba(99, 102, 241, 0.15)', // Translucent indigo selection box
      selectionBorderColor: '#6366f1', // Solid indigo border
      selectionLineWidth: 1.5,
      preserveObjectStacking: true,
      enableRetinaScaling: true,
    });
    canvas.setZoom(zoom);

    fabricCanvasRef.current = canvas;

    canvas.on('selection:created', (e: any) => {
      const ids = (e.selected || []).map((o: any) => o.id).filter(Boolean) as string[] || [];
      setSelectedElementIds(ids);
    });

    canvas.on('selection:updated', (e: any) => {
      const ids = (e.selected || []).map((o: any) => o.id).filter(Boolean) as string[] || [];
      setSelectedElementIds(ids);
    });

    canvas.on('selection:cleared', () => setSelectedElementIds([]));

    canvas.on('mouse:down', () => {
      canvas.calcOffset();
      if (useStore.getState().currentPageIndex !== pageIdx) {
        useStore.getState().setCurrentPageIndex(pageIdx);
      }
    });

    canvas.on('mouse:dblclick', (e: any) => {
      const obj = e.target;
      if (obj && obj.id) {
        const el = page.elements.find(item => item.id === obj.id) ||
                   headerElements?.find(item => item.id === obj.id) ||
                   footerElements?.find(item => item.id === obj.id);
        if (el && el.type === 'text') {
          window.dispatchEvent(new CustomEvent('catalog:editText', { detail: { id: el.id, pageIndex: pageIdx } }));
        } else if (el && (el.type === 'table' || el.tableData)) {
          useStore.getState().setIsTableEditorOpen(true, el.id);
          window.dispatchEvent(new CustomEvent('catalog:editTable', { detail: { id: el.id, pageIndex: pageIdx } }));
        }
      }
    });

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

        const { snapX, snapY, guideLines, distanceBadges } = globalSpatialIndex.findSnapTargets(currentBox, 6);
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

        const { snapX, snapY, guideLines, distanceBadges } = globalSpatialIndex.findSnapTargets(currentBox, 6);
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
          const updates = { x: obj.left || 0, y: obj.top || 0 };
          
          if (isHeader) useStore.getState().updateHeaderElement(obj.id, updates);
          else if (isFooter) useStore.getState().updateFooterElement(obj.id, updates);
          else updateElement(pageIdx, obj.id, updates);
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
          h: Math.round(objH)
        });
      }
    });

    canvas.on('object:modified', (e: any) => {
      setActiveGuides([]);
      setActiveDistanceBadges([]);
      setActiveDimensions(null);
      dragTimer = null;
      const obj = e.target as any;

      const isMulti = obj && (
        obj instanceof ActiveSelection ||
        obj.type === 'ActiveSelection' ||
        obj.type === 'activeSelection' ||
        'multiSelectionStacking' in obj
      );

      if (isMulti) {
        pushHistory();
        const objects = obj.getObjects();
        const isScaled = Math.abs((obj.scaleX || 1) - 1) > 0.001 || Math.abs((obj.scaleY || 1) - 1) > 0.001;
        const pageUpdates: { id: string; updates: any }[] = [];

        objects.forEach((child: any) => {
          if (!child.id) return;
          
          const isHeader = headerElements?.some(el => el.id === child.id);
          const isFooter = footerElements?.some(el => el.id === child.id);
          const el = page.elements.find((e: CanvasElement) => e.id === child.id) ||
                     headerElements?.find(e => e.id === child.id) ||
                     footerElements?.find(e => e.id === child.id);
          
          const matrix = child.calcTransformMatrix();
          const decomposed = util.qrDecompose(matrix);
          const normAngle = Math.round(((decomposed.angle % 360) + 360) % 360);

          // Absolute origin position on canvas for originX: 'left', originY: 'top'
          const canvasOrigin = new Point(0, 0).transform(matrix);

          const updates: any = {
            x: Math.round(canvasOrigin.x),
            y: Math.round(canvasOrigin.y),
            rotation: normAngle,
          };
          
          if (isScaled) {
            const childSx = Math.abs(decomposed.scaleX);
            const childSy = Math.abs(decomposed.scaleY);

            if (el && el.type === 'text') {
              const newWidth = Math.max(20, (child.width || el.width) * childSx);
              updates.width = Math.round(newWidth);
              updates.height = child.height || el.height;
            } else if (child instanceof Circle) {
              const newRadius = (child.radius || (el?.width ? el.width / 2 : 0)) * childSx;
              updates.width = Math.round(newRadius * 2);
              updates.height = Math.round(newRadius * 2);
            } else {
              updates.width = Math.round((child.width || (el?.width || 0)) * childSx);
              updates.height = Math.round((child.height || (el?.height || 0)) * childSy);
            }
          }
          
          if (isHeader) {
            useStore.getState().updateHeaderElement(child.id, updates);
          } else if (isFooter) {
            useStore.getState().updateFooterElement(child.id, updates);
          } else {
            pageUpdates.push({ id: child.id, updates });
          }
        });

        if (pageUpdates.length > 0) {
          updateElements(pageIdx, pageUpdates);
        }
      } else if (obj && obj.id) {
        const isHeader = headerElements?.some(el => el.id === obj.id);
        const isFooter = footerElements?.some(el => el.id === obj.id);
        const el = page.elements.find((e: CanvasElement) => e.id === obj.id) ||
                   headerElements?.find(e => e.id === obj.id) ||
                   footerElements?.find(e => e.id === obj.id);
        
        const updates: any = { x: obj.left || 0, y: obj.top || 0, rotation: obj.angle || 0 };
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
        
        if (isHeader) useStore.getState().updateHeaderElement(obj.id, updates);
        else if (isFooter) useStore.getState().updateFooterElement(obj.id, updates);
        else updateElement(pageIdx, obj.id, updates);
      }
    });

    return () => {
      if (renderThrottleRef.current) clearTimeout(renderThrottleRef.current);
      if (dragTimer) clearTimeout(dragTimer);
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
  }, [curW, curH]);

  useEffect(() => {
    if (!fabricCanvasRef.current) return;
    const canvas = fabricCanvasRef.current;
    canvas.setDimensions({ width: curW * zoom, height: curH * zoom });
    canvas.setZoom(zoom);
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
        const existingObjects = canvas.getObjects();
        const formattedFooterElements = (footerElements || []).map((el: any) => ({
          ...el,
          y: (el.y || 0) + (el.y < 200 ? PAGE_HEIGHT - footerHeight : 0),
          text: el.type === 'text' && el.text?.includes('{{page}}')
            ? el.text.replace(/\{\{page\}\}/gi, String(page.pageNumber || pageIdx + 1))
            : el.text
        }));
        const allElements = [
          ...page.elements,
          ...(headerElements || []),
          ...formattedFooterElements
        ];
        const elIds = new Set(allElements.map(e => e.id));

        existingObjects.forEach((obj: any) => {
          if (obj.id && !elIds.has(obj.id)) {
            canvas.remove(obj);
          }
        });

        const existingElMap = new Map<string, any>();
        existingObjects.forEach((o: any) => { if (o.id) existingElMap.set(o.id, o); });

        const needsRebuild = (el: CanvasElement, existingObj: any) => {
          if (el.type === 'table') {
            const oldTableJSON = existingObj._tableDataJSON;
            const newTableJSON = JSON.stringify(el.tableData || {});
            const oldW = (existingObj.width || 1) * Math.abs(existingObj.scaleX || 1);
            return oldTableJSON !== newTableJSON || Math.abs(el.width - oldW) > 2 || Math.abs((existingObj.scaleX || 1) - 1) > 0.05;
          }
          if (el.type !== 'product-block') return false;
          const oldW = (existingObj.width || 1) * Math.abs(existingObj.scaleX || 1);
          const oldH = (existingObj.height || 1) * Math.abs(existingObj.scaleY || 1);
          
          const oldShowTitle = existingObj._showTitle ?? true;
          const oldShowPrice = existingObj._showPrice ?? true;
          const oldShowSKU = existingObj._showSKU ?? true;
          const newShowTitle = catalog.showTitle !== false;
          const newShowPrice = catalog.showPrice !== false;
          const newShowSKU = catalog.showSKU !== false;

          return el.productId !== existingObj._productId || el.src !== existingObj._src ||
            Math.abs(el.width - oldW) > 5 || Math.abs(el.height - oldH) > 5 ||
            oldShowTitle !== newShowTitle || oldShowPrice !== newShowPrice || oldShowSKU !== newShowSKU;
        };

        const objectPromises = allElements.map(async (el: CanvasElement) => {
          if (el.locked && !isActive) return null;

          const existingObj = existingElMap.get(el.id);

          if (existingObj) {
            const isActiveObj = canvas.getActiveObjects().includes(existingObj);
            const isTableRebuild = el.type === 'table' && !isActiveObj && needsRebuild(el, existingObj);
            const isProductRebuild = el.type === 'product-block' && !isActiveObj && needsRebuild(el, existingObj);

            if (isTableRebuild || isProductRebuild) {
              if (isActiveObj) {
                canvas.discardActiveObject();
              }
              canvas.remove(existingObj);
            } else {
              const isCurrentlyEditing = isActive && el.id === editingId;
              existingObj.set({
                opacity: isCurrentlyEditing ? 0 : (el.opacity ?? 1),
                visible: isCurrentlyEditing ? false : (el.visible !== false),
                selectable: isActive && !el.locked && !isCurrentlyEditing,
                evented: isActive && !el.locked && !isCurrentlyEditing,
              });

              if (!isActiveObj) {
                existingObj.set({ left: el.x, top: el.y, angle: el.rotation || 0 });
              }

              if (el.type === 'text') {
                let parsedText = (el.text || '').replace(/<[^>]*>/g, '');
                if (parsedText.includes('{{page}}')) {
                  parsedText = parsedText.replace(/\{\{page\}\}/gi, String(page.pageNumber || pageIdx + 1));
                }
                existingObj.set({
                  text: parsedText,
                  fontSize: el.fontSize || 16, fontFamily: el.fontFamily || 'Inter',
                  fontWeight: el.fontWeight || 'normal', fontStyle: el.fontStyle || 'normal',
                  fill: el.fill || '#000000', textAlign: el.textAlign || 'left',
                  lineHeight: el.lineHeight || 1.2,
                  underline: el.textDecoration?.includes('underline') || false,
                  charSpacing: el.letterSpacing || 0,
                  objectCaching: false,
                });
                if (!isActiveObj) {
                  existingObj.set({
                    width: el.width,
                    scaleX: 1,
                    scaleY: 1,
                  });
                }
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
                existingObj.set('zIndex', el.zIndex || 0);
                existingObj.setCoords();
                existingObj.dirty = true;
                return existingObj;
              }

              existingObj.set('zIndex', el.zIndex || 0);
              existingObj.setCoords();
              existingObj.dirty = true;
              return existingObj;
            }
          }

          const tempEl = { ...el };
          if (tempEl.type === 'text' && tempEl.text && tempEl.text.includes('{{page}}')) {
            tempEl.text = tempEl.text.replace(/\{\{page\}\}/gi, String(page.pageNumber || pageIdx + 1));
          }
          const obj = await elementToFabricObject(tempEl, products, catalog);
          if (obj) {
            obj.set('zIndex', el.zIndex || 0);
            obj.set({ selectable: isActive && !el.locked, evented: isActive && !el.locked });
            if (el.type === 'product-block') {
              obj._productId = el.productId;
              obj._src = el.src;
              obj._showTitle = catalog.showTitle !== false;
              obj._showPrice = catalog.showPrice !== false;
              obj._showSKU = catalog.showSKU !== false;
            } else if (el.type === 'table') {
              obj._tableDataJSON = JSON.stringify(el.tableData || {});
            }
          }
          return obj;
        });

        const resolvedObjects = await Promise.all(objectPromises);
        if (!isCurrent) return;

        const validObjects = resolvedObjects.filter(Boolean);
        const currentCanvasObjects = canvas.getObjects();

        validObjects.forEach((obj) => {
          if (!currentCanvasObjects.includes(obj)) {
            canvas.add(obj);
          }
        });

        // Restore active selection if the active table/element was rebuilt
        if (isActive && selectedElementIds.length > 0) {
          const selectedObjs = validObjects.filter((o: any) => o && o.id && selectedElementIds.includes(o.id));
          const currentActive = canvas.getActiveObjects();
          if (selectedObjs.length > 0 && (!currentActive.length || !selectedObjs.every(o => currentActive.includes(o)))) {
            if (selectedObjs.length === 1) {
              canvas.setActiveObject(selectedObjs[0]);
            } else if (selectedObjs.length > 1) {
              const sel = new ActiveSelection(selectedObjs, { canvas });
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
        
        // Dynamically update canvas background color
        const targetBg = page.backgroundColor || canvasBg || '#ffffff';
        canvas.backgroundColor = targetBg;
        canvas.renderAll();
      } catch (err) {
        console.error('FabricStage render error:', err);
      }
    };
    loadObjects();

    return () => {
      isCurrent = false;
    };
  }, [page.elements, page.type, page.backgroundColor, canvasBg, headerElements, footerElements, isActive, products, pageIdx, page.pageNumber, catalog?.showTitle, catalog?.showPrice, catalog?.showSKU]);

  useEffect(() => {
    const unsub = useStore.subscribe((newState, prevState) => {
      const newIds = newState.selectedElementIds || [];
      const oldIds = prevState?.selectedElementIds || [];
      
      if (newIds !== oldIds) {
        if (fabricCanvasRef.current) {
          const canvas = fabricCanvasRef.current;
          if ((canvas as any)._currentTransform) return;
          const currentActiveIds = canvas.getActiveObjects().map((o: any) => o.id).filter(Boolean);
          
          if (JSON.stringify(currentActiveIds.sort()) !== JSON.stringify([...newIds].sort())) {
            canvas.discardActiveObject();
            if (newIds.length > 0) {
              const objsToSelect = canvas.getObjects().filter((o: any) => newIds.includes(o.id));
              if (objsToSelect.length === 1) {
                canvas.setActiveObject(objsToSelect[0]);
              } else if (objsToSelect.length > 1) {
                const sel = new ActiveSelection(objsToSelect, { canvas });
                canvas.setActiveObject(sel);
              }
            }
            canvas.renderAll();
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
    <div style={{ width: curW * zoom, height: curH * zoom, border: isActive ? '2px solid #4f46e5' : '1px solid #e2e8f0', overflow: 'hidden', position: 'relative' }}>
      <canvas ref={canvasRef} />
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
