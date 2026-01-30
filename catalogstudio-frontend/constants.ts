
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
  },
  {
    id: 'rimberio-olive',
    name: 'Rimberio Modern',
    backgroundColor: '#ffffff',
    headingColor: '#5c6b4a',
    bodyColor: '#4a4a4a',
    accentColor: '#6c7a56',
    fontFamily: 'Inter',
    headingFont: 'Montserrat',
    preview: ['#ffffff', '#5c6b4a', '#6c7a56']
  },
  {
    id: 'neil-tran-decor',
    name: 'Neil Tran Decor',
    backgroundColor: '#e7e3d9',
    headingColor: '#433a2e',
    bodyColor: '#726a5e',
    accentColor: '#a69a8b',
    fontFamily: 'Inter',
    headingFont: 'Playfair Display',
    preview: ['#e7e3d9', '#433a2e', '#a69a8b']
  },
  {
    id: 'borcelle-warm',
    name: 'Borcelle Warm',
    backgroundColor: '#d2cdc1',
    headingColor: '#4a3728',
    bodyColor: '#5c4d3d',
    accentColor: '#8c725c',
    fontFamily: 'Inter',
    headingFont: 'Montserrat',
    preview: ['#d2cdc1', '#4a3728', '#8c725c']
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
          { id: 't1-p1-img', type: 'product-block', productId: 'p1', cardTheme: 'minimal-image', x: 80, y: 80, width: 634, height: 550, zIndex: 1, rotation: 0, opacity: 1 },
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
          { id: 'gen-slot-0', type: 'product-block', x: 60, y: 160, width: 320, height: 420, opacity: 1, zIndex: 0, rotation: 0 },
          { id: 't1-p2-s1-msg', type: 'text', x: 60, y: 350, width: 320, height: 20, text: 'DROP PRODUCT HERE', fontSize: 10, fontFamily: 'Inter', fontWeight: '900', textAlign: 'center', fill: '#94a3b8', zIndex: 1, rotation: 0, opacity: 1 }
        ]
      }
    ]
  },
  {
    id: 'tpl-rimberio',
    name: 'Rimberio Modern',
    description: 'Sophisticated olive green and cream aesthetic with bold typography and elegant product layouts.',
    thumbnail: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=400',
    themeId: 'rimberio-olive',
    pages: [
      {
        pageNumber: 1,
        elements: [
          { id: 'rim-p1-bg', type: 'shape', x: 0, y: 0, width: 794, height: 1123, fill: '#ffffff', zIndex: 0, rotation: 0, opacity: 1 },
          { id: 'rim-p1-brand', type: 'text', x: 80, y: 80, width: 634, height: 30, text: 'RIMBERIO FURNITURE', fontSize: 18, fontFamily: 'Montserrat', fontWeight: '500', fill: '#4a4a4a', letterSpacing: 2, zIndex: 1, rotation: 0, opacity: 1 },
          { id: 'rim-p1-title', type: 'text', x: 80, y: 120, width: 634, height: 200, text: 'PRODUCT\nCATALOG', fontSize: 96, fontFamily: 'Montserrat', fontWeight: '900', fill: '#5c6b4a', lineHeight: 0.9, zIndex: 2, rotation: 0, opacity: 1 },
          { id: 'rim-p1-badge-bg', type: 'shape', x: 480, y: 360, width: 234, height: 80, fill: '#5c6b4a', zIndex: 3, effectRoundness: 4, rotation: 0, opacity: 1 },
          { id: 'rim-p1-year', type: 'text', x: 480, y: 360, width: 234, height: 80, text: '2023', fontSize: 64, fontFamily: 'Montserrat', fontWeight: '900', fill: '#ffffff', textAlign: 'center', zIndex: 4, rotation: 0, opacity: 1 },
          { id: 'rim-p1-img', type: 'product-block', productId: 'p1', cardTheme: 'minimal-image', x: 0, y: 480, width: 794, height: 480, zIndex: 5, rotation: 0, opacity: 1 },
          { id: 'rim-p1-footer-l', type: 'text', x: 80, y: 1020, width: 317, height: 40, text: 'www.reallygreatsite.com /\n@reallygreatsite', fontSize: 12, fontFamily: 'Inter', fill: '#5c6b4a', fontWeight: '500', zIndex: 6, rotation: 0, opacity: 1 },
          { id: 'rim-p1-footer-r', type: 'text', x: 397, y: 1020, width: 317, height: 20, text: '123 Anywhere St., Any City', fontSize: 12, fontFamily: 'Inter', fill: '#5c6b4a', fontWeight: '500', textAlign: 'right', zIndex: 7, rotation: 0, opacity: 1 },
        ]
      },
      {
        pageNumber: 2,
        elements: [
          { id: 'rim-p2-bg', type: 'shape', x: 0, y: 0, width: 794, height: 1123, fill: '#ffffff', zIndex: 0, rotation: 0, opacity: 1 },
          { id: 'rim-p2-img', type: 'product-block', productId: 'p1', cardTheme: 'minimal-image', x: 0, y: 0, width: 794, height: 550, zIndex: 1, rotation: 0, opacity: 1 },
          { id: 'rim-p2-title', type: 'text', x: 120, y: 620, width: 554, height: 140, text: 'TABLE OF\nCONTENT', fontSize: 72, fontFamily: 'Montserrat', fontWeight: '900', fill: '#5c6b4a', lineHeight: 0.9, zIndex: 2, rotation: 0, opacity: 1 },
          { id: 'rim-p2-toc1-l', type: 'text', x: 120, y: 800, width: 140, height: 100, text: 'New Product\nTable\nKitchen', fontSize: 14, fontFamily: 'Inter', fontWeight: '700', fill: '#5c6b4a', zIndex: 3, lineHeight: 2, rotation: 0, opacity: 1 },
          { id: 'rim-p2-toc1-r', type: 'text', x: 260, y: 800, width: 100, height: 100, text: 'Page 3\nPage 4 - 5\nPage 6', fontSize: 14, fontFamily: 'Inter', fontWeight: '500', fill: '#5c6b4a', zIndex: 4, lineHeight: 2, rotation: 0, opacity: 1 },
          { id: 'rim-p2-toc2-l', type: 'text', x: 440, y: 800, width: 140, height: 100, text: 'Sofa\nDecoration', fontSize: 14, fontFamily: 'Inter', fontWeight: '700', fill: '#5c6b4a', zIndex: 5, lineHeight: 2, rotation: 0, opacity: 1 },
          { id: 'rim-p2-toc2-r', type: 'text', x: 580, y: 800, width: 100, height: 100, text: 'Page 7\nPage 8-9', fontSize: 14, fontFamily: 'Inter', fontWeight: '500', fill: '#5c6b4a', zIndex: 6, lineHeight: 2, rotation: 0, opacity: 1 },
        ]
      },
      {
        pageNumber: 3,
        elements: [
          { id: 'rim-p3-img', type: 'product-block', productId: 'p3', cardTheme: 'minimal-image', x: 0, y: 0, width: 794, height: 1123, zIndex: 0, rotation: 0, opacity: 1 },
          { id: 'rim-p3-title', type: 'text', x: 380, y: 120, width: 350, height: 160, text: 'NEW\nPRODUCT', fontSize: 80, fontFamily: 'Montserrat', fontWeight: '900', fill: '#ffffff', lineHeight: 0.9, zIndex: 2, rotation: 0, opacity: 1, productId: 'p3' },
          { id: 'rim-p3-desc', type: 'text', x: 380, y: 300, width: 350, height: 100, text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed facilisis et diam at bibendum. Donec lobortis auctor nisl, in porta sem pellentesque vitae.', fontSize: 12, fontFamily: 'Inter', fill: '#ffffff', zIndex: 3, rotation: 0, opacity: 1 },
          { id: 'rim-p3-badge-bg', type: 'shape', x: 380, y: 420, width: 200, height: 50, fill: '#ffffff', effectRoundness: 25, zIndex: 4, rotation: 0, opacity: 1 },
          { id: 'rim-p3-price-lbl', type: 'text', x: 400, y: 435, width: 60, height: 20, text: 'PRICE', fontSize: 10, fontFamily: 'Montserrat', fontWeight: '900', fill: '#5c6b4a', zIndex: 5, rotation: 0, opacity: 1, productId: 'p3' },
          { id: 'rim-p3-price-val', type: 'text', x: 460, y: 430, width: 100, height: 30, text: '$89.00', fontSize: 20, fontFamily: 'Montserrat', fontWeight: '500', fill: '#5c6b4a', zIndex: 6, rotation: 0, opacity: 1, productId: 'p3' },
        ]
      },
      {
        pageNumber: 4,
        elements: [
          { id: 'rim-p4-bg', type: 'shape', x: 0, y: 0, width: 794, height: 1123, fill: '#ffffff', zIndex: 0, rotation: 0, opacity: 1 },
          { id: 'rim-p4-title1', type: 'text', x: 60, y: 120, width: 317, height: 20, text: 'LIVING ROOM SET 1', fontSize: 16, fontFamily: 'Montserrat', fontWeight: '700', fill: '#5c6b4a', zIndex: 1, rotation: 0, opacity: 1 },
          { id: 'rim-p4-desc1', type: 'text', x: 60, y: 150, width: 317, height: 50, text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.', fontSize: 10, fontFamily: 'Inter', fill: '#4a4a4a', zIndex: 2, rotation: 0, opacity: 1 },
          { id: 'rim-p4-badge1-bg', type: 'shape', x: 60, y: 210, width: 120, height: 30, fill: '#5c6b4a', effectRoundness: 15, zIndex: 3, rotation: 0, opacity: 1 },
          { id: 'rim-p4-price1', type: 'text', x: 60, y: 215, width: 120, height: 20, text: 'PRICE $899.00', fontSize: 10, fontFamily: 'Montserrat', fontWeight: '700', fill: '#ffffff', textAlign: 'center', zIndex: 4, rotation: 0, opacity: 1, productId: 'p4' },
          { id: 'rim-p4-img1', type: 'product-block', productId: 'p4', cardTheme: 'minimal-image', x: 60, y: 260, width: 327, height: 450, zIndex: 5, rotation: 0, opacity: 1 },

          { id: 'rim-p4-title2', type: 'text', x: 407, y: 120, width: 327, height: 20, text: 'LIVING ROOM SET 2', fontSize: 16, fontFamily: 'Montserrat', fontWeight: '700', fill: '#5c6b4a', zIndex: 6, rotation: 0, opacity: 1 },
          { id: 'rim-p4-desc2', type: 'text', x: 407, y: 150, width: 327, height: 50, text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.', fontSize: 10, fontFamily: 'Inter', fill: '#4a4a4a', zIndex: 7, rotation: 0, opacity: 1 },
          { id: 'rim-p4-badge2-bg', type: 'shape', x: 407, y: 210, width: 120, height: 30, fill: '#5c6b4a', effectRoundness: 15, zIndex: 8, rotation: 0, opacity: 1 },
          { id: 'rim-p4-price2', type: 'text', x: 407, y: 215, width: 120, height: 20, text: 'PRICE $210.00', fontSize: 10, fontFamily: 'Montserrat', fontWeight: '700', fill: '#ffffff', textAlign: 'center', zIndex: 9, rotation: 0, opacity: 1, productId: 'p6' },
          { id: 'rim-p4-img2', type: 'product-block', productId: 'p6', cardTheme: 'minimal-image', x: 407, y: 260, width: 327, height: 450, zIndex: 10, rotation: 0, opacity: 1 },

          { id: 'rim-p4-big-title', type: 'text', x: 60, y: 735, width: 674, height: 160, text: 'LIVING ROOM\nFURNITURE', fontSize: 80, fontFamily: 'Montserrat', fontWeight: '900', fill: '#5c6b4a', lineHeight: 0.9, zIndex: 11, rotation: 0, opacity: 1 },
          { id: 'rim-p4-big-desc1', type: 'text', x: 60, y: 900, width: 317, height: 80, text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed facilisis et diam at bibendum. Donec lobortis auctor nisl, in porta sem pellentesque vitae. Proin dignissim condimentum porttitor.', fontSize: 10, fontFamily: 'Inter', fill: '#4a4a4a', zIndex: 12, rotation: 0, opacity: 1 },
          { id: 'rim-p4-big-desc2', type: 'text', x: 407, y: 900, width: 327, height: 80, text: 'Duis malesuada diam sapien, ac fringilla sapien facilisis at. Proin pharetra tormentum orci ut ullamcorper. Duis eget ultricies mi, aliquam viverra sem.', fontSize: 10, fontFamily: 'Inter', fill: '#4a4a4a', zIndex: 13, rotation: 0, opacity: 1 },
        ]
      },
      {
        pageNumber: 5,
        elements: [
          { id: 'rim-p5-bg', type: 'shape', x: 0, y: 0, width: 794, height: 1123, fill: '#ffffff', zIndex: 0, rotation: 0, opacity: 1 },
          { id: 'rim-p5-img', type: 'product-block', productId: 'p2', cardTheme: 'minimal-image', x: 80, y: 120, width: 634, height: 634, zIndex: 1, rotation: 0, opacity: 1 },
          { id: 'rim-p5-title', type: 'text', x: 80, y: 780, width: 634, height: 30, text: 'LIVING ROOM SET 1', fontSize: 24, fontFamily: 'Montserrat', fontWeight: '700', fill: '#5c6b4a', zIndex: 2, rotation: 0, opacity: 1 },
          { id: 'rim-p5-desc', type: 'text', x: 80, y: 820, width: 634, height: 60, text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.', fontSize: 12, fontFamily: 'Inter', fill: '#4a4a4a', zIndex: 3, rotation: 0, opacity: 1 },
          { id: 'rim-p5-badge-bg', type: 'shape', x: 80, y: 900, width: 150, height: 40, fill: '#5c6b4a', effectRoundness: 20, zIndex: 4, rotation: 0, opacity: 1 },
          { id: 'rim-p5-price', type: 'text', x: 80, y: 908, width: 150, height: 25, text: 'PRICE  $45.50', fontSize: 12, fontFamily: 'Montserrat', fontWeight: '700', fill: '#ffffff', textAlign: 'center', zIndex: 5, rotation: 0, opacity: 1, productId: 'p2' },
          { id: 'rim-p5-colors-lbl', type: 'text', x: 480, y: 915, width: 100, height: 20, text: 'Available Colors:', fontSize: 10, fontFamily: 'Inter', fontWeight: '500', fill: '#4a4a4a', textAlign: 'right', zIndex: 6, rotation: 0, opacity: 1 },
          { id: 'rim-p5-c1', type: 'shape', x: 590, y: 910, width: 25, height: 25, fill: '#b5c18e', zIndex: 7, effectRoundness: 12.5, rotation: 0, opacity: 1 },
          { id: 'rim-p5-c2', type: 'shape', x: 625, y: 910, width: 25, height: 25, fill: '#6c7a56', zIndex: 8, effectRoundness: 12.5, rotation: 0, opacity: 1 },
          { id: 'rim-p5-c3', type: 'shape', x: 660, y: 910, width: 25, height: 25, fill: '#f2e8cf', zIndex: 9, effectRoundness: 12.5, rotation: 0, opacity: 1 },
          { id: 'rim-p5-c4', type: 'shape', x: 695, y: 910, width: 25, height: 25, fill: '#a68a64', zIndex: 10, effectRoundness: 12.5, rotation: 0, opacity: 1 },
        ]
      },
      {
        pageNumber: 6,
        elements: [
          { id: 'rim-p6-bg', type: 'shape', x: 0, y: 0, width: 794, height: 1123, fill: '#ffffff', zIndex: 0, rotation: 0, opacity: 1 },

          { id: 'rim-p6-tag1-bg', type: 'shape', x: 80, y: 60, width: 80, height: 22, fill: '#ffffff', zIndex: 1, textStrokeWidth: 1, textStrokeColor: '#5c6b4a', effectRoundness: 11, rotation: 0, opacity: 1 },
          { id: 'rim-p6-tag1-txt', type: 'text', x: 80, y: 64, width: 80, height: 14, text: 'Best Seller', fontSize: 9, fontFamily: 'Inter', fontWeight: '700', fill: '#5c6b4a', textAlign: 'center', zIndex: 2, rotation: 0, opacity: 1 },
          { id: 'rim-p6-title1', type: 'text', x: 80, y: 90, width: 400, height: 30, text: 'KITCHEN SET 1', fontSize: 24, fontFamily: 'Montserrat', fontWeight: '700', fill: '#5c6b4a', zIndex: 3, rotation: 0, opacity: 1 },
          { id: 'rim-p6-desc1', type: 'text', x: 80, y: 125, width: 450, height: 40, text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.', fontSize: 10, fontFamily: 'Inter', fill: '#4a4a4a', zIndex: 4, rotation: 0, opacity: 1 },
          { id: 'rim-p6-badge1-bg', type: 'shape', x: 550, y: 120, width: 164, height: 36, fill: '#5c6b4a', effectRoundness: 18, zIndex: 5, rotation: 0, opacity: 1 },
          { id: 'rim-p6-price1', type: 'text', x: 550, y: 128, width: 164, height: 20, text: 'PRICE  $129.00', fontSize: 11, fontFamily: 'Montserrat', fontWeight: '700', fill: '#ffffff', textAlign: 'center', zIndex: 6, rotation: 0, opacity: 1, productId: 'p1' },
          { id: 'rim-p6-img1', type: 'product-block', productId: 'p1', cardTheme: 'minimal-image', x: 0, y: 190, width: 794, height: 320, zIndex: 7, rotation: 0, opacity: 1 },

          { id: 'rim-p6-tag2-bg', type: 'shape', x: 80, y: 560, width: 80, height: 22, fill: '#ffffff', zIndex: 8, textStrokeWidth: 1, textStrokeColor: '#5c6b4a', effectRoundness: 11, rotation: 0, opacity: 1 },
          { id: 'rim-p6-tag2-txt', type: 'text', x: 80, y: 564, width: 80, height: 14, text: 'Best Seller', fontSize: 9, fontFamily: 'Inter', fontWeight: '700', fill: '#5c6b4a', textAlign: 'center', zIndex: 9, rotation: 0, opacity: 1 },
          { id: 'rim-p6-title2', type: 'text', x: 80, y: 590, width: 400, height: 30, text: 'KITCHEN SET 2', fontSize: 24, fontFamily: 'Montserrat', fontWeight: '700', fill: '#5c6b4a', zIndex: 10, rotation: 0, opacity: 1 },
          { id: 'rim-p6-desc2', type: 'text', x: 80, y: 625, width: 450, height: 40, text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.', fontSize: 10, fontFamily: 'Inter', fill: '#4a4a4a', zIndex: 11, rotation: 0, opacity: 1 },
          { id: 'rim-p6-badge2-bg', type: 'shape', x: 550, y: 620, width: 164, height: 36, fill: '#5c6b4a', effectRoundness: 18, zIndex: 12, rotation: 0, opacity: 1 },
          { id: 'rim-p6-price2', type: 'text', x: 550, y: 628, width: 164, height: 20, text: 'PRICE  $45.50', fontSize: 11, fontFamily: 'Montserrat', fontWeight: '700', fill: '#ffffff', textAlign: 'center', zIndex: 13, rotation: 0, opacity: 1, productId: 'p2' },
          { id: 'rim-p6-img2', type: 'product-block', productId: 'p2', cardTheme: 'minimal-image', x: 0, y: 690, width: 794, height: 320, zIndex: 14, rotation: 0, opacity: 1 },
        ]
      },
      {
        pageNumber: 7,
        elements: [
          { id: 'rim-p7-bg', type: 'shape', x: 0, y: 0, width: 794, height: 1123, fill: '#ffffff', zIndex: 0, rotation: 0, opacity: 1 },
          // Sofa 1
          { id: 'rim-p7-img1', type: 'product-block', productId: 'p4', cardTheme: 'minimal-image', x: 80, y: 80, width: 330, height: 240, zIndex: 1, rotation: 0, opacity: 1 },
          { id: 'rim-p7-title1', type: 'text', x: 440, y: 80, width: 274, height: 25, text: 'VELVET SOFA GREEN', fontSize: 20, fontFamily: 'Montserrat', fontWeight: '700', fill: '#5c6b4a', zIndex: 2, rotation: 0, opacity: 1, productId: 'p4' },
          { id: 'rim-p7-desc1', type: 'text', x: 440, y: 115, width: 274, height: 60, text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', fontSize: 10, fontFamily: 'Inter', fill: '#4a4a4a', zIndex: 3, rotation: 0, opacity: 1 },
          { id: 'rim-p7-badge1-bg', type: 'shape', x: 440, y: 180, width: 140, height: 30, fill: '#5c6b4a', effectRoundness: 15, zIndex: 4, rotation: 0, opacity: 1 },
          { id: 'rim-p7-price1', type: 'text', x: 440, y: 186, width: 140, height: 18, text: 'PRICE  $899.00', fontSize: 10, fontFamily: 'Montserrat', fontWeight: '700', fill: '#ffffff', textAlign: 'center', zIndex: 5, rotation: 0, opacity: 1, productId: 'p4' },
          { id: 'rim-p7-colors1-lbl', type: 'text', x: 440, y: 225, width: 100, height: 15, text: 'Available Colors:', fontSize: 9, fontFamily: 'Inter', fill: '#4a4a4a', zIndex: 6, rotation: 0, opacity: 1 },
          { id: 'rim-p7-c1a', type: 'shape', x: 550, y: 220, width: 20, height: 20, fill: '#e6cc00', zIndex: 7, effectRoundness: 10, rotation: 0, opacity: 1 },
          { id: 'rim-p7-c1b', type: 'shape', x: 580, y: 220, width: 20, height: 20, fill: '#d97706', zIndex: 8, effectRoundness: 10, rotation: 0, opacity: 1 },
          { id: 'rim-p7-c1c', type: 'shape', x: 610, y: 220, width: 20, height: 20, fill: '#94a3b8', zIndex: 9, effectRoundness: 10, rotation: 0, opacity: 1 },

          // Sofa 2
          { id: 'rim-p7-img2', type: 'product-block', productId: 'p4', cardTheme: 'minimal-image', x: 80, y: 360, width: 330, height: 240, zIndex: 10, rotation: 0, opacity: 1 },
          { id: 'rim-p7-title2', type: 'text', x: 440, y: 360, width: 274, height: 25, text: 'VELVET SOFA GREEN', fontSize: 20, fontFamily: 'Montserrat', fontWeight: '700', fill: '#5c6b4a', zIndex: 11, rotation: 0, opacity: 1, productId: 'p4' },
          { id: 'rim-p7-desc2', type: 'text', x: 440, y: 395, width: 274, height: 60, text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', fontSize: 10, fontFamily: 'Inter', fill: '#4a4a4a', zIndex: 12, rotation: 0, opacity: 1 },
          { id: 'rim-p7-badge2-bg', type: 'shape', x: 440, y: 460, width: 140, height: 30, fill: '#5c6b4a', effectRoundness: 15, zIndex: 13, rotation: 0, opacity: 1 },
          { id: 'rim-p7-price2', type: 'text', x: 440, y: 466, width: 140, height: 18, text: 'PRICE  $899.00', fontSize: 10, fontFamily: 'Montserrat', fontWeight: '700', fill: '#ffffff', textAlign: 'center', zIndex: 14, rotation: 0, opacity: 1, productId: 'p4' },
          { id: 'rim-p7-colors2-lbl', type: 'text', x: 440, y: 505, width: 100, height: 15, text: 'Available Colors:', fontSize: 9, fontFamily: 'Inter', fill: '#4a4a4a', zIndex: 15, rotation: 0, opacity: 1 },
          { id: 'rim-p7-c2a', type: 'shape', x: 550, y: 500, width: 20, height: 20, fill: '#c2410c', zIndex: 16, effectRoundness: 10, rotation: 0, opacity: 1 },
          { id: 'rim-p7-c2b', type: 'shape', x: 580, y: 500, width: 20, height: 20, fill: '#6c7a56', zIndex: 17, effectRoundness: 10, rotation: 0, opacity: 1 },

          // Sofa 3
          { id: 'rim-p7-img3', type: 'product-block', productId: 'p4', cardTheme: 'minimal-image', x: 80, y: 640, width: 330, height: 240, zIndex: 18, rotation: 0, opacity: 1 },
          { id: 'rim-p7-title3', type: 'text', x: 440, y: 640, width: 274, height: 25, text: 'VELVET SOFA GREEN', fontSize: 20, fontFamily: 'Montserrat', fontWeight: '700', fill: '#5c6b4a', zIndex: 19, rotation: 0, opacity: 1, productId: 'p4' },
          { id: 'rim-p7-desc3', type: 'text', x: 440, y: 675, width: 274, height: 60, text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', fontSize: 10, fontFamily: 'Inter', fill: '#4a4a4a', zIndex: 20, rotation: 0, opacity: 1 },
          { id: 'rim-p7-badge3-bg', type: 'shape', x: 440, y: 740, width: 140, height: 30, fill: '#5c6b4a', effectRoundness: 15, zIndex: 21, rotation: 0, opacity: 1 },
          { id: 'rim-p7-price3', type: 'text', x: 440, y: 746, width: 140, height: 18, text: 'PRICE  $899.00', fontSize: 10, fontFamily: 'Montserrat', fontWeight: '700', fill: '#ffffff', textAlign: 'center', zIndex: 22, rotation: 0, opacity: 1, productId: 'p4' },
          { id: 'rim-p7-colors3-lbl', type: 'text', x: 440, y: 785, width: 100, height: 15, text: 'Available Colors:', fontSize: 9, fontFamily: 'Inter', fill: '#4a4a4a', zIndex: 23, rotation: 0, opacity: 1 },
          { id: 'rim-p7-c3a', type: 'shape', x: 550, y: 780, width: 20, height: 20, fill: '#cbd5e1', zIndex: 24, effectRoundness: 10, rotation: 0, opacity: 1 },
        ]
      },
      {
        pageNumber: 8,
        elements: [
          { id: 'rim-p8-img', type: 'product-block', productId: 'p3', cardTheme: 'minimal-image', x: 0, y: 0, width: 794, height: 1123, zIndex: 0, rotation: 0, opacity: 1 },
          { id: 'rim-p8-title', type: 'text', x: 80, y: 120, width: 634, height: 180, text: 'HOME\nDECORATION', fontSize: 90, fontFamily: 'Montserrat', fontWeight: '900', fill: '#4a3f35', lineHeight: 0.85, zIndex: 2, rotation: 0, opacity: 1, productId: 'p3' },
          { id: 'rim-p8-desc', type: 'text', x: 80, y: 310, width: 634, height: 100, text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.', fontSize: 12, fontFamily: 'Inter', fill: '#4a3f35', zIndex: 3, rotation: 0, opacity: 1 },
          { id: 'rim-p8-badge-bg', type: 'shape', x: 80, y: 430, width: 240, height: 50, fill: '#ffffff00', zIndex: 4, textStrokeWidth: 1, textStrokeColor: '#4a3f35', effectRoundness: 25, rotation: 0, opacity: 1 },
          { id: 'rim-p8-price-lbl', type: 'text', x: 100, y: 445, width: 60, height: 20, text: 'PRICE', fontSize: 10, fontFamily: 'Montserrat', fontWeight: '900', fill: '#4a3f35', zIndex: 5, rotation: 0, opacity: 1, productId: 'p3' },
          { id: 'rim-p8-price-val', type: 'text', x: 160, y: 440, width: 140, height: 30, text: '$89.00', fontSize: 24, fontFamily: 'Montserrat', fontWeight: '500', fill: '#4a3f35', zIndex: 6, rotation: 0, opacity: 1, productId: 'p3' },
        ]
      },
      {
        pageNumber: 9,
        elements: [
          { id: 'rim-p9-bg', type: 'shape', x: 0, y: 0, width: 794, height: 1123, fill: '#ffffff', zIndex: 0, rotation: 0, opacity: 1 },
          // Item 1
          { id: 'rim-p9-img1', type: 'product-block', productId: 'p3', cardTheme: 'minimal-image', x: 80, y: 80, width: 330, height: 240, zIndex: 1, rotation: 0, opacity: 1 },
          { id: 'rim-p9-title1', type: 'text', x: 440, y: 80, width: 274, height: 25, text: 'CERAMIC VASE SET', fontSize: 18, fontFamily: 'Montserrat', fontWeight: '700', fill: '#5c6b4a', zIndex: 2, rotation: 0, opacity: 1, productId: 'p3' },
          { id: 'rim-p9-desc1', type: 'text', x: 440, y: 115, width: 274, height: 80, text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi.', fontSize: 10, fontFamily: 'Inter', fill: '#4a4a4a', zIndex: 3, rotation: 0, opacity: 1 },
          { id: 'rim-p9-badge1-bg', type: 'shape', x: 440, y: 205, width: 140, height: 30, fill: '#5c6b4a', effectRoundness: 15, zIndex: 4, rotation: 0, opacity: 1 },
          { id: 'rim-p9-price1', type: 'text', x: 440, y: 211, width: 140, height: 18, text: 'PRICE  $89.00', fontSize: 10, fontFamily: 'Montserrat', fontWeight: '700', fill: '#ffffff', textAlign: 'center', zIndex: 5, rotation: 0, opacity: 1, productId: 'p3' },

          // Item 2 (Alternating)
          { id: 'rim-p9-img2', type: 'product-block', productId: 'p3', cardTheme: 'minimal-image', x: 440, y: 360, width: 330, height: 240, zIndex: 6, rotation: 0, opacity: 1 },
          { id: 'rim-p9-title2', type: 'text', x: 80, y: 360, width: 330, height: 25, text: 'CERAMIC VASE SET', fontSize: 18, fontFamily: 'Montserrat', fontWeight: '700', fill: '#5c6b4a', zIndex: 7, rotation: 0, opacity: 1, productId: 'p3' },
          { id: 'rim-p9-desc2', type: 'text', x: 80, y: 395, width: 330, height: 80, text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi.', fontSize: 10, fontFamily: 'Inter', fill: '#4a4a4a', zIndex: 8, rotation: 0, opacity: 1 },
          { id: 'rim-p9-badge2-bg', type: 'shape', x: 80, y: 485, width: 140, height: 30, fill: '#5c6b4a', effectRoundness: 15, zIndex: 9, rotation: 0, opacity: 1 },
          { id: 'rim-p9-price2', type: 'text', x: 80, y: 491, width: 140, height: 18, text: 'PRICE  $89.00', fontSize: 10, fontFamily: 'Montserrat', fontWeight: '700', fill: '#ffffff', textAlign: 'center', zIndex: 10, rotation: 0, opacity: 1, productId: 'p3' },

          // Item 3
          { id: 'rim-p9-img3', type: 'product-block', productId: 'p3', cardTheme: 'minimal-image', x: 80, y: 640, width: 330, height: 240, zIndex: 11, rotation: 0, opacity: 1 },
          { id: 'rim-p9-title3', type: 'text', x: 440, y: 640, width: 274, height: 25, text: 'CERAMIC VASE SET', fontSize: 18, fontFamily: 'Montserrat', fontWeight: '700', fill: '#5c6b4a', zIndex: 12, rotation: 0, opacity: 1, productId: 'p3' },
          { id: 'rim-p9-desc3', type: 'text', x: 440, y: 675, width: 274, height: 80, text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi.', fontSize: 10, fontFamily: 'Inter', fill: '#4a4a4a', zIndex: 13, rotation: 0, opacity: 1 },
          { id: 'rim-p9-badge3-bg', type: 'shape', x: 440, y: 765, width: 140, height: 30, fill: '#5c6b4a', effectRoundness: 15, zIndex: 14, rotation: 0, opacity: 1 },
          { id: 'rim-p9-price3', type: 'text', x: 440, y: 771, width: 140, height: 18, text: 'PRICE  $89.00', fontSize: 10, fontFamily: 'Montserrat', fontWeight: '700', fill: '#ffffff', textAlign: 'center', zIndex: 15, rotation: 0, opacity: 1, productId: 'p3' },
        ]
      },
      {
        pageNumber: 10,
        elements: [
          { id: 'rim-p10-bg', type: 'shape', x: 0, y: 0, width: 794, height: 1123, fill: '#ffffff', zIndex: 0, rotation: 0, opacity: 1 },
          { id: 'rim-p10-img', type: 'product-block', productId: 'p6', cardTheme: 'minimal-image', x: 0, y: 0, width: 794, height: 500, zIndex: 1, rotation: 0, opacity: 1 },
          { id: 'rim-p10-title', type: 'text', x: 80, y: 550, width: 634, height: 180, text: 'RIMBERIO\nFURNITURE', fontSize: 80, fontFamily: 'Montserrat', fontWeight: '900', fill: '#5c6b4a', lineHeight: 0.9, zIndex: 2, rotation: 0, opacity: 1 },
          { id: 'rim-p10-contact-lbl', type: 'text', x: 80, y: 800, width: 300, height: 30, text: 'CONTACT US', fontSize: 24, fontFamily: 'Montserrat', fontWeight: '700', fill: '#5c6b4a', zIndex: 3, rotation: 0, opacity: 1 },
          { id: 'rim-p10-info-l', type: 'text', x: 80, y: 850, width: 317, height: 40, text: 'www.reallygreatsite.com /\n@reallygreatsite', fontSize: 12, fontFamily: 'Inter', fill: '#4a4a4a', fontWeight: '500', zIndex: 4, rotation: 0, opacity: 1 },
          { id: 'rim-p10-info-r', type: 'text', x: 400, y: 850, width: 314, height: 40, text: '+123-456-7890\ninfo@reallygreatsite.com', fontSize: 12, fontFamily: 'Inter', fill: '#4a4a4a', fontWeight: '500', textAlign: 'right', zIndex: 5, rotation: 0, opacity: 1 },
        ]
      }
    ]
  },
  {
    id: 'tpl-neil-tran',
    name: 'Neil Tran Home Decor',
    description: 'Minimalist beige and brown aesthetic with high-end editorial layouts. Designed for premium product showcases.',
    thumbnail: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=400',
    themeId: 'neil-tran-decor',
    pages: [
      {
        pageNumber: 1,
        elements: [
          { id: 'nt-p1-bg', type: 'shape', x: 0, y: 0, width: 794, height: 1123, fill: '#e7e3d9', zIndex: 0, rotation: 0, opacity: 1 },
          { id: 'nt-p1-logo-icon', type: 'shape', x: 380, y: 80, width: 34, height: 34, fill: '#433a2e', zIndex: 1, rotation: 0, opacity: 1 },
          { id: 'nt-p1-brand', type: 'text', x: 80, y: 130, width: 634, height: 40, text: 'NEIL TRAN\nHOME DECOR', fontSize: 16, fontFamily: 'Inter', fontWeight: '700', fill: '#433a2e', textAlign: 'center', letterSpacing: 2, zIndex: 2, rotation: 0, opacity: 1 },
          { id: 'nt-p1-img', type: 'product-block', productId: 'p1', cardTheme: 'minimal-image', x: 80, y: 220, width: 320, height: 820, zIndex: 3, rotation: 0, opacity: 1 },
          { id: 'nt-p1-title', type: 'text', x: 420, y: 300, width: 300, height: 180, text: 'Product\nCatalogue\n2027', fontSize: 64, fontFamily: 'Playfair Display', fontWeight: '700', fill: '#433a2e', textAlign: 'right', lineHeight: 0.9, zIndex: 4, rotation: 0, opacity: 1 },
          { id: 'nt-p1-desc', type: 'text', x: 420, y: 520, width: 300, height: 40, text: '"INNOVATIVE DESIGNS FOR\nTIMELESS LIVING"', fontSize: 13, fontFamily: 'Inter', fontWeight: '500', fill: '#726a5e', textAlign: 'right', letterSpacing: 1, zIndex: 5, rotation: 0, opacity: 1 },
          { id: 'nt-p1-border-l', type: 'shape', x: 40, y: 40, width: 1, height: 1043, fill: '#a69a8b', opacity: 0.5, zIndex: 6, rotation: 0 },
          { id: 'nt-p1-border-r', type: 'shape', x: 754, y: 40, width: 1, height: 1043, fill: '#a69a8b', opacity: 0.5, zIndex: 7, rotation: 0 }
        ]
      },
      {
        pageNumber: 2,
        elements: [
          { id: 'nt-p2-bg', type: 'shape', x: 0, y: 0, width: 794, height: 1123, fill: '#e7e3d9', zIndex: 0, rotation: 0, opacity: 1 },
          // Item 1
          { id: 'nt-p2-img1', type: 'product-block', productId: 'p1', cardTheme: 'minimal-image', x: 80, y: 60, width: 280, height: 280, zIndex: 1, rotation: 0, opacity: 1 },
          { id: 'nt-p2-title1', type: 'text', x: 380, y: 60, width: 334, height: 30, text: 'MODERN CONSOLE TABLE', fontSize: 22, fontFamily: 'Playfair Display', fontWeight: '700', fill: '#433a2e', zIndex: 2, rotation: 0, opacity: 1, productId: 'p1' },
          { id: 'nt-p2-badge1', type: 'shape', x: 380, y: 105, width: 100, height: 40, fill: '#433a2e', effectRoundness: 4, zIndex: 3, rotation: 0, opacity: 1 },
          { id: 'nt-p2-price1', type: 'text', x: 380, y: 115, width: 100, height: 20, text: '$300', fontSize: 18, fontFamily: 'Inter', fontWeight: '700', fill: '#ffffff', textAlign: 'center', zIndex: 4, rotation: 0, opacity: 1, productId: 'p1' },
          { id: 'nt-p2-desc1', type: 'text', x: 380, y: 165, width: 334, height: 100, text: 'A sleek, modern console table perfect for entryways or living rooms. Its clean lines and minimalist design make it the ideal piece to display decor or store keys and essentials.', fontSize: 10, fontFamily: 'Inter', fill: '#726a5e', lineHeight: 1.5, zIndex: 5, rotation: 0, opacity: 1 },
          // Item 2
          { id: 'nt-p2-img2', type: 'product-block', productId: 'p2', cardTheme: 'minimal-image', x: 80, y: 390, width: 280, height: 280, zIndex: 6, rotation: 0, opacity: 1 },
          { id: 'nt-p2-title2', type: 'text', x: 380, y: 390, width: 334, height: 30, text: 'STATEMENT PENDANT LIGHT', fontSize: 22, fontFamily: 'Playfair Display', fontWeight: '700', fill: '#433a2e', zIndex: 7, rotation: 0, opacity: 1, productId: 'p2' },
          { id: 'nt-p2-badge2', type: 'shape', x: 380, y: 435, width: 100, height: 40, fill: '#433a2e', effectRoundness: 4, zIndex: 8, rotation: 0, opacity: 1 },
          { id: 'nt-p2-price2', type: 'text', x: 380, y: 445, width: 100, height: 20, text: '$220', fontSize: 18, fontFamily: 'Inter', fontWeight: '700', fill: '#ffffff', textAlign: 'center', zIndex: 9, rotation: 0, opacity: 1, productId: 'p2' },
          { id: 'nt-p2-desc2', type: 'text', x: 380, y: 495, width: 334, height: 100, text: 'A bold pendant light that serves as a statement piece above dining tables, kitchen islands, or living room areas. Its unique design adds character and warmth to any space.', fontSize: 10, fontFamily: 'Inter', fill: '#726a5e', lineHeight: 1.5, zIndex: 10, rotation: 0, opacity: 1 },
          // Item 3
          { id: 'nt-p2-img3', type: 'product-block', productId: 'p3', cardTheme: 'minimal-image', x: 80, y: 720, width: 280, height: 280, zIndex: 11, rotation: 0, opacity: 1 },
          { id: 'nt-p2-title3', type: 'text', x: 380, y: 720, width: 334, height: 30, text: 'INDUSTRIAL STYLE SIDE TABLE', fontSize: 22, fontFamily: 'Playfair Display', fontWeight: '700', fill: '#433a2e', zIndex: 12, rotation: 0, opacity: 1, productId: 'p3' },
          { id: 'nt-p2-badge3', type: 'shape', x: 380, y: 765, width: 100, height: 40, fill: '#433a2e', effectRoundness: 4, zIndex: 13, rotation: 0, opacity: 1 },
          { id: 'nt-p2-price3', type: 'text', x: 380, y: 775, width: 100, height: 20, text: '$130', fontSize: 18, fontFamily: 'Inter', fontWeight: '700', fill: '#ffffff', textAlign: 'center', zIndex: 14, rotation: 0, opacity: 1, productId: 'p3' },
          { id: 'nt-p2-desc3', type: 'text', x: 380, y: 825, width: 334, height: 100, text: 'An industrial-inspired side table that adds an urban touch to any room. Perfect for holding drinks, books, or decor, its metal frame and wooden top make it both stylish and functional.', fontSize: 10, fontFamily: 'Inter', fill: '#726a5e', lineHeight: 1.5, zIndex: 15, rotation: 0, opacity: 1 },
        ]
      },
      {
        pageNumber: 3,
        elements: [
          { id: 'nt-p3-bg', type: 'shape', x: 0, y: 0, width: 794, height: 1123, fill: '#e7e3d9', zIndex: 0, rotation: 0, opacity: 1 },
          // Item 1 (Large Top)
          { id: 'nt-p3-title1', type: 'text', x: 80, y: 70, width: 500, height: 40, text: 'LUXURY BED FRAME', fontSize: 28, fontFamily: 'Playfair Display', fontWeight: '700', fill: '#433a2e', zIndex: 1, rotation: 0, opacity: 1, productId: 'p4' },
          { id: 'nt-p3-badge1', type: 'shape', x: 614, y: 65, width: 100, height: 40, fill: '#433a2e', effectRoundness: 4, zIndex: 2, rotation: 0, opacity: 1 },
          { id: 'nt-p3-price1', type: 'text', x: 614, y: 75, width: 100, height: 20, text: '$600', fontSize: 18, fontFamily: 'Inter', fontWeight: '700', fill: '#ffffff', textAlign: 'center', zIndex: 3, rotation: 0, opacity: 1, productId: 'p4' },
          { id: 'nt-p3-desc1', type: 'text', x: 80, y: 130, width: 634, height: 80, text: 'A luxurious bed frame with a timeless design, crafted to enhance any bedroom. Its sturdy construction and elegant appearance make it the centerpiece of your restful sanctuary.', fontSize: 12, fontFamily: 'Inter', fill: '#726a5e', lineHeight: 1.5, zIndex: 4, rotation: 0, opacity: 1 },
          { id: 'nt-p3-img1', type: 'product-block', productId: 'p4', cardTheme: 'minimal-image', x: 80, y: 230, width: 634, height: 380, zIndex: 5, rotation: 0, opacity: 1 },
          // Item 2 (Bottom Row)
          { id: 'nt-p3-img2', type: 'product-block', productId: 'p5', cardTheme: 'minimal-image', x: 80, y: 650, width: 300, height: 400, zIndex: 6, rotation: 0, opacity: 1 },
          { id: 'nt-p3-title2', type: 'text', x: 410, y: 660, width: 304, height: 30, text: 'ELEGANT FLOOR LAMP', fontSize: 22, fontFamily: 'Playfair Display', fontWeight: '700', fill: '#433a2e', zIndex: 7, rotation: 0, opacity: 1, productId: 'p5' },
          { id: 'nt-p3-badge2', type: 'shape', x: 410, y: 705, width: 100, height: 40, fill: '#433a2e', effectRoundness: 4, zIndex: 8, rotation: 0, opacity: 1 },
          { id: 'nt-p3-price2', type: 'text', x: 410, y: 715, width: 100, height: 20, text: '$180', fontSize: 18, fontFamily: 'Inter', fontWeight: '700', fill: '#ffffff', textAlign: 'center', zIndex: 9, rotation: 0, opacity: 1, productId: 'p5' },
          { id: 'nt-p3-desc2', type: 'text', x: 410, y: 765, width: 304, height: 100, text: 'This elegant floor lamp features a sleek design with a tall, slender body. Its soft lighting creates a warm and inviting atmosphere, making it the perfect addition to any room.', fontSize: 10, fontFamily: 'Inter', fill: '#726a5e', lineHeight: 1.5, zIndex: 10, rotation: 0, opacity: 1 },
        ]
      },
      {
        pageNumber: 4,
        elements: [
          { id: 'nt-p4-bg', type: 'shape', x: 0, y: 0, width: 794, height: 1123, fill: '#e7e3d9', zIndex: 0, rotation: 0, opacity: 1 },
          // Item 1
          { id: 'nt-p4-img1', type: 'product-block', productId: 'p6', cardTheme: 'minimal-image', x: 464, y: 75, width: 250, height: 250, zIndex: 1, rotation: 0, opacity: 1 },
          { id: 'nt-p4-title1', type: 'text', x: 80, y: 85, width: 364, height: 30, text: 'CHIC NIGHTSTAND', fontSize: 22, fontFamily: 'Playfair Display', fontWeight: '700', fill: '#433a2e', zIndex: 2, rotation: 0, opacity: 1, productId: 'p6' },
          { id: 'nt-p4-badge1', type: 'shape', x: 80, y: 130, width: 100, height: 40, fill: '#433a2e', effectRoundness: 4, zIndex: 3, rotation: 0, opacity: 1 },
          { id: 'nt-p4-price1', type: 'text', x: 80, y: 140, width: 100, height: 20, text: '$170', fontSize: 18, fontFamily: 'Inter', fontWeight: '700', fill: '#ffffff', textAlign: 'center', zIndex: 4, rotation: 0, opacity: 1, productId: 'p6' },
          { id: 'nt-p4-desc1', type: 'text', x: 80, y: 190, width: 364, height: 100, text: 'A chic and practical nightstand designed to complement any bedroom decor. It features a spacious drawer for storage and a top surface for lamps or other bedside essentials.', fontSize: 10, fontFamily: 'Inter', fill: '#726a5e', lineHeight: 1.5, zIndex: 5, rotation: 0, opacity: 1 },
          // Item 2
          { id: 'nt-p4-img2', type: 'product-block', productId: 'p1', cardTheme: 'minimal-image', x: 464, y: 405, width: 250, height: 250, zIndex: 6, rotation: 0, opacity: 1 },
          { id: 'nt-p4-title2', type: 'text', x: 80, y: 395, width: 364, height: 30, text: 'VELVET UPHOLSTERED DINING CHAIRS', fontSize: 22, fontFamily: 'Playfair Display', fontWeight: '700', fill: '#433a2e', zIndex: 7, rotation: 0, opacity: 1, productId: 'p1' },
          { id: 'nt-p4-badge2', type: 'shape', x: 80, y: 440, width: 100, height: 40, fill: '#433a2e', effectRoundness: 4, zIndex: 8, rotation: 0, opacity: 1 },
          { id: 'nt-p4-price2', type: 'text', x: 80, y: 450, width: 100, height: 20, text: '$150', fontSize: 18, fontFamily: 'Inter', fontWeight: '700', fill: '#ffffff', textAlign: 'center', zIndex: 9, rotation: 0, opacity: 1, productId: 'p1' },
          { id: 'nt-p4-desc2', type: 'text', x: 80, y: 500, width: 364, height: 100, text: 'These velvet dining chairs offer a sophisticated touch to your dining room. The plush velvet fabric and sturdy frame provide both comfort and durability.', fontSize: 10, fontFamily: 'Inter', fill: '#726a5e', lineHeight: 1.5, zIndex: 10, rotation: 0, opacity: 1 },
          // Item 3
          { id: 'nt-p4-img3', type: 'product-block', productId: 'p2', cardTheme: 'minimal-image', x: 464, y: 705, width: 250, height: 380, zIndex: 11, rotation: 0, opacity: 1 },
          { id: 'nt-p4-title3', type: 'text', x: 80, y: 695, width: 364, height: 30, text: 'MULTIFUNCTIONAL BOOKSHELF', fontSize: 22, fontFamily: 'Playfair Display', fontWeight: '700', fill: '#433a2e', zIndex: 12, rotation: 0, opacity: 1, productId: 'p2' },
          { id: 'nt-p4-badge3', type: 'shape', x: 80, y: 740, width: 100, height: 40, fill: '#433a2e', effectRoundness: 4, zIndex: 13, rotation: 0, opacity: 1 },
          { id: 'nt-p4-price3', type: 'text', x: 80, y: 750, width: 100, height: 20, text: '$350', fontSize: 18, fontFamily: 'Inter', fontWeight: '700', fill: '#ffffff', textAlign: 'center', zIndex: 14, rotation: 0, opacity: 1, productId: 'p2' },
          { id: 'nt-p4-desc3', type: 'text', x: 80, y: 800, width: 364, height: 100, text: 'A versatile bookshelf that not only stores your books but also doubles as a stylish display for home decor items. It\'s ideal for modern living rooms or home offices.', fontSize: 10, fontFamily: 'Inter', fill: '#726a5e', lineHeight: 1.5, zIndex: 15, rotation: 0, opacity: 1 },
        ]
      }
    ]
  },
  {
    id: 'tpl-borcelle',
    name: 'Borcelle Sunglasses',
    description: 'High-end editorial sunglasses catalog with a warm boutique aesthetic.',
    thumbnail: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=400',
    themeId: 'borcelle-warm',
    pages: [
      {
        pageNumber: 1,
        elements: [
          { id: 'bor-p1-bg', type: 'shape', x: 0, y: 0, width: 794, height: 1123, fill: '#d2cdc1', zIndex: 0, rotation: 0, opacity: 1 },
          { id: 'bor-p1-label', type: 'text', x: 80, y: 150, width: 634, height: 30, text: 'CATALOGUE', fontSize: 18, fontFamily: 'Montserrat', fontWeight: '500', fill: '#4a3728', textAlign: 'center', letterSpacing: 4, zIndex: 1, rotation: 0, opacity: 1 },
          { id: 'bor-p1-title', type: 'text', x: 80, y: 180, width: 634, height: 100, text: 'BORCELLE', fontSize: 84, fontFamily: 'Montserrat', fontWeight: '900', fill: '#4a3728', textAlign: 'center', letterSpacing: 8, zIndex: 2, rotation: 0, opacity: 1 },
          { id: 'bor-p1-sub', type: 'text', x: 80, y: 280, width: 634, height: 40, text: 'SUNGLASSES', fontSize: 32, fontFamily: 'Montserrat', fontWeight: '400', fill: '#4a3728', textAlign: 'center', letterSpacing: 6, zIndex: 3, rotation: 0, opacity: 1 },
          { id: 'bor-p1-img', type: 'product-block', productId: 'p1', cardTheme: 'minimal-image', x: 80, y: 380, width: 634, height: 620, zIndex: 4, rotation: 0, opacity: 1 },
          { id: 'bor-p1-url', type: 'text', x: 80, y: 1020, width: 634, height: 20, text: 'WWW.REALLYGREATSITE.COM', fontSize: 10, fontFamily: 'Inter', fill: '#4a3728', textAlign: 'center', letterSpacing: 2, zIndex: 5, rotation: 0, opacity: 1 },
        ]
      },
      {
        pageNumber: 2,
        elements: [
          { id: 'bor-p2-bg', type: 'shape', x: 0, y: 0, width: 794, height: 1123, fill: '#ccc4ba', zIndex: 0, rotation: 0, opacity: 1 },
          { id: 'bor-p2-label', type: 'text', x: 80, y: 140, width: 634, height: 30, text: 'TABLE OF', fontSize: 28, fontFamily: 'Montserrat', fontWeight: '500', fill: '#4a3728', textAlign: 'center', letterSpacing: 4, zIndex: 1, rotation: 0, opacity: 1 },
          { id: 'bor-p2-title', type: 'text', x: 80, y: 180, width: 634, height: 100, text: 'CONTENT', fontSize: 84, fontFamily: 'Montserrat', fontWeight: '900', fill: '#4a3728', textAlign: 'center', letterSpacing: 8, zIndex: 2, rotation: 0, opacity: 1 },
          { id: 'bor-p2-box1-bg', type: 'shape', x: 130, y: 300, width: 534, height: 130, fill: '#ffffff', effectRoundness: 30, zIndex: 3, rotation: 0, opacity: 1 },
          { id: 'bor-p2-box1-num', type: 'text', x: 160, y: 315, width: 474, height: 30, text: '1. BRAND', fontSize: 48, fontFamily: 'Montserrat', fontWeight: '900', fill: '#4a3728', zIndex: 4, rotation: 0, opacity: 1 },
          { id: 'bor-p2-box1-txt', type: 'text', x: 160, y: 365, width: 474, height: 40, text: 'Introducing Borcelle Sunglasses, where style meets quality to\nprovide you with the ultimate eyewear experience.', fontSize: 10, fontFamily: 'Inter', fill: '#4a3728', zIndex: 5, rotation: 0, opacity: 1 },
          { id: 'bor-p2-box2-bg', type: 'shape', x: 130, y: 450, width: 534, height: 130, fill: '#ffffff', effectRoundness: 30, zIndex: 6, rotation: 0, opacity: 1 },
          { id: 'bor-p2-box2-num', type: 'text', x: 160, y: 465, width: 474, height: 30, text: '2. PRODUCT', fontSize: 48, fontFamily: 'Montserrat', fontWeight: '900', fill: '#4a3728', zIndex: 7, rotation: 0, opacity: 1 },
          { id: 'bor-p2-box2-txt', type: 'text', x: 160, y: 515, width: 474, height: 40, text: 'Introducing Borcelle Sunglasses, where style meets quality to\nprovide you with the ultimate eyewear experience.', fontSize: 10, fontFamily: 'Inter', fill: '#4a3728', zIndex: 8, rotation: 0, opacity: 1 },
          { id: 'bor-p2-box3-bg', type: 'shape', x: 130, y: 600, width: 534, height: 130, fill: '#ffffff', effectRoundness: 30, zIndex: 9, rotation: 0, opacity: 1 },
          { id: 'bor-p2-box3-num', type: 'text', x: 160, y: 615, width: 474, height: 30, text: '3. TESTIMONY', fontSize: 48, fontFamily: 'Montserrat', fontWeight: '900', fill: '#4a3728', zIndex: 10, rotation: 0, opacity: 1 },
          { id: 'bor-p2-box3-txt', type: 'text', x: 160, y: 665, width: 474, height: 40, text: 'Introducing Borcelle Sunglasses, where style meets quality to\nprovide you with the ultimate eyewear experience.', fontSize: 10, fontFamily: 'Inter', fill: '#4a3728', zIndex: 11, rotation: 0, opacity: 1 },
          { id: 'bor-p2-box4-bg', type: 'shape', x: 130, y: 750, width: 534, height: 130, fill: '#ffffff', effectRoundness: 30, zIndex: 12, rotation: 0, opacity: 1 },
          { id: 'bor-p2-box4-num', type: 'text', x: 160, y: 765, width: 474, height: 30, text: '4. CONTACT', fontSize: 48, fontFamily: 'Montserrat', fontWeight: '900', fill: '#4a3728', zIndex: 13, rotation: 0, opacity: 1 },
          { id: 'bor-p2-box4-txt', type: 'text', x: 160, y: 815, width: 474, height: 40, text: 'Introducing Borcelle Sunglasses, where style meets quality to\nprovide you with the ultimate eyewear experience.', fontSize: 10, fontFamily: 'Inter', fill: '#4a3728', zIndex: 14, rotation: 0, opacity: 1 },
        ]
      },
      {
        pageNumber: 3,
        elements: [
          { id: 'bor-p3-bg', type: 'shape', x: 0, y: 0, width: 794, height: 1123, fill: '#ccc4ba', zIndex: 0, rotation: 0, opacity: 1 },
          { id: 'bor-p3-img', type: 'image', x: 60, y: 60, width: 674, height: 250, src: 'https://images.unsplash.com/photo-1511499767350-a1590fdb7307?auto=format&fit=crop&q=80&w=800', zIndex: 1, rotation: 0, opacity: 1 },
          { id: 'bor-p3-label', type: 'text', x: 130, y: 350, width: 534, height: 40, text: 'ABOUT', fontSize: 32, fontFamily: 'Montserrat', fontWeight: '500', fill: '#4a3728', letterSpacing: 4, zIndex: 2, rotation: 0, opacity: 1 },
          { id: 'bor-p3-title', type: 'text', x: 130, y: 400, width: 534, height: 100, text: 'BRAND', fontSize: 84, fontFamily: 'Montserrat', fontWeight: '900', fill: '#4a3728', letterSpacing: 8, zIndex: 3, rotation: 0, opacity: 1 },
          { id: 'bor-p3-desc', type: 'text', x: 130, y: 520, width: 534, height: 500, text: 'Introducing Borcelle Sunglasses, where style meets quality to provide you with the ultimate eyewear experience.\n\nStep into the world of Borcelle Sunglasses and elevate your style game to a whole new level. Our sunglasses are not just an accessory, they are a statement piece that exudes elegance and sophistication. Crafted with precision and attention to detail, each pair of Borcelle sunglasses is a true masterpiece, designed to complement your unique personality and individuality. Whether you\'re lounging on the beach, strolling through the city streets, or attending a glamorous event, Borcelle Sunglasses will effortlessly elevate your look and set you apart from the crowd. Experience the perfect blend of style and quality with Borcelle Sunglasses - because you deserve nothing but the best.', fontSize: 13, fontFamily: 'Inter', fill: '#4a3728', lineHeight: 1.6, zIndex: 4, rotation: 0, opacity: 1 },
        ]
      },
      {
        pageNumber: 4,
        elements: [
          { id: 'bor-p4-bg', type: 'shape', x: 0, y: 0, width: 794, height: 1123, fill: '#ccc4ba', zIndex: 0, rotation: 0, opacity: 1 },
          { id: 'bor-p4-label', type: 'text', x: 400, y: 130, width: 314, height: 40, text: 'OUR CEO', fontSize: 32, fontFamily: 'Montserrat', fontWeight: '500', fill: '#4a3728', textAlign: 'right', letterSpacing: 4, zIndex: 1, rotation: 0, opacity: 1 },
          { id: 'bor-p4-title', type: 'text', x: 400, y: 180, width: 314, height: 100, text: 'SAID', fontSize: 84, fontFamily: 'Montserrat', fontWeight: '900', fill: '#4a3728', textAlign: 'right', letterSpacing: 8, zIndex: 2, rotation: 0, opacity: 1 },
          { id: 'bor-p4-quote', type: 'text', x: 150, y: 290, width: 564, height: 150, text: 'Borcelle Sunglasses will effortlessly elevate your look and set you apart from the crowd. Experience the perfect blend of style and quality with Borcelle Sunglasses - because you deserve nothing but the best.', fontSize: 13, fontFamily: 'Inter', fill: '#4a3728', lineHeight: 1.5, zIndex: 3, rotation: 0, opacity: 1 },
          { id: 'bor-p4-sig', type: 'text', x: 150, y: 440, width: 564, height: 40, text: 'JULIANA SILVA\nCEO BORCELLE', fontSize: 11, fontFamily: 'Inter', fontWeight: '700', fill: '#4a3728', textAlign: 'right', fontStyle: 'italic', zIndex: 4, rotation: 0, opacity: 1 },
          { id: 'bor-p4-img', type: 'image', x: 150, y: 500, width: 564, height: 500, src: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=600', zIndex: 5, rotation: 0, opacity: 1 },
        ]
      },
      {
        pageNumber: 5,
        elements: [
          { id: 'bor-p5-bg', type: 'shape', x: 0, y: 0, width: 794, height: 1123, fill: '#ccc4ba', zIndex: 0, rotation: 0, opacity: 1 },
          { id: 'bor-p5-label', type: 'text', x: 400, y: 140, width: 314, height: 40, text: 'BRAND', fontSize: 32, fontFamily: 'Montserrat', fontWeight: '500', fill: '#4a3728', textAlign: 'right', letterSpacing: 4, zIndex: 1, rotation: 0, opacity: 1 },
          { id: 'bor-p5-title', type: 'text', x: 400, y: 190, width: 314, height: 100, text: 'VISION', fontSize: 84, fontFamily: 'Montserrat', fontWeight: '900', fill: '#4a3728', textAlign: 'right', letterSpacing: 8, zIndex: 2, rotation: 0, opacity: 1 },
          { id: 'bor-p5-desc', type: 'text', x: 170, y: 300, width: 544, height: 250, text: 'Borcelle sunglasses bring a new perspective to the world around you. With innovative designs and high-quality lenses, Borcelle sunglasses are not just an accessory but a statement of style and sophistication. Whether you\'re soaking up the sun on a beach or navigating through a bustling city, Borcelle sunglasses provide unparalleled clarity and protection for your eyes. Elevate your vision with Borcelle and see the world in a whole new light.', fontSize: 13, fontFamily: 'Inter', fill: '#4a3728', lineHeight: 1.6, zIndex: 3, rotation: 0, opacity: 1 },
          { id: 'bor-p5-img', type: 'image', x: 60, y: 560, width: 674, height: 500, src: 'https://images.unsplash.com/photo-1544717297-fa15c3902722?auto=format&fit=crop&q=80&w=800', zIndex: 4, rotation: 0, opacity: 1 },
        ]
      },
      {
        pageNumber: 6,
        elements: [
          { id: 'bor-p6-bg', type: 'shape', x: 0, y: 0, width: 794, height: 1123, fill: '#ccc4ba', zIndex: 0, rotation: 0, opacity: 1 },
          { id: 'bor-p6-img', type: 'image', x: 60, y: 60, width: 674, height: 400, src: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=800', zIndex: 1, rotation: 0, opacity: 1 },
          { id: 'bor-p6-label', type: 'text', x: 130, y: 500, width: 534, height: 40, text: 'BRAND', fontSize: 32, fontFamily: 'Montserrat', fontWeight: '500', fill: '#4a3728', letterSpacing: 4, zIndex: 2, rotation: 0, opacity: 1 },
          { id: 'bor-p6-title', type: 'text', x: 130, y: 550, width: 534, height: 100, text: 'MISSION', fontSize: 84, fontFamily: 'Montserrat', fontWeight: '900', fill: '#4a3728', letterSpacing: 8, zIndex: 3, rotation: 0, opacity: 1 },
          { id: 'bor-p6-desc', type: 'text', x: 130, y: 670, width: 534, height: 400, text: 'Our mission at Borcelle sunglasses is to provide stylish and high-quality eyewear that not only protects your eyes but also elevates your look. We are dedicated to creating sunglasses that are both functional and fashionable, so you can feel confident and chic wherever you go. With a focus on craftsmanship and design, we aim to offer a wide range of options to suit every style and personality. Join us in embracing the sun with flair and sophistication through our collection of trendy sunglasses.', fontSize: 13, fontFamily: 'Inter', fill: '#4a3728', lineHeight: 1.6, zIndex: 4, rotation: 0, opacity: 1 },
        ]
      },
      {
        pageNumber: 7,
        elements: [
          { id: 'bor-p7-bg', type: 'shape', x: 0, y: 0, width: 794, height: 1123, fill: '#ccc4ba', zIndex: 0, rotation: 0, opacity: 1 },
          // Row 1
          { id: 'bor-p7-img1', type: 'product-block', productId: 'p1', cardTheme: 'minimal-image', x: 60, y: 80, width: 320, height: 320, zIndex: 1, rotation: 0, opacity: 1 },
          { id: 'bor-p7-lbl1', type: 'text', x: 400, y: 100, width: 334, height: 20, text: 'ABOUT', fontSize: 12, fontFamily: 'Montserrat', fill: '#4a3728', letterSpacing: 2, zIndex: 2, rotation: 0, opacity: 1 },
          { id: 'bor-p7-title1', type: 'text', x: 400, y: 125, width: 334, height: 40, text: 'PRODUCT', fontSize: 32, fontFamily: 'Montserrat', fontWeight: '900', fill: '#4a3728', zIndex: 3, rotation: 0, opacity: 1, productId: 'p1' },
          { id: 'bor-p7-desc1', type: 'text', x: 400, y: 175, width: 334, height: 60, text: 'Borcelle Sunglasses will effortlessly elevate your look and set you apart from the crowd.', fontSize: 10, fontFamily: 'Inter', fill: '#4a3728', zIndex: 4, rotation: 0, opacity: 1 },
          { id: 'bor-p7-badge1', type: 'shape', x: 400, y: 280, width: 220, height: 60, fill: '#ffffff', effectRoundness: 30, zIndex: 5, rotation: 0, opacity: 1 },
          { id: 'bor-p7-spt1', type: 'text', x: 420, y: 300, width: 80, height: 30, text: 'SPECIAL\nPRICE', fontSize: 7, fontFamily: 'Montserrat', fill: '#4a3728', zIndex: 6, rotation: 0, opacity: 1 },
          { id: 'bor-p7-price1', type: 'text', x: 500, y: 295, width: 100, height: 40, text: '$199', fontSize: 24, fontFamily: 'Montserrat', fontWeight: '900', fill: '#4a3728', zIndex: 7, rotation: 0, opacity: 1, productId: 'p1' },
          // Row 2
          { id: 'bor-p7-img2', type: 'product-block', productId: 'p2', cardTheme: 'minimal-image', x: 60, y: 420, width: 320, height: 320, zIndex: 8, rotation: 0, opacity: 1 },
          { id: 'bor-p7-lbl2', type: 'text', x: 400, y: 440, width: 334, height: 20, text: 'ABOUT', fontSize: 12, fontFamily: 'Montserrat', fill: '#4a3728', letterSpacing: 2, zIndex: 9, rotation: 0, opacity: 1 },
          { id: 'bor-p7-title2', type: 'text', x: 400, y: 465, width: 334, height: 40, text: 'PRODUCT', fontSize: 32, fontFamily: 'Montserrat', fontWeight: '900', fill: '#4a3728', zIndex: 10, rotation: 0, opacity: 1, productId: 'p2' },
          { id: 'bor-p7-desc2', type: 'text', x: 400, y: 515, width: 334, height: 60, text: 'Borcelle Sunglasses will effortlessly elevate your look and set you apart from the crowd.', fontSize: 10, fontFamily: 'Inter', fill: '#4a3728', zIndex: 11, rotation: 0, opacity: 1 },
          { id: 'bor-p7-badge2', type: 'shape', x: 400, y: 620, width: 220, height: 60, fill: '#ffffff', effectRoundness: 30, zIndex: 12, rotation: 0, opacity: 1 },
          { id: 'bor-p7-spt2', type: 'text', x: 420, y: 640, width: 80, height: 30, text: 'SPECIAL\nPRICE', fontSize: 7, fontFamily: 'Montserrat', fill: '#4a3728', zIndex: 13, rotation: 0, opacity: 1 },
          { id: 'bor-p7-price2', type: 'text', x: 500, y: 635, width: 100, height: 40, text: '$199', fontSize: 24, fontFamily: 'Montserrat', fontWeight: '900', fill: '#4a3728', zIndex: 14, rotation: 0, opacity: 1, productId: 'p2' },
          // Row 3
          { id: 'bor-p7-img3', type: 'product-block', productId: 'p3', cardTheme: 'minimal-image', x: 60, y: 760, width: 320, height: 320, zIndex: 15, rotation: 0, opacity: 1 },
          { id: 'bor-p7-lbl3', type: 'text', x: 400, y: 780, width: 334, height: 20, text: 'ABOUT', fontSize: 12, fontFamily: 'Montserrat', fill: '#4a3728', letterSpacing: 2, zIndex: 16, rotation: 0, opacity: 1 },
          { id: 'bor-p7-title3', type: 'text', x: 400, y: 805, width: 334, height: 40, text: 'PRODUCT', fontSize: 32, fontFamily: 'Montserrat', fontWeight: '900', fill: '#4a3728', zIndex: 17, rotation: 0, opacity: 1, productId: 'p3' },
          { id: 'bor-p7-desc3', type: 'text', x: 400, y: 855, width: 334, height: 60, text: 'Borcelle Sunglasses will effortlessly elevate your look and set you apart from the crowd.', fontSize: 10, fontFamily: 'Inter', fill: '#4a3728', zIndex: 18, rotation: 0, opacity: 1 },
          { id: 'bor-p7-badge3', type: 'shape', x: 400, y: 960, width: 220, height: 60, fill: '#ffffff', effectRoundness: 30, zIndex: 19, rotation: 0, opacity: 1 },
          { id: 'bor-p7-spt3', type: 'text', x: 420, y: 980, width: 80, height: 30, text: 'SPECIAL\nPRICE', fontSize: 7, fontFamily: 'Montserrat', fill: '#4a3728', zIndex: 20, rotation: 0, opacity: 1 },
          { id: 'bor-p7-price3', type: 'text', x: 500, y: 975, width: 100, height: 40, text: '$199', fontSize: 24, fontFamily: 'Montserrat', fontWeight: '900', fill: '#4a3728', zIndex: 21, rotation: 0, opacity: 1, productId: 'p3' },
        ]
      },
      {
        pageNumber: 8,
        elements: [
          { id: 'bor-p8-bg', type: 'shape', x: 0, y: 0, width: 794, height: 1123, fill: '#ccc4ba', zIndex: 0, rotation: 0, opacity: 1 },
          // Row 1 (Right Img)
          { id: 'bor-p8-img1', type: 'product-block', productId: 'p4', cardTheme: 'minimal-image', x: 414, y: 80, width: 320, height: 320, zIndex: 1, rotation: 0, opacity: 1 },
          { id: 'bor-p8-lbl1', type: 'text', x: 60, y: 100, width: 334, height: 20, text: 'ABOUT', fontSize: 12, fontFamily: 'Montserrat', fill: '#4a3728', textAlign: 'right', letterSpacing: 2, zIndex: 2, rotation: 0, opacity: 1 },
          { id: 'bor-p8-title1', type: 'text', x: 60, y: 125, width: 334, height: 40, text: 'PRODUCT', fontSize: 32, fontFamily: 'Montserrat', fontWeight: '900', fill: '#4a3728', textAlign: 'right', zIndex: 3, rotation: 0, opacity: 1, productId: 'p4' },
          { id: 'bor-p8-desc1', type: 'text', x: 60, y: 175, width: 334, height: 60, text: 'Borcelle Sunglasses will effortlessly elevate your look and set you apart from the crowd.', fontSize: 10, fontFamily: 'Inter', fill: '#4a3728', textAlign: 'right', zIndex: 4, rotation: 0, opacity: 1 },
          { id: 'bor-p8-badge1', type: 'shape', x: 174, y: 280, width: 220, height: 60, fill: '#ffffff', effectRoundness: 30, zIndex: 5, rotation: 0, opacity: 1 },
          { id: 'bor-p8-spt1', type: 'text', x: 194, y: 300, width: 80, height: 30, text: 'SPECIAL\nPRICE', fontSize: 7, fontFamily: 'Montserrat', fill: '#4a3728', zIndex: 6, rotation: 0, opacity: 1 },
          { id: 'bor-p8-price1', type: 'text', x: 274, y: 295, width: 100, height: 40, text: '$199', fontSize: 24, fontFamily: 'Montserrat', fontWeight: '900', fill: '#4a3728', zIndex: 7, rotation: 0, opacity: 1, productId: 'p4' },
          // Row 2
          { id: 'bor-p8-img2', type: 'product-block', productId: 'p5', cardTheme: 'minimal-image', x: 414, y: 420, width: 320, height: 320, zIndex: 8, rotation: 0, opacity: 1 },
          { id: 'bor-p8-lbl2', type: 'text', x: 60, y: 440, width: 334, height: 20, text: 'ABOUT', fontSize: 12, fontFamily: 'Montserrat', fill: '#4a3728', textAlign: 'right', letterSpacing: 2, zIndex: 9, rotation: 0, opacity: 1 },
          { id: 'bor-p8-title2', type: 'text', x: 60, y: 465, width: 334, height: 40, text: 'PRODUCT', fontSize: 32, fontFamily: 'Montserrat', fontWeight: '900', fill: '#4a3728', textAlign: 'right', zIndex: 10, rotation: 0, opacity: 1, productId: 'p5' },
          { id: 'bor-p8-desc2', type: 'text', x: 60, y: 515, width: 334, height: 60, text: 'Borcelle Sunglasses will effortlessly elevate your look and set you apart from the crowd.', fontSize: 10, fontFamily: 'Inter', fill: '#4a3728', textAlign: 'right', zIndex: 11, rotation: 0, opacity: 1 },
          { id: 'bor-p8-badge2', type: 'shape', x: 174, y: 620, width: 220, height: 60, fill: '#ffffff', effectRoundness: 30, zIndex: 12, rotation: 0, opacity: 1 },
          { id: 'bor-p8-spt2', type: 'text', x: 194, y: 640, width: 80, height: 30, text: 'SPECIAL\nPRICE', fontSize: 7, fontFamily: 'Montserrat', fill: '#4a3728', zIndex: 13, rotation: 0, opacity: 1 },
          { id: 'bor-p8-price2', type: 'text', x: 274, y: 635, width: 100, height: 40, text: '$199', fontSize: 24, fontFamily: 'Montserrat', fontWeight: '900', fill: '#4a3728', zIndex: 14, rotation: 0, opacity: 1, productId: 'p5' },
          // Row 3
          { id: 'bor-p8-img3', type: 'product-block', productId: 'p6', cardTheme: 'minimal-image', x: 414, y: 760, width: 320, height: 320, zIndex: 15, rotation: 0, opacity: 1 },
          { id: 'bor-p8-lbl3', type: 'text', x: 60, y: 780, width: 334, height: 20, text: 'ABOUT', fontSize: 12, fontFamily: 'Montserrat', fill: '#4a3728', textAlign: 'right', letterSpacing: 2, zIndex: 16, rotation: 0, opacity: 1 },
          { id: 'bor-p8-title3', type: 'text', x: 60, y: 805, width: 334, height: 40, text: 'PRODUCT', fontSize: 32, fontFamily: 'Montserrat', fontWeight: '900', fill: '#4a3728', textAlign: 'right', zIndex: 17, rotation: 0, opacity: 1, productId: 'p6' },
          { id: 'bor-p8-desc3', type: 'text', x: 60, y: 855, width: 334, height: 60, text: 'Borcelle Sunglasses will effortlessly elevate your look and set you apart from the crowd.', fontSize: 10, fontFamily: 'Inter', fill: '#4a3728', textAlign: 'right', zIndex: 18, rotation: 0, opacity: 1 },
          { id: 'bor-p8-badge3', type: 'shape', x: 174, y: 960, width: 220, height: 60, fill: '#ffffff', effectRoundness: 30, zIndex: 19, rotation: 0, opacity: 1 },
          { id: 'bor-p8-spt3', type: 'text', x: 194, y: 980, width: 80, height: 30, text: 'SPECIAL\nPRICE', fontSize: 7, fontFamily: 'Montserrat', fill: '#4a3728', zIndex: 20, rotation: 0, opacity: 1 },
          { id: 'bor-p8-price3', type: 'text', x: 274, y: 975, width: 100, height: 40, text: '$199', fontSize: 24, fontFamily: 'Montserrat', fontWeight: '900', fill: '#4a3728', zIndex: 21, rotation: 0, opacity: 1, productId: 'p6' },
        ]
      },
      {
        pageNumber: 9,
        elements: [
          { id: 'bor-p9-bg', type: 'shape', x: 0, y: 0, width: 794, height: 1123, fill: '#ccc4ba', zIndex: 0, rotation: 0, opacity: 1 },
          // Row 1 (Variation of Left Img)
          { id: 'bor-p9-img1', type: 'product-block', productId: 'p4', cardTheme: 'minimal-image', x: 60, y: 80, width: 320, height: 320, zIndex: 1, rotation: 0, opacity: 1 },
          { id: 'bor-p9-lbl1', type: 'text', x: 400, y: 100, width: 334, height: 20, text: 'ABOUT', fontSize: 12, fontFamily: 'Montserrat', fill: '#4a3728', letterSpacing: 2, zIndex: 2, rotation: 0, opacity: 1 },
          { id: 'bor-p9-title1', type: 'text', x: 400, y: 125, width: 334, height: 40, text: 'PRODUCT', fontSize: 32, fontFamily: 'Montserrat', fontWeight: '900', fill: '#4a3728', zIndex: 3, rotation: 0, opacity: 1, productId: 'p4' },
          { id: 'bor-p9-desc1', type: 'text', x: 400, y: 175, width: 334, height: 60, text: 'Borcelle Sunglasses will effortlessly elevate your look and set you apart from the crowd.', fontSize: 10, fontFamily: 'Inter', fill: '#4a3728', zIndex: 4, rotation: 0, opacity: 1 },
          { id: 'bor-p9-badge1', type: 'shape', x: 400, y: 280, width: 220, height: 60, fill: '#ffffff', effectRoundness: 30, zIndex: 5, rotation: 0, opacity: 1 },
          { id: 'bor-p9-spt1', type: 'text', x: 420, y: 300, width: 80, height: 30, text: 'SPECIAL\nPRICE', fontSize: 7, fontFamily: 'Montserrat', fill: '#4a3728', zIndex: 6, rotation: 0, opacity: 1 },
          { id: 'bor-p9-price1', type: 'text', x: 500, y: 295, width: 100, height: 40, text: '$199', fontSize: 24, fontFamily: 'Montserrat', fontWeight: '900', fill: '#4a3728', zIndex: 7, rotation: 0, opacity: 1, productId: 'p4' },
          // Row 2
          { id: 'bor-p9-img2', type: 'product-block', productId: 'p5', cardTheme: 'minimal-image', x: 60, y: 420, width: 320, height: 320, zIndex: 8, rotation: 0, opacity: 1 },
          { id: 'bor-p9-lbl2', type: 'text', x: 400, y: 440, width: 334, height: 20, text: 'ABOUT', fontSize: 12, fontFamily: 'Montserrat', fill: '#4a3728', letterSpacing: 2, zIndex: 9, rotation: 0, opacity: 1 },
          { id: 'bor-p9-title2', type: 'text', x: 400, y: 465, width: 334, height: 40, text: 'PRODUCT', fontSize: 32, fontFamily: 'Montserrat', fontWeight: '900', fill: '#4a3728', zIndex: 10, rotation: 0, opacity: 1, productId: 'p5' },
          { id: 'bor-p9-desc2', type: 'text', x: 400, y: 515, width: 334, height: 60, text: 'Borcelle Sunglasses will effortlessly elevate your look and set you apart from the crowd.', fontSize: 10, fontFamily: 'Inter', fill: '#4a3728', zIndex: 11, rotation: 0, opacity: 1 },
          { id: 'bor-p9-badge2', type: 'shape', x: 400, y: 620, width: 220, height: 60, fill: '#ffffff', effectRoundness: 30, zIndex: 12, rotation: 0, opacity: 1 },
          { id: 'bor-p9-spt2', type: 'text', x: 420, y: 640, width: 80, height: 30, text: 'SPECIAL\nPRICE', fontSize: 7, fontFamily: 'Montserrat', fill: '#4a3728', zIndex: 13, rotation: 0, opacity: 1 },
          { id: 'bor-p9-price2', type: 'text', x: 500, y: 635, width: 100, height: 40, text: '$199', fontSize: 24, fontFamily: 'Montserrat', fontWeight: '900', fill: '#4a3728', zIndex: 14, rotation: 0, opacity: 1, productId: 'p5' },
          // Row 3 (Using another product)
          { id: 'bor-p9-img3', type: 'product-block', productId: 'p6', cardTheme: 'minimal-image', x: 60, y: 760, width: 320, height: 320, zIndex: 15, rotation: 0, opacity: 1 },
          { id: 'bor-p9-lbl3', type: 'text', x: 400, y: 780, width: 334, height: 20, text: 'ABOUT', fontSize: 12, fontFamily: 'Montserrat', fill: '#4a3728', letterSpacing: 2, zIndex: 16, rotation: 0, opacity: 1 },
          { id: 'bor-p9-title3', type: 'text', x: 400, y: 805, width: 334, height: 40, text: 'PRODUCT', fontSize: 32, fontFamily: 'Montserrat', fontWeight: '900', fill: '#4a3728', zIndex: 17, rotation: 0, opacity: 1, productId: 'p6' },
          { id: 'bor-p9-desc3', type: 'text', x: 400, y: 855, width: 334, height: 60, text: 'Borcelle Sunglasses will effortlessly elevate your look and set you apart from the crowd.', fontSize: 10, fontFamily: 'Inter', fill: '#4a3728', zIndex: 18, rotation: 0, opacity: 1 },
          { id: 'bor-p9-badge3', type: 'shape', x: 400, y: 960, width: 220, height: 60, fill: '#ffffff', effectRoundness: 30, zIndex: 19, rotation: 0, opacity: 1 },
          { id: 'bor-p9-spt3', type: 'text', x: 420, y: 980, width: 80, height: 30, text: 'SPECIAL\nPRICE', fontSize: 7, fontFamily: 'Montserrat', fill: '#4a3728', zIndex: 20, rotation: 0, opacity: 1 },
          { id: 'bor-p9-price3', type: 'text', x: 500, y: 975, width: 100, height: 40, text: '$199', fontSize: 24, fontFamily: 'Montserrat', fontWeight: '900', fill: '#4a3728', zIndex: 21, rotation: 0, opacity: 1, productId: 'p6' },
        ]
      },
      {
        pageNumber: 10,
        elements: [
          { id: 'bor-p10-bg', type: 'shape', x: 0, y: 0, width: 794, height: 1123, fill: '#ccc4ba', zIndex: 0, rotation: 0, opacity: 1 },
          // Row 1 (Variation Right Img)
          { id: 'bor-p10-img1', type: 'product-block', productId: 'p1', cardTheme: 'minimal-image', x: 414, y: 80, width: 320, height: 320, zIndex: 1, rotation: 0, opacity: 1 },
          { id: 'bor-p10-lbl1', type: 'text', x: 60, y: 100, width: 334, height: 20, text: 'ABOUT', fontSize: 12, fontFamily: 'Montserrat', fill: '#4a3728', textAlign: 'right', letterSpacing: 2, zIndex: 2, rotation: 0, opacity: 1 },
          { id: 'bor-p10-title1', type: 'text', x: 60, y: 125, width: 334, height: 40, text: 'PRODUCT', fontSize: 32, fontFamily: 'Montserrat', fontWeight: '900', fill: '#4a3728', textAlign: 'right', zIndex: 3, rotation: 0, opacity: 1, productId: 'p1' },
          { id: 'bor-p10-desc1', type: 'text', x: 60, y: 175, width: 334, height: 60, text: 'Borcelle Sunglasses will effortlessly elevate your look and set you apart from the crowd.', fontSize: 10, fontFamily: 'Inter', fill: '#4a3728', textAlign: 'right', zIndex: 4, rotation: 0, opacity: 1 },
          { id: 'bor-p10-badge1', type: 'shape', x: 174, y: 280, width: 220, height: 60, fill: '#ffffff', effectRoundness: 30, zIndex: 5, rotation: 0, opacity: 1 },
          { id: 'bor-p10-spt1', type: 'text', x: 194, y: 300, width: 80, height: 30, text: 'SPECIAL\nPRICE', fontSize: 7, fontFamily: 'Montserrat', fill: '#4a3728', zIndex: 6, rotation: 0, opacity: 1 },
          { id: 'bor-p10-price1', type: 'text', x: 274, y: 295, width: 100, height: 40, text: '$199', fontSize: 24, fontFamily: 'Montserrat', fontWeight: '900', fill: '#4a3728', zIndex: 7, rotation: 0, opacity: 1, productId: 'p1' },
          // Row 2
          { id: 'bor-p10-img2', type: 'product-block', productId: 'p2', cardTheme: 'minimal-image', x: 414, y: 420, width: 320, height: 320, zIndex: 8, rotation: 0, opacity: 1 },
          { id: 'bor-p10-lbl2', type: 'text', x: 60, y: 440, width: 334, height: 20, text: 'ABOUT', fontSize: 12, fontFamily: 'Montserrat', fill: '#4a3728', textAlign: 'right', letterSpacing: 2, zIndex: 9, rotation: 0, opacity: 1 },
          { id: 'bor-p10-title2', type: 'text', x: 60, y: 465, width: 334, height: 40, text: 'PRODUCT', fontSize: 32, fontFamily: 'Montserrat', fontWeight: '900', fill: '#4a3728', textAlign: 'right', zIndex: 10, rotation: 0, opacity: 1, productId: 'p2' },
          { id: 'bor-p10-desc2', type: 'text', x: 60, y: 515, width: 334, height: 60, text: 'Borcelle Sunglasses will effortlessly elevate your look and set you apart from the crowd.', fontSize: 10, fontFamily: 'Inter', fill: '#4a3728', textAlign: 'right', zIndex: 11, rotation: 0, opacity: 1 },
          { id: 'bor-p10-badge2', type: 'shape', x: 174, y: 620, width: 220, height: 60, fill: '#ffffff', effectRoundness: 30, zIndex: 12, rotation: 0, opacity: 1 },
          { id: 'bor-p10-spt2', type: 'text', x: 194, y: 640, width: 80, height: 30, text: 'SPECIAL\nPRICE', fontSize: 7, fontFamily: 'Montserrat', fill: '#4a3728', zIndex: 13, rotation: 0, opacity: 1 },
          { id: 'bor-p10-price2', type: 'text', x: 274, y: 635, width: 100, height: 40, text: '$199', fontSize: 24, fontFamily: 'Montserrat', fontWeight: '900', fill: '#4a3728', zIndex: 14, rotation: 0, opacity: 1, productId: 'p2' },
          // Row 3
          { id: 'bor-p10-img3', type: 'product-block', productId: 'p3', cardTheme: 'minimal-image', x: 414, y: 760, width: 320, height: 320, zIndex: 15, rotation: 0, opacity: 1 },
          { id: 'bor-p10-lbl3', type: 'text', x: 60, y: 780, width: 334, height: 20, text: 'ABOUT', fontSize: 12, fontFamily: 'Montserrat', fill: '#4a3728', textAlign: 'right', letterSpacing: 2, zIndex: 16, rotation: 0, opacity: 1 },
          { id: 'bor-p10-title3', type: 'text', x: 60, y: 805, width: 334, height: 40, text: 'PRODUCT', fontSize: 32, fontFamily: 'Montserrat', fontWeight: '900', fill: '#4a3728', textAlign: 'right', zIndex: 17, rotation: 0, opacity: 1, productId: 'p3' },
          { id: 'bor-p10-desc3', type: 'text', x: 60, y: 855, width: 334, height: 60, text: 'Borcelle Sunglasses will effortlessly elevate your look and set you apart from the crowd.', fontSize: 10, fontFamily: 'Inter', fill: '#4a3728', textAlign: 'right', zIndex: 18, rotation: 0, opacity: 1 },
          { id: 'bor-p10-badge3', type: 'shape', x: 174, y: 960, width: 220, height: 60, fill: '#ffffff', effectRoundness: 30, zIndex: 19, rotation: 0, opacity: 1 },
          { id: 'bor-p10-spt3', type: 'text', x: 194, y: 980, width: 80, height: 30, text: 'SPECIAL\nPRICE', fontSize: 7, fontFamily: 'Montserrat', fill: '#4a3728', zIndex: 20, rotation: 0, opacity: 1 },
          { id: 'bor-p10-price3', type: 'text', x: 274, y: 975, width: 100, height: 40, text: '$199', fontSize: 24, fontFamily: 'Montserrat', fontWeight: '900', fill: '#4a3728', zIndex: 21, rotation: 0, opacity: 1, productId: 'p3' },
        ]
      },
      {
        pageNumber: 11,
        elements: [
          { id: 'bor-p11-bg', type: 'shape', x: 0, y: 0, width: 794, height: 1123, fill: '#ccc4ba', zIndex: 0, rotation: 0, opacity: 1 },
          { id: 'bor-p11-label', type: 'text', x: 0, y: 120, width: 794, height: 40, text: 'CLIENT', fontSize: 32, fontFamily: 'Montserrat', fontWeight: '500', fill: '#4a3728', textAlign: 'center', letterSpacing: 4, zIndex: 1, rotation: 0, opacity: 1 },
          { id: 'bor-p11-title', type: 'text', x: 0, y: 170, width: 794, height: 100, text: 'TESTIMONY', fontSize: 84, fontFamily: 'Montserrat', fontWeight: '900', fill: '#4a3728', textAlign: 'center', letterSpacing: 8, zIndex: 2, rotation: 0, opacity: 1 },
          // Testimonial 1
          { id: 'bor-p11-av-bg1', type: 'shape', x: 150, y: 300, width: 500, height: 130, fill: '#ffffff', effectRoundness: 65, zIndex: 3, rotation: 0, opacity: 1 },
          { id: 'bor-p11-av1', type: 'image', x: 160, y: 290, width: 150, height: 150, src: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200', effectRoundness: 100, zIndex: 4, rotation: 0, opacity: 1 },
          { id: 'bor-p11-txt1', type: 'text', x: 320, y: 325, width: 300, height: 80, text: 'I never leave the house without my Borcelle sunglasses. They not only protect my eyes from the sun, but they also make me feel like a total fashionista!', fontSize: 10, fontFamily: 'Inter', fill: '#4a3728', zIndex: 5, rotation: 0, opacity: 1 },
          { id: 'bor-p11-name1', type: 'text', x: 320, y: 390, width: 300, height: 20, text: 'OLIVIA', fontSize: 11, fontFamily: 'Montserrat', fontWeight: '900', fill: '#4a3728', zIndex: 6, rotation: 0, opacity: 1 },
          // Testimonial 2
          { id: 'bor-p11-av-bg2', type: 'shape', x: 150, y: 490, width: 500, height: 130, fill: '#ffffff', effectRoundness: 65, zIndex: 7, rotation: 0, opacity: 1 },
          { id: 'bor-p11-av2', type: 'image', x: 160, y: 480, width: 150, height: 150, src: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&q=80&w=200', effectRoundness: 100, zIndex: 8, rotation: 0, opacity: 1 },
          { id: 'bor-p11-txt2', type: 'text', x: 320, y: 515, width: 300, height: 80, text: 'I never leave the house without my Borcelle sunglasses. They not only protect my eyes from the sun, but they also make me feel like a total fashionista!', fontSize: 10, fontFamily: 'Inter', fill: '#4a3728', zIndex: 9, rotation: 0, opacity: 1 },
          { id: 'bor-p11-name2', type: 'text', x: 320, y: 580, width: 300, height: 20, text: 'SASCHA', fontSize: 11, fontFamily: 'Montserrat', fontWeight: '900', fill: '#4a3728', zIndex: 10, rotation: 0, opacity: 1 },
          // Testimonial 3
          { id: 'bor-p11-av-bg3', type: 'shape', x: 150, y: 680, width: 500, height: 130, fill: '#ffffff', effectRoundness: 65, zIndex: 11, rotation: 0, opacity: 1 },
          { id: 'bor-p11-av3', type: 'image', x: 160, y: 670, width: 150, height: 150, src: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200', effectRoundness: 100, zIndex: 12, rotation: 0, opacity: 1 },
          { id: 'bor-p11-txt3', type: 'text', x: 320, y: 705, width: 300, height: 80, text: 'I never leave the house without my Borcelle sunglasses. They not only protect my eyes from the sun, but they also make me feel like a total fashionista!', fontSize: 10, fontFamily: 'Inter', fill: '#4a3728', zIndex: 13, rotation: 0, opacity: 1 },
          { id: 'bor-p11-name3', type: 'text', x: 320, y: 770, width: 300, height: 20, text: 'THOMAS', fontSize: 11, fontFamily: 'Montserrat', fontWeight: '900', fill: '#4a3728', zIndex: 14, rotation: 0, opacity: 1 },

          { id: 'bor-p11-footer', type: 'text', x: 0, y: 880, width: 794, height: 40, text: 'GO GET YOURS!', fontSize: 32, fontFamily: 'Montserrat', fontWeight: '900', fill: '#4a3728', textAlign: 'center', letterSpacing: 4, zIndex: 15, rotation: 0, opacity: 1 },
        ]
      },
      {
        pageNumber: 12,
        elements: [
          { id: 'bor-p12-bg', type: 'shape', x: 0, y: 0, width: 794, height: 1123, fill: '#ccc4ba', zIndex: 0, rotation: 0, opacity: 1 },
          { id: 'bor-p12-img', type: 'image', x: 30, y: 30, width: 734, height: 430, src: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800', effectRoundness: 20, zIndex: 1, rotation: 0, opacity: 1 },
          { id: 'bor-p12-label', type: 'text', x: 150, y: 500, width: 494, height: 40, text: 'KEEP IN', fontSize: 32, fontFamily: 'Montserrat', fontWeight: '500', fill: '#4a3728', letterSpacing: 4, zIndex: 2, rotation: 0, opacity: 1 },
          { id: 'bor-p12-title', type: 'text', x: 150, y: 550, width: 494, height: 100, text: 'TOUCH', fontSize: 84, fontFamily: 'Montserrat', fontWeight: '900', fill: '#4a3728', letterSpacing: 8, zIndex: 3, rotation: 0, opacity: 1 },

          { id: 'bor-p12-c1-l', type: 'text', x: 150, y: 680, width: 150, height: 30, text: 'Phone :', fontSize: 18, fontFamily: 'Montserrat', fill: '#4a3728', zIndex: 4, rotation: 0, opacity: 1 },
          { id: 'bor-p12-c1-v', type: 'text', x: 320, y: 680, width: 324, height: 30, text: '123-456-7890', fontSize: 18, fontFamily: 'Inter', fill: '#4a3728', zIndex: 5, rotation: 0, opacity: 1 },

          { id: 'bor-p12-c2-l', type: 'text', x: 150, y: 740, width: 150, height: 30, text: 'Email :', fontSize: 18, fontFamily: 'Montserrat', fill: '#4a3728', zIndex: 6, rotation: 0, opacity: 1 },
          { id: 'bor-p12-c2-v', type: 'text', x: 320, y: 740, width: 324, height: 30, text: 'hello@reallygreatsite.com', fontSize: 18, fontFamily: 'Inter', fill: '#4a3728', zIndex: 7, rotation: 0, opacity: 1 },

          { id: 'bor-p12-c3-l', type: 'text', x: 150, y: 800, width: 150, height: 30, text: 'Website :', fontSize: 18, fontFamily: 'Montserrat', fill: '#4a3728', zIndex: 8, rotation: 0, opacity: 1 },
          { id: 'bor-p12-c3-v', type: 'text', x: 320, y: 800, width: 324, height: 30, text: 'www.reallygreatsite.com', fontSize: 18, fontFamily: 'Inter', fill: '#4a3728', zIndex: 9, rotation: 0, opacity: 1 },

          { id: 'bor-p12-c4-l', type: 'text', x: 150, y: 860, width: 150, height: 30, text: 'Social :', fontSize: 18, fontFamily: 'Montserrat', fill: '#4a3728', zIndex: 10, rotation: 0, opacity: 1 },
          { id: 'bor-p12-c4-v', type: 'text', x: 320, y: 860, width: 324, height: 30, text: '@reallygreatsite', fontSize: 18, fontFamily: 'Inter', fill: '#4a3728', zIndex: 11, rotation: 0, opacity: 1 },
        ]
      },
      {
        pageNumber: 13,
        elements: [
          { id: 'bor-p13-bg', type: 'shape', x: 0, y: 0, width: 794, height: 1123, fill: '#ccc4ba', zIndex: 0, rotation: 0, opacity: 1 },
          { id: 'bor-p13-img', type: 'image', x: 30, y: 30, width: 734, height: 1063, src: 'https://images.unsplash.com/photo-1544717297-fa15c3902722?auto=format&fit=crop&q=80&w=800', effectRoundness: 20, zIndex: 1, rotation: 0, opacity: 1 },
          { id: 'bor-p13-title', type: 'text', x: 0, y: 160, width: 794, height: 100, text: 'THANK YOU', fontSize: 84, fontFamily: 'Montserrat', fontWeight: '900', fill: '#4a3728', textAlign: 'center', letterSpacing: 8, zIndex: 2, rotation: 0, opacity: 1 },
          { id: 'bor-p13-sub', type: 'text', x: 0, y: 260, width: 794, height: 40, text: 'BORCELLE', fontSize: 32, fontFamily: 'Montserrat', fontWeight: '500', fill: '#4a3728', textAlign: 'center', letterSpacing: 4, zIndex: 3, rotation: 0, opacity: 1 },
          { id: 'bor-p13-url', type: 'text', x: 0, y: 920, width: 794, height: 20, text: 'WWW.REALLYGREATSITE.COM', fontSize: 12, fontFamily: 'Inter', fill: '#ffffff', textAlign: 'center', letterSpacing: 2, zIndex: 4, rotation: 0, opacity: 1 },
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
