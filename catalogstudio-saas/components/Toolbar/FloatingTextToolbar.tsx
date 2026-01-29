import React from 'react';
import { Bold, Italic, Underline } from 'lucide-react';

interface FloatingTextToolbarProps {
    onBold: () => void;
    onItalic: () => void;
    onUnderline: () => void;
}

export const FloatingTextToolbar: React.FC<FloatingTextToolbarProps> = ({
    onBold,
    onItalic,
    onUnderline,
}) => {
    return (
        <div
            className="flex items-center gap-0.5 bg-slate-800 rounded-lg shadow-2xl px-2 py-1.5"
            onMouseDown={(e) => e.preventDefault()}
        >
            <button
                onClick={(e) => {
                    e.preventDefault();
                    onBold();
                }}
                className="px-3 py-1.5 rounded-md hover:bg-slate-700 text-white transition-colors flex items-center justify-center"
                title="Bold (Ctrl+B)"
            >
                <Bold size={16} strokeWidth={2.5} />
            </button>

            <button
                onClick={(e) => {
                    e.preventDefault();
                    onItalic();
                }}
                className="px-3 py-1.5 rounded-md hover:bg-slate-700 text-white transition-colors flex items-center justify-center"
                title="Italic (Ctrl+I)"
            >
                <Italic size={16} strokeWidth={2} />
            </button>

            <button
                onClick={(e) => {
                    e.preventDefault();
                    onUnderline();
                }}
                className="px-3 py-1.5 rounded-md hover:bg-slate-700 text-white transition-colors flex items-center justify-center"
                title="Underline (Ctrl+U)"
            >
                <Underline size={16} strokeWidth={2} />
            </button>
        </div>
    );
};
