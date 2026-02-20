
import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { ShapeType, CanvasElement } from '../../types';
import { ChevronDown } from 'lucide-react';

const BUTTON_ICONS = [
    // Typography / Base
    { name: 'T', icon: 'fa-solid fa-font', unicode: '\uf031', library: 'solid' },
    { name: 'Plus', icon: 'fa-solid fa-plus', unicode: '\uf067', library: 'solid' },
    { name: 'Remove', icon: 'fa-solid fa-xmark', unicode: '\uf00d', library: 'solid' },
    { name: 'Minus', icon: 'fa-solid fa-minus', unicode: '\uf068', library: 'solid' },
    { name: 'Email', icon: 'fa-solid fa-envelope', unicode: '\uf0e0', library: 'solid' },
    { name: 'At', icon: 'fa-solid fa-at', unicode: '@', library: 'solid' },

    // Navigation
    { name: 'Home', icon: 'fa-solid fa-house', unicode: '\uf015', library: 'solid' },
    { name: 'Info', icon: 'fa-solid fa-circle-info', unicode: '\uf05a', library: 'solid' },
    { name: 'Link', icon: 'fa-solid fa-link', unicode: '\uf0c1', library: 'solid' },
    { name: 'Reply', icon: 'fa-solid fa-reply', unicode: '\uf3e5', library: 'solid' },
    { name: 'Share', icon: 'fa-solid fa-share-from-square', unicode: '\uf14d', library: 'solid' },
    { name: 'List', icon: 'fa-solid fa-list', unicode: '\uf03a', library: 'solid' },

    // Interaction
    { name: 'Loc', icon: 'fa-solid fa-location-dot', unicode: '\uf3c5', library: 'solid' },
    { name: 'Media', icon: 'fa-solid fa-file-image', unicode: '\uf1c5', library: 'solid' },
    { name: 'Ext', icon: 'fa-solid fa-up-right-from-square', unicode: '\uf08e', library: 'solid' },
    { name: 'Cart', icon: 'fa-solid fa-cart-shopping', unicode: '\uf07a', library: 'solid' },
    { name: 'FB', icon: 'fa-brands fa-facebook-f', unicode: '\uf39e', library: 'brands' },
    { name: 'X', icon: 'fa-brands fa-x-twitter', unicode: '\ue61b', library: 'brands' },

    // Socials
    { name: 'G+', icon: 'fa-brands fa-google-plus-g', unicode: '\uf0d5', library: 'brands' },
    { name: 'LI', icon: 'fa-brands fa-linkedin-in', unicode: '\uf0e1', library: 'brands' },
    { name: 'Pin', icon: 'fa-brands fa-pinterest-p', unicode: '\uf231', library: 'brands' },
    { name: 'IG', icon: 'fa-brands fa-instagram', unicode: '\uf16d', library: 'brands' },
    { name: 'YT', icon: 'fa-brands fa-youtube', unicode: '\uf167', library: 'brands' },
    { name: 'Vim', icon: 'fa-brands fa-vimeo-v', unicode: '\uf27d', library: 'brands' },
    { name: 'Tum', icon: 'fa-brands fa-tumblr', unicode: '\uf173', library: 'brands' },
];

const ButtonsPanel: React.FC = () => {
    const { catalog, currentPageIndex, addElement, uiTheme } = useStore();
    const [selectedStyle, setSelectedStyle] = useState<'solid-circle' | 'outline-circle' | 'solid-square' | 'outline-square'>('solid-circle');

    const handleAddButton = (icon: typeof BUTTON_ICONS[0]) => {
        const id = `button-${Date.now()}`;
        const size = 50;

        let shapeType: ShapeType = 'circle';
        let fill = '#64748b';
        let stroke = 'transparent';
        let strokeWidth = 0;

        if (selectedStyle === 'outline-circle') {
            shapeType = 'circle';
            fill = 'transparent';
            stroke = '#64748b';
            strokeWidth = 2;
        } else if (selectedStyle === 'solid-square') {
            shapeType = 'rect';
            fill = '#64748b';
        } else if (selectedStyle === 'outline-square') {
            shapeType = 'rect';
            fill = 'transparent';
            stroke = '#64748b';
            strokeWidth = 2;
        }

        const newElement: CanvasElement = {
            id,
            type: 'shape',
            shapeType,
            x: 200, // Better starting pos
            y: 200,
            width: size,
            height: size,
            rotation: 0,
            opacity: 1,
            fill,
            stroke,
            strokeWidth,
            zIndex: catalog.pages[currentPageIndex].elements.length + 1,
            iconConfig: {
                iconName: icon.unicode,
                iconLibrary: 'fontawesome',
                color: fill === 'transparent' ? stroke : '#ffffff',
                size: size * 0.5,
                // @ts-ignore - added to custom config
                fontWeight: icon.library === 'solid' ? '900' : '400',
                fontFamily: icon.library === 'brands' ? 'Font Awesome 6 Brands' : 'Font Awesome 6 Free'
            }
        };

        addElement(currentPageIndex, newElement);
    };

    return (
        <div className={`w-72 h-full flex flex-col bg-white border-r border-slate-200 animate-in slide-in-from-left duration-300 ${uiTheme === 'dark' ? 'dark:bg-slate-900 dark:border-slate-800' : ''}`}>
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <ChevronDown size={14} />
                    <span className="text-[11px] font-bold uppercase tracking-wider">Buttons</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                {/* Style Selector */}
                <div className="flex border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden h-10">
                    <button
                        onClick={() => setSelectedStyle('solid-circle')}
                        className={`flex-1 flex items-center justify-center transition-all ${selectedStyle === 'solid-circle' ? 'bg-slate-500 text-white' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500'}`}
                    >
                        <div className="w-4 h-4 rounded-full bg-current" />
                    </button>
                    <button
                        onClick={() => setSelectedStyle('outline-circle')}
                        className={`flex-1 flex items-center justify-center border-l border-slate-200 dark:border-slate-700 transition-all ${selectedStyle === 'outline-circle' ? 'bg-slate-500 text-white' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500'}`}
                    >
                        <div className="w-4 h-4 rounded-full border-2 border-current" />
                    </button>
                    <button
                        onClick={() => setSelectedStyle('solid-square')}
                        className={`flex-1 flex items-center justify-center border-l border-slate-200 dark:border-slate-700 transition-all ${selectedStyle === 'solid-square' ? 'bg-slate-500 text-white' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500'}`}
                    >
                        <div className="w-4 h-4 rounded-sm bg-current" />
                    </button>
                    <button
                        onClick={() => setSelectedStyle('outline-square')}
                        className={`flex-1 flex items-center justify-center border-l border-slate-200 dark:border-slate-700 transition-all ${selectedStyle === 'outline-square' ? 'bg-slate-500 text-white' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500'}`}
                    >
                        <div className="w-4 h-4 rounded-sm border-2 border-current" />
                    </button>
                </div>

                {/* Icons Grid */}
                <div className="grid grid-cols-6 gap-3">
                    {BUTTON_ICONS.map((icon, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleAddButton(icon)}
                            className="group flex flex-col items-center gap-1"
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${uiTheme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-slate-400' : 'bg-slate-100 hover:bg-slate-200 text-slate-500'}`}>
                                <i className={`${icon.icon} text-sm`} />
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ButtonsPanel;
