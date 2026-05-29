import { createContext, useContext, useState, type ReactNode } from 'react';

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
  isMainAccountView: () => boolean;
}

const SubAccountContext = createContext<SubAccountContextType | undefined>(undefined);

export function SubAccountProvider({ children }: { children: ReactNode }) {
  const [subAccountsEnabled, setSubAccountsEnabled] = useState(false);
  const [mainAccount, setMainAccount] = useState<MainAccount | null>(null);
  const [subAccounts, setSubAccounts] = useState<SubAccount[]>([]);
  const [currentAccount, setCurrentAccount] = useState<string>('main');

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
