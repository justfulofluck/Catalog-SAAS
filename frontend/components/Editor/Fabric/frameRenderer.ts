import { Rect, Circle, Ellipse, Polygon, Image as FabricImage, Group, FabricText, Shadow } from 'fabric';
import { CanvasElement, Product, Catalog, FrameShapeType } from '../../../types';
import { getCachedImageElement } from './shapes';
import { normalizeImageUrl } from '../../../utils/imageUtils';

export function getFramePoints(shape: FrameShapeType, w: number, h: number): { x: number; y: number }[] {
  const halfW = w / 2;
  const halfH = h / 2;

  switch (shape) {
    case 'hexagon': {
      const qH = h * 0.25;
      return [
        { x: 0, y: -halfH },
        { x: halfW, y: -halfH + qH },
        { x: halfW, y: halfH - qH },
        { x: 0, y: halfH },
        { x: -halfW, y: halfH - qH },
        { x: -halfW, y: -halfH + qH },
      ];
    }
    case 'diamond':
      return [
        { x: 0, y: -halfH },
        { x: halfW, y: 0 },
        { x: 0, y: halfH },
        { x: -halfW, y: 0 },
      ];
    case 'octagon': {
      const chamferX = w * 0.28;
      const chamferY = h * 0.28;
      return [
        { x: -halfW + chamferX, y: -halfH },
        { x: halfW - chamferX, y: -halfH },
        { x: halfW, y: -halfH + chamferY },
        { x: halfW, y: halfH - chamferY },
        { x: halfW - chamferX, y: halfH },
        { x: -halfW + chamferX, y: halfH },
        { x: -halfW, y: halfH - chamferY },
        { x: -halfW, y: -halfH + chamferY },
      ];
    }
    default:
      return [
        { x: -halfW, y: -halfH },
        { x: halfW, y: -halfH },
        { x: halfW, y: halfH },
        { x: -halfW, y: halfH },
      ];
  }
}

export function drawFrameShapePath(
  ctx: CanvasRenderingContext2D,
  shape: FrameShapeType,
  w: number,
  h: number,
  cornerRadius?: number
) {
  const halfW = w / 2;
  const halfH = h / 2;
  ctx.beginPath();

  switch (shape) {
    case 'circle': {
      const r = Math.min(w, h) / 2;
      ctx.arc(0, 0, r, 0, Math.PI * 2, false);
      break;
    }
    case 'oval': {
      ctx.ellipse(0, 0, halfW, halfH, 0, 0, Math.PI * 2, false);
      break;
    }
    case 'pill': {
      const r = Math.min(halfW, halfH);
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(-halfW, -halfH, w, h, r);
      } else {
        ctx.arc(-halfW + r, -halfH + r, r, Math.PI, Math.PI * 1.5, false);
        ctx.lineTo(halfW - r, -halfH);
        ctx.arc(halfW - r, -halfH + r, r, Math.PI * 1.5, 0, false);
        ctx.lineTo(halfW, halfH - r);
        ctx.arc(halfW - r, halfH - r, r, 0, Math.PI * 0.5, false);
        ctx.lineTo(-halfW + r, halfH);
        ctx.arc(-halfW + r, halfH - r, r, Math.PI * 0.5, Math.PI, false);
        ctx.closePath();
      }
      break;
    }
    case 'roundedRect': {
      const r = cornerRadius !== undefined ? cornerRadius : Math.min(w, h) * 0.12;
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(-halfW, -halfH, w, h, r);
      } else {
        ctx.rect(-halfW, -halfH, w, h);
      }
      break;
    }
    case 'hexagon':
    case 'diamond':
    case 'octagon': {
      const points = getFramePoints(shape, w, h);
      if (points.length > 0) {
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.closePath();
      }
      break;
    }
    default:
      ctx.rect(-halfW, -halfH, w, h);
      break;
  }
}

export function createFrameClipShape(shape: FrameShapeType, w: number, h: number, cornerRadius?: number): any {
  switch (shape) {
    case 'circle': {
      const r = Math.min(w, h) / 2;
      return new Circle({
        radius: r,
        originX: 'center',
        originY: 'center',
      });
    }
    case 'oval': {
      return new Ellipse({
        rx: w / 2,
        ry: h / 2,
        originX: 'center',
        originY: 'center',
      });
    }
    case 'pill': {
      const r = Math.min(w, h) / 2;
      return new Rect({
        width: w,
        height: h,
        rx: r,
        ry: r,
        originX: 'center',
        originY: 'center',
      });
    }
    case 'roundedRect': {
      const r = cornerRadius !== undefined ? cornerRadius : Math.min(w, h) * 0.12;
      return new Rect({
        width: w,
        height: h,
        rx: r,
        ry: r,
        originX: 'center',
        originY: 'center',
      });
    }
    case 'hexagon':
    case 'diamond':
    case 'octagon': {
      const points = getFramePoints(shape, w, h);
      return new Polygon(points, {
        originX: 'center',
        originY: 'center',
      });
    }
    default:
      return new Rect({
        width: w,
        height: h,
        originX: 'center',
        originY: 'center',
      });
  }
}

export function createFrameOutlineShape(shape: FrameShapeType, w: number, h: number, strokeProps: any, cornerRadius?: number): any {
  switch (shape) {
    case 'circle': {
      const r = Math.min(w, h) / 2;
      return new Circle({
        ...strokeProps,
        radius: r - (strokeProps.strokeWidth || 0) / 2,
        fill: 'transparent',
        originX: 'center',
        originY: 'center',
      });
    }
    case 'oval': {
      const sw = strokeProps.strokeWidth || 0;
      return new Ellipse({
        ...strokeProps,
        rx: Math.max(1, w / 2 - sw / 2),
        ry: Math.max(1, h / 2 - sw / 2),
        fill: 'transparent',
        originX: 'center',
        originY: 'center',
      });
    }
    case 'pill': {
      const sw = strokeProps.strokeWidth || 0;
      const r = Math.min(w, h) / 2;
      return new Rect({
        ...strokeProps,
        width: Math.max(1, w - sw),
        height: Math.max(1, h - sw),
        rx: r,
        ry: r,
        fill: 'transparent',
        originX: 'center',
        originY: 'center',
      });
    }
    case 'roundedRect': {
      const sw = strokeProps.strokeWidth || 0;
      const r = cornerRadius !== undefined ? cornerRadius : Math.min(w, h) * 0.12;
      return new Rect({
        ...strokeProps,
        width: Math.max(1, w - sw),
        height: Math.max(1, h - sw),
        rx: r,
        ry: r,
        fill: 'transparent',
        originX: 'center',
        originY: 'center',
      });
    }
    case 'hexagon':
    case 'diamond':
    case 'octagon': {
      const points = getFramePoints(shape, w, h);
      return new Polygon(points, {
        ...strokeProps,
        fill: 'transparent',
        originX: 'center',
        originY: 'center',
      });
    }
    default:
      return new Rect({
        ...strokeProps,
        width: w,
        height: h,
        fill: 'transparent',
        originX: 'center',
        originY: 'center',
      });
  }
}

export async function renderImageFrame(
  el: CanvasElement,
  products: Product[],
  catalog?: Catalog
): Promise<any> {
  const frameShape = el.frameShape || 'roundedRect';
  const w = el.width || 200;
  const h = el.height || 200;

  // Resolve Stroke Properties
  const strokeColor = el.stroke || (el.frameStrokeStyle ? '#0F3D3E' : undefined);
  const strokeWidth = el.strokeWidth !== undefined ? el.strokeWidth : (strokeColor ? 2 : 0);
  let strokeDashArray: number[] | undefined = el.strokeDashArray;
  if (el.frameStrokeStyle === 'dashed') {
    strokeDashArray = [6, 4];
  } else if (el.frameStrokeStyle === 'dotted') {
    strokeDashArray = [2, 3];
  }

  // Resolve Shadow
  let fabricShadow: any = undefined;
  if (el.frameShadow && el.frameShadow !== 'none') {
    switch (el.frameShadow) {
      case 'subtle':
        fabricShadow = new Shadow({ color: 'rgba(0,0,0,0.12)', blur: 8, offsetX: 0, offsetY: 3 });
        break;
      case 'medium':
        fabricShadow = new Shadow({ color: 'rgba(0,0,0,0.22)', blur: 16, offsetX: 0, offsetY: 6 });
        break;
      case 'strong':
        fabricShadow = new Shadow({ color: 'rgba(0,0,0,0.35)', blur: 24, offsetX: 0, offsetY: 10 });
        break;
      case 'glow':
        fabricShadow = new Shadow({ color: 'rgba(16,185,129,0.45)', blur: 18, offsetX: 0, offsetY: 0 });
        break;
    }
  } else if (el.shadowBlur) {
    fabricShadow = new Shadow({
      color: el.effectColor || 'rgba(0,0,0,0.15)',
      blur: el.shadowBlur || 8,
      offsetX: el.shadowOffsetX || 0,
      offsetY: el.shadowOffsetY || 4,
    });
  }

  // Resolve Source
  let imageSrc = el.src;
  if (!imageSrc && el.productId) {
    const product = products.find((p) => p.id === el.productId) || (catalog?.products || []).find((p) => p.id === el.productId);
    if (product) {
      if (Array.isArray(product.images) && product.images.length > 0) {
        const idx = el.productImageIndex !== undefined ? el.productImageIndex : 0;
        imageSrc = product.images[idx] || product.images[0];
      } else if (product.image) {
        imageSrc = product.image;
      }
    }
  }

  // If Empty Placeholder State
  if (!imageSrc) {
    const placeholderFill = el.fill || '#f8fafc';
    const placeholderStroke = strokeColor || '#0F3D3E';
    const placeholderStrokeWidth = strokeWidth || 1.5;
    const placeholderDash = strokeDashArray || [5, 4];

    const bgShape = createFrameOutlineShape(
      frameShape,
      w,
      h,
      {
        fill: placeholderFill,
        stroke: placeholderStroke,
        strokeWidth: placeholderStrokeWidth,
        strokeDashArray: placeholderDash,
        strokeUniform: true,
      },
      el.cornerRadius
    );

    const iconBg = new Circle({
      radius: Math.min(24, Math.min(w, h) * 0.16),
      fill: 'rgba(15, 61, 62, 0.08)',
      originX: 'center',
      originY: 'center',
      top: -12,
    });

    const iconText = new FabricText('📷', {
      fontSize: Math.min(18, Math.min(w, h) * 0.12),
      originX: 'center',
      originY: 'center',
      top: -12,
    });

    const labelText = new FabricText('Drop Photo Here', {
      fontSize: Math.min(11, Math.max(9, Math.round(Math.min(w, h) * 0.06))),
      fontFamily: 'Inter, sans-serif',
      fontWeight: '600',
      fill: '#0F3D3E',
      originX: 'center',
      originY: 'center',
      top: Math.min(22, Math.min(w, h) * 0.16),
    });

    const group = new Group([bgShape, iconBg, iconText, labelText], {
      left: el.x,
      top: el.y,
      width: w,
      height: h,
      angle: el.rotation || 0,
      opacity: el.opacity ?? 1,
      originX: 'left',
      originY: 'top',
      selectable: false,
      evented: false,
      shadow: fabricShadow,
    });

    (group as any).id = el.id;
    (group as any).isFrame = true;
    (group as any).frameShape = frameShape;
    return group;
  }

  // Loaded Image State with Vector ClipMask
  try {
    const finalSrc = normalizeImageUrl(imageSrc);
    const htmlImg = await getCachedImageElement(finalSrc);
    const naturalW = htmlImg.naturalWidth || htmlImg.width || 1;
    const naturalH = htmlImg.naturalHeight || htmlImg.height || 1;

    // Determine Crop dimensions (cover-fit by default if crop not yet configured)
    let curCropX = el.cropX !== undefined ? el.cropX : 0;
    let curCropY = el.cropY !== undefined ? el.cropY : 0;
    let curCropW = el.cropWidth !== undefined ? el.cropWidth : naturalW;
    let curCropH = el.cropHeight !== undefined ? el.cropHeight : naturalH;

    if (el.cropWidth === undefined || el.cropHeight === undefined) {
      const frameRatio = w / h;
      const imgRatio = naturalW / naturalH;
      if (imgRatio > frameRatio) {
        curCropH = naturalH;
        curCropW = Math.round(naturalH * frameRatio);
        curCropX = Math.round((naturalW - curCropW) / 2);
        curCropY = 0;
      } else {
        curCropW = naturalW;
        curCropH = Math.round(naturalW / frameRatio);
        curCropX = 0;
        curCropY = Math.round((naturalH - curCropH) / 2);
      }
    }

    const imgObj = new FabricImage(htmlImg, {
      width: w,
      height: h,
      scaleX: 1,
      scaleY: 1,
      originX: 'center',
      originY: 'center',
      objectCaching: false,
    });

    (imgObj as any)._element = htmlImg;
    (imgObj as any).cropX = curCropX;
    (imgObj as any).cropY = curCropY;
    (imgObj as any).cropWidth = curCropW;
    (imgObj as any).cropHeight = curCropH;
    (imgObj as any).naturalWidth = naturalW;
    (imgObj as any).naturalHeight = naturalH;

    imgObj._render = function (ctx: CanvasRenderingContext2D) {
      const imageElement = (this as any)._element || htmlImg;
      if (!imageElement) return;
      const nw = (this as any).naturalWidth || imageElement.naturalWidth || imageElement.width || 1;
      const nh = (this as any).naturalHeight || imageElement.naturalHeight || imageElement.height || 1;
      const currentW = (this as any).width || w;
      const currentH = (this as any).height || h;

      let cropX = (this as any).cropX !== undefined ? (this as any).cropX : 0;
      let cropY = (this as any).cropY !== undefined ? (this as any).cropY : 0;
      let cropW = (this as any).cropWidth !== undefined ? (this as any).cropWidth : nw;
      let cropH = (this as any).cropHeight !== undefined ? (this as any).cropHeight : nh;

      const sx = Math.max(0, Math.min(nw - 1, cropX));
      const sy = Math.max(0, Math.min(nh - 1, cropY));
      const sw = Math.max(1, Math.min(nw - sx, cropW));
      const sh = Math.max(1, Math.min(nh - sy, cropH));

      // 1. Clip exactly to frame shape mask
      ctx.save();
      drawFrameShapePath(ctx, frameShape, currentW, currentH, el.cornerRadius);
      ctx.clip();

      // 2. Draw cropped image into the frame dimensions
      ctx.drawImage(imageElement, sx, sy, sw, sh, -currentW / 2, -currentH / 2, currentW, currentH);

      ctx.restore();
    };

    const groupChildren: any[] = [imgObj];

    // If stroke outline is configured, add it on top of the clipped image
    if (strokeColor && strokeWidth > 0) {
      const outline = createFrameOutlineShape(
        frameShape,
        w,
        h,
        {
          stroke: strokeColor,
          strokeWidth: strokeWidth,
          strokeDashArray: strokeDashArray,
          strokeUniform: true,
        },
        el.cornerRadius
      );
      groupChildren.push(outline);
    }

    const group = new Group(groupChildren, {
      left: el.x,
      top: el.y,
      width: w,
      height: h,
      angle: el.rotation || 0,
      opacity: el.opacity ?? 1,
      originX: 'left',
      originY: 'top',
      selectable: false,
      evented: false,
      shadow: fabricShadow,
    });

    (group as any).id = el.id;
    (group as any).isFrame = true;
    (group as any).frameShape = frameShape;
    (group as any).cropX = curCropX;
    (group as any).cropY = curCropY;
    (group as any).cropWidth = curCropW;
    (group as any).cropHeight = curCropH;
    (group as any).naturalWidth = naturalW;
    (group as any).naturalHeight = naturalH;

    return group;
  } catch (err) {
    console.warn('Failed to load frame image, rendering placeholder:', err);
    // Fallback to placeholder
    const bgShape = createFrameOutlineShape(
      frameShape,
      w,
      h,
      {
        fill: '#f1f5f9',
        stroke: strokeColor || '#0F3D3E',
        strokeWidth: 1.5,
        strokeDashArray: [4, 4],
        strokeUniform: true,
      },
      el.cornerRadius
    );
    const group = new Group([bgShape], {
      left: el.x,
      top: el.y,
      width: w,
      height: h,
      angle: el.rotation || 0,
      opacity: el.opacity ?? 1,
      originX: 'left',
      originY: 'top',
      selectable: false,
      evented: false,
    });
    (group as any).id = el.id;
    (group as any).isFrame = true;
    return group;
  }
}
