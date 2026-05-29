# GGX Corporate — Design System Usage Guide

**Date:** 2026-05-29
**Figma file:** https://www.figma.com/design/9zwtAL4RU3Y8WVRJAsSulX/GGX-SHADCN
**Purpose:** Practical reference for applying the GGX Corporate design system in code.

---

## Color Tokens

All color tokens are CSS custom properties defined in `src/styles/theme.css`. Tailwind exposes them as utility classes via the `@theme inline` block.

### Semantic Token Reference

| CSS Variable | Tailwind Class | Hex / Value | Use When |
|---|---|---|---|
| `--primary` | `bg-primary`, `text-primary`, `border-primary` | `#0088C9` | Primary CTA buttons, active nav items, links, focus rings |
| `--primary-foreground` | `bg-primary-foreground`, `text-primary-foreground` | `#EBFCFF` | Text/icons on primary blue backgrounds |
| `--destructive` | `bg-destructive`, `text-destructive` | `#d4183d` | Danger buttons, error states |
| `--destructive-foreground` | `text-destructive-foreground` | `#ffffff` | Text on destructive backgrounds |
| `--secondary` | `bg-secondary` | `oklch(0.95 0.0058 264.53)` | Secondary surfaces |
| `--secondary-foreground` | `text-secondary-foreground` | `#030213` | Text on secondary backgrounds |
| `--muted` | `bg-muted` | `#ececf0` | Muted/inactive backgrounds |
| `--muted-foreground` | `text-muted-foreground` | `#717182` | Placeholder text, helper text, secondary labels |
| `--accent` | `bg-accent` | `#e9ebef` | Hover backgrounds on ghost/link elements |
| `--accent-foreground` | `text-accent-foreground` | `#030213` | Text on accent backgrounds |
| `--background` | `bg-background` | `#ffffff` | Page background |
| `--foreground` | `text-foreground` | `oklch(0.145 0 0)` | Default body text |
| `--card` | `bg-card` | `#ffffff` | Card backgrounds |
| `--border` | `border-border` | `rgba(0,0,0,0.1)` | Default borders |
| `--ring` | Focus ring color | `oklch(0.708 0 0)` | Focus outlines (via `outline-ring/50`) |
| `--radius` | `rounded-lg` (equivalent) | `0.625rem` | Base border radius |

### How to Use Tokens in Tailwind

```tsx
// Primary button background
<button className="bg-primary text-primary-foreground hover:bg-primary/90">...</button>

// Error/destructive
<button className="bg-destructive text-destructive-foreground">Delete</button>

// Muted text (helper text, timestamps, labels)
<p className="text-muted-foreground text-sm">Last updated 2 hours ago</p>

// Focus ring (already in Input/Button components — reference only)
className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
```

### Page-Level Color Utilities (acceptable for POC)

Pages frequently use direct Tailwind palette utilities for backgrounds and layout elements. This is intentional at the POC stage:

```
bg-gray-50, bg-gray-100     — page backgrounds, table hover states
text-gray-900, text-gray-700, text-gray-600, text-gray-500 — text hierarchy
border-gray-200, border-gray-300 — borders
bg-blue-50, bg-blue-100, text-blue-700 — info banners, active states
bg-green-50, text-green-700 — success states
bg-orange-50, text-orange-700 — warning states
bg-red-50, text-red-700 — error states
```

**Rule:** Components reference `--primary`/`--destructive`/etc. Pages may use direct Tailwind colors for layout and background regions.

---

## Typography Scale

Font family: **Inter** (loaded from Google Fonts in `index.html`, bound via `--font-sans` in theme).

| Class | Size | Use For |
|---|---|---|
| `text-xs` | 12px | Timestamps, badges, helper labels, metadata |
| `text-sm` | 14px | Body text, table cells, form labels, secondary content |
| `text-base` | 16px | Default body (not often explicitly set) |
| `text-lg` | 18px | Subheadings, card titles in some contexts |
| `text-xl` | 20px | Section headings (`<h2>`) |
| `text-2xl` | 24px | KPI card values, prominent numbers |
| `text-3xl` | 30px | Page titles (`<h1>`) |

### Weight Conventions

| Class | Weight | Use For |
|---|---|---|
| `font-normal` | 400 | Body text, descriptions |
| `font-medium` | 500 | Form labels, sub-labels, navigation items |
| `font-semibold` | 600 | Card titles, section headers, emphasized labels |
| `font-bold` | 700 | Page titles, KPI values, strong emphasis |

### Common Typography Patterns

```tsx
// Page title
<h1 className="text-3xl font-bold text-gray-900">Page Title</h1>
<p className="text-gray-600 mt-1">Subtitle or description</p>

// Section heading
<h2 className="text-xl font-semibold text-gray-900 mb-4">Section</h2>

// Card title (via component)
<CardTitle className="text-base font-semibold text-gray-900">Card Title</CardTitle>

// Table label
<p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Label</p>

// KPI value
<p className="text-3xl font-bold text-gray-900 mt-3 leading-none tracking-tight">2,847</p>

// Helper / metadata text
<p className="text-xs text-gray-500 mt-1">Updated 2 hours ago</p>
```

---

## Button Variants

All variants are in `src/app/components/ui/Button.tsx`.

| Variant | Visual | When to Use |
|---|---|---|
| `default` | Blue fill, white text | Primary CTA — the main action on a page/section |
| `secondary` | Light gray fill, dark text | Secondary action alongside a primary |
| `outline` | White fill, gray border, dark text | Tertiary action, "Cancel", or to group with a primary |
| `ghost` | Transparent, dark text, gray hover | Inline actions, icon buttons, low-emphasis actions |
| `link` | Blue text, underline on hover | Text links inside content |
| `destructive` | Red fill, white text | Dangerous/irreversible actions (delete, logout confirm) |

### Size Reference

| Size | Height | Padding | Use For |
|---|---|---|---|
| `sm` | 32px | `px-3` | Table row actions, inline buttons, compact toolbar |
| `default` | 40px | `px-4` | Standard forms and cards |
| `lg` | 48px | `px-6` | Hero sections, primary full-width CTAs |
| `icon` | 40px × 40px | Square | Icon-only buttons (e.g., copy, refresh) |

### Button Examples

```tsx
import { Button } from '../components/ui/Button';

// Primary CTA
<Button>Save Changes</Button>

// With icon
<Button>
  <IconDownload className="w-4 h-4 mr-2" />
  Export CSV
</Button>

// Danger
<Button variant="destructive" size="sm">
  <IconLogout className="w-3.5 h-3.5 mr-1.5" />
  Log out
</Button>

// Icon-only
<Button variant="outline" size="icon">
  <IconCopy className="w-4 h-4" />
</Button>

// Ghost inline action
<Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
  View all
  <IconArrowRight className="w-3.5 h-3.5" />
</Button>
```

---

## Badge Variants

All variants are in `src/app/components/ui/Badge.tsx`.

| Variant | Visual | When to Use |
|---|---|---|
| `default` | Gray bg, gray text | Neutral labels, unclassified items |
| `secondary` | Gray bg, gray text | Alias for default |
| `outline` | White bg, gray border | Outlined labels, tags |
| `success` | Green bg, green text | Delivered, paid, active, verified, deposited |
| `info` | Blue bg, blue text | In Transit, processing, info notices |
| `warning` | Yellow bg, yellow text | Picked Up, scheduled, awaiting, pending review |
| `danger` | Red bg, red text | Failed, error, high priority |
| `destructive` | Red bg, red text | Alias for danger |
| `pending` | Orange bg, orange text | Pending, open tickets, awaiting payment |

### Status Badge Mapping (Delivery)

```tsx
const statusConfig = {
  delivered:   { variant: 'success'  as const, label: 'Delivered' },
  'in-transit': { variant: 'info'    as const, label: 'In Transit' },
  'picked-up':  { variant: 'warning' as const, label: 'Picked Up' },
  failed:       { variant: 'danger'  as const, label: 'Failed' },
  pending:      { variant: 'pending' as const, label: 'Pending' },
  returned:     { variant: 'default' as const, label: 'Returned' },
};

// Usage
<Badge variant={statusConfig[delivery.status].variant}>
  {statusConfig[delivery.status].label}
</Badge>
```

### Badge Usage Patterns

```tsx
import { Badge } from '../components/ui/Badge';

// Status
<Badge variant="success">Delivered</Badge>
<Badge variant="danger">Failed</Badge>
<Badge variant="pending">Pending</Badge>

// Feature flag
<Badge variant="info">Default</Badge>
<Badge variant="success">Verified</Badge>
<Badge variant="warning">Pending Verification</Badge>

// Compact in tight spaces
<Badge variant="success" className="text-[10px] px-2 py-0.5">Active</Badge>
```

---

## Form Component States

### Input

| State | Classes | Behavior |
|---|---|---|
| Default | `border-gray-300 bg-white` | Normal |
| Focus | `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2` | Blue ring appears |
| Disabled | `disabled:cursor-not-allowed disabled:opacity-50` | Dimmed, unclickable |
| Error | Not yet implemented | Use `alert()` or add `border-red-500 ring-red-500` manually |

```tsx
import { Input } from '../components/ui/Input';

// Standard
<Input placeholder="Search..." value={query} onChange={(e) => setQuery(e.target.value)} />

// Disabled
<Input disabled value="Read only value" />

// With label
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1.5">
    Email Address
  </label>
  <Input type="email" required placeholder="you@company.com" />
</div>
```

### Select (Native)

Same states as Input. Same ring behavior on focus.

```tsx
import { Select } from '../components/ui/Select';

<Select value={filter} onChange={(e) => setFilter(e.target.value)}>
  <option value="all">All Statuses</option>
  <option value="delivered">Delivered</option>
</Select>
```

### Textarea (Not yet a component)

Until a `Textarea` UI component is created, use raw `<textarea>` with these classes:

```tsx
<textarea
  className="w-full h-24 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
  placeholder="..."
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

---

## Icon Usage (Tabler Icons)

**Package:** `@tabler/icons-react`
**Rule:** Tabler Icons are the ONLY icon set used in this project. Do not import from Lucide, Phosphor, Heroicons, or any other library.

### Import Pattern

```tsx
import { IconPackage, IconArrowLeft, IconDownload, IconCircleCheck } from '@tabler/icons-react';
```

Always import only what you need (named imports only — no default import).

### Size Conventions

| Context | Size Class | Example |
|---|---|---|
| Sidebar nav items | `w-[18px] h-[18px]` | Navigation icons |
| Topbar / header actions | `w-[18px] h-[18px]` | Bell icon |
| Button icons (sm) | `w-3.5 h-3.5` | Inline button icons |
| Button icons (default) | `w-4 h-4` | Standard button icons |
| Card / section icons | `w-5 h-5` | Feature card icons |
| KPI / stat card icons | `w-5 h-5` | Stat icons |
| Large feature icons | `w-6 h-6` | Hero card icons |
| Empty state icons | `w-8 h-8` to `w-10 h-10` | Empty state illustrations |

### Common Icons Used in This Project

| Icon | Variable | Used In |
|---|---|---|
| Dashboard | `IconLayoutDashboard` | Sidebar nav |
| Transactions | `IconPackage` | Sidebar nav, Dashboard |
| Bulk Upload | `IconUpload` | Sidebar nav, BulkUploader |
| Analytics | `IconChartBar` | Sidebar nav |
| Finance | `IconCurrencyDollar` | Sidebar nav section |
| Earnings | `IconWallet` | Sidebar nav |
| Billing | `IconReceipt` | Sidebar nav |
| Payment | `IconCreditCard` | Sidebar nav, PaymentSettings |
| Address Book | `IconMapPin` | Sidebar nav, AddressBook |
| API | `IconCode` | Sidebar nav |
| Support | `IconMessage` | Sidebar nav, Support Tickets |
| Subaccounts | `IconBuilding` | Sidebar nav, SubAccounts |
| Users | `IconUsers` | Sidebar nav, UsersPermissions |
| Settings | `IconSettings` | Sidebar nav |
| Search | `IconSearch` | Topbar, AddressBook |
| Bell | `IconBell` | Topbar |
| User avatar | `IconUser` | Topbar |
| Download | `IconDownload` | Export buttons |
| Close | `IconX` | Modals, dismiss |
| Check | `IconCheck` | Success states |
| Alert triangle | `IconAlertTriangle` | Warning banners |
| Trending up/down | `IconTrendingUp`, `IconTrendingDown` | KPI cards |
| Arrow right | `IconArrowRight` | "View all" links |
| Arrow left | `IconArrowLeft` | Back buttons |
| Star | `IconStar` | Rating widget |
| Copy | `IconCopy` | API key copy |
| Eye / EyeOff | `IconEye`, `IconEyeOff` | Password toggle |
| Circle check | `IconCircleCheck` | Success confirmation |
| Circle X | `IconCircleX` | Error/invalid |
| Alert circle | `IconAlertCircle` | Warning notices |
| Plus | `IconPlus` | Add/create actions |
| Logout | `IconLogout` | Logout button |
| Chevron down | `IconChevronDown` | Accordion, dropdown indicators |
| Selector | `IconSelector` | Account switcher |

---

## Spacing Conventions

Tailwind spacing scale is used throughout. Established patterns:

| Pattern | Classes | Context |
|---|---|---|
| Page outer padding | `p-6` or `p-6 lg:p-8` | All page wrappers |
| Page vertical sections | `space-y-6` or `space-y-8` | Between major sections |
| Card internal padding | `p-6` (CardContent default) or `p-5` (compact) | Inside cards |
| Form field spacing | `space-y-4` | Between form fields |
| Label to input gap | `mb-1.5` | `<label>` bottom margin |
| Icon to text gap | `gap-2` to `gap-3` | Icon + text in buttons/rows |
| Table cell padding | `p-4` (TableCell) | Cells |
| Table head height | `h-12` (TableHead) | Header row |
| Button-to-button gap | `gap-2` or `gap-3` | Button groups |

---

## Radius Conventions

Base radius: `0.625rem` (10px), exposed as `--radius`.

| Class | Value | Use For |
|---|---|---|
| `rounded-lg` | `0.625rem` | Buttons, inputs, cards (base) |
| `rounded-xl` | `0.875rem` | Cards (Card component uses this), larger containers |
| `rounded-2xl` | `1rem` | Large feature blocks, modals |
| `rounded-full` | `9999px` | Avatar circles, badges, dot indicators |
| `rounded-md` | `0.375rem` | Smaller elements (TabsTrigger) |

---

## Shadow Conventions

| Class | Use For |
|---|---|
| `shadow-sm` | Default card shadow |
| `shadow-md` | Hovered card (hover state) |
| `shadow-lg` | Modals, dropdowns |
| `shadow-xl` | Logout confirmation modal |
| No shadow | Colored KPI cards (they use border-0 instead) |

---

## Component Mapping Table

| DS Component (Figma) | Code Component | File Path |
|---|---|---|
| Button | `Button` | `src/app/components/ui/Button.tsx` |
| Badge | `Badge` | `src/app/components/ui/Badge.tsx` |
| Card | `Card`, `CardHeader`, `CardContent`, etc. | `src/app/components/ui/Card.tsx` |
| Input | `Input` | `src/app/components/ui/Input.tsx` |
| Native Select | `Select` | `src/app/components/ui/Select.tsx` |
| Table | `Table`, `TableHeader`, etc. | `src/app/components/ui/Table.tsx` |
| Tabs | `Tabs`, `TabsList`, etc. | `src/app/components/ui/Tabs.tsx` |
| Textarea | (not yet a component) | Use raw `<textarea>` with manual classes |
| Switch | (not yet a component) | Use custom `<button>` pattern (see APIAccess.tsx) |
| Avatar | (not yet a component) | Implemented inline in RootLayout.tsx |
| Sidebar | (not yet a component) | Implemented inline in RootLayout.tsx |
| Alert | (not yet a component) | Use Card with `bg-blue-50 border-blue-200` pattern |
| Dialog | (not yet a component) | Use modal pattern in RootLayout.tsx as reference |
| Checkbox | (not yet a component) | Use raw `<input type="checkbox">` with `w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600` |

---

## Dos and Don'ts

### Do

- Use `<Button variant="default">` for the primary action on any screen or form
- Use `<Button variant="outline">` for cancel and secondary actions next to a primary
- Use `<Button variant="ghost" size="sm">` for inline table actions and "View all" links
- Use `<Badge variant="success|info|warning|danger|pending">` for delivery and ticket status
- Import icons from `@tabler/icons-react` only
- Use `cn()` from `lib/utils` for merging conditional classes
- Wrap all page content in `<div className="p-6 space-y-6">` (or `p-6 lg:p-8 space-y-8` for dashboard-style pages)
- Use `text-3xl font-bold text-gray-900` for page titles
- Use `text-gray-600 mt-1` for page subtitles/descriptions
- Use `forwardRef` when creating new UI components
- Prefix table action buttons with `variant="ghost" size="sm"`
- Use `focus-visible:ring-2 focus-visible:ring-primary` for focus states on custom interactive elements

### Don't

- Don't use `variant="primary"` — it's `variant="default"` in this codebase
- Don't use `variant="danger"` — it's `variant="destructive"`
- Don't use `size="md"` — it's `size="default"`
- Don't import icons from Lucide, Heroicons, Phosphor, or any other icon library
- Don't use hardcoded hex colors in component files — use token utilities (`bg-primary`, not `bg-[#0088C9]`)
- Don't use `className="rounded"` on cards — they use `rounded-xl` via the Card component base class
- Don't skip `cn()` when combining class strings that may conflict — always merge with `cn()`
- Don't add a `<textarea>` without the focus ring classes (consistency)
- Don't use `alert()` for new features — document it as a known gap if you must keep it
- Don't import unused icons — named imports only, no wildcard
- Don't use `<button>` directly in new pages when `<Button>` component covers the use case

---

## Rules for Future Prompts

When asking Claude or another agent to add a feature to this codebase:

1. **Specify the page file.** "Add a filter to `src/app/pages/Transactions.tsx`" is better than "add a filter to transactions".

2. **Specify the icon.** Always tell the agent which Tabler icon to use, or ask it to choose from `@tabler/icons-react`. Never allow Lucide imports.

3. **Specify the component variant.** "Use `<Button variant='outline' size='sm'>`" prevents the agent from guessing wrong variants.

4. **Do not ask for new pages without routing.** Any new page needs a route in `routes.tsx` and optionally a nav item in `RootLayout.tsx`.

5. **Mock data only.** Do not ask for API integration — the current architecture uses static arrays. Any data changes should be to the mock arrays in the page files.

6. **Do not ask to refactor or restructure.** The codebase is intentionally straightforward for POC. Premature refactoring will break things.

7. **Read IMPLEMENTATION_LOG.md first.** Before adding anything, check whether it was already deferred as a blocker or noted as a known gap.

8. **Run `npm run build` after every change.** This is the sanity check. If it fails, something broke.

9. **One page at a time.** Changes to shared files (RootLayout, SubAccountContext, routes) are higher risk. Page-only changes are lower risk.

10. **Check DS_USAGE_GUIDE.md before picking colors or variants.** This document is the source of truth for what variant names, size names, and color utilities to use.
