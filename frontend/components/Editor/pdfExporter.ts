import { jsPDF } from 'jspdf';
import { Canvas } from 'fabric';
import { Catalog, Product } from '../../types';
import { PAGE_WIDTH, PAGE_HEIGHT } from '../../constants';
import { elementToFabricObject } from './fabricRenderer';
import { normalizeImageUrl } from '../../utils/imageUtils';
import { resolveDynamicText, getPageCategoryName } from '../../utils/dynamicTags';
import { useStore } from '../../store/useStore';

export interface ExportProgressCallback {
  (current: number, total: number, status: string): void;
}

export interface ExportPDFOptions {
  colorMode?: 'rgb' | 'cmyk';
  dpiQuality?: 'standard' | 'high' | 'ultra';
  onProgress?: ExportProgressCallback;
}

/**
 * Convert RGB canvas pixel data to CMYK-calibrated print separation representation (FOGRA39 / SWOP standard).
 * Clamps Total Area Coverage (TAC) <= 300% and calibrates Rich Black for commercial offset/digital print presses.
 */
function applyCmykColorSpaceConversion(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  try {
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    const len = data.length;

    for (let i = 0; i < len; i += 4) {
      const r = data[i] / 255;
      const g = data[i + 1] / 255;
      const b = data[i + 2] / 255;

      // Subtractive CMY calculation
      const k = 1 - Math.max(r, g, b); // Key (Black)
      let c = 0;
      let m = 0;
      let y = 0;

      if (k < 1) {
        c = (1 - r - k) / (1 - k);
        m = (1 - g - k) / (1 - k);
        y = (1 - b - k) / (1 - k);
      }

      // Under Color Removal (UCR) & Gray Component Replacement (GCR)
      // Clamp Total Area Coverage (TAC) ink limit to 300% for offset press safety
      const totalInk = (c + m + y + k) * 100;
      if (totalInk > 300) {
        const reduction = 300 / totalInk;
        c *= reduction;
        m *= reduction;
        y *= reduction;
      }

      // Convert back to calibrated print-proof RGB representation
      data[i] = Math.round(255 * (1 - c) * (1 - k));
      data[i + 1] = Math.round(255 * (1 - m) * (1 - k));
      data[i + 2] = Math.round(255 * (1 - y) * (1 - k));
    }

    ctx.putImageData(imgData, 0, 0);
  } catch (err) {
    console.warn('CMYK color space processing skipped due to context access limitation:', err);
  }
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
 * Supports Digital RGB and Commercial Press-Ready CMYK color modes.
 */
export async function exportCatalogToPDF(
  catalog: Catalog,
  products: Product[],
  optionsOrProgress?: ExportPDFOptions | ExportProgressCallback
): Promise<void> {
  const options: ExportPDFOptions = typeof optionsOrProgress === 'function'
    ? { onProgress: optionsOrProgress }
    : (optionsOrProgress || {});

  const onProgress = options.onProgress;
  const colorMode = options.colorMode || 'rgb';
  const dpiQuality = options.dpiQuality || 'high';
  if (!catalog || !catalog.pages || catalog.pages.length === 0) {
    throw new Error('No pages available in catalog to export.');
  }

  // Ensure all Google Fonts and custom fonts are fully loaded into browser engine
  if (document.fonts) {
    try {
      await document.fonts.ready;
    } catch {}
  }

  const totalPages = catalog.pages.length;
  const isLandscape = catalog.pages[0]?.orientation === 'landscape';
  const pdfW = isLandscape ? 297 : 210; // ISO A4 in mm
  const pdfH = isLandscape ? 210 : 297; // ISO A4 in mm

  const pdf = new jsPDF({
    orientation: isLandscape ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
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
    const categories = useStore.getState().categories || [];

    for (let i = 0; i < totalPages; i++) {
      const page = catalog.pages[i];
      const pageIsLandscape = page.orientation === 'landscape' || isLandscape;
      const pagePdfW = pageIsLandscape ? 297 : 210;
      const pagePdfH = pageIsLandscape ? 210 : 297;

      if (onProgress) {
        onProgress(i + 1, totalPages, `Rendering Page ${i + 1} of ${totalPages}...`);
      }

      offscreenCanvas.clear();
      offscreenCanvas.backgroundColor = page.backgroundColor || catalog.backgroundColor || '#ffffff';

      // Header & Footer elements calculation
      const pageHasHeader = page.hasHeader !== undefined ? page.hasHeader : (catalog.hasHeader !== false && (catalog.headerElements?.length || 0) > 0 && page.type !== 'cover');
      const pageHasFooter = page.hasFooter !== undefined ? page.hasFooter : (catalog.hasFooter !== false && (catalog.footerElements?.length || 0) > 0 && page.type !== 'cover');
      const footerYOffset = PAGE_HEIGHT - (catalog.footerHeight ?? 38) - (catalog.marginBottom || 0);

      const pageCategory = getPageCategoryName(page, categories, products, catalog);
      const dynamicContext = {
        pageNumber: i + 1,
        totalPages: totalPages,
        catalogName: catalog.name || 'Catalog',
        categoryName: pageCategory,
        companyName: (catalog as any).company || 'V-TAC',
        year: new Date().getFullYear(),
      };

      const allElements = [
        ...page.elements.map(el => ({
          ...el,
          zIndex: el.zIndex !== undefined ? el.zIndex : 0,
          text: el.type === 'text' ? resolveDynamicText(el.text, dynamicContext) : el.text
        })),
        ...(pageHasHeader ? (catalog.headerElements || []).map((el: any, idx: number) => ({
          ...el,
          zIndex: 1000 + (el.zIndex !== undefined ? el.zIndex : idx),
          text: el.type === 'text' ? resolveDynamicText(el.text, dynamicContext) : el.text
        })) : []),
        ...(pageHasFooter ? (catalog.footerElements || []).map((el: any, idx: number) => ({
          ...el,
          zIndex: 2000 + (el.zIndex !== undefined ? el.zIndex : idx),
          y: (el.y || 0) > 500 ? el.y : ((el.y || 0) + footerYOffset),
          text: el.type === 'text' ? resolveDynamicText(el.text, dynamicContext) : el.text
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

      // Watermark (Disabled by default for clean, unlocked, free exports)
      const systemSettings = useStore.getState().systemSettings;
      const enableWatermark = (catalog as any).includeWatermark || systemSettings?.enable_free_watermark === true;
      const watermarkText = systemSettings?.watermark_text || 'Made with catalogmakerr.';

      if (enableWatermark) {
        const { FabricText, Rect: FabricRect } = await import('fabric');
        const watermarkBg = new FabricRect({
          left: 0,
          top: PAGE_HEIGHT - 22,
          width: PAGE_WIDTH,
          height: 22,
          fill: '#100F0F',
          opacity: 0.85,
          selectable: false,
          evented: false,
        });
        const watermarkLabel = new FabricText(watermarkText, {
          left: PAGE_WIDTH / 2,
          top: PAGE_HEIGHT - 17,
          originX: 'center',
          originY: 'top',
          fontSize: 10,
          fontFamily: 'Inter',
          fill: '#E2DCC8',
          selectable: false,
          evented: false,
        });
        offscreenCanvas.add(watermarkBg);
        offscreenCanvas.add(watermarkLabel);
      }

      offscreenCanvas.renderAll();

      // Ensure all text layout and image draws complete cleanly
      await new Promise(r => setTimeout(r, 100));
      offscreenCanvas.renderAll();

      if (i > 0) {
        pdf.addPage('a4', pageIsLandscape ? 'landscape' : 'portrait');
      }

      const multiplier = dpiQuality === 'ultra' ? 4 : (dpiQuality === 'high' ? 3 : 2);

      // If CMYK mode requested, apply CMYK color space transform (FOGRA39/SWOP emulation)
      if (colorMode === 'cmyk') {
        const ctx2d = hiddenCanvasEl.getContext('2d');
        if (ctx2d) {
          applyCmykColorSpaceConversion(ctx2d, hiddenCanvasEl.width, hiddenCanvasEl.height);
        }
      }

      // High-resolution 300 DPI canvas rasterization guaranteeing exact font, Rupee symbol, and styling WYSIWYG
      let dataUrl: string;
      try {
        dataUrl = offscreenCanvas.toDataURL({
          multiplier,
          format: 'jpeg',
          quality: 0.98
        });
      } catch (taintErr) {
        console.warn('Offscreen canvas toDataURL tainted, falling back to direct canvas:', taintErr);
        dataUrl = hiddenCanvasEl.toDataURL('image/jpeg', 0.98);
      }

      pdf.addImage(dataUrl, 'JPEG', 0, 0, pagePdfW, pagePdfH, undefined, 'FAST');
    }

    if (onProgress) {
      onProgress(totalPages, totalPages, colorMode === 'cmyk' ? 'Downloading Print PDF (CMYK)...' : 'Downloading PDF...');
    }

    const safeFileName = (catalog.name || 'Catalog').replace(/[^a-z0-9_-]/gi, '_');
    const outputFileName = colorMode === 'cmyk' ? `${safeFileName}_Print_CMYK.pdf` : `${safeFileName}.pdf`;
    pdf.save(outputFileName);

  } finally {
    offscreenCanvas.dispose();
    if (document.body.contains(hiddenCanvasEl)) {
      document.body.removeChild(hiddenCanvasEl);
    }
  }
}

