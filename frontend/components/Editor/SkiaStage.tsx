import React, { useEffect, useRef } from 'react';
import { CatalogPage, CanvasElement } from '../../types';
import { useStore } from '../../store/useStore';
import { PAGE_WIDTH, PAGE_HEIGHT } from '../../constants';
import { renderPageWithSkia } from '../../engine/skiaEngine';

interface Props {
  page: CatalogPage;
  pageIdx: number;
  zoom: number;
}

/**
 * Hardware-accelerated Skia WebAssembly GPU preview stage
 */
const SkiaStage: React.FC<Props> = ({ page, pageIdx, zoom }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { products, catalog } = useStore();

  useEffect(() => {
    if (!canvasRef.current) return;
    renderPageWithSkia(canvasRef.current, page, products, catalog, 1.0);
  }, [page, products, catalog]);

  return (
    <div style={{ width: PAGE_WIDTH * zoom, height: PAGE_HEIGHT * zoom, position: 'relative' }}>
      <canvas
        ref={canvasRef}
        width={PAGE_WIDTH}
        height={PAGE_HEIGHT}
        style={{
          width: PAGE_WIDTH * zoom,
          height: PAGE_HEIGHT * zoom,
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        }}
      />
    </div>
  );
};

export default SkiaStage;
