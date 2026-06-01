# Session State — GGX Corporate

> Lightweight handoff file. Update at natural checkpoints during long or complex work.
> On session start: read this file silently, then confirm to the user what you're resuming.

---

## Current goal

Polish pass complete. All 4 priority items from the roadmap have been addressed.

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
- **[NEW] Responsive layout fixes**: KPI card value font scaling (text-2xl xl:text-3xl), "vs last month" hidden at xl, flex-shrink-0 on trend %, individual booking copy removed from batch footer
- **[NEW] Sidebar IA cleanup**: grouped hierarchy (Operations / Analytics & Reports / Finance / Account Management / System), static uppercase group labels, separate managerNavigation with scoped access only, removed financeExpanded toggle
- **[NEW] Data Analytics scoping**: claims + SLA filtered by subaccountId when in subaccount context, KPI subtitle shows account name, re-runs on scope change
- **[NEW] Bulk Upload UX**: reportedCounts field on TransactionBatch (backend-override for realistic counts), 5 batches seeded with 89–423 shipments, batch row improved (counter columns, progress bar, Export button, stopPropagation on action)

## Important decisions

- Auth uses sync localStorage init (no async hydration) — intentional shortcut, revisit with real backend.
- Dashboard KPI numbers reflect the 25-transaction seed, not business-scale projections.
- `data/bulkTemplate`, `data/dropoffLocations` intentionally not wrapped in services (frontend config).
- `DEMO_USERS` in AuthContext is dead code — safe to remove, left to keep diffs minimal.
- `reportedCounts` on TransactionBatch is a stand-in for backend-provided batch aggregates.

## Files changed (recent session)

- `src/app/pages/Dashboard.tsx` — KPI responsive + trend label
- `src/app/pages/Transactions.tsx` — batch copy + batch row UX
- `src/app/layouts/RootLayout.tsx` — sidebar IA refactor
- `src/app/pages/DataAnalytics.tsx` — account scoping
- `src/app/data/transactions.ts` — reportedCounts field + 5 batch seed values
- `src/app/services/transactionService.ts` — use reportedCounts in getTransactionBatches

## Remaining tasks

See `docs/roadmap.md`. Polish pass items 1–4 are now complete. Remaining:
5. Operations Requests feature (future module — not yet started)
6. Backend / API integration (auth first, then transactions + claims)

## Known risks

- Auth hydration is synchronous (localStorage read) — will need async handling + loading state when real auth lands.
- Bundle size warning (main chunk ~678 kB) — pre-existing, not blocking.
- SLA alert seed data references tracking numbers from the original 10-transaction set; some may not match the expanded 25-transaction seed.
- reportedCounts in batch seed: the delivered+inProgress+failed fields do not match the few visible mock transactions in the expanded view (expected — mock limitation, not a bug).

## Suggested next prompt

> "Plan the Operations Requests module."
> OR
> "Start backend integration — swap auth service for real async fetch."

---

_Last updated: 2026-06-01_
