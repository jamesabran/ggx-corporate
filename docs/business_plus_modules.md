# GGX Business+ — Business Modules Model

> Master reference for the modular platform direction. Read this first for any
> module-access, enablement, or contract-gating work. Companion docs:
> `contract_module_rules.md`, `feature_enablement_rules.md`, `service_type_rules.md`,
> `commerce_rules.md`, `inventory_rules.md`, `storefront_rules.md`,
> `spreadsheet_booking_rules.md`.

## Naming direction

The product is evolving from **GGX Corporate** into **GGX Business+** — a broader
business logistics and commerce operations platform serving corporate accounts,
SMEs, sellers, brands, branches, subaccounts, inventory, storefront, delivery
services, and integrations.

**Migration stance (low-risk first):** update planning/docs and new, user-facing
*conceptual* labels (the Business Modules page intro, module copy) to "GGX
Business+". **Do not** do a full branding rewrite of existing routes, the sidebar
logo, page titles, or stable strings yet — that is a separate, scheduled pass.
The existing "Corporate Account" sidebar label and route names stay until a
dedicated rebrand task.

## Core principle

GGX Business+ does **not** ship every feature to every account at once. It is
**modular**. Optional capabilities are **discoverable as offerings** but access is
gated. A module can be visible without being usable yet — the CTA changes with
access status.

## Access dimensions (all must pass for a module to be usable)

1. **Account contract** — is the module included / available / excluded?
2. **Account type** — Standard Account, Main Account, Subaccount.
3. **Subaccount rules** — inherited from Main vs enabled per-subaccount.
4. **User role + permissions** — Admin vs Manager; granular permission keys.
5. **Service coverage** — geographic/service-area availability (e.g. On-Demand).
6. **Approval status** — some modules require an approved request.
7. **Setup status** — included modules may still need configuration.
8. **Dependencies** — e.g. Storefront requires Inventory first.

## Module access statuses

| Status | Meaning |
|---|---|
| `included` | In the account's contract. May still need setup. |
| `available_to_activate` | Self-serve; the user can enable it now. |
| `enabled` | Active and configured — ready to open. |
| `requires_setup` | Included/enabled but not yet configured. |
| `requires_approval` | Needs an approved request before use. |
| `requires_contract_revision` | Needs a contract change / sales activation. |
| `requires_dependency` | A prerequisite module must be enabled first. |
| `not_available` | Not offered for this account type / service area. |
| `coming_soon` | Planned; not yet released. |

## CTA rules (status → primary CTA)

| Status | Primary CTA |
|---|---|
| `included` (not configured) | **Set up** |
| `enabled` | **Open** |
| `available_to_activate` | **Enable** |
| `requires_setup` | **Continue setup** |
| `requires_approval` | **Submit request** |
| `requires_contract_revision` | **Request activation** |
| `requires_dependency` | dependency-specific, e.g. **Enable Inventory first** |
| `not_available` | **Contact support** or disabled CTA |
| `coming_soon` | disabled **Coming soon** |

The single source of truth for status → CTA is
`businessModulesService.resolveCta()`. UI must not re-derive CTA text.

## Business Modules page

- **Recommended name:** Business Modules.
- **Intro copy:** "Add tools to GGX Business+ based on your contract, operations,
  and business needs. Some modules can be enabled instantly, while others may
  require approval or contract updates."
- Shows **all** offerings in a controlled way — it does not hide future platform
  direction. Locked/future modules live here, not in the main sidebar.

### Module card fields

module name · category · short description · status · contract/access note ·
dependency note · primary CTA · secondary CTA (optional) · available-for
(Standard / Main / Subaccount) · allowed roles (Admin / Manager) · service
coverage note (when applicable).

## Module categories & offerings

- **A. Core Workspace** (default/included): Dashboard, Transactions, Bulk Booking,
  Address Book, Support Tickets, Settings, **Basic Analytics** (part of Dashboard,
  not the advanced Data Analytics module).
- **B. Advanced Analytics** — the current Data Analytics module / its expanded
  form. May be included by default or contract-gated as advanced.
- **C. Delivery Services** — Standard Delivery, Same-Day Delivery, **On-Demand
  Delivery** (separate type — see `service_type_rules.md`), Special Pickup
  Support, High-Volume Fulfillment.
- **D. Commerce** — Inventory, Storefront, Storefront Orders, Product-linked
  Booking, Storefront Publishing (see `commerce_rules.md`).
- **E. Scale** — Subaccounts, Users & Permissions, Account Switcher, Consolidated
  Billing, Branch/Brand Management.
- **F. Integrations** — API Integration, Developer Credentials, Webhooks, External
  Store Integration, Order Import. Keep integration language generic (avoid
  Shopify-specific wording unless the existing page already requires it).
- **G. Booking Tools** — Bulk Booking with two input methods: Upload File and
  Type in Spreadsheet (the spreadsheet is an *input method*, not a separate
  module — see `spreadsheet_booking_rules.md`).

## Navigation / progressive reveal

- Keep the sidebar focused on **active/included + configured** modules.
- **Business Modules** is the discovery surface for everything else.
- Optional modules appear in the sidebar only after they are enabled (or included
  and configured). Locked modules stay in Business Modules.
- Extend the current IA safely before forcing the larger proposed IA. The current
  groups (Operations / Analytics & Reports / Finance / Account Management /
  Integrations / System) are extended, not rebuilt.

## Account / subaccount rules (summary)

- **Admin (Main Account context):** view/manage all account-scoped modules where
  contract + permissions allow; can request/activate modules account-wide or
  per-subaccount depending on the module.
- **Admin (Subaccount context):** manage scoped subaccount modules where allowed.
- **Manager:** access only the assigned subaccount; cannot enable global modules
  unless explicitly permitted.
- **Subaccount:** uses modules enabled for it or inherited from Main.
- Inventory/Storefront/booking records are scoped to the current account/
  subaccount. See `inventory_rules.md` and `storefront_rules.md`.

## Edge cases to handle (tracked)

Module visible but not in contract · included but not configured · requires
approval · requires contract revision · requires dependency · Manager tries to
activate a global module · Inventory/Storefront route opened while disabled ·
Storefront opened before Inventory · Subaccount accessing Main inventory ·
Storefront unpublish with pending orders / active deliveries · spreadsheet row
qty > stock · product inactive/deleted after attach to draft · service type
unavailable for account/subaccount · On-Demand outside service area · incomplete
pasted spreadsheet data · mixed valid/invalid rows. (Full handling per the
companion rule docs.)

## Data model / mock services

Mock structures (replaceable by future BFF `fetch()` — no real APIs yet):
module catalog · module access status · contract inclusion · approval/request
status · feature enablement · service types · inventory products · storefront
profile · storefront publish status · storefront orders (placeholder) ·
spreadsheet booking rows · product-attached booking rows.
</invoke>
