import { create } from 'zustand';
import { StoreState, User, View } from './types';
import { createAuthSlice } from './slices/authSlice';
import { createSubscriptionSlice } from './slices/subscriptionSlice';
import { createProductsSlice } from './slices/productsSlice';
import { createMediaSlice } from './slices/mediaSlice';
import { createSystemAdminSlice } from './slices/systemAdminSlice';
import { createUiSlice } from './slices/uiSlice';
import { createHistorySlice } from './slices/historySlice';
import { createElementsSlice } from './slices/elementsSlice';
import { createCropSlice } from './slices/cropSlice';
import { createHeaderFooterSlice } from './slices/headerFooterSlice';
import { createCatalogSlice } from './slices/catalogSlice';
import { createGridStudioSlice } from './slices/gridStudioSlice';

export type { User, View, StoreState };

export const useStore = create<StoreState>()((...a) => ({
  ...createAuthSlice(...a),
  ...createSubscriptionSlice(...a),
  ...createProductsSlice(...a),
  ...createMediaSlice(...a),
  ...createSystemAdminSlice(...a),
  ...createUiSlice(...a),
  ...createHistorySlice(...a),
  ...createElementsSlice(...a),
  ...createCropSlice(...a),
  ...createHeaderFooterSlice(...a),
  ...createCatalogSlice(...a),
  ...createGridStudioSlice(...a),
}));
