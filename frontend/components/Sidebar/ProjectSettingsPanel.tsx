import React, { useState } from 'react';
import {
    X, Settings, Layout, MousePointer2, ChevronDown, ChevronRight,
    CornerRightDown, CornerRightUp, Palette, Type,
    AlignLeft, AlignCenter, AlignRight, Sparkles, Image, Hash
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { PX_PER_MM, FONTS, CATEGORIZED_FONTS, PAGE_HEIGHT } from '../../constants';
import AdvancedColorPicker from '../Properties/AdvancedColorPicker';

const ProjectSettingsPanel: React.FC = () => {
    const {
        catalog,
        updateProjectSettings,
        isProjectSettingsOpen,
        setIsProjectSettingsOpen,
        uiTheme,
        setEditorTab,
        addHeaderElement,
        addFooterElement,
        updateHeaderElement,
        updateFooterElement,
        currentPageIndex,
        setPageBackground,
        updateAllPageBackgrounds,
        setSelectedElementIds
    } = useStore();

    const [localHeaderMm, setLocalHeaderMm] = React.useState<string>('');
    const [localFooterMm, setLocalFooterMm] = React.useState<string>('');
    const [pickerOpen, setPickerOpen] = useState(false);

    const toMm = (px: number) => Math.round(px / PX_PER_MM);
    const toPx = (mm: number) => Math.round(mm * PX_PER_MM);

    // Sync local state when store changes (e.g. from sliders or defaults)
    React.useEffect(() => {
        if (catalog.headerHeight) {
            setLocalHeaderMm(toMm(catalog.headerHeight).toString());
        }
    }, [catalog.headerHeight]);

    React.useEffect(() => {
        if (catalog.footerHeight) {
            setLocalFooterMm(toMm(catalog.footerHeight).toString());
        }
    }, [catalog.footerHeight]);

    if (!isProjectSettingsOpen) return null;

    return (
        <div className={`w-[320px] h-full flex flex-col border-l transition-colors duration-300 ${uiTheme === 'dark' ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
            {/* Header */}
            <div className="p-6 border-b flex items-center justify-between">
                <h3 className={`text-sm font-black tracking-tight ${uiTheme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    Page Settings
                </h3>
                <button
                    onClick={() => setIsProjectSettingsOpen(false)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                >
                    <X size={18} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
                {/* Headers & Footers Section */}
                <section className="space-y-4">
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${uiTheme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-100/80'}`}>
                        <Layout size={14} className="text-indigo-600" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Headers & Footers</span>
                    </div>

                    <div className="space-y-6 px-1">
                        {/* Header Toggle */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={catalog.hasHeader}
                                    onChange={(e) => updateProjectSettings({ hasHeader: e.target.checked })}
                                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                />
                                <span className={`text-xs font-bold leading-none ${uiTheme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Header</span>
                            </label>
                            {catalog.hasHeader && (
                                <div className="ml-7 space-y-3 animate-in slide-in-from-top-1 duration-200">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">Height from top</span>
                                            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1 min-w-[70px]">
                                                <input
                                                    type="number"
                                                    min="3"
                                                    max="30"
                                                    value={localHeaderMm}
                                                    onChange={(e) => {
                                                        const rawVal = e.target.value;
                                                        setLocalHeaderMm(rawVal);
                                                        const val = parseInt(rawVal);
                                                        if (!isNaN(val)) {
                                                            const clamped = Math.max(3, Math.min(30, val));
                                                            updateProjectSettings({ headerHeight: toPx(clamped) });
                                                        }
                                                    }}
                                                    onBlur={(e) => {
                                                        const val = parseInt(e.target.value);
                                                        const clamped = isNaN(val) ? 30 : Math.max(3, Math.min(30, val));
                                                        setLocalHeaderMm(clamped.toString());
                                                        updateProjectSettings({ headerHeight: toPx(clamped) });
                                                    }}
                                                    className="w-full bg-transparent outline-none text-[11px] font-black text-indigo-600 text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                />
                                                <span className="text-[10px] font-bold text-slate-400 shrink-0">mm</span>
                                            </div>
                                        </div>
                                        <input
                                            type="range"
                                            min="3"
                                            max="30"
                                            step="1"
                                            value={toMm(catalog.headerHeight || 113.4)}
                                            onChange={(e) => updateProjectSettings({ headerHeight: toPx(parseInt(e.target.value)) })}
                                            className="w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-indigo-600 mb-2"
                                        />
                                    </div>
                                    <div className="space-y-1.5 pt-2">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Header Content</span>
                                        <div className="flex gap-2">
                                            {catalog.headerElements?.some(el => el.type === 'text') ? (
                                                <button
                                                    onClick={() => {
                                                        const textEl = catalog.headerElements.find(el => el.type === 'text');
                                                        if (textEl) setSelectedElementIds([textEl.id]);
                                                    }}
                                                    className="flex-1 flex items-center justify-center gap-2 p-2 bg-indigo-50 border border-indigo-100 rounded-xl hover:bg-indigo-100 hover:border-indigo-200 text-indigo-700 transition-all text-[11px] font-black uppercase tracking-tight"
                                                >
                                                    <Type size={14} /> Select Text
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => addHeaderElement({ id: `header-text-${Date.now()}`, type: 'text', x: (catalog.marginLeft || 0) + 10, y: catalog.marginTop || 0, width: 200, height: 30, text: 'New Text', fontSize: 14, fontFamily: 'Inter', fill: '#475569', fontWeight: 'bold', rotation: 0, opacity: 1, zIndex: 10, verticalAlign: 'middle' })}
                                                    className="flex-1 flex items-center justify-center gap-2 p-2 bg-slate-50 border border-slate-100 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all text-[11px] font-bold text-slate-600"
                                                >
                                                    <Type size={14} /> Add Text
                                                </button>
                                            )}
                                            <button
                                                onClick={() => {
                                                    addHeaderElement({ id: `header-img-${Date.now()}`, type: 'image', x: (catalog.marginLeft || 0) + 10, y: catalog.marginTop || 0, width: 80, height: 80, src: 'https://via.placeholder.com/150', rotation: 0, opacity: 1, zIndex: 10 });
                                                    setEditorTab('media');
                                                }}
                                                className="flex-1 flex items-center justify-center gap-2 p-2 bg-slate-50 border border-slate-100 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all text-[11px] font-bold text-slate-600"
                                            >
                                                <Image size={14} /> Add Image
                                            </button>
                                        </div>
                                        <p className="text-[10px] text-slate-400 leading-tight pt-1">
                                            Use master elements to maintain a consistent style across all your pages.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer Toggle */}
                        <div className="space-y-3 pt-2">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={catalog.hasFooter}
                                    onChange={(e) => updateProjectSettings({ hasFooter: e.target.checked })}
                                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                />
                                <span className={`text-xs font-bold leading-none ${uiTheme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Footer</span>
                            </label>
                            {catalog.hasFooter && (
                                <div className="ml-7 space-y-3 animate-in slide-in-from-top-1 duration-200">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">Height from bottom</span>
                                            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1 min-w-[70px]">
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
                                                    className="w-full bg-transparent outline-none text-[11px] font-black text-indigo-600 text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                />
                                                <span className="text-[10px] font-bold text-slate-400 shrink-0">mm</span>
                                            </div>
                                        </div>
                                        <input
                                            type="range"
                                            min="15"
                                            max="25"
                                            step="1"
                                            value={toMm(catalog.footerHeight || 75.6)}
                                            onChange={(e) => updateProjectSettings({ footerHeight: toPx(parseInt(e.target.value)) })}
                                            className="w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-indigo-600 mb-2"
                                        />
                                    </div>
                                    <div className="space-y-1.5 pt-2">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Footer Content</span>
                                        <div className="flex gap-2">
                                            {catalog.footerElements?.some(el => el.type === 'text') ? (
                                                <button
                                                    onClick={() => {
                                                        const textEl = catalog.footerElements.find(el => el.type === 'text');
                                                        if (textEl) setSelectedElementIds([textEl.id]);
                                                    }}
                                                    className="flex-1 flex items-center justify-center gap-2 p-2 bg-indigo-50 border border-indigo-100 rounded-xl hover:bg-indigo-100 hover:border-indigo-200 text-indigo-700 transition-all text-[11px] font-black uppercase tracking-tight"
                                                >
                                                    <Type size={14} /> Select Text
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => addFooterElement({ id: `footer-text-${Date.now()}`, type: 'text', x: (catalog.marginLeft || 0) + 10, y: PAGE_HEIGHT - (catalog.marginBottom || 0) - (catalog.footerHeight || 0), width: 200, height: 30, text: 'New Text', fontSize: 12, fontFamily: 'Inter', fill: '#64748b', rotation: 0, opacity: 1, zIndex: 10, verticalAlign: 'middle' })}
                                                    className="flex-1 flex items-center justify-center gap-2 p-2 bg-slate-50 border border-slate-100 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all text-[11px] font-bold text-slate-600"
                                                >
                                                    <Type size={14} /> Add Text
                                                </button>
                                            )}
                                            <button
                                                onClick={() => {
                                                    addFooterElement({ id: `footer-img-${Date.now()}`, type: 'image', x: (catalog.marginLeft || 0) + 10, y: PAGE_HEIGHT - (catalog.marginBottom || 0) - (catalog.footerHeight || 0), width: 80, height: 80, src: 'https://via.placeholder.com/150', rotation: 0, opacity: 1, zIndex: 10 });
                                                    setEditorTab('media');
                                                }}
                                                className="flex-1 flex items-center justify-center gap-2 p-2 bg-slate-50 border border-slate-100 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all text-[11px] font-bold text-slate-600"
                                            >
                                                <Image size={14} /> Add Image
                                            </button>
                                        </div>
                                    </div>

                                    {/* Page Number Controls */}
                                    <div className="space-y-3 pt-4 border-t border-slate-100">
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={catalog.footerElements?.some(el => el.type === 'text' && el.text?.toLowerCase().includes('{{page}}')) || false}
                                                onChange={(e) => {
                                                    const isChecked = e.target.checked;
                                                    const textEl = catalog.footerElements.find(el => el.type === 'text');
                                                    if (isChecked) {
                                                        if (textEl) {
                                                            const newText = textEl.text?.includes('{{page}}') ? textEl.text : (textEl.text + ' {{page}}');
                                                            updateFooterElement(textEl.id, { text: newText });
                                                        } else {
                                                            addFooterElement({
                                                                id: `footer-text-${Date.now()}`,
                                                                type: 'text',
                                                                x: (catalog.marginLeft || 0) + 10,
                                                                y: PAGE_HEIGHT - (catalog.marginBottom || 0) - (catalog.footerHeight || 0),
                                                                width: 200,
                                                                height: 30,
                                                                text: 'Page {{page}}',
                                                                fontSize: 10,
                                                                fontFamily: 'Inter',
                                                                fill: '#64748b',
                                                                rotation: 0,
                                                                opacity: 1,
                                                                zIndex: 10,
                                                                verticalAlign: 'middle'
                                                            });
                                                        }
                                                    } else if (textEl) {
                                                        const newText = textEl.text.replace(/\{\{page\}\}/gi, '').trim();
                                                        updateFooterElement(textEl.id, { text: newText || ' ' });
                                                    }
                                                    // Still update legacy for backward compatibility/dependencies
                                                    updateProjectSettings({ footerText: isChecked ? '{{page}}' : '' });
                                                }}
                                                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                            />
                                            <span className={`text-[11px] font-bold leading-none ${uiTheme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Show Page Numbers</span>
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Page Background Section */}
                <section className="space-y-4 pt-4 border-t border-slate-100">
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${uiTheme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-100/80'}`}>
                        <Palette size={14} className="text-indigo-600" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Page Background</span>
                    </div>

                    <div className="space-y-4 px-1">
                        {/* Current Page Color */}
                        <div className="flex gap-3">
                            <div
                                onClick={() => setPickerOpen(!pickerOpen)}
                                className="flex-1 p-3 rounded-[18px] border bg-white border-slate-100 shadow-sm flex items-center gap-3 cursor-pointer hover:border-indigo-200 transition-all"
                            >
                                <div
                                    className="w-10 h-10 rounded-xl shadow-sm border-2 border-slate-50"
                                    style={{ background: catalog.pages[currentPageIndex]?.backgroundColor || '#ffffff' }}
                                />
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Current Page Background</span>
                                    <span className="text-[11px] font-black text-slate-900 uppercase">
                                        {catalog.pages[currentPageIndex]?.backgroundColor || '#FFFFFF'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Picker Overlay */}
                        {pickerOpen && (
                            <div className="p-3 border rounded-2xl bg-white shadow-xl animate-in fade-in zoom-in-95 duration-200 relative z-50">
                                <AdvancedColorPicker
                                    color={catalog.pages[currentPageIndex]?.backgroundColor || '#ffffff'}
                                    onChange={(c) => setPageBackground(currentPageIndex, c)}
                                />
                            </div>
                        )}

                        {/* Apply to All Pages Button */}
                        <button
                            onClick={() => updateAllPageBackgrounds(catalog.pages[currentPageIndex]?.backgroundColor || '#ffffff')}
                            className="w-full py-4 px-6 rounded-[22px] bg-slate-900 text-white font-black text-[11px] uppercase tracking-[0.15em] shadow-xl shadow-slate-200/50 hover:bg-indigo-600 hover:shadow-indigo-200/50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-3 group"
                        >
                            <div className="p-1.5 rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors">
                                <Sparkles size={14} className="text-white animate-pulse" />
                            </div>
                            <span>Apply to All Pages</span>
                        </button>
                    </div>
                </section>

                {/* Margins Section */}
                <section className="space-y-4 pt-4 border-t border-slate-100">
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${uiTheme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-100/80'}`}>
                        <Settings size={14} className="text-indigo-600" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Margins</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 px-1">
                        <div className="space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase block">Top</span>
                            <div className="flex items-center bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 focus-within:border-indigo-200 transition-all">
                                <input
                                    type="number"
                                    value={toMm(catalog.marginTop || 0)}
                                    onChange={(e) => {
                                        const rawVal = e.target.value;
                                        const val = parseInt(rawVal);
                                        if (!isNaN(val)) updateProjectSettings({ marginTop: toPx(val) });
                                        else if (rawVal === '') updateProjectSettings({ marginTop: 0 });
                                    }}
                                    className="w-full bg-transparent outline-none text-xs font-black text-slate-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <span className="text-[10px] font-bold text-slate-400 ml-1">mm</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase block">Bottom</span>
                            <div className="flex items-center bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 focus-within:border-indigo-200 transition-all">
                                <input
                                    type="number"
                                    value={toMm(catalog.marginBottom || 0)}
                                    onChange={(e) => {
                                        const rawVal = e.target.value;
                                        const val = parseInt(rawVal);
                                        if (!isNaN(val)) updateProjectSettings({ marginBottom: toPx(val) });
                                        else if (rawVal === '') updateProjectSettings({ marginBottom: 0 });
                                    }}
                                    className="w-full bg-transparent outline-none text-xs font-black text-slate-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <span className="text-[10px] font-bold text-slate-400 ml-1">mm</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase block">Left</span>
                            <div className="flex items-center bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 focus-within:border-indigo-200 transition-all">
                                <input
                                    type="number"
                                    value={toMm(catalog.marginLeft || 0)}
                                    onChange={(e) => {
                                        const rawVal = e.target.value;
                                        const val = parseInt(rawVal);
                                        if (!isNaN(val)) updateProjectSettings({ marginLeft: toPx(val) });
                                        else if (rawVal === '') updateProjectSettings({ marginLeft: 0 });
                                    }}
                                    className="w-full bg-transparent outline-none text-xs font-black text-slate-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <span className="text-[10px] font-bold text-slate-400 ml-1">mm</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase block">Right</span>
                            <div className="flex items-center bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 focus-within:border-indigo-200 transition-all">
                                <input
                                    type="number"
                                    value={toMm(catalog.marginRight || 0)}
                                    onChange={(e) => {
                                        const rawVal = e.target.value;
                                        const val = parseInt(rawVal);
                                        if (!isNaN(val)) updateProjectSettings({ marginRight: toPx(val) });
                                        else if (rawVal === '') updateProjectSettings({ marginRight: 0 });
                                    }}
                                    className="w-full bg-transparent outline-none text-xs font-black text-slate-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <span className="text-[10px] font-bold text-slate-400 ml-1">mm</span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <div className={`p-4 rounded-2xl border border-dashed flex items-center gap-3 ${uiTheme === 'dark' ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'}`}>
                            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-lg">
                                <Settings size={14} />
                            </div>
                            <p className="text-[10px] font-bold text-indigo-900/80 leading-relaxed italic">
                                Changes applied here affect all existing and new pages in your project.
                            </p>
                        </div>
                    </div>
                </section>
            </div>

            {/* Footer Hint */}
            <div className={`p-6 border-t ${uiTheme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`}>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                    Global Configuration
                </div>
            </div>
        </div>
    );
};

export default ProjectSettingsPanel;
