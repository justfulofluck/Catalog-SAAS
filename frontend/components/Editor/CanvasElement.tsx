import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Text, Image, Rect, Circle, RegularPolygon, Star, Line, Arrow, Group, Transformer } from 'react-konva';
import useImage from 'use-image';
import Konva from 'konva';
import { CanvasElement as ICanvasElement, Product } from '../../types';
import { useStore } from '../../store/useStore';
import { PAGE_WIDTH, PAGE_HEIGHT } from '../../constants';

interface Props {
  element: ICanvasElement;
  isSelected: boolean;
  onSelect: (multi: boolean) => void;
  onChange: (updates: Partial<ICanvasElement>) => void;
  isEditing?: boolean;
  isReadOnly?: boolean;
}

const CanvasElement: React.FC<Props> = ({ element, isSelected, onSelect, onChange, isEditing = false, isReadOnly = false }) => {
  const shapeRef = useRef<any>(null);
  const trRef = useRef<any>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [richTextImage, setRichTextImage] = useState<HTMLImageElement | null>(null);

  const peerNodes = useRef<any[]>([]);

  const {
    selectedElementIds,
    hoveredElementId,
    moveElements,
    currentPageIndex,
    draggingItem,
    catalog,
    products,
    pushHistory,
    activeTool,
    setGuides,
    setDragPosition: setActiveDragPosition,
    user,
    businessTemplates
  } = useStore();

  const currentPage = catalog.pages[currentPageIndex];
  const isLandscape = currentPage?.orientation === 'landscape';
  const curW = isLandscape ? PAGE_HEIGHT : PAGE_WIDTH;
  const curH = isLandscape ? PAGE_WIDTH : PAGE_HEIGHT;

  const linkedProduct = useMemo(() => {
    if (element.productId) {
      return products.find(p => p.id === element.productId);
    }
    return null;
  }, [element.productId, products]);

  const imgSrc = useMemo(() => {
    if (element.type === 'product-block' && linkedProduct) {
      if (linkedProduct.image) return linkedProduct.image;
      if (linkedProduct.customFields) {
        const firstImg = Object.values(linkedProduct.customFields).find(
          val => typeof val === 'string' && (val.startsWith('/media') || val.startsWith('http'))
        );
        if (firstImg) return firstImg as string;
      }
      return '';
    }
    return element.src;
  }, [element.type, element.src, linkedProduct]);
  const [image] = useImage(imgSrc || '', 'anonymous');

  // Check if text contains HTML tags that Konva can't handle natively
  // We allow simple non-styled tags to be handled natively (stripped)
  const hasMixedStyles = element.type === 'text' && element.text && (
    /<span\s+style=|<b\s+style=|<i\s+style=|<u\s+style=|style="/.test(element.text) ||
    /color:|font-size:|font-family:/.test(element.text)
  );
  const hasEffects = element.type === 'text' && element.effectStyle && element.effectStyle !== 'none';

  // Gradients on text are handled natively by Konva now
  // Global effects should NOT trigger SVG fallback to preserve custom fonts.
  // SVG fallback is now ONLY for mixed HTML styles (Rich Text).
  const isRichText = hasMixedStyles || (element.type === 'shape' && element.fill?.includes('gradient'));
  const useSvgFallback = isRichText && element.type === 'text' && (!element.effectStyle || element.effectStyle === 'none');

  const getNativeEffectProps = () => {
    if (!hasEffects) {
      return {
        shadowEnabled: false,
        shadowBlur: 0,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        shadowOpacity: 0,
        strokeEnabled: false,
        strokeWidth: 0,
        fill: element.fill || '#000000'
      };
    }
    const color = element.effectColor || '#000000';
    const color2 = element.effectColor2 || '#00fff9';
    const opacity = (element.shadowOpacity !== undefined && element.shadowOpacity !== null) ? element.shadowOpacity : 0.5;
    const blur = element.shadowBlur || 0;
    const offX = element.shadowOffsetX || 0;
    const offY = element.shadowOffsetY || 0;
    const thickness = element.textStrokeWidth || 1;

    switch (element.effectStyle) {
      case 'shadow':
        return {
          shadowEnabled: true,
          shadowColor: color,
          shadowBlur: blur,
          shadowOffsetX: offX,
          shadowOffsetY: offY,
          shadowOpacity: opacity
        };
      case 'lift':
        return {
          shadowEnabled: true,
          shadowColor: 'rgba(0,0,0,0.5)',
          shadowBlur: blur,
          shadowOffsetX: 0,
          shadowOffsetY: 4,
          shadowOpacity: opacity
        };
      case 'hollow':
        return {
          strokeEnabled: true,
          stroke: color,
          strokeWidth: thickness,
          fill: 'transparent'
        };
      case 'outline':
        return {
          strokeEnabled: true,
          stroke: color,
          strokeWidth: thickness,
          fill: element.fill
        };
      default:
        return {};
    }
  };

  const nativeEffectProps = useMemo(getNativeEffectProps, [
    element.effectStyle, element.effectColor, element.shadowBlur,
    element.shadowOffsetX, element.shadowOffsetY, element.shadowOpacity,
    element.textStrokeWidth, element.fill
  ]);

  const parseGradientProps = (str: string, w: number, h: number, shapeType?: string) => {
    if (!str || !str.includes('linear-gradient')) return { fill: str };
    const match = str.match(/linear-gradient\s*\(\s*([^,]+)\s*,\s*(#[a-fA-F0-9]+)\s*,\s*(#[a-fA-F0-9]+)\s*\)/i);
    if (!match) return { fill: str };

    const dir = match[1].trim();
    const c1 = match[2].trim();
    const c2 = match[3].trim();

    // Centered shapes use center as 0,0
    const isCentered = ['circle', 'pentagon', 'hexagon', 'octagon', 'star'].includes(shapeType || '');

    let start = { x: 0, y: 0 };
    let end = { x: 0, y: 0 };

    if (dir === 'to right') {
      start = isCentered ? { x: -w / 2, y: 0 } : { x: 0, y: h / 2 };
      end = isCentered ? { x: w / 2, y: 0 } : { x: w, y: h / 2 };
    } else if (dir === 'to bottom') {
      start = isCentered ? { x: 0, y: -h / 2 } : { x: w / 2, y: 0 };
      end = isCentered ? { x: 0, y: h / 2 } : { x: w / 2, y: h };
    } else if (dir === 'to bottom right') {
      start = isCentered ? { x: -w / 2, y: -h / 2 } : { x: 0, y: 0 };
      end = isCentered ? { x: w / 2, y: h / 2 } : { x: w, y: h };
    } else if (dir === 'to top right') {
      start = isCentered ? { x: -w / 2, y: h / 2 } : { x: 0, y: h };
      end = isCentered ? { x: w / 2, y: -h / 2 } : { x: w, y: 0 };
    }

    return {
      fill: c1,
      fillEnabled: true,
      fillPriority: 'linear-gradient',
      fillLinearGradientStartPointX: start.x,
      fillLinearGradientStartPointY: start.y,
      fillLinearGradientEndPointX: end.x,
      fillLinearGradientEndPointY: end.y,
      fillLinearGradientStartPoint: start,
      fillLinearGradientEndPoint: end,
      fillLinearGradientColorStops: [0, c1, 1, c2],
      stroke: c1,
      strokeEnabled: true,
      strokePriority: 'linear-gradient',
      strokeLinearGradientStartPointX: start.x,
      strokeLinearGradientStartPointY: start.y,
      strokeLinearGradientEndPointX: end.x,
      strokeLinearGradientEndPointY: end.y,
      strokeLinearGradientStartPoint: start,
      strokeLinearGradientEndPoint: end,
      strokeLinearGradientColorStops: [0, c1, 1, c2]
    };
  };

  const gradientProps = useMemo(() =>
    (element.type === 'shape' || element.type === 'text') ? parseGradientProps(element.fill || '', element.width, element.height, element.type === 'shape' ? element.shapeType : undefined) : {}
    , [element.fill, element.width, element.height, element.type, element.shapeType]);

  // Render rich text/gradients as SVG for proper display on canvas
  useEffect(() => {
    if (useSvgFallback) {
      const isGradient = element.fill?.includes('gradient');
      // Escape common HTML entities that break XML/SVG
      const safeText = element.type === 'text' ? (element.text || '')
        .replace(/&nbsp;/g, '&#160;')
        .replace(/<br>/g, '<br/>')
        .replace(/&(?!(amp|lt|gt|quot|apos|#[0-9]+);)/g, '&amp;') : '';

      const fontName = (element.fontFamily || 'Inter').replace(/\s+/g, '+');
      const fontImport = `@import url('https://fonts.googleapis.com/css2?family=${fontName}&display=swap');`;

      const getEffectStyles = () => {
        if (!element.effectStyle || element.effectStyle === 'none') return '';
        const color = element.effectColor || '#000000';
        const color2 = element.effectColor2 || '#00fff9';
        const offX = element.shadowOffsetX || 0;
        const offY = element.shadowOffsetY || 0;
        const blur = element.shadowBlur || 0;
        const opacity = (element.shadowOpacity !== undefined && element.shadowOpacity !== null) ? element.shadowOpacity : 0.5;
        const thickness = element.textStrokeWidth || 1;
        const spread = (element.effectSpread !== undefined && element.effectSpread !== null) ? element.effectSpread : 0;
        const roundness = (element.effectRoundness !== undefined && element.effectRoundness !== null) ? element.effectRoundness : 4;

        switch (element.effectStyle) {
          case 'hollow':
            return `-webkit-text-stroke: ${thickness}px ${color}; color: transparent;`;
          case 'outline':
            return `-webkit-text-stroke: ${thickness}px ${color};`;
          case 'shadow':
            return `text-shadow: ${offX}px ${offY}px ${blur}px ${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')};`;
          case 'lift':
            return `text-shadow: 0px 4px ${blur}px rgba(0,0,0,${opacity});`;
          case 'neon':
            return `color: ${color}; text-shadow: ${opacity > 0 ? `0 0 ${5 * opacity}px ${color}, 0 0 ${10 * opacity}px ${color}, 0 0 ${20 * opacity}px ${color}` : 'none'};`;
          case 'glitch':
            return `text-shadow: ${offX}px ${offY}px 0 ${color}, ${-offX}px ${-offY}px 0 ${color2};`;
          case 'echo':
            return `text-shadow: ${offX}px ${offY}px 0px ${color}aa, ${offX * 2}px ${offY * 2}px 0px ${color}66, ${offX * 3}px ${offY * 3}px 0px ${color}33;`;
          case 'splice':
            return `-webkit-text-stroke: ${thickness}px ${color}; text-shadow: ${offX}px ${offY}px 0px ${color}88;`;
          case 'background':
            return `background: ${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}; padding: ${spread / 4}px ${spread / 2}px; border-radius: ${roundness}px; box-decoration-break: clone; -webkit-box-decoration-break: clone; display: inline-block;`;
          default:
            return '';
        }
      };

      const borderRadius = element.shapeType === 'circle' ? '50%' : '0';
      const getShapeClipPath = () => {
        if (element.type !== 'shape') return 'none';
        switch (element.shapeType) {
          case 'circle': return 'circle(50% at 50% 50%)';
          case 'triangle': return 'polygon(50% 0%, 100% 100%, 0% 100%)';
          case 'rightTriangle': return 'polygon(0% 100%, 0% 0%, 100% 100%)';
          case 'diamond': return 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';
          case 'pentagon': return 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)';
          case 'hexagon': return 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)';
          case 'octagon': return 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)';
          case 'star': return 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';
          case 'parallelogram': return 'polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)';
          case 'cross': return 'polygon(30% 0%, 70% 0%, 70% 30%, 100% 30%, 100% 70%, 70% 70%, 70% 100%, 30% 100%, 30% 70%, 0% 70%, 0% 30%, 30% 30%)';
          case 'pill': return 'inset(0% round 999px)';
          default: return 'none';
        }
      };

      const backgroundStyle = isGradient ? `background: ${element.fill};` : `background: ${element.fill || '#000000'};`;
      const clipPathStyle = element.type === 'shape' ? `clip-path: ${getShapeClipPath()}; -webkit-clip-path: ${getShapeClipPath()};` : '';

      const svgString = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${element.width}" height="${element.height}">
          <foreignObject width="100%" height="100%">
            <div xmlns="http://www.w3.org/1999/xhtml" style="
              width: 100%;
              height: 100%;
               display: flex;
               align-items: ${element.verticalAlign === 'middle' ? 'center' : (element.verticalAlign === 'bottom' ? 'flex-end' : 'flex-start')};
               justify-content: center;
               box-sizing: border-box;
               ${element.type === 'shape' ? `${backgroundStyle} ${clipPathStyle}` : ''}
            ">
              <style>${fontImport}</style>
              ${element.type === 'text' ? `
                <div style="
                  font-size: ${element.fontSize || 16}px;
                  font-family: ${element.fontFamily || 'Inter'};
                  font-weight: ${element.fontWeight || 'normal'};
                  font-style: ${element.fontStyle || 'normal'};
                  text-decoration: ${element.textDecoration || 'none'};
                  text-align: ${element.textAlign || 'left'};
                  line-height: ${element.lineHeight || 1.2};
                  letter-spacing: ${element.letterSpacing || 0}px;
                  perspective: 1000px;
                  ${isGradient ? `${backgroundStyle} -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent;` : `color: ${element.fill || '#000000'};`}
                  width: 100%;
                  padding: 5px;
                  box-sizing: border-box;
                  ${getEffectStyles()}
                ">
                  ${safeText}
                </div>
              ` : '&nbsp;'}
            </div>
          </foreignObject>
        </svg>
      `;

      try {
        const img = new window.Image();
        const encodedSvg = btoa(unescape(encodeURIComponent(svgString)));
        img.src = `data:image/svg+xml;base64,${encodedSvg}`;
        img.onload = () => setRichTextImage(img);
        img.onerror = () => {
          console.error('Failed to load rich text SVG image');
          setRichTextImage(null);
        };
      } catch (err) {
        console.error('Error generating SVG fallback:', err);
        setRichTextImage(null);
      }
    } else {
      setRichTextImage(null);
    }
  }, [
    element.text, element.width, element.height, element.fontSize, element.fontFamily,
    element.fontWeight, element.fontStyle, element.fill, element.textAlign, isRichText,
    element.effectStyle, element.effectColor, element.effectColor2, element.textStrokeWidth,
    element.shadowBlur, element.shadowOpacity, element.shadowOffsetX, element.shadowOffsetY,
    element.effectSpread, element.effectRoundness, element.type, element.shapeType,
    element.textDecoration, useSvgFallback,
    element.lineHeight, element.letterSpacing, element.opacity, element.verticalAlign
  ]);

  useEffect(() => {
    if (image && shapeRef.current && element.type === 'image' && element.filters) {
      const node = shapeRef.current;
      node.cache();
      node.filters([
        Konva.Filters.Brighten,
        Konva.Filters.Blur,
        Konva.Filters.Contrast,
      ]);
      node.brightness((element.filters.brightness || 0) / 100);
      node.blurRadius(element.filters.blur || 0);
      node.contrast(element.filters.contrast || 0);
      node.getLayer().batchDraw();
    }
  }, [image, element.filters]);

  const crop = useMemo(() => {
    if (!image || !element.width || !element.height || (element.type !== 'image' && element.type !== 'product-block')) return undefined;

    let targetWidth = element.width;
    let targetHeight = element.height;

    if (element.type === 'product-block') {
      const theme = element.cardTheme || 'classic-stack';
      // Adjust crop area based on theme layout
      if (theme === 'classic-stack') targetHeight = element.height * 0.6; // Image takes 60%
      else if (theme === 'split-row') targetWidth = element.width * 0.45;
      else if (theme === 'minimal-image') { targetWidth = element.width; targetHeight = element.height; }
    }

    const containerRatio = targetWidth / targetHeight;
    const imageRatio = image.width / image.height;

    let cropWidth = image.width;
    let cropHeight = image.height;
    let cropX = 0;
    let cropY = 0;

    if (containerRatio > imageRatio) {
      cropHeight = image.width / containerRatio;
      cropY = (image.height - cropHeight) / 2;
    } else {
      cropWidth = image.height * containerRatio;
      cropX = (image.width - cropWidth) / 2;
    }

    return { x: cropX, y: cropY, width: cropWidth, height: cropHeight };
  }, [image, element.width, element.height, element.type, element.cardTheme]);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current && !element.locked) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected, element.locked, element.fill]);

  // Auto-resize text box height based on actual rendered text content
  useEffect(() => {
    if (element.type === 'text' && shapeRef.current) {
      // Small timeout to allow Konva to render and calculate bounds
      const timer = setTimeout(() => {
        const node = shapeRef.current;
        if (node) {
          // getClientRect returns the accurate bounding box including all effects and actual text wrap
          const rect = node.getClientRect({ skipTransform: true });
          if (rect.height && Math.abs(rect.height - (element.height || 0)) > 2) {
            onChange({ height: rect.height });
          }
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [
    element.text, element.fontSize, element.fontFamily, element.fontWeight,
    element.fontStyle, element.lineHeight, element.letterSpacing,
    element.width, element.effectStyle
  ]);

  const handleTransform = (e: any) => {
    const node = shapeRef.current;
    if (!node) return;
    const transformer = trRef.current;
    if (!transformer) return;

    const anchor = transformer.getActiveAnchor();
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    if (element.type === 'text' && !useSvgFallback) {
      const isCorner = ['top-left', 'top-right', 'bottom-left', 'bottom-right'].includes(anchor);
      const isSide = ['middle-left', 'middle-right'].includes(anchor);
      const isVertical = ['top-center', 'bottom-center'].includes(anchor);

      if (isSide) {
        node.width(Math.max(20, node.width() * scaleX));
        node.scaleX(1);
      } else if (isVertical) {
        // Vertical scaling for text is disabled in enabledAnchors, but just in case:
        node.scaleY(1);
      } else if (isCorner) {
        // Visual text scaling while dragging corners
        const ratio = Math.max(Math.abs(scaleX), Math.abs(scaleY));
        const currentFontSize = node.fontSize ? node.fontSize() : element.fontSize || 16;
        const newFontSize = Math.max(1, currentFontSize * ratio);

        node.width(node.width() * scaleX);
        node.scaleX(1);
        node.scaleY(1);

        // Temporarily apply to node if it's a native Text node (not Group)
        if (typeof node.fontSize === 'function') {
          node.fontSize(newFontSize);
        }
      }
    }

    const layer = node.getLayer();
    if (layer) layer.batchDraw();
  };

  const handleTransformEnd = () => {
    if (element.locked) return;
    const node = shapeRef.current;
    if (!node) return;

    // Bake scales into width/height and reset to 1
    const finalWidth = node.width() * node.scaleX();
    const finalHeight = node.height() * node.scaleY();

    const updates: Partial<ICanvasElement> = {
      x: node.x(),
      y: node.y(),
      width: Math.max(1, finalWidth),
      rotation: node.rotation(),
    };

    node.width(finalWidth);

    if (element.type !== 'text') {
      updates.height = Math.max(1, finalHeight);
      node.height(finalHeight);
    }

    node.scaleX(1);
    node.scaleY(1);

    if (element.type === 'text') {
      const transformer = trRef.current;
      const anchor = transformer?.getActiveAnchor();
      const isCorner = ['top-left', 'top-right', 'bottom-left', 'bottom-right'].includes(anchor || '');

      if (isCorner) {
        // Only update font size if a corner was actually dragged
        const ratio = Math.max(
          Math.abs(node.scaleX() === 1 && anchor ? (finalWidth / element.width) : node.scaleX()),
          Math.abs(node.scaleY() === 1 && anchor ? (finalHeight / (element.height || 10)) : node.scaleY())
        );
        const currentFontSize = element.fontSize || 16;
        updates.fontSize = Math.max(1, currentFontSize * ratio);
      }
    }

    onChange(updates);
  };

  const handleSelect = (e: any) => {
    e.cancelBubble = true;
    const isMulti = e.evt.shiftKey;
    onSelect(isMulti);
  };

  const handleDragStart = (e: any) => {
    if (element.locked || isReadOnly) return;
    pushHistory();
    dragStartPos.current = { x: e.target.x(), y: e.target.y() };
    const stage = e.target.getStage();
    peerNodes.current = [];

    if (isSelected && selectedElementIds.length > 1) {
      selectedElementIds.forEach(id => {
        if (id !== element.id) {
          const peerNode = stage.findOne(`#${id} `);
          if (peerNode) {
            peerNode.setAttr('initialDragPos', { x: peerNode.x(), y: peerNode.y() });
            peerNodes.current.push(peerNode);
          }
        }
      });
    } else if (element.groupId) {
      const groupNodes = stage.find(`.${element.groupId} `);
      groupNodes.forEach((node: any) => {
        if (node !== e.target) {
          node.setAttr('initialDragPos', { x: node.x(), y: node.y() });
          peerNodes.current.push(node);
        }
      });
    }
  };

  const handleDragMove = (e: any) => {
    if (element.locked) return;
    const dx = e.target.x() - dragStartPos.current.x;
    const dy = e.target.y() - dragStartPos.current.y;

    peerNodes.current.forEach(node => {
      const initial = node.getAttr('initialDragPos');
      if (initial) {
        node.position({
          x: initial.x + dx,
          y: initial.y + dy
        });
      }
    });

    const layer = e.target.getLayer();
    if (layer) layer.batchDraw();

    // Snapping Logic
    const SNAP_THRESHOLD = 5;
    const guides: { orientation: 'H' | 'V'; position: number }[] = [];
    const absPos = e.target.getAbsolutePosition();
    const stage = e.target.getStage();
    if (!stage) return;

    const box = e.target.getClientRect();
    const centerX = e.target.x() + e.target.width() / 2;
    const centerY = e.target.y() + e.target.height() / 2;

    // Vertical guides (Left, CenterX, Right)
    const vSnaps = [0, curW / 2, curW];
    currentPage.elements.forEach(el => {
      if (el.id === element.id || selectedElementIds.includes(el.id)) return;
      vSnaps.push(el.x, el.x + el.width / 2, el.x + el.width);
    });

    let snappedX = e.target.x();
    let snappedH = false;
    for (const snapX of vSnaps) {
      if (Math.abs(e.target.x() - snapX) < SNAP_THRESHOLD) { snappedX = snapX; snappedH = true; guides.push({ orientation: 'V', position: snapX }); }
      else if (Math.abs(centerX - snapX) < SNAP_THRESHOLD) { snappedX = snapX - e.target.width() / 2; snappedH = true; guides.push({ orientation: 'V', position: snapX }); }
      else if (Math.abs((e.target.x() + e.target.width()) - snapX) < SNAP_THRESHOLD) { snappedX = snapX - e.target.width(); snappedH = true; guides.push({ orientation: 'V', position: snapX }); }
    }
    if (snappedH) e.target.x(snappedX);

    // Horizontal guides (Top, CenterY, Bottom)
    const hSnaps = [0, curH / 2, curH];
    currentPage.elements.forEach(el => {
      if (el.id === element.id || selectedElementIds.includes(el.id)) return;
      hSnaps.push(el.y, el.y + el.height / 2, el.y + el.height);
    });

    let snappedY = e.target.y();
    let snappedV = false;
    for (const snapY of hSnaps) {
      if (Math.abs(e.target.y() - snapY) < SNAP_THRESHOLD) { snappedY = snapY; snappedV = true; guides.push({ orientation: 'H', position: snapY }); }
      else if (Math.abs(centerY - snapY) < SNAP_THRESHOLD) { snappedY = snapY - e.target.height() / 2; snappedV = true; guides.push({ orientation: 'H', position: snapY }); }
      else if (Math.abs((e.target.y() + e.target.height()) - snapY) < SNAP_THRESHOLD) { snappedY = snapY - e.target.height(); snappedV = true; guides.push({ orientation: 'H', position: snapY }); }
    }
    if (snappedV) e.target.y(snappedY);

    setGuides(guides);
    setActiveDragPosition({ x: Math.round(e.target.x()), y: Math.round(e.target.y()) });
  };

  const handleDragEnd = (e: any) => {
    if (element.locked) return;
    const dx = e.target.x() - dragStartPos.current.x;
    const dy = e.target.y() - dragStartPos.current.y;

    if (isSelected && selectedElementIds.length > 1) {
      peerNodes.current.forEach(node => node.setAttr('initialDragPos', null));
      moveElements(currentPageIndex, selectedElementIds, dx, dy);
    } else if (element.groupId) {
      const groupIds = peerNodes.current.map(n => n.id());
      groupIds.push(element.id);
      peerNodes.current.forEach(node => node.setAttr('initialDragPos', null));
      moveElements(currentPageIndex, groupIds, dx, dy);
    } else {
      onChange({
        x: e.target.x(),
        y: e.target.y(),
      });
    }
    peerNodes.current = [];
    setGuides([]);
    setActiveDragPosition(null);
  };

  const handleMouseEnter = () => {
    if (isReadOnly) return;
    setIsHovered(true);
    if (!element.locked) {
      document.body.style.cursor = 'pointer';
    }
  };

  const handleMouseLeave = () => {
    if (isReadOnly) return;
    setIsHovered(false);
    document.body.style.cursor = 'default';
  };

  const isCurrentlyHovered = isHovered || hoveredElementId === element.id;
  const isDroppableTarget = draggingItem && currentPage?.type === 'interior' && (element.type === 'shape' || element.type === 'image' || element.type === 'product-block');

  const commonProps = {
    ref: shapeRef,
    id: element.id,
    name: `${element.id} ${element.groupId || ''}`.trim(),
    x: element.x,
    y: element.y,
    width: element.width,
    height: element.type === 'text' ? undefined : element.height,
    rotation: element.rotation,
    opacity: element.opacity,
    draggable: !element.locked && activeTool !== 'hand' && !isReadOnly,
    listening: activeTool !== 'hand' && !isReadOnly, // Pass events through to stage when panning or readOnly
    onClick: isReadOnly ? undefined : handleSelect,
    onTap: isReadOnly ? undefined : handleSelect,
    perfectDrawEnabled: false,
    shadowForStrokeEnabled: true,
    hitStrokeWidth: 5,
    onDragStart: handleDragStart,
    onDragMove: handleDragMove,
    onDragEnd: handleDragEnd,
    onTransformEnd: handleTransformEnd,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    scaleX: 1,
    scaleY: 1,
    shadowColor: 'black',
    shadowBlur: element.shadowBlur || 0,
    shadowOpacity: element.shadowOpacity ?? 0,
    shadowOffset: { x: element.shadowOffsetX || 0, y: element.shadowOffsetY || 0 },
    visible: element.visible !== false,
  };

  const renderProductBlock = () => {
    if (!linkedProduct) {
      return (
        <Group {...commonProps}>
          <Rect
            width={element.width}
            height={element.height}
            fill="#f1f5f9"
            cornerRadius={10}
            stroke="#cbd5e1"
            strokeWidth={1}
            dash={[5, 5]}
          />
          <Text
            text="EMPTY PRODUCT SLOT"
            width={element.width}
            height={element.height}
            fontSize={10}
            fontFamily="Inter"
            fontWeight="bold"
            fill="#94a3b8"
            align="center"
            verticalAlign="middle"
          />
        </Group>
      );
    }

    const theme = element.cardTheme || 'classic-stack';
    const showName = element.showName !== false;
    const showPrice = element.showPrice !== false;
    const showSku = element.showSku !== false;

    let imgRect = { x: 0, y: 0, width: 0, height: 0 };
    let textContainer = { x: 0, y: 0, width: 0, height: 0 };
    let textPadding = element.width * 0.08;
    let titleFontSize = Math.max(10, element.width * 0.045);
    let metaFontSize = Math.max(8, element.width * 0.035);
    let cardFill = "white";
    let textColor = "#0f172a";
    let accentColor = "#4f46e5";
    let showGradient = false;

    if (theme === 'classic-stack') {
      imgRect = { x: 0, y: 0, width: element.width, height: element.height * 0.6 };
      textContainer = { x: 0, y: imgRect.height, width: element.width, height: element.height * 0.4 };
    } else if (theme === 'split-row') {
      imgRect = { x: 0, y: 0, width: element.width * 0.45, height: element.height };
      textContainer = { x: imgRect.width, y: 0, width: element.width * 0.55, height: element.height };
      textPadding = textContainer.width * 0.12;
      titleFontSize = Math.max(9, textContainer.width * 0.08);
      metaFontSize = Math.max(8, textContainer.width * 0.06);
    } else if (theme === 'editorial-overlay') {
      imgRect = { x: 0, y: 0, width: element.width, height: element.height };
      textContainer = { x: 0, y: element.height * 0.6, width: element.width, height: element.height * 0.4 };
      cardFill = "transparent";
      textColor = "white";
      accentColor = "white";
      showGradient = true;
      textPadding = element.width * 0.1;
    } else if (theme === 'minimal-image') {
      imgRect = { x: 0, y: 0, width: element.width, height: element.height };
      textContainer = { x: 0, y: 0, width: 0, height: 0 };
    }

    const activeTemplate = user?.businessId
      ? businessTemplates.find(t => t.id === user.businessId)
      : null;

    // 1. Identify Dynamic Fields to Show
    const dynamicFields = (activeTemplate && linkedProduct.customFields)
      ? activeTemplate.schema.filter(field => {
        const value = linkedProduct.customFields?.[field.id];
        if (value === undefined || value === null || value === '' || field.type === 'image') return false;
        const lowerLabel = field.label.toLowerCase();
        return !(lowerLabel.includes('product name') || lowerLabel.includes('price') || lowerLabel.includes('sku'));
      })
      : [];

    // 2. Calculate Content Height for Dynamic Resizing
    let calcY = textPadding;
    const lineSpacing = 4;
    if (showName) calcY += titleFontSize + lineSpacing;
    if (showSku) calcY += (metaFontSize * 0.8) + lineSpacing;
    if (showPrice) calcY += metaFontSize + lineSpacing + 4;

    dynamicFields.forEach(() => {
      calcY += (metaFontSize * 0.75) + 4;
    });

    // Determine if we need to expand the block's visual height
    const requiredTextHeight = calcY + textPadding;
    const visualHeight = Math.max(element.height, (theme === 'classic-stack' ? imgRect.height : 0) + requiredTextHeight);

    // Dynamic Vertical Flow Positioning
    let currentY = textPadding;

    return (
      <Group {...commonProps}>
        {/* Card Background (Non-overlay only) */}
        {theme !== 'editorial-overlay' && (
          <Rect
            width={element.width}
            height={visualHeight}
            fill={cardFill}
            cornerRadius={10}
            shadowBlur={isSelected ? 15 : 5}
            shadowOpacity={0.1}
            shadowOffset={{ x: 0, y: 4 }}
          />
        )}

        {/* Image Component */}
        <Group clipFunc={(ctx) => {
          ctx.beginPath();
          ctx.moveTo(10, 0);
          ctx.lineTo(element.width - 10, 0);
          ctx.quadraticCurveTo(element.width, 0, element.width, 10);
          ctx.lineTo(element.width, visualHeight - 10);
          ctx.quadraticCurveTo(element.width, visualHeight, element.width - 10, visualHeight);
          ctx.lineTo(10, visualHeight);
          ctx.quadraticCurveTo(0, visualHeight, 0, visualHeight - 10);
          ctx.lineTo(0, 10);
          ctx.quadraticCurveTo(0, 0, 10, 0);
          ctx.closePath();
        }}>
          <Image
            image={image}
            x={imgRect.x}
            y={imgRect.y}
            width={imgRect.width}
            height={imgRect.height}
            crop={crop}
          />
          {showGradient && (
            <Rect
              x={textContainer.x}
              y={textContainer.y}
              width={textContainer.width}
              height={visualHeight - textContainer.y}
              fillLinearGradientStartPoint={{ x: 0, y: 0 }}
              fillLinearGradientEndPoint={{ x: 0, y: visualHeight - textContainer.y }}
              fillLinearGradientColorStops={[0, 'transparent', 1, 'rgba(0,0,0,0.85)']}
            />
          )}
        </Group>

        {/* Content Region with Sequential Flow */}
        {theme !== 'minimal-image' && (
          <Group x={textContainer.x} y={textContainer.y}>
            {showName && (
              <React.Fragment>
                <Text
                  text={linkedProduct.name}
                  x={textPadding}
                  y={currentY}
                  width={textContainer.width - (textPadding * 2)}
                  fontSize={titleFontSize}
                  fontFamily="Inter"
                  fontWeight="bold"
                  fill={textColor}
                  ellipsis={true}
                  wrap="none"
                />
                {(() => { currentY += titleFontSize + lineSpacing; return null; })()}
              </React.Fragment>
            )}
            {showSku && (
              <React.Fragment>
                <Text
                  text={linkedProduct.sku}
                  x={textPadding}
                  y={currentY}
                  fontSize={metaFontSize * 0.8}
                  fontFamily="Inter"
                  fontWeight="500"
                  fill={theme === 'editorial-overlay' ? 'rgba(255,255,255,0.6)' : '#94a3b8'}
                />
                {(() => { currentY += (metaFontSize * 0.8) + lineSpacing; return null; })()}
              </React.Fragment>
            )}
            {showPrice && (
              <React.Fragment>
                <Text
                  text={`${linkedProduct.currency || 'USD'}${(typeof linkedProduct.price === 'number' ? linkedProduct.price : (Number(linkedProduct.price) || 0)).toFixed(2)}`}
                  x={textPadding}
                  y={currentY + 2}
                  fontSize={metaFontSize}
                  fontFamily="Inter"
                  fontWeight="900"
                  fill={accentColor}
                />
                {(() => { currentY += metaFontSize + lineSpacing + 4; return null; })()}
              </React.Fragment>
            )}

            {/* Business Template Dynamic Fields */}
            {dynamicFields.map(field => {
              const value = linkedProduct.customFields?.[field.id];
              const displayValue = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value);
              const displayText = `${field.label}: ${displayValue}`;
              const fieldFontSize = metaFontSize * 0.75;

              const node = (
                <Text
                  key={field.id}
                  text={displayText}
                  x={textPadding}
                  y={currentY}
                  width={textContainer.width - (textPadding * 2)}
                  fontSize={fieldFontSize}
                  fontFamily="Inter"
                  fontWeight="500"
                  fill={theme === 'editorial-overlay' ? 'rgba(255,255,255,0.8)' : '#64748b'}
                  wrap="word"
                />
              );

              currentY += fieldFontSize + 4;
              return node;
            })}
          </Group>
        )}
      </Group>
    );
  };

  const renderTextContent = () => {
    const baseTextProps = {
      text: (element.text || '').replace(/<[^>]*>/g, ''),
      fontSize: element.fontSize,
      fontFamily: element.fontFamily || 'Inter',
      fontStyle: `${element.fontWeight || 'normal'} ${element.fontStyle || ''}`.trim(),
      textDecoration: element.textDecoration || 'none',
      align: element.textAlign || 'left',
      verticalAlign: element.verticalAlign || 'top',
      lineHeight: element.lineHeight !== undefined ? element.lineHeight : 1.2,
      letterSpacing: element.letterSpacing || 0,
      padding: 5,
      width: element.width,
      height: undefined as unknown as number,
      wrap: "word" as const,
      opacity: isEditing ? 0 : (element.opacity ?? 1),
    };

    const offX = element.shadowOffsetX || 2;
    const offY = element.shadowOffsetY || 2;
    const effectColor = element.effectColor || '#000000';
    const effectColor2 = element.effectColor2 || '#00fff9';
    const effectOpacity = (element.shadowOpacity !== undefined && element.shadowOpacity !== null) ? element.shadowOpacity : 0.5;
    const blur = element.shadowBlur || 0;
    const thickness = element.textStrokeWidth || 1;

    const stylisticKey = `${element.id}-${element.fontFamily}-${element.fontSize}-${element.fontWeight}-${element.fontStyle}`;

    if (element.effectStyle === 'neon') {
      return (
        <Group {...commonProps} key={`neon-${stylisticKey}`}>
          <Text {...baseTextProps} fill={effectColor} shadowColor={effectColor} shadowBlur={blur * 3} shadowOpacity={effectOpacity} listening={false} shadowEnabled={true} />
          <Text {...baseTextProps} fill={effectColor} shadowColor={effectColor} shadowBlur={blur * 1.5} shadowOpacity={effectOpacity} listening={false} shadowEnabled={true} />
          <Text {...baseTextProps} fill={effectColor} shadowColor={effectColor} shadowBlur={blur * 0.5} shadowOpacity={effectOpacity} shadowEnabled={true} />
        </Group>
      );
    }

    if (element.effectStyle === 'glitch') {
      return (
        <Group {...commonProps} key={`glitch-${stylisticKey}`}>
          <Text {...baseTextProps} x={-offX} fill={effectColor} listening={false} shadowEnabled={false} strokeEnabled={false} />
          <Text {...baseTextProps} x={offX} fill={effectColor2} listening={false} shadowEnabled={false} strokeEnabled={false} />
          <Text {...baseTextProps} x={0} fill={element.fill} strokeEnabled={false} shadowEnabled={false} />
        </Group>
      );
    }

    if (element.effectStyle === 'echo') {
      return (
        <Group {...commonProps} key={`echo-${stylisticKey}`}>
          <Text {...baseTextProps} x={offX * 3} y={offY * 3} fill={effectColor} opacity={0.2} listening={false} shadowEnabled={false} strokeEnabled={false} />
          <Text {...baseTextProps} x={offX * 2} y={offY * 2} fill={effectColor} opacity={0.4} listening={false} shadowEnabled={false} strokeEnabled={false} />
          <Text {...baseTextProps} x={offX} y={offY} fill={effectColor} opacity={0.6} listening={false} shadowEnabled={false} strokeEnabled={false} />
          <Text {...baseTextProps} x={0} fill={element.fill} strokeEnabled={false} shadowEnabled={false} />
        </Group>
      );
    }

    if (element.effectStyle === 'splice') {
      return (
        <Group {...commonProps} key={`splice-${stylisticKey}`}>
          <Text {...baseTextProps} x={offX} y={offY} fill={effectColor} opacity={0.8} listening={false} shadowEnabled={false} strokeEnabled={false} />
          <Text {...baseTextProps} stroke={effectColor} strokeWidth={thickness} fill={element.fill} strokeEnabled={true} shadowEnabled={false} />
        </Group>
      );
    }

    if (element.effectStyle === 'background') {
      const spread = element.effectSpread || 0;
      const roundness = element.effectRoundness || 4;
      return (
        <Group {...commonProps} key={`bg-${stylisticKey}`}>
          <Rect
            x={0}
            y={0}
            width={element.width}
            height={element.height}
            fill={`${effectColor}${Math.round(effectOpacity * 255).toString(16).padStart(2, '0')}`}
            cornerRadius={roundness}
          />
          <Text {...baseTextProps} fill={element.fill} shadowEnabled={false} strokeEnabled={false} />
        </Group>
      );
    }

    return (
      <Text
        key={`text - ${element.id} - ${element.fontFamily} - ${element.fontSize} - ${element.effectStyle || 'none'} `}
        {...commonProps}
        {...baseTextProps}
        {...nativeEffectProps}
        {...(element.fill?.includes('linear-gradient') ? gradientProps : { fill: element.fill })}
      />
    );
  };

  return (
    <React.Fragment>
      {isDroppableTarget && (
        <Rect
          x={element.x}
          y={element.y}
          width={element.width}
          height={element.height}
          rotation={element.rotation}
          stroke="#4f46e5"
          strokeWidth={2}
          dash={[5, 5]}
          listening={false}
          opacity={0.6}
        />
      )}

      {isCurrentlyHovered && !isSelected && !draggingItem && (
        <Rect
          x={element.x}
          y={element.y}
          width={element.width}
          height={element.height}
          rotation={element.rotation}
          stroke="#4f46e5"
          strokeWidth={1}
          listening={false}
          opacity={0.8}
        />
      )}

      {element.type === 'text' && (
        isRichText && richTextImage ? (
          <Image
            {...commonProps}
            image={richTextImage}
            visible={true}
            opacity={isEditing ? 0 : (element.opacity ?? 1)}
          />
        ) : renderTextContent()
      )}
      {element.type === 'image' && (
        <Image
          {...commonProps}
          image={image}
          crop={crop}
        />
      )}
      {element.type === 'shape' && (() => {
        const w = element.width;
        const h = element.height;
        const cx = w / 2;
        const cy = h / 2;
        const fill = element.fill || '#cbd5e1';
        const stroke = element.stroke || undefined;
        const isGradient = fill.includes('linear-gradient');
        const fillProp = isGradient ? undefined : fill;
        const strokeProp = isGradient ? undefined : stroke;
        const fillProps = isGradient ? gradientProps : { fill: fillProp };
        const strokeWidth = element.strokeWidth || 0;

        // Helper to build a shape rendered as a closed Line (polygon)
        const poly = (points: number[], props: any = commonProps) => (
          <Line
            {...props}
            points={points}
            closed
            {...fillProps}
            stroke={strokeProp}
            strokeWidth={strokeWidth}
          />
        );

        const renderShape = (visualProps: any) => {
          // These shapes draw relative to (0,0) of the parent Group
          switch (element.shapeType) {
            case 'line':
              return <Line key={`line`} {...visualProps} points={[0, h / 2, w, h / 2]} />;
            case 'rect':
              return <Rect key={`rect`} {...visualProps} x={0} y={0} width={w} height={h} />;
            case 'roundedRect':
              return <Rect key={`roundedRect`} {...visualProps} x={0} y={0} width={w} height={h} cornerRadius={Math.min(w, h) * 0.15} />;
            case 'circle':
              return <Circle key={`circle`} {...visualProps} x={cx} y={cy} radius={Math.min(w, h) / 2} />;
            case 'triangle':
              return <RegularPolygon key={`triangle`} {...visualProps} x={cx} y={cy} sides={3} radius={Math.min(w, h) / 2} />;
            case 'rightTriangle':
              return <Line key={`rightTriangle`} {...visualProps} points={[0, h, 0, 0, w, h]} x={0} y={0} closed />;
            case 'diamond':
              return <RegularPolygon key={`diamond`} {...visualProps} x={cx} y={cy} sides={4} radius={Math.min(w, h) / 2} rotation={(visualProps.rotation || 0) + 45} />;
            case 'pentagon':
              return <RegularPolygon key={`pentagon`} {...visualProps} x={cx} y={cy} sides={5} radius={Math.min(w, h) / 2} />;
            case 'hexagon':
              return <RegularPolygon key={`hexagon`} {...visualProps} x={cx} y={cy} sides={6} radius={Math.min(w, h) / 2} />;
            case 'octagon':
              return <RegularPolygon key={`octagon`} {...visualProps} x={cx} y={cy} sides={8} radius={Math.min(w, h) / 2} />;
            case 'star':
              return <Star key={`star`} {...visualProps} x={cx} y={cy} numPoints={5} innerRadius={Math.min(w, h) * 0.2} outerRadius={Math.min(w, h) * 0.5} />;
            case 'arrow':
              return <Arrow key={`arrow`} {...visualProps} points={[0, h / 2, w, h / 2]} strokeWidth={visualProps.strokeWidth || 4} pointerLength={10} pointerWidth={10} />;
            case 'arrow4': {
              const a4Stroke = Math.max(visualProps.strokeWidth || 3, 3);
              return <Arrow key={`arrow4`} {...visualProps} points={[0, h / 2, w, h / 2]} strokeWidth={a4Stroke} pointerLength={a4Stroke * 4} pointerWidth={a4Stroke * 4} pointerAtBeginning={true} lineCap="round" lineJoin="round" />;
            }
            case 'parallelogram': {
              const skew = w * 0.2;
              return <Line key={`parallelogram`} {...visualProps} points={[skew, 0, w, 0, w - skew, h, 0, h]} x={0} y={0} closed />;
            }
            case 'cross': {
              const t = Math.min(w, h) * 0.3;
              return <Line key={`cross`} {...visualProps} points={[cx - t, 0, cx + t, 0, cx + t, cy - t, w, cy - t, w, cy + t, cx + t, cy + t, cx + t, h, cx - t, h, cx - t, cy + t, 0, cy + t, 0, cy - t, cx - t, cy - t]} x={0} y={0} closed />;
            }
            case 'cloud':
              return (
                <Rect
                  key={`cloud`}
                  {...visualProps}
                  fill="transparent"
                  sceneFunc={(ctx, shape) => {
                    ctx.beginPath();
                    ctx.moveTo(w * 0.2, h * 0.75);
                    ctx.bezierCurveTo(w * -0.05, h * 0.75, w * -0.05, h * 0.35, w * 0.2, h * 0.35);
                    ctx.bezierCurveTo(w * 0.15, h * 0.05, w * 0.45, h * 0.0, w * 0.5, h * 0.2);
                    ctx.bezierCurveTo(w * 0.55, h * 0.0, w * 0.85, h * 0.05, w * 0.8, h * 0.35);
                    ctx.bezierCurveTo(w * 1.05, h * 0.35, w * 1.05, h * 0.75, w * 0.8, h * 0.75);
                    ctx.closePath();
                    ctx.fillStyle = isGradient ? ctx.createLinearGradient(
                      (gradientProps as any).fillLinearGradientStartPoint?.x || 0,
                      (gradientProps as any).fillLinearGradientStartPoint?.y || 0,
                      (gradientProps as any).fillLinearGradientEndPoint?.x || 0,
                      (gradientProps as any).fillLinearGradientEndPoint?.y || 0
                    ) : fill;

                    if (isGradient && (gradientProps as any).fillLinearGradientColorStops) {
                      const stops = (gradientProps as any).fillLinearGradientColorStops;
                      (ctx.fillStyle as CanvasGradient).addColorStop(stops[0], stops[1]);
                      (ctx.fillStyle as CanvasGradient).addColorStop(stops[2], stops[3]);
                    }

                    ctx.fill();
                    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = strokeWidth; ctx.stroke(); }
                    ctx.fillStrokeShape(shape);
                  }}
                />
              );
            case 'wave':
              return (
                <Rect
                  key={`wave - ${element.fill} `}
                  {...visualProps}
                  fill="transparent"
                  sceneFunc={(ctx, shape) => {
                    ctx.beginPath();
                    ctx.moveTo(0, h * 0.2);
                    ctx.bezierCurveTo(w * 0.25, 0, w * 0.75, h * 0.4, w, h * 0.2);
                    ctx.lineTo(w, h * 0.8);
                    ctx.bezierCurveTo(w * 0.75, h, w * 0.25, h * 0.6, 0, h * 0.8);
                    ctx.closePath();
                    ctx.fillStyle = isGradient ? ctx.createLinearGradient(
                      (gradientProps as any).fillLinearGradientStartPoint?.x || 0,
                      (gradientProps as any).fillLinearGradientStartPoint?.y || 0,
                      (gradientProps as any).fillLinearGradientEndPoint?.x || 0,
                      (gradientProps as any).fillLinearGradientEndPoint?.y || 0
                    ) : fill;

                    if (isGradient && (gradientProps as any).fillLinearGradientColorStops) {
                      const stops = (gradientProps as any).fillLinearGradientColorStops;
                      (ctx.fillStyle as CanvasGradient).addColorStop(stops[0], stops[1]);
                      (ctx.fillStyle as CanvasGradient).addColorStop(stops[2], stops[3]);
                    }

                    ctx.fill();
                    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = strokeWidth; ctx.stroke(); }
                    ctx.fillStrokeShape(shape);
                  }}
                />
              );
            case 'pill':
              return <Rect key={`pill`} {...visualProps} x={0} y={0} width={w} height={h} cornerRadius={Math.min(w, h) / 2} />;
            default:
              return <Rect key={`default `} {...visualProps} x={0} y={0} width={w} height={h} />;
          }
        };

        const visualProps = {
          ...fillProps,
          stroke: strokeProp,
          strokeWidth: strokeWidth,
          fillEnabled: true,
          strokeEnabled: true,
          width: w,
          height: h
        };

        if (element.iconConfig) {
          const ic = element.iconConfig;
          const { fontWeight = '900', fontFamily = 'Font Awesome 6 Free' } = ic as any;
          const iconSize = ic.size || (Math.min(w, h) * 0.5);

          return (
            <Group {...commonProps} key={`shape - ${element.id} `}>
              {renderShape({ ...visualProps, x: 0, y: 0, width: w, height: h, opacity: 1, listening: true })}
              <Text
                text={ic.iconName}
                x={0}
                y={0}
                width={w}
                height={h}
                fontSize={iconSize}
                fontFamily={fontFamily}
                fill={ic.color || '#ffffff'}
                align="center"
                verticalAlign="middle"
                fontStyle={fontWeight} // Konva uses fontStyle for weight if numeric string
                listening={false}
                // Force a redraw when color or font changes
                key={`${ic.iconName} -${ic.color} -${fontFamily} -${fontWeight} `}
              />
            </Group>
          );
        }

        if (useSvgFallback && richTextImage) {
          return (
            <Group {...commonProps} key={`shape - ${element.id} `}>
              <Image
                image={richTextImage}
                x={0}
                y={0}
                width={w}
                height={h}
              />
            </Group>
          );
        }

        return (
          <Group {...commonProps} key={`shape - ${element.id} `}>
            {renderShape(visualProps)}
          </Group>
        );
      })()}
      {element.type === 'product-block' && renderProductBlock()}

      {isSelected && !element.locked && (
        <Transformer
          ref={trRef}
          rotateEnabled={true}
          anchorSize={9}
          anchorCornerRadius={10}
          anchorStroke="#8b3dff"
          anchorFill="#ffffff"
          anchorStrokeWidth={1.5}
          borderStroke="#8b3dff"
          borderStrokeWidth={1.5}
          padding={0}
          enabledAnchors={
            element.type === 'text'
              ? ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'middle-left', 'middle-right']
              : ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'middle-left', 'middle-right', 'top-center', 'bottom-center']
          }
          rotateAnchorOffset={30}
          anchorDrawFunc={(context, shape) => {
            const name = shape.name();
            const isSide = name.includes('middle-left') || name.includes('middle-right');
            const isVertical = name.includes('top-center') || name.includes('bottom-center');
            const isRotate = name.includes('rotater');

            context.beginPath();
            if (isRotate) {
              // Rotation handle: circle with rotate icon style? 
              // For now, a clean circle centered 30px below/above
              context.arc(0, 0, 10, 0, Math.PI * 2);
              context.fillStyle = '#ffffff';
              context.fill();
              context.strokeStyle = '#8b3dff';
              context.strokeWidth = 1.5;
              context.stroke();

              // Draw small rotate arrows inside
              context.beginPath();
              context.strokeStyle = '#8b3dff';
              context.arc(0, 0, 5, 0, Math.PI * 1.5);
              context.stroke();
              return;
            }

            if (isSide || isVertical) {
              // Pill shape for side/vertical anchors
              const w = isSide ? 4 : 16;
              const h = isSide ? 16 : 4;
              const r = 2;
              context.roundRect(-w / 2, -h / 2, w, h, r);
            } else {
              // Perfect circle for corner anchors
              context.arc(0, 0, 5, 0, Math.PI * 2);
            }
            context.fillStrokeShape(shape);
          }}
          // Move rotation anchor to bottom
          boundBoxFunc={(oldBox, newBox) => {
            // Ensure minimum size
            if (newBox.width < 5 || newBox.height < 5) return oldBox;
            return newBox;
          }}
          onTransform={handleTransform}
          onTransformStart={() => pushHistory()}
          onTransformEnd={handleTransformEnd}
        />
      )}

      {/* Hover Highlight (Canva style) */}
      {!isSelected && hoveredElementId === element.id && !element.locked && (
        <Rect
          x={element.x}
          y={element.y}
          width={element.width}
          height={element.type === 'text' && shapeRef.current ? shapeRef.current.getClientRect({ skipTransform: true }).height : element.height}
          rotation={element.rotation}
          stroke="#8b3dff"
          strokeWidth={1}
          opacity={0.6}
          dash={[4, 2]}
          listening={false}
        />
      )}
    </React.Fragment>
  );
};

export default CanvasElement;
