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
} from './FooterDesigner/constants';
import { FooterTopBar } from './FooterDesigner/FooterTopBar';
import { FooterLeftSidebar } from './FooterDesigner/FooterLeftSidebar';
import { FooterCanvasStage } from './FooterDesigner/FooterCanvasStage';
import { FooterRightSidebar } from './FooterDesigner/FooterRightSidebar';

export const FooterDesignerModal: React.FC = () => {
  const {
    isFooterDesignerOpen,
    editingFooterTemplate,
    setIsFooterDesignerOpen,
    createSystemTemplate,
    updateSystemTemplate,
    fetchSystemTemplates,
    applyFooterTemplate,
    updateProjectSettings,
    mediaItems,
    systemTemplates,
    deleteSystemTemplate,
    catalog,
    saveCatalog,
    uiTheme
  } = useStore();

  const isDark = uiTheme === 'dark';

  // Modal State
  const [templateName, setTemplateName] = useState<string>('My Custom Footer');
  const [category, setCategory] = useState<string>('General');
  const [description, setDescription] = useState<string>('');
  const [footerHeight, setFooterHeight] = useState<number>(75.6); // px (20mm default)
  const [footerBg, setFooterBg] = useState<string>('#ffffff');
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

  // Initialize from editing template or current catalog footer or default preset
  useEffect(() => {
    if (!isFooterDesignerOpen) return;

    fetchSystemTemplates();

    if (editingFooterTemplate) {
      setTemplateName(editingFooterTemplate.name || 'Custom Footer');
      setCategory(editingFooterTemplate.category || 'General');
      setDescription(editingFooterTemplate.description || '');
      const pageData = editingFooterTemplate.pages_data?.[0] || {};
      const rawH = pageData.height;
      const fHeight = (rawH && rawH >= toPx(15)) ? rawH : toPx(20);
      setFooterHeight(fHeight);
      setFooterBg(pageData.backgroundColor || '#ffffff');
      setElements(pageData.elements ? JSON.parse(JSON.stringify(pageData.elements)) : []);
    } else if (catalog.footerElements && catalog.footerElements.length > 0) {
      setTemplateName(`${catalog.name || 'Catalog'} Master Footer`);
      const validH = (catalog.footerHeight && catalog.footerHeight >= toPx(15)) ? catalog.footerHeight : toPx(20);
      setFooterHeight(validH);
      if (!catalog.footerHeight || catalog.footerHeight < toPx(15)) {
        updateProjectSettings({ footerHeight: toPx(20) });
      }
      setFooterBg('#ffffff');
      setElements(JSON.parse(JSON.stringify(catalog.footerElements)));
    } else {
      setTemplateName('Master Footer');
      setCategory('General');
      setFooterHeight(toPx(20));
      setFooterBg('#ffffff');
      setElements([]);
    }
  }, [isFooterDesignerOpen, editingFooterTemplate]);

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
    const newId = `ftr-copy-${Date.now()}`;
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
    if (!canvasElRef.current || !isFooterDesignerOpen) return;

    const canvas = new Canvas(canvasElRef.current, {
      width: (PAGE_WIDTH + CANVAS_PAD_X * 2) * zoom,
      height: (footerHeight + CANVAS_PAD_Y * 2) * zoom,
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
        obj.id.startsWith('ftr-div') ||
        obj.id.startsWith('ftr-dbl') ||
        obj.id.startsWith('ftr-url-line') ||
        obj.id.includes('line')
      )) || obj.shapeType === 'line' || obj.shapeType === 'curved-line' || obj.shapeType === 'elbow-line' || elObj?.shapeType === 'line' || elObj?.shapeType === 'curved-line' || elObj?.shapeType === 'elbow-line';

      let computedW: number;
      let computedH: number;

      if (isDivider) {
        computedW = Math.round((obj.width || 200) * sx);
        computedH = elObj?.height || Math.round((obj.height || 2) * sy);
      } else if (obj.type === 'i-text' || obj.type === 'text') {
        computedW = Math.round((obj.width || 200) * sx);
        computedH = Math.round((obj.height || 30) * sy);
      } else if (obj.type === 'rect') {
        computedW = Math.round((obj.width || 50) * sx);
        computedH = Math.round((obj.height || 50) * sy);
      } else {
        computedW = Math.round(obj.getScaledWidth ? obj.getScaledWidth() : ((obj.width || 50) * sx));
        computedH = Math.round(obj.getScaledHeight ? obj.getScaledHeight() : ((obj.height || 50) * sy));
      }

      const rawLeft = obj.left || 0;
      const rawTop = obj.top || 0;

      let artboardX = Math.round(rawLeft - CANVAS_PAD_X);
      let artboardY = Math.round(rawTop - CANVAS_PAD_Y);

      if (obj.originX === 'center' || obj.originY === 'center') {
        const matrix = obj.calcTransformMatrix();
        const topLeftPoint = util.transformPoint(
          new Point(-obj.width / 2, -obj.height / 2),
          matrix
        );
        artboardX = Math.round(topLeftPoint.x - CANVAS_PAD_X);
        artboardY = Math.round(topLeftPoint.y - CANVAS_PAD_Y);
      }

      pushHistory();
      updateElementLocal(obj.id, {
        x: artboardX,
        y: artboardY,
        width: Math.max(10, computedW),
        height: Math.max(1, computedH),
        rotation: Math.round(obj.angle || 0)
      });
    });

    return () => {
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
  }, [isFooterDesignerOpen]);

  // Synchronize canvas size and zoom
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const targetW = (PAGE_WIDTH + CANVAS_PAD_X * 2) * zoom;
    const targetH = (footerHeight + CANVAS_PAD_Y * 2) * zoom;

    canvas.setDimensions({
      width: targetW,
      height: targetH,
    });
    canvas.setZoom(zoom);
    canvas.requestRenderAll();
  }, [zoom, footerHeight]);

  // Keyboard Shortcuts (Undo, Redo, Copy, Paste, Delete, Arrows)
  useEffect(() => {
    if (!isFooterDesignerOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput = activeEl?.tagName === 'INPUT' || activeEl?.tagName === 'TEXTAREA' || (activeEl as HTMLElement)?.isContentEditable;
      const canvas = fabricCanvasRef.current;
      const activeObj = canvas?.getActiveObject() as any;

      if (activeObj && activeObj.isEditing) return;
      if (isInput) return;

      const isMod = e.ctrlKey || e.metaKey;

      if (isMod && (e.key === 'z' || e.key === 'Z') && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
        return;
      }
      if ((isMod && (e.key === 'y' || e.key === 'Y')) || (isMod && e.shiftKey && (e.key === 'z' || e.key === 'Z'))) {
        e.preventDefault();
        handleRedo();
        return;
      }

      if (isMod && (e.key === 'c' || e.key === 'C')) {
        const currId = selectedIdRef.current || activeObj?.id;
        const el = elementsRef.current.find(item => item.id === currId);
        if (el) {
          e.preventDefault();
          copiedElementRef.current = JSON.parse(JSON.stringify(el));
        }
        return;
      }

      if (isMod && (e.key === 'v' || e.key === 'V')) {
        if (copiedElementRef.current) {
          e.preventDefault();
          pushHistory();
          const newId = `ftr-elem-${Date.now()}`;
          const pasted: CanvasElement = {
            ...JSON.parse(JSON.stringify(copiedElementRef.current)),
            id: newId,
            x: (copiedElementRef.current.x || 0) + 20,
            y: (copiedElementRef.current.y || 0) + 15,
            zIndex: elementsRef.current.length + 1
          };
          setElements(prev => [...prev, pasted]);
          setSelectedId(newId);
        }
        return;
      }

      if (isMod && (e.key === 'd' || e.key === 'D')) {
        const currId = selectedIdRef.current || activeObj?.id;
        if (currId) {
          e.preventDefault();
          duplicateElementLocal(currId);
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
            updateElementLocal(el.id, {
              x: (el.x || 0) + dx,
              y: (el.y || 0) + dy
            });
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFooterDesignerOpen, handleUndo, handleRedo]);

  // Sync background plate and elements with Fabric Canvas
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !isFooterDesignerOpen) return;

    let isSubscribed = true;

    const syncFabricObjects = async () => {
      // 1. Maintain or build background plate
      let bgRect = canvas.getObjects().find((o: any) => o.id === '__footer_bg__') as Rect;
      if (!bgRect) {
        bgRect = new Rect({
          left: CANVAS_PAD_X,
          top: CANVAS_PAD_Y,
          width: PAGE_WIDTH,
          height: footerHeight,
          selectable: false,
          evented: false,
          objectCaching: false,
          hoverCursor: 'default',
        });
        (bgRect as any).id = '__footer_bg__';
        canvas.add(bgRect);
      }

      bgRect.set({
        left: CANVAS_PAD_X,
        top: CANVAS_PAD_Y,
        width: PAGE_WIDTH,
        height: footerHeight,
      });
      applyElementFill(bgRect, footerBg, PAGE_WIDTH, footerHeight);

      // 2. Maintain or build boundary outline border
      let borderRect = canvas.getObjects().find((o: any) => o.id === '__footer_border__') as Rect;
      if (!borderRect) {
        borderRect = new Rect({
          left: CANVAS_PAD_X,
          top: CANVAS_PAD_Y,
          width: PAGE_WIDTH,
          height: footerHeight,
          fill: 'transparent',
          stroke: '#3b82f6',
          strokeWidth: 1.5,
          strokeDashArray: [6, 6],
          selectable: false,
          evented: false,
          hoverCursor: 'default',
        });
        (borderRect as any).id = '__footer_border__';
        canvas.add(borderRect);
      }
      borderRect.set({
        left: CANVAS_PAD_X,
        top: CANVAS_PAD_Y,
        width: PAGE_WIDTH,
        height: footerHeight,
        stroke: isDark ? '#38bdf8' : '#0284c7',
      });

      // 3. Sync elements
      const existingObjects = canvas.getObjects().filter((o: any) => o.id && !o.id.startsWith('__footer_'));
      const existingMap = new Map(existingObjects.map((o: any) => [o.id, o]));
      const elementIds = new Set(elements.map(el => el.id));

      // Remove orphaned objects
      existingObjects.forEach((obj: any) => {
        if (!elementIds.has(obj.id)) {
          canvas.remove(obj);
        }
      });

      for (const el of elements) {
        if (!isSubscribed) return;

        let obj = existingMap.get(el.id);

        if (obj) {
          // Object already exists: update properties
          const isStraightLine = el.shapeType === 'line';
          const isCurvedLine = el.shapeType === 'curved-line';
          const isElbowLine = el.shapeType === 'elbow-line';
          const isLineAny = isStraightLine || isCurvedLine || isElbowLine;

          const isCenterOrigin = obj.originX === 'center' && obj.originY === 'center';
          const targetLeft = isCenterOrigin
            ? (el.x || 0) + CANVAS_PAD_X + (el.width / 2)
            : (el.x || 0) + CANVAS_PAD_X;
          const targetTop = isCenterOrigin
            ? (el.y || 0) + CANVAS_PAD_Y + (el.height / 2)
            : (el.y || 0) + CANVAS_PAD_Y;

          obj.set({
            left: targetLeft,
            top: targetTop,
            angle: el.rotation || 0,
            opacity: el.opacity ?? 1,
          });

          if (el.type === 'text' && obj.type === 'i-text') {
            const itext = obj as IText;
            itext.set({
              text: el.text || '',
              fontSize: el.fontSize || 12,
              fontFamily: el.fontFamily || 'Inter',
              fontWeight: el.fontWeight || 'normal',
              fontStyle: el.fontStyle || 'normal',
              textAlign: el.textAlign || 'left',
              charSpacing: (el.letterSpacing || 0) * 10,
              width: el.width || 200,
            });
            applyElementFill(itext, el.fill, el.width, el.height);
          } else if (el.type === 'shape') {
            if (isLineAny) {
              const strokeColor = el.stroke || el.fill || '#cbd5e1';
              obj.set({
                stroke: strokeColor,
                strokeWidth: el.strokeWidth !== undefined ? el.strokeWidth : 2.5,
              });
            } else {
              applyElementFill(obj, el.fill, el.width, el.height);
              if (el.stroke) {
                obj.set('stroke', el.stroke);
                obj.set('strokeWidth', el.strokeWidth || 1);
              }
            }
          }
          obj.setCoords();
        } else {
          // Construct new Fabric Object
          let newObj: any = null;

          if (el.type === 'text') {
            newObj = new IText(el.text || '', {
              left: (el.x || 0) + CANVAS_PAD_X,
              top: (el.y || 0) + CANVAS_PAD_Y,
              fontSize: el.fontSize || 12,
              fontFamily: el.fontFamily || 'Inter',
              fontWeight: el.fontWeight || 'normal',
              fontStyle: el.fontStyle || 'normal',
              textAlign: el.textAlign || 'left',
              charSpacing: (el.letterSpacing || 0) * 10,
              width: el.width || 200,
              angle: el.rotation || 0,
              opacity: el.opacity ?? 1,
              originX: 'left',
              originY: 'top',
              objectCaching: false,
            });
            applyElementFill(newObj, el.fill || '#0f172a', el.width, el.height);
          } else if (el.type === 'shape') {
            const isStraightLine = el.shapeType === 'line';
            const isCurvedLine = el.shapeType === 'curved-line';
            const isElbowLine = el.shapeType === 'elbow-line';
            const isLineAny = isStraightLine || isCurvedLine || isElbowLine;

            const shapeProps = {
              left: (el.x || 0) + CANVAS_PAD_X,
              top: (el.y || 0) + CANVAS_PAD_Y,
              width: el.width || 40,
              height: el.height || 40,
              angle: el.rotation || 0,
              opacity: el.opacity ?? 1,
              originX: 'left' as const,
              originY: 'top' as const,
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
              console.warn('Failed to load logo on footer canvas:', imgErr);
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
  const addTextElement = (text = 'Footer Text', fontSize = 12, fontWeight = 'normal', isTag = false) => {
    const newId = `ftr-txt-${Date.now()}`;
    const newEl: CanvasElement = {
      id: newId,
      type: 'text',
      x: 50,
      y: Math.max(10, (footerHeight - 24) / 2),
      width: isTag ? 240 : 280,
      height: 24,
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
    const newId = `ftr-shape-${Date.now()}`;
    const isStraightLine = shapeType === 'line';
    const isCurvedLine = shapeType === 'curved-line';
    const isElbowLine = shapeType === 'elbow-line';
    const isLineAny = isStraightLine || isCurvedLine || isElbowLine;
    const isPill = shapeType === 'pill';
    const isArrow = shapeType === 'arrow' || shapeType === 'arrow4';

    const w = isLineAny ? 260 : isPill ? 80 : isArrow ? 50 : 30;
    const h = isStraightLine ? 2 : (isCurvedLine || isElbowLine) ? 24 : isPill ? 20 : isArrow ? 18 : 30;
    const initialY = Math.max(5, Math.round((footerHeight - h) / 2));
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
    const newId = `ftr-logo-${Date.now()}`;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const naturalW = img.naturalWidth || 120;
      const naturalH = img.naturalHeight || 50;
      const maxH = Math.max(20, Math.min(footerHeight - 15, 50));
      const targetH = Math.min(naturalH, maxH);
      const targetW = Math.round(targetH * (naturalW / naturalH));
      const initialY = Math.max(5, Math.round((footerHeight - targetH) / 2));

      const logoEl: CanvasElement = {
        id: newId,
        type: 'image',
        x: 38,
        y: initialY,
        width: Math.max(30, targetW),
        height: Math.max(15, targetH),
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
        y: 15,
        width: 100,
        height: 40,
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
      hasFooter: true,
      footerHeight: footerHeight
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

    if (footerBg && footerBg !== 'transparent') {
      const hasBgRect = elementsToApply.some(el => el.id?.startsWith('ftr-bg') || (el.type === 'shape' && (el.width || 0) >= PAGE_WIDTH && (el.height || 0) >= footerHeight));
      if (!hasBgRect) {
        elementsToApply.unshift({
          id: `ftr-bg-${Date.now()}`,
          type: 'shape',
          shapeType: 'rect',
          x: 0,
          y: 0,
          width: PAGE_WIDTH,
          height: footerHeight,
          fill: footerBg,
          rotation: 0,
          opacity: 1,
          zIndex: 0,
          locked: true
        });
      }
    }

    applyFooterTemplate({
      id: `custom-ftr-${Date.now()}`,
      name: templateName,
      description: description,
      type: 'footer',
      height: footerHeight,
      previewText: templateName,
      elements: elementsToApply
    });

    setAppliedSuccess(true);
    setTimeout(() => setAppliedSuccess(false), 2500);
  };

  if (!isFooterDesignerOpen) return null;

  return (
    <div className={`fixed inset-0 z-[9999] flex flex-col font-sans select-none animate-in fade-in duration-200 transition-colors ${
      isDark ? 'bg-[#0b0b0c] text-white' : 'bg-slate-100 text-slate-800'
    }`}>
      {/* ── Top Footer Navigation Bar ────────────────────────────── */}
      <FooterTopBar
        isDark={isDark}
        templateName={templateName}
        setTemplateName={setTemplateName}
        footerHeight={footerHeight}
        setFooterHeight={setFooterHeight}
        handleApplyToCatalog={handleApplyToCatalog}
        appliedSuccess={appliedSuccess}
        onClose={() => setIsFooterDesignerOpen(false)}
      />

      {/* ── Main Workspace Body ───────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar Tools */}
        <FooterLeftSidebar
          isDark={isDark}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          addTextElement={addTextElement}
          addShapeElement={addShapeElement}
          addImageLogo={addImageLogo}
          fileInputRef={fileInputRef}
          handleFileUpload={handleFileUpload}
          mediaItems={mediaItems}
          footerBg={footerBg}
          setFooterBg={setFooterBg}
          colorPickerTarget={colorPickerTarget}
          setColorPickerTarget={setColorPickerTarget}
          showColorPicker={showColorPicker}
          setShowColorPicker={setShowColorPicker}
          category={category}
          setCategory={setCategory}
          systemTemplates={systemTemplates}
          setTemplateName={setTemplateName}
          setDescription={setDescription}
          setFooterHeight={setFooterHeight}
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
        <FooterCanvasStage
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
          footerHeight={footerHeight}
          canvasElRef={canvasElRef}
          fabricCanvasRef={fabricCanvasRef}
        />

        {/* Right Sidebar: Layer Hierarchy & Order */}
        <FooterRightSidebar
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

export default FooterDesignerModal;
