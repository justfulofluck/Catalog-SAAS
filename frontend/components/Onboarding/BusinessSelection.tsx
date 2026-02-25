
import React from 'react';
import { useStore } from '../../store/useStore';
import { Store, ArrowRight, ShieldCheck } from 'lucide-react';

const BusinessSelection: React.FC = () => {
    const { businessTemplates, selectBusinessTemplate, logout, setView, fetchBusinessTemplates } = useStore();

    React.useEffect(() => {
        fetchBusinessTemplates();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            {/* Header */}
            <div className="px-8 py-6 flex items-center justify-between bg-white border-b border-slate-200">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-600/20">C</div>
                    <span className="font-black text-xl tracking-tight text-slate-900">Studio.</span>
                </div>
                <div className="flex items-center gap-6">
                    <button onClick={() => setView('pricing')} className="text-sm font-black text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-widest px-4 py-2 bg-indigo-50 rounded-lg border border-indigo-100 shadow-sm shadow-indigo-600/5 hover:-translate-y-0.5 transform active:scale-95 transition-all">Upgrade Plan</button>
                    <button onClick={logout} className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">Sign Out</button>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-8">
                <div className="max-w-4xl w-full space-y-12">
                    <div className="text-center space-y-4">
                        <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">Setup Wizard</span>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Select Your Business Model</h1>
                        <p className="text-lg text-slate-500 max-w-2xl mx-auto">Choose a pre-configured workspace template that matches your industry. This defines your product data structure and initial products.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {businessTemplates.map((template) => (
                            <button
                                key={template.id}
                                onClick={() => selectBusinessTemplate(template.id)}
                                className="bg-white border border-slate-200 rounded-3xl p-8 text-left hover:border-indigo-600 hover:shadow-2xl hover:shadow-indigo-600/10 transition-all group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ArrowRight size={20} className="text-indigo-600 -rotate-45" />
                                </div>

                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                    <Store size={32} />
                                </div>

                                <h3 className="text-xl font-black text-slate-900 mb-2">{template.name}</h3>
                                <p className="text-sm font-medium text-slate-500 leading-relaxed">{template.description}</p>

                                <div className="mt-6 pt-6 border-t border-slate-50 flex items-center gap-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 group-hover:text-indigo-600 transition-colors">
                                        {template.schema.length} Field Configuration
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BusinessSelection;
