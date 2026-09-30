import { AppSlice, MediaSlice, MediaItem } from '../types';
import { adminAssetsApi } from '../../client';

export const createMediaSlice: AppSlice<MediaSlice> = (set, get) => ({
  mediaItems: [],
  adminAssets: [],

  fetchMedia: async () => {
    const { mediaApi } = await import('../../client');
    try {
      const response = await mediaApi.getAll();
      const items = (response as any).data || response;
      const mappedItems = items.map((m: any) => ({
        id: String(m.id),
        name: m.name,
        type: 'image',
        url: m.url,
        createdAt: m.created_at || new Date().toISOString(),
        size: m.size_bytes ? `${(m.size_bytes / 1024).toFixed(1)} KB` : '0 KB',
      }));
      set({ mediaItems: mappedItems });
    } catch (error) {
      console.error('Failed to fetch media', error);
    }
  },

  fetchAdminAssets: async () => {
    try {
      const response = await adminAssetsApi.getAll();
      const assets = Array.isArray(response) ? response : (response as any)?.data || [];
      set({ adminAssets: assets });
    } catch (error) {
      console.error('Error fetching admin assets:', error);
    }
  },

  addMedia: async (file: File): Promise<MediaItem> => {
    try {
      const { mediaApi } = await import('../../client');
      const response = await mediaApi.upload(file);
      const m = (response as any).data || response;
      const newItem: MediaItem = {
        id: String(m.id || Date.now()),
        name: m.name || file.name,
        type: m.type || 'image',
        url: m.url || '',
        createdAt: m.created_at || new Date().toISOString(),
        size: m.size_bytes ? `${(m.size_bytes / 1024).toFixed(1)} KB` : `${(file.size / 1024).toFixed(1)} KB`,
      };
      set((state) => ({
        mediaItems: [newItem, ...state.mediaItems],
      }));
      return newItem;
    } catch (error) {
      console.warn('Backend upload failed, saving locally in store:', error);
      return new Promise<MediaItem>((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const localUrl = (ev.target?.result as string) || '';
          const localItem: MediaItem = {
            id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            name: file.name,
            type: 'image',
            url: localUrl,
            createdAt: new Date().toISOString(),
            size: `${(file.size / 1024).toFixed(1)} KB`,
          };
          set((state) => ({
            mediaItems: [localItem, ...state.mediaItems],
          }));
          resolve(localItem);
        };
        reader.readAsDataURL(file);
      });
    }
  },

  removeMedia: async (id: string) => {
    const catMatch = /^cat-(\d+)-\d+$/.exec(id);
    if (catMatch) {
      const { categoriesApi } = await import('../../client');
      await categoriesApi.update(catMatch[1], { thumbnail: null });
      get().fetchCategories();
      return;
    }
    const prodMatch = /^prod-(\d+)-\d+$/.exec(id);
    if (prodMatch) {
      const { productsApi } = await import('../../client');
      await productsApi.update(prodMatch[1], { image: null });
      get().fetchProducts();
      return;
    }
    const { mediaApi } = await import('../../client');
    await mediaApi.delete(id);
    set((state) => ({
      mediaItems: state.mediaItems.filter((m) => String(m.id) !== String(id)),
    }));
  },

  removeMediaBatch: async (ids: string[]) => {
    const catIds = new Set<string>();
    const prodIds = new Set<string>();
    const mediaIds: string[] = [];
    for (const id of ids) {
      const catMatch = /^cat-(\d+)-\d+$/.exec(id);
      const prodMatch = /^prod-(\d+)-\d+$/.exec(id);
      if (catMatch) catIds.add(catMatch[1]);
      else if (prodMatch) prodIds.add(prodMatch[1]);
      else mediaIds.push(String(id));
    }
    if (catIds.size) {
      const { categoriesApi } = await import('../../client');
      for (const cid of catIds) {
        await categoriesApi.update(cid, { thumbnail: null });
      }
      get().fetchCategories();
    }
    if (prodIds.size) {
      const { productsApi } = await import('../../client');
      for (const pid of prodIds) {
        await productsApi.update(pid, { image: null });
      }
      get().fetchProducts();
    }
    if (mediaIds.length) {
      const { mediaApi } = await import('../../client');
      for (const id of mediaIds) {
        await mediaApi.delete(id);
      }
      set((state) => ({
        mediaItems: state.mediaItems.filter((m) => !mediaIds.includes(String(m.id))),
      }));
    }
  },
});
