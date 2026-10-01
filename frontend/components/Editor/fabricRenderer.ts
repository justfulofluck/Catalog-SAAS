import { Rect, Textbox, FabricText, Image as FabricImage, Circle, Group, filters, config } from 'fabric';
import { CanvasElement, ElementType, Product, Catalog } from '../../types';
import { workerPool } from '../../utils/workerPool';
import { normalizeImageUrl, colorToRgba } from '../../utils/imageUtils';
import { applyCanvaSelectionStyle } from '../../utils/canvaControls';

// Re-export all modular utilities for 100% backward compatibility across the app
export * from './Fabric/shapes';
export * from './Fabric/textEffects';
export * from './Fabric/productCardRenderer';
export * from './Fabric/tableRenderer';

import {
  getCachedImageElement,
  buildShape,
  applyFill,
} from './Fabric/shapes';

import {
  generateRichTextSvg,
  loadSvgAsImage,
  applyTextEffectsToFabricObject,
} from './Fabric/textEffects';

import { renderProductBlock } from './Fabric/productCardRenderer';
import { renderTableElement, renderChecklistElement } from './Fabric/tableRenderer';

// Ensure all fabric images are loaded with crossOrigin = 'anonymous' to prevent tainted canvases
config.imageProperties = { ...config.imageProperties, crossOrigin: 'anonymous' };

async function _elementToFabricObject(
  el: CanvasElement,
  products: Product[],
  catalog?: Catalog,
): Promise<any> {
  const elType = el.type as ElementType;
  const common: Record<string, any> = {
    left: el.x, top: el.y,
    originX: 'left', originY: 'top',
    opacity: el.opacity ?? 1,
    angle: el.rotation || 0,
    selectable: false,
    visible: el.visible !== false,
    evented: false,
    objectCaching: false, // Ensure live vector rendering at all zoom levels without raster cache blur
  };
  common.id = el.id;

  const setCommon = (obj: any) => {
    Object.entries(common).forEach(([k, v]) => { try { obj.set(k as any, v); } catch { } });
  };

  if (el.svgContent) {
    try {
      const htmlImg = await loadSvgAsImage(el.svgContent);
      const img = await FabricImage.fromURL(htmlImg.src, { crossOrigin: 'anonymous' });
      img.set({ ...common, width: el.width, height: el.height, scaleX: 1, scaleY: 1 });
      return img;
    } catch (err) {
      console.warn('Failed to render svgContent, falling back:', err);
    }
  }

  if (elType === 'text') {
    const hasMixedStyles = /<[a-z]+[^>]*style\s*=|color:\s*|font-size:\s*|font-family:\s*/.test(el.text || '');
    const isRichText = hasMixedStyles || (el.fill?.includes('gradient') ?? false);
    const useSvgFallback = isRichText;

    if (useSvgFallback) {
      try {
        const svg = generateRichTextSvg(el);
        const htmlImg = await loadSvgAsImage(svg);
        const img = await FabricImage.fromURL(htmlImg.src, { crossOrigin: 'anonymous' });
        img.set({ ...common, width: el.width, height: el.height, scaleX: 1, scaleY: 1 });
        return img;
      } catch (err) {
        console.warn('Failed to render rich text SVG, falling back to plain text:', err);
      }
    }

    const cleanRawText = (el.text || '').replace(/<[^>]*>/g, '');
    let textWidth = el.width || 100;
    if (!el.width && !cleanRawText.includes('\n')) {
      const estimatedMinW = Math.ceil(cleanRawText.length * (el.fontSize || 16) * 0.72);
      if (textWidth < estimatedMinW) {
        textWidth = estimatedMinW + 20;
      }
    }

    const is3GridTitle = Boolean(
      (el.sectionTag && (el.id?.includes('title') || (el.fontSize && el.fontSize >= 18))) ||
      (el.fill === '#00a651' && (el.fontSize && el.fontSize >= 18))
    );

    const resolvedFontFamily = is3GridTitle
      ? (el.fontFamily === 'Montserrat' || el.fontFamily === 'Inter' || !el.fontFamily ? 'Bebas Neue, Oswald, sans-serif' : el.fontFamily)
      : (el.fontFamily || 'Inter');

    const textProps: Record<string, any> = {
      ...common,
      width: textWidth,
      text: is3GridTitle ? cleanRawText.toUpperCase() : cleanRawText,
      fontSize: el.fontSize || 16,
      fontFamily: resolvedFontFamily,
      fontWeight: is3GridTitle ? 'normal' : (el.fontWeight || 'normal'),
      fontStyle: el.fontStyle || 'normal',
      textAlign: el.textAlign || 'left',
      lineHeight: el.lineHeight || 1.2,
      underline: el.textDecoration?.includes('underline') || false,
      charSpacing: el.letterSpacing ? Math.round(((el.letterSpacing) / (el.fontSize || 16)) * 1000) : 0,
      splitByGrapheme: false,
      editable: false, // Disable Fabric's native text editing — the app uses its own HTML overlay
    };
    applyFill(textProps, el.fill, textWidth, el.height);

    const tb = new Textbox(textProps.text, textProps);
    applyTextEffectsToFabricObject(tb, el);

    // If text has no explicit newlines, ensure tb width accommodates its rendered single-line text
    if (!textProps.text.includes('\n')) {
      const naturalW = (tb as any).calcTextWidth ? (tb as any).calcTextWidth() : 0;
      if (naturalW > 0 && tb.width < naturalW + 6) {
        tb.set('width', Math.ceil(naturalW + 15));
        tb.setCoords();
      }
    }
    setCommon(tb);
    return tb;
  }

  if (elType === 'image') {
    if (!el.src) {
      const rect = new Rect({ ...common, fill: '#e2e8f0', stroke: '#94a3b8', strokeWidth: 1 });
      return rect;
    }
    try {
      let finalSrc = normalizeImageUrl(el.src);
      // Offload heavy image filtering and decoding to background worker if filters are present
      if (el.filters && (el.filters.brightness || el.filters.contrast || el.filters.blur)) {
        try {
          const processed = await workerPool.processImage(el.src, {
            brightness: el.filters.brightness ? el.filters.brightness / 100 : 0,
            contrast: el.filters.contrast ? el.filters.contrast / 100 : 0,
            blur: el.filters.blur || 0,
          }, el.width, el.height);
          if (processed?.processedUrl) {
            finalSrc = processed.processedUrl;
          }
        } catch (workerErr) {
          console.warn('Worker filter failed, falling back to WebGL/Canvas:', workerErr);
        }
      }

      const htmlImg = await getCachedImageElement(finalSrc);
      const naturalW = htmlImg.naturalWidth || htmlImg.width || 1;
      const naturalH = htmlImg.naturalHeight || htmlImg.height || 1;

      const fabricFilters: any[] = [];
      if (finalSrc === el.src && el.filters) {
        if (el.filters.brightness !== undefined && el.filters.brightness !== 0) {
          fabricFilters.push(new filters.Brightness({ brightness: el.filters.brightness / 100 }));
        }
        if (el.filters.blur !== undefined && el.filters.blur !== 0) {
          fabricFilters.push(new filters.Blur({ blur: el.filters.blur / 100 }));
        }
        if (el.filters.contrast !== undefined && el.filters.contrast !== 0) {
          fabricFilters.push(new filters.Contrast({ contrast: el.filters.contrast / 100 }));
        }
      }

      if (el.overlayEnabled) {
        const isGradient = el.overlayType === 'gradient';
        let overlayFill: any;
        let overlayGroupOpacity = 1;

        if (isGradient) {
          const dir = el.overlayGradientDirection || 'to-right';
          const startColor = el.overlayGradientStartColor || el.overlayColor || '#000000';
          const endColor = el.overlayGradientEndColor || el.overlayColor || startColor;
          const startAlpha = el.overlayGradientStartOpacity !== undefined ? el.overlayGradientStartOpacity : (el.overlayOpacity !== undefined ? el.overlayOpacity : 80);
          const endAlpha = el.overlayGradientEndOpacity !== undefined ? el.overlayGradientEndOpacity : 0;

          const startRgba = colorToRgba(startColor, startAlpha);
          const endRgba = colorToRgba(endColor, endAlpha);

          let coords = { x1: 0, y1: 0, x2: el.width, y2: 0 };
          switch (dir) {
            case 'to-right': coords = { x1: 0, y1: 0, x2: el.width, y2: 0 }; break;
            case 'to-left': coords = { x1: el.width, y1: 0, x2: 0, y2: 0 }; break;
            case 'to-bottom': coords = { x1: 0, y1: 0, x2: 0, y2: el.height }; break;
            case 'to-top': coords = { x1: 0, y1: el.height, x2: 0, y2: 0 }; break;
            case 'to-bottom-right': coords = { x1: 0, y1: 0, x2: el.width, y2: el.height }; break;
            case 'to-top-right': coords = { x1: 0, y1: el.height, x2: el.width, y2: 0 }; break;
            default: coords = { x1: 0, y1: 0, x2: el.width, y2: 0 };
          }

          const { Gradient: FabricGradient } = await import('fabric');
          overlayFill = new FabricGradient({
            type: 'linear',
            gradientUnits: 'pixels',
            coords,
            colorStops: [
              { offset: 0, color: startRgba },
              { offset: 1, color: endRgba }
            ]
          });
          overlayGroupOpacity = 1;
        } else {
          overlayFill = el.overlayColor || '#ea580c';
          overlayGroupOpacity = (el.overlayOpacity !== undefined ? el.overlayOpacity : 22) / 100;
        }

        const baseImg = new FabricImage(htmlImg, {
          left: 0,
          top: 0,
          width: el.width,
          height: el.height,
          scaleX: 1,
          scaleY: 1,
          selectable: false,
          evented: false,
          objectCaching: false,
        });

        (baseImg as any)._element = htmlImg;
        (baseImg as any).cropX = el.cropX;
        (baseImg as any).cropY = el.cropY;
        (baseImg as any).cropWidth = el.cropWidth;
        (baseImg as any).cropHeight = el.cropHeight;
        (baseImg as any).naturalWidth = naturalW;
        (baseImg as any).naturalHeight = naturalH;

        baseImg._render = function (ctx: CanvasRenderingContext2D) {
          const imageElement = (this as any)._element || (this as any).getElement?.() || htmlImg;
          if (!imageElement) return;
          const nw = (this as any).naturalWidth || imageElement.naturalWidth || imageElement.width || 1;
          const nh = (this as any).naturalHeight || imageElement.naturalHeight || imageElement.height || 1;
          const w = (this as any).width || 1;
          const h = (this as any).height || 1;

          let cropX = (this as any).cropX !== undefined ? (this as any).cropX : 0;
          let cropY = (this as any).cropY !== undefined ? (this as any).cropY : 0;
          let cropW = (this as any).cropWidth !== undefined ? (this as any).cropWidth : nw;
          let cropH = (this as any).cropHeight !== undefined ? (this as any).cropHeight : nh;

          const sx = Math.max(0, Math.min(nw - 1, cropX));
          const sy = Math.max(0, Math.min(nh - 1, cropY));
          const sw = Math.max(1, Math.min(nw - sx, cropW));
          const sh = Math.max(1, Math.min(nh - sy, cropH));

          ctx.drawImage(imageElement, sx, sy, sw, sh, -w / 2, -h / 2, w, h);
        };

        if (fabricFilters.length > 0) {
          (baseImg as any).filters = fabricFilters;
          baseImg.applyFilters();
        }

        const overlayRect = new Rect({
          left: 0,
          top: 0,
          width: el.width,
          height: el.height,
          fill: overlayFill,
          opacity: overlayGroupOpacity,
          rx: el.borderRadius || 0,
          ry: el.borderRadius || 0,
          selectable: false,
          evented: false,
          objectCaching: false,
        });

        const group = new Group([baseImg, overlayRect], {
          left: el.x,
          top: el.y,
          angle: el.rotation || 0,
          originX: 'left',
          originY: 'top',
          width: el.width,
          height: el.height,
          opacity: el.opacity ?? 1,
          stroke: el.stroke && el.stroke !== 'transparent' ? el.stroke : undefined,
          strokeWidth: el.stroke && el.stroke !== 'transparent' ? (el.strokeWidth || 2) : 0,
          objectCaching: false,
        });
        (group as any).id = el.id;
        (group as any)._src = el.src;
        (group as any).cropX = el.cropX;
        (group as any).cropY = el.cropY;
        (group as any).cropWidth = el.cropWidth;
        (group as any).cropHeight = el.cropHeight;
        (group as any).naturalWidth = naturalW;
        (group as any).naturalHeight = naturalH;
        (group as any)._overlayEnabled = el.overlayEnabled;
        (group as any)._overlayType = el.overlayType;
        (group as any)._overlayColor = el.overlayColor;
        (group as any)._overlayOpacity = el.overlayOpacity;
        (group as any)._overlayGradientDirection = el.overlayGradientDirection;
        (group as any)._overlayGradientStartColor = el.overlayGradientStartColor;
        (group as any)._overlayGradientEndColor = el.overlayGradientEndColor;
        (group as any)._overlayGradientStartOpacity = el.overlayGradientStartOpacity;
        (group as any)._overlayGradientEndOpacity = el.overlayGradientEndOpacity;
        return group;
      }

      const img = new FabricImage(htmlImg, {
        ...common,
        width: el.width,
        height: el.height,
        scaleX: 1,
        scaleY: 1,
        stroke: el.stroke && el.stroke !== 'transparent' ? el.stroke : undefined,
        strokeWidth: el.stroke && el.stroke !== 'transparent' ? (el.strokeWidth || 2) : 0,
        objectCaching: false,
      });

      (img as any)._element = htmlImg;
      (img as any).cropX = el.cropX;
      (img as any).cropY = el.cropY;
      (img as any).cropWidth = el.cropWidth;
      (img as any).cropHeight = el.cropHeight;
      (img as any).naturalWidth = naturalW;
      (img as any).naturalHeight = naturalH;

      img._render = function (ctx: CanvasRenderingContext2D) {
        const imageElement = (this as any)._element || (this as any).getElement?.() || htmlImg;
        if (!imageElement) return;
        const nw = (this as any).naturalWidth || imageElement.naturalWidth || imageElement.width || 1;
        const nh = (this as any).naturalHeight || imageElement.naturalHeight || imageElement.height || 1;
        const w = (this as any).width || 1;
        const h = (this as any).height || 1;

        let cropX = (this as any).cropX !== undefined ? (this as any).cropX : 0;
        let cropY = (this as any).cropY !== undefined ? (this as any).cropY : 0;
        let cropW = (this as any).cropWidth !== undefined ? (this as any).cropWidth : nw;
        let cropH = (this as any).cropHeight !== undefined ? (this as any).cropHeight : nh;

        const sx = Math.max(0, Math.min(nw - 1, cropX));
        const sy = Math.max(0, Math.min(nh - 1, cropY));
        const sw = Math.max(1, Math.min(nw - sx, cropW));
        const sh = Math.max(1, Math.min(nh - sy, cropH));

        ctx.drawImage(imageElement, sx, sy, sw, sh, -w / 2, -h / 2, w, h);
      };

      if (fabricFilters.length > 0) {
        (img as any).filters = fabricFilters;
        img.applyFilters();
      }
      (img as any)._src = el.src;
      (img as any)._overlayEnabled = el.overlayEnabled;
      (img as any)._overlayColor = el.overlayColor;
      (img as any)._overlayOpacity = el.overlayOpacity;
      return img;
    } catch (err) {
      console.error('Failed to render image on canvas:', err, el.src);
      const rect = new Rect({ ...common, fill: '#e2e8f0', stroke: '#94a3b8', strokeWidth: 1, strokeDashArray: [5, 5] });
      return rect;
    }
  }

  if (elType === 'video') {
    const posterUrl = el.videoPoster || el.src || 'https://images.unsplash.com/photo-1506784365847-bbad939e9335?auto=format&fit=crop&q=80&w=800';
    try {
      const finalSrc = normalizeImageUrl(posterUrl);
      const htmlImg = await getCachedImageElement(finalSrc);
      const naturalW = htmlImg.naturalWidth || htmlImg.width || 640;
      const naturalH = htmlImg.naturalHeight || htmlImg.height || 360;

      const img = new FabricImage(htmlImg, {
        ...common,
        width: el.width,
        height: el.height,
        scaleX: 1,
        scaleY: 1,
        stroke: el.stroke && el.stroke !== 'transparent' ? el.stroke : undefined,
        strokeWidth: el.stroke && el.stroke !== 'transparent' ? (el.strokeWidth || 2) : 0,
        objectCaching: false,
      });

      (img as any)._element = htmlImg;
      (img as any)._videoUrl = el.videoUrl;
      (img as any)._videoPoster = el.videoPoster;
      (img as any)._videoTitle = el.videoTitle;
      (img as any)._videoType = el.videoType;
      (img as any).naturalWidth = naturalW;
      (img as any).naturalHeight = naturalH;

      img._render = function (ctx: CanvasRenderingContext2D) {
        const imageElement = (this as any)._element || (this as any).getElement?.() || htmlImg;
        if (!imageElement) return;
        const nw = (this as any).naturalWidth || imageElement.naturalWidth || imageElement.width || 1;
        const nh = (this as any).naturalHeight || imageElement.naturalHeight || imageElement.height || 1;
        const w = (this as any).width || 1;
        const h = (this as any).height || 1;

        ctx.drawImage(imageElement, 0, 0, nw, nh, -w / 2, -h / 2, w, h);
      };

      return img;
    } catch (err) {
      console.error('Failed to render video poster on canvas:', err, posterUrl);
      const rect = new Rect({ 
        ...common, 
        fill: '#18181b', 
        stroke: '#3b82f6', 
        strokeWidth: 2 
      });
      return rect;
    }
  }

  if (elType === 'shape' || elType === 'comment') {
    const w = el.width, h = el.height;
    const shapeType = el.shapeType || 'rect';
    const strokeColor = el.stroke || undefined;
    const strokeWidth = el.strokeWidth !== undefined ? el.strokeWidth : (el.stroke ? 2 : 0);
    const strokeDashArray = el.strokeDashArray;
    const rx = el.rx !== undefined ? el.rx : el.cornerRadius;
    const ry = el.ry !== undefined ? el.ry : el.cornerRadius;
    const isGradient = el.fill?.includes('linear-gradient');
    const useSvgForGradient = isGradient && ['cloud', 'wave'].includes(shapeType);

    if (el.iconConfig) {
      const ic = el.iconConfig;
      const isTransparentBg = shapeType === 'none' || (!el.fill || el.fill === 'transparent' || el.fill === 'none') && (!strokeColor || strokeColor === 'transparent' || strokeWidth === 0);
      const iconSize = ic.size || (isTransparentBg ? Math.min(w, h) * 0.75 : Math.min(w, h) * 0.5);
      const iconFontFamily = (ic as any).fontFamily || (ic.iconLibrary === 'fontawesome' ? 'Font Awesome 6 Free' : 'Inter');
      const iconFontWeight = (ic as any).fontWeight || ('900' as any);

      const children: any[] = [];
      if (!isTransparentBg && shapeType !== 'none') {
        const shapeObj = buildShape(shapeType, w, h, strokeColor, strokeWidth, el.fill, el.fill, strokeDashArray, rx, ry);
        if (shapeObj) {
          shapeObj.set({
            originX: 'center',
            originY: 'center',
            left: 0,
            top: 0
          });
          children.push(shapeObj);
        }
      } else {
        const hitTarget = new Rect({
          width: w,
          height: h,
          fill: 'rgba(0,0,0,0.001)',
          stroke: 'transparent',
          strokeWidth: 0,
          originX: 'center',
          originY: 'center',
          left: 0,
          top: 0
        });
        children.push(hitTarget);
      }

      const iconText = new FabricText(ic.iconName, {
        originX: 'center',
        originY: 'center',
        left: 0,
        top: 0,
        fontSize: iconSize,
        fontFamily: iconFontFamily,
        fill: ic.color || '#ffffff',
        fontWeight: iconFontWeight,
        textAlign: 'center',
        selectable: false,
        evented: false,
      });
      children.push(iconText);

      const group = new Group(children, {
        left: el.x,
        top: el.y,
        angle: el.rotation || 0,
        originX: 'left',
        originY: 'top',
        opacity: el.opacity ?? 1,
      });
      (group as any).id = el.id;
      applyCanvaSelectionStyle(group);
      return group;
    }

    if (useSvgForGradient) {
      try {
        const svg = generateRichTextSvg(el);
        const htmlImg = await loadSvgAsImage(svg);
        const img = await FabricImage.fromURL(htmlImg.src, { crossOrigin: 'anonymous' });
        img.set({ ...common, width: w, height: h, scaleX: 1, scaleY: 1 });
        return img;
      } catch (err) {
        console.warn('Failed to render shape gradient SVG:', err);
      }
    }

    const isTransparentFill = !el.fill || el.fill === 'transparent' || el.fill === 'none';
    const obj = buildShape(shapeType, w, h, strokeColor, strokeWidth, el.fill, el.fill, strokeDashArray, rx, ry);
    if (obj) {
      setCommon(obj);
      obj.set({
        width: w,
        height: h,
        perPixelTargetFind: isTransparentFill,
        targetFindTolerance: isTransparentFill ? Math.max(8, Math.min(16, Math.round((strokeWidth || 2) * 1.5))) : 4,
      });
      (obj as any).shapeType = shapeType;
      if (obj instanceof Circle) obj.set({ radius: Math.min(w, h) / 2 });
      if (el.fill && el.fill.includes('gradient')) {
        applyFill(obj, el.fill, w, h);
      }
      applyCanvaSelectionStyle(obj);
    }
    return obj;
  }

  if (elType === 'product-block') {
    return renderProductBlock(el, products, catalog);
  }

  if (el.type === 'table') {
    return renderTableElement(el);
  }

  if (el.type === 'checklist') {
    return renderChecklistElement(el);
  }

  return null;
}

export async function elementToFabricObject(
  el: CanvasElement,
  products: Product[],
  catalog?: Catalog,
): Promise<any> {
  const obj = await _elementToFabricObject(el, products, catalog);
  if (obj) {
    applyCanvaSelectionStyle(obj);
  }
  return obj;
}

export async function renderElementsToCanvas(
  canvas: any,
  elements: CanvasElement[],
  products: Product[],
  backgroundColor: string,
  width: number,
  height: number,
) {
  canvas.backgroundColor = backgroundColor;
  canvas.clear();

  const objects = await Promise.all(
    elements
      .filter(el => el.visible !== false)
      .map(el => elementToFabricObject(el, products)),
  );

  objects.filter(Boolean).forEach((obj: any, i: number) => {
    obj.set('zIndex', elements[i]?.zIndex || 0);
    canvas.add(obj);
  });

  canvas._objects.sort((a: any, b: any) => (a.get('zIndex') || 0) - (b.get('zIndex') || 0));
  canvas.renderAll();
}
