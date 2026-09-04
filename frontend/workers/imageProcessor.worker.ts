// Web Worker for background image decoding, filtering, and offscreen rasterization

interface ProcessImageMessage {
  id: string;
  type: 'PROCESS_IMAGE';
  imageUrl: string;
  filters?: {
    brightness?: number;
    contrast?: number;
    saturation?: number;
    grayscale?: boolean;
    blur?: number;
  };
  targetWidth?: number;
  targetHeight?: number;
}

self.onmessage = async (e: MessageEvent<ProcessImageMessage>) => {
  const { id, type, imageUrl, filters, targetWidth, targetHeight } = e.data;

  if (type === 'PROCESS_IMAGE') {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const imageBitmap = await createImageBitmap(blob);

      const width = targetWidth || imageBitmap.width;
      const height = targetHeight || imageBitmap.height;

      if (typeof OffscreenCanvas !== 'undefined') {
        const offscreen = new OffscreenCanvas(width, height);
        const ctx = offscreen.getContext('2d');

        if (ctx) {
          const filterParts: string[] = [];
          if (filters) {
            if (filters.brightness !== undefined && filters.brightness !== 0) {
              filterParts.push('brightness(' + (1 + filters.brightness) + ')');
            }
            if (filters.contrast !== undefined && filters.contrast !== 0) {
              filterParts.push('contrast(' + (1 + filters.contrast) + ')');
            }
            if (filters.saturation !== undefined && filters.saturation !== 0) {
              filterParts.push('saturate(' + (1 + filters.saturation) + ')');
            }
            if (filters.grayscale) {
              filterParts.push('grayscale(100%)');
            }
            if (filters.blur && filters.blur > 0) {
              filterParts.push('blur(' + filters.blur + 'px)');
            }
          }

          if (filterParts.length > 0) {
            ctx.filter = filterParts.join(' ');
          }

          ctx.drawImage(imageBitmap, 0, 0, width, height);

          const resultBlob = await offscreen.convertToBlob({ type: 'image/webp', quality: 0.92 });
          const processedUrl = URL.createObjectURL(resultBlob);

          self.postMessage({ id, success: true, processedUrl, width, height });
          return;
        }
      }

      self.postMessage({
        id,
        success: true,
        processedUrl: imageUrl,
        width: imageBitmap.width,
        height: imageBitmap.height
      });
    } catch (error: any) {
      self.postMessage({ id, success: false, error: error.message || 'Worker processing failed' });
    }
  }
};
