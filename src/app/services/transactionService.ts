/**
 * transactionService — centralized transaction list and detail access.
 *
 * All functions are async to match a real API contract.
 * Currently backed by `data/transactions.ts` (static mock seed).
 *
 * Note: `subaccount` on the Transaction type is currently a display name string.
 * Full ID-based subaccount matching is deferred — the subaccount field on the
 * transaction row stores the name, not the canonical id. Use the `accountId`
 * field on `TransactionBatch` (batch-origin transactions) for ID-based lookups.
 *
 * Future API endpoints:
 *   GET /transactions              → getTransactions
 *   GET /transactions/:id          → getTransactionById
 *   GET /transactions?subaccount=X → getTransactionsBySubaccountId
 *   GET /settlements/:id/transactions → getTransactionsBySettlementId
 */

import {
  transactions,
  deliveries,
  getTransactionByTracking,
  type Transaction,
  type TransactionSummary,
  type TransactionStatus,
} from '../data/transactions';
import { getSettlement } from '../data/earnings';
import type { SettlementTransaction } from '../data/earnings';

export type { Transaction, TransactionSummary, TransactionStatus };

export interface TransactionFilters {
  status?: TransactionStatus | 'all';
  type?: string;
  /** Subaccount display name (legacy; prefer `subaccountId` once migration is complete). */
  subaccountName?: string;
  /** Canonical subaccount id. If provided, takes precedence over `subaccountName`. */
  subaccountId?: string;
  search?: string;
}

/** Return the full transaction list, with optional filters applied. */
export async function getTransactions(
  filters?: TransactionFilters
): Promise<TransactionSummary[]> {
  let result = [...deliveries];
  if (!filters) return result;

  const { status, type, subaccountName, subaccountId, search } = filters;

  if (status && status !== 'all') {
    result = result.filter((t) => t.status === status);
  }
  if (type && type !== 'all') {
    result = result.filter((t) => t.type.toLowerCase() === type.toLowerCase());
  }
  if (subaccountId && subaccountId !== 'all' && subaccountId !== 'main') {
    // Match via batch.accountId if available, otherwise fall back to display name.
    const txById = transactions.filter(
      (t) => t.batch?.accountId === subaccountId
    );
    if (txById.length > 0) {
      const ids = new Set(txById.map((t) => t.trackingNumber));
      result = result.filter((t) => ids.has(t.tracking));
    } else if (subaccountName) {
      result = result.filter((t) => t.subaccount === subaccountName);
    }
  } else if (subaccountName && subaccountName !== 'all') {
    result = result.filter((t) => t.subaccount === subaccountName);
  }
  if (search && search.trim().length >= 2) {
    const q = search.trim().toLowerCase();
    result = result.filter(
      (t) =>
        t.tracking.toLowerCase().includes(q) ||
        t.recipient.toLowerCase().includes(q) ||
        t.destination.toLowerCase().includes(q)
    );
  }
  return result;
}

/** Return a single full transaction by tracking number, or null. */
export async function getTransactionById(
  trackingNumber: string
): Promise<Transaction | null> {
  return getTransactionByTracking(trackingNumber) ?? null;
}

/**
 * Return transaction summaries for a given subaccount.
 * Uses batch.accountId (canonical ID) where available, with a name fallback.
 */
export async function getTransactionsBySubaccountId(
  subaccountId: string
): Promise<TransactionSummary[]> {
  if (subaccountId === 'main') return deliveries;

  // Prefer ID-based matching via batch origin; fall back to subaccount display name.
  const byId = transactions
    .filter((t) => t.batch?.accountId === subaccountId)
    .map((t) => deliveries.find((d) => d.tracking === t.trackingNumber))
    .filter((d): d is TransactionSummary => !!d);

  if (byId.length > 0) return byId;

  // Fallback: name-based (not all transactions have a batch origin).
  return deliveries.filter((d) => {
    const tx = transactions.find((t) => t.trackingNumber === d.tracking);
    return tx?.subaccount === subaccountId; // will miss if subaccount is a name, not id
  });
}

/**
 * Return the transaction list for a given settlement.
 * Maps settlement transaction records to a lightweight format.
 */
export async function getTransactionsBySettlementId(
  settlementId: string
): Promise<SettlementTransaction[]> {
  const settlement = getSettlement(settlementId);
  return settlement?.transactions ?? [];
}

/** Return recent transactions for a dashboard preview (newest first, capped). */
export async function getRecentTransactions(
  limit = 5,
  subaccountId?: string
): Promise<TransactionSummary[]> {
  const all = await getTransactions(
    subaccountId ? { subaccountId } : undefined
  );
  return all.slice(0, limit);
}
