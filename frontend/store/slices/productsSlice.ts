import { AppSlice, ProductsSlice } from '../types';
import { Product, Category } from '../../types';
import { authApi } from '../../client';

export const createProductsSlice: AppSlice<ProductsSlice> = (set, get) => ({
  products: [],
  categories: [],
  activeCategoryId: null,
  editingProductId: null,
  editingCategoryId: null,
  creatingSubcategoryParentId: null,
  isCreateProductModalOpen: false,
  createProductInitialCategoryId: null,

  fetchProducts: async () => {
    const { productsApi } = await import('../../client');
    try {
      const response = await productsApi.getAll();
      const data = (response as any).data || response;
      const mappedProducts = Array.isArray(data)
        ? data.map((p: any) => {
            const cf = p.custom_fields || {};
            const imagesList = Array.isArray(cf.gallery) ? cf.gallery : p.images || [];
            const directImg =
              p.image ||
              (imagesList.length > 0 ? imagesList[0] : '') ||
              cf.image ||
              cf.main_image ||
              cf.photo ||
              '';
            return {
              ...p,
              image: directImg,
              images: imagesList,
              price: Number(p.price) || 0,
              categoryId: p.category ? String(p.category) : undefined,
              customFields: cf,
            };
          })
        : [];
      set({ products: mappedProducts });
    } catch (error) {
      console.error('Failed to fetch products', error);
    }
  },

  fetchCategories: async () => {
    const { categoriesApi } = await import('../../client');
    try {
      const response = await categoriesApi.getAll();
      const data = (response as any).data || response;
      const mappedCategories = Array.isArray(data)
        ? data.map((c: any) => ({
            ...c,
            id: String(c.id),
            parent: c.parent ? String(c.parent) : null,
            images: Array.isArray(c.images) ? c.images : c.thumbnail ? [c.thumbnail] : [],
            customSchema: c.custom_schema || c.customSchema || [],
          }))
        : [];
      set({ categories: mappedCategories });
    } catch (error) {
      console.error('Failed to fetch categories', error);
    }
  },

  completeOnboarding: async (businessId, businessName) => {
    set({ isLoading: true });
    try {
      const updatedUser = await authApi.updateUser({
        business_id: businessId,
        business_name: businessName,
      });

      set((state) => ({
        user: {
          ...state.user!,
          businessId: (updatedUser as any).business_id,
          businessName: (updatedUser as any).business_name,
        },
        currentView: 'dashboard',
        isLoading: false,
      }));
    } catch (error) {
      console.error('Failed to save business details', error);
      set({ error: 'Failed to save business details. Please try again.', isLoading: false });
    }
  },

  addProduct: async (product) => {
    const { productsApi } = await import('../../client');
    try {
      const { id, categoryId, customFields, images, ...rest } = product;
      const cf = { ...(customFields || {}) };
      if (images && images.length > 0) {
        cf.gallery = images;
      }
      const payload = {
        ...rest,
        category: categoryId ? String(categoryId) : null,
        price: parseFloat(String(product.price)) || 0,
        custom_fields: cf,
      };

      const response = await productsApi.create(payload);
      const data = (response as any).data || response;
      const respCf = data.custom_fields || {};
      const imgList = Array.isArray(respCf.gallery) ? respCf.gallery : images || [];
      const directImg =
        data.image ||
        (imgList.length > 0 ? imgList[0] : '') ||
        product.image ||
        respCf.image ||
        respCf.main_image ||
        '';
      const mappedProduct = {
        ...data,
        image: directImg,
        images: imgList,
        price: Number(data.price) || 0,
        categoryId: data.category ? String(data.category) : undefined,
        customFields: respCf,
      };
      set((state) => ({
        products: [mappedProduct, ...state.products],
      }));
    } catch (error: any) {
      console.error('Failed to add product', error.response?.data || error);
      const errMsg = error.response?.data?.error || error.response?.data?.detail || 'Failed to add product';
      get().showToast(errMsg, 'error');
      set({ error: errMsg });
    }
  },

  updateProduct: async (id, updates) => {
    const { productsApi } = await import('../../client');
    try {
      const payload: any = { ...updates };
      if (updates.categoryId !== undefined) {
        payload.category = updates.categoryId ? String(updates.categoryId) : null;
        delete payload.categoryId;
      }
      if (updates.price !== undefined) {
        payload.price = parseFloat(String(updates.price)) || 0;
      }
      const cf = { ...(updates.customFields || {}) };
      if (updates.images !== undefined) {
        cf.gallery = updates.images;
        delete payload.images;
      }
      if (Object.keys(cf).length > 0 || updates.customFields !== undefined) {
        payload.custom_fields = cf;
        delete payload.customFields;
      }

      const response = await productsApi.update(id, payload);
      const data = (response as any).data || response;
      const respCf = data.custom_fields || {};
      const imgList = Array.isArray(respCf.gallery) ? respCf.gallery : updates.images || [];
      const directImg =
        data.image ||
        (imgList.length > 0 ? imgList[0] : '') ||
        updates.image ||
        respCf.image ||
        respCf.main_image ||
        '';
      const mappedProduct = {
        ...data,
        image: directImg,
        images: imgList,
        price: Number(data.price) || 0,
        categoryId: data.category ? String(data.category) : undefined,
        customFields: respCf,
      };

      set((state) => {
        const updatedProducts = state.products.map((p) => (p.id === id ? mappedProduct : p));
        const updatedPages = state.catalog.pages.map((page) => ({
          ...page,
          elements: page.elements.map((el) => {
            if (el.productId === id) {
              if (el.type === 'text') {
                if (el.id.includes('txt-n')) return { ...el, text: updates.name || el.text };
                if (el.id.includes('txt-p')) {
                  const p = updatedProducts.find((prod) => prod.id === id)!;
                  const priceStr =
                    typeof p.price === 'number' ? p.price.toFixed(2) : (Number(p.price) || 0).toFixed(2);
                  return { ...el, text: `${p.currency || 'USD'}${priceStr}` };
                }
              }
              if (el.type === 'image' && updates.image) return { ...el, src: updates.image };
            }
            return el;
          }),
        }));

        return {
          products: updatedProducts,
          catalog: { ...state.catalog, pages: updatedPages },
        };
      });
    } catch (error: any) {
      console.error('Failed to update product', error.response?.data || error);
      set({ error: 'Failed to update product' });
    }
  },

  removeProduct: async (id) => {
    const { productsApi } = await import('../../client');
    try {
      await productsApi.delete(id);
      set((state) => ({
        products: state.products.filter((p) => p.id !== id),
      }));
    } catch (error) {
      console.error('Failed to remove product', error);
      set({ error: 'Failed to remove product' });
    }
  },

  reorderProducts: (newOrderIds) =>
    set((state) => {
      // 1. Update Global Product List
      const remainingProducts = state.products.filter((p) => !newOrderIds.includes(p.id));
      const orderedInScope = newOrderIds.map((id) => state.products.find((p) => p.id === id)!);
      const updatedProducts = [...orderedInScope, ...remainingProducts];

      // 2. Identify Target Category
      const targetCategoryId = orderedInScope.length > 0 ? orderedInScope[0].categoryId : null;

      // 3. Universal Sync & Page Jump
      const newPages = [...state.catalog.pages];
      let newCurrentPageIndex = state.currentPageIndex;
      let foundFirstPage = false;

      newPages.forEach((page, index) => {
        const shouldSync = targetCategoryId && page.categoryId === targetCategoryId;

        if (shouldSync && (page.type === 'interior' || page.type === 'index')) {
          if (!foundFirstPage) {
            newCurrentPageIndex = index;
            foundFirstPage = true;
          }

          const productBlocks = page.elements.filter((el) => el.type === 'product-block');

          if (productBlocks.length > 0) {
            const sortedBlocks = [...productBlocks].sort((a, b) => {
              const yDiff = a.y - b.y;
              if (Math.abs(yDiff) > 10) return yDiff;
              return a.x - b.x;
            });

            const categoryProducts = updatedProducts.filter((p) => p.categoryId === targetCategoryId);

            const updatedElements = page.elements.map((el) => {
              const blockIndex = sortedBlocks.findIndex((b) => b.id === el.id);

              if (blockIndex !== -1 && blockIndex < categoryProducts.length) {
                return { ...el, productId: categoryProducts[blockIndex].id };
              }
              return el;
            });

            newPages[index] = { ...page, elements: updatedElements };
          }
        }
      });

      return {
        products: updatedProducts,
        catalog: { ...state.catalog, pages: newPages },
        currentPageIndex: newCurrentPageIndex,
      };
    }),

  addCategory: async (category) => {
    const { categoriesApi } = await import('../../client');
    try {
      const { id, productCount, parentName, customSchema, ...payload } = category;
      const requestPayload = {
        ...payload,
        custom_schema: customSchema || [],
      };

      const response = await categoriesApi.create(requestPayload);
      const data = (response as any).data || response;
      const mappedCategory = {
        ...data,
        id: String(data.id),
        parent: data.parent ? String(data.parent) : null,
        customSchema: data.custom_schema || data.customSchema || [],
      };
      set((state) => ({
        categories: [...state.categories, mappedCategory],
      }));
      get().fetchCategories();
    } catch (error: any) {
      console.error('Failed to add category', error.response?.data || error);
      set({ error: 'Failed to add category' });
    }
  },

  updateCategory: async (id, updates: any) => {
    const { categoriesApi } = await import('../../client');
    try {
      const { parentName, subcategories, productCount, customSchema, ...payload } = updates;
      const requestPayload: any = { ...payload };
      if (customSchema !== undefined) {
        requestPayload.custom_schema = customSchema;
      }

      const response = await categoriesApi.update(id, requestPayload);
      const data = (response as any).data || response;
      const mappedCategory = {
        ...data,
        id: String(data.id),
        parent: data.parent ? String(data.parent) : null,
        customSchema: data.custom_schema || data.customSchema || [],
      };
      set((state) => ({
        categories: state.categories.map((c) => (c.id === id ? mappedCategory : c)),
      }));
      get().fetchCategories();
    } catch (error: any) {
      console.error('Failed to update category', error.response?.data || error);
      set({ error: 'Failed to update category' });
    }
  },

  removeCategory: async (id) => {
    const { categoriesApi } = await import('../../client');
    try {
      await categoriesApi.delete(id);
      set((state) => ({
        categories: state.categories.filter((c) => c.id !== id),
        products: state.products.map((p) => (p.categoryId === id ? { ...p, categoryId: undefined } : p)),
      }));
    } catch (error) {
      console.error('Failed to remove category', error);
      set({ error: 'Failed to remove category' });
    }
  },

  setActiveCategoryId: (id) => set({ activeCategoryId: id }),
  setSelectedCategoryId: (id) => set({ selectedCategoryId: id }),
  setEditingProductId: (id) => set({ editingProductId: id }),
  setEditingCategoryId: (id) => set({ editingCategoryId: id }),
  setCreatingSubcategoryParentId: (id) => set({ creatingSubcategoryParentId: id }),

  openCreateProductModal: (categoryId = null) =>
    set((state) => ({
      isCreateProductModalOpen: true,
      createProductInitialCategoryId: categoryId || state.activeCategoryId || null,
    })),

  closeCreateProductModal: () =>
    set({
      isCreateProductModalOpen: false,
      createProductInitialCategoryId: null,
    }),
});
