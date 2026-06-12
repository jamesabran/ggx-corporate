/**
 * addonsService — single entry point for changing Account Add-on state.
 *
 * Unifies the two stores behind one API:
 *  - Add-ons with a `featureId` (Inventory / Storefront / On-Demand) drive
 *    featureEnablement (so the gated pages keep working); the addon store mirrors
 *    the status for the targeting UI.
 *  - Add-ons without a featureId (Advanced Analytics, Custom Reports, Consolidated
 *    Billing) live in the addon store only.
 *
 * Approval requests are surfaced as Notifications (not toasts): submitting pushes
 * a pending notification; "approving" it from the bell/Notifications flips the
 * add-on to enabled. All state is persisted (localStorage) so it survives refresh.
 */

import {
  getAddonStatus, setAddonStatus, clearAddonStatus, getAddonAccounts, MAIN_SCOPE,
  type AddonStatus,
} from '../data/addonState';
import {
  getFeatureStateForScope, setFeatureStateForScope, getScopesWithFeature,
} from '../data/featureEnablement';
import { getModuleById } from '../data/businessModules';
import { pushNotification } from '../data/notifications';

export type { AddonStatus };
export { MAIN_SCOPE };

const scopeArg = (accountId: string) => (accountId === MAIN_SCOPE ? undefined : accountId);

/** Effective status of an add-on for a specific account ('enabled'/'requested'/none). */
export function getAddonAccountStatus(moduleId: string, accountId: string): AddonStatus | undefined {
  const m = getModuleById(moduleId);
  if (m?.featureId) {
    if (getFeatureStateForScope(m.featureId, scopeArg(accountId)).enabled) return 'enabled';
  }
  const s = getAddonStatus(moduleId, accountId);
  return s === 'approved' ? 'enabled' : s;
}

export function isAddonEnabledForAccount(moduleId: string, accountId: string): boolean {
  return getAddonAccountStatus(moduleId, accountId) === 'enabled';
}

/** Enable an add-on for an account (self-serve, or after approval). */
export function enableAddon(moduleId: string, accountId: string): void {
  const m = getModuleById(moduleId);
  setAddonStatus(moduleId, accountId, 'enabled');
  if (m?.featureId) setFeatureStateForScope(m.featureId, scopeArg(accountId), { enabled: true, configured: true });
}

/** Remove an add-on from an account. */
export function disableAddon(moduleId: string, accountId: string): void {
  const m = getModuleById(moduleId);
  clearAddonStatus(moduleId, accountId);
  if (m?.featureId) setFeatureStateForScope(m.featureId, scopeArg(accountId), { enabled: false, configured: false });
}

/** Submit an activation/approval request and notify (pending GGX review). */
export function requestAddon(moduleId: string, accountId: string, accountLabel?: string): void {
  const m = getModuleById(moduleId);
  setAddonStatus(moduleId, accountId, 'requested');
  pushNotification({
    category: 'account',
    title: `${m?.name ?? 'Add-on'} activation requested`,
    body: `Your request to activate ${m?.name ?? 'this add-on'}${accountLabel ? ` for ${accountLabel}` : ''} is pending review by your GGX account team. Open to review and confirm the approval.`,
    scope: 'parent',
    href: '/dashboard/notifications',
    meta: { addon: { moduleId, accountId, accountLabel } },
  });
}

/** Simulate the GGX team approving a request (from a notification) → enabled. */
export function approveAddon(moduleId: string, accountId: string, accountLabel?: string): void {
  const m = getModuleById(moduleId);
  enableAddon(moduleId, accountId);
  pushNotification({
    category: 'account',
    title: `${m?.name ?? 'Add-on'} activated`,
    body: `Your GGX account team approved ${m?.name ?? 'the add-on'}${accountLabel ? ` for ${accountLabel}` : ''}. It is now active.`,
    scope: 'parent',
    href: '/dashboard/account-add-ons',
  });
}

/** Whether an add-on has a pending (requested) state for an account. */
export function isAddonRequested(moduleId: string, accountId: string): boolean {
  return getAddonStatus(moduleId, accountId) === 'requested';
}

/**
 * Accounts a module is currently assigned to (enabled or requested), merging the
 * featureEnablement scopes (featureId add-ons) with the addon store entries.
 */
export function getAddonAssignments(moduleId: string): { accountId: string; status: AddonStatus }[] {
  const m = getModuleById(moduleId);
  const map = new Map<string, AddonStatus>();
  for (const { accountId, status } of getAddonAccounts(moduleId)) {
    map.set(accountId, status === 'approved' ? 'enabled' : status);
  }
  if (m?.featureId) {
    for (const scopeId of getScopesWithFeature(m.featureId)) map.set(scopeId, 'enabled');
  }
  return Array.from(map.entries()).map(([accountId, status]) => ({ accountId, status }));
}
