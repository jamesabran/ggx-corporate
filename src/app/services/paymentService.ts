/**
 * paymentService — account billing-contract / payment-eligibility facade.
 *
 * Async facade over the mock contract data; swap the body for a real
 * Contract Manager lookup (via the BFF) when the backend is available.
 *
 * Future API endpoint:
 *   GET /accounts/:id/billing-eligibility → getContractType / isBillingAccount
 *
 * Source-system note: billing eligibility / contract type is owned by Contract
 * Manager. The frontend renders the eligibility flag it is given; it does not
 * decide billing terms itself.
 */

import {
  getContractType as getContractTypeData,
  isBillingAccount as isBillingAccountData,
  type ContractType,
} from '../data/paymentAccounts';

export type { ContractType };

/** Resolve the contract type for an account/subaccount name. */
export async function getContractType(accountName: string): Promise<ContractType> {
  return getContractTypeData(accountName);
}

/** Whether the account/subaccount can pay via billing. */
export async function isBillingAccount(accountName: string): Promise<boolean> {
  return isBillingAccountData(accountName);
}
