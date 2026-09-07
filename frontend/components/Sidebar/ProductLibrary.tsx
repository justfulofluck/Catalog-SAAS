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

interface TableParamOption {
  key: string;
  label: string;
  enabled: boolean;
}

const ProductLibrary: React.FC = () => {
  const {
    products, categories, addElement, currentPageIndex, catalog,
    reorderProducts, removeProductFromCanvas, setDraggingItem,
    uiTheme, setEditorTab, selectedCategoryId, setSelectedCategoryId
  } = useStore();

  const [search, setSearch] = useState('');
  const sortableRef = useRef<HTMLDivElement>(null);
  const dragOccurred = useRef(false);

  // Multi-Select Mode State
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);

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
          let label = k.replace(/_/g, ' ').toUpperCase();
          if (label.startsWith('FIELD-')) label = 'SPEC ' + label.replace('FIELD-', '');
          const normLabel = label.toLowerCase().replace(/[^a-z0-9]/g, '');

          if (!seenKeys.has(k.toLowerCase()) && !seenLabels.has(normLabel) && typeof prod.customFields![k] !== 'object') {
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
    
    const categoryHeroImg = (targetCat?.thumbnail) ||
      (targetCat?.images && targetCat.images.length > 0 ? targetCat.images[0] : '');

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
      url: getProductImage(product),
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
    <div className={`flex h-full w-full shrink-0 z-10 animate-in slide-in-from-left-4 duration-500 font-sans transition-colors relative ${uiTheme === 'dark' ? 'bg-[#0f172a]' : 'bg-white'}`}>

      {/* Left Column: Categories */}
      <div className={`w-[130px] flex flex-col border-r shrink-0 ${uiTheme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`}>
        <div className={`h-[58px] px-3 py-2.5 border-b flex flex-col justify-center transition-colors ${uiTheme === 'dark' ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
          <h2 className={`text-[10px] font-black uppercase tracking-widest mb-0.5 leading-none ${uiTheme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Categories</h2>
          <p className="text-[8px] font-semibold text-slate-400 leading-tight">{categories.length} total</p>
        </div>
        <div
          className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar cursor-default"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedCategoryId(null);
            }
          }}
        >
          {categories.map((category, idx) => (
            <button
              key={category.id}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedCategoryId(category.id);
              }}
              className={`w-full flex items-center gap-2 p-2 rounded-lg transition-all relative group ${selectedCategoryId === category.id ? (uiTheme === 'dark' ? 'bg-slate-800 text-white shadow-sm' : 'bg-white border border-slate-100 shadow-sm text-indigo-600') : (uiTheme === 'dark' ? 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700')}`}
            >
              <span className={`absolute left-0.5 top-0.5 text-[7px] font-black ${selectedCategoryId === category.id ? 'text-indigo-500' : 'text-slate-400'}`}>
                {String(idx + 1).padStart(2, '0')}
              </span>
              <div className={`w-6 h-6 rounded-md flex items-center justify-center overflow-hidden ml-1 ${selectedCategoryId === category.id ? 'ring-2 ring-indigo-600 ring-offset-1' : ''}`}>
                {category.thumbnail ? (
                  <img src={category.thumbnail} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center ${uiTheme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`}>
                    <Package size={10} />
                  </div>
                )}
              </div>
              <div className="text-left">
                <span className="block text-[10px] font-bold truncate max-w-[70px]">{category.name}</span>
                <span className="block text-[8px] opacity-60 font-medium uppercase tracking-wider">{products.filter(p => p.categoryId === category.id).length}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Column: Products */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className={`h-[58px] px-3 py-2.5 border-b flex flex-col justify-center transition-colors ${uiTheme === 'dark' ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between mb-0.5">
            <h2 className={`text-[10px] font-black uppercase tracking-widest leading-none ${uiTheme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Products</h2>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  setIsMultiSelectMode(!isMultiSelectMode);
                  setSelectedProductIds([]);
                }}
                className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1 ${isMultiSelectMode ? 'bg-indigo-600 text-white shadow-sm' : (uiTheme === 'dark' ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}`}
                title="Select multiple products to create table"
              >
                <CheckSquare size={10} />
                {isMultiSelectMode ? 'Cancel' : 'Select'}
              </button>
              <button
                onClick={() => setEditorTab(null)}
                className={`p-0.5 rounded-lg transition-colors ${uiTheme === 'dark' ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-400'}`}
              >
                <X size={12} />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <h3 className="text-[8px] font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-1.5 leading-tight">
              <Package size={9} />
              {filteredProducts.length} total
            </h3>
            {isMultiSelectMode && (
              <button
                onClick={handleSelectAll}
                className="text-[8px] font-bold text-slate-400 hover:text-indigo-600 uppercase tracking-wider"
              >
                {selectedProductIds.length === filteredProducts.length ? 'Deselect All' : 'Select All'}
              </button>
            )}
          </div>
        </div>

        <div className={`p-2.5 border-b transition-colors ${uiTheme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50/50 border-slate-100'}`}>
          <div className="relative group">
            <Search size={12} className={`absolute left-2.5 top-1/2 -translate-y-1/2 transition-colors ${uiTheme === 'dark' ? 'text-slate-500 group-focus-within:text-indigo-400' : 'text-slate-300 group-focus-within:text-indigo-600'}`} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className={`w-full border rounded-lg pl-8 pr-3 py-1.5 text-[11px] font-bold outline-none transition-all focus:ring-2 ${uiTheme === 'dark' ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:ring-indigo-500/20 focus:border-indigo-500' : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-300 focus:ring-indigo-600/5 focus:border-indigo-600'}`}
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
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
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 border shadow-inner transition-colors ${uiTheme === 'dark' ? 'bg-slate-800/50 border-slate-700 text-slate-600' : 'bg-slate-50 border-slate-100 text-slate-200'}`}>
                <Package size={20} />
              </div>
              <p className={`text-[9px] font-black uppercase tracking-widest leading-relaxed ${uiTheme === 'dark' ? 'text-slate-600' : 'text-slate-400'}`}>
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
                  className={`group flex items-center gap-2 p-2 rounded-xl cursor-pointer transition-all border relative hover:shadow-md ${isSelected ? (uiTheme === 'dark' ? 'bg-indigo-950/40 border-indigo-600 ring-1 ring-indigo-600' : 'bg-indigo-50/80 border-indigo-600 ring-1 ring-indigo-600 shadow-sm') : (uiTheme === 'dark' ? 'bg-slate-800/40 border-slate-800 hover:bg-slate-800 hover:border-indigo-500/30 hover:shadow-black/20' : 'bg-white border-slate-100 hover:bg-slate-50 hover:border-indigo-100 hover:shadow-slate-200/40')}`}
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
                      className={`p-1 rounded-md transition-colors ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-300 dark:text-slate-600'}`}
                    >
                      {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                    </button>
                  ) : (
                    <>
                      <span className={`absolute left-1.5 top-1.5 text-[8px] font-black ${uiTheme === 'dark' ? 'text-slate-400' : 'text-slate-400'}`}>
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <div className={`drag-handle p-0.5 -ml-0.5 cursor-grab active:cursor-grabbing shrink-0 transition-colors ${uiTheme === 'dark' ? 'text-slate-600 hover:text-slate-400' : 'text-slate-200 hover:text-slate-400'}`}>
                        <GripVertical size={12} />
                      </div>
                    </>
                  )}

                  <div className={`w-10 h-10 rounded-xl overflow-hidden shrink-0 border shadow-sm group-hover:scale-105 transition-transform duration-500 ${uiTheme === 'dark' ? 'bg-slate-700 border-slate-700' : 'bg-white border-slate-100'}`}>
                    {(() => {
                      const imgSrc = product.image || (product.customFields && Object.values(product.customFields).find(
                        val => typeof val === 'string' && (val.startsWith('/media') || val.startsWith('http'))
                      )) || null;
                      return imgSrc ? <img src={imgSrc as string} alt={product.name} className="w-full h-full object-cover" /> : null;
                    })()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className={`text-[10px] font-black truncate mb-0.5 transition-colors ${uiTheme === 'dark' ? 'text-slate-200 group-hover:text-indigo-400' : 'text-slate-800 group-hover:text-indigo-600'}`}>
                      {product.name}
                    </div>
                    <div className="flex items-center gap-1 mb-0.5">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: category?.color || '#cbd5e1' }} />
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter truncate">
                        {category?.name || 'General'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-1">
                      <span className={`text-[9px] font-black ${uiTheme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`}>{product.currency}{product.price}</span>
                      {!isMultiSelectMode && (
                        <button
                          onClick={(e) => handleClearFromCanvas(product.id, e)}
                          className={`w-5 h-5 flex items-center justify-center rounded-md transition-all opacity-0 group-hover:opacity-100 ${uiTheme === 'dark' ? 'hover:bg-red-500/20 text-slate-600 hover:text-red-400' : 'hover:bg-red-50 text-slate-200 hover:text-red-500'}`}
                          title="Clear from All Pages"
                        >
                          <Trash2 size={10} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Multi-Select Floating Footer Bar */}
        {isMultiSelectMode && selectedProductIds.length > 0 && (
          <div className={`p-3 border-t flex items-center justify-between gap-2 animate-in slide-in-from-bottom-2 ${uiTheme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-lg'}`}>
            <div>
              <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400">
                {selectedProductIds.length} Selected
              </span>
            </div>
            <button
              onClick={handleOpenTableModal}
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-md flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <Table size={13} />
              Create Table
            </button>
          </div>
        )}
      </div>

      {/* ===================== TABLE CREATION POPUP MODAL ===================== */}
      {isTableModalOpen && (
        <div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className={`w-full max-w-lg rounded-3xl shadow-2xl border overflow-hidden animate-in zoom-in-95 duration-200 ${uiTheme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            
            {/* Modal Header */}
            <div className={`p-6 border-b flex items-center justify-between ${uiTheme === 'dark' ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50'}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30">
                  <Table size={20} />
                </div>
                <div>
                  <h2 className="text-base font-black tracking-tight">Generate Specification Table</h2>
                  <p className="text-xs text-slate-400 font-medium">
                    Configure columns & parameters for {selectedProductIds.length} selected items
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsTableModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              
              {/* Table / Section Title */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Section Header Title
                </label>
                <input
                  type="text"
                  value={tableTitle}
                  onChange={(e) => setTableTitle(e.target.value)}
                  placeholder="e.g. BLING SERIES COB RANGE"
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs font-bold outline-none transition-all ${uiTheme === 'dark' ? 'bg-slate-800 border-slate-700 focus:border-indigo-500' : 'bg-slate-50 border-slate-200 focus:border-indigo-600'}`}
                />
              </div>

              {/* Include Category Picture Toggle */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Category / Hero Image
                </label>
                <button
                  type="button"
                  onClick={() => setIncludeCategoryImage(!includeCategoryImage)}
                  className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between text-left transition-all ${includeCategoryImage ? 'border-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/20' : 'border-slate-200 dark:border-slate-800'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${includeCategoryImage ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                      <ImageIcon size={20} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black">Place Category Picture on Left</h4>
                      <p className="text-[10px] text-slate-400 font-medium">
                        Places the hero product/category picture alongside the table
                      </p>
                    </div>
                  </div>
                  <div className={`p-1 rounded-md ${includeCategoryImage ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-300 dark:text-slate-700'}`}>
                    {includeCategoryImage ? <CheckSquare size={20} /> : <Square size={20} />}
                  </div>
                </button>
              </div>

              {/* Choose Columns / Parameters to Include */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
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
                      className={`p-3 rounded-xl border flex items-center justify-between text-left transition-all ${param.enabled ? 'border-indigo-600 bg-indigo-50/10 dark:bg-indigo-950/30 font-black' : 'border-slate-200 dark:border-slate-800 opacity-60'}`}
                    >
                      <span className="text-[11px] truncate">{param.label}</span>
                      <span className={param.enabled ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-300 dark:text-slate-700'}>
                        {param.enabled ? <CheckSquare size={16} /> : <Square size={16} />}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Table Theme Colors */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Table Header Styling
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400">Header Bg:</span>
                    <input
                      type="color"
                      value={tableHeaderBg}
                      onChange={(e) => setTableHeaderBg(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400">Text Color:</span>
                    <input
                      type="color"
                      value={tableHeaderTextColor}
                      onChange={(e) => setTableHeaderTextColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className={`p-6 border-t flex items-center justify-end gap-3 ${uiTheme === 'dark' ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50'}`}>
              <button
                type="button"
                onClick={() => setIsTableModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerateCustomTable}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-xl shadow-indigo-600/30 flex items-center gap-2 active:scale-95 transition-all"
              >
                <Check size={16} /> Confirm & Insert on Canvas
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ProductLibrary;