import React, { useState, useEffect, useRef } from 'react';
import { Palette, Layers as GradientIcon, ArrowRight, ArrowDown, MoveUpRight } from 'lucide-react';

interface AdvancedColorPickerProps {
    color: string;
    onChange: (color: string) => void;
}

const AdvancedColorPicker: React.FC<AdvancedColorPickerProps> = ({ color, onChange }) => {
    const isGradientInitial = color?.includes('gradient');
    const [mode, setMode] = useState<'solid' | 'gradient'>(isGradientInitial ? 'gradient' : 'solid');

    // Update mode when color prop changes (e.g., switching between elements)
    useEffect(() => {
        const isGradient = color?.includes('gradient');
        setMode(isGradient ? 'gradient' : 'solid');
    }, [color]);

    // Parse gradient string: linear-gradient(to right, #HEX, #HEX)
    const parseGradient = (str: string) => {
        if (!str || !str.includes('linear-gradient')) return { c1: '#4F46E5', c2: '#EC4899', dir: 'to right' };
        const match = str.match(/linear-gradient\s*\(\s*([^,]+)\s*,\s*(#[a-fA-F0-9]+)\s*,\s*(#[a-fA-F0-9]+)\s*\)/i);
        if (match) return { dir: match[1].trim(), c1: match[2].trim(), c2: match[3].trim() };
        return { c1: '#4F46E5', c2: '#EC4899', dir: 'to right' };
    };

    const initialGrad = parseGradient(color);
    const [gradData, setGradData] = useState(initialGrad);
    const [activeColorIdx, setActiveColorIdx] = useState<1 | 2>(1);

    const [hsv, setHsv] = useState({ h: 0, s: 100, v: 100 });
    const svRef = useRef<HTMLDivElement>(null);
    const hRef = useRef<HTMLDivElement>(null);

    // Helpers
    const hexToHsv = (hex: string) => {
        hex = hex.replace('#', '');
        if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
        const r = parseInt(hex.substring(0, 2), 16) / 255;
        const g = parseInt(hex.substring(2, 4), 16) / 255;
        const b = parseInt(hex.substring(4, 6), 16) / 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h = 0, s, v = max;
        const d = max - min;
        s = max === 0 ? 0 : d / max;
        if (max !== min) {
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return { h: h * 360, s: s * 100, v: v * 100 };
    };

    const hsvToHex = (h: number, s: number, v: number) => {
        s /= 100; v /= 100;
        const i = Math.floor(h / 60) % 6, f = h / 60 - i, p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s);
        let r = 0, g = 0, b = 0;
        switch (i) {
            case 0: r = v; g = t; b = p; break;
            case 1: r = q; g = v; b = p; break;
            case 2: r = p; g = v; b = t; break;
            case 3: r = p; g = q; b = v; break;
            case 4: r = t; g = p; b = v; break;
            case 5: r = v; g = p; b = q; break;
        }
        const toHex = (n: number) => Math.round(n * 255).toString(16).padStart(2, '0');
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
    };

    useEffect(() => {
        const targetColor = mode === 'solid' ? color : (activeColorIdx === 1 ? gradData.c1 : gradData.c2);
        if (targetColor && !targetColor.includes('gradient')) {
            setHsv(hexToHsv(targetColor));
        }
    }, [color, mode, activeColorIdx]);

    const updateColor = (newHex: string) => {
        if (mode === 'solid') {
            onChange(newHex);
        } else {
            const newData = { ...gradData, [activeColorIdx === 1 ? 'c1' : 'c2']: newHex };
            setGradData(newData);
            onChange(`linear-gradient(${newData.dir}, ${newData.c1}, ${newData.c2})`);
        }
    };

    const handleSvMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        const updateSv = (event: MouseEvent | TouchEvent) => {
            if (!svRef.current) return;
            const rect = svRef.current.getBoundingClientRect();
            const clientX = 'touches' in event ? event.touches[0].clientX : (event as MouseEvent).clientX;
            const clientY = 'touches' in event ? event.touches[0].clientY : (event as MouseEvent).clientY;
            const s = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
            const v = Math.min(100, Math.max(0, (1 - (clientY - rect.top) / rect.height) * 100));
            setHsv(prev => ({ ...prev, s, v }));
            updateColor(hsvToHex(hsv.h, s, v));
        };
        const stop = () => { window.removeEventListener('mousemove', updateSv); window.removeEventListener('mouseup', stop); window.removeEventListener('touchmove', updateSv); window.removeEventListener('touchend', stop); };
        window.addEventListener('mousemove', updateSv); window.addEventListener('mouseup', stop); window.addEventListener('touchmove', updateSv); window.addEventListener('touchend', stop);
        updateSv(e.nativeEvent as any);
    };

    const handleHueMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        const updateHue = (event: MouseEvent | TouchEvent) => {
            if (!hRef.current) return;
            const rect = hRef.current.getBoundingClientRect();
            const clientX = 'touches' in event ? event.touches[0].clientX : (event as MouseEvent).clientX;
            const h = Math.min(360, Math.max(0, ((clientX - rect.left) / rect.width) * 360));
            setHsv(prev => ({ ...prev, h }));
            updateColor(hsvToHex(h, hsv.s, hsv.v));
        };
        const stop = () => { window.removeEventListener('mousemove', updateHue); window.removeEventListener('mouseup', stop); window.removeEventListener('touchmove', updateHue); window.removeEventListener('touchend', stop); };
        window.addEventListener('mousemove', updateHue); window.addEventListener('mouseup', stop); window.addEventListener('touchmove', updateHue); window.addEventListener('touchend', stop);
        updateHue(e.nativeEvent as any);
    };

    const setDirection = (dir: string) => {
        const newData = { ...gradData, dir };
        setGradData(newData);
        onChange(`linear-gradient(${dir}, ${newData.c1}, ${newData.c2})`);
    };

    return (
        <div className="flex flex-col gap-3 select-none">
            {/* Mode Toggle */}
            <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => { setMode('solid'); onChange(gradData.c1); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${mode === 'solid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <Palette size={11} /> Solid
                </button>
                <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => { setMode('gradient'); onChange(`linear-gradient(${gradData.dir}, ${gradData.c1}, ${gradData.c2})`); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${mode === 'gradient' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <GradientIcon size={11} /> Gradient
                </button>
            </div>

            {mode === 'gradient' && (
                <div className="space-y-3">
                    {/* Gradient Preview & Color Selection */}
                    <div className="flex items-center gap-2">
                        <button
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => setActiveColorIdx(1)}
                            className={`w-7 h-7 rounded-lg border-2 transition-all ${activeColorIdx === 1 ? 'border-indigo-600 scale-105' : 'border-transparent opacity-60'}`}
                            style={{ backgroundColor: gradData.c1 }}
                        />
                        <div className="flex-1 h-2 rounded-full border border-slate-100" style={{ background: `linear-gradient(to right, ${gradData.c1}, ${gradData.c2})` }} />
                        <button
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => setActiveColorIdx(2)}
                            className={`w-7 h-7 rounded-lg border-2 transition-all ${activeColorIdx === 2 ? 'border-indigo-600 scale-105' : 'border-transparent opacity-60'}`}
                            style={{ backgroundColor: gradData.c2 }}
                        />
                    </div>

                    {/* Direction Selection */}
                    <div className="flex justify-center gap-2">
                        {[
                            { dir: 'to right', icon: <ArrowRight size={12} /> },
                            { dir: 'to bottom', icon: <ArrowDown size={12} /> },
                            { dir: 'to bottom right', icon: <MoveUpRight size={12} className="rotate-90" /> },
                            { dir: 'to top right', icon: <MoveUpRight size={12} /> },
                        ].map(d => (
                            <button
                                key={d.dir}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => setDirection(d.dir)}
                                className={`p-1.5 rounded-lg border transition-all ${gradData.dir === d.dir ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                            >
                                {d.icon}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Picker Area */}
            <div
                ref={svRef}
                className="w-full aspect-square rounded-xl relative cursor-crosshair overflow-hidden shadow-inner"
                style={{ backgroundColor: `hsl(${hsv.h}, 100%, 50%)` }}
                onMouseDown={handleSvMouseDown}
                onTouchStart={handleSvMouseDown}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                <div
                    className="absolute w-3 h-3 border-2 border-white rounded-full shadow-md -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ left: `${hsv.s}%`, top: `${100 - hsv.v}%` }}
                />
            </div>

            <div
                ref={hRef}
                className="w-full h-3 rounded-full relative cursor-pointer shadow-inner"
                style={{ background: 'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)' }}
                onMouseDown={handleHueMouseDown}
                onTouchStart={handleHueMouseDown}
            >
                <div
                    className="absolute w-4 h-4 bg-white border-2 border-slate-100 rounded-full shadow-lg -translate-x-1/2 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ left: `${(hsv.h / 360) * 100}%` }}
                />
            </div>
        </div>
    );
};

export default AdvancedColorPicker;
