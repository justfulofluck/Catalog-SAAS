import { Rect, Textbox, Image as FabricImage, Circle, Polygon, Line, Group, Shadow, Gradient, filters, config } from 'fabric';
import { CanvasElement, ElementType, Product, Catalog } from '../../types';
import { workerPool } from '../../utils/workerPool';
import { useStore } from '../../store/useStore';
import { resolveFieldLabel } from '../../utils/fieldUtils';
import { normalizeImageUrl } from '../../utils/imageUtils';
import { applyCanvaSelectionStyle } from '../../utils/canvaControls';

// Ensure all fabric images are loaded with crossOrigin = 'anonymous' to prevent tainted canvases
config.imageProperties = { ...config.imageProperties, crossOrigin: 'anonymous' };

// In-memory global HTMLImageElement bitmap cache with LRU eviction to prevent memory leaks and UI freezing
const MAX_IMAGE_CACHE_SIZE = 120;
const htmlImageCache = new Map<string, Promise<HTMLImageElement>>();

export function getCachedImageElement(src: string): Promise<HTMLImageElement> {
  const cached = htmlImageCache.get(src);
  if (cached) return cached;

  // Evict oldest entries if cache exceeds maximum allowed size
  if (htmlImageCache.size >= MAX_IMAGE_CACHE_SIZE) {
    const firstKey = htmlImageCache.keys().next().value;
    if (firstKey) htmlImageCache.delete(firstKey);
  }

  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => {
      // Retry without crossOrigin if CORS headers are missing
      const fallback = new Image();
      fallback.onload = () => resolve(fallback);
      fallback.onerror = (e) => {
        htmlImageCache.delete(src);
        reject(e);
      };
      fallback.src = src;
    };
    img.src = src;
  });

  htmlImageCache.set(src, promise);
  return promise;
}

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

  _toSVG(): string[] {
    const w = this.width, h = this.height;
    const fillColor = (this.fill as string) || '#e2e8f0';
    const strokeColor = (this.stroke as string) || 'none';
    const strokeWidth = this.strokeWidth || 0;
    const path = `M ${w * 0.2} ${h * 0.75} C ${w * -0.05} ${h * 0.75} ${w * -0.05} ${h * 0.35} ${w * 0.2} ${h * 0.35} C ${w * 0.15} ${h * 0.05} ${w * 0.45} 0 ${w * 0.5} ${h * 0.2} C ${w * 0.55} 0 ${w * 0.85} ${h * 0.05} ${w * 0.8} ${h * 0.35} C ${w * 1.05} ${h * 0.35} ${w * 1.05} ${h * 0.75} ${w * 0.8} ${h * 0.75} Z`;
    return [
      `<path d="${path}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" />\n`
    ];
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

  _toSVG(): string[] {
    const w = this.width, h = this.height;
    const fillColor = (this.fill as string) || '#e2e8f0';
    const strokeColor = (this.stroke as string) || 'none';
    const strokeWidth = this.strokeWidth || 0;
    const path = `M 0 ${h * 0.2} C ${w * 0.25} 0 ${w * 0.75} ${h * 0.4} ${w} ${h * 0.2} L ${w} ${h * 0.8} C ${w * 0.75} ${h} ${w * 0.25} ${h * 0.6} 0 ${h * 0.8} Z`;
    return [
      `<path d="${path}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" />\n`
    ];
  }
}

export class HorizontalLineShape extends Rect {
  _render(ctx: CanvasRenderingContext2D) {
    const w = this.width;
    const halfW = w / 2;
    const strokeWidth = this.strokeWidth || 2;
    const strokeColor = (this.stroke as string) || (this.fill as string) || '#cbd5e1';

    ctx.save();
    ctx.beginPath();
    // Centered from -halfW to halfW along local y=0
    ctx.moveTo(-halfW, 0);
    ctx.lineTo(halfW, 0);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();
  }

  _toSVG(): string[] {
    const w = this.width;
    const halfW = w / 2;
    const strokeWidth = this.strokeWidth || 2;
    const strokeColor = (this.stroke as string) || (this.fill as string) || '#cbd5e1';
    return [
      `<line x1="${-halfW}" y1="0" x2="${halfW}" y2="0" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round" />\n`
    ];
  }
}

export class CurvedLineShape extends Rect {
  _render(ctx: CanvasRenderingContext2D) {
    const w = this.width;
    const h = Math.max(this.height, 20);
    const halfH = h / 2;
    const strokeWidth = this.strokeWidth || 2;
    const strokeColor = (this.stroke as string) || (this.fill as string) || '#000000';

    ctx.save();
    ctx.beginPath();
    // Smooth S-curve spline connector from (0, halfH) to (w, halfH)
    ctx.moveTo(0, halfH);
    ctx.bezierCurveTo(w * 0.35, halfH - h * 0.45, w * 0.65, halfH + h * 0.45, w, halfH);

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Endpoint anchor circles matching Canva connectors
    const endCircleRadius = Math.max(strokeWidth * 0.8, 3.5);
    ctx.fillStyle = strokeColor;
    ctx.beginPath();
    ctx.arc(0, halfH, endCircleRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(w, halfH, endCircleRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  _toSVG(): string[] {
    const w = this.width;
    const h = Math.max(this.height, 20);
    const halfH = h / 2;
    const strokeWidth = this.strokeWidth || 2;
    const strokeColor = (this.stroke as string) || (this.fill as string) || '#000000';
    const endCircleRadius = Math.max(strokeWidth * 0.8, 3.5);
    return [
      `<path d="M 0 ${halfH} C ${w * 0.35} ${halfH - h * 0.45}, ${w * 0.65} ${halfH + h * 0.45}, ${w} ${halfH}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" fill="none" />\n`,
      `<circle cx="0" cy="${halfH}" r="${endCircleRadius}" fill="${strokeColor}" />\n`,
      `<circle cx="${w}" cy="${halfH}" r="${endCircleRadius}" fill="${strokeColor}" />\n`
    ];
  }
}

export class ElbowLineShape extends Rect {
  _render(ctx: CanvasRenderingContext2D) {
    const w = this.width;
    const h = Math.max(this.height, 20);
    const halfH = h / 2;
    const strokeWidth = this.strokeWidth || 2;
    const strokeColor = (this.stroke as string) || (this.fill as string) || '#000000';
    const cornerR = Math.min(8, Math.min(w * 0.15, h * 0.25));

    ctx.save();
    ctx.beginPath();
    // Step/Elbow connector: horizontal start -> vertical step -> horizontal end with rounded corners
    const midX = w / 2;
    const startY = halfH - h * 0.35;
    const endY = halfH + h * 0.35;

    ctx.moveTo(0, startY);
    ctx.arcTo(midX, startY, midX, halfH, cornerR);
    ctx.arcTo(midX, endY, w, endY, cornerR);
    ctx.lineTo(w, endY);

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Endpoint anchor circles matching Canva connectors
    const endCircleRadius = Math.max(strokeWidth * 0.8, 3.5);
    ctx.fillStyle = strokeColor;
    ctx.beginPath();
    ctx.arc(0, startY, endCircleRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(w, endY, endCircleRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  _toSVG(): string[] {
    const w = this.width;
    const h = Math.max(this.height, 20);
    const halfH = h / 2;
    const strokeWidth = this.strokeWidth || 2;
    const strokeColor = (this.stroke as string) || (this.fill as string) || '#000000';
    const cornerR = Math.min(8, Math.min(w * 0.15, h * 0.25));
    const midX = w / 2;
    const startY = halfH - h * 0.35;
    const endY = halfH + h * 0.35;
    const endCircleRadius = Math.max(strokeWidth * 0.8, 3.5);
    return [
      `<path d="M 0 ${startY} L ${midX - cornerR} ${startY} Q ${midX} ${startY} ${midX} ${startY + (endY > startY ? cornerR : -cornerR)} L ${midX} ${endY - (endY > startY ? cornerR : -cornerR)} Q ${midX} ${endY} ${midX + cornerR} ${endY} L ${w} ${endY}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" fill="none" />\n`,
      `<circle cx="0" cy="${startY}" r="${endCircleRadius}" fill="${strokeColor}" />\n`,
      `<circle cx="${w}" cy="${endY}" r="${endCircleRadius}" fill="${strokeColor}" />\n`
    ];
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

export function isDarkColor(colorStr?: string): boolean {
  if (!colorStr || colorStr === 'transparent') return false;
  let r = 255, g = 255, b = 255;
  if (colorStr.startsWith('#')) {
    let hex = colorStr.slice(1);
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    if (hex.length >= 6) {
      r = parseInt(hex.slice(0, 2), 16);
      g = parseInt(hex.slice(2, 4), 16);
      b = parseInt(hex.slice(4, 6), 16);
    }
  } else if (colorStr.startsWith('rgb')) {
    const match = colorStr.match(/\d+/g);
    if (match && match.length >= 3) {
      r = parseInt(match[0], 10);
      g = parseInt(match[1], 10);
      b = parseInt(match[2], 10);
    }
  }
  // Perceived luminance using HSP formula
  const hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));
  return hsp < 140;
}

export function measureWrappedTextHeight(text: any, width: number, fontSize: number, lineHeight: number = 1.2, fontWeight: string = 'normal'): number {
  if (text === null || text === undefined || text === '') return 0;
  const clean = String(text).trim();
  const isBold = fontWeight === 'bold' || fontWeight === '700' || fontWeight === '800' || fontWeight === '900';
  const avgCharW = fontSize * (isBold ? 0.62 : 0.55);
  const usableW = Math.max(10, width);
  const charsPerLine = Math.max(1, Math.floor(usableW / avgCharW));

  const words = clean.split(/\s+/);
  let lines = 1;
  let curLineLen = 0;
  words.forEach(word => {
    if (word.length > charsPerLine) {
      if (curLineLen > 0) lines++;
      lines += Math.ceil(word.length / charsPerLine) - 1;
      curLineLen = word.length % charsPerLine || charsPerLine;
    } else if (curLineLen + word.length > charsPerLine) {
      lines++;
      curLineLen = word.length;
    } else {
      curLineLen += word.length + 1;
    }
  });
  return Math.ceil(lines * fontSize * lineHeight);
}

export function estimateTextWidth(text: any, fontSize: number, fontWeight: string = 'normal'): number {
  if (text === null || text === undefined || text === '') return 0;
  const str = String(text);
  const isBold = fontWeight === 'bold' || fontWeight === '700' || fontWeight === '800' || fontWeight === '900';
  return Math.ceil(str.length * fontSize * (isBold ? 0.62 : 0.55));
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
  const isLineType = obj instanceof Line ||
    obj instanceof HorizontalLineShape ||
    obj instanceof CurvedLineShape ||
    obj instanceof ElbowLineShape ||
    obj.shapeType === 'line' ||
    obj.shapeType === 'curved-line' ||
    obj.shapeType === 'elbow-line';

  if (!fill) {
    if (typeof obj.set === 'function') obj.set('fill', '#ffffff');
    else obj.fill = '#ffffff';
    if (isLineType) {
      if (typeof obj.set === 'function') obj.set('stroke', '#cbd5e1');
      else obj.stroke = '#cbd5e1';
    }
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

  if (isLineType) {
    const strokeVal = fill && !fill.includes('gradient') ? fill : '#cbd5e1';
    if (typeof obj.set === 'function') obj.set('stroke', strokeVal);
    else obj.stroke = strokeVal;
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
      return new HorizontalLineShape({
        width: w,
        height: Math.max(h, 12),
        stroke: stroke || fillColor || '#cbd5e1',
        strokeWidth: strokeWidth || 2.5,
        fill: 'transparent',
      });
    case 'curved-line':
      return new CurvedLineShape({
        width: w,
        height: Math.max(h, 20),
        stroke: stroke || fillColor || '#000000',
        strokeWidth: strokeWidth || 3,
        fill: stroke || fillColor || '#000000',
      });
    case 'elbow-line':
      return new ElbowLineShape({
        width: w,
        height: Math.max(h, 20),
        stroke: stroke || fillColor || '#000000',
        strokeWidth: strokeWidth || 3,
        fill: stroke || fillColor || '#000000',
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
    Object.entries(common).forEach(([k, v]) => { try { obj.set(k as any, v); } catch { } });
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
    if (!el.width && !cleanRawText.includes('\n')) {
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
      editable: false, // Disable Fabric's native text editing — the app uses its own HTML overlay
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

      const htmlImg = await getCachedImageElement(finalSrc);
      const img = new FabricImage(htmlImg);
      img.set({
        ...common,
        scaleX: el.width / (img.width || 1),
        scaleY: el.height / (img.height || 1),
        stroke: el.stroke && el.stroke !== 'transparent' ? el.stroke : undefined,
        strokeWidth: el.stroke && el.stroke !== 'transparent' ? (el.strokeWidth || 2) : 0,
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
      (obj as any).shapeType = shapeType;
      if (obj instanceof Circle) obj.set({ radius: Math.min(w, h) / 2 });
      applyCanvaSelectionStyle(obj);
    }
    return obj;
  }

  if (elType === 'product-block') {
    const objs: any[] = [];

    const theme = (el as any).cardTheme || (el as any).productData?.cardTheme || 'classic-stack';
    const cardFill = el.fill || (theme === 'editorial-overlay' ? '#0f172a' : '#ffffff');
    const cardStroke = el.stroke && el.stroke !== 'transparent' ? el.stroke : '#e2e8f0';
    const cardStrokeWidth = el.stroke && el.stroke !== 'transparent'
      ? (el.strokeWidth !== undefined ? el.strokeWidth : 1.5)
      : (el.stroke === 'transparent' ? 0 : 1);
    const cardRx = (el as any).borderRadius !== undefined ? (el as any).borderRadius : 4;

    const isDark = isDarkColor(cardFill);
    const defaultTitleColor = isDark ? '#ffffff' : '#0f172a';
    const defaultPriceColor = isDark ? '#34d399' : '#00a651';
    const defaultTextColor = isDark ? '#cbd5e1' : '#334155';

    // Auto-contrast: If text is light on light card or dark on dark card, automatically adapt
    let titleColor = el.titleColor || defaultTitleColor;
    if (isDark && isDarkColor(titleColor)) {
      titleColor = '#ffffff';
    } else if (!isDark && !isDarkColor(titleColor)) {
      titleColor = '#0f172a';
    }

    let textColor = el.textColor || defaultTextColor;
    if (isDark && isDarkColor(textColor)) {
      textColor = '#cbd5e1';
    } else if (!isDark && !isDarkColor(textColor)) {
      textColor = '#334155';
    }

    let priceColor = el.priceColor || defaultPriceColor;

    // Base card background rect
    objs.push(new Rect({
      left: 0, top: 0, width: el.width, height: el.height,
      originX: 'left', originY: 'top',
      fill: cardFill,
      stroke: cardStroke,
      strokeWidth: cardStrokeWidth,
      rx: cardRx,
      ry: cardRx,
      objectCaching: false,
    }));

    const product = products.find(p => String(p.id) === String(el.productId)) || (el as any).productData;
    if (product) {
      const cardPadding = Math.max(10, Math.min(18, Math.round(el.width * 0.045)));
      const contentWidth = el.width - cardPadding * 2;
      const categories = useStore.getState().categories || [];

      const displayName = String(el.customTitle !== undefined ? el.customTitle : (product.name || 'Product Title'));
      const displayPrice = String(el.customPrice !== undefined ? el.customPrice : (product.price ? `${product.currency || '₹'}${product.price}` : '₹0.00'));
      const displaySku = String(el.customSku !== undefined ? el.customSku : (product.sku || ''));
      const catObj = product.categoryId ? categories.find(c => String(c.id) === String(product.categoryId)) : null;
      const categoryName = String(catObj?.name || (product as any).categoryName || 'FEATURED');

      const showTitle = el.showName !== false && (el.visibleFieldKeys ? (el.visibleFieldKeys.includes('name') || el.visibleFieldKeys.includes('title')) : true);
      const showPrice = el.showPrice !== false && (el.visibleFieldKeys ? el.visibleFieldKeys.includes('price') : true);
      const showSku = el.showSku !== false && (el.visibleFieldKeys ? el.visibleFieldKeys.includes('sku') : true) && Boolean(displaySku);

      const cardFontFamily = (el as any).fontFamily || (catalog as any).fontFamily || 'Inter';
      const autoTitleFontSize = Math.max(11, Math.min(18, Math.round(el.width * 0.062)));
      const titleFontSize = el.titleFontSize || autoTitleFontSize;
      const autoPriceFontSize = Math.max(11, Math.min(16, Math.round(el.width * 0.055)));
      const priceFontSize = el.priceFontSize || autoPriceFontSize;
      const specsFontSize = el.fontSize || 8.5;

      // Extract structured spec items according to user visibleFieldKeys order
      const specItems: { label: string; value: string }[] = [];
      if (el.visibleFieldKeys && el.visibleFieldKeys.length > 0) {
        el.visibleFieldKeys.forEach(k => {
          if (k === 'name' || k === 'title' || k === 'price') return;
          const override = el.fieldOverrides?.[k];
          if (override?.enabled === false) return;

          if (k === 'sku') {
            if (showSku && displaySku) {
              specItems.push({ label: String(override?.label || 'SKU'), value: displaySku });
            }
          } else if (k === 'description') {
            const val = override?.value !== undefined ? override.value : product.description;
            if (val) specItems.push({ label: String(override?.label || 'Description'), value: String(val) });
          } else {
            const label = override?.label || resolveFieldLabel(k, categories, product) || k;
            const val = override?.value !== undefined ? override.value : product.customFields?.[k];
            if (val !== undefined && val !== null && val !== '') {
              specItems.push({ label: String(label), value: String(val) });
            }
          }
        });
      } else {
        if (showSku && displaySku) {
          specItems.push({ label: 'SKU', value: displaySku });
        }
        if (product.description) {
          specItems.push({ label: 'Description', value: String(product.description) });
        }
        if (product.customFields) {
          Object.entries(product.customFields).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== '' && typeof v !== 'object') {
              const label = resolveFieldLabel(k, categories, product) || k;
              specItems.push({ label: String(label), value: String(v) });
            }
          });
        }
      }

      // Load Product Image if available
      const rawImgUrl = el.src || product.image || (product.customFields && Object.values(product.customFields).find((v: any) => typeof v === 'string' && (v.startsWith('/media') || v.startsWith('http'))));
      let loadedImg: FabricImage | null = null;
      if (rawImgUrl) {
        try {
          const imgUrl = normalizeImageUrl(rawImgUrl);
          const htmlImg = await getCachedImageElement(imgUrl);
          loadedImg = new FabricImage(htmlImg);
        } catch { }
      }

      // ─────────────────────────────────────────────────────────────
      // THEME 1: Clean Badge Layout (Top Badge + Top Price + Centered Image + Title + 2-Column Spec Badges)
      // ─────────────────────────────────────────────────────────────
      if (theme === 'clean-badge') {
        let curY = cardPadding;

        // Header Row: Category Badge (Left) & Price (Right)
        const badgeW = estimateTextWidth(categoryName.toUpperCase(), 7.5, 'bold') + 14;
        const badgeH = 16;
        const badgeRect = new Rect({
          left: cardPadding,
          top: curY,
          width: badgeW,
          height: badgeH,
          fill: isDark ? 'rgba(99, 102, 241, 0.18)' : 'rgba(99, 102, 241, 0.1)',
          stroke: isDark ? 'rgba(99, 102, 241, 0.35)' : 'rgba(99, 102, 241, 0.25)',
          strokeWidth: 1,
          rx: 3,
          ry: 3,
          originX: 'left',
          originY: 'top',
          objectCaching: false
        });
        objs.push(badgeRect);

        const badgeText = new Textbox(categoryName.toUpperCase(), {
          left: cardPadding + 6,
          top: curY + 2.5,
          width: badgeW - 8,
          fontSize: 7.5,
          fontFamily: cardFontFamily,
          fontWeight: 'bold',
          fill: isDark ? '#a5b4fc' : '#4f46e5',
          originX: 'left',
          originY: 'top',
          splitByGrapheme: false,
          objectCaching: false
        });
        if (typeof (badgeText as any).initDimensions === 'function') (badgeText as any).initDimensions();
        objs.push(badgeText);

        if (showPrice) {
          const priceText = new Textbox(displayPrice, {
            left: cardPadding,
            top: curY - 1,
            width: contentWidth,
            fontSize: priceFontSize,
            fontFamily: cardFontFamily,
            fontWeight: 'bold',
            fill: priceColor,
            textAlign: 'right',
            originX: 'left',
            originY: 'top',
            splitByGrapheme: false,
            objectCaching: false
          });
          if (typeof (priceText as any).initDimensions === 'function') (priceText as any).initDimensions();
          objs.push(priceText);
        }

        curY += badgeH + 8;

        // Image Box Container
        const imageBoxH = Math.max(50, Math.min(el.height * 0.36, 140));
        const imgBgRect = new Rect({
          left: cardPadding,
          top: curY,
          width: contentWidth,
          height: imageBoxH,
          fill: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)',
          rx: 3,
          ry: 3,
          originX: 'left',
          originY: 'top',
          objectCaching: false
        });
        objs.push(imgBgRect);

        if (loadedImg) {
          const natW = loadedImg.width || 1;
          const natH = loadedImg.height || 1;
          const scale = Math.min((contentWidth - 10) / natW, (imageBoxH - 10) / natH, 1.5);
          const rW = natW * scale;
          const rH = natH * scale;
          loadedImg.set({
            left: cardPadding + (contentWidth - rW) / 2,
            top: curY + (imageBoxH - rH) / 2,
            scaleX: scale,
            scaleY: scale,
            originX: 'left',
            originY: 'top',
            objectCaching: false
          });
          objs.push(loadedImg);
        }

        curY += imageBoxH + 8;

        // Product Title
        if (showTitle) {
          const titleH = measureWrappedTextHeight(displayName, contentWidth, titleFontSize, 1.15, 'bold');
          const titleText = new Textbox(displayName, {
            left: cardPadding,
            top: curY,
            width: contentWidth,
            fontSize: titleFontSize,
            fontFamily: cardFontFamily,
            fontWeight: 'bold',
            fill: titleColor,
            lineHeight: 1.15,
            originX: 'left',
            originY: 'top',
            splitByGrapheme: false,
            objectCaching: false
          });
          if (typeof (titleText as any).initDimensions === 'function') (titleText as any).initDimensions();
          objs.push(titleText);
          curY += Math.max(titleText.height || 0, titleH) + 6;
        }

        // Specs 2-Column Grid
        if (specItems.length > 0 && el.height - curY > 15) {
          const colW = (contentWidth - 6) / 2;
          const boxH = Math.max(26, specsFontSize * 2 + 8);
          const maxRows = Math.floor((el.height - curY - cardPadding) / (boxH + 4));

          specItems.slice(0, maxRows * 2).forEach((item, idx) => {
            const col = idx % 2;
            const row = Math.floor(idx / 2);
            const boxX = cardPadding + col * (colW + 6);
            const boxY = curY + row * (boxH + 4);

            const specBox = new Rect({
              left: boxX,
              top: boxY,
              width: colW,
              height: boxH,
              fill: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
              stroke: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
              strokeWidth: 1,
              rx: 3,
              ry: 3,
              originX: 'left',
              originY: 'top',
              objectCaching: false
            });
            objs.push(specBox);

            const labelText = new Textbox(item.label.toUpperCase(), {
              left: boxX + 4,
              top: boxY + 2.5,
              width: colW - 8,
              fontSize: 6.8,
              fontFamily: cardFontFamily,
              fontWeight: '600',
              fill: isDark ? '#94a3b8' : '#64748b',
              originX: 'left',
              originY: 'top',
              splitByGrapheme: false,
              objectCaching: false
            });
            if (typeof (labelText as any).initDimensions === 'function') (labelText as any).initDimensions();
            objs.push(labelText);

            const valText = new Textbox(item.value, {
              left: boxX + 4,
              top: boxY + 11.5,
              width: colW - 8,
              fontSize: specsFontSize,
              fontFamily: cardFontFamily,
              fontWeight: 'bold',
              fill: textColor,
              originX: 'left',
              originY: 'top',
              splitByGrapheme: false,
              objectCaching: false
            });
            if (typeof (valText as any).initDimensions === 'function') (valText as any).initDimensions();
            objs.push(valText);
          });
        }
      }

      // ─────────────────────────────────────────────────────────────
      // THEME 2: Editorial Overlay (Hero Background Image + Dark Gradient + Overlay Details)
      // ─────────────────────────────────────────────────────────────
      else if (theme === 'editorial-overlay') {
        if (loadedImg) {
          const natW = loadedImg.width || 1;
          const natH = loadedImg.height || 1;
          const scale = Math.max(el.width / natW, el.height / natH);
          const rW = natW * scale;
          const rH = natH * scale;
          loadedImg.set({
            left: (el.width - rW) / 2,
            top: (el.height - rH) / 2,
            scaleX: scale,
            scaleY: scale,
            originX: 'left',
            originY: 'top',
            objectCaching: false
          });
          objs.push(loadedImg);
        }

        // True Linear Dark Gradient Overlay from transparent top to rich dark bottom
        const gradOverlay = new Rect({
          left: 0,
          top: 0,
          width: el.width,
          height: el.height,
          originX: 'left',
          originY: 'top',
          fill: new Gradient({
            type: 'linear',
            coords: { x1: 0, y1: 0, x2: 0, y2: el.height },
            colorStops: [
              { offset: 0, color: 'rgba(0, 0, 0, 0.0)' },
              { offset: 0.38, color: 'rgba(0, 0, 0, 0.08)' },
              { offset: 0.60, color: 'rgba(0, 0, 0, 0.62)' },
              { offset: 0.85, color: 'rgba(0, 0, 0, 0.92)' },
              { offset: 1, color: 'rgba(0, 0, 0, 0.98)' }
            ]
          }),
          objectCaching: false
        });
        objs.push(gradOverlay);

        // Pre-create and measure all text blocks to compute exact layout without collision
        const chipsToRender = specItems.filter(s => s.label !== 'SKU').slice(0, 3);

        const priceH = showPrice ? Math.ceil((priceFontSize + 2) * 1.3) + 4 : 0;
        const titleEstimatedH = showTitle ? measureWrappedTextHeight(displayName, contentWidth, titleFontSize, 1.15, 'bold') + 4 : 0;
        const skuEstimatedH = (showSku && displaySku) ? measureWrappedTextHeight(`SKU: ${displaySku}`, contentWidth, 8.5, 1.2, 'normal') + 4 : 0;

        // Calculate chips rows & total height
        let chipsRows = 0;
        if (chipsToRender.length > 0) {
          let tempX = cardPadding;
          chipsRows = 1;
          chipsToRender.forEach(c => {
            const textContent = `${c.label}: ${c.value}`;
            const chipW = Math.min(estimateTextWidth(textContent, 7.5, 'normal') + 12, contentWidth);
            if (tempX + chipW > cardPadding + contentWidth && tempX > cardPadding) {
              tempX = cardPadding;
              chipsRows++;
            }
            tempX += chipW + 4;
          });
        }
        const chipsTotalH = chipsRows * 20;

        const totalContentH = priceH + titleEstimatedH + skuEstimatedH + chipsTotalH;
        let currentStackY = Math.max(cardPadding, el.height - cardPadding - totalContentH);

        // 1. Render Price
        if (showPrice) {
          const priceTextObj = new Textbox(displayPrice, {
            left: cardPadding,
            top: currentStackY,
            width: contentWidth,
            fontSize: priceFontSize + 2,
            fontFamily: cardFontFamily,
            fontWeight: 'bold',
            fill: priceColor,
            originX: 'left',
            originY: 'top',
            splitByGrapheme: false,
            objectCaching: false
          });
          if (typeof (priceTextObj as any).initDimensions === 'function') (priceTextObj as any).initDimensions();
          objs.push(priceTextObj);
          currentStackY += priceH;
        }

        // 2. Render Title
        if (showTitle) {
          const titleTextObj = new Textbox(displayName, {
            left: cardPadding,
            top: currentStackY,
            width: contentWidth,
            fontSize: titleFontSize,
            fontFamily: cardFontFamily,
            fontWeight: 'bold',
            fill: '#ffffff',
            lineHeight: 1.15,
            originX: 'left',
            originY: 'top',
            splitByGrapheme: false,
            objectCaching: false
          });
          if (typeof (titleTextObj as any).initDimensions === 'function') (titleTextObj as any).initDimensions();
          objs.push(titleTextObj);
          const actualTitleH = Math.max(titleTextObj.height || 0, titleEstimatedH);
          currentStackY += actualTitleH;
        }

        // 3. Render SKU
        if (showSku && displaySku) {
          const skuTextObj = new Textbox(`SKU: ${displaySku}`, {
            left: cardPadding,
            top: currentStackY,
            width: contentWidth,
            fontSize: 8.5,
            fontFamily: cardFontFamily,
            fill: '#e2e8f0',
            originX: 'left',
            originY: 'top',
            splitByGrapheme: false,
            objectCaching: false
          });
          if (typeof (skuTextObj as any).initDimensions === 'function') (skuTextObj as any).initDimensions();
          objs.push(skuTextObj);
          const actualSkuH = Math.max(skuTextObj.height || 0, skuEstimatedH);
          currentStackY += actualSkuH;
        }

        // 4. Render Chips / Spec Badges
        if (chipsToRender.length > 0 && currentStackY + 16 <= el.height) {
          let chipX = cardPadding;
          let chipY = currentStackY + 2;
          const chipH = 16;
          const chipGap = 4;

          chipsToRender.forEach(c => {
            const textContent = `${c.label}: ${c.value}`;
            const textW = estimateTextWidth(textContent, 7.5, 'normal');
            const chipW = Math.min(textW + 12, contentWidth);

            if (chipX + chipW > cardPadding + contentWidth && chipX > cardPadding) {
              chipX = cardPadding;
              chipY += chipH + chipGap;
            }

            if (chipY + chipH <= el.height - 4) {
              const chipRect = new Rect({
                left: chipX,
                top: chipY,
                width: chipW,
                height: chipH,
                fill: 'rgba(255, 255, 255, 0.22)',
                rx: 3,
                ry: 3,
                originX: 'left',
                originY: 'top',
                objectCaching: false
              });
              objs.push(chipRect);

              const chipText = new Textbox(textContent, {
                left: chipX + 5,
                top: chipY + 2.5,
                width: chipW - 8,
                fontSize: 7.5,
                fontFamily: cardFontFamily,
                fill: '#ffffff',
                originX: 'left',
                originY: 'top',
                splitByGrapheme: false,
                objectCaching: false
              });
              if (typeof (chipText as any).initDimensions === 'function') (chipText as any).initDimensions();
              objs.push(chipText);

              chipX += chipW + chipGap;
            }
          });
        }
      }

      // ─────────────────────────────────────────────────────────────
      // THEME 3: Minimal Row Layout (Thumbnail on Left, Info on Right)
      // ─────────────────────────────────────────────────────────────
      else if (theme === 'minimal-row') {
        const thumbW = Math.max(60, el.width * 0.32);
        const thumbH = el.height - cardPadding * 2;

        const thumbBg = new Rect({
          left: cardPadding,
          top: cardPadding,
          width: thumbW,
          height: thumbH,
          fill: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
          rx: 3,
          ry: 3,
          originX: 'left',
          originY: 'top',
          objectCaching: false
        });
        objs.push(thumbBg);

        if (loadedImg) {
          const natW = loadedImg.width || 1;
          const natH = loadedImg.height || 1;
          const scale = Math.min((thumbW - 8) / natW, (thumbH - 8) / natH, 1.5);
          const rW = natW * scale;
          const rH = natH * scale;
          loadedImg.set({
            left: cardPadding + (thumbW - rW) / 2,
            top: cardPadding + (thumbH - rH) / 2,
            scaleX: scale,
            scaleY: scale,
            originX: 'left',
            originY: 'top',
            objectCaching: false
          });
          objs.push(loadedImg);
        }

        const rightX = cardPadding + thumbW + 10;
        const rightW = el.width - rightX - cardPadding;
        let rightY = cardPadding + 2;

        if (showTitle) {
          const titleH = measureWrappedTextHeight(displayName, rightW, titleFontSize, 1.15, 'bold');
          const titleText = new Textbox(displayName, {
            left: rightX,
            top: rightY,
            width: rightW,
            fontSize: titleFontSize,
            fontFamily: cardFontFamily,
            fontWeight: 'bold',
            fill: titleColor,
            lineHeight: 1.15,
            originX: 'left',
            originY: 'top',
            splitByGrapheme: false,
            objectCaching: false
          });
          if (typeof (titleText as any).initDimensions === 'function') (titleText as any).initDimensions();
          objs.push(titleText);
          rightY += Math.max(titleText.height || 0, titleH) + 4;
        }

        if (showPrice) {
          const priceText = new Textbox(displayPrice, {
            left: rightX,
            top: rightY,
            width: rightW,
            fontSize: priceFontSize,
            fontFamily: cardFontFamily,
            fontWeight: 'bold',
            fill: priceColor,
            originX: 'left',
            originY: 'top',
            splitByGrapheme: false,
            objectCaching: false
          });
          if (typeof (priceText as any).initDimensions === 'function') (priceText as any).initDimensions();
          objs.push(priceText);
          rightY += Math.max(priceText.height || 0, priceFontSize * 1.2) + 4;
        }

        if (showSku && displaySku) {
          const skuText = new Textbox(`SKU: ${displaySku}`, {
            left: rightX,
            top: rightY,
            width: rightW,
            fontSize: 8,
            fontFamily: cardFontFamily,
            fill: isDark ? '#94a3b8' : '#64748b',
            originX: 'left',
            originY: 'top',
            splitByGrapheme: false,
            objectCaching: false
          });
          if (typeof (skuText as any).initDimensions === 'function') (skuText as any).initDimensions();
          objs.push(skuText);
          rightY += Math.max(skuText.height || 0, 11) + 4;
        }

        if (specItems.length > 0 && el.height - rightY > 12) {
          const remainingSpecs = specItems.filter(s => s.label !== 'SKU').slice(0, 4);
          remainingSpecs.forEach(s => {
            if (el.height - rightY < 12) return;
            const specText = new Textbox(`${s.label}: ${s.value}`, {
              left: rightX,
              top: rightY,
              width: rightW,
              fontSize: 7.8,
              fontFamily: cardFontFamily,
              fill: textColor,
              originX: 'left',
              originY: 'top',
              splitByGrapheme: false,
              objectCaching: false
            });
            if (typeof (specText as any).initDimensions === 'function') (specText as any).initDimensions();
            objs.push(specText);
            rightY += 12;
          });
        }
      }

      // ─────────────────────────────────────────────────────────────
      // THEME 4: Classic Stack (Image on Top + Overlaid Price Pill + Title + Specs List)
      // ─────────────────────────────────────────────────────────────
      else {
        const imgH = Math.max(50, Math.min(el.height * 0.44, 160));
        const imgBox = new Rect({
          left: cardPadding,
          top: cardPadding,
          width: contentWidth,
          height: imgH,
          fill: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)',
          rx: 3,
          ry: 3,
          originX: 'left',
          originY: 'top',
          objectCaching: false
        });
        objs.push(imgBox);

        if (loadedImg) {
          const natW = loadedImg.width || 1;
          const natH = loadedImg.height || 1;
          const scale = Math.min((contentWidth - 10) / natW, (imgH - 10) / natH, 1.5);
          const rW = natW * scale;
          const rH = natH * scale;
          loadedImg.set({
            left: cardPadding + (contentWidth - rW) / 2,
            top: cardPadding + (imgH - rH) / 2,
            scaleX: scale,
            scaleY: scale,
            originX: 'left',
            originY: 'top',
            objectCaching: false
          });
          objs.push(loadedImg);
        }

        // Price Pill over Image
        if (showPrice) {
          const pillW = estimateTextWidth(displayPrice, priceFontSize, 'bold') + 14;
          const pillH = priceFontSize + 6;
          const pillBg = new Rect({
            left: cardPadding + contentWidth - pillW - 4,
            top: cardPadding + imgH - pillH - 4,
            width: pillW,
            height: pillH,
            fill: isDark ? 'rgba(0, 0, 0, 0.85)' : 'rgba(255, 255, 255, 0.95)',
            rx: 3,
            ry: 3,
            originX: 'left',
            originY: 'top',
            objectCaching: false
          });
          objs.push(pillBg);

          const pillText = new Textbox(displayPrice, {
            left: cardPadding + contentWidth - 8,
            top: cardPadding + imgH - pillH - 2,
            width: pillW,
            fontSize: priceFontSize,
            fontFamily: cardFontFamily,
            fontWeight: 'bold',
            fill: priceColor,
            originX: 'right',
            originY: 'top',
            splitByGrapheme: false,
            objectCaching: false
          });
          if (typeof (pillText as any).initDimensions === 'function') (pillText as any).initDimensions();
          objs.push(pillText);
        }

        let curY = cardPadding + imgH + 8;

        if (showTitle) {
          const titleH = measureWrappedTextHeight(displayName, contentWidth, titleFontSize, 1.15, 'bold');
          const titleText = new Textbox(displayName, {
            left: cardPadding,
            top: curY,
            width: contentWidth,
            fontSize: titleFontSize,
            fontFamily: cardFontFamily,
            fontWeight: 'bold',
            fill: titleColor,
            lineHeight: 1.15,
            originX: 'left',
            originY: 'top',
            splitByGrapheme: false,
            objectCaching: false
          });
          if (typeof (titleText as any).initDimensions === 'function') (titleText as any).initDimensions();
          objs.push(titleText);
          curY += Math.max(titleText.height || 0, titleH) + 5;
        }

        if (showSku && displaySku) {
          const skuText = new Textbox(`SKU: ${displaySku}`, {
            left: cardPadding,
            top: curY,
            width: contentWidth,
            fontSize: 8.5,
            fontFamily: cardFontFamily,
            fill: isDark ? '#94a3b8' : '#64748b',
            originX: 'left',
            originY: 'top',
            splitByGrapheme: false,
            objectCaching: false
          });
          if (typeof (skuText as any).initDimensions === 'function') (skuText as any).initDimensions();
          objs.push(skuText);
          curY += Math.max(skuText.height || 0, 12) + 5;
        }

        if (specItems.length > 0 && el.height - curY > 12) {
          // Divider line
          objs.push(new Line([cardPadding, curY, cardPadding + contentWidth, curY], {
            stroke: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
            strokeWidth: 1,
            originX: 'left',
            originY: 'top',
            objectCaching: false
          }));
          curY += 5;

          const remainingSpecs = specItems.filter(s => s.label !== 'SKU');
          remainingSpecs.forEach(s => {
            if (el.height - curY < 12) return;
            const specH = Math.max(12, specsFontSize + 3);
            const specLabel = new Textbox(`${s.label}:`, {
              left: cardPadding,
              top: curY,
              width: contentWidth * 0.5,
              fontSize: specsFontSize,
              fontFamily: cardFontFamily,
              fill: isDark ? '#94a3b8' : '#64748b',
              originX: 'left',
              originY: 'top',
              splitByGrapheme: false,
              objectCaching: false
            });
            const specVal = new Textbox(s.value, {
              left: cardPadding + contentWidth,
              top: curY,
              width: contentWidth * 0.5,
              fontSize: specsFontSize,
              fontFamily: cardFontFamily,
              fontWeight: 'bold',
              fill: textColor,
              textAlign: 'right',
              originX: 'right',
              originY: 'top',
              splitByGrapheme: false,
              objectCaching: false
            });
            objs.push(specLabel);
            objs.push(specVal);
            curY += specH;
          });
        }
      }
    } else {
      objs.push(new Textbox('EMPTY SLOT', {
        left: 0, top: el.height / 2 - 10, width: el.width,
        originX: 'left', originY: 'top',
        fontSize: 12, fontFamily: 'Inter', fontWeight: 'bold', fill: '#94a3b8',
        textAlign: 'center', splitByGrapheme: false,
        objectCaching: false
      }));
    }

    const group = new Group(objs, {
      left: el.x,
      top: el.y,
      angle: el.rotation || 0,
      width: el.width,
      height: el.height,
      originX: 'left',
      originY: 'top',
      opacity: el.opacity ?? 1,
      objectCaching: false,
      subTargetCheck: true,
    });

    (group as any).id = el.id;
    (group as any)._cardTheme = theme;
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
    const estimateLines = (text: any, colW: number, fontSize: number): number => {
      if (text === null || text === undefined || text === '') return 1;
      const clean = String(text).trim();
      // Use more conservative char width — uppercase/bold fonts render wider
      const hasUppercase = clean === clean.toUpperCase();
      const avgCharWidth = fontSize * (hasUppercase ? 0.72 : 0.65);
      const usableWidth = Math.max(15, colW - cellPadding * 2);
      const charsPerLine = Math.max(3, Math.floor(usableWidth / avgCharWidth));

      const words = clean.split(/\s+/);
      let lines = 1;
      let curLineLen = 0;
      words.forEach(word => {
        // Handle long words that wrap mid-word (Fabric.js does this)
        if (word.length > charsPerLine) {
          if (curLineLen > 0) { lines++; }
          lines += Math.ceil(word.length / charsPerLine) - 1;
          curLineLen = word.length % charsPerLine || charsPerLine;
        } else if (curLineLen + word.length > charsPerLine) {
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
      (row || []).forEach((cellText: any, colIdx: number) => {
        const l = estimateLines(cellText, colWidths[colIdx] || (el.width / numCols), dynamicBodyFontSize);
        if (l > maxLinesInRow) maxLinesInRow = l;
      });
      const calcH = Math.max(26, maxLinesInRow * (dynamicBodyFontSize * 1.45) + cellPadding * 2 + 4);
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
      const hStr = String(headerText ?? '');
      const headerTb = new Textbox(hStr.toUpperCase(), {
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
      (row || []).forEach((cellText: any, colIdx: number) => {
        const colW = colWidths[colIdx];
        const cellStr = cellText !== undefined && cellText !== null && String(cellText).trim() !== '' ? String(cellText) : '-';
        const cellTb = new Textbox(cellStr, {
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
