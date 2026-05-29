import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getAccountIdByName } from '../data/accounts';
import { loadState, saveState } from '../lib/storage';

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
  enableSubAccounts: (mainAccountData: MainAccount, firstSubAccount: SubAccount) => void;
  addSubAccount: (subAccount: SubAccount) => void;
  setCurrentAccount: (accountId: string) => void;
  getCurrentAccountName: () => string;
  /** Stable canonical id for the active account ('main' or a subaccount id). */
  getCurrentAccountId: () => string;
  isMainAccountView: () => boolean;
}

const SubAccountContext = createContext<SubAccountContextType | undefined>(undefined);

export function SubAccountProvider({ children }: { children: ReactNode }) {
  // Hydrate selected account/subaccount state from localStorage for continuity.
  const persisted = loadState<PersistedSubAccountState | null>('subaccount', null);
  const [subAccountsEnabled, setSubAccountsEnabled] = useState(persisted?.subAccountsEnabled ?? false);
  const [mainAccount, setMainAccount] = useState<MainAccount | null>(persisted?.mainAccount ?? null);
  const [subAccounts, setSubAccounts] = useState<SubAccount[]>(persisted?.subAccounts ?? []);
  const [currentAccount, setCurrentAccount] = useState<string>(persisted?.currentAccount ?? 'main');

  useEffect(() => {
    saveState('subaccount', { subAccountsEnabled, mainAccount, subAccounts, currentAccount });
  }, [subAccountsEnabled, mainAccount, subAccounts, currentAccount]);

  const enableSubAccounts = (mainAccountData: MainAccount, firstSubAccount: SubAccount) => {
    setMainAccount(mainAccountData);
    setSubAccounts([firstSubAccount]);
    setSubAccountsEnabled(true);
    setCurrentAccount(firstSubAccount.id);
  };

  const addSubAccount = (subAccount: SubAccount) => {
    setSubAccounts((prev) => [...prev, subAccount]);
  };

  const getCurrentAccountName = () => {
    if (currentAccount === 'main') {
      return 'Main Account';
    }
    const account = subAccounts.find((sa) => sa.id === currentAccount);
    return account?.name || 'Main Account';
  };

  // Stable canonical id for the active account. `currentAccount` may be a
  // runtime-generated subaccount id; bridge it to a canonical id via its display
  // name when known, otherwise fall back to the raw id. Visibility/scoping keys
  // off this id, never the name.
  const getCurrentAccountId = () => {
    if (currentAccount === 'main') return 'main';
    return getAccountIdByName(getCurrentAccountName()) ?? currentAccount;
  };

  const isMainAccountView = () => {
    return subAccountsEnabled && currentAccount === 'main';
  };

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
