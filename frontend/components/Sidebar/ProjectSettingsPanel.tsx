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

    const isDark = uiTheme === 'dark';

    // Sync local state when store changes
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

    const curPage = catalog.pages[currentPageIndex];
    const curPageBg = curPage?.backgroundColor || '#ffffff';

    return (
        <div className={`w-[320px] h-full flex flex-col border-l transition-colors duration-300 font-sans ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            {/* Header */}
            <div className={`px-5 py-4 border-b flex items-center justify-between ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
                        <Settings size={14} />
                    </div>
                    <div>
                        <h3 className={`text-xs font-black uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            Page Settings
                        </h3>
                        <p className={`text-[9px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Page {currentPageIndex + 1} of {catalog.pages.length}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setIsProjectSettingsOpen(false)}
                    className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                >
                    <X size={15} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
                {/* 1. Page Background Section */}
                <section className="space-y-3">
                    <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg ${isDark ? 'bg-slate-800/60' : 'bg-slate-100/70'}`}>
                        <Palette size={13} className="text-indigo-600 dark:text-indigo-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Page Background</span>
                    </div>

                    <div className="space-y-3 px-0.5">
                        {/* Current Page Color Card */}
                        <div
                            onClick={() => setPickerOpen(!pickerOpen)}
                            className={`p-2.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all hover:shadow-sm ${
                                isDark ? 'bg-slate-800/50 border-slate-700 hover:border-indigo-500/50' : 'bg-white border-slate-200 hover:border-indigo-300'
                            }`}
                        >
                            <div
                                className="w-8 h-8 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 shrink-0"
                                style={{ background: curPageBg }}
                            />
                            <div className="flex-1 min-w-0">
                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Current Page Color</span>
                                <span className={`text-xs font-mono font-bold uppercase ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                    {curPageBg}
                                </span>
                            </div>
                            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">Change</span>
                        </div>

                        {/* Palette quick-presets */}
                        <div className="flex items-center gap-1.5 pt-0.5">
                            {[
                                { color: '#ffffff', title: 'Pure White' },
                                { color: '#f8fafc', title: 'Off White' },
                                { color: '#0f172a', title: 'Navy Slate' },
                                { color: '#18181b', title: 'Zinc Black' },
                                { color: '#fef2f2', title: 'Soft Rose' },
                                { color: '#eff6ff', title: 'Soft Blue' },
                                { color: '#f0fdf4', title: 'Soft Mint' },
                            ].map((preset) => (
                                <button
                                    key={preset.color}
                                    onClick={() => setPageBackground(currentPageIndex, preset.color)}
                                    className={`w-6 h-6 rounded-full border shadow-sm transition-transform hover:scale-110 ${
                                        curPageBg.toLowerCase() === preset.color.toLowerCase() ? 'ring-2 ring-indigo-600 ring-offset-1' : 'border-slate-300 dark:border-slate-600'
                                    }`}
                                    style={{ backgroundColor: preset.color }}
                                    title={preset.title}
                                />
                            ))}
                        </div>

                        {/* Picker Overlay */}
                        {pickerOpen && (
                            <div className={`p-3 border rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 relative z-50 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                                <AdvancedColorPicker
                                    color={curPageBg}
                                    onChange={(c) => setPageBackground(currentPageIndex, c)}
                                />
                            </div>
                        )}

                        {/* Apply to All Pages Button */}
                        <button
                            onClick={() => updateAllPageBackgrounds(curPageBg)}
                            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white font-bold text-[10px] uppercase tracking-wider shadow-md hover:bg-indigo-600 dark:hover:bg-indigo-700 hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
                        >
                            <Sparkles size={12} />
                            <span>Apply Color to All Pages</span>
                        </button>
                    </div>
                </section>

                {/* 2. Headers & Footers Section */}
                <section className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg ${isDark ? 'bg-slate-800/60' : 'bg-slate-100/70'}`}>
                        <Layout size={13} className="text-indigo-600 dark:text-indigo-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Headers & Footers</span>
                    </div>

                    <div className="space-y-4 px-0.5">
                        {/* Header Controls */}
                        <div className={`p-3 rounded-xl border transition-all ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50/70 border-slate-200'}`}>
                            <label className="flex items-center justify-between cursor-pointer">
                                <span className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Enable Header</span>
                                <input
                                    type="checkbox"
                                    checked={catalog.hasHeader}
                                    onChange={(e) => updateProjectSettings({ hasHeader: e.target.checked })}
                                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                />
                            </label>

                            {catalog.hasHeader && (
                                <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 space-y-3 animate-in fade-in duration-200">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase">Height from top</span>
                                        <div className={`flex items-center gap-1 border rounded-lg px-2 py-0.5 w-16 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
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
                                                className="w-full bg-transparent outline-none text-[11px] font-bold text-indigo-600 dark:text-indigo-400 text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            />
                                            <span className="text-[9px] font-medium text-slate-400">mm</span>
                                        </div>
                                    </div>
                                    <input
                                        type="range"
                                        min="3"
                                        max="30"
                                        step="1"
                                        value={toMm(catalog.headerHeight || 113.4)}
                                        onChange={(e) => updateProjectSettings({ headerHeight: toPx(parseInt(e.target.value)) })}
                                        className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                    />

                                    {/* Action buttons */}
                                    <div className="flex gap-2 pt-1">
                                        {catalog.headerElements?.some(el => el.type === 'text') ? (
                                            <button
                                                onClick={() => {
                                                    const textEl = catalog.headerElements.find(el => el.type === 'text');
                                                    if (textEl) setSelectedElementIds([textEl.id]);
                                                }}
                                                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 rounded-lg text-indigo-600 dark:text-indigo-300 text-[10px] font-bold hover:bg-indigo-100 transition-colors"
                                            >
                                                <Type size={12} /> Select Text
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => addHeaderElement({ id: `header-text-${Date.now()}`, type: 'text', x: (catalog.marginLeft || 0) + 10, y: catalog.marginTop || 0, width: 200, height: 30, text: 'New Text', fontSize: 14, fontFamily: 'Inter', fill: '#475569', fontWeight: 'bold', rotation: 0, opacity: 1, zIndex: 10, verticalAlign: 'middle' })}
                                                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 border rounded-lg text-[10px] font-bold transition-colors ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                                            >
                                                <Type size={12} /> Add Text
                                            </button>
                                        )}
                                        <button
                                            onClick={() => {
                                                addHeaderElement({ id: `header-img-${Date.now()}`, type: 'image', x: (catalog.marginLeft || 0) + 10, y: catalog.marginTop || 0, width: 80, height: 80, src: 'https://via.placeholder.com/150', rotation: 0, opacity: 1, zIndex: 10 });
                                                setEditorTab('media');
                                            }}
                                            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 border rounded-lg text-[10px] font-bold transition-colors ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                                        >
                                            <Image size={12} /> Add Image
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer Controls */}
                        <div className={`p-3 rounded-xl border transition-all ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50/70 border-slate-200'}`}>
                            <label className="flex items-center justify-between cursor-pointer">
                                <span className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Enable Footer</span>
                                <input
                                    type="checkbox"
                                    checked={catalog.hasFooter}
                                    onChange={(e) => updateProjectSettings({ hasFooter: e.target.checked })}
                                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                />
                            </label>

                            {catalog.hasFooter && (
                                <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 space-y-3 animate-in fade-in duration-200">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase">Height from bottom</span>
                                        <div className={`flex items-center gap-1 border rounded-lg px-2 py-0.5 w-16 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
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
                                                className="w-full bg-transparent outline-none text-[11px] font-bold text-indigo-600 dark:text-indigo-400 text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            />
                                            <span className="text-[9px] font-medium text-slate-400">mm</span>
                                        </div>
                                    </div>
                                    <input
                                        type="range"
                                        min="15"
                                        max="25"
                                        step="1"
                                        value={toMm(catalog.footerHeight || 75.6)}
                                        onChange={(e) => updateProjectSettings({ footerHeight: toPx(parseInt(e.target.value)) })}
                                        className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                    />

                                    {/* Footer content buttons */}
                                    <div className="flex gap-2 pt-1">
                                        {catalog.footerElements?.some(el => el.type === 'text') ? (
                                            <button
                                                onClick={() => {
                                                    const textEl = catalog.footerElements.find(el => el.type === 'text');
                                                    if (textEl) setSelectedElementIds([textEl.id]);
                                                }}
                                                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 rounded-lg text-indigo-600 dark:text-indigo-300 text-[10px] font-bold hover:bg-indigo-100 transition-colors"
                                            >
                                                <Type size={12} /> Select Text
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => addFooterElement({ id: `footer-text-${Date.now()}`, type: 'text', x: (catalog.marginLeft || 0) + 10, y: PAGE_HEIGHT - (catalog.marginBottom || 0) - (catalog.footerHeight || 0), width: 200, height: 30, text: 'New Text', fontSize: 12, fontFamily: 'Inter', fill: '#64748b', rotation: 0, opacity: 1, zIndex: 10, verticalAlign: 'middle' })}
                                                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 border rounded-lg text-[10px] font-bold transition-colors ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                                            >
                                                <Type size={12} /> Add Text
                                            </button>
                                        )}
                                        <button
                                            onClick={() => {
                                                addFooterElement({ id: `footer-img-${Date.now()}`, type: 'image', x: (catalog.marginLeft || 0) + 10, y: PAGE_HEIGHT - (catalog.marginBottom || 0) - (catalog.footerHeight || 0), width: 80, height: 80, src: 'https://via.placeholder.com/150', rotation: 0, opacity: 1, zIndex: 10 });
                                                setEditorTab('media');
                                            }}
                                            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 border rounded-lg text-[10px] font-bold transition-colors ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                                        >
                                            <Image size={12} /> Add Image
                                        </button>
                                    </div>

                                    {/* Page Number Toggle */}
                                    <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                                        <span className={`text-[11px] font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Show Page Numbers</span>
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
                                                updateProjectSettings({ footerText: isChecked ? '{{page}}' : '' });
                                            }}
                                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                        />
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* 3. Global Typography & Product Cards Section */}
                <section className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg ${isDark ? 'bg-slate-800/60' : 'bg-slate-100/70'}`}>
                        <Type size={13} className="text-indigo-600 dark:text-indigo-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Global Typography & Styles</span>
                    </div>

                    <div className="space-y-3 px-0.5">
                        {/* Global Font Family Selector */}
                        <div className="space-y-1.5">
                            <span className="text-[9px] font-bold text-slate-400 uppercase block">Global Font Family</span>
                            <div className="relative">
                                <select
                                    onChange={(e) => {
                                        if (e.target.value) {
                                            useStore.getState().applyGlobalProductCardStyle({ fontFamily: e.target.value });
                                        }
                                    }}
                                    className={`w-full appearance-none border rounded-xl px-3 py-2 text-xs font-bold outline-none transition-all ${
                                        isDark ? 'bg-slate-800 border-slate-700 text-white hover:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-indigo-300'
                                    }`}
                                    defaultValue=""
                                >
                                    <option value="" disabled>Change Font on All Pages...</option>
                                    {CATEGORIZED_FONTS.map(group => (
                                        <optgroup key={group.label} label={group.label}>
                                            {group.fonts.map(f => (
                                                <option key={f} value={f}>{f}</option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Global Product Card Theme */}
                        <div className="space-y-1.5">
                            <span className="text-[9px] font-bold text-slate-400 uppercase block">Product Card Style</span>
                            <div className="grid grid-cols-2 gap-1.5">
                                {[
                                    { id: 'classic-stack', label: 'Classic Stack' },
                                    { id: 'minimal-pill', label: 'Minimal Pill' },
                                    { id: 'split-row', label: 'Split Row' },
                                    { id: 'specs-table', label: 'Spec Sheet' }
                                ].map(theme => (
                                    <button
                                        key={theme.id}
                                        onClick={() => useStore.getState().applyGlobalProductCardStyle({ cardTheme: theme.id })}
                                        className={`p-2 rounded-xl border text-[10px] font-bold text-center transition-all ${
                                            isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-indigo-600 hover:text-white hover:border-indigo-600' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600'
                                        }`}
                                    >
                                        {theme.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. Page Margins Section */}
                <section className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg ${isDark ? 'bg-slate-800/60' : 'bg-slate-100/70'}`}>
                        <Settings size={13} className="text-indigo-600 dark:text-indigo-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Page Margins</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 px-0.5">
                        {[
                            { label: 'Top', val: catalog.marginTop || 0, key: 'marginTop' },
                            { label: 'Bottom', val: catalog.marginBottom || 0, key: 'marginBottom' },
                            { label: 'Left', val: catalog.marginLeft || 0, key: 'marginLeft' },
                            { label: 'Right', val: catalog.marginRight || 0, key: 'marginRight' },
                        ].map((m) => (
                            <div key={m.label} className="space-y-1">
                                <span className="text-[9px] font-bold text-slate-400 uppercase block">{m.label}</span>
                                <div className={`flex items-center border rounded-xl px-2.5 py-1.5 transition-all ${
                                    isDark ? 'bg-slate-800 border-slate-700 focus-within:border-indigo-500' : 'bg-slate-50 border-slate-200 focus-within:border-indigo-300'
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
                                            isDark ? 'text-white' : 'text-slate-800'
                                        }`}
                                    />
                                    <span className="text-[9px] font-bold text-slate-400 ml-1">mm</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* Footer Status */}
            <div className={`px-5 py-3 border-t text-center ${isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-100 bg-slate-50/60'}`}>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    Global Page Configuration
                </span>
            </div>
        </div>
    );
};

export default ProjectSettingsPanel;
