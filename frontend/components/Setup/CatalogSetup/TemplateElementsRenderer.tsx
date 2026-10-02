import React, { useMemo } from 'react';
import { TemplateElementsRendererProps } from './types';

export const TemplateElementsRenderer: React.FC<TemplateElementsRendererProps> = ({
  elements = [],
  width = 794,
  height = 1123,
  backgroundColor = '#ffffff',
  catalogTitle = '',
  thumbnail,
  className = ''
}) => {
  const sorted = useMemo(() => {
    return [...(elements || [])].sort((a, b) => (Number(a.zIndex) || 0) - (Number(b.zIndex) || 0));
  }, [elements]);

  const replaceMacros = (str: string) => {
    if (!str) return '';
    return str
      .replace(/\{\{page_number\}\}/gi, '1')
      .replace(/\{\{total_pages\}\}/gi, '12')
      .replace(/\{\{catalog_title\}\}/gi, catalogTitle || 'CATALOG 2026')
      .replace(/\{\{category_name\}\}/gi, 'LIGHTING & FIXTURES');
  };

  if ((!elements || elements.length === 0) && thumbnail) {
    return (
      <div className={`relative overflow-hidden w-full h-full ${className}`} style={{ backgroundColor }}>
        <img src={thumbnail} alt="Template Preview" className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden w-full h-full select-none ${className}`}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full block"
        style={{ backgroundColor: backgroundColor || '#ffffff' }}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Base Canvas Background Layer */}
        <rect x={0} y={0} width={width} height={height} fill={backgroundColor || '#ffffff'} />

        {/* Sorted Canvas Elements */}
        {sorted.map((el, i) => {
          const x = Number(el.x) || 0;
          const y = Number(el.y) || 0;
          const w = Number(el.width) || 0;
          const h = Number(el.height) || 0;
          const rot = Number(el.rotation) || 0;
          const op = el.opacity !== undefined ? Number(el.opacity) : 1;
          const fill = el.fill || 'transparent';
          const stroke = el.stroke || 'none';
          const strokeW = Number(el.strokeWidth) || 0;
          const rx = Number(el.cornerRadius || el.rx) || 0;

          const transform = rot ? `rotate(${rot} ${x + w / 2} ${y + h / 2})` : undefined;

          // Shape and Rect Elements
          if (el.type === 'shape' || el.type === 'rect') {
            if (el.shapeType === 'line' || el.type === 'line') {
              const yMid = y + (h > 0 ? h / 2 : 0);
              return (
                <line
                  key={el.id || i}
                  x1={x}
                  y1={yMid}
                  x2={x + w}
                  y2={yMid}
                  stroke={el.stroke || el.fill || '#0f172a'}
                  strokeWidth={strokeW || 2}
                  strokeDasharray={el.strokeDashArray?.join(' ')}
                  opacity={op}
                  transform={transform}
                />
              );
            }
            if (el.shapeType === 'circle') {
              return (
                <ellipse
                  key={el.id || i}
                  cx={x + w / 2}
                  cy={y + h / 2}
                  rx={w / 2}
                  ry={h / 2}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={strokeW}
                  opacity={op}
                  transform={transform}
                />
              );
            }
            if (el.shapeType === 'triangle') {
              return (
                <polygon
                  key={el.id || i}
                  points={`${x + w / 2},${y} ${x + w},${y + h} ${x},${y + h}`}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={strokeW}
                  opacity={op}
                  transform={transform}
                />
              );
            }
            return (
              <rect
                key={el.id || i}
                x={x}
                y={y}
                width={w}
                height={h}
                rx={rx}
                ry={rx}
                fill={fill}
                stroke={stroke}
                strokeWidth={strokeW}
                opacity={op}
                transform={transform}
              />
            );
          }

          // Image Elements
          if (el.type === 'image' && el.src) {
            return (
              <image
                key={el.id || i}
                href={el.src}
                x={x}
                y={y}
                width={w}
                height={h}
                preserveAspectRatio="xMidYMid meet"
                opacity={op}
                transform={transform}
              />
            );
          }

          // Text Elements
          if (el.type === 'text' || el.type === 'textbox') {
            const processedText = replaceMacros(el.text || '');
            const fontSize = Number(el.fontSize) || 14;
            const fontFamily = el.fontFamily || 'Inter, sans-serif';
            const fontWeight = el.fontWeight || 'normal';
            const fontStyle = el.fontStyle || 'normal';
            const textColor = el.fill || '#000000';
            const textAlign = el.textAlign || 'left';
            const letterSpacing = el.letterSpacing ? `${el.letterSpacing}px` : undefined;
            const lineHeight = el.lineHeight || 1.2;

            return (
              <foreignObject
                key={el.id || i}
                x={x}
                y={y}
                width={Math.max(w, 20)}
                height={Math.max(h, fontSize * 1.5)}
                opacity={op}
                transform={transform}
                style={{ overflow: 'visible' }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: el.verticalAlign === 'middle' ? 'center' : el.verticalAlign === 'bottom' ? 'flex-end' : 'flex-start',
                    justifyContent: textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start',
                    color: textColor,
                    fontFamily,
                    fontSize: `${fontSize}px`,
                    fontWeight,
                    fontStyle,
                    textAlign: textAlign as any,
                    letterSpacing,
                    lineHeight,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    pointerEvents: 'none',
                    userSelect: 'none'
                  }}
                >
                  {processedText}
                </div>
              </foreignObject>
            );
          }

          return null;
        })}
      </svg>
    </div>
  );
};
