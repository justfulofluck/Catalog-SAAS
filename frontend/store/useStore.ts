
import { create } from 'zustand';
import { authApi } from '../client';
import { Product, Category, Catalog, CanvasElement, CatalogPage, MediaItem, MediaType, FullCatalogTemplate, PageType, GridTemplate, Theme, PageTemplate, PaginationStyle, LogoStyle, BusinessTemplate, FormField } from '../types';
import { INITIAL_PRODUCTS, PAGE_WIDTH, PAGE_HEIGHT, THEMES, COVER_TEMPLATES, GRID_TEMPLATES, HEADER_FOOTER_HEIGHT, FULL_CATALOG_TEMPLATES, INDEX_TEMPLATES, CLOSING_TEMPLATES } from '../constants';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin';
  status: 'active' | 'suspended';
  joinedAt: string;
  businessId?: string; // Links user to a specific business template/instance
  businessName?: string;
  subscription_plan?: string;
  subscription_end_date?: string;
  subscription_features?: any;
}

type View = 'dashboard' | 'products-list' | 'create-product' | 'edit-product' | 'settings' | 'category-list' | 'create-category' | 'edit-category' | 'media-library' | 'editor' | 'catalog-setup' | 'catalog-products' | 'your-work' | 'publish' | 'public-viewer' | 'admin-login' | 'admin-dashboard' | 'business-selection' | 'business-onboarding' | 'pricing';

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
  plans: any[];
  allSubscriptions: any[];
  mediaItems: MediaItem[];
  activeCategoryId: string | null;
  editingProductId: string | null;
  editingCategoryId: string | null;

  registeredUsers: User[];

  // Business / Admin State
  businessTemplates: BusinessTemplate[];
  selectedBusinessTemplateId: string | null;

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
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setView: (view: View) => void;
  setSidebarExpanded: (expanded: boolean) => void;
  setActiveTool: (tool: 'select' | 'hand' | 'text' | 'shape') => void;
  setShouldRenderOutlines: (shouldRender: boolean) => void;
  toggleUiTheme: () => void;
  // Scene Tree (Layers)
  isSceneTreeOpen: boolean;
  setIsSceneTreeOpen: (isOpen: boolean) => void;
  toggleLockElement: (elementId: string) => void;
  toggleVisibilityElement: (elementId: string) => void;
  reorderElements: (pageIndex: number, newOrderIds: string[]) => void;
  setSelectedElements: (ids: string[]) => void;
  setDefaultCurrency: (currency: string) => void;

  updateUser: (updates: Partial<User>) => void;

  // Subscription Actions
  fetchPlans: () => Promise<void>;
  updateSubscription: (planSlug: string) => Promise<{ success: boolean; message: string }>;
  fetchAllSubscriptions: () => Promise<void>;

  // Business Actions
  fetchUsers: () => Promise<void>;
  fetchBusinessTemplates: () => Promise<void>;
  addBusinessTemplate: (template: BusinessTemplate) => Promise<void>;
  updateBusinessTemplate: (id: string, updates: Partial<BusinessTemplate>) => Promise<void>;
  selectBusinessTemplate: (id: string | null) => void;
  completeOnboarding: (businessId: string, businessName: string) => void;

  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  removeProduct: (id: string) => void;
  reorderProducts: (newOrderIds: string[]) => void;

  addCategory: (category: Category) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  removeCategory: (id: string) => void;

  addMedia: (item: MediaItem) => void;
  removeMedia: (id: string) => void;
  removeMediaBatch: (ids: string[]) => void;

  setActiveCategoryId: (id: string | null) => void;
  setSelectedCategoryId: (id: string | null) => void;
  setSelectedPageIndex: (index: number | null) => void;
  setEditingProductId: (id: string | null) => void;
  setEditingCategoryId: (id: string | null) => void;

  setSelectedElementIds: (ids: string[]) => void;
  setHoveredElementId: (id: string | null) => void;
  setIsPropertyPanelOpen: (isOpen: boolean) => void;
  setCurrentPageIndex: (index: number) => void;
  setZoom: (zoom: number) => void;
  setCatalogSetupName: (name: string) => void;
  setDraggingItem: (item: { url: string; productId?: string; name: string } | null) => void;
  updateCatalog: (updates: Partial<Catalog>) => void;
  activeTool: 'select' | 'hand' | 'text' | 'shape';
  // setActiveTool: (tool: 'select' | 'hand') => void; // This line is replaced by the new one above

  setGuides: (guides: { orientation: 'H' | 'V'; position: number }[]) => void;
  setDragPosition: (pos: { x: number; y: number } | null) => void;

  editorTab: 'pages' | 'products' | 'media' | 'templates' | 'layers' | 'effects' | 'components' | 'buttons' | 'stock' | null;
  setEditorTab: (tab: 'pages' | 'products' | 'media' | 'templates' | 'layers' | 'effects' | 'components' | 'buttons' | 'stock' | null) => void;

  renameCatalog: (newName: string) => void;
  updateCatalogCategories: (categoryIds: string[]) => void;
  setCatalogBackgroundColor: (color: string) => void;

  applyTheme: (themeId: string) => void;
  applyFullCatalogTemplate: (templateId: string) => void;
  setCatalogGlobalText: (header?: string, footer?: string) => void;
  updateCatalogVisuals: (updates: Partial<Catalog>) => void;

  saveCatalog: () => void;
  loadCatalog: (id: string) => void;
  deleteCatalog: (id: string) => void;
  updateSavedCatalog: (id: string, updates: Partial<Catalog>) => void;
  publishCatalog: (id: string) => void;
  openPublicViewer: (id: string) => void;

  addElement: (pageIndex: number, element: CanvasElement) => void;
  updateElement: (pageIndex: number, elementId: string, updates: Partial<CanvasElement>) => void;
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

  toggleCatalogProduct: (productId: string) => void;
  removeProductFromCanvas: (productId: string) => void;
  removeProductFromPage: (pageIndex: number, productId: string) => void;
  generateCatalogFromTemplate: (
    name: string,
    template: GridTemplate,
    categoryIds: string[],
    options?: { includeCover: boolean; includeIndex: boolean; includeCategoryCovers: boolean }
  ) => void;
  applyCoverTemplate: (pageIndex: number | null, template: PageTemplate) => void;
  applyIndexTemplate: (pageIndex: number | null, template: PageTemplate) => void;
  applyClosingTemplate: (pageIndex: number | null, template: PageTemplate) => void;
  applyInventoryLayout: (pageIndex: number | null, template: GridTemplate) => void;

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
}

const INITIAL_MEDIA: MediaItem[] = [
  {
    id: 'm1',
    name: 'Modern Interior Hero',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800',
    thumbnailUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=200',
    size: '1.2 MB',
    dimensions: '1920x1080',
    createdAt: new Date().toISOString()
  }
];

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
  uiTheme: 'light',
  shouldRenderOutlines: true,
  defaultCurrency: '$',
  isLoading: false,
  error: null,

  products: INITIAL_PRODUCTS.map((p, idx) => ({
    ...p,
    categoryId: idx % 2 === 0 ? 'cat1' : (idx % 3 === 0 ? 'cat2' : 'cat3')
  })),
  categories: [
    { id: 'cat1', name: 'Furniture', productCount: 3, color: '#337ab7', rank: 1, description: 'Premium modern and nordic furniture.' },
    { id: 'cat2', name: 'Lighting', productCount: 2, color: '#38bdf8', rank: 2, description: 'Designer lamps and lighting solutions.' },
    { id: 'cat3', name: 'Accessories', productCount: 1, color: '#10b981', rank: 3, description: 'Handcrafted home decor and accessories.' }
  ],
  mediaItems: INITIAL_MEDIA,
  registeredUsers: [],
  plans: [],
  allSubscriptions: [],

  businessTemplates: [
    {
      id: 'tech-nova',
      name: 'TechNova Electronics',
      description: 'Specialized template for consumer electronics retail with technical specification support.',
      schema: TECHNOVA_SCHEMA
    }
  ],
  selectedBusinessTemplateId: null,

  activeCategoryId: null,
  editingProductId: null,
  editingCategoryId: null,

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
    headerTextAlignment: 'left',
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
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 0,
    marginColor: '#4f46e5',
    pageNumberAlignment: 'right',
    headerElements: [],
    footerElements: []
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
  catalogSetupName: '',
  draggingItem: null,
  editorTab: 'products',
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

    // Calculate old and new safe boundaries for shifting
    // Y Axis: Margins + Header
    const oldSafeY1 = (oldCatalog.marginTop || 0) + (oldCatalog.hasHeader ? (oldCatalog.headerHeight || 0) : 0);
    const newSafeY1 = (newCatalog.marginTop || 0) + (newCatalog.hasHeader ? (newCatalog.headerHeight || 0) : 0);
    const deltaY = newSafeY1 - oldSafeY1;

    // X Axis: Left Margin
    const oldSafeX1 = oldCatalog.marginLeft || 0;
    const newSafeX1 = newCatalog.marginLeft || 0;
    const deltaX = newSafeX1 - oldSafeX1;

    // Right Margin (Shifting only if pushed)
    const oldMarginRight = oldCatalog.marginRight || 0;
    const newMarginRight = newCatalog.marginRight || 0;
    // Effectively, the "max X" for content decreases as marginRight increases.
    // If an element's (x + width) > (PAGE_WIDTH - newMarginRight), we shift it left.

    const pageWidth = PAGE_WIDTH;

    // Bottom Margin (Shifting only if pushed)
    const oldMarginBottom = oldCatalog.marginBottom || 0;
    const newMarginBottomCalc = newCatalog.marginBottom || 0;

    const pageHeight = PAGE_HEIGHT;

    // If any safe area boundary shifted, we move all elements to facilitate
    if (deltaY !== 0 || deltaX !== 0 || newMarginRight !== oldMarginRight || newMarginBottomCalc !== oldMarginBottom) {
      const updatedPages = oldCatalog.pages.map(page => ({
        ...page,
        elements: page.elements.map(el => {
          let newX = el.x + deltaX;
          let newY = el.y + deltaY;

          // Check Right Margin Constraint
          const rightBoundary = pageWidth - newMarginRight;
          if (newX + el.width > rightBoundary) {
            // Shift left to fit, but respect left margin
            newX = Math.max(newSafeX1, rightBoundary - el.width);
          }

          // Check Bottom Margin Constraint
          // Safe bottom = PAGE_HEIGHT - marginBottom - footerHeight (if footer exists)
          // But here we might just care about margin for now, or the total safe area?
          // The user specifically mentioned "bottom margin".
          // Let's calculate the effective bottom safe line.
          const effectiveFooterHeight = newCatalog.hasFooter ? (newCatalog.footerHeight || 0) : 0;
          const bottomBoundary = pageHeight - newMarginBottomCalc - effectiveFooterHeight;

          if (newY + el.height > bottomBoundary) {
            // Shift up to fit, but respect top margin/header (newSafeY1)
            newY = Math.max(newSafeY1, bottomBoundary - el.height);
          }

          return {
            ...el,
            x: newX,
            y: newY
          };
        })
      }));
      return {
        catalog: { ...newCatalog, pages: updatedPages, updatedAt: new Date().toISOString() }
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
    try {
      const response = await authApi.login({ email, username, password });

      // 2. Fetch User Details
      const userData: any = await authApi.user();
      // const userData = userResponse.data; // Removed redundant unwrapping

      // 3. Enforce Customer Role (Staff cannot log in here)
      if (userData.is_staff) {
        await authApi.logout();
        set({ isLoading: false, error: 'Administrators must use the Admin Login portal.' });
        return;
      }

      // 4. Set State
      const userObj: User = {
        id: userData.id || `u-${Date.now()}`,
        name: userData.name || 'User',
        email: userData.email,
        role: 'user',
        status: 'active',
        joinedAt: new Date().toISOString(),
        businessId: userData.business_id, // synced from serializer
        businessName: userData.business_name
      };

      set({
        isAuthenticated: true,
        user: userObj,
        currentView: userObj.businessId ? 'dashboard' : 'business-selection',
        isLoading: false
      });

      // Fetch templates on login
      get().fetchBusinessTemplates();
      // Fetch users for admin dashboard
      get().fetchUsers();
    } catch (error: any) {
      const errorMessage = error.response?.data?.non_field_errors?.[0] || 'Login failed';
      if (errorMessage.includes('Unable to log in with provided credentials')) {
        set({ error: 'Invalid email or password. New here? Create an account.', isLoading: false });
      } else {
        set({ error: errorMessage, isLoading: false });
      }
    }
  },

  adminLogin: async (email, username, password) => {
    set({ isLoading: true, error: null });
    try {
      // 1. Authenticate
      const payload: any = { password: password || 'admin123' };
      if (email) payload.email = email;
      if (username) payload.username = username;

      await authApi.login(payload);

      // 2. Fetch User
      const user = await authApi.user();
      console.log("Admin Login User Check:", user);
      console.log("Is Staff:", (user as any).is_staff, "Is Superuser:", (user as any).is_superuser);

      // 3. Enforce Admin Role
      if (!(user as any).is_staff && !(user as any).is_superuser) {
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
        isLoading: false
      });

      // Fetch data for admin
      get().fetchBusinessTemplates();
      get().fetchUsers();

    } catch (error: any) {
      set({ error: error.response?.data?.non_field_errors?.[0] || 'Admin login failed', isLoading: false });
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch (e) { console.error(e); }

    set({
      isAuthenticated: false,
      isAdminAuthenticated: false,
      user: null,
      currentView: 'dashboard' // Will trigger Login due to !isAuthenticated check in App
    });
  },

  setView: (view) => set({ currentView: view }),
  setSidebarExpanded: (expanded) => set({ isSidebarExpanded: expanded }),

  // UI State & Tools
  toggleUiTheme: () => set((state) => ({ uiTheme: state.uiTheme === 'light' ? 'dark' : 'light' })),
  setShouldRenderOutlines: (shouldRender) => set({ shouldRenderOutlines: shouldRender }),

  // Scene Tree (Layers)
  isSceneTreeOpen: false,
  setIsSceneTreeOpen: (isOpen) => set({ isSceneTreeOpen: isOpen }),
  setSelectedElements: (ids) => set({ selectedElementIds: ids }),

  toggleLockElement: (elementId) => set((state) => {
    const pages = [...state.catalog.pages];
    const pageIndex = state.currentPageIndex;
    const page = { ...pages[pageIndex] };
    const elements = page.elements.map(el => {
      if (el.id === elementId) {
        return { ...el, locked: !el.locked };
      }
      return el;
    });
    page.elements = elements;
    pages[pageIndex] = page;
    return { catalog: { ...state.catalog, pages } };
  }),

  toggleVisibilityElement: (elementId) => set((state) => {
    const pages = [...state.catalog.pages];
    const pageIndex = state.currentPageIndex;
    const page = { ...pages[pageIndex] };
    const elements = page.elements.map(el => {
      if (el.id === elementId) {
        // Default to true if undefined, toggle to false
        const isVisible = el.visible !== false;
        return { ...el, visible: !isVisible };
      }
      return el;
    });
    page.elements = elements;
    pages[pageIndex] = page;
    return { catalog: { ...state.catalog, pages } };
  }),

  reorderElements: (pageIndex, newOrderIds) => set((state) => {
    const pages = [...state.catalog.pages];
    const page = { ...pages[pageIndex] };

    // Create map for O(1) lookup
    const elementMap = new Map(page.elements.map(el => [el.id, el]));

    // Reconstruct array based on new order IDs, filtering out any missing IDs
    const newElements = newOrderIds
      .map(id => elementMap.get(id))
      .filter((el): el is CanvasElement => !!el);

    // Append any elements that might have been missed (robustness)
    const processedIds = new Set(newOrderIds);
    page.elements.forEach(el => {
      if (!processedIds.has(el.id)) {
        newElements.push(el);
      }
    });

    // Update their zIndex property to match array index (optional but good for consistency)
    const elementsWithZIndex = newElements.map((el, index) => ({
      ...el,
      zIndex: index
    }));

    page.elements = elementsWithZIndex;
    pages[pageIndex] = page;

    return { catalog: { ...state.catalog, pages } };
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
    }
  },

  // Business Logic
  fetchUsers: async () => {
    try {
      const response = await authApi.getAllUsers();
      set({ registeredUsers: response.data || [] });
    } catch (error) {
      console.error("Failed to fetch users", error);
    }
  },

  fetchBusinessTemplates: async () => {
    try {
      const response = await import('../client').then(m => m.businessTemplatesApi.getAll());
      set(state => ({
        // Ensure we fallback to empty list if undefined
        businessTemplates: response.data || []
      }));
    } catch (error) {
      console.error("Failed to fetch business templates", error);
    }
  },

  addBusinessTemplate: async (template) => {
    try {
      const response = await import('../client').then(m => m.businessTemplatesApi.create(template));
      set(state => ({
        businessTemplates: [...state.businessTemplates, response.data]
      }));
    } catch (error) {
      console.error("Failed to create business template", error);
    }
  },

  updateBusinessTemplate: async (id, updates) => {
    try {
      const response = await import('../client').then(m => m.businessTemplatesApi.update(id, updates));
      set(state => ({
        businessTemplates: state.businessTemplates.map(b => b.id === id ? response.data : b)
      }));
    } catch (error) {
      console.error("Failed to update business template", error);
    }
  },

  selectBusinessTemplate: (id) => set({
    selectedBusinessTemplateId: id,
    currentView: id ? 'business-onboarding' : 'business-selection'
  }),

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

  addProduct: (product) => set((state) => ({
    products: [product, ...state.products]
  })),

  updateProduct: (id, updates) => set((state) => {
    const updatedProducts = state.products.map(p => p.id === id ? { ...p, ...updates } : p);

    const updatedPages = state.catalog.pages.map(page => ({
      ...page,
      elements: page.elements.map(el => {
        if (el.productId === id) {
          if (el.type === 'text') {
            if (el.id.includes('txt-n')) return { ...el, text: updates.name || el.text };
            if (el.id.includes('txt-p')) {
              const p = updatedProducts.find(prod => prod.id === id)!;
              return { ...el, text: `${p.currency}${p.price.toFixed(2)}` };
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
  }),

  removeProduct: (id) => set((state) => ({
    products: state.products.filter(p => p.id !== id)
  })),

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

  addCategory: (category) => set((state) => ({
    categories: [...state.categories, category]
  })),

  updateCategory: (id, updates) => set((state) => ({
    categories: state.categories.map(c => c.id === id ? { ...c, ...updates } : c)
  })),

  removeCategory: (id) => set((state) => ({
    categories: state.categories.filter(c => c.id !== id),
    products: state.products.map(p => p.categoryId === id ? { ...p, categoryId: undefined } : p)
  })),

  addMedia: (item) => set((state) => ({
    mediaItems: [item, ...state.mediaItems]
  })),

  removeMedia: (id) => set((state) => ({
    mediaItems: state.mediaItems.filter(m => m.id !== id)
  })),

  removeMediaBatch: (ids) => set((state) => ({
    mediaItems: state.mediaItems.filter(m => !ids.includes(m.id))
  })),

  setActiveCategoryId: (id) => set({ activeCategoryId: id }),
  setSelectedCategoryId: (id) => set({ selectedCategoryId: id }),
  setSelectedPageIndex: (index) => set({ selectedPageIndex: index }),
  setEditingProductId: (id) => set({ editingProductId: id }),
  setEditingCategoryId: (id) => set({ editingCategoryId: id }),

  setSelectedElementIds: (ids) => set((state) => ({
    selectedElementIds: ids,
  })),
  setHoveredElementId: (id) => set({ hoveredElementId: id }),
  setIsPropertyPanelOpen: (isOpen) => set({ isPropertyPanelOpen: isOpen }),
  setCurrentPageIndex: (index) => set({ currentPageIndex: index, selectedPageIndex: index }),
  setZoom: (zoom: number) => set({ zoom }),
  updateCatalog: (updates) => set((state) => ({
    catalog: { ...state.catalog, ...updates, updatedAt: new Date().toISOString() }
  })),

  setActiveTool: (tool) => set({ activeTool: tool }),

  setGuides: (guides) => set({ guides }),
  setDragPosition: (activeDragPosition) => set({ activeDragPosition }),

  setEditorTab: (tab) => set({ editorTab: tab }),
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

  saveCatalog: () => set((state) => {
    const updatedCatalog = { ...state.catalog, updatedAt: new Date().toISOString() };
    const existingIndex = state.savedCatalogs.findIndex(c => c.id === updatedCatalog.id);
    let newSavedCatalogs = [...state.savedCatalogs];

    if (existingIndex >= 0) {
      newSavedCatalogs[existingIndex] = updatedCatalog;
    } else {
      newSavedCatalogs = [updatedCatalog, ...newSavedCatalogs];
    }

    return {
      catalog: updatedCatalog,
      savedCatalogs: newSavedCatalogs
    };
  }),

  loadCatalog: (id) => set((state) => {
    const catalogToLoad = state.savedCatalogs.find(c => c.id === id);
    if (catalogToLoad) {
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

  deleteCatalog: (id) => set((state) => ({
    savedCatalogs: state.savedCatalogs.filter(c => c.id !== id)
  })),

  updateSavedCatalog: (id, updates) => set((state) => ({
    savedCatalogs: state.savedCatalogs.map(c => c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c)
  })),

  publishCatalog: (id) => set((state) => ({
    savedCatalogs: state.savedCatalogs.map(c => c.id === id ? { ...c, status: 'published', updatedAt: new Date().toISOString() } : c)
  })),

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
      newPages[pageIndex].elements = [...newPages[pageIndex].elements, element];
      return {
        catalog: { ...state.catalog, pages: newPages, updatedAt: new Date().toISOString() },
        selectedElementIds: [element.id],
        isPropertyPanelOpen: true
      };
    });
  },

  updateElement: (pageIndex, elementId, updates) => set((state) => {
    const newPages = [...state.catalog.pages];
    const page = newPages[pageIndex];
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

  addPage: (type: PageType = 'interior') => set((state) => {
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
  }),

  addInteriorPageWithInheritedLayout: () => set((state) => {
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
      orientation: lastInteriorPage?.orientation || 'portrait'
    };
    return {
      catalog: { ...state.catalog, pages: [...state.catalog.pages, newPage], updatedAt: new Date().toISOString() },
      currentPageIndex: state.catalog.pages.length
    };
  }),

  removePage: (index) => set((state) => {
    if (state.catalog.pages.length <= 1) return state;
    const newPages = state.catalog.pages.filter((_, i) => i !== index);
    return {
      catalog: { ...state.catalog, pages: newPages, updatedAt: new Date().toISOString() },
      currentPageIndex: Math.max(0, index - 1)
    };
  }),

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

  generateCatalogFromTemplate: (name, template, categoryIds, options = { includeCover: true, includeIndex: true, includeCategoryCovers: true }) => set((state) => {
    const theme = THEMES.find(t => t.id === state.activeThemeId) || THEMES[0];

    const allPages: CatalogPage[] = [];
    let currentPageNumber = 1;

    // 1. Global Cover Page
    if (options.includeCover) {
      const coverTemplate = COVER_TEMPLATES[0];
      const globalCoverElements = coverTemplate.elements.map((el, idx) => {
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
      const availableWidth = PAGE_WIDTH - (padding * 2);
      const availableHeight = PAGE_HEIGHT - (padding * 2) - headerH - footerH - marginTop - marginBottom;
      const slotWidth = (availableWidth - (template.cols - 1) * spacing) / template.cols;
      const slotHeight = (availableHeight - (template.rows - 1) * spacing) / template.rows;

      productsForPage.forEach((product, index) => {
        const col = index % template.cols;
        const row = Math.floor(index / template.cols);
        const x = padding + col * (slotWidth + spacing);
        const y = headerH + marginTop + padding + row * (slotHeight + spacing);

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
            id: `sec-bg-${categoryId}-${Date.now()}`,
            type: 'shape',
            x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT,
            fill: category?.color || theme.backgroundColor,
            opacity: 0.1,
            zIndex: 0,
            rotation: 0
          },
          {
            id: `sec-title-${categoryId}-${Date.now()}`,
            type: 'text',
            x: 40, y: (PAGE_HEIGHT + headerH - footerH) / 2 - 40, width: PAGE_WIDTH - 80, height: 80,
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
          type: 'interior',
          categoryId: categoryId
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
          type: 'interior',
          categoryId: categoryId
        });
        contentPageCounter++;
      }
    });

    // Generate and Insert Index Page if enabled
    if (options.includeIndex) {
      const indexElements: CanvasElement[] = [
        {
          id: `idx-bg-${Date.now()}`,
          type: 'shape',
          x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT,
          fill: theme.backgroundColor,
          zIndex: 0, rotation: 0, opacity: 1
        },
        {
          id: `idx-title-${Date.now()}`,
          type: 'text',
          x: 60, y: headerH + marginTop + 40, width: PAGE_WIDTH - 120, height: 60,
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
          x: 60, y: headerH + marginTop + 115, width: 100, height: 8,
          fill: theme.accentColor,
          zIndex: 1, rotation: 0, opacity: 1
        }
      ];

      let currentY = headerH + marginTop + 210;
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
        type: 'index'
      };

      // Insert Index Page
      const insertIndex = options.includeCover ? 1 : 0;
      allPages.splice(insertIndex, 0, indexPage);
    }

    const allCategoryProducts = state.products.filter(p => p.categoryId && categoryIds.includes(p.categoryId));

    return {
      catalog: {
        id: `cat-${Date.now()}`,
        name,
        status: 'draft',
        pages: allPages,
        hasHeader: curCatalog.hasHeader,
        hasFooter: curCatalog.hasFooter,
        headerHeight: curCatalog.headerHeight || 38,
        footerHeight: curCatalog.footerHeight || 38,
        headerElements: curCatalog.headerElements || [],
        footerElements: curCatalog.footerElements || [],
        marginTop: curCatalog.marginTop || 0,
        marginBottom: curCatalog.marginBottom || 0,
        marginLeft: curCatalog.marginLeft || 0,
        marginRight: curCatalog.marginRight || 0,
        marginColor: curCatalog.marginColor || '#6366f1',
        headerColor: curCatalog.headerColor || '#475569',
        footerColor: curCatalog.footerColor || '#64748b',
        headerFontSize: curCatalog.headerFontSize || 12,
        headerFontFamily: curCatalog.headerFontFamily || 'Inter',
        footerFontSize: curCatalog.footerFontSize || 10,
        footerFontFamily: curCatalog.footerFontFamily || 'Inter',
        headerTextAlignment: curCatalog.headerTextAlignment || 'left',
        footerTextAlignment: curCatalog.footerTextAlignment || 'left',
        headerText: curCatalog.headerText || 'Company Catalog 2025',
        footerText: curCatalog.footerText || 'Proprietary & Confidential',
        updatedAt: new Date().toISOString(),
        productIds: allCategoryProducts.map(p => p.id),
        selectedCategoryIds: categoryIds,
        backgroundColor: template.backgroundColor || theme.backgroundColor,
        paginationStyle: curCatalog.paginationStyle || 'simple',
        logoStyle: curCatalog.logoStyle || 'text',
        headerLogoAlignment: curCatalog.headerLogoAlignment || 'left',
        showCategoryTitleInHeader: curCatalog.showCategoryTitleInHeader ?? true,
        headerSideMargin: curCatalog.headerSideMargin || 40,
        footerSideMargin: curCatalog.footerSideMargin || 40,
        headerLogoHeight: curCatalog.headerLogoHeight || 24,
      },
      currentView: 'editor',
      currentPageIndex: 0,
      activeThemeId: state.activeThemeId
    };
  }),

  applyCoverTemplate: (pageIndex, template) => {
    get().pushHistory();
    set((state) => {
      const theme = THEMES.find(t => t.id === state.activeThemeId) || THEMES[0];
      const newPages = [...state.catalog.pages];

      const applyToPage = (idx: number) => {
        const themedElements = template.elements.map((el, eIdx) => {
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
        newPages[idx] = { ...newPages[idx], elements: themedElements as CanvasElement[], type: 'cover' };
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
        const themedElements = template.elements.map((el, eIdx) => {
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
        newPages[idx] = { ...newPages[idx], elements: themedElements as CanvasElement[], type: 'index' };
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
        const themedElements = template.elements.map((el, eIdx) => {
          const id = `closing-el-${Date.now()}-${idx}-${eIdx}`;
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
        newPages[idx] = { ...newPages[idx], elements: themedElements as CanvasElement[], type: 'closing' };
      };

      if (pageIndex === null) {
        newPages.forEach((p, i) => { if (p.type === 'closing') applyToPage(i); });
      } else {
        applyToPage(pageIndex);
      }

      return { catalog: { ...state.catalog, pages: newPages, updatedAt: new Date().toISOString() }, selectedElementIds: [] };
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

      // 1. Determine categories to process
      // If pageIndex is null, we apply to ALL interior pages, grouping by their existing categoryIds
      const pagesToProcess = pageIndex === null
        ? state.catalog.pages.filter(p => p.type === 'interior')
        : [state.catalog.pages[pageIndex]];

      const categoryIdsToProcess = Array.from(new Set(pagesToProcess.map(p => {
        if (p.categoryId) return p.categoryId;
        // Infer if missing
        const firstProd = p.elements.find(el => el.productId);
        if (firstProd?.productId) return state.products.find(prod => prod.id === firstProd.productId)?.categoryId;
        return null;
      }).filter(Boolean))) as string[];

      if (categoryIdsToProcess.length === 0) categoryIdsToProcess.push(state.catalog.selectedCategoryIds?.[0] || 'cat1');

      categoryIdsToProcess.forEach(targetCategoryId => {
        // 2. Gather all products for this category
        const catProducts = state.products.filter(p => p.categoryId === targetCategoryId);
        const itemsPerPage = template.cols * template.rows;

        // 3. Helper: generate elements for one page-worth of products
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

          const headerH = HEADER_FOOTER_HEIGHT;
          const padding = template.padding;
          const spacing = template.spacing;
          const slotWidth = (PAGE_WIDTH - (padding * 2) - (template.cols - 1) * spacing) / template.cols;
          const slotHeight = (PAGE_HEIGHT - (padding * 2) - (HEADER_FOOTER_HEIGHT * 2) - (template.rows - 1) * spacing) / template.rows;

          chunk.forEach((product, index) => {
            const col = index % template.cols;
            const row = Math.floor(index / template.cols);
            const x = padding + col * (slotWidth + spacing);
            const y = headerH + padding + row * (slotHeight + spacing);

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

        // 4. Find where this category's pages are
        const categoryPageIndices: number[] = [];
        currentCatalogPages.forEach((p, i) => {
          if (p.categoryId === targetCategoryId) categoryPageIndices.push(i);
        });

        // Ensure we have at least one page index to replace
        if (categoryPageIndices.length === 0 && pageIndex !== null) {
          categoryPageIndices.push(pageIndex);
        }

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
              type: 'interior' as PageType,
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
        // Keep current page if it still exists or reset to safe
        currentPageIndex: pageIndex === null ? state.currentPageIndex : Math.min(pageIndex, renumberedPages.length - 1),
        selectedElementIds: []
      };
    });
  },

  groupSelected: (pageIndex) => set((state) => {
    const { selectedElementIds, catalog } = state;
    if (selectedElementIds.length < 2) return state;
    get().pushHistory();
    const newPages = [...catalog.pages];
    const page = newPages[pageIndex];
    const newGroupId = `group-${Date.now()}`;
    page.elements = page.elements.map(el => selectedElementIds.includes(el.id) ? { ...el, groupId: newGroupId } : el);
    return { catalog: { ...catalog, pages: newPages, updatedAt: new Date().toISOString() } };
  }),

  ungroupSelected: (pageIndex) => set((state) => {
    const { selectedElementIds, catalog } = state;
    if (selectedElementIds.length === 0) return state;
    get().pushHistory();
    const newPages = [...catalog.pages];
    const page = newPages[pageIndex];
    const groupsToDissolve = new Set(page.elements.filter(el => selectedElementIds.includes(el.id) && el.groupId).map(el => el.groupId!));
    if (groupsToDissolve.size === 0) return state;
    page.elements = page.elements.map(el => (el.groupId && groupsToDissolve.has(el.groupId)) ? { ...el, groupId: undefined } : el);
    return { catalog: { ...catalog, pages: newPages, updatedAt: new Date().toISOString() } };
  }),

  // Master Actions Implementation
  addHeaderElement: (element) => set((state) => ({
    catalog: {
      ...state.catalog,
      headerElements: [...state.catalog.headerElements, element],
      updatedAt: new Date().toISOString()
    }
  })),

  addFooterElement: (element) => set((state) => ({
    catalog: {
      ...state.catalog,
      footerElements: [...state.catalog.footerElements, element],
      updatedAt: new Date().toISOString()
    }
  })),

  updateHeaderElement: (elementId, updates) => set((state) => ({
    catalog: {
      ...state.catalog,
      headerElements: state.catalog.headerElements.map(el => el.id === elementId ? { ...el, ...updates } : el),
      updatedAt: new Date().toISOString()
    }
  })),

  updateFooterElement: (elementId, updates) => set((state) => ({
    catalog: {
      ...state.catalog,
      footerElements: state.catalog.footerElements.map(el => el.id === elementId ? { ...el, ...updates } : el),
      updatedAt: new Date().toISOString()
    }
  })),

  removeHeaderElement: (elementId) => set((state) => ({
    catalog: {
      ...state.catalog,
      headerElements: state.catalog.headerElements.filter(el => el.id !== elementId),
      updatedAt: new Date().toISOString()
    }
  })),

  removeFooterElement: (elementId) => set((state) => ({
    catalog: {
      ...state.catalog,
      footerElements: state.catalog.footerElements.filter(el => el.id !== elementId),
      updatedAt: new Date().toISOString()
    }
  })),

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
          isAuthenticated: false,
          user: userObj,
          currentView: 'admin-dashboard'
        });
        get().fetchUsers();
      } else {
        set({
          isAuthenticated: true,
          isAdminAuthenticated: false,
          user: userObj,
          currentView: userObj.businessId ? 'dashboard' : 'business-selection'
        });
      }

    } catch (error) {
      console.log("Not authenticated", error);
      set({ isAuthenticated: false, isAdminAuthenticated: false, user: null });
    }
  }
}));
