import React, { useState, useMemo, useRef } from 'react';
import {
  X,
  Pipette,
  Plus,
  Sparkles,
  Check,
  Search,
  RotateCcw,
  Palette,
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  Sliders
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import AdvancedColorPicker from '../Properties/AdvancedColorPicker';

// Pre-defined Solid Palette (organized by shades)
const DEFAULT_SOLID_COLORS = [
  // Monochromes / Neutrals
  '#000000', '#1c1917', '#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1', '#f1f5f9', '#ffffff',
  // Deep & Rich
  '#0F3D3E', '#14532d', '#1e3a8a', '#312e81', '#4c1d95', '#581c87', '#701a75', '#831843', '#7f1d1d',
  // Vivid
  '#dc2626', '#ea580c', '#d97706', '#ca8a04', '#16a34a', '#059669', '#0284c7', '#2563eb', '#7c3aed',
  // Bright / Vibrant
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#22c55e', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6',
  // Pastels / Soft
  '#fecaca', '#ffedd5', '#fef3c7', '#fef9c3', '#dcfce7', '#d1fae5', '#cffafe', '#dbeafe', '#ede9fe',
];

// Pre-defined Modern Gradients
const DEFAULT_GRADIENTS = [
  'linear-gradient(135deg, #0F3D3E, #E2DCC8)',
  'linear-gradient(135deg, #100F0F, #0F3D3E)',
  'linear-gradient(135deg, #18181b, #27272a)',
  'linear-gradient(135deg, #0f172a, #1e293b)',
  'linear-gradient(135deg, #1e3a8a, #3b82f6)',
  'linear-gradient(135deg, #065f46, #10b981)',
  'linear-gradient(135deg, #9a3412, #f97316)',
  'linear-gradient(135deg, #831843, #ec4899)',
  'linear-gradient(135deg, #581c87, #a855f7)',
  'linear-gradient(135deg, #E2DCC8, #ffffff)',
  'linear-gradient(to right, #000000, #434343)',
  'linear-gradient(to right, #243949, #517fa4)',
];


export const ColorPanel: React.FC = () => {
  const {
    catalog,
    currentPageIndex,
    selectedElementIds,
    colorPickerTarget,
    openColorPicker,
    closeColorPicker,
    setPageBackground,
    setPageBackgroundImage,
    setPageBackgroundOpacity,
    updateAllPageBackgrounds,
    updateElement,
    pushHistory,
    uiTheme
  } = useStore();

  const isDark = uiTheme === 'dark';
  const [searchQuery, setSearchQuery] = useState('');
  const [isCustomPickerOpen, setIsCustomPickerOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentPage = catalog.pages[currentPageIndex];

  const handleBackgroundImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setPageBackgroundImage(currentPageIndex, dataUrl, currentPage?.backgroundOpacity ?? 1);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemoveBackgroundImage = () => {
    setPageBackgroundImage(currentPageIndex, null);
  };

  // Determine active target type and current color
  const targetType = colorPickerTarget?.type || 'background';
  const targetTitle = colorPickerTarget?.title || (
    targetType === 'background'
      ? 'Page Background'
      : targetType === 'text'
      ? 'Text Color'
      : targetType === 'stroke'
      ? 'Border Stroke'
      : 'Fill Color'
  );

  const currentColor = useMemo(() => {
    if (colorPickerTarget?.color) return colorPickerTarget.color;
    if (targetType === 'background') {
      return currentPage?.backgroundColor || '#ffffff';
    }
    if (selectedElementIds.length > 0 && currentPage) {
      const el = currentPage.elements.find(e => selectedElementIds.includes(e.id));
      if (el) {
        if (targetType === 'stroke') return el.stroke || 'transparent';
        if (targetType === 'text') return el.fill || '#000000';
        return el.fill || '#cbd5e1';
      }
    }
    return '#0F3D3E';
  }, [colorPickerTarget, targetType, currentPage, selectedElementIds]);

  // Extract all unique colors in this design (Document Colors)
  const colorsInDesign = useMemo(() => {
    const set = new Set<string>();
    catalog.pages.forEach(p => {
      if (p.backgroundColor && p.backgroundColor !== 'transparent') {
        set.add(p.backgroundColor);
      }
      p.elements.forEach(el => {
        if (el.fill && el.fill !== 'transparent') set.add(el.fill);
        if (el.stroke && el.stroke !== 'transparent') set.add(el.stroke);
        if (el.tableData?.headerFill) set.add(el.tableData.headerFill);
        if (el.tableData?.headerColor) set.add(el.tableData.headerColor);
      });
    });
    // Return sorted unique colors
    return Array.from(set).filter(Boolean);
  }, [catalog.pages]);

  // Apply color to target
  const handleApplyColor = (color: string) => {
    if (colorPickerTarget?.onChange) {
      colorPickerTarget.onChange(color);
      openColorPicker({ ...colorPickerTarget, color });
      return;
    }

    if (targetType === 'background') {
      setPageBackground(currentPageIndex, color);
      openColorPicker({ ...colorPickerTarget, type: 'background', color });
    } else if (selectedElementIds.length > 0) {
      pushHistory();
      selectedElementIds.forEach(id => {
        if (targetType === 'stroke') {
          if (color === 'transparent') {
            updateElement(currentPageIndex, id, { stroke: 'transparent', strokeWidth: 0 });
          } else {
            const el = currentPage?.elements?.find(e => e.id === id);
            const currentWidth = (el?.strokeWidth && el.strokeWidth > 0) ? el.strokeWidth : 2;
            updateElement(currentPageIndex, id, { stroke: color, strokeWidth: currentWidth });
          }
        } else {
          updateElement(currentPageIndex, id, { fill: color });
        }
      });
      openColorPicker({ ...colorPickerTarget, type: targetType, color });
    }
  };

  // Eyedropper API handler
  const handleEyedropper = async () => {
    if (typeof window !== 'undefined' && 'EyeDropper' in window) {
      try {
        const eyeDropper = new (window as any).EyeDropper();
        const result = await eyeDropper.open();
        if (result?.sRGBHex) {
          handleApplyColor(result.sRGBHex.toUpperCase());
        }
      } catch (err) {
        // User canceled or failed
      }
    } else {
      alert('Eyedropper tool is supported on Chrome and Edge browsers.');
    }
  };

  // Search filter
  const filteredSolids = useMemo(() => {
    if (!searchQuery.trim()) return DEFAULT_SOLID_COLORS;
    const q = searchQuery.toLowerCase().trim();
    return DEFAULT_SOLID_COLORS.filter(c => c.toLowerCase().includes(q));
  }, [searchQuery]);

  const filteredGradients = useMemo(() => {
    if (!searchQuery.trim()) return DEFAULT_GRADIENTS;
    const q = searchQuery.toLowerCase().trim();
    return DEFAULT_GRADIENTS.filter(c => c.toLowerCase().includes(q));
  }, [searchQuery]);

  const isGradient = currentColor?.includes('gradient');

  return (
    <div className={`w-full h-full flex flex-col font-sans transition-colors select-none ${
      isDark ? 'bg-[#161616] text-[#F1F1F1]' : 'bg-white text-slate-800'
    }`}>
      {/* 1. Header */}
      <div className={`px-5 py-3.5 border-b flex items-center justify-between shrink-0 ${
        isDark ? 'border-[#262626] bg-[#141414]' : 'border-slate-200 bg-slate-50'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-[4px] bg-[#0F3D3E] flex items-center justify-center text-[#F1F1F1] shadow-sm border border-[#E2DCC8]/20">
            <Palette size={14} />
          </div>
          <div>
            <h3 className={`text-xs font-black uppercase tracking-wider ${
              isDark ? 'text-[#F1F1F1]' : 'text-slate-900'
            }`}>
              Color Studio
            </h3>
            <span className="text-[9px] font-semibold text-[#888888] uppercase tracking-wide">
              {targetTitle}
            </span>
          </div>
        </div>

        <button
          onClick={closeColorPicker}
          className={`p-1.5 rounded-[4px] transition-colors ${
            isDark ? 'text-[#888888] hover:text-[#F1F1F1] hover:bg-[#222]' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
          }`}
          title="Close Color Studio"
        >
          <X size={16} />
        </button>
      </div>

      {/* 2. Scrollable Body */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
        {/* Search & Custom Hex Input */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder='Try "#0F3D3E", "blue", or paste hex'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                let val = searchQuery.trim();
                if (!val.startsWith('#') && /^[0-9a-fA-F]{3,8}$/.test(val)) {
                  val = `#${val}`;
                }
                if (/^#[0-9a-fA-F]{3,8}$/.test(val)) {
                  handleApplyColor(val.toUpperCase());
                  setSearchQuery('');
                }
              }
            }}
            className={`w-full pl-9 pr-3 py-2 text-xs rounded-[4px] border outline-none transition-all ${
              isDark
                ? 'bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder-[#666] focus:border-[#0F3D3E]'
                : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#0F3D3E]'
            }`}
          />
        </div>

        {/* Current Active Color & Custom Color Picker Action */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#888888]">
              Active Selection
            </span>
            <span className="text-[10px] font-mono font-bold uppercase text-[#E2DCC8]">
              {isGradient ? 'Gradient' : currentColor}
            </span>
          </div>

          <div className="flex items-center gap-2 min-w-0 w-full">
            {/* Rainbow + Custom Picker Swatch */}
            <button
              onClick={() => setIsCustomPickerOpen(!isCustomPickerOpen)}
              className="relative w-9 h-9 rounded-[6px] p-0.5 border shadow-sm transition-transform hover:scale-105 shrink-0 flex items-center justify-center border-[#333] hover:border-white group"
              style={{
                background: 'conic-gradient(from 180deg at 50% 50%, #FF0000 0deg, #FFFF00 60deg, #00FF00 120deg, #00FFFF 180deg, #0000FF 240deg, #FF00FF 300deg, #FF0000 360deg)'
              }}
              title="Add custom color"
            >
              <div className="w-full h-full rounded-[4px] bg-[#141414]/70 flex items-center justify-center group-hover:bg-[#141414]/50 transition-colors">
                <Plus size={16} className="text-white" />
              </div>
            </button>

            {/* No Color / Transparent Button */}
            <button
              onClick={() => handleApplyColor('transparent')}
              className={`w-9 h-9 rounded-[6px] border flex items-center justify-center shadow-sm transition-all hover:scale-105 shrink-0 overflow-hidden relative ${
                currentColor === 'transparent' ? 'ring-2 ring-[#0F3D3E] border-white' : (isDark ? 'bg-[#222222] border-[#333] hover:border-[#0F3D3E]' : 'bg-slate-100 border-slate-200 hover:border-[#0F3D3E]')
              }`}
              title="No Color / Transparent"
            >
              <div className="w-full h-full bg-white relative flex items-center justify-center">
                <div className="w-full h-[2px] bg-red-500 -rotate-45" />
              </div>
            </button>

            {/* Eyedropper Pipette */}
            <button
              onClick={handleEyedropper}
              className={`w-9 h-9 rounded-[6px] border flex items-center justify-center shadow-sm transition-all hover:scale-105 shrink-0 ${
                isDark ? 'bg-[#222222] border-[#333] text-[#E2DCC8] hover:border-[#0F3D3E]' : 'bg-slate-100 border-slate-200 text-slate-700 hover:border-[#0F3D3E]'
              }`}
              title="Pick color from screen (Eyedropper)"
            >
              <Pipette size={16} />
            </button>

            {/* Current Color Indicator Swatch - Strict min-w-0 and overflow-hidden to prevent boundary overflow */}
            <div
              className="flex-1 min-w-0 h-9 rounded-[6px] border px-2.5 flex items-center gap-2 shadow-inner border-[#333] bg-[#1a1a1a] overflow-hidden"
            >
              <div
                className="w-5 h-5 rounded-[4px] border border-white/20 shadow-sm shrink-0 overflow-hidden relative"
                style={{ background: currentColor === 'transparent' ? '#ffffff' : currentColor }}
              >
                {currentColor === 'transparent' && (
                  <div className="w-full h-full relative flex items-center justify-center">
                    <div className="w-full h-[1.5px] bg-red-500 -rotate-45" />
                  </div>
                )}
              </div>
              <span className="text-[10px] font-mono font-bold uppercase truncate min-w-0 flex-1 text-slate-200" title={currentColor}>
                {currentColor === 'transparent' ? 'Transparent' : currentColor}
              </span>
            </div>
          </div>

          {/* Embedded Custom Slider / Hue Picker */}
          {isCustomPickerOpen && (
            <div className={`p-3.5 border rounded-[6px] shadow-2xl animate-in fade-in zoom-in-95 duration-150 ${
              isDark ? 'bg-[#1c1c1f] border-[#333]' : 'bg-white border-slate-200'
            }`}>
              <AdvancedColorPicker
                color={currentColor}
                onChange={handleApplyColor}
              />
            </div>
          )}
        </section>

        {/* Canva-style Background Image Upload & Management Section */}
        {targetType === 'background' && (
          <section className="space-y-2.5 pt-3 border-t border-[#262626]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#888888] flex items-center gap-1.5">
                <ImageIcon size={12} className="text-[#0F3D3E] dark:text-[#E2DCC8]" />
                Background Image
              </span>
              {currentPage?.backgroundImage && (
                <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-1.5 py-0.5 rounded">
                  Active
                </span>
              )}
            </div>

            {/* Hidden file input for uploading page background image */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="hidden"
              onChange={handleBackgroundImageUpload}
            />

            {currentPage?.backgroundImage ? (
              <div className="space-y-3 p-3 rounded-[6px] border bg-[#18181a] border-[#2c2c30]">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-16 rounded-[4px] border border-[#3a3a40] overflow-hidden bg-black shrink-0 relative group shadow-sm cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                    title="Click to replace background image"
                  >
                    <img
                      src={currentPage.backgroundImage}
                      alt="Page background"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <UploadCloud size={14} className="text-white" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="text-[11px] font-bold text-white truncate">
                      Canva Background Image
                    </div>
                    <p className="text-[9px] text-[#888] leading-tight">
                      Full-bleed image covers canvas behind all page elements.
                    </p>
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2 py-1 text-[9px] font-bold rounded bg-[#252528] hover:bg-[#303035] text-[#E2DCC8] border border-[#444] transition-all flex items-center gap-1"
                        title="Replace background image"
                      >
                        <UploadCloud size={10} />
                        Replace
                      </button>
                      <button
                        onClick={handleRemoveBackgroundImage}
                        className="px-2 py-1 text-[9px] font-bold rounded bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 transition-all flex items-center gap-1"
                        title="Remove background image"
                      >
                        <Trash2 size={10} />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>

                {/* Opacity slider for background image */}
                <div className="space-y-1 pt-2 border-t border-[#26262a]">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-[#888] font-semibold flex items-center gap-1">
                      <Sliders size={10} /> Image Opacity
                    </span>
                    <span className="font-mono font-bold text-[#E2DCC8]">
                      {Math.round((currentPage.backgroundOpacity ?? 1) * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={Math.round((currentPage.backgroundOpacity ?? 1) * 100)}
                    onChange={(e) => {
                      const val = Number(e.target.value) / 100;
                      setPageBackgroundOpacity(currentPageIndex, val);
                    }}
                    className="w-full h-1.5 bg-[#2a2a2e] rounded-lg appearance-none cursor-pointer accent-[#0F3D3E]"
                  />
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`p-3.5 rounded-[6px] border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center gap-1 text-center group ${
                  isDark
                    ? 'border-[#333] hover:border-[#0F3D3E] hover:bg-[#181818] bg-[#141414]'
                    : 'border-slate-300 hover:border-[#0F3D3E] hover:bg-slate-50 bg-slate-50/50'
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-[#0F3D3E]/20 text-[#E2DCC8] border border-[#0F3D3E]/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UploadCloud size={14} />
                </div>
                <div className="text-[11px] font-bold text-slate-200 group-hover:text-white transition-colors">
                  Upload Background Image
                </div>
                <p className="text-[9px] text-[#888] leading-tight">
                  Click to choose PNG, JPG, or WebP (covers page like Canva)
                </p>
              </div>
            )}
          </section>
        )}

        {/* Colors in this design (Document Colors) */}
        {colorsInDesign.length > 0 && (
          <section className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#888888]">
                Colors in this design
              </span>
              <span className="text-[9px] font-bold text-[#888888]">
                {colorsInDesign.length} colors
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {colorsInDesign.map((c, idx) => {
                const isSelected = currentColor.toLowerCase() === c.toLowerCase();
                return (
                  <button
                    key={`${c}-${idx}`}
                    onClick={() => handleApplyColor(c)}
                    className={`w-7 h-7 rounded-[4px] border shadow-sm transition-all hover:scale-110 relative flex items-center justify-center ${
                      isSelected
                        ? 'ring-2 ring-[#0F3D3E] ring-offset-2 ring-offset-[#161616] border-white'
                        : 'border-[#333333] hover:border-white'
                    }`}
                    style={{ background: c }}
                    title={c}
                  >
                    {isSelected && (
                      <Check size={12} className={c.toLowerCase() === '#ffffff' ? 'text-black' : 'text-white'} strokeWidth={3} />
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        )}


        {/* Default Solid Colors Grid */}
        <section className="space-y-2.5">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#888888] block">
            Default Solid Colors
          </span>

          <div className="grid grid-cols-9 gap-1.5">
            {filteredSolids.map((c, idx) => {
              const isSelected = currentColor.toLowerCase() === c.toLowerCase();
              return (
                <button
                  key={`solid-${c}-${idx}`}
                  onClick={() => handleApplyColor(c)}
                  className={`w-6 h-6 rounded-[3px] border shadow-sm transition-all hover:scale-110 flex items-center justify-center relative ${
                    isSelected
                      ? 'ring-2 ring-[#0F3D3E] ring-offset-1 ring-offset-[#161616] border-white'
                      : 'border-[#2d2d2d] hover:border-white'
                  }`}
                  style={{ background: c }}
                  title={c}
                >
                  {isSelected && (
                    <Check size={10} className={c.toLowerCase() === '#ffffff' || c.startsWith('#fef') ? 'text-black' : 'text-white'} strokeWidth={3} />
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Default Modern Gradients */}
        <section className="space-y-2.5">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#888888] block">
            Modern Gradients
          </span>

          <div className="grid grid-cols-4 gap-2">
            {filteredGradients.map((g, idx) => {
              const isSelected = currentColor === g;
              return (
                <button
                  key={`grad-${idx}`}
                  onClick={() => handleApplyColor(g)}
                  className={`h-8 rounded-[4px] border shadow-sm transition-all hover:scale-105 relative flex items-center justify-center ${
                    isSelected
                      ? 'ring-2 ring-[#0F3D3E] ring-offset-2 ring-offset-[#161616] border-white'
                      : 'border-[#333333] hover:border-white'
                  }`}
                  style={{ background: g }}
                  title={g}
                >
                  {isSelected && (
                    <Check size={12} className="text-white drop-shadow-md" strokeWidth={3} />
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* If targeting Background: Show Apply to All Pages & Clear actions */}
        {targetType === 'background' && (
          <div className="space-y-2 pt-2 border-t border-[#262626]">
            <button
              onClick={() => updateAllPageBackgrounds(currentColor)}
              className="w-full py-2.5 px-4 rounded-[4px] bg-[#0F3D3E] hover:bg-[#155455] text-white border border-[#E2DCC8]/30 font-bold text-[10px] uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Sparkles size={13} />
              <span>Apply to All Pages</span>
            </button>

            <button
              onClick={() => handleApplyColor('#ffffff')}
              className={`w-full py-2 px-3 rounded-[4px] border text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                isDark
                  ? 'border-[#262626] hover:bg-[#222] text-[#888] hover:text-white'
                  : 'border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              <RotateCcw size={12} />
              <span>Reset Page to White</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ColorPanel;
