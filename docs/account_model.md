# Account Model — GGX Corporate

> **GGX Business+ note:** the platform is evolving into a modular model where
> capabilities (Inventory, Storefront, On-Demand, Advanced Analytics, …) are gated
> by contract, account type, role, coverage, approval, setup, and dependencies.
> Module access status + CTA are resolved in `businessModulesService` using the
> account/role/scope context built by `useModuleAccessContext`. The account-type
> mapping is: no subaccounts → `standard`; Main Account view → `main`; drilled-in
> subaccount or Manager → `subaccount`. All module/inventory/storefront records
> stay scoped per the rules below. See `docs/business_plus_modules.md` and
> `docs/contract_module_rules.md`.

## Terminology

- Use **"Subaccount"** (one word, capital S). Never "sub-account" or "sub account."
- Use **"Accounts"** not "Workspaces" or "Organizations."
- Use **"Main Account"** for the parent/consolidated account level.

## Account types

### Default account (no subaccounts enabled)
- Behaves like a standard corporate account with all main features available.
- Subaccount-related features may be visible as an upgrade/discovery path (e.g. "Enable Subaccounts" prompt in Settings).
- Finance, billing, and user management are at the account level.

### Main Account (subaccounts enabled)
- Can manage all subaccounts and see consolidated views across all of them.
- Has access to all features including finance, earnings, billing, users, and permissions.
- When viewing the main account level: sees aggregated/consolidated data.
- When drilling into a specific subaccount: sees only that subaccount's scoped data.

### Subaccount
- Scoped to its own data — transactions, claims, SLA alerts, analytics, etc.
- Limited finance and account management access depending on role.
- Subaccount managers cannot see other subaccounts' data or Main Account consolidated views.

## Role-based data scoping

| Context | Sees |
|---|---|
| Admin on Main Account | Consolidated data across all subaccounts |
| Admin viewing a specific subaccount | That subaccount's data only |
| Manager logged into a subaccount | That subaccount's data only |
| Manager on Main Account | Depends on permissions — typically scoped |

**Analytics scoping rule:** Main Account viewing a specific subaccount must see subaccount-specific analytics, not consolidated totals. Manager users in a subaccount context must see only that subaccount's data — this applies to charts, tables, and KPI cards.

**Operations Requests scoping rule:** Admin can create and view requests for all subaccounts and filter by subaccount, type, and status. Manager can create and view requests only for their assigned/current subaccount. Consolidated request views are Admin-only in Main Account context.

## Address management

- Prefer centralized address creation and editing at the Main Account level.
- Subaccounts may use addresses from the shared address book but should not independently manage the master list.

## Subaccount features (discovery path)

When subaccounts are not enabled, surface the feature as an upgrade path — not as a locked feature. The UI should make it easy to enable without implying the user is missing out on critical functionality.
