import React from 'react';
import { BookOpen, Globe } from 'lucide-react';

interface ExportEmbedTabProps {
  isDark: boolean;
  embedMode: 'flipbook' | 'scroll';
  setEmbedMode: (mode: 'flipbook' | 'scroll') => void;
  embedWidth: string;
  setEmbedWidth: (w: string) => void;
  embedHeight: string;
  setEmbedHeight: (h: string) => void;
  flipbookUrl: string;
  publicShareUrl: string;
}

export const ExportEmbedTab: React.FC<ExportEmbedTabProps> = ({
  isDark,
  embedMode,
  setEmbedMode,
  embedWidth,
  setEmbedWidth,
  embedHeight,
  setEmbedHeight,
  flipbookUrl,
  publicShareUrl,
}) => {
  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      <div>
        <label className={`block text-[10px] font-black uppercase tracking-wider mb-2 ${
          isDark ? 'text-[#E2DCC8]/70' : 'text-slate-500'
        }`}>
          Embed Style
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setEmbedMode('flipbook')}
            className={`p-3 rounded-md border flex flex-col items-center gap-1.5 transition-all text-center cursor-pointer ${
              embedMode === 'flipbook'
                ? isDark
                  ? 'border-[#E2DCC8] bg-[#0F3D3E]/40 text-[#E2DCC8] ring-1 ring-[#0F3D3E]'
                  : 'border-[#0F3D3E] bg-[#0F3D3E]/10 text-[#0F3D3E] ring-1 ring-[#0F3D3E]/20'
                : isDark
                  ? 'border-[#E2DCC8]/15 bg-[#100F0F] text-[#E2DCC8]/70 hover:border-[#E2DCC8]/30'
                  : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:border-slate-300'
            }`}
          >
            <BookOpen size={18} />
            <span className="text-xs font-bold">Interactive Flipbook</span>
          </button>
          <button
            type="button"
            onClick={() => setEmbedMode('scroll')}
            className={`p-3 rounded-md border flex flex-col items-center gap-1.5 transition-all text-center cursor-pointer ${
              embedMode === 'scroll'
                ? isDark
                  ? 'border-[#E2DCC8] bg-[#0F3D3E]/40 text-[#E2DCC8] ring-1 ring-[#0F3D3E]'
                  : 'border-[#0F3D3E] bg-[#0F3D3E]/10 text-[#0F3D3E] ring-1 ring-[#0F3D3E]/20'
                : isDark
                  ? 'border-[#E2DCC8]/15 bg-[#100F0F] text-[#E2DCC8]/70 hover:border-[#E2DCC8]/30'
                  : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:border-slate-300'
            }`}
          >
            <Globe size={18} />
            <span className="text-xs font-bold">Web Page Catalog</span>
          </button>
        </div>
      </div>

      <div>
        <label className={`block text-[10px] font-black uppercase tracking-wider mb-2 ${
          isDark ? 'text-[#E2DCC8]/70' : 'text-slate-500'
        }`}>
          HTML Embed Code
        </label>
        <div className={`p-3 rounded-md border font-mono text-xs overflow-x-auto select-all ${
          isDark ? 'bg-[#100F0F] border-[#E2DCC8]/20 text-[#E2DCC8]' : 'bg-slate-50 border-slate-200 text-[#0F3D3E]'
        }`}>
          {`<iframe src="${embedMode === 'flipbook' ? flipbookUrl : publicShareUrl}" width="${embedWidth}" height="${embedHeight}" frameborder="0" allowfullscreen></iframe>`}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={`block text-[10px] font-black uppercase tracking-wider mb-1 ${
            isDark ? 'text-[#E2DCC8]/60' : 'text-slate-500'
          }`}>
            Width
          </label>
          <input
            type="text"
            value={embedWidth}
            onChange={(e) => setEmbedWidth(e.target.value)}
            className={`w-full px-3 py-1.5 text-xs rounded-[4px] border ${
              isDark ? 'bg-[#100F0F] border-[#E2DCC8]/20 text-[#F1F1F1]' : 'bg-white border-slate-200 text-slate-800'
            }`}
          />
        </div>
        <div>
          <label className={`block text-[10px] font-black uppercase tracking-wider mb-1 ${
            isDark ? 'text-[#E2DCC8]/60' : 'text-slate-500'
          }`}>
            Height
          </label>
          <input
            type="text"
            value={embedHeight}
            onChange={(e) => setEmbedHeight(e.target.value)}
            className={`w-full px-3 py-1.5 text-xs rounded-[4px] border ${
              isDark ? 'bg-[#100F0F] border-[#E2DCC8]/20 text-[#F1F1F1]' : 'bg-white border-slate-200 text-slate-800'
            }`}
          />
        </div>
      </div>
    </div>
  );
};
