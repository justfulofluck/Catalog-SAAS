import { AppSlice, HeaderFooterSlice } from '../types';
import { CanvasElement, HeaderFooterTemplate } from '../../types';

export const createHeaderFooterSlice: AppSlice<HeaderFooterSlice> = (set, get) => ({
  isHeaderDesignerOpen: false,
  editingHeaderTemplate: null,
  isFooterDesignerOpen: false,
  editingFooterTemplate: null,

  setIsHeaderDesignerOpen: (isOpen, template = null) =>
    set({
      isHeaderDesignerOpen: isOpen,
      editingHeaderTemplate: template,
    }),

  setIsFooterDesignerOpen: (isOpen, template = null) =>
    set({
      isFooterDesignerOpen: isOpen,
      editingFooterTemplate: template,
    }),

  addHeaderElement: (element) =>
    set((state) => ({
      catalog: {
        ...state.catalog,
        headerElements: [
          ...(state.catalog.headerElements || []),
          { ...element, zIndex: 1000 + ((state.catalog.headerElements || []).length + 1) },
        ],
        updatedAt: new Date().toISOString(),
      },
    })),

  addFooterElement: (element) =>
    set((state) => ({
      catalog: {
        ...state.catalog,
        footerElements: [
          ...(state.catalog.footerElements || []),
          { ...element, zIndex: 2000 + ((state.catalog.footerElements || []).length + 1) },
        ],
        updatedAt: new Date().toISOString(),
      },
    })),

  updateHeaderElement: (elementId, updates) => {
    get().pushHistory();
    set((state) => ({
      catalog: {
        ...state.catalog,
        headerElements: (state.catalog.headerElements || []).map((el) =>
          el.id === elementId ? { ...el, ...updates } : el
        ),
        updatedAt: new Date().toISOString(),
      },
    }));
  },

  updateFooterElement: (elementId, updates) => {
    get().pushHistory();
    set((state) => ({
      catalog: {
        ...state.catalog,
        footerElements: (state.catalog.footerElements || []).map((el) =>
          el.id === elementId ? { ...el, ...updates } : el
        ),
        updatedAt: new Date().toISOString(),
      },
    }));
  },

  removeHeaderElement: (elementId) =>
    set((state) => ({
      catalog: {
        ...state.catalog,
        headerElements: (state.catalog.headerElements || []).filter((el) => el.id !== elementId),
        updatedAt: new Date().toISOString(),
      },
    })),

  removeFooterElement: (elementId) =>
    set((state) => ({
      catalog: {
        ...state.catalog,
        footerElements: (state.catalog.footerElements || []).filter((el) => el.id !== elementId),
        updatedAt: new Date().toISOString(),
      },
    })),

  duplicateHeaderElement: (elementId) => {
    const { catalog } = get();
    const element = catalog.headerElements.find((el) => el.id === elementId);
    if (!element) return;

    // Restriction: Only one text element allowed in header
    if (element.type === 'text' && catalog.headerElements.some((el) => el.type === 'text')) {
      return;
    }

    get().pushHistory();
    const newElement: CanvasElement = {
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
    const element = catalog.footerElements.find((el) => el.id === elementId);
    if (!element) return;

    // Restriction: Only one text element allowed in footer
    if (element.type === 'text' && catalog.footerElements.some((el) => el.type === 'text')) {
      return;
    }

    get().pushHistory();
    const newElement: CanvasElement = {
      ...JSON.parse(JSON.stringify(element)),
      id: `footer-el-dup-${Date.now()}`,
      x: element.x + 20,
      y: element.y + 20,
      zIndex: (element.zIndex || 0) + 1,
    };
    get().addFooterElement(newElement);
  },

  applyHeaderTemplate: (template: HeaderFooterTemplate) => {
    get().pushHistory();
    set((state) => {
      const newHeaderElements = template.elements.map((el, i) => ({
        ...el,
        id: el.id || `hdr-el-${Date.now()}-${i}`,
        locked: el.locked ?? false,
        zIndex: 1000 + (el.zIndex !== undefined ? el.zIndex : i + 1),
        opacity: el.opacity ?? 1,
        rotation: el.rotation ?? 0,
      })) as CanvasElement[];

      return {
        catalog: {
          ...state.catalog,
          hasHeader: true,
          headerHeight: template.height,
          headerElements: newHeaderElements,
          headerMigrated: true,
          updatedAt: new Date().toISOString(),
        },
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
        zIndex: 2000 + (el.zIndex !== undefined ? el.zIndex : i + 1),
        opacity: el.opacity ?? 1,
        rotation: el.rotation ?? 0,
      })) as CanvasElement[];

      return {
        catalog: {
          ...state.catalog,
          hasFooter: true,
          footerHeight: template.height,
          footerElements: newFooterElements,
          footerMigrated: true,
          updatedAt: new Date().toISOString(),
        },
      };
    });
  },
});
