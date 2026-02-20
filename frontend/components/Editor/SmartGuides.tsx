import React from 'react';
import { Layer as KonvaLayer, Line as KonvaLine, Rect as KonvaRect, Text as KonvaText, Group as KonvaGroup } from 'react-konva';
import { PAGE_WIDTH, PAGE_HEIGHT } from '../../constants';

export interface Guide {
    orientation: 'H' | 'V'; // horizontal (y-axis snap) or vertical (x-axis snap)
    position: number;        // pixel position on the page
}

export interface DragPosition {
    x: number;
    y: number;
}

interface Props {
    guides: Guide[];
    dragPosition: DragPosition | null;
}

const GUIDE_COLOR = '#06b6d4'; // cyan-500

const SmartGuides: React.FC<Props> = ({ guides, dragPosition }) => {
    if (guides.length === 0 && !dragPosition) return null;

    return (
        <KonvaLayer listening={false}>
            {/* Guide lines */}
            {guides.map((guide, i) => (
                guide.orientation === 'V' ? (
                    <KonvaLine
                        key={`v-${i}`}
                        points={[guide.position, 0, guide.position, PAGE_HEIGHT]}
                        stroke={GUIDE_COLOR}
                        strokeWidth={1}
                        dash={[4, 3]}
                        opacity={0.9}
                    />
                ) : (
                    <KonvaLine
                        key={`h-${i}`}
                        points={[0, guide.position, PAGE_WIDTH, guide.position]}
                        stroke={GUIDE_COLOR}
                        strokeWidth={1}
                        dash={[4, 3]}
                        opacity={0.9}
                    />
                )
            ))}

            {/* X/Y position tooltip */}
            {dragPosition && (
                <KonvaGroup x={dragPosition.x} y={dragPosition.y + 14}>
                    <KonvaRect
                        width={130}
                        height={22}
                        fill="rgba(15,23,42,0.85)"
                        cornerRadius={4}
                        x={-2}
                        y={0}
                    />
                    <KonvaText
                        x={6}
                        y={5}
                        text={`X: ${Math.round(dragPosition.x)} px   Y: ${Math.round(dragPosition.y)} px`}
                        fontSize={11}
                        fontFamily="Inter, sans-serif"
                        fill="#e2e8f0"
                    />
                </KonvaGroup>
            )}
        </KonvaLayer>
    );
};

export default SmartGuides;
