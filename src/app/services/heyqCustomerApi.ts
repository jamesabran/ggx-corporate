/**
 * heyqCustomerApi — the HTTP client behind the heyqService seam.
 *
 * This is where Business+ actually talks to the deployed HeyQ mock API (Railway)
 * over its CUSTOMER surface:
 *   GET  /api/customer/tickets            → the signed-in requester's tickets
 *   GET  /api/customer/tickets/:id        → one of them
 *   POST /api/tickets/:id/messages        → a requester reply
 *   POST /api/tickets/:id/reopen          → a requester reopen
 *
 * HeyQ enforces visibility SERVER-SIDE (server/visibility.ts): the response is
 * already projected to what a customer may see — no internal notes, assignee,
 * escalation, SLA or tier. This module is a SHAPE adapter, not the privacy
 * boundary, but it still constructs the Business+ `CustomerTicket` by an explicit
 * field allowlist (`toCustomerTicket` below), so a malformed or over-broad
 * response can never surface an agent-only field into Business+.
 *
 * Requester identity is passed as query params today (externalUserId/Org). When
 * HeyQ ships a real session, that handoff replaces these params; callers and this
 * module's shape do not change.
 */
import type {
  CustomerTicket,
  CustomerTicketMessage,
  HeyQConcernType,
  HeyQLinkedOrder,
  HeyQOrderSnapshot,
  HeyQRequesterIdentity,
  HeyQResult,
  HeyQTicketStatus,
} from './heyqService';

// ── Configuration ────────────────────────────────────────────────────────────

/**
 * Origin of the deployed HeyQ API (the standalone Railway service). Distinct from
 * `VITE_HEYQ_URL`, which is the HeyQ *frontend* used to OPEN HeyQ pages (contact
 * form, portal). Override with `VITE_HEYQ_API_URL`; requests resolve to
 * `${base}/api/...`. No trailing slash, no `/api` suffix.
 */
export function getHeyQApiBaseUrl(): string {
  const configured =
    typeof import.meta !== 'undefined' ? import.meta.env?.VITE_HEYQ_API_URL : undefined;
  return (configured || 'https://heyq-api-production.up.railway.app').replace(/\/+$/, '');
}

// ── HeyQ response shapes (what the customer API returns) ──────────────────────
// Only the fields Business+ reads are typed. HeyQ's own model is the source of
// truth; these mirror its M23 customer projection (src/app/models/ticket.ts).

interface HeyQApiMessage {
  id: string;
  from: 'you' | 'support' | 'system';
  authorLabel: string;
  body: string;
  createdAt: string;
}

interface HeyQApiSnapshot {
  shipmentStatus: string;
  bookingDate: string;
  destination?: string;
  serviceType?: string;
  deliverySummary?: string;
  route?: string;
}

interface HeyQApiLinkedOrder {
  externalOrderId: string;
  trackingNumber: string;
  snapshot?: HeyQApiSnapshot;
  capturedAt: string;
}

interface HeyQApiCustomerTicket {
  id: string;
  reference: string;
  subject: string;
  concernType?: string;
  issueType: string;
  status: HeyQTicketStatus;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  supportTeam: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  reopenedAt?: string;
  linkedOrder?: HeyQApiLinkedOrder;
  messages?: HeyQApiMessage[];
  canReopen: boolean;
}

// ── HeyQ → Business+ mapping ──────────────────────────────────────────────────

/**
 * HeyQ concern keys don't all exist in Business+; map the overlap and default the
 * rest to a general enquiry. The human label (`issueType`) is taken verbatim from
 * HeyQ, so the displayed text is always HeyQ's own wording regardless of this map.
 */
const CONCERN_FROM_HEYQ: Record<string, HeyQConcernType> = {
  delivery_delay: 'delivery_delay',
  failed_delivery: 'failed_delivery',
  pickup_issue: 'general_inquiry',
  missing_parcel: 'missing_parcel',
  damaged_parcel: 'damaged_parcel',
  cod_concern: 'cod_concern',
  remittance_concern: 'cod_concern',
  payment_issue: 'billing_issue',
  billing_issue: 'billing_issue',
  booking_issue: 'general_inquiry',
  address_correction: 'address_correction',
  account_concern: 'general_inquiry',
  general_inquiry: 'general_inquiry',
};

/**
 * Map HeyQ's shipment status to a Business+ OMS delivery-status key (for the badge
 * palette) plus a display label. Keeps the linked-order snapshot rendering in the
 * same vocabulary as the rest of the app's delivery statuses.
 */
const SHIPMENT_FROM_HEYQ: Record<string, { key: string; label: string }> = {
  booked: { key: 'pending', label: 'Booked' },
  picked_up: { key: 'picked-up', label: 'Picked Up' },
  in_transit: { key: 'in-transit', label: 'In Transit' },
  out_for_delivery: { key: 'in-transit', label: 'Out for Delivery' },
  delivered: { key: 'delivered', label: 'Delivered' },
  failed_delivery: { key: 'failed', label: 'Failed' },
  returned: { key: 'returned', label: 'Returned' },
  cancelled: { key: 'failed', label: 'Cancelled' },
  on_hold: { key: 'pending', label: 'On Hold' },
};

function toSnapshot(s: HeyQApiSnapshot): HeyQOrderSnapshot {
  const mapped = SHIPMENT_FROM_HEYQ[s.shipmentStatus] ?? { key: s.shipmentStatus, label: s.shipmentStatus };
  return {
    deliveryStatus: mapped.key,
    deliveryStatusLabel: mapped.label,
    serviceType: s.serviceType ?? '—',
    deliverySummary: s.deliverySummary ?? '',
    route: s.route ?? s.destination ?? '',
    bookedOn: s.bookingDate,
  };
}

function toLinkedOrder(o: HeyQApiLinkedOrder): HeyQLinkedOrder {
  return {
    externalOrderId: o.externalOrderId,
    trackingNumber: o.trackingNumber,
    snapshot: o.snapshot ? toSnapshot(o.snapshot) : undefined,
    capturedAt: o.capturedAt,
  };
}

function toMessage(m: HeyQApiMessage): CustomerTicketMessage {
  return { id: m.id, from: m.from, authorLabel: m.authorLabel, body: m.body, createdAt: m.createdAt };
}

/**
 * Build the Business+ `CustomerTicket` by an explicit allowlist. Only these
 * fields are copied — nothing is spread — so an unexpected agent-only field on
 * the response has no path into Business+.
 */
function toCustomerTicket(t: HeyQApiCustomerTicket): CustomerTicket {
  return {
    id: t.id,
    reference: t.reference,
    subject: t.subject,
    concernType: (t.concernType && CONCERN_FROM_HEYQ[t.concernType]) || 'general_inquiry',
    issueType: t.issueType,
    status: t.status,
    priority: t.priority,
    supportTeam: t.supportTeam,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
    resolvedAt: t.resolvedAt,
    reopenedAt: t.reopenedAt,
    linkedOrder: t.linkedOrder ? toLinkedOrder(t.linkedOrder) : undefined,
    messages: (t.messages ?? []).map(toMessage),
    canReopen: t.canReopen,
  };
}

// ── HTTP ─────────────────────────────────────────────────────────────────────

function identityQuery(who: HeyQRequesterIdentity): string {
  const q = new URLSearchParams({
    externalUserId: who.externalUserId,
    externalOrgId: who.externalOrgId,
  });
  return q.toString();
}

/** Map an HTTP status to the adapter's production-shaped result union. */
function resultForStatus(status: number): 'forbidden' | 'not_found' | 'unavailable' {
  if (status === 403) return 'forbidden';
  if (status === 404) return 'not_found';
  return 'unavailable'; // 5xx, 429, and anything else transient/unknown
}

async function getJson(path: string): Promise<
  { ok: true; data: unknown } | { ok: false; result: 'forbidden' | 'not_found' | 'unavailable' }
> {
  try {
    const res = await fetch(`${getHeyQApiBaseUrl()}/api${path}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return { ok: false, result: resultForStatus(res.status) };
    return { ok: true, data: await res.json() };
  } catch {
    return { ok: false, result: 'unavailable' }; // network / CORS / DNS
  }
}

async function post(path: string, body?: unknown): Promise<
  { ok: true } | { ok: false; result: 'forbidden' | 'not_found' | 'unavailable' }
> {
  try {
    const res = await fetch(`${getHeyQApiBaseUrl()}/api${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (!res.ok) return { ok: false, result: resultForStatus(res.status) };
    return { ok: true };
  } catch {
    return { ok: false, result: 'unavailable' };
  }
}

// ── Public operations (consumed by heyqService) ───────────────────────────────

/** The signed-in requester's tickets. Any failure degrades to an empty list. */
export async function apiListMyTickets(who: HeyQRequesterIdentity): Promise<CustomerTicket[]> {
  const res = await getJson(`/customer/tickets?${identityQuery(who)}`);
  if (!res.ok || !Array.isArray(res.data)) return [];
  return (res.data as HeyQApiCustomerTicket[]).map(toCustomerTicket);
}

/** One of the requester's tickets, or a typed failure. */
export async function apiGetMyTicket(
  who: HeyQRequesterIdentity,
  id: string,
): Promise<HeyQResult<CustomerTicket>> {
  const res = await getJson(`/customer/tickets/${encodeURIComponent(id)}?${identityQuery(who)}`);
  if (!res.ok) return { status: res.result };
  return { status: 'ok', data: toCustomerTicket(res.data as HeyQApiCustomerTicket) };
}

/**
 * Post a requester reply, then re-read the customer view so the caller gets the
 * updated thread + (if the ticket was resolved/closed) the reopened status.
 */
export async function apiReplyToMyTicket(
  who: HeyQRequesterIdentity,
  id: string,
  body: string,
): Promise<HeyQResult<CustomerTicket>> {
  const posted = await post(`/tickets/${encodeURIComponent(id)}/messages`, { body });
  if (!posted.ok) return { status: posted.result };
  return apiGetMyTicket(who, id);
}

/** Reopen a resolved/closed ticket, then re-read the customer view. */
export async function apiReopenMyTicket(
  who: HeyQRequesterIdentity,
  id: string,
): Promise<HeyQResult<CustomerTicket>> {
  const posted = await post(`/tickets/${encodeURIComponent(id)}/reopen`);
  if (!posted.ok) return { status: posted.result };
  return apiGetMyTicket(who, id);
}
