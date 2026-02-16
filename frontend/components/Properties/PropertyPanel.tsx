
import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Trash2, Eye, Palette, Layers, Ungroup, ChevronUp, ChevronDown, 
  ChevronsUp, ChevronsDown, Bold, Italic, Underline, EyeOff, Type,
  Lock, Unlock, DollarSign, Tag, Package, ExternalLink, Columns, Layout, Frame, Check,
  AlignLeft, AlignCenter, AlignRight, AlignJustify, 
  AlignStartVertical, AlignCenterVertical, AlignEndVertical,
  Minus, Plus, FileText, Settings, StickyNote, Maximize, Box, Hash, Upload, Image as ImageIcon
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { FONTS, CURRENCIES } from '../../constants';
import { CardTheme, LogoStyle, PaginationStyle } from '../../types';

const PropertyPanel: React.FC = () => {
  const { 
    catalog, currentPageIndex, selectedElementIds, updateElement, removeElement, 
    setIsPropertyPanelOpen, isPropertyPanelOpen,
    groupSelected, ungroupSelected, reorderElement, products, updateProduct, 
    alignElements, setView, setCatalogGlobalText, setCatalogBackgroundColor,
    updateCatalogVisuals
  } = useStore();
  
  const [position, setPosition] = useState({ x: window.innerWidth - 340, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  
  const dragRef = useRef({ 
    startX: 0, 
    startY: 0, 
    initialX: 0, 
    initialY: 0,
    currentX: window.innerWidth - 340,
    currentY: 80,
    isDragging: false,
    rafId: 0
  });

  const logoInputRef = useRef<HTMLInputElement>(null);

  const currentPage = catalog.pages[currentPageIndex];
  
  // Special Selection Handling
  const isHeaderSelected = selectedElementIds.includes('__HEADER__');
  const isFooterSelected = selectedElementIds.includes('__FOOTER__');
  
  const selectedElements = currentPage?.elements.filter(el => selectedElementIds.includes(el.id)) || [];
  const selectedElement = selectedElements.length === 1 ? selectedElements[0] : null;
  
  const isProductBlock = selectedElements.some(el => el.type === 'product-block');
  const isText = selectedElements.some(el => el.type === 'text');
  
  const linkedProduct = selectedElement?.productId ? products.find(p => p.id === selectedElement.productId) : null;

  useEffect(() => {
    if (!dragRef.current.isDragging) {
      dragRef.current.currentX = position.x;
      dragRef.current.currentY = position.y;
    }
  }, [position]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const handle = (e.target as HTMLElement).closest('.drag-handle');
    if (handle) {
      e.preventDefault();
      setIsDragging(true);
      dragRef.current.isDragging = true;
      dragRef.current.startX = e.clientX;
      dragRef.current.startY = e.clientY;
      dragRef.current.initialX = dragRef.current.currentX;
      dragRef.current.initialY = dragRef.current.currentY;
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    }
  };

  useEffect(() => {
    const updateStyle = () => {
      if (panelRef.current && dragRef.current.isDragging) {
        panelRef.current.style.transform = `translate3d(${dragRef.current.currentX}px, ${dragRef.current.currentY}px, 0)`;
      }
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current.isDragging) return;
      const dxRel = e.clientX - dragRef.current.startX;
      const dyRel = e.clientY - dragRef.current.startY;
      dragRef.current.currentX = dragRef.current.initialX + dxRel;
      dragRef.current.currentY = dragRef.current.initialY + dyRel;
      cancelAnimationFrame(dragRef.current.rafId);
      dragRef.current.rafId = requestAnimationFrame(updateStyle);
    };
    const handleMouseUp = () => {
      if (dragRef.current.isDragging) {
        dragRef.current.isDragging = false;
        setIsDragging(false);
        setPosition({ x: dragRef.current.currentX, y: dragRef.current.currentY });
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };
    if (isDragging) { 
      window.addEventListener('mousemove', handleMouseMove, { passive: true }); 
      window.addEventListener('mouseup', handleMouseUp); 
    }
    return () => { 
      window.removeEventListener('mousemove', handleMouseMove); 
      window.removeEventListener('mouseup', handleMouseUp); 
      cancelAnimationFrame(dragRef.current.rafId);
    };
  }, [isDragging]);

  const handleBatchUpdate = (updates: any) => {
    selectedElementIds.forEach(id => updateElement(currentPageIndex, id, updates));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateCatalogVisuals({ headerLogoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isPropertyPanelOpen) return null;

  const renderSectionHeader = (title: string, icon: React.ReactNode) => (
    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
      {icon} {title}
    </h4>
  );

  const cardThemes: { id: CardTheme; label: string; icon: any }[] = [
    { id: 'classic-stack', label: 'Stacked', icon: Layout },
    { id: 'split-row', label: 'Split', icon: Columns },
    { id: 'editorial-overlay', label: 'Overlay', icon: Frame }
  ];

  const logoStyles: { id: LogoStyle; label: string; icon: any }[] = [
    { id: 'text', label: 'Simple Text', icon: Type },
    { id: 'boxed', label: 'Boxed', icon: Maximize },
    { id: 'modern', label: 'Modern', icon: Minus },
    { id: 'none', label: 'Hidden', icon: Box }
  ];

  const paginationStyles: { id: PaginationStyle; label: string; preview: string }[] = [
    { id: 'simple', label: 'Classic', preview: 'P.1' },
    { id: 'pill', label: 'Badge', preview: '1/10' },
    { id: 'minimal', label: 'Minimal', preview: '| 01' },
    { id: 'none', label: 'Hidden', preview: '' }
  ];

  // --- RENDER: DOCUMENT SETTINGS (No Selection) ---
  if (selectedElementIds.length === 0) {
    return (
      <div 
        ref={panelRef}
        onMouseDown={(e) => e.stopPropagation()}
        className={`fixed top-0 left-0 w-[300px] bg-white border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[20px] backdrop-blur-xl overflow-hidden flex flex-col z-[2000] animate-in zoom-in-95 duration-200 ${isDragging ? 'cursor-grabbing select-none' : ''}`}
        style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)`, willChange: 'transform' }}
      >
        <div onMouseDown={handleMouseDown} className="drag-handle p-4 border-b bg-white flex items-center justify-between select-none cursor-grab active:cursor-grabbing">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest pointer-events-none">
             <div className="w-1.5 h-4 bg-indigo-500 rounded-full" />
             DOCUMENT SETTINGS
          </div>
          <div className="flex items-center gap-2">
             <button onClick={() => setIsPropertyPanelOpen(false)} className="p-1 text-slate-300 hover:text-slate-600 transition-colors">
                <X size={14} />
             </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-8 no-scrollbar pb-10">
          <section>
            {renderSectionHeader("CANVAS BACKGROUND", <Palette size={11} />)}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
               <input 
                 type="color" 
                 value={catalog.backgroundColor || '#ffffff'}
                 onChange={(e) => setCatalogBackgroundColor(e.target.value)}
                 className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0 bg-transparent"
               />
               <div className="flex flex-col">
                 <span className="text-[10px] font-black text-slate-700 uppercase">Fill Color</span>
                 <span className="text-[9px] font-mono text-slate-400">{catalog.backgroundColor || '#FFFFFF'}</span>
               </div>
            </div>
          </section>

          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-start gap-2">
             <Settings size={14} className="text-indigo-600 mt-0.5 shrink-0" />
             <p className="text-[9px] font-medium text-indigo-800 leading-relaxed">
               Click on the <b>Header</b> or <b>Footer</b> areas in the canvas to configure global page elements.
             </p>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER: HEADER / FOOTER CONFIG ---
  if (isHeaderSelected || isFooterSelected) {
    const isHeader = isHeaderSelected;
    const heightKey = isHeader ? 'headerHeight' : 'footerHeight';
    const marginKey = isHeader ? 'headerSideMargin' : 'footerSideMargin';
    const fontFamilyKey = isHeader ? 'headerFontFamily' : 'footerFontFamily';
    const fontSizeKey = isHeader ? 'headerFontSize' : 'footerFontSize';

    const currentHeight = (isHeader ? catalog.headerHeight : catalog.footerHeight) || 38;
    const currentMargin = (isHeader ? catalog.headerSideMargin : catalog.footerSideMargin) || 40;
    const currentFontFamily = (isHeader ? catalog.headerFontFamily : catalog.footerFontFamily) || 'Inter';
    const currentFontSize = (isHeader ? catalog.headerFontSize : catalog.footerFontSize) || (isHeader ? 11 : 9);

    return (
      <div 
        ref={panelRef}
        onMouseDown={(e) => e.stopPropagation()}
        className={`fixed top-0 left-0 w-[300px] bg-white border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[20px] backdrop-blur-xl overflow-hidden flex flex-col z-[2000] animate-in zoom-in-95 duration-200 ${isDragging ? 'cursor-grabbing select-none' : ''}`}
        style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)`, willChange: 'transform' }}
      >
        <div onMouseDown={handleMouseDown} className="drag-handle p-4 border-b bg-white flex items-center justify-between select-none cursor-grab active:cursor-grabbing">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest pointer-events-none">
             <div className="w-1.5 h-4 bg-indigo-500 rounded-full" />
             {isHeader ? 'HEADER CONFIG' : 'FOOTER CONFIG'}
          </div>
          <div className="flex items-center gap-2">
             <button onClick={() => setIsPropertyPanelOpen(false)} className="p-1 text-slate-300 hover:text-slate-600 transition-colors">
                <X size={14} />
             </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-8 no-scrollbar pb-10">
          
          <section>
            {renderSectionHeader("DIMENSIONS & SPACING", <Layout size={11} />)}
            <div className="space-y-4">
               <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Height</label>
                    <span className="text-[9px] font-mono text-slate-500">{currentHeight}px</span>
                  </div>
                  <input 
                    type="range" 
                    min="20" 
                    max="150" 
                    step="2"
                    value={currentHeight}
                    onChange={(e) => updateCatalogVisuals({ [heightKey]: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
               </div>
               <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Side Margin</label>
                    <span className="text-[9px] font-mono text-slate-500">{currentMargin}px</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="200" 
                    step="5"
                    value={currentMargin}
                    onChange={(e) => updateCatalogVisuals({ [marginKey]: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
               </div>
            </div>
          </section>

          <section>
            {renderSectionHeader("TYPOGRAPHY", <Type size={11} />)}
            <div className="space-y-4">
               {/* Font Selection */}
               <div className="space-y-2">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Font Family</label>
                  <select 
                    value={currentFontFamily}
                    onChange={(e) => updateCatalogVisuals({ [fontFamilyKey]: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none"
                  >
                    {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
               </div>

               {/* Font Size */}
               <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Font Size</label>
                    <span className="text-[9px] font-mono text-slate-500">{currentFontSize}px</span>
                  </div>
                  <input 
                    type="range" 
                    min="6" 
                    max="36" 
                    step="1"
                    value={currentFontSize}
                    onChange={(e) => updateCatalogVisuals({ [fontSizeKey]: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
               </div>
            </div>
          </section>

          {isHeader && (
            <section>
              {renderSectionHeader("BRAND ASSETS", <ImageIcon size={11} />)}
              <div className="space-y-4">
                {catalog.headerLogoUrl ? (
                  <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                    <img src={catalog.headerLogoUrl} alt="Logo Preview" className="h-16 w-full object-contain p-2" />
                    <button 
                      onClick={() => updateCatalogVisuals({ headerLogoUrl: undefined })}
                      className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white font-bold text-xs"
                    >
                      <Trash2 size={16} className="mr-2" /> Remove
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => logoInputRef.current?.click()}
                    className="w-full h-16 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all text-xs font-bold gap-2"
                  >
                    <Upload size={14} /> Upload Logo
                  </button>
                )}
                <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                
                {catalog.headerLogoUrl && (
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Logo Alignment</label>
                    <div className="flex bg-slate-100 rounded-lg p-1">
                      {['left', 'center', 'right'].map((align) => (
                        <button
                          key={align}
                          onClick={() => updateCatalogVisuals({ headerLogoAlignment: align as any })}
                          className={`flex-1 py-1.5 rounded-md flex items-center justify-center transition-all ${catalog.headerLogoAlignment === align ? 'bg-white shadow text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                          {align === 'left' && <AlignLeft size={14} />}
                          {align === 'center' && <AlignCenter size={14} />}
                          {align === 'right' && <AlignRight size={14} />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          <section>
            {renderSectionHeader(isHeader ? "BRAND & TEXT" : "COPYRIGHT & TEXT", <Type size={11} />)}
            <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">{isHeader ? "Header Title" : "Footer Text"}</label>
                  <input 
                    type="text" 
                    value={isHeader ? (catalog.headerText || '') : (catalog.footerText || '')}
                    onChange={(e) => setCatalogGlobalText(isHeader ? e.target.value : undefined, isHeader ? undefined : e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-indigo-300 transition-all"
                    placeholder="e.g. Company Name"
                  />
                </div>

                {isHeader && (
                  <>
                    <div className="flex items-center justify-between mt-3 bg-indigo-50 p-2.5 rounded-xl border border-indigo-100">
                      <span className="text-[9px] font-bold text-indigo-900 uppercase tracking-tight">Use Category Name</span>
                      <button 
                        onClick={() => updateCatalogVisuals({ showCategoryTitleInHeader: !catalog.showCategoryTitleInHeader })}
                        className={`w-8 h-4 rounded-full transition-colors relative ${catalog.showCategoryTitleInHeader ? 'bg-indigo-600' : 'bg-slate-300'}`}
                      >
                        <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${catalog.showCategoryTitleInHeader ? 'translate-x-4' : ''}`} />
                      </button>
                    </div>

                    <div className="space-y-2 mt-4">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Text Alignment</label>
                      <div className="flex bg-slate-100 rounded-lg p-1">
                        {['left', 'center', 'right'].map((align) => (
                          <button
                            key={align}
                            onClick={() => updateCatalogVisuals({ headerTextAlignment: align as any })}
                            className={`flex-1 py-1.5 rounded-md flex items-center justify-center transition-all ${catalog.headerTextAlignment === align ? 'bg-white shadow text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                          >
                            {align === 'left' && <AlignLeft size={14} />}
                            {align === 'center' && <AlignCenter size={14} />}
                            {align === 'right' && <AlignRight size={14} />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
            </div>
          </section>

          {isHeader && (
            <section>
              {renderSectionHeader("TEXT PRESENTATION", <Layout size={11} />)}
              <div className="grid grid-cols-2 gap-2">
                {logoStyles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => updateCatalogVisuals({ logoStyle: style.id })}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${catalog.logoStyle === style.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100'}`}
                  >
                    <style.icon size={16} />
                    <span className="text-[8px] font-black uppercase tracking-tighter">{style.label}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {!isHeader && (
            <section>
              {renderSectionHeader("PAGINATION STYLE", <Hash size={11} />)}
              <div className="grid grid-cols-2 gap-2">
                {paginationStyles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => updateCatalogVisuals({ paginationStyle: style.id })}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${catalog.paginationStyle === style.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100'}`}
                  >
                    <div className="h-4 flex items-center justify-center font-mono font-bold text-[9px] bg-black/10 px-2 rounded opacity-80">
                       {style.preview || '---'}
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-tighter">{style.label}</span>
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    );
  }

  // --- RENDER: ELEMENT PROPERTIES (Selection Active) ---
  return (
    <div 
      ref={panelRef}
      onMouseDown={(e) => e.stopPropagation()}
      className={`fixed top-0 left-0 w-[300px] bg-white border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[20px] backdrop-blur-xl overflow-hidden flex flex-col z-[2000] animate-in zoom-in-95 duration-200 ${isDragging ? 'cursor-grabbing select-none' : ''}`}
      style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)`, willChange: 'transform' }}
    >
      <div onMouseDown={handleMouseDown} className="drag-handle p-4 border-b bg-white flex items-center justify-between select-none cursor-grab active:cursor-grabbing">
        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest pointer-events-none">
           <div className="w-1.5 h-4 bg-indigo-500 rounded-full" />
           {isProductBlock ? 'PRODUCT CONFIG' : isText ? 'TYPOGRAPHY' : 'ELEMENT CONTROL'}
        </div>
        <div className="flex items-center gap-2">
           <button onClick={() => selectedElementIds.forEach(id => removeElement(currentPageIndex, id))} className="p-1 text-slate-300 hover:text-red-500 transition-colors">
              <Trash2 size={14} />
           </button>
           <button onClick={() => setIsPropertyPanelOpen(false)} className="p-1 text-slate-300 hover:text-slate-600 transition-colors">
              <X size={14} />
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-8 no-scrollbar pb-10">
        
        {/* SPATIAL ALIGNMENT (Visible for all types) */}
        <section>
          {renderSectionHeader("SPATIAL ALIGNMENT", <Layout size={11} />)}
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => alignElements(currentPageIndex, selectedElementIds, 'left')} className="p-2.5 bg-slate-50 text-slate-500 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all flex items-center justify-center border border-slate-100" title="Align Left"><AlignLeft size={16} /></button>
            <button onClick={() => alignElements(currentPageIndex, selectedElementIds, 'center')} className="p-2.5 bg-slate-50 text-slate-500 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all flex items-center justify-center border border-slate-100" title="Align Horizontal Center"><AlignCenter size={16} /></button>
            <button onClick={() => alignElements(currentPageIndex, selectedElementIds, 'right')} className="p-2.5 bg-slate-50 text-slate-500 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all flex items-center justify-center border border-slate-100" title="Align Right"><AlignRight size={16} /></button>
            
            <button onClick={() => alignElements(currentPageIndex, selectedElementIds, 'top')} className="p-2.5 bg-slate-50 text-slate-500 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all flex items-center justify-center border border-slate-100" title="Align Top"><AlignStartVertical size={16} /></button>
            <button onClick={() => alignElements(currentPageIndex, selectedElementIds, 'middle')} className="p-2.5 bg-slate-50 text-slate-500 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all flex items-center justify-center border border-slate-100" title="Align Vertical Middle"><AlignCenterVertical size={16} /></button>
            <button onClick={() => alignElements(currentPageIndex, selectedElementIds, 'bottom')} className="p-2.5 bg-slate-50 text-slate-500 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all flex items-center justify-center border border-slate-100" title="Align Bottom"><AlignEndVertical size={16} /></button>
          </div>
        </section>

        {/* TEXT SPECIFIC CONTROLS */}
        {isText && (
          <section className="animate-in slide-in-from-top-2">
            {renderSectionHeader("TEXT FORMATTING", <Type size={11} />)}
            
            {/* Font and Size */}
            <div className="flex gap-2 mb-4">
               <select 
                  value={selectedElement?.fontFamily || 'Inter'}
                  onChange={(e) => handleBatchUpdate({ fontFamily: e.target.value })}
                  className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none"
               >
                  {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
               </select>
               <div className="flex items-center bg-slate-50 border border-slate-100 rounded-xl overflow-hidden">
                  <button onClick={() => handleBatchUpdate({ fontSize: Math.max(1, (selectedElement?.fontSize || 12) - 1) })} className="p-2 hover:bg-slate-100 text-slate-400"><Minus size={12}/></button>
                  <span className="w-8 text-center text-[10px] font-black text-slate-700">{selectedElement?.fontSize || 12}</span>
                  <button onClick={() => handleBatchUpdate({ fontSize: (selectedElement?.fontSize || 12) + 1 })} className="p-2 hover:bg-slate-100 text-slate-400"><Plus size={12}/></button>
               </div>
            </div>

            {/* Alignment & Style Row */}
            <div className="flex gap-2">
               <div className="flex bg-slate-900 rounded-xl p-1 shadow-inner gap-0.5">
                  <button 
                    onClick={() => handleBatchUpdate({ textAlign: 'left' })}
                    className={`p-2 rounded-lg transition-all ${selectedElement?.textAlign === 'left' || !selectedElement?.textAlign ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                  >
                    <AlignLeft size={14} />
                  </button>
                  <button 
                    onClick={() => handleBatchUpdate({ textAlign: 'center' })}
                    className={`p-2 rounded-lg transition-all ${selectedElement?.textAlign === 'center' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                  >
                    <AlignCenter size={14} />
                  </button>
                  <button 
                    onClick={() => handleBatchUpdate({ textAlign: 'right' })}
                    className={`p-2 rounded-lg transition-all ${selectedElement?.textAlign === 'right' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                  >
                    <AlignRight size={14} />
                  </button>
               </div>

               <div className="flex bg-slate-50 border border-slate-100 rounded-xl p-1 gap-0.5 ml-auto">
                  <button 
                    onClick={() => handleBatchUpdate({ fontWeight: selectedElement?.fontWeight === '700' ? '400' : '700' })}
                    className={`p-2 rounded-lg transition-all ${selectedElement?.fontWeight === '700' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <Bold size={14} />
                  </button>
                  <button 
                    onClick={() => handleBatchUpdate({ fontStyle: selectedElement?.fontStyle === 'italic' ? 'normal' : 'italic' })}
                    className={`p-2 rounded-lg transition-all ${selectedElement?.fontStyle === 'italic' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <Italic size={14} />
                  </button>
               </div>
            </div>
          </section>
        )}

        {/* Card Specific Variations */}
        {isProductBlock && (
          <section className="animate-in slide-in-from-top-2">
            {renderSectionHeader("CARD ARCHITECTURE", <Layout size={11} />)}
            <div className="grid grid-cols-3 gap-2">
              {cardThemes.map(t => (
                <button 
                  key={t.id}
                  onClick={() => handleBatchUpdate({ cardTheme: t.id })}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${selectedElement?.cardTheme === t.id || (!selectedElement?.cardTheme && t.id === 'classic-stack') ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100'}`}
                >
                  <t.icon size={18} />
                  <span className="text-[8px] font-black uppercase tracking-tighter">{t.label}</span>
                </button>
              ))}
            </div>

            <div className="mt-6 space-y-2">
              <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-3">CONTENT VISIBILITY</p>
              {[
                { key: 'showName', label: 'Product Name' },
                { key: 'showPrice', label: 'Retail Price' },
                { key: 'showSku', label: 'SKU / ID' }
              ].map(opt => (
                <button 
                  key={opt.key}
                  onClick={() => handleBatchUpdate({ [opt.key]: (selectedElement as any)[opt.key] === false })}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 group hover:border-indigo-200 transition-all"
                >
                  <span className="text-[10px] font-bold text-slate-600">{opt.label}</span>
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${(selectedElement as any)[opt.key] !== false ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-transparent'}`}>
                    <Check size={12} strokeWidth={4} />
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Linked Asset Info */}
        {isProductBlock && linkedProduct && (
            <section>
               {renderSectionHeader("SOURCE DATA", <Package size={11} />)}
               <div className="p-3 bg-indigo-600 rounded-xl text-white space-y-2 shadow-lg shadow-indigo-600/20">
                  <p className="text-[10px] font-mono font-bold opacity-60 uppercase">{linkedProduct.sku}</p>
                  <p className="text-xs font-black truncate">{linkedProduct.name}</p>
               </div>
            </section>
        )}

        {/* Position & Order */}
        <section>
          {renderSectionHeader("LAYER STACKING", <Layers size={11} />)}
          <div className="grid grid-cols-4 gap-2">
            <button onClick={() => reorderElement(currentPageIndex, selectedElementIds[0], 'front')} className="p-2.5 bg-slate-50 text-slate-500 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all flex items-center justify-center shadow-sm" title="Bring to Front"><ChevronsUp size={16} /></button>
            <button onClick={() => reorderElement(currentPageIndex, selectedElementIds[0], 'forward')} className="p-2.5 bg-slate-50 text-slate-500 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all flex items-center justify-center shadow-sm" title="Bring Forward"><ChevronUp size={16} /></button>
            <button onClick={() => reorderElement(currentPageIndex, selectedElementIds[0], 'backward')} className="p-2.5 bg-slate-50 text-slate-500 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all flex items-center justify-center shadow-sm" title="Send Backward"><ChevronDown size={16} /></button>
            <button onClick={() => reorderElement(currentPageIndex, selectedElementIds[0], 'back')} className="p-2.5 bg-slate-50 text-slate-500 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all flex items-center justify-center shadow-sm" title="Send to Back"><ChevronsDown size={16} /></button>
          </div>
        </section>

        {/* Visibility */}
        <section>
          {renderSectionHeader("CONTROL FLAGS", <Eye size={11} />)}
          <div className="flex gap-2">
             <button onClick={() => handleBatchUpdate({ visible: selectedElement?.visible === false })} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-50 text-slate-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100">
                {selectedElement?.visible === false ? <EyeOff size={14}/> : <Eye size={14}/>} {selectedElement?.visible === false ? 'Hidden' : 'Visible'}
             </button>
             <button onClick={() => handleBatchUpdate({ locked: !selectedElement?.locked })} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${selectedElement?.locked ? 'bg-indigo-600 text-white shadow-lg border-transparent' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border-slate-100'}`}>
                {selectedElement?.locked ? <Lock size={14}/> : <Unlock size={14}/>} {selectedElement?.locked ? 'Locked' : 'Unlocked'}
             </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PropertyPanel;
