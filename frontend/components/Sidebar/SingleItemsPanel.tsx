import React, { useState, useMemo, useEffect } from 'react';
import {
  Package,
  Search,
  X,
  CheckCircle2,
  Sliders,
  Plus,
  Eye,
  EyeOff,
  Edit3,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  ArrowLeft,
  Check,
  LayoutGrid,
  Layers,
  Type,
  Sparkles,
  Palette,
  SlidersHorizontal
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Product } from '../../types';
import { PAGE_WIDTH, PAGE_HEIGHT } from '../../constants';
import { normalizeImageUrl } from '../../utils/imageUtils';
import { resolveFieldLabel } from '../../utils/fieldUtils';

export interface CardVariable {
  key: string;
  badge: string;
  label: string;
  defaultValue: string;
  currentValue: string;
  isCore?: boolean;
}

const isDarkColor = (color: string): boolean => {
  if (!color || color === 'transparent') return false;
  let hex = color.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  if (hex.length !== 6) return false;
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
};

export const SingleItemsPanel: React.FC = () => {
  const {
    products,
    categories,
    currentPageIndex,
    catalog,
    addElement,
    updateElement,
    setEditorTab,
    uiTheme,
  } = useStore();

  const isDark = uiTheme === 'dark';

  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Customizer State (Inline Editor with Support for New Card & Re-editing Existing Placed Card)
  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null);
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const [editingElementPageIndex, setEditingElementPageIndex] = useState<number>(currentPageIndex);
  const [customCardTheme, setCustomCardTheme] = useState<string>('classic-stack');
  const [customVars, setCustomVars] = useState<CardVariable[]>([]);
  const [customActiveKeys, setCustomActiveKeys] = useState<string[]>([]);
  const [customEditingVarKey, setCustomEditingVarKey] = useState<string | null>(null);

  // Typography & Styling State (Card styling is independent of software UI dark mode!)
  const [customTitleFontSize, setCustomTitleFontSize] = useState(16);
  const [customTitleColor, setCustomTitleColor] = useState('#0f172a');
  const [customPriceFontSize, setCustomPriceFontSize] = useState(15);
  const [customPriceColor, setCustomPriceColor] = useState('#00a651');
  const [customSpecsFontSize, setCustomSpecsFontSize] = useState(9);
  const [customSpecsColor, setCustomSpecsColor] = useState('#475569');
  const [customBorderRadius, setCustomBorderRadius] = useState(4);
  const [customFill, setCustomFill] = useState('#ffffff');
  const [customStroke, setCustomStroke] = useState('#e2e8f0');

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  // Filter products by search & category
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedCategory === 'all' || String(p.categoryId) === selectedCategory;
      if (!matchCat) return false;

      if (!search.trim()) return true;
      const q = search.toLowerCase();
      const matchName = (p.name || '').toLowerCase().includes(q);
      const matchSku = (p.sku || '').toLowerCase().includes(q);
      const matchDesc = (p.description || '').toLowerCase().includes(q);
      const matchCustom = p.customFields
        ? Object.values(p.customFields).some(v => String(v).toLowerCase().includes(q))
        : false;
      return matchName || matchSku || matchDesc || matchCustom;
    });
  }, [products, selectedCategory, search]);

  // Smart Placement Helper
  const calculateElementPlacement = (itemWidth: number, itemHeight: number) => {
    const currentPage = catalog?.pages?.[currentPageIndex];
    const elements = currentPage?.elements || [];
    const marginX = catalog?.marginLeft ? Math.round(catalog.marginLeft) : 45;
    const marginTop = catalog?.marginTop ? Math.round(catalog.marginTop) : 55;
    const marginBottom = catalog?.marginBottom ? Math.round(catalog.marginBottom) : 55;
    const marginRight = catalog?.marginRight ? Math.round(catalog.marginRight) : 45;
    const pageWidth = PAGE_WIDTH || 794;
    const pageHeight = PAGE_HEIGHT || 1123;

    // Check for empty slot
    const slots = elements.filter(el => el.id && el.id.includes('slot'));
    const occupiedSlotIds = new Set(
      elements
        .filter(el => el.productId)
        .map(el => {
          const parts = (el.id || '').split('-');
          const idx = parts.findIndex(p => p === 'slot');
          return idx !== -1 && idx + 1 < parts.length ? `slot-${parts[idx + 1]}` : null;
        })
        .filter(Boolean)
    );

    const targetSlot = slots.find(s => {
      const parts = (s.id || '').split('-');
      const idx = parts.findIndex(p => p === 'slot');
      if (idx !== -1 && idx + 1 < parts.length) {
        return !occupiedSlotIds.has(`slot-${parts[idx + 1]}`);
      }
      return true;
    });

    if (targetSlot) {
      return {
        x: targetSlot.x,
        y: targetSlot.y,
        width: targetSlot.width,
        height: targetSlot.height
      };
    }

    // Place below existing elements if room available
    const nonHeaderElements = elements.filter(el => (el.y || 0) >= marginTop);
    if (nonHeaderElements.length > 0) {
      const maxY = Math.max(...nonHeaderElements.map(el => (el.y || 0) + (el.height || 0)));
      if (maxY + itemHeight + 20 <= pageHeight - marginBottom) {
        return {
          x: marginX,
          y: maxY + 20,
          width: itemWidth,
          height: itemHeight
        };
      }
    }

    // Stagger fallback
    const count = elements.length % 6;
    const staggerX = Math.min(marginX + count * 28, pageWidth - itemWidth - marginRight);
    const staggerY = Math.min(marginTop + 20 + count * 28, pageHeight - itemHeight - marginBottom);

    return {
      x: Math.max(marginX, staggerX),
      y: Math.max(marginTop, staggerY),
      width: itemWidth,
      height: itemHeight
    };
  };

  // Add Default Product Card Direct
  const handleAddCard = (product: Product) => {
    const timestamp = Date.now();
    const placement = calculateElementPlacement(260, 320);

    addElement(currentPageIndex, {
      id: `product-block-${product.id}-${timestamp}`,
      type: 'product-block',
      x: placement.x,
      y: placement.y,
      width: placement.width,
      height: placement.height,
      rotation: 0,
      opacity: 1,
      productId: product.id,
      src: product.image || (product as any).src || undefined,
      productData: product,
      showPrice: true,
      showSku: true,
      showName: true,
      zIndex: 20
    });

    showFeedback(`Card for "${product.name}" added to Page ${currentPageIndex + 1}!`);
  };

  // Open Full Customizer View with all Variables & Content (Supports New or Existing Canvas Card)
  const openCustomizer = (product: Product, existingElement?: any, pageIdx?: number) => {
    setCustomizingProduct(product);
    setEditingElementId(existingElement ? existingElement.id : null);
    setEditingElementPageIndex(pageIdx !== undefined ? pageIdx : currentPageIndex);
    setCustomEditingVarKey(null);

    const targetTheme = existingElement?.cardTheme || existingElement?.productData?.cardTheme || 'classic-stack';
    setCustomCardTheme(targetTheme);

    // Build rich variables list matching product and existing element overrides
    const vars: CardVariable[] = [
      {
        key: 'name',
        badge: 'TITLE',
        label: 'Product Title',
        defaultValue: product.name || '',
        currentValue: existingElement?.customTitle || existingElement?.productData?.name || product.name || '',
        isCore: true
      },
      {
        key: 'price',
        badge: 'PRICE',
        label: 'Price',
        defaultValue: `${product.currency || '₹'}${product.price || ''}`,
        currentValue: existingElement?.customPrice || existingElement?.productData?.price || `${product.currency || '₹'}${product.price || ''}`,
        isCore: true
      },
      {
        key: 'sku',
        badge: 'SKU',
        label: 'SKU / Model No',
        defaultValue: product.sku || '',
        currentValue: existingElement?.customSku || existingElement?.productData?.sku || product.sku || '',
        isCore: true
      }
    ];

    if (product.description) {
      const descVal = existingElement?.fieldOverrides?.description?.value || existingElement?.productData?.description || product.description;
      vars.push({
        key: 'description',
        badge: 'DESC',
        label: 'Description',
        defaultValue: product.description,
        currentValue: descVal
      });
    }

    if (product.customFields && typeof product.customFields === 'object') {
      Object.entries(product.customFields).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '' && typeof v !== 'object') {
          const resolvedLabel = resolveFieldLabel(k, categories, product) || k;
          const currentVal = existingElement?.fieldOverrides?.[k]?.value || existingElement?.productData?.[k] || String(v);
          vars.push({
            key: k,
            badge: 'SPEC',
            label: resolvedLabel,
            defaultValue: String(v),
            currentValue: String(currentVal)
          });
        }
      });
    }

    setCustomVars(vars);

    if (existingElement?.visibleFieldKeys && Array.isArray(existingElement.visibleFieldKeys) && existingElement.visibleFieldKeys.length > 0) {
      setCustomActiveKeys(existingElement.visibleFieldKeys);
    } else {
      setCustomActiveKeys(vars.map(v => v.key));
    }

    // Resolve Card Colors: Defaults to pure catalog Light Card (#ffffff) unless explicitly styled or dark
    const targetFill = existingElement?.fill || existingElement?.productData?.cardFill || (targetTheme === 'editorial-overlay' ? '#0f172a' : '#ffffff');
    const isTargetDark = isDarkColor(targetFill);

    // Styling defaults matching existing element or defaults
    setCustomTitleFontSize(existingElement?.titleFontSize || existingElement?.productData?.titleFontSize || 16);
    setCustomTitleColor(existingElement?.titleColor || existingElement?.productData?.titleColor || (isTargetDark ? '#ffffff' : '#0f172a'));
    setCustomPriceFontSize(existingElement?.priceFontSize || existingElement?.productData?.priceFontSize || 15);
    setCustomPriceColor(existingElement?.priceColor || existingElement?.productData?.priceColor || (isTargetDark ? '#34d399' : '#00a651'));
    setCustomSpecsFontSize(existingElement?.fontSize || existingElement?.productData?.fontSize || 9);
    setCustomSpecsColor(existingElement?.textColor || existingElement?.productData?.textColor || (isTargetDark ? '#cbd5e1' : '#475569'));
    setCustomBorderRadius(existingElement?.borderRadius ?? existingElement?.productData?.cardBorderRadius ?? 4);
    setCustomFill(targetFill);
    setCustomStroke(existingElement?.stroke || existingElement?.productData?.cardStroke || (isTargetDark ? '#2e2e32' : '#e2e8f0'));
  };

  // Listen for canvas edit product card events (double click or toolbar edit button)
  useEffect(() => {
    const handleEditProductCard = (e: any) => {
      const elementId = e.detail?.id;
      const store = useStore.getState();
      const targetPageIdx = e.detail?.pageIndex ?? store.currentPageIndex;
      const targetPage = store.catalog.pages[targetPageIdx];
      const el = targetPage?.elements.find(item => item.id === elementId);
      if (el) {
        let product = store.products.find(p => p.id === el.productId);
        if (!product && el.productData) {
          product = el.productData as Product;
        }
          product = {
            id: el.productId || Number(elementId) || 1,
            name: el.customTitle || 'Product',
            price: el.customPrice || '0',
            sku: el.customSku || '',
            currency: '₹',
            description: '',
            image: ''
          } as unknown as Product;
        openCustomizer(product, el, targetPageIdx);
      }
    };
    window.addEventListener('catalog:editProductCard', handleEditProductCard);
    return () => window.removeEventListener('catalog:editProductCard', handleEditProductCard);
  }, []);

  // Variable Handlers (Toggle, Reorder, Update, Reset)
  const handleToggleVar = (key: string) => {
    if (customActiveKeys.includes(key)) {
      setCustomActiveKeys(customActiveKeys.filter(k => k !== key));
    } else {
      setCustomActiveKeys([...customActiveKeys, key]);
    }
  };

  const handleMoveVar = (key: string, dir: 'up' | 'down') => {
    const idx = customActiveKeys.indexOf(key);
    if (idx === -1) return;
    const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= customActiveKeys.length) return;
    const newKeys = [...customActiveKeys];
    const [moved] = newKeys.splice(idx, 1);
    newKeys.splice(targetIdx, 0, moved);
    setCustomActiveKeys(newKeys);
  };

  const handleUpdateVarValue = (key: string, val: string) => {
    setCustomVars(prev => prev.map(v => v.key === key ? { ...v, currentValue: val } : v));
  };

  const handleResetAllVars = () => {
    if (!customizingProduct) return;
    setCustomVars(prev => prev.map(v => ({ ...v, currentValue: v.defaultValue })));
    setCustomActiveKeys(customVars.map(v => v.key));
    setCustomTitleFontSize(16);
    setCustomPriceFontSize(15);
    setCustomSpecsFontSize(9);
    setCustomTitleColor('#0f172a');
    setCustomPriceColor('#00a651');
    setCustomSpecsColor('#475569');
    setCustomBorderRadius(4);
    setCustomFill('#ffffff');
    setCustomStroke('#e2e8f0');
    setCustomEditingVarKey(null);
  };

  // Sorted variables for UI list (active ones first in user-defined order)
  const sortedModalVars = useMemo(() => {
    return [...customVars].sort((a, b) => {
      const aIdx = customActiveKeys.indexOf(a.key);
      const bIdx = customActiveKeys.indexOf(b.key);
      if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
      if (aIdx !== -1) return -1;
      if (bIdx !== -1) return 1;
      return 0;
    });
  }, [customVars, customActiveKeys]);

  // Insert New or Update Placed Card onto active canvas page
  const handleSaveCardChanges = () => {
    if (!customizingProduct) return;

    const titleVar = customVars.find(v => v.key === 'name');
    const priceVar = customVars.find(v => v.key === 'price');
    const skuVar = customVars.find(v => v.key === 'sku');

    const fieldOverrides: Record<string, { label?: string; value?: string }> = {};
    customVars.forEach(v => {
      if (!v.isCore && v.currentValue !== v.defaultValue) {
        fieldOverrides[v.key] = { label: v.label, value: v.currentValue };
      }
    });

    const customData: any = {
      ...customizingProduct,
      name: titleVar ? titleVar.currentValue : customizingProduct.name,
      price: priceVar ? priceVar.currentValue : customizingProduct.price,
      sku: skuVar ? skuVar.currentValue : customizingProduct.sku,
      cardTheme: customCardTheme,
      cardFill: customFill,
      cardStroke: customStroke,
      cardBorderRadius: customBorderRadius,
      titleColor: customTitleColor,
      titleFontSize: customTitleFontSize,
      priceColor: customPriceColor,
      priceFontSize: customPriceFontSize,
      fontSize: customSpecsFontSize,
      textColor: customSpecsColor,
      visibleFieldKeys: customActiveKeys,
      fieldOverrides
    };

    const cardUpdates: any = {
      productId: customizingProduct.id,
      src: customizingProduct.image || (customizingProduct as any).src || undefined,
      productData: customData,
      cardTheme: customCardTheme,
      showName: customActiveKeys.includes('name'),
      showPrice: customActiveKeys.includes('price'),
      showSku: customActiveKeys.includes('sku'),
      customTitle: titleVar ? titleVar.currentValue : undefined,
      customPrice: priceVar ? priceVar.currentValue : undefined,
      customSku: skuVar ? skuVar.currentValue : undefined,
      titleFontSize: customTitleFontSize,
      titleColor: customTitleColor,
      priceFontSize: customPriceFontSize,
      priceColor: customPriceColor,
      fontSize: customSpecsFontSize,
      textColor: customSpecsColor,
      visibleFieldKeys: customActiveKeys,
      fieldOverrides,
      fill: customFill,
      stroke: customStroke,
      borderRadius: customBorderRadius
    };

    if (editingElementId) {
      // Update existing placed card on canvas!
      updateElement(editingElementPageIndex, editingElementId, cardUpdates);
      showFeedback(`Card "${titleVar?.currentValue || customizingProduct.name}" updated on canvas!`);
      setCustomizingProduct(null);
      setEditingElementId(null);
    } else {
      // Insert new card onto canvas
      const timestamp = Date.now();
      const placement = calculateElementPlacement(270, 330);
      addElement(currentPageIndex, {
        id: `product-block-${customizingProduct.id}-${timestamp}`,
        type: 'product-block',
        x: placement.x,
        y: placement.y,
        width: placement.width,
        height: placement.height,
        rotation: 0,
        opacity: 1,
        ...cardUpdates,
        zIndex: 25
      });
      showFeedback(`Customized card for "${titleVar?.currentValue || customizingProduct.name}" added to Page ${currentPageIndex + 1}!`);
      setCustomizingProduct(null);
    }
  };

  return (
    <div className={`w-full h-full flex flex-col font-sans select-none transition-colors ${
      isDark ? 'bg-[#121212] text-[#F1F1F1]' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* If not customizing, show products list grid view */}
      {!customizingProduct ? (
        <div className="w-full h-full flex flex-col overflow-hidden">
          {/* ── Top Header ───────────────────────────────────────── */}
      <div className={`h-14 px-4 border-b shrink-0 flex items-center justify-between transition-colors ${
        isDark ? 'bg-[#161616] border-[#262626]' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-[4px] bg-[#0F3D3E] flex items-center justify-center text-[#E2DCC8] shadow-sm">
            <Package size={15} />
          </div>
          <div>
            <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Single Items
            </h3>
            <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${
              isDark ? 'text-[#00a651] bg-[#00a651]/10 border-[#00a651]/20' : 'text-[#0F3D3E] bg-teal-50 border-teal-200'
            }`}>
              Target: Page {currentPageIndex + 1}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
            isDark ? 'text-[#E2DCC8]/70 bg-[#1e1e1e] border-[#333]' : 'text-slate-600 bg-slate-100 border-slate-200'
          }`}>
            {filteredProducts.length} items
          </span>
          <button
            onClick={() => setEditorTab(null)}
            className={`p-1.5 rounded-[4px] transition-colors ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-[#222]' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
            title="Close Panel"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* ── Feedback Notification Toast ─────────────────────── */}
      {feedback && (
        <div className="mx-3 mt-2 p-2.5 rounded bg-[#0F3D3E] border border-[#00a651]/50 text-[#F1F1F1] text-xs font-semibold flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center gap-2 truncate">
            <CheckCircle2 size={16} className="text-[#00a651] shrink-0" />
            <span className="truncate">{feedback}</span>
          </div>
          <span className="text-[9px] text-[#E2DCC8] uppercase tracking-wider font-mono bg-black/30 px-2 py-0.5 rounded shrink-0">
            Added
          </span>
        </div>
      )}

      {/* ── Search & Categories Filter ────────────────────────── */}
      <div className={`p-3 space-y-2 border-b shrink-0 ${isDark ? 'border-[#222] bg-[#141414]' : 'border-slate-200 bg-white'}`}>
        {/* Search Input */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, SKU, specs..."
            className={`w-full border rounded-[4px] pl-9 pr-8 py-1.5 text-xs outline-none transition-colors ${
              isDark 
                ? 'bg-[#1a1a1a] border-[#333] focus:border-[#0F3D3E] text-[#F1F1F1] placeholder:text-slate-500' 
                : 'bg-slate-50 border-slate-200 focus:border-[#0F3D3E] text-slate-900 placeholder:text-slate-400'
            }`}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-2.5 py-1 rounded-[3px] text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-[#0F3D3E] text-[#E2DCC8] border border-[#E2DCC8]/40 shadow-sm'
                : (isDark ? 'bg-[#1e1e1e] text-slate-400 border border-[#2a2a2a] hover:text-white' : 'bg-slate-100 text-slate-600 border border-slate-200 hover:text-slate-900')
            }`}
          >
            All ({products.length})
          </button>

          {categories.map((cat) => {
            const count = products.filter(p => String(p.categoryId) === String(cat.id)).length;
            const isSelected = selectedCategory === String(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(String(cat.id))}
                className={`px-2.5 py-1 rounded-[3px] text-[10px] font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#0F3D3E] text-[#E2DCC8] border border-[#E2DCC8]/40 shadow-sm'
                    : (isDark ? 'bg-[#1e1e1e] text-slate-400 border border-[#2a2a2a] hover:text-white' : 'bg-slate-100 text-slate-600 border border-slate-200 hover:text-slate-900')
                }`}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color || '#00a651' }}
                />
                <span>{cat.name}</span>
                <span className="text-[9px] opacity-60 font-mono">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Product List Grid ─────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        {filteredProducts.length === 0 ? (
          <div className={`py-12 text-center border border-dashed rounded-[6px] ${
            isDark ? 'border-[#262626] bg-[#161616]/40' : 'border-slate-200 bg-white/60'
          }`}>
            <Package size={28} className={`mx-auto mb-2 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
            <p className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>No products match your search</p>
            <p className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Try a different keyword or choose 'All'.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {filteredProducts.map((product) => {
              const cat = categories.find(c => String(c.id) === String(product.categoryId));
              const imgUrl = normalizeImageUrl(
                product.image ||
                (product.customFields && Object.values(product.customFields).find(v => typeof v === 'string' && (v.startsWith('/media') || v.startsWith('http')))) as string ||
                ''
              );
              const hasVariants = product.variants && product.variants.length > 0;

              return (
                <div
                  key={product.id}
                  draggable
                  onDragStart={(e) => {
                    const dragData = {
                      type: 'product',
                      url: imgUrl,
                      name: product.name,
                      productId: product.id
                    };
                    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
                  }}
                  className={`group relative rounded-[4px] p-2.5 transition-all flex flex-col justify-between cursor-grab active:cursor-grabbing border ${
                    isDark 
                      ? 'bg-[#181818] hover:bg-[#1c1c1c] border-[#282828] hover:border-[#0F3D3E] hover:shadow-lg' 
                      : 'bg-white hover:bg-slate-50/80 border-slate-200 hover:border-[#0F3D3E] shadow-xs hover:shadow-md'
                  }`}
                >
                  <div
                    className="cursor-pointer"
                    onClick={() => openCustomizer(product)}
                    title="Click to customize card layout & variables"
                  >
                    {/* Card Top: Category & Price */}
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className={`text-[8.5px] font-bold truncate px-1.5 py-0.5 rounded border ${
                        isDark ? 'text-[#E2DCC8]/80 bg-[#222] border-[#333]' : 'text-slate-600 bg-slate-100 border-slate-200'
                      }`}>
                        {cat?.name || 'General'}
                      </span>
                      <span className="text-[10px] font-bold text-[#00a651] font-mono shrink-0">
                        {product.currency || '₹'}{product.price}
                      </span>
                    </div>

                    {/* Thumbnail Preview */}
                    <div className={`w-full h-24 rounded-[3px] border mb-2 overflow-hidden flex items-center justify-center relative ${
                      isDark ? 'bg-[#121212] border-[#222]' : 'bg-slate-50 border-slate-200'
                    }`}>
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={product.name}
                          className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform duration-200"
                          loading="lazy"
                        />
                      ) : (
                        <div className={`flex flex-col items-center gap-1 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                          <Package size={22} />
                          <span className="text-[8px] uppercase tracking-wider">No Image</span>
                        </div>
                      )}
                      {hasVariants && (
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-[#0F3D3E]/90 border border-[#E2DCC8]/30 text-[#E2DCC8] text-[8px] font-mono font-bold shadow">
                          {product.variants!.length} Var
                        </span>
                      )}
                    </div>

                    {/* Product Name & SKU */}
                    <div className="space-y-0.5 mb-2.5">
                      <h4 className={`text-[11px] font-bold line-clamp-2 leading-tight transition-colors ${
                        isDark ? 'text-[#F1F1F1] group-hover:text-[#E2DCC8]' : 'text-slate-900 group-hover:text-[#0F3D3E]'
                      }`} title={product.name}>
                        {product.name}
                      </h4>
                      {product.sku && (
                        <p className={`text-[8.5px] font-mono truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          SKU: <span className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{product.sku}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className={`pt-2 border-t flex items-center gap-1.5 ${isDark ? 'border-[#252525]' : 'border-slate-100'}`}>
                    {/* Primary Button: + Add Card Block */}
                    <button
                      type="button"
                      onClick={() => handleAddCard(product)}
                      className="flex-1 py-1.5 px-2.5 bg-[#0F3D3E] hover:bg-[#155455] text-white rounded-[3px] text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs border border-[#E2DCC8]/25 cursor-pointer"
                      title={`Add product card block to Page ${currentPageIndex + 1}`}
                    >
                      <Plus size={11} /> + Add Card Block
                    </button>

                    {/* Tune Properties Customizer Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openCustomizer(product);
                      }}
                      className={`p-1.5 rounded-[3px] border transition-all flex items-center justify-center shrink-0 cursor-pointer ${
                        isDark
                          ? 'bg-[#1e1e1e] hover:bg-[#282828] text-[#E2DCC8] border-[#333] hover:border-[#0F3D3E]'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300 hover:border-[#0F3D3E]'
                      }`}
                      title="Tune Card Properties & Variables (Theme, Fields, Colors, Sizes)"
                    >
                      <Sliders size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
        </div>
      ) : (
        /* ── INLINE CARD CUSTOMIZER VIEW ── */
        <div className="w-full h-full flex flex-col overflow-hidden animate-in fade-in duration-150">
          {/* Customizer Header with Back Button */}
          <div className={`h-14 px-4 border-b shrink-0 flex items-center justify-between transition-colors ${
            isDark ? 'bg-[#161616] border-[#262626]' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setCustomizingProduct(null)}
                className={`px-3 py-1.5 rounded-[5px] border flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer shadow-xs ${
                  isDark
                    ? 'bg-[#1e1e1e] hover:bg-[#282828] text-[#E2DCC8] border-[#333] hover:border-[#0F3D3E]'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300 hover:border-[#0F3D3E]'
                }`}
                title="Back to Products List"
              >
                <ArrowLeft size={14} />
                <span>Back to Products</span>
              </button>

              <div className="h-4 w-px bg-slate-200 dark:bg-white/10 shrink-0" />

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className={`text-xs font-black uppercase tracking-wider truncate max-w-[240px] ${isDark ? 'text-white' : 'text-slate-900'}`} title={customizingProduct.name}>
                    {customizingProduct.name}
                  </h3>
                  {editingElementId ? (
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold uppercase shrink-0 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      EDITING CANVAS CARD
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 font-bold uppercase shrink-0">
                      NEW CARD
                    </span>
                  )}
                </div>
                <p className={`text-[10px] font-mono truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  SKU: {customizingProduct.sku || '-'} • Target: Page {editingElementId ? editingElementPageIndex + 1 : currentPageIndex + 1}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleSaveCardChanges}
                className="px-4 py-1.5 bg-[#0F3D3E] hover:bg-[#155455] text-white rounded-[5px] text-xs font-bold flex items-center gap-1.5 shadow-md border border-[#E2DCC8]/30 cursor-pointer transition-transform active:scale-95"
              >
                {editingElementId ? (
                  <>
                    <Check size={14} /> Update Card
                  </>
                ) : (
                  <>
                    <Plus size={14} /> Insert Card
                  </>
                )}
              </button>
              <button
                onClick={() => setEditorTab(null)}
                className={`p-1.5 rounded-[4px] transition-colors ${
                  isDark ? 'text-slate-400 hover:text-white hover:bg-[#222]' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                }`}
                title="Close Panel"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Body: Settings (Left) & Live Preview (Right) */}
          <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-4.5 custom-scrollbar">
            {/* Left Column: Form Controls & Variables */}
            <div className="space-y-4 text-xs pr-1">
              {/* 1. Theme Layout Selection - Visual Cards */}
              <div className={`p-3.5 rounded-[8px] border space-y-2.5 ${isDark ? 'bg-[#161616] border-[#262626]' : 'bg-white border-slate-200 shadow-xs'}`}>
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
                    <LayoutGrid size={13} />
                    <span>CARD THEME LAYOUT</span>
                  </label>
                  <span className="text-[9px] font-mono text-slate-400 uppercase font-bold">4 Layouts</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    {
                      id: 'classic-stack',
                      name: 'Classic Stack',
                      desc: 'Image top, specs list bottom',
                      badge: 'Popular'
                    },
                    {
                      id: 'editorial-overlay',
                      name: 'Editorial Hero',
                      desc: 'Dark gradient hero overlay',
                      badge: 'Cinematic'
                    },
                    {
                      id: 'clean-badge',
                      name: 'Clean Badge',
                      desc: 'Top category pill & 2-col specs',
                      badge: 'Specs Grid'
                    },
                    {
                      id: 'minimal-row',
                      name: 'Compact Row',
                      desc: 'Side-by-side thumbnail',
                      badge: 'Compact'
                    }
                  ].map((themeItem) => {
                    const isSelected = customCardTheme === themeItem.id;
                    return (
                      <button
                        key={themeItem.id}
                        type="button"
                        onClick={() => {
                          const newTheme = themeItem.id;
                          setCustomCardTheme(newTheme);
                          if (newTheme === 'editorial-overlay') {
                            setCustomFill('#0f172a');
                            setCustomStroke('#1e293b');
                            setCustomTitleColor('#ffffff');
                            setCustomPriceColor('#38bdf8');
                            setCustomSpecsColor('#cbd5e1');
                          } else if (customCardTheme === 'editorial-overlay') {
                            setCustomFill('#ffffff');
                            setCustomStroke('#e2e8f0');
                            setCustomTitleColor('#0f172a');
                            setCustomPriceColor('#00a651');
                            setCustomSpecsColor('#334155');
                          }
                        }}
                        className={`p-2.5 rounded-[6px] text-left transition-all border cursor-pointer flex flex-col justify-between relative ${
                          isSelected
                            ? isDark
                              ? 'bg-indigo-950/40 border-indigo-500 shadow-md ring-1 ring-indigo-500/40'
                              : 'bg-indigo-50/80 border-indigo-500 shadow-sm ring-1 ring-indigo-400/40'
                            : isDark
                              ? 'bg-[#1b1b1e] border-[#27272a] hover:border-[#3f3f46] hover:bg-[#222226]'
                              : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100/60'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className={`text-[11px] font-black tracking-tight ${isSelected ? (isDark ? 'text-indigo-300' : 'text-indigo-900') : (isDark ? 'text-slate-200' : 'text-slate-800')}`}>
                            {themeItem.name}
                          </span>
                          {isSelected && <Check size={12} className="text-indigo-400 shrink-0 font-bold" />}
                        </div>
                        <p className={`text-[9.5px] leading-tight line-clamp-1 ${isSelected ? (isDark ? 'text-indigo-200/70' : 'text-indigo-700') : 'text-slate-400'}`}>
                          {themeItem.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Card Variables & Content */}
              <section className={`p-3.5 rounded-[8px] border space-y-3 ${
                isDark ? 'bg-[#161616] border-[#262626]' : 'bg-white border-slate-200 shadow-xs'
              }`}>
                {/* Top Bar with Title & Reset */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-[#262626]">
                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-indigo-400">
                    <SlidersHorizontal size={13} />
                    <span>CARD VARIABLES & CONTENT</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetAllVars}
                    className="text-[10px] text-amber-500 hover:text-amber-400 flex items-center gap-1 font-bold cursor-pointer transition-colors"
                    title="Reset all variable overrides back to catalog database defaults"
                  >
                    <RotateCcw size={11} /> Reset All
                  </button>
                </div>

                {/* Variables Header & Counter */}
                <div className="flex items-center justify-between px-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      ACTIVE FIELDS
                    </span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {customActiveKeys.length}/{customVars.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setCustomActiveKeys(['name', 'price'])}
                      className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded cursor-pointer transition-colors ${
                        customActiveKeys.length === 2
                          ? 'bg-indigo-600 text-white'
                          : isDark ? 'bg-[#222] text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Minimal
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomActiveKeys(customVars.map(v => v.key))}
                      className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded cursor-pointer transition-colors ${
                        customActiveKeys.length === customVars.length
                          ? 'bg-indigo-600 text-white'
                          : isDark ? 'bg-[#222] text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Show All
                    </button>
                  </div>
                </div>

                {/* Variables List */}
                <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                  {sortedModalVars.map((v) => {
                    const isActive = customActiveKeys.includes(v.key);
                    const isFirst = customActiveKeys.indexOf(v.key) === 0;
                    const isLast = customActiveKeys.indexOf(v.key) === customActiveKeys.length - 1;
                    const isEditing = customEditingVarKey === v.key;

                    return (
                      <div
                        key={v.key}
                        className={`p-2 rounded-[6px] border transition-all ${
                          isActive
                            ? isDark ? 'bg-[#1b1b1e] border-[#2e2e32]' : 'bg-white border-slate-200 shadow-xs'
                            : isDark ? 'bg-[#121214]/50 border-[#222225] opacity-50' : 'bg-slate-50 border-slate-100 opacity-50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          {/* Toggle & Badge & Label */}
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <button
                              type="button"
                              onClick={() => handleToggleVar(v.key)}
                              className={`p-1 rounded transition-colors cursor-pointer ${
                                isActive
                                  ? 'text-indigo-400 hover:bg-indigo-500/10'
                                  : isDark ? 'text-slate-600 hover:text-slate-400' : 'text-slate-300 hover:text-slate-500'
                              }`}
                              title={isActive ? 'Hide variable from card' : 'Show variable on card'}
                            >
                              {isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                            </button>

                            <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded tracking-wider shrink-0 ${
                              v.badge === 'TITLE' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                              v.badge === 'PRICE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                              v.badge === 'SKU' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                              'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                            }`}>
                              {v.badge}
                            </span>

                            <div className="flex flex-col min-w-0 flex-1">
                              <span className={`text-[11px] font-bold truncate ${isActive ? (isDark ? 'text-white' : 'text-slate-800') : 'text-slate-500'}`}>
                                {v.label}
                              </span>
                              {!isEditing && (
                                <span className="text-[10px] text-slate-400 truncate font-mono">
                                  {v.currentValue || <em className="text-slate-500">Empty</em>}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Actions: Edit, Reorder */}
                          <div className="flex items-center gap-0.5 shrink-0">
                            {isActive && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setCustomEditingVarKey(isEditing ? null : v.key)}
                                  className={`p-1 rounded transition-colors cursor-pointer ${
                                    isEditing 
                                      ? 'text-indigo-400 bg-indigo-500/10' 
                                      : isDark ? 'text-slate-500 hover:text-slate-200' : 'text-slate-400 hover:text-slate-700'
                                  }`}
                                  title="Edit value override"
                                >
                                  <Edit3 size={12} />
                                </button>
                                <button
                                  type="button"
                                  disabled={isFirst}
                                  onClick={() => handleMoveVar(v.key, 'up')}
                                  className="p-1 text-slate-400 hover:text-slate-200 disabled:opacity-20 disabled:hover:text-slate-400 cursor-pointer"
                                  title="Move up"
                                >
                                  <ArrowUp size={12} />
                                </button>
                                <button
                                  type="button"
                                  disabled={isLast}
                                  onClick={() => handleMoveVar(v.key, 'down')}
                                  className="p-1 text-slate-400 hover:text-slate-200 disabled:opacity-20 disabled:hover:text-slate-400 cursor-pointer"
                                  title="Move down"
                                >
                                  <ArrowDown size={12} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Inline Value Editor */}
                        {isEditing && (
                          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-[#27272a] flex items-center gap-1.5">
                            <input
                              type="text"
                              value={v.currentValue}
                              onChange={(e) => handleUpdateVarValue(v.key, e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') setCustomEditingVarKey(null);
                              }}
                              placeholder={`Enter ${v.label}...`}
                              className="flex-1 bg-slate-50 dark:bg-[#121214] border border-slate-200 dark:border-[#2e2e32] rounded px-2.5 py-1 text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500"
                            />
                            <button
                              type="button"
                              onClick={() => setCustomEditingVarKey(null)}
                              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[10px] font-bold cursor-pointer flex items-center gap-1"
                            >
                              <Check size={11} /> Done
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* 3. Typography & Card Styling Section */}
              <section className={`p-3.5 rounded-[8px] border space-y-3 ${
                isDark ? 'bg-[#161616] border-[#262626]' : 'bg-white border-slate-200 shadow-xs'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
                    <Type size={13} />
                    <span>TYPOGRAPHY & STYLING</span>
                  </div>
                  <span className="text-[9px] font-mono text-slate-400 font-bold uppercase">Fonts & Colors</span>
                </div>

                {/* Quick Card Color Mode Presets */}
                <div className="p-1.5 bg-slate-100 dark:bg-[#121214] rounded-[6px] border border-slate-200 dark:border-[#27272a] flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setCustomFill('#ffffff');
                      setCustomStroke('#e2e8f0');
                      setCustomTitleColor('#0f172a');
                      setCustomPriceColor('#00a651');
                      setCustomSpecsColor('#334155');
                    }}
                    className={`flex-1 py-1 px-1.5 rounded text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all ${
                      customFill === '#ffffff'
                        ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                        : isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-white border border-slate-300 shadow-xs" />
                    <span>Light Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomFill('#18181b');
                      setCustomStroke('#27272a');
                      setCustomTitleColor('#f8fafc');
                      setCustomPriceColor('#34d399');
                      setCustomSpecsColor('#cbd5e1');
                    }}
                    className={`flex-1 py-1 px-1.5 rounded text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all ${
                      customFill === '#18181b'
                        ? 'bg-[#27272a] text-white shadow-xs border border-[#3f3f46]'
                        : isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-[#18181b] border border-slate-600 shadow-xs" />
                    <span>Dark Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomFill('#0f172a');
                      setCustomStroke('#1e293b');
                      setCustomTitleColor('#ffffff');
                      setCustomPriceColor('#38bdf8');
                      setCustomSpecsColor('#cbd5e1');
                    }}
                    className={`flex-1 py-1 px-1.5 rounded text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all ${
                      customFill === '#0f172a'
                        ? 'bg-[#1e293b] text-white shadow-xs border border-[#334155]'
                        : isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0f172a] border border-blue-900 shadow-xs" />
                    <span>Navy</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomFill('#fdfbf7');
                      setCustomStroke('#e7e5e4');
                      setCustomTitleColor('#1c1917');
                      setCustomPriceColor('#ea580c');
                      setCustomSpecsColor('#292524');
                    }}
                    className={`flex-1 py-1 px-1.5 rounded text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all ${
                      customFill === '#fdfbf7'
                        ? 'bg-amber-50/80 text-amber-950 shadow-xs border border-amber-200'
                        : isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-[#fdfbf7] border border-amber-300 shadow-xs" />
                    <span>Cream</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {/* Title Font Size & Color */}
                  <div className={`p-2.5 rounded-[6px] border flex items-center justify-between ${
                    isDark ? 'bg-[#1b1b1e] border-[#27272a]' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div>
                      <span className="text-[10px] font-bold text-slate-300 dark:text-slate-300 block uppercase tracking-wider">Product Title</span>
                      <span className="text-[9px] text-slate-500">Size & Color</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setCustomTitleFontSize(Math.max(8, customTitleFontSize - 1))}
                        className="w-6 h-6 flex items-center justify-center bg-slate-200 dark:bg-[#27272a] hover:bg-slate-300 dark:hover:bg-[#3f3f46] text-slate-700 dark:text-slate-200 rounded text-xs cursor-pointer font-bold"
                      >-</button>
                      <span className="text-[11px] font-mono font-bold w-7 text-center text-indigo-400">
                        {customTitleFontSize}px
                      </span>
                      <button
                        type="button"
                        onClick={() => setCustomTitleFontSize(customTitleFontSize + 1)}
                        className="w-6 h-6 flex items-center justify-center bg-slate-200 dark:bg-[#27272a] hover:bg-slate-300 dark:hover:bg-[#3f3f46] text-slate-700 dark:text-slate-200 rounded text-xs cursor-pointer font-bold"
                      >+</button>
                      <div className="relative w-6 h-6 ml-1 rounded border border-white/20 overflow-hidden cursor-pointer shadow-xs">
                        <input
                          type="color"
                          value={customTitleColor}
                          onChange={(e) => setCustomTitleColor(e.target.value)}
                          className="w-8 h-8 -top-1 -left-1 absolute cursor-pointer bg-transparent border-0"
                          title="Title Color"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Price Font Size & Color */}
                  <div className={`p-2.5 rounded-[6px] border flex items-center justify-between ${
                    isDark ? 'bg-[#1b1b1e] border-[#27272a]' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div>
                      <span className="text-[10px] font-bold text-slate-300 dark:text-slate-300 block uppercase tracking-wider">Price Pill</span>
                      <span className="text-[9px] text-slate-500">Size & Color</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setCustomPriceFontSize(Math.max(8, customPriceFontSize - 1))}
                        className="w-6 h-6 flex items-center justify-center bg-slate-200 dark:bg-[#27272a] hover:bg-slate-300 dark:hover:bg-[#3f3f46] text-slate-700 dark:text-slate-200 rounded text-xs cursor-pointer font-bold"
                      >-</button>
                      <span className="text-[11px] font-mono font-bold w-7 text-center text-emerald-400">
                        {customPriceFontSize}px
                      </span>
                      <button
                        type="button"
                        onClick={() => setCustomPriceFontSize(customPriceFontSize + 1)}
                        className="w-6 h-6 flex items-center justify-center bg-slate-200 dark:bg-[#27272a] hover:bg-slate-300 dark:hover:bg-[#3f3f46] text-slate-700 dark:text-slate-200 rounded text-xs cursor-pointer font-bold"
                      >+</button>
                      <div className="relative w-6 h-6 ml-1 rounded border border-white/20 overflow-hidden cursor-pointer shadow-xs">
                        <input
                          type="color"
                          value={customPriceColor}
                          onChange={(e) => setCustomPriceColor(e.target.value)}
                          className="w-8 h-8 -top-1 -left-1 absolute cursor-pointer bg-transparent border-0"
                          title="Price Color"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Specs & Details Font Size & Color */}
                  <div className={`p-2.5 rounded-[6px] border flex items-center justify-between ${
                    isDark ? 'bg-[#1b1b1e] border-[#27272a]' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div>
                      <span className="text-[10px] font-bold text-slate-300 dark:text-slate-300 block uppercase tracking-wider">Specs Text</span>
                      <span className="text-[9px] text-slate-500">Size & Color</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setCustomSpecsFontSize(Math.max(6, customSpecsFontSize - 1))}
                        className="w-6 h-6 flex items-center justify-center bg-slate-200 dark:bg-[#27272a] hover:bg-slate-300 dark:hover:bg-[#3f3f46] text-slate-700 dark:text-slate-200 rounded text-xs cursor-pointer font-bold"
                      >-</button>
                      <span className="text-[11px] font-mono font-bold w-7 text-center text-slate-300">
                        {customSpecsFontSize}px
                      </span>
                      <button
                        type="button"
                        onClick={() => setCustomSpecsFontSize(customSpecsFontSize + 1)}
                        className="w-6 h-6 flex items-center justify-center bg-slate-200 dark:bg-[#27272a] hover:bg-slate-300 dark:hover:bg-[#3f3f46] text-slate-700 dark:text-slate-200 rounded text-xs cursor-pointer font-bold"
                      >+</button>
                      <div className="relative w-6 h-6 ml-1 rounded border border-white/20 overflow-hidden cursor-pointer shadow-xs">
                        <input
                          type="color"
                          value={customSpecsColor}
                          onChange={(e) => setCustomSpecsColor(e.target.value)}
                          className="w-8 h-8 -top-1 -left-1 absolute cursor-pointer bg-transparent border-0"
                          title="Specs Text Color"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Corner Roundness */}
                  <div className={`p-2.5 rounded-[6px] border space-y-1.5 ${
                    isDark ? 'bg-[#1b1b1e] border-[#27272a]' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <span>Corner Roundness</span>
                      <span className="text-indigo-400 font-mono font-bold bg-indigo-500/10 px-1.5 py-0.2 rounded border border-indigo-500/20">{customBorderRadius}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="24"
                      step="1"
                      value={customBorderRadius}
                      onChange={(e) => setCustomBorderRadius(parseInt(e.target.value, 10))}
                      className="w-full h-1.5 bg-slate-200 dark:bg-[#27272a] rounded-full appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>

                  {/* Card Fill & Stroke */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className={`p-2.5 rounded-[6px] border ${isDark ? 'bg-[#1b1b1e] border-[#27272a]' : 'bg-slate-50 border-slate-200'}`}>
                      <label className="block text-[9px] font-bold uppercase tracking-wider mb-1 text-slate-400">Card Background</label>
                      <div className="flex items-center gap-2">
                        <div className="relative w-6 h-6 rounded border border-white/20 overflow-hidden cursor-pointer shrink-0">
                          <input
                            type="color"
                            value={customFill}
                            onChange={(e) => {
                              const newBg = e.target.value;
                              setCustomFill(newBg);
                              const isNewDark = isDarkColor(newBg);
                              if (isNewDark) {
                                if (isDarkColor(customTitleColor)) setCustomTitleColor('#ffffff');
                                if (isDarkColor(customSpecsColor)) setCustomSpecsColor('#cbd5e1');
                                if (customPriceColor === '#00a651') setCustomPriceColor('#34d399');
                              } else {
                                if (!isDarkColor(customTitleColor)) setCustomTitleColor('#0f172a');
                                if (!isDarkColor(customSpecsColor)) setCustomSpecsColor('#334155');
                                if (customPriceColor === '#34d399') setCustomPriceColor('#00a651');
                              }
                            }}
                            className="w-8 h-8 -top-1 -left-1 absolute cursor-pointer bg-transparent border-0"
                          />
                        </div>
                        <span className="text-[10px] font-mono truncate text-slate-300 font-semibold">{customFill}</span>
                      </div>
                    </div>
                    <div className={`p-2.5 rounded-[6px] border ${isDark ? 'bg-[#1b1b1e] border-[#27272a]' : 'bg-slate-50 border-slate-200'}`}>
                      <label className="block text-[9px] font-bold uppercase tracking-wider mb-1 text-slate-400">Border Stroke</label>
                      <div className="flex items-center gap-2">
                        <div className="relative w-6 h-6 rounded border border-white/20 overflow-hidden cursor-pointer shrink-0">
                          <input
                            type="color"
                            value={customStroke}
                            onChange={(e) => setCustomStroke(e.target.value)}
                            className="w-8 h-8 -top-1 -left-1 absolute cursor-pointer bg-transparent border-0"
                          />
                        </div>
                        <span className="text-[10px] font-mono truncate text-slate-300 font-semibold">{customStroke}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column: Live Card Preview */}
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-amber-400" />
                  <span>LIVE CARD PREVIEW</span>
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold">
                    {customCardTheme}
                  </span>
                </div>
              </div>

              <div className={`flex-1 min-h-[420px] rounded-[8px] border p-6 flex items-center justify-center relative overflow-hidden ${
                isDark 
                  ? 'bg-[#0a0a0a] border-[#222] bg-[radial-gradient(#222_1px,transparent_1px)] [background-size:16px_16px]' 
                  : 'bg-slate-100 border-slate-200 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]'
              }`}>
                {(() => {
                  const titleVar = customVars.find(v => v.key === 'name');
                  const priceVar = customVars.find(v => v.key === 'price');
                  const skuVar = customVars.find(v => v.key === 'sku');
                  const imgUrl = normalizeImageUrl(
                    customizingProduct.image ||
                    (customizingProduct.customFields && Object.values(customizingProduct.customFields).find(v => typeof v === 'string' && (v.startsWith('/media') || v.startsWith('http')))) as string ||
                    ''
                  );

                  // Active non-core variables for specs list
                  const activeSpecVars = sortedModalVars.filter(v => customActiveKeys.includes(v.key) && v.key !== 'name' && v.key !== 'price' && v.key !== 'sku');

                  return (
                    <div
                      className="w-[280px] shadow-2xl transition-all flex flex-col justify-between overflow-hidden border"
                      style={{
                        backgroundColor: customFill,
                        borderColor: customStroke,
                        borderRadius: `${customBorderRadius}px`
                      }}
                    >
                      {/* 1. Classic Stack Theme */}
                      {customCardTheme === 'classic-stack' && (
                        <div className="p-4 space-y-3 flex flex-col h-full justify-between">
                          {/* Image Header */}
                          <div className="w-full h-36 rounded bg-black/5 dark:bg-white/5 overflow-hidden flex items-center justify-center relative border border-black/5 dark:border-white/5">
                            {imgUrl ? (
                              <img
                                src={imgUrl}
                                alt={titleVar?.currentValue || ''}
                                className="w-full h-full object-contain p-2"
                              />
                            ) : (
                              <Package size={36} className="text-slate-400 opacity-60" />
                            )}
                            {customActiveKeys.includes('price') && (
                              <span
                                className="absolute bottom-2 right-2 px-2.5 py-0.5 rounded font-black font-mono shadow-md bg-white/95 dark:bg-black/90 border border-black/10 dark:border-white/10"
                                style={{ color: customPriceColor, fontSize: `${customPriceFontSize}px` }}
                              >
                                {priceVar?.currentValue || '₹0.00'}
                              </span>
                            )}
                          </div>

                          {/* Content & Specs */}
                          <div className="space-y-1.5 flex-1">
                            {customActiveKeys.includes('name') && (
                              <h4
                                className="font-black leading-tight line-clamp-2"
                                style={{ color: customTitleColor, fontSize: `${customTitleFontSize}px` }}
                              >
                                {titleVar?.currentValue || 'Product Name'}
                              </h4>
                            )}

                            {customActiveKeys.includes('sku') && skuVar?.currentValue && (
                              <p className="text-[9.5px] font-mono tracking-wider font-semibold" style={{ color: isDarkColor(customFill) ? '#94a3b8' : '#64748b' }}>
                                SKU: <span className="font-bold" style={{ color: isDarkColor(customFill) ? '#cbd5e1' : '#334155' }}>{skuVar.currentValue}</span>
                              </p>
                            )}

                            {/* Specs List */}
                            {activeSpecVars.length > 0 && (
                              <div className="pt-2.5 border-t border-slate-200/60 dark:border-white/10 space-y-1">
                                {activeSpecVars.map(v => (
                                  <div key={v.key} className="flex items-center justify-between text-[9px] font-medium leading-tight">
                                    <span className="uppercase tracking-wider font-semibold" style={{ color: isDarkColor(customFill) ? '#94a3b8' : '#64748b' }}>{v.label}:</span>
                                    <span className="font-bold font-mono" style={{ color: customSpecsColor, fontSize: `${customSpecsFontSize}px` }}>
                                      {v.currentValue || '-'}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 2. Editorial Overlay Theme */}
                      {customCardTheme === 'editorial-overlay' && (
                        <div className="relative h-72 overflow-hidden flex flex-col justify-end p-4">
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={titleVar?.currentValue || ''}
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                              <Package size={48} className="text-slate-600" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-transparent" />

                          <div className="relative z-10 space-y-1.5 text-white">
                            {customActiveKeys.includes('price') && (
                              <div
                                className="font-black font-mono tracking-tight"
                                style={{ color: customPriceColor, fontSize: `${customPriceFontSize + 2}px` }}
                              >
                                {priceVar?.currentValue || '₹0.00'}
                              </div>
                            )}
                            {customActiveKeys.includes('name') && (
                              <h4
                                className="font-black leading-tight line-clamp-2"
                                style={{ color: '#ffffff', fontSize: `${customTitleFontSize}px` }}
                              >
                                {titleVar?.currentValue || 'Product Name'}
                              </h4>
                            )}
                            {customActiveKeys.includes('sku') && skuVar?.currentValue && (
                              <p className="text-[9.5px] font-mono opacity-80">
                                SKU: {skuVar.currentValue}
                              </p>
                            )}
                            {activeSpecVars.length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-1.5">
                                {activeSpecVars.slice(0, 3).map(v => (
                                  <span key={v.key} className="text-[8px] bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full font-mono font-semibold">
                                    {v.label}: {v.currentValue}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 3. Clean Badge Theme */}
                      {customCardTheme === 'clean-badge' && (
                        <div className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                              {customizingProduct.categoryName || 'FEATURED'}
                            </span>
                            {customActiveKeys.includes('price') && (
                              <span
                                className="font-black font-mono"
                                style={{ color: customPriceColor, fontSize: `${customPriceFontSize}px` }}
                              >
                                {priceVar?.currentValue || '₹0.00'}
                              </span>
                            )}
                          </div>

                          <div className="w-full h-32 rounded bg-black/5 dark:bg-white/5 overflow-hidden flex items-center justify-center border border-black/5 dark:border-white/5">
                            {imgUrl ? (
                              <img src={imgUrl} alt="" className="w-full h-full object-contain p-2" />
                            ) : (
                              <Package size={32} className="text-slate-400 opacity-60" />
                            )}
                          </div>

                          {customActiveKeys.includes('name') && (
                            <h4
                              className="font-bold leading-tight line-clamp-2"
                              style={{ color: customTitleColor, fontSize: `${customTitleFontSize}px` }}
                            >
                              {titleVar?.currentValue || 'Product Name'}
                            </h4>
                          )}

                          {activeSpecVars.length > 0 && (
                            <div className="grid grid-cols-2 gap-1.5 pt-2.5 border-t border-slate-200/50 dark:border-white/10">
                              {activeSpecVars.map(v => (
                                <div key={v.key} className="bg-black/5 dark:bg-white/5 p-1.5 rounded border border-black/5 dark:border-white/5">
                                  <p className="text-[7.5px] uppercase truncate font-semibold" style={{ color: isDarkColor(customFill) ? '#94a3b8' : '#64748b' }}>{v.label}</p>
                                  <p className="text-[9px] font-bold font-mono truncate" style={{ color: customSpecsColor }}>{v.currentValue}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* 4. Minimal Row Theme */}
                      {customCardTheme === 'minimal-row' && (
                        <div className="p-3.5 flex gap-3.5 items-center">
                          <div className="w-24 h-24 rounded bg-black/5 dark:bg-white/5 shrink-0 overflow-hidden flex items-center justify-center border border-black/5 dark:border-white/5">
                            {imgUrl ? (
                              <img src={imgUrl} alt="" className="w-full h-full object-contain p-1.5" />
                            ) : (
                              <Package size={24} className="text-slate-400 opacity-60" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0 space-y-1">
                            {customActiveKeys.includes('name') && (
                              <h4
                                className="font-bold line-clamp-2 leading-tight"
                                style={{ color: customTitleColor, fontSize: `${customTitleFontSize}px` }}
                              >
                                {titleVar?.currentValue || 'Product Name'}
                              </h4>
                            )}
                            {customActiveKeys.includes('price') && (
                              <div
                                className="font-black font-mono"
                                style={{ color: customPriceColor, fontSize: `${customPriceFontSize}px` }}
                              >
                                {priceVar?.currentValue || '₹0.00'}
                              </div>
                            )}
                            {customActiveKeys.includes('sku') && skuVar?.currentValue && (
                              <p className="text-[8.5px] font-mono truncate font-semibold" style={{ color: isDarkColor(customFill) ? '#94a3b8' : '#64748b' }}>
                                SKU: {skuVar.currentValue}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Footer Action Bar */}
          <div className={`px-4 py-3 border-t flex items-center justify-between shrink-0 ${
            isDark ? 'border-[#262626] bg-[#161616]' : 'border-slate-200 bg-white'
          }`}>
            <button
              type="button"
              onClick={() => setCustomizingProduct(null)}
              className={`px-3 py-1.5 rounded-[5px] text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ArrowLeft size={13} /> Back to Single Items
            </button>

            <button
              type="button"
              onClick={handleSaveCardChanges}
              className="px-5 py-2 bg-[#0F3D3E] hover:bg-[#155455] text-white rounded-[5px] text-xs font-black flex items-center gap-2 shadow-lg shadow-[#0F3D3E]/30 border border-[#E2DCC8]/30 cursor-pointer transition-all hover:scale-102 active:scale-98"
            >
              {editingElementId ? (
                <>
                  <Check size={14} className="text-emerald-300" /> Update Card on Canvas
                </>
              ) : (
                <>
                  <Plus size={14} /> Insert onto Page {currentPageIndex + 1}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleItemsPanel;
