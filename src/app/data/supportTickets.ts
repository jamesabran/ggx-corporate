// Support Tickets — mock data + submit flow (frontend only).
//
// State is module-level so a submitted ticket persists for the tab session and
// appears in the list immediately. Submitting also pushes a `support`
// notification into the unified notification model.
//
// ZENDESK INTEGRATION BOUNDARY: `syncTicketToZendesk` is the single stubbed
// integration point. When Zendesk is connected, implement it (and only it) to
// create/sync the ticket server-side and persist the returned external ref —
// the UI, data shape, and notification flow above it stay unchanged.

import { pushNotification } from './notifications';

export type TicketStatus = 'open' | 'in-review' | 'resolved' | 'closed';
export type TicketPriority = 'high' | 'medium' | 'low';

export interface SupportTicket {
  id: string;
  trackingNumber: string;
  issueType: string;
  description?: string;
  status: TicketStatus;
  priority: TicketPriority;
  created: string;
  lastUpdate: string;
  assignee: string;
  /** External system reference (e.g. Zendesk id) once synced. */
  externalRef?: string;
}

// TCK-1043 is seeded so the bell "Support ticket update" notification
// (meta.ticketId = TCK-1043) deep-links to a real row.
const SUPPORT_TICKETS: SupportTicket[] = [
  { id: 'TCK-1043',          trackingNumber: 'GGX-2024-89240', issueType: 'Delivery Failed',  status: 'in-review', priority: 'high',   created: '2026-05-19', lastUpdate: '2 hours ago', assignee: 'Support Team' },
  { id: 'TKT-2024-00847',    trackingNumber: 'GGX-2024-89236', issueType: 'Delivery Failed',  status: 'open',      priority: 'high',   created: '2026-05-18', lastUpdate: '2 hours ago', assignee: 'Support Team' },
  { id: 'TKT-2024-00846',    trackingNumber: 'GGX-2024-89231', issueType: 'Package Damaged',  status: 'in-review', priority: 'medium', created: '2026-05-17', lastUpdate: '1 day ago',   assignee: 'Claims Dept.' },
  { id: 'TKT-2024-00845',    trackingNumber: 'GGX-2024-89220', issueType: 'Delayed Delivery', status: 'resolved',  priority: 'low',    created: '2026-05-15', lastUpdate: '3 days ago',  assignee: 'Support Team' },
  { id: 'TKT-2024-00844',    trackingNumber: 'GGX-2024-89215', issueType: 'Wrong Address',    status: 'closed',    priority: 'medium', created: '2026-05-14', lastUpdate: '4 days ago',  assignee: 'Operations' },
  { id: 'TKT-2024-00843',    trackingNumber: 'GGX-2024-89208', issueType: 'Billing Inquiry',  status: 'resolved',  priority: 'low',    created: '2026-05-13', lastUpdate: '5 days ago',  assignee: 'Billing Team' },
  { id: 'TKT-2024-00842',    trackingNumber: 'GGX-2024-89195', issueType: 'Missing Package',  status: 'in-review', priority: 'high',   created: '2026-05-12', lastUpdate: '6 days ago',  assignee: 'Claims Dept.' },
];

export function getTickets(): readonly SupportTicket[] {
  return SUPPORT_TICKETS;
}

export function getTicket(id: string): SupportTicket | undefined {
  return SUPPORT_TICKETS.find((t) => t.id === id);
}

// --- Conversation thread ---------------------------------------------------

export interface TicketMessage {
  id: string;
  author: string;
  role: 'customer' | 'support';
  body: string;
  timestamp: string;
}

// Per-ticket message threads (lazily seeded for tickets without an explicit one).
const TICKET_MESSAGES: Record<string, TicketMessage[]> = {
  'TCK-1043': [
    { id: 'TCK-1043-m1', author: 'You',          role: 'customer', body: 'Delivery for GGX-2024-89240 failed and the rider marked it undelivered. The recipient confirms they were available. Please advise.', timestamp: 'May 19, 2026, 10:02 AM' },
    { id: 'TCK-1043-m2', author: 'Support Team', role: 'support',  body: 'Thanks for flagging this. We have escalated to operations and requested a re-attempt. We will update you within 24 hours.', timestamp: 'May 19, 2026, 11:40 AM' },
    { id: 'TCK-1043-m3', author: 'Support Team', role: 'support',  body: 'A re-delivery has been scheduled for tomorrow morning. We have added a note for the rider to call on arrival.', timestamp: '2 hours ago' },
  ],
};

/** Get the message thread for a ticket, synthesizing an opening exchange if none exists. */
export function getTicketMessages(id: string): TicketMessage[] {
  if (!TICKET_MESSAGES[id]) {
    const t = getTicket(id);
    if (!t) return [];
    TICKET_MESSAGES[id] = [
      {
        id: `${id}-m1`, author: 'You', role: 'customer',
        body: t.description || `Issue reported: ${t.issueType} for ${t.trackingNumber}.`,
        timestamp: t.created,
      },
      {
        id: `${id}-m2`, author: t.assignee, role: 'support',
        body: `Thanks for reaching out. Ticket ${id} has been received and is currently ${t.status}. Our ${t.assignee} will follow up shortly.`,
        timestamp: t.created,
      },
    ];
  }
  return TICKET_MESSAGES[id];
}

/** Append a customer reply to a ticket thread (frontend mock). */
export function addTicketReply(id: string, body: string): TicketMessage | null {
  const ticket = getTicket(id);
  if (!ticket || !body.trim()) return null;
  const thread = getTicketMessages(id);
  const message: TicketMessage = {
    id: `${id}-m${thread.length + 1}`,
    author: 'You',
    role: 'customer',
    body: body.trim(),
    timestamp: 'Just now',
  };
  thread.push(message);
  ticket.lastUpdate = 'Just now';
  if (ticket.status === 'resolved' || ticket.status === 'closed') ticket.status = 'open';
  postTicketReplyToZendesk(id, message);
  return message;
}

// Map the form's issue-type value to a human-readable label.
const ISSUE_LABELS: Record<string, string> = {
  delayed: 'Delayed Delivery',
  failed: 'Delivery Failed',
  damaged: 'Package Damaged',
  missing: 'Missing Package',
  'wrong-address': 'Wrong Address',
  billing: 'Billing Inquiry',
  other: 'Other',
};

let ticketSeq = 1;
function nextTicketId(): string {
  const n = String(900 + ticketSeq++).padStart(5, '0');
  return `TKT-2026-${n}`;
}

export interface SubmitTicketInput {
  trackingNumber: string;
  issueType: string; // form value (e.g. 'failed')
  description: string;
}

/**
 * Create a support ticket from the submit form, prepend it to the list, push a
 * `support` notification, and sync to the (stubbed) external system.
 */
export function submitTicket(input: SubmitTicketInput): SupportTicket {
  const id = nextTicketId();
  const ticket: SupportTicket = {
    id,
    trackingNumber: input.trackingNumber.trim() || '—',
    issueType: ISSUE_LABELS[input.issueType] ?? 'Other',
    description: input.description.trim(),
    status: 'open',
    priority: 'medium',
    created: new Date().toISOString().split('T')[0],
    lastUpdate: 'Just now',
    assignee: 'Support Team',
  };

  const { externalRef } = syncTicketToZendesk(ticket);
  ticket.externalRef = externalRef;

  SUPPORT_TICKETS.unshift(ticket);

  pushNotification({
    category: 'support',
    title: 'Support ticket submitted',
    body: `${id} (${ticket.issueType}) was created. Our team will respond shortly.`,
    // Support tickets are subaccount-scoped (Admin + the owning Manager). The
    // submitting account isn't tracked here, so accountName is left undefined —
    // visible to Admin in the All-Accounts view.
    scope: 'subaccount',
    href: `/dashboard/support-tickets/${id}`,
    meta: { ticketId: id, trackingNumber: ticket.trackingNumber },
  });

  return ticket;
}

// --- Zendesk integration boundary (stub) ---------------------------------
// Replace this no-op with a real Zendesk Tickets API call when integration is
// scoped. Keep it the ONLY place that talks to Zendesk so submitTicket and the
// UI remain unchanged.
export function syncTicketToZendesk(ticket: SupportTicket): { externalRef: string } {
  // TODO(zendesk): POST to the Zendesk Tickets API and return the created id.
  return { externalRef: `mock-zd-${ticket.id}` };
}

/** Post a customer reply to Zendesk (stub — same integration boundary). */
export function postTicketReplyToZendesk(ticketId: string, message: TicketMessage): void {
  // TODO(zendesk): POST the reply as a comment on the synced Zendesk ticket.
  void ticketId; void message;
}
