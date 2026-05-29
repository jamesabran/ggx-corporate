// Module-level store for upload sessions (frontend-only).
// State lives for the lifetime of the browser tab.
//
// TODO (next prompt — notification bell integration):
//   1. Import PENDING_NOTIFICATIONS in RootLayout.tsx
//   2. In the bell popover, render each UploadNotificationEvent as a list item
//      with text "{fileName} — {validRows} orders ready to review" and a link to
//      /dashboard/bulk-uploader/summary/{batchId}
//   3. Track event.read to clear the red dot after viewing
//   4. No structural changes needed here — the event shape is final.

export type UploadStatus = 'processing' | 'needs-review' | 'awaiting-payment' | 'completed';

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
}

export const PENDING_NOTIFICATIONS: UploadNotificationEvent[] = [];

const SESSION_UPLOADS: UploadRecord[] = [];

export function addUpload(record: UploadRecord): void {
  SESSION_UPLOADS.unshift(record);
}

export function updateUploadStatus(id: string, status: UploadStatus): void {
  const record = SESSION_UPLOADS.find((r) => r.id === id);
  if (!record) return;
  record.status = status;
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
  };
}
