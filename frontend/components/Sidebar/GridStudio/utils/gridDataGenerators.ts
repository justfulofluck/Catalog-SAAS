import { Product, ProductVariant, ProductGridSection, TableData, CatalogPage, Category, CanvasElement } from '../../../types';
import { PAGE_WIDTH, PAGE_HEIGHT } from '../../../constants';
import { resolveProductImage, resolveProductTitle } from '../../../utils/imageUtils';
import { resolveFieldLabel } from '../../../utils/fieldUtils';

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

    if (includedCatIds.has(idStr)) return false;
    if (includedCatNames.has(nameStr)) return false;

    for (const title of includedCatNames) {
      if (title && (title === nameStr || title.includes(nameStr) || (nameStr.length > 4 && nameStr.includes(title)))) {
        return false;
      }
    }

    return true;
  });
};

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

export const generateRowFromProduct = (
  headers: string[],
  product: Product,
  variant?: ProductVariant,
  categories?: any[]
): string[] => {
  if (!headers || !headers.length) return [];

  const findCustomFieldValue = (keyQuery: string): string | null => {
    const targetNorm = keyQuery.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!targetNorm) return null;

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

    if (variant?.customAttributes && typeof variant.customAttributes === 'object') {
      if (variant.customAttributes[keyQuery] !== undefined && variant.customAttributes[keyQuery] !== null) {
        const val = String(variant.customAttributes[keyQuery]).trim();
        if (val && val !== '-') return val;
      }
      for (const [k, v] of Object.entries(variant.customAttributes)) {
        if (matchingSchemaIds.some(sId => sId.toLowerCase() === k.toLowerCase())) {
          if (v !== undefined && v !== null) {
            const val = String(v).trim();
            if (val && val !== '-') return val;
          }
        }
      }
      for (const [k, v] of Object.entries(variant.customAttributes)) {
        if (k.toLowerCase().replace(/[^a-z0-9]/g, '') === targetNorm) {
          if (v !== undefined && v !== null) {
            const val = String(v).trim();
            if (val && val !== '-') return val;
          }
        }
        const resolved = resolveFieldLabel(k, categories as any, product);
        if (resolved && resolved.toLowerCase().replace(/[^a-z0-9]/g, '') === targetNorm) {
          if (v !== undefined && v !== null) {
            const val = String(v).trim();
            if (val && val !== '-') return val;
          }
        }
      }
    }

    if (product.customFields && typeof product.customFields === 'object') {
      if (product.customFields[keyQuery] !== undefined && product.customFields[keyQuery] !== null) {
        const val = String(product.customFields[keyQuery]).trim();
        if (val && val !== '-') return val;
      }
      for (const [k, v] of Object.entries(product.customFields)) {
        if (matchingSchemaIds.some(sId => sId.toLowerCase() === k.toLowerCase())) {
          if (v !== undefined && v !== null) {
            const val = String(v).trim();
            if (val && val !== '-') return val;
          }
        }
      }
      for (const [k, v] of Object.entries(product.customFields)) {
        if (k.toLowerCase().replace(/[^a-z0-9]/g, '') === targetNorm) {
          if (v !== undefined && v !== null) {
            const val = String(v).trim();
            if (val && val !== '-') return val;
          }
        }
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

    const customMatch = findCustomFieldValue(hdr);
    if (customMatch) return customMatch;

    if (h.includes('model') || h.includes('itemno') || h === 'item' || h === 'code' || h === 'itemcode') {
      const modelVal = findCustomFieldValue('model_no') || findCustomFieldValue('model') || 
                       findCustomFieldValue('model_number') || findCustomFieldValue('modelno') ||
                       findCustomFieldValue('item_code') || findCustomFieldValue('item_no') ||
                       findCustomFieldValue('item_number');
      if (modelVal) return modelVal;
      return '-';
    }

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

    if (h.includes('product') || h.includes('spec') || h.includes('desc') || h.includes('name') || h.includes('title')) {
      const nameVal = findCustomFieldValue('product_name') || findCustomFieldValue('description') || findCustomFieldValue('spec') || findCustomFieldValue('title');
      if (nameVal) return nameVal;
      if (variant?.name && variant.name !== 'Untitled Product' && variant.name !== '-') return variant.name;
      if (product.name && product.name !== 'Untitled Product' && product.name !== '-') return product.name;
      return '-';
    }

    if (h.includes('cut') || h.includes('size') || h.includes('dim') || h.includes('dia')) {
      const cutVal = findCustomFieldValue('cut_out') || findCustomFieldValue('cutout') || findCustomFieldValue('size') || findCustomFieldValue('dimension') || findCustomFieldValue('dia');
      if (cutVal) return cutVal;
      if (variant?.cutOut && variant.cutOut !== '-') return variant.cutOut;
      return '-';
    }

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

    if (h.includes('color') || h.includes('cct') || h.includes('shade') || h.includes('temp')) {
      const colorVal = findCustomFieldValue('color') || findCustomFieldValue('cct') || findCustomFieldValue('shade') || findCustomFieldValue('temperature');
      if (colorVal) return colorVal;
      if (variant?.color && variant.color !== '-') return variant.color;
      return '-';
    }

    if (h.includes('pack') || h.includes('box') || h.includes('qty') || h.includes('carton') || h.includes('pcs')) {
      const packVal = findCustomFieldValue('packing') || findCustomFieldValue('box_qty') || findCustomFieldValue('qty') || findCustomFieldValue('pack');
      if (packVal) return packVal;
      if (variant?.packing && variant.packing !== '-') return variant.packing;
      return '-';
    }

    if (h.includes('power') || h.includes('watt') || h.includes('wt') || h === 'w') {
      const powerVal = findCustomFieldValue('wattage') || findCustomFieldValue('power') || findCustomFieldValue('watt') || findCustomFieldValue('watts');
      if (powerVal) return powerVal;
      if ((variant as any)?.power) return String((variant as any).power);
      if (product.power) return String(product.power);
      return '-';
    }

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

export const calculateElementPlacement = (
  itemWidth: number,
  itemHeight: number,
  catalog: any,
  currentPageIndex: number
): { x: number; y: number; width: number; height: number } => {
  const currentPage = catalog?.pages?.[currentPageIndex];
  const elements: CanvasElement[] = currentPage?.elements || [];
  const marginX = catalog?.marginLeft ? Math.round(catalog.marginLeft) : 45;
  const marginTop = catalog?.marginTop ? Math.round(catalog.marginTop) : 55;
  const marginBottom = catalog?.marginBottom ? Math.round(catalog.marginBottom) : 55;
  const marginRight = catalog?.marginRight ? Math.round(catalog.marginRight) : 45;
  const pageWidth = PAGE_WIDTH || 794;
  const pageHeight = PAGE_HEIGHT || 1123;

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

export const isRowMatchedToProduct = (row: string[], products: Product[]): boolean => {
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
