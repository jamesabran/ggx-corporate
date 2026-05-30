/**
 * Canonical mock data for parent account and subaccounts.
 *
 * This is the single source of truth for account/subaccount objects used by
 * the service layer. UI layers consume this via `accountService`, not directly.
 *
 * ID note: The parent account uses id `'main'` throughout the codebase
 * (AuthContext, SubAccountContext, notifications, localStorage). Changing it
 * to `'main-account'` would be a large breaking migration. The canonical ID
 * remains `'main'` and is documented here as the authoritative decision.
 */

export interface MockMainAccount {
  id: 'main';
  name: string;
  legalName: string;
  accountHolder: string;
  billingEmail: string;
  financeContact: string;
  contactNumber: string;
  businessAddress: string;
}

export interface MockSubaccount {
  id: string;
  name: string;
  type: 'default' | 'additional';
  /** Display-only primary manager name. Authoritative list is in users mock. */
  primaryManager: string;
  status: 'active' | 'inactive';
  bookingCount: number;
  pickupAddress: string;
  contactNumber: string;
}

export const MOCK_MAIN_ACCOUNT: MockMainAccount = {
  id: 'main',
  name: 'Main Account',
  legalName: 'Acme Corporation',
  accountHolder: 'Max Rodriguez',
  billingEmail: 'billing@acme.com',
  financeContact: 'Jane Smith',
  contactNumber: '+63 917 123 4567',
  businessAddress: '123 Business St, Makati City, Metro Manila',
};

/**
 * All subaccounts. Add new subaccounts here — the service layer will propagate
 * them to account switchers, settings, and future API calls automatically.
 */
export const MOCK_SUBACCOUNTS: MockSubaccount[] = [
  {
    id: 'acme-corporation',
    name: 'Acme Corporation',
    type: 'default',
    primaryManager: 'Mike Johnson',
    status: 'active',
    bookingCount: 5234,
    pickupAddress: '123 Business St, Makati City, Metro Manila',
    contactNumber: '+63 917 123 4567',
  },
  {
    id: 'acme-luzon',
    name: 'Acme Luzon',
    type: 'additional',
    primaryManager: 'Sarah Williams',
    status: 'active',
    bookingCount: 3708,
    pickupAddress: '456 Luzon Ave, Quezon City, Metro Manila',
    contactNumber: '+63 917 987 6543',
  },
  {
    id: 'acme-visayas',
    name: 'Acme Visayas',
    type: 'additional',
    primaryManager: '',
    status: 'active',
    bookingCount: 1842,
    pickupAddress: '789 Visayas Blvd, Cebu City, Cebu',
    contactNumber: '+63 917 456 7890',
  },
];

/** Quick lookup map: subaccount id → subaccount */
export const SUBACCOUNT_BY_ID: ReadonlyMap<string, MockSubaccount> =
  new Map(MOCK_SUBACCOUNTS.map((s) => [s.id, s]));

/** Quick lookup map: subaccount id → display name */
export const SUBACCOUNT_NAME_BY_ID: ReadonlyMap<string, string> =
  new Map(MOCK_SUBACCOUNTS.map((s) => [s.id, s.name]));

/** All canonical account ids (parent + all subaccounts). */
export const ALL_ACCOUNT_IDS = ['main', ...MOCK_SUBACCOUNTS.map((s) => s.id)] as const;
