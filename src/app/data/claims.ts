// Claims & Cancellations (frontend/mock).
//
// Claims = refund requests on transactions that remained undelivered, linked to
// a tracking number. Cancellations = only for newly-booked (pending) transactions.
// Both are id-scoped via the canonical account map and may push notifications
// through the existing pushNotification extension point.

import { pushNotification } from './notifications';
import { getAccountIdByName } from './accounts';
import type { TransactionStatus } from './transactions';

export type ClaimStatus = 'open' | 'in-review' | 'approved' | 'denied' | 'settled';

export const CLAIM_STATUS_META: Record<ClaimStatus, { label: string; variant: 'pending' | 'info' | 'success' | 'danger' }> = {
  open:        { label: 'Open',      variant: 'pending' },
  'in-review': { label: 'In Review', variant: 'info' },
  approved:    { label: 'Approved',  variant: 'success' },
  denied:      { label: 'Denied',    variant: 'danger' },
  settled:     { label: 'Settled',   variant: 'success' },
};

export const CLAIM_REASONS = [
  'Undelivered — returned to sender',
  'Delivery failed',
  'Lost in transit',
  'Damaged item',
  'Significant delay',
  'Other',
];

export interface Claim {
  id: string;
  trackingNumber: string;
  reason: string;
  details?: string;
  amount?: number;
  status: ClaimStatus;
  createdAt: string;
  accountId?: string;
  accountName?: string;
}

// Seed claims linked to existing undelivered transactions.
const CLAIMS: Claim[] = [
  { id: 'CLM-1002', trackingNumber: 'GGX-2024-89236', reason: 'Delivery failed', details: 'Rider marked undelivered but recipient was available.', amount: 12300, status: 'open', createdAt: 'May 18, 2026', accountId: 'acme-luzon', accountName: 'Acme Luzon' },
  { id: 'CLM-1001', trackingNumber: 'GGX-2024-89231', reason: 'Undelivered — returned to sender', details: 'Returned after failed delivery attempts; requesting refund of fees.', amount: 4300, status: 'in-review', createdAt: 'May 16, 2026', accountId: 'acme-corporation', accountName: 'Acme Corporation' },
];

let claimSeq = 1;
function nextClaimId(): string {
  return `CLM-${2000 + claimSeq++}`;
}

export function getClaims(): readonly Claim[] {
  return CLAIMS;
}

export function getClaim(id: string): Claim | undefined {
  return CLAIMS.find((c) => c.id === id);
}

export function getClaimByTracking(tracking: string): Claim | undefined {
  return CLAIMS.find((c) => c.trackingNumber === tracking);
}

export interface SubmitClaimInput {
  trackingNumber: string;
  reason: string;
  details: string;
  amount?: number;
  accountName?: string;
}

/** File a claim, prepend it, and push a transaction-category notification. */
export function submitClaim(input: SubmitClaimInput): Claim {
  const id = nextClaimId();
  const accountId = input.accountName ? getAccountIdByName(input.accountName) : undefined;
  const claim: Claim = {
    id,
    trackingNumber: input.trackingNumber,
    reason: input.reason,
    details: input.details.trim() || undefined,
    amount: input.amount,
    status: 'open',
    createdAt: 'Just now',
    accountId,
    accountName: input.accountName,
  };
  CLAIMS.unshift(claim);

  pushNotification({
    category: 'transaction',
    scope: accountId ? 'subaccount' : 'parent',
    accountId,
    accountName: input.accountName,
    title: 'Claim filed',
    body: `Claim ${id} filed for ${input.trackingNumber} — ${input.reason}.`,
    href: '/dashboard/claims',
    meta: { trackingNumber: input.trackingNumber },
  });

  return claim;
}

// --- Cancellations (newly-booked only) ------------------------------------

const CANCELLED = new Set<string>();

export function isCancelled(tracking: string): boolean {
  return CANCELLED.has(tracking);
}

/** Request cancellation of a newly-booked transaction; pushes a notification. */
export function requestCancellation(tracking: string, accountName?: string): void {
  CANCELLED.add(tracking);
  const accountId = accountName ? getAccountIdByName(accountName) : undefined;
  pushNotification({
    category: 'transaction',
    scope: accountId ? 'subaccount' : 'parent',
    accountId,
    accountName,
    title: 'Booking cancelled',
    body: `Booking ${tracking} was cancelled.`,
    href: `/dashboard/transactions/${tracking}`,
    meta: { trackingNumber: tracking },
  });
}

// --- Eligibility -----------------------------------------------------------

/** Claims are for transactions that should have been delivered but weren't. */
export function isClaimEligible(status: TransactionStatus): boolean {
  return status === 'failed' || status === 'returned' || status === 'in-transit' || status === 'picked-up';
}

/** Cancellation is only allowed for newly-booked (pending) transactions. */
export function isCancelEligible(status: TransactionStatus): boolean {
  return status === 'pending';
}
