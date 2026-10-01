import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import {
    CreditCard,
    Calendar,
    Search,
    Filter,
    CheckCircle2,
    Clock,
    AlertCircle,
    Plus,
    Edit3,
    Trash2,
    Sparkles,
    BookOpen,
    Package,
    HardDrive,
    Layers,
    Crown,
    X,
    Check,
    Lock,
    ShieldCheck,
    Sliders,
    Zap,
    Users
} from 'lucide-react';
import { SubscriptionPlan } from '../../types';

export const SubscriptionManagement: React.FC = () => {
    const { 
        plans, 
        fetchPlans, 
        allSubscriptions, 
        fetchAllSubscriptions,
        createAdminPlan,
        updateAdminPlan,
        deleteAdminPlan,
        showConfirm
    } = useStore();

    const [activeSubTab, setActiveSubTab] = useState<'plans' | 'subscribers'>('plans');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Plan Modal State
    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form fields state
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        price: 0,
        currency: 'INR',
        is_active: true,
        max_catalogs: 3,
        max_products: 50,
        max_storage_mb: 500,
        custom_watermark: false,
        pdf_export: true,
        ai_enabled: false,
        priority_support: false
    });

    useEffect(() => {
        fetchPlans();
        fetchAllSubscriptions();
    }, [fetchPlans, fetchAllSubscriptions]);

    const openCreateModal = () => {
        setEditingPlan(null);
        setFormData({
            name: '',
            slug: '',
            price: 499,
            currency: 'INR',
            is_active: true,
            max_catalogs: 5,
            max_products: 150,
            max_storage_mb: 1024,
            custom_watermark: true,
            pdf_export: true,
            ai_enabled: false,
            priority_support: false
        });
        setIsPlanModalOpen(true);
    };

    const openEditModal = (plan: SubscriptionPlan) => {
        setEditingPlan(plan);
        const f = plan.features || {};
        setFormData({
            name: plan.name,
            slug: plan.slug,
            price: Number(plan.price) || 0,
            currency: plan.currency || 'INR',
            is_active: plan.is_active !== undefined ? plan.is_active : true,
            max_catalogs: f.max_catalogs !== undefined ? Number(f.max_catalogs) : 3,
            max_products: f.max_products !== undefined ? Number(f.max_products) : 50,
            max_storage_mb: f.max_storage_mb !== undefined ? Number(f.max_storage_mb) : 500,
            custom_watermark: Boolean(f.custom_watermark),
            pdf_export: f.pdf_export !== undefined ? Boolean(f.pdf_export) : true,
            ai_enabled: Boolean(f.ai_enabled),
            priority_support: Boolean(f.priority_support)
        });
        setIsPlanModalOpen(true);
    };

    const handlePlanNameChange = (name: string) => {
        const autoSlug = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        setFormData(prev => ({
            ...prev,
            name,
            slug: editingPlan ? prev.slug : autoSlug
        }));
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const payload = {
            name: formData.name.trim(),
            slug: formData.slug.trim(),
            price: parseFloat(String(formData.price)) || 0,
            currency: formData.currency,
            is_active: formData.is_active,
            features: {
                max_catalogs: parseInt(String(formData.max_catalogs), 10) || 1,
                max_products: parseInt(String(formData.max_products), 10) || 1,
                max_storage_mb: parseInt(String(formData.max_storage_mb), 10) || 500,
                custom_watermark: formData.custom_watermark,
                pdf_export: formData.pdf_export,
                ai_enabled: formData.ai_enabled,
                priority_support: formData.priority_support
            }
        };

        if (editingPlan) {
            const res = await updateAdminPlan(editingPlan.id, payload);
            if (res.success) {
                setIsPlanModalOpen(false);
            }
        } else {
            const res = await createAdminPlan(payload);
            if (res.success) {
                setIsPlanModalOpen(false);
            }
        }
        setIsSubmitting(false);
    };

    const handleDeletePlan = (plan: SubscriptionPlan) => {
        showConfirm({
            title: 'Delete Subscription Tier',
            message: `Are you sure you want to delete "${plan.name}"? Users currently subscribed will retain access until expiration.`,
            confirmText: 'Delete Plan',
            type: 'danger',
            onConfirm: async () => {
                await deleteAdminPlan(plan.id);
            }
        });
    };

    const filteredSubscriptions = allSubscriptions.filter(sub => 
        (sub.user_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sub.user_email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sub.plan_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            
            {/* Top Stat Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-[#161616] p-5 rounded-[4px] border border-[#262626] flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-[#888888] uppercase tracking-widest font-heading">Total Tiers</p>
                        <p className="font-space text-2xl font-bold text-[#F1F1F1] mt-0.5">{plans.length}</p>
                    </div>
                    <div className="w-10 h-10 bg-[#0F3D3E]/30 text-[#E2DCC8] border border-[#0F3D3E] rounded-[4px] flex items-center justify-center">
                        <Crown size={18} />
                    </div>
                </div>

                <div className="bg-[#161616] p-5 rounded-[4px] border border-[#262626] flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-[#888888] uppercase tracking-widest font-heading">Active Subscribers</p>
                        <p className="font-space text-2xl font-bold text-emerald-400 mt-0.5">{allSubscriptions.filter(s => s.is_active).length}</p>
                    </div>
                    <div className="w-10 h-10 bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 rounded-[4px] flex items-center justify-center">
                        <Users size={18} />
                    </div>
                </div>

                <div className="bg-[#161616] p-5 rounded-[4px] border border-[#262626] flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-[#888888] uppercase tracking-widest font-heading">Expiring in 7 Days</p>
                        <p className="font-space text-2xl font-bold text-amber-400 mt-0.5">
                            {allSubscriptions.filter(s => {
                                if (!s.end_date) return false;
                                const daysLeft = Math.ceil((new Date(s.end_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                                return daysLeft > 0 && daysLeft <= 7;
                            }).length}
                        </p>
                    </div>
                    <div className="w-10 h-10 bg-amber-950/40 text-amber-400 border border-amber-500/30 rounded-[4px] flex items-center justify-center">
                        <Clock size={18} />
                    </div>
                </div>

                <div className="bg-[#161616] p-5 rounded-[4px] border border-[#262626] flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-[#888888] uppercase tracking-widest font-heading">Factory Status</p>
                        <p className="font-space text-sm font-bold text-[#E2DCC8] uppercase tracking-wider mt-1.5 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Production Ready
                        </p>
                    </div>
                    <div className="w-10 h-10 bg-[#0F3D3E]/30 text-[#E2DCC8] border border-[#0F3D3E] rounded-[4px] flex items-center justify-center">
                        <CreditCard size={18} />
                    </div>
                </div>
            </div>

            {/* Main Sub-Navigation Container */}
            <div className="bg-[#161616] rounded-[4px] border border-[#262626] overflow-hidden shadow-2xl">
                
                {/* Tab Switcher & Action Bar */}
                <div className="px-6 py-4 border-b border-[#262626] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#141414]">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setActiveSubTab('plans')}
                            className={`px-4 py-2 rounded-[4px] text-xs font-bold uppercase tracking-wider font-heading transition-all flex items-center gap-2 ${
                                activeSubTab === 'plans'
                                    ? 'bg-[#0F3D3E] text-white border border-[#E2DCC8]/30 shadow-md'
                                    : 'text-[#888888] hover:text-white hover:bg-[#202020]'
                            }`}
                        >
                            <Crown size={14} className="text-[#E2DCC8]" /> Plans & Tiers Factory ({plans.length})
                        </button>
                        <button
                            onClick={() => setActiveSubTab('subscribers')}
                            className={`px-4 py-2 rounded-[4px] text-xs font-bold uppercase tracking-wider font-heading transition-all flex items-center gap-2 ${
                                activeSubTab === 'subscribers'
                                    ? 'bg-[#0F3D3E] text-white border border-[#E2DCC8]/30 shadow-md'
                                    : 'text-[#888888] hover:text-white hover:bg-[#202020]'
                            }`}
                        >
                            <Users size={14} className="text-[#E2DCC8]" /> Subscriber Roster ({allSubscriptions.length})
                        </button>
                    </div>

                    {activeSubTab === 'plans' ? (
                        <button
                            onClick={openCreateModal}
                            className="px-4 py-2 bg-[#0F3D3E] hover:bg-[#155455] text-white border border-[#E2DCC8]/30 rounded-[4px] font-heading font-semibold text-xs uppercase tracking-wider shadow-md shadow-[#0F3D3E]/30 transition-all flex items-center gap-2 active:scale-95"
                        >
                            <Plus size={14} className="text-[#E2DCC8]" /> Create New Tier
                        </button>
                    ) : (
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666666]" size={15} />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by name, email, or plan..."
                                className="bg-[#1c1c1c] border border-[#262626] rounded-[4px] pl-9 pr-4 py-2 text-xs font-medium text-white placeholder-[#666666] focus:border-[#0F3D3E] outline-none w-64"
                            />
                        </div>
                    )}
                </div>

                {/* TAB 1: PLANS & TIERS FACTORY GRID */}
                {activeSubTab === 'plans' && (
                    <div className="p-6 md:p-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {plans.map((plan) => {
                                const f = plan.features || {};
                                const isStarter = plan.slug === 'starter';
                                const isGrowth = plan.slug === 'growth';
                                const isPro = plan.slug === 'pro';

                                return (
                                    <div
                                        key={plan.id}
                                        className={`rounded-[4px] p-6 border transition-all flex flex-col justify-between relative ${
                                            isGrowth
                                                ? 'bg-[#181818] border-[#E2DCC8]/35 shadow-xl ring-1 ring-[#E2DCC8]/20'
                                                : 'bg-[#181818] border-[#262626] hover:border-[#383838]'
                                        }`}
                                    >
                                        <div>
                                            {/* Plan Header */}
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#E2DCC8]/60">
                                                        SLUG: {plan.slug}
                                                    </span>
                                                    <h3 className="font-space text-xl font-bold text-[#F1F1F1] flex items-center gap-2 mt-0.5">
                                                        {plan.name}
                                                        {isPro && <Crown size={16} className="text-amber-400" />}
                                                    </h3>
                                                </div>

                                                <span className={`px-2 py-0.5 rounded-[3px] text-[9px] font-bold uppercase tracking-widest font-heading border ${
                                                    plan.is_active !== false 
                                                        ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30' 
                                                        : 'bg-red-950/40 text-red-400 border-red-500/30'
                                                }`}>
                                                    {plan.is_active !== false ? 'Live' : 'Draft'}
                                                </span>
                                            </div>

                                            {/* Price */}
                                            <div className="mb-6 pb-4 border-b border-white/5 flex items-baseline gap-1.5">
                                                <span className="font-space text-3xl font-bold text-[#E2DCC8]">
                                                    ₹{plan.price}
                                                </span>
                                                <span className="text-xs text-[#888888]">
                                                    {Number(plan.price) === 0 ? '/ 7 days trial' : '/ month'}
                                                </span>
                                            </div>

                                            {/* Quotas & Features */}
                                            <div className="space-y-2.5 mb-6 text-xs">
                                                <div className="flex items-center justify-between p-2 rounded bg-black/20 border border-white/5">
                                                    <span className="text-[#888888] flex items-center gap-2">
                                                        <BookOpen size={13} className="text-[#E2DCC8]" /> Catalogs Limit
                                                    </span>
                                                    <span className="font-mono font-bold text-[#F1F1F1]">
                                                        {f.max_catalogs ?? 3} Active
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-between p-2 rounded bg-black/20 border border-white/5">
                                                    <span className="text-[#888888] flex items-center gap-2">
                                                        <Package size={13} className="text-[#E2DCC8]" /> Product Inventory
                                                    </span>
                                                    <span className="font-mono font-bold text-[#F1F1F1]">
                                                        {f.max_products ?? 50} SKUs
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-between p-2 rounded bg-black/20 border border-white/5">
                                                    <span className="text-[#888888] flex items-center gap-2">
                                                        <HardDrive size={13} className="text-[#E2DCC8]" /> Storage Limit
                                                    </span>
                                                    <span className="font-mono font-bold text-[#F1F1F1]">
                                                        {f.max_storage_mb ? (f.max_storage_mb >= 1024 ? `${f.max_storage_mb / 1024} GB` : `${f.max_storage_mb} MB`) : '500 MB'}
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-between p-2 rounded bg-black/20 border border-white/5">
                                                    <span className="text-[#888888] flex items-center gap-2">
                                                        <Layers size={13} className="text-[#E2DCC8]" /> Custom Watermark
                                                    </span>
                                                    <span className={`font-bold ${f.custom_watermark ? 'text-emerald-400' : 'text-[#666666]'}`}>
                                                        {f.custom_watermark ? 'Enabled' : 'System Default'}
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-between p-2 rounded bg-black/20 border border-white/5">
                                                    <span className="text-[#888888] flex items-center gap-2">
                                                        <Sparkles size={13} className="text-[#E2DCC8]" /> AI Product Grid
                                                    </span>
                                                    <span className={`font-bold ${f.ai_enabled ? 'text-emerald-400' : 'text-[#666666]'}`}>
                                                        {f.ai_enabled ? 'Active' : 'Disabled'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Tier Actions */}
                                        <div className="pt-4 border-t border-white/5 flex items-center gap-2">
                                            <button
                                                onClick={() => openEditModal(plan)}
                                                className="flex-1 py-2.5 bg-[#222222] hover:bg-[#2a2a2a] text-[#E2DCC8] border border-[#333333] rounded-[4px] font-heading font-semibold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                                            >
                                                <Edit3 size={13} /> Edit Tier
                                            </button>

                                            {!isStarter && (
                                                <button
                                                    onClick={() => handleDeletePlan(plan)}
                                                    className="p-2.5 bg-red-950/30 hover:bg-red-950/60 text-red-400 border border-red-800/40 rounded-[4px] transition-all"
                                                    title="Delete Tier"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* TAB 2: SUBSCRIBER OVERVIEW TABLE */}
                {activeSubTab === 'subscribers' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#121212] border-b border-[#262626]">
                                <tr>
                                    <th className="px-8 py-4 text-[10px] font-bold text-[#888888] uppercase tracking-widest font-heading">Subscriber</th>
                                    <th className="px-8 py-4 text-[10px] font-bold text-[#888888] uppercase tracking-widest font-heading">Assigned Tier</th>
                                    <th className="px-8 py-4 text-[10px] font-bold text-[#888888] uppercase tracking-widest font-heading">Start Date</th>
                                    <th className="px-8 py-4 text-[10px] font-bold text-[#888888] uppercase tracking-widest font-heading">Valid Until</th>
                                    <th className="px-8 py-4 text-[10px] font-bold text-[#888888] uppercase tracking-widest font-heading">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#262626]">
                                {filteredSubscriptions.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-12 text-center text-[#666666] font-bold italic">
                                            No subscribers found matching query.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredSubscriptions.map(sub => (
                                        <tr key={sub.id} className="hover:bg-[#1c1c1c] transition-colors">
                                            <td className="px-8 py-4">
                                                <div>
                                                    <p className="text-sm font-bold text-white">{sub.user_name || 'Creator'}</p>
                                                    <p className="text-xs text-[#888888] font-mono">{sub.user_email}</p>
                                                </div>
                                            </td>
                                            <td className="px-8 py-4">
                                                <span className={`px-3 py-1 rounded-[3px] text-[10px] font-bold uppercase tracking-widest font-heading border ${
                                                    sub.plan_name?.toLowerCase().includes('pro')
                                                        ? 'bg-[#0F3D3E]/30 text-[#E2DCC8] border-[#0F3D3E]'
                                                        : sub.plan_name?.toLowerCase().includes('growth')
                                                            ? 'bg-purple-950/40 text-purple-400 border-purple-800/40'
                                                            : 'bg-[#1c1c1c] text-[#888888] border-[#262626]'
                                                }`}>
                                                    {sub.plan_name}
                                                </span>
                                            </td>
                                            <td className="px-8 py-4 text-xs font-mono text-[#888888]">
                                                {new Date(sub.start_date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                            </td>
                                            <td className="px-8 py-4">
                                                {sub.end_date ? (
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-mono text-[#888888]">
                                                            {new Date(sub.end_date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                                        </span>
                                                        <span className="text-[9px] font-bold text-amber-400/80 uppercase mt-0.5 font-heading">
                                                            {Math.ceil((new Date(sub.end_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24))} days remaining
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs italic text-[#555555]">Active Ongoing</span>
                                                )}
                                            </td>
                                            <td className="px-8 py-4">
                                                <div className="flex items-center gap-1.5">
                                                    {sub.is_active ? (
                                                        <CheckCircle2 size={14} className="text-emerald-400" />
                                                    ) : (
                                                        <AlertCircle size={14} className="text-red-400" />
                                                    )}
                                                    <span className={`text-xs font-bold ${sub.is_active ? 'text-emerald-400' : 'text-red-400'}`}>
                                                        {sub.is_active ? 'Active' : 'Expired'}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* PLAN CREATOR & EDITOR MODAL */}
            {isPlanModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div 
                        onClick={() => setIsPlanModalOpen(false)}
                        className="absolute inset-0 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
                    />

                    {/* Modal Window */}
                    <div className="relative w-full max-w-2xl bg-[#161616] border border-[#2e2e2e] rounded-[6px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                        
                        {/* Modal Header */}
                        <div className="p-6 border-b border-[#262626] bg-[#121212] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-[#0F3D3E] text-[#E2DCC8] border border-[#E2DCC8]/20 rounded-[4px] flex items-center justify-center">
                                    <Sliders size={18} />
                                </div>
                                <div>
                                    <h3 className="font-space text-lg font-bold text-white">
                                        {editingPlan ? `Edit Tier: ${editingPlan.name}` : 'Create New Subscription Tier'}
                                    </h3>
                                    <p className="text-xs text-[#888888]">
                                        Define pricing, catalog volume thresholds, and feature entitlements.
                                    </p>
                                </div>
                            </div>

                            <button 
                                onClick={() => setIsPlanModalOpen(false)}
                                className="p-1.5 text-[#888888] hover:text-white rounded"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleFormSubmit} className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
                            
                            {/* General Parameters */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-[#E2DCC8]/70 uppercase tracking-widest font-heading">
                                        Tier Display Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => handlePlanNameChange(e.target.value)}
                                        placeholder="e.g. Growth Boost"
                                        className="w-full bg-[#1b1b1b] border border-[#2e2e2e] rounded-[4px] px-3.5 py-2.5 text-sm font-semibold text-white focus:border-[#E2DCC8] outline-none"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-[#E2DCC8]/70 uppercase tracking-widest font-heading">
                                        System Slug
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                                        placeholder="e.g. growth-boost"
                                        className="w-full bg-[#1b1b1b] border border-[#2e2e2e] rounded-[4px] px-3.5 py-2.5 text-sm font-mono font-bold text-[#E2DCC8] focus:border-[#E2DCC8] outline-none"
                                    />
                                </div>
                            </div>

                            {/* Pricing Parameters */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-[#E2DCC8]/70 uppercase tracking-widest font-heading">
                                        Monthly Price (₹)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="1"
                                        required
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                        className="w-full bg-[#1b1b1b] border border-[#2e2e2e] rounded-[4px] px-3.5 py-2.5 text-sm font-bold text-white focus:border-[#E2DCC8] outline-none font-space"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-[#E2DCC8]/70 uppercase tracking-widest font-heading">
                                        Currency
                                    </label>
                                    <input
                                        type="text"
                                        maxLength={3}
                                        value={formData.currency}
                                        onChange={(e) => setFormData({ ...formData, currency: e.target.value.toUpperCase() })}
                                        className="w-full bg-[#1b1b1b] border border-[#2e2e2e] rounded-[4px] px-3.5 py-2.5 text-sm font-mono font-bold text-white focus:border-[#E2DCC8] outline-none uppercase"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-[#E2DCC8]/70 uppercase tracking-widest font-heading">
                                        Tier Status
                                    </label>
                                    <select
                                        value={formData.is_active ? 'true' : 'false'}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                                        className="w-full bg-[#1b1b1b] border border-[#2e2e2e] rounded-[4px] px-3.5 py-2.5 text-xs font-bold text-white focus:border-[#E2DCC8] outline-none"
                                    >
                                        <option value="true">Active (Public)</option>
                                        <option value="false">Inactive / Hidden</option>
                                    </select>
                                </div>
                            </div>

                            {/* Quota Limits */}
                            <div className="p-4.5 bg-[#121212] border border-[#262626] rounded-[4px] space-y-4">
                                <p className="text-[10px] font-bold text-[#E2DCC8] uppercase tracking-widest font-heading flex items-center gap-1.5">
                                    <Sliders size={12} /> Resource Thresholds & Quotas
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-medium text-[#888888]">Max Catalogs Allowed</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={formData.max_catalogs}
                                            onChange={(e) => setFormData({ ...formData, max_catalogs: parseInt(e.target.value, 10) || 1 })}
                                            className="w-full bg-[#1b1b1b] border border-[#2e2e2e] rounded-[4px] px-3 py-2 text-xs font-mono font-bold text-white"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-medium text-[#888888]">Max Products in Catalog</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={formData.max_products}
                                            onChange={(e) => setFormData({ ...formData, max_products: parseInt(e.target.value, 10) || 1 })}
                                            className="w-full bg-[#1b1b1b] border border-[#2e2e2e] rounded-[4px] px-3 py-2 text-xs font-mono font-bold text-white"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-medium text-[#888888]">Media Storage (MB)</label>
                                        <input
                                            type="number"
                                            min="100"
                                            step="100"
                                            value={formData.max_storage_mb}
                                            onChange={(e) => setFormData({ ...formData, max_storage_mb: parseInt(e.target.value, 10) || 500 })}
                                            className="w-full bg-[#1b1b1b] border border-[#2e2e2e] rounded-[4px] px-3 py-2 text-xs font-mono font-bold text-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Feature Toggles */}
                            <div className="space-y-3">
                                <p className="text-[10px] font-bold text-[#E2DCC8]/70 uppercase tracking-widest font-heading">
                                    Feature Entitlements
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <label className="flex items-center gap-3 p-3 rounded-[4px] bg-[#1a1a1a] border border-[#282828] cursor-pointer hover:border-[#383838]">
                                        <input
                                            type="checkbox"
                                            checked={formData.custom_watermark}
                                            onChange={(e) => setFormData({ ...formData, custom_watermark: e.target.checked })}
                                            className="w-4 h-4 rounded text-[#0F3D3E] focus:ring-0 bg-[#222222] border-[#333333]"
                                        />
                                        <div>
                                            <p className="text-xs font-bold text-white">Custom Watermark & Logo</p>
                                            <p className="text-[10px] text-[#888888]">Allows removing platform branding</p>
                                        </div>
                                    </label>

                                    <label className="flex items-center gap-3 p-3 rounded-[4px] bg-[#1a1a1a] border border-[#282828] cursor-pointer hover:border-[#383838]">
                                        <input
                                            type="checkbox"
                                            checked={formData.ai_enabled}
                                            onChange={(e) => setFormData({ ...formData, ai_enabled: e.target.checked })}
                                            className="w-4 h-4 rounded text-[#0F3D3E] focus:ring-0 bg-[#222222] border-[#333333]"
                                        />
                                        <div>
                                            <p className="text-xs font-bold text-white">AI Product Grid Assembly</p>
                                            <p className="text-[10px] text-[#888888]">Unlocks AI studio auto-generation</p>
                                        </div>
                                    </label>

                                    <label className="flex items-center gap-3 p-3 rounded-[4px] bg-[#1a1a1a] border border-[#282828] cursor-pointer hover:border-[#383838]">
                                        <input
                                            type="checkbox"
                                            checked={formData.pdf_export}
                                            onChange={(e) => setFormData({ ...formData, pdf_export: e.target.checked })}
                                            className="w-4 h-4 rounded text-[#0F3D3E] focus:ring-0 bg-[#222222] border-[#333333]"
                                        />
                                        <div>
                                            <p className="text-xs font-bold text-white">High-Res Multi-Page PDF</p>
                                            <p className="text-[10px] text-[#888888]">Client vector compilation</p>
                                        </div>
                                    </label>

                                    <label className="flex items-center gap-3 p-3 rounded-[4px] bg-[#1a1a1a] border border-[#282828] cursor-pointer hover:border-[#383838]">
                                        <input
                                            type="checkbox"
                                            checked={formData.priority_support}
                                            onChange={(e) => setFormData({ ...formData, priority_support: e.target.checked })}
                                            className="w-4 h-4 rounded text-[#0F3D3E] focus:ring-0 bg-[#222222] border-[#333333]"
                                        />
                                        <div>
                                            <p className="text-xs font-bold text-white">VIP Priority Support SLA</p>
                                            <p className="text-[10px] text-[#888888]">Dedicated assistance queue</p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Modal Footer Actions */}
                            <div className="pt-4 border-t border-[#262626] flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsPlanModalOpen(false)}
                                    className="px-5 py-2.5 bg-[#222222] hover:bg-[#282828] text-[#cccccc] rounded-[4px] font-heading font-medium text-xs uppercase tracking-wider transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-2.5 bg-[#0F3D3E] hover:bg-[#155455] text-white border border-[#E2DCC8]/30 rounded-[4px] font-heading font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#0F3D3E]/30 transition-all flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Check size={14} /> {editingPlan ? 'Save Changes' : 'Create Tier'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubscriptionManagement;
