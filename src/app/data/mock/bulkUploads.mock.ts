/**
 * Mock data for the bulk upload service layer.
 *
 * Re-exports `data/bulkUploads.ts` helpers so the service layer has a single
 * import point. Future: replace with GET /bulk-uploads and
 * GET /bulk-uploads/:id endpoints.
 *
 * Field mapping to future API contract:
 *   id         → batchId
 *   accountId  → subaccountId
 *   status     → batchStatus
 */

export {
  type UploadRecord,
  type UploadStatus,
  type UploadAccount,
  type UploadNotificationEvent,
  PENDING_NOTIFICATIONS,
  getSessionUploads,
  addUpload,
  updateUploadStatus,
  generateUploadId,
  createUploadRecord,
} from '../bulkUploads';
