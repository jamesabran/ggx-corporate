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
