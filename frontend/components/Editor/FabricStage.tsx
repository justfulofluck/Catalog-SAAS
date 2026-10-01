import React, { useEffect, useRef, useState } from 'react';
import { Canvas } from 'fabric';
import { useStore } from '../../store/useStore';
import { PAGE_WIDTH, PAGE_HEIGHT } from '../../constants';
import { CatalogPage, CanvasElement } from '../../types';
import { SpatialIndex, DistanceBadge } from '../../utils/spatialIndex';
import { initCanvaGlobals, CANVA_THEME } from '../../utils/canvaControls';
import { FabricSmartGuidesOverlay } from './Canvas/FabricSmartGuidesOverlay';
import { useFabricEvents } from './hooks/useFabricEvents';
import { useFabricObjectSync } from './hooks/useFabricObjectSync';

// Initialize Canva-style controls globally on Fabric prototypes
initCanvaGlobals();

interface FabricStageProps {
  page: CatalogPage;
  pageIdx: number;
  isActive: boolean;
  zoom: number;
  canvasBg: string;
  headerElements?: CanvasElement[];
  footerElements?: CanvasElement[];
  footerHeight?: number;
  editingId?: string | null;
}

const STABLE_EMPTY_ARRAY: CanvasElement[] = [];

// Artboard bleed padding: allows selection outline, handles, and elements to extend freely outside the sheet into the workspace
const CANVAS_PAD_X = 500;
const CANVAS_PAD_Y = 80;

const FabricStage: React.FC<FabricStageProps> = ({
  page,
  pageIdx,
  isActive,
  zoom,
  canvasBg,
  headerElements = STABLE_EMPTY_ARRAY,
  footerElements = STABLE_EMPTY_ARRAY,
  footerHeight = 38,
  editingId = null,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);
  const [canvasInstance, setCanvasInstance] = useState<Canvas | null>(null);
  const spatialIndexRef = useRef<SpatialIndex>(new SpatialIndex());

  // Guide and indicator state
  const [activeGuides, setActiveGuides] = useState<
    { type: 'horizontal' | 'vertical'; pos: number }[]
  >([]);
  const [activeDistanceBadges, setActiveDistanceBadges] = useState<DistanceBadge[]>([]);
  const [activeDimensions, setActiveDimensions] = useState<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);

  const activeCropElementId = useStore((state) => state.activeCropElementId);

  // Stable refs for event listeners and render cycles
  const pageRef = useRef(page);
  pageRef.current = page;
  const pageIdxRef = useRef(pageIdx);
  pageIdxRef.current = pageIdx;
  const isActiveRef = useRef(isActive);
  isActiveRef.current = isActive;
  const suppressSelectionClearedRef = useRef(false);

  const curW = PAGE_WIDTH;
  const curH = PAGE_HEIGHT;

  // Deselect active object when entering crop mode
  useEffect(() => {
    if (activeCropElementId && fabricCanvasRef.current) {
      fabricCanvasRef.current.discardActiveObject();
      fabricCanvasRef.current.requestRenderAll();
    }
  }, [activeCropElementId]);

  // 1. Initialize Fabric Canvas instance
  useEffect(() => {
    if (!canvasRef.current) return;

    if (fabricCanvasRef.current) {
      try {
        fabricCanvasRef.current.dispose();
      } catch (e) {}
      fabricCanvasRef.current = null;
    }

    const canvasEl = canvasRef.current;
    if ((canvasEl as any).__fabric) {
      try {
        (canvasEl as any).__fabric.dispose();
      } catch (e) {}
    }

    let canvas: Canvas;
    try {
      canvas = new Canvas(canvasEl, {
        width: (curW + CANVAS_PAD_X * 2) * zoom,
        height: (curH + CANVAS_PAD_Y * 2) * zoom,
        backgroundColor: 'transparent',
        selection: true,
        selectionColor: 'rgba(139, 61, 255, 0.12)',
        selectionBorderColor: CANVA_THEME.borderColor,
        selectionLineWidth: 1.5,
        preserveObjectStacking: true,
        enableRetinaScaling: true,
        fireRightClick: true,
        stopContextMenu: true,
        controlsAboveOverlay: true,
      });
    } catch (err) {
      console.warn('Fabric Canvas init safely skipped or already disposed:', err);
      return;
    }

    canvas.controlsAboveOverlay = true;
    canvas.viewportTransform = [zoom, 0, 0, zoom, CANVAS_PAD_X * zoom, CANVAS_PAD_Y * zoom];

    // Clip artwork to page sheet boundary [0, curW] x [0, curH] while keeping controls unclipped
    const origRenderObjects = (canvas as any)._renderObjects.bind(canvas);
    (canvas as any)._renderObjects = function (ctx: CanvasRenderingContext2D, objects: any[]) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, curW, curH);
      ctx.clip();
      origRenderObjects(ctx, objects);
      ctx.restore();
    };

    fabricCanvasRef.current = canvas;
    setCanvasInstance(canvas);

    return () => {
      try {
        canvas.dispose();
      } catch (e) {}
      fabricCanvasRef.current = null;
      setCanvasInstance(null);
    };
  }, [curW, curH]);

  // 2. Sync viewport dimensions & zoom
  useEffect(() => {
    if (!fabricCanvasRef.current) return;
    const canvas = fabricCanvasRef.current;
    canvas.controlsAboveOverlay = true;
    canvas.setDimensions({
      width: (curW + CANVAS_PAD_X * 2) * zoom,
      height: (curH + CANVAS_PAD_Y * 2) * zoom,
    });
    canvas.viewportTransform = [zoom, 0, 0, zoom, CANVAS_PAD_X * zoom, CANVAS_PAD_Y * zoom];
    canvas.calcOffset();
    canvas.requestRenderAll();
  }, [zoom, curW, curH]);

  // 3. Attach gesture, snapping, selection, and drag/drop event handlers
  useFabricEvents({
    canvas: canvasInstance,
    canvasRef,
    pageRef,
    pageIdxRef,
    isActiveRef,
    spatialIndexRef,
    suppressSelectionClearedRef,
    zoom,
    headerElements,
    footerElements,
    setActiveGuides,
    setActiveDistanceBadges,
    setActiveDimensions,
  });

  // 4. Attach object rendering and diff synchronization
  useFabricObjectSync({
    canvas: canvasInstance,
    page,
    pageIdx,
    isActive,
    editingId,
    activeCropElementId,
    canvasBg,
    headerElements,
    footerElements,
    footerHeight,
    spatialIndexRef,
    suppressSelectionClearedRef,
    isActiveRef,
  });

  return (
    <div style={{ width: curW * zoom, height: curH * zoom, position: 'relative' }}>
      <div
        style={{
          position: 'absolute',
          left: -CANVAS_PAD_X * zoom,
          top: -CANVAS_PAD_Y * zoom,
          width: (curW + CANVAS_PAD_X * 2) * zoom,
          height: (curH + CANVAS_PAD_Y * 2) * zoom,
          pointerEvents: isActive ? 'auto' : 'none',
        }}
      >
        <canvas ref={canvasRef} />
      </div>

      {/* Real-time spatial alignment guide & distance badge overlays */}
      <FabricSmartGuidesOverlay
        zoom={zoom}
        activeGuides={activeGuides}
        activeDistanceBadges={activeDistanceBadges}
        activeDimensions={activeDimensions}
      />
    </div>
  );
};

export default FabricStage;
