import React from 'react';
import {
  useCatalogSetup,
  StepHeader,
  StepFooter,
  Phase1Identity,
  Phase2Categories,
  Phase3Layouts,
  Phase4Framing,
  Phase5Schema
} from './CatalogSetup/index';

export const CatalogSetup: React.FC = () => {
  const state = useCatalogSetup();

  return (
    <div className={`flex-1 flex flex-col h-full w-full overflow-hidden animate-in fade-in duration-500 ${
      state.isDark ? 'bg-[#100F0F] text-[#F1F1F1]' : 'bg-slate-50 text-slate-800'
    }`}>
      {/* Top Header & Stepper Bar */}
      <StepHeader {...state} />

      {/* Main Full-Page Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar w-full flex flex-col min-h-0">
        {state.step === 1 && <Phase1Identity {...state} />}
        {state.step === 2 && <Phase2Categories {...state} />}
        {state.step === 3 && <Phase3Layouts {...state} />}
        {state.step === 4 && <Phase4Framing {...state} />}
        {state.step === 5 && <Phase5Schema {...state} />}
      </div>

      {/* Pinned Bottom Navigation Footer Bar */}
      <StepFooter {...state} />
    </div>
  );
};

export default CatalogSetup;
