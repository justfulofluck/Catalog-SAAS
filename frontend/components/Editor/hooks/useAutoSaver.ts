import { useEffect, useRef } from 'react';
import { useStore } from '../../../store/useStore';
import { Catalog } from '../../../types';

/**
 * Tracks catalog changes and sets saveStatus to 'unsaved'.
 * Background auto-save on every change has been disabled per user request:
 * The catalog now only persists to the server when the user explicitly clicks the Save button.
 */
export const useAutoSaver = (catalog: Catalog) => {
  const isInitialMountRef = useRef(true);

  useEffect(() => {
    // Skip on initial component mount
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }

    const store = useStore.getState();
    // Mark changes as unsaved
    store.setSaveStatus('unsaved');
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

  // Prompt before unload if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const store = useStore.getState();
      if (store.saveStatus === 'unsaved' && !store.editingSystemTemplate && !store.isAdminAuthenticated) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);
};
