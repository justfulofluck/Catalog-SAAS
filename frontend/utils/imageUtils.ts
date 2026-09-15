import { Product, Category } from '../types';

/**
 * Utility to normalize image URLs for canvas and browser display.
 * 
 * - Rewrites backend media URLs (e.g. http://127.0.0.1:8000/media/... or http://localhost:8000/media/...)
 *   to relative paths (/media/...) so requests use the same-origin Vite proxy without CORS issues.
 * - Replaces deprecated / 404 remote placeholder URLs with reliable working images.
 */
export function normalizeImageUrl(url?: string | null): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) return trimmed;

  // Handle broken / deprecated Unsplash image from old demo data
  if (trimmed.includes('photo-1540518614846-7ede433c4ef5')) {
    return 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=600';
  }

  // If URL points to backend media on localhost/127.0.0.1 or LAN IP, strip host to make it relative
  const mediaIdx = trimmed.indexOf('/media/');
  if (mediaIdx !== -1) {
    return trimmed.substring(mediaIdx);
  }

  return trimmed;
}

/**
 * Robustly resolves the best image to display for a product section in a grid or canvas.
 * Checks product image, gallery, custom fields, category thumbnail/images, sibling products, and fallback.
 */
export function resolveProductImage(
  product?: Partial<Product> | null,
  category?: Partial<Category> | null,
  categoryProducts?: Partial<Product>[] | null
): string {
  // 1. Direct product image
  if (product?.image && product.image.trim()) {
    return normalizeImageUrl(product.image);
  }

  // 2. Product images array
  if (product?.images && product.images.length > 0 && product.images[0]?.trim()) {
    return normalizeImageUrl(product.images[0]);
  }

  // 3. Product custom fields (scan for media paths or image URLs)
  if (product?.customFields) {
    const cfValues = Object.values(product.customFields);
    const foundImg = cfValues.find(
      val => typeof val === 'string' && (
        val.startsWith('/media') ||
        val.startsWith('http') ||
        val.startsWith('data:') ||
        val.toLowerCase().endsWith('.jpg') ||
        val.toLowerCase().endsWith('.jpeg') ||
        val.toLowerCase().endsWith('.png') ||
        val.toLowerCase().endsWith('.webp') ||
        val.toLowerCase().endsWith('.svg')
      )
    );
    if (foundImg) return normalizeImageUrl(foundImg as string);
  }

  // 4. Category thumbnail (the primary category image)
  if (category?.thumbnail && category.thumbnail.trim()) {
    return normalizeImageUrl(category.thumbnail);
  }

  // 5. Category images array
  if (category?.images && category.images.length > 0 && category.images[0]?.trim()) {
    return normalizeImageUrl(category.images[0]);
  }

  // 6. Category image alias
  if ((category as any)?.image && (category as any).image.trim()) {
    return normalizeImageUrl((category as any).image);
  }

  // 7. Sibling products from same category
  if (categoryProducts && categoryProducts.length > 0) {
    for (const sib of categoryProducts) {
      if (sib.image && sib.image.trim()) {
        return normalizeImageUrl(sib.image);
      }
      if (sib?.images && sib.images.length > 0 && sib.images[0]?.trim()) {
        return normalizeImageUrl(sib.images[0]);
      }
      if (sib?.customFields) {
        const found = Object.values(sib.customFields).find(
          val => typeof val === 'string' && (val.startsWith('/media') || val.startsWith('http'))
        );
        if (found) return normalizeImageUrl(found as string);
      }
    }
  }

  // 8. Elegant fallback placeholder
  return 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=600';
}

/**
 * Returns the exact real thumbnail URL for a product without fallback placeholders.
 * Checks product.image, product.images array, customFields image keys, and variant images.
 */
export function getProductThumbnailUrl(product?: Partial<Product> | any | null): string {
  if (!product) return '';
  if (product.image && typeof product.image === 'string' && product.image.trim()) {
    return normalizeImageUrl(product.image);
  }
  if (product.images && Array.isArray(product.images) && product.images.length > 0 && product.images[0]) {
    return normalizeImageUrl(product.images[0]);
  }
  if (product.customFields && typeof product.customFields === 'object') {
    const cfValues = Object.values(product.customFields);
    const foundImg = cfValues.find(
      (val: any) => typeof val === 'string' && (
        val.startsWith('/media') ||
        val.startsWith('http') ||
        val.startsWith('data:') ||
        val.startsWith('blob:') ||
        /\.(jpg|jpeg|png|webp|svg|gif|avif)/i.test(val)
      )
    );
    if (foundImg) return normalizeImageUrl(foundImg as string);
  }
  if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
    const varWithImg = product.variants.find((v: any) => v.image && typeof v.image === 'string' && v.image.trim());
    if (varWithImg) return normalizeImageUrl(varWithImg.image);
  }
  return '';
}


