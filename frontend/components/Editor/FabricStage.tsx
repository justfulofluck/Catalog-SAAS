import React, { useEffect, useRef } from 'react';
import { Canvas, Rect, Text, Image } from 'fabric';
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
  }, []);

  useEffect(() => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    canvas.clear();

    page.elements.forEach((el: CanvasElement) => {
      if (el.locked && !isActive) return;

      let obj: any = null;

      const elType = el.type as ElementType;

      switch (elType) {
        case 'text':
          obj = new Text(el.text || '', {
            left: el.x, top: el.y, width: el.width,
            fontSize: el.fontSize || 16,
            fontFamily: el.fontFamily || 'Inter',
            fill: el.fill || '#000000',
            id: el.id,
          });
          break;

        case 'image':
        case 'product-block':
          if (el.src) {
            Image.fromURL(el.src).then((img: any) => {
              const imageObj = new Image(img, {
                left: el.x, top: el.y, width: el.width, height: el.height,
                id: el.id,
                selectable: isActive && !el.locked,
              });
              canvas.add(imageObj);
              canvas.renderAll();
            }).catch((err: any) => console.error('Failed to load image:', err));
          }
          return;

        case 'shape':
        case 'comment':
          obj = new Rect({
            left: el.x, top: el.y, width: el.width, height: el.height,
            fill: el.fill || '#ffffff',
            stroke: el.stroke || '#000000',
            id: el.id,
          });
          break;
      }

      if (obj) {
        obj.set({ selectable: isActive && !el.locked });
        canvas.add(obj);
      }
    });

    canvas.renderAll();
  }, [page.elements, isActive, curW, curH]);

  return (
    <canvas
      ref={canvasRef}
      width={curW}
      height={curH}
      style={{
        width: curW * zoom,
        height: curH * zoom,
        transform: `scale(${zoom})`,
        transformOrigin: 'top left',
        border: isActive ? '2px solid #4f46e5' : '1px solid #e2e8f0',
      }}
    />
  );
};

export default FabricStage;
