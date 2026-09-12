import React, { useState, useEffect, useRef } from 'react';
import {
  X, Sparkles, Image as ImageIcon, Plus, Trash2,
  ArrowUp, ArrowDown, Check, Package, Palette,
  Upload, Layers, Zap, SlidersHorizontal, ChevronRight,
  ChevronLeft, ChevronDown, Grid, MoveRight, MoveLeft, ExternalLink,
  FileText, Copy, ArrowRightLeft, Eye, CheckCircle2, Search
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Product, ProductVariant, ProductGridSection, TableData, CatalogPage, Category } from '../../types';
import { normalizeImageUrl, resolveProductImage, resolveProductTitle } from '../../utils/imageUtils';
import { resolveFieldLabel } from '../../utils/fieldUtils';

export const getCategoryProductsForPage = (
  page: CatalogPage | undefined,
  pageIndex: number,
  products: Product[],
  categories: { id: string | number; name: string }[]
): { categoryName: string; categoryProducts: Product[] } => {
  if (!products || products.length === 0) return { categoryName: 'Products', categoryProducts: [] };

  // 1. Direct categoryId on page
  if (page?.categoryId) {
    const cat = categories.find(c => String(c.id) === String(page.categoryId));
    const catProds = products.filter(p => String(p.categoryId) === String(page.categoryId));
    if (catProds.length > 0) {
      return { categoryName: cat?.name || 'Category', categoryProducts: catProds };
    }
  }

  // 2. Elements on the page with productId
  if (page?.elements) {
    for (const el of page.elements) {
      if (el.productId) {
        const prod = products.find(p => p.id === el.productId);
        if (prod?.categoryId) {
          const cat = categories.find(c => String(c.id) === String(prod.categoryId));
          const catProds = products.filter(p => String(p.categoryId) === String(prod.categoryId));
          if (catProds.length > 0) {
            return { categoryName: cat?.name || 'Category', categoryProducts: catProds };
          }
        }
      }
    }
  }

  // 3. Round-robin by non-cover index
  const nonCoverOffset = Math.max(0, pageIndex >= 1 ? pageIndex - 1 : 0);
  if (categories.length > 0) {
    const cat = categories[nonCoverOffset % categories.length];
    const catProds = products.filter(p => String(p.categoryId) === String(cat.id));
    if (catProds.length > 0) {
      return { categoryName: cat.name, categoryProducts: catProds };
    }
  }

  // 4. Fallback to all products
  return { categoryName: 'Products', categoryProducts: products };
};

export const generateSectionsFromRealProducts = (
  page: CatalogPage | undefined,
  pageIndex: number,
  products: Product[],
  categories: { id: string | number; name: string; thumbnail?: string; images?: string[]; customSchema?: any[] }[]
): ProductGridSection[] => {
  if (!categories || categories.length === 0) {
    // Clean fallback if no categories exist
    return [
      {
        id: 'sec-1',
        title: 'PRODUCT SERIES 1',
        titleColor: '#00a651',
        titleFontSize: 22,
        imageSrc: '',
        hasBackground: false,
        backgroundColor: '#f1f5f9',
        tableData: {
          headers: ['MODEL NO', 'PRODUCTS', 'PRICE'],
          rows: [['-', 'Product Series 1', '-']],
          headerBg: '#002b36',
          headerTextColor: '#ffffff',
          alternateRowBg: '#f8fafc',
          rowBg: '#ffffff',
          borderColor: '#002b36',
          fontSize: 7.5,
          headerFontSize: 8,
          cellPadding: 4,
          colWidths: [80, 200, 80]
        }
      }
    ];
  }

  // Calculate which 3 distinct categories belong to this page
  const nonCoverOffset = Math.max(0, pageIndex >= 1 ? pageIndex - 1 : 0);
  const startIdx = (nonCoverOffset * 3) % categories.length;
  const pageCats: typeof categories = [];

  for (let i = 0; i < Math.min(3, categories.length); i++) {
    pageCats.push(categories[(startIdx + i) % categories.length]);
  }

  const result: ProductGridSection[] = pageCats.map((cat, sIdx) => {
    const catProds = products.filter(p => String(p.categoryId) === String(cat.id));
    const catImg = resolveProductImage(catProds[0], cat, catProds);
    const headers = ['MODEL NO', 'PRODUCTS', 'PRICE'];
    const rows: string[][] = [];

    if (catProds.length > 0) {
      catProds.forEach(p => {
        if (p.variants && p.variants.length > 0) {
          p.variants.forEach(v => rows.push(generateRowFromProduct(headers, p, v, categories)));
        } else {
          rows.push(generateRowFromProduct(headers, p, undefined, categories));
        }
      });
    } else {
      rows.push(['-', `${cat.name} Series`, '-']);
    }

    return {
      id: `sec-${sIdx + 1}`,
      title: cat.name.toUpperCase(),
      titleColor: '#00a651',
      titleFontSize: 22,
      imageSrc: catImg,
      hasBackground: sIdx % 2 === 1,
      backgroundColor: '#e2e8f0',
      tableData: {
        headers,
        rows,
        headerBg: '#002b36',
        headerTextColor: '#ffffff',
        alternateRowBg: '#f8fafc',
        rowBg: '#ffffff',
        borderColor: '#002b36',
        fontSize: 7.5,
        headerFontSize: 8,
        cellPadding: 4,
        colWidths: [80, 200, 80]
      }
    };
  });

  return result;
};

const PRESET_TITLE_COLORS = ['#00a651', '#0F3D3E', '#E2DCC8', '#38bdf8', '#f59e0b', '#dc2626'];

export const extractSectionsFromPage = (page: CatalogPage | undefined): ProductGridSection[] => {
  if (!page || !page.elements) return [];

  const tables = page.elements.filter(el => el.type === 'table');
  const titles = page.elements.filter(el => el.type === 'text' && (el.fontSize || 14) >= 18);
  const images = page.elements.filter(el => el.type === 'image');
  const backgrounds = page.elements.filter(el => el.type === 'shape' && (el.width || 0) >= 500);

  if (titles.length < 1 && tables.length < 1) return [];

  const sortedTitles = [...titles].sort((a, b) => a.y - b.y);
  if (sortedTitles.length > 0) {
    return sortedTitles.map((t, idx) => {
      const nearestTable = tables.find(tbl => Math.abs(tbl.y - t.y) < 180);
      const nearestImg = images.find(img => Math.abs(img.y - t.y) < 180);
      const nearestBg = backgrounds.find(bg => Math.abs(bg.y - t.y) < 180);

      return {
        id: `sec-${idx + 1}`,
        title: t.text?.replace(/<[^>]*>/g, '') || `SERIES ${idx + 1}`,
        titleColor: t.fill || '#00a651',
        titleFontSize: t.fontSize || 22,
        imageSrc: nearestImg?.src || '',
        hasBackground: !!nearestBg,
        backgroundColor: nearestBg?.fill || '#e2e8f0',
        tableData: nearestTable?.tableData || {
          headers: ['MODEL NO', 'PRODUCTS', 'PRICE'],
          rows: [['-', `Series ${idx + 1}`, '-']],
          headerBg: '#002b36',
          headerTextColor: '#ffffff',
          alternateRowBg: '#f8fafc',
          rowBg: '#ffffff',
          borderColor: '#002b36',
          fontSize: 7.5,
          headerFontSize: 8,
          cellPadding: 4,
          colWidths: [80, 200, 80]
        }
      };
    });
  }

  const sortedTables = [...tables].sort((a, b) => a.y - b.y);
  return sortedTables.map((tbl, idx) => ({
    id: `sec-${idx + 1}`,
    title: `SERIES ${idx + 1}`,
    titleColor: '#00a651',
    titleFontSize: 22,
    imageSrc: '',
    hasBackground: false,
    backgroundColor: '#f1f5f9',
    tableData: tbl.tableData || {
      headers: ['MODEL NO', 'PRODUCTS', 'PRICE'],
      rows: [['-', `Series ${idx + 1}`, '-']],
      headerBg: '#002b36',
      headerTextColor: '#ffffff',
      alternateRowBg: '#f8fafc',
      rowBg: '#ffffff',
      borderColor: '#002b36',
      fontSize: 7.5,
      headerFontSize: 8,
      cellPadding: 4
    }
  }));
};

const generateRowFromProduct = (
  headers: string[],
  product: Product,
  variant?: ProductVariant,
  categories?: any[]
): string[] => {
  if (!headers || !headers.length) return [];

  // Helper to extract value from variant.customAttributes or product.customFields
  const findCustomFieldValue = (keyQuery: string): string | null => {
    const targetNorm = keyQuery.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!targetNorm) return null;

    // Collect all matching schema IDs from categories customSchema that match keyQuery (e.g. "Model No" -> "custom_1789199703787")
    const matchingSchemaIds: string[] = [];
    if (categories && Array.isArray(categories)) {
      for (const cat of categories) {
        if (cat.customSchema && Array.isArray(cat.customSchema)) {
          for (const f of cat.customSchema) {
            const fLabelNorm = (f.label || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            const fKeyNorm = (f.key || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            const fNameNorm = (f.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            if (fLabelNorm === targetNorm || fKeyNorm === targetNorm || fNameNorm === targetNorm ||
                (fLabelNorm && (fLabelNorm.includes(targetNorm) || targetNorm.includes(fLabelNorm)))) {
              if (f.id) matchingSchemaIds.push(f.id);
            }
          }
        }
      }
    }

    // 1. Check variant.customAttributes (highest priority for row)
    if (variant?.customAttributes && typeof variant.customAttributes === 'object') {
      // Direct key match
      if (variant.customAttributes[keyQuery] !== undefined && variant.customAttributes[keyQuery] !== null) {
        const val = String(variant.customAttributes[keyQuery]).trim();
        if (val && val !== '-') return val;
      }
      // Schema ID matches (case-insensitive)
      for (const [k, v] of Object.entries(variant.customAttributes)) {
        if (matchingSchemaIds.some(sId => sId.toLowerCase() === k.toLowerCase())) {
          if (v !== undefined && v !== null) {
            const val = String(v).trim();
            if (val && val !== '-') return val;
          }
        }
      }
      // Normalized key match
      for (const [k, v] of Object.entries(variant.customAttributes)) {
        if (k.toLowerCase().replace(/[^a-z0-9]/g, '') === targetNorm) {
          if (v !== undefined && v !== null) {
            const val = String(v).trim();
            if (val && val !== '-') return val;
          }
        }
        // Also check if resolving the key label matches targetNorm
        const resolved = resolveFieldLabel(k, categories as any, product);
        if (resolved && resolved.toLowerCase().replace(/[^a-z0-9]/g, '') === targetNorm) {
          if (v !== undefined && v !== null) {
            const val = String(v).trim();
            if (val && val !== '-') return val;
          }
        }
      }
    }

    // 2. Check product.customFields
    if (product.customFields && typeof product.customFields === 'object') {
      // Direct key match
      if (product.customFields[keyQuery] !== undefined && product.customFields[keyQuery] !== null) {
        const val = String(product.customFields[keyQuery]).trim();
        if (val && val !== '-') return val;
      }
      // Schema ID matches (case-insensitive)
      for (const [k, v] of Object.entries(product.customFields)) {
        if (matchingSchemaIds.some(sId => sId.toLowerCase() === k.toLowerCase())) {
          if (v !== undefined && v !== null) {
            const val = String(v).trim();
            if (val && val !== '-') return val;
          }
        }
      }
      // Normalized key match
      for (const [k, v] of Object.entries(product.customFields)) {
        if (k.toLowerCase().replace(/[^a-z0-9]/g, '') === targetNorm) {
          if (v !== undefined && v !== null) {
            const val = String(v).trim();
            if (val && val !== '-') return val;
          }
        }
        // Also check if resolving the key label matches targetNorm
        const resolved = resolveFieldLabel(k, categories as any, product);
        if (resolved && resolved.toLowerCase().replace(/[^a-z0-9]/g, '') === targetNorm) {
          if (v !== undefined && v !== null) {
            const val = String(v).trim();
            if (val && val !== '-') return val;
          }
        }
      }
    }

    return null;
  };

  return headers.map(hdr => {
    const h = hdr.toLowerCase().replace(/[^a-z0-9]/g, '');

    // Step 1: User's custom field match directly against header name (e.g. "Model No", "Wattage", "CCT", "Model")
    const customMatch = findCustomFieldValue(hdr);
    if (customMatch) return customMatch;

    // Step 2: Model Number - Strictly model number custom field (NO fallback to auto SKU or SKU slugs)
    if (h.includes('model') || h.includes('itemno') || h === 'item' || h === 'code' || h === 'itemcode') {
      const modelVal = findCustomFieldValue('model_no') || findCustomFieldValue('model') || 
                       findCustomFieldValue('model_number') || findCustomFieldValue('modelno') ||
                       findCustomFieldValue('item_code') || findCustomFieldValue('item_no') ||
                       findCustomFieldValue('item_number');
      if (modelVal) return modelVal;
      return '-';
    }

    // SKU (Only if the column header is explicitly named SKU)
    if (h === 'sku') {
      const skuVal = findCustomFieldValue('sku');
      if (skuVal) return skuVal;
      if (variant?.sku && variant.sku !== '-' && !variant.sku.startsWith('Untitled') && !variant.sku.startsWith('GEN-') && !variant.sku.startsWith('PRE-')) {
        return variant.sku;
      }
      if (product.sku && product.sku !== '-' && !product.sku.startsWith('Untitled') && !product.sku.startsWith('GEN-') && !product.sku.startsWith('PRE-')) {
        return product.sku;
      }
      return '-';
    }

    // Product Name / Description / Spec
    if (h.includes('product') || h.includes('spec') || h.includes('desc') || h.includes('name') || h.includes('title')) {
      const nameVal = findCustomFieldValue('product_name') || findCustomFieldValue('description') || findCustomFieldValue('spec') || findCustomFieldValue('title');
      if (nameVal) return nameVal;
      if (variant?.name && variant.name !== 'Untitled Product' && variant.name !== '-') return variant.name;
      if (product.name && product.name !== 'Untitled Product' && product.name !== '-') return product.name;
      return '-';
    }

    // Cut-out / Size / Dimension
    if (h.includes('cut') || h.includes('size') || h.includes('dim') || h.includes('dia')) {
      const cutVal = findCustomFieldValue('cut_out') || findCustomFieldValue('cutout') || findCustomFieldValue('size') || findCustomFieldValue('dimension') || findCustomFieldValue('dia');
      if (cutVal) return cutVal;
      if (variant?.cutOut && variant.cutOut !== '-') return variant.cutOut;
      return '-';
    }

    // Price / MRP / Rate / Dealer Price / DLP
    if (h.includes('price') || h.includes('rate') || h.includes('mrp') || h.includes('cost') || h.includes('amount') || h.includes('dlp')) {
      const priceVal = findCustomFieldValue('price') || findCustomFieldValue('mrp') || findCustomFieldValue('dealer_price') || findCustomFieldValue('dlp') || findCustomFieldValue('rate');
      if (priceVal) return priceVal.startsWith('₹') || priceVal.startsWith('$') ? priceVal : `₹${priceVal}`;

      const rawP = (variant?.price !== undefined && variant?.price !== '' && variant?.price !== null && variant?.price !== '-') 
        ? variant.price 
        : product.price;
      if (rawP !== undefined && rawP !== null && rawP !== '' && rawP !== '-' && Number(rawP) !== 0) {
        return String(rawP).startsWith('₹') || String(rawP).startsWith('$') ? String(rawP) : `₹${rawP}`;
      }
      return '-';
    }

    // Color / CCT / Shade
    if (h.includes('color') || h.includes('cct') || h.includes('shade') || h.includes('temp')) {
      const colorVal = findCustomFieldValue('color') || findCustomFieldValue('cct') || findCustomFieldValue('shade') || findCustomFieldValue('temperature');
      if (colorVal) return colorVal;
      if (variant?.color && variant.color !== '-') return variant.color;
      return '-';
    }

    // Packing / Qty / Box
    if (h.includes('pack') || h.includes('box') || h.includes('qty') || h.includes('carton') || h.includes('pcs')) {
      const packVal = findCustomFieldValue('packing') || findCustomFieldValue('box_qty') || findCustomFieldValue('qty') || findCustomFieldValue('pack');
      if (packVal) return packVal;
      if (variant?.packing && variant.packing !== '-') return variant.packing;
      return '-';
    }

    // Wattage / Power
    if (h.includes('power') || h.includes('watt') || h.includes('wt') || h === 'w') {
      const powerVal = findCustomFieldValue('wattage') || findCustomFieldValue('power') || findCustomFieldValue('watt') || findCustomFieldValue('watts');
      if (powerVal) return powerVal;
      if ((variant as any)?.power) return String((variant as any).power);
      if (product.power) return String(product.power);
      return '-';
    }

    // Step 3: Fuzzy / Partial match in custom attributes/fields
    if (variant?.customAttributes) {
      for (const [key, val] of Object.entries(variant.customAttributes)) {
        const normK = key.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (normK && (normK === h || h.includes(normK) || normK.includes(h))) {
          if (val !== undefined && val !== null && String(val).trim() !== '') return String(val);
        }
      }
    }
    if (product.customFields) {
      for (const [key, val] of Object.entries(product.customFields)) {
        const normK = key.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (normK && (normK === h || h.includes(normK) || normK.includes(h))) {
          if (val !== undefined && val !== null && String(val).trim() !== '') return String(val);
        }
      }
    }

    return '-';
  });
};

export const GridStudioPanel: React.FC = () => {
  const {
    catalog, currentPageIndex, setCurrentPageIndex, products, categories,
    mediaItems, adminAssets, addMedia, fetchMedia,
    setEditorTab, applyProductGridToPage, reflowCatalogPages,
    swapPageSections, deletePageSection, addInteriorPageWithInheritedLayout,
    autoGenerateCatalogFromAllCategories
  } = useStore();

  const [viewMode, setViewMode] = useState<'editor' | 'overview'>('editor');
  const [showPageSelector, setShowPageSelector] = useState(false);
  const pageSelectorRef = useRef<HTMLDivElement>(null);

  // Gallery image picker modal state
  const [imageGalleryPickerSectionIdx, setImageGalleryPickerSectionIdx] = useState<number | null>(null);
  const [galleryTab, setGalleryTab] = useState<'all' | 'uploads' | 'categories' | 'products' | 'presets' | 'admin'>('uploads');
  const [gallerySearch, setGallerySearch] = useState('');
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!mediaItems || mediaItems.length === 0) {
      fetchMedia();
    }
  }, []);

  const handleUploadImageFile = async (secIdx: number, file: File) => {
    try {
      setIsUploadingMedia(true);
      const newItem = await addMedia(file);
      const imgUrl = normalizeImageUrl(newItem?.url || '');
      if (imgUrl) {
        handleUpdateSection(secIdx, { imageSrc: imgUrl });
      }
    } catch (err) {
      console.error("Failed to upload image file:", err);
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const [sections, setSections] = useState<ProductGridSection[]>(() => {
    const page = catalog?.pages?.[currentPageIndex];
    const extracted = extractSectionsFromPage(page);
    if (extracted.length >= 1) return extracted;
    return generateSectionsFromRealProducts(page, currentPageIndex, products, categories);
  });

  // Re-sync local sections state whenever active page or products change
  useEffect(() => {
    const page = catalog?.pages?.[currentPageIndex];
    if (page) {
      const extracted = extractSectionsFromPage(page);
      if (extracted.length >= 1) {
        setSections(extracted);
      } else if (page.type !== 'cover' && page.type !== 'index' && page.type !== 'closing') {
        setSections(generateSectionsFromRealProducts(page, currentPageIndex, products, categories));
      }
    }
  }, [currentPageIndex, catalog?.pages, products, categories]);

  // Close page selector on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (pageSelectorRef.current && !pageSelectorRef.current.contains(e.target as Node)) {
        setShowPageSelector(false);
      }
    };
    if (showPageSelector) document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [showPageSelector]);

  const [productPickerSectionIdx, setProductPickerSectionIdx] = useState<number | null>(null);
  const [pickerCategoryFilter, setPickerCategoryFilter] = useState<string | null>(null);
  const [pickerSearch, setPickerSearch] = useState('');

  // Table Enhancements State
  const [activeFillMenu, setActiveFillMenu] = useState<{ secIdx: number; colIdx: number } | null>(null);
  const [openStyleSecIdx, setOpenStyleSecIdx] = useState<number | null>(null);
  const [linkRowModal, setLinkRowModal] = useState<{ secIdx: number; rIdx: number } | null>(null);
  const [linkRowSearch, setLinkRowSearch] = useState('');
  const [linkRowCategory, setLinkRowCategory] = useState<string>('all');
  const [highlightedSecIdx, setHighlightedSecIdx] = useState<number | null>(null);

  // Close popup menus on outside click
  useEffect(() => {
    const handleOutside = () => {
      setActiveFillMenu(null);
    };
    if (activeFillMenu) {
      document.addEventListener('mousedown', handleOutside);
      return () => document.removeEventListener('mousedown', handleOutside);
    }
  }, [activeFillMenu]);

  // Listen to catalog:editTable event to auto-scroll to section
  useEffect(() => {
    const handleEditTable = (e: any) => {
      const { id } = e.detail || {};
      if (id) {
        const secIndex = sections.findIndex(s => s.id === id);
        const targetIdx = secIndex !== -1 ? secIndex : 0;
        setHighlightedSecIdx(targetIdx);
        setTimeout(() => {
          const el = document.getElementById(`grid-sec-card-${targetIdx}`);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 120);
        setTimeout(() => setHighlightedSecIdx(null), 3000);
      }
    };
    window.addEventListener('catalog:editTable', handleEditTable);
    return () => window.removeEventListener('catalog:editTable', handleEditTable);
  }, [sections]);

  // Page switcher navigation
  const navigateToPage = (idx: number) => {
    if (idx < 0 || idx >= catalog.pages.length) return;
    setCurrentPageIndex(idx);
    setShowPageSelector(false);
    window.dispatchEvent(new CustomEvent('catalog:scrollToPage', { detail: { pageIndex: idx } }));
  };

  // Helper to commit state updates and live-apply immediately to active catalog page
  const updateAndApplySections = (updater: (prev: ProductGridSection[]) => ProductGridSection[]) => {
    setSections(prev => {
      const next = updater(prev);
      const activeP = catalog?.pages?.[currentPageIndex];
      if (activeP && activeP.type !== 'cover' && activeP.type !== 'index' && activeP.type !== 'closing') {
        applyProductGridToPage(currentPageIndex, next);
      }
      return next;
    });
  };

  // Update sections helper
  const handleUpdateSection = (idx: number, updates: Partial<ProductGridSection>) => {
    updateAndApplySections(prev => prev.map((sec, i) => i === idx ? { ...sec, ...updates } : sec));
  };

  const handleCellChange = (secIdx: number, rIdx: number, cIdx: number, val: string) => {
    updateAndApplySections(prev => prev.map((sec, i) => {
      if (i !== secIdx) return sec;
      const newRows = sec.tableData.rows.map((row, rowIdx) => {
        if (rowIdx !== rIdx) return row;
        const newRow = [...row];
        newRow[cIdx] = val;
        return newRow;
      });
      return {
        ...sec,
        tableData: { ...sec.tableData, rows: newRows }
      };
    }));
  };

  const handleHeaderChange = (secIdx: number, cIdx: number, val: string) => {
    updateAndApplySections(prev => prev.map((sec, i) => {
      if (i !== secIdx) return sec;
      const newHeaders = [...sec.tableData.headers];
      newHeaders[cIdx] = val;
      return {
        ...sec,
        tableData: { ...sec.tableData, headers: newHeaders }
      };
    }));
  };

  const handleAddTableRow = (secIdx: number) => {
    updateAndApplySections(prev => prev.map((sec, i) => {
      if (i !== secIdx) return sec;
      const newRow = new Array(sec.tableData.headers.length).fill('-');
      return {
        ...sec,
        tableData: { ...sec.tableData, rows: [...sec.tableData.rows, newRow] }
      };
    }));
  };

  const handleAddTableRowsWithData = (secIdx: number, newRowsData: string[][], autoImageSrc?: string) => {
    if (!newRowsData || newRowsData.length === 0) return;
    updateAndApplySections(prev => prev.map((sec, i) => {
      if (i !== secIdx) return sec;
      const currentRows = sec.tableData?.rows || [];
      const hasOnlyDummyRow = currentRows.length === 1 && currentRows[0].every(cell => !cell || cell === '-' || cell.trim() === '');
      const newRows = hasOnlyDummyRow ? [...newRowsData] : [...currentRows, ...newRowsData];
      return {
        ...sec,
        imageSrc: (!sec.imageSrc && autoImageSrc) ? autoImageSrc : sec.imageSrc,
        tableData: { ...sec.tableData, rows: newRows }
      };
    }));
  };

  const handleDeleteTableRow = (secIdx: number, rIdx: number) => {
    updateAndApplySections(prev => prev.map((sec, i) => {
      if (i !== secIdx || sec.tableData.rows.length <= 1) return sec;
      return {
        ...sec,
        tableData: {
          ...sec.tableData,
          rows: sec.tableData.rows.filter((_, idx) => idx !== rIdx)
        }
      };
    }));
  };

  // Dynamic extraction of unique product fields / custom attributes present in current products & categories
  const availableProductFields = React.useMemo(() => {
    const fieldSet = new Set<string>();

    products.forEach(p => {
      if (p.price !== undefined && p.price !== null && Number(p.price) > 0) {
        fieldSet.add('PRICE');
      }
      if (p.customFields && typeof p.customFields === 'object') {
        Object.entries(p.customFields).forEach(([k, v]) => {
          if (k && k.trim() && v !== undefined && v !== null && String(v).trim() !== '') {
            const humanLabel = resolveFieldLabel(k, categories as any, p);
            if (humanLabel) {
              fieldSet.add(humanLabel.trim().toUpperCase());
            } else if (!/^(custom|field)[-_]?[0-9]+$/i.test(k) && !/^[0-9]+$/.test(k)) {
              fieldSet.add(k.trim().toUpperCase());
            }
          }
        });
      }
      if (p.variants && Array.isArray(p.variants)) {
        p.variants.forEach(v => {
          if (v.price !== undefined && v.price !== null && String(v.price).trim() !== '') {
            fieldSet.add('PRICE');
          }
          if (v.cutOut && v.cutOut.trim()) fieldSet.add('CUT-OUT');
          if (v.color && v.color.trim()) fieldSet.add('COLOR');
          if (v.packing && v.packing.trim()) fieldSet.add('PACKING');
          if (v.customAttributes && typeof v.customAttributes === 'object') {
            Object.entries(v.customAttributes).forEach(([k, val]) => {
              if (k && k.trim() && val !== undefined && val !== null && String(val).trim() !== '') {
                const humanLabel = resolveFieldLabel(k, categories as any, p);
                if (humanLabel) {
                  fieldSet.add(humanLabel.trim().toUpperCase());
                } else if (!/^(custom|field)[-_]?[0-9]+$/i.test(k) && !/^[0-9]+$/.test(k)) {
                  fieldSet.add(k.trim().toUpperCase());
                }
              }
            });
          }
        });
      }
    });

    categories.forEach((cat: any) => {
      if (cat.customSchema && Array.isArray(cat.customSchema)) {
        cat.customSchema.forEach((f: any) => {
          if (f.label && f.label.trim()) {
            fieldSet.add(f.label.trim().toUpperCase());
          } else if (f.name && f.name.trim()) {
            fieldSet.add(f.name.trim().toUpperCase());
          }
        });
      }
    });

    // Core Standard Product Fields
    const standardFields = ['MODEL NO', 'PRODUCTS', 'PRICE'];

    // Collect additional category schema & variant attributes
    const extraFields = Array.from(fieldSet).filter(k => 
      !['SKU', 'PRODUCT NAME', 'NAME', 'ID'].includes(k) &&
      !standardFields.includes(k)
    );

    return [...standardFields, ...extraFields];
  }, [products, categories]);

  // Helper to accurately match a table row to its product and variant using any token in the row
  const matchProductAndVariantForRow = (row: string[]): { matchedProd?: Product; matchedVar?: ProductVariant } => {
    const rowTokens = row.map(c => (c || '').trim().toLowerCase()).filter(c => c && c !== '-');
    if (rowTokens.length === 0 || !products || products.length === 0) return {};

    for (const p of products) {
      const pSku = (p.sku || '').trim().toLowerCase();
      const pName = (p.name || '').trim().toLowerCase();

      // Check variants
      if (p.variants && p.variants.length > 0) {
        for (const v of p.variants) {
          const vSku = (v.sku || '').trim().toLowerCase();
          const vName = (v.name || '').trim().toLowerCase();
          
          if (rowTokens.some(tok => 
            (vSku && (vSku === tok || vSku.includes(tok) || tok.includes(vSku))) ||
            (vName && (vName === tok || vName.includes(tok) || tok.includes(vName)))
          )) {
            return { matchedProd: p, matchedVar: v };
          }

          if (v.customAttributes && typeof v.customAttributes === 'object') {
            for (const val of Object.values(v.customAttributes)) {
              const vStr = String(val || '').trim().toLowerCase();
              if (vStr && vStr !== '-' && rowTokens.some(tok => vStr === tok || vStr.includes(tok) || tok.includes(vStr))) {
                return { matchedProd: p, matchedVar: v };
              }
            }
          }
        }
      }

      // Check product name and sku
      if (rowTokens.some(tok => 
        (pSku && (pSku === tok || pSku.includes(tok) || tok.includes(pSku))) ||
        (pName && (pName === tok || pName.includes(tok) || tok.includes(pName)))
      )) {
        return { matchedProd: p, matchedVar: p.variants?.[0] };
      }

      if (p.customFields && typeof p.customFields === 'object') {
        for (const val of Object.values(p.customFields)) {
          const pStr = String(val || '').trim().toLowerCase();
          if (pStr && pStr !== '-' && rowTokens.some(tok => pStr === tok || pStr.includes(tok) || tok.includes(pStr))) {
            return { matchedProd: p, matchedVar: p.variants?.[0] };
          }
        }
      }
    }

    return {};
  };

  const handleAddTableColumn = (secIdx: number, paramName: string = 'NEW PARAM') => {
    const cleanParam = paramName.trim().toUpperCase();
    updateAndApplySections(prev => prev.map((sec, i) => {
      if (i !== secIdx) return sec;
      const headers = [...sec.tableData.headers, cleanParam];
      const rows = sec.tableData.rows.map(row => {
        const { matchedProd, matchedVar } = matchProductAndVariantForRow(row);
        let val = '-';
        if (matchedProd) {
          const gen = generateRowFromProduct([cleanParam], matchedProd, matchedVar, categories);
          if (gen && gen[0]) {
            val = gen[0];
          }
        }
        return [...row, val];
      });

      return {
        ...sec,
        tableData: {
          ...sec.tableData,
          headers,
          rows
        }
      };
    }));
  };

  const handleDeleteTableColumn = (secIdx: number, colIdx: number) => {
    updateAndApplySections(prev => prev.map((sec, i) => {
      if (i !== secIdx || sec.tableData.headers.length <= 1) return sec;
      const headers = sec.tableData.headers.filter((_, idx) => idx !== colIdx);
      const rows = sec.tableData.rows.map(row => row.filter((_, idx) => idx !== colIdx));
      return {
        ...sec,
        tableData: {
          ...sec.tableData,
          headers,
          rows
        }
      };
    }));
  };

  const handleMoveColumn = (secIdx: number, colIdx: number, direction: 'left' | 'right') => {
    const targetIdx = direction === 'left' ? colIdx - 1 : colIdx + 1;
    updateAndApplySections(prev => prev.map((sec, i) => {
      if (i !== secIdx) return sec;
      if (targetIdx < 0 || targetIdx >= sec.tableData.headers.length) return sec;
      
      const newHeaders = [...sec.tableData.headers];
      const [movedHdr] = newHeaders.splice(colIdx, 1);
      newHeaders.splice(targetIdx, 0, movedHdr);

      const newRows = sec.tableData.rows.map(row => {
        const newRow = [...row];
        const [movedCell] = newRow.splice(colIdx, 1);
        newRow.splice(targetIdx, 0, movedCell);
        return newRow;
      });

      return {
        ...sec,
        tableData: {
          ...sec.tableData,
          headers: newHeaders,
          rows: newRows
        }
      };
    }));
  };

  const handleFillColumnFromParam = (secIdx: number, colIdx: number, paramKeyOrName: string) => {
    const cleanParam = paramKeyOrName.trim().toUpperCase();
    updateAndApplySections(prev => prev.map((sec, i) => {
      if (i !== secIdx) return sec;
      const newRows = sec.tableData.rows.map(row => {
        const { matchedProd, matchedVar } = matchProductAndVariantForRow(row);
        const newRow = [...row];
        if (matchedProd) {
          const gen = generateRowFromProduct([cleanParam], matchedProd, matchedVar, categories);
          if (gen && gen[0]) {
            newRow[colIdx] = gen[0];
          }
        }
        return newRow;
      });

      return {
        ...sec,
        tableData: {
          ...sec.tableData,
          rows: newRows
        }
      };
    }));
    setActiveFillMenu(null);
  };

  const handleMoveTableRow = (secIdx: number, rIdx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? rIdx - 1 : rIdx + 1;
    updateAndApplySections(prev => prev.map((sec, i) => {
      if (i !== secIdx) return sec;
      if (targetIdx < 0 || targetIdx >= sec.tableData.rows.length) return sec;
      const newRows = [...sec.tableData.rows];
      const [movedRow] = newRows.splice(rIdx, 1);
      newRows.splice(targetIdx, 0, movedRow);
      return {
        ...sec,
        tableData: { ...sec.tableData, rows: newRows }
      };
    }));
  };

  const handleDuplicateTableRow = (secIdx: number, rIdx: number) => {
    updateAndApplySections(prev => prev.map((sec, i) => {
      if (i !== secIdx) return sec;
      const targetRow = sec.tableData.rows[rIdx];
      if (!targetRow) return sec;
      const newRows = [...sec.tableData.rows];
      newRows.splice(rIdx + 1, 0, [...targetRow]);
      return {
        ...sec,
        tableData: { ...sec.tableData, rows: newRows }
      };
    }));
  };

  const handleFillRowWithProduct = (secIdx: number, rIdx: number, prod: Product, variant?: ProductVariant) => {
    updateAndApplySections(prev => {
      const copy = [...prev];
      const targetSec = copy[secIdx];
      if (!targetSec) return copy;

      const headers = targetSec.tableData?.headers || ['MODEL NO', 'PRODUCTS', 'PRICE'];
      const generatedRow = generateRowFromProduct(headers, prod, variant, categories);

      const newRows = [...targetSec.tableData.rows];
      newRows[rIdx] = generatedRow;

      copy[secIdx] = {
        ...targetSec,
        imageSrc: !targetSec.imageSrc && (variant?.image || prod.image) ? (variant?.image || prod.image || '') : targetSec.imageSrc,
        tableData: {
          ...targetSec.tableData,
          rows: newRows
        }
      };
      return copy;
    });
    setLinkRowModal(null);
  };

  const handleUpdateTableStyle = (secIdx: number, styleUpdates: Partial<TableData>) => {
    updateAndApplySections(prev => prev.map((sec, i) => {
      if (i !== secIdx) return sec;
      return {
        ...sec,
        tableData: {
          ...sec.tableData,
          ...styleUpdates
        }
      };
    }));
  };

  const isRowMatchedToProduct = (row: string[]): boolean => {
    if (!products || products.length === 0) return false;
    const rowSku = (row[0] || '').trim().toLowerCase();
    const rowName = (row[1] || '').trim().toLowerCase();
    if (!rowSku && !rowName) return false;
    return products.some(p =>
      (p.sku && p.sku.toLowerCase() === rowSku) ||
      (p.name && p.name.toLowerCase() === rowName) ||
      p.variants?.some(v => (v.sku && v.sku.toLowerCase() === rowSku) || (v.name && v.name.toLowerCase() === rowName))
    );
  };

  const handleMoveSection = (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= sections.length) return;
    updateAndApplySections(prev => {
      const copy = [...prev];
      const [moved] = copy.splice(idx, 1);
      copy.splice(targetIdx, 0, moved);
      return copy;
    });
  };

  const handleReorderSections = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= sections.length || fromIdx === toIdx) return;
    updateAndApplySections(prev => {
      const copy = [...prev];
      const [moved] = copy.splice(fromIdx, 1);
      copy.splice(toIdx, 0, moved);
      return copy;
    });
  };

  const handleAddSection = () => {
    if (sections.length >= 4) return;
    const newIdx = sections.length + 1;
    const activePage = catalog.pages[currentPageIndex];
    const { categoryName, categoryProducts } = getCategoryProductsForPage(activePage, currentPageIndex, products, categories);
    const chosenProduct = categoryProducts[newIdx - 1] || categoryProducts[0];
    const targetCat = categories.find(c => c.name === categoryName || String(c.id) === String((chosenProduct as any)?.categoryId));

    const currentFirstSec = sections[0];
    const defaultHeaders = currentFirstSec?.tableData?.headers?.length
      ? currentFirstSec.tableData.headers
      : ['MODEL NO', 'PRODUCTS', 'PRICE'];

    const rows = chosenProduct
      ? (chosenProduct.variants && chosenProduct.variants.length > 0
          ? chosenProduct.variants.map(v => generateRowFromProduct(defaultHeaders, chosenProduct, v, categories))
          : [generateRowFromProduct(defaultHeaders, chosenProduct, undefined, categories)])
      : [['-', `${categoryName.toUpperCase()} SERIES ${newIdx}`, '-']];

    const newSec: ProductGridSection = {
      id: `sec-${Date.now()}`,
      title: resolveProductTitle(chosenProduct, categoryName, newIdx),
      titleColor: '#00a651',
      titleFontSize: 22,
      imageSrc: resolveProductImage(chosenProduct, targetCat, categoryProducts),
      hasBackground: newIdx % 2 === 0,
      backgroundColor: '#e2e8f0',
      tableData: {
        headers: defaultHeaders,
        rows,
        headerBg: '#002b36',
        headerTextColor: '#ffffff',
        alternateRowBg: '#f8fafc',
        rowBg: '#ffffff',
        borderColor: '#002b36',
        fontSize: 7.5,
        headerFontSize: 8,
        cellPadding: 4,
        colWidths: [80, 200, 80]
      }
    };
    updateAndApplySections(prev => [...prev, newSec]);
  };

  const handleDeleteSection = (idx: number) => {
    if (sections.length <= 1) return;
    updateAndApplySections(prev => prev.filter((_, i) => i !== idx));
  };

  // Move a section from one page to another
  const handleMoveSectionToPage = (fromPageIdx: number, toPageIdx: number, secIdx: number) => {
    if (fromPageIdx === toPageIdx) return;
    const fromPage = catalog.pages[fromPageIdx];
    const toPage = catalog.pages[toPageIdx];
    if (!fromPage || !toPage) return;

    const fromSections = fromPageIdx === currentPageIndex ? [...sections] : extractSectionsFromPage(fromPage);
    const toSections = toPageIdx === currentPageIndex ? [...sections] : extractSectionsFromPage(toPage);

    if (secIdx < 0 || secIdx >= fromSections.length) return;

    const [targetSection] = fromSections.splice(secIdx, 1);
    toSections.push(targetSection);

    // Apply changes to both pages
    applyProductGridToPage(fromPageIdx, fromSections);
    applyProductGridToPage(toPageIdx, toSections);

    if (fromPageIdx === currentPageIndex) {
      setSections(fromSections);
    } else if (toPageIdx === currentPageIndex) {
      setSections(toSections);
    }
  };

  const handleSelectProductForSection = (secIdx: number, product: Product) => {
    const targetCat = categories.find(c => String(c.id) === String(product.categoryId));
    const title = resolveProductTitle(product, targetCat?.name || 'PRODUCT', secIdx);
    const imageSrc = resolveProductImage(product, targetCat, products);

    updateAndApplySections(prev => prev.map((sec, i) => {
      if (i !== secIdx) return sec;
      const currentHeaders = sec.tableData?.headers?.length ? sec.tableData.headers : ['MODEL NO', 'PRODUCTS', 'PRICE'];
      let rows: string[][] = [];
      if (product.variants && product.variants.length > 0) {
        rows = product.variants.map(v => generateRowFromProduct(currentHeaders, product, v, categories));
      } else {
        rows = [generateRowFromProduct(currentHeaders, product, undefined, categories)];
      }

      return {
        ...sec,
        title,
        imageSrc,
        tableData: {
          ...sec.tableData,
          rows
        }
      };
    }));

    setProductPickerSectionIdx(null);
  };

  const handleApplyAndReflow = () => {
    applyProductGridToPage(currentPageIndex, sections);
    reflowCatalogPages();
  };

  const activePage = catalog.pages[currentPageIndex];
  const isSpecialPage = activePage?.type === 'cover' || activePage?.type === 'index' || activePage?.type === 'closing';

  return (
    <div className="flex flex-col h-full w-full bg-[#141414] text-white border-r border-[#262626] font-sans overflow-hidden">
      
      {/* ================= PANEL HEADER ================= */}
      <div className="px-3.5 py-2.5 border-b border-[#262626] bg-[#161616] flex flex-col gap-2 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-[4px] bg-[#0F3D3E] flex items-center justify-center text-[#E2DCC8] shadow-md shadow-[#0F3D3E]/30 shrink-0">
              <Sparkles size={13} />
            </div>
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                Grid Studio
                <span className="px-1.5 py-0.2 rounded bg-[#0F3D3E]/60 text-[#E2DCC8] text-[8px] font-mono font-bold">
                  P{currentPageIndex + 1}
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setEditorTab('products')}
              className="px-2 py-0.5 rounded text-[9px] font-bold text-slate-400 hover:text-[#E2DCC8] hover:bg-[#222] transition-colors uppercase tracking-wider"
              title="Switch to Product Library"
            >
              Products
            </button>
            <button
              type="button"
              onClick={() => setEditorTab(null)}
              className="p-1 rounded text-[#888] hover:text-white hover:bg-[#222] transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Page Switcher & View Mode Toolbar */}
        <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-[#222]">
          {/* Quick Page Prev / Selector / Next */}
          <div className="relative flex items-center gap-0.5 bg-[#1e1e1e] border border-[#333] rounded-[4px] p-0.5" ref={pageSelectorRef}>
            <button
              type="button"
              disabled={currentPageIndex <= 0}
              onClick={() => navigateToPage(currentPageIndex - 1)}
              className="p-1 text-slate-400 hover:text-white disabled:opacity-25 hover:bg-white/5 rounded transition-all"
              title="Previous Page"
            >
              <ChevronLeft size={13} />
            </button>

            <button
              type="button"
              onClick={() => setShowPageSelector(!showPageSelector)}
              className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold text-[#E2DCC8] hover:bg-white/5 rounded transition-all"
              title="Switch Page"
            >
              <span>Page {currentPageIndex + 1} / {catalog.pages.length}</span>
              <ChevronDown size={11} className="text-slate-400" />
            </button>

            <button
              type="button"
              disabled={currentPageIndex >= catalog.pages.length - 1}
              onClick={() => navigateToPage(currentPageIndex + 1)}
              className="p-1 text-slate-400 hover:text-white disabled:opacity-25 hover:bg-white/5 rounded transition-all"
              title="Next Page"
            >
              <ChevronRight size={13} />
            </button>

            {/* Page Selector Dropdown */}
            {showPageSelector && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-[#181818] border border-[#333] rounded-[6px] shadow-2xl z-[100] max-h-64 overflow-y-auto p-1 space-y-0.5 custom-scrollbar">
                <div className="px-2 py-1 text-[8px] font-black uppercase tracking-wider text-slate-500 border-b border-[#262626]">
                  Catalog Pages & Grids
                </div>
                {catalog.pages.map((p, idx) => {
                  const pSections = extractSectionsFromPage(p);
                  const isCurrent = idx === currentPageIndex;
                  const isCover = p.type === 'cover';
                  return (
                    <button
                      key={p.id || idx}
                      type="button"
                      onClick={() => navigateToPage(idx)}
                      className={`w-full px-2 py-1.5 rounded flex items-center justify-between text-left text-[10px] transition-all ${
                        isCurrent
                          ? 'bg-[#0F3D3E] text-white font-bold'
                          : 'text-slate-300 hover:bg-[#242424]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-mono text-[9px] text-[#E2DCC8] shrink-0">P{idx + 1}</span>
                        <span className="truncate">
                          {isCover ? 'Cover Page' : (p.type === 'index' ? 'Index Page' : (p.title || `Product Page`))}
                        </span>
                      </div>
                      <span className="text-[8px] opacity-75 font-semibold shrink-0 ml-1">
                        {isCover ? '📘' : `${pSections.length} Grids`}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Mode Tabs: [ ✏️ Editor ] | [ 🗂️ Grid Map ] */}
          <div className="flex items-center bg-[#1e1e1e] border border-[#333] rounded-[4px] p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('editor')}
              className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 ${
                viewMode === 'editor'
                  ? 'bg-[#0F3D3E] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <SlidersHorizontal size={10} /> Editor
            </button>
            <button
              type="button"
              onClick={() => setViewMode('overview')}
              className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 ${
                viewMode === 'overview'
                  ? 'bg-[#0F3D3E] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers size={10} /> Grid Map
            </button>
          </div>
        </div>
      </div>

      {/* ================= MODE 1: ALL PAGES GRID MAP (BIRDS-EYE ORGANIZER) ================= */}
      {viewMode === 'overview' ? (
        <div className="flex-1 overflow-y-auto p-3 space-y-3.5 custom-scrollbar bg-[#121212]">
          <div className="flex items-center justify-between pb-1 border-b border-[#222]">
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-wider text-[#E2DCC8]">
                Multi-Page Grid Organizer
              </h3>
              <p className="text-[8px] text-slate-400">
                View & arrange grid sections across all catalog pages
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                addInteriorPageWithInheritedLayout();
                navigateToPage(catalog.pages.length);
              }}
              className="px-2 py-1 bg-[#202020] hover:bg-[#282828] border border-[#333] text-[#E2DCC8] rounded text-[9px] font-bold uppercase flex items-center gap-1 transition-all"
            >
              <Plus size={11} /> New Page
            </button>
          </div>



          {catalog.pages.map((p, pIdx) => {
            const isCurrent = pIdx === currentPageIndex;
            const pSections = pIdx === currentPageIndex ? sections : extractSectionsFromPage(p);
            const isCover = p.type === 'cover' || p.type === 'index' || p.type === 'closing';

            return (
              <div
                key={p.id || pIdx}
                className={`rounded-[6px] border transition-all ${
                  isCurrent
                    ? 'border-[#0F3D3E] bg-[#161c1d] shadow-lg shadow-[#0F3D3E]/10'
                    : 'border-[#262626] bg-[#161616] hover:border-[#333]'
                }`}
              >
                {/* Page Card Header */}
                <div className="px-3 py-2 border-b border-[#222] flex items-center justify-between bg-[#141414]">
                  <div className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-[3px] flex items-center justify-center text-[9px] font-black ${
                      isCurrent ? 'bg-[#0F3D3E] text-[#E2DCC8]' : 'bg-[#252525] text-slate-300'
                    }`}>
                      #{pIdx + 1}
                    </span>
                    <div>
                      <span className="text-[10px] font-bold text-white uppercase tracking-wider block leading-tight">
                        {isCover ? `${p.type.toUpperCase()} PAGE` : `Page ${pIdx + 1}`}
                      </span>
                      <span className="text-[8px] text-slate-400">
                        {isCover ? 'No product grid' : `${pSections.length} / 3 Sections (${pSections.length >= 3 ? 'Full' : `${3 - pSections.length} slots free`})`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        navigateToPage(pIdx);
                        setViewMode('editor');
                      }}
                      className="px-2 py-0.5 bg-[#0F3D3E]/40 hover:bg-[#0F3D3E] border border-[#0F3D3E] text-[#E2DCC8] rounded text-[8px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all"
                      title="Edit this page in Grid Studio"
                    >
                      <SlidersHorizontal size={9} /> Edit Page
                    </button>
                  </div>
                </div>

                {/* Page Card Body: Sections List */}
                <div className="p-2.5 space-y-1.5">
                  {isCover ? (
                    <div className="py-3 px-2 text-center text-[9px] text-slate-500 bg-[#111] rounded border border-[#222]">
                      Cover & closing pages do not contain standard product grids.
                    </div>
                  ) : pSections.length === 0 ? (
                    <div className="py-4 px-2 text-center text-[9px] text-slate-500 bg-[#111] rounded border border-[#222] space-y-1">
                      <p>No grid sections on this page.</p>
                      <button
                        type="button"
                        onClick={() => {
                          navigateToPage(pIdx);
                          const generated = generateSectionsFromRealProducts(p, pIdx, products, categories);
                          applyProductGridToPage(pIdx, generated);
                          setSections(generated);
                          setViewMode('editor');
                        }}
                        className="px-2 py-0.5 bg-[#0F3D3E] text-white rounded text-[8px] font-bold uppercase"
                      >
                        + Initialize Product Grid
                      </button>
                    </div>
                  ) : (
                    pSections.map((sec, secIdx) => {
                      return (
                        <div
                          key={sec.id || secIdx}
                          className="px-2.5 py-1.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded flex items-center justify-between gap-2 hover:border-[#3a3a3a] transition-all"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-4 h-4 rounded-[2px] bg-[#222] border border-[#333] flex items-center justify-center text-[8px] font-bold text-[#E2DCC8] shrink-0">
                              {secIdx + 1}
                            </span>
                            {sec.imageSrc ? (
                              <img src={sec.imageSrc} alt="" className="w-6 h-6 rounded object-contain bg-[#111] border border-[#333] p-0.5 shrink-0" />
                            ) : (
                              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: sec.titleColor || '#00a651' }} />
                            )}
                            <div className="min-w-0">
                              <p className="text-[9px] font-bold text-white truncate" style={{ color: sec.titleColor || '#00a651' }}>
                                {sec.title || `Section #${secIdx + 1}`}
                              </p>
                              <p className="text-[7.5px] text-slate-400">
                                {sec.tableData?.rows?.length || 0} product rows {sec.hasBackground ? '• Stripe' : ''}
                              </p>
                            </div>
                          </div>

                          {/* Quick Section Transfer & Reorder Controls */}
                          <div className="flex items-center gap-1 shrink-0">
                            {/* Move to another page dropdown */}
                            {catalog.pages.length > 1 && (
                              <select
                                value=""
                                onChange={(e) => {
                                  const targetP = parseInt(e.target.value, 10);
                                  if (!isNaN(targetP)) {
                                    handleMoveSectionToPage(pIdx, targetP, secIdx);
                                  }
                                }}
                                className="px-1.5 py-0.5 bg-[#242424] border border-[#383838] text-[8px] font-bold text-[#E2DCC8] rounded outline-none cursor-pointer hover:border-[#0F3D3E]"
                                title="Move this section to another page"
                              >
                                <option value="" disabled>➔ Move to...</option>
                                {catalog.pages.map((_, optIdx) => {
                                  if (optIdx === pIdx) return null;
                                  return (
                                    <option key={optIdx} value={optIdx}>
                                      Page {optIdx + 1}
                                    </option>
                                  );
                                })}
                              </select>
                            )}

                            {/* Move Up */}
                            <button
                              type="button"
                              disabled={secIdx === 0}
                              onClick={() => {
                                if (pIdx === currentPageIndex) {
                                  handleMoveSection(secIdx, 'up');
                                } else {
                                  swapPageSections(pIdx, secIdx, secIdx - 1);
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-white disabled:opacity-20 transition-colors"
                              title="Move Section Up"
                            >
                              <ArrowUp size={11} />
                            </button>

                            {/* Move Down */}
                            <button
                              type="button"
                              disabled={secIdx === pSections.length - 1}
                              onClick={() => {
                                if (pIdx === currentPageIndex) {
                                  handleMoveSection(secIdx, 'down');
                                } else {
                                  swapPageSections(pIdx, secIdx, secIdx + 1);
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-white disabled:opacity-20 transition-colors"
                              title="Move Section Down"
                            >
                              <ArrowDown size={11} />
                            </button>

                            {/* Delete */}
                            {pSections.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (pIdx === currentPageIndex) {
                                    handleDeleteSection(secIdx);
                                  } else {
                                    deletePageSection(pIdx, secIdx);
                                  }
                                }}
                                className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                                title="Delete Section"
                              >
                                <Trash2 size={11} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ================= MODE 2: SINGLE PAGE DETAILED EDITOR ================= */
        <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar bg-[#121212]">
          {isSpecialPage && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-[6px] text-amber-200 text-[10px] space-y-1">
              <p className="font-bold">⚠️ Current page is a {activePage?.type} page.</p>
              <p className="text-[9px] text-amber-300/80">
                Product Grids are optimized for interior/product pages. Use the page switcher above to select a product page.
              </p>
            </div>
          )}

          {sections.map((sec, secIdx) => {
            const sectionNumber = secIdx + 1;
            const posLabel = secIdx === 0 ? 'Top' : (secIdx === sections.length - 1 ? 'Bottom' : 'Middle');
            const isHighlighted = highlightedSecIdx === secIdx;

            return (
              <div
                id={`grid-sec-card-${secIdx}`}
                key={sec.id || secIdx}
                className={`rounded-xl border transition-all shadow-md overflow-hidden ${
                  isHighlighted
                    ? 'border-emerald-400 ring-2 ring-emerald-400/50 bg-[#162728]'
                    : sec.hasBackground
                    ? 'border-[#0F3D3E]/70 bg-[#151b1c]'
                    : 'border-[#262626] bg-[#161616] hover:border-[#383838]'
                }`}
              >
                {/* Section Header Bar */}
                <div className="px-3.5 py-2.5 border-b border-[#242424] flex items-center justify-between bg-[#191919]">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-[#0F3D3E] text-[#E2DCC8] flex items-center justify-center text-[10px] font-black shadow-sm shadow-[#0F3D3E]/40">
                      {sectionNumber}
                    </span>
                    <span className="text-[11px] font-black text-[#E2DCC8] uppercase tracking-wider">
                      Section #{sectionNumber} <span className="text-slate-400 font-medium text-[9.5px]">({posLabel})</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Fill from Product */}
                    <button
                      type="button"
                      onClick={() => setProductPickerSectionIdx(secIdx)}
                      className="px-2.5 py-1 bg-[#0F3D3E]/40 hover:bg-[#0F3D3E] border border-[#0F3D3E] text-[#E2DCC8] rounded-md text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                      title="Autofill from catalog product"
                    >
                      <Package size={11} className="text-[#E2DCC8]" />
                      <span>Fill</span>
                    </button>

                    {/* Move to another page quick selector */}
                    {catalog.pages.length > 1 && (
                      <select
                        value=""
                        onChange={(e) => {
                          const targetP = parseInt(e.target.value, 10);
                          if (!isNaN(targetP)) {
                            handleMoveSectionToPage(currentPageIndex, targetP, secIdx);
                          }
                        }}
                        className="px-2 py-1 bg-[#1f1f1f] hover:bg-[#262626] border border-[#333] text-[8.5px] font-bold text-[#E2DCC8] rounded-md outline-none cursor-pointer transition-colors"
                        title="Move this section to another page"
                      >
                        <option value="" disabled>➔ Page...</option>
                        {catalog.pages.map((_, optIdx) => {
                          if (optIdx === currentPageIndex) return null;
                          return (
                            <option key={optIdx} value={optIdx}>
                              To P{optIdx + 1}
                            </option>
                          );
                        })}
                      </select>
                    )}

                    <div className="flex items-center bg-[#1f1f1f] border border-[#2a2a2a] rounded-md p-0.5">
                      <button
                        type="button"
                        disabled={secIdx === 0}
                        onClick={() => handleMoveSection(secIdx, 'up')}
                        className="p-1 text-slate-400 hover:text-white rounded disabled:opacity-20 transition-all hover:bg-white/5"
                        title="Move Section Up"
                      >
                        <ArrowUp size={11} />
                      </button>

                      <button
                        type="button"
                        disabled={secIdx === sections.length - 1}
                        onClick={() => handleMoveSection(secIdx, 'down')}
                        className="p-1 text-slate-400 hover:text-white rounded disabled:opacity-20 transition-all hover:bg-white/5"
                        title="Move Section Down"
                      >
                        <ArrowDown size={11} />
                      </button>
                    </div>

                    {sections.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteSection(secIdx)}
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-md border border-transparent hover:border-red-500/20 transition-all"
                        title="Delete Section"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Section Body */}
                <div className="p-3.5 space-y-3.5">
                  {/* 1. Image + Title Rows */}
                  <div className="flex gap-3">
                    {/* Left: Image thumbnail / upload / category image picker */}
                    <div className="w-28 shrink-0 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                          <ImageIcon size={11} className="text-[#0F3D3E]" /> Image
                        </label>
                        <button
                          type="button"
                          onClick={() => setImageGalleryPickerSectionIdx(secIdx)}
                          className="text-[8.5px] text-[#E2DCC8] hover:text-white font-bold bg-[#0F3D3E] hover:bg-[#155355] px-2 py-0.5 rounded-full transition-colors shadow-sm"
                          title="Pick from Category Images & Photos"
                        >
                          Gallery
                        </button>
                      </div>

                      <div className="relative w-28 h-28 bg-[#0c0c0c] border border-[#2d2d2d] rounded-lg overflow-hidden flex items-center justify-center group shadow-inner">
                        {sec.imageSrc ? (
                          <img
                            src={normalizeImageUrl(sec.imageSrc)}
                            alt={sec.title}
                            className="w-full h-full object-contain p-1.5 transition-transform group-hover:scale-105"
                          />
                        ) : (
                          <div className="text-center p-1 text-[#666]">
                            <Upload size={16} className="mx-auto mb-1 text-slate-500" />
                            <span className="text-[9px] block leading-none font-medium text-slate-400">No Image</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/85 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1.5 transition-all duration-200 p-2">
                          <button
                            type="button"
                            onClick={() => setImageGalleryPickerSectionIdx(secIdx)}
                            className="px-2 py-1 bg-[#0F3D3E] text-[#E2DCC8] rounded-md text-[8.5px] font-bold uppercase tracking-wider w-full text-center hover:bg-[#155456] transition-colors shadow-sm"
                          >
                            Pick Photo
                          </button>
                          <label className="px-2 py-1 bg-[#242424] text-white rounded-md text-[8.5px] font-bold uppercase tracking-wider w-full text-center cursor-pointer hover:bg-[#333] transition-colors shadow-sm">
                            {isUploadingMedia ? 'Uploading...' : 'Upload'}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={isUploadingMedia}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleUploadImageFile(secIdx, file);
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Right: Title + Color + Stripe */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div>
                        <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                          Series / Section Title
                        </label>
                        <input
                          type="text"
                          value={sec.title}
                          onChange={(e) => handleUpdateSection(secIdx, { title: e.target.value })}
                          placeholder="SERIES TITLE..."
                          className="w-full px-3 py-1.5 bg-[#0f0f0f] border border-[#2d2d2d] rounded-lg text-xs font-black outline-none focus:border-[#0F3D3E] focus:ring-1 focus:ring-[#0F3D3E] shadow-inner transition-all"
                          style={{ color: sec.titleColor || '#00a651' }}
                        />
                      </div>

                      <div className="flex items-center justify-between gap-2 flex-wrap pt-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[8.5px] font-bold text-slate-400 uppercase">Color:</span>
                          <div className="flex items-center gap-1">
                            {PRESET_TITLE_COLORS.map(c => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => handleUpdateSection(secIdx, { titleColor: c })}
                                className={`w-4 h-4 rounded-full border transition-transform ${
                                  sec.titleColor === c ? 'scale-125 ring-2 ring-[#00a651] border-white' : 'border-[#333] hover:scale-110'
                                }`}
                                style={{ backgroundColor: c }}
                                title={c}
                              />
                            ))}
                            <input
                              type="color"
                              value={sec.titleColor || '#00a651'}
                              onChange={(e) => handleUpdateSection(secIdx, { titleColor: e.target.value })}
                              className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent"
                              title="Custom Color"
                            />
                          </div>
                        </div>

                        {/* Highlight Stripe Toggle */}
                        <label className={`flex items-center gap-1.5 text-[9px] font-bold cursor-pointer select-none px-2.5 py-1 rounded-md border transition-all ${
                          sec.hasBackground
                            ? 'bg-[#0F3D3E]/30 text-[#E2DCC8] border-[#0F3D3E]'
                            : 'bg-[#141414] text-slate-400 border-[#262626] hover:text-white'
                        }`}>
                          <input
                            type="checkbox"
                            checked={sec.hasBackground}
                            onChange={(e) => handleUpdateSection(secIdx, { hasBackground: e.target.checked })}
                            className="rounded text-[#0F3D3E] focus:ring-0 cursor-pointer w-3 h-3"
                          />
                          <span>Stripe</span>
                          {sec.hasBackground && (
                            <input
                              type="color"
                              value={sec.backgroundColor || '#e2e8f0'}
                              onChange={(e) => handleUpdateSection(secIdx, { backgroundColor: e.target.value })}
                              className="w-3.5 h-3.5 rounded cursor-pointer border-0 bg-transparent ml-0.5"
                              title="Stripe Background Color"
                            />
                          )}
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* 2. Specifications Table */}
                  <div className="space-y-2 pt-2.5 border-t border-[#242424]">
                    <div className="flex items-center justify-between flex-wrap gap-1.5">
                      <span className="text-[9.5px] font-black uppercase tracking-wider text-[#E2DCC8] flex items-center gap-1.5">
                        <Palette size={12} className="text-[#00a651]" />
                        Specs Table <span className="text-slate-400 font-normal font-mono text-[8.5px]">({sec.tableData.rows.length} rows)</span>
                      </span>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Style Drawer Toggle */}
                        <button
                          type="button"
                          onClick={() => setOpenStyleSecIdx(openStyleSecIdx === secIdx ? null : secIdx)}
                          className={`px-2 py-1 rounded-md text-[9px] font-bold flex items-center gap-1 transition-all border ${
                            openStyleSecIdx === secIdx
                              ? 'bg-[#0F3D3E] text-[#E2DCC8] border-[#0F3D3E] shadow-sm'
                              : 'bg-[#181818] hover:bg-[#222] border-[#333] text-slate-300 hover:text-white'
                          }`}
                          title="Customize Table Style, Colors & Sizing"
                        >
                          <Palette size={11} />
                          <span>Style</span>
                        </button>

                        {/* Category / Product Row Dropdown */}
                        <select
                          value=""
                          onChange={(e) => {
                            const val = e.target.value;
                            if (!val) return;

                            if (val.startsWith('prod:')) {
                              const prodId = val.replace('prod:', '');
                              const p = products.find(prod => String(prod.id) === String(prodId));
                              if (p) {
                                if (p.variants && p.variants.length > 0) {
                                  const rows = p.variants.map(v => generateRowFromProduct(sec.tableData.headers, p, v, categories));
                                  handleAddTableRowsWithData(secIdx, rows, p.image);
                                } else {
                                  const row = generateRowFromProduct(sec.tableData.headers, p, undefined, categories);
                                  handleAddTableRowsWithData(secIdx, [row], p.image);
                                }
                              }
                            } else if (val.startsWith('cat:')) {
                              const catId = val.replace('cat:', '');
                              const catProducts = products.filter(p => String(p.categoryId) === String(catId));
                              const allRows: string[][] = [];
                              catProducts.forEach(p => {
                                if (p.variants && p.variants.length > 0) {
                                  p.variants.forEach(v => allRows.push(generateRowFromProduct(sec.tableData.headers, p, v, categories)));
                                } else {
                                  allRows.push(generateRowFromProduct(sec.tableData.headers, p, undefined, categories));
                                }
                              });
                              if (allRows.length > 0) {
                                handleAddTableRowsWithData(secIdx, allRows, catProducts[0]?.image);
                              }
                            }
                          }}
                          className="px-2.5 py-1 bg-[#102728] hover:bg-[#153436] border border-[#0F3D3E] text-[#E2DCC8] rounded-md text-[9px] font-bold outline-none cursor-pointer transition-colors shadow-sm"
                        >
                          <option value="" disabled>+ Insert Product Rows...</option>
                          {categories.map(cat => {
                            const catProds = products.filter(p => p.categoryId === cat.id);
                            if (catProds.length === 0) return null;
                            return (
                              <optgroup key={cat.id} label={`📂 ${cat.name.toUpperCase()}`}>
                                <option value={`cat:${cat.id}`}>⚡ Insert All ({catProds.length} Products)</option>
                                {catProds.map(p => (
                                  <option key={p.id} value={`prod:${p.id}`}>
                                    • {p.name} {p.sku ? `(${p.sku})` : ''} {p.variants?.length ? `[${p.variants.length} vars]` : ''}
                                  </option>
                                ))}
                              </optgroup>
                            );
                          })}
                        </select>

                        {/* Product Field / Column Selector Dropdown */}
                        <select
                          value=""
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val) {
                              handleAddTableColumn(secIdx, val);
                            }
                          }}
                          className="px-2 py-1 bg-[#122827] hover:bg-[#183433] border border-[#0F3D3E] text-[#E2DCC8] rounded-md text-[9px] font-bold outline-none cursor-pointer transition-colors shadow-sm"
                          title="Add field / column from product data"
                        >
                          <option value="" disabled>+ Add Column...</option>
                          {availableProductFields.length > 0 && (
                            <optgroup label="📋 Fields in Your Product Data">
                              {availableProductFields.map(fKey => (
                                <option key={fKey} value={fKey}>✨ {fKey}</option>
                              ))}
                            </optgroup>
                          )}
                        </select>

                        <button
                          type="button"
                          onClick={() => handleAddTableRow(secIdx)}
                          className="px-2 py-1 bg-[#1c1c1c] hover:bg-[#252525] border border-[#333] text-[#E2DCC8] hover:text-white rounded-md text-[9px] font-bold flex items-center gap-1 transition-all shadow-sm"
                          title="Add Blank Row"
                        >
                          <Plus size={11} className="text-[#E2DCC8]" />
                          <span>Row</span>
                        </button>
                      </div>
                    </div>

                    {/* Table Style Customization Drawer */}
                    {openStyleSecIdx === secIdx && (
                      <div className="p-2.5 bg-[#101010] border border-[#2a2a2a] rounded-lg mb-2 space-y-2 text-[9px] animate-in fade-in duration-150">
                        <div className="flex items-center justify-between pb-1 border-b border-[#222]">
                          <span className="font-bold text-[#E2DCC8] uppercase tracking-wider flex items-center gap-1">
                            <Palette size={10} className="text-emerald-400" /> Table Styles & Dimensions
                          </span>
                          <button
                            type="button"
                            onClick={() => setOpenStyleSecIdx(null)}
                            className="text-slate-400 hover:text-white"
                          >
                            <X size={11} />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-0.5">
                          {/* Header BG */}
                          <div>
                            <label className="block text-[8px] font-bold text-slate-400 uppercase mb-1">Header Background</label>
                            <div className="flex items-center gap-1">
                              {['#002b36', '#0F3D3E', '#0f172a', '#4c0519', '#18181b'].map(c => (
                                <button
                                  key={c}
                                  type="button"
                                  onClick={() => handleUpdateTableStyle(secIdx, { headerBg: c })}
                                  className={`w-4 h-4 rounded-full border transition-transform ${sec.tableData.headerBg === c ? 'ring-2 ring-emerald-400 border-white scale-110' : 'border-slate-600'}`}
                                  style={{ backgroundColor: c }}
                                />
                              ))}
                              <input
                                type="color"
                                value={sec.tableData.headerBg || '#002b36'}
                                onChange={(e) => handleUpdateTableStyle(secIdx, { headerBg: e.target.value })}
                                className="w-4 h-4 rounded cursor-pointer bg-transparent border-0"
                                title="Custom Header Color"
                              />
                            </div>
                          </div>

                          {/* Header Text Color */}
                          <div>
                            <label className="block text-[8px] font-bold text-slate-400 uppercase mb-1">Header Text</label>
                            <div className="flex items-center gap-1">
                              {['#ffffff', '#E2DCC8', '#000000'].map(c => (
                                <button
                                  key={c}
                                  type="button"
                                  onClick={() => handleUpdateTableStyle(secIdx, { headerTextColor: c })}
                                  className={`w-4 h-4 rounded-full border transition-transform ${sec.tableData.headerTextColor === c ? 'ring-2 ring-emerald-400 border-white scale-110' : 'border-slate-600'}`}
                                  style={{ backgroundColor: c }}
                                />
                              ))}
                            </div>
                          </div>

                          {/* Font Size */}
                          <div>
                            <label className="block text-[8px] font-bold text-slate-400 uppercase mb-1">Font Size</label>
                            <div className="flex items-center gap-1">
                              {[7, 8, 9, 10].map(sz => (
                                <button
                                  key={sz}
                                  type="button"
                                  onClick={() => handleUpdateTableStyle(secIdx, { fontSize: sz, headerFontSize: sz + 0.5 })}
                                  className={`px-1.5 py-0.5 rounded font-bold transition-all ${
                                    Math.round(sec.tableData.fontSize || 8) === sz
                                      ? 'bg-[#0F3D3E] text-white ring-1 ring-emerald-400'
                                      : 'bg-[#1f1f1f] text-slate-400 hover:text-white'
                                  }`}
                                >
                                  {sz}px
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Cell Padding */}
                          <div>
                            <label className="block text-[8px] font-bold text-slate-400 uppercase mb-1">Cell Padding</label>
                            <div className="flex items-center gap-1">
                              {[3, 4, 6, 8].map(pad => (
                                <button
                                  key={pad}
                                  type="button"
                                  onClick={() => handleUpdateTableStyle(secIdx, { cellPadding: pad })}
                                  className={`px-1.5 py-0.5 rounded font-bold transition-all ${
                                    (sec.tableData.cellPadding || 4) === pad
                                      ? 'bg-[#0F3D3E] text-white ring-1 ring-emerald-400'
                                      : 'bg-[#1f1f1f] text-slate-400 hover:text-white'
                                  }`}
                                >
                                  {pad}px
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Table Editor Grid */}
                    <div className="overflow-x-auto border border-[#2d2d2d] rounded-lg custom-scrollbar shadow-inner bg-[#0e0e0e]">
                      <table className="w-full text-left border-collapse text-[10px]">
                        <thead>
                          <tr
                            className="border-b border-[#144f51]"
                            style={{
                              backgroundColor: sec.tableData.headerBg || '#002b36',
                              color: sec.tableData.headerTextColor || '#ffffff'
                            }}
                          >
                            <th className="p-2 w-9 text-center font-mono text-[9px] opacity-70 shrink-0 border-r border-white/10">#</th>
                            {sec.tableData.headers.map((hdr, cIdx) => (
                              <th
                                key={cIdx}
                                className={`p-2 font-black tracking-wider uppercase text-[9.5px] relative group/hdr border-r border-white/10 last:border-r-0 ${
                                  cIdx === 0 ? 'w-[130px]' : cIdx === 1 ? 'min-w-[200px]' : 'w-[120px]'
                                }`}
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between gap-1">
                                    <input
                                      type="text"
                                      value={hdr}
                                      onChange={(e) => handleHeaderChange(secIdx, cIdx, e.target.value)}
                                      className="w-full bg-white/10 hover:bg-white/15 focus:bg-white/25 text-inherit placeholder:opacity-50 font-black text-[9.5px] px-1.5 py-0.5 rounded outline-none uppercase tracking-wider transition-all"
                                      title="Click to rename field"
                                    />
                                  </div>

                                  {/* Column Sub-controls: Left, Right, Fill, Delete */}
                                  <div className="flex items-center justify-between px-0.5 opacity-60 group-hover/hdr:opacity-100 transition-opacity">
                                    <div className="flex items-center gap-0.5">
                                      <button
                                        type="button"
                                        disabled={cIdx === 0}
                                        onClick={() => handleMoveColumn(secIdx, cIdx, 'left')}
                                        className="p-0.5 hover:text-white hover:bg-white/20 rounded disabled:opacity-20 transition-all"
                                        title="Move Column Left"
                                      >
                                        <MoveLeft size={10} />
                                      </button>
                                      <button
                                        type="button"
                                        disabled={cIdx === sec.tableData.headers.length - 1}
                                        onClick={() => handleMoveColumn(secIdx, cIdx, 'right')}
                                        className="p-0.5 hover:text-white hover:bg-white/20 rounded disabled:opacity-20 transition-all"
                                        title="Move Column Right"
                                      >
                                        <MoveRight size={10} />
                                      </button>

                                      {/* Fill from param popover */}
                                      <div className="relative">
                                        <button
                                          type="button"
                                          onClick={() => setActiveFillMenu(activeFillMenu?.secIdx === secIdx && activeFillMenu?.colIdx === cIdx ? null : { secIdx, colIdx: cIdx })}
                                          className={`px-1 py-0.5 rounded text-[8px] font-black uppercase tracking-wider flex items-center gap-0.5 transition-all ${
                                            activeFillMenu?.secIdx === secIdx && activeFillMenu?.colIdx === cIdx
                                              ? 'bg-amber-400 text-black shadow-sm'
                                              : 'bg-amber-400/20 text-amber-300 hover:bg-amber-400/30'
                                          }`}
                                          title="Auto-fill this column with product field data"
                                        >
                                          <Zap size={9} className="text-amber-400" />
                                          <span>Fill</span>
                                        </button>

                                        {/* Fill Dropdown Popover */}
                                        {activeFillMenu?.secIdx === secIdx && activeFillMenu?.colIdx === cIdx && (
                                          <div
                                            className="absolute left-0 top-full mt-1.5 w-48 rounded-md shadow-2xl border bg-[#161616] border-[#2e2e2e] text-white z-50 p-1.5 space-y-0.5 animate-in fade-in duration-100"
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            <div className="px-1.5 py-1 text-[8.5px] font-bold uppercase tracking-wider text-[#888] border-b border-[#262626] flex justify-between items-center">
                                              <span>Auto-fill &quot;{hdr}&quot;</span>
                                              <button
                                                onClick={() => setActiveFillMenu(null)}
                                                className="text-[#888] hover:text-white"
                                              >
                                                <X size={10} />
                                              </button>
                                            </div>
                                            <button
                                              type="button"
                                              onClick={() => handleFillColumnFromParam(secIdx, cIdx, hdr)}
                                              className="w-full text-left px-2 py-1 rounded text-[9px] font-bold text-amber-300 hover:bg-amber-400/10 flex items-center gap-1"
                                            >
                                              <Zap size={9} /> Match Header Name ({hdr})
                                            </button>
                                            {availableProductFields.length > 0 && (
                                              <>
                                                <div className="border-t border-[#222] my-0.5" />
                                                <div className="px-1.5 py-0.5 text-[7.5px] font-bold uppercase tracking-wider text-slate-500">
                                                  Your Product Fields
                                                </div>
                                                {availableProductFields.map(fKey => (
                                                  <button
                                                    key={fKey}
                                                    type="button"
                                                    onClick={() => handleFillColumnFromParam(secIdx, cIdx, fKey)}
                                                    className="w-full text-left px-2 py-1 rounded text-[9px] text-slate-200 hover:bg-[#0F3D3E] hover:text-[#E2DCC8] flex items-center gap-1"
                                                  >
                                                    <span>✨</span> {fKey}
                                                  </button>
                                                ))}
                                              </>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {sec.tableData.headers.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteTableColumn(secIdx, cIdx)}
                                        className="p-0.5 opacity-60 hover:opacity-100 hover:text-red-400 hover:bg-black/30 rounded transition-all"
                                        title="Delete Column"
                                      >
                                        <Trash2 size={10} />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </th>
                            ))}
                            <th className="p-2 w-28 text-center font-mono text-[9px] opacity-70 shrink-0">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sec.tableData.rows.map((row, rIdx) => {
                            const isMatched = isRowMatchedToProduct(row);
                            return (
                              <tr
                                key={rIdx}
                                className={`border-b border-[#1e1e1e] group transition-colors ${
                                  rIdx % 2 === 1 ? 'bg-[#141414]' : 'bg-[#101010]'
                                } hover:bg-[#162526]`}
                              >
                                <td className="p-1.5 text-center font-mono text-slate-500 text-[9px] w-9 border-r border-[#1e1e1e]">
                                  <div className="flex flex-col items-center justify-center">
                                    <span>{rIdx + 1}</span>
                                    {isMatched && (
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-0.5 shadow-sm shadow-emerald-400" title="Linked to catalog product" />
                                    )}
                                  </div>
                                </td>
                                {row.map((cell, cIdx) => (
                                  <td
                                    key={cIdx}
                                    className={`p-1 border-r border-[#1e1e1e] last:border-r-0 ${
                                      cIdx === 0 ? 'w-[130px]' : cIdx === 1 ? 'min-w-[200px]' : 'w-[120px]'
                                    }`}
                                  >
                                    <input
                                      type="text"
                                      value={cell}
                                      onChange={(e) => handleCellChange(secIdx, rIdx, cIdx, e.target.value)}
                                      className={`w-full px-2.5 py-1.5 bg-transparent border border-transparent focus:border-[#0F3D3E] outline-none focus:bg-[#172324] rounded-md text-[10.5px] font-mono transition-all ${
                                        cIdx === 3 ? 'text-[#E2DCC8] font-black' : cIdx === 0 ? 'text-white font-bold' : 'text-slate-100'
                                      }`}
                                    />
                                  </td>
                                ))}
                                <td className="p-1 text-center w-28 shrink-0">
                                  <div className="flex items-center justify-center gap-0.5 opacity-40 group-hover:opacity-100 transition-opacity">
                                    {/* Link / Fill row from Product */}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setLinkRowModal({ secIdx, rIdx });
                                        setLinkRowSearch('');
                                        setLinkRowCategory('all');
                                      }}
                                      className="p-1 text-slate-400 hover:text-[#E2DCC8] hover:bg-[#0F3D3E]/50 rounded transition-colors"
                                      title="Fill row from catalog product"
                                    >
                                      <Package size={11} />
                                    </button>
                                    {/* Move Row Up */}
                                    <button
                                      type="button"
                                      disabled={rIdx === 0}
                                      onClick={() => handleMoveTableRow(secIdx, rIdx, 'up')}
                                      className="p-1 text-slate-400 hover:text-white hover:bg-[#252525] rounded disabled:opacity-20 transition-colors"
                                      title="Move Row Up"
                                    >
                                      <ArrowUp size={11} />
                                    </button>
                                    {/* Move Row Down */}
                                    <button
                                      type="button"
                                      disabled={rIdx === sec.tableData.rows.length - 1}
                                      onClick={() => handleMoveTableRow(secIdx, rIdx, 'down')}
                                      className="p-1 text-slate-400 hover:text-white hover:bg-[#252525] rounded disabled:opacity-20 transition-colors"
                                      title="Move Row Down"
                                    >
                                      <ArrowDown size={11} />
                                    </button>
                                    {/* Duplicate Row */}
                                    <button
                                      type="button"
                                      onClick={() => handleDuplicateTableRow(secIdx, rIdx)}
                                      className="p-1 text-slate-400 hover:text-white hover:bg-[#252525] rounded transition-colors"
                                      title="Duplicate Row"
                                    >
                                      <Copy size={11} />
                                    </button>
                                    {/* Delete Row */}
                                    {sec.tableData.rows.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteTableRow(secIdx, rIdx)}
                                        className="p-1 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                        title="Delete Row"
                                      >
                                        <Trash2 size={11} />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= PANEL FOOTER ================= */}
      <div className="p-3 border-t border-[#262626] bg-[#161616] space-y-2 shrink-0">
        <div className="px-3 py-2 bg-[#0F3D3E]/30 border border-[#0F3D3E]/60 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
            <span className="text-[10px] font-bold text-[#E2DCC8] tracking-wide">
              Live Auto-Sync Active
            </span>
          </div>
          <span className="text-[9px] text-slate-400 font-mono">
            Directly editing Page {currentPageIndex + 1}
          </span>
        </div>

        <button
          type="button"
          onClick={handleApplyAndReflow}
          className="w-full py-2 px-3 bg-[#1b2529] hover:bg-[#223136] text-[#E2DCC8] border border-[#0F3D3E]/60 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all hover:scale-[1.01] active:scale-[0.99]"
          title="Reflow all pages across catalog"
        >
          <Zap size={12} className="text-[#00a651]" />
          <span>Auto-Reflow Pages</span>
        </button>
      </div>

      {/* ================= COMPLETE MEDIA GALLERY & UPLOADS MODAL ================= */}
      {imageGalleryPickerSectionIdx !== null && (
        <div
          className="fixed inset-0 z-[1150] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setImageGalleryPickerSectionIdx(null)}
        >
          <div
            className="w-full max-w-2xl bg-[#161616] border border-[#262626] rounded-xl shadow-2xl flex flex-col max-h-[82vh] overflow-hidden text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-[#262626] flex items-center justify-between bg-[#141414]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-[#0F3D3E] flex items-center justify-center text-[#E2DCC8] shadow-sm">
                  <ImageIcon size={15} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">
                    Select Picture for Section #{imageGalleryPickerSectionIdx + 1}
                  </h4>
                  <p className="text-[9px] text-slate-400">
                    Pick from your uploads, category thumbnails, product catalog, or upload a new photo
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setImageGalleryPickerSectionIdx(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Search & Upload Action Bar */}
            <div className="p-3 border-b border-[#242424] bg-[#181818] flex flex-col sm:flex-row items-center gap-2.5 justify-between">
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  value={gallerySearch}
                  onChange={(e) => setGallerySearch(e.target.value)}
                  placeholder="Search media, categories, products..."
                  className="w-full pl-3 pr-8 py-1.5 bg-[#101010] border border-[#2d2d2d] rounded-lg text-xs text-white placeholder-slate-500 outline-none focus:border-[#0F3D3E]"
                />
                {gallerySearch && (
                  <button
                    type="button"
                    onClick={() => setGallerySearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Prominent Upload Button */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  ref={galleryFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file && imageGalleryPickerSectionIdx !== null) {
                      await handleUploadImageFile(imageGalleryPickerSectionIdx, file);
                      setGalleryTab('uploads');
                    }
                    if (galleryFileInputRef.current) galleryFileInputRef.current.value = '';
                  }}
                />
                <button
                  type="button"
                  disabled={isUploadingMedia}
                  onClick={() => galleryFileInputRef.current?.click()}
                  className="w-full sm:w-auto px-3.5 py-1.5 bg-[#0F3D3E] hover:bg-[#155456] text-[#E2DCC8] border border-[#E2DCC8]/40 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-[#0F3D3E]/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Upload size={12} className="text-[#E2DCC8]" />
                  <span>{isUploadingMedia ? 'Uploading...' : '+ Upload New Photo'}</span>
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="px-4 py-2 border-b border-[#242424] bg-[#141414] flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
              {[
                { id: 'uploads', label: '📸 My Uploads', count: mediaItems?.length || 0 },
                { id: 'categories', label: '📂 Categories', count: categories?.length || 0 },
                { id: 'products', label: '📦 Products', count: products?.length || 0 },
                { id: 'presets', label: '💡 Studio Presets', count: 6 },
                { id: 'admin', label: '☁️ System Assets', count: adminAssets?.length || 0 },
                { id: 'all', label: 'All Media', count: (mediaItems?.length || 0) + (categories?.length || 0) + (products?.length || 0) + 6 }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setGalleryTab(tab.id as any)}
                  className={`px-3 py-1 rounded-md text-[9.5px] font-black uppercase tracking-wider shrink-0 transition-all ${
                    galleryTab === tab.id
                      ? 'bg-[#0F3D3E] text-[#E2DCC8] shadow-sm'
                      : 'bg-[#1c1c1c] text-slate-400 hover:text-white hover:bg-[#252525]'
                  }`}
                >
                  {tab.label} <span className="opacity-70 font-mono text-[8.5px]">({tab.count})</span>
                </button>
              ))}
            </div>

            {/* Modal Body / Media Grid */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-[#111111] space-y-5">
              {/* 1. USER UPLOADS */}
              {(galleryTab === 'all' || galleryTab === 'uploads') && (
                <div>
                  <div className="flex items-center justify-between mb-2.5 pb-1 border-b border-[#222]">
                    <h5 className="text-[10.5px] font-black text-[#E2DCC8] uppercase tracking-wider flex items-center gap-1.5">
                      <Upload size={12} className="text-[#00a651]" /> My Uploaded Pictures ({mediaItems?.length || 0})
                    </h5>
                    <button
                      type="button"
                      onClick={() => galleryFileInputRef.current?.click()}
                      className="text-[8.5px] text-[#00a651] hover:underline font-bold uppercase"
                    >
                      + Upload More
                    </button>
                  </div>

                  {!mediaItems || mediaItems.length === 0 ? (
                    <div className="p-6 rounded-xl border border-dashed border-[#333] bg-[#161616] text-center space-y-2">
                      <Upload size={22} className="mx-auto text-slate-500" />
                      <p className="text-xs text-slate-300 font-bold">No uploaded pictures yet</p>
                      <p className="text-[9px] text-slate-500">Upload your product photos, logos, or catalog assets here.</p>
                      <button
                        type="button"
                        onClick={() => galleryFileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-[#0F3D3E] text-[#E2DCC8] rounded-md text-[9px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 shadow"
                      >
                        <Upload size={11} /> Upload Picture Now
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {mediaItems
                        .filter(item => !gallerySearch || (item.name && item.name.toLowerCase().includes(gallerySearch.toLowerCase())))
                        .map((item) => {
                          const imgUrl = normalizeImageUrl(item.url);
                          const isSelected = sections[imageGalleryPickerSectionIdx]?.imageSrc === imgUrl;
                          return (
                            <div
                              key={`media-${item.id}`}
                              onClick={() => {
                                handleUpdateSection(imageGalleryPickerSectionIdx, { imageSrc: imgUrl });
                                setImageGalleryPickerSectionIdx(null);
                              }}
                              className={`relative rounded-lg border p-1.5 cursor-pointer flex flex-col items-center gap-1.5 transition-all group ${
                                isSelected
                                  ? 'border-[#00a651] bg-[#0F3D3E]/30 ring-2 ring-[#00a651]'
                                  : 'border-[#262626] bg-[#161616] hover:border-[#0F3D3E] hover:bg-[#1d1d1d]'
                              }`}
                            >
                              <div className="w-full h-24 bg-[#0d0d0d] rounded-md flex items-center justify-center overflow-hidden p-1">
                                <img
                                  src={imgUrl}
                                  alt={item.name}
                                  className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                                />
                              </div>
                              <div className="w-full text-center px-0.5">
                                <p className="text-[9px] font-bold text-white truncate">{item.name || 'Uploaded Image'}</p>
                                <p className="text-[8px] text-slate-400 font-mono">{item.size || 'Upload'}</p>
                              </div>
                              {isSelected && (
                                <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#00a651] text-black flex items-center justify-center shadow-md">
                                  <CheckCircle2 size={12} className="stroke-[3]" />
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              )}

              {/* 2. CATEGORY THUMBNAILS */}
              {(galleryTab === 'all' || galleryTab === 'categories') && (
                <div>
                  <div className="flex items-center justify-between mb-2.5 pb-1 border-b border-[#222]">
                    <h5 className="text-[10.5px] font-black text-[#E2DCC8] uppercase tracking-wider flex items-center gap-1.5">
                      <Layers size={12} className="text-[#0F3D3E]" /> Category Thumbnails ({categories?.length || 0})
                    </h5>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {categories
                      .filter(cat => cat.thumbnail || (cat.images && cat.images.length > 0))
                      .filter(cat => !gallerySearch || cat.name.toLowerCase().includes(gallerySearch.toLowerCase()))
                      .map((cat) => {
                        const imgUrl = normalizeImageUrl(cat.thumbnail || cat.images?.[0]);
                        const isSelected = sections[imageGalleryPickerSectionIdx]?.imageSrc === imgUrl;
                        return (
                          <div
                            key={`cat-${cat.id}`}
                            onClick={() => {
                              handleUpdateSection(imageGalleryPickerSectionIdx, { imageSrc: imgUrl });
                              setImageGalleryPickerSectionIdx(null);
                            }}
                            className={`relative rounded-lg border p-1.5 cursor-pointer flex flex-col items-center gap-1.5 transition-all group ${
                              isSelected
                                ? 'border-[#00a651] bg-[#0F3D3E]/30 ring-2 ring-[#00a651]'
                                : 'border-[#262626] bg-[#161616] hover:border-[#0F3D3E] hover:bg-[#1d1d1d]'
                            }`}
                          >
                            <div className="w-full h-24 bg-[#0d0d0d] rounded-md flex items-center justify-center overflow-hidden p-1">
                              <img
                                src={imgUrl}
                                alt={cat.name}
                                className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                              />
                            </div>
                            <div className="w-full text-center px-0.5">
                              <p className="text-[9px] font-bold text-white truncate">{cat.name}</p>
                              <p className="text-[8px] text-[#00a651] font-bold">Category</p>
                            </div>
                            {isSelected && (
                              <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#00a651] text-black flex items-center justify-center shadow-md">
                                <CheckCircle2 size={12} className="stroke-[3]" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* 3. PRODUCT CATALOG PHOTOS */}
              {(galleryTab === 'all' || galleryTab === 'products') && (
                <div>
                  <div className="flex items-center justify-between mb-2.5 pb-1 border-b border-[#222]">
                    <h5 className="text-[10.5px] font-black text-[#E2DCC8] uppercase tracking-wider flex items-center gap-1.5">
                      <Package size={12} className="text-[#38bdf8]" /> Product Catalog Photos ({products?.length || 0})
                    </h5>
                  </div>
                  {products.length === 0 ? (
                    <div className="py-4 text-center text-slate-500 text-xs">No product photos found.</div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {products
                        .filter(p => !gallerySearch || p.name.toLowerCase().includes(gallerySearch.toLowerCase()) || (p.sku && p.sku.toLowerCase().includes(gallerySearch.toLowerCase())))
                        .map((p) => {
                          const targetCat = categories.find(c => String(c.id) === String(p.categoryId));
                          const imgUrl = resolveProductImage(p, targetCat, products);
                          const isSelected = sections[imageGalleryPickerSectionIdx]?.imageSrc === imgUrl;
                          return (
                            <div
                              key={p.id}
                              onClick={() => {
                                handleUpdateSection(imageGalleryPickerSectionIdx, { imageSrc: imgUrl });
                                setImageGalleryPickerSectionIdx(null);
                              }}
                              className={`relative rounded-lg border p-1.5 cursor-pointer flex flex-col items-center gap-1.5 transition-all group ${
                                isSelected
                                  ? 'border-[#00a651] bg-[#0F3D3E]/30 ring-2 ring-[#00a651]'
                                  : 'border-[#262626] bg-[#161616] hover:border-[#38bdf8]/60 hover:bg-[#1d1d1d]'
                              }`}
                            >
                              <div className="w-full h-24 bg-[#0d0d0d] rounded-md flex items-center justify-center overflow-hidden p-1">
                                <img
                                  src={imgUrl}
                                  alt={p.name}
                                  className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                                />
                              </div>
                              <div className="w-full text-center px-0.5">
                                <p className="text-[9px] font-bold text-white truncate">{p.name || 'Product'}</p>
                                <p className="text-[8px] text-slate-400 font-mono">{p.sku || ''}</p>
                              </div>
                              {isSelected && (
                                <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#00a651] text-black flex items-center justify-center shadow-md">
                                  <CheckCircle2 size={12} className="stroke-[3]" />
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              )}

              {/* 4. STUDIO PRESETS */}
              {(galleryTab === 'all' || galleryTab === 'presets') && (
                <div>
                  <div className="flex items-center justify-between mb-2.5 pb-1 border-b border-[#222]">
                    <h5 className="text-[10.5px] font-black text-[#E2DCC8] uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles size={12} className="text-amber-400" /> Studio Light Presets (6)
                    </h5>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { id: 'preset-1', name: 'COB Downlight', url: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=600' },
                      { id: 'preset-2', name: 'Pendant Luminaire', url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=600' },
                      { id: 'preset-3', name: 'Recessed Track', url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=600' },
                      { id: 'preset-4', name: 'Modern Fixture', url: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&q=80&w=600' },
                      { id: 'preset-5', name: 'Architectural Spot', url: 'https://images.unsplash.com/photo-1517991104123-1d56a6e81ed9?auto=format&fit=crop&q=80&w=600' },
                      { id: 'preset-6', name: 'Linear Diffuser', url: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?auto=format&fit=crop&q=80&w=600' }
                    ]
                      .filter(preset => !gallerySearch || preset.name.toLowerCase().includes(gallerySearch.toLowerCase()))
                      .map((preset) => {
                        const isSelected = sections[imageGalleryPickerSectionIdx]?.imageSrc === preset.url;
                        return (
                          <div
                            key={preset.id}
                            onClick={() => {
                              handleUpdateSection(imageGalleryPickerSectionIdx, { imageSrc: preset.url });
                              setImageGalleryPickerSectionIdx(null);
                            }}
                            className={`relative rounded-lg border p-1.5 cursor-pointer flex flex-col items-center gap-1.5 transition-all group ${
                              isSelected
                                ? 'border-[#00a651] bg-[#0F3D3E]/30 ring-2 ring-[#00a651]'
                                : 'border-[#262626] bg-[#161616] hover:border-amber-400/60 hover:bg-[#1d1d1d]'
                            }`}
                          >
                            <div className="w-full h-24 bg-[#0d0d0d] rounded-md flex items-center justify-center overflow-hidden">
                              <img
                                src={preset.url}
                                alt={preset.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            </div>
                            <div className="w-full text-center px-0.5">
                              <p className="text-[9px] font-bold text-white truncate">{preset.name}</p>
                              <p className="text-[8px] text-slate-400">Studio</p>
                            </div>
                            {isSelected && (
                              <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#00a651] text-black flex items-center justify-center shadow-md">
                                <CheckCircle2 size={12} className="stroke-[3]" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* 5. SYSTEM / ADMIN ASSETS */}
              {(galleryTab === 'all' || galleryTab === 'admin') && adminAssets && adminAssets.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2.5 pb-1 border-b border-[#222]">
                    <h5 className="text-[10.5px] font-black text-[#E2DCC8] uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles size={12} className="text-[#0F3D3E]" /> System Assets ({adminAssets.length})
                    </h5>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {adminAssets
                      .filter(a => !gallerySearch || a.name.toLowerCase().includes(gallerySearch.toLowerCase()))
                      .map((a) => {
                        const imgUrl = normalizeImageUrl(a.url);
                        const isSelected = sections[imageGalleryPickerSectionIdx]?.imageSrc === imgUrl;
                        return (
                          <div
                            key={`admin-${a.id}`}
                            onClick={() => {
                              handleUpdateSection(imageGalleryPickerSectionIdx, { imageSrc: imgUrl });
                              setImageGalleryPickerSectionIdx(null);
                            }}
                            className={`relative rounded-lg border p-1.5 cursor-pointer flex flex-col items-center gap-1.5 transition-all group ${
                              isSelected
                                ? 'border-[#00a651] bg-[#0F3D3E]/30 ring-2 ring-[#00a651]'
                                : 'border-[#262626] bg-[#161616] hover:border-[#0F3D3E] hover:bg-[#1d1d1d]'
                            }`}
                          >
                            <div className="w-full h-24 bg-[#0d0d0d] rounded-md flex items-center justify-center overflow-hidden p-1">
                              <img
                                src={imgUrl}
                                alt={a.name}
                                className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                              />
                            </div>
                            <div className="w-full text-center px-0.5">
                              <p className="text-[9px] font-bold text-white truncate">{a.name}</p>
                              <p className="text-[8px] text-slate-400 font-mono">System</p>
                            </div>
                            {isSelected && (
                              <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#00a651] text-black flex items-center justify-center shadow-md">
                                <CheckCircle2 size={12} className="stroke-[3]" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= PRODUCT PICKER SUB-MODAL ================= */}
      {productPickerSectionIdx !== null && (
        <div
          className="fixed inset-0 z-[1100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setProductPickerSectionIdx(null)}
        >
          <div
            className="w-full max-w-md bg-[#161616] border border-[#262626] rounded-[6px] shadow-2xl flex flex-col max-h-[75vh] overflow-hidden text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-[#262626] flex items-center justify-between bg-[#141414]">
              <div className="flex items-center gap-2">
                <Package size={14} className="text-[#E2DCC8]" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Fill Section #{productPickerSectionIdx + 1}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setProductPickerSectionIdx(null)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>

            <div className="p-2.5 border-b border-[#262626] bg-[#141414] space-y-1.5">
              <input
                type="text"
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                placeholder="Search products by name or SKU..."
                className="w-full px-2.5 py-1 bg-[#1a1a1a] border border-[#333] rounded text-xs text-white placeholder-[#666] outline-none focus:border-[#0F3D3E]"
              />

              {categories.length > 0 && (
                <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar pb-0.5">
                  <button
                    type="button"
                    onClick={() => setPickerCategoryFilter(null)}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider shrink-0 transition-all ${
                      pickerCategoryFilter === null
                        ? 'bg-[#0F3D3E] text-white'
                        : 'bg-[#202020] text-slate-400 hover:text-white'
                    }`}
                  >
                    All ({products.length})
                  </button>
                  {categories.map(cat => {
                    const count = products.filter(p => p.categoryId === cat.id).length;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setPickerCategoryFilter(cat.id)}
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider shrink-0 transition-all ${
                          pickerCategoryFilter === cat.id
                            ? 'bg-[#0F3D3E] text-white'
                            : 'bg-[#202020] text-slate-400 hover:text-white'
                        }`}
                      >
                        {cat.name} ({count})
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar bg-[#121212]">
              {(() => {
                const filtered = products.filter(p => {
                  const matchCat = pickerCategoryFilter ? p.categoryId === pickerCategoryFilter : true;
                  const matchQuery = pickerSearch
                    ? (p.name.toLowerCase().includes(pickerSearch.toLowerCase()) || p.sku.toLowerCase().includes(pickerSearch.toLowerCase()))
                    : true;
                  return matchCat && matchQuery;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="py-8 text-center text-[#777] text-xs">
                      No products found.
                    </div>
                  );
                }

                return filtered.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleSelectProductForSection(productPickerSectionIdx, p)}
                    className="p-2.5 rounded border border-[#262626] bg-[#161616] hover:border-[#0F3D3E] hover:bg-[#1a1a1a] flex items-center justify-between gap-2.5 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-8 h-8 rounded object-contain bg-[#101010] border border-[#262626] p-0.5 shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded bg-[#101010] border border-[#262626] flex items-center justify-center text-[#666] shrink-0">
                          <Package size={14} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-white truncate group-hover:text-[#E2DCC8]">
                          {p.name}
                        </p>
                        <div className="flex items-center gap-1.5 text-[9px] text-[#888]">
                          {p.sku && <span className="font-mono">{p.sku}</span>}
                          {p.price !== undefined && <span className="text-[#E2DCC8]">• ₹{p.price}</span>}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="px-2 py-0.5 bg-[#0F3D3E] hover:bg-[#155455] text-white rounded text-[9px] font-bold uppercase shrink-0"
                    >
                      Select
                    </button>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ================= LINK / FILL ROW FROM PRODUCT MODAL ================= */}
      {linkRowModal && (
        <div
          className="fixed inset-0 z-[1200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLinkRowModal(null)}
        >
          <div
            className="w-full max-w-xl bg-[#141414] border border-[#2a2a2a] rounded-xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden text-white animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-4 py-3.5 border-b border-[#242424] flex items-center justify-between bg-[#181818]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#0F3D3E] text-[#E2DCC8] flex items-center justify-center shadow-sm">
                  <Package size={15} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Fill Row #{linkRowModal.rIdx + 1} with Product
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    Section #{linkRowModal.secIdx + 1} Specs Table
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLinkRowModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {/* Search & Category Filter */}
            <div className="p-3 border-b border-[#242424] bg-[#161616] flex items-center gap-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={linkRowSearch}
                  onChange={(e) => setLinkRowSearch(e.target.value)}
                  placeholder="Search products by title or model no / SKU..."
                  className="w-full pl-8 pr-3 py-1.5 bg-[#0f0f0f] border border-[#333] rounded-lg text-xs text-white placeholder-slate-500 outline-none focus:border-[#0F3D3E]"
                  autoFocus
                />
              </div>
              {categories.length > 0 && (
                <select
                  value={linkRowCategory}
                  onChange={(e) => setLinkRowCategory(e.target.value)}
                  className="px-2.5 py-1.5 bg-[#0f0f0f] border border-[#333] rounded-lg text-xs text-slate-300 outline-none cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  {categories.map(c => (
                    <option key={c.id} value={String(c.id)}>{c.name}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Products List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar bg-[#111111]">
              {(() => {
                const filtered = products.filter(p => {
                  const matchCat = linkRowCategory === 'all' || String(p.categoryId) === String(linkRowCategory);
                  const q = linkRowSearch.toLowerCase().trim();
                  const matchQuery = !q || (p.name && p.name.toLowerCase().includes(q)) || (p.sku && p.sku.toLowerCase().includes(q));
                  return matchCat && matchQuery;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="py-12 text-center text-slate-500 text-xs">
                      No matching products found.
                    </div>
                  );
                }

                return filtered.map((p) => {
                  const targetCat = categories.find(c => String(c.id) === String(p.categoryId));
                  const pImg = resolveProductImage(p, targetCat, products);

                  return (
                    <div
                      key={p.id}
                      className="p-2.5 bg-[#181818] hover:bg-[#202020] border border-[#2a2a2a] rounded-lg transition-all flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {pImg ? (
                          <img
                            src={normalizeImageUrl(pImg)}
                            alt={p.name}
                            className="w-10 h-10 object-contain rounded bg-[#0d0d0d] p-0.5 border border-[#333] shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded bg-[#0d0d0d] border border-[#333] flex items-center justify-center text-slate-500 shrink-0">
                            <Package size={16} />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate group-hover:text-[#E2DCC8]">
                            {p.name}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400">
                            {p.sku && <span className="font-mono">{p.sku}</span>}
                            {p.price !== undefined && <span className="text-[#E2DCC8] font-bold">• ₹{p.price}</span>}
                            {p.variants && p.variants.length > 0 && (
                              <span className="text-amber-300 font-mono text-[9px]">[{p.variants.length} vars]</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {p.variants && p.variants.length > 0 ? (
                          <div className="flex flex-col gap-1 items-end">
                            <button
                              type="button"
                              onClick={() => handleLinkRowToProduct(linkRowModal.secIdx, linkRowModal.rIdx, p)}
                              className="px-2.5 py-1 bg-[#0F3D3E] hover:bg-[#145354] text-[#E2DCC8] rounded text-[10px] font-bold transition-all shadow-sm"
                            >
                              Use Base ({p.sku || 'Main'})
                            </button>
                            <div className="flex flex-wrap gap-1 justify-end max-w-xs">
                              {p.variants.map((v, vIdx) => (
                                <button
                                  key={v.id || vIdx}
                                  type="button"
                                  onClick={() => handleLinkRowToProduct(linkRowModal.secIdx, linkRowModal.rIdx, p, v)}
                                  className="px-2 py-0.5 bg-[#262626] hover:bg-[#333] text-slate-300 hover:text-white rounded text-[9px] font-mono transition-all border border-[#3a3a3a]"
                                  title={`Use variant: ${v.sku} - ${v.name}`}
                                >
                                  {v.sku || v.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleLinkRowToProduct(linkRowModal.secIdx, linkRowModal.rIdx, p)}
                            className="px-3 py-1 bg-[#0F3D3E] hover:bg-[#145354] text-[#E2DCC8] rounded text-xs font-bold transition-all shadow-sm"
                          >
                            Select Product
                          </button>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default GridStudioPanel;
