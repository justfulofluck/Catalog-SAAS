import { useCallback, useEffect } from 'react';
import { useStore } from '../../../store/useStore';
import { PAGE_WIDTH, PAGE_HEIGHT } from '../../../constants';

interface UseCanvasShortcutsProps {
  selectedElementIds: string[];
  currentPageIndex: number;
  zoom: number;
  setZoom: (zoom: number | ((prev: number) => number)) => void;
  setSelectedElementIds: (ids: string[]) => void;
  setEditingId: (id: string | null) => void;
  setEditConfig: (config: any | null) => void;
  contextMenu: any;
  setContextMenu: (menu: any) => void;
  saveContent: (shouldClose?: boolean) => void;
  lastMousePosRef: React.RefObject<{ clientX: number; clientY: number } | null>;
}

export const useCanvasShortcuts = ({
  selectedElementIds,
  currentPageIndex,
  zoom,
  setZoom,
  setSelectedElementIds,
  setEditingId,
  setEditConfig,
  contextMenu,
  setContextMenu,
  saveContent,
  lastMousePosRef,
}: UseCanvasShortcutsProps) => {
  const {
    catalog,
    undo,
    redo,
    pushHistory,
    nudgeElement,
    removeElement,
    duplicateElement,
    groupSelected,
    ungroupSelected,
    toggleLock,
    updateElement,
    removeHeaderElement,
    removeFooterElement,
    copySelectedElements,
    pasteElements,
  } = useStore();

  const currentPage = catalog.pages[currentPageIndex];

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const activeEl = document.activeElement as HTMLElement;
      const isEditingText =
        activeEl?.tagName === 'INPUT' ||
        activeEl?.tagName === 'TEXTAREA' ||
        activeEl?.isContentEditable;

      const isMod = e.metaKey || e.ctrlKey;

      // Undo / Redo - Global
      if (isMod && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        e.shiftKey ? redo() : undo();
        return;
      }
      if (isMod && (e.key === 'y' || e.key === 'Y')) {
        e.preventDefault();
        redo();
        return;
      }

      // Grouping / Ungrouping
      if (isMod && (e.key === 'g' || e.key === 'G')) {
        e.preventDefault();
        if (e.shiftKey) {
          ungroupSelected(currentPageIndex);
        } else {
          groupSelected(currentPageIndex);
        }
        return;
      }

      // Numpad Enter to deselect (Global)
      if (e.code === 'NumpadEnter') {
        e.preventDefault();
        setSelectedElementIds([]);
        setEditingId(null);
        setEditConfig(null);
        activeEl?.blur();
        return;
      }

      // While editing text, only allow formatting shortcuts
      if (isEditingText) {
        if (isMod) {
          if (['b', 'B'].includes(e.key)) {
            e.preventDefault();
            document.execCommand('bold');
            return;
          }
          if (['i', 'I'].includes(e.key)) {
            e.preventDefault();
            document.execCommand('italic');
            return;
          }
          if (['u', 'U'].includes(e.key)) {
            e.preventDefault();
            document.execCommand('underline');
            return;
          }
        }
        return;
      }

      const nudge = e.shiftKey ? 10 : 1;
      switch (e.key) {
        case 'ArrowUp':
          if (selectedElementIds.length) {
            e.preventDefault();
            if (!e.repeat) pushHistory();
            selectedElementIds.forEach((id) => nudgeElement(currentPageIndex, id, 0, -nudge));
          }
          break;
        case 'ArrowDown':
          if (selectedElementIds.length) {
            e.preventDefault();
            if (!e.repeat) pushHistory();
            selectedElementIds.forEach((id) => nudgeElement(currentPageIndex, id, 0, nudge));
          }
          break;
        case 'ArrowLeft':
          if (selectedElementIds.length) {
            e.preventDefault();
            if (!e.repeat) pushHistory();
            selectedElementIds.forEach((id) => nudgeElement(currentPageIndex, id, -nudge, 0));
          }
          break;
        case 'ArrowRight':
          if (selectedElementIds.length) {
            e.preventDefault();
            if (!e.repeat) pushHistory();
            selectedElementIds.forEach((id) => nudgeElement(currentPageIndex, id, nudge, 0));
          }
          break;
        case 'Backspace':
        case 'Delete':
          if (selectedElementIds.length) {
            e.preventDefault();
            selectedElementIds.forEach((id) => {
              if (catalog.headerElements?.some((h) => h.id === id)) {
                removeHeaderElement(id);
              } else if (catalog.footerElements?.some((f) => f.id === id)) {
                removeFooterElement(id);
              } else {
                const el = currentPage?.elements?.find((e) => e.id === id);
                if (el && !el.locked) removeElement(currentPageIndex, id);
              }
            });
            setSelectedElementIds([]);
          }
          break;
        case 'l':
        case 'L':
          if (isMod && e.shiftKey) {
            e.preventDefault();
            selectedElementIds.forEach((id) => toggleLock(currentPageIndex, id));
          }
          break;
        case 'd':
        case 'D':
          if (isMod) {
            e.preventDefault();
            selectedElementIds.forEach((id) => duplicateElement(currentPageIndex, id));
          }
          break;
        case '=':
        case '+':
          if (isMod) {
            e.preventDefault();
            setZoom((z) => Math.min(3, z + 0.1));
          }
          break;
        case '-':
          if (isMod) {
            e.preventDefault();
            setZoom((z) => Math.max(0.1, z - 0.1));
          }
          break;
        case 'b':
        case 'B':
          if (isMod && selectedElementIds.length) {
            e.preventDefault();
            selectedElementIds.forEach((id) => {
              const el = currentPage?.elements?.find((e) => e.id === id);
              if (el?.type === 'text') {
                const isBold =
                  el.fontWeight === 'bold' || el.fontWeight === '700' || el.fontWeight === '800';
                updateElement(currentPageIndex, id, { fontWeight: isBold ? '400' : '700' });
              }
            });
          }
          break;
        case 'i':
        case 'I':
          if (isMod && selectedElementIds.length) {
            e.preventDefault();
            selectedElementIds.forEach((id) => {
              const el = currentPage?.elements?.find((e) => e.id === id);
              if (el?.type === 'text') {
                updateElement(currentPageIndex, id, {
                  fontStyle: el.fontStyle === 'italic' ? 'normal' : 'italic',
                });
              }
            });
          }
          break;
        case 'u':
        case 'U':
          if (isMod && selectedElementIds.length) {
            e.preventDefault();
            selectedElementIds.forEach((id) => {
              const el = currentPage?.elements?.find((e) => e.id === id);
              if (el?.type === 'text') {
                updateElement(currentPageIndex, id, {
                  textDecoration: el.textDecoration === 'underline' ? 'none' : 'underline',
                });
              }
            });
          }
          break;
        case 'a':
        case 'A':
          if (isMod && currentPage?.elements) {
            e.preventDefault();
            const allUnlockedIds = currentPage.elements
              .filter((el) => !el.locked && el.visible !== false)
              .map((el) => el.id);
            setSelectedElementIds(allUnlockedIds);
          }
          break;
        case 'Escape':
          if (contextMenu) setContextMenu(null);
          saveContent(true);
          setSelectedElementIds([]);
          break;
        case 'c':
        case 'C':
          if (isMod) {
            e.preventDefault();
            copySelectedElements();
          }
          break;
        case 'v':
        case 'V':
          if (isMod) {
            e.preventDefault();
            let targetPos: { x: number; y: number } | undefined = undefined;
            let targetPageIdx: number = currentPageIndex;

            if (lastMousePosRef.current) {
              const { clientX, clientY } = lastMousePosRef.current;
              const curZoom = zoom || 1;

              const allPageContainers = Array.from(
                document.querySelectorAll('[data-page-index]')
              ) as HTMLElement[];
              for (const container of allPageContainers) {
                const pIdxAttr = container.getAttribute('data-page-index');
                const pageIdxNum = pIdxAttr ? parseInt(pIdxAttr, 10) : -1;
                const sheetEl = container.querySelector('.bg-white') as HTMLElement | null;
                if (sheetEl && pageIdxNum >= 0) {
                  const rect = sheetEl.getBoundingClientRect();
                  if (
                    clientX >= rect.left - 40 &&
                    clientX <= rect.right + 40 &&
                    clientY >= rect.top - 40 &&
                    clientY <= rect.bottom + 40
                  ) {
                    targetPageIdx = pageIdxNum;
                    targetPos = {
                      x: Math.max(0, Math.min(PAGE_WIDTH, (clientX - rect.left) / curZoom)),
                      y: Math.max(0, Math.min(PAGE_HEIGHT, (clientY - rect.top) / curZoom)),
                    };
                    break;
                  }
                }
              }

              if (!targetPos) {
                const pageEl = document.querySelector(
                  `[data-page-index="${currentPageIndex}"] .bg-white`
                ) as HTMLElement | null;
                if (pageEl) {
                  const rect = pageEl.getBoundingClientRect();
                  const pageX = (clientX - rect.left) / curZoom;
                  const pageY = (clientY - rect.top) / curZoom;
                  if (
                    pageX >= -100 &&
                    pageX <= PAGE_WIDTH + 100 &&
                    pageY >= -100 &&
                    pageY <= PAGE_HEIGHT + 100
                  ) {
                    targetPos = {
                      x: Math.max(0, Math.min(PAGE_WIDTH, pageX)),
                      y: Math.max(0, Math.min(PAGE_HEIGHT, pageY)),
                    };
                  }
                }
              }
            }

            pasteElements(targetPos, targetPageIdx);
          }
          break;
        case ']':
          if (isMod && selectedElementIds.length && currentPage?.elements) {
            e.preventDefault();
            pushHistory();
            const action = e.altKey ? 'bringToFront' : 'bringForward';
            const currentIds = currentPage.elements.map((el) => el.id);
            let newOrder = [...currentIds];
            if (action === 'bringToFront') {
              const unselected = currentIds.filter((id) => !selectedElementIds.includes(id));
              const selected = currentIds.filter((id) => selectedElementIds.includes(id));
              newOrder = [...unselected, ...selected];
            } else {
              for (let i = newOrder.length - 2; i >= 0; i--) {
                if (
                  selectedElementIds.includes(newOrder[i]) &&
                  !selectedElementIds.includes(newOrder[i + 1])
                ) {
                  const temp = newOrder[i];
                  newOrder[i] = newOrder[i + 1];
                  newOrder[i + 1] = temp;
                }
              }
            }
            useStore.getState().reorderElements(currentPageIndex, newOrder);
          }
          break;
        case '[':
          if (isMod && selectedElementIds.length && currentPage?.elements) {
            e.preventDefault();
            pushHistory();
            const action = e.altKey ? 'sendToBack' : 'sendBackward';
            const currentIds = currentPage.elements.map((el) => el.id);
            let newOrder = [...currentIds];
            if (action === 'sendToBack') {
              const unselected = currentIds.filter((id) => !selectedElementIds.includes(id));
              const selected = currentIds.filter((id) => selectedElementIds.includes(id));
              newOrder = [...selected, ...unselected];
            } else {
              for (let i = 1; i < newOrder.length; i++) {
                if (
                  selectedElementIds.includes(newOrder[i]) &&
                  !selectedElementIds.includes(newOrder[i - 1])
                ) {
                  const temp = newOrder[i];
                  newOrder[i] = newOrder[i - 1];
                  newOrder[i - 1] = temp;
                }
              }
            }
            useStore.getState().reorderElements(currentPageIndex, newOrder);
          }
          break;
      }
    },
    [
      selectedElementIds,
      currentPageIndex,
      nudgeElement,
      removeElement,
      duplicateElement,
      undo,
      redo,
      zoom,
      setZoom,
      setSelectedElementIds,
      groupSelected,
      ungroupSelected,
      toggleLock,
      currentPage?.elements,
      updateElement,
      pushHistory,
      catalog,
      removeHeaderElement,
      removeFooterElement,
      copySelectedElements,
      pasteElements,
      saveContent,
      contextMenu,
      setContextMenu,
      setEditingId,
      setEditConfig,
      lastMousePosRef,
    ]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};
