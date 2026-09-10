
import { create } from 'zustand';
import { Product, Category, Catalog, CanvasElement, CatalogPage, MediaItem, AdminAsset, MediaType, FullCatalogTemplate, PageType, GridTemplate, Theme, PageTemplate, HeaderFooterTemplate, PaginationStyle, LogoStyle, FormField, SubscriptionPlan, UserSubscription, SystemTemplate } from '../types';
import { INITIAL_PRODUCTS, PAGE_WIDTH, PAGE_HEIGHT, THEMES, COVER_TEMPLATES, GRID_TEMPLATES, HEADER_FOOTER_HEIGHT, FULL_CATALOG_TEMPLATES, INDEX_TEMPLATES, CLOSING_TEMPLATES, HEADER_TEMPLATES, FOOTER_TEMPLATES } from '../constants';
import { authApi, systemTemplatesApi } from '../client';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin';
  status: 'active' | 'suspended';
  joinedAt: string;
  businessName?: string;
  subscription_plan?: string;
  subscription_end_date?: string;
  subscription_features?: any;
}

export type View = 'dashboard' | 'products-list' | 'create-product' | 'edit-product' | 'settings' | 'category-list' | 'create-category' | 'edit-category' | 'media-library' | 'editor' | 'catalog-setup' | 'catalog-products' | 'your-work' | 'publish' | 'public-viewer' | 'admin-login' | 'admin-dashboard' | 'business-selection' | 'business-onboarding' | 'pricing';

interface State {
  user: User | null;
  isAuthenticated: boolean;
  isAdminAuthenticated: boolean;
  currentView: View;
  isSidebarExpanded: boolean;
  uiTheme: 'light' | 'dark';
  defaultCurrency: string;
  isLoading: boolean;
  error: string | null;

  products: Product[];
  categories: Category[];
  plans: SubscriptionPlan[];
  allSubscriptions: UserSubscription[];
  mediaItems: MediaItem[];
  adminAssets: AdminAsset[];
  systemTemplates: SystemTemplate[];
  editingSystemTemplate: SystemTemplate | null;
  activeCategoryId: string | null;
  editingProductId: string | null;
  editingCategoryId: string | null;
  creatingSubcategoryParentId: string | null;

  registeredUsers: User[];



  catalog: Catalog;
  savedCatalogs: Catalog[];
  activeThemeId: string;
  currentPageIndex: number;
  selectedPageIndex: number | null;
  selectedCategoryId: string | null;
  zoom: number;
  shouldRenderOutlines: boolean;
  selectedElementIds: string[];
  hoveredElementId: string | null;
  isPropertyPanelOpen: boolean;
  isTableEditorOpen: boolean;
  editingTableElementId: string | null;
  isHeaderDesignerOpen: boolean;
  editingHeaderTemplate: any | null;
  isFooterDesignerOpen: boolean;
  editingFooterTemplate: any | null;
  catalogSetupName: string;

  viewingCatalogId: string | null;

  draggingItem: { url: string; productId?: string; name: string } | null;
  clipboard: CanvasElement[];

  undoStack: Catalog[];
  redoStack: Catalog[];

  guides: { orientation: 'H' | 'V'; position: number }[];
  activeDragPosition: { x: number; y: number } | null;

  login: (email: string | undefined, username: string | undefined, password: string) => Promise<void>;
  adminLogin: (email: string | undefined, username: string | undefined, password: string) => Promise<void>;
  // guestLogin: () => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setView: (view: View) => void;
  setSidebarExpanded: (expanded: boolean) => void;
  setCreatingSubcategoryParentId: (id: string | null) => void;
  setActiveTool: (tool: 'select' | 'hand' | 'text' | 'shape') => void;
  setShouldRenderOutlines: (shouldRender: boolean) => void;
  toggleUiTheme: () => void;
  // Scene Tree (Layers)
  isSceneTreeOpen: boolean;
  setIsSceneTreeOpen: (isOpen: boolean) => void;
  toggleLockElement: (elementId: string) => void;
  toggleVisibilityElement: (elementId: string) => void;
  reorderElements: (pageIndex: number, newOrderIds: string[]) => void;
  reorderHeaderElements: (newOrderIds: string[]) => void;
  reorderFooterElements: (newOrderIds: string[]) => void;
  setSelectedElements: (ids: string[]) => void;
  setDefaultCurrency: (currency: string) => void;

  updateUser: (updates: Partial<User>) => void;

  // Subscription Actions
  fetchPlans: () => Promise<void>;
  updateSubscription: (planSlug: string) => Promise<{ success: boolean; message: string }>;
  fetchProducts: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchAllSubscriptions: () => Promise<void>;

  fetchUsers: () => Promise<void>;

  // System Templates Actions (Super Admin Template Studio)
  fetchSystemTemplates: () => Promise<void>;
  createSystemTemplate: (template: Partial<SystemTemplate>) => Promise<SystemTemplate | null>;
  updateSystemTemplate: (id: string | number, template: Partial<SystemTemplate>) => Promise<SystemTemplate | null>;
  deleteSystemTemplate: (id: string | number) => Promise<boolean>;
  openTemplateInVisualEditor: (template?: SystemTemplate | null) => void;
  saveActiveTemplateFromEditor: (options?: { name?: string; category?: string; type?: any }) => Promise<boolean>;

  addProduct: (product: Product) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
  reorderProducts: (newOrderIds: string[]) => void;

  addCategory: (category: Category) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  removeCategory: (id: string) => Promise<void>;

  addMedia: (file: File) => Promise<MediaItem>;
  removeMedia: (id: string) => Promise<void>;
  removeMediaBatch: (ids: string[]) => Promise<void>;
  fetchMedia: () => Promise<void>;
  fetchAdminAssets: () => Promise<void>;

  setActiveCategoryId: (id: string | null) => void;
  setSelectedCategoryId: (id: string | null) => void;
  setSelectedPageIndex: (index: number | null) => void;
  setEditingProductId: (id: string | null) => void;
  setEditingCategoryId: (id: string | null) => void;

  setSelectedElementIds: (ids: string[]) => void;
  setSelectedElements: (ids: string[]) => void;
  setHoveredElementId: (id: string | null) => void;
  setIsPropertyPanelOpen: (isOpen: boolean) => void;
  setIsTableEditorOpen: (isOpen: boolean, elementId?: string | null) => void;
  setIsHeaderDesignerOpen: (isOpen: boolean, template?: any | null) => void;
  setIsFooterDesignerOpen: (isOpen: boolean, template?: any | null) => void;
  setCurrentPageIndex: (index: number) => void;
  setZoom: (zoom: number) => void;
  setCatalogSetupName: (name: string) => void;
  setDraggingItem: (item: { url: string; productId?: string; name: string } | null) => void;
  updateCatalog: (updates: Partial<Catalog>) => void;
  activeTool: 'select' | 'hand' | 'text' | 'shape';
  // setActiveTool: (tool: 'select' | 'hand') => void; // This line is replaced by the new one above

  setGuides: (guides: { orientation: 'H' | 'V'; position: number }[]) => void;
  setDragPosition: (pos: { x: number; y: number } | null) => void;

  editorTab: 'pages' | 'products' | 'media' | 'templates' | 'layers' | 'components' | 'buttons' | 'stock' | 'header-footer' | 'text' | 'colors' | null;
  setEditorTab: (tab: 'pages' | 'products' | 'media' | 'templates' | 'layers' | 'components' | 'buttons' | 'stock' | 'header-footer' | 'text' | 'colors' | null) => void;
  colorPickerTarget: {
    type: 'background' | 'fill' | 'stroke' | 'text';
    elementId?: string;
    color: string;
    title?: string;
    onChange?: (color: string) => void;
  } | null;
  openColorPicker: (target: {
    type: 'background' | 'fill' | 'stroke' | 'text';
    elementId?: string;
    color: string;
    title?: string;
    onChange?: (color: string) => void;
  }) => void;
  closeColorPicker: () => void;

  renameCatalog: (newName: string) => void;
  updateCatalogCategories: (categoryIds: string[]) => void;
  setCatalogBackgroundColor: (color: string) => void;
  updateAllPageBackgrounds: (color: string) => void;
  applyGlobalProductCardStyle: (updates: { cardTheme?: any; fontFamily?: string; fontColor?: string; showTitle?: boolean; showPrice?: boolean; showSKU?: boolean }) => void;
  applyGlobalPageBackground: (color: string) => void;

  applyTheme: (themeId: string) => void;
  applyFullCatalogTemplate: (templateId: string) => void;
  setCatalogGlobalText: (header?: string, footer?: string) => void;
  updateCatalogVisuals: (updates: Partial<Catalog>) => void;

  saveCatalog: () => Promise<string | undefined>;
  loadCatalog: (id: string) => void;
  deleteCatalog: (id: string) => void;
  fetchCatalogs: () => Promise<void>;
  updateSavedCatalog: (id: string, updates: Partial<Catalog>) => void;
  publishCatalog: (id: string) => Promise<{ id: string; uuid: string } | undefined>;
  fetchPublicCatalog: (uuid: string) => Promise<Catalog | undefined>;
  openPublicViewer: (id: string) => void;

  addElement: (pageIndex: number, element: CanvasElement) => void;
  updateElement: (pageIndex: number, elementId: string, updates: Partial<CanvasElement>) => void;
  updateElements: (pageIndex: number, updatesList: { id: string; updates: Partial<CanvasElement> }[]) => void;
  moveElements: (pageIndex: number, elementIds: string[], dx: number, dy: number) => void;
  removeElement: (pageIndex: number, elementId: string) => void;
  duplicateElement: (pageIndex: number, elementId: string) => void;
  nudgeElement: (pageIndex: number, elementId: string, dx: number, dy: number) => void;
  toggleLock: (pageIndex: number, elementId: string) => void;
  reorderElement: (pageIndex: number, elementId: string, direction: 'front' | 'back' | 'forward' | 'backward') => void;
  setElementOrder: (pageIndex: number, newIds: string[]) => void;

  alignElements: (pageIndex: number, ids: string[], type: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  distributeElements: (pageIndex: number, ids: string[], direction: 'horizontal' | 'vertical') => void;

  addPage: (type?: PageType) => void;
  addInteriorPageWithInheritedLayout: () => void;
  removePage: (index: number) => void;
  duplicatePage: (index: number) => void;
  reorderPages: (newPageIds: string[]) => void;
  setPageOrientation: (pageIndex: number, orientation: 'portrait' | 'landscape') => void;
  setCatalogOrientation: (orientation: 'portrait' | 'landscape') => void;
  setPageBackground: (pageIndex: number, color: string) => void;

  toggleCatalogProduct: (productId: string) => void;
  removeProductFromCanvas: (productId: string) => void;
  removeProductFromPage: (pageIndex: number, productId: string) => void;
  generateCatalogFromTemplate: (
    name: string,
    template: GridTemplate,
    categoryIds: string[],
    options?: { includeCover: boolean; includeIndex: boolean; includeCategoryCovers: boolean; selectedTemplateId?: string }
  ) => void;
  applyCoverTemplate: (pageIndex: number | null, template: PageTemplate) => void;
  applyIndexTemplate: (pageIndex: number | null, template: PageTemplate) => void;
  applyClosingTemplate: (pageIndex: number | null, template: PageTemplate) => void;
  applyInventoryLayout: (pageIndex: number | null, template: GridTemplate) => void;
  applyHeaderTemplate: (template: HeaderFooterTemplate) => void;
  applyFooterTemplate: (template: HeaderFooterTemplate) => void;
  reflowAllProductPages: (updatedCatalog?: Catalog) => void;

  groupSelected: (pageIndex: number) => void;

  ungroupSelected: (pageIndex: number) => void;

  undo: () => void;
  redo: () => void;
  pushHistory: () => void;

  isProjectSettingsOpen: boolean;
  setIsProjectSettingsOpen: (isOpen: boolean) => void;
  updateProjectSettings: (updates: Partial<Catalog>) => void;

  // Master Actions
  updateHeaderElement: (elementId: string, updates: Partial<CanvasElement>) => void;
  updateFooterElement: (elementId: string, updates: Partial<CanvasElement>) => void;
  addHeaderElement: (element: CanvasElement) => void;
  addFooterElement: (element: CanvasElement) => void;
  removeHeaderElement: (elementId: string) => void;
  removeFooterElement: (elementId: string) => void;
  duplicateHeaderElement: (elementId: string) => void;
  duplicateFooterElement: (elementId: string) => void;


  // Clipboard
  copySelectedElements: () => void;
  pasteElements: () => void;
}

const INITIAL_MEDIA: MediaItem[] = [];

const TECHNOVA_SCHEMA: FormField[] = [
  // Basic Fields
  { id: 'prod_name', label: 'Product Name', type: 'text', section: 'basic', required: true },
  { id: 'description', label: 'Description', type: 'textarea', section: 'basic' },
  { id: 'price', label: 'Price', type: 'number', section: 'basic', required: true },
  { id: 'mrp', label: 'MRP', type: 'number', section: 'basic' },
  { id: 'main_image', label: 'Main Image', type: 'image', section: 'basic', required: true },

  // Technical Specs
  { id: 'model_num', label: 'Model Number', type: 'text', section: 'technical' },
  { id: 'power', label: 'Power Consumption (Watts)', type: 'number', section: 'technical' },
  { id: 'warranty', label: 'Warranty', type: 'select', options: ['1 Year', '2 Year', '3 Year'], section: 'technical' },
  { id: 'voltage', label: 'Voltage', type: 'text', section: 'technical' },
  { id: 'connectivity', label: 'Connectivity (WiFi/BT/HDMI)', type: 'text', section: 'technical' },
  { id: 'dims', label: 'Dimensions (L x W x H)', type: 'text', section: 'technical' },
  { id: 'weight', label: 'Weight (kg)', type: 'number', section: 'technical' },

  // Commercial Fields
  { id: 'in_stock', label: 'In Stock', type: 'boolean', section: 'commercial' },
  { id: 'emi', label: 'EMI Available', type: 'boolean', section: 'commercial' }
];

export const useStore = create<State>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isAdminAuthenticated: false,
  currentView: 'dashboard',
  isSidebarExpanded: true,
  uiTheme: (typeof window !== 'undefined' && localStorage.getItem('catalogmakerr_ui_theme') === 'light') ? 'light' : 'dark',
  shouldRenderOutlines: true,
  defaultCurrency: '₹',
  isLoading: false,
  error: null,

  products: [],
  categories: [],
  mediaItems: INITIAL_MEDIA,
  adminAssets: [],
  registeredUsers: [],
  plans: [],
  allSubscriptions: [],
  systemTemplates: [],
  editingSystemTemplate: null,


  activeCategoryId: null,
  editingProductId: null,
  editingCategoryId: null,
  creatingSubcategoryParentId: null,
  catalog: {
    id: 'cat-001',
    name: 'New Collection',
    status: 'draft',
    pages: [{ id: 'p1', pageNumber: 1, elements: [], type: 'cover' }],
    updatedAt: new Date().toISOString(),
    productIds: [],
    headerText: 'Company Catalog 2025',
    footerText: 'Proprietary & Confidential',
    backgroundColor: '#ffffff',
    paginationStyle: 'simple',
    logoStyle: 'text',
    headerLogoAlignment: 'left',
    headerTextAlignment: 'center',
    showCategoryTitleInHeader: true,
    headerHeight: 113.4, // 30mm
    headerSideMargin: 40,
    footerHeight: 75.6, // 20mm
    footerSideMargin: 40,
    headerFontFamily: 'Inter',
    headerFontSize: 11,
    footerFontFamily: 'Inter',
    footerFontSize: 9,
    headerLogoHeight: 24,
    selectedCategoryIds: [],
    hasHeader: true,
    hasFooter: true,
    headerMigrated: false,
    footerMigrated: false,
    marginTop: 37.8,
    marginBottom: 37.8,
    marginLeft: 37.8,
    marginRight: 37.8,
    headerElements: [
      {
        id: 'default-header-title',
        type: 'text',
        text: 'Company Catalog 2026',
        x: 40,
        y: 15,
        width: 714,
        height: 25,
        fontSize: 11,
        fontFamily: 'Inter',
        fontWeight: 'bold',
        textAlign: 'center',
        fill: '#475569',
        zIndex: 10,
        rotation: 0,
        opacity: 1,
        verticalAlign: 'middle',
      }
    ],
    footerElements: [
      {
        id: 'default-footer-text',
        type: 'text',
        text: 'Proprietary & Confidential',
        x: 40,
        y: 15,
        width: 350,
        height: 25,
        fontSize: 9,
        fontFamily: 'Inter',
        fontWeight: 'normal',
        textAlign: 'left',
        fill: '#94a3b8',
        zIndex: 10,
        rotation: 0,
        opacity: 1,
        verticalAlign: 'middle',
      },
      {
        id: 'default-footer-page',
        type: 'text',
        text: 'Page {{page}}',
        x: 600,
        y: 15,
        width: 154,
        height: 25,
        fontSize: 9,
        fontFamily: 'Inter',
        fontWeight: 'bold',
        textAlign: 'right',
        fill: '#94a3b8',
        zIndex: 10,
        rotation: 0,
        opacity: 1,
        verticalAlign: 'middle',
      }
    ],
    showPrice: true,
    showSKU: true,
    showTitle: true,
    gridCols: 2,
    gridRows: 2,
    gridSpacing: 30,
    gridPadding: 50,
    gridCardTheme: 'classic-stack'
  },
  savedCatalogs: [], // Initialized empty for new user scenario
  activeThemeId: 'default',
  currentPageIndex: 0,
  selectedPageIndex: 0,
  selectedCategoryId: null,
  zoom: 1,
  activeTool: 'select',
  selectedElementIds: [],
  hoveredElementId: null,
  isPropertyPanelOpen: true,
  isTableEditorOpen: false,
  editingTableElementId: null,
  isHeaderDesignerOpen: false,
  editingHeaderTemplate: null,
  isFooterDesignerOpen: false,
  editingFooterTemplate: null,
  catalogSetupName: '',
  draggingItem: null,
  editorTab: 'products',
  colorPickerTarget: null,
  clipboard: [],

  viewingCatalogId: null,

  undoStack: [],
  redoStack: [],
  guides: [],
  activeDragPosition: null,

  isProjectSettingsOpen: false,
  setIsProjectSettingsOpen: (isOpen) => set({ isProjectSettingsOpen: isOpen }),
  updateProjectSettings: (updates) => set((state) => {
    const oldCatalog = state.catalog;
    const newCatalog = { ...oldCatalog, ...updates };

    const isGridConfigChanged = 
      updates.gridCols !== undefined ||
      updates.gridRows !== undefined ||
      updates.gridSpacing !== undefined ||
      updates.gridPadding !== undefined ||
      updates.gridCardTheme !== undefined;

    if (isGridConfigChanged) {
      setTimeout(() => {
        get().reflowAllProductPages(newCatalog);
      }, 0);
      return {
        catalog: newCatalog
      };
    }

    return {
      catalog: { ...newCatalog, updatedAt: new Date().toISOString() }
    };
  }),

  pushHistory: () => {
    const { catalog, undoStack } = get();
    const currentSnapshot = JSON.parse(JSON.stringify(catalog));
    set({
      undoStack: [currentSnapshot, ...undoStack].slice(0, 50),
      redoStack: []
    });
  },

  undo: () => {
    const { catalog, undoStack, redoStack } = get();
    if (undoStack.length === 0) return;
    const [previous, ...restUndo] = undoStack;
    const currentSnapshot = JSON.parse(JSON.stringify(catalog));
    set({
      catalog: previous,
      undoStack: restUndo,
      redoStack: [currentSnapshot, ...redoStack],
      selectedElementIds: []
    });
  },

  redo: () => {
    const { catalog, undoStack, redoStack } = get();
    if (redoStack.length === 0) return;
    const [next, ...restRedo] = redoStack;
    const currentSnapshot = JSON.parse(JSON.stringify(catalog));
    set({
      catalog: next,
      redoStack: restRedo,
      undoStack: [currentSnapshot, ...undoStack],
      selectedElementIds: []
    });
  },

  login: async (email, username, password) => {
    set({ isLoading: true, error: null });
    // Clear any stale tokens before attempting a new login
    localStorage.removeItem('cs_access_token');
    localStorage.removeItem('cs_refresh_token');
    sessionStorage.removeItem('cs_session');

    try {
      const payload: any = { password };
      if (email) {
        payload.email = email;
        payload.username = email;
      }
      if (username) payload.username = username;
      
      const response: any = await authApi.login(payload);
      const token = response?.access || response?.access_token || response?.data?.access;
      const refreshToken = response?.refresh || response?.refresh_token || response?.data?.refresh;
      if (token) {
        localStorage.setItem('cs_access_token', token);
      }
      if (refreshToken) {
        localStorage.setItem('cs_refresh_token', refreshToken);
      }

      // 2. Fetch User Details - use returned user if present, or fetch
      let userData: any = response?.user;
      if (!userData) {
        try {
          userData = await authApi.user();
        } catch (e) {
          console.warn("Could not fetch extra user details, proceeding with token profile", e);
        }
      }

      // 3. Check role
      const isStaff = !!(userData?.is_staff || userData?.is_superuser);
      const userObj: User = {
        id: userData?.id || `u-${Date.now()}`,
        name: userData?.name || 'User',
        email: userData?.email || email || '',
        role: isStaff ? 'admin' : 'user',
        status: 'active',
        joinedAt: new Date().toISOString(),
        businessName: userData?.business_name
      };

      set({
        isAuthenticated: true,
        isAdminAuthenticated: isStaff,
        user: userObj,
        currentView: 'dashboard',
        isLoading: false,
        error: null
      });

      sessionStorage.setItem('cs_session', '1');

      // Fetch data on login
      get().fetchProducts();
      get().fetchCategories();
      get().fetchCatalogs();
      get().fetchMedia();
      get().fetchSystemTemplates();
      if (userObj.role === 'admin') get().fetchUsers();
    } catch (error: any) {
      let errorMessage = error.response?.data?.non_field_errors?.[0] || 
                         error.response?.data?.detail || 
                         (typeof error.response?.data === 'string' ? error.response.data : null) ||
                         error.message || 
                         'Login failed';
      if (typeof errorMessage === 'string' && errorMessage.includes('Unable to log in with provided credentials')) {
        set({ error: 'Invalid email or password. New here? Create an account.', isLoading: false });
      } else {
        set({ error: String(errorMessage), isLoading: false });
      }
      throw error;
    }
  },

  adminLogin: async (email, username, password) => {
    set({ isLoading: true, error: null });
    // Clear any stale tokens before attempting admin login
    localStorage.removeItem('cs_access_token');
    localStorage.removeItem('cs_refresh_token');
    sessionStorage.removeItem('cs_session');

    try {
      // 1. Authenticate
      const payload: any = { password: password || 'admin123' };
      if (email) {
        payload.email = email;
        payload.username = email;
      }
      if (username) payload.username = username;

      const response: any = await authApi.login(payload);
      const token = response?.access || response?.access_token || response?.data?.access;
      const refreshToken = response?.refresh || response?.refresh_token || response?.data?.refresh;
      if (token) {
        localStorage.setItem('cs_access_token', token);
      }
      if (refreshToken) {
        localStorage.setItem('cs_refresh_token', refreshToken);
      }

      // 2. Fetch User
      const user = await authApi.user();
      console.log("Admin Login User Check:", user);
      console.log("Is Staff:", (user as any).is_staff, "Is Superuser:", (user as any).is_superuser);

      // 3. Enforce Admin Role
      if (!(user as any).is_staff && !(user as any).is_superuser) {
        localStorage.removeItem('cs_access_token');
        localStorage.removeItem('cs_refresh_token');
        await authApi.logout();
        set({ isLoading: false, error: 'Access Denied. Authorized personnel only.' });
        return;
      }

      set({
        isAdminAuthenticated: true,
        user: {
          id: (user as any).id,
          name: (user as any).name || 'Admin',
          email: (user as any).email,
          role: 'admin',
          status: 'active',
          joinedAt: new Date().toISOString()
        },
        currentView: 'admin-dashboard',
        isLoading: false,
        error: null
      });

      // Fetch data for admin
      get().fetchUsers();
      get().fetchSystemTemplates();
      get().fetchAllSubscriptions();

    } catch (error: any) {
      set({ error: error.response?.data?.non_field_errors?.[0] || 'Admin login failed', isLoading: false });
    }
  },

  // guestLogin: () => {
  //   const guestUser: User = {
  //     id: `guest-${Date.now()}`,
  //     name: 'Guest Designer',
  //     email: 'guest@example.com',
  //     role: 'user',
  //     status: 'active',
  //     joinedAt: new Date().toISOString(),
  //     businessId: 'guest-biz',
  //     businessName: 'Guest Studio'
  //   };

  //   set({
  //     isAuthenticated: true,
  //     user: guestUser,
  //     currentView: 'dashboard',
  //     isLoading: false,
  //     error: null
  //   });

  //   // Initialize guest data
  //   get().fetchBusinessTemplates();
  // },

  logout: async () => {
    try {
      await authApi.logout();
    } catch (e) { console.error(e); }

    sessionStorage.removeItem('cs_session');
    localStorage.removeItem('cs_access_token');
    localStorage.removeItem('cs_refresh_token');

    set({
      isAuthenticated: false,
      isAdminAuthenticated: false,
      user: null,
      currentView: 'dashboard' // Will trigger Login due to !isAuthenticated check in App
    });
  },

  setView: (view) => {
    set({ currentView: view });
    // Keep browser URL pathname synced with currentView
    if (typeof window !== 'undefined') {
      const pathToView: Record<string, string> = {
        'dashboard': '/',
        'editor': '/editor',
        'products-list': '/inventory/products',
        'create-product': '/inventory/products/create',
        'edit-product': '/inventory/products/edit',
        'category-list': '/inventory/categories',
        'create-category': '/inventory/categories/create',
        'edit-category': '/inventory/categories/edit',
        'media-library': '/inventory/media',
        'catalog-setup': '/catalog-setup',
        'catalog-products': '/catalog-products',
        'your-work': '/your-work',
        'publish': '/publish',
        'pricing': '/pricing',
        'settings': '/settings',
        'admin-login': '/admin',
        'admin-dashboard': '/admin/dashboard',
        'business-selection': '/onboarding',
        'business-onboarding': '/onboarding/business',
      };
      const targetPath = pathToView[view];
      if (targetPath && window.location.pathname !== targetPath) {
        window.history.pushState({ view }, '', targetPath);
      }
    }
  },
  setSidebarExpanded: (expanded) => set({ isSidebarExpanded: expanded }),
  setCreatingSubcategoryParentId: (id) => set({ creatingSubcategoryParentId: id }),

  // UI State & Tools
  toggleUiTheme: () => set((state) => {
    const nextTheme = state.uiTheme === 'light' ? 'dark' : 'light';
    if (typeof window !== 'undefined') {
      localStorage.setItem('catalogmakerr_ui_theme', nextTheme);
    }
    return { uiTheme: nextTheme };
  }),
  setShouldRenderOutlines: (shouldRender) => set({ shouldRenderOutlines: shouldRender }),

  // Scene Tree (Layers)
  isSceneTreeOpen: false,
  setIsSceneTreeOpen: (isOpen) => set({ isSceneTreeOpen: isOpen }),
  setSelectedElements: (ids) => set((state) => {
    const page = state.catalog.pages[state.currentPageIndex];
    const headerEls = state.catalog.headerElements || [];
    const footerEls = state.catalog.footerElements || [];

    const newIds = new Set<string>();

    ids.forEach(id => {
      // Find where this element belongs
      let el = page?.elements.find(e => e.id === id);
      let container = page?.elements;

      if (!el) {
        el = headerEls.find(e => e.id === id);
        container = headerEls;
      }
      if (!el) {
        el = footerEls.find(e => e.id === id);
        container = footerEls;
      }

      if (el && el.groupId && container) {
        // Find all members of the group in THE SAME container
        container.filter(e => e.groupId === el!.groupId).forEach(member => newIds.add(member.id));
      } else if (el) {
        newIds.add(id);
      }
    });

    return { selectedElementIds: Array.from(newIds) };
  }),

  toggleLockElement: (elementId) => set((state) => {
    // 1. Check Page
    const pageIndex = state.currentPageIndex;
    const pages = [...state.catalog.pages];
    if (pages[pageIndex]?.elements.some(el => el.id === elementId)) {
      pages[pageIndex].elements = pages[pageIndex].elements.map(el =>
        el.id === elementId ? { ...el, locked: !el.locked } : el
      );
      return { catalog: { ...state.catalog, pages } };
    }

    // 2. Check Header
    if (state.catalog.headerElements.some(el => el.id === elementId)) {
      return {
        catalog: {
          ...state.catalog,
          headerElements: state.catalog.headerElements.map(el =>
            el.id === elementId ? { ...el, locked: !el.locked } : el
          )
        }
      };
    }

    // 3. Check Footer
    if (state.catalog.footerElements.some(el => el.id === elementId)) {
      return {
        catalog: {
          ...state.catalog,
          footerElements: state.catalog.footerElements.map(el =>
            el.id === elementId ? { ...el, locked: !el.locked } : el
          )
        }
      };
    }

    return state;
  }),

  toggleVisibilityElement: (elementId) => set((state) => {
    // 1. Check Page
    const pageIndex = state.currentPageIndex;
    const pages = [...state.catalog.pages];
    if (pages[pageIndex]?.elements.some(el => el.id === elementId)) {
      pages[pageIndex].elements = pages[pageIndex].elements.map(el =>
        el.id === elementId ? { ...el, visible: el.visible === false } : el
      );
      return { catalog: { ...state.catalog, pages } };
    }

    // 2. Check Header
    if (state.catalog.headerElements.some(el => el.id === elementId)) {
      return {
        catalog: {
          ...state.catalog,
          headerElements: state.catalog.headerElements.map(el =>
            el.id === elementId ? { ...el, visible: el.visible === false } : el
          )
        }
      };
    }

    // 3. Check Footer
    if (state.catalog.footerElements.some(el => el.id === elementId)) {
      return {
        catalog: {
          ...state.catalog,
          footerElements: state.catalog.footerElements.map(el =>
            el.id === elementId ? { ...el, visible: el.visible === false } : el
          )
        }
      };
    }

    return state;
  }),

  reorderElements: (pageIndex, newOrderIds) => set((state) => {
    const pages = [...state.catalog.pages];
    const page = { ...pages[pageIndex] };
    const elementMap = new Map(page.elements.map(el => [el.id, el]));
    const newElements = newOrderIds.map(id => elementMap.get(id)).filter(Boolean) as CanvasElement[];

    // Add zIndex sync
    page.elements = newElements.map((el, idx) => ({ ...el, zIndex: idx }));
    pages[pageIndex] = page;
    return { catalog: { ...state.catalog, pages } };
  }),

  reorderHeaderElements: (newOrderIds) => set((state) => {
    const elementMap = new Map(state.catalog.headerElements.map(el => [el.id, el]));
    const newElements = newOrderIds.map(id => elementMap.get(id)).filter(Boolean) as CanvasElement[];
    return { catalog: { ...state.catalog, headerElements: newElements.map((el, idx) => ({ ...el, zIndex: 1000 + idx })) } };
  }),

  reorderFooterElements: (newOrderIds) => set((state) => {
    const elementMap = new Map(state.catalog.footerElements.map(el => [el.id, el]));
    const newElements = newOrderIds.map(id => elementMap.get(id)).filter(Boolean) as CanvasElement[];
    return { catalog: { ...state.catalog, footerElements: newElements.map((el, idx) => ({ ...el, zIndex: 2000 + idx })) } };
  }),
  setDefaultCurrency: (currency) => set({ defaultCurrency: currency }),

  updateUser: (updates) => set((state) => ({
    user: state.user ? { ...state.user, ...updates } : null
  })),

  fetchPlans: async () => {
    const { subscriptionApi } = await import('../client');
    try {
      const response = await subscriptionApi.getPlans();
      const data = (response as any).data || response;
      set({ plans: Array.isArray(data) ? data : [] });
    } catch (error) {
      console.error("Failed to fetch plans", error);
    }
  },

  updateSubscription: async (planSlug: string) => {
    const { subscriptionApi } = await import('../client');
    try {
      const response = await subscriptionApi.updatePlan({ plan_slug: planSlug });
      const data = (response as any).data || response;

      // Update local user state
      const { user, checkAuth } = get();
      if (user) {
        await checkAuth(); // Refresh user data to get new subscription fields
      }

      return { success: true, message: data.message };
    } catch (error: any) {
      console.error("Failed to update subscription", error);
      return {
        success: false,
        message: error.response?.data?.error || "Failed to process subscription"
      };
    }
  },

  fetchAllSubscriptions: async () => {
    const { subscriptionApi } = await import('../client');
    try {
      const response = await subscriptionApi.adminGetAllSubscriptions();
      const data = (response as any).data || response;
      set({ allSubscriptions: Array.isArray(data) ? data : [] });
    } catch (error) {
      console.error("Failed to fetch all subscriptions", error);
      set({ error: "Failed to fetch subscriptions. Please verify admin permissions." });
    }
  },

  fetchUsers: async () => {
    try {
      const response = await authApi.getAllUsers();
      const data = (response as any).data || response;
      const mappedUsers = (Array.isArray(data) ? data : []).map((u: any) => ({
        ...u,
        role: u.is_staff ? 'admin' : 'user',
        status: u.is_active ? 'active' : 'suspended',
        joinedAt: u.date_joined || new Date().toISOString(),
        businessName: u.business_name
      }));
      set({ registeredUsers: mappedUsers });
    } catch (error) {
      console.error("Failed to fetch users", error);
      set({ error: "Failed to fetch user accounts. Please check admin permissions." });
    }
  },

  // System Templates CRUD (Super Admin Template Studio)
  fetchSystemTemplates: async () => {
    try {
      const response = await systemTemplatesApi.getAll();
      const data = (response as any).data || response;
      const list = Array.isArray(data)
        ? data
        : (Array.isArray((data as any)?.results) ? (data as any).results : []);
      set({ systemTemplates: list });
    } catch (error) {
      console.error("Failed to fetch system templates", error);
    }
  },

  createSystemTemplate: async (template) => {
    try {
      const response = await systemTemplatesApi.create(template);
      const created = (response as any).data || response;
      set(state => ({ systemTemplates: [created, ...state.systemTemplates] }));
      return created;
    } catch (error) {
      console.error("Failed to create system template", error);
      return null;
    }
  },

  updateSystemTemplate: async (id, template) => {
    try {
      const response = await systemTemplatesApi.update(id, template);
      const updated = (response as any).data || response;
      set(state => ({
        systemTemplates: state.systemTemplates.map(t => String(t.id) === String(id) || t.uuid === String(id) ? updated : t)
      }));
      return updated;
    } catch (error) {
      console.error("Failed to update system template", error);
      return null;
    }
  },

  deleteSystemTemplate: async (id) => {
    try {
      await systemTemplatesApi.delete(id);
      set(state => ({
        systemTemplates: state.systemTemplates.filter(t => String(t.id) !== String(id) && t.uuid !== String(id))
      }));
      return true;
    } catch (error) {
      console.error("Failed to delete system template", error);
      return false;
    }
  },

  openTemplateInVisualEditor: (template) => {
    if (template) {
      // Load existing template into live canvas
      const pages = (template.pages_data && template.pages_data.length > 0)
        ? template.pages_data.map((p: any, idx: number) => ({
            id: `p-${idx + 1}`,
            pageNumber: idx + 1,
            type: p.type || (template.type === 'cover' ? 'cover' : 'interior'),
            elements: p.elements || [],
            backgroundColor: p.backgroundColor || '#ffffff'
          }))
        : [{ id: 'p-1', pageNumber: 1, type: template.type === 'cover' ? 'cover' : 'interior', elements: [], backgroundColor: '#ffffff' }];

      set({
        editingSystemTemplate: template,
        catalog: {
          ...get().catalog,
          name: template.name,
          pages: pages as any,
          hasHeader: template.type === 'header',
          hasFooter: template.type === 'footer',
          headerElements: template.type === 'header' ? (template.pages_data?.[0]?.elements || []) : [],
          footerElements: template.type === 'footer' ? (template.pages_data?.[0]?.elements || []) : []
        },
        currentPageIndex: 0,
        currentView: 'editor'
      });
    } else {
      // Create new template in full visual canvas
      const newTemplateSkeleton: SystemTemplate = {
        id: 0,
        uuid: `tmp-${Date.now()}`,
        name: 'New Custom Template',
        category: 'General',
        type: 'cover',
        pages_data: [{ pageNumber: 1, type: 'cover', elements: [] }],
        is_active: true
      };

      set({
        editingSystemTemplate: newTemplateSkeleton,
        catalog: {
          ...get().catalog,
          name: 'New Custom Template',
          pages: [{ id: 'p-1', pageNumber: 1, type: 'cover', elements: [], backgroundColor: '#ffffff' }],
          hasHeader: false,
          hasFooter: false,
          headerElements: [],
          footerElements: []
        },
        currentPageIndex: 0,
        currentView: 'editor'
      });
    }
  },

  saveActiveTemplateFromEditor: async (options) => {
    const { editingSystemTemplate, catalog, createSystemTemplate, updateSystemTemplate } = get();
    const targetName = options?.name || editingSystemTemplate?.name || catalog.name || 'Custom Template';
    const targetCategory = options?.category || editingSystemTemplate?.category || 'General';
    const targetType = options?.type || editingSystemTemplate?.type || 'cover';

    const pagesData = catalog.pages.map(p => ({
      pageNumber: p.pageNumber,
      type: p.type,
      elements: p.elements,
      backgroundColor: p.backgroundColor
    }));

    if (editingSystemTemplate && editingSystemTemplate.id) {
      // Update existing
      const res = await updateSystemTemplate(editingSystemTemplate.id, {
        name: targetName,
        category: targetCategory,
        type: targetType,
        pages_data: pagesData
      });
      return !!res;
    } else {
      // Create new
      const res = await createSystemTemplate({
        name: targetName,
        category: targetCategory,
        type: targetType,
        thumbnail: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=800',
        pages_data: pagesData,
        is_active: true
      });
      if (res) {
        set({ editingSystemTemplate: res });
      }
      return !!res;
    }
  },

  fetchProducts: async () => {
    const { productsApi } = await import('../client');
    try {
      const response = await productsApi.getAll();
      const data = (response as any).data || response;
      const mappedProducts = Array.isArray(data) ? data.map((p: any) => {
        const cf = p.custom_fields || {};
        const imagesList = Array.isArray(cf.gallery) ? cf.gallery : (p.images || []);
        return {
          ...p,
          images: imagesList,
          price: Number(p.price) || 0,
          categoryId: p.category ? String(p.category) : undefined,
          customFields: cf
        };
      }) : [];
      set({ products: mappedProducts });
    } catch (error) {
      console.error("Failed to fetch products", error);
    }
  },

  fetchCategories: async () => {
    const { categoriesApi } = await import('../client');
    try {
      const response = await categoriesApi.getAll();
      const data = (response as any).data || response;
      const mappedCategories = Array.isArray(data) ? data.map((c: any) => ({
        ...c,
        id: String(c.id),
        parent: c.parent ? String(c.parent) : null,
        images: Array.isArray(c.images) ? c.images : (c.thumbnail ? [c.thumbnail] : []),
        customSchema: c.custom_schema || c.customSchema || []
      })) : [];
      set({ categories: mappedCategories });
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  },



  completeOnboarding: async (businessId, businessName) => {
    set({ isLoading: true });
    try {
      // Update User on Backend
      const updatedUser = await authApi.updateUser({
        business_id: businessId,
        business_name: businessName
      });

      set(state => ({
        user: {
          ...state.user!,
          businessId: (updatedUser as any).business_id,
          businessName: (updatedUser as any).business_name
        },
        currentView: 'dashboard',
        isLoading: false
      }));
    } catch (error) {
      console.error("Failed to save business details", error);
      set({ error: "Failed to save business details. Please try again.", isLoading: false });
    }
  },

  addProduct: async (product) => {
    const { productsApi } = await import('../client');
    try {
      // Transformation: Omit temporary ID, map categoryId to category, ensure numeric price, map customFields to custom_fields
      const { id, categoryId, customFields, images, ...rest } = product;
      const cf = { ...(customFields || {}) };
      if (images && images.length > 0) {
        cf.gallery = images;
      }
      const payload = {
        ...rest,
        category: categoryId ? String(categoryId) : null,
        price: parseFloat(String(product.price)) || 0,
        custom_fields: cf
      };

      const response = await productsApi.create(payload);
      const data = (response as any).data || response;
      const respCf = data.custom_fields || {};
      const mappedProduct = {
        ...data,
        images: Array.isArray(respCf.gallery) ? respCf.gallery : (images || []),
        price: Number(data.price) || 0,
        categoryId: data.category ? String(data.category) : undefined,
        customFields: respCf
      };
      set((state) => ({
        products: [mappedProduct, ...state.products]
      }));
    } catch (error: any) {
      console.error("Failed to add product", error.response?.data || error);
      set({ error: "Failed to add product" });
    }
  },

  updateProduct: async (id, updates) => {
    const { productsApi } = await import('../client');
    try {
      const payload: any = { ...updates };
      if (updates.categoryId !== undefined) {
        payload.category = updates.categoryId ? String(updates.categoryId) : null;
        delete payload.categoryId;
      }
      if (updates.price !== undefined) {
        payload.price = parseFloat(String(updates.price)) || 0;
      }
      const cf = { ...(updates.customFields || {}) };
      if (updates.images !== undefined) {
        cf.gallery = updates.images;
        delete payload.images;
      }
      if (Object.keys(cf).length > 0 || updates.customFields !== undefined) {
        payload.custom_fields = cf;
        delete payload.customFields;
      }

      const response = await productsApi.update(id, payload);
      const data = (response as any).data || response;
      const respCf = data.custom_fields || {};
      const mappedProduct = {
        ...data,
        images: Array.isArray(respCf.gallery) ? respCf.gallery : (updates.images || []),
        price: Number(data.price) || 0,
        categoryId: data.category ? String(data.category) : undefined,
        customFields: respCf
      };

      set((state) => {
        const updatedProducts = state.products.map(p => p.id === id ? mappedProduct : p);
        const updatedPages = state.catalog.pages.map(page => ({
          ...page,
          elements: page.elements.map(el => {
            if (el.productId === id) {
              if (el.type === 'text') {
                if (el.id.includes('txt-n')) return { ...el, text: updates.name || el.text };
                if (el.id.includes('txt-p')) {
                  const p = updatedProducts.find(prod => prod.id === id)!;
                  const priceStr = typeof p.price === 'number' ? p.price.toFixed(2) : (Number(p.price) || 0).toFixed(2);
                  return { ...el, text: `${p.currency || 'USD'}${priceStr}` };
                }
              }
              if (el.type === 'image' && updates.image) return { ...el, src: updates.image };
            }
            return el;
          })
        }));

        return {
          products: updatedProducts,
          catalog: { ...state.catalog, pages: updatedPages }
        };
      });
    } catch (error: any) {
      console.error("Failed to update product", error.response?.data || error);
      set({ error: "Failed to update product" });
    }
  },

  removeProduct: async (id) => {
    const { productsApi } = await import('../client');
    try {
      await productsApi.delete(id);
      set((state) => ({
        products: state.products.filter(p => p.id !== id)
      }));
    } catch (error) {
      console.error("Failed to remove product", error);
      set({ error: "Failed to remove product" });
    }
  },

  reorderProducts: (newOrderIds) => set((state) => {
    // 1. Update Global Product List
    const remainingProducts = state.products.filter(p => !newOrderIds.includes(p.id));
    const orderedInScope = newOrderIds.map(id => state.products.find(p => p.id === id)!);
    const updatedProducts = [...orderedInScope, ...remainingProducts];

    // 2. Identify Target Category
    // If we're reordering a filtered view, newOrderIds usually come from that category.
    // We'll take the first item's category as the "Active Context" for syncing.
    const targetCategoryId = orderedInScope.length > 0 ? orderedInScope[0].categoryId : null;

    // 3. Universal Sync & Page Jump
    const newPages = [...state.catalog.pages];
    let newCurrentPageIndex = state.currentPageIndex;
    let foundFirstPage = false;

    newPages.forEach((page, index) => {
      // Check if page needs syncing
      // We sync if the page has the same category as the moved items
      const shouldSync = targetCategoryId && page.categoryId === targetCategoryId;

      if (shouldSync && (page.type === 'interior' || page.type === 'index')) {
        // Jump to the first matching page if not already there or found
        if (!foundFirstPage) {
          newCurrentPageIndex = index;
          foundFirstPage = true;
        }

        // Apply visual sync logic to this page
        const productBlocks = page.elements.filter(el => el.type === 'product-block');

        if (productBlocks.length > 0) {
          // Sort blocks by position: Top-to-Bottom, then Left-to-Right
          const sortedBlocks = [...productBlocks].sort((a, b) => {
            const yDiff = a.y - b.y;
            if (Math.abs(yDiff) > 10) return yDiff; // Distinct rows
            return a.x - b.x; // Same row, sort by x
          });

          // Get the relevant products for this category in the new order
          const categoryProducts = updatedProducts.filter(p => p.categoryId === targetCategoryId);

          // Map the sorted blocks to the sorted products
          const updatedElements = page.elements.map(el => {
            const blockIndex = sortedBlocks.findIndex(b => b.id === el.id);

            if (blockIndex !== -1 && blockIndex < categoryProducts.length) {
              return { ...el, productId: categoryProducts[blockIndex].id };
            }
            return el;
          });

          newPages[index] = { ...page, elements: updatedElements };
        }
      }
    });

    return {
      products: updatedProducts,
      catalog: { ...state.catalog, pages: newPages },
      currentPageIndex: newCurrentPageIndex
    };
  }),

  addCategory: async (category) => {
    const { categoriesApi } = await import('../client');
    try {
      // Transformation: Omit temporary ID and productCount, handle parent
      const { id, productCount, parentName, customSchema, ...payload } = category;
      const requestPayload = {
        ...payload,
        custom_schema: customSchema || []
      };

      const response = await categoriesApi.create(requestPayload);
      const data = (response as any).data || response;
      const mappedCategory = {
        ...data,
        id: String(data.id),
        parent: data.parent ? String(data.parent) : null,
        customSchema: data.custom_schema || data.customSchema || []
      };
      set((state) => ({
        categories: [...state.categories, mappedCategory]
      }));
      // Optional: Refresh all to get latest counts and relationships
      get().fetchCategories();
    } catch (error: any) {
      console.error("Failed to add category", error.response?.data || error);
      set({ error: "Failed to add category" });
    }
  },

  updateCategory: async (id, updates: any) => {
    const { categoriesApi } = await import('../client');
    try {
      // Omit read-only fields if they leak in
      const { parentName, subcategories, productCount, customSchema, ...payload } = updates;
      const requestPayload: any = { ...payload };
      if (customSchema !== undefined) {
        requestPayload.custom_schema = customSchema;
      }

      const response = await categoriesApi.update(id, requestPayload);
      const data = (response as any).data || response;
      const mappedCategory = {
        ...data,
        id: String(data.id),
        parent: data.parent ? String(data.parent) : null,
        customSchema: data.custom_schema || data.customSchema || []
      };
      set((state) => ({
        categories: state.categories.map(c => c.id === id ? mappedCategory : c)
      }));
      // Optional: Refresh all to get latest counts and relationships
      get().fetchCategories();
    } catch (error: any) {
      console.error("Failed to update category", error.response?.data || error);
      set({ error: "Failed to update category" });
    }
  },

  removeCategory: async (id) => {
    const { categoriesApi } = await import('../client');
    try {
      await categoriesApi.delete(id);
      set((state) => ({
        categories: state.categories.filter(c => c.id !== id),
        products: state.products.map(p => p.categoryId === id ? { ...p, categoryId: undefined } : p)
      }));
    } catch (error) {
      console.error("Failed to remove category", error);
      set({ error: "Failed to remove category" });
    }
  },

  fetchMedia: async () => {
    const { mediaApi } = await import('../client');
    try {
      const response = await mediaApi.getAll();
      const items = (response as any).data || response;
      const mappedItems = items.map((m: any) => ({
        id: String(m.id),
        name: m.name,
        type: 'image',
        url: m.url,
        createdAt: m.created_at || new Date().toISOString(),
        size: m.size_bytes ? `${(m.size_bytes / 1024).toFixed(1)} KB` : '0 KB'
      }));
      set({ mediaItems: mappedItems });
    } catch (error) {
      console.error("Failed to fetch media", error);
    }
  },

  fetchAdminAssets: async () => {
    try {
      const response = await adminAssetsApi.getAll();
      set({ adminAssets: response.data });
    } catch (error) {
      console.error('Error fetching admin assets:', error);
    }
  },

  addMedia: async (file: File): Promise<MediaItem> => {
    const { mediaApi } = await import('../client');
    const response = await mediaApi.upload(file);
    const m = (response as any).data || response;
    const newItem: MediaItem = {
      id: String(m.id),
      name: m.name,
      type: m.type || 'image',
      url: m.url,
      createdAt: m.created_at || new Date().toISOString(),
      size: m.size_bytes ? `${(m.size_bytes / 1024).toFixed(1)} KB` : '0 KB'
    };
    set((state) => ({
      mediaItems: [newItem, ...state.mediaItems]
    }));
    return newItem;
  },

  removeMedia: async (id: string) => {
    const { mediaApi } = await import('../client');
    try {
      await mediaApi.delete(id);
      set((state) => ({
        mediaItems: state.mediaItems.filter(m => String(m.id) !== String(id))
      }));
    } catch (error) {
      console.error("Failed to remove media", error);
    }
  },

  removeMediaBatch: async (ids: string[]) => {
    const { mediaApi } = await import('../client');
    try {
      for (const id of ids) {
        await mediaApi.delete(id);
      }
      set((state) => ({
        mediaItems: state.mediaItems.filter(m => !ids.map(String).includes(String(m.id)))
      }));
    } catch (error) {
      console.error("Failed to remove media batch", error);
    }
  },

  setActiveCategoryId: (id) => set({ activeCategoryId: id }),
  setSelectedCategoryId: (id) => set({ selectedCategoryId: id }),
  setSelectedPageIndex: (index) => set({ selectedPageIndex: index }),
  setEditingProductId: (id) => set({ editingProductId: id }),
  setEditingCategoryId: (id) => set({ editingCategoryId: id }),

  setSelectedElementIds: (ids) => set((state) => ({
    selectedElementIds: ids,
    isPropertyPanelOpen: ids.length > 0 ? true : state.isPropertyPanelOpen
  })),
  setHoveredElementId: (id) => set({ hoveredElementId: id }),
  setIsPropertyPanelOpen: (isOpen) => set({ isPropertyPanelOpen: isOpen }),
  setIsTableEditorOpen: (isOpen, elementId = null) => set({
    isTableEditorOpen: isOpen,
    editingTableElementId: isOpen ? (elementId || null) : null
  }),
  setIsHeaderDesignerOpen: (isOpen, template = null) => set({
    isHeaderDesignerOpen: isOpen,
    editingHeaderTemplate: isOpen ? (template || null) : null
  }),
  setIsFooterDesignerOpen: (isOpen, template = null) => set({
    isFooterDesignerOpen: isOpen,
    editingFooterTemplate: isOpen ? (template || null) : null
  }),
  setCurrentPageIndex: (index) => set({ currentPageIndex: index, selectedPageIndex: index }),
  setZoom: (zoom: number) => set({ zoom }),
  updateCatalog: (updates) => set((state) => ({
    catalog: { ...state.catalog, ...updates, updatedAt: new Date().toISOString() }
  })),

  setActiveTool: (tool) => set({ activeTool: tool }),

  setGuides: (guides) => set({ guides }),
  setDragPosition: (activeDragPosition) => set({ activeDragPosition }),

  setEditorTab: (tab) => set({ editorTab: tab }),
  openColorPicker: (target) => set({
    colorPickerTarget: target,
    editorTab: 'colors',
    isSidebarExpanded: true
  }),
  closeColorPicker: () => set((state) => ({
    colorPickerTarget: null,
    editorTab: state.editorTab === 'colors' ? 'pages' : state.editorTab
  })),
  setCatalogSetupName: (name) => set({ catalogSetupName: name }),
  setDraggingItem: (item) => set({ draggingItem: item }),

  renameCatalog: (newName) => {
    get().pushHistory();
    set((state) => ({
      catalog: { ...state.catalog, name: newName, updatedAt: new Date().toISOString() }
    }));
  },

  updateCatalogCategories: (categoryIds) => set((state) => ({
    catalog: { ...state.catalog, selectedCategoryIds: categoryIds, updatedAt: new Date().toISOString() }
  })),

  setCatalogBackgroundColor: (color) => {
    get().pushHistory();
    set((state) => ({
      catalog: { ...state.catalog, backgroundColor: color, updatedAt: new Date().toISOString() }
    }));
  },

  updateAllPageBackgrounds: (color) => {
    get().pushHistory();
    set((state) => ({
      catalog: {
        ...state.catalog,
        backgroundColor: color,
        pages: state.catalog.pages.map(p => ({ ...p, backgroundColor: color })),
        updatedAt: new Date().toISOString()
      }
    }));
  },

  applyGlobalPageBackground: (color) => {
    get().pushHistory();
    set((state) => ({
      catalog: {
        ...state.catalog,
        backgroundColor: color,
        pages: state.catalog.pages.map(p => ({ ...p, backgroundColor: color })),
        updatedAt: new Date().toISOString()
      }
    }));
  },

  applyGlobalProductCardStyle: (updates) => {
    get().pushHistory();
    set((state) => {
      const targetFont = updates.fontFamily || state.catalog.fontFamily;
      const updatedCatalog = {
        ...state.catalog,
        ...(updates.showTitle !== undefined ? { showTitle: updates.showTitle } : {}),
        ...(updates.showPrice !== undefined ? { showPrice: updates.showPrice } : {}),
        ...(updates.showSKU !== undefined ? { showSKU: updates.showSKU } : {}),
        ...(updates.cardTheme ? { gridCardTheme: updates.cardTheme } : {}),
        ...(updates.fontFamily ? {
          fontFamily: updates.fontFamily,
          headerFontFamily: updates.fontFamily,
          footerFontFamily: updates.fontFamily
        } : {}),
        headerElements: (state.catalog.headerElements || []).map(el =>
          el.type === 'text' && updates.fontFamily ? { ...el, fontFamily: updates.fontFamily } : el
        ),
        footerElements: (state.catalog.footerElements || []).map(el =>
          el.type === 'text' && updates.fontFamily ? { ...el, fontFamily: updates.fontFamily } : el
        ),
        updatedAt: new Date().toISOString()
      };

      const updatedPages = state.catalog.pages.map(page => ({
        ...page,
        elements: page.elements.map(el => {
          if (el.type === 'product-block') {
            return {
              ...el,
              ...(updates.cardTheme ? { cardTheme: updates.cardTheme } : {}),
              ...(updates.fontFamily ? { fontFamily: updates.fontFamily } : {}),
              ...(updates.fontColor ? { fill: updates.fontColor } : {})
            };
          }
          if (el.type === 'text' && updates.fontFamily) {
            return {
              ...el,
              fontFamily: updates.fontFamily,
              ...(updates.fontColor ? { fill: updates.fontColor } : {})
            };
          }
          return el;
        })
      }));

      if (typeof document !== 'undefined' && document.fonts && updates.fontFamily) {
        document.fonts.load(`16px "${updates.fontFamily}"`).catch(() => {});
      }

      return {
        catalog: {
          ...updatedCatalog,
          pages: updatedPages
        }
      };
    });
  },

  setCatalogGlobalText: (header, footer) => set((state) => ({
    catalog: {
      ...state.catalog,
      headerText: header !== undefined ? header : state.catalog.headerText,
      footerText: footer !== undefined ? footer : state.catalog.footerText
    }
  })),

  updateCatalogVisuals: (updates) => {
    get().pushHistory();
    set((state) => ({
      catalog: {
        ...state.catalog,
        ...updates,
        updatedAt: new Date().toISOString()
      }
    }));
  },

  applyTheme: (themeId) => {
    get().pushHistory();
    set((state) => {
      const theme = THEMES.find(t => t.id === themeId) || THEMES[0];
      return {
        activeThemeId: themeId,
        catalog: {
          ...state.catalog,
          updatedAt: new Date().toISOString(),
          backgroundColor: theme.backgroundColor
        }
      };
    });
  },

  saveCatalog: async () => {
    const { catalogsApi } = await import('../client');
    const state = get();
    const catalog = state.catalog;

    set({ isLoading: true });
    try {
      let backendId = String(catalog.id);
      let isNew = backendId.startsWith('cat-');

      const catalogSettings = {
        backgroundColor: catalog.backgroundColor,
        headerText: catalog.headerText,
        footerText: catalog.footerText,
        hasHeader: catalog.hasHeader,
        hasFooter: catalog.hasFooter,
        headerHeight: catalog.headerHeight,
        footerHeight: catalog.footerHeight,
        marginTop: catalog.marginTop,
        marginBottom: catalog.marginBottom,
        marginLeft: catalog.marginLeft,
        marginRight: catalog.marginRight,
        headerElements: catalog.headerElements || [],
        footerElements: catalog.footerElements || [],
        gridCols: catalog.gridCols,
        gridRows: catalog.gridRows,
        gridSpacing: catalog.gridSpacing,
        gridPadding: catalog.gridPadding,
        showTitle: catalog.showTitle,
        showPrice: catalog.showPrice,
        showSKU: catalog.showSKU,
        productIds: catalog.productIds || [],
        selectedCategoryIds: catalog.selectedCategoryIds || []
      };

      if (isNew) {
        // Create new catalog on backend
        const response = await catalogsApi.create({
          name: catalog.name || 'Untitled Catalog',
          settings: catalogSettings
        });
        const data = (response as any).data || response;
        backendId = String(data.id);

        // Update local state with the real backend ID and UUID
        set((state) => ({
          catalog: { ...state.catalog, id: backendId, uuid: data.uuid },
          savedCatalogs: [
            { ...state.catalog, id: backendId, uuid: data.uuid, updatedAt: new Date().toISOString() },
            ...state.savedCatalogs.filter(c => String(c.id) !== String(catalog.id))
          ]
        }));
      } else {
        // Update existing catalog metadata
        await catalogsApi.update(backendId, {
          name: catalog.name || 'Untitled Catalog',
          settings: catalogSettings
        });

        set((state) => ({
          savedCatalogs: state.savedCatalogs.map(c =>
            c.id === backendId ? { ...state.catalog, updatedAt: new Date().toISOString() } : c
          )
        }));
      }

      // Save all pages (This could be optimized to only sav changed pages, but for now we save all)
      for (let i = 0; i < catalog.pages.length; i++) {
        const page = catalog.pages[i];
        const pageNum = page.pageNumber || (page as any).page_number || (i + 1);
        await catalogsApi.savePage(backendId, {
          pageNumber: pageNum,
          type: page.type || 'interior',
          elements: page.elements || [],
          categoryId: page.categoryId
        });
      }

      set({ isLoading: false });
      if (typeof window !== 'undefined') {
        localStorage.setItem('active_catalog_id', backendId);
      }
      return backendId;
    } catch (error: any) {
      console.error("Failed to save catalog", error);
      const errMsg = error.response?.data?.detail || error.response?.data?.error || "Failed to save catalog to server";
      set({ error: errMsg, isLoading: false });
      throw error;
    }
  },

  loadCatalog: (id) => set((state) => {
    const catalogToLoad = state.savedCatalogs.find(c => String(c.id) === String(id));
    if (catalogToLoad) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('active_catalog_id', String(id));
      }
      return {
        catalog: JSON.parse(JSON.stringify(catalogToLoad)),
        currentView: 'editor',
        currentPageIndex: 0,
        selectedElementIds: [],
        undoStack: [],
        redoStack: []
      };
    }
    return {};
  }),

  deleteCatalog: async (id) => {
    const { catalogsApi } = await import('../client');
    set((state) => ({
      savedCatalogs: state.savedCatalogs.filter(c => c.id !== id)
    }));
    try {
      if (!String(id).startsWith('cat-')) {
        await catalogsApi.delete(String(id));
      }
    } catch (e) {
      console.error("Failed to delete catalog from database", e);
    }
  },

  updateSavedCatalog: (id, updates) => set((state) => ({
    savedCatalogs: state.savedCatalogs.map(c => c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c)
  })),

  fetchCatalogs: async () => {
    const { catalogsApi } = await import('../client');
    try {
      const response: any = await catalogsApi.getAll();
      const rawList = Array.isArray(response)
        ? response
        : (Array.isArray(response?.data)
          ? response.data
          : (Array.isArray(response?.results)
            ? response.results
            : []));

      const catalogs = rawList.map((data: any) => {
        let settings = data.settings || {};
        if (typeof settings === 'string') {
          try {
            settings = JSON.parse(settings);
          } catch (e) {
            settings = {};
          }
        }
        return {
          ...data,
          ...settings,
          id: String(data.id),
          headerElements: data.headerElements || settings.headerElements || [],
          footerElements: data.footerElements || settings.footerElements || [],
          pages: (data.pages || []).map((p: any, idx: number) => ({
            ...p,
            id: String(p.id || `p-${idx + 1}`),
            pageNumber: p.pageNumber || p.page_number || (idx + 1),
            type: p.type || 'interior',
            elements: p.layout_data || p.elements || [],
            categoryId: p.category || p.categoryId
          }))
        };
      });

      const savedActiveId = typeof window !== 'undefined' ? localStorage.getItem('active_catalog_id') : null;
      let activeCatalog = get().catalog;
      if (savedActiveId && catalogs.length > 0) {
        const matched = catalogs.find((c: any) => String(c.id) === String(savedActiveId));
        if (matched) {
          activeCatalog = JSON.parse(JSON.stringify(matched));
        }
      } else if (catalogs.length > 0 && String(activeCatalog.id).startsWith('cat-')) {
        activeCatalog = JSON.parse(JSON.stringify(catalogs[0]));
        if (typeof window !== 'undefined') {
          localStorage.setItem('active_catalog_id', String(activeCatalog.id));
        }
      }

      set({ savedCatalogs: catalogs, catalog: activeCatalog, isLoading: false });
    } catch (error) {
      console.error("Failed to fetch catalogs", error);
      set({ isLoading: false });
    }
  },

  publishCatalog: async (id) => {
    const { catalogsApi } = await import('../client');
    const state = get();
    const stringId = String(id);
    let catalog = state.savedCatalogs.find(c => String(c.id) === stringId);

    if (!catalog && String(state.catalog.id) === stringId) {
      catalog = state.catalog;
    }

    if (!catalog) {
      console.error("Catalog not found locally", { id, stringId, saved: state.savedCatalogs.map(c => c.id) });
      return;
    }

    try {
      let backendId = stringId;

      // If it's a frontend-only ID, create it on the backend first
      if (stringId.startsWith('cat-')) {
        const createResponse = await catalogsApi.create({
          name: catalog.name,
          settings: {
            backgroundColor: catalog.backgroundColor,
            headerText: catalog.headerText,
            footerText: catalog.footerText,
            hasHeader: catalog.hasHeader,
            hasFooter: catalog.hasFooter,
          }
        });
        const createdCatalog = (createResponse as any).data || createResponse;
        backendId = String(createdCatalog.id);

        // Update local state with the new backend ID
        set((state) => ({
          savedCatalogs: state.savedCatalogs.map(c =>
            String(c.id) === stringId ? { ...c, id: backendId, uuid: createdCatalog.uuid } : c
          ),
          catalog: String(state.catalog.id) === stringId ? { ...state.catalog, id: backendId, uuid: createdCatalog.uuid } : state.catalog
        }));

        // Save all pages to the backend
        for (const page of catalog.pages) {
          await catalogsApi.savePage(backendId, {
            pageNumber: page.pageNumber,
            type: page.type,
            elements: page.elements,
            categoryId: page.categoryId
          });
        }
      }

      const response = await catalogsApi.publish(backendId);
      const data = (response as any).data || response;

      set((state) => ({
        savedCatalogs: state.savedCatalogs.map(c =>
          String(c.id) === backendId ? { ...c, status: 'published', uuid: data.uuid, updatedAt: new Date().toISOString() } : c
        )
      }));
      return { id: backendId, uuid: data.uuid };
    } catch (error) {
      console.error("Failed to publish catalog", error);
      set({ error: "Failed to publish catalog" });
    }
  },

  fetchPublicCatalog: async (uuid) => {
    const { catalogsApi } = await import('../client');
    set({ isLoading: true });
    try {
      const response = await catalogsApi.getPublic(uuid);
      const data = (response as any).data || response;
      // Map the backend data to our frontend format if needed
      const mappedPages = data.pages.map((p: any) => ({
        ...p,
        elements: p.layout_data || [],
        categoryId: p.category
      }));
      const mappedCatalog = {
        ...data,
        pages: mappedPages
      };
      set({ catalog: mappedCatalog, viewingCatalogId: data.id, isLoading: false });
      return mappedCatalog;
    } catch (error) {
      console.error("Failed to fetch public catalog", error);
      set({ error: "Catalog not found or not published", isLoading: false });
    }
  },

  openPublicViewer: (id) => set({
    currentView: 'public-viewer',
    viewingCatalogId: id
  }),

  applyFullCatalogTemplate: (templateId) => {
    get().pushHistory();
    set((state) => {
      const template = FULL_CATALOG_TEMPLATES.find(t => t.id === templateId);
      if (!template) return state;

      const theme = THEMES.find(t => t.id === template.themeId) || THEMES[0];
      const stamp = Date.now();

      const newPages: CatalogPage[] = template.pages.map((p, idx) => ({
        ...p,
        id: `tpl-page-${stamp}-${idx}`,
        type: p.type || (idx === 0 ? 'cover' : 'interior'),
        elements: p.elements.map((el, elIdx) => {
          const id = el.id.includes('slot') ? `${el.id}-${stamp}` : `el-${idx}-${elIdx}-${stamp}`;
          return {
            ...el,
            id
          };
        })
      }));

      return {
        catalog: {
          ...state.catalog,
          name: template.name,
          pages: newPages,
          backgroundColor: theme.backgroundColor,
          updatedAt: new Date().toISOString(),
          selectedCategoryIds: ['cat1']
        },
        activeThemeId: template.themeId,
        currentPageIndex: 0,
        selectedElementIds: []
      };
    });
  },

  addElement: (pageIndex, element) => {
    get().pushHistory();
    set((state) => {
      const newPages = [...state.catalog.pages];
      const page = newPages[pageIndex];
      const isLandscape = page.orientation === 'landscape';
      const pageWidth = isLandscape ? PAGE_HEIGHT : PAGE_WIDTH;
      const pageHeight = isLandscape ? PAGE_WIDTH : PAGE_HEIGHT;

      // Smart positioning: if element is near default (100,100 or 150,150), center it
      const finalElement = { ...element };
      const isDefaultPos = (element.x === 100 && element.y === 100) ||
        (element.x === 150 && element.y === 150) ||
        (element.x === 200 && element.y === 200);

      if (isDefaultPos) {
        finalElement.x = (pageWidth - element.width) / 2;
        finalElement.y = (pageHeight - (element.height || 0)) / 2;
      }

      newPages[pageIndex].elements = [...newPages[pageIndex].elements, finalElement];
      return {
        catalog: { ...state.catalog, pages: newPages, updatedAt: new Date().toISOString() },
        selectedElementIds: [element.id],
        isPropertyPanelOpen: true
      };
    });
  },

  updateElement: (pageIndex, elementId, updates) => set((state) => {
    const newPages = [...state.catalog.pages];
    const page = { ...newPages[pageIndex] }; // CLONE the page object
    const element = page.elements.find(el => el.id === elementId);

    if (!element) return state;

    if (element.groupId && (updates.x !== undefined || updates.y !== undefined)) {
      const dx = updates.x !== undefined ? updates.x - element.x : 0;
      const dy = updates.y !== undefined ? updates.y - element.y : 0;

      page.elements = page.elements.map(el => {
        if (el.groupId === element.groupId) {
          const elUpdates = { ...updates };
          if (el.id !== elementId) {
            elUpdates.x = el.x + dx;
            elUpdates.y = el.y + dy;
          }
          return { ...el, ...elUpdates };
        }
        return el;
      });
    } else {
      page.elements = page.elements.map(el =>
        el.id === elementId ? { ...el, ...updates } : el
      );
    }
    
    newPages[pageIndex] = page; // Set the cloned page back

    return {
      catalog: { ...state.catalog, pages: newPages, updatedAt: new Date().toISOString() }
    };
  }),

  updateElements: (pageIndex, updatesList) => set((state) => {
    const newPages = [...state.catalog.pages];
    const page = { ...newPages[pageIndex] };
    const updateMap = new Map(updatesList.map(u => [u.id, u.updates]));

    page.elements = page.elements.map(el => {
      const updates = updateMap.get(el.id);
      return updates ? { ...el, ...updates } : el;
    });

    newPages[pageIndex] = page;
    return {
      catalog: { ...state.catalog, pages: newPages, updatedAt: new Date().toISOString() }
    };
  }),

  moveElements: (pageIndex, elementIds, dx, dy) => set((state) => {
    const newPages = [...state.catalog.pages];
    const page = newPages[pageIndex];

    page.elements = page.elements.map(el =>
      elementIds.includes(el.id) ? { ...el, x: el.x + dx, y: el.y + dy } : el
    );

    return {
      catalog: { ...state.catalog, pages: newPages, updatedAt: new Date().toISOString() }
    };
  }),

  removeElement: (pageIndex, elementId) => {
    get().pushHistory();
    set((state) => {
      const newPages = [...state.catalog.pages];
      const page = newPages[pageIndex];
      const element = page.elements.find(el => el.id === elementId);

      if (element?.groupId) {
        page.elements = page.elements.filter(el => el.groupId !== element.groupId);
      } else {
        page.elements = page.elements.filter(el => el.id !== elementId);
      }

      return {
        catalog: { ...state.catalog, pages: newPages, updatedAt: new Date().toISOString() },
        selectedElementIds: []
      };
    });
  },

  duplicateElement: (pageIndex, elementId) => {
    const { catalog } = get();
    get().pushHistory();
    const element = catalog.pages[pageIndex].elements.find(el => el.id === elementId);
    if (!element) return;
    const newElement = {
      ...JSON.parse(JSON.stringify(element)),
      id: `el-dup-${Date.now()}`,
      x: element.x + 20,
      y: element.y + 20,
      zIndex: element.zIndex + 1,
      groupId: undefined
    };
    get().addElement(pageIndex, newElement);
  },

  duplicateHeaderElement: (elementId) => {
    const { catalog } = get();
    const element = catalog.headerElements.find(el => el.id === elementId);
    if (!element) return;

    // Restriction: Only one text element allowed in header
    if (element.type === 'text' && catalog.headerElements.some(el => el.type === 'text')) {
      return;
    }

    get().pushHistory();
    const newElement = {
      ...JSON.parse(JSON.stringify(element)),
      id: `header-el-dup-${Date.now()}`,
      x: element.x + 20,
      y: element.y + 20,
      zIndex: (element.zIndex || 0) + 1,
    };
    get().addHeaderElement(newElement);
  },

  duplicateFooterElement: (elementId) => {
    const { catalog } = get();
    const element = catalog.footerElements.find(el => el.id === elementId);
    if (!element) return;

    // Restriction: Only one text element allowed in footer
    if (element.type === 'text' && catalog.footerElements.some(el => el.type === 'text')) {
      return;
    }

    get().pushHistory();
    const newElement = {
      ...JSON.parse(JSON.stringify(element)),
      id: `footer-el-dup-${Date.now()}`,
      x: element.x + 20,
      y: element.y + 20,
      zIndex: (element.zIndex || 0) + 1,
    };
    get().addFooterElement(newElement);
  },

  nudgeElement: (pageIndex, elementId, dx, dy) => set((state) => {
    const newPages = [...state.catalog.pages];
    const page = newPages[pageIndex];
    const element = page.elements.find(el => el.id === elementId);

    if (!element || element.locked) return state;

    if (element.groupId) {
      page.elements = page.elements.map(el =>
        el.groupId === element.groupId ? { ...el, x: el.x + dx, y: el.y + dy } : el
      );
    } else {
      page.elements = page.elements.map(el =>
        el.id === elementId ? { ...el, x: el.x + dx, y: el.y + dy } : el
      );
    }

    return {
      catalog: { ...state.catalog, pages: newPages }
    };
  }),

  toggleLock: (pageIndex, elementId) => {
    get().pushHistory();
    set((state) => {
      const newPages = [...state.catalog.pages];
      const page = newPages[pageIndex];
      page.elements = page.elements.map(el =>
        el.id === elementId ? { ...el, locked: !el.locked } : el
      );
      return {
        catalog: { ...state.catalog, pages: newPages, updatedAt: new Date().toISOString() }
      };
    });
  },

  reorderElement: (pageIndex, elementId, direction) => set((state) => {
    get().pushHistory();
    const newPages = [...state.catalog.pages];
    const page = newPages[pageIndex];
    const elements = [...page.elements];
    const index = elements.findIndex(el => el.id === elementId);
    if (index === -1) return state;

    const el = elements.splice(index, 1)[0];
    if (direction === 'front') elements.push(el);
    else if (direction === 'back') elements.unshift(el);
    else if (direction === 'forward') elements.splice(Math.min(elements.length, index + 1), 0, el);
    else if (direction === 'backward') elements.splice(Math.max(0, index - 1), 0, el);

    newPages[pageIndex].elements = elements.map((e, i) => ({ ...e, zIndex: i }));
    return { catalog: { ...state.catalog, pages: newPages } };
  }),

  setElementOrder: (pageIndex, newIds) => set((state) => {
    get().pushHistory();
    const newPages = [...state.catalog.pages];
    const page = newPages[pageIndex];
    const reversedIds = [...newIds].reverse();
    const reorderedElements = reversedIds.map((id, index) => {
      const el = page.elements.find(e => e.id === id);
      return { ...el!, zIndex: index };
    });
    newPages[pageIndex] = { ...page, elements: reorderedElements };
    return { catalog: { ...state.catalog, pages: newPages } };
  }),

  alignElements: (pageIndex, ids, type) => {
    if (ids.length < 1) return;
    get().pushHistory();
    const { catalog } = get();
    const page = catalog.pages[pageIndex];
    if (!page) return;

    const elements = page.elements.filter(el => ids.includes(el.id));
    const isLandscape = page.orientation === 'landscape';
    const currentWidth = isLandscape ? PAGE_HEIGHT : PAGE_WIDTH;
    const currentHeight = isLandscape ? PAGE_WIDTH : PAGE_HEIGHT;

    let target = 0;
    if (type === 'left') target = ids.length === 1 ? 0 : Math.min(...elements.map(e => e.x));
    if (type === 'right') target = ids.length === 1 ? currentWidth : Math.max(...elements.map(e => e.x + e.width));
    if (type === 'top') target = ids.length === 1 ? 0 : Math.min(...elements.map(e => e.y));
    if (type === 'bottom') target = ids.length === 1 ? currentHeight : Math.max(...elements.map(e => e.y + e.height));
    if (type === 'center') {
      if (ids.length === 1) {
        target = currentWidth / 2;
      } else {
        const minX = Math.min(...elements.map(e => e.x));
        const maxX = Math.max(...elements.map(e => e.x + e.width));
        target = minX + (maxX - minX) / 2;
      }
    }
    if (type === 'middle') {
      if (ids.length === 1) {
        target = currentHeight / 2;
      } else {
        const minY = Math.min(...elements.map(e => e.y));
        const maxY = Math.max(...elements.map(e => e.y + e.height));
        target = minY + (maxY - minY) / 2;
      }
    }

    set((state) => {
      const newPages = [...state.catalog.pages];
      newPages[pageIndex].elements = newPages[pageIndex].elements.map(el => {
        if (!ids.includes(el.id) || el.locked) return el;
        switch (type) {
          case 'left': return { ...el, x: target };
          case 'right': return { ...el, x: target - el.width };
          case 'top': return { ...el, y: target };
          case 'bottom': return { ...el, y: target - el.height };
          case 'center': return { ...el, x: target - el.width / 2 };
          case 'middle': return { ...el, y: target - el.height / 2 };
          default: return el;
        }
      });
      return { catalog: { ...state.catalog, pages: newPages } };
    });
  },

  distributeElements: (pageIndex, ids, direction) => {
    if (ids.length < 3) return;
    get().pushHistory();
    const { catalog } = get();
    const elements = [...catalog.pages[pageIndex].elements.filter(el => ids.includes(el.id))];

    if (direction === 'horizontal') {
      elements.sort((a, b) => a.x - b.x);
      const first = elements[0];
      const last = elements[elements.length - 1];
      const totalWidthOfElements = elements.reduce((acc, el) => acc + el.width, 0);
      const availableWidth = (last.x + last.width) - first.x;
      const totalGap = availableWidth - totalWidthOfElements;
      const gap = totalGap / (elements.length - 1);

      set((state) => {
        const newPages = [...state.catalog.pages];
        newPages[pageIndex].elements = newPages[pageIndex].elements.map(el => {
          const sortedIdx = elements.findIndex(se => se.id === el.id);
          if (sortedIdx === -1 || sortedIdx === 0 || el.locked) return el;
          let calculatedX = first.x;
          for (let i = 0; i < sortedIdx; i++) {
            calculatedX += elements[i].width + gap;
          }
          return { ...el, x: calculatedX };
        });
        return { catalog: { ...state.catalog, pages: newPages } };
      });
    } else {
      elements.sort((a, b) => a.y - b.y);
      const first = elements[0];
      const last = elements[elements.length - 1];
      const totalHeightOfElements = elements.reduce((acc, el) => acc + (el.height || 0), 0);
      const availableHeight = (last.y + last.height) - first.y;
      const totalGap = availableHeight - totalHeightOfElements;
      const gap = totalGap / (elements.length - 1);

      set((state) => {
        const newPages = [...state.catalog.pages];
        newPages[pageIndex].elements = newPages[pageIndex].elements.map(el => {
          const sortedIdx = elements.findIndex(se => se.id === el.id);
          if (sortedIdx === -1 || sortedIdx === 0 || el.locked) return el;
          let calculatedY = first.y;
          for (let i = 0; i < sortedIdx; i++) {
            calculatedY += (elements[i].height || 0) + gap;
          }
          return { ...el, y: calculatedY };
        });
        return { catalog: { ...state.catalog, pages: newPages } };
      });
    }
  },

  setPageOrientation: (pageIndex, orientation) => {
    get().pushHistory();
    set((state) => {
      const newPages = [...state.catalog.pages];
      if (!newPages[pageIndex]) return state;

      const oldOrientation = newPages[pageIndex].orientation || 'portrait';
      if (oldOrientation === orientation) return state;

      // Swap dimensions for shift logic
      const oldW = oldOrientation === 'landscape' ? PAGE_HEIGHT : PAGE_WIDTH;
      const oldH = oldOrientation === 'landscape' ? PAGE_WIDTH : PAGE_HEIGHT;
      const newW = orientation === 'landscape' ? PAGE_HEIGHT : PAGE_WIDTH;
      const newH = orientation === 'landscape' ? PAGE_WIDTH : PAGE_HEIGHT;

      newPages[pageIndex] = {
        ...newPages[pageIndex],
        orientation,
        elements: newPages[pageIndex].elements.map(el => {
          // Scale positions proportionally
          const scaleX = newW / oldW;
          const scaleY = newH / oldH;

          let newX = el.x * scaleX;
          let newY = el.y * scaleY;
          let newWidth = el.width * scaleX;
          let newHeight = el.height * scaleY;

          // For certain elements like product blocks, we might want to preserve aspect ratio
          // but for now, simple scaling is a good start as per "shifted and positioned accordingly"

          return {
            ...el,
            x: newX,
            y: newY,
            width: newWidth,
            height: newHeight
          };
        })
      };

      return {
        catalog: { ...state.catalog, pages: newPages, updatedAt: new Date().toISOString() }
      };
    });
  },

  setCatalogOrientation: (orientation) => {
    get().pushHistory();
    set((state) => {
      const newPages = state.catalog.pages.map(page => {
        const oldOrientation = page.orientation || 'portrait';
        if (oldOrientation === orientation) return page;

        // Swap dimensions for shift logic
        const oldW = oldOrientation === 'landscape' ? PAGE_HEIGHT : PAGE_WIDTH;
        const oldH = oldOrientation === 'landscape' ? PAGE_WIDTH : PAGE_HEIGHT;
        const newW = orientation === 'landscape' ? PAGE_HEIGHT : PAGE_WIDTH;
        const newH = orientation === 'landscape' ? PAGE_WIDTH : PAGE_HEIGHT;

        return {
          ...page,
          orientation,
          elements: page.elements.map(el => {
            // Scale positions proportionally
            const scaleX = newW / oldW;
            const scaleY = newH / oldH;

            // Product blocks might have complex structure, but they inherit from CanvasElement
            return {
              ...el,
              x: el.x * scaleX,
              y: el.y * scaleY,
              // We don't necessarily want to scale width/height here as it might distort elements, 
              // but for orientation change, often we want elements to stay relatively positioned.
              // However, if we want to be thorough, we could adjust them too.
              // For now, let's just scale position to keep them on page.
            };
          })
        };
      });

      return {
        catalog: { ...state.catalog, pages: newPages }
      };
    });
  },

  setPageBackground: (pageIndex, color) => {
    get().pushHistory();
    set((state) => {
      const newPages = [...state.catalog.pages];
      if (newPages[pageIndex]) {
        newPages[pageIndex].backgroundColor = color;
      }
      return { catalog: { ...state.catalog, pages: newPages, updatedAt: new Date().toISOString() } };
    });
  },

  groupSelected: (pageIndex) => {
    get().pushHistory();
    set((state) => {
      const { selectedElementIds } = state;
      if (selectedElementIds.length < 2) return state;

      const newPages = [...state.catalog.pages];
      const page = { ...newPages[pageIndex] };
      const groupId = `group-${Date.now()}`;

      // 1. Find the indices of selected elements and the maximum index
      const selectedIndices: number[] = [];
      page.elements.forEach((el, idx) => {
        if (selectedElementIds.includes(el.id)) {
          selectedIndices.push(idx);
        }
      });

      const maxIndex = Math.max(...selectedIndices);

      // 2. Separate selected and non-selected elements
      const selectedElements = page.elements.filter(el => selectedElementIds.includes(el.id))
        .map(el => ({ ...el, groupId }));
      const nonSelectedElements = page.elements.filter(el => !selectedElementIds.includes(el.id));

      // 3. Re-insert selected elements as a contiguous block at the highest index
      // More robust approach:
      // Replace the elements at the positions where they were, but move them all to the 'topmost' selection slot.
      const finalElements: CanvasElement[] = [];
      let selectionInserted = false;

      for (let i = 0; i < page.elements.length; i++) {
        if (selectedElementIds.includes(page.elements[i].id)) {
          if (i === maxIndex) {
            finalElements.push(...selectedElements);
            selectionInserted = true;
          }
          // skip individual selected elements otherwise
        } else {
          finalElements.push(page.elements[i]);
        }
      }

      // Fallback if maxIndex logic failed
      if (!selectionInserted) {
        return state;
      }

      page.elements = finalElements;
      newPages[pageIndex] = page;

      return { catalog: { ...state.catalog, pages: newPages, updatedAt: new Date().toISOString() } };
    });
  },

  ungroupSelected: (pageIndex) => {
    get().pushHistory();
    set((state) => {
      const { selectedElementIds } = state;
      if (selectedElementIds.length === 0) return state;

      const newPages = [...state.catalog.pages];
      const page = { ...newPages[pageIndex] };

      const groupsToUngroup = new Set<string>();
      selectedElementIds.forEach(id => {
        const el = page.elements.find(e => e.id === id);
        if (el?.groupId) groupsToUngroup.add(el.groupId);
      });

      if (groupsToUngroup.size === 0) return state;

      page.elements = page.elements.map(el => {
        if (el.groupId && groupsToUngroup.has(el.groupId)) {
          const updated = { ...el };
          delete updated.groupId;
          return updated;
        }
        return el;
      });

      newPages[pageIndex] = page;
      return { catalog: { ...state.catalog, pages: newPages, updatedAt: new Date().toISOString() } };
    });
  },

  addPage: (type: PageType = 'interior') => {
    get().pushHistory();
    set((state) => {
      const theme = THEMES.find(t => t.id === state.activeThemeId) || THEMES[0];
      const elements: CanvasElement[] = [];

      let template: PageTemplate | undefined;
      if (type === 'cover') template = COVER_TEMPLATES[0];
      else if (type === 'index') template = INDEX_TEMPLATES[0];
      else if (type === 'closing') template = CLOSING_TEMPLATES[0];

      if (template) {
        elements.push(...template.elements.map((el, idx) => {
          const isHeading = el.type === 'text' && (el.fontSize && el.fontSize >= 30);
          return {
            rotation: 0,
            opacity: 1,
            ...el,
            id: `page-el-${Date.now()}-${idx}`,
            fontFamily: el.fontFamily || (el.type === 'text' ? (isHeading ? theme.headingFont : theme.fontFamily) : undefined),
            fill: el.fill || (el.type === 'text' ? (isHeading ? theme.headingColor : theme.bodyColor) : undefined)
          } as CanvasElement;
        }));
      }

      const newPage: CatalogPage = {
        id: `page-${Date.now()}`,
        pageNumber: state.catalog.pages.length + 1,
        elements,
        type,
        orientation: 'portrait'
      };
      return {
        catalog: { ...state.catalog, pages: [...state.catalog.pages, newPage], updatedAt: new Date().toISOString() },
        currentPageIndex: state.catalog.pages.length
      };
    });
  },

  addInteriorPageWithInheritedLayout: () => {
    get().pushHistory();
    set((state) => {
      const theme = THEMES.find(t => t.id === state.activeThemeId) || THEMES[0];
      const lastInteriorPage = [...state.catalog.pages].reverse().find(p => p.type === 'interior');
      const inheritedElements: CanvasElement[] = [];
      if (lastInteriorPage) {
        const slots = lastInteriorPage.elements.filter(el => el.id.includes('slot') || el.type === 'shape' || (el.type === 'text' && el.id.includes('gen')));
        slots.forEach((el, idx) => {
          inheritedElements.push({
            ...JSON.parse(JSON.stringify(el)),
            id: `inherited-slot-${idx}-${Date.now()}`,
            productId: undefined,
            src: undefined,
            text: el.type === 'text' ? (el.id.includes('txt-n') ? 'Product Name' : el.id.includes('txt-p') ? '$0.00' : el.text) : el.text
          });
        });
      }
      const newPage: CatalogPage = {
        id: `page-inherited-${Date.now()}`,
        pageNumber: state.catalog.pages.length + 1,
        elements: inheritedElements,
        type: 'interior',
        categoryId: lastInteriorPage?.categoryId,
        orientation: 'portrait'
      };
      return {
        catalog: { ...state.catalog, pages: [...state.catalog.pages, newPage], updatedAt: new Date().toISOString() },
        currentPageIndex: state.catalog.pages.length
      };
    });
  },

  removePage: (index) => {
    get().pushHistory();
    set((state) => {
      if (state.catalog.pages.length <= 1) return state;
      const newPages = state.catalog.pages
        .filter((_, i) => i !== index)
        .map((p, i) => ({ ...p, pageNumber: i + 1 }));
      return {
        catalog: { ...state.catalog, pages: newPages, updatedAt: new Date().toISOString() },
        currentPageIndex: Math.min(Math.max(0, index), newPages.length - 1)
      };
    });
  },

  duplicatePage: (index) => {
    const { catalog } = get();
    get().pushHistory();
    const pageToDuplicate = catalog.pages[index];
    const newPage = JSON.parse(JSON.stringify(pageToDuplicate));
    newPage.id = `page-dup-${Date.now()}`;
    newPage.elements = newPage.elements.map((el: any) => ({
      ...el,
      id: `el-pdup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }));
    const newPages = [...catalog.pages];
    newPages.splice(index + 1, 0, newPage);
    const renumberedPages = newPages.map((p, i) => ({ ...p, pageNumber: i + 1 }));
    set({
      catalog: { ...catalog, pages: renumberedPages, updatedAt: new Date().toISOString() },
      currentPageIndex: index + 1
    });
  },

  reorderPages: (newPageIds) => set((state) => {
    get().pushHistory();
    const { catalog, currentPageIndex } = state;
    const currentPageId = catalog.pages[currentPageIndex]?.id;
    const reorderedPages = newPageIds.map((id, index) => {
      const page = catalog.pages.find(p => p.id === id)!;
      return { ...page, pageNumber: index + 1 };
    });
    const newCurrentPageIndex = reorderedPages.findIndex(p => p.id === currentPageId);
    return {
      catalog: { ...catalog, pages: reorderedPages, updatedAt: new Date().toISOString() },
      currentPageIndex: newCurrentPageIndex !== -1 ? newCurrentPageIndex : 0
    };
  }),

  toggleCatalogProduct: (productId) => set((state) => {
    const productIds = state.catalog.productIds || [];
    const newProductIds = productIds.includes(productId)
      ? productIds.filter(id => id !== productId)
      : [...productIds, productId];
    return {
      catalog: { ...state.catalog, productIds: newProductIds, updatedAt: new Date().toISOString() }
    };
  }),

  removeProductFromCanvas: (productId: string) => {
    get().pushHistory();
    set((state) => {
      const newPages = state.catalog.pages.map(page => ({
        ...page,
        elements: page.elements.filter(el => el.productId !== productId)
      }));
      return {
        catalog: { ...state.catalog, pages: newPages, updatedAt: new Date().toISOString() },
        selectedElementIds: state.selectedElementIds.filter(id => {
          const el = state.catalog.pages.flatMap(p => p.elements).find(e => e.id === id);
          return el?.productId !== productId;
        })
      };
    });
  },

  removeProductFromPage: (pageIndex: number, productId: string) => {
    get().pushHistory();
    set((state) => {
      const newPages = [...state.catalog.pages];
      newPages[pageIndex] = {
        ...newPages[pageIndex],
        elements: newPages[pageIndex].elements.filter(el => el.productId !== productId)
      };
      return {
        catalog: { ...state.catalog, pages: newPages, updatedAt: new Date().toISOString() },
        selectedElementIds: state.selectedElementIds.filter(id => {
          const el = newPages[pageIndex].elements.find(e => e.id === id);
          return el?.productId !== productId;
        })
      };
    });
  },

  generateCatalogFromTemplate: (name, template, categoryIds, options = { includeCover: true, includeIndex: true, includeCategoryCovers: true, selectedTemplateId: 'tpl-blank' } as any) => set((state) => {
    const theme = THEMES.find(t => t.id === state.activeThemeId) || THEMES[0];

    // Special Case: Blank Template (4 blank pages: Cover, Index, Product, Closing)
    if ((options as any)?.selectedTemplateId === 'tpl-blank') {
      const blankPages: CatalogPage[] = [
        {
          id: `p-cover-blank-${Date.now()}`,
          pageNumber: 1,
          elements: [],
          type: 'cover',
          backgroundColor: '#ffffff'
        },
        {
          id: `p-index-blank-${Date.now()}`,
          pageNumber: 2,
          elements: [],
          type: 'index',
          backgroundColor: '#ffffff'
        },
        {
          id: `p-product-blank-${Date.now()}`,
          pageNumber: 3,
          elements: [],
          type: 'product',
          backgroundColor: '#ffffff'
        },
        {
          id: `p-closing-blank-${Date.now()}`,
          pageNumber: 4,
          elements: [],
          type: 'closing',
          backgroundColor: '#ffffff'
        }
      ];

      return {
        catalog: {
          ...state.catalog,
          id: `cat-${Date.now()}`,
          name,
          status: 'draft',
          pages: blankPages,
          updatedAt: new Date().toISOString()
        },
        currentView: 'editor',
        currentPageIndex: 0,
        selectedElementIds: []
      };
    }

    const allPages: CatalogPage[] = [];
    let currentPageNumber = 1;

    // 1. Global Cover Page
    if (options.includeCover) {
      const coverTemplate = COVER_TEMPLATES[0];

      // Filter out redundant background shapes (x=0, y=0, w=794, h=1123)
      const globalCoverElements = coverTemplate.elements
        .filter(el => !(el.type === 'shape' && el.x === 0 && el.y === 0 && el.width === PAGE_WIDTH && el.height === PAGE_HEIGHT))
        .map((el, idx) => {
          const id = `cover-el-${Date.now()}-${idx}`;
          const base = { rotation: 0, opacity: 1, ...el, id };
          if (el.type === 'text') {
            const isHeading = el.fontSize && el.fontSize >= 30;
            return {
              ...base,
              fontFamily: theme.fontFamily,
              fill: el.fill || (isHeading ? theme.headingColor : theme.bodyColor),
              fontWeight: el.fontWeight || (isHeading ? '900' : '400')
            };
          }
          return base;
        });

      allPages.push({
        id: `p-cover-global`,
        pageNumber: currentPageNumber++,
        elements: globalCoverElements as CanvasElement[],
        type: 'cover'
      });
    }

    // Dynamic safety zones
    const curCatalog = state.catalog;
    const headerH = curCatalog.hasHeader ? (curCatalog.headerHeight || 40) : 0;
    const footerH = curCatalog.hasFooter ? (curCatalog.footerHeight || 40) : 0;
    const marginTop = curCatalog.marginTop || 0;
    const marginBottom = curCatalog.marginBottom || 0;

    // Determine initial page counter for content (taking Index into account if enabled)
    // If index is enabled, it will take the current `currentPageNumber` slot, so content starts at `currentPageNumber + 1`
    let contentPageCounter = options.includeIndex ? currentPageNumber + 1 : currentPageNumber;

    // TOC Data container
    const tocEntries: { name: string; pageNumber: number }[] = [];

    const generatePageElements = (productsForPage: Product[]) => {
      const gridElements: CanvasElement[] = [];

      if (template.decorations) {
        template.decorations.forEach((dec, idx) => {
          gridElements.push({
            ...dec,
            id: `dec-${Date.now()}-${Math.random()}-${idx}`,
            zIndex: dec.zIndex || -1
          } as CanvasElement);
        });
      }

      const padding = template.padding;
      const spacing = template.spacing;

      const leftMargin = curCatalog.marginLeft !== undefined ? curCatalog.marginLeft : padding;
      const rightMargin = curCatalog.marginRight !== undefined ? curCatalog.marginRight : padding;
      const topMargin = curCatalog.marginTop !== undefined ? curCatalog.marginTop : padding;
      const bottomMargin = curCatalog.marginBottom !== undefined ? curCatalog.marginBottom : padding;

      const availableWidth = PAGE_WIDTH - leftMargin - rightMargin;
      const availableHeight = PAGE_HEIGHT - topMargin - bottomMargin - headerH - footerH;
      const slotWidth = (availableWidth - (template.cols - 1) * spacing) / template.cols;
      const slotHeight = (availableHeight - (template.rows - 1) * spacing) / template.rows;

      productsForPage.forEach((product, index) => {
        const col = index % template.cols;
        const row = Math.floor(index / template.cols);
        const x = leftMargin + col * (slotWidth + spacing);
        const y = headerH + topMargin + row * (slotHeight + spacing);

        gridElements.push({
          id: `product-block-${row}-${col}-${Date.now()}-${Math.random()}`,
          type: 'product-block',
          x, y, width: slotWidth, height: slotHeight,
          rotation: 0, opacity: 1, productId: product.id, zIndex: 1,
          cardTheme: template.cardTheme || 'classic-stack'
        } as CanvasElement);
      });
      return gridElements;
    };

    // Iterate through selected categories to generate content pages
    categoryIds.forEach(categoryId => {
      const catProducts = state.products.filter(p => p.categoryId === categoryId);
      const category = state.categories.find(c => c.id === categoryId);

      if (catProducts.length === 0) return;

      // Record TOC Entry for this category
      tocEntries.push({
        name: category?.name || 'Category',
        pageNumber: contentPageCounter
      });

      // Category Section Page (Divider/Cover) - CONDITIONAL
      if (options.includeCategoryCovers) {
        const sectionCoverElements: CanvasElement[] = [
          {
            id: `sec-title-${categoryId}-${Date.now()}`,
            type: 'text',
            x: 0, y: (PAGE_HEIGHT + headerH - footerH) / 2 - 40, width: PAGE_WIDTH, height: 80,
            text: category?.name || 'Category',
            fontSize: 48,
            fontFamily: theme.headingFont,
            fontWeight: '900',
            fill: theme.headingColor,
            textAlign: 'center',
            zIndex: 1,
            rotation: 0,
            opacity: 1
          },
          {
            id: `sec-desc-${categoryId}-${Date.now()}`,
            type: 'text',
            x: 40, y: (PAGE_HEIGHT + headerH - footerH) / 2 + 50, width: PAGE_WIDTH - 80, height: 40,
            text: `${catProducts.length} Items`,
            fontSize: 16,
            fontFamily: theme.fontFamily,
            fill: theme.bodyColor,
            textAlign: 'center',
            zIndex: 1,
            rotation: 0,
            opacity: 1
          }
        ];

        allPages.push({
          id: `p-section-${categoryId}`,
          pageNumber: contentPageCounter,
          elements: sectionCoverElements,
          type: 'intro',
          categoryId: categoryId,
          backgroundColor: category?.color || theme.backgroundColor
        });
        contentPageCounter++;
      }

      // Product Grids for this Category
      const productsPerPage = template.cols * template.rows;
      for (let i = 0; i < catProducts.length; i += productsPerPage) {
        allPages.push({
          id: `p-grid-${categoryId}-${i}-${Date.now()}`,
          pageNumber: contentPageCounter,
          elements: generatePageElements(catProducts.slice(i, i + productsPerPage)),
          type: 'product',
          categoryId: categoryId
        });
        contentPageCounter++;
      }
    });

    // Generate and Insert Index Page if enabled
    if (options.includeIndex) {
      const indexElements: CanvasElement[] = [
        {
          id: `idx-title-${Date.now()}`,
          type: 'text',
          x: 60, y: marginTop + 40, width: PAGE_WIDTH - 120, height: 80,
          text: 'INDEX',
          fontSize: 52,
          fontFamily: theme.headingFont,
          fontWeight: '900',
          fill: theme.headingColor,
          zIndex: 1, rotation: 0, opacity: 1
        },
        {
          id: `idx-line-${Date.now()}`,
          type: 'shape',
          shapeType: 'rect',
          x: 60, y: marginTop + 125, width: 100, height: 8,
          fill: theme.accentColor,
          zIndex: 1, rotation: 0, opacity: 1
        }
      ];

      let currentY = marginTop + 220;
      tocEntries.forEach((entry, i) => {
        indexElements.push({
          id: `idx-entry-name-${i}-${Date.now()}`,
          type: 'text',
          x: 60, y: currentY, width: 500, height: 30,
          text: entry.name.toUpperCase(),
          fontSize: 14,
          fontFamily: theme.fontFamily,
          fontWeight: '700',
          fill: theme.headingColor,
          zIndex: 2, rotation: 0, opacity: 1
        });

        // Separator line
        indexElements.push({
          id: `idx-entry-line-${i}-${Date.now()}`,
          type: 'shape',
          shapeType: 'rect',
          x: 60, y: currentY + 40, width: PAGE_WIDTH - 120, height: 1,
          fill: theme.bodyColor,
          opacity: 0.1,
          zIndex: 1, rotation: 0
        });

        indexElements.push({
          id: `idx-entry-num-${i}-${Date.now()}`,
          type: 'text',
          x: PAGE_WIDTH - 100, y: currentY, width: 40, height: 30,
          text: entry.pageNumber.toString().padStart(2, '0'),
          fontSize: 14,
          fontFamily: theme.fontFamily,
          fontWeight: '700',
          fill: theme.accentColor,
          textAlign: 'right',
          zIndex: 2, rotation: 0, opacity: 1
        });

        currentY += 80;
      });

      const indexPage: CatalogPage = {
        id: `p-index-generated`,
        pageNumber: currentPageNumber, // Use the slot reserved for index
        elements: indexElements,
        type: 'index',
        backgroundColor: theme.backgroundColor
      };

      // Insert Index Page
      const insertIndex = options.includeCover ? 1 : 0;
      allPages.splice(insertIndex, 0, indexPage);
    }

    const allCategoryProducts = state.products.filter(p => p.categoryId && categoryIds.includes(p.categoryId));

    return {
      catalog: {
        ...state.catalog,
        id: `cat-${Date.now()}`,
        name,
        status: 'draft',
        pages: allPages,
        updatedAt: new Date().toISOString()
      },
      currentView: 'editor',
      currentPageIndex: 0,
      selectedElementIds: []
    };
  }),

  applyCoverTemplate: (pageIndex: number | null, template: PageTemplate) => {
    get().pushHistory();
    set((state) => {
      const theme = THEMES.find(t => t.id === state.activeThemeId) || THEMES[0];
      const newPages = [...state.catalog.pages];

      const applyToPage = (idx: number) => {
        const targetPage = newPages[idx];
        // Guard: Cannot apply cover to intro, index, closing, etc.
        if (targetPage && targetPage.type !== 'cover' && targetPage.type !== 'blank') {
          console.warn(`Cannot apply cover template to a ${targetPage.type} page.`);
          return;
        }

        const themedElements = template.elements
          .filter(el => !(el.type === 'shape' && el.x === 0 && el.y === 0 && el.width === PAGE_WIDTH && el.height === PAGE_HEIGHT))
          .map((el, eIdx) => {
            const id = `cover-el-${Date.now()}-${idx}-${eIdx}`;
            const base = { rotation: 0, opacity: 1, ...el, id };
            if (el.type === 'text') {
              const isHeading = el.fontSize && el.fontSize >= 30;
              return {
                ...base,
                fontFamily: el.fontFamily || theme.fontFamily,
                fill: el.fill || (isHeading ? theme.headingColor : theme.bodyColor),
                fontWeight: el.fontWeight || (isHeading ? '900' : '400')
              };
            }
            return base;
          });
        newPages[idx] = {
          ...newPages[idx],
          elements: themedElements as CanvasElement[],
          type: 'cover',
          backgroundColor: template.backgroundColor || theme.backgroundColor
        };
      };

      if (pageIndex === null) {
        newPages.forEach((p, i) => { if (p.type === 'cover') applyToPage(i); });
      } else {
        applyToPage(pageIndex);
      }

      return { catalog: { ...state.catalog, pages: newPages, updatedAt: new Date().toISOString() }, selectedElementIds: [] };
    });
  },

  applyIndexTemplate: (pageIndex, template) => {
    get().pushHistory();
    set((state) => {
      const theme = THEMES.find(t => t.id === state.activeThemeId) || THEMES[0];
      const newPages = [...state.catalog.pages];

      const applyToPage = (idx: number) => {
        const targetPage = newPages[idx];
        // Guard: Cannot apply index template to intro, cover, product, closing pages
        if (targetPage && targetPage.type !== 'index' && targetPage.type !== 'blank') {
          console.warn(`Cannot apply index template to a ${targetPage.type} page.`);
          return;
        }

        const themedElements = template.elements
          .filter(el => !(el.type === 'shape' && el.x === 0 && el.y === 0 && el.width === PAGE_WIDTH && el.height === PAGE_HEIGHT))
          .map((el, eIdx) => {
            const id = `index-el-${Date.now()}-${idx}-${eIdx}`;
            const base = { rotation: 0, opacity: 1, ...el, id };
            if (el.type === 'text') {
              const isHeading = el.fontSize && el.fontSize >= 30;
              return {
                ...base,
                fontFamily: el.fontFamily || (isHeading ? theme.headingFont : theme.fontFamily),
                fill: el.fill || (isHeading ? theme.headingColor : theme.bodyColor),
                fontWeight: el.fontWeight || (isHeading ? '900' : '400')
              };
            }
            return base;
          });
        newPages[idx] = {
          ...newPages[idx],
          elements: themedElements as CanvasElement[],
          type: 'index',
          backgroundColor: template.backgroundColor || theme.backgroundColor
        };
      };

      if (pageIndex === null) {
        newPages.forEach((p, i) => { if (p.type === 'index') applyToPage(i); });
      } else {
        applyToPage(pageIndex);
      }

      return { catalog: { ...state.catalog, pages: newPages, updatedAt: new Date().toISOString() }, selectedElementIds: [] };
    });
  },

  applyClosingTemplate: (pageIndex, template) => {
    get().pushHistory();
    set((state) => {
      const theme = THEMES.find(t => t.id === state.activeThemeId) || THEMES[0];
      const newPages = [...state.catalog.pages];

      const applyToPage = (idx: number) => {
        const targetPage = newPages[idx];
        // Guard: Cannot apply closing template to intro, cover, product, index pages
        if (targetPage && targetPage.type !== 'closing' && targetPage.type !== 'blank') {
          console.warn(`Cannot apply closing template to a ${targetPage.type} page.`);
          return;
        }

        const themedElements = template.elements
          .filter(el => !(el.type === 'shape' && el.x === 0 && el.y === 0 && el.width === PAGE_WIDTH && el.height === PAGE_HEIGHT))
          .map((el, eIdx) => {
            const id = `closing-el-${Date.now()}-${idx}-${eIdx}`;
            const base = { rotation: 0, opacity: 1, ...el, id };
            if (el.type === 'text') {
              const isHeading = el.fontSize && el.fontSize >= 30;
              return {
                ...base,
                fontFamily: el.fontFamily || (isHeading ? theme.headingFont : theme.fontFamily),
                fill: theme.bodyColor, // Default theme color if not specified
                fontWeight: el.fontWeight || (isHeading ? '900' : '400')
              };
            }
            return base;
          });
        newPages[idx] = {
          ...newPages[idx],
          elements: themedElements as CanvasElement[],
          type: 'closing',
          backgroundColor: template.backgroundColor || theme.backgroundColor
        };
      };

      if (pageIndex === null) {
        newPages.forEach((p, i) => { if (p.type === 'closing') applyToPage(i); });
      } else {
        applyToPage(pageIndex);
      }

      return { catalog: { ...state.catalog, pages: newPages, updatedAt: new Date().toISOString() }, selectedElementIds: [] };
    });
  },

  applyHeaderTemplate: (template: HeaderFooterTemplate) => {
    get().pushHistory();
    set((state) => {
      const newHeaderElements = template.elements.map((el, i) => ({
        ...el,
        id: el.id || `hdr-el-${Date.now()}-${i}`,
        locked: el.locked ?? false,
        zIndex: 1000 + (el.zIndex !== undefined ? el.zIndex : (i + 1)),
        opacity: el.opacity ?? 1,
        rotation: el.rotation ?? 0
      })) as CanvasElement[];

      return {
        catalog: {
          ...state.catalog,
          hasHeader: true,
          headerHeight: template.height,
          headerElements: newHeaderElements,
          headerMigrated: true,
          updatedAt: new Date().toISOString()
        }
      };
    });
  },

  applyFooterTemplate: (template: HeaderFooterTemplate) => {
    get().pushHistory();
    set((state) => {
      const newFooterElements = template.elements.map((el, i) => ({
        ...el,
        id: el.id || `ftr-el-${Date.now()}-${i}`,
        locked: el.locked ?? false,
        zIndex: 2000 + (el.zIndex !== undefined ? el.zIndex : (i + 1)),
        opacity: el.opacity ?? 1,
        rotation: el.rotation ?? 0
      })) as CanvasElement[];

      return {
        catalog: {
          ...state.catalog,
          hasFooter: true,
          footerHeight: template.height,
          footerElements: newFooterElements,
          footerMigrated: true,
          updatedAt: new Date().toISOString()
        }
      };
    });
  },

  applyInventoryLayout: (pageIndex, template) => {
    get().pushHistory();
    set((state) => {
      const theme = THEMES.find(t => t.id === state.activeThemeId) || THEMES[0];
      let currentCatalogPages = [...state.catalog.pages];

      // In global mode (pageIndex === null), apply cover/index/closing templates to respective pages
      if (pageIndex === null) {
        // Apply cover template to all cover pages
        const coverTemplate = COVER_TEMPLATES[0];
        currentCatalogPages.forEach((p, i) => {
          if (p.type === 'cover') {
            const themedElements = coverTemplate.elements.map((el, eIdx) => {
              const id = `cover-el-${Date.now()}-${i}-${eIdx}`;
              const base = { rotation: 0, opacity: 1, ...el, id };
              if (el.type === 'text') {
                const isHeading = el.fontSize && el.fontSize >= 30;
                return {
                  ...base,
                  fontFamily: el.fontFamily || theme.fontFamily,
                  fill: el.fill || (isHeading ? theme.headingColor : theme.bodyColor),
                  fontWeight: el.fontWeight || (isHeading ? '900' : '400')
                };
              }
              return base;
            });
            currentCatalogPages[i] = { ...p, elements: themedElements as CanvasElement[] };
          }
        });

        // Apply index template to all index pages
        const indexTemplate = INDEX_TEMPLATES[0];
        currentCatalogPages.forEach((p, i) => {
          if (p.type === 'index') {
            const themedElements = indexTemplate.elements.map((el, eIdx) => {
              const id = `index-el-${Date.now()}-${i}-${eIdx}`;
              const base = { rotation: 0, opacity: 1, ...el, id };
              if (el.type === 'text') {
                const isHeading = el.fontSize && el.fontSize >= 30;
                return {
                  ...base,
                  fontFamily: el.fontFamily || (isHeading ? theme.headingFont : theme.fontFamily),
                  fill: el.fill || (isHeading ? theme.headingColor : theme.bodyColor),
                  fontWeight: el.fontWeight || (isHeading ? '900' : '400')
                };
              }
              return base;
            });
            currentCatalogPages[i] = { ...p, elements: themedElements as CanvasElement[] };
          }
        });

        // Apply closing template to all closing pages
        const closingTemplate = CLOSING_TEMPLATES[0];
        currentCatalogPages.forEach((p, i) => {
          if (p.type === 'closing') {
            const themedElements = closingTemplate.elements.map((el, eIdx) => {
              const id = `closing-el-${Date.now()}-${i}-${eIdx}`;
              const base = { rotation: 0, opacity: 1, ...el, id };
              if (el.type === 'text') {
                const isHeading = el.fontSize && el.fontSize >= 30;
                return {
                  ...base,
                  fontFamily: el.fontFamily || (isHeading ? theme.headingFont : theme.fontFamily),
                  fill: el.fill || (isHeading ? theme.headingColor : theme.bodyColor),
                  fontWeight: el.fontWeight || (isHeading ? '900' : '400')
                };
              }
              return base;
            });
            currentCatalogPages[i] = { ...p, elements: themedElements as CanvasElement[] };
          }
        });
      }

      // If pageIndex is NOT null, we ONLY update that specific single page!
      if (pageIndex !== null && pageIndex >= 0 && pageIndex < currentCatalogPages.length) {
        const targetPage = currentCatalogPages[pageIndex];

        // STRICT RULE: Body Grid CANNOT be applied to Cover, Intro, Index, or Closing pages!
        if (targetPage.type === 'cover' || targetPage.type === 'intro' || targetPage.type === 'index' || targetPage.type === 'closing') {
          console.warn(`Cannot apply body grid layout to a ${targetPage.type} page.`);
          return state;
        }
        const existingProductIds = targetPage.elements
          .filter(el => el.type === 'product-block' && el.productId)
          .map(el => el.productId as string);
        
        let targetProducts: Product[] = existingProductIds
          .map(id => state.products.find(p => p.id === id))
          .filter(Boolean) as Product[];

        if (targetProducts.length === 0) {
          const catId = targetPage.categoryId || state.catalog.selectedCategoryIds?.[0] || state.categories[0]?.id;
          targetProducts = state.products.filter(p => p.categoryId === catId);
        }

        const itemsPerPage = template.cols * template.rows;
        const pageProducts = targetProducts.slice(0, itemsPerPage);

        const curCatalog = state.catalog;
        const headerH = curCatalog.hasHeader ? (curCatalog.headerHeight || 40) : 0;
        const footerH = curCatalog.hasFooter ? (curCatalog.footerHeight || 40) : 0;
        
        const padding = template.padding || 35;
        const spacing = template.spacing || 20;

        const leftMargin = template.padding !== undefined ? template.padding : (curCatalog.marginLeft ?? 35);
        const rightMargin = template.padding !== undefined ? template.padding : (curCatalog.marginRight ?? 35);
        const topMargin = template.padding !== undefined ? template.padding : (curCatalog.marginTop ?? 35);
        const bottomMargin = template.padding !== undefined ? template.padding : (curCatalog.marginBottom ?? 35);

        const availableWidth = Math.max(100, PAGE_WIDTH - leftMargin - rightMargin);
        const availableHeight = Math.max(100, PAGE_HEIGHT - topMargin - bottomMargin - headerH - footerH);
        const slotWidth = Math.max(50, (availableWidth - (template.cols - 1) * spacing) / template.cols);
        const slotHeight = Math.max(50, (availableHeight - (template.rows - 1) * spacing) / template.rows);

        const newGridElements: CanvasElement[] = [];

        // Add decorations if any
        if (template.decorations) {
          template.decorations.forEach((dec, idx) => {
            newGridElements.push({
              ...dec,
              id: `dec-${Date.now()}-${pageIndex}-${idx}`,
              zIndex: dec.zIndex || -1
            } as CanvasElement);
          });
        }

        // Keep non-product elements (like user added text, shapes, stamps)
        const preservedElements = targetPage.elements.filter(
          el => el.type !== 'product-block' && !el.id?.startsWith('dec-') && !el.id?.startsWith('pb-')
        );

        pageProducts.forEach((product, index) => {
          const col = index % template.cols;
          const row = Math.floor(index / template.cols);
          const x = leftMargin + col * (slotWidth + spacing);
          const y = headerH + topMargin + row * (slotHeight + spacing);

          newGridElements.push({
            id: `pb-${Date.now()}-${pageIndex}-${index}`,
            type: 'product-block',
            x, y, width: slotWidth, height: slotHeight,
            rotation: 0, opacity: 1, productId: product.id, zIndex: 1,
            cardTheme: template.cardTheme || 'classic-stack'
          } as CanvasElement);
        });

        currentCatalogPages[pageIndex] = {
          ...targetPage,
          elements: [...preservedElements, ...newGridElements],
          type: 'product',
          backgroundColor: template.backgroundColor || targetPage.backgroundColor || state.catalog.backgroundColor
        };

        return {
          catalog: {
            ...state.catalog,
            pages: currentCatalogPages,
            updatedAt: new Date().toISOString()
          },
          currentPageIndex: pageIndex,
          selectedElementIds: []
        };
      }

      // Global mode (pageIndex === null): Reflow all product/interior pages across categories
      const pagesToProcess = state.catalog.pages.filter(p => p.type === 'product' || p.type === 'interior');

      const categoryIdsToProcess = Array.from(new Set(pagesToProcess.map(p => {
        if (p.categoryId) return p.categoryId;
        const firstProd = p.elements.find(el => el.productId);
        if (firstProd?.productId) return state.products.find(prod => prod.id === firstProd.productId)?.categoryId;
        return null;
      }).filter(Boolean))) as string[];

      if (categoryIdsToProcess.length === 0) categoryIdsToProcess.push(state.catalog.selectedCategoryIds?.[0] || 'cat1');

      categoryIdsToProcess.forEach(targetCategoryId => {
        const catProducts = state.products.filter(p => p.categoryId === targetCategoryId);
        const itemsPerPage = template.cols * template.rows;

        const generatePageElements = (chunk: Product[], pageOrder: number) => {
          const gridElements: CanvasElement[] = [];

          if (template.decorations) {
            template.decorations.forEach((dec, idx) => {
              gridElements.push({
                ...dec,
                id: `dec-reflow-${Date.now()}-${pageOrder}-${idx}`,
                zIndex: dec.zIndex || -1
              } as CanvasElement);
            });
          }

          const curCatalog = state.catalog;
          const headerH = curCatalog.hasHeader ? (curCatalog.headerHeight || 40) : 0;
          const footerH = curCatalog.hasFooter ? (curCatalog.footerHeight || 40) : 0;
          
          const padding = template.padding || 35;
          const spacing = template.spacing || 20;

          const leftMargin = template.padding !== undefined ? template.padding : (curCatalog.marginLeft ?? 35);
          const rightMargin = template.padding !== undefined ? template.padding : (curCatalog.marginRight ?? 35);
          const topMargin = template.padding !== undefined ? template.padding : (curCatalog.marginTop ?? 35);
          const bottomMargin = template.padding !== undefined ? template.padding : (curCatalog.marginBottom ?? 35);

          const availableWidth = Math.max(100, PAGE_WIDTH - leftMargin - rightMargin);
          const availableHeight = Math.max(100, PAGE_HEIGHT - topMargin - bottomMargin - headerH - footerH);
          const slotWidth = Math.max(50, (availableWidth - (template.cols - 1) * spacing) / template.cols);
          const slotHeight = Math.max(50, (availableHeight - (template.rows - 1) * spacing) / template.rows);

          chunk.forEach((product, index) => {
            const col = index % template.cols;
            const row = Math.floor(index / template.cols);
            const x = leftMargin + col * (slotWidth + spacing);
            const y = headerH + topMargin + row * (slotHeight + spacing);

            gridElements.push({
              id: `pb-reflow-${Date.now()}-${pageOrder}-${index}`,
              type: 'product-block',
              x, y, width: slotWidth, height: slotHeight,
              rotation: 0, opacity: 1, productId: product.id, zIndex: 1,
              cardTheme: template.cardTheme || 'classic-stack'
            } as CanvasElement);
          });

          return gridElements;
        };

        const categoryPageIndices: number[] = [];
        currentCatalogPages.forEach((p, i) => {
          if (p.categoryId === targetCategoryId) categoryPageIndices.push(i);
        });

        if (categoryPageIndices.length > 0) {
          const insertPosition = categoryPageIndices[0];
          const numPagesNeeded = Math.max(1, Math.ceil(catProducts.length / itemsPerPage));
          const newCatPages: CatalogPage[] = [];

          for (let i = 0; i < numPagesNeeded; i++) {
            const chunk = catProducts.slice(i * itemsPerPage, (i + 1) * itemsPerPage);
            newCatPages.push({
              id: `p-gen-${targetCategoryId}-${Date.now()}-${i}`,
              pageNumber: 0,
              elements: generatePageElements(chunk, i),
              type: 'product' as PageType,
              categoryId: targetCategoryId
            });
          }

          const indicesToRemove = new Set(categoryPageIndices);
          const pagesWithout = currentCatalogPages.filter((_, i) => !indicesToRemove.has(i));
          const safeInsertPos = Math.min(insertPosition, pagesWithout.length);

          const finalPages = [...pagesWithout];
          finalPages.splice(safeInsertPos, 0, ...newCatPages);
          currentCatalogPages = finalPages;
        }
      });

      // Renumber and finalize
      const renumberedPages = currentCatalogPages.map((p, i) => ({ ...p, pageNumber: i + 1 }));

      return {
        catalog: {
          ...state.catalog,
          pages: renumberedPages,
          updatedAt: new Date().toISOString(),
          backgroundColor: template.backgroundColor || state.catalog.backgroundColor
        },
        currentPageIndex: Math.min(state.currentPageIndex, renumberedPages.length - 1),
        selectedElementIds: []
      };
    });
  },

  reflowAllProductPages: (updatedCatalog) => {
    set((state) => {
      const catalog = updatedCatalog || state.catalog;
      
      // 1. Gather all unique category IDs from existing interior pages
      const interiorPages = catalog.pages.filter(p => p.type === 'interior');
      const categoryIds = Array.from(new Set(interiorPages.map(p => p.categoryId).filter(Boolean))) as string[];
      
      if (categoryIds.length === 0) {
        categoryIds.push(catalog.selectedCategoryIds?.[0] || 'cat1');
      }

      const newPages: CatalogPage[] = [];

      // 2. Add prefix pages (covers/index before first interior page)
      const firstInteriorIndex = catalog.pages.findIndex(p => p.type === 'interior');
      const prefixPages = firstInteriorIndex !== -1 ? catalog.pages.slice(0, firstInteriorIndex) : [];
      newPages.push(...prefixPages);

      const cols = catalog.gridCols || 2;
      const rows = catalog.gridRows || 2;
      const itemsPerPage = cols * rows;

      const spacing = catalog.gridSpacing ?? 30;
      const padding = catalog.gridPadding ?? 50;

      const headerH = catalog.hasHeader ? (catalog.headerHeight || 113.4) : 0;
      const footerH = catalog.hasFooter ? (catalog.footerHeight || 75.6) : 0;
      const leftMargin = catalog.marginLeft ?? padding;
      const rightMargin = catalog.marginRight ?? padding;
      const topMargin = catalog.marginTop ?? padding;
      const bottomMargin = catalog.marginBottom ?? padding;

      const availableWidth = PAGE_WIDTH - leftMargin - rightMargin;
      const availableHeight = PAGE_HEIGHT - topMargin - bottomMargin - headerH - footerH;
      const slotWidth = (availableWidth - (cols - 1) * spacing) / cols;
      const slotHeight = (availableHeight - (rows - 1) * spacing) / rows;

      let pageOrder = newPages.length + 1;

      categoryIds.forEach(targetCategoryId => {
        const catProducts = state.products.filter(p => p.categoryId && String(p.categoryId) === String(targetCategoryId));
        const numPagesNeeded = Math.max(1, Math.ceil(catProducts.length / itemsPerPage));

        for (let i = 0; i < numPagesNeeded; i++) {
          const chunk = catProducts.slice(i * itemsPerPage, (i + 1) * itemsPerPage);
          const gridElements: CanvasElement[] = [];

          gridElements.push({
            id: `int-bg-${Date.now()}-${pageOrder}-${i}`,
            type: 'shape',
            shapeType: 'rect',
            x: 0,
            y: 0,
            width: PAGE_WIDTH,
            height: PAGE_HEIGHT,
            fill: '#ffffff',
            zIndex: 0
          } as CanvasElement);

          chunk.forEach((product, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);
            const x = leftMargin + col * (slotWidth + spacing);
            const y = headerH + topMargin + row * (slotHeight + spacing);

            gridElements.push({
              id: `pb-reflow-${Date.now()}-${pageOrder}-${index}`,
              type: 'product-block',
              x,
              y,
              width: slotWidth,
              height: slotHeight,
              rotation: 0,
              opacity: 1,
              productId: product.id,
              zIndex: 1,
              cardTheme: catalog.gridCardTheme || 'classic-stack'
            } as CanvasElement);
          });

          newPages.push({
            id: `p-reflow-${targetCategoryId}-${Date.now()}-${i}`,
            pageNumber: pageOrder++,
            elements: gridElements,
            type: 'interior',
            categoryId: targetCategoryId
          });
        }
      });

      // 3. Add suffix pages (outro/closing pages after last interior page)
      const lastInteriorIndex = catalog.pages.map(p => p.type).lastIndexOf('interior');
      const suffixPages = lastInteriorIndex !== -1 ? catalog.pages.slice(lastInteriorIndex + 1) : [];
      suffixPages.forEach((p) => {
        newPages.push({
          ...p,
          pageNumber: pageOrder++
        });
      });

      return {
        catalog: {
          ...catalog,
          pages: newPages,
          updatedAt: new Date().toISOString()
        },
        selectedElementIds: []
      };
    });
  },

  // Master Actions Implementation
  addHeaderElement: (element) => set((state) => ({
    catalog: {
      ...state.catalog,
      headerElements: [...(state.catalog.headerElements || []), { ...element, zIndex: 1000 + ((state.catalog.headerElements || []).length + 1) }],
      updatedAt: new Date().toISOString()
    }
  })),

  addFooterElement: (element) => set((state) => ({
    catalog: {
      ...state.catalog,
      footerElements: [...(state.catalog.footerElements || []), { ...element, zIndex: 2000 + ((state.catalog.footerElements || []).length + 1) }],
      updatedAt: new Date().toISOString()
    }
  })),

  updateHeaderElement: (elementId, updates) => {
    get().pushHistory();
    set((state) => ({
      catalog: {
        ...state.catalog,
        headerElements: (state.catalog.headerElements || []).map(el => el.id === elementId ? { ...el, ...updates } : el),
        updatedAt: new Date().toISOString()
      }
    }));
  },

  updateFooterElement: (elementId, updates) => {
    get().pushHistory();
    set((state) => ({
      catalog: {
        ...state.catalog,
        footerElements: (state.catalog.footerElements || []).map(el => el.id === elementId ? { ...el, ...updates } : el),
        updatedAt: new Date().toISOString()
      }
    }));
  },

  removeHeaderElement: (elementId) => set((state) => ({
    catalog: {
      ...state.catalog,
      headerElements: (state.catalog.headerElements || []).filter(el => el.id !== elementId),
      updatedAt: new Date().toISOString()
    }
  })),

  removeFooterElement: (elementId) => set((state) => ({
    catalog: {
      ...state.catalog,
      footerElements: (state.catalog.footerElements || []).filter(el => el.id !== elementId),
      updatedAt: new Date().toISOString()
    }
  })),

  copySelectedElements: () => {
    const { selectedElementIds, catalog, currentPageIndex } = get();
    if (selectedElementIds.length === 0) return;

    const page = catalog.pages[currentPageIndex];
    const headerEls = catalog.headerElements || [];
    const footerEls = catalog.footerElements || [];

    const elementsToCopy: CanvasElement[] = [];

    selectedElementIds.forEach(id => {
      let el = page?.elements.find(e => e.id === id);
      if (!el) el = headerEls.find(e => e.id === id);
      if (!el) el = footerEls.find(e => e.id === id);

      if (el) {
        elementsToCopy.push(JSON.parse(JSON.stringify(el)));
      }
    });

    set({ clipboard: elementsToCopy });
  },

  pasteElements: () => {
    const { clipboard, catalog, currentPageIndex } = get();
    if (clipboard.length === 0) return;

    get().pushHistory();

    const stamp = Date.now();
    const pastedElements = clipboard.map((el, idx) => ({
      ...el,
      id: `paste-${el.id}-${stamp}-${idx}`,
      x: el.x + 20,
      y: el.y + 20,
      zIndex: (catalog.pages[currentPageIndex]?.elements.length || 0) + idx,
      groupId: undefined
    }));

    const newPages = [...catalog.pages];
    if (newPages[currentPageIndex]) {
      newPages[currentPageIndex] = {
        ...newPages[currentPageIndex],
        elements: [...newPages[currentPageIndex].elements, ...pastedElements]
      };

      set({
        catalog: { ...catalog, pages: newPages, updatedAt: new Date().toISOString() },
        selectedElementIds: pastedElements.map(el => el.id)
      });
    }
  },

  checkAuth: async () => {
    try {
      const user: any = await authApi.user();

      const isStaff = user.is_staff || user.is_superuser;

      const userObj: User = {
        id: user.id,
        name: user.name || 'User',
        email: user.email,
        role: isStaff ? 'admin' : 'user',
        status: 'active',
        joinedAt: new Date().toISOString(),
        businessId: user.business_id,
        businessName: user.business_name
      };

      if (isStaff) {
        set({
          isAdminAuthenticated: true,
          isAuthenticated: true,
          user: userObj
        });
        get().fetchProducts();
        get().fetchCategories();
        get().fetchUsers();
        get().fetchCatalogs();
        get().fetchMedia();
        get().fetchAdminAssets();
        get().fetchSystemTemplates();
      } else {
        set({
          isAuthenticated: true,
          isAdminAuthenticated: false,
          user: userObj
        });
        get().fetchProducts();
        get().fetchCategories();
        get().fetchCatalogs();
        get().fetchMedia();
        get().fetchSystemTemplates();
      }

    } catch (error) {
      sessionStorage.removeItem('cs_session');
      localStorage.removeItem('cs_access_token');
      localStorage.removeItem('cs_refresh_token');
      set({ isAuthenticated: false, isAdminAuthenticated: false, user: null });
    }
  }
}));
