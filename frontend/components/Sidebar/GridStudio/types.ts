import { Product, ProductVariant, ProductGridSection, TableData, CatalogPage, Category, CardTheme, CanvasElement } from '../../../types';

export type GridStudioViewMode = 'editor' | 'overview' | 'single-items';

export type ImageGalleryTab = 'all' | 'uploads' | 'categories' | 'products' | 'presets' | 'admin';

export interface ActiveFillMenu {
  secIdx: number;
  colIdx: number;
}

export interface LinkRowModalState {
  secIdx: number;
  rIdx: number;
}

export interface ProductPickerModalState {
  secIdx: number;
}

export interface GridSectionCardProps {
  section: ProductGridSection;
  secIdx: number;
  totalSections: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onUpdateSection: (updates: Partial<ProductGridSection>) => void;
  onOpenImageGallery: (secIdx: number) => void;
  onOpenProductPicker: (secIdx: number) => void;
  onOpenLinkRowModal: (secIdx: number, rIdx: number) => void;
  availableProductFields: string[];
  categories: Category[];
  products: Product[];
  isDark: boolean;
}
