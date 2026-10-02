import React, { useId } from 'react';
import { PX_PER_MM } from '../../../constants';

interface PageGridOverlayProps {
  isDark: boolean;
  width: number; // e.g. PAGE_WIDTH (794)
  height: number; // e.g. headerHeight
  zoom: number;
  padX: number; // CANVAS_PAD_X (80)
  padY: number; // CANVAS_PAD_Y (80)
  showGrid: boolean;
  showCenterGuides?: boolean;
  showMargins?: boolean;
  gridSizeMm?: number; // Major grid spacing in mm (default 10mm)
  marginMm?: number; // Margin in mm (default 10mm)
}

export const PageGridOverlay: React.FC<PageGridOverlayProps> = ({
  isDark,
  width,
  height,
  zoom,
  padX,
  padY,
  showGrid,
  showCenterGuides = true,
  showMargins = true,
  gridSizeMm = 10,
  marginMm = 10,
}) => {
  const uniqueId = useId().replace(/:/g, '');
  const minorPatternId = `grid-minor-${uniqueId}`;
  const majorPatternId = `grid-major-${uniqueId}`;

  if (!showGrid && !showCenterGuides && !showMargins) {
    return null;
  }

  const majorGridPx = PX_PER_MM * gridSizeMm * zoom;
  const minorGridPx = (PX_PER_MM * (gridSizeMm / 2)) * zoom;
  const marginPx = PX_PER_MM * marginMm * zoom;
  const centerX = (width * zoom) / 2;
  const centerY = (height * zoom) / 2;

  const majorStroke = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(15, 61, 62, 0.18)';
  const minorStroke = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(15, 61, 62, 0.07)';

  return (
    <div
      className="absolute pointer-events-none select-none"
      style={{
        left: `${padX * zoom}px`,
        top: `${padY * zoom}px`,
        width: `${width * zoom}px`,
        height: `${height * zoom}px`,
        zIndex: 25,
      }}
    >
      <svg
        width="100%"
        height="100%"
        className="w-full h-full pointer-events-none overflow-visible"
      >
        <defs>
          {/* Minor Sub-grid (Dotted 5mm) */}
          <pattern
            id={minorPatternId}
            width={minorGridPx}
            height={minorGridPx}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${minorGridPx} 0 L 0 0 0 ${minorGridPx}`}
              fill="none"
              stroke={minorStroke}
              strokeWidth="0.75"
              strokeDasharray="2,2"
            />
          </pattern>

          {/* Major Grid (Solid 10mm lines) */}
          <pattern
            id={majorPatternId}
            width={majorGridPx}
            height={majorGridPx}
            patternUnits="userSpaceOnUse"
          >
            <rect width={majorGridPx} height={majorGridPx} fill={`url(#${minorPatternId})`} />
            <path
              d={`M ${majorGridPx} 0 L 0 0 0 ${majorGridPx}`}
              fill="none"
              stroke={majorStroke}
              strokeWidth="1"
            />
          </pattern>
        </defs>

        {/* 1. Main Grid Overlay */}
        {showGrid && (
          <rect
            width="100%"
            height="100%"
            fill={`url(#${majorPatternId})`}
          />
        )}

        {/* 2. Page Margin Guidelines (10mm left / right print safety) */}
        {showMargins && (
          <g opacity="0.85">
            {/* Left Margin Line */}
            <line
              x1={marginPx}
              y1={0}
              x2={marginPx}
              y2={height * zoom}
              stroke="#8b5cf6"
              strokeWidth="1.25"
              strokeDasharray="4,3"
            />
            {/* Right Margin Line */}
            <line
              x1={(width * zoom) - marginPx}
              y1={0}
              x2={(width * zoom) - marginPx}
              y2={height * zoom}
              stroke="#8b5cf6"
              strokeWidth="1.25"
              strokeDasharray="4,3"
            />
            {/* Left Margin Badge */}
            <text
              x={marginPx + 3}
              y={10 * zoom}
              fill="#8b5cf6"
              fontSize={Math.max(8, 9 * zoom)}
              fontFamily="monospace"
              fontWeight="bold"
            >
              10mm
            </text>
            {/* Right Margin Badge */}
            <text
              x={(width * zoom) - marginPx - (28 * zoom)}
              y={10 * zoom}
              fill="#8b5cf6"
              fontSize={Math.max(8, 9 * zoom)}
              fontFamily="monospace"
              fontWeight="bold"
            >
              10mm
            </text>
          </g>
        )}

        {/* 3. Center Alignment Guidelines (Cyan) */}
        {showCenterGuides && (
          <g opacity="0.9">
            {/* Vertical Centerline */}
            <line
              x1={centerX}
              y1={0}
              x2={centerX}
              y2={height * zoom}
              stroke="#06b6d4"
              strokeWidth="1.25"
              strokeDasharray="5,4"
            />
            {/* Horizontal Centerline */}
            <line
              x1={0}
              y1={centerY}
              x2={width * zoom}
              y2={centerY}
              stroke="#06b6d4"
              strokeWidth="1.25"
              strokeDasharray="5,4"
            />
            {/* Center Tag Badge */}
            <rect
              x={centerX - 18}
              y={-14}
              width={36}
              height={14}
              rx={3}
              fill={isDark ? '#083344' : '#cffafe'}
              stroke="#06b6d4"
              strokeWidth="0.75"
            />
            <text
              x={centerX}
              y={-4}
              textAnchor="middle"
              fill={isDark ? '#67e8f9' : '#0891b2'}
              fontSize="8"
              fontFamily="monospace"
              fontWeight="bold"
            >
              105mm
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};
