/**
 * authService — mock authentication service.
 *
 * All functions are async to match the signature of a real auth API.
 * Currently backed by in-memory mock data; swap the implementation body for
 * real fetch() calls when a backend is available.
 *
 * Future API endpoints:
 *   POST /auth/login         → loginMockUser
 *   POST /auth/logout        → logoutMockUser
 *   GET  /auth/me            → getCurrentUser
 *   GET  /auth/session       → getSessionContext
 */

import { loadState, saveState, clearState } from '../lib/storage';
import {
  type MockAuthUser,
  MOCK_CREDENTIALS,
  MOCK_AUTH_USERS,
} from '../data/mock/auth.mock';

export type { MockAuthUser };

export interface LoginResult {
  success: boolean;
  user: MockAuthUser | null;
  error?: string;
}

export interface SessionContext {
  isAuthenticated: boolean;
  user: MockAuthUser | null;
  role: 'admin' | 'manager' | null;
  accountId: string | null;
  accountName: string | null;
  assignedSubaccountIds: string[];
}

const AUTH_STORAGE_KEY = 'auth';

/**
 * Attempt mock login with email + password.
 * Returns the authenticated user or an error.
 */
export async function loginMockUser(
  email: string,
  password: string
): Promise<LoginResult> {
  const expectedPassword = MOCK_CREDENTIALS[email];
  if (!expectedPassword || expectedPassword !== password) {
    return { success: false, user: null, error: 'Invalid email or password.' };
  }
  const user = MOCK_AUTH_USERS[email] ?? null;
  if (!user) {
    return { success: false, user: null, error: 'User not found.' };
  }
  // Persist a lightweight session (matching AuthContext.tsx shape for compatibility).
  saveState(AUTH_STORAGE_KEY, {
    name: user.name,
    email: user.email,
    role: user.role,
    accountId: user.accountId,
    accountName: user.accountName,
  });
  return { success: true, user };
}

/** Clear the current session. */
export async function logoutMockUser(): Promise<void> {
  clearState(AUTH_STORAGE_KEY);
}

/**
 * Return the current authenticated user from the session, or null.
 * Reads the persisted AuthContext shape and enriches it with full mock data.
 */
export async function getCurrentUser(): Promise<MockAuthUser | null> {
  const persisted = loadState<{ email: string } | null>(AUTH_STORAGE_KEY, null);
  if (!persisted?.email) return null;
  return MOCK_AUTH_USERS[persisted.email] ?? null;
}

/** Return a structured session context for permission checks. */
export async function getSessionContext(): Promise<SessionContext> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      isAuthenticated: false,
      user: null,
      role: null,
      accountId: null,
      accountName: null,
      assignedSubaccountIds: [],
    };
  }
  return {
    isAuthenticated: true,
    user,
    role: user.role,
    accountId: user.accountId,
    accountName: user.accountName,
    assignedSubaccountIds: user.assignedSubaccountIds,
  };
}

/** Check if the current session has a specific permission. */
export async function hasPermission(
  permission: keyof MockAuthUser['permissions']
): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.permissions[permission] ?? false;
}
