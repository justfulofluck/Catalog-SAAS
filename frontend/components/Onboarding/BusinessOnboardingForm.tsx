
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
        <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
            <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full md:p-8 gap-8 justify-center items-center">

                {/* Simplified Setup Form */}
                <div className="flex-1 max-w-2xl bg-white rounded-3xl shadow-xl shadow-slate-200/20 border border-slate-100 overflow-hidden">
                    <form onSubmit={handleSubmit} className="flex flex-col h-full">
                        <div className="p-8 border-b border-slate-50 bg-slate-50/50">
                            <div className="flex items-center gap-2 mb-4">
                                <button
                                    type="button"
                                    onClick={() => selectBusinessTemplate(null)}
                                    className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
                                >
                                    <ArrowLeft size={12} /> Back
                                </button>
                            </div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Business Identity</h1>
                            <p className="text-slate-500 font-medium mt-1">Configure your workspace for <span className="text-indigo-600 font-bold">{template.name}</span>.</p>
                        </div>

                        <div className="p-8 space-y-8">
                            {/* Business Name Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 pb-2 border-b border-slate-50">
                                    <Building2 className="text-indigo-600" size={24} />
                                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Store Profile</h3>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Business / Store Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={businessName}
                                        onChange={(e) => setBusinessName(e.target.value)}
                                        placeholder="e.g. Downtown Electronics"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-6 py-4 text-lg font-bold text-slate-800 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all"
                                        autoFocus
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-8 border-t border-slate-50 bg-slate-50/30 flex justify-end items-center">
                            <button
                                type="submit"
                                disabled={!businessName}
                                className="px-10 py-4 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center gap-2"
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
