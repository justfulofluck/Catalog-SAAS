import React, { useEffect, useRef, useState } from 'react';
import { Canvas, Circle, ActiveSelection, config } from 'fabric';
import { useStore } from '../../store/useStore';
import { PAGE_WIDTH, PAGE_HEIGHT } from '../../constants';
import { CatalogPage, CanvasElement } from '../../types';
import { elementToFabricObject } from './fabricRenderer';
import { globalSpatialIndex } from '../../utils/spatialIndex';

interface Props {
  page: CatalogPage;
  pageIdx: number;
  isActive: boolean;
  zoom: number;
  canvasBg: string;
  headerElements?: CanvasElement[];
  footerElements?: CanvasElement[];
}

const FabricStage: React.FC<Props> = ({ page, pageIdx, isActive, zoom, canvasBg, headerElements = [], footerElements = [] }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);
  const renderThrottleRef = useRef<number | null>(null);
  const [activeGuides, setActiveGuides] = useState<{ type: 'horizontal' | 'vertical'; pos: number }[]>([]);
  const { setSelectedElements, updateElement, pushHistory, catalog } = useStore();
  const products = useStore((state) => state.products);

  const curW = PAGE_WIDTH;
  const curH = PAGE_HEIGHT;

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new Canvas(canvasRef.current, {
      width: curW,
      height: curH,
      backgroundColor: page.backgroundColor || canvasBg,
      selection: false,
      preserveObjectStacking: true,
      enableRetinaScaling: true,
    });

    fabricCanvasRef.current = canvas;

    canvas.on('selection:created', (e: any) => {
      const ids = (e.selected || []).map((o: any) => o.id).filter(Boolean) as string[] || [];
      setSelectedElements(ids);
    });

    canvas.on('selection:updated', (e: any) => {
      const ids = (e.selected || []).map((o: any) => o.id).filter(Boolean) as string[] || [];
      setSelectedElements(ids);
    });

    canvas.on('selection:cleared', () => setSelectedElements([]));

    canvas.on('mouse:down', () => {
      useStore.getState().setCurrentPageIndex(pageIdx);
    });

    let dragTimer: number | null = null;
    canvas.on('object:moving', (e: any) => {
      const obj = e.target as any;
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

        const { snapX, snapY, guideLines } = globalSpatialIndex.findSnapTargets(currentBox, 6);
        if (snapX !== null) {
          obj.set('left', snapX);
        }
        if (snapY !== null) {
          obj.set('top', snapY);
        }
        setActiveGuides(guideLines);
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

    canvas.on('object:modified', (e: any) => {
      setActiveGuides([]);
      dragTimer = null;
      const obj = e.target as any;
      if (obj && obj.id) {
        const isHeader = headerElements?.some(el => el.id === obj.id);
        const isFooter = footerElements?.some(el => el.id === obj.id);
        const el = page.elements.find((e: CanvasElement) => e.id === obj.id) ||
                   headerElements?.find(e => e.id === obj.id) ||
                   footerElements?.find(e => e.id === obj.id);
        
        const updates: any = { x: obj.left || 0, y: obj.top || 0, rotation: obj.angle || 0 };
        
        if (el && el.type === 'product-block') {
          if (obj.scaleX !== 1 || obj.scaleY !== 1) {
            updates.width = (obj.width || 0) * Math.abs(obj.scaleX || 1);
            updates.height = (obj.height || 0) * Math.abs(obj.scaleY || 1);
          }
        } else if (obj instanceof Circle) {
          updates.width = (obj.radius || 0) * 2 * Math.abs(obj.scaleX || 1);
          updates.height = (obj.radius || 0) * 2 * Math.abs(obj.scaleY || 1);
        } else {
          updates.width = (obj.width || 0) * Math.abs(obj.scaleX || 1);
          updates.height = (obj.height || 0) * Math.abs(obj.scaleY || 1);
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
    let isCurrent = true;

    const loadObjects = async () => {
      try {
        const existingObjects = canvas.getObjects();
        const allElements = [
          ...page.elements,
          ...(headerElements || []),
          ...(footerElements || [])
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

            if (el.type === 'product-block' && !isActiveObj && needsRebuild(el, existingObj)) {
              canvas.remove(existingObj);
            } else {
              existingObj.set({
                opacity: el.opacity ?? 1,
                selectable: isActive && !el.locked,
                evented: isActive && !el.locked,
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
                  width: el.width, lineHeight: el.lineHeight || 1.2,
                  underline: el.textDecoration?.includes('underline') || false,
                  charSpacing: el.letterSpacing || 0,
                });
              } else if (el.type === 'shape' || el.type === 'comment') {
                existingObj.set({
                  fill: el.fill || '#ffffff', stroke: el.stroke || undefined,
                  strokeWidth: el.strokeWidth || 0,
                });
                if (!isActiveObj) {
                  existingObj.set({ width: el.width, height: el.height });
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
  }, [page.elements, page.type, page.backgroundColor, canvasBg, headerElements, footerElements, isActive, products, pageIdx, page.pageNumber, catalog]);

  useEffect(() => {
    const unsub = useStore.subscribe((newState, prevState) => {
      const newIds = newState.selectedElementIds || [];
      const oldIds = prevState?.selectedElementIds || [];
      
      if (newIds !== oldIds) {
        if (fabricCanvasRef.current) {
          const canvas = fabricCanvasRef.current;
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
      <div style={{ width: curW, height: curH, transform: `scale(${zoom})`, transformOrigin: 'top left', position: 'relative' }}>
        <canvas ref={canvasRef} width={curW} height={curH} />
        {/* Real-time spatial alignment guide overlays */}
        {activeGuides.map((guide, idx) => (
          <div
            key={`guide-${idx}`}
            style={{
              position: 'absolute',
              pointerEvents: 'none',
              zIndex: 9999,
              backgroundColor: '#ec4899', // Hot pink guide line
              ...(guide.type === 'vertical'
                ? { left: `${guide.pos}px`, top: 0, width: '1px', height: '100%' }
                : { top: `${guide.pos}px`, left: 0, height: '1px', width: '100%' }),
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default FabricStage;
