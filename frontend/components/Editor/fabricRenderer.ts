import { Rect, Textbox, Image as FabricImage, Circle, Polygon, Line, Group, Shadow, Gradient, filters, config } from 'fabric';
import { CanvasElement, ElementType, Product, Catalog } from '../../types';
import { workerPool } from '../../utils/workerPool';
import { useStore } from '../../store/useStore';
import { resolveFieldLabel } from '../../utils/fieldUtils';
import { normalizeImageUrl } from '../../utils/imageUtils';
import { applyCanvaSelectionStyle } from '../../utils/canvaControls';

// Ensure all fabric images are loaded with crossOrigin = 'anonymous' to prevent tainted canvases
config.imageProperties = { ...config.imageProperties, crossOrigin: 'anonymous' };

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

export function parseGradient(fillStr: string, w: number, h: number): { stops: { offset: number; color: string }[]; coords: { x1: number; y1: number; x2: number; y2: number } } | null {
  if (!fillStr || !fillStr.includes('linear-gradient')) return null;

  // Extract contents inside linear-gradient(...)
  const innerMatch = fillStr.match(/linear-gradient\s*\((.*)\)/i);
  if (!innerMatch) return null;

  // Split arguments by comma respecting parenthesis
  const parts: string[] = [];
  let current = '';
  let parenDepth = 0;
  for (const ch of innerMatch[1]) {
    if (ch === '(') parenDepth++;
    else if (ch === ')') parenDepth--;
    if (ch === ',' && parenDepth === 0) {
      parts.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) parts.push(current.trim());

  if (parts.length < 2) return null;

  let dir = 'to right';
  let colorParts: string[] = [];

  const firstPart = parts[0].toLowerCase();
  if (firstPart.includes('deg') || firstPart.startsWith('to ')) {
    dir = parts[0];
    colorParts = parts.slice(1);
  } else {
    colorParts = parts;
  }

  if (colorParts.length < 2) return null;

  let coords: { x1: number; y1: number; x2: number; y2: number };
  const d = dir.toLowerCase().trim();

  if (d.includes('deg')) {
    const angle = parseFloat(d) || 0;
    const rad = ((angle - 90) * Math.PI) / 180;
    const cx = w / 2;
    const cy = h / 2;
    const halfLen = Math.hypot(w, h) / 2;
    coords = {
      x1: Math.round(cx - Math.cos(rad) * halfLen),
      y1: Math.round(cy - Math.sin(rad) * halfLen),
      x2: Math.round(cx + Math.cos(rad) * halfLen),
      y2: Math.round(cy + Math.sin(rad) * halfLen),
    };
  } else {
    switch (d) {
      case 'to right': coords = { x1: 0, y1: 0, x2: w, y2: 0 }; break;
      case 'to left': coords = { x1: w, y1: 0, x2: 0, y2: 0 }; break;
      case 'to bottom': coords = { x1: 0, y1: 0, x2: 0, y2: h }; break;
      case 'to top': coords = { x1: 0, y1: h, x2: 0, y2: 0 }; break;
      case 'to bottom right':
      case 'to right bottom': coords = { x1: 0, y1: 0, x2: w, y2: h }; break;
      case 'to top right':
      case 'to right top': coords = { x1: 0, y1: h, x2: w, y2: 0 }; break;
      case 'to bottom left':
      case 'to left bottom': coords = { x1: w, y1: 0, x2: 0, y2: h }; break;
      case 'to top left':
      case 'to left top': coords = { x1: w, y1: h, x2: 0, y2: 0 }; break;
      default: coords = { x1: 0, y1: 0, x2: w, y2: 0 };
    }
  }

  const stops = colorParts.map((c, i) => {
    // Parse color and optional offset e.g. "#FF0000 50%"
    const cTokens = c.trim().split(/\s+(?=[0-9%])/);
    const colorStr = cTokens[0].trim();
    let offset = i / (colorParts.length - 1);
    if (cTokens.length > 1) {
      const parsedOffset = parseFloat(cTokens[1]);
      if (!isNaN(parsedOffset)) {
        offset = cTokens[1].includes('%') ? parsedOffset / 100 : parsedOffset;
      }
    }
    return { offset, color: colorStr };
  });

  return { coords, stops };
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

export function getPolyPoints(shapeType: string, w: number, h: number): { x: number; y: number }[] {
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
    case 'triangleDown': {
      for (let i = 0; i < 3; i++) {
        const a = (i * 2 * Math.PI / 3) + Math.PI / 2;
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

export function buildShape(
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
        <div style="font-size:${el.fontSize || 16}px;font-family:${el.fontFamily || 'Inter'};font-weight:${el.fontWeight || 'normal'};font-style:${el.fontStyle || 'normal'};text-decoration:${el.textDecoration || 'none'};text-align:${el.textAlign || 'left'};line-height:${el.lineHeight || 1.2};letter-spacing:${(el.letterSpacing || 0) / 1000}em;${gradientStyle}width:100%;padding:5px;box-sizing:border-box;${effectStyles}white-space:pre-wrap;word-break:break-word;">${safeText}</div>
      </div>
    </foreignObject>
  </svg>`;
}

async function loadSvgAsImage(svgString: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    const encoded = btoa(unescape(encodeURIComponent(svgString)));
    img.src = `data:image/svg+xml;base64,${encoded}`;
    img.onload = () => resolve(img);
    img.onerror = reject;
  });
}

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
        const img = await FabricImage.fromURL(htmlImg.src, { crossOrigin: 'anonymous' });
        img.set({ ...common, width: el.width, height: el.height, scaleX: 1, scaleY: 1 });
        return img;
      } catch (err) {
        console.warn('Failed to render rich text SVG, falling back to plain text:', err);
        // Fall through to plain text rendering
      }
    }

    const cleanRawText = (el.text || '').replace(/<[^>]*>/g, '');
    let textWidth = el.width || 100;
    if (!cleanRawText.includes('\n')) {
      const estimatedMinW = Math.ceil(cleanRawText.length * (el.fontSize || 16) * 0.72);
      if (textWidth < estimatedMinW) {
        textWidth = estimatedMinW + 20;
      }
    }

    const textProps: Record<string, any> = {
      ...common,
      width: textWidth,
      text: cleanRawText,
      fontSize: el.fontSize || 16,
      fontFamily: el.fontFamily || 'Inter',
      fontWeight: el.fontWeight || 'normal',
      fontStyle: el.fontStyle || 'normal',
      textAlign: el.textAlign || 'left',
      lineHeight: el.lineHeight || 1.2,
      underline: el.textDecoration?.includes('underline') || false,
      charSpacing: el.letterSpacing || 0,
      splitByGrapheme: false,
    };
    applyFill(textProps, el.fill, textWidth, el.height);

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

        const group = new Group(children, {
          left: el.x,
          top: el.y,
          angle: el.rotation || 0,
          originX: 'left',
          originY: 'top',
          opacity: el.opacity ?? 1,
        });
        (group as any).id = el.id;
        return group;
      }
    }

    const tb = new Textbox(textProps.text, textProps);
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

      let img: FabricImage;
      try {
        img = await FabricImage.fromURL(finalSrc, { crossOrigin: 'anonymous' });
      } catch {
        img = await FabricImage.fromURL(finalSrc);
      }
      img.set({
        ...common,
        scaleX: el.width / (img.width || 1),
        scaleY: el.height / (img.height || 1),
      });

      if (finalSrc === el.src && el.filters) {
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
    } catch {
      // Fallback if image fails to load (CORS, broken link, etc.)
      const rect = new Rect({ ...common, fill: '#e2e8f0', stroke: '#94a3b8', strokeWidth: 1, strokeDashArray: [5, 5] });
      return rect;
    }
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
      const iconFontFamily = (ic as any).fontFamily || (ic.iconLibrary === 'fontawesome' ? 'Font Awesome 6 Free' : 'Inter');
      const iconFontWeight = (ic as any).fontWeight || ('900' as any);
      children.push(new Textbox(ic.iconName, {
        left: 0, top: Math.max(0, (h - iconSize * 1.15) / 2), width: w, height: h,
        fontSize: iconSize, fontFamily: iconFontFamily,
        fill: ic.color || '#ffffff', textAlign: 'center', text: ic.iconName,
        fontWeight: iconFontWeight, selectable: false, evented: false,
      }));
      const group = new Group(children, {
        left: el.x,
        top: el.y,
        angle: el.rotation || 0,
        originX: 'left',
        originY: 'top',
        opacity: el.opacity ?? 1,
      });
      (group as any).id = el.id;
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
      originX: 'left', originY: 'top',
      fill: '#ffffff', stroke: '#e2e8f0', strokeWidth: 1.5, rx: 4, ry: 4,
    }));
    const product = products.find(p => p.id === el.productId);
    if (product) {
      const cardPadding = Math.max(6, Math.min(14, el.width * 0.04));
      const contentWidth = el.width - cardPadding * 2;
      
      // Prepare Details, SKU & Custom Fields first so we can gauge content volume
      let detailLines: string[] = [];
      if (catalog?.showSKU !== false && product.sku) {
        detailLines.push(`SKU: ${product.sku}`);
      }
      if (product.description) {
        detailLines.push(product.description);
      }
      
      if (product.customFields && Object.keys(product.customFields).length > 0) {
        const categories = useStore.getState().categories || [];
        const catId = product.categoryId ? String(product.categoryId) : '';
        // Look up by string catId or matching category
        const visibleParamKeys: string[] | null = 
          (catalog?.categoryVisibleParams && (
            catalog.categoryVisibleParams[catId] ||
            catalog.categoryVisibleParams[String(product.categoryId)] ||
            Object.entries(catalog.categoryVisibleParams).find(([k]) => String(k) === catId)?.[1]
          )) || null;

        const fields = Object.entries(product.customFields)
          .filter(([k, v]) => {
            if (v === undefined || v === null || v === '' || typeof v === 'object') return false;
            if (visibleParamKeys !== null) {
              const label = resolveFieldLabel(k, categories, product);
              const normLabel = label ? label.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
              const normKey = k.toLowerCase().replace(/[^a-z0-9]/g, '');

              // Check if any enabled key matches the field key, id, or normalized label
              const isMatch = visibleParamKeys.some(vk => {
                const normVk = vk.toLowerCase().replace(/[^a-z0-9]/g, '');
                return vk === k || normVk === normKey || (normLabel && normVk === normLabel);
              });
              return isMatch;
            }
            return true;
          }) 
          .map(([k, v]) => {
             const label = resolveFieldLabel(k, categories, product);
             if (!label) return null;
             return `• ${label}: ${v}`;
          })
          .filter(Boolean) as string[];

        if (fields.length > 0) {
          detailLines = detailLines.concat(fields);
        }
      }

      // Proportional Balancing:
      // If content is short (fewer lines), give more vertical space to the product image (up to 52%)
      // and allow a healthier font size and line-height so the card is elegantly filled.
      const lineCount = detailLines.length;
      let imgRatio = 0.44;
      if (lineCount <= 4) {
        imgRatio = 0.52;
      } else if (lineCount <= 7) {
        imgRatio = 0.48;
      } else if (lineCount > 11) {
        imgRatio = 0.38;
      }

      const maxImgH = Math.max(40, el.height * imgRatio);
      const imgTop = cardPadding;

      if (product.image || el.src) {
        try {
          const rawUrl = el.src || product.image;
          const imgUrl = normalizeImageUrl(rawUrl);
          let img: FabricImage;
          try {
            img = await FabricImage.fromURL(imgUrl, { crossOrigin: 'anonymous' });
          } catch {
            img = await FabricImage.fromURL(imgUrl);
          }
          
          const naturalW = img.width || 1;
          const naturalH = img.height || 1;
          // Contain calculation with inner padding
          const availableImgW = contentWidth;
          const availableImgH = maxImgH - cardPadding;
          const imgScale = Math.min(availableImgW / naturalW, availableImgH / naturalH, 1.8);
          
          const renderedW = naturalW * imgScale;
          const renderedH = naturalH * imgScale;
          
          // Center image horizontally and vertically within its allocated area
          const imgLeft = cardPadding + (contentWidth - renderedW) / 2;
          const imgY = imgTop + (availableImgH - renderedH) / 2;
          
          img.set({
            left: imgLeft,
            top: imgY,
            originX: 'left',
            originY: 'top',
            scaleX: imgScale,
            scaleY: imgScale,
          });
          objs.push(img);
        } catch {}
      }

      let currentTop = imgTop + maxImgH + 6;
      const cardFontFamily = (el as any).fontFamily || (catalog as any).fontFamily || 'Inter';

      // Product Title / Name - Bada aur Prominent
      if (catalog?.showTitle !== false) {
        const titleFontSize = Math.max(11, Math.min(16, Math.round(el.width * 0.065)));
        const nameText = new Textbox(product.name || 'Unnamed Product', {
          left: cardPadding, top: currentTop, width: contentWidth,
          originX: 'left', originY: 'top',
          fontSize: titleFontSize,
          fontFamily: cardFontFamily, fontWeight: 'bold', fill: '#0f172a', splitByGrapheme: false,
          lineHeight: 1.2,
        });
        objs.push(nameText);
        currentTop += (nameText.height || (titleFontSize * 1.25)) + 4;
      }
      
      // Price - Bada, Clear aur Vibrant
      if (catalog?.showPrice !== false) {
        const priceFontSize = Math.max(11, Math.min(15, Math.round(el.width * 0.058)));
        const priceText = new Textbox(`${product.currency || '₹'}${product.price || '0'}`, {
          left: cardPadding, top: currentTop, width: contentWidth,
          originX: 'left', originY: 'top',
          fontSize: priceFontSize,
          fontFamily: cardFontFamily, fill: '#4f46e5', fontWeight: 'bold', splitByGrapheme: false,
          lineHeight: 1.15,
        });
        objs.push(priceText);
        currentTop += (priceText.height || (priceFontSize * 1.2)) + 6;
      }
      
      const fullText = detailLines.join('\n');
      if (fullText.trim() && (el.height - currentTop) > 10) {
        // Dynamically compute font size & line-height using the bottom space
        const availableTextH = el.height - currentTop - cardPadding;
        const targetLineHeight = lineCount <= 5 ? 1.35 : (lineCount <= 8 ? 1.25 : 1.18);
        const autoFontSize = Math.min(
          11,
          Math.max(7.5, Math.floor(availableTextH / Math.max(1, lineCount * targetLineHeight)))
        );

        const descText = new Textbox(fullText, {
          left: cardPadding, top: currentTop, width: contentWidth,
          originX: 'left', originY: 'top',
          fontSize: autoFontSize,
          fontFamily: cardFontFamily, fill: '#475569', splitByGrapheme: false,
          lineHeight: targetLineHeight,
        });
        objs.push(descText);
      }
    } else {
      objs.push(new Textbox('EMPTY SLOT', {
        left: 0, top: el.height / 2 - 10, width: el.width,
        originX: 'left', originY: 'top',
        fontSize: 12, fontFamily: 'Inter', fontWeight: 'bold', fill: '#94a3b8',
        textAlign: 'center', splitByGrapheme: false,
      }));
    }
    
    // Add clipPath to the group to ensure nothing bleeds out of the card
    const clipPath = new Rect({
      left: -el.width / 2, top: -el.height / 2, // Group clipPath is relative to group center
      width: el.width, height: el.height,
      originX: 'left', originY: 'top',
      rx: 0, ry: 0
    });
    
    const group = new Group(objs, { 
      left: el.x,
      top: el.y,
      angle: el.rotation || 0,
      width: el.width,
      height: el.height,
      originX: 'left',
      originY: 'top',
      clipPath: clipPath,
      opacity: el.opacity ?? 1,
      objectCaching: false,
      subTargetCheck: true,
    });

    (group as any).id = el.id;
    return group;
  }

  if (el.type === 'table') {
    const td = el.tableData || {
      headers: ['MODEL NO', 'PRODUCTS', 'CUT-OUT', 'COLOR', 'DEALER PRICE', 'PACKING'],
      rows: [
        ['VT-2612', '12W V-TAC COB WHITE BODY', '75MM', 'W, W.W, N.W', '580', '20 PCS'],
        ['VT-2612', '12W VTAC 3IN1 ON SWITCH', '75MM', 'W, W.W, N.W', '1,000', '20 PCS'],
        ['VT-2612', '12W V-TAC COB DIMMABLE', '75MM', 'W, W.W, N.W', '1,500', '20 PCS']
      ]
    };

    const headerBg = td.headerBg || '#002b36'; // Dark Teal / Navy Blue like V-TAC
    const headerTextColor = td.headerTextColor || '#ffffff';
    const rowBg = td.rowBg || '#ffffff';
    const alternateRowBg = td.alternateRowBg || '#f8fafc';
    const borderColor = td.borderColor || '#334155';
    const cellPadding = td.cellPadding || 6;
    const headerFontSize = td.headerFontSize || 9.5;
    const bodyFontSize = td.fontSize || 8.5;

    const numCols = td.headers.length || 1;
    const numRows = (td.rows?.length || 0);

    // Auto-adjust font size based on column count and element width with guaranteed legibility
    const dynamicHeaderFontSize = numCols > 6 ? Math.max(8.5, Math.min(headerFontSize, el.width / (numCols * 7.5))) : headerFontSize;
    const dynamicBodyFontSize = numCols > 6 ? Math.max(8.0, Math.min(bodyFontSize, el.width / (numCols * 8.0))) : bodyFontSize;

    // Calculate col widths (custom or weighted by header/content type)
    const colWidths: number[] = [];
    if (td.colWidths && td.colWidths.length === numCols) {
      const totalRel = td.colWidths.reduce((a, b) => a + b, 0);
      td.colWidths.forEach(w => colWidths.push((w / totalRel) * el.width));
    } else {
      // Weighted distribution: SKU (18%), Name/Spec (28%), remaining evenly divided
      const weights = td.headers.map((h) => {
        const lower = h.toLowerCase();
        if (lower.includes('product') || lower.includes('spec') || lower.includes('name') || lower.includes('desc')) return 2.2;
        if (lower.includes('model') || lower.includes('sku') || lower.includes('code')) return 1.5;
        if (lower.includes('cut') || lower.includes('dim')) return 1.1;
        if (lower.includes('color') || lower.includes('cct')) return 1.2;
        if (lower.includes('price') || lower.includes('mrp')) return 1.1;
        if (lower.includes('pack') || lower.includes('box')) return 1.1;
        return 1.0;
      });
      const totalWeight = weights.reduce((a, b) => a + b, 0);
      weights.forEach(w => colWidths.push((w / totalWeight) * el.width));
    }

    // Measure approximate wrapped lines for any cell text given available column width
    const estimateLines = (text: string, colW: number, fontSize: number): number => {
      if (!text) return 1;
      const clean = text.toString().trim();
      const avgCharWidth = fontSize * 0.58;
      const usableWidth = Math.max(15, colW - cellPadding * 2);
      const charsPerLine = Math.max(3, Math.floor(usableWidth / avgCharWidth));
      
      const words = clean.split(/\s+/);
      let lines = 1;
      let curLineLen = 0;
      words.forEach(word => {
        if (curLineLen + word.length > charsPerLine) {
          lines++;
          curLineLen = word.length;
        } else {
          curLineLen += word.length + 1;
        }
      });
      return lines;
    };

    // Calculate header height based on longest wrapped header
    let maxHeaderLines = 1;
    td.headers.forEach((h, colIdx) => {
      const l = estimateLines(h, colWidths[colIdx], dynamicHeaderFontSize);
      if (l > maxHeaderLines) maxHeaderLines = l;
    });
    const headerRowHeight = Math.max(28, maxHeaderLines * (dynamicHeaderFontSize * 1.3) + cellPadding * 2);

    // Calculate dynamic height for each body row
    const rowHeights: number[] = [];
    (td.rows || []).forEach(row => {
      let maxLinesInRow = 1;
      row.forEach((cellText, colIdx) => {
        const l = estimateLines(cellText, colWidths[colIdx] || (el.width / numCols), dynamicBodyFontSize);
        if (l > maxLinesInRow) maxLinesInRow = l;
      });
      const calcH = Math.max(26, maxLinesInRow * (dynamicBodyFontSize * 1.35) + cellPadding * 2);
      rowHeights.push(calcH);
    });

    const totalCalculatedTableHeight = headerRowHeight + rowHeights.reduce((a, b) => a + b, 0);

    const tableObjs: any[] = [];

    // 1. Table Outer Frame & Header Background
    const headerRect = new Rect({
      left: 0,
      top: 0,
      width: el.width,
      height: headerRowHeight,
      fill: headerBg,
      originX: 'left',
      originY: 'top',
    });
    tableObjs.push(headerRect);

    // 2. Render Headers with full text-wrapping
    let currentX = 0;
    td.headers.forEach((headerText, colIdx) => {
      const colW = colWidths[colIdx];
      const headerTb = new Textbox(headerText.toUpperCase(), {
        left: currentX + cellPadding,
        top: cellPadding + 1,
        width: colW - cellPadding * 2,
        originX: 'left',
        originY: 'top',
        fontSize: dynamicHeaderFontSize,
        fontFamily: 'Montserrat',
        fontWeight: '900',
        fill: headerTextColor,
        textAlign: colIdx === 0 || colIdx === 1 ? 'left' : 'center',
        splitByGrapheme: false,
        lineHeight: 1.15,
        objectCaching: false,
      });
      tableObjs.push(headerTb);

      // Header vertical border
      if (colIdx < numCols - 1) {
        tableObjs.push(new Line([currentX + colW, 0, currentX + colW, headerRowHeight], {
          stroke: borderColor,
          strokeWidth: 1,
          originX: 'left',
          originY: 'top',
          objectCaching: false,
        }));
      }

      currentX += colW;
    });

    // 3. Render Body Rows with dynamic row positions and heights
    let curY = headerRowHeight;
    (td.rows || []).forEach((row, rowIdx) => {
      const rHeight = rowHeights[rowIdx] || 26;
      const bg = rowIdx % 2 === 1 ? alternateRowBg : rowBg;

      // Row Background
      tableObjs.push(new Rect({
        left: 0,
        top: curY,
        width: el.width,
        height: rHeight,
        fill: bg,
        originX: 'left',
        originY: 'top',
        objectCaching: false,
      }));

      let cellX = 0;
      row.forEach((cellText, colIdx) => {
        const colW = colWidths[colIdx];
        const cellTb = new Textbox(cellText || '-', {
          left: cellX + cellPadding,
          top: curY + cellPadding + 1,
          width: colW - cellPadding * 2,
          originX: 'left',
          originY: 'top',
          fontSize: dynamicBodyFontSize,
          fontFamily: 'Inter',
          fontWeight: colIdx === 0 ? '700' : '500',
          fill: '#0f172a',
          textAlign: colIdx === 0 || colIdx === 1 ? 'left' : 'center',
          splitByGrapheme: false,
          lineHeight: 1.2,
          objectCaching: false,
        });
        tableObjs.push(cellTb);

        // Vertical cell divider
        if (colIdx < numCols - 1) {
          tableObjs.push(new Line([cellX + colW, curY, cellX + colW, curY + rHeight], {
            stroke: borderColor,
            strokeWidth: 0.8,
            originX: 'left',
            originY: 'top',
            objectCaching: false,
          }));
        }

        cellX += colW;
      });

      // Horizontal Row Border at top of this row
      tableObjs.push(new Line([0, curY, el.width, curY], {
        stroke: borderColor,
        strokeWidth: 1,
        originX: 'left',
        originY: 'top',
        objectCaching: false,
      }));

      curY += rHeight;
    });

    // Outer table border
    tableObjs.push(new Rect({
      left: 0,
      top: 0,
      width: el.width,
      height: totalCalculatedTableHeight,
      fill: 'transparent',
      stroke: borderColor,
      strokeWidth: 1.5,
      originX: 'left',
      originY: 'top',
      objectCaching: false,
    }));

    const tableGroup = new Group(tableObjs, {
      left: el.x,
      top: el.y,
      angle: el.rotation || 0,
      width: el.width,
      height: totalCalculatedTableHeight,
      originX: 'left',
      originY: 'top',
      opacity: el.opacity ?? 1,
      objectCaching: false,
      subTargetCheck: true,
    });

    (tableGroup as any).id = el.id;
    (tableGroup as any)._tableDataJSON = JSON.stringify(el.tableData || {});
    return tableGroup;
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
