/**
 * Mock HeyQ backend — the stand-in for the future HeyQ service.
 *
 * ── What this is ───────────────────────────────────────────────────────────
 * HeyQ owns tickets: assignment, escalation, messages, status changes,
 * resolution, reopening, and history. This module simulates that service so
 * Business+ can be built against a real-shaped boundary before HeyQ exposes an
 * API. It is reached ONLY through `services/heyqService.ts` (the adapter) —
 * pages must never import this module directly.
 *
 * ── Ownership boundary (important) ─────────────────────────────────────────
 * Records here carry BOTH customer-visible and agent-only fields, exactly as a
 * real HeyQ ticket does. The agent-only fields (internal notes, assignee
 * identity, team queue, SLA policy, escalation state, support tier) exist so the
 * boundary is real and testable: the adapter's requester-facing reads must never
 * project them into Business+. See `toCustomerView` in heyqService.
 *
 * The two operation groups below mirror the real split:
 *   • requester ops — what Business+ (a requester client) may call.
 *   • agent ops     — what the HeyQ agent app calls. They exist here only so the
 *                     agent side of the lifecycle can be simulated/tested; the
 *                     Business+ adapter does not expose them.
 *
 * Order/shipment data is NOT owned here. A linked order is stored as a stable
 * OMS order id + a minimal snapshot captured at submission time.
 */

import { loadState, saveState, clearState } from '../lib/storage';

// ── Ticket state ─────────────────────────────────────────────────────────────
// HeyQ's six statuses. Reopen is an EVENT, not a status (a reopened ticket
// returns to open/in_progress and carries `reopenedAt`). Escalation is a
// SEPARATE dimension from status — an escalated ticket is still in_progress.

export type HeyQTicketStatus =
  | 'new'
  | 'open'
  | 'in_progress'
  | 'on_hold'
  | 'resolved'
  | 'closed';

export type HeyQHoldReason =
  | 'waiting_requester'
  | 'waiting_internal'
  | 'waiting_third_party';

export type HeyQEscalationState = 'none' | 'escalated' | 'returned_to_l1';

export type HeyQPriority = 'low' | 'normal' | 'high' | 'urgent';

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
 * The minimal, customer-safe order context captured at submission.
 *
 * This is deliberately NOT the OMS order model — no recipient contact, address,
 * payment, parcel, or fee data crosses into HeyQ. Delivery status here is the
 * SHIPMENT status as it stood when the ticket was raised; it is independent of
 * the ticket's own workflow status and never changes it.
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

/** A public conversation entry. Internal notes are a SEPARATE type (below). */
export interface HeyQMessage {
  id: string;
  authorType: 'requester' | 'agent' | 'system';
  authorName: string;
  body: string;
  createdAt: string;
}

/** Agent-only. Never leaves HeyQ — the adapter has no path that reads this. */
interface HeyQInternalNote {
  id: string;
  agentName: string;
  body: string;
  createdAt: string;
}

export interface HeyQTicketRecord {
  id: string;
  /** Human reference shown to the requester. */
  reference: string;
  subject: string;
  description: string;
  concernType: HeyQConcernType;
  status: HeyQTicketStatus;
  holdReason?: HeyQHoldReason;
  priority: HeyQPriority;

  /** External identity of the requester (the Business+ user + org). */
  externalUserId: string;
  externalOrgId: string;

  /** Opaque token granting requester-portal access. A reference alone does not. */
  accessToken: string;

  linkedOrder?: HeyQLinkedOrder;
  messages: HeyQMessage[];

  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  reopenedAt?: string;

  // ── Agent-only from here down. The adapter must not project these. ────────
  assigneeName?: string;
  teamName: string;
  escalationState: HeyQEscalationState;
  supportTier: 'L1' | 'L2';
  slaPolicyId: string;
  internalNotes: HeyQInternalNote[];
}

// ── Seed ─────────────────────────────────────────────────────────────────────
// Linked orders reference REAL Business+ OMS tracking numbers so the snapshot /
// live-status paths are demonstrable. Covers: an escalated-but-in-progress
// ticket (status vs escalation are independent), a resolved one (reopenable), a
// closed one, an on-hold one, a no-order ticket, a STALE snapshot (delivery has
// moved on since capture), and a linked order that no longer exists in OMS.

// External identity = the Business+ user + the account scope they are signed in
// as (see heyqService.getRequesterIdentity). `main` is the Admin's scope.
const ORG = 'main';
const USER = 'max@email.com';

const SEED: HeyQTicketRecord[] = [
  {
    id: 'HQ-10241',
    reference: 'HQ-10241',
    subject: 'Delivery failed but recipient was available',
    description:
      'The rider marked GGX-2026-90008 as a failed delivery, but the recipient confirms they were on site all afternoon. Please re-attempt.',
    concernType: 'failed_delivery',
    status: 'in_progress',
    priority: 'high',
    externalUserId: USER,
    externalOrgId: ORG,
    accessToken: 'tok_hq10241_9fbc31a2',
    linkedOrder: {
      externalOrderId: 'GGX-2026-90008',
      trackingNumber: 'GGX-2026-90008',
      capturedAt: '2026-06-01T09:12:00Z',
      snapshot: {
        deliveryStatus: 'failed',
        deliveryStatusLabel: 'Failed',
        serviceType: 'On-Demand',
        deliverySummary: 'Standard delivery',
        route: 'Metro Manila → Pasig City',
        bookedOn: '2026-05-31',
      },
    },
    messages: [
      {
        id: 'HQ-10241-m1', authorType: 'requester', authorName: 'You',
        body: 'The rider marked this as a failed delivery, but our recipient confirms they were on site all afternoon. Please re-attempt.',
        createdAt: '2026-06-01T09:12:00Z',
      },
      {
        id: 'HQ-10241-m2', authorType: 'agent', authorName: 'Customer Support',
        body: 'Thanks for flagging this — we have raised it with the delivery hub and requested a re-attempt. We will update you within 24 hours.',
        createdAt: '2026-06-01T11:40:00Z',
      },
      {
        id: 'HQ-10241-m3', authorType: 'agent', authorName: 'Claims',
        body: 'A re-delivery has been scheduled for tomorrow morning and the rider has been asked to call on arrival.',
        createdAt: '2026-06-02T08:05:00Z',
      },
    ],
    createdAt: '2026-06-01T09:12:00Z',
    updatedAt: '2026-06-02T08:05:00Z',
    // Escalated AND in_progress — the two dimensions are independent.
    assigneeName: 'Bea Santos',
    teamName: 'Claims',
    escalationState: 'escalated',
    supportTier: 'L2',
    slaPolicyId: 'sla-high',
    internalNotes: [
      { id: 'HQ-10241-n1', agentName: 'Alex Cruz', body: 'Hub confirms rider mis-scanned. Escalating to Claims for goodwill credit — do not disclose.', createdAt: '2026-06-01T12:02:00Z' },
    ],
  },
  {
    id: 'HQ-10238',
    reference: 'HQ-10238',
    subject: 'Parcel still in transit past the promised date',
    description: 'GGX-2026-90004 has been in transit for five days with no movement.',
    concernType: 'delivery_delay',
    status: 'on_hold',
    holdReason: 'waiting_third_party',
    priority: 'normal',
    externalUserId: USER,
    externalOrgId: ORG,
    accessToken: 'tok_hq10238_4a71de08',
    linkedOrder: {
      externalOrderId: 'GGX-2026-90004',
      trackingNumber: 'GGX-2026-90004',
      capturedAt: '2026-06-01T02:30:00Z',
      snapshot: {
        deliveryStatus: 'in-transit',
        deliveryStatusLabel: 'In Transit',
        serviceType: 'Standard',
        deliverySummary: 'Standard delivery',
        route: 'Metro Manila → Iloilo City',
        bookedOn: '2026-05-30',
      },
    },
    messages: [
      {
        id: 'HQ-10238-m1', authorType: 'requester', authorName: 'You',
        body: 'This parcel has been in transit for five days with no movement. Can you check with the hub?',
        createdAt: '2026-06-01T02:30:00Z',
      },
      {
        id: 'HQ-10238-m2', authorType: 'agent', authorName: 'Customer Support',
        body: 'We have raised a trace with the Visayas hub and are waiting on their response. We will come back to you as soon as we hear.',
        createdAt: '2026-06-01T06:15:00Z',
      },
    ],
    createdAt: '2026-06-01T02:30:00Z',
    updatedAt: '2026-06-01T06:15:00Z',
    assigneeName: 'Alex Cruz',
    teamName: 'Customer Support',
    escalationState: 'none',
    supportTier: 'L1',
    slaPolicyId: 'sla-normal',
    internalNotes: [],
  },
  {
    id: 'HQ-10230',
    reference: 'HQ-10230',
    subject: 'COD amount remitted does not match the order',
    description: 'The COD remitted for GGX-2026-90001 is short by ₱1,200.',
    concernType: 'cod_concern',
    status: 'resolved',
    priority: 'high',
    externalUserId: USER,
    externalOrgId: ORG,
    accessToken: 'tok_hq10230_c02f5b19',
    linkedOrder: {
      externalOrderId: 'GGX-2026-90001',
      trackingNumber: 'GGX-2026-90001',
      capturedAt: '2026-05-29T04:00:00Z',
      // STALE by design: captured while the order was still 'pending'; OMS has
      // since moved it to 'picked-up'. Proves the ticket renders from its
      // snapshot, and that a live shipment change never moves ticket status.
      snapshot: {
        deliveryStatus: 'pending',
        deliveryStatusLabel: 'Pending',
        serviceType: 'Standard',
        deliverySummary: 'Express delivery',
        route: 'Metro Manila → Davao City',
        bookedOn: '2026-05-29',
      },
    },
    messages: [
      {
        id: 'HQ-10230-m1', authorType: 'requester', authorName: 'You',
        body: 'The COD remitted for this order is short by ₱1,200 against what we booked.',
        createdAt: '2026-05-29T04:00:00Z',
      },
      {
        id: 'HQ-10230-m2', authorType: 'agent', authorName: 'Billing',
        body: 'You were right — a partial remittance was posted in error. The ₱1,200 balance has been included in your next settlement run.',
        createdAt: '2026-05-30T07:20:00Z',
      },
      {
        id: 'HQ-10230-m3', authorType: 'system', authorName: 'HeyQ',
        body: 'Ticket resolved: Solved.',
        createdAt: '2026-05-30T07:22:00Z',
      },
    ],
    createdAt: '2026-05-29T04:00:00Z',
    updatedAt: '2026-05-30T07:22:00Z',
    resolvedAt: '2026-05-30T07:22:00Z',
    assigneeName: 'Dana Lim',
    teamName: 'Billing',
    escalationState: 'none',
    supportTier: 'L1',
    slaPolicyId: 'sla-high',
    internalNotes: [],
  },
  {
    id: 'HQ-10221',
    reference: 'HQ-10221',
    subject: 'Invoice line item unclear',
    description: 'We need a breakdown of the fuel surcharge on last month invoice.',
    concernType: 'billing_issue',
    status: 'closed',
    priority: 'low',
    externalUserId: USER,
    externalOrgId: ORG,
    accessToken: 'tok_hq10221_77ab90ce',
    // No linked order — a general enquiry raised straight from Support Tickets.
    messages: [
      {
        id: 'HQ-10221-m1', authorType: 'requester', authorName: 'You',
        body: 'Could you break down the fuel surcharge line on last month invoice?',
        createdAt: '2026-05-20T01:10:00Z',
      },
      {
        id: 'HQ-10221-m2', authorType: 'agent', authorName: 'Billing',
        body: 'Sent the itemised breakdown to your billing contact. Closing this out — reopen any time if you need more detail.',
        createdAt: '2026-05-21T03:45:00Z',
      },
    ],
    createdAt: '2026-05-20T01:10:00Z',
    updatedAt: '2026-05-21T03:45:00Z',
    resolvedAt: '2026-05-21T03:45:00Z',
    assigneeName: 'Dana Lim',
    teamName: 'Billing',
    escalationState: 'none',
    supportTier: 'L1',
    slaPolicyId: 'sla-low',
    internalNotes: [],
  },
  {
    id: 'HQ-10215',
    reference: 'HQ-10215',
    subject: 'Package arrived damaged',
    description: 'Reported against an order that has since been archived upstream.',
    concernType: 'damaged_parcel',
    status: 'open',
    priority: 'normal',
    externalUserId: USER,
    externalOrgId: ORG,
    accessToken: 'tok_hq10215_18de44f7',
    // Linked to an order that no longer resolves in OMS. The ticket must still
    // list, search, and render — from the snapshot alone.
    linkedOrder: {
      externalOrderId: 'GGX-2023-00001',
      trackingNumber: 'GGX-2023-00001',
      capturedAt: '2026-05-15T05:00:00Z',
      snapshot: {
        deliveryStatus: 'delivered',
        deliveryStatusLabel: 'Delivered',
        serviceType: 'Standard',
        deliverySummary: 'Standard delivery',
        route: 'Metro Manila → Cebu City',
        bookedOn: '2026-05-12',
      },
    },
    messages: [
      {
        id: 'HQ-10215-m1', authorType: 'requester', authorName: 'You',
        body: 'The parcel arrived with a crushed corner and the contents are damaged. Photos attached.',
        createdAt: '2026-05-15T05:00:00Z',
      },
    ],
    createdAt: '2026-05-15T05:00:00Z',
    updatedAt: '2026-05-15T05:00:00Z',
    teamName: 'Claims',
    escalationState: 'none',
    supportTier: 'L1',
    slaPolicyId: 'sla-normal',
    internalNotes: [],
  },
  {
    // Belongs to a DIFFERENT identity (the Acme Luzon manager). It must never
    // appear for the Admin identity above — requester reads are scoped, and this
    // row is what proves it.
    id: 'HQ-10208',
    reference: 'HQ-10208',
    subject: 'Pickup missed for the Luzon morning batch',
    description: 'The rider did not arrive for the scheduled pickup window.',
    concernType: 'general_inquiry',
    status: 'open',
    priority: 'normal',
    externalUserId: 'manager@email.com',
    externalOrgId: 'acme-luzon',
    accessToken: 'tok_hq10208_5be1c73d',
    linkedOrder: {
      externalOrderId: 'GGX-2026-90009',
      trackingNumber: 'GGX-2026-90009',
      capturedAt: '2026-06-01T01:00:00Z',
      snapshot: {
        deliveryStatus: 'in-transit',
        deliveryStatusLabel: 'In Transit',
        serviceType: 'Standard',
        deliverySummary: 'Express delivery',
        route: 'Metro Manila → Quezon City',
        bookedOn: '2026-05-31',
      },
    },
    messages: [
      {
        id: 'HQ-10208-m1', authorType: 'requester', authorName: 'You',
        body: 'The rider did not arrive for our scheduled pickup window this morning.',
        createdAt: '2026-06-01T01:00:00Z',
      },
    ],
    createdAt: '2026-06-01T01:00:00Z',
    updatedAt: '2026-06-01T01:00:00Z',
    teamName: 'Customer Support',
    escalationState: 'none',
    supportTier: 'L1',
    slaPolicyId: 'sla-normal',
    internalNotes: [],
  },
];

/**
 * Module-level store. Stands in for HeyQ's database: mutations here are what a
 * real HeyQ API call would persist server-side.
 *
 * Persisted to this origin's localStorage so ticket state survives a refresh,
 * the same way the app's other mocks (auth, feature enablement) do. This is
 * Business+ caching its own view of the mock — NOT a shared channel between the
 * two apps. It disappears entirely when HeyQ serves a real API.
 */
const STORAGE_KEY = 'heyq.tickets';

const TICKETS: HeyQTicketRecord[] = loadState<HeyQTicketRecord[] | null>(STORAGE_KEY, null)
  ?? SEED.map((t) => structuredClone(t));

function persist(): void {
  saveState(STORAGE_KEY, TICKETS);
}

/** Simulated HeyQ availability. Flip to exercise the degraded paths. */
export const heyqServiceState = { available: true };

let seq = loadState<number>('heyq.seq', 1);
const nextId = () => {
  const id = `HQ-${10250 + seq++}`;
  saveState('heyq.seq', seq);
  return id;
};
const nowIso = () => new Date().toISOString();

function makeToken(id: string): string {
  const rand =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().replace(/-/g, '').slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `tok_${id.toLowerCase().replace('-', '')}_${rand}`;
}

// ── Requester operations ─────────────────────────────────────────────────────
// What Business+, as a requester client, is allowed to call. Every read is
// scoped to the caller's external identity — a ticket belonging to another user
// or organization is simply not visible.

export interface HeyQRequesterIdentity {
  externalUserId: string;
  externalOrgId: string;
}

const ownedBy = (t: HeyQTicketRecord, who: HeyQRequesterIdentity) =>
  t.externalUserId === who.externalUserId && t.externalOrgId === who.externalOrgId;

/** The caller's own tickets, newest activity first. */
export function listTicketsForRequester(who: HeyQRequesterIdentity): HeyQTicketRecord[] {
  return TICKETS.filter((t) => ownedBy(t, who))
    .slice()
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .map((t) => structuredClone(t));
}

/** One ticket, only if it belongs to the caller. */
export function getTicketForRequester(
  who: HeyQRequesterIdentity,
  id: string,
): HeyQTicketRecord | undefined {
  const t = TICKETS.find((x) => x.id === id || x.reference === id);
  if (!t || !ownedBy(t, who)) return undefined;
  return structuredClone(t);
}

export interface CreateHeyQTicketInput {
  who: HeyQRequesterIdentity;
  subject: string;
  description: string;
  concernType: HeyQConcernType;
  /** Optional — a general ticket carries no order. */
  linkedOrder?: HeyQLinkedOrder;
}

/**
 * Create a ticket. This is what HeyQ's own /contact form does server-side; the
 * Business+ handoff opens that form, and this stands in for the submission.
 */
export function createTicketForRequester(input: CreateHeyQTicketInput): HeyQTicketRecord {
  const id = nextId();
  const at = nowIso();
  const ticket: HeyQTicketRecord = {
    id,
    reference: id,
    subject: input.subject,
    description: input.description,
    concernType: input.concernType,
    status: 'new',
    priority: 'normal',
    externalUserId: input.who.externalUserId,
    externalOrgId: input.who.externalOrgId,
    accessToken: makeToken(id),
    linkedOrder: input.linkedOrder,
    messages: [
      {
        id: `${id}-m1`,
        authorType: 'requester',
        authorName: 'You',
        body: input.description,
        createdAt: at,
      },
    ],
    createdAt: at,
    updatedAt: at,
    teamName: 'Customer Support',
    escalationState: 'none',
    supportTier: 'L1',
    slaPolicyId: 'sla-normal',
    internalNotes: [],
  };
  TICKETS.unshift(ticket);
  persist();
  return structuredClone(ticket);
}

/**
 * Append a requester reply. Replying to a resolved/closed ticket reopens it —
 * reopen is an event, so the ticket returns to open (or in_progress if it still
 * has an assignee) and records `reopenedAt`.
 */
export function addRequesterReply(
  who: HeyQRequesterIdentity,
  id: string,
  body: string,
): HeyQTicketRecord | undefined {
  const t = TICKETS.find((x) => x.id === id || x.reference === id);
  if (!t || !ownedBy(t, who) || !body.trim()) return undefined;
  const at = nowIso();
  t.messages.push({
    id: `${t.id}-m${t.messages.length + 1}`,
    authorType: 'requester',
    authorName: 'You',
    body: body.trim(),
    createdAt: at,
  });
  t.updatedAt = at;
  if (t.status === 'resolved' || t.status === 'closed') {
    t.status = t.assigneeName ? 'in_progress' : 'open';
    t.reopenedAt = at;
    t.resolvedAt = undefined;
  }
  persist();
  return structuredClone(t);
}

/** Explicitly reopen a resolved/closed ticket. No-op on an active ticket. */
export function reopenTicketForRequester(
  who: HeyQRequesterIdentity,
  id: string,
): HeyQTicketRecord | undefined {
  const t = TICKETS.find((x) => x.id === id || x.reference === id);
  if (!t || !ownedBy(t, who)) return undefined;
  if (t.status !== 'resolved' && t.status !== 'closed') return structuredClone(t);
  const at = nowIso();
  t.status = t.assigneeName ? 'in_progress' : 'open';
  t.reopenedAt = at;
  t.resolvedAt = undefined;
  t.updatedAt = at;
  t.messages.push({
    id: `${t.id}-m${t.messages.length + 1}`,
    authorType: 'system',
    authorName: 'HeyQ',
    body: 'Ticket reopened by the requester.',
    createdAt: at,
  });
  persist();
  return structuredClone(t);
}

// ── Agent operations (the HeyQ agent app) ────────────────────────────────────
// Business+ does not call these — the adapter exposes no path to them. They live
// here so the agent half of the lifecycle can be simulated and asserted on.

export function agentAssign(id: string, assigneeName: string, teamName?: string): void {
  const t = TICKETS.find((x) => x.id === id);
  if (!t) return;
  t.assigneeName = assigneeName;
  if (teamName) t.teamName = teamName;
  if (t.status === 'new') t.status = 'in_progress';
  t.updatedAt = nowIso();
  persist();
}

/** A public reply from an agent — visible to the requester. */
export function agentReply(id: string, authorName: string, body: string): void {
  const t = TICKETS.find((x) => x.id === id);
  if (!t) return;
  const at = nowIso();
  t.messages.push({
    id: `${t.id}-m${t.messages.length + 1}`,
    authorType: 'agent',
    authorName,
    body,
    createdAt: at,
  });
  t.updatedAt = at;
  persist();
}

/** An internal note — agent-only, never visible to the requester. */
export function agentAddInternalNote(id: string, agentName: string, body: string): void {
  const t = TICKETS.find((x) => x.id === id);
  if (!t) return;
  t.internalNotes.push({
    id: `${t.id}-n${t.internalNotes.length + 1}`,
    agentName,
    body,
    createdAt: nowIso(),
  });
  t.updatedAt = nowIso();
  persist();
}

/** Escalation is a separate dimension — it does NOT change the ticket status. */
export function agentEscalate(id: string, to: HeyQEscalationState = 'escalated'): void {
  const t = TICKETS.find((x) => x.id === id);
  if (!t) return;
  t.escalationState = to;
  t.supportTier = to === 'escalated' ? 'L2' : 'L1';
  t.updatedAt = nowIso();
  persist();
}

export function agentSetStatus(
  id: string,
  status: HeyQTicketStatus,
  holdReason?: HeyQHoldReason,
): void {
  const t = TICKETS.find((x) => x.id === id);
  if (!t) return;
  t.status = status;
  t.holdReason = status === 'on_hold' ? holdReason : undefined;
  if (status !== 'resolved' && status !== 'closed') t.resolvedAt = undefined;
  t.updatedAt = nowIso();
  persist();
}

export function agentResolve(id: string, note?: string): void {
  const t = TICKETS.find((x) => x.id === id);
  if (!t) return;
  const at = nowIso();
  if (note) {
    t.messages.push({
      id: `${t.id}-m${t.messages.length + 1}`,
      authorType: 'agent',
      authorName: t.assigneeName ?? t.teamName,
      body: note,
      createdAt: at,
    });
  }
  t.messages.push({
    id: `${t.id}-m${t.messages.length + 1}`,
    authorType: 'system',
    authorName: 'HeyQ',
    body: 'Ticket resolved: Solved.',
    createdAt: at,
  });
  t.status = 'resolved';
  t.resolvedAt = at;
  t.updatedAt = at;
  persist();
}

/** Test/demo helper — restore the seed so runs stay deterministic. */
export function __resetHeyQStore(): void {
  TICKETS.length = 0;
  TICKETS.push(...SEED.map((t) => structuredClone(t)));
  seq = 1;
  heyqServiceState.available = true;
  clearState(STORAGE_KEY);
  clearState('heyq.seq');
}
