# GGX Corporate — Project Checkpoint

> ⚠️ **SUPERSEDED (2026-05-31).** This is the original 2026-05-29 checkpoint and is
> kept for history only. It is **out of date** — since then the project added git,
> mock auth + route guards, localStorage persistence, the BD roadmap features, a UX
> fix pass, an 11-service mock service layer, and an advanced service-migration pass.
> Several statements below (no git history, no route guards, 871 kB bundle, static
> per-page mock data, no persistence) no longer reflect reality. **For the current
> state read `PROJECT_HANDOFF.md` → `ROADMAP.md` → `IMPLEMENTATION_LOG.md` →
> `MOCK_SERVICE_LAYER.md`.**

**Date:** 2026-05-29
**Prepared by:** Claude (automated checkpoint)
**Project path:** `C:/Users/james/Projects/GGX Corporate/`

---

## App Status

**Working.** All 19 routes render. Login, navigation, subaccount switcher, and all page UIs are functional. No broken imports or runtime crashes detected.

---

## Build Status

**Passing.**

```
npm run build
tsc -b && vite build
✓ built in 6.73s
```

- TypeScript: 0 errors
- Vite: 0 errors
- Warning only: single JS bundle is 871 kB (recharts-heavy). Non-blocking, flagged as known follow-up.

---

## TypeScript Status

**Clean.** `tsc -b` passes with zero errors. All types are explicit. No `any` casts or `@ts-ignore` comments exist in the codebase.

---

## How to Run the App

```bash
cd "C:/Users/james/Projects/GGX Corporate"
npm install          # only needed first time
npm run dev          # starts Vite dev server
```

App runs at: **http://localhost:5173**

To preview the production build:
```bash
npm run build
npm run preview
```

---

## Login Credentials

| Field    | Value          |
|----------|----------------|
| Email    | max@email.com  |
| Password | !1234qwer      |

Login is a client-side mock. No backend. Entering any other credentials shows an `alert()`.

---

## What Is Implemented

### Infrastructure
- React 18 + TypeScript + Vite 6 + Tailwind CSS v4
- `react-router` v7 with `createBrowserRouter`
- Tailwind v4 with `@tailwindcss/vite` plugin
- Path alias `@/` → `src/`
- Theme CSS variables in `src/styles/theme.css` (GGX primary blue `#0088C9`)
- `SubAccountContext` for in-memory subaccount state management
- `RootLayout` with sidebar navigation, topbar, mobile menu, logout modal

### Pages (all routes functional)

| Route | Page | Status |
|---|---|---|
| `/` | Login (+ Registration form) | Done |
| `/dashboard` | Dashboard or ParentDashboard (context-aware) | Done |
| `/dashboard/transactions` | Transactions list with filters | Done |
| `/dashboard/transactions/:id` | Transaction Details with timeline | Done |
| `/dashboard/bulk-uploader` | Bulk Upload with address book integration | Done |
| `/dashboard/bulk-uploader/summary/:id` | Bulk Upload Summary with validation | Done |
| `/dashboard/analytics` | Data Analytics with recharts charts | Done |
| `/dashboard/earnings` | Earnings and settlement history | Done |
| `/dashboard/billing` | Billing Statements and invoices | Done |
| `/dashboard/payment-settings` | Payment methods and bank accounts | Done |
| `/dashboard/address-book` | Address Book (CRUD with local state) | Done |
| `/dashboard/api-access` | API Integration (keys, webhooks) | Done |
| `/dashboard/support-tickets` | Support Tickets (list + new ticket form) | Done |
| `/dashboard/subaccounts` | Subaccounts (gated by context) | Done |
| `/dashboard/subaccounts/enable` | Enable Subaccounts intro | Done |
| `/dashboard/subaccounts/enable/setup` | Enable Subaccounts confirm + execute | Done |
| `/dashboard/subaccounts/request` | Request Additional Subaccount | Done |
| `/dashboard/users-permissions` | Users & Permissions (main account only) | Done |
| `/dashboard/settings` | Account Settings | Done |

### UI Components (`src/app/components/ui/`)
Button, Badge, Card, Input, Select, Table, Tabs — all built from scratch, DS-aligned.

### Application Components
- `AddressBook` — full CRUD component used in two contexts (standalone page + embedded in BulkUploader)

### Subaccount Feature
- Three navigation variants: Standard / Main Account view / Subaccount view
- ParentDashboard shown when in Main Account view
- Account switcher in sidebar and topbar
- Data in Transactions, Earnings, Billing filtered for Main Account view

---

## What Is NOT Yet Implemented

| Feature | Notes |
|---|---|
| Real authentication | Login is a hardcoded mock |
| Route guards | Any URL is accessible without logging in |
| Real API integration | All data is static mock arrays in each page file |
| Pagination | "Previous/Next" buttons are non-functional |
| CSV export | "Export CSV" button does not download |
| CSV upload | File upload is simulated — clicking navigates to summary |
| Search functionality | Search inputs render but do not filter data |
| Address form location cascade | Province/city/barangay dropdowns have limited coverage |
| Error states on forms | No inline validation messages — uses alert() |
| Dark mode | Deferred |
| Auto-pay | Noted as "Coming Soon" on PaymentSettings page |
| Webhook save/test | UI only — no backend |
| Rating submission | UI only — rating widget does not persist |
| Edit/Remove buttons | Most management buttons are stubs |
| 2FA toggle | Settings checkbox does not activate anything |
| Lazy loading | DataAnalytics (recharts) is in the main bundle |

---

## Known Issues

1. **Bundle size 871 kB** — recharts is not code-split. Non-critical for POC.
2. **alert() for auth errors** — Login invalid credentials shows browser `alert()`. Should be inline error state.
3. **Static mock data** — All page data is hardcoded. Filtering/search logic is wired but not connected to data.
4. **No persistence** — SubAccountContext state is in-memory; reloading the page resets subaccount state.
5. **Logo loads from external URL** — `gogoxpress.com` CDN. Will break without internet access.
6. **TransactionDetails uses static data** — The `:id` param from the URL is read but not used to look up data; same transaction always shows.

---

## How to Restore This State

This checkpoint represents the state on **2026-05-29**. To restore:

1. Ensure Node.js 18+ is installed.
2. Navigate to `C:/Users/james/Projects/GGX Corporate/`.
3. Run `npm install` to restore `node_modules/`.
4. Run `npm run dev` to launch.
5. Login at `http://localhost:5173` with `max@email.com` / `!1234qwer`.

The `dist/` folder contains the most recent production build from this date. To regenerate it, run `npm run build`.

No git history exists for this project (not a git repo). Source files in `src/` are the single source of truth.
