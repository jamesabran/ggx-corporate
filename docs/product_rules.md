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
- **Support Tickets** — issues with existing deliveries: failed delivery, damaged item, billing inquiry, tracking dispute. Reactive.
- **Operations Requests** — proactive operational asks: pickup scheduling, address changes, route adjustments, priority handling. Belong under a "Shipping Operations" or similar section — not mixed into support.

These two must remain separate in IA and UX. Do not merge them into a single "Help" section.

## Sidebar IA

- Group navigation items by feature context, not by alphabetical order or arrival order.
- Suggested groupings: **Operations** (Transactions, Claims, SLA Alerts, Bulk Upload), **Analytics & Finance** (Analytics, Earnings, Billing, Reports), **Account** (Subaccounts, Users & Permissions, Settings), **Support** (Support Tickets, Service Advisories, Notifications).
- Review sidebar IA after any major feature addition.
