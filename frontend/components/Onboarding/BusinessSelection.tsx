import React from 'react';
import { useStore } from '../../store/useStore';
import { Store, ArrowRight } from 'lucide-react';

const BusinessSelection: React.FC = () => {
    const { businessTemplates, selectBusinessTemplate, logout, setView, fetchBusinessTemplates } = useStore();

    React.useEffect(() => {
        fetchBusinessTemplates();
    }, []);

    return (
        <div className="min-h-screen bg-[#100F0F] text-white flex flex-col font-sans">
            {/* Header */}
            <div className="px-8 py-6 flex items-center justify-between bg-[#161616] border-b border-[#262626]">
                <div className="flex items-center gap-3">
                    <span className="font-space font-bold text-xl tracking-tight text-white">catalogmakerr.</span>
                </div>
                <div className="flex items-center gap-6">
                    <button 
                        onClick={() => setView('pricing')} 
                        className="text-xs font-bold text-white uppercase tracking-widest px-4 py-2 bg-[#0F3D3E] hover:bg-[#155455] border border-[#E2DCC8]/30 rounded-[4px] shadow-lg shadow-[#0F3D3E]/20 transition-all active:scale-95"
                    >
                        Upgrade Plan
                    </button>
                    <button onClick={logout} className="text-sm font-medium text-[#888888] hover:text-white transition-colors">Sign Out</button>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-8">
                <div className="max-w-4xl w-full space-y-12">
                    <div className="text-center space-y-4">
                        <span className="px-4 py-1.5 bg-[#0F3D3E]/10 text-[#E2DCC8] rounded-full text-[10px] font-bold uppercase tracking-widest border border-[#0F3D3E]/20">
                            Setup Wizard
                        </span>
                        <h1 className="font-space text-4xl md:text-5xl font-bold text-white tracking-tight">Select Your Business Model</h1>
                        <p className="text-lg text-[#888888] max-w-2xl mx-auto">Choose a pre-configured workspace template that matches your industry. This defines your product data structure and initial products.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {businessTemplates.map((template) => (
                            <button
                                key={template.id}
                                onClick={() => selectBusinessTemplate(template.id)}
                                className="bg-[#161616] border border-[#262626] rounded-[4px] p-8 text-left hover:border-[#0F3D3E] hover:shadow-2xl hover:shadow-[#0F3D3E]/10 transition-all group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ArrowRight size={20} className="text-[#E2DCC8] -rotate-45" />
                                </div>

                                <div className="w-16 h-16 bg-[#1c1c1c] border border-[#262626] rounded-[4px] flex items-center justify-center mb-6 text-[#888888] group-hover:bg-[#0F3D3E] group-hover:text-white group-hover:border-[#0F3D3E] transition-all">
                                    <Store size={32} />
                                </div>

                                <h3 className="font-space text-xl font-bold text-white mb-2">{template.name}</h3>
                                <p className="text-sm font-medium text-[#888888] leading-relaxed">{template.description}</p>

                                <div className="mt-6 pt-6 border-t border-[#262626] flex items-center gap-2">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#666666] group-hover:text-[#E2DCC8] transition-colors">
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
