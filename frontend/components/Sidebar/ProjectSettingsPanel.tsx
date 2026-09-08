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
        updateAllPageBackgrounds
    } = useStore();

    const [pickerOpen, setPickerOpen] = useState(false);

    if (!isProjectSettingsOpen) return null;

    const curPage = catalog.pages[currentPageIndex];
    const curPageBg = curPage?.backgroundColor || '#ffffff';

    return (
        <div className="w-[320px] h-full flex flex-col border-l border-[#262626] bg-[#161616] text-[#F1F1F1] font-sans">
            {/* Header */}
            <div className="px-5 py-4 border-b border-[#262626] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-[4px] bg-[#0F3D3E] flex items-center justify-center text-[#F1F1F1] shadow-sm border border-[#E2DCC8]/20">
                        <Settings size={14} />
                    </div>
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-wider text-[#F1F1F1]">
                            Page Settings
                        </h3>
                        <p className="text-[9px] font-medium text-[#888888]">
                            Page {currentPageIndex + 1} of {catalog.pages.length}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setIsProjectSettingsOpen(false)}
                    className="p-1.5 rounded-[4px] text-[#888888] hover:text-[#F1F1F1] hover:bg-[#0F3D3E]/20 transition-colors"
                >
                    <X size={15} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
                {/* 1. Page Background Section */}
                <section className="space-y-3">
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-[4px] bg-[#222222]">
                        <Palette size={13} className="text-[#E2DCC8]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#E2DCC8]">Page Background</span>
                    </div>

                    <div className="space-y-3 px-0.5">
                        {/* Current Page Color Card */}
                        <div
                            onClick={() => setPickerOpen(!pickerOpen)}
                            className="p-2.5 rounded-[4px] border border-[#262626] bg-[#1a1a1a] hover:border-[#0F3D3E] flex items-center gap-3 cursor-pointer transition-all hover:shadow-sm"
                        >
                            <div
                                className="w-8 h-8 rounded-[4px] shadow-sm border border-[#333333] shrink-0"
                                style={{ background: curPageBg }}
                            />
                            <div className="flex-1 min-w-0">
                                <span className="text-[8px] font-bold text-[#888888] uppercase tracking-wider block">Current Page Color</span>
                                <span className="text-xs font-mono font-bold uppercase text-[#F1F1F1]">
                                    {curPageBg}
                                </span>
                            </div>
                            <span className="text-[10px] font-bold text-[#E2DCC8]">Change</span>
                        </div>

                        {/* Palette quick-presets */}
                        <div className="flex items-center gap-1.5 pt-0.5">
                            {[
                                { color: '#ffffff', title: 'Pure White' },
                                { color: '#f8fafc', title: 'Off White' },
                                { color: '#100F0F', title: 'Obsidian' },
                                { color: '#0F3D3E', title: 'Pine Teal' },
                                { color: '#E2DCC8', title: 'Warm Sand' },
                                { color: '#18181b', title: 'Zinc Black' },
                                { color: '#eff6ff', title: 'Soft Blue' },
                            ].map((preset) => (
                                <button
                                    key={preset.color}
                                    onClick={() => setPageBackground(currentPageIndex, preset.color)}
                                    className={`w-6 h-6 rounded-full border shadow-sm transition-transform hover:scale-110 ${
                                        curPageBg.toLowerCase() === preset.color.toLowerCase() ? 'ring-2 ring-[#0F3D3E] ring-offset-1' : 'border-[#333333]'
                                    }`}
                                    style={{ backgroundColor: preset.color }}
                                    title={preset.title}
                                />
                            ))}
                        </div>

                        {/* Picker Overlay */}
                        {pickerOpen && (
                            <div className="p-3 border rounded-[4px] shadow-2xl animate-in fade-in zoom-in-95 duration-200 relative z-50 bg-[#1a1a1a] border-[#262626]">
                                <AdvancedColorPicker
                                    color={curPageBg}
                                    onChange={(c) => setPageBackground(currentPageIndex, c)}
                                />
                            </div>
                        )}

                        {/* Apply to All Pages Button */}
                        <button
                            onClick={() => updateAllPageBackgrounds(curPageBg)}
                            className="w-full py-2.5 px-4 rounded-[4px] bg-[#0F3D3E] hover:bg-[#155455] text-[#F1F1F1] border border-[#E2DCC8]/30 font-bold text-[10px] uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
                        >
                            <Sparkles size={12} />
                            <span>Apply Color to All Pages</span>
                        </button>
                    </div>
                </section>

                {/* 2. Global Typography & Product Cards Section */}
                <section className="space-y-3 pt-4 border-t border-[#262626]">
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-[4px] bg-[#222222]">
                        <Type size={13} className="text-[#E2DCC8]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#E2DCC8]">Global Typography & Styles</span>
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
                                    className="w-full appearance-none border border-[#262626] rounded-[4px] px-3 py-2 text-xs font-bold outline-none transition-all bg-[#1a1a1a] text-[#F1F1F1] hover:border-[#0F3D3E] focus:border-[#0F3D3E]"
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
                                        className="p-2 rounded-[4px] border border-[#262626] text-[10px] font-bold text-center transition-all bg-[#1a1a1a] text-[#cccccc] hover:bg-[#0F3D3E] hover:text-[#F1F1F1] hover:border-[#0F3D3E]"
                                    >
                                        {theme.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. Page Margins Section */}
                <section className="space-y-3 pt-4 border-t border-[#262626]">
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-[4px] bg-[#222222]">
                        <Settings size={13} className="text-[#E2DCC8]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#E2DCC8]">Page Margins</span>
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
                                <div className="flex items-center border border-[#262626] rounded-[4px] px-2.5 py-1.5 transition-all bg-[#1a1a1a] focus-within:border-[#0F3D3E]">
                                    <input
                                        type="number"
                                        value={toMm(m.val)}
                                        onChange={(e) => {
                                            const rawVal = e.target.value;
                                            const val = parseInt(rawVal);
                                            if (!isNaN(val)) updateProjectSettings({ [m.key]: toPx(val) });
                                            else if (rawVal === '') updateProjectSettings({ [m.key]: 0 });
                                        }}
                                        className="w-full bg-transparent outline-none text-xs font-bold text-[#F1F1F1] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                    <span className="text-[9px] font-bold text-[#888888] ml-1">mm</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* Footer Status */}
            <div className="px-5 py-3 border-t border-[#262626] text-center bg-[#161616]">
                <span className="text-[9px] font-bold text-[#888888] uppercase tracking-widest">
                    Global Page Configuration
                </span>
            </div>
        </div>
    );
};

export default ProjectSettingsPanel;
