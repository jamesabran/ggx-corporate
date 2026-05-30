// Shared user seed data consumed by UsersPermissions and SubAccountSettings.
// Centralising the seed keeps both pages consistent without a backend.

export type Role = 'Admin' | 'Manager';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  /** Subaccount names this Manager is assigned to (may be multiple). Absent for Admin. */
  subaccounts?: string[];
}

/** Canonical subaccount options for the assignment select. Aligns with data/accounts.ts. */
export const SUBACCOUNT_OPTIONS: { id: string; name: string }[] = [
  { id: 'acme-corporation', name: 'Acme Corporation' },
  { id: 'acme-luzon',       name: 'Acme Luzon' },
];

/**
 * Initial user seed.
 * Mike Johnson is intentionally assigned to both subaccounts to demonstrate
 * the multi-subaccount Manager capability (up to 2 Managers per subaccount).
 */
export const INITIAL_USERS: AppUser[] = [
  { id: '1', name: 'John Doe',       email: 'john@acme.com',  role: 'Admin' },
  { id: '2', name: 'Mike Johnson',   email: 'mike@acme.com',  role: 'Manager', subaccounts: ['Acme Corporation', 'Acme Luzon'] },
  { id: '3', name: 'Sarah Williams', email: 'sarah@acme.com', role: 'Manager', subaccounts: ['Acme Luzon'] },
];
