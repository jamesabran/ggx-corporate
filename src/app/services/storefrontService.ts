/**
 * Storefront service facade. Contract between Storefront UI and the BFF.
 * Currently backed by data/storefront.ts. See docs/storefront_rules.md.
 *
 * Future BFF:
 *   GET  /accounts/:id/storefront            → getStorefrontProfile
 *   GET  /accounts/:id/storefront/orders     → (orders, later)
 *   POST /accounts/:id/storefront/publish    → publishStorefront
 *   POST /accounts/:id/storefront/unpublish  → unpublishStorefront
 *
 * Publish/unpublish never auto-cancels existing transactions. Order impact is
 * backend-provided and only presented (drives the unpublish warning).
 */

import {
  getProfileForScope,
  getProfileBySlug,
  ensureProfileForScope,
  getOrderImpactForScope,
  updateProfile,
  setProductIds,
  setPublishStatus,
  type StorefrontProfile,
  type StorefrontProfileInput,
  type StorefrontPublishStatus,
  type OrderImpact,
} from '../data/storefront';

export type { StorefrontProfile, StorefrontProfileInput, StorefrontPublishStatus, OrderImpact };

export const STOREFRONT_PUBLISH_META: Record<StorefrontPublishStatus, {
  label: string;
  variant: 'success' | 'warning' | 'default';
}> = {
  published:   { label: 'Published',   variant: 'success' },
  draft:       { label: 'Draft',       variant: 'warning' },
  unpublished: { label: 'Unpublished', variant: 'default' },
};

/** The unpublish confirmation copy (product-approved wording). */
export const UNPUBLISH_MESSAGE =
  'Unpublishing will hide your storefront from new customers. Existing orders and active deliveries will continue until completed.';

export async function getStorefrontProfile(scopeId: string | undefined): Promise<StorefrontProfile | null> {
  return getProfileForScope(scopeId);
}

export async function getStorefrontStatus(scopeId: string | undefined): Promise<StorefrontPublishStatus | null> {
  return getProfileForScope(scopeId)?.publishStatus ?? null;
}

/** Resolve a published/draft storefront by public slug (customer-facing surface). */
export async function getStorefrontProfileBySlug(slug: string): Promise<StorefrontProfile | null> {
  return getProfileBySlug(slug);
}

/** Return the scope's storefront, creating a default draft if none exists. */
export async function ensureStorefrontProfile(scopeId: string, storeName: string): Promise<StorefrontProfile> {
  return ensureProfileForScope(scopeId, storeName);
}

/** Pending-transaction impact for the unpublish warning. */
export async function getPendingOrderImpact(scopeId: string | undefined): Promise<OrderImpact> {
  return getOrderImpactForScope(scopeId);
}

// ─── Mutations ─────────────────────────────────────────────────────────────────
// Publish/unpublish never auto-cancels existing transactions (the impact is only
// presented). All mutations are session-only here; backend-owned in production.

/** Update the store profile (name/description/slug/contact/delivery options). */
export async function updateStorefrontProfile(
  scopeId: string,
  patch: Partial<StorefrontProfileInput>,
): Promise<StorefrontProfile | null> {
  return updateProfile(scopeId, patch);
}

/** Replace the storefront's selected Inventory product ids. */
export async function setStorefrontProducts(
  scopeId: string,
  ids: string[],
): Promise<StorefrontProfile | null> {
  return setProductIds(scopeId, ids);
}

/** Set publish status (publish / unpublish). */
export async function setStorefrontStatus(
  scopeId: string,
  status: StorefrontPublishStatus,
): Promise<StorefrontProfile | null> {
  return setPublishStatus(scopeId, status);
}
