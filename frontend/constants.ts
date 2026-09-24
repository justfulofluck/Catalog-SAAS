import { FullCatalogTemplate, GridTemplate, PageTemplate, Theme, HeaderFooterTemplate, FormField } from './types';

// A4 proportions at 96 DPI
export const PAGE_WIDTH = 794;
export const PAGE_HEIGHT = 1123;

export const HEADER_FOOTER_HEIGHT = 38;
export const PX_PER_MM = 3.78; // Standard 96 DPI conversion (25.4 mm = 96 px)

export const DEFAULT_CATEGORY_SCHEMA: FormField[] = [
  // Basic Fields
  { id: 'prod_name', label: 'Product Name', type: 'text', section: 'basic', required: true },

  // Technical Specs
  { id: 'model_no', label: 'Model Number', type: 'text', section: 'technical', required: false },
  
  // Commercial Info
  { id: 'mrp', label: 'MRP', type: 'number', section: 'commercial', required: false },
];

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
];

export const INITIAL_PRODUCTS: any[] = [];

import { ALL_FONTS, CATEGORIZED_FONTS } from './fonts';

export const FONTS = ALL_FONTS;
export { CATEGORIZED_FONTS };

export const THEMES: Theme[] = [
  {
    id: 'default',
    name: 'Default Clean',
    backgroundColor: '#ffffff',
    headingColor: '#0f172a',
    bodyColor: '#64748b',
    accentColor: '#0F3D3E',
    fontFamily: 'Inter',
    headingFont: 'Inter',
    preview: ['#ffffff', '#0f172a', '#0F3D3E']
  }
];

export const FULL_CATALOG_TEMPLATES: FullCatalogTemplate[] = [];
export const GRID_TEMPLATES: GridTemplate[] = [];
export const COVER_TEMPLATES: PageTemplate[] = [];
export const INDEX_TEMPLATES: PageTemplate[] = [];
export const CLOSING_TEMPLATES: PageTemplate[] = [];
export const HEADER_TEMPLATES: HeaderFooterTemplate[] = [];
export const FOOTER_TEMPLATES: HeaderFooterTemplate[] = [];
