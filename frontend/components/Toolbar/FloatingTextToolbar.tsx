import React, { useState, useRef, useEffect } from 'react';
import {
    Bold, Italic, Underline, Strikethrough,
    Minus, Plus,
    AlignLeft, AlignCenter, AlignRight, AlignJustify,
    ChevronDown, ChevronUp,
    Search, Sliders,
    Sparkles,
    GripVertical,
    Layers, ArrowUpToLine, ArrowDownToLine,
    Trash2
} from 'lucide-react';
import { CanvasElement } from '../../types';
import { CATEGORIZED_FONTS } from '../../constants';
import { useStore } from '../../store/useStore';
import { toggleStyle } from '../../utils/textStyleSelection';

interface Props {
    element: CanvasElement;
    onUpdate: (updates: Partial<CanvasElement>) => void;
    zoom: number;
}

const Divider = () => <div className="w-[1px] h-5 bg-white/15 mx-1 shrink-0" />;

const EFFECT_OPTIONS: { id: CanvasElement['effectStyle']; label: string }[] = [
    { id: 'none', label: 'None' },
    { id: 'shadow', label: 'Shadow' },
    { id: 'lift', label: 'Lift' },
    { id: 'hollow', label: 'Hollow' },
    { id: 'outline', label: 'Outline' },
    { id: 'neon', label: 'Neon' },
    { id: 'glitch', label: 'Glitch' },
    { id: 'echo', label: 'Echo' },
    { id: 'splice', label: 'Splice' },
    { id: 'background', label: 'Background' },
];

export const FloatingTextToolbar: React.FC<Props> = ({ element, onUpdate, zoom }) => {
    const editorTab = useStore(state => state.editorTab);
    const setEditorTab = useStore(state => state.setEditorTab);
    const setSidebarExpanded = useStore(state => state.setSidebarExpanded);
    const reorderElement = useStore(state => state.reorderElement);
    const removeElement = useStore(state => state.removeElement);
    const setSelectedElementIds = useStore(state => state.setSelectedElementIds);
    const currentPageIndex = useStore(state => state.currentPageIndex);

    const [isFontMenuOpen, setIsFontMenuOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isLayerMenuOpen, setIsLayerMenuOpen] = useState(false);
    const [fontSearch, setFontSearch] = useState('');
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    const dragOffsetRef = useRef({ x: 0, y: 0 });
    const toolbarRef = useRef<HTMLDivElement>(null);
    const dragStartPos = useRef<{ x: number; y: number } | null>(null);

    const fontMenuRef = useRef<HTMLDivElement>(null);
    const settingsRef = useRef<HTMLDivElement>(null);
    const layerMenuRef = useRef<HTMLDivElement>(null);
    const fontScrollRef = useRef<HTMLDivElement>(null);

    const font = element.fontFamily || 'Inter';
    const size = element.fontSize || 16;
    const isBold = element.fontWeight === 'bold' || element.fontWeight === '700' || element.fontWeight === '800';
    const isItalic = element.fontStyle === 'italic';
    const isUnderline = !!(element.textDecoration?.includes('underline'));
    const isStrikethrough = !!(element.textDecoration?.includes('line-through'));
    const align = element.textAlign || 'left';
    const color = element.fill || '#1e293b';
    const activeEffect = element.effectStyle || 'none';

    const toolbarHeight = 44;
    const verticalGap = 32; // 32px clean breathing room between selection border and floating bar
    const isNearTop = (element.y * zoom) < (toolbarHeight + verticalGap + 10);
    const elementHeight = ((element.height || 40) * (element.scaleY || 1)) * zoom;
    const initialTop = isNearTop 
        ? (element.y * zoom) + elementHeight + verticalGap 
        : (element.y * zoom) - toolbarHeight - verticalGap;

    const currentToolbarTop = initialTop + dragOffset.y;
    // Popovers are 260-320px tall; if toolbar top is less than 300px from canvas top, popover must open downwards
    const isPopoverOffTop = currentToolbarTop < 300;

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
        const baseTop = isNearTop 
            ? (element.y * zoom) + elementHeight + verticalGap 
            : (element.y * zoom) - toolbarHeight - verticalGap;
        
        toolbarRef.current.style.left = `${baseLeft + newX}px`;
        toolbarRef.current.style.top = `${baseTop + newY}px`;
    };

    const handleDragEnd = () => {
        dragStartPos.current = null;
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
        setDragOffset({ ...dragOffsetRef.current });
        if (toolbarRef.current) {
            toolbarRef.current.style.transition = '';
        }
    };

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (fontMenuRef.current && !fontMenuRef.current.contains(e.target as Node)) setIsFontMenuOpen(false);
            if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) setIsSettingsOpen(false);
            if (layerMenuRef.current && !layerMenuRef.current.contains(e.target as Node)) setIsLayerMenuOpen(false);
        };
        if (isFontMenuOpen || isSettingsOpen || isLayerMenuOpen) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [isFontMenuOpen, isSettingsOpen, isLayerMenuOpen]);

    // Native wheel listener to stop propagation to EditorCanvas container
    useEffect(() => {
        const stopProp = (e: WheelEvent) => e.stopPropagation();
        const fontEl = fontScrollRef.current;
        const settingsEl = settingsRef.current;
        const layerEl = layerMenuRef.current;

        if (isFontMenuOpen && fontEl) fontEl.addEventListener('wheel', stopProp, { passive: false });
        if (isSettingsOpen && settingsEl) settingsEl.addEventListener('wheel', stopProp, { passive: false });
        if (isLayerMenuOpen && layerEl) layerEl.addEventListener('wheel', stopProp, { passive: false });

        return () => {
            if (fontEl) fontEl.removeEventListener('wheel', stopProp);
            if (settingsEl) settingsEl.removeEventListener('wheel', stopProp);
            if (layerEl) layerEl.removeEventListener('wheel', stopProp);
        };
    }, [isFontMenuOpen, isSettingsOpen, isLayerMenuOpen]);

    const handleLiveUpdate = (updates: Partial<CanvasElement>) => {
        if (typeof window !== 'undefined' && element?.id) {
            window.dispatchEvent(new CustomEvent('catalog:liveUpdateElement', {
                detail: { id: element.id, updates }
            }));
        }
        onUpdate(updates);
    };

    const handleAction = (type: 'bold' | 'italic' | 'underline' | 'strikethrough' | 'color', value?: string) => {
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

        if (type === 'bold') handleLiveUpdate({ fontWeight: isBold ? 'normal' : 'bold' });
        else if (type === 'italic') handleLiveUpdate({ fontStyle: isItalic ? 'normal' : 'italic' });
        else if (type === 'underline') {
            let next = 'none';
            if (isUnderline && isStrikethrough) next = 'line-through';
            else if (isUnderline) next = 'none';
            else if (isStrikethrough) next = 'underline line-through';
            else next = 'underline';
            handleLiveUpdate({ textDecoration: next });
        }
        else if (type === 'strikethrough') {
            let next = 'none';
            if (isStrikethrough && isUnderline) next = 'underline';
            else if (isStrikethrough) next = 'none';
            else if (isUnderline) next = 'underline line-through';
            else next = 'line-through';
            handleLiveUpdate({ textDecoration: next });
        }
        else if (type === 'color') handleLiveUpdate({ fill: value });
    };

    const handleCaseToggle = () => {
        const currentText = element.text || '';
        if (!currentText) return;
        const isUpper = currentText === currentText.toUpperCase();
        const isLower = currentText === currentText.toLowerCase();
        
        if (isUpper) {
            handleLiveUpdate({ text: currentText.toLowerCase() });
        } else if (isLower) {
            const titleCase = currentText.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
            handleLiveUpdate({ text: titleCase });
        } else {
            handleLiveUpdate({ text: currentText.toUpperCase() });
        }
    };

    const handleAlignmentCycle = () => {
        const order: ('left' | 'center' | 'right' | 'justify')[] = ['left', 'center', 'right', 'justify'];
        const curIdx = order.indexOf(align);
        const next = order[(curIdx + 1) % order.length];
        handleLiveUpdate({ textAlign: next });
    };

    const filteredFonts = CATEGORIZED_FONTS.map(group => ({
        ...group,
        fonts: group.fonts.filter(f => f.toLowerCase().includes(fontSearch.toLowerCase()))
    })).filter(group => group.fonts.length > 0);

    const preventFocusSteal = (e: React.MouseEvent) => e.preventDefault();

    return (
        <div
            ref={toolbarRef}
            className="floating-toolbar absolute z-[3500] flex items-center gap-0.5 text-[#f4f4f5] shadow-[0_16px_40px_rgba(0,0,0,0.85)] border border-white/20 rounded-lg p-1 select-none transition-all animate-in zoom-in-95 duration-200"
            style={{
                backgroundColor: '#18181b',
                left: Math.max(8, (element.x * zoom) + dragOffset.x),
                top: Math.max(8, initialTop + dragOffset.y),
                whiteSpace: 'nowrap',
            }}
        >
            {/* Drag Handle */}
            <div
                onMouseDown={handleDragStart}
                className="cursor-move p-1 text-white/40 hover:text-white rounded-md transition-colors"
                title="Drag Toolbar"
            >
                <GripVertical size={16} />
            </div>

            {/* Font family */}
            <div className="relative" ref={fontMenuRef}>
                <button
                    onClick={() => setIsFontMenuOpen(v => !v)}
                    onMouseDown={preventFocusSteal}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] font-bold tracking-tight transition-all active:scale-95 ${
                        isFontMenuOpen 
                            ? 'bg-[#8B3DFF] text-white shadow-sm' 
                            : 'text-white hover:bg-white/10'
                    }`}
                    style={{ fontFamily: font }}
                >
                    <span className="max-w-[85px] truncate">{font}</span>
                    <ChevronDown size={13} className="text-white/60 shrink-0" />
                </button>
                {isFontMenuOpen && (
                    <div 
                        className={`absolute ${isPopoverOffTop ? 'top-full mt-2 animate-dropdown' : 'bottom-full mb-2 animate-popover'} left-0 w-64 border border-white/20 rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.95)] overflow-hidden z-[3600] flex flex-col text-[#f4f4f5]`}
                        style={{ backgroundColor: '#18181b' }}
                        onMouseDown={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                        onWheel={(e) => e.stopPropagation()}
                    >
                        {/* Search Bar */}
                        <div 
                            className="p-2 border-b border-white/15 flex items-center gap-2 sticky top-0 z-10"
                            style={{ backgroundColor: '#121214' }}
                        >
                            <Search size={14} className="text-zinc-400" />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Search fonts..."
                                value={fontSearch}
                                onChange={e => setFontSearch(e.target.value)}
                                className="w-full bg-transparent border-none outline-none text-[12px] font-bold text-white placeholder:text-zinc-500"
                            />
                        </div>
                        {/* Font List */}
                        <div
                            ref={fontScrollRef}
                            className="max-h-[220px] overflow-y-auto custom-scrollbar p-1 flex flex-col gap-0.5 scroll-smooth overscroll-contain"
                            style={{ backgroundColor: '#18181b' }}
                        >
                            {filteredFonts.map(group => (
                                <div key={group.label} className="flex flex-col p-0.5 mb-1 last:mb-0">
                                    <div 
                                        className="px-2 py-1 text-[9px] font-black text-zinc-400 uppercase tracking-widest rounded-md mb-0.5"
                                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                                    >
                                        {group.label}
                                    </div>
                                    <div className="flex flex-col">
                                        {group.fonts.map(f => (
                                            <button
                                                key={f}
                                                onMouseDown={preventFocusSteal}
                                                onClick={() => { handleLiveUpdate({ fontFamily: f }); setIsFontMenuOpen(false); }}
                                                className={`block w-full text-left px-2.5 py-1.5 text-[12px] rounded-md transition-all ${
                                                    f === font 
                                                        ? 'bg-[#8B3DFF] text-white font-bold shadow-sm' 
                                                        : 'text-zinc-200 hover:bg-white/15 hover:text-white'
                                                }`}
                                                style={{ fontFamily: f }}
                                            >
                                                {f}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            {filteredFonts.length === 0 && (
                                <div className="py-8 text-center text-zinc-400 text-[11px] font-bold uppercase tracking-widest">
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
                        handleLiveUpdate({ fontSize: newSize, width: Math.round(element.width * (newSize / size)) });
                    }}
                    onMouseDown={preventFocusSteal}
                    className="p-1.5 hover:bg-white/10 rounded-md text-white/80 hover:text-white transition-all active:scale-90"
                    title="Decrease font size (-)"
                >
                    <Minus size={14} />
                </button>
                <input
                    type="number"
                    value={Math.round(size)}
                    onChange={e => {
                        const newSize = Math.max(1, Number(e.target.value));
                        handleLiveUpdate({ fontSize: newSize, width: Math.round(element.width * (newSize / size)) });
                    }}
                    onWheel={e => {
                        e.preventDefault();
                        const delta = e.deltaY < 0 ? 1 : -1;
                        const newSize = Math.max(1, size + delta);
                        handleLiveUpdate({ fontSize: newSize, width: Math.round(element.width * (newSize / size)) });
                    }}
                    onKeyDown={e => {
                        if (e.shiftKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
                            e.preventDefault();
                            const delta = e.key === 'ArrowUp' ? 5 : -5;
                            const newSize = Math.max(1, size + delta);
                            handleLiveUpdate({ fontSize: newSize, width: Math.round(element.width * (newSize / size)) });
                        }
                    }}
                    className="w-10 text-center text-[12px] font-black text-white bg-black/60 border border-white/20 rounded-md py-0.5 outline-none focus:border-[#8B3DFF] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                    onClick={() => {
                        const newSize = size + 1;
                        handleLiveUpdate({ fontSize: newSize, width: Math.round(element.width * (newSize / size)) });
                    }}
                    onMouseDown={preventFocusSteal}
                    className="p-1.5 hover:bg-white/10 rounded-md text-white/80 hover:text-white transition-all active:scale-90"
                    title="Increase font size (+)"
                >
                    <Plus size={14} />
                </button>
            </div>

            <Divider />

            {/* Color & Formatting */}
            <div className="flex items-center gap-0.5 px-0.5">
                {/* Text Color Button with High Contrast & Clear Color Swatch Bar */}
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
                    className="p-1.5 px-2 rounded-md transition-all active:scale-95 hover:bg-white/10 text-white flex flex-col items-center justify-center gap-0.5"
                    title="Text Color"
                >
                    {color.includes('gradient') ? (
                        <div className="w-5 h-4 rounded-[3px] border border-white/40 shadow-inner" style={{ background: color }} />
                    ) : (
                        <div className="flex flex-col items-center justify-center">
                            <span className="font-serif font-black text-[14px] leading-none text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">A</span>
                            <div 
                                className="w-4 h-[3.5px] rounded-[1px] mt-0.5 border border-white/40 shadow-sm" 
                                style={{ backgroundColor: color }} 
                            />
                        </div>
                    )}
                </button>

                {/* Bold */}
                <button
                    onClick={() => handleAction('bold')}
                    onMouseDown={preventFocusSteal}
                    className={`p-1.5 rounded-md transition-all active:scale-95 ${
                        isBold 
                            ? 'bg-[#8B3DFF] text-white shadow-sm font-bold' 
                            : 'hover:bg-white/10 text-zinc-300 hover:text-white'
                    }`}
                    title="Bold (Ctrl+B)"
                >
                    <Bold size={15} strokeWidth={isBold ? 3 : 2} />
                </button>

                {/* Italic */}
                <button
                    onClick={() => handleAction('italic')}
                    onMouseDown={preventFocusSteal}
                    className={`p-1.5 rounded-md transition-all active:scale-95 ${
                        isItalic 
                            ? 'bg-[#8B3DFF] text-white shadow-sm font-bold' 
                            : 'hover:bg-white/10 text-zinc-300 hover:text-white'
                    }`}
                    title="Italic (Ctrl+I)"
                >
                    <Italic size={15} strokeWidth={isItalic ? 3 : 2} />
                </button>

                {/* Underline */}
                <button
                    onClick={() => handleAction('underline')}
                    onMouseDown={preventFocusSteal}
                    className={`p-1.5 rounded-md transition-all active:scale-95 ${
                        isUnderline 
                            ? 'bg-[#8B3DFF] text-white shadow-sm font-bold' 
                            : 'hover:bg-white/10 text-zinc-300 hover:text-white'
                    }`}
                    title="Underline (Ctrl+U)"
                >
                    <Underline size={15} strokeWidth={isUnderline ? 3 : 2} />
                </button>

                {/* Strikethrough */}
                <button
                    onClick={() => handleAction('strikethrough')}
                    onMouseDown={preventFocusSteal}
                    className={`p-1.5 rounded-md transition-all active:scale-95 ${
                        isStrikethrough 
                            ? 'bg-[#8B3DFF] text-white shadow-sm font-bold' 
                            : 'hover:bg-white/10 text-zinc-300 hover:text-white'
                    }`}
                    title="Strikethrough"
                >
                    <Strikethrough size={15} strokeWidth={isStrikethrough ? 3 : 2} />
                </button>

                {/* Uppercase / Lowercase / Title Case Toggle */}
                <button
                    onClick={handleCaseToggle}
                    onMouseDown={preventFocusSteal}
                    className="p-1.5 px-2 rounded-md hover:bg-white/10 text-zinc-300 hover:text-white transition-all active:scale-95"
                    title="Change Letter Case (aA)"
                >
                    <span className="font-bold text-[13px] tracking-tight">aA</span>
                </button>
            </div>

            <Divider />

            {/* Alignment & Spacing & Effects */}
            <div className="flex items-center gap-0.5 px-0.5">
                {/* Alignment */}
                <button
                    onClick={handleAlignmentCycle}
                    onMouseDown={preventFocusSteal}
                    className="p-1.5 rounded-md hover:bg-white/10 text-zinc-300 hover:text-white transition-all active:scale-95"
                    title={`Alignment: ${align.toUpperCase()}`}
                >
                    {align === 'left' && <AlignLeft size={15} />}
                    {align === 'center' && <AlignCenter size={15} />}
                    {align === 'right' && <AlignRight size={15} />}
                    {align === 'justify' && <AlignJustify size={15} />}
                </button>

                {/* Spacing Popover */}
                <div className="relative" ref={settingsRef}>
                    <button
                        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                        onMouseDown={preventFocusSteal}
                        className={`p-1.5 rounded-md transition-all active:scale-95 ${
                            isSettingsOpen 
                                ? 'bg-[#8B3DFF] text-white shadow-sm' 
                                : 'hover:bg-white/10 text-zinc-300 hover:text-white'
                        }`}
                        title="Letter Spacing & Line Height"
                    >
                        <Sliders size={15} />
                    </button>
                    {isSettingsOpen && (
                        <div
                            className={`absolute ${isPopoverOffTop ? 'top-full mt-2 animate-dropdown' : 'bottom-full mb-2 animate-popover-center'} left-1/2 -translate-x-1/2 w-[240px] border border-white/20 rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.95)] p-3.5 text-[#f4f4f5] z-[3600]`}
                            style={{ backgroundColor: '#18181b', maxHeight: '340px', overflowY: 'auto' }}
                            onMouseDown={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
                            onWheel={(e) => e.stopPropagation()}
                        >
                            <div className="space-y-3.5">
                                {/* Letter Spacing */}
                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider leading-none">Letter Spacing</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={Math.max(0, Math.round(element.letterSpacing || 0))}
                                            onChange={e => {
                                                const val = parseFloat(e.target.value);
                                                handleLiveUpdate({ letterSpacing: isNaN(val) ? 0 : Math.max(0, val) });
                                            }}
                                            className="text-[11px] font-black text-white bg-black/60 border border-white/20 rounded-md px-1.5 py-0.5 w-12 text-right outline-none focus:border-[#8B3DFF] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none m-0"
                                        />
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1000"
                                        step="1"
                                        value={Math.max(0, element.letterSpacing || 0)}
                                        onInput={e => {
                                            const val = parseFloat((e.target as HTMLInputElement).value);
                                            handleLiveUpdate({ letterSpacing: isNaN(val) ? 0 : Math.max(0, val) });
                                        }}
                                        onChange={e => {
                                            const val = parseFloat(e.target.value);
                                            handleLiveUpdate({ letterSpacing: isNaN(val) ? 0 : Math.max(0, val) });
                                        }}
                                        className="w-full h-1.5 bg-zinc-700 rounded-full appearance-none cursor-pointer accent-[#8B3DFF]"
                                    />
                                </div>
                                {/* Line Spacing (Default 24px) */}
                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider leading-none">Line Spacing</label>
                                        <div className="flex items-center gap-1">
                                            <input
                                                type="number"
                                                min="1"
                                                max="200"
                                                value={Math.round((element.lineHeight ?? (24 / (element.fontSize || 16))) * (element.fontSize || 16))}
                                                onChange={e => {
                                                    const pxVal = parseFloat(e.target.value);
                                                    if (!isNaN(pxVal) && pxVal > 0) {
                                                        const currentSize = element.fontSize || 16;
                                                        handleLiveUpdate({ lineHeight: Number((pxVal / currentSize).toFixed(2)) });
                                                    }
                                                }}
                                                className="text-[11px] font-black text-white bg-black/60 border border-white/20 rounded-md px-1.5 py-0.5 w-12 text-right outline-none focus:border-[#8B3DFF] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none m-0"
                                            />
                                            <span className="text-[11px] font-bold text-zinc-400">px</span>
                                        </div>
                                    </div>
                                    <input
                                        type="range"
                                        min={Math.max(10, Math.round((element.fontSize || 16) * 0.5))}
                                        max={Math.max(80, Math.round((element.fontSize || 16) * 3.0))}
                                        step="1"
                                        value={Math.round((element.lineHeight ?? (24 / (element.fontSize || 16))) * (element.fontSize || 16))}
                                        onInput={e => {
                                            const pxVal = parseFloat((e.target as HTMLInputElement).value);
                                            const currentSize = element.fontSize || 16;
                                            handleLiveUpdate({ lineHeight: Number((pxVal / currentSize).toFixed(2)) });
                                        }}
                                        onChange={e => {
                                            const pxVal = parseFloat(e.target.value);
                                            const currentSize = element.fontSize || 16;
                                            handleLiveUpdate({ lineHeight: Number((pxVal / currentSize).toFixed(2)) });
                                        }}
                                        className="w-full h-1.5 bg-zinc-700 rounded-full appearance-none cursor-pointer accent-[#8B3DFF]"
                                    />
                                </div>
                                {/* Transparency */}
                                <div className="space-y-1.5 border-t border-white/15 pt-2.5">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider leading-none">Transparency</label>
                                        <div className="flex items-center gap-0.5">
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={Math.round((element.opacity ?? 1) * 100)}
                                                onChange={e => {
                                                    const val = parseInt(e.target.value);
                                                    if (!isNaN(val)) handleLiveUpdate({ opacity: Math.min(100, Math.max(0, val)) / 100 });
                                                }}
                                                className="text-[11px] font-black text-white bg-black/60 border border-white/20 rounded-md px-1.5 py-0.5 w-10 text-right outline-none focus:border-[#8B3DFF] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none m-0"
                                            />
                                            <span className="text-[11px] font-black text-zinc-400">%</span>
                                        </div>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={element.opacity ?? 1}
                                        onInput={e => handleLiveUpdate({ opacity: parseFloat((e.target as HTMLInputElement).value) })}
                                        onChange={e => handleLiveUpdate({ opacity: parseFloat(e.target.value) })}
                                        className="w-full h-1.5 bg-zinc-700 rounded-full appearance-none cursor-pointer accent-[#8B3DFF]"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Effects Button (Opens Canva-style Text Effects panel in Sidebar) */}
                <button
                    onClick={() => {
                        setSidebarExpanded(true);
                        setEditorTab(editorTab === 'text-effects' ? 'text' : 'text-effects');
                    }}
                    onMouseDown={preventFocusSteal}
                    className={`p-1.5 px-2.5 rounded-md transition-all active:scale-95 flex items-center gap-1.5 text-[12px] font-bold ${
                        editorTab === 'text-effects' || (activeEffect && activeEffect !== 'none')
                            ? 'bg-[#8B3DFF] text-white shadow-sm ring-1 ring-purple-400/40' 
                            : 'hover:bg-white/10 text-zinc-300 hover:text-white'
                    }`}
                    title="Text Effects (Opens in Sidebar)"
                >
                    <Sparkles size={14} />
                    <span className="hidden sm:inline text-[11px]">Effects</span>
                </button>

                <Divider />

                {/* Layer Control Menu */}
                <div className="relative" ref={layerMenuRef}>
                    <button
                        onClick={() => setIsLayerMenuOpen(!isLayerMenuOpen)}
                        onMouseDown={preventFocusSteal}
                        className={`p-1.5 rounded-md transition-all active:scale-95 ${
                            isLayerMenuOpen 
                                ? 'bg-[#8B3DFF] text-white shadow-sm' 
                                : 'hover:bg-white/10 text-zinc-300 hover:text-white'
                        }`}
                        title="Position / Layer Order"
                    >
                        <Layers size={15} />
                    </button>
                    {isLayerMenuOpen && (
                        <div
                            className={`absolute ${isPopoverOffTop ? 'top-full mt-2 animate-dropdown-right' : 'bottom-full mb-2 animate-popover'} right-0 w-[200px] border border-white/20 rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.95)] p-2 z-[3600] text-[#f4f4f5]`}
                            style={{ backgroundColor: '#18181b' }}
                        >
                            <div className="space-y-1">
                                <div className="px-2.5 py-1 border-b border-white/15">
                                    <span className="text-[9px] font-black text-white/60 uppercase tracking-widest">Layer Order</span>
                                </div>
                                <button
                                    onClick={() => {
                                        reorderElement(currentPageIndex, element.id, 'front');
                                        setIsLayerMenuOpen(false);
                                    }}
                                    className="w-full px-2.5 py-1.5 text-left text-xs font-bold text-zinc-200 hover:bg-[#8B3DFF] hover:text-white rounded-md flex items-center justify-between transition-colors"
                                >
                                    <span>Bring to Front</span>
                                    <ArrowUpToLine size={14} className="text-white/60" />
                                </button>
                                <button
                                    onClick={() => {
                                        reorderElement(currentPageIndex, element.id, 'forward');
                                        setIsLayerMenuOpen(false);
                                    }}
                                    className="w-full px-2.5 py-1.5 text-left text-xs font-bold text-zinc-200 hover:bg-[#8B3DFF] hover:text-white rounded-md flex items-center justify-between transition-colors"
                                >
                                    <span>Bring Forward</span>
                                    <ChevronUp size={14} className="text-white/60" />
                                </button>
                                <button
                                    onClick={() => {
                                        reorderElement(currentPageIndex, element.id, 'backward');
                                        setIsLayerMenuOpen(false);
                                    }}
                                    className="w-full px-2.5 py-1.5 text-left text-xs font-bold text-zinc-200 hover:bg-[#8B3DFF] hover:text-white rounded-md flex items-center justify-between transition-colors"
                                >
                                    <span>Send Backward</span>
                                    <ChevronDown size={14} className="text-white/60" />
                                </button>
                                <button
                                    onClick={() => {
                                        reorderElement(currentPageIndex, element.id, 'back');
                                        setIsLayerMenuOpen(false);
                                    }}
                                    className="w-full px-2.5 py-1.5 text-left text-xs font-bold text-zinc-200 hover:bg-[#8B3DFF] hover:text-white rounded-md flex items-center justify-between transition-colors"
                                >
                                    <span>Send to Back</span>
                                    <ArrowDownToLine size={14} className="text-white/60" />
                                </button>

                                <div className="pt-1 border-t border-white/15">
                                    <button
                                        onClick={() => {
                                            setSidebarExpanded(true);
                                            setEditorTab('layers');
                                            setIsLayerMenuOpen(false);
                                        }}
                                        className="w-full px-2.5 py-1.5 text-left text-[10px] font-black text-purple-400 hover:bg-purple-900/30 rounded-md flex items-center gap-2 transition-colors uppercase tracking-wider"
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
                    className="p-1.5 rounded-md hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-all active:scale-95"
                    title="Delete Element (Del)"
                >
                    <Trash2 size={15} />
                </button>
            </div>
        </div>
    );
};
