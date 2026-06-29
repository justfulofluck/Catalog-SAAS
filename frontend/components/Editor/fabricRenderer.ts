import { Rect, Textbox, Image as FabricImage, Circle, Polygon, Line, Group, Shadow, Gradient, filters } from 'fabric';
import { CanvasElement, ElementType, Product } from '../../types';

// ── Custom shape classes ──────────────────────────────────────────────
class CloudShape extends Rect {
  _render(ctx: CanvasRenderingContext2D) {
    const w = this.width, h = this.height;
    ctx.beginPath();
    ctx.moveTo(w * 0.2, h * 0.75);
    ctx.bezierCurveTo(w * -0.05, h * 0.75, w * -0.05, h * 0.35, w * 0.2, h * 0.35);
    ctx.bezierCurveTo(w * 0.15, h * 0.05, w * 0.45, h * 0.0, w * 0.5, h * 0.2);
    ctx.bezierCurveTo(w * 0.55, h * 0.0, w * 0.85, h * 0.05, w * 0.8, h * 0.35);
    ctx.bezierCurveTo(w * 1.05, h * 0.35, w * 1.05, h * 0.75, w * 0.8, h * 0.75);
    ctx.closePath();
    this._renderPaintInOrder(ctx);
  }
}

class WaveShape extends Rect {
  _render(ctx: CanvasRenderingContext2D) {
    const w = this.width, h = this.height;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.2);
    ctx.bezierCurveTo(w * 0.25, 0, w * 0.75, h * 0.4, w, h * 0.2);
    ctx.lineTo(w, h * 0.8);
    ctx.bezierCurveTo(w * 0.75, h, w * 0.25, h * 0.6, 0, h * 0.8);
    ctx.closePath();
    this._renderPaintInOrder(ctx);
  }
}

function rgba(color: string, opacity: number): string {
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${opacity})`;
  }
  return color;
}

function parseGradient(fillStr: string, w: number, h: number): { stops: { offset: number; color: string }[]; coords: { x1: number; y1: number; x2: number; y2: number } } | null {
  if (!fillStr || !fillStr.includes('linear-gradient')) return null;
  const match = fillStr.match(/linear-gradient\s*\(\s*([^,]+)\s*,\s*(#[a-fA-F0-9]+)\s*,\s*(#[a-fA-F0-9]+)\s*\)/i);
  if (!match) return null;
  const dir = match[1].trim();
  const c1 = match[2].trim();
  const c2 = match[3].trim();
  let coords: { x1: number; y1: number; x2: number; y2: number };
  switch (dir) {
    case 'to right': coords = { x1: 0, y1: 0, x2: w, y2: 0 }; break;
    case 'to bottom': coords = { x1: 0, y1: 0, x2: 0, y2: h }; break;
    case 'to bottom right': coords = { x1: 0, y1: 0, x2: w, y2: h }; break;
    case 'to top right': coords = { x1: 0, y1: h, x2: w, y2: 0 }; break;
    default: coords = { x1: 0, y1: 0, x2: w, y2: 0 };
  }
  return { coords, stops: [{ offset: 0, color: c1 }, { offset: 1, color: c2 }] };
}

function applyFill(obj: any, fill: string | undefined, w: number, h: number) {
  if (!fill) {
    if (typeof obj.set === 'function') obj.set('fill', '#ffffff');
    else obj.fill = '#ffffff';
    return;
  }
  const parsed = parseGradient(fill, w, h);
  if (parsed) {
    const gradient = new Gradient({
      type: 'linear',
      gradientUnits: 'pixels',
      coords: parsed.coords,
      colorStops: parsed.stops,
    });
    if (typeof obj.set === 'function') obj.set('fill', gradient);
    else obj.fill = gradient;
  } else {
    if (typeof obj.set === 'function') obj.set('fill', fill);
    else obj.fill = fill;
  }
}

function getPolyPoints(shapeType: string, w: number, h: number): { x: number; y: number }[] {
  const cx = w / 2, cy = h / 2;
  const r = Math.min(w, h) / 2;
  const pts: { x: number; y: number }[] = [];
  switch (shapeType) {
    case 'triangle': {
      for (let i = 0; i < 3; i++) {
        const a = (i * 2 * Math.PI / 3) - Math.PI / 2;
        pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
      }
      const minX = Math.min(...pts.map(p => p.x));
      const minY = Math.min(...pts.map(p => p.y));
      return pts.map(p => ({ x: p.x - minX, y: p.y - minY }));
    }
    case 'rightTriangle':
      return [{ x: 0, y: h }, { x: 0, y: 0 }, { x: w, y: h }];
    case 'diamond':
      return [{ x: cx, y: 0 }, { x: w, y: cy }, { x: cx, y: h }, { x: 0, y: cy }];
    case 'pentagon': {
      for (let i = 0; i < 5; i++) {
        const a = (i * 2 * Math.PI / 5) - Math.PI / 2;
        pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
      }
      const minX = Math.min(...pts.map(p => p.x));
      const minY = Math.min(...pts.map(p => p.y));
      return pts.map(p => ({ x: p.x - minX, y: p.y - minY }));
    }
    case 'hexagon': {
      for (let i = 0; i < 6; i++) {
        const a = (i * 2 * Math.PI / 6) - Math.PI / 2;
        pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
      }
      const minX = Math.min(...pts.map(p => p.x));
      const minY = Math.min(...pts.map(p => p.y));
      return pts.map(p => ({ x: p.x - minX, y: p.y - minY }));
    }
    case 'octagon': {
      for (let i = 0; i < 8; i++) {
        const a = (i * 2 * Math.PI / 8) - Math.PI / 2;
        pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
      }
      const minX = Math.min(...pts.map(p => p.x));
      const minY = Math.min(...pts.map(p => p.y));
      return pts.map(p => ({ x: p.x - minX, y: p.y - minY }));
    }
    case 'star': {
      const innerR = r * 0.4;
      for (let i = 0; i < 10; i++) {
        const a = (i * Math.PI / 5) - Math.PI / 2;
        const cr = i % 2 === 0 ? r : innerR;
        pts.push({ x: cx + cr * Math.cos(a), y: cy + cr * Math.sin(a) });
      }
      const minX = Math.min(...pts.map(p => p.x));
      const minY = Math.min(...pts.map(p => p.y));
      return pts.map(p => ({ x: p.x - minX, y: p.y - minY }));
    }
    case 'parallelogram': {
      const skew = w * 0.2;
      return [{ x: skew, y: 0 }, { x: w, y: 0 }, { x: w - skew, y: h }, { x: 0, y: h }];
    }
    case 'cross': {
      const t = Math.min(w, h) * 0.3;
      return [
        { x: cx - t, y: 0 }, { x: cx + t, y: 0 },
        { x: cx + t, y: cy - t }, { x: w, y: cy - t },
        { x: w, y: cy + t }, { x: cx + t, y: cy + t },
        { x: cx + t, y: h }, { x: cx - t, y: h },
        { x: cx - t, y: cy + t }, { x: 0, y: cy + t },
        { x: 0, y: cy - t }, { x: cx - t, y: cy - t },
      ];
    }
    default:
      return [{ x: 0, y: 0 }, { x: w, y: 0 }, { x: w, y: h }, { x: 0, y: h }];
  }
}

function buildShape(
  shapeType: string, w: number, h: number,
  stroke: string | undefined, strokeWidth: number,
  fill: string | undefined, fallbackFill: string | undefined,
): any {
  const fillColor = fill || fallbackFill || '#cbd5e1';
  const shapeProps: Record<string, any> = { stroke, strokeWidth };

  switch (shapeType) {
    case 'rect':
      return new Rect({ ...shapeProps, width: w, height: h, fill: fillColor });
    case 'roundedRect': {
      const r = Math.min(w, h) * 0.15;
      return new Rect({ ...shapeProps, width: w, height: h, rx: r, ry: r, fill: fillColor });
    }
    case 'pill': {
      const pr = Math.min(w, h) / 2;
      return new Rect({ ...shapeProps, width: w, height: h, rx: pr, ry: pr, fill: fillColor });
    }
    case 'circle':
      return new Circle({ ...shapeProps, radius: Math.min(w, h) / 2, fill: fillColor });
    case 'line':
      return new Line([0, h / 2, w, h / 2], {
        stroke: stroke || fillColor || '#000000',
        strokeWidth: strokeWidth || 2, fill: 'transparent',
      });
    case 'cloud':
      return new CloudShape({ ...shapeProps, width: w, height: h, fill: fillColor });
    case 'wave':
      return new WaveShape({ ...shapeProps, width: w, height: h, fill: fillColor });
    case 'arrow': {
      const headLen = 10;
      const lx = w - headLen;
      return new Group([
        new Line([0, h / 2, lx, h / 2], {
          stroke: stroke || fillColor, strokeWidth: strokeWidth || 4, fill: 'transparent',
        }),
        new Polygon([{ x: lx, y: h / 2 - headLen / 2 }, { x: w, y: h / 2 }, { x: lx, y: h / 2 + headLen / 2 }], {
          fill: stroke || fillColor, stroke: stroke || fillColor, strokeWidth: 1,
        }),
      ], {});
    }
    case 'arrow4': {
      const a4Stroke = Math.max(strokeWidth || 3, 3);
      const hl = a4Stroke * 4;
      return new Group([
        new Line([hl, h / 2, w - hl, h / 2], {
          stroke: stroke || fillColor, strokeWidth: a4Stroke, fill: 'transparent',
        }),
        new Polygon([{ x: w - hl, y: h / 2 - hl / 2 }, { x: w, y: h / 2 }, { x: w - hl, y: h / 2 + hl / 2 }], {
          fill: stroke || fillColor, stroke: stroke || fillColor, strokeWidth: 1,
        }),
        new Polygon([{ x: hl, y: h / 2 - hl / 2 }, { x: 0, y: h / 2 }, { x: hl, y: h / 2 + hl / 2 }], {
          fill: stroke || fillColor, stroke: stroke || fillColor, strokeWidth: 1,
        }),
      ], {});
    }
    default: {
      const pts = getPolyPoints(shapeType, w, h);
      if (pts.length >= 3) return new Polygon(pts, { ...shapeProps, fill: fillColor });
      return new Rect({ ...shapeProps, width: w, height: h, fill: fillColor });
    }
  }
}

function generateRichTextSvg(el: CanvasElement): string {
  const safeText = (el.text || '')
    .replace(/&nbsp;/g, '&#160;').replace(/<br>/g, '<br/>')
    .replace(/&(?!(amp|lt|gt|quot|apos|#[0-9]+);)/g, '&amp;');
  const fontName = (el.fontFamily || 'Inter').replace(/\s+/g, '+');
  const fontImport = `@import url('https://fonts.googleapis.com/css2?family=${fontName}&display=swap');`;
  const isGradient = el.fill?.includes('gradient');
  const color = el.effectColor || '#000000';
  const color2 = el.effectColor2 || '#00fff9';
  const offX = el.shadowOffsetX || 0;
  const offY = el.shadowOffsetY || 0;
  const blurS = el.shadowBlur || 0;
  const opacity = (el.shadowOpacity !== undefined && el.shadowOpacity !== null) ? el.shadowOpacity : 0.5;
  const thickness = el.textStrokeWidth || 1;
  const spread = (el.effectSpread !== undefined && el.effectSpread !== null) ? el.effectSpread : 0;
  const roundness = (el.effectRoundness !== undefined && el.effectRoundness !== null) ? el.effectRoundness : 4;

  let effectStyles = '';
  if (el.effectStyle && el.effectStyle !== 'none') {
    switch (el.effectStyle) {
      case 'hollow': effectStyles = `-webkit-text-stroke: ${thickness}px ${color}; color: transparent;`; break;
      case 'outline': effectStyles = `-webkit-text-stroke: ${thickness}px ${color};`; break;
      case 'shadow': effectStyles = `text-shadow: ${offX}px ${offY}px ${blurS}px ${rgba(color, opacity)};`; break;
      case 'lift': effectStyles = `text-shadow: 0px 4px ${blurS}px rgba(0,0,0,${opacity});`; break;
      case 'neon': effectStyles = `color: ${color}; text-shadow: ${opacity > 0 ? `0 0 ${5 * opacity}px ${color}, 0 0 ${10 * opacity}px ${color}, 0 0 ${20 * opacity}px ${color}` : 'none'};`; break;
      case 'glitch': effectStyles = `text-shadow: ${offX}px ${offY}px 0 ${color}, ${-offX}px ${-offY}px 0 ${color2};`; break;
      case 'echo': effectStyles = `text-shadow: ${offX}px ${offY}px 0px ${color}aa, ${offX * 2}px ${offY * 2}px 0px ${color}66, ${offX * 3}px ${offY * 3}px 0px ${color}33;`; break;
      case 'splice': effectStyles = `-webkit-text-stroke: ${thickness}px ${color}; text-shadow: ${offX}px ${offY}px 0px ${color}88;`; break;
      case 'background': effectStyles = `background: ${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}; padding: ${spread / 4}px ${spread / 2}px; border-radius: ${roundness}px; box-decoration-break: clone; -webkit-box-decoration-break: clone; display: inline-block;`; break;
    }
  }

  const gradientStyle = isGradient ? `background: ${el.fill}; -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent;` : `color: ${el.fill || '#000000'};`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${el.width}" height="${el.height}">
    <foreignObject width="100%" height="100%">
      <div xmlns="http://www.w3.org/1999/xhtml" style="width:100%;height:100%;display:flex;align-items:${el.verticalAlign === 'middle' ? 'center' : (el.verticalAlign === 'bottom' ? 'flex-end' : 'flex-start')};justify-content:${el.textAlign || 'left'};box-sizing:border-box;">
        <style>${fontImport}</style>
        <div style="font-size:${el.fontSize || 16}px;font-family:${el.fontFamily || 'Inter'};font-weight:${el.fontWeight || 'normal'};font-style:${el.fontStyle || 'normal'};text-decoration:${el.textDecoration || 'none'};text-align:${el.textAlign || 'left'};line-height:${el.lineHeight || 1.2};letter-spacing:${el.letterSpacing || 0}px;${gradientStyle}width:100%;padding:5px;box-sizing:border-box;${effectStyles}white-space:pre-wrap;word-break:break-word;">${safeText}</div>
      </div>
    </foreignObject>
  </svg>`;
}

async function loadSvgAsImage(svgString: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const encoded = btoa(unescape(encodeURIComponent(svgString)));
    img.src = `data:image/svg+xml;base64,${encoded}`;
    img.onload = () => resolve(img);
    img.onerror = reject;
  });
}

export async function elementToFabricObject(
  el: CanvasElement,
  products: Product[],
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
  };
  common.id = el.id;

  const setCommon = (obj: any) => {
    Object.entries(common).forEach(([k, v]) => { try { obj.set(k as any, v); } catch {} });
  };

  if (elType === 'text') {
    const hasMixedStyles = /<[a-z]+[^>]*style\s*=|color:\s*|font-size:\s*|font-family:\s*/.test(el.text || '');
    const isRichText = hasMixedStyles || (el.fill?.includes('gradient') ?? false);
    const hasEffect = el.effectStyle && el.effectStyle !== 'none';
    const useSvgFallback = isRichText;

    if (useSvgFallback) {
      try {
        const svg = generateRichTextSvg(el);
        const htmlImg = await loadSvgAsImage(svg);
        const img = await FabricImage.fromURL(htmlImg.src);
        img.set({ ...common, width: el.width, height: el.height, scaleX: 1, scaleY: 1 });
        return img;
      } catch (err) {
        console.warn('Failed to render rich text SVG, falling back to plain text:', err);
        // Fall through to plain text rendering
      }
    }

    const textProps: Record<string, any> = {
      ...common, width: el.width,
      text: (el.text || '').replace(/<[^>]*>/g, ''),
      fontSize: el.fontSize || 16,
      fontFamily: el.fontFamily || 'Inter',
      fontWeight: el.fontWeight || 'normal',
      fontStyle: el.fontStyle || 'normal',
      textAlign: el.textAlign || 'left',
      lineHeight: el.lineHeight || 1.2,
      splitByGrapheme: false,
    };
    applyFill(textProps, el.fill, el.width, el.height);

    if (hasEffect) {
      const color = el.effectColor || '#000000';
      const b = el.shadowBlur || 0;
      const ox = el.shadowOffsetX || 0;
      const oy = el.shadowOffsetY || 0;
      const op = (el.shadowOpacity !== undefined && el.shadowOpacity !== null) ? el.shadowOpacity : 0.5;

      if (el.effectStyle === 'shadow') {
        textProps.shadow = new Shadow({ color: rgba(color, op), blur: b, offsetX: ox, offsetY: oy });
      } else if (el.effectStyle === 'lift') {
        textProps.shadow = new Shadow({ color: `rgba(0,0,0,${op})`, blur: b, offsetX: 0, offsetY: 4 });
      } else if (el.effectStyle === 'hollow') {
        textProps.fill = 'transparent'; textProps.stroke = color; textProps.strokeWidth = el.textStrokeWidth || 1;
      } else if (el.effectStyle === 'outline') {
        textProps.stroke = color; textProps.strokeWidth = el.textStrokeWidth || 1;
      }

      if (['neon', 'glitch', 'echo', 'splice', 'background'].includes(el.effectStyle!)) {
        const children: any[] = [];
        const baseProps: Record<string, any> = { ...textProps };
        delete baseProps.id; delete baseProps.selectable; delete baseProps.visible;

        if (el.effectStyle === 'neon') {
          [b * 3, b * 1.5, b * 0.5].forEach((blurVal) => {
            children.push(new Textbox(el.text?.replace(/<[^>]*>/g, '') || '', {
              ...baseProps, fill: color,
              shadow: new Shadow({ color, blur: blurVal }),
              evented: false, selectable: false,
            }));
          });
          children.push(new Textbox(el.text?.replace(/<[^>]*>/g, '') || '', {
            ...baseProps, fill: el.fill || '#000000', evented: false, selectable: false,
          }));
        } else if (el.effectStyle === 'glitch') {
          const color2 = el.effectColor2 || '#00fff9';
          children.push(new Textbox(el.text?.replace(/<[^>]*>/g, '') || '', {
            ...baseProps, left: -ox, fill: color, evented: false, selectable: false,
          }));
          children.push(new Textbox(el.text?.replace(/<[^>]*>/g, '') || '', {
            ...baseProps, left: ox, fill: color2, evented: false, selectable: false,
          }));
          children.push(new Textbox(el.text?.replace(/<[^>]*>/g, '') || '', {
            ...baseProps, left: 0, fill: el.fill || '#000000', evented: false, selectable: false,
          }));
        } else if (el.effectStyle === 'echo') {
          for (let i = 3; i >= 1; i--) {
            children.push(new Textbox(el.text?.replace(/<[^>]*>/g, '') || '', {
              ...baseProps, left: ox * i, top: oy * i,
              fill: color, opacity: 0.2 * i, evented: false, selectable: false,
            }));
          }
          children.push(new Textbox(el.text?.replace(/<[^>]*>/g, '') || '', {
            ...baseProps, left: 0, fill: el.fill || '#000000', evented: false, selectable: false,
          }));
        } else if (el.effectStyle === 'splice') {
          children.push(new Textbox(el.text?.replace(/<[^>]*>/g, '') || '', {
            ...baseProps, left: ox, top: oy, fill: color, opacity: 0.8, evented: false, selectable: false,
          }));
          children.push(new Textbox(el.text?.replace(/<[^>]*>/g, '') || '', {
            ...baseProps, left: 0, stroke: color, strokeWidth: el.textStrokeWidth || 1,
            fill: el.fill || '#000000', evented: false, selectable: false,
          }));
        } else if (el.effectStyle === 'background') {
          const spread = el.effectSpread || 0;
          const roundness = el.effectRoundness || 4;
          children.push(new Rect({
            left: -spread / 2, top: 0, width: el.width + spread, height: el.height,
            fill: rgba(color, op), rx: roundness, ry: roundness, evented: false, selectable: false,
          }));
          children.push(new Textbox(el.text?.replace(/<[^>]*>/g, '') || '', {
            ...baseProps, left: 0, selectable: false, evented: false,
          }));
        }

        const group = new Group(children, { left: el.x, top: el.y, originX: 'left', originY: 'top' });
        (group as any).id = el.id;
        (group as any).angle = el.rotation || 0;
        (group as any).opacity = el.opacity ?? 1;
        return group;
      }
    }

    const tb = new Textbox(textProps.text, textProps);
    setCommon(tb);
    return tb;
  }

  if (elType === 'image') {
    if (!el.src) return null;
    try {
      const img = await FabricImage.fromURL(el.src);
      img.set({
        ...common,
        scaleX: el.width / (img.width || 1),
        scaleY: el.height / (img.height || 1),
      });
      if (el.filters) {
        const fabricFilters: any[] = [];
        if (el.filters.brightness !== undefined && el.filters.brightness !== 0) {
          fabricFilters.push(new filters.Brightness({ brightness: el.filters.brightness / 100 }));
        }
        if (el.filters.blur !== undefined && el.filters.blur !== 0) {
          fabricFilters.push(new filters.Blur({ blur: el.filters.blur / 100 }));
        }
        if (el.filters.contrast !== undefined && el.filters.contrast !== 0) {
          fabricFilters.push(new filters.Contrast({ contrast: el.filters.contrast / 100 }));
        }
        if (fabricFilters.length > 0) {
          (img as any).filters = fabricFilters;
          img.applyFilters();
        }
      }
      return img;
    } catch { return null; }
  }

  if (elType === 'shape' || elType === 'comment') {
    const w = el.width, h = el.height;
    const shapeType = el.shapeType || 'rect';
    const strokeColor = el.stroke || undefined;
    const strokeWidth = el.strokeWidth || 0;
    const isGradient = el.fill?.includes('linear-gradient');
    const useSvgForGradient = isGradient && ['cloud', 'wave'].includes(shapeType);
    const isRichTextShape = el.fill?.includes('gradient');
    const useSvgFallback = isRichTextShape && shapeType !== 'cloud' && shapeType !== 'wave';

    if (el.iconConfig) {
      const ic = el.iconConfig;
      const iconSize = ic.size || (Math.min(w, h) * 0.5);
      const children: any[] = [];
      const shapeObj = buildShape(shapeType, w, h, strokeColor, strokeWidth, el.fill, el.fill);
      if (shapeObj) children.push(shapeObj);
      children.push(new Textbox(ic.iconName, {
        left: 0, top: 0, width: w, height: h,
        fontSize: iconSize, fontFamily: ic.iconLibrary === 'fontawesome' ? 'Font Awesome 6 Free' : 'Inter',
        fill: ic.color || '#ffffff', textAlign: 'center', text: ic.iconName,
        fontWeight: '900' as any, selectable: false, evented: false,
      }));
      const group = new Group(children, { left: el.x, top: el.y, originX: 'left', originY: 'top' });
      (group as any).id = el.id;
      (group as any).angle = el.rotation || 0;
      (group as any).opacity = el.opacity ?? 1;
      return group;
    }

    if (useSvgForGradient) {
      try {
        const svg = generateRichTextSvg(el);
        const htmlImg = await loadSvgAsImage(svg);
        const img = await FabricImage.fromURL(htmlImg.src);
        img.set({ ...common, width: w, height: h, scaleX: 1, scaleY: 1 });
        return img;
      } catch (err) {
        console.warn('Failed to render shape gradient SVG:', err);
      }
    }

    const obj = buildShape(shapeType, w, h, strokeColor, strokeWidth, el.fill, el.fill);
    if (obj) {
      setCommon(obj);
      obj.set({ width: w, height: h });
      if (obj instanceof Circle) obj.set({ radius: Math.min(w, h) / 2 });
    }
    return obj;
  }

  if (elType === 'product-block') {
    const objs: any[] = [];
    objs.push(new Rect({
      left: 0, top: 0, width: el.width, height: el.height,
      fill: '#ffffff', stroke: '#e2e8f0', strokeWidth: 2, rx: 8, ry: 8,
    }));
    const product = products.find(p => p.id === el.productId);
    if (product) {
      if (product.image || el.src) {
        try {
          const img = await FabricImage.fromURL(el.src || product.image);
          const targetH = el.height * 0.6;
          img.set({
            left: 0, top: 0,
            scaleX: el.width / (img.width || 1),
            scaleY: targetH / (img.height || 1),
          });
          objs.push(img);
        } catch {}
      }
      objs.push(new Textbox(product.name || 'Unnamed Product', {
        left: 10, top: el.height * 0.6 + 10, width: el.width - 20,
        fontSize: Math.max(12, el.width * 0.05),
        fontFamily: 'Inter', fontWeight: 'bold', fill: '#0f172a', splitByGrapheme: false,
      }));
      objs.push(new Textbox(`₹${product.price || '0'}`, {
        left: 10, top: el.height * 0.6 + Math.max(12, el.width * 0.05) + 15, width: el.width - 20,
        fontSize: Math.max(10, el.width * 0.04),
        fontFamily: 'Inter', fill: '#4f46e5', fontWeight: 'bold', splitByGrapheme: false,
      }));
    } else {
      objs.push(new Textbox('EMPTY SLOT', {
        left: 0, top: el.height / 2 - 10, width: el.width,
        fontSize: 14, fontFamily: 'Inter', fontWeight: 'bold', fill: '#94a3b8',
        textAlign: 'center', splitByGrapheme: false,
      }));
    }
    const group = new Group(objs, { left: el.x, top: el.y, width: el.width, height: el.height, originX: 'left', originY: 'top' });
    (group as any).id = el.id;
    (group as any).angle = el.rotation || 0;
    (group as any).opacity = el.opacity ?? 1;
    return group;
  }

  return null;
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
