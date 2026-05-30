// Shared user data module. Consumed by UsersPermissions, SubAccountSettings,
// and SubAccounts. Uses module-level mutable state (same pattern as claims/SLA)
// so changes from one page are visible to another within the same session.

export type Role = 'Admin' | 'Manager';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  /**
   * Canonical subaccount IDs this Manager is assigned to.
   * Uses IDs (not names) for all matching/filtering logic.
   * Absent for Admin.
   */
  subaccounts?: string[];
}

/** Canonical subaccount options. IDs must match data/accounts.ts. */
export const SUBACCOUNT_OPTIONS: { id: string; name: string }[] = [
  { id: 'acme-corporation', name: 'Acme Corporation' },
  { id: 'acme-luzon',       name: 'Acme Luzon' },
];

/** Resolve a subaccount ID to its display name. Falls back to the raw ID. */
export function getSubaccountName(id: string): string {
  return SUBACCOUNT_OPTIONS.find((s) => s.id === id)?.name ?? id;
}

export const MAX_MANAGERS_PER_SUBACCOUNT = 2;

/**
 * Initial seed.
 * Mike Johnson is assigned to both subaccounts (by ID) to demonstrate
 * multi-subaccount Manager capability.
 */
export const INITIAL_USERS: AppUser[] = [
  { id: '1', name: 'John Doe',       email: 'john@acme.com',  role: 'Admin' },
  { id: '2', name: 'Mike Johnson',   email: 'mike@acme.com',  role: 'Manager', subaccounts: ['acme-corporation', 'acme-luzon'] },
  { id: '3', name: 'Sarah Williams', email: 'sarah@acme.com', role: 'Manager', subaccounts: ['acme-luzon'] },
];

// Module-level mutable state so all pages share the same user list.
let SESSION_USERS: AppUser[] = [...INITIAL_USERS];

export function getUsers(): AppUser[] {
  return SESSION_USERS;
}

export function setUsers(users: AppUser[]): void {
  SESSION_USERS = users;
}

/** All Managers assigned to a given subaccount (by canonical id). */
export function getManagersForSubaccount(subaccountId: string): AppUser[] {
  return SESSION_USERS.filter(
    (u) => u.role === 'Manager' && u.subaccounts?.includes(subaccountId)
  );
}

/** Count of Managers assigned to a subaccount, optionally excluding one user. */
export function getSubaccountManagerCount(
  subaccountId: string,
  excludeUserId?: string
): number {
  return SESSION_USERS.filter(
    (u) =>
      u.role === 'Manager' &&
      u.subaccounts?.includes(subaccountId) &&
      u.id !== excludeUserId
  ).length;
}
