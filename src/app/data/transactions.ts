// Single source of truth for transaction mock data.
//
// Both the Transactions list and the Transaction Details page read from here so
// that clicking a row resolves to the matching record (looked up by tracking
// number via the `:id` route param).

import { getServiceTypeLabel, type ServiceTypeKey } from './serviceTypes';

export type TransactionStatus =
  | 'delivered'
  | 'in-transit'
  | 'picked-up'
  | 'pending'
  | 'failed'
  | 'returned';

/** Where a transaction originated. Drives the Shopify "- Shopify" tag. */
export type TransactionSource = 'manual' | 'bulk_upload' | 'api' | 'shopify';

/**
 * Delivery service type for a transaction. A subset of the Business+ service
 * types (the bookable delivery tiers) — fulfillment-only types are excluded.
 * On-Demand is a DISTINCT type (never merged with Same-Day). See
 * docs/service_type_rules.md.
 */
export type DeliveryServiceType = Extract<ServiceTypeKey, 'standard' | 'same_day' | 'on_demand'>;

/** Short labels for the Type column badge + Service Type filter options. */
export const SERVICE_TYPE_SHORT_LABEL: Record<DeliveryServiceType, string> = {
  standard: 'Standard',
  same_day: 'Same-Day',
  on_demand: 'On-Demand',
};

/** Full service-type label (re-exported via serviceTypes) for detail views. */
export function serviceTypeLabel(key: DeliveryServiceType): string {
  return getServiceTypeLabel(key);
}

export const statusConfig: Record<TransactionStatus, { variant: 'success' | 'info' | 'warning' | 'danger' | 'pending' | 'default'; label: string }> = {
  delivered: { variant: 'success', label: 'Delivered' },
  'in-transit': { variant: 'info', label: 'In Transit' },
  'picked-up': { variant: 'warning', label: 'Picked Up' },
  failed: { variant: 'danger', label: 'Failed' },
  pending: { variant: 'pending', label: 'Pending' },
  returned: { variant: 'default', label: 'Returned' },
};

export interface TransactionItem {
  name: string;
  quantity: number;
  description: string;
  attributes?: Record<string, string>;
  price: number;
}

export interface TimelineEvent {
  status: string;
  date: string;
  note?: string;
  hasProof?: boolean;
}

export interface Party {
  name: string;
  contactNumber: string;
  address: string;
}

/** Bulk Upload origin for transactions created from a batch. */
export interface TransactionBatch {
  batchId: string;
  fileName: string;
  uploadedVia: 'bulk_upload';
  accountId?: string;
  accountName?: string;
  /** Reported counts from the upload source (backend-provided; overrides derived counts). */
  reportedCounts?: {
    total: number;
    delivered: number;
    inProgress: number;
    failed: number;
  };
}

export interface Transaction {
  // List + summary fields
  trackingNumber: string;
  destination: string;
  type: 'Express' | 'Standard';
  /** Bookable delivery service type (Standard / Same-Day / On-Demand). */
  serviceType: DeliveryServiceType;
  status: TransactionStatus;
  date: string;
  subaccount: string;
  /** Origin channel of the transaction. Defaults to 'manual' / 'bulk_upload'. */
  source: TransactionSource;
  /** Shopify store display name when source === 'shopify'. */
  shopifyStoreName?: string;
  // Detail fields
  createdAt: string;
  pickupDate: string;
  deliveryDate: string;
  sender: Party;
  recipient: Party;
  items: TransactionItem[];
  packaging: { size: string; dimensions: string; weight: string };
  store: { name: string; url: string };
  fees: { serviceFee: number; shippingFee: number; protectionFee: number; discount: number; processingFee: number };
  payment: { method: string; paidBy: string; codAmount: number };
  timeline: TimelineEvent[];
  /** Present only when this transaction was created from a Bulk Upload batch. */
  batch?: TransactionBatch;
}

const sender: Party = {
  name: 'Acme Corporation',
  contactNumber: '+63 917 123 4567',
  address: '5th Floor, ABC Building, Ayala Avenue, Poblacion, Makati City, Metro Manila',
};

const defaultItems: TransactionItem[] = [
  { name: 'Wireless Mouse', quantity: 2, description: 'Logitech MX Master 3', attributes: { color: 'Black' }, price: 4500 },
  { name: 'Mechanical Keyboard', quantity: 1, description: 'Keychron K2', attributes: { color: 'White', variant: 'RGB' }, price: 5500 },
];

const defaultFees = { serviceFee: 50, shippingFee: 120, protectionFee: 145, discount: -20, processingFee: 30 };

// Canonical delivery stages, oldest → newest.
const STAGES: { status: string; note?: string; hasProof?: boolean }[] = [
  { status: 'Order Created', note: 'Order placed and awaiting confirmation' },
  { status: 'Booking Confirmed', note: 'Booking confirmed and processing' },
  { status: 'Pick-up Rider Found', note: 'Rider assigned for pickup' },
  { status: 'Picked Up', note: 'Package picked up from sender', hasProof: true },
  { status: 'In Transit', note: 'Package in transit to destination hub' },
  { status: 'Out for Delivery', note: 'Delivery rider on the way' },
  { status: 'Delivered', note: 'Package delivered successfully', hasProof: true },
];

// How far through STAGES each status has progressed (inclusive index).
const reachedStage: Record<TransactionStatus, number> = {
  pending: 1,
  'picked-up': 3,
  'in-transit': 4,
  delivered: 6,
  failed: 4,
  returned: 6,
};

function buildTimeline(status: TransactionStatus, date: string): TimelineEvent[] {
  const reached = reachedStage[status];
  const events: TimelineEvent[] = STAGES.slice(0, reached + 1).map((stage, i) => ({
    status: stage.status,
    date: `${date} ${String(8 + i).padStart(2, '0')}:00 AM`,
    note: stage.note,
    hasProof: stage.hasProof,
  }));

  if (status === 'failed') {
    events.push({ status: 'Delivery Failed', date: `${date} 04:30 PM`, note: 'Recipient unavailable at the time of delivery' });
  }
  if (status === 'returned') {
    events.push({ status: 'Returned to Sender', date: `${date} 05:15 PM`, note: 'Package returned after failed delivery attempts' });
  }

  // UI renders newest first (index 0 = latest, green dot).
  return events.reverse();
}

interface RowSeed {
  tracking: string;
  recipient: string;
  destination: string;
  contactNumber: string;
  recipientAddress: string;
  status: TransactionStatus;
  type: 'Express' | 'Standard';
  date: string;
  subaccount: string;
  codAmount: number;
  /** Bookable delivery service type. Omit to default to 'standard'. */
  serviceType?: DeliveryServiceType;
  /** Origin channel. Omit to derive: 'bulk_upload' when a batch is present, else 'manual'. */
  source?: TransactionSource;
  /** Shopify store display name (source === 'shopify' rows). */
  shopifyStoreName?: string;
  /** Set when the transaction originated from a Bulk Upload batch. batchId values
   *  match the seed batches shown in BulkUploader's Recent Uploads. */
  batch?: TransactionBatch;
}

const rows: RowSeed[] = [
  // ── Shopify-sourced orders (booked via the GGX Shopify plugin) ───────────────
  { tracking: 'GGX-2026-90021', recipient: 'Liza Mendoza', destination: 'Quezon City, Metro Manila', contactNumber: '+63 917 220 3344', recipientAddress: 'Blk 7 Lot 12, Visayas Ave, Quezon City, Metro Manila', status: 'in-transit', type: 'Standard', date: '2026-05-31', subaccount: 'Acme Luzon', codAmount: 1850, serviceType: 'on_demand', source: 'shopify', shopifyStoreName: 'Acme Luzon Online' },
  { tracking: 'GGX-2026-90020', recipient: 'Marco Villanueva', destination: 'Makati City, Metro Manila', contactNumber: '+63 918 330 4455', recipientAddress: 'Unit 802, Salcedo Park Twr, Makati City, Metro Manila', status: 'delivered', type: 'Express', date: '2026-05-31', subaccount: 'Acme Corporation', codAmount: 3200, source: 'shopify', shopifyStoreName: 'Acme Corporation Store' },
  { tracking: 'GGX-2026-90019', recipient: 'Carla Santos', destination: 'Pasig City, Metro Manila', contactNumber: '+63 919 441 5566', recipientAddress: 'The Grove, Capitol Commons, Pasig City, Metro Manila', status: 'pending', type: 'Standard', date: '2026-05-30', subaccount: 'Acme Luzon', codAmount: 990, source: 'shopify', shopifyStoreName: 'Acme Luzon Online' },
  { tracking: 'GGX-2026-90018', recipient: 'Tonette Reyes', destination: 'Taguig City, Metro Manila', contactNumber: '+63 917 552 6677', recipientAddress: 'Two Serendra, BGC, Taguig City, Metro Manila', status: 'delivered', type: 'Express', date: '2026-05-30', subaccount: 'Acme Corporation', codAmount: 2450, source: 'shopify', shopifyStoreName: 'Acme Corporation Store' },
  // ── May 31 (today) ───────────────────────────────────────────────────────────
  { tracking: 'GGX-2026-90010', recipient: 'Nexus Retail Group', destination: 'Makati City, Metro Manila', contactNumber: '+63 917 211 0011', recipientAddress: 'Ayala Mall, Glorietta 5, Makati City, Metro Manila', status: 'pending', type: 'Express', date: '2026-05-31', subaccount: 'Acme Corporation', codAmount: 32000, batch: { batchId: 'UPLOAD-2026-05-31-001', fileName: 'may31_express_orders.xlsx', uploadedVia: 'bulk_upload', accountId: 'acme-corporation', accountName: 'Acme Corporation', reportedCounts: { total: 247, delivered: 5, inProgress: 240, failed: 2 } }},
  { tracking: 'GGX-2026-90009', recipient: 'Meridian Health Corp.', destination: 'Quezon City, Metro Manila', contactNumber: '+63 918 322 0022', recipientAddress: 'Trinoma Mall, North EDSA, Quezon City, Metro Manila', status: 'in-transit', type: 'Express', date: '2026-05-31', subaccount: 'Acme Luzon', codAmount: 18750, batch: { batchId: 'UPLOAD-2026-05-31-002', fileName: 'may31_luzon_am.xlsx', uploadedVia: 'bulk_upload', accountId: 'acme-luzon', accountName: 'Acme Luzon', reportedCounts: { total: 184, delivered: 12, inProgress: 170, failed: 2 } } },
  { tracking: 'GGX-2026-90008', recipient: 'Horizon Publishing Co.', destination: 'Pasig City, Metro Manila', contactNumber: '+63 919 433 0033', recipientAddress: 'Robinsons Galleria, Ortigas, Pasig City, Metro Manila', status: 'failed', type: 'Standard', date: '2026-05-31', subaccount: 'Acme Corporation', codAmount: 9400, serviceType: 'on_demand' },
  // ── May 30 ───────────────────────────────────────────────────────────────────
  { tracking: 'GGX-2026-90007', recipient: 'PeakSoft Technologies', destination: 'Taguig City, Metro Manila', contactNumber: '+63 917 544 0044', recipientAddress: 'One Bonifacio High Street, BGC, Taguig City', status: 'delivered', type: 'Express', date: '2026-05-30', subaccount: 'Acme Corporation', codAmount: 27500, batch: { batchId: 'UPLOAD-2026-05-30-001', fileName: 'may30_corporate.xlsx', uploadedVia: 'bulk_upload', accountId: 'acme-corporation', accountName: 'Acme Corporation', reportedCounts: { total: 312, delivered: 298, inProgress: 11, failed: 3 } } },
  { tracking: 'GGX-2026-90006', recipient: 'Citadel Finance Group', destination: 'Mandaluyong City, Metro Manila', contactNumber: '+63 918 655 0055', recipientAddress: 'Shaw Boulevard, Mandaluyong City, Metro Manila', status: 'failed', type: 'Express', date: '2026-05-30', subaccount: 'Acme Luzon', codAmount: 43200, batch: { batchId: 'UPLOAD-2026-05-30-002', fileName: 'may30_priority.xlsx', uploadedVia: 'bulk_upload', accountId: 'acme-luzon', accountName: 'Acme Luzon', reportedCounts: { total: 67, delivered: 58, inProgress: 3, failed: 6 } } },
  { tracking: 'GGX-2026-90005', recipient: 'Aurora Wellness Studio', destination: 'Paranaque City, Metro Manila', contactNumber: '+63 919 766 0066', recipientAddress: 'SM Seaside, Paranaque City, Metro Manila', status: 'returned', type: 'Standard', date: '2026-05-30', subaccount: 'Acme Corporation', codAmount: 6800, serviceType: 'same_day' },
  { tracking: 'GGX-2026-90004', recipient: 'Vertex Logistics Corp.', destination: 'Iloilo City, Iloilo', contactNumber: '+63 917 877 0077', recipientAddress: 'Megaworld Iloilo Business Park, Mandurriao, Iloilo City', status: 'in-transit', type: 'Standard', date: '2026-05-30', subaccount: 'Acme Corporation', codAmount: 11600, batch: { batchId: 'UPLOAD-2026-05-30-001', fileName: 'may30_corporate.xlsx', uploadedVia: 'bulk_upload', accountId: 'acme-corporation', accountName: 'Acme Corporation' } },
  // ── May 29 ───────────────────────────────────────────────────────────────────
  { tracking: 'GGX-2026-90003', recipient: 'Solano Medical Supply', destination: 'Cebu City, Cebu', contactNumber: '+63 918 988 0088', recipientAddress: 'Ayala Center Cebu, Archbishop Reyes Ave, Cebu City', status: 'failed', type: 'Express', date: '2026-05-29', subaccount: 'Acme Luzon', codAmount: 55000, serviceType: 'on_demand' },
  { tracking: 'GGX-2026-90002', recipient: 'Pinnacle Realty Inc.', destination: 'Cagayan de Oro City, Misamis Oriental', contactNumber: '+63 919 099 0099', recipientAddress: 'Limketkai Mall, Cagayan de Oro City', status: 'in-transit', type: 'Standard', date: '2026-05-29', subaccount: 'Acme Corporation', codAmount: 14200, serviceType: 'same_day' },
  { tracking: 'GGX-2026-90001', recipient: 'Bluewave E-Commerce', destination: 'Davao City, Davao del Sur', contactNumber: '+63 917 110 1100', recipientAddress: 'SM City Davao, JP Laurel Ave, Davao City', status: 'picked-up', type: 'Express', date: '2026-05-29', subaccount: 'Acme Corporation', codAmount: 38900, batch: { batchId: 'UPLOAD-2026-05-29-001', fileName: 'may29_vismin.xlsx', uploadedVia: 'bulk_upload', accountId: 'acme-corporation', accountName: 'Acme Corporation', reportedCounts: { total: 205, delivered: 150, inProgress: 52, failed: 3 } } },
  // ── May 18–15 (existing) ──────────────────────────────────────────────────────
  { tracking: 'GGX-2024-89240', recipient: 'TechStart Solutions', destination: 'Makati City, Metro Manila', contactNumber: '+63 917 987 6543', recipientAddress: 'Unit 1203, Salcedo Tower, Makati City, Metro Manila', status: 'delivered', type: 'Express', date: '2026-05-18', subaccount: 'Acme Corporation', codAmount: 14500, batch: { batchId: 'UPLOAD-2026-05-18-003', fileName: 'daily_orders_batch3.xlsx', uploadedVia: 'bulk_upload', accountId: 'acme-corporation', accountName: 'Acme Corporation', reportedCounts: { total: 198, delivered: 189, inProgress: 5, failed: 4 } } },
  { tracking: 'GGX-2024-89239', recipient: 'Innovation Labs Inc.', destination: 'Cebu City, Cebu', contactNumber: '+63 918 222 1010', recipientAddress: 'IT Park, Lahug, Cebu City, Cebu', status: 'in-transit', type: 'Standard', date: '2026-05-18', subaccount: 'Acme Luzon', codAmount: 8900, serviceType: 'same_day', batch: { batchId: 'UPLOAD-2026-05-18-002', fileName: 'weekend_deliveries.xlsx', uploadedVia: 'bulk_upload', accountId: 'acme-luzon', accountName: 'Acme Luzon', reportedCounts: { total: 156, delivered: 148, inProgress: 6, failed: 2 } }},
  { tracking: 'GGX-2024-89238', recipient: 'Global Enterprises', destination: 'Davao City, Davao', contactNumber: '+63 919 333 2020', recipientAddress: 'Km 5, JP Laurel Ave, Davao City, Davao', status: 'picked-up', type: 'Express', date: '2026-05-17', subaccount: 'Acme Corporation', codAmount: 21000, batch: { batchId: 'UPLOAD-2026-05-17-001', fileName: 'may17_morning.xlsx', uploadedVia: 'bulk_upload', accountId: 'acme-corporation', accountName: 'Acme Corporation', reportedCounts: { total: 423, delivered: 410, inProgress: 9, failed: 4 } } },
  { tracking: 'GGX-2024-89237', recipient: 'Summit Technologies', destination: 'Quezon City, Metro Manila', contactNumber: '+63 917 444 3030', recipientAddress: 'Eastwood City, Bagumbayan, Quezon City, Metro Manila', status: 'pending', type: 'Standard', date: '2026-05-17', subaccount: 'Acme Corporation', codAmount: 5600, batch: { batchId: 'UPLOAD-2026-05-17-001', fileName: 'may17_morning.xlsx', uploadedVia: 'bulk_upload', accountId: 'acme-corporation', accountName: 'Acme Corporation' } },
  { tracking: 'GGX-2024-89236', recipient: 'Metro Solutions Inc.', destination: 'Pasig City, Metro Manila', contactNumber: '+63 918 555 4040', recipientAddress: 'Ortigas Center, San Antonio, Pasig City, Metro Manila', status: 'failed', type: 'Express', date: '2026-05-17', subaccount: 'Acme Luzon', codAmount: 12300, batch: { batchId: 'UPLOAD-2026-05-17-002', fileName: 'luzon_daily.xlsx', uploadedVia: 'bulk_upload', accountId: 'acme-luzon', accountName: 'Acme Luzon', reportedCounts: { total: 76, delivered: 64, inProgress: 4, failed: 8 } } },
  { tracking: 'GGX-2024-89235', recipient: 'Digital Ventures Co.', destination: 'Taguig City, Metro Manila', contactNumber: '+63 919 666 5050', recipientAddress: 'BGC, Fort Bonifacio, Taguig City, Metro Manila', status: 'delivered', type: 'Standard', date: '2026-05-16', subaccount: 'Acme Corporation', codAmount: 7400, serviceType: 'same_day' },
  { tracking: 'GGX-2024-89234', recipient: 'Tech Solutions Inc.', destination: 'Mandaluyong City, Metro Manila', contactNumber: '+63 917 777 6060', recipientAddress: 'Greenfield District, Mandaluyong City, Metro Manila', status: 'delivered', type: 'Express', date: '2026-05-16', subaccount: 'Acme Luzon', codAmount: 9800, batch: { batchId: 'UPLOAD-2026-05-18-001', fileName: 'morning_batch.xlsx', uploadedVia: 'bulk_upload', accountId: 'acme-luzon', accountName: 'Acme Luzon', reportedCounts: { total: 134, delivered: 128, inProgress: 3, failed: 3 } } },
  { tracking: 'GGX-2024-89233', recipient: 'Global Innovations Ltd.', destination: 'Caloocan City, Metro Manila', contactNumber: '+63 918 888 7070', recipientAddress: 'Grace Park, Caloocan City, Metro Manila', status: 'in-transit', type: 'Standard', date: '2026-05-16', subaccount: 'Acme Corporation', codAmount: 6200 },
  { tracking: 'GGX-2024-89232', recipient: 'Acme Corporation', destination: 'Santa Rosa, Laguna', contactNumber: '+63 919 999 8080', recipientAddress: 'Nuvali, Santa Rosa, Laguna', status: 'picked-up', type: 'Express', date: '2026-05-15', subaccount: 'Acme Luzon', codAmount: 17600, serviceType: 'on_demand' },
  { tracking: 'GGX-2024-89231', recipient: 'Summit Partners', destination: 'Bacoor, Cavite', contactNumber: '+63 917 101 9090', recipientAddress: 'Molino Boulevard, Bacoor, Cavite', status: 'returned', type: 'Standard', date: '2026-05-15', subaccount: 'Acme Corporation', codAmount: 4300 },
  // ── May 14–12 (older, SLA-notable) ───────────────────────────────────────────
  { tracking: 'GGX-2024-89230', recipient: 'Castillo & Partners Law', destination: 'Makati City, Metro Manila', contactNumber: '+63 918 202 1212', recipientAddress: 'RCBC Plaza, Ayala Avenue, Makati City', status: 'failed', type: 'Express', date: '2026-05-14', subaccount: 'Acme Corporation', codAmount: 19500, serviceType: 'on_demand' },
  { tracking: 'GGX-2024-89229', recipient: 'IronForge Manufacturing', destination: 'Batangas City, Batangas', contactNumber: '+63 919 313 2323', recipientAddress: 'Batangas City Industrial Estate, Batangas City', status: 'returned', type: 'Express', date: '2026-05-14', subaccount: 'Acme Luzon', codAmount: 72000, batch: { batchId: 'UPLOAD-2026-05-14-001', fileName: 'may14_southern.xlsx', uploadedVia: 'bulk_upload', accountId: 'acme-luzon', accountName: 'Acme Luzon', reportedCounts: { total: 112, delivered: 95, inProgress: 6, failed: 11 } } },
  { tracking: 'GGX-2024-89228', recipient: 'Lumen Digital Agency', destination: 'Pasay City, Metro Manila', contactNumber: '+63 917 424 3434', recipientAddress: 'Mall of Asia Complex, Pasay City, Metro Manila', status: 'delivered', type: 'Standard', date: '2026-05-13', subaccount: 'Acme Corporation', codAmount: 8100 },
  { tracking: 'GGX-2024-89227', recipient: 'Cascade Food Corp.', destination: 'San Fernando, Pampanga', contactNumber: '+63 918 535 4545', recipientAddress: 'SM City Pampanga, San Fernando, Pampanga', status: 'failed', type: 'Standard', date: '2026-05-13', subaccount: 'Acme Corporation', codAmount: 15600, batch: { batchId: 'UPLOAD-2026-05-13-001', fileName: 'may13_central_luzon.xlsx', uploadedVia: 'bulk_upload', accountId: 'acme-corporation', accountName: 'Acme Corporation', reportedCounts: { total: 89, delivered: 80, inProgress: 2, failed: 7 } }},
  { tracking: 'GGX-2024-89226', recipient: 'Onyx Trading Corp.', destination: 'Angeles City, Pampanga', contactNumber: '+63 919 646 5656', recipientAddress: 'Fields Avenue, Angeles City, Pampanga', status: 'delivered', type: 'Express', date: '2026-05-12', subaccount: 'Acme Luzon', codAmount: 33700 },
];

export const transactions: Transaction[] = rows.map((r) => ({
  trackingNumber: r.tracking,
  destination: r.destination,
  type: r.type,
  // Exactly one service type per booking. Rows without an explicit serviceType
  // derive it from the legacy speed tier: the old "Express" maps to Same-Day
  // Delivery (Express is no longer a service-type label), everything else Standard.
  serviceType: r.serviceType ?? (r.type === 'Express' ? 'same_day' : 'standard'),
  status: r.status,
  date: r.date,
  subaccount: r.subaccount,
  source: r.source ?? (r.batch ? 'bulk_upload' : 'manual'),
  shopifyStoreName: r.shopifyStoreName,
  createdAt: `${r.date} 09:30 AM`,
  pickupDate: r.date,
  deliveryDate: r.status === 'delivered' ? r.date : '—',
  sender,
  recipient: { name: r.recipient, contactNumber: r.contactNumber, address: r.recipientAddress },
  items: defaultItems,
  packaging: { size: 'MEDIUM', dimensions: '40cm x 30cm x 20cm', weight: '3.2 kg' },
  store: r.shopifyStoreName
    ? { name: r.shopifyStoreName, url: `${r.subaccount.toLowerCase().replace(/\s+/g, '-')}.myshopify.com` }
    : { name: 'TechGear Philippines', url: 'techgear.ph' },
  fees: defaultFees,
  payment: { method: 'Cash on Delivery (COD)', paidBy: 'Recipient', codAmount: r.codAmount },
  timeline: buildTimeline(r.status, r.date),
  batch: r.batch,
}));

/** Summary rows for the Transactions list. */
export interface TransactionSummary {
  tracking: string;
  recipient: string;
  destination: string;
  status: TransactionStatus;
  type: string;
  serviceType: DeliveryServiceType;
  date: string;
  subaccount: string;
  source: TransactionSource;
  shopifyStoreName?: string;
}

export const deliveries: TransactionSummary[] = transactions.map((t) => ({
  tracking: t.trackingNumber,
  recipient: t.recipient.name,
  destination: t.destination,
  status: t.status,
  type: t.type,
  serviceType: t.serviceType,
  date: t.date,
  subaccount: t.subaccount,
  source: t.source,
  shopifyStoreName: t.shopifyStoreName,
}));

/**
 * Subaccount column display label. Shopify-sourced transactions are tagged
 * "{Subaccount Name} - Shopify"; all other sources show the plain name.
 * The underlying `subaccount` value is unchanged so filtering stays intact.
 */
export function subaccountDisplayLabel(t: Pick<TransactionSummary, 'subaccount' | 'source'>): string {
  return t.source === 'shopify' ? `${t.subaccount} - Shopify` : t.subaccount;
}

/** Look up a full transaction by its tracking number (the `:id` route param). */
export function getTransactionByTracking(tracking: string | undefined): Transaction | undefined {
  if (!tracking) return undefined;
  return transactions.find((t) => t.trackingNumber === tracking);
}
