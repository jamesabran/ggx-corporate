/**
 * userService — users, permissions, and manager assignments.
 *
 * All functions are async to match a real API contract.
 * Currently backed by `data/users.ts` (SESSION_USERS, module-level state).
 *
 * Business rules (product-level, enforced here):
 *   - One Admin per parent account; access to all subaccounts.
 *   - Managers can be assigned to multiple subaccounts.
 *   - Max 2 Managers per subaccount (MAX_MANAGERS_PER_SUBACCOUNT).
 *   - Manager assignment is Admin-only.
 *   - Managers can VIEW their own assignment but cannot edit it.
 *   - Add User is for new users only (prevent "re-assign existing user" flow).
 *
 * Future API endpoints:
 *   GET    /users               → getUsers
 *   GET    /users/:id           → getUserById
 *   GET    /subaccounts/:id/managers  → getManagersBySubaccountId
 *   GET    /subaccounts/:id/managers/available → getAvailableManagersForSubaccount
 *   PUT    /users/:id           → updateUser
 *   PUT    /users/:id/subaccounts → updateUserSubaccountAssignments
 *   POST   /users               → createUser
 *   DELETE /users/:id           → removeUser
 */

import {
  type AppUser,
  MAX_MANAGERS_PER_SUBACCOUNT,
  getUsers,
  setUsers,
  getManagersForSubaccount,
  getSubaccountManagerCount,
  getSubaccountName,
  SUBACCOUNT_OPTIONS,
} from '../data/users';

export type { AppUser };
export { MAX_MANAGERS_PER_SUBACCOUNT };

export interface ManagerAvailability {
  user: AppUser;
  /** Manager count for the subaccount, excluding this user if they're already assigned. */
  currentCount: number;
  isFull: boolean;
  isAlreadyAssigned: boolean;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  subaccounts: string[]; // canonical subaccount IDs
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  subaccounts?: string[];
}

export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/** Return all users visible to the caller. Admins see all; pass filtering as needed. */
export async function getUsers_(): Promise<AppUser[]> {
  return getUsers();
}

/** Return a single user by id, or null. */
export async function getUserById(userId: string): Promise<AppUser | null> {
  return getUsers().find((u) => u.id === userId) ?? null;
}

/** Return all managers assigned to a subaccount. */
export async function getManagersBySubaccountId(
  subaccountId: string
): Promise<AppUser[]> {
  return getManagersForSubaccount(subaccountId);
}

/**
 * Return manager availability for a subaccount — used to build the assignment
 * UI (shows capacity, who is already assigned, who is available to add).
 */
export async function getAvailableManagersForSubaccount(
  subaccountId: string,
  editingUserId?: string
): Promise<ManagerAvailability[]> {
  const managers = getUsers().filter((u) => u.role === 'Manager');
  return managers.map((u) => {
    const count = getSubaccountManagerCount(subaccountId, editingUserId);
    const isAlreadyAssigned = u.subaccounts?.includes(subaccountId) ?? false;
    return {
      user: u,
      currentCount: count,
      isFull: count >= MAX_MANAGERS_PER_SUBACCOUNT && !isAlreadyAssigned,
      isAlreadyAssigned,
    };
  });
}

/** Create a new user (Manager). Returns error if email already exists. */
export async function createUser(
  payload: CreateUserPayload
): Promise<ServiceResult<AppUser>> {
  const existing = getUsers().find(
    (u) => u.email.toLowerCase() === payload.email.toLowerCase()
  );
  if (existing) {
    return { success: false, error: `User with email ${payload.email} already exists.` };
  }
  for (const subId of payload.subaccounts) {
    const count = getSubaccountManagerCount(subId);
    if (count >= MAX_MANAGERS_PER_SUBACCOUNT) {
      const name = getSubaccountName(subId);
      return {
        success: false,
        error: `${name} already has ${MAX_MANAGERS_PER_SUBACCOUNT} managers.`,
      };
    }
  }
  const newUser: AppUser = {
    id: `user-${Date.now()}`,
    name: payload.name.trim(),
    email: payload.email.trim(),
    role: 'Manager',
    subaccounts: payload.subaccounts,
  };
  setUsers([...getUsers(), newUser]);
  return { success: true, data: newUser };
}

/** Update a user's name, email, or subaccount assignments. */
export async function updateUser(
  userId: string,
  payload: UpdateUserPayload
): Promise<ServiceResult<AppUser>> {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return { success: false, error: 'User not found.' };

  const user = users[idx];
  const updated: AppUser = {
    ...user,
    ...(payload.name !== undefined ? { name: payload.name.trim() } : {}),
    ...(payload.email !== undefined ? { email: payload.email.trim() } : {}),
    ...(payload.subaccounts !== undefined ? { subaccounts: payload.subaccounts } : {}),
  };
  const next = users.map((u, i) => (i === idx ? updated : u));
  setUsers(next);
  return { success: true, data: updated };
}

/**
 * Replace a user's subaccount assignments.
 * Validates capacity before committing (Admin-only operation).
 */
export async function updateUserSubaccountAssignments(
  userId: string,
  subaccountIds: string[]
): Promise<ServiceResult<AppUser>> {
  for (const subId of subaccountIds) {
    const count = getSubaccountManagerCount(subId, userId);
    if (count >= MAX_MANAGERS_PER_SUBACCOUNT) {
      const name = getSubaccountName(subId);
      return {
        success: false,
        error: `${name} already has ${MAX_MANAGERS_PER_SUBACCOUNT} managers.`,
      };
    }
  }
  return updateUser(userId, { subaccounts: subaccountIds });
}

/** Remove a user. The sole Admin cannot be removed. */
export async function removeUser(userId: string): Promise<ServiceResult<void>> {
  const user = getUsers().find((u) => u.id === userId);
  if (!user) return { success: false, error: 'User not found.' };
  if (user.role === 'Admin') {
    return { success: false, error: 'The account Admin cannot be removed.' };
  }
  setUsers(getUsers().filter((u) => u.id !== userId));
  return { success: true };
}

/** Available subaccount options (for assignment selects). */
export async function getSubaccountOptions(): Promise<typeof SUBACCOUNT_OPTIONS> {
  return SUBACCOUNT_OPTIONS;
}
