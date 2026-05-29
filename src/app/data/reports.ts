// Reports & Downloads — mock data + frontend-only CSV generation.
//
// No spreadsheet library is available (and none may be added), so downloads are
// generated as CSV (Excel-compatible, UTF-8 BOM) — a documented fallback for
// what would be real XLSX/PDF exports from a backend reporting service.

import type { ComponentType } from 'react';
import {
  IconReceipt, IconWallet, IconPackage, IconChartBar,
} from '@tabler/icons-react';

export type ReportStatus = 'ready' | 'generating' | 'failed';
export type ReportType = 'billing' | 'settlement' | 'delivery' | 'analytics';

export interface ReportItem {
  id: string;
  name: string;
  type: ReportType;
  period: string;
  /** Human-readable generated timestamp. */
  generatedAt: string;
  status: ReportStatus;
  format: 'CSV' | 'PDF';
  sizeLabel: string;
}

export interface ReportTypeMeta {
  label: string;
  icon: ComponentType<{ className?: string }>;
  iconClass: string;
  bgClass: string;
}

export const REPORT_TYPE_META: Record<ReportType, ReportTypeMeta> = {
  billing:    { label: 'Billing',    icon: IconReceipt,  iconClass: 'text-blue-600',    bgClass: 'bg-blue-50' },
  settlement: { label: 'Settlement', icon: IconWallet,   iconClass: 'text-emerald-600', bgClass: 'bg-emerald-50' },
  delivery:   { label: 'Delivery',   icon: IconPackage,  iconClass: 'text-indigo-600',  bgClass: 'bg-indigo-50' },
  analytics:  { label: 'Analytics',  icon: IconChartBar, iconClass: 'text-violet-600',  bgClass: 'bg-violet-50' },
};

export const REPORT_STATUS_META: Record<ReportStatus, { label: string; variant: 'success' | 'pending' | 'danger' }> = {
  ready:      { label: 'Ready',      variant: 'success' },
  generating: { label: 'Generating', variant: 'pending' },
  failed:     { label: 'Failed',     variant: 'danger' },
};

// Seed reports. RPT-2026-05 matches the `report` notification meta.reportId so
// the bell "Monthly billing report is ready" notification lands on a real row.
export const SEED_REPORTS: ReportItem[] = [
  { id: 'RPT-2026-05', name: 'Monthly Billing Report — May 2026', type: 'billing',    period: 'May 2026',          generatedAt: 'Jun 1, 2026, 09:12 AM', status: 'ready',      format: 'CSV', sizeLabel: '48 KB' },
  { id: 'RPT-STL-0521', name: 'Settlement Summary — May 16–31',   type: 'settlement', period: 'May 16–31, 2026',   generatedAt: 'Jun 1, 2026, 08:40 AM', status: 'ready',      format: 'CSV', sizeLabel: '22 KB' },
  { id: 'RPT-DLV-0526', name: 'Delivery Performance — May 2026',  type: 'delivery',   period: 'May 2026',          generatedAt: 'May 31, 2026, 06:05 PM', status: 'ready',     format: 'CSV', sizeLabel: '64 KB' },
  { id: 'RPT-ANL-Q2',   name: 'Quarterly Analytics — Q2 2026',    type: 'analytics',  period: 'Apr–Jun 2026',      generatedAt: 'In progress',            status: 'generating', format: 'CSV', sizeLabel: '—' },
  { id: 'RPT-2026-04',  name: 'Monthly Billing Report — Apr 2026', type: 'billing',   period: 'April 2026',        generatedAt: 'May 1, 2026, 09:05 AM',  status: 'ready',      format: 'CSV', sizeLabel: '46 KB' },
  { id: 'RPT-DLV-0426', name: 'Delivery Performance — Apr 2026',  type: 'delivery',   period: 'April 2026',        generatedAt: 'Apr 30, 2026, 05:58 PM', status: 'ready',      format: 'CSV', sizeLabel: '61 KB' },
];

// Mock summary rows per report type so a downloaded file is not empty.
const REPORT_ROWS: Record<ReportType, string[][]> = {
  billing:    [['Invoice', 'Period', 'Deliveries', 'Amount (PHP)'], ['INV-2026-05', 'May 2026', '2847', '2418000.00']],
  settlement: [['Settlement ID', 'Period', 'Orders', 'Net Payout (PHP)'], ['STL-0521', 'May 16-31 2026', '1320', '1185400.00']],
  delivery:   [['Metric', 'Value'], ['Total Deliveries', '2847'], ['Success Rate', '96.4%'], ['Avg Delivery Time', '1.8 days']],
  analytics:  [['Metric', 'Q2 2026'], ['Total Shipments', '8210'], ['On-Time %', '95.1'], ['Top Destination', 'Metro Manila']],
};

function csvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/** Generate and download a report as a CSV file (frontend mock). */
export function downloadReport(report: ReportItem): void {
  const rows = REPORT_ROWS[report.type];
  const header = [`# ${report.name}`, `# Report ID: ${report.id}`, `# Period: ${report.period}`, ''];
  const body = rows.map((r) => r.map(csvCell).join(','));
  const csv = [...header, ...body].join('\r\n');

  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${report.id}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
