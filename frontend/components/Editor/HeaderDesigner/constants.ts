import { Gradient } from 'fabric';
import { parseGradient } from '../fabricRenderer';
import { PX_PER_MM } from '../../../constants';

export { HEADER_SHAPES } from './shapeIcons';

export const CANVAS_PAD_X = 80;
export const CANVAS_PAD_Y = 80;

export const toMm = (px: number) => Math.round(px / PX_PER_MM);
export const toPx = (mm: number) => Math.round(mm * PX_PER_MM);

export function applyElementFill(obj: any, fill: string | undefined, w: number, h: number) {
  const isLineType = obj.shapeType === 'line' ||
    obj.shapeType === 'curved-line' ||
    obj.shapeType === 'elbow-line' ||
    obj.type === 'line' ||
    obj.constructor?.name === 'HorizontalLineShape' ||
    obj.constructor?.name === 'CurvedLineShape' ||
    obj.constructor?.name === 'ElbowLineShape' ||
    obj.isDivider === true;

  if (!fill) {
    obj.set('fill', '#ffffff');
    if (isLineType) obj.set('stroke', '#cbd5e1');
    return;
  }
  const parsed = parseGradient(fill, w, h);
  if (parsed) {
    const gradient = new Gradient({
      type: 'linear',
      gradientUnits: 'pixels',
      coords: parsed.coords,
      colorStops: parsed.stops,
    });
    obj.set('fill', gradient);
  } else {
    obj.set('fill', fill);
  }

  if (isLineType) {
    const strokeVal = fill && !fill.includes('gradient') ? fill : '#cbd5e1';
    obj.set('stroke', strokeVal);
  }
}

export const PRESET_HEADER_THEMES = [
  {
    id: 'preset-corp-split',
    name: 'Corporate Minimal Split',
    category: 'Corporate',
    height: 113.4, // ~30mm
    backgroundColor: '#ffffff',
    elements: [
      {
        id: 'corp-line',
        type: 'shape' as const,
        shapeType: 'rect' as const,
        x: 38,
        y: 105,
        width: 718,
        height: 1.5,
        fill: '#cbd5e1',
        zIndex: 1,
        rotation: 0,
        opacity: 1
      },
      {
        id: 'corp-left',
        type: 'text' as const,
        x: 38,
        y: 40,
        width: 380,
        height: 30,
        text: '{{catalog_name}}',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'Inter',
        fill: '#0f172a',
        letterSpacing: 1,
        textAlign: 'left' as const,
        zIndex: 2,
        rotation: 0,
        opacity: 1
      },
      {
        id: 'corp-right',
        type: 'text' as const,
        x: 420,
        y: 45,
        width: 336,
        height: 24,
        text: '{{category_name}} // 2026',
        fontSize: 11,
        fontWeight: '600',
        fontFamily: 'Inter',
        fill: '#64748b',
        letterSpacing: 1.5,
        textAlign: 'right' as const,
        zIndex: 2,
        rotation: 0,
        opacity: 1
      }
    ]
  },
  {
    id: 'preset-dark-ribbon',
    name: 'Industrial Dark Ribbon',
    category: 'Industrial',
    height: 120, // ~32mm
    backgroundColor: '#0f172a',
    elements: [
      {
        id: 'ribbon-accent',
        type: 'shape' as const,
        shapeType: 'rect' as const,
        x: 0,
        y: 116,
        width: 794,
        height: 4,
        fill: '#0ea5e9',
        zIndex: 1,
        rotation: 0,
        opacity: 1
      },
      {
        id: 'ribbon-title',
        type: 'text' as const,
        x: 38,
        y: 42,
        width: 460,
        height: 32,
        text: '{{catalog_name}} // COLLECTION',
        fontSize: 15,
        fontWeight: '900',
        fontFamily: 'Montserrat',
        fill: '#ffffff',
        letterSpacing: 2,
        textAlign: 'left' as const,
        zIndex: 2,
        rotation: 0,
        opacity: 1
      },
      {
        id: 'ribbon-url',
        type: 'text' as const,
        x: 500,
        y: 48,
        width: 256,
        height: 24,
        text: 'PAGE {{page}}',
        fontSize: 12,
        fontWeight: 'bold',
        fontFamily: 'Inter',
        fill: '#38bdf8',
        letterSpacing: 1.5,
        textAlign: 'right' as const,
        zIndex: 2,
        rotation: 0,
        opacity: 1
      }
    ]
  },
  {
    id: 'preset-luxury-gold',
    name: 'Luxury Emerald & Gold',
    category: 'Luxury',
    height: 125, // ~33mm
    backgroundColor: '#081c1c',
    elements: [
      {
        id: 'gold-line-top',
        type: 'shape' as const,
        shapeType: 'rect' as const,
        x: 38,
        y: 20,
        width: 718,
        height: 1,
        fill: 'linear-gradient(90deg, #d4af37, #fef08a, #d4af37)',
        zIndex: 1,
        rotation: 0,
        opacity: 0.8
      },
      {
        id: 'gold-line-bottom',
        type: 'shape' as const,
        shapeType: 'rect' as const,
        x: 38,
        y: 110,
        width: 718,
        height: 1.5,
        fill: 'linear-gradient(90deg, #d4af37, #fef08a, #d4af37)',
        zIndex: 1,
        rotation: 0,
        opacity: 0.9
      },
      {
        id: 'gold-title',
        type: 'text' as const,
        x: 38,
        y: 48,
        width: 718,
        height: 36,
        text: '— {{catalog_name}} —',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'Playfair Display',
        fill: '#fef08a',
        letterSpacing: 4,
        textAlign: 'center' as const,
        zIndex: 2,
        rotation: 0,
        opacity: 1
      }
    ]
  },
  {
    id: 'preset-editorial-minimal',
    name: 'Editorial Minimalist',
    category: 'Minimal',
    height: 100, // ~26mm
    backgroundColor: '#fafafa',
    elements: [
      {
        id: 'edit-line',
        type: 'shape' as const,
        shapeType: 'rect' as const,
        x: 50,
        y: 92,
        width: 694,
        height: 1,
        fill: '#e2e8f0',
        zIndex: 1,
        rotation: 0,
        opacity: 1
      },
      {
        id: 'edit-title',
        type: 'text' as const,
        x: 50,
        y: 35,
        width: 694,
        height: 28,
        text: '{{category_name}}',
        fontSize: 13,
        fontWeight: 'bold',
        fontFamily: 'Inter',
        fill: '#475569',
        letterSpacing: 3,
        textAlign: 'center' as const,
        zIndex: 2,
        rotation: 0,
        opacity: 1
      }
    ]
  }
];
