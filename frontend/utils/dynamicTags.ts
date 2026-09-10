export interface DynamicTagContext {
  pageNumber?: number;
  totalPages?: number;
  catalogName?: string;
  categoryName?: string;
  companyName?: string;
  year?: number | string;
}

/**
 * Replace dynamic smart tags in text like {{page_number}}, {{total_pages}},
 * {{catalog_name}}, {{category_name}}, {{company_name}}, {{current_year}}.
 */
export function resolveDynamicText(text: string | undefined | null, context: DynamicTagContext): string {
  if (!text) return '';
  let result = text;
  const pNum = String(context.pageNumber ?? 1);
  const totalP = String(context.totalPages ?? 1);
  const catName = context.catalogName || 'Catalog';
  const categoryName = context.categoryName || '';
  const compName = context.companyName || '';
  const yr = String(context.year ?? new Date().getFullYear());

  return result
    .replace(/\{\{page_number\}\}/gi, pNum)
    .replace(/\{\{page\}\}/gi, pNum)
    .replace(/\{\{current_page\}\}/gi, pNum)
    .replace(/\{\{total_pages\}\}/gi, totalP)
    .replace(/\{\{totalPages\}\}/gi, totalP)
    .replace(/\{\{catalog_name\}\}/gi, catName)
    .replace(/\{\{catalog\}\}/gi, catName)
    .replace(/\{\{category_name\}\}/gi, categoryName)
    .replace(/\{\{category\}\}/gi, categoryName)
    .replace(/\{\{company_name\}\}/gi, compName)
    .replace(/\{\{company\}\}/gi, compName)
    .replace(/\{\{current_year\}\}/gi, yr)
    .replace(/\{\{year\}\}/gi, yr);
}

/**
 * Determine the most accurate category name for a catalog page.
 */
export function getPageCategoryName(
  page: any,
  categories: Array<{ id: string | number; name: string }> = [],
  products: Array<{ id: string; categoryId?: string | number }> = [],
  catalog?: any
): string {
  if (!page) return catalog?.category || '';

  // 1. Direct categoryId on page
  if (page.categoryId) {
    const found = categories.find(c => String(c.id) === String(page.categoryId));
    if (found?.name) return found.name;
  }

  // 2. Element product category
  if (Array.isArray(page.elements)) {
    for (const el of page.elements) {
      if (el.productId) {
        const prod = products.find(p => p.id === el.productId);
        if (prod?.categoryId) {
          const found = categories.find(c => String(c.id) === String(prod.categoryId));
          if (found?.name) return found.name;
        }
      }
    }
  }

  // 3. Fallback
  return catalog?.category || '';
}
