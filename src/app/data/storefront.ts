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

/** Editable store-profile fields (everything a merchant configures). */
export interface StorefrontProfileInput {
  storeName: string;
  description: string;
  slug: string;
  contactEmail: string;
  contactNumber: string;
  deliveryOptions: ServiceTypeKey[];
}

// Demo seed — Acme Luzon has a storefront in draft (enabled, not yet published).
// Mutable session store: profile edits / product selection / publish status persist
// for the tab session (reset to seed on reload). Backend-owned in production.
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

/** Resolve a storefront by its public slug (customer-facing surface). */
export function getProfileBySlug(slug: string): StorefrontProfile | null {
  return Object.values(profiles).find((p) => p.slug === slug) ?? null;
}

export function getOrderImpactForScope(scopeId: string | undefined): OrderImpact {
  if (!scopeId) return { pendingUnpaidOrders: 0, activeDeliveries: 0 };
  return orderImpact[scopeId] ?? { pendingUnpaidOrders: 0, activeDeliveries: 0 };
}

// ─── Mutations (session-only; backend-owned in production) ──────────────────────

/** Patch a scope's store profile. Returns the updated profile (or null). */
export function updateProfile(
  scopeId: string,
  patch: Partial<StorefrontProfileInput>,
): StorefrontProfile | null {
  const current = profiles[scopeId];
  if (!current) return null;
  profiles[scopeId] = { ...current, ...patch };
  return profiles[scopeId];
}

/** Replace the storefront's selected Inventory product ids. */
export function setProductIds(scopeId: string, ids: string[]): StorefrontProfile | null {
  const current = profiles[scopeId];
  if (!current) return null;
  profiles[scopeId] = { ...current, productIds: [...ids] };
  return profiles[scopeId];
}

/** Set publish status (publish / unpublish). Never touches existing transactions. */
export function setPublishStatus(
  scopeId: string,
  status: StorefrontPublishStatus,
): StorefrontProfile | null {
  const current = profiles[scopeId];
  if (!current) return null;
  profiles[scopeId] = { ...current, publishStatus: status };
  return profiles[scopeId];
}
