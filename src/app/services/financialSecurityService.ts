/**
 * financialSecurityService — records OTP-verified sensitive financial changes
 * (attention-email event + security/audit log + parent-scoped notification).
 *
 * Async facade over the mock data module; swap the body for a real audit/
 * security API + notification emission when the backend is available.
 *
 * Future API endpoints:
 *   POST /security/financial-changes → recordFinancialChange
 *   GET  /security/attention-emails  → getAttentionEmails
 *   GET  /security/log               → getSecurityLog
 *
 * Cross-system note (see MOCK_SERVICE_LAYER.md §1c): in production, the audit
 * record, the holder attention-email, and the resulting notification are
 * backend-emitted side effects of a single verified change. The mock performs
 * them together as a stand-in for that backend event — not frontend
 * orchestration. The frontend only signals the verified intent.
 */

import {
  recordFinancialChange as recordFinancialChangeData,
  getAttentionEmails as getAttentionEmailsData,
  getSecurityLog as getSecurityLogData,
  type AttentionEmailEvent,
  type SecurityLogEntry,
} from '../data/financialSecurity';

export type { AttentionEmailEvent, SecurityLogEntry };

/**
 * Record a successful (OTP-verified) sensitive financial change.
 * @param action  Human-readable description, e.g. "Bank account removed".
 * @param accountName Optional account/subaccount context.
 */
export async function recordFinancialChange(
  action: string,
  accountName?: string
): Promise<void> {
  recordFinancialChangeData(action, accountName);
}

/** Attention-email events recorded this session (for a future Security screen). */
export async function getAttentionEmails(): Promise<readonly AttentionEmailEvent[]> {
  return getAttentionEmailsData();
}

/** Security/audit log entries recorded this session (for a future Security screen). */
export async function getSecurityLog(): Promise<readonly SecurityLogEntry[]> {
  return getSecurityLogData();
}
