# Design System Rules — GGX Corporate

## Component usage

- **Use the existing component library and design tokens first.** Do not reach for raw HTML elements or inline styles when a shared component exists.
- **Compose existing primitives before creating new components.** A new layout is usually a composition of `Card`, `Button`, `Badge`, `Table`, `Dialog`, `Input`, `Select`, and utility classes — not a new component.
- **Avoid duplicate components.** Before creating anything new, check `src/app/components/ui/` and `src/app/components/` for existing implementations.

## Creating new components

- New reusable custom components **must** be added to the shared component library (`src/app/components/` or `src/app/components/ui/`), not defined only inside a page or feature folder.
- A component is "reusable" if it is used in more than one page, or if it encapsulates a pattern that will recur (e.g. a status timeline, a proof modal, a stat card).
- Page-specific one-off composition is fine inside the page file — extract only when reuse is real, not anticipated.

## Figma alignment

- When a new reusable component is added to code, also add or update the matching component in the Figma Design System file using Figma MCP.
- Keep Figma and code aligned in: **naming**, **variants**, **states** (default, hover, disabled, loading, error), **layout behavior** (spacing, sizing, responsiveness), **visual styling** (color, radius, shadow, typography), and **usage guidance**.
- If Figma is updated first, reflect the change in code. If code is updated first, reflect the change in Figma.

## Tokens and visual language

- Use design tokens for spacing, color, border radius, shadow, and typography — do not hardcode values that exist as tokens.
- Stick to the established color palette: primary actions in blue, success in emerald/green, warning in amber/orange, danger in red, neutral in gray.
- Badge variants: `success`, `info`, `warning`, `danger`, `pending`, `default` — use the closest semantic match, do not invent new variants without updating the Badge component.
- Consistent border radius: `rounded-lg` for cards and inputs, `rounded-full` for badges and pills, `rounded-xl` for icon containers.

## Responsive behavior

- Layouts must work at ≥1024px without overflow or horizontal scroll.
- Avoid fixed widths on containers that hold variable-length text (names, amounts, tracking numbers).
- Use `min-w-0` + `truncate` on flex children that may overflow.
- Badge/chip rows in table cells must not wrap unexpectedly — constrain with `flex-shrink-0` or a `+N more` pattern.
- Test KPI card values at narrow widths — large currency strings need either font scaling or truncation.
