import React, { useState } from 'react';
import {
  X, Type, Palette, AlignLeft, AlignCenter,
  AlignRight, AlignVerticalJustifyStart, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd, Minus, Plus, ChevronDown,
  Layers, Trash2, Copy, Lock, Unlock,
  Sparkles, Sliders, Bold, Italic, Underline,
  ChevronUp, ChevronDown as ChevronDownIcon,
  ChevronsUp, ChevronsDown, MousePointer2
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { FONTS, CATEGORIZED_FONTS, PAGE_WIDTH, PAGE_HEIGHT } from '../../constants';
import AdvancedColorPicker from './AdvancedColorPicker';
import { toggleStyle } from '../../utils/textStyleSelection';

const PropertyPanel: React.FC = () => {
  const {
    selectedElementIds,
    updateElement,
    catalog,
    currentPageIndex,
    isPropertyPanelOpen,
    setIsPropertyPanelOpen,
    removeElement,
    duplicateElement,
    toggleLock,
    reorderElement,
    uiTheme,
    setEditorTab,
    setSidebarExpanded,
    updateCatalog
  } = useStore();

  const [pickerOpen, setPickerOpen] = useState(false);

  const currentPage = catalog.pages[currentPageIndex];
  const selectedElements = currentPage?.elements.filter(el => selectedElementIds.includes(el.id)) || [];
  const selectedElement = selectedElements.length === 1 ? selectedElements[0] : null;

  if (!isPropertyPanelOpen) return null;

  const isPageSettings = selectedElementIds.length === 0;
  const isText = !isPageSettings && selectedElement?.type === 'text';

  const handleAlignment = (align: 'left' | 'center' | 'right') => {
    if (!selectedElement || selectedElement.type !== 'text') {
      handleBatchUpdate({ textAlign: align });
      return;
    }

    const { marginLeft, marginRight } = catalog;
    let newX = selectedElement.x;
    const width = selectedElement.width;
    const mLeft = marginLeft || 40;
    const mRight = marginRight || 40;

    if (align === 'left') {
      newX = mLeft;
    } else if (align === 'center') {
      newX = (PAGE_WIDTH + mLeft - mRight - width) / 2;
    } else if (align === 'right') {
      newX = PAGE_WIDTH - width - mRight;
    }

    updateElement(currentPageIndex, selectedElement.id, { textAlign: align, x: newX });
  };

  const handleVerticalAlignment = (align: 'top' | 'middle' | 'bottom') => {
    if (!selectedElement) return;

    const { marginTop, marginBottom, hasHeader, hasFooter, headerHeight, footerHeight } = catalog;
    const height = selectedElement.height;

    // Hierarchy: Page -> Margin -> Header/Footer -> Content
    const safeY1 = (marginTop || 0) + (hasHeader ? (headerHeight || 0) : 0);
    const safeY2 = PAGE_HEIGHT - (marginBottom || 0) - (hasFooter ? (footerHeight || 0) : 0);

    let newY = selectedElement.y;

    if (align === 'top') {
      newY = safeY1;
    } else if (align === 'middle') {
      newY = safeY1 + (safeY2 - safeY1 - height) / 2;
    } else if (align === 'bottom') {
      newY = safeY2 - height;
    }

    updateElement(currentPageIndex, selectedElement.id, { y: newY });
  };

  const handleBatchUpdate = (updates: any) => {
    if (isPageSettings) return;

    // Check for selective text styling
    const sel = window.getSelection();
    if (isText && sel && !sel.isCollapsed && sel.rangeCount > 0) {
      let appliedLocally = false;

      // Use native toggleStyle for standard formatting
      if ('fontWeight' in updates) {
        toggleStyle('bold');
        appliedLocally = true;
      } else if ('fontStyle' in updates) {
        toggleStyle('italic');
        appliedLocally = true;
      } else if ('textDecoration' in updates) {
        toggleStyle('underline');
        appliedLocally = true;
      } else if ('fill' in updates) {
        toggleStyle('foreColor', updates.fill);
        appliedLocally = true;
      }

      if (appliedLocally) return;
    }

    selectedElementIds.forEach(id => updateElement(currentPageIndex, id, updates));
  };

  const renderSectionHeader = (title: string, icon: React.ReactNode) => (
    <div className="flex items-center gap-2 mb-3">
      <div className="text-slate-400">{icon}</div>
      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
        {title}
      </h4>
    </div>
  );

const handleOpenEffects = () => {
     setEditorTab('components');
     setSidebarExpanded(true);
   };

  const activeFill = selectedElement?.fill || '#000000';

  return (
    <div className={`w-[360px] h-full flex flex-col border-l transition-colors duration-300 ${uiTheme === 'dark' ? 'bg-[#0f172a] border-slate-800' : 'bg-[#f8fafc] border-slate-200'}`}>
      {/* Header */}
      <div className="p-6 pb-2">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-[14px] flex items-center justify-center shadow-sm ${uiTheme === 'dark' ? 'bg-indigo-500/20' : 'bg-indigo-100/50'}`}>
              <Palette className="text-indigo-600" size={18} />
            </div>
            <div>
              <h3 className={`text-sm font-black tracking-tight ${uiTheme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                {isPageSettings ? 'PROPERTIES' : (isText ? 'TEXT' : 'ELEMENT')}
              </h3>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                {isPageSettings ? 'No Element Selected' : 'Instance Properties'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsPropertyPanelOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pt-0 space-y-8">
        {isPageSettings ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50 py-20">
            <div className="p-4 rounded-full bg-slate-100">
              <MousePointer2 size={24} className="text-slate-400" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-black text-slate-900 uppercase">Nothing Selected</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Select an element to edit its properties</p>
            </div>
          </div>
        ) : (
          <>
            {/* Visual Style Section */}
            <section>
              {renderSectionHeader("VISUAL STYLE", <Palette size={11} />)}
              <div className="space-y-3">
                <div className="flex gap-3">
                  {/* Color Code Card */}
                  <div
                    onClick={() => setPickerOpen(!pickerOpen)}
                    className="flex-1 p-3 rounded-[18px] border bg-white border-slate-100 shadow-sm flex items-center gap-3 cursor-pointer hover:border-indigo-200 transition-all"
                  >
                    <div
                      className="w-10 h-10 rounded-xl shadow-sm border-2 border-slate-50"
                      style={{ background: (activeFill && !activeFill.includes('gradient')) ? activeFill : '#ffffff' }}
                    />
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Color Code</span>
                      <span className="text-[11px] font-black text-slate-900 uppercase">
                        {(activeFill && !activeFill.includes('gradient')) ? activeFill : 'Default'}
                      </span>
                    </div>
                  </div>

                  {/* Effects Button Card */}
                  <button
                    onClick={handleOpenEffects}
                    className="w-[100px] p-3 rounded-[18px] border bg-white border-slate-100 shadow-sm flex flex-col items-center justify-center gap-1 hover:bg-slate-50 hover:border-indigo-100 transition-all group"
                  >
                    <Sparkles size={16} className="text-indigo-600 group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Effects</span>
                  </button>
                </div>

                {/* Picker Overlay */}
                {pickerOpen && (
                  <div className="p-3 border rounded-2xl bg-white shadow-xl animate-in fade-in zoom-in-95 duration-200">
                    <AdvancedColorPicker
                      color={(activeFill && !activeFill.includes('gradient')) ? activeFill : '#ffffff'}
                      onChange={(c) => handleBatchUpdate({ fill: c })}
                    />
                  </div>
                )}

                {/* Transparency Card */}
                <div className="p-4 rounded-[18px] border bg-white border-slate-100 shadow-sm space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Transparency</span>
                    <span className="text-[11px] font-black text-indigo-600">{Math.round((selectedElement?.opacity || 1) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={selectedElement?.opacity ?? 1}
                    onChange={(e) => handleBatchUpdate({ opacity: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
              </div>
            </section>

            {/* Text Formatting Section */}
            {isText && (
              <section>
                {renderSectionHeader("TEXT FORMATTING", <Type size={11} />)}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    {/* Font Dropdown */}
                    <div className="flex-1 relative">
                      <select
                        value={selectedElement?.fontFamily || 'Inter'}
                        onChange={(e) => handleBatchUpdate({ fontFamily: e.target.value })}
                        className="w-full appearance-none bg-white border border-slate-100 rounded-[14px] px-4 py-3 text-xs font-bold text-slate-700 shadow-sm outline-none hover:border-indigo-100 transition-all"
                      >
                        {CATEGORIZED_FONTS.map(group => (
                          <optgroup key={group.label} label={group.label}>
                            {group.fonts.map(f => (
                              <option key={f} value={f}>{f}</option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Size Controls */}
                    <div className="flex items-center bg-transparent border border-slate-100 rounded-[14px] overflow-hidden w-[100px]">
                      <button
                        onClick={() => handleBatchUpdate({ fontSize: Math.max(1, (selectedElement?.fontSize || 12) - 1) })}
                        className="w-8 py-3 flex items-center justify-center hover:bg-slate-50 text-slate-400"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="flex-1 text-center text-xs font-black text-slate-900">{Math.round(selectedElement?.fontSize || 12)}</span>
                      <button
                        onClick={() => handleBatchUpdate({ fontSize: (selectedElement?.fontSize || 12) + 1 })}
                        className="w-8 py-3 flex items-center justify-center hover:bg-slate-50 text-slate-400"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex bg-[#1e293b] rounded-xl p-1 shadow-inner">
                      {(['left', 'center', 'right'] as const).map(align => (
                        <button
                          key={align}
                          onClick={() => handleAlignment(align)}
                          className={`p-2 rounded-lg transition-all ${selectedElement?.textAlign === align ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                          {align === 'left' && <AlignLeft size={16} />}
                          {align === 'center' && <AlignCenter size={16} />}
                          {align === 'right' && <AlignRight size={16} />}
                        </button>
                      ))}
                    </div>

                    <div className="flex bg-[#1e293b] rounded-xl p-1 shadow-inner gap-1">
                      {(['top', 'middle', 'bottom'] as const).map(align => (
                        <button
                          key={align}
                          onClick={() => handleVerticalAlignment(align)}
                          className="p-2 rounded-lg transition-all text-slate-500 hover:text-slate-300"
                        >
                          {align === 'top' && <AlignVerticalJustifyStart size={16} />}
                          {align === 'middle' && <AlignVerticalJustifyCenter size={16} />}
                          {align === 'bottom' && <AlignVerticalJustifyEnd size={16} />}
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-4 px-2">
                      <button
                        onClick={() => handleBatchUpdate({ fontWeight: selectedElement?.fontWeight === 'bold' ? 'normal' : 'bold' })}
                        className={`transition-colors ${selectedElement?.fontWeight === 'bold' ? 'text-indigo-600' : 'text-slate-300 hover:text-slate-400'}`}
                      >
                        <Bold size={18} strokeWidth={selectedElement?.fontWeight === 'bold' ? 3 : 2} />
                      </button>
                      <button
                        onClick={() => handleBatchUpdate({ fontStyle: selectedElement?.fontStyle === 'italic' ? 'normal' : 'italic' })}
                        className={`transition-colors ${selectedElement?.fontStyle === 'italic' ? 'text-indigo-600' : 'text-slate-300 hover:text-slate-400'}`}
                      >
                        <Italic size={18} strokeWidth={selectedElement?.fontStyle === 'italic' ? 3 : 2} />
                      </button>
                      <button
                        onClick={() => handleBatchUpdate({ textDecoration: selectedElement?.textDecoration === 'underline' ? 'none' : 'underline' })}
                        className={`transition-colors ${selectedElement?.textDecoration === 'underline' ? 'text-indigo-600' : 'text-slate-300 hover:text-slate-400'}`}
                      >
                        <Underline size={18} strokeWidth={selectedElement?.textDecoration === 'underline' ? 3 : 2} />
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Layer Stacking Section */}
            <section>
              {renderSectionHeader("LAYER STACKING", <Layers size={11} />)}
              <div className="flex gap-2">
                <button
                  onClick={() => reorderElement(currentPageIndex, selectedElementIds[0], 'front')}
                  className="flex-1 py-4 flex items-center justify-center rounded-[18px] border bg-white border-slate-100 shadow-sm text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-all"
                >
                  <ChevronsUp size={20} />
                </button>
                <button
                  onClick={() => reorderElement(currentPageIndex, selectedElementIds[0], 'forward')}
                  className="flex-1 py-4 flex items-center justify-center rounded-[18px] border bg-white border-slate-100 shadow-sm text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-all"
                >
                  <ChevronUp size={20} />
                </button>
                <button
                  onClick={() => reorderElement(currentPageIndex, selectedElementIds[0], 'backward')}
                  className="flex-1 py-4 flex items-center justify-center rounded-[18px] border bg-white border-slate-100 shadow-sm text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-all"
                >
                  <ChevronDownIcon size={20} />
                </button>
                <button
                  onClick={() => reorderElement(currentPageIndex, selectedElementIds[0], 'back')}
                  className="flex-1 py-4 flex items-center justify-center rounded-[18px] border bg-white border-slate-100 shadow-sm text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-all"
                >
                  <ChevronsDown size={20} />
                </button>
              </div>
            </section>

            {/* Control Flags Section */}
            <section>
              {renderSectionHeader("CONTROL FLAGS", <Sliders size={11} />)}
              <div className="flex gap-2">
                <button
                  onClick={() => toggleLock(currentPageIndex, selectedElementIds[0])}
                  className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 rounded-[18px] border transition-all ${selectedElement?.locked ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-100 text-slate-400 hover:text-slate-600 shadow-sm'}`}
                >
                  {selectedElement?.locked ? <Lock size={16} /> : <Unlock size={16} />}
                  <span className="text-[10px] font-black uppercase tracking-widest">{selectedElement?.locked ? 'Locked' : 'Lock'}</span>
                </button>
                <button
                  onClick={() => duplicateElement(currentPageIndex, selectedElementIds[0])}
                  className="flex-1 py-3 px-4 flex items-center justify-center gap-2 rounded-[18px] border bg-white border-slate-100 text-slate-400 hover:text-indigo-600 shadow-sm transition-all"
                >
                  <Copy size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Duplicate</span>
                </button>
                <button
                  onClick={() => removeElement(currentPageIndex, selectedElementIds[0])}
                  className="p-3 px-4 flex items-center justify-center rounded-[18px] border bg-white border-slate-100 text-red-400 hover:bg-red-50 hover:border-red-100 shadow-sm transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default PropertyPanel;
