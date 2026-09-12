import React from 'react';
import {
  Layout, Sparkles, Settings
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { PX_PER_MM } from '../../constants';

const HeaderFooterPanel: React.FC = () => {
  const {
    catalog,
    updateProjectSettings,
    setIsHeaderDesignerOpen,
    setIsFooterDesignerOpen,
    uiTheme
  } = useStore();

  const isDark = uiTheme === 'dark';

  const toMm = (px: number) => Math.round(px / PX_PER_MM);
  const toPx = (mm: number) => Math.round(mm * PX_PER_MM);

  return (
    <div className={`flex flex-col h-full w-full font-sans overflow-hidden select-none transition-colors ${
      isDark ? 'bg-[#161616] text-white' : 'bg-white text-slate-800'
    }`}>
      {/* Panel Top Header */}
      <div className={`h-14 px-4 border-b flex items-center justify-between shrink-0 transition-colors ${
        isDark ? 'border-[#262626] bg-[#161616]' : 'border-slate-100 bg-white'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-[4px] bg-[#0F3D3E] flex items-center justify-center text-white shadow-sm">
            <Layout size={14} />
          </div>
          <div>
            <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Header & Footer
            </h3>
            <p className={`text-[9px] font-medium ${isDark ? 'text-[#888888]' : 'text-slate-500'}`}>
              Catalog Layout Global Elements
            </p>
          </div>
        </div>
      </div>

      {/* Panel Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Custom Header Studio Unified Card */}
        <div className={`p-3.5 rounded-[6px] border transition-all ${
          isDark
            ? 'bg-gradient-to-br from-[#0F3D3E]/30 via-[#161616] to-[#121212] border-[#0F3D3E]/40'
            : 'bg-gradient-to-br from-[#0F3D3E]/10 via-slate-50 to-white border-[#0F3D3E]/30'
        }`}>
          {/* Header Card Top: Title + Enable Checkbox */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-[#E2DCC8]" />
              <h4 className={`text-xs font-black uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Custom Header Studio
              </h4>
            </div>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <span className={`text-[11px] font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Enable</span>
              <input
                type="checkbox"
                checked={catalog.hasHeader}
                onChange={(e) => updateProjectSettings({ hasHeader: e.target.checked })}
                className="w-4 h-4 rounded border-[#333] accent-[#0F3D3E] cursor-pointer"
              />
            </label>
          </div>

          <p className={`text-[10px] leading-relaxed mb-3 ${isDark ? 'text-[#888888]' : 'text-slate-500'}`}>
            Design reusable master header themes with drag & drop. Only the header section is edited!
          </p>

          <button
            onClick={() => setIsHeaderDesignerOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-gradient-to-r from-[#0F3D3E] to-[#144f51] hover:from-[#134d4f] hover:to-[#175b5d] text-[#E2DCC8] border border-[#E2DCC8]/30 rounded-[4px] text-xs font-bold shadow-md hover:shadow-cyan-950/40 transition-all"
          >
            <Layout size={13} />
            <span>Launch Header Designer</span>
          </button>
        </div>

        {/* Custom Footer Studio Unified Card */}
        <div className={`p-3.5 rounded-[6px] border transition-all ${
          isDark
            ? 'bg-gradient-to-br from-[#0F3D3E]/30 via-[#161616] to-[#121212] border-[#0F3D3E]/40'
            : 'bg-gradient-to-br from-[#0F3D3E]/10 via-slate-50 to-white border-[#0F3D3E]/30'
        }`}>
          {/* Footer Card Top: Title + Enable Checkbox */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-[#E2DCC8]" />
              <h4 className={`text-xs font-black uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Custom Footer Studio
              </h4>
            </div>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <span className={`text-[11px] font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Enable</span>
              <input
                type="checkbox"
                checked={catalog.hasFooter}
                onChange={(e) => updateProjectSettings({ hasFooter: e.target.checked })}
                className="w-4 h-4 rounded border-[#333] accent-[#0F3D3E] cursor-pointer"
              />
            </label>
          </div>

          <p className={`text-[10px] leading-relaxed mb-3 ${isDark ? 'text-[#888888]' : 'text-slate-500'}`}>
            Design reusable master footer themes with drag & drop. Only the footer section is edited!
          </p>

          <button
            onClick={() => setIsFooterDesignerOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-gradient-to-r from-[#0F3D3E] to-[#144f51] hover:from-[#134d4f] hover:to-[#175b5d] text-[#E2DCC8] border border-[#E2DCC8]/30 rounded-[4px] text-xs font-bold shadow-md hover:shadow-cyan-950/40 transition-all"
          >
            <Layout size={13} />
            <span>Launch Footer Designer</span>
          </button>
        </div>

        {/* Page Margins Card (Transferred from Page Settings) */}
        <div className={`p-3.5 rounded-[4px] border transition-all ${
          isDark ? 'border-[#262626] bg-[#1a1a1a]' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-[4px] ${
              isDark ? 'bg-[#222222]' : 'bg-slate-200/60'
            }`}>
              <Settings size={13} className={isDark ? "text-[#E2DCC8]" : "text-[#0F3D3E]"} />
              <span className={`text-[10px] font-black uppercase tracking-widest ${
                isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'
              }`}>Page Margins</span>
            </div>

            {/* Canva-style Show Margin Guides Toggle */}
            <label className="flex items-center gap-2 cursor-pointer group" title="Show/Hide Canva-style dashed margin guide lines on canvas">
              <span className={`text-[10px] font-bold ${isDark ? 'text-white/70 group-hover:text-white' : 'text-slate-600 group-hover:text-slate-900'}`}>
                Show Guides
              </span>
              <input
                type="checkbox"
                checked={catalog.showMargins !== false}
                onChange={(e) => updateProjectSettings({ showMargins: e.target.checked })}
                className="w-3.5 h-3.5 rounded border-[#333] accent-[#0F3D3E] cursor-pointer"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {[
              { label: 'Top', val: catalog.marginTop || 0, key: 'marginTop' },
              { label: 'Bottom', val: catalog.marginBottom || 0, key: 'marginBottom' },
              { label: 'Left', val: catalog.marginLeft || 0, key: 'marginLeft' },
              { label: 'Right', val: catalog.marginRight || 0, key: 'marginRight' },
            ].map((m) => (
              <div key={m.label} className="space-y-1">
                <span className="text-[9px] font-bold text-[#888888] uppercase block">{m.label}</span>
                <div className={`flex items-center border rounded-[4px] px-2.5 py-1.5 transition-all focus-within:border-[#0F3D3E] ${
                  isDark ? 'border-[#262626] bg-[#121212]' : 'border-slate-300 bg-white'
                }`}>
                  <input
                    type="number"
                    value={toMm(m.val)}
                    onChange={(e) => {
                      const rawVal = e.target.value;
                      const val = parseInt(rawVal);
                      if (!isNaN(val)) updateProjectSettings({ [m.key]: toPx(val) });
                      else if (rawVal === '') updateProjectSettings({ [m.key]: 0 });
                    }}
                    className={`w-full bg-transparent outline-none text-xs font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                      isDark ? 'text-[#F1F1F1]' : 'text-slate-900'
                    }`}
                  />
                  <span className="text-[9px] font-bold text-[#888888] ml-1">mm</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderFooterPanel;
