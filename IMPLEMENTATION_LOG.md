# GGX Corporate — Implementation Log

**Date:** 2026-05-29
**Stack:** React 18 + TypeScript + Vite 6 + Tailwind CSS v4 + shadcn-style UI + react-router 7
**Status:** Initial build complete. `npm run build` passes (tsc + vite, 0 errors).

---

## What was built

Greenfield project scaffolded from scratch (only `GGX_CORPORATE_DS_CONTEXT.md` existed). Ported the entire Figma Make app (file key `oQk6zNAdGyQmDAPf57PSmC`) into a production React project at `C:/Users/james/Projects/GGX Corporate/`.

### Config / foundation
- `package.json`, `vite.config.ts`, `tsconfig*.json`, `index.html`, `.gitignore`
- `src/main.tsx`, `src/index.css` (imports Tailwind v4 + theme), `src/styles/theme.css`
- Inter font loaded via Google Fonts in `index.html`; bound through `--font-sans` in theme.
- Path alias `@/` → `src/` (via `fileURLToPath`, no `@types/node` dirname dependency at runtime).

### Base UI components (`src/app/components/ui/`)
Button, Badge, Card, Input, Select, Table, Tabs. All DS-aligned (see decisions below).

### Context + layout
- `contexts/SubAccountContext.tsx` — verbatim port (in-memory subaccount state).
- `layouts/RootLayout.tsx` — sidebar + topbar with subaccount switcher, three navigation variants (standard / main-account / subaccount).
- `routes.tsx` — all 19 routes wired.

### Pages (all 19 + AddressBook component)
Login, Dashboard, ParentDashboard, DashboardWrapper, Transactions, TransactionDetails, BulkUploader, BulkUploadSummary, DataAnalytics (recharts), Earnings, BillingStatement, PaymentSettings, AddressBookPage + AddressBook, APIAccess, Complaints, SubAccounts, EnableSubAccounts, EnableSubAccountsSetup, RequestSubAccount, UsersPermissions, Settings.

---

## Critical implementation rules applied

1. **Icons migrated Lucide → `@tabler/icons-react`** across every file. Mapping examples:
   `LayoutDashboard→IconLayoutDashboard`, `Package→IconPackage`, `BarChart3→IconChartBar`,
   `Code2→IconCode`, `MessageSquare→IconMessage`, `Building2→IconBuilding`, `DollarSign→IconCurrencyDollar`,
   `ChevronsUpDown→IconSelector`, `ArrowLeftRight→IconArrowsLeftRight`, `Menu→IconMenu2`,
   `CheckCircle2→IconCircleCheck`, `XCircle→IconCircleX`, `AlertCircle→IconAlertCircle`,
   `CalendarDays→IconCalendar`, `RefreshCw→IconRefresh`, `Share2→IconShare`, `Trash2→IconTrash`,
   `SlidersHorizontal→IconAdjustmentsHorizontal`, `Shield→IconShield`, `Book→IconBook`.
2. **Button `variant="danger"` → `variant="destructive"`** (RootLayout logout button).
3. **Button `size="md"` → `size="default"`**; default variant renamed `primary` → `default` (now `bg-primary`).
4. **Theme CSS variables** used for primary color (`--primary: #0088C9`). Component focus rings use `focus-visible:ring-primary`. Page-level layout retains Tailwind `gray-*`/`blue-*` utilities (acceptable for POC per DS §7).
5. **IMPLEMENTATION_LOG.md** created (this file).
6. No blockers required stopping — see notes below.
7. **`npm run build` passes** (tsc -b + vite build, 0 errors).

---

## Decisions

- **Button variants:** Provided `default, secondary, outline, ghost, link, destructive` + sizes `default, sm, lg, icon`. The Make file's `primary` mapped to `default`; `danger` mapped to `destructive`.
- **Badge variants:** Extended Make's set to include both `info`/`warning` (used by Dashboard/Transactions status configs) and kept `danger` + alias `destructive`, plus `secondary`/`outline`. Status variants: `success, info, warning, danger, pending`.
- **Unused Lucide imports dropped** during port: `Filter` (Transactions, Complaints), `Key`/`FileText` where unused, `Building2` where unused (Setup/Request). Removes dead imports without behavior change.
- **recharts `percent` typing:** PieChart label now guards `(percent ?? 0)` since recharts v2 types it optional.
- **vite alias:** used `fileURLToPath(new URL(...))` instead of `__dirname`/`node:path` to keep config clean; `@types/node@22` added as devDep for `node:url` typing.

---

## DS Gaps (carried over from DS context §8, unresolved in code)

### DS Gap: Form error/invalid states
- Figma Make reference: Login uses `alert()` for invalid credentials; no inline field error styling exists.
- Current workaround: kept `alert()` behavior from Make file.
- Recommended DS addition: error/invalid `State` on Input/Select with red ring + helper text.
- Risk level: medium (required before real auth/registration ships).

### DS Gap: Sidebar component
- Figma Make reference: sidebar is fully custom Tailwind (not the DS `Sidebar` component).
- Current workaround: ported the custom sidebar verbatim into `RootLayout.tsx`.
- Recommended DS addition: reconcile DS `Sidebar` page with this implementation.
- Risk level: low.

### DS Gap: Avatar initials / KPI card / notification dot
- Figma Make reference: gradient+initials avatars, colored KPI stat cards, bell-with-red-dot.
- Current workaround: implemented inline with Tailwind utilities (no named DS component).
- Recommended DS addition: `Avatar initials` variant, `KPI Card` pattern, notification badge.
- Risk level: low.

---

## Known follow-ups (non-blocking)
- Bundle is a single 871 kB chunk (recharts-heavy). Consider lazy-loading `DataAnalytics` route to code-split recharts.
- Page-level color utilities are raw Tailwind, not `mode` semantic tokens — fine for POC, revisit when enforcing tokens.
- Login is unauthenticated mock (`max@email.com` / `!1234qwer`); routes are not guarded.
