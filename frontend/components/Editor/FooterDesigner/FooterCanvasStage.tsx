import React, { useRef } from 'react';
import {
  ChevronDown, Search, X, Check, Minus, Plus, Bold, Italic,
  AlignLeft, AlignCenter, AlignRight, Palette, ArrowUp, ArrowDown,
  ChevronsUp, ChevronsDown, Copy, Trash2, ZoomIn, ZoomOut, RotateCcw
} from 'lucide-react';
import { CanvasElement } from '../../../types';
import { CATEGORIZED_FONTS, PAGE_WIDTH } from '../../../constants';
import { CANVAS_PAD_X, CANVAS_PAD_Y, toMm } from './constants';
import AdvancedColorPicker from '../../Properties/AdvancedColorPicker';

interface FooterCanvasStageProps {
  isDark: boolean;
  selectedElement: CanvasElement | null;
  updateElementLocal: (id: string, updates: Partial<CanvasElement>) => void;
  duplicateElementLocal: (id: string) => void;
  deleteElementLocal: (id: string) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  moveForward: (id: string) => void;
  moveBackward: (id: string) => void;
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  footerHeight: number;
  canvasElRef: React.RefObject<HTMLCanvasElement | null>;
  fabricCanvasRef: React.MutableRefObject<any>;
}

export const FooterCanvasStage: React.FC<FooterCanvasStageProps> = ({
  isDark,
  selectedElement,
  updateElementLocal,
  duplicateElementLocal,
  deleteElementLocal,
  bringToFront,
  sendToBack,
  moveForward,
  moveBackward,
  zoom,
  setZoom,
  footerHeight,
  canvasElRef,
  fabricCanvasRef,
}) => {
  const [activeColorMenu, setActiveColorMenu] = React.useState<'text' | 'shape' | null>(null);
  const colorMenuRef = useRef<HTMLDivElement>(null);

  const [isFontMenuOpen, setIsFontMenuOpen] = React.useState<boolean>(false);
  const [fontSearch, setFontSearch] = React.useState<string>('');
  const fontMenuRef = useRef<HTMLDivElement>(null);
  const [showColorPicker, setShowColorPicker] = React.useState<boolean>(false);

  // Close floating popovers on outside click
  React.useEffect(() => {
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

  return (
    <div className={`flex-1 flex flex-col overflow-hidden relative transition-colors ${
      isDark ? 'bg-[#0e0e10]' : 'bg-slate-100'
    }`}>
      {/* Top Canvas Bar: Selection Controls & Precision Zoom */}
      <div className={`h-12 px-5 border-b flex items-center justify-between shrink-0 transition-colors ${
        isDark ? 'bg-[#141416] border-[#262626]' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        {/* Selected Element Quick Properties */}
        {selectedElement ? (
          <div className="flex items-center gap-2 text-xs">
            <span className={`font-bold flex items-center gap-1 ${isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'}`}>
              <span className="w-2 h-2 rounded-full bg-cyan-500" />
              {selectedElement.type === 'text' ? 'Text' : selectedElement.type === 'shape' ? 'Shape' : 'Image'}
            </span>

            <div className={`h-4 w-px mx-1 ${isDark ? 'bg-[#333]' : 'bg-slate-200'}`} />

            {selectedElement.type === 'text' && (
              <>
                {/* Font Family Dropdown */}
                <div className="relative" ref={fontMenuRef}>
                  <button
                    onClick={() => setIsFontMenuOpen(!isFontMenuOpen)}
                    className={`h-7 px-2.5 rounded-[4px] border flex items-center justify-between gap-1.5 min-w-[110px] max-w-[150px] transition-all ${
                      isFontMenuOpen
                        ? 'bg-[#0F3D3E] border-[#E2DCC8]/60 text-white shadow'
                        : isDark
                          ? 'bg-[#1a1a1c] hover:bg-[#252528] border-[#38383c] hover:border-[#E2DCC8]/40 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 border-slate-300 hover:border-[#0F3D3E]/40 text-slate-800'
                    }`}
                    title="Change Font Family"
                  >
                    <span
                      className="truncate text-xs font-semibold flex-1 text-left"
                      style={{ fontFamily: selectedElement.fontFamily || 'Inter' }}
                    >
                      {selectedElement.fontFamily || 'Inter'}
                    </span>
                    <ChevronDown size={11} className={`${isDark ? 'text-[#888]' : 'text-slate-500'} shrink-0 transition-transform ${isFontMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isFontMenuOpen && (
                    <div className={`absolute top-full left-0 mt-1.5 w-64 border rounded-[8px] shadow-2xl overflow-hidden z-[110] animate-in fade-in zoom-in-95 flex flex-col ${
                      isDark
                        ? 'bg-[#18181b] border-[#38383c] text-[#EDEDED]'
                        : 'bg-white border-slate-300 text-slate-800'
                    }`}>
                      <div className={`p-2 border-b flex items-center gap-2 sticky top-0 z-10 ${
                        isDark ? 'border-[#28282c] bg-[#121214]' : 'border-slate-200 bg-slate-50'
                      }`}>
                        <Search size={13} className={isDark ? 'text-[#888]' : 'text-slate-400'} />
                        <input
                          autoFocus
                          type="text"
                          placeholder="Search fonts..."
                          value={fontSearch}
                          onChange={e => setFontSearch(e.target.value)}
                          className={`w-full bg-transparent border-none outline-none text-xs font-bold ${
                            isDark ? 'text-[#F1F1F1] placeholder:text-[#666]' : 'text-slate-900 placeholder:text-slate-400'
                          }`}
                        />
                        {fontSearch && (
                          <button onClick={() => setFontSearch('')} className="text-slate-400 hover:text-slate-700 text-[10px]">
                            <X size={11} />
                          </button>
                        )}
                      </div>

                      <div className="max-h-60 overflow-y-auto custom-scrollbar p-1.5 flex flex-col gap-1 overscroll-contain">
                        {filteredFonts.map(group => (
                          <div key={group.label} className="flex flex-col mb-1 last:mb-0">
                            <div className={`px-2 py-1 text-[9px] font-black uppercase tracking-widest rounded mb-0.5 ${
                              isDark ? 'text-[#E2DCC8]/60 bg-white/[0.03]' : 'text-[#0F3D3E] bg-slate-100'
                            }`}>
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
                                    className={`flex items-center justify-between px-2.5 py-1.5 rounded text-xs transition-colors text-left ${
                                      isCurrent
                                        ? 'bg-[#0F3D3E] text-white font-bold'
                                        : isDark
                                          ? 'hover:bg-white/[0.06] text-[#BBB] hover:text-white'
                                          : 'hover:bg-slate-100 text-slate-700 hover:text-slate-900'
                                    }`}
                                    style={{ fontFamily: f }}
                                  >
                                    <span className="truncate">{f}</span>
                                    {isCurrent && <Check size={12} className={isDark ? 'text-[#E2DCC8] shrink-0 ml-1.5' : 'text-white shrink-0 ml-1.5'} />}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Font Size Buttons */}
                <div className={`flex items-center border rounded px-1.5 py-0.5 ${
                  isDark ? 'bg-[#1a1a1c] border-[#333]' : 'bg-slate-100 border-slate-300'
                }`}>
                  <button
                    onClick={() => updateElementLocal(selectedElement.id, { fontSize: Math.max(8, (selectedElement.fontSize || 12) - 1) })}
                    className={`${isDark ? 'text-[#888] hover:text-white' : 'text-slate-500 hover:text-slate-900'} px-1`}
                  >
                    <Minus size={11} />
                  </button>
                  <span className={`text-xs font-mono font-bold w-6 text-center ${isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'}`}>
                    {selectedElement.fontSize || 12}
                  </span>
                  <button
                    onClick={() => updateElementLocal(selectedElement.id, { fontSize: Math.min(48, (selectedElement.fontSize || 12) + 1) })}
                    className={`${isDark ? 'text-[#888] hover:text-white' : 'text-slate-500 hover:text-slate-900'} px-1`}
                  >
                    <Plus size={11} />
                  </button>
                </div>

                {/* Bold / Italic */}
                <button
                  onClick={() => updateElementLocal(selectedElement.id, { fontWeight: selectedElement.fontWeight === 'bold' ? 'normal' : 'bold' })}
                  className={`p-1.5 rounded border transition-colors ${
                    selectedElement.fontWeight === 'bold'
                      ? 'bg-[#0F3D3E] border-[#E2DCC8] text-white'
                      : isDark
                        ? 'border-[#333] text-[#888] hover:text-white bg-[#1a1a1c]'
                        : 'border-slate-300 text-slate-600 hover:text-slate-900 bg-slate-100'
                  }`}
                  title="Bold"
                >
                  <Bold size={12} />
                </button>
                <button
                  onClick={() => updateElementLocal(selectedElement.id, { fontStyle: selectedElement.fontStyle === 'italic' ? 'normal' : 'italic' })}
                  className={`p-1.5 rounded border transition-colors ${
                    selectedElement.fontStyle === 'italic'
                      ? 'bg-[#0F3D3E] border-[#E2DCC8] text-white'
                      : isDark
                        ? 'border-[#333] text-[#888] hover:text-white bg-[#1a1a1c]'
                        : 'border-slate-300 text-slate-600 hover:text-slate-900 bg-slate-100'
                  }`}
                  title="Italic"
                >
                  <Italic size={12} />
                </button>

                {/* Text Alignment */}
                <div className={`flex items-center border rounded overflow-hidden ${
                  isDark ? 'bg-[#1a1a1c] border-[#333]' : 'bg-slate-100 border-slate-300'
                }`}>
                  <button
                    onClick={() => updateElementLocal(selectedElement.id, { textAlign: 'left' })}
                    className={`p-1.5 ${
                      selectedElement.textAlign === 'left' || !selectedElement.textAlign
                        ? 'bg-[#0F3D3E] text-white'
                        : isDark ? 'text-[#888] hover:text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Align Left"
                  >
                    <AlignLeft size={12} />
                  </button>
                  <button
                    onClick={() => updateElementLocal(selectedElement.id, { textAlign: 'center' })}
                    className={`p-1.5 ${
                      selectedElement.textAlign === 'center'
                        ? 'bg-[#0F3D3E] text-white'
                        : isDark ? 'text-[#888] hover:text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Align Center"
                  >
                    <AlignCenter size={12} />
                  </button>
                  <button
                    onClick={() => updateElementLocal(selectedElement.id, { textAlign: 'right' })}
                    className={`p-1.5 ${
                      selectedElement.textAlign === 'right'
                        ? 'bg-[#0F3D3E] text-white'
                        : isDark ? 'text-[#888] hover:text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Align Right"
                  >
                    <AlignRight size={12} />
                  </button>
                </div>

                {/* Text Color Picker Popover */}
                <div className="relative" ref={activeColorMenu === 'text' ? colorMenuRef : undefined}>
                  <button
                    onClick={() => setActiveColorMenu(activeColorMenu === 'text' ? null : 'text')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] border text-xs font-bold transition-all ${
                      activeColorMenu === 'text'
                        ? 'bg-[#0F3D3E] border-[#E2DCC8]/50 text-white shadow'
                        : isDark
                          ? 'bg-[#1a1a1c] hover:bg-[#252528] border-[#38383c] hover:border-[#E2DCC8]/40 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 border-slate-300 hover:border-[#0F3D3E]/40 text-slate-800'
                    }`}
                    title="Text Color"
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-sm"
                      style={{ background: selectedElement.fill || '#1e293b' }}
                    />
                    <span>Color</span>
                    <ChevronDown size={11} className="text-slate-400" />
                  </button>

                  {activeColorMenu === 'text' && (
                    <div className={`absolute top-full left-0 mt-2 w-64 p-3 border rounded-[8px] shadow-2xl z-[100] animate-in fade-in zoom-in-95 ${
                      isDark ? 'bg-[#18181b] border-[#38383c]' : 'bg-white border-slate-300'
                    }`}>
                      <div className={`flex items-center justify-between pb-2 mb-2 border-b ${isDark ? 'border-[#28282c]' : 'border-slate-200'}`}>
                        <div className="flex items-center gap-1.5">
                          <Palette size={13} className={isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'} />
                          <span className={`text-xs font-black uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>Text Color</span>
                        </div>
                        <button
                          onClick={() => setActiveColorMenu(null)}
                          className="p-1 hover:bg-slate-200 dark:hover:bg-[#26262a] rounded text-slate-400 hover:text-slate-700 dark:hover:text-white"
                        >
                          <X size={12} />
                        </button>
                      </div>

                      <div className={`flex items-center gap-2 mb-3 border p-1.5 rounded-[4px] ${
                        isDark ? 'bg-[#121214] border-[#2e2e32]' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <input
                          type="color"
                          value={selectedElement.fill?.startsWith('#') && selectedElement.fill.length === 7 ? selectedElement.fill : '#1e293b'}
                          onChange={(e) => updateElementLocal(selectedElement.id, { fill: e.target.value })}
                          className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent"
                        />
                        <input
                          type="text"
                          value={selectedElement.fill || '#1e293b'}
                          onChange={(e) => updateElementLocal(selectedElement.id, { fill: e.target.value })}
                          className={`flex-1 bg-transparent text-xs font-mono font-bold outline-none ${
                            isDark ? 'text-white' : 'text-slate-900'
                          }`}
                          placeholder="#000000"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Palette Presets</span>
                        <div className="grid grid-cols-6 gap-1.5">
                          {[
                            '#1e293b', '#000000', '#ffffff', '#64748b', '#94a3b8', '#cbd5e1',
                            '#0F3D3E', '#134d4f', '#E2DCC8', '#d4af37', '#e11d48', '#2563eb',
                            '#059669', '#d97706', '#7c3aed', '#db2777', '#475569', '#334155'
                          ].map(hex => (
                            <button
                              key={hex}
                              onClick={() => updateElementLocal(selectedElement.id, { fill: hex })}
                              className={`w-full aspect-square rounded-[3px] border transition-transform hover:scale-110 shadow-sm ${
                                selectedElement.fill === hex ? 'border-cyan-400 ring-1 ring-cyan-400' : 'border-black/15'
                              }`}
                              style={{ backgroundColor: hex }}
                              title={hex}
                            />
                          ))}
                        </div>
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
                      : isDark
                        ? 'bg-[#1a1a1c] hover:bg-[#252528] border-[#38383c] hover:border-[#E2DCC8]/40 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 border-slate-300 hover:border-[#0F3D3E]/40 text-slate-800'
                  }`}
                  title="Shape Fill Color"
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-sm"
                    style={{ background: selectedElement.fill || '#cbd5e1' }}
                  />
                  <span>Fill Color</span>
                  <ChevronDown size={11} className="text-slate-400" />
                </button>

                {activeColorMenu === 'shape' && (
                  <div className={`absolute top-full left-0 mt-2 w-72 p-3 border rounded-[8px] shadow-2xl z-[100] animate-in fade-in zoom-in-95 ${
                    isDark ? 'bg-[#18181b] border-[#38383c]' : 'bg-white border-slate-300'
                  }`}>
                    <div className={`flex items-center justify-between pb-2 mb-2 border-b ${isDark ? 'border-[#28282c]' : 'border-slate-200'}`}>
                      <div className="flex items-center gap-1.5">
                        <Palette size={13} className={isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'} />
                        <span className={`text-xs font-black uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>Fill Color</span>
                      </div>
                      <button
                        onClick={() => setActiveColorMenu(null)}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-[#26262a] rounded text-slate-400 hover:text-slate-700 dark:hover:text-white"
                      >
                        <X size={12} />
                      </button>
                    </div>

                    <div className={`flex items-center gap-2 mb-3 border p-1.5 rounded-[4px] ${
                      isDark ? 'bg-[#121214] border-[#2e2e32]' : 'bg-slate-50 border-slate-200'
                    }`}>
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
                        className={`flex-1 bg-transparent text-xs font-mono font-bold outline-none ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}
                        placeholder="#ffffff or gradient"
                      />
                    </div>

                    <div className="space-y-1.5 mb-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Palette Presets</span>
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
                              selectedElement.fill === hex ? 'border-cyan-400 ring-1 ring-cyan-400' : 'border-black/15'
                            }`}
                            style={{ backgroundColor: hex }}
                            title={hex}
                          />
                        ))}
                      </div>
                    </div>

                    <div className={`pt-2 border-t ${isDark ? 'border-[#28282c]' : 'border-slate-200'}`}>
                      <button
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        className={`w-full flex items-center justify-between py-1.5 px-2 border rounded-[4px] text-[11px] font-bold ${
                          isDark ? 'bg-[#202024] hover:bg-[#28282c] border-[#333] text-[#E2DCC8]' : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-[#0F3D3E]'
                        }`}
                      >
                        <span>Advanced Color Studio & Gradients</span>
                        <ChevronDown size={12} className={`transition-transform ${showColorPicker ? 'rotate-180' : ''}`} />
                      </button>

                      {showColorPicker && (
                        <div className={`mt-2 pt-1 border-t ${isDark ? 'border-[#28282c]' : 'border-slate-200'}`}>
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

            <div className={`h-4 w-px mx-1 ${isDark ? 'bg-[#333]' : 'bg-slate-200'}`} />

            {/* Quick Layer Positioning buttons */}
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => bringToFront(selectedElement.id)}
                className={`p-1.5 rounded transition-all ${
                  isDark ? 'text-[#888] hover:text-white hover:bg-[#222]' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
                }`}
                title="Bring to Front"
              >
                <ChevronsUp size={13} />
              </button>
              <button
                onClick={() => moveForward(selectedElement.id)}
                className={`p-1.5 rounded transition-all ${
                  isDark ? 'text-[#888] hover:text-white hover:bg-[#222]' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
                }`}
                title="Bring Forward"
              >
                <ArrowUp size={13} />
              </button>
              <button
                onClick={() => moveBackward(selectedElement.id)}
                className={`p-1.5 rounded transition-all ${
                  isDark ? 'text-[#888] hover:text-white hover:bg-[#222]' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
                }`}
                title="Send Backward"
              >
                <ArrowDown size={13} />
              </button>
              <button
                onClick={() => sendToBack(selectedElement.id)}
                className={`p-1.5 rounded transition-all ${
                  isDark ? 'text-[#888] hover:text-white hover:bg-[#222]' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
                }`}
                title="Send to Back"
              >
                <ChevronsDown size={13} />
              </button>
            </div>

            <div className={`h-4 w-px mx-1 ${isDark ? 'bg-[#333]' : 'bg-slate-200'}`} />

            <button
              onClick={() => duplicateElementLocal(selectedElement.id)}
              className={`p-1.5 rounded transition-all ${
                isDark ? 'text-[#888] hover:text-white hover:bg-[#222]' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
              }`}
              title="Duplicate"
            >
              <Copy size={13} />
            </button>
            <button
              onClick={() => deleteElementLocal(selectedElement.id)}
              className={`p-1.5 rounded transition-all ${
                isDark ? 'text-rose-400 hover:text-rose-300 hover:bg-rose-950/50' : 'text-rose-600 hover:text-rose-700 hover:bg-rose-100'
              }`}
              title="Delete"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium ${isDark ? 'text-[#666]' : 'text-slate-400'}`}>
              Click an element on the canvas to inspect and edit properties
            </span>
          </div>
        )}

        {/* Right Side: Zoom Controls */}
        <div className="flex items-center gap-2">
          <div className={`flex items-center border rounded overflow-hidden h-7 ${
            isDark ? 'bg-[#1a1a1c] border-[#333]' : 'bg-slate-100 border-slate-300'
          }`}>
            <button
              onClick={() => setZoom(z => Math.max(0.4, Number((z - 0.1).toFixed(1))))}
              className={`px-2 h-full transition-all ${
                isDark ? 'text-[#888] hover:text-white hover:bg-[#252528]' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
              }`}
              title="Zoom Out"
            >
              <ZoomOut size={12} />
            </button>
            <span className={`px-2 text-xs font-mono font-bold select-none ${isDark ? 'text-white' : 'text-slate-800'}`}>
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(z => Math.min(2.5, Number((z + 0.1).toFixed(1))))}
              className={`px-2 h-full transition-all ${
                isDark ? 'text-[#888] hover:text-white hover:bg-[#252528]' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
              }`}
              title="Zoom In"
            >
              <ZoomIn size={12} />
            </button>
          </div>

          <button
            onClick={() => setZoom(1)}
            className={`p-1.5 rounded transition-all ${
              isDark ? 'text-[#888] hover:text-white hover:bg-[#222]' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
            }`}
            title="Reset Zoom to 100%"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {/* Main Canvas Scrollable Viewport */}
      <div className="flex-1 overflow-auto custom-scrollbar flex items-center justify-center p-8 relative">
        <div className="relative shadow-2xl transition-all">
          {/* Top Width Ruler / Measurement Indicator */}
          <div
            className={`absolute -top-6 left-0 right-0 h-4 flex items-center justify-between text-[10px] font-mono font-bold px-1 select-none pointer-events-none ${
              isDark ? 'text-[#777]' : 'text-slate-500'
            }`}
          >
            <span>0mm</span>
            <span className="opacity-60">A4 Width (210mm / 794px)</span>
            <span>210mm</span>
          </div>

          {/* Left Height Indicator */}
          <div
            className={`absolute top-0 -left-12 bottom-0 w-10 flex flex-col items-center justify-between text-[10px] font-mono font-bold py-1 select-none pointer-events-none ${
              isDark ? 'text-[#777]' : 'text-slate-500'
            }`}
          >
            <span>0mm</span>
            <span className="rotate-[-90deg] whitespace-nowrap opacity-80 text-cyan-500 font-black">
              {toMm(footerHeight)}mm
            </span>
            <span>{toMm(footerHeight)}mm</span>
          </div>

          {/* Fabric Canvas DOM Node */}
          <canvas ref={canvasElRef} className="rounded-[4px] ring-1 ring-black/20" />
        </div>
      </div>
    </div>
  );
};
