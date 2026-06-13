# UI Components Context

Use this for small UI polish, component choices, responsive fixes, and Figma/code
alignment.

## Component Defaults

- Use the existing GGX SHADCN/shared component library first.
- Compose existing primitives before creating new components.
- Add reusable custom components to `src/app/components/` or
  `src/app/components/ui/`, not inside only one page.
- Use design tokens and established variants before introducing new styling.

## Common Polish Scope

Good `small-ui-polish` tasks include:

- Button size, variant, icon alignment, or primary/outline treatment.
- Card spacing, grid alignment, density, and hover states.
- Badge/chip wrapping, truncation, and `+N more` patterns.
- Responsive layout fixes at 1024px, 1280px, and 1440px.
- Matching shadcn/GGX visual patterns already used elsewhere.

Avoid pulling service/data/account logic into simple UI polish unless behavior is
actually wrong.

## Page Patterns

- Page headers use `text-3xl font-bold text-gray-900` plus optional one-line
  subtitle.
- Do not add icon chips beside page titles unless the existing pattern changes.
- DS segmented `Tabs` is the default tab pattern.
- Cards, tables, dialogs, inputs, buttons, badges, and selects should come from
  shared components when available.

## Responsive Rules

- Layouts must work at 1024px and above without overflow.
- Use `min-w-0` and `truncate` for variable text in flex/grid children.
- Badges and chips in constrained rows should not wrap incoherently.
- Large KPI currency values need truncation or safe responsive treatment.

## Figma Alignment

- When code gains a reusable component, update the matching Figma DS component
  when Figma MCP is available.
- Keep naming, variants, states, spacing, sizing, responsiveness, radius, shadow,
  typography, and usage guidance aligned.
