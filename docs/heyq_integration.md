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
| `submitOrderReport(input)` | `POST /api/customer/tickets` (create; returns the customer projection) |
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

Ticket **creation** always happens **in the report drawer**, server-side in HeyQ —
Business+ never redirects to HeyQ or opens `/contact` to create a ticket:

- **Report an Issue drawer** (opened from Transaction Details **and** from Support
  Tickets → "Submit a Ticket"): submits directly to `POST /api/customer/tickets`
  via `submitOrderReport`, staying inside Business+. From Transaction Details the
  current transaction is **preselected**; from Support Tickets nothing is
  preselected. On success the drawer closes with the ticket id, the list refreshes,
  and the user stays in Business+.
- **`buildContactUrl` / the `/contact` handoff still exists** for other entry
  points but is no longer how "Submit a Ticket" behaves.

### Multiple transactions per ticket

One ticket may reference **many** transactions (the drawer's searchable
multi-select combobox, `TransactionMultiSelect`):

- The combobox searches by tracking number (plus recipient/destination) over only
  the transactions **authorized for the current account/subaccount** —
  `listAuthorizedTransactions` scopes through the OMS boundary
  (`getTransactionsBySubaccountId`), the same account-scope rule
  `getAuthorizedOrder` enforces. Selections show as removable chips; duplicates are
  prevented; each result shows tracking number, delivery status, and a short
  destination/recipient reference.
- `submitOrderReport` takes `externalOrderIds: string[]` and authorizes **every**
  selected order against OMS before creating anything — if any is out of scope the
  **whole submission is refused** (never partially linked). An **empty** list is
  allowed: a general, unlinked ticket for non-order-specific concerns.
- **One** ticket is created for all selected transactions (not one per). On the
  wire the create payload carries `linkedTransactions` (primary/originating first);
  HeyQ stores the collection and mirrors the first into `linkedOrder` for backward
  compatibility. The customer projection returns `linkedTransactions` (plus
  `linkedOrder` = the first). Existing single-transaction tickets keep working.
- **Support Tickets list:** a single linked transaction shows its tracking number;
  several show the first plus "+N more". **All** linked tracking numbers stay
  searchable (`SupportTicket.trackingNumbers`).

The standalone HeyQ contact form is unchanged for direct HeyQ users.

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

## Live conversations (realtime)

Ticket conversations update **live** over HeyQ's realtime WebSocket channel. HeyQ
owns the channel and stays the system of record (persist-first, then broadcast);
Business+ is a **customer subscriber** to a single authorized ticket. The full
contract is `HeyQ/docs/realtime-conversations.md`.

- **Endpoint / origin:** `wss://<api-origin>/api/realtime`, derived from the SAME
  `VITE_HEYQ_API_URL` used for REST (`https→wss`, `http→ws`). No new variable, no
  credentials in the URL.
- **Connection token:** a short-lived, single-use, **ticket-scoped** token minted
  over REST (`POST /api/customer/realtime/token` with the requester identity +
  ticket id). HeyQ verifies visibility and returns 404 for a ticket that isn't
  the requester's — knowing a ticket id is never enough. A fresh token is minted
  per connect attempt, including each reconnect.
- **The seam:** `services/heyqRealtimeClient.ts` (the reusable protocol client) +
  `hooks/useTicketConversation.ts` (the detail-page state machine). The token/URL
  and the message-projection allowlist go through the existing `heyqService`
  adapter; no separate service or infrastructure was added.
- **Events consumed (customer-safe only):** `message.created`,
  `ticket.status_changed`, `typing.started`, `typing.stopped`. `assignment_changed`
  and internal notes are never delivered on a customer channel and are dropped by
  the client even if one ever arrived. Message payloads are re-projected through
  the same allowlist the REST path uses (`projectRealtimeMessage`).
- **Reliability:** events de-dupe by `event.id`, messages by `message.id`, and the
  thread orders by `createdAt` — socket arrival order is never trusted. The client
  reconnects with capped backoff and, on every (re)subscribe, triggers a REST
  **refetch** to recover anything missed while offline. REST stays authoritative:
  replies persist over `POST /api/tickets/:id/messages` and keep working when the
  socket is down.
- **Outgoing replies** render optimistically, reconcile to the confirmed server
  message (and de-dupe the realtime echo), and a failure is preserved with a
  retry action. **Typing** is throttled (one `start` per burst, re-emitted at most
  once/2 s) and force-stopped on send, clear, blur, ticket change and unmount.
- **Support Tickets list:** the customer token binds ONE ticket, so the list can't
  hold a socket per ticket. It stays current the contract-sanctioned way — the
  same REST read on focus and a short poll — surfacing new tickets, latest-activity
  previews, status, recent-activity ordering, and an **unread** indicator tracked
  client-side (localStorage, per requester; no privileged state).
- **Attachments:** files can be attached in the Report an Issue drawer, on a
  requester reply, and by an agent — see "Attachments" below. Uploaded-file
  metadata (incl. the stored id) that arrives live on a public message renders as
  a downloadable chip with inline preview for images/PDFs, so a file attached on
  the other side appears without a manual refresh.

## Attachments

Files can be attached when creating a ticket (Report an Issue drawer), on a
requester reply, and on an agent reply. **HeyQ owns validation, storage, and
authorization** — the Business+ client only stages files and shows early
validation via a shared policy (`src/app/lib/attachmentPolicy.ts`, mirrored from
HeyQ's authoritative copy).

- **Allowlist, both extension AND MIME:** images (jpg/jpeg/png/webp/gif),
  documents (pdf/doc/docx/xls/xlsx/csv/txt), and zip. Executables, scripts,
  active-content web files (html/svg/xml…), compiled binaries, shortcut/registry
  files, macro-enabled Office files, misleading double extensions
  (`invoice.pdf.exe`), MIME/extension mismatches, and password-protected zips are
  rejected. Max 5 files/submission, 10 MB each.
- **Upload path:** multipart to the HeyQ customer API — `POST /api/customer/tickets`
  (creation) and `POST /api/tickets/:id/messages` (reply). Files are validated
  server-side over the bytes and stored atomically with the message: a rejected
  batch creates no message and no attachment record (no orphans).
- **Storage:** HeyQ keeps file metadata (ticket id, message id, uploader, original
  name, safe server-generated object key, MIME, size, timestamp) against the
  ticket; bytes live in HeyQ's object store, never in Business+. The object key is
  server-generated — never the original filename — so there is no path-traversal
  surface. Storage is swappable behind HeyQ's attachment module.
- **Download/preview:** `GET /api/customer/tickets/:id/attachments/:attId`
  (identity-scoped, ticket-authorized). Served as an attachment by default with
  `X-Content-Type-Options: nosniff`; inline rendering only for validated images
  and PDFs. Business+ builds the URL with `buildAttachmentUrl(identity, …)`.
- **Consolidated list:** the ticket detail shows one deduped attachment collection
  derived from the conversation, each row noting the message it came from; a live
  attachment joins it without a refresh (`GET /api/customer/tickets/:id/attachments`
  is the API equivalent).

## Deferred to production

- Verifiable session handoff (signed token) instead of passing external ids.
- Per-user authorization; today HeyQ scopes reads by account/identity, and the
  OMS order check is account-scope only.
- HeyQ-emitted notifications/events (a support notification is currently seeded).
- Durable object storage + malware scanning (HeyQ's attachment store is in-memory
  at the mock stage; the module is swappable for S3/GCS).
- A customer-facing portal deep-link (would require HeyQ to issue the owner a
  portal token over the customer surface).
