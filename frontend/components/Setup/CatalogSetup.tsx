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
  LayoutTemplate,
  List,
  SeparatorHorizontal,
  FilePlus,
  Check
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { GRID_TEMPLATES, FULL_CATALOG_TEMPLATES } from '../../constants';

const CatalogSetup: React.FC = () => {
  const { setView, categories, products, generateCatalogFromTemplate } = useStore();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('tpl-v-tac');

  // Configuration State
  const [includeCover, setIncludeCover] = useState(true);
  const [includeIndex, setIncludeIndex] = useState(true);
  const [includeCategoryCovers, setIncludeCategoryCovers] = useState(true);

  const toggleCategory = (id: string) => {
    setSelectedCategoryIds(prev =>
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    if (name && selectedCategoryIds.length > 0) {
      const defaultTemplate = GRID_TEMPLATES[1]; // 2x2
      
      generateCatalogFromTemplate(
        name,
        defaultTemplate,
        selectedCategoryIds,
        { 
          includeCover, 
          includeIndex, 
          includeCategoryCovers,
          selectedTemplateId
        }
      );

      // Save to backend immediately so refresh doesn't lose data
      const { saveCatalog } = useStore.getState();
      try {
        await saveCatalog();
      } catch (e) {
        console.warn("Could not save new catalog initially", e);
      }

      setView('editor');
    }
  };

  const phases = [
    { num: 1, label: 'Identity' },
    { num: 2, label: 'Products' },
    { num: 3, label: 'Template' },
    { num: 4, label: 'Assembly' }
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-[#100F0F] text-white flex items-center justify-center p-8 lg:p-12 animate-in fade-in duration-500">
      <div className="w-full max-w-5xl space-y-10">

        {/* 4-Phase Progress Navigation */}
        <div className="flex items-center gap-3 md:gap-6 mb-16 max-w-3xl mx-auto">
          {phases.map((p) => (
            <div key={p.num} className="flex-1 flex flex-col gap-2.5 group cursor-default">
              <div className={`h-2 rounded-full transition-all duration-500 ${step >= p.num ? 'bg-[#0F3D3E]' : 'bg-[#262626]'}`} />
              <div className="flex justify-between items-center px-1">
                <div>
                  <p className={`text-[9px] font-bold uppercase tracking-widest transition-colors ${step >= p.num ? 'text-[#E2DCC8]' : 'text-[#666666]'}`}>
                    Phase 0{p.num}
                  </p>
                  <p className={`font-space text-[11px] font-bold transition-colors ${step >= p.num ? 'text-white' : 'text-[#888888]'}`}>
                    {p.label}
                  </p>
                </div>
                {step > p.num && <CheckCircle2 size={13} className="text-[#E2DCC8] animate-in zoom-in" />}
              </div>
            </div>
          ))}
        </div>

        {/* Phase 1: Catalog Name & Identity */}
        {step === 1 && (
          <div className="grid grid-cols-1 gap-12 items-start animate-in slide-in-from-bottom-8 duration-500 max-w-xl mx-auto">
            <div className="space-y-8">
              <div className="space-y-6 text-center">
                <span className="px-4 py-1.5 bg-[#0F3D3E]/10 text-[#E2DCC8] text-[10px] font-bold uppercase tracking-widest rounded-full border border-[#0F3D3E]/20">
                  Initiate Build
                </span>
                <h1 className="font-space text-5xl font-bold text-white tracking-tight leading-none">
                  Structure & <br /><span className="text-[#E2DCC8]">Identity.</span>
                </h1>
                <p className="text-[#888888] font-medium text-lg leading-relaxed">
                  Define the foundational name of your new publication.
                </p>
              </div>

              <div className="bg-[#161616] rounded-[4px] border border-[#262626] p-8 space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-[#888888] uppercase tracking-widest ml-1">Document Title</label>
                  <div className="relative group">
                    <BookOpen className="absolute left-5 top-1/2 -translate-y-1/2 text-[#666666] group-focus-within:text-[#E2DCC8] transition-colors" size={20} />
                    <input
                      type="text"
                      placeholder="e.g. Q4 Lighting Collection 2026"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#1c1c1c] border border-[#262626] rounded-[4px] pl-12 pr-6 py-4 text-base font-bold text-white placeholder-[#666666] focus:border-[#0F3D3E] outline-none transition-all shadow-inner"
                    />
                  </div>
                </div>

                <button
                  disabled={!name}
                  onClick={() => setStep(2)}
                  className="w-full py-4 bg-[#0F3D3E] hover:bg-[#155455] border border-[#E2DCC8]/30 text-white rounded-[4px] font-bold text-xs uppercase tracking-widest shadow-xl shadow-[#0F3D3E]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 active:scale-95"
                >
                  Proceed to Products <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Phase 2: Category Selection */}
        {step === 2 && (
          <div className="space-y-8 animate-in slide-in-from-right-12 duration-500">
            <div className="flex justify-between items-end">
              <div>
                <button onClick={() => setStep(1)} className="flex items-center gap-2 text-[10px] font-bold text-[#888888] uppercase tracking-widest mb-4 hover:text-[#E2DCC8] transition-colors group text-left">
                  <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Return to Title
                </button>
                <h1 className="font-space text-4xl font-bold text-white tracking-tight">Assign Product Sources</h1>
                <p className="text-[#888888] font-medium text-base">Select one or more taxonomies to populate your catalog.</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right hidden md:block">
                  <p className="text-[10px] font-bold text-[#888888] uppercase tracking-widest">Selected Sources</p>
                  <p className="font-space text-xl font-bold text-[#E2DCC8]">{selectedCategoryIds.length}</p>
                </div>
                <button
                  onClick={() => setStep(3)}
                  disabled={selectedCategoryIds.length === 0}
                  className="px-8 py-4 bg-[#0F3D3E] hover:bg-[#155455] border border-[#E2DCC8]/30 text-white rounded-[4px] font-bold text-xs uppercase tracking-widest shadow-xl shadow-[#0F3D3E]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 active:scale-95"
                >
                  Proceed to Template <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-4 max-w-4xl mx-auto">
              {categories.filter(c => !c.parent).map((cat) => {
                const isSelected = selectedCategoryIds.includes(cat.id);
                const subcategories = categories.filter(c => c.parent === cat.id);

                return (
                  <div key={cat.id} className="space-y-2">
                    <button
                      onClick={() => toggleCategory(cat.id)}
                      className={`
                        w-full relative overflow-hidden rounded-[4px] p-6 flex items-center gap-6 transition-all group text-left border-2
                        ${isSelected
                          ? 'bg-[#161616] border-[#0F3D3E] shadow-xl shadow-[#0F3D3E]/10'
                          : 'bg-[#161616] border-[#262626] hover:border-[#3a3a3a] hover:shadow-lg'
                        }
                      `}
                    >
                      <div className={`absolute top-1/2 -translate-y-1/2 right-6 transition-colors ${isSelected ? 'text-[#E2DCC8]' : 'text-[#666666] group-hover:text-[#888888]'}`}>
                        {isSelected ? <CheckSquare size={24} /> : <Square size={24} />}
                      </div>

                      <div
                        className={`
                          w-14 h-14 rounded-[4px] flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300
                          ${isSelected ? 'scale-105' : 'group-hover:scale-105'}
                        `}
                        style={{ backgroundColor: cat.color + '22', color: cat.color }}
                      >
                        <FolderOpen size={28} />
                      </div>
                      <div className="flex-1 min-w-0 pr-12">
                        <h3 className="font-space font-bold text-white text-lg mb-1 truncate">{cat.name}</h3>
                        <p className="text-[10px] font-bold text-[#888888] uppercase tracking-widest">
                          {products.filter(p => p.categoryId === cat.id).length} ACTIVE PRODUCTS
                          {subcategories.length > 0 && ` • ${subcategories.length} SUBCATEGORIES`}
                        </p>
                      </div>
                    </button>

                    {/* Render Subcategories */}
                    {subcategories.length > 0 && (
                      <div className="pl-8 sm:pl-16 space-y-2 relative before:absolute before:inset-y-0 before:left-6 sm:before:left-10 before:w-px before:bg-[#262626]">
                        {subcategories.map(sub => {
                          const isSubSelected = selectedCategoryIds.includes(sub.id);
                          return (
                            <button
                              key={sub.id}
                              onClick={() => toggleCategory(sub.id)}
                              className={`
                                w-full relative overflow-hidden rounded-[4px] p-4 flex items-center gap-4 transition-all group text-left border-2
                                ${isSubSelected
                                  ? 'bg-[#1c1c1c] border-[#0F3D3E] shadow-md'
                                  : 'bg-[#161616] border-[#262626] hover:border-[#3a3a3a]'
                                }
                              `}
                            >
                              <div className="absolute left-0 top-1/2 -translate-x-[17px] sm:-translate-x-[25px] w-4 border-t border-[#262626]"></div>

                              <div className={`transition-colors ${isSubSelected ? 'text-[#E2DCC8]' : 'text-[#666666] group-hover:text-[#888888]'}`}>
                                {isSubSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                              </div>

                              <div className="flex-1 min-w-0 pr-4">
                                <h4 className="font-bold text-white text-sm truncate">{sub.name}</h4>
                                <p className="text-[9px] font-bold text-[#888888] uppercase tracking-widest">
                                  {products.filter(p => p.categoryId === sub.id).length} ACTIVE PRODUCTS
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {categories.length === 0 && (
                <div className="bg-[#161616] border border-[#262626] p-12 rounded-[4px] text-center space-y-6">
                  <Box className="mx-auto text-[#666666]" size={60} />
                  <div className="space-y-2">
                    <p className="font-space text-xl font-bold text-white tracking-tight">No taxonomies found!</p>
                    <p className="text-sm text-[#888888] font-medium">Establish at least one category before generating a publication.</p>
                  </div>
                  <button
                    onClick={() => setView('create-category')}
                    className="px-10 py-4 bg-[#0F3D3E] hover:bg-[#155455] border border-[#E2DCC8]/30 text-white rounded-[4px] text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-[#0F3D3E]/20 transition-all"
                  >
                    Initialize Category
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Phase 3: Template Selection */}
        {step === 3 && (
          <div className="space-y-8 animate-in slide-in-from-right-12 duration-500">
            <div className="flex justify-between items-end">
              <div>
                <button onClick={() => setStep(2)} className="flex items-center gap-2 text-[10px] font-bold text-[#888888] uppercase tracking-widest mb-4 hover:text-[#E2DCC8] transition-colors group text-left">
                  <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Return to Products
                </button>
                <h1 className="font-space text-4xl font-bold text-white tracking-tight">Select Catalog Template</h1>
                <p className="text-[#888888] font-medium text-base">
                  Choose a pre-built publication style or start with a 4-page blank custom template.
                </p>
              </div>
              <button
                onClick={() => setStep(4)}
                className="px-8 py-4 bg-[#0F3D3E] hover:bg-[#155455] border border-[#E2DCC8]/30 text-white rounded-[4px] font-bold text-xs uppercase tracking-widest shadow-xl shadow-[#0F3D3E]/20 transition-all flex items-center gap-3 active:scale-95"
              >
                Proceed to Assembly <ChevronRight size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {FULL_CATALOG_TEMPLATES.map((tpl) => {
                const isSelected = selectedTemplateId === tpl.id;
                const isBlank = tpl.id === 'tpl-blank';

                return (
                  <div
                    key={tpl.id}
                    onClick={() => setSelectedTemplateId(tpl.id)}
                    className={`
                      relative group cursor-pointer overflow-hidden rounded-[4px] border-2 transition-all p-5 flex flex-col justify-between
                      ${isSelected
                        ? 'bg-[#161616] border-[#0F3D3E] shadow-2xl shadow-[#0F3D3E]/10 scale-[1.02]'
                        : 'bg-[#161616] border-[#262626] hover:border-[#3a3a3a] hover:shadow-xl'
                      }
                    `}
                  >
                    {/* Selected Badge */}
                    {isSelected && (
                      <div className="absolute top-4 right-4 z-20 bg-[#0F3D3E] text-white rounded-full p-1.5 shadow-lg shadow-[#0F3D3E]/30">
                        <Check size={14} strokeWidth={3} />
                      </div>
                    )}

                    <div>
                      {/* Thumbnail Preview Area */}
                      <div className="relative aspect-[4/3] rounded-[4px] overflow-hidden mb-4 bg-[#121212] border border-[#262626] flex items-center justify-center">
                        {isBlank ? (
                          <div className="flex flex-col items-center justify-center text-center p-6 space-y-3">
                            <div className="w-14 h-14 rounded-[4px] bg-[#0F3D3E]/10 text-[#E2DCC8] flex items-center justify-center border border-[#0F3D3E]/20">
                              <FilePlus size={28} />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#E2DCC8] bg-[#0F3D3E]/10 px-3 py-1 rounded-full border border-[#0F3D3E]/20">
                              4 Blank Pages
                            </span>
                          </div>
                        ) : (
                          <>
                            <img
                              src={tpl.thumbnail}
                              alt={tpl.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            <div className="absolute bottom-3 left-3 right-3 text-white">
                              <span className="text-[9px] font-bold uppercase tracking-widest bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-[4px] border border-white/10">
                                {tpl.pages.length} Pages Included
                              </span>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Info & Description */}
                      <div className="space-y-1.5">
                        <h3 className="font-space text-base font-bold text-white flex items-center gap-2">
                          {tpl.name}
                        </h3>
                        <p className="text-xs font-medium text-[#888888] line-clamp-2 leading-relaxed">
                          {tpl.description}
                        </p>
                      </div>
                    </div>

                    {/* Page Structure Tag Breakdown */}
                    <div className="mt-4 pt-3 border-t border-[#262626] flex items-center gap-1.5 flex-wrap">
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-[4px] bg-[#1c1c1c] text-[#888888] border border-[#262626]">
                        Cover
                      </span>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-[4px] bg-[#1c1c1c] text-[#888888] border border-[#262626]">
                        Index / TOC
                      </span>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-[4px] bg-[#1c1c1c] text-[#888888] border border-[#262626]">
                        Product Grid
                      </span>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-[4px] bg-[#1c1c1c] text-[#888888] border border-[#262626]">
                        Closing
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Phase 4: Final Assembly & Compilation */}
        {step === 4 && (
          <div className="grid grid-cols-1 gap-12 items-start animate-in slide-in-from-right-12 duration-500 max-w-4xl mx-auto">
            <div className="space-y-12">

              <div className="space-y-6 text-center">
                <button onClick={() => setStep(3)} className="inline-flex items-center gap-2 text-[10px] font-bold text-[#888888] uppercase tracking-widest hover:text-[#E2DCC8] transition-colors group">
                  <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Return to Templates
                </button>
                <h1 className="font-space text-5xl font-bold text-white tracking-tight leading-none">
                  Final <span className="text-[#E2DCC8]">Assembly.</span>
                </h1>
                <p className="text-[#888888] font-medium text-lg leading-relaxed max-w-lg mx-auto">
                  Configure the architectural components of your publication before compilation.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Cover Page Toggle */}
                <button
                  onClick={() => setIncludeCover(!includeCover)}
                  className={`
                    relative overflow-hidden rounded-[4px] p-8 text-left border-2 transition-all group
                    ${includeCover
                      ? 'bg-[#161616] border-[#0F3D3E] shadow-xl shadow-[#0F3D3E]/10'
                      : 'bg-[#161616] border-[#262626] opacity-60 hover:opacity-100 hover:border-[#3a3a3a]'
                    }
                  `}
                >
                  <div className={`w-12 h-12 rounded-[4px] flex items-center justify-center mb-6 transition-colors ${includeCover ? 'bg-[#0F3D3E] text-white shadow-lg' : 'bg-[#1c1c1c] text-[#666666]'}`}>
                    <LayoutTemplate size={24} />
                  </div>
                  <h3 className="font-space text-lg font-bold text-white mb-2">Cover Page</h3>
                  <p className="text-xs font-medium text-[#888888] leading-relaxed">
                    A high-impact introductory page with your catalog title and hero imagery.
                  </p>
                  <div className={`absolute top-6 right-6 transition-all ${includeCover ? 'text-[#E2DCC8] scale-100' : 'text-[#666666] scale-90'}`}>
                    {includeCover ? <CheckCircle2 size={24} /> : <Square size={24} />}
                  </div>
                </button>

                {/* Index Toggle */}
                <button
                  onClick={() => setIncludeIndex(!includeIndex)}
                  className={`
                    relative overflow-hidden rounded-[4px] p-8 text-left border-2 transition-all group
                    ${includeIndex
                      ? 'bg-[#161616] border-[#0F3D3E] shadow-xl shadow-[#0F3D3E]/10'
                      : 'bg-[#161616] border-[#262626] opacity-60 hover:opacity-100 hover:border-[#3a3a3a]'
                    }
                  `}
                >
                  <div className={`w-12 h-12 rounded-[4px] flex items-center justify-center mb-6 transition-colors ${includeIndex ? 'bg-[#0F3D3E] text-white shadow-lg' : 'bg-[#1c1c1c] text-[#666666]'}`}>
                    <List size={24} />
                  </div>
                  <h3 className="font-space text-lg font-bold text-white mb-2">Index / TOC</h3>
                  <p className="text-xs font-medium text-[#888888] leading-relaxed">
                    Automated table of contents listing all sections and page numbers.
                  </p>
                  <div className={`absolute top-6 right-6 transition-all ${includeIndex ? 'text-[#E2DCC8] scale-100' : 'text-[#666666] scale-90'}`}>
                    {includeIndex ? <CheckCircle2 size={24} /> : <Square size={24} />}
                  </div>
                </button>

                {/* Category Separator Toggle */}
                <button
                  onClick={() => setIncludeCategoryCovers(!includeCategoryCovers)}
                  className={`
                    relative overflow-hidden rounded-[4px] p-8 text-left border-2 transition-all group
                    ${includeCategoryCovers
                      ? 'bg-[#161616] border-[#0F3D3E] shadow-xl shadow-[#0F3D3E]/10'
                      : 'bg-[#161616] border-[#262626] opacity-60 hover:opacity-100 hover:border-[#3a3a3a]'
                    }
                  `}
                >
                  <div className={`w-12 h-12 rounded-[4px] flex items-center justify-center mb-6 transition-colors ${includeCategoryCovers ? 'bg-[#0F3D3E] text-white shadow-lg' : 'bg-[#1c1c1c] text-[#666666]'}`}>
                    <SeparatorHorizontal size={24} />
                  </div>
                  <h3 className="font-space text-lg font-bold text-white mb-2">Section Covers</h3>
                  <p className="text-xs font-medium text-[#888888] leading-relaxed">
                    Distinct divider pages for each category block (e.g. "Lighting").
                  </p>
                  <div className={`absolute top-6 right-6 transition-all ${includeCategoryCovers ? 'text-[#E2DCC8] scale-100' : 'text-[#666666] scale-90'}`}>
                    {includeCategoryCovers ? <CheckCircle2 size={24} /> : <Square size={24} />}
                  </div>
                </button>

              </div>

              <div className="flex justify-center pt-8">
                <button
                  onClick={handleGenerate}
                  className="w-full md:w-auto px-16 py-5 bg-[#0F3D3E] hover:bg-[#155455] border border-[#E2DCC8]/30 text-white rounded-[4px] font-bold text-sm uppercase tracking-widest shadow-2xl shadow-[#0F3D3E]/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4"
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
