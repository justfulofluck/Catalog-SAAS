import React, { useState, useRef, useEffect } from 'react';
import {
    Bold, Italic, Underline,
    Minus, Plus,
    AlignLeft, AlignCenter, AlignRight,
    ChevronDown, ChevronUp,
    Search, Sliders,
    Wand2,
    GripVertical,
    Layers, ArrowUpToLine, ArrowDownToLine,
    Trash2
} from 'lucide-react';
import { CanvasElement } from '../../types';
import { CATEGORIZED_FONTS } from '../../constants';
import { useStore } from '../../store/useStore';
import { toggleStyle } from '../../utils/textStyleSelection';
import AdvancedColorPicker from '../Properties/AdvancedColorPicker';

interface Props {
    element: CanvasElement;
    onUpdate: (updates: Partial<CanvasElement>) => void;
    zoom: number;
}

const Divider = () => <div className="w-[1px] h-5 bg-[#E2DCC8]/20 mx-1 shrink-0" />;

export const FloatingTextToolbar: React.FC<Props> = ({ element, onUpdate, zoom }) => {
    const setIsPropertyPanelOpen = useStore(state => state.setIsPropertyPanelOpen);
    const setEditorTab = useStore(state => state.setEditorTab);
    const setSidebarExpanded = useStore(state => state.setSidebarExpanded);
    const reorderElement = useStore(state => state.reorderElement);
    const removeElement = useStore(state => state.removeElement);
    const setSelectedElementIds = useStore(state => state.setSelectedElementIds);
    const currentPageIndex = useStore(state => state.currentPageIndex);
    const [isFontMenuOpen, setIsFontMenuOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isColorMenuOpen, setIsColorMenuOpen] = useState(false);
    const [isLayerMenuOpen, setIsLayerMenuOpen] = useState(false);
    const [fontSearch, setFontSearch] = useState('');
    const dragOffsetRef = useRef({ x: 0, y: 0 });
    const toolbarRef = useRef<HTMLDivElement>(null);
    const dragStartPos = useRef<{ x: number; y: number } | null>(null);

    const fontMenuRef = useRef<HTMLDivElement>(null);
    const settingsRef = useRef<HTMLDivElement>(null);
    const colorMenuRef = useRef<HTMLDivElement>(null);
    const layerMenuRef = useRef<HTMLDivElement>(null);
    const fontScrollRef = useRef<HTMLDivElement>(null);

    const font = element.fontFamily || 'Inter';
    const size = element.fontSize || 16;
    const isBold = element.fontWeight === 'bold' || element.fontWeight === '700';
    const isItalic = element.fontStyle === 'italic';
    const isUnderline = !!(element.textDecoration?.includes('underline'));
    const align = element.textAlign || 'left';
    const color = element.fill || '#1e293b';

    const handleDragStart = (e: React.MouseEvent) => {
        dragStartPos.current = { x: e.clientX - dragOffsetRef.current.x, y: e.clientY - dragOffsetRef.current.y };
        document.addEventListener('mousemove', handleDragMove);
        document.addEventListener('mouseup', handleDragEnd);
        if (toolbarRef.current) {
            toolbarRef.current.style.transition = 'none';
        }
    };

    const handleDragMove = (e: MouseEvent) => {
        if (!dragStartPos.current || !toolbarRef.current) return;
        const newX = e.clientX - dragStartPos.current.x;
        const newY = e.clientY - dragStartPos.current.y;
        dragOffsetRef.current = { x: newX, y: newY };
        
        const baseLeft = element.x * zoom;
        const baseTop = Math.max(0, (element.y * zoom) - 85);
        
        toolbarRef.current.style.left = `${baseLeft + newX}px`;
        toolbarRef.current.style.top = `${baseTop + newY}px`;
    };

    const handleDragEnd = () => {
        dragStartPos.current = null;
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
        if (toolbarRef.current) {
            toolbarRef.current.style.transition = '';
        }
    };

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (fontMenuRef.current && !fontMenuRef.current.contains(e.target as Node)) setIsFontMenuOpen(false);
            if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) setIsSettingsOpen(false);
            if (colorMenuRef.current && !colorMenuRef.current.contains(e.target as Node)) setIsColorMenuOpen(false);
            if (layerMenuRef.current && !layerMenuRef.current.contains(e.target as Node)) setIsLayerMenuOpen(false);
        };
        if (isFontMenuOpen || isSettingsOpen || isColorMenuOpen || isLayerMenuOpen) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [isFontMenuOpen, isSettingsOpen, isColorMenuOpen, isLayerMenuOpen]);

    // Native wheel listener to stop propagation to EditorCanvas container
    useEffect(() => {
        const stopProp = (e: WheelEvent) => e.stopPropagation();
        const fontEl = fontScrollRef.current;
        const settingsEl = settingsRef.current;
        const colorEl = colorMenuRef.current;
        const layerEl = layerMenuRef.current;

        if (isFontMenuOpen && fontEl) fontEl.addEventListener('wheel', stopProp, { passive: false });
        if (isSettingsOpen && settingsEl) settingsEl.addEventListener('wheel', stopProp, { passive: false });
        if (isColorMenuOpen && colorEl) colorEl.addEventListener('wheel', stopProp, { passive: false });
        if (isLayerMenuOpen && layerEl) layerEl.addEventListener('wheel', stopProp, { passive: false });

        return () => {
            if (fontEl) fontEl.removeEventListener('wheel', stopProp);
            if (settingsEl) settingsEl.removeEventListener('wheel', stopProp);
            if (colorEl) colorEl.removeEventListener('wheel', stopProp);
            if (layerEl) layerEl.removeEventListener('wheel', stopProp);
        };
    }, [isFontMenuOpen, isSettingsOpen, isColorMenuOpen, isLayerMenuOpen]);

    const handleAction = (type: 'bold' | 'italic' | 'underline' | 'color', value?: string) => {
        const sel = window.getSelection();
        const hasSelection = sel && !sel.isCollapsed && sel.rangeCount > 0;

        if (hasSelection) {
            let success = false;
            if (type === 'bold') success = toggleStyle('bold');
            else if (type === 'italic') success = toggleStyle('italic');
            else if (type === 'underline') success = toggleStyle('underline');
            else if (type === 'color') {
                if (value && !value.includes('gradient')) {
                    success = toggleStyle('foreColor', value);
                }
            }
            if (success) return;
        }

        if (type === 'bold') onUpdate({ fontWeight: isBold ? 'normal' : 'bold' });
        else if (type === 'italic') onUpdate({ fontStyle: isItalic ? 'normal' : 'italic' });
        else if (type === 'underline') onUpdate({ textDecoration: isUnderline ? 'none' : 'underline' });
        else if (type === 'color') onUpdate({ fill: value });
    };

    const handleAlignment = (a: 'left' | 'center' | 'right') => onUpdate({ textAlign: a });

    const filteredFonts = CATEGORIZED_FONTS.map(group => ({
        ...group,
        fonts: group.fonts.filter(f => f.toLowerCase().includes(fontSearch.toLowerCase()))
    })).filter(group => group.fonts.length > 0);

    // Common style for buttons to prevent stealing focus from the active text box
    const preventFocusSteal = (e: React.MouseEvent) => e.preventDefault();

    return (
        <div
            ref={toolbarRef}
            className="floating-toolbar absolute z-[2000] flex items-center gap-0.5 bg-[#141416] text-[#EDEDED] shadow-[0_12px_40px_rgba(0,0,0,0.6)] border border-[#E2DCC8]/20 rounded-[4px] p-1 select-none transition-all animate-in zoom-in-95 duration-200 backdrop-blur-md"
            style={{
                left: (element.x * zoom) + dragOffsetRef.current.x,
                top: Math.max(0, (element.y * zoom) - 85) + dragOffsetRef.current.y,
                whiteSpace: 'nowrap',
            }}
        >
            {/* Drag Handle */}
            <div
                onMouseDown={handleDragStart}
                className="cursor-move p-1 text-[#E2DCC8]/40 hover:text-[#F1F1F1] rounded-[4px] transition-colors"
            >
                <GripVertical size={16} />
            </div>
            {/* Font family */}
            <div className="relative" ref={fontMenuRef}>
                <button
                    onClick={() => setIsFontMenuOpen(v => !v)}
                    onMouseDown={preventFocusSteal}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-[4px] text-[12px] font-bold tracking-tight transition-all active:scale-95 ${isFontMenuOpen ? 'bg-[#0F3D3E] text-white border border-[#E2DCC8]/30' : 'text-[#F1F1F1] hover:bg-[#0F3D3E]/40 border border-transparent'}`}
                    style={{ fontFamily: font }}
                >
                    <span className="max-w-[75px] truncate">{font}</span>
                    <ChevronDown size={12} className="text-[#E2DCC8]/50 shrink-0" />
                </button>
                {isFontMenuOpen && (
                    <div className={`absolute ${element.y * zoom < 100 ? 'top-full mt-2' : 'bottom-full mb-2'} left-0 w-64 bg-[#18181b] border border-[#E2DCC8]/20 rounded-[4px] shadow-2xl overflow-hidden z-50 animate-in ${element.y * zoom < 100 ? 'slide-in-from-top-2' : 'slide-in-from-bottom-2'} duration-200 flex flex-col text-[#EDEDED]`}>
                        {/* Search Bar - Fixed at top */}
                        <div className="p-2 border-b border-[#E2DCC8]/15 bg-[#121214] flex items-center gap-2 sticky top-0 z-10">
                            <Search size={14} className="text-gray-400" />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Search fonts..."
                                value={fontSearch}
                                onChange={e => setFontSearch(e.target.value)}
                                className="w-full bg-transparent border-none outline-none text-[12px] font-bold text-[#F1F1F1] placeholder:text-gray-500"
                            />
                        </div>
                        {/* Font List - Scrollable area (limited to ~5 items) */}
                        <div
                            ref={fontScrollRef}
                            className="max-h-[190px] overflow-y-auto custom-scrollbar p-1 flex flex-col gap-0.5 scroll-smooth overscroll-contain"
                        >
                            {filteredFonts.map(group => (
                                <div key={group.label} className="flex flex-col p-0.5 mb-1 last:mb-0">
                                    <div className="px-2 py-1 text-[8px] font-black text-[#E2DCC8]/50 uppercase tracking-widest bg-white/5 rounded-[4px] mb-0.5">
                                        {group.label}
                                    </div>
                                    <div className="flex flex-col">
                                        {group.fonts.map(f => (
                                            <button
                                                key={f}
                                                onMouseDown={preventFocusSteal}
                                                onClick={() => { onUpdate({ fontFamily: f }); setIsFontMenuOpen(false); }}
                                                className={`block w-full text-left px-2.5 py-1.5 text-[12px] rounded-[4px] transition-all ${f === font ? 'bg-[#0F3D3E] text-white font-bold border border-[#E2DCC8]/30' : 'text-gray-300 hover:bg-[#0F3D3E]/30 hover:text-white'}`}
                                                style={{ fontFamily: f }}
                                            >
                                                {f}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            {filteredFonts.length === 0 && (
                                <div className="py-8 text-center text-gray-500 text-[11px] font-bold uppercase tracking-widest">
                                    No fonts found
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <Divider />

            {/* Font size */}
            <div className="flex items-center gap-0.5 px-0.5">
                <button
                    onClick={() => {
                        const newSize = Math.max(6, size - 1);
                        onUpdate({ fontSize: newSize, width: element.width * (newSize / size) });
                    }}
                    onMouseDown={preventFocusSteal}
                    className="p-1.5 hover:bg-[#0F3D3E]/40 rounded-[4px] text-[#E2DCC8]/70 hover:text-white transition-all active:scale-90"
                    title="Decrease size"
                >
                    <Minus size={14} />
                </button>
                <input
                    type="number"
                    value={Math.round(size)}
                    onChange={e => {
                        const newSize = Math.max(1, Number(e.target.value));
                        onUpdate({ fontSize: newSize, width: element.width * (newSize / size) });
                    }}
                    onWheel={e => {
                        e.preventDefault();
                        const delta = e.deltaY < 0 ? 1 : -1;
                        const newSize = Math.max(1, size + delta);
                        onUpdate({ fontSize: newSize, width: element.width * (newSize / size) });
                    }}
                    onKeyDown={e => {
                        if (e.shiftKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
                            e.preventDefault();
                            const delta = e.key === 'ArrowUp' ? 5 : -5;
                            const newSize = Math.max(1, size + delta);
                            onUpdate({ fontSize: newSize, width: element.width * (newSize / size) });
                        }
                    }}
                    className="w-10 text-center text-[12px] font-black text-[#F1F1F1] bg-[#100F0F] border border-[#E2DCC8]/20 rounded-[4px] py-0.5 outline-none focus:border-[#0F3D3E] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                    onClick={() => {
                        const newSize = size + 1;
                        onUpdate({ fontSize: newSize, width: element.width * (newSize / size) });
                    }}
                    onMouseDown={preventFocusSteal}
                    className="p-1.5 hover:bg-[#0F3D3E]/40 rounded-[4px] text-[#E2DCC8]/70 hover:text-white transition-all active:scale-90"
                    title="Increase size"
                >
                    <Plus size={14} />
                </button>
            </div>

            <Divider />

            {/* Color & Formatting */}
            <div className="flex items-center gap-0.5 px-0.5">
                <div className="relative">
                    <button
                        onClick={() => {
                            useStore.getState().openColorPicker({
                                type: 'text',
                                elementId: element.id,
                                color: color,
                                title: 'Text Color',
                                onChange: (newVal) => handleAction('color', newVal)
                            });
                        }}
                        onMouseDown={preventFocusSteal}
                        className="p-1.5 rounded-[4px] transition-all active:scale-95 hover:bg-[#0F3D3E]/40 text-[#F1F1F1]"
                        title="Text Color"
                    >
                        <div className="flex flex-col items-center gap-0">
                            {color.includes('gradient') ? (
                                <div className="w-[18px] h-[18px] rounded-[2px] border border-white/20" style={{ background: color }} />
                            ) : (
                                <div className="flex flex-col items-center">
                                    <span className="font-serif font-black text-[14px] leading-tight" style={{ color }}>A</span>
                                    <div className="w-4 h-[3px] rounded-[1px]" style={{ backgroundColor: color }} />
                                </div>
                            )}
                        </div>
                    </button>
                </div>
                <button
                    onClick={() => handleAction('bold')}
                    onMouseDown={preventFocusSteal}
                    className={`p-1.5 rounded-[4px] transition-all active:scale-95 ${isBold ? 'bg-[#0F3D3E] text-white border border-[#E2DCC8]/30 shadow-sm' : 'hover:bg-[#0F3D3E]/40 text-[#E2DCC8]/80 hover:text-white'}`}
                    title="Bold"
                >
                    <Bold size={15} strokeWidth={isBold ? 3 : 2} />
                </button>
                <button
                    onClick={() => handleAction('italic')}
                    onMouseDown={preventFocusSteal}
                    className={`p-1.5 rounded-[4px] transition-all active:scale-95 ${isItalic ? 'bg-[#0F3D3E] text-white border border-[#E2DCC8]/30 shadow-sm' : 'hover:bg-[#0F3D3E]/40 text-[#E2DCC8]/80 hover:text-white'}`}
                    title="Italic"
                >
                    <Italic size={15} strokeWidth={isItalic ? 3 : 2} />
                </button>
                <button
                    onClick={() => handleAction('underline')}
                    onMouseDown={preventFocusSteal}
                    className={`p-1.5 rounded-[4px] transition-all active:scale-95 ${isUnderline ? 'bg-[#0F3D3E] text-white border border-[#E2DCC8]/30 shadow-sm' : 'hover:bg-[#0F3D3E]/40 text-[#E2DCC8]/80 hover:text-white'}`}
                    title="Underline"
                >
                    <Underline size={15} strokeWidth={isUnderline ? 3 : 2} />
                </button>
                <button
                    onClick={() => {
                        const isUpper = element.text === element.text?.toUpperCase();
                        onUpdate({ text: isUpper ? element.text?.toLowerCase() : element.text?.toUpperCase() });
                    }}
                    onMouseDown={preventFocusSteal}
                    className="p-1.5 px-2 rounded-[4px] hover:bg-[#0F3D3E]/40 text-[#E2DCC8]/80 hover:text-white transition-all active:scale-95"
                    title="Uppercase / Lowercase"
                >
                    <span className="font-bold text-[13px]">Aa</span>
                </button>
            </div>

            <Divider />

            {/* Alignment & Text Settings */}
            <div className="flex items-center gap-0.5 px-0.5">
                <button
                    onClick={() => handleAlignment(align === 'left' ? 'center' : align === 'center' ? 'right' : 'left')}
                    onMouseDown={preventFocusSteal}
                    className="p-1.5 rounded-[4px] hover:bg-[#0F3D3E]/40 text-[#E2DCC8]/80 hover:text-white transition-all active:scale-95"
                    title="Alignment"
                >
                    {align === 'left' && <AlignLeft size={15} />}
                    {align === 'center' && <AlignCenter size={15} />}
                    {align === 'right' && <AlignRight size={15} />}
                </button>

                {/* Text Settings Popover */}
                <div className="relative" ref={settingsRef}>
                    <button
                        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                        onMouseDown={preventFocusSteal}
                        className={`p-1.5 rounded-[4px] transition-all active:scale-95 ${isSettingsOpen ? 'bg-[#0F3D3E] text-white border border-[#E2DCC8]/30' : 'hover:bg-[#0F3D3E]/40 text-[#E2DCC8]/80 hover:text-white'}`}
                        title="Text Settings"
                    >
                        <Sliders size={15} />
                    </button>
                    {isSettingsOpen && (
                        <div
                            className={`absolute ${element.y * zoom < 100 ? 'top-full mt-2' : 'bottom-full mb-2'} left-1/2 -translate-x-1/2 w-[240px] bg-[#18181b] border border-[#E2DCC8]/20 rounded-[4px] shadow-2xl p-3.5 animate-in ${element.y * zoom < 100 ? 'slide-in-from-top-2' : 'slide-in-from-bottom-2'} duration-200 text-[#EDEDED] z-50`}
                        >
                            <div className="space-y-3.5">
                                {/* Letter Spacing */}
                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[9px] font-black text-[#E2DCC8]/60 uppercase tracking-widest leading-none">Letter Spacing</label>
                                        <input
                                            type="number"
                                            value={Math.round((element.letterSpacing || 0))}
                                            onChange={e => onUpdate({ letterSpacing: parseFloat(e.target.value) || 0 })}
                                            className="text-[11px] font-black text-[#F1F1F1] bg-[#100F0F] border border-[#E2DCC8]/20 rounded-[4px] px-1.5 py-0.5 w-12 text-right outline-none focus:border-[#0F3D3E] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none m-0"
                                        />
                                    </div>
                                    <input
                                        type="range"
                                        min="-50"
                                        max="1000"
                                        step="1"
                                        value={element.letterSpacing || 0}
                                        onChange={e => onUpdate({ letterSpacing: parseFloat(e.target.value) })}
                                        className="w-full h-1.5 bg-[#252528] rounded-[2px] appearance-none cursor-pointer accent-[#0F3D3E]"
                                    />
                                </div>
                                {/* Line Spacing */}
                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[9px] font-black text-[#E2DCC8]/60 uppercase tracking-widest leading-none">Line Spacing</label>
                                        <input
                                            type="text"
                                            value={element.lineHeight?.toString() || "1.2"}
                                            onChange={e => {
                                                const val = parseFloat(e.target.value);
                                                if (!isNaN(val)) onUpdate({ lineHeight: val });
                                            }}
                                            className="text-[11px] font-black text-[#F1F1F1] bg-[#100F0F] border border-[#E2DCC8]/20 rounded-[4px] px-1.5 py-0.5 w-12 text-right outline-none focus:border-[#0F3D3E] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none m-0"
                                        />
                                    </div>
                                    <input
                                        type="range"
                                        min="0.5"
                                        max="10"
                                        step="0.1"
                                        value={element.lineHeight || 1.2}
                                        onChange={e => onUpdate({ lineHeight: parseFloat(e.target.value) })}
                                        className="w-full h-1.5 bg-[#252528] rounded-[2px] appearance-none cursor-pointer accent-[#0F3D3E]"
                                    />
                                </div>
                                {/* Transparency */}
                                <div className="space-y-1.5 border-t border-white/10 pt-2.5">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[9px] font-black text-[#E2DCC8]/60 uppercase tracking-widest leading-none">Transparency</label>
                                        <div className="flex items-center gap-0.5">
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={Math.round((element.opacity ?? 1) * 100)}
                                                onChange={e => {
                                                    const val = parseInt(e.target.value);
                                                    if (!isNaN(val)) onUpdate({ opacity: Math.min(100, Math.max(0, val)) / 100 });
                                                }}
                                                className="text-[11px] font-black text-[#F1F1F1] bg-[#100F0F] border border-[#E2DCC8]/20 rounded-[4px] px-1.5 py-0.5 w-10 text-right outline-none focus:border-[#0F3D3E] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none m-0"
                                            />
                                            <span className="text-[11px] font-black text-[#E2DCC8]/60">%</span>
                                        </div>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={element.opacity ?? 1}
                                        onChange={e => onUpdate({ opacity: parseFloat(e.target.value) })}
                                        className="w-full h-1.5 bg-[#252528] rounded-[2px] appearance-none cursor-pointer accent-[#0F3D3E]"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <Divider />

                {/* Layer Control Menu */}
                <div className="relative" ref={layerMenuRef}>
                    <button
                        onClick={() => setIsLayerMenuOpen(!isLayerMenuOpen)}
                        onMouseDown={preventFocusSteal}
                        className={`p-1.5 rounded-[4px] transition-all active:scale-95 ${isLayerMenuOpen ? 'bg-[#0F3D3E] text-white border border-[#E2DCC8]/30' : 'hover:bg-[#0F3D3E]/40 text-[#E2DCC8]/80 hover:text-white'}`}
                        title="Layer Position (Forward/Back)"
                    >
                        <Layers size={15} />
                    </button>
                    {isLayerMenuOpen && (
                        <div
                            className={`absolute ${element.y * zoom < 100 ? 'top-full mt-2' : 'bottom-full mb-2'} right-0 w-[200px] bg-[#18181b] border border-[#E2DCC8]/20 rounded-[4px] shadow-2xl p-2 animate-in ${element.y * zoom < 100 ? 'slide-in-from-top-2' : 'slide-in-from-bottom-2'} duration-200 z-50 text-[#EDEDED]`}
                        >
                            <div className="space-y-1">
                                <div className="px-2.5 py-1 border-b border-white/10">
                                    <span className="text-[9px] font-black text-[#E2DCC8]/50 uppercase tracking-widest">Layer Order</span>
                                </div>
                                <button
                                    onClick={() => {
                                        reorderElement(currentPageIndex, element.id, 'front');
                                        setIsLayerMenuOpen(false);
                                    }}
                                    className="w-full px-2.5 py-1.5 text-left text-xs font-bold text-gray-300 hover:bg-[#0F3D3E] hover:text-white rounded-[4px] flex items-center justify-between transition-colors"
                                >
                                    <span>Bring to Front</span>
                                    <ArrowUpToLine size={14} className="text-[#E2DCC8]/50" />
                                </button>
                                <button
                                    onClick={() => {
                                        reorderElement(currentPageIndex, element.id, 'forward');
                                        setIsLayerMenuOpen(false);
                                    }}
                                    className="w-full px-2.5 py-1.5 text-left text-xs font-bold text-gray-300 hover:bg-[#0F3D3E] hover:text-white rounded-[4px] flex items-center justify-between transition-colors"
                                >
                                    <span>Bring Forward</span>
                                    <ChevronUp size={14} className="text-[#E2DCC8]/50" />
                                </button>
                                <button
                                    onClick={() => {
                                        reorderElement(currentPageIndex, element.id, 'backward');
                                        setIsLayerMenuOpen(false);
                                    }}
                                    className="w-full px-2.5 py-1.5 text-left text-xs font-bold text-gray-300 hover:bg-[#0F3D3E] hover:text-white rounded-[4px] flex items-center justify-between transition-colors"
                                >
                                    <span>Send Backward</span>
                                    <ChevronDown size={14} className="text-[#E2DCC8]/50" />
                                </button>
                                <button
                                    onClick={() => {
                                        reorderElement(currentPageIndex, element.id, 'back');
                                        setIsLayerMenuOpen(false);
                                    }}
                                    className="w-full px-2.5 py-1.5 text-left text-xs font-bold text-gray-300 hover:bg-[#0F3D3E] hover:text-white rounded-[4px] flex items-center justify-between transition-colors"
                                >
                                    <span>Send to Back</span>
                                    <ArrowDownToLine size={14} className="text-[#E2DCC8]/50" />
                                </button>

                                <div className="pt-1 border-t border-white/10">
                                    <button
                                        onClick={() => {
                                            setSidebarExpanded(true);
                                            setEditorTab('layers');
                                            setIsLayerMenuOpen(false);
                                        }}
                                        className="w-full px-2.5 py-1.5 text-left text-[10px] font-black text-purple-400 hover:bg-purple-900/30 rounded-[4px] flex items-center gap-2 transition-colors uppercase tracking-wider"
                                    >
                                        <Layers size={13} />
                                        <span>Open Scene Tree</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <Divider />

                {/* Delete Button */}
                <button
                    onClick={() => {
                        removeElement(currentPageIndex, element.id);
                        setSelectedElementIds([]);
                    }}
                    onMouseDown={preventFocusSteal}
                    className="p-1.5 rounded-[4px] hover:bg-red-500/20 text-[#E2DCC8]/70 hover:text-red-400 transition-all active:scale-95"
                    title="Delete Element (Del)"
                >
                    <Trash2 size={15} />
                </button>
            </div>

        </div>
    );
};
