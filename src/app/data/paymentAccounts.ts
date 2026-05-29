// Account billing-contract data for the Bulk Upload payment section.
//
// Finance/payment responsibility is handled at the parent account level, so
// billing availability comes from the selected account/subaccount contract —
// not from a separate UI selector. No real billing/invoicing logic.

export type ContractType = 'billing' | 'standard';

// Demo contracts keyed by account name. Acme Luzon has a billing contract;
// Acme Visayas is a standard (pay-now) account. The parent/Main Account
// defaults to billing since finance is handled at the parent level.
const ACCOUNT_CONTRACTS: Record<string, ContractType> = {
  'Main Account': 'billing',
  'Acme Corporation': 'billing',
  'Acme Luzon': 'billing',
  'Acme Visayas': 'standard',
};

/** Resolve the contract type for an account/subaccount name. */
export function getContractType(accountName: string): ContractType {
  return ACCOUNT_CONTRACTS[accountName] ?? 'billing';
}

/** Whether the account/subaccount can pay via billing. */
export function isBillingAccount(accountName: string): boolean {
  return getContractType(accountName) === 'billing';
}
