/**
 * Feature enablement service facade.
 *
 * Contract between gated-feature UI (Inventory, Storefront) and the BFF.
 * Currently backed by data/featureEnablement.ts.
 *
 * Future BFF:
 *   GET  /accounts/:id/features                     → getFeatureState
 *   POST /accounts/:id/features/:featureId/enable   → (activation, later)
 *
 * See docs/feature_enablement_rules.md.
 */

import {
  getFeatureStateForScope,
  enableFeatureForScope,
  STANDARD_SCOPE_ID,
  type FeatureId,
  type FeatureState,
} from '../data/featureEnablement';

export type { FeatureId, FeatureState };
export { STANDARD_SCOPE_ID };

/**
 * Enable a feature for a scope (self-activation), making it immediately usable.
 * Future BFF: POST /accounts/:id/features/:featureId/enable.
 */
export async function enableFeature(
  featureId: FeatureId,
  scopeId: string | undefined,
): Promise<FeatureState> {
  return enableFeatureForScope(featureId, scopeId);
}

/** Effective enablement/config state for a feature in a scope. */
export async function getFeatureState(
  featureId: FeatureId,
  scopeId: string | undefined
): Promise<FeatureState> {
  return getFeatureStateForScope(featureId, scopeId);
}

/** A feature is usable only when enabled AND configured. */
export async function isFeatureUsable(
  featureId: FeatureId,
  scopeId: string | undefined
): Promise<boolean> {
  const s = getFeatureStateForScope(featureId, scopeId);
  return s.enabled && s.configured;
}

/** Synchronous helper for status resolution within other services (mock-only). */
export function getFeatureStateSync(featureId: FeatureId, scopeId: string | undefined): FeatureState {
  return getFeatureStateForScope(featureId, scopeId);
}
