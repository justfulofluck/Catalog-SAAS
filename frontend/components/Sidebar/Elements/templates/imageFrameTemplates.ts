import { CanvasElement } from '../../../../types';
import { ImageFrameTemplate } from '../types';

export const imageFrameTemplates: ImageFrameTemplate[] = [
  {
    id: 'frame-circle',
    title: 'Circle Frame',
    frameShape: 'circle',
    description: 'Perfect circular crop mask for portraits and featured product cutouts',
    width: 240,
    height: 240,
    getSvg: (isDark = false) => {
      const stroke = isDark ? '#10b981' : '#059669';
      const fill = isDark ? 'rgba(16, 185, 129, 0.08)' : 'rgba(5, 150, 105, 0.06)';
      return `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="42" fill="${fill}" stroke="${stroke}" stroke-width="2.5" stroke-dasharray="4 3" />
        <circle cx="50" cy="50" r="28" fill="${isDark ? '#262626' : '#e2e8f0'}" opacity="0.6" />
        <path d="M42 45a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm16 17l-9-12-6 8-4-5-8 9h27z" fill="${stroke}" opacity="0.85" />
      </svg>`;
    },
    getCanvasElement: (x: number, y: number): CanvasElement => ({
      id: `frame-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: 'image',
      isFrame: true,
      frameShape: 'circle',
      shapeType: 'circle',
      x,
      y,
      width: 240,
      height: 240,
      rotation: 0,
      opacity: 1,
      zIndex: 10,
      frameStrokeStyle: 'solid',
      stroke: '#0F3D3E',
      strokeWidth: 2,
      frameShadow: 'subtle',
      shadowBlur: 10,
      shadowOffsetX: 0,
      shadowOffsetY: 4,
      fill: 'rgba(15, 61, 62, 0.05)',
    }),
  },
  {
    id: 'frame-rounded-rect',
    title: 'Rounded Rectangle',
    frameShape: 'roundedRect',
    description: 'Modern card frame with soft rounded corners',
    width: 260,
    height: 200,
    cornerRadius: 24,
    getSvg: (isDark = false) => {
      const stroke = isDark ? '#3b82f6' : '#2563eb';
      const fill = isDark ? 'rgba(59, 130, 246, 0.08)' : 'rgba(37, 99, 235, 0.06)';
      return `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <rect x="12" y="18" width="76" height="64" rx="12" fill="${fill}" stroke="${stroke}" stroke-width="2.5" stroke-dasharray="4 3" />
        <rect x="22" y="26" width="56" height="48" rx="8" fill="${isDark ? '#262626' : '#e2e8f0'}" opacity="0.6" />
        <path d="M40 45a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm20 17l-10-13-7 9-4-5-9 9h30z" fill="${stroke}" opacity="0.85" />
      </svg>`;
    },
    getCanvasElement: (x: number, y: number): CanvasElement => ({
      id: `frame-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: 'image',
      isFrame: true,
      frameShape: 'roundedRect',
      shapeType: 'roundedRect',
      x,
      y,
      width: 260,
      height: 200,
      cornerRadius: 24,
      rx: 24,
      ry: 24,
      rotation: 0,
      opacity: 1,
      zIndex: 10,
      frameStrokeStyle: 'solid',
      stroke: '#0F3D3E',
      strokeWidth: 2,
      frameShadow: 'subtle',
      shadowBlur: 10,
      shadowOffsetX: 0,
      shadowOffsetY: 4,
      fill: 'rgba(15, 61, 62, 0.05)',
    }),
  },
  {
    id: 'frame-oval',
    title: 'Oval Frame',
    frameShape: 'oval',
    description: 'Smooth elliptical frame for elegant beauty & lifestyle products',
    width: 280,
    height: 190,
    getSvg: (isDark = false) => {
      const stroke = isDark ? '#ec4899' : '#db2777';
      const fill = isDark ? 'rgba(236, 72, 153, 0.08)' : 'rgba(219, 39, 119, 0.06)';
      return `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="50" cy="50" rx="44" ry="32" fill="${fill}" stroke="${stroke}" stroke-width="2.5" stroke-dasharray="4 3" />
        <ellipse cx="50" cy="50" rx="30" ry="20" fill="${isDark ? '#262626' : '#e2e8f0'}" opacity="0.6" />
        <path d="M42 46a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zm16 13l-8-10-5 7-3-4-7 7h23z" fill="${stroke}" opacity="0.85" />
      </svg>`;
    },
    getCanvasElement: (x: number, y: number): CanvasElement => ({
      id: `frame-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: 'image',
      isFrame: true,
      frameShape: 'oval',
      shapeType: 'circle',
      x,
      y,
      width: 280,
      height: 190,
      rotation: 0,
      opacity: 1,
      zIndex: 10,
      frameStrokeStyle: 'solid',
      stroke: '#0F3D3E',
      strokeWidth: 2,
      frameShadow: 'subtle',
      shadowBlur: 10,
      shadowOffsetX: 0,
      shadowOffsetY: 4,
      fill: 'rgba(15, 61, 62, 0.05)',
    }),
  },
  {
    id: 'frame-hexagon',
    title: 'Hexagon Frame',
    frameShape: 'hexagon',
    description: 'Geometric 6-sided frame for modern industrial and tech catalogs',
    width: 240,
    height: 240,
    getSvg: (isDark = false) => {
      const stroke = isDark ? '#8b5cf6' : '#7c3aed';
      const fill = isDark ? 'rgba(139, 92, 246, 0.08)' : 'rgba(124, 58, 237, 0.06)';
      return `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <polygon points="50,10 88,30 88,70 50,90 12,70 12,30" fill="${fill}" stroke="${stroke}" stroke-width="2.5" stroke-dasharray="4 3" />
        <polygon points="50,22 76,36 76,64 50,78 24,64 24,36" fill="${isDark ? '#262626' : '#e2e8f0'}" opacity="0.6" />
        <path d="M42 45a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm16 17l-9-12-6 8-4-5-8 9h27z" fill="${stroke}" opacity="0.85" />
      </svg>`;
    },
    getCanvasElement: (x: number, y: number): CanvasElement => ({
      id: `frame-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: 'image',
      isFrame: true,
      frameShape: 'hexagon',
      shapeType: 'hexagon',
      x,
      y,
      width: 240,
      height: 240,
      rotation: 0,
      opacity: 1,
      zIndex: 10,
      frameStrokeStyle: 'solid',
      stroke: '#0F3D3E',
      strokeWidth: 2,
      frameShadow: 'subtle',
      shadowBlur: 10,
      shadowOffsetX: 0,
      shadowOffsetY: 4,
      fill: 'rgba(15, 61, 62, 0.05)',
    }),
  },
  {
    id: 'frame-diamond',
    title: 'Diamond Frame',
    frameShape: 'diamond',
    description: 'Dynamic tilted rhombus frame for luxury jewelry and highlights',
    width: 240,
    height: 240,
    getSvg: (isDark = false) => {
      const stroke = isDark ? '#f59e0b' : '#d97706';
      const fill = isDark ? 'rgba(245, 158, 11, 0.08)' : 'rgba(217, 119, 6, 0.06)';
      return `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <polygon points="50,10 90,50 50,90 10,50" fill="${fill}" stroke="${stroke}" stroke-width="2.5" stroke-dasharray="4 3" />
        <polygon points="50,24 76,50 50,76 24,50" fill="${isDark ? '#262626' : '#e2e8f0'}" opacity="0.6" />
        <path d="M44 46a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zm14 13l-8-10-5 7-3-4-7 7h23z" fill="${stroke}" opacity="0.85" />
      </svg>`;
    },
    getCanvasElement: (x: number, y: number): CanvasElement => ({
      id: `frame-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: 'image',
      isFrame: true,
      frameShape: 'diamond',
      shapeType: 'diamond',
      x,
      y,
      width: 240,
      height: 240,
      rotation: 0,
      opacity: 1,
      zIndex: 10,
      frameStrokeStyle: 'solid',
      stroke: '#0F3D3E',
      strokeWidth: 2,
      frameShadow: 'subtle',
      shadowBlur: 10,
      shadowOffsetX: 0,
      shadowOffsetY: 4,
      fill: 'rgba(15, 61, 62, 0.05)',
    }),
  },
  {
    id: 'frame-pill',
    title: 'Pill / Capsule Frame',
    frameShape: 'pill',
    description: 'Horizontal pill stadium shape with fully rounded semicircular ends',
    width: 280,
    height: 150,
    getSvg: (isDark = false) => {
      const stroke = isDark ? '#06b6d4' : '#0891b2';
      const fill = isDark ? 'rgba(6, 182, 212, 0.08)' : 'rgba(8, 145, 178, 0.06)';
      return `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="25" width="80" height="50" rx="25" fill="${fill}" stroke="${stroke}" stroke-width="2.5" stroke-dasharray="4 3" />
        <rect x="20" y="32" width="60" height="36" rx="18" fill="${isDark ? '#262626' : '#e2e8f0'}" opacity="0.6" />
        <path d="M42 45a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zm16 13l-8-10-5 7-3-4-7 7h23z" fill="${stroke}" opacity="0.85" />
      </svg>`;
    },
    getCanvasElement: (x: number, y: number): CanvasElement => ({
      id: `frame-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: 'image',
      isFrame: true,
      frameShape: 'pill',
      shapeType: 'pill',
      x,
      y,
      width: 280,
      height: 150,
      cornerRadius: 75,
      rotation: 0,
      opacity: 1,
      zIndex: 10,
      frameStrokeStyle: 'solid',
      stroke: '#0F3D3E',
      strokeWidth: 2,
      frameShadow: 'subtle',
      shadowBlur: 10,
      shadowOffsetX: 0,
      shadowOffsetY: 4,
      fill: 'rgba(15, 61, 62, 0.05)',
    }),
  },
  {
    id: 'frame-octagon',
    title: 'Octagon Frame',
    frameShape: 'octagon',
    description: 'Chiseled 8-sided frame for premium architectural and mechanical items',
    width: 240,
    height: 240,
    getSvg: (isDark = false) => {
      const stroke = isDark ? '#6366f1' : '#4f46e5';
      const fill = isDark ? 'rgba(99, 102, 241, 0.08)' : 'rgba(79, 70, 229, 0.06)';
      return `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <polygon points="32,10 68,10 90,32 90,68 68,90 32,90 10,68 10,32" fill="${fill}" stroke="${stroke}" stroke-width="2.5" stroke-dasharray="4 3" />
        <polygon points="36,22 64,22 78,36 78,64 64,78 36,78 22,64 22,36" fill="${isDark ? '#262626' : '#e2e8f0'}" opacity="0.6" />
        <path d="M42 45a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm16 17l-9-12-6 8-4-5-8 9h27z" fill="${stroke}" opacity="0.85" />
      </svg>`;
    },
    getCanvasElement: (x: number, y: number): CanvasElement => ({
      id: `frame-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: 'image',
      isFrame: true,
      frameShape: 'octagon',
      shapeType: 'octagon',
      x,
      y,
      width: 240,
      height: 240,
      rotation: 0,
      opacity: 1,
      zIndex: 10,
      frameStrokeStyle: 'solid',
      stroke: '#0F3D3E',
      strokeWidth: 2,
      frameShadow: 'subtle',
      shadowBlur: 10,
      shadowOffsetX: 0,
      shadowOffsetY: 4,
      fill: 'rgba(15, 61, 62, 0.05)',
    }),
  },
];
