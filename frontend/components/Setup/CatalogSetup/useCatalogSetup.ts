import { useState, useEffect, useMemo } from 'react';
import { useStore } from '../../../store/useStore';
import { GRID_TEMPLATES } from '../../../constants';
import { resolveFieldLabel } from '../../../utils/fieldUtils';
import { LayoutId, CardFieldsConfig } from './types';
import { DEFAULT_HEADERS, STANDARD_CANDIDATE_FIELDS, PHASES } from './constants';

export const useCatalogSetup = () => {
  const {
    setView,
    categories,
    products,
    generateCatalogFromTemplate,
    uiTheme,
    systemTemplates,
    fetchSystemTemplates
  } = useStore();

  const isDark = uiTheme === 'dark';

  useEffect(() => {
    if (fetchSystemTemplates) {
      fetchSystemTemplates();
    }
  }, [fetchSystemTemplates]);

  // Navigation Stepper State (5 Distinct Phases)
  const [step, setStep] = useState<number>(1);
  const [name, setName] = useState<string>('');
  const [categorySearch, setCategorySearch] = useState<string>('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  // Step 3: Layout State (Master Default + Per-Category Override - Option B)
  const [defaultLayoutId, setDefaultLayoutId] = useState<LayoutId>('table-3grid');
  const [categoryLayoutOverrides, setCategoryLayoutOverrides] = useState<Record<string, LayoutId>>({});
  const [layoutCategoryFilter, setLayoutCategoryFilter] = useState<string>('');

  // Step 4: Framing & Covers State (Cover, Header, Footer)
  const [activeFramingTab, setActiveFramingTab] = useState<'cover' | 'header' | 'footer'>('cover');
  const [includeCover, setIncludeCover] = useState<boolean>(true);
  const [coverTemplateId, setCoverTemplateId] = useState<string>('');

  const [headerMode, setHeaderMode] = useState<'none' | 'default' | 'template'>('none');
  const [headerTemplateId, setHeaderTemplateId] = useState<string>('');

  const [footerMode, setFooterMode] = useState<'none' | 'default' | 'template'>('none');
  const [footerTemplateId, setFooterTemplateId] = useState<string>('');

  const savedHeaderTemplates = useMemo(() => {
    return (systemTemplates || []).filter(st => st.is_active && st.type === 'header');
  }, [systemTemplates]);

  const savedFooterTemplates = useMemo(() => {
    return (systemTemplates || []).filter(st => st.is_active && st.type === 'footer');
  }, [systemTemplates]);

  const savedCoverTemplates = useMemo(() => {
    return (systemTemplates || []).filter(st => st.is_active && (st.type === 'cover' || st.type === 'full_catalog'));
  }, [systemTemplates]);

  const selectedCoverTemplate = useMemo(() => {
    if (!includeCover || !coverTemplateId) return null;
    return (systemTemplates || []).find(t => String(t.id) === String(coverTemplateId) || t.uuid === String(coverTemplateId)) || null;
  }, [includeCover, coverTemplateId, systemTemplates]);

  const selectedHeaderTemplate = useMemo(() => {
    if (headerMode !== 'template' || !headerTemplateId) return null;
    return (systemTemplates || []).find(t => String(t.id) === String(headerTemplateId) || t.uuid === String(headerTemplateId)) || null;
  }, [headerMode, headerTemplateId, systemTemplates]);

  const selectedFooterTemplate = useMemo(() => {
    if (footerMode !== 'template' || !footerTemplateId) return null;
    return (systemTemplates || []).find(t => String(t.id) === String(footerTemplateId) || t.uuid === String(footerTemplateId)) || null;
  }, [footerMode, footerTemplateId, systemTemplates]);

  // Step 5: Schema & Card Configuration State
  const [activeSchemaTab, setActiveSchemaTab] = useState<'table' | 'cards'>('table');
  const [selectedHeaders, setSelectedHeaders] = useState<string[]>(DEFAULT_HEADERS);
  const [cardFields, setCardFields] = useState<CardFieldsConfig>({
    showPrice: true,
    showSku: true,
    showTitle: true,
    cardTheme: 'classic-stack'
  });

  // Selected products count across all selected categories
  const totalSelectedProducts = useMemo(() => {
    return products.filter(p => selectedCategoryIds.includes(String(p.categoryId))).length;
  }, [products, selectedCategoryIds]);

  // Initialize with all root categories selected by default
  useEffect(() => {
    if (categories && categories.length > 0 && selectedCategoryIds.length === 0) {
      setSelectedCategoryIds(categories.map(c => c.id));
    }
  }, [categories]);

  // Extract all available candidate fields across selected categories
  const candidateFields = useMemo(() => {
    const fieldSet = new Set<string>();
    STANDARD_CANDIDATE_FIELDS.forEach(f => fieldSet.add(f));

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

  // Layout distribution helpers
  const getLayoutForCategory = (catId: string): LayoutId => {
    return categoryLayoutOverrides[catId] || defaultLayoutId;
  };

  const hasTableCategories = useMemo(() => {
    return selectedCategoryIds.some(cid => getLayoutForCategory(cid) === 'table-3grid');
  }, [selectedCategoryIds, categoryLayoutOverrides, defaultLayoutId]);

  const hasCardCategories = useMemo(() => {
    return selectedCategoryIds.some(cid => getLayoutForCategory(cid).startsWith('cards-'));
  }, [selectedCategoryIds, categoryLayoutOverrides, defaultLayoutId]);

  // Auto-switch schema tab if only one layout family exists
  useEffect(() => {
    if (hasCardCategories && !hasTableCategories) {
      setActiveSchemaTab('cards');
    } else if (hasTableCategories && !hasCardCategories) {
      setActiveSchemaTab('table');
    }
  }, [hasTableCategories, hasCardCategories]);

  // Category toggle controls
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

  // Layout Override Controls
  const setCategoryOverride = (catId: string, layout: LayoutId | 'inherit') => {
    setCategoryLayoutOverrides(prev => {
      const copy = { ...prev };
      if (layout === 'inherit' || layout === defaultLayoutId) {
        delete copy[catId];
      } else {
        copy[catId] = layout;
      }
      return copy;
    });
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
    setSelectedHeaders([...DEFAULT_HEADERS]);
  };

  // Final Generator trigger
  const handleGenerate = async () => {
    if (name && selectedCategoryIds.length > 0) {
      const defaultTemplate = GRID_TEMPLATES[1] || {
        id: 'grid-2x2',
        name: '2x2 Grid',
        rows: 2,
        cols: 2,
        spacing: 20,
        padding: 40,
        cardTheme: cardFields.cardTheme || 'classic-stack'
      };

      generateCatalogFromTemplate(
        name,
        defaultTemplate as any,
        selectedCategoryIds,
        {
          includeCover,
          coverTemplateId: coverTemplateId || undefined,
          includeIndex: false,
          includeCategoryCovers: false,
          selectedTemplateId: defaultLayoutId === 'table-3grid' ? 'tpl-v-tac' : 'tpl-grid',
          tableHeaders: selectedHeaders,
          categoryLayouts: categoryLayoutOverrides,
          defaultLayoutId,
          headerMode,
          headerTemplateId: headerTemplateId || undefined,
          footerMode,
          footerTemplateId: footerTemplateId || undefined,
          cardFields
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

  const rootCategories = categories.filter(c => !c.parent);
  const filteredCategories = rootCategories.filter(c =>
    !categorySearch ||
    c.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  // Selected categories list for Layout customizer
  const selectedCategoriesList = useMemo(() => {
    return categories
      .filter(c => selectedCategoryIds.includes(c.id))
      .filter(c => !layoutCategoryFilter || c.name.toLowerCase().includes(layoutCategoryFilter.toLowerCase()));
  }, [categories, selectedCategoryIds, layoutCategoryFilter]);

  // Preview data helpers
  const tableCategory = categories.find(c => selectedCategoryIds.includes(c.id) && getLayoutForCategory(c.id) === 'table-3grid') || categories[0];
  const tableProducts = products.filter(p => String(p.categoryId) === String(tableCategory?.id)).slice(0, 3);

  const cardCategory = categories.find(c => selectedCategoryIds.includes(c.id) && getLayoutForCategory(c.id).startsWith('cards-')) || categories[0];
  const cardSampleProduct = products.find(p => String(p.categoryId) === String(cardCategory?.id)) || products[0];

  return {
    setView,
    categories,
    products,
    isDark,
    step,
    setStep,
    name,
    setName,
    categorySearch,
    setCategorySearch,
    selectedCategoryIds,
    setSelectedCategoryIds,
    defaultLayoutId,
    setDefaultLayoutId,
    categoryLayoutOverrides,
    setCategoryLayoutOverrides,
    layoutCategoryFilter,
    setLayoutCategoryFilter,
    activeFramingTab,
    setActiveFramingTab,
    includeCover,
    setIncludeCover,
    coverTemplateId,
    setCoverTemplateId,
    headerMode,
    setHeaderMode,
    headerTemplateId,
    setHeaderTemplateId,
    footerMode,
    setFooterMode,
    footerTemplateId,
    setFooterTemplateId,
    savedHeaderTemplates,
    savedFooterTemplates,
    savedCoverTemplates,
    selectedCoverTemplate,
    selectedHeaderTemplate,
    selectedFooterTemplate,
    activeSchemaTab,
    setActiveSchemaTab,
    selectedHeaders,
    setSelectedHeaders,
    cardFields,
    setCardFields,
    totalSelectedProducts,
    candidateFields,
    getLayoutForCategory,
    hasTableCategories,
    hasCardCategories,
    toggleCategory,
    handleSelectAll,
    handleDeselectAll,
    setCategoryOverride,
    toggleHeader,
    moveHeader,
    removeHeader,
    resetHeadersToDefault,
    handleGenerate,
    phases: PHASES,
    rootCategories,
    filteredCategories,
    selectedCategoriesList,
    tableCategory,
    tableProducts,
    cardCategory,
    cardSampleProduct
  };
};

export type CatalogSetupState = ReturnType<typeof useCatalogSetup>;
