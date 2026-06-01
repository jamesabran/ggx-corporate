/**
 * Operations Requests service facade.
 *
 * Contract between the UI and the BFF. Currently backed by mock in-memory data.
 * Future: replace each function body with fetch() calls to:
 *   GET  /operations-requests
 *   GET  /operations-requests/:id
 *   POST /operations-requests
 *
 * Scoping rules enforced here (not in UI):
 *   - Admin on Main Account: sees all subaccounts.
 *   - Admin viewing a subaccount / Manager: scoped to their subaccountId.
 *
 * The frontend determines: presentation, filtering, form completeness.
 * The frontend does NOT determine: feasibility, availability, handler
 *   assignment, fulfillment status, or routing logic.
 */

import {
  opsRequestsData,
  addOpsRequest,
  type OperationsRequest,
  type OpsRequestCategory,
  type OpsRequestStatus,
  type SupplyType,
  type PickupSupportType,
  type OperationalAssistanceType,
} from '../data/operationsRequests';
import { IconBox, IconTruck, IconAdjustments } from '@tabler/icons-react';
import type { ComponentType } from 'react';

export type {
  OperationsRequest,
  OpsRequestCategory,
  OpsRequestStatus,
  SupplyType,
  PickupSupportType,
  OperationalAssistanceType,
};

// ─── presentation meta ───────────────────────────────────────────────────────

export const CATEGORY_META: Record<OpsRequestCategory, {
  label: string;
  icon: ComponentType<{ className?: string }>;
  bgClass: string;
  iconClass: string;
  badge: 'info' | 'warning' | 'default';
}> = {
  supply: {
    label: 'Supply Request',
    icon: IconBox,
    bgClass: 'bg-violet-50',
    iconClass: 'text-violet-600',
    badge: 'info',
  },
  pickup_support: {
    label: 'Pickup Support',
    icon: IconTruck,
    bgClass: 'bg-blue-50',
    iconClass: 'text-blue-600',
    badge: 'info',
  },
  operational_assistance: {
    label: 'Operational Assistance',
    icon: IconAdjustments,
    bgClass: 'bg-amber-50',
    iconClass: 'text-amber-600',
    badge: 'warning',
  },
};

export const STATUS_META: Record<OpsRequestStatus, {
  label: string;
  variant: 'default' | 'info' | 'warning' | 'success' | 'danger';
}> = {
  submitted:    { label: 'Submitted',    variant: 'default' },
  in_review:    { label: 'In Review',    variant: 'warning' },
  coordinating: { label: 'Coordinating', variant: 'info' },
  scheduled:    { label: 'Scheduled',    variant: 'info' },
  completed:    { label: 'Completed',    variant: 'success' },
  declined:     { label: 'Declined',     variant: 'danger' },
  cancelled:    { label: 'Cancelled',    variant: 'default' },
};

export const SUPPLY_TYPE_LABELS: Record<SupplyType, string> = {
  pouches: 'Pouches',
  boxes: 'Boxes',
  other_packaging: 'Other Packaging',
};

export const PICKUP_SUPPORT_LABELS: Record<PickupSupportType, string> = {
  immediate_pickup: 'Immediate Pickup',
  bulk_pickup_assistance: 'Bulk Pickup Assistance',
  four_wheel_pickup: '4-Wheel Pickup (vs 2-Wheel First-Mile)',
  reschedule_pickup: 'Reschedule Pickup',
  escalate_missed_pickup: 'Escalate Missed Pickup',
};

export const ASSISTANCE_TYPE_LABELS: Record<OperationalAssistanceType, string> = {
  special_handling: 'Special Handling',
  high_volume_dispatch: 'High-Volume Dispatch Coordination',
  warehouse_coordination: 'Warehouse / Branch Coordination',
};

// ─── service functions ────────────────────────────────────────────────────────

export interface OpsRequestFilters {
  subaccountId?: string;
  category?: OpsRequestCategory | 'all';
  status?: OpsRequestStatus | 'all';
}

/** Return operations requests, optionally filtered by subaccount, category, and status. */
export async function getOpsRequests(filters?: OpsRequestFilters): Promise<OperationsRequest[]> {
  let result = [...opsRequestsData];
  const { subaccountId, category, status } = filters ?? {};
  if (subaccountId && subaccountId !== 'all' && subaccountId !== 'main') {
    result = result.filter((r) => r.subaccountId === subaccountId);
  }
  if (category && category !== 'all') {
    result = result.filter((r) => r.category === category);
  }
  if (status && status !== 'all') {
    result = result.filter((r) => r.status === status);
  }
  return result;
}

/** Return a single operations request by ID. */
export async function getOpsRequestById(id: string): Promise<OperationsRequest | null> {
  return opsRequestsData.find((r) => r.id === id) ?? null;
}

export type NewOpsRequest = Omit<OperationsRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'>;

/** Submit a new operations request. Returns the created record (status: submitted). */
export async function submitOpsRequest(req: NewOpsRequest): Promise<OperationsRequest> {
  return addOpsRequest(req);
}
