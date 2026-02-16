
import React, { useEffect, useCallback, useState, useRef, useMemo } from 'react';
import { Stage as KonvaStage, Layer as KonvaLayer, Rect as KonvaRect, Text as KonvaText, Group as KonvaGroup, Line as KonvaLine, Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';
import { Images, Plus, Sparkles } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { PAGE_WIDTH, PAGE_HEIGHT, THEMES, HEADER_FOOTER_HEIGHT } from '../../constants';
import CanvasElementComponent from './CanvasElement';
import PageNavigator from './PageNavigator';

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

const CanvasHeader: React.FC<{
  catalog: any;
  theme: any;
  selectedElementIds: string[];
  hoveredZone: string | null;
  setHoveredZone: (z: 'header' | 'footer' | null) => void;
  setSelectedElementIds: (ids: string[]) => void;
  headerTextOverride?: string;
}> = ({ catalog, theme, selectedElementIds, hoveredZone, setHoveredZone, setSelectedElementIds, headerTextOverride }) => {
  const isSelected = selectedElementIds.includes('__HEADER__');
  const isHovered = hoveredZone === 'header';
  const [logoImage] = useImage(catalog.headerLogoUrl || '', 'anonymous');

  const handleZoneClick = (e: any) => {
    e.cancelBubble = true;
    setSelectedElementIds(['__HEADER__']);
  };

  const textString = headerTextOverride || catalog.headerText || '';

  // Layout Logic
  const height = catalog.headerHeight || HEADER_FOOTER_HEIGHT;
  const padding = catalog.headerSideMargin || 40;
  const fontFamily = catalog.headerFontFamily || theme.headingFont;
  const fontSize = catalog.headerFontSize || 11;
  
  const logoHeight = Math.min(24, height - 10); // Dynamic scale limit
  const logoWidth = logoImage ? (logoImage.width / logoImage.height) * logoHeight : 0;
  
  const getX = (alignment: 'left' | 'center' | 'right', width: number) => {
    if (alignment === 'center') return (PAGE_WIDTH / 2) - (width / 2);
    if (alignment === 'right') return PAGE_WIDTH - padding - width;
    return padding;
  };

  // Collision handling for left/left or right/right
  const logoAlign = catalog.headerLogoAlignment || 'left';
  const textAlign = catalog.headerTextAlignment || 'left';
  
  let logoX = getX(logoAlign, logoWidth);
  let textX = 0; // Calculated below based on text width approximation, refined in render

  // Determine standard text block width for alignment calculation
  const textApproxWidth = textString.length * (fontSize * 0.7); // Approximation based on font size
  
  textX = getX(textAlign, textApproxWidth);

  // Offset logic if they collide on the same side
  if (catalog.headerLogoUrl) {
    if (logoAlign === 'left' && textAlign === 'left') {
        textX += logoWidth + 15;
    } else if (logoAlign === 'right' && textAlign === 'right') {
        textX -= (logoWidth + 15);
    }
  }

  const renderText = () => {
    if (catalog.logoStyle === 'boxed') {
        return (
          <KonvaGroup x={textX} y={(height - (fontSize * 2.5)) / 2} listening={false}>
             <KonvaRect width={Math.min(200, textApproxWidth + 20)} height={fontSize * 2.5} fill={theme.headingColor} cornerRadius={4} />
             <KonvaText 
               text={textString} 
               x={10} 
               y={fontSize * 0.7} 
               fontSize={fontSize} 
               fontFamily={fontFamily} 
               fontWeight="bold" 
               fill="#ffffff" 
             />
          </KonvaGroup>
        );
    }
    if (catalog.logoStyle === 'modern') {
        return (
          <KonvaGroup x={textX} y={height / 2 - (fontSize * 0.5)} listening={false}>
             <KonvaRect x={-10} y={-fontSize * 0.4} width={4} height={fontSize * 1.8} fill={theme.accentColor} />
             <KonvaText 
               text={textString} 
               x={0} 
               y={0} 
               fontSize={fontSize} 
               fontFamily={fontFamily} 
               fontWeight="bold" 
               fill={theme.headingColor} 
               opacity={0.9} 
             />
          </KonvaGroup>
        );
    }
    if (catalog.logoStyle === 'text') {
        return (
          <KonvaText 
            text={textString} 
            x={textX} 
            y={height / 2 - (fontSize * 0.5)} 
            fontSize={fontSize} 
            fontFamily={fontFamily} 
            fontWeight="bold" 
            fill={theme.headingColor} 
            opacity={0.9} 
            listening={false}
          />
        );
    }
    return null;
  };

  return (
    <KonvaGroup 
        y={0} 
        onClick={handleZoneClick}
        onTap={handleZoneClick}
        onMouseEnter={() => { document.body.style.cursor = 'pointer'; setHoveredZone('header'); }}
        onMouseLeave={() => { document.body.style.cursor = 'default'; setHoveredZone(null); }}
      >
        <KonvaRect 
          width={PAGE_WIDTH} 
          height={height} 
          fill={catalog.backgroundColor || theme.backgroundColor} 
        />
        
        {(isSelected || isHovered) && (
          <KonvaRect 
            width={PAGE_WIDTH} 
            height={height} 
            stroke="#4f46e5" 
            strokeWidth={isSelected ? 2 : 1}
            dash={isSelected ? [] : [4, 4]}
            fill={isHovered ? 'rgba(79, 70, 229, 0.05)' : undefined}
          />
        )}
        
        <KonvaLine points={[padding, height, PAGE_WIDTH - padding, height]} stroke="#f1f5f9" strokeWidth={1} listening={false} />
        
        {catalog.headerLogoUrl && logoImage && (
            <KonvaImage 
                image={logoImage}
                x={logoX}
                y={(height - logoHeight) / 2}
                width={logoWidth}
                height={logoHeight}
                listening={false}
            />
        )}

        {renderText()}
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
    categories
  } = useStore();
  
  const currentPage = catalog.pages[currentPageIndex];
  const theme = THEMES.find(t => t.id === activeThemeId) || THEMES[0];
  const canvasBg = catalog.backgroundColor || theme.backgroundColor;

  const currentCategory = currentPage?.categoryId ? categories.find(c => c.id === currentPage.categoryId) : null;

  const [selectionBox, setSelectionBox] = useState<{ x1: number; y1: number; x2: number; y2: number; visible: boolean }>({
    x1: 0, y1: 0, x2: 0, y2: 0, visible: false
  });
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragOverTargetId, setDragOverTargetId] = useState<string | null>(null);
  const [hoveredZone, setHoveredZone] = useState<'header' | 'footer' | null>(null);
  
  const isSelecting = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);

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
    const activeEl = document.activeElement;
    if (activeEl?.tagName === 'INPUT' || activeEl?.tagName === 'TEXTAREA') return;

    const isMod = e.metaKey || e.ctrlKey;
    const nudgeAmount = e.shiftKey ? 10 : 1;

    switch (e.key) {
      case 'ArrowUp':
        if (selectedElementIds.length > 0) { 
          e.preventDefault(); 
          selectedElementIds.forEach(id => nudgeElement(currentPageIndex, id, 0, - nudgeAmount)); 
        }
        break;
      case 'ArrowDown':
        if (selectedElementIds.length > 0) { 
          e.preventDefault(); 
          selectedElementIds.forEach(id => nudgeElement(currentPageIndex, id, 0, nudgeAmount)); 
        }
        break;
      case 'ArrowLeft':
        if (selectedElementIds.length > 0) { 
          e.preventDefault(); 
          selectedElementIds.forEach(id => nudgeElement(currentPageIndex, id, -nudgeAmount, 0)); 
        }
        break;
      case 'ArrowRight':
        if (selectedElementIds.length > 0) { 
          e.preventDefault(); 
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
      case 'Escape':
        setSelectedElementIds([]);
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

  const handleZoneClick = (e: any, zone: 'header' | 'footer') => {
    e.cancelBubble = true;
    setSelectedElementIds([zone === 'header' ? '__HEADER__' : '__FOOTER__']);
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
             // ATOMIC REPLACEMENT: Conform new data to the target's geometry
             updateElement(currentPageIndex, targetId, {
               type: 'image',
               src: data.url,
               productId: data.productId,
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

          addMedia({
            id: `upload-${Date.now()}-${i}`,
            name: file.name,
            type: 'image',
            url,
            thumbnailUrl: url,
            createdAt: new Date().toISOString(),
            size: `${(file.size / 1024).toFixed(1)} KB`
          });
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const renderFooter = () => {
    if (catalog.paginationStyle === 'none') return null;
    const isSelected = selectedElementIds.includes('__FOOTER__');
    const isHovered = hoveredZone === 'footer';

    const height = catalog.footerHeight || HEADER_FOOTER_HEIGHT;
    const padding = catalog.footerSideMargin || 40;
    const fontFamily = catalog.footerFontFamily || theme.fontFamily;
    const fontSize = catalog.footerFontSize || 9;

    let pageText = `${currentPageIndex + 1}`;
    let pageLabelWidth = 20;
    
    if (catalog.paginationStyle === 'minimal') {
      pageText = `|  ${(currentPageIndex + 1).toString().padStart(2, '0')}`;
      pageLabelWidth = 40;
    } else if (catalog.paginationStyle === 'pill') {
      pageText = `${currentPageIndex + 1} / ${catalog.pages.length}`;
      pageLabelWidth = 50;
    } else if (catalog.paginationStyle === 'simple') {
      pageText = `PAGE ${currentPageIndex + 1}`;
      pageLabelWidth = 60;
    }

    return (
      <KonvaGroup 
        y={PAGE_HEIGHT - height} 
        onClick={(e) => handleZoneClick(e, 'footer')}
        onTap={(e) => handleZoneClick(e, 'footer')}
        onMouseEnter={() => { document.body.style.cursor = 'pointer'; setHoveredZone('footer'); }}
        onMouseLeave={() => { document.body.style.cursor = 'default'; setHoveredZone(null); }}
      >
        <KonvaRect width={PAGE_WIDTH} height={height} fill={canvasBg} />
        
        {/* Interaction Highlight */}
        {(isSelected || isHovered) && (
          <KonvaRect 
            width={PAGE_WIDTH} 
            height={height} 
            stroke="#4f46e5" 
            strokeWidth={isSelected ? 2 : 1}
            dash={isSelected ? [] : [4, 4]}
            fill={isHovered ? 'rgba(79, 70, 229, 0.05)' : undefined}
          />
        )}

        <KonvaLine points={[padding, 0, PAGE_WIDTH - padding, 0]} stroke="#f1f5f9" strokeWidth={1} listening={false} />
        
        <KonvaText 
          text={catalog.footerText || ''} 
          x={padding} 
          y={height / 2 - (fontSize * 0.5)} 
          fontSize={fontSize} 
          fontFamily={fontFamily} 
          fill={theme.bodyColor} 
          opacity={0.6} 
          listening={false}
        />

        {catalog.paginationStyle === 'pill' ? (
           <KonvaGroup x={PAGE_WIDTH - padding - pageLabelWidth} y={height / 2 - 10} listening={false}>
              <KonvaRect width={pageLabelWidth} height={20} fill={theme.bodyColor} opacity={0.1} cornerRadius={10} />
              <KonvaText 
                text={pageText} 
                width={pageLabelWidth} 
                height={20}
                offsetY={-4}
                align="center"
                fontSize={fontSize} 
                fontFamily="Inter" 
                fontWeight="bold" 
                fill={theme.headingColor} 
              />
           </KonvaGroup>
        ) : (
           <KonvaText 
             text={pageText} 
             x={PAGE_WIDTH - padding - pageLabelWidth} 
             y={height / 2 - (fontSize * 0.5)} 
             width={pageLabelWidth} 
             align="right"
             fontSize={fontSize} 
             fontFamily={theme.fontFamily} 
             fontWeight="900" 
             fill={theme.headingColor} 
             letterSpacing={1} 
             listening={false}
           />
        )}
      </KonvaGroup>
    );
  };

  if (!currentPage) return null;

  const snapTarget = dragOverTargetId ? currentPage.elements.find(el => el.id === dragOverTargetId) : null;

  return (
    <div className="flex-1 flex flex-col bg-slate-100 overflow-hidden relative" ref={containerRef}>
      <div 
        className={`flex-1 overflow-auto relative flex flex-col items-center custom-scrollbar p-16 transition-colors duration-300 ${isDragOver ? 'bg-indigo-50/50' : 'bg-[#e2e8f0]'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
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
          >
            <KonvaLayer>
              <KonvaRect 
                name="grid-background"
                width={PAGE_WIDTH} 
                height={PAGE_HEIGHT} 
                fill={canvasBg} 
              />
              
              <CanvasHeader 
                catalog={catalog} 
                theme={theme} 
                selectedElementIds={selectedElementIds} 
                hoveredZone={hoveredZone} 
                setHoveredZone={setHoveredZone} 
                setSelectedElementIds={setSelectedElementIds}
                headerTextOverride={catalog.showCategoryTitleInHeader ? currentCategory?.name : undefined}
              />

              <KonvaGroup>
                {currentPage.elements.map((el) => (
                  <CanvasElementComponent 
                    key={el.id} 
                    element={el} 
                    isSelected={selectedElementIds.includes(el.id)} 
                    onSelect={(multi) => handleSelectElement(el.id, multi)} 
                    onChange={(updates) => updateElement(currentPageIndex, el.id, updates)} 
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

              {renderFooter()}
            </KonvaLayer>
          </KonvaStage>
        </div>
      </div>

      <PageNavigator />
    </div>
  );
};

export default EditorCanvas;
