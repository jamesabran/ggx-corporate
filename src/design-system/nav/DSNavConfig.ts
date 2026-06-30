// Navigation configuration for the GGX Design System reference.
// DS_FLAT_PAGES drives Prev/Next footer navigation (order matters).

export interface DSNavItem {
  type?: 'item';
  label: string;
  path: string; // relative to /design-system/; '' = index route
}

export interface DSNavDivider {
  type: 'divider';
  label: string;
}

export type DSNavEntry = DSNavItem | DSNavDivider;

export interface DSNavGroup {
  label: string;
  items: DSNavEntry[];
  defaultOpen?: boolean; // defaults to true
}

export const DS_NAV_GROUPS: DSNavGroup[] = [
  {
    label: 'Getting Started',
    items: [
      { label: 'Overview', path: '' },
      { label: 'How this reference works', path: 'getting-started/how-this-works' },
    ],
  },
  {
    label: 'Foundations',
    items: [
      { label: 'Overview', path: 'foundations/overview' },
      { label: 'Colors', path: 'foundations/colors' },
      { label: 'Typography', path: 'foundations/typography' },
      { label: 'Spacing', path: 'foundations/spacing' },
      { label: 'Design Tokens', path: 'foundations/design-tokens' },
      { label: 'Elevation & Shadows', path: 'foundations/elevation-shadows' },
      { label: 'Icons', path: 'icons' },
      { label: 'Responsive behavior', path: 'foundations/responsive-behavior' },
    ],
  },
  {
    label: 'Components',
    items: [
      { label: 'Overview', path: 'components/overview' },
      { type: 'divider', label: 'Display' },
      { label: 'Alert', path: 'components/alert' },
      { label: 'Avatar', path: 'components/avatar' },
      { label: 'Badge', path: 'components/badge' },
      { label: 'Icon Container', path: 'components/icon-container' },
      { label: 'Progress', path: 'components/progress' },
      { label: 'Separator', path: 'components/separator' },
      { label: 'Tooltip', path: 'components/tooltip' },
      { type: 'divider', label: 'Actions' },
      { label: 'Button', path: 'components/button' },
      { type: 'divider', label: 'Inputs' },
      { label: 'Calendar', path: 'components/calendar' },
      { label: 'Checkbox', path: 'components/checkbox' },
      { label: 'Combobox', path: 'components/combobox' },
      { label: 'Field', path: 'components/field' },
      { label: 'Input', path: 'components/input' },
      { label: 'Radio Group', path: 'components/radio-group' },
      { label: 'Search Input', path: 'components/search-input' },
      { label: 'Segmented Control', path: 'components/segmented-control' },
      { label: 'Select', path: 'components/select' },
      { label: 'Switch', path: 'components/switch' },
      { label: 'Textarea', path: 'components/textarea' },
      { type: 'divider', label: 'Structure' },
      { label: 'Accordion', path: 'components/accordion' },
      { label: 'Breadcrumb', path: 'components/breadcrumb' },
      { label: 'Card', path: 'components/card' },
      { label: 'Page Header', path: 'components/page-header' },
      { label: 'Pagination', path: 'components/pagination' },
      { label: 'Scroll Area', path: 'components/scroll-area' },
      { label: 'Tabs', path: 'components/tabs' },
      { type: 'divider', label: 'Overlays' },
      { label: 'Dialog', path: 'components/dialog' },
      { label: 'OTP Dialog', path: 'ggx-components/otp-dialog' },
      { label: 'Popover', path: 'components/popover' },
      { type: 'divider', label: 'Data' },
      { label: 'Table', path: 'components/table' },
      { type: 'divider', label: 'GGX Components' },
      { label: 'Access Denied', path: 'ggx-components/access-denied' },
      { label: 'Address Display Card', path: 'ggx-components/address-display-card' },
      { label: 'Checkout Delivery Options', path: 'ggx-components/checkout-delivery-options' },
      { label: 'Delivery Status Badge', path: 'ggx-components/delivery-status-badge' },
      { label: 'Empty State', path: 'ggx-components/empty-state' },
      { label: 'Enablement Gate', path: 'ggx-components/enablement-gate' },
      { label: 'Filter Bar', path: 'ggx-components/filter-bar' },
      { label: 'Location Cascade', path: 'ggx-components/location-cascade' },
      { label: 'Module Card', path: 'ggx-components/module-card' },
      { label: 'Stat Card', path: 'ggx-components/stat-card' },
    ],
  },
  {
    label: 'Patterns',
    items: [
      { label: 'Overview', path: 'patterns/overview' },
      { label: 'Booking flows', path: 'patterns/booking-flows' },
      { label: 'Bulk upload', path: 'patterns/bulk-upload' },
      { label: 'Payment options', path: 'patterns/payment-options' },
      { label: 'Transactions & tracking', path: 'patterns/transactions-tracking' },
      { label: 'Forms & validation', path: 'patterns/forms-validation' },
      { label: 'Empty, loading & error', path: 'patterns/empty-loading-error' },
    ],
  },
  {
    label: 'Resources',
    items: [
      { label: 'Overview', path: 'resources/overview' },
      { label: 'Traceability', path: 'resources/traceability' },
      { label: 'Changelog', path: 'resources/changelog' },
      { label: 'Contributing', path: 'resources/contributing' },
      { label: 'Documentation standards', path: 'resources/documentation-standards' },
    ],
  },
];

// Flat ordered list of all navigable pages (for Prev/Next footer navigation).
export const DS_FLAT_PAGES: DSNavItem[] = DS_NAV_GROUPS.flatMap((g) =>
  g.items.filter((e): e is DSNavItem => e.type !== 'divider'),
);

export function navItemHref(path: string): string {
  return path === '' ? '/design-system' : `/design-system/${path}`;
}
