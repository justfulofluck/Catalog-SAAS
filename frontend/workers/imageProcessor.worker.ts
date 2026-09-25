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
  overlay?: {
    enabled?: boolean;
    type?: 'solid' | 'gradient';
    color?: string;
    opacity?: number;
    direction?: 'to-right' | 'to-left' | 'to-bottom' | 'to-top' | 'to-bottom-right' | 'to-top-right';
    startColor?: string;
    endColor?: string;
    startOpacity?: number;
    endOpacity?: number;
  };
  targetWidth?: number;
  targetHeight?: number;
}

function workerColorToRgba(color?: string | null, opacityPercent: number = 100): string {
  const alpha = Math.max(0, Math.min(1, opacityPercent / 100));
  if (!color) return `rgba(0, 0, 0, ${alpha})`;
  const trimmed = color.trim();
  if (trimmed.startsWith('rgba(')) return trimmed.replace(/,\s*[\d\.]+\)$/, `, ${alpha})`);
  if (trimmed.startsWith('rgb(')) return trimmed.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`);
  let hex = trimmed.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  if (hex.length >= 6) {
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return `rgba(0, 0, 0, ${alpha})`;
}

self.onmessage = async (e: MessageEvent<ProcessImageMessage>) => {
  const { id, type, imageUrl, filters, overlay, targetWidth, targetHeight } = e.data;

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

          // Apply overlay on offscreen canvas if enabled
          if (overlay && overlay.enabled) {
            ctx.filter = 'none';
            ctx.save();
            if (overlay.type === 'gradient') {
              const dir = overlay.direction || 'to-right';
              const startColor = overlay.startColor || overlay.color || '#000000';
              const endColor = overlay.endColor || overlay.color || startColor;
              const startAlpha = overlay.startOpacity !== undefined ? overlay.startOpacity : (overlay.opacity !== undefined ? overlay.opacity : 80);
              const endAlpha = overlay.endOpacity !== undefined ? overlay.endOpacity : 0;

              const startRgba = workerColorToRgba(startColor, startAlpha);
              const endRgba = workerColorToRgba(endColor, endAlpha);

              let grad: CanvasGradient;
              switch (dir) {
                case 'to-right': grad = ctx.createLinearGradient(0, 0, width, 0); break;
                case 'to-left': grad = ctx.createLinearGradient(width, 0, 0, 0); break;
                case 'to-bottom': grad = ctx.createLinearGradient(0, 0, 0, height); break;
                case 'to-top': grad = ctx.createLinearGradient(0, height, 0, 0); break;
                case 'to-bottom-right': grad = ctx.createLinearGradient(0, 0, width, height); break;
                case 'to-top-right': grad = ctx.createLinearGradient(0, height, width, 0); break;
                default: grad = ctx.createLinearGradient(0, 0, width, 0);
              }
              grad.addColorStop(0, startRgba);
              grad.addColorStop(1, endRgba);
              ctx.fillStyle = grad;
              ctx.globalAlpha = 1;
              ctx.fillRect(0, 0, width, height);
            } else {
              ctx.fillStyle = overlay.color || '#f97316';
              ctx.globalAlpha = (overlay.opacity !== undefined ? overlay.opacity : 22) / 100;
              ctx.fillRect(0, 0, width, height);
            }
            ctx.restore();
          }

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
