import axios from 'axios';
import { Product, Category, Catalog, MediaItem } from './types';

// Create Axios instance
const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Important for cookies (JWT & CSRF)
    xsrfCookieName: 'csrftoken',
    xsrfHeaderName: 'X-CSRFToken',
});

// Response interceptor to handle data extraction
api.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Auth API
export const authApi = {
    login: (credentials: any) => api.post('/auth/login/', credentials),
    logout: () => api.post('/auth/logout/'),
    forceLogout: () => api.post('/users/force-logout/'),
    user: () => api.get('/auth/user/'),
    register: (data: any) => api.post('/auth/registration/', data),
    requestOtp: (email: string) => api.post('/auth/password-reset/otp/request/', { email }),
    verifyOtpAndReset: (data: any) => api.post('/auth/password-reset/otp/confirm/', data),
    updateUser: (data: any) => api.patch('/auth/user/', data),
    getAllUsers: () => api.get('/users/'),
};

export const subscriptionApi = {
    getPlans: () => api.get('/plans/'),
    updatePlan: (data: { plan_slug: string }) => api.post('/subscriptions/update/', data),
    adminGetAllSubscriptions: () => api.get('/admin/subscriptions/'),
};

export const businessTemplatesApi = {
    getAll: () => api.get('/business-templates/'),
    create: (data: any) => api.post('/business-templates/', data),
    update: (id: string, data: any) => api.patch(`/business-templates/${id}/`, data),
    delete: (id: string) => api.delete(`/business-templates/${id}/`),
};

// Products API
export const productsApi = {
    getAll: () => api.get<Product[]>('/products/'),
    get: (id: string) => api.get<Product>(`/products/${id}/`),
    create: (data: any) => api.post<Product>('/products/', data),
    update: (id: string, data: any) => api.patch<Product>(`/products/${id}/`, data),
    delete: (id: string) => api.delete(`/products/${id}/`),
};

// Categories API
export const categoriesApi = {
    getAll: () => api.get<Category[]>('/categories/'),
    get: (id: string) => api.get<Category>(`/categories/${id}/`),
    create: (data: any) => api.post<Category>('/categories/', data),
    update: (id: string, data: any) => api.patch<Category>(`/categories/${id}/`, data),
    delete: (id: string) => api.delete(`/categories/${id}/`),
};

// Catalogs API
export const catalogsApi = {
    getAll: () => api.get<Catalog[]>('/catalogs/'),
    get: (id: string) => api.get<Catalog>(`/catalogs/${id}/`),
    create: (data: any) => api.post<Catalog>('/catalogs/', data),
    update: (id: string, data: any) => api.patch<Catalog>(`/catalogs/${id}/`, data),
    delete: (id: string) => api.delete(`/catalogs/${id}/`),
    savePage: (catalogId: string, pageData: any) => api.post(`/catalogs/${catalogId}/save_page/`, pageData),
};

// Media API
export const mediaApi = {
    getAll: () => api.get<MediaItem[]>('/media/'),
    upload: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post<MediaItem>('/media/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    delete: (id: string) => api.delete(`/media/${id}/`),
};

export default api;
