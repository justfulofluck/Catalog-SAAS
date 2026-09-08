import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { ArrowLeft, Check, Building2 } from 'lucide-react';

const OnboardingForm: React.FC = () => {
    const { businessTemplates, selectedBusinessTemplateId, selectBusinessTemplate, completeOnboarding } = useStore();
    const template = businessTemplates.find(t => t.id === selectedBusinessTemplateId);

    const [businessName, setBusinessName] = useState('');

    useEffect(() => {
        if (!template) {
            selectBusinessTemplate(null);
        }
    }, [template, selectBusinessTemplate]);

    if (!template) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (businessName.trim()) {
            completeOnboarding(template.id, businessName);
        }
    };

    return (
        <div className="min-h-screen bg-[#100F0F] text-white flex flex-col font-sans">
            <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full md:p-8 gap-8 justify-center items-center">

                {/* Setup Form */}
                <div className="flex-1 max-w-2xl bg-[#161616] rounded-[4px] border border-[#262626] overflow-hidden shadow-2xl">
                    <form onSubmit={handleSubmit} className="flex flex-col h-full">
                        <div className="p-8 border-b border-[#262626] bg-[#121212]">
                            <div className="flex items-center gap-2 mb-4">
                                <button
                                    type="button"
                                    onClick={() => selectBusinessTemplate(null)}
                                    className="flex items-center gap-1 text-[10px] font-bold text-[#E2DCC8] uppercase tracking-widest hover:text-[#E2DCC8] transition-colors"
                                >
                                    <ArrowLeft size={12} /> Back
                                </button>
                            </div>
                            <h1 className="font-space text-3xl font-bold text-white tracking-tight">Business Identity</h1>
                            <p className="text-[#888888] font-medium mt-1">Configure your workspace for <span className="text-[#E2DCC8] font-bold">{template.name}</span>.</p>
                        </div>

                        <div className="p-8 space-y-8">
                            {/* Business Name Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 pb-2 border-b border-[#262626]">
                                    <Building2 className="text-[#E2DCC8]" size={24} />
                                    <h3 className="font-space text-sm font-bold text-white uppercase tracking-widest">Store Profile</h3>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-[#888888] uppercase tracking-widest ml-1">Business / Store Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={businessName}
                                        onChange={(e) => setBusinessName(e.target.value)}
                                        placeholder="e.g. Downtown Electronics"
                                        className="w-full bg-[#1c1c1c] border border-[#262626] rounded-[4px] px-6 py-4 text-lg font-bold text-white focus:border-[#0F3D3E] outline-none transition-all"
                                        autoFocus
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-8 border-t border-[#262626] bg-[#121212] flex justify-end items-center">
                            <button
                                type="submit"
                                disabled={!businessName}
                                className="px-8 py-3.5 bg-[#0F3D3E] hover:bg-[#155455] border border-[#E2DCC8]/30 text-white rounded-[4px] text-xs font-bold uppercase tracking-widest shadow-xl shadow-[#0F3D3E]/20 transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                <Check size={16} /> Complete Setup
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default OnboardingForm;
