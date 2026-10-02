import React from 'react';
import { ArrowLeft, ChevronRight, Layers } from 'lucide-react';
import { CatalogSetupState } from './useCatalogSetup';
import { LAYOUT_OPTIONS } from './constants';

export const StepFooter: React.FC<CatalogSetupState> = ({
  step,
  setStep,
  isDark,
  selectedCategoryIds,
  totalSelectedProducts,
  defaultLayoutId,
  categoryLayoutOverrides,
  includeCover,
  headerMode,
  footerMode,
  hasTableCategories,
  hasCardCategories,
  selectedHeaders,
  handleGenerate
}) => {
  if (step <= 1) return null;

  return (
    <div className={`px-8 py-3.5 border-t flex flex-wrap items-center justify-between gap-4 shrink-0 z-20 ${
      isDark ? 'bg-[#141414] border-[#E2DCC8]/15' : 'bg-white border-slate-200 shadow-inner'
    }`}>
      <button
        type="button"
        onClick={() => setStep(step - 1)}
        className={`px-4 py-2 border rounded-[4px] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
          isDark ? 'bg-[#100F0F] hover:bg-[#1a1a1a] border-[#E2DCC8]/20 text-[#E2DCC8]' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
        }`}
      >
        <ArrowLeft size={14} />
        <span>
          {step === 2 && 'Back to Identity'}
          {step === 3 && 'Back to Categories'}
          {step === 4 && 'Back to Layouts'}
          {step === 5 && 'Back to Framing'}
        </span>
      </button>

      <div className="text-center hidden sm:block">
        <span className={`text-xs font-medium ${isDark ? 'text-[#E2DCC8]/70' : 'text-slate-600'}`}>
          {step === 2 && (
            selectedCategoryIds.length === 0 ? (
              <span className="text-amber-500 font-semibold">Select at least one category to proceed</span>
            ) : (
              <span>
                Ready with <strong className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedCategoryIds.length}</strong> categories ({' '}
                <strong className={`font-bold ${isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'}`}>{totalSelectedProducts}</strong> products)
              </span>
            )
          )}
          {step === 3 && (
            <span>
              Master Layout: <strong className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{LAYOUT_OPTIONS.find(l => l.id === defaultLayoutId)?.name}</strong> •{' '}
              <strong className={`font-bold ${isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'}`}>{Object.keys(categoryLayoutOverrides).length}</strong> category overrides
            </span>
          )}
          {step === 4 && (
            <span>
              Cover: <strong className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{includeCover ? 'Enabled' : 'Blank'}</strong> •{' '}
              Header: <strong className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{headerMode === 'none' ? 'Blank' : (headerMode === 'default' ? 'Title' : 'Template')}</strong> •{' '}
              Footer: <strong className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{footerMode === 'none' ? 'Blank' : (footerMode === 'default' ? 'Page Numbers' : 'Template')}</strong>
            </span>
          )}
          {step === 5 && (
            <span>
              Ready to build catalog with <strong className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedCategoryIds.length}</strong> categories •{' '}
              {hasTableCategories && <><strong className={`font-bold ${isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'}`}>{selectedHeaders.length}</strong> spec columns • </>}
              {hasCardCategories && <span>Card Layout enabled</span>}
            </span>
          )}
        </span>
      </div>

      {step === 2 && (
        <button
          type="button"
          onClick={() => setStep(3)}
          disabled={selectedCategoryIds.length === 0}
          className="px-5 py-2 bg-[#0F3D3E] hover:bg-[#155455] border border-[#E2DCC8]/30 text-white rounded-[4px] font-heading font-semibold text-xs uppercase tracking-wider shadow-md shadow-[#0F3D3E]/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 active:scale-95 whitespace-nowrap"
        >
          <span>Next: Choose Layouts</span>
          <ChevronRight size={14} />
        </button>
      )}

      {step === 3 && (
        <button
          type="button"
          onClick={() => setStep(4)}
          disabled={selectedCategoryIds.length === 0}
          className="px-5 py-2 bg-[#0F3D3E] hover:bg-[#155455] border border-[#E2DCC8]/30 text-white rounded-[4px] font-heading font-semibold text-xs uppercase tracking-wider shadow-md shadow-[#0F3D3E]/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 active:scale-95 whitespace-nowrap"
        >
          <span>Next: Framing & Covers</span>
          <ChevronRight size={14} />
        </button>
      )}

      {step === 4 && (
        <button
          type="button"
          onClick={() => setStep(5)}
          disabled={selectedCategoryIds.length === 0}
          className="px-5 py-2 bg-[#0F3D3E] hover:bg-[#155455] border border-[#E2DCC8]/30 text-white rounded-[4px] font-heading font-semibold text-xs uppercase tracking-wider shadow-md shadow-[#0F3D3E]/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 active:scale-95 whitespace-nowrap"
        >
          <span>Next: Configure Schema</span>
          <ChevronRight size={14} />
        </button>
      )}

      {step === 5 && (
        <button
          type="button"
          onClick={handleGenerate}
          disabled={selectedCategoryIds.length === 0 || (hasTableCategories && selectedHeaders.length === 0)}
          className="px-6 py-2 bg-[#0F3D3E] hover:bg-[#155455] border border-[#E2DCC8]/30 text-white rounded-[4px] font-heading font-semibold text-xs uppercase tracking-wider shadow-md shadow-[#0F3D3E]/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 active:scale-95 whitespace-nowrap"
        >
          <Layers size={15} className="text-[#E2DCC8]" />
          <span>BUILD & GENERATE CATALOG ({selectedCategoryIds.length} CATEGORIES)</span>
        </button>
      )}
    </div>
  );
};
