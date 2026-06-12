/**
 * Account Add-on state — per add-on, per account enablement + request status.
 * Persisted across refresh (localStorage key `ggx.addons`). Reset by clearing
 * that key in dev tools.
 *
 * `accountId` is a subaccount id for assignable add-ons (On-Demand, Inventory,
 * Storefront, Advanced Analytics, Custom Reports) or the literal `'main'` for
 * Main-account-level add-ons (Consolidated Billing).
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
