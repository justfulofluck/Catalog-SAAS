import React, { useState, useRef, useEffect } from 'react';
import {
    Bold, Italic, Underline,
    Minus, Plus,
    AlignLeft, AlignCenter, AlignRight,
    ChevronDown, MoreHorizontal
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

const Divider = () => <div className="w-px h-4 bg-slate-200 mx-0.5 shrink-0" />;

export const FloatingTextToolbar: React.FC<Props> = ({ element, onUpdate, zoom }) => {
    const { isPropertyPanelOpen, setIsPropertyPanelOpen, catalog } = useStore();
    const [showFontMenu, setShowFontMenu] = useState(false);
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
            if (fontMenuRef.current && !fontMenuRef.current.contains(e.target as Node)) setShowFontMenu(false);
        };
        if (showFontMenu) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [showFontMenu]);

    const handleAction = (type: 'bold' | 'italic' | 'underline' | 'color', value?: string) => {
        const sel = window.getSelection();
        const hasSelection = sel && !sel.isCollapsed && sel.rangeCount > 0;

        if (hasSelection) {
            // Use improved native toggle/set commands
            let success = false;
            if (type === 'bold') success = toggleStyle('bold');
            else if (type === 'italic') success = toggleStyle('italic');
            else if (type === 'underline') success = toggleStyle('underline');
            else if (type === 'color') success = toggleStyle('foreColor', value);

            if (success) return; // Native command handled the toggle/application correctly
        }

        // Fallback or global update
        if (type === 'bold') onUpdate({ fontWeight: isBold ? 'normal' : 'bold' });
        else if (type === 'italic') onUpdate({ fontStyle: isItalic ? 'normal' : 'italic' });
        else if (type === 'underline') onUpdate({ textDecoration: isUnderline ? 'none' : 'underline' });
        else if (type === 'color') onUpdate({ fill: value });
    };

    const handleAlignment = (a: 'left' | 'center' | 'right') => {
        const { marginLeft, marginRight } = catalog;
        let newX = element.x;
        const width = element.width;
        const mLeft = marginLeft || 40;
        const mRight = marginRight || 40;

        if (a === 'left') {
            newX = mLeft;
        } else if (a === 'center') {
            newX = (PAGE_WIDTH + mLeft - mRight - width) / 2;
        } else if (a === 'right') {
            newX = PAGE_WIDTH - width - mRight;
        }

        onUpdate({ textAlign: a, x: newX });
    };

    return (
        <div
            className="absolute z-[2000] flex items-center gap-0.5 bg-white rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.18)] border border-slate-100 px-2 py-1 select-none"
            style={{
                left: element.x * zoom,
                top: Math.max(0, element.y * zoom - 52),
                whiteSpace: 'nowrap',
            }}
            onMouseDown={e => e.preventDefault()}
        >
            {/* Font family */}
            <div className="relative" ref={fontMenuRef}>
                <button
                    onClick={() => setShowFontMenu(v => !v)}
                    className="flex items-center gap-1 px-2 py-1 hover:bg-slate-50 rounded-full text-slate-700 text-[11px] font-bold transition-colors"
                    style={{ fontFamily: font }}
                >
                    <span className="max-w-[80px] truncate">{font}</span>
                    <ChevronDown size={10} className="text-slate-400 shrink-0" />
                </button>
                {showFontMenu && (
                    <div className="absolute top-full mt-2 left-0 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-y-auto z-50 py-2 px-1"
                        style={{ maxHeight: 350 }}>
                        {CATEGORIZED_FONTS.map(group => (
                            <div key={group.label} className="mb-2">
                                <div className="px-3 py-1 text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50 rounded-lg mb-1">
                                    {group.label}
                                </div>
                                {group.fonts.map(f => (
                                    <button
                                        key={f}
                                        onClick={() => { onUpdate({ fontFamily: f }); setShowFontMenu(false); }}
                                        className={`w-full text-left px-3 py-1.5 text-[11px] hover:bg-indigo-50 hover:text-indigo-700 rounded-lg transition-colors ${f === font ? 'text-indigo-600 font-bold bg-indigo-50/50' : 'text-slate-700'}`}
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
            <div className="flex items-center gap-0.5 px-0.5">
                <button
                    onClick={() => onUpdate({ fontSize: Math.max(6, size - 1) })}
                    className="p-1 hover:bg-slate-50 rounded-full text-slate-400 hover:text-indigo-600 transition-all"
                >
                    <Minus size={11} />
                </button>
                <input
                    type="number"
                    value={Math.round(size)}
                    onChange={e => onUpdate({ fontSize: Math.max(6, Number(e.target.value)) })}
                    className="w-8 text-center text-[11px] font-bold text-slate-700 bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                    onClick={() => onUpdate({ fontSize: size + 1 })}
                    className="p-1 hover:bg-slate-50 rounded-full text-slate-400 hover:text-indigo-600 transition-all"
                >
                    <Plus size={11} />
                </button>
            </div>

            <Divider />

            {/* Bold/Italic/Underline Group */}
            <div className="flex items-center gap-0.5">
                <button
                    onClick={() => handleAction('bold')}
                    className={`p-1.5 rounded-full transition-all ${isBold ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-50 text-slate-500'}`}
                    title="Bold"
                >
                    <Bold size={14} strokeWidth={2.5} />
                </button>
                <button
                    onClick={() => handleAction('italic')}
                    className={`p-1.5 rounded-full transition-all ${isItalic ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-50 text-slate-500'}`}
                    title="Italic"
                >
                    <Italic size={14} strokeWidth={2.5} />
                </button>
                <button
                    onClick={() => handleAction('underline')}
                    className={`p-1.5 rounded-full transition-all ${isUnderline ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-50 text-slate-500'}`}
                    title="Underline"
                >
                    <Underline size={14} strokeWidth={2.5} />
                </button>
            </div>

            <Divider />

            {/* Alignment */}
            <div className="flex items-center gap-0.5">
                {(['left', 'center', 'right'] as const).map(a => (
                    <button
                        key={a}
                        onClick={() => handleAlignment(a)}
                        className={`p-1.5 rounded-full transition-all ${align === a ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-50 text-slate-400'}`}
                    >
                        {a === 'left' && <AlignLeft size={14} />}
                        {a === 'center' && <AlignCenter size={14} />}
                        {a === 'right' && <AlignRight size={14} />}
                    </button>
                ))}
            </div>

            <Divider />

            {/* Text color */}
            <button
                onClick={() => colorInputRef.current?.click()}
                className="p-1.5 rounded-full hover:bg-slate-50 text-slate-600 relative transition-colors"
                title="Text Color"
            >
                <div className="flex flex-col items-center gap-0">
                    <span className="font-serif font-black text-[12px] leading-tight" style={{ color }}>A</span>
                    <div className="w-3.5 h-0.5 rounded-full" style={{ backgroundColor: color }} />
                </div>
                <input
                    ref={colorInputRef}
                    type="color"
                    value={color}
                    onChange={e => handleAction('color', e.target.value)}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                />
            </button>

            <Divider />

            {/* More / Toggle Properties */}
            <button
                onClick={() => setIsPropertyPanelOpen(!isPropertyPanelOpen)}
                className={`p-1.5 rounded-full transition-all ${isPropertyPanelOpen ? 'bg-indigo-600 text-white shadow-sm' : 'hover:bg-slate-50 text-slate-400 hover:text-slate-600'}`}
                title="Show Properties"
            >
                <MoreHorizontal size={14} />
            </button>
        </div>
    );
};
