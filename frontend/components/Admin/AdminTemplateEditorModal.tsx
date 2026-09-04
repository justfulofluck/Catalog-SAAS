import React, { useState, useEffect } from 'react';
import {
    X,
    Save,
    Sparkles,
    Layout,
    Layers,
    Plus,
    Trash2,
    Palette,
    FileText,
    Image as ImageIcon,
    Type,
    Square,
    Eye,
    CheckCircle2
} from 'lucide-react';
import { SystemTemplate, CanvasElement, CardTheme } from '../../types';
import { THEMES, PAGE_WIDTH, PAGE_HEIGHT } from '../../constants';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (templateData: Partial<SystemTemplate>) => Promise<void>;
    initialData?: SystemTemplate | null;
}

export const AdminTemplateEditorModal: React.FC<Props> = ({
    isOpen,
    onClose,
    onSave,
    initialData
}) => {
    const [name, setName] = useState('');
    const [category, setCategory] = useState('Industrial / Lighting');
    const [type, setType] = useState<'full_catalog' | 'cover' | 'product_grid' | 'header' | 'footer'>('full_catalog');
    const [description, setDescription] = useState('');
    const [thumbnail, setThumbnail] = useState('');
    const [themeId, setThemeId] = useState('modern-slate');
    const [isActive, setIsActive] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Page Elements Editor State (for Cover & Full Catalog)
    const [elements, setElements] = useState<Partial<CanvasElement>[]>([]);
    const [selectedElementIndex, setSelectedElementIndex] = useState<number | null>(null);

    // Product Grid settings (for product_grid type)
    const [gridCols, setGridCols] = useState(2);
    const [gridRows, setGridRows] = useState(2);
    const [gridPadding, setGridPadding] = useState(40);
    const [gridSpacing, setGridSpacing] = useState(20);
    const [gridArrangement, setGridArrangement] = useState<'stacked' | 'row' | 'row-reverse'>('stacked');
    const [gridCardTheme, setGridCardTheme] = useState<CardTheme>('classic-stack');
    const [gridBg, setGridBg] = useState('#ffffff');

    useEffect(() => {
        if (initialData) {
            setName(initialData.name || '');
            setCategory(initialData.category || 'General');
            setType(initialData.type || 'full_catalog');
            setDescription(initialData.description || '');
            setThumbnail(initialData.thumbnail || '');
            setThemeId(initialData.theme_id || 'modern-slate');
            setIsActive(initialData.is_active !== false);

            if (initialData.pages_data && initialData.pages_data.length > 0) {
                const firstPage = initialData.pages_data[0];
                setElements(firstPage.elements || []);
            } else {
                setElements([]);
            }

            if (initialData.grid_data) {
                setGridCols(initialData.grid_data.cols || 2);
                setGridRows(initialData.grid_data.rows || 2);
                setGridPadding(initialData.grid_data.padding || 40);
                setGridSpacing(initialData.grid_data.spacing || 20);
                setGridArrangement(initialData.grid_data.arrangement || 'stacked');
                setGridCardTheme(initialData.grid_data.cardTheme || 'classic-stack');
                setGridBg(initialData.grid_data.backgroundColor || '#ffffff');
            }
        } else {
            // Reset for new template
            setName('');
            setCategory('Industrial / Lighting');
            setType('full_catalog');
            setDescription('');
            setThumbnail('https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=800');
            setThemeId('modern-slate');
            setIsActive(true);
            setElements([
                { id: 't-bg', type: 'shape', x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT, fill: '#023842', zIndex: 0 },
                { id: 't-title', type: 'text', x: 60, y: 600, width: 674, height: 60, text: 'TEMPLATE TITLE', fontSize: 48, fontFamily: 'Montserrat', fontWeight: '900', fill: '#ffffff', zIndex: 2 },
                { id: 't-subtitle', type: 'text', x: 60, y: 670, width: 674, height: 30, text: 'Curated Catalog Collection 2026', fontSize: 20, fontFamily: 'Inter', fontWeight: '700', fill: '#00a651', zIndex: 2 }
            ]);
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleAddTextElement = () => {
        const newEl: Partial<CanvasElement> = {
            id: `el-${Date.now()}`,
            type: 'text',
            x: 60,
            y: 200,
            width: 400,
            height: 40,
            text: 'Editable Text Line',
            fontSize: 24,
            fontFamily: 'Montserrat',
            fontWeight: '900',
            fill: '#ffffff',
            zIndex: elements.length + 1
        };
        setElements([...elements, newEl]);
        setSelectedElementIndex(elements.length);
    };

    const handleAddShapeElement = () => {
        const newEl: Partial<CanvasElement> = {
            id: `shape-${Date.now()}`,
            type: 'shape',
            x: 60,
            y: 300,
            width: 200,
            height: 200,
            fill: '#00a651',
            zIndex: elements.length + 1
        };
        setElements([...elements, newEl]);
        setSelectedElementIndex(elements.length);
    };

    const handleUpdateElement = (index: number, updates: Partial<CanvasElement>) => {
        setElements(elements.map((el, i) => i === index ? { ...el, ...updates } : el));
    };

    const handleRemoveElement = (index: number) => {
        setElements(elements.filter((_, i) => i !== index));
        setSelectedElementIndex(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return alert('Please enter a template name.');
        setIsSaving(true);

        const pagesData = type === 'product_grid' ? [] : [
            {
                pageNumber: 1,
                type: type === 'cover' ? 'cover' : 'interior',
                elements: elements.map((el, idx) => ({ ...el, zIndex: idx }))
            }
        ];

        const gridData = type === 'product_grid' ? {
            cols: gridCols,
            rows: gridRows,
            padding: gridPadding,
            spacing: gridSpacing,
            arrangement: gridArrangement,
            cardTheme: gridCardTheme,
            backgroundColor: gridBg
        } : {};

        const templatePayload: Partial<SystemTemplate> = {
            name,
            category,
            type,
            description,
            thumbnail: thumbnail || 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=800',
            theme_id: themeId,
            pages_data: pagesData,
            grid_data: gridData,
            is_active: isActive
        };

        try {
            await onSave(templatePayload);
            onClose();
        } catch (err) {
            console.error(err);
            alert('Failed to save template. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                            <Sparkles size={20} />
                        </div>
                        <div>
                            <h2 className="text-base font-black uppercase tracking-tight">
                                {initialData ? 'Edit System Template' : 'Create New System Template'}
                            </h2>
                            <p className="text-xs text-slate-400 font-medium">
                                Template Maker & Global Catalog Blueprint Publisher
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body Form & Interactive Designer */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
                    {/* Left Column: Metadata & Settings */}
                    <div className="w-full lg:w-[380px] p-6 space-y-6 shrink-0 bg-slate-50/50">
                        {/* Template Type Selector */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Template Type</label>
                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                                {[
                                    { id: 'full_catalog', label: 'Catalog' },
                                    { id: 'cover', label: 'Cover' },
                                    { id: 'product_grid', label: 'Grid' },
                                    { id: 'header', label: 'Header' },
                                    { id: 'footer', label: 'Footer' }
                                ].map(t => (
                                    <button
                                        type="button"
                                        key={t.id}
                                        onClick={() => setType(t.id as any)}
                                        className={`py-2 px-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all border text-center ${type === t.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Basic Info */}
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Template Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="e.g. V-TAC Industrial 2025"
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-indigo-600 shadow-sm"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Industry / Category</label>
                                <select
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-indigo-600 shadow-sm"
                                >
                                    <option value="Industrial / Lighting">Industrial / Lighting</option>
                                    <option value="Fashion / Boutique">Fashion / Boutique</option>
                                    <option value="Home & Living / Nordic">Home & Living / Nordic</option>
                                    <option value="Electronics & Tech">Electronics & Tech</option>
                                    <option value="Food & Hospitality">Food & Hospitality</option>
                                    <option value="General / Minimal">General / Minimal</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Theme Base</label>
                                <select
                                    value={themeId}
                                    onChange={e => setThemeId(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-indigo-600 shadow-sm"
                                >
                                    {THEMES.map(th => (
                                        <option key={th.id} value={th.id}>{th.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Thumbnail URL</label>
                                <input
                                    type="text"
                                    value={thumbnail}
                                    onChange={e => setThumbnail(e.target.value)}
                                    placeholder="https://images.unsplash.com/..."
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-indigo-600 shadow-sm"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description</label>
                                <textarea
                                    rows={3}
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="Detailed description of layout structure and ideal industry..."
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-indigo-600 shadow-sm resize-none"
                                />
                            </div>

                            {/* Active Status */}
                            <label className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={isActive}
                                    onChange={e => setIsActive(e.target.checked)}
                                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                />
                                <div>
                                    <span className="text-xs font-bold text-slate-800 block">Active Template</span>
                                    <span className="text-[10px] text-slate-400 block font-medium">Visible to all tenant users immediately</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Right Column: Interactive Elements & Layout Canvas */}
                    <div className="flex-1 p-6 md:p-8 flex flex-col space-y-6 overflow-y-auto">
                        {type === 'product_grid' ? (
                            /* Product Grid Configurator */
                            <div className="space-y-6 max-w-xl">
                                <div>
                                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                                        <Layout size={16} className="text-indigo-600" />
                                        Grid Architecture Settings
                                    </h3>
                                    <p className="text-xs text-slate-400 font-medium">Configure rows, columns, card styles and background for automatic pagination.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Columns (1 - 4)</label>
                                        <input
                                            type="number"
                                            min={1}
                                            max={4}
                                            value={gridCols}
                                            onChange={e => setGridCols(parseInt(e.target.value) || 1)}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-indigo-600"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rows (1 - 4)</label>
                                        <input
                                            type="number"
                                            min={1}
                                            max={4}
                                            value={gridRows}
                                            onChange={e => setGridRows(parseInt(e.target.value) || 1)}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-indigo-600"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Padding (px)</label>
                                        <input
                                            type="number"
                                            value={gridPadding}
                                            onChange={e => setGridPadding(parseInt(e.target.value) || 20)}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-indigo-600"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Item Spacing (px)</label>
                                        <input
                                            type="number"
                                            value={gridSpacing}
                                            onChange={e => setGridSpacing(parseInt(e.target.value) || 20)}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-indigo-600"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Card Design Theme</label>
                                    <select
                                        value={gridCardTheme}
                                        onChange={e => setGridCardTheme(e.target.value as any)}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-indigo-600"
                                    >
                                        <option value="classic-stack">Classic Stack (Standard E-Commerce)</option>
                                        <option value="split-row">Split Row (Editorial Horizontal)</option>
                                        <option value="minimal-pill">Minimal Pill (Clean Spec Sheet)</option>
                                        <option value="glassmorphic">Glassmorphic Modern</option>
                                        <option value="bold-badge">Bold Badge (High Impact)</option>
                                    </select>
                                </div>
                            </div>
                        ) : (
                            /* Canvas Elements Manager */
                            <div className="space-y-6 flex-1 flex flex-col">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                                            <Layers size={16} className="text-indigo-600" />
                                            Canvas Layout Elements ({elements.length})
                                        </h3>
                                        <p className="text-xs text-slate-400 font-medium">Add and arrange visual layers, typography, and backdrop geometry.</p>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={handleAddTextElement}
                                            className="px-3 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                                        >
                                            <Type size={14} /> Add Text
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleAddShapeElement}
                                            className="px-3 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                                        >
                                            <Square size={14} /> Add Shape
                                        </button>
                                    </div>
                                </div>

                                {/* Elements List & Inline Property Tweaker */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                                    {/* Layers List */}
                                    <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-2 max-h-[380px] overflow-y-auto">
                                        {elements.length === 0 ? (
                                            <div className="py-12 text-center text-slate-400">
                                                <Layers size={28} className="mx-auto mb-2 opacity-50" />
                                                <p className="text-xs font-bold">No canvas elements added yet.</p>
                                            </div>
                                        ) : (
                                            elements.map((el, index) => (
                                                <div
                                                    key={el.id || index}
                                                    onClick={() => setSelectedElementIndex(index)}
                                                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${selectedElementIndex === index ? 'bg-indigo-50 border-indigo-400 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                                                >
                                                    <div className="flex items-center gap-3 truncate">
                                                        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                                                            {el.type === 'text' ? <Type size={14} /> : <Square size={14} />}
                                                        </div>
                                                        <div className="truncate">
                                                            <p className="text-xs font-bold text-slate-800 truncate">
                                                                {el.type === 'text' ? (el.text || 'Text') : `Shape (${el.fill})`}
                                                            </p>
                                                            <p className="text-[10px] text-slate-400">x: {el.x}, y: {el.y}, w: {el.width}</p>
                                                        </div>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRemoveElement(index);
                                                        }}
                                                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Selected Element Quick Inspector */}
                                    <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-4">
                                        {selectedElementIndex !== null && elements[selectedElementIndex] ? (
                                            <>
                                                <div className="flex items-center justify-between border-b pb-3">
                                                    <span className="text-xs font-black uppercase tracking-wider text-slate-700">Layer Inspector</span>
                                                    <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md uppercase">
                                                        {elements[selectedElementIndex].type}
                                                    </span>
                                                </div>

                                                {elements[selectedElementIndex].type === 'text' ? (
                                                    <div className="space-y-3">
                                                        <div className="space-y-1">
                                                            <label className="text-[9px] font-black uppercase text-slate-400">Content</label>
                                                            <input
                                                                type="text"
                                                                value={elements[selectedElementIndex].text || ''}
                                                                onChange={e => handleUpdateElement(selectedElementIndex, { text: e.target.value })}
                                                                className="w-full px-3 py-1.5 border rounded-lg text-xs font-bold"
                                                            />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div className="space-y-1">
                                                                <label className="text-[9px] font-black uppercase text-slate-400">Font Size</label>
                                                                <input
                                                                    type="number"
                                                                    value={elements[selectedElementIndex].fontSize || 16}
                                                                    onChange={e => handleUpdateElement(selectedElementIndex, { fontSize: parseInt(e.target.value) || 16 })}
                                                                    className="w-full px-3 py-1.5 border rounded-lg text-xs font-bold"
                                                                />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <label className="text-[9px] font-black uppercase text-slate-400">Color</label>
                                                                <input
                                                                    type="color"
                                                                    value={elements[selectedElementIndex].fill || '#ffffff'}
                                                                    onChange={e => handleUpdateElement(selectedElementIndex, { fill: e.target.value })}
                                                                    className="w-full h-8 p-0.5 border rounded-lg cursor-pointer"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-3">
                                                        <div className="space-y-1">
                                                            <label className="text-[9px] font-black uppercase text-slate-400">Fill Color</label>
                                                            <input
                                                                type="color"
                                                                value={elements[selectedElementIndex].fill || '#00a651'}
                                                                onChange={e => handleUpdateElement(selectedElementIndex, { fill: e.target.value })}
                                                                className="w-full h-8 p-0.5 border rounded-lg cursor-pointer"
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                                                    <div>
                                                        <label className="text-[9px] font-black uppercase text-slate-400">X Position</label>
                                                        <input
                                                            type="number"
                                                            value={elements[selectedElementIndex].x || 0}
                                                            onChange={e => handleUpdateElement(selectedElementIndex, { x: parseInt(e.target.value) || 0 })}
                                                            className="w-full px-3 py-1.5 border rounded-lg text-xs"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[9px] font-black uppercase text-slate-400">Y Position</label>
                                                        <input
                                                            type="number"
                                                            value={elements[selectedElementIndex].y || 0}
                                                            onChange={e => handleUpdateElement(selectedElementIndex, { y: parseInt(e.target.value) || 0 })}
                                                            className="w-full px-3 py-1.5 border rounded-lg text-xs"
                                                        />
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="py-12 text-center text-slate-400">
                                                <Eye size={24} className="mx-auto mb-2 opacity-40" />
                                                <p className="text-xs font-semibold">Select a layer from the list to edit properties.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </form>

                {/* Footer Controls */}
                <div className="px-8 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 text-xs font-black uppercase tracking-wider text-slate-600 hover:text-slate-900 rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        disabled={isSaving}
                        onClick={handleSubmit}
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg flex items-center gap-2 transition-all"
                    >
                        <Save size={16} />
                        {isSaving ? 'Saving Template...' : (initialData ? 'Update Template' : 'Save & Publish Template')}
                    </button>
                </div>
            </div>
        </div>
    );
};
