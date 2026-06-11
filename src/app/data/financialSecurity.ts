// Financial security — attention-email events + security/audit log (mock).
//
// After a sensitive financial change is OTP-verified, the UI calls
// `recordFinancialChange()`, which:
//   1. prepares a mock "attention email" event to the account holder (no real
//      email is sent),
//   2. appends a lightweight security/audit log entry (otpVerified: true), and
//   3. surfaces a parent-scoped account notification via the existing
//      pushNotification extension point so the change is visible in the bell.
//
// All state is module-level/in-memory; there is no UI to browse the log yet
// (getters are exported for a future Security/Activity screen).

import { pushNotification } from './notifications';

export interface AttentionEmailEvent {
  eventType: 'financial_update_attention';
  recipient: string;     // account holder
  subject: string;
  body: string;
  action: string;        // what was changed
  timestamp: string;     // ISO
  accountName?: string;  // account/subaccount context, when relevant
}

export interface SecurityLogEntry {
  action: string;
  actor: string;
  accountName?: string;
  timestamp: string;
  otpVerified: true;
}

// Demo account holder (matches the topbar user). A real app would resolve this
// from the authenticated session.
const ACCOUNT_HOLDER = 'Max Rodriguez';

const EMAIL_SUBJECT = 'Important: Financial account details were updated';
const EMAIL_BODY =
  'A financial setting was updated in your GGX Business+ account. If you did not authorize this change, please contact support immediately.';

const ATTENTION_EMAILS: AttentionEmailEvent[] = [];
const SECURITY_LOG: SecurityLogEntry[] = [];

/**
 * Record a successful (OTP-verified) sensitive financial change.
 * @param action  Human-readable description, e.g. "Bank account removed".
 * @param accountName Optional account/subaccount context.
 */
export function recordFinancialChange(action: string, accountName?: string): void {
  const timestamp = new Date().toISOString();

  ATTENTION_EMAILS.push({
    eventType: 'financial_update_attention',
    recipient: ACCOUNT_HOLDER,
    subject: EMAIL_SUBJECT,
    body: EMAIL_BODY,
    action,
    timestamp,
    accountName,
  });

  SECURITY_LOG.push({ action, actor: ACCOUNT_HOLDER, accountName, timestamp, otpVerified: true });

  // Parent-scoped (Admin-only, finance) notification so the change is surfaced.
  pushNotification({
    category: 'account',
    scope: 'parent',
    title: EMAIL_SUBJECT,
    body: `${action}. ${EMAIL_BODY}`,
    href: '/dashboard/payment-settings',
  });
}

export function getAttentionEmails(): readonly AttentionEmailEvent[] {
  return ATTENTION_EMAILS;
}

export function getSecurityLog(): readonly SecurityLogEntry[] {
  return SECURITY_LOG;
}
