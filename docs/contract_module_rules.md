# Contract & Module Access Rules — GGX Business+

> How an account's contract + context resolves to a module **access status** and
> **CTA**. See `business_plus_modules.md` for the full status/CTA tables.

## Where access is resolved

Access is resolved in the **service layer**, never in the UI:
`businessModulesService.resolveModuleAccess(moduleId, ctx)` returns the effective
status, and `resolveCta(status, module)` returns the CTA. The UI only renders.

This mirrors the permanent rule: eligibility, contract, and approval logic are
backend/service contracts, not frontend computation. The mock service stands in
for the future BFF and is replaceable without UI changes.

## Resolution context

```
ModuleAccessContext {
  accountType: 'standard' | 'main' | 'subaccount'
  role: 'admin' | 'manager'
  scopeAccountId?: string        // current subaccount, if scoped
  permissions: PermissionKey[]   // effective permissions for the viewer
  serviceCoverageOk?: boolean    // service-area check (e.g. On-Demand)
}
```

## Resolution order (first match wins)

1. **Not offered** for this account type → `not_available`.
2. **Coming soon** flag on the module → `coming_soon`.
3. **Dependency** not satisfied → `requires_dependency` (+ dependency module id).
4. **Service coverage** required and failing → `not_available` (coverage note).
5. **Contract inclusion**:
   - `excluded` + self-activatable → `available_to_activate`.
   - `excluded` + approval-gated → `requires_approval`.
   - `excluded` + contract-gated → `requires_contract_revision`.
   - `included`:
     - enabled + configured → `enabled`.
     - enabled + not configured → `requires_setup`.
     - not enabled + needs setup → `included` (CTA "Set up").

## Self-enable vs approval vs contract revision

Each module declares an **activation mode**:

| Mode | When excluded → status | Example |
|---|---|---|
| `self` | `available_to_activate` | Inventory (business-rule dependent) |
| `approval` | `requires_approval` | API Integration, On-Demand (pricing) |
| `contract` | `requires_contract_revision` | High-Volume Fulfillment, Advanced Analytics (some accounts) |

Some modules are **included but unconfigured** (status `included` / `requires_setup`)
— included by contract yet still needing setup before use.

## Role rules

- **Managers cannot enable/activate global (account-level) modules.** When a
  manager views an activatable global module, the activation CTA is disabled with
  a "Requires an account administrator" note. Managers may still *open* modules
  enabled for their assigned subaccount.
- **Admins** activate/request per the module's activation mode and scope
  (account-wide vs per-subaccount).

## Per-subaccount vs account-wide

- A module's `scopeLevel` is `account` (Main controls it; subaccounts inherit) or
  `subaccount` (can be enabled per subaccount, e.g. On-Demand, Storefront).
- Subaccounts use modules enabled for them or inherited from Main.

## Mock data note

Contract inclusion, approval status, and enablement are seeded in
`data/businessModules.ts` (+ `data/featureEnablement.ts`). These are illustrative
demo states, replaceable by `GET /business-modules` and
`GET /accounts/:id/modules` from the future BFF.
