/**
 * Cross-reference registry tying each documented component to the three sources
 * of truth: the GGX-SHADCN Figma file, the production code, and live app usage.
 *
 * Figma component keys were verified against the live GGX-SHADCN library
 * (file 9zwtAL4RU3Y8WVRJAsSulX) via the Figma MCP `search_design_system`, and
 * cross-checked with the DS inventory. Keys marked `needsVerification` could not
 * be confidently matched and should be confirmed in Figma before relying on them.
 */

export const GGX_SHADCN_FILE_KEY = '9zwtAL4RU3Y8WVRJAsSulX';
export const GGX_SHADCN_URL = 'https://www.figma.com/design/9zwtAL4RU3Y8WVRJAsSulX/GGX-SHADCN';
export const GGX_REPO_URL = 'https://github.com/jabranux/ggx-corporate';

export type LifecycleStatus = 'in-use' | 'in-progress' | 'deprecated';

export interface FigmaRef {
  /** Component / component-set name in GGX-SHADCN. */
  name: string;
  /** Published component key (from search_design_system). */
  key?: string;
  /** True when no confident Figma match exists yet. */
  needsVerification?: boolean;
}

export interface UsedInRef {
  label: string;
  where: string;
}

export interface ComponentMeta {
  id: string;
  /** Sidebar / index label. */
  title: string;
  status: LifecycleStatus;
  source: string;
  figma: FigmaRef;
  usedIn?: UsedInRef[];
  /** One-line description for the searchable index. */
  blurb: string;
}

export const COMPONENT_META: Record<string, ComponentMeta> = {
  button: {
    id: 'button',
    title: 'Button',
    status: 'in-use',
    source: 'src/app/components/ui/Button.tsx',
    figma: { name: 'Button', key: 'b1a89b48b296e05273d73881b300b9defc890295' },
    usedIn: [
      { label: 'Across the dashboard', where: '/dashboard/*' },
      { label: 'RootLayout (logout, nav)', where: 'layouts/RootLayout.tsx' },
    ],
    blurb: 'Primary call-to-action with the GGX CTA hierarchy.',
  },
  badge: {
    id: 'badge',
    title: 'Badge',
    status: 'in-use',
    source: 'src/app/components/ui/Badge.tsx',
    figma: { name: 'Badge / Tag', key: 'a09ae1f46ae283be55ad8fff2897c7cd753be5aa' },
    usedIn: [
      { label: 'Transactions, statuses, labels', where: '/dashboard/transactions' },
      { label: 'Address Display Card', where: 'components/AddressDisplayCard.tsx' },
    ],
    blurb: 'Small semantic label/tag with status variants.',
  },
  'delivery-status-badge': {
    id: 'delivery-status-badge',
    title: 'Delivery Status Badge',
    status: 'in-progress',
    source: 'src/design-system/components/DeliveryStatusBadge.tsx',
    figma: { name: 'Badge / Tag (variant mapping)', key: 'a09ae1f46ae283be55ad8fff2897c7cd753be5aa' },
    usedIn: [{ label: 'Transactions list & detail (via Badge)', where: '/dashboard/transactions' }],
    blurb: 'Delivery-status mapping rendered through the production Badge.',
  },
  card: {
    id: 'card',
    title: 'Card',
    status: 'in-use',
    source: 'src/app/components/ui/Card.tsx',
    figma: { name: 'Card', key: '6347818830ba3d94cfbb27408bcea410c51e9fa9' },
    usedIn: [
      { label: 'Dashboard, Settings, most pages', where: '/dashboard/*' },
      { label: 'Stat Card', where: 'components/StatCard.tsx' },
    ],
    blurb: 'Surface container with header / content / footer parts.',
  },
  'stat-card': {
    id: 'stat-card',
    title: 'Stat Card',
    status: 'in-use',
    source: 'src/app/components/StatCard.tsx',
    figma: { name: 'Stat Card', key: 'ce4fd0e4d11f3c37c4d3d689dd58b3644c626117' },
    usedIn: [
      { label: 'SLA Alerts, Support Tickets, Reports', where: '/dashboard/sla-alerts' },
      { label: 'Billing Statement', where: '/dashboard/billing' },
    ],
    blurb: 'KPI card: label, value, optional sub, tinted icon.',
  },
  'icon-container': {
    id: 'icon-container',
    title: 'Icon Container',
    status: 'in-use',
    source: 'src/app/components/IconContainer.tsx',
    figma: { name: 'Icon Container', key: '2cbd3a824a0aea24af70b25cc74ed23d3abd651f' },
    usedIn: [
      { label: 'Stat Card', where: 'components/StatCard.tsx' },
      { label: 'List rows, empty states', where: '/dashboard/*' },
    ],
    blurb: 'Soft-tinted square that frames an icon at set sizes.',
  },
  'input-field': {
    id: 'input-field',
    title: 'Input / Form Field',
    status: 'in-use',
    source: 'src/app/components/ui/Input.tsx',
    figma: { name: 'Input', key: '03367deef9fc99ca2dbfbd1f1ba82e195d249896' },
    usedIn: [
      { label: 'Login', where: '/' },
      { label: 'Buyer & cart checkout', where: '/buy/:productId, /checkout' },
    ],
    blurb: 'Text input with label/helper/error field layout.',
  },
  select: {
    id: 'select',
    title: 'Select',
    status: 'in-use',
    source: 'src/app/components/ui/Select.tsx',
    figma: { name: 'Select', key: 'dc8a2f4d37f2369dac3d70fc6e54bfa46ba9fce9' },
    usedIn: [
      { label: 'Payment Method Tabs (bank)', where: 'components/PaymentMethodTabs.tsx' },
      { label: 'Filters across pages', where: '/dashboard/transactions' },
    ],
    blurb: 'Native select styled with a chevron affordance.',
  },
  'search-input': {
    id: 'search-input',
    title: 'Search Input',
    status: 'in-use',
    source: 'src/app/components/SearchInput.tsx',
    figma: { name: 'Search Input', key: 'bb6d8f2e53e592ebc36d9103e997ff9ef03a7d7a' },
    usedIn: [
      { label: 'Topbar global search', where: 'layouts/RootLayout.tsx' },
      { label: 'List filters', where: '/dashboard/transactions' },
    ],
    blurb: 'Text search with leading icon and inline clear.',
  },
  'segmented-control': {
    id: 'segmented-control',
    title: 'Segmented Control',
    status: 'in-use',
    source: 'src/app/components/SegmentedControl.tsx',
    figma: { name: 'Segmented Control', key: '90ace27b9cd323d43901b6c380aa222dd4ccf259' },
    usedIn: [{ label: 'View toggles', where: '/dashboard/*' }],
    blurb: 'Toggle between mutually exclusive views.',
  },
  tabs: {
    id: 'tabs',
    title: 'Tabs',
    status: 'in-use',
    source: 'src/app/components/ui/Tabs.tsx',
    figma: { name: 'Tabs', key: '7e97340e8b0b608a0dd571ba7dbd5010a2f61cd1' },
    usedIn: [{ label: 'Transactions (Deliveries / Store Orders)', where: '/dashboard/transactions' }],
    blurb: 'Radix-based tabs for in-page section switching.',
  },
  table: {
    id: 'table',
    title: 'Table',
    status: 'in-use',
    source: 'src/app/components/ui/Table.tsx',
    figma: { name: 'Table', key: '45b953618eb2742e3c0b9ce436bbb97be767a490' },
    usedIn: [
      { label: 'Transactions list', where: '/dashboard/transactions' },
      { label: 'Reports, Earnings', where: '/dashboard/reports' },
    ],
    blurb: 'Composable data table parts (header/row/cell).',
  },
  dialog: {
    id: 'dialog',
    title: 'Dialog',
    status: 'in-use',
    source: 'src/app/components/ui/Dialog.tsx',
    figma: { name: 'Dialog', key: '7006c465aecb4107f5445718e8e2806eb6c96af5' },
    usedIn: [
      { label: 'Logout confirm (RootLayout)', where: 'layouts/RootLayout.tsx' },
      { label: 'Confirmations across pages', where: '/dashboard/*' },
    ],
    blurb: 'Base modal + confirmation wrapper over a scrim.',
  },
  'payment-option-card': {
    id: 'payment-option-card',
    title: 'Payment Options',
    status: 'in-use',
    source: 'src/app/components/PaymentMethodTabs.tsx',
    figma: { name: 'Payment Method Tabs', needsVerification: true },
    usedIn: [
      { label: 'Bulk Upload review (sender)', where: '/dashboard/bulk-uploader/summary/:id' },
      { label: 'Buyer & cart checkout', where: '/buy/:productId, /checkout' },
    ],
    blurb: 'Sender booking + buyer checkout payment surfaces.',
  },
  // ── Second wave: form primitives + existing compositions ──────────────────
  switch: {
    id: 'switch',
    title: 'Switch',
    status: 'in-use',
    source: 'src/app/components/ui/Switch.tsx',
    figma: { name: 'Switch', key: '1fe458cfbd126854796d3f58cece7f84e4e28bb6' },
    usedIn: [{ label: 'Settings — notification preferences', where: '/dashboard/settings' }],
    blurb: 'Binary on/off toggle.',
  },
  checkbox: {
    id: 'checkbox',
    title: 'Checkbox',
    status: 'in-use',
    source: 'src/app/components/ui/Checkbox.tsx',
    figma: { name: 'Checkbox', key: '5dca035161428ea27f1e2b57e7e6e8dea3ef2188' },
    usedIn: [{ label: 'Login — remember me', where: '/' }],
    blurb: 'Native checkbox for boolean / multi-select.',
  },
  textarea: {
    id: 'textarea',
    title: 'Textarea',
    status: 'in-use',
    source: 'src/app/components/ui/Textarea.tsx',
    figma: { name: 'Textarea', key: 'f3ae25cac452a64163c997c568bfb8aec9adca70' },
    usedIn: [{ label: 'Product form — description', where: 'components/ProductFormDialog.tsx' }],
    blurb: 'Multi-line text input matching Input styling.',
  },
  separator: {
    id: 'separator',
    title: 'Separator',
    status: 'in-use',
    source: 'src/app/components/ui/Separator.tsx',
    figma: { name: 'Separator', key: 'd8f3f3895520522d9574eb1f27a15db5218c3f69' },
    usedIn: [{ label: 'Payment Preference Card divider', where: 'components/PaymentPreferenceCard.tsx' }],
    blurb: 'Thin horizontal / vertical divider line.',
  },
  avatar: {
    id: 'avatar',
    title: 'Avatar',
    status: 'in-use',
    source: 'src/app/components/ui/Avatar.tsx',
    figma: { name: 'Avatar', key: 'ca8b203db073222624bbc39439fb6e014f1a2e0d' },
    usedIn: [{ label: 'RootLayout — account switcher', where: 'layouts/RootLayout.tsx' }],
    blurb: 'Gradient-initials avatar, circle / square.',
  },
  alert: {
    id: 'alert',
    title: 'Alert',
    status: 'in-use',
    source: 'src/app/components/ui/Alert.tsx',
    figma: { name: 'Alert', key: '1db2f55e5332984ac3bfff10043ac1d9fca260f1' },
    usedIn: [{ label: 'Login — forgot-password notice', where: '/' }],
    blurb: 'Inline banner: info / success / warning / destructive.',
  },
  'address-display-card': {
    id: 'address-display-card',
    title: 'Address Display Card',
    status: 'in-use',
    source: 'src/app/components/AddressDisplayCard.tsx',
    figma: { name: 'Address Display Card', key: '92aa7fb877b76abe9796f25cc1256dcb0591a1a4' },
    usedIn: [
      { label: 'Address Book + Settings', where: '/dashboard/address-book' },
      { label: 'Compact variant (Ops Requests)', where: 'components/CompactAddressCard.tsx' },
    ],
    blurb: 'Display-only address block (full + compact).',
  },
  'otp-dialog': {
    id: 'otp-dialog',
    title: 'OTP Dialog',
    status: 'in-use',
    source: 'src/app/components/ui/OtpDialog.tsx',
    figma: { name: 'OTP / verification dialog', needsVerification: true },
    usedIn: [{ label: 'Sensitive financial actions', where: '/dashboard/payment-settings' }],
    blurb: 'OTP verification gate for sensitive actions.',
  },
  'checkout-delivery-options': {
    id: 'checkout-delivery-options',
    title: 'Checkout Delivery Options',
    status: 'in-use',
    source: 'src/app/components/CheckoutDeliveryOptions.tsx',
    figma: { name: 'Checkout delivery (composition)', needsVerification: true },
    usedIn: [
      { label: 'Buyer checkout', where: '/buy/:productId' },
      { label: 'Cart checkout', where: '/checkout' },
    ],
    blurb: 'Buyer delivery-option picker (Std / Same-day / On-demand).',
  },
  'module-card': {
    id: 'module-card',
    title: 'Module Card',
    status: 'in-use',
    source: 'src/app/components/ModuleCard.tsx',
    figma: { name: 'Add-on / Module card', needsVerification: true },
    usedIn: [{ label: 'Account Add-ons', where: '/dashboard/account-add-ons' }],
    blurb: 'Status-aware Account Add-on card with CTA.',
  },
  // ── Third wave: layout/nav primitives ─────────────────────────────────────
  'page-header': {
    id: 'page-header',
    title: 'Page Header',
    status: 'in-use',
    source: 'src/app/components/ui/PageHeader.tsx',
    figma: { name: 'Page Header', key: '46ddf51e7b28e6233acfb885f68c5722032f1e65' },
    usedIn: [{ label: 'Transactions (and content pages)', where: '/dashboard/transactions' }],
    blurb: 'Page title + subtitle + optional actions.',
  },
  pagination: {
    id: 'pagination',
    title: 'Pagination',
    status: 'in-use',
    source: 'src/app/components/ui/Pagination.tsx',
    figma: { name: 'Pagination', key: '466e25f3a2505d7308ec2848180945766f467971' },
    usedIn: [{ label: 'Transactions list footer', where: '/dashboard/transactions' }],
    blurb: 'List summary + Previous / Next controls.',
  },
  progress: {
    id: 'progress',
    title: 'Progress',
    status: 'in-use',
    source: 'src/app/components/ui/Progress.tsx',
    figma: { name: 'Progress', key: 'b0aa464a8aa38455fbda3e2eb343ca1c537e3949' },
    usedIn: [{ label: 'Dashboard performance bars', where: '/dashboard' }],
    blurb: 'Horizontal proportion / progress bar.',
  },
  field: {
    id: 'field',
    title: 'Field',
    status: 'in-progress',
    source: 'src/app/components/ui/Field.tsx',
    figma: { name: 'Field', key: '410fcb27554b57a6fefb9e61876b617a4475c08b' },
    blurb: 'Read-only label / value pair for detail panels.',
  },
  tooltip: {
    id: 'tooltip',
    title: 'Tooltip',
    status: 'in-progress',
    source: 'src/app/components/ui/Tooltip.tsx',
    figma: { name: 'Tooltip', key: '0dbf6727059daaab15d04c6af234a9540987666f' },
    blurb: 'Hover/focus label for a trigger element.',
  },
  'radio-group': {
    id: 'radio-group',
    title: 'Radio Group',
    status: 'in-progress',
    source: 'src/app/components/ui/RadioGroup.tsx',
    figma: { name: 'Radio Group', key: '869b6ef6b031c154f51b590fb4c147ea12c15a71' },
    blurb: 'Single-select group of native radios.',
  },
  accordion: {
    id: 'accordion',
    title: 'Accordion',
    status: 'in-progress',
    source: 'src/app/components/ui/Accordion.tsx',
    figma: { name: 'Accordion', key: '61556acb5f229c14a43b0a3fe1c2e8ab20acb972' },
    blurb: 'Collapsible section (compose into an accordion).',
  },
  breadcrumb: {
    id: 'breadcrumb',
    title: 'Breadcrumb',
    status: 'in-progress',
    source: 'src/app/components/ui/Breadcrumb.tsx',
    figma: { name: 'Breadcrumb', key: '285aa5c49785f3d51af9abfc5890a573d5020e87' },
    blurb: 'Navigation trail to the current page.',
  },
  // ── Fourth wave: overlays + advanced inputs ───────────────────────────────
  popover: {
    id: 'popover',
    title: 'Popover',
    status: 'in-progress',
    source: 'src/app/components/ui/Popover.tsx',
    figma: { name: 'Popover', key: '0ee5ecd12eeac0e458e131ff176bf88ef68ec922' },
    blurb: 'Click-to-open floating panel anchored to a trigger.',
  },
  combobox: {
    id: 'combobox',
    title: 'Combobox',
    status: 'in-progress',
    source: 'src/app/components/ui/Combobox.tsx',
    figma: { name: 'Combobox', key: 'c68c579d7dd454e65a4a57282236ea2f0b6c3dc3' },
    blurb: 'Searchable single-select with a filter field.',
  },
  calendar: {
    id: 'calendar',
    title: 'Calendar',
    status: 'in-progress',
    source: 'src/app/components/ui/Calendar.tsx',
    figma: { name: 'Calendar', key: 'f6aba76c62200bee37be0958b5390ddd78e1e492' },
    blurb: 'Single-date month picker (no date library).',
  },
  'scroll-area': {
    id: 'scroll-area',
    title: 'Scroll Area',
    status: 'in-progress',
    source: 'src/app/components/ui/ScrollArea.tsx',
    figma: { name: 'Scroll-area', key: 'b44b4d28f9ab653668d30816a8e6d3997e2350ad' },
    blurb: 'Scrollable region with a slim, subtle scrollbar.',
  },
  // Per-variant meta for the two real payment components (not separate index entries).
  'payment-sender': {
    id: 'payment-sender',
    title: 'Payment Method Tabs (sender)',
    status: 'in-use',
    source: 'src/app/components/PaymentMethodTabs.tsx',
    figma: { name: 'Payment Method Tabs', needsVerification: true },
    usedIn: [
      { label: 'Bulk Upload review', where: '/dashboard/bulk-uploader/summary/:id' },
      { label: 'In-app spreadsheet booking', where: '/dashboard/bulk-uploader/spreadsheet' },
    ],
    blurb: 'Sender booking payment with billing eligibility.',
  },
  'payment-buyer': {
    id: 'payment-buyer',
    title: 'Checkout Payment Options (buyer)',
    status: 'in-use',
    source: 'src/app/components/CheckoutPaymentOptions.tsx',
    figma: { name: 'Checkout payment (composition)', needsVerification: true },
    usedIn: [
      { label: 'Single-product checkout', where: '/buy/:productId' },
      { label: 'Cart checkout', where: '/checkout' },
    ],
    blurb: 'Buyer checkout payment — COD live, no fee-payer control.',
  },
};
