import React from 'react';
import { DistanceBadge } from '../../../utils/spatialIndex';

interface FabricSmartGuidesOverlayProps {
  zoom: number;
  activeGuides: { type: 'horizontal' | 'vertical'; pos: number }[];
  activeDistanceBadges: DistanceBadge[];
  activeDimensions: { x: number; y: number; w: number; h: number } | null;
}

export const FabricSmartGuidesOverlay: React.FC<FabricSmartGuidesOverlayProps> = ({
  zoom,
  activeGuides,
  activeDistanceBadges,
  activeDimensions,
}) => {
  return (
    <>
      {/* Real-time spatial alignment guide overlays */}
      {activeGuides.map((guide, idx) => (
        <div
          key={`guide-${idx}`}
          style={{
            position: 'absolute',
            pointerEvents: 'none',
            zIndex: 9999,
            backgroundColor: '#d946ef', // Hot magenta guide line
            ...(guide.type === 'vertical'
              ? { left: `${guide.pos * zoom}px`, top: 0, width: '1px', height: '100%' }
              : { top: `${guide.pos * zoom}px`, left: 0, height: '1px', width: '100%' }),
          }}
        />
      ))}

      {/* Real-time Figma-style Equal Distance & Spacing Badges */}
      {activeDistanceBadges.map((badge, idx) => (
        <React.Fragment key={`badge-${idx}`}>
          {/* Dashed Connecting Line */}
          <div
            style={{
              position: 'absolute',
              pointerEvents: 'none',
              zIndex: 9999,
              borderStyle: 'dashed',
              borderColor: '#d946ef',
              ...(badge.type === 'vertical'
                ? {
                    left: `${badge.crossPos * zoom}px`,
                    top: `${badge.startPos * zoom}px`,
                    width: '0px',
                    height: `${(badge.endPos - badge.startPos) * zoom}px`,
                    borderLeftWidth: '1.5px',
                  }
                : {
                    top: `${badge.crossPos * zoom}px`,
                    left: `${badge.startPos * zoom}px`,
                    height: '0px',
                    width: `${(badge.endPos - badge.startPos) * zoom}px`,
                    borderTopWidth: '1.5px',
                  }),
            }}
          />

          {/* Magenta Gap / Padding Badge */}
          <div
            style={{
              position: 'absolute',
              pointerEvents: 'none',
              zIndex: 10000,
              backgroundColor: '#d946ef',
              color: '#ffffff',
              fontSize: '9px',
              fontWeight: 800,
              padding: '2px 5px',
              borderRadius: '9999px',
              transform: 'translate(-50%, -50%)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              letterSpacing: '0.02em',
              ...(badge.type === 'vertical'
                ? {
                    left: `${badge.crossPos * zoom}px`,
                    top: `${((badge.startPos + badge.endPos) / 2) * zoom}px`,
                  }
                : {
                    left: `${((badge.startPos + badge.endPos) / 2) * zoom}px`,
                    top: `${badge.crossPos * zoom}px`,
                  }),
            }}
          >
            {badge.displayValue}
          </div>
        </React.Fragment>
      ))}

      {/* Real-time Dimension Tooltip (w: ... h: ...) */}
      {activeDimensions && (
        <div
          style={{
            position: 'absolute',
            pointerEvents: 'none',
            zIndex: 10001,
            left: `${(activeDimensions.x + activeDimensions.w) * zoom + 12}px`,
            top: `${(activeDimensions.y + activeDimensions.h) * zoom + 12}px`,
            backgroundColor: '#20232a',
            color: '#ffffff',
            fontSize: '11px',
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            fontWeight: 700,
            padding: '4px 9px',
            borderRadius: '7px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,255,255,0.12)',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            userSelect: 'none',
            letterSpacing: '0.02em',
          }}
        >
          <span>w: {activeDimensions.w}</span>
          <span className="text-slate-400">h: {activeDimensions.h}</span>
        </div>
      )}
    </>
  );
};
