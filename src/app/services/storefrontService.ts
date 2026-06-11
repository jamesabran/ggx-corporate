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
  getOrderImpactForScope,
  type StorefrontProfile,
  type StorefrontPublishStatus,
  type OrderImpact,
} from '../data/storefront';

export type { StorefrontProfile, StorefrontPublishStatus, OrderImpact };

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

/** Pending-transaction impact for the unpublish warning. */
export async function getPendingOrderImpact(scopeId: string | undefined): Promise<OrderImpact> {
  return getOrderImpactForScope(scopeId);
}
