import { AppSlice, SubscriptionSlice } from '../types';

export const createSubscriptionSlice: AppSlice<SubscriptionSlice> = (set, get) => ({
  plans: [],
  allSubscriptions: [],

  fetchPlans: async () => {
    const { subscriptionApi } = await import('../../client');
    try {
      const response = await subscriptionApi.getPlans();
      const data = (response as any).data || response;
      set({ plans: Array.isArray(data) ? data : [] });
    } catch (error) {
      console.error('Failed to fetch plans', error);
    }
  },

  updateSubscription: async (planSlug: string) => {
    const { subscriptionApi } = await import('../../client');
    try {
      const response = await subscriptionApi.updatePlan({ plan_slug: planSlug });
      const data = (response as any).data || response;

      // Update local user state
      const { user, checkAuth } = get();
      if (user) {
        await checkAuth(); // Refresh user data to get new subscription fields
      }

      return { success: true, message: data.message };
    } catch (error: any) {
      console.error('Failed to update subscription', error);
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to process subscription',
      };
    }
  },

  fetchAllSubscriptions: async () => {
    const { subscriptionApi } = await import('../../client');
    try {
      const response = await subscriptionApi.adminGetAllSubscriptions();
      const data = (response as any).data || response;
      set({ allSubscriptions: Array.isArray(data) ? data : [] });
    } catch (error) {
      console.error('Failed to fetch all subscriptions', error);
      set({ error: 'Failed to fetch subscriptions. Please verify admin permissions.' });
    }
  },

  createAdminPlan: async (data: Partial<SubscriptionPlan>) => {
    const { subscriptionApi } = await import('../../client');
    try {
      await subscriptionApi.createPlan(data);
      await get().fetchPlans();
      get().showToast('Subscription plan created successfully!', 'success');
      return { success: true };
    } catch (error: any) {
      console.error('Failed to create plan', error);
      const errMsg = error.response?.data?.detail || error.response?.data?.error || 'Failed to create subscription plan';
      get().showToast(errMsg, 'error');
      return { success: false, message: errMsg };
    }
  },

  updateAdminPlan: async (id: string | number, data: Partial<SubscriptionPlan>) => {
    const { subscriptionApi } = await import('../../client');
    try {
      await subscriptionApi.updatePlanDetails(id, data);
      await get().fetchPlans();
      get().showToast('Subscription plan updated successfully!', 'success');
      return { success: true };
    } catch (error: any) {
      console.error('Failed to update plan', error);
      const errMsg = error.response?.data?.detail || error.response?.data?.error || 'Failed to update subscription plan';
      get().showToast(errMsg, 'error');
      return { success: false, message: errMsg };
    }
  },

  deleteAdminPlan: async (id: string | number) => {
    const { subscriptionApi } = await import('../../client');
    try {
      await subscriptionApi.deletePlan(id);
      await get().fetchPlans();
      get().showToast('Subscription plan deleted successfully!', 'success');
      return { success: true };
    } catch (error: any) {
      console.error('Failed to delete plan', error);
      const errMsg = error.response?.data?.detail || error.response?.data?.error || 'Failed to delete subscription plan';
      get().showToast(errMsg, 'error');
      return { success: false, message: errMsg };
    }
  },
});
