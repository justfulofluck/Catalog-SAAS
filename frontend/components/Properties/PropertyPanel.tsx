import React, { useState } from 'react';
import {
  X, Type, Palette, AlignLeft, AlignCenter,
  AlignRight, AlignVerticalJustifyStart, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd, Minus, Plus, ChevronDown,
  Trash2, Bold, Italic, Underline, MousePointer2, CheckSquare, Check, Sparkles, SlidersHorizontal, ListTodo,
  Image as ImageIcon, Layers, Sliders,
  ArrowRight, ArrowLeft, ArrowDown, ArrowUp,
  Link as LinkIcon, Globe, Phone, Mail, MessageCircle
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { CATEGORIZED_FONTS, PAGE_WIDTH, PAGE_HEIGHT } from '../../constants';
import { toggleStyle } from '../../utils/textStyleSelection';
import { colorToRgba } from '../../utils/imageUtils';
import { ChecklistRow, ChecklistData } from '../../types';

const PropertyPanel: React.FC = () => {
  const {
    selectedElementIds,
    updateElement,
    catalog,
    currentPageIndex,
    setIsPropertyPanelOpen,
    uiTheme,
    setSidebarExpanded
  } = useStore();

  const currentPage = catalog.pages[currentPageIndex];
  const selectedElements = currentPage?.elements.filter(el => selectedElementIds.includes(el.id)) || [];
  const selectedElement = selectedElements.length === 1 ? selectedElements[0] : null;

  const isPageSettings = selectedElementIds.length === 0;
  const isText = !isPageSettings && selectedElement?.type === 'text';
  const isImage = !isPageSettings && selectedElement?.type === 'image';
  const isIcon = !isPageSettings && Boolean(selectedElement?.iconConfig);

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
              isDark ? 'bg-[#0F3D3E]/40 text-[#E2DCC8]' : 'bg-teal-50 text-[#0F3D3E]'
            }`}>
              {isImage ? <ImageIcon size={18} /> : (isText ? <Type size={18} /> : (isIcon ? <Sparkles size={18} /> : <Palette size={18} />))}
            </div>
            <div>
              <h3 className={`text-xs font-black tracking-wider uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {isPageSettings ? 'PROPERTIES' : (isText ? 'TEXT' : (isImage ? 'IMAGE' : (isIcon ? 'ICON & BUTTON' : 'ELEMENT')))}
              </h3>
              <p className={`text-[9px] font-bold uppercase tracking-wider ${isDark ? 'text-[#888888]' : 'text-slate-400'}`}>
                {isPageSettings ? 'No Element Selected' : 'Instance Properties'}
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

            {/* Checklist Specific Controls */}
            {selectedElement.type === 'checklist' && selectedElement.checklistData && (
              <section className="space-y-4 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ListTodo size={14} className="text-amber-500" />
                    <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">
                      Checklist Items &amp; Tuning
                    </span>
                  </div>
                  <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full text-[9px] font-bold">
                    {selectedElement.checklistData.rows.length} Tasks
                  </span>
                </div>

                {/* Theme Selector */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                    Theme / Layout Style
                  </label>
                  <select
                    value={selectedElement.checklistData.themeId}
                    onChange={(e) => {
                      const newThemeId = e.target.value;
                      const newChecklistData: ChecklistData = {
                        ...selectedElement.checklistData!,
                        themeId: newThemeId,
                      };
                      updateElement(currentPageIndex, selectedElement.id, { checklistData: newChecklistData });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-amber-500"
                  >
                    <option value="customer-feedback-checklist">Customer Service Review (Circles)</option>
                    <option value="lesson-planning-checklist">Lesson Planning Checklist (Teal)</option>
                    <option value="employee-development-progress">Employee Progress (Navy Header)</option>
                    <option value="recruitment-hiring-checklist">Recruitment Checklist (Outlined)</option>
                    <option value="color-band-process-checklist">Color Band Process (Sections)</option>
                    <option value="goals-matrix-checklist">Goals Progress Matrix (2-Col Checkboxes)</option>
                    <option value="gold-task-list-checklist">Task List (Amber Banner &amp; Stripes)</option>
                  </select>
                </div>

                {/* Title Edit */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                    Checklist Header Title
                  </label>
                  <input
                    type="text"
                    value={selectedElement.checklistData.title || ''}
                    placeholder="Enter checklist title..."
                    onChange={(e) => {
                      const newChecklistData: ChecklistData = {
                        ...selectedElement.checklistData!,
                        title: e.target.value,
                      };
                      updateElement(currentPageIndex, selectedElement.id, { checklistData: newChecklistData });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-xs font-medium text-slate-700 outline-none focus:border-amber-500"
                  />
                </div>

                {/* Interactive Tasks List */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      Tasks ({selectedElement.checklistData.rows.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const newId = `r-${Date.now()}`;
                        const newRow: ChecklistRow = {
                          id: newId,
                          text: 'New checklist task',
                          checked: false,
                          columnValues: { 'In Progress': false, 'Completed': false }
                        };
                        const newChecklistData: ChecklistData = {
                          ...selectedElement.checklistData!,
                          rows: [...selectedElement.checklistData!.rows, newRow],
                        };
                        updateElement(currentPageIndex, selectedElement.id, {
                          checklistData: newChecklistData,
                          height: selectedElement.height + 34
                        });
                      }}
                      className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm transition-all"
                    >
                      <Plus size={11} /> Add Task
                    </button>
                  </div>

                  {/* Task Rows List */}
                  <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar p-1">
                    {selectedElement.checklistData.rows.map((row, rIdx) => (
                      <div
                        key={row.id || rIdx}
                        className="p-2 bg-slate-50 hover:bg-white border border-slate-200/80 rounded-lg space-y-1.5 shadow-sm transition-all"
                      >
                        <div className="flex items-center gap-2">
                          {/* Interactive Click-to-Tick Checkbox */}
                          <button
                            type="button"
                            onClick={() => {
                              const newRows = selectedElement.checklistData!.rows.map((r, i) => {
                                if (i !== rIdx) return r;
                                return { ...r, checked: !r.checked };
                              });
                              const newChecklistData = { ...selectedElement.checklistData!, rows: newRows };
                              updateElement(currentPageIndex, selectedElement.id, { checklistData: newChecklistData });
                            }}
                            className={`w-6 h-6 rounded flex items-center justify-center transition-all shrink-0 ${
                              row.checked
                                ? 'bg-amber-500 text-white shadow-sm'
                                : 'bg-white border border-slate-300 text-transparent hover:border-amber-400'
                            }`}
                            title={row.checked ? 'Click to uncheck' : 'Click to tick'}
                          >
                            <Check size={14} className={row.checked ? 'opacity-100 stroke-[3]' : 'opacity-0'} />
                          </button>

                          {/* Editable Task Input */}
                          <input
                            type="text"
                            value={row.text || ''}
                            placeholder="Task description..."
                            onChange={(e) => {
                              const newRows = selectedElement.checklistData!.rows.map((r, i) => {
                                if (i !== rIdx) return r;
                                return { ...r, text: e.target.value };
                              });
                              const newChecklistData = { ...selectedElement.checklistData!, rows: newRows };
                              updateElement(currentPageIndex, selectedElement.id, { checklistData: newChecklistData });
                            }}
                            className={`flex-1 bg-white border border-slate-200 rounded px-2 py-1 text-xs font-medium outline-none focus:border-amber-500 transition-all ${
                              row.checked ? 'text-slate-400 line-through' : 'text-slate-700'
                            }`}
                          />

                          {/* Delete Task Button */}
                          <button
                            type="button"
                            disabled={selectedElement.checklistData.rows.length <= 1}
                            onClick={() => {
                              const newRows = selectedElement.checklistData!.rows.filter((_, i) => i !== rIdx);
                              const newChecklistData = { ...selectedElement.checklistData!, rows: newRows };
                              updateElement(currentPageIndex, selectedElement.id, {
                                checklistData: newChecklistData,
                                height: Math.max(100, selectedElement.height - 34),
                              });
                            }}
                            className="p-1 text-slate-300 hover:text-red-500 rounded disabled:opacity-20 transition-colors"
                            title="Delete Task"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        {/* Multi-column Toggles for Goals Matrix Theme */}
                        {selectedElement.checklistData.themeId === 'goals-matrix-checklist' && (
                          <div className="flex items-center gap-3 pl-8 text-[10px] text-slate-500 font-semibold">
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={Boolean(row.columnValues?.['In Progress'])}
                                onChange={(e) => {
                                  const newRows = selectedElement.checklistData!.rows.map((r, i) => {
                                    if (i !== rIdx) return r;
                                    return {
                                      ...r,
                                      columnValues: {
                                        ...(r.columnValues || {}),
                                        'In Progress': e.target.checked,
                                      },
                                    };
                                  });
                                  const newChecklistData = { ...selectedElement.checklistData!, rows: newRows };
                                  updateElement(currentPageIndex, selectedElement.id, { checklistData: newChecklistData });
                                }}
                                className="rounded text-amber-600 focus:ring-amber-500"
                              />
                              In Progress
                            </label>

                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={Boolean(row.columnValues?.['Completed'] || row.checked)}
                                onChange={(e) => {
                                  const newRows = selectedElement.checklistData!.rows.map((r, i) => {
                                    if (i !== rIdx) return r;
                                    return {
                                      ...r,
                                      checked: e.target.checked,
                                      columnValues: {
                                        ...(r.columnValues || {}),
                                        'Completed': e.target.checked,
                                      },
                                    };
                                  });
                                  const newChecklistData = { ...selectedElement.checklistData!, rows: newRows };
                                  updateElement(currentPageIndex, selectedElement.id, { checklistData: newChecklistData });
                                }}
                                className="rounded text-amber-600 focus:ring-amber-500"
                              />
                              Completed
                            </label>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Interactive Icon & Button Properties Section */}
            {isIcon && selectedElement && (
              <section className="space-y-4">
                {renderSectionHeader("ICON & BUTTON PROPERTIES", <Sparkles size={11} />)}

                {/* 1. Background Shape & Style Selector */}
                <div className={`p-4 rounded-[12px] border space-y-3 ${
                  isDark ? 'bg-[#181818] border-[#2a2a2a]' : 'bg-white border-slate-200/90 shadow-sm'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                      Shape & Background Style
                    </span>
                    <span className={`text-[10px] font-mono capitalize ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {selectedElement.shapeType === 'none' || ((!selectedElement.fill || selectedElement.fill === 'transparent') && (!selectedElement.stroke || selectedElement.stroke === 'transparent'))
                        ? 'Transparent (None)'
                        : (selectedElement.shapeType || 'circle')}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { id: 'none', label: 'Transparent', shape: 'none', fill: 'transparent', stroke: 'transparent' },
                      { id: 'circle', label: 'Circle', shape: 'circle', fill: selectedElement.fill && selectedElement.fill !== 'transparent' ? selectedElement.fill : '#0F3D3E', stroke: 'transparent' },
                      { id: 'outline-circle', label: 'Outlined Circle', shape: 'circle', fill: 'transparent', stroke: selectedElement.iconConfig?.color || '#0F3D3E', strokeWidth: 2.5 },
                      { id: 'roundedRect', label: 'Rounded', shape: 'roundedRect', fill: selectedElement.fill && selectedElement.fill !== 'transparent' ? selectedElement.fill : '#0F3D3E', stroke: 'transparent' },
                      { id: 'rect', label: 'Square', shape: 'rect', fill: selectedElement.fill && selectedElement.fill !== 'transparent' ? selectedElement.fill : '#0F3D3E', stroke: 'transparent' },
                      { id: 'outline-rect', label: 'Outlined Square', shape: 'rect', fill: 'transparent', stroke: selectedElement.iconConfig?.color || '#0F3D3E', strokeWidth: 2.5 },
                      { id: 'pill', label: 'Pill', shape: 'pill', fill: selectedElement.fill && selectedElement.fill !== 'transparent' ? selectedElement.fill : '#0F3D3E', stroke: 'transparent' },
                    ].map(styleOpt => {
                      const isCurrent = styleOpt.id === 'none'
                        ? (selectedElement.shapeType === 'none' || (selectedElement.fill === 'transparent' && (!selectedElement.stroke || selectedElement.stroke === 'transparent')))
                        : styleOpt.id === 'outline-circle'
                          ? (selectedElement.shapeType === 'circle' && selectedElement.fill === 'transparent' && selectedElement.stroke && selectedElement.stroke !== 'transparent')
                          : styleOpt.id === 'outline-rect'
                            ? (selectedElement.shapeType === 'rect' && selectedElement.fill === 'transparent' && selectedElement.stroke && selectedElement.stroke !== 'transparent')
                            : (selectedElement.shapeType === styleOpt.shape && selectedElement.fill !== 'transparent');

                      return (
                        <button
                          key={styleOpt.id}
                          type="button"
                          onClick={() => {
                            updateElement(currentPageIndex, selectedElement.id, {
                              shapeType: styleOpt.shape as any,
                              fill: styleOpt.fill,
                              stroke: styleOpt.stroke,
                              strokeWidth: (styleOpt as any).strokeWidth || 0,
                            });
                          }}
                          className={`py-1.5 px-1 flex flex-col items-center justify-center rounded-[4px] border text-[9px] font-semibold transition-all ${
                            isCurrent
                              ? 'bg-[#0F3D3E] text-white border-[#E2DCC8]/40 shadow-sm'
                              : (isDark ? 'bg-[#222] border-[#333] text-slate-400 hover:text-white hover:bg-[#282828]' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900')
                          }`}
                        >
                          <span>{styleOpt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Color Controls Card */}
                <div className={`p-4 rounded-[12px] border space-y-3.5 ${
                  isDark ? 'bg-[#181818] border-[#2a2a2a]' : 'bg-white border-slate-200/90 shadow-sm'
                }`}>
                  <span className={`text-xs font-bold block ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    Colors & Transparency
                  </span>

                  {/* Icon Color */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Icon Glyph Color</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <label
                        className="w-7 h-7 rounded-[4px] border border-black/15 shadow-sm cursor-pointer block relative transition-transform hover:scale-105 shrink-0"
                        style={{ backgroundColor: selectedElement.iconConfig?.color || '#ffffff' }}
                      >
                        <input
                          type="color"
                          value={selectedElement.iconConfig?.color || '#ffffff'}
                          onChange={(e) => {
                            updateElement(currentPageIndex, selectedElement.id, {
                              iconConfig: { ...selectedElement.iconConfig!, color: e.target.value }
                            });
                          }}
                          className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                        />
                      </label>
                      <span className={`text-xs font-mono font-bold uppercase ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {selectedElement.iconConfig?.color || '#ffffff'}
                      </span>
                    </div>
                  </div>

                  {/* Shape Background Fill Color (if not transparent) */}
                  {selectedElement.shapeType !== 'none' && (
                    <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Shape Background Fill</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <label
                          className="w-7 h-7 rounded-[4px] border border-black/15 shadow-sm cursor-pointer block relative transition-transform hover:scale-105 shrink-0"
                          style={{ backgroundColor: selectedElement.fill || '#0F3D3E' }}
                        >
                          <input
                            type="color"
                            value={selectedElement.fill === 'transparent' ? '#0F3D3E' : (selectedElement.fill || '#0F3D3E')}
                            onChange={(e) => {
                              updateElement(currentPageIndex, selectedElement.id, {
                                fill: e.target.value
                              });
                            }}
                            className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                          />
                        </label>
                        <span className={`text-xs font-mono font-bold uppercase ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          {selectedElement.fill || '#0F3D3E'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Icon Size Slider */}
                  <div className="space-y-1.5 pt-2 border-t border-black/5 dark:border-white/5">
                    <div className="flex items-center justify-between text-xs">
                      <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>Icon Size</span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {Math.round(selectedElement.iconConfig?.size || selectedElement.width * 0.5)}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min={12}
                      max={150}
                      value={selectedElement.iconConfig?.size || selectedElement.width * 0.5}
                      onChange={(e) => {
                        updateElement(currentPageIndex, selectedElement.id, {
                          iconConfig: { ...selectedElement.iconConfig!, size: Number(e.target.value) }
                        });
                      }}
                      className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-[#0F3D3E] bg-slate-200 dark:bg-zinc-700"
                    />
                  </div>

                  {/* Element Opacity Slider */}
                  <div className="space-y-1.5 pt-2 border-t border-black/5 dark:border-white/5">
                    <div className="flex items-center justify-between text-xs">
                      <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>Overall Opacity / Transparency</span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {Math.round((selectedElement.opacity ?? 1) * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={100}
                      value={Math.round((selectedElement.opacity ?? 1) * 100)}
                      onChange={(e) => {
                        updateElement(currentPageIndex, selectedElement.id, {
                          opacity: Number(e.target.value) / 100
                        });
                      }}
                      className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-[#0F3D3E] bg-slate-200 dark:bg-zinc-700"
                    />
                  </div>
                </div>

                {/* 3. Interactive Link / Action Card */}
                <div className={`p-4 rounded-[12px] border space-y-3 ${
                  isDark ? 'bg-[#181818] border-[#2a2a2a]' : 'bg-white border-slate-200/90 shadow-sm'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <LinkIcon size={14} className={isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'} />
                      <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        Interactive Action / Link
                      </span>
                    </div>
                    {(selectedElement.linkUrl || selectedElement.iconConfig?.linkUrl) && (
                      <button
                        type="button"
                        onClick={() => {
                          updateElement(currentPageIndex, selectedElement.id, {
                            linkUrl: undefined,
                            linkType: undefined,
                            iconConfig: { ...selectedElement.iconConfig!, linkUrl: undefined, linkType: undefined }
                          });
                        }}
                        className="text-[9px] font-bold text-red-400 hover:underline"
                      >
                        Remove Action
                      </button>
                    )}
                  </div>

                  {/* Action Link Types */}
                  <div className="grid grid-cols-4 gap-1">
                    {[
                      { id: 'url', label: 'Web URL', icon: Globe },
                      { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
                      { id: 'phone', label: 'Call', icon: Phone },
                      { id: 'email', label: 'Email', icon: Mail },
                    ].map(lt => {
                      const IconComp = lt.icon;
                      const isCurrent = (selectedElement.linkType || selectedElement.iconConfig?.linkType || 'url') === lt.id;
                      return (
                        <button
                          key={lt.id}
                          type="button"
                          onClick={() => {
                            updateElement(currentPageIndex, selectedElement.id, {
                              linkType: lt.id as any,
                              iconConfig: { ...selectedElement.iconConfig!, linkType: lt.id as any }
                            });
                          }}
                          className={`py-1.5 px-1 flex flex-col items-center gap-1 rounded-[4px] border text-[9px] font-medium transition-all ${
                            isCurrent
                              ? 'bg-[#0F3D3E] text-white border-[#E2DCC8]/30 shadow-sm'
                              : (isDark ? 'bg-[#222] text-slate-400 border-[#333] hover:text-white' : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900')
                          }`}
                        >
                          <IconComp size={11} />
                          <span>{lt.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  <input
                    type="text"
                    value={selectedElement.linkUrl || selectedElement.iconConfig?.linkUrl || ''}
                    placeholder="https://wa.me/..., tel:..., sales@brand.com"
                    onChange={(e) => {
                      const val = e.target.value.trim() || undefined;
                      updateElement(currentPageIndex, selectedElement.id, {
                        linkUrl: val,
                        iconConfig: { ...selectedElement.iconConfig!, linkUrl: val }
                      });
                    }}
                    className={`w-full px-2.5 py-1.5 text-xs rounded-[4px] outline-none border focus:border-[#0F3D3E] ${
                      isDark ? 'bg-[#121212] border-[#333] text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'
                    }`}
                  />
                </div>
              </section>
            )}

            {/* Image Adjustments & Overlay Section */}
            {isImage && selectedElement && (
              <section className="space-y-4">
                {renderSectionHeader("IMAGE ADJUSTMENTS", <ImageIcon size={11} />)}

                {/* Overlay Card - Pixel Perfect Match */}
                <div className={`p-4 rounded-[12px] border space-y-3 transition-all ${
                  isDark ? 'bg-[#181818] border-[#2a2a2a]' : 'bg-white border-slate-200/90 shadow-sm'
                }`}>
                  {/* Overlay Header with Switch */}
                  <div className="flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/10">
                    <div className="flex items-center gap-1.5">
                      <Layers size={14} className="text-blue-500" />
                      <span className={`text-xs font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        Image Overlay
                      </span>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={selectedElement.overlayEnabled ?? false}
                      onClick={() => {
                        const newEnabled = !selectedElement.overlayEnabled;
                        updateElement(currentPageIndex, selectedElement.id, {
                          overlayEnabled: newEnabled,
                          overlayType: selectedElement.overlayType || 'solid',
                          overlayColor: selectedElement.overlayColor || '#ea580c',
                          overlayOpacity: selectedElement.overlayOpacity !== undefined ? selectedElement.overlayOpacity : 22,
                          overlayGradientDirection: selectedElement.overlayGradientDirection || 'to-right',
                          overlayGradientStartColor: selectedElement.overlayGradientStartColor || selectedElement.overlayColor || '#000000',
                          overlayGradientEndColor: selectedElement.overlayGradientEndColor || selectedElement.overlayColor || '#000000',
                          overlayGradientStartOpacity: selectedElement.overlayGradientStartOpacity !== undefined ? selectedElement.overlayGradientStartOpacity : 80,
                          overlayGradientEndOpacity: selectedElement.overlayGradientEndOpacity !== undefined ? selectedElement.overlayGradientEndOpacity : 0
                        });
                      }}
                      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        selectedElement.overlayEnabled ? 'bg-blue-600' : (isDark ? 'bg-zinc-700' : 'bg-slate-300')
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          selectedElement.overlayEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Overlay Controls Body */}
                  <div className={`space-y-3 transition-all ${
                    selectedElement.overlayEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'
                  }`}>
                    {/* Mode Selector */}
                    <div className="flex items-center p-0.5 bg-slate-100 dark:bg-zinc-900 rounded-[6px] border border-black/5 dark:border-white/10">
                      <button
                        type="button"
                        onClick={() => updateElement(currentPageIndex, selectedElement.id, { overlayType: 'solid' })}
                        className={`flex-1 py-1 text-[11px] font-semibold rounded-[4px] transition-all ${
                          selectedElement.overlayType !== 'gradient'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : (isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
                        }`}
                      >
                        Solid
                      </button>
                      <button
                        type="button"
                        onClick={() => updateElement(currentPageIndex, selectedElement.id, {
                          overlayType: 'gradient',
                          overlayGradientDirection: selectedElement.overlayGradientDirection || 'to-right',
                          overlayGradientStartColor: selectedElement.overlayGradientStartColor || selectedElement.overlayColor || '#000000',
                          overlayGradientEndColor: selectedElement.overlayGradientEndColor || selectedElement.overlayColor || '#000000',
                          overlayGradientStartOpacity: selectedElement.overlayGradientStartOpacity !== undefined ? selectedElement.overlayGradientStartOpacity : 80,
                          overlayGradientEndOpacity: selectedElement.overlayGradientEndOpacity !== undefined ? selectedElement.overlayGradientEndOpacity : 0
                        })}
                        className={`flex-1 py-1 text-[11px] font-semibold rounded-[4px] transition-all ${
                          selectedElement.overlayType === 'gradient'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : (isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
                        }`}
                      >
                        Gradient
                      </button>
                    </div>

                    {/* SOLID CONTROLS */}
                    {selectedElement.overlayType !== 'gradient' ? (
                      <>
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                            Color
                          </span>
                          <div className="relative flex items-center">
                            <label
                              className="w-7 h-7 rounded-[4px] border border-black/15 shadow-sm cursor-pointer block relative transition-transform hover:scale-105"
                              style={{ backgroundColor: selectedElement.overlayColor || '#ea580c' }}
                            >
                              <input
                                type="color"
                                value={selectedElement.overlayColor || '#ea580c'}
                                onChange={(e) => updateElement(currentPageIndex, selectedElement.id, { overlayColor: e.target.value })}
                                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                              />
                            </label>
                          </div>
                        </div>

                        {/* Quick Swatch Presets */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {['#ea580c', '#3b82f6', '#10b981', '#6366f1', '#ec4899', '#f59e0b', '#000000', '#ffffff', '#0f172a'].map(c => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => updateElement(currentPageIndex, selectedElement.id, { overlayColor: c })}
                              className={`w-4 h-4 rounded-full border transition-transform hover:scale-110 ${
                                (selectedElement.overlayColor || '#ea580c').toLowerCase() === c.toLowerCase() ? 'ring-2 ring-blue-500 ring-offset-1 border-white' : 'border-black/10'
                              }`}
                              style={{ backgroundColor: c }}
                              title={c}
                            />
                          ))}
                        </div>

                        {/* Opacity Row */}
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-medium w-14 shrink-0 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                            Opacity
                          </span>
                          <div className="flex-1 relative flex items-center">
                            <input
                              type="range"
                              min={0}
                              max={100}
                              value={selectedElement.overlayOpacity !== undefined ? selectedElement.overlayOpacity : 22}
                              onChange={(e) => updateElement(currentPageIndex, selectedElement.id, { overlayOpacity: Number(e.target.value) })}
                              className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-blue-600 bg-slate-200 dark:bg-zinc-700"
                            />
                          </div>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={selectedElement.overlayOpacity !== undefined ? selectedElement.overlayOpacity : 22}
                            onChange={(e) => {
                              const val = Math.min(100, Math.max(0, Number(e.target.value) || 0));
                              updateElement(currentPageIndex, selectedElement.id, { overlayOpacity: val });
                            }}
                            className={`w-14 px-2 py-1 border rounded-[6px] text-center text-xs font-semibold outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${
                              isDark ? 'bg-[#222] border-[#333] text-white' : 'bg-white border-slate-300 text-slate-800'
                            }`}
                          />
                        </div>
                      </>
                    ) : (
                      /* GRADIENT CONTROLS */
                      <>
                        {/* Direction Buttons */}
                        <div className="space-y-1.5">
                          <span className={`text-[11px] font-medium ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                            Gradient Direction
                          </span>
                          <div className="grid grid-cols-4 gap-1.5">
                            {[
                              { id: 'to-right', label: 'Left → Right', icon: <ArrowRight size={14} /> },
                              { id: 'to-left', label: 'Right → Left', icon: <ArrowLeft size={14} /> },
                              { id: 'to-bottom', label: 'Top → Bottom', icon: <ArrowDown size={14} /> },
                              { id: 'to-top', label: 'Bottom → Top', icon: <ArrowUp size={14} /> }
                            ].map(dir => (
                              <button
                                key={dir.id}
                                type="button"
                                title={dir.label}
                                onClick={() => updateElement(currentPageIndex, selectedElement.id, { overlayGradientDirection: dir.id as any })}
                                className={`flex items-center justify-center gap-1 py-1.5 rounded-[6px] border text-xs font-medium transition-all ${
                                  (selectedElement.overlayGradientDirection || 'to-right') === dir.id
                                    ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                                    : (isDark
                                        ? 'bg-zinc-800/80 border-white/10 text-zinc-300 hover:text-white hover:bg-zinc-700'
                                        : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200')
                                }`}
                              >
                                {dir.icon}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Colors */}
                        <div className="grid grid-cols-2 gap-2">
                          {/* Start Color */}
                          <div className="space-y-1">
                            <span className={`text-[10px] font-medium ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                              Start Color
                            </span>
                            <div className="flex items-center gap-1.5">
                              <label
                                className="w-7 h-7 rounded-[4px] border border-black/15 shadow-sm cursor-pointer block relative transition-transform hover:scale-105 shrink-0"
                                style={{ backgroundColor: selectedElement.overlayGradientStartColor || selectedElement.overlayColor || '#000000' }}
                              >
                                <input
                                  type="color"
                                  value={selectedElement.overlayGradientStartColor || selectedElement.overlayColor || '#000000'}
                                  onChange={(e) => updateElement(currentPageIndex, selectedElement.id, { overlayGradientStartColor: e.target.value })}
                                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                                />
                              </label>
                              <span className={`text-[10px] font-mono truncate ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                                {selectedElement.overlayGradientStartColor || selectedElement.overlayColor || '#000000'}
                              </span>
                            </div>
                          </div>

                          {/* End Color */}
                          <div className="space-y-1">
                            <span className={`text-[10px] font-medium ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                              End Color
                            </span>
                            <div className="flex items-center gap-1.5">
                              <label
                                className="w-7 h-7 rounded-[4px] border border-black/15 shadow-sm cursor-pointer block relative transition-transform hover:scale-105 shrink-0"
                                style={{ backgroundColor: selectedElement.overlayGradientEndColor || selectedElement.overlayColor || '#000000' }}
                              >
                                <input
                                  type="color"
                                  value={selectedElement.overlayGradientEndColor || selectedElement.overlayColor || '#000000'}
                                  onChange={(e) => updateElement(currentPageIndex, selectedElement.id, { overlayGradientEndColor: e.target.value })}
                                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                                />
                              </label>
                              <span className={`text-[10px] font-mono truncate ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                                {selectedElement.overlayGradientEndColor || selectedElement.overlayColor || '#000000'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Quick Presets */}
                        <div className="flex items-center gap-1 flex-wrap">
                          {[
                            { name: 'Dark Fade', start: '#000000', end: '#000000', sOp: 85, eOp: 0 },
                            { name: 'White Fade', start: '#ffffff', end: '#ffffff', sOp: 85, eOp: 0 },
                            { name: 'Warm Sunset', start: '#ea580c', end: '#f59e0b', sOp: 75, eOp: 15 },
                            { name: 'Ocean Blue', start: '#1e3a8a', end: '#3b82f6', sOp: 80, eOp: 10 },
                            { name: 'Neon Purple', start: '#581c87', end: '#ec4899', sOp: 75, eOp: 20 },
                          ].map(preset => (
                            <button
                              key={preset.name}
                              type="button"
                              onClick={() => updateElement(currentPageIndex, selectedElement.id, {
                                overlayGradientStartColor: preset.start,
                                overlayGradientEndColor: preset.end,
                                overlayGradientStartOpacity: preset.sOp,
                                overlayGradientEndOpacity: preset.eOp
                              })}
                              className="h-5 px-1.5 py-0.5 rounded-[4px] border border-black/10 dark:border-white/10 text-[9px] font-medium text-slate-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-white transition-transform hover:scale-105"
                              style={{
                                background: `linear-gradient(to right, ${preset.start}, ${preset.end})`
                              }}
                              title={preset.name}
                            >
                              <span className="drop-shadow-sm text-white">{preset.name}</span>
                            </button>
                          ))}
                        </div>

                        {/* Start Opacity Slider */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className={isDark ? 'text-zinc-300' : 'text-slate-600'}>Start Opacity (Side 1)</span>
                            <span className="font-mono text-[10px] text-slate-500">
                              {selectedElement.overlayGradientStartOpacity !== undefined ? selectedElement.overlayGradientStartOpacity : (selectedElement.overlayOpacity !== undefined ? selectedElement.overlayOpacity : 80)}%
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="range"
                              min={0}
                              max={100}
                              value={selectedElement.overlayGradientStartOpacity !== undefined ? selectedElement.overlayGradientStartOpacity : (selectedElement.overlayOpacity !== undefined ? selectedElement.overlayOpacity : 80)}
                              onChange={(e) => updateElement(currentPageIndex, selectedElement.id, { overlayGradientStartOpacity: Number(e.target.value) })}
                              className="flex-1 h-1.5 rounded-lg appearance-none cursor-pointer accent-blue-600 bg-slate-200 dark:bg-zinc-700"
                            />
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={selectedElement.overlayGradientStartOpacity !== undefined ? selectedElement.overlayGradientStartOpacity : (selectedElement.overlayOpacity !== undefined ? selectedElement.overlayOpacity : 80)}
                              onChange={(e) => {
                                const val = Math.min(100, Math.max(0, Number(e.target.value) || 0));
                                updateElement(currentPageIndex, selectedElement.id, { overlayGradientStartOpacity: val });
                              }}
                              className={`w-12 px-1.5 py-0.5 border rounded-[4px] text-center text-xs font-semibold outline-none focus:border-blue-500 ${
                                isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-slate-300 text-slate-800'
                              }`}
                            />
                          </div>
                        </div>

                        {/* End Opacity Slider */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className={isDark ? 'text-zinc-300' : 'text-slate-600'}>End Opacity (Side 2)</span>
                            <span className="font-mono text-[10px] text-slate-500">
                              {selectedElement.overlayGradientEndOpacity !== undefined ? selectedElement.overlayGradientEndOpacity : 0}%
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="range"
                              min={0}
                              max={100}
                              value={selectedElement.overlayGradientEndOpacity !== undefined ? selectedElement.overlayGradientEndOpacity : 0}
                              onChange={(e) => updateElement(currentPageIndex, selectedElement.id, { overlayGradientEndOpacity: Number(e.target.value) })}
                              className="flex-1 h-1.5 rounded-lg appearance-none cursor-pointer accent-blue-600 bg-slate-200 dark:bg-zinc-700"
                            />
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={selectedElement.overlayGradientEndOpacity !== undefined ? selectedElement.overlayGradientEndOpacity : 0}
                              onChange={(e) => {
                                const val = Math.min(100, Math.max(0, Number(e.target.value) || 0));
                                updateElement(currentPageIndex, selectedElement.id, { overlayGradientEndOpacity: val });
                              }}
                              className={`w-12 px-1.5 py-0.5 border rounded-[4px] text-center text-xs font-semibold outline-none focus:border-blue-500 ${
                                isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-slate-300 text-slate-800'
                              }`}
                            />
                          </div>
                        </div>

                        {/* Live Gradient Preview Bar */}
                        <div className="pt-0.5">
                          <div
                            className="w-full h-3 rounded-[3px] border border-black/10 dark:border-white/15 shadow-inner"
                            style={{
                              background: `linear-gradient(${
                                selectedElement.overlayGradientDirection === 'to-left' ? 'to left' :
                                selectedElement.overlayGradientDirection === 'to-bottom' ? 'to bottom' :
                                selectedElement.overlayGradientDirection === 'to-top' ? 'to top' : 'to right'
                              }, ${colorToRgba(selectedElement.overlayGradientStartColor || selectedElement.overlayColor || '#000000', selectedElement.overlayGradientStartOpacity !== undefined ? selectedElement.overlayGradientStartOpacity : 80)}, ${colorToRgba(selectedElement.overlayGradientEndColor || selectedElement.overlayColor || '#000000', selectedElement.overlayGradientEndOpacity !== undefined ? selectedElement.overlayGradientEndOpacity : 0)})`
                            }}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Additional Image Styling Controls */}
                <div className={`p-4 rounded-[12px] border space-y-3 ${
                  isDark ? 'bg-[#181818] border-[#2a2a2a]' : 'bg-white border-slate-200/90 shadow-sm'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Corner Radius</span>
                    <span className="text-xs font-mono font-bold text-slate-500">{selectedElement.borderRadius || 0}px</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={60}
                    value={selectedElement.borderRadius || 0}
                    onChange={(e) => updateElement(currentPageIndex, selectedElement.id, { borderRadius: Number(e.target.value) })}
                    className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-blue-600 bg-slate-200 dark:bg-zinc-700"
                  />
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
