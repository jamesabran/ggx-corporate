// Module-level store for upload sessions (frontend-only).
// State lives for the lifetime of the browser tab.
//
// Notification integration (done): `PENDING_NOTIFICATIONS` is consumed by
// `src/app/data/notifications.ts`, which maps each UploadNotificationEvent into
// the unified AppNotification model (category 'bulk_upload') rendered in the
// RootLayout bell popover and the Notifications page. `event.read` is flipped by
// `markAllNotificationsRead()` when the popover/page is opened.

import { loadState, saveState } from '../lib/storage';

export type UploadStatus = 'processing' | 'needs-review' | 'awaiting-payment' | 'completed';

// Account scope captured at upload time so notifications and batch linkage are
// correctly scoped. `main` = parent/Main Account; `subaccount` = a specific one.
export interface UploadAccount {
  accountId: string;     // 'main' or a subaccount id
  accountName: string;   // 'Main Account' or the subaccount name
  accountType: 'main' | 'subaccount';
}

export interface UploadRecord {
  id: string;
  fileName: string;
  uploadedAt: string;
  totalRows: number;
  validRows: number;
  errorRows: number;
  status: UploadStatus;
  uploadMode: 'standard' | 'same-day';
  firstMile: 'pickup' | 'dropoff';
  /**
   * Which Bulk Booking input method produced this batch. Absent/'file' = the
   * Upload File path (default); 'spreadsheet' = the in-app Type in Spreadsheet
   * grid (rows already validated in-grid, so the review summary skips the mock
   * error-correction table). Both methods feed the same review/summary flow.
   */
  source?: 'file' | 'spreadsheet';
  // Account scope of the uploading account/subaccount.
  accountId: string;
  accountName: string;
  accountType: 'main' | 'subaccount';
}

// Notification event shape — ready for bell integration (see TODO above).
export interface UploadNotificationEvent {
  id: string;
  type: 'upload_needs_review';
  batchId: string;
  fileName: string;
  validRows: number;
  errorRows: number;
  timestamp: string;
  read: boolean;
  // Account scope, copied from the upload record so the notification model can
  // resolve visibility (parent vs subaccount).
  accountId: string;
  accountName: string;
  accountType: 'main' | 'subaccount';
}

export const PENDING_NOTIFICATIONS: UploadNotificationEvent[] = [];

// Recent uploads persist across reloads (lightweight continuity). The derived
// upload-event notifications (PENDING_NOTIFICATIONS) remain session-only.
const SESSION_UPLOADS: UploadRecord[] = loadState<UploadRecord[]>('recentUploads', []);
function persistUploads(): void { saveState('recentUploads', SESSION_UPLOADS); }

export function addUpload(record: UploadRecord): void {
  SESSION_UPLOADS.unshift(record);
  persistUploads();
}

export function updateUploadStatus(id: string, status: UploadStatus): void {
  const record = SESSION_UPLOADS.find((r) => r.id === id);
  if (!record) return;
  record.status = status;
  persistUploads();
  if (status === 'needs-review') {
    PENDING_NOTIFICATIONS.push({
      id: `notif-${Date.now()}`,
      type: 'upload_needs_review',
      batchId: id,
      fileName: record.fileName,
      validRows: record.validRows,
      errorRows: record.errorRows,
      timestamp: new Date().toISOString(),
      read: false,
      accountId: record.accountId,
      accountName: record.accountName,
      accountType: record.accountType,
    });
  }
}

export function getSessionUploads(): readonly UploadRecord[] {
  return SESSION_UPLOADS;
}

function nowString(): string {
  return new Date().toLocaleString('en-PH', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

export function generateUploadId(): string {
  const d = new Date();
  const datePart = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return `UPLOAD-${datePart}-${String(Math.floor(Math.random() * 900) + 100)}`;
}

export function createUploadRecord(
  id: string,
  fileName: string,
  uploadMode: 'standard' | 'same-day',
  firstMile: 'pickup' | 'dropoff',
  status: UploadStatus,
  account: UploadAccount,
): UploadRecord {
  return {
    id,
    fileName,
    uploadedAt: nowString(),
    totalRows: 104,
    validRows: 100,
    errorRows: 4,
    status,
    uploadMode,
    firstMile,
    accountId: account.accountId,
    accountName: account.accountName,
    accountType: account.accountType,
  };
}
