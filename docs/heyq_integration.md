# GGX Business+ ↔ HeyQ Integration (Business+ side)

Business+ half of the support integration. HeyQ's half is already built and
**deployed** (Vercel frontend + standalone Railway API); its contract lives in
`HeyQ/docs/business-plus-integration.md`.

The requester **reads and writes now hit the deployed HeyQ API** over its
customer surface (`heyqCustomerApi` behind the `heyqService` seam). What remains
local to Business+: the OMS order side (authorization, the customer-safe
snapshot, live delivery status — all from `transactionService`) and the ticket
**submission handoff** (a link into HeyQ's own contact form, which creates the
ticket server-side). No shared database, no webhooks, no production auth — the
identity is still passed as external ids until HeyQ ships a real session.

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

`services/heyqService.ts` is the single integration point; the HTTP client lives
in `services/heyqCustomerApi.ts` behind it. Callers (pages) go through the
`ticketsService` façade and never change.

| Adapter call | HeyQ endpoint (real) |
|---|---|
| `listMyTickets()` | `GET /api/customer/tickets?externalUserId&externalOrgId` |
| `getMyTicket(id)` | `GET /api/customer/tickets/:id?externalUserId&externalOrgId` |
| `replyToMyTicket(id, body)` | `POST /api/tickets/:id/messages` → re-read customer view |
| `reopenMyTicket(id)` | `POST /api/tickets/:id/reopen` → re-read customer view |
| `buildContactUrl(orderId?)` | The HeyQ handoff link (opens HeyQ's contact form) |

Results are production-shaped unions — `ok` / `forbidden` / `not_found` /
`unavailable`. `heyqCustomerApi` maps HTTP outcomes onto them: `403 → forbidden`,
`404 → not_found`, network/5xx → `unavailable`.

HeyQ's customer surface is **read + requester-reply/reopen only** — it never
hands out a portal access token (a reference must not grant access). Business+
therefore shows each ticket in its own in-app detail page (the mirror), with a
working reply box and Reopen; there is no "open the HeyQ portal by token" action.

Ticket **creation** is not an adapter call: the product hands off to HeyQ's own
`/contact` form, which creates the ticket server-side against the HeyQ API.

## Handoff

Business+ → HeyQ is a link: `<HEYQ_FRONTEND>/contact?order=<stable OMS order id>`.
Two origins are configured (both optional; deployed defaults are baked in):

- `VITE_HEYQ_URL` — the HeyQ **frontend**, for opening HeyQ pages (contact form,
  portal). Default `https://heyq.vercel.app`.
- `VITE_HEYQ_API_URL` — the HeyQ **API** origin, for ticket reads/writes. Default
  `https://heyq-api-production.up.railway.app`. Requests resolve to `${base}/api/…`.

For local development against a local HeyQ, set `VITE_HEYQ_URL=http://localhost:18020`
and `VITE_HEYQ_API_URL=http://localhost:4310`.

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

## The round trip is real

A ticket submitted through HeyQ's contact form is created in the HeyQ API and then
appears in the Business+ list — both apps read the same server state. The old
"separate in-process mock stores" limitation is gone; the mock HeyQ backend has
been removed from Business+.

HeyQ's mock API keeps state **in memory** (no database): a HeyQ redeploy resets
tickets, and it runs as a single instance. That is a property of the mock-stage
HeyQ service, not of this adapter.

## Deferred to production

- Verifiable session handoff (signed token) instead of passing external ids.
- Per-user authorization; today HeyQ scopes reads by account/identity, and the
  OMS order check is account-scope only.
- HeyQ-emitted notifications/events (a support notification is currently seeded).
- Attachments on tickets (HeyQ's contact form owns capture).
- A customer-facing portal deep-link (would require HeyQ to issue the owner a
  portal token over the customer surface).
