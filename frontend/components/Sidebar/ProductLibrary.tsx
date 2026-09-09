import React, { useState, useEffect, useRef } from 'react';
import {
  Package, Search, X, Layers, GripVertical, Trash2, Folder,
  CheckSquare, Square, Table, SlidersHorizontal, Sparkles, Image as ImageIcon,
  Check, ArrowRight, Eye, ChevronRight
} from 'lucide-react';
import Sortable from 'sortablejs';
import { useStore } from '../../store/useStore';
import { Product, CanvasElement, TableData } from '../../types';
import { PAGE_WIDTH, PAGE_HEIGHT } from '../../constants';
import { resolveFieldLabel } from '../../utils/fieldUtils';
import { normalizeImageUrl } from '../../utils/imageUtils';

interface TableParamOption {
  key: string;
  label: string;
  enabled: boolean;
}

const ProductLibrary: React.FC = () => {
  const {
    products, categories, addElement, currentPageIndex, catalog,
    reorderProducts, removeProductFromCanvas, setDraggingItem,
    uiTheme, setEditorTab, selectedCategoryId, setSelectedCategoryId,
    updateProjectSettings
  } = useStore();

  const [search, setSearch] = useState('');
  const sortableRef = useRef<HTMLDivElement>(null);
  const dragOccurred = useRef(false);

  // Multi-Select Mode State
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);

  // Category Visible Parameters Modal State
  const [isCategoryParamsModalOpen, setIsCategoryParamsModalOpen] = useState(false);
  const [targetCategoryForParams, setTargetCategoryForParams] = useState<any>(null);
  const [categoryParamOptions, setCategoryParamOptions] = useState<TableParamOption[]>([]);

  // Table Generator Modal State
  const [tableTitle, setTableTitle] = useState('');
  const [includeCategoryImage, setIncludeCategoryImage] = useState(true);
  const [tableHeaderBg, setTableHeaderBg] = useState('#002b36');
  const [tableHeaderTextColor, setTableHeaderTextColor] = useState('#ffffff');
  const [tableParameters, setTableParameters] = useState<TableParamOption[]>([
    { key: 'sku', label: 'MODEL NO / SKU', enabled: true },
    { key: 'name', label: 'PRODUCTS / SPEC', enabled: true },
    { key: 'cutOut', label: 'CUT-OUT', enabled: true },
    { key: 'color', label: 'COLOR / CCT', enabled: true },
    { key: 'price', label: 'DEALER PRICE', enabled: true },
    { key: 'packing', label: 'PACKING PER BOX', enabled: true }
  ]);

  // Filter products based on selected category (if any) AND search
  const filteredProducts = products.filter(p =>
    (selectedCategoryId ? p.categoryId === selectedCategoryId : true) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()))
  );

  const activeCategory = categories.find(c => c.id === selectedCategoryId) ||
    (filteredProducts.length > 0 && filteredProducts[0].categoryId ? categories.find(c => c.id === filteredProducts[0].categoryId) : null);

  useEffect(() => {
    if (activeCategory) {
      setTableTitle(activeCategory.name.toUpperCase());
    } else if (filteredProducts.length > 0 && filteredProducts[0].categoryId) {
      const cat = categories.find(c => c.id === filteredProducts[0].categoryId);
      if (cat) setTableTitle(cat.name.toUpperCase());
    }
  }, [selectedCategoryId, activeCategory, filteredProducts]);

  useEffect(() => {
    if (sortableRef.current && filteredProducts.length > 0 && !isMultiSelectMode) {
      const sortable = Sortable.create(sortableRef.current, {
        animation: 150,
        handle: '.drag-handle',
        ghostClass: 'sortable-ghost',
        dragClass: 'sortable-drag',
        onEnd: (evt) => {
          const newOrder = Array.from(sortableRef.current!.children).map(
            (el) => (el as HTMLElement).dataset.id!
          );
          reorderProducts(newOrder);
        },
      });
      return () => sortable.destroy();
    }
  }, [filteredProducts.length, selectedCategoryId, isMultiSelectMode]);

  const toggleSelectProduct = (productId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedProductIds(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProductIds.length === filteredProducts.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredProducts.map(p => p.id));
    }
  };

  const handleOpenTableModal = () => {
    if (selectedProductIds.length === 0) return;

    const selectedProds = products.filter(p => selectedProductIds.includes(p.id));
    
    // Always detect Category from selected products or active category
    const targetCatId = selectedCategoryId || (selectedProds.length > 0 ? selectedProds[0].categoryId : null);
    const targetCategory = categories.find(c => c.id === targetCatId) || activeCategory;
    
    if (targetCategory) {
      setTableTitle(targetCategory.name.toUpperCase());
    } else if (selectedProds.length > 0) {
      setTableTitle(selectedProds[0].name.toUpperCase());
    }

    // Normalize duplicate field names (e.g., if 'model_no' or 'sku' or 'product_spec' already exist)
    const baseParams: TableParamOption[] = [
      { key: 'sku', label: 'MODEL NO / SKU', enabled: true },
      { key: 'name', label: 'PRODUCTS / SPEC', enabled: true },
      { key: 'cutOut', label: 'CUT-OUT', enabled: true },
      { key: 'color', label: 'COLOR / CCT', enabled: true },
      { key: 'price', label: 'DEALER PRICE', enabled: true },
      { key: 'packing', label: 'PACKING PER BOX', enabled: true }
    ];

    const seenLabels = new Set<string>();
    const seenKeys = new Set<string>();

    baseParams.forEach(p => {
      seenKeys.add(p.key.toLowerCase());
      seenLabels.add(p.label.toLowerCase().replace(/[^a-z0-9]/g, ''));
    });

    const additionalParams: TableParamOption[] = [];

    // 1. Add parameters from targetCategory customSchema
    if (targetCategory?.customSchema && targetCategory.customSchema.length > 0) {
      targetCategory.customSchema.forEach(field => {
        const key = field.id;
        const normLabel = field.label.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (!seenKeys.has(key.toLowerCase()) && !seenLabels.has(normLabel) && field.type !== 'image') {
          seenKeys.add(key.toLowerCase());
          seenLabels.add(normLabel);
          additionalParams.push({
            key,
            label: field.label.toUpperCase(),
            enabled: false // let user explicitly pick extra columns so table isn't 12-columns wide by default
          });
        }
      });
    }

    // 2. Add any custom fields present on the selected products themselves
    selectedProds.forEach(prod => {
      if (prod.customFields) {
        Object.keys(prod.customFields).forEach(k => {
          if (typeof prod.customFields![k] === 'object') return;
          const resolved = resolveFieldLabel(k, categories, prod);
          if (!resolved) return;
          const label = resolved.toUpperCase();
          const normLabel = label.toLowerCase().replace(/[^a-z0-9]/g, '');

          if (!seenKeys.has(k.toLowerCase()) && !seenLabels.has(normLabel)) {
            seenKeys.add(k.toLowerCase());
            seenLabels.add(normLabel);
            additionalParams.push({
              key: k,
              label,
              enabled: false
            });
          }
        });
      }
    });

    setTableParameters([...baseParams, ...additionalParams]);
    setIsTableModalOpen(true);
  };

  const handleOpenCategoryParamsModal = (category: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setTargetCategoryForParams(category);

    const catProducts = products.filter(p => p.categoryId === category.id);
    const seenKeys = new Set<string>();
    const seenLabels = new Set<string>();
    const options: TableParamOption[] = [];

    // Current saved visible params for this category (if any)
    const catIdStr = String(category.id);
    const savedKeys: string[] | undefined = 
      catalog?.categoryVisibleParams?.[catIdStr] ?? 
      catalog?.categoryVisibleParams?.[category.id] ??
      Object.entries(catalog?.categoryVisibleParams || {}).find(([k]) => String(k) === catIdStr)?.[1];

    const isFieldEnabled = (key: string, label: string) => {
      if (!savedKeys) return true;
      const normKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
      const normLabel = label.toLowerCase().replace(/[^a-z0-9]/g, '');
      return savedKeys.some(sk => {
        const normSk = sk.toLowerCase().replace(/[^a-z0-9]/g, '');
        return sk === key || normSk === normKey || normSk === normLabel;
      });
    };

    // 1. Check customSchema from category
    if (category.customSchema && category.customSchema.length > 0) {
      category.customSchema.forEach((f: any) => {
        if (f.type === 'image') return;
        const key = f.id;
        const norm = f.label.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (!seenKeys.has(key.toLowerCase()) && !seenLabels.has(norm)) {
          seenKeys.add(key.toLowerCase());
          seenLabels.add(norm);
          options.push({
            key,
            label: f.label.toUpperCase(),
            enabled: isFieldEnabled(key, f.label)
          });
        }
      });
    }

    // 2. Scan fields on existing products of this category
    catProducts.forEach(prod => {
      if (prod.customFields) {
        Object.keys(prod.customFields).forEach(k => {
          if (typeof prod.customFields![k] === 'object') return;
          const resolved = resolveFieldLabel(k, categories, prod);
          if (!resolved) return;
          const norm = resolved.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (!seenKeys.has(k.toLowerCase()) && !seenLabels.has(norm)) {
            seenKeys.add(k.toLowerCase());
            seenLabels.add(norm);
            options.push({
              key: k,
              label: resolved.toUpperCase(),
              enabled: isFieldEnabled(k, resolved)
            });
          }
        });
      }
    });

    setCategoryParamOptions(options);
    setIsCategoryParamsModalOpen(true);
  };

  const handleSaveCategoryParams = () => {
    if (!targetCategoryForParams) return;
    const catId = String(targetCategoryForParams.id);
    const rawCatId = targetCategoryForParams.id;
    const enabledKeys = categoryParamOptions.filter(o => o.enabled).map(o => o.key);

    const currentMap = { ...(catalog?.categoryVisibleParams || {}) };
    currentMap[catId] = enabledKeys;
    currentMap[rawCatId] = enabledKeys;

    updateProjectSettings({
      categoryVisibleParams: currentMap,
      updatedAt: new Date().toISOString()
    });
    setIsCategoryParamsModalOpen(false);
  };

  const handleGenerateCustomTable = () => {
    const selectedProds = products.filter(p => selectedProductIds.includes(p.id));
    if (selectedProds.length === 0) return;

    const timestamp = Date.now();
    const activeParams = tableParameters.filter(p => p.enabled);
    const numActiveCols = activeParams.length;

    // Build rows from products & their variants
    const tableRows: string[][] = [];
    selectedProds.forEach(prod => {
      if (prod.variants && prod.variants.length > 0) {
        prod.variants.forEach(v => {
          const row: string[] = [];
          activeParams.forEach(param => {
            switch (param.key) {
              case 'sku':
                row.push(v.sku || prod.sku || '-');
                break;
              case 'name':
                row.push(v.name || prod.name || '-');
                break;
              case 'cutOut':
                row.push(v.cutOut || prod.customFields?.cutOut || prod.customFields?.cut_out || '75MM');
                break;
              case 'color':
                row.push(v.color || prod.customFields?.color || prod.customFields?.cct || 'W, W.W, N.W');
                break;
              case 'price':
                row.push(typeof v.price === 'number' ? `${prod.currency || '$'}${v.price}` : (v.price ? `${v.price}` : `${prod.currency || '$'}${prod.price}`));
                break;
              case 'packing':
                row.push(v.packing || prod.customFields?.packing || '20 PCS');
                break;
              default: {
                const customVal = (v.customAttributes && v.customAttributes[param.key]) ||
                  (prod.customFields && prod.customFields[param.key]) ||
                  (prod as any)[param.key] ||
                  '-';
                row.push(String(customVal));
                break;
              }
            }
          });
          tableRows.push(row);
        });
      } else {
        const row: string[] = [];
        activeParams.forEach(param => {
          switch (param.key) {
            case 'sku':
              row.push(prod.sku || '-');
              break;
            case 'name':
              row.push(prod.name || '-');
              break;
            case 'cutOut':
              row.push(prod.customFields?.cutOut || prod.customFields?.cut_out || '75MM');
              break;
            case 'color':
              row.push(prod.customFields?.color || prod.customFields?.cct || 'W, W.W, N.W');
              break;
            case 'price':
              row.push(`${prod.currency || '$'}${prod.price}`);
              break;
            case 'packing':
              row.push(prod.customFields?.packing || '20 PCS');
              break;
            default: {
              const customVal = (prod.customFields && prod.customFields[param.key]) ||
                (prod as any)[param.key] ||
                '-';
              row.push(String(customVal));
              break;
            }
          }
        });
        tableRows.push(row);
      }
    });

    // Determine Category Image (Strictly category thumbnail or category images list)
    const targetCatId = selectedCategoryId || (selectedProds.length > 0 ? selectedProds[0].categoryId : null);
    const targetCat = categories.find(c => c.id === targetCatId) || activeCategory;
    
    const categoryHeroImg = normalizeImageUrl((targetCat?.thumbnail) ||
      (targetCat?.images && targetCat.images.length > 0 ? targetCat.images[0] : ''));

    const targetPage = catalog.pages[currentPageIndex];
    const pageHasHeader = (targetPage as any)?.hasHeader !== false && catalog.hasHeader && (targetPage?.type === 'product' || targetPage?.type === 'interior' || targetPage?.type === 'index');
    const headerBottom = pageHasHeader ? (catalog.marginTop || 0) + (catalog.headerHeight || 40) + 20 : (catalog.marginTop || 0) + 20;

    const pageElements = targetPage?.elements || [];
    const contentElements = pageElements.filter(el => {
      const isBg = (typeof el.id === 'string' && el.id.endsWith('-bg')) || (el.x === 0 && el.y === 0 && el.width === PAGE_WIDTH && el.height === PAGE_HEIGHT);
      return !isBg;
    });

    let startY = Math.max(headerBottom, 45);
    if (contentElements.length > 0) {
      const maxY = Math.max(...contentElements.map(e => (e.y || 0) + (e.height || 0)));
      if (maxY >= startY) {
        startY = maxY + 25;
      }
    }

    // Calculate layout dimensions based on column count
    // If table has many columns (>6), give it more width or place below image
    const hasCategoryImg = includeCategoryImage && !!categoryHeroImg;
    
    // If many columns (7+), image is placed top/left and table spans full page width to remain crisp
    const tableX = hasCategoryImg && numActiveCols <= 6 ? 320 : 45;
    const tableWidth = hasCategoryImg && numActiveCols <= 6 ? 430 : 704;
    const imgWidth = hasCategoryImg && numActiveCols <= 6 ? 260 : 220;
    const imgHeight = hasCategoryImg && numActiveCols <= 6 ? 220 : 160;

    // 1. Add Category/Section Title Text
    if (tableTitle) {
      addElement(currentPageIndex, {
        id: `table-heading-${timestamp}`,
        type: 'text',
        x: hasCategoryImg && numActiveCols <= 6 ? 320 : 45,
        y: startY,
        width: hasCategoryImg && numActiveCols <= 6 ? 430 : 704,
        height: 35,
        text: tableTitle,
        fontSize: 22,
        fontFamily: 'Montserrat',
        fontWeight: '900',
        fill: '#00a651',
        letterSpacing: 0.5,
        rotation: 0,
        opacity: 1,
        zIndex: 10
      });
    }

    // 2. Add Category/Hero Image on the Left (if enabled)
    if (hasCategoryImg) {
      addElement(currentPageIndex, {
        id: `table-category-hero-${timestamp}`,
        type: 'image',
        x: 45,
        y: startY,
        width: imgWidth,
        height: imgHeight,
        src: categoryHeroImg,
        rotation: 0,
        opacity: 1,
        zIndex: 5
      });
    }

    // 3. Add Dynamic Table Element
    const tableY = startY + (tableTitle ? 40 : 0);
    const tableHeight = Math.max(85, tableRows.length * 28 + 35);

    addElement(currentPageIndex, {
      id: `table-custom-${timestamp}`,
      type: 'table',
      x: tableX,
      y: tableY,
      width: tableWidth,
      height: tableHeight,
      rotation: 0,
      opacity: 1,
      zIndex: 20,
      tableData: {
        headers: activeParams.map(p => p.label),
        rows: tableRows,
        headerBg: tableHeaderBg,
        headerTextColor: tableHeaderTextColor,
        alternateRowBg: '#f8fafc',
        rowBg: '#ffffff',
        borderColor: '#334155',
        fontSize: numActiveCols > 6 ? 7.5 : 8.5,
        headerFontSize: numActiveCols > 6 ? 8.5 : 9.5,
        cellPadding: 4
      }
    });

    setIsTableModalOpen(false);
    setIsMultiSelectMode(false);
    setSelectedProductIds([]);
  };

  const handleAddProduct = (product: Product) => {
    const timestamp = Date.now();
    const currentPage = catalog.pages[currentPageIndex];

    // Improved slot detection
    const slots = currentPage.elements.filter(el => el.id.includes('slot'));
    const occupiedSlotIdentifiers = new Set(
      currentPage.elements
        .filter(el => el.productId)
        .map(el => {
          const parts = el.id.split('-');
          const slotPartIndex = parts.findIndex(p => p === 'slot');
          if (slotPartIndex !== -1 && slotPartIndex + 1 < parts.length) {
            return `slot-${parts[slotPartIndex + 1]}`;
          }
          return null;
        })
        .filter(Boolean)
    );

    const targetSlot = slots.find(s => {
      const sParts = s.id.split('-');
      const slotPartIndex = sParts.findIndex(p => p === 'slot');
      if (slotPartIndex !== -1 && slotPartIndex + 1 < sParts.length) {
        const id = `slot-${sParts[slotPartIndex + 1]}`;
        return !occupiedSlotIdentifiers.has(id);
      }
      return true;
    });

    let x = 100, y = 100, width = 250, height = 320;
    let slotTag = '';

    if (targetSlot) {
      x = targetSlot.x;
      y = targetSlot.y;
      width = targetSlot.width;
      height = targetSlot.height;
      const sParts = targetSlot.id.split('-');
      const sIdx = sParts.findIndex(p => p === 'slot');
      slotTag = sIdx !== -1 ? `slot-${sParts[sIdx + 1]}` : `slot-${timestamp}`;
    } else {
      slotTag = `slot-${timestamp}`;
    }

    if (product.variants && product.variants.length > 0) {
      // Product with Variants Hierarchy: Add Hero Image + Dynamic Variant Table Grid
      const tableRows = product.variants.map(v => [
        v.sku || product.sku || '',
        v.name || product.name || '',
        v.cutOut || '75MM',
        v.color || 'W, W.W, N.W',
        typeof v.price === 'number' ? `${product.currency || '$'}${v.price}` : (v.price || `${product.currency || '$'}${product.price}`),
        v.packing || '20 PCS'
      ]);

      if (product.image) {
        addElement(currentPageIndex, {
          id: `product-hero-img-${timestamp}`,
          type: 'image',
          x: 60,
          y: Math.min(y, 350),
          width: 240,
          height: 180,
          rotation: 0,
          opacity: 1,
          src: product.image,
          zIndex: 15
        });
      }

      addElement(currentPageIndex, {
        id: `table-variant-${product.id}-${timestamp}`,
        type: 'table',
        x: product.image ? 320 : 60,
        y: Math.min(y, 350),
        width: product.image ? 420 : 680,
        height: Math.max(100, product.variants.length * 30 + 35),
        rotation: 0,
        opacity: 1,
        productId: product.id,
        zIndex: 20,
        tableData: {
          headers: ['MODEL NO', 'PRODUCTS', 'CUT-OUT', 'COLOR', 'PRICE', 'PACKING'],
          rows: tableRows,
          headerBg: '#002b36',
          headerTextColor: '#ffffff',
          alternateRowBg: '#f8fafc',
          rowBg: '#ffffff',
          borderColor: '#334155',
          fontSize: 8.5,
          headerFontSize: 9.5,
          cellPadding: 5
        }
      });
    } else {
      // Standard Product Block
      addElement(currentPageIndex, {
        id: `product-block-${slotTag}-${timestamp}`,
        type: 'product-block',
        x, y, width, height,
        rotation: 0, opacity: 1,
        productId: product.id,
        zIndex: 20
      });
    }
  };

  const handleDragStart = (e: React.DragEvent, product: Product) => {
    dragOccurred.current = true;
    const getProductImage = (p: Product) => {
      if (p.image) return p.image;
      if (p.customFields) {
        const firstImg = Object.values(p.customFields).find(
          val => typeof val === 'string' && (val.startsWith('/media') || val.startsWith('http'))
        );
        if (firstImg) return firstImg as string;
      }
      return '';
    };

    const dragData = {
      type: 'product',
      url: normalizeImageUrl(getProductImage(product)),
      name: product.name,
      productId: product.id
    };
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = 'copy';
    setDraggingItem(dragData);
  };

  const handleDragEnd = () => {
    setDraggingItem(null);
    setTimeout(() => {
      dragOccurred.current = false;
    }, 50);
  };

  const handleClearFromCanvas = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeProductFromCanvas(productId);
  };

  return (
    <div className="flex h-full w-full shrink-0 z-10 animate-in slide-in-from-left-4 duration-300 font-sans transition-colors relative bg-[#161616] text-white">

      {/* Left Column: Categories */}
      <div className="w-[145px] flex flex-col border-r shrink-0 border-[#262626] bg-[#141414]">
        <div className="h-14 px-3 py-2 border-b flex flex-col justify-center transition-colors bg-[#161616] border-[#262626]">
          <h2 className="text-[10px] font-bold uppercase tracking-wider mb-0.5 leading-none text-white">Categories</h2>
          <p className="text-[8px] font-medium text-[#888] leading-tight">{categories.length} total</p>
        </div>
        <div
          className="flex-1 overflow-y-auto p-1.5 space-y-1 custom-scrollbar cursor-default"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedCategoryId(null);
            }
          }}
        >
          {categories.map((category, idx) => (
            <div
              key={category.id}
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedCategoryId(category.id);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedCategoryId(category.id);
                }
              }}
              className={`w-full flex items-center gap-2 p-1.5 rounded-[4px] cursor-pointer transition-all relative group text-left ${selectedCategoryId === category.id ? 'bg-[#262626] text-white border-l-2 border-[#0F3D3E]' : 'text-[#aaa] hover:bg-[#1f1f1f] hover:text-white'}`}
            >
              <div className={`w-6 h-6 rounded-[2px] flex items-center justify-center overflow-hidden shrink-0 ${selectedCategoryId === category.id ? 'ring-1 ring-[#0F3D3E]' : ''}`}>
                {category.thumbnail ? (
                  <img src={category.thumbnail} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#222] text-[#666]">
                    <Package size={11} />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[10px] font-bold truncate leading-tight" title={category.name}>{category.name}</span>
                <span className="block text-[8px] text-[#777] font-medium leading-tight">{products.filter(p => p.categoryId === category.id).length} items</span>
              </div>
              <button
                type="button"
                onClick={(e) => handleOpenCategoryParamsModal(category, e)}
                title="Configure Visible Parameters on Card"
                className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#333] text-[#888] hover:text-[#E2DCC8]"
              >
                <SlidersHorizontal size={11} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Products */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#161616]">
        <div className="h-14 px-3 py-2 border-b flex flex-col justify-center transition-colors bg-[#161616] border-[#262626]">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-[10px] font-bold uppercase tracking-wider leading-none text-white">Products</h2>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  setIsMultiSelectMode(!isMultiSelectMode);
                  setSelectedProductIds([]);
                }}
                className={`px-2 py-0.5 rounded-[4px] text-[9px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 ${isMultiSelectMode ? 'bg-[#0F3D3E] text-white shadow-sm' : 'bg-[#262626] text-slate-300 hover:bg-[#333]'}`}
                title="Select multiple products to create table"
              >
                <CheckSquare size={10} />
                {isMultiSelectMode ? 'Cancel' : 'Select'}
              </button>
              <button
                onClick={() => setEditorTab(null)}
                className="p-1 rounded-[4px] transition-colors hover:bg-[#262626] text-[#888] hover:text-white"
              >
                <X size={12} />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <h3 className="text-[8px] font-bold text-[#E2DCC8] uppercase tracking-wider flex items-center gap-1 leading-tight">
              <Package size={9} />
              {filteredProducts.length} total
            </h3>
            <div className="flex items-center gap-2">
              {activeCategory && (
                <button
                  type="button"
                  onClick={(e) => handleOpenCategoryParamsModal(activeCategory, e)}
                  title="Choose which parameters show on product cards for this category"
                  className="text-[8px] font-bold text-[#888] hover:text-[#E2DCC8] uppercase tracking-wider flex items-center gap-1 transition-colors"
                >
                  <SlidersHorizontal size={9} />
                  Parameters
                </button>
              )}
              {isMultiSelectMode && (
                <button
                  onClick={handleSelectAll}
                  className="text-[8px] font-bold text-[#888] hover:text-[#E2DCC8] uppercase tracking-wider"
                >
                  {selectedProductIds.length === filteredProducts.length ? 'Deselect All' : 'Select All'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-2 border-b transition-colors bg-[#141414] border-[#262626]">
          <div className="relative group">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 transition-colors text-[#666] group-focus-within:text-[#E2DCC8]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full border rounded-[4px] pl-7 pr-3 py-1.5 text-[11px] font-medium outline-none transition-all bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-[#666] focus:border-[#0F3D3E]"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#666] hover:text-white">
                <X size={10} />
              </button>
            )}
          </div>
        </div>

        {/* Product Items List */}
        <div
          ref={sortableRef}
          className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar"
        >
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="w-9 h-9 rounded-[4px] flex items-center justify-center mb-2.5 border transition-colors bg-[#1e1e1e] border-[#262626] text-[#555]">
                <Package size={18} />
              </div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-[#666]">
                No products found
              </p>
            </div>
          ) : (
            filteredProducts.map((product, idx) => {
              const category = categories.find(c => c.id === product.categoryId);
              const isSelected = selectedProductIds.includes(product.id);

              return (
                <div
                  key={product.id}
                  data-id={product.id}
                  draggable={!isMultiSelectMode}
                  onDragStart={(e) => !isMultiSelectMode && handleDragStart(e, product)}
                  onDragEnd={handleDragEnd}
                  className={`group flex items-center gap-2 p-2 rounded-[4px] cursor-pointer transition-all border relative ${isSelected ? 'bg-[#0F3D3E]/10 border-[#0F3D3E]' : 'bg-[#1a1a1a] border-[#262626] hover:border-[#383838] hover:bg-[#202020]'}`}
                  onClick={() => {
                    if (isMultiSelectMode) {
                      toggleSelectProduct(product.id);
                    } else {
                      if (dragOccurred.current) return;
                      handleAddProduct(product);
                    }
                  }}
                >
                  {isMultiSelectMode ? (
                    <button
                      type="button"
                      onClick={(e) => toggleSelectProduct(product.id, e)}
                      className={`p-0.5 rounded transition-colors ${isSelected ? 'text-[#E2DCC8]' : 'text-[#666]'}`}
                    >
                      {isSelected ? <CheckSquare size={14} /> : <Square size={14} />}
                    </button>
                  ) : (
                    <div className="drag-handle p-0.5 cursor-grab active:cursor-grabbing shrink-0 transition-colors text-[#555] hover:text-[#888]">
                      <GripVertical size={12} />
                    </div>
                  )}

                  {/* Thumbnail */}
                  <div className="w-9 h-9 rounded-[2px] overflow-hidden shrink-0 border transition-transform duration-300 bg-[#121212] border-[#2a2a2a]">
                    {(() => {
                      const rawSrc = product.image || (product.customFields && Object.values(product.customFields).find(
                        val => typeof val === 'string' && (val.startsWith('/media') || val.startsWith('http'))
                      )) || null;
                      const imgSrc = rawSrc ? normalizeImageUrl(rawSrc as string) : null;
                      return imgSrc ? <img src={imgSrc} alt={product.name} className="w-full h-full object-contain" /> : (
                        <div className="w-full h-full flex items-center justify-center text-[#555]">
                          <Package size={12} />
                        </div>
                      );
                    })()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-bold truncate leading-snug transition-colors text-white group-hover:text-[#E2DCC8]">
                      {product.name}
                    </div>
                    <div className="flex items-center gap-1.5 my-0.5">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: category?.color || '#0F3D3E' }} />
                      <span className="text-[8px] font-semibold text-[#888] uppercase tracking-wider truncate">
                        {category?.name || 'General'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-black text-[#E2DCC8]">{product.currency}{product.price}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Multi-Select Floating Footer Bar */}
        {isMultiSelectMode && selectedProductIds.length > 0 && (
          <div className={`p-2.5 border-t border-[#262626] flex items-center justify-between gap-2 animate-in slide-in-from-bottom-2 ${uiTheme === 'dark' ? 'bg-[#141414]' : 'bg-white shadow-lg'}`}>
            <div>
              <span className="text-[10px] font-bold text-[#E2DCC8]">
                {selectedProductIds.length} Selected
              </span>
            </div>
            <button
              onClick={handleOpenTableModal}
              className="px-3 py-1.5 bg-[#0F3D3E] hover:bg-[#155455] border border-[#E2DCC8]/30 text-white rounded-[4px] text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <Table size={12} />
              Create Table
            </button>
          </div>
        )}
      </div>

      {/* ===================== TABLE CREATION POPUP MODAL ===================== */}
      {isTableModalOpen && (
        <div className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className={`w-full max-w-lg rounded-[6px] shadow-2xl border overflow-hidden animate-in zoom-in-95 duration-200 ${uiTheme === 'dark' ? 'bg-[#161616] border-[#262626] text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            
            {/* Modal Header */}
            <div className={`p-5 border-b flex items-center justify-between ${uiTheme === 'dark' ? 'border-[#262626] bg-[#121212]' : 'border-slate-100 bg-slate-50'}`}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[4px] bg-[#0F3D3E] text-white flex items-center justify-center shadow-md shadow-[#0F3D3E]/20">
                  <Table size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-bold tracking-tight">Generate Specification Table</h2>
                  <p className="text-[11px] text-[#888] font-medium">
                    Configure columns & parameters for {selectedProductIds.length} selected items
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsTableModalOpen(false)}
                className="p-1.5 rounded-[4px] text-[#888] hover:text-white hover:bg-[#262626] transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
              
              {/* Table / Section Title */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#888]">
                  Section Header Title
                </label>
                <input
                  type="text"
                  value={tableTitle}
                  onChange={(e) => setTableTitle(e.target.value)}
                  placeholder="e.g. BLING SERIES COB RANGE"
                  className={`w-full px-3 py-2 rounded-[4px] border text-xs font-medium outline-none transition-all ${uiTheme === 'dark' ? 'bg-[#1a1a1a] border-[#2a2a2a] text-white focus:border-[#0F3D3E]' : 'bg-slate-50 border-slate-200 focus:border-[#0F3D3E]'}`}
                />
              </div>

              {/* Include Category Picture Toggle */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#888]">
                  Category / Hero Image
                </label>
                <button
                  type="button"
                  onClick={() => setIncludeCategoryImage(!includeCategoryImage)}
                  className={`w-full p-3.5 rounded-[4px] border flex items-center justify-between text-left transition-all ${includeCategoryImage ? 'border-[#0F3D3E] bg-[#0F3D3E]/10' : 'border-[#262626] bg-[#1a1a1a]'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-[4px] flex items-center justify-center ${includeCategoryImage ? 'bg-[#0F3D3E] text-white' : 'bg-[#222] text-[#888]'}`}>
                      <ImageIcon size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold">Place Category Picture on Left</h4>
                      <p className="text-[10px] text-[#888] font-medium">
                        Places the hero product/category picture alongside the table
                      </p>
                    </div>
                  </div>
                  <div className={`p-1 rounded ${includeCategoryImage ? 'text-[#E2DCC8]' : 'text-[#666]'}`}>
                    {includeCategoryImage ? <CheckSquare size={18} /> : <Square size={18} />}
                  </div>
                </button>
              </div>

              {/* Choose Columns / Parameters to Include */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#888]">
                  Table Columns & Parameters
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {tableParameters.map((param, pIdx) => (
                    <button
                      key={param.key}
                      type="button"
                      onClick={() => {
                        const updated = [...tableParameters];
                        updated[pIdx].enabled = !updated[pIdx].enabled;
                        setTableParameters(updated);
                      }}
                      className={`p-2.5 rounded-[4px] border flex items-center justify-between text-left transition-all ${param.enabled ? 'border-[#0F3D3E] bg-[#0F3D3E]/10 font-bold text-white' : 'border-[#262626] bg-[#1a1a1a] text-[#888]'}`}
                    >
                      <span className="text-[11px] truncate">{param.label}</span>
                      <span className={param.enabled ? 'text-[#E2DCC8]' : 'text-[#666]'}>
                        {param.enabled ? <CheckSquare size={14} /> : <Square size={14} />}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Table Theme Colors */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#888]">
                  Table Header Styling
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[#888]">Header Bg:</span>
                    <input
                      type="color"
                      value={tableHeaderBg}
                      onChange={(e) => setTableHeaderBg(e.target.value)}
                      className="w-7 h-7 rounded-[4px] cursor-pointer border border-[#262626]"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[#888]">Text Color:</span>
                    <input
                      type="color"
                      value={tableHeaderTextColor}
                      onChange={(e) => setTableHeaderTextColor(e.target.value)}
                      className="w-7 h-7 rounded-[4px] cursor-pointer border border-[#262626]"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className={`p-4 border-t flex items-center justify-end gap-2.5 ${uiTheme === 'dark' ? 'border-[#262626] bg-[#121212]' : 'border-slate-100 bg-slate-50'}`}>
              <button
                type="button"
                onClick={() => setIsTableModalOpen(false)}
                className="px-4 py-2 rounded-[4px] text-xs font-bold text-[#888] hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerateCustomTable}
                className="px-5 py-2 bg-[#0F3D3E] hover:bg-[#155455] border border-[#E2DCC8]/30 text-white rounded-[4px] text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-2 active:scale-95 transition-all"
              >
                <Check size={14} /> Confirm & Insert on Canvas
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ===================== CATEGORY VISIBLE PARAMETERS MODAL ===================== */}
      {isCategoryParamsModalOpen && targetCategoryForParams && (
        <div className="fixed inset-0 z-[999] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-[8px] shadow-2xl border overflow-hidden animate-in zoom-in-95 duration-200 bg-[#161616] border-[#2c2c2c] text-white">
            
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between border-[#262626] bg-[#121212]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-[4px] bg-[#0F3D3E] text-white flex items-center justify-center shadow-md shadow-[#0F3D3E]/25">
                  <SlidersHorizontal size={16} />
                </div>
                <div>
                  <h2 className="text-[13px] font-bold text-white tracking-tight">Card Parameters: {targetCategoryForParams.name}</h2>
                  <p className="text-[11px] text-[#999999] font-medium">
                    Select which specifications to display on product cards
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCategoryParamsModalOpen(false)}
                className="p-1.5 rounded-[4px] text-[#888888] hover:text-white hover:bg-[#262626] transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar bg-[#161616]">
              <div className="flex items-center justify-between pb-2 border-b border-[#262626]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#999999]">
                  Available Specifications ({categoryParamOptions.length})
                </span>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setCategoryParamOptions(prev => prev.map(o => ({ ...o, enabled: true })));
                    }}
                    className="text-[11px] font-bold text-[#E2DCC8] hover:underline"
                  >
                    Select All
                  </button>
                  <span className="text-[#444444]">|</span>
                  <button
                    type="button"
                    onClick={() => {
                      setCategoryParamOptions(prev => prev.map(o => ({ ...o, enabled: false })));
                    }}
                    className="text-[11px] font-bold text-[#888888] hover:text-white"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              {categoryParamOptions.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#888888]">
                  No custom parameters found for this category yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {categoryParamOptions.map((opt, idx) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => {
                        const updated = [...categoryParamOptions];
                        updated[idx].enabled = !updated[idx].enabled;
                        setCategoryParamOptions(updated);
                      }}
                      className={`p-3 rounded-[6px] border flex items-center justify-between text-left transition-all ${
                        opt.enabled 
                          ? 'border-[#0F3D3E] bg-[#0F3D3E]/15 text-white shadow-sm' 
                          : 'border-[#262626] bg-[#1a1a1a] text-[#aaaaaa] hover:border-[#383838] hover:bg-[#202020]'
                      }`}
                    >
                      <span className={`text-[12px] font-medium tracking-wide truncate ${opt.enabled ? 'font-bold text-white' : 'text-[#cccccc]'}`}>
                        {opt.label}
                      </span>
                      <span className={opt.enabled ? 'text-[#E2DCC8]' : 'text-[#555555]'}>
                        {opt.enabled ? <CheckSquare size={17} /> : <Square size={17} />}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3.5 border-t flex items-center justify-end gap-2.5 border-[#262626] bg-[#121212]">
              <button
                type="button"
                onClick={() => setIsCategoryParamsModalOpen(false)}
                className="px-4 py-2 rounded-[4px] text-xs font-bold text-[#999999] hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCategoryParams}
                className="px-4 py-2 bg-[#0F3D3E] hover:bg-[#155455] border border-[#E2DCC8]/30 text-white rounded-[4px] text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <Check size={14} /> Save & Update Cards
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ProductLibrary;