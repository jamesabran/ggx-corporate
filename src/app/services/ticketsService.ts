/**
 * ticketsService — support tickets facade.
 *
 * Data-returning functions are async to match a real API contract.
 * Currently backed by `data/supportTickets.ts` (module state; Zendesk boundary
 * stubbed inside the data module).
 *
 * ── Architecture / ownership ───────────────────────────────────────────────
 * Frontend-facing facade. Tickets are owned by the support system (Zendesk) and
 * surfaced via the GGX Corporate BFF. Ticket status/assignee/priority are
 * backend-owned. Per MOCK_SERVICE_LAYER.md §1c, submitting a ticket today also
 * pushes a notification + "syncs to Zendesk" synchronously inside the data
 * layer — that is a DEMO STAND-IN for backend-emitted events; in production the
 * BFF/Zendesk/NS emit those. The frontend only issues the submit/reply intent.
 *
 * Future API endpoints:
 *   GET  /tickets               → getTickets
 *   GET  /tickets/:id           → getTicketById
 *   GET  /tickets/:id/messages  → getTicketMessages
 *   POST /tickets               → createTicket
 *   POST /tickets/:id/messages  → replyToTicket
 */

import {
  getTickets,
  getTicket,
  getTicketMessages,
  addTicketReply,
  submitTicket,
  type SupportTicket,
  type SubmitTicketInput,
  type TicketMessage,
  type TicketAttachment,
  type TicketStatus,
  type TicketPriority,
} from '../data/supportTickets';

export type {
  SupportTicket,
  SubmitTicketInput,
  TicketMessage,
  TicketAttachment,
  TicketStatus,
  TicketPriority,
};

export interface TicketFilters {
  status?: TicketStatus | 'all';
}

/** Return all support tickets, with an optional status filter. */
export async function getTicketsList(filters?: TicketFilters): Promise<SupportTicket[]> {
  let result = [...getTickets()];
  if (filters?.status && filters.status !== 'all') {
    result = result.filter((t) => t.status === filters.status);
  }
  return result;
}

/** Return a single ticket by id, or null. */
export async function getTicketById(id: string): Promise<SupportTicket | null> {
  return getTicket(id) ?? null;
}

/** Return the message thread for a ticket. */
export async function getTicketThread(id: string): Promise<TicketMessage[]> {
  return [...getTicketMessages(id)];
}

/** Create a support ticket (backend persists + emits events in production). */
export async function createTicket(input: SubmitTicketInput): Promise<SupportTicket> {
  return submitTicket(input);
}

/** Append a customer reply to a ticket thread. */
export async function replyToTicket(
  id: string,
  body: string,
  attachments?: TicketAttachment[]
): Promise<TicketMessage | null> {
  return addTicketReply(id, body, attachments);
}
