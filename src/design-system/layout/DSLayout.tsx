import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router';
import { IconMenu2, IconSearch, IconX } from '@tabler/icons-react';
import { cn } from '../../app/lib/utils';
import { DS_NAV_GROUPS } from '../nav/DSNavConfig';

function SidebarContent({ pathname, query, onQuery, onNavigate }: {
  pathname: string;
  query: string;
  onQuery: (q: string) => void;
  onNavigate?: () => void;
}) {
  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return DS_NAV_GROUPS;
    return DS_NAV_GROUPS
      .map((g) => ({ ...g, items: g.items.filter((i) => i.label.toLowerCase().includes(q)) }))
      .filter((g) => g.items.length > 0);
  }, [query]);

  return (
    <nav className="h-full overflow-y-auto px-4 py-6">
      {/* Overview link */}
      <div className="mb-4">
        <Link
          to="/design-system"
          onClick={onNavigate}
          className={cn(
            'block rounded-md px-3 py-1.5 text-sm transition-colors',
            pathname === '/design-system'
              ? 'bg-blue-50 font-medium text-[#0088C9]'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
          )}
        >
          Overview
        </Link>
      </div>

      {/* Filter */}
      <div className="relative mb-5">
        <IconSearch className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Filter components…"
          aria-label="Filter components"
          className="h-8 w-full rounded-lg border border-gray-200 bg-white pl-8 pr-7 text-xs text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0088C9]"
        />
        {query && (
          <button
            type="button"
            onClick={() => onQuery('')}
            aria-label="Clear filter"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <IconX className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="space-y-6">
        {filteredGroups.length === 0 && (
          <p className="px-3 text-xs text-gray-400">No matches.</p>
        )}
        {filteredGroups.map((group) => (
          <div key={group.label}>
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const href = `/design-system/${item.path}`;
                const isActive = pathname === href;
                return (
                  <li key={item.path}>
                    <Link
                      to={href}
                      onClick={onNavigate}
                      className={cn(
                        'block rounded-md px-3 py-1.5 text-sm transition-colors',
                        isActive
                          ? 'bg-blue-50 font-medium text-[#0088C9]'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}

export function DSLayout() {
  const { pathname } = useLocation();
  const [query, setQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close mobile nav on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Scroll to top on page navigation
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  // Lock body scroll when mobile nav is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-gray-200 bg-white/90 px-5 backdrop-blur">
        <button
          type="button"
          aria-label="Open navigation"
          className="mr-1 flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 lg:hidden"
          onClick={() => setMobileOpen(true)}
        >
          <IconMenu2 className="h-5 w-5" />
        </button>
        <Link to="/design-system" className="flex items-center gap-2.5">
          <img
            src="https://gogoxpress.com/wp-content/uploads/2022/07/gogox-logo.png"
            alt="GoGo Xpress"
            className="h-7 w-auto"
          />
          <span className="text-[15px] font-medium text-gray-700">Design System</span>
        </Link>
      </header>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-40 lg:hidden"
          onClick={(e) => { if (e.target === overlayRef.current) setMobileOpen(false); }}
        >
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative flex h-full w-72 flex-col bg-white shadow-xl">
            <div className="flex h-14 items-center justify-between border-b border-gray-200 px-4">
              <span className="text-sm font-semibold text-gray-700">Design System</span>
              <button
                type="button"
                aria-label="Close navigation"
                className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100"
                onClick={() => setMobileOpen(false)}
              >
                <IconX className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <SidebarContent
                pathname={pathname}
                query={query}
                onQuery={setQuery}
                onNavigate={() => setMobileOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto flex max-w-6xl gap-0 px-5 lg:gap-10">
        {/* Desktop sidebar */}
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-56 flex-shrink-0 lg:block">
          <SidebarContent
            pathname={pathname}
            query={query}
            onQuery={setQuery}
          />
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1 py-10">
          <Outlet />
          <footer className="mt-16 border-t border-gray-100 pt-6 text-xs text-gray-400">
            GoGo Xpress Design System · Living reference aligned to GGX-SHADCN and production code.
          </footer>
        </main>
      </div>
    </div>
  );
}
