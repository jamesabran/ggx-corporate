// Mock/static data for the Basic (self-serve seller) mobile experience.
// No backend calls — all figures are illustrative. Authoritative shipment,
// fee, and payout values are service/backend-owned per product rules.

export type OrderStatus = 'pending' | 'in-transit' | 'delivered' | 'returned';

export interface BasicOrder {
  id: string;
  recipient: string;
  address: string;
  service: 'Standard Delivery' | 'Bulk Upload';
  status: OrderStatus;
  cod: number;
  bookedAt: string;
  time: string;
}

export const BASIC_ORDERS: BasicOrder[] = [
  { id: 'GGX-240601-001', recipient: 'Maria Santos',   address: 'Quezon City, Metro Manila',   service: 'Standard Delivery', status: 'in-transit', cod: 1250, bookedAt: 'Jun 1, 2026', time: '2h ago' },
  { id: 'GGX-240531-009', recipient: 'Juan dela Cruz', address: 'Makati City, Metro Manila',    service: 'Standard Delivery', status: 'delivered',  cod: 890,  bookedAt: 'May 31, 2026', time: 'Yesterday' },
  { id: 'GGX-240531-007', recipient: 'Ana Reyes',      address: 'Cebu City, Cebu',              service: 'Standard Delivery', status: 'pending',    cod: 2100, bookedAt: 'May 31, 2026', time: 'Yesterday' },
  { id: 'GGX-240530-022', recipient: 'Carlo Bautista', address: 'Davao City, Davao del Sur',    service: 'Bulk Upload',       status: 'delivered',  cod: 0,    bookedAt: 'May 30, 2026', time: '2 days ago' },
  { id: 'GGX-240530-014', recipient: 'Liza Tan',       address: 'Pasig City, Metro Manila',     service: 'Standard Delivery', status: 'delivered',  cod: 540,  bookedAt: 'May 30, 2026', time: '2 days ago' },
  { id: 'GGX-240529-031', recipient: 'Mark Villanueva',address: 'Taguig City, Metro Manila',    service: 'Bulk Upload',       status: 'returned',   cod: 1750, bookedAt: 'May 29, 2026', time: '3 days ago' },
];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  'pending': 'Pending',
  'in-transit': 'In Transit',
  'delivered': 'Delivered',
  'returned': 'Returned',
};

export const STATUS_VARIANT: Record<OrderStatus, 'info' | 'success' | 'pending' | 'danger'> = {
  'pending': 'pending',
  'in-transit': 'info',
  'delivered': 'success',
  'returned': 'danger',
};

export function getBasicOrder(id: string | undefined): BasicOrder | undefined {
  return BASIC_ORDERS.find((o) => o.id === id);
}
