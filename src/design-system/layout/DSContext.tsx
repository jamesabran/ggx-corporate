import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

interface DarkModeCtx {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const DarkModeContext = createContext<DarkModeCtx>({ darkMode: false, toggleDarkMode: () => {} });

export function DSProvider({ children }: { children: ReactNode }) {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try { return localStorage.getItem('ggx-ds-dark') === 'true'; } catch { return false; }
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    try { localStorage.setItem('ggx-ds-dark', String(darkMode)); } catch {}
  }, [darkMode]);

  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode: () => setDarkMode((d) => !d) }}>
      {children}
    </DarkModeContext.Provider>
  );
}

export const useDSTheme = () => useContext(DarkModeContext);
