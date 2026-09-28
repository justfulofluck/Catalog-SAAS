import React, { useMemo } from 'react';
import {
  X,
  Crop as CropIcon,
  Image as ImageIcon,
  Square,
  RectangleHorizontal,
  RectangleVertical,
  RotateCcw,
} from 'lucide-react';
import { useStore } from '../../store/useStore';

export const CropStudioPanel: React.FC = () => {
  const {
    catalog,
    currentPageIndex,
    activeCropElementId,
    activeCropAspect,
    activeCropRotation,
    setActiveCropAspect,
    setActiveCropRotation,
    cancelCropMode,
    applyCropMode,
    uiTheme,
  } = useStore();

  const isDark = uiTheme === 'dark';

  const currentPage = catalog.pages?.[currentPageIndex];
  const activeElement = useMemo(() => {
    if (!activeCropElementId) return null;
    return (
      currentPage?.elements?.find((el) => el.id === activeCropElementId) ||
      catalog.headerElements?.find((el) => el.id === activeCropElementId) ||
      catalog.footerElements?.find((el) => el.id === activeCropElementId) ||
      null
    );
  }, [currentPage?.elements, catalog.headerElements, catalog.footerElements, activeCropElementId]);

  const aspectPresets = [
    { id: 'freeform', label: 'Freeform', icon: CropIcon },
    { id: 'original', label: 'Original', icon: ImageIcon },
    { id: '1:1', label: '1:1 Square', icon: Square },
    { id: '16:9', label: '16:9', icon: RectangleHorizontal },
    { id: '4:3', label: '4:3', icon: RectangleHorizontal },
    { id: '3:2', label: '3:2', icon: RectangleHorizontal },
    { id: '2:3', label: '2:3', icon: RectangleVertical },
    { id: '9:16', label: '9:16', icon: RectangleVertical },
  ];

  return (
    <div
      className={`w-full h-full flex flex-col font-sans select-none animate-in slide-in-from-left duration-200 transition-colors ${
        isDark ? 'bg-[#141414] text-[#EDEDED]' : 'bg-white text-slate-800'
      }`}
    >
      {/* Top Header */}
      <div
        className={`h-14 px-4 border-b flex items-center justify-between transition-colors ${
          isDark ? 'bg-[#141414] border-[#262626]' : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div className="flex items-center gap-2">
          <CropIcon size={16} className={isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'} />
          <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Crop Image
          </span>
        </div>
        <button
          onClick={cancelCropMode}
          className={`p-1.5 rounded-[4px] transition-colors ${
            isDark
              ? 'hover:bg-[#262626] text-[#888] hover:text-white'
              : 'hover:bg-slate-200 text-slate-400 hover:text-slate-700'
          }`}
          title="Close Crop"
        >
          <X size={16} />
        </button>
      </div>

      {/* Main Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        {/* Aspect Ratio Presets */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-[#888]' : 'text-slate-500'}`}>
              Aspect Ratio
            </label>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${isDark ? 'bg-[#1f1f1f] text-[#E2DCC8]/70' : 'bg-slate-100 text-slate-600'}`}>
              {activeCropAspect ? activeCropAspect.toUpperCase() : 'FREEFORM'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {aspectPresets.map((preset) => {
              const Icon = preset.icon;
              const isSelected = activeCropAspect === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => setActiveCropAspect(preset.id as any)}
                  className={`flex items-center gap-2.5 p-2.5 rounded-[6px] border transition-all text-left ${
                    isSelected
                      ? 'border-[#E2DCC8]/50 bg-[#0F3D3E] text-[#E2DCC8] ring-1 ring-[#E2DCC8]/40 shadow-sm font-bold'
                      : isDark
                      ? 'border-[#262626] bg-[#1a1a1a] text-slate-300 hover:border-[#E2DCC8]/30 hover:bg-[#222222]'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <Icon size={16} className={isSelected ? 'text-[#E2DCC8]' : isDark ? 'text-slate-400' : 'text-slate-500'} />
                  <span className="text-xs truncate">{preset.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Rotate Slider */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <label className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-[#888]' : 'text-slate-500'}`}>
              Rotation Angle
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveCropRotation(0)}
                className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-[4px] border transition-colors ${
                  isDark
                    ? 'border-[#E2DCC8]/20 bg-[#0F3D3E]/30 text-[#E2DCC8] hover:bg-[#0F3D3E]/60'
                    : 'border-slate-200 bg-slate-100 text-slate-700 hover:text-slate-900'
                }`}
                title="Reset angle to 0°"
              >
                <RotateCcw size={10} />
                <span>Reset</span>
              </button>
              <span
                className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-[4px] ${
                  isDark ? 'bg-[#1a1a1a] text-[#E2DCC8] border border-[#262626]' : 'bg-slate-100 text-slate-800'
                }`}
              >
                {Math.round(activeCropRotation || 0)}°
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <input
              type="range"
              min="-180"
              max="180"
              step="1"
              value={activeCropRotation || 0}
              onChange={(e) => setActiveCropRotation(Number(e.target.value))}
              className="w-full accent-[#10B981] h-1.5 bg-zinc-700 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div
        className={`p-3.5 border-t flex items-center gap-2.5 ${
          isDark ? 'border-[#262626] bg-[#161616]' : 'border-slate-200 bg-slate-50'
        }`}
      >
        <button
          onClick={cancelCropMode}
          className={`flex-1 py-2 px-3 rounded-[4px] font-bold text-xs border transition-all active:scale-[0.99] ${
            isDark
              ? 'border-[#333] hover:bg-[#262626] text-slate-300'
              : 'border-slate-300 hover:bg-slate-200 text-slate-700'
          }`}
        >
          Cancel
        </button>
        <button
          onClick={applyCropMode}
          className="flex-1 py-2 px-3 rounded-[4px] font-bold text-xs bg-[#0F3D3E] hover:bg-[#0F3D3E]/80 text-[#E2DCC8] border border-[#E2DCC8]/30 shadow-md transition-all active:scale-[0.99]"
        >
          Done
        </button>
      </div>
    </div>
  );
};
export default CropStudioPanel;
