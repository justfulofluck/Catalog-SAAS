import { Gradient } from 'fabric';
import { parseGradient } from '../fabricRenderer';
import { PX_PER_MM } from '../../../constants';

export { FOOTER_SHAPES } from './shapeIcons';

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

export const PRESET_FOOTER_THEMES = [
  {
    id: 'preset-ftr-b2b',
    name: 'B2B Standard Page Counter',
    category: 'Corporate',
    height: 75.6, // 20mm
    backgroundColor: '#ffffff',
    elements: [
      {
        id: 'ftr-div-line',
        type: 'shape' as const,
        shapeType: 'rect' as const,
        x: 38,
        y: 8,
        width: 718,
        height: 1.5,
        fill: '#e2e8f0',
        zIndex: 1,
        rotation: 0,
        opacity: 1
      },
      {
        id: 'ftr-corp-notice',
        type: 'text' as const,
        x: 38,
        y: 26,
        width: 380,
        height: 24,
        text: '{{company_name}}  •  Proprietary & Confidential',
        fontSize: 10,
        fontWeight: '500',
        fontFamily: 'Inter',
        fill: '#64748b',
        letterSpacing: 0.5,
        textAlign: 'left' as const,
        zIndex: 2,
        rotation: 0,
        opacity: 1
      },
      {
        id: 'ftr-page-counter',
        type: 'text' as const,
        x: 520,
        y: 26,
        width: 236,
        height: 24,
        text: 'PAGE {{page_number}} / {{total_pages}}',
        fontSize: 10,
        fontWeight: 'bold',
        fontFamily: 'Inter',
        fill: '#0f172a',
        letterSpacing: 1.5,
        textAlign: 'right' as const,
        zIndex: 2,
        rotation: 0,
        opacity: 1
      }
    ]
  },
  {
    id: 'preset-ftr-dark-strip',
    name: 'Industrial Dark Bar',
    category: 'Industrial',
    height: 65, // ~17mm
    backgroundColor: '#0f172a',
    elements: [
      {
        id: 'ftr-cyan-accent',
        type: 'shape' as const,
        shapeType: 'rect' as const,
        x: 0,
        y: 0,
        width: 794,
        height: 2,
        fill: '#0ea5e9',
        zIndex: 1,
        rotation: 0,
        opacity: 1
      },
      {
        id: 'ftr-dark-cat',
        type: 'text' as const,
        x: 38,
        y: 20,
        width: 350,
        height: 24,
        text: '{{catalog_name}}  //  {{current_year}}',
        fontSize: 10,
        fontWeight: 'bold',
        fontFamily: 'Montserrat',
        fill: '#94a3b8',
        letterSpacing: 1.5,
        textAlign: 'left' as const,
        zIndex: 2,
        rotation: 0,
        opacity: 1
      },
      {
        id: 'ftr-dark-page',
        type: 'text' as const,
        x: 420,
        y: 20,
        width: 336,
        height: 24,
        text: 'PAGE {{page_number}}',
        fontSize: 11,
        fontWeight: '900',
        fontFamily: 'Montserrat',
        fill: '#38bdf8',
        letterSpacing: 2,
        textAlign: 'right' as const,
        zIndex: 2,
        rotation: 0,
        opacity: 1
      }
    ]
  },
  {
    id: 'preset-ftr-gold-lux',
    name: 'Luxury Gold Trim',
    category: 'Luxury',
    height: 80, // ~21mm
    backgroundColor: '#081c1c',
    elements: [
      {
        id: 'ftr-gold-top',
        type: 'shape' as const,
        shapeType: 'rect' as const,
        x: 38,
        y: 8,
        width: 718,
        height: 1,
        fill: 'linear-gradient(90deg, #d4af37, #fef08a, #d4af37)',
        zIndex: 1,
        rotation: 0,
        opacity: 0.9
      },
      {
        id: 'ftr-gold-center',
        type: 'text' as const,
        x: 38,
        y: 28,
        width: 718,
        height: 24,
        text: '— {{company_name}}  •  PAGE {{page_number}} —',
        fontSize: 11,
        fontWeight: '600',
        fontFamily: 'Playfair Display',
        fill: '#fef08a',
        letterSpacing: 3,
        textAlign: 'center' as const,
        zIndex: 2,
        rotation: 0,
        opacity: 1
      }
    ]
  },
  {
    id: 'preset-ftr-contact-url',
    name: 'Contact & Web Footer',
    category: 'Minimal',
    height: 70, // ~18.5mm
    backgroundColor: '#ffffff',
    elements: [
      {
        id: 'ftr-url-line',
        type: 'shape' as const,
        shapeType: 'rect' as const,
        x: 38,
        y: 6,
        width: 718,
        height: 1,
        fill: '#cbd5e1',
        zIndex: 1,
        rotation: 0,
        opacity: 1
      },
      {
        id: 'ftr-url-contact',
        type: 'text' as const,
        x: 38,
        y: 22,
        width: 460,
        height: 24,
        text: 'info@company.com  •  www.company.com',
        fontSize: 10,
        fontWeight: '600',
        fontFamily: 'Inter',
        fill: '#6366f1',
        letterSpacing: 0.5,
        textAlign: 'left' as const,
        zIndex: 2,
        rotation: 0,
        opacity: 1
      },
      {
        id: 'ftr-url-page',
        type: 'text' as const,
        x: 520,
        y: 22,
        width: 236,
        height: 24,
        text: 'PAGE {{page_number}}',
        fontSize: 10,
        fontWeight: 'bold',
        fontFamily: 'Inter',
        fill: '#1e293b',
        letterSpacing: 1.5,
        textAlign: 'right' as const,
        zIndex: 2,
        rotation: 0,
        opacity: 1
      }
    ]
  }
];
