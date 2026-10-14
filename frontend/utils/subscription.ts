import type { User } from '../store/types';

/**
 * True when the user's subscription/trial has lapsed and the workspace
 * should be locked to read-only (view only, no edits/exports/publishing).
 * Admins and users without a subscription record are never read-only.
 */
export const isSubscriptionReadOnly = (user: User | null | undefined): boolean => {
  if (!user) return false;
  if (user.role === 'admin') return false;
  if (user.subscription_active === false) return true;
  if (user.subscription_expired === true) return true;
  if (user.subscription_status === 'expired' || user.subscription_status === 'suspended') return true;
  return false;
};

export const subscriptionStatusLabel = (
  status?: string
): { label: string; tone: 'green' | 'amber' | 'red' | 'slate' } => {
  switch (status) {
    case 'trial':
      return { label: 'Trial', tone: 'amber' };
    case 'expiring':
      return { label: 'Expiring', tone: 'amber' };
    case 'expired':
      return { label: 'Expired', tone: 'red' };
    case 'suspended':
      return { label: 'Suspended', tone: 'red' };
    case 'active':
      return { label: 'Active', tone: 'green' };
    default:
      return { label: status ? status : 'Unknown', tone: 'slate' };
  }
};
