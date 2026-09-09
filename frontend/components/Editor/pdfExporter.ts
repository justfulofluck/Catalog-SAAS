import { jsPDF } from 'jspdf';
import { Canvas } from 'fabric';
import { Catalog, Product } from '../../types';
import { PAGE_WIDTH, PAGE_HEIGHT } from '../../constants';
import { elementToFabricObject } from './fabricRenderer';
import { normalizeImageUrl } from '../../utils/imageUtils';

export interface ExportProgressCallback {
  (current: number, total: number, status: string): void;
}

/**
 * Helper to fetch image and convert to safe same-origin dataURL so it never taints HTMLCanvas
 */
async function getCleanImageDataUrl(url: string): Promise<string> {
  if (!url || url.startsWith('data:')) return url;
  const cleanUrl = normalizeImageUrl(url);
  try {
    const res = await fetch(cleanUrl, { mode: 'cors' });
    if (!res.ok) return cleanUrl;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(cleanUrl);
      reader.readAsDataURL(blob);
    });
  } catch {
    return cleanUrl;
  }
}

/**
 * High-fidelity multi-page PDF exporter for catalogmakerr.
 * Iterates through all pages in the catalog, renders each page onto an offscreen Fabric Canvas,
 * and compiles them sequentially into a clean, downloadable PDF.
 */
export async function exportCatalogToPDF(
  catalog: Catalog,
  products: Product[],
  onProgress?: ExportProgressCallback
): Promise<void> {
  if (!catalog || !catalog.pages || catalog.pages.length === 0) {
    throw new Error('No pages available in catalog to export.');
  }

  const totalPages = catalog.pages.length;
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: [PAGE_WIDTH, PAGE_HEIGHT]
  });

  // Create an offscreen HTML canvas element for rendering
  const hiddenCanvasEl = document.createElement('canvas');
  hiddenCanvasEl.width = PAGE_WIDTH;
  hiddenCanvasEl.height = PAGE_HEIGHT;
  hiddenCanvasEl.style.position = 'fixed';
  hiddenCanvasEl.style.left = '-9999px';
  hiddenCanvasEl.style.top = '-9999px';
  document.body.appendChild(hiddenCanvasEl);

  const offscreenCanvas = new Canvas(hiddenCanvasEl, {
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
    selection: false,
    interactive: false,
    enableRetinaScaling: false
  });

  try {
    for (let i = 0; i < totalPages; i++) {
      const page = catalog.pages[i];
      if (onProgress) {
        onProgress(i + 1, totalPages, `Rendering Page ${i + 1} of ${totalPages}...`);
      }

      offscreenCanvas.clear();
      offscreenCanvas.backgroundColor = page.backgroundColor || catalog.backgroundColor || '#ffffff';

      // Header & Footer elements calculation
      const pageHasHeader = page.hasHeader !== undefined ? page.hasHeader : (catalog.hasHeader && page.type !== 'cover');
      const pageHasFooter = page.hasFooter !== undefined ? page.hasFooter : (catalog.hasFooter && page.type !== 'cover');
      const footerYOffset = PAGE_HEIGHT - (catalog.footerHeight ?? 38) - (catalog.marginBottom || 0);

      const allElements = [
        ...(pageHasHeader ? catalog.headerElements || [] : []),
        ...page.elements,
        ...(pageHasFooter ? (catalog.footerElements || []).map((el: any) => ({
          ...el,
          y: (el.y || 0) > 500 ? el.y : ((el.y || 0) + footerYOffset),
          text: el.type === 'text' && el.text?.includes('{{page}}')
            ? el.text.replace(/\{\{page\}\}/gi, String(i + 1))
            : el.text,
        })) : []),
      ];

      // Pre-process any images/product-block images so they don't taint the canvas
      const sanitizedElements = await Promise.all(
        allElements.map(async (el: any) => {
          if (el.type === 'image' && el.src) {
            const cleanSrc = await getCleanImageDataUrl(el.src);
            return { ...el, src: cleanSrc };
          }
          if (el.type === 'product-block' && el.src) {
            const cleanSrc = await getCleanImageDataUrl(el.src);
            return { ...el, src: cleanSrc };
          }
          return el;
        })
      );

      // Convert all elements to fabric objects
      const objects = await Promise.all(
        sanitizedElements
          .filter(el => el.visible !== false)
          .map(el => elementToFabricObject(el, products, catalog))
      );

      // Add sorted objects to offscreen canvas
      const validObjects = objects.filter(Boolean);
      validObjects.sort((a: any, b: any) => (a.zIndex || 0) - (b.zIndex || 0));

      validObjects.forEach(obj => {
        offscreenCanvas.add(obj);
      });

      offscreenCanvas.renderAll();

      // Brief wait to ensure image decoding & text rendering
      await new Promise(r => setTimeout(r, 80));

      // Export canvas to high-quality JPEG
      let dataUrl: string;
      try {
        dataUrl = offscreenCanvas.toDataURL({
          multiplier: 2,
          format: 'jpeg',
          quality: 0.95
        });
      } catch (taintErr) {
        console.warn('Offscreen canvas toDataURL tainted, falling back to 1x:', taintErr);
        dataUrl = hiddenCanvasEl.toDataURL('image/jpeg', 0.92);
      }

      if (i > 0) {
        pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT], 'portrait');
      }
      pdf.addImage(dataUrl, 'JPEG', 0, 0, PAGE_WIDTH, PAGE_HEIGHT, undefined, 'FAST');
    }

    if (onProgress) {
      onProgress(totalPages, totalPages, 'Downloading PDF...');
    }

    const safeFileName = (catalog.name || 'Catalog').replace(/[^a-z0-9_-]/gi, '_');
    pdf.save(`${safeFileName}.pdf`);

  } finally {
    offscreenCanvas.dispose();
    if (document.body.contains(hiddenCanvasEl)) {
      document.body.removeChild(hiddenCanvasEl);
    }
  }
}
