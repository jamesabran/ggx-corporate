import { createContext, useContext, useState, type ReactNode } from 'react';
import { loadState, saveState, clearState } from '../lib/storage';

// Mock authentication (frontend/demo only). No real auth/session backend.
// The auth user is the single source of truth for role + scoped account id,
// consumed by route guards, nav, and notification visibility.

export type UserRole = 'admin' | 'manager';

export interface AuthUser {
  name: string;
  email: string;
  role: UserRole;
  /** Canonical account id the user is scoped to: 'main' (Admin) or a subaccount id (Manager). */
  accountId: string;
  /** Display name for the scoped account. */
  accountName: string;
}

// Demo users — Admin (parent) and a Manager assigned to one subaccount.
export const DEMO_USERS: Record<string, AuthUser> = {
  'max@email.com':     { name: 'Max Rodriguez', email: 'max@email.com',     role: 'admin',   accountId: 'main',        accountName: 'Main Account' },
  'manager@email.com': { name: 'Rina Lopez',    email: 'manager@email.com', role: 'manager', accountId: 'acme-luzon',  accountName: 'Acme Luzon' },
};

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => loadState<AuthUser | null>('auth', null));

  const login = (u: AuthUser) => {
    setUser(u);
    saveState('auth', u);
  };

  const logout = () => {
    setUser(null);
    clearState('auth');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
