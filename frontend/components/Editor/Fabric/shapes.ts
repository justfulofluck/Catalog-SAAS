export { Rect, Circle, Polygon, Line, Group, Gradient, config } from 'fabric';
import { Rect, Circle, Polygon, Line, Group, Gradient, config } from 'fabric';

// Ensure all fabric images are loaded with crossOrigin = 'anonymous' to prevent tainted canvases
config.imageProperties = { ...config.imageProperties, crossOrigin: 'anonymous' };

// In-memory global HTMLImageElement bitmap cache with LRU eviction to prevent memory leaks and UI freezing
const MAX_IMAGE_CACHE_SIZE = 120;
const htmlImageCache = new Map<string, Promise<HTMLImageElement>>();

export function getCachedImageElement(src: string): Promise<HTMLImageElement> {
  const cached = htmlImageCache.get(src);
  if (cached) return cached;

  if (htmlImageCache.size >= MAX_IMAGE_CACHE_SIZE) {
    const firstKey = htmlImageCache.keys().next().value;
    if (firstKey) htmlImageCache.delete(firstKey);
  }

  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => {
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
export class CloudShape extends Rect {
  _render(ctx: CanvasRenderingContext2D) {
    const w = this.width,
      h = this.height;
    ctx.beginPath();
    ctx.moveTo(w * 0.2, h * 0.75);
    ctx.bezierCurveTo(w * -0.05, h * 0.75, w * -0.05, h * 0.35, w * 0.2, h * 0.35);
    ctx.bezierCurveTo(w * 0.15, h * 0.05, w * 0.45, h * 0.0, w * 0.5, h * 0.2);
    ctx.bezierCurveTo(w * 0.55, h * 0.0, w * 0.85, h * 0.05, w * 0.8, h * 0.35);
    ctx.bezierCurveTo(w * 1.05, h * 0.35, w * 1.05, h * 0.75, w * 0.8, h * 0.75);
    ctx.closePath();
    (this as any)._renderPaintInOrder(ctx);
  }

  _toSVG(): string[] {
    const w = this.width,
      h = this.height;
    const fillColor = (this.fill as string) || '#e2e8f0';
    const strokeColor = (this.stroke as string) || 'none';
    const strokeWidth = this.strokeWidth || 0;
    const path = `M ${w * 0.2} ${h * 0.75} C ${w * -0.05} ${h * 0.75} ${w * -0.05} ${h * 0.35} ${
      w * 0.2
    } ${h * 0.35} C ${w * 0.15} ${h * 0.05} ${w * 0.45} 0 ${w * 0.5} ${h * 0.2} C ${w * 0.55} 0 ${
      w * 0.85
    } ${h * 0.05} ${w * 0.8} ${h * 0.35} C ${w * 1.05} ${h * 0.35} ${w * 1.05} ${h * 0.75} ${
      w * 0.8
    } ${h * 0.75} Z`;
    return [
      `<path d="${path}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" />\n`,
    ];
  }
}

export class WaveShape extends Rect {
  _render(ctx: CanvasRenderingContext2D) {
    const w = this.width,
      h = this.height;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.2);
    ctx.bezierCurveTo(w * 0.25, 0, w * 0.75, h * 0.4, w, h * 0.2);
    ctx.lineTo(w, h * 0.8);
    ctx.bezierCurveTo(w * 0.75, h, w * 0.25, h * 0.6, 0, h * 0.8);
    ctx.closePath();
    (this as any)._renderPaintInOrder(ctx);
  }

  _toSVG(): string[] {
    const w = this.width,
      h = this.height;
    const fillColor = (this.fill as string) || '#e2e8f0';
    const strokeColor = (this.stroke as string) || 'none';
    const strokeWidth = this.strokeWidth || 0;
    const path = `M 0 ${h * 0.2} C ${w * 0.25} 0 ${w * 0.75} ${h * 0.4} ${w} ${
      h * 0.2
    } L ${w} ${h * 0.8} C ${w * 0.75} ${h} ${w * 0.25} ${h * 0.6} 0 ${h * 0.8} Z`;
    return [
      `<path d="${path}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" />\n`,
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
      `<line x1="${-halfW}" y1="0" x2="${halfW}" y2="0" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round" />\n`,
    ];
  }
}

export class CurvedLineShape extends Rect {
  _render(ctx: CanvasRenderingContext2D) {
    const w = this.width;
    const halfW = w / 2;
    const h = Math.max(this.height, 20);
    const strokeWidth = this.strokeWidth || 2;
    const strokeColor = (this.stroke as string) || (this.fill as string) || '#000000';

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(-halfW, 0);
    ctx.bezierCurveTo(-w * 0.15, -h * 0.45, w * 0.15, h * 0.45, halfW, 0);

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    const endCircleRadius = Math.max(strokeWidth * 0.8, 3.5);
    ctx.fillStyle = strokeColor;
    ctx.beginPath();
    ctx.arc(-halfW, 0, endCircleRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(halfW, 0, endCircleRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  _toSVG(): string[] {
    const w = this.width;
    const halfW = w / 2;
    const h = Math.max(this.height, 20);
    const strokeWidth = this.strokeWidth || 2;
    const strokeColor = (this.stroke as string) || (this.fill as string) || '#000000';
    const endCircleRadius = Math.max(strokeWidth * 0.8, 3.5);
    return [
      `<path d="M ${-halfW} 0 C ${-w * 0.15} ${-h * 0.45}, ${
        w * 0.15
      } ${h * 0.45}, ${halfW} 0" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" fill="none" />\n`,
      `<circle cx="${-halfW}" cy="0" r="${endCircleRadius}" fill="${strokeColor}" />\n`,
      `<circle cx="${halfW}" cy="0" r="${endCircleRadius}" fill="${strokeColor}" />\n`,
    ];
  }
}

export class ElbowLineShape extends Rect {
  _render(ctx: CanvasRenderingContext2D) {
    const w = this.width;
    const halfW = w / 2;
    const h = Math.max(this.height, 20);
    const strokeWidth = this.strokeWidth || 2;
    const strokeColor = (this.stroke as string) || (this.fill as string) || '#000000';
    const cornerR = Math.min(8, Math.min(w * 0.15, h * 0.25));

    ctx.save();
    ctx.beginPath();
    const startY = -h * 0.35;
    const endY = h * 0.35;

    ctx.moveTo(-halfW, startY);
    ctx.arcTo(0, startY, 0, 0, cornerR);
    ctx.arcTo(0, endY, halfW, endY, cornerR);
    ctx.lineTo(halfW, endY);

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    const endCircleRadius = Math.max(strokeWidth * 0.8, 3.5);
    ctx.fillStyle = strokeColor;
    ctx.beginPath();
    ctx.arc(-halfW, startY, endCircleRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(halfW, endY, endCircleRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  _toSVG(): string[] {
    const w = this.width;
    const halfW = w / 2;
    const h = Math.max(this.height, 20);
    const strokeWidth = this.strokeWidth || 2;
    const strokeColor = (this.stroke as string) || (this.fill as string) || '#000000';
    const cornerR = Math.min(8, Math.min(w * 0.15, h * 0.25));
    const startY = -h * 0.35;
    const endY = h * 0.35;
    const endCircleRadius = Math.max(strokeWidth * 0.8, 3.5);
    return [
      `<path d="M ${-halfW} ${startY} L ${-cornerR} ${startY} Q 0 ${startY} 0 ${
        startY + (endY > startY ? cornerR : -cornerR)
      } L 0 ${endY - (endY > startY ? cornerR : -cornerR)} Q 0 ${endY} ${cornerR} ${endY} L ${halfW} ${endY}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" fill="none" />\n`,
      `<circle cx="${-halfW}" cy="${startY}" r="${endCircleRadius}" fill="${strokeColor}" />\n`,
      `<circle cx="${halfW}" cy="${endY}" r="${endCircleRadius}" fill="${strokeColor}" />\n`,
    ];
  }
}

export function rgba(color: string, opacity: number): string {
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
  let r = 255,
    g = 255,
    b = 255;
  if (colorStr.startsWith('#')) {
    let hex = colorStr.slice(1);
    if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
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
  const hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));
  return hsp < 140;
}

export function parseGradient(
  fillStr: string,
  w: number,
  h: number
): { stops: { offset: number; color: string }[]; coords: { x1: number; y1: number; x2: number; y2: number } } | null {
  if (!fillStr || !fillStr.includes('linear-gradient')) return null;

  const innerMatch = fillStr.match(/linear-gradient\s*\((.*)\)/i);
  if (!innerMatch) return null;

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
      case 'to right':
        coords = { x1: 0, y1: 0, x2: w, y2: 0 };
        break;
      case 'to left':
        coords = { x1: w, y1: 0, x2: 0, y2: 0 };
        break;
      case 'to bottom':
        coords = { x1: 0, y1: 0, x2: 0, y2: h };
        break;
      case 'to top':
        coords = { x1: 0, y1: h, x2: 0, y2: 0 };
        break;
      case 'to bottom right':
      case 'to right bottom':
        coords = { x1: 0, y1: 0, x2: w, y2: h };
        break;
      case 'to top right':
      case 'to right top':
        coords = { x1: 0, y1: h, x2: w, y2: 0 };
        break;
      case 'to bottom left':
      case 'to left bottom':
        coords = { x1: w, y1: 0, x2: 0, y2: h };
        break;
      case 'to top left':
      case 'to left top':
        coords = { x1: w, y1: h, x2: 0, y2: 0 };
        break;
      default:
        coords = { x1: 0, y1: 0, x2: w, y2: 0 };
    }
  }

  const stops = colorParts.map((c, i) => {
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

export function applyFill(obj: any, fill: string | undefined, w: number, h: number) {
  const isLineType =
    obj instanceof Line ||
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
  const cx = w / 2,
    cy = h / 2;
  const r = Math.min(w, h) / 2;
  const pts: { x: number; y: number }[] = [];
  switch (shapeType) {
    case 'triangle': {
      for (let i = 0; i < 3; i++) {
        const a = (i * 2 * Math.PI) / 3 - Math.PI / 2;
        pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
      }
      const minX = Math.min(...pts.map((p) => p.x));
      const minY = Math.min(...pts.map((p) => p.y));
      return pts.map((p) => ({ x: p.x - minX, y: p.y - minY }));
    }
    case 'triangleDown': {
      for (let i = 0; i < 3; i++) {
        const a = (i * 2 * Math.PI) / 3 + Math.PI / 2;
        pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
      }
      const minX = Math.min(...pts.map((p) => p.x));
      const minY = Math.min(...pts.map((p) => p.y));
      return pts.map((p) => ({ x: p.x - minX, y: p.y - minY }));
    }
    case 'rightTriangle':
      return [
        { x: 0, y: h },
        { x: 0, y: 0 },
        { x: w, y: h },
      ];
    case 'diamond':
      return [
        { x: cx, y: 0 },
        { x: w, y: cy },
        { x: cx, y: h },
        { x: 0, y: cy },
      ];
    case 'pentagon': {
      for (let i = 0; i < 5; i++) {
        const a = (i * 2 * Math.PI) / 5 - Math.PI / 2;
        pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
      }
      const minX = Math.min(...pts.map((p) => p.x));
      const minY = Math.min(...pts.map((p) => p.y));
      return pts.map((p) => ({ x: p.x - minX, y: p.y - minY }));
    }
    case 'hexagon': {
      for (let i = 0; i < 6; i++) {
        const a = (i * 2 * Math.PI) / 6 - Math.PI / 2;
        pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
      }
      const minX = Math.min(...pts.map((p) => p.x));
      const minY = Math.min(...pts.map((p) => p.y));
      return pts.map((p) => ({ x: p.x - minX, y: p.y - minY }));
    }
    case 'octagon': {
      for (let i = 0; i < 8; i++) {
        const a = (i * 2 * Math.PI) / 8 - Math.PI / 2;
        pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
      }
      const minX = Math.min(...pts.map((p) => p.x));
      const minY = Math.min(...pts.map((p) => p.y));
      return pts.map((p) => ({ x: p.x - minX, y: p.y - minY }));
    }
    case 'star': {
      const innerR = r * 0.4;
      for (let i = 0; i < 10; i++) {
        const a = (i * Math.PI) / 5 - Math.PI / 2;
        const cr = i % 2 === 0 ? r : innerR;
        pts.push({ x: cx + cr * Math.cos(a), y: cy + cr * Math.sin(a) });
      }
      const minX = Math.min(...pts.map((p) => p.x));
      const minY = Math.min(...pts.map((p) => p.y));
      return pts.map((p) => ({ x: p.x - minX, y: p.y - minY }));
    }
    case 'parallelogram': {
      const skew = w * 0.2;
      return [
        { x: skew, y: 0 },
        { x: w, y: 0 },
        { x: w - skew, y: h },
        { x: 0, y: h },
      ];
    }
    case 'chevron':
    case 'chevron-right': {
      const indent = w * 0.16;
      return [
        { x: 0, y: 0 },
        { x: w - indent, y: 0 },
        { x: w, y: h / 2 },
        { x: w - indent, y: h },
        { x: 0, y: h },
      ];
    }
    case 'cross': {
      const t = Math.min(w, h) * 0.3;
      return [
        { x: cx - t, y: 0 },
        { x: cx + t, y: 0 },
        { x: cx + t, y: cy - t },
        { x: w, y: cy - t },
        { x: w, y: cy + t },
        { x: cx + t, y: cy + t },
        { x: cx + t, y: h },
        { x: cx - t, y: h },
        { x: cx - t, y: cy + t },
        { x: 0, y: cy + t },
        { x: 0, y: cy - t },
        { x: cx - t, y: cy - t },
      ];
    }
    default:
      return [
        { x: 0, y: 0 },
        { x: w, y: 0 },
        { x: w, y: h },
        { x: 0, y: h },
      ];
  }
}

export function buildShape(
  shapeType: string,
  w: number,
  h: number,
  stroke: string | undefined,
  strokeWidth: number,
  fill: string | undefined,
  fallbackFill: string | undefined,
  strokeDashArray?: number[],
  rx?: number,
  ry?: number
): any {
  const isTransparentFill = !fill || fill === 'transparent' || fill === 'none';
  const fillColor = isTransparentFill ? 'transparent' : fill || fallbackFill || '#cbd5e1';
  const hasStroke = stroke && stroke !== 'transparent' && stroke !== 'none';
  const finalStrokeWidth = hasStroke
    ? strokeWidth !== undefined && strokeWidth !== null
      ? strokeWidth
      : 2
    : 0;

  const shapeProps: Record<string, any> = {
    stroke: hasStroke ? stroke : undefined,
    strokeWidth: finalStrokeWidth,
    strokeDashArray:
      hasStroke && strokeDashArray && strokeDashArray.length > 0 ? strokeDashArray : undefined,
    strokeUniform: true,
    perPixelTargetFind: isTransparentFill,
    targetFindTolerance: isTransparentFill
      ? Math.max(8, Math.min(16, Math.round((finalStrokeWidth || 2) * 1.5)))
      : 4,
  };

  switch (shapeType) {
    case 'none':
      return null;
    case 'rect': {
      const cornerR = rx !== undefined ? rx : 0;
      return new Rect({
        ...shapeProps,
        width: w,
        height: h,
        rx: cornerR,
        ry: cornerR,
        fill: fillColor,
      });
    }
    case 'roundedRect': {
      const r = rx !== undefined ? rx : Math.min(w, h) * 0.15;
      return new Rect({ ...shapeProps, width: w, height: h, rx: r, ry: r, fill: fillColor });
    }
    case 'pill': {
      const pr = rx !== undefined ? rx : Math.min(w, h) / 2;
      return new Rect({ ...shapeProps, width: w, height: h, rx: pr, ry: pr, fill: fillColor });
    }
    case 'circle':
      return new Circle({ ...shapeProps, radius: Math.min(w, h) / 2, fill: fillColor });
    case 'line':
      return new HorizontalLineShape({
        width: w,
        height: Math.max(h, 12),
        stroke: stroke || (isTransparentFill ? '#000000' : fillColor) || '#cbd5e1',
        strokeWidth: strokeWidth || 2.5,
        strokeDashArray: strokeDashArray,
        fill: 'transparent',
      });
    case 'curved-line':
      return new CurvedLineShape({
        width: w,
        height: Math.max(h, 20),
        stroke: stroke || (isTransparentFill ? '#000000' : fillColor) || '#000000',
        strokeWidth: strokeWidth || 3,
        strokeDashArray: strokeDashArray,
        fill: stroke || (isTransparentFill ? '#000000' : fillColor) || '#000000',
      });
    case 'elbow-line':
      return new ElbowLineShape({
        width: w,
        height: Math.max(h, 20),
        stroke: stroke || (isTransparentFill ? '#000000' : fillColor) || '#000000',
        strokeWidth: strokeWidth || 3,
        strokeDashArray: strokeDashArray,
        fill: stroke || (isTransparentFill ? '#000000' : fillColor) || '#000000',
      });
    case 'cloud':
      return new CloudShape({ ...shapeProps, width: w, height: h, fill: fillColor });
    case 'wave':
      return new WaveShape({ ...shapeProps, width: w, height: h, fill: fillColor });
    case 'arrow': {
      const headLen = 10;
      const lx = w - headLen;
      return new Group(
        [
          new Line([0, h / 2, lx, h / 2], {
            stroke: stroke || fillColor,
            strokeWidth: strokeWidth || 4,
            fill: 'transparent',
            strokeDashArray: strokeDashArray,
          }),
          new Polygon(
            [
              { x: lx, y: h / 2 - headLen / 2 },
              { x: w, y: h / 2 },
              { x: lx, y: h / 2 + headLen / 2 },
            ],
            {
              fill: stroke || fillColor,
              stroke: stroke || fillColor,
              strokeWidth: 1,
            }
          ),
        ],
        {}
      );
    }
    case 'arrow4': {
      const a4Stroke = Math.max(strokeWidth || 3, 3);
      const hl = a4Stroke * 4;
      return new Group(
        [
          new Line([hl, h / 2, w - hl, h / 2], {
            stroke: stroke || fillColor,
            strokeWidth: a4Stroke,
            fill: 'transparent',
            strokeDashArray: strokeDashArray,
          }),
          new Polygon(
            [
              { x: w - hl, y: h / 2 - hl / 2 },
              { x: w, y: h / 2 },
              { x: w - hl, y: h / 2 + hl / 2 },
            ],
            {
              fill: stroke || fillColor,
              stroke: stroke || fillColor,
              strokeWidth: 1,
            }
          ),
          new Polygon(
            [
              { x: hl, y: h / 2 - hl / 2 },
              { x: 0, y: h / 2 },
              { x: hl, y: h / 2 + hl / 2 },
            ],
            {
              fill: stroke || fillColor,
              stroke: stroke || fillColor,
              strokeWidth: 1,
            }
          ),
        ],
        {}
      );
    }
    default: {
      const pts = getPolyPoints(shapeType, w, h);
      if (pts.length >= 3) return new Polygon(pts, { ...shapeProps, fill: fillColor });
      const cornerR = rx !== undefined ? rx : 0;
      return new Rect({
        ...shapeProps,
        width: w,
        height: h,
        rx: cornerR,
        ry: cornerR,
        fill: fillColor,
      });
    }
  }
}
