/**
 * Mock data for the transaction service layer.
 *
 * Re-exports `data/transactions.ts` so the service layer has a single import
 * point. Future: replace with async API calls to GET /transactions.
 *
 * Field mapping to future API contract:
 *   trackingNumber → id (or keep as the primary identifier)
 *   subaccount     → subaccountId (after full ID migration)
 *   status         → deliveryStatus
 *   batch          → bulkUploadOrigin
 */

export {
  type Transaction,
  type TransactionStatus,
  type TransactionItem,
  type TimelineEvent,
  type Party,
  type TransactionBatch,
  statusConfig,
  deliveries,
  getTransactionByTracking,
} from '../transactions';
