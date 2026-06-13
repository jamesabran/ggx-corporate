import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import {
  IconLayoutDashboard,
  IconTruck,
  IconSparkles,
  IconUser,
  IconBell,
  IconChevronLeft,
} from '@tabler/icons-react';
import { cn } from '../lib/utils';

const bottomNav = [
  { label: 'Home',       href: '/basic',        icon: IconLayoutDashboard },
  { label: 'Deliver',    href: '/basic/deliver', icon: IconTruck },
  { label: 'Save & Earn', href: '/basic/more',   icon: IconSparkles },
  { label: 'Account',    href: '/basic/account', icon: IconUser },
];

export function BasicLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const isRoot = location.pathname === '/basic' || location.pathname === '/basic/';
  const canGoBack = !isRoot;

  const pageTitle = (() => {
    if (location.pathname.startsWith('/basic/more'))    return 'Save & Earn More';
    if (location.pathname.startsWith('/basic/qualify')) return 'Business Upgrade';
    if (location.pathname.startsWith('/basic/deliver')) return 'Ship Now';
    if (location.pathname.startsWith('/basic/account')) return 'Account';
    return null;
  })();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 flex items-center h-14 px-4 gap-3 flex-shrink-0">
        {canGoBack ? (
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 active:bg-gray-200 transition-colors cursor-pointer"
            aria-label="Back"
          >
            <IconChevronLeft className="w-5 h-5" />
          </button>
        ) : (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <img
              src="https://gogoxpress.com/wp-content/uploads/2022/07/gogox-logo.png"
              alt="GoGo Xpress"
              className="h-6 w-auto flex-shrink-0"
            />
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest leading-none">
              Basic
            </span>
          </div>
        )}

        {pageTitle && (
          <p className="flex-1 text-base font-semibold text-gray-900 truncate text-center">
            {pageTitle}
          </p>
        )}

        <div className={cn('flex items-center gap-1 ml-auto', !canGoBack && 'ml-0')}>
          <button
            className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 active:bg-gray-200 transition-colors cursor-pointer relative"
            aria-label="Notifications"
          >
            <IconBell className="w-[18px] h-[18px]" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500" />
          </button>
        </div>
      </header>

      {/* Main content — enough bottom padding for the nav bar */}
      <main className="flex-1 pb-20">
        <Outlet />
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 flex items-stretch h-[60px] safe-area-bottom">
        {bottomNav.map((item) => {
          const isActive =
            item.href === '/basic'
              ? location.pathname === '/basic' || location.pathname === '/basic/'
              : location.pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors',
                isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className={cn('text-[10px] font-medium leading-none', isActive ? 'text-blue-600' : 'text-gray-400')}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
