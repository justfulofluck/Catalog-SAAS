import { NavigateFunction } from 'react-router-dom';
import { View } from '../store/types';

export const VIEW_TO_PATH: Record<View, string> = {
  login: '/login',
  dashboard: '/',
  editor: '/editor',
  'products-list': '/inventory/products',
  'create-product': '/inventory/products/create',
  'edit-product': '/inventory/products/edit',
  'category-list': '/inventory/categories',
  'create-category': '/inventory/categories/create',
  'edit-category': '/inventory/categories/edit',
  'media-library': '/inventory/media',
  'catalog-setup': '/catalog-setup',
  'catalog-products': '/catalog-products',
  'your-work': '/your-work',
  publish: '/publish',
  pricing: '/pricing',
  settings: '/settings',
  'admin-login': '/admin',
  'admin-dashboard': '/admin/dashboard',
  'business-selection': '/onboarding',
  'business-onboarding': '/onboarding',
  'public-viewer': '/viewer',
};

export const PATH_TO_VIEW: Record<string, View> = {
  '/login': 'login',
  '/': 'dashboard',
  '/dashboard': 'dashboard',
  '/editor': 'editor',
  '/inventory/products': 'products-list',
  '/inventory/products/create': 'create-product',
  '/inventory/products/edit': 'edit-product',
  '/inventory/categories': 'category-list',
  '/inventory/categories/create': 'create-category',
  '/inventory/categories/edit': 'edit-category',
  '/inventory/media': 'media-library',
  '/catalog-setup': 'catalog-setup',
  '/catalog-products': 'catalog-products',
  '/your-work': 'your-work',
  '/publish': 'publish',
  '/pricing': 'pricing',
  '/settings': 'settings',
  '/admin': 'admin-login',
  '/admin/dashboard': 'admin-dashboard',
  '/onboarding': 'business-selection',
  '/viewer': 'public-viewer',
};

let globalNavigate: NavigateFunction | null = null;

export const setGlobalNavigate = (navigate: NavigateFunction | null) => {
  globalNavigate = navigate;
};

export const getGlobalNavigate = (): NavigateFunction | null => {
  return globalNavigate;
};

export const navigateToView = (view: View) => {
  const targetPath = VIEW_TO_PATH[view];
  if (targetPath) {
    if (globalNavigate) {
      globalNavigate(targetPath);
    } else if (typeof window !== 'undefined' && window.location.pathname !== targetPath) {
      window.history.pushState({ view }, '', targetPath);
    }
  }
};
