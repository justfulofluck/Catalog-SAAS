
import { create } from 'zustand';
import { Product, Category, Catalog, CanvasElement, CatalogPage, MediaItem, MediaType, FullCatalogTemplate, PageType, GridTemplate, Theme, PageTemplate, PaginationStyle, LogoStyle } from '../types';
import { INITIAL_PRODUCTS, PAGE_WIDTH, PAGE_HEIGHT, THEMES, COVER_TEMPLATES, GRID_TEMPLATES, HEADER_FOOTER_HEIGHT, FULL_CATALOG_TEMPLATES, INDEX_TEMPLATES, CLOSING_TEMPLATES } from '../constants';

interface User {
  name: string;
  email: string;
  avatar?: string;
}

type View = 'dashboard' | 'products-list' | 'create-product' | 'edit-product' | 'settings' | 'category-list' | 'create-category' | 'edit-category' | 'media-library' | 'editor' | 'catalog-setup' | 'catalog-products' | 'your-work' | 'publish' | 'public-viewer';

interface State {
  user: User | null;
  isAuthenticated: boolean;
  currentView: View;
  isSidebarExpanded: boolean;
  uiTheme: 'light' | 'dark';
  defaultCurrency: string;

  products: Product[];
  categories: Category[];
  mediaItems: MediaItem[];
  activeCategoryId: string | null;
  editingProductId: string | null;
  editingCategoryId: string | null;

  catalog: Catalog;
  savedCatalogs: Catalog[];
  activeThemeId: string;
  currentPageIndex: number;
  zoom: number;
  selectedElementIds: string[];
  hoveredElementId: string | null;
  isPropertyPanelOpen: boolean;
  catalogSetupName: string;

  // New state for public viewer
  viewingCatalogId: string | null;

  draggingItem: { url: string; productId?: string; name: string } | null;

  undoStack: Catalog[];
  redoStack: Catalog[];

  login: (email: string) => void;
  logout: () => void;
  setView: (view: View) => void;
  setSidebarExpanded: (expanded: boolean) => void;
  toggleUiTheme: () => void;
  setDefaultCurrency: (currency: string) => void;

  updateUser: (updates: Partial<User>) => void;

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
  setEditingProductId: (id: string | null) => void;
  setEditingCategoryId: (id: string | null) => void;

  setSelectedElementIds: (ids: string[]) => void;
  setHoveredElementId: (id: string | null) => void;
  setIsPropertyPanelOpen: (isOpen: boolean) => void;
  setCurrentPageIndex: (index: number) => void;
  setZoom: (zoom: number) => void;
  setCatalogSetupName: (name: string) => void;
  setDraggingItem: (item: { url: string; productId?: string; name: string } | null) => void;

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

  toggleCatalogProduct: (productId: string) => void;
  removeProductFromCanvas: (productId: string) => void;
  removeProductFromPage: (pageIndex: number, productId: string) => void;
  generateCatalogFromTemplate: (
    name: string,
    template: GridTemplate,
    categoryIds: string[],
    options?: { includeCover: boolean; includeIndex: boolean; includeCategoryCovers: boolean }
  ) => void;
  applyCoverTemplate: (pageIndex: number, template: PageTemplate) => void;
  applyIndexTemplate: (pageIndex: number, template: PageTemplate) => void;
  applyClosingTemplate: (pageIndex: number, template: PageTemplate) => void;
  applyInventoryLayout: (pageIndex: number, template: GridTemplate) => void;

  groupSelected: (pageIndex: number) => void;
  ungroupSelected: (pageIndex: number) => void;

  undo: () => void;
  redo: () => void;
  copyToClipboard: () => void;
  pasteFromClipboard: () => void;
  pushHistory: () => void;
  savedColors: string[];
  editorTab: 'products' | 'media' | 'templates' | 'layers' | 'effects';

  // Actions
  setEditorTab: (tab: 'products' | 'media' | 'templates' | 'layers' | 'effects') => void;
  setUser: (user: User | null) => void;
  addSavedColor: (color: string) => void;
  removeSavedColor: (color: string) => void;
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

export const useStore = create<State>((set, get) => ({
  user: null,
  isAuthenticated: false,
  currentView: 'dashboard',
  isSidebarExpanded: true,
  uiTheme: 'light',
  defaultCurrency: '$',

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
    headerHeight: 38,
    headerSideMargin: 40,
    footerHeight: 38,
    footerSideMargin: 40,
    headerFontFamily: 'Inter',
    headerFontSize: 11,
    footerFontFamily: 'Inter',
    footerFontSize: 9,
    headerLogoHeight: 24,
    selectedCategoryIds: []
  },
  savedCatalogs: [], // Initialized empty for new user scenario
  activeThemeId: 'default',
  currentPageIndex: 0,
  zoom: 0.8,
  selectedElementIds: [],
  hoveredElementId: null,
  isPropertyPanelOpen: true,
  catalogSetupName: '',
  draggingItem: null,

  viewingCatalogId: null,

  undoStack: [],
  redoStack: [],
  clipboard: [],
  savedColors: ['#4f46e5', '#0f172a', '#ffffff', '#f1f5f9'], // Default colors
  editorTab: 'products',

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

  login: (email) => set({
    isAuthenticated: true,
    user: { name: 'John Doe', email, avatar: 'JD' },
    currentView: 'dashboard'
  }),

  logout: () => set({
    isAuthenticated: false,
    user: null,
    currentView: 'dashboard'
  }),

  setView: (view) => set({ currentView: view }),
  setEditorTab: (tab) => set({ editorTab: tab }),
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setSidebarExpanded: (expanded) => set({ isSidebarExpanded: expanded }),
  toggleUiTheme: () => set((state) => ({ uiTheme: state.uiTheme === 'light' ? 'dark' : 'light' })),
  setDefaultCurrency: (currency) => set({ defaultCurrency: currency }),

  updateUser: (updates) => set((state) => ({
    user: state.user ? { ...state.user, ...updates } : null
  })),

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
    const remainingProducts = state.products.filter(p => !newOrderIds.includes(p.id));
    const orderedInScope = newOrderIds.map(id => state.products.find(p => p.id === id)!);
    const updatedProducts = [...orderedInScope, ...remainingProducts];
    return { products: updatedProducts };
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
  setEditingProductId: (id) => set({ editingProductId: id }),
  setEditingCategoryId: (id) => set({ editingCategoryId: id }),

  setSelectedElementIds: (ids) => set((state) => ({
    selectedElementIds: ids,
    isPropertyPanelOpen: ids.length > 0 ? true : state.isPropertyPanelOpen
  })),
  setHoveredElementId: (id) => set({ hoveredElementId: id }),
  setIsPropertyPanelOpen: (isOpen) => set({ isPropertyPanelOpen: isOpen }),
  setCurrentPageIndex: (index) => set({ currentPageIndex: index }),
  setZoom: (zoom) => set({ zoom }),
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
    const elements = catalog.pages[pageIndex].elements.filter(el => ids.includes(el.id));

    let target = 0;
    if (type === 'left') target = ids.length === 1 ? 0 : Math.min(...elements.map(e => e.x));
    if (type === 'right') target = ids.length === 1 ? PAGE_WIDTH : Math.max(...elements.map(e => e.x + e.width));
    if (type === 'top') target = ids.length === 1 ? 0 : Math.min(...elements.map(e => e.y));
    if (type === 'bottom') target = ids.length === 1 ? PAGE_HEIGHT : Math.max(...elements.map(e => e.y + e.height));
    if (type === 'center') {
      if (ids.length === 1) {
        target = PAGE_WIDTH / 2;
      } else {
        const minX = Math.min(...elements.map(e => e.x));
        const maxX = Math.max(...elements.map(e => e.x + e.width));
        target = minX + (maxX - minX) / 2;
      }
    }
    if (type === 'middle') {
      if (ids.length === 1) {
        target = PAGE_HEIGHT / 2;
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
      type
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
      categoryId: lastInteriorPage?.categoryId
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

      const headerH = HEADER_FOOTER_HEIGHT;
      const padding = template.padding;
      const spacing = template.spacing;
      const availableWidth = PAGE_WIDTH - (padding * 2);
      const availableHeight = PAGE_HEIGHT - (padding * 2) - (HEADER_FOOTER_HEIGHT * 2);
      const slotWidth = (availableWidth - (template.cols - 1) * spacing) / template.cols;
      const slotHeight = (availableHeight - (template.rows - 1) * spacing) / template.rows;

      productsForPage.forEach((product, index) => {
        const col = index % template.cols;
        const row = Math.floor(index / template.cols);
        const x = padding + col * (slotWidth + spacing);
        const y = headerH + padding + row * (slotHeight + spacing);

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
            x: 40, y: PAGE_HEIGHT / 2 - 40, width: PAGE_WIDTH - 80, height: 80,
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
            x: 40, y: PAGE_HEIGHT / 2 + 50, width: PAGE_WIDTH - 80, height: 40,
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
          x: 60, y: 80, width: PAGE_WIDTH - 120, height: 60,
          text: 'INDEX',
          fontSize: 42,
          fontFamily: theme.headingFont,
          fontWeight: '900',
          fill: theme.headingColor,
          zIndex: 1, rotation: 0, opacity: 1
        },
        {
          id: `idx-line-${Date.now()}`,
          type: 'shape',
          shapeType: 'rect',
          x: 60, y: 150, width: 80, height: 6,
          fill: theme.accentColor,
          zIndex: 1, rotation: 0, opacity: 1
        }
      ];

      let currentY = 220;
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

        indexElements.push({
          id: `idx-entry-line-${i}-${Date.now()}`,
          type: 'shape',
          shapeType: 'rect',
          x: 60, y: currentY + 22, width: PAGE_WIDTH - 120, height: 1,
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

        currentY += 50;
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
        updatedAt: new Date().toISOString(),
        productIds: allCategoryProducts.map(p => p.id),
        selectedCategoryIds: categoryIds,
        backgroundColor: template.backgroundColor || theme.backgroundColor,
        headerText: 'Company Catalog 2025',
        footerText: 'Proprietary & Confidential',
        paginationStyle: 'simple',
        logoStyle: 'text',
        headerLogoAlignment: 'left',
        headerTextAlignment: 'left',
        showCategoryTitleInHeader: true,
        headerHeight: 38,
        headerSideMargin: 40,
        footerHeight: 38,
        footerSideMargin: 40,
        headerFontFamily: 'Inter',
        headerFontSize: 11,
        footerFontFamily: 'Inter',
        footerFontSize: 9,
        headerLogoHeight: 24
      },
      currentView: 'editor',
      currentPageIndex: 0,
      activeThemeId: 'default'
    };
  }),

  applyCoverTemplate: (pageIndex, template) => {
    get().pushHistory();
    set((state) => {
      const theme = THEMES.find(t => t.id === state.activeThemeId) || THEMES[0];
      const newPages = [...state.catalog.pages];
      const themedElements = template.elements.map((el, idx) => {
        const id = `cover-el-${Date.now()}-${idx}`;
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
      newPages[pageIndex] = { ...newPages[pageIndex], elements: themedElements as CanvasElement[], type: 'cover' };
      return { catalog: { ...state.catalog, pages: newPages, updatedAt: new Date().toISOString() }, selectedElementIds: [] };
    });
  },

  applyIndexTemplate: (pageIndex, template) => {
    get().pushHistory();
    set((state) => {
      const theme = THEMES.find(t => t.id === state.activeThemeId) || THEMES[0];
      const newPages = [...state.catalog.pages];
      const themedElements = template.elements.map((el, idx) => {
        const id = `index-el-${Date.now()}-${idx}`;
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
      newPages[pageIndex] = { ...newPages[pageIndex], elements: themedElements as CanvasElement[], type: 'index' };
      return { catalog: { ...state.catalog, pages: newPages, updatedAt: new Date().toISOString() }, selectedElementIds: [] };
    });
  },

  applyClosingTemplate: (pageIndex, template) => {
    get().pushHistory();
    set((state) => {
      const theme = THEMES.find(t => t.id === state.activeThemeId) || THEMES[0];
      const newPages = [...state.catalog.pages];
      const themedElements = template.elements.map((el, idx) => {
        const id = `closing-el-${Date.now()}-${idx}`;
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
      newPages[pageIndex] = { ...newPages[pageIndex], elements: themedElements as CanvasElement[], type: 'closing' };
      return { catalog: { ...state.catalog, pages: newPages, updatedAt: new Date().toISOString() }, selectedElementIds: [] };
    });
  },

  applyInventoryLayout: (pageIndex, template) => {
    get().pushHistory();
    set((state) => {
      // NOTE: For layout application on existing pages, we check if the page is a section grid
      // This part might need refinement for multi-category awareness if we want to "re-flow" products.
      // For now, let's keep it simple: applied to current page using products from *that page's* assigned category if we stored it,
      // or just "selectedCategoryId" if we fallback. 
      // Given the new architecture, applying a layout to a single page is tricky without knowing WHICH products belong there.
      // We will assume the user wants to layout currently available items for the main selected category or the specific items on page.

      // Simpler approach: If "selectedCategoryIds" has content, use the first one, or just warn.
      const catId = state.catalog.selectedCategoryIds?.[0] || 'cat1'; // Fallback

      const catProducts = state.products.filter(p => p.categoryId === catId);
      const productsPerPage = template.cols * template.rows;

      const generateElementsForChunk = (chunk: Product[]) => {
        const gridElements: CanvasElement[] = [];

        if (template.decorations) {
          template.decorations.forEach((dec, idx) => {
            gridElements.push({ ...dec, id: `dec-${Date.now()}-${idx}`, zIndex: dec.zIndex || -1 } as CanvasElement);
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
            id: `product-block-${Date.now()}-${Math.random()}`,
            type: 'product-block',
            x, y, width: slotWidth, height: slotHeight,
            rotation: 0, opacity: 1, productId: product.id, zIndex: 1,
            cardTheme: template.cardTheme || 'classic-stack'
          } as CanvasElement);
        });
        return gridElements;
      };

      const newPages = [...state.catalog.pages];
      const firstChunk = catProducts.slice(0, productsPerPage);
      newPages[pageIndex] = {
        ...newPages[pageIndex],
        elements: generateElementsForChunk(firstChunk),
        type: 'interior' as PageType
      };

      if (catProducts.length > productsPerPage) {
        const remainingProducts = catProducts.slice(productsPerPage);
        for (let i = 0; i < remainingProducts.length; i += productsPerPage) {
          const chunk = remainingProducts.slice(i, i + productsPerPage);
          newPages.splice(pageIndex + 1 + Math.floor(i / productsPerPage), 0, {
            id: `page-auto-${Date.now()}-${i}`,
            pageNumber: 0,
            elements: generateElementsForChunk(chunk),
            type: 'interior' as PageType
          });
        }
      }

      const renumberedPages = newPages.map((p, i) => ({ ...p, pageNumber: i + 1 }));
      return {
        catalog: {
          ...state.catalog,
          pages: renumberedPages,
          updatedAt: new Date().toISOString(),
          backgroundColor: template.backgroundColor || state.catalog.backgroundColor
        },
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

  copyToClipboard: () => set((state) => {
    const selectedElements = state.catalog.pages[state.currentPageIndex].elements.filter(el => state.selectedElementIds.includes(el.id));
    return { clipboard: selectedElements };
  }),

  pasteFromClipboard: () => set((state) => {
    if (state.clipboard.length === 0) return state;
    get().pushHistory();
    const newElements = state.clipboard.map(el => ({
      ...JSON.parse(JSON.stringify(el)),
      id: `el-paste-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      x: el.x + 20,
      y: el.y + 20,
      zIndex: state.catalog.pages[state.currentPageIndex].elements.length + 1
    }));

    const newPages = [...state.catalog.pages];
    newPages[state.currentPageIndex].elements = [...newPages[state.currentPageIndex].elements, ...newElements];

    return {
      catalog: { ...state.catalog, pages: newPages },
      selectedElementIds: newElements.map(el => el.id)
    };
  }),

  addSavedColor: (color) => set((state) => ({
    savedColors: state.savedColors.includes(color) ? state.savedColors : [...state.savedColors, color]
  })),

  removeSavedColor: (color) => set((state) => ({
    savedColors: state.savedColors.filter(c => c !== color)
  })),
}));
