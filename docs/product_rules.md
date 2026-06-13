# Product Rules — GGX Corporate

## Context

GGX Corporate is a **corporate logistics dashboard**, not a consumer tracking or individual booking app. All product decisions should reflect a business-grade, bulk-operations context.

## Workflow principles

- **Bulk-first.** The primary intake is bulk upload (CSV/XLSX). Do not design or imply individual booking flows unless explicitly requested.
- **Corporate users.** Users are company admins, account managers, logistics coordinators, and finance officers — not end consumers.
- **Actionable data.** Every page should give users something they can act on: filter, resolve, download, escalate, or navigate deeper.

## UX standards

- **Clean business dashboard.** Avoid consumer-app patterns (onboarding wizards, celebration animations, heavy illustrations mid-flow).
- **Hierarchy and grouping.** Use visual hierarchy (headings, cards, sections) to separate concerns. Do not flatten unrelated items into the same list or table.
- **Progressive disclosure.** Summary first, details on demand. Avoid loading all data into the primary view.
- **Responsive behavior.** All layouts must work at typical laptop widths (~1024px) and above. Avoid fixed widths that cause overflow. Test badge and chip wrapping at narrow widths.
- **Avoid cluttered tables.** Limit visible columns to the most actionable. Use secondary rows, tooltips, or drill-down for supplementary data rather than extra columns.
- **Badge overflow.** Badges and tags inside table rows or cards must not wrap unexpectedly. Constrain badge containers; truncate with ellipsis or a "+N more" pattern if needed.

## Data realism

- **Use realistic corporate logistics data.** Batch sizes, shipment counts, COD amounts, and delivery volumes should reflect plausible business scale.
- **Transaction batches must be realistically sized.** A typical batch represents a day's or week's upload — usually 50–500+ transactions. Batches with only 1–2 transactions are unrealistic and should be avoided unless specifically intentional (e.g. a corrective re-upload).
- **Seed data should tell a story.** Statuses, dates, and amounts should be internally consistent and reflect a functioning logistics operation.

## Language and copy

- **Avoid mock/demo language in user-facing UI.** Do not use placeholder text like "coming soon," "demo mode," or "sample data" in rendered UI.
- **Avoid irrelevant helper notes.** Do not show onboarding tips or inline help that contradict the app's actual capabilities (e.g. notes implying individual booking when the app only supports bulk upload).
- **Use business-appropriate terminology.** "Shipments," "transactions," "subaccounts," "bulk upload," "SLA breach," "COD," "remittance" — not consumer terms.

## Feature distinctions

**Support Tickets vs Operations Requests**

These two features are categorically different and must never be merged into a single "Help" section.

| | Support Tickets | Operations Requests |
|---|---|---|
| **Nature** | Reactive — resolving a problem | Proactive — requesting logistics execution |
| **Examples** | Failed delivery, damaged item, billing dispute, tracking issue | Pickup scheduling, supply request, bulk pickup assistance, special handling |
| **User intent** | "Something went wrong, help me fix it" | "I need operational support to move my shipments" |
| **Sidebar group** | Operations (or Support sub-group) | Operations |

Helper copy guidance:
- "Need help moving shipments? Use Operations Requests."
- "Need help resolving an issue? Use Support Tickets."

Do not use Support Tickets as a catch-all for operational needs. Operations Requests is its own module with its own service contract, statuses, and form fields — see `docs/roadmap.md` for the full spec.

## GGX Business+ modular direction

The product is becoming **GGX Business+** — a modular platform. Optional
capabilities are **discoverable** on the **Account Add-ons** page but access is
gated (contract / account type / role / coverage / approval / setup /
dependencies). A module can be visible without being usable; its **CTA changes
with access status** (resolved by `businessModulesService` — never re-derive CTA
text in the UI). The sidebar shows only active/included+configured modules;
everything else lives in Account Add-ons (progressive reveal). Bulk-first and
the account/subaccount scoping rules still apply to every new module. Naming:
current user-facing copy is GGX Business+ where documented; stable route/package
identifiers remain unchanged. See `docs/business_plus_modules.md`.

## Sidebar IA

- Group navigation items by feature context, not by alphabetical order or arrival order.
- After modularization, optional modules (Commerce: Inventory/Storefront, …) appear
  in the sidebar only once enabled; **Account Add-ons** is the discovery surface
  under Account Management.
- Target grouping: **Operations** (Transactions, Bulk Upload, Operations Requests, Claims, SLA Alerts, Support Tickets), **Analytics & Reports** (Analytics, Reports), **Finance** (Earnings, Billing Statements, Payment Settings), **Account Management** (Subaccounts, Users & Permissions, Address Book, API Integration), **System** (Notifications, Settings).
- Admin users see all groups. Managers see only Operations, scoped Analytics & Reports, and System.
- Group labels should be compact and subdued (small uppercase) — not navigation links themselves.
- Review sidebar IA after any major feature addition, especially when adding Operations Requests.
