import React from 'react';
import { ArrowLeft, Layout, CheckCircle2, Sparkles, X } from 'lucide-react';
import { toMm, toPx } from './constants';

interface HeaderTopBarProps {
  isDark: boolean;
  templateName: string;
  setTemplateName: (name: string) => void;
  headerHeight: number;
  setHeaderHeight: (h: number) => void;
  handleApplyToCatalog: () => void;
  appliedSuccess: boolean;
  onClose: () => void;
}

export const HeaderTopBar: React.FC<HeaderTopBarProps> = ({
  isDark,
  templateName,
  setTemplateName,
  headerHeight,
  setHeaderHeight,
  handleApplyToCatalog,
  appliedSuccess,
  onClose,
}) => {
  return (
    <div className={`h-16 px-5 border-b flex items-center justify-between shrink-0 shadow-lg transition-colors ${
      isDark ? 'bg-[#121214] border-[#262626]' : 'bg-white border-slate-200 shadow-sm'
    }`}>
      <div className="flex items-center gap-3.5">
        {/* Back to Project Button */}
        <button
          onClick={onClose}
          className={`flex items-center gap-2 px-3 py-2 rounded-[6px] border transition-all shadow-sm group ${
            isDark
              ? 'bg-[#1a1a1c] hover:bg-[#252528] text-white border-[#38383c] hover:border-[#E2DCC8]/50'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300 hover:border-[#0F3D3E]/50'
          }`}
          title="Back to Catalog Project"
        >
          <ArrowLeft size={16} className={`${isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'} group-hover:-translate-x-0.5 transition-transform`} />
          <span className={`text-xs font-bold ${isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'}`}>Back to Project</span>
        </button>

        <div className={`h-6 w-px ${isDark ? 'bg-[#28282c]' : 'bg-slate-200'}`} />

        <div className="w-10 h-10 rounded-[6px] bg-gradient-to-br from-[#0F3D3E] to-[#100F0F] border border-[#E2DCC8]/30 flex items-center justify-center text-[#E2DCC8] shadow-md shrink-0">
          <Layout size={20} />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className={`bg-transparent border-b border-transparent text-base font-black px-1 py-0.5 outline-none transition-all w-64 md:w-80 ${
                isDark
                  ? 'text-white hover:border-[#E2DCC8]/40 focus:border-[#E2DCC8] placeholder:text-gray-500'
                  : 'text-slate-900 hover:border-[#0F3D3E]/40 focus:border-[#0F3D3E] placeholder:text-slate-400'
              }`}
              placeholder="Header Theme Name..."
            />
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
              isDark
                ? 'bg-[#0F3D3E]/30 text-[#E2DCC8] border-[#E2DCC8]/20'
                : 'bg-[#0F3D3E]/10 text-[#0F3D3E] border-[#0F3D3E]/30'
            }`}>
              Header Studio
            </span>
          </div>
          <div className={`flex items-center gap-3 text-xs mt-0.5 pl-1 ${isDark ? 'text-[#888888]' : 'text-slate-500'}`}>
            <span>Width: <strong className={isDark ? 'text-slate-300' : 'text-slate-700'}>794px</strong> (Catalog Width)</span>
            <span>•</span>
            <span>Height: <strong className={isDark ? 'text-slate-300' : 'text-slate-700'}>{Math.round(headerHeight)}px</strong> ({toMm(headerHeight)}mm)</span>
          </div>
        </div>
      </div>

      {/* Action Controls in Top Bar */}
      <div className="flex items-center gap-2.5">
        {/* Height Adjuster Pill */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-[6px] border ${
          isDark ? 'bg-[#18181b] border-[#2a2a2e]' : 'bg-slate-50 border-slate-300'
        }`}>
          <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-[#888888]' : 'text-slate-500'}`}>Height</span>
          <input
            type="range"
            min={15}
            max={60}
            step={1}
            value={Math.max(15, Math.min(60, toMm(headerHeight) >= 15 ? toMm(headerHeight) : 30))}
            onChange={(e) => setHeaderHeight(toPx(Number(e.target.value)))}
            className={`w-20 h-1.5 rounded-full appearance-none cursor-pointer accent-[#0F3D3E] ${
              isDark ? 'bg-[#333333]' : 'bg-slate-300'
            }`}
          />
          <span className={`text-xs font-bold w-10 text-right font-mono ${isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'}`}>
            {Math.max(15, Math.min(60, toMm(headerHeight) >= 15 ? toMm(headerHeight) : 30))}mm
          </span>
        </div>

        {/* Apply to Catalog Button */}
        <button
          onClick={handleApplyToCatalog}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0F3D3E] to-[#144f51] hover:from-[#134d4f] hover:to-[#175b5d] border border-[#E2DCC8]/40 text-[#E2DCC8] rounded-[6px] text-xs font-black uppercase tracking-wider transition-all shadow-lg hover:shadow-cyan-950/40"
          title="Apply this designed header directly to the currently opened catalog"
        >
          {appliedSuccess ? (
            <>
              <CheckCircle2 size={15} className="text-emerald-300" />
              <span className="text-emerald-300">Applied to Catalog!</span>
            </>
          ) : (
            <>
              <Sparkles size={15} className="text-[#E2DCC8]" />
              <span>Apply to Catalog</span>
            </>
          )}
        </button>

        {/* Close Studio Button */}
        <button
          onClick={onClose}
          className={`p-2 rounded-[6px] border transition-colors ml-1 ${
            isDark
              ? 'bg-[#18181b] hover:bg-[#26262a] border-[#2a2a2e] text-[#888888] hover:text-white'
              : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-600 hover:text-slate-900'
          }`}
          title="Close Header Designer"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};
