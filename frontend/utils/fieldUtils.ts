import { Category, Product } from '../types';

/**
 * Resolves a human-readable display label for any product field or custom field key.
 *
 * Handles:
 * 1. Category customSchema definitions (matching categoryId or any category schema)
 * 2. Generated ID keys like `custom_1788425643313` or `field_123` -> resolves to schema label, or returns null if unmatched
 * 3. Known field names (cutOut, color, packing, cct, model_no, wattage, etc.) -> formatted clean Title Case
 * 4. Ignores media/internal fields (gallery, images, thumbnail, id, categoryId, etc.)
 */
export function resolveFieldLabel(
  key: string,
  categories?: Category[],
  product?: Product
): string | null {
  if (!key) return null;

  // Ignore internal/media keys
  const lowerKey = key.toLowerCase();
  if ([
    'id', 'categoryid', 'images', 'image', 'gallery', 'thumbnail',
    'variants', 'customfields', 'currency', 'createdat', 'updatedat'
  ].includes(lowerKey)) {
    return null;
  }

  // 1. Try to find in the product's specific category customSchema
  if (categories && product?.categoryId) {
    const productCat = categories.find(c => String(c.id) === String(product.categoryId));
    if (productCat?.customSchema) {
      const match = productCat.customSchema.find(f => f.id === key);
      if (match && match.label?.trim()) {
        return match.label.trim();
      }
    }
  }

  // 2. Try to find across all categories' customSchema
  if (categories && categories.length > 0) {
    for (const cat of categories) {
      if (cat.customSchema) {
        const match = cat.customSchema.find(f => f.id === key);
        if (match && match.label?.trim()) {
          return match.label.trim();
        }
      }
    }
  }

  // 3. If key is an opaque identifier (e.g. custom_1788425643313, field-12345, or purely numeric)
  // and has no matching schema, it should NOT be displayed as "CUSTOM 1788425643313"
  const isOpaqueId = /^(custom|field)[-_]?[0-9]+$/i.test(key) || /^[0-9]+$/.test(key);
  if (isOpaqueId) {
    return null;
  }

  // 4. Map known standard specification keys
  const knownKeys: Record<string, string> = {
    cutout: 'Cut Out',
    cut_out: 'Cut Out',
    'cut-out': 'Cut Out',
    color: 'Color / CCT',
    cct: 'Color / CCT',
    'color/cct': 'Color / CCT',
    packing: 'Packing',
    packing_per_box: 'Packing',
    'packing per box': 'Packing',
    model: 'Model No',
    model_no: 'Model No',
    'model no': 'Model No',
    modelnum: 'Model No',
    sku: 'Model No / SKU',
    wattage: 'Wattage',
    power: 'Power',
    voltage: 'Voltage',
    lumens: 'Lumens',
    beam_angle: 'Beam Angle',
    'beam angle': 'Beam Angle',
    cri: 'CRI',
    ip_rating: 'IP Rating',
    'ip rating': 'IP Rating',
    dimension: 'Dimensions',
    dimensions: 'Dimensions',
    material: 'Material',
    finish: 'Finish',
    warranty: 'Warranty',
    brand: 'Brand',
    series: 'Series'
  };

  const normalized = lowerKey.replace(/[\s-_]+/g, '_');
  if (knownKeys[normalized]) {
    return knownKeys[normalized];
  }

  // 5. General cleanup for human-readable property names (e.g. "lamp_type" -> "Lamp Type", "beamAngle" -> "Beam Angle")
  const words = key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim()
    .split(/\s+/);

  const titleCase = words
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

  return titleCase;
}
