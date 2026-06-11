/**
 * Runtime feature enablement + setup state for gated modules (Inventory,
 * Storefront, …), keyed by scope id. Distinct from contract inclusion — a
 * feature can be included by contract yet not enabled/configured yet.
 *
 * See docs/feature_enablement_rules.md. Future BFF: GET /accounts/:id/features.
 * Demo state only; replaceable without UI changes.
 */

import { MAIN_ACCOUNT_ID } from './accounts';

/** Synthetic scope id for the non-subaccount standard-account context. */
export const STANDARD_SCOPE_ID = 'standard-account';

export type FeatureId = 'inventory' | 'storefront';

export interface FeatureState {
  enabled: boolean;
  configured: boolean;
}

type ScopeId = string;

/**
 * Per-scope enablement seed. Absent entries default to { enabled:false,
 * configured:false }. Demo narrative:
 *  - Inventory is enabled (configured) for Acme Luzon only, to demonstrate the
 *    enabled path and to unlock Storefront's dependency there.
 *  - Storefront is enabled (configured) for Acme Luzon, in draft publish status,
 *    to demonstrate the storefront page + publish/unpublish flow.
 *  - All other scopes have both features off (discoverable in Account Add-ons).
 */
const seed: Record<ScopeId, Partial<Record<FeatureId, FeatureState>>> = {
  'acme-luzon': {
    inventory: { enabled: true, configured: true },
    storefront: { enabled: true, configured: true },
  },
};

const DEFAULT_STATE: FeatureState = { enabled: false, configured: false };

/** Resolve the effective feature state for a scope (defaults to off). */
export function getFeatureStateForScope(featureId: FeatureId, scopeId: ScopeId | undefined): FeatureState {
  const id = scopeId ?? MAIN_ACCOUNT_ID;
  return seed[id]?.[featureId] ?? DEFAULT_STATE;
}
