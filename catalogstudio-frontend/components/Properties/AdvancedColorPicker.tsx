import React, { useState, useEffect, useRef } from 'react';

interface AdvancedColorPickerProps {
    color: string;
    onChange: (hex: string) => void;
}

const AdvancedColorPicker: React.FC<AdvancedColorPickerProps> = ({ color, onChange }) => {
    const [hsv, setHsv] = useState({ h: 0, s: 100, v: 100 });
    const svRef = useRef<HTMLDivElement>(null);
    const hRef = useRef<HTMLDivElement>(null);

    // Helper: Hex to HSV
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

    // Helper: HSV to Hex
    const hsvToHex = (h: number, s: number, v: number) => {
        s /= 100; v /= 100;
        const i = Math.floor(h / 60) % 6;
        const f = h / 60 - i;
        const p = v * (1 - s);
        const q = v * (1 - f * s);
        const t = v * (1 - (1 - f) * s);
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
        if (color && !color.includes('gradient')) {
            const newHsv = hexToHsv(color);
            setHsv(newHsv);
        }
    }, [color]);

    const handleSvMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        const updateSv = (event: MouseEvent | TouchEvent) => {
            if (!svRef.current) return;
            const rect = svRef.current.getBoundingClientRect();
            const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
            const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
            const s = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
            const v = Math.min(100, Math.max(0, (1 - (clientY - rect.top) / rect.height) * 100));
            const newHex = hsvToHex(hsv.h, s, v);
            setHsv(prev => ({ ...prev, s, v }));
            onChange(newHex);
        };

        const handleMouseUp = () => {
            window.removeEventListener('mousemove', updateSv);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', updateSv);
            window.removeEventListener('touchend', handleMouseUp);
        };

        window.addEventListener('mousemove', updateSv);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('touchmove', updateSv);
        window.addEventListener('touchend', handleMouseUp);
        updateSv(e.nativeEvent as any);
    };

    const handleHueMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        const updateHue = (event: MouseEvent | TouchEvent) => {
            if (!hRef.current) return;
            const rect = hRef.current.getBoundingClientRect();
            const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
            const h = Math.min(360, Math.max(0, ((clientX - rect.left) / rect.width) * 360));
            const newHex = hsvToHex(h, hsv.s, hsv.v);
            setHsv(prev => ({ ...prev, h }));
            onChange(newHex);
        };

        const handleMouseUp = () => {
            window.removeEventListener('mousemove', updateHue);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', updateHue);
            window.removeEventListener('touchend', handleMouseUp);
        };

        window.addEventListener('mousemove', updateHue);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('touchmove', updateHue);
        window.addEventListener('touchend', handleMouseUp);
        updateHue(e.nativeEvent as any);
    };

    return (
        <div className="flex flex-col gap-4 select-none">
            {/* Saturation/Value Area */}
            <div
                ref={svRef}
                className="w-full aspect-square rounded-xl relative cursor-crosshair overflow-hidden"
                style={{ backgroundColor: `hsl(${hsv.h}, 100%, 50%)` }}
                onMouseDown={handleSvMouseDown}
                onTouchStart={handleSvMouseDown}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                <div
                    className="absolute w-4 h-4 border-2 border-white rounded-full shadow-md -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ left: `${hsv.s}%`, top: `${100 - hsv.v}%` }}
                />
            </div>

            {/* Hue Slider */}
            <div
                ref={hRef}
                className="w-full h-4 rounded-full relative cursor-pointer"
                style={{ background: 'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)' }}
                onMouseDown={handleHueMouseDown}
                onTouchStart={handleHueMouseDown}
            >
                <div
                    className="absolute w-5 h-5 bg-white border-2 border-slate-200 rounded-full shadow-lg -translate-x-1/2 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ left: `${(hsv.h / 360) * 100}%` }}
                />
            </div>
        </div>
    );
};

export default AdvancedColorPicker;
