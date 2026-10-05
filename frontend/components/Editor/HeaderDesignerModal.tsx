import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Canvas, IText, Rect, Circle, Image as FabricImage, Group, util, Point } from 'fabric';
import { useStore } from '../../store/useStore';
import { CanvasElement, ShapeType } from '../../types';
import { PAGE_WIDTH, PX_PER_MM } from '../../constants';
import { applyCanvaSelectionStyle } from '../../utils/canvaControls';
import { getPolyPoints } from './fabricRenderer';

import {
  CANVAS_PAD_X,
  CANVAS_PAD_Y,
  toMm,
  toPx,
  applyElementFill
} from './HeaderDesigner/constants';
import { HeaderTopBar } from './HeaderDesigner/HeaderTopBar';
import { HeaderLeftSidebar } from './HeaderDesigner/HeaderLeftSidebar';
import { HeaderCanvasStage } from './HeaderDesigner/HeaderCanvasStage';
import { HeaderRightSidebar } from './HeaderDesigner/HeaderRightSidebar';

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

  // File upload input ref for custom logos
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Canvas Refs
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);

  // Initialize from editing template or current catalog header or default preset
  useEffect(() => {
    if (!isHeaderDesignerOpen) return;

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
      setTemplateName('Master Header');
      setCategory('General');
      setHeaderHeight(toPx(30));
      setHeaderBg('#ffffff');
      setElements([]);
    }
  }, [isHeaderDesignerOpen, editingHeaderTemplate]);

  // Refs for shortcuts and history
  const elementsRef = useRef(elements);
  elementsRef.current = elements;
  const selectedIdRef = useRef(selectedId);
  selectedIdRef.current = selectedId;
  const copiedElementRef = useRef<CanvasElement | null>(null);
  const historyRef = useRef<{ past: CanvasElement[][]; future: CanvasElement[][] }>({ past: [], future: [] });

  const pushHistory = useCallback(() => {
    historyRef.current.past.push(JSON.parse(JSON.stringify(elementsRef.current)));
    if (historyRef.current.past.length > 30) historyRef.current.past.shift();
    historyRef.current.future = [];
  }, []);

  const handleUndo = useCallback(() => {
    if (historyRef.current.past.length === 0) return;
    const prev = historyRef.current.past.pop()!;
    historyRef.current.future.push(JSON.parse(JSON.stringify(elementsRef.current)));
    setElements(prev);
  }, []);

  const handleRedo = useCallback(() => {
    if (historyRef.current.future.length === 0) return;
    const next = historyRef.current.future.pop()!;
    historyRef.current.past.push(JSON.parse(JSON.stringify(elementsRef.current)));
    setElements(next);
  }, []);

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
    pushHistory();
    setElements(prev => prev.filter(el => el.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  // Duplicate element helper
  const duplicateElementLocal = (id: string) => {
    const target = elements.find(el => el.id === id);
    if (!target) return;
    pushHistory();
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

  // Layer Ordering & Arranging Helpers
  const bringToFront = (id: string) => {
    pushHistory();
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
    pushHistory();
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
    pushHistory();
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
    pushHistory();
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

  const reorderLayer = (draggedId: string, targetId: string) => {
    if (draggedId === targetId) return;
    pushHistory();
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

  // Fabric Canvas Lifecycle & Synchronization
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

    canvas.on('object:modified', (e: any) => {
      const obj = e.target as any;
      if (!obj || !obj.id) return;

      const sx = Math.abs(obj.scaleX || 1);
      const sy = Math.abs(obj.scaleY || 1);

      const elObj = elements.find(item => item.id === obj.id);
      const isDivider = (typeof obj.id === 'string' && (
        obj.id.startsWith('hdr-div') ||
        obj.id.startsWith('hdr-dbl') ||
        obj.id.startsWith('hdr-shape') && elObj?.shapeType === 'line' ||
        obj.id.includes('line') ||
        obj.id.includes('accent') ||
        obj.id.includes('divider')
      )) || elObj?.shapeType === 'line' || elObj?.shapeType === 'curved-line' || elObj?.shapeType === 'elbow-line' || (elObj?.height !== undefined && elObj.height <= 4 && (elObj.width || 0) >= 20) || obj.isDivider === true;

      let posX = Math.round((obj.left || 0) - CANVAS_PAD_X);
      let posY = Math.round((obj.top || 0) - CANVAS_PAD_Y);

      if (isDivider || obj.originX === 'center' || obj.originY === 'center') {
        const coords = typeof obj.getCoords === 'function' ? obj.getCoords() : null;
        if (coords && coords.length > 0) {
          posX = Math.round(coords[0].x - CANVAS_PAD_X);
          posY = Math.round(coords[0].y - CANVAS_PAD_Y);
        } else if (typeof obj.calcTransformMatrix === 'function') {
          const matrix = obj.calcTransformMatrix();
          const topLeft = util.transformPoint(new Point(-obj.width / 2, -obj.height / 2), matrix);
          posX = Math.round(topLeft.x - CANVAS_PAD_X);
          posY = Math.round(topLeft.y - CANVAS_PAD_Y);
        } else {
          const objW = Math.round((obj.width || 0) * sx);
          const objH = Math.round((obj.height || 0) * sy);
          posX = Math.round((obj.left || 0) - objW / 2 - CANVAS_PAD_X);
          posY = Math.round((obj.top || 0) - objH / 2 - CANVAS_PAD_Y);
        }
      }

      const updates: Partial<CanvasElement> = {
        x: posX,
        y: posY,
        rotation: Math.round(obj.angle || 0)
      };

      if (isDivider) {
        const newW = Math.max(10, Math.round((obj.width || 0) * sx));
        const preserveHeight = elObj?.height || 1.5;
        updates.width = newW;
        updates.height = preserveHeight;
        obj.set({ width: newW, height: preserveHeight, scaleX: 1, scaleY: 1 });
        obj.setCoords();
      } else if (obj instanceof IText || obj.type === 'i-text' || obj.type === 'text' || obj.type === 'textbox') {
        const newFontSize = Math.max(6, Math.round((obj.fontSize || elObj?.fontSize || 16) * sx));
        const newWidth = Math.max(20, Math.round((obj.width || elObj?.width || 100) * sx));
        updates.fontSize = newFontSize;
        updates.width = newWidth;
        updates.text = obj.text || '';
        obj.set({ fontSize: newFontSize, width: newWidth, scaleX: 1, scaleY: 1 });
        if (typeof obj.initDimensions === 'function') obj.initDimensions();
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
      } else if (obj instanceof FabricImage || obj.type === 'image' || elObj?.type === 'image') {
        const newW = Math.max(10, Math.round(obj.getScaledWidth ? obj.getScaledWidth() : (obj.width || 0) * sx));
        const newH = Math.max(10, Math.round(obj.getScaledHeight ? obj.getScaledHeight() : (obj.height || 0) * sy));
        updates.width = newW;
        updates.height = newH;
        
        const natW = (obj as any)._element?.naturalWidth || (obj as any)._originalElement?.naturalWidth || (obj as any).naturalWidth || obj.width || newW;
        const natH = (obj as any)._element?.naturalHeight || (obj as any)._originalElement?.naturalHeight || (obj as any).naturalHeight || obj.height || newH;
        obj.set({
          scaleX: newW / (natW || 1),
          scaleY: newH / (natH || 1)
        });
        obj.setCoords();
      } else {
        const newW = Math.max(1, Math.round((obj.width || 0) * sx));
        const newH = Math.max(1, Math.round((obj.height || 0) * sy));
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

  // Keyboard shortcuts handler in Header Designer
  useEffect(() => {
    if (!isHeaderDesignerOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement as HTMLElement;
      const isInput = activeEl?.tagName === 'INPUT' || activeEl?.tagName === 'TEXTAREA' || activeEl?.isContentEditable;
      const isMod = e.metaKey || e.ctrlKey;

      const canvas = fabricCanvasRef.current;
      const activeObj = canvas?.getActiveObject() as any;
      const isEditingText = isInput || (activeObj && activeObj.isEditing);

      if (isEditingText) {
        if (isMod) {
          if (['b', 'B'].includes(e.key)) { e.preventDefault(); document.execCommand('bold'); return; }
          if (['i', 'I'].includes(e.key)) { e.preventDefault(); document.execCommand('italic'); return; }
          if (['u', 'U'].includes(e.key)) { e.preventDefault(); document.execCommand('underline'); return; }
        }
        return;
      }

      if (isMod && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        if (e.shiftKey) handleRedo(); else handleUndo();
        return;
      }
      if (isMod && (e.key === 'y' || e.key === 'Y')) {
        e.preventDefault();
        handleRedo();
        return;
      }

      if (e.code === 'NumpadEnter' || e.key === 'Escape') {
        e.preventDefault();
        setSelectedId(null);
        if (activeEl) activeEl.blur();
        if (canvas) {
          canvas.discardActiveObject();
          canvas.requestRenderAll();
        }
        return;
      }

      if (isMod && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        setZoom(prev => Math.min(3, Math.round((prev + 0.1) * 10) / 10));
        return;
      }
      if (isMod && (e.key === '-' || e.key === '_')) {
        e.preventDefault();
        setZoom(prev => Math.max(0.2, Math.round((prev - 0.1) * 10) / 10));
        return;
      }
      if (isMod && e.key === '0') {
        e.preventDefault();
        setZoom(1);
        return;
      }

      if (isMod && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault();
        const currId = selectedIdRef.current || activeObj?.id;
        if (currId) {
          duplicateElementLocal(currId);
        }
        return;
      }

      if (isMod && (e.key === 'c' || e.key === 'C')) {
        const currId = selectedIdRef.current || activeObj?.id;
        const target = elementsRef.current.find(el => el.id === currId);
        if (target) {
          e.preventDefault();
          copiedElementRef.current = JSON.parse(JSON.stringify(target));
        }
        return;
      }
      if (isMod && (e.key === 'v' || e.key === 'V')) {
        if (copiedElementRef.current) {
          e.preventDefault();
          pushHistory();
          const newId = `hdr-copy-${Date.now()}`;
          const pasteItem: CanvasElement = {
            ...JSON.parse(JSON.stringify(copiedElementRef.current)),
            id: newId,
            x: Math.min(PAGE_WIDTH - 50, (copiedElementRef.current.x || 0) + 15),
            y: Math.min(headerHeight - 20, (copiedElementRef.current.y || 0) + 10),
            zIndex: elementsRef.current.length + 1
          };
          setElements(prev => [...prev, pasteItem]);
          setSelectedId(newId);
        }
        return;
      }

      if (isMod && (e.key === 'a' || e.key === 'A')) {
        if (elementsRef.current.length > 0) {
          e.preventDefault();
          setSelectedId(elementsRef.current[0].id);
        }
        return;
      }

      if (isMod && (e.key === 'b' || e.key === 'B')) {
        const currId = selectedIdRef.current || activeObj?.id;
        const el = elementsRef.current.find(item => item.id === currId);
        if (el?.type === 'text') {
          e.preventDefault();
          pushHistory();
          const isBold = el.fontWeight === 'bold' || el.fontWeight === '700' || el.fontWeight === '800';
          updateElementLocal(el.id, { fontWeight: isBold ? '400' : '700' });
        }
        return;
      }
      if (isMod && (e.key === 'i' || e.key === 'I')) {
        const currId = selectedIdRef.current || activeObj?.id;
        const el = elementsRef.current.find(item => item.id === currId);
        if (el?.type === 'text') {
          e.preventDefault();
          pushHistory();
          updateElementLocal(el.id, { fontStyle: el.fontStyle === 'italic' ? 'normal' : 'italic' });
        }
        return;
      }
      if (isMod && (e.key === 'u' || e.key === 'U')) {
        const currId = selectedIdRef.current || activeObj?.id;
        const el = elementsRef.current.find(item => item.id === currId);
        if (el?.type === 'text') {
          e.preventDefault();
          pushHistory();
          updateElementLocal(el.id, { textDecoration: el.textDecoration === 'underline' ? 'none' : 'underline' });
        }
        return;
      }

      if (isMod && (e.key === ']' || e.key === '}')) {
        const currId = selectedIdRef.current || activeObj?.id;
        if (currId) {
          e.preventDefault();
          if (e.altKey || e.shiftKey) bringToFront(currId);
          else moveForward(currId);
        }
        return;
      }
      if (isMod && (e.key === '[' || e.key === '{')) {
        const currId = selectedIdRef.current || activeObj?.id;
        if (currId) {
          e.preventDefault();
          if (e.altKey || e.shiftKey) sendToBack(currId);
          else moveBackward(currId);
        }
        return;
      }

      if (e.key === 'Backspace' || e.key === 'Delete') {
        const currId = selectedIdRef.current || activeObj?.id;
        if (currId) {
          e.preventDefault();
          deleteElementLocal(currId);
        }
        return;
      }

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        const currId = selectedIdRef.current || activeObj?.id;
        if (!currId) return;

        e.preventDefault();
        if (!e.repeat) pushHistory();

        const nudge = e.shiftKey ? 10 : 1;
        let dx = 0;
        let dy = 0;

        if (e.key === 'ArrowUp') dy = -nudge;
        else if (e.key === 'ArrowDown') dy = nudge;
        else if (e.key === 'ArrowLeft') dx = -nudge;
        else if (e.key === 'ArrowRight') dx = nudge;

        if (activeObj && activeObj.id === currId) {
          activeObj.set({
            left: (activeObj.left || 0) + dx,
            top: (activeObj.top || 0) + dy,
          });
          activeObj.setCoords();

          const newX = Math.round((activeObj.left || 0) - CANVAS_PAD_X);
          const newY = Math.round((activeObj.top || 0) - CANVAS_PAD_Y);

          updateElementLocal(activeObj.id, { x: newX, y: newY });
          canvas?.requestRenderAll();
        } else {
          const el = elementsRef.current.find(item => item.id === currId);
          if (el) {
            updateElementLocal(currId, { x: (el.x || 0) + dx, y: (el.y || 0) + dy });
          }
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isHeaderDesignerOpen, headerHeight, handleUndo, handleRedo, pushHistory]);

  // Sync Elements into Fabric Objects
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    if ((canvas as any)._currentTransform) return;

    let isSubscribed = true;

    const syncFabricObjects = async () => {
      const existing = canvas.getObjects() as any[];
      const elIds = new Set(elements.map(el => el.id));

      existing.forEach(obj => {
        if (obj.id && !elIds.has(obj.id)) {
          canvas.remove(obj);
        }
      });

      const existingMap = new Map<string, any>();
      existing.forEach(obj => {
        if (obj.id) existingMap.set(obj.id, obj);
      });

      for (const el of elements) {
        if (!isSubscribed) return;
        const obj = existingMap.get(el.id);

        if (obj) {
          const isCentered = obj.originX === 'center';
          const targetLeft = isCentered
            ? (el.x || 0) + (el.width || 0) / 2 + CANVAS_PAD_X
            : (el.x || 0) + CANVAS_PAD_X;
          const targetTop = isCentered
            ? (el.y || 0) + (el.height || 0) / 2 + CANVAS_PAD_Y
            : (el.y || 0) + CANVAS_PAD_Y;

          obj.set({
            left: targetLeft,
            top: targetTop,
            angle: el.rotation || 0,
            opacity: el.opacity ?? 1,
            visible: el.visible !== false,
          });

          if (obj instanceof IText || obj.type === 'i-text' || obj.type === 'text' || obj.type === 'textbox') {
            obj.set({
              text: el.text || '',
              fontSize: el.fontSize || 16,
              fontFamily: el.fontFamily || 'Inter',
              fontWeight: el.fontWeight || 'normal',
              fontStyle: el.fontStyle || 'normal',
              textAlign: el.textAlign || 'left',
              underline: el.textDecoration?.includes('underline') || false,
              linethrough: el.textDecoration?.includes('line-through') || false,
            });
            applyElementFill(obj, el.fill, el.width, el.height);
            if (typeof (obj as any).initDimensions === 'function') (obj as any).initDimensions();
          } else if (obj.type === 'image' || obj instanceof FabricImage) {
            applyCanvaSelectionStyle(obj);
          } else {
            applyElementFill(obj, el.fill, el.width, el.height);
          }
          obj.setCoords();
        } else {
          let newObj: any = null;

          if (el.type === 'text') {
            newObj = new IText(el.text || 'Header Text', {
              left: (el.x || 0) + CANVAS_PAD_X,
              top: (el.y || 0) + CANVAS_PAD_Y,
              fontSize: el.fontSize || 16,
              fontFamily: el.fontFamily || 'Inter',
              fontWeight: el.fontWeight || 'normal',
              fontStyle: el.fontStyle || 'normal',
              textAlign: el.textAlign || 'left',
              underline: el.textDecoration?.includes('underline') || false,
              linethrough: el.textDecoration?.includes('line-through') || false,
              charSpacing: el.letterSpacing ? Math.round(((el.letterSpacing) / (el.fontSize || 16)) * 1000) : 0,
              angle: el.rotation || 0,
              opacity: el.opacity ?? 1,
              originX: 'left',
              originY: 'top',
              objectCaching: false,
            });
            applyElementFill(newObj, el.fill, el.width, el.height);
          } else if (el.type === 'shape') {
            const isStraightLine = el.shapeType === 'line';
            const isCurvedLine = el.shapeType === 'curved-line';
            const isElbowLine = el.shapeType === 'elbow-line';
            const isLineAny = isStraightLine || isCurvedLine || isElbowLine;
            const isThinLineRect = (el.height <= 4 && (el.width || 0) >= 20) || (typeof el.id === 'string' && (el.id.includes('line') || el.id.includes('divider') || el.id.includes('accent')));
            const treatAsLine = isLineAny || isThinLineRect;

            const shapeProps = {
              left: treatAsLine ? (el.x || 0) + (el.width || 0) / 2 + CANVAS_PAD_X : (el.x || 0) + CANVAS_PAD_X,
              top: treatAsLine ? (el.y || 0) + (el.height || 0) / 2 + CANVAS_PAD_Y : (el.y || 0) + CANVAS_PAD_Y,
              width: el.width,
              height: el.height,
              angle: el.rotation || 0,
              opacity: el.opacity ?? 1,
              originX: treatAsLine ? ('center' as const) : ('left' as const),
              originY: treatAsLine ? ('center' as const) : ('top' as const),
              objectCaching: false,
            };

            const shapeFill = el.fill || '#0F3D3E';
            const shapeStroke = el.stroke || (isLineAny ? shapeFill : undefined);
            const shapeStrokeWidth = el.strokeWidth !== undefined ? el.strokeWidth : (isLineAny ? 2.5 : 0);

            newObj = new Rect({
              ...shapeProps,
              rx: el.shapeType === 'roundedRect' ? 6 : el.shapeType === 'pill' ? 12 : (el.rx || 0),
              ry: el.shapeType === 'roundedRect' ? 6 : el.shapeType === 'pill' ? 12 : (el.ry || 0),
              stroke: shapeStroke,
              strokeWidth: shapeStrokeWidth,
            });
            applyElementFill(newObj, shapeFill, el.width, el.height);
          } else if (el.type === 'image' && el.src) {
            try {
              const htmlImg = new Image();
              htmlImg.crossOrigin = 'anonymous';
              await new Promise<void>((resolve, reject) => {
                htmlImg.onload = () => resolve();
                htmlImg.onerror = () => reject();
                htmlImg.src = el.src!;
              });

              newObj = new FabricImage(htmlImg, {
                left: (el.x || 0) + CANVAS_PAD_X,
                top: (el.y || 0) + CANVAS_PAD_Y,
                width: htmlImg.naturalWidth || el.width,
                height: htmlImg.naturalHeight || el.height,
                scaleX: el.width / (htmlImg.naturalWidth || 1),
                scaleY: el.height / (htmlImg.naturalHeight || 1),
                angle: el.rotation || 0,
                opacity: el.opacity ?? 1,
                originX: 'left',
                originY: 'top',
                objectCaching: false,
              });
            } catch (imgErr) {
              console.warn('Failed to load logo on header canvas:', imgErr);
            }
          }

          if (newObj) {
            newObj.id = el.id;
            applyCanvaSelectionStyle(newObj);
            canvas.add(newObj);
          }
        }
      }

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

  // Element Insertion Handlers
  const addTextElement = (text = 'Header Text', fontSize = 14, fontWeight = 'normal', isTag = false) => {
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
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const naturalW = img.naturalWidth || 140;
      const naturalH = img.naturalHeight || 60;
      const maxH = Math.max(30, Math.min(headerHeight - 20, 70));
      const targetH = Math.min(naturalH, maxH);
      const targetW = Math.round(targetH * (naturalW / naturalH));
      const initialY = Math.max(5, Math.round((headerHeight - targetH) / 2));

      const logoEl: CanvasElement = {
        id: newId,
        type: 'image',
        x: 38,
        y: initialY,
        width: Math.max(40, targetW),
        height: Math.max(20, targetH),
        src: src,
        rotation: 0,
        opacity: 1,
        zIndex: elements.length + 1
      };
      setElements(prev => [...prev, logoEl]);
      setSelectedId(newId);
    };
    img.onerror = () => {
      const logoEl: CanvasElement = {
        id: newId,
        type: 'image',
        x: 38,
        y: 20,
        width: 120,
        height: 50,
        src: src,
        rotation: 0,
        opacity: 1,
        zIndex: elements.length + 1
      };
      setElements(prev => [...prev, logoEl]);
      setSelectedId(newId);
    };
    img.src = src;
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

  const handleApplyToCatalog = () => {
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
  };

  if (!isHeaderDesignerOpen) return null;

  return (
    <div className={`fixed inset-0 z-[9999] flex flex-col font-sans select-none animate-in fade-in duration-200 transition-colors ${
      isDark ? 'bg-[#0b0b0c] text-white' : 'bg-slate-100 text-slate-800'
    }`}>
      {/* ── Top Header Navigation Bar ────────────────────────────── */}
      <HeaderTopBar
        isDark={isDark}
        templateName={templateName}
        setTemplateName={setTemplateName}
        headerHeight={headerHeight}
        setHeaderHeight={setHeaderHeight}
        handleApplyToCatalog={handleApplyToCatalog}
        appliedSuccess={appliedSuccess}
        onClose={() => setIsHeaderDesignerOpen(false)}
      />

      {/* ── Main Workspace Body ───────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar Tools */}
        <HeaderLeftSidebar
          isDark={isDark}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          addTextElement={addTextElement}
          addShapeElement={addShapeElement}
          addImageLogo={addImageLogo}
          fileInputRef={fileInputRef}
          handleFileUpload={handleFileUpload}
          mediaItems={mediaItems}
          headerBg={headerBg}
          setHeaderBg={setHeaderBg}
          colorPickerTarget={colorPickerTarget}
          setColorPickerTarget={setColorPickerTarget}
          showColorPicker={showColorPicker}
          setShowColorPicker={setShowColorPicker}
          category={category}
          setCategory={setCategory}
          systemTemplates={systemTemplates}
          setTemplateName={setTemplateName}
          setDescription={setDescription}
          setHeaderHeight={setHeaderHeight}
          setElements={setElements}
          setSelectedId={setSelectedId}
          deleteSystemTemplate={deleteSystemTemplate}
          elements={elements}
          selectedId={selectedId}
          moveForward={moveForward}
          moveBackward={moveBackward}
          duplicateElementLocal={duplicateElementLocal}
          deleteElementLocal={deleteElementLocal}
          reorderLayer={reorderLayer}
          pushHistory={pushHistory}
        />

        {/* Center Editor Canvas Area */}
        <HeaderCanvasStage
          isDark={isDark}
          selectedElement={selectedElement}
          updateElementLocal={updateElementLocal}
          duplicateElementLocal={duplicateElementLocal}
          deleteElementLocal={deleteElementLocal}
          bringToFront={bringToFront}
          sendToBack={sendToBack}
          moveForward={moveForward}
          moveBackward={moveBackward}
          zoom={zoom}
          setZoom={setZoom}
          headerHeight={headerHeight}
          canvasElRef={canvasElRef}
          fabricCanvasRef={fabricCanvasRef}
        />

        {/* Right Sidebar: Layer Hierarchy & Order */}
        <HeaderRightSidebar
          isDark={isDark}
          elements={elements}
          selectedElement={selectedElement}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          bringToFront={bringToFront}
          sendToBack={sendToBack}
          moveForward={moveForward}
          moveBackward={moveBackward}
          duplicateElementLocal={duplicateElementLocal}
          deleteElementLocal={deleteElementLocal}
          reorderLayer={reorderLayer}
        />
      </div>
    </div>
  );
};
export default HeaderDesignerModal;
