import React, { useState } from 'react';
import {
  Layout, Type, Image, X, Sparkles
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { PX_PER_MM, PAGE_HEIGHT, PAGE_WIDTH } from '../../constants';

const HeaderFooterPanel: React.FC = () => {
  const {
    catalog,
    updateProjectSettings,
    addHeaderElement,
    addFooterElement,
    updateFooterElement,
    currentPageIndex,
    setSelectedElementIds,
    setEditorTab,
    setIsHeaderDesignerOpen,
    setIsFooterDesignerOpen,
    uiTheme
  } = useStore();

  const isDark = uiTheme === 'dark';
  const [localHeaderMm, setLocalHeaderMm] = useState<string>('');
  const [localFooterMm, setLocalFooterMm] = useState<string>('');

  const toMm = (px: number) => Math.round(px / PX_PER_MM);
  const toPx = (mm: number) => Math.round(mm * PX_PER_MM);

  // Sync local state when store changes and sanitize headerHeight
  React.useEffect(() => {
    if (catalog.headerHeight) {
      const mm = toMm(catalog.headerHeight);
      if (mm < 15) {
        setLocalHeaderMm('30');
        updateProjectSettings({ headerHeight: toPx(30) });
      } else {
        setLocalHeaderMm(mm.toString());
      }
    } else {
      setLocalHeaderMm('30');
      updateProjectSettings({ headerHeight: toPx(30) });
    }
  }, [catalog.headerHeight]);

  React.useEffect(() => {
    if (catalog.footerHeight) {
      setLocalFooterMm(toMm(catalog.footerHeight).toString());
    }
  }, [catalog.footerHeight]);

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
        {/* Custom Header Studio Launch Card */}
        <div className={`p-3.5 rounded-[6px] border transition-all ${
          isDark
            ? 'bg-gradient-to-br from-[#0F3D3E]/30 via-[#161616] to-[#121212] border-[#0F3D3E]/40'
            : 'bg-gradient-to-br from-[#0F3D3E]/10 via-slate-50 to-white border-[#0F3D3E]/30'
        }`}>
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles size={14} className="text-[#E2DCC8]" />
            <h4 className={`text-xs font-black uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Custom Header Studio
            </h4>
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

        {/* Header Controls Card */}
        <div className={`p-3.5 rounded-[4px] border transition-all ${
          isDark ? 'border-[#262626] bg-[#1a1a1a]' : 'border-slate-200 bg-slate-50'
        }`}>
          <label className="flex items-center justify-between cursor-pointer">
            <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Enable Header</span>
            <input
              type="checkbox"
              checked={catalog.hasHeader}
              onChange={(e) => updateProjectSettings({ hasHeader: e.target.checked })}
              className="w-4 h-4 rounded border-[#333] accent-[#0F3D3E] cursor-pointer"
            />
          </label>

          {catalog.hasHeader && (
            <div className={`mt-3 pt-3 border-t space-y-3 animate-in fade-in duration-200 ${
              isDark ? 'border-[#262626]' : 'border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#888888] uppercase tracking-wider">Height from top</span>
                <div className={`flex items-center gap-1 border rounded-[4px] px-2 py-0.5 w-16 ${
                  isDark ? 'border-[#333] bg-[#121212]' : 'border-slate-300 bg-white'
                }`}>
                  <input
                    type="number"
                    min="15"
                    max="60"
                    value={localHeaderMm}
                    onChange={(e) => {
                      const rawVal = e.target.value;
                      setLocalHeaderMm(rawVal);
                      const val = parseInt(rawVal);
                      if (!isNaN(val)) {
                        const clamped = Math.max(15, Math.min(60, val));
                        updateProjectSettings({ headerHeight: toPx(clamped) });
                      }
                    }}
                    onBlur={(e) => {
                      const val = parseInt(e.target.value);
                      const clamped = isNaN(val) ? 30 : Math.max(15, Math.min(60, val));
                      setLocalHeaderMm(clamped.toString());
                      updateProjectSettings({ headerHeight: toPx(clamped) });
                    }}
                    className={`w-full bg-transparent outline-none text-[11px] font-bold text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                      isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'
                    }`}
                  />
                  <span className="text-[9px] font-medium text-[#888888]">mm</span>
                </div>
              </div>
              <input
                type="range"
                min="15"
                max="60"
                step="1"
                value={toMm(catalog.headerHeight && catalog.headerHeight >= toPx(15) ? catalog.headerHeight : toPx(30))}
                onChange={(e) => updateProjectSettings({ headerHeight: toPx(parseInt(e.target.value)) })}
                className={`w-full h-1.5 rounded-[4px] appearance-none cursor-pointer accent-[#0F3D3E] ${
                  isDark ? 'bg-[#262626]' : 'bg-slate-200'
                }`}
              />

              {/* Header Action buttons */}
              <div className="flex gap-2 pt-1">
                {catalog.headerElements?.some(el => el.type === 'text') ? (
                  <button
                    onClick={() => {
                      const textEl = catalog.headerElements.find(el => el.type === 'text');
                      if (textEl) setSelectedElementIds([textEl.id]);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#0F3D3E]/15 border border-[#0F3D3E]/40 rounded-[6px] text-[#0F3D3E] dark:text-[#E2DCC8] text-[10px] font-bold hover:bg-[#0F3D3E]/25 transition-colors"
                  >
                    <Type size={13} /> Select Text
                  </button>
                ) : (
                  <button
                    onClick={() => addHeaderElement({ id: `header-text-${Date.now()}`, type: 'text', x: (catalog.marginLeft || 0) + 10, y: catalog.marginTop || 0, width: 200, height: 30, text: 'New Text', fontSize: 14, fontFamily: 'Inter', fill: isDark ? '#cccccc' : '#333333', fontWeight: 'bold', rotation: 0, opacity: 1, zIndex: 10, verticalAlign: 'middle' })}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 border rounded-[6px] text-[10px] font-bold transition-colors ${
                      isDark ? 'border-[#333] text-white bg-[#222222] hover:bg-[#2a2a2a]' : 'border-slate-300 text-slate-700 bg-white hover:bg-slate-100'
                    }`}
                  >
                    <Type size={13} /> Add Text
                  </button>
                )}
                <button
                  onClick={() => {
                    addHeaderElement({ id: `header-img-${Date.now()}`, type: 'image', x: (catalog.marginLeft || 0) + 10, y: catalog.marginTop || 0, width: 80, height: 80, src: 'https://via.placeholder.com/150', rotation: 0, opacity: 1, zIndex: 10 });
                    setEditorTab('media');
                  }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 border rounded-[6px] text-[10px] font-bold transition-colors ${
                    isDark ? 'border-[#333] text-white bg-[#222222] hover:bg-[#2a2a2a]' : 'border-slate-300 text-slate-700 bg-white hover:bg-slate-100'
                  }`}
                >
                  <Image size={13} /> Add Image
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Custom Footer Studio Launch Card */}
        <div className={`p-3.5 rounded-[6px] border transition-all ${
          isDark
            ? 'bg-gradient-to-br from-[#0F3D3E]/30 via-[#161616] to-[#121212] border-[#0F3D3E]/40'
            : 'bg-gradient-to-br from-[#0F3D3E]/10 via-slate-50 to-white border-[#0F3D3E]/30'
        }`}>
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles size={14} className="text-[#E2DCC8]" />
            <h4 className={`text-xs font-black uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Custom Footer Studio
            </h4>
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

        {/* Footer Controls Card */}
        <div className={`p-3.5 rounded-[4px] border transition-all ${
          isDark ? 'border-[#262626] bg-[#1a1a1a]' : 'border-slate-200 bg-slate-50'
        }`}>
          <label className="flex items-center justify-between cursor-pointer">
            <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Enable Footer</span>
            <input
              type="checkbox"
              checked={catalog.hasFooter}
              onChange={(e) => updateProjectSettings({ hasFooter: e.target.checked })}
              className="w-4 h-4 rounded border-[#333] accent-[#0F3D3E] cursor-pointer"
            />
          </label>

          {catalog.hasFooter && (
            <div className={`mt-3 pt-3 border-t space-y-3 animate-in fade-in duration-200 ${
              isDark ? 'border-[#262626]' : 'border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#888888] uppercase tracking-wider">Height from bottom</span>
                <div className={`flex items-center gap-1 border rounded-[4px] px-2 py-0.5 w-16 ${
                  isDark ? 'border-[#333] bg-[#121212]' : 'border-slate-300 bg-white'
                }`}>
                  <input
                    type="number"
                    min="15"
                    max="25"
                    value={localFooterMm}
                    onChange={(e) => {
                      const rawVal = e.target.value;
                      setLocalFooterMm(rawVal);
                      const val = parseInt(rawVal);
                      if (!isNaN(val)) {
                        const clamped = Math.max(15, Math.min(25, val));
                        updateProjectSettings({ footerHeight: toPx(clamped) });
                      }
                    }}
                    onBlur={(e) => {
                      const val = parseInt(e.target.value);
                      const clamped = isNaN(val) ? 20 : Math.max(15, Math.min(25, val));
                      setLocalFooterMm(clamped.toString());
                      updateProjectSettings({ footerHeight: toPx(clamped) });
                    }}
                    className={`w-full bg-transparent outline-none text-[11px] font-bold text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                      isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'
                    }`}
                  />
                  <span className="text-[9px] font-medium text-[#888888]">mm</span>
                </div>
              </div>
              <input
                type="range"
                min="15"
                max="25"
                step="1"
                value={toMm(catalog.footerHeight || 75.6)}
                onChange={(e) => updateProjectSettings({ footerHeight: toPx(parseInt(e.target.value)) })}
                className={`w-full h-1.5 rounded-[4px] appearance-none cursor-pointer accent-[#0F3D3E] ${
                  isDark ? 'bg-[#262626]' : 'bg-slate-200'
                }`}
              />

              {/* Footer content buttons */}
              <div className="flex gap-2 pt-1">
                {catalog.footerElements?.some(el => el.type === 'text') ? (
                  <button
                    onClick={() => {
                      const textEl = catalog.footerElements.find(el => el.type === 'text');
                      if (textEl) setSelectedElementIds([textEl.id]);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#0F3D3E]/15 border border-[#0F3D3E]/40 rounded-[6px] text-[#0F3D3E] dark:text-[#E2DCC8] text-[10px] font-bold hover:bg-[#0F3D3E]/25 transition-colors"
                  >
                    <Type size={13} /> Select Text
                  </button>
                ) : (
                  <button
                    onClick={() => addFooterElement({
                      id: `footer-text-${Date.now()}`,
                      type: 'text',
                      x: (catalog.marginLeft || 0) + 10,
                      y: 15,
                      width: 200,
                      height: 25,
                      text: 'New Text',
                      fontSize: catalog.footerFontSize || 10,
                      fontFamily: catalog.footerFontFamily || catalog.fontFamily || 'Inter',
                      fill: isDark ? '#888888' : '#475569',
                      rotation: 0,
                      opacity: 1,
                      zIndex: 10,
                      verticalAlign: 'middle'
                    })}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 border rounded-[6px] text-[10px] font-bold transition-colors ${
                      isDark ? 'border-[#333] text-white bg-[#222222] hover:bg-[#2a2a2a]' : 'border-slate-300 text-slate-700 bg-white hover:bg-slate-100'
                    }`}
                  >
                    <Type size={13} /> Add Text
                  </button>
                )}
                <button
                  onClick={() => {
                    addFooterElement({
                      id: `footer-img-${Date.now()}`,
                      type: 'image',
                      x: (catalog.marginLeft || 0) + 10,
                      y: 5,
                      width: 80,
                      height: 40,
                      src: 'https://via.placeholder.com/150',
                      rotation: 0,
                      opacity: 1,
                      zIndex: 10
                    });
                    setEditorTab('media');
                  }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 border rounded-[6px] text-[10px] font-bold transition-colors ${
                    isDark ? 'border-[#333] text-white bg-[#222222] hover:bg-[#2a2a2a]' : 'border-slate-300 text-slate-700 bg-white hover:bg-slate-100'
                  }`}
                >
                  <Image size={13} /> Add Image
                </button>
              </div>

              {/* Page Number Toggle */}
              <label className={`flex items-center justify-between cursor-pointer pt-2 border-t ${
                isDark ? 'border-[#262626]' : 'border-slate-200'
              }`}>
                <span className={`text-[11px] font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Show Page Numbers</span>
                <input
                  type="checkbox"
                  checked={(catalog.footerElements || []).some(el => el.type === 'text' && el.text?.toLowerCase().includes('{{page}}'))}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    if (isChecked) {
                      const existingPageEl = (catalog.footerElements || []).find(el => el.id === 'default-footer-page' || el.text?.toLowerCase().includes('{{page}}'));
                      if (existingPageEl) {
                        const newText = existingPageEl.text?.includes('{{page}}') ? existingPageEl.text : 'Page {{page}}';
                        updateFooterElement(existingPageEl.id, { text: newText, opacity: 1, visible: true });
                      } else {
                        addFooterElement({
                          id: `footer-page-${Date.now()}`,
                          type: 'text',
                          x: Math.max(40, PAGE_WIDTH - (catalog.marginRight || 40) - 160),
                          y: 15,
                          width: 150,
                          height: 25,
                          text: 'Page {{page}}',
                          fontSize: catalog.footerFontSize || 9,
                          fontFamily: catalog.footerFontFamily || catalog.fontFamily || 'Inter',
                          fontWeight: 'bold',
                          textAlign: 'right',
                          fill: '#94a3b8',
                          rotation: 0,
                          opacity: 1,
                          zIndex: 10,
                          verticalAlign: 'middle'
                        });
                      }
                      updateProjectSettings({ hasFooter: true, footerText: '{{page}}' });
                    } else {
                      const filteredElements = (catalog.footerElements || []).map(el => {
                        if (el.type === 'text' && el.text?.toLowerCase().includes('{{page}}')) {
                          const stripped = el.text.replace(/\{\{page\}\}/gi, '').replace(/\bpage\b/gi, '').trim();
                          return { ...el, text: stripped };
                        }
                        return el;
                      }).filter(el => {
                        if (el.id === 'default-footer-page' || el.id?.startsWith('footer-page-')) return false;
                        if (el.type === 'text' && !el.text?.trim()) return false;
                        return true;
                      });
                      updateProjectSettings({
                        footerElements: filteredElements,
                        footerText: ''
                      });
                    }
                  }}
                  className="w-4 h-4 rounded border-[#333] accent-[#0F3D3E] cursor-pointer"
                />
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeaderFooterPanel;
