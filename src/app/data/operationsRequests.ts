/**
 * Mock seed data for Operations Requests.
 *
 * These are logistics execution requests sent by corporate users to the GGX
 * Operations team — supply replenishment, pickup coordination, and operational
 * assistance. They are NOT issue reports (see Support Tickets for that).
 *
 * Future: replace with GET /operations-requests from the BFF.
 */

export type OpsRequestCategory = 'supply' | 'pickup_support' | 'operational_assistance';

export type OpsRequestStatus =
  | 'submitted'
  | 'in_review'
  | 'coordinating'
  | 'scheduled'
  | 'completed'
  | 'declined'
  | 'cancelled';

export type SupplyType = 'pouches' | 'boxes' | 'other_packaging';
export type PickupSupportType =
  | 'immediate_pickup'
  | 'bulk_pickup_assistance'
  | 'four_wheel_pickup'
  | 'reschedule_pickup'
  | 'escalate_missed_pickup';
export type OperationalAssistanceType =
  | 'special_handling'
  | 'high_volume_dispatch'
  | 'warehouse_coordination';

export interface OperationsRequest {
  id: string;
  category: OpsRequestCategory;
  subaccountId: string;
  subaccountName: string;
  status: OpsRequestStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  notes?: string;

  // Supply request fields
  supplyType?: SupplyType;
  quantity?: number;
  deliveryAddress?: string;
  neededByDate?: string;

  // Pickup support fields
  pickupSupportType?: PickupSupportType;
  relatedBatchId?: string;
  pickupAddress?: string;
  estimatedShipmentCount?: number;
  estimatedWeight?: string;
  preferredPickupWindow?: string;

  // Operational assistance fields
  assistanceType?: OperationalAssistanceType;
}

// In-memory store — addOpsRequest() mutates this for demo submissions.
export const opsRequestsData: OperationsRequest[] = [
  {
    id: 'OPS-2026-0012',
    category: 'supply',
    subaccountId: 'acme-corporation',
    subaccountName: 'Acme Corporation',
    status: 'submitted',
    createdAt: '2026-05-31',
    updatedAt: '2026-05-31',
    createdBy: 'Max Rodriguez',
    supplyType: 'pouches',
    quantity: 500,
    deliveryAddress: 'Unit 4F, The Podium, Ortigas Center, Pasig City',
    neededByDate: '2026-06-05',
    notes: 'Urgent restock — current supply runs out by Jun 3.',
  },
  {
    id: 'OPS-2026-0011',
    category: 'pickup_support',
    subaccountId: 'acme-corporation',
    subaccountName: 'Acme Corporation',
    status: 'coordinating',
    createdAt: '2026-05-30',
    updatedAt: '2026-05-31',
    createdBy: 'Max Rodriguez',
    pickupSupportType: 'bulk_pickup_assistance',
    relatedBatchId: 'UPLOAD-2026-05-30-001',
    pickupAddress: 'Warehouse A, Carmona Industrial Estate, Carmona, Cavite',
    estimatedShipmentCount: 312,
    estimatedWeight: '~420 kg',
    preferredPickupWindow: '2026-06-01 8:00 AM – 12:00 PM',
    notes: 'Large batch — need coordinated 4-wheel + 2-wheel dispatch.',
  },
  {
    id: 'OPS-2026-0010',
    category: 'operational_assistance',
    subaccountId: 'acme-luzon',
    subaccountName: 'Acme Luzon',
    status: 'scheduled',
    createdAt: '2026-05-29',
    updatedAt: '2026-05-30',
    createdBy: 'Dana Cruz',
    assistanceType: 'warehouse_coordination',
    notes: 'Need branch coordination for Cebu City consolidation hub — expected volume spike Jun 3–7.',
  },
  {
    id: 'OPS-2026-0009',
    category: 'supply',
    subaccountId: 'acme-luzon',
    subaccountName: 'Acme Luzon',
    status: 'completed',
    createdAt: '2026-05-26',
    updatedAt: '2026-05-28',
    createdBy: 'Dana Cruz',
    supplyType: 'boxes',
    quantity: 200,
    deliveryAddress: 'SM City Pampanga Drop-off, San Fernando, Pampanga',
    neededByDate: '2026-05-28',
  },
  {
    id: 'OPS-2026-0008',
    category: 'pickup_support',
    subaccountId: 'acme-corporation',
    subaccountName: 'Acme Corporation',
    status: 'completed',
    createdAt: '2026-05-25',
    updatedAt: '2026-05-27',
    createdBy: 'Max Rodriguez',
    pickupSupportType: 'four_wheel_pickup',
    pickupAddress: 'Calamba Technopark, Calamba, Laguna',
    estimatedShipmentCount: 180,
    preferredPickupWindow: '2026-05-27 2:00 PM – 5:00 PM',
    notes: 'Heavy items — standard 2-wheel first-mile not suitable.',
  },
  {
    id: 'OPS-2026-0007',
    category: 'operational_assistance',
    subaccountId: 'acme-corporation',
    subaccountName: 'Acme Corporation',
    status: 'in_review',
    createdAt: '2026-05-28',
    updatedAt: '2026-05-29',
    createdBy: 'Max Rodriguez',
    assistanceType: 'high_volume_dispatch',
    notes: 'Mid-year sale starting Jun 10 — expecting 800–1,000 orders/day for 5 days. Need dedicated dispatch coordination.',
  },
  {
    id: 'OPS-2026-0006',
    category: 'pickup_support',
    subaccountId: 'acme-luzon',
    subaccountName: 'Acme Luzon',
    status: 'declined',
    createdAt: '2026-05-22',
    updatedAt: '2026-05-23',
    createdBy: 'Dana Cruz',
    pickupSupportType: 'immediate_pickup',
    pickupAddress: 'Trinoma Mall Drop-off, Quezon City',
    estimatedShipmentCount: 40,
    notes: 'Declined — address outside immediate pickup service area. Rescheduled to next day.',
  },
  {
    id: 'OPS-2026-0005',
    category: 'supply',
    subaccountId: 'acme-corporation',
    subaccountName: 'Acme Corporation',
    status: 'completed',
    createdAt: '2026-05-20',
    updatedAt: '2026-05-22',
    createdBy: 'Max Rodriguez',
    supplyType: 'pouches',
    quantity: 300,
    deliveryAddress: 'Unit 4F, The Podium, Ortigas Center, Pasig City',
    neededByDate: '2026-05-22',
  },
];

let nextId = 13;

/** Append a new request to the in-memory store (demo-only). */
export function addOpsRequest(req: Omit<OperationsRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'>): OperationsRequest {
  const now = new Date().toISOString().slice(0, 10);
  const newReq: OperationsRequest = {
    ...req,
    id: `OPS-2026-${String(nextId++).padStart(4, '0')}`,
    status: 'submitted',
    createdAt: now,
    updatedAt: now,
  };
  opsRequestsData.unshift(newReq);
  return newReq;
}
