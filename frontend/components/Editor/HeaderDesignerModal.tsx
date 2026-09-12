import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Canvas, IText, Rect, Line, Circle, Image as FabricImage, ActiveSelection, Gradient, Group } from 'fabric';
import {
  Layout, X, Save, Check, Sparkles, Plus, Minus, Type, Square,
  Image as ImageIcon, Palette, Trash2, Copy, ArrowUp, ArrowDown,
  ArrowUpToLine, ArrowDownToLine, ChevronsUp, ChevronsDown, GripVertical,
  ZoomIn, ZoomOut, RotateCcw, Sliders, ChevronDown, CheckCircle2,
  FolderOpen, Layers, AlignLeft, AlignCenter, AlignRight, Bold, Italic,
  SlidersHorizontal, Upload, Tag, Search, ArrowLeft
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { CanvasElement, Product, ShapeType } from '../../types';
import { PAGE_WIDTH, PX_PER_MM, CATEGORIZED_FONTS } from '../../constants';
import AdvancedColorPicker from '../Properties/AdvancedColorPicker';
import { applyCanvaSelectionStyle } from '../../utils/canvaControls';
import { parseGradient, buildShape, getPolyPoints } from './fabricRenderer';

const HEADER_SHAPES: { type: ShapeType; label: string; icon: React.ReactNode }[] = [
  {
    type: 'rect',
    label: 'Square',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
        <rect x="3" y="3" width="18" height="18" rx="1" />
      </svg>
    )
  },
  {
    type: 'roundedRect',
    label: 'Rounded',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
        <rect x="3" y="3" width="18" height="18" rx="5" />
      </svg>
    )
  },
  {
    type: 'circle',
    label: 'Circle',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
        <circle cx="12" cy="12" r="9" />
      </svg>
    )
  },
  {
    type: 'triangle',
    label: 'Triangle',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
        <polygon points="12,3 21,20 3,20" />
      </svg>
    )
  },
  {
    type: 'triangleDown',
    label: 'Down Tri',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
        <polygon points="3,4 21,4 12,21" />
      </svg>
    )
  },
  {
    type: 'diamond',
    label: 'Diamond',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
        <polygon points="12,2 22,12 12,22 2,12" />
      </svg>
    )
  },
  {
    type: 'pentagon',
    label: 'Pentagon',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
        <polygon points="12,2 22,9 18,22 6,22 2,9" />
      </svg>
    )
  },
  {
    type: 'hexagon',
    label: 'Hexagon',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
        <polygon points="12,2 21,7 21,17 12,22 3,17 3,7" />
      </svg>
    )
  },
  {
    type: 'octagon',
    label: 'Octagon',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
        <polygon points="8,2 16,2 22,8 22,16 16,22 8,22 2,16 2,8" />
      </svg>
    )
  },
  {
    type: 'star',
    label: 'Star',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
        <polygon points="12,2 15,9 22,9 16,14 18,21 12,17 6,21 8,14 2,9 9,9" />
      </svg>
    )
  },
  {
    type: 'arrow',
    label: 'Arrow',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
        <polygon points="3,9 14,9 14,4 22,12 14,20 14,15 3,15" />
      </svg>
    )
  },
  {
    type: 'arrow4',
    label: 'Double Arrow',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
        <polygon points="2,12 8,6 8,10 16,10 16,6 22,12 16,18 16,14 8,14 8,18" />
      </svg>
    )
  },
  {
    type: 'cross',
    label: 'Cross',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
        <polygon points="9,2 15,2 15,9 22,9 22,15 15,15 15,22 9,22 9,15 2,15 2,9 9,9" />
      </svg>
    )
  },
  {
    type: 'pill',
    label: 'Pill',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
        <rect x="2" y="5" width="20" height="14" rx="7" />
      </svg>
    )
  },
  {
    type: 'parallelogram',
    label: 'Parallelogram',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
        <polygon points="7,4 22,4 17,20 2,20" />
      </svg>
    )
  },
  {
    type: 'line',
    label: 'Divider Line',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5">
        <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    )
  },
  {
    type: 'curved-line',
    label: 'Curved Line',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
        <path d="M 3 17 C 8 7, 16 21, 21 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="3" cy="17" r="2.5" fill="currentColor" />
        <circle cx="21" cy="7" r="2.5" fill="currentColor" />
      </svg>
    )
  },
  {
    type: 'elbow-line',
    label: 'Elbow Line',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
        <path d="M 3 18 H 12 V 6 H 21" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="3" cy="18" r="2.5" fill="currentColor" />
        <circle cx="21" cy="6" r="2.5" fill="currentColor" />
      </svg>
    )
  }
];

function applyElementFill(obj: any, fill: string | undefined, w: number, h: number) {
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

const PRESET_HEADER_THEMES = [
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

const CANVAS_PAD_X = 80;
const CANVAS_PAD_Y = 80;

export const HeaderDesignerModal: React.FC = () => {
  const {
    isHeaderDesignerOpen,
    editingHeaderTemplate,
    setIsHeaderDesignerOpen,
    createSystemTemplate,
    updateSystemTemplate,
    fetchSystemTemplates,
    applyHeaderTemplate,
    updateProjectSettings,
    mediaItems,
    systemTemplates,
    deleteSystemTemplate,
    saveCatalog,
    catalog,
    uiTheme
  } = useStore();

  const isDark = uiTheme === 'dark';

  // Modal State
  const [templateName, setTemplateName] = useState<string>('My Custom Header');
  const [category, setCategory] = useState<string>('General');
  const [description, setDescription] = useState<string>('');
  const [headerHeight, setHeaderHeight] = useState<number>(113.4); // px
  const [headerBg, setHeaderBg] = useState<string>('#ffffff');
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'text' | 'shapes' | 'media' | 'background' | 'presets' | 'layers'>('text');
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
  const [colorPickerTarget, setColorPickerTarget] = useState<'bg' | 'element'>('bg');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [appliedSuccess, setAppliedSuccess] = useState<boolean>(false);

  const [activeColorMenu, setActiveColorMenu] = useState<'text' | 'shape' | null>(null);
  const colorMenuRef = useRef<HTMLDivElement>(null);

  const [isFontMenuOpen, setIsFontMenuOpen] = useState<boolean>(false);
  const [fontSearch, setFontSearch] = useState<string>('');
  const fontMenuRef = useRef<HTMLDivElement>(null);

  // Close floating popovers on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (colorMenuRef.current && !colorMenuRef.current.contains(e.target as Node)) {
        setActiveColorMenu(null);
      }
      if (fontMenuRef.current && !fontMenuRef.current.contains(e.target as Node)) {
        setIsFontMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredFonts = CATEGORIZED_FONTS.map(group => ({
    ...group,
    fonts: group.fonts.filter(f => f.toLowerCase().includes(fontSearch.toLowerCase()))
  })).filter(group => group.fonts.length > 0);

  // File upload input ref for custom logos
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Canvas Refs
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);

  const toMm = (px: number) => Math.round(px / PX_PER_MM);
  const toPx = (mm: number) => Math.round(mm * PX_PER_MM);

  // Initialize from editing template or current catalog header or default preset
  useEffect(() => {
    if (!isHeaderDesignerOpen) return;

    // Refresh saved header templates on opening modal
    fetchSystemTemplates();

    if (editingHeaderTemplate) {
      setTemplateName(editingHeaderTemplate.name || 'Custom Header');
      setCategory(editingHeaderTemplate.category || 'General');
      setDescription(editingHeaderTemplate.description || '');
      const pageData = editingHeaderTemplate.pages_data?.[0] || {};
      const rawH = pageData.height;
      const hHeight = (rawH && rawH >= toPx(15)) ? rawH : toPx(30);
      setHeaderHeight(hHeight);
      setHeaderBg(pageData.backgroundColor || '#ffffff');
      setElements(pageData.elements ? JSON.parse(JSON.stringify(pageData.elements)) : []);
    } else if (catalog.headerElements && catalog.headerElements.length > 0) {
      setTemplateName(`${catalog.name || 'Catalog'} Master Header`);
      const validH = (catalog.headerHeight && catalog.headerHeight >= toPx(15)) ? catalog.headerHeight : toPx(30);
      setHeaderHeight(validH);
      if (!catalog.headerHeight || catalog.headerHeight < toPx(15)) {
        updateProjectSettings({ headerHeight: toPx(30) });
      }
      setHeaderBg('#ffffff');
      setElements(JSON.parse(JSON.stringify(catalog.headerElements)));
    } else {
      // Default to Corporate Split preset (Standard 30mm)
      const defaultPreset = PRESET_HEADER_THEMES[0];
      setTemplateName('Corporate Minimal Header');
      setCategory(defaultPreset.category);
      setHeaderHeight(toPx(30));
      setHeaderBg(defaultPreset.backgroundColor);
      setElements(JSON.parse(JSON.stringify(defaultPreset.elements)));
    }
  }, [isHeaderDesignerOpen, editingHeaderTemplate]);

  // Selected element derived
  const selectedElement = elements.find(el => el.id === selectedId) || null;

  // Sync elements array updates helper
  const updateElementLocal = (id: string, updates: Partial<CanvasElement>) => {
    setElements(prev => prev.map(el => {
      if (el.id !== id) return el;
      const isLine = el.shapeType === 'line' || el.shapeType === 'curved-line' || el.shapeType === 'elbow-line' || (typeof el.id === 'string' && el.id.includes('line'));
      const finalUpdates = { ...updates };
      if (isLine) {
        if ('fill' in updates && !('stroke' in updates)) {
          finalUpdates.stroke = updates.fill;
        } else if ('stroke' in updates && !('fill' in updates)) {
          finalUpdates.fill = updates.stroke;
        }
      }
      return { ...el, ...finalUpdates };
    }));
  };

  // Remove element helper
  const deleteElementLocal = (id: string) => {
    setElements(prev => prev.filter(el => el.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  // Duplicate element helper
  const duplicateElementLocal = (id: string) => {
    const target = elements.find(el => el.id === id);
    if (!target) return;
    const newId = `hdr-copy-${Date.now()}`;
    const copy: CanvasElement = {
      ...JSON.parse(JSON.stringify(target)),
      id: newId,
      x: (target.x || 0) + 15,
      y: (target.y || 0) + 10,
      zIndex: (target.zIndex || 0) + 1
    };
    setElements(prev => [...prev, copy]);
    setSelectedId(newId);
  };

  // ─────────────────────────────────────────────────────────────
  // Layer Ordering & Arranging Helpers
  // ─────────────────────────────────────────────────────────────
  // In elements array: index 0 is Bottom (back), index (N-1) is Top (front)
  const bringToFront = (id: string) => {
    setElements(prev => {
      const idx = prev.findIndex(el => el.id === id);
      if (idx === -1 || idx === prev.length - 1) return prev;
      const target = prev[idx];
      const next = prev.filter(el => el.id !== id);
      next.push(target);
      return next.map((el, i) => ({ ...el, zIndex: i }));
    });
  };

  const sendToBack = (id: string) => {
    setElements(prev => {
      const idx = prev.findIndex(el => el.id === id);
      if (idx === -1 || idx === 0) return prev;
      const target = prev[idx];
      const next = prev.filter(el => el.id !== id);
      next.unshift(target);
      return next.map((el, i) => ({ ...el, zIndex: i }));
    });
  };

  const moveForward = (id: string) => {
    setElements(prev => {
      const idx = prev.findIndex(el => el.id === id);
      if (idx === -1 || idx === prev.length - 1) return prev;
      const next = [...prev];
      const temp = next[idx];
      next[idx] = next[idx + 1];
      next[idx + 1] = temp;
      return next.map((el, i) => ({ ...el, zIndex: i }));
    });
  };

  const moveBackward = (id: string) => {
    setElements(prev => {
      const idx = prev.findIndex(el => el.id === id);
      if (idx === -1 || idx === 0) return prev;
      const next = [...prev];
      const temp = next[idx];
      next[idx] = next[idx - 1];
      next[idx - 1] = temp;
      return next.map((el, i) => ({ ...el, zIndex: i }));
    });
  };

  const [draggedLayerId, setDraggedLayerId] = useState<string | null>(null);

  const reorderLayer = (draggedId: string, targetId: string) => {
    if (draggedId === targetId) return;
    setElements(prev => {
      const fromIdx = prev.findIndex(el => el.id === draggedId);
      const toIdx = prev.findIndex(el => el.id === targetId);
      if (fromIdx === -1 || toIdx === -1) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next.map((el, i) => ({ ...el, zIndex: i }));
    });
  };

  // ─────────────────────────────────────────────────────────────
  // Fabric Canvas Lifecycle & Synchronization
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!canvasElRef.current || !isHeaderDesignerOpen) return;

    const canvas = new Canvas(canvasElRef.current, {
      width: (PAGE_WIDTH + CANVAS_PAD_X * 2) * zoom,
      height: (headerHeight + CANVAS_PAD_Y * 2) * zoom,
      backgroundColor: 'transparent',
      selection: true,
      selectionColor: 'rgba(15, 61, 62, 0.12)',
      selectionBorderColor: '#0F3D3E',
      selectionLineWidth: 1.5,
      preserveObjectStacking: true,
      enableRetinaScaling: true,
    });
    canvas.setZoom(zoom);
    fabricCanvasRef.current = canvas;

    // Selection listeners
    canvas.on('selection:created', (e: any) => {
      const active = canvas.getActiveObject();
      if (active) {
        applyCanvaSelectionStyle(active);
        active.setCoords();
      }
      const ids = (e.selected || []).map((o: any) => o.id).filter(Boolean);
      if (ids.length > 0) setSelectedId(ids[0]);
    });

    canvas.on('selection:updated', (e: any) => {
      const active = canvas.getActiveObject();
      if (active) {
        applyCanvaSelectionStyle(active);
        active.setCoords();
      }
      const ids = (e.selected || []).map((o: any) => o.id).filter(Boolean);
      if (ids.length > 0) setSelectedId(ids[0]);
    });

    canvas.on('selection:cleared', () => {
      setSelectedId(null);
    });

    // Inline text changes listener
    canvas.on('text:changed', (e: any) => {
      const obj = e.target as any;
      if (obj && obj.id) {
        const fullW = Math.round(obj.getScaledWidth ? obj.getScaledWidth() : (obj.width || 200));
        const fullH = Math.round(obj.getScaledHeight ? obj.getScaledHeight() : (obj.height || 30));
        updateElementLocal(obj.id, {
          text: obj.text || '',
          width: fullW,
          height: fullH
        });
      }
    });

    // Object modified (dragged, scaled, rotated)
    canvas.on('object:modified', (e: any) => {
      const obj = e.target as any;
      if (!obj || !obj.id) return;

      const sx = Math.abs(obj.scaleX || 1);
      const sy = Math.abs(obj.scaleY || 1);

      const elObj = elements.find(item => item.id === obj.id);
      const isDivider = (typeof obj.id === 'string' && (
        obj.id.startsWith('hdr-div') ||
        obj.id.startsWith('hdr-dbl') ||
        obj.id.startsWith('hdr-shape') && elObj?.shapeType === 'line'
      )) || elObj?.shapeType === 'line' || obj.isDivider === true;

      // For lines/dividers with center origin, calculate top-left element coordinate for standard rendering
      let posX = Math.round((obj.left || 0) - CANVAS_PAD_X);
      let posY = Math.round((obj.top || 0) - CANVAS_PAD_Y);

      if (isDivider || obj.originX === 'center') {
        const objW = Math.round((obj.width || 0) * sx);
        const objH = Math.round((obj.height || 0) * sy);
        posX = Math.round((obj.left || 0) - objW / 2 - CANVAS_PAD_X);
        posY = Math.round((obj.top || 0) - objH / 2 - CANVAS_PAD_Y);
      }

      const updates: Partial<CanvasElement> = {
        x: posX,
        y: posY,
        rotation: Math.round(obj.angle || 0)
      };

      if (isDivider) {
        const newW = Math.max(10, Math.round((obj.width || 0) * sx));
        updates.width = newW;
        updates.height = elObj?.height || 2;
        obj.set({ width: newW, scaleX: 1, scaleY: 1 });
        obj.setCoords();
      } else if (obj instanceof IText || obj.type === 'i-text' || obj.type === 'text') {
        updates.width = Math.round((obj.width || 0) * sx);
        updates.text = obj.text || '';
        obj.set({ scaleX: 1, scaleY: 1 });
        obj.setCoords();
      } else if (obj instanceof Circle || obj.type === 'circle') {
        const newRadius = (obj.radius || (obj.width ? obj.width / 2 : 18)) * sx;
        const newD = Math.round(newRadius * 2);
        updates.width = newD;
        updates.height = newD;
        obj.set({ radius: newRadius, width: newD, height: newD, scaleX: 1, scaleY: 1 });
        obj.setCoords();
      } else if (obj instanceof Group || obj.type === 'group') {
        updates.width = Math.round((obj.width || 0) * sx);
        updates.height = Math.round((obj.height || 0) * sy);
        obj.setCoords();
      } else {
        const newW = Math.max(10, Math.round((obj.width || 0) * sx));
        const newH = Math.max(10, Math.round((obj.height || 0) * sy));
        updates.width = newW;
        updates.height = newH;
        obj.set({ width: newW, height: newH, scaleX: 1, scaleY: 1 });

        const el = elements.find(item => item.id === obj.id);
        if (el?.shapeType && obj.points) {
          const pts = getPolyPoints(el.shapeType, newW, newH);
          if (pts && pts.length >= 3) {
            obj.set({ points: pts });
          }
        }
        obj.setCoords();
      }

      updateElementLocal(obj.id, updates);
      canvas.requestRenderAll();
    });

    return () => {
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
  }, [isHeaderDesignerOpen]);

  // Handle Canvas Resizing & Zoom
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    canvas.setDimensions({
      width: (PAGE_WIDTH + CANVAS_PAD_X * 2) * zoom,
      height: (headerHeight + CANVAS_PAD_Y * 2) * zoom
    });
    canvas.setZoom(zoom);
    canvas.calcOffset();
    canvas.requestRenderAll();
  }, [zoom, headerHeight]);

  // Sync Elements into Fabric Objects
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    if ((canvas as any)._currentTransform) return;

    let isSubscribed = true;

    const syncFabricObjects = async () => {
      const existing = canvas.getObjects() as any[];
      const elIds = new Set(elements.map(el => el.id));

      // Remove deleted objects
      existing.forEach(obj => {
        if (obj.id && !elIds.has(obj.id)) {
          canvas.remove(obj);
        }
      });

      const existingMap = new Map<string, any>();
      canvas.getObjects().forEach((o: any) => {
        if (o.id) existingMap.set(o.id, o);
      });

      for (const el of elements) {
        if (!isSubscribed) return;
        let fabricObj = existingMap.get(el.id);

        if (fabricObj) {
          const isActiveObj = canvas.getActiveObjects().includes(fabricObj);

          if (!isActiveObj) {
            fabricObj.set({
              left: el.x + CANVAS_PAD_X,
              top: el.y + CANVAS_PAD_Y,
              width: el.width,
              height: el.height,
              angle: el.rotation || 0,
              scaleX: 1,
              scaleY: 1,
            });

            if (el.type === 'shape') {
              if (el.shapeType === 'circle' && fabricObj instanceof Circle) {
                fabricObj.set({ radius: Math.min(el.width, el.height) / 2 });
              } else if (el.shapeType && fabricObj.points) {
                const pts = getPolyPoints(el.shapeType, el.width, el.height);
                if (pts && pts.length >= 3) {
                  fabricObj.set({ points: pts });
                }
              }
            } else if (fabricObj instanceof Group) {
              const unscaledW = (fabricObj as any).width || 1;
              const unscaledH = (fabricObj as any).height || 1;
              fabricObj.set({
                scaleX: el.width / unscaledW,
                scaleY: el.height / unscaledH,
              });
            }
          }

          fabricObj.set({
            opacity: el.opacity ?? 1,
            zIndex: el.zIndex || 0,
          });

          if (el.type === 'text' && fabricObj instanceof IText) {
            fabricObj.set({
              text: el.text || '',
              fontSize: el.fontSize || 14,
              fontFamily: el.fontFamily || 'Inter',
              fontWeight: el.fontWeight || 'normal',
              fontStyle: el.fontStyle || 'normal',
              textAlign: el.textAlign || 'left',
              charSpacing: (el.letterSpacing || 0) * 10
            });
            applyElementFill(fabricObj, el.fill || '#000000', el.width, el.height);
          } else if (el.type === 'shape') {
            applyElementFill(fabricObj, el.fill || '#0F3D3E', el.width, el.height);
            fabricObj.set({
              stroke: el.stroke,
              strokeWidth: el.strokeWidth || 0
            });
          }
          fabricObj.setCoords();
        } else {
          // Create new Fabric object
          if (el.type === 'text') {
            fabricObj = new IText(el.text || 'Header Text', {
              left: el.x + CANVAS_PAD_X,
              top: el.y + CANVAS_PAD_Y,
              width: el.width,
              fontSize: el.fontSize || 14,
              fontFamily: el.fontFamily || 'Inter',
              fontWeight: el.fontWeight || 'normal',
              fontStyle: el.fontStyle || 'normal',
              textAlign: el.textAlign || 'left',
              charSpacing: (el.letterSpacing || 0) * 10,
              angle: el.rotation || 0,
              opacity: el.opacity ?? 1,
              originX: 'left',
              originY: 'top',
              editable: true
            });
            applyElementFill(fabricObj, el.fill || '#000000', el.width, el.height);
          } else if (el.type === 'shape') {
            fabricObj = buildShape(
              el.shapeType || 'rect',
              el.width,
              el.height,
              el.stroke,
              el.strokeWidth || 0,
              el.fill || '#0F3D3E',
              '#0F3D3E'
            );
            if (fabricObj) {
              fabricObj.set({
                left: el.x + CANVAS_PAD_X,
                top: el.y + CANVAS_PAD_Y,
                angle: el.rotation || 0,
                opacity: el.opacity ?? 1,
                originX: 'left',
                originY: 'top',
              });
              applyElementFill(fabricObj, el.fill || '#0F3D3E', el.width, el.height);
              applyCanvaSelectionStyle(fabricObj);
            }
          } else if (el.type === 'image' && el.src) {
            try {
              fabricObj = await FabricImage.fromURL(el.src, { crossOrigin: 'anonymous' });
              fabricObj.set({
                left: el.x + CANVAS_PAD_X,
                top: el.y + CANVAS_PAD_Y,
                scaleX: el.width / (fabricObj.width || el.width),
                scaleY: el.height / (fabricObj.height || el.height),
                originX: 'left',
                originY: 'top'
              });
            } catch (err) {
              console.warn('Failed to load image in header designer', err);
            }
          }

          if (fabricObj) {
            fabricObj.id = el.id;
            applyCanvaSelectionStyle(fabricObj);
            canvas.add(fabricObj);
          }
        }
      }

      // Sort canvas objects strictly in the order of elements array
      const orderMap = new Map(elements.map((el, i) => [el.id, i]));
      (canvas as any)._objects.sort((a: any, b: any) => {
        const orderA = orderMap.has(a.id) ? orderMap.get(a.id)! : 0;
        const orderB = orderMap.has(b.id) ? orderMap.get(b.id)! : 0;
        return orderA - orderB;
      });
      canvas.requestRenderAll();
    };

    syncFabricObjects();

    return () => {
      isSubscribed = false;
    };
  }, [elements]);

  // Sync selectedId with active object on canvas
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    if (!selectedId) {
      if (canvas.getActiveObject()) {
        canvas.discardActiveObject();
        canvas.requestRenderAll();
      }
      return;
    }
    const currentActive = canvas.getActiveObject() as any;
    if (currentActive && currentActive.id === selectedId) return;

    const target = canvas.getObjects().find((o: any) => o.id === selectedId);
    if (target) {
      canvas.setActiveObject(target);
      applyCanvaSelectionStyle(target);
      target.setCoords();
      canvas.requestRenderAll();
    }
  }, [selectedId]);

  // ─────────────────────────────────────────────────────────────
  // Element Insertion Handlers
  // ─────────────────────────────────────────────────────────────
  const addTextElement = (text: string, fontSize = 14, fontWeight = 'normal', isTag = false) => {
    const newId = `hdr-txt-${Date.now()}`;
    const newEl: CanvasElement = {
      id: newId,
      type: 'text',
      x: 50,
      y: Math.max(15, (headerHeight - 30) / 2),
      width: isTag ? 260 : 300,
      height: 30,
      text: text,
      fontSize: fontSize,
      fontFamily: 'Inter',
      fontWeight: fontWeight,
      fill: isDark ? '#ffffff' : '#0f172a',
      textAlign: 'left',
      letterSpacing: isTag ? 1.5 : 0,
      rotation: 0,
      opacity: 1,
      zIndex: elements.length + 1
    };
    setElements(prev => [...prev, newEl]);
    setSelectedId(newId);
  };

  const addShapeElement = (shapeType: ShapeType) => {
    const newId = `hdr-shape-${Date.now()}`;
    const isStraightLine = shapeType === 'line';
    const isCurvedLine = shapeType === 'curved-line';
    const isElbowLine = shapeType === 'elbow-line';
    const isLineAny = isStraightLine || isCurvedLine || isElbowLine;
    const isPill = shapeType === 'pill';
    const isArrow = shapeType === 'arrow' || shapeType === 'arrow4';

    const w = isLineAny ? 260 : isPill ? 90 : isArrow ? 60 : 36;
    const h = isStraightLine ? 2 : (isCurvedLine || isElbowLine) ? 30 : isPill ? 24 : isArrow ? 20 : 36;
    const initialY = Math.max(5, Math.round((headerHeight - h) / 2));
    const initialX = Math.round((PAGE_WIDTH - w) / 2);

    const newShapeEl: CanvasElement = {
      id: newId,
      type: 'shape',
      shapeType,
      x: initialX,
      y: initialY,
      width: w,
      height: h,
      fill: isLineAny ? '#cbd5e1' : '#0F3D3E',
      stroke: isLineAny ? '#cbd5e1' : undefined,
      strokeWidth: isLineAny ? 2.5 : 0,
      rotation: 0,
      opacity: 1,
      zIndex: elements.length + 1
    };

    setElements(prev => [...prev, newShapeEl]);
    setSelectedId(newId);
  };

  const addImageLogo = (src: string) => {
    const newId = `hdr-logo-${Date.now()}`;
    const logoEl: CanvasElement = {
      id: newId,
      type: 'image',
      x: 38,
      y: 20,
      width: 90,
      height: 45,
      src: src,
      rotation: 0,
      opacity: 1,
      zIndex: elements.length + 1
    };
    setElements(prev => [...prev, logoEl]);
    setSelectedId(newId);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const base64 = loadEvt.target?.result as string;
      if (base64) {
        addImageLogo(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  // ─────────────────────────────────────────────────────────────
  // Save & Apply Actions
  // ─────────────────────────────────────────────────────────────
  const handleSaveTheme = async () => {
    setIsSaving(true);
    try {
      const canvas = fabricCanvasRef.current;
      const canvasObjects = canvas ? canvas.getObjects() : [];
      const syncedElements = elements.map(el => {
        const liveObj = canvasObjects.find((o: any) => o.id === el.id);
        let effectiveW = el.width;
        let effectiveH = el.height;
        if (liveObj) {
          effectiveW = Math.round(liveObj.getScaledWidth ? liveObj.getScaledWidth() : (liveObj.width || el.width));
          effectiveH = Math.round(liveObj.getScaledHeight ? liveObj.getScaledHeight() : (liveObj.height || el.height));
        }
        return {
          ...el,
          width: effectiveW,
          height: effectiveH
        };
      });

      const templateData = {
        name: templateName.trim() || 'Custom Header',
        category: category.trim() || 'Custom',
        type: 'header' as const,
        description: description || `Custom header theme with ${syncedElements.length} elements`,
        pages_data: [
          {
            height: headerHeight,
            backgroundColor: headerBg,
            elements: syncedElements
          }
        ],
        is_active: true
      };

      let res;
      if (editingHeaderTemplate && (editingHeaderTemplate.id || editingHeaderTemplate.uuid)) {
        res = await updateSystemTemplate(editingHeaderTemplate.id || editingHeaderTemplate.uuid, templateData);
      } else {
        res = await createSystemTemplate(templateData);
      }

      if (res) {
        await fetchSystemTemplates();
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save header theme:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplyToCatalog = () => {
    // Apply directly to open catalog
    updateProjectSettings({
      hasHeader: true,
      headerHeight: headerHeight
    });

    const canvas = fabricCanvasRef.current;
    const canvasObjects = canvas ? canvas.getObjects() : [];
    const elementsToApply = elements.map((el, i) => {
      const liveObj = canvasObjects.find((o: any) => o.id === el.id);
      let effectiveW = el.width;
      let effectiveH = el.height;
      if (liveObj) {
        effectiveW = Math.round(liveObj.getScaledWidth ? liveObj.getScaledWidth() : (liveObj.width || el.width));
        effectiveH = Math.round(liveObj.getScaledHeight ? liveObj.getScaledHeight() : (liveObj.height || el.height));
      }
      return {
        ...el,
        width: effectiveW,
        height: effectiveH,
        zIndex: el.zIndex !== undefined ? el.zIndex : i + 1
      };
    });

    if (headerBg && headerBg !== 'transparent') {
      const hasBgRect = elementsToApply.some(el => el.id?.startsWith('hdr-bg') || (el.type === 'shape' && (el.width || 0) >= PAGE_WIDTH && (el.height || 0) >= headerHeight));
      if (!hasBgRect) {
        elementsToApply.unshift({
          id: `hdr-bg-${Date.now()}`,
          type: 'shape',
          shapeType: 'rect',
          x: 0,
          y: 0,
          width: PAGE_WIDTH,
          height: headerHeight,
          fill: headerBg,
          rotation: 0,
          opacity: 1,
          zIndex: 0,
          locked: true
        });
      }
    }

    applyHeaderTemplate({
      id: `custom-hdr-${Date.now()}`,
      name: templateName,
      description: description,
      type: 'header',
      height: headerHeight,
      previewText: templateName,
      elements: elementsToApply
    });

    setAppliedSuccess(true);
    setTimeout(() => setAppliedSuccess(false), 2500);

    // Auto-save the catalog to backend so browser refresh preserves the applied header!
    setTimeout(() => {
      saveCatalog().catch(err => console.warn('Auto-saving catalog after applying header:', err));
    }, 150);
  };

  const applyPreset = (preset: typeof PRESET_HEADER_THEMES[0]) => {
    setTemplateName(preset.name);
    setCategory(preset.category);
    setHeaderHeight(preset.height);
    setHeaderBg(preset.backgroundColor);
    setElements(JSON.parse(JSON.stringify(preset.elements)));
    setSelectedId(null);
  };

  if (!isHeaderDesignerOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-[#0b0b0c] text-white font-sans select-none animate-in fade-in duration-200">
      
      {/* ── Top Header Navigation Bar ────────────────────────────── */}
      <div className="h-16 px-5 bg-[#121214] border-b border-[#262626] flex items-center justify-between shrink-0 shadow-lg">
        <div className="flex items-center gap-3.5">
          {/* Back to Project Button */}
          <button
            onClick={() => setIsHeaderDesignerOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-[6px] bg-[#1a1a1c] hover:bg-[#252528] text-white border border-[#38383c] hover:border-[#E2DCC8]/50 transition-all shadow-sm group"
            title="Back to Catalog Project"
          >
            <ArrowLeft size={16} className="text-[#E2DCC8] group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-xs font-bold text-[#E2DCC8]">Back to Project</span>
          </button>

          <div className="h-6 w-px bg-[#28282c]" />

          <div className="w-10 h-10 rounded-[6px] bg-gradient-to-br from-[#0F3D3E] to-[#100F0F] border border-[#E2DCC8]/30 flex items-center justify-center text-[#E2DCC8] shadow-md shrink-0">
            <Layout size={20} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="bg-transparent border-b border-transparent hover:border-[#E2DCC8]/40 focus:border-[#E2DCC8] text-base font-black text-white px-1 py-0.5 outline-none transition-all w-64 md:w-80"
                placeholder="Header Theme Name..."
              />
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#0F3D3E]/30 text-[#E2DCC8] border border-[#E2DCC8]/20 px-2 py-0.5 rounded-full">
                Header Studio
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#888888] mt-0.5 pl-1">
              <span>Width: <strong className="text-slate-300">794px</strong> (Catalog Width)</span>
              <span>•</span>
              <span>Height: <strong className="text-slate-300">{Math.round(headerHeight)}px</strong> ({toMm(headerHeight)}mm)</span>
            </div>
          </div>
        </div>

        {/* Action Controls in Top Bar */}
        <div className="flex items-center gap-2.5">
          {/* Height Adjuster Pill */}
          <div className="flex items-center gap-2 bg-[#18181b] border border-[#2a2a2e] px-3 py-1.5 rounded-[6px]">
            <span className="text-[11px] font-bold text-[#888888] uppercase tracking-wider">Height</span>
            <input
              type="range"
              min={15}
              max={60}
              step={1}
              value={Math.max(15, Math.min(60, toMm(headerHeight) >= 15 ? toMm(headerHeight) : 30))}
              onChange={(e) => setHeaderHeight(toPx(Number(e.target.value)))}
              className="w-20 h-1.5 rounded-full appearance-none cursor-pointer accent-[#0F3D3E] bg-[#333333]"
            />
            <span className="text-xs font-bold text-[#E2DCC8] w-10 text-right font-mono">
              {Math.max(15, Math.min(60, toMm(headerHeight) >= 15 ? toMm(headerHeight) : 30))}mm
            </span>
          </div>

          {/* Apply to Catalog Button */}
          <button
            onClick={handleApplyToCatalog}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#1c1c1f] hover:bg-[#252528] border border-[#38383c] hover:border-[#E2DCC8]/50 text-white rounded-[6px] text-xs font-bold transition-all shadow-sm"
            title="Apply this designed header directly to the currently opened catalog"
          >
            {appliedSuccess ? (
              <>
                <CheckCircle2 size={15} className="text-emerald-400" />
                <span className="text-emerald-400">Applied!</span>
              </>
            ) : (
              <>
                <Sparkles size={15} className="text-[#E2DCC8]" />
                <span>Apply to Catalog</span>
              </>
            )}
          </button>

          {/* Save as Theme Button */}
          <button
            onClick={handleSaveTheme}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0F3D3E] to-[#144f51] hover:from-[#134d4f] hover:to-[#175b5d] border border-[#E2DCC8]/40 text-[#E2DCC8] rounded-[6px] text-xs font-black uppercase tracking-wider transition-all shadow-lg hover:shadow-cyan-950/40"
          >
            {savedSuccess ? (
              <>
                <Check size={16} className="text-emerald-300" />
                <span className="text-emerald-300">Saved to Themes!</span>
              </>
            ) : isSaving ? (
              <span>Saving...</span>
            ) : (
              <>
                <Save size={15} />
                <span>Save Header Theme</span>
              </>
            )}
          </button>

          {/* Close Studio Button */}
          <button
            onClick={() => setIsHeaderDesignerOpen(false)}
            className="p-2 rounded-[6px] bg-[#18181b] hover:bg-[#26262a] border border-[#2a2a2e] text-[#888888] hover:text-white transition-colors ml-1"
            title="Close Header Designer"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* ── Main Workspace Body ───────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar Tools */}
        <div className="w-80 bg-[#141416] border-r border-[#262626] flex flex-col shrink-0">
          
          {/* Sidebar Tab Selector */}
          <div className="grid grid-cols-5 p-2 gap-1 border-b border-[#262626] bg-[#101012]">
            {[
              { id: 'text', label: 'Text', icon: Type },
              { id: 'shapes', label: 'Shapes', icon: Square },
              { id: 'media', label: 'Logos', icon: ImageIcon },
              { id: 'background', label: 'Theme', icon: Palette },
              { id: 'presets', label: 'Presets', icon: Sparkles }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex flex-col items-center justify-center py-2 rounded-[4px] text-[10px] font-bold transition-all ${
                    isActive
                      ? 'bg-[#0F3D3E] text-white shadow'
                      : 'text-[#888888] hover:text-white hover:bg-[#1a1a1c]'
                  }`}
                >
                  <Icon size={14} className="mb-1" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            
            {/* TAB 1: TEXT & SMART DYNAMIC TAGS */}
            {activeTab === 'text' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#E2DCC8] mb-1">
                    Standard Text Elements
                  </h4>
                  <p className="text-[11px] text-[#888888] mb-3">
                    Add standard typography to your header.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => addTextElement('CATALOG HEADER', 18, 'bold')}
                      className="p-3 bg-[#1a1a1c] hover:bg-[#222226] border border-[#2a2a2e] hover:border-[#E2DCC8]/40 rounded-[6px] text-left transition-all group"
                    >
                      <span className="block text-sm font-bold text-white group-hover:text-[#E2DCC8]">Headline</span>
                      <span className="text-[10px] text-[#777]">Bold title (18px)</span>
                    </button>

                    <button
                      onClick={() => addTextElement('Subheading Text', 12, '600')}
                      className="p-3 bg-[#1a1a1c] hover:bg-[#222226] border border-[#2a2a2e] hover:border-[#E2DCC8]/40 rounded-[6px] text-left transition-all group"
                    >
                      <span className="block text-sm font-semibold text-white group-hover:text-[#E2DCC8]">Subtitle</span>
                      <span className="text-[10px] text-[#777]">Medium (12px)</span>
                    </button>

                    <button
                      onClick={() => addTextElement('www.company.com', 10, 'normal')}
                      className="p-3 bg-[#1a1a1c] hover:bg-[#222226] border border-[#2a2a2e] hover:border-[#E2DCC8]/40 rounded-[6px] text-left transition-all group"
                    >
                      <span className="block text-sm text-slate-300 group-hover:text-[#E2DCC8]">Caption / URL</span>
                      <span className="text-[10px] text-[#777]">Light spec (10px)</span>
                    </button>

                    <button
                      onClick={() => addTextElement('— EDITION 2026 —', 11, 'bold')}
                      className="p-3 bg-[#1a1a1c] hover:bg-[#222226] border border-[#2a2a2e] hover:border-[#E2DCC8]/40 rounded-[6px] text-left transition-all group"
                    >
                      <span className="block text-sm font-bold text-[#E2DCC8] tracking-widest">Decorated</span>
                      <span className="text-[10px] text-[#777]">Centered dash</span>
                    </button>
                  </div>
                </div>

                {/* Smart Dynamic Tags Group */}
                <div className="pt-2 border-t border-[#262626]">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Tag size={13} className="text-[#E2DCC8]" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-[#E2DCC8]">
                      Smart Dynamic Tags
                    </h4>
                  </div>
                  <p className="text-[11px] text-[#888888] mb-3">
                    These tags auto-replace with each catalog's name, current page, and category!
                  </p>

                  <div className="space-y-1.5">
                    {[
                      { tag: '{{catalog_name}}', label: 'Catalog Title', desc: 'Auto replaces with catalog name' },
                      { tag: '{{category_name}}', label: 'Category Name', desc: 'Current page category name' },
                      { tag: '{{page_number}}', label: 'Current Page #', desc: 'Dynamic running page number' },
                      { tag: '{{total_pages}}', label: 'Total Pages Count', desc: 'Total catalog page count' },
                      { tag: '{{company_name}}', label: 'Company / Brand', desc: 'Store owner / company name' },
                      { tag: '{{current_year}}', label: 'Current Year', desc: 'e.g. 2026' }
                    ].map(item => (
                      <button
                        key={item.tag}
                        onClick={() => addTextElement(item.tag, 11, '600', true)}
                        className="w-full p-2.5 bg-[#1a1a1c] hover:bg-[#222226] border border-[#2a2a2e] hover:border-[#E2DCC8]/40 rounded-[6px] flex items-center justify-between transition-all group text-left"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white group-hover:text-[#E2DCC8]">{item.label}</span>
                            <span className="font-mono text-[9px] bg-[#0F3D3E]/30 text-[#E2DCC8] px-1.5 py-0.5 rounded border border-[#E2DCC8]/20">
                              {item.tag}
                            </span>
                          </div>
                          <p className="text-[10px] text-[#777] mt-0.5">{item.desc}</p>
                        </div>
                        <Plus size={14} className="text-[#888] group-hover:text-white" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: SHAPES & GEOMETRIC ELEMENTS */}
            {activeTab === 'shapes' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#E2DCC8] mb-1">
                    Geometric Shapes
                  </h4>
                  <p className="text-[11px] text-[#888888] mb-3">
                    Click to add shapes, badges, icons, and dividers to your header.
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    {HEADER_SHAPES.map((shape) => (
                      <button
                        key={shape.type}
                        onClick={() => addShapeElement(shape.type)}
                        className="p-3 bg-[#1a1a1c] hover:bg-[#252528] border border-[#2a2a2e] hover:border-[#E2DCC8]/40 rounded-[6px] flex flex-col items-center justify-center gap-2 transition-all group shadow-sm hover:shadow-cyan-950/20"
                        title={`Add ${shape.label} shape`}
                      >
                        <div className="w-9 h-9 rounded bg-[#121214] border border-[#2e2e32] group-hover:border-[#E2DCC8]/50 flex items-center justify-center text-[#E2DCC8] transition-colors">
                          {shape.icon}
                        </div>
                        <span className="text-[10px] font-bold text-slate-300 group-hover:text-white transition-colors">
                          {shape.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: LOGOS & MEDIA */}
            {activeTab === 'media' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#E2DCC8] mb-1">
                    Upload Brand Logo
                  </h4>
                  <p className="text-[11px] text-[#888888] mb-3">
                    Insert your company or brand logo directly into the header.
                  </p>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#0F3D3E]/30 to-[#100F0F] hover:bg-[#0F3D3E]/50 border border-[#E2DCC8]/40 rounded-[6px] text-xs font-bold text-[#E2DCC8] transition-all shadow-sm"
                  >
                    <Upload size={15} />
                    <span>Upload Logo Image</span>
                  </button>
                </div>

                {/* Uploaded Media from store */}
                <div className="pt-2 border-t border-[#262626]">
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#E2DCC8] mb-1">
                    From Media Library
                  </h4>
                  <p className="text-[10px] text-[#888888] mb-2">
                    Click any uploaded image to place it on the header.
                  </p>

                  {mediaItems && mediaItems.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto p-1 custom-scrollbar">
                      {mediaItems.map(item => (
                        <div
                          key={item.id}
                          onClick={() => addImageLogo(item.url)}
                          className="aspect-video bg-[#18181a] border border-[#2a2a2e] hover:border-[#E2DCC8] rounded cursor-pointer overflow-hidden p-1 flex items-center justify-center transition-all group"
                        >
                          <img
                            src={item.url}
                            alt={item.name}
                            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-[6px] border border-dashed border-[#333] text-center">
                      <ImageIcon size={20} className="mx-auto text-[#666] mb-1" />
                      <p className="text-[11px] text-[#888]">No media assets yet.</p>
                      <p className="text-[9px] text-[#666]">Upload your logo above.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: HEADER BACKGROUND & THEME */}
            {activeTab === 'background' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#E2DCC8] mb-1">
                    Header Strip Background
                  </h4>
                  <p className="text-[11px] text-[#888888] mb-3">
                    Solid color or linear gradient across the header strip.
                  </p>

                  {/* Current Background Preview */}
                  <div
                    onClick={() => {
                      setColorPickerTarget('bg');
                      setShowColorPicker(true);
                    }}
                    className="p-3 rounded-[6px] border border-[#38383c] hover:border-[#E2DCC8] cursor-pointer transition-all flex items-center justify-between mb-3"
                    style={{ background: headerBg }}
                  >
                    <span className="text-xs font-black px-2 py-1 bg-black/60 rounded text-white shadow">
                      Current Background
                    </span>
                    <Palette size={16} className="text-white drop-shadow" />
                  </div>

                  {/* Palette Swatches */}
                  <div className="grid grid-cols-5 gap-2 mb-3">
                    {[
                      '#ffffff', '#0f172a', '#081c1c', '#18181b', '#f8fafc',
                      'linear-gradient(90deg, #0f172a, #1e293b)',
                      'linear-gradient(90deg, #081c1c, #0f3d3e)',
                      'linear-gradient(90deg, #4f46e5, #06b6d4)',
                      'linear-gradient(90deg, #111827, #374151)',
                      'linear-gradient(90deg, #312e81, #1e1b4b)'
                    ].map((bg, idx) => (
                      <button
                        key={idx}
                        onClick={() => setHeaderBg(bg)}
                        className="h-7 rounded-[4px] border border-white/20 hover:scale-105 transition-all shadow-sm"
                        style={{ background: bg }}
                        title={bg}
                      />
                    ))}
                  </div>

                  {/* Advanced Color Picker Trigger */}
                  <button
                    onClick={() => {
                      setColorPickerTarget('bg');
                      setShowColorPicker(!showColorPicker);
                    }}
                    className="w-full py-2 bg-[#1a1a1c] hover:bg-[#242428] border border-[#333] rounded-[6px] text-xs font-bold text-[#E2DCC8] flex items-center justify-center gap-2"
                  >
                    <Palette size={14} />
                    <span>{showColorPicker ? 'Hide Color Studio' : 'Open Color & Gradient Studio'}</span>
                  </button>

                  {showColorPicker && colorPickerTarget === 'bg' && (
                    <div className="p-3 bg-[#18181a] border border-[#333] rounded-[6px] mt-2 animate-in fade-in">
                      <AdvancedColorPicker
                        color={headerBg}
                        onChange={(newColor) => setHeaderBg(newColor)}
                      />
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-[#262626]">
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#E2DCC8] mb-1">
                    Category Tag
                  </h4>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#18181a] border border-[#2a2a2e] focus:border-[#E2DCC8] text-xs text-white p-2 rounded-[4px] outline-none"
                    placeholder="e.g. Corporate, Luxury, Industrial"
                  />
                </div>
              </div>
            )}

            {/* TAB 5: PRESETS / STARTERS & SAVED THEMES */}
            {activeTab === 'presets' && (
              <div className="space-y-4">
                {/* Saved User Themes */}
                {(() => {
                  const savedHeaders = systemTemplates.filter(st => st.is_active && st.type === 'header');
                  if (savedHeaders.length === 0) return null;

                  return (
                    <div className="space-y-2.5 pb-3 border-b border-[#28282c]">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black uppercase tracking-wider text-[#E2DCC8] flex items-center gap-1.5">
                          <Sparkles size={12} className="text-cyan-400" />
                          <span>My Saved Header Themes</span>
                        </h4>
                        <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-800/40">
                          {savedHeaders.length} Saved
                        </span>
                      </div>
                      <p className="text-[11px] text-[#888888]">
                        Themes you saved to database. Click to load into studio.
                      </p>

                      <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar p-0.5">
                        {savedHeaders.map(tmpl => {
                          const pData = tmpl.pages_data?.[0];
                          const bg = pData?.backgroundColor || '#ffffff';
                          const h = pData?.height || 113.4;

                          return (
                            <div
                              key={`saved-${tmpl.id || tmpl.uuid}`}
                              onClick={() => {
                                setTemplateName(tmpl.name);
                                setCategory(tmpl.category || 'General');
                                setDescription(tmpl.description || '');
                                if (pData) {
                                  setHeaderHeight(h);
                                  setHeaderBg(bg);
                                  setElements(JSON.parse(JSON.stringify(pData.elements || [])));
                                }
                                setSelectedId(null);
                              }}
                              className="p-2.5 bg-[#17171a] hover:bg-[#202025] border border-cyan-900/40 hover:border-cyan-500 rounded-[6px] cursor-pointer transition-all group relative"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-bold text-white group-hover:text-cyan-300 truncate max-w-[150px]">
                                  {tmpl.name}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[9px] bg-cyan-950/80 text-cyan-400 px-1.5 py-0.5 rounded font-mono font-bold">
                                    {toMm(h)}mm
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (confirm(`Delete saved header theme "${tmpl.name}"?`)) {
                                        deleteSystemTemplate(tmpl.id || tmpl.uuid);
                                      }
                                    }}
                                    className="p-1 text-[#666] hover:text-rose-400 hover:bg-rose-950/50 rounded transition-all"
                                    title="Delete this saved theme"
                                  >
                                    <Trash2 size={11} />
                                  </button>
                                </div>
                              </div>

                              {/* Preview Mini Strip */}
                              <div
                                className="w-full h-7 rounded border border-white/10 my-1 flex items-center justify-between px-2.5 text-[9px] font-mono truncate"
                                style={{ background: bg }}
                              >
                                <span className={bg === '#ffffff' || bg === '#fafafa' ? 'text-slate-800 font-bold' : 'text-white font-bold'}>
                                  {tmpl.name.toUpperCase()}
                                </span>
                                <span className="text-[8px] text-[#888]">
                                  {pData?.elements?.length || 0} items
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* Starter Header Themes */}
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#E2DCC8] mb-1">
                    Starter Header Themes
                  </h4>
                  <p className="text-[11px] text-[#888888] mb-3">
                    Select a curated layout to start or customize.
                  </p>
                </div>

                {PRESET_HEADER_THEMES.map(preset => (
                  <div
                    key={preset.id}
                    onClick={() => applyPreset(preset)}
                    className="p-3 bg-[#18181b] hover:bg-[#202024] border border-[#2a2a2e] hover:border-[#0F3D3E] rounded-[6px] cursor-pointer transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white group-hover:text-[#E2DCC8]">
                        {preset.name}
                      </span>
                      <span className="text-[9px] bg-[#0F3D3E]/30 text-[#E2DCC8] px-1.5 py-0.5 rounded font-bold">
                        {preset.category}
                      </span>
                    </div>

                    {/* Preview Strip */}
                    <div
                      className="w-full h-8 rounded border border-black/20 my-1.5 flex items-center justify-between px-3 text-[9px] font-mono truncate"
                      style={{ background: preset.backgroundColor }}
                    >
                      <span className={preset.backgroundColor === '#ffffff' || preset.backgroundColor === '#fafafa' ? 'text-slate-800 font-bold' : 'text-white font-bold'}>
                        {preset.name.toUpperCase()}
                      </span>
                      <span className={preset.backgroundColor === '#ffffff' || preset.backgroundColor === '#fafafa' ? 'text-slate-500' : 'text-cyan-400'}>
                        PAGE 1
                      </span>
                    </div>

                    <span className="text-[10px] text-[#888] group-hover:text-slate-300">
                      Click to load layout into designer
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Center Editor Canvas Area ─────────────────────────────── */}
        <div className="flex-1 bg-[#0e0e10] flex flex-col overflow-hidden relative">
          
          {/* Top Canvas Bar: Selection Controls & Precision Zoom */}
          <div className="h-12 px-5 bg-[#141416] border-b border-[#262626] flex items-center justify-between shrink-0">
            
            {/* Selected Element Quick Properties */}
            {selectedElement ? (
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-[#E2DCC8] flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  {selectedElement.type === 'text' ? 'Text' : selectedElement.type === 'shape' ? 'Shape' : 'Image'}
                </span>

                <div className="h-4 w-px bg-[#333] mx-1" />

                {selectedElement.type === 'text' && (
                  <>
                    {/* Font Family Dropdown */}
                    <div className="relative" ref={fontMenuRef}>
                      <button
                        onClick={() => setIsFontMenuOpen(!isFontMenuOpen)}
                        className={`h-7 px-2.5 rounded-[4px] border flex items-center justify-between gap-1.5 min-w-[110px] max-w-[150px] transition-all ${
                          isFontMenuOpen
                            ? 'bg-[#0F3D3E] border-[#E2DCC8]/60 text-white shadow'
                            : 'bg-[#1a1a1c] hover:bg-[#252528] border-[#38383c] hover:border-[#E2DCC8]/40 text-white'
                        }`}
                        title="Change Font Family"
                      >
                        <span
                          className="truncate text-xs font-semibold flex-1 text-left"
                          style={{ fontFamily: selectedElement.fontFamily || 'Inter' }}
                        >
                          {selectedElement.fontFamily || 'Inter'}
                        </span>
                        <ChevronDown size={11} className={`text-[#888] shrink-0 transition-transform ${isFontMenuOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isFontMenuOpen && (
                        <div className="absolute top-full left-0 mt-1.5 w-64 bg-[#18181b] border border-[#38383c] rounded-[8px] shadow-2xl overflow-hidden z-[110] animate-in fade-in zoom-in-95 flex flex-col text-[#EDEDED]">
                          {/* Search Header */}
                          <div className="p-2 border-b border-[#28282c] bg-[#121214] flex items-center gap-2 sticky top-0 z-10">
                            <Search size={13} className="text-[#888]" />
                            <input
                              autoFocus
                              type="text"
                              placeholder="Search fonts..."
                              value={fontSearch}
                              onChange={e => setFontSearch(e.target.value)}
                              className="w-full bg-transparent border-none outline-none text-xs font-bold text-[#F1F1F1] placeholder:text-[#666]"
                            />
                            {fontSearch && (
                              <button onClick={() => setFontSearch('')} className="text-[#666] hover:text-white text-[10px]">
                                <X size={11} />
                              </button>
                            )}
                          </div>

                          {/* Font List */}
                          <div className="max-h-60 overflow-y-auto custom-scrollbar p-1.5 flex flex-col gap-1 overscroll-contain">
                            {filteredFonts.map(group => (
                              <div key={group.label} className="flex flex-col mb-1 last:mb-0">
                                <div className="px-2 py-1 text-[9px] font-black text-[#E2DCC8]/60 uppercase tracking-widest bg-white/[0.03] rounded mb-0.5">
                                  {group.label}
                                </div>
                                <div className="flex flex-col">
                                  {group.fonts.map(f => {
                                    const isCurrent = (selectedElement.fontFamily || 'Inter') === f;
                                    return (
                                      <button
                                        key={f}
                                        onClick={() => {
                                          updateElementLocal(selectedElement.id, { fontFamily: f });
                                          if (typeof document !== 'undefined' && document.fonts) {
                                            document.fonts.load(`16px "${f}"`).then(() => {
                                              fabricCanvasRef.current?.requestRenderAll();
                                            }).catch(() => {});
                                          }
                                          setIsFontMenuOpen(false);
                                        }}
                                        className={`w-full text-left px-2.5 py-1.5 text-xs rounded transition-all flex items-center justify-between ${
                                          isCurrent
                                            ? 'bg-[#0F3D3E] text-white font-bold border border-[#E2DCC8]/30 shadow-sm'
                                            : 'text-gray-300 hover:bg-[#222226] hover:text-white'
                                        }`}
                                      >
                                        <span style={{ fontFamily: f }} className="truncate">
                                          {f}
                                        </span>
                                        {isCurrent && <Check size={12} className="text-[#E2DCC8] shrink-0" />}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}

                            {filteredFonts.length === 0 && (
                              <div className="py-6 text-center text-[#666] text-xs font-medium">
                                No fonts found
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Font Size with Minus / Plus */}
                    <div className="flex items-center bg-[#1a1a1c] border border-[#333] rounded overflow-hidden h-7">
                      <button
                        onClick={() => updateElementLocal(selectedElement.id, { fontSize: Math.max(8, (selectedElement.fontSize || 14) - 1) })}
                        className="px-1.5 h-full text-[#888] hover:text-white hover:bg-[#252528] transition-all"
                        title="Decrease Font Size"
                      >
                        <Minus size={11} />
                      </button>
                      <input
                        type="number"
                        min="8"
                        max="72"
                        value={selectedElement.fontSize || 14}
                        onChange={(e) => updateElementLocal(selectedElement.id, { fontSize: Number(e.target.value) })}
                        className="w-9 bg-transparent text-white font-bold text-center outline-none text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        onClick={() => updateElementLocal(selectedElement.id, { fontSize: Math.min(72, (selectedElement.fontSize || 14) + 1) })}
                        className="px-1.5 h-full text-[#888] hover:text-white hover:bg-[#252528] transition-all"
                        title="Increase Font Size"
                      >
                        <Plus size={11} />
                      </button>
                    </div>

                    <button
                      onClick={() => updateElementLocal(selectedElement.id, {
                        fontWeight: selectedElement.fontWeight === 'bold' ? 'normal' : 'bold'
                      })}
                      className={`p-1.5 rounded ${selectedElement.fontWeight === 'bold' ? 'bg-[#0F3D3E] text-white' : 'hover:bg-[#222] text-[#888]'}`}
                      title="Bold"
                    >
                      <Bold size={13} />
                    </button>

                    <button
                      onClick={() => updateElementLocal(selectedElement.id, {
                        fontStyle: selectedElement.fontStyle === 'italic' ? 'normal' : 'italic'
                      })}
                      className={`p-1.5 rounded ${selectedElement.fontStyle === 'italic' ? 'bg-[#0F3D3E] text-white' : 'hover:bg-[#222] text-[#888]'}`}
                      title="Italic"
                    >
                      <Italic size={13} />
                    </button>

                    {/* Alignment */}
                    <div className="flex items-center bg-[#1a1a1c] border border-[#333] rounded overflow-hidden">
                      <button
                        onClick={() => updateElementLocal(selectedElement.id, { textAlign: 'left' })}
                        className={`p-1 ${selectedElement.textAlign === 'left' ? 'bg-[#0F3D3E] text-white' : 'text-[#888]'}`}
                      >
                        <AlignLeft size={12} />
                      </button>
                      <button
                        onClick={() => updateElementLocal(selectedElement.id, { textAlign: 'center' })}
                        className={`p-1 ${selectedElement.textAlign === 'center' ? 'bg-[#0F3D3E] text-white' : 'text-[#888]'}`}
                      >
                        <AlignCenter size={12} />
                      </button>
                      <button
                        onClick={() => updateElementLocal(selectedElement.id, { textAlign: 'right' })}
                        className={`p-1 ${selectedElement.textAlign === 'right' ? 'bg-[#0F3D3E] text-white' : 'text-[#888]'}`}
                      >
                        <AlignRight size={12} />
                      </button>
                    </div>

                    {/* Canva-style Text Color Button & Popover */}
                    <div className="relative" ref={activeColorMenu === 'text' ? colorMenuRef : undefined}>
                      <button
                        onClick={() => setActiveColorMenu(activeColorMenu === 'text' ? null : 'text')}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] border text-xs font-bold transition-all ${
                          activeColorMenu === 'text'
                            ? 'bg-[#0F3D3E] border-[#E2DCC8]/50 text-white shadow'
                            : 'bg-[#1a1a1c] hover:bg-[#252528] border-[#38383c] hover:border-[#E2DCC8]/40 text-white'
                        }`}
                        title="Text Color"
                      >
                        <div className="flex flex-col items-center">
                          <span
                            className="font-serif font-black text-[13px] leading-tight"
                            style={{
                              color: selectedElement.fill?.includes('gradient') ? '#ffffff' : (selectedElement.fill || '#ffffff')
                            }}
                          >
                            A
                          </span>
                          <div
                            className="w-4 h-[3px] rounded-[1px] shadow-sm"
                            style={{
                              background: selectedElement.fill || '#ffffff'
                            }}
                          />
                        </div>
                        <span className="text-[11px] font-medium text-[#E2DCC8]">Color</span>
                        <ChevronDown size={11} className="text-[#888]" />
                      </button>

                      {/* Floating Text Color Popover */}
                      {activeColorMenu === 'text' && (
                        <div className="absolute top-full left-0 mt-2 w-72 p-3 bg-[#18181b] border border-[#38383c] rounded-[8px] shadow-2xl z-[100] animate-in fade-in zoom-in-95">
                          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#28282c]">
                            <div className="flex items-center gap-1.5">
                              <Palette size={13} className="text-[#E2DCC8]" />
                              <span className="text-xs font-black uppercase tracking-wider text-white">Text Color</span>
                            </div>
                            <button
                              onClick={() => setActiveColorMenu(null)}
                              className="p-1 hover:bg-[#26262a] rounded text-[#888] hover:text-white"
                            >
                              <X size={12} />
                            </button>
                          </div>

                          {/* Quick Color Input */}
                          <div className="flex items-center gap-2 mb-3 bg-[#121214] border border-[#2e2e32] p-1.5 rounded-[4px]">
                            <input
                              type="color"
                              value={selectedElement.fill?.startsWith('#') && selectedElement.fill.length === 7 ? selectedElement.fill : '#ffffff'}
                              onChange={(e) => updateElementLocal(selectedElement.id, { fill: e.target.value })}
                              className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent"
                            />
                            <input
                              type="text"
                              value={selectedElement.fill || '#ffffff'}
                              onChange={(e) => updateElementLocal(selectedElement.id, { fill: e.target.value })}
                              className="flex-1 bg-transparent text-xs font-mono font-bold text-white outline-none"
                              placeholder="#ffffff or gradient"
                            />
                          </div>

                          {/* Preset Swatches */}
                          <div className="space-y-1.5 mb-3">
                            <span className="text-[10px] font-bold text-[#888] uppercase tracking-wider block">Palette Presets</span>
                            <div className="grid grid-cols-6 gap-1.5">
                              {[
                                '#ffffff', '#000000', '#0f172a', '#334155', '#64748b', '#94a3b8',
                                '#0F3D3E', '#134d4f', '#E2DCC8', '#d4af37', '#fef08a', '#e0e7ff',
                                '#0ea5e9', '#38bdf8', '#3b82f6', '#8b5cf6', '#ef4444', '#10b981'
                              ].map(hex => (
                                <button
                                  key={hex}
                                  onClick={() => updateElementLocal(selectedElement.id, { fill: hex })}
                                  className={`w-full aspect-square rounded-[3px] border transition-transform hover:scale-110 shadow-sm ${
                                    selectedElement.fill === hex ? 'border-cyan-400 ring-1 ring-cyan-400' : 'border-white/15'
                                  }`}
                                  style={{ backgroundColor: hex }}
                                  title={hex}
                                />
                              ))}
                            </div>
                          </div>

                          {/* Advanced Studio Picker Embed */}
                          <div className="pt-2 border-t border-[#28282c]">
                            <button
                              onClick={() => setShowColorPicker(!showColorPicker)}
                              className="w-full flex items-center justify-between py-1.5 px-2 bg-[#202024] hover:bg-[#28282c] border border-[#333] rounded-[4px] text-[11px] font-bold text-[#E2DCC8]"
                            >
                              <span>Advanced Color Studio & Gradients</span>
                              <ChevronDown size={12} className={`transition-transform ${showColorPicker ? 'rotate-180' : ''}`} />
                            </button>

                            {showColorPicker && (
                              <div className="mt-2 pt-1 border-t border-[#28282c]">
                                <AdvancedColorPicker
                                  color={selectedElement.fill || '#ffffff'}
                                  onChange={(newColor) => updateElementLocal(selectedElement.id, { fill: newColor })}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {selectedElement.type === 'shape' && (
                  <div className="relative" ref={activeColorMenu === 'shape' ? colorMenuRef : undefined}>
                    <button
                      onClick={() => setActiveColorMenu(activeColorMenu === 'shape' ? null : 'shape')}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] border text-xs font-bold transition-all ${
                        activeColorMenu === 'shape'
                          ? 'bg-[#0F3D3E] border-[#E2DCC8]/50 text-white shadow'
                          : 'bg-[#1a1a1c] hover:bg-[#252528] border-[#38383c] hover:border-[#E2DCC8]/40 text-white'
                      }`}
                      title="Shape Fill Color"
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white/30 shadow-sm"
                        style={{ background: selectedElement.fill || '#cbd5e1' }}
                      />
                      <span>Fill Color</span>
                      <ChevronDown size={11} className="text-[#888]" />
                    </button>

                    {/* Floating Shape Color Popover */}
                    {activeColorMenu === 'shape' && (
                      <div className="absolute top-full left-0 mt-2 w-72 p-3 bg-[#18181b] border border-[#38383c] rounded-[8px] shadow-2xl z-[100] animate-in fade-in zoom-in-95">
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#28282c]">
                          <div className="flex items-center gap-1.5">
                            <Palette size={13} className="text-[#E2DCC8]" />
                            <span className="text-xs font-black uppercase tracking-wider text-white">Fill Color</span>
                          </div>
                          <button
                            onClick={() => setActiveColorMenu(null)}
                            className="p-1 hover:bg-[#26262a] rounded text-[#888] hover:text-white"
                          >
                            <X size={12} />
                          </button>
                        </div>

                        {/* Quick Color Input */}
                        <div className="flex items-center gap-2 mb-3 bg-[#121214] border border-[#2e2e32] p-1.5 rounded-[4px]">
                          <input
                            type="color"
                            value={selectedElement.fill?.startsWith('#') && selectedElement.fill.length === 7 ? selectedElement.fill : '#cbd5e1'}
                            onChange={(e) => updateElementLocal(selectedElement.id, { fill: e.target.value })}
                            className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent"
                          />
                          <input
                            type="text"
                            value={selectedElement.fill || '#cbd5e1'}
                            onChange={(e) => updateElementLocal(selectedElement.id, { fill: e.target.value })}
                            className="flex-1 bg-transparent text-xs font-mono font-bold text-white outline-none"
                            placeholder="#ffffff or gradient"
                          />
                        </div>

                        {/* Preset Swatches */}
                        <div className="space-y-1.5 mb-3">
                          <span className="text-[10px] font-bold text-[#888] uppercase tracking-wider block">Palette Presets</span>
                          <div className="grid grid-cols-6 gap-1.5">
                            {[
                              '#cbd5e1', '#94a3b8', '#64748b', '#0f172a', '#000000', '#ffffff',
                              '#0F3D3E', '#134d4f', '#E2DCC8', '#d4af37', '#fef08a', '#0ea5e9',
                              '#38bdf8', '#3b82f6', '#8b5cf6', '#ef4444', '#10b981', '#f59e0b'
                            ].map(hex => (
                              <button
                                key={hex}
                                onClick={() => updateElementLocal(selectedElement.id, { fill: hex })}
                                className={`w-full aspect-square rounded-[3px] border transition-transform hover:scale-110 shadow-sm ${
                                  selectedElement.fill === hex ? 'border-cyan-400 ring-1 ring-cyan-400' : 'border-white/15'
                                }`}
                                style={{ backgroundColor: hex }}
                                title={hex}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Advanced Studio Picker Embed */}
                        <div className="pt-2 border-t border-[#28282c]">
                          <button
                            onClick={() => setShowColorPicker(!showColorPicker)}
                            className="w-full flex items-center justify-between py-1.5 px-2 bg-[#202024] hover:bg-[#28282c] border border-[#333] rounded-[4px] text-[11px] font-bold text-[#E2DCC8]"
                          >
                            <span>Advanced Color Studio & Gradients</span>
                            <ChevronDown size={12} className={`transition-transform ${showColorPicker ? 'rotate-180' : ''}`} />
                          </button>

                          {showColorPicker && (
                            <div className="mt-2 pt-1 border-t border-[#28282c]">
                              <AdvancedColorPicker
                                color={selectedElement.fill || '#cbd5e1'}
                                onChange={(newColor) => updateElementLocal(selectedElement.id, { fill: newColor })}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Straighten / Reset Rotation Button */}
                {(selectedElement.shapeType === 'line' || (selectedElement.rotation && selectedElement.rotation !== 0)) && (
                  <button
                    onClick={() => {
                      updateElementLocal(selectedElement.id, { rotation: 0 });
                      const activeObj = fabricCanvasRef.current?.getActiveObject();
                      if (activeObj) {
                        activeObj.set({ angle: 0 });
                        activeObj.setCoords();
                        fabricCanvasRef.current?.requestRenderAll();
                      }
                    }}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-[#1a1a1c] hover:bg-[#252528] border border-[#38383c] hover:border-cyan-400 text-[11px] font-bold text-cyan-400 transition-all shadow-sm"
                    title="Straighten line (Reset rotation to 0°)"
                  >
                    <RotateCcw size={12} />
                    <span>Straighten (0°)</span>
                  </button>
                )}

                <div className="h-4 w-px bg-[#333] mx-1" />

                {/* Layer Arrangement Controls */}
                <div className="flex items-center bg-[#1a1a1c] border border-[#333] rounded overflow-hidden" title="Layer Stacking Order">
                  <button
                    onClick={() => bringToFront(selectedElement.id)}
                    className="p-1.5 hover:bg-[#28282c] text-[#888] hover:text-white transition-all"
                    title="Bring to Front (Top Layer)"
                  >
                    <ChevronsUp size={13} />
                  </button>
                  <button
                    onClick={() => moveForward(selectedElement.id)}
                    className="p-1.5 hover:bg-[#28282c] text-[#888] hover:text-white transition-all"
                    title="Bring Forward (Move Up 1 Step)"
                  >
                    <ArrowUp size={13} />
                  </button>
                  <button
                    onClick={() => moveBackward(selectedElement.id)}
                    className="p-1.5 hover:bg-[#28282c] text-[#888] hover:text-white transition-all"
                    title="Send Backward (Move Down 1 Step)"
                  >
                    <ArrowDown size={13} />
                  </button>
                  <button
                    onClick={() => sendToBack(selectedElement.id)}
                    className="p-1.5 hover:bg-[#28282c] text-[#888] hover:text-white transition-all"
                    title="Send to Back (Bottom Layer)"
                  >
                    <ChevronsDown size={13} />
                  </button>
                </div>

                <div className="h-4 w-px bg-[#333] mx-1" />

                {/* Duplicate */}
                <button
                  onClick={() => duplicateElementLocal(selectedElement.id)}
                  className="p-1.5 rounded hover:bg-[#222] text-[#888] hover:text-white"
                  title="Duplicate Element"
                >
                  <Copy size={14} />
                </button>

                {/* Delete */}
                <button
                  onClick={() => deleteElementLocal(selectedElement.id)}
                  className="p-1.5 rounded hover:bg-rose-950/60 text-rose-400 hover:text-rose-300"
                  title="Delete Element"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-[#888]">
                <Sparkles size={14} className="text-[#E2DCC8]" />
                <span>Click any element on the header strip to move, resize, or edit</span>
              </div>
            )}

            {/* Zoom Controls */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-[#888]">Zoom</span>
              <button
                onClick={() => setZoom(prev => Math.max(0.75, Math.round((prev - 0.15) * 100) / 100))}
                className="p-1 rounded bg-[#1c1c1f] hover:bg-[#242428] text-white"
                title="Zoom Out"
              >
                <ZoomOut size={13} />
              </button>
              <span className="text-xs font-mono font-bold text-[#E2DCC8] w-12 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom(prev => Math.min(2.0, Math.round((prev + 0.15) * 100) / 100))}
                className="p-1 rounded bg-[#1c1c1f] hover:bg-[#242428] text-white"
                title="Zoom In"
              >
                <ZoomIn size={13} />
              </button>
              <button
                onClick={() => setZoom(1)}
                className="text-[10px] font-bold text-[#888] hover:text-white px-1.5 py-0.5 rounded hover:bg-[#222]"
              >
                100%
              </button>
            </div>
          </div>

          {/* Canvas Viewport (Scrollable container centering the header strip) */}
          <div className="flex-1 overflow-auto flex flex-col items-center justify-center p-8 relative">
            
            {/* Dimension Indicator Pill */}
            <div className="mb-3 flex items-center gap-2 text-[11px] font-bold text-[#888] bg-[#161618] border border-[#262626] px-3 py-1 rounded-full shadow">
              <span>Catalog Width: <strong>794px</strong></span>
              <span>•</span>
              <span>Header Height: <strong>{Math.round(headerHeight)}px</strong> ({toMm(headerHeight)}mm)</span>
            </div>

            {/* Isolated Header Canvas Frame & Artboard */}
            <div
              className="relative flex items-center justify-center select-none"
              style={{
                width: (PAGE_WIDTH + CANVAS_PAD_X * 2) * zoom,
                height: (headerHeight + CANVAS_PAD_Y * 2) * zoom,
              }}
            >
              {/* The Visual Header Strip (Artboard) */}
              <div
                className="absolute rounded-sm transition-all"
                style={{
                  width: PAGE_WIDTH * zoom,
                  height: headerHeight * zoom,
                  background: headerBg,
                  boxShadow: '0 25px 60px rgba(0,0,0,0.65), 0 0 0 1px rgba(226,220,200,0.25)',
                  pointerEvents: 'none'
                }}
              >
                {/* Left & Right Page Margin Guide Marks (38px) */}
                <div
                  className="absolute top-0 bottom-0 border-r border-dashed border-cyan-500/40 pointer-events-none"
                  style={{ left: 38 * zoom }}
                  title="Left Margin Guide (38px)"
                />
                <div
                  className="absolute top-0 bottom-0 border-l border-dashed border-cyan-500/40 pointer-events-none"
                  style={{ right: 38 * zoom }}
                  title="Right Margin Guide (38px)"
                />
              </div>

              {/* The Interactive Fabric Canvas (Transparent, extending CANVAS_PAD outside the artboard) */}
              <div className="relative z-10">
                <canvas ref={canvasElRef} />
              </div>
            </div>

            {/* Bottom Help note */}
            <div className="mt-4 text-center text-xs text-[#666]">
              <p>💡 Tip: Double-click text to edit inline. Drag corners to resize. Use Backspace to delete.</p>
              <p className="text-[10px] text-[#555] mt-0.5">The full page is hidden — only this master header section will be saved and reused.</p>
            </div>
          </div>
        </div>

        {/* ── Right Sidebar: Layer Elements List ───────────────────── */}
        <div className="w-72 bg-[#141416] border-l border-[#262626] flex flex-col shrink-0">
          <div className="h-12 px-4 border-b border-[#262626] flex items-center justify-between shrink-0 bg-[#121214]">
            <div className="flex items-center gap-2">
              <Layers size={14} className="text-[#E2DCC8]" />
              <h4 className="text-xs font-black uppercase tracking-wider text-white">Header Layers</h4>
            </div>
            <span className="text-[10px] font-bold text-[#888] bg-[#1c1c1f] px-2 py-0.5 rounded-full border border-[#2a2a2e]">
              {elements.length}
            </span>
          </div>

          {/* Quick Arrange Controls for Selected Layer */}
          {selectedElement && (
            <div className="px-3 py-2 bg-[#18181c] border-b border-[#26262a] flex items-center justify-between gap-1 animate-in fade-in">
              <span className="text-[10px] font-bold text-[#888] uppercase tracking-wider flex items-center gap-1 min-w-0">
                <span>Arrange:</span>
                <span className="text-[#E2DCC8] truncate max-w-[85px]">
                  {selectedElement.type === 'text' ? (selectedElement.text || 'Text') : (selectedElement.shapeType || 'Shape')}
                </span>
              </span>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => bringToFront(selectedElement.id)}
                  className="p-1 rounded bg-[#222226] hover:bg-[#2e2e36] text-[#bbb] hover:text-white border border-[#333] transition-all"
                  title="Bring to Top / Front"
                >
                  <ChevronsUp size={13} />
                </button>
                <button
                  onClick={() => moveForward(selectedElement.id)}
                  className="p-1 rounded bg-[#222226] hover:bg-[#2e2e36] text-[#bbb] hover:text-white border border-[#333] transition-all"
                  title="Move Up / Forward (1 step)"
                >
                  <ArrowUp size={13} />
                </button>
                <button
                  onClick={() => moveBackward(selectedElement.id)}
                  className="p-1 rounded bg-[#222226] hover:bg-[#2e2e36] text-[#bbb] hover:text-white border border-[#333] transition-all"
                  title="Move Down / Backward (1 step)"
                >
                  <ArrowDown size={13} />
                </button>
                <button
                  onClick={() => sendToBack(selectedElement.id)}
                  className="p-1 rounded bg-[#222226] hover:bg-[#2e2e36] text-[#bbb] hover:text-white border border-[#333] transition-all"
                  title="Send to Bottom / Back"
                >
                  <ChevronsDown size={13} />
                </button>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
            {elements.length === 0 ? (
              <div className="text-center py-10 text-xs text-[#666]">
                <Layers size={24} className="mx-auto mb-2 text-[#444]" />
                <p>No elements on header yet.</p>
                <p className="text-[10px] text-[#555] mt-1">Add text, logos, or presets from the left panel.</p>
              </div>
            ) : (
              elements
                .slice()
                .reverse()
                .map((el, revIdx) => {
                  const isSelected = el.id === selectedId;
                  const isTop = revIdx === 0;
                  const isBottom = revIdx === elements.length - 1;
                  return (
                    <div
                      key={el.id}
                      draggable
                      onDragStart={(e) => {
                        setDraggedLayerId(el.id);
                        e.dataTransfer.setData('text/plain', el.id);
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (draggedLayerId && draggedLayerId !== el.id) {
                          reorderLayer(draggedLayerId, el.id);
                        }
                        setDraggedLayerId(null);
                      }}
                      onClick={() => setSelectedId(el.id)}
                      className={`group flex items-center justify-between p-2 rounded-[4px] border cursor-pointer transition-all ${
                        draggedLayerId === el.id ? 'opacity-40 border-dashed border-cyan-400' : ''
                      } ${
                        isSelected
                          ? 'bg-[#0F3D3E]/40 border-[#E2DCC8]/60 text-white shadow-sm ring-1 ring-[#E2DCC8]/20'
                          : 'bg-[#18181a] border-[#26262a] text-[#aaa] hover:text-white hover:bg-[#202024]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <GripVertical size={13} className="text-[#555] group-hover:text-[#999] cursor-grab shrink-0" />
                        {el.type === 'text' ? (
                          <Type size={13} className={isSelected ? 'text-[#E2DCC8]' : 'text-[#777]'} />
                        ) : el.type === 'shape' ? (
                          <Square size={13} className={isSelected ? 'text-[#E2DCC8]' : 'text-[#777]'} />
                        ) : (
                          <ImageIcon size={13} className={isSelected ? 'text-[#E2DCC8]' : 'text-[#777]'} />
                        )}
                        <span className="text-xs font-bold truncate">
                          {el.type === 'text' ? (el.text || 'Text') : (el.shapeType || 'Shape')}
                        </span>
                      </div>

                      <div className="flex items-center gap-0.5 shrink-0 ml-1">
                        {/* Move Up in Stack */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveForward(el.id);
                          }}
                          disabled={isTop}
                          className={`p-1 rounded transition-all ${
                            isTop
                              ? 'text-[#383838] cursor-not-allowed'
                              : 'text-[#888] hover:text-white hover:bg-[#2c2c32]'
                          }`}
                          title={isTop ? 'Already at Top' : 'Move Up (Bring Forward)'}
                        >
                          <ArrowUp size={12} />
                        </button>

                        {/* Move Down in Stack */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveBackward(el.id);
                          }}
                          disabled={isBottom}
                          className={`p-1 rounded transition-all ${
                            isBottom
                              ? 'text-[#383838] cursor-not-allowed'
                              : 'text-[#888] hover:text-white hover:bg-[#2c2c32]'
                          }`}
                          title={isBottom ? 'Already at Bottom' : 'Move Down (Send Backward)'}
                        >
                          <ArrowDown size={12} />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateElementLocal(el.id);
                          }}
                          className="p-1 hover:bg-[#333] rounded text-[#888] hover:text-white"
                          title="Duplicate"
                        >
                          <Copy size={12} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteElementLocal(el.id);
                          }}
                          className="p-1 hover:bg-rose-950/50 rounded text-rose-400 hover:text-rose-300"
                          title="Delete"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })
            )}
          </div>

          {/* Quick Clear Button */}
          {elements.length > 0 && (
            <div className="p-3 border-t border-[#262626]">
              <button
                onClick={() => {
                  if (window.confirm('Clear all elements from this header?')) {
                    setElements([]);
                    setSelectedId(null);
                  }
                }}
                className="w-full py-2 bg-[#1a1a1c] hover:bg-rose-950/40 border border-[#333] hover:border-rose-800 text-[11px] font-bold text-[#888] hover:text-rose-300 rounded transition-all"
              >
                Clear All Elements
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeaderDesignerModal;
