# GGX Corporate — Roadmap & Backlog

**Last updated:** 2026-05-30
**Status:** Planning document. Items here are planned/backlog unless explicitly noted as in progress. Do not implement an item until it is promoted to the active task.

This roadmap captures the next planned enhancements from Business Development plus one foundational data-model improvement. The GGX Corporate app remains frontend/mock-only (no backend) — all items below are scoped as local/mock implementations unless a backend pattern is later approved.

---

## Build priority (recommended order)

| # | Item | Priority | Type | Status |
|---|------|----------|------|--------|
| 0 | **Stable Subaccount IDs** (foundational) | **P0 — do first** | Data-model cleanup | Done (2026-05-30) |
| 1 | Financial Security / OTP Verification | P1 | Feature (mock) | Done (2026-05-30) |
| 2 | Claims & Cancellations | P2 | Feature (mock) | Done (2026-05-30) |
| 3 | SLA Alerts / Operations Monitoring | P2 | Feature (mock) | Done (2026-05-30) |
| 4 | Data Analytics Enhancements (Business Review redesign) | P3 — larger effort | Redesign | Planned |

**Rationale:** Stable IDs unblock robust scoping for notifications, claims, SLA, and analytics filters, so it goes first. Financial/OTP is a self-contained, high-value security layer that should land before the larger feature areas. Claims and SLA are peer operational features that both lean on stable IDs and the notification model. Data Analytics is a larger redesign driven by the Business Review metrics — treat it as a project, not a chart refresh.

---

## 0. Foundational — Stable Subaccount IDs (P0, next)

**Problem:** Visibility/scoping currently matches on account/subaccount *names* (e.g. "Acme Luzon"). Names can change or duplicate, making scoping fragile. `batch.accountId` on transactions is currently unset because the transaction mock has no stable subaccount id.

**Goal:** Introduce a single shared stable subaccount ID map, used consistently across the app. Visibility and filtering key off `accountId`/`subaccountId`; `accountName` becomes display text only.

**Consumers that must use the shared IDs:**
- `SubAccountContext` (source of truth for ids + names)
- transactions (`data/transactions.ts`)
- bulk uploads + upload batch records (`data/bulkUploads.ts`)
- notifications (`data/notifications.ts` visibility logic)
- future claims
- future SLA alerts
- future analytics filters

**Acceptance:**
- A canonical `subaccounts` list with `{ id, name }` (and existing fields) referenced everywhere.
- `isNotificationVisible` and the viewer match on `accountId`, not `accountName`.
- `batch.accountId` is populated consistently from the active account/subaccount.
- Notification visibility remains correct for: Admin (All Accounts), Admin drilled into a subaccount, and the assigned Manager.
- `accountName` retained only for display.

**Dependencies:** none (foundational). **Blocks:** robust scoping for items 1–4.

---

## 1. Financial Security / OTP Verification (P1)

**Goal:** All financial/sensitive payment-setting changes require OTP verification, even for the Admin/main account.

**Scope (mock):**
- Financial items: bank account add/edit/remove and other sensitive payout/payment settings (Payment Settings page).
- OTP gate before committing the change:
  - Mock OTP is always `123456`.
  - OTP must be 6 digits.
  - Reusable OTP dialog/component (DS-aligned; consider an Input OTP pattern).
- On successful financial update, prepare an **attention email event** to the account holder (local/mock event object — do **not** send real email). Structure it so a future prompt can wire real email/notification delivery.
- Local/mock state only.

**Dependencies:** none hard; benefits from stable IDs for account-holder targeting. **Notes:** align the email event shape with the existing notification `pushNotification` extension point where sensible.

---

## 2. Claims & Cancellations (P2)

**Goal:** Let users raise refund claims on undelivered transactions and cancel newly booked ones.

**Scope (planned, do not build yet):**
- **Claims:** refund requests for transactions that remain **undelivered**. Linked to a transaction / tracking number. May create notifications (category `claim` or reuse `transaction`/`support` — decide at build time). Consider a **Claims** sidebar item.
- **Cancellations:** allowed only for **newly booked** transactions (pre-pickup/early status). Surfaced from Transaction Details where eligible.
- Claims linked to tracking numbers; status lifecycle (open → in review → approved/denied → settled).

**Dependencies:** Stable Subaccount IDs (scoping); notification model (claim notifications); Transaction model (status + linkage). **Relates to:** Analytics "Claims summary" metric.

---

## 3. SLA Alerts / Operations Monitoring (P2)

**Goal:** Surface operational SLA risks and breaches with follow-up tracking.

**Scope (planned, frontend/mock acceptable):**
- Alert types: **No Movement**, **Breach SLA**, and **follow-up** alerts.
- UI shows follow-up notes (e.g. "follow-up sent to assigned hub/forwarder").
- SLA alerts may create notifications (category `sla` or reuse `service_advisory`/`transaction` — decide at build time).
- Mock data + states only; no real monitoring backend.

**Dependencies:** Stable Subaccount IDs (scoping); notification model. **Relates to:** Analytics "SLA HIT/MISS".

---

## 4. Data Analytics Enhancements (P3 — larger redesign)

**Goal:** Redesign Data Analytics around Business Development's operational metrics (reference: **Zenith PH Business Review** PDF). Treat as a redesign project, not a quick chart refresh.

**Reconsider:** current **peak-hours** analytics may not be relevant — candidate for removal/replacement.

**Recommended metrics:**
- Performance Overview
- Total Orders
- Fulfilled Orders
- Delivery Efficiency
- RTS Rate
- Returned / For Return
- SLA HIT/MISS
- Average delivery days by city/region
- Returns by reason/location
- Claims summary
- Amount settled
- Volume sharing by region

**Dependencies:** Stable Subaccount IDs (per-account filters); Claims (claims summary); SLA Alerts (SLA HIT/MISS). Best sequenced **after** items 0–3 so the metrics have real (mock) sources. **Note:** still gated by the deferred recharts lazy-load performance task for bundle size.

---

## Cross-cutting deferred items (unchanged)
- recharts `DataAnalytics` lazy-load / code-split (bundle ~970 kB) — separate performance task.
- Real auth + route guards; real notification/Zendesk APIs; persistence; dark mode.
