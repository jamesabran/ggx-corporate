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
 * Every Business+ ↔ HeyQ interaction goes through this module. Today it is
 * backed by the mock HeyQ backend (`data/heyqTickets.ts`); when HeyQ exposes a
 * real API, only the bodies below change — callers do not.
 *
 * Future HeyQ endpoints (requester-scoped; a session token replaces the identity
 * we pass explicitly today):
 *   GET  /requester/tickets            → listMyTickets
 *   GET  /requester/tickets/:id        → getMyTicket
 *   POST /requester/tickets/:id/replies→ replyToMyTicket
 *   POST /requester/tickets/:id/reopen → reopenMyTicket
 *   (ticket creation happens in HeyQ's own /contact form — we hand off to it)
 *
 * ── What this adapter deliberately does NOT do ─────────────────────────────
 * It exposes no agent/internal surface. Internal notes, assignee identity, team
 * queue, SLA policy, support tier and escalation state exist on the HeyQ record
 * and are dropped in `toCustomerView` — they must never reach a Business+ page.
 * Agent actions belong to the HeyQ agent app.
 */

import {
  listTicketsForRequester,
  getTicketForRequester,
  addRequesterReply,
  reopenTicketForRequester,
  createTicketForRequester,
  heyqServiceState,
  HEYQ_CONCERN_LABELS,
  type HeyQTicketRecord,
  type HeyQTicketStatus,
  type HeyQRequesterIdentity,
  type HeyQLinkedOrder,
  type HeyQOrderSnapshot,
  type HeyQConcernType,
  type HeyQMessage,
} from '../data/heyqTickets';
import { getTransactionById, statusConfig, serviceTypeLabel } from './transactionService';
import { getSessionContext } from './authService';
import { getAccountIdByName } from '../data/accounts';

export type {
  HeyQTicketStatus,
  HeyQOrderSnapshot,
  HeyQLinkedOrder,
  HeyQConcernType,
  HeyQRequesterIdentity,
};
export { HEYQ_CONCERN_LABELS };

// ── Configuration ────────────────────────────────────────────────────────────

/**
 * Where the HeyQ app lives. Override with VITE_HEYQ_URL; the default matches
 * HeyQ's dev server when Business+ already holds port 5173 (`PORT=5174 npm run
 * dev` in the HeyQ repo).
 */
export function getHeyQBaseUrl(): string {
  const configured =
    typeof import.meta !== 'undefined' ? import.meta.env?.VITE_HEYQ_URL : undefined;
  return (configured || 'http://localhost:5174').replace(/\/$/, '');
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

// ── Identity ─────────────────────────────────────────────────────────────────

/**
 * The signed-in Business+ user, as HeyQ's requester identity. In production the
 * handoff carries a verifiable session (e.g. a signed token) that resolves to
 * this on HeyQ's side; today we pass the external ids explicitly.
 *
 * `externalOrgId` is the ACCOUNT SCOPE — Admin is `main` (sees everything),
 * a Manager is their subaccount. It is also what scopes order authorization.
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
 * and COD values, parcel contents, fees, batch/internal attribution. HeyQ shows
 * exactly what it is given, so what we withhold here is withheld for good.
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

/** HeyQ's token-scoped requester portal. A reference alone does not grant access. */
export function buildRequesterTicketUrl(accessToken: string): string {
  return `${getHeyQBaseUrl()}/t/${encodeURIComponent(accessToken)}`;
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
  if (!heyqServiceState.available) return { status: 'unavailable' };

  const who = await getRequesterIdentity();
  if (!who) return { status: 'forbidden' };

  const authorized = await getAuthorizedOrder(who, externalOrderId);
  if (authorized.status !== 'ok') return authorized;

  const url = buildContactUrl(externalOrderId);
  openExternal(url);
  return { status: 'ok', data: { url } };
}

/** Open the HeyQ requester portal for one of the caller's own tickets. */
export function openRequesterTicket(ticket: Pick<HeyQTicketRecord, 'accessToken'>): void {
  openExternal(buildRequesterTicketUrl(ticket.accessToken));
}

// ── Requester-facing ticket reads ────────────────────────────────────────────

/**
 * Project a HeyQ record down to what a customer may see.
 *
 * This function IS the privacy boundary: assignee identity, escalation state,
 * support tier, SLA policy, and internal notes are dropped here and have no
 * route into Business+.
 */
function toCustomerView(t: HeyQTicketRecord): CustomerTicket {
  return {
    id: t.id,
    reference: t.reference,
    subject: t.subject,
    concernType: t.concernType,
    issueType: HEYQ_CONCERN_LABELS[t.concernType],
    status: t.status,
    priority: t.priority,
    supportTeam: t.teamName,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
    resolvedAt: t.resolvedAt,
    reopenedAt: t.reopenedAt,
    linkedOrder: t.linkedOrder,
    messages: t.messages.map(toCustomerMessage),
    canReopen: t.status === 'resolved' || t.status === 'closed',
  };
}

function toCustomerMessage(m: HeyQMessage): CustomerTicketMessage {
  const from = m.authorType === 'requester' ? 'you' : m.authorType === 'agent' ? 'support' : 'system';
  return { id: m.id, from, authorLabel: m.authorName, body: m.body, createdAt: m.createdAt };
}

/** The signed-in user's tickets. Scoped by HeyQ to their identity. */
export async function listMyTickets(): Promise<CustomerTicket[]> {
  if (!heyqServiceState.available) return [];
  const who = await getRequesterIdentity();
  if (!who) return [];
  return listTicketsForRequester(who).map(toCustomerView);
}

/** One of the signed-in user's tickets. Another user's ticket is `not_found`. */
export async function getMyTicket(id: string): Promise<HeyQResult<CustomerTicket>> {
  if (!heyqServiceState.available) return { status: 'unavailable' };
  const who = await getRequesterIdentity();
  if (!who) return { status: 'forbidden' };
  const t = getTicketForRequester(who, id);
  if (!t) return { status: 'not_found' };
  return { status: 'ok', data: toCustomerView(t) };
}

/** The raw record, for actions that need the access token (portal handoff). */
export async function getMyTicketRecord(id: string): Promise<HeyQTicketRecord | null> {
  const who = await getRequesterIdentity();
  if (!who) return null;
  return getTicketForRequester(who, id) ?? null;
}

/** Post a public reply. Replying to a resolved/closed ticket reopens it in HeyQ. */
export async function replyToMyTicket(
  id: string,
  body: string,
): Promise<HeyQResult<CustomerTicket>> {
  if (!heyqServiceState.available) return { status: 'unavailable' };
  const who = await getRequesterIdentity();
  if (!who) return { status: 'forbidden' };
  const t = addRequesterReply(who, id, body);
  if (!t) return { status: 'not_found' };
  return { status: 'ok', data: toCustomerView(t) };
}

/** Reopen a resolved/closed ticket. HeyQ owns the resulting state transition. */
export async function reopenMyTicket(id: string): Promise<HeyQResult<CustomerTicket>> {
  if (!heyqServiceState.available) return { status: 'unavailable' };
  const who = await getRequesterIdentity();
  if (!who) return { status: 'forbidden' };
  const t = reopenTicketForRequester(who, id);
  if (!t) return { status: 'not_found' };
  return { status: 'ok', data: toCustomerView(t) };
}

/**
 * Submit a ticket to HeyQ on the requester's behalf.
 *
 * The product flow hands the user off to HeyQ's own /contact form — this exists
 * because the mock HeyQ backend is in-process, so tests (and the demo seam) need
 * a way to perform the submission HeyQ would perform itself. Authorization on
 * the linked order is re-checked HERE, at the service boundary, not just in the
 * picker: an out-of-scope order aborts the submission rather than half-creating
 * a ticket.
 */
export async function submitTicketToHeyQ(input: {
  subject: string;
  description: string;
  concernType: HeyQConcernType;
  externalOrderId?: string;
}): Promise<HeyQResult<CustomerTicket>> {
  if (!heyqServiceState.available) return { status: 'unavailable' };
  const who = await getRequesterIdentity();
  if (!who) return { status: 'forbidden' };

  let linkedOrder: HeyQLinkedOrder | undefined;
  if (input.externalOrderId) {
    const authorized = await getAuthorizedOrder(who, input.externalOrderId);
    if (authorized.status !== 'ok') return authorized;
    linkedOrder = {
      externalOrderId: input.externalOrderId,
      trackingNumber: authorized.data.trackingNumber,
      snapshot: authorized.data.snapshot,
      capturedAt: new Date().toISOString(),
    };
  }

  const created = createTicketForRequester({
    who,
    subject: input.subject,
    description: input.description,
    concernType: input.concernType,
    linkedOrder,
  });
  return { status: 'ok', data: toCustomerView(created) };
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
