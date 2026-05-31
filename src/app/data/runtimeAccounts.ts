/**
 * Runtime subaccount store — the synchronous source of truth for the *current*
 * subaccount list, shared between `SubAccountContext` (React/runtime owner) and
 * `accountService` (non-React facade).
 *
 * Why this exists: the subaccount list is mutable at runtime (the Request flow
 * adds subaccounts, persisted via the context). `accountService` is a plain
 * module and cannot read React state, so the context mirrors its list here
 * synchronously on every change. `accountService.getSubaccounts()` reads from
 * this store, so it always reflects runtime-added subaccounts.
 *
 * The store is updated synchronously inside the context's mutations (not in an
 * effect), so a reader's effect that runs after a state change always sees the
 * current list — avoiding child-before-parent effect-ordering staleness.
 *
 * In production, the BFF (over Contract Manager) owns this; the context would
 * hydrate the store from an API response instead of local mock state.
 */

import { MOCK_SUBACCOUNTS, type MockSubaccount } from './mock/accounts.mock';

// Defaults to the canonical mock set; the context overwrites this with its
// actual list (which reflects enabled state + runtime adds) during init.
let runtimeSubaccounts: MockSubaccount[] = [...MOCK_SUBACCOUNTS];

/** Replace the current runtime subaccount list (called by SubAccountContext). */
export function setRuntimeSubaccounts(list: MockSubaccount[]): void {
  runtimeSubaccounts = list;
}

/** Read the current runtime subaccount list. */
export function getRuntimeSubaccounts(): MockSubaccount[] {
  return runtimeSubaccounts;
}
