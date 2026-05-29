// Service Advisories — operational notices (pickup cutoffs, weather delays,
// maintenance windows). Frontend/mock only; would come from an ops/status feed.

import type { ComponentType } from 'react';
import { IconInfoCircle, IconAlertTriangle, IconAlertOctagon } from '@tabler/icons-react';

export type AdvisorySeverity = 'info' | 'warning' | 'critical';
export type AdvisoryStatus = 'active' | 'scheduled' | 'resolved';

export interface ServiceAdvisory {
  id: string;
  title: string;
  body: string;
  severity: AdvisorySeverity;
  status: AdvisoryStatus;
  affectedAreas: string[];
  effectiveFrom: string;
  effectiveTo?: string;
  postedAt: string;
}

export interface SeverityMeta {
  label: string;
  icon: ComponentType<{ className?: string }>;
  iconClass: string;
  bgClass: string;
  badge: 'info' | 'warning' | 'danger';
}

export const SEVERITY_META: Record<AdvisorySeverity, SeverityMeta> = {
  info:     { label: 'Info',     icon: IconInfoCircle,    iconClass: 'text-blue-600',  bgClass: 'bg-blue-50',  badge: 'info' },
  warning:  { label: 'Warning',  icon: IconAlertTriangle, iconClass: 'text-amber-600', bgClass: 'bg-amber-50', badge: 'warning' },
  critical: { label: 'Critical', icon: IconAlertOctagon,  iconClass: 'text-red-600',   bgClass: 'bg-red-50',   badge: 'danger' },
};

export const STATUS_META: Record<AdvisoryStatus, { label: string; variant: 'success' | 'pending' | 'info' | 'default' }> = {
  active:    { label: 'Active',    variant: 'pending' },
  scheduled: { label: 'Scheduled', variant: 'info' },
  resolved:  { label: 'Resolved',  variant: 'success' },
};

// Seed advisories. ADV-001/ADV-002 mirror the seeded service_advisory
// notifications so the bell items land on matching entries.
const ADVISORIES: ServiceAdvisory[] = [
  {
    id: 'ADV-002',
    title: 'Temporary service delay in selected areas',
    body: 'Deliveries to parts of Cebu may be delayed due to weather conditions. Pickups continue as scheduled; recipients may experience 1–2 day delays until conditions clear.',
    severity: 'critical',
    status: 'active',
    affectedAreas: ['Cebu City', 'Mandaue', 'Lapu-Lapu'],
    effectiveFrom: 'May 29, 2026',
    postedAt: '10 hours ago',
  },
  {
    id: 'ADV-001',
    title: 'Pickup cutoff advisory',
    body: 'Same-day pickup cutoff moves to 9:00 AM on June 12 due to holiday volume. Orders booked after the cutoff will be scheduled for the next business day.',
    severity: 'warning',
    status: 'scheduled',
    affectedAreas: ['Nationwide'],
    effectiveFrom: 'Jun 12, 2026',
    effectiveTo: 'Jun 12, 2026',
    postedAt: '1 day ago',
  },
  {
    id: 'ADV-003',
    title: 'API maintenance window completed',
    body: 'Scheduled maintenance on the booking API has completed. All services are operating normally. No further action is required.',
    severity: 'info',
    status: 'resolved',
    affectedAreas: ['API Integration'],
    effectiveFrom: 'May 26, 2026',
    effectiveTo: 'May 26, 2026',
    postedAt: '3 days ago',
  },
];

export function getAdvisories(): readonly ServiceAdvisory[] {
  return ADVISORIES;
}
