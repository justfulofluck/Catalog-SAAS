
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Text, Image, Rect, Circle, RegularPolygon, Star, Group, Transformer } from 'react-konva';
import useImage from 'use-image';
import Konva from 'konva';
import { CanvasElement as ICanvasElement, Product } from '../../types';
import { useStore } from '../../store/useStore';

interface Props {
  element: ICanvasElement;
  isSelected: boolean;
  onSelect: (multi: boolean) => void;
  onChange: (updates: Partial<ICanvasElement>) => void;
  isEditing?: boolean;
}

const CanvasElement: React.FC<Props> = ({ element, isSelected, onSelect, onChange, isEditing = false }) => {
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
    pushHistory
  } = useStore();

  const currentPage = catalog.pages[currentPageIndex];

  const linkedProduct = useMemo(() => {
    if (element.productId) {
      return products.find(p => p.id === element.productId);
    }
    return null;
  }, [element.productId, products]);

  const imgSrc = element.type === 'product-block' ? linkedProduct?.image : element.src;
  const [image] = useImage(imgSrc || '', 'anonymous');

  // Check if text contains HTML tags (rich text) or if a global effect is applied
  const isRichText = (element.type === 'text' && element.text && /<[^>]+>/.test(element.text)) ||
    (element.type === 'text' && element.effectStyle && element.effectStyle !== 'none') ||
    (element.fill?.includes('gradient'));

  // Render rich text/gradients as SVG for proper display on canvas
  useEffect(() => {
    if ((element.type === 'text' && isRichText) || (element.type === 'shape' && element.fill?.includes('gradient'))) {
      const isGradient = element.fill?.includes('gradient');
      // Escape common HTML entities that break XML/SVG
      const safeText = element.type === 'text' ? (element.text || '')
        .replace(/&nbsp;/g, '&#160;')
        .replace(/<br>/g, '<br/>')
        .replace(/&(?!(amp|lt|gt|quot|apos|#[0-9]+);)/g, '&amp;') : '';

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

      const svgString = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${element.width}" height="${element.height}">
          <foreignObject width="100%" height="100%">
            <div xmlns="http://www.w3.org/1999/xhtml" class="element-content" style="
              width: 100%;
              height: 100%;
              display: flex;
              align-items: flex-start;
              justify-content: ${element.textAlign === 'center' ? 'center' : element.textAlign === 'right' ? 'flex-end' : 'flex-start'};
            ">
              <div style="
                font-size: ${element.fontSize || 16}px;
                font-family: ${element.fontFamily || 'Inter'};
                font-weight: ${element.fontWeight || 'normal'};
                font-style: ${element.fontStyle || 'normal'};
                ${isGradient ? `background: ${element.fill}; -webkit-background-clip: ${element.type === 'text' ? 'text' : 'border-box'}; background-clip: ${element.type === 'text' ? 'text' : 'border-box'}; ${element.type === 'text' ? '-webkit-text-fill-color: transparent; color: transparent;' : ''}` : `color: ${element.fill || '#000000'};`}
                text-align: ${element.textAlign || 'left'};
                line-height: 1.2;
                padding: ${element.type === 'text' ? '5px' : '0'};
                width: ${element.type === 'text' ? 'auto' : '100%'};
                height: ${element.type === 'text' ? 'auto' : '100%'};
                max-width: 100%;
                overflow: hidden;
                word-wrap: break-word;
                border-radius: ${borderRadius};
                ${getEffectStyles()}
              ">
                ${element.type === 'text' ? safeText : ''}
              </div>
            </div>
          </foreignObject>
        </svg>
      `;

      const img = new window.Image();
      const encodedSvg = btoa(unescape(encodeURIComponent(svgString)));
      img.src = `data:image/svg+xml;base64,${encodedSvg}`;
      img.onload = () => setRichTextImage(img);
      img.onerror = () => {
        console.error('Failed to load rich text SVG image');
        setRichTextImage(null);
      };
    } else {
      setRichTextImage(null);
    }
  }, [
    element.text, element.width, element.height, element.fontSize, element.fontFamily,
    element.fontWeight, element.fontStyle, element.fill, element.textAlign, isRichText,
    element.effectStyle, element.effectColor, element.effectColor2, element.textStrokeWidth,
    element.shadowBlur, element.shadowOpacity, element.shadowOffsetX, element.shadowOffsetY,
    element.effectSpread, element.effectRoundness, element.type, element.shapeType
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
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected, element.locked]);

  const handleTransformEnd = () => {
    if (element.locked) return;
    const node = shapeRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    node.scaleX(1);
    node.scaleY(1);

    onChange({
      x: node.x(),
      y: node.y(),
      width: Math.max(5, node.width() * scaleX),
      height: Math.max(5, node.height() * scaleY),
      rotation: node.rotation(),
    });
  };

  const handleSelect = (e: any) => {
    e.cancelBubble = true;
    const isMulti = e.evt.shiftKey;
    onSelect(isMulti);
  };

  const handleDragStart = (e: any) => {
    if (element.locked) return;
    pushHistory();
    dragStartPos.current = { x: e.target.x(), y: e.target.y() };
    const stage = e.target.getStage();
    peerNodes.current = [];

    if (isSelected && selectedElementIds.length > 1) {
      selectedElementIds.forEach(id => {
        if (id !== element.id) {
          const peerNode = stage.findOne(`#${id}`);
          if (peerNode) {
            peerNode.setAttr('initialDragPos', { x: peerNode.x(), y: peerNode.y() });
            peerNodes.current.push(peerNode);
          }
        }
      });
    } else if (element.groupId) {
      const groupNodes = stage.find(`.${element.groupId}`);
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
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (!element.locked) {
      document.body.style.cursor = 'pointer';
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    document.body.style.cursor = 'default';
  };

  const isCurrentlyHovered = isHovered || hoveredElementId === element.id;
  const isDroppableTarget = draggingItem && currentPage?.type === 'interior' && (element.type === 'shape' || element.type === 'image' || element.type === 'product-block');

  const commonProps = {
    ref: shapeRef,
    id: element.id,
    name: element.id,
    x: element.x,
    y: element.y,
    width: element.width,
    height: element.height,
    rotation: element.rotation,
    opacity: element.opacity,
    draggable: !element.locked,
    onClick: handleSelect,
    onTap: handleSelect,
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
    if (!linkedProduct) return null;

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
    }

    // Dynamic Vertical Flow Positioning to prevent collision
    let currentY = textPadding;
    const lineSpacing = 4;

    return (
      <Group {...commonProps}>
        {/* Card Background (Non-overlay only) */}
        {theme !== 'editorial-overlay' && (
          <Rect
            width={element.width}
            height={element.height}
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
          ctx.lineTo(element.width, element.height - 10);
          ctx.quadraticCurveTo(element.width, element.height, element.width - 10, element.height);
          ctx.lineTo(10, element.height);
          ctx.quadraticCurveTo(0, element.height, 0, element.height - 10);
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
              height={textContainer.height}
              fillLinearGradientStartPoint={{ x: 0, y: 0 }}
              fillLinearGradientEndPoint={{ x: 0, y: textContainer.height }}
              fillLinearGradientColorStops={[0, 'transparent', 1, 'rgba(0,0,0,0.85)']}
            />
          )}
        </Group>

        {/* Content Region with Sequential Flow */}
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
            <Text
              text={`${linkedProduct.currency}${linkedProduct.price.toFixed(2)}`}
              x={textPadding}
              y={currentY + lineSpacing} // Sequential y instead of absolute bottom
              fontSize={metaFontSize}
              fontFamily="Inter"
              fontWeight="900"
              fill={accentColor}
            />
          )}
        </Group>
      </Group>
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

      {element.type === 'text' && !isEditing && (
        isRichText && richTextImage ? (
          <Image
            {...commonProps}
            image={richTextImage}
          />
        ) : (
          <Text
            {...commonProps}
            text={element.text}
            fontSize={element.fontSize}
            fontFamily={element.fontFamily}
            fontStyle={`${element.fontWeight || 'normal'} ${element.fontStyle || ''}`.trim()}
            textDecoration={element.textDecoration || 'none'}
            fill={element.fill}
            align={element.textAlign || 'left'}
            verticalAlign="top"
            lineHeight={element.lineHeight || 1.2}
            letterSpacing={element.letterSpacing || 0}
            padding={5}
            wrap="word"
          />
        )
      )}
      {element.type === 'image' && (
        <Image
          {...commonProps}
          image={image}
          crop={crop}
        />
      )}
      {element.type === 'shape' && (
        <React.Fragment>
          {element.shapeType === 'circle' ? (
            <Circle {...commonProps} x={element.x + element.width / 2} y={element.y + element.height / 2} radius={Math.min(element.width, element.height) / 2} fill={element.fill} />
          ) : (
            <Rect {...commonProps} fill={element.fill} />
          )}
        </React.Fragment>
      )}
      {element.type === 'product-block' && renderProductBlock()}

      {isSelected && !element.locked && (
        <Transformer
          ref={trRef}
          rotateEnabled={true}
          anchorSize={8}
          anchorCornerRadius={2}
          anchorStroke="#337ab7"
          anchorFill="#ffffff"
          borderStroke="#337ab7"
          borderStrokeWidth={1}
          onTransformStart={() => pushHistory()}
        />
      )}
    </React.Fragment>
  );
};

export default CanvasElement;
