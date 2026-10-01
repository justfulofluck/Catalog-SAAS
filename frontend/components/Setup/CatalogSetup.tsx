import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  ChevronRight,
  FolderOpen,
  CheckCircle2,
  Box,
  BookOpen,
  Layers,
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
  Table,
  LayoutGrid,
  Grid,
  Sparkles,
  Settings2,
  Tag,
  DollarSign,
  Barcode,
  SlidersHorizontal,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { GRID_TEMPLATES } from '../../constants';
import { resolveProductImage } from '../../utils/imageUtils';
import { resolveFieldLabel } from '../../utils/fieldUtils';

type LayoutId = 'table-3grid' | 'cards-2x2' | 'cards-3x3';

interface LayoutOption {
  id: LayoutId;
  name: string;
  badge: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  recommendedFor: string;
}

const LAYOUT_OPTIONS: LayoutOption[] = [
  {
    id: 'table-3grid',
    name: '3-Grid Spec Table',
    badge: 'Technical & B2B',
    description: 'Category Header + Product Photo + Specification Table per section. 3 balanced sections per page.',
    icon: Table,
    recommendedFor: 'Machinery, Hardware, Electrical, Tiles, Industrial & Auto Parts'
  },
  {
    id: 'cards-2x2',
    name: 'Modern Product Cards (2x2)',
    badge: 'Visual Showcase',
    description: '4 spacious showcase cards per page with prominent photo, price tag, SKU, and key highlights.',
    icon: LayoutGrid,
    recommendedFor: 'Fashion, Furniture, Electronics, Retail & FMCG Goods'
  },
  {
    id: 'cards-3x3',
    name: 'Compact Grid Cards (3x3)',
    badge: 'High-Density Catalog',
    description: '9 clean, compact cards per page for broad product selection and rapid visual browsing.',
    icon: Grid,
    recommendedFor: 'Accessories, Jewelry, Spare Components & Wholesale'
  }
];

interface TemplateElementsRendererProps {
  elements: any[];
  width?: number;
  height?: number;
  backgroundColor?: string;
  catalogTitle?: string;
  thumbnail?: string;
  className?: string;
}

const TemplateElementsRenderer: React.FC<TemplateElementsRendererProps> = ({
  elements = [],
  width = 794,
  height = 1123,
  backgroundColor = '#ffffff',
  catalogTitle = '',
  thumbnail,
  className = ''
}) => {
  const sorted = useMemo(() => {
    return [...(elements || [])].sort((a, b) => (Number(a.zIndex) || 0) - (Number(b.zIndex) || 0));
  }, [elements]);

  const replaceMacros = (str: string) => {
    if (!str) return '';
    return str
      .replace(/\{\{page_number\}\}/gi, '1')
      .replace(/\{\{total_pages\}\}/gi, '12')
      .replace(/\{\{catalog_title\}\}/gi, catalogTitle || 'CATALOG 2026')
      .replace(/\{\{category_name\}\}/gi, 'LIGHTING & FIXTURES');
  };

  if ((!elements || elements.length === 0) && thumbnail) {
    return (
      <div className={`relative overflow-hidden w-full h-full ${className}`} style={{ backgroundColor }}>
        <img src={thumbnail} alt="Template Preview" className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden w-full h-full select-none ${className}`}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full block"
        style={{ backgroundColor: backgroundColor || '#ffffff' }}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Base Canvas Background Layer */}
        <rect x={0} y={0} width={width} height={height} fill={backgroundColor || '#ffffff'} />

        {/* Sorted Canvas Elements */}
        {sorted.map((el, i) => {
          const x = Number(el.x) || 0;
          const y = Number(el.y) || 0;
          const w = Number(el.width) || 0;
          const h = Number(el.height) || 0;
          const rot = Number(el.rotation) || 0;
          const op = el.opacity !== undefined ? Number(el.opacity) : 1;
          const fill = el.fill || 'transparent';
          const stroke = el.stroke || 'none';
          const strokeW = Number(el.strokeWidth) || 0;
          const rx = Number(el.cornerRadius || el.rx) || 0;

          const transform = rot ? `rotate(${rot} ${x + w / 2} ${y + h / 2})` : undefined;

          // Shape and Rect Elements
          if (el.type === 'shape' || el.type === 'rect') {
            if (el.shapeType === 'line' || el.type === 'line') {
              const yMid = y + (h > 0 ? h / 2 : 0);
              return (
                <line
                  key={el.id || i}
                  x1={x}
                  y1={yMid}
                  x2={x + w}
                  y2={yMid}
                  stroke={el.stroke || el.fill || '#0f172a'}
                  strokeWidth={strokeW || 2}
                  strokeDasharray={el.strokeDashArray?.join(' ')}
                  opacity={op}
                  transform={transform}
                />
              );
            }
            if (el.shapeType === 'circle') {
              return (
                <ellipse
                  key={el.id || i}
                  cx={x + w / 2}
                  cy={y + h / 2}
                  rx={w / 2}
                  ry={h / 2}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={strokeW}
                  opacity={op}
                  transform={transform}
                />
              );
            }
            if (el.shapeType === 'triangle') {
              return (
                <polygon
                  key={el.id || i}
                  points={`${x + w / 2},${y} ${x + w},${y + h} ${x},${y + h}`}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={strokeW}
                  opacity={op}
                  transform={transform}
                />
              );
            }
            return (
              <rect
                key={el.id || i}
                x={x}
                y={y}
                width={w}
                height={h}
                rx={rx}
                ry={rx}
                fill={fill}
                stroke={stroke}
                strokeWidth={strokeW}
                opacity={op}
                transform={transform}
              />
            );
          }

          // Image Elements
          if (el.type === 'image' && el.src) {
            return (
              <image
                key={el.id || i}
                href={el.src}
                x={x}
                y={y}
                width={w}
                height={h}
                preserveAspectRatio="xMidYMid meet"
                opacity={op}
                transform={transform}
              />
            );
          }

          // Text Elements
          if (el.type === 'text' || el.type === 'textbox') {
            const processedText = replaceMacros(el.text || '');
            const fontSize = Number(el.fontSize) || 14;
            const fontFamily = el.fontFamily || 'Inter, sans-serif';
            const fontWeight = el.fontWeight || 'normal';
            const fontStyle = el.fontStyle || 'normal';
            const textColor = el.fill || '#000000';
            const textAlign = el.textAlign || 'left';
            const letterSpacing = el.letterSpacing ? `${el.letterSpacing}px` : undefined;
            const lineHeight = el.lineHeight || 1.2;

            return (
              <foreignObject
                key={el.id || i}
                x={x}
                y={y}
                width={Math.max(w, 20)}
                height={Math.max(h, fontSize * 1.5)}
                opacity={op}
                transform={transform}
                style={{ overflow: 'visible' }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: el.verticalAlign === 'middle' ? 'center' : el.verticalAlign === 'bottom' ? 'flex-end' : 'flex-start',
                    justifyContent: textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start',
                    color: textColor,
                    fontFamily,
                    fontSize: `${fontSize}px`,
                    fontWeight,
                    fontStyle,
                    textAlign: textAlign as any,
                    letterSpacing,
                    lineHeight,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    pointerEvents: 'none',
                    userSelect: 'none'
                  }}
                >
                  {processedText}
                </div>
              </foreignObject>
            );
          }

          return null;
        })}
      </svg>
    </div>
  );
};

const CatalogSetup: React.FC = () => {
  const { setView, categories, products, generateCatalogFromTemplate, uiTheme, systemTemplates, fetchSystemTemplates } = useStore();
  const isDark = uiTheme === 'dark';

  useEffect(() => {
    if (fetchSystemTemplates) {
      fetchSystemTemplates();
    }
  }, [fetchSystemTemplates]);
  
  // Navigation Stepper State (5 Distinct Phases)
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  // Step 3: Layout State (Master Default + Per-Category Override - Option B)
  const [defaultLayoutId, setDefaultLayoutId] = useState<LayoutId>('table-3grid');
  const [categoryLayoutOverrides, setCategoryLayoutOverrides] = useState<Record<string, LayoutId>>({});
  const [layoutCategoryFilter, setLayoutCategoryFilter] = useState('');

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
  const [selectedHeaders, setSelectedHeaders] = useState<string[]>([
    'MODEL NO',
    'PRODUCTS',
    'PRICE',
    'CUT-OUT',
    'COLOR'
  ]);
  const [cardFields, setCardFields] = useState({
    showPrice: true,
    showSku: true,
    showTitle: true,
    cardTheme: 'classic-stack' as 'classic-stack' | 'editorial-overlay'
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
    setSelectedHeaders(['MODEL NO', 'PRODUCTS', 'PRICE', 'CUT-OUT', 'COLOR']);
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

  const phases = [
    { num: 1, label: 'Identity' },
    { num: 2, label: 'Categories' },
    { num: 3, label: 'Layouts' },
    { num: 4, label: 'Framing & Covers' },
    { num: 5, label: 'Schema Setup' }
  ];

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

  return (
    <div className={`flex-1 flex flex-col h-full w-full overflow-hidden animate-in fade-in duration-500 ${
      isDark ? 'bg-[#100F0F] text-[#F1F1F1]' : 'bg-slate-50 text-slate-800'
    }`}>
      {/* Top Header & Stepper Bar */}
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

        {/* Phase 2: Category Grid */}
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

        {/* Phase 3: Layout Selection (Option B: Master Default + Category Overrides) */}
        {step === 3 && (
          <div className="p-8 w-full space-y-8 flex-1 max-w-7xl mx-auto">
            {/* Part A: Master Default Catalog Layout */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className={`px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded-full border inline-block mb-1.5 ${
                    isDark ? 'bg-[#0F3D3E]/20 text-[#E2DCC8] border-[#0F3D3E]/40' : 'bg-[#0F3D3E]/10 text-[#0F3D3E] border-[#0F3D3E]/30'
                  }`}>
                    Global Master Theme
                  </span>
                  <h2 className={`font-space text-xl sm:text-2xl font-bold tracking-tight ${isDark ? 'text-[#F1F1F1]' : 'text-slate-900'}`}>
                    Choose Default Publication Layout
                  </h2>
                  <p className={`text-xs ${isDark ? 'text-[#E2DCC8]/60' : 'text-slate-500'}`}>
                    This layout will automatically apply across all categories, unless customized below.
                  </p>
                </div>
              </div>

              {/* Layout Option Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {LAYOUT_OPTIONS.map((layout) => {
                  const Icon = layout.icon;
                  const isSelected = defaultLayoutId === layout.id;

                  return (
                    <div
                      key={layout.id}
                      onClick={() => setDefaultLayoutId(layout.id)}
                      className={`rounded-[6px] border p-5 cursor-pointer transition-all flex flex-col justify-between relative group ${
                        isSelected
                          ? 'bg-[#0F3D3E]/20 border-[#0F3D3E] ring-2 ring-[#0F3D3E]/50 shadow-lg'
                          : (isDark 
                              ? 'bg-[#141414] border-[#E2DCC8]/15 hover:border-[#E2DCC8]/30 hover:bg-[#181818]' 
                              : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm')
                      }`}
                    >
                      {/* Check badge */}
                      <div className="absolute top-4 right-4">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                          isSelected 
                            ? 'bg-[#0F3D3E] text-white shadow-sm border border-[#E2DCC8]/40' 
                            : (isDark ? 'border border-[#333] text-transparent' : 'border border-slate-200 text-transparent')
                        }`}>
                          <Check size={11} strokeWidth={3} />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-[5px] flex items-center justify-center ${
                            isSelected 
                              ? 'bg-[#0F3D3E] text-[#E2DCC8]' 
                              : (isDark ? 'bg-[#1c1c1c] text-slate-400 group-hover:text-white' : 'bg-slate-100 text-slate-700')
                          }`}>
                            <Icon size={20} />
                          </div>
                          <div>
                            <span className={`text-[10px] font-bold uppercase tracking-wider block font-mono ${
                              isSelected ? 'text-[#E2DCC8]' : (isDark ? 'text-[#E2DCC8]/60' : 'text-slate-500')
                            }`}>
                              {layout.badge}
                            </span>
                            <h3 className={`font-space text-sm font-bold ${
                              isSelected ? (isDark ? 'text-white' : 'text-[#0F3D3E]') : (isDark ? 'text-[#F1F1F1]' : 'text-slate-900')
                            }`}>
                              {layout.name}
                            </h3>
                          </div>
                        </div>

                        <p className={`text-xs leading-relaxed ${isDark ? 'text-[#E2DCC8]/70' : 'text-slate-600'}`}>
                          {layout.description}
                        </p>
                      </div>

                      <div className={`mt-4 pt-3 border-t text-[11px] font-medium flex items-center gap-1.5 ${
                        isDark ? 'border-[#E2DCC8]/10 text-[#E2DCC8]/50' : 'border-slate-100 text-slate-500'
                      }`}>
                        <Sparkles size={12} className={isSelected ? 'text-[#E2DCC8]' : 'text-slate-400'} />
                        <span className="truncate">Best for: {layout.recommendedFor}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Part B: Category-Level Layout Overrides (Option B) */}
            <div className={`rounded-[6px] border p-6 space-y-5 ${
              isDark ? 'bg-[#141414] border-[#E2DCC8]/15' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className={`font-space text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                      isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'
                    }`}>
                      <SlidersHorizontal size={13} /> Category Layout Assignments ({selectedCategoryIds.length})
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                      Object.keys(categoryLayoutOverrides).length > 0 
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                        : (isDark ? 'bg-white/5 text-[#E2DCC8]/60' : 'bg-slate-100 text-slate-500')
                    }`}>
                      {Object.keys(categoryLayoutOverrides).length} Overridden
                    </span>
                  </div>
                  <p className={`text-xs ${isDark ? 'text-[#E2DCC8]/60' : 'text-slate-500'}`}>
                    Optionally override the layout for specific categories that need a different visual style.
                  </p>
                </div>

                {/* Filter categories */}
                <div className="relative w-56">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-[#E2DCC8]/50' : 'text-slate-400'}`} size={12} />
                  <input
                    type="text"
                    placeholder="Filter selected categories..."
                    value={layoutCategoryFilter}
                    onChange={(e) => setLayoutCategoryFilter(e.target.value)}
                    className={`w-full border rounded-[4px] pl-8 pr-3 py-1.5 text-xs outline-none ${
                      isDark ? 'bg-[#100F0F] border-[#E2DCC8]/20 text-white placeholder-[#E2DCC8]/40' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>
              </div>

              {/* Table / List of Selected Categories */}
              <div className="divide-y max-h-[360px] overflow-y-auto custom-scrollbar border rounded-[4px] overflow-hidden"
                style={{ borderColor: isDark ? 'rgba(226, 220, 200, 0.1)' : '#e2e8f0' }}
              >
                {selectedCategoriesList.map((cat) => {
                  const currentLayout = getLayoutForCategory(cat.id);
                  const isOverridden = Boolean(categoryLayoutOverrides[cat.id]);
                  const catProducts = products.filter(p => String(p.categoryId) === String(cat.id));

                  return (
                    <div
                      key={cat.id}
                      className={`p-3.5 flex flex-wrap items-center justify-between gap-3 transition-colors ${
                        isDark ? 'bg-[#100F0F] hover:bg-[#161616]' : 'bg-white hover:bg-slate-50'
                      }`}
                    >
                      {/* Left: Category info */}
                      <div className="flex items-center gap-3 min-w-[200px]">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color || '#0F3D3E' }} />
                        <div>
                          <h4 className={`text-xs font-bold font-heading ${isDark ? 'text-[#F1F1F1]' : 'text-slate-800'}`}>
                            {cat.name}
                          </h4>
                          <span className={`text-[10px] font-mono ${isDark ? 'text-[#E2DCC8]/50' : 'text-slate-400'}`}>
                            {catProducts.length} {catProducts.length === 1 ? 'Product' : 'Products'}
                          </span>
                        </div>
                      </div>

                      {/* Right: Layout Pill Selector */}
                      <div className="flex items-center gap-2">
                        {/* Inherit Default Master button */}
                        <button
                          type="button"
                          onClick={() => setCategoryOverride(cat.id, 'inherit')}
                          className={`px-2.5 py-1 rounded-[4px] text-[10px] font-bold uppercase tracking-wider border transition-all ${
                            !isOverridden
                              ? 'bg-[#0F3D3E] text-white border-[#E2DCC8]/40 shadow-sm'
                              : (isDark ? 'bg-[#181818] border-[#333] text-[#888] hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-900')
                          }`}
                          title={`Inherit Master Layout (${LAYOUT_OPTIONS.find(l => l.id === defaultLayoutId)?.name})`}
                        >
                          Default ({LAYOUT_OPTIONS.find(l => l.id === defaultLayoutId)?.name.split(' ')[0]})
                        </button>

                        {/* Direct layout options */}
                        {LAYOUT_OPTIONS.map((lo) => {
                          const isLoActive = isOverridden && categoryLayoutOverrides[cat.id] === lo.id;
                          return (
                            <button
                              key={lo.id}
                              type="button"
                              onClick={() => setCategoryOverride(cat.id, lo.id)}
                              className={`px-2.5 py-1 rounded-[4px] text-[10px] font-bold uppercase tracking-wider border transition-all flex items-center gap-1 ${
                                isLoActive
                                  ? 'bg-[#0F3D3E] text-[#E2DCC8] border-[#E2DCC8]/40 shadow-sm'
                                  : (isDark ? 'bg-[#181818] border-[#333] text-[#888] hover:text-[#E2DCC8]' : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-900')
                              }`}
                            >
                              <span>{lo.name.replace('Modern ', '').replace('Compact ', '')}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Phase 4: Dedicated Framing & Covers Studio (Tabs + Template List + Live Side Preview) */}
        {step === 4 && (
          <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
            {/* Left Column: Tab switcher + List of Templates & Options */}
            <div className={`w-full md:w-[440px] lg:w-[480px] border-r flex flex-col h-full shrink-0 ${
              isDark ? 'border-[#E2DCC8]/15 bg-[#141414]' : 'border-slate-200 bg-white'
            }`}>
              {/* Tab Selector Bar */}
              <div className="p-4 border-b flex items-center gap-2" style={{ borderColor: isDark ? 'rgba(226, 220, 200, 0.15)' : '#e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => setActiveFramingTab('cover')}
                  className={`flex-1 py-2 px-2.5 rounded-[4px] font-heading text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border transition-all ${
                    activeFramingTab === 'cover'
                      ? 'bg-[#0F3D3E] text-white border-[#E2DCC8]/40 shadow-sm'
                      : (isDark ? 'bg-[#181818] text-[#888] border-[#222] hover:text-white' : 'bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-900')
                  }`}
                >
                  <BookOpen size={13} />
                  <span>Cover Page</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveFramingTab('header')}
                  className={`flex-1 py-2 px-2.5 rounded-[4px] font-heading text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border transition-all ${
                    activeFramingTab === 'header'
                      ? 'bg-[#0F3D3E] text-white border-[#E2DCC8]/40 shadow-sm'
                      : (isDark ? 'bg-[#181818] text-[#888] border-[#222] hover:text-white' : 'bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-900')
                  }`}
                >
                  <Sliders size={13} />
                  <span>Header</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveFramingTab('footer')}
                  className={`flex-1 py-2 px-2.5 rounded-[4px] font-heading text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border transition-all ${
                    activeFramingTab === 'footer'
                      ? 'bg-[#0F3D3E] text-white border-[#E2DCC8]/40 shadow-sm'
                      : (isDark ? 'bg-[#181818] text-[#888] border-[#222] hover:text-white' : 'bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-900')
                  }`}
                >
                  <SlidersHorizontal size={13} />
                  <span>Footer</span>
                </button>
              </div>

              {/* Template Items List Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {/* TAB 1: COVER PAGE TEMPLATES */}
                {activeFramingTab === 'cover' && (
                  <>
                    {/* Option 1: Blank / None */}
                    <div
                      onClick={() => { setIncludeCover(false); setCoverTemplateId(''); }}
                      className={`p-3.5 rounded-[6px] border cursor-pointer transition-all flex items-center justify-between ${
                        !includeCover
                          ? 'bg-[#0F3D3E]/20 border-[#0F3D3E] ring-2 ring-[#0F3D3E]/50 shadow-md'
                          : (isDark ? 'bg-[#100F0F] border-[#E2DCC8]/15 hover:border-[#E2DCC8]/30' : 'bg-slate-50 border-slate-200 hover:border-slate-300')
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${!includeCover ? 'bg-[#0F3D3E]' : 'bg-slate-400'}`} />
                          <h4 className={`text-xs font-bold font-heading ${!includeCover ? (isDark ? 'text-white' : 'text-[#0F3D3E]') : (isDark ? 'text-[#F1F1F1]' : 'text-slate-800')}`}>
                            Blank (No Cover Page)
                          </h4>
                        </div>
                        <p className={`text-[11px] ${isDark ? 'text-[#E2DCC8]/60' : 'text-slate-500'}`}>
                          Starts immediately on Page 1 with product listings.
                        </p>
                      </div>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${!includeCover ? 'bg-[#0F3D3E] text-white' : 'border border-slate-400 text-transparent'}`}>
                        <Check size={11} strokeWidth={3} />
                      </div>
                    </div>

                    {/* Option 2: Default Themed Cover */}
                    <div
                      onClick={() => { setIncludeCover(true); setCoverTemplateId(''); }}
                      className={`p-3.5 rounded-[6px] border cursor-pointer transition-all flex items-center justify-between ${
                        includeCover && !coverTemplateId
                          ? 'bg-[#0F3D3E]/20 border-[#0F3D3E] ring-2 ring-[#0F3D3E]/50 shadow-md'
                          : (isDark ? 'bg-[#100F0F] border-[#E2DCC8]/15 hover:border-[#E2DCC8]/30' : 'bg-slate-50 border-slate-200 hover:border-slate-300')
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${includeCover && !coverTemplateId ? 'bg-[#0F3D3E]' : 'bg-slate-400'}`} />
                          <h4 className={`text-xs font-bold font-heading ${includeCover && !coverTemplateId ? (isDark ? 'text-white' : 'text-[#0F3D3E]') : (isDark ? 'text-[#F1F1F1]' : 'text-slate-800')}`}>
                            Modern Document Cover
                          </h4>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-mono font-bold">Standard</span>
                        </div>
                        <p className={`text-[11px] ${isDark ? 'text-[#E2DCC8]/60' : 'text-slate-500'}`}>
                          Clean front cover featuring publication title & accents.
                        </p>
                      </div>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${includeCover && !coverTemplateId ? 'bg-[#0F3D3E] text-white' : 'border border-slate-400 text-transparent'}`}>
                        <Check size={11} strokeWidth={3} />
                      </div>
                    </div>

                    {/* Saved Cover Templates */}
                    {savedCoverTemplates.map((tmpl) => {
                      const isSelected = includeCover && String(coverTemplateId) === String(tmpl.id);
                      const elCount = (tmpl.pages_data?.[0]?.elements || tmpl.elements || []).length;
                      return (
                        <div
                          key={tmpl.id}
                          onClick={() => { setIncludeCover(true); setCoverTemplateId(String(tmpl.id)); }}
                          className={`p-3.5 rounded-[6px] border cursor-pointer transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-[#0F3D3E]/20 border-[#0F3D3E] ring-2 ring-[#0F3D3E]/50 shadow-md'
                              : (isDark ? 'bg-[#100F0F] border-[#E2DCC8]/15 hover:border-[#E2DCC8]/30' : 'bg-slate-50 border-slate-200 hover:border-slate-300')
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`w-2.5 h-2.5 rounded-full ${isSelected ? 'bg-[#0F3D3E]' : 'bg-slate-400'}`} />
                              <h4 className={`text-xs font-bold font-heading ${isSelected ? (isDark ? 'text-white' : 'text-[#0F3D3E]') : (isDark ? 'text-[#F1F1F1]' : 'text-slate-800')}`}>
                                {tmpl.name}
                              </h4>
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-500 font-mono font-bold">#{tmpl.id}</span>
                            </div>
                            <p className={`text-[11px] ${isDark ? 'text-[#E2DCC8]/60' : 'text-slate-500'}`}>
                              {tmpl.category || 'Standard'} • {elCount} elements
                            </p>
                          </div>
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isSelected ? 'bg-[#0F3D3E] text-white' : 'border border-slate-400 text-transparent'}`}>
                            <Check size={11} strokeWidth={3} />
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}

                {/* TAB 2: HEADER TEMPLATES */}
                {activeFramingTab === 'header' && (
                  <>
                    {/* Option 1: Blank / None */}
                    <div
                      onClick={() => { setHeaderMode('none'); setHeaderTemplateId(''); }}
                      className={`p-3.5 rounded-[6px] border cursor-pointer transition-all flex items-center justify-between ${
                        headerMode === 'none'
                          ? 'bg-[#0F3D3E]/20 border-[#0F3D3E] ring-2 ring-[#0F3D3E]/50 shadow-md'
                          : (isDark ? 'bg-[#100F0F] border-[#E2DCC8]/15 hover:border-[#E2DCC8]/30' : 'bg-slate-50 border-slate-200 hover:border-slate-300')
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${headerMode === 'none' ? 'bg-[#0F3D3E]' : 'bg-slate-400'}`} />
                          <h4 className={`text-xs font-bold font-heading ${headerMode === 'none' ? (isDark ? 'text-white' : 'text-[#0F3D3E]') : (isDark ? 'text-[#F1F1F1]' : 'text-slate-800')}`}>
                            Blank (No Running Header)
                          </h4>
                        </div>
                        <p className={`text-[11px] ${isDark ? 'text-[#E2DCC8]/60' : 'text-slate-500'}`}>
                          No top header band. Edge-to-edge room for product listings.
                        </p>
                      </div>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${headerMode === 'none' ? 'bg-[#0F3D3E] text-white' : 'border border-slate-400 text-transparent'}`}>
                        <Check size={11} strokeWidth={3} />
                      </div>
                    </div>

                    {/* Option 2: Default Title Header */}
                    <div
                      onClick={() => { setHeaderMode('default'); setHeaderTemplateId(''); }}
                      className={`p-3.5 rounded-[6px] border cursor-pointer transition-all flex items-center justify-between ${
                        headerMode === 'default'
                          ? 'bg-[#0F3D3E]/20 border-[#0F3D3E] ring-2 ring-[#0F3D3E]/50 shadow-md'
                          : (isDark ? 'bg-[#100F0F] border-[#E2DCC8]/15 hover:border-[#E2DCC8]/30' : 'bg-slate-50 border-slate-200 hover:border-slate-300')
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${headerMode === 'default' ? 'bg-[#0F3D3E]' : 'bg-slate-400'}`} />
                          <h4 className={`text-xs font-bold font-heading ${headerMode === 'default' ? (isDark ? 'text-white' : 'text-[#0F3D3E]') : (isDark ? 'text-[#F1F1F1]' : 'text-slate-800')}`}>
                            Dynamic Title Header
                          </h4>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-mono font-bold">Standard</span>
                        </div>
                        <p className={`text-[11px] ${isDark ? 'text-[#E2DCC8]/60' : 'text-slate-500'}`}>
                          Displays catalog publication title centered at page top.
                        </p>
                      </div>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${headerMode === 'default' ? 'bg-[#0F3D3E] text-white' : 'border border-slate-400 text-transparent'}`}>
                        <Check size={11} strokeWidth={3} />
                      </div>
                    </div>

                    {/* Saved Header Templates */}
                    {savedHeaderTemplates.map((tmpl) => {
                      const isSelected = headerMode === 'template' && String(headerTemplateId) === String(tmpl.id);
                      const height = tmpl.pages_data?.[0]?.height || 113.4;
                      const elCount = (tmpl.pages_data?.[0]?.elements || tmpl.elements || []).length;
                      return (
                        <div
                          key={tmpl.id}
                          onClick={() => { setHeaderMode('template'); setHeaderTemplateId(String(tmpl.id)); }}
                          className={`p-3.5 rounded-[6px] border cursor-pointer transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-[#0F3D3E]/20 border-[#0F3D3E] ring-2 ring-[#0F3D3E]/50 shadow-md'
                              : (isDark ? 'bg-[#100F0F] border-[#E2DCC8]/15 hover:border-[#E2DCC8]/30' : 'bg-slate-50 border-slate-200 hover:border-slate-300')
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`w-2.5 h-2.5 rounded-full ${isSelected ? 'bg-[#0F3D3E]' : 'bg-slate-400'}`} />
                              <h4 className={`text-xs font-bold font-heading ${isSelected ? (isDark ? 'text-white' : 'text-[#0F3D3E]') : (isDark ? 'text-[#F1F1F1]' : 'text-slate-800')}`}>
                                {tmpl.name}
                              </h4>
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-500 font-mono font-bold">#{tmpl.id}</span>
                            </div>
                            <p className={`text-[11px] ${isDark ? 'text-[#E2DCC8]/60' : 'text-slate-500'}`}>
                              {tmpl.category || 'Custom'} • {Math.round(height / 3.78)}mm ({Math.round(height)}px) • {elCount} elements
                            </p>
                          </div>
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isSelected ? 'bg-[#0F3D3E] text-white' : 'border border-slate-400 text-transparent'}`}>
                            <Check size={11} strokeWidth={3} />
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}

                {/* TAB 3: FOOTER TEMPLATES */}
                {activeFramingTab === 'footer' && (
                  <>
                    {/* Option 1: Blank / None */}
                    <div
                      onClick={() => { setFooterMode('none'); setFooterTemplateId(''); }}
                      className={`p-3.5 rounded-[6px] border cursor-pointer transition-all flex items-center justify-between ${
                        footerMode === 'none'
                          ? 'bg-[#0F3D3E]/20 border-[#0F3D3E] ring-2 ring-[#0F3D3E]/50 shadow-md'
                          : (isDark ? 'bg-[#100F0F] border-[#E2DCC8]/15 hover:border-[#E2DCC8]/30' : 'bg-slate-50 border-slate-200 hover:border-slate-300')
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${footerMode === 'none' ? 'bg-[#0F3D3E]' : 'bg-slate-400'}`} />
                          <h4 className={`text-xs font-bold font-heading ${footerMode === 'none' ? (isDark ? 'text-white' : 'text-[#0F3D3E]') : (isDark ? 'text-[#F1F1F1]' : 'text-slate-800')}`}>
                            Blank (No Running Footer)
                          </h4>
                        </div>
                        <p className={`text-[11px] ${isDark ? 'text-[#E2DCC8]/60' : 'text-slate-500'}`}>
                          No bottom footer bar on interior product pages.
                        </p>
                      </div>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${footerMode === 'none' ? 'bg-[#0F3D3E] text-white' : 'border border-slate-400 text-transparent'}`}>
                        <Check size={11} strokeWidth={3} />
                      </div>
                    </div>

                    {/* Option 2: Default Page Numbers */}
                    <div
                      onClick={() => { setFooterMode('default'); setFooterTemplateId(''); }}
                      className={`p-3.5 rounded-[6px] border cursor-pointer transition-all flex items-center justify-between ${
                        footerMode === 'default'
                          ? 'bg-[#0F3D3E]/20 border-[#0F3D3E] ring-2 ring-[#0F3D3E]/50 shadow-md'
                          : (isDark ? 'bg-[#100F0F] border-[#E2DCC8]/15 hover:border-[#E2DCC8]/30' : 'bg-slate-50 border-slate-200 hover:border-slate-300')
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${footerMode === 'default' ? 'bg-[#0F3D3E]' : 'bg-slate-400'}`} />
                          <h4 className={`text-xs font-bold font-heading ${footerMode === 'default' ? (isDark ? 'text-white' : 'text-[#0F3D3E]') : (isDark ? 'text-[#F1F1F1]' : 'text-slate-800')}`}>
                            Standard Page Numbers
                          </h4>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-mono font-bold">Standard</span>
                        </div>
                        <p className={`text-[11px] ${isDark ? 'text-[#E2DCC8]/60' : 'text-slate-500'}`}>
                          Dynamic Page numbers (Page 1, 2, 3...) right-aligned.
                        </p>
                      </div>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${footerMode === 'default' ? 'bg-[#0F3D3E] text-white' : 'border border-slate-400 text-transparent'}`}>
                        <Check size={11} strokeWidth={3} />
                      </div>
                    </div>

                    {/* Saved Footer Templates */}
                    {savedFooterTemplates.map((tmpl) => {
                      const isSelected = footerMode === 'template' && String(footerTemplateId) === String(tmpl.id);
                      const height = tmpl.pages_data?.[0]?.height || 57;
                      const elCount = (tmpl.pages_data?.[0]?.elements || tmpl.elements || []).length;
                      return (
                        <div
                          key={tmpl.id}
                          onClick={() => { setFooterMode('template'); setFooterTemplateId(String(tmpl.id)); }}
                          className={`p-3.5 rounded-[6px] border cursor-pointer transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-[#0F3D3E]/20 border-[#0F3D3E] ring-2 ring-[#0F3D3E]/50 shadow-md'
                              : (isDark ? 'bg-[#100F0F] border-[#E2DCC8]/15 hover:border-[#E2DCC8]/30' : 'bg-slate-50 border-slate-200 hover:border-slate-300')
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`w-2.5 h-2.5 rounded-full ${isSelected ? 'bg-[#0F3D3E]' : 'bg-slate-400'}`} />
                              <h4 className={`text-xs font-bold font-heading ${isSelected ? (isDark ? 'text-white' : 'text-[#0F3D3E]') : (isDark ? 'text-[#F1F1F1]' : 'text-slate-800')}`}>
                                {tmpl.name}
                              </h4>
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-500 font-mono font-bold">#{tmpl.id}</span>
                            </div>
                            <p className={`text-[11px] ${isDark ? 'text-[#E2DCC8]/60' : 'text-slate-500'}`}>
                              {tmpl.category || 'Custom'} • {Math.round(height / 3.78)}mm ({Math.round(height)}px) • {elCount} elements
                            </p>
                          </div>
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isSelected ? 'bg-[#0F3D3E] text-white' : 'border border-slate-400 text-transparent'}`}>
                            <Check size={11} strokeWidth={3} />
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </div>

            {/* Right Column: High-Fidelity Live Visual Preview */}
            <div className={`flex-1 p-6 md:p-8 flex flex-col items-center justify-start overflow-y-auto ${
              isDark ? 'bg-[#0a0a0a]' : 'bg-slate-100/70'
            }`}>
              {/* Preview Header Label */}
              <div className="w-full max-w-2xl flex items-center justify-between mb-4 pb-2 border-b" style={{ borderColor: isDark ? 'rgba(226,220,200,0.1)' : '#e2e8f0' }}>
                <span className={`text-xs font-bold uppercase tracking-wider font-heading flex items-center gap-1.5 ${
                  isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'
                }`}>
                  <Eye size={15} />
                  <span>
                    Live Visual Preview • {activeFramingTab === 'cover' ? 'Front Cover Page' : (activeFramingTab === 'header' ? 'Running Header' : 'Running Footer')}
                  </span>
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                  isDark ? 'bg-[#181818] text-[#E2DCC8]/70' : 'bg-white text-slate-600 shadow-sm border border-slate-200'
                }`}>
                  {activeFramingTab === 'cover' && (!includeCover ? 'Status: Blank' : (!coverTemplateId ? 'Standard Cover' : `Template: ${selectedCoverTemplate?.name || 'Selected'}`))}
                  {activeFramingTab === 'header' && (headerMode === 'none' ? 'Status: Blank' : (headerMode === 'default' ? 'Standard Header' : `Template: ${selectedHeaderTemplate?.name || 'Selected'}`))}
                  {activeFramingTab === 'footer' && (footerMode === 'none' ? 'Status: Blank' : (footerMode === 'default' ? 'Standard Footer' : `Template: ${selectedFooterTemplate?.name || 'Selected'}`))}
                </span>
              </div>

              {/* 1. COVER PREVIEW */}
              {activeFramingTab === 'cover' && (
                <div className="w-full max-w-md flex flex-col items-center justify-center my-auto py-2">
                  {!includeCover ? (
                    /* Blank Cover Placeholder */
                    <div className={`w-full aspect-[1/1.414] rounded-[8px] border-2 border-dashed flex flex-col items-center justify-center p-8 text-center space-y-3 ${
                      isDark ? 'border-[#333] bg-[#141414]/50 text-[#888]' : 'border-slate-300 bg-white text-slate-500'
                    }`}>
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isDark ? 'bg-[#1e1e1e]' : 'bg-slate-100'}`}>
                        <BookOpen size={26} className="opacity-40" />
                      </div>
                      <h4 className="font-space text-sm font-bold">No Front Cover Page</h4>
                      <p className="text-xs max-w-xs leading-relaxed opacity-75">
                        Your catalog will open directly on Page 1 with product sections.
                      </p>
                    </div>
                  ) : selectedCoverTemplate ? (
                    /* Real Saved Cover Template Rendered with Canvas Elements */
                    <div className="w-full aspect-[1/1.414] rounded-[8px] border border-slate-300 dark:border-slate-800 bg-white shadow-2xl overflow-hidden relative">
                      <TemplateElementsRenderer
                        elements={selectedCoverTemplate.pages_data?.[0]?.elements || selectedCoverTemplate.elements || []}
                        width={794}
                        height={selectedCoverTemplate.pages_data?.[0]?.height || 1123}
                        backgroundColor={selectedCoverTemplate.pages_data?.[0]?.backgroundColor || selectedCoverTemplate.backgroundColor || '#ffffff'}
                        catalogTitle={name}
                        thumbnail={selectedCoverTemplate.thumbnail}
                      />
                    </div>
                  ) : (
                    /* Default Modern Cover Page */
                    <div className="w-full aspect-[1/1.414] rounded-[8px] border border-slate-200 bg-white shadow-2xl p-7 flex flex-col justify-between relative overflow-hidden text-slate-900">
                      {/* Top Branding Tag */}
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                          OFFICIAL CATALOGUE
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          2026 EDITION
                        </span>
                      </div>

                      {/* Center Title Display */}
                      <div className="my-auto space-y-3">
                        <div className="w-12 h-1.5 bg-[#0F3D3E] rounded-full" />
                        <h2 className="font-space text-2xl font-black uppercase tracking-tight text-slate-900 leading-tight">
                          {name || 'PRODUCT SPECIFICATION CATALOG'}
                        </h2>
                        <p className="text-xs font-medium text-slate-500 font-heading">
                          Complete Technical Data, Dimensions & Engineering Specifications
                        </p>
                      </div>

                      {/* Bottom Footer Info on Cover */}
                      <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span>{selectedCategoryIds.length} Selected Categories</span>
                        <span>{totalSelectedProducts} Products</span>
                      </div>
                    </div>
                  )}

                  {includeCover && (
                    <div className="mt-3 flex items-center gap-2 text-[10px] font-mono text-slate-400">
                      <span>A4 Portrait (794 × 1123px)</span>
                      <span>•</span>
                      <span>{selectedCoverTemplate ? (selectedCoverTemplate.pages_data?.[0]?.elements || []).length + ' elements' : 'Standard Layout'}</span>
                    </div>
                  )}
                </div>
              )}

              {/* 2. HEADER PREVIEW */}
              {activeFramingTab === 'header' && (
                <div className="w-full max-w-2xl flex flex-col items-center space-y-5">
                  {headerMode === 'none' ? (
                    <div className={`w-full py-16 px-6 rounded-[8px] border-2 border-dashed flex flex-col items-center justify-center text-center space-y-3 ${
                      isDark ? 'border-[#333] bg-[#141414]/50 text-[#888]' : 'border-slate-300 bg-white text-slate-500'
                    }`}>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? 'bg-[#1e1e1e]' : 'bg-slate-100'}`}>
                        <Sliders size={22} className="opacity-40" />
                      </div>
                      <h4 className="font-space text-sm font-bold">Blank Running Header</h4>
                      <p className="text-xs max-w-sm leading-relaxed opacity-75">
                        Pages will have zero header band, giving full vertical canvas height to product tables and cards.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* 1. Magnified Close-Up Strip */}
                      <div className="w-full rounded-[8px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#141414] shadow-xl overflow-hidden p-2">
                        <div className="text-[10px] font-mono px-2 py-1 font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between border-b mb-2" style={{ borderColor: isDark ? '#262626' : '#f1f5f9' }}>
                          <span>Magnified Header Detail View</span>
                          <span>
                            {headerMode === 'template' && selectedHeaderTemplate 
                              ? `${Math.round((selectedHeaderTemplate.pages_data?.[0]?.height || 113.4) / 3.78)}mm (${Math.round(selectedHeaderTemplate.pages_data?.[0]?.height || 113.4)}px)`
                              : 'Standard 15mm'}
                          </span>
                        </div>

                        {headerMode === 'template' && selectedHeaderTemplate ? (
                          <div 
                            style={{ aspectRatio: `794 / ${Math.max(selectedHeaderTemplate.pages_data?.[0]?.height || 113.4, 40)}` }}
                            className="w-full rounded border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm"
                          >
                            <TemplateElementsRenderer
                              elements={selectedHeaderTemplate.pages_data?.[0]?.elements || selectedHeaderTemplate.elements || []}
                              width={794}
                              height={selectedHeaderTemplate.pages_data?.[0]?.height || 113.4}
                              backgroundColor={selectedHeaderTemplate.pages_data?.[0]?.backgroundColor || '#ffffff'}
                              catalogTitle={name}
                            />
                          </div>
                        ) : (
                          /* Standard Dynamic Title Header */
                          <div className="w-full h-14 px-6 border rounded flex items-center justify-between bg-white text-slate-900 border-slate-200 shadow-sm">
                            <div className="flex items-center gap-2.5">
                              <div className="w-2.5 h-2.5 rounded-full bg-[#0F3D3E]" />
                              <span className="font-space text-xs font-bold tracking-wider uppercase text-slate-900">
                                {name || 'CATALOG PUBLICATION 2026'}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400">Page 1</span>
                          </div>
                        )}
                      </div>

                      {/* 2. In-Context A4 Page Placement Mockup */}
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2 font-bold flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span>Page Context Preview (Placement at top)</span>
                        </span>
                        <div className="w-[300px] aspect-[1/1.414] rounded-[6px] border border-slate-300 dark:border-slate-800 bg-white shadow-2xl overflow-hidden flex flex-col text-slate-900 relative">
                          {/* Header Slot with highlight ring */}
                          <div className="w-full shrink-0 relative ring-2 ring-emerald-500/80 shadow-sm">
                            {headerMode === 'template' && selectedHeaderTemplate ? (
                              <div style={{ height: `${((selectedHeaderTemplate.pages_data?.[0]?.height || 113.4) / 1123) * 100}%`, minHeight: '32px' }}>
                                <TemplateElementsRenderer
                                  elements={selectedHeaderTemplate.pages_data?.[0]?.elements || selectedHeaderTemplate.elements || []}
                                  width={794}
                                  height={selectedHeaderTemplate.pages_data?.[0]?.height || 113.4}
                                  backgroundColor={selectedHeaderTemplate.pages_data?.[0]?.backgroundColor || '#ffffff'}
                                  catalogTitle={name}
                                />
                              </div>
                            ) : (
                              <div className="h-8 px-3 border-b flex items-center justify-between bg-slate-50 text-slate-800 text-[8px] font-mono">
                                <span className="font-bold truncate max-w-[180px]">{name || 'CATALOG 2026'}</span>
                                <span className="text-slate-400">Page 1</span>
                              </div>
                            )}
                          </div>

                          {/* Interior Mock Body */}
                          <div className="flex-1 p-3 space-y-2 overflow-hidden bg-white text-slate-900">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                              <span className="text-[8px] font-bold text-slate-700 uppercase font-heading">Product Category 1</span>
                              <span className="text-[7px] font-mono text-slate-400">Specifications</span>
                            </div>
                            {[1, 2, 3].map(item => (
                              <div key={item} className="flex items-center gap-2 p-1 rounded border border-slate-100 bg-slate-50">
                                <div className="w-7 h-7 rounded bg-slate-200 shrink-0 flex items-center justify-center text-slate-400">
                                  <Package size={10} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[7px] font-bold font-mono">PROD-00{item}</span>
                                    <span className="text-[7px] font-bold text-emerald-600 font-mono">$3{item}.00</span>
                                  </div>
                                  <div className="w-full bg-slate-200 h-1 rounded my-0.5 opacity-60" />
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Footer Mock */}
                          <div className="h-6 px-3 border-t flex items-center justify-between bg-slate-50 text-[7px] font-mono text-slate-400 shrink-0">
                            <span>{name || 'Catalog'}</span>
                            <span>Page 1</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* 3. FOOTER PREVIEW */}
              {activeFramingTab === 'footer' && (
                <div className="w-full max-w-2xl flex flex-col items-center space-y-5">
                  {footerMode === 'none' ? (
                    <div className={`w-full py-16 px-6 rounded-[8px] border-2 border-dashed flex flex-col items-center justify-center text-center space-y-3 ${
                      isDark ? 'border-[#333] bg-[#141414]/50 text-[#888]' : 'border-slate-300 bg-white text-slate-500'
                    }`}>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? 'bg-[#1e1e1e]' : 'bg-slate-100'}`}>
                        <SlidersHorizontal size={22} className="opacity-40" />
                      </div>
                      <h4 className="font-space text-sm font-bold">Blank Running Footer</h4>
                      <p className="text-xs max-w-sm leading-relaxed opacity-75">
                        Pages will have no bottom running footer bar.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* 1. Magnified Close-Up Strip */}
                      <div className="w-full rounded-[8px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#141414] shadow-xl overflow-hidden p-2">
                        <div className="text-[10px] font-mono px-2 py-1 font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between border-b mb-2" style={{ borderColor: isDark ? '#262626' : '#f1f5f9' }}>
                          <span>Magnified Footer Detail View</span>
                          <span>
                            {footerMode === 'template' && selectedFooterTemplate 
                              ? `${Math.round((selectedFooterTemplate.pages_data?.[0]?.height || 57) / 3.78)}mm (${Math.round(selectedFooterTemplate.pages_data?.[0]?.height || 57)}px)`
                              : 'Standard 10mm'}
                          </span>
                        </div>

                        {footerMode === 'template' && selectedFooterTemplate ? (
                          <div 
                            style={{ aspectRatio: `794 / ${Math.max(selectedFooterTemplate.pages_data?.[0]?.height || 57, 30)}` }}
                            className="w-full rounded border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm"
                          >
                            <TemplateElementsRenderer
                              elements={selectedFooterTemplate.pages_data?.[0]?.elements || selectedFooterTemplate.elements || []}
                              width={794}
                              height={selectedFooterTemplate.pages_data?.[0]?.height || 57}
                              backgroundColor={selectedFooterTemplate.pages_data?.[0]?.backgroundColor || '#ffffff'}
                              catalogTitle={name}
                            />
                          </div>
                        ) : (
                          /* Standard Page Numbers Footer */
                          <div className="w-full h-10 px-6 border rounded flex items-center justify-between bg-white text-slate-900 border-slate-200 shadow-sm">
                            <span className="text-[10px] font-mono text-slate-400 uppercase">
                              {name || 'CONFIDENTIAL & PROPRIETARY'}
                            </span>
                            <span className="text-[10px] font-mono font-bold text-slate-800">
                              Page 1
                            </span>
                          </div>
                        )}
                      </div>

                      {/* 2. In-Context A4 Page Placement Mockup */}
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2 font-bold flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span>Page Context Preview (Placement at bottom)</span>
                        </span>
                        <div className="w-[300px] aspect-[1/1.414] rounded-[6px] border border-slate-300 dark:border-slate-800 bg-white shadow-2xl overflow-hidden flex flex-col justify-between text-slate-900 relative">
                          {/* Top Header Mock */}
                          <div className="h-8 px-3 border-b flex items-center justify-between bg-slate-50 text-[8px] font-mono text-slate-700 shrink-0">
                            <span className="font-bold truncate max-w-[180px]">{name || 'CATALOG 2026'}</span>
                            <span className="text-slate-400">Page 1</span>
                          </div>

                          {/* Interior Mock Body */}
                          <div className="flex-1 p-3 space-y-2 overflow-hidden bg-white text-slate-900">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                              <span className="text-[8px] font-bold text-slate-700 uppercase font-heading">Product Category 1</span>
                              <span className="text-[7px] font-mono text-slate-400">Specifications</span>
                            </div>
                            {[1, 2, 3].map(item => (
                              <div key={item} className="flex items-center gap-2 p-1 rounded border border-slate-100 bg-slate-50">
                                <div className="w-7 h-7 rounded bg-slate-200 shrink-0 flex items-center justify-center text-slate-400">
                                  <Package size={10} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[7px] font-bold font-mono">PROD-00{item}</span>
                                    <span className="text-[7px] font-bold text-emerald-600 font-mono">$3{item}.00</span>
                                  </div>
                                  <div className="w-full bg-slate-200 h-1 rounded my-0.5 opacity-60" />
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Footer Slot with highlight ring */}
                          <div className="w-full shrink-0 relative ring-2 ring-emerald-500/80 shadow-sm">
                            {footerMode === 'template' && selectedFooterTemplate ? (
                              <div style={{ height: `${((selectedFooterTemplate.pages_data?.[0]?.height || 57) / 1123) * 100}%`, minHeight: '20px' }}>
                                <TemplateElementsRenderer
                                  elements={selectedFooterTemplate.pages_data?.[0]?.elements || selectedFooterTemplate.elements || []}
                                  width={794}
                                  height={selectedFooterTemplate.pages_data?.[0]?.height || 57}
                                  backgroundColor={selectedFooterTemplate.pages_data?.[0]?.backgroundColor || '#ffffff'}
                                  catalogTitle={name}
                                />
                              </div>
                            ) : (
                              <div className="h-6 px-3 border-t flex items-center justify-between bg-slate-50 text-slate-800 text-[7px] font-mono">
                                <span className="text-slate-500 truncate max-w-[180px]">{name || 'CONFIDENTIAL'}</span>
                                <span className="font-bold text-slate-800">Page 1</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Phase 5: Schema & Settings Builder (Smart Adaptive for Table & Cards) */}
        {step === 5 && (
          <div className="p-8 w-full space-y-6 flex-1 max-w-none">
            {/* If user has mixed layouts, show Tab Switcher */}
            {hasTableCategories && hasCardCategories && (
              <div className="flex items-center gap-3 border-b pb-3" style={{ borderColor: isDark ? 'rgba(226, 220, 200, 0.15)' : '#e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => setActiveSchemaTab('table')}
                  className={`px-4 py-2 rounded-[4px] font-heading text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all border ${
                    activeSchemaTab === 'table'
                      ? 'bg-[#0F3D3E] text-white border-[#E2DCC8]/40 shadow-sm'
                      : (isDark ? 'bg-[#141414] text-[#888] border-[#222] hover:text-white' : 'bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-900')
                  }`}
                >
                  <Table size={14} />
                  <span>Specification Table Columns</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${activeSchemaTab === 'table' ? 'bg-white/20 text-white' : 'bg-black/20 text-slate-400'}`}>
                    {selectedCategoryIds.filter(cid => getLayoutForCategory(cid) === 'table-3grid').length} categories
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSchemaTab('cards')}
                  className={`px-4 py-2 rounded-[4px] font-heading text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all border ${
                    activeSchemaTab === 'cards'
                      ? 'bg-[#0F3D3E] text-white border-[#E2DCC8]/40 shadow-sm'
                      : (isDark ? 'bg-[#141414] text-[#888] border-[#222] hover:text-white' : 'bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-900')
                  }`}
                >
                  <LayoutGrid size={14} />
                  <span>Product Card Settings</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${activeSchemaTab === 'cards' ? 'bg-white/20 text-white' : 'bg-black/20 text-slate-400'}`}>
                    {selectedCategoryIds.filter(cid => getLayoutForCategory(cid).startsWith('cards-')).length} categories
                  </span>
                </button>
              </div>
            )}

            {/* TAB 1: Specification Table Columns Setup */}
            {activeSchemaTab === 'table' && hasTableCategories && (
              <div className="space-y-6 animate-in fade-in duration-300">
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
                      <Eye size={14} /> Live Table Preview ({tableCategory?.name || 'Specification Table'})
                    </span>
                    <span className={`text-[10px] font-mono ${isDark ? 'text-[#E2DCC8]/50' : 'text-slate-500'}`}>
                      Preview generated using real category schema
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
                        {tableProducts.length > 0 ? (
                          tableProducts.map((p, rIdx) => {
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
                                  {hdr.includes('MODEL') ? 'VT-101' : (hdr.includes('PRODUCT') ? 'Sample Item' : (hdr.includes('PRICE') ? '₹1200' : '-'))}
                                </td>
                              ))}
                            </tr>
                            <tr className={isDark ? 'bg-[#100F0F]' : 'bg-white'}>
                              <td className="p-3.5 text-center text-slate-400 font-mono text-[10px]">2</td>
                              {selectedHeaders.map((hdr, cIdx) => (
                                <td key={cIdx} className="p-3.5 font-medium text-slate-300">
                                  {hdr.includes('MODEL') ? 'VT-102' : (hdr.includes('PRODUCT') ? 'Sample Item' : (hdr.includes('PRICE') ? '₹1450' : '-'))}
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

            {/* TAB 2: Product Card Settings */}
            {activeSchemaTab === 'cards' && hasCardCategories && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Card Display Controls */}
                  <div className={`rounded-[4px] border p-6 space-y-5 ${
                    isDark ? 'bg-[#141414] border-[#E2DCC8]/15' : 'bg-white border-slate-200 shadow-sm'
                  }`}>
                    <div className="space-y-1">
                      <span className={`font-space text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
                        isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'
                      }`}>
                        <Settings2 size={13} /> Product Card Field Toggles
                      </span>
                      <p className={`text-xs ${isDark ? 'text-[#E2DCC8]/60' : 'text-slate-500'}`}>
                        Configure which elements appear on cards in card-grid pages.
                      </p>
                    </div>

                    <div className="space-y-3 pt-2">
                      {/* Show Title */}
                      <div className={`flex items-center justify-between p-3.5 rounded-[4px] border transition-colors ${
                        isDark ? 'bg-[#100F0F] border-[#E2DCC8]/15' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <div>
                          <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Display Product Name</h4>
                          <p className={`text-[11px] ${isDark ? 'text-[#E2DCC8]/50' : 'text-slate-500'}`}>Show primary product title on the card</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCardFields(prev => ({ ...prev, showTitle: !prev.showTitle }))}
                          className={`w-10 h-5 rounded-full transition-colors relative ${
                            cardFields.showTitle ? 'bg-[#0F3D3E]' : (isDark ? 'bg-[#333]' : 'bg-slate-300')
                          }`}
                        >
                          <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                            cardFields.showTitle ? 'right-1' : 'left-1'
                          }`} />
                        </button>
                      </div>

                      {/* Show Price */}
                      <div className={`flex items-center justify-between p-3.5 rounded-[4px] border transition-colors ${
                        isDark ? 'bg-[#100F0F] border-[#E2DCC8]/15' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <div>
                          <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Display Price Tag</h4>
                          <p className={`text-[11px] ${isDark ? 'text-[#E2DCC8]/50' : 'text-slate-500'}`}>Show currency and price badge on card</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCardFields(prev => ({ ...prev, showPrice: !prev.showPrice }))}
                          className={`w-10 h-5 rounded-full transition-colors relative ${
                            cardFields.showPrice ? 'bg-[#0F3D3E]' : (isDark ? 'bg-[#333]' : 'bg-slate-300')
                          }`}
                        >
                          <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                            cardFields.showPrice ? 'right-1' : 'left-1'
                          }`} />
                        </button>
                      </div>

                      {/* Show SKU */}
                      <div className={`flex items-center justify-between p-3.5 rounded-[4px] border transition-colors ${
                        isDark ? 'bg-[#100F0F] border-[#E2DCC8]/15' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <div>
                          <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Display Model / SKU Code</h4>
                          <p className={`text-[11px] ${isDark ? 'text-[#E2DCC8]/50' : 'text-slate-500'}`}>Show unique item identifier code</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCardFields(prev => ({ ...prev, showSku: !prev.showSku }))}
                          className={`w-10 h-5 rounded-full transition-colors relative ${
                            cardFields.showSku ? 'bg-[#0F3D3E]' : (isDark ? 'bg-[#333]' : 'bg-slate-300')
                          }`}
                        >
                          <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                            cardFields.showSku ? 'right-1' : 'left-1'
                          }`} />
                        </button>
                      </div>

                      {/* Card Theme */}
                      <div className={`p-3.5 rounded-[4px] border space-y-2.5 ${
                        isDark ? 'bg-[#100F0F] border-[#E2DCC8]/15' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Card Visual Style</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setCardFields(prev => ({ ...prev, cardTheme: 'classic-stack' }))}
                            className={`py-2 px-3 rounded-[4px] text-xs font-bold uppercase tracking-wider border transition-all ${
                              cardFields.cardTheme === 'classic-stack'
                                ? 'bg-[#0F3D3E] text-white border-[#E2DCC8]/40 shadow-sm'
                                : (isDark ? 'bg-[#181818] border-[#333] text-[#888]' : 'bg-white border-slate-200 text-slate-600')
                            }`}
                          >
                            Classic Clean
                          </button>
                          <button
                            type="button"
                            onClick={() => setCardFields(prev => ({ ...prev, cardTheme: 'editorial-overlay' }))}
                            className={`py-2 px-3 rounded-[4px] text-xs font-bold uppercase tracking-wider border transition-all ${
                              cardFields.cardTheme === 'editorial-overlay'
                                ? 'bg-[#0F3D3E] text-white border-[#E2DCC8]/40 shadow-sm'
                                : (isDark ? 'bg-[#181818] border-[#333] text-[#888]' : 'bg-white border-slate-200 text-slate-600')
                            }`}
                          >
                            Dark Luxe
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Live Card Preview */}
                  <div className={`rounded-[4px] border p-6 flex flex-col justify-between ${
                    isDark ? 'bg-[#141414] border-[#E2DCC8]/15' : 'bg-white border-slate-200 shadow-sm'
                  }`}>
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className={`font-space text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                          isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'
                        }`}>
                          <Eye size={13} /> Live Product Card Preview
                        </span>
                        <span className={`text-[10px] font-mono ${isDark ? 'text-[#E2DCC8]/50' : 'text-slate-500'}`}>
                          {cardCategory?.name || 'Card Layout Category'}
                        </span>
                      </div>

                      {/* Mockup Card Box */}
                      <div className="flex justify-center p-6 bg-slate-900/50 rounded-[4px] border border-white/5">
                        <div className={`w-64 rounded-[6px] border p-4 shadow-xl space-y-3 transition-all ${
                          cardFields.cardTheme === 'editorial-overlay' 
                            ? 'bg-[#0f172a] text-white border-slate-700' 
                            : 'bg-white text-slate-900 border-slate-200'
                        }`}>
                          {/* Image */}
                          <div className="aspect-[4/3] w-full rounded-[4px] overflow-hidden bg-slate-100 flex items-center justify-center p-2">
                            {cardSampleProduct ? (
                              <img
                                src={resolveProductImage(cardSampleProduct, cardCategory, products)}
                                alt={cardSampleProduct.name || 'Sample'}
                                className="max-h-full max-w-full object-contain"
                              />
                            ) : (
                              <Package size={32} className="text-slate-400" />
                            )}
                          </div>

                          {/* Info */}
                          <div className="space-y-1.5">
                            {cardFields.showSku && (
                              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block">
                                {cardSampleProduct?.sku || (cardSampleProduct?.customFields as any)?.model_no || 'VT-2026-X'}
                              </span>
                            )}
                            {cardFields.showTitle && (
                              <h5 className="font-heading text-sm font-bold truncate">
                                {cardSampleProduct?.name || 'Architectural Spotlight'}
                              </h5>
                            )}
                            {cardFields.showPrice && (
                              <div className="pt-1 flex items-center justify-between">
                                <span className="font-mono text-xs font-bold text-emerald-500">
                                  {cardSampleProduct?.price ? `${cardSampleProduct.currency || '₹'}${cardSampleProduct.price}` : '₹1,450.00'}
                                </span>
                                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                                  In Stock
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className={`text-[11px] text-center mt-4 font-mono ${isDark ? 'text-[#E2DCC8]/40' : 'text-slate-400'}`}>
                      Card styling dynamically applied to all {selectedCategoryIds.filter(cid => getLayoutForCategory(cid).startsWith('cards-')).length} card-layout categories
                    </p>
                  </div>
                </div>
              </div>
            )}
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
      )}
    </div>
  );
};

export default CatalogSetup;
