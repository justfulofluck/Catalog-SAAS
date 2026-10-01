import React from 'react';
import { Sparkles, X, RotateCcw } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { CanvasElement } from '../../types';

const EFFECT_PRESETS: {
  id: CanvasElement['effectStyle'];
  label: string;
  previewClass?: string;
  previewStyle?: (isDark: boolean) => React.CSSProperties;
}[] = [
  { id: 'none', label: 'None' },
  {
    id: 'shadow',
    label: 'Shadow',
    previewStyle: () => ({ textShadow: '2px 2px 4px rgba(0,0,0,0.6)' }),
  },
  {
    id: 'lift',
    label: 'Lift',
    previewStyle: () => ({ textShadow: '0px 4px 8px rgba(0,0,0,0.5)' }),
  },
  {
    id: 'hollow',
    label: 'Hollow',
    previewStyle: (isDark) => ({
      WebkitTextStroke: `1.5px ${isDark ? '#ffffff' : '#000000'}`,
      color: 'transparent',
    }),
  },
  {
    id: 'outline',
    label: 'Outline',
    previewStyle: () => ({
      WebkitTextStroke: '1.5px #8B3DFF',
      color: '#ffffff',
    }),
  },
  {
    id: 'neon',
    label: 'Neon',
    previewStyle: () => ({
      color: '#ff007f',
      textShadow: '0 0 8px #ff007f, 0 0 16px #ff007f',
    }),
  },
  {
    id: 'glitch',
    label: 'Glitch',
    previewStyle: () => ({
      textShadow: '2px 2px 0 #ff0055, -2px -2px 0 #00fff9',
    }),
  },
  {
    id: 'echo',
    label: 'Echo',
    previewStyle: () => ({
      textShadow: '2px 2px 0px rgba(139,61,255,0.8), 4px 4px 0px rgba(139,61,255,0.4)',
    }),
  },
  {
    id: 'splice',
    label: 'Splice',
    previewStyle: (isDark) => ({
      WebkitTextStroke: `1px ${isDark ? '#ffffff' : '#000000'}`,
      color: 'transparent',
      textShadow: '2px 2px 0 #8B3DFF',
    }),
  },
  {
    id: 'background',
    label: 'Background',
    previewStyle: () => ({
      backgroundColor: '#8B3DFF',
      color: '#ffffff',
      padding: '2px 6px',
      borderRadius: '4px',
    }),
  },
];

const PRESET_COLORS = [
  '#000000', '#ffffff', '#8B3DFF', '#ff007f',
  '#00fff9', '#ff0055', '#eab308', '#ef4444',
  '#10b981', '#3b82f6', '#ec4899', '#64748b'
];

export const TextEffectsPanel: React.FC = () => {
  const {
    catalog,
    currentPageIndex,
    selectedElementIds,
    updateElement,
    updateHeaderElement,
    updateFooterElement,
    setEditorTab,
    uiTheme,
  } = useStore();

  const isDark = uiTheme === 'dark';

  // 1. Find currently selected text element
  const currentPage = catalog.pages[currentPageIndex];
  const selectedTextElement: CanvasElement | undefined = (
    currentPage?.elements?.find(el => el.type === 'text' && selectedElementIds.includes(el.id)) ||
    catalog.headerElements?.find(el => el.type === 'text' && selectedElementIds.includes(el.id)) ||
    catalog.footerElements?.find(el => el.type === 'text' && selectedElementIds.includes(el.id))
  );

  const handleUpdate = (updates: Partial<CanvasElement>) => {
    if (!selectedTextElement) return;
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('catalog:liveUpdateElement', {
        detail: { id: selectedTextElement.id, updates }
      }));
    }
    if (catalog.headerElements?.some(el => el.id === selectedTextElement.id)) {
      updateHeaderElement(selectedTextElement.id, updates);
    } else if (catalog.footerElements?.some(el => el.id === selectedTextElement.id)) {
      updateFooterElement(selectedTextElement.id, updates);
    } else {
      updateElement(currentPageIndex, selectedTextElement.id, updates);
    }
  };

  const activeEffect = selectedTextElement?.effectStyle || 'none';

  const handleSelectPreset = (effId: CanvasElement['effectStyle']) => {
    if (effId === 'none') {
      handleUpdate({ effectStyle: 'none' });
      return;
    }
    const defaultColors: Record<string, string> = {
      shadow: '#000000',
      lift: '#000000',
      hollow: selectedTextElement?.fill && selectedTextElement.fill !== 'transparent' ? selectedTextElement.fill : '#000000',
      outline: '#000000',
      neon: selectedTextElement?.fill && selectedTextElement.fill !== '#ffffff' && selectedTextElement.fill !== '#000000' && !selectedTextElement.fill.includes('transparent') ? selectedTextElement.fill : '#ff007f',
      glitch: '#ff0055',
      echo: '#000000',
      splice: '#000000',
      background: '#8B3DFF',
    };
    handleUpdate({
      effectStyle: effId,
      effectColor: selectedTextElement?.effectColor || defaultColors[effId || 'shadow'] || '#000000',
      effectColor2: selectedTextElement?.effectColor2 || '#00fff9',
      shadowBlur: selectedTextElement?.shadowBlur ?? (effId === 'neon' ? 15 : (effId === 'lift' ? 12 : 5)),
      shadowOpacity: selectedTextElement?.shadowOpacity ?? (effId === 'lift' ? 0.5 : (effId === 'echo' ? 0.4 : 0.6)),
      shadowOffsetX: selectedTextElement?.shadowOffsetX ?? (effId === 'echo' ? 4 : 3),
      shadowOffsetY: selectedTextElement?.shadowOffsetY ?? (effId === 'echo' ? 4 : 3),
      textStrokeWidth: selectedTextElement?.textStrokeWidth ?? 2,
      effectSpread: selectedTextElement?.effectSpread ?? 10,
      effectRoundness: selectedTextElement?.effectRoundness ?? 6,
    });
  };

  if (!selectedTextElement) {
    return (
      <div className={`flex flex-col h-full select-none ${isDark ? 'bg-[#141416] text-[#ededed]' : 'bg-white text-slate-800'}`}>
        <div className={`p-3.5 border-b flex items-center justify-between ${isDark ? 'border-[#262626] bg-[#141414]' : 'border-slate-200 bg-slate-50'}`}>
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#8B3DFF]" />
            <span className="text-xs font-black uppercase tracking-wider">Effects</span>
          </div>
          <button
            onClick={() => setEditorTab('text')}
            className={`p-1 rounded-md transition-colors ${isDark ? 'hover:bg-white/10 text-zinc-400' : 'hover:bg-slate-200 text-slate-500'}`}
          >
            <X size={15} />
          </button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-zinc-400 gap-3">
          <Sparkles size={32} className="text-zinc-600 animate-pulse" />
          <p className="text-xs font-medium max-w-[220px]">
            Select a text box on the canvas to view and customize its effects.
          </p>
          <button
            onClick={() => setEditorTab('text')}
            className="text-xs font-bold text-[#8B3DFF] hover:underline"
          >
            &larr; Back to Text
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full select-none ${isDark ? 'bg-[#141416] text-[#ededed]' : 'bg-white text-slate-800'}`}>
      {/* Header */}
      <div className={`p-3.5 border-b flex items-center justify-between ${isDark ? 'border-[#262626] bg-[#141414]' : 'border-slate-200 bg-slate-50'}`}>
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-[#8B3DFF]" />
          <span className="text-xs font-black uppercase tracking-wider">Text Effects</span>
        </div>
        <div className="flex items-center gap-2">
          {activeEffect !== 'none' && (
            <button
              onClick={() => handleUpdate({ effectStyle: 'none' })}
              className="text-[11px] font-bold text-zinc-400 hover:text-red-400 flex items-center gap-1 transition-colors"
              title="Reset effect to none"
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          )}
          <button
            onClick={() => setEditorTab('text')}
            className={`p-1 rounded-md transition-colors ${isDark ? 'hover:bg-white/10 text-zinc-400' : 'hover:bg-slate-200 text-slate-500'}`}
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        {/* Style Section */}
        <div>
          <div className="text-[11px] font-black uppercase tracking-wider text-zinc-400 mb-3">
            Style
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {EFFECT_PRESETS.map((preset) => {
              const isSelected = activeEffect === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer relative group ${
                    isSelected
                      ? 'bg-[#8B3DFF]/15 border-[#8B3DFF] ring-2 ring-[#8B3DFF]/50 shadow-md'
                      : isDark
                      ? 'bg-[#1c1c1f] border-white/10 hover:border-white/30 hover:bg-[#232328]'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <div className="h-10 flex items-center justify-center mb-1.5 font-bold text-base select-none">
                    <span style={preset.previewStyle ? preset.previewStyle(isDark) : undefined}>
                      Ag
                    </span>
                  </div>
                  <span className={`text-[11px] font-bold ${isSelected ? 'text-[#8B3DFF]' : isDark ? 'text-zinc-200' : 'text-slate-700'}`}>
                    {preset.label}
                  </span>
                  {isSelected && (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#8B3DFF]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Contextual Parameters (When effect is not None) */}
        {activeEffect !== 'none' && (
          <div className={`pt-4 border-t space-y-4 ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400">
                {activeEffect} Settings
              </span>
            </div>

            {/* Offset Slider */}
            {['shadow', 'glitch', 'echo', 'splice'].includes(activeEffect) && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className={isDark ? 'text-zinc-300' : 'text-slate-700'}>Offset</span>
                  <span className="font-mono text-zinc-400">{selectedTextElement.shadowOffsetX ?? 3}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={selectedTextElement.shadowOffsetX ?? 3}
                  onInput={(e) => {
                    const val = parseFloat((e.target as HTMLInputElement).value);
                    handleUpdate({ shadowOffsetX: val, shadowOffsetY: val });
                  }}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    handleUpdate({ shadowOffsetX: val, shadowOffsetY: val });
                  }}
                  className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-[#8B3DFF]"
                />
              </div>
            )}

            {/* Blur / Glow Intensity Slider */}
            {['shadow', 'lift', 'neon'].includes(activeEffect) && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className={isDark ? 'text-zinc-300' : 'text-slate-700'}>
                    {activeEffect === 'neon' ? 'Glow Intensity' : 'Blur'}
                  </span>
                  <span className="font-mono text-zinc-400">
                    {selectedTextElement.shadowBlur ?? (activeEffect === 'neon' ? 15 : 5)}px
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={selectedTextElement.shadowBlur ?? (activeEffect === 'neon' ? 15 : 5)}
                  onInput={(e) => handleUpdate({ shadowBlur: parseFloat((e.target as HTMLInputElement).value) })}
                  onChange={(e) => handleUpdate({ shadowBlur: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-[#8B3DFF]"
                />
              </div>
            )}

            {/* Thickness Slider */}
            {['hollow', 'outline', 'splice'].includes(activeEffect) && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className={isDark ? 'text-zinc-300' : 'text-slate-700'}>Thickness</span>
                  <span className="font-mono text-zinc-400">{selectedTextElement.textStrokeWidth ?? 2}px</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="0.5"
                  value={selectedTextElement.textStrokeWidth ?? 2}
                  onInput={(e) => handleUpdate({ textStrokeWidth: parseFloat((e.target as HTMLInputElement).value) })}
                  onChange={(e) => handleUpdate({ textStrokeWidth: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-[#8B3DFF]"
                />
              </div>
            )}

            {/* Transparency / Opacity Slider */}
            {['shadow', 'lift', 'echo', 'background'].includes(activeEffect) && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className={isDark ? 'text-zinc-300' : 'text-slate-700'}>Transparency</span>
                  <span className="font-mono text-zinc-400">
                    {Math.round((selectedTextElement.shadowOpacity ?? 0.6) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="1"
                  step="0.05"
                  value={selectedTextElement.shadowOpacity ?? 0.6}
                  onInput={(e) => handleUpdate({ shadowOpacity: parseFloat((e.target as HTMLInputElement).value) })}
                  onChange={(e) => handleUpdate({ shadowOpacity: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-[#8B3DFF]"
                />
              </div>
            )}

            {/* Roundness & Spread for Background */}
            {activeEffect === 'background' && (
              <>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className={isDark ? 'text-zinc-300' : 'text-slate-700'}>Roundness</span>
                    <span className="font-mono text-zinc-400">{selectedTextElement.effectRoundness ?? 6}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={selectedTextElement.effectRoundness ?? 6}
                    onInput={(e) => handleUpdate({ effectRoundness: parseFloat((e.target as HTMLInputElement).value) })}
                    onChange={(e) => handleUpdate({ effectRoundness: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-[#8B3DFF]"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className={isDark ? 'text-zinc-300' : 'text-slate-700'}>Spread</span>
                    <span className="font-mono text-zinc-400">{selectedTextElement.effectSpread ?? 10}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={selectedTextElement.effectSpread ?? 10}
                    onInput={(e) => handleUpdate({ effectSpread: parseFloat((e.target as HTMLInputElement).value) })}
                    onChange={(e) => handleUpdate({ effectSpread: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-[#8B3DFF]"
                  />
                </div>
              </>
            )}

            {/* Primary Effect Color Picker */}
            {activeEffect !== 'lift' && (
              <div className="space-y-2 pt-2">
                <div className="text-xs font-semibold">
                  <span className={isDark ? 'text-zinc-300' : 'text-slate-700'}>
                    {activeEffect === 'background'
                      ? 'Background Color'
                      : activeEffect === 'hollow' || activeEffect === 'outline'
                      ? 'Outline Color'
                      : 'Effect Color'}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <input
                    type="color"
                    value={selectedTextElement.effectColor || '#000000'}
                    onChange={(e) => handleUpdate({ effectColor: e.target.value })}
                    className="w-8 h-8 rounded-lg border border-white/20 cursor-pointer bg-transparent p-0 shrink-0"
                  />
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => handleUpdate({ effectColor: c })}
                        className={`w-6 h-6 rounded-full border transition-all ${
                          selectedTextElement.effectColor === c
                            ? 'scale-110 border-white ring-2 ring-[#8B3DFF]'
                            : 'border-black/20 hover:scale-105'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Secondary Color for Glitch & Splice */}
            {['glitch', 'splice'].includes(activeEffect) && (
              <div className="space-y-2 pt-2">
                <div className="text-xs font-semibold">
                  <span className={isDark ? 'text-zinc-300' : 'text-slate-700'}>Secondary Color</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <input
                    type="color"
                    value={selectedTextElement.effectColor2 || '#00fff9'}
                    onChange={(e) => handleUpdate({ effectColor2: e.target.value })}
                    className="w-8 h-8 rounded-lg border border-white/20 cursor-pointer bg-transparent p-0 shrink-0"
                  />
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {['#00fff9', '#ff0055', '#8B3DFF', '#eab308', '#ffffff', '#000000'].map((c) => (
                      <button
                        key={c}
                        onClick={() => handleUpdate({ effectColor2: c })}
                        className={`w-6 h-6 rounded-full border transition-all ${
                          selectedTextElement.effectColor2 === c
                            ? 'scale-110 border-white ring-2 ring-[#8B3DFF]'
                            : 'border-black/20 hover:scale-105'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
