
import React from 'react';
import { Palette, Check, Info, Sparkles, Type } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { THEMES } from '../../constants';

const ThemePanel: React.FC = () => {
  const { activeThemeId, applyTheme } = useStore();

  return (
    <div className="flex flex-col h-full bg-white border-r w-[320px] shrink-0 z-10 font-sans">
      <div className="p-6 border-b bg-white">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-1">
          <Palette size={14} className="text-indigo-600" />
          Brand Identity
        </h3>
        <p className="text-[10px] text-slate-300 font-bold uppercase tracking-tight">Design System Presets v3.1</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/30 custom-scrollbar">
        {THEMES.map((theme) => (
          <button
            key={theme.id}
            onClick={() => applyTheme(theme.id)}
            className={`
              w-full text-left rounded-[28px] border-2 transition-all overflow-hidden group relative bg-white
              ${activeThemeId === theme.id ? 'border-indigo-600 shadow-2xl shadow-indigo-600/10' : 'border-slate-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-slate-200/40'}
            `}
          >
            {/* Design System Preview Area */}
            <div className="p-1" style={{ backgroundColor: theme.backgroundColor }}>
              <div className="rounded-[22px] overflow-hidden min-h-[90px] relative">
                <div className="flex items-center gap-4 p-5">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl font-black shadow-lg"
                    style={{ backgroundColor: theme.id === 'default' ? '#0f172a' : theme.backgroundColor === '#111827' ? '#ffffff' : '#000000', color: theme.backgroundColor }}
                  >
                    {theme.headingFont.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="h-2.5 w-2/3 rounded-full mb-2" style={{ backgroundColor: theme.headingColor }} />
                    <div className="h-1.5 w-full rounded-full opacity-20 mb-1.5" style={{ backgroundColor: theme.bodyColor }} />
                    <div className="h-1.5 w-1/2 rounded-full opacity-20" style={{ backgroundColor: theme.bodyColor }} />
                  </div>
                  <div className="absolute top-4 right-4 w-5 h-5 rounded-full shadow-lg border-2 border-white" style={{ backgroundColor: theme.accentColor }} />
                </div>
              </div>
            </div>

            {/* Details Section */}
            <div className="p-5 bg-white flex items-center justify-between border-t border-slate-50">
              <div className="min-w-0">
                <h4 className={`text-sm font-black transition-colors ${activeThemeId === theme.id ? 'text-indigo-600' : 'text-slate-800'}`}>
                  {theme.name}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{theme.headingFont}</span>
                  <span className="text-[8px] text-slate-200">•</span>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{theme.fontFamily}</span>
                </div>
              </div>

              {activeThemeId === theme.id ? (
                <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xl shadow-indigo-600/30 ring-4 ring-indigo-50">
                  <Check size={18} strokeWidth={4} />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-2xl bg-slate-50 text-slate-200 flex items-center justify-center transition-all group-hover:bg-indigo-50 group-hover:text-indigo-400 group-hover:rotate-12">
                  <Sparkles size={16} />
                </div>
              )}
            </div>

            {/* Active Indicator Pulse */}
            {activeThemeId === theme.id && (
              <div className="absolute top-4 right-4">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping absolute" />
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 relative" />
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="p-6 border-t bg-white">
        <div className="flex items-start gap-3 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 shadow-sm">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shrink-0 shadow-sm">
            <Info size={18} />
          </div>
          <p className="text-[9px] font-bold text-indigo-900 leading-relaxed uppercase tracking-tighter">
            <b>IDENTITY PROTOCOL:</b> SWITCHING THEMES SYNCHRONIZES COLOR TOKENS. EXISTING FONTS AND FONT COLORS WILL NOT BE OVERWRITTEN.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ThemePanel;
