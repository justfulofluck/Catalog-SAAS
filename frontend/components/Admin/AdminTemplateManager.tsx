import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { SystemTemplate } from '../../types';
import {
    Plus,
    Search,
    Filter,
    Edit3,
    Trash2,
    CheckCircle,
    XCircle,
    Layout,
    BookOpen,
    Layers,
    Sparkles,
    Grid,
    FileCheck,
    Palette
} from 'lucide-react';
import { AdminTemplateEditorModal } from './AdminTemplateEditorModal';

export const AdminTemplateManager: React.FC = () => {
    const {
        systemTemplates,
        fetchSystemTemplates,
        createSystemTemplate,
        updateSystemTemplate,
        deleteSystemTemplate,
        openTemplateInVisualEditor
    } = useStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState<string>('all');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<SystemTemplate | null>(null);

    useEffect(() => {
        fetchSystemTemplates();
    }, []);

    const filteredTemplates = systemTemplates.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (t.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (t.category || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = selectedType === 'all' || t.type === selectedType;
        const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
        return matchesSearch && matchesType && matchesCategory;
    });

    const handleOpenCreate = () => {
        setEditingTemplate(null);
        setIsEditorOpen(true);
    };

    const handleOpenEdit = (template: SystemTemplate) => {
        setEditingTemplate(template);
        setIsEditorOpen(true);
    };

    const handleSaveTemplate = async (templateData: Partial<SystemTemplate>) => {
        if (editingTemplate) {
            await updateSystemTemplate(editingTemplate.id, templateData);
        } else {
            await createSystemTemplate(templateData);
        }
    };

    const handleDelete = async (template: SystemTemplate) => {
        if (window.confirm(`Are you sure you want to delete template "${template.name}"?`)) {
            await deleteSystemTemplate(template.id);
        }
    };

    const handleToggleActive = async (template: SystemTemplate) => {
        await updateSystemTemplate(template.id, { is_active: !template.is_active });
    };

    // Categories list for filter
    const categories = Array.from(new Set(systemTemplates.map(t => t.category).filter(Boolean)));

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* Top Header & Actions Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
                <div>
                    <h2 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
                        <Sparkles className="text-indigo-600" size={24} />
                        Template Studio & Global Blueprint Maker
                    </h2>
                    <p className="text-xs font-medium text-slate-500 mt-1">
                        Create, customize, edit, and publish high-converting catalog layouts and grids for all users.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => openTemplateInVisualEditor(null)}
                        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 active:scale-95 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all"
                    >
                        <Sparkles size={16} />
                        Design in Full Canvas Editor
                    </button>
                    <button
                        onClick={handleOpenCreate}
                        className="px-4 py-3 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 transition-all"
                    >
                        <Plus size={16} />
                        Quick Form
                    </button>
                </div>
            </div>

            {/* Filters & Search Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
                {/* Search */}
                <div className="relative flex-1 min-w-[240px]">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search templates by name, industry, or tags..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-indigo-600 focus:bg-white transition-all"
                    />
                </div>

                {/* Filter by Type */}
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                    {[
                        { id: 'all', label: 'All' },
                        { id: 'full_catalog', label: 'Catalogs' },
                        { id: 'cover', label: 'Covers' },
                        { id: 'product_grid', label: 'Grids' },
                        { id: 'header', label: 'Headers' },
                        { id: 'footer', label: 'Footers' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setSelectedType(tab.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedType === tab.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Filter by Category */}
                {categories.length > 0 && (
                    <div className="flex items-center gap-2">
                        <Filter size={14} className="text-slate-400" />
                        <select
                            value={selectedCategory}
                            onChange={e => setSelectedCategory(e.target.value)}
                            className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 py-1.5 px-3 rounded-xl outline-none focus:border-indigo-600 cursor-pointer"
                        >
                            <option value="all">All Industries</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Templates Grid List */}
            {filteredTemplates.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200/80 p-16 text-center space-y-4">
                    <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                        <Layers size={28} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">No Templates Found</h3>
                        <p className="text-xs text-slate-400 font-medium max-w-sm mx-auto mt-1">
                            {searchQuery || selectedType !== 'all' ? 'Try adjusting your search terms or filter.' : 'Click "Create New Template" to build your first global system template!'}
                        </p>
                    </div>
                    {(!searchQuery && selectedType === 'all') && (
                        <button
                            onClick={handleOpenCreate}
                            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all inline-flex items-center gap-2"
                        >
                            <Plus size={14} /> Create First Template
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTemplates.map(template => (
                        <div
                            key={template.id}
                            className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
                        >
                            {/* Card Thumbnail / Preview */}
                            <div className="h-48 bg-slate-900 relative overflow-hidden flex items-center justify-center">
                                {template.thumbnail ? (
                                    <img
                                        src={template.thumbnail}
                                        alt={template.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="text-slate-600 flex flex-col items-center gap-2">
                                        <Layout size={36} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Visual Preview</span>
                                    </div>
                                )}

                                {/* Overlay Badges */}
                                <div className="absolute top-3 left-3 flex items-center gap-2">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md backdrop-blur-md ${template.type === 'full_catalog' ? 'bg-indigo-600 text-white' : template.type === 'cover' ? 'bg-emerald-600 text-white' : template.type === 'header' ? 'bg-amber-600 text-white' : template.type === 'footer' ? 'bg-cyan-600 text-white' : 'bg-purple-600 text-white'}`}>
                                        {template.type === 'full_catalog' ? 'Full Catalog' : template.type === 'cover' ? 'Cover Page' : template.type === 'header' ? 'Header' : template.type === 'footer' ? 'Footer' : 'Product Grid'}
                                    </span>
                                </div>

                                <div className="absolute top-3 right-3">
                                    <button
                                        onClick={() => handleToggleActive(template)}
                                        title={template.is_active ? 'Active (Click to Deactivate)' : 'Inactive (Click to Activate)'}
                                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md backdrop-blur-md flex items-center gap-1.5 ${template.is_active ? 'bg-emerald-500/90 text-white' : 'bg-slate-700/90 text-slate-300'}`}
                                    >
                                        {template.is_active ? <CheckCircle size={10} /> : <XCircle size={10} />}
                                        {template.is_active ? 'Live' : 'Draft'}
                                    </button>
                                </div>

                                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white/90 text-[11px] font-bold drop-shadow-md">
                                    <span className="bg-black/60 px-2.5 py-0.5 rounded-md backdrop-blur-sm">
                                        {template.category || 'General'}
                                    </span>
                                    {template.type !== 'product_grid' && (
                                        <span className="bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-sm">
                                            {template.pages_data?.length || 1} Page(s)
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                <div className="space-y-1.5">
                                    <h3 className="text-sm font-black text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                                        {template.name}
                                    </h3>
                                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-normal">
                                        {template.description || 'Global catalog template ready for all SaaS clients.'}
                                    </p>
                                </div>

                                {/* Card Actions */}
                                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                        Base: {template.theme_id || 'default'}
                                    </span>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => openTemplateInVisualEditor(template)}
                                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all"
                                            title="Open full interactive visual canvas editor"
                                        >
                                            <Sparkles size={13} /> Visual Editor
                                        </button>
                                        <button
                                            onClick={() => handleOpenEdit(template)}
                                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                                            title="Edit metadata & settings"
                                        >
                                            <Edit3 size={13} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(template)}
                                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                            title="Delete Template"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Template Editor / Maker Modal */}
            <AdminTemplateEditorModal
                isOpen={isEditorOpen}
                onClose={() => setIsEditorOpen(false)}
                onSave={handleSaveTemplate}
                initialData={editingTemplate}
            />
        </div>
    );
};
