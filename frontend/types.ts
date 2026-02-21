export type ElementType = 'text' | 'image' | 'shape' | 'product-block' | 'comment';
export type PageType = 'cover' | 'interior' | 'index' | 'closing';
export type ShapeType = 'rect' | 'roundedRect' | 'circle' | 'triangle' | 'rightTriangle' | 'diamond' | 'pentagon' | 'hexagon' | 'octagon' | 'star' | 'arrow' | 'arrow4' | 'parallelogram' | 'cross' | 'cloud' | 'wave' | 'pill' | 'line';
export type CardTheme = 'classic-stack' | 'split-row' | 'editorial-overlay' | 'minimal-image';
export type PaginationStyle = 'simple' | 'pill' | 'minimal' | 'none';
export type LogoStyle = 'text' | 'boxed' | 'modern' | 'none';

export type FieldType = 'text' | 'number' | 'select' | 'boolean' | 'image' | 'textarea';

export interface FormField {
  id: string;
  label: string;
  type: FieldType;
  options?: string[]; // For select inputs
  required?: boolean;
  section: 'basic' | 'technical' | 'commercial';
  placeholder?: string;
}

export interface BusinessTemplate {
  id: string;
  name: string;
  description: string;
  schema: FormField[];
}

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
  stroke?: string;
  strokeWidth?: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string; // '400', '700', '900'
  fontStyle?: 'normal' | 'italic';
  textDecoration?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  lineHeight?: number;
  letterSpacing?: number;
  src?: string;
  productId?: string;
  zIndex: number;
  author?: string;
  groupId?: string;
  locked?: boolean;
  visible?: boolean;

  // Effects
  effectStyle?: 'none' | 'shadow' | 'lift' | 'hollow' | 'splice' | 'outline' | 'echo' | 'glitch' | 'neon' | 'background';
  shadowBlur?: number;
  shadowOpacity?: number;
  shadowColor?: string;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  textStrokeWidth?: number;
  effectColor?: string;
  effectColor2?: string;
  effectSpread?: number;
  effectRoundness?: number;

  // Product Block specific
  cardTheme?: CardTheme;
  showPrice?: boolean;
  showSku?: boolean;
  showName?: boolean;
  filters?: {
    brightness?: number;
    blur?: number;
    contrast?: number;
    saturation?: number;
  };
  iconConfig?: {
    iconName: string;
    iconLibrary: 'fontawesome';
    color?: string;
    size?: number;
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
  categoryId?: string;
  orientation?: 'portrait' | 'landscape';
  backgroundColor?: string;
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
  parent?: string | number;
  parentName?: string;
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
  // Dynamic fields storage
  customFields?: Record<string, any>;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  price: number;
  features: {
    max_catalogs: number;
    max_products: number;
    max_storage_mb: number;
    ai_enabled: boolean;
  };
}

export interface UserSubscription {
  id: string;
  user_name?: string;
  user_email?: string;
  plan_name?: string;
  start_date: string;
  end_date?: string;
  is_active: boolean;
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
  status: 'draft' | 'published';
  pages: CatalogPage[];
  updatedAt: string;
  productIds: string[];
  selectedCategoryIds: string[]; // Changed from selectedCategoryId to array
  // Headers & Footers
  hasHeader?: boolean;
  hasFooter?: boolean;
  headerText?: string;
  footerText?: string;
  backgroundColor?: string;
  paginationStyle?: PaginationStyle;
  logoStyle?: LogoStyle;
  headerLogoUrl?: string;
  headerLogoAlignment?: 'left' | 'center' | 'right';
  headerLogoHeight?: number;
  headerTextAlignment?: 'left' | 'center' | 'right';
  showCategoryTitleInHeader?: boolean;
  headerHeight?: number;
  headerSideMargin?: number;
  footerHeight?: number;
  footerSideMargin?: number;
  footerTextAlignment?: 'left' | 'center' | 'right';
  pageNumberAlignment?: 'left' | 'right';
  headerFontFamily?: string;
  headerFontSize?: number;
  footerFontFamily?: string;
  footerFontSize?: number;
  headerColor?: string;
  footerColor?: string;
  // Page Layout (Stored in PX, edited in MM)
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  marginColor?: string;

  // Master Layers (Editable Header/Footer)
  headerElements: CanvasElement[];
  footerElements: CanvasElement[];
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

  // UI State
  isSceneTreeOpen: boolean;
  activeTool: 'select' | 'hand' | 'text' | 'shape';
  shouldRenderOutlines: boolean;
}
