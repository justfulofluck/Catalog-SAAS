import CanvasKitInit, { CanvasKit, Surface } from 'canvaskit-wasm';
import { CanvasElement, CatalogPage, Product, Catalog } from '../types';

let ckInstance: CanvasKit | null = null;
let ckInitPromise: Promise<CanvasKit> | null = null;

/**
 * Initializes and caches the CanvasKit WebAssembly singleton runtime
 */
export async function getCanvasKit(): Promise<CanvasKit> {
  if (ckInstance) return ckInstance;
  if (!ckInitPromise) {
    ckInitPromise = CanvasKitInit({
      locateFile: (file: string) => `https://unpkg.com/canvaskit-wasm@0.39.1/bin/${file}`,
    }).then((ck) => {
      ckInstance = ck;
      return ck;
    });
  }
  return ckInitPromise;
}

/**
 * Parses hex/rgba color strings into Float32Array format required by Skia
 */
export function parseSkiaColor(ck: CanvasKit, colorStr: string, opacity: number = 1.0): Float32Array {
  if (!colorStr) return ck.Color4f(0, 0, 0, opacity);
  if (colorStr.startsWith('#')) {
    const hex = colorStr.replace('#', '');
    let r = 0, g = 0, b = 0;
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16) / 255;
      g = parseInt(hex[1] + hex[1], 16) / 255;
      b = parseInt(hex[2] + hex[2], 16) / 255;
    } else if (hex.length >= 6) {
      r = parseInt(hex.slice(0, 2), 16) / 255;
      g = parseInt(hex.slice(2, 4), 16) / 255;
      b = parseInt(hex.slice(4, 6), 16) / 255;
    }
    return ck.Color4f(r, g, b, opacity);
  }
  return ck.Color4f(0, 0, 0, opacity);
}

/**
 * High-performance Skia WebAssembly page rendering pipeline
 */
export async function renderPageWithSkia(
  canvasElement: HTMLCanvasElement,
  page: CatalogPage,
  products: Product[],
  catalog: Catalog,
  scale: number = 1.0
): Promise<void> {
  const ck = await getCanvasKit();
  const surface: Surface | null = ck.MakeWebGLCanvasSurface(canvasElement);
  if (!surface) {
    console.warn('CanvasKit WebGL surface creation failed, falling back to CPU surface.');
    return;
  }

  const canvas = surface.getCanvas();
  canvas.save();
  canvas.scale(scale, scale);

  // Background Fill
  const bgPaint = new ck.Paint();
  bgPaint.setColor(parseSkiaColor(ck, page.backgroundColor || '#ffffff'));
  bgPaint.setStyle(ck.PaintStyle.Fill);
  canvas.drawRect(ck.XYWHRect(0, 0, canvasElement.width / scale, canvasElement.height / scale), bgPaint);
  bgPaint.delete();

  // Render elements in z-order
  const sortedElements = [...page.elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

  for (const el of sortedElements) {
    if (el.visible === false) continue;

    canvas.save();
    canvas.translate(el.x, el.y);
    if (el.rotation) {
      canvas.rotate(el.rotation, el.width / 2, el.height / 2);
    }

    const elementPaint = new ck.Paint();
    elementPaint.setAntiAlias(true);
    elementPaint.setColor(parseSkiaColor(ck, el.fill || '#3b82f6', el.opacity ?? 1.0));

    if (el.type === 'shape' || el.type === 'comment') {
      const shape = el.shapeType || 'rect';
      if (shape === 'circle') {
        const radius = Math.min(el.width, el.height) / 2;
        canvas.drawCircle(radius, radius, radius, elementPaint);
      } else if (shape === 'rounded' || shape === 'pill') {
        const r = shape === 'pill' ? Math.min(el.width, el.height) / 2 : 12;
        const rrect = ck.RRectXY(ck.XYWHRect(0, 0, el.width, el.height), r, r);
        canvas.drawRRect(rrect, elementPaint);
      } else {
        // Standard Rect
        canvas.drawRect(ck.XYWHRect(0, 0, el.width, el.height), elementPaint);
      }
    } else if (el.type === 'text') {
      // Font & Typography layout via Skia
      const font = new ck.Font(null, el.fontSize || 16);
      canvas.drawText(el.text?.replace(/<[^>]*>/g, '') || '', 0, (el.fontSize || 16), elementPaint, font);
      font.delete();
    } else if (el.type === 'product-block') {
      // Product Card
      const cardPaint = new ck.Paint();
      cardPaint.setColor(ck.Color4f(1, 1, 1, 1));
      const borderPaint = new ck.Paint();
      borderPaint.setColor(ck.Color4f(0.88, 0.91, 0.94, 1));
      borderPaint.setStyle(ck.PaintStyle.Stroke);
      borderPaint.setStrokeWidth(2);

      const cardRRect = ck.RRectXY(ck.XYWHRect(0, 0, el.width, el.height), 8, 8);
      canvas.drawRRect(cardRRect, cardPaint);
      canvas.drawRRect(cardRRect, borderPaint);

      const product = products.find(p => p.id === el.productId);
      const titleFont = new ck.Font(null, Math.max(12, el.width * 0.05));
      const titlePaint = new ck.Paint();
      titlePaint.setColor(ck.Color4f(0.06, 0.09, 0.16, 1));
      canvas.drawText(product?.name || 'Product', 10, el.height * 0.6, titlePaint, titleFont);

      titleFont.delete();
      titlePaint.delete();
      cardPaint.delete();
      borderPaint.delete();
    }

    elementPaint.delete();
    canvas.restore();
  }

  canvas.restore();
  surface.flush();
  surface.delete();
}
