// SLA Alerts / Operations Monitoring (frontend/mock).
//
// Surfaces delivery SLA risks (No Movement, Breach SLA) and follow-up tracking,
// linked to tracking numbers and id-scoped via the canonical account map.
// Follow-ups push a notification through the existing pushNotification hook.

import type { ComponentType } from 'react';
import { IconClockExclamation, IconAlertOctagon, IconMessageDots } from '@tabler/icons-react';
import { pushNotification } from './notifications';
import { getAccountIdByName } from './accounts';

export type SlaAlertType = 'no_movement' | 'breach' | 'follow_up';
export type SlaAlertStatus = 'open' | 'monitoring' | 'resolved';

export interface SlaTypeMeta {
  label: string;
  icon: ComponentType<{ className?: string }>;
  iconClass: string;
  bgClass: string;
  badge: 'warning' | 'danger' | 'info';
}

export const SLA_TYPE_META: Record<SlaAlertType, SlaTypeMeta> = {
  no_movement: { label: 'No Movement', icon: IconClockExclamation, iconClass: 'text-amber-600', bgClass: 'bg-amber-50', badge: 'warning' },
  breach:      { label: 'Breach SLA',  icon: IconAlertOctagon,     iconClass: 'text-red-600',   bgClass: 'bg-red-50',   badge: 'danger' },
  follow_up:   { label: 'Follow-up',   icon: IconMessageDots,      iconClass: 'text-blue-600',  bgClass: 'bg-blue-50',  badge: 'info' },
};

export const SLA_STATUS_META: Record<SlaAlertStatus, { label: string; variant: 'danger' | 'pending' | 'success' }> = {
  open:       { label: 'Action needed', variant: 'danger' },
  monitoring: { label: 'Monitoring',    variant: 'pending' },
  resolved:   { label: 'Resolved',      variant: 'success' },
};

export interface SlaAlert {
  id: string;
  trackingNumber: string;
  type: SlaAlertType;
  title: string;
  detail: string;
  status: SlaAlertStatus;
  /** Assigned hub or forwarder responsible for follow-up. */
  assignedTo: string;
  followUpNote?: string;
  createdAt: string;
  accountId?: string;
  accountName?: string;
}

// Seed alerts linked to existing in-transit / picked-up / failed transactions.
const SLA_ALERTS: SlaAlert[] = [
  { id: 'SLA-2001', trackingNumber: 'GGX-2024-89236', type: 'breach', title: 'SLA breached — delivery overdue', detail: 'Delivery exceeded the committed 2-day SLA and was marked failed.', status: 'open', assignedTo: 'Pasig Forwarder', createdAt: '6 hours ago', accountId: 'acme-luzon', accountName: 'Acme Luzon' },
  { id: 'SLA-2002', trackingNumber: 'GGX-2024-89239', type: 'no_movement', title: 'No movement for 18 hours', detail: 'Parcel has not scanned at any hub since leaving origin.', status: 'monitoring', assignedTo: 'Cebu Hub', followUpNote: 'Follow-up sent to Cebu Hub at 9:00 AM.', createdAt: '10 hours ago', accountId: 'acme-luzon', accountName: 'Acme Luzon' },
  { id: 'SLA-2003', trackingNumber: 'GGX-2024-89238', type: 'no_movement', title: 'No movement for 12 hours', detail: 'Awaiting first-mile scan after pickup.', status: 'open', assignedTo: 'Davao Hub', createdAt: '12 hours ago', accountId: 'acme-corporation', accountName: 'Acme Corporation' },
  { id: 'SLA-2004', trackingNumber: 'GGX-2024-89232', type: 'breach', title: 'SLA at risk — approaching cutoff', detail: 'Estimated delivery is past the committed window for this lane.', status: 'monitoring', assignedTo: 'Laguna Hub', followUpNote: 'Follow-up sent to assigned forwarder; re-routing requested.', createdAt: '1 day ago', accountId: 'acme-luzon', accountName: 'Acme Luzon' },
];

export function getSlaAlerts(): readonly SlaAlert[] {
  return SLA_ALERTS;
}

export function getSlaAlert(id: string): SlaAlert | undefined {
  return SLA_ALERTS.find((a) => a.id === id);
}

/** Record a follow-up to the assigned hub/forwarder and push a notification. */
export function sendFollowUp(id: string, note?: string): void {
  const alert = getSlaAlert(id);
  if (!alert) return;
  alert.followUpNote = note?.trim() || `Follow-up sent to ${alert.assignedTo}.`;
  if (alert.status === 'open') alert.status = 'monitoring';

  pushNotification({
    category: 'transaction',
    scope: alert.accountId ? 'subaccount' : 'parent',
    accountId: alert.accountId,
    accountName: alert.accountName,
    title: 'SLA follow-up sent',
    body: `Follow-up sent to ${alert.assignedTo} for ${alert.trackingNumber}.`,
    href: '/dashboard/sla-alerts',
    meta: { trackingNumber: alert.trackingNumber },
  });
}

/** Mark an alert resolved. */
export function resolveAlert(id: string): void {
  const alert = getSlaAlert(id);
  if (alert) alert.status = 'resolved';
}
