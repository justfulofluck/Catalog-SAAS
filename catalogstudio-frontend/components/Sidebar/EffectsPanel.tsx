import React, { useState, useEffect } from 'react';
import { X, Sparkles, Check } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { applyStyleToSelection } from '../../utils/textStyleSelection';

type EffectStyle = 'none' | 'shadow' | 'lift' | 'hollow' | 'splice' | 'outline' | 'echo' | 'glitch' | 'neon' | 'background';

const EffectsPanel: React.FC = () => {
    const {
        catalog, currentPageIndex, selectedElementIds, updateElement, uiTheme
    } = useStore();

    const currentPage = catalog.pages[currentPageIndex];
    const selectedElements = currentPage?.elements.filter(el => selectedElementIds.includes(el.id)) || [];
    const selectedElement = selectedElements.length === 1 ? selectedElements[0] : null;

    const [activeEffectStyle, setActiveEffectStyle] = useState<EffectStyle>('none');
    const [tempShadowBlur, setTempShadowBlur] = useState(0);
    const [tempShadowOpacity, setTempShadowOpacity] = useState(0);
    const [tempShadowOffset, setTempShadowOffset] = useState(50);
    const [tempShadowDirection, setTempShadowDirection] = useState(-45);
    const [tempShadowColor, setTempShadowColor] = useState('#000000');
    const [tempTextStrokeWidth, setTempTextStrokeWidth] = useState(1);
    const [tempEffectIntensity, setTempEffectIntensity] = useState(50);
    const [tempEffectDirection, setTempEffectDirection] = useState(-45);
    const [tempEffectColor, setTempEffectColor] = useState('#000000');
    const [tempEffectColor2, setTempEffectColor2] = useState('#00fff9');
    const [tempEffectSpread, setTempEffectSpread] = useState(0);
    const [tempEffectRoundness, setTempEffectRoundness] = useState(4);

    // Sync with selected element
    useEffect(() => {
        if (selectedElement) {
            setTempShadowBlur(selectedElement.shadowBlur || 0);
            setTempShadowOpacity(selectedElement.shadowOpacity || 0);
            setTempShadowOffset(Math.sqrt((selectedElement.shadowOffsetX || 0) ** 2 + (selectedElement.shadowOffsetY || 0) ** 2) * 10);
            setTempShadowDirection(Math.atan2(selectedElement.shadowOffsetY || 0, selectedElement.shadowOffsetX || 0) * (180 / Math.PI));
            setTempShadowColor(selectedElement.shadowColor || '#000000');
            setTempEffectColor(selectedElement.effectColor || '#000000');
            setTempEffectColor2(selectedElement.effectColor2 || '#00fff9');
            setTempEffectSpread(selectedElement.effectSpread || 0);
            setTempEffectRoundness(selectedElement.effectRoundness || 4);
            setActiveEffectStyle(selectedElement.effectStyle || 'none');
            setTempTextStrokeWidth(selectedElement.textStrokeWidth || 1);
        }
    }, [selectedElement?.id, selectedElement?.effectStyle]);

    const handleBatchUpdate = (updates: any) => {
        selectedElementIds.forEach(id => updateElement(currentPageIndex, id, updates));
    };

    // Helper to apply configuration to either selected text span (if active) or global element
    const partialID = 'temp-effect-target';

    const applyToSelection = (css: string) => {
        // 1. Check for Cross-Tab Selection Marker
        if (selectedElement?.text && selectedElement.text.includes(`id="${partialID}"`)) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = selectedElement.text;
            const targetSpan = tempDiv.querySelector(`#${partialID}`) as HTMLElement;
            if (targetSpan) {
                // Overwrite cssText for the temporary span
                targetSpan.style.cssText = css;
                // IMPORTANT: Do NOT remove ID here.
                handleBatchUpdate({ text: tempDiv.innerHTML });
                return true;
            }
        }

        // 2. Check for Active ContentEditable Selection (first time apply)
        // If we apply here, we MUST inject the ID so subsequent edits find it.
        if (applyStyleToSelection(css, `id="${partialID}"`)) {
            // We successfully wrapped it.
            // We need to trigger an update to ensure the Store has the new text with ID.
            const activeEl = document.activeElement as HTMLElement;
            if (activeEl) {
                activeEl.dispatchEvent(new Event('input', { bubbles: true }));
            }
            return true;
        }

        return false;
    };

    const generateCSS = (styleId: string, overrides: any = {}) => {
        // Use overrides or current state
        const sBlur = overrides.shadowBlur !== undefined ? overrides.shadowBlur : tempShadowBlur;
        const sOpacity = overrides.shadowOpacity !== undefined ? overrides.shadowOpacity : tempShadowOpacity;
        const sDir = overrides.shadowDirection !== undefined ? overrides.shadowDirection : tempShadowDirection;
        const sOffset = overrides.shadowOffset !== undefined ? overrides.shadowOffset : tempShadowOffset;
        const sColor = overrides.shadowColor !== undefined ? overrides.shadowColor : tempShadowColor;
        const sColor2 = overrides.effectColor2 !== undefined ? overrides.effectColor2 : tempEffectColor2;
        const sSpread = overrides.effectSpread !== undefined ? overrides.effectSpread : tempEffectSpread;
        const sRound = overrides.effectRoundness !== undefined ? overrides.effectRoundness : tempEffectRoundness;
        const sStroke = overrides.textStrokeWidth !== undefined ? overrides.textStrokeWidth : tempTextStrokeWidth;

        const rad = (sDir * Math.PI) / 180;
        const offX = Math.round(sOffset * Math.cos(rad) * 0.1);
        const offY = Math.round(sOffset * Math.sin(rad) * 0.1);

        let css = '';
        switch (styleId) {
            case 'hollow': css = `-webkit-text-stroke: ${sStroke}px ${sColor}; color: transparent;`; break;
            case 'outline': css = `-webkit-text-stroke: ${sStroke}px ${sColor};`; break;
            case 'shadow': css = `text-shadow: ${offX}px ${offY}px ${sBlur}px ${sColor}${Math.round(sOpacity * 255).toString(16).padStart(2, '0')};`; break;
            case 'lift': css = `text-shadow: 0px 4px ${sBlur}px rgba(0,0,0,${sOpacity});`; break;
            case 'neon': css = `color: ${sColor}; text-shadow: ${sOpacity > 0 ? `0 0 ${5 * sOpacity}px ${sColor}, 0 0 ${10 * sOpacity}px ${sColor}, 0 0 ${20 * sOpacity}px ${sColor}` : 'none'};`; break;
            case 'glitch': css = `text-shadow: ${offX}px ${offY}px 0 ${sColor}, ${-offX}px ${-offY}px 0 ${sColor2};`; break;
            case 'echo': css = `text-shadow: ${offX}px ${offY}px 0px ${sColor}aa, ${offX * 2}px ${offY * 2}px 0px ${sColor}66, ${offX * 3}px ${offY * 3}px 0px ${sColor}33;`; break;
            case 'splice': css = `-webkit-text-stroke: ${sStroke}px ${sColor}; text-shadow: ${offX}px ${offY}px 0px ${sColor}88;`; break;
            case 'background': css = `background: ${sColor}${Math.round(sOpacity * 255).toString(16).padStart(2, '0')}; padding: ${sSpread / 4}px ${sSpread / 2}px; border-radius: ${sRound}px; box-decoration-break: clone; -webkit-box-decoration-break: clone;`; break;
        }
        return css;
    };

    const updateEffect = (styleId: EffectStyle, overrides: any = {}, commitGlobal: boolean = true) => {
        const css = generateCSS(styleId, overrides);

        // Try applied to selection first
        if (applyToSelection(css)) {
            // If applied to selection, we mostly done.
            setActiveEffectStyle(styleId);
            return;
        }

        // Fallback to global
        if (commitGlobal) {
            const rad = ((overrides.shadowDirection ?? tempShadowDirection) * Math.PI) / 180;
            const off = (overrides.shadowOffset ?? tempShadowOffset);
            const offX = Math.round(off * Math.cos(rad) * 0.1);
            const offY = Math.round(off * Math.sin(rad) * 0.1);

            handleBatchUpdate({
                effectStyle: styleId,
                shadowBlur: overrides.shadowBlur ?? (styleId === 'shadow' || styleId === 'lift' ? tempShadowBlur : 0),
                shadowOpacity: overrides.shadowOpacity ?? (styleId === 'background' ? 1 : tempShadowOpacity),
                shadowColor: overrides.shadowColor ?? tempShadowColor,
                effectColor: overrides.shadowColor ?? tempShadowColor,
                effectColor2: overrides.effectColor2 ?? tempEffectColor2,
                shadowOffsetX: offX,
                shadowOffsetY: offY,
                textStrokeWidth: overrides.textStrokeWidth ?? tempTextStrokeWidth,
                effectSpread: overrides.effectSpread ?? tempEffectSpread,
                effectRoundness: overrides.effectRoundness ?? tempEffectRoundness,
            });
            setActiveEffectStyle(styleId);
        }
    };

    const handleApplySelection = () => {
        if (selectedElement?.text && selectedElement.text.includes(`id="${partialID}"`)) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = selectedElement.text;
            const targetSpan = tempDiv.querySelector(`#${partialID}`) as HTMLElement;
            if (targetSpan) {
                targetSpan.removeAttribute('id');
                handleBatchUpdate({ text: tempDiv.innerHTML });
            }
        }
    };

    if (selectedElementIds.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                <div className={`p-4 rounded-full mb-4 ${uiTheme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'}`}>
                    <Sparkles className="text-indigo-500" size={32} />
                </div>
                <p className={`text-sm font-bold ${uiTheme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>No element selected</p>
                <p className="text-xs text-slate-500 mt-2">Select a text or shape element to apply advanced effects and filters.</p>
            </div>
        );
    }

    const effectStyles: { id: EffectStyle; label: string; preview: React.ReactNode }[] = [
        { id: 'none', label: 'None', preview: <span className={`text-xl font-bold ${uiTheme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>Ag</span> },
        { id: 'shadow', label: 'Shadow', preview: <span className={`text-xl font-bold drop-shadow-md ${uiTheme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>Ag</span> },
        { id: 'lift', label: 'Lift', preview: <span className={`text-xl font-bold ${uiTheme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`} style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))' }}>Ag</span> },
        { id: 'hollow', label: 'Hollow', preview: <span className="text-xl font-bold text-transparent" style={{ WebkitTextStroke: uiTheme === 'dark' ? '1px #f1f5f9' : '1px #1e293b' }}>Ag</span> },
        { id: 'splice', label: 'Splice', preview: <span className="text-xl font-bold text-transparent" style={{ WebkitTextStroke: uiTheme === 'dark' ? '1px #f1f5f9' : '1px #1e293b', filter: 'drop-shadow(2px 2px 0px rgba(0,0,0,0.5))' }}>Ag</span> },
        { id: 'outline', label: 'Outline', preview: <div className={`p-1.5 rounded text-xl font-bold border-2 ${uiTheme === 'dark' ? 'bg-slate-800 text-white border-slate-700' : 'bg-slate-100 text-slate-800 border-slate-800/10'}`}>Ag</div> },
        { id: 'echo', label: 'Echo', preview: <span className={`text-xl font-bold ${uiTheme === 'dark' ? 'text-white' : 'text-slate-800'}`} style={{ textShadow: uiTheme === 'dark' ? '2px 2px 0px #475569, 4px 4px 0px #334155' : '2px 2px 0px #cbd5e1, 4px 4px 0px #e2e8f0' }}>Ag</span> },
        { id: 'glitch', label: 'Glitch', preview: <span className={`text-xl font-bold ${uiTheme === 'dark' ? 'text-white' : 'text-slate-800'}`} style={{ textShadow: '2px 0px 0px #ff00c1, -2px 0px 0px #00fff9' }}>Ag</span> },
        { id: 'neon', label: 'Neon', preview: <span className="text-xl font-bold text-pink-500" style={{ filter: 'drop-shadow(0 0 5px #ec4899)' }}>Ag</span> },
        { id: 'background', label: 'Background', preview: <div className={`px-2 py-0.5 rounded text-xl font-bold ${uiTheme === 'dark' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-800'}`}>Ag</div> }
    ];

    return (
        <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* Style Selection */}
                <div className="space-y-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Style Presets</span>
                    <div className="grid grid-cols-2 gap-3">
                        {effectStyles.map((style) => (
                            <button
                                key={style.id}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                    updateEffect(style.id);
                                }}
                                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 group relative ${activeEffectStyle === style.id ? 'border-indigo-600 bg-indigo-50/10' : (uiTheme === 'dark' ? 'border-slate-800 bg-slate-800/30 hover:border-slate-700' : 'border-slate-50 bg-slate-50/50 hover:border-slate-200')}`}
                            >
                                <div className="w-12 h-12 flex items-center justify-center transition-transform group-hover:scale-110">
                                    {style.preview}
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-tighter ${activeEffectStyle === style.id ? 'text-indigo-500' : 'text-slate-500'}`}>
                                    {style.label}
                                </span>
                                {activeEffectStyle === style.id && (
                                    <div className="absolute top-2 right-2 w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center">
                                        <Check size={10} className="text-white" strokeWidth={4} />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Dynamic Controls */}
                {activeEffectStyle !== 'none' && (
                    <div className="space-y-6 pt-6 border-t border-slate-800/50">

                        {(activeEffectStyle === 'hollow' || activeEffectStyle === 'splice' || activeEffectStyle === 'outline') && (
                            <div className="space-y-2.5">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Stroke Thickness</span>
                                <div className={`flex items-center gap-3 p-3 rounded-xl border ${uiTheme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                                    <input
                                        type="range" min="1" max="10" value={tempTextStrokeWidth}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            setTempTextStrokeWidth(val);
                                            updateEffect(activeEffectStyle, { textStrokeWidth: val });
                                        }}
                                        className={`flex-1 accent-indigo-600 h-1.5 rounded-lg appearance-none cursor-pointer ${uiTheme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`}
                                    />
                                    <span className="text-[11px] font-black text-indigo-500 w-8 text-right shrink-0">{tempTextStrokeWidth}px</span>
                                </div>
                            </div>
                        )}

                        {(activeEffectStyle === 'neon' || activeEffectStyle === 'lift' || activeEffectStyle === 'shadow' || activeEffectStyle === 'background') && (
                            <div className="space-y-2.5">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">
                                    {activeEffectStyle === 'neon' ? 'Neon Intensity' : (activeEffectStyle === 'background' ? 'Block Opacity' : 'Effect Opacity')}
                                </span>
                                <div className={`flex items-center gap-3 p-3 rounded-xl border ${uiTheme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                                    <input
                                        type="range" min="0" max="100" value={tempShadowOpacity * 100}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value) / 100;
                                            setTempShadowOpacity(val);
                                            updateEffect(activeEffectStyle, { shadowOpacity: val });
                                        }}
                                        className={`flex-1 accent-indigo-600 h-1.5 rounded-lg appearance-none cursor-pointer ${uiTheme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`}
                                    />
                                    <span className="text-[11px] font-black text-indigo-500 w-8 text-right shrink-0">{Math.round(tempShadowOpacity * 100)}%</span>
                                </div>
                            </div>
                        )}

                        {(activeEffectStyle === 'shadow' || activeEffectStyle === 'splice' || activeEffectStyle === 'echo' || activeEffectStyle === 'glitch') && (
                            <>
                                <div className="space-y-2.5">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Offset Distance</span>
                                    <div className={`flex items-center gap-3 p-3 rounded-xl border ${uiTheme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                                        <input
                                            type="range" min="0" max="100" value={tempShadowOffset}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value);
                                                setTempShadowOffset(val);
                                                updateEffect(activeEffectStyle, { shadowOffset: val });
                                            }}
                                            className={`flex-1 accent-indigo-600 h-1.5 rounded-lg appearance-none cursor-pointer ${uiTheme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`}
                                        />
                                        <span className={`text-[11px] font-black w-8 text-right shrink-0 ${uiTheme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>{tempShadowOffset}</span>
                                    </div>
                                </div>
                                <div className="space-y-2.5">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Shadow Angle</span>
                                    <div className={`flex items-center gap-3 p-3 rounded-xl border ${uiTheme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                                        <input
                                            type="range" min="-180" max="180" value={tempShadowDirection}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value);
                                                setTempShadowDirection(val);
                                                updateEffect(activeEffectStyle, { shadowDirection: val });
                                            }}
                                            className={`flex-1 accent-indigo-600 h-1.5 rounded-lg appearance-none cursor-pointer ${uiTheme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`}
                                        />
                                        <span className={`text-[11px] font-black w-10 text-right shrink-0 ${uiTheme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>{tempShadowDirection}°</span>
                                    </div>
                                </div>
                            </>
                        )}

                        {(activeEffectStyle === 'shadow' || activeEffectStyle === 'lift') && (
                            <div className="space-y-2.5">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Blur Amount</span>
                                <div className={`flex items-center gap-3 p-3 rounded-xl border ${uiTheme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                                    <input
                                        type="range" min="0" max="100" value={tempShadowBlur}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            setTempShadowBlur(val);
                                            updateEffect(activeEffectStyle, { shadowBlur: val });
                                        }}
                                        className={`flex-1 accent-indigo-600 h-1.5 rounded-lg appearance-none cursor-pointer ${uiTheme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`}
                                    />
                                    <span className="text-[11px] font-black text-indigo-500 w-8 text-right shrink-0">{tempShadowBlur}px</span>
                                </div>
                            </div>
                        )}

                        {activeEffectStyle === 'background' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2.5">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Padding</span>
                                    <div className={`flex items-center gap-3 p-3 rounded-xl border ${uiTheme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                                        <input
                                            type="range" min="0" max="50" value={tempEffectSpread}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value);
                                                setTempEffectSpread(val);
                                                updateEffect(activeEffectStyle, { effectSpread: val });
                                            }}
                                            className={`flex-1 accent-indigo-600 h-1.5 rounded-lg appearance-none cursor-pointer ${uiTheme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2.5">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Radius</span>
                                    <div className={`flex items-center gap-3 p-3 rounded-xl border ${uiTheme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                                        <input
                                            type="range" min="0" max="20" value={tempEffectRoundness}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value);
                                                setTempEffectRoundness(val);
                                                updateEffect(activeEffectStyle, { effectRoundness: val });
                                            }}
                                            className={`flex-1 accent-indigo-600 h-1.5 rounded-lg appearance-none cursor-pointer ${uiTheme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeEffectStyle !== 'lift' && (
                            <div className="space-y-4 pt-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">
                                    {activeEffectStyle === 'glitch' ? 'Dual Color Palette' : 'Effect Color'}
                                </span>
                                <div className="flex items-center gap-3">
                                    <div className={`flex flex-1 items-center gap-3 p-2 rounded-xl border transition-all ${uiTheme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                                        <div className={`w-8 h-8 rounded-lg border relative overflow-hidden shrink-0 ${uiTheme === 'dark' ? 'border-slate-600' : 'border-slate-200'}`} style={{ background: tempShadowColor }}>
                                            <input
                                                type="color" value={tempShadowColor}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setTempShadowColor(val);
                                                    updateEffect(activeEffectStyle, { shadowColor: val });
                                                }}
                                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                            />
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase ${uiTheme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{tempShadowColor}</span>
                                    </div>

                                    {activeEffectStyle === 'glitch' && (
                                        <div className={`flex flex-1 items-center gap-3 p-2 rounded-xl border transition-all ${uiTheme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                                            <div className={`w-8 h-8 rounded-lg border relative overflow-hidden shrink-0 ${uiTheme === 'dark' ? 'border-slate-600' : 'border-slate-200'}`} style={{ background: tempEffectColor2 }}>
                                                <input
                                                    type="color" value={tempEffectColor2}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setTempEffectColor2(val);
                                                        updateEffect(activeEffectStyle, { effectColor2: val });
                                                    }}
                                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                                />
                                            </div>
                                            <span className={`text-[10px] font-bold uppercase ${uiTheme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{tempEffectColor2}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer Action */}
            <div className={`p-4 border-t ${uiTheme === 'dark' ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
                <button
                    onClick={handleApplySelection}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
                >
                    Apply Changes
                </button>
            </div>
        </div>
    );
};

export default EffectsPanel;
