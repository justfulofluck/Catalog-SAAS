import React from 'react';
import { ArrowLeft, Search, X } from 'lucide-react';
import { CatalogSetupState } from './useCatalogSetup';
import { LAYOUT_OPTIONS } from './constants';

export const StepHeader: React.FC<CatalogSetupState> = ({
  step,
  setStep,
  setView,
  name,
  isDark,
  selectedCategoryIds,
  rootCategories,
  defaultLayoutId,
  categoryLayoutOverrides,
  phases,
  categorySearch,
  setCategorySearch,
  handleSelectAll,
  handleDeselectAll
}) => {
  return (
    <div className={`px-8 py-3.5 border-b flex flex-wrap items-center justify-between gap-4 shrink-0 z-20 ${
      isDark ? 'bg-[#141414] border-[#E2DCC8]/15' : 'bg-white border-slate-200 shadow-sm'
    }`}>
      {/* Left: Back button & Title */}
      <div className="flex items-center gap-3 min-w-[220px]">
        <button
          onClick={() => {
            if (step > 1) {
              setStep(step - 1);
            } else {
              setView('dashboard');
            }
          }}
          className={`transition-colors p-1.5 rounded-[4px] ${
            isDark ? 'text-[#E2DCC8]/70 hover:text-[#F1F1F1] hover:bg-[#0F3D3E]/30' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="Go Back"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className={`text-lg font-semibold tracking-tight leading-none font-heading ${
            isDark ? 'text-[#F1F1F1]' : 'text-slate-900'
          }`}>
            {step === 1 && 'New Project Setup'}
            {step === 2 && 'Select Categories'}
            {step === 3 && 'Choose Layout Styles'}
            {step === 4 && 'Page Framing & Covers'}
            {step === 5 && 'Configure Schema & Fields'}
          </h1>
          <p className={`text-[11px] font-medium mt-0.5 ${isDark ? 'text-[#E2DCC8]/60' : 'text-slate-500'}`}>
            {step === 1 && 'Define foundational title for your publication'}
            {step === 2 && `${selectedCategoryIds.length} of ${rootCategories.length} categories selected`}
            {step === 3 && `Master: ${LAYOUT_OPTIONS.find(l => l.id === defaultLayoutId)?.name} • ${Object.keys(categoryLayoutOverrides).length} category overrides`}
            {step === 4 && 'Select Cover, Header & Footer templates or choose Blank'}
            {step === 5 && 'Customize table columns and product card presentation'}
          </p>
        </div>
      </div>

      {/* Center: 5-Phase Stepper */}
      <div className="flex items-center gap-1.5 md:gap-2">
        {phases.map((p) => {
          const isCurrent = step === p.num;
          const isDone = step > p.num;
          return (
            <button
              key={p.num}
              type="button"
              onClick={() => {
                if (p.num === 1) setStep(1);
                else if (p.num === 2 && name.trim()) setStep(2);
                else if (p.num === 3 && name.trim() && selectedCategoryIds.length > 0) setStep(3);
                else if (p.num === 4 && name.trim() && selectedCategoryIds.length > 0) setStep(4);
                else if (p.num === 5 && name.trim() && selectedCategoryIds.length > 0) setStep(5);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-[4px] border text-xs font-heading font-semibold transition-all ${
                isCurrent
                  ? 'bg-[#0F3D3E] text-white border-[#E2DCC8]/40 shadow-sm'
                  : isDone
                    ? (isDark ? 'bg-[#181818] text-[#E2DCC8] border-[#E2DCC8]/20 hover:border-[#0F3D3E]' : 'bg-slate-100 text-[#0F3D3E] border-slate-200 hover:bg-slate-200')
                    : (isDark ? 'bg-[#100F0F] text-[#666666] border-[#222222] opacity-60' : 'bg-slate-50 text-slate-400 border-slate-200 opacity-60')
              }`}
            >
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                isCurrent ? 'bg-white text-[#0F3D3E]' : isDone ? 'bg-[#0F3D3E] text-white' : (isDark ? 'bg-[#222] text-[#888]' : 'bg-slate-200 text-slate-500')
              }`}>
                {isDone ? '✓' : p.num}
              </span>
              <span className="hidden md:inline text-[11px]">{p.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right: Quick Controls for Phase 2 */}
      {step === 2 && (
        <div className="flex items-center gap-3 shrink-0 ml-auto">
          <div className="relative w-56 md:w-64">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-[#E2DCC8]/50' : 'text-slate-400'}`} size={13} />
            <input
              type="text"
              placeholder="Search categories..."
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              className={`w-full border rounded-[4px] pl-8 pr-7 py-1.5 text-xs outline-none transition-all ${
                isDark 
                  ? 'bg-[#100F0F] border-[#E2DCC8]/20 text-[#F1F1F1] placeholder-[#E2DCC8]/40 focus:border-[#0F3D3E]' 
                  : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-[#0F3D3E]'
              }`}
            />
            {categorySearch && (
              <button
                type="button"
                onClick={() => setCategorySearch('')}
                className={`absolute right-2 top-1/2 -translate-y-1/2 ${isDark ? 'text-[#E2DCC8]/60 hover:text-white' : 'text-slate-400 hover:text-slate-700'}`}
              >
                <X size={12} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setView('create-category')}
              className="px-3 py-1.5 bg-[#0F3D3E] hover:bg-[#155455] border border-[#E2DCC8]/30 rounded-[4px] text-[11px] font-bold text-white uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm"
              title="Add a new category"
            >
              <span>+ Category</span>
            </button>
            <button
              type="button"
              onClick={handleSelectAll}
              className={`px-3 py-1.5 border rounded-[4px] text-[11px] font-bold uppercase tracking-wider transition-all ${
                isDark ? 'bg-[#171616] hover:bg-[#202020] border-[#E2DCC8]/20 text-[#E2DCC8]' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
              }`}
            >
              Select All
            </button>
            <button
              type="button"
              onClick={handleDeselectAll}
              className={`px-3 py-1.5 border rounded-[4px] text-[11px] font-bold uppercase tracking-wider transition-all ${
                isDark ? 'bg-[#171616] hover:bg-[#202020] border-[#E2DCC8]/20 text-slate-400 hover:text-white' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600'
              }`}
            >
              Deselect All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
