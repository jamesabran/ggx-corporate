export interface DSNavItem {
  label: string;
  path: string;
}

export interface DSNavGroup {
  label: string;
  items: DSNavItem[];
}

export const DS_NAV_GROUPS: DSNavGroup[] = [
  {
    label: 'Foundations',
    items: [
      { label: 'Colors', path: 'foundations/colors' },
      { label: 'Spacing & Layout', path: 'foundations/spacing' },
      { label: 'Typography', path: 'foundations/typography' },
    ],
  },
  {
    label: 'Components',
    items: [
      { label: 'Accordion', path: 'components/accordion' },
      { label: 'Alert', path: 'components/alert' },
      { label: 'Avatar', path: 'components/avatar' },
      { label: 'Badge', path: 'components/badge' },
      { label: 'Breadcrumb', path: 'components/breadcrumb' },
      { label: 'Button', path: 'components/button' },
      { label: 'Calendar', path: 'components/calendar' },
      { label: 'Card', path: 'components/card' },
      { label: 'Checkbox', path: 'components/checkbox' },
      { label: 'Combobox', path: 'components/combobox' },
      { label: 'Dialog', path: 'components/dialog' },
      { label: 'Field', path: 'components/field' },
      { label: 'Icon Container', path: 'components/icon-container' },
      { label: 'Input', path: 'components/input' },
      { label: 'Page Header', path: 'components/page-header' },
      { label: 'Pagination', path: 'components/pagination' },
      { label: 'Popover', path: 'components/popover' },
      { label: 'Progress', path: 'components/progress' },
      { label: 'Radio Group', path: 'components/radio-group' },
      { label: 'Scroll Area', path: 'components/scroll-area' },
      { label: 'Search Input', path: 'components/search-input' },
      { label: 'Segmented Control', path: 'components/segmented-control' },
      { label: 'Select', path: 'components/select' },
      { label: 'Separator', path: 'components/separator' },
      { label: 'Switch', path: 'components/switch' },
      { label: 'Table', path: 'components/table' },
      { label: 'Tabs', path: 'components/tabs' },
      { label: 'Textarea', path: 'components/textarea' },
      { label: 'Tooltip', path: 'components/tooltip' },
    ],
  },
  {
    label: 'GGX Components',
    items: [
      { label: 'Address Display Card', path: 'ggx-components/address-display-card' },
      { label: 'Delivery Status Badge', path: 'ggx-components/delivery-status-badge' },
      { label: 'Module Card', path: 'ggx-components/module-card' },
      { label: 'OTP Dialog', path: 'ggx-components/otp-dialog' },
      { label: 'Payment Options', path: 'ggx-components/payment-options' },
      { label: 'Stat Card', path: 'ggx-components/stat-card' },
    ],
  },
  {
    label: 'GGX Patterns & Templates',
    items: [
      { label: 'Checkout Delivery Options', path: 'patterns/checkout-delivery-options' },
    ],
  },
  {
    label: 'Icons',
    items: [
      { label: 'Icons', path: 'icons' },
    ],
  },
];
