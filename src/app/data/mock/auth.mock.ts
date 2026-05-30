/**
 * Mock authentication data.
 *
 * Demo credentials used by `authService.loginMockUser()`. The primary auth
 * context lives in `contexts/AuthContext.tsx` (`DEMO_USERS`); this file
 * mirrors and extends it with richer mock user objects for the service layer.
 *
 * Future: replace `MOCK_CREDENTIALS` with a real POST /auth/login call and
 * `MOCK_USERS_BY_ID` with a GET /users/me response.
 */

import type { UserRole } from '../../contexts/AuthContext';

export interface MockAuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  /** Canonical account id this user is scoped to. */
  accountId: string;
  accountName: string;
  /** Subaccount ids this user manages (Managers only). */
  assignedSubaccountIds: string[];
  permissions: MockPermissions;
}

export interface MockPermissions {
  canManageUsers: boolean;
  canAccessFinance: boolean;
  canViewAllSubaccounts: boolean;
  canAssignManagers: boolean;
  canGenerateReports: boolean;
  canManagePaymentSettings: boolean;
}

const ADMIN_PERMISSIONS: MockPermissions = {
  canManageUsers: true,
  canAccessFinance: true,
  canViewAllSubaccounts: true,
  canAssignManagers: true,
  canGenerateReports: true,
  canManagePaymentSettings: true,
};

const MANAGER_PERMISSIONS: MockPermissions = {
  canManageUsers: false,
  canAccessFinance: false,
  canViewAllSubaccounts: false,
  canAssignManagers: false,
  canGenerateReports: true,   // operational reports only (scoped to subaccount)
  canManagePaymentSettings: false,
};

/** Demo credential pairs: email → plain-text password (mock only). */
export const MOCK_CREDENTIALS: Record<string, string> = {
  'max@email.com':     '!1234qwer',
  'manager@email.com': '!1234qwer',
};

/** Full mock user objects, keyed by email. */
export const MOCK_AUTH_USERS: Record<string, MockAuthUser> = {
  'max@email.com': {
    id: 'user-admin-001',
    name: 'Max Rodriguez',
    email: 'max@email.com',
    role: 'admin',
    accountId: 'main',
    accountName: 'Main Account',
    assignedSubaccountIds: [], // Admin sees all; not restricted to a list.
    permissions: ADMIN_PERMISSIONS,
  },
  'manager@email.com': {
    id: 'user-mgr-001',
    name: 'Rina Lopez',
    email: 'manager@email.com',
    role: 'manager',
    accountId: 'acme-luzon',
    accountName: 'Acme Luzon',
    assignedSubaccountIds: ['acme-luzon'],
    permissions: MANAGER_PERMISSIONS,
  },
};
