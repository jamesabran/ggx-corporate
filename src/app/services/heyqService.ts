/**
 * heyqService — the GGX Business+ ↔ HeyQ adapter. THE SEAM.
 *
 * ── Ownership ──────────────────────────────────────────────────────────────
 *   • OMS (via `transactionService`) owns orders and shipment/delivery status.
 *   • HeyQ owns tickets: assignment, escalation, messages, status changes,
 *     resolution, reopening, history.
 *   • Business+ owns neither. It is a REQUESTER CLIENT of HeyQ and a read
 *     consumer of OMS.
 *
 * Every Business+ ↔ HeyQ interaction goes through this module. The requester
 * reads and writes now hit the deployed HeyQ mock API over its CUSTOMER surface
 * (see `heyqCustomerApi`); HeyQ enforces visibility server-side. The OMS side
 * (order authorization, the customer-safe snapshot, live delivery status) is read
 * through `transactionService`, never from HeyQ and never from page state.
 *
 * HeyQ customer endpoints used (requester-scoped):
 *   GET  /api/customer/tickets            → listMyTickets
 *   GET  /api/customer/tickets/:id        → getMyTicket
 *   POST /api/tickets/:id/messages        → replyToMyTicket
 *   POST /api/tickets/:id/reopen          → reopenMyTicket
 *   (ticket creation happens in HeyQ's own /contact form — we hand off to it)
 *
 * ── What this adapter deliberately does NOT do ─────────────────────────────
 * It exposes no agent/internal surface. Internal notes, assignee identity, team
 * queue, SLA policy, support tier and escalation state are dropped by HeyQ's
 * server-side projection and are never requested here — they must never reach a
 * Business+ page. Agent actions belong to the HeyQ agent app.
 */

import { getTransactionById, statusConfig, serviceTypeLabel } from './transactionService';
import { getSessionContext } from './authService';
import { getAccountIdByName } from '../data/accounts';
import {
  apiListMyTickets,
  apiGetMyTicket,
  apiReplyToMyTicket,
  apiReopenMyTicket,
  apiCreateTicket,
} from './heyqCustomerApi';

// ── HeyQ contract types (owned by HeyQ; mirrored here for the adapter) ────────
// HeyQ's requester-facing vocabulary. Previously shared from the in-process mock;
// with reads/writes now served by the real HeyQ API, the adapter carries them.

export type HeyQTicketStatus =
  | 'new'
  | 'open'
  | 'in_progress'
  | 'on_hold'
  | 'resolved'
  | 'closed';

export type HeyQConcernType =
  | 'delivery_delay'
  | 'failed_delivery'
  | 'missing_parcel'
  | 'damaged_parcel'
  | 'cod_concern'
  | 'billing_issue'
  | 'address_correction'
  | 'general_inquiry';

export const HEYQ_CONCERN_LABELS: Record<HeyQConcernType, string> = {
  delivery_delay: 'Delayed Delivery',
  failed_delivery: 'Delivery Failed',
  missing_parcel: 'Missing Package',
  damaged_parcel: 'Package Damaged',
  cod_concern: 'COD Concern',
  billing_issue: 'Billing Inquiry',
  address_correction: 'Wrong Address',
  general_inquiry: 'General Inquiry',
};

/**
 * The signed-in Business+ user, as HeyQ's requester identity. `externalOrgId` is
 * the ACCOUNT SCOPE — Admin is `main` (sees everything), a Manager is their
 * subaccount — and is also what scopes order authorization.
 */
export interface HeyQRequesterIdentity {
  externalUserId: string;
  externalOrgId: string;
}

/**
 * The minimal, customer-safe order context. OMS-derived and captured at
 * submission; delivery status here is independent of the ticket's own status.
 */
export interface HeyQOrderSnapshot {
  /** OMS delivery status key at capture time (e.g. 'in-transit'). */
  deliveryStatus: string;
  /** Display label for the delivery status at capture time. */
  deliveryStatusLabel: string;
  /** Standard / Same-Day / On-Demand. */
  serviceType: string;
  /** Short, non-identifying summary (e.g. "Express delivery"). */
  deliverySummary: string;
  /** City-level route only (e.g. "Makati City → Quezon City"). */
  route: string;
  /** Booking date (the relevant date for support context). */
  bookedOn: string;
}

/** A ticket's link to an OMS order: stable id + snapshot. Reference data only. */
export interface HeyQLinkedOrder {
  /** Stable OMS order id (Business+ tracking number). Never a HeyQ primary key. */
  externalOrderId: string;
  trackingNumber: string;
  /** Captured at submission. Absent when the snapshot could not be taken. */
  snapshot?: HeyQOrderSnapshot;
  /** When the snapshot was captured — makes snapshot age explicit. */
  capturedAt: string;
}

// ── Configuration ────────────────────────────────────────────────────────────

/**
 * Where the HeyQ FRONTEND lives — used to OPEN HeyQ pages (the contact form and
 * the requester portal). This is NOT the API origin; API calls go through
 * `heyqCustomerApi` (`VITE_HEYQ_API_URL`). Override the frontend with
 * `VITE_HEYQ_URL`; the default is the deployed HeyQ app. For local development
 * against a local HeyQ, set `VITE_HEYQ_URL=http://localhost:18020`.
 */
export function getHeyQBaseUrl(): string {
  const configured =
    typeof import.meta !== 'undefined' ? import.meta.env?.VITE_HEYQ_URL : undefined;
  return (configured || 'https://heyq.vercel.app').replace(/\/$/, '');
}

// ── Result unions ────────────────────────────────────────────────────────────
// Mirrors HeyQ's own provider contract, so authorization failure and downtime
// are handled today rather than discovered in production.

export type HeyQResult<T> =
  | { status: 'ok'; data: T }
  | { status: 'forbidden' }
  | { status: 'not_found' }
  | { status: 'unavailable' };

// ── Customer-facing view models ──────────────────────────────────────────────

/** A public conversation entry. Internal notes have no representation here. */
export interface CustomerTicketMessage {
  id: string;
  /** 'you' | 'support' | 'system' — never an individual agent identity. */
  from: 'you' | 'support' | 'system';
  /** Team name for support replies (e.g. "Claims"), not the agent's name. */
  authorLabel: string;
  body: string;
  createdAt: string;
}

/**
 * What Business+ is allowed to see about a HeyQ ticket. Note what is absent:
 * assignee identity, escalation state, support tier, SLA policy, internal notes.
 */
export interface CustomerTicket {
  id: string;
  reference: string;
  subject: string;
  concernType: HeyQConcernType;
  /** Human label for the concern (drives the existing "Issue Type" column). */
  issueType: string;
  /** SUPPORT-TICKET status — distinct from the order's delivery status. */
  status: HeyQTicketStatus;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  /** The handling team. Team, not agent — agent identity stays inside HeyQ. */
  supportTeam: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  reopenedAt?: string;
  /** Present only for order-linked tickets. Snapshot may be absent (see below). */
  linkedOrder?: HeyQLinkedOrder;
  messages: CustomerTicketMessage[];
  /** Requesters may reopen a resolved/closed ticket. */
  canReopen: boolean;
}

// ── Status presentation ──────────────────────────────────────────────────────
//
// SUPPORT-TICKET status only. Delivery status has its own map (`statusConfig` in
// transactionService) and the two must never be styled from the same source.
// Semantics: orange = waiting on us, blue = actively worked, amber = blocked,
// green = resolved, grey = closed.

export type BadgeVariant = 'default' | 'info' | 'success' | 'warning' | 'danger' | 'pending';

export const TICKET_STATUS_META: Record<
  HeyQTicketStatus,
  { label: string; variant: BadgeVariant }
> = {
  new:         { label: 'New',         variant: 'pending' },
  open:        { label: 'Open',        variant: 'pending' },
  in_progress: { label: 'In Progress', variant: 'info' },
  on_hold:     { label: 'On Hold',     variant: 'warning' },
  resolved:    { label: 'Resolved',    variant: 'success' },
  closed:      { label: 'Closed',      variant: 'default' },
};

export const TICKET_PRIORITY_META: Record<
  CustomerTicket['priority'],
  { label: string; variant: BadgeVariant }
> = {
  urgent: { label: 'Urgent', variant: 'danger' },
  high:   { label: 'High',   variant: 'danger' },
  normal: { label: 'Normal', variant: 'warning' },
  low:    { label: 'Low',    variant: 'default' },
};

/** Ordered for the status filter on the Support Tickets page. */
export const TICKET_STATUS_OPTIONS: { value: HeyQTicketStatus; label: string }[] = (
  ['new', 'open', 'in_progress', 'on_hold', 'resolved', 'closed'] as HeyQTicketStatus[]
).map((s) => ({ value: s, label: TICKET_STATUS_META[s].label }));

/** Concern options for the in-app report drawer. */
export const REPORT_CONCERN_OPTIONS: { value: HeyQConcernType; label: string }[] = (
  [
    'delivery_delay', 'failed_delivery', 'missing_parcel', 'damaged_parcel',
    'cod_concern', 'billing_issue', 'address_correction', 'general_inquiry',
  ] as HeyQConcernType[]
).map((c) => ({ value: c, label: HEYQ_CONCERN_LABELS[c] }));

// ── Identity ─────────────────────────────────────────────────────────────────

/**
 * The signed-in Business+ user, as HeyQ's requester identity. In production the
 * handoff carries a verifiable session (e.g. a signed token) that resolves to
 * this on HeyQ's side; today we pass the external ids explicitly.
 */
export async function getRequesterIdentity(): Promise<HeyQRequesterIdentity | null> {
  const session = await getSessionContext();
  if (!session.isAuthenticated || !session.user || !session.accountId) return null;
  return {
    externalUserId: session.user.email,
    externalOrgId: session.accountId,
  };
}

// ── OMS order authorization + snapshot ───────────────────────────────────────

/**
 * May this identity see this order? Reads the order through the OMS boundary
 * (`transactionService`) — never page state — and checks it against the caller's
 * account scope. Admin (`main`) sees all accounts; a Manager sees only their own.
 *
 * An out-of-scope order is `forbidden` whether or not it exists, so the caller
 * learns nothing about other accounts' shipments.
 */
export async function getAuthorizedOrder(
  who: HeyQRequesterIdentity,
  externalOrderId: string,
): Promise<HeyQResult<{ snapshot: HeyQOrderSnapshot; trackingNumber: string }>> {
  const tx = await getTransactionById(externalOrderId);
  if (!tx) return { status: 'not_found' };

  if (who.externalOrgId !== 'main') {
    const owner = getAccountIdByName(tx.subaccount);
    if (owner !== who.externalOrgId) return { status: 'forbidden' };
  }

  return {
    status: 'ok',
    data: { snapshot: buildOrderSnapshot(tx), trackingNumber: tx.trackingNumber },
  };
}

type OmsTransaction = NonNullable<Awaited<ReturnType<typeof getTransactionById>>>;

/**
 * Reduce an OMS order to the minimal, customer-safe context HeyQ needs to triage.
 *
 * Passed: delivery status, service type, a short delivery summary, a city-level
 * route, and the booking date. Withheld: recipient name/contact/address, payment
 * and COD values, parcel contents, fees, batch/internal attribution.
 */
function buildOrderSnapshot(tx: OmsTransaction): HeyQOrderSnapshot {
  const meta = statusConfig[tx.status];
  return {
    deliveryStatus: tx.status,
    deliveryStatusLabel: meta?.label ?? tx.status,
    serviceType: serviceTypeLabel(tx.serviceType),
    deliverySummary: `${tx.type} delivery`,
    // City-level only — never the street address.
    route: `${cityOf(tx.sender?.address)} → ${cityOf(tx.destination)}`,
    bookedOn: tx.date,
  };
}

/** Collapse an address to a city-level fragment. Defensive about mock shapes. */
function cityOf(value: string | undefined): string {
  if (!value) return 'Metro Manila';
  const parts = value.split(',').map((p) => p.trim()).filter(Boolean);
  return parts.length >= 2 ? parts.slice(-2).join(', ') : (parts[0] ?? value);
}

// ── Handoff into HeyQ ────────────────────────────────────────────────────────

/** HeyQ's contact form, optionally deep-linked to one authorized order. */
export function buildContactUrl(externalOrderId?: string): string {
  const base = `${getHeyQBaseUrl()}/contact`;
  return externalOrderId
    ? `${base}?order=${encodeURIComponent(externalOrderId)}`
    : base;
}

function openExternal(url: string): void {
  if (typeof window === 'undefined') return;
  window.open(url, '_blank', 'noopener,noreferrer');
}

/** General support: open HeyQ with no preselected order. */
export function openHeyQContact(): void {
  openExternal(buildContactUrl());
}

/**
 * Order-linked support: authorize the order against OMS, then hand off to HeyQ
 * with its stable id. Returns the outcome so the caller can explain a refusal
 * rather than silently opening an unlinked form.
 */
export async function startOrderHandoff(
  externalOrderId: string,
): Promise<HeyQResult<{ url: string }>> {
  const who = await getRequesterIdentity();
  if (!who) return { status: 'forbidden' };

  const authorized = await getAuthorizedOrder(who, externalOrderId);
  if (authorized.status !== 'ok') return authorized;

  const url = buildContactUrl(externalOrderId);
  openExternal(url);
  return { status: 'ok', data: { url } };
}

// ── Embedded report submission (creates a ticket via the HeyQ customer API) ──

export interface OrderReportInput {
  externalOrderId: string;
  concernType: HeyQConcernType;
  subject: string;
  description: string;
}

/**
 * Submit an order-linked report from inside Business+ (the report drawer). The
 * order is authorized through the OMS boundary FIRST — an out-of-scope order is
 * refused, never submitted — then the ticket is created via HeyQ's customer API
 * with the identity and the OMS-captured snapshot. Returns the created customer
 * ticket so the caller can link straight to it.
 */
export async function submitOrderReport(input: OrderReportInput): Promise<HeyQResult<CustomerTicket>> {
  const session = await getSessionContext();
  if (!session.isAuthenticated || !session.user || !session.accountId) return { status: 'forbidden' };
  const who: HeyQRequesterIdentity = {
    externalUserId: session.user.email,
    externalOrgId: session.accountId,
  };

  // OMS authorization is the gate — Business+ owns it.
  const authorized = await getAuthorizedOrder(who, input.externalOrderId);
  if (authorized.status !== 'ok') return authorized;

  return apiCreateTicket(who, {
    name: session.user.name,
    email: session.user.email,
    concernType: input.concernType,
    subject: input.subject,
    description: input.description,
    linkedOrder: {
      externalOrderId: input.externalOrderId,
      trackingNumber: authorized.data.trackingNumber,
      snapshot: authorized.data.snapshot,
      capturedAt: new Date().toISOString(),
    },
  });
}

// ── Requester-facing ticket reads + writes (HeyQ customer API) ────────────────

/** The signed-in user's tickets. Scoped by HeyQ to their identity. */
export async function listMyTickets(): Promise<CustomerTicket[]> {
  const who = await getRequesterIdentity();
  if (!who) return [];
  return apiListMyTickets(who);
}

/** One of the signed-in user's tickets. Another user's ticket is `not_found`. */
export async function getMyTicket(id: string): Promise<HeyQResult<CustomerTicket>> {
  const who = await getRequesterIdentity();
  if (!who) return { status: 'forbidden' };
  return apiGetMyTicket(who, id);
}

/** Post a public reply. Replying to a resolved/closed ticket reopens it in HeyQ. */
export async function replyToMyTicket(
  id: string,
  body: string,
): Promise<HeyQResult<CustomerTicket>> {
  const who = await getRequesterIdentity();
  if (!who) return { status: 'forbidden' };
  return apiReplyToMyTicket(who, id, body);
}

/** Reopen a resolved/closed ticket. HeyQ owns the resulting state transition. */
export async function reopenMyTicket(id: string): Promise<HeyQResult<CustomerTicket>> {
  const who = await getRequesterIdentity();
  if (!who) return { status: 'forbidden' };
  return apiReopenMyTicket(who, id);
}

// ── Live order status (OMS, not HeyQ) ────────────────────────────────────────

/**
 * Re-read a linked order's CURRENT delivery status from OMS, for the "snapshot
 * vs live" comparison on a ticket. Routed through the OMS service boundary.
 *
 * A live shipment change never moves the HeyQ ticket status, and vice versa —
 * they are independent dimensions. `not_found` here is normal and expected: the
 * order may have been archived upstream since the ticket was raised, and the
 * ticket must still render from its snapshot.
 */
export async function getLiveOrderStatus(
  externalOrderId: string,
): Promise<HeyQResult<{ deliveryStatus: string; deliveryStatusLabel: string }>> {
  const who = await getRequesterIdentity();
  if (!who) return { status: 'forbidden' };
  const authorized = await getAuthorizedOrder(who, externalOrderId);
  if (authorized.status !== 'ok') return authorized;
  const { snapshot } = authorized.data;
  return {
    status: 'ok',
    data: {
      deliveryStatus: snapshot.deliveryStatus,
      deliveryStatusLabel: snapshot.deliveryStatusLabel,
    },
  };
}
