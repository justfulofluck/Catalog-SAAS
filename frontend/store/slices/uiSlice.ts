import { AppSlice, UiSlice } from '../types';
import { ToastNotification } from '../../types';
import { navigateToView } from '../../navigation/navigationBridge';

export const createUiSlice: AppSlice<UiSlice> = (set, get) => ({
  currentView: 'dashboard',
  isSidebarExpanded: true,
  uiTheme:
    typeof window !== 'undefined' && localStorage.getItem('catalogmakerr_ui_theme') === 'light'
      ? 'light'
      : 'dark',
  defaultCurrency: '₹',
  isLoading: false,
  error: null,

  activeTool: 'select',
  shouldRenderOutlines: true,
  editorTab: 'pages',

  toasts: [],
  confirmModal: null,
  colorPickerTarget: null,
  isProjectSettingsOpen: false,

  setView: (view) => {
    set({ currentView: view });
    navigateToView(view);
  },

  setSidebarExpanded: (expanded) => set({ isSidebarExpanded: expanded }),

  toggleUiTheme: () =>
    set((state) => {
      const nextTheme = state.uiTheme === 'light' ? 'dark' : 'light';
      if (typeof window !== 'undefined') {
        localStorage.setItem('catalogmakerr_ui_theme', nextTheme);
      }
      return { uiTheme: nextTheme };
    }),

  setDefaultCurrency: (currency) => set({ defaultCurrency: currency }),
  setActiveTool: (tool) => set({ activeTool: tool }),
  setShouldRenderOutlines: (shouldRender) => set({ shouldRenderOutlines: shouldRender }),
  setEditorTab: (tab) => set({ editorTab: tab }),

  showToast: (messageOrObj, type = 'success', title, duration = 5000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    let messageStr = '';
    let toastType = type;
    let toastTitle = title;
    let toastDuration = duration;

    if (typeof messageOrObj === 'object' && messageOrObj !== null) {
      messageStr = messageOrObj.message || '';
      toastType = messageOrObj.type || 'success';
      toastTitle = messageOrObj.title;
      toastDuration = messageOrObj.duration || 5000;
    } else {
      messageStr = String(messageOrObj);
    }

    const newToast: ToastNotification = {
      id,
      message: messageStr,
      type: toastType,
      title: toastTitle,
      duration: toastDuration,
    };
    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, toastDuration);
  },

  dismissToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  showConfirm: (options) =>
    set({
      confirmModal: {
        isOpen: true,
        title: options.title,
        message: options.message,
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        type: options.type || 'danger',
        onConfirm: options.onConfirm,
        onCancel: options.onCancel,
      },
    }),

  closeConfirm: () => set({ confirmModal: null }),

  openColorPicker: (target) =>
    set({
      colorPickerTarget: target,
      editorTab: 'colors',
      isSidebarExpanded: true,
    }),

  closeColorPicker: () =>
    set((state) => ({
      colorPickerTarget: null,
      editorTab: state.editorTab === 'colors' ? 'pages' : state.editorTab,
    })),

  setIsProjectSettingsOpen: (isOpen) => set({ isProjectSettingsOpen: isOpen }),

  updateProjectSettings: (updates) =>
    set((state) => {
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
          catalog: newCatalog,
        };
      }

      return {
        catalog: { ...newCatalog, updatedAt: new Date().toISOString() },
      };
    }),
});
