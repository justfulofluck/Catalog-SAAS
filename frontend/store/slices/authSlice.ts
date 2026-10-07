import { AppSlice, AuthSlice, User } from '../types';
import { authApi } from '../../client';

export const createAuthSlice: AppSlice<AuthSlice> = (set, get) => ({
  user: null,
  isAuthenticated: false,
  isAdminAuthenticated: false,
  registeredUsers: [],

  login: async (email, username, password) => {
    set({ isLoading: true, error: null });
    // Clear any stale tokens before attempting a new login
    localStorage.removeItem('cs_access_token');
    localStorage.removeItem('cs_refresh_token');
    sessionStorage.removeItem('cs_session');

    try {
      const payload: any = { password };
      if (email) {
        payload.email = email;
        payload.username = email;
      }
      if (username) payload.username = username;

      const response: any = await authApi.login(payload);
      const token = response?.access || response?.access_token || response?.data?.access;
      const refreshToken = response?.refresh || response?.refresh_token || response?.data?.refresh;
      if (token) {
        localStorage.setItem('cs_access_token', token);
      }
      if (refreshToken) {
        localStorage.setItem('cs_refresh_token', refreshToken);
      }

      // 2. Fetch User Details - use returned user if present, or fetch
      let userData: any = response?.user;
      if (!userData) {
        try {
          userData = await authApi.user();
        } catch (e) {
          console.warn('Could not fetch extra user details, proceeding with token profile', e);
        }
      }

      // 3. Check role
      const isStaff = !!(userData?.is_staff || userData?.is_superuser);
      const userObj: User = {
        id: userData?.id || `u-${Date.now()}`,
        name: userData?.name || 'User',
        email: userData?.email || email || '',
        role: isStaff ? 'admin' : 'user',
        status: 'active',
        joinedAt: new Date().toISOString(),
        businessName: userData?.business_name,
        subscription_plan: userData?.subscription_plan,
        subscription_end_date: userData?.subscription_end_date,
        subscription_features: userData?.subscription_features,
      };

      set({
        isAuthenticated: true,
        isAdminAuthenticated: isStaff,
        user: userObj,
        currentView: isStaff ? 'admin-dashboard' : 'dashboard',
        editorTab: 'pages',
        isLoading: false,
        error: null,
      });
      get().setView(isStaff ? 'admin-dashboard' : 'dashboard');

      sessionStorage.setItem('cs_session', '1');

      // Fetch data on login
      get().fetchProducts();
      get().fetchCategories();
      get().fetchCatalogs();
      get().fetchMedia();
      get().fetchSystemTemplates();
      if (userObj.role === 'admin') get().fetchUsers();
    } catch (error: any) {
      let errorMessage =
        error.response?.data?.error ||
        error.response?.data?.detail ||
        error.response?.data?.non_field_errors?.[0] ||
        (typeof error.response?.data === 'string' ? error.response.data : null) ||
        error.message ||
        'Login failed';
      if (typeof errorMessage === 'string' && errorMessage.includes('Unable to log in with provided credentials')) {
        set({ error: 'This user does not exist or password is incorrect. New here? Create an account.', isLoading: false });
      } else {
        set({ error: String(errorMessage), isLoading: false });
      }
      throw error;
    }
  },

  adminLogin: async (email, username, password) => {
    set({ isLoading: true, error: null });
    // Clear any stale tokens before attempting admin login
    localStorage.removeItem('cs_access_token');
    localStorage.removeItem('cs_refresh_token');
    sessionStorage.removeItem('cs_session');

    try {
      // 1. Authenticate
      const payload: any = { password: password || 'admin123' };
      if (email) {
        payload.email = email;
        payload.username = email;
      }
      if (username) payload.username = username;

      const response: any = await authApi.login(payload);
      const token = response?.access || response?.access_token || response?.data?.access;
      const refreshToken = response?.refresh || response?.refresh_token || response?.data?.refresh;
      if (token) {
        localStorage.setItem('cs_access_token', token);
      }
      if (refreshToken) {
        localStorage.setItem('cs_refresh_token', refreshToken);
      }

      // 2. Fetch User
      const user = await authApi.user();
      console.log('Admin Login User Check:', user);
      console.log('Is Staff:', (user as any).is_staff, 'Is Superuser:', (user as any).is_superuser);

      // 3. Enforce Admin Role
      if (!(user as any).is_staff && !(user as any).is_superuser) {
        localStorage.removeItem('cs_access_token');
        localStorage.removeItem('cs_refresh_token');
        await authApi.logout();
        set({ isLoading: false, error: 'Access Denied. Authorized personnel only.' });
        return;
      }

      set({
        isAdminAuthenticated: true,
        user: {
          id: (user as any).id,
          name: (user as any).name || 'Admin',
          email: (user as any).email,
          role: 'admin',
          status: 'active',
          joinedAt: new Date().toISOString(),
        },
        currentView: 'admin-dashboard',
        isLoading: false,
        error: null,
      });

      // Fetch data for admin
      get().fetchUsers();
      get().fetchSystemTemplates();
      get().fetchAllSubscriptions();
      get().setView('admin-dashboard');
    } catch (error: any) {
      set({ error: error.response?.data?.non_field_errors?.[0] || 'Admin login failed', isLoading: false });
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch (e) {
      console.warn('Logout request completed:', e);
    }

    sessionStorage.removeItem('cs_session');
    sessionStorage.removeItem('cs_editing_template');
    localStorage.removeItem('cs_access_token');
    localStorage.removeItem('cs_refresh_token');

    set({
      isAuthenticated: false,
      isAdminAuthenticated: false,
      user: null,
      currentView: 'login',
      editingSystemTemplate: null,
      savedCatalogs: [],
      products: [],
      categories: [],
      mediaItems: [],
    });
    get().setView('login');
  },

  updateUser: (updates) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),

  fetchUsers: async () => {
    try {
      const response = await authApi.getAllUsers();
      const data = (response as any).data || response;
      const mappedUsers = (Array.isArray(data) ? data : []).map((u: any) => ({
        ...u,
        role: u.is_staff ? 'admin' : 'user',
        status: u.is_active ? 'active' : 'suspended',
        joinedAt: u.date_joined || new Date().toISOString(),
        businessName: u.business_name,
      }));
      set({ registeredUsers: mappedUsers });
    } catch (error) {
      console.error('Failed to fetch users', error);
      set({ error: 'Failed to fetch user accounts. Please check admin permissions.' });
    }
  },

  updateUserAdmin: async (id: string | number, data: any) => {
    try {
      await authApi.updateUserAdmin(id, data);
      await get().fetchUsers();
      get().showToast('User updated successfully!', 'success');
      return { success: true };
    } catch (error: any) {
      console.error('Failed to update user', error);
      const errMsg = error.response?.data?.detail || error.response?.data?.error || 'Failed to update user';
      get().showToast(errMsg, 'error');
      return { success: false, message: errMsg };
    }
  },

  deleteUserAdmin: async (id: string | number) => {
    try {
      await authApi.deleteUserAdmin(id);
      await get().fetchUsers();
      get().showToast('User deleted successfully!', 'success');
      return { success: true };
    } catch (error: any) {
      console.error('Failed to delete user', error);
      const errMsg = error.response?.data?.detail || error.response?.data?.error || 'Failed to delete user';
      get().showToast(errMsg, 'error');
      return { success: false, message: errMsg };
    }
  },

  checkAuth: async () => {
    // Only attempt auth check if a stored token exists; don't spam 401 when unauthenticated
    const token = localStorage.getItem('cs_access_token');
    const refreshToken = localStorage.getItem('cs_refresh_token');
    if (!token && !refreshToken) {
      set({
        isAuthenticated: false,
        isAdminAuthenticated: false,
        user: null,
      });
      return;
    }

    try {
      const user: any = await authApi.user();

      const isStaff = user.is_staff || user.is_superuser;

      const userObj: User = {
        id: user.id,
        name: user.name || 'User',
        email: user.email,
        role: isStaff ? 'admin' : 'user',
        status: 'active',
        joinedAt: new Date().toISOString(),
        businessId: user.business_id,
        businessName: user.business_name,
        subscription_plan: user.subscription_plan,
        subscription_end_date: user.subscription_end_date,
        subscription_features: user.subscription_features,
      };

      if (isStaff) {
        set({
          isAdminAuthenticated: true,
          isAuthenticated: true,
          user: userObj,
        });
        get().fetchProducts();
        get().fetchCategories();
        get().fetchUsers();
        get().fetchCatalogs();
        get().fetchMedia();
        get().fetchAdminAssets();
        get().fetchSystemTemplates();

        if (typeof window !== 'undefined' && window.location.pathname === '/editor') {
          try {
            const savedTplStr = sessionStorage.getItem('cs_editing_template');
            if (savedTplStr) {
              const savedTpl = JSON.parse(savedTplStr);
              if (savedTpl) {
                get().openTemplateInVisualEditor(savedTpl);
              }
            }
          } catch (e) {
            console.warn('Could not restore template from session:', e);
          }
        }
      } else {
        set({
          isAuthenticated: true,
          isAdminAuthenticated: false,
          user: userObj,
        });
        get().fetchProducts();
        get().fetchCategories();
        get().fetchCatalogs();
        get().fetchMedia();
        get().fetchSystemTemplates();
      }
    } catch (error) {
      sessionStorage.removeItem('cs_session');
      localStorage.removeItem('cs_access_token');
      localStorage.removeItem('cs_refresh_token');
      set({ isAuthenticated: false, isAdminAuthenticated: false, user: null });
    }
  },
});
