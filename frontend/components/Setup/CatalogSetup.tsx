
import React, { useState } from 'react';
import { 
  ArrowLeft,
  ChevronRight,
  FolderOpen,
  CheckCircle2,
  Box,
  BookOpen,
  Layers,
  CheckSquare,
  Square,
  Check,
  LayoutTemplate,
  FileText,
  List,
  SeparatorHorizontal
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { GRID_TEMPLATES } from '../../constants';

const CatalogSetup: React.FC = () => {
  const { setView, categories, products, generateCatalogFromTemplate } = useStore();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  
  // Configuration State
  const [includeCover, setIncludeCover] = useState(true);
  const [includeIndex, setIncludeIndex] = useState(true);
  const [includeCategoryCovers, setIncludeCategoryCovers] = useState(true);

  const toggleCategory = (id: string) => {
    setSelectedCategoryIds(prev => 
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  const handleGenerate = () => {
    if (name && selectedCategoryIds.length > 0) {
      // Use a default template to seed the initial structure
      const defaultTemplate = GRID_TEMPLATES[1]; // 2x2
      generateCatalogFromTemplate(
        name, 
        defaultTemplate, 
        selectedCategoryIds, 
        { includeCover, includeIndex, includeCategoryCovers }
      );
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#f8fafc] dark:bg-slate-950 flex items-center justify-center p-8 lg:p-12 animate-in fade-in duration-500 transition-colors duration-300">
      <div className="w-full max-w-5xl space-y-10">
        
        {/* Progress Navigation */}
        <div className="flex items-center gap-4 md:gap-8 mb-16 max-w-3xl mx-auto">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex-1 flex flex-col gap-3 group cursor-default">
              <div className={`h-2 rounded-full transition-all duration-700 ${step >= i ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-800'}`} />
              <div className="flex justify-between items-center px-1">
                 <p className={`text-[10px] font-black uppercase tracking-widest transition-colors ${step >= i ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-300 dark:text-slate-700'}`}>
                  Phase 0{i}
                </p>
                {step > i && <CheckCircle2 size={12} className="text-indigo-600 dark:text-indigo-400 animate-in zoom-in" />}
              </div>
            </div>
          ))}
        </div>

        {/* Step 1: Catalog Name */}
        {step === 1 && (
          <div className="grid grid-cols-1 gap-12 items-start animate-in slide-in-from-bottom-8 duration-500 max-w-xl mx-auto">
            <div className="space-y-8">
              <div className="space-y-6 text-center">
                <span className="px-4 py-1.5 bg-indigo-600/10 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-600/20 dark:border-indigo-400/20">Initiate Build</span>
                <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">Structure & <br /><span className="text-indigo-600 dark:text-indigo-400">Identity.</span></h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-lg leading-relaxed">Define the foundational name of your new publication.</p>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-8 space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Document Title</label>
                  <div className="relative group">
                    <BookOpen className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors" size={20} />
                    <input 
                      type="text" 
                      placeholder="e.g. Q4 Furniture Collection 2025"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-12 pr-6 py-4 text-base font-bold text-slate-800 dark:text-white focus:ring-4 focus:ring-indigo-600/5 dark:focus:ring-indigo-500/10 focus:border-indigo-600 dark:focus:border-indigo-400 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700 shadow-sm"
                    />
                  </div>
                </div>
                
                <button 
                  disabled={!name}
                  onClick={() => setStep(2)}
                  className="w-full py-4 bg-indigo-600 dark:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 dark:shadow-none hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95"
                >
                  Proceed to Assets <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Category Selection */}
        {step === 2 && (
          <div className="space-y-8 animate-in slide-in-from-right-12 duration-500">
            <div className="flex justify-between items-end">
              <div>
                <button onClick={() => setStep(1)} className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-4 hover:text-slate-600 dark:hover:text-slate-400 transition-colors group text-left">
                  <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Return to Title
                </button>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Assign Asset Sources</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-base">Select one or more taxonomies to populate your catalog.</p>
              </div>
              <div className="flex items-center gap-4">
                 <div className="text-right hidden md:block">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selected Sources</p>
                    <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">{selectedCategoryIds.length}</p>
                 </div>
                 <button 
                   onClick={() => setStep(3)}
                   disabled={selectedCategoryIds.length === 0}
                   className="px-8 py-4 bg-indigo-600 dark:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 dark:shadow-none hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 active:scale-95"
                 >
                   Proceed to Layout <ChevronRight size={16} />
                 </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat) => {
                const isSelected = selectedCategoryIds.includes(cat.id);
                return (
                  <button 
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    className={`
                      w-full relative overflow-hidden rounded-2xl p-8 flex items-center gap-6 transition-all group text-left border-2
                      ${isSelected 
                        ? 'bg-white dark:bg-slate-900 border-indigo-600 dark:border-indigo-500 shadow-xl dark:shadow-indigo-900/10' 
                        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-lg'
                      }
                    `}
                  >
                    {/* Checkbox Indicator */}
                    <div className={`absolute top-4 right-4 transition-colors ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-200 dark:text-slate-700 group-hover:text-indigo-300'}`}>
                       {isSelected ? <CheckSquare size={24} /> : <Square size={24} />}
                    </div>

                    <div 
                      className={`
                        w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-transform duration-300
                        ${isSelected ? 'scale-110' : 'group-hover:scale-105'}
                      `}
                      style={{ backgroundColor: cat.color + '20', color: cat.color }}
                    >
                      <FolderOpen size={32} />
                    </div>
                    <div className="flex-1 min-w-0 pr-8">
                      <h3 className="font-black text-slate-900 dark:text-white text-lg mb-1 truncate">{cat.name}</h3>
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">
                        {products.filter(p => p.categoryId === cat.id).length} ACTIVE ASSETS
                      </p>
                    </div>
                  </button>
                );
              })}
              
              {categories.length === 0 && (
                <div className="col-span-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 p-12 rounded-2xl text-center space-y-6">
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

        {/* Step 3: Layout Configuration */}
        {step === 3 && (
          <div className="grid grid-cols-1 gap-12 items-start animate-in slide-in-from-right-12 duration-500 max-w-4xl mx-auto">
            <div className="space-y-12">
              
              <div className="space-y-6 text-center">
                <button onClick={() => setStep(2)} className="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest hover:text-slate-600 dark:hover:text-slate-400 transition-colors group">
                  <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Return to Assets
                </button>
                <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">Final <span className="text-indigo-600 dark:text-indigo-400">Assembly.</span></h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-lg leading-relaxed max-w-lg mx-auto">Configure the architectural components of your publication before compilation.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Cover Page Toggle */}
                <button 
                  onClick={() => setIncludeCover(!includeCover)}
                  className={`
                    relative overflow-hidden rounded-3xl p-8 text-left border-2 transition-all group
                    ${includeCover 
                      ? 'bg-white dark:bg-slate-900 border-indigo-600 dark:border-indigo-500 shadow-xl dark:shadow-indigo-900/10' 
                      : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 opacity-60 hover:opacity-100'
                    }
                  `}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-colors ${includeCover ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                    <LayoutTemplate size={24} />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">Cover Page</h3>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                    A high-impact introductory page with your catalog title and hero imagery.
                  </p>
                  <div className={`absolute top-6 right-6 transition-all ${includeCover ? 'text-indigo-600 dark:text-indigo-400 scale-100' : 'text-slate-200 dark:text-slate-700 scale-90'}`}>
                    {includeCover ? <CheckCircle2 size={24} /> : <Square size={24} />}
                  </div>
                </button>

                {/* Index Toggle */}
                <button 
                  onClick={() => setIncludeIndex(!includeIndex)}
                  className={`
                    relative overflow-hidden rounded-3xl p-8 text-left border-2 transition-all group
                    ${includeIndex 
                      ? 'bg-white dark:bg-slate-900 border-indigo-600 dark:border-indigo-500 shadow-xl dark:shadow-indigo-900/10' 
                      : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 opacity-60 hover:opacity-100'
                    }
                  `}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-colors ${includeIndex ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                    <List size={24} />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">Index / TOC</h3>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                    Automated table of contents listing all sections and page numbers.
                  </p>
                  <div className={`absolute top-6 right-6 transition-all ${includeIndex ? 'text-indigo-600 dark:text-indigo-400 scale-100' : 'text-slate-200 dark:text-slate-700 scale-90'}`}>
                    {includeIndex ? <CheckCircle2 size={24} /> : <Square size={24} />}
                  </div>
                </button>

                {/* Category Separator Toggle */}
                <button 
                  onClick={() => setIncludeCategoryCovers(!includeCategoryCovers)}
                  className={`
                    relative overflow-hidden rounded-3xl p-8 text-left border-2 transition-all group
                    ${includeCategoryCovers 
                      ? 'bg-white dark:bg-slate-900 border-indigo-600 dark:border-indigo-500 shadow-xl dark:shadow-indigo-900/10' 
                      : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 opacity-60 hover:opacity-100'
                    }
                  `}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-colors ${includeCategoryCovers ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                    <SeparatorHorizontal size={24} />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">Section Covers</h3>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                    Distinct divider pages for each category block (e.g. "Furniture").
                  </p>
                  <div className={`absolute top-6 right-6 transition-all ${includeCategoryCovers ? 'text-indigo-600 dark:text-indigo-400 scale-100' : 'text-slate-200 dark:text-slate-700 scale-90'}`}>
                    {includeCategoryCovers ? <CheckCircle2 size={24} /> : <Square size={24} />}
                  </div>
                </button>

              </div>

              <div className="flex justify-center pt-8">
                <button 
                  onClick={handleGenerate}
                  className="w-full md:w-auto px-16 py-5 bg-indigo-600 dark:bg-indigo-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-indigo-600/30 dark:shadow-none hover:bg-indigo-700 transition-all flex items-center justify-center gap-4 hover:scale-105 active:scale-95"
                >
                  <Layers size={18} /> Generate Catalog
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CatalogSetup;
