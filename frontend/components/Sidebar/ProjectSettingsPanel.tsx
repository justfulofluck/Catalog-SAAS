import React, { useState } from 'react';
import {
    X, Settings, Sparkles, Palette, Type, ChevronDown
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { FONTS, CATEGORIZED_FONTS, PX_PER_MM } from '../../constants';
import AdvancedColorPicker from '../Properties/AdvancedColorPicker';

const toMm = (px: number) => Math.round(px / PX_PER_MM);
const toPx = (mm: number) => Math.round(mm * PX_PER_MM);

const ProjectSettingsPanel: React.FC = () => {
    const {
        catalog,
        updateProjectSettings,
        isProjectSettingsOpen,
        setIsProjectSettingsOpen,
        currentPageIndex,
        setPageBackground,
        updateAllPageBackgrounds,
        uiTheme
    } = useStore();

    const isDark = uiTheme === 'dark';
    const [pickerOpen, setPickerOpen] = useState(false);

    if (!isProjectSettingsOpen) return null;

    const curPage = catalog.pages[currentPageIndex];
    const curPageBg = curPage?.backgroundColor || '#ffffff';

    return (
        <div className={`w-[320px] h-full flex flex-col border-l font-sans transition-colors ${
            isDark ? 'border-[#262626] bg-[#161616] text-[#F1F1F1]' : 'border-slate-200 bg-white text-slate-800'
        }`}>
            {/* Header */}
            <div className={`px-5 py-4 border-b flex items-center justify-between ${
                isDark ? 'border-[#262626]' : 'border-slate-100'
            }`}>
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-[4px] bg-[#0F3D3E] flex items-center justify-center text-[#F1F1F1] shadow-sm border border-[#E2DCC8]/20">
                        <Settings size={14} />
                    </div>
                    <div>
                        <h3 className={`text-xs font-black uppercase tracking-wider ${
                            isDark ? 'text-[#F1F1F1]' : 'text-slate-900'
                        }`}>
                            Page Settings
                        </h3>
                        <p className={`text-[9px] font-medium ${isDark ? 'text-[#888888]' : 'text-slate-500'}`}>
                            Page {currentPageIndex + 1} of {catalog.pages.length}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setIsProjectSettingsOpen(false)}
                    className={`p-1.5 rounded-[4px] transition-colors ${
                        isDark ? 'text-[#888888] hover:text-[#F1F1F1] hover:bg-[#0F3D3E]/20' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
                    }`}
                >
                    <X size={15} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
                {/* 1. Page Background Section */}
                <section className="space-y-3">
                    <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-[4px] ${
                        isDark ? 'bg-[#222222]' : 'bg-slate-100'
                    }`}>
                        <Palette size={13} className={isDark ? "text-[#E2DCC8]" : "text-[#0F3D3E]"} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${
                            isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'
                        }`}>Page Background</span>
                    </div>

                    <button
                        onClick={() => {
                            useStore.getState().openColorPicker({
                                type: 'background',
                                color: curPageBg,
                                title: 'Page Background'
                            });
                        }}
                        className={`w-full p-3 rounded-[4px] border flex items-center justify-between cursor-pointer transition-all hover:shadow-md ${
                            isDark 
                                ? 'border-[#262626] bg-[#1a1a1a] hover:border-[#0F3D3E]' 
                                : 'border-slate-200 bg-slate-50 hover:border-[#0F3D3E]'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className="w-7 h-7 rounded-[4px] shadow-sm border border-[#333] shrink-0"
                                style={{ background: curPageBg }}
                            />
                            <div className="text-left">
                                <span className="text-[8px] font-bold text-[#888888] uppercase tracking-wider block">Current Color</span>
                                <span className={`text-xs font-mono font-bold uppercase ${isDark ? 'text-[#F1F1F1]' : 'text-slate-900'}`}>
                                    {curPageBg}
                                </span>
                            </div>
                        </div>
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-[#0F3D3E] text-white uppercase tracking-wider shadow-sm">
                            Open Studio
                        </span>
                    </button>
                </section>

                {/* 2. Global Typography & Product Cards Section */}
                <section className={`space-y-3 pt-4 border-t ${isDark ? 'border-[#262626]' : 'border-slate-100'}`}>
                    <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-[4px] ${
                        isDark ? 'bg-[#222222]' : 'bg-slate-100'
                    }`}>
                        <Type size={13} className={isDark ? "text-[#E2DCC8]" : "text-[#0F3D3E]"} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${
                            isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'
                        }`}>Global Typography & Styles</span>
                    </div>

                    <div className="space-y-3 px-0.5">
                        {/* Global Font Family Selector */}
                        <div className="space-y-1.5">
                            <span className="text-[9px] font-bold text-[#888888] uppercase block">Global Font Family</span>
                            <div className="relative">
                                <select
                                    value={catalog.fontFamily || ''}
                                    onChange={(e) => {
                                        if (e.target.value) {
                                            useStore.getState().applyGlobalProductCardStyle({ fontFamily: e.target.value });
                                        }
                                    }}
                                    className={`w-full appearance-none border rounded-[4px] px-3 py-2 text-xs font-bold outline-none transition-all hover:border-[#0F3D3E] focus:border-[#0F3D3E] ${
                                        isDark 
                                            ? 'border-[#262626] bg-[#1a1a1a] text-[#F1F1F1]' 
                                            : 'border-slate-200 bg-slate-50 text-slate-800'
                                    }`}
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
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888888] pointer-events-none" />
                            </div>
                        </div>

                        {/* Global Product Card Theme */}
                        <div className="space-y-1.5">
                            <span className="text-[9px] font-bold text-[#888888] uppercase block">Product Card Style</span>
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
                                        className={`p-2 rounded-[4px] border text-[10px] font-bold text-center transition-all hover:bg-[#0F3D3E] hover:text-[#F1F1F1] hover:border-[#0F3D3E] ${
                                            isDark 
                                                ? 'border-[#262626] bg-[#1a1a1a] text-[#cccccc]' 
                                                : 'border-slate-200 bg-slate-50 text-slate-700'
                                        }`}
                                    >
                                        {theme.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. Page Margins Section */}
                <section className={`space-y-3 pt-4 border-t ${isDark ? 'border-[#262626]' : 'border-slate-100'}`}>
                    <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-[4px] ${
                        isDark ? 'bg-[#222222]' : 'bg-slate-100'
                    }`}>
                        <Settings size={13} className={isDark ? "text-[#E2DCC8]" : "text-[#0F3D3E]"} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${
                            isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'
                        }`}>Page Margins</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 px-0.5">
                        {[
                            { label: 'Top', val: catalog.marginTop || 0, key: 'marginTop' },
                            { label: 'Bottom', val: catalog.marginBottom || 0, key: 'marginBottom' },
                            { label: 'Left', val: catalog.marginLeft || 0, key: 'marginLeft' },
                            { label: 'Right', val: catalog.marginRight || 0, key: 'marginRight' },
                        ].map((m) => (
                            <div key={m.label} className="space-y-1">
                                <span className="text-[9px] font-bold text-[#888888] uppercase block">{m.label}</span>
                                <div className={`flex items-center border rounded-[4px] px-2.5 py-1.5 transition-all focus-within:border-[#0F3D3E] ${
                                    isDark ? 'border-[#262626] bg-[#1a1a1a]' : 'border-slate-200 bg-slate-50'
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
                </section>
            </div>

            {/* Footer Status */}
            <div className={`px-5 py-3 border-t text-center transition-colors ${
                isDark ? 'border-[#262626] bg-[#161616]' : 'border-slate-100 bg-slate-50'
            }`}>
                <span className="text-[9px] font-bold text-[#888888] uppercase tracking-widest">
                    Global Page Configuration
                </span>
            </div>
        </div>
    );
};

export default ProjectSettingsPanel;
