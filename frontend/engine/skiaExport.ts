import { getCanvasKit, parseSkiaColor } from './skiaEngine';
import { CatalogPage, Product, Catalog } from '../types';
import { PAGE_WIDTH, PAGE_HEIGHT } from '../constants';

/**
 * Ultra high-resolution 300 DPI Skia WebAssembly offline exporter
 */
export async function exportPageWithSkiaWasm(
  page: CatalogPage,
  products: Product[],
  catalog: Catalog,
  scaleFactor: number = 2.0 // 2x for Retina/High-DPI, 3.125x for 300 DPI print
): Promise<string> {
  const ck = await getCanvasKit();
  const width = PAGE_WIDTH * scaleFactor;
  const height = PAGE_HEIGHT * scaleFactor;

  // Make an offscreen Skia Surface
  const surface = ck.MakeSurface(width, height);
  if (!surface) {
    throw new Error('Failed to create Skia offscreen surface');
  }

  const canvas = surface.getCanvas();
  canvas.scale(scaleFactor, scaleFactor);

  // Background
  const bgPaint = new ck.Paint();
  bgPaint.setColor(parseSkiaColor(ck, page.backgroundColor || '#ffffff'));
  canvas.drawRect(ck.XYWHRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT), bgPaint);
  bgPaint.delete();

  // Elements
  const sortedElements = [...page.elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
  for (const el of sortedElements) {
    if (el.visible === false) continue;

    canvas.save();
    canvas.translate(el.x, el.y);
    if (el.rotation) {
      canvas.rotate(el.rotation, el.width / 2, el.height / 2);
    }

    const paint = new ck.Paint();
    paint.setAntiAlias(true);
    paint.setColor(parseSkiaColor(ck, el.fill || '#000000', el.opacity ?? 1.0));

    if (el.type === 'shape' || el.type === 'comment') {
      const shape = el.shapeType || 'rect';
      if (shape === 'circle') {
        const radius = Math.min(el.width, el.height) / 2;
        canvas.drawCircle(radius, radius, radius, paint);
      } else {
        canvas.drawRect(ck.XYWHRect(0, 0, el.width, el.height), paint);
      }
    } else if (el.type === 'text') {
      const font = new ck.Font(null, el.fontSize || 16);
      canvas.drawText(el.text?.replace(/<[^>]*>/g, '') || '', 0, el.fontSize || 16, paint, font);
      font.delete();
    }

    paint.delete();
    canvas.restore();
  }

  // Snapshot PNG
  const image = surface.makeImageSnapshot();
  const bytes = image.encodeToBytes(); // PNG Uint8Array
  image.delete();
  surface.delete();

  if (!bytes) {
    throw new Error('Failed to encode Skia image snapshot');
  }

  const blob = new Blob([bytes], { type: 'image/png' });
  return URL.createObjectURL(blob);
}
