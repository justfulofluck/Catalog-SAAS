import React from 'react';
import { useStore } from '../../store/useStore';
import { Store, ArrowRight, Sun, Moon } from 'lucide-react';

const BusinessSelection: React.FC = () => {
    const { businessTemplates, selectBusinessTemplate, logout, setView, fetchBusinessTemplates, uiTheme, toggleUiTheme } = useStore();
    const isDark = uiTheme === 'dark';

    React.useEffect(() => {
        fetchBusinessTemplates();
    }, []);

    return (
        <div className={`min-h-screen flex flex-col font-sans transition-colors ${
            isDark ? 'bg-[#100F0F] text-white' : 'bg-slate-50 text-slate-900'
        }`}>
            {/* Header */}
            <div className={`px-8 py-6 flex items-center justify-between border-b transition-colors ${
                isDark ? 'bg-[#161616] border-[#262626]' : 'bg-white border-slate-200 shadow-sm'
            }`}>
                <div className="flex items-center gap-3">
                    <span className={`font-space font-bold text-xl tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>catalogmakerr.</span>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleUiTheme}
                        className={`p-2 rounded-[4px] border transition-colors ${
                            isDark ? 'bg-[#1c1c1c] border-[#262626] text-amber-400' : 'bg-slate-100 border-slate-200 text-indigo-600'
                        }`}
                        title="Toggle Theme"
                    >
                        {isDark ? <Sun size={16} /> : <Moon size={16} />}
                    </button>
                    <button 
                        onClick={() => setView('pricing')} 
                        className="text-xs font-bold text-white uppercase tracking-widest px-4 py-2 bg-[#0F3D3E] hover:bg-[#155455] border border-[#E2DCC8]/30 rounded-[4px] shadow-lg shadow-[#0F3D3E]/20 transition-all active:scale-95"
                    >
                        Upgrade Plan
                    </button>
                    <button onClick={logout} className={`text-sm font-medium transition-colors ${
                        isDark ? 'text-[#888888] hover:text-white' : 'text-slate-500 hover:text-slate-900'
                    }`}>Sign Out</button>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-8">
                <div className="max-w-4xl w-full space-y-12">
                    <div className="text-center space-y-4">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                            isDark ? 'bg-[#0F3D3E]/10 text-[#E2DCC8] border-[#0F3D3E]/20' : 'bg-teal-50 text-[#0F3D3E] border-teal-200'
                        }`}>
                            Setup Wizard
                        </span>
                        <h1 className={`font-space text-4xl md:text-5xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Select Your Business Model</h1>
                        <p className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-[#888888]' : 'text-slate-600'}`}>
                            Choose a pre-configured workspace template that matches your industry. This defines your product data structure and initial products.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {businessTemplates.map((template) => (
                            <button
                                key={template.id}
                                onClick={() => selectBusinessTemplate(template.id)}
                                className={`rounded-[4px] p-8 text-left transition-all group relative overflow-hidden border ${
                                    isDark 
                                        ? 'bg-[#161616] border-[#262626] hover:border-[#0F3D3E] hover:shadow-2xl hover:shadow-[#0F3D3E]/10' 
                                        : 'bg-white border-slate-200 shadow-sm hover:border-[#0F3D3E] hover:shadow-xl'
                                }`}
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ArrowRight size={20} className={isDark ? "text-[#E2DCC8] -rotate-45" : "text-[#0F3D3E] -rotate-45"} />
                                </div>

                                <div className={`w-16 h-16 rounded-[4px] flex items-center justify-center mb-6 transition-all border ${
                                    isDark 
                                        ? 'bg-[#1c1c1c] border-[#262626] text-[#888888] group-hover:bg-[#0F3D3E] group-hover:text-white group-hover:border-[#0F3D3E]' 
                                        : 'bg-slate-100 border-slate-200 text-slate-500 group-hover:bg-[#0F3D3E] group-hover:text-white group-hover:border-[#0F3D3E]'
                                }`}>
                                    <Store size={32} />
                                </div>

                                <h3 className={`font-space text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{template.name}</h3>
                                <p className={`text-sm font-medium leading-relaxed ${isDark ? 'text-[#888888]' : 'text-slate-500'}`}>{template.description}</p>

                                <div className={`mt-6 pt-6 border-t flex items-center gap-2 ${isDark ? 'border-[#262626]' : 'border-slate-100'}`}>
                                    <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${
                                        isDark ? 'text-[#666666] group-hover:text-[#E2DCC8]' : 'text-slate-400 group-hover:text-[#0F3D3E]'
                                    }`}>
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
