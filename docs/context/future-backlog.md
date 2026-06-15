# Future Backlog - Detail

Detailed specs for planned-but-not-started items summarized in `../roadmap.md`
(see **Future Backlog** there). Nothing here is committed work. Keep frontend
lists simple and scannable; keep detail views, filters, exports, reports, and
backend data granular enough for analytics, support, billing, reconciliation,
and future automation.

Grouping:

- **Data / Attribution:** Order attribution model; Storefront vs Single Product Checkout
- **Bulk Upload:** Smart column matching; missing/unmatched column visibility; saved mapping templates; template scope
- **Backend / API Integrations:** Drop-off Locations API; Rates API

---

## Data / Attribution

### 1. Order attribution model

Clearer order attribution across Transactions, order detail, filters, reports,
exports, and analytics. Four dimensions:

- **Account scope / ownership** — Main Account or Subaccount
- **Source** — high-level origin only
- **Connected store / integration** — detailed source metadata
- **Booking method** — how the order was created

**Transactions list stays simple:**

- Use the existing **Subaccount** column for ownership. Booked under Main Account
  shows `Main Account`; booked under a Subaccount shows the Subaccount name.
  Never blank or `N/A`.
- **Source** column stays short: `GGX Dashboard`, `Bulk Upload`, `API`,
  `Shopify`, `GoBenta`, `Product Checkout`.
- Do not concatenate Subaccount + Source + Store in the table.

**Order detail, filters, exports, reports** can show fuller attribution:
Account scope / Subaccount, Source, Connected Store / Integration (if
applicable), Booking Method, Created by (if applicable).

**Suggested backend concepts:** `account_scope`, `subaccount_id`, `source_type`,
`source_channel`, `source_store_id`, `source_store_name`, `integration_id`,
`booking_method`, `booking_method_group`, `created_by`.

**Booking method — frontend labels vs backend values:**

| Frontend label | Backend value |
|---|---|
| Single Booking | `single_booking` |
| Bulk Upload | `bulk_template_upload` |
| Bulk Upload | `bulk_in_app_spreadsheet` |
| API-created | `api_created` |
| Shopify Import | `shopify_import` |
| Storefront Checkout | `storefront_checkout` |
| Single Product Checkout | `single_product_checkout` |

Important: template upload and in-app spreadsheet both roll up as **Bulk Upload**
in the frontend, but must remain separate in backend/data for analytics.

### 2. Storefront vs Single Product Checkout

Track Storefront Checkout and Single Product Checkout separately; do not merge in
analytics. Inventory products can be sold through the full Storefront / GoBenta
shop or via standalone product checkout links.

Track separately to measure: Storefront adoption, individual product checkout
usage, Inventory-driven selling without a full storefront, and checkout-path
performance.

---

## Bulk Upload

### 3. Column Mapper improvements

Improve the existing column mapper shown when uploaded file headers do not fully
match GGX bulk upload fields. The mapper should handle: exact header matches,
similar/semantic matches, missing required GGX fields, optional GGX fields
without matches, and extra file columns that will not be imported.

**Smart matching** — suggest matches using exact labels, similar names, common
synonyms, and sample row values where useful. Users must still review selected
mappings before continuing. Examples:

- Customer Name / Buyer / Consignee → Recipient Name
- Phone / Contact No. / Mobile → Mobile Number
- Ship To / Address / Delivery Address → Street Address
- Town / City → City/Municipality
- Brgy / District → Barangay
- COD / Cash on Delivery / Collect → Cash on delivery
- Amount / Collectible / COD Amount → COD Amount

**One general auto-match message near the top**, dynamic by match state:

- Partial: "Some columns have been automatically matched based on your file
  headers. Please review the selected fields and complete any missing required
  fields before continuing."
- All required matched: "All required fields have been automatically matched.
  Please review the selected fields before continuing."
- All matched: "All columns have been automatically matched. Please review the
  selected fields before continuing."
- No matches: "We couldn't match your file headers automatically. Please select
  the matching columns before continuing."

**Required missing fields** — highlight rows with no match; helper text
"Required field — select a column."; disable Continue / Upload until all required
fields are matched; show summary count when useful ("3 required fields still need
matching").

**Optional unmatched fields** — do not block upload; keep visually low-priority.

**Extra file columns** — do not block upload; inform via summary or expandable
note ("2 columns from your file will not be imported.").

**Ambiguous matches** — make the row easy to review; subtle helper text when
needed ("Suggested based on your file header."); user can change the mapping.

**Save column matching** — add "Save column matching for future uploads" near the
main CTA, default ON. ON copy: "This column matching will be saved and suggested
the next time you upload a similar file." OFF copy: "This matching will only be
used for this upload." Save the final user-confirmed mapping, not just the system
suggestion.

**Suggested backend concepts:** `column_mapping_template_id`,
`mapping_template_name`, `source_type`, `header_signature`, `mapped_fields`,
`unmatched_ggx_fields`, `unmatched_file_columns`, `created_by`, `last_used_at`.

### 4. Column Mapping Template scope

Scoped saved mapping templates. Scopes: Main Account, Subaccount-specific, Shared
account-level.

Rules:

- Mapping created inside a Subaccount belongs to that Subaccount by default.
- Mapping created inside Main Account belongs to Main Account by default.
- Subaccount mappings do not automatically become available to all Subaccounts.
- Sharing across the account is explicit.
- Main Account users can view/manage mapping templates across Subaccounts and
  mark mappings as shared.

Template suggestion order when uploading **from a Subaccount**:

1. Templates saved by that Subaccount
2. Shared account-level templates
3. Auto-matching from detected headers

When uploading **from Main Account**, keep upload under Main Account scope for
now. Do not introduce Main Account booking on behalf of a Subaccount yet.

---

## Backend / API Integrations

> Production-only. Frontend must not own authoritative rates, fees, or location
> logic; consume via backend/BFF contracts. See deferred items in `../roadmap.md`.

### 5. Drop-off Locations API

`POST https://api.gogox.ph/v1/sams/distancefromhubs` — retrieve nearby
hubs/drop-off locations based on a user address.

Sample payload:

```json
{
  "line_1": "18H Sycamore Tower, Dansalan Gardens Condominiums",
  "city": "Manila",
  "state": "Metro Manila",
  "district": "Barangay 1",
  "dop": 1,
  "distance": 5000,
  "uom": "m"
}
```

Future use cases: nearest drop-off locations, address-based location discovery,
Basic user drop-off alternatives, booking/support/availability flows.

### 6. Rates API

`POST https://api.gogox.ph/v2/orders/estimates/rates` — estimate delivery rates
from pickup and delivery addresses.

Auth:

- Requires Bearer token.
- Temporary token for local/demo only. Do not commit the token. Store in
  `.env.local`; add a placeholder to `.env.example` only.
- Suggested env var: `VITE_GGX_RATES_API_TOKEN=`.
- Before production, replace with backend/BFF authentication so the token is
  never exposed in frontend code.

Future use cases: single booking rate estimate, Basic booking flow rate estimate,
Bulk Upload row validation/summary, Same-Day / service-type pricing preview,
comparing available service types.
