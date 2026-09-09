import React, { useState, useMemo } from 'react';
import { Type, Search, X } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { CanvasElement } from '../../types';
import { FONT_COMBINATIONS, FontCombination } from '../../fontCombinations';

const FONT_OPTIONS = [
  'Inter', 'Montserrat', 'Playfair Display', 'Poppins', 'Oswald',
  'Cinzel', 'Outfit', 'Roboto', 'Merriweather', 'Lato', 'Raleway', 'Bebas Neue',
  'Shrikhand', 'Righteous', 'Dancing Script', 'Kaushan Script', 'Pacifico', 'Alex Brush'
];

const TextPanel: React.FC = () => {
  const { catalog, currentPageIndex, addElement, updateProjectSettings, user, uiTheme } = useStore();
  const isDark = uiTheme === 'dark';

  const [search, setSearch] = useState('');
  const [showFontPicker, setShowFontPicker] = useState(false);

  // Helper to add canvas text
  const handleAddTextElement = (opts: Partial<CanvasElement>) => {
    const timestamp = Date.now();
    const currentBrandFont = catalog.fontFamily || 'Inter';

    const newEl: CanvasElement = {
      id: `text-${timestamp}-${Math.random().toString(36).substring(2, 6)}`,
      type: 'text',
      x: opts.x ?? 120,
      y: opts.y ?? 260,
      width: opts.width ?? 350,
      height: opts.height ?? 50,
      rotation: opts.rotation ?? 0,
      opacity: opts.opacity ?? 1,
      text: opts.text ?? 'Your paragraph text',
      fontSize: opts.fontSize ?? 18,
      fontFamily: opts.fontFamily ?? currentBrandFont,
      fontWeight: opts.fontWeight ?? 'normal',
      fontStyle: opts.fontStyle ?? 'normal',
      fill: opts.fill ?? '#1e293b',
      textAlign: opts.textAlign ?? 'left',
      letterSpacing: opts.letterSpacing ?? 0,
      lineHeight: opts.lineHeight ?? 1.2,
      effectStyle: opts.effectStyle,
      effectColor: opts.effectColor,
      shadowOffsetX: opts.shadowOffsetX,
      shadowOffsetY: opts.shadowOffsetY,
      shadowBlur: opts.shadowBlur,
      textStrokeWidth: opts.textStrokeWidth,
      zIndex: 25,
      ...opts,
    };

    addElement(currentPageIndex, newEl);
  };

  // 1. Add Default Text Box
  const handleAddDefaultTextBox = () => {
    handleAddTextElement({
      text: 'Add your text here',
      fontSize: 18,
      width: 320,
      height: 45,
      fontWeight: '500',
    });
  };

  // 2. Heading / Subheading / Body
  const handleAddHeading = () => {
    handleAddTextElement({
      text: 'Add a heading',
      fontSize: 42,
      fontWeight: '900',
      width: 440,
      height: 55,
      fontFamily: catalog.fontFamily || 'Montserrat',
      fill: '#0f172a',
    });
  };

  const handleAddSubheading = () => {
    handleAddTextElement({
      text: 'Add a subheading',
      fontSize: 24,
      fontWeight: '700',
      width: 380,
      height: 38,
      fontFamily: catalog.fontFamily || 'Inter',
      fill: '#1e293b',
    });
  };

  const handleAddBodyText = () => {
    handleAddTextElement({
      text: 'Add a little bit of body text',
      fontSize: 14,
      fontWeight: '400',
      width: 320,
      height: 60,
      fontFamily: catalog.fontFamily || 'Inter',
      fill: '#475569',
      lineHeight: 1.4,
    });
  };

  // Insert Font Combination Group
  const handleAddCombination = (combo: FontCombination) => {
    const startY = 220;
    const startX = 140;
    combo.elements.forEach(item => {
      handleAddTextElement({
        text: item.text,
        x: startX,
        y: startY + item.offsetY,
        width: item.width || 360,
        height: item.height || 50,
        fontSize: item.fontSize,
        fontFamily: item.fontFamily,
        fontWeight: item.fontWeight,
        fontStyle: item.fontStyle,
        fill: item.fill,
        letterSpacing: item.letterSpacing || 0,
        lineHeight: item.lineHeight || 1.2,
        textAlign: item.textAlign || 'center',
        effectStyle: item.effectStyle,
        effectColor: item.effectColor,
        shadowOffsetX: item.shadowOffsetX,
        shadowOffsetY: item.shadowOffsetY,
        shadowBlur: item.shadowBlur,
        textStrokeWidth: item.textStrokeWidth,
      });
    });
  };

  // Filter combinations
  const filteredCombinations = useMemo(() => {
    if (!search.trim()) return FONT_COMBINATIONS;
    const s = search.toLowerCase();
    return FONT_COMBINATIONS.filter(c =>
      c.name.toLowerCase().includes(s) ||
      c.category.toLowerCase().includes(s) ||
      c.elements.some(e => e.text.toLowerCase().includes(s) || e.fontFamily.toLowerCase().includes(s))
    );
  }, [search]);

  return (
    <div className={`flex flex-col h-full select-none transition-colors duration-200 ${isDark ? 'bg-[#141416] text-[#ededed]' : 'bg-white text-slate-800'}`}>
      {/* Header & Search Bar */}
      <div className={`p-3 border-b flex flex-col gap-2.5 transition-colors ${isDark ? 'border-[#262626] bg-[#141414]' : 'border-slate-200 bg-slate-50'}`}>
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-[#E2DCC8]/40' : 'text-slate-400'}`} size={15} />
          <input
            type="text"
            placeholder="Search fonts and combinations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-9 pr-4 py-2 rounded-[4px] border text-xs transition-all outline-none ${
              isDark 
                ? 'bg-[#100F0F] text-[#F1F1F1] border-[#262626] focus:border-[#0F3D3E] placeholder:text-[#E2DCC8]/40' 
                : 'bg-white text-slate-800 border-slate-200 focus:border-[#0F3D3E] placeholder:text-slate-400'
            }`}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 ${isDark ? 'text-[#E2DCC8]/40 hover:text-white' : 'text-slate-400 hover:text-slate-700'}`}
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Primary Action Button: "Add a text box" */}
        <button
          onClick={handleAddDefaultTextBox}
          className="w-full bg-[#0F3D3E] hover:bg-[#155455] active:scale-[0.99] text-white font-bold py-2.5 px-4 rounded-[4px] border border-[#E2DCC8]/30 flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer text-xs uppercase tracking-wider"
        >
          <Type size={16} />
          <span>Add a text box</span>
        </button>
      </div>

      {/* Scrollable Content Sections */}
      <div className="flex-1 overflow-y-auto p-3 space-y-5 custom-scrollbar">

        {/* Brand Kit Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-[#E2DCC8]/60' : 'text-slate-400'}`}>Brand Kit</span>
            <button
              onClick={() => setShowFontPicker(!showFontPicker)}
              className={`text-[10px] font-bold hover:underline cursor-pointer uppercase tracking-wider ${isDark ? 'text-[#E2DCC8]/70 hover:text-white' : 'text-[#0F3D3E] hover:text-[#155455]'}`}
            >
              <span>Edit</span>
            </button>
          </div>

          <button
            onClick={() => setShowFontPicker(!showFontPicker)}
            className={`w-full border p-2.5 rounded-[4px] flex items-center justify-between text-xs transition-all cursor-pointer group ${
              isDark 
                ? 'bg-[#161616] hover:bg-[#1b1b1e] border-[#262626] hover:border-[#E2DCC8]/25' 
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex flex-col text-left">
              <span className={`text-[9px] font-bold uppercase tracking-wider ${isDark ? 'text-[#E2DCC8]/50' : 'text-slate-400'}`}>Active Brand Font</span>
              <span className={`font-bold text-sm ${isDark ? 'text-[#E2DCC8] group-hover:text-white' : 'text-slate-800 group-hover:text-[#0F3D3E]'}`}>
                {catalog.fontFamily || 'Montserrat'}
              </span>
            </div>
            <span className="text-[10px] text-white font-bold uppercase tracking-wider bg-[#0F3D3E] hover:bg-[#155455] px-2 py-1 rounded-[4px] border border-[#E2DCC8]/30 transition-all">
              {showFontPicker ? 'Close' : 'Change font'}
            </span>
          </button>

          {/* Expandable Font Picker */}
          {showFontPicker && (
            <div className={`p-2 rounded-[4px] border grid grid-cols-2 gap-1 animate-in fade-in duration-150 shadow-xl ${
              isDark ? 'bg-[#161616] border-[#262626]' : 'bg-white border-slate-200'
            }`}>
              {FONT_OPTIONS.map((font) => (
                <button
                  key={font}
                  onClick={() => {
                    updateProjectSettings({ fontFamily: font });
                    setShowFontPicker(false);
                  }}
                  className={`px-2.5 py-1.5 text-xs rounded-[4px] text-left transition-all truncate ${
                    (catalog.fontFamily || 'Montserrat') === font
                      ? 'bg-[#0F3D3E] text-white font-bold border border-[#E2DCC8]/30'
                      : (isDark ? 'bg-white/5 hover:bg-[#0F3D3E]/30 text-gray-300 hover:text-white border border-transparent' : 'bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-transparent')
                  }`}
                  style={{ fontFamily: font }}
                >
                  {font}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Default text styles Section */}
        <div className="space-y-2">
          <div className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-[#E2DCC8]/60' : 'text-slate-400'}`}>
            Default text styles
          </div>

          {/* Heading Card */}
          <div
            onClick={handleAddHeading}
            className={`group border p-3.5 rounded-[4px] cursor-pointer transition-all active:scale-[0.99] flex items-center shadow-sm ${
              isDark 
                ? 'bg-[#161616] hover:bg-[#1b1b1e] border-[#262626] hover:border-[#0F3D3E]' 
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 hover:border-[#0F3D3E]'
            }`}
          >
            <span
              className={`text-2xl font-black tracking-tight transition-colors ${
                isDark ? 'text-white group-hover:text-[#E2DCC8]' : 'text-slate-900 group-hover:text-[#0F3D3E]'
              }`}
              style={{ fontFamily: catalog.fontFamily || 'Montserrat' }}
            >
              Add a heading
            </span>
          </div>

          {/* Subheading Card */}
          <div
            onClick={handleAddSubheading}
            className={`group border p-3 rounded-[4px] cursor-pointer transition-all active:scale-[0.99] flex items-center shadow-sm ${
              isDark 
                ? 'bg-[#161616] hover:bg-[#1b1b1e] border-[#262626] hover:border-[#0F3D3E]' 
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 hover:border-[#0F3D3E]'
            }`}
          >
            <span
              className={`text-base font-bold transition-colors ${
                isDark ? 'text-gray-200 group-hover:text-white' : 'text-slate-700 group-hover:text-slate-900'
              }`}
              style={{ fontFamily: catalog.fontFamily || 'Inter' }}
            >
              Add a subheading
            </span>
          </div>

          {/* Body text Card */}
          <div
            onClick={handleAddBodyText}
            className={`group border p-2.5 rounded-[4px] cursor-pointer transition-all active:scale-[0.99] flex items-center shadow-sm ${
              isDark 
                ? 'bg-[#161616] hover:bg-[#1b1b1e] border-[#262626] hover:border-[#0F3D3E]' 
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 hover:border-[#0F3D3E]'
            }`}
          >
            <span
              className={`text-xs font-normal transition-colors ${
                isDark ? 'text-gray-400 group-hover:text-gray-200' : 'text-slate-500 group-hover:text-slate-700'
              }`}
              style={{ fontFamily: catalog.fontFamily || 'Inter' }}
            >
              Add a little bit of body text
            </span>
          </div>
        </div>

        {/* Font Combinations Section */}
        <div className="space-y-2.5 pb-6">
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-[#E2DCC8]/60' : 'text-slate-400'}`}>
              Font combinations
            </span>
            <span className={`text-[9px] font-bold uppercase tracking-wider ${isDark ? 'text-[#E2DCC8]/50' : 'text-slate-400'}`}>
              {filteredCombinations.length} available
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {filteredCombinations.map((combo) => (
              <div
                key={combo.id}
                onClick={() => handleAddCombination(combo)}
                title={combo.name}
                className={`aspect-square border rounded-[4px] p-2 flex flex-col items-center justify-center text-center cursor-pointer transition-all active:scale-[0.97] shadow-sm relative group overflow-hidden select-none ${
                  isDark 
                    ? 'bg-[#161616] hover:bg-[#1b1b1e] border-[#262626] hover:border-[#0F3D3E]' 
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 hover:border-[#0F3D3E]'
                }`}
              >
                <div className="flex flex-col items-center justify-center w-full pointer-events-none gap-0.5">
                  {combo.elements.map((item, idx) => {
                    const isMultiLine = item.text.includes('\n');
                    const previewSize = Math.max(
                      9,
                      Math.min(22, Math.round(item.fontSize * (isMultiLine ? 0.36 : 0.42)))
                    );
                    // In light mode, if item.fill was pure white or light grey, ensure good contrast
                    let renderColor = item.fill === 'transparent' ? 'transparent' : item.fill;
                    if (!isDark && (renderColor === '#ffffff' || renderColor === '#F1F1F1' || renderColor === '#fff')) {
                      renderColor = '#0F3D3E';
                    }
                    return (
                      <span
                        key={idx}
                        className="leading-tight text-center max-w-full truncate block whitespace-pre-line"
                        style={{
                          fontFamily: item.fontFamily,
                          fontSize: `${previewSize}px`,
                          fontWeight: item.fontWeight as any,
                          fontStyle: item.fontStyle || 'normal',
                          color: renderColor,
                          letterSpacing: item.letterSpacing ? `${item.letterSpacing * 0.4}px` : 'normal',
                          textShadow: item.effectStyle === 'neon'
                            ? `0 0 8px ${item.effectColor || item.fill}`
                            : item.effectStyle === 'shadow'
                            ? `${item.shadowOffsetX ? Math.min(item.shadowOffsetX, 3) : 2}px ${item.shadowOffsetY ? Math.min(item.shadowOffsetY, 3) : 2}px 0px ${item.effectColor || '#000'}`
                            : undefined,
                          WebkitTextStroke: item.effectStyle === 'outline'
                            ? `1px ${item.effectColor || item.fill || '#fff'}`
                            : undefined,
                        }}
                      >
                        {item.text}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default TextPanel;
