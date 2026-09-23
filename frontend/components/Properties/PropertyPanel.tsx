import React, { useState } from 'react';
import {
  X, Type, Palette, AlignLeft, AlignCenter,
  AlignRight, AlignVerticalJustifyStart, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd, Minus, Plus, ChevronDown,
  Layers, Trash2, Copy, Lock, Unlock,
  Sparkles, Sliders, Bold, Italic, Underline,
  ChevronUp, ChevronDown as ChevronDownIcon,
  ChevronsUp, ChevronsDown, MousePointer2,
  Package, RotateCcw
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
    updateCatalog,
    products = []
  } = useStore();

  const [pickerOpen, setPickerOpen] = useState(false);

  const currentPage = catalog.pages[currentPageIndex];
  const selectedElements = currentPage?.elements.filter(el => selectedElementIds.includes(el.id)) || [];
  const selectedElement = selectedElements.length === 1 ? selectedElements[0] : null;

  const isProductBlock = selectedElement?.type === 'product-block';
  const isPageSettings = selectedElementIds.length === 0;
  const isText = !isPageSettings && selectedElement?.type === 'text';

  const isDark = uiTheme === 'dark';

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

    const { marginTop, marginBottom } = catalog;
    const height = selectedElement.height;

    const safeY1 = marginTop || 0;
    const safeY2 = PAGE_HEIGHT - (marginBottom || 0);

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

    selectedElementIds.forEach(id => {
      const el = currentPage?.elements.find(item => item.id === id);
      const isLine = el?.shapeType === 'line' || el?.shapeType === 'curved-line' || el?.shapeType === 'elbow-line' || (typeof el?.id === 'string' && el?.id.includes('line'));
      const finalUpdates = { ...updates };
      if (isLine) {
        if ('fill' in updates && !('stroke' in updates)) {
          finalUpdates.stroke = updates.fill;
        } else if ('stroke' in updates && !('fill' in updates)) {
          finalUpdates.fill = updates.stroke;
        }
      }
      updateElement(currentPageIndex, id, finalUpdates);
    });
  };

  const renderSectionHeader = (title: string, icon: React.ReactNode) => (
    <div className="flex items-center gap-2 mb-3">
      <div className={isDark ? 'text-[#888888]' : 'text-slate-400'}>{icon}</div>
      <h4 className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-[#888888]' : 'text-slate-400'}`}>
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
    <div className={`w-full h-full flex flex-col transition-colors duration-200 ${isDark ? 'bg-[#141414] text-[#EDEDED]' : 'bg-white text-slate-900'}`}>
      {/* Header */}
      <div className={`p-5 pb-4 border-b ${isDark ? 'border-[#262626]' : 'border-slate-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-[8px] flex items-center justify-center shadow-sm ${
              isProductBlock 
                ? 'bg-indigo-600/20 text-indigo-400' 
                : isDark ? 'bg-[#0F3D3E]/40 text-[#E2DCC8]' : 'bg-teal-50 text-[#0F3D3E]'
            }`}>
              {isProductBlock ? <Package size={18} /> : isText ? <Type size={18} /> : <Palette size={18} />}
            </div>
            <div>
              <h3 className={`text-xs font-black tracking-wider uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {isProductBlock ? 'PRODUCT CARD' : isPageSettings ? 'PROPERTIES' : (isText ? 'TEXT' : 'ELEMENT')}
              </h3>
              <p className={`text-[9px] font-bold uppercase tracking-wider ${isDark ? 'text-[#888888]' : 'text-slate-400'}`}>
                {isProductBlock ? 'Card Typography & Specs' : isPageSettings ? 'No Element Selected' : 'Instance Properties'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsPropertyPanelOpen(false);
              setSidebarExpanded(false);
            }}
            className={`p-1.5 rounded-[4px] transition-all ${isDark ? 'text-[#888] hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}
            title="Close Panel"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
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
            {/* Text Formatting Section */}
            {isText && (
              <section>
                {renderSectionHeader("TEXT FORMATTING", <Type size={11} />)}
                <div className="space-y-4">
                  {/* Text Content Input */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Text Content</label>
                    <textarea
                      rows={3}
                      value={(selectedElement?.text || '').replace(/<[^>]*>/g, '')}
                      onChange={(e) => handleBatchUpdate({ text: e.target.value })}
                      placeholder="Type your text here..."
                      className="w-full bg-white border border-slate-200 rounded-[14px] p-3 text-xs font-semibold text-slate-800 shadow-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none transition-all"
                    />
                  </div>

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
                    <div className="flex bg-[#1e293b] rounded-[4px] p-1 shadow-inner">
                      {(['left', 'center', 'right'] as const).map(align => (
                        <button
                          key={align}
                          onClick={() => handleAlignment(align)}
                          className={`p-2 rounded-[4px] transition-all ${selectedElement?.textAlign === align ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                          {align === 'left' && <AlignLeft size={16} />}
                          {align === 'center' && <AlignCenter size={16} />}
                          {align === 'right' && <AlignRight size={16} />}
                        </button>
                      ))}
                    </div>

                    <div className="flex bg-[#1e293b] rounded-[4px] p-1 shadow-inner gap-1">
                      {(['top', 'middle', 'bottom'] as const).map(align => (
                        <button
                          key={align}
                          onClick={() => handleVerticalAlignment(align)}
                          className="p-2 rounded-[4px] transition-all text-slate-500 hover:text-slate-300"
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
            {/* Table Formatting & Live Column/Row Editor Section */}
            {selectedElement?.type === 'table' && selectedElement.tableData && (
              <section>
                {renderSectionHeader("TABLE & SPECIFICATIONS", <Palette size={11} />)}
                <div className="space-y-5">
                  {/* Table Styling Controls */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Header Background</label>
                      <div className="flex items-center gap-2 bg-white border border-slate-100 rounded-[4px] p-2">
                        <input
                          type="color"
                          value={selectedElement.tableData.headerBg || '#002b36'}
                          onChange={(e) => {
                            const newTableData = { ...selectedElement.tableData!, headerBg: e.target.value };
                            updateElement(currentPageIndex, selectedElement.id, { tableData: newTableData });
                          }}
                          className="w-6 h-6 rounded border-0 cursor-pointer"
                        />
                        <span className="text-[10px] font-mono font-bold text-slate-700">{selectedElement.tableData.headerBg || '#002b36'}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Header Text Color</label>
                      <div className="flex items-center gap-2 bg-white border border-slate-100 rounded-[4px] p-2">
                        <input
                          type="color"
                          value={selectedElement.tableData.headerTextColor || '#ffffff'}
                          onChange={(e) => {
                            const newTableData = { ...selectedElement.tableData!, headerTextColor: e.target.value };
                            updateElement(currentPageIndex, selectedElement.id, { tableData: newTableData });
                          }}
                          className="w-6 h-6 rounded border-0 cursor-pointer"
                        />
                        <span className="text-[10px] font-mono font-bold text-slate-700">{selectedElement.tableData.headerTextColor || '#ffffff'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Columns / Headers Editor */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Columns ({selectedElement.tableData.headers.length})
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const newHeader = `COL ${selectedElement.tableData!.headers.length + 1}`;
                          const newHeaders = [...selectedElement.tableData!.headers, newHeader];
                          const newRows = selectedElement.tableData!.rows.map(r => [...r, '-']);
                          const newTableData = {
                            ...selectedElement.tableData!,
                            headers: newHeaders,
                            rows: newRows
                          };
                          updateElement(currentPageIndex, selectedElement.id, { tableData: newTableData });
                        }}
                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-[4px] text-[9px] font-black uppercase tracking-wider flex items-center gap-1 transition-all"
                      >
                        <Plus size={10} /> Add Column
                      </button>
                    </div>

                    <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar p-1">
                      {selectedElement.tableData.headers.map((header, hIdx) => (
                        <div key={hIdx} className="flex items-center gap-1.5 bg-white border border-slate-100 rounded-[4px] p-1.5 shadow-sm">
                          <span className="text-[9px] font-black text-slate-400 w-4">{hIdx + 1}</span>
                          <input
                            type="text"
                            value={header}
                            onChange={(e) => {
                              const newHeaders = [...selectedElement.tableData!.headers];
                              newHeaders[hIdx] = e.target.value;
                              const newTableData = { ...selectedElement.tableData!, headers: newHeaders };
                              updateElement(currentPageIndex, selectedElement.id, { tableData: newTableData });
                            }}
                            className="flex-1 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[10px] font-bold text-slate-800 outline-none focus:border-indigo-600"
                          />
                          <button
                            type="button"
                            disabled={selectedElement.tableData!.headers.length <= 1}
                            onClick={() => {
                              const newHeaders = selectedElement.tableData!.headers.filter((_, i) => i !== hIdx);
                              const newRows = selectedElement.tableData!.rows.map(r => r.filter((_, i) => i !== hIdx));
                              const newTableData = { ...selectedElement.tableData!, headers: newHeaders, rows: newRows };
                              updateElement(currentPageIndex, selectedElement.id, { tableData: newTableData });
                            }}
                            className="p-1 text-slate-300 hover:text-red-500 rounded disabled:opacity-20"
                            title="Delete Column"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Add Row Button & Live Rows Editor */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Rows ({selectedElement.tableData.rows.length})
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const newRow = selectedElement.tableData!.headers.map(() => '-');
                          const newTableData = {
                            ...selectedElement.tableData!,
                            rows: [...selectedElement.tableData!.rows, newRow]
                          };
                          updateElement(currentPageIndex, selectedElement.id, { tableData: newTableData, height: selectedElement.height + 28 });
                        }}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[4px] text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm transition-all"
                      >
                        <Plus size={11} /> Add Row
                      </button>
                    </div>

                    {/* Rows editor preview */}
                    <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar p-1">
                      {selectedElement.tableData.rows.map((row, rIdx) => (
                        <div key={rIdx} className="p-2.5 bg-white border border-slate-100 rounded-[4px] space-y-1.5 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] font-black text-indigo-600 uppercase">Row #{rIdx + 1}</span>
                            <button
                              type="button"
                              disabled={selectedElement.tableData!.rows.length <= 1}
                              onClick={() => {
                                const newRows = selectedElement.tableData!.rows.filter((_, i) => i !== rIdx);
                                const newTableData = { ...selectedElement.tableData!, rows: newRows };
                                updateElement(currentPageIndex, selectedElement.id, { tableData: newTableData, height: Math.max(80, selectedElement.height - 28) });
                              }}
                              className="p-1 text-slate-300 hover:text-red-500 rounded disabled:opacity-20"
                              title="Delete Row"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                          <div className="space-y-1">
                            {selectedElement.tableData!.headers.map((header, cIdx) => (
                              <div key={cIdx} className="flex items-center gap-1 text-[10px]">
                                <span className="w-20 truncate text-[8px] font-bold text-slate-400 uppercase">{header}:</span>
                                <input
                                  type="text"
                                  value={row[cIdx] !== undefined ? row[cIdx] : ''}
                                  placeholder={header}
                                  onChange={(e) => {
                                    const newRows = selectedElement.tableData!.rows.map((r, i) => {
                                      if (i !== rIdx) return r;
                                      const updatedRow = [...r];
                                      updatedRow[cIdx] = e.target.value;
                                      return updatedRow;
                                    });
                                    const newTableData = { ...selectedElement.tableData!, rows: newRows };
                                    updateElement(currentPageIndex, selectedElement.id, { tableData: newTableData });
                                  }}
                                  className="flex-1 bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-[10px] font-medium text-slate-700 outline-none focus:border-indigo-600"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Product Block Content & Typography Section */}
            {selectedElement?.type === 'product-block' && (
              <section>
                <div className="flex items-center justify-between mb-2 pb-1 border-b border-slate-100 dark:border-[#262626]">
                  <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-indigo-500">
                    <Package size={13} />
                    <span>PRODUCT CARD & DETAILS</span>
                  </div>
                  {(selectedElement.customTitle !== undefined || selectedElement.customPrice !== undefined || selectedElement.customSku !== undefined || selectedElement.customDesc !== undefined || selectedElement.titleFontSize || selectedElement.priceFontSize || selectedElement.fontSize || selectedElement.titleColor || selectedElement.priceColor || selectedElement.textColor || (selectedElement as any).borderRadius !== undefined) && (
                    <button
                      onClick={() => {
                        handleBatchUpdate({
                          customTitle: undefined,
                          customPrice: undefined,
                          customSku: undefined,
                          customDesc: undefined,
                          titleFontSize: undefined,
                          priceFontSize: undefined,
                          fontSize: undefined,
                          titleColor: undefined,
                          priceColor: undefined,
                          textColor: undefined,
                          borderRadius: undefined,
                        });
                      }}
                      className="text-[10px] text-amber-500 hover:text-amber-400 flex items-center gap-1 font-bold cursor-pointer"
                      title="Reset all custom overrides back to product database defaults"
                    >
                      <RotateCcw size={11} /> Reset
                    </button>
                  )}
                </div>

                <div className="space-y-3.5">
                  {/* Product Title / Name */}
                  <div className="p-3 bg-white dark:bg-[#18181b] border border-slate-100 dark:border-[#27272a] rounded-[12px] shadow-sm space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Title / Name</label>
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] text-slate-400">Size:</span>
                        <button
                          onClick={() => {
                            const cur = selectedElement.titleFontSize || Math.max(11, Math.min(16, Math.round(selectedElement.width * 0.065)));
                            handleBatchUpdate({ titleFontSize: Math.max(8, cur - 1) });
                          }}
                          className="w-5 h-5 flex items-center justify-center bg-slate-100 dark:bg-[#27272a] hover:bg-slate-200 dark:hover:bg-[#3f3f46] text-slate-700 dark:text-slate-200 rounded text-xs cursor-pointer"
                        >-</button>
                        <span className="text-[10px] font-mono font-bold w-6 text-center text-indigo-500">
                          {selectedElement.titleFontSize || Math.max(11, Math.min(16, Math.round(selectedElement.width * 0.065)))}
                        </span>
                        <button
                          onClick={() => {
                            const cur = selectedElement.titleFontSize || Math.max(11, Math.min(16, Math.round(selectedElement.width * 0.065)));
                            handleBatchUpdate({ titleFontSize: cur + 1 });
                          }}
                          className="w-5 h-5 flex items-center justify-center bg-slate-100 dark:bg-[#27272a] hover:bg-slate-200 dark:hover:bg-[#3f3f46] text-slate-700 dark:text-slate-200 rounded text-xs cursor-pointer"
                        >+</button>
                        <input
                          type="color"
                          value={selectedElement.titleColor || '#0f172a'}
                          onChange={(e) => handleBatchUpdate({ titleColor: e.target.value })}
                          className="w-5 h-5 ml-1 rounded border-0 cursor-pointer bg-transparent"
                          title="Title Text Color"
                        />
                      </div>
                    </div>
                    <input
                      type="text"
                      value={selectedElement.customTitle !== undefined ? selectedElement.customTitle : (products.find(p => p.id === selectedElement.productId)?.name || '')}
                      placeholder="Product Title..."
                      onChange={(e) => handleBatchUpdate({ customTitle: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-[#121214] border border-slate-200 dark:border-[#2e2e32] rounded-[8px] px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Price */}
                  <div className="p-3 bg-white dark:bg-[#18181b] border border-slate-100 dark:border-[#27272a] rounded-[12px] shadow-sm space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Price</label>
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] text-slate-400">Size:</span>
                        <button
                          onClick={() => {
                            const cur = selectedElement.priceFontSize || Math.max(11, Math.min(15, Math.round(selectedElement.width * 0.058)));
                            handleBatchUpdate({ priceFontSize: Math.max(8, cur - 1) });
                          }}
                          className="w-5 h-5 flex items-center justify-center bg-slate-100 dark:bg-[#27272a] hover:bg-slate-200 dark:hover:bg-[#3f3f46] text-slate-700 dark:text-slate-200 rounded text-xs cursor-pointer"
                        >-</button>
                        <span className="text-[10px] font-mono font-bold w-6 text-center text-indigo-500">
                          {selectedElement.priceFontSize || Math.max(11, Math.min(15, Math.round(selectedElement.width * 0.058)))}
                        </span>
                        <button
                          onClick={() => {
                            const cur = selectedElement.priceFontSize || Math.max(11, Math.min(15, Math.round(selectedElement.width * 0.058)));
                            handleBatchUpdate({ priceFontSize: cur + 1 });
                          }}
                          className="w-5 h-5 flex items-center justify-center bg-slate-100 dark:bg-[#27272a] hover:bg-slate-200 dark:hover:bg-[#3f3f46] text-slate-700 dark:text-slate-200 rounded text-xs cursor-pointer"
                        >+</button>
                        <input
                          type="color"
                          value={selectedElement.priceColor || '#4f46e5'}
                          onChange={(e) => handleBatchUpdate({ priceColor: e.target.value })}
                          className="w-5 h-5 ml-1 rounded border-0 cursor-pointer bg-transparent"
                          title="Price Text Color"
                        />
                      </div>
                    </div>
                    <input
                      type="text"
                      value={selectedElement.customPrice !== undefined ? selectedElement.customPrice : (() => {
                        const prod = products.find(p => p.id === selectedElement.productId);
                        return prod ? `${prod.currency || '₹'}${prod.price || ''}` : '';
                      })()}
                      placeholder="e.g. ₹1300"
                      onChange={(e) => handleBatchUpdate({ customPrice: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-[#121214] border border-slate-200 dark:border-[#2e2e32] rounded-[8px] px-3 py-1.5 text-xs font-black text-indigo-600 dark:text-indigo-400 outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* SKU / Model */}
                  <div className="p-3 bg-white dark:bg-[#18181b] border border-slate-100 dark:border-[#27272a] rounded-[12px] shadow-sm space-y-2">
                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">SKU / Model Number</label>
                    <input
                      type="text"
                      value={selectedElement.customSku !== undefined ? selectedElement.customSku : (products.find(p => p.id === selectedElement.productId)?.sku || '')}
                      placeholder="SKU Code..."
                      onChange={(e) => handleBatchUpdate({ customSku: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-[#121214] border border-slate-200 dark:border-[#2e2e32] rounded-[8px] px-3 py-1.5 text-xs font-mono font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Specifications & Details */}
                  <div className="p-3 bg-white dark:bg-[#18181b] border border-slate-100 dark:border-[#27272a] rounded-[12px] shadow-sm space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Specs & Details (Lines)</label>
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] text-slate-400">Size:</span>
                        <button
                          onClick={() => {
                            const cur = selectedElement.fontSize || 9;
                            handleBatchUpdate({ fontSize: Math.max(6, cur - 1) });
                          }}
                          className="w-5 h-5 flex items-center justify-center bg-slate-100 dark:bg-[#27272a] hover:bg-slate-200 dark:hover:bg-[#3f3f46] text-slate-700 dark:text-slate-200 rounded text-xs cursor-pointer"
                        >-</button>
                        <span className="text-[10px] font-mono font-bold w-6 text-center text-indigo-500">
                          {selectedElement.fontSize || 9}
                        </span>
                        <button
                          onClick={() => {
                            const cur = selectedElement.fontSize || 9;
                            handleBatchUpdate({ fontSize: cur + 1 });
                          }}
                          className="w-5 h-5 flex items-center justify-center bg-slate-100 dark:bg-[#27272a] hover:bg-slate-200 dark:hover:bg-[#3f3f46] text-slate-700 dark:text-slate-200 rounded text-xs cursor-pointer"
                        >+</button>
                        <input
                          type="color"
                          value={selectedElement.textColor || '#475569'}
                          onChange={(e) => handleBatchUpdate({ textColor: e.target.value })}
                          className="w-5 h-5 ml-1 rounded border-0 cursor-pointer bg-transparent"
                          title="Details Text Color"
                        />
                      </div>
                    </div>
                    <textarea
                      rows={5}
                      value={selectedElement.customDesc !== undefined ? selectedElement.customDesc : (() => {
                        const prod = products.find(p => p.id === selectedElement.productId);
                        if (!prod) return '';
                        const lines: string[] = [];
                        if (catalog?.showSKU !== false && prod.sku) lines.push(`SKU: ${prod.sku}`);
                        if (prod.description) lines.push(prod.description);
                        if (prod.customFields) {
                          Object.entries(prod.customFields).forEach(([k, v]) => {
                            if (v !== undefined && v !== null && v !== '' && typeof v !== 'object') lines.push(`• ${k}: ${v}`);
                          });
                        }
                        return lines.join('\n');
                      })()}
                      placeholder="Enter specs line by line..."
                      onChange={(e) => handleBatchUpdate({ customDesc: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-[#121214] border border-slate-200 dark:border-[#2e2e32] rounded-[8px] p-2.5 text-xs font-mono text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500 resize-y leading-relaxed"
                    />
                  </div>

                  {/* Corner Roundness */}
                  <div className="p-3 bg-white dark:bg-[#18181b] border border-slate-100 dark:border-[#27272a] rounded-[12px] shadow-sm space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                      <span>Corner Roundness</span>
                      <span className="text-indigo-500 font-mono">{(selectedElement as any).borderRadius !== undefined ? (selectedElement as any).borderRadius : 4}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="30"
                      step="1"
                      value={(selectedElement as any).borderRadius !== undefined ? (selectedElement as any).borderRadius : 4}
                      onChange={(e) => handleBatchUpdate({ borderRadius: parseInt(e.target.value, 10) })}
                      className="w-full h-1.5 bg-slate-100 dark:bg-[#27272a] rounded-full appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PropertyPanel;
