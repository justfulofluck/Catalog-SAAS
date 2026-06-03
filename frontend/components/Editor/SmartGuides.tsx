import React, { memo } from 'react';
import { PAGE_WIDTH, PAGE_HEIGHT } from '../../constants';

export interface Guide {
    orientation: 'H' | 'V';
    position: number;
}

export interface DragPosition {
    x: number;
    y: number;
}

interface Props {
    guides: Guide[];
    dragPosition: DragPosition | null;
}

const GUIDE_COLOR = '#06b6d4';

const SmartGuides: React.FC<Props> = memo(({ guides, dragPosition }) => {
    if (guides.length === 0 && !dragPosition) return null;

    return (
        <div className="absolute inset-0 pointer-events-none">
            {guides.map((guide, i) => (
                guide.orientation === 'V' ? (
                    <div
                        key={`v-${i}`}
                        className="absolute top-0 bottom-0 w-px bg-cyan-500/90"
                        style={{ left: guide.position }}
                    />
                ) : (
                    <div
                        key={`h-${i}`}
                        className="absolute left-0 right-0 h-px bg-cyan-500/90"
                        style={{ top: guide.position }}
                    />
                )
            ))}

            {dragPosition && (
                <div
                    className="absolute bg-slate-900/85 text-cyan-100 text-[11px] font-mono px-2 py-1 rounded pointer-events-none"
                    style={{
                        left: dragPosition.x,
                        top: dragPosition.y + 14,
                    }}
                >
                    X: {Math.round(dragPosition.x)} px&nbsp;&nbsp;Y: {Math.round(dragPosition.y)} px
                </div>
            )}
        </div>
    );
}, (prevProps, nextProps) => {
    if (prevProps.guides.length !== nextProps.guides.length) return false;
    if (prevProps.guides.some((g, i) => g.position !== nextProps.guides[i]?.position || g.orientation !== nextProps.guides[i]?.orientation)) return false;
    if (prevProps.dragPosition?.x !== nextProps.dragPosition?.x || prevProps.dragPosition?.y !== nextProps.dragPosition?.y) return false;
    return true;
});

export default SmartGuides;
