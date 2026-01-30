
export type ElementType = 'text' | 'image' | 'shape' | 'product-block' | 'comment';
export type PageType = 'cover' | 'interior' | 'index' | 'closing';
export type ShapeType = 'rect' | 'circle' | 'triangle' | 'star';
export type CardTheme = 'classic-stack' | 'split-row' | 'editorial-overlay' | 'minimal-image';

export interface CanvasElement {
  id: string;
  type: ElementType;
  shapeType?: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  fill?: string;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string; // '400', '700', '900'
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline';
  textAlign?: 'left' | 'center' | 'right';
  lineHeight?: number;
  letterSpacing?: number;
  src?: string;
  productId?: string;
  zIndex: number;
  author?: string;
  groupId?: string;
  locked?: boolean;
  visible?: boolean;
  // Product Block specific
  cardTheme?: CardTheme;
  showPrice?: boolean;
  showSku?: boolean;
  showName?: boolean;
  shadowBlur?: number;
  shadowColor?: string;
  shadowOpacity?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  effectStyle?: 'none' | 'shadow' | 'lift' | 'hollow' | 'splice' | 'outline' | 'echo' | 'glitch' | 'neon' | 'background';
  textStrokeWidth?: number;
  textStrokeColor?: string;
  effectIntensity?: number;
  effectDirection?: number;
  effectColor?: string;
  effectColor2?: string;
  effectSpread?: number;
  effectRoundness?: number;
  filters?: {
    brightness?: number;
    blur?: number;
    contrast?: number;
    saturation?: number;
  };
}

export interface GridTemplate {
  id: string;
  name: string;
  cols: number;
  rows: number;
  padding: number;
  spacing: number;
  arrangement: 'stacked' | 'row' | 'row-reverse';
  group: string;
  decorations?: any[];
  backgroundColor?: string;
  cardTheme?: CardTheme;
}

export interface CatalogPage {
  id: string;
  pageNumber: number;
  elements: CanvasElement[];
  type: PageType;
}

// Added PageTemplate interface for predefined layouts used in constants.ts
export interface PageTemplate {
  id: string;
  name: string;
  description: string;
  elements: Partial<CanvasElement>[];
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  rank?: number;
  color?: string;
  thumbnail?: string;
  productCount: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  currency: string;
  description: string;
  image: string;
  categoryId?: string;
}

export type MediaType = 'image';

export interface MediaItem {
  id: string;
  name: string;
  type: MediaType;
  url: string;
  thumbnailUrl?: string;
  size?: string;
  dimensions?: string;
  createdAt: string;
}

export interface Catalog {
  id: string;
  name: string;
  pages: CatalogPage[];
  updatedAt: string;
  productIds: string[];
  selectedCategoryId?: string;
  headerText?: string;
  footerText?: string;
  backgroundColor?: string;
}

export interface FullCatalogTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  themeId: string;
  pages: (Omit<CatalogPage, 'id' | 'type'> & { type?: PageType })[];
}

export interface Theme {
  id: string;
  name: string;
  backgroundColor: string;
  headingColor: string;
  bodyColor: string;
  accentColor: string;
  fontFamily: string;
  headingFont: string;
  preview: string[];
}

export interface EditorState {
  catalog: Catalog;
  selectedElementIds: string[];
  currentPageIndex: number;
  zoom: number;
  history: Catalog[];
  historyIndex: number;
}
