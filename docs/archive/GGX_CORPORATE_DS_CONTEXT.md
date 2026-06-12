# GGX Corporate — Design System Context

**File:** `GGX_CORPORATE_DS_CONTEXT.md`
**Status:** Living document — working source of truth, not final
**Last updated:** 2026-05-29 (rev 2)
**Figma file:** https://www.figma.com/design/9zwtAL4RU3Y8WVRJAsSulX/GGX-SHADCN

---

## 1. Current Scope

- **Product:** GGX Corporate — B2B logistics web portal (POC)
- **Stack:** React + TypeScript + Tailwind CSS v4 + shadcn/ui
- **Stage:** Design system cleanup complete. No production code generated yet.
- **Brand:** Single brand — GGX Corporate. Multi-brand deferred post-POC.
- **Modes:** Light mode only. Dark mode deferred.
- **Breakpoints:** Not yet defined in DS. Responsive deferred post-POC.

---

## 2. Foundations & Variables

### Variable Collections (Figma)

| Collection | Purpose | When to use |
|---|---|---|
| `mode` | Semantic tokens | **Only** on component layers |
| `rdx/colors` | Radix 12-step primitives | Source values for `mode` tokens only |
| `tw/colors` | Tailwind palette | One-off screen/block use only |
| `tokens` | Numeric primitives (spacing, radius, etc.) | Do not use directly |
| `tw/*` | Tailwind utility mappings | Spacing, radius, font scales |

**Rule:** Components reference `mode` tokens only. Never bind a component directly to `rdx/colors` or `tw/colors`.

### Typography

- **Font family:** Inter only
- **Scale:** xs(12) sm(14) base(16) lg(18) xl(20) 2xl(24) 3xl(30) 4xl(36) 5xl(48) 6xl(60) 7xl(72) 8xl(96) 9xl(128)
- **Weights per step:** Thin, Extra Light, Light, Regular, Medium, Semi Bold, Bold, Extra Bold, Black
- **Status:** All 52 broken weight bindings fixed (2026-05-29). All styles now correctly bound.

### Icon Sets

| Page | Status |
|---|---|
| Tabler Icons | **PRIMARY** — use for all new work |
| Lucide Icons | Reference only ⚠️ Make file currently uses Lucide — migration to Tabler required before production |
| HugeIcons | Reference only |
| Phosphor Icons | Reference only |
| Remix Icons | Reference only |

> **Decision (2026-05-29):** Tabler Icons confirmed as the single icon set. Make file Lucide imports must be migrated to `@tabler/icons-react` before production code generation.

---

## 3. Component Inventory

All components live in the GGX-SHADCN Figma file. Pages map 1:1 to component names.

### Layout & Navigation
Accordion, Breadcrumb, Navigation Menu, Pagination, Scroll-area, Separator, Sidebar, Tabs

### Overlay & Feedback
Alert, Alert Dialog, Dialog, Drawer, Hover Card, Popover, Sheet, Skeleton, Sonner, Tooltip

### Form & Input
Button, Checkbox, Combobox, Input, Input Group, Input OTP, Label, Native Select, Radio Group, Select, Slider, Switch, Textarea, Toggle, Toggle Group

### Data Display
Avatar, Badge, Calendar, Card, Carousel, Chart, Data Table, Table

### Utility
Aspect Ratio, Collapsible, Context Menu, Dropdown Menu, Menubar, Progress, Spinner

---

## 4. Component Variants & States

### Button (`Buttons` component set)

| Property | Values |
|---|---|
| Variant | `default`, `secondary`, `destructive`, `outline`, `ghost`, `link`, `icon`, `with icon`, `loading`, `Rounded` |
| Size | `default`, `sm`, `lg` |
| State | `default`, `hover`, `disabled` |

> Note: `default` = what shadcn calls `primary`. Renamed during cleanup.

### Badge

| Property | Values |
|---|---|
| Variant | `default`, `secondary`, `destructive`, `outline`, `success`, `info`, `warning`, `danger`, `pending` |
| Display | `text`, `number`, `icon` |

> Status variants (`success`, `info`, `warning`, `danger`, `pending`) added 2026-05-29 for delivery status use cases. Colors follow Tailwind semantic palette (pastel bg + dark text). Not all Display combinations exist for every Variant — status variants have `text` + `number` only.

### Alert

| Property | Values |
|---|---|
| Variant | `default`, `title-only`, `destructive` |

### Avatar

| Property | Values |
|---|---|
| Variant | `circle`, `square`, `group` |

### Input / Textarea / Select / Toggle

All have `State`: `default`, `active`, `hover`, `focus`, `disabled`

> `active` = legacy name retained. `focus` = canonical interactive focus state (ring shadow). `hover` = slightly darker border.

### Switch

`State`: `Off`, `On`, `disabled`, `focus`

### Checkbox

`Type`: `checked`, `card`, `disabled`, `focus`

### Button

`State`: `default`, `hover`, `disabled`, `focus`

> `focus` state uses a spread ring shadow matching the variant's primary color at 45% opacity.

### Slider / Radio Group

`State`: `default`, `disabled`
> Both promoted from bare components to component sets during cleanup (2026-05-29).

---

## 5. Usage Rules

1. **Semantic tokens only on components.** Bind component fills/strokes/text to `mode` collection. Never hardcode hex or `tw/colors` on components.
2. **`tw/colors` for one-off screen use** — layout backgrounds, page wrappers, illustration fills. Not components.
3. **Tabler Icons only** for new icon usage. Lucide/Phosphor/Remix are reference only.
4. **Disabled state = 50% opacity** on the base default variant. This is the shadcn convention applied across all interactive components.
5. **Single logo.** GGX Brand page has the approved logo. Full brand guidelines deferred post-POC.

---

## 6. Tailwind / shadcn Mapping Notes

| DS concept | Tailwind equivalent | Notes |
|---|---|---|
| `Variant=default` (Button) | `bg-primary text-primary-foreground` | shadcn calls this `default`, not `primary` |
| `Variant=destructive` (Button) | `bg-destructive text-destructive-foreground` | |
| `State=disabled` | `opacity-50 pointer-events-none` | Applied to all interactive components |
| `State=active` (Input) | `ring-2 ring-ring` (focus) | Figma "active" = code "focus" |
| `Display=number` (Badge) | Numeric content in badge | No shadcn equivalent — custom |
| `Display=icon` (Badge) | Icon content in badge | No shadcn equivalent — custom |
| Button `Size=default` | `h-10 px-4` (shadcn `default`) | |
| Button `Size=sm` | `h-8 px-3 text-sm` | |
| Button `Size=lg` | `h-12 px-6` | |

---

## 7. Known Assumptions

- `State=active` in Figma maps to focus/focused in code. Not hover. Hover is a separate state on some components (Button has it, Input does not).
- `Variant=default` (Button) is the primary CTA — blue fill, white text.
- `Rounded` Button variant is a GGX-specific addition, not in shadcn base.
- `Size-default` Button variants were removed as duplicates of `Variant=default, Size=default` during restructure. If any instances break, they should be repointed to `Variant=default`.
- Badge `Display=number` and `Display=icon` are GGX custom extensions of the shadcn Badge.
- Checkbox `Type=card` is a GGX layout pattern (label+card wrapper). Not a shadcn primitive.

---

## 8. Needs Validation

- [x] **Status Badge variants** — Added `success`, `info`, `warning`, `danger`, `pending` to Badge (2026-05-29)
- [x] **Focus-visible states** — Added `State=focus` to Button, Input, Textarea, Select, Toggle, Checkbox, Switch (2026-05-29)
- [x] **Icon set decision** — Tabler confirmed as primary. Lucide migration required in Make file before production (2026-05-29)
- [ ] **Error/invalid states** — No error state on any form input in DS or Make file. Required before Login/Registration forms ship.
- [ ] **Sidebar component** — DS has a Sidebar page but Make file sidebar is entirely custom Tailwind. Needs reconciliation.
- [ ] **Avatar with initials** — Make file uses gradient+initials pattern in topbar and sidebar. DS `Avatar` needs an `initials` variant.
- [ ] **Notification dot** — Bell icon with red dot in topbar. Not a DS component.
- [ ] **KPI card pattern** — Dashboard stat cards (colored bg + icon bg). Not a named DS component.
- [ ] **Button `danger` vs `destructive`** — Make file uses `variant="danger"`, DS uses `Variant=destructive`. Standardise before code generation.
- [ ] **Button size `md` vs `default`** — Make file uses `size="md"`, DS uses `Size=default`. Align before code generation.

---

## 9. Change Log / Decisions

| Date | Change | Decision |
|---|---|---|
| 2026-05-29 | Fixed 52 broken text style weight bindings (Semi Bold, Extra Bold, Extra Light, Thin across xs–9xl) | All now correctly bound to Inter |
| 2026-05-29 | Button `Type=hhost` renamed to `Variant=ghost` | Typo fix |
| 2026-05-29 | Button restructured: `Type` → `Variant`, sizes separated into new `Size` property, `primary` → `default` | Aligns with shadcn naming convention |
| 2026-05-29 | `Size-default` Button variants removed | Duplicate of `Variant=default, Size=default` — safe to remove |
| 2026-05-29 | Added `State=disabled` to all interactive component sets | shadcn convention: 50% opacity on base variant |
| 2026-05-29 | Slider and Radio Group promoted from bare components to component sets | Required for disabled state + proper DS structure |
| 2026-05-29 | Alert, Avatar promoted from loose components to component sets | Required for proper variant structure |
| 2026-05-29 | Badge `Type` split into `Variant` + `Display` | Separates color scheme from content type |
| 2026-05-29 | Icon page labels added (PRIMARY / REFERENCE ONLY) | Documentation only — no structural change |
| 2026-05-29 | GGX Brand page scope note added | POC boundary documentation |
| 2026-05-29 | Page typos verified clean (Context Menu, Input OTP, Separator, Checkbox Disabled) | Already correct — no action needed |
| 2026-05-29 | Badge status variants added: success, info, warning, danger, pending (text + number) | Matches Make file delivery status usage |
| 2026-05-29 | Focus state added to Button, Input, Textarea, Select, Toggle, Checkbox, Switch | Matches `focus-visible:ring-2` already in Make file code |
| 2026-05-29 | Hover state added to Input, Textarea, Select | Slightly darker border on hover |
| 2026-05-29 | Tabler Icons confirmed as primary icon set | Make file must migrate from Lucide before production |

---

## 10. Open Questions

1. ~~**Icon set:**~~ **Resolved** — Tabler Icons confirmed as primary. Make file migration from Lucide required before code generation.

2. ~~**Status Badge variants:**~~ **Resolved** — Added to DS as Variant values on existing Badge component set.

3. **Button `danger` naming:** Make file code calls it `danger`, Figma DS calls it `destructive` (shadcn default). Standardise on `destructive` (aligns with shadcn) or `danger` (more readable for this domain)?

4. **Focus-visible in Figma:** Code already handles focus rings. Should the Figma DS add focus-visible states for completeness, or accept the DS-code gap for POC?

5. **Sidebar:** Custom-built in the Make file vs. DS Sidebar page. Are these meant to be the same component? If yes, the DS Sidebar needs to reflect the actual implementation.

6. **Error states:** No error state exists anywhere. Is this acceptable for POC, or are there any forms that need immediate validation feedback (e.g., Login, Registration)?

7. **`tw/colors` vs `mode` in screens:** The Make file heavily uses direct Tailwind color utilities. For POC this is acceptable — but when should we enforce semantic token usage?
