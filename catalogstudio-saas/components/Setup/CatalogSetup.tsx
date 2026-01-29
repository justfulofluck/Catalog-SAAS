
import React, { useState } from 'react';
import {
  FileText,
  ArrowLeft,
  ChevronRight,
  Layout,
  FolderOpen,
  CheckCircle2,
  Box,
  ChevronLeft,
  Zap,
  BookOpen,
  LayoutGrid,
  Grid
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { GRID_TEMPLATES, CATEGORY_THUMBNAILS } from '../../constants';
import { GridTemplate } from '../../types';

const CatalogSetup: React.FC = () => {
  const { setView, categories, products, generateCatalogFromTemplate, isSetupExiting, setSetupExiting } = useStore();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [selectedGridGroup, setSelectedGridGroup] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<GridTemplate | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  // Transition States
  const [isExiting, setIsExiting] = useState(false);
  const [isStepVisible, setIsStepVisible] = useState(true);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  const handlePhaseChange = (nextStep: number) => {
    if (nextStep === step) return;
    const newDirection = nextStep > step ? 'forward' : 'backward';
    setDirection(newDirection);
    setIsExiting(true);

    // Wait for exit animation to finish before switching content
    setTimeout(() => {
      setStep(nextStep);
      setIsExiting(false);
      setIsStepVisible(false); // Reset to invisible

      // Short delay to allow mount then trigger fade in
      setTimeout(() => setIsStepVisible(true), 50);
    }, 300);
  };

  // Internal Transition Logic (Step 2)
  const [isInternalExiting, setIsInternalExiting] = useState(false);
  const [internalDirection, setInternalDirection] = useState<'forward' | 'backward'>('forward');
  const [isInternalVisible, setIsInternalVisible] = useState(true);

  const handleGridGroupSelect = (group: string | null) => {
    if (group === selectedGridGroup) return;
    const newDir = group ? 'forward' : 'backward'; // Forward = entering templates, Backward = returning to groups
    setInternalDirection(newDir);
    setIsInternalExiting(true);

    setTimeout(() => {
      setSelectedGridGroup(group);
      setIsInternalExiting(false);
      setIsInternalVisible(false);
      setTimeout(() => setIsInternalVisible(true), 50);
    }, 300);
  };

  const handleComplete = (categoryId: string) => {
    if (name && selectedTemplate) {
      setSetupExiting(true);
      setTimeout(() => {
        generateCatalogFromTemplate(name, selectedTemplate, categoryId);
        setSetupExiting(false);
      }, 600);
    }
  };

  const gridGroups = ['2x2', '3x3', '4x4'];

  const renderInventoryPreview = (tmpl: GridTemplate) => {
    const isStacked = tmpl.arrangement === 'stacked';
    const isRow = tmpl.arrangement === 'row';
    const isRowReverse = tmpl.arrangement === 'row-reverse';

    return (
      <div className="w-full h-full bg-white dark:bg-slate-800 rounded-lg flex flex-col items-center justify-center p-4 gap-2 transition-all">
        <div
          className="grid gap-1.5 w-full h-full"
          style={{
            gridTemplateColumns: `repeat(${tmpl.cols}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${tmpl.rows}, minmax(0, 1fr))`
          }}
        >
          {Array.from({ length: Math.min(tmpl.cols * tmpl.rows, 9) }).map((_, i) => (
            <div key={i} className={`flex gap-1 border border-slate-100 dark:border-slate-700 rounded-sm ${isStacked ? 'flex-col' : 'flex-row'} ${isRowReverse ? 'flex-row-reverse' : ''}`}>
              <div className={`${isStacked ? 'w-full h-3/5' : 'w-2/5 h-full'} bg-indigo-100 dark:bg-indigo-900/50 rounded-sm shrink-0`} />
              <div className={`flex flex-col gap-0.5 justify-center ${isStacked ? 'p-0.5' : 'px-0.5'} overflow-hidden`}>
                <div className="h-0.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full" />
                <div className="h-0.5 w-2/3 bg-slate-100 dark:bg-slate-700 rounded-full" />
              </div>
            </div>
          ))}
        </div>
        <span className="text-[7px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter mt-1">
          {tmpl.arrangement.replace('-', ' ')}
        </span>
      </div>
    );
  };

  const [isVisible, setIsVisible] = useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`flex-1 overflow-y-auto bg-[#f8fafc] dark:bg-slate-950 flex items-center justify-center p-8 lg:p-12 transition-all duration-700 ${isVisible && !isNavigating && !isSetupExiting ? 'opacity-100 blur-0 scale-100' : 'opacity-0 scale-95 blur-sm'}`}>
      <div className="w-full max-w-5xl space-y-10">

        {/* Back Button */}
        <button
          onClick={() => {
            setIsNavigating(true);
            setTimeout(() => setView('dashboard'), 600);
          }}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors w-fit group mb-4"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-bold uppercase tracking-widest">Dashboard</span>
        </button>

        {/* Progress Navigation */}
        <div className="flex items-center gap-8 mb-16">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex-1 flex flex-col gap-3">
              <div className={`h-2 rounded-full transition-all duration-700 ${step >= i ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-800'}`} />
              <div className="flex justify-between items-center">
                <p className={`text-[10px] font-black uppercase tracking-widest ${step >= i ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-300 dark:text-slate-700'}`}>
                  Phase 0{i}
                </p>
                {step > i && <CheckCircle2 size={12} className="text-indigo-600 dark:text-indigo-400" />}
              </div>
            </div>
          ))}
        </div>

        {/* Step 1: Catalog Name */}
        {step === 1 && (
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center transition-all duration-500 ease-out ${isExiting ? `opacity-0 ${direction === 'forward' ? '-translate-x-10' : 'translate-x-10'}` : (isStepVisible ? 'opacity-100 translate-x-0' : `opacity-0 ${direction === 'forward' ? 'translate-x-10' : '-translate-x-10'}`)}`}>
            <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-700">
              <span className="px-4 py-1.5 bg-indigo-600/10 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-600/20 dark:border-indigo-400/20">Initiate Build</span>
              <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">Identify Your <br /><span className="text-indigo-600 dark:text-indigo-400">Publication.</span></h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-lg leading-relaxed max-w-md">Every professional catalog starts with a clear, strategic name to ensure organization across your global workspace.</p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-slate-800 p-10 space-y-8 animate-in slide-in-from-right-8 duration-700">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Document Title</label>
                <div className="relative group">
                  <BookOpen className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors" size={24} />
                  <input
                    type="text"
                    placeholder="e.g. Q4 Furniture Collection 2025"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-14 pr-6 py-5 text-lg font-bold text-slate-800 dark:text-white focus:ring-4 focus:ring-indigo-600/5 dark:focus:ring-indigo-500/10 focus:border-indigo-600 dark:focus:border-indigo-400 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700 shadow-sm"
                  />
                </div>
              </div>
              <button
                disabled={!name}
                onClick={() => handlePhaseChange(2)}
                className="w-full py-5 bg-indigo-600 dark:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-indigo-600/20 dark:shadow-none hover:bg-indigo-700 hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95 group/btn"
              >
                Proceed to Layout <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Grid Selection Flow */}
        {step === 2 && (
          <div className={`space-y-10 transition-all duration-500 ease-out ${isExiting ? `opacity-0 ${direction === 'forward' ? '-translate-x-10' : 'translate-x-10'}` : (isStepVisible ? 'opacity-100 translate-x-0' : `opacity-0 ${direction === 'forward' ? 'translate-x-10' : '-translate-x-10'}`)}`}>
            <div className="flex justify-between items-end">
              <div>
                <button
                  onClick={() => selectedGridGroup ? handleGridGroupSelect(null) : handlePhaseChange(1)}
                  className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-4 hover:text-slate-600 dark:hover:text-slate-400 transition-colors group text-left"
                >
                  <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                  {selectedGridGroup ? `Return to Grid Selection` : `Return to Title`}
                </button>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                  {selectedGridGroup ? `Choose ${selectedGridGroup} Variation` : `Select Blueprint Grid`}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-base">
                  {selectedGridGroup ? `Pick a specific inventory arrangement.` : `Define the spatial density of your digital assets.`}
                </p>
              </div>
            </div>

            {!selectedGridGroup ? (
              <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 transition-all duration-500 ease-out ${isInternalExiting ? 'opacity-0 -translate-x-10' : (isInternalVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10')}`}>
                {gridGroups.map((group) => (
                  <button
                    key={group}
                    onClick={() => handleGridGroupSelect(group)}
                    className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 hover:border-indigo-600 dark:hover:border-indigo-500 rounded-[32px] p-10 text-center transition-all hover:shadow-2xl dark:hover:shadow-none group flex flex-col items-center gap-8"
                  >
                    <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-[28px] flex items-center justify-center border border-slate-100 dark:border-slate-800 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                      {group === '2x2' && <LayoutGrid size={40} />}
                      {group === '3x3' && <Grid size={40} />}
                      {group === '4x4' && <Layout size={40} />}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-800 dark:text-white text-2xl mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{group} Basic Grid</h3>
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em]">Select Base Proportions</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-all duration-500 ease-out ${isInternalExiting ? 'opacity-0 translate-x-10' : (isInternalVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10')}`}>
                {GRID_TEMPLATES.filter(t => t.group === selectedGridGroup).map((tmpl) => (
                  <button
                    key={tmpl.id}
                    onClick={() => {
                      setSelectedTemplate(tmpl);
                      handlePhaseChange(3);
                    }}
                    className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 hover:border-indigo-600 dark:hover:border-indigo-500 rounded-[28px] overflow-hidden text-left transition-all hover:shadow-2xl dark:hover:shadow-none group flex flex-col"
                  >
                    <div className="aspect-[4/3] bg-slate-50 dark:bg-slate-800 flex items-center justify-center p-6 border-b border-slate-50 dark:border-slate-800">
                      {renderInventoryPreview(tmpl)}
                    </div>
                    <div className="p-6">
                      <h3 className="font-black text-slate-800 text-base mb-1 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{tmpl.name}</h3>
                      <p className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">
                        {tmpl.cols} COLUMNS X {tmpl.rows} ROWS
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Category Selection */}
        {step === 3 && (
          <div className={`space-y-10 transition-all duration-500 ease-out ${isExiting ? `opacity-0 ${direction === 'forward' ? '-translate-x-10' : 'translate-x-10'}` : (isStepVisible ? 'opacity-100 translate-x-0' : `opacity-0 ${direction === 'forward' ? 'translate-x-10' : '-translate-x-10'}`)}`}>
            <div className="flex justify-between items-end">
              <div>
                <button onClick={() => handlePhaseChange(2)} className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-4 hover:text-slate-600 dark:hover:text-slate-400 transition-colors group text-left">
                  <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Return to Grid
                </button>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Assign Asset Source</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-base">Populate your layout with items from a specific taxonomy.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleComplete(cat.id)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-indigo-600 dark:hover:border-indigo-500 rounded-2xl p-8 flex items-center gap-8 transition-all hover:shadow-2xl dark:hover:shadow-none group text-left relative overflow-hidden"
                >
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform overflow-hidden"
                    style={{ backgroundColor: cat.color + '20', color: cat.color }}
                  >
                    {cat.thumbnail || CATEGORY_THUMBNAILS[cat.name] ? (
                      <img src={cat.thumbnail || CATEGORY_THUMBNAILS[cat.name]} alt={cat.name} className="w-full h-full object-cover" />
                    ) : (
                      <FolderOpen size={32} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-slate-900 dark:text-white text-xl mb-1 truncate">{cat.name}</h3>
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">
                      {products.filter(p => p.categoryId === cat.id).length} ACTIVE ASSETS
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-700 group-hover:bg-indigo-600 dark:group-hover:bg-indigo-500 group-hover:text-white transition-all">
                    <ChevronRight size={24} />
                  </div>
                </button>
              ))}

              {categories.length === 0 && (
                <div className="col-span-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 p-12 rounded-2xl text-center space-y-6">
                  <Box className="mx-auto text-amber-200 dark:text-amber-800" size={60} />
                  <div className="space-y-2">
                    <p className="text-xl font-black text-amber-700 dark:text-amber-400 tracking-tight">No taxonomies found!</p>
                    <p className="text-sm text-amber-600 dark:text-amber-500 font-medium">Establish at least one category before generating a publication.</p>
                  </div>
                  <button
                    onClick={() => setView('create-category')}
                    className="px-10 py-4 bg-amber-600 dark:bg-amber-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-amber-600/20 hover:bg-amber-700 transition-all"
                  >
                    Initialize Category
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="pt-12 flex flex-col items-center">
          <div className="flex items-center gap-4 text-slate-300 dark:text-slate-700 text-[10px] font-black tracking-[0.3em] uppercase mb-4">
            <Zap size={14} className="text-indigo-400" /> Professional Engine v3.1
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest">Standardized A4 Output • CMYK Optimized • 1:1 Scale</p>
        </div>
      </div>
    </div>
  );
};

export default CatalogSetup;
