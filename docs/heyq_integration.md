# GGX Business+ ↔ HeyQ Integration (Business+ side)

Business+ half of the support integration. HeyQ's half is already built (its
milestone M22); its contract lives in `HeyQ/docs/business-plus-integration.md`.

Everything here is a **mock behind an adapter**. No backend, no webhooks, no
shared database, no production auth.

## Ownership

| System | Owns |
|---|---|
| **OMS** (`services/transactionService.ts`) | Orders and shipment/delivery status. Authoritative. |
| **HeyQ** (`data/heyqTickets.ts` behind `services/heyqService.ts`) | Tickets: assignment, escalation, messages, status, resolution, reopening, history. Authoritative. |
| **Business+** | Neither. It reads OMS and acts as a **requester client** of HeyQ. |

Business+ holds **no ticket state of its own** — there is no local ticket store
to drift out of sync.

## The OMS equivalent (reused, not replaced)

`services/transactionService.ts` is this project's OMS boundary. Its own docblock
names OMS as the source system behind it, it is the only order/transaction
facade, and **the stable order ID is the tracking number** (`GGX-2026-90008`) —
the identifier `getTransactionById`, the detail route, and public tracking all
key on. No new `OMSService` was introduced.

Authorization is **account scope**: Admin (`main`) sees every account; a Manager
sees only their subaccount. `heyqService.getAuthorizedOrder` enforces it.

## The seam

`services/heyqService.ts` is the single integration point. Swap its bodies for
`fetch()` when HeyQ exposes an API; callers do not change.

| Adapter call | Becomes |
|---|---|
| `listMyTickets()` | `GET /requester/tickets` |
| `getMyTicket(id)` | `GET /requester/tickets/:id` |
| `replyToMyTicket(id, body)` | `POST /requester/tickets/:id/replies` |
| `reopenMyTicket(id)` | `POST /requester/tickets/:id/reopen` |
| `buildContactUrl(orderId?)` | The HeyQ handoff link (already final) |
| `buildRequesterTicketUrl(token)` | The token-scoped portal link (already final) |

Results are production-shaped unions — `ok` / `forbidden` / `not_found` /
`unavailable` — so authorization failure and downtime are handled today.

`submitTicketToHeyQ` exists because the mock HeyQ backend is in-process; the real
product flow hands off to HeyQ's own contact form, which performs the submission.

## Handoff

Business+ → HeyQ is a link: `<HEYQ_BASE>/contact?order=<stable OMS order id>`.
Configure the base with `VITE_HEYQ_URL` (default `http://localhost:18020`).

Before handing off, the order is read and authorized **through the OMS service
boundary**, never from page state. An out-of-scope order is refused with an
explanation rather than silently opened unlinked.

## What crosses the boundary

Passed to HeyQ — the minimal, customer-safe snapshot, captured at submission:

- stable OMS order id + tracking number
- delivery status (+ label) **at capture time**
- service type, a short delivery summary
- city-level route
- booking date

**Withheld:** recipient name/contact/address, payment, COD, fees, parcel
contents, batch/internal attribution.

**Never exposed to Business+** (dropped in `heyqService.toCustomerView`): internal
notes, agent identity, escalation state, support tier, SLA policy, team queue.
The handling **team** is customer-safe and is what the UI shows.

## Three independent status dimensions

1. **Delivery status** (OMS) — Pending, In Transit, Delivered, Failed…
2. **Support-ticket status** (HeyQ) — New, Open, In Progress, On Hold, Resolved, Closed.
3. **Escalation** (HeyQ, agent-only) — a *separate* dimension; an escalated ticket
   is still In Progress.

A live shipment change never moves the ticket status, and vice versa. The two
have separate colour maps (`statusConfig` vs `TICKET_STATUS_META`) on purpose.

Reopen is an **event**, not a status: a reopened ticket returns to Open (or In
Progress if it still has an assignee) and records `reopenedAt`.

## Snapshot-first rendering

A linked ticket renders from its saved snapshot, so it survives HeyQ being down,
the order being archived upstream, or the delivery moving on. "Check live status"
re-reads OMS and shows the drift explicitly.

## Known limitation of the mock

The mock HeyQ backend lives **inside Business+**. A ticket submitted by hand in
the real HeyQ tab does not appear in the Business+ list — the two apps are
separate origins with separate mock state, and no bridge (postMessage,
shared-origin localStorage) is used by design. The Business+ list reflects its own
mock HeyQ store. When HeyQ serves a real API, the round trip becomes real with no
caller changes.

The store is persisted to this origin's `localStorage` (`ggx.heyq.tickets`) so
ticket state survives a refresh, exactly like the app's other mocks. That is
Business+ caching its own mock — not a channel between the apps.

## HeyQ-side compatibility change

HeyQ's mock order catalogue (`data/businessPlusOrders.ts`) only knew `BP-ORD-*`
ids, so a `/contact?order=GGX-…` deep link would have been refused. Business+
order rows were **appended** (additive — the `BP-ORD-*` set is untouched). Two
HeyQ assertions that hard-coded the seed size were made seed-derived. This block
disappears when the real provider reads OMS.

## Deferred to production

- Real HeyQ API behind the adapter (the swap point is `heyqService`).
- Verifiable session handoff (signed token) instead of passing external ids.
- Per-user authorization; today authorization is account-scope only.
- HeyQ-emitted notifications/events (a support notification is currently seeded).
- Attachments on tickets (HeyQ's contact form owns capture).
