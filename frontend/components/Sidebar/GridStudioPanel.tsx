import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X, Sparkles, Image as ImageIcon, Plus, Trash2,
  ArrowUp, ArrowDown, Check, Package, Palette,
  Upload, Layers, Zap, SlidersHorizontal, ChevronRight,
  ChevronLeft, ChevronDown, Grid, MoveRight, MoveLeft, ExternalLink,
  FileText, Copy, ArrowRightLeft, Eye, CheckCircle2, Search, Table, FolderPlus
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Product, ProductVariant, ProductGridSection, TableData, CatalogPage, Category } from '../../types';
import { PAGE_WIDTH, PAGE_HEIGHT } from '../../constants';
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

export const generateSectionForCategory = (
  cat: Category | { id: string | number; name: string; thumbnail?: string; images?: string[]; customSchema?: any[] },
  products: Product[],
  categories: any[],
  sectionIndex: number = 0
): ProductGridSection => {
  const catProds = products.filter(p => String(p.categoryId) === String(cat.id));
  const catImg = resolveProductImage(catProds[0], cat as any, catProds);
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
    id: `sec-${Date.now()}-${sectionIndex}`,
    title: cat.name.toUpperCase(),
    titleColor: '#00a651',
    titleFontSize: 22,
    imageSrc: catImg,
    hasBackground: sectionIndex % 2 === 1,
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
};

export const getUnincludedCategories = (
  catalog: any,
  categories: Category[],
  products: Product[],
  currentSections?: ProductGridSection[],
  currentPageIdx?: number
): Category[] => {
  if (!catalog?.pages || !categories || !Array.isArray(categories)) return [];

  const includedCatIds = new Set<string>();
  const includedCatNames = new Set<string>();

  catalog.pages.forEach((p: CatalogPage, pIdx: number) => {
    if (p.categoryId) {
      includedCatIds.add(String(p.categoryId));
    }

    const pageSecs = (currentPageIdx !== undefined && pIdx === currentPageIdx && currentSections && currentSections.length > 0)
      ? currentSections
      : extractSectionsFromPage(p);

    pageSecs.forEach(sec => {
      if (sec.title) {
        includedCatNames.add(sec.title.trim().toLowerCase());
      }
    });

    (p.elements || []).forEach(el => {
      if (el.productId) {
        const prod = products.find(pr => String(pr.id) === String(el.productId));
        if (prod?.categoryId) {
          includedCatIds.add(String(prod.categoryId));
        }
      }
    });
  });

  return categories.filter(cat => {
    const idStr = String(cat.id);
    const nameStr = (cat.name || '').trim().toLowerCase();

    // Check ID match
    if (includedCatIds.has(idStr)) return false;

    // Check Name match
    if (includedCatNames.has(nameStr)) return false;

    // Check if any section title contains or is contained by category name
    for (const title of includedCatNames) {
      if (title && (title === nameStr || title.includes(nameStr) || (nameStr.length > 4 && nameStr.includes(title)))) {
        return false;
      }
    }

    return true;
  });
};

const PRESET_TITLE_COLORS = ['#00a651', '#0F3D3E', '#E2DCC8', '#38bdf8', '#f59e0b', '#dc2626'];

export const extractSectionsFromPage = (page: CatalogPage | undefined): ProductGridSection[] => {
  if (!page || !page.elements) return [];
  if (page.type === 'cover' || page.type === 'index' || page.type === 'closing') return [];

  const tables = page.elements.filter(el => el.type === 'table');
  if (tables.length === 0) return [];

  const titles = page.elements.filter(el => el.type === 'text' && (el.fontSize || 14) >= 18);
  const images = page.elements.filter(el => el.type === 'image');
  const backgrounds = page.elements.filter(el => el.type === 'shape' && (el.width || 0) >= 500);

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
    mediaItems, adminAssets, addMedia, fetchMedia, addElement,
    setEditorTab, applyProductGridToPage, reflowCatalogPages,
    swapPageSections, deletePageSection, addInteriorPageWithInheritedLayout,
    autoGenerateCatalogFromAllCategories, uiTheme
  } = useStore();

  const isDark = uiTheme === 'dark';

  const [viewMode, setViewMode] = useState<'editor' | 'overview' | 'single-items'>('editor');
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
    if (page?.type === 'cover' || page?.type === 'index' || page?.type === 'closing') {
      return [];
    }
    const extracted = extractSectionsFromPage(page);
    if (extracted.length >= 1) return extracted;
    return generateSectionsFromRealProducts(page, currentPageIndex, products, categories);
  });

  const sectionsRef = useRef(sections);
  useEffect(() => { sectionsRef.current = sections; }, [sections]);

  // Add Unincluded Category modal state
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [addCategoryTargetPageIdx, setAddCategoryTargetPageIdx] = useState<number | null>(null);
  const [addCategorySearch, setAddCategorySearch] = useState('');

  // Compute unincluded categories dynamically
  const unincludedCategories = useMemo(() => {
    return getUnincludedCategories(catalog, categories, products, sections, currentPageIndex);
  }, [catalog, categories, products, sections, currentPageIndex]);

  const handleAddCategoryToCatalog = (cat: Category, targetPageIdx?: number | null) => {
    let pageIdx = targetPageIdx;

    if (pageIdx === undefined || pageIdx === null) {
      // Find first non-cover interior page with < 3 sections
      const availablePageIdx = catalog.pages.findIndex((p, idx) => {
        if (p.type === 'cover' || p.type === 'index' || p.type === 'closing') return false;
        const secs = (idx === currentPageIndex) ? sections : extractSectionsFromPage(p);
        return secs.length < 3;
      });

      if (availablePageIdx !== -1) {
        pageIdx = availablePageIdx;
      } else {
        // Need a new interior page
        addInteriorPageWithInheritedLayout();
        pageIdx = catalog.pages.length;
      }
    }

    const targetPage = catalog.pages[pageIdx];
    const existingSecs = (pageIdx === currentPageIndex)
      ? [...sections]
      : (targetPage ? extractSectionsFromPage(targetPage) : []);

    const newSec = generateSectionForCategory(cat, products, categories, existingSecs.length);
    const updatedSecs = [...existingSecs, newSec];

    // Apply to page
    applyProductGridToPage(pageIdx, updatedSecs);

    if (pageIdx === currentPageIndex) {
      setSections(updatedSecs);
    }

    navigateToPage(pageIdx);
    setShowAddCategoryModal(false);
    setAddCategoryTargetPageIdx(null);
    setAddCategorySearch('');
  };

  // Re-sync local sections state whenever active page or products change
  useEffect(() => {
    const page = catalog?.pages?.[currentPageIndex];
    if (page) {
      if (page.type === 'cover' || page.type === 'index' || page.type === 'closing') {
        setSections([]);
        return;
      }
      const extracted = extractSectionsFromPage(page);
      if (extracted.length >= 1) {
        setSections(extracted);
      } else {
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

  // Single Items Placement State
  const [singleCategoryFilter, setSingleCategoryFilter] = useState<string>('all');
  const [singleSearch, setSingleSearch] = useState<string>('');
  const [singleItemFeedback, setSingleItemFeedback] = useState<string | null>(null);

  const showSingleFeedback = (msg: string) => {
    setSingleItemFeedback(msg);
    setTimeout(() => setSingleItemFeedback(null), 3000);
  };

  const calculateElementPlacement = (itemWidth: number, itemHeight: number) => {
    const currentPage = catalog?.pages?.[currentPageIndex];
    const elements = currentPage?.elements || [];
    const marginX = catalog?.marginLeft ? Math.round(catalog.marginLeft) : 45;
    const marginTop = catalog?.marginTop ? Math.round(catalog.marginTop) : 55;
    const marginBottom = catalog?.marginBottom ? Math.round(catalog.marginBottom) : 55;
    const marginRight = catalog?.marginRight ? Math.round(catalog.marginRight) : 45;
    const pageWidth = PAGE_WIDTH || 794;
    const pageHeight = PAGE_HEIGHT || 1123;

    // Check if there is an unoccupied slot
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

    // Stagger fallback based on elements count
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

  const handleAddSingleCard = (product: Product) => {
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
      productData: product,
      showPrice: true,
      showSku: true,
      showName: true,
      zIndex: 20
    });

    showSingleFeedback(`Card for "${product.name}" added to Page ${currentPageIndex + 1}!`);
  };

  const handleAddSingleImage = (product: Product) => {
    const timestamp = Date.now();
    const imgUrl = normalizeImageUrl(
      product.image ||
      (product.customFields && Object.values(product.customFields).find(v => typeof v === 'string' && (v.startsWith('/media') || v.startsWith('http')))) as string ||
      ''
    );

    if (!imgUrl) {
      alert("This product does not have an image attached.");
      return;
    }

    const placement = calculateElementPlacement(240, 200);

    addElement(currentPageIndex, {
      id: `product-img-${product.id}-${timestamp}`,
      type: 'image',
      x: placement.x,
      y: placement.y,
      width: 240,
      height: 200,
      rotation: 0,
      opacity: 1,
      src: imgUrl,
      productId: product.id,
      zIndex: 15
    });

    showSingleFeedback(`Image for "${product.name}" added to Page ${currentPageIndex + 1}!`);
  };

  const handleAddSingleTable = (product: Product) => {
    const timestamp = Date.now();
    const placement = calculateElementPlacement(480, 160);

    let headers: string[] = [];
    let rows: string[][] = [];

    if (product.variants && product.variants.length > 0) {
      headers = ['MODEL NO', 'PRODUCTS', 'CUT-OUT', 'COLOR', 'PRICE', 'PACKING'];
      rows = product.variants.map(v => [
        v.sku || product.sku || '',
        v.name || product.name || '',
        v.cutOut || '75MM',
        v.color || 'W, W.W, N.W',
        typeof v.price === 'number' ? `${product.currency || '$'}${v.price}` : (v.price || `${product.currency || '$'}${product.price}`),
        v.packing || '20 PCS'
      ]);
    } else {
      headers = ['MODEL / SKU', 'PRODUCT NAME', 'PRICE'];
      rows = [
        [product.sku || '-', product.name || '-', `${product.currency || '$'}${product.price || '-'}`]
      ];
      if (product.customFields) {
        Object.entries(product.customFields).forEach(([k, v]) => {
          if (v && typeof v !== 'object') {
            const label = resolveFieldLabel(k, categories, product) || k;
            rows.push([label.toUpperCase(), String(v), '-']);
          }
        });
      }
    }

    const calculatedHeight = Math.max(85, rows.length * 28 + 35);

    addElement(currentPageIndex, {
      id: `product-table-${product.id}-${timestamp}`,
      type: 'table',
      x: placement.x,
      y: placement.y,
      width: placement.width,
      height: calculatedHeight,
      rotation: 0,
      opacity: 1,
      productId: product.id,
      zIndex: 20,
      tableData: {
        headers,
        rows,
        headerBg: '#002b36',
        headerTextColor: '#ffffff',
        alternateRowBg: '#f8fafc',
        rowBg: '#ffffff',
        borderColor: '#002b36',
        fontSize: 8,
        headerFontSize: 8.5,
        cellPadding: 4
      }
    });

    showSingleFeedback(`Specification table for "${product.name}" added to Page ${currentPageIndex + 1}!`);
  };

  const handleAddSingleFullSection = (product: Product) => {
    const timestamp = Date.now();
    const imgUrl = normalizeImageUrl(
      product.image ||
      (product.customFields && Object.values(product.customFields).find(v => typeof v === 'string' && (v.startsWith('/media') || v.startsWith('http')))) as string ||
      ''
    );

    const placement = calculateElementPlacement(704, 180);
    const startY = placement.y;

    // Title
    addElement(currentPageIndex, {
      id: `sec-title-${product.id}-${timestamp}`,
      type: 'text',
      x: imgUrl ? 320 : 45,
      y: startY,
      width: imgUrl ? 429 : 704,
      height: 30,
      text: product.name.toUpperCase(),
      fontSize: 20,
      fontFamily: 'Montserrat',
      fontWeight: '900',
      fill: '#00a651',
      letterSpacing: 0.5,
      rotation: 0,
      opacity: 1,
      productId: product.id,
      zIndex: 10
    });

    // Hero Image (if available)
    if (imgUrl) {
      addElement(currentPageIndex, {
        id: `sec-img-${product.id}-${timestamp}`,
        type: 'image',
        x: 45,
        y: startY,
        width: 240,
        height: 160,
        src: imgUrl,
        rotation: 0,
        opacity: 1,
        productId: product.id,
        zIndex: 5
      });
    }

    // Spec / Variant Table
    let headers = ['MODEL NO', 'PRODUCTS', 'PRICE'];
    let rows: string[][] = [];
    if (product.variants && product.variants.length > 0) {
      headers = ['MODEL NO', 'PRODUCTS', 'CUT-OUT', 'COLOR', 'PRICE', 'PACKING'];
      rows = product.variants.map(v => [
        v.sku || product.sku || '',
        v.name || product.name || '',
        v.cutOut || '75MM',
        v.color || 'W, W.W, N.W',
        typeof v.price === 'number' ? `${product.currency || '$'}${v.price}` : (v.price || `${product.currency || '$'}${product.price}`),
        v.packing || '20 PCS'
      ]);
    } else {
      rows = [
        [product.sku || '-', product.name || '-', `${product.currency || '$'}${product.price || '-'}`]
      ];
    }

    addElement(currentPageIndex, {
      id: `sec-table-${product.id}-${timestamp}`,
      type: 'table',
      x: imgUrl ? 320 : 45,
      y: startY + 35,
      width: imgUrl ? 429 : 704,
      height: Math.max(80, rows.length * 26 + 32),
      rotation: 0,
      opacity: 1,
      productId: product.id,
      zIndex: 20,
      tableData: {
        headers,
        rows,
        headerBg: '#002b36',
        headerTextColor: '#ffffff',
        alternateRowBg: '#f8fafc',
        rowBg: '#ffffff',
        borderColor: '#002b36',
        fontSize: 8,
        headerFontSize: 8.5,
        cellPadding: 4
      }
    });

    showSingleFeedback(`Full showcase for "${product.name}" added to Page ${currentPageIndex + 1}!`);
  };

  const filteredSingleProducts = products.filter(p => {
    const matchesCat = singleCategoryFilter === 'all' || String(p.categoryId) === String(singleCategoryFilter);
    const q = singleSearch.trim().toLowerCase();
    const matchesSearch = !q || (
      p.name.toLowerCase().includes(q) ||
      (p.sku && p.sku.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q))
    );
    return matchesCat && matchesSearch;
  });

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

  // Auto-navigate to first interior/product grid page on mount if currently on cover
  useEffect(() => {
    const activeP = catalog?.pages?.[currentPageIndex];
    if (activeP?.type === 'cover' && catalog?.pages && catalog.pages.length > 1) {
      const firstProductPageIdx = catalog.pages.findIndex(
        p => p.type !== 'cover' && p.type !== 'index' && p.type !== 'closing'
      );
      if (firstProductPageIdx !== -1 && firstProductPageIdx !== currentPageIndex) {
        navigateToPage(firstProductPageIdx);
      }
    }
  }, []);

  // Helper to commit state updates and live-apply immediately to active catalog page
  const updateAndApplySections = (updater: (prev: ProductGridSection[]) => ProductGridSection[]) => {
    const next = updater(sectionsRef.current);
    sectionsRef.current = next;
    const activeP = catalog?.pages?.[currentPageIndex];
    if (activeP && activeP.type !== 'cover' && activeP.type !== 'index' && activeP.type !== 'closing') {
      applyProductGridToPage(currentPageIndex, next);
    }
    setSections(next);
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

    // 1. Gather all schema fields from categories
    categories.forEach((cat: any) => {
      if (cat.customSchema && Array.isArray(cat.customSchema)) {
        cat.customSchema.forEach((f: any) => {
          const lbl = (f.label || f.name || '').trim().toUpperCase();
          if (lbl) {
            fieldSet.add(lbl);
          }
        });
      }
    });

    // 2. Gather actual customFields & customAttributes present in products
    products.forEach(p => {
      if (p.customFields && typeof p.customFields === 'object') {
        Object.entries(p.customFields).forEach(([k, v]) => {
          if (k && k.trim() && v !== undefined && v !== null && String(v).trim() !== '' && String(v).trim() !== '-') {
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
          if (v.customAttributes && typeof v.customAttributes === 'object') {
            Object.entries(v.customAttributes).forEach(([k, val]) => {
              if (k && k.trim() && val !== undefined && val !== null && String(val).trim() !== '' && String(val).trim() !== '-') {
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

    const fields = Array.from(fieldSet);

    // Build clean list without duplicate fields
    const result: string[] = [];

    // 1. Model field (prefer user's exact schema name e.g. "MODEL NUMBER" or "MODEL NO")
    const modelMatch = fields.find(f => f === 'MODEL NUMBER' || f === 'MODEL NO' || f === 'MODEL' || f === 'ITEM NO');
    result.push(modelMatch || 'MODEL NO');

    // 2. Product Name / Description field
    const prodMatch = fields.find(f => f === 'PRODUCT NAME' || f === 'PRODUCTS' || f === 'PRODUCT' || f === 'DESCRIPTION');
    result.push(prodMatch || 'PRODUCTS');

    // 3. Price / MRP field (only one price field, prefer MRP if present, else PRICE)
    const hasMrp = fields.some(f => f === 'MRP' || f.includes('MRP'));
    if (hasMrp) {
      result.push('MRP');
    } else {
      result.push('PRICE');
    }

    // 4. Any other custom fields defined in schema or products without duplicating the above
    fields.forEach(f => {
      const norm = f.replace(/[^A-Z0-9]/g, '');
      const isModel = norm.includes('MODEL') || norm === 'SKU' || norm === 'ITEMNO';
      const isProd = norm.includes('PRODUCT') || norm === 'DESCRIPTION' || norm === 'NAME' || norm === 'ID';
      const isPrice = norm === 'PRICE' || norm === 'MRP' || norm === 'RATE' || norm === 'COST';

      if (!isModel && !isProd && !isPrice && !result.includes(f)) {
        result.push(f);
      }
    });

    return result;
  }, [products, categories]);

  // Helper to accurately match a table row to its product and variant using candidate scoring
  const matchProductAndVariantForRow = (
    row: string[],
    secContext?: ProductGridSection
  ): { matchedProd?: Product; matchedVar?: ProductVariant } => {
    const rowTokens = row
      .map(c => (c || '').trim().toLowerCase().replace(/^[₹$]/, ''))
      .filter(c => c && c !== '-');
    if (rowTokens.length === 0 || !products || products.length === 0) return {};

    const secTitleNorm = (secContext?.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    let bestScore = 0;
    let bestMatch: { matchedProd?: Product; matchedVar?: ProductVariant } = {};

    for (const p of products) {
      const pSku = (p.sku || '').trim().toLowerCase();
      const pName = (p.name || '').trim().toLowerCase();
      const pPrice = p.price !== undefined ? String(p.price).trim().toLowerCase() : '';

      const isSecCat = secTitleNorm && (
        (p.name || '').toLowerCase().replace(/[^a-z0-9]/g, '').includes(secTitleNorm) ||
        categories.some(cat => String(cat.id) === String(p.categoryId) && cat.name.toLowerCase().replace(/[^a-z0-9]/g, '').includes(secTitleNorm))
      );

      const checkCandidate = (variant?: ProductVariant) => {
        let score = 0;
        const vSku = (variant?.sku || '').trim().toLowerCase();
        const vName = (variant?.name || '').trim().toLowerCase();
        const vPrice = (variant?.price !== undefined && variant?.price !== null && String(variant.price).trim() !== '')
          ? String(variant.price).trim().toLowerCase()
          : pPrice;
        const vCutOut = (variant?.cutOut || '').trim().toLowerCase();

        // 1. Exact SKU / Model Number Match (Highest confidence)
        if (vSku && rowTokens.some(tok => tok === vSku)) score += 100;
        else if (pSku && rowTokens.some(tok => tok === pSku)) score += 80;

        // 2. Exact Name Match
        if (vName && rowTokens.some(tok => tok === vName)) score += 75;
        else if (pName && rowTokens.some(tok => tok === pName)) score += 65;

        // 3. Exact Price Match (Crucial when products share generic category names)
        if (vPrice && rowTokens.some(tok => tok === vPrice || tok === `₹${vPrice}` || tok === `$${vPrice}`)) score += 50;

        // 4. Exact Cut-Out / Dimensions Match
        if (vCutOut && rowTokens.some(tok => tok === vCutOut)) score += 40;

        // 5. Custom Attributes / Fields matching
        const customObj = { ...(p.customFields || {}), ...(variant?.customAttributes || {}) };
        for (const [k, val] of Object.entries(customObj)) {
          const valStr = String(val || '').trim().toLowerCase().replace(/^[₹$]/, '');
          if (!valStr || valStr === '-') continue;

          const isModelKey = /model|item|sku|code/i.test(k);
          const isPriceKey = /price|rate|mrp|cost|dlp/i.test(k);
          const isCutKey = /cut|size|dim/i.test(k);

          if (rowTokens.some(tok => tok === valStr)) {
            if (isModelKey) score += 90;
            else if (isPriceKey) score += 50;
            else if (isCutKey) score += 40;
            else score += 15;
          }
        }

        // 6. Distinct word matching (avoiding common short noise tokens)
        for (const tok of rowTokens) {
          if (tok.length >= 4 && !['downlight', 'series', 'light', 'white', 'black', 'warm'].includes(tok)) {
            if (pName.includes(tok)) score += 6;
            if (vName && vName.includes(tok)) score += 8;
          }
        }

        if (isSecCat) score += 10;

        if (score > bestScore) {
          bestScore = score;
          bestMatch = { matchedProd: p, matchedVar: variant || p.variants?.[0] };
        }
      };

      if (p.variants && p.variants.length > 0) {
        for (const v of p.variants) {
          checkCandidate(v);
        }
      } else {
        checkCandidate();
      }
    }

    return bestScore > 0 ? bestMatch : {};
  };

  const handleAddTableColumn = (secIdx: number, paramName: string = 'NEW PARAM') => {
    const cleanParam = paramName.trim().toUpperCase();
    updateAndApplySections(prev => prev.map((sec, i) => {
      if (i !== secIdx) return sec;
      const headers = [...sec.tableData.headers, cleanParam];
      const rows = sec.tableData.rows.map(row => {
        const { matchedProd, matchedVar } = matchProductAndVariantForRow(row, sec);
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
        const { matchedProd, matchedVar } = matchProductAndVariantForRow(row, sec);
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
  const firstProductPageIdx = catalog.pages.findIndex(p => p.type !== 'cover' && p.type !== 'index' && p.type !== 'closing');

  return (
    <div className={`flex flex-col h-full w-full font-sans overflow-hidden transition-colors ${
      isDark ? 'bg-[#141414] text-white border-r border-[#262626]' : 'bg-white text-slate-800 border-r border-slate-200'
    }`}>
      
      {/* ================= PANEL TOOLBAR ================= */}
      <div className={`px-2.5 py-1.5 border-b flex items-center justify-between gap-1.5 shrink-0 transition-colors ${
        isDark ? 'border-[#262626] bg-[#161616]' : 'border-slate-200 bg-white'
      }`}>
        {/* Quick Page Prev / Selector / Next */}
        <div className={`relative flex items-center gap-0.5 rounded-[4px] p-0.5 border transition-colors ${
          isDark ? 'bg-[#1e1e1e] border-[#333]' : 'bg-slate-100 border-slate-200'
        }`} ref={pageSelectorRef}>
          <button
            type="button"
            disabled={currentPageIndex <= 0}
            onClick={() => navigateToPage(currentPageIndex - 1)}
            className={`p-1 rounded transition-all disabled:opacity-25 ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-900 hover:bg-white'
            }`}
            title="Previous Page"
          >
            <ChevronLeft size={13} />
          </button>

          <button
            type="button"
            onClick={() => setShowPageSelector(!showPageSelector)}
            className={`flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold rounded transition-all ${
              isDark ? 'text-[#E2DCC8] hover:bg-white/5' : 'text-slate-800 hover:bg-white shadow-xs'
            }`}
            title="Switch Page"
          >
            <span>Page {currentPageIndex + 1} / {catalog.pages.length}</span>
            <ChevronDown size={11} className={isDark ? "text-slate-400" : "text-slate-500"} />
          </button>

          <button
            type="button"
            disabled={currentPageIndex >= catalog.pages.length - 1}
            onClick={() => navigateToPage(currentPageIndex + 1)}
            className={`p-1 rounded transition-all disabled:opacity-25 ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-900 hover:bg-white'
            }`}
            title="Next Page"
          >
            <ChevronRight size={13} />
          </button>

          {/* Page Selector Dropdown */}
          {showPageSelector && (
            <div className={`absolute top-full left-0 mt-1 w-56 border rounded-[6px] shadow-2xl z-[100] max-h-64 overflow-y-auto p-1 space-y-0.5 custom-scrollbar ${
              isDark ? 'bg-[#181818] border-[#333]' : 'bg-white border-slate-200 shadow-xl'
            }`}>
              <div className={`px-2 py-1 text-[8px] font-black uppercase tracking-wider border-b ${
                isDark ? 'text-slate-500 border-[#262626]' : 'text-slate-400 border-slate-100'
              }`}>
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
                        : (isDark ? 'text-slate-300 hover:bg-[#242424]' : 'text-slate-700 hover:bg-slate-100')
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={`font-mono text-[9px] shrink-0 ${isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E] font-bold'}`}>P{idx + 1}</span>
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

        {/* Mode Tabs: [ ✏️ 3-Grid Editor ] | [ 📦 Single Items ] | [ 🗂️ Grid Map ] */}
        <div className={`flex items-center border rounded-[4px] p-0.5 gap-0.5 ${
          isDark ? 'bg-[#1e1e1e] border-[#333]' : 'bg-slate-100 border-slate-200'
        }`}>
          <button
            type="button"
            onClick={() => setViewMode('editor')}
            className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 ${
              viewMode === 'editor'
                ? 'bg-[#0F3D3E] text-white shadow-sm'
                : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
            }`}
            title="3-Product Section Grid Editor"
          >
            <Grid size={10} /> 3-Grid Editor
          </button>
          <button
            type="button"
            onClick={() => setViewMode('single-items')}
            className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 ${
              viewMode === 'single-items'
                ? 'bg-[#0F3D3E] text-[#E2DCC8] shadow-sm border border-[#E2DCC8]/30'
                : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
            }`}
            title="Browse and place individual product cards, photos, or spec tables"
          >
            <Package size={10} /> Single Items
          </button>
          <button
            type="button"
            onClick={() => setViewMode('overview')}
            className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 ${
              viewMode === 'overview'
                ? 'bg-[#0F3D3E] text-white shadow-sm'
                : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
            }`}
            title="Multi-page Grid Organizer"
          >
            <Layers size={10} /> Grid Map
          </button>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={() => setEditorTab(null)}
          className={`p-1 rounded transition-colors shrink-0 ${
            isDark ? 'text-[#888] hover:text-white hover:bg-[#222]' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
          }`}
          title="Close Grid Studio"
        >
          <X size={14} />
        </button>
      </div>

      {/* ================= MODE 1: ALL PAGES GRID MAP (BIRDS-EYE ORGANIZER) ================= */}
      {viewMode === 'overview' ? (
        <div className={`flex-1 overflow-y-auto p-3 space-y-3.5 custom-scrollbar transition-colors ${
          isDark ? 'bg-[#121212]' : 'bg-slate-50'
        }`}>
          <div className={`flex items-center justify-between pb-1 border-b ${
            isDark ? 'border-[#222]' : 'border-slate-200'
          }`}>
            <div>
              <h3 className={`text-[11px] font-black uppercase tracking-wider ${
                isDark ? 'text-[#E2DCC8]' : 'text-slate-900'
              }`}>
                Multi-Page Grid Organizer
              </h3>
              <p className={`text-[8px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                View & arrange grid sections across all catalog pages
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setAddCategoryTargetPageIdx(null);
                  setShowAddCategoryModal(true);
                }}
                className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase flex items-center gap-1.5 transition-all shadow-sm ${
                  unincludedCategories.length > 0
                    ? 'bg-[#00a651] hover:bg-[#009247] text-white shadow-[#00a651]/20'
                    : (isDark ? 'bg-[#202020] text-slate-400 border border-[#333]' : 'bg-slate-100 text-slate-500 border border-slate-200')
                }`}
                title="Add a category not already included in this catalog"
              >
                <Plus size={11} /> Add Category
                {unincludedCategories.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-black/25 text-[8px] font-mono font-bold">
                    {unincludedCategories.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  addInteriorPageWithInheritedLayout();
                  navigateToPage(catalog.pages.length);
                }}
                className={`px-2 py-1 border rounded text-[9px] font-bold uppercase flex items-center gap-1 transition-all ${
                  isDark ? 'bg-[#202020] hover:bg-[#282828] border-[#333] text-[#E2DCC8]' : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 shadow-sm'
                }`}
              >
                <Plus size={11} /> New Page
              </button>
            </div>
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
                    ? (isDark ? 'border-[#0F3D3E] bg-[#161c1d] shadow-lg shadow-[#0F3D3E]/10' : 'border-[#0F3D3E] bg-teal-50/50 shadow-md ring-1 ring-[#0F3D3E]')
                    : (isDark ? 'border-[#262626] bg-[#161616] hover:border-[#333]' : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm')
                }`}
              >
                {/* Page Card Header */}
                <div className={`px-3 py-2 border-b flex items-center justify-between ${
                  isDark ? 'border-[#222] bg-[#141414]' : 'border-slate-100 bg-slate-50'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-[3px] flex items-center justify-center text-[9px] font-black ${
                      isCurrent 
                        ? (isDark ? 'bg-[#0F3D3E] text-[#E2DCC8]' : 'bg-[#0F3D3E] text-white') 
                        : (isDark ? 'bg-[#252525] text-slate-300' : 'bg-slate-200 text-slate-700')
                    }`}>
                      #{pIdx + 1}
                    </span>
                    <div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider block leading-tight ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}>
                        {isCover ? `${p.type.toUpperCase()} PAGE` : `Page ${pIdx + 1}`}
                      </span>
                      <span className={`text-[8px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
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
                      className={`px-2 py-0.5 border rounded text-[8px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all ${
                        isDark ? 'bg-[#0F3D3E]/40 hover:bg-[#0F3D3E] border-[#0F3D3E] text-[#E2DCC8]' : 'bg-teal-50 hover:bg-[#0F3D3E] border-teal-200 text-[#0F3D3E] hover:text-white shadow-xs'
                      }`}
                      title="Edit this page in Grid Studio"
                    >
                      <SlidersHorizontal size={9} /> Edit Page
                    </button>
                  </div>
                </div>

                {/* Page Card Body: Sections List */}
                <div className="p-2.5 space-y-1.5">
                  {isCover ? (
                    <div className={`py-3 px-2 text-center text-[9px] rounded border ${
                      isDark ? 'text-slate-500 bg-[#111] border-[#222]' : 'text-slate-500 bg-slate-100/50 border-slate-200'
                    }`}>
                      Cover & closing pages do not contain standard product grids.
                    </div>
                  ) : pSections.length === 0 ? (
                    <div className={`py-4 px-2 text-center text-[9px] rounded border space-y-1 ${
                      isDark ? 'text-slate-500 bg-[#111] border-[#222]' : 'text-slate-500 bg-slate-100/50 border-slate-200'
                    }`}>
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
                    <>
                      {pSections.map((sec, secIdx) => {
                        return (
                          <div
                            key={sec.id || secIdx}
                            className={`px-2.5 py-1.5 rounded flex items-center justify-between gap-2 border transition-all ${
                              isDark ? 'bg-[#1a1a1a] border-[#2a2a2a] hover:border-[#3a3a3a]' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className={`w-4 h-4 rounded-[2px] border flex items-center justify-center text-[8px] font-bold shrink-0 ${
                                isDark ? 'bg-[#222] border-[#333] text-[#E2DCC8]' : 'bg-white border-slate-300 text-slate-700 shadow-xs'
                              }`}>
                                {secIdx + 1}
                              </span>
                              {sec.imageSrc ? (
                                <img src={sec.imageSrc} alt="" className={`w-6 h-6 rounded object-contain border p-0.5 shrink-0 ${
                                  isDark ? 'bg-[#111] border-[#333]' : 'bg-white border-slate-200'
                                }`} />
                              ) : (
                                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: sec.titleColor || '#00a651' }} />
                              )}
                              <div className="min-w-0">
                                <p className={`text-[9px] font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`} style={{ color: sec.titleColor || '#00a651' }}>
                                  {sec.title || `Section #${secIdx + 1}`}
                                </p>
                                <p className={`text-[7.5px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
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
                                  className={`px-1.5 py-0.5 border text-[8px] font-bold rounded outline-none cursor-pointer ${
                                    isDark ? 'bg-[#242424] border-[#383838] text-[#E2DCC8] hover:border-[#0F3D3E]' : 'bg-white border-slate-200 text-slate-700 hover:border-[#0F3D3E]'
                                  }`}
                                  title="Move this section to another page"
                                >
                                  <option value="" disabled>➔ Move to...</option>
                                  {catalog.pages.map((_, optIdx) => {
                                    if (optIdx === 0 || optIdx === pIdx) return null; // Skip cover page & current page
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
                                className={`p-1 disabled:opacity-20 transition-colors ${
                                  isDark ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-800'
                                }`}
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
                                className={`p-1 disabled:opacity-20 transition-colors ${
                                  isDark ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-800'
                                }`}
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
                                  className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                                  title="Delete Section"
                                >
                                  <Trash2 size={11} />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {/* Inline Add Category Section button if page has slots free */}
                      {pSections.length < 3 && (
                        <button
                          type="button"
                          onClick={() => {
                            setAddCategoryTargetPageIdx(pIdx);
                            setShowAddCategoryModal(true);
                          }}
                          className={`w-full py-1.5 px-2 rounded border border-dashed text-[8.5px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                            isDark
                              ? 'border-[#2d2d2d] hover:border-[#00a651] bg-[#141414] hover:bg-[#00a651]/10 text-slate-400 hover:text-[#00a651]'
                              : 'border-slate-300 hover:border-[#00a651] bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-[#00a651]'
                          }`}
                        >
                          <Plus size={11} className="text-[#00a651]" /> Add Category to Page {pIdx + 1} ({3 - pSections.length} slots free)
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : viewMode === 'single-items' ? (
        /* ================= MODE 3: SINGLE PRODUCT & ITEM INSERTER ================= */
        <div className={`flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar transition-colors ${
          isDark ? 'bg-[#121212]' : 'bg-slate-50'
        }`}>
          {/* Header banner */}
          <div className={`flex items-center justify-between pb-3 border-b ${
            isDark ? 'border-[#222]' : 'border-slate-200'
          }`}>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-[12px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
                  isDark ? 'text-[#E2DCC8]' : 'text-slate-900'
                }`}>
                  <Package size={14} className="text-[#00a651]" /> Single Product Placement
                </h3>
                <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border ${
                  isDark ? 'bg-[#0F3D3E] text-[#E2DCC8] border-[#E2DCC8]/20' : 'bg-teal-50 text-[#0F3D3E] border-teal-200'
                }`}>
                  Target: Page {currentPageIndex + 1}
                </span>
              </div>
              <p className={`text-[9px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Drop individual cards, images, or spec tables onto Page {currentPageIndex + 1} without altering existing page layout.
              </p>
            </div>

            {/* Quick count badge */}
            <div className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded border ${
              isDark ? 'text-[#E2DCC8]/80 bg-[#181818] border-[#2a2a2a]' : 'text-slate-700 bg-white border-slate-200 shadow-xs'
            }`}>
              {filteredSingleProducts.length} items
            </div>
          </div>

          {/* Feedback Toast */}
          {singleItemFeedback && (
            <div className="p-2.5 rounded bg-[#0F3D3E] border border-[#00a651]/50 text-[#F1F1F1] text-xs font-semibold flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#00a651] shrink-0" />
                <span>{singleItemFeedback}</span>
              </div>
              <span className="text-[9px] text-[#E2DCC8] uppercase tracking-wider font-mono bg-black/30 px-2 py-0.5 rounded">Added</span>
            </div>
          )}

          {/* Search Bar & Category Chips */}
          <div className="space-y-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={singleSearch}
                onChange={(e) => setSingleSearch(e.target.value)}
                placeholder="Search products by title, SKU, description..."
                className={`w-full border rounded-[4px] pl-9 pr-8 py-2 text-xs outline-none transition-colors ${
                  isDark 
                    ? 'bg-[#181818] border-[#333] focus:border-[#0F3D3E] text-[#F1F1F1] placeholder:text-slate-500' 
                    : 'bg-white border-slate-200 focus:border-[#0F3D3E] text-slate-900 placeholder:text-slate-400 shadow-xs'
                }`}
              />
              {singleSearch && (
                <button
                  type="button"
                  onClick={() => setSingleSearch('')}
                  className={`absolute right-2.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-700'}`}
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
              <button
                type="button"
                onClick={() => setSingleCategoryFilter('all')}
                className={`px-2.5 py-1 rounded-[3px] text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                  singleCategoryFilter === 'all'
                    ? 'bg-[#0F3D3E] text-[#E2DCC8] border border-[#E2DCC8]/40 shadow-sm'
                    : (isDark ? 'bg-[#181818] text-slate-400 border border-[#2a2a2a] hover:text-white hover:bg-[#202020]' : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900 hover:bg-slate-100 shadow-xs')
                }`}
              >
                All Categories ({products.length})
              </button>

              {categories.map((cat) => {
                const catCount = products.filter(p => String(p.categoryId) === String(cat.id)).length;
                const isSelected = singleCategoryFilter === String(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSingleCategoryFilter(String(cat.id))}
                    className={`px-2.5 py-1 rounded-[3px] text-[10px] font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#0F3D3E] text-[#E2DCC8] border border-[#E2DCC8]/40 shadow-sm'
                        : (isDark ? 'bg-[#181818] text-slate-400 border border-[#2a2a2a] hover:text-white hover:bg-[#202020]' : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900 hover:bg-slate-100 shadow-xs')
                    }`}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color || '#00a651' }}
                    />
                    <span>{cat.name}</span>
                    <span className="text-[9px] opacity-60 font-mono">({catCount})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Product Grid of Single Items */}
          {filteredSingleProducts.length === 0 ? (
            <div className={`py-12 text-center border border-dashed rounded-[6px] ${
              isDark ? 'border-[#262626] bg-[#161616]/40' : 'border-slate-200 bg-white/60'
            }`}>
              <Package size={28} className={`mx-auto mb-2 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
              <p className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>No products match your search</p>
              <p className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Try searching with a different keyword or selecting 'All Categories'.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredSingleProducts.map((product) => {
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
                    className={`group relative rounded-[4px] p-3 transition-all flex flex-col justify-between cursor-grab active:cursor-grabbing border ${
                      isDark 
                        ? 'bg-[#181818] hover:bg-[#1c1c1c] border-[#282828] hover:border-[#0F3D3E] hover:shadow-lg' 
                        : 'bg-white hover:bg-slate-50/80 border-slate-200 hover:border-[#0F3D3E] shadow-sm hover:shadow-md'
                    }`}
                  >
                    <div>
                      {/* Card Header: Category & Price */}
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span className={`text-[9px] font-bold truncate px-1.5 py-0.5 rounded border ${
                          isDark ? 'text-[#E2DCC8]/80 bg-[#222] border-[#333]' : 'text-slate-600 bg-slate-100 border-slate-200'
                        }`}>
                          {cat?.name || 'General'}
                        </span>
                        <span className="text-[10px] font-bold text-[#00a651] font-mono shrink-0">
                          {product.currency || '$'}{product.price}
                        </span>
                      </div>

                      {/* Product Thumbnail Preview */}
                      <div className={`w-full h-28 rounded-[3px] border mb-2.5 overflow-hidden flex items-center justify-center relative ${
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
                            <Package size={24} />
                            <span className="text-[8px] uppercase tracking-wider">No Image</span>
                          </div>
                        )}
                        {hasVariants && (
                          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-[#0F3D3E]/90 border border-[#E2DCC8]/30 text-[#E2DCC8] text-[8px] font-mono font-bold shadow">
                            {product.variants!.length} Variants
                          </span>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="space-y-0.5 mb-3">
                        <h4 className={`text-xs font-bold line-clamp-2 leading-snug transition-colors ${
                          isDark ? 'text-[#F1F1F1] group-hover:text-[#E2DCC8]' : 'text-slate-900 group-hover:text-[#0F3D3E]'
                        }`} title={product.name}>
                          {product.name}
                        </h4>
                        {product.sku && (
                          <p className={`text-[9px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            SKU: <span className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{product.sku}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className={`space-y-1.5 pt-2 border-t ${isDark ? 'border-[#252525]' : 'border-slate-100'}`}>
                      {/* Primary: Add Card Block */}
                      <button
                        type="button"
                        onClick={() => handleAddSingleCard(product)}
                        className="w-full py-1.5 px-2 bg-[#0F3D3E] hover:bg-[#155455] text-white rounded-[3px] text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm border border-[#E2DCC8]/25"
                        title={`Add full product card to Page ${currentPageIndex + 1}`}
                      >
                        <Package size={11} /> + Add Card Block
                      </button>

                      {/* Secondary Actions Grid */}
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleAddSingleImage(product)}
                          disabled={!imgUrl}
                          className={`py-1 px-1.5 disabled:opacity-30 rounded-[3px] text-[9px] font-medium flex items-center justify-center gap-1 border transition-all ${
                            isDark 
                              ? 'bg-[#202020] hover:bg-[#282828] text-[#E2DCC8] border-[#333]' 
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                          title="Drop high-res photo only"
                        >
                          <ImageIcon size={10} /> + Photo
                        </button>

                        <button
                          type="button"
                          onClick={() => handleAddSingleTable(product)}
                          className={`py-1 px-1.5 rounded-[3px] text-[9px] font-medium flex items-center justify-center gap-1 border transition-all ${
                            isDark 
                              ? 'bg-[#202020] hover:bg-[#282828] text-[#E2DCC8] border-[#333]' 
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                          title="Drop specification / variant table"
                        >
                          <Table size={10} /> + Specs
                        </button>
                      </div>

                      {/* Full Section Row */}
                      <button
                        type="button"
                        onClick={() => handleAddSingleFullSection(product)}
                        className={`w-full py-1 px-2 rounded-[3px] text-[8.5px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 border transition-all ${
                          isDark 
                            ? 'bg-[#1c1c1c] hover:bg-[#242424] text-slate-300 hover:text-white border-[#2e2e2e]' 
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-200'
                        }`}
                        title="Add complete row with Photo + Title + Specs Table"
                      >
                        <Sparkles size={9} className="text-[#00a651]" /> Full Line Showcase
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* ================= MODE 2: SINGLE PAGE DETAILED EDITOR ================= */
        <div className={`flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar transition-colors ${
          isDark ? 'bg-[#121212]' : 'bg-slate-50'
        }`}>
          {isSpecialPage ? (
            <div className={`py-12 px-6 text-center border rounded-[8px] space-y-4 ${
              isDark ? 'border-[#2a2a2a] bg-[#161616]' : 'border-slate-200 bg-white shadow-sm'
            }`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${
                isDark ? 'bg-[#0F3D3E]/40 border border-[#E2DCC8]/20 text-[#E2DCC8]' : 'bg-teal-50 border border-teal-200 text-[#0F3D3E]'
              }`}>
                <FileText size={22} />
              </div>
              <div className="space-y-1">
                <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-[#F1F1F1]' : 'text-slate-900'}`}>
                  Page {currentPageIndex + 1} is a {activePage?.type === 'cover' ? 'Cover' : activePage?.type} Page
                </h3>
                <p className={`text-xs max-w-md mx-auto leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Cover pages are reserved for branding, hero imagery, and titles. 3-Product Grids are designed for interior product catalog pages.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                {firstProductPageIdx !== -1 && (
                  <button
                    type="button"
                    onClick={() => navigateToPage(firstProductPageIdx)}
                    className="w-full sm:w-auto px-4 py-2 bg-[#0F3D3E] hover:bg-[#155455] text-white rounded-[4px] text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow border border-[#E2DCC8]/30"
                  >
                    <span>👉 Jump to Product Grid (Page {firstProductPageIdx + 1})</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setViewMode('single-items')}
                  className={`w-full sm:w-auto px-4 py-2 rounded-[4px] text-xs font-bold flex items-center justify-center gap-1.5 transition-all border ${
                    isDark ? 'bg-[#202020] hover:bg-[#282828] text-[#E2DCC8] border-[#333]' : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-sm'
                  }`}
                >
                  <Package size={13} />
                  <span>Insert Single Item Instead</span>
                </button>
              </div>

              <div className={`pt-4 border-t ${isDark ? 'border-[#222]' : 'border-slate-100'}`}>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Transform this cover page into a 3-product grid page? This will replace the current page layout with product series.")) {
                      const newSecs = generateSectionsFromRealProducts(activePage, currentPageIndex, products, categories);
                      applyProductGridToPage(currentPageIndex, newSecs);
                      setSections(newSecs);
                    }
                  }}
                  className={`text-[10px] underline transition-colors ${isDark ? 'text-slate-500 hover:text-amber-400' : 'text-slate-400 hover:text-amber-600'}`}
                >
                  Convert this page into a 3-Product Grid anyway
                </button>
              </div>
            </div>
          ) : (
            sections.map((sec, secIdx) => {
            const sectionNumber = secIdx + 1;
            const posLabel = secIdx === 0 ? 'Top' : (secIdx === sections.length - 1 ? 'Bottom' : 'Middle');
            const isHighlighted = highlightedSecIdx === secIdx;

            return (
              <div
                id={`grid-sec-card-${secIdx}`}
                key={sec.id || secIdx}
                className={`rounded-xl border transition-all shadow-md overflow-hidden ${
                  isHighlighted
                    ? isDark ? 'border-emerald-400 ring-2 ring-emerald-400/50 bg-[#162728]' : 'border-emerald-500 ring-2 ring-emerald-400/40 bg-emerald-50/50'
                    : sec.hasBackground
                    ? isDark ? 'border-[#0F3D3E]/70 bg-[#151b1c]' : 'border-teal-300/80 bg-teal-50/30'
                    : isDark ? 'border-[#262626] bg-[#161616] hover:border-[#383838]' : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'
                }`}
              >
                {/* Section Header Bar */}
                <div className={`px-3.5 py-2.5 border-b flex items-center justify-between transition-colors ${
                  isDark ? 'border-[#242424] bg-[#191919]' : 'border-slate-200 bg-slate-50'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-[#0F3D3E] text-[#E2DCC8] flex items-center justify-center text-[10px] font-black shadow-sm shadow-[#0F3D3E]/40">
                      {sectionNumber}
                    </span>
                    <span className={`text-[11px] font-black uppercase tracking-wider ${isDark ? 'text-[#E2DCC8]' : 'text-slate-800'}`}>
                      Section #{sectionNumber} <span className={`${isDark ? 'text-slate-400' : 'text-slate-500'} font-medium text-[9.5px]`}>({posLabel})</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Fill from Product */}
                    <button
                      type="button"
                      onClick={() => setProductPickerSectionIdx(secIdx)}
                      className={`px-2.5 py-1 border rounded-md text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm active:scale-95 ${
                        isDark
                          ? 'bg-[#0F3D3E]/40 hover:bg-[#0F3D3E] border-[#0F3D3E] text-[#E2DCC8]'
                          : 'bg-[#0F3D3E] hover:bg-[#155455] border-[#0F3D3E] text-white'
                      }`}
                      title="Autofill from catalog product"
                    >
                      <Package size={11} className={isDark ? "text-[#E2DCC8]" : "text-white"} />
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
                        className={`px-2 py-1 border text-[8.5px] font-bold rounded-md outline-none cursor-pointer transition-colors ${
                          isDark ? 'bg-[#1f1f1f] hover:bg-[#262626] border-[#333] text-[#E2DCC8]' : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700'
                        }`}
                        title="Move this section to another page"
                      >
                        <option value="" disabled>➔ Page...</option>
                        {catalog.pages.map((_, optIdx) => {
                          if (optIdx === 0 || optIdx === currentPageIndex) return null; // Skip cover page & current page
                          return (
                            <option key={optIdx} value={optIdx}>
                              To P{optIdx + 1}
                            </option>
                          );
                        })}
                      </select>
                    )}

                    <div className={`flex items-center border rounded-md p-0.5 ${
                      isDark ? 'bg-[#1f1f1f] border-[#2a2a2a]' : 'bg-slate-100 border-slate-200'
                    }`}>
                      <button
                        type="button"
                        disabled={secIdx === 0}
                        onClick={() => handleMoveSection(secIdx, 'up')}
                        className={`p-1 rounded disabled:opacity-20 transition-all ${
                          isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                        }`}
                        title="Move Section Up"
                      >
                        <ArrowUp size={11} />
                      </button>

                      <button
                        type="button"
                        disabled={secIdx === sections.length - 1}
                        onClick={() => handleMoveSection(secIdx, 'down')}
                        className={`p-1 rounded disabled:opacity-20 transition-all ${
                          isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                        }`}
                        title="Move Section Down"
                      >
                        <ArrowDown size={11} />
                      </button>
                    </div>

                    {sections.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteSection(secIdx)}
                        className={`p-1.5 rounded-md border border-transparent transition-all ${
                          isDark ? 'text-slate-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20' : 'text-slate-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200'
                        }`}
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
                        <label className={`text-[9px] font-black uppercase tracking-wider flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          <ImageIcon size={11} className="text-[#0F3D3E]" /> Image
                        </label>
                        <button
                          type="button"
                          onClick={() => setImageGalleryPickerSectionIdx(secIdx)}
                          className={`text-[8.5px] font-bold px-2 py-0.5 rounded-full transition-colors shadow-sm ${
                            isDark ? 'text-[#E2DCC8] hover:text-white bg-[#0F3D3E] hover:bg-[#155355]' : 'text-white bg-[#0F3D3E] hover:bg-[#155355]'
                          }`}
                          title="Pick from Category Images & Photos"
                        >
                          Gallery
                        </button>
                      </div>

                      <div className={`relative w-28 h-28 border rounded-lg overflow-hidden flex items-center justify-center group shadow-inner ${
                        isDark ? 'bg-[#0c0c0c] border-[#2d2d2d]' : 'bg-slate-50 border-slate-200'
                      }`}>
                        {sec.imageSrc ? (
                          <img
                            src={normalizeImageUrl(sec.imageSrc)}
                            alt={sec.title}
                            className="w-full h-full object-contain p-1.5 transition-transform group-hover:scale-105"
                          />
                        ) : (
                          <div className="text-center p-1 text-[#666]">
                            <Upload size={16} className={`mx-auto mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                            <span className={`text-[9px] block leading-none font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>No Image</span>
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
                        <label className={`text-[9px] font-black uppercase tracking-wider block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          Series / Section Title
                        </label>
                        <input
                          type="text"
                          value={sec.title}
                          onChange={(e) => handleUpdateSection(secIdx, { title: e.target.value })}
                          placeholder="SERIES TITLE..."
                          className={`w-full px-3 py-1.5 border rounded-lg text-xs font-black outline-none focus:border-[#0F3D3E] focus:ring-1 focus:ring-[#0F3D3E] shadow-inner transition-all ${
                            isDark ? 'bg-[#0f0f0f] border-[#2d2d2d]' : 'bg-white border-slate-300'
                          }`}
                          style={{ color: sec.titleColor || '#00a651' }}
                        />
                      </div>

                      <div className="flex items-center justify-between gap-2 flex-wrap pt-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[8.5px] font-bold uppercase ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Color:</span>
                          <div className="flex items-center gap-1">
                            {PRESET_TITLE_COLORS.map(c => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => handleUpdateSection(secIdx, { titleColor: c })}
                                className={`w-4 h-4 rounded-full border transition-transform ${
                                  sec.titleColor === c ? 'scale-125 ring-2 ring-[#00a651] border-white' : isDark ? 'border-[#333] hover:scale-110' : 'border-slate-300 hover:scale-110'
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
                            ? isDark ? 'bg-[#0F3D3E]/30 text-[#E2DCC8] border-[#0F3D3E]' : 'bg-teal-50 text-teal-800 border-teal-300'
                            : isDark ? 'bg-[#141414] text-slate-400 border-[#262626] hover:text-white' : 'bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-900'
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
                  <div className={`space-y-2 pt-2.5 border-t ${isDark ? 'border-[#242424]' : 'border-slate-200'}`}>
                    <div className="flex items-center justify-between flex-wrap gap-1.5">
                      <span className={`text-[9.5px] font-black uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-[#E2DCC8]' : 'text-slate-800'}`}>
                        <Palette size={12} className="text-[#00a651]" />
                        Specs Table <span className={`${isDark ? 'text-slate-400' : 'text-slate-500'} font-normal font-mono text-[8.5px]`}>({sec.tableData.rows.length} rows)</span>
                      </span>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Style Drawer Toggle */}
                        <button
                          type="button"
                          onClick={() => setOpenStyleSecIdx(openStyleSecIdx === secIdx ? null : secIdx)}
                          className={`px-2 py-1 rounded-md text-[9px] font-bold flex items-center gap-1 transition-all border ${
                            openStyleSecIdx === secIdx
                              ? isDark ? 'bg-[#0F3D3E] text-[#E2DCC8] border-[#0F3D3E] shadow-sm' : 'bg-[#0F3D3E] text-white border-[#0F3D3E] shadow-sm'
                              : isDark ? 'bg-[#181818] hover:bg-[#222] border-[#333] text-slate-300 hover:text-white' : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700 shadow-sm'
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
                          className={`px-2.5 py-1 border rounded-md text-[9px] font-bold outline-none cursor-pointer transition-colors shadow-sm ${
                            isDark ? 'bg-[#102728] hover:bg-[#153436] border-[#0F3D3E] text-[#E2DCC8]' : 'bg-teal-50 hover:bg-teal-100 border-teal-300 text-teal-900'
                          }`}
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
                          className={`px-2 py-1 border rounded-md text-[9px] font-bold outline-none cursor-pointer transition-colors shadow-sm ${
                            isDark ? 'bg-[#122827] hover:bg-[#183433] border-[#0F3D3E] text-[#E2DCC8]' : 'bg-teal-50 hover:bg-teal-100 border-teal-300 text-teal-900'
                          }`}
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
                          className={`px-2 py-1 border rounded-md text-[9px] font-bold flex items-center gap-1 transition-all shadow-sm ${
                            isDark ? 'bg-[#1c1c1c] hover:bg-[#252525] border-[#333] text-[#E2DCC8] hover:text-white' : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700'
                          }`}
                          title="Add Blank Row"
                        >
                          <Plus size={11} className={isDark ? "text-[#E2DCC8]" : "text-slate-700"} />
                          <span>Row</span>
                        </button>
                      </div>
                    </div>

                    {/* Table Style Customization Drawer */}
                    {openStyleSecIdx === secIdx && (
                      <div className={`p-2.5 border rounded-lg mb-2 space-y-2 text-[9px] animate-in fade-in duration-150 ${
                        isDark ? 'bg-[#101010] border-[#2a2a2a]' : 'bg-slate-50 border-slate-200 shadow-sm'
                      }`}>
                        <div className={`flex items-center justify-between pb-1 border-b ${isDark ? 'border-[#222]' : 'border-slate-200'}`}>
                          <span className={`font-bold uppercase tracking-wider flex items-center gap-1 ${isDark ? 'text-[#E2DCC8]' : 'text-slate-800'}`}>
                            <Palette size={10} className="text-emerald-500" /> Table Styles & Dimensions
                          </span>
                          <button
                            type="button"
                            onClick={() => setOpenStyleSecIdx(null)}
                            className={`transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}
                          >
                            <X size={11} />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-0.5">
                          {/* Header BG */}
                          <div>
                            <label className={`block text-[8px] font-bold uppercase mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Header Background</label>
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
                            <label className={`block text-[8px] font-bold uppercase mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Header Text</label>
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
                            <label className={`block text-[8px] font-bold uppercase mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Font Size</label>
                            <div className="flex items-center gap-1">
                              {[7, 8, 9, 10].map(sz => (
                                <button
                                  key={sz}
                                  type="button"
                                  onClick={() => handleUpdateTableStyle(secIdx, { fontSize: sz, headerFontSize: sz + 0.5 })}
                                  className={`px-1.5 py-0.5 rounded font-bold transition-all ${
                                    Math.round(sec.tableData.fontSize || 8) === sz
                                      ? 'bg-[#0F3D3E] text-white ring-1 ring-emerald-400'
                                      : isDark ? 'bg-[#1f1f1f] text-slate-400 hover:text-white' : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                                  }`}
                                >
                                  {sz}px
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Cell Padding */}
                          <div>
                            <label className={`block text-[8px] font-bold uppercase mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Cell Padding</label>
                            <div className="flex items-center gap-1">
                              {[3, 4, 6, 8].map(pad => (
                                <button
                                  key={pad}
                                  type="button"
                                  onClick={() => handleUpdateTableStyle(secIdx, { cellPadding: pad })}
                                  className={`px-1.5 py-0.5 rounded font-bold transition-all ${
                                    (sec.tableData.cellPadding || 4) === pad
                                      ? 'bg-[#0F3D3E] text-white ring-1 ring-emerald-400'
                                      : isDark ? 'bg-[#1f1f1f] text-slate-400 hover:text-white' : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
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
                    <div className={`overflow-x-auto border rounded-lg custom-scrollbar shadow-inner ${
                      isDark ? 'border-[#2d2d2d] bg-[#0e0e0e]' : 'border-slate-200 bg-white'
                    }`}>
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
                                            className={`absolute left-0 top-full mt-1.5 w-48 rounded-md shadow-2xl border z-50 p-1.5 space-y-0.5 animate-in fade-in duration-100 ${
                                              isDark ? 'bg-[#161616] border-[#2e2e2e] text-white' : 'bg-white border-slate-200 text-slate-800 shadow-xl'
                                            }`}
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            <div className={`px-1.5 py-1 text-[8.5px] font-bold uppercase tracking-wider border-b flex justify-between items-center ${
                                              isDark ? 'text-[#888] border-[#262626]' : 'text-slate-500 border-slate-200'
                                            }`}>
                                              <span>Auto-fill &quot;{hdr}&quot;</span>
                                              <button
                                                onClick={() => setActiveFillMenu(null)}
                                                className={isDark ? 'text-[#888] hover:text-white' : 'text-slate-400 hover:text-slate-800'}
                                              >
                                                <X size={10} />
                                              </button>
                                            </div>
                                            <button
                                              type="button"
                                              onClick={() => handleFillColumnFromParam(secIdx, cIdx, hdr)}
                                              className={`w-full text-left px-2 py-1 rounded text-[9px] font-bold flex items-center gap-1 ${
                                                isDark ? 'text-amber-300 hover:bg-amber-400/10' : 'text-amber-700 hover:bg-amber-50'
                                              }`}
                                            >
                                              <Zap size={9} /> Match Header Name ({hdr})
                                            </button>
                                            {availableProductFields.length > 0 && (
                                              <>
                                                <div className={`border-t my-0.5 ${isDark ? 'border-[#222]' : 'border-slate-200'}`} />
                                                <div className={`px-1.5 py-0.5 text-[7.5px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                  Your Product Fields
                                                </div>
                                                {availableProductFields.map(fKey => (
                                                  <button
                                                    key={fKey}
                                                    type="button"
                                                    onClick={() => handleFillColumnFromParam(secIdx, cIdx, fKey)}
                                                    className={`w-full text-left px-2 py-1 rounded text-[9px] flex items-center gap-1 transition-colors ${
                                                      isDark ? 'text-slate-200 hover:bg-[#0F3D3E] hover:text-[#E2DCC8]' : 'text-slate-700 hover:bg-teal-50 hover:text-teal-900'
                                                    }`}
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
                                className={`border-b group transition-colors ${
                                  isDark
                                    ? `${rIdx % 2 === 1 ? 'bg-[#141414]' : 'bg-[#101010]'} border-[#1e1e1e] hover:bg-[#162526]`
                                    : `${rIdx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'} border-slate-200 hover:bg-teal-50/40`
                                }`}
                              >
                                <td className={`p-1.5 text-center font-mono text-[9px] w-9 border-r ${
                                  isDark ? 'text-slate-500 border-[#1e1e1e]' : 'text-slate-400 border-slate-200'
                                }`}>
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
                                    className={`p-1 border-r last:border-r-0 ${
                                      isDark ? 'border-[#1e1e1e]' : 'border-slate-200'
                                    } ${cIdx === 0 ? 'w-[130px]' : cIdx === 1 ? 'min-w-[200px]' : 'w-[120px]'}`}
                                  >
                                    <input
                                      type="text"
                                      value={cell}
                                      onChange={(e) => handleCellChange(secIdx, rIdx, cIdx, e.target.value)}
                                      className={`w-full px-2.5 py-1.5 bg-transparent border border-transparent focus:border-[#0F3D3E] outline-none rounded-md text-[10.5px] font-mono transition-all ${
                                        isDark
                                          ? `focus:bg-[#172324] ${cIdx === 3 ? 'text-[#E2DCC8] font-black' : cIdx === 0 ? 'text-white font-bold' : 'text-slate-100'}`
                                          : `focus:bg-teal-50/50 ${cIdx === 3 ? 'text-slate-900 font-black' : cIdx === 0 ? 'text-slate-900 font-bold' : 'text-slate-800'}`
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
                                      className={`p-1 rounded transition-colors ${
                                        isDark ? 'text-slate-400 hover:text-[#E2DCC8] hover:bg-[#0F3D3E]/50' : 'text-slate-500 hover:text-[#0F3D3E] hover:bg-teal-50'
                                      }`}
                                      title="Fill row from catalog product"
                                    >
                                      <Package size={11} />
                                    </button>
                                    {/* Move Row Up */}
                                    <button
                                      type="button"
                                      disabled={rIdx === 0}
                                      onClick={() => handleMoveTableRow(secIdx, rIdx, 'up')}
                                      className={`p-1 rounded disabled:opacity-20 transition-colors ${
                                        isDark ? 'text-slate-400 hover:text-white hover:bg-[#252525]' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                                      }`}
                                      title="Move Row Up"
                                    >
                                      <ArrowUp size={11} />
                                    </button>
                                    {/* Move Row Down */}
                                    <button
                                      type="button"
                                      disabled={rIdx === sec.tableData.rows.length - 1}
                                      onClick={() => handleMoveTableRow(secIdx, rIdx, 'down')}
                                      className={`p-1 rounded disabled:opacity-20 transition-colors ${
                                        isDark ? 'text-slate-400 hover:text-white hover:bg-[#252525]' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                                      }`}
                                      title="Move Row Down"
                                    >
                                      <ArrowDown size={11} />
                                    </button>
                                    {/* Duplicate Row */}
                                    <button
                                      type="button"
                                      onClick={() => handleDuplicateTableRow(secIdx, rIdx)}
                                      className={`p-1 rounded transition-colors ${
                                        isDark ? 'text-slate-400 hover:text-white hover:bg-[#252525]' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                                      }`}
                                      title="Duplicate Row"
                                    >
                                      <Copy size={11} />
                                    </button>
                                    {/* Delete Row */}
                                    {sec.tableData.rows.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteTableRow(secIdx, rIdx)}
                                        className={`p-1 rounded transition-colors ${
                                          isDark ? 'text-slate-400 hover:text-red-400 hover:bg-red-500/10' : 'text-slate-500 hover:text-red-600 hover:bg-red-50'
                                        }`}
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
          }))}

          {!isSpecialPage && sections.length < 3 && (
            <button
              type="button"
              onClick={() => {
                setAddCategoryTargetPageIdx(currentPageIndex);
                setShowAddCategoryModal(true);
              }}
              className={`w-full py-2.5 px-3 rounded-xl border-2 border-dashed text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                isDark
                  ? 'border-[#2e2e2e] hover:border-[#00a651] bg-[#161616]/60 hover:bg-[#00a651]/10 text-slate-300 hover:text-[#00a651]'
                  : 'border-slate-300 hover:border-[#00a651] bg-slate-50 hover:bg-emerald-50/60 text-slate-700 hover:text-[#00a651]'
              }`}
            >
              <Plus size={14} className="text-[#00a651]" />
              <span>Add Category Section ({3 - sections.length} slots free)</span>
            </button>
          )}
        </div>
      )}

      {/* ================= PANEL FOOTER ================= */}
      {!isSpecialPage && viewMode === 'editor' && (
        <div className={`p-3 border-t space-y-2 shrink-0 transition-colors ${
          isDark ? 'border-[#262626] bg-[#161616]' : 'border-slate-200 bg-white shadow-sm'
        }`}>
          <button
            type="button"
            onClick={handleApplyAndReflow}
            className={`w-full py-2 px-3 border rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all hover:scale-[1.01] active:scale-[0.99] ${
              isDark
                ? 'bg-[#1b2529] hover:bg-[#223136] text-[#E2DCC8] border-[#0F3D3E]/60'
                : 'bg-teal-50 hover:bg-teal-100 text-teal-900 border-teal-300'
            }`}
            title="Reflow all pages across catalog"
          >
            <Zap size={12} className={isDark ? "text-[#00a651]" : "text-teal-600"} />
            <span>Auto-Reflow Pages</span>
          </button>
        </div>
      )}

      {/* ================= COMPLETE MEDIA GALLERY & UPLOADS MODAL ================= */}
      {imageGalleryPickerSectionIdx !== null && (
        <div
          className="fixed inset-0 z-[1150] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setImageGalleryPickerSectionIdx(null)}
        >
          <div
            className={`w-full max-w-2xl border rounded-xl shadow-2xl flex flex-col max-h-[82vh] overflow-hidden ${
              isDark ? 'bg-[#161616] border-[#262626] text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={`px-5 py-3.5 border-b flex items-center justify-between ${
              isDark ? 'border-[#262626] bg-[#141414]' : 'border-slate-200 bg-slate-50'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-[#0F3D3E] flex items-center justify-center text-[#E2DCC8] shadow-sm">
                  <ImageIcon size={15} />
                </div>
                <div>
                  <h4 className={`text-xs font-black uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Select Picture for Section #{imageGalleryPickerSectionIdx + 1}
                  </h4>
                  <p className={`text-[9px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Pick from your uploads, category thumbnails, product catalog, or upload a new photo
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setImageGalleryPickerSectionIdx(null)}
                className={`p-1.5 rounded-lg transition-colors ${
                  isDark ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <X size={16} />
              </button>
            </div>

            {/* Search & Upload Action Bar */}
            <div className={`p-3 border-b flex flex-col sm:flex-row items-center gap-2.5 justify-between ${
              isDark ? 'border-[#242424] bg-[#181818]' : 'border-slate-200 bg-white'
            }`}>
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  value={gallerySearch}
                  onChange={(e) => setGallerySearch(e.target.value)}
                  placeholder="Search media, categories, products..."
                  className={`w-full pl-3 pr-8 py-1.5 border rounded-lg text-xs placeholder-slate-400 outline-none focus:border-[#0F3D3E] ${
                    isDark ? 'bg-[#101010] border-[#2d2d2d] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
                {gallerySearch && (
                  <button
                    type="button"
                    onClick={() => setGallerySearch('')}
                    className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-xs ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-800'}`}
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
            <div className={`px-4 py-2 border-b flex items-center gap-1.5 overflow-x-auto custom-scrollbar ${
              isDark ? 'border-[#242424] bg-[#141414]' : 'border-slate-200 bg-slate-50'
            }`}>
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
                      ? isDark ? 'bg-[#0F3D3E] text-[#E2DCC8] shadow-sm' : 'bg-[#0F3D3E] text-white shadow-sm'
                      : isDark ? 'bg-[#1c1c1c] text-slate-400 hover:text-white hover:bg-[#252525]' : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {tab.label} <span className="opacity-70 font-mono text-[8.5px]">({tab.count})</span>
                </button>
              ))}
            </div>

            {/* Modal Body / Media Grid */}
            <div className={`flex-1 overflow-y-auto p-4 custom-scrollbar space-y-5 ${
              isDark ? 'bg-[#111111]' : 'bg-slate-50/50'
            }`}>
              {/* 1. USER UPLOADS */}
              {(galleryTab === 'all' || galleryTab === 'uploads') && (
                <div>
                  <div className={`flex items-center justify-between mb-2.5 pb-1 border-b ${isDark ? 'border-[#222]' : 'border-slate-200'}`}>
                    <h5 className={`text-[10.5px] font-black uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-[#E2DCC8]' : 'text-slate-800'}`}>
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
                    <div className={`p-6 rounded-xl border border-dashed text-center space-y-2 ${
                      isDark ? 'border-[#333] bg-[#161616]' : 'border-slate-300 bg-white shadow-sm'
                    }`}>
                      <Upload size={22} className="mx-auto text-slate-500" />
                      <p className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>No uploaded pictures yet</p>
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
                                  ? isDark ? 'border-[#00a651] bg-[#0F3D3E]/30 ring-2 ring-[#00a651]' : 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-400'
                                  : isDark ? 'border-[#262626] bg-[#161616] hover:border-[#0F3D3E] hover:bg-[#1d1d1d]' : 'border-slate-200 bg-white hover:border-[#0F3D3E] hover:bg-slate-50 shadow-sm'
                              }`}
                            >
                              <div className={`w-full h-24 rounded-md flex items-center justify-center overflow-hidden p-1 ${
                                isDark ? 'bg-[#0d0d0d]' : 'bg-slate-100'
                              }`}>
                                <img
                                  src={imgUrl}
                                  alt={item.name}
                                  className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                                />
                              </div>
                              <div className="w-full text-center px-0.5">
                                <p className={`text-[9px] font-bold truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{item.name || 'Uploaded Image'}</p>
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
                  <div className={`flex items-center justify-between mb-2.5 pb-1 border-b ${isDark ? 'border-[#222]' : 'border-slate-200'}`}>
                    <h5 className={`text-[10.5px] font-black uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-[#E2DCC8]' : 'text-slate-800'}`}>
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
                                ? isDark ? 'border-[#00a651] bg-[#0F3D3E]/30 ring-2 ring-[#00a651]' : 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-400'
                                : isDark ? 'border-[#262626] bg-[#161616] hover:border-[#0F3D3E] hover:bg-[#1d1d1d]' : 'border-slate-200 bg-white hover:border-[#0F3D3E] hover:bg-slate-50 shadow-sm'
                            }`}
                          >
                            <div className={`w-full h-24 rounded-md flex items-center justify-center overflow-hidden p-1 ${
                              isDark ? 'bg-[#0d0d0d]' : 'bg-slate-100'
                            }`}>
                              <img
                                src={imgUrl}
                                alt={cat.name}
                                className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                              />
                            </div>
                            <div className="w-full text-center px-0.5">
                              <p className={`text-[9px] font-bold truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{cat.name}</p>
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
                  <div className={`flex items-center justify-between mb-2.5 pb-1 border-b ${isDark ? 'border-[#222]' : 'border-slate-200'}`}>
                    <h5 className={`text-[10.5px] font-black uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-[#E2DCC8]' : 'text-slate-800'}`}>
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
                                  ? isDark ? 'border-[#00a651] bg-[#0F3D3E]/30 ring-2 ring-[#00a651]' : 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-400'
                                  : isDark ? 'border-[#262626] bg-[#161616] hover:border-[#38bdf8]/60 hover:bg-[#1d1d1d]' : 'border-slate-200 bg-white hover:border-[#38bdf8]/60 hover:bg-slate-50 shadow-sm'
                              }`}
                            >
                              <div className={`w-full h-24 rounded-md flex items-center justify-center overflow-hidden p-1 ${
                                isDark ? 'bg-[#0d0d0d]' : 'bg-slate-100'
                              }`}>
                                <img
                                  src={imgUrl}
                                  alt={p.name}
                                  className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                                />
                              </div>
                              <div className="w-full text-center px-0.5">
                                <p className={`text-[9px] font-bold truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{p.name || 'Product'}</p>
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
                  <div className={`flex items-center justify-between mb-2.5 pb-1 border-b ${isDark ? 'border-[#222]' : 'border-slate-200'}`}>
                    <h5 className={`text-[10.5px] font-black uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-[#E2DCC8]' : 'text-slate-800'}`}>
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
                                ? isDark ? 'border-[#00a651] bg-[#0F3D3E]/30 ring-2 ring-[#00a651]' : 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-400'
                                : isDark ? 'border-[#262626] bg-[#161616] hover:border-amber-400/60 hover:bg-[#1d1d1d]' : 'border-slate-200 bg-white hover:border-amber-400/60 hover:bg-slate-50 shadow-sm'
                            }`}
                          >
                            <div className={`w-full h-24 rounded-md flex items-center justify-center overflow-hidden ${
                              isDark ? 'bg-[#0d0d0d]' : 'bg-slate-100'
                            }`}>
                              <img
                                src={preset.url}
                                alt={preset.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            </div>
                            <div className="w-full text-center px-0.5">
                              <p className={`text-[9px] font-bold truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{preset.name}</p>
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
                  <div className={`flex items-center justify-between mb-2.5 pb-1 border-b ${isDark ? 'border-[#222]' : 'border-slate-200'}`}>
                    <h5 className={`text-[10.5px] font-black uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-[#E2DCC8]' : 'text-slate-800'}`}>
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
                                ? isDark ? 'border-[#00a651] bg-[#0F3D3E]/30 ring-2 ring-[#00a651]' : 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-400'
                                : isDark ? 'border-[#262626] bg-[#161616] hover:border-[#0F3D3E] hover:bg-[#1d1d1d]' : 'border-slate-200 bg-white hover:border-[#0F3D3E] hover:bg-slate-50 shadow-sm'
                            }`}
                          >
                            <div className={`w-full h-24 rounded-md flex items-center justify-center overflow-hidden p-1 ${
                              isDark ? 'bg-[#0d0d0d]' : 'bg-slate-100'
                            }`}>
                              <img
                                src={imgUrl}
                                alt={a.name}
                                className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                              />
                            </div>
                            <div className="w-full text-center px-0.5">
                              <p className={`text-[9px] font-bold truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{a.name}</p>
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
            className={`w-full max-w-md border rounded-[6px] shadow-2xl flex flex-col max-h-[75vh] overflow-hidden ${
              isDark ? 'bg-[#161616] border-[#262626] text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`px-4 py-3 border-b flex items-center justify-between ${
              isDark ? 'border-[#262626] bg-[#141414]' : 'border-slate-200 bg-slate-50'
            }`}>
              <div className="flex items-center gap-2">
                <Package size={14} className={isDark ? "text-[#E2DCC8]" : "text-[#0F3D3E]"} />
                <h4 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Fill Section #{productPickerSectionIdx + 1}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setProductPickerSectionIdx(null)}
                className={`p-1 rounded transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
              >
                <X size={14} />
              </button>
            </div>

            <div className={`p-2.5 border-b space-y-1.5 ${
              isDark ? 'border-[#262626] bg-[#141414]' : 'border-slate-200 bg-slate-50/50'
            }`}>
              <input
                type="text"
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                placeholder="Search products by name or SKU..."
                className={`w-full px-2.5 py-1 border rounded text-xs outline-none focus:border-[#0F3D3E] ${
                  isDark ? 'bg-[#1a1a1a] border-[#333] text-white placeholder-[#666]' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
              />

              {categories.length > 0 && (
                <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar pb-0.5">
                  <button
                    type="button"
                    onClick={() => setPickerCategoryFilter(null)}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider shrink-0 transition-all ${
                      pickerCategoryFilter === null
                        ? 'bg-[#0F3D3E] text-white'
                        : isDark ? 'bg-[#202020] text-slate-400 hover:text-white' : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
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
                            : isDark ? 'bg-[#202020] text-slate-400 hover:text-white' : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                        }`}
                      >
                        {cat.name} ({count})
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className={`flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar ${
              isDark ? 'bg-[#121212]' : 'bg-white'
            }`}>
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
                    <div className="py-8 text-center text-slate-400 text-xs">
                      No products found.
                    </div>
                  );
                }

                return filtered.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleSelectProductForSection(productPickerSectionIdx, p)}
                    className={`p-2.5 rounded border flex items-center justify-between gap-2.5 cursor-pointer transition-all group ${
                      isDark
                        ? 'border-[#262626] bg-[#161616] hover:border-[#0F3D3E] hover:bg-[#1a1a1a]'
                        : 'border-slate-200 bg-slate-50 hover:border-[#0F3D3E] hover:bg-teal-50/40 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.name}
                          className={`w-8 h-8 rounded object-contain border p-0.5 shrink-0 ${
                            isDark ? 'bg-[#101010] border-[#262626]' : 'bg-white border-slate-200'
                          }`}
                        />
                      ) : (
                        <div className={`w-8 h-8 rounded border flex items-center justify-center shrink-0 ${
                          isDark ? 'bg-[#101010] border-[#262626] text-[#666]' : 'bg-white border-slate-200 text-slate-400'
                        }`}>
                          <Package size={14} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className={`text-[11px] font-bold truncate ${
                          isDark ? 'text-white group-hover:text-[#E2DCC8]' : 'text-slate-800 group-hover:text-[#0F3D3E]'
                        }`}>
                          {p.name}
                        </p>
                        <div className={`flex items-center gap-1.5 text-[9px] ${isDark ? 'text-[#888]' : 'text-slate-500'}`}>
                          {p.sku && <span className="font-mono">{p.sku}</span>}
                          {p.price !== undefined && <span className={isDark ? "text-[#E2DCC8]" : "text-[#0F3D3E] font-bold"}>• ₹{p.price}</span>}
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
            className={`w-full max-w-xl border rounded-xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
              isDark ? 'bg-[#141414] border-[#2a2a2a] text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={`px-4 py-3.5 border-b flex items-center justify-between ${
              isDark ? 'border-[#242424] bg-[#181818]' : 'border-slate-200 bg-slate-50'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#0F3D3E] text-[#E2DCC8] flex items-center justify-center shadow-sm">
                  <Package size={15} />
                </div>
                <div>
                  <h4 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Fill Row #{linkRowModal.rIdx + 1} with Product
                  </h4>
                  <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Section #{linkRowModal.secIdx + 1} Specs Table
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLinkRowModal(null)}
                className={`p-1.5 rounded-lg transition-colors ${
                  isDark ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <X size={15} />
              </button>
            </div>

            {/* Search & Category Filter */}
            <div className={`p-3 border-b flex items-center gap-2 ${
              isDark ? 'border-[#242424] bg-[#161616]' : 'border-slate-200 bg-white'
            }`}>
              <div className="relative flex-1">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={linkRowSearch}
                  onChange={(e) => setLinkRowSearch(e.target.value)}
                  placeholder="Search products by title or model no / SKU..."
                  className={`w-full pl-8 pr-3 py-1.5 border rounded-lg text-xs placeholder-slate-400 outline-none focus:border-[#0F3D3E] ${
                    isDark ? 'bg-[#0f0f0f] border-[#333] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                  autoFocus
                />
              </div>
              {categories.length > 0 && (
                <select
                  value={linkRowCategory}
                  onChange={(e) => setLinkRowCategory(e.target.value)}
                  className={`px-2.5 py-1.5 border rounded-lg text-xs outline-none cursor-pointer ${
                    isDark ? 'bg-[#0f0f0f] border-[#333] text-slate-300' : 'bg-white border-slate-300 text-slate-700'
                  }`}
                >
                  <option value="all">All Categories</option>
                  {categories.map(c => (
                    <option key={c.id} value={String(c.id)}>{c.name}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Products List */}
            <div className={`flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar ${
              isDark ? 'bg-[#111111]' : 'bg-slate-50/50'
            }`}>
              {(() => {
                const filtered = products.filter(p => {
                  const matchCat = linkRowCategory === 'all' || String(p.categoryId) === String(linkRowCategory);
                  const q = linkRowSearch.toLowerCase().trim();
                  const matchQuery = !q || (p.name && p.name.toLowerCase().includes(q)) || (p.sku && p.sku.toLowerCase().includes(q));
                  return matchCat && matchQuery;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="py-12 text-center text-slate-400 text-xs">
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
                      className={`p-2.5 border rounded-lg transition-all flex items-center justify-between gap-3 group ${
                        isDark
                          ? 'bg-[#181818] hover:bg-[#202020] border-[#2a2a2a]'
                          : 'bg-white hover:bg-teal-50/40 border-slate-200 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {pImg ? (
                          <img
                            src={normalizeImageUrl(pImg)}
                            alt={p.name}
                            className={`w-10 h-10 object-contain rounded p-0.5 border shrink-0 ${
                              isDark ? 'bg-[#0d0d0d] border-[#333]' : 'bg-slate-50 border-slate-200'
                            }`}
                          />
                        ) : (
                          <div className={`w-10 h-10 rounded border flex items-center justify-center shrink-0 ${
                            isDark ? 'bg-[#0d0d0d] border-[#333] text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-400'
                          }`}>
                            <Package size={16} />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className={`text-xs font-bold truncate ${
                            isDark ? 'text-white group-hover:text-[#E2DCC8]' : 'text-slate-800 group-hover:text-[#0F3D3E]'
                          }`}>
                            {p.name}
                          </p>
                          <div className={`flex items-center gap-2 text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {p.sku && <span className="font-mono">{p.sku}</span>}
                            {p.price !== undefined && <span className={`font-bold ${isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'}`}>• ₹{p.price}</span>}
                            {p.variants && p.variants.length > 0 && (
                              <span className="text-amber-500 font-mono text-[9px]">[{p.variants.length} vars]</span>
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
                                  className={`px-2 py-0.5 rounded text-[9px] font-mono transition-all border ${
                                    isDark
                                      ? 'bg-[#262626] hover:bg-[#333] text-slate-300 hover:text-white border-[#3a3a3a]'
                                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-200'
                                  }`}
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

      {/* ================= ADD UNINCLUDED CATEGORY MODAL ================= */}
      {showAddCategoryModal && (
        <div
          className="fixed inset-0 z-[1250] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => {
            setShowAddCategoryModal(false);
            setAddCategoryTargetPageIdx(null);
            setAddCategorySearch('');
          }}
        >
          <div
            className={`w-full max-w-lg border rounded-xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
              isDark ? 'bg-[#141414] border-[#262626] text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={`px-4 py-3.5 border-b flex items-center justify-between ${
              isDark ? 'border-[#242424] bg-[#181818]' : 'border-slate-200 bg-slate-50'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#00a651] text-black flex items-center justify-center shadow-md shadow-[#00a651]/20 font-bold">
                  <FolderPlus size={18} className="stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className={`text-xs font-black uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Add Category to Catalog
                    </h4>
                    {addCategoryTargetPageIdx !== null ? (
                      <span className="px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold bg-[#0F3D3E] text-[#E2DCC8]">
                        Target: Page {addCategoryTargetPageIdx + 1}
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold bg-[#0F3D3E] text-[#E2DCC8]">
                        Auto-Place
                      </span>
                    )}
                  </div>
                  <p className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Showing only categories not currently included in this catalog
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowAddCategoryModal(false);
                  setAddCategoryTargetPageIdx(null);
                  setAddCategorySearch('');
                }}
                className={`p-1.5 rounded-lg transition-colors ${
                  isDark ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <X size={16} />
              </button>
            </div>

            {/* Search filter if there are categories */}
            {unincludedCategories.length > 0 && (
              <div className={`p-3 border-b ${
                isDark ? 'border-[#242424] bg-[#161616]' : 'border-slate-200 bg-white'
              }`}>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={addCategorySearch}
                    onChange={(e) => setAddCategorySearch(e.target.value)}
                    placeholder="Search available categories..."
                    className={`w-full pl-9 pr-3 py-1.5 border rounded-lg text-xs placeholder-slate-400 outline-none focus:border-[#00a651] ${
                      isDark ? 'bg-[#0f0f0f] border-[#333] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                    autoFocus
                  />
                </div>
              </div>
            )}

            {/* Categories List */}
            <div className={`flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar ${
              isDark ? 'bg-[#111111]' : 'bg-slate-50/50'
            }`}>
              {(() => {
                if (unincludedCategories.length === 0) {
                  return (
                    <div className="py-12 px-4 text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-[#00a651] flex items-center justify-center mx-auto border border-emerald-500/20">
                        <CheckCircle2 size={24} />
                      </div>
                      <div className="space-y-1">
                        <h5 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          All Categories Included!
                        </h5>
                        <p className={`text-[10.5px] max-w-xs mx-auto leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          Every category from your inventory is already displayed in this catalog.
                        </p>
                      </div>
                    </div>
                  );
                }

                const filtered = unincludedCategories.filter(cat => {
                  const q = addCategorySearch.toLowerCase().trim();
                  return !q || cat.name.toLowerCase().includes(q);
                });

                if (filtered.length === 0) {
                  return (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      No categories match "{addCategorySearch}".
                    </div>
                  );
                }

                return filtered.map(cat => {
                  const catProds = products.filter(p => String(p.categoryId) === String(cat.id));
                  const catImg = resolveProductImage(catProds[0], cat as any, catProds);

                  return (
                    <div
                      key={cat.id}
                      onClick={() => handleAddCategoryToCatalog(cat, addCategoryTargetPageIdx)}
                      className={`p-3 border rounded-xl transition-all flex items-center justify-between gap-3 cursor-pointer group ${
                        isDark
                          ? 'bg-[#181818] hover:bg-[#202020] border-[#2a2a2a] hover:border-[#00a651]'
                          : 'bg-white hover:bg-emerald-50/40 border-slate-200 hover:border-[#00a651] shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {catImg ? (
                          <img
                            src={normalizeImageUrl(catImg)}
                            alt={cat.name}
                            className={`w-11 h-11 object-contain rounded-lg p-0.5 border shrink-0 ${
                              isDark ? 'bg-[#0d0d0d] border-[#333]' : 'bg-slate-50 border-slate-200'
                            }`}
                          />
                        ) : (
                          <div className={`w-11 h-11 rounded-lg border flex items-center justify-center shrink-0 ${
                            isDark ? 'bg-[#0d0d0d] border-[#333] text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-400'
                          }`}>
                            <Layers size={18} />
                          </div>
                        )}

                        <div className="min-w-0">
                          <h5 className={`text-xs font-bold truncate transition-colors ${
                            isDark ? 'text-white group-hover:text-[#00a651]' : 'text-slate-900 group-hover:text-[#00a651]'
                          }`}>
                            {cat.name}
                          </h5>
                          <div className={`flex items-center gap-2 text-[10px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            <span className="font-semibold text-[#00a651] font-mono">{catProds.length} Products</span>
                            {catProds.length > 0 && (
                              <span>• {catProds.reduce((acc, p) => acc + (p.variants?.length || 1), 0)} model rows</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="px-3 py-1.5 bg-[#00a651] hover:bg-[#009247] text-black font-black uppercase text-[10px] rounded-lg tracking-wider transition-all shrink-0 shadow-sm flex items-center gap-1"
                      >
                        <Plus size={12} className="stroke-[3]" /> Add
                      </button>
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
