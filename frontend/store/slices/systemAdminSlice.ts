import { AppSlice, SystemAdminSlice } from '../types';
import { SystemTemplate, SystemSetting } from '../../types';
import { systemTemplatesApi, systemSettingsApi } from '../../client';

export const createSystemAdminSlice: AppSlice<SystemAdminSlice> = (set, get) => ({
  systemTemplates: [],
  editingSystemTemplate: null,
  systemSettings: null,

  isAdminHeaderDesignerOpen: false,
  editingAdminHeaderTemplate: null,
  setIsAdminHeaderDesignerOpen: (isOpen, template = null) =>
    set({
      isAdminHeaderDesignerOpen: isOpen,
      editingAdminHeaderTemplate: template,
    }),

  isAdminFooterDesignerOpen: false,
  editingAdminFooterTemplate: null,
  setIsAdminFooterDesignerOpen: (isOpen, template = null) =>
    set({
      isAdminFooterDesignerOpen: isOpen,
      editingAdminFooterTemplate: template,
    }),

  fetchSystemTemplates: async () => {
    try {
      const response = await systemTemplatesApi.getAll();
      const data = (response as any).data || response;
      const list = Array.isArray(data)
        ? data
        : Array.isArray((data as any)?.results)
        ? (data as any).results
        : [];
      set({ systemTemplates: list });
    } catch (error) {
      console.error('Failed to fetch system templates', error);
    }
  },

  createSystemTemplate: async (template) => {
    try {
      const response = await systemTemplatesApi.create(template);
      const created = (response as any).data || response;
      set((state) => ({ systemTemplates: [created, ...state.systemTemplates] }));
      return created;
    } catch (error) {
      console.error('Failed to create system template', error);
      return null;
    }
  },

  updateSystemTemplate: async (id, template) => {
    try {
      const response = await systemTemplatesApi.update(id, template);
      const updated = (response as any).data || response;
      set((state) => ({
        systemTemplates: state.systemTemplates.map((t) =>
          String(t.id) === String(id) || t.uuid === String(id) ? updated : t
        ),
      }));
      return updated;
    } catch (error) {
      console.error('Failed to update system template', error);
      return null;
    }
  },

  deleteSystemTemplate: async (id) => {
    try {
      await systemTemplatesApi.delete(id);
      set((state) => ({
        systemTemplates: state.systemTemplates.filter(
          (t) => String(t.id) !== String(id) && t.uuid !== String(id)
        ),
      }));
      return true;
    } catch (error) {
      console.error('Failed to delete system template', error);
      return false;
    }
  },

  openTemplateInVisualEditor: (template) => {
    if (template) {
      // Load existing template into live canvas
      const pages =
        template.pages_data && template.pages_data.length > 0
          ? template.pages_data.map((p: any, idx: number) => ({
              id: `p-${idx + 1}`,
              pageNumber: idx + 1,
              type: 'cover',
              elements: p.elements || [],
              backgroundColor: p.backgroundColor || '#ffffff',
            }))
          : [
              {
                id: 'p-1',
                pageNumber: 1,
                type: 'cover',
                elements: [],
                backgroundColor: '#ffffff',
              },
            ];

      try {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('cs_editing_template', JSON.stringify(template));
        }
      } catch (e) {}

      set({
        editingSystemTemplate: template,
        catalog: {
          ...get().catalog,
          name: template.name,
          pages: pages as any,
          hasHeader: false,
          hasFooter: false,
          headerElements: [],
          footerElements: [],
        },
        currentPageIndex: 0,
        editorTab: 'text',
        currentView: 'editor',
      });
    } else {
      // Create new Cover template in visual canvas
      const newTemplateSkeleton: SystemTemplate = {
        id: 0,
        uuid: `tmp-${Date.now()}`,
        name: 'New Cover Template',
        category: 'General',
        type: 'cover',
        description: '',
        pages_data: [{ pageNumber: 1, type: 'cover', elements: [] }],
        is_active: true,
      };

      try {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('cs_editing_template', JSON.stringify(newTemplateSkeleton));
        }
      } catch (e) {}

      set({
        editingSystemTemplate: newTemplateSkeleton,
        catalog: {
          ...get().catalog,
          name: 'New Cover Template',
          pages: [{ id: 'p-1', pageNumber: 1, type: 'cover', elements: [], backgroundColor: '#ffffff' }],
          hasHeader: false,
          hasFooter: false,
          headerElements: [],
          footerElements: [],
        },
        currentPageIndex: 0,
        editorTab: 'text',
        currentView: 'editor',
      });
    }
  },

  saveActiveTemplateFromEditor: async (options) => {
    const { editingSystemTemplate, catalog, createSystemTemplate, updateSystemTemplate, showToast } = get();
    const targetName = options?.name || editingSystemTemplate?.name || catalog.name || 'New Cover Blueprint';
    const targetCategory = options?.category || editingSystemTemplate?.category || 'General';
    const targetType = options?.type || editingSystemTemplate?.type || 'cover';
    const targetDescription = options?.description ?? editingSystemTemplate?.description ?? '';
    const targetIsActive = options?.is_active ?? editingSystemTemplate?.is_active ?? true;

    set({ saveStatus: 'saving' });

    const pagesData = catalog.pages.map((p) => ({
      pageNumber: p.pageNumber,
      type: 'cover',
      elements: p.elements,
      backgroundColor: p.backgroundColor,
    }));

    try {
      if (editingSystemTemplate && editingSystemTemplate.id) {
        // Update existing
        const res = await updateSystemTemplate(editingSystemTemplate.id, {
          name: targetName,
          category: targetCategory,
          type: targetType,
          description: targetDescription,
          is_active: targetIsActive,
          pages_data: pagesData,
        });
        if (res) {
          try {
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('cs_editing_template', JSON.stringify(res));
            }
          } catch (e) {}
          const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          set({ saveStatus: 'saved', lastSavedAt: timeStr });
          showToast('Cover Blueprint updated successfully!', 'success', 'Blueprint Saved');
        }
        return !!res;
      } else {
        // Create new
        const res = await createSystemTemplate({
          name: targetName,
          category: targetCategory,
          type: targetType,
          description: targetDescription,
          is_active: targetIsActive,
          thumbnail: options?.thumbnail || 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=800',
          pages_data: pagesData,
        });
        if (res) {
          const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          set({ editingSystemTemplate: res, saveStatus: 'saved', lastSavedAt: timeStr });
          try {
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('cs_editing_template', JSON.stringify(res));
            }
          } catch (e) {}
          showToast('Master Cover Blueprint published successfully!', 'success', 'Blueprint Created');
        }
        return !!res;
      }
    } catch (err) {
      set({ saveStatus: 'error' });
      throw err;
    }
  },

  fetchSystemSettings: async () => {
    try {
      const settings = await systemSettingsApi.get();
      if (settings) {
        set({ systemSettings: settings });
      }
    } catch (err) {
      console.warn('Could not fetch public system settings:', err);
    }
  },

  updateSystemSettings: async (updates: Partial<SystemSetting>) => {
    try {
      const updated = await systemSettingsApi.update(updates);
      set((state) => ({
        systemSettings: state.systemSettings ? { ...state.systemSettings, ...updated } : updated,
      }));
      get().showToast('System settings have been successfully updated.', 'success', 'Settings Saved');
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to update system settings.';
      get().showToast(msg, 'error', 'Update Failed');
      return false;
    }
  },

  changeAdminPassword: async (data: { current_password?: string; new_password: string }) => {
    try {
      const res = await systemSettingsApi.changeAdminPassword(data);
      get().showToast(res.message || 'Admin password updated successfully.', 'success', 'Password Updated');
      return { success: true, message: res.message || 'Password updated successfully.' };
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to update admin password.';
      get().showToast(msg, 'error', 'Error');
      return { success: false, message: msg };
    }
  },
});
