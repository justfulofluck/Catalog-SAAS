import React from 'react';
import { BookOpen, ChevronRight } from 'lucide-react';
import { CatalogSetupState } from './useCatalogSetup';

export const Phase1Identity: React.FC<CatalogSetupState> = ({
  name,
  setName,
  setStep,
  isDark
}) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-xl mx-auto w-full">
      <div className="w-full space-y-6 text-center">
        <div className="space-y-2">
          <h2 className={`font-space text-3xl sm:text-4xl font-bold tracking-tight ${
            isDark ? 'text-[#F1F1F1]' : 'text-slate-900'
          }`}>
            Name Your Catalog
          </h2>
          <p className={`text-xs sm:text-sm font-medium ${isDark ? 'text-[#E2DCC8]/60' : 'text-slate-500'}`}>
            Define the foundational title for your publication.
          </p>
        </div>

        <div className={`rounded-[4px] border p-6 sm:p-8 space-y-5 text-left shadow-lg ${
          isDark ? 'bg-[#141414] border-[#E2DCC8]/15' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="space-y-2">
            <label className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-[#E2DCC8]/70' : 'text-slate-500'}`}>
              Catalog Title
            </label>
            <div className="relative">
              <BookOpen className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${
                isDark ? 'text-[#E2DCC8]/50' : 'text-slate-400'
              }`} size={16} />
              <input
                type="text"
                placeholder="e.g. Annual Product Collection 2026"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && name.trim()) {
                    setStep(2);
                  }
                }}
                autoFocus
                className={`w-full rounded-[4px] pl-10 pr-4 py-2.5 text-sm font-semibold focus:border-[#0F3D3E] outline-none transition-all border ${
                  isDark ? 'bg-[#100F0F] border-[#E2DCC8]/20 text-[#F1F1F1] placeholder-[#E2DCC8]/40' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>
          </div>

          <button
            disabled={!name.trim()}
            onClick={() => setStep(2)}
            className="w-full py-2.5 bg-[#0F3D3E] hover:bg-[#155455] border border-[#E2DCC8]/30 text-white rounded-[4px] font-heading font-semibold text-xs uppercase tracking-wider shadow-md shadow-[#0F3D3E]/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-98"
          >
            <span>Proceed to Categories</span>
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
