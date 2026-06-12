/**
 * Runtime feature enablement + setup state for gated modules (Inventory,
 * Storefront, …), keyed by scope id. Distinct from contract inclusion — a
 * feature can be included by contract yet not enabled/configured yet.
 *
 * See docs/feature_enablement_rules.md. Future BFF: GET /accounts/:id/features.
 * Demo state only; replaceable without UI changes.
 */

import { MAIN_ACCOUNT_ID } from './accounts';
import { loadState, saveState } from '../lib/storage';

/** Synthetic scope id for the non-subaccount standard-account context. */
export const STANDARD_SCOPE_ID = 'standard-account';

export type FeatureId = 'inventory' | 'storefront' | 'on_demand';

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
 *  - On-Demand Delivery is enabled for Acme Luzon, so it appears in the Bulk
 *    Booking service-mode selector for that scope (page-level service type).
 *  - All other scopes have these features off (discoverable in Account Add-ons).
 */
const SEED: Record<ScopeId, Partial<Record<FeatureId, FeatureState>>> = {
  'acme-luzon': {
    inventory: { enabled: true, configured: true },
    storefront: { enabled: true, configured: true },
    on_demand: { enabled: true, configured: true },
  },
};

// Persisted across refresh (localStorage key `ggx.featureEnablement`) so add-on
// enablement survives reload; falls back to the seed.
const STORE_KEY = 'featureEnablement';
const seed: Record<ScopeId, Partial<Record<FeatureId, FeatureState>>> =
  loadState<Record<ScopeId, Partial<Record<FeatureId, FeatureState>>>>(STORE_KEY, SEED);
function persist(): void { saveState(STORE_KEY, seed); }

const DEFAULT_STATE: FeatureState = { enabled: false, configured: false };

/** Resolve the effective feature state for a scope (defaults to off). */
export function getFeatureStateForScope(featureId: FeatureId, scopeId: ScopeId | undefined): FeatureState {
  const id = scopeId ?? MAIN_ACCOUNT_ID;
  return seed[id]?.[featureId] ?? DEFAULT_STATE;
}

// ─── Mutations (persisted to localStorage; backend-owned in production) ─────────

/** Set a feature's enablement state for a scope. */
export function setFeatureStateForScope(
  featureId: FeatureId,
  scopeId: ScopeId | undefined,
  state: FeatureState,
): FeatureState {
  const id = scopeId ?? MAIN_ACCOUNT_ID;
  seed[id] = { ...(seed[id] ?? {}), [featureId]: state };
  persist();
  return state;
}

/** Scope ids that have a feature enabled (used by Main-account add-on targeting). */
export function getScopesWithFeature(featureId: FeatureId): string[] {
  return Object.entries(seed)
    .filter(([, feats]) => feats?.[featureId]?.enabled)
    .map(([scopeId]) => scopeId);
}

/**
 * Enable a feature for a scope (self-activation). Turns it on and marks it
 * configured so the add-on is immediately usable (status → "Enabled", CTA →
 * "Open"). Per-feature guided setup can refine this later.
 */
export function enableFeatureForScope(featureId: FeatureId, scopeId: ScopeId | undefined): FeatureState {
  return setFeatureStateForScope(featureId, scopeId, { enabled: true, configured: true });
}
