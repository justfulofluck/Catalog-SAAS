import { AppSlice, SystemAdminSlice } from '../types';
import { SystemTemplate, SystemSetting } from '../../types';
import { systemTemplatesApi, systemSettingsApi } from '../../client';

export const createSystemAdminSlice: AppSlice<SystemAdminSlice> = (set, get) => ({
  systemTemplates: [],
  editingSystemTemplate: null,
  systemSettings: null,

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
              type: p.type || (template.type === 'cover' ? 'cover' : 'interior'),
              elements: p.elements || [],
              backgroundColor: p.backgroundColor || '#ffffff',
            }))
          : [
              {
                id: 'p-1',
                pageNumber: 1,
                type: template.type === 'cover' ? 'cover' : 'interior',
                elements: [],
                backgroundColor: '#ffffff',
              },
            ];

      set({
        editingSystemTemplate: template,
        catalog: {
          ...get().catalog,
          name: template.name,
          pages: pages as any,
          hasHeader: template.type === 'header',
          hasFooter: template.type === 'footer',
          headerElements: template.type === 'header' ? template.pages_data?.[0]?.elements || [] : [],
          footerElements: template.type === 'footer' ? template.pages_data?.[0]?.elements || [] : [],
        },
        currentPageIndex: 0,
        currentView: 'editor',
      });
    } else {
      // Create new template in full visual canvas
      const newTemplateSkeleton: SystemTemplate = {
        id: 0,
        uuid: `tmp-${Date.now()}`,
        name: 'New Custom Template',
        category: 'General',
        type: 'cover',
        pages_data: [{ pageNumber: 1, type: 'cover', elements: [] }],
        is_active: true,
      };

      set({
        editingSystemTemplate: newTemplateSkeleton,
        catalog: {
          ...get().catalog,
          name: 'New Custom Template',
          pages: [{ id: 'p-1', pageNumber: 1, type: 'cover', elements: [], backgroundColor: '#ffffff' }],
          hasHeader: false,
          hasFooter: false,
          headerElements: [],
          footerElements: [],
        },
        currentPageIndex: 0,
        currentView: 'editor',
      });
    }
  },

  saveActiveTemplateFromEditor: async (options) => {
    const { editingSystemTemplate, catalog, createSystemTemplate, updateSystemTemplate } = get();
    const targetName = options?.name || editingSystemTemplate?.name || catalog.name || 'Custom Template';
    const targetCategory = options?.category || editingSystemTemplate?.category || 'General';
    const targetType = options?.type || editingSystemTemplate?.type || 'cover';

    const pagesData = catalog.pages.map((p) => ({
      pageNumber: p.pageNumber,
      type: p.type,
      elements: p.elements,
      backgroundColor: p.backgroundColor,
    }));

    if (editingSystemTemplate && editingSystemTemplate.id) {
      // Update existing
      const res = await updateSystemTemplate(editingSystemTemplate.id, {
        name: targetName,
        category: targetCategory,
        type: targetType,
        pages_data: pagesData,
      });
      return !!res;
    } else {
      // Create new
      const res = await createSystemTemplate({
        name: targetName,
        category: targetCategory,
        type: targetType,
        thumbnail: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=800',
        pages_data: pagesData,
        is_active: true,
      });
      if (res) {
        set({ editingSystemTemplate: res });
      }
      return !!res;
    }
  },

  fetchSystemSettings: async () => {
    try {
      const settings = await systemSettingsApi.get();
      set({ systemSettings: settings });
    } catch (err) {
      console.error('Failed to fetch system settings:', err);
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
