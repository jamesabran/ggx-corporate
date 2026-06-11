# Service Type Rules — GGX Business+

> Delivery service types and their availability rules. Codified in
> `data/serviceTypes.ts` (constants/types) + `services` consumers.

## Service types

| Type | Key | Nature |
|---|---|---|
| Standard Delivery | `standard` | Default bulk delivery. Always available. |
| Same-Day Delivery | `same_day` | Consolidated, batch-like; delivered within the day. |
| On-Demand Delivery | `on_demand` | Immediate/near-immediate, direct pickup-and-deliver. |
| Special Pickup Support | `special_pickup` | Assisted/large pickups. |
| High-Volume Fulfillment | `high_volume` | Contract-gated fulfillment scale. |

## Same-Day vs On-Demand (do NOT merge)

These are **separate service types**.

**Same-Day Delivery**
- Consolidated operations; grouped/batch-like handling.
- Delivered within the day.
- Follows cut-off, service-area, capacity, and consolidation rules.

**On-Demand Delivery**
- Immediate or near-immediate pickup.
- Direct pickup and delivery; **not consolidated** by default.
- Feels like "pickup and deliver now."
- Likely requires **contract revision, pricing approval, or service-coverage
  validation** before use.

On-Demand is added as its own service type everywhere a service type is selected
(booking rows, storefront delivery options, transaction filters). Never alias it
to Same-Day.

## Availability

- `standard` is always available.
- `same_day` is subject to cut-off / service-area / capacity rules (backend-owned).
- `on_demand` availability can be enabled **globally or per subaccount**, and is
  additionally validated against **service coverage** for the delivery address.
- Availability per account/subaccount is a backend/service contract. The frontend
  only presents availability and disables unavailable options with a reason note.

## Edge cases

- **Service type unavailable for the current account/subaccount** → option shown
  disabled with a coverage/eligibility note; not selectable.
- **On-Demand selected but address outside supported service area** → block with a
  coverage message; suggest Same-Day/Standard. Coverage is validated by the
  service layer (mock now, BFF later), never computed in the UI.

## Transactions

Transactions carry a `serviceType`. The Transactions filter recognizes On-Demand
as a distinct value (deferred UI step — see roadmap). Do not collapse On-Demand
into Same-Day in filters or summaries.
