import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { ArrowLeft, Check, Building2 } from 'lucide-react';

const OnboardingForm: React.FC = () => {
    const { businessTemplates, selectedBusinessTemplateId, selectBusinessTemplate, completeOnboarding, uiTheme } = useStore();
    const isDark = uiTheme === 'dark';
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
        <div className={`min-h-screen flex flex-col font-sans transition-colors ${
            isDark ? 'bg-[#100F0F] text-white' : 'bg-slate-50 text-slate-900'
        }`}>
            <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full md:p-8 gap-8 justify-center items-center">

                {/* Setup Form */}
                <div className={`flex-1 max-w-2xl rounded-[4px] border overflow-hidden shadow-2xl transition-colors ${
                    isDark ? 'bg-[#161616] border-[#262626]' : 'bg-white border-slate-200 shadow-xl'
                }`}>
                    <form onSubmit={handleSubmit} className="flex flex-col h-full">
                        <div className={`p-8 border-b transition-colors ${
                            isDark ? 'border-[#262626] bg-[#121212]' : 'border-slate-200 bg-slate-50'
                        }`}>
                            <div className="flex items-center gap-2 mb-4">
                                <button
                                    type="button"
                                    onClick={() => selectBusinessTemplate(null)}
                                    className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest transition-colors ${
                                        isDark ? 'text-[#E2DCC8] hover:text-white' : 'text-[#0F3D3E] hover:text-[#155455]'
                                    }`}
                                >
                                    <ArrowLeft size={12} /> Back
                                </button>
                            </div>
                            <h1 className={`font-space text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Business Identity</h1>
                            <p className={`font-medium mt-1 ${isDark ? 'text-[#888888]' : 'text-slate-500'}`}>
                                Configure your workspace for <span className={`font-bold ${isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'}`}>{template.name}</span>.
                            </p>
                        </div>

                        <div className="p-8 space-y-8">
                            {/* Business Name Section */}
                            <div className="space-y-4">
                                <div className={`flex items-center gap-3 pb-2 border-b ${isDark ? 'border-[#262626]' : 'border-slate-200'}`}>
                                    <Building2 className={isDark ? "text-[#E2DCC8]" : "text-[#0F3D3E]"} size={24} />
                                    <h3 className={`font-space text-sm font-bold uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>Store Profile</h3>
                                </div>
                                <div className="space-y-2">
                                    <label className={`text-[10px] font-bold uppercase tracking-widest ml-1 ${isDark ? 'text-[#888888]' : 'text-slate-500'}`}>Business / Store Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={businessName}
                                        onChange={(e) => setBusinessName(e.target.value)}
                                        placeholder="e.g. Downtown Electronics"
                                        className={`w-full border rounded-[4px] px-6 py-4 text-lg font-bold outline-none transition-all ${
                                            isDark 
                                                ? 'bg-[#1c1c1c] border-[#262626] text-white focus:border-[#0F3D3E]' 
                                                : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#0F3D3E] focus:bg-white'
                                        }`}
                                        autoFocus
                                    />
                                </div>
                            </div>
                        </div>

                        <div className={`p-8 border-t flex justify-end items-center transition-colors ${
                            isDark ? 'border-[#262626] bg-[#121212]' : 'border-slate-200 bg-slate-50'
                        }`}>
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
