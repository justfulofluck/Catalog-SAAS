import React from 'react';
import { BookOpen, Sliders, SlidersHorizontal, Check, Eye, Package } from 'lucide-react';
import { CatalogSetupState } from './useCatalogSetup';
import { TemplateElementsRenderer } from './TemplateElementsRenderer';

export const Phase4Framing: React.FC<CatalogSetupState> = ({
  activeFramingTab,
  setActiveFramingTab,
  includeCover,
  setIncludeCover,
  coverTemplateId,
  setCoverTemplateId,
  headerMode,
  setHeaderMode,
  headerTemplateId,
  setHeaderTemplateId,
  footerMode,
  setFooterMode,
  footerTemplateId,
  setFooterTemplateId,
  savedCoverTemplates,
  savedHeaderTemplates,
  savedFooterTemplates,
  selectedCoverTemplate,
  selectedHeaderTemplate,
  selectedFooterTemplate,
  name,
  selectedCategoryIds,
  totalSelectedProducts,
  isDark
}) => {
  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
      {/* Left Column: Tab switcher + List of Templates & Options */}
      <div className={`w-full md:w-[440px] lg:w-[480px] border-r flex flex-col h-full shrink-0 ${
        isDark ? 'border-[#E2DCC8]/15 bg-[#141414]' : 'border-slate-200 bg-white'
      }`}>
        {/* Tab Selector Bar */}
        <div className="p-4 border-b flex items-center gap-2" style={{ borderColor: isDark ? 'rgba(226, 220, 200, 0.15)' : '#e2e8f0' }}>
          <button
            type="button"
            onClick={() => setActiveFramingTab('cover')}
            className={`flex-1 py-2 px-2.5 rounded-[4px] font-heading text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border transition-all ${
              activeFramingTab === 'cover'
                ? 'bg-[#0F3D3E] text-white border-[#E2DCC8]/40 shadow-sm'
                : (isDark ? 'bg-[#181818] text-[#888] border-[#222] hover:text-white' : 'bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-900')
            }`}
          >
            <BookOpen size={13} />
            <span>Cover Page</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFramingTab('header')}
            className={`flex-1 py-2 px-2.5 rounded-[4px] font-heading text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border transition-all ${
              activeFramingTab === 'header'
                ? 'bg-[#0F3D3E] text-white border-[#E2DCC8]/40 shadow-sm'
                : (isDark ? 'bg-[#181818] text-[#888] border-[#222] hover:text-white' : 'bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-900')
            }`}
          >
            <Sliders size={13} />
            <span>Header</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFramingTab('footer')}
            className={`flex-1 py-2 px-2.5 rounded-[4px] font-heading text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border transition-all ${
              activeFramingTab === 'footer'
                ? 'bg-[#0F3D3E] text-white border-[#E2DCC8]/40 shadow-sm'
                : (isDark ? 'bg-[#181818] text-[#888] border-[#222] hover:text-white' : 'bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-900')
            }`}
          >
            <SlidersHorizontal size={13} />
            <span>Footer</span>
          </button>
        </div>

        {/* Template Items List Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {/* TAB 1: COVER PAGE TEMPLATES */}
          {activeFramingTab === 'cover' && (
            <>
              {/* Option 1: Blank / None */}
              <div
                onClick={() => { setIncludeCover(false); setCoverTemplateId(''); }}
                className={`p-3.5 rounded-[6px] border cursor-pointer transition-all flex items-center justify-between ${
                  !includeCover
                    ? 'bg-[#0F3D3E]/20 border-[#0F3D3E] ring-2 ring-[#0F3D3E]/50 shadow-md'
                    : (isDark ? 'bg-[#100F0F] border-[#E2DCC8]/15 hover:border-[#E2DCC8]/30' : 'bg-slate-50 border-slate-200 hover:border-slate-300')
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${!includeCover ? 'bg-[#0F3D3E]' : 'bg-slate-400'}`} />
                    <h4 className={`text-xs font-bold font-heading ${!includeCover ? (isDark ? 'text-white' : 'text-[#0F3D3E]') : (isDark ? 'text-[#F1F1F1]' : 'text-slate-800')}`}>
                      Blank (No Cover Page)
                    </h4>
                  </div>
                  <p className={`text-[11px] ${isDark ? 'text-[#E2DCC8]/60' : 'text-slate-500'}`}>
                    Starts immediately on Page 1 with product listings.
                  </p>
                </div>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${!includeCover ? 'bg-[#0F3D3E] text-white' : 'border border-slate-400 text-transparent'}`}>
                  <Check size={11} strokeWidth={3} />
                </div>
              </div>

              {/* Option 2: Default Themed Cover */}
              <div
                onClick={() => { setIncludeCover(true); setCoverTemplateId(''); }}
                className={`p-3.5 rounded-[6px] border cursor-pointer transition-all flex items-center justify-between ${
                  includeCover && !coverTemplateId
                    ? 'bg-[#0F3D3E]/20 border-[#0F3D3E] ring-2 ring-[#0F3D3E]/50 shadow-md'
                    : (isDark ? 'bg-[#100F0F] border-[#E2DCC8]/15 hover:border-[#E2DCC8]/30' : 'bg-slate-50 border-slate-200 hover:border-slate-300')
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${includeCover && !coverTemplateId ? 'bg-[#0F3D3E]' : 'bg-slate-400'}`} />
                    <h4 className={`text-xs font-bold font-heading ${includeCover && !coverTemplateId ? (isDark ? 'text-white' : 'text-[#0F3D3E]') : (isDark ? 'text-[#F1F1F1]' : 'text-slate-800')}`}>
                      Modern Document Cover
                    </h4>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-mono font-bold">Standard</span>
                  </div>
                  <p className={`text-[11px] ${isDark ? 'text-[#E2DCC8]/60' : 'text-slate-500'}`}>
                    Clean front cover featuring publication title & accents.
                  </p>
                </div>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${includeCover && !coverTemplateId ? 'bg-[#0F3D3E] text-white' : 'border border-slate-400 text-transparent'}`}>
                  <Check size={11} strokeWidth={3} />
                </div>
              </div>

              {/* Saved Cover Templates */}
              {savedCoverTemplates.map((tmpl) => {
                const isSelected = includeCover && String(coverTemplateId) === String(tmpl.id);
                const elCount = (tmpl.pages_data?.[0]?.elements || tmpl.elements || []).length;
                return (
                  <div
                    key={tmpl.id}
                    onClick={() => { setIncludeCover(true); setCoverTemplateId(String(tmpl.id)); }}
                    className={`p-3.5 rounded-[6px] border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#0F3D3E]/20 border-[#0F3D3E] ring-2 ring-[#0F3D3E]/50 shadow-md'
                        : (isDark ? 'bg-[#100F0F] border-[#E2DCC8]/15 hover:border-[#E2DCC8]/30' : 'bg-slate-50 border-slate-200 hover:border-slate-300')
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${isSelected ? 'bg-[#0F3D3E]' : 'bg-slate-400'}`} />
                        <h4 className={`text-xs font-bold font-heading ${isSelected ? (isDark ? 'text-white' : 'text-[#0F3D3E]') : (isDark ? 'text-[#F1F1F1]' : 'text-slate-800')}`}>
                          {tmpl.name}
                        </h4>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-500 font-mono font-bold">#{tmpl.id}</span>
                      </div>
                      <p className={`text-[11px] ${isDark ? 'text-[#E2DCC8]/60' : 'text-slate-500'}`}>
                        {tmpl.category || 'Standard'} • {elCount} elements
                      </p>
                    </div>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isSelected ? 'bg-[#0F3D3E] text-white' : 'border border-slate-400 text-transparent'}`}>
                      <Check size={11} strokeWidth={3} />
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {/* TAB 2: HEADER TEMPLATES */}
          {activeFramingTab === 'header' && (
            <>
              {/* Option 1: Blank / None */}
              <div
                onClick={() => { setHeaderMode('none'); setHeaderTemplateId(''); }}
                className={`p-3.5 rounded-[6px] border cursor-pointer transition-all flex items-center justify-between ${
                  headerMode === 'none'
                    ? 'bg-[#0F3D3E]/20 border-[#0F3D3E] ring-2 ring-[#0F3D3E]/50 shadow-md'
                    : (isDark ? 'bg-[#100F0F] border-[#E2DCC8]/15 hover:border-[#E2DCC8]/30' : 'bg-slate-50 border-slate-200 hover:border-slate-300')
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${headerMode === 'none' ? 'bg-[#0F3D3E]' : 'bg-slate-400'}`} />
                    <h4 className={`text-xs font-bold font-heading ${headerMode === 'none' ? (isDark ? 'text-white' : 'text-[#0F3D3E]') : (isDark ? 'text-[#F1F1F1]' : 'text-slate-800')}`}>
                      Blank (No Running Header)
                    </h4>
                  </div>
                  <p className={`text-[11px] ${isDark ? 'text-[#E2DCC8]/60' : 'text-slate-500'}`}>
                    No top header band. Edge-to-edge room for product listings.
                  </p>
                </div>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${headerMode === 'none' ? 'bg-[#0F3D3E] text-white' : 'border border-slate-400 text-transparent'}`}>
                  <Check size={11} strokeWidth={3} />
                </div>
              </div>

              {/* Option 2: Default Title Header */}
              <div
                onClick={() => { setHeaderMode('default'); setHeaderTemplateId(''); }}
                className={`p-3.5 rounded-[6px] border cursor-pointer transition-all flex items-center justify-between ${
                  headerMode === 'default'
                    ? 'bg-[#0F3D3E]/20 border-[#0F3D3E] ring-2 ring-[#0F3D3E]/50 shadow-md'
                    : (isDark ? 'bg-[#100F0F] border-[#E2DCC8]/15 hover:border-[#E2DCC8]/30' : 'bg-slate-50 border-slate-200 hover:border-slate-300')
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${headerMode === 'default' ? 'bg-[#0F3D3E]' : 'bg-slate-400'}`} />
                    <h4 className={`text-xs font-bold font-heading ${headerMode === 'default' ? (isDark ? 'text-white' : 'text-[#0F3D3E]') : (isDark ? 'text-[#F1F1F1]' : 'text-slate-800')}`}>
                      Dynamic Title Header
                    </h4>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-mono font-bold">Standard</span>
                  </div>
                  <p className={`text-[11px] ${isDark ? 'text-[#E2DCC8]/60' : 'text-slate-500'}`}>
                    Displays catalog publication title centered at page top.
                  </p>
                </div>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${headerMode === 'default' ? 'bg-[#0F3D3E] text-white' : 'border border-slate-400 text-transparent'}`}>
                  <Check size={11} strokeWidth={3} />
                </div>
              </div>

              {/* Saved Header Templates */}
              {savedHeaderTemplates.map((tmpl) => {
                const isSelected = headerMode === 'template' && String(headerTemplateId) === String(tmpl.id);
                const height = tmpl.pages_data?.[0]?.height || 113.4;
                const elCount = (tmpl.pages_data?.[0]?.elements || tmpl.elements || []).length;
                return (
                  <div
                    key={tmpl.id}
                    onClick={() => { setHeaderMode('template'); setHeaderTemplateId(String(tmpl.id)); }}
                    className={`p-3.5 rounded-[6px] border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#0F3D3E]/20 border-[#0F3D3E] ring-2 ring-[#0F3D3E]/50 shadow-md'
                        : (isDark ? 'bg-[#100F0F] border-[#E2DCC8]/15 hover:border-[#E2DCC8]/30' : 'bg-slate-50 border-slate-200 hover:border-slate-300')
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${isSelected ? 'bg-[#0F3D3E]' : 'bg-slate-400'}`} />
                        <h4 className={`text-xs font-bold font-heading ${isSelected ? (isDark ? 'text-white' : 'text-[#0F3D3E]') : (isDark ? 'text-[#F1F1F1]' : 'text-slate-800')}`}>
                          {tmpl.name}
                        </h4>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-500 font-mono font-bold">#{tmpl.id}</span>
                      </div>
                      <p className={`text-[11px] ${isDark ? 'text-[#E2DCC8]/60' : 'text-slate-500'}`}>
                        {tmpl.category || 'Custom'} • {Math.round(height / 3.78)}mm ({Math.round(height)}px) • {elCount} elements
                      </p>
                    </div>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isSelected ? 'bg-[#0F3D3E] text-white' : 'border border-slate-400 text-transparent'}`}>
                      <Check size={11} strokeWidth={3} />
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {/* TAB 3: FOOTER TEMPLATES */}
          {activeFramingTab === 'footer' && (
            <>
              {/* Option 1: Blank / None */}
              <div
                onClick={() => { setFooterMode('none'); setFooterTemplateId(''); }}
                className={`p-3.5 rounded-[6px] border cursor-pointer transition-all flex items-center justify-between ${
                  footerMode === 'none'
                    ? 'bg-[#0F3D3E]/20 border-[#0F3D3E] ring-2 ring-[#0F3D3E]/50 shadow-md'
                    : (isDark ? 'bg-[#100F0F] border-[#E2DCC8]/15 hover:border-[#E2DCC8]/30' : 'bg-slate-50 border-slate-200 hover:border-slate-300')
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${footerMode === 'none' ? 'bg-[#0F3D3E]' : 'bg-slate-400'}`} />
                    <h4 className={`text-xs font-bold font-heading ${footerMode === 'none' ? (isDark ? 'text-white' : 'text-[#0F3D3E]') : (isDark ? 'text-[#F1F1F1]' : 'text-slate-800')}`}>
                      Blank (No Running Footer)
                    </h4>
                  </div>
                  <p className={`text-[11px] ${isDark ? 'text-[#E2DCC8]/60' : 'text-slate-500'}`}>
                    No bottom footer bar on interior product pages.
                  </p>
                </div>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${footerMode === 'none' ? 'bg-[#0F3D3E] text-white' : 'border border-slate-400 text-transparent'}`}>
                  <Check size={11} strokeWidth={3} />
                </div>
              </div>

              {/* Option 2: Default Page Numbers */}
              <div
                onClick={() => { setFooterMode('default'); setFooterTemplateId(''); }}
                className={`p-3.5 rounded-[6px] border cursor-pointer transition-all flex items-center justify-between ${
                  footerMode === 'default'
                    ? 'bg-[#0F3D3E]/20 border-[#0F3D3E] ring-2 ring-[#0F3D3E]/50 shadow-md'
                    : (isDark ? 'bg-[#100F0F] border-[#E2DCC8]/15 hover:border-[#E2DCC8]/30' : 'bg-slate-50 border-slate-200 hover:border-slate-300')
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${footerMode === 'default' ? 'bg-[#0F3D3E]' : 'bg-slate-400'}`} />
                    <h4 className={`text-xs font-bold font-heading ${footerMode === 'default' ? (isDark ? 'text-white' : 'text-[#0F3D3E]') : (isDark ? 'text-[#F1F1F1]' : 'text-slate-800')}`}>
                      Standard Page Numbers
                    </h4>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-mono font-bold">Standard</span>
                  </div>
                  <p className={`text-[11px] ${isDark ? 'text-[#E2DCC8]/60' : 'text-slate-500'}`}>
                    Dynamic Page numbers (Page 1, 2, 3...) right-aligned.
                  </p>
                </div>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${footerMode === 'default' ? 'bg-[#0F3D3E] text-white' : 'border border-slate-400 text-transparent'}`}>
                  <Check size={11} strokeWidth={3} />
                </div>
              </div>

              {/* Saved Footer Templates */}
              {savedFooterTemplates.map((tmpl) => {
                const isSelected = footerMode === 'template' && String(footerTemplateId) === String(tmpl.id);
                const height = tmpl.pages_data?.[0]?.height || 57;
                const elCount = (tmpl.pages_data?.[0]?.elements || tmpl.elements || []).length;
                return (
                  <div
                    key={tmpl.id}
                    onClick={() => { setFooterMode('template'); setFooterTemplateId(String(tmpl.id)); }}
                    className={`p-3.5 rounded-[6px] border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#0F3D3E]/20 border-[#0F3D3E] ring-2 ring-[#0F3D3E]/50 shadow-md'
                        : (isDark ? 'bg-[#100F0F] border-[#E2DCC8]/15 hover:border-[#E2DCC8]/30' : 'bg-slate-50 border-slate-200 hover:border-slate-300')
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${isSelected ? 'bg-[#0F3D3E]' : 'bg-slate-400'}`} />
                        <h4 className={`text-xs font-bold font-heading ${isSelected ? (isDark ? 'text-white' : 'text-[#0F3D3E]') : (isDark ? 'text-[#F1F1F1]' : 'text-slate-800')}`}>
                          {tmpl.name}
                        </h4>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-500 font-mono font-bold">#{tmpl.id}</span>
                      </div>
                      <p className={`text-[11px] ${isDark ? 'text-[#E2DCC8]/60' : 'text-slate-500'}`}>
                        {tmpl.category || 'Custom'} • {Math.round(height / 3.78)}mm ({Math.round(height)}px) • {elCount} elements
                      </p>
                    </div>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isSelected ? 'bg-[#0F3D3E] text-white' : 'border border-slate-400 text-transparent'}`}>
                      <Check size={11} strokeWidth={3} />
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* Right Column: High-Fidelity Live Visual Preview */}
      <div className={`flex-1 p-6 md:p-8 flex flex-col items-center justify-start overflow-y-auto ${
        isDark ? 'bg-[#0a0a0a]' : 'bg-slate-100/70'
      }`}>
        {/* Preview Header Label */}
        <div className="w-full max-w-2xl flex items-center justify-between mb-4 pb-2 border-b" style={{ borderColor: isDark ? 'rgba(226,220,200,0.1)' : '#e2e8f0' }}>
          <span className={`text-xs font-bold uppercase tracking-wider font-heading flex items-center gap-1.5 ${
            isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'
          }`}>
            <Eye size={15} />
            <span>
              Live Visual Preview • {activeFramingTab === 'cover' ? 'Front Cover Page' : (activeFramingTab === 'header' ? 'Running Header' : 'Running Footer')}
            </span>
          </span>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
            isDark ? 'bg-[#181818] text-[#E2DCC8]/70' : 'bg-white text-slate-600 shadow-sm border border-slate-200'
          }`}>
            {activeFramingTab === 'cover' && (!includeCover ? 'Status: Blank' : (!coverTemplateId ? 'Standard Cover' : `Template: ${selectedCoverTemplate?.name || 'Selected'}`))}
            {activeFramingTab === 'header' && (headerMode === 'none' ? 'Status: Blank' : (headerMode === 'default' ? 'Standard Header' : `Template: ${selectedHeaderTemplate?.name || 'Selected'}`))}
            {activeFramingTab === 'footer' && (footerMode === 'none' ? 'Status: Blank' : (footerMode === 'default' ? 'Standard Footer' : `Template: ${selectedFooterTemplate?.name || 'Selected'}`))}
          </span>
        </div>

        {/* 1. COVER PREVIEW */}
        {activeFramingTab === 'cover' && (
          <div className="w-full max-w-md flex flex-col items-center justify-center my-auto py-2">
            {!includeCover ? (
              /* Blank Cover Placeholder */
              <div className={`w-full aspect-[1/1.414] rounded-[8px] border-2 border-dashed flex flex-col items-center justify-center p-8 text-center space-y-3 ${
                isDark ? 'border-[#333] bg-[#141414]/50 text-[#888]' : 'border-slate-300 bg-white text-slate-500'
              }`}>
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isDark ? 'bg-[#1e1e1e]' : 'bg-slate-100'}`}>
                  <BookOpen size={26} className="opacity-40" />
                </div>
                <h4 className="font-space text-sm font-bold">No Front Cover Page</h4>
                <p className="text-xs max-w-xs leading-relaxed opacity-75">
                  Your catalog will open directly on Page 1 with product sections.
                </p>
              </div>
            ) : selectedCoverTemplate ? (
              /* Real Saved Cover Template Rendered with Canvas Elements */
              <div className="w-full aspect-[1/1.414] rounded-[8px] border border-slate-300 dark:border-slate-800 bg-white shadow-2xl overflow-hidden relative">
                <TemplateElementsRenderer
                  elements={selectedCoverTemplate.pages_data?.[0]?.elements || selectedCoverTemplate.elements || []}
                  width={794}
                  height={selectedCoverTemplate.pages_data?.[0]?.height || 1123}
                  backgroundColor={selectedCoverTemplate.pages_data?.[0]?.backgroundColor || selectedCoverTemplate.backgroundColor || '#ffffff'}
                  catalogTitle={name}
                  thumbnail={selectedCoverTemplate.thumbnail}
                />
              </div>
            ) : (
              /* Default Modern Cover Page */
              <div className="w-full aspect-[1/1.414] rounded-[8px] border border-slate-200 bg-white shadow-2xl p-7 flex flex-col justify-between relative overflow-hidden text-slate-900">
                {/* Top Branding Tag */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    OFFICIAL CATALOGUE
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    2026 EDITION
                  </span>
                </div>

                {/* Center Title Display */}
                <div className="my-auto space-y-3">
                  <div className="w-12 h-1.5 bg-[#0F3D3E] rounded-full" />
                  <h2 className="font-space text-2xl font-black uppercase tracking-tight text-slate-900 leading-tight">
                    {name || 'PRODUCT SPECIFICATION CATALOG'}
                  </h2>
                  <p className="text-xs font-medium text-slate-500 font-heading">
                    Complete Technical Data, Dimensions & Engineering Specifications
                  </p>
                </div>

                {/* Bottom Footer Info on Cover */}
                <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>{selectedCategoryIds.length} Selected Categories</span>
                  <span>{totalSelectedProducts} Products</span>
                </div>
              </div>
            )}

            {includeCover && (
              <div className="mt-3 flex items-center gap-2 text-[10px] font-mono text-slate-400">
                <span>A4 Portrait (794 × 1123px)</span>
                <span>•</span>
                <span>{selectedCoverTemplate ? (selectedCoverTemplate.pages_data?.[0]?.elements || []).length + ' elements' : 'Standard Layout'}</span>
              </div>
            )}
          </div>
        )}

        {/* 2. HEADER PREVIEW */}
        {activeFramingTab === 'header' && (
          <div className="w-full max-w-2xl flex flex-col items-center space-y-5">
            {headerMode === 'none' ? (
              <div className={`w-full py-16 px-6 rounded-[8px] border-2 border-dashed flex flex-col items-center justify-center text-center space-y-3 ${
                isDark ? 'border-[#333] bg-[#141414]/50 text-[#888]' : 'border-slate-300 bg-white text-slate-500'
              }`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? 'bg-[#1e1e1e]' : 'bg-slate-100'}`}>
                  <Sliders size={22} className="opacity-40" />
                </div>
                <h4 className="font-space text-sm font-bold">Blank Running Header</h4>
                <p className="text-xs max-w-sm leading-relaxed opacity-75">
                  Pages will have zero header band, giving full vertical canvas height to product tables and cards.
                </p>
              </div>
            ) : (
              <>
                {/* 1. Magnified Close-Up Strip */}
                <div className="w-full rounded-[8px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#141414] shadow-xl overflow-hidden p-2">
                  <div className="text-[10px] font-mono px-2 py-1 font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between border-b mb-2" style={{ borderColor: isDark ? '#262626' : '#f1f5f9' }}>
                    <span>Magnified Header Detail View</span>
                    <span>
                      {headerMode === 'template' && selectedHeaderTemplate 
                        ? `${Math.round((selectedHeaderTemplate.pages_data?.[0]?.height || 113.4) / 3.78)}mm (${Math.round(selectedHeaderTemplate.pages_data?.[0]?.height || 113.4)}px)`
                        : 'Standard 15mm'}
                    </span>
                  </div>

                  {headerMode === 'template' && selectedHeaderTemplate ? (
                    <div 
                      style={{ aspectRatio: `794 / ${Math.max(selectedHeaderTemplate.pages_data?.[0]?.height || 113.4, 40)}` }}
                      className="w-full rounded border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm"
                    >
                      <TemplateElementsRenderer
                        elements={selectedHeaderTemplate.pages_data?.[0]?.elements || selectedHeaderTemplate.elements || []}
                        width={794}
                        height={selectedHeaderTemplate.pages_data?.[0]?.height || 113.4}
                        backgroundColor={selectedHeaderTemplate.pages_data?.[0]?.backgroundColor || '#ffffff'}
                        catalogTitle={name}
                      />
                    </div>
                  ) : (
                    /* Standard Dynamic Title Header */
                    <div className="w-full h-14 px-6 border rounded flex items-center justify-between bg-white text-slate-900 border-slate-200 shadow-sm">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#0F3D3E]" />
                        <span className="font-space text-xs font-bold tracking-wider uppercase text-slate-900">
                          {name || 'CATALOG PUBLICATION 2026'}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">Page 1</span>
                    </div>
                  )}
                </div>

                {/* 2. In-Context A4 Page Placement Mockup */}
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Page Context Preview (Placement at top)</span>
                  </span>
                  <div className="w-[300px] aspect-[1/1.414] rounded-[6px] border border-slate-300 dark:border-slate-800 bg-white shadow-2xl overflow-hidden flex flex-col text-slate-900 relative">
                    {/* Header Slot with highlight ring */}
                    <div className="w-full shrink-0 relative ring-2 ring-emerald-500/80 shadow-sm">
                      {headerMode === 'template' && selectedHeaderTemplate ? (
                        <div style={{ height: `${((selectedHeaderTemplate.pages_data?.[0]?.height || 113.4) / 1123) * 100}%`, minHeight: '32px' }}>
                          <TemplateElementsRenderer
                            elements={selectedHeaderTemplate.pages_data?.[0]?.elements || selectedHeaderTemplate.elements || []}
                            width={794}
                            height={selectedHeaderTemplate.pages_data?.[0]?.height || 113.4}
                            backgroundColor={selectedHeaderTemplate.pages_data?.[0]?.backgroundColor || '#ffffff'}
                            catalogTitle={name}
                          />
                        </div>
                      ) : (
                        <div className="h-8 px-3 border-b flex items-center justify-between bg-slate-50 text-slate-800 text-[8px] font-mono">
                          <span className="font-bold truncate max-w-[180px]">{name || 'CATALOG 2026'}</span>
                          <span className="text-slate-400">Page 1</span>
                        </div>
                      )}
                    </div>

                    {/* Interior Mock Body */}
                    <div className="flex-1 p-3 space-y-2 overflow-hidden bg-white text-slate-900">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                        <span className="text-[8px] font-bold text-slate-700 uppercase font-heading">Product Category 1</span>
                        <span className="text-[7px] font-mono text-slate-400">Specifications</span>
                      </div>
                      {[1, 2, 3].map(item => (
                        <div key={item} className="flex items-center gap-2 p-1 rounded border border-slate-100 bg-slate-50">
                          <div className="w-7 h-7 rounded bg-slate-200 shrink-0 flex items-center justify-center text-slate-400">
                            <Package size={10} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-[7px] font-bold font-mono">PROD-00{item}</span>
                              <span className="text-[7px] font-bold text-emerald-600 font-mono">$3{item}.00</span>
                            </div>
                            <div className="w-full bg-slate-200 h-1 rounded my-0.5 opacity-60" />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer Mock */}
                    <div className="h-6 px-3 border-t flex items-center justify-between bg-slate-50 text-[7px] font-mono text-slate-400 shrink-0">
                      <span>{name || 'Catalog'}</span>
                      <span>Page 1</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* 3. FOOTER PREVIEW */}
        {activeFramingTab === 'footer' && (
          <div className="w-full max-w-2xl flex flex-col items-center space-y-5">
            {footerMode === 'none' ? (
              <div className={`w-full py-16 px-6 rounded-[8px] border-2 border-dashed flex flex-col items-center justify-center text-center space-y-3 ${
                isDark ? 'border-[#333] bg-[#141414]/50 text-[#888]' : 'border-slate-300 bg-white text-slate-500'
              }`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? 'bg-[#1e1e1e]' : 'bg-slate-100'}`}>
                  <SlidersHorizontal size={22} className="opacity-40" />
                </div>
                <h4 className="font-space text-sm font-bold">Blank Running Footer</h4>
                <p className="text-xs max-w-sm leading-relaxed opacity-75">
                  Pages will have no bottom running footer bar.
                </p>
              </div>
            ) : (
              <>
                {/* 1. Magnified Close-Up Strip */}
                <div className="w-full rounded-[8px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#141414] shadow-xl overflow-hidden p-2">
                  <div className="text-[10px] font-mono px-2 py-1 font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between border-b mb-2" style={{ borderColor: isDark ? '#262626' : '#f1f5f9' }}>
                    <span>Magnified Footer Detail View</span>
                    <span>
                      {footerMode === 'template' && selectedFooterTemplate 
                        ? `${Math.round((selectedFooterTemplate.pages_data?.[0]?.height || 57) / 3.78)}mm (${Math.round(selectedFooterTemplate.pages_data?.[0]?.height || 57)}px)`
                        : 'Standard 10mm'}
                    </span>
                  </div>

                  {footerMode === 'template' && selectedFooterTemplate ? (
                    <div 
                      style={{ aspectRatio: `794 / ${Math.max(selectedFooterTemplate.pages_data?.[0]?.height || 57, 30)}` }}
                      className="w-full rounded border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm"
                    >
                      <TemplateElementsRenderer
                        elements={selectedFooterTemplate.pages_data?.[0]?.elements || selectedFooterTemplate.elements || []}
                        width={794}
                        height={selectedFooterTemplate.pages_data?.[0]?.height || 57}
                        backgroundColor={selectedFooterTemplate.pages_data?.[0]?.backgroundColor || '#ffffff'}
                        catalogTitle={name}
                      />
                    </div>
                  ) : (
                    /* Standard Page Numbers Footer */
                    <div className="w-full h-10 px-6 border rounded flex items-center justify-between bg-white text-slate-900 border-slate-200 shadow-sm">
                      <span className="text-[10px] font-mono text-slate-400 uppercase">
                        {name || 'CONFIDENTIAL & PROPRIETARY'}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-slate-800">
                        Page 1
                      </span>
                    </div>
                  )}
                </div>

                {/* 2. In-Context A4 Page Placement Mockup */}
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Page Context Preview (Placement at bottom)</span>
                  </span>
                  <div className="w-[300px] aspect-[1/1.414] rounded-[6px] border border-slate-300 dark:border-slate-800 bg-white shadow-2xl overflow-hidden flex flex-col justify-between text-slate-900 relative">
                    {/* Top Header Mock */}
                    <div className="h-8 px-3 border-b flex items-center justify-between bg-slate-50 text-[8px] font-mono text-slate-700 shrink-0">
                      <span className="font-bold truncate max-w-[180px]">{name || 'CATALOG 2026'}</span>
                      <span className="text-slate-400">Page 1</span>
                    </div>

                    {/* Interior Mock Body */}
                    <div className="flex-1 p-3 space-y-2 overflow-hidden bg-white text-slate-900">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                        <span className="text-[8px] font-bold text-slate-700 uppercase font-heading">Product Category 1</span>
                        <span className="text-[7px] font-mono text-slate-400">Specifications</span>
                      </div>
                      {[1, 2, 3].map(item => (
                        <div key={item} className="flex items-center gap-2 p-1 rounded border border-slate-100 bg-slate-50">
                          <div className="w-7 h-7 rounded bg-slate-200 shrink-0 flex items-center justify-center text-slate-400">
                            <Package size={10} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-[7px] font-bold font-mono">PROD-00{item}</span>
                              <span className="text-[7px] font-bold text-emerald-600 font-mono">$3{item}.00</span>
                            </div>
                            <div className="w-full bg-slate-200 h-1 rounded my-0.5 opacity-60" />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer Slot with highlight ring */}
                    <div className="w-full shrink-0 relative ring-2 ring-emerald-500/80 shadow-sm">
                      {footerMode === 'template' && selectedFooterTemplate ? (
                        <div style={{ height: `${((selectedFooterTemplate.pages_data?.[0]?.height || 57) / 1123) * 100}%`, minHeight: '20px' }}>
                          <TemplateElementsRenderer
                            elements={selectedFooterTemplate.pages_data?.[0]?.elements || selectedFooterTemplate.elements || []}
                            width={794}
                            height={selectedFooterTemplate.pages_data?.[0]?.height || 57}
                            backgroundColor={selectedFooterTemplate.pages_data?.[0]?.backgroundColor || '#ffffff'}
                            catalogTitle={name}
                          />
                        </div>
                      ) : (
                        <div className="h-6 px-3 border-t flex items-center justify-between bg-slate-50 text-slate-800 text-[7px] font-mono">
                          <span className="text-slate-500 truncate max-w-[180px]">{name || 'CONFIDENTIAL'}</span>
                          <span className="font-bold text-slate-800">Page 1</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
