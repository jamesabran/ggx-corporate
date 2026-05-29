// Mock "bill to" accounts for the Bulk Upload payment section.
//
// Payment via billing is only available to accounts whose contract includes
// billing. Demo: Acme Luzon is a billing-contract account; Acme Corporation is
// a standard (pay-now) account. No real billing/invoicing logic.

export interface PaymentAccount {
  id: string;
  name: string;
  contractType: 'billing' | 'standard';
}

export const PAYMENT_ACCOUNTS: PaymentAccount[] = [
  { id: 'acme-luzon', name: 'Acme Luzon', contractType: 'billing' },
  { id: 'acme-corp', name: 'Acme Corporation', contractType: 'standard' },
];
