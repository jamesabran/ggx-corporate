import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import {
  IconLayoutDashboard,
  IconTruck,
  IconSparkles,
  IconUser,
  IconBell,
  IconMenu2,
  IconChevronLeft,
  IconReceiptTax,
} from '@tabler/icons-react';
import { cn } from '../lib/utils';

const bottomNav = [
  { label: 'Home',         href: '/basic',                 icon: IconLayoutDashboard },
  { label: 'Rewards',      href: '/basic/more',            icon: IconSparkles },
  { label: 'Ship',         href: '/basic/deliver',         icon: IconTruck },
  { label: 'Transactions', href: '/dashboard/transactions',icon: IconReceiptTax },
  { label: 'Account',      href: '/basic/account',         icon: IconUser },
];

export function BasicLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === '/basic' || location.pathname === '/basic/';

  const pageTitle = (() => {
    if (location.pathname.startsWith('/basic/more'))    return 'Save & Earn More';
    if (location.pathname.startsWith('/basic/qualify')) return 'Business Benefits';
    if (location.pathname.startsWith('/basic/deliver')) return 'Ship Now';
    if (location.pathname.startsWith('/basic/account')) return 'Account';
    return null;
  })();

  return (
    // Light blue app-shell background matching the GGX mobile app
    <div className="flex flex-col min-h-screen bg-[#EAF2FF]">

      {/* ── Top bar ── */}
      <header className="sticky top-0 z-30 bg-[#EAF2FF] flex items-center justify-between h-14 px-4 flex-shrink-0">

        {/* Left slot */}
        {isHome ? (
          <button
            className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-600 hover:bg-white/60 active:bg-white/80 transition-colors cursor-pointer"
            aria-label="Menu"
          >
            <IconMenu2 className="w-[22px] h-[22px]" />
          </button>
        ) : (
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-600 hover:bg-white/60 active:bg-white/80 transition-colors cursor-pointer"
            aria-label="Back"
          >
            <IconChevronLeft className="w-[22px] h-[22px]" />
          </button>
        )}

        {/* Center slot */}
        {isHome ? (
          <img
            src="https://gogoxpress.com/wp-content/uploads/2022/07/gogox-logo.png"
            alt="GoGo Xpress"
            className="h-7 w-auto"
          />
        ) : (
          <p className="text-base font-bold text-gray-900 truncate px-2">{pageTitle}</p>
        )}

        {/* Right slot */}
        <button
          className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-600 hover:bg-white/60 active:bg-white/80 transition-colors cursor-pointer relative"
          aria-label="Notifications"
        >
          <IconBell className="w-[22px] h-[22px]" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500" />
        </button>
      </header>

      {/* ── Page content ── */}
      <main className="flex-1 pb-[72px]">
        <Outlet />
      </main>

      {/* ── Bottom navigation ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 flex items-stretch h-[64px]">
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
                'flex-1 flex flex-col items-center justify-center gap-1 transition-colors',
                isActive ? 'text-blue-600' : 'text-gray-400'
              )}
            >
              <item.icon className={cn('w-[22px] h-[22px] flex-shrink-0', isActive ? 'text-blue-600' : 'text-gray-400')} />
              <span className={cn('text-[11px] font-semibold leading-none', isActive ? 'text-blue-600' : 'text-gray-400')}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
