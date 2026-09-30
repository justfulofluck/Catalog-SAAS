import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { SystemTemplate } from '../../types';
import {
    Search,
    Filter,
    Trash2,
    CheckCircle,
    XCircle,
    Layout,
    Layers,
    Sparkles,
    SlidersHorizontal,
    FileText,
    ExternalLink
} from 'lucide-react';

export const AdminTemplateManager: React.FC = () => {
    const {
        systemTemplates,
        fetchSystemTemplates,
        updateSystemTemplate,
        deleteSystemTemplate,
        openTemplateInVisualEditor,
        setIsAdminHeaderDesignerOpen,
        setIsAdminFooterDesignerOpen
    } = useStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState<string>('all');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

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

    const handleDelete = async (template: SystemTemplate) => {
        if (window.confirm(`Are you sure you want to delete template "${template.name}"?`)) {
            await deleteSystemTemplate(template.id);
        }
    };

    const handleToggleActive = async (template: SystemTemplate) => {
        await updateSystemTemplate(template.id, { is_active: !template.is_active });
    };

    const categories = Array.from(new Set(systemTemplates.map(t => t.category).filter(Boolean)));

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'header':
                return { label: 'Header', style: 'bg-amber-500/15 text-amber-300 border-amber-500/30' };
            case 'footer':
                return { label: 'Footer', style: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' };
            case 'full_catalog':
                return { label: 'Full Catalog', style: 'bg-[#0F3D3E]/30 text-[#E2DCC8] border-[#0F3D3E]/50' };
            case 'cover':
                return { label: 'Cover Page', style: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' };
            case 'product_grid':
                return { label: 'Product Grid', style: 'bg-purple-500/15 text-purple-300 border-purple-500/30' };
            default:
                return { label: type, style: 'bg-zinc-800 text-zinc-300 border-zinc-700' };
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Filters & Search Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-[#161616] p-4 rounded-[6px] border border-[#262626]">
                {/* Search */}
                <div className="relative flex-1 min-w-[240px]">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#666666]" size={15} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search templates by name, industry, or type..."
                        className="w-full pl-10 pr-4 py-2 bg-[#1c1c1c] border border-[#262626] rounded-[4px] text-xs font-medium text-white placeholder-[#666666] outline-none focus:border-[#0F3D3E] transition-all"
                    />
                </div>

                {/* Filter by Type */}
                <div className="flex items-center gap-1.5 bg-[#121212] p-1 rounded-[4px] border border-[#262626] overflow-x-auto">
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
                            className={`px-3 py-1.5 rounded-[4px] text-xs font-bold transition-all whitespace-nowrap ${selectedType === tab.id ? 'bg-[#262626] text-[#E2DCC8] shadow-sm' : 'text-[#888888] hover:text-white'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Filter by Category */}
                {categories.length > 0 && (
                    <div className="flex items-center gap-2">
                        <Filter size={14} className="text-[#666666]" />
                        <select
                            value={selectedCategory}
                            onChange={e => setSelectedCategory(e.target.value)}
                            className="bg-[#1c1c1c] border border-[#262626] text-xs font-bold text-white py-1.5 px-3 rounded-[4px] outline-none focus:border-[#0F3D3E] cursor-pointer"
                        >
                            <option value="all">All Industries</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Templates List View Table */}
            {filteredTemplates.length === 0 ? (
                <div className="bg-[#161616] rounded-[6px] border border-[#262626] p-16 text-center space-y-4">
                    <div className="w-16 h-16 bg-[#1c1c1c] text-[#666666] rounded-[6px] flex items-center justify-center mx-auto border border-[#262626]">
                        <Layers size={28} />
                    </div>
                    <div>
                        <h3 className="font-space text-sm font-bold uppercase tracking-wider text-white">No Templates Found</h3>
                        <p className="text-xs text-[#888888] font-medium max-w-sm mx-auto mt-1">
                            {searchQuery || selectedType !== 'all' ? 'Try adjusting your search terms or filter.' : 'Click "Catalog Studio" to build your first global system template!'}
                        </p>
                    </div>
                    {(!searchQuery && selectedType === 'all') && (
                        <button
                            onClick={() => openTemplateInVisualEditor(null)}
                            className="px-5 py-2.5 bg-[#0F3D3E] hover:bg-[#155455] border border-[#E2DCC8]/30 text-white font-bold text-xs rounded-[4px] shadow-md transition-all inline-flex items-center gap-2"
                        >
                            <Sparkles size={14} /> Create First Template
                        </button>
                    )}
                </div>
            ) : (
                <div className="bg-[#161616] rounded-[6px] border border-[#262626] overflow-hidden shadow-xl">
                    <div className="px-6 py-4 border-b border-[#262626] flex items-center justify-between text-xs text-[#888888] font-medium">
                        <span>Showing <strong className="text-white">{filteredTemplates.length}</strong> template blueprints</span>
                    </div>

                    <div className="divide-y divide-[#242424]">
                        {filteredTemplates.map(template => {
                            const typeBadge = getTypeBadge(template.type);

                            return (
                                <div
                                    key={template.id}
                                    className="p-4 sm:px-6 hover:bg-[#1c1c1c]/90 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                                >
                                    {/* Left: Preview + Info */}
                                    <div className="flex items-center gap-4 min-w-0 flex-1">
                                        {/* Thumbnail / Icon Badge */}
                                        <div className="w-16 h-14 sm:w-20 sm:h-16 rounded-[4px] bg-[#121212] border border-[#2a2a2a] overflow-hidden flex items-center justify-center shrink-0 relative">
                                            {template.thumbnail ? (
                                                <img
                                                    src={template.thumbnail}
                                                    alt={template.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="text-[#666666] flex flex-col items-center gap-1">
                                                    <Layout size={18} />
                                                    <span className="text-[8px] font-bold uppercase tracking-wider">Canvas</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Name & Details */}
                                        <div className="min-w-0 flex-1 space-y-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="font-space text-sm font-bold text-white group-hover:text-[#E2DCC8] transition-colors truncate">
                                                    {template.name}
                                                </h3>
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${typeBadge.style}`}>
                                                    {typeBadge.label}
                                                </span>
                                            </div>

                                            <p className="text-xs text-[#888888] line-clamp-1 font-normal">
                                                {template.description || 'Global master template blueprint ready for all SaaS users.'}
                                            </p>

                                            <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#666666] font-medium pt-0.5">
                                                <span className="bg-[#121212] px-2 py-0.5 rounded border border-[#262626] text-[#aaaaaa]">
                                                    Category: <strong className="text-slate-200">{template.category || 'General'}</strong>
                                                </span>
                                                <span>•</span>
                                                <span>
                                                    Base: <strong className="text-slate-300 font-mono">{template.theme_id || 'default'}</strong>
                                                </span>
                                                {template.type !== 'product_grid' && (
                                                    <>
                                                        <span>•</span>
                                                        <span>
                                                            <strong className="text-slate-300">{template.pages_data?.length || 1}</strong> Page(s)
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Status Pill & Action Buttons */}
                                    <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#222222]">
                                        {/* Live / Draft Status Toggle */}
                                        <button
                                            onClick={() => handleToggleActive(template)}
                                            title={template.is_active ? 'Status: Active (Click to set Draft)' : 'Status: Draft (Click to set Live)'}
                                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all border ${
                                                template.is_active
                                                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                                                    : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700 hover:text-zinc-200'
                                            }`}
                                        >
                                            {template.is_active ? <CheckCircle size={11} /> : <XCircle size={11} />}
                                            {template.is_active ? 'Live' : 'Draft'}
                                        </button>

                                        {/* Visual Editor Button */}
                                        <button
                                            onClick={() => {
                                                if (template.type === 'header') {
                                                    setIsAdminHeaderDesignerOpen(true, template);
                                                } else if (template.type === 'footer') {
                                                    setIsAdminFooterDesignerOpen(true, template);
                                                } else {
                                                    openTemplateInVisualEditor(template);
                                                }
                                            }}
                                            className="px-3.5 py-1.5 bg-[#0F3D3E] hover:bg-[#155455] border border-[#E2DCC8]/30 active:scale-95 text-white rounded-[4px] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all"
                                            title="Open interactive visual editor"
                                        >
                                            <Sparkles size={13} />
                                            Visual Editor
                                        </button>

                                        {/* Delete Button */}
                                        <button
                                            onClick={() => handleDelete(template)}
                                            className="p-1.5 text-[#666666] hover:text-red-400 hover:bg-red-950/20 rounded-[4px] transition-colors"
                                            title="Delete Template"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
