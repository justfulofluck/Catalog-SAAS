import { AppSlice, HistorySlice } from '../types';
import { CanvasElement } from '../../types';

let _lastPushHistoryTime = 0;
let _pasteSequenceCount = 0;
let _lastPasteTargetPos: { x: number; y: number } | null = null;

export const createHistorySlice: AppSlice<HistorySlice> = (set, get) => ({
  undoStack: [],
  redoStack: [],
  guides: [],
  activeDragPosition: null,
  draggingItem: null,
  clipboard: [],

  pushHistory: () => {
    const now = Date.now();
    if (_lastPushHistoryTime && now - _lastPushHistoryTime < 300) {
      return;
    }
    _lastPushHistoryTime = now;
    const { catalog, undoStack } = get();
    try {
      const currentSnapshot = JSON.parse(JSON.stringify(catalog));
      set({
        undoStack: [currentSnapshot, ...undoStack].slice(0, 12),
        redoStack: [],
      });
    } catch (e) {
      console.warn('Could not snapshot history', e);
    }
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
      selectedElementIds: [],
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
      selectedElementIds: [],
    });
  },

  setGuides: (guides) => set({ guides }),
  setDragPosition: (activeDragPosition) => set({ activeDragPosition }),
  setDraggingItem: (item) => set({ draggingItem: item }),

  copySelectedElements: () => {
    const { selectedElementIds, catalog, currentPageIndex } = get();
    if (selectedElementIds.length === 0) return;

    const page = catalog.pages[currentPageIndex];
    const headerEls = catalog.headerElements || [];
    const footerEls = catalog.footerElements || [];

    const elementsToCopy: CanvasElement[] = [];

    selectedElementIds.forEach((id) => {
      let el = page?.elements.find((e) => e.id === id);
      if (!el) el = headerEls.find((e) => e.id === id);
      if (!el) el = footerEls.find((e) => e.id === id);

      if (el) {
        elementsToCopy.push(JSON.parse(JSON.stringify(el)));
      }
    });

    set({ clipboard: elementsToCopy });
  },

  pasteElements: (targetPos?: { x: number; y: number }, targetPageIdx?: number) => {
    const { clipboard, catalog, currentPageIndex } = get();
    if (clipboard.length === 0) return;

    get().pushHistory();

    const resolvedPageIndex =
      typeof targetPageIdx === 'number' && targetPageIdx >= 0 && targetPageIdx < catalog.pages.length
        ? targetPageIdx
        : currentPageIndex >= 0 && currentPageIndex < catalog.pages.length
        ? currentPageIndex
        : 0;

    const pageElements = catalog.pages[resolvedPageIndex]?.elements || [];

    // Track sequential paste count to cascade consecutive pastes cleanly (like Canva/Figma)
    if (
      targetPos &&
      _lastPasteTargetPos &&
      Math.abs(targetPos.x - _lastPasteTargetPos.x) < 5 &&
      Math.abs(targetPos.y - _lastPasteTargetPos.y) < 5
    ) {
      _pasteSequenceCount += 1;
    } else if (!targetPos && _lastPasteTargetPos === null) {
      _pasteSequenceCount += 1;
    } else {
      _pasteSequenceCount = 1;
    }
    _lastPasteTargetPos = targetPos ? { ...targetPos } : null;

    const stagger = (_pasteSequenceCount - 1) * 20;

    let offsetX = 20 + stagger;
    let offsetY = 20 + stagger;

    if (targetPos && typeof targetPos.x === 'number' && typeof targetPos.y === 'number') {
      const minX = Math.min(...clipboard.map((el) => el.x));
      const minY = Math.min(...clipboard.map((el) => el.y));
      const maxX = Math.max(...clipboard.map((el) => el.x + (el.width || 0)));
      const maxY = Math.max(...clipboard.map((el) => el.y + (el.height || 0)));
      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;

      offsetX = targetPos.x - centerX + stagger;
      offsetY = targetPos.y - centerY + stagger;
    }

    const uniqueStamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const pastedElements = clipboard.map((el, idx) => ({
      ...el,
      id: `paste-${uniqueStamp}-${idx}`,
      x: Math.round(el.x + offsetX),
      y: Math.round(el.y + offsetY),
      zIndex: pageElements.length + idx + 1,
      groupId: undefined,
    }));

    const newPages = [...catalog.pages];
    if (newPages[resolvedPageIndex]) {
      newPages[resolvedPageIndex] = {
        ...newPages[resolvedPageIndex],
        elements: [...newPages[resolvedPageIndex].elements, ...pastedElements],
      };

      set({
        catalog: { ...catalog, pages: newPages, updatedAt: new Date().toISOString() },
        currentPageIndex: resolvedPageIndex,
        selectedElementIds: pastedElements.map((el) => el.id),
      });
    }
  },
});
