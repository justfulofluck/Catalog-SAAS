import React, { useState, useRef, useEffect } from 'react';
import {
    Bold, Italic, Underline,
    Minus, Plus,
    AlignLeft, AlignCenter, AlignRight,
    ChevronDown,
    Search, Sliders,
    Wand2,
    GripVertical,
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

const Divider = () => <div className="w-[1px] h-5 bg-slate-200/80 mx-1 shrink-0" />;

export const FloatingTextToolbar: React.FC<Props> = ({ element, onUpdate, zoom }) => {
    const setIsPropertyPanelOpen = useStore(state => state.setIsPropertyPanelOpen);
    const setEditorTab = useStore(state => state.setEditorTab);
    const setSidebarExpanded = useStore(state => state.setSidebarExpanded);
    const [isFontMenuOpen, setIsFontMenuOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isColorMenuOpen, setIsColorMenuOpen] = useState(false);
    const [fontSearch, setFontSearch] = useState('');
    const dragOffsetRef = useRef({ x: 0, y: 0 });
    const toolbarRef = useRef<HTMLDivElement>(null);
    const dragStartPos = useRef<{ x: number; y: number } | null>(null);

    const fontMenuRef = useRef<HTMLDivElement>(null);
    const settingsRef = useRef<HTMLDivElement>(null);
    const colorMenuRef = useRef<HTMLDivElement>(null);
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
        };
        if (isFontMenuOpen || isSettingsOpen || isColorMenuOpen) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [isFontMenuOpen, isSettingsOpen, isColorMenuOpen]);

    // Native wheel listener to stop propagation to EditorCanvas container
    useEffect(() => {
        const stopProp = (e: WheelEvent) => e.stopPropagation();
        const fontEl = fontScrollRef.current;
        const settingsEl = settingsRef.current;
        const colorEl = colorMenuRef.current;

        if (isFontMenuOpen && fontEl) fontEl.addEventListener('wheel', stopProp, { passive: false });
        if (isSettingsOpen && settingsEl) settingsEl.addEventListener('wheel', stopProp, { passive: false });
        if (isColorMenuOpen && colorEl) colorEl.addEventListener('wheel', stopProp, { passive: false });

        return () => {
            if (fontEl) fontEl.removeEventListener('wheel', stopProp);
            if (settingsEl) settingsEl.removeEventListener('wheel', stopProp);
            if (colorEl) colorEl.removeEventListener('wheel', stopProp);
        };
    }, [isFontMenuOpen, isSettingsOpen, isColorMenuOpen]);

    const handleAction = (type: 'bold' | 'italic' | 'underline' | 'color', value?: string) => {
        const sel = window.getSelection();
        const hasSelection = sel && !sel.isCollapsed && sel.rangeCount > 0;

        if (hasSelection) {
            let success = false;
            if (type === 'bold') success = toggleStyle('bold');
            else if (type === 'italic') success = toggleStyle('italic');
            else if (type === 'underline') success = toggleStyle('underline');
            else if (type === 'color') success = toggleStyle('foreColor', value);
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
            className="floating-toolbar absolute z-[2000] flex items-center gap-0.5 bg-white shadow-[0_8px_32px_rgba(0,0,0,0.15)] border border-slate-100 rounded-full p-1.5 select-none transition-all animate-in zoom-in-95 duration-200"
            style={{
                left: (element.x * zoom) + dragOffsetRef.current.x,
                top: Math.max(0, (element.y * zoom) - 85) + dragOffsetRef.current.y,
                whiteSpace: 'nowrap',
            }}
        >
            {/* Drag Handle */}
            <div
                onMouseDown={handleDragStart}
                className="cursor-move p-1 text-slate-300 hover:text-slate-500 transition-colors"
            >
                <GripVertical size={16} />
            </div>
            {/* Font family */}
            <div className="relative" ref={fontMenuRef}>
                <button
                    onClick={() => setIsFontMenuOpen(v => !v)}
                    onMouseDown={preventFocusSteal}
                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 rounded-full text-slate-800 text-[12px] font-bold tracking-tight transition-all active:scale-95"
                    style={{ fontFamily: font }}
                >
                    <span className="max-w-[70px] truncate">{font}</span>
                    <ChevronDown size={12} className="text-slate-400 shrink-0" />
                </button>
                {isFontMenuOpen && (
                    <div className={`absolute ${element.y * zoom < 100 ? 'top-full mt-3' : 'bottom-full mb-3'} left-0 w-64 bg-white border border-slate-200/60 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in ${element.y * zoom < 100 ? 'slide-in-from-top-2' : 'slide-in-from-bottom-2'} duration-300 flex flex-col`}>
                        {/* Search Bar - Fixed at top */}
                        <div className="p-2.5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2 sticky top-0 z-10">
                            <Search size={14} className="text-slate-400" />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Search fonts..."
                                value={fontSearch}
                                onChange={e => setFontSearch(e.target.value)}
                                className="w-full bg-transparent border-none outline-none text-[12px] font-bold text-slate-700 placeholder:text-slate-300"
                            />
                        </div>
                        {/* Font List - Scrollable area (limited to ~5 items) */}
                        <div
                            ref={fontScrollRef}
                            className="max-h-[190px] overflow-y-auto custom-scrollbar p-0.5 flex flex-col gap-0.5 scroll-smooth overscroll-contain"
                        >
                            {filteredFonts.map(group => (
                                <div key={group.label} className="flex flex-col p-1 mb-1 last:mb-0">
                                    <div className="px-2 py-1 text-[8px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/80 rounded-md mb-0.5">
                                        {group.label}
                                    </div>
                                    <div className="flex flex-col">
                                        {group.fonts.map(f => (
                                            <button
                                                key={f}
                                                onMouseDown={preventFocusSteal}
                                                onClick={() => { onUpdate({ fontFamily: f }); setIsFontMenuOpen(false); }}
                                                className={`block w-full text-left px-3 py-1.5 text-[13px] hover:bg-indigo-50 hover:text-indigo-600 rounded-md transition-all ${f === font ? 'text-indigo-600 font-bold bg-indigo-50' : 'text-slate-700'}`}
                                                style={{ fontFamily: f }}
                                            >
                                                {f}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            {filteredFonts.length === 0 && (
                                <div className="py-8 text-center text-slate-400 text-[11px] font-bold uppercase tracking-widest">
                                    No fonts found
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <Divider />

            {/* Font size */}
            <div className="flex items-center gap-0.5 px-1">
                <button
                    onClick={() => {
                        const newSize = Math.max(6, size - 1);
                        onUpdate({ fontSize: newSize, width: element.width * (newSize / size) });
                    }}
                    onMouseDown={preventFocusSteal}
                    className="p-1.5 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-all active:scale-90"
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
                    className="w-10 text-center text-[13px] font-black text-slate-800 bg-transparent outline-none border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                    onClick={() => {
                        const newSize = size + 1;
                        onUpdate({ fontSize: newSize, width: element.width * (newSize / size) });
                    }}
                    onMouseDown={preventFocusSteal}
                    className="p-1.5 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-all active:scale-90"
                >
                    <Plus size={14} />
                </button>
            </div>

            <Divider />

            {/* Color & Formatting */}
            <div className="flex items-center gap-0.5 px-1">
                <div className="relative" ref={colorMenuRef}>
                    <button
                        onClick={() => setIsColorMenuOpen(!isColorMenuOpen)}
                        onMouseDown={preventFocusSteal}
                        className={`p-2 rounded-full transition-all active:scale-95 ${isColorMenuOpen ? 'bg-slate-50 shadow-inner' : 'hover:bg-slate-50'} text-slate-700 relative`}
                        title="Text Color"
                    >
                        <div className="flex flex-col items-center gap-0">
                            {color.includes('gradient') ? (
                                <div className="w-[18px] h-[18px] rounded-full border border-slate-200" style={{ background: color }} />
                            ) : (
                                <div className="flex flex-col items-center">
                                    <span className="font-serif font-black text-[15px] leading-tight" style={{ color }}>A</span>
                                    <div className="w-4 h-[3.5px] rounded-full" style={{ backgroundColor: color }} />
                                </div>
                            )}
                        </div>
                    </button>
                    {isColorMenuOpen && (
                        <div className={`absolute ${element.y * zoom < 100 ? 'top-full mt-3' : 'bottom-full mb-3'} left-1/2 -translate-x-1/2 w-[220px] bg-white border border-slate-200/60 rounded-2xl shadow-2xl p-3 animate-in ${element.y * zoom < 100 ? 'slide-in-from-top-2' : 'slide-in-from-bottom-2'} duration-300 z-50`}>
                            <AdvancedColorPicker
                                color={color}
                                onChange={(newVal) => handleAction('color', newVal)}
                            />
                        </div>
                    )}
                </div>
                <button
                    onClick={() => handleAction('bold')}
                    onMouseDown={preventFocusSteal}
                    className={`p-2 rounded-full transition-all active:scale-95 ${isBold ? 'text-indigo-600 bg-indigo-50' : 'hover:bg-slate-50 text-slate-600'}`}
                    title="Bold"
                >
                    <Bold size={16} strokeWidth={isBold ? 3 : 2} />
                </button>
                <button
                    onClick={() => handleAction('italic')}
                    onMouseDown={preventFocusSteal}
                    className={`p-2 rounded-full transition-all active:scale-95 ${isItalic ? 'text-indigo-600 bg-indigo-50' : 'hover:bg-slate-50 text-slate-600'}`}
                    title="Italic"
                >
                    <Italic size={16} strokeWidth={isItalic ? 3 : 2} />
                </button>
                <button
                    onClick={() => handleAction('underline')}
                    onMouseDown={preventFocusSteal}
                    className={`p-2 rounded-full transition-all active:scale-95 ${isUnderline ? 'text-indigo-600 bg-indigo-50' : 'hover:bg-slate-50 text-slate-600'}`}
                    title="Underline"
                >
                    <Underline size={16} strokeWidth={isUnderline ? 3 : 2} />
                </button>
                <button
                    onClick={() => {
                        const isUpper = element.text === element.text?.toUpperCase();
                        onUpdate({ text: isUpper ? element.text?.toLowerCase() : element.text?.toUpperCase() });
                    }}
                    onMouseDown={preventFocusSteal}
                    className="p-2 px-3 rounded-full hover:bg-slate-50 text-slate-600 transition-all active:scale-95"
                    title="Uppercase"
                >
                    <span className="font-bold text-[14px]">Aa</span>
                </button>
            </div>

            <Divider />

            {/* Alignment & Text Settings */}
            <div className="flex items-center gap-0.5 px-1">
                <button
                    onClick={() => handleAlignment(align === 'left' ? 'center' : align === 'center' ? 'right' : 'left')}
                    onMouseDown={preventFocusSteal}
                    className="p-2 rounded-full hover:bg-slate-50 text-slate-600 transition-all active:scale-95"
                    title="Alignment"
                >
                    {align === 'left' && <AlignLeft size={16} />}
                    {align === 'center' && <AlignCenter size={16} />}
                    {align === 'right' && <AlignRight size={16} />}
                </button>

                {/* Text Settings Popover */}
                <div className="relative" ref={settingsRef}>
                    <button
                        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                        onMouseDown={preventFocusSteal}
                        className={`p-2 rounded-full transition-all active:scale-95 ${isSettingsOpen ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-50 text-slate-600'}`}
                        title="Text Settings"
                    >
                        <Sliders size={16} />
                    </button>
                    {isSettingsOpen && (
                        <div
                            className={`absolute ${element.y * zoom < 100 ? 'top-full mt-3' : 'bottom-full mb-3'} left-1/2 -translate-x-1/2 w-[240px] bg-white border border-slate-200/60 rounded-2xl shadow-2xl p-4 animate-in ${element.y * zoom < 100 ? 'slide-in-from-top-2' : 'slide-in-from-bottom-2'} duration-300`}
                        >
                            <div className="space-y-4">
                                {/* Letter Spacing */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Letter Spacing</label>
                                        <input
                                            type="number"
                                            value={Math.round((element.letterSpacing || 0))}
                                            onChange={e => onUpdate({ letterSpacing: parseFloat(e.target.value) || 0 })}
                                            className="text-[11px] font-black text-indigo-600 bg-transparent w-12 text-right outline-none border-b border-transparent hover:border-slate-200 focus:border-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none m-0 p-0"
                                        />
                                    </div>
                                    <input
                                        type="range"
                                        min="-50"
                                        max="1000"
                                        step="1"
                                        value={element.letterSpacing || 0}
                                        onChange={e => onUpdate({ letterSpacing: parseFloat(e.target.value) })}
                                        className="w-full h-1 bg-slate-100 rounded-full appearance-none cursor-pointer accent-indigo-600"
                                    />
                                </div>
                                {/* Line Spacing */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Line Spacing</label>
                                        <input
                                            type="text"
                                            value={element.lineHeight?.toString() || "1.2"}
                                            onChange={e => {
                                                const val = parseFloat(e.target.value);
                                                if (!isNaN(val)) onUpdate({ lineHeight: val });
                                            }}
                                            className="text-[11px] font-black text-indigo-600 bg-transparent w-12 text-right outline-none border-b border-transparent hover:border-slate-200 focus:border-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none m-0 p-0"
                                        />
                                    </div>
                                    <input
                                        type="range"
                                        min="0.5"
                                        max="10"
                                        step="0.1"
                                        value={element.lineHeight || 1.2}
                                        onChange={e => onUpdate({ lineHeight: parseFloat(e.target.value) })}
                                        className="w-full h-1 bg-slate-100 rounded-full appearance-none cursor-pointer accent-indigo-600"
                                    />
                                </div>
                                {/* Transparency */}
                                <div className="space-y-2 border-t border-slate-50 pt-3">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Transparency</label>
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
                                                className="text-[11px] font-black text-indigo-600 bg-transparent w-8 text-right outline-none border-b border-transparent hover:border-slate-200 focus:border-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none m-0 p-0"
                                            />
                                            <span className="text-[11px] font-black text-indigo-600">%</span>
                                        </div>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={element.opacity ?? 1}
                                        onChange={e => onUpdate({ opacity: parseFloat(e.target.value) })}
                                        className="w-full h-1 bg-slate-100 rounded-full appearance-none cursor-pointer accent-indigo-600"
                                    />
                                </div>                            </div>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};
