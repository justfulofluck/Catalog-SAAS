import React from 'react';
import {
    X, Settings, Layout, MousePointer2, ChevronDown, ChevronRight,
    CornerRightDown, CornerRightUp, Palette, Type,
    AlignLeft, AlignCenter, AlignRight, Sparkles, Image, Hash
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { PX_PER_MM, FONTS, CATEGORIZED_FONTS, PAGE_HEIGHT } from '../../constants';

const ProjectSettingsPanel: React.FC = () => {
    const {
        catalog,
        updateProjectSettings,
        isProjectSettingsOpen,
        setIsProjectSettingsOpen,
        uiTheme,
        setEditorTab,
        addHeaderElement,
        addFooterElement
    } = useStore();

    const [localHeaderMm, setLocalHeaderMm] = React.useState<string>('');
    const [localFooterMm, setLocalFooterMm] = React.useState<string>('');

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
                                    <div className="space-y-1.5">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Header Text</span>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={catalog.headerText || ''}
                                                onChange={(e) => updateProjectSettings({ headerText: e.target.value })}
                                                placeholder="Company Name / Catalog Title"
                                                className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-indigo-100 placeholder:text-slate-300 transition-all"
                                            />
                                            <button
                                                onClick={() => addHeaderElement({ id: `header-text-${Date.now()}`, type: 'text', x: 60, y: 10, width: 200, height: 30, text: 'Header Text', fontSize: 14, fontFamily: 'Inter', fill: '#475569', fontWeight: 'bold', rotation: 0, opacity: 1, zIndex: 10 })}
                                                title="Add Text Box"
                                                className="p-2 bg-slate-50 border border-slate-100 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all"
                                            >
                                                <Type size={14} />
                                            </button>
                                            <button
                                                onClick={() => setEditorTab('media')}
                                                title="Add Image"
                                                className="p-2 bg-slate-50 border border-slate-100 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all"
                                            >
                                                <Image size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Granular Header Controls */}
                                    <div className="pt-2 grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">Font Family</span>
                                            <select
                                                value={catalog.headerFontFamily || 'Inter'}
                                                onChange={(e) => updateProjectSettings({ headerFontFamily: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-2 py-2.5 text-[10px] font-bold text-slate-700 outline-none focus:border-indigo-100 appearance-none"
                                            >
                                                {CATEGORIZED_FONTS.map(group => (
                                                    <optgroup key={group.label} label={group.label}>
                                                        {group.fonts.map(f => (
                                                            <option key={f} value={f}>{f}</option>
                                                        ))}
                                                    </optgroup>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">Alignment</span>
                                            <div className="flex bg-slate-50 rounded-xl p-1 border border-slate-100">
                                                {(['left', 'center', 'right'] as const).map(a => (
                                                    <button
                                                        key={a}
                                                        onClick={() => updateProjectSettings({ headerTextAlignment: a })}
                                                        className={`flex-1 flex items-center justify-center p-1 rounded-lg transition-all ${catalog.headerTextAlignment === a ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                                                    >
                                                        {a === 'left' && <AlignLeft size={12} />}
                                                        {a === 'center' && <AlignCenter size={12} />}
                                                        {a === 'right' && <AlignRight size={12} />}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">Font Size</span>
                                            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1 min-w-[70px]">
                                                <input
                                                    type="number"
                                                    min="6"
                                                    max="72"
                                                    value={catalog.headerFontSize || 12}
                                                    onChange={(e) => updateProjectSettings({ headerFontSize: parseInt(e.target.value) || 12 })}
                                                    className="w-full bg-transparent outline-none text-[11px] font-black text-indigo-600 text-right"
                                                />
                                                <span className="text-[10px] font-bold text-slate-400 shrink-0">px</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5 pt-1">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Color</span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {['#475569', '#000000', '#ffffff', '#4f46e5', '#ef4444', '#10b981', '#f59e0b'].map(color => (
                                                <button
                                                    key={color}
                                                    onClick={() => updateProjectSettings({ headerColor: color })}
                                                    className={`w-5 h-5 rounded-full border border-slate-200 transition-all ${catalog.headerColor === color ? 'ring-2 ring-indigo-500 ring-offset-1 scale-110' : 'hover:scale-105'}`}
                                                    style={{ backgroundColor: color }}
                                                />
                                            ))}
                                            <div className="relative flex-1 min-w-[60px]">
                                                <input
                                                    type="text"
                                                    value={catalog.headerColor || '#475569'}
                                                    onChange={(e) => updateProjectSettings({ headerColor: e.target.value })}
                                                    className="w-full h-5 bg-slate-50 border border-slate-200 rounded text-[9px] px-1 font-mono uppercase text-slate-600"
                                                />
                                            </div>
                                        </div>
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
                                    <div className="space-y-1.5">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Footer Text</span>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={catalog.footerText || ''}
                                                onChange={(e) => updateProjectSettings({ footerText: e.target.value })}
                                                placeholder="Company Address / Legal Text"
                                                className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-indigo-100 placeholder:text-slate-300 transition-all"
                                            />
                                            <button
                                                onClick={() => addFooterElement({ id: `footer-text-${Date.now()}`, type: 'text', x: 60, y: PAGE_HEIGHT - 60, width: 200, height: 30, text: 'Footer Text', fontSize: 12, fontFamily: 'Inter', fill: '#64748b', rotation: 0, opacity: 1, zIndex: 10 })}
                                                title="Add Text Box"
                                                className="p-2 bg-slate-50 border border-slate-100 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all"
                                            >
                                                <Type size={14} />
                                            </button>
                                            <button
                                                onClick={() => updateProjectSettings({ footerText: (catalog.footerText || '') + ' {{page}}' })}
                                                title="Add Page Number"
                                                className="p-2 bg-slate-50 border border-slate-100 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all"
                                            >
                                                <Hash size={14} />
                                            </button>
                                            <button
                                                onClick={() => setEditorTab('media')}
                                                title="Add Image"
                                                className="p-2 bg-slate-50 border border-slate-100 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all"
                                            >
                                                <Image size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Page Number Position */}
                                    <div className="space-y-1.5 pt-2">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Page Number Position</span>
                                        <div className="flex bg-slate-50 rounded-xl p-1 border border-slate-100">
                                            <button
                                                onClick={() => updateProjectSettings({ pageNumberAlignment: 'left' })}
                                                className={`flex-1 flex items-center justify-center p-2 rounded-lg transition-all text-[10px] font-bold uppercase ${catalog.pageNumberAlignment === 'left' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                                            >
                                                Bottom Left
                                            </button>
                                            <button
                                                onClick={() => updateProjectSettings({ pageNumberAlignment: 'right' })}
                                                className={`flex-1 flex items-center justify-center p-2 rounded-lg transition-all text-[10px] font-bold uppercase ${catalog.pageNumberAlignment === 'right' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                                            >
                                                Bottom Right
                                            </button>
                                        </div>
                                    </div>

                                    {/* Granular Footer Controls */}
                                    <div className="pt-2 grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">Font Family</span>
                                            <select
                                                value={catalog.footerFontFamily || 'Inter'}
                                                onChange={(e) => updateProjectSettings({ footerFontFamily: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-2 py-2 text-[10px] font-bold text-slate-700 outline-none focus:border-indigo-100"
                                            >
                                                {CATEGORIZED_FONTS.map(group => (
                                                    <optgroup key={group.label} label={group.label}>
                                                        {group.fonts.map(f => (
                                                            <option key={f} value={f}>{f}</option>
                                                        ))}
                                                    </optgroup>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">Alignment</span>
                                            <div className="flex bg-slate-50 rounded-xl p-1 border border-slate-100">
                                                {(['left', 'center', 'right'] as const).map(a => (
                                                    <button
                                                        key={a}
                                                        onClick={() => updateProjectSettings({ footerTextAlignment: a })}
                                                        className={`flex-1 flex items-center justify-center p-1 rounded-lg transition-all ${catalog.footerTextAlignment === a ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                                                    >
                                                        {a === 'left' && <AlignLeft size={12} />}
                                                        {a === 'center' && <AlignCenter size={12} />}
                                                        {a === 'right' && <AlignRight size={12} />}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">Font Size</span>
                                            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1 min-w-[70px]">
                                                <input
                                                    type="number"
                                                    min="6"
                                                    max="72"
                                                    value={catalog.footerFontSize || 10}
                                                    onChange={(e) => updateProjectSettings({ footerFontSize: parseInt(e.target.value) || 10 })}
                                                    className="w-full bg-transparent outline-none text-[11px] font-black text-indigo-600 text-right"
                                                />
                                                <span className="text-[10px] font-bold text-slate-400 shrink-0">px</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5 pt-1">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Color</span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {['#64748b', '#000000', '#ffffff', '#4f46e5', '#ef4444', '#10b981', '#f59e0b'].map(color => (
                                                <button
                                                    key={color}
                                                    onClick={() => updateProjectSettings({ footerColor: color })}
                                                    className={`w-5 h-5 rounded-full border border-slate-200 transition-all ${catalog.footerColor === color ? 'ring-2 ring-indigo-500 ring-offset-1 scale-110' : 'hover:scale-105'}`}
                                                    style={{ backgroundColor: color }}
                                                />
                                            ))}
                                            <div className="relative flex-1 min-w-[60px]">
                                                <input
                                                    type="text"
                                                    value={catalog.footerColor || '#64748b'}
                                                    onChange={(e) => updateProjectSettings({ footerColor: e.target.value })}
                                                    className="w-full h-5 bg-slate-50 border border-slate-200 rounded text-[9px] px-1 font-mono uppercase text-slate-600"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
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
