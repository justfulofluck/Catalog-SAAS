
import { FullCatalogTemplate, GridTemplate, PageTemplate, Theme, HeaderFooterTemplate } from './types';

// A4 proportions at 96 DPI
export const PAGE_WIDTH = 794;
export const PAGE_HEIGHT = 1123;

export const HEADER_FOOTER_HEIGHT = 38;
export const PX_PER_MM = 3.78; // Standard 96 DPI conversion (25.4 mm = 96 px)

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
  },
  {
    id: 'v-tac-theme',
    name: 'V-TAC Industrial Green',
    backgroundColor: '#013946',
    headingColor: '#ffffff',
    bodyColor: '#e2e8f0',
    accentColor: '#00a651',
    fontFamily: 'Inter',
    headingFont: 'Montserrat',
    preview: ['#013946', '#00a651', '#ffffff']
  }
];

export const FULL_CATALOG_TEMPLATES: FullCatalogTemplate[] = [
  {
    id: 'tpl-v-tac',
    name: 'V-TAC Professional 2025',
    description: 'Distinctive diagonal split industrial lighting catalog with geometric imagery and bold typography.',
    thumbnail: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=400',
    themeId: 'v-tac-theme',
    pages: [
      {
        pageNumber: 1,
        type: 'cover',
        elements: [
          // Dark Teal Background
          { id: 'vt-c-bg', type: 'shape', x: 0, y: 0, width: 794, height: 1123, fill: '#023842', zIndex: 0 },
          // Diamond / Multi-angle Image Layout Showcase
          { id: 'vt-c-img-hero', type: 'image', x: 15, y: 15, width: 440, height: 430, src: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=800', zIndex: 1 },
          { id: 'vt-c-img-garden', type: 'image', x: 420, y: 220, width: 360, height: 570, src: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=800', zIndex: 1 },
          { id: 'vt-c-img-arch', type: 'image', x: 340, y: 160, width: 230, height: 210, src: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=600', zIndex: 2 },
          { id: 'vt-c-img-hall', type: 'image', x: 230, y: 280, width: 240, height: 250, src: 'https://images.unsplash.com/photo-1540518614846-7ede433c4ef5?auto=format&fit=crop&q=80&w=600', zIndex: 2 },
          // V-TAC Logo & Slogan in Top Right
          { id: 'vt-c-logo', type: 'text', x: 460, y: 35, width: 220, height: 60, text: 'V-TAC', fontSize: 56, fontFamily: 'Montserrat', fontWeight: '900', fill: '#00a651', letterSpacing: 2, zIndex: 3 },
          { id: 'vt-c-slogan', type: 'text', x: 530, y: 95, width: 200, height: 25, text: 'Meaningful Innovation.', fontSize: 15, fontFamily: 'Inter', fontWeight: '700', fill: '#ffffff', zIndex: 3 },
          // Vibrant Emerald Green Lower Half Polygon Block
          { id: 'vt-c-green-banner', type: 'shape', x: 0, y: 470, width: 794, height: 653, fill: '#00a651', zIndex: 3 },
          // Main Headline
          { id: 'vt-c-intro', type: 'text', x: 40, y: 690, width: 260, height: 32, text: 'INTRODUCING', fontSize: 24, fontFamily: 'Montserrat', fontWeight: '900', fill: '#ffffff', letterSpacing: 1, zIndex: 4 },
          { id: 'vt-c-sub', type: 'text', x: 40, y: 728, width: 340, height: 32, text: 'OUR NEW RANGE OF', fontSize: 24, fontFamily: 'Montserrat', fontWeight: '900', fill: '#ffffff', letterSpacing: 1, zIndex: 4 },
          { id: 'vt-c-brand', type: 'text', x: 40, y: 770, width: 440, height: 48, text: 'V-TAC LED LIGHTS', fontSize: 38, fontFamily: 'Montserrat', fontWeight: '900', fill: '#ffffff', letterSpacing: 0.5, zIndex: 4 },
          // Bullet Highlights List
          { id: 'vt-c-list', type: 'text', x: 40, y: 835, width: 420, height: 180, text: '•   Bling Series COB range\n•   Smart lighting & sensors\n•   Mirror lights & Picture lights\n•   Designer wall lights\n•   Designer Table lamps\n•   LED Solar items', fontSize: 17, fontFamily: 'Inter', fontWeight: '700', lineHeight: 1.6, fill: '#023842', zIndex: 4 },
          // Year Badge
          { id: 'vt-c-year', type: 'text', x: 40, y: 1025, width: 145, height: 60, text: '2025', fontSize: 52, fontFamily: 'Montserrat', fontWeight: '900', fill: '#ffffff', letterSpacing: 1, zIndex: 4 }
        ]
      },
      {
        pageNumber: 2,
        type: 'product',
        elements: [
          // Header Logo & Page Tag
          { id: 'vt-p2-logo', type: 'text', x: 45, y: 25, width: 260, height: 42, text: 'V-TAC', fontSize: 38, fontFamily: 'Montserrat', fontWeight: '900', fill: '#00a651', letterSpacing: 2, zIndex: 10 },
          { id: 'vt-p2-slogan', type: 'text', x: 105, y: 68, width: 220, height: 20, text: 'Meaningful Innovation.', fontSize: 13, fontFamily: 'Inter', fontWeight: '700', fill: '#023842', zIndex: 10 },
          { id: 'vt-p2-page-tag-bg', type: 'shape', x: 335, y: 55, width: 414, height: 26, fill: '#00a651', zIndex: 8 },
          { id: 'vt-p2-page-tag-bar', type: 'shape', x: 350, y: 75, width: 399, height: 10, fill: '#002b36', zIndex: 9 },
          { id: 'vt-p2-page-num', type: 'text', x: 670, y: 58, width: 70, height: 20, text: 'PAGE -6', fontSize: 12, fontFamily: 'Montserrat', fontWeight: '900', fill: '#ffffff', zIndex: 10 },

          // --- SECTION 1: DELTA GOLD COB ---
          { id: 'vt-p2-img-1', type: 'image', x: 45, y: 130, width: 250, height: 210, src: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=600', zIndex: 2 },
          { id: 'vt-p2-title-1', type: 'text', x: 380, y: 140, width: 370, height: 35, text: 'DELTA GOLD COB', fontSize: 26, fontFamily: 'Montserrat', fontWeight: '900', fill: '#00a651', letterSpacing: 0.5, zIndex: 3 },
          {
            id: 'vt-p2-table-1',
            type: 'table',
            x: 380,
            y: 180,
            width: 370,
            height: 95,
            zIndex: 4,
            rotation: 0,
            opacity: 1,
            tableData: {
              headers: ['MODEL NO', 'PRODUCTS', 'CUT-OUT', 'COLOR', 'DEALER PRICE', 'PACKING PER BOX'],
              rows: [
                ['VT-2612', '12W V-TAC COB WHITE BODY', '75MM', 'W, W.W, N.W', '580', '20 PCS'],
                ['VT-2612', '12W VTAC 3IN1 ON SWITCH', '75MM', 'W, W.W, N.W', '1,000', '20 PCS'],
                ['VT-2612', '12W V-TAC COB DIMMABLE', '75MM', 'W, W.W, N.W', '1,500', '20 PCS']
              ],
              headerBg: '#002b36',
              headerTextColor: '#ffffff',
              alternateRowBg: '#f8fafc',
              rowBg: '#ffffff',
              borderColor: '#002b36',
              fontSize: 7.5,
              headerFontSize: 8,
              cellPadding: 4,
              colWidths: [60, 140, 50, 60, 50, 55]
            }
          },
          { id: 'vt-p2-specs-1', type: 'text', x: 380, y: 285, width: 240, height: 50, text: 'AVAILABLE IN : CCT, TUNEABLE AND DIMMABLE OPTIONS\nREFLECTOR OPTIONS : WHITE, BLACK, ROSE GOLD, GUN BLACK, SILVER\nBODY : WHITE & BLACK', fontSize: 7.5, fontFamily: 'Inter', fontWeight: '800', lineHeight: 1.3, fill: '#002b36', zIndex: 3 },

          // --- SECTION 2: SLIM COMMERCIAL COB ---
          { id: 'vt-p2-divider-1', type: 'shape', x: 45, y: 390, width: 704, height: 1, fill: '#e2e8f0', zIndex: 1 },
          { id: 'vt-p2-img-2', type: 'image', x: 45, y: 430, width: 260, height: 180, src: 'https://images.unsplash.com/photo-1540518614846-7ede433c4ef5?auto=format&fit=crop&q=80&w=600', zIndex: 2 },
          { id: 'vt-p2-title-2', type: 'text', x: 380, y: 420, width: 370, height: 35, text: 'SLIM COMMERCIAL COB', fontSize: 26, fontFamily: 'Montserrat', fontWeight: '900', fill: '#00a651', letterSpacing: 0.5, zIndex: 3 },
          {
            id: 'vt-p2-table-2',
            type: 'table',
            x: 380,
            y: 460,
            width: 370,
            height: 95,
            zIndex: 4,
            rotation: 0,
            opacity: 1,
            tableData: {
              headers: ['MODEL NO', 'PRODUCTS', 'CUT-OUT', 'COLOR', 'DEALER PRICE', 'PACKING PER BOX'],
              rows: [
                ['VT-2711', '10W V-TAC COB FITTING', '80MM', 'W, W.W, N.W', '750', '40 PCS'],
                ['VT-2722', '20W V-TAC COB FITTING', '145MM', 'W, W.W, N.W', '1,400', '20 PCS'],
                ['VT-2730', '30W V-TAC COB FITTING', '205MM', 'W, W.W, N.W', '1,950', '10 PCS']
              ],
              headerBg: '#002b36',
              headerTextColor: '#ffffff',
              alternateRowBg: '#f8fafc',
              rowBg: '#ffffff',
              borderColor: '#002b36',
              fontSize: 7.5,
              headerFontSize: 8,
              cellPadding: 4,
              colWidths: [60, 140, 50, 60, 50, 55]
            }
          },

          // --- SECTION 3: COB DOWNLIGHTER ---
          { id: 'vt-p2-divider-2', type: 'shape', x: 45, y: 670, width: 704, height: 1, fill: '#e2e8f0', zIndex: 1 },
          { id: 'vt-p2-img-3', type: 'image', x: 45, y: 700, width: 260, height: 230, src: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=600', zIndex: 2 },
          { id: 'vt-p2-title-3', type: 'text', x: 380, y: 690, width: 370, height: 35, text: 'COB DOWNLIGHTER', fontSize: 26, fontFamily: 'Montserrat', fontWeight: '900', fill: '#00a651', letterSpacing: 0.5, zIndex: 3 },
          {
            id: 'vt-p2-table-3',
            type: 'table',
            x: 380,
            y: 730,
            width: 370,
            height: 95,
            zIndex: 4,
            rotation: 0,
            opacity: 1,
            tableData: {
              headers: ['MODEL NO', 'PRODUCTS', 'CUT-OUT', 'COLOR', 'DEALER PRICE', 'PACKING PER BOX'],
              rows: [
                ['VT-40', '40W SAMSUNG COB', '-', 'W, N.W, W.W', '2,800', '10 PCS'],
                ['VT-50', '50W SAMSUNG COB', '200MM', 'W, N.W, W.W', '3,000', '10 PCS'],
                ['VT-60', '60W SAMSUNG COB', '208MM', 'W, N.W, W.W', '3,600', '10 PCS']
              ],
              headerBg: '#002b36',
              headerTextColor: '#ffffff',
              alternateRowBg: '#f8fafc',
              rowBg: '#ffffff',
              borderColor: '#002b36',
              fontSize: 7.5,
              headerFontSize: 8,
              cellPadding: 4,
              colWidths: [60, 140, 50, 60, 50, 55]
            }
          },

          // Footer Bar
          { id: 'vt-p2-footer-bar', type: 'shape', x: 0, y: 1060, width: 794, height: 63, fill: '#002b36', zIndex: 5 },
          { id: 'vt-p2-footer-web', type: 'text', x: 550, y: 1080, width: 200, height: 25, text: 'VTACEXPORTS.COM', fontSize: 13, fontFamily: 'Montserrat', fontWeight: '900', fill: '#ffffff', letterSpacing: 1, zIndex: 6 }
        ]
      }
    ]
  },
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
  },
  {
    id: 'tpl-blank',
    name: 'Blank Custom Architecture',
    description: 'Clean start with 4 foundational blank pages: Blank Cover, Blank Index, Blank Product Page, and Blank Outro / Ending Page.',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400',
    themeId: 'default',
    pages: [
      {
        pageNumber: 1,
        type: 'cover',
        elements: []
      },
      {
        pageNumber: 2,
        type: 'index',
        elements: []
      },
      {
        pageNumber: 3,
        type: 'product',
        elements: []
      },
      {
        pageNumber: 4,
        type: 'closing',
        elements: []
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
  },
  {
    id: 'vtac-lighting-sheet',
    name: 'V-TAC Spec Sheet Grid (2x3)',
    cols: 2,
    rows: 3,
    padding: 35,
    spacing: 20,
    arrangement: 'row',
    group: 'Premium',
    cardTheme: 'minimal-pill',
    backgroundColor: '#ffffff'
  }
];

export const COVER_TEMPLATES: PageTemplate[] = [
  {
    id: 'vtac-led-cover-2025',
    name: 'V-TAC LED Lights 2025',
    description: 'Modern industrial lighting cover with geometric diagonal multi-image layout and brand highlights.',
    elements: [
      // Dark Teal Background
      { type: 'shape', x: 0, y: 0, width: 794, height: 1123, fill: '#023842', zIndex: 0 },
      // Multi-image layout with modern lighting architecture
      { type: 'image', x: 15, y: 15, width: 440, height: 430, src: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=800', zIndex: 1 },
      { type: 'image', x: 420, y: 220, width: 360, height: 570, src: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=800', zIndex: 1 },
      { type: 'image', x: 340, y: 160, width: 230, height: 210, src: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=600', zIndex: 2 },
      { type: 'image', x: 230, y: 280, width: 240, height: 250, src: 'https://images.unsplash.com/photo-1540518614846-7ede433c4ef5?auto=format&fit=crop&q=80&w=600', zIndex: 2 },
      // V-TAC Logo & Slogan in Top Right
      { type: 'text', x: 460, y: 35, width: 220, height: 60, text: 'V-TAC', fontSize: 56, fontFamily: 'Montserrat', fontWeight: '900', fill: '#00a651', letterSpacing: 2, zIndex: 3 },
      { type: 'text', x: 530, y: 95, width: 200, height: 25, text: 'Meaningful Innovation.', fontSize: 15, fontFamily: 'Inter', fontWeight: '700', fill: '#ffffff', zIndex: 3 },
      // Vibrant Emerald Green Lower Half Polygon Block
      { type: 'shape', x: 0, y: 470, width: 794, height: 653, fill: '#00a651', zIndex: 3 },
      // Main Headline
      { type: 'text', x: 40, y: 690, width: 260, height: 32, text: 'INTRODUCING', fontSize: 24, fontFamily: 'Montserrat', fontWeight: '900', fill: '#ffffff', letterSpacing: 1, zIndex: 4 },
      { type: 'text', x: 40, y: 728, width: 340, height: 32, text: 'OUR NEW RANGE OF', fontSize: 24, fontFamily: 'Montserrat', fontWeight: '900', fill: '#ffffff', letterSpacing: 1, zIndex: 4 },
      { type: 'text', x: 40, y: 770, width: 440, height: 48, text: 'V-TAC LED LIGHTS', fontSize: 38, fontFamily: 'Montserrat', fontWeight: '900', fill: '#ffffff', letterSpacing: 0.5, zIndex: 4 },
      // Bullet Highlights List
      { type: 'text', x: 40, y: 835, width: 420, height: 180, text: '•   Bling Series COB range\n•   Smart lighting & sensors\n•   Mirror lights & Picture lights\n•   Designer wall lights\n•   Designer Table lamps\n•   LED Solar items', fontSize: 17, fontFamily: 'Inter', fontWeight: '700', lineHeight: 1.6, fill: '#023842', zIndex: 4 },
      // Year Badge
      { type: 'text', x: 40, y: 1025, width: 145, height: 60, text: '2025', fontSize: 52, fontFamily: 'Montserrat', fontWeight: '900', fill: '#ffffff', letterSpacing: 1, zIndex: 4 }
    ]
  },
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
      { type: 'text', x: 80, y: 160, width: 634, height: 60, text: 'INDEX', fontSize: 52, fontWeight: '900', zIndex: 1 },
      { type: 'shape', x: 80, y: 235, width: 100, height: 8, fill: '#6366f1', zIndex: 0 },
      { type: 'text', x: 80, y: 330, width: 500, height: 30, text: '01. BRAND STORY', fontSize: 14, fontWeight: '700', zIndex: 2 },
      { type: 'text', x: 650, y: 330, width: 50, height: 30, text: '04', fontSize: 14, fontWeight: '700', textAlign: 'right', zIndex: 3 },
      { id: 'sep-1', type: 'shape', x: 80, y: 370, width: 634, height: 1, fill: '#000000', opacity: 0.1, zIndex: 0 }
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

export const HEADER_TEMPLATES: HeaderFooterTemplate[] = [
  {
    id: 'hdr-corporate-split',
    name: 'Corporate Minimal Split',
    description: 'Brand title left, category/date right with subtle bottom border.',
    type: 'header',
    height: 38,
    previewText: 'COMPANY CATALOG 2026  |  COLLECTION',
    elements: [
      { id: 'hdr-line', type: 'shape', x: 40, y: 36, width: 714, height: 1, fill: '#cbd5e1', zIndex: 1 },
      { id: 'hdr-left', type: 'text', x: 40, y: 10, width: 350, height: 20, text: 'COMPANY CATALOG 2026', fontSize: 10, fontWeight: '800', fill: '#1e293b', letterSpacing: 1, zIndex: 2 },
      { id: 'hdr-right', type: 'text', x: 400, y: 10, width: 354, height: 20, text: 'PREMIUM SELECTION', fontSize: 9, fontWeight: '600', fill: '#64748b', textAlign: 'right', letterSpacing: 1, zIndex: 2 }
    ]
  },
  {
    id: 'hdr-vtac-dark-bar',
    name: 'Industrial Dark Ribbon',
    description: 'High-contrast bold banner with series title and website URL.',
    type: 'header',
    height: 46,
    previewText: 'CRETA SERIES // COB DOWNLIGHT  |  VTACEXPORTS.COM',
    elements: [
      { id: 'hdr-bg', type: 'shape', x: 0, y: 0, width: 794, height: 44, fill: '#0f172a', zIndex: 0 },
      { id: 'hdr-accent', type: 'shape', x: 0, y: 44, width: 794, height: 2, fill: '#38bdf8', zIndex: 1 },
      { id: 'hdr-title', type: 'text', x: 35, y: 12, width: 450, height: 24, text: 'CRETA SERIES // COB DOWNLIGHTER', fontSize: 12, fontWeight: '900', fill: '#ffffff', letterSpacing: 2, zIndex: 2 },
      { id: 'hdr-url', type: 'text', x: 500, y: 14, width: 259, height: 20, text: 'VTACEXPORTS.COM', fontSize: 10, fontWeight: 'bold', fill: '#38bdf8', textAlign: 'right', zIndex: 2 }
    ]
  },
  {
    id: 'hdr-center-editorial',
    name: 'Editorial Vogue Center',
    description: 'Refined serif centered title with delicate accent bar.',
    type: 'header',
    height: 38,
    previewText: '— THE EDITORIAL LOOKBOOK —',
    elements: [
      { id: 'hdr-center', type: 'text', x: 40, y: 10, width: 714, height: 20, text: '— THE EDITORIAL LOOKBOOK —', fontSize: 11, fontFamily: 'Playfair Display', fontWeight: 'bold', fill: '#475569', textAlign: 'center', letterSpacing: 3, zIndex: 2 }
    ]
  }
];

export const FOOTER_TEMPLATES: HeaderFooterTemplate[] = [
  {
    id: 'ftr-standard-b2b',
    name: 'B2B Standard Page Counter',
    description: 'Confidentiality notice on the left, dynamic page number on the right.',
    type: 'footer',
    height: 38,
    previewText: 'Proprietary & Confidential  |  Page {{page}}',
    elements: [
      { id: 'ftr-line', type: 'shape', x: 40, y: 4, width: 714, height: 1, fill: '#e2e8f0', zIndex: 1 },
      { id: 'ftr-left', type: 'text', x: 40, y: 14, width: 350, height: 20, text: 'Proprietary & Confidential', fontSize: 9, fontWeight: 'normal', fill: '#94a3b8', zIndex: 2 },
      { id: 'ftr-right', type: 'text', x: 400, y: 14, width: 354, height: 20, text: 'Page {{page}}', fontSize: 10, fontWeight: '700', fill: '#475569', textAlign: 'right', zIndex: 2 }
    ]
  },
  {
    id: 'ftr-vtac-specs-strip',
    name: 'V-TAC Technical Spec Bar',
    description: 'Product options & dimming summary badge with page count.',
    type: 'footer',
    height: 48,
    previewText: 'BODY COLOR : WHITE, BLACK  |  DIMMABLE  |  PAGE - {{page}}',
    elements: [
      { id: 'ftr-line', type: 'shape', x: 35, y: 2, width: 724, height: 1, fill: '#cbd5e1', zIndex: 1 },
      { id: 'ftr-specs', type: 'text', x: 35, y: 10, width: 550, height: 18, text: 'BODY COLOR : WHITE, TITANIUM, BLACK  |  DIMMABLE OPTIONS AVAILABLE', fontSize: 8.5, fontWeight: '700', fill: '#64748b', letterSpacing: 0.5, zIndex: 2 },
      { id: 'ftr-page', type: 'text', x: 600, y: 10, width: 159, height: 18, text: 'PAGE - {{page}}', fontSize: 9, fontWeight: '900', fill: '#0f172a', textAlign: 'right', zIndex: 2 }
    ]
  },
  {
    id: 'ftr-modern-contact',
    name: 'Modern Contact & URL Strip',
    description: 'Website, email and clean boxed page number.',
    type: 'footer',
    height: 38,
    previewText: 'info@brand.com  |  www.brand.com  |  [ {{page}} ]',
    elements: [
      { id: 'ftr-left', type: 'text', x: 40, y: 12, width: 500, height: 20, text: 'sales@company.com  •  www.company.com', fontSize: 9, fontWeight: '600', fill: '#6366f1', zIndex: 2 },
      { id: 'ftr-right', type: 'text', x: 550, y: 12, width: 204, height: 20, text: 'PAGE {{page}}', fontSize: 10, fontWeight: '900', fill: '#1e293b', textAlign: 'right', letterSpacing: 2, zIndex: 2 }
    ]
  }
];
