import { Product, ProductVariant, Category } from '../../../types';
import { resolveFieldLabel } from '../../../utils/fieldUtils';

export const PRESET_THEMES = [
  { name: 'Dark Teal (V-TAC)', headerBg: '#002b36', headerTextColor: '#ffffff', rowBg: '#ffffff', alternateRowBg: '#f8fafc', borderColor: '#334155' },
  { name: 'Modern Indigo', headerBg: '#4f46e5', headerTextColor: '#ffffff', rowBg: '#ffffff', alternateRowBg: '#eef2ff', borderColor: '#6366f1' },
  { name: 'Deep Slate', headerBg: '#0f172a', headerTextColor: '#ffffff', rowBg: '#ffffff', alternateRowBg: '#f1f5f9', borderColor: '#334155' },
  { name: 'Forest Emerald', headerBg: '#064e3b', headerTextColor: '#ffffff', rowBg: '#ffffff', alternateRowBg: '#f0fdf4', borderColor: '#047857' },
  { name: 'Luxury Wine', headerBg: '#4c0519', headerTextColor: '#ffffff', rowBg: '#ffffff', alternateRowBg: '#fff1f2', borderColor: '#9f1239' },
  { name: 'Clean Minimalist', headerBg: '#e2e8f0', headerTextColor: '#0f172a', rowBg: '#ffffff', alternateRowBg: '#f8fafc', borderColor: '#cbd5e1' },
];

export function matchRowToProduct(row: string[], products: Product[]): { product: Product; variant: ProductVariant | null } | null {
  if (!products || products.length === 0) return null;

  const rowTokens = row
    .map(c => (c || '').trim().toLowerCase().replace(/^[₹$]/, ''))
    .filter(c => c && c !== '-');
  if (rowTokens.length === 0) return null;

  let bestScore = 0;
  let bestMatch: { product: Product; variant: ProductVariant | null } | null = null;

  for (const p of products) {
    const pSku = (p.sku || '').trim().toLowerCase();
    const pName = (p.name || '').trim().toLowerCase();
    const pPrice = p.price !== undefined ? String(p.price).trim().toLowerCase() : '';

    const checkCandidate = (variant: ProductVariant | null) => {
      let score = 0;
      const vSku = (variant?.sku || '').trim().toLowerCase();
      const vName = (variant?.name || '').trim().toLowerCase();
      const vPrice = (variant?.price !== undefined && variant?.price !== null && String(variant.price).trim() !== '')
        ? String(variant.price).trim().toLowerCase()
        : pPrice;
      const vCutOut = (variant?.cutOut || '').trim().toLowerCase();

      // 1. Exact SKU / Model match
      if (vSku && rowTokens.some(tok => tok === vSku)) score += 100;
      else if (pSku && rowTokens.some(tok => tok === pSku)) score += 80;

      // 2. Exact Name match
      if (vName && rowTokens.some(tok => tok === vName)) score += 75;
      else if (pName && rowTokens.some(tok => tok === pName)) score += 65;

      // 3. Exact Price match
      if (vPrice && rowTokens.some(tok => tok === vPrice || tok === `₹${vPrice}` || tok === `$${vPrice}`)) score += 50;

      // 4. Exact Cut-Out match
      if (vCutOut && rowTokens.some(tok => tok === vCutOut)) score += 40;

      // 5. Custom Attributes / Fields match
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

      // 6. Distinct word match
      for (const tok of rowTokens) {
        if (tok.length >= 4 && !['downlight', 'series', 'light', 'white', 'black', 'warm'].includes(tok)) {
          if (pName.includes(tok)) score += 6;
          if (vName && vName.includes(tok)) score += 8;
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = { product: p, variant };
      }
    };

    if (p.variants && p.variants.length > 0) {
      for (const v of p.variants) {
        checkCandidate(v);
      }
    } else {
      checkCandidate(null);
    }
  }

  return bestScore > 0 ? bestMatch : null;
}

export function extractParamValue(product: Product, variant: ProductVariant | null, paramKey: string, paramLabel?: string): string {
  const normKey = (paramKey || '').toLowerCase();
  const normLabel = (paramLabel || '').toLowerCase();

  // Model Number (Strictly Model No - never SKU fallback)
  if (normKey.includes('model') || normLabel.includes('model')) {
    return variant?.customAttributes?.model || variant?.customAttributes?.model_no || product.customFields?.model || product.customFields?.model_no || (product as any).modelNo || '-';
  }

  // SKU (Only if explicitly SKU)
  if (normKey === 'sku' || normLabel === 'sku') {
    return variant?.sku || product.sku || '-';
  }

  // Product Name / Specification
  if (normKey === 'name' || normLabel.includes('product') || normLabel.includes('spec') || normLabel.includes('name') || normLabel.includes('desc')) {
    return variant?.name || product.name || '-';
  }

  // Cut-out / Dimensions
  if (normKey.includes('cut') || normLabel.includes('cut') || normLabel.includes('dim')) {
    return variant?.cutOut || product.customFields?.cutOut || product.customFields?.cut_out || product.customFields?.['cut-out'] || product.customFields?.cutout || '-';
  }

  // Color / CCT
  if (normKey.includes('color') || normKey.includes('cct') || normLabel.includes('color') || normLabel.includes('cct')) {
    return variant?.color || product.customFields?.color || product.customFields?.cct || product.customFields?.['color/cct'] || '-';
  }

  // Price
  if (normKey.includes('price') || normLabel.includes('price') || normLabel.includes('mrp') || normLabel.includes('rate') || normLabel.includes('dealer')) {
    const p = variant?.price ?? product.price;
    if (p !== undefined && p !== null) {
      return typeof p === 'number' ? `${product.currency || '₹'}${p}` : String(p);
    }
    return '-';
  }

  // Packing
  if (normKey.includes('pack') || normLabel.includes('pack') || normLabel.includes('box')) {
    return variant?.packing || product.customFields?.packing || product.customFields?.packing_per_box || product.customFields?.['packing per box'] || '-';
  }

  // Custom attributes on variant or product
  if (variant?.customAttributes && variant.customAttributes[paramKey] !== undefined) {
    return String(variant.customAttributes[paramKey]);
  }
  if (product.customFields && product.customFields[paramKey] !== undefined) {
    return String(product.customFields[paramKey]);
  }

  // Fuzzy match on product.customFields keys
  if (product.customFields) {
    const matchedKey = Object.keys(product.customFields).find(k =>
      k.toLowerCase() === normKey ||
      k.toLowerCase().replace(/[^a-z0-9]/g, '') === normLabel.replace(/[^a-z0-9]/g, '')
    );
    if (matchedKey && product.customFields[matchedKey] !== undefined) {
      return String(product.customFields[matchedKey]);
    }
  }

  return '-';
}

export function buildAvailableParams(products: Product[], categories: Category[]) {
  const list: { key: string; label: string; group: string; icon?: string }[] = [
    { key: 'cutOut', label: 'CUT-OUT', group: 'Standard Specs' },
    { key: 'color', label: 'COLOR / CCT', group: 'Standard Specs' },
    { key: 'price', label: 'DEALER PRICE', group: 'Standard Specs' },
    { key: 'packing', label: 'PACKING PER BOX', group: 'Standard Specs' },
    { key: 'sku', label: 'MODEL NO', group: 'Standard Specs' },
    { key: 'name', label: 'PRODUCTS / SPEC', group: 'Standard Specs' },
  ];

  const seenLabels = new Set(list.map(p => p.label.toLowerCase().replace(/[^a-z0-9]/g, '')));

  // Collect custom fields from products
  products.forEach(p => {
    if (p.customFields) {
      Object.keys(p.customFields).forEach(k => {
        if (typeof p.customFields![k] === 'object') return;
        const resolved = resolveFieldLabel(k, categories, p);
        if (!resolved) return;
        const label = resolved.toUpperCase();
        const norm = label.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (!seenLabels.has(norm)) {
          seenLabels.add(norm);
          list.push({ key: k, label, group: 'Product Attributes' });
        }
      });
    }
  });

  // Collect fields from category customSchema
  categories.forEach(cat => {
    if (cat.customSchema) {
      cat.customSchema.forEach(field => {
        if (field.type === 'image') return;
        const label = field.label.toUpperCase();
        const norm = label.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (!seenLabels.has(norm)) {
          seenLabels.add(norm);
          list.push({ key: field.id, label, group: 'Category Schema' });
        }
      });
    }
  });

  return list;
}
