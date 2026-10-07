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
    ExternalLink,
    BookOpen,
    ArrowUpToLine,
    ArrowDownToLine,
    Check,
    X
} from 'lucide-react';

export const AdminTemplateManager: React.FC = () => {
    const {
        systemTemplates,
        fetchSystemTemplates,
        updateSystemTemplate,
        deleteSystemTemplate,
        openTemplateInVisualEditor,
        setIsAdminHeaderDesignerOpen,
        setIsAdminFooterDesignerOpen,
        setIsAdminCardThemeDesignerOpen,
        showToast
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
                return { label: 'Header Blueprint', style: 'bg-amber-500/15 text-amber-300 border-amber-500/30' };
            case 'footer':
                return { label: 'Footer Blueprint', style: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' };
            case 'full_catalog':
                return { label: 'Full Catalog', style: 'bg-[#0F3D3E]/30 text-[#E2DCC8] border-[#0F3D3E]/50' };
            case 'cover':
                return { label: 'Cover Blueprint', style: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' };
            case 'card_theme':
                return { label: 'Card Theme', style: 'bg-violet-500/15 text-violet-300 border-violet-500/30' };
            case 'product_grid':
                return { label: 'Product Grid', style: 'bg-purple-500/15 text-purple-300 border-purple-500/30' };
            default:
                return { label: type, style: 'bg-zinc-800 text-zinc-300 border-zinc-700' };
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Filters, Search & Import Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-[#161616] p-4 rounded-[6px] border border-[#262626]">
                {/* Search */}
                <div className="relative flex-1 min-w-[220px]">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#666666]" size={15} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search blueprints by name, industry, or type..."
                        className="w-full pl-10 pr-4 py-2 bg-[#1c1c1c] border border-[#262626] rounded-[4px] text-xs font-medium text-white placeholder-[#666666] outline-none focus:border-[#0F3D3E] transition-all"
                    />
                </div>

                {/* Filter by Type */}
                <div className="flex items-center gap-1.5 bg-[#121212] p-1 rounded-[4px] border border-[#262626] overflow-x-auto">
                    {[
                        { id: 'all', label: 'All Blueprints' },
                        { id: 'cover', label: 'Covers' },
                        { id: 'header', label: 'Headers' },
                        { id: 'footer', label: 'Footers' },
                        { id: 'card_theme', label: 'Card Themes' },
                        { id: 'full_catalog', label: 'Catalogs' }
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
            </div>

            {/* Templates List View Table */}
            {filteredTemplates.length === 0 ? (
                <div className="bg-[#161616] rounded-[6px] border border-[#262626] p-16 text-center space-y-4">
                    <div className="w-16 h-16 bg-[#1c1c1c] text-[#666666] rounded-[6px] flex items-center justify-center mx-auto border border-[#262626]">
                        <Layers size={28} />
                    </div>
                    <div>
                        <h3 className="font-space text-sm font-bold uppercase tracking-wider text-white">No Master Blueprints Found</h3>
                        <p className="text-xs text-[#888888] font-medium max-w-sm mx-auto mt-1">
                            {searchQuery || selectedType !== 'all' ? 'Try adjusting your search terms or filter.' : 'Launch Cover Studio to create your first blueprint.'}
                        </p>
                    </div>
                    <div className="flex items-center justify-center gap-3 pt-2">
                        <button
                            onClick={() => openTemplateInVisualEditor(null)}
                            className="px-4 py-2 bg-[#0F3D3E] hover:bg-[#155455] border border-[#E2DCC8]/30 text-white font-bold text-xs rounded-[4px] shadow-md transition-all inline-flex items-center gap-2"
                        >
                            <BookOpen size={14} /> Launch Cover Studio
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-[#161616] rounded-[6px] border border-[#262626] overflow-hidden shadow-xl">
                    <div className="px-6 py-4 border-b border-[#262626] flex items-center justify-between text-xs text-[#888888] font-medium">
                        <span>Showing <strong className="text-white">{filteredTemplates.length}</strong> master blueprints</span>
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
                                                    {template.type === 'header' ? <ArrowUpToLine size={18} className="text-amber-400" /> : template.type === 'footer' ? <ArrowDownToLine size={18} className="text-cyan-400" /> : <BookOpen size={18} className="text-emerald-400" />}
                                                    <span className="text-[8px] font-bold uppercase tracking-wider">{template.type}</span>
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
                                                {template.description || 'Master blueprint ready for all SaaS users.'}
                                            </p>

                                            <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#666666] font-medium pt-0.5">
                                                <span className="bg-[#121212] px-2 py-0.5 rounded border border-[#262626] text-[#aaaaaa]">
                                                    Category: <strong className="text-slate-200">{template.category || 'General'}</strong>
                                                </span>
                                                <span>•</span>
                                                <span>
                                                    Blueprint Type: <strong className="text-slate-300 font-mono capitalize">{template.type || 'cover'}</strong>
                                                </span>
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

                                        {/* Studio Editor Button */}
                                        <button
                                            onClick={() => {
                                                if (template.type === 'header') {
                                                    setIsAdminHeaderDesignerOpen(true, template);
                                                } else if (template.type === 'footer') {
                                                    setIsAdminFooterDesignerOpen(true, template);
                                                } else if (template.type === 'card_theme') {
                                                    setIsAdminCardThemeDesignerOpen(true, template);
                                                } else {
                                                    openTemplateInVisualEditor(template);
                                                }
                                            }}
                                            className={`px-3.5 py-1.5 border active:scale-95 text-white rounded-[4px] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all ${
                                                template.type === 'header'
                                                    ? 'bg-amber-600/30 hover:bg-amber-600/50 border-amber-500/40 text-amber-200'
                                                    : template.type === 'footer'
                                                    ? 'bg-cyan-600/30 hover:bg-cyan-600/50 border-cyan-500/40 text-cyan-200'
                                                    : template.type === 'card_theme'
                                                    ? 'bg-violet-600/30 hover:bg-violet-600/50 border-violet-500/40 text-violet-200'
                                                    : 'bg-[#0F3D3E] hover:bg-[#155455] border-[#E2DCC8]/30'
                                            }`}
                                            title="Open studio blueprint designer"
                                        >
                                            {template.type === 'header' ? (
                                                <>
                                                    <ArrowUpToLine size={13} />
                                                    Header Studio
                                                </>
                                            ) : template.type === 'footer' ? (
                                                <>
                                                    <ArrowDownToLine size={13} />
                                                    Footer Studio
                                                </>
                                            ) : template.type === 'card_theme' ? (
                                                <>
                                                    <Sparkles size={13} />
                                                    Theme Studio
                                                </>
                                            ) : (
                                                <>
                                                    <BookOpen size={13} />
                                                    Cover Studio
                                                </>
                                            )}
                                        </button>

                                        {/* Delete Button */}
                                        <button
                                            onClick={() => handleDelete(template)}
                                            className="p-1.5 text-[#666666] hover:text-red-400 hover:bg-red-950/20 rounded-[4px] transition-colors"
                                            title="Delete Blueprint"
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

