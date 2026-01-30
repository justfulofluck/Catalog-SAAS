
import React, { useEffect, useCallback, useState, useRef, useMemo } from 'react';
import { Stage as KonvaStage, Layer as KonvaLayer, Rect as KonvaRect, Text as KonvaText, Group as KonvaGroup, Line as KonvaLine, Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';
import { Images, Plus, Sparkles } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { PAGE_WIDTH, PAGE_HEIGHT, THEMES, HEADER_FOOTER_HEIGHT } from '../../constants';
import CanvasElementComponent from './CanvasElement';
import PageNavigator from './PageNavigator';
import { FloatingTextToolbar } from '../Toolbar/FloatingTextToolbar';

// Internal component for the holographic drop preview
const SnapPreview: React.FC<{ target: any; imageUrl: string; zoom: number }> = ({ target, imageUrl, zoom }) => {
  const [image] = useImage(imageUrl, 'anonymous');

  const crop = useMemo(() => {
    if (!image || !target.width || !target.height) return undefined;
    const containerRatio = target.width / target.height;
    const imageRatio = image.width / image.height;
    let cropWidth = image.width;
    let cropHeight = image.height;
    let cropX = 0, cropY = 0;

    if (containerRatio > imageRatio) {
      cropHeight = image.width / containerRatio;
      cropY = (image.height - cropHeight) / 2;
    } else {
      cropWidth = image.height * containerRatio;
      cropX = (image.width - cropWidth) / 2;
    }
    return { x: cropX, y: cropY, width: cropWidth, height: cropHeight };
  }, [image, target.width, target.height]);

  if (!image) return null;

  return (
    <KonvaGroup x={target.x} y={target.y} rotation={target.rotation} listening={false}>
      <KonvaImage
        width={target.width}
        height={target.height}
        image={image}
        crop={crop}
        opacity={0.4}
        stroke="#4f46e5"
        strokeWidth={4 / zoom}
      />
      <KonvaRect
        width={target.width}
        height={target.height}
        fill="rgba(79, 70, 229, 0.15)"
        stroke="#4f46e5"
        strokeWidth={2 / zoom}
        dash={[8, 4]}
      />
    </KonvaGroup>
  );
};

const EditorCanvas: React.FC = () => {
  const {
    catalog,
    activeThemeId,
    currentPageIndex,
    zoom,
    setZoom,
    selectedElementIds,
    setSelectedElementIds,
    updateElement,
    removeElement,
    duplicateElement,
    nudgeElement,
    undo,
    redo,
    groupSelected,
    ungroupSelected,
    moveElements,
    toggleLock,
    addElement,
    addMedia,
    draggingItem,
    setDraggingItem,
    pushHistory,
    uiTheme
  } = useStore();

  const currentPage = catalog.pages[currentPageIndex];
  const theme = THEMES.find(t => t.id === activeThemeId) || THEMES[0];
  const canvasBg = catalog.backgroundColor || theme.backgroundColor;

  const [selectionBox, setSelectionBox] = useState<{ x1: number; y1: number; x2: number; y2: number; visible: boolean }>({
    x1: 0, y1: 0, x2: 0, y2: 0, visible: false
  });
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragOverTargetId, setDragOverTargetId] = useState<string | null>(null);

  const isSelecting = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);

  // Text editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editConfig, setEditConfig] = useState<any | null>(null);

  // Global trap for native browser zoom
  useEffect(() => {
    const handleGlobalWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
      }
    };

    window.addEventListener('wheel', handleGlobalWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', handleGlobalWheel);
    };
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const activeEl = document.activeElement as HTMLElement;
    if (activeEl?.tagName === 'INPUT' || activeEl?.tagName === 'TEXTAREA' || activeEl?.isContentEditable) {
      // For backspace/delete, we want to allow the event to proceed for the input but
      // NOT trigger our global element deletion logic.
      if (e.key === 'Backspace' || e.key === 'Delete') return;
      // Also skip nudging and other shortcuts if typing
      if (e.key.startsWith('Arrow') || (e.ctrlKey || e.metaKey)) {
        // We might want to allow some shortcuts (like Ctrl+B), but Arrow keys
        // should definitely move the cursor in the input, not the element on canvas.
        if (e.key.startsWith('Arrow')) return;
      }
    }

    const isMod = e.metaKey || e.ctrlKey;
    const nudgeAmount = e.shiftKey ? 10 : 1;

    switch (e.key) {
      case 'ArrowUp':
        if (selectedElementIds.length > 0) {
          e.preventDefault();
          if (!e.repeat) pushHistory();
          selectedElementIds.forEach(id => nudgeElement(currentPageIndex, id, 0, - nudgeAmount));
        }
        break;
      case 'ArrowDown':
        if (selectedElementIds.length > 0) {
          e.preventDefault();
          if (!e.repeat) pushHistory();
          selectedElementIds.forEach(id => nudgeElement(currentPageIndex, id, 0, nudgeAmount));
        }
        break;
      case 'ArrowLeft':
        if (selectedElementIds.length > 0) {
          e.preventDefault();
          if (!e.repeat) pushHistory();
          selectedElementIds.forEach(id => nudgeElement(currentPageIndex, id, -nudgeAmount, 0));
        }
        break;
      case 'ArrowRight':
        if (selectedElementIds.length > 0) {
          e.preventDefault();
          if (!e.repeat) pushHistory();
          selectedElementIds.forEach(id => nudgeElement(currentPageIndex, id, nudgeAmount, 0));
        }
        break;
      case 'Backspace':
      case 'Delete':
        if (selectedElementIds.length > 0) {
          const el = currentPage.elements.find(e => selectedElementIds.includes(e.id));
          if (el && !el.locked) {
            e.preventDefault();
            selectedElementIds.forEach(id => removeElement(currentPageIndex, id));
            setSelectedElementIds([]);
          }
        }
        break;
      case 'l':
      case 'L':
        if (isMod && e.shiftKey) {
          e.preventDefault();
          selectedElementIds.forEach(id => toggleLock(currentPageIndex, id));
        }
        break;
      case 'd':
        if (isMod) {
          e.preventDefault();
          selectedElementIds.forEach(id => duplicateElement(currentPageIndex, id));
        }
        break;
      case 'g':
      case 'G':
        if (isMod) {
          e.preventDefault();
          if (e.shiftKey) {
            ungroupSelected(currentPageIndex);
          } else {
            groupSelected(currentPageIndex);
          }
        }
        break;
      case 'z':
      case 'Z':
        if (isMod) {
          e.preventDefault();
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
        }
        break;
      case 'y':
      case 'Y':
        if (isMod) {
          e.preventDefault();
          redo();
        }
        break;
      case '=':
      case '+':
        if (isMod) { e.preventDefault(); setZoom(Math.min(3, zoom + 0.1)); }
        break;
      case '-':
        if (isMod) { e.preventDefault(); setZoom(Math.max(0.1, zoom - 0.1)); }
        break;
      case 'b':
      case 'B':
        if (isMod) {
          e.preventDefault();

          const activeEl = document.activeElement as HTMLElement;
          if (activeEl && activeEl.isContentEditable) {
            document.execCommand('bold');
          } else {
            selectedElementIds.forEach(id => {
              const el = currentPage.elements.find(e => e.id === id);
              if (el && el.type === 'text') {
                const isBold = el.fontWeight === 'bold' || el.fontWeight === '700' || el.fontWeight === '800';
                updateElement(currentPageIndex, id, { fontWeight: isBold ? '400' : '700' });
              }
            });
          }
        }
        break;
      case 'i':
      case 'I':
        if (isMod) {
          e.preventDefault();

          const activeEl = document.activeElement as HTMLElement;
          if (activeEl && activeEl.isContentEditable) {
            document.execCommand('italic');
          } else {
            selectedElementIds.forEach(id => {
              const el = currentPage.elements.find(e => e.id === id);
              if (el && el.type === 'text') {
                updateElement(currentPageIndex, id, { fontStyle: el.fontStyle === 'italic' ? 'normal' : 'italic' });
              }
            });
          }
        }
        break;
      case 'u':
      case 'U':
        if (isMod) {
          e.preventDefault();

          const activeEl = document.activeElement as HTMLElement;
          if (activeEl && activeEl.isContentEditable) {
            document.execCommand('underline');
          } else {
            selectedElementIds.forEach(id => {
              const el = currentPage.elements.find(e => e.id === id);
              if (el && el.type === 'text') {
                updateElement(currentPageIndex, id, { textDecoration: el.textDecoration === 'underline' ? 'none' : 'underline' });
              }
            });
          }
        }
        break;
      case 'Escape':
        setSelectedElementIds([]);
        setEditingId(null);
        setEditConfig(null);
        break;
    }
  }, [selectedElementIds, currentPageIndex, nudgeElement, removeElement, duplicateElement, undo, redo, zoom, setZoom, setSelectedElementIds, groupSelected, ungroupSelected, toggleLock, currentPage?.elements]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleStageMouseDown = (e: any) => {
    if (e.target === e.target.getStage() || e.target.name() === 'grid-background') {
      const pos = e.target.getStage().getPointerPosition();
      const x = pos.x / zoom;
      const y = pos.y / zoom;

      setSelectionBox({ x1: x, y1: y, x2: x, y2: y, visible: true });
      isSelecting.current = true;

      if (!e.evt.shiftKey) {
        setSelectedElementIds([]);
      }
    }
  };

  const handleStageMouseMove = (e: any) => {
    if (!isSelecting.current) return;
    const pos = e.target.getStage().getPointerPosition();
    const x = pos.x / zoom;
    const y = pos.y / zoom;
    setSelectionBox(prev => ({ ...prev, x2: x, y2: y }));
  };

  const handleStageMouseUp = (e: any) => {
    if (!isSelecting.current) return;
    isSelecting.current = false;

    const x = Math.min(selectionBox.x1, selectionBox.x2);
    const y = Math.min(selectionBox.y1, selectionBox.y2);
    const width = Math.abs(selectionBox.x2 - selectionBox.x1);
    const height = Math.abs(selectionBox.y2 - selectionBox.y1);

    if (width < 2 && height < 2) {
      setSelectionBox(prev => ({ ...prev, visible: false }));
      return;
    }

    const newlySelectedIds = currentPage.elements
      .filter(el => {
        return (
          el.x < x + width &&
          el.x + el.width > x &&
          el.y < y + height &&
          el.y + el.height > y
        );
      })
      .map(el => el.id);

    if (e.evt.shiftKey) {
      setSelectedElementIds([...new Set([...selectedElementIds, ...newlySelectedIds])]);
    } else {
      setSelectedElementIds(newlySelectedIds);
    }
    setSelectionBox(prev => ({ ...prev, visible: false }));
  };

  const handleWheel = (e: any) => {
    if (e.evt.ctrlKey || e.evt.metaKey) {
      e.evt.preventDefault();
      const step = 0.05;
      const direction = e.evt.deltaY > 0 ? -1 : 1;
      const newZoom = zoom + (direction * step);
      setZoom(Math.min(3, Math.max(0.1, newZoom)));
    }
  };

  const handleSelectElement = (id: string, isMulti: boolean) => {
    const clickedElement = currentPage.elements.find(el => el.id === id);
    let idsToSelect = [id];

    if (clickedElement?.groupId) {
      idsToSelect = currentPage.elements
        .filter(el => el.groupId === clickedElement.groupId)
        .map(el => el.id);
    }

    if (isMulti) {
      const allSelected = idsToSelect.every(item => selectedElementIds.includes(item));
      if (allSelected) {
        setSelectedElementIds(selectedElementIds.filter(sid => !idsToSelect.includes(sid)));
      } else {
        setSelectedElementIds([...new Set([...selectedElementIds, ...idsToSelect])]);
      }
    } else {
      setSelectedElementIds(idsToSelect);
    }
  };

  // --- REFINED DRAG & DROP LOGIC ---

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);

    // Snap behavior restricted to Interior (Product) pages
    if (!currentPage || currentPage.type !== 'interior') return;

    const stage = stageRef.current;
    if (!stage) return;

    const stageContainer = stage.container().getBoundingClientRect();
    const x = e.clientX - stageContainer.left;
    const y = e.clientY - stageContainer.top;

    // Konva's intersection logic requires coordinates relative to the Stage
    const intersectedNode = stage.getIntersection({ x, y });

    if (intersectedNode) {
      const id = intersectedNode.id();
      // Only snap to images or placeholders
      const el = currentPage.elements.find(e => e.id === id);
      if (el && (el.type === 'shape' || el.type === 'image')) {
        setDragOverTargetId(id);
        return;
      }
    }
    setDragOverTargetId(null);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
    setDragOverTargetId(null);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const targetId = dragOverTargetId;
    setDragOverTargetId(null);

    const stage = stageRef.current;
    if (!stage) return;

    const stageContainer = stage.container().getBoundingClientRect();
    const dropX = (e.clientX - stageContainer.left) / zoom;
    const dropY = (e.clientY - stageContainer.top) / zoom;

    // Library Item Handling
    const jsonData = e.dataTransfer.getData('application/json');
    if (jsonData) {
      try {
        const data = JSON.parse(jsonData) as any;
        if (data.type === 'image' || data.type === 'product') {
          if (targetId && currentPage.type === 'interior') {
            const targetEl = currentPage.elements.find(el => el.id === targetId);
            // ATOMIC REPLACEMENT: Conform new data to the target's geometry and theme
            updateElement(currentPageIndex, targetId, {
              type: targetEl?.type === 'product-block' ? 'product-block' : 'image',
              src: data.url,
              productId: data.productId,
              cardTheme: targetEl?.cardTheme || undefined,
              opacity: 1
            });
          } else {
            // Standard placement for free-form pages (Cover/Index)
            addElement(currentPageIndex, {
              id: `drop-${Date.now()}`,
              type: 'image',
              x: dropX - 150,
              y: dropY - 150,
              width: 300,
              height: 300,
              rotation: 0,
              opacity: 1,
              src: data.url,
              productId: data.productId,
              zIndex: 50
            });
          }
          return;
        }
      } catch (err) {
        console.error('Failed to parse dropped JSON', err);
      }
    }

    // Local Desktop File Handling
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files) as File[];
      const imageFiles = files.filter(f => f.type.startsWith('image/'));

      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];

        // Upload to backend
        addMedia(file);

        const reader = new FileReader();
        reader.onload = (event) => {
          const url = event.target?.result as string;

          if (targetId && i === 0 && currentPage.type === 'interior') {
            updateElement(currentPageIndex, targetId, {
              type: 'image',
              src: url,
              opacity: 1
            });
          } else {
            addElement(currentPageIndex, {
              id: `drop-file-${Date.now()}-${i}`,
              type: 'image',
              x: dropX - 100 + (i * 20),
              y: dropY - 100 + (i * 20),
              width: 250,
              height: 250,
              rotation: 0,
              opacity: 1,
              src: url,
              zIndex: 60
            });
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  if (!currentPage) return null;

  const snapTarget = dragOverTargetId ? currentPage.elements.find(el => el.id === dragOverTargetId) : null;

  // Handle double-click to enter text edit mode
  const handleStageDblClick = (e: any) => {
    if (e.target === e.target.getStage()) {
      setEditingId(null);
      setEditConfig(null);
      return;
    }

    const node = e.target;
    const element = currentPage.elements.find(el =>
      el.id === node.id() ||
      el.id === node.name() ||
      el.id === node.getParent()?.id() ||
      el.id === node.getParent()?.name()
    );

    if (element && element.type === 'text' && !element.locked) {
      pushHistory();
      setEditingId(element.id);
      setEditConfig({
        id: element.id,
        text: element.text || '',
        x: element.x,
        y: element.y,
        width: element.width,
        height: element.height,
        rotation: element.rotation || 0,
        fontSize: element.fontSize,
        fontFamily: element.fontFamily,
        fontWeight: element.fontWeight,
        fontStyle: element.fontStyle,
        align: element.textAlign || 'left',
        color: element.fill || '#000000'
      });
    } else {
      setEditingId(null);
      setEditConfig(null);
    }
  };

  // Handle text editing complete
  const handleTextEditComplete = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!editConfig) return;

    const newText = e.target.innerHTML;
    updateElement(currentPageIndex, editConfig.id, { text: newText });
    setEditingId(null);
    setEditConfig(null);
  };

  // Sync external updates to active editor
  useEffect(() => {
    if (editingId && currentPage) {
      const element = currentPage.elements.find(el => el.id === editingId);
      if (element) {
        setEditConfig(prev => ({
          ...prev,
          color: element.fill || '#000000',
          fontSize: element.fontSize,
          fontWeight: element.fontWeight || 'normal',
          fontStyle: element.fontStyle || 'normal',
          fontFamily: element.fontFamily,
          align: element.textAlign || 'left',
          text: element.text || ''
        }));
      }
    }
  }, [currentPage?.elements, editingId, currentPageIndex]);

  return (
    <div
      className={`flex-1 flex flex-col overflow-hidden relative transition-colors duration-500 ${uiTheme === 'dark' ? 'bg-slate-950' : 'bg-slate-100'}`}
      ref={containerRef}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setSelectedElementIds([]);
          setEditingId(null);
          setEditConfig(null);
        }
      }}
    >
      <div
        className={`flex-1 overflow-auto relative flex flex-col items-center custom-scrollbar p-16 pb-48 transition-colors duration-500 ${isDragOver ? (uiTheme === 'dark' ? 'bg-indigo-950/20' : 'bg-indigo-50/50') : (uiTheme === 'dark' ? 'bg-slate-900' : 'bg-[#e2e8f0]')}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setSelectedElementIds([]);
            setEditingId(null);
            setEditConfig(null);
          }
        }}
      >
        <div
          className={`shadow-[0_40px_100px_rgba(0,0,0,0.12)] relative bg-white border shrink-0 transition-all origin-top ${isDragOver ? 'border-indigo-400 scale-[1.002] ring-8 ring-indigo-600/5' : 'border-slate-300'}`}
          style={{ width: PAGE_WIDTH * zoom, height: PAGE_HEIGHT * zoom }}
        >
          {isDragOver && (
            <div className="absolute inset-0 z-[100] border-4 border-dashed border-indigo-500/30 pointer-events-none flex items-center justify-center bg-indigo-600/5 backdrop-blur-[1px]">
              {!snapTarget && (
                <div className="px-8 py-4 bg-white/90 backdrop-blur-md rounded-full shadow-2xl flex items-center gap-3 animate-in zoom-in duration-300 border border-indigo-100">
                  <div className="w-8 h-8 bg-indigo-600 rounded-[10px] flex items-center justify-center text-white shadow-lg">
                    <Plus size={20} />
                  </div>
                  <span className="text-sm font-black text-indigo-900 uppercase tracking-widest">Drop to Place</span>
                </div>
              )}
            </div>
          )}

          {/* Quick HUD for Snapping */}
          {snapTarget && (
            <div
              className="absolute z-[110] px-4 py-2 bg-indigo-600 text-white rounded-[10px] text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-2xl animate-in slide-in-from-top-2 duration-200"
              style={{
                left: snapTarget.x * zoom,
                top: (snapTarget.y * zoom) - 45
              }}
            >
              <Sparkles size={14} className="animate-pulse" />
              Auto-Fitting Asset
            </div>
          )}

          <KonvaStage
            ref={stageRef}
            width={PAGE_WIDTH * zoom}
            height={PAGE_HEIGHT * zoom}
            scaleX={zoom}
            scaleY={zoom}
            onMouseDown={handleStageMouseDown}
            onMouseMove={handleStageMouseMove}
            onMouseUp={handleStageMouseUp}
            onWheel={handleWheel}
            onDblClick={handleStageDblClick}
          >
            <KonvaLayer>
              <KonvaRect
                name="grid-background"
                width={PAGE_WIDTH}
                height={PAGE_HEIGHT}
                fill={canvasBg}
              />

              <KonvaGroup y={0} listening={false}>
                <KonvaRect width={PAGE_WIDTH} height={HEADER_FOOTER_HEIGHT} fill={canvasBg} />
                <KonvaLine points={[40, HEADER_FOOTER_HEIGHT, PAGE_WIDTH - 40, HEADER_FOOTER_HEIGHT]} stroke="#f1f5f9" strokeWidth={1} />
                <KonvaText text={catalog.headerText || ''} x={40} y={HEADER_FOOTER_HEIGHT / 2 - 5} fontSize={11} fontFamily={theme.headingFont} fontWeight="bold" fill={theme.headingColor} opacity={0.9} />
              </KonvaGroup>

              <KonvaGroup>
                {currentPage.elements.map((el) => (
                  <CanvasElementComponent
                    key={el.id}
                    element={el}
                    isSelected={selectedElementIds.includes(el.id)}
                    onSelect={(multi) => handleSelectElement(el.id, multi)}
                    onChange={(updates) => updateElement(currentPageIndex, el.id, updates)}
                    isEditing={editingId === el.id}
                  />
                ))}
              </KonvaGroup>

              {/* Holographic Snap Preview - Only on Interior (Product) Pages */}
              {snapTarget && draggingItem && currentPage.type === 'interior' && (
                <SnapPreview target={snapTarget} imageUrl={draggingItem.url} zoom={zoom} />
              )}

              {selectionBox.visible && (
                <KonvaRect
                  x={Math.min(selectionBox.x1, selectionBox.x2)}
                  y={Math.min(selectionBox.y1, selectionBox.y2)}
                  width={Math.abs(selectionBox.x2 - selectionBox.x1)}
                  height={Math.abs(selectionBox.y2 - selectionBox.y1)}
                  fill="rgba(79, 70, 229, 0.1)"
                  stroke="#4f46e5"
                  strokeWidth={1 / zoom}
                  dash={[4, 4]}
                />
              )}

              <KonvaGroup y={PAGE_HEIGHT - HEADER_FOOTER_HEIGHT} listening={false}>
                <KonvaRect width={PAGE_WIDTH} height={HEADER_FOOTER_HEIGHT} fill={canvasBg} />
                <KonvaLine points={[40, 0, PAGE_WIDTH - 40, 0]} stroke="#f1f5f9" strokeWidth={1} />
                <KonvaText text={catalog.footerText || ''} x={40} y={HEADER_FOOTER_HEIGHT / 2 - 4} fontSize={9} fontFamily={theme.fontFamily} fill={theme.bodyColor} opacity={0.6} />
                <KonvaText text={`${currentPage.type.toUpperCase()} | PAGE ${currentPageIndex + 1}`} x={PAGE_WIDTH - 150} y={HEADER_FOOTER_HEIGHT / 2 - 4} width={120} textAlign="right" fontSize={9} fontFamily={theme.fontFamily} fontWeight="900" fill={theme.headingColor} letterSpacing={1} />
              </KonvaGroup>
            </KonvaLayer>
          </KonvaStage>
        </div>
      </div>

      {editConfig && (
        <div
          className="absolute z-[1000] bg-white shadow-2xl border-2 border-indigo-500 rounded-lg"
          style={{
            left: (() => {
              if (!stageRef.current || !containerRef.current) return 0;
              const stageRect = stageRef.current.container().getBoundingClientRect();
              const containerRect = containerRef.current.getBoundingClientRect();
              return stageRect.left - containerRect.left + editConfig.x * zoom;
            })(),
            top: (() => {
              if (!stageRef.current || !containerRef.current) return 0;
              const stageRect = stageRef.current.container().getBoundingClientRect();
              const containerRect = containerRef.current.getBoundingClientRect();
              return stageRect.top - containerRect.top + editConfig.y * zoom;
            })(),
            width: editConfig.width * zoom,
            height: editConfig.height * zoom,
            transform: `rotate(${editConfig.rotation || 0}deg)`,
            transformOrigin: 'top left',
          }}
        >
          <div
            contentEditable
            suppressContentEditableWarning
            className="w-full h-full p-0 outline-none overflow-hidden [&_span]:bg-transparent [&_span]:text-inherit [&_span]:[-webkit-text-fill-color:inherit]"
            style={{
              fontSize: editConfig.fontSize * zoom,
              fontFamily: editConfig.fontFamily || 'Inter',
              fontWeight: editConfig.fontWeight,
              fontStyle: editConfig.fontStyle,
              textAlign: editConfig.align as any,
              lineHeight: 1.2,
              color: editConfig.color?.includes('gradient') ? '#475569' : editConfig.color,
              caretColor: '#4f46e5',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              padding: 5,
            }}
            onBlur={(e) => {
              handleTextEditComplete(e);
            }}
            onMouseUp={() => {
              // This helps ensure selection is active and can be captured 
              // by the Property Panel logic if focus moves there.
            }}
            onInput={(e) => {
              const newText = (e.currentTarget as HTMLElement).innerHTML;
              updateElement(currentPageIndex, editConfig.id, { text: newText });
            }}
            ref={(el) => {
              if (el && !el.dataset.initialized) {
                el.innerHTML = editConfig.text;
                el.dataset.initialized = 'true';
                const range = document.createRange();
                const sel = window.getSelection();
                range.selectNodeContents(el);
                range.collapse(false);
                sel?.removeAllRanges();
                sel?.addRange(range);
                el.focus();
              }
            }}
          />


          {/* Floating Format Toolbar */}
          <div className="absolute left-0 -top-12">
            <FloatingTextToolbar
              onBold={() => document.execCommand('bold')}
              onItalic={() => document.execCommand('italic')}
              onUnderline={() => document.execCommand('underline')}
            />
          </div>
        </div>
      )}

      <PageNavigator />
    </div>
  );
};

export default EditorCanvas;
