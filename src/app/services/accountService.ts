/**
 * accountService — canonical source for parent account and subaccounts.
 *
 * All functions are async to match a real API contract.
 * Currently backed by `data/mock/accounts.mock.ts`; swap the body for
 * fetch() calls when a backend is available.
 *
 * ID note: The parent account uses id `'main'` throughout the codebase.
 * This is intentional — changing to `'main-account'` would be a large
 * breaking migration across AuthContext, SubAccountContext, notifications,
 * and localStorage. Documented here as the authoritative decision.
 *
 * Future API endpoints:
 *   GET /accounts/me          → getMainAccount
 *   GET /accounts/me/subs     → getSubaccounts
 *   GET /accounts/subs/:id    → getSubaccountById
 *   GET /accounts/switcher    → getAccountSwitcherItems
 */

import {
  MOCK_MAIN_ACCOUNT,
  MOCK_SUBACCOUNTS,
  SUBACCOUNT_BY_ID,
  type MockMainAccount,
  type MockSubaccount,
} from '../data/mock/accounts.mock';
// Runtime subaccount list (reflects enabled state + Request-flow adds), mirrored
// here by SubAccountContext. getSubaccounts() reads this so the service returns
// the live list rather than the static seed.
import { getRuntimeSubaccounts } from '../data/runtimeAccounts';

export type { MockMainAccount, MockSubaccount };

export interface AccountSwitcherItem {
  id: string;
  name: string;
  type: 'parent' | 'subaccount';
  description: string;
}

/** Return the parent (main) account details. */
export async function getMainAccount(): Promise<MockMainAccount> {
  return MOCK_MAIN_ACCOUNT;
}

/**
 * Return all subaccounts.
 * When `activeAccountId` is provided, the calling user is a Manager and only
 * their assigned subaccount is returned (scoping rule).
 */
export async function getSubaccounts(
  activeAccountId?: string
): Promise<MockSubaccount[]> {
  const all = getRuntimeSubaccounts();
  if (activeAccountId && activeAccountId !== 'main') {
    // Manager: can only see their own subaccount.
    return all.filter((s) => s.id === activeAccountId);
  }
  return all;
}

/** Return a single subaccount by its canonical id, or null if not found. */
export async function getSubaccountById(
  subaccountId: string
): Promise<MockSubaccount | null> {
  return SUBACCOUNT_BY_ID.get(subaccountId) ?? null;
}

/**
 * Return the list used to populate account switchers (topbar modal, sidebar).
 * For Admins: Main Account + all subaccounts.
 * For Managers: their single assigned subaccount only (no parent entry).
 */
export async function getAccountSwitcherItems(
  role: 'admin' | 'manager',
  assignedSubaccountId?: string
): Promise<AccountSwitcherItem[]> {
  if (role === 'manager' && assignedSubaccountId) {
    const sub = SUBACCOUNT_BY_ID.get(assignedSubaccountId);
    if (!sub) return [];
    return [{ id: sub.id, name: sub.name, type: 'subaccount', description: 'Your assigned subaccount' }];
  }
  return [
    { id: 'main', name: 'Main Account', type: 'parent', description: 'Manage all accounts' },
    ...MOCK_SUBACCOUNTS.map((s) => ({
      id: s.id,
      name: s.name,
      type: 'subaccount' as const,
      description: s.type === 'default' ? 'Default subaccount' : 'Additional subaccount',
    })),
  ];
}

/** Resolve a subaccount id to its display name. */
export async function getSubaccountName(subaccountId: string): Promise<string> {
  if (subaccountId === 'main') return 'Main Account';
  return SUBACCOUNT_BY_ID.get(subaccountId)?.name ?? subaccountId;
}
