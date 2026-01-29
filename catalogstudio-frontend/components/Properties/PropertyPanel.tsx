
import React, { useState, useRef, useEffect } from 'react';
import {
  X, Trash2, Eye, Palette, Layers, Ungroup, ChevronUp, ChevronDown,
  ChevronsUp, ChevronsDown, EyeOff, Type,
  Lock, Unlock, Package, Layout, Frame, Check,
  AlignLeft, AlignCenter, AlignRight,
  Bold, Italic, Underline, Minus, Plus, Sparkles, Columns
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { FONTS } from '../../constants';
import { CardTheme } from '../../types';
import AdvancedColorPicker from './AdvancedColorPicker';

const PropertyPanel: React.FC = () => {
  const {
    catalog, currentPageIndex, selectedElementIds, updateElement, removeElement,
    setIsPropertyPanelOpen, isPropertyPanelOpen,
    groupSelected, ungroupSelected, reorderElement, products,
    uiTheme, setEditorTab, editorTab
  } = useStore();

  const [solidColor, setSolidColor] = useState('#000000');
  const [fontSizeInput, setFontSizeInput] = useState<string>('12');

  // New Popover State
  const [pickerOpen, setPickerOpen] = useState(false);
  const [workingMode, setWorkingMode] = useState<'solid' | 'gradient'>('solid');
  const [workingSolid, setWorkingSolid] = useState('#000000');
  const [workingGrad1, setWorkingGrad1] = useState('#6366f1');
  const [workingGrad2, setWorkingGrad2] = useState('#ec4899');
  const [workingGradType, setWorkingGradType] = useState<'horizontal' | 'vertical' | 'diagonal' | 'radial'>('horizontal');

  const typographyRef = useRef<HTMLDivElement>(null);

  // Range and selection persistence refs
  const lastSelectionRange = useRef<Range | null>(null);
  const lastActiveElement = useRef<HTMLElement | null>(null);

  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const activeEl = document.activeElement as HTMLElement;
      if (activeEl && activeEl.isContentEditable) {
        lastSelectionRange.current = selection.getRangeAt(0).cloneRange();
        lastActiveElement.current = activeEl;
      }
    }
  };

  const restoreSelection = () => {
    if (lastSelectionRange.current && lastActiveElement.current) {
      lastActiveElement.current.focus();
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(lastSelectionRange.current);
      }
      return true;
    }
    return false;
  };

  const currentPage = catalog.pages[currentPageIndex];
  const selectedElements = currentPage?.elements.filter(el => selectedElementIds.includes(el.id)) || [];
  const selectedElement = selectedElements.length === 1 ? selectedElements[0] : null;

  const isProductBlock = selectedElements.some(el => el.type === 'product-block');
  const isText = selectedElements.some(el => el.type === 'text');

  const linkedProduct = selectedElement?.productId ? products.find(p => p.id === selectedElement.productId) : null;

  useEffect(() => {
    if (selectedElement?.fill) {
      setSolidColor(selectedElement.fill);
      setWorkingSolid(selectedElement.fill.includes('gradient') ? '#000000' : selectedElement.fill);

      if (selectedElement.fill.includes('gradient')) {
        setWorkingMode('gradient');
        const colors = selectedElement.fill.match(/#(?:[0-9a-fA-F]{3}){1,2}/g);
        if (colors && colors.length >= 2) {
          setWorkingGrad1(colors[0]);
          setWorkingGrad2(colors[1]);
        }
      } else {
        setWorkingMode('solid');
      }
    }
  }, [selectedElement?.id, selectedElement?.fill]);

  useEffect(() => {
    if (selectedElement?.fontSize) {
      setFontSizeInput(selectedElement.fontSize.toString());
    }
  }, [selectedElement?.id, selectedElement?.fontSize]);

  const handleBatchUpdate = (updates: any) => {
    selectedElementIds.forEach(id => updateElement(currentPageIndex, id, updates));
  };

  const stripRichTextColors = (html: string) => {
    if (!html) return html;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const allElements = tempDiv.querySelectorAll('*');
    allElements.forEach(el => {
      const style = (el as HTMLElement).style;
      style.background = '';
      style.backgroundImage = '';
      style.backgroundClip = '';
      style.webkitBackgroundClip = '';
      style.webkitTextFillColor = '';
      style.color = '';
      (el as HTMLElement).removeAttribute('color');
      if (!style.cssText.trim()) {
        (el as HTMLElement).removeAttribute('style');
      }
    });
    return tempDiv.innerHTML.trim();
  };

  const handlePickerApply = () => {
    if (workingMode === 'solid') {
      if (selectedElement?.type === 'text') {
        restoreSelection();
        const selection = window.getSelection();
        const activeEl = document.activeElement as HTMLElement;
        if (selection && selection.rangeCount > 0 && selection.toString().length > 0) {
          document.execCommand('foreColor', false, workingSolid);
          activeEl.dispatchEvent(new Event('input', { bubbles: true }));
        } else {
          const cleanText = stripRichTextColors(selectedElement.text || 'Text');
          if (typographyRef.current) typographyRef.current.innerHTML = cleanText;
          handleBatchUpdate({ text: cleanText, fill: workingSolid });
        }
      } else {
        handleBatchUpdate({ fill: workingSolid });
      }
    } else {
      const gradString = workingGradType === 'vertical' ? `linear-gradient(to bottom, ${workingGrad1}, ${workingGrad2})` :
        workingGradType === 'diagonal' ? `linear-gradient(to bottom right, ${workingGrad1}, ${workingGrad2})` :
          workingGradType === 'radial' ? `radial-gradient(circle, ${workingGrad1}, ${workingGrad2})` :
            `linear-gradient(to right, ${workingGrad1}, ${workingGrad2})`;
      handleBatchUpdate({ fill: gradString });
    }
    setPickerOpen(false);
  };

  const handlePickerCancel = () => {
    setPickerOpen(false);
  };

  if (!isPropertyPanelOpen) return null;

  if (selectedElementIds.length === 0) {
    return (
      <div className={`w-full h-full select-none flex flex-col ${uiTheme === 'dark' ? 'bg-[#0f172a]' : 'bg-slate-50'}`}>
        <div className="p-6 h-full flex flex-col">
          {/* Header with Close Button */}
          <div className="flex items-center justify-end mb-8">
            <button
              onClick={() => setIsPropertyPanelOpen(false)}
              className={`p-2 rounded-xl transition-all ${uiTheme === 'dark' ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-50 text-slate-400 hover:text-slate-600'}`}
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
            <div className={`w-16 h-16 rounded-3xl mb-4 flex items-center justify-center ${uiTheme === 'dark' ? 'bg-slate-800 text-slate-600' : 'bg-slate-200 text-slate-400'}`}>
              <Palette size={32} />
            </div>
            <h3 className={`text-sm font-bold mb-1 ${uiTheme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>No Selection</h3>
            <p className="text-xs text-slate-500 max-w-[180px]">Select an element on the canvas to edit its properties.</p>
          </div>
        </div>
      </div>
    );
  }

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

  return (
    <div
      className={`w-full h-full select-none flex flex-col ${uiTheme === 'dark' ? 'bg-[#0f172a]' : 'bg-slate-50'}`}
    >
      <div className="p-6 flex flex-col gap-6 h-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${uiTheme === 'dark' ? 'bg-indigo-500/10' : 'bg-indigo-50'}`}>
              <Palette className="text-indigo-600" size={18} />
            </div>
            <div>
              <h3 className={`text-sm font-black tracking-tight ${uiTheme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{selectedElementIds.length > 1 ? 'Batch Edit' : (selectedElement?.type?.toUpperCase() || 'ELEMENT')}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Instance Properties</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {selectedElementIds.length > 1 ? (
              <button onClick={() => groupSelected(currentPageIndex)} className={`p-2 rounded-xl transition-all ${uiTheme === 'dark' ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-50 text-slate-400 hover:text-slate-600'}`} title="Group Selection">
                <Layers size={16} />
              </button>
            ) : selectedElement?.groupId && (
              <button onClick={() => ungroupSelected(currentPageIndex)} className={`p-2 rounded-xl transition-all ${uiTheme === 'dark' ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-50 text-slate-400 hover:text-slate-600'}`} title="Ungroup">
                <Ungroup size={16} />
              </button>
            )}
            <button
              onClick={() => setIsPropertyPanelOpen(false)}
              className={`p-2 rounded-xl transition-all ${uiTheme === 'dark' ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-50 text-slate-400 hover:text-slate-600'}`}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar pb-24">
          {/* Main Controls Selection */}
          <section className="animate-in slide-in-from-top-2">
            {renderSectionHeader("VISUAL STYLE", <Palette size={11} />)}

            <div className="flex flex-col gap-3 relative">
              <div className="flex gap-2">
                <button
                  onClick={() => setPickerOpen(!pickerOpen)}
                  className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-xl border relative group transition-all ${uiTheme === 'dark' ? 'bg-slate-800 border-slate-700 hover:border-indigo-500/50' : 'bg-slate-50 border-slate-100 hover:border-indigo-200'} ${pickerOpen ? 'ring-2 ring-indigo-500' : ''}`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg border-2 shadow-sm relative overflow-hidden shrink-0 ${uiTheme === 'dark' ? 'border-slate-600' : 'border-white'}`}
                    style={{ background: selectedElement?.fill || solidColor }}
                  />
                  <div className="flex flex-col items-start">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Color Code</span>
                    <span className={`text-[11px] font-black uppercase ${uiTheme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>{selectedElement?.fill && selectedElement.fill.includes('gradient') ? 'GRADIENT' : (selectedElement?.fill || solidColor)}</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setEditorTab('effects');
                  }}
                  className={`flex-1 flex items-center justify-center px-4 py-3 rounded-xl border transition-all ${editorTab === 'effects' ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : (uiTheme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-300 hover:border-indigo-500/50' : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-indigo-200')}`}
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles size={14} className={editorTab === 'effects' ? 'text-white' : 'text-indigo-500'} />
                    <span className="text-[10px] font-black uppercase tracking-wider">Effects</span>
                  </div>
                </button>
              </div>

              {/* Color Picker Popover */}
              {pickerOpen && (
                <div className={`absolute top-full left-0 w-full mt-2 z-50 p-5 rounded-[24px] border shadow-2xl animate-in fade-in zoom-in-95 duration-200 ${uiTheme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                  {/* Mode Toggles */}
                  <div className="flex gap-2 mb-5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
                    <button
                      onClick={() => setWorkingMode('solid')}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${workingMode === 'solid' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                    >
                      Color
                    </button>
                    <button
                      onClick={() => setWorkingMode('gradient')}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${workingMode === 'gradient' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                    >
                      Gradient
                    </button>
                  </div>

                  {workingMode === 'solid' ? (
                    <div className="space-y-4">
                      <AdvancedColorPicker
                        color={workingSolid}
                        onChange={setWorkingSolid}
                      />
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">{workingSolid}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div className="flex gap-4">
                        <div className="flex-1 space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Start Color</label>
                          <AdvancedColorPicker
                            color={workingGrad1}
                            onChange={setWorkingGrad1}
                          />
                          <div className="text-[9px] font-black text-slate-500 font-mono text-center">{workingGrad1}</div>
                        </div>
                        <div className="flex-1 space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">End Color</label>
                          <AdvancedColorPicker
                            color={workingGrad2}
                            onChange={setWorkingGrad2}
                          />
                          <div className="text-[9px] font-black text-slate-500 font-mono text-center">{workingGrad2}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-2 pt-2">
                        {['horizontal', 'vertical', 'diagonal', 'radial'].map((t) => (
                          <button
                            key={t}
                            onClick={() => setWorkingGradType(t as any)}
                            className={`h-10 rounded-xl border-2 transition-all ${workingGradType === t ? 'border-indigo-600 scale-105 z-10 shadow-lg shadow-indigo-500/10' : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600'}`}
                            title={t}
                            style={{
                              background: t === 'horizontal' ? `linear-gradient(to right, ${workingGrad1}, ${workingGrad2})` :
                                t === 'vertical' ? `linear-gradient(to bottom, ${workingGrad1}, ${workingGrad2})` :
                                  t === 'diagonal' ? `linear-gradient(to bottom right, ${workingGrad1}, ${workingGrad2})` :
                                    `radial-gradient(circle, ${workingGrad1}, ${workingGrad2})`
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer Buttons */}
                  <div className="flex gap-3 mt-8">
                    <button
                      onClick={handlePickerCancel}
                      className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all text-slate-500"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePickerApply}
                      className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 hover:translate-y-[-1px] active:translate-y-[0px] transition-all"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}

              {/* Independent Opacity Control */}
              <div className={`p-5 rounded-[24px] border transition-all ${uiTheme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transparency</span>
                  <span className="text-[11px] font-black text-indigo-500">{Math.round((selectedElement?.opacity || 1) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={selectedElement?.opacity ?? 1}
                  onChange={(e) => handleBatchUpdate({ opacity: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            </div>
          </section>

          {/* TEXT SPECIFIC CONTROLS */}
          {isText && (
            <section className="animate-in slide-in-from-top-2">
              {renderSectionHeader("TEXT FORMATTING", <Type size={11} />)}

              <div className="flex gap-2 mb-3">
                <div className="flex-1 relative">
                  <select
                    value={selectedElement?.fontFamily || 'Inter'}
                    onChange={(e) => handleBatchUpdate({ fontFamily: e.target.value })}
                    className={`w-full appearance-none border rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${uiTheme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-100 text-slate-700'}`}
                  >
                    {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>

                <div className={`flex items-center border rounded-xl overflow-hidden shrink-0 ${uiTheme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleBatchUpdate({ fontSize: Math.max(1, (selectedElement?.fontSize || 12) - 1) })}
                    className={`w-9 h-full flex items-center justify-center transition-colors ${uiTheme === 'dark' ? 'hover:bg-slate-700 text-slate-500 hover:text-white' : 'hover:bg-slate-100 text-slate-400'}`}
                  >
                    <Minus size={12} />
                  </button>
                  <input
                    type="text"
                    value={fontSizeInput}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setFontSizeInput(val);
                      if (val && parseInt(val) > 0) {
                        handleBatchUpdate({ fontSize: parseInt(val) });
                      }
                    }}
                    onBlur={() => {
                      if (!fontSizeInput || parseInt(fontSizeInput) <= 0) {
                        setFontSizeInput(selectedElement?.fontSize?.toString() || '12');
                      }
                    }}
                    className={`w-8 bg-transparent text-center text-xs font-black outline-none transition-colors ${uiTheme === 'dark' ? 'text-slate-200 focus:text-indigo-400' : 'text-slate-800 focus:text-indigo-600 focus:bg-indigo-50/50'}`}
                  />
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleBatchUpdate({ fontSize: (selectedElement?.fontSize || 12) + 1 })}
                    className={`w-9 h-full flex items-center justify-center transition-colors ${uiTheme === 'dark' ? 'hover:bg-slate-700 text-slate-500 hover:text-white' : 'hover:bg-slate-100 text-slate-400'}`}
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>

              <div className="flex gap-2 mb-4">
                <div className={`flex p-1 rounded-xl gap-1 ${uiTheme === 'dark' ? 'bg-slate-800' : 'bg-slate-900'} text-slate-400`}>
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleBatchUpdate({ textAlign: 'left' })}
                    className={`p-2 rounded-lg transition-all ${selectedElement?.textAlign === 'left' || !selectedElement?.textAlign ? 'bg-indigo-600 text-white shadow-lg' : 'hover:text-white'}`}
                  >
                    <AlignLeft size={16} />
                  </button>
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleBatchUpdate({ textAlign: 'center' })}
                    className={`p-2 rounded-lg transition-all ${selectedElement?.textAlign === 'center' ? 'bg-indigo-600 text-white shadow-lg' : 'hover:text-white'}`}
                  >
                    <AlignCenter size={16} />
                  </button>
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleBatchUpdate({ textAlign: 'right' })}
                    className={`p-2 rounded-lg transition-all ${selectedElement?.textAlign === 'right' ? 'bg-indigo-600 text-white shadow-lg' : 'hover:text-white'}`}
                  >
                    <AlignRight size={16} />
                  </button>
                </div>

                <div className={`flex-1 flex border rounded-xl p-1 gap-1 ${uiTheme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      const activeEl = document.activeElement as HTMLElement;
                      if (activeEl && activeEl.isContentEditable) {
                        document.execCommand('bold');
                      } else {
                        handleBatchUpdate({ fontWeight: (selectedElement?.fontWeight === 'bold' || selectedElement?.fontWeight === '700') ? '400' : '700' });
                      }
                    }}
                    className={`flex-1 rounded-lg transition-all flex items-center justify-center ${selectedElement?.fontWeight === 'bold' || selectedElement?.fontWeight === '700' ? (uiTheme === 'dark' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-indigo-600 shadow-sm border border-slate-100') : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                  >
                    <Bold size={16} />
                  </button>
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      const activeEl = document.activeElement as HTMLElement;
                      if (activeEl && activeEl.isContentEditable) {
                        document.execCommand('italic');
                      } else {
                        handleBatchUpdate({ fontStyle: selectedElement?.fontStyle === 'italic' ? 'normal' : 'italic' });
                      }
                    }}
                    className={`flex-1 rounded-lg transition-all flex items-center justify-center ${selectedElement?.fontStyle === 'italic' ? (uiTheme === 'dark' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-indigo-600 shadow-sm border border-slate-100') : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                  >
                    <Italic size={16} />
                  </button>
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      const activeEl = document.activeElement as HTMLElement;
                      if (activeEl && activeEl.isContentEditable) {
                        document.execCommand('underline');
                      } else {
                        handleBatchUpdate({ textDecoration: selectedElement?.textDecoration === 'underline' ? 'none' : 'underline' });
                      }
                    }}
                    className={`flex-1 rounded-lg transition-all flex items-center justify-center ${selectedElement?.textDecoration === 'underline' ? (uiTheme === 'dark' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-indigo-600 shadow-sm border border-slate-100') : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                  >
                    <Underline size={16} />
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <div
                  contentEditable
                  suppressContentEditableWarning
                  className={`w-full border rounded-xl p-4 text-sm font-medium outline-none resize-none transition-all min-h-[100px] overflow-auto shadow-inner [&_*]:!bg-transparent [&_*]:![text-decoration:inherit] [&_*]:![color:inherit] [&_*]:![font-size:inherit] [&_*]:![-webkit-text-fill-color:inherit] ${uiTheme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-700'}`}
                  style={{
                    fontFamily: selectedElement?.fontFamily || 'Inter',
                    fontSize: '14px',
                    fontWeight: selectedElement?.fontWeight || 'normal',
                    fontStyle: selectedElement?.fontStyle || 'normal',
                    textAlign: selectedElement?.textAlign || 'left',
                    color: uiTheme === 'dark' ? '#cbd5e1' : '#475569',
                    caretColor: '#4f46e5',
                    lineHeight: 1.5,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                  }}
                  onBlur={saveSelection}
                  onMouseUp={saveSelection}
                  onInput={(e) => {
                    const newText = (e.currentTarget as HTMLElement).innerHTML;
                    handleBatchUpdate({ text: newText });
                  }}
                  ref={(el) => {
                    if (el && selectedElement?.text !== undefined) {
                      const cleanText = selectedElement.text || '';
                      if (el.innerHTML !== cleanText && document.activeElement !== el) {
                        el.innerHTML = cleanText;
                      }
                    }
                  }}
                />
              </div>
            </section>
          )}

          {/* Card Specific Architecture */}
          {isProductBlock && (
            <section className="animate-in slide-in-from-top-2">
              {renderSectionHeader("CARD ARCHITECTURE", <Layout size={11} />)}
              <div className="grid grid-cols-3 gap-2">
                {cardThemes.map(t => (
                  <button
                    key={t.id}
                    onClick={() => handleBatchUpdate({ cardTheme: t.id })}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${selectedElement?.cardTheme === t.id || (!selectedElement?.cardTheme && t.id === 'classic-stack') ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : (uiTheme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700' : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100')}`}
                  >
                    <t.icon size={18} />
                    <span className="text-[8px] font-black uppercase tracking-tighter">{t.label}</span>
                  </button>
                ))}
              </div>

              <div className="mt-6 space-y-2">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-3">CONTENT VISIBILITY</p>
                {[
                  { key: 'showName', label: 'Product Name' },
                  { key: 'showPrice', label: 'Retail Price' },
                  { key: 'showSku', label: 'SKU / ID' }
                ].map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => handleBatchUpdate({ [opt.key]: (selectedElement as any)[opt.key] === false })}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border group hover:border-indigo-200 transition-all ${uiTheme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}
                  >
                    <span className={`text-[10px] font-bold ${uiTheme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{opt.label}</span>
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${(selectedElement as any)[opt.key] !== false ? 'bg-indigo-600 text-white' : (uiTheme === 'dark' ? 'bg-slate-700 text-transparent' : 'bg-slate-200 text-transparent')}`}>
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
              <div className="p-4 bg-indigo-600 rounded-2xl text-white space-y-2 shadow-lg shadow-indigo-600/20">
                <p className="text-[10px] font-mono font-bold opacity-60 uppercase">{linkedProduct.sku}</p>
                <p className="text-xs font-black truncate">{linkedProduct.name}</p>
                <div className="flex items-center gap-2 pt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-80">Synced with Catalog</span>
                </div>
              </div>
            </section>
          )}

          {/* Layer Management */}
          <section>
            {renderSectionHeader("LAYER STACKING", <Layers size={11} />)}
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'front', icon: <ChevronsUp size={16} />, title: 'Bring to Front' },
                { id: 'forward', icon: <ChevronUp size={16} />, title: 'Bring Forward' },
                { id: 'backward', icon: <ChevronDown size={16} />, title: 'Send Backward' },
                { id: 'back', icon: <ChevronsDown size={16} />, title: 'Send to Back' },
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => reorderElement(currentPageIndex, selectedElementIds[0], btn.id as any)}
                  className={`p-3 rounded-xl transition-all flex items-center justify-center shadow-sm border ${uiTheme === 'dark' ? 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border-slate-700' : 'bg-slate-50 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 border-slate-100/50'}`}
                  title={btn.title}
                >
                  {btn.icon}
                </button>
              ))}
            </div>
          </section>

          {/* Visibility Controls */}
          <section>
            {renderSectionHeader("CONTROL FLAGS", <Eye size={11} />)}
            <div className="flex gap-2">
              <button
                onClick={() => handleBatchUpdate({ visible: selectedElement?.visible === false })}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${uiTheme === 'dark' ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border-slate-100'}`}
              >
                {selectedElement?.visible === false ? <EyeOff size={14} /> : <Eye size={14} />} {selectedElement?.visible === false ? 'Hidden' : 'Visible'}
              </button>
              <button
                onClick={() => handleBatchUpdate({ locked: !selectedElement?.locked })}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${selectedElement?.locked ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : (uiTheme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-100 text-slate-500')}`}
              >
                {selectedElement?.locked ? <Lock size={14} /> : <Unlock size={14} />} {selectedElement?.locked ? 'Locked' : 'Unlocked'}
              </button>
            </div>
          </section>

          <button
            onClick={() => selectedElementIds.forEach(id => removeElement(currentPageIndex, id))}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest mt-4"
          >
            <Trash2 size={14} /> Delete Selected
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyPanel;
