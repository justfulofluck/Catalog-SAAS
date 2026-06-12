import React, { useEffect, useRef } from 'react';
import { Canvas, Rect, Textbox, Image, Circle, Triangle, Group } from 'fabric';
import { useStore } from '../../store/useStore';
import { PAGE_WIDTH, PAGE_HEIGHT } from '../../constants';
import { CatalogPage, CanvasElement, ElementType } from '../../types';

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
  const { selectedElementIds, setSelectedElements, updateElement } = useStore();

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

    return () => {
      if (renderThrottleRef.current) clearTimeout(renderThrottleRef.current);
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
  }, [curW, curH]);

  useEffect(() => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const { products } = useStore.getState();

    const existingObjects = canvas.getObjects();
    const elIds = new Set(page.elements.map(e => e.id));

    // Remove deleted elements
    existingObjects.forEach((obj: any) => {
      if (obj.id && !elIds.has(obj.id)) {
        canvas.remove(obj);
      }
    });

    const loadObjects = async () => {
      const objectPromises = page.elements.map(async (el: CanvasElement) => {
        if (el.locked && !isActive) return null;

        const existingObj = existingObjects.find((o: any) => o.id === el.id);

        // Update existing object to avoid recreating and interrupting drag
        if (existingObj) {
          const isActiveObj = canvas.getActiveObjects().includes(existingObj);

          // Always sync styling and non-transform properties
          existingObj.set({
            opacity: el.opacity ?? 1,
            selectable: isActive && !el.locked,
            originX: 'left', originY: 'top',
          });

          // Only skip syncing transform properties if the user is actively manipulating it
          if (!isActiveObj) {
            existingObj.set({
              left: el.x, top: el.y, angle: el.rotation || 0
            });
          }

          if (el.type === 'text') {
            existingObj.set({
              text: el.text || '', 
              fontSize: el.fontSize || 16, fontFamily: el.fontFamily || 'Inter',
              fontWeight: el.fontWeight || 'normal', fontStyle: el.fontStyle || 'normal',
              fill: el.fill || '#000000', textAlign: el.textAlign || 'left',
              width: el.width // ALWAYS sync width for text to allow font-size changes to expand the box
            });
          } else if (el.type === 'shape' || el.type === 'comment') {
            existingObj.set({
              fill: el.fill || '#ffffff', stroke: el.stroke || undefined,
              strokeWidth: el.strokeWidth || 0,
            });
            if (!isActiveObj) {
              existingObj.set({ width: el.width, height: el.height });
              if (el.shapeType === 'circle') {
                existingObj.set({ radius: Math.min(el.width, el.height) / 2 });
              }
            }
          } else if (el.type === 'image' || el.type === 'product-block') {
            if (!isActiveObj) {
              const unscaledW = existingObj.width || 1;
              const unscaledH = existingObj.height || 1;
              existingObj.set({
                scaleX: el.width / unscaledW,
                scaleY: el.height / unscaledH
              });
            }
          }

          existingObj.set('zIndex', el.zIndex || 0);
          existingObj.setCoords();
          existingObj.dirty = true;
          return existingObj;
        }

        // Create new object
        let obj: any = null;
        const elType = el.type as ElementType;

        switch (elType) {
          case 'text':
            obj = new Textbox(el.text || '', {
              left: el.x, top: el.y, width: el.width,
              originX: 'left', originY: 'top',
              fontSize: el.fontSize || 16,
              fontFamily: el.fontFamily || 'Inter',
              fontWeight: el.fontWeight || 'normal',
              fontStyle: el.fontStyle || 'normal',
              textAlign: el.textAlign || 'left',
              fill: el.fill || '#000000',
              lineHeight: el.lineHeight || 1.2,
              id: el.id,
              splitByGrapheme: false,
            });
            break;

          case 'image':
            if (el.src) {
              try {
                const img: any = await Image.fromURL(el.src);
                img.set({
                  left: el.x, top: el.y, 
                  originX: 'left', originY: 'top',
                  scaleX: el.width / img.width, 
                  scaleY: el.height / img.height,
                  id: el.id,
                });
                obj = img;
              } catch (err) {
                console.error('Failed to load image:', err);
              }
            }
            break;

          case 'product-block': {
            const objs: any[] = [];
            
            objs.push(new Rect({
               left: 0, top: 0, width: el.width, height: el.height,
               originX: 'left', originY: 'top',
               fill: '#ffffff', stroke: '#e2e8f0', strokeWidth: 2, rx: 8, ry: 8
            }));

            const product = products.find(p => p.id === el.productId);

            if (product) {
              if (product.mainImage || el.src) {
                try {
                  const img: any = await Image.fromURL(el.src || product.mainImage);
                  const targetH = el.height * 0.6;
                  img.set({
                    left: 0, top: 0,
                    originX: 'left', originY: 'top',
                    scaleX: el.width / img.width,
                    scaleY: targetH / img.height
                  });
                  objs.push(img);
                } catch (e) { console.error('Failed to load product image', e); }
              }

              objs.push(new Textbox(product.name || 'Unnamed Product', {
                left: 10, top: el.height * 0.6 + 10, width: el.width - 20,
                originX: 'left', originY: 'top',
                fontSize: Math.max(12, el.width * 0.05),
                fontFamily: 'Inter', fontWeight: 'bold', fill: '#0f172a',
                splitByGrapheme: false
              }));

              objs.push(new Textbox(`₹${product.price || '0'}`, {
                left: 10, top: el.height * 0.6 + Math.max(12, el.width * 0.05) + 15, width: el.width - 20,
                originX: 'left', originY: 'top',
                fontSize: Math.max(10, el.width * 0.04),
                fontFamily: 'Inter', fill: '#4f46e5', fontWeight: 'bold',
                splitByGrapheme: false
              }));
            } else {
              objs.push(new Textbox('EMPTY SLOT', {
                left: 0, top: el.height / 2 - 10, width: el.width,
                originX: 'left', originY: 'top',
                fontSize: 14, fontFamily: 'Inter', fontWeight: 'bold', fill: '#94a3b8',
                textAlign: 'center', splitByGrapheme: false
              }));
            }

            obj = new Group(objs, {
              left: el.x, top: el.y,
              originX: 'left', originY: 'top',
              id: el.id,
            });
            break;
          }

          case 'shape':
          case 'comment': {
            const commonProps = {
              left: el.x, top: el.y, width: el.width, height: el.height,
              originX: 'left', originY: 'top',
              fill: el.fill || '#ffffff',
              stroke: el.stroke || undefined,
              strokeWidth: el.strokeWidth || 0,
              id: el.id,
            };
            
            if (el.shapeType === 'circle') {
               obj = new Circle({ ...commonProps, radius: Math.min(el.width, el.height) / 2 });
            } else if (el.shapeType === 'triangle') {
               obj = new Triangle(commonProps);
            } else {
               obj = new Rect(commonProps);
            }
            break;
          }
        }

        if (obj) {
          obj.set({ selectable: isActive && !el.locked });
          // Store zIndex inside object for sorting
          obj.set('zIndex', el.zIndex || 0);
        }
        return obj;
      });

      const resolvedObjects = await Promise.all(objectPromises);
      const validObjects = resolvedObjects.filter(Boolean);
      
      // Add any new objects that aren't on the canvas yet
      const currentCanvasObjects = canvas.getObjects();
      validObjects.forEach((obj) => {
        if (!currentCanvasObjects.includes(obj)) {
          canvas.add(obj);
        }
      });
      
      // Ensure z-index order by sorting the internal array directly (Fabric v7 compatible)
      canvas._objects.sort((a: any, b: any) => (a.get('zIndex') || 0) - (b.get('zIndex') || 0));
      
      canvas.renderAll();
    };

    loadObjects();
  }, [page.elements, isActive]);

  return (
    <div style={{ width: curW * zoom, height: curH * zoom, border: isActive ? '2px solid #4f46e5' : '1px solid #e2e8f0', overflow: 'hidden', position: 'relative' }}>
      <div style={{ width: curW, height: curH, transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
        <canvas ref={canvasRef} width={curW} height={curH} />
      </div>
    </div>
  );
};

export default FabricStage;
