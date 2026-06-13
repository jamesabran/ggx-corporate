# GGX Business+ — Account Add-ons Model

> Master reference for the modular Account Add-ons direction. Read this first for
> any module-access, enablement, or contract-gating work. Companion docs:
> `contract_module_rules.md`, `feature_enablement_rules.md`, `service_type_rules.md`,
> `commerce_rules.md`, `inventory_rules.md`, `storefront_rules.md`,
> `spreadsheet_booking_rules.md`.

## Naming direction

The product is evolving from **GGX Corporate** into **GGX Business+** — a broader
business logistics and commerce operations platform serving corporate accounts,
SMEs, sellers, brands, branches, subaccounts, inventory, storefront, delivery
services, and integrations.

**Migration stance:** current user-facing product copy is GGX Business+ where
documented. Stable route names, package names, and internal architecture labels
can remain `ggx-corporate` / GGX Corporate until a dedicated technical rename.

## Core principle

GGX Business+ does **not** ship every feature to every account at once. It is
**modular**. Optional capabilities are discoverable in **Account Add-ons** but
access is gated. A module can be visible without being usable yet — the CTA
changes with access status.

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

## Account Add-ons page (user-facing label)

- **User-facing name:** **Account Add-ons** (route `/dashboard/account-add-ons`).
  Lives in the **Account Management** sidebar group.
- **Intro copy:** "Add optional capabilities to your account. Some add-ons may
  require setup, approval, service coverage, or contract updates."
- **Curated, not a full catalog.** Account Add-ons shows ONLY capabilities that
  are optional, gated, requestable, contract-based, require setup/approval/
  dependencies, or aren't fully available yet. **Do not** list default / always-
  available features. Enabled add-ons still appear here with `enabled` status +
  an Open/Manage CTA; their work area is a dedicated sidebar page (revealed once
  enabled) or lives inside the relevant existing workflow (e.g. On-Demand becomes
  a booking/delivery service type, not its own page).
- Categories shown as catalog sections with a clear divider between them; cards
  laid out up to 4 per row.

### Module card fields

module name · category · short description · status · contract/access note ·
dependency note · primary CTA. (The "available for / roles" line was removed from
the card — that detail lives in this doc / the add-on's own area.)

## Account Add-ons catalog (curated)

- **Account & Scale** — **Subaccounts** (self-enable; routes to the enable flow);
  **Consolidated Billing** (requires Subaccounts first → passive, disabled
  "Requires Subaccounts" CTA until Subaccounts is enabled; once on → "Request
  activation"). This is the `dependencyPassive` pattern: the prerequisite is
  enabled elsewhere, so the dependency CTA is informational, not actionable.
- **Delivery Services** — **On-Demand Delivery** only (separate from Same-Day;
  immediate, non-consolidated; approval/contract/coverage-gated → "Submit
  request"). See `service_type_rules.md`.
- **Commerce** — **Inventory** (self-enable); **Storefront** (requires Inventory
  first; publish/unpublish anytime). See `commerce_rules.md`.
- **Advanced** — **Advanced Data Analytics** (dedicated analytics workspace,
  distinct from dashboard Basic Analytics); **Custom Reports** (beyond fixed Basic
  Reports templates).

**Not in Add-ons** (always-available or covered elsewhere): Same-Day Delivery,
High-Volume Pickup, Special Pickup Support, Shopify, API Integration, Webhooks
(comes with API Integration), External Store Integration (overlaps Shopify/API),
Product-linked Booking (comes with Inventory), Branch/Brand Management (overlaps
Subaccounts for now), and all default Core Workspace / Booking Tools features.

**Integrations** (Shopify, API Integration) stay in their **own sidebar group**,
not in Account Add-ons.

## Navigation / progressive reveal

- Keep the sidebar focused on **active/included + configured** features.
- **Account Add-ons** (under Account Management) is the discovery surface.
- Optional add-ons appear in the sidebar only after they are enabled (e.g.
  **Commerce** group with Inventory/Storefront), while remaining listed in Account
  Add-ons as `enabled`.
- Extend the current IA safely before forcing a larger one. Current groups
  (Operations / Analytics & Reports / Finance / Account Management / Integrations /
  System) are extended, not rebuilt.

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
