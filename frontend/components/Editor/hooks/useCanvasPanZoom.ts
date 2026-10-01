import { useState, useRef, useEffect, useCallback, RefObject } from 'react';
import { useStore } from '../../../store/useStore';
import { PAGE_WIDTH, PAGE_HEIGHT } from '../../../constants';

interface UseCanvasPanZoomProps {
  containerRef: RefObject<HTMLDivElement | null>;
  panContentRef: RefObject<HTMLDivElement | null>;
  zoom: number;
  setZoom: (zoom: number | ((prev: number) => number)) => void;
  activeTool: string;
}

export const useCanvasPanZoom = ({
  containerRef,
  panContentRef,
  zoom,
  setZoom,
  activeTool,
}: UseCanvasPanZoomProps) => {
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const panRef = useRef({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const [isPanActive, setIsPanActive] = useState(false);
  const lastPointerPosition = useRef({ x: 0, y: 0 });

  // Constraint helper
  const getClampedPan = useCallback((nextX: number, nextY: number) => {
    if (!containerRef.current || !panContentRef.current) return { x: nextX, y: nextY };

    const vW = containerRef.current.clientWidth;
    const vH = containerRef.current.clientHeight;
    const cW = panContentRef.current.scrollWidth;
    const cH = panContentRef.current.scrollHeight;

    let clampedX = nextX;
    let clampedY = nextY;

    if (cW <= vW) {
      clampedX = (vW - cW) / 2;
    } else {
      clampedX = Math.min(0, Math.max(vW - cW, nextX));
    }

    if (cH <= vH) {
      clampedY = (vH - cH) / 2;
    } else {
      clampedY = Math.min(0, Math.max(vH - cH, nextY));
    }

    return { x: clampedX, y: clampedY };
  }, [containerRef, panContentRef]);

  // Smoothly pan canvas to center a specific page
  const scrollToPageIndex = useCallback((pageIndex: number) => {
    const pages = useStore.getState().catalog.pages;
    if (!containerRef.current || !pages[pageIndex]) return;
    const vH = containerRef.current.clientHeight;
    const curPageH = PAGE_HEIGHT * zoom;
    const gap = 40; // py-12 gap-10
    const topPadding = 48; // py-12 = 48px
    const topBarH = 34;

    // Calculate Y offset of this specific page in content
    const pageTopInContent = topPadding + pageIndex * (curPageH + gap + topBarH);
    const targetPanY = (vH / 2) - (pageTopInContent + curPageH / 2);

    const next = getClampedPan(panRef.current.x, targetPanY);
    panRef.current = next;
    setPan(next);
  }, [containerRef, zoom, getClampedPan]);

  // Listen for panel page click → smoothly pan canvas to that page
  useEffect(() => {
    const handler = (e: Event) => {
      const { pageIndex } = (e as CustomEvent).detail;
      scrollToPageIndex(pageIndex);
    };
    window.addEventListener('catalog:scrollToPage', handler);
    return () => window.removeEventListener('catalog:scrollToPage', handler);
  }, [scrollToPageIndex]);

  // Zoom-to-fit on mount
  useEffect(() => {
    const timerRef = { current: 0 as unknown as ReturnType<typeof setTimeout> };
    const fit = () => {
      if (containerRef.current && containerRef.current.clientWidth > 0) {
        const padding = 80;
        const scaleX = (containerRef.current.clientWidth - padding) / PAGE_WIDTH;
        const scaleY = (containerRef.current.clientHeight - padding) / PAGE_HEIGHT;
        const newZoom = Math.min(Math.min(scaleX, scaleY), 1);
        setZoom(Math.max(newZoom, 0.2));
        setPan({ x: 0, y: 0 });
        panRef.current = { x: 0, y: 0 };
      } else {
        timerRef.current = setTimeout(fit, 100);
      }
    };
    timerRef.current = setTimeout(fit, 50);
    return () => clearTimeout(timerRef.current);
  }, [containerRef, setZoom]);

  // Block native browser pinch zoom
  useEffect(() => {
    const h = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) e.preventDefault();
    };
    window.addEventListener('wheel', h, { passive: false });
    return () => window.removeEventListener('wheel', h);
  }, []);

  // Natural Smooth Web-style scrolling (pan) and Ctrl+scroll (zoom)
  const zoomRef = useRef(zoom);
  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  const velocityRef = useRef({ x: 0, y: 0 });
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const stopInertia = () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      velocityRef.current = { x: 0, y: 0 };
    };

    const updateInertia = () => {
      const friction = 0.82;
      velocityRef.current.x *= friction;
      velocityRef.current.y *= friction;

      if (Math.abs(velocityRef.current.x) > 0.2 || Math.abs(velocityRef.current.y) > 0.2) {
        const next = getClampedPan(
          panRef.current.x + velocityRef.current.x,
          panRef.current.y + velocityRef.current.y
        );
        panRef.current = next;
        setPan(next);
        animFrameRef.current = requestAnimationFrame(updateInertia);
      } else {
        stopInertia();
      }
    };

    const handleContainerWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.closest('.fixed') ||
          target.closest('[role="dialog"]') ||
          target.closest('.modal-content') ||
          target.closest('[data-modal]'))
      ) {
        return;
      }

      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        stopInertia();
        const delta = e.deltaY > 0 ? -0.05 : 0.05;
        const newZoom = Math.min(3, Math.max(0.1, zoomRef.current + delta));
        setZoom(newZoom);
      } else {
        const speedScale = 0.45;
        const deltaX = -e.deltaX * speedScale;
        const deltaY = -e.deltaY * speedScale;

        velocityRef.current.x += deltaX * 0.25;
        velocityRef.current.y += deltaY * 0.25;

        const next = getClampedPan(panRef.current.x + deltaX, panRef.current.y + deltaY);
        panRef.current = next;
        setPan(next);

        if (!animFrameRef.current) {
          animFrameRef.current = requestAnimationFrame(updateInertia);
        }
      }
    };

    container.addEventListener('wheel', handleContainerWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleContainerWheel);
      stopInertia();
    };
  }, [containerRef, setZoom, getClampedPan]);

  // Sync pan constraints when zoom or pages change
  useEffect(() => {
    setPan((prev) => {
      const clamped = getClampedPan(prev.x, prev.y);
      panRef.current = clamped;
      return clamped;
    });
  }, [zoom, getClampedPan]);

  // Hand tool panning handlers
  const handlePanMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && activeTool === 'hand') {
      e.preventDefault();
      e.stopPropagation();
      isPanning.current = true;
      setIsPanActive(true);
      lastPointerPosition.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handlePanMouseMove = (e: React.MouseEvent) => {
    if (!isPanning.current) return;
    e.preventDefault();
    const dx = e.clientX - lastPointerPosition.current.x;
    const dy = e.clientY - lastPointerPosition.current.y;
    lastPointerPosition.current = { x: e.clientX, y: e.clientY };
    setPan((prev) => {
      const next = getClampedPan(prev.x + dx, prev.y + dy);
      panRef.current = next;
      return next;
    });
  };

  const handlePanMouseUp = () => {
    isPanning.current = false;
    setIsPanActive(false);
  };

  return {
    pan,
    setPan,
    panRef,
    isPanActive,
    isPanning,
    getClampedPan,
    scrollToPageIndex,
    handlePanMouseDown,
    handlePanMouseMove,
    handlePanMouseUp,
  };
};
