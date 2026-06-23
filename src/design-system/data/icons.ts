/**
 * Icon reference for the GoGo Xpress Design System sample.
 *
 * Two sources, both already in the project:
 *  - Line icons from `@tabler/icons-react` (the app's icon set).
 *  - Custom illustrated/3D-style PNG assets under `src/assets/basic/`.
 *
 * Nothing is moved or duplicated — assets are imported from their existing
 * location so the bundler resolves the same files the app uses.
 */

import {
  // navigation
  IconLayoutDashboard,
  IconPackage,
  IconUpload,
  IconChartBar,
  IconFileText,
  IconBuildingStore,
  IconSettings,
  IconBell,
  // booking
  IconTruck,
  IconMapPin,
  IconCalendarEvent,
  IconBox,
  IconClipboardList,
  // transactions
  IconReceipt,
  IconReceiptRefund,
  IconArrowsLeftRight,
  IconReceipt2,
  // payment
  IconCash,
  IconWallet,
  IconCreditCard,
  IconBuildingBank,
  // status
  IconCircleCheck,
  IconTruckDelivery,
  IconClock,
  IconAlertTriangle,
  IconCircleX,
  type IconProps,
} from '@tabler/icons-react';
import type { ComponentType } from 'react';

// Existing custom/illustrated assets (Basic surfaces). Imported, not copied.
import iconStandard from '../../assets/basic/icon-standard.png';
import iconSdd from '../../assets/basic/icon-sdd.png';
import iconBulk from '../../assets/basic/icon-bulk.png';
import iconStorefront from '../../assets/basic/icon-storefront.png';
import iconShopify from '../../assets/basic/icon-shopify.png';
import iconAnalytics from '../../assets/basic/icon-analytics.png';
import iconRewards from '../../assets/basic/icon-rewards.png';
import iconReferrals from '../../assets/basic/icon-referrals.png';

export interface LineIconEntry {
  icon: ComponentType<IconProps>;
  name: string;
  usage: string;
}

export interface LineIconCategory {
  id: string;
  title: string;
  /** Import reference shown in docs. */
  importFrom: string;
  icons: LineIconEntry[];
}

export const ICON_CATEGORIES: LineIconCategory[] = [
  {
    id: 'navigation',
    title: 'Navigation',
    importFrom: "@tabler/icons-react",
    icons: [
      { icon: IconLayoutDashboard, name: 'IconLayoutDashboard', usage: 'Dashboard / home nav.' },
      { icon: IconPackage, name: 'IconPackage', usage: 'Transactions / shipments nav.' },
      { icon: IconUpload, name: 'IconUpload', usage: 'Bulk Upload nav.' },
      { icon: IconChartBar, name: 'IconChartBar', usage: 'Analytics nav.' },
      { icon: IconFileText, name: 'IconFileText', usage: 'Reports nav.' },
      { icon: IconBuildingStore, name: 'IconBuildingStore', usage: 'Storefront / commerce nav.' },
      { icon: IconSettings, name: 'IconSettings', usage: 'Settings nav.' },
      { icon: IconBell, name: 'IconBell', usage: 'Notifications.' },
    ],
  },
  {
    id: 'booking',
    title: 'Booking',
    importFrom: "@tabler/icons-react",
    icons: [
      { icon: IconTruck, name: 'IconTruck', usage: 'Delivery service / shipping.' },
      { icon: IconMapPin, name: 'IconMapPin', usage: 'Sender / recipient address.' },
      { icon: IconCalendarEvent, name: 'IconCalendarEvent', usage: 'Pickup schedule.' },
      { icon: IconBox, name: 'IconBox', usage: 'Parcel / item details.' },
      { icon: IconClipboardList, name: 'IconClipboardList', usage: 'Booking review / batch list.' },
    ],
  },
  {
    id: 'transactions',
    title: 'Transactions',
    importFrom: "@tabler/icons-react",
    icons: [
      { icon: IconReceipt, name: 'IconReceipt', usage: 'Transaction record.' },
      { icon: IconReceiptRefund, name: 'IconReceiptRefund', usage: 'Claims / refunds.' },
      { icon: IconArrowsLeftRight, name: 'IconArrowsLeftRight', usage: 'Account switch / transfers.' },
      { icon: IconReceipt2, name: 'IconReceipt2', usage: 'Billing / invoice.' },
    ],
  },
  {
    id: 'payment',
    title: 'Payment',
    importFrom: "@tabler/icons-react",
    icons: [
      { icon: IconCash, name: 'IconCash', usage: 'Cash / COD.' },
      { icon: IconWallet, name: 'IconWallet', usage: 'E-wallets, earnings.' },
      { icon: IconCreditCard, name: 'IconCreditCard', usage: 'Card payment.' },
      { icon: IconBuildingBank, name: 'IconBuildingBank', usage: 'Online banking.' },
    ],
  },
  {
    id: 'status',
    title: 'Status',
    importFrom: "@tabler/icons-react",
    icons: [
      { icon: IconClock, name: 'IconClock', usage: 'Awaiting / pending.' },
      { icon: IconAlertTriangle, name: 'IconAlertTriangle', usage: 'Needs review / warning.' },
      { icon: IconTruckDelivery, name: 'IconTruckDelivery', usage: 'In transit.' },
      { icon: IconCircleCheck, name: 'IconCircleCheck', usage: 'Delivered / success.' },
      { icon: IconCircleX, name: 'IconCircleX', usage: 'Cancelled / failed.' },
    ],
  },
];

export interface AssetEntry {
  src: string;
  name: string;
  category: string;
  usage: string;
}

/** Illustrated/3D-style Basic UI assets, reused from `src/assets/basic/`. */
export const CUSTOM_ASSETS: AssetEntry[] = [
  { src: iconStandard, name: 'icon-standard.png', category: 'Booking', usage: 'Standard Delivery service tile.' },
  { src: iconSdd, name: 'icon-sdd.png', category: 'Booking', usage: 'Same-Day Delivery service tile.' },
  { src: iconBulk, name: 'icon-bulk.png', category: 'Booking', usage: 'Bulk Upload service tile.' },
  { src: iconStorefront, name: 'icon-storefront.png', category: 'Commerce', usage: 'Storefront / Sell Online.' },
  { src: iconShopify, name: 'icon-shopify.png', category: 'Commerce', usage: 'Shopify integration.' },
  { src: iconAnalytics, name: 'icon-analytics.png', category: 'Analytics', usage: 'Analytics entry point.' },
  { src: iconRewards, name: 'icon-rewards.png', category: 'Rewards', usage: 'Rewards / vouchers.' },
  { src: iconReferrals, name: 'icon-referrals.png', category: 'Rewards', usage: 'Referrals.' },
];

export const ASSET_IMPORT_HINT = "import iconStandard from 'src/assets/basic/icon-standard.png';";
