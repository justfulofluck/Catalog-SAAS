import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useStore } from '../../store/useStore';
import { normalizeImageUrl } from '../../utils/imageUtils';

interface Props {
  zoom: number;
}

export const ImageCropOverlay: React.FC<Props> = ({ zoom }) => {
  const {
    catalog,
    currentPageIndex,
    activeCropElementId,
    updateElement,
    updateHeaderElement,
    updateFooterElement,
    applyCropMode,
    cancelCropMode,
  } = useStore();

  const currentPage = catalog.pages?.[currentPageIndex];
  const element = useMemo(() => {
    if (!activeCropElementId) return null;
    return (
      currentPage?.elements?.find((el) => el.id === activeCropElementId) ||
      catalog.headerElements?.find((el) => el.id === activeCropElementId) ||
      catalog.footerElements?.find((el) => el.id === activeCropElementId) ||
      null
    );
  }, [currentPage?.elements, catalog.headerElements, catalog.footerElements, activeCropElementId]);

  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number }>({
    width: element?.naturalWidth || element?.width || 1,
    height: element?.naturalHeight || element?.height || 1,
  });

  const [isInteracting, setIsInteracting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load natural image dimensions if not yet populated
  useEffect(() => {
    if (!element?.src) return;
    const img = new Image();
    img.src = normalizeImageUrl(element.src);
    img.onload = () => {
      setNaturalSize({
        width: img.naturalWidth || 1,
        height: img.naturalHeight || 1,
      });
      if (!element.naturalWidth || !element.naturalHeight) {
        internalUpdate({
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
        });
      }
    };
  }, [element?.src]);

  const internalUpdate = useCallback(
    (updates: any) => {
      if (!activeCropElementId) return;
      if (catalog.headerElements?.some((h) => h.id === activeCropElementId)) {
        updateHeaderElement(activeCropElementId, updates);
      } else if (catalog.footerElements?.some((f) => f.id === activeCropElementId)) {
        updateFooterElement(activeCropElementId, updates);
      } else {
        updateElement(currentPageIndex, activeCropElementId, updates);
      }
    },
    [activeCropElementId, catalog.headerElements, catalog.footerElements, currentPageIndex, updateElement, updateHeaderElement, updateFooterElement]
  );

  // Keyboard shortcut listener (Enter = Done, Esc = Cancel)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        applyCropMode();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        cancelCropMode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [applyCropMode, cancelCropMode]);

  if (!element || !element.src) return null;

  const nw = naturalSize.width;
  const nh = naturalSize.height;

  const curCropX = element.cropX !== undefined ? element.cropX : 0;
  const curCropY = element.cropY !== undefined ? element.cropY : 0;
  const curCropW = element.cropWidth !== undefined ? element.cropWidth : nw;
  const curCropH = element.cropHeight !== undefined ? element.cropHeight : nh;

  const frameW = element.width;
  const frameH = element.height;

  // Scale factor from natural image pixels to canvas display pixels
  const imgScaleX = frameW / (curCropW || 1);
  const imgScaleY = frameH / (curCropH || 1);

  // Total uncropped dimensions in canvas space
  const totalImgW = nw * imgScaleX;
  const totalImgH = nh * imgScaleY;

  // Offset of the full image relative to the crop frame top-left
  const imgOffsetX = -curCropX * imgScaleX;
  const imgOffsetY = -curCropY * imgScaleY;

  // 1. Pan / Drag Image inside Frame
  const handlePanMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsInteracting(true);

    const startClientX = e.clientX;
    const startClientY = e.clientY;
    const startCropX = curCropX;
    const startCropY = curCropY;

    const onMouseMove = (moveEvt: MouseEvent) => {
      const dx = (moveEvt.clientX - startClientX) / zoom;
      const dy = (moveEvt.clientY - startClientY) / zoom;

      // Inverse of scale: moving image right means decreasing cropX
      const deltaCropX = -dx / imgScaleX;
      const deltaCropY = -dy / imgScaleY;

      const maxCropX = Math.max(0, nw - curCropW);
      const maxCropY = Math.max(0, nh - curCropH);

      const nextCropX = Math.max(0, Math.min(maxCropX, startCropX + deltaCropX));
      const nextCropY = Math.max(0, Math.min(maxCropY, startCropY + deltaCropY));

      internalUpdate({
        cropX: Math.round(nextCropX),
        cropY: Math.round(nextCropY),
      });
    };

    const onMouseUp = () => {
      setIsInteracting(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // 2. Resize Crop Frame Handles (tl, tr, bl, br, ml, mr, mt, mb)
  const handleFrameResizeMouseDown = (handle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsInteracting(true);

    const startClientX = e.clientX;
    const startClientY = e.clientY;
    const startX = element.x;
    const startY = element.y;
    const startW = frameW;
    const startH = frameH;
    const startCropX = curCropX;
    const startCropY = curCropY;
    const startCropW = curCropW;
    const startCropH = curCropH;

    const onMouseMove = (moveEvt: MouseEvent) => {
      const dx = (moveEvt.clientX - startClientX) / zoom;
      const dy = (moveEvt.clientY - startClientY) / zoom;
      const isAlt = moveEvt.altKey;

      let newW = startW;
      let newH = startH;
      let newX = startX;
      let newY = startY;
      let newCropX = startCropX;
      let newCropY = startCropY;
      let newCropW = startCropW;
      let newCropH = startCropH;

      if (handle.includes('r')) {
        const rawW = Math.max(20, startW + dx);
        const maxCropW = nw - startCropX;
        newW = Math.min(maxCropW * imgScaleX, rawW);
        newCropW = newW / imgScaleX;
        newCropX = startCropX;
      }
      if (handle.includes('l')) {
        const rawW = Math.max(20, startW - dx);
        const maxCropW = startCropX + startCropW;
        newW = Math.min(maxCropW * imgScaleX, rawW);
        newCropW = newW / imgScaleX;
        newCropX = Math.max(0, startCropX + startCropW - newCropW);
        newX = startX + (startW - newW);
      }
      if (handle.includes('b')) {
        const rawH = Math.max(20, startH + dy);
        const maxCropH = nh - startCropY;
        newH = Math.min(maxCropH * imgScaleY, rawH);
        newCropH = newH / imgScaleY;
        newCropY = startCropY;
      }
      if (handle.includes('t')) {
        const rawH = Math.max(20, startH - dy);
        const maxCropH = startCropY + startCropH;
        newH = Math.min(maxCropH * imgScaleY, rawH);
        newCropH = newH / imgScaleY;
        newCropY = Math.max(0, startCropY + startCropH - newCropH);
        newY = startY + (startH - newH);
      }

      if (isAlt) {
        if (handle.includes('r') || handle.includes('l')) {
          const centerX = startCropX + startCropW / 2;
          const maxHalfW = Math.min(centerX, nw - centerX);
          const rawHalfW = Math.max(10, Math.abs(dx));
          const halfW = Math.min(maxHalfW * imgScaleX, rawHalfW);
          newW = halfW * 2;
          newCropW = newW / imgScaleX;
          newCropX = Math.max(0, centerX - newCropW / 2);
          newX = startX + (startW - newW) / 2;
        }
        if (handle.includes('t') || handle.includes('b')) {
          const centerY = startCropY + startCropH / 2;
          const maxHalfH = Math.min(centerY, nh - centerY);
          const rawHalfH = Math.max(10, Math.abs(dy));
          const halfH = Math.min(maxHalfH * imgScaleY, rawHalfH);
          newH = halfH * 2;
          newCropH = newH / imgScaleY;
          newCropY = Math.max(0, centerY - newCropH / 2);
          newY = startY + (startH - newH) / 2;
        }
      }

      internalUpdate({
        x: Math.round(newX),
        y: Math.round(newY),
        width: Math.round(newW),
        height: Math.round(newH),
        cropX: Math.round(newCropX),
        cropY: Math.round(newCropY),
        cropWidth: Math.round(newCropW),
        cropHeight: Math.round(newCropH),
      });
    };

    const onMouseUp = () => {
      setIsInteracting(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // 3. Zoom / Scale Image from Ghosted Outer Corners
  const handleOuterScaleMouseDown = (handle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsInteracting(true);

    const startClientX = e.clientX;
    const startW = frameW;
    const startH = frameH;
    const startCropW = curCropW;
    const startCropH = curCropH;

    const onMouseMove = (moveEvt: MouseEvent) => {
      const dx = (moveEvt.clientX - startClientX) / zoom;
      const zoomFactor = Math.max(0.2, (startW + dx * (handle.includes('r') ? 1 : -1)) / startW);

      const nextCropW = Math.max(15, Math.min(nw, startCropW / zoomFactor));
      const nextCropH = Math.max(15, Math.min(nh, startCropH / zoomFactor));

      internalUpdate({
        cropWidth: Math.round(nextCropW),
        cropHeight: Math.round(nextCropH),
      });
    };

    const onMouseUp = () => {
      setIsInteracting(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const imgUrl = normalizeImageUrl(element.src);

  return (
    <div
      ref={containerRef}
      className="absolute pointer-events-auto select-none"
      style={{
        left: `${element.x * zoom}px`,
        top: `${element.y * zoom}px`,
        width: `${frameW * zoom}px`,
        height: `${frameH * zoom}px`,
        transform: `rotate(${element.rotation || 0}deg)`,
        transformOrigin: 'top left',
        zIndex: 950,
      }}
    >
      {/* 1. Ghosted Uncropped Full Image (Outer Box) */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: `${imgOffsetX * zoom}px`,
          top: `${imgOffsetY * zoom}px`,
          width: `${totalImgW * zoom}px`,
          height: `${totalImgH * zoom}px`,
          border: '1.5px dashed rgba(16, 185, 129, 0.5)',
          borderRadius: '2px',
        }}
      >
        <img
          src={imgUrl}
          alt="Ghosted Original"
          className="w-full h-full object-fill opacity-40 select-none pointer-events-none"
          draggable={false}
        />

        {/* 4 Outer Zoom Handles */}
        {['tl', 'tr', 'bl', 'br'].map((pos) => {
          const isTop = pos.includes('t');
          const isLeft = pos.includes('l');
          return (
            <div
              key={`outer-${pos}`}
              onMouseDown={(e) => handleOuterScaleMouseDown(pos, e)}
              className="absolute w-4 h-4 bg-white rounded-full border border-black/20 shadow-md pointer-events-auto cursor-nwse-resize hover:scale-125 transition-transform"
              style={{
                top: isTop ? '-8px' : 'auto',
                bottom: !isTop ? '-8px' : 'auto',
                left: isLeft ? '-8px' : 'auto',
                right: !isLeft ? '-8px' : 'auto',
              }}
            />
          );
        })}
      </div>

      {/* 2. Active Crop Frame Window */}
      <div
        onMouseDown={handlePanMouseDown}
        className="absolute inset-0 border-2 border-[#10B981] overflow-hidden cursor-grab active:cursor-grabbing shadow-[0_0_0_1px_rgba(226,220,200,0.5)]"
      >
        {/* Crisp Un-dimmed Image slice */}
        <div
          className="absolute"
          style={{
            left: `${imgOffsetX * zoom}px`,
            top: `${imgOffsetY * zoom}px`,
            width: `${totalImgW * zoom}px`,
            height: `${totalImgH * zoom}px`,
          }}
        >
          <img
            src={imgUrl}
            alt="Cropped Frame"
            className="w-full h-full object-fill select-none pointer-events-none"
            draggable={false}
          />
        </div>

        {/* 3x3 Rule-of-Thirds Grid (Matching Screenshot 3) */}
        <div
          className={`absolute inset-0 pointer-events-none transition-opacity duration-200 grid grid-cols-3 grid-rows-3 ${
            isInteracting ? 'opacity-90' : 'opacity-40'
          }`}
        >
          <div className="border-r border-b border-white/60" />
          <div className="border-r border-b border-white/60" />
          <div className="border-b border-white/60" />
          <div className="border-r border-b border-white/60" />
          <div className="border-r border-b border-white/60" />
          <div className="border-b border-white/60" />
          <div className="border-r border-white/60" />
          <div className="border-r border-white/60" />
          <div />
        </div>
      </div>

      {/* 3. Canva-Style L-Bracket Corner Crop Marks */}
      {/* Top-Left */}
      <div
        onMouseDown={(e) => handleFrameResizeMouseDown('tl', e)}
        className="absolute -top-1 -left-1 w-4 h-4 border-t-[3px] border-l-[3px] border-white shadow-[0_1px_4px_rgba(0,0,0,0.5)] cursor-nwse-resize z-10"
      />
      {/* Top-Right */}
      <div
        onMouseDown={(e) => handleFrameResizeMouseDown('tr', e)}
        className="absolute -top-1 -right-1 w-4 h-4 border-t-[3px] border-r-[3px] border-white shadow-[0_1px_4px_rgba(0,0,0,0.5)] cursor-nesw-resize z-10"
      />
      {/* Bottom-Left */}
      <div
        onMouseDown={(e) => handleFrameResizeMouseDown('bl', e)}
        className="absolute -bottom-1 -left-1 w-4 h-4 border-b-[3px] border-l-[3px] border-white shadow-[0_1px_4px_rgba(0,0,0,0.5)] cursor-nesw-resize z-10"
      />
      {/* Bottom-Right */}
      <div
        onMouseDown={(e) => handleFrameResizeMouseDown('br', e)}
        className="absolute -bottom-1 -right-1 w-4 h-4 border-b-[3px] border-r-[3px] border-white shadow-[0_1px_4px_rgba(0,0,0,0.5)] cursor-nwse-resize z-10"
      />

      {/* 4. Canva-Style Middle Pill Handles */}
      {/* Left Pill */}
      <div
        onMouseDown={(e) => handleFrameResizeMouseDown('l', e)}
        className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-5 bg-white border border-black/20 rounded-full shadow-md cursor-ew-resize z-10"
      />
      {/* Right Pill */}
      <div
        onMouseDown={(e) => handleFrameResizeMouseDown('r', e)}
        className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-5 bg-white border border-black/20 rounded-full shadow-md cursor-ew-resize z-10"
      />
      {/* Top Pill */}
      <div
        onMouseDown={(e) => handleFrameResizeMouseDown('t', e)}
        className="absolute -top-1 left-1/2 -translate-x-1/2 w-5 h-2 bg-white border border-black/20 rounded-full shadow-md cursor-ns-resize z-10"
      />
      {/* Bottom Pill */}
      <div
        onMouseDown={(e) => handleFrameResizeMouseDown('b', e)}
        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-2 bg-white border border-black/20 rounded-full shadow-md cursor-ns-resize z-10"
      />
    </div>
  );
};
export default ImageCropOverlay;
