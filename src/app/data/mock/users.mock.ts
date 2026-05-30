/**
 * Mock data for the user service layer.
 *
 * Re-exports `data/users.ts` helpers so the service layer has a single import
 * point. If user data is later moved to a dedicated source, only this file
 * and `userService.ts` need to change — no UI consumers are affected.
 *
 * Business rules (enforced in userService, documented here):
 * - One Admin per parent account; access to all subaccounts.
 * - Managers can be assigned to multiple subaccounts.
 * - Max 2 Managers per subaccount.
 * - Manager assignment is Admin-only.
 * - Subaccount Managers can VIEW assigned managers but cannot edit assignments.
 * - Add User is for new users only (not for re-assigning existing users).
 */

export {
  type AppUser,
  type Role,
  SUBACCOUNT_OPTIONS,
  MAX_MANAGERS_PER_SUBACCOUNT,
  INITIAL_USERS,
  getUsers,
  setUsers,
  getManagersForSubaccount,
  getSubaccountManagerCount,
  getSubaccountName,
} from '../users';
