import { AppSlice, ElementsSlice } from '../types';
import { CanvasElement } from '../../types';
import { PAGE_WIDTH, PAGE_HEIGHT } from '../../constants';

export const createElementsSlice: AppSlice<ElementsSlice> = (set, get) => ({
  selectedElementIds: [],
  hoveredElementId: null,
  isSceneTreeOpen: false,
  isPropertyPanelOpen: true,
  isTableEditorOpen: false,
  editingTableElementId: null,
  isChecklistEditorOpen: false,
  editingChecklistElementId: null,

  setSelectedElementIds: (ids) => set(() => ({ selectedElementIds: ids })),

  setSelectedElements: (ids) =>
    set((state) => {
      const page = state.catalog.pages[state.currentPageIndex];
      const headerEls = state.catalog.headerElements || [];
      const footerEls = state.catalog.footerElements || [];

      const newIds = new Set<string>();

      ids.forEach((id) => {
        let el = page?.elements.find((e) => e.id === id);
        let container = page?.elements;

        if (!el) {
          el = headerEls.find((e) => e.id === id);
          container = headerEls;
        }
        if (!el) {
          el = footerEls.find((e) => e.id === id);
          container = footerEls;
        }

        if (el && el.groupId && container) {
          container.filter((e) => e.groupId === el!.groupId).forEach((member) => newIds.add(member.id));
        } else if (el) {
          newIds.add(id);
        }
      });

      return { selectedElementIds: Array.from(newIds) };
    }),

  setHoveredElementId: (id) => set({ hoveredElementId: id }),
  setIsSceneTreeOpen: (isOpen) => set({ isSceneTreeOpen: isOpen }),
  setIsPropertyPanelOpen: (isOpen) => set({ isPropertyPanelOpen: isOpen }),
  setIsTableEditorOpen: (isOpen, elementId = null) =>
    set({
      isTableEditorOpen: isOpen,
      editingTableElementId: elementId,
    }),
  setIsChecklistEditorOpen: (isOpen, elementId = null) =>
    set({
      isChecklistEditorOpen: isOpen,
      editingChecklistElementId: elementId,
    }),

  addElement: (pageIndex, element) => {
    get().pushHistory();
    set((state) => {
      const newPages = [...state.catalog.pages];
      const page = newPages[pageIndex];
      if (!page) return state;
      const isLandscape = page.orientation === 'landscape';
      const pageWidth = isLandscape ? PAGE_HEIGHT : PAGE_WIDTH;
      const pageHeight = isLandscape ? PAGE_WIDTH : PAGE_HEIGHT;

      // Smart positioning: if element is near default (100,100 or 150,150), center it
      const finalElement = { ...element };
      const isDefaultPos =
        (element.x === 100 && element.y === 100) ||
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
        isPropertyPanelOpen: true,
      };
    });
  },

  addElements: (pageIndex, elements) => {
    if (!elements || elements.length === 0) return;
    get().pushHistory();
    set((state) => {
      const newPages = [...state.catalog.pages];
      const page = newPages[pageIndex];
      if (!page) return state;
      const isLandscape = page.orientation === 'landscape';
      const pageWidth = isLandscape ? PAGE_HEIGHT : PAGE_WIDTH;
      const pageHeight = isLandscape ? PAGE_WIDTH : PAGE_HEIGHT;

      let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;
      elements.forEach((el) => {
        minX = Math.min(minX, el.x);
        minY = Math.min(minY, el.y);
        maxX = Math.max(maxX, el.x + el.width);
        maxY = Math.max(maxY, el.y + el.height);
      });
      const totalW = maxX - minX;
      const totalH = maxY - minY;
      const targetCenterX = (pageWidth - totalW) / 2;
      const targetCenterY = (pageHeight - totalH) / 2;
      const dx = targetCenterX - minX;
      const dy = targetCenterY - minY;

      const repositioned = elements.map((el) => ({
        ...el,
        x: Math.round(el.x + dx),
        y: Math.round(el.y + dy),
      }));

      newPages[pageIndex] = {
        ...page,
        elements: [...(page.elements || []), ...repositioned],
      };

      return {
        catalog: { ...state.catalog, pages: newPages, updatedAt: new Date().toISOString() },
        selectedElementIds: repositioned.map((el) => el.id),
        isPropertyPanelOpen: true,
      };
    });
  },

  updateElement: (pageIndex, elementId, updates) =>
    set((state) => {
      const newPages = [...state.catalog.pages];
      const page = { ...newPages[pageIndex] };
      const element = page.elements?.find((el) => el.id === elementId);

      if (!element) return state;

      const hasPositionMove =
        (typeof updates.x === 'number' && updates.x !== element.x) ||
        (typeof updates.y === 'number' && updates.y !== element.y);

      if (element.groupId && hasPositionMove) {
        const dx = typeof updates.x === 'number' ? updates.x - element.x : 0;
        const dy = typeof updates.y === 'number' ? updates.y - element.y : 0;

        page.elements = page.elements.map((el) => {
          if (el.groupId === element.groupId) {
            if (el.id === elementId) {
              return { ...el, ...updates };
            }
            return { ...el, x: el.x + dx, y: el.y + dy };
          }
          return el;
        });
      } else {
        page.elements = page.elements.map((el) => (el.id === elementId ? { ...el, ...updates } : el));
      }

      newPages[pageIndex] = page;

      return {
        catalog: { ...state.catalog, pages: newPages, updatedAt: new Date().toISOString() },
      };
    }),

  updateElements: (pageIndex, updatesList) =>
    set((state) => {
      const newPages = [...state.catalog.pages];
      const page = { ...newPages[pageIndex] };
      const updateMap = new Map(updatesList.map((u) => [u.id, u.updates]));

      page.elements = page.elements.map((el) => {
        const updates = updateMap.get(el.id);
        return updates ? { ...el, ...updates } : el;
      });

      newPages[pageIndex] = page;
      return {
        catalog: { ...state.catalog, pages: newPages, updatedAt: new Date().toISOString() },
      };
    }),

  moveElements: (pageIndex, elementIds, dx, dy) =>
    set((state) => {
      const newPages = [...state.catalog.pages];
      const page = newPages[pageIndex];
      if (!page) return state;

      page.elements = page.elements.map((el) =>
        elementIds.includes(el.id) ? { ...el, x: el.x + dx, y: el.y + dy } : el
      );

      return {
        catalog: { ...state.catalog, pages: newPages, updatedAt: new Date().toISOString() },
      };
    }),

  removeElement: (pageIndex, elementId) => {
    get().pushHistory();
    set((state) => {
      const newPages = [...state.catalog.pages];
      const page = newPages[pageIndex];
      if (!page) return state;
      const element = page.elements.find((el) => el.id === elementId);

      if (element?.groupId) {
        page.elements = page.elements.filter((el) => el.groupId !== element.groupId);
      } else {
        page.elements = page.elements.filter((el) => el.id !== elementId);
      }

      return {
        catalog: { ...state.catalog, pages: newPages, updatedAt: new Date().toISOString() },
        selectedElementIds: [],
      };
    });
  },

  duplicateElement: (pageIndex, elementId) => {
    const { catalog } = get();
    get().pushHistory();
    const page = catalog.pages[pageIndex];
    const element = page?.elements.find((el) => el.id === elementId);
    if (!element) return;
    const newElement: CanvasElement = {
      ...JSON.parse(JSON.stringify(element)),
      id: `el-dup-${Date.now()}`,
      x: element.x + 20,
      y: element.y + 20,
      zIndex: (element.zIndex || 0) + 1,
      groupId: undefined,
    };
    get().addElement(pageIndex, newElement);
  },

  nudgeElement: (pageIndex, elementId, dx, dy) =>
    set((state) => {
      const newPages = [...state.catalog.pages];
      const page = newPages[pageIndex];
      if (!page) return state;
      const element = page.elements.find((el) => el.id === elementId);

      if (!element || element.locked) return state;

      if (element.groupId) {
        page.elements = page.elements.map((el) =>
          el.groupId === element.groupId ? { ...el, x: el.x + dx, y: el.y + dy } : el
        );
      } else {
        page.elements = page.elements.map((el) =>
          el.id === elementId ? { ...el, x: el.x + dx, y: el.y + dy } : el
        );
      }

      return {
        catalog: { ...state.catalog, pages: newPages },
      };
    }),

  toggleLock: (pageIndex, elementId) => {
    get().pushHistory();
    set((state) => {
      const newPages = [...state.catalog.pages];
      const page = newPages[pageIndex];
      if (!page) return state;
      page.elements = page.elements.map((el) =>
        el.id === elementId ? { ...el, locked: !el.locked } : el
      );
      return {
        catalog: { ...state.catalog, pages: newPages, updatedAt: new Date().toISOString() },
      };
    });
  },

  toggleLockElement: (elementId) =>
    set((state) => {
      const pageIndex = state.currentPageIndex;
      const pages = [...state.catalog.pages];
      if (pages[pageIndex]?.elements.some((el) => el.id === elementId)) {
        pages[pageIndex].elements = pages[pageIndex].elements.map((el) =>
          el.id === elementId ? { ...el, locked: !el.locked } : el
        );
        return { catalog: { ...state.catalog, pages } };
      }

      if (state.catalog.headerElements?.some((el) => el.id === elementId)) {
        return {
          catalog: {
            ...state.catalog,
            headerElements: state.catalog.headerElements.map((el) =>
              el.id === elementId ? { ...el, locked: !el.locked } : el
            ),
          },
        };
      }

      if (state.catalog.footerElements?.some((el) => el.id === elementId)) {
        return {
          catalog: {
            ...state.catalog,
            footerElements: state.catalog.footerElements.map((el) =>
              el.id === elementId ? { ...el, locked: !el.locked } : el
            ),
          },
        };
      }

      return state;
    }),

  toggleVisibilityElement: (elementId) =>
    set((state) => {
      const pageIndex = state.currentPageIndex;
      const pages = [...state.catalog.pages];
      if (pages[pageIndex]?.elements.some((el) => el.id === elementId)) {
        pages[pageIndex].elements = pages[pageIndex].elements.map((el) =>
          el.id === elementId ? { ...el, visible: el.visible === false } : el
        );
        return { catalog: { ...state.catalog, pages } };
      }

      if (state.catalog.headerElements?.some((el) => el.id === elementId)) {
        return {
          catalog: {
            ...state.catalog,
            headerElements: state.catalog.headerElements.map((el) =>
              el.id === elementId ? { ...el, visible: el.visible === false } : el
            ),
          },
        };
      }

      if (state.catalog.footerElements?.some((el) => el.id === elementId)) {
        return {
          catalog: {
            ...state.catalog,
            footerElements: state.catalog.footerElements.map((el) =>
              el.id === elementId ? { ...el, visible: el.visible === false } : el
            ),
          },
        };
      }

      return state;
    }),

  reorderElement: (pageIndex, elementId, direction) =>
    set((state) => {
      get().pushHistory();
      const newPages = [...state.catalog.pages];
      const page = newPages[pageIndex];
      if (!page) return state;
      const elements = [...page.elements];
      const index = elements.findIndex((el) => el.id === elementId);
      if (index === -1) return state;

      const el = elements.splice(index, 1)[0];
      if (direction === 'front') elements.push(el);
      else if (direction === 'back') elements.unshift(el);
      else if (direction === 'forward') elements.splice(Math.min(elements.length, index + 1), 0, el);
      else if (direction === 'backward') elements.splice(Math.max(0, index - 1), 0, el);

      newPages[pageIndex].elements = elements.map((e, i) => ({ ...e, zIndex: i }));
      return { catalog: { ...state.catalog, pages: newPages } };
    }),

  setElementOrder: (pageIndex, newIds) =>
    set((state) => {
      get().pushHistory();
      const newPages = [...state.catalog.pages];
      const page = newPages[pageIndex];
      if (!page) return state;
      const reversedIds = [...newIds].reverse();
      const reorderedElements = reversedIds.map((id, index) => {
        const el = page.elements.find((e) => e.id === id);
        return { ...el!, zIndex: index };
      });
      newPages[pageIndex] = { ...page, elements: reorderedElements };
      return { catalog: { ...state.catalog, pages: newPages } };
    }),

  reorderElements: (pageIndex, newOrderIds) =>
    set((state) => {
      const pages = [...state.catalog.pages];
      const page = { ...pages[pageIndex] };
      const elementMap = new Map(page.elements.map((el) => [el.id, el]));
      const newElements = newOrderIds.map((id) => elementMap.get(id)).filter(Boolean) as CanvasElement[];

      page.elements = newElements.map((el, idx) => ({ ...el, zIndex: idx }));
      pages[pageIndex] = page;
      return { catalog: { ...state.catalog, pages } };
    }),

  reorderHeaderElements: (newOrderIds) =>
    set((state) => {
      const elementMap = new Map(state.catalog.headerElements.map((el) => [el.id, el]));
      const newElements = newOrderIds.map((id) => elementMap.get(id)).filter(Boolean) as CanvasElement[];
      return {
        catalog: {
          ...state.catalog,
          headerElements: newElements.map((el, idx) => ({ ...el, zIndex: 1000 + idx })),
        },
      };
    }),

  reorderFooterElements: (newOrderIds) =>
    set((state) => {
      const elementMap = new Map(state.catalog.footerElements.map((el) => [el.id, el]));
      const newElements = newOrderIds.map((id) => elementMap.get(id)).filter(Boolean) as CanvasElement[];
      return {
        catalog: {
          ...state.catalog,
          footerElements: newElements.map((el, idx) => ({ ...el, zIndex: 2000 + idx })),
        },
      };
    }),

  alignElements: (pageIndex, ids, type) => {
    if (ids.length < 1) return;
    get().pushHistory();
    const { catalog } = get();
    const page = catalog.pages[pageIndex];
    if (!page) return;

    const elements = page.elements.filter((el) => ids.includes(el.id));
    const isLandscape = page.orientation === 'landscape';
    const currentWidth = isLandscape ? PAGE_HEIGHT : PAGE_WIDTH;
    const currentHeight = isLandscape ? PAGE_WIDTH : PAGE_HEIGHT;

    let target = 0;
    if (type === 'left') target = ids.length === 1 ? 0 : Math.min(...elements.map((e) => e.x));
    if (type === 'right')
      target = ids.length === 1 ? currentWidth : Math.max(...elements.map((e) => e.x + e.width));
    if (type === 'top') target = ids.length === 1 ? 0 : Math.min(...elements.map((e) => e.y));
    if (type === 'bottom')
      target = ids.length === 1 ? currentHeight : Math.max(...elements.map((e) => e.y + e.height));
    if (type === 'center') {
      if (ids.length === 1) {
        target = currentWidth / 2;
      } else {
        const minX = Math.min(...elements.map((e) => e.x));
        const maxX = Math.max(...elements.map((e) => e.x + e.width));
        target = minX + (maxX - minX) / 2;
      }
    }
    if (type === 'middle') {
      if (ids.length === 1) {
        target = currentHeight / 2;
      } else {
        const minY = Math.min(...elements.map((e) => e.y));
        const maxY = Math.max(...elements.map((e) => e.y + e.height));
        target = minY + (maxY - minY) / 2;
      }
    }

    set((state) => {
      const newPages = [...state.catalog.pages];
      newPages[pageIndex].elements = newPages[pageIndex].elements.map((el) => {
        if (!ids.includes(el.id) || el.locked) return el;
        switch (type) {
          case 'left':
            return { ...el, x: target };
          case 'right':
            return { ...el, x: target - el.width };
          case 'top':
            return { ...el, y: target };
          case 'bottom':
            return { ...el, y: target - el.height };
          case 'center':
            return { ...el, x: target - el.width / 2 };
          case 'middle':
            return { ...el, y: target - el.height / 2 };
          default:
            return el;
        }
      });
      return { catalog: { ...state.catalog, pages: newPages } };
    });
  },

  distributeElements: (pageIndex, ids, direction) => {
    if (ids.length < 3) return;
    get().pushHistory();
    const { catalog } = get();
    const page = catalog.pages[pageIndex];
    if (!page) return;
    const elements = [...page.elements.filter((el) => ids.includes(el.id))];

    if (direction === 'horizontal') {
      elements.sort((a, b) => a.x - b.x);
      const first = elements[0];
      const last = elements[elements.length - 1];
      const totalWidthOfElements = elements.reduce((acc, el) => acc + el.width, 0);
      const availableWidth = last.x + last.width - first.x;
      const totalGap = availableWidth - totalWidthOfElements;
      const gap = totalGap / (elements.length - 1);

      set((state) => {
        const newPages = [...state.catalog.pages];
        newPages[pageIndex].elements = newPages[pageIndex].elements.map((el) => {
          const sortedIdx = elements.findIndex((se) => se.id === el.id);
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
      const availableHeight = last.y + last.height - first.y;
      const totalGap = availableHeight - totalHeightOfElements;
      const gap = totalGap / (elements.length - 1);

      set((state) => {
        const newPages = [...state.catalog.pages];
        newPages[pageIndex].elements = newPages[pageIndex].elements.map((el) => {
          const sortedIdx = elements.findIndex((se) => se.id === el.id);
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

  groupSelected: (pageIndex) => {
    get().pushHistory();
    set((state) => {
      const { selectedElementIds } = state;
      if (selectedElementIds.length < 2) return state;

      const newPages = [...state.catalog.pages];
      const page = { ...newPages[pageIndex] };
      if (!page || !page.elements) return state;
      const groupId = `group-${Date.now()}`;

      const selectedIndices: number[] = [];
      page.elements.forEach((el, idx) => {
        if (selectedElementIds.includes(el.id)) {
          selectedIndices.push(idx);
        }
      });

      const maxIndex = Math.max(...selectedIndices);

      const selectedElements = page.elements
        .filter((el) => selectedElementIds.includes(el.id))
        .map((el) => ({ ...el, groupId }));

      const finalElements: CanvasElement[] = [];
      let selectionInserted = false;

      for (let i = 0; i < page.elements.length; i++) {
        if (selectedElementIds.includes(page.elements[i].id)) {
          if (i === maxIndex) {
            finalElements.push(...selectedElements);
            selectionInserted = true;
          }
        } else {
          finalElements.push(page.elements[i]);
        }
      }

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
      if (!page || !page.elements) return state;

      const groupsToUngroup = new Set<string>();
      selectedElementIds.forEach((id) => {
        const el = page.elements.find((e) => e.id === id);
        if (el?.groupId) groupsToUngroup.add(el.groupId);
      });

      if (groupsToUngroup.size === 0) return state;

      page.elements = page.elements.map((el) => {
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
});
