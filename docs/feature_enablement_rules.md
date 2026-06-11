# Feature Enablement Rules — GGX Business+

> Runtime enablement + setup state for gated features (Inventory, Storefront, and
> future modules). Distinct from *contract inclusion* (`contract_module_rules.md`):
> a feature can be **included** by contract yet **not enabled/configured** yet.

## Concepts

- **Included** — present in the account's contract (eligibility).
- **Enabled** — turned on for an account/subaccount scope.
- **Configured** — minimum setup completed so the feature is usable.

A feature is **usable** only when `included && enabled && configured` (and the
viewer holds the relevant permission). The module status surfaces the gap:
`included` → "Set up", `requires_setup` → "Continue setup", `enabled` → "Open".

## Enablement scope

Enablement is recorded per **scope id** (`'main'`, a subaccount id, or the
synthetic standard-account id). `featureEnablementService` resolves the effective
state for a viewer's scope, applying inheritance:

- **Account-level features** enabled on Main are inherited by subaccounts.
- **Subaccount-level features** (Inventory, Storefront, On-Demand) can be enabled
  per subaccount and are scoped to that subaccount's data.

## Locked / enablement UI states

When a user navigates to a feature route that is not usable, render the shared
**EnablementGate** instead of the feature, with a status-appropriate message +
CTA (mirrors the module card CTA), e.g.:

- Inventory disabled → "Inventory isn't enabled for this account yet." + the
  module CTA (Enable / Submit request / Request activation), or a
  "Requires an administrator" note for managers.
- Storefront opened before Inventory → `requires_dependency`: "Enable Inventory
  first" with a link to the Inventory module.

The gate must **not** expose feature data and must not let a manager activate a
global module.

## Edge cases

- **Route opened while disabled** (Inventory/Storefront) → EnablementGate, no data
  fetch for the locked feature.
- **Storefront before Inventory** → dependency gate.
- **Manager activation attempt** → CTA disabled + admin-required note.
- **Subaccount accessing Main-only data** → scoped service returns only the
  subaccount's records; never Main consolidated.

## Mock services

`data/featureEnablement.ts` seeds per-scope enablement/config flags;
`services/featureEnablementService.ts` exposes async getters
(`getFeatureState(featureId, scopeId)`, `isFeatureUsable(...)`). Future BFF:
`GET /accounts/:id/features`, `POST /accounts/:id/features/:featureId/enable`.
