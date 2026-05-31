import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getAccountIdByName } from '../data/accounts';
import { loadState, saveState } from '../lib/storage';
import { setRuntimeSubaccounts } from '../data/runtimeAccounts';
import type { MockSubaccount } from '../data/mock/accounts.mock';

/**
 * Mirror the context's subaccount list into the synchronous runtime store so
 * `accountService` (a non-React module) can read the live list. Called
 * synchronously on init + every mutation to avoid effect-ordering staleness.
 */
function mirrorToRuntimeStore(list: SubAccount[]): void {
  const mapped: MockSubaccount[] = list.map((s) => ({
    id: s.id,
    name: s.name,
    type: s.type,
    primaryManager: s.assignedManager,
    status: s.status,
    bookingCount: s.bookingCount,
    pickupAddress: s.pickupAddress,
    contactNumber: s.contactNumber,
  }));
  setRuntimeSubaccounts(mapped);
}

interface PersistedSubAccountState {
  subAccountsEnabled: boolean;
  mainAccount: MainAccount | null;
  subAccounts: SubAccount[];
  currentAccount: string;
}

export interface SubAccount {
  id: string;
  name: string;
  type: 'default' | 'additional';
  /** Display-only primary manager name. Full manager list is in data/users. */
  assignedManager: string;
  status: 'active' | 'inactive';
  bookingCount: number;
  senderName: string;
  pickupAddress: string;
  contactNumber: string;
}

export interface MainAccount {
  legalName: string;
  accountHolder: string;
  billingEmail: string;
  financeContact: string;
  contactNumber: string;
  businessAddress: string;
}

interface SubAccountContextType {
  subAccountsEnabled: boolean;
  mainAccount: MainAccount | null;
  subAccounts: SubAccount[];
  currentAccount: string; // 'main' or subaccount id
  enableSubAccounts: (mainAccountData: MainAccount) => void;
  addSubAccount: (subAccount: SubAccount) => void;
  setCurrentAccount: (accountId: string) => void;
  getCurrentAccountName: () => string;
  /** Stable canonical id for the active account ('main' or a subaccount id). */
  getCurrentAccountId: () => string;
  isMainAccountView: () => boolean;
}

// ---------------------------------------------------------------------------
// Canonical demo subaccounts — single source of truth for the demo data set.
// All switchers, pages, and modals derive their subaccount list from the
// context, which always includes these when subaccounts are enabled.
// ---------------------------------------------------------------------------
export const DEMO_SUBACCOUNTS: SubAccount[] = [
  {
    id: 'acme-corporation',
    name: 'Acme Corporation',
    type: 'default',
    assignedManager: 'Mike Johnson',
    status: 'active',
    bookingCount: 5234,
    senderName: 'Acme Corporation',
    pickupAddress: '123 Business St, Makati City, Metro Manila',
    contactNumber: '+63 917 123 4567',
  },
  {
    id: 'acme-luzon',
    name: 'Acme Luzon',
    type: 'additional',
    assignedManager: 'Sarah Williams',
    status: 'active',
    bookingCount: 3708,
    senderName: 'Acme Luzon',
    pickupAddress: '456 Luzon Ave, Quezon City, Metro Manila',
    contactNumber: '+63 917 987 6543',
  },
  {
    id: 'acme-visayas',
    name: 'Acme Visayas',
    type: 'additional',
    assignedManager: '',
    status: 'active',
    bookingCount: 1842,
    senderName: 'Acme Visayas',
    pickupAddress: '789 Visayas Blvd, Cebu City, Cebu',
    contactNumber: '+63 917 456 7890',
  },
];

const DEMO_IDS   = new Set(DEMO_SUBACCOUNTS.map((d) => d.id));
const DEMO_NAMES = new Set(DEMO_SUBACCOUNTS.map((d) => d.name));

/**
 * When subaccounts are enabled, always ensure all canonical demo subaccounts
 * are present with up-to-date data. Runtime-added subaccounts (from the
 * Request flow) are preserved alongside them.
 *
 * Filters by both ID and name so that old localStorage entries that used
 * legacy ids (e.g. 'sub-1') but share a demo name do not create duplicates.
 */
function mergeWithDemoSubaccounts(existing: SubAccount[]): SubAccount[] {
  const runtime = existing.filter(
    (sa) => !DEMO_IDS.has(sa.id) && !DEMO_NAMES.has(sa.name)
  );
  return [...DEMO_SUBACCOUNTS, ...runtime];
}

// ---------------------------------------------------------------------------

const SubAccountContext = createContext<SubAccountContextType | undefined>(undefined);

export function SubAccountProvider({ children }: { children: ReactNode }) {
  const persisted = loadState<PersistedSubAccountState | null>('subaccount', null);

  const [subAccountsEnabled, setSubAccountsEnabled] = useState(
    persisted?.subAccountsEnabled ?? false
  );
  const [mainAccount, setMainAccount] = useState<MainAccount | null>(
    persisted?.mainAccount ?? null
  );
  // On load, if subaccounts are already enabled, merge in any missing demo
  // subaccounts so all switchers and pages always see both.
  const [subAccounts, setSubAccounts] = useState<SubAccount[]>(() => {
    const raw = persisted?.subAccounts ?? [];
    const initial = persisted?.subAccountsEnabled ? mergeWithDemoSubaccounts(raw) : raw;
    // Seed the runtime store synchronously during provider render (before any
    // child consumer mounts) so accountService reads the correct initial list.
    mirrorToRuntimeStore(initial);
    return initial;
  });
  const [currentAccount, setCurrentAccount] = useState<string>(
    persisted?.currentAccount ?? 'main'
  );

  useEffect(() => {
    saveState('subaccount', { subAccountsEnabled, mainAccount, subAccounts, currentAccount });
  }, [subAccountsEnabled, mainAccount, subAccounts, currentAccount]);

  /**
   * Enable subaccounts. Always seeds DEMO_SUBACCOUNTS regardless of the
   * firstSubAccount argument (kept for call-site backwards compat).
   * After enabling, the user lands on the Main Account view.
   */
  const enableSubAccounts = (mainAccountData: MainAccount) => {
    setMainAccount(mainAccountData);
    setSubAccounts(DEMO_SUBACCOUNTS);
    mirrorToRuntimeStore(DEMO_SUBACCOUNTS);
    setSubAccountsEnabled(true);
    setCurrentAccount('main');
  };

  const addSubAccount = (subAccount: SubAccount) => {
    setSubAccounts((prev) => {
      const next = [...prev, subAccount];
      mirrorToRuntimeStore(next);
      return next;
    });
  };

  const getCurrentAccountName = () => {
    if (currentAccount === 'main') return 'Main Account';
    const account = subAccounts.find((sa) => sa.id === currentAccount);
    return account?.name ?? 'Main Account';
  };

  const getCurrentAccountId = () => {
    if (currentAccount === 'main') return 'main';
    return getAccountIdByName(getCurrentAccountName()) ?? currentAccount;
  };

  const isMainAccountView = () => subAccountsEnabled && currentAccount === 'main';

  return (
    <SubAccountContext.Provider
      value={{
        subAccountsEnabled,
        mainAccount,
        subAccounts,
        currentAccount,
        enableSubAccounts,
        addSubAccount,
        setCurrentAccount,
        getCurrentAccountName,
        getCurrentAccountId,
        isMainAccountView,
      }}
    >
      {children}
    </SubAccountContext.Provider>
  );
}

export function useSubAccounts() {
  const context = useContext(SubAccountContext);
  if (context === undefined) {
    throw new Error('useSubAccounts must be used within a SubAccountProvider');
  }
  return context;
}
