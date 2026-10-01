import { StateCreator } from 'zustand';
import {
  Product,
  Category,
  Catalog,
  CanvasElement,
  MediaItem,
  AdminAsset,
  PageType,
  GridTemplate,
  PageTemplate,
  HeaderFooterTemplate,
  SubscriptionPlan,
  UserSubscription,
  SystemTemplate,
  ProductGridSection,
  ToastNotification,
  ConfirmDialogState,
  SystemSetting,
} from '../types';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin';
  status: 'active' | 'suspended';
  joinedAt: string;
  businessId?: string | number;
  businessName?: string;
  subscription_plan?: string;
  subscription_end_date?: string;
  subscription_features?: any;
}

export type View =
  | 'dashboard'
  | 'products-list'
  | 'create-product'
  | 'edit-product'
  | 'settings'
  | 'category-list'
  | 'create-category'
  | 'edit-category'
  | 'media-library'
  | 'editor'
  | 'catalog-setup'
  | 'catalog-products'
  | 'your-work'
  | 'publish'
  | 'public-viewer'
  | 'admin-login'
  | 'admin-dashboard'
  | 'business-selection'
  | 'business-onboarding'
  | 'pricing';

export interface AuthSlice {
  user: User | null;
  isAuthenticated: boolean;
  isAdminAuthenticated: boolean;
  registeredUsers: User[];

  login: (email: string | undefined, username: string | undefined, password: string) => Promise<void>;
  adminLogin: (email: string | undefined, username: string | undefined, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  fetchUsers: () => Promise<void>;
  updateUserAdmin: (id: string | number, data: any) => Promise<{ success: boolean; message?: string }>;
  deleteUserAdmin: (id: string | number) => Promise<{ success: boolean; message?: string }>;
}

export interface SubscriptionSlice {
  plans: SubscriptionPlan[];
  allSubscriptions: UserSubscription[];

  fetchPlans: () => Promise<void>;
  updateSubscription: (planSlug: string) => Promise<{ success: boolean; message: string }>;
  fetchAllSubscriptions: () => Promise<void>;
  createAdminPlan: (data: Partial<SubscriptionPlan>) => Promise<{ success: boolean; message?: string }>;
  updateAdminPlan: (id: string | number, data: Partial<SubscriptionPlan>) => Promise<{ success: boolean; message?: string }>;
  deleteAdminPlan: (id: string | number) => Promise<{ success: boolean; message?: string }>;
}

export interface ProductsSlice {
  products: Product[];
  categories: Category[];
  activeCategoryId: string | null;
  editingProductId: string | null;
  editingCategoryId: string | null;
  creatingSubcategoryParentId: string | null;
  isCreateProductModalOpen: boolean;
  createProductInitialCategoryId: string | null;

  fetchProducts: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
  reorderProducts: (newOrderIds: string[]) => void;

  addCategory: (category: Category) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  removeCategory: (id: string) => Promise<void>;

  setActiveCategoryId: (id: string | null) => void;
  setSelectedCategoryId: (id: string | null) => void;
  setEditingProductId: (id: string | null) => void;
  setEditingCategoryId: (id: string | null) => void;
  setCreatingSubcategoryParentId: (id: string | null) => void;

  openCreateProductModal: (categoryId?: string | null) => void;
  closeCreateProductModal: () => void;
  completeOnboarding: (businessId: string | number, businessName: string) => Promise<void>;
}

export interface MediaSlice {
  mediaItems: MediaItem[];
  adminAssets: AdminAsset[];

  addMedia: (file: File) => Promise<MediaItem>;
  removeMedia: (id: string) => Promise<void>;
  removeMediaBatch: (ids: string[]) => Promise<void>;
  fetchMedia: () => Promise<void>;
  fetchAdminAssets: () => Promise<void>;
}

export interface SystemAdminSlice {
  systemTemplates: SystemTemplate[];
  editingSystemTemplate: SystemTemplate | null;
  systemSettings: SystemSetting | null;

  fetchSystemTemplates: () => Promise<void>;
  createSystemTemplate: (template: Partial<SystemTemplate>) => Promise<SystemTemplate | null>;
  updateSystemTemplate: (id: string | number, template: Partial<SystemTemplate>) => Promise<SystemTemplate | null>;
  deleteSystemTemplate: (id: string | number) => Promise<boolean>;
  openTemplateInVisualEditor: (template?: SystemTemplate | null) => void;
  saveActiveTemplateFromEditor: (options?: {
    name?: string;
    category?: string;
    type?: any;
    description?: string;
    is_active?: boolean;
    thumbnail?: string;
  }) => Promise<boolean>;

  isAdminHeaderDesignerOpen: boolean;
  editingAdminHeaderTemplate: SystemTemplate | null;
  setIsAdminHeaderDesignerOpen: (isOpen: boolean, template?: SystemTemplate | null) => void;

  isAdminFooterDesignerOpen: boolean;
  editingAdminFooterTemplate: SystemTemplate | null;
  setIsAdminFooterDesignerOpen: (isOpen: boolean, template?: SystemTemplate | null) => void;

  fetchSystemSettings: () => Promise<void>;
  updateSystemSettings: (updates: Partial<SystemSetting>) => Promise<boolean>;
  changeAdminPassword: (data: { current_password?: string; new_password: string }) => Promise<{ success: boolean; message: string }>;
}

export interface UiSlice {
  currentView: View;
  isSidebarExpanded: boolean;
  uiTheme: 'light' | 'dark';
  defaultCurrency: string;
  isLoading: boolean;
  error: string | null;

  activeTool: 'select' | 'hand' | 'text' | 'shape';
  shouldRenderOutlines: boolean;
  editorTab:
    | 'pages'
    | 'products'
    | 'grid-studio'
    | 'single-items'
    | 'media'
    | 'templates'
    | 'layers'
    | 'components'
    | 'buttons'
    | 'stock'
    | 'header-footer'
    | 'text'
    | 'colors'
    | 'elements'
    | 'properties'
    | 'crop'
    | null;

  toasts: ToastNotification[];
  confirmModal: ConfirmDialogState | null;

  colorPickerTarget: {
    type: 'background' | 'fill' | 'stroke' | 'text';
    elementId?: string;
    color: string;
    title?: string;
    onChange?: (color: string) => void;
  } | null;

  isProjectSettingsOpen: boolean;

  setView: (view: View) => void;
  setSidebarExpanded: (expanded: boolean) => void;
  toggleUiTheme: () => void;
  setDefaultCurrency: (currency: string) => void;
  setActiveTool: (tool: 'select' | 'hand' | 'text' | 'shape') => void;
  setShouldRenderOutlines: (shouldRender: boolean) => void;
  setEditorTab: (tab: UiSlice['editorTab']) => void;

  showToast: (message: string | { message?: string; type?: 'success' | 'error' | 'info' | 'warning'; title?: string; duration?: number }, type?: 'success' | 'error' | 'info' | 'warning', title?: string, duration?: number) => void;
  dismissToast: (id: string) => void;
  showConfirm: (options: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
    onConfirm: () => void | Promise<void>;
    onCancel?: () => void;
  }) => void;
  closeConfirm: () => void;

  openColorPicker: (target: {
    type: 'background' | 'fill' | 'stroke' | 'text';
    elementId?: string;
    color: string;
    title?: string;
    onChange?: (color: string) => void;
  }) => void;
  closeColorPicker: () => void;

  setIsProjectSettingsOpen: (isOpen: boolean) => void;
  updateProjectSettings: (updates: Partial<Catalog>) => void;
}

export interface HistorySlice {
  undoStack: Catalog[];
  redoStack: Catalog[];
  guides: { orientation: 'H' | 'V'; position: number }[];
  activeDragPosition: { x: number; y: number } | null;
  draggingItem: { url: string; productId?: string; name: string } | null;
  clipboard: CanvasElement[];

  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  setGuides: (guides: { orientation: 'H' | 'V'; position: number }[]) => void;
  setDragPosition: (pos: { x: number; y: number } | null) => void;
  setDraggingItem: (item: { url: string; productId?: string; name: string } | null) => void;
  copySelectedElements: () => void;
  pasteElements: (targetPos?: { x: number; y: number }, targetPageIdx?: number) => void;
}

export interface ElementsSlice {
  selectedElementIds: string[];
  hoveredElementId: string | null;
  isSceneTreeOpen: boolean;
  isPropertyPanelOpen: boolean;
  isTableEditorOpen: boolean;
  editingTableElementId: string | null;
  isChecklistEditorOpen: boolean;
  editingChecklistElementId: string | null;

  setSelectedElementIds: (ids: string[]) => void;
  setSelectedElements: (ids: string[]) => void;
  setHoveredElementId: (id: string | null) => void;
  setIsSceneTreeOpen: (isOpen: boolean) => void;
  setIsPropertyPanelOpen: (isOpen: boolean) => void;
  setIsTableEditorOpen: (isOpen: boolean, elementId?: string | null) => void;
  setIsChecklistEditorOpen: (isOpen: boolean, elementId?: string | null) => void;

  addElement: (pageIndex: number, element: CanvasElement) => void;
  addElements: (pageIndex: number, elements: CanvasElement[]) => void;
  updateElement: (pageIndex: number, elementId: string, updates: Partial<CanvasElement>) => void;
  updateElements: (pageIndex: number, updatesList: { id: string; updates: Partial<CanvasElement> }[]) => void;
  moveElements: (pageIndex: number, elementIds: string[], dx: number, dy: number) => void;
  removeElement: (pageIndex: number, elementId: string) => void;
  duplicateElement: (pageIndex: number, elementId: string) => void;
  nudgeElement: (pageIndex: number, elementId: string, dx: number, dy: number) => void;

  toggleLock: (pageIndex: number, elementId: string) => void;
  toggleLockElement: (elementId: string) => void;
  toggleVisibilityElement: (elementId: string) => void;

  reorderElement: (pageIndex: number, elementId: string, direction: 'front' | 'back' | 'forward' | 'backward') => void;
  setElementOrder: (pageIndex: number, newIds: string[]) => void;
  reorderElements: (pageIndex: number, newOrderIds: string[]) => void;
  reorderHeaderElements: (newOrderIds: string[]) => void;
  reorderFooterElements: (newOrderIds: string[]) => void;

  alignElements: (pageIndex: number, ids: string[], type: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  distributeElements: (pageIndex: number, ids: string[], direction: 'horizontal' | 'vertical') => void;
  groupSelected: (pageIndex: number) => void;
  ungroupSelected: (pageIndex: number) => void;
}

export interface CropSlice {
  activeCropElementId: string | null;
  activeCropAspect: 'freeform' | 'original' | '1:1' | '16:9' | '4:3' | '3:2' | '2:3' | '9:16';
  activeCropRotation: number;
  activeCropOriginalState: {
    cropX?: number;
    cropY?: number;
    cropWidth?: number;
    cropHeight?: number;
    naturalWidth?: number;
    naturalHeight?: number;
    width: number;
    height: number;
    x: number;
    y: number;
    rotation: number;
  } | null;

  startCropMode: (elementId: string) => void;
  cancelCropMode: () => void;
  applyCropMode: () => void;
  setActiveCropAspect: (aspect: 'freeform' | 'original' | '1:1' | '16:9' | '4:3' | '3:2' | '2:3' | '9:16') => void;
  setActiveCropRotation: (rotation: number) => void;
}

export interface HeaderFooterSlice {
  isHeaderDesignerOpen: boolean;
  editingHeaderTemplate: any | null;
  isFooterDesignerOpen: boolean;
  editingFooterTemplate: any | null;

  setIsHeaderDesignerOpen: (isOpen: boolean, template?: any | null) => void;
  setIsFooterDesignerOpen: (isOpen: boolean, template?: any | null) => void;
  updateHeaderElement: (elementId: string, updates: Partial<CanvasElement>) => void;
  updateFooterElement: (elementId: string, updates: Partial<CanvasElement>) => void;
  addHeaderElement: (element: CanvasElement) => void;
  addFooterElement: (element: CanvasElement) => void;
  removeHeaderElement: (elementId: string) => void;
  removeFooterElement: (elementId: string) => void;
  duplicateHeaderElement: (elementId: string) => void;
  duplicateFooterElement: (elementId: string) => void;
  applyHeaderTemplate: (template: HeaderFooterTemplate) => void;
  applyFooterTemplate: (template: HeaderFooterTemplate) => void;
}

export interface CatalogSlice {
  catalog: Catalog;
  savedCatalogs: Catalog[];
  activeThemeId: string;
  currentPageIndex: number;
  selectedPageIndex: number | null;
  selectedCategoryId: string | null;
  zoom: number;
  catalogSetupName: string;
  viewingCatalogId: string | null;
  publicCatalog: Catalog | null;

  setCurrentPageIndex: (index: number) => void;
  setSelectedPageIndex: (index: number | null) => void;
  setZoom: (zoom: number) => void;
  setCatalogSetupName: (name: string) => void;

  updateCatalog: (updates: Partial<Catalog>) => void;
  renameCatalog: (newName: string) => void;
  updateCatalogCategories: (categoryIds: string[]) => void;
  setCatalogBackgroundColor: (color: string) => void;
  updateAllPageBackgrounds: (color: string) => void;
  applyGlobalPageBackground: (color: string) => void;
  applyGlobalProductCardStyle: (updates: {
    cardTheme?: any;
    fontFamily?: string;
    fontColor?: string;
    showTitle?: boolean;
    showPrice?: boolean;
    showSKU?: boolean;
  }) => void;
  applyTheme: (themeId: string) => void;
  setCatalogGlobalText: (header?: string, footer?: string) => void;
  updateCatalogVisuals: (updates: Partial<Catalog>) => void;

  saveCatalog: () => Promise<string | undefined>;
  loadCatalog: (id: string) => void;
  deleteCatalog: (id: string) => Promise<void>;
  updateSavedCatalog: (id: string, updates: Partial<Catalog>) => void;
  fetchCatalogs: () => Promise<void>;
  publishCatalog: (id: string) => Promise<{ id: string; uuid: string } | undefined>;
  fetchPublicCatalog: (uuid: string) => Promise<Catalog | undefined>;
  openPublicViewer: (id: string) => void;

  addPage: (type?: PageType, insertAfterIndex?: number) => void;
  addInteriorPageWithInheritedLayout: (insertAfterIndex?: number) => void;
  removePage: (indexOrId: number | string) => void;
  duplicatePage: (indexOrId: number | string) => void;
  reorderPages: (newPageIds: string[]) => void;
  setPageOrientation: (pageIndex: number, orientation: 'portrait' | 'landscape') => void;
  setCatalogOrientation: (orientation: 'portrait' | 'landscape') => void;
  setPageBackground: (pageIndex: number, color: string) => void;

  toggleCatalogProduct: (productId: string) => void;
  removeProductFromCanvas: (productId: string) => void;
  removeProductFromPage: (pageIndex: number, productId: string) => void;
}

export interface GridStudioSlice {
  isGridStudioOpen: boolean;
  gridStudioPageIndex: number | null;

  setIsGridStudioOpen: (isOpen: boolean, pageIndex?: number | null) => void;
  applyProductGridToPage: (
    pageIndex: number,
    sections: ProductGridSection[],
    options?: { gap?: number; bgPadding?: number }
  ) => void;
  reflowCatalogPages: (startPageIndex?: number) => void;
  swapPageSections: (pageIndex: number, secIdxA: number, secIdxB: number) => void;
  deletePageSection: (pageIndex: number, secIdx: number) => void;
  autoGenerateCatalogFromAllCategories: () => void;

  generateCatalogFromTemplate: (
    name: string,
    template: GridTemplate,
    categoryIds: string[],
    options?: {
      includeCover: boolean;
      coverTemplateId?: string;
      includeIndex: boolean;
      includeCategoryCovers: boolean;
      selectedTemplateId?: string;
      tableHeaders?: string[];
      categoryLayouts?: Record<string, string>;
      defaultLayoutId?: string;
      headerMode?: 'none' | 'default' | 'template';
      headerTemplateId?: string;
      footerMode?: 'none' | 'default' | 'template';
      footerTemplateId?: string;
      cardFields?: {
        showPrice?: boolean;
        showSku?: boolean;
        showTitle?: boolean;
        cardTheme?: string;
      };
    }
  ) => void;
  applyCoverTemplate: (pageIndex: number | null, template: PageTemplate) => void;
  applyIndexTemplate: (pageIndex: number | null, template: PageTemplate) => void;
  applyClosingTemplate: (pageIndex: number | null, template: PageTemplate) => void;
  applyInventoryLayout: (pageIndex: number | null, template: GridTemplate) => void;
  applyFullCatalogTemplate: (templateId: string) => void;
  reflowAllProductPages: (updatedCatalog?: Catalog) => void;
}

export type StoreState = AuthSlice &
  SubscriptionSlice &
  ProductsSlice &
  MediaSlice &
  SystemAdminSlice &
  UiSlice &
  HistorySlice &
  ElementsSlice &
  CropSlice &
  HeaderFooterSlice &
  CatalogSlice &
  GridStudioSlice;

export type AppSlice<T> = StateCreator<StoreState, [], [], T>;
