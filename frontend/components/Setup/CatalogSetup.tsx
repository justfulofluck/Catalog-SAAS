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
  Sparkles,
  Table,
  Plus,
  Trash2,
  MoveLeft,
  MoveRight,
  RotateCcw,
  Sliders,
  Eye,
  Zap,
  Image as ImageIcon,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Package
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { GRID_TEMPLATES } from '../../constants';
import { resolveProductImage } from '../../utils/imageUtils';
import { resolveFieldLabel } from '../../utils/fieldUtils';

const CatalogSetup: React.FC = () => {
  const { setView, categories, products, generateCatalogFromTemplate } = useStore();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const selectedTemplateId = 'tpl-v-tac'; // Fixed V-TAC / VTEC theme

  // Selected products count across all selected categories
  const totalSelectedProducts = useMemo(() => {
    return products.filter(p => selectedCategoryIds.includes(String(p.categoryId))).length;
  }, [products, selectedCategoryIds]);

  // Table Schema State for Phase 3
  const [selectedHeaders, setSelectedHeaders] = useState<string[]>([
    'MODEL NO',
    'PRODUCTS',
    'CUT-OUT',
    'PRICE',
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

    const standardFields = ['MODEL NO', 'PRODUCTS', 'PRICE', 'CUT-OUT', 'COLOR', 'PACKING'];
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

  // Default configuration: Only Cover and Product pages included
  const includeCover = true;
  const includeIndex = false;
  const includeCategoryCovers = false;

  const toggleCategory = (id: string) => {
    const subcategoryIds = categories.filter(c => c.parent === id).map(c => c.id);
    setSelectedCategoryIds(prev => {
      const isSelected = prev.includes(id);
      if (isSelected) {
        // Deselect this category and all its subcategories
        return prev.filter(cid => cid !== id && !subcategoryIds.includes(cid));
      } else {
        // Select this category and all its subcategories
        return Array.from(new Set([...prev, id, ...subcategoryIds]));
      }
    });
  };

  const toggleSubcategory = (subId: string, parentId: string) => {
    setSelectedCategoryIds(prev => {
      if (prev.includes(subId)) {
        return prev.filter(cid => cid !== subId);
      } else {
        return Array.from(new Set([...prev, subId, parentId]));
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
        if (prev.length <= 1) return prev; // Keep at least 1 column
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
    setSelectedHeaders(['MODEL NO', 'PRODUCTS', 'CUT-OUT', 'PRICE', 'COLOR']);
  };

  const handleGenerate = async () => {
    if (name && selectedCategoryIds.length > 0) {
      const defaultTemplate = GRID_TEMPLATES[1]; // 2x2 grid
      
      generateCatalogFromTemplate(
        name,
        defaultTemplate,
        selectedCategoryIds,
        { 
          includeCover, 
          includeIndex, 
          includeCategoryCovers,
          selectedTemplateId,
          tableHeaders: selectedHeaders
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
    { num: 2, label: 'Categories' },
    { num: 3, label: 'Table Schema' }
  ];

  const rootCategories = categories.filter(c => !c.parent);
  const filteredCategories = rootCategories.filter(c =>
    !categorySearch ||
    c.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  // Sample Preview Rows from First Selected Category
  const previewCategory = categories.find(c => selectedCategoryIds.includes(c.id)) || categories[0];
  const previewProducts = products.filter(p => String(p.categoryId) === String(previewCategory?.id)).slice(0, 3);

  return (
    <div className="flex-1 overflow-y-auto bg-[#100F0F] text-white p-4 sm:p-6 md:p-8 custom-scrollbar flex flex-col items-center justify-start min-h-full animate-in fade-in duration-500">
      <div className={`w-full space-y-6 my-auto transition-all duration-300 ${step === 2 ? 'max-w-7xl' : step === 3 ? 'max-w-6xl' : 'max-w-5xl'}`}>

        {/* 3-Phase Progress Navigation */}
        <div className="flex items-center gap-4 md:gap-8 max-w-2xl mx-auto">
          {phases.map((p) => (
            <div key={p.num} className="flex-1 flex flex-col gap-2 group cursor-default">
              <div className={`h-2 rounded-full transition-all duration-500 ${step >= p.num ? 'bg-[#0F3D3E]' : 'bg-[#262626]'}`} />
              <div className="flex justify-between items-center px-1">
                <div>
                  <p className={`text-[9px] font-bold uppercase tracking-widest transition-colors ${step >= p.num ? 'text-[#E2DCC8]' : 'text-[#666666]'}`}>
                    Phase 0{p.num}
                  </p>
                  <p className={`font-space text-xs font-bold transition-colors ${step >= p.num ? 'text-white' : 'text-[#888888]'}`}>
                    {p.label}
                  </p>
                </div>
                {step > p.num && <CheckCircle2 size={14} className="text-[#E2DCC8] animate-in zoom-in" />}
              </div>
            </div>
          ))}
        </div>

        {/* Phase 1: Catalog Name & Identity */}
        {step === 1 && (
          <div className="grid grid-cols-1 gap-8 items-start animate-in slide-in-from-bottom-8 duration-500 max-w-xl mx-auto pt-4">
            <div className="space-y-6">
              <div className="space-y-4 text-center">
                <span className="px-4 py-1.5 bg-[#0F3D3E]/20 text-[#E2DCC8] text-[10px] font-bold uppercase tracking-widest rounded-full border border-[#0F3D3E]/40">
                  Initiate Build
                </span>
                <h1 className="font-space text-4xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
                  Structure & <br /><span className="text-[#E2DCC8]">Identity.</span>
                </h1>
                <p className="text-[#888888] font-medium text-sm sm:text-base leading-relaxed">
                  Define the foundational title of your new V-TAC catalog publication.
                </p>
              </div>

              <div className="bg-[#161616] rounded-xl border border-[#262626] p-6 sm:p-8 space-y-6 shadow-xl">
                <div className="space-y-2.5">
                  <label className="text-[10px] font-bold text-[#888888] uppercase tracking-widest ml-1">
                    Document Title
                  </label>
                  <div className="relative group">
                    <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666666] group-focus-within:text-[#E2DCC8] transition-colors" size={18} />
                    <input
                      type="text"
                      placeholder="e.g. V-TAC Lighting Collection 2026"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && name.trim()) {
                          setStep(2);
                        }
                      }}
                      autoFocus
                      className="w-full bg-[#1c1c1c] border border-[#2d2d2d] rounded-lg pl-11 pr-4 py-3.5 text-sm font-bold text-white placeholder-[#666666] focus:border-[#0F3D3E] outline-none transition-all shadow-inner"
                    />
                  </div>
                </div>

                <button
                  disabled={!name.trim()}
                  onClick={() => setStep(2)}
                  className="w-full py-3.5 bg-[#0F3D3E] hover:bg-[#155455] border border-[#E2DCC8]/30 text-[#E2DCC8] rounded-lg font-black text-xs uppercase tracking-widest shadow-xl shadow-[#0F3D3E]/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-98"
                >
                  <span>Proceed to Categories</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Phase 2: Category Selection */}
        {step === 2 && (
          <div className="space-y-4 animate-in slide-in-from-right-8 duration-500 w-full pt-1">
            {/* Top Toolbar: Search, Metrics & Quick Actions */}
            <div className="bg-[#141414] border border-[#262626] rounded-xl p-3 sm:p-4 flex flex-col lg:flex-row items-center justify-between gap-3 shadow-lg">
              {/* Back & Search */}
              <div className="flex items-center gap-2.5 w-full lg:w-auto">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-3 py-2 bg-[#1c1c1c] hover:bg-[#252525] border border-[#333] text-[#888888] hover:text-[#E2DCC8] rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0"
                  title="Return to Title"
                >
                  <ArrowLeft size={14} />
                  <span>Back</span>
                </button>

                <div className="relative w-full sm:w-72 md:w-80">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#777]" />
                  <input
                    type="text"
                    placeholder="Search categories..."
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    className="w-full bg-[#0c0c0c] border border-[#2a2a2a] rounded-lg pl-9 pr-8 py-2 text-xs font-bold text-white placeholder-[#666] focus:border-[#0F3D3E] focus:ring-1 focus:ring-[#0F3D3E] outline-none transition-all"
                  />
                  {categorySearch && (
                    <button
                      type="button"
                      onClick={() => setCategorySearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* Selection Metrics & Micro Actions */}
              <div className="flex flex-wrap items-center justify-between lg:justify-end gap-2.5 w-full lg:w-auto">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0e1717] border border-[#0F3D3E]/50 text-xs">
                  <span className="w-2 h-2 rounded-full bg-[#00a651] animate-pulse" />
                  <span className="text-[#888888] font-medium">
                    <strong className="text-white font-mono">{selectedCategoryIds.length}</strong> of{' '}
                    <span className="font-mono text-slate-400">{rootCategories.length}</span> selected
                  </span>
                  <span className="text-[#444]">•</span>
                  <span className="text-[#00a651] font-mono font-bold">
                    {totalSelectedProducts} products
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="px-3 py-1.5 bg-[#1a1a1a] hover:bg-[#242424] border border-[#333] text-[#E2DCC8] hover:border-[#0F3D3E] rounded-lg text-[11px] font-bold tracking-wide transition-all flex items-center gap-1"
                  >
                    <Check size={12} className="text-[#00a651]" />
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={handleDeselectAll}
                    className="px-3 py-1.5 bg-[#1a1a1a] hover:bg-[#242424] border border-[#333] text-slate-400 hover:text-white rounded-lg text-[11px] font-bold tracking-wide transition-all"
                  >
                    Deselect All
                  </button>
                </div>
              </div>
            </div>

            {/* Responsive Category Grid: 3 or 4 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto pr-1.5 custom-scrollbar pb-6">
              {filteredCategories.map((cat) => {
                const isSelected = selectedCategoryIds.includes(cat.id);
                const subcategories = categories.filter(c => c.parent === cat.id);
                const isExpanded = expandedCategories.includes(cat.id);
                const catProducts = products.filter(p => String(p.categoryId) === String(cat.id));
                const catProductCount = catProducts.length;
                const catImg = resolveProductImage(catProducts[0], cat, catProducts);

                return (
                  <div
                    key={cat.id}
                    className={`group relative rounded-xl border transition-all duration-200 flex flex-col justify-between overflow-hidden ${
                      isSelected
                        ? 'bg-gradient-to-b from-[#132323] to-[#0f1717] border-[#00a651]/80 ring-1 ring-[#00a651]/40 shadow-lg shadow-[#0F3D3E]/20'
                        : 'bg-[#151515] border-[#242424] hover:border-[#383838] hover:bg-[#1a1a1a]'
                    }`}
                  >
                    {/* Clickable Card Body */}
                    <button
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
                      className="w-full text-left p-3.5 pb-2 flex flex-col flex-1 focus:outline-none"
                    >
                      {/* Top Bar: Code Tag + Selection Indicator */}
                      <div className="flex items-center justify-between gap-2 w-full mb-2.5">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#888888] truncate max-w-[140px]">
                          {cat.code || 'Series'}
                        </span>
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-[#00a651] text-white shadow-sm shadow-[#00a651]/50'
                              : 'border border-[#383838] bg-[#111] group-hover:border-[#555]'
                          }`}
                        >
                          {isSelected && <Check size={13} strokeWidth={3} />}
                        </div>
                      </div>

                      {/* Photo Thumbnail Container */}
                      <div className="w-full h-36 rounded-lg bg-[#0c0c0c] border border-[#222] overflow-hidden flex items-center justify-center p-2 group-hover:border-[#333] transition-colors relative mb-3">
                        {catImg ? (
                          <img
                            src={catImg}
                            alt={cat.name}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <FolderOpen size={32} className="text-[#E2DCC8]/40 group-hover:text-[#E2DCC8]/70 transition-colors" />
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="font-space font-bold text-white text-sm leading-snug group-hover:text-[#E2DCC8] transition-colors line-clamp-2 min-h-[2.5rem]">
                        {cat.name}
                      </h3>
                    </button>

                    {/* Card Footer: Product Count & Subcategory Button */}
                    <div className="px-3.5 pb-3 pt-1 flex items-center justify-between gap-2 border-t border-white/[0.04]">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-[#0c0c0c] border border-[#222] text-[#888888]">
                        <Package size={10} className={isSelected ? 'text-[#00a651]' : 'text-slate-500'} />
                        <span className={isSelected ? 'text-[#00a651] font-black' : 'text-slate-300 font-bold'}>
                          {catProductCount}
                        </span>
                        <span>{catProductCount === 1 ? 'Product' : 'Products'}</span>
                      </span>

                      {subcategories.length > 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedCategories(prev =>
                              prev.includes(cat.id) ? prev.filter(id => id !== cat.id) : [...prev, cat.id]
                            );
                          }}
                          className="text-[10px] font-bold text-[#E2DCC8] hover:text-white flex items-center gap-1 px-2 py-0.5 rounded hover:bg-white/5 transition-colors"
                        >
                          <span>{subcategories.length} sub</span>
                          {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </button>
                      )}
                    </div>

                    {/* Expandable Subcategories Drawer */}
                    {subcategories.length > 0 && isExpanded && (
                      <div className="p-2.5 bg-[#0e0e0e] border-t border-[#222] space-y-1.5 animate-in slide-in-from-top-2 duration-200">
                        <p className="text-[9px] uppercase tracking-wider font-bold text-[#666] px-1">Subcategories</p>
                        {subcategories.map((sub) => {
                          const isSubSelected = selectedCategoryIds.includes(sub.id);
                          const subProducts = products.filter(p => String(p.categoryId) === String(sub.id));
                          const subProductCount = subProducts.length;

                          return (
                            <button
                              key={sub.id}
                              type="button"
                              onClick={() => toggleSubcategory(sub.id, cat.id)}
                              className={`w-full rounded-md px-2 py-1.5 flex items-center justify-between text-left text-xs transition-all border ${
                                isSubSelected
                                  ? 'bg-[#152424] border-[#00a651]/50 text-white'
                                  : 'bg-[#141414] border-[#222] hover:border-[#333] text-slate-300'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate pr-2">
                                <div className={`w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 ${isSubSelected ? 'bg-[#00a651] text-white' : 'border border-[#444]'}`}>
                                  {isSubSelected && <Check size={10} strokeWidth={3} />}
                                </div>
                                <span className="truncate text-[11px] font-medium">{sub.name}</span>
                              </div>
                              <span className="text-[9px] font-mono text-slate-500 shrink-0">{subProductCount} p</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredCategories.length === 0 && (
                <div className="col-span-full bg-[#161616] border border-[#262626] p-12 rounded-xl text-center space-y-3">
                  <Box className="mx-auto text-slate-500" size={36} />
                  <p className="font-space text-sm font-bold text-white">No matching categories found</p>
                  <p className="text-xs text-slate-400">
                    No categories match "{categorySearch}". Try another keyword or clear the search.
                  </p>
                  <button
                    type="button"
                    onClick={() => setCategorySearch('')}
                    className="px-3 py-1.5 bg-[#202020] hover:bg-[#282828] border border-[#333] text-xs font-bold text-[#E2DCC8] rounded-md transition-colors"
                  >
                    Clear Filter
                  </button>
                </div>
              )}
            </div>

            {/* Non-overlapping Sticky Bottom Action Bar */}
            <div className="sticky bottom-0 z-20 bg-[#100F0F]/95 backdrop-blur-md border-t border-[#262626] pt-3 pb-2 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xl">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 bg-[#181818] hover:bg-[#222] border border-[#2a2a2a] text-[#888888] hover:text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors order-2 sm:order-1"
              >
                <ArrowLeft size={14} />
                <span>Back to Identity</span>
              </button>

              <div className="text-center order-1 sm:order-2">
                <span className="text-xs text-[#888888] font-medium">
                  {selectedCategoryIds.length === 0 ? (
                    <span className="text-amber-400 font-semibold">Select at least one category to proceed</span>
                  ) : (
                    <span>
                      Ready to build schema with{' '}
                      <strong className="text-white font-mono">{selectedCategoryIds.length}</strong> {selectedCategoryIds.length === 1 ? 'category' : 'categories'} ({' '}
                      <strong className="text-[#00a651] font-mono">{totalSelectedProducts}</strong> products)
                    </span>
                  )}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setStep(3)}
                disabled={selectedCategoryIds.length === 0}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-[#0F3D3E] to-[#155455] hover:from-[#134d4f] hover:to-[#175f61] border border-[#E2DCC8]/40 text-[#E2DCC8] hover:text-white rounded-lg font-black text-xs uppercase tracking-wider shadow-xl shadow-[#0F3D3E]/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 order-3"
              >
                <span>Next: Table Schema Builder (Phase 03)</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Phase 3: Table Structure & Common Schema Builder */}
        {step === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right-8 duration-500 w-full pt-2">
            
            {/* Header / Intro */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-[#222]">
              <div>
                <span className="px-3 py-1 bg-[#0F3D3E]/20 text-[#E2DCC8] text-[9px] font-bold uppercase tracking-widest rounded-full border border-[#0F3D3E]/40 inline-flex items-center gap-1 mb-1.5">
                  <Table size={10} /> Common Table Schema
                </span>
                <h2 className="font-space text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Configure Spec Table <span className="text-[#E2DCC8]">Columns.</span>
                </h2>
                <p className="text-[#888888] text-xs font-medium">
                  Select and order the standard columns that will appear across all product tables in your catalog.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={resetHeadersToDefault}
                  className="px-3 py-1.5 bg-[#181818] hover:bg-[#222] border border-[#2a2a2a] text-slate-400 hover:text-white rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1"
                  title="Reset to default columns"
                >
                  <RotateCcw size={11} /> Reset Defaults
                </button>
              </div>
            </div>

            {/* Column Selection Pills / Badges */}
            <div className="bg-[#161616] rounded-xl border border-[#262626] p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-[#E2DCC8] uppercase tracking-widest flex items-center gap-1.5">
                  <Sliders size={12} className="text-emerald-400" /> Available Product Fields ({candidateFields.length})
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  {selectedHeaders.length} columns active
                </span>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {candidateFields.map((field) => {
                  const isChecked = selectedHeaders.includes(field);
                  return (
                    <button
                      key={field}
                      type="button"
                      onClick={() => toggleHeader(field)}
                      className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 border ${
                        isChecked
                          ? 'bg-[#0F3D3E] border-[#00a651] text-white shadow-md shadow-[#0F3D3E]/30 ring-1 ring-[#00a651]/40'
                          : 'bg-[#141414] border-[#2a2a2a] text-slate-400 hover:text-slate-200 hover:border-slate-600'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${isChecked ? 'bg-[#00a651] text-black font-black' : 'border border-slate-600'}`}>
                        {isChecked ? '✓' : ''}
                      </div>
                      <span>{field}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Column Order & Management Bar */}
            <div className="bg-[#141414] rounded-xl border border-[#262626] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Active Column Sequence (Left to Right)
                </span>
                <span className="text-[9px] text-slate-500">
                  Use arrows to re-order columns
                </span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                {selectedHeaders.map((hdr, idx) => (
                  <div
                    key={hdr}
                    className="px-3 py-2 bg-[#1b2a2b] border border-[#0F3D3E] text-white rounded-lg flex items-center gap-2 shrink-0 shadow-sm"
                  >
                    <span className="w-4 h-4 rounded-full bg-[#00a651] text-black text-[9px] font-mono font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#E2DCC8]">{hdr}</span>
                    
                    <div className="flex items-center gap-1 pl-1 border-l border-[#0F3D3E]/60 ml-1">
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={() => moveHeader(idx, 'left')}
                          className="p-1 hover:bg-[#0F3D3E] text-slate-400 hover:text-white rounded transition-colors"
                          title="Move Left"
                        >
                          <MoveLeft size={11} />
                        </button>
                      )}
                      {idx < selectedHeaders.length - 1 && (
                        <button
                          type="button"
                          onClick={() => moveHeader(idx, 'right')}
                          className="p-1 hover:bg-[#0F3D3E] text-slate-400 hover:text-white rounded transition-colors"
                          title="Move Right"
                        >
                          <MoveRight size={11} />
                        </button>
                      )}
                      {selectedHeaders.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeHeader(idx)}
                          className="p-1 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded transition-colors"
                          title="Remove Column"
                        >
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Table Preview */}
            <div className="bg-[#121212] rounded-xl border border-[#222] p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#E2DCC8] uppercase tracking-wider flex items-center gap-1.5">
                  <Eye size={12} className="text-emerald-400" /> Live Table Preview ({previewCategory?.name || 'Sample Products'})
                </span>
                <span className="text-[9px] text-slate-500 italic">
                  Preview generated using real catalog product schema
                </span>
              </div>

              <div className="overflow-x-auto rounded-lg border border-[#0F3D3E]/50 shadow-inner">
                <table className="w-full text-left text-xs border-collapse font-mono">
                  <thead>
                    <tr className="bg-[#002b36] text-white border-b border-[#0F3D3E]">
                      <th className="p-2.5 w-10 text-center font-bold text-[10px] text-emerald-400 border-r border-[#0F3D3E]/40">#</th>
                      {selectedHeaders.map((hdr) => (
                        <th key={hdr} className="p-2.5 font-bold uppercase tracking-wider text-[10px] text-[#E2DCC8] border-r border-[#0F3D3E]/40 last:border-r-0">
                          {hdr}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
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
                          if (h.includes('price')) {
                            return p.price ? `${p.currency || '₹'}${p.price}` : '-';
                          }
                          if (h.includes('cut')) {
                            return (p as any).cutOut || p.customFields?.cutOut || p.customFields?.cut_out || '-';
                          }
                          if (h.includes('color') || h.includes('cct')) {
                            return (p as any).color || p.customFields?.color || p.customFields?.cct || '-';
                          }
                          if (h.includes('pack')) {
                            return (p as any).packing || p.customFields?.packing || '-';
                          }
                          // Check custom fields
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
                          <tr key={p.id || rIdx} className={`border-b border-[#1f2d2e] ${rIdx % 2 === 1 ? 'bg-[#0b1718]' : 'bg-[#0e1f20]'}`}>
                            <td className="p-2 text-center text-slate-400 font-mono text-[10px] border-r border-[#1f2d2e]">{rIdx + 1}</td>
                            {rowCells.map((cell, cIdx) => (
                              <td key={cIdx} className="p-2 font-medium text-slate-200 border-r border-[#1f2d2e] last:border-r-0 truncate max-w-[200px]">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        );
                      })
                    ) : (
                      <tr className="bg-[#0e1f20]">
                        <td className="p-2 text-center text-slate-400 font-mono text-[10px] border-r border-[#1f2d2e]">1</td>
                        {selectedHeaders.map((hdr, cIdx) => (
                          <td key={cIdx} className="p-2 font-medium text-slate-200 border-r border-[#1f2d2e] last:border-r-0">
                            {cIdx === 0 ? 'VT-SAMPLE' : (cIdx === 1 ? 'Sample Product' : '-')}
                          </td>
                        ))}
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Navigation & Generate Bar */}
            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2.5 bg-[#181818] hover:bg-[#222] border border-[#2a2a2a] text-[#888888] hover:text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft size={14} />
                <span>Back to Categories</span>
              </button>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={selectedCategoryIds.length === 0 || selectedHeaders.length === 0}
                className="px-8 py-3.5 bg-gradient-to-r from-[#0F3D3E] to-[#155455] hover:from-[#134d4f] hover:to-[#175f61] border border-[#E2DCC8]/40 text-[#E2DCC8] rounded-lg font-black text-xs uppercase tracking-wider shadow-xl shadow-[#0F3D3E]/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Layers size={15} className="text-[#E2DCC8]" />
                <span>Build & Generate Catalog ({selectedCategoryIds.length} Categories • {selectedHeaders.length} Columns)</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default CatalogSetup;
