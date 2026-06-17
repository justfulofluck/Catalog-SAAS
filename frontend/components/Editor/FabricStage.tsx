import React, { useEffect, useRef } from 'react';
import { Canvas, Circle } from 'fabric';
import { useStore } from '../../store/useStore';
import { PAGE_WIDTH, PAGE_HEIGHT } from '../../constants';
import { CatalogPage, CanvasElement } from '../../types';
import { elementToFabricObject } from './fabricRenderer';

interface Props {
  page: CatalogPage;
  pageIdx: number;
  isActive: boolean;
  zoom: number;
  canvasBg: string;
}

const FabricStage: React.FC<Props> = ({ page, pageIdx, isActive, zoom, canvasBg }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);
  const renderThrottleRef = useRef<number | null>(null);
  const { setSelectedElements, updateElement } = useStore();
  const products = useStore((state) => state.products);

  const isLandscape = page.orientation === 'landscape';
  const curW = isLandscape ? PAGE_HEIGHT : PAGE_WIDTH;
  const curH = isLandscape ? PAGE_WIDTH : PAGE_HEIGHT;

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new Canvas(canvasRef.current, {
      width: curW,
      height: curH,
      backgroundColor: page.backgroundColor || canvasBg,
      selection: false,
      preserveObjectStacking: true,
    });

    fabricCanvasRef.current = canvas;

    canvas.on('selection:created', (e: any) => {
      const ids = (e.selected || []).map((o: any) => o.id).filter(Boolean) as string[] || [];
      setSelectedElements(ids);
    });

    canvas.on('selection:cleared', () => setSelectedElements([]));

    canvas.on('object:moving', (e: any) => {
      if (renderThrottleRef.current) clearTimeout(renderThrottleRef.current);
      renderThrottleRef.current = window.setTimeout(() => {
        const obj = e.target as any;
        if (obj && obj.id) {
          updateElement(pageIdx, obj.id, { x: obj.left || 0, y: obj.top || 0 });
        }
      }, 16);
    });

    canvas.on('object:modified', (e: any) => {
      const obj = e.target as any;
      if (obj && obj.id) {
        const updates: any = { x: obj.left || 0, y: obj.top || 0, rotation: obj.angle || 0 };
        if (obj instanceof Circle) {
          updates.width = (obj.radius || 0) * 2 * Math.abs(obj.scaleX || 1);
          updates.height = (obj.radius || 0) * 2 * Math.abs(obj.scaleY || 1);
        } else {
          updates.width = (obj.width || 0) * Math.abs(obj.scaleX || 1);
          updates.height = (obj.height || 0) * Math.abs(obj.scaleY || 1);
        }
        updateElement(pageIdx, obj.id, updates);
      }
    });

    return () => {
      if (renderThrottleRef.current) clearTimeout(renderThrottleRef.current);
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
  }, [curW, curH]);

  useEffect(() => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;

    const existingObjects = canvas.getObjects();
    const elIds = new Set(page.elements.map(e => e.id));

    existingObjects.forEach((obj: any) => {
      if (obj.id && !elIds.has(obj.id)) {
        canvas.remove(obj);
      }
    });

    const loadObjects = async () => {
      const objectPromises = page.elements.map(async (el: CanvasElement) => {
        if (el.locked && !isActive) return null;

        const existingObj = existingObjects.find((o: any) => o.id === el.id);

        if (existingObj) {
          if (el.type === 'product-block') {
            canvas.remove(existingObj);
          } else {
            const isActiveObj = canvas.getActiveObjects().includes(existingObj);
            existingObj.set({
              opacity: el.opacity ?? 1,
              selectable: isActive && !el.locked,
              originX: 'left', originY: 'top',
            });

            if (!isActiveObj) {
              existingObj.set({ left: el.x, top: el.y, angle: el.rotation || 0 });
            }

            if (el.type === 'text') {
              existingObj.set({
                text: (el.text || '').replace(/<[^>]*>/g, ''),
                fontSize: el.fontSize || 16, fontFamily: el.fontFamily || 'Inter',
                fontWeight: el.fontWeight || 'normal', fontStyle: el.fontStyle || 'normal',
                fill: el.fill || '#000000', textAlign: el.textAlign || 'left',
                width: el.width, lineHeight: el.lineHeight || 1.2,
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
            } else if (el.type === 'image' || el.type === 'product-block') {
              if (!isActiveObj) {
                const unscaledW = (existingObj as any).width || 1;
                const unscaledH = (existingObj as any).height || 1;
                existingObj.set({ scaleX: el.width / unscaledW, scaleY: el.height / unscaledH });
              }
            }

            existingObj.set('zIndex', el.zIndex || 0);
            existingObj.setCoords();
            existingObj.dirty = true;
            return existingObj;
          }
        }

        const obj = await elementToFabricObject(el, products);
        if (obj) {
          obj.set('zIndex', el.zIndex || 0);
          obj.set({ selectable: isActive && !el.locked, evented: isActive && !el.locked });
        }
        return obj;
      });

      const resolvedObjects = await Promise.all(objectPromises);
      const validObjects = resolvedObjects.filter(Boolean);
      const currentCanvasObjects = canvas.getObjects();

      validObjects.forEach((obj) => {
        if (!currentCanvasObjects.includes(obj)) {
          canvas.add(obj);
        }
      });

      canvas._objects.sort((a: any, b: any) => (a.get('zIndex') || 0) - (b.get('zIndex') || 0));
      canvas.renderAll();
    };

    loadObjects();
  }, [page.elements, isActive, products]);

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
      <div style={{ width: curW, height: curH, transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
        <canvas ref={canvasRef} width={curW} height={curH} />
      </div>
    </div>
  );
};

export default FabricStage;
