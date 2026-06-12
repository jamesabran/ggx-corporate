/**
 * Account Add-on state — per add-on, per account enablement + request status.
 * Persisted across refresh (localStorage key `ggx.addons`). Reset by clearing
 * that key in dev tools.
 *
 * `accountId` is a subaccount id for per-subaccount add-ons (On-Demand, Inventory,
 * Storefront) or the literal `'main'` for account-level add-ons (Consolidated Billing,
 * Advanced Analytics, Custom Reports). Account-level add-ons must always be stored
 * under MAIN_SCOPE — see migrateAccountLevelScopes below.
 *
 * For add-ons backed by a `featureId` (Inventory / Storefront / On-Demand) the
 * runtime gating state still lives in featureEnablement; addonsService keeps the
 * two in sync. For the rest this store is the source of truth.
 */

import { loadState, saveState } from '../lib/storage';

export type AddonStatus = 'enabled' | 'requested' | 'approved';

export const MAIN_SCOPE = 'main';

interface AddonStore {
  /** moduleId → (accountId → status). */
  state: Record<string, Record<string, AddonStatus>>;
}

const KEY = 'addons';
const store: AddonStore = loadState<AddonStore>(KEY, { state: {} });
function persist(): void { saveState(KEY, store); }

// Account-level add-ons must always be stored under MAIN_SCOPE regardless of
// which subaccount the user was viewing when they enabled/requested them.
// This migration fixes any state that was written under the wrong scope.
const ACCOUNT_LEVEL_ADDON_IDS = ['consolidated_billing', 'advanced_analytics', 'custom_reports'];
(function migrateAccountLevelScopes(): void {
  const priority = (s: AddonStatus) => (s === 'enabled' ? 2 : s === 'approved' ? 1 : 0);
  let dirty = false;
  for (const moduleId of ACCOUNT_LEVEL_ADDON_IDS) {
    const entries = store.state[moduleId];
    if (!entries) continue;
    for (const [accountId, status] of Object.entries(entries)) {
      if (accountId === MAIN_SCOPE) continue;
      const current = entries[MAIN_SCOPE];
      if (!current || priority(status) > priority(current)) entries[MAIN_SCOPE] = status;
      delete entries[accountId];
      dirty = true;
    }
  }
  if (dirty) persist();
})();

export function getAddonStatus(moduleId: string, accountId: string): AddonStatus | undefined {
  return store.state[moduleId]?.[accountId];
}

export function setAddonStatus(moduleId: string, accountId: string, status: AddonStatus): void {
  (store.state[moduleId] ??= {})[accountId] = status;
  persist();
}

export function clearAddonStatus(moduleId: string, accountId: string): void {
  if (store.state[moduleId]) {
    delete store.state[moduleId][accountId];
    persist();
  }
}

/** All (accountId, status) entries recorded for a module. */
export function getAddonAccounts(moduleId: string): { accountId: string; status: AddonStatus }[] {
  return Object.entries(store.state[moduleId] ?? {}).map(([accountId, status]) => ({ accountId, status }));
}
