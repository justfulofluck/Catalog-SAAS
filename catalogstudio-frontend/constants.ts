
import { FullCatalogTemplate, GridTemplate, PageTemplate, Theme } from './types';

// A4 proportions at 96 DPI
export const PAGE_WIDTH = 794;
export const PAGE_HEIGHT = 1123;

export const HEADER_FOOTER_HEIGHT = 38;

export const SHAPE_ASSETS = {
  triangle: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHBhdGggZD0iTSA1MCA1IEwgOTUgOTUgTCA1IDk1IFoiIGZpbGw9IiNjYmQ1ZTEiLz48L3N2Zz4=',
  star: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHBhdGggZD0iTSA1MCA1IEwgNjMgMzggTCA5OCAzOCBMIDcwIDU5IEwgODEgOTIgTCA1MCA3MiBMIDE5IDkyIEwgMzAgNTkgTCAyIDM4IEwgMzcgMzggWiIgZmlsbD0iI2NiZDVlMSIvPjwvc3ZnPg=='
};

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
];

export const INITIAL_PRODUCTS: any[] = [
  {
    id: 'p1',
    name: 'Modern Nordic Chair',
    sku: 'CHR-001',
    price: 129.0,
    currency: '$',
    description: 'Minimalist wooden chair with ergonomic design.',
    image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'p2',
    name: 'Minimalist Desk Lamp',
    sku: 'LMP-202',
    price: 45.5,
    currency: '$',
    description: 'Adjustable LED lamp with warm light settings.',
    image: 'https://images.unsplash.com/photo-1534073828943-f801091bb18c?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'p3',
    name: 'Ceramic Vase Set',
    sku: 'VSE-99',
    price: 89.0,
    currency: '$',
    description: 'Handcrafted matte finish ceramic vases.',
    image: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'p4',
    name: 'Velvet Sofa Green',
    sku: 'SOF-404',
    price: 899.0,
    currency: '$',
    description: 'Luxurious green velvet sofa with gold legs.',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'p5',
    name: 'Oak Dining Table',
    sku: 'TBL-505',
    price: 550.0,
    currency: '$',
    description: 'Solid oak dining table for 6 people.',
    image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'p6',
    name: 'Industrial Bookshelf',
    sku: 'BSH-606',
    price: 210.0,
    currency: '$',
    description: 'Steel and wood industrial style bookshelf.',
    image: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?auto=format&fit=crop&q=80&w=400'
  }
];

export const FONTS = [
  'Inter',
  'Roboto',
  'Playfair Display',
  'Montserrat',
  'Open Sans',
  'Lato',
  'Poppins',
  'Source Sans Pro',
  'Merriweather',
  'PT Serif',
  'Lora',
  'Quicksand',
  'Nunito',
  'Karla',
  'Inconsolata'
];

export const THEMES: Theme[] = [
  {
    id: 'default',
    name: 'Corporate Clean',
    backgroundColor: '#ffffff',
    headingColor: '#0f172a',
    bodyColor: '#64748b',
    accentColor: '#4f46e5',
    fontFamily: 'Inter',
    headingFont: 'Inter',
    preview: ['#ffffff', '#0f172a', '#4f46e5']
  },
  {
    id: 'nordic-minimal',
    name: 'Nordic Editorial',
    backgroundColor: '#f8fafc',
    headingColor: '#000000',
    bodyColor: '#475569',
    accentColor: '#94a3b8',
    fontFamily: 'Inter',
    headingFont: 'Playfair Display',
    preview: ['#f8fafc', '#000000', '#94a3b8']
  },
  {
    id: 'dark-luxury',
    name: 'Boutique Noir',
    backgroundColor: '#111827',
    headingColor: '#f8fafc',
    bodyColor: '#94a3b8',
    accentColor: '#fbbf24',
    fontFamily: 'Montserrat',
    headingFont: 'Playfair Display',
    preview: ['#111827', '#f8fafc', '#fbbf24']
  },
  {
    id: 'tech-industrial',
    name: 'Swiss Tech',
    backgroundColor: '#ffffff',
    headingColor: '#000000',
    bodyColor: '#1e293b',
    accentColor: '#ef4444',
    fontFamily: 'Inter',
    headingFont: 'Montserrat',
    preview: ['#ffffff', '#000000', '#ef4444']
  }
];

export const FULL_CATALOG_TEMPLATES: FullCatalogTemplate[] = [
  {
    id: 'tpl-nordic',
    name: 'Nordic Living 2025',
    description: 'Clean, editorial aesthetic with functional product grids. Ready for data populating.',
    thumbnail: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=400',
    themeId: 'nordic-minimal',
    pages: [
      {
        pageNumber: 1,
        elements: [
          { id: 't1-p1-bg', type: 'shape', x: 0, y: 0, width: 794, height: 1123, fill: '#f8fafc', zIndex: 0, rotation: 0, opacity: 1 },
          { id: 't1-p1-img', type: 'image', x: 80, y: 80, width: 634, height: 550, src: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=800', zIndex: 1, rotation: 0, opacity: 1 },
          { id: 't1-p1-title', type: 'text', x: 80, y: 660, width: 634, height: 120, text: 'NORDIC\nCOLLECTION', fontSize: 72, fontFamily: 'Playfair Display', fontWeight: '900', fill: '#000000', zIndex: 2, rotation: 0, opacity: 1 },
          { id: 't1-p1-line', type: 'shape', x: 80, y: 645, width: 120, height: 4, fill: '#000000', zIndex: 4, rotation: 0, opacity: 1 },
          { id: 't1-p1-desc', type: 'text', x: 80, y: 820, width: 420, height: 60, text: 'Sustainable design meets modern craftsmanship in our latest global exhibition.', fontSize: 16, fontFamily: 'Inter', fill: '#475569', zIndex: 3, rotation: 0, opacity: 1 }
        ]
      },
      {
        pageNumber: 2,
        elements: [
          { id: 't1-p2-bg', type: 'shape', x: 0, y: 0, width: 794, height: 1123, fill: '#ffffff', zIndex: 0, rotation: 0, opacity: 1 },
          { id: 't1-p2-title', type: 'text', x: 60, y: 80, width: 674, height: 40, text: 'MODERN ESSENTIALS', fontSize: 28, fontFamily: 'Playfair Display', fontWeight: '900', fill: '#000000', zIndex: 1, rotation: 0, opacity: 1 },
          { id: 'gen-slot-0', type: 'shape', x: 60, y: 160, width: 320, height: 420, fill: '#f1f5f9', opacity: 1, zIndex: 0, rotation: 0 },
          { id: 't1-p2-s1-msg', type: 'text', x: 60, y: 350, width: 320, height: 20, text: 'DROP PRODUCT HERE', fontSize: 10, fontFamily: 'Inter', fontWeight: '900', textAlign: 'center', fill: '#94a3b8', zIndex: 1, rotation: 0, opacity: 1 }
        ]
      }
    ]
  }
];

export const GRID_TEMPLATES: GridTemplate[] = [
  { id: '1x1-s', name: 'Hero Spotlight', cols: 1, rows: 1, padding: 60, spacing: 0, arrangement: 'stacked', group: '1x1' },
  { id: '2x2-s', name: 'Grid 2x2: Stacked', cols: 2, rows: 2, padding: 50, spacing: 30, arrangement: 'stacked', group: '2x2' },
  { id: '3x3-s', name: 'Grid 3x3: Stacked', cols: 3, rows: 3, padding: 30, spacing: 20, arrangement: 'stacked', group: '3x3' },
  { id: '4x4-s', name: 'Grid 4x4: Stacked', cols: 4, rows: 4, padding: 20, spacing: 15, arrangement: 'stacked', group: '4x4' },

  // High-End Themed Layouts (Inspired by Screenshots)
  {
    id: 'vogue-strip',
    name: 'Vogue Boutique Strip',
    cols: 1,
    rows: 3,
    padding: 80,
    spacing: 50,
    arrangement: 'row',
    group: 'Premium',
    cardTheme: 'split-row',
    backgroundColor: '#1e1b4b',
    decorations: [
      { type: 'shape', shapeType: 'rect', x: 0, y: 0, width: 150, height: 1123, fill: '#1e1b4b', zIndex: -1 },
      { type: 'shape', shapeType: 'rect', x: 644, y: 0, width: 150, height: 1123, fill: '#1e1b4b', zIndex: -1 },
      { type: 'shape', shapeType: 'rect', x: 150, y: 0, width: 494, height: 1123, fill: '#fbbf24', zIndex: -2 },
    ]
  },
  {
    id: 'earthbound-sheet',
    name: 'Earthbound Line Sheet',
    cols: 2,
    rows: 4,
    padding: 40,
    spacing: 20,
    arrangement: 'stacked',
    group: 'Premium',
    cardTheme: 'classic-stack',
    backgroundColor: '#e3d5ca',
    decorations: [
      { type: 'shape', shapeType: 'rect', x: 0, y: 0, width: 794, height: 1123, fill: '#e3d5ca', zIndex: -1 },
      { type: 'shape', shapeType: 'rect', x: 40, y: 40, width: 714, height: 2, fill: '#4a3f35', zIndex: 0, opacity: 0.2 },
      { type: 'text', x: 40, y: 15, width: 714, height: 20, text: 'AUTUMN WINTER COLLECTION // CURATED ASSETS', fontSize: 9, fontWeight: '900', fill: '#4a3f35', textAlign: 'center', letterSpacing: 4, zIndex: 5 }
    ]
  }
];

export const COVER_TEMPLATES: PageTemplate[] = [
  {
    id: 'modern-apex',
    name: 'Apex Portfolio',
    description: 'Centered typographic hierarchy with a large hero image frame.',
    elements: [
      { type: 'shape', x: 0, y: 0, width: 794, height: 1123, fill: '#ffffff', zIndex: 0 },
      { type: 'image', x: 0, y: 0, width: 794, height: 650, src: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800', zIndex: 1 },
      { type: 'text', x: 80, y: 720, width: 634, height: 120, text: 'PRODUCT\nCOLLECTION', fontSize: 72, fontWeight: '900', zIndex: 2 },
      { type: 'text', x: 80, y: 880, width: 634, height: 40, text: 'Curated Excellence for Modern Spaces', fontSize: 18, fontWeight: '400', zIndex: 3 },
      { type: 'shape', x: 80, y: 690, width: 80, height: 6, fill: '#337ab7', zIndex: 4 },
      { type: 'text', x: 80, y: 1020, width: 200, height: 20, text: 'CATALOG 2025', fontSize: 12, fontWeight: 'bold', zIndex: 5, opacity: 0.5 }
    ]
  }
];

export const INDEX_TEMPLATES: PageTemplate[] = [
  {
    id: 'minimal-index',
    name: 'Standard TOC',
    description: 'Minimalist list layout for catalog navigation.',
    elements: [
      { type: 'text', x: 80, y: 100, width: 634, height: 60, text: 'CONTENTS', fontSize: 48, fontWeight: '900', zIndex: 1 },
      { type: 'shape', x: 80, y: 170, width: 634, height: 2, fill: '#0f172a', zIndex: 0 },
      { type: 'text', x: 80, y: 220, width: 500, height: 30, text: '01. BRAND STORY', fontSize: 14, fontWeight: '700', zIndex: 2 },
      { type: 'text', x: 650, y: 220, width: 50, height: 30, text: '04', fontSize: 14, fontWeight: '700', textAlign: 'right', zIndex: 3 }
    ]
  }
];

export const CLOSING_TEMPLATES: PageTemplate[] = [
  {
    id: 'contact-outro',
    name: 'Corporate Outro',
    description: 'Final page with contact info and brand sign-off.',
    elements: [
      { type: 'shape', x: 0, y: 0, width: 794, height: 1123, fill: '#0f172a', zIndex: 0 },
      { type: 'text', x: 0, y: 450, width: 794, height: 60, text: 'THANK YOU', fontSize: 64, fontWeight: '900', fill: '#ffffff', textAlign: 'center', zIndex: 1 },
      { type: 'text', x: 100, y: 530, width: 594, height: 40, text: 'For inquiries, contact our sales department', fontSize: 14, fontWeight: '400', fill: '#94a3b8', textAlign: 'center', zIndex: 2 }
    ]
  }
];

export const CATEGORY_THUMBNAILS: Record<string, string> = {
  'Furniture': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=400',
  'Lighting': 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?auto=format&fit=crop&q=80&w=400',
  'Accessories': 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&q=80&w=400',
  'Business Essentials': 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=400',
  'Personalized Printings': 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=400'
};
