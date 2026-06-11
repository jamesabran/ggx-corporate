/**
 * Storefront mock data — store profile, publish status, and a placeholder for
 * order impact used by the unpublish warning. Scoped per account/subaccount.
 *
 * Storefront products come from Inventory (see docs/storefront_rules.md). Orders
 * are placeholders — no checkout build yet. Future BFF:
 * GET/PUT /accounts/:id/storefront, POST .../publish|unpublish.
 */

import type { ServiceTypeKey } from './serviceTypes';

export type StorefrontPublishStatus = 'draft' | 'published' | 'unpublished';

export interface StorefrontProfile {
  scopeAccountId: string;
  storeName: string;
  description: string;
  slug: string;
  logoUrl?: string;
  bannerUrl?: string;
  contactEmail: string;
  contactNumber: string;
  /** Delivery options offered to customers. */
  deliveryOptions: ServiceTypeKey[];
  publishStatus: StorefrontPublishStatus;
  /** Inventory product ids selected for the storefront. */
  productIds: string[];
}

/**
 * Pending-transaction impact for the unpublish warning. Backend-provided; the
 * frontend only presents it (never auto-cancels). See docs/storefront_rules.md.
 */
export interface OrderImpact {
  pendingUnpaidOrders: number;
  activeDeliveries: number;
}

// Demo seed — Acme Luzon has a storefront in draft (enabled, not yet published).
const profiles: Record<string, StorefrontProfile> = {
  'acme-luzon': {
    scopeAccountId: 'acme-luzon',
    storeName: 'Acme Luzon Shop',
    description: 'Curated essentials shipped fast across Luzon.',
    slug: 'acme-luzon',
    contactEmail: 'shop@acmeluzon.example',
    contactNumber: '+63 917 987 6543',
    deliveryOptions: ['standard', 'same_day'],
    publishStatus: 'draft',
    productIds: ['prod-1001', 'prod-1002'],
  },
};

const orderImpact: Record<string, OrderImpact> = {
  'acme-luzon': { pendingUnpaidOrders: 2, activeDeliveries: 5 },
};

export function getProfileForScope(scopeId: string | undefined): StorefrontProfile | null {
  if (!scopeId) return null;
  return profiles[scopeId] ?? null;
}

export function getOrderImpactForScope(scopeId: string | undefined): OrderImpact {
  if (!scopeId) return { pendingUnpaidOrders: 0, activeDeliveries: 0 };
  return orderImpact[scopeId] ?? { pendingUnpaidOrders: 0, activeDeliveries: 0 };
}
