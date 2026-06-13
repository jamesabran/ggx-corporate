# Business+ Add-ons Context

Use this for Account Add-ons, module access, enablement, dependency, CTA, and
scope questions.

## Naming

- User-facing discovery surface: **Account Add-ons**.
- Route: `/dashboard/account-add-ons`.
- Placement: Account Management sidebar group.
- "Business Modules" is historical/internal language. Prefer "Account Add-ons"
  in current docs and user-facing copy.
- Integrations such as Shopify and API Integration stay in their own sidebar
  group, not in Account Add-ons.

## Access Model

Module usability depends on:

- Contract inclusion.
- Account type: standard, Main Account, Subaccount.
- Scope: account-wide or per-subaccount.
- Role and permissions.
- Service coverage.
- Approval/request status.
- Setup/configuration status.
- Dependencies.

The service layer resolves access status and CTA. UI renders the result; it does
not re-derive eligibility or CTA copy.

## Status And CTA

- `included` -> Set up.
- `enabled` -> Open.
- `available_to_activate` -> Enable.
- `requires_setup` -> Continue setup.
- `requires_approval` -> Submit request.
- `requires_contract_revision` -> Request activation.
- `requires_dependency` -> dependency-specific CTA such as Enable Inventory first.
- `not_available` -> disabled/contact-support style handling.
- `coming_soon` -> disabled Coming soon.

## Curated Catalog

- Account & Scale: Subaccounts, Consolidated Billing.
- Delivery Services: On-Demand Delivery.
- Commerce: Inventory, Storefront.
- Advanced: Advanced Data Analytics, Custom Reports.

Not in Account Add-ons: default/core booking tools, Same-Day Delivery, Shopify,
API Integration, Webhooks, Product-linked Booking, and overlapping branch/brand
management concepts.

## Scope Rules

- Admin on Main Account can manage account-wide modules and subaccount-scoped
  modules where permissions allow.
- Admin drilled into a Subaccount acts within that scope.
- Managers stay scoped to their assigned Subaccount.
- Subaccount-level add-ons such as Inventory, Storefront, and On-Demand should
  not write enablement to Main scope.
- Storefront requires Inventory first.

## Current Risks

- Final backend activation/request endpoints are provisional.
- Advanced Analytics and Custom Reports remain gated concepts; persistence and
  scheduling are backend-owned.
