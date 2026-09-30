import { AppSlice, CatalogSlice } from '../types';
import { Catalog, CatalogPage, CanvasElement, PageType } from '../../types';
import { THEMES, COVER_TEMPLATES, INDEX_TEMPLATES, CLOSING_TEMPLATES, FULL_CATALOG_TEMPLATES, PAGE_WIDTH, PAGE_HEIGHT } from '../../constants';

export const INITIAL_CATALOG: Catalog = {
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
  marginTop: 0,
  marginBottom: 0,
  marginLeft: 18.9,
  marginRight: 18.9,
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
    },
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
    },
  ],
  showPrice: true,
  showSKU: true,
  showTitle: true,
  gridCols: 2,
  gridRows: 2,
  gridSpacing: 30,
  gridPadding: 50,
  gridCardTheme: 'classic-stack',
};

export const createCatalogSlice: AppSlice<CatalogSlice> = (set, get) => ({
  catalog: INITIAL_CATALOG,
  savedCatalogs: [],
  activeThemeId: 'default',
  currentPageIndex: 0,
  selectedPageIndex: 0,
  selectedCategoryId: null,
  zoom: 1,
  catalogSetupName: '',
  viewingCatalogId: null,
  publicCatalog: null,

  setCurrentPageIndex: (index) => set({ currentPageIndex: index }),
  setSelectedPageIndex: (index) => set({ selectedPageIndex: index }),
  setZoom: (zoom: number) => set({ zoom }),
  setCatalogSetupName: (name) => set({ catalogSetupName: name }),

  updateCatalog: (updates) =>
    set((state) => ({
      catalog: { ...state.catalog, ...updates, updatedAt: new Date().toISOString() },
    })),

  renameCatalog: (newName) => {
    get().pushHistory();
    set((state) => ({
      catalog: { ...state.catalog, name: newName, updatedAt: new Date().toISOString() },
    }));
  },

  updateCatalogCategories: (categoryIds) =>
    set((state) => ({
      catalog: { ...state.catalog, selectedCategoryIds: categoryIds, updatedAt: new Date().toISOString() },
    })),

  setCatalogBackgroundColor: (color) => {
    get().pushHistory();
    set((state) => ({
      catalog: { ...state.catalog, backgroundColor: color, updatedAt: new Date().toISOString() },
    }));
  },

  updateAllPageBackgrounds: (color) => {
    get().pushHistory();
    set((state) => ({
      catalog: {
        ...state.catalog,
        backgroundColor: color,
        pages: state.catalog.pages.map((p) => ({ ...p, backgroundColor: color })),
        updatedAt: new Date().toISOString(),
      },
    }));
  },

  applyGlobalPageBackground: (color) => {
    get().pushHistory();
    set((state) => ({
      catalog: {
        ...state.catalog,
        backgroundColor: color,
        pages: state.catalog.pages.map((p) => ({ ...p, backgroundColor: color })),
        updatedAt: new Date().toISOString(),
      },
    }));
  },

  applyGlobalProductCardStyle: (updates) => {
    get().pushHistory();
    set((state) => {
      const updatedCatalog = {
        ...state.catalog,
        ...(updates.showTitle !== undefined ? { showTitle: updates.showTitle } : {}),
        ...(updates.showPrice !== undefined ? { showPrice: updates.showPrice } : {}),
        ...(updates.showSKU !== undefined ? { showSKU: updates.showSKU } : {}),
        ...(updates.cardTheme ? { gridCardTheme: updates.cardTheme } : {}),
        ...(updates.fontFamily
          ? {
              fontFamily: updates.fontFamily,
              headerFontFamily: updates.fontFamily,
              footerFontFamily: updates.fontFamily,
            }
          : {}),
        headerElements: (state.catalog.headerElements || []).map((el) =>
          el.type === 'text' && updates.fontFamily ? { ...el, fontFamily: updates.fontFamily } : el
        ),
        footerElements: (state.catalog.footerElements || []).map((el) =>
          el.type === 'text' && updates.fontFamily ? { ...el, fontFamily: updates.fontFamily } : el
        ),
        updatedAt: new Date().toISOString(),
      };

      const updatedPages = state.catalog.pages.map((page) => ({
        ...page,
        elements: page.elements.map((el) => {
          if (el.type === 'product-block') {
            return {
              ...el,
              ...(updates.cardTheme ? { cardTheme: updates.cardTheme } : {}),
              ...(updates.fontFamily ? { fontFamily: updates.fontFamily } : {}),
              ...(updates.fontColor ? { fill: updates.fontColor } : {}),
            };
          }
          if (el.type === 'text' && updates.fontFamily) {
            return {
              ...el,
              fontFamily: updates.fontFamily,
              ...(updates.fontColor ? { fill: updates.fontColor } : {}),
            };
          }
          return el;
        }),
      }));

      if (typeof document !== 'undefined' && document.fonts && updates.fontFamily) {
        document.fonts.load(`16px "${updates.fontFamily}"`).catch(() => {});
      }

      return {
        catalog: {
          ...updatedCatalog,
          pages: updatedPages,
        },
      };
    });
  },

  setCatalogGlobalText: (header, footer) =>
    set((state) => ({
      catalog: {
        ...state.catalog,
        headerText: header !== undefined ? header : state.catalog.headerText,
        footerText: footer !== undefined ? footer : state.catalog.footerText,
      },
    })),

  updateCatalogVisuals: (updates) => {
    get().pushHistory();
    set((state) => ({
      catalog: {
        ...state.catalog,
        ...updates,
        updatedAt: new Date().toISOString(),
      },
    }));
  },

  applyTheme: (themeId) => {
    get().pushHistory();
    set((state) => {
      const theme = THEMES.find((t) => t.id === themeId) || THEMES[0];
      return {
        activeThemeId: themeId,
        catalog: {
          ...state.catalog,
          updatedAt: new Date().toISOString(),
          backgroundColor: theme.backgroundColor,
        },
      };
    });
  },

  saveCatalog: async () => {
    const { catalogsApi } = await import('../../client');
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
        selectedCategoryIds: catalog.selectedCategoryIds || [],
      };

      if (isNew) {
        const response = await catalogsApi.create({
          name: catalog.name || 'Untitled Catalog',
          settings: catalogSettings,
        });
        const data = (response as any).data || response;
        backendId = String(data.id);

        set((state) => ({
          catalog: { ...state.catalog, id: backendId, uuid: data.uuid },
          savedCatalogs: [
            { ...state.catalog, id: backendId, uuid: data.uuid, updatedAt: new Date().toISOString() },
            ...state.savedCatalogs.filter((c) => String(c.id) !== String(catalog.id)),
          ],
        }));
      } else {
        await catalogsApi.update(backendId, {
          name: catalog.name || 'Untitled Catalog',
          settings: catalogSettings,
        });

        set((state) => ({
          savedCatalogs: state.savedCatalogs.map((c) =>
            c.id === backendId ? { ...state.catalog, updatedAt: new Date().toISOString() } : c
          ),
        }));
      }

      for (let i = 0; i < catalog.pages.length; i++) {
        const page = catalog.pages[i];
        const pageNum = page.pageNumber || (page as any).page_number || i + 1;
        try {
          await catalogsApi.savePage(backendId, {
            pageNumber: pageNum,
            type: page.type || 'interior',
            elements: page.elements || [],
            categoryId: page.categoryId,
          });
        } catch (pageErr) {
          console.warn(`Page ${pageNum} save deferred:`, pageErr);
        }
      }

      set({ isLoading: false });
      if (typeof window !== 'undefined') {
        localStorage.setItem('active_catalog_id', backendId);
      }
      return backendId;
    } catch (error: any) {
      console.error('Failed to save catalog', error);
      const errMsg =
        error.response?.data?.detail || error.response?.data?.error || 'Failed to save catalog to server';
      set({ error: errMsg, isLoading: false });
      throw error;
    }
  },

  loadCatalog: (id) =>
    set((state) => {
      const catalogToLoad = state.savedCatalogs.find((c) => String(c.id) === String(id));
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
          redoStack: [],
        };
      }
      return {};
    }),

  deleteCatalog: async (id) => {
    const { catalogsApi } = await import('../../client');
    set((state) => ({
      savedCatalogs: state.savedCatalogs.filter((c) => c.id !== id),
    }));
    try {
      if (!String(id).startsWith('cat-')) {
        await catalogsApi.delete(String(id));
      }
    } catch (e) {
      console.error('Failed to delete catalog from database', e);
    }
  },

  updateSavedCatalog: (id, updates) =>
    set((state) => ({
      savedCatalogs: state.savedCatalogs.map((c) =>
        c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
      ),
    })),

  fetchCatalogs: async () => {
    const { catalogsApi } = await import('../../client');
    try {
      const response: any = await catalogsApi.getAll();
      const rawList = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.results)
        ? response.results
        : [];

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
            pageNumber: p.pageNumber || p.page_number || idx + 1,
            type: p.type || 'interior',
            elements: p.layout_data || p.elements || [],
            categoryId: p.category || p.categoryId,
          })),
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
      console.error('Failed to fetch catalogs', error);
      set({ isLoading: false });
    }
  },

  publishCatalog: async (id) => {
    const { catalogsApi } = await import('../../client');
    const state = get();
    const stringId = String(id);
    let catalog = state.savedCatalogs.find((c) => String(c.id) === stringId);

    if (!catalog && String(state.catalog.id) === stringId) {
      catalog = state.catalog;
    }

    if (!catalog) {
      console.error('Catalog not found locally', {
        id,
        stringId,
        saved: state.savedCatalogs.map((c) => c.id),
      });
      return;
    }

    try {
      let backendId = stringId;

      if (stringId.startsWith('cat-')) {
        const createResponse = await catalogsApi.create({
          name: catalog.name,
          settings: {
            backgroundColor: catalog.backgroundColor,
            headerText: catalog.headerText,
            footerText: catalog.footerText,
            hasHeader: catalog.hasHeader,
            hasFooter: catalog.hasFooter,
          },
        });
        const createdCatalog = (createResponse as any).data || createResponse;
        backendId = String(createdCatalog.id);

        set((state) => ({
          savedCatalogs: state.savedCatalogs.map((c) =>
            String(c.id) === stringId ? { ...c, id: backendId, uuid: createdCatalog.uuid } : c
          ),
          catalog:
            String(state.catalog.id) === stringId
              ? { ...state.catalog, id: backendId, uuid: createdCatalog.uuid }
              : state.catalog,
        }));

        for (const page of catalog.pages) {
          await catalogsApi.savePage(backendId, {
            pageNumber: page.pageNumber,
            type: page.type,
            elements: page.elements,
            categoryId: page.categoryId,
          });
        }
      }

      const response = await catalogsApi.publish(backendId);
      const data = (response as any).data || response;

      set((state) => ({
        savedCatalogs: state.savedCatalogs.map((c) =>
          String(c.id) === backendId
            ? { ...c, status: 'published', uuid: data.uuid, updatedAt: new Date().toISOString() }
            : c
        ),
      }));
      return { id: backendId, uuid: data.uuid };
    } catch (error) {
      console.error('Failed to publish catalog', error);
      set({ error: 'Failed to publish catalog' });
    }
  },

  fetchPublicCatalog: async (uuid) => {
    const { catalogsApi } = await import('../../client');
    set({ isLoading: true, error: null });
    try {
      const response = await catalogsApi.getPublic(uuid);
      const data = (response as any).data || response;
      let settings = data.settings || {};
      if (typeof settings === 'string') {
        try {
          settings = JSON.parse(settings);
        } catch (e) {
          settings = {};
        }
      }
      const mappedPages = (data.pages || []).map((p: any, idx: number) => ({
        ...p,
        id: String(p.id || `p-${idx + 1}`),
        pageNumber: p.pageNumber || p.page_number || idx + 1,
        type: p.type || 'interior',
        elements: p.layout_data || p.elements || [],
        categoryId: p.category || p.categoryId,
      }));
      const mappedCatalog = {
        ...data,
        ...settings,
        id: String(data.id),
        headerElements: data.headerElements || settings.headerElements || [],
        footerElements: data.footerElements || settings.footerElements || [],
        pages: mappedPages,
      };
      set({ publicCatalog: mappedCatalog, viewingCatalogId: uuid, isLoading: false, error: null });
      return mappedCatalog;
    } catch (error) {
      console.error('Failed to fetch public catalog', error);
      set({ publicCatalog: null, error: 'Catalog not found or not published', isLoading: false });
    }
  },

  openPublicViewer: (id) => {
    const state = get();
    const stringId = String(id);
    const existing = state.savedCatalogs.find(
      (c) => String(c.id) === stringId || (c.uuid && String(c.uuid) === stringId)
    );
    const targetUuidOrId = existing?.uuid || stringId;
    if (typeof window !== 'undefined') {
      const targetPath = `/viewer/${targetUuidOrId}`;
      if (window.location.pathname !== targetPath) {
        window.history.pushState({ view: 'public-viewer' }, '', targetPath);
      }
    }
    set({
      currentView: 'public-viewer',
      viewingCatalogId: targetUuidOrId,
      publicCatalog: existing ? JSON.parse(JSON.stringify(existing)) : null,
    });
    if (!existing) {
      get().fetchPublicCatalog(stringId);
    }
  },

  addPage: (type: PageType = 'interior', insertAfterIndex?: number) => {
    get().pushHistory();
    set((state) => {
      const theme = THEMES.find((t) => t.id === state.activeThemeId) || THEMES[0];
      const elements: CanvasElement[] = [];

      let template: PageTemplate | undefined;
      if (type === 'cover') template = COVER_TEMPLATES[0];
      else if (type === 'index') template = INDEX_TEMPLATES[0];
      else if (type === 'closing') template = CLOSING_TEMPLATES[0];

      if (template) {
        elements.push(
          ...template.elements.map((el, idx) => {
            const isHeading = el.type === 'text' && el.fontSize && el.fontSize >= 30;
            return {
              rotation: 0,
              opacity: 1,
              ...el,
              id: `page-el-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 5)}`,
              fontFamily:
                el.fontFamily || (el.type === 'text' ? (isHeading ? theme.headingFont : theme.fontFamily) : undefined),
              fill: el.fill || (el.type === 'text' ? (isHeading ? theme.headingColor : theme.bodyColor) : undefined),
            } as CanvasElement;
          })
        );
      }

      const newPage: CatalogPage = {
        id: `page-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        pageNumber: 1,
        elements,
        type,
        hasHeader:
          type !== 'cover'
            ? state.catalog.hasHeader !== false && (state.catalog.headerElements?.length || 0) > 0
            : false,
        hasFooter:
          type !== 'cover'
            ? state.catalog.hasFooter !== false && (state.catalog.footerElements?.length || 0) > 0
            : false,
        orientation: 'portrait',
      };

      const newPages = [...state.catalog.pages];
      const targetIndex =
        insertAfterIndex !== undefined
          ? Math.min(Math.max(0, insertAfterIndex + 1), newPages.length)
          : newPages.length;

      newPages.splice(targetIndex, 0, newPage);
      const renumberedPages = newPages.map((p, i) => ({ ...p, pageNumber: i + 1 }));

      return {
        catalog: { ...state.catalog, pages: renumberedPages, updatedAt: new Date().toISOString() },
        currentPageIndex: targetIndex,
        selectedElementIds: [],
      };
    });
  },

  addInteriorPageWithInheritedLayout: (insertAfterIndex?: number) => {
    get().pushHistory();
    set((state) => {
      const lastInteriorPage = [...state.catalog.pages].reverse().find((p) => p.type === 'interior');
      const inheritedElements: CanvasElement[] = [];
      if (lastInteriorPage) {
        const slots = lastInteriorPage.elements.filter(
          (el) => el.id.includes('slot') || el.type === 'shape' || (el.type === 'text' && el.id.includes('gen'))
        );
        slots.forEach((el, idx) => {
          inheritedElements.push({
            ...JSON.parse(JSON.stringify(el)),
            id: `inherited-slot-${idx}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            productId: undefined,
            src: undefined,
            text:
              el.type === 'text'
                ? el.id.includes('txt-n')
                  ? 'Product Name'
                  : el.id.includes('txt-p')
                  ? '$0.00'
                  : el.text
                : el.text,
          });
        });
      }
      const newPage: CatalogPage = {
        id: `page-inherited-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        pageNumber: 1,
        elements: inheritedElements,
        type: 'interior',
        hasHeader: state.catalog.hasHeader !== false && (state.catalog.headerElements?.length || 0) > 0,
        hasFooter: state.catalog.hasFooter !== false && (state.catalog.footerElements?.length || 0) > 0,
        categoryId: lastInteriorPage?.categoryId,
        orientation: 'portrait',
      };

      const newPages = [...state.catalog.pages];
      const targetIndex =
        insertAfterIndex !== undefined
          ? Math.min(Math.max(0, insertAfterIndex + 1), newPages.length)
          : newPages.length;

      newPages.splice(targetIndex, 0, newPage);
      const renumberedPages = newPages.map((p, i) => ({ ...p, pageNumber: i + 1 }));

      return {
        catalog: { ...state.catalog, pages: renumberedPages, updatedAt: new Date().toISOString() },
        currentPageIndex: targetIndex,
        selectedElementIds: [],
      };
    });
  },

  removePage: (indexOrId) => {
    get().pushHistory();
    set((state) => {
      if (state.catalog.pages.length <= 1) return state;
      let targetIndex: number;
      if (typeof indexOrId === 'string') {
        targetIndex = state.catalog.pages.findIndex((p) => p.id === indexOrId);
      } else {
        targetIndex = indexOrId;
      }
      if (targetIndex < 0 || targetIndex >= state.catalog.pages.length) return state;

      const newPages = state.catalog.pages
        .filter((_, i) => i !== targetIndex)
        .map((p, i) => ({ ...p, pageNumber: i + 1 }));

      let nextPageIndex = state.currentPageIndex;
      if (state.currentPageIndex === targetIndex) {
        nextPageIndex = Math.min(targetIndex, newPages.length - 1);
      } else if (state.currentPageIndex > targetIndex) {
        nextPageIndex = state.currentPageIndex - 1;
      }
      nextPageIndex = Math.max(0, Math.min(nextPageIndex, newPages.length - 1));

      return {
        catalog: { ...state.catalog, pages: newPages, updatedAt: new Date().toISOString() },
        currentPageIndex: nextPageIndex,
        selectedElementIds: [],
      };
    });
  },

  duplicatePage: (indexOrId) => {
    const { catalog } = get();
    get().pushHistory();
    let index: number;
    if (typeof indexOrId === 'string') {
      index = catalog.pages.findIndex((p) => p.id === indexOrId);
    } else {
      index = indexOrId;
    }
    if (index === -1 || !catalog.pages[index]) return;
    const pageToDuplicate = catalog.pages[index];
    const newPage = JSON.parse(JSON.stringify(pageToDuplicate));
    newPage.id = `page-dup-${Date.now()}`;
    newPage.elements = newPage.elements.map((el: any) => ({
      ...el,
      id: `el-pdup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }));
    set((state) => {
      const newPages = [...state.catalog.pages];
      newPages.splice(index + 1, 0, newPage);
      const renumberedPages = newPages.map((p, i) => ({ ...p, pageNumber: i + 1 }));
      return {
        catalog: { ...state.catalog, pages: renumberedPages, updatedAt: new Date().toISOString() },
        currentPageIndex: index + 1,
        selectedElementIds: [],
      };
    });
  },

  reorderPages: (newPageIds) =>
    set((state) => {
      get().pushHistory();
      const { catalog, currentPageIndex } = state;
      const currentPageId = catalog.pages[currentPageIndex]?.id;
      const reorderedPages = newPageIds.map((id, index) => {
        const page = catalog.pages.find((p) => p.id === id)!;
        return { ...page, pageNumber: index + 1 };
      });
      const newCurrentPageIndex = reorderedPages.findIndex((p) => p.id === currentPageId);
      return {
        catalog: { ...catalog, pages: reorderedPages, updatedAt: new Date().toISOString() },
        currentPageIndex: newCurrentPageIndex !== -1 ? newCurrentPageIndex : 0,
      };
    }),

  setPageOrientation: (pageIndex, orientation) => {
    get().pushHistory();
    set((state) => {
      const newPages = [...state.catalog.pages];
      if (!newPages[pageIndex]) return state;

      const oldOrientation = newPages[pageIndex].orientation || 'portrait';
      if (oldOrientation === orientation) return state;

      const oldW = oldOrientation === 'landscape' ? PAGE_HEIGHT : PAGE_WIDTH;
      const oldH = oldOrientation === 'landscape' ? PAGE_WIDTH : PAGE_HEIGHT;
      const newW = orientation === 'landscape' ? PAGE_HEIGHT : PAGE_WIDTH;
      const newH = orientation === 'landscape' ? PAGE_WIDTH : PAGE_HEIGHT;

      newPages[pageIndex] = {
        ...newPages[pageIndex],
        orientation,
        elements: newPages[pageIndex].elements.map((el) => {
          const scaleX = newW / oldW;
          const scaleY = newH / oldH;

          let newX = el.x * scaleX;
          let newY = el.y * scaleY;
          let newWidth = el.width * scaleX;
          let newHeight = el.height * scaleY;

          return {
            ...el,
            x: newX,
            y: newY,
            width: newWidth,
            height: newHeight,
          };
        }),
      };

      return {
        catalog: { ...state.catalog, pages: newPages, updatedAt: new Date().toISOString() },
      };
    });
  },

  setCatalogOrientation: (orientation) => {
    get().pushHistory();
    set((state) => {
      const newPages = state.catalog.pages.map((page) => {
        const oldOrientation = page.orientation || 'portrait';
        if (oldOrientation === orientation) return page;

        const oldW = oldOrientation === 'landscape' ? PAGE_HEIGHT : PAGE_WIDTH;
        const oldH = oldOrientation === 'landscape' ? PAGE_WIDTH : PAGE_HEIGHT;
        const newW = orientation === 'landscape' ? PAGE_HEIGHT : PAGE_WIDTH;
        const newH = orientation === 'landscape' ? PAGE_WIDTH : PAGE_HEIGHT;

        return {
          ...page,
          orientation,
          elements: page.elements.map((el) => {
            const scaleX = newW / oldW;
            const scaleY = newH / oldH;

            return {
              ...el,
              x: el.x * scaleX,
              y: el.y * scaleY,
            };
          }),
        };
      });

      return {
        catalog: { ...state.catalog, pages: newPages },
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

  toggleCatalogProduct: (productId) =>
    set((state) => {
      const productIds = state.catalog.productIds || [];
      const newProductIds = productIds.includes(productId)
        ? productIds.filter((id) => id !== productId)
        : [...productIds, productId];
      return {
        catalog: { ...state.catalog, productIds: newProductIds, updatedAt: new Date().toISOString() },
      };
    }),

  removeProductFromCanvas: (productId: string) => {
    get().pushHistory();
    set((state) => {
      const newPages = state.catalog.pages.map((page) => ({
        ...page,
        elements: page.elements.filter((el) => el.productId !== productId),
      }));
      return {
        catalog: { ...state.catalog, pages: newPages, updatedAt: new Date().toISOString() },
        selectedElementIds: state.selectedElementIds.filter((id) => {
          const el = state.catalog.pages.flatMap((p) => p.elements).find((e) => e.id === id);
          return el?.productId !== productId;
        }),
      };
    });
  },

  removeProductFromPage: (pageIndex: number, productId: string) => {
    get().pushHistory();
    set((state) => {
      const newPages = [...state.catalog.pages];
      newPages[pageIndex] = {
        ...newPages[pageIndex],
        elements: newPages[pageIndex].elements.filter((el) => el.productId !== productId),
      };
      return {
        catalog: { ...state.catalog, pages: newPages, updatedAt: new Date().toISOString() },
        selectedElementIds: state.selectedElementIds.filter((id) => {
          const el = newPages[pageIndex].elements.find((e) => e.id === id);
          return el?.productId !== productId;
        }),
      };
    });
  },
});
