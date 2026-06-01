# Session State — GGX Corporate

> Lightweight handoff file. Update at natural checkpoints during long or complex work.
> On session start: read this file silently, then confirm to the user what you're resuming.

---

## Current goal

_Fill in at session start or when goal changes._

## Completed work

- Service layer migration complete (all non-config UI consumers go through service facades)
- Public tracking page `/track/:trackingNumber` (no auth required)
- Transaction seed expanded to 25 rows (May 12–31, diverse statuses, both subaccounts)
- Dashboard KPI cards + Delivery Performance card wired to `getDashboardStats()` from live seed
- Claim detail page `/dashboard/claims/:id` — full status timeline, linked transaction, refund card
- Seed claims expanded to 8 (open / in-review / approved / denied / settled)
- UX dead-end fixes: rating widget, proof-of-delivery modal, Share → copies `/track/:id` URL
- BillingStatement: Pay Now dialog, Download feedback, Update links wired
- APIAccess: Generate Key confirm + new key display, Save/Test Webhook feedback
- Settings: Save Changes, Update Preferences, Change Password dialog
- Claims list navigates to `/dashboard/claims/:id`; TransactionDetails claim row links there too
- Documentation restructure: CLAUDE.md + docs/ created

## Important decisions

- Auth uses sync localStorage init (no async hydration) — intentional shortcut, revisit with real backend.
- Dashboard KPI numbers reflect the 25-transaction seed, not business-scale projections.
- `data/bulkTemplate`, `data/dropoffLocations` intentionally not wrapped in services (frontend config).
- `DEMO_USERS` in AuthContext is dead code — safe to remove, left to keep diffs minimal.

## Files changed (recent)

_Fill in during active work._

## Remaining tasks

See `docs/roadmap.md` for the full list. Top items:
1. Backend / API integration (auth first, then transactions + claims)
2. Responsive layout fixes (KPI overflow, badge wrapping, SLA row chips)
3. Sidebar reorganization (grouping + hierarchy)
4. Batch realism + Transactions page copy cleanup
5. Data Analytics subaccount scoping fix

## Known risks

- Auth hydration is synchronous (localStorage read) — will need async handling + loading state when real auth lands.
- Bundle size warning (main chunk ~676 kB) — pre-existing, not blocking.
- SLA alert seed data references tracking numbers from the original 10-transaction set; some may not match the expanded 25-transaction seed.

## Suggested next prompt

> "Work through the roadmap — start with responsive layout fixes, then sidebar reorganization."

---

_Last updated: 2026-06-01_
