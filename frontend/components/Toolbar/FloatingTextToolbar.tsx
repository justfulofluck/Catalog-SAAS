import React, { useState, useRef, useEffect } from 'react';
import {
    Bold, Italic, Underline,
    Minus, Plus,
    AlignLeft, AlignCenter, AlignRight,
    ChevronDown, MoreHorizontal,
    Type, Wand2, Layers, Move,
    Type as CaseUpper, // Corrected from TypeasUppercase
    Highlighter, // For Effects
    ArrowUp01 // For Spacing (placeholder)
} from 'lucide-react';
import { CanvasElement } from '../../types';
import { FONTS, CATEGORIZED_FONTS, PAGE_WIDTH, PAGE_HEIGHT } from '../../constants';
import { useStore } from '../../store/useStore';
import { toggleStyle } from '../../utils/textStyleSelection';

interface Props {
    element: CanvasElement;
    onUpdate: (updates: Partial<CanvasElement>) => void;
    zoom: number;
}

const Divider = () => <div className="w-[1px] h-5 bg-slate-200/80 mx-1 shrink-0" />;

export const FloatingTextToolbar: React.FC<Props> = ({ element, onUpdate, zoom }) => {
    const { isPropertyPanelOpen, setIsPropertyPanelOpen, catalog } = useStore();
    const [fontSize, setFontSize] = useState(element.fontSize || 16);
    const [isFontMenuOpen, setIsFontMenuOpen] = useState(false);
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
    const [fontSearch, setFontSearch] = useState('');
    const fontMenuRef = useRef<HTMLDivElement>(null);
    const colorInputRef = useRef<HTMLInputElement>(null);

    const font = element.fontFamily || 'Inter';
    const size = element.fontSize || 16;
    const isBold = element.fontWeight === 'bold' || element.fontWeight === '700';
    const isItalic = element.fontStyle === 'italic';
    const isUnderline = !!(element.textDecoration?.includes('underline'));
    const align = element.textAlign || 'left';
    const color = (element.fill && !element.fill.includes('gradient')) ? element.fill : '#1e293b';

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (fontMenuRef.current && !fontMenuRef.current.contains(e.target as Node)) setIsFontMenuOpen(false);
        };
        if (isFontMenuOpen) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [isFontMenuOpen]);

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

    return (
        <div
            className="absolute z-[2000] flex items-center gap-0.5 bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.15),0_0_0_1px_rgba(0,0,0,0.05)] border border-white/20 p-1.5 select-none transition-all animate-in zoom-in-95 duration-200"
            style={{
                left: element.x * zoom,
                top: Math.max(0, element.y * zoom - 64), // Slightly more offset for new look
                whiteSpace: 'nowrap',
            }}
            onMouseDown={e => e.preventDefault()}
        >
            {/* Font family */}
            <div className="relative" ref={fontMenuRef}>
                <button
                    onClick={() => setIsFontMenuOpen(v => !v)}
                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100 rounded-xl text-slate-800 text-[12px] font-black tracking-tight transition-all active:scale-95"
                    style={{ fontFamily: font }}
                >
                    <span className="max-w-[70px] truncate">{font}</span>
                    <ChevronDown size={12} className="text-slate-400 shrink-0" />
                </button>
                {isFontMenuOpen && (
                    <div className="absolute top-full mt-3 left-0 w-64 bg-white border border-slate-200/60 rounded-2xl shadow-2xl overflow-y-auto z-50 py-3 px-1 animate-in slide-in-from-top-2 duration-300"
                        style={{ maxHeight: 350 }}>
                        {CATEGORIZED_FONTS.map(group => (
                            <div key={group.label} className="mb-3">
                                <div className="px-4 py-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/80 rounded-lg mb-1.5 mx-2">
                                    {group.label}
                                </div>
                                {group.fonts.map(f => (
                                    <button
                                        key={f}
                                        onClick={() => { onUpdate({ fontFamily: f }); setIsFontMenuOpen(false); }}
                                        className={`w-full text-left px-4 py-2 text-[12px] hover:bg-slate-100 rounded-xl transition-all ${f === font ? 'text-indigo-600 font-bold bg-indigo-50/50' : 'text-slate-700'}`}
                                        style={{ fontFamily: f }}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Divider />

            {/* Font size */}
            <div className="flex items-center gap-1 px-1">
                <button
                    onClick={() => onUpdate({ fontSize: Math.max(6, size - 1) })}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-all active:scale-90"
                >
                    <Minus size={14} />
                </button>
                <input
                    type="number"
                    value={Math.round(size)}
                    onChange={e => onUpdate({ fontSize: Math.max(1, Number(e.target.value)) })}
                    onKeyDown={e => {
                        if (e.key === 'ArrowUp') {
                            e.preventDefault();
                            onUpdate({ fontSize: size + (e.shiftKey ? 5 : 1) });
                        } else if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            onUpdate({ fontSize: Math.max(1, size - (e.shiftKey ? 5 : 1)) });
                        }
                    }}
                    className="w-10 text-center text-[12px] font-black text-slate-800 bg-transparent outline-none border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                    onClick={() => onUpdate({ fontSize: size + 1 })}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-all active:scale-90"
                >
                    <Plus size={14} />
                </button>
            </div>

            <Divider />

            {/* Formatting Group */}
            <div className="flex items-center gap-1 px-1">
                <button
                    onClick={() => colorInputRef.current?.click()}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 relative transition-all active:scale-95"
                    title="Text Color"
                >
                    <div className="flex flex-col items-center gap-0">
                        <span className="font-serif font-black text-[14px] leading-tight" style={{ color }}>A</span>
                        <div className="w-4 h-[3px] rounded-full" style={{ backgroundColor: color }} />
                    </div>
                    <input
                        ref={colorInputRef}
                        type="color"
                        value={color}
                        onChange={e => handleAction('color', e.target.value)}
                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    />
                </button>
                <button
                    onClick={() => handleAction('bold')}
                    className={`p-2 rounded-lg transition-all active:scale-95 ${isBold ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-slate-100 text-slate-600'}`}
                    title="Bold"
                >
                    <Bold size={16} strokeWidth={3} />
                </button>
                <button
                    onClick={() => handleAction('italic')}
                    className={`p-2 rounded-lg transition-all active:scale-95 ${isItalic ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-slate-100 text-slate-600'}`}
                    title="Italic"
                >
                    <Italic size={16} strokeWidth={3} />
                </button>
                <button
                    onClick={() => handleAction('underline')}
                    className={`p-2 rounded-lg transition-all active:scale-95 ${isUnderline ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-slate-100 text-slate-600'}`}
                    title="Underline"
                >
                    <Underline size={16} strokeWidth={3} />
                </button>
            </div>

            <Divider />

            {/* Alignment & Utilities */}
            <div className="flex items-center gap-1 px-1">
                <button
                    onClick={() => handleAlignment(align === 'left' ? 'center' : align === 'center' ? 'right' : 'left')}
                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-all active:scale-95"
                >
                    {align === 'left' && <AlignLeft size={16} />}
                    {align === 'center' && <AlignCenter size={16} />}
                    {align === 'right' && <AlignRight size={16} />}
                </button>
                <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-all active:scale-95" title="Spacing">
                    <ArrowUp01 size={16} />
                </button>
            </div>

            {/* More Menu (Three Dots) */}
            <div className="relative flex items-center gap-1 px-1">
                <button
                    onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                    className={`p-2 rounded-lg transition-all active:scale-95 ${isMoreMenuOpen ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-slate-100 text-slate-600'}`}
                    title="More"
                >
                    <MoreHorizontal size={18} />
                </button>

                {isMoreMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in duration-200">
                        <button
                            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 text-slate-700 text-sm transition-colors"
                            onClick={() => { /* Handle Uppercase */ setIsMoreMenuOpen(false); }}
                        >
                            <CaseUpper size={16} className="text-slate-400" />
                            <span>Uppercase</span>
                        </button>
                        <button
                            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 text-slate-700 text-sm transition-colors"
                            onClick={() => { /* Handle Effects */ setIsMoreMenuOpen(false); }}
                        >
                            <Wand2 size={16} className="text-indigo-500" />
                            <span>Effects</span>
                        </button>
                        <button
                            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 text-slate-700 text-sm transition-colors"
                            onClick={() => {
                                setIsPropertyPanelOpen(!isPropertyPanelOpen);
                                setIsMoreMenuOpen(false);
                            }}
                        >
                            <Layers size={16} className="text-indigo-500" />
                            <span>Position</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
