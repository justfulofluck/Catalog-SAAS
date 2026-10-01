import { Product, ProductVariant, ProductGridSection } from '../../../types';

export const DEFAULT_SECTIONS: ProductGridSection[] = [
  {
    id: 'sec-1',
    title: 'HONEY COMB SERIES COB DOWN LIGHT',
    titleColor: '#00a651',
    titleFontSize: 26,
    imageSrc: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=600',
    hasBackground: false,
    backgroundColor: '#f1f5f9',
    tableData: {
      headers: ['MODEL NO', 'PRODUCTS', 'CUT-OUT', 'COLOR', 'DEALER PRICE', 'PACKING PER BOX'],
      rows: [
        ['VT-17012', '12W HONEY COMB SERIES COB', '75MM', 'W, W.W, N.W', '800', '20 PCS'],
        ['VT-17018', '18W HONEY COMB SERIES COB', '95MM', 'W, W.W, N.W', '1,000', '20 PCS'],
        ['VT-17024', '24W HONEY COMB SERIES COB', '115MM', 'W, W.W, N.W', '1,200', '20 PCS']
      ],
      headerBg: '#002838',
      headerTextColor: '#ffffff',
      alternateRowBg: '#eef2f5',
      rowBg: '#ffffff',
      borderColor: '#002838',
      fontSize: 9,
      headerFontSize: 12,
      cellPadding: 4,
    }
  },
  {
    id: 'sec-2',
    title: 'BRAVO SERIES COB DOWNLIGHTER',
    titleColor: '#00a651',
    titleFontSize: 26,
    imageSrc: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=600',
    hasBackground: true,
    backgroundColor: '#e2e8f0',
    tableData: {
      headers: ['MODEL NO', 'PRODUCTS', 'CUT-OUT', 'COLOR', 'DEALER PRICE', 'PACKING PER BOX'],
      rows: [
        ['VT-2613', '12W BRAVO SERIES COB', '55MM', 'W, W.W, N.W', '1,300', '20 PCS'],
        ['VT-2613', '12W BRAVO SERIES TITANIUM BLACK', '55MM', 'W, W.W, N.W', '1,550', '20 PCS']
      ],
      headerBg: '#002838',
      headerTextColor: '#ffffff',
      alternateRowBg: '#eef2f5',
      rowBg: '#ffffff',
      borderColor: '#002838',
      fontSize: 9,
      headerFontSize: 12,
      cellPadding: 4,
    }
  },
  {
    id: 'sec-3',
    title: 'CRETA SERIES COB DOWNLIGHT',
    titleColor: '#00a651',
    titleFontSize: 26,
    imageSrc: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=600',
    hasBackground: false,
    backgroundColor: '#f1f5f9',
    tableData: {
      headers: ['MODEL NO', 'PRODUCTS', 'CUT-OUT', 'COLOR', 'DEALER PRICE', 'PACKING PER BOX'],
      rows: [
        ['VT-17007', '7W CRETA SERIES COB DOWNLIGHT', '65MM', 'W, W.W', '290', '50 PCS'],
        ['VT-17011', '12W CRETA SERIES COB DOWNLIGHT', '80MM', 'W, W.W', '340', '50 PCS']
      ],
      headerBg: '#002838',
      headerTextColor: '#ffffff',
      alternateRowBg: '#eef2f5',
      rowBg: '#ffffff',
      borderColor: '#002838',
      fontSize: 9,
      headerFontSize: 12,
      cellPadding: 4,
    }
  }
];

export const PRESET_TITLE_COLORS = ['#00a651', '#0284c7', '#4f46e5', '#0f172a', '#d97706', '#dc2626', '#059669'];
export const PRESET_BG_COLORS = ['#e2e8f0', '#dbeafe', '#f1f5f9', '#fef3c7', '#f0fdf4', '#fce7f3', '#1e293b'];

export const generateRowFromProduct = (
  headers: string[],
  product: Product,
  variant?: ProductVariant
): string[] => {
  if (!headers || !headers.length) return [];

  // Helper to extract value from variant.customAttributes or product.customFields
  const findCustomFieldValue = (keyQuery: string): string | null => {
    const targetNorm = keyQuery.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!targetNorm) return null;

    // 1. Check variant.customAttributes (highest priority for row)
    if (variant?.customAttributes && typeof variant.customAttributes === 'object') {
      if (variant.customAttributes[keyQuery] !== undefined && variant.customAttributes[keyQuery] !== null) {
        const val = String(variant.customAttributes[keyQuery]).trim();
        if (val && val !== '-') return val;
      }
      for (const [k, v] of Object.entries(variant.customAttributes)) {
        if (k.toLowerCase().replace(/[^a-z0-9]/g, '') === targetNorm) {
          if (v !== undefined && v !== null) {
            const val = String(v).trim();
            if (val && val !== '-') return val;
          }
        }
      }
    }

    // 2. Check product.customFields
    if (product.customFields && typeof product.customFields === 'object') {
      if (product.customFields[keyQuery] !== undefined && product.customFields[keyQuery] !== null) {
        const val = String(product.customFields[keyQuery]).trim();
        if (val && val !== '-') return val;
      }
      for (const [k, v] of Object.entries(product.customFields)) {
        if (k.toLowerCase().replace(/[^a-z0-9]/g, '') === targetNorm) {
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

    // Step 1: User's custom field match directly against header name
    const customMatch = findCustomFieldValue(hdr);
    if (customMatch) return customMatch;

    // Step 2: Model Number - Strictly model number custom field
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
