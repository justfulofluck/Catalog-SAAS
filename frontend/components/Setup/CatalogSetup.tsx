import React, { useState, useEffect, useMemo } from 'react';
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
  Search,
  Sliders,
  RotateCcw,
  Eye,
  Trash2,
  MoveLeft,
  MoveRight,
  Check,
  X,
  Package,
  Table
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { GRID_TEMPLATES } from '../../constants';
import { resolveProductImage } from '../../utils/imageUtils';
import { resolveFieldLabel } from '../../utils/fieldUtils';

const CatalogSetup: React.FC = () => {
  const { setView, categories, products, generateCatalogFromTemplate, uiTheme } = useStore();
  const isDark = uiTheme === 'dark';
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const selectedTemplateId = 'tpl-v-tac';

  // Selected products count across all selected categories
  const totalSelectedProducts = useMemo(() => {
    return products.filter(p => selectedCategoryIds.includes(String(p.categoryId))).length;
  }, [products, selectedCategoryIds]);

  // Table Schema State for Phase 3
  const [selectedHeaders, setSelectedHeaders] = useState<string[]>([
    'MODEL NO',
    'PRODUCTS',
    'PRICE',
    'CUT-OUT',
    'COLOR'
  ]);

  // Initialize with all root categories selected by default
  useEffect(() => {
    if (categories && categories.length > 0 && selectedCategoryIds.length === 0) {
      setSelectedCategoryIds(categories.map(c => c.id));
    }
  }, [categories]);

  // Extract all available candidate fields across selected categories
  const candidateFields = useMemo(() => {
    const fieldSet = new Set<string>();

    const standardFields = [
      'MODEL NO',
      'PRODUCTS',
      'PRICE',
      'CUT-OUT',
      'COLOR',
      'PACKING',
      'DEALER PRICE',
      'PACKING PER BOX'
    ];
    standardFields.forEach(f => fieldSet.add(f));

    selectedCategoryIds.forEach(catId => {
      const cat = categories.find(c => String(c.id) === String(catId));
      if (cat?.customSchema && Array.isArray(cat.customSchema)) {
        cat.customSchema.forEach((f: any) => {
          if (f.label && f.label.trim()) {
            fieldSet.add(f.label.trim().toUpperCase());
          } else if (f.name && f.name.trim()) {
            fieldSet.add(f.name.trim().toUpperCase());
          }
        });
      }

      const catProds = products.filter(p => String(p.categoryId) === String(catId));
      catProds.forEach(p => {
        if (p.customFields && typeof p.customFields === 'object') {
          Object.entries(p.customFields).forEach(([k, v]) => {
            if (k && v !== undefined && v !== null && String(v).trim() !== '') {
              const human = resolveFieldLabel(k, categories as any, p);
              if (human) fieldSet.add(human.trim().toUpperCase());
            }
          });
        }
        if (p.variants && Array.isArray(p.variants)) {
          p.variants.forEach(v => {
            if (v.cutOut) fieldSet.add('CUT-OUT');
            if (v.color) fieldSet.add('COLOR');
            if (v.packing) fieldSet.add('PACKING');
            if (v.customAttributes) {
              Object.entries(v.customAttributes).forEach(([k, val]) => {
                if (k && val !== undefined && val !== null && String(val).trim() !== '') {
                  const human = resolveFieldLabel(k, categories as any, p);
                  if (human) fieldSet.add(human.trim().toUpperCase());
                }
              });
            }
          });
        }
      });
    });

    return Array.from(fieldSet).filter(k => !['SKU', 'NAME', 'ID', 'PRODUCT NAME'].includes(k));
  }, [selectedCategoryIds, categories, products]);

  const toggleCategory = (id: string) => {
    const subcategoryIds = categories.filter(c => c.parent === id).map(c => c.id);
    setSelectedCategoryIds(prev => {
      const isSelected = prev.includes(id);
      if (isSelected) {
        return prev.filter(cid => cid !== id && !subcategoryIds.includes(cid));
      } else {
        return Array.from(new Set([...prev, id, ...subcategoryIds]));
      }
    });
  };

  const handleSelectAll = () => {
    setSelectedCategoryIds(categories.map(c => c.id));
  };

  const handleDeselectAll = () => {
    setSelectedCategoryIds([]);
  };

  // Column Schema Controls
  const toggleHeader = (header: string) => {
    setSelectedHeaders(prev => {
      if (prev.includes(header)) {
        if (prev.length <= 1) return prev;
        return prev.filter(h => h !== header);
      } else {
        return [...prev, header];
      }
    });
  };

  const moveHeader = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= selectedHeaders.length) return;
    const copy = [...selectedHeaders];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);
    setSelectedHeaders(copy);
  };

  const removeHeader = (index: number) => {
    if (selectedHeaders.length <= 1) return;
    setSelectedHeaders(prev => prev.filter((_, i) => i !== index));
  };

  const resetHeadersToDefault = () => {
    setSelectedHeaders(['MODEL NO', 'PRODUCTS', 'PRICE', 'CUT-OUT', 'COLOR']);
  };

  const handleGenerate = async () => {
    if (name && selectedCategoryIds.length > 0) {
      const defaultTemplate = GRID_TEMPLATES[1]; // 2x2 grid
      
      generateCatalogFromTemplate(
        name,
        defaultTemplate,
        selectedCategoryIds,
        { 
          includeCover: true, 
          includeIndex: false, 
          includeCategoryCovers: false,
          selectedTemplateId,
          tableHeaders: selectedHeaders
        }
      );

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
    { num: 2, label: 'Categories' },
    { num: 3, label: 'Table Schema' }
  ];

  const rootCategories = categories.filter(c => !c.parent);
  const filteredCategories = rootCategories.filter(c =>
    !categorySearch ||
    c.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const previewCategory = categories.find(c => selectedCategoryIds.includes(c.id)) || categories[0];
  const previewProducts = products.filter(p => String(p.categoryId) === String(previewCategory?.id)).slice(0, 3);

  return (
    <div className={`flex-1 flex flex-col h-full w-full overflow-hidden animate-in fade-in duration-500 ${
      isDark ? 'bg-[#100F0F] text-[#F1F1F1]' : 'bg-slate-50 text-slate-800'
    }`}>
      {/* Top Header & Stepper Bar */}
      <div className={`px-8 py-3.5 border-b flex flex-wrap items-center justify-between gap-4 shrink-0 z-20 ${
        isDark ? 'bg-[#141414] border-[#E2DCC8]/15' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        {/* Left: Back button & Title */}
        <div className="flex items-center gap-3 min-w-[200px]">
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
              {step === 1 ? 'New Project Setup' : step === 2 ? 'Select Categories' : 'Configure Table Schema'}
            </h1>
            <p className={`text-[11px] font-medium mt-0.5 ${isDark ? 'text-[#E2DCC8]/60' : 'text-slate-500'}`}>
              {step === 1 ? 'Define catalog document title' : step === 2 ? `${selectedCategoryIds.length} of ${rootCategories.length} categories selected` : 'Select and sequence spec columns'}
            </p>
          </div>
        </div>

        {/* Center: Minimal 3-Phase Stepper */}
        <div className="flex items-center gap-2 md:gap-3">
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
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-[4px] border text-xs font-heading font-semibold transition-all ${
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
                <span className="hidden sm:inline text-[11px]">{p.label}</span>
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

      {/* Main Full-Page Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar w-full flex flex-col min-h-0">
        
        {/* Phase 1: Identity */}
        {step === 1 && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-xl mx-auto w-full">
            <div className="w-full space-y-6 text-center">
              <div className="space-y-2">
                <span className={`px-3.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border inline-block ${
                  isDark ? 'bg-[#0F3D3E]/20 text-[#E2DCC8] border-[#0F3D3E]/40' : 'bg-[#0F3D3E]/10 text-[#0F3D3E] border-[#0F3D3E]/30'
                }`}>
                  Phase 01 • Identity
                </span>
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
                      placeholder="e.g. V-TAC Architectural Lighting 2026"
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
        )}

        {/* Phase 2: Category Grid (Edge-to-Edge Minimal Clean Grid) */}
        {step === 2 && (
          <div className="p-8 w-full flex-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredCategories.map((cat) => {
                const isSelected = selectedCategoryIds.includes(cat.id);
                const catProducts = products.filter(p => String(p.categoryId) === String(cat.id));
                const catProductCount = catProducts.length;
                const catImg = resolveProductImage(catProducts[0], cat, catProducts);

                return (
                  <div
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    className={`group rounded-[4px] border transition-all cursor-pointer overflow-hidden flex flex-col relative select-none ${
                      isSelected
                        ? 'border-[#0F3D3E] bg-[#0F3D3E]/15 ring-2 ring-[#0F3D3E]/40 shadow-md'
                        : (isDark 
                            ? 'bg-[#141414] border-[#E2DCC8]/15 hover:border-[#E2DCC8]/30 hover:bg-[#171616]' 
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm')
                    }`}
                  >
                    {/* Checkbox at Top Right */}
                    <div className="absolute top-2.5 right-2.5 z-10">
                      <div className={`w-5 h-5 rounded-[3px] flex items-center justify-center transition-all ${
                        isSelected 
                          ? 'bg-[#0F3D3E] text-white shadow-sm' 
                          : 'bg-black/40 text-transparent border border-white/20 group-hover:bg-[#1c1c1c] group-hover:text-[#E2DCC8]'
                      }`}>
                        <Check size={12} strokeWidth={3} />
                      </div>
                    </div>

                    {/* Image Area */}
                    <div className={`aspect-[4/3] w-full relative overflow-hidden flex items-center justify-center p-3 border-b ${
                      isDark ? 'bg-[#100F0F] border-[#E2DCC8]/10' : 'bg-slate-50 border-slate-100'
                    }`}>
                      {catImg ? (
                        <img
                          src={catImg}
                          alt={cat.name}
                          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <FolderOpen size={28} className={isDark ? "text-[#E2DCC8]/30" : "text-slate-300"} />
                      )}
                    </div>

                    {/* Info Area */}
                    <div className="p-3 flex flex-col flex-1 justify-between">
                      <h3 className={`font-heading text-xs font-semibold truncate transition-colors mb-1.5 ${
                        isDark ? (isSelected ? 'text-[#E2DCC8]' : 'text-[#F1F1F1] group-hover:text-[#E2DCC8]') : (isSelected ? 'text-[#0F3D3E]' : 'text-slate-900 group-hover:text-[#0F3D3E]')
                      }`}>
                        {cat.name}
                      </h3>

                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-mono font-medium flex items-center gap-1 ${
                          isDark ? 'text-[#E2DCC8]/60' : 'text-slate-500'
                        }`}>
                          <Package size={11} className={isSelected ? 'text-[#E2DCC8]' : ''} />
                          {catProductCount} {catProductCount === 1 ? 'Product' : 'Products'}
                        </span>

                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color || '#0F3D3E' }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredCategories.length === 0 && (
              <div className="py-24 text-center">
                <Box size={40} className={`mx-auto mb-3 ${isDark ? 'text-[#E2DCC8]/30' : 'text-slate-300'}`} />
                <h3 className={`font-space text-base font-bold ${isDark ? 'text-[#F1F1F1]' : 'text-slate-800'}`}>No matching categories</h3>
                <p className={`text-xs mt-1 ${isDark ? 'text-[#E2DCC8]/60' : 'text-slate-500'}`}>Try another keyword or clear search.</p>
              </div>
            )}
          </div>
        )}

        {/* Phase 3: Table Schema Builder (Edge-to-Edge Minimal Clean) */}
        {step === 3 && (
          <div className="p-8 w-full space-y-6 flex-1 max-w-none">
            {/* Box 1: Available Product Fields */}
            <div className={`rounded-[4px] border p-6 space-y-4 ${
              isDark ? 'bg-[#141414] border-[#E2DCC8]/15' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`font-space text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
                  isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'
                }`}>
                  <Sliders size={13} /> Available Product Fields ({candidateFields.length})
                </span>
                
                <div className="flex items-center gap-3">
                  <span className={`text-[11px] font-medium font-mono ${isDark ? 'text-[#E2DCC8]/70' : 'text-slate-500'}`}>
                    <strong className={isDark ? 'text-white' : 'text-slate-900'}>{selectedHeaders.length}</strong> columns active
                  </span>
                  <button
                    type="button"
                    onClick={resetHeadersToDefault}
                    className={`px-3 py-1 border rounded-[4px] text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 ${
                      isDark ? 'bg-[#1a1a1a] hover:bg-[#222] border-[#E2DCC8]/20 text-[#E2DCC8] hover:text-white' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                    }`}
                  >
                    <RotateCcw size={11} />
                    <span>Reset Defaults</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                {candidateFields.map((field) => {
                  const isChecked = selectedHeaders.includes(field);
                  return (
                    <button
                      key={field}
                      type="button"
                      onClick={() => toggleHeader(field)}
                      className={`px-4 py-2 rounded-[4px] text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 border ${
                        isChecked
                          ? 'bg-[#0F3D3E] border-[#E2DCC8]/40 text-white shadow-sm'
                          : (isDark 
                              ? 'bg-[#100F0F] border-[#E2DCC8]/15 text-[#E2DCC8]/60 hover:text-white hover:border-[#E2DCC8]/30' 
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900')
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-[3px] flex items-center justify-center text-[10px] ${
                        isChecked 
                          ? 'bg-white text-[#0F3D3E] font-black' 
                          : (isDark ? 'border border-[#444]' : 'border border-slate-300')
                      }`}>
                        {isChecked ? <Check size={11} strokeWidth={3} /> : null}
                      </div>
                      <span>{field}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Box 2: Active Column Sequence (Middle Horizontal Pipeline) */}
            <div className={`rounded-[4px] border p-5 space-y-3.5 ${
              isDark ? 'bg-[#141414] border-[#E2DCC8]/15' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`font-space text-xs font-bold uppercase tracking-wider ${isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'}`}>
                    Active Column Sequence ({selectedHeaders.length})
                  </span>
                  <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded ${isDark ? 'bg-white/5 text-[#E2DCC8]/60' : 'bg-slate-100 text-slate-500'}`}>
                    Left to Right
                  </span>
                </div>
                <span className={`text-[11px] font-mono ${isDark ? 'text-[#E2DCC8]/50' : 'text-slate-400'}`}>
                  Use ← → arrows to re-order
                </span>
              </div>

              {/* Horizontal Sequence Flow */}
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                {selectedHeaders.map((hdr, idx) => (
                  <React.Fragment key={hdr}>
                    <div
                      className={`px-3 py-1.5 border rounded-[4px] flex items-center gap-2.5 shadow-sm transition-all ${
                        isDark ? 'bg-[#100F0F] border-[#E2DCC8]/20 text-white hover:border-[#E2DCC8]/40' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full bg-[#0F3D3E] text-white text-[9px] font-mono font-bold flex items-center justify-center shrink-0 border border-[#E2DCC8]/30">
                        {idx + 1}
                      </span>
                      <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-[#E2DCC8]' : 'text-slate-800'}`}>
                        {hdr}
                      </span>

                      <div className="flex items-center gap-0.5 pl-1.5 border-l border-white/10">
                        {idx > 0 && (
                          <button
                            type="button"
                            onClick={() => moveHeader(idx, 'left')}
                            className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                            title="Move Left"
                          >
                            <MoveLeft size={12} />
                          </button>
                        )}
                        {idx < selectedHeaders.length - 1 && (
                          <button
                            type="button"
                            onClick={() => moveHeader(idx, 'right')}
                            className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                            title="Move Right"
                          >
                            <MoveRight size={12} />
                          </button>
                        )}
                        {selectedHeaders.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeHeader(idx)}
                            className="p-1 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors ml-0.5"
                            title="Remove Column"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Arrow connector between items */}
                    {idx < selectedHeaders.length - 1 && (
                      <ChevronRight size={14} className={isDark ? "text-[#E2DCC8]/30 shrink-0" : "text-slate-300 shrink-0"} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Box 3: Live Table Preview */}
            <div className={`rounded-[4px] border overflow-hidden ${
              isDark ? 'bg-[#141414] border-[#E2DCC8]/15' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className={`px-6 py-3.5 border-b flex items-center justify-between ${
                isDark ? 'bg-[#171616] border-[#E2DCC8]/15' : 'bg-slate-100/90 border-slate-200'
              }`}>
                <span className={`text-xs font-bold uppercase tracking-wider font-heading flex items-center gap-2 ${
                  isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'
                }`}>
                  <Eye size={14} /> Live Table Preview ({previewCategory?.name || 'Creta Series COB Downlight'})
                </span>
                <span className={`text-[10px] font-mono ${isDark ? 'text-[#E2DCC8]/50' : 'text-slate-500'}`}>
                  Preview generated using real catalog product schema
                </span>
              </div>

              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className={`border-b ${isDark ? 'bg-[#100F0F] border-[#E2DCC8]/15 text-[#E2DCC8]' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
                      <th className="p-3.5 w-12 text-center font-bold text-[10px]">#</th>
                      {selectedHeaders.map((hdr) => (
                        <th key={hdr} className="p-3.5 font-bold uppercase tracking-wider text-[10px]">
                          {hdr}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-[#E2DCC8]/10' : 'divide-slate-200'}`}>
                    {previewProducts.length > 0 ? (
                      previewProducts.map((p, rIdx) => {
                        const rowCells = selectedHeaders.map(hdr => {
                          const h = hdr.toLowerCase().replace(/[^a-z0-9]/g, '');
                          if (h.includes('model')) {
                            return p.customFields?.model || p.customFields?.model_no || (p as any).modelNo || '-';
                          }
                          if (h.includes('product') || h.includes('name')) {
                            return p.name || '-';
                          }
                          if (h.includes('dealer') && h.includes('price')) {
                            return (p as any).dealerPrice || p.customFields?.dealer_price || p.customFields?.dealerPrice || '-';
                          }
                          if (h.includes('price')) {
                            return p.price ? `${p.currency || '₹'}${p.price}` : '-';
                          }
                          if (h.includes('cut')) {
                            return (p as any).cutOut || p.customFields?.cutOut || p.customFields?.cut_out || '-';
                          }
                          if (h.includes('color') || h.includes('cct')) {
                            return (p as any).color || p.customFields?.color || p.customFields?.cct || '-';
                          }
                          if (h.includes('box')) {
                            return (p as any).packingPerBox || p.customFields?.packing_per_box || '-';
                          }
                          if (h.includes('pack')) {
                            return (p as any).packing || p.customFields?.packing || '-';
                          }
                          if (p.customFields) {
                            for (const [k, v] of Object.entries(p.customFields)) {
                              const label = resolveFieldLabel(k, categories as any, p);
                              if (label && label.toLowerCase().replace(/[^a-z0-9]/g, '') === h) {
                                return String(v);
                              }
                            }
                          }
                          return '-';
                        });

                        return (
                          <tr key={p.id || rIdx} className={isDark ? 'bg-[#100F0F] hover:bg-[#161616]' : 'bg-white hover:bg-slate-50'}>
                            <td className="p-3.5 text-center text-slate-400 font-mono text-[10px]">{rIdx + 1}</td>
                            {rowCells.map((cell, cIdx) => (
                              <td key={cIdx} className="p-3.5 font-medium truncate max-w-[200px]">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        );
                      })
                    ) : (
                      <>
                        <tr className={isDark ? 'bg-[#100F0F]' : 'bg-white'}>
                          <td className="p-3.5 text-center text-slate-400 font-mono text-[10px]">1</td>
                          {selectedHeaders.map((hdr, cIdx) => (
                            <td key={cIdx} className="p-3.5 font-medium text-slate-300">
                              {hdr.includes('MODEL') ? 'VT-101' : (hdr.includes('PRODUCT') ? 'Untitled Product' : (hdr.includes('PRICE') ? '₹1200' : '-'))}
                            </td>
                          ))}
                        </tr>
                        <tr className={isDark ? 'bg-[#100F0F]' : 'bg-white'}>
                          <td className="p-3.5 text-center text-slate-400 font-mono text-[10px]">2</td>
                          {selectedHeaders.map((hdr, cIdx) => (
                            <td key={cIdx} className="p-3.5 font-medium text-slate-300">
                              {hdr.includes('MODEL') ? 'VT-102' : (hdr.includes('PRODUCT') ? 'Untitled Product' : (hdr.includes('PRICE') ? '₹1450' : '-'))}
                            </td>
                          ))}
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pinned Bottom Navigation Footer Bar */}
      {step > 1 && (
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
            <span>{step === 2 ? 'Back to Identity' : 'Back to Categories'}</span>
          </button>

          <div className="text-center hidden sm:block">
            <span className={`text-xs font-medium ${isDark ? 'text-[#E2DCC8]/70' : 'text-slate-600'}`}>
              {step === 2 ? (
                selectedCategoryIds.length === 0 ? (
                  <span className="text-amber-500 font-semibold">Select at least one category to proceed</span>
                ) : (
                  <span>
                    Ready with <strong className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedCategoryIds.length}</strong> categories ({' '}
                    <strong className={`font-bold ${isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'}`}>{totalSelectedProducts}</strong> products)
                  </span>
                )
              ) : (
                <span>
                  Ready to build catalog with <strong className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedCategoryIds.length}</strong> categories • <strong className={`font-bold ${isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'}`}>{selectedHeaders.length}</strong> spec columns
                </span>
              )}
            </span>
          </div>

          {step === 2 ? (
            <button
              type="button"
              onClick={() => setStep(3)}
              disabled={selectedCategoryIds.length === 0}
              className="px-5 py-2 bg-[#0F3D3E] hover:bg-[#155455] border border-[#E2DCC8]/30 text-white rounded-[4px] font-heading font-semibold text-xs uppercase tracking-wider shadow-md shadow-[#0F3D3E]/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 active:scale-95 whitespace-nowrap"
            >
              <span>Next: Table Schema</span>
              <ChevronRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleGenerate}
              disabled={selectedCategoryIds.length === 0 || selectedHeaders.length === 0}
              className="px-6 py-2 bg-[#0F3D3E] hover:bg-[#155455] border border-[#E2DCC8]/30 text-white rounded-[4px] font-heading font-semibold text-xs uppercase tracking-wider shadow-md shadow-[#0F3D3E]/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 active:scale-95 whitespace-nowrap"
            >
              <Layers size={15} className="text-[#E2DCC8]" />
              <span>BUILD & GENERATE CATALOG ({selectedCategoryIds.length} CATEGORIES • {selectedHeaders.length} COLUMNS)</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CatalogSetup;
