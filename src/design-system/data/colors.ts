/**
 * Color reference for the GoGo Xpress Design System sample.
 *
 * Values mirror the live design tokens in `src/styles/theme.css` and the
 * semantic Tailwind scales already used by `components/ui/Badge.tsx`. This is a
 * documentation surface only — it does not redefine tokens. Update the tokens
 * (and re-run `npm run tokens`) as the source of truth; this list follows them.
 */

export interface ColorSwatch {
  name: string;
  /** CSS variable or Tailwind class where the color is consumed. */
  token: string;
  /** Representative hex value (for the swatch + copy reference). */
  value: string;
  /** Where/why to use it. */
  usage: string;
}

export interface ColorGroup {
  id: string;
  title: string;
  description: string;
  swatches: ColorSwatch[];
}

export const COLOR_GROUPS: ColorGroup[] = [
  {
    id: 'brand',
    title: 'Brand',
    description: 'The primary GoGo Xpress blue and its on-color foreground.',
    swatches: [
      {
        name: 'Primary Blue',
        token: '--primary',
        value: '#0088C9',
        usage: 'Primary CTAs, active nav, links, and key emphasis.',
      },
      {
        name: 'Primary Foreground',
        token: '--primary-foreground',
        value: '#EBFCFF',
        usage: 'Text/icons placed on the primary blue.',
      },
    ],
  },
  {
    id: 'surfaces',
    title: 'Supporting surfaces',
    description: 'Light blue / cyan tints used for soft highlights and selected states.',
    swatches: [
      { name: 'Cyan Surface', token: '--primary-foreground', value: '#EBFCFF', usage: 'Tinted callouts and info surfaces tied to the brand.' },
      { name: 'Sky 50', token: 'bg-sky-50', value: '#F0F9FF', usage: 'Subtle selected-row and highlight backgrounds.' },
      { name: 'Blue 50', token: 'bg-blue-50', value: '#EFF6FF', usage: 'Selected payment / option card fill (blue-50/40).' },
      { name: 'Blue 100', token: 'bg-blue-100', value: '#DBEAFE', usage: 'Info badge background.' },
    ],
  },
  {
    id: 'neutrals',
    title: 'Neutrals',
    description: 'Backgrounds, borders, and text grays for the Business+ shell.',
    swatches: [
      { name: 'Background', token: '--background', value: '#FFFFFF', usage: 'Page and card backgrounds.' },
      { name: 'Foreground', token: '--foreground', value: '#252525', usage: 'Primary body text (oklch 0.145).' },
      { name: 'Muted', token: '--muted', value: '#ECECF0', usage: 'Muted fills, dividers, secondary buttons.' },
      { name: 'Muted Foreground', token: '--muted-foreground', value: '#717182', usage: 'Helper text, captions, placeholders.' },
      { name: 'Border', token: '--border', value: '#E5E7EB', usage: 'Card and control borders (rgba(0,0,0,0.1)).' },
    ],
  },
  {
    id: 'semantic',
    title: 'Semantic',
    description: 'Status colors for success, warning, error, info, and pending. Matches the Badge variants.',
    swatches: [
      { name: 'Success', token: 'green-600 / green-100', value: '#16A34A', usage: 'Delivered, paid, completed states.' },
      { name: 'Warning', token: 'yellow-500 / yellow-100', value: '#EAB308', usage: 'Needs review, attention required.' },
      { name: 'Error', token: '--destructive', value: '#D4183D', usage: 'Destructive actions, failures.' },
      { name: 'Info', token: 'blue-600 / blue-100', value: '#2563EB', usage: 'In-transit, informational badges.' },
      { name: 'Pending', token: 'orange-500 / orange-100', value: '#F97316', usage: 'Awaiting payment, processing.' },
    ],
  },
];
