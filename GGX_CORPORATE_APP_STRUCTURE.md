# GGX Corporate — App Structure Reference

**Date:** 2026-05-29
**Purpose:** Complete reference for anyone continuing development on this project.

---

## Directory Tree

```
C:/Users/james/Projects/GGX Corporate/
├── index.html                          # Root HTML, loads Inter font via Google Fonts
├── package.json                        # Dependencies and npm scripts
├── vite.config.ts                      # Vite config: React plugin, Tailwind v4, @ alias
├── tsconfig.json                       # TS composite root (references app + node)
├── tsconfig.app.json                   # App TypeScript config
├── tsconfig.node.json                  # Node/Vite TypeScript config
├── PROJECT_CHECKPOINT.md               # App status snapshot (2026-05-29)
├── IMPLEMENTATION_LOG.md               # Build history, decisions, gaps, next steps
├── GGX_CORPORATE_APP_STRUCTURE.md      # This file
├── DS_USAGE_GUIDE.md                   # Design system practical reference
├── GGX_CORPORATE_DS_CONTEXT.md        # Figma DS audit and decisions
├── dist/                               # Production build output (gitignored)
└── src/
    ├── index.css                       # Tailwind entry: @import tailwindcss + theme
    ├── main.tsx                        # React root: createRoot + StrictMode
    └── app/
        ├── App.tsx                     # RouterProvider wrapper
        ├── routes.tsx                  # All route definitions (createBrowserRouter)
        ├── components/
        │   ├── AddressBook.tsx         # Full CRUD address book component
        │   └── ui/
        │       ├── Badge.tsx           # Badge with status variants
        │       ├── Button.tsx          # Button with CVA variants
        │       ├── Card.tsx            # Card + CardHeader/Content/Title/Description/Footer
        │       ├── Input.tsx           # Styled input element
        │       ├── Select.tsx          # Styled native select element
        │       ├── Table.tsx           # Table + Header/Body/Row/Head/Cell
        │       └── Tabs.tsx            # Radix Tabs wrapper
        ├── contexts/
        │   └── SubAccountContext.tsx   # SubAccount state + provider + hook
        ├── layouts/
        │   └── RootLayout.tsx          # Sidebar + topbar + mobile menu + logout modal
        ├── lib/
        │   └── utils.ts                # cn() helper: clsx + tailwind-merge
        ├── pages/
        │   ├── Login.tsx               # / — Login + Registration form
        │   ├── DashboardWrapper.tsx    # /dashboard — context-aware dashboard selector
        │   ├── Dashboard.tsx           # /dashboard — standard/subaccount view
        │   ├── ParentDashboard.tsx     # /dashboard — main account organizational view
        │   ├── Transactions.tsx        # /dashboard/transactions
        │   ├── TransactionDetails.tsx  # /dashboard/transactions/:id
        │   ├── BulkUploader.tsx        # /dashboard/bulk-uploader
        │   ├── BulkUploadSummary.tsx   # /dashboard/bulk-uploader/summary/:id
        │   ├── DataAnalytics.tsx       # /dashboard/analytics
        │   ├── Earnings.tsx            # /dashboard/earnings
        │   ├── BillingStatement.tsx    # /dashboard/billing
        │   ├── PaymentSettings.tsx     # /dashboard/payment-settings
        │   ├── AddressBookPage.tsx     # /dashboard/address-book
        │   ├── APIAccess.tsx           # /dashboard/api-access
        │   ├── SupportTickets.tsx      # /dashboard/support-tickets
        │   ├── SubAccounts.tsx         # /dashboard/subaccounts
        │   ├── EnableSubAccounts.tsx   # /dashboard/subaccounts/enable
        │   ├── EnableSubAccountsSetup.tsx # /dashboard/subaccounts/enable/setup
        │   ├── RequestSubAccount.tsx   # /dashboard/subaccounts/request
        │   ├── UsersPermissions.tsx    # /dashboard/users-permissions
        │   └── Settings.tsx            # /dashboard/settings
        └── styles/
            └── theme.css               # CSS variables + Tailwind @theme inline block
```

---

## What Each Folder Does

| Folder / File | Purpose |
|---|---|
| `src/app/` | Everything React — components, pages, contexts, layout, routing |
| `src/app/components/ui/` | Reusable primitive UI components (Button, Badge, Card, etc.) |
| `src/app/components/` | Larger application-level components (AddressBook) |
| `src/app/contexts/` | React context providers for shared state |
| `src/app/layouts/` | Page shell components that wrap routes |
| `src/app/lib/` | Utility functions |
| `src/app/pages/` | One file per route. Pages import from ui/ and contexts/ |
| `src/styles/` | Global CSS. theme.css defines all design tokens |

---

## Route Table

| Route | Component | File |
|---|---|---|
| `/` | `Login` | `src/app/pages/Login.tsx` |
| `/dashboard` (index) | `DashboardWrapper` → `Dashboard` or `ParentDashboard` | `DashboardWrapper.tsx`, `Dashboard.tsx`, `ParentDashboard.tsx` |
| `/dashboard/transactions` | `Transactions` | `Transactions.tsx` |
| `/dashboard/transactions/:id` | `TransactionDetails` | `TransactionDetails.tsx` |
| `/dashboard/bulk-uploader` | `BulkUploader` | `BulkUploader.tsx` |
| `/dashboard/bulk-uploader/summary/:id` | `BulkUploadSummary` | `BulkUploadSummary.tsx` |
| `/dashboard/bulk-upload-summary` | `BulkUploadSummary` | `BulkUploadSummary.tsx` (alternate route) |
| `/dashboard/analytics` | `DataAnalytics` | `DataAnalytics.tsx` |
| `/dashboard/earnings` | `Earnings` | `Earnings.tsx` |
| `/dashboard/billing` | `BillingStatement` | `BillingStatement.tsx` |
| `/dashboard/payment-settings` | `PaymentSettings` | `PaymentSettings.tsx` |
| `/dashboard/address-book` | `AddressBookPage` | `AddressBookPage.tsx` |
| `/dashboard/api-access` | `APIAccess` | `APIAccess.tsx` |
| `/dashboard/support-tickets` | `SupportTickets` | `SupportTickets.tsx` |
| `/dashboard/complaints` | → redirect to `/dashboard/support-tickets` | `routes.tsx` |
| `/dashboard/subaccounts` | `SubAccounts` | `SubAccounts.tsx` |
| `/dashboard/subaccounts/enable` | `EnableSubAccountsIntro` | `EnableSubAccounts.tsx` |
| `/dashboard/subaccounts/enable/setup` | `EnableSubAccountsSetup` | `EnableSubAccountsSetup.tsx` |
| `/dashboard/subaccounts/request` | `RequestSubAccount` | `RequestSubAccount.tsx` |
| `/dashboard/users-permissions` | `UsersPermissions` | `UsersPermissions.tsx` |
| `/dashboard/settings` | `Settings` | `Settings.tsx` |

All routes under `/dashboard` are children of `RootLayout` (which renders the sidebar + topbar shell).

---

## Component Inventory

### UI Components (`src/app/components/ui/`)

#### Button (`Button.tsx`)
```tsx
<Button variant="default|secondary|outline|ghost|link|destructive" size="default|sm|lg|icon">
```
- Extends `React.ButtonHTMLAttributes<HTMLButtonElement>`
- Built with `class-variance-authority` (CVA)
- Exports: `Button`, `buttonVariants`, `ButtonProps`

#### Badge (`Badge.tsx`)
```tsx
<Badge variant="default|secondary|outline|success|info|warning|danger|destructive|pending">
```
- Extends `React.HTMLAttributes<HTMLDivElement>`
- Built with CVA
- Exports: `Badge`, `badgeVariants`, `BadgeProps`

#### Card (`Card.tsx`)
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>...</CardContent>
  <CardFooter>...</CardFooter>
</Card>
```
- All sub-components are `forwardRef` divs/paragraphs
- Exports: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`

#### Input (`Input.tsx`)
```tsx
<Input type="text|email|password|tel|url|date" placeholder="..." value={...} onChange={...} />
```
- Extends `React.InputHTMLAttributes<HTMLInputElement>`
- Exports: `Input`, `InputProps`

#### Select (`Select.tsx`)
```tsx
<Select value={...} onChange={...}>
  <option value="x">Label</option>
</Select>
```
- Native `<select>` element, not a custom dropdown
- Extends `React.SelectHTMLAttributes<HTMLSelectElement>`
- Exports: `Select`, `SelectProps`

#### Table (`Table.tsx`)
```tsx
<Table>
  <TableHeader>
    <TableRow><TableHead>Col</TableHead></TableRow>
  </TableHeader>
  <TableBody>
    <TableRow><TableCell>Data</TableCell></TableRow>
  </TableBody>
</Table>
```
- All sub-components are `forwardRef`
- `Table` is wrapped in a `div` with `overflow-auto` for horizontal scrolling
- Exports: `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`

#### Tabs (`Tabs.tsx`)
```tsx
<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content</TabsContent>
</Tabs>
```
- Built on `@radix-ui/react-tabs`
- Exports: `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`

### Application Components

#### AddressBook (`components/AddressBook.tsx`)
```tsx
<AddressBook mode="full" />
<AddressBook mode="select" onSelectAddress={(addr) => void} onClose={() => void} />
```
- Two modes: `full` (standalone page CRUD) and `select` (embedded picker)
- Exports: `AddressBook`, `Address` (interface)
- Address interface: `id, label, customLabel?, name, mobileNumber, province, city, barangay, otherDetails, isPreferred`
- Internal state only — does not persist

---

## Context Providers

### SubAccountContext (`contexts/SubAccountContext.tsx`)

**What it manages:**
- `subAccountsEnabled: boolean` — whether the subaccount feature is active
- `mainAccount: MainAccount | null` — legal name, billing email, contacts
- `subAccounts: SubAccount[]` — list of all subaccounts
- `currentAccount: string` — `'main'` or a subaccount `id`

**Functions exposed:**
- `enableSubAccounts(mainAccountData, firstSubAccount)` — activates feature, sets main + first subaccount
- `addSubAccount(subAccount)` — appends a new subaccount
- `setCurrentAccount(accountId)` — switches active account context
- `getCurrentAccountName() → string` — returns display name for current account
- `isMainAccountView() → boolean` — true when `subAccountsEnabled && currentAccount === 'main'`

**Hook:** `useSubAccounts()` — throws if used outside `SubAccountProvider`

**Provider location:** `src/app/App.tsx` wraps `RouterProvider` with `SubAccountProvider`

**Effect on UI:**
- Navigation items change based on account type (standard / main / subaccount)
- DashboardWrapper renders different dashboard
- Transactions, Earnings, Billing show/hide subaccount columns
- Sidebar account switcher appears when `subAccountsEnabled`

---

## Data Layer

**All data is static mock arrays defined at the top of each page file.**

No API, no database, no localStorage. Data resets on every page reload.

| Page | Mock Data Location | Data Shape |
|---|---|---|
| Dashboard | `Dashboard.tsx` | `stats[]`, `quickActions[]`, `recentTransactions[]`, `earningsRows[]`, `performanceRows[]` |
| ParentDashboard | `ParentDashboard.tsx` | `stats[]`, `subaccountPerformance[]`, `recentActivity[]`, `quickActions[]` |
| Transactions | `Transactions.tsx` | `deliveries[]` — 10 rows |
| TransactionDetails | `TransactionDetails.tsx` | Single hardcoded `transaction` object |
| BulkUploader | `BulkUploader.tsx` | `recentUploads[]` — 4 rows |
| BulkUploadSummary | `BulkUploadSummary.tsx` | `uploadedData[]` — 5 rows |
| DataAnalytics | `DataAnalytics.tsx` | `monthlyVolumeData[]`, `statusBreakdownData[]`, `performanceData[]`, `stats[]` |
| Earnings | `Earnings.tsx` | `settlements[]` — 5 rows |
| BillingStatement | `BillingStatement.tsx` | `invoices[]` — 6 rows, `summaryStats[]` |
| Support Tickets | `SupportTickets.tsx` | `tickets[]` — 6 rows |
| UsersPermissions | `UsersPermissions.tsx` | `users[]` — 4 rows |
| AddressBook | `AddressBook.tsx` | Initial `addresses[]` — 3 rows (lives in component state) |

**SubAccount state** is the exception — it lives in `SubAccountContext` (in-memory, updated by user actions).

---

## Styling Approach

### CSS Variables (Design Tokens)
All tokens are defined in `src/styles/theme.css` as CSS custom properties on `:root`.

Key tokens:
- `--primary: #0088C9` — GGX brand blue
- `--primary-foreground: #EBFCFF` — text on primary
- `--destructive: #d4183d` — danger red
- `--radius: 0.625rem` — base border radius
- `--background: #ffffff`
- `--foreground: oklch(0.145 0 0)`
- `--border: rgba(0, 0, 0, 0.1)`

These are exposed to Tailwind via the `@theme inline` block, making them available as `bg-primary`, `text-primary-foreground`, `bg-destructive`, etc.

### Tailwind CSS v4
- Installed via `@tailwindcss/vite` Vite plugin (no PostCSS config needed)
- All utilities available out of the box
- Semantic token utilities: `bg-primary`, `text-foreground`, `border-border`, `bg-destructive`, `text-destructive-foreground`, `bg-muted`, `text-muted-foreground`
- Direct color utilities also used in pages: `bg-blue-50`, `text-gray-900`, `border-gray-200`, etc. (acceptable for page-level layout)

### Component vs Page Styling Rule
- **UI components** (`ui/`) use design tokens (`bg-primary`, `bg-destructive`, `ring-primary`)
- **Pages** use both tokens and direct Tailwind utilities freely (gray-*, blue-*, green-*, etc.)
- This split is intentional for POC; enforce semantic tokens on components only in production

### shadcn Conventions Applied
- `cn()` utility for conditional class merging everywhere
- `forwardRef` on all UI components
- CVA (class-variance-authority) for variant-based components (Button, Badge)
- `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2` on all interactive inputs

---

## How to Add a New Page

1. Create the file: `src/app/pages/YourPage.tsx`
2. Export a named function component:
   ```tsx
   export function YourPage() {
     return (
       <div className="p-6 space-y-6">
         <h1 className="text-3xl font-bold text-gray-900">Page Title</h1>
         {/* ... */}
       </div>
     );
   }
   ```
3. Add the import and route to `src/app/routes.tsx`:
   ```tsx
   import { YourPage } from './pages/YourPage';
   // inside the children array of the /dashboard route:
   { path: 'your-path', Component: YourPage },
   ```
4. If the page should appear in the sidebar, add a nav item to the appropriate navigation array in `src/app/layouts/RootLayout.tsx`:
   ```tsx
   { name: 'Your Page', href: '/dashboard/your-path', icon: IconSomething },
   ```
5. Import any UI components you need from `../components/ui/`:
   ```tsx
   import { Card, CardContent } from '../components/ui/Card';
   import { Button } from '../components/ui/Button';
   ```

---

## How to Add a New UI Component

1. Create the file: `src/app/components/ui/YourComponent.tsx`
2. Follow the existing pattern:
   ```tsx
   import { forwardRef } from 'react';
   import { cn } from '../../lib/utils';

   export interface YourComponentProps extends React.HTMLAttributes<HTMLDivElement> {
     // add custom props
   }

   export const YourComponent = forwardRef<HTMLDivElement, YourComponentProps>(
     ({ className, ...props }, ref) => (
       <div ref={ref} className={cn('base-classes-here', className)} {...props} />
     )
   );
   YourComponent.displayName = 'YourComponent';
   ```
3. For variant-based components, use CVA:
   ```tsx
   import { cva, type VariantProps } from 'class-variance-authority';
   const variants = cva('base', { variants: { variant: { default: '...', secondary: '...' } } });
   ```
4. Import and use in pages: `import { YourComponent } from '../components/ui/YourComponent';`

---

## How to Apply a Fix Safely

1. **Read the file first** — understand what it does before touching it.
2. **Touch only one file at a time** — changes that ripple across files are high risk.
3. **Do not change component props or interfaces** — pages depend on the exact API.
4. **Do not change the mock data shapes** — page logic indexes into these arrays by known fields.
5. **Do not restructure routes** — URL changes break any bookmarks or tested navigation paths.
6. **After any change, run `npm run build`** — confirms TypeScript and Vite still pass.
7. **For safe fixes** (type annotations, unused imports, defensive guards) — apply directly.
8. **For risky fixes** (logic changes, data shape changes, API changes) — document in IMPLEMENTATION_LOG.md first.

---

## Import Conventions

### Alias
The `@/` alias maps to `src/`. It is available but not currently used — all imports use relative paths.

### From pages, import:
```tsx
// UI components
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';

// Application components
import { AddressBook, type Address } from '../components/AddressBook';

// Context
import { useSubAccounts } from '../contexts/SubAccountContext';

// Routing
import { useNavigate, useParams, Link } from 'react-router';

// Icons (always from Tabler)
import { IconPackage, IconArrowLeft } from '@tabler/icons-react';

// Charting (DataAnalytics only)
import { BarChart, Bar, ... } from 'recharts';
```

### From UI components, import:
```tsx
import { cn } from '../../lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
```

### From layouts, import:
```tsx
import { cn } from '../lib/utils';
import { Button } from '../components/ui/Button';
import { useSubAccounts } from '../contexts/SubAccountContext';
```
