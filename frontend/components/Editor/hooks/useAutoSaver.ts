import { useEffect, useRef } from 'react';
import { useStore } from '../../../store/useStore';
import { Catalog } from '../../../types';

/**
 * Custom hook providing 1.2s debounced auto-save on any catalog change
 * and emergency synchronous save on window beforeunload.
 */
export const useAutoSaver = (catalog: Catalog) => {
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialMountRef = useRef(true);
  const isAutoSavingRef = useRef(false);

  useEffect(() => {
    // Skip auto-save on initial component mount
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }

    const store = useStore.getState();
    store.setSaveStatus('unsaved');

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(async () => {
      if (isAutoSavingRef.current) return;
      isAutoSavingRef.current = true;
      try {
        const currentStore = useStore.getState();
        if (currentStore.editingSystemTemplate) {
          await currentStore.saveActiveTemplateFromEditor();
        } else {
          await currentStore.saveCatalog();
        }
      } catch (err) {
        console.warn('Auto-save encountered an error:', err);
      } finally {
        isAutoSavingRef.current = false;
      }
    }, 1200);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [
    catalog.updatedAt,
    catalog.pages,
    catalog.name,
    catalog.backgroundColor,
    catalog.headerElements,
    catalog.footerElements,
    catalog.gridCols,
    catalog.gridRows,
    catalog.gridSpacing,
    catalog.gridPadding,
    catalog.hasHeader,
    catalog.hasFooter,
    catalog.marginTop,
    catalog.marginBottom,
    catalog.marginLeft,
    catalog.marginRight,
  ]);

  // Save immediately on page unload if there are pending unsaved changes
  useEffect(() => {
    const handleBeforeUnload = () => {
      const store = useStore.getState();
      if (store.saveStatus === 'unsaved') {
        if (store.editingSystemTemplate) {
          store.saveActiveTemplateFromEditor().catch(() => {});
        } else {
          store.saveCatalog().catch(() => {});
        }
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);
};
